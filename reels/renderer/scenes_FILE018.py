# FILE 018 - Same cart, different prices (Consumer Reports/Groundwork Instacart test; FTC proposed personalized-pricing policy 19 Aug 2026)
PALETTE = {'A1': (255, 112, 136), 'A2': (240, 208, 112), 'BG': (22, 10, 16), 'TXT': (246, 238, 238), 'MUTED': (168, 150, 156)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 018'
MOOD = 'tension'
SEED = 181
KICKER = 'YOUR MONEY'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Same store. Same groceries. Prices up to twenty-three percent apart.", "hook",
     lines=["Same groceries.", "Prices up to", "23% apart"], accent=2, y=330)
beat("Consumer Reports had four hundred thirty-seven shoppers add the same items. Nearly three quarters showed more than one price.", "cart",
     names=('SHOPPER A', 'SHOPPER B'), foot='Same store. Same items.', foot2='EXAMPLE NUMBERS  ·  ILLUSTRATION')
beat("This August, the FTC proposed that stores must tell you when your data sets the price.", "doc",
     doc='FTC proposed policy statement', section='Chairman Ferguson · 19 Aug 2026',
     quote='businesses that fail to tell consumers how their personal data is being used to set a price',
     source='Reported by Hunton · proposal, not final', stamp='PROPOSED', lines=5, redact=True, note='→ not law yet', note_at=1.6)
beat("It's still just a proposal. So check your cart on a second phone before you pay.", "point",
     head='Before you pay', body='Compare on a 2nd phone', illo='phone')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
