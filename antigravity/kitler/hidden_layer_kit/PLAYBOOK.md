# Hidden Layer – Video Production Playbook

Channel: **Hidden Layer**, an English-language, faceless YouTube channel about the hidden rules that run your digital life.
Promise to the viewer: "The systems deciding what you pay, see and give away — explained with real numbers and the actual text."
Two weekly series:
- **Thursday – The Algorithm**: how an invisible system really works (pricing, recommendations, ranking, prediction).
- **Friday – The Fine Print**: what you actually agreed to in a popular app's or device's Terms of Service / Privacy Policy.
Owner speaks Turkish: every message to the owner is in Turkish; everything inside the video, thumbnail, title, description is English.
Length 8–10 minutes (≈1,250–1,450 narrated words at speed 0.92).
Zero paid credits: never call credit-consuming tools (vidIQ generate_*, voiceover, broll, outliers, search, etc.). Everything is made locally with this kit.
The end card says "SUBSCRIBE" with subtitle "Hidden Layer · new rules every Thursday & Friday".

## 1. Pick today's topic
Use today's date (Europe/Istanbul) in the calendar below. If today's date is not in the table, or the table has run out,
research a fresh topic for that weekday's series (WebSearch: what people are asking about apps, prices, privacy this
week) that is NOT a repeat of any title below or of an earlier delivered video (search Gmail for subjects
"Hidden Layer video hazır" and "PromptPilot video hazır"). A breaking news story (a big Terms-of-Service change, a viral
pricing controversy) may replace the planned topic if it is clearly more interesting and advertiser-friendly.

| Date | Series | Working title | Palette |
|---|---|---|---|
| 2026-10-16 Fri | The Fine Print | You Didn't Read TikTok's Terms — Here's What You Actually Agreed To | P6 |
| 2026-10-22 Thu | The Algorithm | Your Uber Price Isn't Random — And What Actually Decides It | P2 |
| 2026-10-23 Fri | The Fine Print | What You Type Into ChatGPT Isn't Just Yours — Here's Where It Goes | P1 |
| 2026-10-29 Thu | The Algorithm | Incognito Mode Is Not What You Think — And What It Actually Hides | P3 |
| 2026-10-30 Fri | The Fine Print | Your Smart TV Is Watching What You Watch — Here's the Clause | P5 |
| 2026-11-05 Thu | The Algorithm | Same Flight, Same Seat, 2 Different Prices — How Airlines Really Decide | P4 |
| 2026-11-06 Fri | The Fine Print | Deleting a Photo Doesn't Delete It — Here's Where It Actually Goes | P2 |
| 2026-11-12 Thu | The Algorithm | Netflix Doesn't Show Everyone the Same Thumbnail — Here's Why | P6 |
| 2026-11-13 Fri | The Fine Print | Your Car Knows More Than Your Phone — What You Agreed To | P3 |
| 2026-11-19 Thu | The Algorithm | Your For You Page Isn't Random — What TikTok Actually Measures | P1 |
| 2026-11-20 Fri | The Fine Print | WhatsApp Can't Read Your Messages — But Here's What It Does See | P4 |
| 2026-11-26 Thu | The Algorithm | Spotify Isn't Guessing — How It Actually Picks Your Next Song | P5 |
| 2026-11-27 Fri | The Fine Print | Your Smart Speaker Isn't Always Recording — But Here's What It Keeps | P6 |
| 2026-12-03 Thu | The Algorithm | Same Product, 2 Different Prices — What Actually Changes When You Look Again | P2 |
| 2026-12-04 Fri | The Fine Print | That AI Photo App Wants Your Face — Here's What You Gave It | P1 |
Working titles are starting points: the final title must follow section 1b and use real facts found in research.

## 1b. Title & thumbnail formulas (learned from fast-growing new channels)
Every title uses ONE of these two patterns, and the video must fully deliver its payoff:
- **"Not what you think"**: "<Thing> Is Not What You Think — And What It Actually <Does/Hides/Decides>" or
  "<Thing> Doesn't <expected thing> — Here's What Actually Happens". The "what it actually is" answer must be stated
  plainly in the video (tease it in the hook, deliver it fully later) and must come from documented sources.
- **Contradiction + real number**: "Same Ride, Same Minute, 2 Different Prices", "4,000 Words of Terms, 1 Clause That
  Matters". Every number must be real and verifiable from your research (count words/pages yourself; quote real figures);
  never invent or round up a number for effect.
