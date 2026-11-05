# Script + visual plan for "5 Free AI Tools That Feel Illegal to Know"
# Each beat = one narration line + what appears on screen.
# section: which tool we're on (used for header + progress bar). 0 = intro, 6 = outro

B = []
def beat(section, text, kind, **v):
    B.append(dict(section=section, text=text, kind=kind, **v))

# ---------------- HOOK ----------------
beat(0, "Most people are paying for AI tools every single month.",
     "hero", lines=["STOP PAYING", "FOR AI"], accent=1, illo="cards")
beat(0, "But some of the most powerful AI tools on the internet right now are completely free.",
     "hero", lines=["Powerful.", "And 100% FREE."], accent=1, illo="sparkle")
beat(0, "And a few of them are so good, they honestly feel like they shouldn't be legal to know about.",
     "hero", lines=["This feels", "ILLEGAL"], accent=1, illo="stamp")
beat(0, "In the next six minutes, I'll show you five of them: what they do, and exactly how to use them today.",
     "hero", lines=["5 TOOLS", "6 MINUTES"], accent=0, illo="timer")
beat(0, "Every tool here has a free option, and I'll tell you the catch for each one. Because there's always a catch.",
     "hero", lines=["Free. But what's", "the catch?"], accent=1, illo="info", small=True)
beat(0, "And the number one tool might replace your entire study routine. So stick around for that one.",
     "hero", lines=["#1 will change", "how you learn"], accent=0, illo="none")

# ---------------- #5 UPSCAYL ----------------
T5 = dict(num=5, name="Upscayl", tag="AI Image Upscaler", chips=["Free", "Open source", "Runs offline"])
beat(5, "Number five: Upscayl.", "tool", **T5)
beat(5, "You know that blurry, tiny image you found online? The one that falls apart the second you make it bigger?",
     "point", head="The problem", body="Small images get blurry when you enlarge them", illo="pixel")
beat(5, "Upscayl uses AI to rebuild the missing detail, making your image four times larger, or more, while keeping it sharp.",
     "point", head="The fix", body="AI rebuilds detail: 4x bigger, still sharp", illo="upscale")
beat(5, "It's free, it's open source, and here's the best part: it runs entirely on your own computer. No uploads, no account, no subscription.",
     "checklist", head="Why it's special", items=["No uploads", "No account", "No subscription"])
beat(5, "Use it for old family photos, thumbnails, product images, or wallpapers. Just drag the image in, pick a model, and hit upscale.",
     "steps", head="How to use it", items=["Drag image in", "Pick a model", "Hit Upscale"])
beat(5, "One thing to know: it works best with a decent graphics card, but most modern computers can handle it.",
     "point", head="The catch", body="Works best with a decent graphics card", illo="info")
beat(5, "Paid websites charge you per image for exactly this.",
     "hero", lines=["Others charge", "per image"], accent=1, illo="coin", small=True)

# ---------------- #4 NAPKIN ----------------
T4 = dict(num=4, name="Napkin AI", tag="Text to Visuals", chips=["Free plan", "Diagrams", "Charts"])
beat(4, "Number four: Napkin AI.", "tool", **T4)
beat(4, "Here's a problem everyone has. You write a great idea, but it's just a wall of text, and nobody wants to read a wall of text.",
     "point", head="The problem", body="Great ideas buried in a wall of text", illo="walltext")
beat(4, "Paste your text into Napkin, and it turns what you wrote into a clean visual: diagrams, flowcharts, timelines, and comparison charts.",
     "point", head="The fix", body="Paste text. Get a diagram.", illo="flow")
beat(4, "For example, paste in the steps of your morning routine, and Napkin turns them into a clean flowchart in seconds. Click a different style, and it redesigns the whole thing instantly.",
     "point", head="Example", body="Morning routine to flowchart in seconds", illo="flow")
beat(4, "You can change the colors, styles and icons, then export it straight into your slides, blog post, or social media.",
     "steps", head="How to use it", items=["Paste your text", "Pick a visual", "Export anywhere"])
beat(4, "The free plan is more than enough to try it properly. Just know that free exports may include a small watermark.",
     "point", head="Good to know", body="Free plan available. Exports may carry a watermark", illo="info")
beat(4, "If you make presentations, this alone can save you hours every week.",
     "hero", lines=["Save hours", "every week"], accent=0, illo="timer", small=True)

# ---------------- #3 OLLAMA ----------------
T3 = dict(num=3, name="Ollama", tag="Run AI on Your Own Computer", chips=["Free", "Private", "Works offline"])
beat(3, "Number three: Ollama. And this one is for anyone who cares about privacy.", "tool", **T3)
beat(3, "Ollama lets you run powerful open AI models, like Llama, Gemma, and Mistral, directly on your own computer.",
     "point", head="What it does", body="Open AI models running locally on your machine", illo="laptop")
beat(3, "That means your chats never leave your machine. It works offline, there are no usage limits, and it costs absolutely nothing.",
     "checklist", head="Why it's special", items=["Chats stay private", "Works offline", "No usage limits"])
beat(3, "Imagine summarizing confidential work documents, or drafting private notes, without sending a single word to anyone's servers.",
     "point", head="Example", body="Confidential docs, zero data sent anywhere", illo="laptop")
beat(3, "Install it, pick a model, and you've got your own private AI assistant. You can even connect it to other apps and build your own tools on top of it.",
     "steps", head="How to use it", items=["Install Ollama", "Download a model", "Start chatting"])
