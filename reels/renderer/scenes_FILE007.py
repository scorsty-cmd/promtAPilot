# FILE 007 - photo location metadata (Apple Personal Safety User Guide, Sept 2026). Palette P3 coral/indigo.
PALETTE = {'A1': (255, 120, 90), 'A2': (120, 90, 255)}
FILE_ID = 'FILE 007'
MOOD = 'tension'
SEED = 71
KICKER = ''          # replaced by the live GPS ticker chip (GPS_TICKER)
GPS_TICKER = True
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Your photos can carry your exact location.", "hook",
     lines=["Your photos", "can carry your", "exact location"], accent=2, photo='pins_1', blur=13)
beat("With Location on, your Camera writes GPS coordinates into every photo.", "exif",
     photo='street_0', card_photo='street_0', lat='41.0371° N', lon='28.9850° E', when='21 OCT · 18:42')
beat("Apple's own guide warns: people you share them with may learn where it was taken.", "doc",
     doc='Manage location metadata in Photos', section='Apple Personal Safety User Guide · Sept 2026',
     quote='the people you share them with may be able to access the location metadata and learn where it was taken',
     source='support.apple.com, read 21 Oct 2026', stamp='LOCATION SHARED', lines=5)
beat("Snap one at home, and it can point right back to your door.", "photo",
     head='Taken at home?', body='It can point back to your door', photo='door_1', style='card')
beat("Before you share, tap Options, then switch Location off.", "toggle",
     head='Before you share', path=['Share', 'Options', 'Location'], done='Location Not Included')
beat("Or stop it for good: Settings, Privacy and Security, Location Services, Camera, Never.", "checklist",
     head='Stop it for good', items=['Privacy & Security', 'Location Services › Camera', 'Tap “Never”'])
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
