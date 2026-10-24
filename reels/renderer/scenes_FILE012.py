# FILE 012 - Android advertising ID (Google Play Console Help "Advertising ID", support.google.com, read 24 Oct 2026;
# ghacks path Settings > Privacy > Ads > Delete advertising ID, confirmed by Google page). Dark DNA variant.
PALETTE = {'A1': (228, 255, 60), 'A2': (189, 184, 172), 'BG': (14, 17, 26), 'TXT': (236, 232, 222), 'MUTED': (138, 140, 150)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 012'
MOOD = 'curious'
SEED = 127
KICKER = 'ON YOUR PHONE'
PUNCH_EVERY = 3
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Advertisers know your phone by a number.", "hook",
     lines=["Advertisers", "know your phone", "by a number."], accent=2, y=300,
     print='hand', print_box=(268, 965, 543, 300), print_rot=-3, ping=(549, 1068, ''))
beat("Every Android phone has one. Apps and advertisers use it to recognize your device.", "adid", **{'del': .7})
beat("Google's own page calls it a unique, user-deletable ID for advertising.", "doc",
     doc='Google Play Console Help', section='Advertising ID',
     quote="The advertising ID is a unique, user-resettable, and user-deletable ID for advertising, provided by Google Play services.",
     source='support.google.com · read 24 Oct 2026', stamp='CONFIRMED', lines=5, redact=True, note='→ yours to delete', note_at=1.6)
beat("To delete it: Settings, Privacy, Ads, Delete advertising ID.", "toggle",
     head='Cut the link', path=['Settings', 'Privacy', 'Ads', 'Delete advertising ID'], button=True, done='ID deleted')
beat("It won't end all tracking. Apps can use other signals. But it cuts one big link.", "compare",
     left=('YOU THINK', 'Delete it, tracking ends'), right=('REALITY', 'One link cut, others remain'), photo='street')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
