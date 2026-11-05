"""Original score + sound design for 'If You Were Born Maya' (8 min). Everything synthesized here.
Instruments: clay ocarina, turtle-shell drum, slit drum (tunkul), seed rattles, conch trumpet, low drone.
Output: public/mix.wav (about -14 LUFS)."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json'))
TOTAL = tl['voice_end'] + 1.2
N = int(TOTAL * SR)
rng = np.random.default_rng(750)
L = tl['lines']
CH = {}
for l in L: CH.setdefault(l['chapter'], l['start'])
order = ['open', 'birth', 'home', 'city', 'maize', 'ball', 'fear', 'sky', 'kings', 'rain', 'today']
bounds = [(c, CH[c] - (1.9 if c != 'open' else 0.3), (CH[order[i + 1]] - 1.9) if i + 1 < len(order) else TOTAL) for i, c in enumerate(order)]
bounds[0] = ('open', 0.0, bounds[0][2])

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
        for d in (-.1, 0, .1):
            f = mtof(m) * 2 ** (d / 12); ph = rng.uniform(0, 6.28)
            for h in range(1, 6): x += np.sin(2 * np.pi * f * h * t + ph * h) / h ** 1.3
    x *= .8 + .2 * np.sin(2 * np.pi * t / 7.3)
    x = lp(x, bright); return x / (np.abs(x).max() + 1e-9) * g
def ocarina(f, d=.5):  # clay flute: pure tone, breath chiff, slow vibrato
    t = tt(d); vib = .25 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / .25)
    x = np.sin(2 * np.pi * f * t + vib) + .12 * np.sin(4 * np.pi * f * t) + bp(rng.standard_normal(len(t)), f * .9, f * 1.2) * .18
    x += bp(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t * 40) * .3
    return x * fade_env(len(t), .04, min(.2, d * .4))
def shell(g=1.0):  # turtle-shell drum struck with antler: woody "tok"
    t = tt(.25); x = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 45) + .6 * np.sin(2 * np.pi * 690 * t) * np.exp(-t * 60)
    return (x + bp(rng.standard_normal(len(t)), 900, 4000) * np.exp(-t * 90) * .5) * g
def tunkul(f=110, g=1.0):  # slit drum
    t = tt(.6); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.4 * t) * np.exp(-t * 12)) * np.exp(-t * 7) * np.minimum(1, t / .003) * g
def huehuetl(g=1.0):  # deep skin drum
    t = tt(.8); return (np.sin(2 * np.pi * 62 * (1 + .5 * np.exp(-t * 25)) * t) * np.exp(-t * 5) + lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 20) * .4) * g
def rattle(d=.12, g=1.0):
    t = tt(d); return hp(rng.standard_normal(len(t)), 4000) * (rng.random(len(t)) < .35) * np.sin(np.pi * t / d) ** .5 * g
def conch(d=2.2, f=196, g=1.0):
    t = tt(d); fr = f * (1 + .03 * np.sin(np.pi * t / d) - .02 * np.exp(-t * 6)) + 2 * np.sin(2 * np.pi * 5 * t)
    ph = np.cumsum(fr) / SR; saw = 2 * (ph % 1) - 1
    x = bp(saw, 150, 1400) + bp(rng.standard_normal(len(t)), f, f * 4) * .15
    return x * fade_env(len(t), .25, .7)
def drone(d, f=55):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t * (1 + .002 * k)) / k for k in (1, 2, 3, 5))
    return lp(x, 400) * (.7 + .3 * np.sin(2 * np.pi * t / 9)) * fade_env(len(t), 2, 2)
def bell(f, d=2.5):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)) * np.exp(-t * 1.8) * np.minimum(1, t / .004)

# ---------------- score: one section per chapter ----------------
# D minor pentatonic / dorian colours. (chords, brightness, gain, bpm or 0, melody scale, mood)
PENT = [62, 65, 67, 69, 72, 74, 77, 79, 81]
SEC = {
    'open':  ([[38, 50, 57, 62, 69], [41, 53, 60, 65, 72]], 1200, .55, 92, PENT, 'warm'),
    'birth': ([[38, 50, 57, 64, 69], [43, 55, 62, 67, 71]], 900, .45, 0, PENT, 'soft'),
    'home':  ([[41, 53, 60, 65, 69], [38, 50, 57, 62, 69], [43, 55, 62, 67, 74]], 1100, .5, 96, PENT, 'warm'),
    'city':  ([[38, 50, 57, 62, 69, 74], [36, 48, 55, 62, 67], [41, 53, 60, 65, 72]], 1500, .55, 108, PENT, 'grand'),
    'maize': ([[43, 55, 62, 67, 71], [41, 53, 60, 64, 69], [38, 50, 57, 62, 69]], 1200, .5, 100, PENT, 'warm'),
    'ball':  ([[38, 50, 57, 62, 69], [36, 48, 55, 60, 67]], 1600, .6, 126, PENT, 'drive'),
    'fear':  ([[37, 49, 56, 61], [38, 50, 53, 58]], 500, .5, 0, [61, 62, 65, 68, 70, 73], 'dark'),
    'sky':   ([[38, 50, 57, 64, 69, 76], [34, 46, 53, 62, 69, 74]], 1800, .45, 0, [69, 72, 74, 76, 79, 81, 84], 'stars'),
    'kings': ([[38, 50, 57, 62, 65], [34, 46, 53, 58, 65], [36, 48, 55, 60, 67]], 1000, .6, 84, PENT, 'grand'),
    'rain':  ([[38, 50, 57, 60], [34, 46, 53, 57], [33, 45, 52, 57]], 600, .45, 0, [62, 65, 67, 69, 72], 'sad'),
    'today': ([[38, 50, 57, 62, 66, 69], [43, 55, 62, 67, 71], [45, 57, 64, 69, 73], [38, 50, 57, 64, 69, 74]], 1700, .6, 100, [62, 64, 66, 69, 71, 74, 76, 78, 81], 'bright'),
}
for c, a, b in bounds:
    chords, br, g, bpm, scale, mood = SEC[c]
    dur = b - a; step = dur / len(chords)
    for i, ch in enumerate(chords):
        x = pad(ch, step + 2.0, br, g); x *= fade_env(len(x), .3 if a == 0 and i == 0 else 1.5, 2.0); add(music, x, a + i * step, .5)
    if mood in ('dark', 'sad', 'stars'): add(music, drone(dur + 1, 36.7 if mood == 'dark' else 49), a, .35 if mood == 'dark' else .2)
    # percussion groove
    if bpm:
        beat = 60 / bpm; k = 0; t0 = a + 1.2
        while t0 + k * beat / 2 < b - 1.5:
            at = t0 + k * beat / 2; pos = k % 8
            if pos in (0, 5): add(music, huehuetl(.8 if pos == 0 else .5), at)
            if pos in (2, 6) or (mood == 'drive' and pos in (3, 7)): add(music, shell(.5), at)
            if mood in ('drive', 'grand', 'warm', 'bright'): add(music, rattle(.09, .22 if pos % 2 else .12), at)
            if mood == 'grand' and pos == 4: add(music, tunkul(98, .5), at)
            k += 1
    # ocarina phrases: four-bar motifs, seeded per chapter so each chapter has its own tune
    r = np.random.default_rng(hash(c) % 1000)
    motif = list(r.choice(scale, 5)); at = a + 2.5; n = 0
    while at < b - 3:
        for j, m in enumerate(motif):
            d = .42 if mood in ('drive',) else .62
            if mood == 'stars': add(music, bell(mtof(m + 12), 2.2), at + j * d, .12)
            else: add(music, ocarina(mtof(m), d * 1.1), at + j * d, .13 if mood != 'dark' else .08)
        n += 1; motif = motif[1:] + [int(r.choice(scale))] if n % 2 else motif[::-1]
        at += len(motif) * (.42 if mood == 'drive' else .62) + r.uniform(3.5, 7.0)
# chapter stingers (on chapter cards) + opening/ending conch
for c, a, b in bounds[1:]:
    add(music, huehuetl(1.0), a + .05); add(music, tunkul(147, .7), a + .05); add(music, conch(1.6, 196 if c not in ('fear', 'rain') else 175), a + .15, .3)
add(music, conch(3.0, 196), .3, .35); add(music, conch(2.5, 262), 2.0, .25)
add(music, conch(3.5, 196), 486.4, .4); add(music, huehuetl(1.2), 486.45)
for i, m in enumerate([74, 77, 79, 81, 86]): add(music, ocarina(mtof(m), .7), 487.2 + i * .55, .2)

# ---------------- sound effects ----------------
def chirp(f0=3000, d=.12):
    t = tt(d); f = f0 * (1 + .5 * np.sin(np.pi * t / d)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
def birds(d, dens=1.2):
    out = np.zeros(int(d * SR)); k = 0.0
    while k < d - .5:
        f0 = rng.uniform(2200, 5200); nn = rng.integers(2, 6)
        for j in range(nn): x = chirp(f0 * rng.uniform(.9, 1.1), rng.uniform(.05, .14)); s = int((k + j * .13) * SR); out[s:s + len(x)] += x[:len(out) - s]
        k += rng.exponential(1 / dens)
    return out * fade_env(len(out), 1, 1)
def insects(d):
    t = tt(d); return bp(rng.standard_normal(len(t)), 4200, 6500) * (.5 + .5 * np.sin(2 * np.pi * 17 * t) ** 2) * fade_env(len(t), 1.5, 1.5)
def wind(d, lo=200, hi=900):
    t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * (.4 + .6 * np.sin(2 * np.pi * t / 6) ** 2) * fade_env(len(t), 1.5, 1.5)
def crackle(d):
    t = tt(d); x = hp(rng.standard_normal(len(t)), 1800) * (rng.random(len(t)) < .003) * 6 + lp(rng.standard_normal(len(t)), 500) * .4
    return x * fade_env(len(t), .4, .8)
def crowd(d, cheer=False):
    t = tt(d); x = sum(bp(rng.standard_normal(len(t)), f, f * 1.6) * (.6 + .4 * np.sin(2 * np.pi * rng.uniform(.2, .9) * t + rng.uniform(0, 6))) for f in (300, 550, 900, 1500))
    if cheer: x *= .5 + 1.2 * np.exp(-((t - d * .35) / (d * .25)) ** 2)
    return x * fade_env(len(t), .5, .8)
def bark():
    t = tt(.22); f = 520 * (1 + .4 * np.exp(-t * 20)); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return bp(saw + .5 * rng.standard_normal(len(t)), 400, 2500) * np.exp(-t * 14) * np.minimum(1, t / .01)
def gobble():
    t = tt(.7); f = 700 + 250 * np.sign(np.sin(2 * np.pi * 14 * t)); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return bp(saw, 500, 2500) * fade_env(len(t), .03, .2)
def grind(d):  # mano on metate: rhythmic scrape
    t = tt(d); return bp(rng.standard_normal(len(t)), 500, 2500) * np.sin(np.pi * ((t * .9) % 1)) ** 2 * fade_env(len(t), .3, .5)
def ballhit(): t = tt(.35); return np.sin(2 * np.pi * 85 * (1 + .8 * np.exp(-t * 40)) * t) * np.exp(-t * 14) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 40) * .5
def growl(d=2.0):
    t = tt(d); f = 70 + 25 * np.sin(2 * np.pi * 3 * t); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return lp(saw * (1 + .5 * rng.standard_normal(len(t))), 700) * (np.sin(2 * np.pi * 7 * t) ** 2 * .5 + .5) * fade_env(len(t), .4, .6)
def hiss(d=1.2): t = tt(d); return hp(rng.standard_normal(len(t)), 3500) * fade_env(len(t), .15, .5)
def howler(d=2.5):
    t = tt(d); f = 180 + 120 * np.sin(np.pi * t / d) + 20 * np.sin(2 * np.pi * 4 * t); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return bp(saw, 150, 1200) * (.6 + .4 * np.sin(2 * np.pi * 2.2 * t) ** 2) * fade_env(len(t), .4, .8)
def pour(d=1.6): t = tt(d); return bp(rng.standard_normal(len(t)), 600, 3000) * (.6 + .4 * np.sin(2 * np.pi * 9 * t) ** 2) * fade_env(len(t), .1, .4)
def click(f=2500, d=.05): t = tt(d); return (np.sin(2 * np.pi * f * t) + bp(rng.standard_normal(len(t)), 1500, 6000)) * np.exp(-t * 90)
def whoosh(d=1.0):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); c = 20
    for k in range(c):
        a, b = k * n // c, (k + 1) * n // c; fc = 300 + 3000 * np.sin(np.pi * (k + .5) / c) ** 2
        out[a:b] = bp(x, fc * .6, fc * 1.6)[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
def rainfall(d): t = tt(d); return (hp(rng.standard_normal(len(t)), 2000) * .5 + bp(rng.standard_normal(len(t)), 400, 1500) * .3) * fade_env(len(t), 2, 2)
def thunder(): t = tt(3.5); return lp(rng.standard_normal(len(t)), 180) * np.exp(-t * 1.1) * (1 + 2 * np.exp(-t * 6))
def babycry(d=1.2):
    t = tt(d); f = 420 + 80 * np.sin(np.pi * t / d); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return bp(saw, 400, 3000) * np.sin(np.pi * t / d) * (.7 + .3 * np.sin(2 * np.pi * 3 * t))

# ambience beds
add(sfx, birds(24.6, 1.0), 0, .14)
add(sfx, birds(113 - 24.6, .8), 24.6, .12)
add(sfx, birds(164.6 - 113, .6), 113, .1); add(sfx, crowd(127.2 - 113), 113, .1)
add(sfx, birds(232 - 164.6, 1.0), 164.6, .12)
add(sfx, crowd(263.4 - 232.2), 232.2, .12)
add(sfx, insects(287.6 - 263.4), 263.4, .06); add(sfx, wind(287.6 - 270.4, 80, 300), 270.4, .3)
add(sfx, insects(339 - 287.6), 287.6, .07)
add(sfx, crowd(346.8 - 339), 339, .07)
add(sfx, wind(434.4 - 382.7, 150, 700), 382.7, .35)
add(sfx, birds(486.3 - 434.4, 1.2), 434.4, .14)
# spot effects
add(sfx, whoosh(.8), 4.6, .3); add(sfx, click(2200), 5.6, .3); add(sfx, click(1800), 5.9, .3)
add(sfx, babycry(1.3), 26.0, .25); add(sfx, rainfall(4.4), 24.6, .12)
add(sfx, crackle(78.4 - 67), 67, .12)
for k, at in enumerate((85.6, 86.0, 86.5, 89.6, 90.0)): add(sfx, bark(), at, .35)
add(sfx, gobble(), 87.4, .3); add(sfx, gobble(), 91.0, .25); add(sfx, crackle(4.0), 89.2, .3)
add(sfx, whoosh(1.2), 112.4, .3)
for k in range(4): add(sfx, click(1400 + k * 200, .06), 157.4 + k * .9, .2)
add(sfx, grind(9.0), 188.2, .4)
add(sfx, pour(1.8), 210.8, .4); add(sfx, pour(1.2), 213.0, .3)
for k in range(10): add(sfx, click(2600 + 300 * (k % 3), .04), 218.0 + k * .2 + rng.uniform(0, .05), .25)
for at in (234.5, 237.0, 240.6, 242.8, 244.9, 248.0, 251.0, 255.2): add(sfx, ballhit(), at, .55)
add(sfx, crowd(5.0, True), 247.0, .5); add(sfx, crowd(4.0, True), 255.5, .4)
add(sfx, growl(2.4), 265.0, .45); add(sfx, hiss(1.4), 267.8, .25); add(sfx, howler(2.6), 279.6, .3)
add(sfx, whoosh(1.4), 270.2, .3)
for k in range(3): add(sfx, bell(mtof(93 + 2 * k), 1.5), 300.8 + k * 1.6, .1)
add(sfx, crackle(5.4), 333.6, .55); add(sfx, whoosh(1.0), 333.4, .3)
for k in range(6): add(sfx, tunkul(110 if k % 2 else 82, .4), 356.0 + k * 1.1, 1)
add(sfx, rainfall(3.0), 379.0, .15); add(sfx, thunder(), 380.2, .35)
add(sfx, whoosh(1.4), 433.6, .3)
add(sfx, bell(mtof(86), 2.0), 486.5, .25)

# ---------------- voice + mix ----------------
v, vsr = sf.read('public/vo.wav')
if v.ndim > 1: v = v.mean(1)
v = resample_poly(v, SR, vsr)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]; voice = hp(voice, 70)
env = np.convolve(np.abs(voice), np.ones(256) / 256, 'same')
idx = np.arange(0, N, 480); env = np.interp(np.arange(N), idx, np.maximum.reduceat(env, idx))
env = np.clip(env / (np.percentile(env, 99) * .3 + 1e-9), 0, 1)
duck = 1 - .55 * np.convolve(env, np.ones(9600) / 9600, 'same')
music /= np.abs(music).max() + 1e-9; sfx /= np.abs(sfx).max() + 1e-9
vn = voice / (np.abs(voice).max() + 1e-9)
bed = music * .34 * duck + sfx * .6 * (.6 + .4 * duck)
end = fade_env(N, .05, 1.5)
d = int(.011 * SR); bedR = np.zeros(N); bedR[d:] = bed[:-d]
st = np.stack([(vn + bed) * end, (vn + bedR) * end], 1)
st = np.tanh(st * 1.1) / np.tanh(1.1); st = st / np.abs(st).max() * .9
sf.write('mix_raw.wav', st.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', 'mix_raw.wav', '-af',
                'alimiter=level_in=1.5:limit=0.8:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/mix.wav'], check=True)
print('ok', round(TOTAL, 2))
