"""Synthesize an original cinematic score + sound effects, then mix with narration."""
import json, numpy as np, soundfile as sf
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

# ---------- intensity curve per scene ----------
INT = {"cold_open": .6, "title": .7, "boy": .35, "king": .4, "saladin": .5, "gamble": .55, "ascalon": .65,
       "raid": .75, "breakout": .8, "cross": .55, "battle": 1.0, "camel": .7, "aftermath": .35, "ending": .55}
DRUMS = {"cold_open": 1, "gamble": 1, "ascalon": 1, "raid": 1, "breakout": 1, "battle": 1, "camel": 1, "ending": 1}
inten = np.full(N, .4)
drum_on = np.zeros(N)
for m in meta:
    a, b = int(m["start"] * SR), int(m["end"] * SR)
    inten[a:b] = INT[m["id"]]
    drum_on[a:b] = DRUMS.get(m["id"], 0)
inten[int(VOICE_END * SR):] = .55
k = int(SR * 1.5)
kern = np.ones(k) / k
inten = movavg(inten, k)
drum_on = movavg(drum_on, k)

# ---------- pad ----------
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
# D minor: Dm Bb F C | Dm Gm Bb A
CH = [[50, 57, 62, 65], [46, 53, 58, 62], [41, 53, 57, 60], [48, 55, 60, 64],
      [50, 57, 62, 65], [43, 55, 58, 62], [46, 53, 58, 65], [45, 52, 57, 61]]
CHORD_LEN = 6.0
PSR = 8000; PN = int(TOTAL * PSR); pt_all = np.arange(PN) / PSR
pad = np.zeros(PN)
nseg = int(np.ceil(TOTAL / CHORD_LEN)) + 1
for i in range(nseg):
    s0 = int(max(0, (i * CHORD_LEN - 1.0)) * PSR)
    s1 = min(PN, int(((i + 1) * CHORD_LEN + 1.0) * PSR))
    if s0 >= PN - 10: break
    tt = pt_all[s0:s1]
    seg = np.zeros(len(tt))
    for note in CH[i % len(CH)]:
        f = mtof(note)
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            ph = rng.uniform(0, 6.28)
            for h in range(1, 7):
                seg += np.sin(2 * np.pi * ff * h * tt + ph * h) / h * (0.8 if h > 1 else 1)
    L = len(tt); env = np.ones(L); r = min(int(1.0 * PSR), L // 2)
    env[:r] = np.linspace(0, 1, r) ** 2
    env[L - r:] = np.linspace(1, 0, r) ** 2
    pad[s0:s1] += seg * env
pad = sosfilt(butter(4, 900, "low", fs=PSR, output="sos"), pad)
pad = resample_poly(pad, SR, PSR)[:N]
if len(pad) < N: pad = np.pad(pad, (0, N - len(pad)))
pad = pad / np.abs(pad).max()
# breathing swell
pad *= 0.75 + 0.25 * np.sin(2 * np.pi * t_all / 11.0)

# low drone (D1 + A1)
drone = np.sin(2 * np.pi * mtof(38) * t_all) + .5 * np.sin(2 * np.pi * mtof(45) * t_all) + .3 * np.sin(2 * np.pi * mtof(26) * t_all)
drone = drone / 1.8

# ---------- drums (taiko-like) ----------
def taiko(length=1.2, f0=62, decay=6.0, noise=.25):
    n = int(length * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 1.6 * np.exp(-tt * 28))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt * decay)
    nz = lp(rng.standard_normal(n), 1800) * np.exp(-tt * 30) * noise
    return (body + nz)
BIG = taiko(1.6, 52, 4.0, .35); MID = taiko(.9, 85, 8, .3); SMALL = taiko(.4, 160, 16, .5)
drums = np.zeros(N)
BPM = 84; beat = 60 / BPM
pattern = [(0, BIG, 1), (1, MID, .55), (1.5, SMALL, .4), (2, BIG, .8), (2.75, SMALL, .35), (3, MID, .6), (3.5, MID, .5)]
bar = 4 * beat
nb = int(TOTAL / bar) + 1
for b in range(nb):
    for off, smp, g in pattern:
        st = int((b * bar + off * beat) * SR)
        if st >= N: break
        e = min(N, st + len(smp))
        drums[st:e] += smp[: e - st] * g * (0.9 + 0.2 * rng.random())

# ---------- sound effects ----------
sfx = np.zeros(N)
def add(x, at, g=1.0):
    st = int(at * SR)
    if st >= N: return
    e = min(N, st + len(x)); sfx[st:e] += x[: e - st] * g
def whoosh(d=1.4):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    out = np.zeros(n); chunks = 40
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        fc = 300 + 4000 * np.sin(np.pi * (c + .5) / chunks) ** 2
        out[a:b] = bp(x, fc * .6, min(fc * 1.6, 20000))[a:b]
    return out * np.sin(np.pi * tt) ** 2
