"""timeline.json -> subtitles_en.srt (same ~8-word chunks as the burned-in captions)"""
import json, re
tl = json.load(open('src/timeline.json'))
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"
out = []; n = 1
for l in tl['lines']:
    w = l['text'].split(); ch = []; cur = []
    for x in w:
        cur.append(x)
        if len(cur) >= 8 or (len(cur) >= 4 and re.search(r'[.,?!]$', x)): ch.append(cur); cur = []
    if cur: ch.append(cur)
    tot = sum(len(' '.join(c)) for c in ch); t = l['start']
    for c in ch:
        d = (l['end'] - l['start']) * len(' '.join(c)) / tot
        out.append(f"{n}\n{ts(t)} --> {ts(t + d)}\n{' '.join(c)}\n"); n += 1; t += d
open('subtitles_en.srt', 'w').write('\n'.join(out)); print('srt lines', n - 1)
