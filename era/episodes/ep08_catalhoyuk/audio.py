"""Original score + sound design for 'If You Were Born in Çatalhöyük'. All synthesized here.
Score (NEW for the Neolithic): bone flute, hummed voices (closed-mouth choir), clay-pot drum, frame drum, seed rattles, a low drone;
only pentatonic scales — no metal instruments, no strings (they did not exist yet).
SFX: marsh birds & frogs, sheep & goats, wolf, aurochs bellow & stampede, thrown spears, fire, wind on the plain,
volcano rumble, coughing smoke, feast crowd, gfx whooshes and stamp thumps.
Output: public/mix.wav (~ -14 LUFS), music ducked under dialogue."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json')); FG = json.load(open('src/fights.json'))
TOTAL = tl['voice_end'] + 8
N = int(TOTAL * SR)
rng = np.random.default_rng(6700)
L = tl['lines']; K = {l['key']: l for l in L}
S = lambda k: K[k]['start']; E = lambda k: K[k]['end']
CH = {}
for l in L: CH.setdefault(l['chapter'], l['start'])
order = ['open', 'home', 'food', 'hunt', 'trade', 'life', 'death', 'build', 'end', 'real']
bounds = [(c, (CH[c] - 1.9) if c != 'open' else 0.0, (CH[order[i + 1]] - 1.9) if i + 1 < len(order) else TOTAL) for i, c in enumerate(order)]

def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, min(hi, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def fade_env(n, fi, fo):
    e = np.ones(n); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[n - b:] = np.minimum(e[n - b:], np.linspace(1, 0, b))
    return e
music = np.zeros(N); sfx = np.zeros(N)
def add(buf, x, at, g=1.0):
    s = int(at * SR)
    if s >= N or len(x) == 0: return
    if s < 0: x = x[-s:]; s = 0
    e = min(N, s + len(x)); buf[s:e] += x[:e - s] * g
def addl(buf, x, at):
    s = int(at * SR); e = min(len(buf), s + len(x)); buf[s:e] += x[:e - s]

# ---------------- instruments ----------------
def choir(notes, dur, g=1.0):  # wordless 'ah' choir: saws through vowel formants
    t = tt(dur); x = np.zeros(len(t))
    for m in notes:
        for det in (-.1, 0, .1):
            f = mtof(m) * 2 ** (det / 12); ph = np.cumsum(f * (1 + .004 * np.sin(2 * np.pi * 5 * t + rng.uniform(0, 6)))) / SR; x += 2 * (ph % 1) - 1
    y = bp(x, 650, 1100) * .9 + bp(x, 1000, 1400) * .5 + bp(x, 2400, 2900) * .25 + lp(x, 400) * .4
    y *= .8 + .2 * np.sin(2 * np.pi * t / 6.7)
    return y / (np.abs(y).max() + 1e-9) * g
_ks = {}
def lyre(m, d=1.6):
    k = (m, d)
    if k not in _ks:
        f = mtof(m); n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
        for i in range(n): out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
        _ks[k] = lp(out, 5000) * fade_env(n, .002, .3)
    return _ks[k]
def aulos(f, d=.5, g=1.0):
    t = tt(d); vib = 1 + .006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .3); x = 0
    for det in (1.0, 1.004): ph = np.cumsum(f * det * vib) / SR; x = x + (2 * (ph % 1) - 1)
    x = bp(x, f * .9, 3200) * .7 + bp(x, 1100, 1700) * .5 + bp(rng.standard_normal(len(t)), 1500, 5000) * .05
    return x * fade_env(len(t), .03, min(.15, d * .3)) * g
def horn(m, d=2.0, g=1.0):  # bronze war horn
    f = mtof(m); t = tt(d); ph = np.cumsum(f * (1 + .01 * np.exp(-t * 4) * np.sin(2 * np.pi * 6 * t))) / SR; saw = 2 * (ph % 1) - 1
    bright = np.minimum(1, t / .25) * (1 - .4 * t / d)
    x = lp(saw, 600) * .7 + bp(saw, 900, 2400) * .4 * bright
    return x * fade_env(len(t), .12, .5) * g
def drum(g=1.0, f0=70):
    t = tt(.9); return (np.sin(2 * np.pi * f0 * (1 + .5 * np.exp(-t * 25)) * t) * np.exp(-t * 5) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 28) * .6) * g
def frame(g=1.0):
    t = tt(.3); return (bp(rng.standard_normal(len(t)), 300, 3000) * np.exp(-t * 30) + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 20) * .4) * g
def boom(g=1.0):
    t = tt(2.0); return (np.sin(2 * np.pi * 42 * (1 + .6 * np.exp(-t * 15)) * t) * np.exp(-t * 2) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 6) * .5) * g
def drone(d, f=55):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t * (1 + .002 * k)) / k for k in (1, 2, 3, 5))
    return lp(x, 380) * (.7 + .3 * np.sin(2 * np.pi * t / 8)) * fade_env(len(t), 2, 2)

def flute(m, d=.6, g=1.0):  # bone flute: breathy sine with a soft attack
    t = tt(d); f = mtof(m); vib = 1 + .008 * np.sin(2 * np.pi * 4.6 * t) * np.minimum(1, t / .4)
    x = np.sin(2 * np.pi * np.cumsum(f * vib) / SR) + .18 * np.sin(4 * np.pi * np.cumsum(f * vib) / SR)
    x += bp(rng.standard_normal(len(t)), f * .8, f * 3) * .22
    return x * fade_env(len(t), .06, min(.25, d * .4)) * g
def hum(notes, dur, g=1.0):  # closed-mouth 'mmm' voices
    t = tt(dur); x = np.zeros(len(t))
    for m in notes:
        for det in (-.08, 0, .08):
            f = mtof(m) * 2 ** (det / 12); ph = np.cumsum(f * (1 + .005 * np.sin(2 * np.pi * 4.8 * t + rng.uniform(0, 6)))) / SR; x += 2 * (ph % 1) - 1
    y = lp(x, 520) * .9 + bp(x, 250, 420) * .5
    y *= .8 + .2 * np.sin(2 * np.pi * t / 7.3)
    return y / (np.abs(y).max() + 1e-9) * g
def pot(g=1.0, f0=95):  # clay pot drum: hollow 'udu' thump with a pitch bend
    t = tt(.6); f = f0 * (1 + .9 * np.exp(-t * 18)); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + lp(rng.standard_normal(len(t)), 500) * np.exp(-t * 40) * .4) * g
def rattle(g=1.0, d=.18):  # seed / shell rattle
    t = tt(d); return bp(rng.standard_normal(len(t)), 3000, 9000) * np.exp(-t * 28) * (.6 + .4 * (rng.random(len(t)) < .3)) * g
PEN = [62, 64, 67, 69, 71, 74, 76]; MPEN = [62, 65, 67, 69, 72, 74, 77]
SEC = {  # chords, gain, bpm, scale, mood
    'open':  ([[38, 50, 57, 62], [41, 53, 60, 65], [38, 50, 57, 64]], .5, 0, MPEN, 'wonder'),
    'home':  ([[38, 50, 57, 62, 66], [43, 55, 62, 67], [40, 52, 59, 64]], .4, 92, PEN, 'warm'),
    'food':  ([[38, 50, 57, 62, 66], [43, 55, 59, 62], [45, 57, 61, 64]], .4, 112, PEN, 'bright'),
    'hunt':  ([[38, 50, 57, 62], [41, 53, 60, 65], [36, 48, 55, 60]], .55, 132, MPEN, 'battle'),
    'trade': ([[38, 50, 57, 62, 66], [43, 55, 62, 67], [45, 57, 64, 69]], .42, 104, PEN, 'bright'),
    'life':  ([[38, 50, 53, 57], [36, 48, 51, 55], [38, 50, 53, 58]], .45, 80, MPEN, 'tense'),
    'death': ([[38, 50, 53, 57], [34, 46, 53, 58], [36, 48, 55, 60]], .45, 0, MPEN, 'sad'),
    'build': ([[38, 50, 57, 62], [43, 55, 62, 67], [45, 57, 64, 69], [38, 50, 57, 64]], .45, 96, PEN, 'warm'),
    'end':   ([[38, 50, 57, 62], [36, 48, 55, 60], [34, 46, 53, 58], [33, 45, 52, 57]], .5, 0, MPEN, 'sad'),
    'real':  ([[38, 50, 57, 62, 66], [43, 55, 62, 67, 71], [45, 57, 64, 69], [38, 50, 57, 64, 69]], .5, 0, PEN, 'wonder'),
}
for c, a, b in bounds:
    chords, g, bpm, scale, mood = SEC[c]
    dur = b - a; step = dur / len(chords)
    for i, ch in enumerate(chords):
        x = hum(ch, step + 2.0, g * (.75 if mood == 'bright' else 1)); x *= fade_env(len(x), .3 if a == 0 and i == 0 else 1.6, 2.0); add(music, x, a + i * step, .42)
    if mood in ('tense', 'sad', 'wonder', 'battle'): add(music, drone(dur + 1, 36.7), a, .35)
    if bpm:
        beat = 60 / bpm; k = 0; t0 = a + 1.0
        while t0 + k * beat / 2 < b - 1.5:
            at = t0 + k * beat / 2; pos = k % 8
            if mood == 'battle':
                if pos in (0, 3, 6): add(music, drum(.9 if pos == 0 else .6, 60), at)
                if pos % 2: add(music, frame(.35), at)
                add(music, rattle(.25), at)
            elif mood in ('warm', 'bright'):
                if pos in (0, 3, 6): add(music, pot(.7 if pos == 0 else .45, 95 if pos == 0 else 140), at)
                if pos in (2, 6) and mood == 'bright': add(music, rattle(.35), at)
                if pos == 4: add(music, frame(.25), at)
            elif mood == 'tense' and pos in (0, 5): add(music, pot(.55, 70), at)
            k += 1
    r = np.random.default_rng(abs(hash(c)) % 1000 + 11)
    motif = [int(v) for v in r.choice(scale, 5)]; at = a + 2.5; n = 0
    while at < b - 3:
        d = .3 if mood in ('battle', 'bright') else .55
        for j, m in enumerate(motif): add(music, flute(m + (0 if mood != 'sad' else -12) + 12 * (mood in ('bright', 'warm')), d * 1.1), at + j * d, .12 if mood == 'battle' else .16)
        n += 1; motif = (motif[1:] + [int(r.choice(scale))]) if n % 2 else motif[::-1]
        at += len(motif) * d + r.uniform(2.5, 5.5)
for c, a, b in bounds[1:]:
    add(music, pot(1.0, 80), a + .05); add(music, boom(.4), a + .05); add(music, rattle(.6, .5), a + .1)
# cold open: three hits on 'no streets / no doors / no windows', then the ladder rattle
for at in (.3, 1.6, 2.7): add(music, pot(1.1, 70), at); add(music, boom(.5), at)
add(music, boom(1.0), S('o9') + .3); add(music, drum(1.0, 55), S('o9') + .3)
for i, m in enumerate([62, 69, 74]): add(music, flute(m, 2.0), S('o9') + .5 + i * .25, .3)
END = tl['voice_end'] + .4
add(music, boom(1.0), END); add(music, pot(1.1, 80), END + .05)
for i, m in enumerate([62, 64, 67, 69, 74]): add(music, flute(m + 12, .6 if i < 4 else 2.4), END + .5 + i * .22, .3)

# ---------------- sound effects ----------------
def crowd(d, cheer=False, laugh=False, yell=False):
    t = tt(d); x = sum(bp(rng.standard_normal(len(t)), f, f * 1.6) * (.6 + .4 * np.sin(2 * np.pi * rng.uniform(.2, .9) * t + rng.uniform(0, 6))) for f in (300, 550, 900, 1500))
    if laugh: x *= .4 + .9 * (np.sin(2 * np.pi * 6 * t) ** 2) * (np.sin(2 * np.pi * .25 * t) ** 2)
    if cheer: x *= .5 + 1.2 * np.exp(-((t - d * .35) / (d * .25)) ** 2)
    if yell: x = x * (.6 + .6 * np.abs(np.sin(2 * np.pi * 1.3 * t)))
    return x * fade_env(len(t), .5, .8)
def waves(d): t = tt(d); return lp(rng.standard_normal(len(t)), 900) * (.35 + .65 * np.sin(2 * np.pi * t / 5.5) ** 2) * fade_env(len(t), 1, 1)
def wind(d, lo=200, hi=900): t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * (.4 + .6 * np.sin(2 * np.pi * t / 6) ** 2) * fade_env(len(t), 1.5, 1.5)
def crackle(d):
    t = tt(d); x = hp(rng.standard_normal(len(t)), 1800) * (rng.random(len(t)) < .004) * 6 + lp(rng.standard_normal(len(t)), 400) * .6
    return x * fade_env(len(t), .4, .8)
def gallop(d, rate=2.4):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .3:
        for o in (0, .07, .16, .22):
            tt_ = tt(.08); addl(out, lp(rng.standard_normal(len(tt_)), 500) * np.exp(-tt_ * 50), k + o)
        k += 1 / rate
    return out * fade_env(len(out), .3, .4)
def rumble(d): t = tt(d); return lp(rng.standard_normal(len(t)), 160) * (.7 + .3 * np.sin(2 * np.pi * 9 * t)) * fade_env(len(t), .3, .5)
def arrow(): t = tt(.5); f = 2600 - 1800 * t / .5; return bp(rng.standard_normal(len(t)), 1500, 6000) * np.sin(np.pi * t / .5) ** 2 * .6 + np.sin(2 * np.pi * np.cumsum(f) / SR) * .08
def volley(d=1.6, n=14):
    out = np.zeros(int(d * SR) + SR)
    for i in range(n): addl(out, arrow(), rng.uniform(0, d))
    return out
def clash():
    t = tt(.8); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (6 + i * 2)) for i, f in enumerate(rng.uniform(900, 3200, 4))) * np.minimum(1, t / .001) + bp(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t * 40)
def thud(): t = tt(.25); return lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 20) + np.sin(2 * np.pi * 80 * t) * np.exp(-t * 18)
def steps(d, rate=1.8):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .2:
        tt_ = tt(.12); addl(out, lp(rng.standard_normal(len(tt_)), 900) * np.exp(-tt_ * 40), k); k += 1 / rate
    return out
def creak(d=1.5):
    t = tt(d); f = 180 + 60 * np.sin(2 * np.pi * .7 * t); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (rng.random(len(t)) < .3) * 1.0
    return bp(x, 150, 1800) * fade_env(len(t), .2, .3)
def gate(): x = lp(creak(2.0), 900); x[:len(boom(.4))] += boom(.4)[:len(x)] * .5; return x
def crickets(d): t = tt(d); return bp(rng.standard_normal(len(t)), 4200, 5600) * (np.sin(2 * np.pi * 28 * t) > .3) * (np.sin(2 * np.pi * .7 * t) > -.2) * fade_env(len(t), 1, 1)
def whoosh(d=1.0):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); c = 20
    for k in range(c):
        a, b = k * n // c, (k + 1) * n // c; fc = 300 + 3000 * np.sin(np.pi * (k + .5) / c) ** 2
        out[a:b] = bp(x, fc * .6, fc * 1.6)[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
def rewind(d=6.0):
    t = tt(d); f = 200 + 2400 * (t / d) ** 1.5; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + bp(rng.standard_normal(len(t)), 800, 6000) * .4
    return x * (.5 + .5 * np.sin(2 * np.pi * 14 * t) ** 2) * fade_env(len(t), .3, .8)
def neigh():
    t = tt(1.2); f = np.interp(t, [0, .2, .5, .9, 1.2], [600, 1100, 900, 700, 400]); saw = 2 * ((np.cumsum(f * (1 + .08 * np.sin(2 * np.pi * 22 * t))) / SR) % 1) - 1
    return bp(saw, 400, 3000) * np.sin(np.pi * t / 1.2) ** .5
def stamp_hit(): t = tt(.35); return lp(rng.standard_normal(len(t)), 700) * np.exp(-t * 22) + np.sin(2 * np.pi * 120 * t) * np.exp(-t * 25)


def chain(): t = tt(.6); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 18) for f in rng.uniform(2500, 6000, 5)) * (rng.random(len(t)) < .4)
def wood(): t = tt(.18); return bp(rng.standard_normal(len(t)), 500, 2500) * np.exp(-t * 45) + np.sin(2 * np.pi * 320 * t) * np.exp(-t * 40) * .6
def flesh(): t = tt(.3); return lp(rng.standard_normal(len(t)), 600) * np.exp(-t * 18) * .8 + np.sin(2 * np.pi * 110 * t) * np.exp(-t * 20)
def snowstorm(d): t = tt(d); return bp(rng.standard_normal(len(t)), 300, 2400) * (.5 + .5 * np.sin(2 * np.pi * t / 4.5) ** 2) * fade_env(len(t), 1, 1)
def march(d, rate=2.0):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .3: tt_ = tt(.15); addl(out, lp(rng.standard_normal(len(tt_)), 400) * np.exp(-tt_ * 30) * 1.4, k); k += 1 / rate
    return out
def fhit(name):
    for k, dt, kind, *_ in FG[name]['hits']:
        at = S(k) + dt
        if kind == 'clash': add(sfx, clash(), at, .55); add(sfx, crowd(1.4, cheer=True), at, .2) if name == 'arena' else None
        elif kind == 'block': add(sfx, thud(), at, .55); add(sfx, wood(), at, .4)
        elif kind == 'wood': add(sfx, wood(), at, .45)
        elif kind == 'flesh': add(sfx, flesh(), at, .6); add(sfx, crowd(2.0, cheer=True), at, .45)
        elif kind == 'thud': add(sfx, thud(), at, .6)
        elif kind == 'whoosh': add(sfx, whoosh(.4), at - .2, .5)
def hall(d): t = tt(d); return crowd(d, laugh=True) * .5 + lp(rng.standard_normal(len(t)), 500) * .1
def splash(d): t = tt(d); return bp(rng.standard_normal(len(t)), 400, 3000) * (.4 + .6 * np.abs(np.sin(2 * np.pi * 1.3 * t))) * fade_env(len(t), .3, .5)
def bleat(f0=None):
    f0 = f0 or rng.uniform(380, 560); t = tt(.9); f = f0 * (1 + .05 * np.sin(2 * np.pi * 26 * t)) * np.interp(t, [0, .2, .9], [1, 1.08, .9])
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1; return (bp(saw, 500, 2600) * .8 + bp(saw, 900, 1300) * .5) * np.sin(np.pi * t / .9) ** .6
def bellow():
    t = tt(2.4); f = np.interp(t, [0, .4, 1.6, 2.4], [70, 95, 85, 55]); saw = 2 * ((np.cumsum(f * (1 + .03 * np.sin(2 * np.pi * 11 * t))) / SR) % 1) - 1
    return (lp(saw, 700) + bp(rng.standard_normal(len(t)), 200, 900) * .3) * np.sin(np.pi * t / 2.4) ** .5
def howl():
    t = tt(2.6); f = np.interp(t, [0, .5, 1.8, 2.6], [380, 620, 600, 360]); return np.sin(2 * np.pi * np.cumsum(f * (1 + .01 * np.sin(2 * np.pi * 5 * t))) / SR) * np.sin(np.pi * t / 2.6) ** .7 * .7
def birds(d):
    out = np.zeros(int(d * SR)); k = .3
    while k < d - .6:
        n = rng.integers(2, 5); f0 = rng.uniform(2600, 4200)
        for j in range(n): t = tt(.09); addl(out, np.sin(2 * np.pi * np.cumsum(f0 * (1 + .3 * t / .09)) / SR) * np.sin(np.pi * t / .09), k + j * .12)
        k += rng.uniform(.8, 2.4)
    return out * .5
def frogs(d):
    out = np.zeros(int(d * SR)); k = .2
    while k < d - .4:
        t = tt(.16); addl(out, bp(np.sign(np.sin(2 * np.pi * 180 * t)) * (np.sin(2 * np.pi * 30 * t) > 0), 300, 1400) * np.sin(np.pi * t / .16), k); k += rng.uniform(.3, 1.1)
    return out * .6
def cough():
    out = np.zeros(int(1.0 * SR))
    for j in range(rng.integers(2, 4)): t = tt(.18); addl(out, bp(rng.standard_normal(len(t)), 300, 2500) * np.exp(-t * 14), j * .26)
    return out
def stampede(d): return gallop(d, 3.4) * 1.4 + rumble(d) * .8
def ladder(d=1.2):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .1: addl(out, wood() * rng.uniform(.5, 1), k); k += rng.uniform(.06, .14)
    return out
def volcano(d): t = tt(d); return lp(rng.standard_normal(len(t)), 90) * 2.0 * fade_env(len(t), .5, 1.5) + lp(rng.standard_normal(len(t)), 300) * (rng.random(len(t)) < .002) * 8
# cold open: dawn birds, the ladder shaking, the roof
add(sfx, birds(S('o4') + 2), 0, .25); add(sfx, wind(S('o5'), 300, 1000), 0, .1)
add(sfx, ladder(S('o4') - S('o2')), S('o2'), .4); add(sfx, steps(1.6, 3.5), S('o4') + .2, .3)
add(sfx, crackle(S('o9') - S('o5')), S('o5'), .15); add(sfx, birds(10), S('o9'), .2); add(sfx, crowd(10), S('o9'), .1)
# home
add(sfx, crackle(S('f1') - S('h1')), S('h1'), .2); add(sfx, splash(1.0), S('h6') + 1, .08)
add(sfx, stamp_hit(), S('h11b') - .2, .4)
# food
add(sfx, crowd(S('f4') - S('f1')), S('f1'), .1); add(sfx, birds(S('f4') - S('f1')), S('f1'), .2); add(sfx, steps(3, 6), S('f2'), .3)
add(sfx, wind(S('f8') - S('f4'), 300, 1100), S('f4'), .15); add(sfx, frogs(S('f8') - S('f4')), S('f4'), .18); add(sfx, birds(S('f8') - S('f4')), S('f4'), .15)
for k in range(8): add(sfx, bleat(), S('f4') + 1 + k * 3.1 + rng.uniform(0, 1), .3)
add(sfx, splash(2.0), S('f7b') + .4, .3); add(sfx, howl(), S('f7c') - .6, .35)
for k in range(3): add(sfx, thud(), S('f7d') + .9 + k * .3, .3)
add(sfx, crackle(S('f11') - S('f8')), S('f8'), .15); add(sfx, steps(4, 2.4), S('f11'), .2)
# hunt
add(sfx, crowd(S('u6') - S('u1')), S('u1'), .12); add(sfx, wind(S('u12') - S('u7'), 200, 800), S('u7'), .25)
add(sfx, bellow(), S('u7') + .8, .4); add(sfx, bellow(), S('u9') + .2, .5)
add(sfx, stampede(S('u12') - S('u10') - 1), S('u10') + .9, .55); add(sfx, bellow(), S('u10') + .9, .6); fhit('hunt')
add(sfx, crowd(S('u12') - S('u10'), yell=True), S('u10'), .35)
add(sfx, crowd(S('u14') - S('u13'), cheer=True), S('u13'), .35); add(sfx, wind(S('u14') - S('u13'), 300, 900), S('u13'), .15)
add(sfx, hall(S('t1') - S('u14')), S('u14'), .3); add(sfx, crackle(S('t1') - S('u14')), S('u14'), .25)
# trade
add(sfx, crowd(S('t9') - S('t1')), S('t1'), .1); add(sfx, steps(4, 2.2), S('t1'), .2); add(sfx, birds(S('t9') - S('t1')), S('t1'), .12)
add(sfx, volcano(S('t12') - S('t10') + 2), S('t10') - .6, .7); add(sfx, crowd(S('t12') - S('t10'), yell=True), S('t10') + .4, .4); add(sfx, ladder(1.4), S('t11') + 1.2, .4)
add(sfx, crackle(S('t13') - S('t12')), S('t12'), .15)
# life
add(sfx, crowd(S('l2') - S('l1')), S('l1'), .2); add(sfx, bleat(), S('l1') + 3, .2); add(sfx, crackle(S('l4') - S('l2')), S('l2'), .3)
add(sfx, cough(), S('l2') - .9, .5); add(sfx, cough(), E('l3') + .1, .4)
add(sfx, wind(S('l8') - S('l5'), 300, 1100), S('l5'), .12); add(sfx, crowd(S('l8') - S('l5'), yell=True), S('l5'), .08)
add(sfx, wind(S('d1') - S('l10'), 300, 1000), S('l10'), .12); add(sfx, birds(S('d1') - S('l10')), S('l10'), .1)
# death
add(sfx, crackle(S('b1') - S('d1')), S('d1'), .18); add(sfx, wind(S('b1') - S('d1'), 200, 600), S('d1'), .08)
add(sfx, steps(3, 1.5), S('d4') + 1, .15)
# build
add(sfx, crackle(4), S('b1'), .15); add(sfx, wind(S('b5') - S('b2'), 300, 1000), S('b2'), .12)
for k in range(10): add(sfx, thud(), S('b5') + .8 + k * 1.6, .25)
add(sfx, wind(S('z1') - S('b7'), 300, 1100), S('b7'), .1)
# end
add(sfx, wind(S('z3') - S('z1'), 200, 800), S('z1'), .3); add(sfx, steps(S('z2') - S('z1'), 1.5), S('z1'), .2); add(sfx, crackle(S('r1') - S('z3')), S('z3'), .15)
# real
add(sfx, wind(TOTAL - S('r1'), 300, 1200), S('r1'), .1); add(sfx, birds(TOTAL - S('r7')), S('r7'), .15)
for kk in ('h9', 'u6', 't9', 't13', 'l4', 'l8', 'l9', 'd5', 'r2', 'r6'):
    add(sfx, whoosh(.9), S(kk) - .45, .22)
for at in (S('f8') + 4.6, S('f11') + 2.4, S('u12') + 7.4, S('t8') + 1.2, S('d8') + 7, S('r4') + 3.4, S('r2') + 2.0, S('r2') + 4.2):
    add(sfx, stamp_hit(), at, .6)

# ---------------- voice + mix ----------------
v, vsr = sf.read('public/vo.wav')
if v.ndim > 1: v = v.mean(1)
v = resample_poly(v, SR, vsr)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]; voice = hp(voice, 70)
env = np.convolve(np.abs(voice), np.ones(256) / 256, 'same')
idx = np.arange(0, N, 480); env = np.interp(np.arange(N), idx, np.maximum.reduceat(env, idx))
env = np.clip(env / (np.percentile(env, 99) * .3 + 1e-9), 0, 1)
duck = 1 - .6 * np.convolve(env, np.ones(9600) / 9600, 'same')
music /= np.abs(music).max() + 1e-9; sfx /= np.abs(sfx).max() + 1e-9
vn = voice / (np.abs(voice).max() + 1e-9)
bed = music * .34 * duck + sfx * .55 * (.6 + .4 * duck)
end = fade_env(N, .02, 1.5)
d = int(.011 * SR); bedR = np.zeros(N); bedR[d:] = bed[:-d]
st = np.stack([(vn + bed) * end, (vn + bedR) * end], 1)
st = np.tanh(st * 1.1) / np.tanh(1.1); st = st / np.abs(st).max() * .9
sf.write('mix_raw.wav', st.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', 'mix_raw.wav', '-af',
                'alimiter=level_in=1.5:limit=0.8:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/mix.wav'], check=True)
print('ok', round(TOTAL, 2))
