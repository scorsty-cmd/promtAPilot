B = []
def beat(text, kind, **v): B.append(dict(text=text, kind=kind, **v))
beat("Your Snaps disappear. But some of what you post on Snapchat never really does.", "hook", lines=["Snaps vanish.", "Some posts", "DON'T"], accent=2, illo="timer")
beat("Snap's privacy policy says opened Snaps are deleted from its servers by default within twenty-four hours. Chats too, after they're read.", "point", head="Private Snaps", body="Deleted within 24 hours of opening", illo="timer")
beat("But public posts, like Spotlight, public Stories and Snap Map, count as Public Content. And there, the rules change.", "point", head="But public posts", body="Spotlight, Stories, Snap Map", illo="globe")
beat("In Snap's U.S. Terms of Service, you give Snap and other users an irrevocable, and perpetual right and license to that content.", "point", head="Terms, Section 2", body="“irrevocable, and perpetual right and license”", illo="quote")
beat("And it covers the name, image, likeness, and voice of anyone featured in it.", "point", head="Even your voice", body="Name, image, likeness and voice", illo="face")
beat("So if it's personal, keep it private. Turn on Ghost Mode, and think twice before posting to Spotlight.", "checklist", head="What you can do", items=["Keep it private", "Ghost Mode on", "Think before Spotlight"])
beat("Not legal advice. The full breakdown is on our YouTube channel, Hidden Layer. Follow for more.", "cta", lines=["Full breakdown on YouTube", "Hidden Layer · The Fine Print"])
