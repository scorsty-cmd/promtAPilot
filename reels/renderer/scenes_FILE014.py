# FILE 014 - Chrome Incognito: Google Chrome Help "Browse in Incognito mode" (support.google.com/chrome/answer/95464, read 29 Oct 2026).
PALETTE = {'A1': (255, 122, 69), 'A2': (189, 184, 172), 'BG': (14, 17, 26), 'TXT': (236, 232, 222), 'MUTED': (138, 140, 150)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 014'
MOOD = 'tension'
SEED = 141
KICKER = 'IN CHROME'
PUNCH_EVERY = 3
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Incognito doesn't make you invisible.", "hook",
     lines=["Incognito", "doesn't make", "you invisible."], accent=2, y=300,
     print='hand_old0', print_box=(340, 900, 400, 500), print_rot=-3, ping=(540, 1120, ''))
beat("It only stops your device saving history. Three groups can still see your activity.", "incog", look=.9)
beat("Chrome's own help page lists them: websites, your school or employer, your internet provider.", "doc",
     doc='Chrome Help', section='Browse in Incognito mode',
     quote="Websites you visit, including Google sites, and organizations that manage your network, like your school, employer, or internet service provider, may be able to observe your activity in Incognito.",
     source='support.google.com · read 29 Oct 2026', stamp='CONFIRMED', lines=5, redact=True, note='→ hidden from this device only', note_at=1.8)
beat("So it hides your history from the next person on this device. Not from the network.", "compare",
     left=('YOU THINK', 'Nobody can see me'), right=('REALITY', 'Only my history is skipped'), photo='street_old0')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
