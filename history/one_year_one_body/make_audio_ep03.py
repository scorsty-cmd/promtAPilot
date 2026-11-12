"""Ep 3 (You Were There 2, Carrington 1859) audio: original SFX bed + procedural score (lute plucks, pad, drum) + voice -> public/ep02_mix_raw.wav
then: ffmpeg loudnorm to -14 LUFS (see README). All sounds synthesized here (no samples)."""
import json
import numpy as np, soundfile as sf
from scipy.signal import butter, lfilter, resample_poly

SR, FPS = 48000, 30
T = json.load(open('src/ep03/timeline.json'))
SH = {s['id']: s for s in T['shots']}
N = int(T['frames'] / FPS * SR) + SR
rng = np.random.default_rng(1859)
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

C = []
def cue(sig, sec, g=1.0): C.append((sig, sec, g))

# ---------- new SFX for 1859 telegraphy ----------
def clack(): return A(bp(noise(.03), 1200, 6000) * env(int(.03 * SR), .006) * 1.6, thump(.06, 260) * .5)
def keytap(): return A(bp(noise(.02), 2000, 7000) * env(int(.02 * SR), .004), thump(.04, 400) * .3)
def zap(d=.35):
    t = tt(d); s = np.sign(np.sin(2 * np.pi * 60 * t)) * .5 + bp(noise(d), 2000, 9000) * 1.2
    return A(s * env(len(t), d * .4), crackle(d, 300) * 1.5) * 1.0
def buzz(d): t = tt(d); return (np.sign(np.sin(2 * np.pi * 120 * t)) * .3 + np.sin(2 * np.pi * 240 * t) * .2) * (.6 + .4 * np.sin(2 * np.pi * 3 * t))
def sizzle(d): return hp(noise(d), 3000) * (.5 + .5 * np.abs(np.sin(np.linspace(0, d * 9, int(d * SR))))) * .5
def chirp(): t = tt(.25); return np.sin(2 * np.pi * (2600 + 1400 * np.sin(2 * np.pi * 16 * t)) * t) * np.sin(np.pi * t / t[-1]) ** 2 * .5
def firebell(): return A(bell(880, 1.2) * .7, bell(1320, .9) * .3)
def shimmer(d):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .2 * t) * 2) * a for f, a in [(1047, .5), (1319, .4), (1568, .35), (2093, .2)])
    a = np.minimum(1, np.minimum(t / 1.2, (d - t) / 1.2)); return s * a * .4
def drone(d): t = tt(d); return lp(np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.5 * t) + .3 * noise(d), 300) * np.minimum(1, np.minimum(t / 1.0, (d - t) / 1.0))
def hum(d): t = tt(d); return lp(np.sin(2 * np.pi * 60 * t) * .5 + .4 * noise(d), 500)
def gaslamp(d): return hp(noise(d), 5000) * .25
def clockticks(d):
    out = np.zeros(int(d * SR))
    for k in range(int(d)):
        i = int(k * SR); n = int(.02 * SR)
        if i + n < len(out): out[i:i + n] += bp(noise(.02), 2500, 7000) * env(n, .004) * (1 if k % 2 else .7)
    return out
def morse(sec, code, g=.25, f=750, unit=.07):
    t0 = sec
    for ch in code:
        if ch == ' ': t0 += unit * 3; continue
        d = unit * (3 if ch == '-' else 1); t = tt(d)
        C.append((np.sin(2 * np.pi * f * t) * np.minimum(1, np.minimum(t / .005, (d - t) / .005)), t0, g)); t0 += d + unit
def sounder(sec, d, rate=1.0, g=.35, seed=0):
    r = np.random.default_rng(seed); t0 = sec
    while t0 < sec + d:
        C.append((clack(), t0, g)); t0 += r.choice([.08, .08, .22, .3]) / rate

KIND = {}
for s in T['shots']:
    sid = s['id']; k = 'office'
    if sid.startswith(('s03', 's05', 's19', 's20', 's21', 's47', 's49', 's04')): k = 'street'
    if sid.startswith(('s12', 's13', 's14', 's15', 's16_', 's40')): k = 'obs'
    if sid.startswith(('s17', 's31', 's42_', 's44_')): k = 'space'
    if sid.startswith(('s22', 's23')): k = 'camp'
    if sid.startswith(('s07', 's10', 's24', 's30', 's16b', 's39_', 's41', 's42b', 's45')): k = 'doc'
    if sid.startswith(('s43', 's44b', 's46')): k = 'city'
    KIND[sid] = k
