---
name: "hidden-layer-style"
description: "Visual identity for every Hidden Layer video, Short, Reel and thumbnail: fonts, colors, layouts, motion and editing rules so it never looks like generic AI content."
---

# Hidden Layer — Style DNA

Concept: **"the document they hoped you wouldn't read."** Every frame looks like a terms-of-service page, an internal memo or a system log being exposed. Ink on paper, a highlighter, redaction bars. Nothing glossy, no neon-tech clichés, no stock "hacker" footage.

Use this skill for any Hidden Layer long video, Short, Instagram Reel (@hiddenlayerdecoded) or thumbnail. Content stays in English; talk to the user in Turkish.

## Fonts (free, OFL — safe for monetized use)
Download once into the project `fonts/` folder from `https://raw.githubusercontent.com/google/fonts/main/`:
- `ofl/instrumentserif/InstrumentSerif-Regular.ttf` — headlines
- `ofl/instrumentserif/InstrumentSerif-Italic.ttf` — the ONE emphasized phrase per headline
- `ofl/ibmplexmono/IBMPlexMono-Medium.ttf` — labels, clause numbers, annotations, captions, data

Never use Montserrat, Bebas Neue, Anton, Poppins, Inter, Roboto or Impact — they are what every AI channel uses.

## Palette
| Role | Hex |
|---|---|
| Paper (default bg) | #ECE8DE |
| Ink (text, redaction) | #121316 |
| Highlighter (the only accent) | #E4FF3C |
| Muted ink (labels, ghost text) | #8A877E |
| Ghost body text | #BDB8AC |

"The Algorithm" series inverts it: bg #121316, text #ECE8DE, same highlighter. "The Fine Print" stays on paper. Highlighter covers max ~10% of any frame.

## Layout grid (1920×1080)
- Left margin rule at x=150 (1–2px, #D7D2C6); clause number ("§ 4.2") sits in the margin, mono.
- Top line, mono, muted: `SERIES / EP. NN / TOPIC`.
- Headline Instrument Serif 110–140px, max 2 lines, left-aligned at x=190. Exactly one phrase in italic with a highlighter block behind it.
- Supporting faint document text (real clause wording paraphrased, mono 21px, #BDB8AC) fills the lower half as texture.
- Margin annotation bottom-right in mono with a 8px highlighter bar to its left ("→ clause found in 4 of 5 apps").
- Shorts/Reels (1080×1920): same system, headline 96–120px, document texture top, captions in the lower-middle third.

## Signature moves (use at least 2 per video)
1. **Redaction reveal** — black bars sit over the key sentence, then slide out left-to-right (8–12 frames, ease-out) to reveal it.
2. **Highlighter swipe** — the highlight block grows from 0 to full width under the key phrase in 10 frames, as the narrator says it.
3. **Clause zoom** — slow 3–5% push-in toward the clause being discussed; nothing else moves.
4. **Margin note** — a mono annotation types on character by character (2 frames/char) with a soft key-tap sound.
5. **Stamp** — "VERIFIED" / "CLAUSE 7.3" stamp in mono, 4° rotation, drops in with a 1-frame overshoot.

## Motion & editing rules
- Cut on meaning, not on a timer. Alternate: 2–3 fast beats (1–2 s) then one breathing shot (4–6 s).
- Max one transition style per video; default is a hard cut. No whoosh on every cut.
- No constant Ken Burns on everything; motion only where it points at something.
- Add 6% film grain (PIL `Image.effect_noise` blended at 0.06) to every frame so it feels printed, not rendered.
- Captions: IBM Plex Mono Medium, ink on a paper-colored pill, 2–4 words at a time, current keyword gets the highlighter. Never white text with black stroke.

## Thumbnails
Paper background, 3–5 words max in Instrument Serif, one word highlighted, one redaction bar partly covering a second line (creates curiosity). One small real object/screenshot (blurred where needed). No shocked faces, no red arrows.

## Anti-template rule (protects monetization)
YouTube's July 2026 policy demonetizes generic, template-based, repetitive content. So the *identity* stays fixed but each episode must vary:
- Rotate the opening: cold-open on a clause / on a real scenario / on a number. Never the same hook structure twice in a row.
- Pick a different signature move to lead each episode.
- Every video needs a real argument with a narrative arc and at least one specific, checkable fact — no filler visuals unrelated to the narration.
- Keep a short log (episode → hook type → lead move) in the project and check it before producing.

## Before delivering
Render 3 sample frames, view them, check: fonts actually loaded (not a PIL fallback), highlighter used once per frame, text inside safe margins, captions readable on phone width.