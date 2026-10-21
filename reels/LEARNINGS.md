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
- 21 Oct: repo scorsty-cmd/promtAPilot is now PRIVATE -> raw.githubusercontent URLs return 404, photos.py waits forever (copy assets/<id>/ from the clone after `git pull` instead) and vidiq_video_upload cannot import the MP4. Publishing is blocked until the owner makes the repo public again or picks another public host.
- reel2_v4 (reels/renderer/reel2_v4.py): `exif` beat (photo card + metadata sheet typing coordinates + pin drop on mini map, card_photo=key), `toggle` beat (path rows light up, drawn switch ON->OFF, confirmation chip), GPS_TICKER live scrambling readout on the hook from frame 0, per-beat blur= for photos with text, whip-pan smear on odd cuts / glitch on even. reel_audio peak factor 0.70 (0.79 gave -0.5 dB max).

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

### 2026-10-21 16:49 – FILE 007 – Photo location metadata (P3 coral/indigo, 26.3 s) – NOT PUBLISHED (repo private)
- File: HL_Reel_20261021_1649_photo-location.mp4 · sent to owner as "bekliyor".
- New vs FILE 006: live GPS ticker on frame 0; `exif` metadata-reveal animation with map pin; `toggle` switch animation for the fix; whip-pan cuts alternating with glitch; 3 real CC0 photos (map pin blurred, street house, doorway).
- Analysis (free; vidIQ balance 10 < 40): owner insights above; inro.social 3-second hook guide – open on the strongest moment, hook as first on-screen line + first spoken words, no greeting/dead air, watch the early retention drop.
- Previous (FILE 006): 118 plays, 25.1% watched, 61.6% skip, 0 saves, 0 shares.
