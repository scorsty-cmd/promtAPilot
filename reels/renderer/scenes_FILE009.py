# FILE 009 - Connected-car driving data -> consumer reports -> insurers (FTC v. GM/OnStar: complaint 16 Jan 2025,
# final order 14 Jan 2026; ftc.gov press releases read 22 Oct 2026). Palette: dark + lime alert / cyan trace (new).
PALETTE = {'A1': (190, 255, 60), 'A2': (60, 200, 255)}
FILE_ID = 'FILE 009'
MOOD = 'tension'
SEED = 91
KICKER = 'FTC CASE · GM'
SPEED_LINES = True
PUNCH_EVERY = 3
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Did your car raise your insurance?", "hook",
     lines=["Did your car", "raise your", "insurance?"], accent=2, photo='road', blur=3)
beat("The FTC says GM tracked where and how people drove, sometimes every three seconds.", "telemetry",
     events=[(.38, 'HARD BRAKE'), (.62, '11:47 PM'), (.86, 'SPEEDING')], every='EVERY 3 S', photo='dash')
beat("Every hard brake, late-night drive and speeding moment was sold to consumer reporting agencies. Insurers used it to set rates.", "report",
     rows=[('HARD BRAKING', '14'), ('LATE-NIGHT TRIPS', '9'), ('SPEEDING', '6')], stamp='SOLD', sold=.42,
     to='INSURER', before=1180, after=1490, photo='wheel')
beat("In January, the FTC finalized a five-year ban on GM sharing that data.", "headline",
     outlet='FTC.gov', title='Final order: GM barred from sharing driver data with consumer reporting agencies for 5 years',
     date='JAN 14 2026', ref='ORDER FINAL', photo='brake')
beat("Drive a connected car? Check its app for data-sharing settings.", "checklist",
     head='Check today', items=['Open your car’s app', 'Find data sharing', 'Switch off what you didn’t choose'])
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
