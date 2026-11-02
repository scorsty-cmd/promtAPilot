"""Ep 1 audio: original SFX bed + procedural score (lute plucks, pad, drum) + voice -> public/ep01_mix_raw.wav
then: ffmpeg loudnorm to -14 LUFS (see README). All sounds synthesized here (no samples)."""
import json
import numpy as np, soundfile as sf
from scipy.signal import butter, lfilter, resample_poly

SR, FPS = 48000, 30
T = json.load(open('src/ep01/timeline.json'))
SH = {s['id']: s for s in T['shots']}
N = int(T['frames'] / FPS * SR) + SR
rng = np.random.default_rng(1665)
sfx = np.zeros(N); mus = np.zeros(N); amb = np.zeros(N)

def lp(x, f): b, a = butter(2, f / (SR / 2), 'low'); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def env(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def put(buf, sig, sec, g=1.0):
    i = int(sec * SR); j = min(N, i + len(sig))
    if 0 <= i < N: buf[i:j] += sig[: j - i] * g
def at(sid, lf=0): return (SH[sid]['start'] + lf) / FPS
def line(sid, i, frac=0.0):
    l = SH[sid]['lines'][i]; return l['t0'] + (l['t1'] - l['t0']) * frac
def span(sid): return SH[sid]['start'] / FPS, SH[sid]['end'] / FPS

# ---------- SFX generators ----------
def A(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def bell(f0=330, d=4.0):
    t = tt(d); return sum(np.sin(2 * np.pi * f0 * r * t) * a * env(len(t), d * k) for r, a, k in [(1, 1, .3), (2.01, .5, .2), (2.76, .35, .15), (4.07, .2, .08)]) * .5
def thump(d=.18, f0=70): t = tt(d); return (np.sin(2 * np.pi * (f0 + 40 * np.exp(-t * 30)) * t) + .4 * lp(noise(d), 400)) * env(len(t), .05)
def step(d=.12): return A(lp(noise(d), 600) * env(int(d * SR), .025), thump(.1, 90) * .5)
def knock(): return A(bp(noise(.08), 300, 2500) * env(int(.08 * SR), .012), thump(.12, 120) * .6)
def crunch(): return bp(noise(.35), 1500, 7000) * (np.abs(np.sin(np.linspace(0, 40, int(.35 * SR)))) ** 3) * env(int(.35 * SR), .12)
def whoosh(d=.5): n = int(d * SR); return bp(noise(d), 300, 3000) * np.sin(np.linspace(0, np.pi, n)) ** 2 * .7
def shing(g=1): t = tt(.9); return sum(np.sin(2 * np.pi * f * t) * a for f, a in [(2637, 1), (3520, .6), (5274, .35)]) * env(len(t), .25) * g
def sting(): t = tt(.7); return (np.sin(2 * np.pi * 880 * t) + np.sin(2 * np.pi * 932 * t)) * env(len(t), .2) * .5
def scratch(): t = tt(.45); return bp(noise(.45), 400, 4000) * np.sin(2 * np.pi * (6 + 30 * t) * t) ** 2 * env(len(t), .15)
def gulp(): t = tt(.22); return lp(np.sin(2 * np.pi * (420 - 1300 * t) * t) * np.sin(np.pi * t / t[-1]) ** 2, 900)
def heartbeat(): return A(thump(.25, 55), np.concatenate([np.zeros(int(.14 * SR)), thump(.2, 50) * .7]))
def creak(d=.3): t = tt(d); return lp(np.sin(2 * np.pi * (170 + 70 * np.sin(2 * np.pi * 9 * t)) * t) * env(len(t), .1) + .3 * noise(d) * env(len(t), .05), 1200)
def rustle(d=.6): return bp(noise(d), 1500, 8000) * np.sin(np.linspace(0, np.pi, int(d * SR))) * .5
def plink(f=523, d=.5): t = tt(d); return np.sin(2 * np.pi * f * t) * env(len(t), .12)
def boing(): t = tt(.5); return np.sin(2 * np.pi * (180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4)) * t) * env(len(t), .18)
def pop(): return A(bp(noise(.04), 800, 6000) * 2, thump(.15, 160))
def drip(): t = tt(.15); return np.sin(2 * np.pi * (900 + 1800 * t) * t) * env(len(t), .03)
def cough(): return bp(noise(.25), 200, 1800) * env(int(.25 * SR), .06) * 1.2
def coin(): t = tt(.4); return (np.sin(2 * np.pi * 3100 * t) + .6 * np.sin(2 * np.pi * 4700 * t)) * env(len(t), .08)
def tick(): return bp(noise(.02), 2000, 8000) * env(int(.02 * SR), .004)
def stamp(): return A(thump(.3, 60) * 1.4, bp(noise(.1), 200, 1500) * env(int(.1 * SR), .02))
def chime(): return A(*[plink(f, 1.6) * a for f, a in [(784, 1), (988, .6), (1175, .4)]]) * .5
def wheels(d): t = tt(d); return lp(noise(d), 300) * (.6 + .4 * np.sin(2 * np.pi * 3 * t))
def hoof(): return A(thump(.1, 140), bp(noise(.05), 800, 3000) * env(int(.05 * SR), .01))
def drum(): return thump(.35, 80) * 1.2
def crackle(d, dens=30):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * dens)):
        i = rng.integers(0, max(1, len(out) - 2000)); n = int(.02 * SR)
        out[i:i + n] += bp(rng.standard_normal(n), 1500, 6000) * env(n, .004) * rng.uniform(.2, 1)
    return out
