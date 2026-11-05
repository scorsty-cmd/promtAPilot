# Hidden Layer – Instagram Reels Playbook v2 (@hiddenlayerdecoded)

Goal: grow @hiddenlayerdecoded (Instagram account connected in vidIQ, platformAccountId 29650912461163676) toward
10,000 followers with TWO original Reels per day (16:49 and 02:49 Europe/Istanbul runs). Brand: "The hidden rules
running your digital life". English on screen and in captions; every message/email to the owner (Fuat) in Turkish.
Never use follow/unfollow, like or comment automation, bought followers, engagement pods or any other growth trick that
breaks Instagram's terms. Growth comes only from good, accurate, original Reels.
v2 (18 Oct 2026): new renderer reel2.py + reel_audio.py, real open-licence photos via photos.py, "case file" style.
The old short_render.py / short_audio.py are kept only as a fallback if reel2.py fails.

## 0. What outperforming competitors do (vidIQ analysis, 18 Oct 2026)
Studied: @deegthinks (privacy policies "exposed", 4.8M views = 484x his median), @mading.thok (AI & privacy,
41K on a news-hook Reel), zackdfilms (animated explainers, 2.3M), plus Instagram/TikTok outliers in the niche.
1. Series device + countdown: a recurring frame ("Exposing a policy you accepted, 1 minute", "PROTOCOL // 01") and a
   visible timer. Ours: the HUD "HIDDEN LAYER // FILE 0NN" + live countdown (FILE_ID goes up by one every Reel).
2. Receipts on screen: real document text with a highlighter swipe, news headline cards with REF tags, a source line.
   Proof is what makes "exposé" content credible and shareable. Ours: `doc` and `headline` beats.
3. A news or real-world hook bridged to the viewer ("found at OpenAI... here's how to check YOUR rental").
4. Dark minimal palette with ONE alert accent (red/orange or teal), mono labels, cinematic tension music + UI SFX.
5. A visual change every 1-1.5 s; word-by-word captions with the current word highlighted.
6. Mystery → escalation → payoff structure; end on the payoff (or a save CTA), ideally looping back to the hook.
7. Their hooks are concrete and personal ("you accepted", "your rental", "your Snaps"), never vague.

## 1. Pick the Reel
Check today's date (Europe/Istanbul) and today's earlier "Hidden Layer Reel yayında/bekliyor" emails (2nd Reel of the
day must be a clearly different topic, hook, palette and visuals).
- Thursday / Friday 1st Reel: the Reel version of today's Hidden Layer YouTube video (Gmail "Hidden Layer video hazır",
  today); re-check every fact at the primary source. 2nd Reel: standalone.
- Standalone formats, rotate so the feed never looks templated: "1 clause you agreed to" (Fine Print, doc beat) ·
  "Myth vs fact" (compare beat) · "Setting you should change" (checklist) · "How it decides" (one documented mechanism)
  · "In the news" (a real story from the past 7 days, headline beat + what it means for you, with sources).
- Never repeat a topic (search Gmail subjects "Hidden Layer Reel yayında" / "bekliyor").
- Lean toward what vidiq_instagram_owner_insights (free) shows working: lowest skipRate, highest avgWatchedPct, saves.

## 2. Accuracy & policy (must pass all, otherwise do NOT publish – section 5)
- Every claim checked today against a primary source. Quotes are word-for-word substrings of the official text, with
  document + section + date read on screen (doc beat `source`) and in the caption. Label example numbers "example".
- `headline` beats: the outlet name as plain text only (no logo), the headline PARAPHRASED in our words (never pasted),
  and the story must be real and linked in the caption sources.
- Fair, curious tone; no fear-mongering, no claims that a company breaks the law, no medical/financial/legal advice
  (Fine Print captions end with "Not legal advice."), no politics, tragedies, violence, sexual content, piracy, hacking.
- Visuals: our own generated graphics, plus open-licence photos from photos.py only (Pexels licence, CC0, Public Domain,
  or CC BY with the credit line in the caption). LOOK at every photo before using it and reject any with a readable brand
  logo, app icon or UI screenshot, watermark, embedded text, or an identifiable person's face as the subject; photos are
  for objects, places and hands (server room, phone in hand, receipt, car dashboard, city at night). Never draw brand
  logos, mascots or app UIs. No copyrighted audio (reel_audio.py synthesizes everything).
- Hook must be true and delivered: the payoff promised in frame 0 is answered in the Reel.