Rules: aim for ≤ 70 characters (100 max; the key words must be in the first 50), at most one ALL-CAPS word, no
"SHOCKING"/"they don't want you to know" style bait, no claim the video doesn't prove. Give 3 options in
upload_details.txt: one of each pattern plus one plain-search variant (e.g. "TikTok Terms of Service Explained").
The first sentence of the hook restates the title's promise in spoken words.
Thumbnail: 2–4 big words that state the contradiction (e.g. big "NOT PRIVATE", stamp "YOU AGREED"), never the full
title; one clear accent colour; readable at phone size.

Already produced (do not repeat): "5 Free AI Tools That Feel Illegal to Know", "7 Hidden AI Features in Apps You Already Use".

Palettes (set `PALETTE` in scenes.py):
P1 {'A1': (53,240,208), 'A2': (139,108,255)} teal/violet · P2 {'A1': (255,196,61), 'A2': (64,156,255)} amber/blue ·
P3 {'A1': (255,120,90), 'A2': (120,90,255)} coral/indigo · P4 {'A1': (120,230,120), 'A2': (40,170,220)} green/cyan ·
P5 {'A1': (255,110,200), 'A2': (90,120,255)} pink/blue · P6 {'A1': (250,250,250), 'A2': (255,77,109)} white/red.

## 2. YouTube monetization & policy guardrails (must pass all)
Since July 2026 YouTube removes channels with "excessive" inauthentic content from the Partner Program: repetitive or
template-based videos with little variation, tutorials that just restate widely available material without original
analysis, emotionally manipulative/distressing content, and AI personas giving health/finance/legal guidance.
So every video MUST:
- Deliver original value: real research (WebSearch + WebFetch primary sources), concrete examples with real numbers,
  and the narrator's own clear takeaways. No reworded copies of other videos/articles.
- Look different from the previous video: different palette, scene mix, and at least 5 NEW topic-specific illustrations
  in custom_illos.py (see custom_illos_example.py). Never reuse last video's hook wording or thumbnail text.
- Be factually checked against current primary sources. If unsure, cut it. Put the sources in the description.
- Be advertiser-friendly: no profanity, violence, shock, sexual content, drugs, gambling, contested politics, tragedies.
  No hacking, jailbreaking, piracy, bypassing paywalls/pricing systems, or "make money fast" claims. Curious, fair tone,
  never fear-mongering.
- Title and thumbnail must match the content (curiosity is fine, lying is not).
- Use only our own generated visuals, music and sound. Never draw or imitate brand logos, mascots, app icons or UI
  screenshots; product/company names as plain text are fine. No copyrighted clips, images or songs.
- Describe the voice as AI-generated in the description.

### Extra rules for The Fine Print (Friday)
- Read the CURRENT official documents yourself with WebFetch (Terms of Service, Privacy Policy, and any help-center page
  they point to). Note each document's "last updated" date and the date you read it.
- Quote clauses word-for-word in quotation marks, naming the document and section; never paraphrase inside quotes.
  Show the quote on screen (point beat body or a custom quote illustration) and show "Source: <doc>, read <date>".
- Explain plainly what the clause allows, AND what it does not mean. Include the company's own stated reason when given.
  No claims that a company breaks the law, spies illegally, or sells data unless an official source says so.
- End with practical, documented settings/choices the viewer can use (e.g. where to turn off ad personalization), and
  say "This isn't legal advice — terms change, so check the current version (linked below)." Never tell viewers to sue,
  complain to regulators, or take legal action.
### Extra rules for The Algorithm (Thursday)
- Separate clearly: what the company has officially said / documented (engineering blogs, help pages, patents, court or
  regulator documents, peer-reviewed research) vs. what is speculation or myth. Label myths as myths on screen.
- Use worked examples with plausible illustrative numbers clearly marked "example" when real figures aren't public.
- No advice on gaming or exploiting systems in ways that break terms; tips must be legitimate (e.g. compare prices,
  check settings).

## 3. Script & structure (8–10 min)
- 0:00–0:30 cold-open hook: the surprising fact/clause in the first sentence, what they'll understand by the end, a tease
  of the most surprising part (saved for later in the video).
- Body: 5–7 sections. Algorithm episodes: the everyday situation → what's really going on, step by step → a worked
  example → myths vs facts → what it means for you. Fine Print episodes: what you agreed to (quoted) → what data / rights
  → how it's used → what it does NOT mean → the most surprising clause → what you can change in settings.
