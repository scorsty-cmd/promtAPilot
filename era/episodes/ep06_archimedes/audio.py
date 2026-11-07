"""Original score + sound design for 'If You Were Archimedes' Student'. All synthesized here.
Score: war drums, bronze horns, lyre (Karplus-Strong), aulos, wordless choir pad; Phrygian/Dorian colours.
SFX: festival crowd, waves, wind, gallop, chariot rumble, arrows, bronze clashes, war cries (distant), fire, gates, rope & wood creak.
Output: public/mix.wav (~ -14 LUFS), music ducked under dialogue."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json'))
TOTAL = tl['voice_end'] + 8
N = int(TOTAL * SR)
rng = np.random.default_rng(212)
L = tl['lines']; K = {l['key']: l for l in L}
S = lambda k: K[k]['start']; E = lambda k: K[k]['end']
CH = {}
for l in L: CH.setdefault(l['chapter'], l['start'])
order = ['open', 'workshop', 'crown', 'lever', 'numbers', 'siege', 'claw', 'mirrors', 'fall', 'circles', 'book']
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
SEC = {
    'open':     ([[38, 50, 57, 62], [36, 48, 55, 63]], .5, 0, PHR, 'mystery'),
    'workshop': ([[43, 55, 59, 62], [45, 57, 60, 64], [48, 55, 60, 64]], .4, 104, DOR, 'pastoral'),
    'crown':    ([[43, 55, 59, 62, 66], [48, 55, 60, 64], [50, 57, 62, 66]], .4, 120, DOR, 'pastoral'),
    'lever':    ([[38, 50, 57, 62], [43, 55, 62, 67], [45, 57, 64, 69], [50, 57, 62, 66]], .5, 92, DOR, 'wonder'),
    'numbers':  ([[40, 52, 59, 64], [36, 48, 55, 64], [43, 55, 62, 67]], .45, 0, DOR, 'wonder'),
    'siege':    ([[38, 50, 57, 62], [34, 46, 53, 58], [36, 48, 55, 60]], .5, 84, PHR, 'omen'),
    'claw':     ([[38, 50, 57, 62], [36, 48, 55, 60], [34, 46, 53, 58], [33, 45, 52, 57]], .6, 132, PHR, 'battle'),
    'mirrors':  ([[43, 55, 59, 62], [41, 53, 57, 60]], .4, 0, DOR, 'camp'),
    'fall':     ([[43, 55, 62, 67], [37, 49, 56, 61], [38, 50, 53, 58]], .55, 120, HAR, 'tense'),
    'circles':  ([[38, 50, 57, 60], [34, 46, 53, 57], [33, 45, 52, 57], [38, 50, 57, 62]], .45, 0, [62, 65, 67, 69, 72], 'sad'),
    'book':     ([[38, 50, 57, 62, 66], [43, 55, 62, 67, 71], [45, 57, 64, 69], [38, 50, 57, 64, 69]], .5, 0, DOR, 'wonder'),
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
add(music, boom(.9), .25); add(music, horn(38, 3.0), .3, .35)
add(music, boom(1.0), S('o4') + .2); add(music, drum(1.0), S('o4') + .2)
for i, m in enumerate([50, 57, 62]): add(music, horn(m, 2.6), S('o4') + .3 + i * .05, .22)
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

def drip(): t = tt(.25); f = 1400 * (1 + 1.5 * np.exp(-t * 40)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25)
def splash(g=1.0): t = tt(1.4); return (bp(rng.standard_normal(len(t)), 300, 5000) * np.exp(-t * 4) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 6)) * g
def thunk(): t = tt(.5); return lp(rng.standard_normal(len(t)), 400) * np.exp(-t * 14) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 16)
def chain(d=1.2):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .05:
        tt_ = tt(.06); addl(out, sum(np.sin(2 * np.pi * f * tt_) for f in rng.uniform(2000, 5000, 3)) * np.exp(-tt_ * 70) * .4, k); k += rng.uniform(.03, .09)
    return out
def scrape(d=2.0): t = tt(d); return bp(rng.standard_normal(len(t)), 1500, 6000) * (np.abs(np.sin(2 * np.pi * 2.5 * t)) ** 3) * fade_env(len(t), .1, .2)
def hum(d): t = tt(d); return (np.sin(2 * np.pi * 120 * t) * .4 + np.sin(2 * np.pi * 240 * t) * .2) * fade_env(len(t), .5, .5)
def festival(d):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .5:
        addl(out, frame(.5), k); addl(out, frame(.3), k + .25); k += .5
    return out
# beds & spots
add(sfx, crackle(S('o4') + 5.6), 0, .35); add(sfx, crowd(S('o4') + 5.6, yell=True), 0, .12)
add(sfx, steps(1.6, 3), S('o1') + 4.3, .35); add(sfx, clash(), S('o2') + .1, .3)
add(sfx, rewind(4.0), S('o4') + 5.6, .3)
add(sfx, waves(S('w3') - S('w1')), S('w1'), .15); add(sfx, crowd(S('w3') - S('w1')), S('w1'), .1)
add(sfx, steps(1.5, 3), S('w3'), .3); add(sfx, scrape(1.2), S('w3') + 1.6, .25); add(sfx, scrape(1.2), S('w4') + 2, .25)
add(sfx, steps(1.5, 3), S('w8') - .5, .3)
add(sfx, crowd(S('c6') - S('c1')), S('c1'), .06)
for k in range(8): add(sfx, drip(), S('c6') + .3 + k * .37, .3)
add(sfx, splash(.8), S('c6') + 1.3, .5); add(sfx, splash(1.0), S('c7'), .6)
add(sfx, crowd(S('c9') - S('c8'), laugh=True), S('c8'), .5); add(sfx, steps(3.3, 6), S('c8'), .35)
add(sfx, splash(.4), S('c9') + 1.3, .3); add(sfx, splash(.5), S('c9') + 2.2, .35)
add(sfx, crowd(S('c10') + 11 - S('c10')), S('c10'), .08); add(sfx, thud(), S('c10') + 2.2, .4)
add(sfx, waves(S('p1') - S('l1')), S('l1'), .2); add(sfx, crowd(S('p1') - S('l1')), S('l1'), .08)
for k in range(9): add(sfx, creak(1.6), S('l4') + 3 + k * 1.8, .3)
add(sfx, rumble(16), S('l4') + 3, .35); add(sfx, crowd(3, cheer=True), S('l5'), .5); add(sfx, crowd(3, cheer=True), S('l7b') + 1.5, .45)
add(sfx, crackle(S('p4') - S('p1')), S('p1'), .2); add(sfx, crickets(S('s1') - S('p1')), S('p1'), .05)
add(sfx, scrape(2.0), S('p5'), .25); add(sfx, scrape(1.5), S('p6') + .5, .15)
add(sfx, waves(S('k1') - S('s2')), S('s2'), .25); add(sfx, steps(5, 4), S('s2'), .2)
add(sfx, waves(S('m1') - S('k1')), S('k1'), .25); add(sfx, creak(2.4), S('k1') + .5, .5)
add(sfx, chain(1.2), S('k2') + .3, .4); add(sfx, chain(1.6), S('k3') + .2, .5); add(sfx, creak(2.2), S('k3') + .9, .5)
add(sfx, splash(1.2), S('k3') + 4.0, .9); add(sfx, boom(.8), S('k3') + 4.0)
add(sfx, crowd(1.4, cheer=True), S('k4'), .5)
for k in range(5): add(sfx, thunk(), S('k5') + .1 + k * 1.2, .5); add(sfx, splash(.6), S('k5') + 1.3 + k * 1.2, .4)
for k in range(3): add(sfx, thud(), S('k5c') + 1.2 + k * .2, .6)
add(sfx, crowd(S('k7') - S('k5b'), yell=True), S('k5b'), .25); add(sfx, crowd(S('m1') - S('k7'), yell=True), S('k7') + 1.5, .3)
add(sfx, waves(S('m5') - S('m1')), S('m1'), .2); add(sfx, wind(S('m5') - S('m1')), S('m1'), .1)
add(sfx, festival(S('f2') - S('f1')), S('f1'), .25); add(sfx, crowd(S('f2') - S('f1'), cheer=True, laugh=True), S('f1'), .35)
add(sfx, crickets(S('f4') - S('f2')), S('f2'), .08); add(sfx, creak(1.5), S('f2') + .3, .4); add(sfx, steps(4, 5), S('f2') + 2.5, .3)
add(sfx, crowd(S('f4') - S('f3'), yell=True), S('f3'), .35)
add(sfx, crackle(S('d7') - S('f4')), S('f4'), .35); add(sfx, wind(S('d7') - S('f4')), S('f4'), .12)
add(sfx, steps(1.2, 6), S('d1'), .4); add(sfx, steps(1.6, 3), S('d3') - 1.6, .35); add(sfx, clash(), S('d3') + .1, .3)
add(sfx, scrape(2.0), S('d5') + .5, .25)
add(sfx, wind(S('b3') - S('d7')), S('d7'), .15); add(sfx, scrape(3.0), S('b2') + .5, .2)
add(sfx, scrape(3.0), S('b3') + 2, .3); add(sfx, hum(S('b7') - S('b6')), S('b6'), .2)
add(sfx, waves(TOTAL - S('b8')), S('b8'), .25)
for kk in ('o4', 'c9', 'l2', 'l7', 'l8', 'p4', 'p6', 's1', 'm5', 'b3'):
    add(sfx, whoosh(.9), S(kk) - .45 + (5.6 if kk == 'o4' else 0), .22)
for at in (S('c10') + 6.5, S('d5') + 8.5, S('b2') + 4.5, S('c9') + 5, S('l2') + 5.5, S('l7') + 5, S('m5') + 7, S('b3') + 7.5):
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