AMB = {}
for s in T['shots']:
    sid = s['id']; kind = KIND[sid]
    a, b = span(sid); d = b - a
    if kind == 'office': sig = room(d) * .4 + gaslamp(d) * .5 + clockticks(d) * .25
    elif kind == 'street': sig = murmur(d) * .6 + wind(d, 300) * .3
    elif kind == 'obs': sig = room(d) * .4 + wind(d, 500) * .2
    elif kind == 'space': sig = drone(d) * .8
    elif kind == 'camp': sig = crackle(d, 20) * .5 + wind(d, 400) * .4
    elif kind == 'city': sig = hum(d) * .6
    else: sig = room(d) * .25
    fade = np.minimum(1, np.minimum(np.arange(len(sig)) / (.05 * SR), (len(sig) - np.arange(len(sig))) / (.05 * SR)))
    put(amb, sig / (np.abs(sig).max() + 1e-9) * fade, a, .06 if kind in ('street', 'camp') else .05)

def L(sid, i): return SH[sid]['lines'][i]['start'] - SH[sid]['start']
def E(sid, i): return SH[sid]['lines'][i]['end'] - SH[sid]['start']
def dur(sid): return SH[sid]['end'] - SH[sid]['start']
# aurora shimmer bed over every aurora shot
for sid in ['s02_window', 's03_nofire', 's05_title', 's18_glow', 's19_street', 's20_crowd', 's20b_end', 's21_paper', 's22_miners', 's23_masons', 's24_south', 's31_why', 's42b_aurora', 's46_2024']:
    a, b = span(sid); C.append((shimmer(b - a), a, .12))
# CH1
sounder(at('s01_spark'), .4, 2, .4, 1)
for k in range(4): cue(keytap(), at('s01_spark', k * 3), .4)
cue(zap(.5), at('s01_spark', 12), 1.0); cue(sizzle(2.5), at('s01_spark', 14), .25)
for k in range(5): cue(step(), at('s02_window', 4 + k * 14), .3)
cue(gulp(), at('s02_window', 74), .4)
cue(knock(), at('s02_window', L('s02_window', 1) - 10), .7); cue(creak(.5), at('s02_window', L('s02_window', 1) - 8), .4)
for k in range(6): cue(step(), at('s02_window', L('s02_window', 1) - 6 + k * 7), .35)
cue(firebell(), at('s03_nofire', 10), .25); cue(firebell(), at('s03_nofire', 50), .2)
l4 = L('s04_promise', 1); A4 = l4 / 3
for k in range(3): cue(whoosh(.35), at('s04_promise', k * A4) - .1, .5); cue(drum(), at('s04_promise', k * A4 + 4), .5)
cue(zap(.3), at('s04_promise', 8), .6); cue(zap(.6), at('s04_promise', A4 + 10), .8); cue(boing(), at('s04_promise', A4 + 14), .3)
cue(whoosh(.35), at('s04_promise', l4) - .1, .5); cue(snap(), at('s04_promise', l4 + 40), .6)
cue(whoosh(.5), at('s04_promise', l4 + 108), .5); morse(at('s04_promise', l4 + 115), '.--. --- .-- . .-.', .18)
cue(chime(), at('s05_title', 4), .35)
# CH2
for k in range(int(dur('s06_ned') / 8)):
    if (k * 7) % 5 < 3: cue(keytap(), at('s06_ned', k * 8), .3)
