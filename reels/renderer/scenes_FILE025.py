# FILE 025 - overdraft fees: $4 coffee example, NCLC $12B (2025), CFPB opt-in rule
PALETTE = {'A1': (190, 160, 255), 'A2': (210, 255, 90), 'BG': (13, 12, 18), 'TXT': (244, 244, 246), 'MUTED': (152, 150, 166)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 025'
MOOD = 'tension'
SEED = 2525
KICKER = 'YOUR MONEY'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("A four dollar coffee can cost you thirty-nine.", "hook", lines=["A $4 coffee", "can cost you", "$39"], accent=2, y=330, photo="coffee")
beat("Your balance runs short. The bank approves it, then adds a fee. About thirty-five dollars is typical.", "ledger", r1=.4, r2=2.2, tot=3.6)
beat("In twenty twenty-five, struggling families paid over twelve billion dollars in overdraft and N S F fees.", "stat",
     value=12, prefix='$', suffix='B', label='overdraft + NSF fees in 2025', source='NCLC, 20 largest banks, 3 Jun 2026',
     tiers=[('TYPICAL', '~$35'), ('FEE CAP', 'REVERSED')], source_y=1255)
beat("But on debit card and ATM purchases, the CFPB says banks can't charge it without your opt-in.", "doc",
     doc="CFPB", section='17 Sep 2024 release',
     quote='cannot charge overdraft fees on ATM and one-time debit card transactions unless consumers have affirmatively opted in',
     source='Read 12 Nov 2026', stamp='OPT-IN', lines=5, redact=True, note='→ your choice', note_at=1.8)
beat("So check your settings. No opt-in, and a short balance gets declined, not fined.", "checklist",
     head="CHECK YOUR BANK APP", blur=True, photo="coffee_1", items=['Find overdraft coverage', 'Opt in only if you want it'])
beat("Save this before you forget. Follow for the hidden rules.", "cta", lines=["Save this before you forget", 'Follow for the hidden rules'])
