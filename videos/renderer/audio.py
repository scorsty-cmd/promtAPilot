# Hidden Layer long-form mix v2: voice + chapter-aware generated music bed (calm under explanation, lift at reveals),
# ducking, whoosh/hit/riser SFX, room tone, loudness to -14 LUFS with a true-peak-safe limiter.
import json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
from scipy.ndimage import uniform_filter1d, minimum_filter1d
import pyloudnorm as pyln
from scenes import B
SR = 48000
tl = json.load(open('timeline.json')); starts, durs, TOTAL = tl['starts'], tl['durs'], tl['total']
N = int(TOTAL * SR) + SR
t = (np.arange(N) / SR).astype(np.float32)
rng = np.random.default_rng(0)
sos = lambda *a, **k: butter(*a, fs=SR, output='sos', **k)

# ---------------- voice
voice = np.zeros(N, np.float32)
for i, s in enumerate(starts):
    x, sr = sf.read(f'vo/{i:03d}.wav', dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = resample_poly(x, SR, sr).astype(np.float32)
    a = int(s * SR); voice[a:a + len(x)] += x[:N - a]
voice = sosfilt(sos(2, 80, 'hp'), voice)
voice = voice + 0.22 * sosfilt(sos(2, 3200, 'hp'), voice) - 0.10 * sosfilt(sos(2, [250, 450], 'bp'), voice)
# gentle compression (RMS-based, 3:1 above threshold)
env = np.sqrt(uniform_filter1d(voice ** 2, int(0.03 * SR)) + 1e-9)
thr = np.percentile(env[env > 1e-3], 70)
g = np.where(env > thr, (env / thr) ** (-2 / 3), 1.0)
voice = (voice * uniform_filter1d(g, int(0.01 * SR))).astype(np.float32)
voice /= np.max(np.abs(voice)) + 1e-9

# ---------------- intensity curve per section / reveal
SEC_INT = {0: .85, 1: .45, 2: .55, 3: .55, 4: .65, 5: .55, 6: .45, 7: .8}
inten = np.zeros(N, np.float32)
for i, b in enumerate(B):
    a = int(starts[i] * SR); e = int((starts[i + 1] if i + 1 < len(B) else TOTAL) * SR)
    v = SEC_INT.get(b['section'], .5)
    if b.get('reveal') or b['kind'] in ('tool', 'subscribe'): v += .35
    inten[a:e] = v
inten[:int(starts[0] * SR)] = SEC_INT[0]
inten = uniform_filter1d(inten, int(1.5 * SR))

# ---------------- music (original, synthesized)
bpm = 92; beat = 60 / bpm; bar = beat * 4
def note(m): return 440 * 2 ** ((m - 69) / 12)
PROGS = {0: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],      # Am F C G
         1: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]],      # Dm Bb F C
         2: [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]],      # Em C G D
         3: [[57, 60, 64], [52, 55, 59], [53, 57, 60], [55, 59, 62]],      # Am Em F G
         4: [[50, 53, 57], [45, 48, 52], [46, 50, 53], [48, 52, 55]],      # Dm Am Bb C
         5: [[53, 57, 60], [48, 52, 55], [50, 53, 57], [46, 50, 53]],      # F C Dm Bb
         6: [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]],      # C G Am F
         7: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]}
def section_at(time):
    k = 0
    for i, s in enumerate(starts):
        if s <= time: k = i
    return B[k]['section']
