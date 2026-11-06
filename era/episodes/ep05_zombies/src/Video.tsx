import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';

export const fontFace = `
/* System font fallbacks */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@500&display=swap');
`;

const CREAM = '#f6efdc', INK = '#11161d', AMBER = '#ecc94b', BLOOD = '#e53e3e', SLATE = '#1a202c';

const CHAPTERS: Record<string, string> = {
  open: 'DAY ZERO: THE FIRST 60 MINUTES',
  rzero: 'THE OUTBREAK MATH (R₀ > 20)',
  parasite: "NATURE'S REAL ZOMBIES",
  water: 'THE 72-HOUR BLACKOUT',
  food: 'THE FOOD & CALORIE EQUATION',
  geography: 'GEOGRAPHY OF SURVIVAL',
  winter: 'THE FREEZING DEAD',
  noise: 'THE PHYSICS OF SILENCE',
  dieoff: 'THE 60-DAY METABOLIC CRASH',
  rebuild: 'DAY 100: REBUILDING THE WORLD',
};

const L = LINES as any[];
const CH_START = Object.keys(CHAPTERS).map((c, i) => {
  const line = L.find((l) => l.chapter === c);
  return { c, n: i + 1, s: line ? line.start : i * 45 };
});

const NAMES: Record<string, [string, string]> = {
  YOU: ['YOU', '#ecc94b'],
  SARAH: ['DR. SARAH CHEN', '#4fd1c5'],
  MARCUS: ['MARCUS', '#f6ad55'],
  KAHN: ['DR. KAHN', '#b794f4'],
};

const tl = require('./timeline.json');
const END_AT = tl.voice_end + 0.4;

/* Atmospheric Vignette & Biohazard Pulse */
const Gate: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background:
        'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 50%, rgba(10,14,20,0.65) 100%)',
      opacity: 0.94 + ((f * 31) % 7) / 200,
    }}
  />
);

/* Opening Title Card */
const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T > 8.0) return null;
  const a = spring(prog(T, 0.2, 0.9) * 1.2, 10, 0.5);
  const b = spring(prog(T, 1.2, 1.9) * 1.2, 9, 0.45);
  const o = 1 - prog(T, 7.2, 8.0);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: o,
        background: `rgba(13,17,23,${0.65 * clamp(a * 2)})`,
      }}
    >
      <div style={{ fontFamily: 'Type', fontSize: 36, letterSpacing: 8, color: BLOOD, opacity: clamp(a * 2) }}>
        WHAT IF THE WHOLE WORLD
      </div>
      <div
        style={{
          fontFamily: 'Brico',
          fontWeight: 800,
          fontSize: 140,
          lineHeight: 0.95,
          color: CREAM,
          transform: `scale(${0.85 + 0.15 * a})`,
          textShadow: '0 8px 40px rgba(0,0,0,0.8)',
          textAlign: 'center',
          letterSpacing: 2,
        }}
      >
        TURNED INTO<br />ZOMBIES?
      </div>
      <div
        style={{
          marginTop: 28,
          fontFamily: 'Mono',
          fontSize: 32,
          color: AMBER,
          border: `4px solid ${BLOOD}`,
          padding: '8px 30px',
          background: 'rgba(26,32,44,0.92)',
          transform: `rotate(${-2 + (1 - b) * 8}deg) scale(${1.4 - 0.4 * b})`,
          opacity: clamp(b * 3),
        }}
      >
        HOW SCIENCE DETERMINES YOUR SURVIVAL
      </div>
    </AbsoluteFill>
  );
};

