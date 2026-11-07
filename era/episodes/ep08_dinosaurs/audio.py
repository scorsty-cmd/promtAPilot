"""Original score + sound design for 'If the Dinosaurs Never Went Extinct'. Everything synthesized here.
Score (new for ep07): marimba + kalimba + log drums + warm analog pad + plucked bass, Lydian/Dorian colours, a chase cue.
SFX: jungle bed (insects, synth birds), breathing, roars, heavy footfalls, sauropod stomps, pterosaur wings, waves, mosasaur splash,
raptor clicks, heartbeat, running steps, crow caws, morning room tone, whooshes, stamp hits.
Output: public/mix.wav (~ -14 LUFS), music ducked under dialogue."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json'))
TOTAL = tl['voice_end'] + 10.5
N = int(TOTAL * SR)
rng = np.random.default_rng(66)
L = tl['lines']; K = {l['key']: l for l in L}
S = lambda k: K[k]['start']; E = lambda k: K[k]['end']
CH = {}
for l in L: CH.setdefault(l['chapter'], l['start'])
order = ['open', 'miss', 'world', 'locals', 'sea', 'mammals', 'minds', 'danger', 'twist']
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
_c = {}
def marimba(m, d=.9):
    k = ('m', m)
    if k not in _c:
        f = mtof(m); t = tt(d); _c[k] = (np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + .35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 18) + .2 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 40)) * np.minimum(1, t / .002)
    return _c[k]
def kalimba(m, d=1.4):
    k = ('k', m)
    if k not in _c:
        f = mtof(m); t = tt(d); _c[k] = (np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + .5 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 30) + .15 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 6)) * np.minimum(1, t / .001)
    return _c[k]
def pad(notes, dur, g=1.0, cut=900):
    t = tt(dur); x = np.zeros(len(t))
    for m in notes:
        for det in (-.07, 0, .07):
            f = mtof(m) * 2 ** (det / 12); ph = np.cumsum(f * (1 + .003 * np.sin(2 * np.pi * .3 * t + rng.uniform(0, 6)))) / SR; x += 2 * (ph % 1) - 1
    y = lp(x, cut) * (.8 + .2 * np.sin(2 * np.pi * t / 5.3))
    return y / (np.abs(y).max() + 1e-9) * g
def bass(m, d=.5):
    f = mtof(m); t = tt(d); ph = np.cumsum(f * np.ones(len(t))) / SR; saw = 2 * (ph % 1) - 1
    return lp(saw, 300 + 900 * np.exp(-t * 10)[0]) * np.exp(-t * 3.5) * np.minimum(1, t / .004)
def logdrum(m=45, g=1.0):
    t = tt(.6); f = mtof(m); return (np.sin(2 * np.pi * f * t * (1 + .3 * np.exp(-t * 40))) * np.exp(-t * 9) + .3 * np.sin(2 * np.pi * f * 2.7 * t) * np.exp(-t * 20)) * g
def kick(g=1.0):
    t = tt(.6); return (np.sin(2 * np.pi * 50 * (1 + 1.2 * np.exp(-t * 30)) * t) * np.exp(-t * 7)) * g
def shaker(g=1.0): t = tt(.12); return hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 45) * g
def tom(f0=110, g=1.0): t = tt(.5); return np.sin(2 * np.pi * f0 * (1 + .4 * np.exp(-t * 25)) * t) * np.exp(-t * 8) * g
def boom(g=1.0):
    t = tt(2.0); return (np.sin(2 * np.pi * 40 * (1 + .6 * np.exp(-t * 15)) * t) * np.exp(-t * 2) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 6) * .5) * g
def drone(d, f=55):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t * (1 + .002 * k)) / k for k in (1, 2, 3, 5))
    return lp(x, 380) * (.7 + .3 * np.sin(2 * np.pi * t / 8)) * fade_env(len(t), 2, 2)
def heartbeat(g=1.0): x = np.zeros(int(.6 * SR)); addl(x, kick(1.0)[:int(.3 * SR)], 0); addl(x, kick(.7)[:int(.3 * SR)], .18); return lp(x, 160) * g

LYD = [60, 62, 64, 66, 67, 69, 71, 72]; DOR = [62, 64, 65, 67, 69, 71, 72, 74]; MIN = [57, 59, 60, 62, 64, 65, 67, 69]; MAJ = [60, 62, 64, 67, 69, 72]
SEC = {
    'open':    ([[45, 52, 57, 60], [41, 48, 57, 60]], .5, 0, MIN, 'mystery'),
    'miss':    ([[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 57, 60], [43, 50, 55, 59]], .4, 96, MAJ, 'curious'),
    'world':   ([[48, 55, 62, 66], [43, 50, 57, 62], [45, 52, 59, 64]], .45, 104, LYD, 'lush'),
    'locals':  ([[38, 45, 53, 57], [41, 48, 53, 60], [43, 50, 55, 62], [36, 43, 52, 55]], .5, 112, DOR, 'adventure'),
    'sea':     ([[43, 50, 59, 62], [40, 47, 55, 59], [45, 52, 57, 64]], .45, 0, LYD, 'sea'),
    'mammals': ([[48, 55, 60, 64], [50, 57, 62, 65], [43, 50, 55, 62]], .4, 124, MAJ, 'playful'),
    'minds':   ([[41, 48, 57, 64], [43, 50, 59, 62], [45, 52, 60, 64], [40, 47, 55, 64]], .5, 0, LYD, 'wonder'),
    'danger':  ([[45, 52, 57, 60], [41, 48, 53, 60], [40, 47, 52, 59]], .5, 0, MIN, 'dark'),
    'twist':   ([[48, 55, 64, 67], [45, 52, 60, 64], [41, 48, 57, 64], [43, 50, 59, 62]], .45, 84, MAJ, 'morning'),
}
for c, a, b in bounds:
    chords, g, bpm, scale, mood = SEC[c]
    dur = b - a; step = dur / len(chords)
    for i, ch in enumerate(chords):
        x = pad(ch, step + 2.0, g, 700 if mood in ('dark', 'mystery') else 1200); x *= fade_env(len(x), .3 if a == 0 and i == 0 else 1.6, 2.0); add(music, x, a + i * step, .38)
    if mood in ('mystery', 'dark'): add(music, drone(dur + 1, 36.7), a, .4)
    if bpm:
        beat = 60 / bpm; k = 0; t0 = a + 1.0
        while t0 + k * beat / 2 < b - 1.5:
            at = t0 + k * beat / 2; pos = k % 8; ci = min(len(chords) - 1, int((at - a) / step))
            root = chords[ci][0]
            if mood == 'adventure':
                if pos in (0, 3, 6): add(music, logdrum(43 if pos == 0 else 50, .8), at)
                if pos in (2, 5, 7): add(music, tom(150, .35), at)
                add(music, shaker(.25), at)
                if pos in (0, 4): add(music, bass(root, .45), at, .5)
            elif mood in ('curious', 'playful'):
                if pos in (0, 3, 5): add(music, bass(root + (12 if pos == 5 else 0), .3), at, .45)
                if pos % 2: add(music, shaker(.2), at)
                if mood == 'playful' and pos in (2, 6): add(music, marimba(scale[(k // 2) % len(scale)] + 12, .4), at, .25)
            elif mood == 'lush':
                add(music, kalimba(scale[(k * 3) % len(scale)] + 12, 1.2), at, .18)
                if pos == 0: add(music, bass(root, .8), at, .4)
            elif mood == 'morning':
                if pos in (0, 3): add(music, kick(.5), at)
                if pos in (2, 6): add(music, lp(shaker(1.0), 3000) * 2, at, .25)
                if pos in (0, 4): add(music, bass(root, .7), at, .35)
            k += 1
    r = np.random.default_rng(abs(hash(c)) % 1000 + 7)
    motif = [int(v) for v in r.choice(scale, 5)]; at = a + 2.5; n = 0
    while at < b - 3:
        d = .3 if mood in ('adventure', 'playful') else .42 if mood in ('curious', 'morning') else .6
        for j, m in enumerate(motif):
            if mood in ('curious', 'playful', 'adventure'): add(music, marimba(m, .9), at + j * d, .32)
            elif mood == 'dark': add(music, kalimba(m - 12, 2.0), at + j * d * 1.5, .22)
            else: add(music, kalimba(m + (12 if mood in ('lush', 'sea', 'wonder') else 0), 1.6), at + j * d, .28)
        n += 1; motif = (motif[1:] + [int(r.choice(scale))]) if n % 2 else motif[::-1]
        at += len(motif) * d + r.uniform(2.5, 5.5)
# chase cue d11 -> d15
a, b = S('d11') + 1.4, E('d15') + .5; beat = 60 / 150; k = 0
while a + k * beat / 2 < b:
    at = a + k * beat / 2; pos = k % 8
    if pos in (0, 3, 4, 6): add(music, logdrum(40, .9), at)
    add(music, shaker(.35), at)
    if pos % 2 == 0: add(music, tom(180 + 40 * (pos % 4), .35), at)
    if pos in (0, 4): add(music, bass(40 if (k // 8) % 2 == 0 else 43, .3), at, .6)
    k += 1
for i, m in enumerate([64, 67, 71, 74, 76, 79]): add(music, marimba(m, .9), E('d15') + .1 + i * .07, .35)
# heartbeat under the night
at = S('d7') + 2
while at < S('d11') + 1.4: add(sfx, heartbeat(1.0), at, .5); at += .75 - .25 * (at - S('d7')) / (S('d11') - S('d7'))
for c, a, b in bounds[1:]:
    add(music, kick(1.0), a + .05); add(music, boom(.4), a + .05)
    for i, m in enumerate([72, 76, 79]): add(music, marimba(m, .9), a + .1 + i * .08, .3)
add(music, boom(1.0), S('o4') + .2); add(music, kick(1.0), S('o4') + .2)
for i, m in enumerate([60, 64, 67, 71, 74]): add(music, kalimba(m + 12, 2.0), S('o4') + .4 + i * .12, .3)
END = tl['voice_end'] + .4
add(music, boom(1.0), END); add(music, kick(1.1), END + .05)
for i, m in enumerate([60, 64, 67, 72, 76, 79]): add(music, marimba(m, 1.2), END + .4 + i * .15, .45)
add(music, pad([48, 55, 64, 67, 71], 9.5, .6, 1500) * fade_env(int(9.5 * SR), 1, 3), END + .2, .45)

# ---------------- sound effects ----------------
def insects(d): t = tt(d); return bp(rng.standard_normal(len(t)), 3800, 6200) * (.5 + .5 * (np.sin(2 * np.pi * 21 * t) > .2)) * (.6 + .4 * np.sin(2 * np.pi * .23 * t)) * fade_env(len(t), 1, 1)
def bird(f0=2400):
    t = tt(.35); f = f0 * (1 + .35 * np.sin(2 * np.pi * rng.uniform(8, 16) * t)) * (1 + .3 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .35) ** 2
def jungle(d, birds=True):
    out = insects(d) * .4 + lp(rng.standard_normal(int(d * SR)), 500) * .25
    if birds:
        k = rng.uniform(0, 1.5)
        while k < d - .5:
            f0 = rng.uniform(1600, 3600)
            for j in range(rng.integers(1, 4)): addl(out, bird(f0) * .35, k + j * .22)
            k += rng.uniform(.8, 2.6)
    return out * fade_env(len(out), 1, 1)
def growl(d=1.6, f0=70, g=1.0):
    t = tt(d); f = f0 * (1 + .25 * np.sin(np.pi * t / d)); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    x = lp(saw, 500) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 23 * t))) + bp(rng.standard_normal(len(t)), 200, 1200) * .7
    return x * np.sin(np.pi * t / d) ** .7 * g
def roar(d=2.2, g=1.0):
    t = tt(d); f = 120 * (1 + .6 * np.sin(np.pi * t / d)); saw = 2 * ((np.cumsum(f * (1 + .03 * np.sin(2 * np.pi * 9 * t))) / SR) % 1) - 1
    x = bp(saw, 90, 1600) + bp(rng.standard_normal(len(t)), 300, 2500) * 1.2 * (.5 + .5 * np.abs(np.sin(2 * np.pi * 31 * t)))
    return (x + lp(saw, 160) * .8) * np.minimum(1, t / .15) * np.exp(-np.maximum(0, t - d * .6) * 4) * g
def breath(d=1.2): t = tt(d); return bp(rng.standard_normal(len(t)), 150, 900) * np.sin(np.pi * t / d) ** 2
def thud(g=1.0): t = tt(.5); return (lp(rng.standard_normal(len(t)), 220) * np.exp(-t * 12) + np.sin(2 * np.pi * 45 * t) * np.exp(-t * 9)) * g
def steps(d, rate=1.8, g=1.0, f=900):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .2:
        tt_ = tt(.12); addl(out, lp(rng.standard_normal(len(tt_)), f) * np.exp(-tt_ * 40) * g, k); k += 1 / rate
    return out
def flap(d, rate=1.4):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .4:
        tt_ = tt(.35); addl(out, lp(rng.standard_normal(len(tt_)), 700) * np.sin(np.pi * tt_ / .35) ** 3, k); k += 1 / rate
    return out
def waves(d): t = tt(d); return lp(rng.standard_normal(len(t)), 900) * (.35 + .65 * np.sin(2 * np.pi * t / 5.5) ** 2) * fade_env(len(t), 1, 1)
def splash(g=1.0): t = tt(1.6); return (bp(rng.standard_normal(len(t)), 300, 5000) * np.exp(-t * 3.5) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 5)) * g
def squeak(): t = tt(.18); f = 2400 * (1 + .6 * np.sin(np.pi * t / .18)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .18)
def click(): t = tt(.05); return bp(rng.standard_normal(len(t)), 1500, 4500) * np.exp(-t * 120)
def chirps(d):
    out = np.zeros(int(d * SR)); k = rng.uniform(0, 1)
    while k < d - .5:
        for j in range(rng.integers(2, 5)): addl(out, click(), k + j * .07)
        if rng.random() < .4: addl(out, bird(rng.uniform(900, 1400)) * .5, k + .4)
        k += rng.uniform(.7, 1.8)
    return out
def caw(g=1.0):
    t = tt(.45); f = np.interp(t, [0, .1, .45], [700, 820, 520]); saw = 2 * ((np.cumsum(f * (1 + .04 * np.sin(2 * np.pi * 40 * t))) / SR) % 1) - 1
    return (bp(saw, 600, 3200) + bp(rng.standard_normal(len(t)), 1000, 3000) * .5) * np.sin(np.pi * t / .45) ** .6 * g
def room(d): t = tt(d); return lp(rng.standard_normal(len(t)), 300) * .3 * fade_env(len(t), 1, 1)
def whoosh(d=1.0):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); c = 20
    for k in range(c):
        a, b = k * n // c, (k + 1) * n // c; fc = 300 + 3000 * np.sin(np.pi * (k + .5) / c) ** 2
        out[a:b] = bp(x, fc * .6, fc * 1.6)[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
def stamp_hit(): t = tt(.35); return lp(rng.standard_normal(len(t)), 700) * np.exp(-t * 22) + np.sin(2 * np.pi * 120 * t) * np.exp(-t * 25)
def swat(): t = tt(.15); return bp(rng.standard_normal(len(t)), 800, 5000) * np.exp(-t * 50)
def buzz(d): t = tt(d); return bp(2 * ((t * 520 * (1 + .03 * np.sin(2 * np.pi * 3 * t))) % 1) - 1, 400, 3000) * (.4 + .6 * np.sin(2 * np.pi * .8 * t) ** 2) * fade_env(len(t), .3, .3)
def rumble(d): t = tt(d); return lp(rng.standard_normal(len(t)), 120) * fade_env(len(t), .5, .8)
def space(d): t = tt(d); return (lp(rng.standard_normal(len(t)), 300) * .5 + np.sin(2 * np.pi * 55 * t) * .2) * fade_env(len(t), .4, 1)

# beds
jungle_spans = [(0, S('o4')), (S('o4') + 6.4, S('s1') - 1), (S('p1') - 1, S('d7')), (S('d7'), S('t1'))]
for a, b in jungle_spans[:3]: add(sfx, jungle(b - a), a, .35)
add(sfx, insects(S('t1') - S('d7')) * .8 + chirps(S('t1') - S('d7')), S('d7'), .45)
add(sfx, space(6.4), S('o4'), .4); add(sfx, whoosh(2.5), S('o4') + 2.5, .5)
add(sfx, waves(S('p1') - S('s1') + 1), S('s1'), .4)
add(sfx, room(TOTAL - S('t1')), S('t1'), .5)
# hook
for k in range(4): add(sfx, breath(1.0), 1.0 + k * 1.82, .55)
add(sfx, growl(1.4, 60), 2.6, .5); add(sfx, steps(1.2, 4, .6), 8.0, .4)
add(sfx, thud(.8), S('o4') + 6.6); add(sfx, thud(.7), S('o4') + 7.6); add(sfx, thud(.6), S('o4') + 8.6)
# miss
for k in range(6): add(sfx, thud(.3), S('m1') + 1 + k * 2.4)
# world
add(sfx, steps(S('w2') + 2 - S('w1'), 2.1, .5), S('w1'), .35)
add(sfx, buzz(E('w8') - S('w7')), S('w7'), .25); add(sfx, swat(), S('w7') + 1.6, .6)
# locals
add(sfx, roar(2.4), S('l1') + .2, .9); add(sfx, roar(1.8), S('l3c') - .3, .8)
for k in range(3): add(sfx, thud(.9), S('l1') + k * 1.0)
add(sfx, squeak(), S('l4') + 1, .2); add(sfx, squeak(), S('l4') + 2.5, .2)
add(sfx, flap(4.5, 1.6), S('l5b'), .5); add(sfx, thud(.4), S('l5b') + 4.5)
t0 = S('l6')
while t0 < S('s1') - 1.5: add(sfx, thud(1.0), t0, .9); add(sfx, rumble(.8), t0, .4); t0 += 60 / 4.2 / 4 * 2.2
# sea
add(sfx, splash(1.0), S('s4') + .6, .9); add(sfx, roar(1.2, .6), S('s4') + 1.6, .4); add(sfx, splash(1.2), S('s4') + 3.6, 1.0); add(sfx, boom(.6), S('s4') + 3.6)
# mammals
for k in range(3): add(sfx, squeak(), S('p2') + k * .25, .4)
add(sfx, roar(1.4, .5), S('p7') + 4.2, .5)
# minds
add(sfx, chirps(10), S('i10'), .2)
for k in range(5): add(sfx, thud(.25), S('i10') + 1 + k * 1.6)
# danger
add(sfx, chirps(4), S('d11'), .7); add(sfx, roar(1.0, .5), S('d11') + 1.3, .7)
add(sfx, steps(E('d15') - S('d11') - 1.4, 5.5, .9, 1400), S('d11') + 1.4, .55)
for k in range(5): add(sfx, squeak(), S('d13') + k * .4, .35)
# twist
for a in (S('t2'), S('t9c')): add(sfx, caw(1.0), a, .45)
for k in range(6): add(sfx, bird(rng.uniform(2600, 3600)), S('t1') + 1 + k * 2.3, .12)
add(sfx, steps(1.4, 3), S('t3b') - 1.2, .35); add(sfx, thud(.4), S('t3') - .2)
for kk in ('m5', 'm8', 'm11', 'w4', 'l5', 's7', 'p5', 'p8', 'i3', 'i6', 't5b', 't6', 't7'):
    add(sfx, whoosh(.9), S(kk) - .45, .3)
for at in (S('m8') + 4.2, S('m11') + 4.6, S('l5') + 3.4, S('p5') + 9.5, S('i6') + 2.2, S('t5b') + 4, S('t6') + 8, S('t7') + 6.5):
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
bed = music * .34 * duck + sfx * .5 * (.6 + .4 * duck)
end = fade_env(N, .02, 1.5)
d = int(.011 * SR); bedR = np.zeros(N); bedR[d:] = bed[:-d]
st = np.stack([(vn + bed) * end, (vn + bedR) * end], 1)
st = np.tanh(st * 1.1) / np.tanh(1.1); st = st / np.abs(st).max() * .9
sf.write('mix_raw.wav', st.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', 'mix_raw.wav', '-af',
                'alimiter=level_in=1.5:limit=0.8:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/mix.wav'], check=True)
print('ok', round(TOTAL, 2))