- Pattern interrupts every 40–60 s (a question, a surprising number, a quote reveal, a mini-recap).
- End: recap beat, a comment question ("Which app should we read next?"), "sources in the description", subscribe beat.
- Beat text: 1–3 sentences, conversational, short words. Say numbers as words when spoken, digits on screen.

## 4. scenes.py format (see scenes_example.py, an earlier video)
beat(section, narration_text, kind, **visual) with kinds:
- hero: lines=[...2 lines], accent=index of accent line (-1 none), illo=name|'none', small=True for shorter lines
- tool: num, name, tag, chips=[...], optional kicker (e.g. 'CLAUSE 3', 'STEP TWO', 'MYTH ONE'; default "NUMBER N")
- point: head, body (≤ 9 words), illo
- checklist / steps: head, items=[2–4 short items]
- recap: head, items=[(num, name, short note), ...] (up to 8)
- subscribe: lines=['SUBSCRIBE', 'Hidden Layer · new rules every Thursday & Friday']
Optional beat key chapter='Label' forces a YouTube chapter at that beat.
Module-level: SECTION_NAMES {id: label}, SECTION_ORDER [ids in progress-bar order], SECTION_PREFIX ('#' or ''),
INTRO_CHAPTER, RECAP_TITLE, TIMER_TEXT, PALETTE, THUMB=dict(top, big=[1–2 lines], stamp, badge, big_color, layout).
For The Fine Print use SECTION_PREFIX='' and THUMB top like 'THE FINE PRINT', stamp like 'YOU AGREED'.
For The Algorithm use THUMB top like 'THE ALGORITHM'.
Built-in illos: pixel upscale walltext flow info laptop chat context docs cite podcast cards coin sparkle stamp timer comment
(stamp shows 'CLASSIFIED'; write your own variants in custom_illos.py, e.g. a highlighted-clause document, a price meter).

## 5. Build commands (run from the kit folder)
    sh setup.sh                                   # once per workspace (~350 MB model download)
    python3 tts.py af_heart 0.92                  # voice; ~3 min per 10 min of video
    python3 render.py --beats                     # one preview frame per beat -> preview_sheet_*.jpg; LOOK at every sheet
    nohup python3 render.py --out video_noaudio.mp4 > render.log 2>&1 &   # ~1.6x real time; poll render.log
    python3 audio.py                              # voice + generated music bed + whooshes -> mix.wav
    python3 deliver.py <Slug>                     # <Slug>_full.mp4 (YouTube) + <Slug>.mp4 (≤28 MB for the chat)
    python3 thumb.py                              # thumbnail.jpg (1280x720) – look at it
    python3 chapters.py                           # chapter list for the description
Shell commands time out after 5 minutes: run long steps with nohup in the background and poll.
Target total length 8:00–10:00 (render.py --beats prints it). Too short → add depth, not filler.

## 6. Quality checks before delivering
- View every preview sheet: no text overlapping captions, no text off-screen, every illustration fits its topic.
- Extract 6+ frames from the final MP4 at different times and look at them; check audio levels (volumedetect, max < -0.5 dB).
- Re-read the script once against the guardrails in section 2; for Fine Print re-check every quote against the source.

## 7. Deliver to the owner
Chat file cards are limited to 30 MB, so:
1. `python3 split.py <Slug>` → parts_<Slug>/ with full-quality ≤28 MB parts + BIRLESTIR_cift_tikla.bat (Windows join).
2. SendUserFile (status proactive, display attach), call 1: every part + the .bat.
3. SendUserFile call 2: <Slug>.mp4 (the ≤28 MB single file, handy to watch or upload from a phone), thumbnail.jpg,
   upload_details.txt containing 3 title options (≤ 70 chars), description (hook paragraph, what's inside, links to every
   source document with "read on <date>", chapters, "Voiceover is AI-generated. Not sponsored. Not legal advice." for
   Fine Print, 3–5 hashtags), tags (≤ 15), category Science & Technology, not made for kids, a pinned-comment question.
4. Email with the Gmail connector to scorsty@gmail.com, subject "Hidden Layer video hazır: <title>", Turkish body:
   series + topic + length, where the files are (this scheduled run's session in the Claude app, file names), how to join
   the parts (all parts + .bat in one folder, double-click the .bat; or use the single smaller MP4), title, description,
   chapters, tags, and a reminder to watch it once before uploading.
5. Finish with a short Turkish summary. The owner uploads to YouTube himself; nothing is posted automatically.
