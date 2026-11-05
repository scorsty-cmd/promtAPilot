import json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
SR = 48000
tl = json.load(open('timeline.json')); starts, durs, TOTAL = tl['starts'], tl['durs'], tl['total']
N = int(TOTAL * SR) + SR
voice = np.zeros(N, np.float32)
for i, s in enumerate(starts):
    x, sr = sf.read(f'vo/{i:03d}.wav', dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = resample_poly(x, SR, sr).astype(np.float32)
    a = int(s * SR); voice[a:a + len(x)] += x[:N - a]
# gentle voice EQ: high-pass 80Hz + light presence lift via parallel high-shelf-ish
voice = sosfilt(butter(2, 80, 'hp', fs=SR, output='sos'), voice)
pres = sosfilt(butter(2, 3000, 'hp', fs=SR, output='sos'), voice)
voice = voice + 0.25 * pres
voice /= np.max(np.abs(voice)) + 1e-9; voice *= 0.89

# ---- ambient synth music bed (original, generated) ----
t = np.arange(N) / SR
bpm = 96; beat = 60 / bpm; bar = beat * 4
def note(m): return 440 * 2 ** ((m - 69) / 12)
prog = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]  # Am F C G
music = np.zeros(N, np.float32)
rng = np.random.default_rng(0)
nbars = int(TOTAL / bar) + 2
env_len = int(bar * SR)
for k in range(nbars):
    ch = prog[k % 4]; a = int(k * bar * SR); b = min(N, a + int(bar * SR * 1.25))
    if a >= N: break
    tt = np.arange(b - a) / SR
    env = np.minimum(1, tt / 0.8) * np.exp(-tt / (bar * 1.4))
    sig = np.zeros(b - a, np.float32)
    for m in ch:
        f = note(m)
        for det in (-0.12, 0.12):
            sig += np.sin(2 * np.pi * f * (1 + det / 100) * tt) * 0.5 + 0.18 * np.sin(2 * np.pi * 2 * f * tt)
    music[a:b] += (sig * env * 0.06).astype(np.float32)
    # bass
    fb = note(ch[0] - 12); bb = np.sin(2 * np.pi * fb * tt) * np.exp(-tt / (bar * .9)) * 0.22
    music[a:b] += bb.astype(np.float32)
    # arpeggio (8th notes)
    for s8 in range(8):
        aa = a + int(s8 * beat / 2 * SR); L = int(beat / 2 * SR)
        if aa + L >= N: break
        m = ch[[0, 2, 1, 3, 2, 1, 3, 2][s8]] + 12
        tt2 = np.arange(L) / SR
        music[aa:aa + L] += (np.sin(2 * np.pi * note(m) * tt2) * np.exp(-tt2 / 0.12) * 0.05).astype(np.float32)
    # soft kick + hat
    for q in range(4):
        aa = a + int(q * beat * SR); L = int(0.25 * SR)
        if aa + L >= N: break
        tt2 = np.arange(L) / SR
        kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-tt2 / 0.03)) * tt2) * np.exp(-tt2 / 0.09) * 0.35
        music[aa:aa + L] += kick.astype(np.float32)
        ha = aa + int(beat / 2 * SR); Lh = int(0.05 * SR)
        if ha + Lh < N:
            hat = rng.standard_normal(Lh) * np.exp(-np.arange(Lh) / SR / 0.012) * 0.035
            music[ha:ha + Lh] += sosfilt(butter(2, 7000, 'hp', fs=SR, output='sos'), hat).astype(np.float32)
music = sosfilt(butter(2, 9000, 'lp', fs=SR, output='sos'), music).astype(np.float32)
music /= np.max(np.abs(music)) + 1e-9

# ducking envelope from voice activity
act = np.zeros(N, np.float32)
for i, s in enumerate(starts):
    a = int(s * SR); b = int((s + durs[i]) * SR); act[a:b] = 1
win = int(0.25 * SR); k = np.ones(win) / win
act = np.convolve(act, k, mode='same')
mgain = 0.30 - 0.20 * act  # 0.30 in gaps, 0.10 under voice
fade = np.minimum(1, t / 1.5) * np.clip((TOTAL - t) / 2.0, 0, 1)
music *= mgain * fade

# whoosh on section changes (tool beats)
sfx = np.zeros(N, np.float32)
from scenes import B
for i, b in enumerate(B):
    if b['kind'] in ('tool', 'subscribe') or (i == 0):
        a = int(max(0, starts[i] - 0.35) * SR); L = int(0.7 * SR)
        if a + L >= N: continue
        nz = rng.standard_normal(L).astype(np.float32)
        tt = np.arange(L) / SR
        env = np.sin(np.pi * np.clip(tt / 0.7, 0, 1)) ** 2
        # sweep by chunked band-pass
        out = np.zeros(L, np.float32); seg = L // 12
        for j in range(12):
            fc = 400 + 5000 * (j / 11) ** 2
            sos = butter(2, [fc * 0.7, fc * 1.3], 'bp', fs=SR, output='sos')
            out[j * seg:(j + 1) * seg] = sosfilt(sos, nz[j * seg:(j + 1) * seg])
        sfx[a:a + L] += out * env * 0.5
        # impact
        ia = int(starts[i] * SR); Li = int(0.4 * SR)
        if ia + Li < N:
            ti = np.arange(Li) / SR
            sfx[ia:ia + Li] += (np.sin(2 * np.pi * (45 + 60 * np.exp(-ti / 0.04)) * ti) * np.exp(-ti / 0.15) * 0.45).astype(np.float32)

mix = voice + music + sfx
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix[:int(TOTAL * SR)]
st = np.stack([mix, mix], 1)
sf.write('mix.wav', st * 0.95, SR)
print('audio', len(mix) / SR)
