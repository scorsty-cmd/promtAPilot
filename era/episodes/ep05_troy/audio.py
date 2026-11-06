"""Original score + sound design for 'If You Were a Soldier at Troy'. All synthesized here.
Score: war drums, bronze horns, lyre (Karplus-Strong), aulos, wordless choir pad; Phrygian/Dorian colours.
SFX: festival crowd, waves, wind, gallop, chariot rumble, arrows, bronze clashes, war cries (distant), fire, gates, rope & wood creak.
Output: public/mix.wav (~ -14 LUFS), music ducked under dialogue."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json'))
TOTAL = tl['voice_end'] + 8
N = int(TOTAL * SR)
rng = np.random.default_rng(1180)
L = tl['lines']; K = {l['key']: l for l in L}
S = lambda k: K[k]['start']; E = lambda k: K[k]['end']
CH = {}
for l in L: CH.setdefault(l['chapter'], l['start'])
order = ['open', 'home', 'ships', 'siege', 'achilles', 'battle', 'hector', 'horse', 'night', 'real']
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

PHR = [62, 63, 65, 67, 69, 70, 72, 74]; DOR = [62, 64, 65, 67, 69, 71, 72, 74]; HAR = [62, 63, 66, 67, 69, 70, 73, 74]
SEC = {  # chords, gain, bpm, scale, mood
    'open':     ([[38, 50, 57, 62], [36, 48, 55, 63]], .5, 0, PHR, 'mystery'),
    'home':     ([[38, 50, 57, 62, 66], [43, 55, 62, 67], [45, 57, 64, 69]], .45, 96, DOR, 'pastoral'),
    'ships':    ([[38, 50, 57, 62], [34, 46, 53, 58], [36, 48, 55, 60]], .5, 84, PHR, 'omen'),
    'siege':    ([[38, 50, 57, 62, 65], [41, 53, 60, 65], [36, 48, 55, 60]], .4, 0, DOR, 'camp'),
    'achilles': ([[38, 50, 53, 57], [37, 49, 56, 61]], .45, 72, HAR, 'tense'),
    'battle':   ([[38, 50, 57, 62], [36, 48, 55, 60], [34, 46, 53, 58], [33, 45, 52, 57]], .6, 132, PHR, 'battle'),
    'hector':   ([[38, 50, 57, 60], [34, 46, 53, 57], [33, 45, 52, 57], [38, 50, 57, 62]], .45, 0, [62, 65, 67, 69, 72], 'sad'),
    'horse':    ([[38, 50, 57, 63], [39, 51, 58, 63]], .45, 88, HAR, 'tense'),
    'night':    ([[37, 49, 56, 61], [38, 50, 53, 58], [34, 46, 53, 58]], .6, 140, PHR, 'battle'),
    'real':     ([[38, 50, 57, 62, 66], [43, 55, 62, 67, 71], [45, 57, 64, 69], [38, 50, 57, 64, 69]], .5, 0, DOR, 'wonder'),
}
for c, a, b in bounds:
    chords, g, bpm, scale, mood = SEC[c]
    dur = b - a; step = dur / len(chords)
    for i, ch in enumerate(chords):
        x = choir(ch, step + 2.0, g); x *= fade_env(len(x), .3 if a == 0 and i == 0 else 1.6, 2.0); add(music, x, a + i * step, .4)
    if mood in ('mystery', 'tense', 'sad', 'omen'): add(music, drone(dur + 1, 36.7), a, .35)
    if bpm:
        beat = 60 / bpm; k = 0; t0 = a + 1.0
        while t0 + k * beat / 2 < b - 1.5:
            at = t0 + k * beat / 2; pos = k % 8
            if mood == 'battle':
                if pos in (0, 3, 6): add(music, drum(.9 if pos == 0 else .6), at)
                if pos % 2: add(music, frame(.35), at)
            if mood == 'omen' and pos in (0, 4): add(music, drum(.6, 55), at)
            if mood == 'tense' and pos in (0, 1): add(music, drum(.35, 60), at)  # heartbeat
            if mood == 'pastoral' and pos in (0, 3, 5): add(music, lyre(scale[(k // 2) % 4] - 12, .9), at, .4)
            k += 1
    r = np.random.default_rng(abs(hash(c)) % 1000 + 3)
    motif = [int(v) for v in r.choice(scale, 5)]; at = a + 2.5; n = 0
    while at < b - 3:
        d = .34 if mood == 'battle' else .6
        for j, m in enumerate(motif):
            if mood in ('battle', 'omen'): add(music, horn(m - 12, d * 1.6), at + j * d, .14)
            elif mood in ('sad', 'pastoral', 'wonder', 'camp'): add(music, lyre(m, 1.8), at + j * d, .3)
            else: add(music, aulos(mtof(m), d * 1.05), at + j * d, .1)
        n += 1; motif = (motif[1:] + [int(r.choice(scale))]) if n % 2 else motif[::-1]
        at += len(motif) * d + r.uniform(2.5, 5.5)
for c, a, b in bounds[1:]:
    add(music, drum(1.0), a + .05); add(music, boom(.5), a + .05); add(music, horn(50, 1.6), a + .1, .25)
# hook: a single low horn + boom under "this is the last night of Troy", big hit on title
add(music, boom(.9), .25); add(music, horn(38, 3.0), .3, .35)
add(music, boom(1.0), S('o5') + .4); add(music, drum(1.0), S('o5') + .4)
for i, m in enumerate([50, 57, 62]): add(music, horn(m, 2.6), S('o5') + .5 + i * .05, .22)
END = tl['voice_end'] + .4
add(music, boom(1.0), END); add(music, drum(1.1), END + .05)
for i, m in enumerate([62, 66, 69, 74, 78]): add(music, lyre(m, 2.4), END + .5 + i * .18)

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

# --- beds & spots ---
add(sfx, crowd(S('o5'), cheer=False, laugh=True), 0, .3); add(sfx, crackle(S('o5')), 0, .12)
for k in range(10): add(sfx, frame(.6), .4 + k * .45 * (1 + k * .05), .25)
add(sfx, crackle(S('h1') - S('o5')), S('o5'), .45); add(sfx, wind(S('h1') - S('o5')), S('o5'), .25)
add(sfx, rewind(5.0), S('o5') + 5.6, .3)
add(sfx, wind(S('s1') - S('h2'), 300, 1200), S('h2'), .06); add(sfx, neigh(), S('h2') + .4, .25); add(sfx, neigh(), S('h6') + 1.0, .18)
add(sfx, waves(S('w1') - S('s1')), S('s1'), .25); add(sfx, wind(S('s4') - S('s1')), S('s1'), .15)
add(sfx, crowd(S('s6') - S('s5'), yell=True), S('s5'), .3)
add(sfx, volley(1.6, 16), S('s6') + 3.6, .5); add(sfx, waves(S('s8') - S('s6')), S('s6'), .25)
add(sfx, crowd(S('w1') - S('s8'), yell=True), S('s8'), .35); add(sfx, steps(S('w1') - S('s8'), 6), S('s8'), .3)
add(sfx, waves(S('w2') - S('w1')), S('w1'), .2)
add(sfx, crackle(S('w4') - S('w2')), S('w2'), .4); add(sfx, crickets(S('w4') - S('w2')), S('w2'), .06)
add(sfx, wind(S('w8') - S('w4')), S('w4'), .15)
for k in range(5): add(sfx, thud(), S('w9') + .5 + k * 1.6, .3)
add(sfx, steps(1.4, 6), S('a1'), .4); add(sfx, crickets(S('a5') - S('a1')), S('a1'), .06); add(sfx, crackle(S('a5') - S('a1')), S('a1'), .15)
add(sfx, steps(2.0, 2), S('a4') - 1.6, .3)
add(sfx, crackle(S('b1') - S('a5') - 2), S('a5'), .2)
add(sfx, gate(), S('b1') - .3, .5); add(sfx, steps(6, 7), S('b1'), .35); add(sfx, crowd(6, yell=True), S('b1'), .25)
add(sfx, gallop(5.4, 1.2), S('b1b'), .15); add(sfx, crowd(3.0, cheer=True), E('b1b') - .4, .55)
add(sfx, crowd(E('b11') - S('b2'), yell=True), S('b2'), .22)
add(sfx, gallop(3.0, 3.2), S('b3') + .3, .6); add(sfx, rumble(3.0), S('b3') + .3, .5)
add(sfx, volley(1.6, 20), S('b3') + .3, .55); add(sfx, volley(1.6, 16), S('b3') + 1.0, .45)
add(sfx, boom(.9), S('b3') + 4.4); [add(sfx, clash(), S('b3') + 4.4 + k * .11, .45) for k in range(8)]
add(sfx, gallop(1.2, 3.6), S('b3b') - .1, .7); add(sfx, rumble(1.3), S('b3b') - .1, .7)
for k in range(14): add(sfx, clash(), S('b4') + .3 + k * .37 + rng.uniform(0, .1), .45)
add(sfx, crackle(S('b10') - S('b6')), S('b6'), .45); add(sfx, waves(S('b10') - S('b6')), S('b6'), .15)
add(sfx, whoosh(1.2), S('b7') + 3.3, .3)
for k in range(4): add(sfx, clash(), S('b9') + 1.2 + k * .6, .45)
add(sfx, boom(.6), S('b9') + 3.6)
add(sfx, wind(S('k1') - S('b10')), S('b10'), .15)
add(sfx, crackle(S('k5') - S('k1')), S('k1'), .2)
add(sfx, crowd(S('k6') - S('k5'), yell=True), S('k5'), .3); add(sfx, steps(5.5, 6), S('k5'), .3)
add(sfx, steps(4.4, 4.5), S('k8'), .35); add(sfx, wind(S('k9') - S('k8b')), S('k8b'), .2)
add(sfx, crackle(S('k12') - S('k9')), S('k9'), .3); add(sfx, steps(3.4, 1.6), S('k9'), .3)
add(sfx, waves(S('t6') - S('t1')), S('t1'), .25); add(sfx, wind(S('t6') - S('t1')), S('t1'), .1)
add(sfx, crowd(S('t6') - S('t2')), S('t2'), .15)
for k in range(6): add(sfx, creak(1.4), S('t6') + k * 1.7, .35)
add(sfx, crowd(S('n1') - S('t6'), cheer=True), S('t6'), .2)
add(sfx, crickets(S('n2') - S('n1')), S('n1'), .1); add(sfx, creak(2.0), S('n1') + 1.5, .5)
add(sfx, gate(), S('n3') - .2, .4); add(sfx, crackle(S('r1') - S('n2')), S('n2'), .5)
add(sfx, crowd(S('n10') - S('n2'), yell=True), S('n2') + 1.5, .22); add(sfx, steps(6.6, 7), S('n4'), .4)
for k in range(8): add(sfx, clash(), S('n4') + 1 + k * .8 + rng.uniform(0, .3), .25)
add(sfx, steps(S('n10') - S('n7'), 2.2), S('n7'), .3)
add(sfx, waves(S('r1') - S('n10')), S('n10'), .3)
add(sfx, wind(TOTAL - S('r1'), 300, 1200), S('r1'), .1)
for kk in ('o5', 'h1', 's4', 'w8', 'k8', 'k12', 'r2', 'r4'):
    add(sfx, whoosh(.9), S(kk) - .45, .22)
# stamps thump when they land
for at in (S('h4') + .4, S('w5') + 1.2, S('w7') + .6, S('t3b') + 4, S('t7') + 2.2, S('n10') + 2.5, S('r4d') + 1, S('s4') + 5, S('w8') + 3, S('r2') + 3.2, S('r4') + 5):
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
