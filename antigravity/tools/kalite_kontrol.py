"""Automatic quality gate for every video before it may be published.

usage:
  python antigravity/tools/kalite_kontrol.py <video.mp4> --profile long|short|reel|operis [--out <folder>]

Writes into <out> (default: next to the video, folder "<name>_QC"):
  contact_sheet.jpg   16 frames spread over the video (frame 0 first) - the agent MUST look at it
  first_frames.jpg    frames at 0.0 / 0.5 / 1.0 / 2.0 / 3.0 s - the hook must be readable at 0.0 s
  qc_report.json      all measurements
  QC_RAPOR.txt        short Turkish summary for the owner
Exit code 0 = all hard checks passed, 1 = at least one failed (do NOT publish, fix and re-render).

Needs ffmpeg + ffprobe on PATH, numpy, opencv-python-headless.
"""
import argparse, json, os, re, subprocess, sys
import numpy as np, cv2

PROFILES = {
    #          w     h    min_s  max_s  lufs_lo lufs_hi max_static max_nomajor
    "long":   (1920, 1080, 480,  600,   -16.5,  -12.5,  4.0,       15.0),
    "short":  (1080, 1920, 15,   58,    -16.5,  -12.5,  3.0,       8.0),
    "reel":   (1080, 1920, 20,   32,    -16.5,  -12.5,  2.0,       6.0),
    "operis": (1080, 1920, 15,   20.5,  -18.0,  -12.5,  2.5,       6.0),
}

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def probe(path):
    out = run(["ffprobe", "-v", "error", "-show_entries",
               "stream=codec_type,width,height,r_frame_rate:format=duration", "-of", "json", path]).stdout
    j = json.loads(out)
    v = next((s for s in j["streams"] if s["codec_type"] == "video"), None)
    a = any(s["codec_type"] == "audio" for s in j["streams"])
    num, den = (v["r_frame_rate"].split("/") + ["1"])[:2]
    return dict(w=v["width"], h=v["height"], fps=float(num) / float(den or 1),
                dur=float(j["format"]["duration"]), audio=a)

def loudness(path):
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true",
               "-f", "null", "-"]).stderr
    tail = err[err.rfind("Summary:"):]
    i = re.search(r"I:\s*(-?[\d.]+) LUFS", tail)
    p = re.search(r"Peak:\s*(-?[\d.]+) dBFS", tail)
    return (float(i.group(1)) if i else None, float(p.group(1)) if p else None)

def gray_frames(path, fps=2, w=160, h=90):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={w}:{h}",
                          "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)

def runs(mask, fps, minlen):
    out, s = [], None
    for i, m in enumerate(list(mask) + [False]):
        if m and s is None: s = i
        if not m and s is not None:
            if (i - s) / fps >= minlen: out.append((round(s / fps, 1), round(i / fps, 1)))
            s = None
    return out

def grab(path, t, w):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", path, "-frames:v", "1",
                          "-vf", f"scale={w}:-2", "-f", "image2pipe", "-vcodec", "png", "-"],
                         capture_output=True).stdout
    im = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    return im

def sheet(path, times, w, cols, out):
    ims = []
    for t in times:
        im = grab(path, t, w)
        if im is None: continue
        cv2.rectangle(im, (0, 0), (150, 40), (0, 0, 0), -1)
        cv2.putText(im, f"{t:5.1f}s", (8, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
        ims.append(im)
    if not ims: return
    h0, w0 = ims[0].shape[:2]
    ims = [cv2.resize(i, (w0, h0)) for i in ims]
    while len(ims) % cols: ims.append(np.zeros_like(ims[0]))
    rows = [np.hstack(ims[i:i + cols]) for i in range(0, len(ims), cols)]
    cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 80])

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("--profile", required=True, choices=PROFILES)
    ap.add_argument("--out")
    a = ap.parse_args()
    W, H, dmin, dmax, llo, lhi, max_static, max_nomajor = PROFILES[a.profile]
    out = a.out or os.path.splitext(a.video)[0] + "_QC"
    os.makedirs(out, exist_ok=True)

    p = probe(a.video)
    lufs, peak = loudness(a.video) if p["audio"] else (None, None)
    fr = gray_frames(a.video)
    d1 = np.abs(fr[1:] - fr[:-1]).mean((1, 2)) if len(fr) > 1 else np.array([])
    d4 = np.abs(fr[4:] - fr[:-4]).mean((1, 2)) if len(fr) > 4 else np.array([])
    static = runs(d1 < 0.6, 2, max_static)
    nomajor = runs(d4 < 6.0, 2, max_nomajor)
    black = runs(fr.mean((1, 2)) < 12, 2, 0.5)
    first_dark = bool(len(fr) and fr[0].mean() < 12)

    checks = {
        "resolution": (p["w"], p["h"]) == (W, H),
        "duration": dmin <= p["dur"] <= dmax,
        "has_audio": p["audio"],
        "loudness": lufs is not None and llo <= lufs <= lhi,
        "true_peak": peak is not None and peak <= -0.5,
        "frame0_not_black": not first_dark,
        "no_long_static": len(static) == 0,
        "no_long_without_major_change": len(nomajor) <= (2 if a.profile == "long" else 0),
        "no_black_gaps": len([b for b in black if b[0] > 0.5 and b[1] < p["dur"] - 1]) == 0,
    }
    rep = dict(video=a.video, profile=a.profile, probe=p, lufs=lufs, true_peak_db=peak,
               static_stretches=static, no_major_change=nomajor, black=black, checks=checks,
               passed=all(checks.values()))
    json.dump(rep, open(os.path.join(out, "qc_report.json"), "w"), indent=1)

    vert = H > W
    times = [0.0] + list(np.linspace(1.0, max(1.0, p["dur"] - 0.5), 15))
    sheet(a.video, times, 270 if vert else 480, 8 if vert else 4, os.path.join(out, "contact_sheet.jpg"))
    sheet(a.video, [0.0, 0.5, 1.0, 2.0, 3.0], 360 if vert else 640, 5 if vert else 3,
          os.path.join(out, "first_frames.jpg"))

    tr = {"resolution": "Çözünürlük", "duration": "Süre", "has_audio": "Ses var", "loudness": "Ses seviyesi (LUFS)",
          "true_peak": "Tepe seviye", "frame0_not_black": "İlk kare dolu", "no_long_static": "Donuk bölüm yok",
          "no_long_without_major_change": "Görsel değişim sıklığı", "no_black_gaps": "Siyah boşluk yok"}
    lines = [f"Kalite kontrol: {os.path.basename(a.video)} ({a.profile})",
             f"Süre {p['dur']:.1f} sn · {p['w']}x{p['h']} · {lufs} LUFS · tepe {peak} dB", ""]
    lines += [f"{'✔' if ok else '✘'} {tr[k]}" for k, ok in checks.items()]
    if static: lines.append(f"Donuk bölümler (sn): {static}")
    if nomajor: lines.append(f"Uzun süre büyük değişim olmayan bölümler (sn): {nomajor}")
    lines.append("")
    lines.append("SONUÇ: GEÇTİ" if rep["passed"] else "SONUÇ: KALDI — yayınlanmadı, düzeltilip yeniden render edilmeli")
    open(os.path.join(out, "QC_RAPOR.txt"), "w", encoding="utf-8").write("\n".join(lines))
    print("\n".join(lines)); print("QC folder:", out)
    sys.exit(0 if rep["passed"] else 1)

if __name__ == "__main__":
    main()
