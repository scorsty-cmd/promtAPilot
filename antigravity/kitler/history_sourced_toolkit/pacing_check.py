"""Retention QC: find stretches where the picture barely changes.
usage: python3 pacing_check.py master.mp4   (or any chunk)
Prints windows longer than MAX_STATIC seconds with no 'small' motion, and windows longer than MAX_NOMAJOR
seconds without a 'major' visual change (new shot / big zoom / big element). Also writes pacing.json."""
import sys, json, subprocess, numpy as np
MAX_STATIC, MAX_NOMAJOR = 4.0, 12.0
SMALL, MAJOR = 0.6, 6.0      # mean abs diff (0..255) between samples 0.5 s apart / 2 s apart
src = sys.argv[1]; fps = 2; w, h = 160, 90
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vf", f"fps={fps},scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
d1 = np.abs(fr[1:] - fr[:-1]).mean((1, 2))              # 0.5 s
d4 = np.abs(fr[4:] - fr[:-4]).mean((1, 2))              # 2 s
def runs(mask, minlen):
    out, s = [], None
    for i, m in enumerate(list(mask) + [False]):
        if m and s is None: s = i
        if not m and s is not None:
            if (i - s) / fps >= minlen: out.append((s / fps, i / fps))
            s = None
    return out
static = runs(d1 < SMALL, MAX_STATIC)
nomajor = runs(d4 < MAJOR, MAX_NOMAJOR)
meta = None
try: meta = json.load(open("timing.json"))
except Exception: pass
def sid(t):
    if not meta: return ""
    if t < meta[0]["end"]: return meta[0]["id"]
    for m in meta:
        if m["start"] <= t < m["end"]: return m["id"]
    return "end"
print(f"samples {len(fr)}  ({len(fr) / fps:.0f}s)")
print("STATIC (no small motion >= %.0fs):" % MAX_STATIC)
for a, b in static: print(f"  {a:7.1f}-{b:7.1f}s  {b - a:4.1f}s  scene={sid(a)}")
print("NO MAJOR CHANGE (>= %.0fs):" % MAX_NOMAJOR)
for a, b in nomajor: print(f"  {a:7.1f}-{b:7.1f}s  {b - a:4.1f}s  scene={sid(a)}")
json.dump({"static": static, "nomajor": nomajor}, open("pacing.json", "w"))
