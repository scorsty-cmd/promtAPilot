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
- Check the first frame of each segment for a shot change: a trim 0.1–0.2 s too early shows the previous shot (with its in-frame dialogue box) as frame 0. Find the cut with frame tiles and start on it (Mary Celeste: 97.30 → 97.47).
- libass: caption events must not overlap in time (old "end + 0.12 s" tail) or libass stacks the next caption lower → clamp each end to the next start − 0.01 s.
- Punch-in on a close-up face: anchor the crop low (y=(ih-1080)*0.85), a centred crop cuts the mouth/eyes. Bright red (#D9544A) on the dark caption box; #C0453A was too dim.
- Freeze-frame reveal: trim 1 frame + tpad=stop_mode=clone, slow push 1.06→1.13, 2-frame white flash (85 % then 35 %), low sine "thump" from aevalsrc (52 Hz, exp decay) mixed at the freeze; end card sits under it.

## Shorts
| Date | Tag | Source | Segment | Hook type | Title | YouTube | Result |
|---|---|---|---|---|---|---|---|
| 2026-10-24 | history-shorts-2026-10-24-roanoke-croatoan | history-2026-10-22-roanoke | 0:10–0:46 + 5:28–5:42 | mystery number | 115 Colonists Vanished. They Left Only One Word. | l_s_wox1DmA | uploaded |
| 2026-10-29 | history-shorts-2026-10-29-lost-ninth-legion | history-2026-10-29-lost-ninth-legion | 0:16–0:57 + 4:12–4:15 | mystery number | 5,000 Roman Soldiers Vanished From the Record | vuCGHmRS7Hs | uploaded |
| 2026-10-31 | history-shorts-2026-10-31-ninth-legion-twice | history-2026-10-29-lost-ninth-legion | 1:28–2:03 + 2:23–2:42 | "almost wiped out. Twice." (escalation) | Rome's Ninth Legion Was Almost Wiped Out. Twice. | – | queue blocked, file only |
| 2026-11-03 | history-shorts-2026-11-03-barber-pliers-1665 | history-2026-11-02-toothache-1665-london | 5:21–5:50 + 6:08–6:32 (frame 0 = still from 6:18) | visceral POV / flash-forward ("No anaesthetic. Just a barber's pliers.") | No Anaesthetic. Just a Barber's Pliers. (London, 1665) #Shorts | AT-3RoTX9DM | uploaded, Wed 04.11 18:00 |
| 2026-11-05 | history-shorts-2026-11-05-mary-celeste-empty-deck | history-2026-11-05-mary-celeste | 1:37–2:04 + 2:15–2:31 (+2.6 s freeze of 2:30.8) | question ("Ten people vanished. Why leave the ship?") + clue counter | Ten People Abandoned a Ship That Wasn't Sinking #Shorts | Q3CoizYiyN4 | uploaded, Fri 06.11 18:00 (long video goes public Sat 07.11 17:00) |

## Improvement log
- 2026-10-31: first Short with a narrative escalation arc instead of the cold-open "vanished" hook; keyword highlighting in captions; fixed hook/video overlap. Next: test a first-frame action shot (not a static map) and measure retention once stats are available.
- 2026-11-03: improvements vs 31 Oct: (1) first frame is now an action shot (flash-forward still of the pliers in Tom's mouth) instead of a static scene; (2) slow punch-in on "He braces his knee… Rocks the tooth once. Twice."; (3) clause-based 2-line captions instead of mid-phrase cuts; (4) hook has a 180 ms scale-pop; (5) end card moved below the video, readable; (6) peak fixed to -2.7 dB. New hook type (visceral POV), new series (One Year, One Body). Next: try a 2-frame flash/white hit on the reveal ("And it's out."), and test a question-style hook.
- 2026-11-05: improvements vs 3 Nov: (1) question-style hook (first time), echoed by the narration's own "So why leave?" (red caption + punch-in); (2) on-screen evidence counter "CLUE 1–5 of 5" in the top zone (channel's evidence-table idea, gives a reason to stay to clue 5); (3) reveal ends on a freeze-frame with white flash + low thump, end card "Where did ten people go?" over it; (4) both splice points start exactly on the shot cut (no stray frame); (5) brighter red for readability. Next: try a cold open on a primary-source quote, and check retention of clue-counter vs. no counter once stats exist.
