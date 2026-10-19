# Hidden Layer Reels – improvement log

## Rules learned so far
- v1 (49 s, slow title card) → 80% skip, 12–20% watched. Keep 20–30 s, huge hook text at frame 0, one idea.
- v2 "case file" (HUD + countdown, doc receipt with highlighter, word captions, glitch cuts) → ~20–23% watched; skip still ~78–80% on tiny samples (≤10 plays). Not enough data yet to call a winner.
- Niche outliers (vidIQ, 19 Oct): personal/conditional hooks naming the viewer's device ("If you have an iPhone…"), the exact Settings path on screen (save-worthy), real hands/phones/places footage, explicit "save this" ending.
- Workspace network: only GitHub reachable. Pexels/googleapis video URLs (B-roll) can NOT be downloaded here → B-roll needs the fetch workflow to support videos (owner decision). Don't spend the B-roll credit until then.
- fetch_images.py crashes when Openverse times out (UnboundLocalError on `r` in search()); runs 9 and 10 failed on 19 Oct. Fallback: reuse unused photos from older assets/ folders (never from today's other Reel).
- Reusable effects in reel2.py (since FILE 005): `path` beat (settings breadcrumb, steps land as spoken, last step toggles OFF), photo `style='card'` (parallax split: blurred plate + framed card moving opposite), rack-focus blur pull at photo beat start, drifting light leak on photo beats, sub hit on every cut.

## Entries
### 2026-10-19 16:49 – FILE 005 – iPhone Significant Locations (P2 amber/blue, 27.9 s)
- File: HL_Reel_20261019_1649_iphone-significant-locations.mp4
- New vs FILE 004: animated Settings-path payoff beat; parallax photo card; rack-focus + light leak on photos; hit SFX on every cut; voice 1.08x (was 1.05x).
- Analysis: outlier search (5 cr) – @meganmykal44 Samsung policy (55x median), @maddisonrotner iPhone setting with path (187x), @leovibes.ai settings tutorial + save CTA (21x), @just.call.me.koko surveillance explainer w/ real footage (68x).
- Previous (FILE 004 Google inactive account, 26 s): insights still lagging (0 plays reported). FILE 003 Venmo: 10 plays, 19.6% watched, 77.8% skip, 0 saves/shares.
- B-roll (1 cr) found but not downloadable from the workspace.
