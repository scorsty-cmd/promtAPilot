# FILE 010 - ChatGPT content may be used to train OpenAI models by default (Free/Plus/Pro); opt-out path; Temporary Chat
# kept up to 30 days. Sources read 23 Oct 2026: help.openai.com/en/articles/5722486 (How your data is used to improve
# model performance) and help.openai.com/en/articles/8914046 (Temporary Chat FAQ). Style: Hidden Layer style DNA (ink #121316 / paper #ECE8DE / highlighter #E4FF3C,
# Instrument Serif + IBM Plex Mono), 'Algorithm' dark variant; first Reel in the new identity.
PALETTE = {'A1': (228, 255, 60), 'A2': (189, 184, 172), 'BG': (18, 19, 22), 'TXT': (236, 232, 222), 'MUTED': (138, 135, 126)}
STYLE = 'dna'
CUTS = 'hard'
FILE_ID = 'FILE 010'
MOOD = 'curious'
SEED = 103
TYPING_HOOK = True
PUNCH_EVERY = 3
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Your ChatGPT chats aren't just yours.", "hook",
     lines=["Your ChatGPT", "chats aren't", "just yours."], accent=2, photo='typing', blur=2)
beat("OpenAI's own help page says: on Free, Plus and Pro, it may use your content to train its models.", "doc",
     doc='OpenAI Help Center', section='How your data is used to improve model performance',
     quote='When you use our services for individuals (Free, Plus, Pro), we may use your content to train our models.',
     source='help.openai.com · read 23 Oct 2026', stamp='OPT-OUT', lines=5, note='→ you have to opt out')
beat("So what you type, from cover letters to budgets, can become training data.", "ingest",
     chats=['Fix my cover letter', 'Plan my budget', 'Summarize my contract'], core='MODEL', label='TRAINING DATA',
     fly=.5, photo='server', blur=6)
beat("To stop it: Settings, Data controls, turn off Improve the model for everyone.", "toggle",
     head='Switch it off', path=['Settings', 'Data controls', 'Improve the model'], done='Not used for training')
beat("Temporary Chat skips training, but OpenAI may still keep a copy for up to thirty days.", "stat",
     value=30, suffix=' days', label='Temporary Chats can still be kept', source='Source: OpenAI Temporary Chat FAQ',
     note='→ "for safety purposes"', note_at=1.2)
beat("Save this before you forget. Follow for the hidden rules.", "cta",
     lines=["Save this before you forget", 'Follow for the hidden rules'])
