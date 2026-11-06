"""Original score + sound design for 'If the Whole World Turned Into Zombies' (8 min).
All synthesized via numpy + scipy.
Output: public/mix.wav calibrated exactly to -14.0 LUFS (within -16.5 to -12.5 LUFS required by QC)."""
import json, subprocess, os, re, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
tl = json.load(open('src/timeline.json'))
TOTAL = tl['voice_end'] + 8
N = int(TOTAL * SR)
rng = np.random.default_rng(2026)
L = tl['lines']

def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, min(hi, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)

def lp(x, f, o=2):
    return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)

def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)

def tt(d):
    return np.arange(int(d * SR)) / SR

def fade_env(n, fi, fo):
    e = np.ones(n)
    a = min(n, int(fi * SR))
    b = min(n, int(fo * SR))
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[n - b:] = np.minimum(e[n - b:], np.linspace(1, 0, b))
    return e

music = np.zeros(N, dtype=np.float32)
sfx = np.zeros(N, dtype=np.float32)

def add(buf, x, at, g=1.0):
    s = int(at * SR)
    if s >= N or len(x) == 0: return
    if s < 0:
        x = x[-s:]
        s = 0
    e = min(N, s + len(x))
    buf[s:e] += (x[:e - s] * g).astype(np.float32)

def sub_drone(d=16.0, freq=45, g=0.35):
    t = tt(d)
    wobble = 1 + 0.02 * np.sin(2 * np.pi * 0.25 * t)
    x = np.sin(2 * np.pi * freq * wobble * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    x += lp(rng.standard_normal(len(t)), 80) * 0.15
    return x * fade_env(len(t), 1.0, 1.0) * g

def cello_drone(notes, dur=16.0, g=0.4):
    t = tt(dur)
    x = np.zeros(len(t))
    for m in notes:
        f = mtof(m)
        saw = 2 * ((f * t) % 1) - 1
        x += bp(saw, f * 0.8, f * 3.5)
    x = lp(x, 650)
    return x / (np.abs(x).max() + 1e-9) * fade_env(len(t), 1.2, 1.2) * g

def piano_note(m, d=2.2, g=0.35):
    f = mtof(m)
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.0)
    x += 0.4 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3.5)
    return x * fade_env(len(t), 0.002, 0.2) * g

def siren(d=4.5, g=0.45):
    t = tt(d)
    mod = np.sin(2 * np.pi * 0.4 * t)
    f = 650 + 250 * mod
    ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph)
    x = bp(x, 300, 1800)
    return x * fade_env(len(t), 0.5, 0.5) * g

def radio_squelch(d=0.35, g=0.5):
    t = tt(d)
    x = bp(rng.standard_normal(len(t)), 800, 3200)
    click = np.zeros(len(t))
    click[:int(0.01 * SR)] = 0.8
    return (x + click) * fade_env(len(t), 0.01, 0.05) * g

def heartbeat(g=0.6):
    t = tt(0.8)
    h1 = np.sin(2 * np.pi * 50 * t[:int(0.15 * SR)]) * np.exp(-t[:int(0.15 * SR)] * 30)
    h2 = np.sin(2 * np.pi * 42 * t[:int(0.18 * SR)]) * np.exp(-t[:int(0.18 * SR)] * 25) * 0.8
    out = np.zeros(len(t))
    out[:len(h1)] += h1
    pos2 = int(0.22 * SR)
    out[pos2:pos2 + len(h2)] += h2
    return lp(out, 120) * g

def water_drip(g=0.3):
    t = tt(0.15)
    f = 1200 + 400 * np.exp(-t * 80)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 40) * g

def wind_gust(d=6.0, g=0.3):
    t = tt(d)
    w = bp(rng.standard_normal(len(t)), 100, 500)
    env = np.sin(np.pi * t / d) ** 2
    return w * env * g

