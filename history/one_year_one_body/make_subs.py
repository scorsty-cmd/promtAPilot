"""subtitles.srt from src/<ep>/timeline.json (narration + dialogue), numbers shown as digits, cues <= 84 chars,
split points snapped to real pauses in the voice track. usage: python3 make_subs.py ep01 out/subtitles.srt"""
import json, re, sys
import numpy as np, soundfile as sf
KEY, OUT = sys.argv[1], sys.argv[2]
T = json.load(open(f"src/{KEY}/timeline.json"))
NUMS = {"sixteen sixty-five": "1665", "sixteen sixty-six": "1666", "sixty-eight thousand, five hundred and ninety-six": "68,596",
        "two thousand, six hundred and fourteen": "2,614", "one hundred thousand": "100,000", "forty days": "40 days",
        "fifteen years old": "15 years old", "seven-year": "seven-year",
        "eighteen seventy-two": "1872", "one thousand, seven hundred and one": "1,701", "one thousand seven hundred pounds": "£1,700",
        "three and a half feet": "3½ feet", "twenty twenty-six": "2026", "eighteen eighty-five": "1885", "two thousand and one": "2001",
        "eighteen nineties": "1890s", "twenty-fifth of November": "25th of November", "thirteenth of December": "13th of December",
        "seventh of November": "7th of November", "December the fourth": "4 December"}
def display(s):
    for k in sorted(NUMS, key=len, reverse=True): s = re.sub(re.escape(k), NUMS[k], s, flags=re.I)
    return s
v, sr = sf.read(f"public/{KEY}_voice.wav"); v = v if v.ndim == 1 else v.mean(1)
hop = sr // 100; n = len(v) // hop; ENV = np.sqrt((v[: n * hop].reshape(n, hop) ** 2).mean(1)); THR = np.percentile(ENV[ENV > 0], 60) * .08
def pauses(a, b, minlen=.09):
    i0, i1 = int(a * 100) + 5, int(b * 100) - 5; out, st = [], None
    for i in range(i0, max(i0, i1)):
        q = ENV[i] < THR if i < len(ENV) else True
        if q and st is None: st = i
        if not q and st is not None:
            if (i - st) / 100 >= minlen: out.append((st + i) / 200)
            st = None
    return out
def snap(a, b, fr):
    ps = pauses(a, b); res = []
    for x in fr:
        est = a + (b - a) * x; best = min(ps, key=lambda p: abs(p - est), default=None)
        res.append(best if best is not None and abs(best - est) < .6 else est)
    return res
def chunks(p, maxc=84):
    if len(p) <= maxc: return [p]
    parts = [q.strip() for q in re.split(r"(?<=[,;:])\s+", p) if q.strip()]; out, cur = [], ""
    for q in parts:
        if cur and len(cur) + 1 + len(q) > maxc: out.append(cur); cur = q
        else: cur = (cur + " " + q).strip()
    if cur: out.append(cur)
    res = []
    for c in out:
        if len(c) <= maxc: res.append(c); continue
        w = c.split(); k = -(-len(c) // maxc); per = -(-len(w) // k); res += [" ".join(w[i:i + per]) for i in range(0, len(w), per)]
    return res
def ts(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60); ms = int(round((s - int(s)) * 1000))
    if ms == 1000: ms = 999
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{ms:03d}"
cues = []
for sh in T["shots"]:
    for l in sh["lines"]:
        a, b, txt = l["t0"], l["t1"], display(l["text"])
        sents = [p.strip() for p in re.split(r"(?<=[.!?])\s+", txt) if p.strip()]
        pieces = []
        for c in [c for s_ in sents for c in chunks(s_)]:
            if pieces and (len(c) < 14 or len(pieces[-1]) < 14) and len(pieces[-1]) + len(c) < 44: pieces[-1] += " " + c
            else: pieces.append(c)
        tot = sum(len(p) for p in pieces); cum = np.cumsum([len(p) for p in pieces])[:-1] / tot
        cuts = [a] + snap(a, b, list(cum)) + [b]
        for i, p in enumerate(pieces): cues.append((cuts[i], max(cuts[i] + .4, cuts[i + 1]), display(p)))
with open(OUT, "w") as f:
    for i, (a, b, t) in enumerate(cues, 1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n")
print("cues", len(cues))
