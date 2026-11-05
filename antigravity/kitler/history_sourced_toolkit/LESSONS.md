# History Sourced — lessons & improvement log
Read this before every run. Append a dated entry at the end of every run (PIPELINE.md step 9).

## Channel performance notes
- 2026-10-14 "Battle of Hastings 1066: Three Kings, Three Battles, One Year" (8:09) → 37 views after 5 days.
  Generic "Battle of X" titles do not break out for a new channel.
- Competitor "Battle Tales" (~1.4k subs): "How The Leper King's 500 Knights Crushed 26,000 Men in Just 1 Day |
  Montgisard (1177)" → 235k views (210× outlier); every other video of theirs 200–1,300 views. Formula that worked:
  underdog number contrast + famous character + "How ...". Use it.

## Log
### 2026-10-14 — Stamford Bridge 1066 (first engine version)
- Baseline engine: parchment maps, rectangle units, static portrait medallions, kinetic text, TTS + synth score.

### 2026-10-19 — Montgisard 1177 (Crusades series #1, 8:31)
- New: CHAR baldwin/saladin/raynald/odo/williamtyre/taqi; headgear turban/mitre/coif; emblems; icons truecross,
  camel, castle, monastery, hand; desert parallax backdrop; evidence-style myth-busting (silver mask).