def wind(d, base=200): return lp(noise(d), base) * (.6 + .4 * np.sin(np.linspace(0, d * .7, int(d * SR))))
def murmur(d): return bp(noise(d), 200, 900) * (.7 + .3 * np.sin(np.linspace(0, d * 2.3, int(d * SR))))
def room(d): return lp(noise(d), 250)

# ---------- ambience beds per shot ----------
AMB = {
    'attic': ['s01_attic', 's02_window', 's03_situp', 's26_night3'], 'bakery': ['s07_bakery', 's07b_apprentice', 's08_crust', 's09_flinch', 's13_teeth', 's17_agnes', 's19_clove', 's20_happy', 's20b_back', 's21_root', 's22_drool', 's23_henbane', 's25_dizzy', 's46b_gap', 's47_recover', 's48_fire', 's49_question'],
    'street': ['s05_title', 's10_street', 's11_door', 's11b_cart', 's28_physician', 's31_nightstreet', 's33_shopfront', 's44_babies'],
    'barber': ['s34_greet', 's35b_company', 's36_drink', 's37_openwide', 's39_pull', 's40_pop', 's41_trophy'],
    'fair': ['s27_options'], 'room': ['s04_promise', 's06_map', 's12_bill', 's14_worm', 's15_truth', 's16_why', 's18_recipes', 's24_trick', 's29_barberopt', 's30_route', 's32_tobacco', 's35_tools', 's42_generalbill', 's43_teethcount', 's45_infection', 's46_verdict', 's50_end'],
}
for kind, ids in AMB.items():
    for sid in ids:
        a, b = span(sid); d = b - a
        if kind == 'attic': sig = wind(d, 160) * .5 + room(d) * .3
        elif kind == 'bakery': sig = crackle(d, 25) * .5 + lp(noise(d), 120) * .6
        elif kind == 'street': sig = murmur(d) * (.25 if sid in ('s31_nightstreet', 's44_babies') else .5) + wind(d, 300) * .2
        elif kind == 'barber': sig = crackle(d, 12) * .35 + room(d) * .3
        elif kind == 'fair': sig = murmur(d) * 1.0
        else: sig = room(d) * .25
        fade = np.minimum(1, np.minimum(np.arange(len(sig)) / (.05 * SR), (len(sig) - np.arange(len(sig))) / (.05 * SR)))
        put(amb, sig / (np.abs(sig).max() + 1e-9) * fade, a, .05 if kind != 'fair' else .08)

