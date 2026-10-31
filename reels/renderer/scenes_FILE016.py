# FILE 016 - Echo "Do Not Send Voice Recordings" removed. Sources: TechCrunch 15 Mar 2025 (Amazon email), Tom's Guide 17 Mar 2025, AJC/AP Mar 2025. Read 31 Oct 2026.
PALETTE = {'A1': (190, 140, 255), 'A2': (120, 255, 200), 'BG': (12, 10, 22), 'TXT': (238, 236, 246), 'MUTED': (150, 146, 172)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 016'
MOOD = 'tension'
SEED = 161
KICKER = 'ECHO SPEAKERS'
PUNCH_EVERY = 2
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Some Echo speakers lost a privacy switch.", "hook",
     lines=["Some Echos", "lost their", "privacy switch"], accent=2, y=300)
beat("Only three models could process your voice on the device itself.", "stat",
     value=3, label='Echo models had it', source="Source: Tom's Guide, 17 Mar 2025")
beat("Then Amazon emailed owners that it would no longer support the feature.", "doc",
     doc='Amazon email to Echo owners', section='Do Not Send Voice Recordings',
     quote='we have decided to no longer support this feature',
     source='Amazon email, via TechCrunch · 15 Mar 2025', stamp='CONFIRMED', lines=5, redact=True, note='→ on-device mode, gone', note_at=1.6)
beat("Since March twenty-eighth, those requests go to Amazon's cloud.", "compare",
     left=('BEFORE', 'Voice handled on the device'), right=('SINCE 28 MARCH 2025', 'Voice sent to the cloud'))
beat("Amazon says you can still choose Don't save recordings, so audio is deleted after processing.", "point",
     head='Your choice', body="Don't save recordings", illo='lock')
beat("The trade-off: Voice ID stops working.", "point", head='Heads up', body='Voice ID stops working', illo='clock')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
