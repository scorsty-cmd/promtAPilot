# FILE 024 - Amazon Prime FTC settlement ($1B penalty, up to $1.5B redress); FTC 25 Sep 2025 + 17 Sep 2026
PALETTE = {'A1': (255, 92, 120), 'A2': (120, 230, 170), 'BG': (10, 14, 18), 'TXT': (244, 246, 245), 'MUTED': (146, 158, 160)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 024'
MOOD = 'curious'
SEED = 2424
KICKER = 'YOUR MONEY'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Amazon is refunding up to one point five billion dollars. All because of how Prime signs you up.", "hook",
     lines=["Amazon refunds", "up to", "$1.5 billion"], accent=2, y=330)
beat("The FTC says an estimated thirty-five million people were affected. Plus a one billion dollar penalty.", "stat",
     value=35, suffix='M', label='people affected, FTC estimate', source='FTC, 25 Sep 2025',
     tiers=[('PENALTY', '$1B'), ('REFUNDS', 'up to $1.5B')], source_y=1255)
beat("The FTC chairman said Amazon made it exceedingly hard to end a subscription.", "doc",
     doc="FTC press release", section='25 Sep 2025',
     quote='made it exceedingly hard for consumers to end their subscription',
     source='Read 11 Nov 2026', stamp='SETTLED', lines=5, redact=True, note='→ FTC wording', note_at=1.8)
beat("By September, over eight hundred forty-five million dollars had gone out. Automatically.", "payout",
     amount=845, frac=.56, fill_at=.7, auto_at=2.7)
beat("No claim form. And if anyone asks you to pay for a refund, that's a scam.", "checklist",
     head='IF YOU THINK YOU QUALIFY', items=['Payments are automatic', 'Never pay to get a refund'])
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
