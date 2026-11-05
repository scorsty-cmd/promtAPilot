# "If You Were Born…" channel — 2D animation kit

The owner chose the **2D cartoon style** (5 Nov 2026, after comparing a 3D dinosaur Short with the 2D Stone Age Short).
Every new video starts from `kit/` and must be **visibly better than the previous episode** (owner's standing rule).
Talk to the owner in Turkish; videos, captions and metadata are English.

## Style DNA (keep it — this is what makes the channel recognisable)
- **Characters** (`kit/src/art.tsx` → `Char`, `LOOKS`): big round heads (chibi ~1:2.6), big round eyes with highlight,
  thick charcoal outline (#1d1612, 7 px), rosy cheeks, expressive brows + mouth set (smile, grin, O, flat, sad, talk, blow).
  Every recurring character has its own hair + one accessory. Era clothing changes per episode; faces never change style.
- **"You"** = the hero of every episode. Signature: a **red ochre stripe across the nose and cheeks** — keep it in every era
  (it is the channel's mascot mark), even when the costume changes.
- **Line boil:** the `Boil` SVG filter makes outlines wobble like hand drawing (changes every 3 frames). Keep it on.
- **Palette per era**, always with the ink outline + chalk white + one warm accent. Stone Age = cave pigments
  (red ochre #b5432a, yellow ochre #d9a441, chalk #f2e7d0, ice blue).
- **Fonts:** Bricolage Grotesque (titles, captions) + DM Mono (era chip, tags). Never Montserrat/Bebas/Anton/Impact.
- **Channel furniture:** era chip top right ("ICE AGE · 20,000 YA" → "TODAY · 0 YA"), bone-white fact tags with an
  amber edge, source footnote on screen for every statistic, captions on a dark rounded box (readable on snow),
  closing card "WHICH ERA NEXT? / COMMENT YOUR ERA ↓".
- **Signature transitions:** a scene turns into a cave/era artwork (memory), smoke or light drawing shapes,
  "then → today" reveal of a real surviving trace.

## Pipeline (Short, ~50 s)
1. Research: 2+ sources for every number; show the source line on screen.
2. Script ≈ 130 words, second person, hook in the first second ("Born X years ago? …"), ≥ 1 surprising number,
   a "then → today" ending, CTA "Which era should you be born in next?". Edit `LINES` in `kit/tts.py`
   (Kokoro voice `am_michael`, speed 1.04 — same narrator every episode) → `python3 tts.py am_michael 1.04`.
3. Shots: copy the last episode's `shots.tsx` as a template, one shot per sentence (3–5 s), never two similar framings
   in a row; characters fill the frame (camera `z` 1.3–2.1), feet around 65–75 % of frame height.
4. Look before rendering: `node stills.mjs <seconds…>` + `python3 sheet.py stills/sheet.jpg <seconds…>` and fix
   unreadable captions, tiny characters, empty frames, black edges on camera pans (skies are drawn wide).
5. Sound: `python3 audio.py` (original modal score + SFX, masters to −14 LUFS). Change key/instruments per era.
6. Render: `node render.mjs 0 <lastFrame> chunks/all.mp4` (~15 min for 50 s on 2 CPU cores, no GPU needed),
   mux with `public/mix.wav`, then `python3 ../antigravity/tools/kalite_kontrol.py <mp4> --profile short` must pass.
7. Save the episode's `shots.tsx`, `timeline.json` and QC contact sheet in `episodes/epNN_<topic>/`, add a log line below.

## Improvement backlog (implement at least one per episode)
1. Better hands: 3–4 finger mitten shapes with a thumb instead of circles (needle and hand-stencil scenes looked basic).
2. Arms with elbows (2-part IK) for gestures and holding objects.
3. Mouth sync to the narrator for the "talk" mouth (amplitude envelope from the voice).
4. Side-view walk with proper heel–toe foot motion; run cycle.
5. Painted texture layer on backgrounds (gouache brush noise) for more depth.
6. Thumbnail generator from the hero close-up (big face + 2–3 words).
7. Long-form version (8–10 min) with chapters reusing the same characters.

## Log
- 2026-11-05 · ep01 Stone Age — "If You Were Born 20,000 Years Ago" (51 s). QC passed first time (−14.5 LUFS).
  Weak spots: simple hands/arm in the needle and hand-stencil shots. Sources: Volk & Atkinson 2013 (child mortality),
  Gurven & Kaplan 2007 (forager life spans).
