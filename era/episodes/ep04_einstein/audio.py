"""Original score + sound design for 'If You Were Einstein's Student' (8 min). All synthesized here.
Instruments: salon piano, violin (Einstein's own instrument), cello pad, celesta, pizzicato, clock-tick percussion.
SFX: café murmur, clinks, chalk, typewriter, Morse telegram, train, sea, fire, heartbeat, rewind.
Output: public/mix.wav (~ -14 LUFS), music ducked under dialogue."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json'))
TOTAL = tl['voice_end'] + 8
N = int(TOTAL * SR)
rng = np.random.default_rng(1905)
L = tl['lines']; K = {l['key']: l for l in L}
S = lambda k: K[k]['start']
E = lambda k: K[k]['end']
CH = {}
for l in L: CH.setdefault(l['chapter'], l['start'])
order = ['open', 'ad', 'academy', 'miracle', 'emc2', 'happy', 'eclipse', 'bohr', 'exile', 'legacy']
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
_pc = {}
def piano(m, d=1.8, g=1.0):
    k = (m, d)
    if k not in _pc:
        f = mtof(m); t = tt(d); x = np.zeros(len(t))
        for h in range(1, 9):
            fh = f * h * np.sqrt(1 + .0004 * h * h); x += np.sin(2 * np.pi * fh * t) * np.exp(-t * (1.2 + h * .9 + f / 900)) / h ** 1.1
        x += bp(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t * 80) * .08
        _pc[k] = x * np.minimum(1, t / .003) * fade_env(len(t), 0, .15)
    return _pc[k] * g
def violin(m, d=1.0, g=1.0, vib=1.0):
    f = mtof(m); t = tt(d); v = 1 + .005 * vib * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t / .35)
    ph = np.cumsum(f * v) / SR; saw = 2 * (ph % 1) - 1
    x = bp(saw, 250, 3800) * .6 + bp(saw, 2400, 3200) * .35 + bp(saw, 900, 1300) * .25 + bp(rng.standard_normal(len(t)), 2000, 7000) * .02
    return x * fade_env(len(t), min(.12, d * .3), min(.25, d * .4)) * g
def cello_pad(notes, dur, bright=900, g=1.0):
    t = tt(dur); x = np.zeros(len(t))
    for m in notes:
        for det in (-.06, .06):
            f = mtof(m) * 2 ** (det / 12); ph = np.cumsum(f * (1 + .003 * np.sin(2 * np.pi * 4.8 * t + rng.uniform(0, 6)))) / SR
            x += (2 * (ph % 1) - 1)
    x = lp(x, bright) * (.8 + .2 * np.sin(2 * np.pi * t / 7.3))
    return x / (np.abs(x).max() + 1e-9) * g
def celesta(m, d=1.6):
    f = mtof(m); t = tt(d); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 6)) * np.exp(-t * 2.4) * np.minimum(1, t / .002)
def pizz(m, g=1.0):
    f = mtof(m); t = tt(.5); return bp(np.sign(np.sin(2 * np.pi * f * t)) * .3 + np.sin(2 * np.pi * f * t), f * .8, f * 5) * np.exp(-t * 11) * g
def tick(hi=True):
    t = tt(.05); return bp(rng.standard_normal(len(t)), 2500 if hi else 1500, 6000 if hi else 3500) * np.exp(-t * 160)
def timp(g=1.0):
    t = tt(1.4); return (np.sin(2 * np.pi * 62 * (1 + .25 * np.exp(-t * 20)) * t) * np.exp(-t * 3) + lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 15) * .4) * g
def bass(m, d=.5):
    f = mtof(m); t = tt(d); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 4) * np.minimum(1, t / .005)

# ---------------- score: salon / Mozart-ish, G major with E minor & C minor shades ----------------
GM = [67, 69, 71, 72, 74, 76, 78, 79]; EM = [64, 66, 67, 69, 71, 72, 74, 76]; CM = [60, 62, 63, 65, 67, 68, 70, 72]
SEC = {  # chords (bass + triad), bright, gain, bpm, meter, scale, mood
    'open':    ([[40, 52, 59, 64, 67], [36, 48, 55, 60, 64], [38, 50, 57, 62, 66]], 700, .45, 0, 3, EM, 'night'),
    'ad':      ([[43, 55, 59, 62, 67], [48, 52, 55, 60, 64], [50, 54, 57, 62, 66], [43, 55, 59, 62, 67]], 1500, .45, 120, 3, GM, 'waltz'),
    'academy': ([[43, 55, 59, 62, 67], [40, 52, 55, 59, 64], [45, 52, 57, 60, 64], [50, 54, 57, 62, 66]], 1500, .45, 132, 3, GM, 'waltz'),
    'miracle': ([[40, 52, 55, 59, 64], [36, 48, 52, 55, 60], [43, 55, 59, 62, 67], [38, 50, 54, 57, 62]], 1300, .45, 108, 4, EM, 'tick'),
    'emc2':    ([[43, 55, 59, 62, 67], [45, 57, 60, 64, 69]], 1700, .45, 0, 4, GM + [81, 83], 'wonder'),
    'happy':   ([[43, 55, 59, 62, 67], [48, 55, 60, 64, 67], [50, 57, 62, 66, 69]], 1600, .45, 116, 4, GM, 'play'),
    'eclipse': ([[36, 48, 55, 60, 63], [41, 53, 56, 60, 65], [43, 55, 59, 62, 67], [48, 55, 60, 64, 67]], 1300, .5, 0, 4, CM, 'build'),
    'bohr':    ([[45, 57, 60, 64, 69], [50, 57, 62, 65, 69], [40, 52, 56, 59, 64]], 1300, .45, 104, 4, [69, 71, 72, 74, 76, 77, 80, 81], 'play'),
    'exile':   ([[36, 48, 51, 55, 60], [32, 44, 51, 56, 60], [31, 43, 50, 55, 62]], 650, .5, 66, 4, CM, 'dark'),
    'legacy':  ([[40, 52, 59, 64, 67], [36, 48, 55, 60, 64], [43, 55, 59, 62, 67], [38, 50, 57, 62, 66], [43, 55, 62, 67, 71]], 1700, .55, 0, 4, GM, 'wonder'),
}
for c, a, b in bounds:
    chords, br, g, bpm, meter, scale, mood = SEC[c]
    dur = b - a; step = dur / len(chords)
    for i, ch in enumerate(chords):
        x = cello_pad(ch[1:], step + 2.0, br, g); x *= fade_env(len(x), .4 if a == 0 and i == 0 else 1.5, 2.0); add(music, x, a + i * step, .32)
        if mood in ('night', 'dark', 'build', 'wonder'): add(music, piano(ch[0] - 12 if ch[0] > 40 else ch[0], 4.0), a + i * step + .1, .5)
    beat = 60 / bpm if bpm else 0
    if bpm:
        k = 0; t0 = a + 1.0
        while t0 + k * beat < b - 1.5:
            at = t0 + k * beat; pos = k % meter; ci = min(len(chords) - 1, int((at - a) / step)); ch = chords[ci]
            if mood == 'waltz':  # oom-pah-pah salon piano
                if pos == 0: add(music, piano(ch[0], 1.2), at, .7)
                else: [add(music, piano(m, .6), at, .3) for m in ch[2:5]]
            if mood in ('tick', 'play'):
                add(music, tick(pos == 0), at, .25)  # clockwork pulse — time is the theme
                if pos in (0, 2): add(music, pizz(ch[1] + (0 if pos == 0 else 7)), at, .45)
            if mood == 'dark' and pos == 0: add(music, timp(.6), at)
            k += 1
    # melodies: violin for warm chapters, celesta for wonder, piano for night
    r = np.random.default_rng(abs(hash(c)) % 1000 + 11)
    motif = [int(v) for v in r.choice(scale, 5)]; at = a + 2.4; n = 0
    while at < b - 3:
        d = beat if bpm else .55
        if mood == 'waltz': d = beat
        for j, m in enumerate(motif):
            if mood in ('wonder',): add(music, celesta(m + 12, 1.8), at + j * d, .14)
            elif mood in ('night', 'dark'): add(music, piano(m, 2.2), at + j * d * 1.4, .32)
            else: add(music, violin(m, d * 1.05, vib=1.2), at + j * d, .08)
        n += 1; motif = (motif[1:] + [int(r.choice(scale))]) if n % 2 else motif[::-1]
        at += len(motif) * d * (1.4 if mood in ('night', 'dark') else 1) + r.uniform(3.0, 6.0)
    if mood == 'build':  # eclipse: rising violin + timpani roll into the confirmation
        for kk in range(10): add(music, timp(.12 + kk * .04), S('s4') + 2 + kk * .5)
        add(music, violin(79, 3.0, vib=1.5), S('s5') - .1, .14); add(music, violin(83, 3.0, vib=1.5), S('s5') - .1, .1)
# chapter stingers: piano arpeggio + soft timpani
for c, a, b in bounds[1:]:
    add(music, timp(.5), a + .05)
    for i, m in enumerate([55, 62, 67, 71, 74]): add(music, piano(m, 2.4), a + .05 + i * .06, .45)
add(music, timp(.6), .2)
END = tl['voice_end'] + .4
add(music, timp(1.0), END)
for i, m in enumerate([55, 59, 62, 67, 71, 74, 79]): add(music, piano(m, 3.0), END + .3 + i * .12, .5)
add(music, violin(79, 3.5, vib=1.4), END + 1.2, .12)

# ---------------- sound effects ----------------
def crowd(d, laugh=False):
    t = tt(d); x = sum(bp(rng.standard_normal(len(t)), f, f * 1.6) * (.6 + .4 * np.sin(2 * np.pi * rng.uniform(.2, .9) * t + rng.uniform(0, 6))) for f in (300, 550, 900, 1500))
    if laugh: x *= .4 + .9 * (np.sin(2 * np.pi * 6 * t) ** 2) * (np.sin(2 * np.pi * .25 * t) ** 2)
    return x * fade_env(len(t), .5, .8)
def clink(f=3200): t = tt(.6); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 9) * np.minimum(1, t / .002)
def steps(d, rate=1.8):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .2:
        t = tt(.12); x = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 40); s = int(k * SR); out[s:s + len(x)] += x[:len(out) - s]; k += 1 / rate
    return out
def door(): t = tt(.6); return lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 10) + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 12)
def knock(): out = np.zeros(int(.8 * SR)); [add_local(out, lp(rng.standard_normal(int(.08 * SR)), 600) * np.exp(-tt(.08) * 50), k * .22) for k in range(3)]; return out
def add_local(buf, x, at):
    s = int(at * SR); e = min(len(buf), s + len(x)); buf[s:e] += x[:e - s]
def chalk(d):
    t = tt(d); x = bp(rng.standard_normal(len(t)), 2500, 7000) * (np.abs(np.sin(2 * np.pi * 3.2 * t)) ** 2) * (rng.random(len(t)) < .6)
    return x * fade_env(len(t), .05, .1)
def typewriter(d, rate=9):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .1:
        t = tt(.04); x = bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 140) + np.sin(2 * np.pi * 200 * t) * np.exp(-t * 90) * .5
        add_local(out, x, k); k += rng.exponential(1 / rate) + .03
    return out
def ding(): return celesta(96, 1.2) * .6
def morse(d):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .3:
        ln = .07 if rng.random() < .6 else .2; t = tt(ln); add_local(out, np.sin(2 * np.pi * 820 * t) * fade_env(len(t), .005, .005), k); k += ln + .07 + (.2 if rng.random() < .2 else 0)
    return out
def train(d):
    t = tt(d); x = lp(rng.standard_normal(len(t)), 500) * (.5 + .5 * np.sin(2 * np.pi * 2.2 * t) ** 8) + bp(rng.standard_normal(len(t)), 2000, 4000) * .05
    return x * fade_env(len(t), .5, .5)
def sea(d):
    t = tt(d); return lp(rng.standard_normal(len(t)), 900) * (.35 + .65 * np.sin(2 * np.pi * t / 5.5) ** 2) * fade_env(len(t), 1, 1)
def crackle(d):
    t = tt(d); x = hp(rng.standard_normal(len(t)), 1800) * (rng.random(len(t)) < .003) * 6 + lp(rng.standard_normal(len(t)), 500) * .4
    return x * fade_env(len(t), .4, .8)
def heartbeat(d, bpm=110):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .4:
        for o, g in ((0, 1), (.18, .7)): t = tt(.15); add_local(out, np.sin(2 * np.pi * 55 * t) * np.exp(-t * 30) * g, k + o)
        k += 60 / bpm
    return out
def rewind(d=6.0):
    t = tt(d); f = 200 + 2400 * (t / d) ** 1.5; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + bp(rng.standard_normal(len(t)), 800, 6000) * .4
    return x * (.5 + .5 * np.sin(2 * np.pi * 14 * t) ** 2) * fade_env(len(t), .3, .8)
def whoosh(d=1.0):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); c = 20
    for k in range(c):
        a, b = k * n // c, (k + 1) * n // c; fc = 300 + 3000 * np.sin(np.pi * (k + .5) / c) ** 2
        out[a:b] = bp(x, fc * .6, fc * 1.6)[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
def rustle(): t = tt(.5); return bp(rng.standard_normal(len(t)), 1500, 6000) * np.sin(np.pi * t / .5) ** 2 * (rng.random(len(t)) < .5)
def wind(d): t = tt(d); return bp(rng.standard_normal(len(t)), 200, 900) * (.4 + .6 * np.sin(2 * np.pi * t / 6) ** 2) * fade_env(len(t), 1.5, 1.5)
def clocktick(d):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .1: add_local(out, tick(int(k) % 2 == 0), k); k += 1.0
    return out

# beds & spots
add(sfx, clocktick(S('o5') - .2), .2, .3); add(sfx, wind(S('o5')), 0, .1)
add(sfx, rewind(S('d1') - S('o5') - 1.5), S('o5') + .5, .3)
add(sfx, crowd(S('d3') - S('d1')), S('d1'), .08); add(sfx, steps(S('d2') - S('d1'), 1.8), S('d1'), .25); add(sfx, rustle(), S('d2') - .3, .6)
add(sfx, knock(), S('d3') + .2, .7); add(sfx, door(), S('d3') + 1.1, .5); add(sfx, steps(1.6, 2.4), S('d3') + .3, .25)
add(sfx, clocktick(S('k1') - S('d7')), S('d7'), .18); add(sfx, clink(3400), S('d7') + 1.2, .25)
add(sfx, crowd(S('k9') - S('k1'), laugh=False), S('k1'), .04)
add(sfx, crowd(3.0, laugh=True), S('k5') + 1.4, .3); add(sfx, crowd(3.5, laugh=True), S('k8') + 2.6, .35)
for kk in range(5): add(sfx, clink(2800 + kk * 260), S('k1') + 3 + kk * 6.5, .2)
add(sfx, typewriter(S('k10') - S('k9') - .5, 6), S('k9') + .5, .12); add(sfx, clocktick(S('m1') - S('k9') - 2), S('k9'), .15)
add(sfx, door(), S('k10') - 1.2, .4); add(sfx, steps(1.4, 2.6), S('k10') - 1.0, .25)
add(sfx, crowd(S('m7') - S('m1'), laugh=False), S('m1'), .12)
for kk in range(6): add(sfx, clink(3000 + kk * 300), S('m1') + 1 + kk * 3.7, .18)
add(sfx, whoosh(1.4), S('m4') - .6, .3)
add(sfx, steps(4.2, 3.0), S('m7'), .3); add(sfx, typewriter(S('m9') - S('m7'), 5), S('m7'), .07)
add(sfx, train(E('m9') - S('m9') + .5), S('m9'), .3); add(sfx, clocktick(E('m9') - S('m9')), S('m9'), .35)
add(sfx, typewriter(S('m12') - S('m10'), 4), S('m10'), .06)
for kk in range(5): add(sfx, rustle(), S('m12') + .4 + kk * .5, .5)
add(sfx, clocktick(S('e5') - S('e1')), S('e1'), .12); add(sfx, rustle(), S('e1') - .2, .5)
add(sfx, chalk(1.5), S('e5') + .2, .25); add(sfx, chalk(1.0), S('e5') + 1.3, .2); add(sfx, timp(.6), S('e5') + 3.5)
add(sfx, typewriter(S('h2') - S('h1'), 5), S('h1'), .08); add(sfx, whoosh(1.2), S('h6') - .5, .3)
add(sfx, chalk(2.0), S('h8') + .3, .25); add(sfx, chalk(1.4), S('h10') + .2, .25)
add(sfx, chalk(2.5), S('s1') + .3, .18); add(sfx, heartbeat(S('s3') - S('s2'), 118), S('s2'), .5)
add(sfx, sea(S('s6') - S('s4')), S('s4'), .3); add(sfx, wind(S('s6') - S('s4')), S('s4'), .15)
add(sfx, morse(2.4), S('s6') - 2.4, .18); add(sfx, door(), S('s6') - .1, .45); add(sfx, steps(1.2, 3.5), S('s6'), .3)
add(sfx, rustle(), S('s8') + .1, .7); add(sfx, crowd(S('s9') - S('s8')), S('s8'), .1)
add(sfx, crowd(S('q5') - S('q1')), S('q1'), .08)
for kk in range(4): add(sfx, clink(3300 + kk * 200), S('q5') + 1 + kk * 4.5, .2)
add(sfx, crowd(3.0, laugh=True), S('q4') + 1.6, .3); add(sfx, steps(S('x1') - S('q8'), 2.0), S('q8'), .25)
add(sfx, steps(5, 1.8), S('x1'), .25); add(sfx, wind(S('x3') - S('x1')), S('x1'), .08)
add(sfx, crackle(S('x4') - S('x3')), S('x3'), .35)
add(sfx, sea(S('x8') - S('x4')), S('x4'), .2)
add(sfx, typewriter(6.5, 10), S('x8') + .8, .3); add(sfx, ding(), S('x8') + 7.3, .4)
add(sfx, clocktick(S('c3') - S('c1')), S('c1'), .25)
add(sfx, whoosh(1.0), S('c3') - .4, .25); add(sfx, clocktick(S('c6') - S('c5a')), S('c5a'), .15)
add(sfx, crowd(TOTAL - S('c6')), S('c6'), .06); add(sfx, steps(TOTAL - S('c6') - 2, 1.6), S('c6'), .2)
for kk in ('o5', 'm4', 'm9', 'm12', 'e5', 'h6', 's1', 's3', 's8', 'q2', 'x8', 'c3', 'c4'):
    add(sfx, whoosh(.9), S(kk) - .45, .2)

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
bed = music * .32 * duck + sfx * .5 * (.6 + .4 * duck)
end = fade_env(N, .05, 1.5)
d = int(.011 * SR); bedR = np.zeros(N); bedR[d:] = bed[:-d]
st = np.stack([(vn + bed) * end, (vn + bedR) * end], 1)
st = np.tanh(st * 1.1) / np.tanh(1.1); st = st / np.abs(st).max() * .9
sf.write('mix_raw.wav', st.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', 'mix_raw.wav', '-af',
                'alimiter=level_in=1.5:limit=0.8:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/mix.wav'], check=True)
print('ok', round(TOTAL, 2))
