"""Ep 2 (You Were There 1) audio: original SFX bed + procedural score (lute plucks, pad, drum) + voice -> public/ep02_mix_raw.wav
then: ffmpeg loudnorm to -14 LUFS (see README). All sounds synthesized here (no samples)."""
import json
import numpy as np, soundfile as sf
from scipy.signal import butter, lfilter, resample_poly

SR, FPS = 48000, 30
T = json.load(open('src/ep02/timeline.json'))
SH = {s['id']: s for s in T['shots']}
N = int(T['frames'] / FPS * SR) + SR
rng = np.random.default_rng(1872)
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


def waves(d): t = tt(d); return lp(noise(d), 500) * (.45 + .55 * np.sin(2 * np.pi * .12 * t) ** 2) + lp(noise(d), 120) * .6
def rainS(d): return hp(noise(d), 2500) * .5
def thunder(): d = 3.0; return A(lp(noise(d), 160) * env(int(d * SR), .9) * 2, lp(noise(.3), 900) * env(int(.3 * SR), .06))
def gull(): t = tt(.5); return np.sin(2 * np.pi * (1500 + 600 * np.sin(2 * np.pi * 7 * t)) * t) * np.sin(np.pi * t / t[-1]) ** 2 * .4
def flap(d=.5):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 8)):
        i = int(k / 8 * SR); n = int(.06 * SR); out[i:i + n] += bp(noise(.06), 200, 2000) * env(n, .02)
    return out
def splash(): return A(lp(noise(.6), 2000) * env(int(.6 * SR), .15), thump(.2, 60) * .5)
def oar(): return A(thump(.1, 110) * .5, bp(noise(.4), 400, 3000) * env(int(.4 * SR), .1) * .6)
def boom(): return A(thump(.9, 40) * 2.5, lp(noise(1.4), 700) * env(int(1.4 * SR), .35) * 1.2)
def snap(): return A(bp(noise(.05), 1500, 8000) * 2.5 * env(int(.05 * SR), .01), thump(.1, 200) * .4)
def slosh(d): t = tt(d); return lp(noise(d), 700) * (.5 + .5 * np.sin(2 * np.pi * .3 * t)) ** 2

AMB = {}
for s in T['shots']:
    sid = s['id']
    kind = 'sea'
    if sid.startswith(('s19', 's20', 's21_', 's23', 's24', 's25', 's26', 's35')): kind = 'cabin'
    if sid.startswith(('s18',)): kind = 'cabin'
    if sid.startswith(('s29b', 's30', 's31', 's33')): kind = 'court'
    if sid.startswith(('s06', 's08', 's16', 's21b', 's22', 's32', 's34', 's36', 's37', 's38', 's39', 's40', 's43_', 's45b', 's48')): kind = 'room'
    if sid.startswith(('s28', 's42', 's43b')): kind = 'storm'
    a, b = span(sid); d = b - a
    if kind == 'sea': sig = waves(d) * .8 + wind(d, 400) * .25
    elif kind == 'cabin': sig = slosh(d) * .5 + room(d) * .3 + waves(d) * .25
    elif kind == 'court': sig = murmur(d) * .4 + room(d) * .3
    elif kind == 'storm': sig = waves(d) * .7 + rainS(d) * .6 + wind(d, 600) * .4
    else: sig = room(d) * .25
    fade = np.minimum(1, np.minimum(np.arange(len(sig)) / (.05 * SR), (len(sig) - np.arange(len(sig))) / (.05 * SR)))
    put(amb, sig / (np.abs(sig).max() + 1e-9) * fade, a, .07 if kind in ('sea', 'storm') else .05)

