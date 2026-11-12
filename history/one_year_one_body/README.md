# History Sourced — character animation kit

Owner's standing order (31 Oct 2026): **the animation must get clearly better with EVERY video.** Never ship a video that scores lower than the previous one on SCORECARD.md.

## Files
- `src/rig.tsx` — reusable puppet rig v2 (use this for every character): `Puppet`, `Head`, `Pliers`, looks `TOM`, `BARBER`, `restHead()`.
  - Pose: leg angles (sit/stand/walk), IK hand targets, torso lean, bob, squash, apron sway.
  - Head: `turn` (front → 3/4), `lookX/Y`, eyes `dot | squeeze | fear | sly` (+ `eyePop` spring), brows `browInner/browHeight`, mouth `line | smile | grin | zigzag | talk | O | fear` + `open`, `swell`, `sweat`, `gulp`.
  - Looks: costume colours, hair `tuft | ring`, moustache, spectacles, belly, signature item (Tom's red toothache cloth).
  - Mitten hands with thumb; props are passed as children and rotate with the forearm.
- `src/BarberScene.tsx` — v2 reference scene (12 s): interior set, two characters, 4 shots (wide → medium → close-up → wide), lip-synced dialogue, anticipation + spring overshoot, fear pop, sweat, gulp, freeze-frame comedy label, captions.
- `src/Scene.tsx` — v1 street scene (walk cycle, parallax street, title card).
- `make_voice.py` — Kokoro TTS line(s) → `public/voice_*.wav` + `src/lipsync.json` (per-frame mouth envelope + caption timings). Use a different Kokoro voice per character (narrator bm_george; barber bm_lewis; pick others for new characters).
- `make_audio_barber.py` — original SFX bed (room tone, crackle, creaks, metal, heartbeat, gulp, footsteps, record scratch) + voice; then `ffmpeg -af loudnorm=I=-14:TP=-1.5:LRA=11`.

- **Kit v3 (Ep 1, 2 Nov 2026)** — full-episode pipeline:
  - `src/rig.tsx` v3: viseme mouths `E | S | M` (+ `talk`/`O`), `frown`, `gap` (missing tooth); eyes `happy | dizzy | half`; hand poses `point | open | fist` (`poseF/poseB`), back-hand props (`propB`); looks `cap: coif | baker | tall | felt`, `skirt`, `gown`, `beard`, `wrinkles`; cast `AGNES, HOLLIS, WATCHMAN, PHYSICIAN, SEARCHER, BOY`, `extraLook(seed)` crowd extras; props `Pelican, Cup, Bottle, Root, Bread, Funnel, Halberd, Lantern, Candle, Peel, Sponge, Pipe, Birch, ToothProp, Dentures`; `visMouth()`.
  - `src/motion.ts`: `walk, tiptoe, run, stagger, flinch, shiver, collapse/sitLegs, idle, gesture, knead, spring, blinkAuto`.
  - `episodes/<ep>/script.py` (SHOTS with speaker lines) → `make_episode_voice.py <ep> <key>` → `public/<key>_voice.wav` + `src/<key>/timeline.json` (shot/line frames + per-frame visemes from energy/centroid/ZCR; TTS cached).
  - `src/ep01/kit.tsx` (Cam with cuts/push-ins/dutch/shake, `Actor`, `mkPose` with auto blink+breathing, `speech()` lip sync, Caption, FreezeLabel, Tag, BigWord, Stamp, CureCard, Throb, Post), `sets.tsx` (Attic, Bakery, Street day/dawn/night + lamps, Shopfront, MapLondon, Parchment, DarkTable, Hall, Fair, ToothCut, Worm), `shots1-3.tsx` (one function per shot), `Episode.tsx`, `Thumb.tsx` (3 thumbnail variants).
  - `make_audio_ep01.py` (ambience beds per set + ~150 synced SFX cues + procedural score per chapter mood + ducking), `make_subs.py`, `stills.mjs` + `shotframes.py` + `sheet.py` (contact sheets), `render_chunks.sh` (resumable 600-frame chunks).

- **Kit v4 (You Were There Ep 1, 5 Nov 2026)** — Mary Celeste episode:
  - `make_episode_voice.py` now builds **true phoneme visemes**: the script text is phonemized (espeak via kokoro_onnx `Tokenizer.phonemize`), split into phrases at punctuation, aligned to the voiced runs of each line, and mapped to `M` (p/b/m), `F` (f/v lip-bite, new mouth in rig), `O`, `E`, `S`, `C` (small consonant), `A`; the audio envelope still drives openness.
  - `src/motion.ts`: `saccade()` eye darts (piecewise gaze jumps with 2-frame snaps, on by default in `ep02/kit` `mkPose`, `dart` amount per actor), `drop()` prop physics (gravity, bounce, settle, impact frame for SFX), `roll()` ship roll/heave.
  - `src/ep02/kit.tsx`: `Focus` + `rack()` rack focus between layers, `Whip` whip-pan transitions (motion-blur streak; `WHIP_IN` set in `ep02/Episode.tsx`), low-angle shots (camera `rot` + figure against the sky), `Rain` (2 parallax sheets), `lightning()`, `Spray`, letterbox `Bars`, pinned `Card`; per-chapter colour grade in Episode.
  - `src/ep02/sets.tsx`: parallax `Sea` (4 depth bands that shift with camX), `Sky` modes (day/storm/night/dusk/sepia/tropic), brigantine `Ship` sprite (torn/dark/lights), `Yawl`, `Deck` (rolling horizon, Mary Celeste variant with open hatches, empty boat chocks, ropes over the side), `Cabin` (skylight light shaft + dust, swinging lamp, water on the floor), `Hold` (barrels, vapour, blue flash), `Galley`, New York `Pier`, Gibraltar `Rock` + `Court`, Doyle's `Study`, `MapAtlantic`, Haiti `Reef`, cork `Board`.
  - rig v4: caps `souwester | peaked | knit`, `sideburns`, `monocle`, `collar`, `buttons`, `noStrap`; cast `DEVEAU, WRIGHT, MOREHOUSE, FLOOD, BRIGGS, SARAH, SOPHIA, DOYLE`.
  - **Render speed (important):** the default Chrome GL backend (`swangle`) was the bottleneck (GPU process at 100 %). Use `--gl=swiftshader` and a Chrome wrapper with `--disable-gpu --disable-gpu-compositing` (`chrome-nogpu.sh`; run `./render_worker2.sh 0 & ./render_worker2.sh 1` — one browser each, concurrency 1): 5–7× faster on simple shots, ~1.5× on busy deck shots.
  - `make_audio_ep02.py` (sea/cabin/court/storm beds, ~180 cues, A-aeolian score), `make_subs.py` NUMS applied before cue splitting (numbers never split across cues), `shotframes2.py`, `stills.mjs` (`BUNDLE`, `CHROME`, `GL` env vars).

- **Kit v5 (You Were There Ep 2, 12 Nov 2026)** — Carrington Event episode:
  - **Seated pose + behind mask** (`src/ep03/kit.tsx`): `SEAT` legs, `seatY()`, `sitOpts()`, `Chair` (drawn before the actor) and `DeskFront` (drawn after) so desks hide laps/legs correctly; `ep03/common.tsx` `OfficeScene` stacks set → chair → seated actor → instruments → desk front, `SideTable` for side views.
  - **Crowd interactions**: `crowdAct(f, seed, kind)` — point up, nudge, whisper pairs, hand-to-mouth, clutch, pray, shade-the-eyes; extras cycle kinds so a crowd is never a row of copies.
  - Electric FX: `Sparks` bursts, jagged `Arc` (re-randomised every 2 frames), `Smoke`; `Aurora` curtains (red → green blend + vertical spires) and `StarField`; `Pulses` Morse dots/dashes travelling along any polyline.
  - rig v5: caps `visor` (telegrapher's green eyeshade, translucent) and `nightcap`; `garters` (sleeve garter), `bowtie`, `shawl`; cast `NED, PIKE, PORTLAND, KANE, MINER, CARRINGTON, ROYCE, LOOMIS`.
  - Sets (`ep03/sets.tsx`): telegraph `Office` (wide world, window sky modes night/red/aurora/dawn/day, variants boston/dc/pitt) with `TKey`, `Sounder`, `Register` (paper tape, burn), `Jars` (battery, unplug), `Clock`, `Coffee`, `PikeDesk`; `BostonStreet` under the aurora; `Observatory` + projected `SunDisc` with flare beads; Kew `Magnetograph`; `Space` (sun → CME → Earth with magnetosphere, miss offset); `MinersCamp`, `Pan`; `BrickWall`, `Lark`; Natural-Earth `MapAmericas` (aurora oval + pins) and `MapNE` (telegraph lines that die / light up); `ModernCity` (blackout, snow, satellites), `Letters`.
  - Split-screen dialogue (`Split` in `shots3.tsx`) for two people talking over the wire, with Morse pulses crossing the divider.
  - `make_audio_ep03.py`: telegraph sounder clatter generator, key taps, Morse tones, electric zaps, aurora shimmer pad, fire bells, larks, frying; the Portland operator's lines are band-passed + crackled ("over the wire"); `render_worker3.sh`, `shotframes3.py`, `src/ep03/geo.ts` (generated from the toolkit's Natural Earth land).

## Render
```
npm i
pip install --break-system-packages kokoro-onnx soundfile scipy   # models: kokoro-v1.0.onnx + voices-v1.0.bin into models/
python3 make_voice.py && python3 make_audio_barber.py && ffmpeg -y -i public/barber_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 public/barber_mix.wav
npx remotion still src/index.tsx BarberScene frames/x.png --frame=200 --browser-executable=/usr/bin/google-chrome
npx remotion render src/index.tsx BarberScene out/x.mp4 --browser-executable=/usr/bin/google-chrome --codec=h264 --crf=18 --x264-preset=veryfast --concurrency=2
```
`--concurrency` ≤ CPU count. For an 8–10 min episode, build one composition per chapter/scene and render in chunks, then concat with ffmpeg.

## Look rules
- Egg-shaped warm-ivory heads (#F3EAD8), warm-brown outline (#2B1D14), emotion carried by brows, eyes and mouth. No noses.
- Each recurring character has ONE signature item (Tom: red toothache cloth; Barber: round spectacles + grey handlebar moustache + leather apron).
- Painted sets: SVG shapes + displacement (`paint`) + brush texture, warm candle/window light pools, vignette, animated grain, dust/flicker. One colour grade per chapter.
- Fonts: IM Fell English SC (place/date), Fraunces Black (big statements, key word in #E5503A), IM Fell English Italic (captions, labels).
- Period details that tell the story without words (string of pulled teeth in the barber's window, leech jar, plague cross on a door).

## Animation principles checklist (apply in every scene)
1. Anticipation before big moves (dip before the raise).
2. Spring overshoot + settle (`spring()` in BarberScene) instead of linear moves.
3. Secondary motion: cloth knots, apron sway, hanging herbs, candle flame.
4. Never fully still: breathing bob, blinks every 2–4 s, small head tilts while talking.
5. Lip sync from the voice envelope; mouth closes between words; brows move on stressed words.
6. Shot grammar: wide → medium → close-up, hard cuts on story beats, slow push-in inside each shot, never 3 similar shots in a row.
7. Reaction shots: the funniest moment is usually the listener's face, not the speaker's.
8. One comedy beat per minute (freeze-frame label, record scratch, deadpan line).
9. Sound sells motion: every gesture or impact gets an original SFX.
10. Captions for spoken lines (viewers watch muted).

## SCORECARD — every video must beat the previous total
Score 1–5 honestly from rendered frames (not from intentions). Each new video must raise at least TWO categories and lower none. Add a row per video.

| Video | Acting/faces | Lip sync | Body motion | Shot variety | Sets/props | Light/atmos | Comedy | Sound | Thumbnail | Hook | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v1 test 2026-10-31 (street) | 3 | 1 | 3 | 2 | 2 | 3 | 1 | 2 | – | 3 | 20 |
| v2 test 2026-10-31 (barber) | 4 | 3 | 3 | 4 | 4 | 4 | 4 | 4 | – | 3 | 33 |
| Ep 1 2026-11-02 Toothache 1665 (8:26) | 4 | 4 | 4 | 4 | 5 | 4 | 4 | 4 | 3 | 4 | 40 |
| You Were There 1 2026-11-05 Mary Celeste 1872 (8:30) | 4 | 4 | 4 | 5 | 5 | 5 | 4 | 4 | 4 | 4 | 43 |
| You Were There 2 2026-11-12 Carrington Event 1859 (8:46) | 4 | 4 | 5 | 5 | 5 | 5 | 5 | 4 | 4 | 5 | 46 |

## Improvement backlog (take at least one per video; move done items to the log)
- Head turn to full profile and back, with hair/ear swap; back view for walking away
- Speed: pre-render static set plates (PNG at 2x) and draw only live layers (busy deck shots still ~1 fps on 2 CPUs even with swiftshader)
- Rain streaks running down windows/skylights (interior weather)
- Thumbnail A/B tracker: record which variant YouTube Test & Compare picked
- Sou'wester reads a bit like a helmet at close range: softer brim droop + oilskin creases
- Characters sitting inside BOATS: extend the v5 Chair/DeskFront idea to a boat-hull front layer
- Pike-style stout characters: arms are too short for big 'arms up' gestures (hands end at the face) — longer arm option per Look
- Kane's nightcap brim reads a little like a bandage at close range
- Phones/props held flat read as sticks: add a `faceCam` prop rotation so screens face the camera
- Close-up thumbnails: tilt the visor brim up so it never covers the fear eyes
- Make the sound bed less synthetic: layered foley (paper, wood, cloth) recorded-style noise models

## Improvement log
- 2026-11-12 You Were There Ep 2 (You're a Telegraph Operator in 1859. Then the Sky Catches Fire., 8:46, 56 shots): DONE backlog — real seated pose + chair helper + desk 'behind mask' (Ned works seated behind a desk that correctly hides his lap; Royce and the Portland operator use the same rig); crowd idle loops with interactions (`crowdAct`: pointing, nudging, whisper pairs, praying, hand-to-mouth) in 8 crowd shots. Also new: split-screen wire dialogue, electric sparks/arcs, animated aurora (red→green), Morse pulses on maps and wires, over-the-wire voice filter, 4 freeze-frame gags + ~10 comedy beats. Scorecard 43 → 46 (body motion 4→5, comedy 4→5, hook 4→5; nothing lower). Weak spots seen: Pike's raised arms end at his face; Kane's nightcap brim; phones read as sticks; Hodgson shot is sparse; thumbnail visor partly covers the eyes.
- 2026-11-05 You Were There Ep 1 (You Board the Mary Celeste, 8:30, 54 shots, ~95 camera set-ups): DONE backlog — true phoneme visemes from the script text + F/V lip-bite; eye darts/saccades on every actor; prop physics `drop()` (sounding rod clatter, Solly-Flood's monocle); rack focus (`Focus`/`rack`) in 3 shots + low-angle climb/shroud shots + telescope POV + letterbox; whip-pan transitions (10 cuts); parallax 4-band sea; rain + lightning storm; per-chapter colour grade; render speed fix (`--gl=swiftshader`, no-GPU Chrome wrapper, two single-browser workers: 15,290 frames in ~2 h 40 min instead of an estimated 6 h+). New cast Deveau (yellow sou'wester), Wright, Morehouse, Solly-Flood (monocle), Briggs family, Doyle; 13 new sets. Scorecard 40 → 43 (shot variety 4→5, light/atmos 4→5, thumbnail 3→4; nothing lower). Weak spots seen: the deck set carries too many shots; Doyle floats in front of his desk; Briggs on the New York ship stands in front of the sails; rowers/boat sitters need a proper seated-in-boat mask; lab test shots hold ~8 s on one composition.
- 2026-10-31 v1: walk cycle, twinge, hand-to-cheek IK, pain face, throb rings, title card.
- 2026-11-02 Ep 1 (You Have a Toothache in 1665 London, 8:26, 50 shots): DONE backlog — audio-driven viseme mouths (lip sync 3→4); motion library walk/tiptoe/run/stagger/flinch/shiver/collapse/knead (body 3→4); hand poses point/open/fist + back-hand props; crowd extras `extraLook(seed)`; camera OTS (blurred barber shoulder), dutch angle, crash zoom, push-ins in every cut; time/weather: moonlit attic, dawn and lantern-lit night street, snow in the window; painted London map with Tom's silhouette walking the route; thumbnail system (3 variants, 160-px check). New cast Agnes, Master Hollis, watchman, physician, searcher, schoolboys; 10 painted sets; procedural score + ~150 SFX cues; -14 LUFS. Weak spots seen: some long holds on inserts (bill, scales), map labels small, physician/searcher walk is the same cycle as everyone, Tom's head never turns to full profile; in the coach shot the fleeing extras' bundles sit in front of their faces (hold props lower).
- 2026-10-31 v2: reusable rig module; barber character; interior set with period props; lip sync from Kokoro voice; mitten hands holding props; fear eyes with spring pop; sweat + gulp; anticipation/overshoot; 4-shot cutting; freeze-frame comedy label; captions; full original SFX mix at -14 LUFS.