def boom(d=3.5):
    n = int(d * SR); tt = np.arange(n) / SR
    f = 45 * (1 + 2 * np.exp(-tt * 9))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.4)
    x += lp(rng.standard_normal(n), 400) * np.exp(-tt * 3) * .6
    return x
def horn(d=3.0, note=38):
    n = int(d * SR); tt = np.arange(n) / SR; f = mtof(note)
    vib = 1 + .004 * np.sin(2 * np.pi * 5 * tt)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(np.sin(ph * h) / h ** .8 for h in range(1, 12))
    env = np.minimum(1, tt / .35) * np.minimum(1, (d - tt) / .8)
    return lp(x * env, 1400) / 3
def sea(d):
    n = int(d * SR); x = lp(rng.standard_normal(n), 700)
    tt = np.arange(n) / SR
    return x * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 6.5) ** 2)
def clash(d=.6):
    n = int(d * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * tt) for f in (2350, 3170, 4420, 5900)) * np.exp(-tt * 9)
    return (hp(rng.standard_normal(n), 2500) * np.exp(-tt * 40) + .3 * x) * .6
def rustle(d=.7):
    """paper / map rustle for map transitions"""
    n = int(d * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 1800) * (np.abs(np.sin(2 * np.pi * tt * 9)) ** 3)
    return x * np.sin(np.pi * tt / d) * .5
def volley(d=1.6, n_arrows=40):
    """arrow volley: many short high whistles + soft thuds"""
    n = int(d * SR); out = np.zeros(n)
    for _ in range(n_arrows):
        st = int(rng.uniform(0, .5) * SR); L = int(rng.uniform(.25, .5) * SR)
        if st + L >= n: continue
        tt = np.arange(L) / SR; f0 = rng.uniform(1800, 3200)
        out[st:st + L] += np.sin(2 * np.pi * np.cumsum(f0 * (1 - .4 * tt / tt[-1])) / SR) * np.sin(np.pi * tt / tt[-1]) * .05
        th = st + L
        if th + 2000 < n: out[th:th + 2000] += lp(rng.standard_normal(2000), 300) * np.exp(-np.arange(2000) / 300) * .3
    return out
def rumble(d):
    """cavalry charge: low hoof rumble"""
    n = int(d * SR); tt = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 140) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * tt * 5.5)))
    env = np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 1.0)
    return x * env * 3
def crowd(d):
    n = int(d * SR); x = bp(rng.standard_normal(n), 250, 1600)
    tt = np.arange(n) / SR
    return x * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * tt * .7)))

for m in meta:  # transition whooshes
    add(whoosh(1.4), max(0, m["start"] - 0.8), .35)
def at(sid, li, frac=0.0):
    a_, b_, _ = scene(sid)["lines"][li]; return a_ + (b_ - a_) * frac
add(boom(), scene("title")["start"] - .1, .9)
add(boom(), at("cold_open", 3, .55), .6)            # 26,000
add(boom(), at("cold_open", 4, .85), .8)            # miracle
add(boom(), at("boy", 3, .8), .6)                   # leprosy
add(boom(), at("saladin", 2, .8), .6)               # surrounded
add(horn(3.5, 41), scene("ascalon")["start"] + .3, .4)
add(horn(4.0, 38), at("cross", 2, .5), .55)         # charge
add(boom(), at("battle", 3, 0) - .1, .9)            # army broke
add(boom(), at("ending", 3, .7), .9)                # Hattin
for sid in ("raid",):
    s_ = scene(sid); add(crowd(s_["end"] - s_["start"]), s_["start"], .05)
for sid in ("battle",):
    s_ = scene(sid)
    add(crowd(s_["end"] - s_["start"]), s_["start"], .10)
    for _ in range(int((s_["end"] - s_["start"]) * 1.3)):
        add(clash(), rng.uniform(s_["start"] + 1, s_["end"] - 1), rng.uniform(.15, .4))
def wind(d):
    n = int(d * SR); x = bp(rng.standard_normal(n), 300, 1400)
    tt = np.arange(n) / SR
    return x * (0.4 + 0.6 * np.sin(2 * np.pi * tt / 9.0) ** 2)
add(wind(scene("cold_open")["end"] + 1), 0, .18)
add(rumble(6), at("cross", 2, .6), .35)                 # charge
add(volley(), at("battle", 0, .3), .5)
for sid in ("king", "saladin", "gamble", "ascalon", "breakout"):
    add(rustle(), scene(sid)["start"] - .3, .25)        # map transitions
REVEALS = [at("battle", 3, 0), at("ending", 3, .7)]
cm = scene("camel"); add(wind(cm["end"] - cm["start"]), cm["start"], .2)
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

music = (pad * (.20 + .25 * inten) + drone * .10 * (.5 + inten) + drums * .22 * drum_on * inten)
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
