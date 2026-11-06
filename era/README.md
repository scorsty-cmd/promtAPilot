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
1. ~~Better hands~~ — DONE in ep02 (thumb-mitten hands, `episodes/ep02_maya/src/chars.tsx`).
2. ~~Arms with elbows~~ — DONE in ep02 (`elbowF` / `elbowB` pose params, props held in hand).
3. ~~Mouth sync~~ — DONE in ep03 (per-speaker RMS envelopes → `mouth.json`, 14 Kokoro voices).
4. Side-view walk with proper heel–toe foot motion; run cycle.
5. Painted texture layer on backgrounds (gouache brush noise) for more depth.
6. ~~Thumbnail generator~~ — DONE in ep02 (`Thumb` composition, 1280x720).
7. ~~Long-form version~~ — DONE in ep02 (8:12, 11 chapters, 74 shots).
8. Long-form: plan secondary motion for every explanatory graphic (QC flags shots static > 4 s). ep02 fixed it with a
   `DRIFT` wrapper (slow push-in + travelling light) in `Video.tsx`; next time build it in from the start.
9. Render long videos in 4 resumable chunks (`runall.sh`), ~0.5 s/frame on 2 cores (8 min ≈ 2 h).
10. ~~Burned-in captions~~ — DONE in ep03 (speaker-coloured name + ~8-word chunks; `.srt` still shipped).
11. ~~Dialogue-led script~~ — DONE in ep03 (65 % dialogue, automatic wide / close-up / two-shot coverage `camFor`).
12. ~~Sitting poses~~ — DONE in ep04 (thigh + shin joints, bentwood chairs, sitting in bed).
13. ~~Facial expressions~~ — DONE in ep04 (10 presets: laugh, surprised, angry, worried, thinking, sad...; auto-expression from ! and ? per line; per-line reaction map).
14. Next: hand gestures tied to keywords (pointing, counting on fingers), and walk-and-talk shots with tracking camera.
15. Next: reusable "clean render → vertical Shorts" step for every long episode (done by hand for ep03).

## Log
- 2026-11-05 · ep01 Stone Age — "If You Were Born 20,000 Years Ago" (51 s). QC passed first time (−14.5 LUFS).
  Weak spots: simple hands/arm in the needle and hand-stencil shots. Sources: Volk & Atkinson 2013 (child mortality),
  Gurven & Kaplan 2007 (forager life spans).
- 2026-11-05 · ep02 Maya — "If You Were Born Maya" (8:12, 1920x1080, long-form, 11 chapters). New: rig v2 (elbows,
  thumb hands, outfits, headwear, props), 20-character cast, Maya map from Natural Earth, 8 English infographics with
  on-screen sources, chapter cards, Maya score (ocarina, turtle-shell drum, slit drum, rattles, conch) + per-chapter SFX,
  thumbnail, SRT, YouTube metadata. QC: first pass failed (11 static graphic shots) → DRIFT fix → passed (−14.3 LUFS).
  Sources: Canuto 2018, Estrada-Belli 2025, Medina-Elizalde & Rohling 2012, Baron 2018, Martin & Grube 2008.
- 2026-11-06 · ep03 Socrates — "If You Were Socrates' Student" (8:05, 1920x1080, 10 chapters, 65 % dialogue). New: rig v3
  (Greek outfits, helmets, wreaths, beards, kylix/amphora/hemlock props), 30-character cast, mouth sync for 14 voices,
  automatic dialogue camera coverage, burned-in speaker captions, red-figure vase flashbacks, Greece map (Natural Earth),
  8 infographics with drift built in, Greek score (aulos, Karplus-Strong lyre, tympanon, krotala). QC passed first time
  (−13.8 LUFS). Sources: Plato (Apology, Crito, Phaedo, Symposium, Laches), Xenophon, Thucydides, Hansen 1991.
- 2026-11-06 · ep04 Einstein — "If You Were Einstein's Student" (8:20, 10 chapters, ~60 % dialogue, 11 voices incl. Italian/Spanish-accented).
  New: rig v4 (1900s suits, wild hair, moustaches, glasses), real sitting pose, expression system, sepia + chalkboard look,
  13 chalkboard explainers (time dilation, E=mc², equivalence, Mercury, light bending, double slit, GPS), salon piano/violin score
  with clock-tick pulse, typewriter/Morse/chalk SFX. QC passed first time (−14.0 LUFS).
