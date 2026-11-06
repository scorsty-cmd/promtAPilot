"""Original score + sound design for 'If You Were Socrates' Student' (8 min). All synthesized here.
Instruments: aulos (double reed pipe), kithara/lyre (plucked, Karplus-Strong), tympanon frame drum, krotala clappers, low drone.
Output: public/mix.wav (~ -14 LUFS), music ducked under dialogue."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json'))
TOTAL = tl['voice_end'] + 8
N = int(TOTAL * SR)
rng = np.random.default_rng(399)
L = tl['lines']; K = {l['key']: l for l in L}
S = lambda k: K[k]['start']
CH = {}
for l in L: CH.setdefault(l['chapter'], l['start'])
order = ['open', 'born', 'agora', 'barefoot', 'questions', 'symposium', 'oracle', 'war', 'trial', 'hemlock', 'legacy']
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

# ---------------- instruments ----------------
def pad(notes, dur, bright=900, g=1.0):
    t = tt(dur); x = np.zeros(len(t))
    for m in notes:
        for d in (-.08, 0, .08):
            f = mtof(m) * 2 ** (d / 12); ph = rng.uniform(0, 6.28)
            for h in range(1, 6): x += np.sin(2 * np.pi * f * h * t + ph * h) / h ** 1.4
    x *= .8 + .2 * np.sin(2 * np.pi * t / 6.1)
    x = lp(x, bright); return x / (np.abs(x).max() + 1e-9) * g
def lyre(f, d=1.6, g=1.0):  # Karplus-Strong pluck
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return lp(out, 5000) * fade_env(n, .002, .3) * g
_lyre_cache = {}
def lyreC(m, d=1.6):
    k = (m, d)
    if k not in _lyre_cache: _lyre_cache[k] = lyre(mtof(m), d)
    return _lyre_cache[k]
def aulos(f, d=.5, g=1.0):  # nasal double reed: two detuned saws through formant bands, breathy
    t = tt(d); vib = 1 + .006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .3)
    x = 0
    for det in (1.0, 1.004):
        ph = np.cumsum(f * det * vib) / SR; x = x + (2 * (ph % 1) - 1)
    x = bp(x, f * .9, 3200) * .7 + bp(x, 1100, 1700) * .5 + bp(rng.standard_normal(len(t)), 1500, 5000) * .05
    return x * fade_env(len(t), .03, min(.15, d * .3)) * g
def tympanon(g=1.0):
    t = tt(.5); return (np.sin(2 * np.pi * 95 * (1 + .4 * np.exp(-t * 30)) * t) * np.exp(-t * 9) + bp(rng.standard_normal(len(t)), 300, 2500) * np.exp(-t * 35) * .5) * g
def krotala(g=1.0):
    t = tt(.08); return (bp(rng.standard_normal(len(t)), 1800, 7000) * np.exp(-t * 80) + np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 120) * .5) * g
def drone(d, f=55):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t * (1 + .002 * k)) / k for k in (1, 2, 3, 5))
    return lp(x, 380) * (.7 + .3 * np.sin(2 * np.pi * t / 8)) * fade_env(len(t), 2, 2)
def bell(f, d=2.5):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)) * np.exp(-t * 1.8) * np.minimum(1, t / .004)
def boom(g=1.0):
    t = tt(1.6); return (np.sin(2 * np.pi * 48 * (1 + .6 * np.exp(-t * 18)) * t) * np.exp(-t * 2.6) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 8) * .5) * g

# ---------------- score (D Dorian / Phrygian colours, like the old Greek modes) ----------------
DOR = [62, 64, 65, 67, 69, 71, 72, 74, 76]; PHR = [62, 63, 65, 67, 69, 70, 72, 74]
SEC = {  # chords, brightness, gain, bpm, scale, mood
    'open':      ([[38, 50, 57, 62, 65], [34, 46, 53, 58, 65]], 700, .5, 0, PHR, 'dark'),
    'born':      ([[38, 50, 57, 62, 66, 69], [43, 55, 62, 67, 71], [45, 57, 64, 69, 73]], 1400, .5, 92, DOR, 'warm'),
    'agora':     ([[38, 50, 57, 62, 69], [36, 48, 55, 60, 67], [41, 53, 60, 65, 72]], 1500, .5, 112, DOR, 'drive'),
    'barefoot':  ([[43, 55, 62, 67, 71], [41, 53, 60, 64, 69], [38, 50, 57, 62, 69]], 1500, .45, 100, DOR, 'play'),
    'questions': ([[38, 50, 57, 62, 65], [36, 48, 55, 60, 67], [34, 46, 53, 62, 65]], 1300, .45, 104, DOR, 'play'),
    'symposium': ([[38, 50, 57, 62, 66, 69], [36, 48, 55, 60, 64], [43, 55, 62, 67, 71]], 1700, .6, 128, DOR, 'party'),
    'oracle':    ([[38, 50, 57, 64, 69, 76], [34, 46, 53, 62, 69, 74]], 1800, .45, 0, [69, 72, 74, 76, 79, 81, 84], 'stars'),
    'war':       ([[37, 49, 56, 61], [38, 50, 53, 58]], 600, .55, 84, PHR, 'march'),
    'trial':     ([[38, 50, 53, 57, 62], [34, 46, 53, 58, 62], [36, 48, 51, 55, 60]], 800, .5, 72, PHR, 'tense'),
    'hemlock':   ([[38, 50, 57, 60], [34, 46, 53, 57], [33, 45, 52, 57], [38, 50, 57, 62]], 650, .45, 0, [62, 65, 67, 69, 72], 'sad'),
    'legacy':    ([[38, 50, 57, 62, 66, 69], [43, 55, 62, 67, 71], [45, 57, 64, 69, 73], [38, 50, 57, 64, 69, 74]], 1800, .6, 96, [62, 64, 66, 69, 71, 74, 76, 78, 81], 'bright'),
}
for c, a, b in bounds:
    chords, br, g, bpm, scale, mood = SEC[c]
    dur = b - a; step = dur / len(chords)
    for i, ch in enumerate(chords):
        x = pad(ch, step + 2.0, br, g); x *= fade_env(len(x), .3 if a == 0 and i == 0 else 1.5, 2.0); add(music, x, a + i * step, .45)
    if mood in ('dark', 'sad', 'stars', 'tense'): add(music, drone(dur + 1, 36.7 if mood in ('dark', 'tense') else 49), a, .3)
    if bpm:
        beat = 60 / bpm; k = 0; t0 = a + 1.2
        while t0 + k * beat / 2 < b - 1.5:
            at = t0 + k * beat / 2; pos = k % 8
            if mood in ('drive', 'party', 'march', 'warm', 'bright'):
                if pos in (0, 3) or (mood == 'party' and pos == 6): add(music, tympanon(.8 if pos == 0 else .55), at)
                if mood in ('party', 'drive') and pos % 2: add(music, krotala(.35), at)
                if mood == 'march' and pos == 4: add(music, boom(.5), at)
            if mood == 'play' and pos in (0, 3, 5):  # pizzicato lyre ostinato, 'thinking' feel
                add(music, lyreC(scale[(k // 2) % 4] - 12, .8), at, .35)
            if mood == 'tense' and pos in (0, 4): add(music, tympanon(.4), at)  # heartbeat
            k += 1
    # melodies: aulos for lively/dark chapters, lyre for intimate ones
    r = np.random.default_rng(abs(hash(c)) % 1000 + 7)
    motif = [int(v) for v in r.choice(scale, 5)]; at = a + 2.5; n = 0
    while at < b - 3:
        d = .36 if mood in ('party', 'drive') else .6
        for j, m in enumerate(motif):
            if mood == 'stars': add(music, bell(mtof(m + 12), 2.2), at + j * d, .1)
            elif mood in ('sad', 'warm', 'bright', 'play'): add(music, lyreC(m, 1.8), at + j * d, .28)
            else: add(music, aulos(mtof(m), d * 1.05), at + j * d, .1 if mood != 'dark' else .06)
        n += 1; motif = (motif[1:] + [int(r.choice(scale))]) if n % 2 else motif[::-1]
        at += len(motif) * d + r.uniform(3.0, 6.5)
# chapter stingers
for c, a, b in bounds[1:]:
    add(music, tympanon(1.0), a + .05); add(music, boom(.5), a + .05)
    for i, m in enumerate([74, 69, 62]): add(music, lyreC(m, 2.0), a + .1 + i * .07, .35)
add(music, boom(.8), .2); add(music, aulos(mtof(62), 3.0), .4, .12)
END = tl['voice_end'] + .4
add(music, boom(1.0), END); add(music, tympanon(1.1), END + .05)
for i, m in enumerate([62, 66, 69, 74, 78, 81]): add(music, lyreC(m, 2.4), END + .5 + i * .18, .4)

# ---------------- sound effects ----------------
def chirp(f0=3000, d=.12):
    t = tt(d); f = f0 * (1 + .5 * np.sin(np.pi * t / d)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
def birds(d, dens=1.0):
    out = np.zeros(int(d * SR)); k = 0.0
    while k < d - .5:
        f0 = rng.uniform(2400, 5000); nn = rng.integers(2, 5)
        for j in range(nn): x = chirp(f0 * rng.uniform(.9, 1.1), rng.uniform(.05, .12)); s = int((k + j * .13) * SR); out[s:s + len(x)] += x[:len(out) - s]
        k += rng.exponential(1 / dens)
    return out * fade_env(len(out), 1, 1)
def crickets(d):
    t = tt(d); return bp(rng.standard_normal(len(t)), 4200, 5600) * (np.sin(2 * np.pi * 28 * t) > .3) * (np.sin(2 * np.pi * .7 * t) > -.2) * fade_env(len(t), 1, 1)
def crowd(d, cheer=False, laugh=False):
    t = tt(d); x = sum(bp(rng.standard_normal(len(t)), f, f * 1.6) * (.6 + .4 * np.sin(2 * np.pi * rng.uniform(.2, .9) * t + rng.uniform(0, 6))) for f in (300, 550, 900, 1500))
    if laugh: x *= .4 + .9 * (np.sin(2 * np.pi * 6 * t) ** 2) * (np.sin(2 * np.pi * .25 * t) ** 2)
    if cheer: x *= .5 + 1.2 * np.exp(-((t - d * .35) / (d * .25)) ** 2)
    return x * fade_env(len(t), .5, .8)
def wind(d, lo=200, hi=900):
    t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * (.4 + .6 * np.sin(2 * np.pi * t / 6) ** 2) * fade_env(len(t), 1.5, 1.5)
def crackle(d):
    t = tt(d); x = hp(rng.standard_normal(len(t)), 1800) * (rng.random(len(t)) < .003) * 6 + lp(rng.standard_normal(len(t)), 500) * .4
    return x * fade_env(len(t), .4, .8)
def drip(): t = tt(.25); f = 1200 * (1 + 1.5 * np.exp(-t * 40)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25)
def whoosh(d=1.0):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); c = 20
    for k in range(c):
        a, b = k * n // c, (k + 1) * n // c; fc = 300 + 3000 * np.sin(np.pi * (k + .5) / c) ** 2
        out[a:b] = bp(x, fc * .6, fc * 1.6)[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
def rewind(d=6.0):  # tape-rewind sweep
    t = tt(d); f = 200 + 2400 * (t / d) ** 1.5; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + bp(rng.standard_normal(len(t)), 800, 6000) * .4
    return x * (.5 + .5 * np.sin(2 * np.pi * 14 * t) ** 2) * fade_env(len(t), .3, .8)
def wheel(d): t = tt(d); return bp(rng.standard_normal(len(t)), 120, 400) * (.7 + .3 * np.sin(2 * np.pi * 1.5 * t)) * fade_env(len(t), .5, .5)
def clink(f=3200): t = tt(.6); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 9) * np.minimum(1, t / .002)
def door(): t = tt(.5); return lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 10) + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 12)
def clang(): t = tt(1.2); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (3 + i)) for i, f in enumerate((420, 1130, 1870, 2650))) * np.minimum(1, t / .002) + bp(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t * 30)
def pebble(): t = tt(.12); return (bp(rng.standard_normal(len(t)), 1500, 5000) + np.sin(2 * np.pi * rng.uniform(1800, 2600) * t)) * np.exp(-t * 60)
def steps(d, rate=1.8):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .2:
        t = tt(.12); x = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 40); s = int(k * SR); out[s:s + len(x)] += x[:len(out) - s]; k += 1 / rate
    return out
def rooster():
    t = tt(1.6); f = np.interp(t, [0, .15, .3, .7, 1.2, 1.6], [500, 900, 800, 950, 700, 600]); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return bp(saw, 400, 3500) * (np.sin(np.pi * t / 1.6) ** .6) * (1 + .3 * np.sin(2 * np.pi * 30 * t))
def bellSchool(): return sum(bell(f, 1.5) for f in (1320, 1660)) * .5

# beds
add(sfx, crickets(S('o5')), 0, .1); add(sfx, wind(S('o5') - .5, 100, 400), 0, .25)
for k in range(5): add(sfx, drip(), S('o2') + 1.3 + k * 2.6, .25)
add(sfx, rewind(S('b1') - S('o5') - 1.5), S('o5') + .5, .3)
add(sfx, birds(S('a1') - S('b1') - 2, .8), S('b1'), .1); add(sfx, crackle(S('a1') - S('b2') - 2), S('b2'), .06)
add(sfx, crickets(S('a3') - S('a2') - .5), S('a2'), .08)
add(sfx, crowd(S('a4') - S('a3')), S('a3'), .14); add(sfx, steps(S('a4') - S('a3'), 2.2), S('a3'), .25)
add(sfx, wheel(S('s1') - S('a4') - 2), S('a4'), .2); add(sfx, crackle(S('s1') - S('a4') - 2), S('a4'), .1)
add(sfx, crowd(S('s9') - S('s1')), S('s1'), .08)
add(sfx, crowd(S('q1') - S('s9') - 2, laugh=True), S('s9'), .28)
add(sfx, birds(S('q8') - S('q1'), .6), S('q1'), .06)
add(sfx, birds(S('q11') - S('q9'), 1.0), S('q9'), .08)
add(sfx, crickets(S('y1') - S('q11') - 2), S('q11'), .07)
add(sfx, crowd(S('y5') - S('y1'), laugh=True), S('y1'), .08)
for k in range(4): add(sfx, clink(3000 + k * 300), S('y1') + 2 + k * 3.1, .25)
add(sfx, door(), S('y2') - .2, .6); add(sfx, steps(1.4, 3), S('y2'), .3)
add(sfx, clang(), S('y5') + .4, .35); add(sfx, clang(), S('y5') + 1.6, .25); add(sfx, crowd(3.0, cheer=True), S('y5') + .2, .15)
add(sfx, birds(S('r1') - S('y6') - 2, .6), S('y6') + 2.5, .08); add(sfx, steps(3, 1.8), S('y6') + 2.5, .25)
add(sfx, crowd(S('r2') - S('r1')), S('r1'), .06)
add(sfx, wind(S('r3') - S('r2'), 300, 1400), S('r2'), .3); add(sfx, bell(mtof(93), 3.0), S('r2') + .9, .2)
add(sfx, crowd(S('r7') - S('r6'), cheer=True), S('r6'), .35)
add(sfx, whoosh(1.2), S('w1') - .4, .3)
for k in range(int((S('w2') - S('w1')) * 1.2)): add(sfx, steps(.2, 5), S('w1') + 4.6 + k * .8, .4)
add(sfx, crickets(S('w4') - S('w3b')), S('w3b'), .08); add(sfx, steps(S('w4') - S('w3b'), 2.0), S('w3b'), .25)
add(sfx, wind(S('t1') - S('w4') - 2, 150, 600), S('w4'), .2)
add(sfx, crowd(S('t1b') - S('t1')), S('t1'), .18)
for k in range(int((S('t2') - S('t1b')) * 3)): add(sfx, pebble(), S('t1b') + 1 + k * .33, .3)
add(sfx, crowd(S('t5') - S('t2'), ), S('t2'), .06)
for k in range(5): add(sfx, drip(), S('t2') + 2 + k * 4.1, .15)
for k in range(40): add(sfx, pebble(), S('t5') + .5 + k * .09 + rng.uniform(0, .05), .25)
add(sfx, crowd(3.0, cheer=True), S('t6') - .4, .25)
for k in range(30): add(sfx, pebble(), S('t7') + .8 + k * .08 + rng.uniform(0, .05), .25)
add(sfx, crickets(S('c1') - S('h1') - 2), S('h1'), .06)
for k in range(8): add(sfx, drip(), S('h1') + 1.5 + k * 4.7, .2)
add(sfx, steps(2.0, 2.2), S('h4') + 1, .3)
add(sfx, rooster(), S('c1') - 1.6, .35)
add(sfx, bellSchool(), S('c2') - .2, .3); add(sfx, crowd(S('c3') - S('c2'), laugh=False), S('c2'), .06)
add(sfx, birds(S('c4') - S('c3'), 1.2), S('c3'), .1)
add(sfx, birds(TOTAL - S('c4'), .5), S('c4'), .06)
for kk in ('o5', 'b4', 'a1', 'q8', 'r9', 't1b', 't5', 'c1'):
    add(sfx, whoosh(.9), S(kk) - .45, .22)

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
bed = music * .3 * duck + sfx * .55 * (.6 + .4 * duck)
end = fade_env(N, .05, 1.5)
d = int(.011 * SR); bedR = np.zeros(N); bedR[d:] = bed[:-d]
st = np.stack([(vn + bed) * end, (vn + bedR) * end], 1)
st = np.tanh(st * 1.1) / np.tanh(1.1); st = st / np.abs(st).max() * .9
sf.write('mix_raw.wav', st.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', 'mix_raw.wav', '-af',
                'alimiter=level_in=1.5:limit=0.8:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/mix.wav'], check=True)
print('ok', round(TOTAL, 2))
