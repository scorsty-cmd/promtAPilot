"""usage: python3 prevs.py scene_id [n]  -> renders n evenly spaced preview frames of a scene + contact sheet sheet_<id>.jpg"""
import sys, json, time, numpy as np, cv2
import render
sid = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 6
s = next(x for x in render.SC if x.id == sid)
ts = [s.start + s.D * (k + .5) / n for k in range(n)] if len(sys.argv) < 4 else [s.start + float(v) for v in sys.argv[3].split(",")]
ims = []
for T in ts:
    t0 = time.time(); f = render.frame_at(T, int(T * 24)); dt = time.time() - t0
    im = cv2.resize(cv2.cvtColor(f, cv2.COLOR_RGB2BGR), (960, 540))
    cv2.putText(im, f"{sid} {T - s.start:.1f}s ({dt:.2f}s)", (10, 34), 0, 1.0, (0, 255, 255), 2)
    ims.append(im)
while len(ims) % 2: ims.append(np.zeros_like(ims[0]))
rows = [np.hstack(ims[i:i + 2]) for i in range(0, len(ims), 2)]
cv2.imwrite(f"sheet_{sid}.jpg", np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 72])
print("ok", sid, [round(t - s.start, 1) for t in ts])
