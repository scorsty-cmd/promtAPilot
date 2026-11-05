"""Lost Ninth Legion (Unsolved #2). Synthesize an original cinematic score + sound effects, then mix with narration."""
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

# ---------- intensity curve per scene (Unsolved #2: sparse, minor key, no battle drums; Roman brass colour)
INT = {"cold_open": .55, "title": .7, "invasion": .5, "york": .55, "lastseen": .4, "silence": .5, "evidence": .45,
       "theory1": .55, "theory2": .5, "theory3": .6, "theory4": .4, "verdict": .5, "ending": .55}
PULSE = {"cold_open": 1, "invasion": 1, "york": 1, "theory1": 1, "theory3": 1}
inten = np.full(N, .4); pulse_on = np.zeros(N)
for m in meta:
    a, b = int(m["start"] * SR), int(m["end"] * SR)
    inten[a:b] = INT[m["id"]]; pulse_on[a:b] = PULSE.get(m["id"], 0)
inten[int(VOICE_END * SR):] = .5
k = int(SR * 1.5)
inten = movavg(inten, k); pulse_on = movavg(pulse_on, k)

def mtof(m): return 440 * 2 ** ((m - 69) / 12)
# A aeolian with a Phrygian-dominant turn (E major): Am  F  C  G | Am  Dm  E(sus)  E   (Lost Ninth Legion / Unsolved #2)
CH = [[45, 52, 57, 60], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62],
      [45, 52, 57, 60], [38, 53, 57, 62], [40, 52, 57, 59], [40, 52, 56, 59]]
CHORD_LEN = 9.0
PSR = 8000; PN = int(TOTAL * PSR); pt_all = np.arange(PN) / PSR
pad = np.zeros(PN)
nseg = int(np.ceil(TOTAL / CHORD_LEN)) + 1
for i in range(nseg):
    s0 = int(max(0, (i * CHORD_LEN - 1.5)) * PSR); s1 = min(PN, int(((i + 1) * CHORD_LEN + 1.5) * PSR))
    if s0 >= PN - 10: break
    tt = pt_all[s0:s1]; seg = np.zeros(len(tt))
    for note in CH[i % len(CH)]:
        f = mtof(note)
        for det in (-0.08, 0.0, 0.07):
            ff = f * 2 ** (det / 12); ph = rng.uniform(0, 6.28)
            for h in range(1, 7):
                seg += np.sin(2 * np.pi * ff * h * tt + ph * h) / h ** 1.15   # brassier: more upper harmonics
    L = len(tt); env = np.ones(L); r = min(int(1.5 * PSR), L // 2)
    env[:r] = np.linspace(0, 1, r) ** 2; env[L - r:] = np.linspace(1, 0, r) ** 2
    pad[s0:s1] += seg * env
pad = sosfilt(butter(4, 650, "low", fs=PSR, output="sos"), pad)
pad = resample_poly(pad, SR, PSR)[:N]
if len(pad) < N: pad = np.pad(pad, (0, N - len(pad)))
pad = pad / np.abs(pad).max()
pad *= 0.7 + 0.3 * np.sin(2 * np.pi * t_all / 13.0)
drone = (np.sin(2 * np.pi * mtof(33) * t_all) + .45 * np.sin(2 * np.pi * mtof(40) * t_all) + .25 * np.sin(2 * np.pi * mtof(21) * t_all)) / 1.7

# slow war-drum-free pulse: muffled heartbeat, 50 BPM
def thump(f0=48, d=.45, g=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * (1 + .5 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 11) * g
pulse = np.zeros(N); beat = 60 / 50; LUB, DUB = thump(44, .5, 1.0), thump(50, .4, .6)
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

# ---- melody layers: music-box bells (mystery) and lyre plucks (Roman scenes)
AMIN = [57, 59, 60, 62, 64, 65, 67, 69]
mel = np.zeros(N); _c = {}
def melody(sids, kind, step=(1.0, .5, 1.5, 1.0, 2.0), gain=.5, octave=0):
    for sid in sids:
        s_ = scene(sid); tt0 = s_["start"] + 1.2; k_ = 0
        while tt0 < s_["end"] - 2.0:
            note = AMIN[int(abs(math.sin(k_ * 2.3 + len(sid) * .7)) * len(AMIN))] + octave
            key = (kind, note)
            if key not in _c: _c[key] = bell(mtof(note)) if kind == "bell" else pluck(mtof(note))
            x = _c[key]; st = int(tt0 * SR); e = min(N, st + len(x)); mel[st:e] += x[: e - st] * gain
            tt0 += step[k_ % len(step)]; k_ += 1
melody(("cold_open", "evidence", "verdict", "theory2", "lastseen"), "bell", (1.5, 1.5, 3.0, 1.0, 2.0), .2, 12)
melody(("invasion", "york", "silence", "theory4"), "pluck", (.75, .75, 1.5, .5, 1.0), .4, -12)

def tink(d=.25):
    """chisel on stone: metallic tick + grit."""
    n = int(d * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2300 * tt) * .5 + np.sin(2 * np.pi * 3170 * tt) * .35) * np.exp(-tt * 45) + hp(rng.standard_normal(n), 2500) * np.exp(-tt * 70) * .5
def march(d, rate=1.9):
    """distant marching feet: soft low thumps + gravel crunch."""
    n = int(d * SR); out = np.zeros(n); st_ = thump(70, .18, .8); gr = bp(rng.standard_normal(int(.12 * SR)), 600, 2400) * np.exp(-np.arange(int(.12 * SR)) / SR * 30) * .4
    k_ = 0
    while True:
        p_ = int(k_ / rate * SR)
        if p_ >= n: break
        for x in (st_, gr):
            e = min(n, p_ + len(x)); out[p_:e] += x[: e - p_]
        k_ += 1
    tt = np.arange(n) / SR
    return lp(out, 1800) * np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 1.0)
