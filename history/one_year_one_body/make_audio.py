import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 48000
DUR = 10.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR
FPS = 30

def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), 'low')
    return lfilter(b, a, x)

def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return lfilter(b, a, x)

out = np.zeros(N)

# Night wind / street ambience
wind = lp(rng.standard_normal(N), 500)
wind = wind / np.abs(wind).max()
mod = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t + 1.0) * np.sin(2 * np.pi * 0.07 * t)
out += wind * mod * 0.16

# Distant church bell (plague year toll) at 0.3s
def bell(start, gain):
    n = int(SR * 5)
    tt = np.arange(n) / SR
    partials = [(220, 1.0, 1.6), (440 * 1.19, 0.5, 1.1), (220 * 2.0, 0.6, 2.2), (220 * 2.76, 0.3, 0.8), (220 * 4.07, 0.15, 0.5)]
    s = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in partials)
    s = lp(s, 2500) * gain
    i = int(start * SR)
    j = min(N, i + n)
    out[i:j] += s[: j - i]

bell(0.3, 0.10)

# Footsteps on cobbles: one per 11 frames while walking (frames 0-125)
for f in range(4, 124, 11):
    i = int(f / FPS * SR)
    n = int(0.09 * SR)
    burst = bp(rng.standard_normal(n), 300, 3000) * np.exp(-np.arange(n) / (0.018 * SR))
    knock = np.sin(2 * np.pi * 110 * np.arange(n) / SR) * np.exp(-np.arange(n) / (0.03 * SR))
    out[i:i + n] += (burst * 0.35 + knock * 0.25)

# Heartbeat throbs during the pain (match visual throb every 22 frames from 150)
def thump(start, gain):
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (60 - 25 * tt) * tt) * np.exp(-tt / 0.08)
    i = int(start * SR)
    j = min(N, i + n)
    out[i:j] += (s * gain)[: j - i]

for k, f in enumerate(range(150, 300, 22)):
    g = 0.55 if f < 215 else 0.3
    thump(f / FPS, g)
    thump(f / FPS + 0.16, g * 0.6)

# Twinge sting at frame 122
i = int(122 / FPS * SR)
n = int(0.5 * SR)
tt = np.arange(n) / SR
sting = (np.sin(2 * np.pi * 1760 * tt) + 0.5 * np.sin(2 * np.pi * 2350 * tt)) * np.exp(-tt / 0.12)
out[i:i + n] += sting * 0.06

# Low boom when the title lands (frame 222)
i = int(222 / FPS * SR)
n = int(2.5 * SR)
tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * (48 - 10 * tt) * tt) * np.exp(-tt / 0.7) + lp(rng.standard_normal(n), 200) * np.exp(-tt / 0.4) * 0.6
out[i:i + n] += boom[: N - i] * 0.5

# Fade in/out, normalise
fade = np.ones(N)
fi = int(0.4 * SR); fo = int(0.8 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo)
out *= fade
out = out / np.abs(out).max() * 0.8
stereo = np.stack([out, np.roll(out, 240)], axis=1)
wavfile.write('public/ambience.wav', SR, (stereo * 32767).astype(np.int16))
print('ok')
