"""Episode voice builder (kit v3): every line of episodes/<ep>/script.py -> Kokoro TTS (one voice per speaker),
one voice track public/<ep>_voice.wav and src/<ep>/timeline.json with shot/line frame timings and, for every
character line, a per-frame VISEME track (audio-driven: energy + spectral centroid + zero-crossing rate).
usage: python3 make_episode_voice.py ep01_toothache ep01
"""
import json, sys, importlib.util
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

EP, KEY = sys.argv[1], sys.argv[2]
FPS, SR = 30, 24000
spec = importlib.util.spec_from_file_location("script", f"episodes/{EP}/script.py")
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
GAP_LINE, GAP_SHOT = 0.32, 0.18
cache = {}

import os, pickle
CF = f"episodes/{EP}/tts_cache.pkl"
TC = pickle.load(open(CF, "rb")) if os.path.exists(CF) else {}
def tts(sp, text):
    if (sp, text) not in TC: TC[(sp, text)] = _tts(sp, text)
    return TC[(sp, text)]
def _tts(sp, text):
    v, spd = S.VOICES[sp]
    a, sr = k.create(text, voice=v, speed=spd, lang="en-gb" if v[0] == "b" else "en-us")
    a = np.asarray(a, np.float32)
    nz = np.where(np.abs(a) > 0.008)[0]
    a = a[max(0, nz[0] - 240): nz[-1] + 480]
    return a / (np.abs(a).max() + 1e-6) * (0.88 if sp == "N" else 0.92)

def visemes(a):
    """per-frame [viseme, open]: X closed, M lips pressed, A open, E wide, O round, S teeth/fricative"""
    hop = SR // FPS; out = []
    n = int(np.ceil(len(a) / hop))
    rms = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    ref = np.percentile(rms, 92) + 1e-6
    env = np.clip(rms / ref, 0, 1)
    env = np.convolve(env, [0.2, 0.6, 0.2], mode="same")
    for i in range(n):
        seg = a[i * hop:(i + 1) * hop]
        if len(seg) < 64 or env[i] < 0.1:
            # a short dip between two voiced frames = bilabial closure (m/b/p)
            vis = "M" if 0 < i < n - 1 and env[i - 1] > 0.3 and env[i + 1] > 0.3 else "X"
            out.append([vis, 0.0]); continue
        sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
        fr = np.fft.rfftfreq(len(seg), 1 / SR)
        cen = float((sp * fr).sum() / (sp.sum() + 1e-9))
        zcr = float(np.mean(np.abs(np.diff(np.sign(seg)))) / 2)
        if zcr > 0.16 or cen > 3200: vis = "S"
        elif cen < 950: vis = "O"
        elif cen > 1900: vis = "E"
        else: vis = "A"
        out.append([vis, round(float(env[i]), 3)])
    # hold each shape >= 2 frames (no flicker)
    for i in range(1, len(out) - 1):
        if out[i][0] != out[i - 1][0] and out[i][0] != out[i + 1][0] and out[i][0] not in "XM":
            out[i][0] = out[i - 1][0]
    return out

parts, shots, t = [], [], 0.0
for sid, ch, lines in S.SHOTS:
    st = t; L = []
    for li, item in enumerate(lines):
        sp, val = item
        if sp == "PAUSE":
            parts.append(np.zeros(int(val * SR), np.float32)); t += val; continue
        a = tts(sp, val)
        rec = {"sp": sp, "text": val, "start": round(t * FPS), "end": round((t + len(a) / SR) * FPS), "t0": round(t, 3), "t1": round(t + len(a) / SR, 3)}
        if sp != "N": rec["vis"] = visemes(a)
        L.append(rec); parts.append(a); t += len(a) / SR
        nxt = lines[li + 1][0] if li + 1 < len(lines) else None
        if nxt is not None and nxt != "PAUSE":
            parts.append(np.zeros(int(GAP_LINE * SR), np.float32)); t += GAP_LINE
    parts.append(np.zeros(int(GAP_SHOT * SR), np.float32)); t += GAP_SHOT
    # snap shot boundary to a whole frame
    fe = round(t * FPS); pad = fe / FPS - t
    if pad > 0: parts.append(np.zeros(int(pad * SR), np.float32))
    t = fe / FPS
    shots.append({"id": sid, "ch": ch, "start": round(st * FPS), "end": fe, "lines": L})
    print(f"{sid:18s} {fe / FPS - st:5.1f}s  t={t:6.1f}", flush=True)

pickle.dump(TC, open(CF, "wb"))
voice = np.concatenate(parts)
sf.write(f"public/{KEY}_voice.wav", voice, SR)
json.dump({"fps": FPS, "frames": shots[-1]["end"], "shots": shots, "chapters": S.CHAPTERS}, open(f"src/{KEY}/timeline.json", "w"))
print("TOTAL", round(t, 1), "s =", f"{int(t // 60)}:{int(t % 60):02d}")
