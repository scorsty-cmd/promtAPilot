"""Synthesize an original cinematic score + sound effects, then mix with narration."""
import json, math, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
rng = np.random.default_rng(7)
meta = json.load(open("timing.json"))
VOICE_END = meta[-1]["end"]
TOTAL = VOICE_END + 12.0
N = int(TOTAL * SR)
t_all = np.arange(N) / SR

def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)
def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)

def movavg(x, k):
    c = np.cumsum(np.concatenate([[0.0], x]))
    h = k // 2
    idx = np.arange(len(x))
    a = np.clip(idx - h, 0, len(x)); b = np.clip(idx - h + k, 0, len(x))
    return (c[b] - c[a]) / k

def scene(id_):
    return next(m for m in meta if m["id"] == id_)

# ---------- intensity curve per scene (Unsolved: sparse, minor key, no battle drums) ----------
INT = {"cold_open": .55, "title": .7, "dream": .35, "lane": .5, "colony": .4, "virginia": .35, "code": .45, "armada": .55,
       "return": .6, "storm": .8, "evidence": .45, "theory1": .4, "theory2": .45, "theory3": .55, "verdict": .5, "ending": .55}
PULSE = {"cold_open": 1, "return": 1, "storm": 1, "theory3": 1}
inten = np.full(N, .4); pulse_on = np.zeros(N)
for m in meta:
    a, b = int(m["start"] * SR), int(m["end"] * SR)
    inten[a:b] = INT[m["id"]]; pulse_on[a:b] = PULSE.get(m["id"], 0)
inten[int(VOICE_END * SR):] = .5
k = int(SR * 1.5)
inten = movavg(inten, k); pulse_on = movavg(pulse_on, k)

def mtof(m): return 440 * 2 ** ((m - 69) / 12)
# D aeolian, slow and dark: Dm  Bb  Gm  A | Dm  F  C  A(sus)   (Roanoke 1587 / Unsolved #1)
CH = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 55, 58, 62], [45, 57, 61, 64],
      [50, 57, 62, 65], [41, 53, 57, 60], [48, 55, 60, 64], [45, 57, 62, 64]]
CHORD_LEN = 8.0
PSR = 8000; PN = int(TOTAL * PSR); pt_all = np.arange(PN) / PSR
pad = np.zeros(PN)
nseg = int(np.ceil(TOTAL / CHORD_LEN)) + 1
for i in range(nseg):
    s0 = int(max(0, (i * CHORD_LEN - 1.5)) * PSR); s1 = min(PN, int(((i + 1) * CHORD_LEN + 1.5) * PSR))
    if s0 >= PN - 10: break
    tt = pt_all[s0:s1]; seg = np.zeros(len(tt))
    for note in CH[i % len(CH)]:
        f = mtof(note)
        for det in (-0.1, 0.0, 0.09):
            ff = f * 2 ** (det / 12); ph = rng.uniform(0, 6.28)
            for h in range(1, 6):
                seg += np.sin(2 * np.pi * ff * h * tt + ph * h) / h ** 1.3
    L = len(tt); env = np.ones(L); r = min(int(1.5 * PSR), L // 2)
    env[:r] = np.linspace(0, 1, r) ** 2; env[L - r:] = np.linspace(1, 0, r) ** 2
    pad[s0:s1] += seg * env
pad = sosfilt(butter(4, 700, "low", fs=PSR, output="sos"), pad)
pad = resample_poly(pad, SR, PSR)[:N]
if len(pad) < N: pad = np.pad(pad, (0, N - len(pad)))
pad = pad / np.abs(pad).max()
pad *= 0.7 + 0.3 * np.sin(2 * np.pi * t_all / 13.0)
drone = (np.sin(2 * np.pi * mtof(38) * t_all) + .45 * np.sin(2 * np.pi * mtof(45) * t_all) + .25 * np.sin(2 * np.pi * mtof(26) * t_all)) / 1.7

# heartbeat pulse instead of drums (54 BPM, lub-dub)
def thump(f0=48, d=.45, g=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * (1 + .5 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 11) * g
pulse = np.zeros(N); beat = 60 / 54; LUB, DUB = thump(46, .5, 1.0), thump(52, .4, .6)
for b in range(int(TOTAL / beat) + 1):
    st = int(b * beat * SR)
    for off, smp in ((0, LUB), (int(.28 * SR), DUB)):
        s_ = st + off; e = min(N, s_ + len(smp))
        if s_ < N: pulse[s_:e] += smp[: e - s_]

# ---------- sound effects ----------
sfx = np.zeros(N)
def add(x, at, g=1.0):
    st = int(at * SR)
    if st >= N or st < 0: return
    e = min(N, st + len(x)); sfx[st:e] += x[: e - st] * g
def whoosh(d=1.4):
    n = int(d * SR); tt = np.linspace(0, 1, n); x = rng.standard_normal(n); out = np.zeros(n); chunks = 40
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        fc = 300 + 3000 * np.sin(np.pi * (c + .5) / chunks) ** 2
        out[a:b] = bp(x, fc * .6, min(fc * 1.6, 20000))[a:b]
    return out * np.sin(np.pi * tt) ** 2
def boom(d=3.5):
    n = int(d * SR); tt = np.arange(n) / SR
    f = 42 * (1 + 2 * np.exp(-tt * 9))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.4)
    return x + lp(rng.standard_normal(n), 400) * np.exp(-tt * 3) * .6
def sea(d):
    n = int(d * SR); x = lp(rng.standard_normal(n), 600); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 2) * np.minimum(1, (d - tt) / 2)
    return x * (0.45 + 0.55 * np.sin(2 * np.pi * tt / 7.0) ** 2) * env
