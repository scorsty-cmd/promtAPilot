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

## Improvement backlog (take at least one per video; move done items to the log)
- Viseme mouth shapes (M/B closed, F/V lip bite, O, E) from phoneme timing instead of only amplitude
- Head turn to full profile and back, with hair/ear swap
- Proper walk/run library: walk, tiptoe, run, flinch, shiver, collapse into chair
- Hand poses: point, fist, open palm, hold cup/candle
- Crowd extras: reuse rig with randomised looks, background idle loops
- Camera: over-the-shoulder and low-angle shots, rack-focus (blur foreground/background)
- Weather/time: rain on windows, snow, night street with lantern light pools
- Painted map transition with Tom's silhouette walking along the route
- Thumbnail system: character at peak emotion, 3 words, colour-contrast test at 160 px width

## Improvement log
- 2026-10-31 v1: walk cycle, twinge, hand-to-cheek IK, pain face, throb rings, title card.
- 2026-10-31 v2: reusable rig module; barber character; interior set with period props; lip sync from Kokoro voice; mitten hands holding props; fear eyes with spring pop; sweat + gulp; anticipation/overshoot; 4-shot cutting; freeze-frame comedy label; captions; full original SFX mix at -14 LUFS.