# ---------- cue list (synced to the animation frames in shots*.tsx) ----------
C = []
def cue(sig, sec, g=1.0): C.append((sig, sec, g))
for k in range(4): cue(bell(300), at('s01_attic', 30 + k * 90), .18)
for k in range(2): cue(bell(300), at('s02_window', 10 + k * 70), .22)
cue(wheels(5), at('s02_window'), .25)
cue(thump(.2, 90), at('s03_situp', 6), .4); cue(whoosh(.3), at('s03_situp', 4), .3)
f3 = SH['s03_situp']['lines'][1]['end'] - SH['s03_situp']['start'] + 8
cue(scratch(), at('s03_situp', f3), .5); cue(plink(523), at('s03_situp', f3 + 8), .15); cue(plink(392, .6), at('s03_situp', f3 + 14), .15)
d4 = (SH['s04_promise']['end'] - SH['s04_promise']['start']) / 4
for k in range(4): cue(whoosh(.35), at('s04_promise', k * d4) - .1, .5); cue(drum(), at('s04_promise', k * d4 + 4), .5)
cue(shing(.25), at('s04_promise', 2 * d4 + 12), 1)
cue(chime(), at('s05_title', 4), .35)
cue(rustle(.8), at('s06_map'), .5); cue(rustle(.5), at('s06_map', 130), .4)
for k in range(20): cue(thump(.12, 100), at('s07_bakery', 8 + k * 28.6), .25)
cue(shing(.1), at('s07_bakery', 199), 1)
for k in range(10): cue(step(), at('s07b_apprentice', k * 20), .35)
cue(rustle(.6), at('s07b_apprentice', SH['s07b_apprentice']['lines'][1]['start'] - SH['s07b_apprentice']['start']), .4)
for k in range(7): cue(knock(), at('s07b_apprentice', SH['s07b_apprentice']['lines'][1]['start'] - SH['s07b_apprentice']['start'] + 8 + k * 9), .25)
b8 = SH['s08_crust']['lines'][1]['start'] - SH['s08_crust']['start'] - 6
cue(crunch(), at('s08_crust', b8), .6); cue(sting(), at('s08_crust', b8 + 2), .35)
cue(thump(.2, 80), at('s09_flinch', 20), .5); cue(whoosh(.3), at('s09_flinch'), .3)
for k in range(10): cue(step(), at('s10_street', k * 15), .25)
l10 = SH['s10_street']['lines'][1]['start'] - SH['s10_street']['start']
for k in range(14): cue(knock(), at('s10_street', l10 + 6 + k * 12.6), .45)
cue(rustle(1.5), at('s11_door', 10), .35)
l11 = SH['s11_door']['lines'][1]['start'] - SH['s11_door']['start']
for k in range(10): cue(step() * .5, at('s11_door', l11 + k * 13), .2)
for k in range(24): cue(hoof(), at('s11b_cart', 20 + k * 9), .25)
cue(wheels(7), at('s11b_cart', 20), .25)
cue(rustle(.7), at('s12_bill'), .4)
l12 = SH['s12_bill']['lines'][1]['start'] - SH['s12_bill']['start']
cue(rustle(5), at('s12_bill', l12 + 30), .12)
cue(drum() * 1.5, at('s13_teeth', 8), .7); cue(stamp(), at('s13_teeth', 8), .4)
t13 = SH['s13_teeth']['lines'][1]['start'] - SH['s13_teeth']['start'] - 14
cue(whoosh(.25), at('s13_teeth', t13), .4); cue(gulp(), at('s13_teeth', t13 + 36), .45)
for k in range(10): cue(boing() * .4, at('s14_worm', 20 + k * 37), .15)
cue(stamp(), at('s15_truth', 4), .5); cue(pop(), at('s15_truth', 6), .3)
for k in range(6): cue(heartbeat(), at('s15_truth', 120 + k * 30), .25)
cue(lp(noise(6), 150) * .8, at('s16_why'), .25)
l16 = SH['s16_why']['lines'][1]['start'] - SH['s16_why']['start']
cue(plink(660), at('s16_why', l16 + 20), .2); cue(stamp(), at('s16_why', l16 + 180), .45)
for k in range(6): cue(step(), at('s17_agnes', k * 18), .25)
cue(rustle(.6), at('s18_recipes', 90), .5)
cue(drip(), at('s19_clove', 38), .4); cue(lp(noise(.5), 3000) * env(int(.5 * SR), .2), at('s19_clove', 44), .3)
for k in range(8): cue(thump(.1, 110), at('s20_happy', k * 14.3), .3)
o20 = SH['s20_happy']['lines'][2]['start'] - SH['s20_happy']['start']
cue(sting(), at('s20_happy', o20 + 10), .3); cue(scratch(), at('s20_happy', o20 + 22), .5)
for k in range(7): cue(thump(.12, 100), at('s20b_back', k * 21), .25)
for k in range(20): cue(lp(noise(.08), 900) * env(int(.08 * SR), .02), at('s21_root', 45 + k * 14), .25)
for k in range(5): cue(drip(), at('s22_drool', 5 + k * 12), .35)
cue(plink(330, .8), at('s22_drool', SH['s22_drool']['lines'][1]['start'] - SH['s22_drool']['start']), .1)
cue(crackle(8, 20), at('s23_henbane'), .25); cue(whoosh(1.2), at('s23_henbane', SH['s23_henbane']['lines'][1]['start'] - SH['s23_henbane']['start'] + 90), .3)
for k in range(6): cue(plink(1200 + k * 80, .2), at('s24_trick', 50 + k * 7), .2)
cue(stamp(), at('s24_trick', SH['s24_trick']['lines'][1]['start'] - SH['s24_trick']['start'] + 10), .45)
t25 = tt(10); cue(np.sin(2 * np.pi * (300 + 60 * np.sin(2 * np.pi * .4 * t25)) * t25) * .3, at('s25_dizzy', 40), .25)
cue(stamp(), at('s25_dizzy', SH['s25_dizzy']['lines'][1]['start'] - SH['s25_dizzy']['start'] - 10), .45)
for k in range(9): cue(heartbeat(), at('s26_night3', k * 28), .3)
cue(lp(noise(8), 2500) * .3 * np.abs(np.sin(np.linspace(0, 300, int(8 * SR)))), at('s26_night3'), .2)
for k in range(16): cue(drum() * .7, at('s27_options', k * 9), .35)
cue(stamp(), at('s27_options', SH['s27_options']['lines'][1]['start'] - SH['s27_options']['start'] + 4), .5)
cue(coin(), at('s28_physician', 40), .3); cue(coin(), at('s28_physician', 46), .25)
for k in range(8): cue(step(), at('s28_physician', 150 + k * 16), .3)
for k, f in enumerate([10, 60, 110]): cue(pop(), at('s29_barberopt', f), .35)
cue(shing(.2), at('s29_barberopt', 130), 1)
cue(rustle(.6), at('s30_route'), .4)
for k in range(8): cue(step() * .4, at('s30_route', 10 + k * 15), .3)
cue(wheels(10), at('s31_nightstreet'), .2)
for k in range(15): cue(step() * .5, at('s31_nightstreet', k * 24), .2)
for k in range(10): cue(cough(), at('s32_tobacco', 10 + k * 21), .3)
e32 = SH['s32_tobacco']['lines'][0]['end'] - SH['s32_tobacco']['start'] + 10
cue(scratch(), at('s32_tobacco', e32), .5); cue(plink(523), at('s32_tobacco', e32 + 8), .15)
for k in range(9): cue(step(), at('s33_shopfront', k * 15), .3)
cue(plink(1568, .8), at('s33_shopfront', 120), .1)
for k in range(4): cue(step(), at('s34_greet', k * 18), .3)
cue(creak(.4), at('s34_greet', 70), .5); cue(thump(.25, 70), at('s34_greet', 80), .5)
cue(shing(.25), at('s35_tools', 30), 1); cue(stamp(), at('s35_tools', 180), .45)
cue(creak(.6), at('s35b_company', 20), .2)
cue(gulp(), at('s36_drink', 60), .5); cue(gulp(), at('s36_drink', 75), .45)
for k in range(3): cue(cough(), at('s36_drink', 92 + k * 9), .5)
r37 = SH['s37_openwide']['lines'][1]['start'] - SH['s37_openwide']['start'] - 6
cue(whoosh(.3), at('s37_openwide', r37), .4); cue(shing(.3), at('s37_openwide', r37 + 14), 1)
fe37 = SH['s37_openwide']['lines'][2]['start'] - SH['s37_openwide']['start'] - 2
cue(sting(), at('s37_openwide', fe37), .4)
for k in range(5): cue(heartbeat(), at('s37_openwide', 10 + k * 26), .3)
cue(scratch(), at('s38_regret'), .55); cue(plink(392, .6), at('s38_regret', 10), .15); cue(plink(330, .8), at('s38_regret', 16), .15)
for k in range(9): cue(heartbeat(), at('s39_pull', k * 18), .4)
cue(creak(.5), at('s39_pull', 70), .7); cue(creak(.6), at('s39_pull', SH['s39_pull']['lines'][1]['start'] - SH['s39_pull']['start']), .9)
cue(pop() * 2.0, at('s40_pop', 12), .9); cue(boing(), at('s40_pop', 14), .4); cue(whoosh(1.5), at('s40_pop', 14), .3)
cue(plink(1046, 1), at('s40_pop', 60), .15)
cue(shing(.3), at('s41_trophy', 10), 1); cue(chime(), at('s41_trophy', SH['s41_trophy']['lines'][1]['start'] - SH['s41_trophy']['start'] + 80), .2)
l42 = SH['s42_generalbill']['lines'][1]['start'] - SH['s42_generalbill']['start']
for k in range(30): cue(tick(), at('s42_generalbill', l42 + 10 + k * 2), .4)
cue(stamp(), at('s42_generalbill', l42 + 160), .5)
for k in range(20): cue(tick(), at('s43_teethcount', 70 + k * 2), .4)
cue(drum(), at('s43_teethcount', 70), .4)
l44 = SH['s44_babies']['lines'][1]['start'] - SH['s44_babies']['start']
for k in range(12): cue(step() * .6, at('s44_babies', l44 + k * 18), .25)
for k in range(3): cue(coin(), at('s44_babies', l44 + 146 + k * 14), .3)
for k in range(10): cue(heartbeat(), at('s45_infection', k * 28), .35)
cue(creak(.8), at('s46_verdict', SH['s46_verdict']['lines'][1]['start'] - SH['s46_verdict']['start']), .4)
cue(stamp(), at('s46_verdict', SH['s46_verdict']['lines'][1]['start'] - SH['s46_verdict']['start'] + 40), .45)
l46b = SH['s46b_gap']['lines'][1]['start'] - SH['s46b_gap']['start']
for k in range(14): cue(knock() * .5, at('s46b_gap', l46b + k * 6.3), .3)
cue(stamp(), at('s46b_gap', l46b + 140), .45)
for k in range(12): cue(thump(.12, 100), at('s47_recover', k * 20), .2)
cue(crackle(14, 50), at('s48_fire'), .35)
cue(lp(noise(7), 90), at('s48_fire', SH['s48_fire']['lines'][1]['start'] - SH['s48_fire']['start'] + 40), .5)
for k in range(3): cue(pop() * .6, at('s49_question', 10 + k * 28), .3)
cue(chime(), at('s50_end', 2), .35)
for sig, sec, g in C:
    put(sfx, sig, sec, g)

