# Prints YouTube chapters from timeline.json + scenes.
# A chapter starts at 0:00 with scenes.INTRO_CHAPTER, then at the first beat of every section that has a
# name in SECTION_NAMES, and at any beat carrying chapter='Label'. YouTube needs >= 3 chapters, each >= 10 s.
import json
import scenes as S
tl = json.load(open('timeline.json'))
names = getattr(S, 'SECTION_NAMES', {}); prefix = getattr(S, 'SECTION_PREFIX', '#')
out = [(0, getattr(S, 'INTRO_CHAPTER', 'Intro'))]; seen = set()
for i, b in enumerate(S.B):
    lab = None
    if b.get('chapter'): lab = b['chapter']
    elif b['section'] in names and b['section'] not in seen:
        seen.add(b['section']); lab = (f"{prefix}{b['section']} " if prefix else '') + names[b['section']]
    if lab and i > 0:
        t = int(tl['starts'][i])
        if t - out[-1][0] >= 10: out.append((t, lab))
for t, lab in out: print(f'{t // 60}:{t % 60:02d} {lab}')
