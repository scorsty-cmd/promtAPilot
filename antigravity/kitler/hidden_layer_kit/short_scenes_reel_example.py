# Example (test render 18 Oct 2026, not published). Copy the structure, never the topic or wording.
PALETTE = {'A1': (255, 77, 77), 'A2': (255, 196, 61)}
FILE_ID = 'FILE 004'
B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Incognito mode does not hide you.", "hook", lines=["Incognito", "doesn't", "hide you"], accent=2, photo='phone')
beat("Chrome says it right on the screen: your activity might still be visible to websites you visit.", "doc",
     doc='Chrome Incognito screen', section='New Incognito tab', quote='Your activity might still be visible to websites you visit',
     source='Google Chrome, read 18 Oct 2026')
beat("Your employer or school, too, if it's their network.", "photo", head='Still visible to', body='Your employer or school', photo='server', mark=(.5, .56))
beat("And your internet provider. That's three parties who can still see it.", "stat", value=3, label='parties can still see your browsing', source='Source: Chrome Incognito screen')
beat("You think it makes you invisible. It only stops saving your history on this device.", "compare",
     left=('YOU THINK', 'It makes me invisible'), right=('REALITY', 'It only skips your local history'))
beat("Save this before you forget. Follow for the hidden rules.", "cta", lines=['Save this before you forget', 'Follow for the hidden rules'])