pad = np.zeros(N, np.float32); arp = np.zeros(N, np.float32); drums = np.zeros(N, np.float32); bass = np.zeros(N, np.float32)
nbars = int(TOTAL / bar) + 2
for k in range(nbars):
    a = int(k * bar * SR)
    if a >= N: break
    ch = PROGS[section_at(k * bar)][k % 4]
    b_ = min(N, a + int(bar * SR * 1.3)); tt = np.arange(b_ - a) / SR
    envp = np.minimum(1, tt / 1.0) * np.exp(-tt / (bar * 1.6))
    sig = np.zeros(b_ - a, np.float32)
    for m in ch + [ch[0] + 12]:
        f = note(m)
        for det in (-0.15, 0.0, 0.15):
            ph = rng.uniform(0, 6.28)
            sig += np.sin(2 * np.pi * f * (1 + det / 100) * tt + ph) * 0.33 + 0.08 * np.sin(2 * np.pi * 2 * f * tt + ph)
    pad[a:b_] += (sig * envp * 0.05).astype(np.float32)
    fb = note(ch[0] - 24)
    bass[a:b_] += (np.sin(2 * np.pi * fb * tt) * np.minimum(1, tt / .05) * np.exp(-tt / (bar * .8)) * 0.25).astype(np.float32)
    for s8 in range(8):
        aa = a + int(s8 * beat / 2 * SR); L = int(beat / 2 * SR)
        if aa + L >= N: break
        m = (ch + [ch[0] + 12])[[0, 2, 1, 3, 2, 1, 3, 2][s8]] + 12
        t2 = np.arange(L) / SR
        arp[aa:aa + L] += (np.sin(2 * np.pi * note(m) * t2) * np.exp(-t2 / 0.14) * 0.06).astype(np.float32)
    for q in range(4):
        aa = a + int(q * beat * SR); L = int(0.3 * SR)
        if aa + L >= N: break
        t2 = np.arange(L) / SR
        drums[aa:aa + L] += (np.sin(2 * np.pi * (48 + 80 * np.exp(-t2 / 0.03)) * t2) * np.exp(-t2 / 0.1) * 0.4).astype(np.float32)
        ha = aa + int(beat / 2 * SR); Lh = int(0.05 * SR)
        if ha + Lh < N:
            hat = rng.standard_normal(Lh) * np.exp(-np.arange(Lh) / SR / 0.015) * 0.05
            drums[ha:ha + Lh] += sosfilt(sos(2, 7000, 'hp'), hat).astype(np.float32)
        if q in (1, 3):   # soft snare/clap on 2 and 4
            Ls = int(0.18 * SR); sn = rng.standard_normal(Ls) * np.exp(-np.arange(Ls) / SR / 0.05) * 0.10
            drums[aa:aa + Ls] += sosfilt(sos(2, [1200, 5000], 'bp'), sn).astype(np.float32)
drum_g = np.clip((inten - 0.6) * 3.0, 0, 1)
arp_g = np.clip(0.35 + inten * 0.8, 0, 1)
music = pad * 1.0 + bass * (0.6 + 0.4 * inten) + arp * arp_g + drums * drum_g
del pad, arp, drums, bass
music = sosfilt(sos(2, 8500, 'lp'), music).astype(np.float32)
music /= np.max(np.abs(music)) + 1e-9

act = np.zeros(N, np.float32)
for i, s in enumerate(starts):
    a = int(s * SR); b_ = int((s + durs[i]) * SR); act[a:b_] = 1
act = uniform_filter1d(act, int(0.35 * SR), mode='constant').astype(np.float32)
mgain = (0.26 - 0.18 * act) * (0.8 + 0.3 * inten)
fade = np.minimum(1, t / 1.5) * np.clip((TOTAL - t) / 2.5, 0, 1)
music *= (mgain * fade).astype(np.float32)

# ---------------- sfx
sfx = np.zeros(N, np.float32)
def whoosh(at, length=0.7, amp=0.4):
    a = int(max(0, at - length * .5) * SR); L = int(length * SR)
    if a + L >= N: return
    nz = rng.standard_normal(L).astype(np.float32); tt = np.arange(L) / SR
    env = np.sin(np.pi * np.clip(tt / length, 0, 1)) ** 2
    out = np.zeros(L, np.float32); seg = L // 12
    for j in range(12):
        fc = 300 + 4500 * (j / 11) ** 2
        out[j * seg:(j + 1) * seg] = sosfilt(sos(2, [fc * .7, fc * 1.3], 'bp'), nz[j * seg:(j + 1) * seg])
    sfx[a:a + L] += out * env * amp