# ---------- score ----------
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def pluck(f, d=1.4):
    n = int(d * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return out
_pc = {}
def pl(m, d=1.4):
    if (m, d) not in _pc: _pc[(m, d)] = pluck(mtof(m), d)
    return _pc[(m, d)]
def pad(ms, d):
    t = tt(d); s = sum(np.sin(2 * np.pi * mtof(m) * t) + .3 * np.sin(2 * np.pi * mtof(m) * 2.003 * t) for m in ms)
    a = np.minimum(1, np.minimum(t / 1.5, (d - t) / 1.5)); return lp(s, 1200) * a / len(ms)
# D dorian progression: Dm - C - Bb(add)- Am (bars of 4 beats)
PROG = [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 60]]
# chapter moods: (bpm, pad gain, pluck gain, pattern)
MOOD = {1: (66, .5, .35, 'sparse'), 2: (84, .35, .45, 'walk'), 3: (76, .35, .35, 'sparse'), 4: (96, .25, .55, 'bouncy'),
        5: (80, .4, .4, 'walk'), 6: (70, .55, .3, 'tense'), 7: (60, .6, .3, 'sparse'), 8: (72, .5, .45, 'walk')}
chs = {}
for s in T['shots']: chs.setdefault(s['ch'], [s['start'] / FPS, s['end'] / FPS]); chs[s['ch']][1] = s['end'] / FPS
for ch, (a, b) in chs.items():
    bpm, pg, kg, pat = MOOD[ch]; beat = 60 / bpm; bar = 4 * beat
    tcur, bi = a, 0
    while tcur < b - .5:
        chord = PROG[bi % 4]
        if ch == 6 and bi % 2: chord = [c + 1 if i == 2 else c for i, c in enumerate(chord)]  # tension: neighbour note
        put(mus, pad(chord, min(bar, b - tcur) + .1), tcur, pg)
        if pat == 'sparse': notes = [(0, chord[1] + 12), (2, chord[2] + 12)]
        elif pat == 'walk': notes = [(0, chord[0] + 12), (1, chord[1] + 12), (2, chord[2] + 12), (3, chord[3] + 12)]
        elif pat == 'bouncy': notes = [(0, chord[0] + 12), (.5, chord[2] + 12), (1.5, chord[3] + 12), (2, chord[1] + 12), (3, chord[2] + 24), (3.5, chord[3] + 12)]
        else: notes = [(0, chord[0]), (2, chord[0])]
        for off, m in notes:
            if tcur + off * beat < b - .3: put(mus, pl(m, 1.4 if pat != 'tense' else 2.0), tcur + off * beat, kg)
        if pat == 'bouncy':
            for k in range(4): put(mus, thump(.12, 90), tcur + k * beat, .25)
        if pat == 'tense':
            for k in range(4): put(mus, lp(noise(.1), 200) * env(int(.1 * SR), .03), tcur + k * beat, .3)
        tcur += bar; bi += 1
    # chapter fade edges
    ia, ib = int(a * SR), int(b * SR)
    fl = int(.4 * SR)
    mus[ia:ia + fl] *= np.linspace(0, 1, fl); mus[ib - fl:ib] *= np.linspace(1, 0, fl)
