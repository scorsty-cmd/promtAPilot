---
name: "illustrated-story-explainer"
description: "Use when making a long or short narrated video in the 'simple cartoon characters on detailed painted backgrounds' storytelling style (Epopik-like genre), on any topic, for any of the user's channels."
---

# Illustrated Story Explainer

Genre reference: Epopik (@EpopikExplain), e.g. "How Did Roman Soldiers Survive the COLD?" (11:32, ~243K views). We copy the GENRE, never their characters, faces, palette or thumbnails. The user wants every video to look original and different from other Claude/AI channels. Our edge over the reference: real animation layers on top of the illustrations (the reference is mostly still images with zoom).

## What makes the genre work (analysed from the reference)
- Characters: very simple, round white heads, dot eyes, expressive eyebrows/mouth, thin bodies, thick dark outline. Emotion carried by brows + mouth only (cold, fear, pride, boredom).
- Costumes and props are detailed and period-accurate (helmets, shields, cloaks) even though faces are minimal. Contrast = simple face / rich world.
- Backgrounds: painterly, cinematic, highly detailed (forts, roads, harbours, wide landscapes), real lighting moods: warm torchlight night, blue snowstorm, sunny Mediterranean, grey overcast.
- Shot variety: emotional close-up (one face fills frame) -> medium group shot -> huge wide establishing shot with tiny characters -> illustrated map.
- Atmosphere layers: breath steam, falling snow/rain, smoke, embers. These sell the motion.
- Narration: human-perspective, second-person-ish ("you are a legionary..."), sources listed in description, note that some scenes are reconstructions.
- Comments show viewers accept AI art when it is beautiful and consistent; inconsistency is what kills it.

## Our own look (default, user may change after seeing samples)
Before the first video of a new channel/series, generate a character sheet and show it to the user for approval. Default proposal to differentiate from Epopik:
- Head: slightly egg/pebble shaped, warm ivory (#F3EAD8) not pure white, soft grain shading, two small vertical oval eyes, one-line eyebrows, tiny blush. Outline: dark warm brown (#2B1D14), not black.
- Each recurring character has ONE signature accessory (scarf colour, scar, feather) so viewers recognise them across scenes.
- Backgrounds: gouache/storybook painting with visible brush texture, one dominant colour grade per chapter (e.g. chapter 1 amber, chapter 2 frost blue, chapter 3 ember red).
- Fonts: pick a distinct pairing per channel (check the channel's own style skill first: hidden-layer-style, history-sourced-style, universe-of-animals-style). Never default Montserrat/Impact.
- Small branded touches: chapter title cards on parchment/paper texture, a recurring map style with our own colours.

## Animation layer (what makes us different)
Use these in every long video; mix them so no two consecutive shots move the same way.
1. 2.5D parallax: split a scene into foreground / character / midground / sky (generate the empty background and the character alone on a flat colour, then remove background, or use separate-image-layers). Move layers at different speeds under a slow camera move. Default for most shots instead of flat Ken Burns.
2. Puppet (cut-out) character rig: from the approved sheet, generate an eyes-closed variant and 3-4 mouth shapes. Animate in code: blink every 3-5 s, light breathing/bobbing, head tilt; mouth shapes synced to voiceover amplitude when the character speaks. Cheap, no credits, face stays identical.
3. Animated maps: route lines drawing themselves, army arrows, pulsing city dots, borders filling, tiny character icons walking along the route.
4. Hand-drawn infographics in the same paint style: thermometer dropping to the real temperature, weight scale with items popping in, counters, then-vs-now split screen, timeline ribbon.
5. Comedy beats: speech/thought bubbles, freeze-frame with a label ("Marcus, 19, already regrets this"), quick camera shake, record-scratch SFX. About one per minute, no more.
6. Recurring guide character who sometimes talks to the camera and asks the viewer a question ("Would you survive? A, B or C?").
7. AI video (Kling image_to_video): only 5-10 hero shots per video (battle charge, storm hitting the wall, ship launching). Always start from the approved still; reject clips where the face morphs. Ask the user before spending credits.
8. Particles and light overlaid in code: snow, rain, steam, embers, dust, flickering torchlight, lightning flashes.

Build animation in code (Python + ffmpeg, or Remotion if available) so it is repeatable; keep each scene as layers plus a small JSON describing its motion.

## Pipeline
1. Topic + angle with the user. Title formula: "How Did X Survive/Live/Do Y?", "A Day as X in Y", "What If You Were X?".
2. Script: 8-12 min (1300-1800 words) for long form, 45-60 s for Shorts. Hook in first 15 s with a concrete sensory situation. Split into 4-6 chapters. Research facts with web search; keep a sources list for the description. Mark where maps, infographics, comedy beats and hero shots go.
3. Shot list: one shot per 4-6 seconds of narration (~120-160 for 11 min). Tag each shot: close-up / medium / wide / map / infographic / insert / hero. Never 3 of the same type in a row.
4. Character sheet: generate front, 3/4, expression set (neutral, cold, scared, angry, proud, tired), eyes-closed and mouth shapes with Kling text_to_image; save the approved images. Every later scene uses image_to_image / omni-ref with the sheet as reference so faces stay identical.
5. Prompt template for scenes:
   "Storybook gouache illustration, cinematic 16:9. [SHOT TYPE]. Simple cartoon character with egg-shaped warm ivory head, small vertical oval eyes, one-line eyebrows, thick warm-brown outline, [EXPRESSION], wearing [ACCURATE COSTUME]. Background: highly detailed painted [PLACE], [TIME/WEATHER], [COLOUR GRADE] lighting, atmospheric depth. No text." For parallax shots also generate the empty background and the character alone.
6. Motion: apply the Animation layer above. Plain Ken Burns (zoom 1.00->1.08, gentle pans) only as filler.
7. Voice: vidiq_voiceover_generate, calm documentary voice, slightly warm. Music: low ambient score; SFX per scene (wind, fire crackle, footsteps, armour clink).
8. Edit (ffmpeg): cut on sentence boundaries, 0.3 s crossfades only between chapters, hard cuts inside chapters, chapter title cards, burned subtitles only for Shorts. Loudness -14 LUFS.
9. Thumbnail: one big emotional close-up of the character + one bold 2-3 word caption + strong single-colour background contrast. Not copying Epopik layout.
10. QA: watch the full render; check face consistency, extra fingers, garbled text, anachronisms, mouth sync and layer edges in parallax. Regenerate bad shots.

## Rules
- Never reproduce Epopik's (or anyone's) actual characters, frames or thumbnails.
- State in the description that illustrations are AI-assisted reconstructions; list sources.
- Before generating paid images/videos, confirm count and estimated credits with the user.
- Talk to the user in Turkish.