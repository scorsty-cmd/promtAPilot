"""Original score + sound design for the dinosaur-era Short. All sounds are synthesized here.
Output: public/mix.wav (mastered to about -14 LUFS)."""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
tl = json.load(open('src/timeline.json'))
TOTAL = tl['voice_end'] + 1.2
N = int(TOTAL * SR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(66)

def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env_ad(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(d, 1e-4))
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def seg(t0, t1): return slice(int(t0 * SR), min(N, int(t1 * SR)))
def fade_env(n, fi, fo):
    e = np.ones(n); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[n - b:] = np.minimum(e[n - b:], np.linspace(1, 0, b))
    return e

music = np.zeros(N); sfx = np.zeros(N)
def add(buf, x, at, g=1.0):
    s = int(at * SR)
    if s >= N: return
    if s < 0: x = x[-s:]; s = 0
    e = min(N, s + len(x)); buf[s:e] += x[:e - s] * g

# ---------------- score ----------------
def pad(notes, dur, bright=900, detune=.12, g=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in notes:
        for d in (-detune, 0, detune):
            f = mtof(m) * 2 ** (d / 12); ph = rng.uniform(0, 6.28)
            for h in range(1, 8): x += np.sin(2 * np.pi * f * h * t + ph * h) / h ** 1.2
    x = lp(x, bright); return x / (np.abs(x).max() + 1e-9) * g
# chord plan: (start, end, notes, brightness, gain) — modal, earthy, "frame drum + flute" Ice Age feel (A dorian)
PLAN = [
    (0.0, 3.9, [45, 57, 64, 69, 71], 900, .5),
    (3.85, 9.9, [45, 57, 64, 66, 69], 1200, .55),
    (9.87, 14.0, [41, 53, 60, 64], 600, .4),
    (13.96, 23.1, [43, 55, 62, 66, 71], 1100, .55),
    (23.08, 28.2, [38, 50, 57, 62, 65], 900, .6),
    (28.23, 33.7, [45, 57, 64, 67], 800, .45),
    (33.73, 43.6, [41, 53, 60, 65, 69], 1300, .55),
    (43.55, TOTAL, [45, 57, 64, 69, 73], 1500, .6),
]
for a, b, notes, br, g in PLAN:
    x = pad(notes, b - a + 1.5, br, g=g); x *= fade_env(len(x), .3 if a == 0 else 1.0, 1.5); add(music, x, a, .5)
def thump(f0=55, d=.35, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * (1 + .6 * np.exp(-t * 30)) * t) * np.exp(-t * 12) * g
def frame_drum(d=.4, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 95 * (1 + .3 * np.exp(-t * 40)) * t) * np.exp(-t * 9) + bp(rng.standard_normal(n), 300, 2000) * np.exp(-t * 25) * .4) * g
# walking drum groove for travel/hunt sections
for s0, s1, bpm in ((3.85, 9.8, 100), (13.96, 23.0, 104), (23.08, 26.5, 120)):
    k = 0; step = 60 / bpm
    while s0 + k * step < s1:
        add(music, frame_drum(.4, .7 if k % 4 == 0 else .4), s0 + k * step); k += 1
# bone-flute melody (breathy sine with vibrato)
def flute(f, d=.6):
    n = int(d * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t + .4 * np.sin(2 * np.pi * 5.5 * t)) + bp(rng.standard_normal(n), f * .8, f * 1.3) * .25
    return x * fade_env(n, .06, .2)
for i, m in enumerate([69, 72, 74, 76, 74, 72, 69]): add(music, flute(mtof(m), .5), .4 + i * .48, .18)
for i, m in enumerate([76, 79, 81, 79, 76, 74, 76, 81]): add(music, flute(mtof(m), .55), 33.9 + i * .52, .16)
for i, m in enumerate([69, 72, 76, 81]): add(music, flute(mtof(m), .9), 44.0 + i * .9, .16)
def bell(f, d=2.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)) * np.exp(-t * 1.8) * np.minimum(1, t / .004)
add(music, thump(40, 1.5, 1.2), 48.0, .9)

# ---------------- sound effects ----------------
def whoosh(d=1.0):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); c = 24
    for k in range(c):
        a, b = k * n // c, (k + 1) * n // c; fc = 300 + 3500 * np.sin(np.pi * (k + .5) / c) ** 2
        out[a:b] = bp(x, fc * .6, min(fc * 1.6, 20000))[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
def wind(d, lo=200, hi=900):
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), lo, hi) * (.4 + .6 * np.sin(2 * np.pi * t / 6) ** 2) * fade_env(n, 1, 1)
def crackle(d):
    n = int(d * SR); x = hp(rng.standard_normal(n), 1800) * (rng.random(n) < .003) * 6 + lp(rng.standard_normal(n), 500) * .4
    return x * fade_env(n, .3, .8)