C = []
def cue(sig, sec, g=1.0): C.append((sig, sec, g))
def L(sid, i): return SH[sid]['lines'][i]['start'] - SH[sid]['start']
def E(sid, i): return SH[sid]['lines'][i]['end'] - SH[sid]['start']
def dur(sid): return SH[sid]['end'] - SH[sid]['start']
# CH1
cue(gull(), at('s01_sail', 5), .3); cue(creak(.6), at('s01_sail', 30), .3)
c1 = L('s01_sail', 1) + 2
for k in range(5): cue(step(), at('s01_sail', c1 + k * 18), .3)
cue(splash(), at('s01_sail', c1 + 60), .6)
cue(whoosh(.3), at('s02_scope', 16), .35); cue(shing(.1), at('s02_scope', 30), 1); cue(whoosh(.5), at('s02_scope', 88), .4)
for k in range(3): cue(creak(.8), at('s03_drift', 20 + k * 60), .35)
cue(flap(1.5), at('s03_drift', 40), .3)
cue(wind(1.5, 800) * 0.6, at('s04_hail', E('s04_hail', 0)), .3)
f5 = E('s05_aye', 0) + 10
cue(gulp(), at('s05_aye', L('s05_aye', 0) - 14), .5); cue(scratch(), at('s05_aye', f5), .5); cue(plink(523), at('s05_aye', f5 + 8), .15)
l6 = L('s06_promise', 1)
for k in range(3): cue(whoosh(.35), at('s06_promise', k * l6 / 3) - .1, .5); cue(drum(), at('s06_promise', k * l6 / 3 + 4), .5)
for i in range(10): cue(plink(880 - i * 40, .3), at('s06_promise', l6 + 20 + i * 9), .12)
cue(drum(), at('s06_promise', l6 + 100), .6)
cue(chime(), at('s07_title', 4), .35)
# CH2
cue(rustle(.8), at('s08_map'), .5); cue(rustle(.5), at('s08_map', 200), .4)
cue(splash(), at('s09_deck', 70), .8); cue(thump(.15, 90), at('s09_deck', 76), .3)
for k in range(4): cue(step(), at('s09_deck', L('s09_deck', 1) - 40 + k * 15), .3)
for a_ in [40, 58, 76]: cue(knock(), at('s09b_watch', a_), .5)
cue(bell(660, 2), at('s09b_watch', 120), .15)
for k in range(3): cue(creak(.7), at('s10_hull', 30 + k * 70), .3)
for k in range(int(dur('s11_row') / 46) + 1): cue(oar(), at('s11_row', k * 46 + 20), .4)
for k in range(8): cue(creak(.25), at('s12_climb', k * 16), .25)
# CH3
cue(thump(.2, 80), at('s13_empty', 10), .4)
for k in range(3): cue(creak(1.0), at('s13_empty', E('s13_empty', 0) + 10 + k * 30), .25)
seg = dur('s13b_listen') / 3
cue(creak(1.2), at('s13b_listen', 4), .5); cue(flap(1.2), at('s13b_listen', seg + 2), .6); cue(waves(1.6) * .5, at('s13b_listen', 2 * seg), .6)
cue(knock(), at('s14_hatch', 20), .3); cue(tick(), at('s14_hatch', dur('s14_hatch') / 2 + 22), .6); cue(tick(), at('s14_hatch', dur('s14_hatch') / 2 + 26), .5)
cue(knock(), at('s15_pump', 100), .3)
import math
cue(knock(), at('s15_pump', 170 + 13), .8); cue(knock() * .6, at('s15_pump', 170 + 22), .6); cue(knock() * .3, at('s15_pump', 170 + 28), .5)
cue(splash() * .5, at('s16_sound', 30), .4); cue(drum(), at('s16_sound', 110), .45)
cue(sting(), at('s17_boat', 120), .4); cue(stamp(), at('s17_boat', 180), .5)
for k in range(6): cue(step() * .7, at('s18_galley', k * 13), .3)
for k in range(3): cue(plink(300 + k * 40, .8) * .5, at('s18_galley', 40 + k * 40), .15)
# CH4
for k in range(9): cue(creak(.3), at('s19_below', k * 12), .3)
cue(rustle(.5), at('s20_things', 40), .3)
for k in range(3): cue(chime() * .4, at('s21_family', 40 + k * 50), .25)
for k in range(7): cue(plink(660, .3), at('s21b_crew', k * 8), .1)
for k in range(30): cue(tick(), at('s22_newyork', 120 + k * 3.6), .3)
for k in range(6): cue(thump(.15, 70), at('s22_newyork', k * 40), .2)
cue(whoosh(.3), at('s23_sword', 40), .3); cue(shing(.4), at('s23_sword', 52), 1)
cue(scratch() * .5, at('s23_sword', L('s23_sword', 2) - 4), .3)
for k in range(3): cue(stamp(), at('s24_missing', 56 + k * 50), .45)
for k in range(40): cue(tick() * .5, at('s25_log', 130 + k * 3), .3)
for k in range(4): cue(heartbeat(), at('s26_creep', k * 26), .4)
cue(gulp(), at('s26_creep', L('s26_creep', 1) + 20), .4); cue(gulp(), at('s26_creep', L('s26_creep', 1) + 34), .4)
# CH5
for k in range(5): cue(coin(), at('s27_prize', 30 + k * 12), .35)
cue(thunder(), at('s28_storm', 50), .7); cue(thunder(), at('s28_storm', 150), .6)
for k in range(5): cue(creak(.8), at('s28_storm', k * 50), .35)
cue(gull(), at('s29_arrive', 30), .3); cue(gull(), at('s29_arrive', 60), .2)
cue(stamp(), at('s29_arrive', L('s29_arrive', 1) - 4 + 22), .6)
cue(knock(), at('s29b_testimony', 20), .3); cue(knock(), at('s29b_testimony', 26), .3)
cue(shing(.15), at('s30_flood', 32), 1)
for k in range(4): cue(knock() * .6, at('s30_flood', L('s30_flood', 1) + 10 + k * 21), .3)
m31 = L('s31_accuse', 2) + 22
cue(pop(), at('s31_accuse', m31), .4); cue(plink(1800, .2), at('s31_accuse', m31 + 12), .25); cue(plink(1700, .2), at('s31_accuse', m31 + 18), .15)
for k in range(3): cue(thump(.15, 120), at('s32_evidence', 30 + k * 40), .35)
l32 = L('s32_evidence', 1)
cue(stamp(), at('s32_evidence', l32 + 50), .5); cue(stamp(), at('s32_evidence', l32 + 60), .45); cue(stamp(), at('s32_evidence', l32 + 150), .45)
for k in range(8): cue(coin(), at('s33_award', 40 + k * 5), .3)
cue(stamp(), at('s33_award', L('s33_award', 1) - 6 + 20), .5)
# CH6
for k in range(int(dur('s34_doyle') / 12)): cue(rustle(.15) * .4, at('s34_doyle', k * 12), .3)
cue(scratch(), at('s34_doyle', dur('s34_doyle') - 70), .5)
cue(pop(), at('s35_myths', 60), .3); cue(pop(), at('s35_myths', 80), .3); cue(pop(), at('s35_myths', 140), .3)
cue(scratch(), at('s35_myths', L('s35_myths', 1) - 10), .6); cue(stamp(), at('s35_myths', L('s35_myths', 1) + 4), .5)
cue(whoosh(.4), at('s36_fiction', 8), .4)
# CH7
for k in range(4): cue(pop() * .4, at('s37_known', 40 + k * 45), .3)
cue(stamp(), at('s38_pirates', 50), .45); cue(stamp(), at('s38_pirates', dur('s38_pirates') / 2 + 40), .45)
for k in range(9): cue(knock(), at('s39_barrels', 60 + k * 8), .35)
l40 = L('s40_vapour', 1)
cue(snap() * .6, at('s40_vapour', l40 - 4 + 40), .4); cue(snap() * .6, at('s40_vapour', l40 + 110 + 64), .4)
cue(boom(), at('s40_vapour', l40 + 110 + 70), .7)
cue(boom(), at('s41_flash', 44), .9); cue(whoosh(.8), at('s41_flash', 44), .5)
for k in range(10): cue(step(), at('s41_flash', 150 + k * 9), .35)
cue(creak(1.5), at('s42_rope', 10), .4); cue(snap(), at('s42_rope', E('s42_rope', 0) + 10), .9)
cue(stamp(), at('s43_other', dur('s43_other') - 70), .5)
for k in range(5): cue(tick(), at('s43_other', dur('s43_other') * .45 + 20 + k * 8), .4)
cue(wind(4, 900) * .8, at('s43b_spout', 10), .4)
for k in range(4): cue(thump(.4, 45), at('s43b_spout', dur('s43b_spout') * .62 + k * 14), .5)
cue(drum(), at('s44_unknown', 200), .4)
# CH8
cue(rustle(.6), at('s45_fate', 10), .3); cue(boom() * .6, at('s45_fate', 280), .6); cue(crunch(), at('s45_fate', 282), .6); cue(stamp(), at('s45_fate', 310), .5)
for k in range(20): cue(tick(), at('s45b_cussler', 100 + k * 10), .3)
cue(stamp(), at('s45b_cussler', 340), .5)
cue(gull(), at('s46_after', 40), .2)
for k in range(3): cue(pop() * .5, at('s47_question', L('s47_question', 1) + k * 40), .3)
cue(chime(), at('s48_end', 2), .35)
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
PROG = [[45, 52, 57, 60], [43, 50, 55, 59], [41, 48, 53, 57], [40, 47, 52, 56]]  # A aeolian: Am - G - F - E (sea)
# chapter moods: (bpm, pad gain, pluck gain, pattern)
MOOD = {1: (64, .55, .3, 'tense'), 2: (88, .35, .45, 'walk'), 3: (60, .6, .25, 'sparse'), 4: (62, .6, .25, 'tense'),
        5: (84, .35, .45, 'walk'), 6: (100, .25, .5, 'bouncy'), 7: (66, .55, .3, 'sparse'), 8: (70, .5, .4, 'walk')}
