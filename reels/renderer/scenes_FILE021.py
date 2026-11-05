# FILE 021 - credit score: salary is 0% of it; FICO category weights 35/30/15/10/10
PALETTE = {'A1': (132, 150, 255), 'A2': (255, 233, 140), 'BG': (11, 13, 25), 'TXT': (246, 244, 238), 'MUTED': (160, 164, 184)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 021'
MOOD = 'curious'
SEED = 211
KICKER = 'YOUR MONEY'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Your salary counts for zero percent of your credit score.", "hook",
     lines=["Your salary", "is 0%", "of your score"], accent=1, y=330)
beat("Here's the breakdown. Thirty-five percent is paying on time. Thirty is how much of your limit you use. The rest is history, new accounts, and mix.", "weights",
     rows=[('PAID ON TIME', 35), ('AMOUNT OWED', 30), ('HISTORY LENGTH', 15), ('NEW CREDIT', 10), ('CREDIT MIX', 10)],
     zero=('YOUR SALARY', '0%'), at=[1.4, 3.3, 5.1, 5.5, 5.9], zero_at=6.6, foot='Pay on time. Owe less.', foot2='FICO CATEGORY WEIGHTS · VIA EXPERIAN, 2021')
beat("Experian says it plainly: your score is about how you manage accounts, not how much you make.", "doc",
     doc="Experian blog", section='1 Oct 2021 · income and scores',
     quote='Your credit score is based on how you manage your credit accounts, not how much you make.',
     source='Read 5 Nov 2026', stamp='CREDIT BUREAU', lines=5, redact=True, note='→ salary is not an input', note_at=1.8)
beat("A bigger paycheck won't raise it. On-time payments and low balances will.", "compare",
     left=('YOU THINK', 'Higher pay, higher score'), right=('REALITY', 'On time, low balances'))
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