## 3. Reel format and build (v2)
20–30 s (hard max 32 s), 1080x1920, one idea: hook → 2–4 receipt/fact beats → payoff → save CTA. 55–75 words.
Write short_scenes_reel.py (see short_scenes_reel_example.py; beat kinds documented at the top of reel2.py):
- Module: PALETTE (different from the previous Reel; P1–P6 in PLAYBOOK.md or a dark+one-accent pair), FILE_ID
  ('FILE 0NN', +1 per Reel), optional MOOD ('tension' | 'curious' | 'bright'), SEED.
- Beat 1 `hook`: 2–3 short lines, ≤7 words total, accent on the payoff word, usually with photo=... Frame 0 already shows it.
- Use at least 3 different beat kinds and at least one "receipt" beat (`doc`, `headline` or `stat` with source).
- Use real photos in at least 2 beats (hook + one more) when photos.py delivered usable ones; `mark=(x, y)` only when
  there is a real thing in the photo to point at.
- Last beat `cta`: lines=['Save this before you forget', 'Follow for the hidden rules'].
Build, from the kit folder (the repo must be cloned first, see section 4 step 1):
    python3 photos.py <repo_dir> <YYYYMMDD-HHMM> key1="concrete search words" key2="..."   # 2-4 keys, ~2-4 min
    # LOOK at every photos/*.jpg; drop unusable ones (don't reference their keys)
    SHORT=reel python3 tts_short.py af_heart 1.05
    python3 reel2.py preview          # LOOK at every rpreview/*.jpg incl. frame0.jpg; fix overlaps / empty frames
    nohup python3 reel2.py > reel.log 2>&1 &     # ~2-3 min for 25 s; poll reel.log until "done"
    python3 reel_audio.py
    ffmpeg -y -i reel_noaudio.mp4 -i reel_mix.wav -c:v libx264 -preset medium -crf 23 -maxrate 9M -bufsize 18M \
           -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart HL_Reel_<YYYYMMDD>_<HHMM>_<slug>.mp4
Checks: ffprobe duration 20–32 s; extract frame 0 and 4+ more frames and LOOK at them; volumedetect max < -0.5 dB;
file < 40 MB. If photos.py fails, build without photos (photo beats fall back to illustrations) and say so in the email.
If reel2.py itself fails, use the v1 fallback (short_render.py / short_audio.py) and report it.

## 4. Publish (owner gave standing approval on 16 Oct 2026; two per day since 18 Oct 2026)
1. add_repo(owner "scorsty-cmd", repo "promtAPilot", access "push") and clone it at the START of the run (photos.py
   needs it too).
2. Copy the MP4 to reels/, commit ("Add reel <date> <slug>"), git pull --rebase, push to main. Public URL:
   https://raw.githubusercontent.com/scorsty-cmd/promtapilot/main/reels/<file>.mp4 (check it returns HTTP 200).
3. vidiq_video_upload with that url → videoUrl; vidiq_instagram_publish_reel(platformAccountId 29650912461163676,
   videoUrl, caption) as a regular Reel; poll containerId every ~5–10 s until PUBLISHED (max 5 min). No auto-retry.
Caption: line 1 = the hook (≤125 chars), 1–2 short value lines, "Sources:" line, photo credit line(s) for any CC BY
photo ("Photo: <title> by <creator>, CC BY 2.0, via Wikimedia Commons"), the save CTA, "Not legal advice." when
relevant, 3–5 hashtags (#hiddenlayer + topic tags). ≤ 2,200 characters.

## 5. When NOT to publish
A fact cannot be verified today, the topic is sensitive, the render looks broken, a photo is questionable, or any
publishing step fails: do not publish. Send the MP4 + caption to the owner (SendUserFile + Gmail) and explain in Turkish.

## 6. Report
Email scorsty@gmail.com, subject "Hidden Layer Reel yayında: <topic>" (or "bekliyor"), Turkish body: permalink, topic,
format, length, hook text, which v2 elements were used (photos / doc / headline / stat ...), sources, whether it was
today's 1st or 2nd Reel, and the previous Reel's owner-insight stats (views, avgWatchedPct, skipRate, saves, shares).
Sundays (16:49 run only): weekly report (follower growth, best/worst Reel and why, 1st vs 2nd daily slot, v1 vs v2
style, what to do more/less of). Stories/feed posts are handled in the separate weekly Meta Business Suite session.
