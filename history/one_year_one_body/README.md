# History Sourced — "One Year, One Body" animation kit

Approved by the owner on 31 Oct 2026 (10-second test: 1665 London toothache). Use this look for every new History Sourced long video and improve it a little every run.

## Render
```
npm i
python3 make_audio.py            # writes public/ambience.wav (synthesised, original)
npx remotion still src/index.tsx ToothacheTest frames/f200.png --frame=200 --browser-executable=/usr/bin/google-chrome
npx remotion render src/index.tsx ToothacheTest out/test.mp4 --browser-executable=/usr/bin/google-chrome --codec=h264 --crf=18 --x264-preset=veryfast --concurrency=2
```
`--concurrency` must not exceed the CPU count (cloud workspace has 2).

## Look (keep consistent, improve, never go generic)
- Characters drawn in code as a cut-out puppet rig (src/Scene.tsx): egg-shaped warm-ivory head (#F3EAD8), small vertical oval eyes, one-line brows, thick warm-brown outline (#2B1D14), thin period-accurate costume.
- Every recurring character has ONE signature item (Tom: red toothache cloth tied over the head).
- Body animation: distance-driven walk cycle (no foot sliding), 2-bone IK arms (hand to face etc.), blink every 2–4 s, breathing, head tilt, jitter when in pain.
- Faces carry emotion: worried brows, squeezed >< eyes, wobbly zigzag mouth, "O" surprise mouth.
- Backgrounds: painted street/landscape built from SVG with displacement + brush-texture filters, 3–4 parallax layers, fog, dust motes, window flicker, vignette and animated grain. One colour grade per chapter.
- Effects: pain throb rings synced to heartbeat SFX, camera shake on shocks, push-in to close-ups.
- Typography: IM Fell English SC (place/date), Fraunces Black (big statements, key word in red #E5503A), IM Fell English Italic (subtext). Fonts are in public/fonts.
- Sound: original synthesised ambience, footsteps, bells, heartbeat, impacts (make_audio.py) under the narration.

## Improvement backlog (do at least one per video, then log it below)
- Mouth shapes driven by narration amplitude when a character speaks
- Second camera angle per scene (over-the-shoulder, low angle)
- Interior sets (barber-surgeon shop, home, hospital) and props (pliers, candles, jars)
- Crowd/background extras reusing the rig with different colours
- Better hands (3-finger mitten shapes) and turning head (front / 3-4 / profile)
- Animated parchment map transitions between places
- Thumbnail: character close-up at peak emotion + max 3 words

## Improvement log
- 2026-10-31: first version (walk, twinge, hand-to-cheek IK, pain face, throb, title card).
