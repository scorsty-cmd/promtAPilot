---
name: "diy-hack-shorts"
description: "Use when the user asks for a DIY / life-hack style YouTube Short made without a camera — animated step-by-step hack videos built with vidIQ motion graphics."
---

# DIY Hack Shorts (kamerasız)

The user has no camera. Make faceless, animated life-hack Shorts in English, inspired by channels like Inventor Hacks, using vidIQ tools. Talk to the user in Turkish; video text is English.

## Why animated, not realistic AI video
- vidIQ realistic video (veo, seedance, etc.) costs ~30 credits per second (8s = 240 credits). The user's plan has ~150 credits/month, so realistic clips are not affordable. Only use them if the user explicitly asks AND the balance covers it; always quote the cost first.
- vidiq_motion_graphics costs 1 credit per 4 seconds — use this by default.
- Only use hacks that genuinely work (no fake/dangerous hacks). Avoid anything with fire, electricity mods, chemicals or sharp-tool risk.

## Steps
1. Check credits with vidiq_balance. Tell the user the expected cost before generating.
2. Pick a real, simple, household hack (optionally find trending topics with vidiq_outliers / vidiq_youtube_search for "life hacks", "DIY hacks"). One hack per video.
3. Write the card text: a hook headline (max ~7 words, one key word highlighted), 3 short steps (max ~8 words each), a payoff pill (e.g. "Cost: under $1", "Takes 30 seconds"), and a CTA ("Follow for a new hack every day").
4. Render with vidiq_motion_graphics:
   - outputPreset: shorts-9-16, durationSeconds 12–16
   - background: dark gradient (#14161c → #232838), theme fontFamily Inter, gridOverlay true, accent #FFC233, positive #4ADE80, muted #A8B0C2
   - Root stack column, justify center, padding 0.08, gap 0.05
   - Order and timing: category pill (0s, fade+slideIn down) → headline text sizeRel 0.085 weight 800 with highlightSpans on the key word + highlightWipe (0.4s) → accent divider (1.6s) → three step rows, each a row stack of a numbered yellow pill + text sizeRel 0.05 weight 700, appearing at 2.5s / 5s / 7.5s (fade + slideIn left) → payoff pill with pop (~10s) → muted CTA text (~11.5s)
   - Elements cannot exit, so everything must fit on one screen; keep text short.
5. Poll vidiq_job_poll until completed. The videoUrl is a signed link that expires in ~12 hours — give it to the user right away and tell them to download it. (The workspace shell cannot download from that S3 host.)
6. Optional upgrades (quote cost first): English voiceover with vidiq_voiceover_generate (14 credits / 1000 chars) and music with vidiq_generate_music (25 credits), stitched with vidiq_compose.
7. Give a YouTube title (English, curiosity + benefit), 3–5 hashtags (#lifehacks #diy #shorts …) and a one-line description. The user uploads himself.

## Upload note
If any realistic AI-generated footage is ever used, remind the user to tick YouTube's altered/synthetic content disclosure.