# FILE 013 - Chrome "Do Not Track": Google Chrome Help "Turn Do Not Track on or off" (support.google.com/chrome/answer/2790761, read 28 Oct 2026).
PALETTE = {'A1': (228, 255, 60), 'A2': (138, 135, 126), 'BG': (236, 232, 222), 'TXT': (18, 19, 22), 'MUTED': (118, 115, 106)}
STYLE = 'dna'
PAPER = True
CUTS = 'hard'
FILE_ID = 'FILE 013'
MOOD = 'curious'
SEED = 131
KICKER = 'IN CHROME SETTINGS'
PUNCH_EVERY = 3
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Most sites ignore this Chrome switch.", "hook",
     lines=["Most sites", "ignore this", "Chrome switch."], accent=1, y=300,
     print='hand', print_box=(268, 965, 543, 300), print_rot=-3, ping=(549, 1068, ''))
beat("Do Not Track only sends a request. It asks websites not to track you. It can't make them.", "dnt", send=.9)
beat("Chrome's own help page says most sites, even Google's, don't change their behavior.", "doc",
     doc='Chrome Help', section='Turn "Do Not Track" on or off',
     quote="Most websites and web services, including Google's, don't change their behavior when they receive a Do Not Track request.",
     source='support.google.com · read 28 Oct 2026', stamp='CONFIRMED', lines=5, redact=True, note='→ a request, not a rule', note_at=1.6)
beat("It's off by default. To send it: Settings, Privacy and security, Third-party cookies.", "toggle",
     head='Send the request', path=['Settings', 'Privacy and security', 'Third-party cookies', 'Do Not Track'], done='Request sent')
beat("So don't expect it to stop tracking. It's a polite ask, nothing more.", "compare",
     left=('YOU THINK', 'It blocks trackers'), right=('REALITY', 'It only asks nicely'), photo='hand_1')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
