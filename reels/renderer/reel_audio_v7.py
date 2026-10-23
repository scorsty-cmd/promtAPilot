"""Audio for reel2.py: Kokoro voice + original tension music bed + synced SFX events.
    python3 reel_audio.py        -> reel_mix.wav   (needs reel_timeline.json, vos_reel/*.wav)
Everything is synthesized here (no samples), so there are no third-party audio rights involved.
Set MOOD in short_scenes_reel.py: 'tension' (default), 'curious' or 'bright'.
"""
import json, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
sys.path.insert(0, '.')
S = __import__('short_scenes_reel')
SR = 48000
tl = json.load(open('reel_timeline.json')); starts, durs, TOTAL = tl['starts'], tl['durs'], tl['total']
N = int(TOTAL * SR) + SR
rng = np.random.default_rng(getattr(S, 'SEED', 7))
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'bp', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'hp', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, 'lp', fs=SR, output='sos'), x)
def tt(sec): return np.arange(int(sec * SR)) / SR
def note(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- voice
voice = np.zeros(N, np.float32)
for i, s in enumerate(starts):
    x, sr = sf.read(f'vos_reel/{i:03d}.wav', dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = resample_poly(x, SR, sr).astype(np.float32); a = int(s * SR); voice[a:a + len(x)] += x[:N - a]
voice = hp(voice, 90); voice = voice + .3 * hp(voice, 3200)
# light compression
env = np.abs(voice); env = np.convolve(env, np.ones(480) / 480, mode='same')
g = np.where(env > .08, (.08 / (env + 1e-9)) ** .45, 1.0); voice = voice * g
voice /= np.max(np.abs(voice)) + 1e-9; voice *= .9

# ---------------- music
MOOD = getattr(S, 'MOOD', 'tension')
bpm = {'tension': 112, 'curious': 100, 'bright': 118}[MOOD]; beat = 60 / bpm; bar = beat * 4
prog = {'tension': [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 58], [40, 47, 52, 56]],
        'curious': [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]],
        'bright': [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]]}[MOOD]
music = np.zeros(N, np.float32); t_all = np.arange(N) / SR
for k in range(int(TOTAL / bar) + 2):
    ch = prog[k % 4]; a = int(k * bar * SR); L = int(bar * SR)
    if a >= N: break
    t = tt(bar); b = min(N, a + L); t = t[:b - a]
    pad = sum(np.sin(2 * np.pi * note(m + 12) * t * (1 + d)) for m in ch[1:] for d in (-.002, .002)) * .025
    pad *= np.minimum(1, t / .3)
    sub = np.sin(2 * np.pi * note(ch[0] - 12) * t)
    gate = (np.floor(t / (beat / 2)) % 2 == 0).astype(np.float32) * np.exp(-((t % (beat / 2)) / .09))
    music[a:b] += (pad + sub * gate * .22).astype(np.float32)
    for q in range(16):       # ticking 16ths (clock feeling)
        aa = a + int(q * beat / 4 * SR); Lh = int(.03 * SR)
        if aa + Lh >= N: break
        hat = hp(rng.standard_normal(Lh), 8000) * np.exp(-tt(.03) / .006) * (.05 if q % 4 else .08)
        music[aa:aa + Lh] += hat.astype(np.float32)
    for q in (0, 2):          # soft kick on 1 and 3
        aa = a + int(q * beat * SR); Lk = int(.3 * SR)
        if aa + Lk >= N: break
        tk = tt(.3); music[aa:aa + Lk] += (np.sin(2 * np.pi * (48 + 110 * np.exp(-tk / .025)) * tk) * np.exp(-tk / .12) * .45).astype(np.float32)
music = lp(music, 10000); music /= np.max(np.abs(music)) + 1e-9

act = np.zeros(N, np.float32)
for i, s in enumerate(starts): act[int(s * SR):int((s + durs[i]) * SR)] = 1
act = np.convolve(act, np.ones(int(.2 * SR)) / int(.2 * SR), mode='same')
music *= (.34 - .22 * act) * np.minimum(1, t_all / .05) * np.clip((TOTAL - t_all) / .6, 0, 1)

# ---------------- SFX
def s_whoosh():
    L = .45; t = tt(L); n = rng.standard_normal(len(t)); out = np.zeros_like(n); seg = len(t) // 10
    for j in range(10): out[j * seg:(j + 1) * seg] = bp(n[j * seg:(j + 1) * seg], 300 + 4500 * (j / 9) ** 2, 600 + 7000 * (j / 9) ** 2)
    return out * np.sin(np.pi * t / L) ** 2 * .5
