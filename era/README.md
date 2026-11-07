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
5. ~~Painted texture layer on backgrounds~~ — DONE in ep05 (radial vignette, biohazard haze, procedural spore & ash particles).
6. ~~Thumbnail generator~~ — DONE in ep02 (`Thumb` composition, 1280x720).
7. ~~Long-form version~~ — DONE in ep02 (8:12, 11 chapters, 74 shots).
8. ~~Long-form secondary motion~~ — DONE in ep05 (built-in continuous drift + animated data curves/particles in all 7 explainers).
9. ~~Cloud parallel & resumable chunk render~~ — DONE in ep05 (`runall.py` + `.github/workflows/era-cloud-render.yml` 8-way GitHub Actions matrix render).
10. ~~Burned-in captions~~ — DONE in ep03 (speaker-coloured name + ~8-word chunks; `.srt` still shipped).
11. ~~Dialogue-led script~~ — DONE in ep03 (65 % dialogue, automatic wide / close-up / two-shot coverage `camFor`).
12. ~~Sitting poses~~ — DONE in ep04 (thigh + shin joints, bentwood chairs, sitting in bed).
13. ~~Facial expressions~~ — DONE in ep04 (10 presets: laugh, surprised, angry, worried, thinking, sad...; auto-expression from ! and ? per line; per-line reaction map).
14. ~~Keyword gestures + tracking walk-and-talk~~ — DONE in ep05 (point on Look/That's, fist on Push!/Fire!, counting on numbers; tracking shot in the escape; survival props radio, flashlight, map, water filter, seed in ep05_zombies).
15. Next: reusable "clean render → vertical Shorts" step for every long episode (done by hand for ep03).
16. ~~Crowd variety + depth of field~~ — DONE in ep06 (women, elders, children in crowds; animated arena stands of ~170 people; blurred foreground layer `near`).
18. ~~Fight choreography~~ — DONE in ep06 (`fight()` move library: guard, step, thrust, wind, slash, block, dodge, low, hit, fall, beg, bash; blended moves, impact sparks, flash + camera punch; timings in `src/fights.json` shared with audio.py so every clash is in sync).
19. ~~One-click cloud render~~ — DONE in ep06 (`.github/workflows/era-render.yml`: voices + mix → 16 parallel chunks → join → GitHub Release; nothing runs on the owner's computer).
20. Next: split-screen choices reused for every 'who do you follow?' moment; proper side-view run cycle; vertical Shorts from the clean render.
21. ~~Non-human talking cast~~ — DONE in ep08 (`Actor.c` custom renderer: any creature gets mouth sync, blinks, expressions, keyword gestures and camera coverage via `hh` head height; Trood dinosauroid, Pip primate, crow).
22. ~~Render timeout guard~~ — DONE in ep08 (10 resumable chunks; heavy per-frame SVG filters profiled and replaced by baked PNG paper/halftone/grain → ~2x faster).
23. Next: side-view run cycle for creatures with proper foot plant; vertical Shorts from the clean render.
17. ~~Ending card motion~~ — DONE in ep05_zombies (continuous zoom/drift on closing card and all explainers).

## Log
- 2026-11-05 · ep01 Stone Age — "If You Were Born 20,000 Years Ago" (51 s). QC passed first time (−14.5 LUFS).
  Weak spots: simple hands/arm in the needle and hand-stencil shots. Sources: Volk & Atkinson 2013 (child mortality),
  Gurven & Kaplan 2007 (forager life spans).
- 2026-11-05 · ep02 Maya — "If You Were Born Maya" (8:12, 1920x1080, long-form, 11 chapters). New: rig v2 (elbows,
  thumb hands, outfits, headwear, props), 20-character cast, Maya map from Natural Earth, 8 English infographics with
  on-screen sources, chapter cards, Maya score (ocarina, turtle-shell drum, slit drum, rattles, conch) + per-chapter SFX,
  thumbnail, SRT, YouTube metadata. QC: first pass failed (11 static graphic shots) → DRIFT fix → passed (−14.3 LUFS).
  Sources: Canuto 2018, Estrada-Belli 2015, Medina-Elizalde & Rohling 2012, Baron 2018, Martin & Grube 2008.
- 2026-11-06 · ep03 Socrates — "If You Were Socrates' Student" (8:05, 1920x1080, 10 chapters, 65 % dialogue). New: rig v3
  (Greek outfits, helmets, wreaths, beards, kylix/amphora/hemlock props), 30-character cast, mouth sync for 14 voices,
  automatic dialogue camera coverage, burned-in speaker captions, red-figure vase flashbacks, Greece map (Natural Earth),
  8 infographics with drift built in, Greek score (aulos, Karplus-Strong lyre, tympanon, krotala). QC passed first time
  (−13.8 LUFS). Sources: Plato (Apology, Crito, Phaedo, Symposium, Laches), Xenophon, Thucydides, Hansen 1991.
- 2026-11-06 · ep04 Einstein — "If You Were Einstein's Student" (8:20, 10 chapters, ~60 % dialogue, 11 voices incl. Italian/Spanish-accented).
  New: rig v4 (1900s suits, wild hair, moustaches, glasses), real sitting pose, expression system, sepia + chalkboard look,
  13 chalkboard explainers (time dilation, E=mc², equivalence, Mercury, light bending, double slit, GPS), salon piano/violin score
  with clock-tick pulse, typewriter/Morse/chalk SFX. QC passed first time (−14.0 LUFS).
- 2026-11-06 · ep05 Troy — "If You Were a Soldier at Troy" (8:03, Trojan POV, 10 chapters, ~55 % dialogue, 12 voices).
  New: rig v5 (Bronze Age kit: cuirass, scale armour, greaves, crested & boar's-tusk helmets, 3 shield types, spears with
  world-upright prop rotation), kneel pose, keyword-driven hand gestures, horse gallop cycle + chariots, Army/Arrows/Dust/Smoke
  battle kit, camera shake on impacts, silhouette duel, MYTH/EVIDENCE/MAYBE stamps, Mycenaean-fresco look, hook-first cold open.
  QC: one static tail (ending card) fixed by re-rendering the last 10 s.
- 2026-11-06 · ep05_zombies — "If the Whole World Turned Into Zombies" (9:28, 1920x1080, 10 chapters, 89 % dialogue, 5 distinct Kokoro voices).
  New: rig v5 (survivor jackets, tactical gear, lab coats, hero red-ochre face stripe preserved, 8 survival props: radio, flashlight, can, map, water filter, seed, binoculars),
  3 atmospheric painted-texture sets (`CityStreet`, `Safehouse`, `MountainRidge`), 7 dynamic science explainers (`RZeroExplainer`, `ParasiteExplainer`, `WaterExplainer`, `FoodExplainer`, `GeographyExplainer`, `FreezeExplainer`, `CrashExplainer`) with built-in drift & particles,
  dark horror-synth score + emergency EAS siren/radio/heartbeat/wind SFX mastered to −14.2 LUFS, plus 8-way GitHub Actions cloud parallel render workflow.
  Sources: Smith? et al. 2009 (University of Ottawa Zombie Outbreak Model), Hughes et al. 2011 (Ophiocordyceps unilateralis), WHO Rabies Fact Sheet, FEMA/ASCE Infrastructure Failure Reports, USDA Caloric & Seed Vault Studies, Aleph et al. 2015 (Cornell Statistical Mechanics of Outbreaks), Cahill et al. 2006 (Human Starvation & Dehydration Physiology).
- 2026-11-06 · ep06 Spartacus — "If You Were Spartacus's Best Friend" (11:50, 10 chapters, 107 of 156 lines dialogue, 14 voices incl. Italian-accented herald).
  New: rig v6 (gladiator kit: Thracian griffin helmet, Samnite plumed helmet, Gallic helmet, parmula/scutum/oval shields, manica, greaves; togas, mail lorica, cloaks, rags; Gallic moustache + torque, scars, tattoos; world-angle blades gladius/sica/rudis/cleaver/spit), hero face stripe restored,
  fight choreography system, arena with reacting crowd + editor's box, ludus/cell/kitchen/Vesuvius cliff/Roman camp/coast/Crassus's ditch/Appian Way/Pompeii fresco sets, split-screen decision shot, Pompeian-wall explainers (Italy route map from Natural Earth),
  Roman score (hydraulis water organ, tuba fanfares, cornu, frame drums, cithara) + hit-synced SFX. Rendered in the cloud with era-render.yml.
  Sources: Plutarch (Crassus 8–11), Appian (BC 1.116–120), Vegetius 1.11, Lösch et al. 2014, Ville 1981.
- 2026-11-07 · ep07 Alexander — "If You Were Alexander the Great's Classmate" (13:01, 13 chapters, 93 of 151 lines dialogue, 15 voices).
  New: shock cold open (starts mid-argument at the Samarkand feast, smash-cut to black + name slam, classmates photo-card), rig v7 (Phrygian helmet with Alexander's two white plumes, kausia, Persian tiara & bashlyk, Indian turban, royal diadem, 'lion' hair, linen cuirass with pteruges,
  Vergina-star shields, 6 m sarissas, Philip's eye patch), war elephant + scythed chariots + royal chariot, phalanx block that levels its sarissas and opens lanes, 'two versions' device (Gordian knot: sword vs pin),
  black-figure vase explainers (golden mean, sarissa, Persepolis treasure, sources, 'no more worlds' myth), Greece→India route maps (Natural Earth), new sets (Pella, Mieza nymphaeum + Mieza today, Aegae theatre, Corinth & Diogenes's jar, Hellespont, Granicus, Gordion, royal tent, Gaugamela, Persepolis fire, Samarkand feast, Hydaspes monsoon, Gedrosia, Babylon, Alexandria),
  Greek/Persian/Indian score (salpinx, aulos, lyre, tabla) + elephant trumpets, thunder, river SFX.
  Lesson: never put CAPITALS in pronunciation respellings (Kokoro spells them letter by letter) — use lowercase respellings and check with k.tokenizer.phonemize().
- 2026-11-07 · ep06 Archimedes — "If You Were Archimedes' Student" (8:01, Syracuse 232–212 BC, 10 chapters, ~55 % dialogue, 10 voices).
  New: geometer's-papyrus look (self-drawing ink diagrams, Caveat handwriting, Marcellus titles, rotating geometry overlay, coin era chip,
  scroll chapter cards), Roman kit (Montefortino helmet, scutum, gladius), machines (claw crane lifting a warship, catapults with
  stone arcs + splashes, compound-pulley rig moving the Syracusia, Archimedes screw), crowd variety, depth-of-field blur. QC passed first time.
- 2026-11-07 · ep08 Dinosaurs — "What If the Dinosaurs Never Went Extinct?" (8:01, 9 chapters, 66 % dialogue, 6 voices).
  New: risograph-print look (pink misregistration plate on every frame, halftone + paper baked to PNG, Dela Gothic / Rubik Mono / Space Grotesk),
  creature kit (theropod with jaw/walk/breath, raptor pack, dinosauroid guide, tiny primate, sauropod herd, pterosaur, mosasaur leap, duckbills, crow),
  13 "field guide" explainer posters with EVIDENCE / MAYBE / MYTH stickers, original marimba/kalimba/log-drum score + chase cue. QC passed first time.
