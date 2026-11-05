# Quality guide — how the videos on these channels are made

Read this before EVERY video task, together with the task file in `gorevler/`. It describes the working
method that produced the current quality level. The owner's standing orders:
1. Every video must be **visibly better than the previous one** on the same channel — never ship the same template unchanged.
2. Videos must look **original**, not like generic AI content: the channel's own fonts, colours, editing (see `skills/`).
3. If a video does not pass the quality gate below, it is **not published**. A late video is better than a weak one.

Talk to the owner in Turkish.

---

## 1. Where the quality really comes from
The model does not "know" how to animate these channels. The quality lives in three places — use all three:

| Source | Where | Rule |
|---|---|---|
| **Render engines** (code) | see section 2 | Always start from the **newest** version, copy it, extend it, commit the new version. Never start from scratch, never from an older version. |
| **Written rules learned from earlier videos** | `reels/LEARNINGS.md`, `videos/LEARNINGS_LONG.md`, `videos/LEARNINGS_SHORTS_HISTORY.md`, `animals/LEARNINGS.md`, `history/one_year_one_body/README.md` (SCORECARD + backlog), `kitler/history_sourced_toolkit/LESSONS.md` | Read the whole file for the channel before planning. Follow every "Rules learned so far" line. At the end append what you learned. |
| **Style DNA** | `skills/<channel>-style/SKILL.md` | Fonts, palette, layout, motion and banned looks. Follow exactly. |

## 2. Newest engine per channel (start here, not from `kitler/`)
| Channel / format | Newest engine | Older reference |
|---|---|---|
| Hidden Layer Reels | `reels/renderer/` — highest `reel2_vNN.py` + newest `reel_audio_vN.py`, fonts in `reels/renderer/fonts/`, previous scenes `scenes_FILE0NN.py` | `kitler/hidden_layer_kit/reel2.py` (old) |
| Hidden Layer long video | `videos/renderer/v3/` (render2.py, tts2.py, audio2.py, thumbs2.py, example `scenes_adobe_fee.py`) | `videos/renderer/` (v2), `kitler/hidden_layer_kit/` (v1) |
| History Sourced long video | `history/one_year_one_body/` (Remotion, `src/rig.tsx`, `src/motion.ts`, newest episode folder `src/ep02/`, `episodes/`) | `kitler/history_sourced_toolkit/` (old map/portrait engine — maps, fonts, ideas only) |
| History Sourced Shorts | ffmpeg recipe in `videos/LEARNINGS_SHORTS_HISTORY.md` | — |
| Universe Of Animals | `animals/render_edit.py`, `animals/PLAYBOOK.md`, `animals/make_social.py` | `animals/render_short.py` (fallback) |
| OperisAI Reels | the visual identity block in `gorevler/01_operisai_gunluk_reels.md` (PIL frame-by-frame → ffmpeg pipe) | — |

When you improve an engine, save it as the next version (e.g. `reel2_v17.py`), commit and push it, and write
one line about it in the channel's LEARNINGS file, so the next run starts from it.

## 3. The working loop (do not skip steps)
1. **Learn** — read the channel's LEARNINGS/README completely. Look at 3–4 frames of the previous video
   (download it from its GitHub release). Write down **at least 2 concrete, visible improvements** for today
   (at least 1 in the first 3 seconds). Examples of real improvements: a new beat type/animation, a stronger
   first frame, a new camera move, better lip sync, a new set, tighter cut, better caption timing, a new SFX layer.
2. **Research** — every fact from a primary source, two sources for key numbers. No invented numbers, quotes or
   statistics. Label illustrative numbers "EXAMPLE".
3. **Script** — hook in the first second (long video: first 5 s) with the concrete stake; open loop; a re-hook
   every 40–60 s (Reels: every 1.5–2 s something changes on screen). Natural spoken English; banned phrases are
   listed in each task file ("Let's dive in", "delve", "game-changer", "Did you know", "Here's the thing"…).
4. **Preview before rendering** — render ONE still per beat/shot first and LOOK at every image as a contact
   sheet. Fix: overlapping or cut-off text, unreadable small text, empty frames, props through faces, floating
   characters, wrong fonts (fallback font = failure), logos/watermarks/faces in photos. Re-render the stills
   until they are clean. This step is where most of the quality comes from.
5. **Render** — long renders in the background in resumable chunks; poll the log.
6. **Sound** — original synthesized music/SFX only; music ducked under speech; an SFX on every important
   motion/reveal; master to about −14 LUFS, true peak ≤ −1 dB.
7. **Quality gate** — run
   `python antigravity/tools/kalite_kontrol.py <final.mp4> --profile long|short|reel|operis`
   then **open and look at** `contact_sheet.jpg` and `first_frames.jpg` it writes.
   - Exit code 1 → do not publish. Fix the listed problems and re-render.
   - Exit code 0 is necessary but not sufficient: you must also judge the images yourself (is frame 0 a strong
     hook? is today's improvement visible? does it look like the channel's style, not generic?).
   - History Sourced also needs the SCORECARD row (README): new total > previous total, ≥ 2 categories up, none down.
8. **Publish** — only through `tools/queue_publish.py` (one submission per video, tag rules in the task file).
9. **Log** — append to the channel's LEARNINGS file: what was improved, what still looked weak, the QC numbers,
   new backlog ideas. Commit + push. Put the QC_RAPOR.txt text and the improvement list in the Turkish report
   to the owner.

## 4. Things that always lower quality (never do)
- Starting from an old engine version or rewriting an engine from scratch.
- Rendering the full video without looking at preview stills first.
- Static frames: no frame may stay unchanged for more than ~4 s (long) / ~2 s (Reels).
- Default/system fonts (Arial, Inter, Roboto, Montserrat, Bebas, Impact) — use the skill's fonts.
- Glossy AI-generated images or AI faces; stock "hacker" neon looks; clip-art icons.
- Copying other creators' clips, images, music, wording.
- A uniform robotic voice: vary pauses (0.2–0.6 s), check pronunciation of numbers and names.
- Publishing when QC failed, or "fixing" QC by changing the thresholds.

## 5. If the model you are running on struggles
Long videos (8–10 min) are the hardest. If a run cannot reach the quality gate, produce the best version,
do NOT publish it, save it to `C:\Users\HP\Videos\<channel>\<date>_<topic>\` with QC_RAPOR.txt and tell the
owner in Turkish exactly what failed. Shorter formats (Reels, Shorts) first proves the setup works.
