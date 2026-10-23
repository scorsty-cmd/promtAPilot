# Hidden Layer Reels – improvement log

## Rules learned so far
- v1 (49 s, slow title card) → 80% skip, 12–20% watched. Keep 20–30 s, huge hook text at frame 0, one idea.
- v2 "case file" (HUD + countdown, doc receipt with highlighter, word captions, glitch cuts) → ~20–23% watched; skip still ~78–80% on tiny samples (≤10 plays). Not enough data yet to call a winner.
- Niche outliers (vidIQ, 19 Oct): personal/conditional hooks naming the viewer's device ("If you have an iPhone…"), the exact Settings path on screen (save-worthy), real hands/phones/places footage, explicit "save this" ending.
- Workspace network: only GitHub reachable. Pexels/googleapis video URLs (B-roll) can NOT be downloaded here → B-roll needs the fetch workflow to support videos (owner decision). Don't spend the B-roll credit until then.
- fetch_images.py crashes when Openverse times out (UnboundLocalError on `r` in search()); runs 9 and 10 failed on 19 Oct. Fallback: reuse unused photos from older assets/ folders (never from today's other Reel).
- FILE 005's renderer changes were never saved and were lost. Since FILE 006 the evolved renderer lives in reels/renderer/reel2_v3.py: copy it over the kit's reel2.py at the start of each run and extend it, then commit the new version (reel2_v4.py ...).
- reel2_v3 effects: hook accent line as inverse colour block + small KICKER chip (module var), `numswap` beat (phone-number card changes owner + text bubble), photo `style='card'` parallax split, rack-focus pull on photo beats, drifting light leak, sub hit on every cut, GAP 0.06 s. Trim Kokoro silences after tts_short.py (leading/trailing < 0.01 amplitude) -> tighter pace.
- Hook text at frame 0 must fit with the 1.06 slam scale: non-accent lines max 860 px, accent 820 px.
- Long renders: launch with `setsid nohup ... < /dev/null & disown`, otherwise a timed-out shell kills the render.
- Owner data 20 Oct: FILE 004 (Google account, loss/consequence hook, 02:49 slot) 78% watched / 0% skip (tiny sample); FILE 005 (iPhone locations, amber, photo-heavy) 13% watched / 94% skip on 18 plays. Loss/consequence hooks look stronger than "your device does X" hooks so far.
- Owner data 21 Oct: FILE 006 (recycled numbers, numswap animation, 24 s) best so far: 118 plays, 25.1% watched, 61.6% skip (FILE 005: 17.0% / 79.7%). Custom on-screen animation + loss hook + tight pace is the direction.
- 21 Oct: repo scorsty-cmd/promtAPilot was restored to PUBLIC -> raw.githubusercontent URLs return 200 OK. Video raw link is active and accessible for vidIQ / Instagram import.
- reel2_v4 (reels/renderer/reel2_v4.py): `exif` beat (photo card + metadata sheet typing coordinates + pin drop on mini map, card_photo=key), `toggle` beat (path rows light up, drawn switch ON->OFF, confirmation chip), GPS_TICKER live scrambling readout on the hook from frame 0, per-beat blur= for photos with text, whip-pan smear on odd cuts / glitch on even. reel_audio peak factor 0.70 (0.79 gave -0.5 dB max).

- Owner data 22 Oct: FILE 007 (photo location, published 21 Oct 15:04 UTC) only 12 plays, 7.5% watched, 90.9% skip – worst v2 result. Likely causes: hook stated the answer (closed loop), 7-word hook + GPS ticker clutter, location topic repeated (FILE 005 too). Keep hooks open-loop (hide the payoff), max 6 words, one element on frame 0; avoid a 3rd location topic.
- reel2_v5 (reels/renderer/reel2_v5.py + reel_audio_v5.py): `snap` beat (drawn email card, buttons strike OFF one by one, viewfinder closes, shutter flash on the spoken word via shutter=<fraction>, screenshot thumbnail flies to corner + SAVED chip), `shutter` SFX, PUNCH_EVERY module var (fewer zooms), blurred photo plates under compare/snap beats. Peak factor 0.70 -> -1.7 dB max.
- photos.py: raw manifest URL can lag/404 although the workflow committed; after ~3 min `git pull` and copy from the clone's assets/<id>/. Openverse returns junk for abstract queries ("sealed envelope", "camera lens") – ask for hands/objects in use ("hands typing on laptop keyboard").
- support.apple.com guide pages, faq.whatsapp.com (robots) and linkedin.com (permission) could not be read on 22 Oct; support.google.com works.
- Owner data 22 Oct (16:49): FILE 008 (Gmail confidential, open-loop hook, 23 s) 33 plays, 19.8% watched, 76.7% skip – better than FILE 007 (39 plays, 14.1%, 74.3% now) but still below FILE 006 (24.9% / 61.6%). Custom animation + consequence hook remains the best predictor.
- reel2_v6 (reels/renderer/reel2_v6.py + reel_audio_v6.py): `telemetry` beat (drawn map, car dot drives a route, breadcrumb ping on a fixed rhythm, event pins pop with chips, live PING/MPH/time ticker, "EXAMPLE"), `report` beat (paper report fills row by row -> SOLD stamp -> flies along an arrow to an INSURER card where an example premium counts up), SPEED_LINES module var (streaking light lines behind the hook from frame 0), `blip`/`beep` SFX synced to pings/events. Peak factor 0.70 -> -0.9 dB max (borderline; use 0.66 if a mix gets louder).
- 22 Oct 16:49: fetch-images workflow runs 30/31 hung (in_progress/pending >15 min, no assets). Fallback used: unused CC0/CC BY car/road photos from the long-video folders 20261020-hlu-b1/b3. photos.py process must be killed before copying fallbacks (it would overwrite photos/). Low-res (1024 px) photos are fine as blurred plates, borderline as sharp hook backgrounds.
- vidIQ balance was 0 on 22 Oct (resets 29 Oct) -> all analysis free until then.
- Owner data 23 Oct: FILE 008 (Gmail confidential, statement open-loop "X has a blind spot", 23 s, snap animation) climbed to 71 plays, 45.0% watched, 67.2% skip – best watch % so far. FILE 009 (question hook "Did your car raise your insurance?") 14 plays, 9.1% / 76.9% early. Statement open-loop hooks > question hooks so far.
- 23 Oct: new user skill "hidden-layer-style" (style DNA): Instrument Serif headlines (one italic phrase on a highlighter block), IBM Plex Mono labels/captions (ink on paper pill, keyword highlighted), ink #121316 / paper #ECE8DE / highlighter #E4FF3C only accent, hard cuts (no whoosh every cut), margin notes typing on, stamps in ink. Fonts in reels/renderer/fonts/ (copy next to reel2.py). Future: "Fine Print" paper-background variant needs panel/caption colour rework.
- reel2_v7 (reels/renderer/reel2_v7.py + reel_audio_v7.py): STYLE='dna' module var (fonts/captions/stamp), CUTS='hard', `ingest` beat (example chat bubbles type in, fly on a curve into a MODEL core, counter + bar), TYPING_HOOK (typing-dots bubble under the hook), beat note='→ ...' margin note (2 frames/char + `type` key-tap SFX). Peak 0.70 -> -2.5 dB max.
- Fetch workflow run 32 (23 Oct) returned 0 images for all 3 queries -> fallback typing_0 (CC BY, 20261022-0249b) + server_0 (CC0, 20261022-uber). Still-unused fallbacks: servers_0/1 (hlu-b2, CC0; servers_0 has mannequins – skip), laptop_1 (20261019-0249). help.openai.com pages are readable with WebFetch.

## Entries
### 2026-10-19 16:49 – FILE 005 – iPhone Significant Locations (P2 amber/blue, 27.9 s)
- File: HL_Reel_20261019_1649_iphone-significant-locations.mp4 · https://www.instagram.com/reel/Dercfl2DG4H/
- New vs FILE 004: animated Settings-path payoff beat; parallax photo card; rack-focus + light leak on photos; hit SFX on every cut; voice 1.08x (was 1.05x).
- Analysis: outlier search (5 cr) – @meganmykal44 Samsung policy (55x median), @maddisonrotner iPhone setting with path (187x), @leovibes.ai settings tutorial + save CTA (21x), @just.call.me.koko surveillance explainer w/ real footage (68x).
- Previous (FILE 004 Google inactive account, 26 s): insights still lagging (0 plays reported). FILE 003 Venmo: 10 plays, 19.6% watched, 77.8% skip, 0 saves/shares.
- B-roll (1 cr) found but not downloadable from the workspace.

### 2026-10-20 02:49 – FILE 006 – Recycled phone numbers (P1 teal/violet, 24.0 s)
- File: HL_Reel_20261020_0249_recycled-phone-numbers.mp4 · https://www.instagram.com/reel/DesgiMOj_wb/
- New vs FILE 005: inverse-block hook + kicker chip at frame 0; custom `numswap` animation (number changes owner, login code text goes to the stranger); 66% count-up stat receipt + paper-abstract doc receipt; trimmed voice silences + 1.10x speed (24 s, 74 words); renderer saved to repo.
- Analysis (free, 02:49 run, 0 credits): owner insights above; Opus/quso 2026 guides – hook within 0.5–1.5 s, script first 3 s, change visual every 1.5–3 s, one text element per frame, one specific CTA.
- Previous (FILE 005): 18 plays, 13.3% watched, 94.1% skip, 1 save, 0 shares.
- Photos: workflow run 11 OK (Openverse). Kept keypad_0 (CC BY), reused CC0 phone_1 from 20261018-1649; rejected Nook (brand UI), postbox/phone box (text), person.

### 2026-10-21 16:49 – FILE 007 – Photo location metadata (P3 coral/indigo, 26.3 s) – published 21 Oct 15:04 UTC · https://www.instagram.com/reel/Dewr6MNgrS-/
- File: HL_Reel_20261021_1649_photo-location.mp4 · Raw URL: https://raw.githubusercontent.com/scorsty-cmd/promtAPilot/main/reels/HL_Reel_20261021_1649_photo-location.mp4 (HTTP 200 OK).
- New vs FILE 006: live GPS ticker on frame 0; `exif` metadata-reveal animation with map pin; `toggle` switch animation for the fix; whip-pan cuts alternating with glitch; 3 real CC0 photos (map pin blurred, street house, doorway).
- Analysis (free; vidIQ balance 10 < 40): owner insights above; inro.social 3-second hook guide – open on the strongest moment, hook as first on-screen line + first spoken words, no greeting/dead air, watch the early retention drop.
- Previous (FILE 006): 118 plays, 25.1% watched, 61.6% skip, 0 saves, 0 shares.

### 2026-10-22 02:49 – FILE 008 – Gmail confidential mode can't stop screenshots (red/yellow, 23.3 s)
- File: HL_Reel_20261022_0249_gmail-confidential.mp4 · https://www.instagram.com/reel/DexrlvgguXY/
- New vs FILE 007: open-loop 6-word hook ("Confidential mode has a blind spot", payoff hidden until beat 2) with a context kicker chip and no ticker; new `snap` animation with shutter flash on the word "screenshot"; first myth-vs-fact `compare` beat over a blurred real photo; calmer camera (punch-in every 3rd caption group); new red/yellow palette + shutter SFX.
- Analysis (free, 02:49 run, 0 credits): owner insights; async.com editing guide (strongest moment first, cut dead air >0.4 s, fewer zooms, end on payoff/loop); postiz hook framework (open a loop, context in ~1 s, don't show the answer in frame 0).
- Previous (FILE 007): 12 plays, 7.5% watched, 90.9% skip, 0 saves, 0 shares. FILE 006 still best (118 plays, 24.9%, 61.6%).
- Photos: run 26 junk (cake, seal, insects); run 27 OK -> typing_1 (CC BY 2.0, Shixart1985); reused CC0 laptop_0 from 20261019-0249 as compare plate.

### 2026-10-22 16:49 – FILE 009 – Connected-car driving data sold to insurers (FTC v. GM; lime/cyan, 27.4 s) · https://www.instagram.com/reel/DezLITzDQUH/
- File: HL_Reel_20261022_1649_car-driving-data.mp4 · Raw URL HTTP 200.
- New vs FILE 008: first question hook ("Did your car raise your insurance?", 6 words, consequence + open loop) over motion speed-lines + real light-trail photo; new `telemetry` route animation (ping every "3 s", HARD BRAKE / 11:47 PM / SPEEDING pins); new `report` -> SOLD -> INSURER premium count-up animation; data blip/beep SFX synced to the pings; first non-phone topic (car), new lime/cyan palette.
- Analysis (free; vidIQ balance 0): owner insights (above); web trend guides (argil: b-roll/visual changes every 2–4 s, quality of hook + pacing over face); niche pattern kept: news/regulator receipt (FTC order card) + practical check at the end.
- Previous (FILE 008): 33 plays, 19.8% watched, 76.7% skip, 0 saves, 0 shares.
- Photos: workflow hung; reused CC BY "Light Trails" (wwarby) + CC0 city traffic x2 + CC0 rain on car window from 20261020-hlu-b1/b3.

### 2026-10-23 02:49 – FILE 010 – ChatGPT content may train OpenAI models (style DNA dark variant, 26.3 s) · https://www.instagram.com/reel/De1UI6bjBvS/
- File: HL_Reel_20261023_0249_chatgpt-training.mp4 · Raw URL HTTP 200. Same topic as today's planned YouTube Fine Print episode (cross-promo).
- New vs FILE 009: first Reel in the Hidden Layer style DNA (serif headline + italic highlighter phrase, mono paper-pill captions, ink stamp "OPT-OUT"); statement open-loop hook (FILE 008 pattern) instead of a question; new `ingest` chat-to-model animation; typing bubble + margin notes with key-tap SFX; hard cuts instead of whip/glitch.
- Analysis (free, 02:49 run, 0 credits): owner insights (above); shortgenius 2026 trends (Reels favour clean composition + polished captions, each scene a micro-payoff, outcome-first opener built backward from the payoff); pippit retention guide (pattern interrupts, no early CTA, captions for sound-off).
- Previous (FILE 009): 14 plays, 9.1% watched, 76.9% skip, 0 saves, 0 shares.