# music drop-outs before reveals (silence = emphasis)
for sid in ['s13_teeth', 's38_regret', 's40_pop', 's43_teethcount', 's48_fire']:
    a = at(sid); i = int((a - .4) * SR); j = int((a + 1.8) * SR)
    mus[i:j] *= np.concatenate([np.linspace(1, .05, int(.4 * SR)), np.full(j - i - int(.4 * SR), .05)])[: j - i]

# ---------- voice + ducking ----------
v, vsr = sf.read('public/ep01_voice.wav')
v = resample_poly(v, SR, vsr); voice = np.zeros(N); voice[:len(v)] = v[:N]
hop = SR // 100
e = np.sqrt(np.convolve(voice ** 2, np.ones(hop) / hop, 'same'))
k = int(.25 * SR); e = np.convolve(e, np.ones(k) / k, 'same')
duck = 1 - .72 * np.clip(e / (np.percentile(e[e > 0], 70) + 1e-9), 0, 1)
mix = voice * 1.0 + mus * .13 * duck + amb * duck * 1.0 + sfx * .55 * (0.6 + 0.4 * duck)
end = int(T['frames'] / FPS * SR); mix = mix[:end]
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)
mix = mix / np.abs(mix).max() * .9
sf.write('public/ep01_mix_raw.wav', np.stack([mix, np.roll(mix, 160)], axis=1), SR)
print('ok', len(mix) / SR)
