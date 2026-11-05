import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from script import SCENES
k=Kokoro("kokoro.onnx","voices.bin")
SR=24000
out=[]; meta=[]; t=0.0
lead=np.zeros(int(SR*0.6),dtype=np.float32); out.append(lead); t+=0.6
for sid,lines in SCENES:
    start=t; lt=[]
    for li,l in enumerate(lines):
        s,sr=k.create(l,voice="bm_george",speed=0.92,lang="en-gb"); assert sr==SR
        s=s.astype(np.float32)
        lt.append([t, t+len(s)/SR, l]); out.append(s); t+=len(s)/SR
        gap=0.55 if li<len(lines)-1 else 1.3
        out.append(np.zeros(int(SR*gap),dtype=np.float32)); t+=gap
    meta.append({"id":sid,"start":start,"end":t,"lines":lt})
    print(sid, round(t-start,1), flush=True)
a=np.concatenate(out); sf.write("voice.wav",a,SR)
json.dump(meta,open("timing.json","w"),indent=1); print("total",t)
