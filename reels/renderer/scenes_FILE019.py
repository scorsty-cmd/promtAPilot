# FILE 019 - NYC click-to-cancel rule (in force 1 Oct 2026), fine ladder $525 / $1,050 / $3,500
PALETTE = {'A1': (88, 214, 255), 'A2': (255, 184, 77), 'BG': (9, 15, 24), 'TXT': (240, 244, 248), 'MUTED': (150, 162, 176)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 019'
MOOD = 'curious'
SEED = 191
KICKER = 'YOUR MONEY'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Hard to cancel? In New York City, that now costs them five hundred twenty-five dollars.", "hook",
     lines=["Hard to cancel?", "NYC fines them", "$525"], accent=2, y=330)
beat("Since October first, the city's commissioner has put it simply: sign up online, cancel online.", "doc",
     doc="NYC Mayor's Office release", section='Commissioner Levine · 1 Oct 2026',
     quote='If you signed up for a subscription online, you should be able to cancel online.',
     source='Read 3 Nov 2026 · applies in NYC', stamp='IN EFFECT', lines=5, redact=True, note='→ NYC rule, since 1 Oct', note_at=1.8)
beat("Fines start at five twenty-five. Then ten fifty. Then thirty-five hundred. Per violation.", "stat",
     value=525, prefix='$', label='first violation', source='Source: NYC rules, § 20-703 · per violation',
     tiers=[('2ND', '$1,050'), ('3RD+', '$3,500')], source_y=1255)
beat("Charged after you tried to cancel? The rule can make them refund it. So screenshot your first attempt.", "point",
     head='Keep proof', body='Screenshot your first try', illo='phone')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