cue(scratch(), at('s06_ned', 130), .5); cue(plink(523), at('s06_ned', 138), .15); cue(stamp(), at('s06_ned', L('s06_ned', 1) + 150), .5)
morse(at('s07_wire', 20), '-. . .-- ...  -.-. --- -- .. -. --.', .14)
for k in range(10): cue(hoof(), at('s07_wire', 150 + k * 14), .3)
morse(at('s07_wire', 300), '.-.-.- -- --- .-. ... .', .14)
cue(drip(), at('s08_how', 20), .3); cue(drip(), at('s08_how', 60), .25)
for k in range(12): cue(keytap(), at('s08_how', 112 + k * 7), .35)
sounder(at('s08_how', 205), 3.0, 1.0, .35, 2)
sounder(at('s08b_ear'), 6.5, 1.2, .25, 3)
cue(gulp(), at('s08b_ear', E('s08b_ear', 2) + 2), .3); cue(sting(), at('s08b_ear', E('s08b_ear', 2) + 4), .25)
cue(scratch(), at('s09_pike', 34), .5); cue(plink(392), at('s09_pike', 40), .15)
sounder(at('s09_pike', 100), 5, .7, .2, 4)
sounder(at('s10_week', 20), 4, 2.0, .2, 5); cue(zap(.2), at('s10_week', 60), .3); cue(zap(.2), at('s10_week', 110), .3)
cue(murmur(4) * .5, at('s10_week', 150), .25)
cue(plink(330, 1.2), at('s11_dull', 66), .1)
for k in range(3): cue(tick(), at('s11_dull', 70 + k * 10), .4)
# CH3
for k in range(6): cue(chirp(), at('s12_redhill', 10 + k * 22), .25)
for k in range(int(dur('s13_carr') / 20)): cue(rustle(.12) * .5, at('s13_carr', k * 20), .25)
cue(shing(.6), at('s14_flash', 70), 1); cue(drum(), at('s14_flash', 112), .5); cue(gulp(), at('s14_flash', 140), .3)
for k in range(6): cue(step(), at('s15_run', 20 + k * 6), .4)
cue(creak(.6), at('s15_run', 58), .3)
for k in range(6): cue(step(), at('s15_run', 110 + k * 5), .4)
cue(heartbeat(), at('s15_run', 150), .3); cue(scratch(), at('s15_run', 236), .5)
cue(whoosh(.4), at('s16_kew', 30), .3); cue(boing(), at('s16_kew', 130 + 115), .3)
cue(rustle(.6), at('s16b_report', 10), .4); cue(rustle(.6), at('s16b_report', 40), .4); cue(stamp(), at('s16b_report', 222), .6)
cue(boom() * .6, at('s17_cloud', 20), .5); cue(whoosh(1.5), at('s17_cloud', 110), .4)
for k in range(30): cue(tick(), at('s17_cloud', L('s17_cloud', 1) + 40 + k * 4), .25)
cue(boom(), at('s17_cloud', L('s17_cloud', 1) + 170), .8)
# CH4
cue(drone(3.0), at('s18_glow'), .3); cue(shing(.3), at('s18_glow', 52), .6)
for k in range(5): cue(firebell(), at('s19_street', k * 30), .3)
cue(murmur(5) * .6, at('s19_street', 60), .3); cue(whoosh(1.2), at('s19_street', 165), .3)
cue(murmur(5), at('s20_crowd'), .35)
cue(gulp(), at('s20b_end', L('s20b_end', 2) - 10), .45)
cue(rustle(.6), at('s21_paper', 4), .5); cue(rustle(.4), at('s21_paper', L('s21_paper', 1) - 6), .4)
cue(rustle(.8), at('s22_miners', 80), .3); cue(sizzle(3.0), at('s22_miners', L('s22_miners', 2)), .6)
cue(scratch(), at('s22_miners', dur('s22_miners') - 46), .5); cue(plink(523), at('s22_miners', dur('s22_miners') - 40), .15)
for k in range(10): cue(knock() * .5, at('s23_masons', k * 10), .3)
cue(scratch(), at('s23_masons', 125), .4); cue(sting(), at('s23_masons', 132), .35)
for k in range(9): cue(chirp(), at('s23_masons', 180 + k * 15), .4)
for k in range(6): cue(pop() * .4, at('s24_south', 20 + k * 16), .3)
# CH5
for k in range(8): cue(step(), at('s25_back', k * 7), .35)
sounder(at('s25_back', 60), 4.5, 2.2, .4, 6); sounder(at('s25b_ghost'), 3.2, 2.4, .35, 7)
for k in range(8): cue(zap(.25), at('s26_sparks', k * 32 + 3), .55)
cue(sizzle(4), at('s26_sparks', 140), .4); cue(whoosh(.4), at('s26_sparks', 200), .3)
cue(buzz(1.5), at('s27_shock', 10), .15); cue(zap(.7), at('s27_shock', L('s27_shock', 1) + 30), 1.0); cue(boing(), at('s27_shock', L('s27_shock', 1) + 40), .4)
sounder(at('s28_royce'), 5, 1, .2, 8); cue(zap(.8), at('s28_royce', 150), 1.0); cue(murmur(1.5), at('s28_royce', 170), .2)
for k in range(5): cue(zap(.3), at('s29_pitt', k * 30), .6)
for k in range(7): cue(snap() * .5, at('s30_dead', 10 + k * 18), .35)
cue(drone(4), at('s31_why'), .3); cue(buzz(3), at('s31_why', 150), .1)
# CH6
sounder(at('s32_morning'), 3, .6, .2, 9); cue(sting(), at('s32_morning', 260), .2)
cue(plink(784, .6), at('s33_idea', 2), .2); cue(plink(988, .6), at('s33_idea', 6), .2)
cue(rustle(.6), at('s33_idea', L('s33_idea', 2) + 170), .4)
for sid in ['s34_ask', 's35_unplug', 's37_goahead']:
    for i, l in enumerate(SH[sid]['lines']):
        d = (l['end'] - l['start']) / FPS
        sounder(l['t0'], d, 1.1, .12 if l['sp'] == 'NED' else .16, 10 + i)
