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

## Improvement backlog (take at least one per video; move done items to the log)
- Head turn to full profile and back, with hair/ear swap; back view for walking away
- True phoneme visemes (forced alignment of the script text) instead of audio-feature visemes; F/V lip-bite shape
- Speed: pre-render static set plates (PNG at 2x) and draw only live layers (~2 fps now on 2 CPUs)
- Rack focus (animated blur between foreground and background layers) and low-angle shots
- Rain on windows; parallax depth layers in the street set; whip-pan transitions between shots
- Prop physics helper (fall + bounce + settle) and eye darts/saccades during dialogue
- Crowd idle loops with small interactions (nudges, pointing, talking pairs)
- Thumbnail A/B tracker: record which variant YouTube Test & Compare picked

## Improvement log
- 2026-10-31 v1: walk cycle, twinge, hand-to-cheek IK, pain face, throb rings, title card.
- 2026-11-02 Ep 1 (You Have a Toothache in 1665 London, 8:26, 50 shots): DONE backlog — audio-driven viseme mouths (lip sync 3→4); motion library walk/tiptoe/run/stagger/flinch/shiver/collapse/knead (body 3→4); hand poses point/open/fist + back-hand props; crowd extras `extraLook(seed)`; camera OTS (blurred barber shoulder), dutch angle, crash zoom, push-ins in every cut; time/weather: moonlit attic, dawn and lantern-lit night street, snow in the window; painted London map with Tom's silhouette walking the route; thumbnail system (3 variants, 160-px check). New cast Agnes, Master Hollis, watchman, physician, searcher, schoolboys; 10 painted sets; procedural score + ~150 SFX cues; -14 LUFS. Weak spots seen: some long holds on inserts (bill, scales), map labels small, physician/searcher walk is the same cycle as everyone, Tom's head never turns to full profile; in the coach shot the fleeing extras' bundles sit in front of their faces (hold props lower).
- 2026-10-31 v2: reusable rig module; barber character; interior set with period props; lip sync from Kokoro voice; mitten hands holding props; fear eyes with spring pop; sweat + gulp; anticipation/overshoot; 4-shot cutting; freeze-frame comedy label; captions; full original SFX mix at -14 LUFS.