def wind(d):
    n = int(d * SR); x = bp(rng.standard_normal(n), 250, 1200); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 2) * np.minimum(1, (d - tt) / 2)
    return x * (0.35 + 0.65 * np.sin(2 * np.pi * tt / 9.0) ** 2) * env
def rain(d):
    n = int(d * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 3000) * .5 + bp(rng.standard_normal(n), 400, 1500) * .5
    return x * np.minimum(1, tt / 1.5) * np.minimum(1, (d - tt) / 1.5)
def rustle(d=.7):
    n = int(d * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 1800) * (np.abs(np.sin(2 * np.pi * tt * 9)) ** 3)
    return x * np.sin(np.pi * tt / d) * .5
def trumpet(notes=(67, 72, 76, 72, 79), dur=.38):
    out = []
    for i, nt in enumerate(notes):
        d = dur * (2 if i == len(notes) - 1 else 1); n = int(d * SR); tt = np.arange(n) / SR; f = mtof(nt)
        ph = 2 * np.pi * f * tt * (1 + .003 * np.sin(2 * np.pi * 5.5 * tt))
        x = sum(np.sin(ph * h) * (.9 ** h) for h in range(1, 14))
        env = np.minimum(1, tt / .04) * np.minimum(1, (d - tt) / .08)
        out.append(lp(x * env, 3500) / 4)
    return np.concatenate(out)
def scratch(d=.35):
    """knife cutting wood: rough filtered noise strokes"""
    n = int(d * SR); tt = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 900, 4200) * (np.abs(np.sin(2 * np.pi * tt * 14)) ** 2) * np.sin(np.pi * tt / d)
    return x
def thud(d=.5):
    n = int(d * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 18) + lp(rng.standard_normal(n), 900) * np.exp(-tt * 30) * .5)
def pin(d=.12):
    n = int(d * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 3000) * np.exp(-tt * 60) * .6 + np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 50) * .2
