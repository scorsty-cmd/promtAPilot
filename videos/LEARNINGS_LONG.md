# Hidden Layer – long-video improvement log

## Rules learned so far
- Delivery: GitHub Release tag `hiddenlayer-<date>-<slug>` (draft → upload MP4 + thumb_B.jpg + YOUTUBE_METADATA.txt + subtitles.srt → verify sizes → publish). Publishing triggers "Daily YouTube Upload & Schedule".
- Photos: request with orientation 'wide' (fetch_images.py passes it to Openverse/Pexels). Raw manifest URL lags; after the workflow run is green, `git pull` the clone and copy assets/<id>/. Two batches of ~10–13 keys give ~15 usable photos; reject logos (car brands, shop signs), collages, faces, contact sheets, watermarks. Abstract queries ("coins on table", "concert crowd") can return nothing.
- Renderer v2 for long videos lives in videos/renderer/ (hl_ext.py + patched render.py + audio.py + thumbs.py): copy over the kit files at the start of each run and extend.
- Render speed with photo backgrounds: ~5 fps per process on 2 cores → split the timeline into 2 halves (`--start/--end`) and concat (`-c copy`). 9 min ≈ 30 min wall clock.
- Photos with aspect < 1.2 get a blurred-fill plate; 4:3 images are cover-cropped (letterboxing 4:3 looked cheap).
- Blur boxes on thumbnails look blocky – pick a photo without plates/signs instead.
- vidIQ balance was 10 on 22 Oct (< 45) → no paid analysis; use free public guides + Reels learnings.

## Entries
### 2026-10-22 – The Algorithm – "Your Uber Price Isn't Random — Here's What Actually Decides It" (P2 amber/blue, 8:55)
- 5 improvements vs the Snapchat Fine Print video (16 Oct): (1) 17 real CC0/CC-BY photos as full-screen beats and dimmed backgrounds with Ken Burns push/pull, parallax split, rack-focus, light leak, grain, vignette and one palette grade; (2) realistic document mock-ups (memo / engineering blog / academic paper) with animated highlighter, VERBATIM stamp and a source lower-third with read date on every factual beat; (3) animated counters (1.5M trips, 258 drivers, 50%, $1.60) and bar charts from real study numbers; (4) myth-vs-fact verdict cards (strike-through + stamped NO EVIDENCE / UNPROVEN) and an illustrative receipt clearly labelled EXAMPLE; (5) chapter-aware music bed (different progression per chapter, drums only at reveals), risers/hits, room tone, compressed voice, −14 LUFS master, SRT subtitles, 3 photo thumbnails.
- Competitor/retention findings (free sources): change visuals/audio every ~10–15 s at minimum; open with the strongest proof and state the promise in the first sentence; 8–15 min is the sweet spot for education; keep the subscribe CTA for the last ~20 s; real footage/places beat flat icons (also seen in Reels outliers).
- New reusable beat kinds: photo, doc_quote(style memo|blog|web|paper), counter, chart, receipt, myth, surgemap; `src=` lower-third on any beat; PHOTO_BLUR regions per photo in scenes.py.
- 22 Oct: creating a GitHub Release via `gh api` returned HTTP 403 "Creating, editing, or deleting releases is not permitted for this session type" (cloud scheduled session). Video was delivered as chat parts instead; owner must run `github_release_aktarici.py --kanal hiddenlayer` locally until release creation is allowed.
- Master encode: render output at crf 19 with film grain was 1.2 GB; re-encode with `-preset veryfast -crf 20 -maxrate 12M -bufsize 24M` → ~770 MB, 11.5 Mbps (videos/renderer/encode_master.sh). Never `pkill -f` a pattern that also matches your own shell command (it kills the shell, exit 144).
