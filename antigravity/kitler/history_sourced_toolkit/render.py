import json, sys, subprocess, time, math
import numpy as np, cv2
from engine import W, H, FPS, post, clamp, smooth
import scenes

meta = json.load(open("timing.json"))
TOTAL = json.load(open("total.json"))["total"]

class SI:
    def __init__(self, m, start, end):
        self.id = m["id"]; self.start = start; self.D = end - start
        self.lines = [(a - start, b - start, txt) for a, b, txt in m["lines"]]
        self.L = [a for a, _, _ in self.lines]
    def at(self, i, phrase):
        a, b, txt = self.lines[i]
        k = txt.find(phrase)
        if k < 0: raise ValueError(f"{self.id}: '{phrase}' not in line {i}")
        return a + (b - a) * k / max(1, len(txt))

SC = []
for i, m in enumerate(meta):
    st = 0.0 if i == 0 else m["start"]
    en = meta[i + 1]["start"] if i + 1 < len(meta) else TOTAL
    SC.append(SI(m, st, en))

XF = 0.5
def frame_at(T, fi):
    i = max(k for k, s in enumerate(SC) if s.start <= T + 1e-9)
    s = SC[i]
    f = scenes.SCENE_FUNCS[s.id](T - s.start, s)
    if i > 0 and T - s.start < XF:
        p = SC[i - 1]
        g = scenes.SCENE_FUNCS[p.id](T - p.start, p)
        a = smooth((T - s.start) / XF)
        f = cv2.addWeighted(g, 1 - a, f, a, 0)
    # global fade in / out
    if T < .6: f = (f.astype(np.float32) * smooth(T / .6)).astype(np.uint8)
    if T > TOTAL - 1.0: f = (f.astype(np.float32) * smooth((TOTAL - T) / 1.0)).astype(np.uint8)
    return post(f, fi)

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "preview":
        for spec in sys.argv[2:]:
            T = float(spec)
            f = frame_at(T, int(T * FPS))
            cv2.imwrite(f"prev_{spec}.jpg", cv2.cvtColor(f, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 80])
    elif mode == "chunks":
        import os
        CH = 480; N = int(TOTAL * FPS)
        w, nw = int(sys.argv[2]), int(sys.argv[3])
        for k in range(w, (N + CH - 1) // CH, nw):
            out = f"chunks/c{k:03d}.mp4"
            if os.path.exists(out): continue
            a, b = k * CH, min(N, (k + 1) * CH)
            tmp = out + ".tmp.mp4"
            p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                                  "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", tmp], stdin=subprocess.PIPE)
            t0 = time.time()
            for fi in range(a, b):
                p.stdin.write(frame_at(fi / FPS, fi).tobytes())
            p.stdin.close(); p.wait(); os.rename(tmp, out)
            print("chunk", k, round(time.time() - t0), flush=True)
    elif mode == "part":
        a, b, out = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                              "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
        t0 = time.time()
        for fi in range(a, b):
            f = frame_at(fi / FPS, fi)
            p.stdin.write(f.tobytes())
            if (fi - a) % 240 == 0: print(out, fi, f"{(time.time() - t0) / max(1, fi - a + 1):.3f}s/f", flush=True)
        p.stdin.close(); p.wait()
        print("done", out, time.time() - t0, flush=True)