chs = {}
for s in T['shots']: chs.setdefault(s['ch'], [s['start'] / FPS, s['end'] / FPS]); chs[s['ch']][1] = s['end'] / FPS
for ch, (a, b) in chs.items():
    bpm, pg, kg, pat = MOOD[ch]; beat = 60 / bpm; bar = 4 * beat
    tcur, bi = a, 0
    while tcur < b - .5:
        chord = PROG[bi % 4]
        if ch in (1, 4) and bi % 2: chord = [c + 1 if i == 2 else c for i, c in enumerate(chord)]  # tension: neighbour note
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
for sid in ['s13_empty', 's17_boat', 's23_sword', 's42_rope', 's44_unknown', 's29_arrive']:
    a = at(sid); i = int((a - .4) * SR); j = int((a + 1.8) * SR)
    mus[i:j] *= np.concatenate([np.linspace(1, .05, int(.4 * SR)), np.full(j - i - int(.4 * SR), .05)])[: j - i]

# ---------- voice + ducking ----------
v, vsr = sf.read('public/ep02_voice.wav')
v = resample_poly(v, SR, vsr); voice = np.zeros(N); voice[:len(v)] = v[:N]
hop = SR // 100
e = np.sqrt(np.convolve(voice ** 2, np.ones(hop) / hop, 'same'))
k = int(.25 * SR); e = np.convolve(e, np.ones(k) / k, 'same')
duck = 1 - .72 * np.clip(e / (np.percentile(e[e > 0], 70) + 1e-9), 0, 1)
mix = voice * 1.0 + mus * .13 * duck + amb * duck * 1.0 + sfx * .55 * (0.6 + 0.4 * duck)
end = int(T['frames'] / FPS * SR); mix = mix[:end]
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)
mix = mix / np.abs(mix).max() * .9
sf.write('public/ep02_mix_raw.wav', np.stack([mix, np.roll(mix, 160)], axis=1), SR)
print('ok', len(mix) / SR)
