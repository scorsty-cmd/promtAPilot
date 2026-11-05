import sys, json, soundfile as sf, numpy as np
sys.path.insert(0, '.')
from kokoro_onnx import Kokoro
import os
SUF=('_'+os.environ['SHORT']) if os.environ.get('SHORT') else ''
B=__import__('short_scenes'+SUF).B
k = Kokoro('models/kokoro-v1.0.onnx', 'models/voices-v1.0.bin')
voice = sys.argv[1]; speed = float(sys.argv[2]); only = int(sys.argv[3]) if len(sys.argv) > 3 else None
import os; os.makedirs('vos'+SUF, exist_ok=True)
meta = []
for i, b in enumerate(B):
    if only is not None and i >= only: break
    samples, sr = k.create(b['text'].replace('->', 'to'), voice=voice, speed=speed, lang='en-us')
    sf.write(f'vos{SUF}/{i:03d}.wav', samples, sr)
    meta.append(len(samples) / sr); print(i, round(meta[-1], 2), flush=True)
json.dump(meta, open(f'vos{SUF}/durs.json', 'w'))
