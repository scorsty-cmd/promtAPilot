"""Narration: one Kokoro clip per line, natural varied pauses -> public/vo.wav + src/timeline.json"""
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICE = sys.argv[1] if len(sys.argv) > 1 else "am_michael"
SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
LINES = [
    ("hook",  "Born twenty thousand years ago? This is your life.", 0.45),
    ("ice",   "It's the Ice Age. Your whole world is a few dozen people, and you know every single one.", 0.4),
    ("kids",  "Almost half the kids you grow up with won't make it to adulthood.", 0.5),
    ("learn", "So you learn fast. Fire. Tracking. Stitching furs with a bone needle.", 0.4),
    ("hunt",  "Winter is the boss. You follow the reindeer, or you go hungry.", 0.35),
    ("mammoth","A mammoth? Sometimes. It takes the whole group, and nobody forgets that day.", 0.45),
    ("fire",  "At night, everyone gathers at the fire. Stories are the only books you'll ever have.", 0.45),
    ("old",   "Make it past childhood, and you could live into your sixties, or even seventies.", 0.45),
    ("hand",  "You won't leave a name. Just your hand, outlined in red on a cave wall.", 0.4),
    ("end",   "Hand stencils like that are still there today. Maybe one is yours.", 0.45),
    ("cta",   "Which era should you be born in next?", 0.0),
]
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
SR = 24000
lead = 0.25
chunks, tl, t = [np.zeros(int(lead * SR), np.float32)], [], lead
for key, text, gap in LINES:
    a, sr = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    a = np.asarray(a, np.float32)
    # trim leading/trailing silence
    nz = np.where(np.abs(a) > 0.01)[0]
    a = a[max(0, nz[0] - 240): nz[-1] + 1200]
    d = len(a) / SR
    tl.append(dict(key=key, text=text, start=round(t, 3), end=round(t + d, 3)))
    chunks += [a, np.zeros(int(gap * SR), np.float32)]
    t += d + gap
v = np.concatenate(chunks)
sf.write("public/vo.wav", v, SR)
json.dump(dict(lines=tl, voice_end=round(t, 3)), open("src/timeline.json", "w"), indent=1)
print(VOICE, SPEED, "total", round(t, 2))
for l in tl: print(f"{l['start']:6.2f} {l['end']:6.2f} {l['key']}")