beat(3, "The only catch: bigger models need a stronger computer. But smaller models run surprisingly well on a normal laptop.",
     "point", head="Good to know", body="Bigger models need more power. Small ones run on laptops", illo="info")

# ---------------- #2 AI STUDIO ----------------
T2 = dict(num=2, name="Google AI Studio", tag="Free Access to Gemini Models", chips=["Free tier", "Huge context", "No code needed"])
beat(2, "Number two: Google AI Studio.", "tool", **T2)
beat(2, "Most people use Google's AI through the regular Gemini app. But developers have their own playground, and anyone can use it for free.",
     "point", head="The secret", body="The developer playground anyone can use", illo="chat")
beat(2, "Inside AI Studio, you get Google's latest Gemini models with huge context windows. So you can drop in long documents, long videos, or entire codebases, and ask questions about them.",
     "point", head="Huge context", body="Long docs, videos and code, all at once", illo="context")
beat(2, "For example, upload a long lecture recording and ask for the five most important points, with timestamps. It handles that in one go.",
     "point", head="Example", body="Long lecture to key points with timestamps", illo="context")
beat(2, "You can also adjust settings the normal app hides, like how creative the answers are, and even build small apps just by describing them.",
     "checklist", head="Hidden powers", items=["Tune creativity", "Bigger inputs", "Build apps by describing"])
beat(2, "It's built for developers, but you don't need to write a single line of code. Free limits do apply and can change, but for everyday use, it's very generous.",
     "point", head="Good to know", body="No coding needed. Free limits apply and can change", illo="info")

# ---------------- #1 NOTEBOOKLM ----------------
T1 = dict(num=1, name="NotebookLM", tag="Your Personal AI Research Assistant", chips=["Free", "Cites sources", "Audio overviews"])
beat(1, "And number one: NotebookLM, also from Google.", "tool", **T1)
beat(1, "Upload your sources: PDFs, websites, YouTube videos, notes, or slides. NotebookLM reads all of them and becomes an expert on exactly that material.",
     "point", head="What it does", body="Upload sources. It becomes an expert on them", illo="docs")
beat(1, "Ask it anything, and it answers using your sources, with citations that show where each answer came from. So it's far less likely to make things up.",
     "point", head="Grounded answers", body="Every answer cites your sources", illo="cite")
beat(1, "That makes it perfect for exam prep, research papers, or understanding a long contract before you sign it.",
     "checklist", head="Perfect for", items=["Exam prep", "Research papers", "Long contracts"])
beat(1, "But here's the feature that feels illegal. With one click, it turns your documents into an audio overview: a podcast-style conversation between two AI hosts, discussing your material like a real show.",
     "point", head="The illegal part", body="One click: your documents become a podcast", illo="podcast")
beat(1, "You can even join the conversation and ask the hosts questions while they talk.",
     "point", head="Wait, what?", body="Interrupt the hosts and ask questions", illo="chat")
beat(1, "Imagine turning a fifty-page report into a podcast you can listen to on your commute.",
     "hero", lines=["50-page report", "into a podcast"], accent=1, illo="podcast", small=True)
beat(1, "It can also create study guides, flashcards, quizzes, and mind maps from the same sources. And yes, the core features are free.",
     "checklist", head="Even more", items=["Study guides", "Flashcards & quizzes", "Mind maps"])

# ---------------- OUTRO ----------------
beat(6, "So, quick recap.", "hero", lines=["Quick", "recap"], accent=1, illo="none", small=True)
beat(6, "Upscayl for sharper images. Napkin for instant visuals. Ollama for private AI on your own computer. Google AI Studio for free access to powerful models. And NotebookLM to learn anything faster.",
     "recap", items=[("5", "Upscayl", "Sharper images"), ("4", "Napkin AI", "Instant visuals"),
                     ("3", "Ollama", "Private local AI"), ("2", "Google AI Studio", "Free powerful models"),
                     ("1", "NotebookLM", "Learn anything faster")])
beat(6, "Free plans and limits can change over time, so always check each tool's current terms before you rely on it.",
     "point", head="Quick note", body="Free plans can change. Check current terms", illo="info")
beat(6, "Which one are you trying first? Let me know in the comments.",
     "hero", lines=["Which one", "first?"], accent=1, illo="comment")
beat(6, "I'll put links to all five tools in the description.",
     "hero", lines=["Links in the", "description"], accent=1, illo="none", small=True)
beat(6, "And if you want more AI tools that actually save you time and money, subscribe. The next one is even better.",
     "subscribe", lines=["SUBSCRIBE", "for more AI tools"])

SECTION_NAMES = {5: "Upscayl", 4: "Napkin AI", 3: "Ollama", 2: "Google AI Studio", 1: "NotebookLM"}

# --- metadata used by the kit ---
SECTION_ORDER = [5, 4, 3, 2, 1]          # order of the progress bar segments
SECTION_PREFIX = '#'                     # chip shows "#5  Upscayl"; '' shows just the name
INTRO_CHAPTER = 'Stop paying for AI'
RECAP_TITLE = 'The 5 free tools'
TIMER_TEXT = '6:00'
PALETTE = {}                             # e.g. {'A1': (255, 196, 61), 'A2': (64, 156, 255)} to change the look
THUMB = dict(top='5 FREE AI TOOLS', big=['FEELS', 'ILLEGAL'], stamp='FREE', badge='AI')