cue(creak(.4), at('s35_unplug', 12), .4); cue(snap(), at('s35_unplug', 38), .6); cue(chime(), at('s35_unplug', 45), .3)
cue(pop(), at('s36_pike', 6), .4); cue(knock(), at('s36_pike', 30), .7); cue(splash() * .4, at('s36_pike', 31), .4)
sounder(at('s38_hours'), 7, 1.0, .2, 12); morse(at('s38_hours', 10), '-.-. --- -- .', .12)
for k in range(20): cue(tick(), at('s38_hours', 90 + k * 3), .3)
sounder(at('s39_after'), 6, 1.0, .15, 13); cue(stamp(), at('s39_after', 30), .3)
cue(pop(), at('s39b_secret', 70), .2); cue(plink(659, .4), at('s39b_secret', E('s39b_secret', 1) + 2), .2)
# CH7
cue(rustle(.6), at('s40_swallow', 130), .4); cue(flap(1.2), at('s40_swallow', 150), .5); cue(chirp(), at('s40_swallow', 180), .4)
for k in range(30): cue(rustle(.1) * .4, at('s41_loomis', k * 6), .3)
cue(stamp(), at('s41_loomis', 182), .5)
cue(boom(), at('s42_name', 10), .6); cue(stamp(), at('s42_name', 82), .6)
cue(shimmer(8), at('s42b_aurora', 60), .2)
for k in range(4): cue(whoosh(.35), at('s43_today', 200 + k * 50) - .1, .4); cue(drum(), at('s43_today', 202 + k * 50), .4)
cue(whoosh(2.0), at('s44_2012', 20), .4)
cue(buzz(1.5), at('s44b_quebec', 100), .2); cue(boom() * .6, at('s44b_quebec', 150), .6); cue(drum(), at('s44b_quebec', 262), .5)
cue(rustle(.6), at('s45_cost', 6), .4)
for k in range(30): cue(coin() * .5, at('s45_cost', 140 + k * 5), .15)
cue(stamp(), at('s45_cost', 300), .4)
for k in range(5): cue(plink(1200 + k * 100, .2), at('s46_2024', 40 + k * 20), .1)
# CH8
for k in range(int(dur('s47_home') / 11)): cue(step() * .7, at('s47_home', k * 11), .25)
for k in range(3): cue(chirp(), at('s47_home', 30 + k * 60), .2)
cue(pop(), at('s48_question', 20), .3)
cue(gulp(), at('s48_question', E('s48_question', 2) + 4), .3); cue(sting(), at('s48_question', E('s48_question', 2) + 8), .2)
cue(chime(), at('s49_end', 2), .35)
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
PROG = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]  # D minor: Dm - Bb - C - A (night wire)
# chapter moods: (bpm, pad gain, pluck gain, pattern)
MOOD = {1: (66, .55, .3, 'tense'), 2: (92, .35, .45, 'walk'), 3: (62, .55, .3, 'sparse'), 4: (60, .6, .25, 'sparse'),
        5: (78, .5, .3, 'tense'), 6: (104, .25, .5, 'bouncy'), 7: (64, .55, .3, 'sparse'), 8: (76, .45, .4, 'walk')}
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
for sid in ['s03_nofire', 's14_flash', 's27_shock', 's36_pike', 's38_hours', 's44b_quebec']:
    a = at(sid); i = int((a - .4) * SR); j = int((a + 1.8) * SR)
    mus[i:j] *= np.concatenate([np.linspace(1, .05, int(.4 * SR)), np.full(j - i - int(.4 * SR), .05)])[: j - i]

# ---------- voice + "over the wire" filter for the Portland operator + ducking ----------
v, vsr = sf.read('public/ep03_voice.wav')
v = resample_poly(v, SR, vsr); voice = np.zeros(N); voice[:len(v)] = v[:N]
for s in T['shots']:
    for l in s['lines']:
        if l['sp'] == 'PORTLAND':
            i, j = int(l['t0'] * SR), int(l['t1'] * SR) + int(.05 * SR)
            seg = bp(voice[i:j], 350, 3200) * 1.6 + crackle((j - i) / SR, 25)[: j - i] * .05
            voice[i:j] = seg / (np.abs(seg).max() + 1e-9) * np.abs(voice[i:j]).max()
hop = SR // 100
e = np.sqrt(np.convolve(voice ** 2, np.ones(hop) / hop, 'same'))
k = int(.25 * SR); e = np.convolve(e, np.ones(k) / k, 'same')
duck = 1 - .72 * np.clip(e / (np.percentile(e[e > 0], 70) + 1e-9), 0, 1)
mix = voice * 1.0 + mus * .13 * duck + amb * duck * 1.0 + sfx * .55 * (0.6 + 0.4 * duck)
end = int(T['frames'] / FPS * SR); mix = mix[:end]
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)
mix = mix / np.abs(mix).max() * .9
sf.write('public/ep03_mix_raw.wav', np.stack([mix, np.roll(mix, 160)], axis=1), SR)
print('ok', len(mix) / SR)
