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

## Shorts
| Date | Tag | Source | Segment | Hook type | Title | YouTube | Result |
|---|---|---|---|---|---|---|---|
| 2026-10-24 | history-shorts-2026-10-24-roanoke-croatoan | history-2026-10-22-roanoke | 0:10–0:46 + 5:28–5:42 | mystery number | 115 Colonists Vanished. They Left Only One Word. | l_s_wox1DmA | uploaded |
| 2026-10-29 | history-shorts-2026-10-29-lost-ninth-legion | history-2026-10-29-lost-ninth-legion | 0:16–0:57 + 4:12–4:15 | mystery number | 5,000 Roman Soldiers Vanished From the Record | vuCGHmRS7Hs | uploaded |
| 2026-10-31 | history-shorts-2026-10-31-ninth-legion-twice | history-2026-10-29-lost-ninth-legion | 1:28–2:03 + 2:23–2:42 | "almost wiped out. Twice." (escalation) | Rome's Ninth Legion Was Almost Wiped Out. Twice. | – | queue blocked, file only |

## Improvement log
- 2026-10-31: first Short with a narrative escalation arc instead of the cold-open "vanished" hook; keyword highlighting in captions; fixed hook/video overlap. Next: test a first-frame action shot (not a static map) and measure retention once stats are available.
