# FILE 015 - Smart TV ACR. Sources: Texas AG (Samsung agreement release, read 30 Oct 2026); TechRadar 16 Dec 2025 (suit: "as often as every 500 milliseconds"); Malwarebytes Mar 2026 (settings paths).
PALETTE = {'A1': (90, 200, 255), 'A2': (255, 214, 92), 'BG': (10, 14, 22), 'TXT': (236, 238, 244), 'MUTED': (140, 150, 168)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 015'
MOOD = 'curious'
SEED = 151
KICKER = 'SMART TVS'
PUNCH_EVERY = 3
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Your TV may screenshot your screen twice a second.", "hook",
     lines=["Your TV may", "screenshot", "twice a second."], accent=2, y=300, ping=(540, 1150, ''))
beat("Texas says smart TVs can capture your screen as often as every half second. It's called ACR.", "acr")
beat("Samsung's agreement with Texas says it must stop collecting that viewing data without express consent.", "doc",
     doc='Texas Attorney General', section='Samsung agreement',
     quote="Samsung must halt any collection or processing of ACR viewing data without obtaining Texas consumers' express consent.",
     source='texasattorneygeneral.gov · read 30 Oct 2026', stamp='CONFIRMED', lines=5, redact=True, note='→ ACR = what you watch, matched', note_at=1.8)
beat("On Samsung, turn off Viewing Information Services under Privacy Choices.", "toggle",
     head='Switch it off', path=['Settings', 'Support', 'Terms & Privacy', 'Viewing Information Services'], done='ACR off')
beat("Menus vary by brand and model, so search your TV's settings for ACR.", "compare",
     left=('YOU THINK', 'My TV only shows things'), right=('REALITY', 'It may also watch back'), photo='street_0')
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
