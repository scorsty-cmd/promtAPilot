# FILE 011 - Email tracking pixels: senders may know you opened an email (Gmail Help "Turn images on or off in Gmail",
# read 23 Oct 2026) + Englehardt, Han, Narayanan (Princeton), "I never signed up for this! Privacy implications of email
# tracking", PoPETs 2018: 12,618 mailing-list emails from 902 senders, 70% contain trackers (FTC PrivacyCon slides).
# Style: Hidden Layer style DNA, "Fine Print" PAPER variant (ink #121316 on paper #ECE8DE, highlighter #E4FF3C only).
PALETTE = {'A1': (228, 255, 60), 'A2': (138, 135, 126), 'BG': (236, 232, 222), 'TXT': (18, 19, 22), 'MUTED': (118, 115, 106)}
STYLE = 'dna'
PAPER = True
CUTS = 'hard'
FILE_ID = 'FILE 011'
MOOD = 'tension'
SEED = 113
KICKER = 'IN YOUR INBOX'
PUNCH_EVERY = 3
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("This email knows you opened it.", "hook",
     lines=["This email", "knows you", "opened it."], accent=2, y=300,
     print='hand', print_box=(268, 965, 543, 300), print_rot=-3, ping=(549, 1068, ''))
beat("Inside hides a one-pixel image. Open the email, it loads, and the sender gets a ping.", "pixel",
     fly=.55, sender='Weekly Deals <news@example.com>', subject='Your weekend picks are here')
beat("Gmail's own help page admits it: senders may know whether you've opened an email with an image.", "doc",
     doc='Gmail Help', section='Turn images on or off in Gmail',
     quote="Sometimes, senders may know whether you've opened an email that has an image.",
     source='support.google.com · read 23 Oct 2026', stamp='CONFIRMED', lines=5, redact=True, note='→ just by opening it', note_at=1.6)
beat("A Princeton study of twelve thousand marketing emails found trackers in seventy percent.", "stat",
     value=70, suffix='%', label='of marketing emails had trackers', count_y=850,
     source='Englehardt et al., Princeton · PoPETs 2018 · 12,618 emails', source_y=1252,
     print='desk', print_box=(200, 250, 680, 400), print_rot=3)
beat("To block it in Gmail: Settings, Images, Ask before displaying external images.", "toggle",
     head='Block the ping', path=['Settings', 'Images', 'Always display'], done='Ask before displaying')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
