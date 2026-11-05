# History Sourced — video production pipeline (v3, 20 Oct 2026)

Produces one finished, original, animated English history video (8–10 min, 1080p/24fps) for the YouTube channel
**History Sourced** (https://www.youtube.com/@HistorySourcedx). Reference videos: "Stamford Bridge 1066"
(reference/*_stamford_bridge.py) and "Montgisard 1177" (reference/*_montgisard.py — uses the v2 effects in fx.py).

Everything is generated from scratch: procedural parchment/maps/portraits/armies/icons (OpenCV + Pillow),
Kokoro TTS narration (Apache-2.0), synthesized score + SFX (numpy/scipy), Natural Earth map data (public domain).
No third-party footage, images, music or samples — keep it that way (copyright safety).

**The owner's standing request (19 Oct 2026):** before EVERY video, analyse similar channels thoroughly, and make
every video better than the last — better animation, better quality. Steps 1a and 9 below are therefore mandatory.

## 0. Setup (cloud container)
Download every toolkit file with the Artifact tool (`action: "list", scope: "files"`, then `action: "read"` with
`paths: [...]`) into the working directory keeping `geo/` and `reference/` subfolders. Then:
```
pip install --break-system-packages -q kokoro-onnx soundfile
curl -sSL -o kokoro.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSL -o voices.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
ffmpeg, numpy, scipy, opencv, pillow are preinstalled. **Read LESSONS.md fully before anything else.**

## 1. Pick the topic (research first)
- Never repeat a topic: read `done_topics.txt` AND search Gmail for "Yeni video hazır" subjects.
- Niche: battles / wars / turning points (medieval first; ancient, Byzantine/Ottoman, Mongol, Crusades, Napoleonic ok).
- Build series (Crusades: Montgisard → Hattin 1187 → Arsuf 1191 …; 1066; Hundred Years War; Mongols …).
- Fact-check every date/number with ≥2 sources. Hedge uncertain numbers. Label legends as legends. No invented quotes.

### 1a. Competitor + own-channel analysis (MANDATORY, ~20 vidIQ credits max; WebSearch is free)
1. `vidiq_balance` (0 cr). `vidiq_outliers` (5 cr): keyword = the niche/era of candidate topics,
   publishedWithin sixMonths, maxSubscribers ~50000. Note the 3 biggest outliers: title formula, length, topic, thumbnail idea.
2. `vidiq_channel_videos` (5 cr) on @HistorySourcedx (popular=false): views of our last uploads → which titles/topics
   are working. If a video clearly beat the others, lean into that formula/series.
3. Optionally `vidiq_channel_videos` (5 cr) on ONE breakout small competitor found in step 1, to see whether its hit
   was a one-off topic (topic matters) or a channel-wide format (format matters).
4. `vidiq_score_title` (5 cr) for the best 1–2 titles only if credits allow.
5. WebSearch: how big channels (Kings and Generals, Epic History TV, Invicta, BazBattles, Historigraph …) covered the
   chosen battle — what angle/visual they used, what they skipped. Find an angle that is clearly OURS.
6. Write `ANALYSIS.md` (½ page): outlier patterns, our own stats, chosen angle, and **3 concrete improvements this
   video will apply**. Put a 3-line summary of it in the email.
Lessons from the first analysis (Oct 2026): small-channel hits use **underdog number contrast + a famous figure**
("How the Leper King's 500 Knights Crushed 26,000 Men"); the same channel's other videos got only 200–1,300 views,
so the topic/hook drives the outlier, not the channel. Crusades / Leper King / Saladin / Mongols are hot entities.

## 2. Script → `script.py` (format: `SCENES = [(scene_id, [line, ...]), ...]`)
- 8–10 min ≈ 1,150–1,350 words at ~135–140 wpm (Kokoro bm_george, speed 0.92, en-gb), 12–16 scenes.
- **Hook (0–30 s):** open on the most dramatic moment / paradox + stakes, first visual payoff by ~10 s, one-line promise.
  No greeting, no channel intro.
- **Open loops:** a tease every 2–3 min ("but one decision that morning would doom them"). A new fact/surprise every 20–30 s.
- **Climax at ~60–70 %** of runtime. Aftermath ≤ 90 s. End on a cliffhanger leading to the next video + subscribe line.
- Give commanders motive, flaw, and (sourced!) words. Short sentences for tension; spell years as spoken.
- Make each video distinct (YouTube "inauthentic / mass-produced content" policy, July 2025): own analysis, cited
  sources, era-specific palette, music key and scene designs — never just swap names in a template.
- `python3 tts.py` → `voice.wav` + `timing.json`. Adjust text until total lands in 8–10 min.
- `python3 subs.py` → `subtitles.srt` (upload as English captions: accessibility + search).

## 3. Audio → `audio.py` (now ~30 s runtime; the old np.convolve smoothing took 45 min — never reintroduce it)
Edit topic-specific parts: `INT`, `DRUMS`, the SFX cue block (use `at(scene_id, line_idx, frac)` for timing) and
`REVEALS` (times where music drops out ~1.2 s before a key line). Helpers: `boom, horn, clash, crowd, sea, wind,
rustle (map transitions), volley (arrow storm), rumble (cavalry charge)`. Music is ducked ~10 dB under the voice.
Change the chord progression / key / BPM per era so videos don't all sound the same. Target ≈ −16…−18 LUFS.

## 4. Visuals → `scenes.py`
Write a NEW scenes.py per video: shared helpers (top of reference scenes files) + one function per scene id in
`SCENE_FUNCS`. Sync with `S.at(line_idx, "phrase")` (phrase must appear verbatim in that line).
Modules: `engine.py` (textures, text, blit, arrows, markers, camera, `GeoMap`), `art.py` (portraits via `CHAR`:
add characters with skin/hair/beard/cloak/bg/head ∈ none|crown|crown_low|helmet|turban|mitre|coif, emblem ∈
templar|jerusalem, lesions; icons: crown, mail, swords, skull, raven, handshake, arrow_hit, truecross, camel, castle,
monastery, hand), **`fx.py` (v2 upgrades — use them):**
- `formation(f, x, y, w, h, color, t, angle, kind="inf"|"cav", strength, rout, flag, flag_color, emblem="cross"|"crescent", label, seed)`
  — army blocks made of small soldier figures with waving banner; `strength` thins on casualties, `rout` scatters.
  Use instead of plain `unit()` rectangles. Size blocks ≥ 60 px thick on screen (zoom in for battles: z 0.8–1.0).
- `live_portrait(f, who, x, y, size, t, alpha, talk=None|0..1|"voice", T=global_time, angry, grey, seed)` — blinks,
  bobs, mouth flap (use talk="voice" only while that character is being quoted).
- `banner(...)`, `shake(f, t, t0, amp, dur)` (call last, returns frame), `impact_ring`, `grade(f, warm, desat, red)`,
  `locator(f, wide_map, (lon,lat), t, ...)` inset map for every tactical/zoomed map scene, `voice_amp(T)`.
- v3 (fx.py): `quote_card(f, lines, source, t, t0, t1)` for sourced quotes, `oob_row(...)` order-of-battle rows,
  `thirst_meter(f, level, t, a)` resource gauge, `fire_line(f, pts, t)`, `smoke(f, t, amt)` (cheap, seamless),
  `volley_arcs(f, p0, p1, t, t0)` arrow storms, `goblet()`; per-line push-in wrapper `_push` in reference/scenes_hattin.py.
- YouTube chapters must each be ≥ 10 s: never list the 3-s title card as a chapter.
- v6: wrap every map builder in `@disk_cached` (engine.py) instead of lru_cache; size BH to the latitude range needed.
  Never feed per-frame changing text (counters) to cached text_sprite — use `text_sprite.__wrapped__`.
- `GeoMap(..., water=True, relief=True)` now draws Natural Earth lakes + rivers and subtle hill-shading by default.
**Visual quality bar (from the competitor study):**
- Zoom ladder per battle: strategic map → region → battlefield (with locator inset) → unit level → back out.
- A major visual change (new shot / big zoom / new layout) every 8–15 s; a small change (arrow, label, counter,
  portrait) every 3–5 s. No frame static > 4 s except the end screen.
- One short label / number on screen at a time; numbers as animated counters; never sentences.
- Consistent faction colours within a video (and across a series); desaturate for death/defeat, red pulse for slaughter.
- 1–3 parallax "establishing" shots per video (desert/sea/fortress) with particles; camera shake on impacts.
- Performance: never run full-frame GaussianBlur / big fillPoly per frame — cache static layers with lru_cache
  (a per-frame blur made one scene cost 3 s/frame). Profile: `render.frame_at(T)` twice; aim < 0.5 s/frame.

## 5. Check before rendering
`python3 render.py preview <~3 timestamps per scene>` + `python3 sheet.py out.jpg <times>`, LOOK at every sheet:
overlaps, off-screen, unreadable text, empty frames, things hidden under labels. Fix and re-check.

## 6. Render (resumable)
```
mkdir -p chunks
nohup python3 render.py chunks 0 2 > logc0.txt 2>&1 &
nohup python3 render.py chunks 1 2 > logc1.txt 2>&1 &
```
Poll with sleeps ≤ 5 min. To stop renderers use `kill <pid>` from `ps aux | grep render.py` — **never `pkill -f`**
(it kills your own shell). Changing scenes.py does not affect running workers: kill, delete `chunks/*.tmp.mp4`,
relaunch (finished chunks are skipped; delete specific chunk files to re-render them). Then concat + mux:
```
for i in $(seq -f "%03g" 0 N); do echo "file 'chunks/c$i.mp4'"; done > list.txt
ffmpeg -f concat -safe 0 -i list.txt -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest master.mp4
```
QC: `python3 pacing_check.py master.mp4` (flags static stretches / missing major changes per scene — fix the worst
ones by re-rendering those chunks), extract ~10 frames and look at them, check loudness with ffmpeg ebur128.

## 7. Thumbnails (1280×720, 3 options)
Big expressive faces (enlarged portraits, angry/grey variants), number contrast, ≤ 3–4 words, two faction colours
on opposite halves, readable at 320 px wide. Suggest YouTube "Test & Compare" with all three.

## 8. Deliver (the user's computer may be OFF)
(Since 22 Oct 2026 delivery goes through the upload queue: `python3 tools/queue_publish.py --tag history-<date>-<slug> ... --wait` from a clone of scorsty-cmd/promtAPilot — never call the releases API to write; the "Queue Upload" workflow uploads + creates the release. Earlier note — since 20 Oct 2026 the scheduled task's own DELIVERY section wins: no Google Drive; one GitHub Release per video in
scorsty-cmd/promtAPilot with tag history-<date>-<slug> and exactly 4 assets: MP4, thumb_B.jpg, subtitles.srt, YOUTUBE_METADATA.txt.)
- SendUserFile limit 30 MiB → `split -b 28M -d -a 1 <name>.mp4 <PFX>.part` and write `BIRLESTIR_cift_tikla.bat`
  in the robust form from reference/BIRLESTIR_cift_tikla.bat (finds parts even if the browser renamed them, does not
  delete them, prints TAMAM/HATA). The owner once could not open the video: individual parts are NOT playable.
- ALSO make a single-file preview that plays anywhere (phone):
  `ffmpeg -i master.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -b:v 360k -pass 1/2 … -c:a aac -b:a 64k` → ≤ 28 MB
  `<name>_ONIZLEME_720p.mp4` (two-pass). Say clearly it is for watching, not for uploading.
- SendUserFile (status proactive, display attach): call 1 = parts + .bat; call 2 = preview mp4 + 3 thumbnails +
  YOUTUBE_METADATA.txt + subtitles.srt.
- If the user's computer is reachable, ALSO save to `C:\Users\HP\Videos\HistorySourced\<YYYY-MM-DD>_<slug>\`.
- Email scorsty@gmail.com (Turkish): subject "Yeni video hazır: <title> (<topic>)"; body: series, where to download
  (this run's session; file names), how to join parts (all parts + .bat in one folder, double-click; Windows
  SmartScreen → "Ek bilgi" → "Yine de çalıştır"), the 720p preview, title/description/chapters/tags, how to upload
  subtitles.srt, the 3-line analysis summary and what improved vs the last video, upload notes (AI-disclosure toggle
  not required for animated content with standard TTS).

### Thursday = "History Sourced: Unsolved" (mystery series)
Schedule since 20 Oct 2026: runs on Monday (battle video → Tue 22:00) and Thursday (Unsolved → Sat 17:00). On Thursdays (Europe/Istanbul) make a mystery episode instead. Only REAL, source-backed mysteries with an open
question (Lost Ninth Legion, Princes in the Tower, Roanoke, Franklin expedition, Teutoburg/Kalkriese, Amber Room …);
never pseudo-history. Case 01 = Roanoke, Case 02 = The Lost Ninth Legion (reference/*_ninth.py — Roman toolkit v6: aquila, march_column, case_timeline, chisel/roman_stone, deface; next teased: Case 03 = the Mary Celeste). Case 01 reference: (reference/*_roanoke.py — mystery toolkit in fx.py v4: carve, evidence_card,
red_string, stamp, evidence_meter, tree_rings, fog). Structure: eerie cold open → "HISTORY SOURCED: UNSOLVED" title → context → event → evidence
cards (artefact/document/date/source) → 3–4 theories rated by evidence → modern research → "what we know" vs
"still unknown" → ask viewers for their theory. Darker, slower visuals (night/fog/candle-lit parchment, red
"UNSOLVED" stamp), minor-key sparse music without battle drums. Never claim something is proven when it isn't.

## 9. Self-improvement loop (MANDATORY, end of every run)
1. Implement at least ONE item from the "Engine backlog" in LESSONS.md in this video (or a better idea you found
   in step 1a), test it on preview frames, and use it.
2. Append a dated entry to LESSONS.md: topic, what was improved, what still looked weak (from contact sheets and
   pacing_check), credits used, new backlog ideas.
3. Republish the toolkit artifact (same URL; read it first, then publish with `files` for every changed/new file:
   engine.py, art.py, fx.py, audio.py, PIPELINE.md, LESSONS.md, done_topics.txt, reference/scenes_<topic>.py,
   reference/script_<topic>.py) so the next run starts from the improved engine. Add the topic to done_topics.txt.
