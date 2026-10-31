"""Barber's line with Kokoro + per-frame mouth envelope for lip sync."""
import json
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

FPS = 30
START_FRAME = 92          # when the barber starts speaking in the composition
LINES = [("Open wide, lad.", 0.45), ("This won't hurt...", 0.75), ("much.", 0.0)]
VOICE = "bm_lewis"

k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
parts, subs, t = [], [], 0.0
sr = 24000
for text, pause in LINES:
    audio, sr = k.create(text, voice=VOICE, speed=0.92, lang="en-gb")
    audio = np.asarray(audio, dtype=np.float32)
    # trim silence
    nz = np.where(np.abs(audio) > 0.01)[0]
    audio = audio[max(0, nz[0] - 200): nz[-1] + 400]
    subs.append({"text": text, "start": START_FRAME + round(t * FPS), "end": START_FRAME + round((t + len(audio) / sr) * FPS)})
    parts.append(audio)
    t += len(audio) / sr
    if pause:
        parts.append(np.zeros(int(pause * sr), dtype=np.float32))
        t += pause
voice = np.concatenate(parts)
voice = voice / np.abs(voice).max() * 0.9
sf.write("public/voice_barber.wav", voice, sr)

# envelope per frame -> mouth openness 0..1
hop = sr // FPS
env = []
for i in range(0, len(voice), hop):
    seg = voice[i:i + hop]
    env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0.0)
env = np.array(env)
env = env / (np.percentile(env, 95) + 1e-6)
env = np.clip(env, 0, 1)
# light smoothing + gate so the mouth closes between words
env = np.convolve(env, [0.25, 0.5, 0.25], mode="same")
env[env < 0.12] = 0
json.dump({"start": START_FRAME, "env": [round(x, 3) for x in env], "subs": subs, "seconds": len(voice) / sr},
          open("src/lipsync.json", "w"))
print("voice seconds", round(len(voice) / sr, 2), subs)