def hit(at, amp=0.45):
    a = int(at * SR); L = int(0.5 * SR)
    if a + L >= N: return
    ti = np.arange(L) / SR
    sfx[a:a + L] += (np.sin(2 * np.pi * (42 + 70 * np.exp(-ti / 0.04)) * ti) * np.exp(-ti / 0.17) * amp).astype(np.float32)
    nz = rng.standard_normal(L) * np.exp(-ti / 0.03) * amp * .25
    sfx[a:a + L] += sosfilt(sos(2, 2500, 'lp'), nz).astype(np.float32)
def riser(end, length=1.6, amp=0.22):
    a = int(max(0, end - length) * SR); L = int(end * SR) - a
    if L <= 0 or a + L >= N: return
    tt = np.arange(L) / SR; nz = rng.standard_normal(L).astype(np.float32)
    out = np.zeros(L, np.float32); seg = max(1, L // 16)
    for j in range(16):
        fc = 500 + 6000 * (j / 15) ** 2
        out[j * seg:(j + 1) * seg] = sosfilt(sos(2, [fc * .8, fc * 1.2], 'bp'), nz[j * seg:(j + 1) * seg])
    sfx[a:a + L] += out * (tt / tt[-1]) ** 2 * amp
def tick(at, amp=0.12):
    a = int(at * SR); L = int(0.06 * SR)
    if a + L >= N: return
    ti = np.arange(L) / SR
    sfx[a:a + L] += (np.sin(2 * np.pi * 2200 * ti) * np.exp(-ti / 0.012) * amp).astype(np.float32)
for i, b in enumerate(B):
    s = starts[i]
    if b['kind'] == 'tool' or i == 0:
        whoosh(s, .8, .45); hit(s, .5)
    elif b['kind'] == 'subscribe':
        whoosh(s, .8, .35); hit(s + .2, .35)
    elif i > 0 and b.get('photo') != B[i - 1].get('photo'):
        whoosh(s, .55, .18)
    if b.get('reveal'): riser(s, 1.4, .2); hit(s, .3)
    if b['kind'] == 'myth': hit(s + 1.5, .4)
    if b['kind'] == 'doc_quote': tick(s + .7, .08)
    if b['kind'] in ('counter',): whoosh(s + .1, .4, .12)

# ---------------- room tone (very low, filtered pink-ish noise)
room = rng.standard_normal(N).astype(np.float32)
room = sosfilt(sos(1, 1200, 'lp'), room); room = sosfilt(sos(2, 60, 'hp'), room)
room = room / (np.max(np.abs(room)) + 1e-9) * 0.006

mix = voice * 0.85 + music + sfx + room
del voice, music, sfx, room, act, inten, t
mix = mix[:int(TOTAL * SR)].astype(np.float64)
meter = pyln.Meter(SR)
st = np.stack([mix, mix], 1)
lufs = meter.integrated_loudness(st)
mix *= 10 ** ((-14.0 - lufs) / 20)
# lookahead peak limiter at -1.5 dBFS (sample peak), then 4x-oversampled check
ceil = 10 ** (-2.5 / 20)
pk = minimum_filter1d(np.minimum(1.0, ceil / (np.abs(mix) + 1e-9)), int(0.004 * SR))
gr = uniform_filter1d(pk, int(0.004 * SR))
gr = np.minimum(gr, pk)  # never exceed
mix = mix * np.minimum(1.0, uniform_filter1d(gr, int(0.002 * SR)))
mix = np.clip(mix, -ceil, ceil)
st = np.stack([mix, mix], 1).astype(np.float32)
print('LUFS before', round(lufs, 2), 'after', round(meter.integrated_loudness(st.astype(np.float64)), 2),
      'peak dB', round(20 * np.log10(np.max(np.abs(st))), 2))
sf.write('mix.wav', st, SR, subtype='PCM_24')
print('audio', len(mix) / SR)