def click(f=2500, d=.05):
    n = int(d * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + bp(rng.standard_normal(n), 1500, 6000)) * np.exp(-t * 90)
def crunch(d=.18):
    n = int(d * SR); return bp(rng.standard_normal(n), 800, 4000) * np.exp(-np.arange(n) / SR * 25) * (rng.random(n) < .3)
def trumpet(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR; f = 420 + 160 * np.sin(np.pi * t / d) + 30 * np.sin(2 * np.pi * 6 * t)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return (bp(saw, 300, 1800) + bp(rng.standard_normal(n), 800, 2500) * .3) * fade_env(n, .08, .5)
def stomp(): return thump(38, .7, 1.0) + lp(rng.standard_normal(int(.7 * SR)), 200) * np.exp(-np.arange(int(.7 * SR)) / SR * 6) * .5
def pop(f=900): n = int(.12 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * (1 + 2 * np.exp(-t * 40)) * t) * np.exp(-t * 30)
def spray(d):
    n = int(d * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n), 3500) * (.6 + .4 * np.sin(2 * np.pi * 3 * t) ** 2) * fade_env(n, .1, .2)
def chime(): return bell(mtof(88), 1.6)

add(sfx, wind(4.2, 300, 1100), 0, .25); add(sfx, chime(), .2, .25); add(sfx, pop(700), 2.0, .4)
add(sfx, whoosh(.7), 3.5, .3); add(sfx, wind(6.2, 250, 1000), 3.85, .2)
for k in range(10): add(sfx, crunch(), 4.0 + k * .3, .25)
for k in range(7): add(sfx, pop(600 + k * 70), 6.7 + k * .25, .25)
add(sfx, whoosh(.7), 9.5, .3); add(sfx, wind(4.1, 200, 700), 9.87, .3); add(sfx, bell(mtof(64), 2.5), 10.9, .25)
for k in range(5): add(sfx, click(3000), 14.1 + k * .12, .5)
add(sfx, crackle(1.8), 14.7, .6); add(sfx, whoosh(.5), 15.5, .3)
for k in range(5): add(sfx, crunch(), 15.7 + k * .2, .4)
for k in range(8): add(sfx, click(5000, .03), 17.1 + k * .22, .25)
add(sfx, wind(4.2, 300, 2200), 18.93, .6)
for k in range(8): add(sfx, crunch(), 19.0 + k * .5, .3)
add(sfx, stomp(), 23.3, .6); add(sfx, stomp(), 23.9, .7); add(sfx, trumpet(1.5), 24.6, .6)
add(sfx, whoosh(1.2), 26.4, .4)
add(sfx, crackle(5.6), 28.2, .5)
for k in range(4): add(sfx, pop(500 + k * 150), 33.8 + k * 1.1, .35)
add(sfx, whoosh(.6), 38.5, .3); add(sfx, thump(70, .3, .6), 39.6); add(sfx, spray(2.2), 39.9, .45)
add(sfx, whoosh(1.0), 43.2, .35); add(sfx, chime(), 44.0, .3)
# ---------------- voice + mix ----------------
v, vsr = sf.read('public/vo.wav'); v = resample_poly(v, SR, vsr)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
voice = hp(voice, 70)
k = int(.3 * SR); env = np.convolve(np.abs(voice), np.ones(256) / 256, 'same')
env = np.interp(np.arange(N), np.arange(0, N, 480), np.maximum.reduceat(env, np.arange(0, N, 480)))
env = np.clip(env / (env.max() * .2 + 1e-9), 0, 1)
duck = 1 - .6 * np.convolve(env, np.ones(4800) / 4800, 'same')
music /= np.abs(music).max() + 1e-9; sfx /= np.abs(sfx).max() + 1e-9
mix = voice / (np.abs(voice).max() + 1e-9) + music * .32 * duck + sfx * .55 * (.55 + .45 * duck)
end = fade_env(N, .05, 1.5); mix *= end
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
d = int(.011 * SR); right = mix.copy(); right[d:] = (voice / (np.abs(voice).max() + 1e-9))[d:] + (music * .32 * duck + sfx * .55 * (.55 + .45 * duck))[:-d] * end[d:]
st = np.stack([mix, right], 1); st = st / np.abs(st).max() * .9
sf.write('mix_raw.wav', st.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', 'mix_raw.wav', '-af',
                'alimiter=level_in=1.5:limit=0.8:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '48000', 'public/mix.wav'], check=True)
print('ok', round(TOTAL, 2))
