# FILE 008 - Gmail confidential mode can't stop screenshots (Google Gmail Help, read 22 Oct 2026).
# Palette: dark + red alert / yellow highlighter (new for the account). Myth-vs-fact + receipt format.
PALETTE = {'A1': (255, 72, 100), 'A2': (255, 214, 90)}
FILE_ID = 'FILE 008'
MOOD = 'curious'
SEED = 83
KICKER = 'IN YOUR GMAIL'
PUNCH_EVERY = 3
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Gmail's confidential mode has a blind spot.", "hook",
     lines=["Confidential", "mode has a", "blind spot"], accent=2, photo='typing_1', blur=4)
beat("It blocks forward, copy, print and download. But a screenshot still works.", "snap",
     label='CONFIDENTIAL', expires='EXPIRES IN 7 DAYS', buttons=['FORWARD', 'COPY', 'PRINT', 'DOWNLOAD'], off_end=.52, shutter=.72, photo='typing_1')
beat("Google's own help page says it: they can still take screenshots or photos of your emails.", "doc",
     doc='Send & open confidential emails', section='Gmail Help · Important note',
     quote='they can still take screenshots or photos of your emails',
     source='support.google.com, read 22 Oct 2026', stamp='STILL SAVED', lines=6)
beat("So it's not a lock. It just switches off a few buttons.", "compare",
     left=('YOU THINK', 'It locks the email'), right=('REALITY', 'It switches off buttons'), photo='desk')
beat("Keep passwords and ID numbers out of it. It stops accidents, not people.", "checklist",
     head='Never put in it', items=['Passwords', 'ID numbers', 'Anything you can’t take back'])
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