/* Chapter Transition Banner Card */
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.8 && T < x.s + 0.8);
  if (!c) return null;
  const a = spring(prog(T, c.s - 1.8, c.s - 1.2) * 1.2, 11, 0.5);
  const o = 1 - prog(T, c.s + 0.3, c.s + 0.8);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o }}>
      <div
        style={{
          background: SLATE,
          border: `6px solid ${BLOOD}`,
          borderRadius: 8,
          padding: '35px 80px 45px',
          transform: `translateY(${(1 - a) * 50}px)`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Mono', fontSize: 28, letterSpacing: 6, color: AMBER }}>
          CHAPTER {c.n}
        </div>
        <div style={{ fontFamily: 'Brico', fontWeight: 800, fontSize: 88, color: CREAM, marginTop: 8 }}>
          {CHAPTERS[c.c]}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Real-Time Era / Status Chip */
const k = (key: string) => {
  const line = L.find((l) => l.key === key);
  return line ? line.start : 0;
};

const ERAS: [number, string, string][] = [
  [0, 'CITY CENTER', 'DAY 0 · 03:00'],
  [k('r1') - 1, 'METROPOLIS', 'DAY 1 · EPIDEMIC'],
  [k('b1') - 1, 'RESEARCH OUTPOST', 'DAY 2 · BIOLOGY'],
  [k('w1') - 1, 'SAFEHOUSE', 'DAY 3 · GRID FAILURE'],
  [k('f1') - 1, 'SAFEHOUSE', 'DAY 7 · RATIONS'],
  [k('g1') - 1, 'ROCKY MOUNTAINS', 'DAY 15 · ELEVATION'],
  [k('z1') - 1, 'NORTHERN RIDGE', 'DAY 35 · WINTER'],
  [k('n1') - 1, 'VALLEY PASS', 'DAY 40 · SILENCE'],
  [k('d1') - 1, 'SAFE HAVEN', 'DAY 60 · DIE-OFF'],
  [k('c1') - 1, 'NEW SOCIETY', 'DAY 100 · REBUILD'],
];

const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 8) return null;
  let e = ERAS[0];
  let s0 = 0;
  ERAS.forEach((x) => {
    if (T >= x[0]) {
      e = x;
      s0 = x[0];
    }
  });
  const st = spring(prog(T, s0, s0 + 0.5) * 1.2, 12, 0.5);

  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        right: 50,
        fontFamily: 'Mono',
        textAlign: 'center',
        color: BLOOD,
        border: `3px solid ${BLOOD}`,
        borderRadius: 4,
        padding: '6px 18px 4px',
        background: 'rgba(22,27,34,0.88)',
        transform: `scale(${T - s0 < 1 ? 1.2 - 0.2 * st : 1})`,
        opacity: T > END_AT ? 1 - prog(T, END_AT, END_AT + 0.5) : 1,
      }}
    >
      <div style={{ fontSize: 18, letterSpacing: 3 }}>{e[1]}</div>
      <div style={{ fontSize: 32, fontWeight: 'bold', color: AMBER, lineHeight: 1 }}>{e[2]}</div>
    </div>
  );
};

/* Burned-in Subtitles */
const CUES = (() => {
  const out: { s: number; e: number; spk: string; text: string }[] = [];
  L.forEach((l) => {
    const w = l.text.split(' ');
    const ch: string[][] = [];
    let cur: string[] = [];
    w.forEach((x: string) => {
      cur.push(x);
      if (cur.length >= 8 || (cur.length >= 4 && /[.,?!]$/.test(x))) {
        ch.push(cur);
        cur = [];
      }
    });
    if (cur.length) ch.push(cur);
    const tot = ch.reduce((a, c) => a + c.join(' ').length, 0);
    let t = l.start;
    ch.forEach((c) => {
      const d = ((l.end - l.start) * c.join(' ').length) / tot;
      out.push({ s: t, e: t + d, spk: l.speaker, text: c.join(' ') });
      t += d;
    });
  });
  return out;
})();

const Subtitles: React.FC<{ T: number }> = ({ T }) => {
  const c = CUES.find((x) => T >= x.s && T < x.e);
  if (!c) return null;
  const isNarr = c.spk === 'NARR';
  const nameInfo = NAMES[c.spk];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(13,17,23,0.85)',
          border: '2px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          padding: '12px 28px',
          maxWidth: 1350,
          textAlign: 'center',
        }}
      >
        {!isNarr && nameInfo && (
          <span
            style={{
              fontFamily: 'Mono',
              fontSize: 28,
              fontWeight: 'bold',
              color: nameInfo[1],
              marginRight: 16,
              textTransform: 'uppercase',
            }}
          >
            {nameInfo[0]}:
          </span>
        )}
        <span
          style={{
            fontFamily: 'Brico',
            fontSize: 38,
            fontWeight: 600,
            color: isNarr ? '#e2e8f0' : '#ffffff',
            lineHeight: 1.25,
          }}
        >
          {c.text}
        </span>
      </div>
    </div>
  );
};

/* End Screen Call To Action */
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT - 6) return null;
  const a = spring(prog(T, END_AT - 6, END_AT - 4.5) * 1.2, 10, 0.5);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: `rgba(10,14,20,${0.75 * a})`,
        opacity: a,
      }}
    >
      <div
        style={{
          background: '#161b22',
          border: `5px solid ${AMBER}`,
          borderRadius: 12,
          padding: '40px 80px',
          textAlign: 'center',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ fontFamily: 'Mono', fontSize: 32, color: BLOOD, letterSpacing: 4 }}>
          WHAT WOULD YOU DO?
        </div>
        <div style={{ fontFamily: 'Brico', fontWeight: 800, fontSize: 64, color: CREAM, marginTop: 12 }}>
          RUN TO THE MOUNTAINS OR BARRICADE?
        </div>
        <div style={{ fontFamily: 'Mono', fontSize: 26, color: AMBER, marginTop: 20 }}>
          COMMENT YOUR SURVIVAL STRATEGY BELOW ↓
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ clean?: boolean }> = ({ clean = false }) => {
  const f = useCurrentFrame();
  const T = f / FPS;
  const cur = SHOTS.find((s) => T >= s.a && T < s.b) || SHOTS[0];

  return (
    <AbsoluteFill style={{ background: '#090d14' }}>
      <style>{fontFace}</style>
      {cur.render(T)}
      <Gate f={f} />
      {!clean && (
        <>
          <Title T={T} />
          <ChapterCard T={T} />
          <EraChip T={T} />
          <Subtitles T={T} />
          <EndCard T={T} />
        </>
      )}
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