def s_impact():
    t = tt(.9); boom = np.sin(2 * np.pi * (38 + 90 * np.exp(-t / .05)) * t) * np.exp(-t / .35)
    crack = hp(rng.standard_normal(len(t)), 1500) * np.exp(-t / .03) * .5
    return (boom + crack) * .8
def s_hit():
    t = tt(.4); return (np.sin(2 * np.pi * (55 + 80 * np.exp(-t / .03)) * t) * np.exp(-t / .12) + hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / .015) * .3) * .55
def s_click():
    t = tt(.05); return np.sin(2 * np.pi * 2200 * t) * np.exp(-t / .008) * .35
def s_tick():
    t = tt(.08); return (np.sin(2 * np.pi * 1600 * t) + .5 * np.sin(2 * np.pi * 2400 * t)) * np.exp(-t / .015) * .3
def s_pop():
    t = tt(.15); return np.sin(2 * np.pi * (300 + 500 * t / .15) * t) * np.exp(-t / .05) * .35
def s_lock():
    t = tt(.35); return (np.sin(2 * np.pi * 1200 * t) * (t < .08) + np.sin(2 * np.pi * 1800 * t) * (t > .1)) * np.exp(-t / .2) * .22
def s_ding():
    t = tt(1.2); return sum(np.sin(2 * np.pi * f * t) * a for f, a in ((1320, 1), (1980, .4), (2640, .2))) * np.exp(-t / .35) * .18
def s_paper():
    t = tt(.35); return bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-((t - .1) / .08) ** 2) * .35
def s_marker():
    t = tt(.6); return bp(rng.standard_normal(len(t)), 2500, 7000) * np.minimum(1, t / .05) * np.exp(-t / .4) * .12
def s_stamp():
    t = tt(.4); return (np.sin(2 * np.pi * (70 + 60 * np.exp(-t / .02)) * t) * np.exp(-t / .08) + bp(rng.standard_normal(len(t)), 400, 2500) * np.exp(-t / .03) * .6) * .6
def s_riser():
    t = tt(.6); n = rng.standard_normal(len(t)); out = np.zeros_like(n); seg = len(t) // 12
    for j in range(12): out[j * seg:(j + 1) * seg] = bp(n[j * seg:(j + 1) * seg], 500 + 600 * j, 900 + 900 * j)
    return out * (t / .6) ** 2 * .3
def s_shutter():
    t = tt(.32); c1 = hp(rng.standard_normal(len(t)), 1800) * np.exp(-t / .012)
    c2 = np.roll(hp(rng.standard_normal(len(t)), 1200) * np.exp(-t / .02), int(.09 * SR)) * (t > .09)
    return (c1 + .8 * c2 + np.sin(2 * np.pi * 140 * t) * np.exp(-t / .05) * .5) * .55
def s_blip():
    t = tt(.12); return (np.sin(2 * np.pi * 2900 * t) * np.exp(-t / .02) + .4 * np.sin(2 * np.pi * 980 * t) * np.exp(-t / .04)) * .14
def s_beep():
    t = tt(.32); env = ((t < .12) | ((t > .17) & (t < .29))).astype(float) * np.exp(-t / .5)
    return (np.sign(np.sin(2 * np.pi * 880 * t)) * .25 + np.sin(2 * np.pi * 1760 * t) * .5) * env * .2
def s_type():
    t = tt(.05); return hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / .006) * .22 + np.sin(2 * np.pi * 320 * t) * np.exp(-t / .01) * .08
LIB = {k[2:]: v() for k, v in dict(globals()).items() if k.startswith('s_')}
fx = np.zeros(N, np.float32)
for at, kind in tl.get('sfx', []):
    x = LIB.get(kind)
    if x is None: continue
    a = int(max(0, at) * SR); b = min(N, a + len(x)); fx[a:b] += x[:b - a].astype(np.float32)

mix = voice + music + fx * .85
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix = mix[:int(TOTAL * SR)]
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.70      # peak about -2 dB (AAC overshoots)
sf.write('reel_mix.wav', np.stack([mix, mix], 1), SR)
print('reel_mix.wav', round(len(mix) / SR, 2), 's,', len(tl.get('sfx', [])), 'sfx events')
