"""Original score + sound design for 'If You Were Alexander the Great's Classmate'. All synthesized here.
Score (NEW for Macedon & Persia): kithara & lyre (Karplus-Strong), double aulos, salpinx war trumpet, frame drums & big war drum, wordless choir;
Mixolydian/Dorian for Greece, Hijaz/Phrygian for Persia, a raga-like drone for India.
SFX: feast hall, horse (neigh, gallop), crowd in the theatre, river splashes, phalanx march, chariot rumble, elephant trumpet, monsoon & thunder,
desert wind, fire, sword clashes timed from src/fights.json, gfx whooshes and stamp thumps.
Output: public/mix.wav (~ -14 LUFS), music ducked under dialogue."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json')); FG = json.load(open('src/fights.json'))
TOTAL = tl['voice_end'] + 8
N = int(TOTAL * SR)
rng = np.random.default_rng(336)
L = tl['lines']; K = {l['key']: l for l in L}
S = lambda k: K[k]['start']; E = lambda k: K[k]['end']
CH = {}
for l in L: CH.setdefault(l['chapter'], l['start'])
order = ['open', 'pella', 'mieza', 'king', 'asia', 'issus', 'gauga', 'persia', 'feast', 'india', 'desert', 'end', 'real']
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

def hydraulis(m, d=1.0, g=1.0):  # water organ: stacked flue pipes + breath + slight tremolo
    t = tt(d); f = mtof(m); trem = 1 + .05 * np.sin(2 * np.pi * 6.2 * t)
    x = sum(np.sin(2 * np.pi * f * k * t) * a for k, a in ((1, 1), (2, .5), (3, .32), (4, .18), (6, .08)))
    x = x * trem + bp(rng.standard_normal(len(t)), f * 1.5, f * 6) * .12
    return x * fade_env(len(t), .04, min(.2, d * .3)) * g
def tuba(m, d=.6, g=1.0):  # straight Roman tuba: bright, raspy
    f = mtof(m); t = tt(d); ph = np.cumsum(f * (1 + .02 * np.exp(-t * 18))) / SR; saw = 2 * (ph % 1) - 1
    x = lp(saw, 2200) * .6 + bp(saw, 1200, 3500) * .5 * np.minimum(1, t / .05)
    return x * fade_env(len(t), .03, .12) * g
def salpinx(m, d=.5, g=1.0):  # Greek war trumpet: narrow, brassy, slightly unstable
    f = mtof(m); t = tt(d); ph = np.cumsum(f * (1 + .03 * np.exp(-t * 12) + .004 * np.sin(2 * np.pi * 5 * t))) / SR; sq = np.sign(np.sin(2 * np.pi * ph)) * .5 + (2 * (ph % 1) - 1) * .5
    return bp(sq, 300, 4000) * fade_env(len(t), .02, .1) * g
def tabla(g=1.0, f0=180):  # for India
    t = tt(.35); f = f0 * (1 + .6 * np.exp(-t * 25)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * g
def trumpet_el():  # elephant trumpet
    t = tt(1.4); f = 520 + 160 * np.sin(2 * np.pi * 1.7 * t) * np.exp(-t); ph = np.cumsum(f) / SR; x = (2 * (ph % 1) - 1)
    return bp(x + .4 * rng.standard_normal(len(t)), 300, 3000) * fade_env(len(t), .05, .4)
MIX = [62, 64, 66, 67, 69, 71, 72, 74]; DOR = [62, 64, 65, 67, 69, 71, 72, 74]; HIJ = [62, 63, 66, 67, 69, 70, 72, 74]; PHR = [62, 63, 65, 67, 69, 70, 72, 74]; RAG = [62, 63, 66, 67, 69, 70, 73, 74]
SEC = {  # chords, gain, bpm, scale, mood
    'open':   ([[38, 50, 53, 57], [37, 49, 56, 61], [38, 50, 53, 58]], .55, 0, HIJ, 'tense'),
    'pella':  ([[38, 50, 57, 62, 66], [43, 55, 62, 67], [45, 57, 64, 69]], .42, 108, MIX, 'bright'),
    'mieza':  ([[38, 50, 57, 62, 66], [43, 55, 59, 62], [40, 52, 59, 64], [45, 57, 61, 64]], .4, 0, MIX, 'wonder'),
    'king':   ([[38, 50, 53, 57], [34, 46, 53, 58], [36, 48, 55, 60]], .45, 76, PHR, 'omen'),
    'asia':   ([[38, 50, 57, 62], [36, 48, 55, 60], [41, 53, 60, 65]], .5, 120, DOR, 'battle'),
    'issus':  ([[38, 50, 57, 62], [39, 51, 58, 63]], .5, 126, HIJ, 'battle'),
    'gauga':  ([[38, 50, 57, 62, 66], [43, 55, 62, 67], [45, 57, 64, 69], [38, 50, 57, 62]], .55, 132, DOR, 'epic'),
    'persia': ([[38, 50, 57, 63], [39, 51, 58, 63], [36, 48, 55, 60]], .45, 0, HIJ, 'sad'),
    'feast':  ([[38, 50, 53, 57], [37, 49, 56, 61]], .4, 0, PHR, 'sad'),
    'india':  ([[38, 50, 57, 62], [39, 51, 57, 63]], .5, 112, RAG, 'india'),
    'desert': ([[38, 50, 57, 60], [36, 48, 55, 60], [34, 46, 53, 58]], .45, 0, PHR, 'sad'),
    'end':    ([[38, 50, 57, 62], [36, 48, 55, 60], [34, 46, 53, 58], [33, 45, 52, 57]], .5, 0, DOR, 'sad'),
    'real':   ([[38, 50, 57, 62, 66], [43, 55, 62, 67, 71], [45, 57, 64, 69], [38, 50, 57, 64, 69]], .5, 0, MIX, 'wonder'),
}
for c, a, b in bounds:
    chords, g, bpm, scale, mood = SEC[c]
    dur = b - a; step = dur / len(chords)
    for i, ch in enumerate(chords):
        x = choir(ch, step + 2.0, g * (.7 if mood in ('bright', 'india') else 1)); x *= fade_env(len(x), .3 if a == 0 and i == 0 else 1.6, 2.0); add(music, x, a + i * step, .4)
    if mood in ('tense', 'sad', 'omen', 'epic', 'india'): add(music, drone(dur + 1, 36.7), a, .35)
    if bpm:
        beat = 60 / bpm; k = 0; t0 = a + 1.0
        while t0 + k * beat / 2 < b - 1.5:
            at = t0 + k * beat / 2; pos = k % 8
            if mood in ('battle', 'epic'):
                if pos in (0, 3, 6): add(music, drum(.9 if pos == 0 else .6), at)
                if pos % 2: add(music, frame(.35), at)
                if mood == 'epic' and pos == 4: add(music, boom(.3), at)
            if mood == 'bright' and pos in (0, 3, 6): add(music, frame(.4 if pos == 0 else .25), at)
            if mood == 'omen' and pos in (0, 4): add(music, drum(.6, 55), at)
            if mood == 'india': add(music, tabla(.5 if pos in (0, 3, 6) else .25, 180 if pos % 2 else 120), at)
            k += 1
    r = np.random.default_rng(abs(hash(c)) % 1000 + 11)
    motif = [int(v) for v in r.choice(scale, 5)]; at = a + 2.5; n = 0
    while at < b - 3:
        d = .3 if mood in ('battle', 'epic', 'bright', 'india') else .6
        for j, m in enumerate(motif):
            if mood in ('battle', 'epic'): add(music, horn(m - 12, d * 1.6), at + j * d, .14)
            elif mood in ('sad', 'wonder', 'tense'): add(music, lyre(m, 1.8), at + j * d, .3)
            else: add(music, aulos(mtof(m), d * 1.05), at + j * d, .1)
        n += 1; motif = (motif[1:] + [int(r.choice(scale))]) if n % 2 else motif[::-1]
        at += len(motif) * d + r.uniform(2.5, 5.5)
for c, a, b in bounds[1:]:
    add(music, drum(1.0), a + .05); add(music, boom(.5), a + .05); add(music, horn(50, 1.6), a + .1, .25)
# cold open: no intro music, straight into the shouting; impact + silence at the kill
KILL = S('o6') + .55
add(music, boom(1.2), KILL); add(music, drum(1.2, 50), KILL)
music[int(KILL * SR) + int(.3 * SR): int(S('o7') * SR)] *= .0
add(music, boom(1.0), S('o9') + .4); add(music, drum(1.0), S('o9') + .4)
for i, m in enumerate([50, 57, 62]): add(music, horn(m, 2.6), S('o9') + .5 + i * .05, .22)
for i, m in enumerate([62, 66, 69, 74]): add(music, salpinx(m, .22 if i < 3 else .8), S('a8') + 2.2 + i * .2, .35)
for i, m in enumerate([62, 66, 69, 74]): add(music, salpinx(m, .22 if i < 3 else .8), S('g10') + 1.4 + i * .2, .35)
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
def thunder(): t = tt(3.0); return lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 1.2) * (1 + np.sin(2 * np.pi * 7 * t) * .3) * 1.4
# cold open: feast hall chatter, goblet crash, kill impact then silence
add(sfx, hall(S('o5')), 0, .35); add(sfx, crowd(S('o6') - S('o3') + 1, yell=True), S('o3'), .25)
add(sfx, clash(), S('o5') + .9, .35); add(sfx, thud(), S('o5') + 1.1, .4); fhit('open')
sfx[int((KILL + .3) * SR): int(S('o7') * SR)] *= 0
add(sfx, crackle(S('o9') - S('o7')), S('o7'), .2); add(sfx, wind(S('o9') - S('o7'), 300, 1100), S('o7'), .1)
add(sfx, rewind(4.0), S('o9') + 5.6, .3)
# Pella: horse
add(sfx, crowd(S('p7') - S('p2'), yell=False), S('p2'), .1)
for k in range(5): add(sfx, neigh(), S('p2') + .8 + k * 2.6, .3)
for kk in ('p6', 'p7'): add(sfx, gallop(1.2, 4), S(kk), .25)
add(sfx, neigh(), S('p8') + 3.0, .4); add(sfx, gallop(S('m1') - S('p10') - 1.5, 3.2), S('p10'), .4)
# Mieza: birds-ish crickets, spring water, wind in plane trees
add(sfx, crickets(S('k1') - S('m1') - 2), S('m1'), .04); add(sfx, wind(S('k1') - S('m1') - 2, 600, 2400), S('m1'), .08)
add(sfx, waves(S('k1') - S('m1') - 2), S('m1'), .05); add(sfx, steps(3, 3.5), S('m8') + .3, .3)
# king: theatre
add(sfx, crowd(S('k4') - S('k1') + 1, cheer=True), S('k1'), .35); add(sfx, steps(2.6, 6), S('k3'), .3)
add(sfx, crowd(S('k8') - S('k4'), yell=True), S('k4'), .5); add(sfx, thud(), S('k4') + 1.2, .5)
add(sfx, crowd(S('k13') - S('k8'), yell=False), S('k8'), .08); add(sfx, wind(S('a1') - S('k8')), S('k8'), .1)
# asia
add(sfx, waves(S('a6') - S('a1')), S('a1'), .35); add(sfx, creak(1.5), S('a2'), .25); add(sfx, whoosh(.8), S('a2') + .3, .45); add(sfx, thud(), S('a2') + 1.2, .5)
add(sfx, splash(S('a15') - S('a6')), S('a6'), .25); add(sfx, gallop(S('a9') - S('a6'), 2), S('a6'), .15)
add(sfx, crowd(S('a15') - S('a9') - 1, yell=True), S('a9'), .45); fhit('gran')
for k in range(10): add(sfx, clash(), S('a9') + .3 + k * 1.3 + rng.uniform(0, .3), .15)
add(sfx, crackle(S('i1') - S('a15')), S('a15'), .25); add(sfx, clash(), S('a17') + .9, .6); add(sfx, creak(1.0), S('a18') + 5.2, .5)
# issus
add(sfx, march(S('i2') - S('i1'), 1.6), S('i1'), .3); add(sfx, waves(S('i2') - S('i1')), S('i1'), .15)
add(sfx, crowd(S('i7') - S('i3'), yell=True), S('i3'), .5); add(sfx, gallop(S('i7') - S('i3'), 4.5), S('i3'), .4); add(sfx, rumble(S('i7') - S('i5')), S('i5'), .4); fhit('issus')
add(sfx, crackle(S('g1') - S('i7')), S('i7'), .25)
# gaugamela
add(sfx, wind(S('g4') - S('g2')), S('g2'), .2)
add(sfx, march(S('g7') - S('g4'), 1.4), S('g4'), .3); add(sfx, crowd(S('g7') - S('g4')), S('g4'), .15)
add(sfx, rumble(S('g9') + 4 - S('g7')), S('g7'), .6); add(sfx, gallop(S('g9') + 4 - S('g7'), 6), S('g7'), .45)
add(sfx, crowd(S('e1') - S('g8'), yell=True), S('g8'), .5); fhit('gauga'); add(sfx, gallop(S('e1') - S('g10'), 5), S('g10'), .4)
for k in range(12): add(sfx, clash(), S('g9') + k * .7 + rng.uniform(0, .2), .2)
# persepolis
add(sfx, wind(S('e4') - S('e1')), S('e1'), .12)
for k in range(6): add(sfx, clash(), S('e2') + .2 + k * .18, .12)
add(sfx, hall(S('e4') + 1.5 - S('e4')), S('e4'), .25); add(sfx, crackle(S('e8') - S('e4') - 1), S('e4') + 1.2, .8)
add(sfx, crackle(S('f1') - S('e8')), S('e8'), .25)
# the feast (again) & Callisthenes
add(sfx, crackle(S('f3') - S('f1')), S('f1'), .2); add(sfx, wind(S('f6') - S('f3'), 300, 1100), S('f3'), .15); add(sfx, crickets(S('f6') - S('f3')), S('f3'), .06)
add(sfx, crackle(S('n1') - S('f6')), S('f6'), .2); add(sfx, steps(5, 1.8), S('f9') + 1, .3)
# india
add(sfx, waves(S('n4') - S('n1')), S('n1'), .25); add(sfx, trumpet_el(), S('n1') + 3, .35); add(sfx, trumpet_el(), S('n3') + .3, .4)
add(sfx, snowstorm(S('n5') - S('n4')), S('n4'), .35); add(sfx, splash(S('n5') - S('n4')), S('n4'), .3)
for k in range(3): add(sfx, thunder(), S('n4') + .5 + k * 1.8, .45)
add(sfx, crowd(S('n9') - S('n5'), yell=True), S('n5'), .5); fhit('india')
for k in range(4): add(sfx, trumpet_el(), S('n5') + .3 + k * 2.4, .45)
for k in range(10): add(sfx, clash(), S('n6') + k * .9 + rng.uniform(0, .2), .2)
add(sfx, wind(S('n13') - S('n12')), S('n12'), .15); add(sfx, neigh(), S('n12') + 1, .15)
add(sfx, snowstorm(S('d1') - S('n13')), S('n13'), .15); add(sfx, crowd(S('d1') - S('n14'), yell=False), S('n14'), .12)
add(sfx, march(S('d1') - S('n16') - 4, 1.0), S('n16') + 4, .3)
# desert
add(sfx, wind(S('d6') - S('d1'), 200, 700), S('d1'), .4); add(sfx, steps(S('d2') - S('d1'), 1.2), S('d1'), .2)
add(sfx, splash(1.4), S('d5') + 1, .3)
add(sfx, crackle(S('z1') - S('d6')), S('d6'), .3); add(sfx, crickets(S('z1') - S('d6')), S('d6'), .06)
# babylon
add(sfx, crackle(S('r1') - S('z1')), S('z1'), .2); add(sfx, wind(S('r1') - S('z1'), 300, 1000), S('z1'), .08)
# real
add(sfx, wind(TOTAL - S('r1'), 300, 1200), S('r1'), .1); add(sfx, waves(S('r7') - S('r6')), S('r6'), .3)
for kk in ('p1', 'm7', 'a1', 'g1', 'g6', 'e3', 'z9', 'r2', 'r5'):
    add(sfx, whoosh(.9), S(kk) - .45, .22)
for at in (S('m10') + 5.2, S('m17') + 3.5, S('k13') + 3.4, S('a5') + 2.5, S('a18') + 6.2, S('e7') + 1.5, S('z8') + 2.4):
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