def crackle(d):
    n = int(d * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 2000) * (rng.random(n) < .004) * 6 + bp(rng.standard_normal(n), 200, 900) * .3
    return x * np.minimum(1, tt / .8) * np.minimum(1, (d - tt) / .8)
def cornu(notes=(45, 52, 57, 52, 45), dur=.55):
    return trumpet(notes, dur) * .9
def swish(d=.5):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    return bp(rng.standard_normal(n), 1500, 7000) * np.sin(np.pi * tt) ** 3 * .6

for m in meta:  # transition whooshes
    add(whoosh(1.4), max(0, m["start"] - 0.8), .28)
# cold open: dusk wind, chisel, the list, the reveal
co = scene("cold_open")
add(wind(co["end"] + 2), 0, .22)
for k in range(14): add(tink(), at("cold_open", 1, .25) + k * .13, .35)
for k in range(8): add(tink(), at("cold_open", 1, .72) + k * .12, .4)
add(boom(), at("cold_open", 1, .78), .45)
add(march(at("cold_open", 3, 0) - at("cold_open", 2, 0)), at("cold_open", 2, 0), .35)
add(boom(), at("cold_open", 3, .05), .55)                 # last time recorded
add(bell(mtof(69)), at("cold_open", 4, .1), .25)
add(boom(), at("cold_open", 5, 0), .8)                    # NOT ON IT
for li_f in (.0, .2, .45): add(thud(), at("cold_open", 6, li_f) + .5, .55)
for k in range(4): add(pin(), at("cold_open", 7, 0) + .2 + k * .45, .6)
add(thud(), at("cold_open", 7, .55), .6)                  # CASE 02 stamp
add(boom(), scene("title")["start"] - .1, .8)
add(thud(), scene("title")["start"] + 1.4, .9)           # UNSOLVED stamp
# invasion
add(rustle(), scene("invasion")["start"], .35)
add(march(7.0), at("invasion", 1, 0), .35)
add(crackle(9.0), at("invasion", 2, .7), .45)
add(cornu(), at("invasion", 3, .05), .3)
add(march(4.5), at("invasion", 3, 0), .3)
add(boom(), at("invasion", 4, .3), .6)
add(crowd(3.5) if "crowd" in globals() else wind(3.5), at("invasion", 4, .3), .3)
add(boom(), at("invasion", 4, .5), .5)
add(rustle(), at("invasion", 5, 0), .35)
# york
add(march(8.0), at("york", 0, .05), .35)
add(march(7.0), at("york", 1, .05), .3)
add(owl(), at("york", 2, .1), .25)
add(wind(at("york", 4, 0) - at("york", 2, 0)), at("york", 2, 0), .25)
add(boom(), at("york", 3, .05), .7)                       # camp breached
add(cornu((52, 57, 64, 57, 64), .45), at("york", 3, .45), .4)   # Agricola arrives
# last seen
add(thud(), at("lastseen", 0, .45), .8)
add(rustle(), at("lastseen", 1, 0), .3)
for k in range(30): add(tink(), at("lastseen", 2, 0) - .2 + k * .075, .25)
add(boom(), at("lastseen", 4, .1), .45)
# silence
add(boom(), at("silence", 0, .75), .45)
add(rustle(), at("silence", 2, .2), .4)
add(cornu((45, 48, 52, 57), .6), at("silence", 4, .05), .25)
add(march(5.0), at("silence", 4, .1), .3)
add(boom(), at("silence", 5, .6), .7)
# evidence board
for li in range(1, 5): add(pin(), at("evidence", li, 0) + .1, .7); add(rustle(), at("evidence", li, 0), .25)
add(boom(), at("evidence", 5, .1), .4)
# theories
add(wind(at("theory1", 1, 0) - scene("theory1")["start"] + 1), scene("theory1")["start"], .35)
add(boom(), at("theory1", 0, .6), .5)
add(thud(), at("theory1", 4, .55), .7)                    # DOUBTFUL
add(march(4.0), scene("theory2")["start"] + .5, .3)
add(crackle(8.0), at("theory2", 1, .2), .4)
add(thud(), at("theory2", 4, .7), .7)                     # NO PROOF
for k in range(3): add(thud(), at("theory2", 3, [.4, .55, .7][k]) + .3, .45)
for k in range(10): add(swish(), at("theory3", 2, .1) + k * .55, .35)
add(boom(), at("theory3", 2, .35), .6)
add(thud(), at("theory3", 4, .75), .7)                    # NO NAME
for k in range(20): add(tink(), at("theory4", 1, .55) + k * .08, .35)
add(thud(), at("theory4", 3, .6), .8)                     # NOT A STANDARD
add(thud(), at("verdict", 3, .85), .8)                    # CASE OPEN
add(sea(scene("ending")["end"] - scene("ending")["start"] + 12), scene("ending")["start"], .3)
add(wind(scene("ending")["end"] - scene("ending")["start"] + 12), scene("ending")["start"], .2)
add(bell(mtof(64)), at("ending", 1, 0), .3)
add(boom(), at("ending", 1, 0), .5)
REVEALS = [at("cold_open", 3, 0), at("cold_open", 5, 0), at("silence", 5, .55), at("verdict", 3, .85)]
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
sf.write("mix_raw.wav", st.astype(np.float32), SR)
# v6 mastering: the raw mix measured -33 LUFS (peaks from booms) -> limiter + loudnorm to -16 LUFS / -1.5 dBTP
import subprocess
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", "mix_raw.wav", "-af",
                "alimiter=level_in=6:limit=0.7:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "mix.wav"], check=True)
json.dump({"total": TOTAL, "voice_end": VOICE_END}, open("total.json", "w"))
print("ok", TOTAL)
