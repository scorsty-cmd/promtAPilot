# FILE 023 - payment-app balances and deposit insurance; CFPB Issue Spotlight (1 Jun 2023)
PALETTE = {'A1': (255, 140, 66), 'A2': (140, 200, 255), 'BG': (12, 14, 24), 'TXT': (244, 245, 248), 'MUTED': (150, 156, 176)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 023'
MOOD = 'tension'
SEED = 2323
KICKER = 'YOUR MONEY'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Your bank insures up to two hundred fifty thousand dollars. Your payment app? Often not.", "hook",
     lines=["Bank: $250,000", "insured.", "Your app?"], accent=2, y=330)
beat("That insurance covers money held in a bank. Money left in an app often isn't.", "insure", foot_at=3.6)
beat("Over three quarters of American adults have used one.", "stat",
     value=75, suffix='%+', label='of U.S. adults have used a payment app', source='CFPB, June 2023')
beat("The CFPB's own words: these funds often lack deposit insurance.", "doc",
     doc="CFPB Issue Spotlight", section='Payment apps, June 2023',
     quote='often are not placed in an account at a bank or credit union and lack individual deposit insurance coverage',
     source='Read 7 Nov 2026', stamp='CFPB', lines=5, redact=True, note='→ app terms decide', note_at=1.8)
beat("So read the terms. And move idle money back to your bank.", "checklist",
     head='BEFORE YOU LEAVE IT', items=['Read the balance terms', 'Move idle money to your bank'])
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
