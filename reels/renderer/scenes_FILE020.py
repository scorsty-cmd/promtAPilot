# FILE 020 - Pay-in-4 (BNPL) loan stacking: CFPB 63% of borrowers had overlapping loans; 10.5% late fee (2021)
PALETTE = {'A1': (255, 122, 92), 'A2': (190, 255, 120), 'BG': (17, 12, 20), 'TXT': (246, 242, 238), 'MUTED': (166, 156, 164)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 020'
MOOD = 'tension'
SEED = 207
KICKER = 'YOUR MONEY'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Sixty-three percent of Pay in Four users have had several loans running at once.", "hook",
     lines=["Pay in 4?", "63% of users", "stack loans"], accent=1, y=330)
beat("Each one looks tiny. Four payments, two weeks apart. Stack three, and seventy-five dollars lands every other week.", "stack",
     rows=['STORE A', 'STORE B', 'STORE C'], amt=25)
beat("The CFPB checked six lenders' data: about sixty-three percent had overlapping loans.", "doc",
     doc="CFPB press release", section='13 Jan 2025 · 2022 loan data',
     quote='Approximately 63 percent of borrowers originated multiple simultaneous loans at some point during the year.',
     source='Read 4 Nov 2026 · 6 lenders, US', stamp='CFPB DATA', lines=5, redact=True, note='→ 63% of borrowers', note_at=1.8)
beat("In twenty twenty-one, ten point five percent paid a late fee.", "stat",
     value=10.5, suffix='%', label='of users charged a late fee', source='Source: CFPB, 15 Sep 2022 · 5 lenders, 2021', source_y=1255)
beat("Put every due date in one calendar.", "point",
     head='Before you tap buy', body='List every due date', illo='clock')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
