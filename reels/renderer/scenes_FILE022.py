# FILE 022 - dynamic currency conversion: paying in your own currency abroad; Stiftung Warentest 2.6-12.0% (via Motley Fool 2023); Visa page
PALETTE = {'A1': (255, 99, 99), 'A2': (96, 232, 208), 'BG': (8, 17, 19), 'TXT': (244, 246, 242), 'MUTED': (150, 168, 168)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 022'
MOOD = 'bright'
SEED = 222
KICKER = 'YOUR MONEY'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Pay in dollars abroad, and the machine can add up to twelve percent.", "hook",
     lines=["Pay in dollars", "abroad?", "Up to 12% extra"], accent=2, y=330)
beat("Overseas, the machine asks which currency to charge. Your own sounds safer. It isn't. That rate usually carries a markup.", "dcc",
     local=('EUR', 100.00), own=('USD', 108.00), markup=.12, tap=4.6, foot='Safer? Not really.', foot2='EXAMPLE  ·  12% = TOP OF TESTED RANGE')
beat("A German consumer test found prices rose between two point six and twelve percent when it was used.", "stat",
     value=12, suffix='%', label='highest markup in a consumer test', source='Stiftung Warentest, via Motley Fool, 2023')
beat("And Visa's own page says the choice is yours.", "doc",
     doc="Visa travel page", section='Dynamic currency conversion',
     quote='the choice is yours in deciding to accept or decline the Dynamic Currency Conversion offer',
     source='Read 6 Nov 2026', stamp='CARD NETWORK', lines=5, redact=True, note='→ you can say no', note_at=1.6)
beat("So pick the local currency. Let your card network do the conversion, not the machine.", "compare",
     left=('YOU THINK', 'My currency is safer'), right=('REALITY', 'Local currency, no markup'))
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
