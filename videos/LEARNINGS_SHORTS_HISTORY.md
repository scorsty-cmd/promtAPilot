# History Sourced Shorts – improvement log

Read this file at the start of every Shorts run, apply the rules, and pick at least ONE concrete improvement over the previous Short. Append a row + the improvement at the end of the run. Keep under ~150 lines (condense old rows into rules).

## Rules learned so far
- Build: blurred/darkened full-frame background + 1080-wide foreground. Foreground at y=560 leaves room for a 3-line IM Fell hook (112 px, MarginV 150) + brass label (MarginV 120); at y=500 the 3rd hook line touched the video.
- Captions: Archivo Narrow 74 px, parchment on #141B26 85 % box, names/numbers in brass, MarginV 1250 (below the video, above the bottom 350 px UI zone), max 2 lines of ~26 chars.
- Splice so the first clip ends on a cliffhanger line ("The Ninth survived. For now.") and the second opens with a link line ("And once again…") — reads as one story.
- Do NOT put dates/facts on screen or in the description that the source video does not state (e.g. "AD 60–83", "two decades later").
- Audio: alimiter 0.85 + 0.15 s fades at each cut → max ≈ -1.9 dB.
- vidiq_get_videos_by_ids costs 5 credits (not free) → this task must not use it; get stats another way or skip.
- 31 Oct: tools/queue_publish.py was blocked by the session's permission check ("Create Public Surface") → Short delivered only as a file; owner must schedule it manually or re-allow the queue push.
- Flash-forward cold open: frame 0–0.7 s = a zoomed still of the most intense moment (later in the cut), then hard-cut to the story start; the hook text sits over it. Narration runs from 0.15 s regardless.
- Captions: split by clause (commas/full stops), ≤36 chars per caption, 2 balanced lines when >24 chars, never end a line on "the/a/of/in/his…". Reads much better than fixed 26-char chunks.
- Punch-in: ffmpeg `scale=w='trunc(1920*Z/2)*2':h=...:eval=frame` + fixed crop, Z ramps 1.0→1.16 over the tension lines, snaps back on the cut.
- alimiter in ffmpeg 6 auto-levels to 0 dB by default → use `volume=-1.5dB,alimiter=limit=0.80:level=disabled` (max ≈ -2.7 dB).
- Bright scenes wash out the top hook → darken bg more (eq brightness -0.30) + black@0.35 box over y 0–560. End card goes in the caption zone (y≈1330–1440), not over the footage.
- Animated sources (One Year, One Body) have their own small burned-in dialogue subtitles inside the frame; our captions below are still needed and do not clash.
- Encoding 54 s 1080x1920 on 2 CPUs takes ~3.5 min → run the build detached (setsid nohup) and poll.

## Shorts
| Date | Tag | Source | Segment | Hook type | Title | YouTube | Result |
|---|---|---|---|---|---|---|---|
| 2026-10-24 | history-shorts-2026-10-24-roanoke-croatoan | history-2026-10-22-roanoke | 0:10–0:46 + 5:28–5:42 | mystery number | 115 Colonists Vanished. They Left Only One Word. | l_s_wox1DmA | uploaded |
| 2026-10-29 | history-shorts-2026-10-29-lost-ninth-legion | history-2026-10-29-lost-ninth-legion | 0:16–0:57 + 4:12–4:15 | mystery number | 5,000 Roman Soldiers Vanished From the Record | vuCGHmRS7Hs | uploaded |
| 2026-10-31 | history-shorts-2026-10-31-ninth-legion-twice | history-2026-10-29-lost-ninth-legion | 1:28–2:03 + 2:23–2:42 | "almost wiped out. Twice." (escalation) | Rome's Ninth Legion Was Almost Wiped Out. Twice. | – | queue blocked, file only |
| 2026-11-03 | history-shorts-2026-11-03-barber-pliers-1665 | history-2026-11-02-toothache-1665-london | 5:21–5:50 + 6:08–6:32 (frame 0 = still from 6:18) | visceral POV / flash-forward ("No anaesthetic. Just a barber's pliers.") | No Anaesthetic. Just a Barber's Pliers. (London, 1665) #Shorts | AT-3RoTX9DM | uploaded, Wed 04.11 18:00 |

## Improvement log
- 2026-10-31: first Short with a narrative escalation arc instead of the cold-open "vanished" hook; keyword highlighting in captions; fixed hook/video overlap. Next: test a first-frame action shot (not a static map) and measure retention once stats are available.
- 2026-11-03: improvements vs 31 Oct: (1) first frame is now an action shot (flash-forward still of the pliers in Tom's mouth) instead of a static scene; (2) slow punch-in on "He braces his knee… Rocks the tooth once. Twice."; (3) clause-based 2-line captions instead of mid-phrase cuts; (4) hook has a 180 ms scale-pop; (5) end card moved below the video, readable; (6) peak fixed to -2.7 dB. New hook type (visceral POV), new series (One Year, One Body). Next: try a 2-frame flash/white hit on the reveal ("And it's out."), and test a question-style hook.