- Problems found: owner could not open the video (split parts aren't playable) → now always also send a 720p
  single-file preview + robust .bat. audio.py took 45 min (np.convolve with a 72k kernel) → replaced by moving
  average (30 s). One scene cost 3 s/frame (per-frame full-frame GaussianBlur) → cached. `pkill -f render.py`
  killed the shell → use kill <pid>.
- pacing_check on master: static stretches 6–10 s in title/boy/king/gamble/aftermath scenes; >12 s without a major
  change in cold open (21 s), gamble (18 s), aftermath (17 s). → add a camera move/new element every 4 s there.
- Same day, v2 upgrade after the owner asked for continuous improvement + competitor analysis (research on Kings and
  Generals, Epic History TV, Invicta, OverSimplified, BazBattles …): fx.py (formation blocks of soldier figures with
  waving banners, rout scatter, living portraits that blink/bob/mouth-flap, camera shake, impact rings, colour grade,
  inset locator map), GeoMap Natural Earth lakes + rivers + hill-shading, subs.py (SRT), pacing_check.py, audio
  rustle/volley/rumble + music drop-outs before reveals + stronger ducking. Battle scene of Montgisard re-rendered
  as demo with the new formations.

## Engine backlog (pick at least one per video)
1. Order-of-battle screen: two columns of formation icons with counters before each battle.
2. Expression variants per character (angry/shocked/dead) + use live_portrait everywhere instead of portrait().
3. Parallax 2.5D establishing shots (fortress, camp, fleet) with fog layers and foreground silhouettes.
4. Zoom-ladder transition helper (map→map zoom with paper-rustle whoosh and cross-dissolve on camera scale).
5. Animated arrow volleys (arcs of small arrows) and cavalry dust trails behind moving formations.
6. Era palettes + music presets (crusades: Phrygian/hijaz scale, oud-like plucks; vikings: drones; Rome: brass).
7. Per-scene "small change every 4 s" auto-helper (subtle zoom pulse / label pop) driven by pacing_check output.
8. Thumbnail generator v2: oversized expressive face (angry eyebrows) + 2-word headline + number badge.
9. Better character art: shaded hair strands, armour detail, simple body below the medallion (half-figure puppets).
10. Primary-source quote cards (parchment card, author + year) — fits the "Sourced" brand.

### 2026-10-20 — Hattin 1187 (Crusades series #2, 9:29)
- Title chosen by vidIQ score: "The Worst Decision in Crusader History: How Thirst Killed a Kingdom | Hattin 1187" (92 vs 82 for the
  "How Saladin destroyed 20,000…" variant). Credits used: 20 (outliers, own channel videos, 2× score_title). Hastings still 37 views.
- New in fx.py (v3): quote_card (primary-source parchment card, word-by-word reveal + wax seal) [backlog #10], oob_row
  (order-of-battle rows with formation icons + counters) [backlog #1], thirst_meter (resource HUD that drains across scenes),
  fire_line (layered flickering flame front + glow band + embers), smoke (cached, mirrored = seamless scroll — the first version
  had a visible seam), volley_arcs (parabolic arrow storms) [backlog #5], goblet icon. New CHAR: guy, raymond, gerard, afdal,
  imad, richard, urban. New scene types: tent interior (cached drapes + candle flicker), hattin_field battlefield, galilee_map.
- audio: E-hijaz chord progression, 78 BPM, oud-like Karplus-Strong plucks in calm scenes, night frame drums, grass-fire crackle
  [backlog #6 partly]. Still ~25 s runtime.
- Render speed ~0.2 s/frame (2 workers → ~25 min for 9.5 min video).
- Weak spots seen on contact sheets: march formations look thin when rotated along a diagonal route (formation() with angle
  makes narrow blocks — consider a "column" kind); portraits still static medallions (backlog #2/#9 open); the 3-s title scene is
  too short for a chapter (YouTube chapters need ≥10 s — never list the title card as a chapter).
- New backlog ideas: 11. formation kind="column" for marching armies along routes. 12. reusable "distance ruler" (miles to water).
  13. thumbnails: live_portrait at t=0 blinks (eyes closed) — always render thumbs at t≈1.0.

### 2026-10-22 — Roanoke, The Lost Colony (History Sourced: Unsolved #1, ~9:59, Thursday run)
- Title: "115 People Vanished and Left One Word Behind | The Lost Colony of Roanoke" (no vidIQ credits left to score it; balance
  was 10 → used outliers 5 + own channel 5). Mystery outliers: Amelia Earhart "what they found", ghost ships, US mysteries.
- New in fx.py (v4, mystery toolkit): carve() (letters cut into stripped wood + chips), _bark() textures, evidence_card() +
  red_string() (pinned investigation board), stamp() (slammed rubber stamp), evidence_meter() (theory rating 0–5),
  tree_rings() (dendro chart), fog() (low ground mist). art.py: galleon() Elizabethan ship sprite; portrait features ruff, hat,
  capbonnet, morion, cap (coif), crown_small, roach + paint + beads (Algonquian), female long hair, curls, pearl, pointed beard;
  CHAR white, raleigh, elizabeth, manteo, wanchese, wingina, lane, fernandes, eleanor, strachey, powhatan [backlog #9 partly].
  scenes: coast_scene() parallax pine treelines (3 layers) + smoke_column + rowboat, sea_ships() with galleons, person()/crowd_grid()
  (115 colonists that vanish), ico() small props (house, longhouse, chest, cradle, rapier hilt, gun, slate, pencil, sherd, stone,
  trowel, barrel, eagle, fort), white_map() watercolour map with X-ray patch reveal, board_bg() cork board.
- subs.py v2: spoken numbers → digits (NUMS table, extend per video), cue splits at commas. Better for the Shorts task.
- audio: "Unsolved" sound — D aeolian pad, music-box bells, lute plucks, heartbeat pulse (no drums), trumpet call, owl, carving
  scratches, stamp thuds, storm rain, REVEALS before "No one answers", "Croatoan", "case stays open".
- Problems found on contact sheets (fixed): parallax treeline ran out of width at large pan (keep offsets < 600 px); smoke column
  hidden behind the front tree layer; stamp grit erased letters ("UN OLVED") → clip grit to ≥ .35; card titles overflowed
  (font size now from card width); evidence-card pins ignored alpha; dark bark looked like a barcode → sparse wavy furrows;
  white_map overflowed the frame (scale to fit); portraits/plates at x=210 clipped long names → x ≥ 300.
- `pkill -f` killed my shell AGAIN (step 2 of this run) — never use it, even for tts.py. A Bash call that timed out (sleep 120)
  also killed a nohup render worker → launch workers with `setsid nohup ... < /dev/null &` and keep sleeps < 100 s per call.
- Render speed: ~45–80 s per 480-frame chunk per worker when nothing else runs (≈0.1–0.17 s/frame); first chunk slow
  (GeoMap 10m builds ≈10 s each per process).
- Weak spots still: people icons are tiny at map zoom; storm scene still shows the moon; "What's your theory" end card is plain;
  colonists' crowd grid could use walking animation.
- New backlog ideas: 14. subtitle NUMS auto-generated from script (num2words reverse). 15. weather layer (rain + lightning +
  cloud cover hiding the moon) as one fx helper. 16. comment-bubble / poll card helper for viewer questions.
  17. pre-render static map frames once per scene (cache camera-independent overlays) to speed up 10m maps.

### 2026-10-22 (re-run) — Roanoke re-produced for the upload queue (Unsolved #1, 9:59)
- Why: the morning run could not upload (GitHub Releases API blocked for cloud sessions). The user re-fired the task to
  remake the SAME topic and deliver via `tools/queue_publish.py` (branch queue/<tag> → "Queue Upload" workflow uploads
  to YouTube and creates the release itself). Tag: history-2026-10-22-roanoke. vidIQ balance was 0 (resets 29 Oct) → no credits used.
- New in fx.py (v5): `storm_sky()` (moonless sky + cloud deck; scenes.sky("storm")), `clouds()` scrolling cloud deck
  (underlit by lightning), `rain_layer()` 2 parallax sheets from cached tiles (cheap), `lightning()` forked bolt + flicker
  flash, `weather(f, t, rain, cloud, bolts)` one-call storm layer [backlog #15 done]; `poll_card()` community-poll style
  viewer prompt with lettered options A–D that highlight as narrated + typing "My theory: ..." comment line — no fake vote
  numbers [backlog #16 done]. crowd_grid() figures now sway/bob (alive, not frozen). Storm scene: WAVE_COLS["storm"],
  4 lightning bolts + matching thunder in audio.py; dream scene "A BASE AGAINST SPAIN" no longer overlaps the portraits.
- Still weak: people icons small on maps; cold-open "0" counter frame is emptyish; the code-rules panel text is small.
- New backlog ideas: 18. comment-bait end card variants per series (poll for Unsolved, "who was right?" for battles).
  19. speed: share the GeoMap 10m cache across workers (pickle to disk) — first chunk per worker costs ~200 s.

### 2026-10-29 — The Lost Ninth Legion (History Sourced: Unsolved #2, 9:06, Thursday run)
- Topic chosen to keep the promise made at the end of the Roanoke video ("next: the Lost Ninth Legion"). Ending now teases
  Case 03 = the Mary Celeste (1872) — research notes for it: RMG, Smithsonian 2007 (Anne MacGregor), history.com, Chemistry
  World / IFLScience 2026 (Rowbotham & Mair, Univ. of Manchester, ethanol-vapour model) — make it next Thursday.
- vidIQ balance was 0 (renews 29 Oct 14:30 UTC) → 0 credits used; WebSearch only. Monday 26 Oct: no battle-video release
  exists in the repo (that run apparently did not deliver) — check before assuming the series is continuous.
- Title: "5,000 Roman Soldiers Vanished From History | The Lost Ninth Legion"; thumb B = galea face + GONE.
- New in v6: art.py heads `galea` (crest colour via `crest=`), `laurel`; features `toga`, `torc`, `glasses`, `paint_col`,
  beard `long_full`; CHAR trajan, hadrian, aurelius, cerialis, agricola, severianus, tacitus, fronto, boudica, caledonian,
  mommsen. fx.py: `aquila()` (gold/grey/bronze, wings/pole optional), banner emblem "eagle", `march_column()` [backlog #11
  done], `case_timeline()` (dated sightings, LAST SEEN stamp, '?' gap, scan cursor), `roman_stone()` + `chisel()` (V-cut
  letters, optional red paint, chips), `deface()` (damnatio memoriae). engine.py `disk_cached` decorator: GeoMaps are
  pickled to ./cache and shared by render workers [backlog #19 done] — DELETE ./cache after editing a map builder.
  locator() clamps itself into the frame. subs.py v3: cue boundaries snap to real pauses in voice.wav.
- BUG found + fixed: text_sprite lru_cache (maxsize 2048) + a 0→5,000 animated counter = thousands of big cached sprites →
  render worker OOM-killed at 5.1 GB (dmesg "Memory cgroup out of memory"). Now maxsize 600 and counters call
  `text_sprite.__wrapped__` (uncached). Rule: never pass per-frame changing text through cached sprite builders.
- Map lesson: a GeoMap only covers BH/k degrees of latitude — Britain at 13° width with 16:9 BH cut off everything south of
  52.3°N (Kent/Colchester clamped off-screen). Size BH to the latitude range you need (britain_map BH=4400, empire BH=3000).
- Weak spots seen on sheets: march columns tiny at strategic zoom; header bar text gets clipped by the _push zoom; the
  verdict meters screen is short (2.6 s line) → keep panels on screen into the next line; first frame of a scene that
  builds a cached layer costs 3–10 s (fine for chunks, slow for previews).
- New backlog ideas: 20. Mary Celeste kit: brigantine sprite (2 masts, no gun ports), deck plan cutaway, logbook slate,
  drift-path map with chronometer error. 21. header bar immune to _push (draw after the push). 22. auto-generate subs NUMS
  from the script (backlog #14 still open).
- AUDIO: the raw mix of earlier videos sat around -33 LUFS integrated (boom peaks set the normalisation). audio.py v6 now
  writes mix_raw.wav and masters mix.wav with alimiter + loudnorm → -16 LUFS / -1.8 dBTP. Always check with ebur128.
- pacing_check on master: 12 static (≥4 s) stretches, all 4–5.5 s except Silchester board (theory4) = 14.5 s without a
  major change even after a stronger _push → next time split long single-board lines into two shots. Render: 28 chunks,
  2 workers, ~16 min (after the OOM fixes); file 220 MB, 9:06.
