"""Write subtitles.srt (upload to YouTube as English captions; the Shorts task re-uses it) from timing.json.
v4 (22 Oct 2026): spoken years/numbers are shown as digits (NUMS, longest match first), and long sentences are
split at commas / clause breaks into cues of <= 2 lines (~84 chars) instead of mid-phrase word counts."""
import json, re
meta = json.load(open("timing.json"))
NUMS = {  # spoken form -> display form (Lost Ninth Legion; keep longest phrases first)
    "one hundred and eight": "108", "one hundred and seven": "107", "one hundred and seventeen": "117",
    "one hundred and twenty-two": "122", "one twenty-two": "122", "one hundred and thirty-two": "132",
    "one hundred and sixty-one": "161", "one hundred and sixties": "160s", "one hundred and twenties": "120s",
    "two hundred and thirty-eight": "238", "eighteen fifty-four": "1854", "eighteen sixty-six": "1866",
    "nineteen fifty-four": "1954", "five thousand": "5,000", "two thousand": "2,000", "forty-three": "43",
    "seventy-one": "71", "the year sixty": "the year 60", "Twenty-Second": "22nd", "twelfth": "12th",
    "sixty years": "60 years", "nineteenth century": "19th century", "ten people": "10 people",
    "four legions": "4 legions", "twenty years": "20 years", "Nine years": "9 years",
}
def display(s):
    for k in sorted(NUMS, key=len, reverse=True):
        s = re.sub(r"\b" + re.escape(k) + r"\b", NUMS[k], s, flags=re.I)
        s = re.sub(r"\b" + re.escape(k.capitalize()) + r"\b", NUMS[k], s)
    return s
def ts(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"
def chunks(p, maxc=84):
    if len(p) <= maxc: return [p]
    parts = [q.strip() for q in re.split(r"(?<=[,;:])\s+", p) if q.strip()]
    out, cur = [], ""
    for q in parts:
        if cur and len(cur) + 1 + len(q) > maxc: out.append(cur); cur = q
        else: cur = (cur + " " + q).strip()
    if cur: out.append(cur)
    res = []
    for c in out:   # still too long -> balanced word split
        if len(c) <= maxc: res.append(c); continue
        w = c.split(); k = -(-len(c) // maxc); per = -(-len(w) // k)
        res += [" ".join(w[i:i + per]) for i in range(0, len(w), per)]
    return res
# v6 (29 Oct 2026): sentence/clause boundaries snap to real pauses in voice.wav (10 ms RMS envelope) instead of
# pure character-proportional timing -> cues start/end with the words (the Shorts task cuts on these times).
import numpy as np
try:
    import soundfile as sf
    _v, _sr = sf.read("voice.wav"); _v = _v if _v.ndim == 1 else _v.mean(1)
    _hop = _sr // 100; _n = len(_v) // _hop
    ENV = np.sqrt((_v[: _n * _hop].reshape(_n, _hop) ** 2).mean(1)); THR = np.percentile(ENV[ENV > 0], 60) * .08
except Exception:
    ENV = None
def pauses(a, b, minlen=.09):
    """centres of silent runs (>= minlen s) strictly inside (a, b)."""
    if ENV is None: return []
    i0, i1 = int(a * 100) + 5, int(b * 100) - 5; out, st = [], None
    for i in range(i0, max(i0, i1)):
        q = ENV[i] < THR if i < len(ENV) else True
        if q and st is None: st = i
        if not q and st is not None:
            if (i - st) / 100 >= minlen: out.append(((st + i) / 200, (i - st) / 100))
            st = None
    return out
def snap(a, b, fracs):
    """move proportional split points to the nearest real pause (within 0.6 s)."""
    ps = pauses(a, b); res = []
    for fr in fracs:
        est = a + (b - a) * fr
        best = min(ps, key=lambda p: abs(p[0] - est) - .02 * p[1], default=None)
        res.append(best[0] if best and abs(best[0] - est) < .6 else est)
    return res
out, n = [], 1
for sc in meta:
    for a, b, txt in sc["lines"]:
        parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", txt) if p.strip()]
        tot = sum(len(p) for p in parts); t0 = a
        cum = np.cumsum([len(p) for p in parts])[:-1] / tot
        cuts = snap(a, b, list(cum)) + [b]
        for pi, p in enumerate(parts):
            d = cuts[pi] - t0
            cs = chunks(p); s0 = t0
            ccum = np.cumsum([len(x) for x in cs])[:-1] / max(1, sum(len(x) for x in cs))
            ccut = snap(s0, s0 + d, list(ccum)) + [s0 + d]
            for ci, c in enumerate(cs):
                e = max(t0 + .3, ccut[ci])
                out.append(f"{n}\n{ts(t0)} --> {ts(e)}\n{display(c)}\n"); n += 1; t0 = e
open("subtitles.srt", "w").write("\n".join(out))
print("cues", n - 1)
