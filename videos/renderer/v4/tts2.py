# Kokoro voiceover per sentence with varied natural pauses. Writes vo/NNN.wav per beat, vo/sent.json (sentence offsets
# inside each beat) and timeline.json (beat starts/durations incl. gaps). Usage: python3 tts2.py af_heart 0.97
import sys, json, re, os, random
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from scenes import B
voice, speed = sys.argv[1], float(sys.argv[2])
k = Kokoro('models/kokoro-v1.0.onnx', 'models/voices-v1.0.bin')
os.makedirs('vo', exist_ok=True)
rnd = random.Random(7)
SR = 24000
FIX = {'Fetcherr': 'Fetcher', 'KARE eleven': 'Care eleven', 'Orbitz': 'Orbits', 'Eversight': 'Ever-sight'}
def split(t):
    parts = re.split(r'(?<=[.?!])\s+', t.strip())
    return [p for p in parts if p]
sent_meta = []; durs = []
for i, b in enumerate(B):
    chunks = []; offs = []; pos = 0.0
    ss = split(b['text'])
    for j, s in enumerate(ss):
        spoken = s
        for a, r in FIX.items(): spoken = spoken.replace(a, r)
        x, sr = k.create(spoken, voice=voice, speed=speed, lang='en-us')
        x = np.asarray(x, np.float32)
        # trim leading/trailing silence
        nz = np.where(np.abs(x) > 0.01)[0]
        if len(nz): x = x[max(0, nz[0] - 600): nz[-1] + 1800]
        offs.append([round(pos, 3), round(pos + len(x) / SR, 3), s]); chunks.append(x); pos += len(x) / SR
        if j < len(ss) - 1:
            g = rnd.uniform(0.22, 0.42)
            if s.endswith('?') or s.startswith('Quote'): g += 0.12
            chunks.append(np.zeros(int(g * SR), np.float32)); pos += g
    y = np.concatenate(chunks)
    sf.write(f'vo/{i:03d}.wav', y, SR)
    durs.append(len(y) / SR); sent_meta.append(offs)
    print(i, round(durs[-1], 2), flush=True)
starts = []; t = 0.35
for i, b in enumerate(B):
    starts.append(round(t, 3))
    gap = b.get('pause', rnd.uniform(0.28, 0.5))
    if i + 1 < len(B) and B[i + 1]['section'] != b['section']: gap = max(gap, 0.6)
    t += durs[i] + gap
total = round(t + 1.2, 3)
json.dump(sent_meta, open('vo/sent.json', 'w'))
json.dump(dict(starts=starts, durs=durs, total=total), open('timeline.json', 'w'))
print('TOTAL', total, 'sec =', int(total // 60), 'min', round(total % 60, 1))
