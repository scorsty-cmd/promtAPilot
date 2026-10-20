# FILE 006 - recycled phone numbers (Princeton CITP study, 2021). Palette P1 teal/violet.
PALETTE = {'A1': (53, 240, 208), 'A2': (139, 108, 255)}
FILE_ID = 'FILE 006'
MOOD = 'curious'
SEED = 61
KICKER = 'RECYCLED NUMBERS // 66%'
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Your old phone number can still open your accounts.", "hook",
     lines=["Your old number", "can open", "your accounts"], accent=2, photo='keypad')
beat("Switch numbers, and your carrier gives it to a stranger.", "numswap", number='+1 (555) 014-2297')
beat("Princeton checked 259. Sixty-six percent were still linked to old accounts.", "stat",
     value=66, suffix='%', label='of "new" numbers still linked to old accounts', source='Princeton study: 171 of 259 numbers')
beat("Login codes go to that number. The study warns accounts could be hijacked.", "doc",
     doc='Security and Privacy Risks of Number Recycling', section='Princeton CITP · Abstract · 2021',
     quote='potentially allowing those accounts to be hijacked', source='Lee & Narayanan, read 20 Oct 2026', stamp='HIJACK RISK', lines=6)
beat("Before you switch, remove that number from every account.", "photo",
     head='Before you switch', body='Remove it from every account', photo='hand', style='card')
beat("Use app codes, not texts — or park the old number.", "checklist",
     head='Then', items=['App codes, not texts', 'Or park the old number'])
beat("Save this — you'll need it. Follow for the hidden rules.", "cta",
     lines=["Save this — you'll need it", 'Follow for the hidden rules'])
