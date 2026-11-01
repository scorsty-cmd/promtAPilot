# FILE 017 - California Opt Me Out Act (AB 566): browsers must offer an opt-out preference signal from 1 Jan 2027.
# Sources: CPPA announcement 8 Oct 2025; Hunton (operative 1 Jan 2027); Faegre Drinker (Sephora $1.2M, 24 Aug 2022). Read 1 Nov 2026.
PALETTE = {'A1': (150, 240, 110), 'A2': (255, 176, 64), 'BG': (8, 16, 14), 'TXT': (236, 244, 238), 'MUTED': (140, 160, 148)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 017'
MOOD = 'curious'
SEED = 171
KICKER = 'CALIFORNIA LAW'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("California is ordering browsers to add a privacy switch.", "hook",
     lines=["California orders", "browsers to add", "a privacy switch"], accent=2, y=300)
beat("Do Not Track is only a request. An opt-out signal is different: covered businesses must honor it.", "gpc",
     head='YOUR BROWSER  ·  SIGNAL', ask='OPT-OUT: 1', please='= do not sell or share my data',
     tile_before='SELLING: ON', tile_after='SELLING: OFF', stamp='HONORED', foot='Not a request. A rule.', foot2='EXAMPLE SITES  ·  ILLUSTRATION', send=.9)
beat("The state privacy agency says the law requires browsers to offer easy-to-use opt-out signals.", "doc",
     doc='California Privacy Protection Agency', section='AB 566, announcement',
     quote='requires browsers operating in California to offer easy-to-use opt-out preference signals',
     source='CPPA announcement · 8 Oct 2025', stamp='SIGNED', lines=5, redact=True, note='→ built into the browser', note_at=1.6)
beat("Sephora settled for one point two million dollars after California said its site ignored the signal.", "stat",
     value=1.2, prefix='$', suffix='M', label='Sephora settlement, 2022', source='Source: Faegre Drinker, 13 Sep 2022')
beat("The law starts in January twenty twenty-seven.", "point",
     head='Starts', body='January 2027', illo='clock')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