def owl():
    out = []
    for d, f0 in ((.35, 420), (.18, 0), (.55, 400), (.12, 0), (.4, 390)):
        n = int(d * SR); tt = np.arange(n) / SR
        out.append(np.zeros(n) if f0 == 0 else np.sin(2 * np.pi * f0 * tt * (1 - .04 * tt / d)) * np.sin(np.pi * tt / d) ** 1.5)
    return lp(np.concatenate(out), 1200) * .5
def bell(f, d=3.0):
    n = int(d * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * tt) + .4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 3) + .2 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 6)
    return x * np.exp(-tt * 1.6) * np.minimum(1, tt / .005)
def pluck(f, d=1.6):
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(0, n, p):
        out[i:i + p] = buf[: min(p, n - i)]; buf = .5 * (buf + np.roll(buf, 1)) * .996
    return lp(out, 2400) * np.exp(-np.arange(n) / SR * 1.8)

def at(sid, li, frac=0.0):
    a_, b_, _ = scene(sid)["lines"][li]; return a_ + (b_ - a_) * frac

# ---- melody layers: music-box bells (mystery) and lute plucks (Elizabethan scenes)
DMIN = [62, 64, 65, 67, 69, 70, 72, 74]
mel = np.zeros(N); _c = {}
def melody(sids, kind, step=(1.0, .5, 1.5, 1.0, 2.0), gain=.5, octave=0):
    for sid in sids:
        s_ = scene(sid); tt0 = s_["start"] + 1.2; k_ = 0
        while tt0 < s_["end"] - 2.0:
            note = DMIN[int(abs(math.sin(k_ * 2.3 + len(sid) * .7)) * len(DMIN))] + octave
            key = (kind, note)
            if key not in _c: _c[key] = bell(mtof(note)) if kind == "bell" else pluck(mtof(note))
            x = _c[key]; st = int(tt0 * SR); e = min(N, st + len(x)); mel[st:e] += x[: e - st] * gain
            tt0 += step[k_ % len(step)]; k_ += 1
melody(("cold_open", "evidence", "verdict", "theory2"), "bell", (1.5, 1.5, 3.0, 1.0, 2.0), .22, 12)
melody(("dream", "colony", "virginia"), "pluck", (.75, .75, 1.5, .5, 1.0), .45, -12)

for m in meta:  # transition whooshes
    add(whoosh(1.4), max(0, m["start"] - 0.8), .3)