print("Synthesizing chord blocks...", flush=True)
chords = [
    [33, 40, 45],
    [31, 38, 43],
    [29, 36, 41],
    [28, 35, 40],
]
cached_blocks = []
for c_notes in chords:
    b = (sub_drone(16.0, 45, 0.3) + cello_drone(c_notes, 16.0, 0.35)).astype(np.float32)
    cached_blocks.append(b)

print("Arranging musical timeline...", flush=True)
cur_t = 0.0
ci = 0
step = 14.5
while cur_t < TOTAL:
    blk = cached_blocks[ci % len(cached_blocks)]
    add(music, blk, cur_t, 1.0)
    if ci % 2 == 0:
        add(music, piano_note(chords[ci % len(chords)][1] + 12, 3.0), cur_t + 1.0, 0.25)
        add(music, piano_note(chords[ci % len(chords)][2] + 12, 3.0), cur_t + 5.0, 0.25)
    cur_t += step
    ci += 1

print("Adding SFX events...", flush=True)
for l in L:
    k = l['key']
    st = l['start']
    if k == 'o1':
        add(sfx, siren(5.5), st, 0.5)
    if k in ('o3', 'o5', 'r1', 'w3', 'c3'):
        add(sfx, radio_squelch(), st - 0.2, 0.45)
    if k in ('o9', 'n1', 'n3'):
        add(sfx, heartbeat(), st + 0.5, 0.6)
        add(sfx, heartbeat(), st + 1.7, 0.6)
    if k == 'w1':
        add(sfx, water_drip(), st + 0.8, 0.4)
        add(sfx, water_drip(), st + 2.2, 0.4)
    if k in ('g1', 'z1'):
        add(sfx, wind_gust(7.0), st, 0.35)

print("Loading voiceover and resampling...", flush=True)
vo, vo_sr = sf.read('public/vo.wav')
if vo_sr != SR:
    old_t = np.linspace(0, len(vo) / vo_sr, len(vo), endpoint=False)
    new_t = np.linspace(0, len(vo) / vo_sr, int(len(vo) * SR / vo_sr), endpoint=False)
    vo = np.interp(new_t, old_t, vo).astype(np.float32)

if len(vo) < N:
    vo = np.pad(vo, (0, N - len(vo)))
else:
    vo = vo[:N]

# Fast envelope ducking
print("Ducking score under dialogue...", flush=True)
hop = 480
vo_sub = np.abs(vo[::hop])
env_sub = lp(vo_sub, 4)
env = np.repeat(env_sub, hop)[:N]
if len(env) < N:
    env = np.pad(env, (0, N - len(env)))
duck = np.clip(1.0 - env * 2.0, 0.25, 1.0).astype(np.float32)

# Calibrated mix targeting -14.0 LUFS
raw_mix = (vo * 1.5 + (music * duck * 1.2) + sfx * 1.1).astype(np.float32)

# Soft limiter using tanh to prevent any clipping while maintaining high dynamic loudness
peak = np.max(np.abs(raw_mix))
if peak > 0.95:
    raw_mix = np.tanh(raw_mix / 0.95) * 0.92

out_path = 'public/mix.wav'
sf.write(out_path, raw_mix, SR)
print(f"Initial mix written to {out_path}", flush=True)

# Precision LUFS calibration via ffmpeg loudnorm
calib_path = 'public/mix_calib.wav'
loudnorm_cmd = [
    "ffmpeg", "-y", "-hide_banner", "-nostats",
    "-i", out_path,
    "-af", "loudnorm=I=-14.0:TP=-1.0:LRA=7.0",
    "-ar", str(SR),
    calib_path
]
subprocess.run(loudnorm_cmd, check=True)
os.replace(calib_path, out_path)
print(f"Normalized to target -14.0 LUFS -> {out_path}", flush=True)

# Final measurement
cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", out_path, "-af", "ebur128=peak=true", "-f", "null", "-"]
res = subprocess.run(cmd, capture_output=True, text=True)
tail = res.stderr[res.stderr.rfind("Summary:"):]
print("Final Loudness:")
for line in tail.splitlines():
    if "I:" in line or "Peak:" in line or "LRA:" in line:
        print(" ", line.strip())
