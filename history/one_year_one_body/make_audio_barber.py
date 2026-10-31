import json
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, resample_poly

SR = 48000; FPS = 30; DUR = 12.0; N = int(SR * DUR)
rng = np.random.default_rng(11)
t = np.arange(N) / SR
out = np.zeros(N)
FREEZE = 322

def lp(x, fc): b, a = butter(2, fc / (SR / 2), 'low'); return lfilter(b, a, x)
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def add(sig, frame, gain=1.0):
    i = int(frame / FPS * SR); j = min(N, i + len(sig))
    if i < N: out[i:j] += sig[: j - i] * gain
def env(n, tau): return np.exp(-np.arange(n) / (tau * SR))

until = int(FREEZE / FPS * SR)
# room tone + candle crackle (stops at freeze)
room = lp(rng.standard_normal(N), 260); room /= np.abs(room).max()
out[:until] += room[:until] * 0.06
for k in range(70):
    fr = rng.uniform(0, FREEZE - 5)
    n = int(0.02 * SR)
    add(bp(rng.standard_normal(n), 1500, 6000) * env(n, 0.004), fr, 0.18 * rng.uniform(0.3, 1))

# nervous chair creaks with the knee bounce (S1)
for fr in [10, 32, 54]:
    n = int(0.25 * SR); tt = np.arange(n) / SR
    creak = np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 9 * tt)) * tt) * env(n, 0.08)
    add(lp(creak + 0.3 * rng.standard_normal(n) * env(n, 0.05), 1200), fr, 0.18)

# metallic shing on the pliers glint (118) and second glint (300)
for fr, g in [(116, 0.22), (300, 0.12)]:
    n = int(0.9 * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f0 * tt) * a for f0, a in [(2637, 1), (3520, 0.6), (5274, 0.35)]) * env(n, 0.25)
    add(s, fr, g)

# heartbeat in Tom's close-up (190-322)
for fr in range(200, FREEZE, 17):
    for off, g in [(0, 0.6), (4, 0.4)]:
        n = int(0.3 * SR); tt = np.arange(n) / SR
        add(np.sin(2 * np.pi * (58 - 20 * tt) * tt) * env(n, 0.07), fr + off, g)

# fear sting when Tom's eyes pop (212)
n = int(0.6 * SR); tt = np.arange(n) / SR
add((np.sin(2 * np.pi * 880 * tt) + np.sin(2 * np.pi * 932 * tt)) * env(n, 0.18) * 0.5, 212, 0.25)

# gulp (250)
n = int(0.22 * SR); tt = np.arange(n) / SR
gulp = np.sin(2 * np.pi * (420 - 1300 * tt) * tt) * np.sin(np.pi * tt / tt[-1]) ** 2
add(lp(gulp, 900), 251, 0.45)

# footsteps of the barber (294-320)
for fr in [297, 309]:
    n = int(0.12 * SR)
    add(lp(rng.standard_normal(n), 500) * env(n, 0.03) + np.sin(2 * np.pi * 90 * np.arange(n) / SR) * env(n, 0.04), fr, 0.45)

# record scratch on the freeze (322)
n = int(0.45 * SR); tt = np.arange(n) / SR
scr = bp(rng.standard_normal(n), 400, 4000) * np.sin(2 * np.pi * (6 + 30 * tt) * tt) ** 2 * env(n, 0.15)
add(scr, FREEZE, 0.5)
# tiny comic plink under the label
n = int(0.5 * SR); tt = np.arange(n) / SR
add(np.sin(2 * np.pi * 523 * tt) * env(n, 0.12), FREEZE + 8, 0.12)
add(np.sin(2 * np.pi * 392 * tt) * env(n, 0.2), FREEZE + 14, 0.12)

# barber voice
lip = json.load(open('src/lipsync.json'))
v, vsr = sf.read('public/voice_barber.wav')
if v.ndim > 1: v = v.mean(axis=1)
v = resample_poly(v, SR, vsr)
add(v, lip['start'], 0.95)

fade = np.ones(N); fi = int(0.25 * SR); fo = int(0.35 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
out *= fade
out = out / np.abs(out).max() * 0.9
sf.write('public/barber_raw.wav', np.stack([out, np.roll(out, 200)], axis=1), SR)
print('ok')