# cold open: night sea, wind, owl, trumpet, reveal
co = scene("cold_open")
add(sea(at("cold_open", 4, 0) + 1), 0, .35)
add(wind(co["end"] + 2), 0, .22)
add(owl(), at("cold_open", 1, .5), .25)
add(trumpet(), at("cold_open", 2, .38), .35)
add(boom(), at("cold_open", 3, 0), .6)          # No one answers
add(boom(), at("cold_open", 5, .1), .45)
for k in range(8): add(scratch(), at("cold_open", 6, 0) - .2 + k * .16, .35)
add(boom(), at("cold_open", 6, .05), .8)        # CROATOAN
add(boom(), scene("title")["start"] - .1, .8)
add(thud(), scene("title")["start"] + 1.4, .9)  # UNSOLVED stamp
# history scenes
add(sea(scene("dream")["end"] - scene("dream")["start"]), scene("dream")["start"], .12)
add(boom(), at("lane", 2, .45), .55)            # Wingina killed
add(sea(at("colony", 3, 0) - scene("colony")["start"] + 6), scene("colony")["start"], .12)
add(boom(), at("colony", 4, .3), .4)            # George Howe
add(bell(mtof(74)), at("virginia", 1, .3), .25)
for k in range(5): add(scratch(), at("code", 0, .5) + k * .18, .3)
for k in range(3): add(scratch(), at("code", 1, .5) + k * .2, .35)
add(boom(), at("armada", 0, .5), .45)
add(boom(), at("armada", 1, .55), .5)           # attacked at sea
for k, fr in enumerate((.35, .55, .75)): add(thud(), at("armada", 2, fr), .4)
# return: surf, drowning, carvings
r_ = scene("return")
add(sea(at("return", 2, 0) - r_["start"] + 2), r_["start"], .4)
add(boom(), at("return", 1, .3), .55)
for k in range(3): add(scratch(), at("return", 2, .75) + k * .3, .4)
add(wind(r_["end"] - at("return", 3, 0)), at("return", 3, 0), .18)
for k in range(9): add(scratch(), at("return", 4, .85) + k * .17, .35)
add(boom(), at("return", 5, 0), .7)
add(rustle(), at("return", 6, 0), .4)
s_ = scene("storm")
add(rain(s_["end"] - s_["start"] + 1), s_["start"], .35)
add(sea(s_["end"] - s_["start"] + 1), s_["start"], .5)
add(boom(4.5), at("storm", 0, .15), .9); add(boom(4.5), at("storm", 0, .55), .7)
for dt_, g_ in ((3.2, .55), (8.5, .45)): add(boom(4.0), s_["start"] + dt_, g_)   # thunder for v5 lightning bolts
# evidence board + theories
for li in range(1, 5): add(pin(), at("evidence", li, 0) + .1, .7); add(rustle(), at("evidence", li, 0), .25)
for sid, li in (("theory1", 4), ("theory2", 5), ("theory3", 3)): add(thud(), at(sid, li, .05), .7)
for sid in ("theory1", "theory2", "theory3"): add(rustle(), scene(sid)["start"] - .2, .3)
add(boom(), at("theory3", 0, .1), .6)
add(thud(), at("theory3", 4, .6), .8)          # HOAX stamp
add(thud(), at("verdict", 3, .85), .8)         # CASE OPEN stamp
add(wind(scene("ending")["end"] - scene("ending")["start"] + 12), scene("ending")["start"], .2)
add(boom(), at("ending", 1, 0), .6)
REVEALS = [at("cold_open", 3, 0), at("cold_open", 6, 0), at("return", 5, 0), at("verdict", 3, .85)]
# ---------- mix ----------
v, vsr = sf.read("voice.wav")
v = resample_poly(v, SR, vsr)
voice = np.zeros(N); voice[: min(N, len(v))] = v[:N]
# ducking from voice envelope
env = np.abs(voice); w = int(.25 * SR)
env = movavg(env, w); env = np.clip(env / (env.max() * .25 + 1e-9), 0, 1)
duck = 1 - .7 * env          # ~ -10 dB under the voice

# REVEALS: list of times (s) where the music should drop out for ~1.2 s right before a key line ("the army broke")
REVEALS = globals().get("REVEALS", [])
gap = np.ones(N)
for rt in REVEALS:
    a_, b_ = int((rt - 1.2) * SR), int(rt * SR)
    if 0 <= a_ < b_ <= N:
        gap[a_:b_] = np.minimum(gap[a_:b_], np.linspace(1, .08, b_ - a_))
        e_ = min(N, b_ + int(1.5 * SR)); gap[b_:e_] = np.minimum(gap[b_:e_], np.linspace(.08, 1, e_ - b_))

music = (mel * .6 + pad * (.22 + .25 * inten) + drone * .12 * (.5 + inten) + pulse * .35 * pulse_on)
music *= duck * gap
mfade = np.ones(N); fo = int(4 * SR); mfade[-fo:] = np.linspace(1, 0, fo); fi = int(1.5 * SR); mfade[:fi] = np.linspace(0, 1, fi)
mix = voice * 1.0 + music * .55 * mfade + sfx * .5 * duck * mfade
# stereo widen: slight delay on music for right channel
d = int(.012 * SR)
right = mix.copy(); right[d:] = voice[d:] + (music * .55 * mfade + sfx * .5 * duck * mfade)[:-d]
st = np.stack([mix, right], 1)
st = st / np.abs(st).max() * .89
sf.write("mix.wav", st.astype(np.float32), SR)
json.dump({"total": TOTAL, "voice_end": VOICE_END}, open("total.json", "w"))
print("ok", TOTAL)
