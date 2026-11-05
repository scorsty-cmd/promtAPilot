import sys, json, soundfile as sf, numpy as np
sys.path.insert(0, '.')
from kokoro_onnx import Kokoro
from scenes import B
k = Kokoro('models/kokoro-v1.0.onnx', 'models/voices-v1.0.bin')
voice = sys.argv[1]; speed = float(sys.argv[2]); only = int(sys.argv[3]) if len(sys.argv) > 3 else None
import os; os.makedirs('vo', exist_ok=True)
meta = []
for i, b in enumerate(B):
    if only is not None and i >= only: break
    samples, sr = k.create(b['text'].replace('->', 'to'), voice=voice, speed=speed, lang='en-us')
    sf.write(f'vo/{i:03d}.wav', samples, sr)
    meta.append(len(samples) / sr); print(i, round(meta[-1], 2), flush=True)
json.dump(meta, open('vo/durs.json', 'w'))
