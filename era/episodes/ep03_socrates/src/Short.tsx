import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';

const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}
@font-face{font-family:Serif;src:url(${staticFile('fonts/InstrumentSerif-Italic.ttf')}) format('truetype');}`;
const TERRA = '#e07a3c', BONE = '#f4ead8', GLAZE = '#17110d';
const NAMES: Record<string, [string, string]> = { YOU: ['YOU', '#ffb347'], SOC: ['SOCRATES', '#f4ead8'], DAD: ['FATHER', '#9fc0d8'], CHAER: ['CHAEREPHON', '#b8d878'], LACH: ['GENERAL LACHES', '#ff8a7a'], XAN: ['XANTHIPPE', '#ff9a9a'], PLATO: ['YOUNG PLATO', '#8fd0e0'], MEL: ['MELETUS · ACCUSER', '#a8d8a0'], CRITO: ['CRITO', '#c8d0e8'], HER: ['HERALD', '#e0c070'] };

export type ShortProps = { id: string; clip: number; from: number; dur: number; vend: number; kicker: string; hook: [string, string]; hi: number };
export const SHORTS: ShortProps[] = [
  { id: 'A', clip: 354.6, from: 355.0, dur: 50.1, vend: 402.5, kicker: 'ATHENS · 399 BC', hook: ['PUT ON TRIAL', 'FOR ASKING QUESTIONS'], hi: 1 },
  { id: 'B', clip: 404.5, from: 404.5, dur: 43.2, vend: 444.9, kicker: 'ATHENS · 399 BC', hook: ['HIS LAST WORDS', 'WERE ABOUT A ROOSTER'], hi: 1 },
  { id: 'C', clip: 156.6, from: 156.6, dur: 55.2, vend: 209.3, kicker: 'ATHENS · c. 420 BC', hook: ['ONE QUESTION', 'BROKE A GENERAL'], hi: 0 },
];

// Greek key strip
const Meander: React.FC<{ y: number; c?: string; off?: number }> = ({ y, c = TERRA, off = 0 }) => <svg width={1080} height={30} style={{ position: 'absolute', left: 0, top: y }}>
  <defs><pattern id={`mk${y}`} width={30} height={30} patternUnits="userSpaceOnUse" x={off}>
    <path d="M2 28V2h26v20H10V10h10v6" fill="none" stroke={c} strokeWidth={3.2} /></pattern></defs>
  <rect width={1080} height={30} fill={`url(#mk${y})`} />
</svg>;

type Cue = { s: number; e: number; spk: string; words: string[] };
const cuesFor = (p: ShortProps): Cue[] => {
  const out: Cue[] = [];
  (LINES as any[]).filter((l) => l.start >= p.from - .1 && l.end <= p.vend + .3).forEach((l) => {
    const w = l.text.split(' '); const ch: string[][] = []; let cur: string[] = [];
    w.forEach((x: string) => { cur.push(x); if (cur.length >= 5 || (cur.length >= 3 && /[.,?!]$/.test(x))) { ch.push(cur); cur = []; } }); if (cur.length) ch.push(cur);
    const tot = ch.reduce((a, c) => a + c.join(' ').length, 0); let t = l.start - p.from;
    ch.forEach((c) => { const d = (l.end - l.start) * c.join(' ').length / tot; out.push({ s: t, e: t + d, spk: l.speaker, words: c }); t += d; });
  });
  return out;
};

const Caption: React.FC<{ T: number; cues: Cue[] }> = ({ T, cues }) => {
  const c = cues.find((x) => T >= x.s && T < x.e + .12); if (!c) return null;
  const nm = NAMES[c.spk]; const col = nm ? nm[1] : '#d9c7a8';
  const pop = spring(prog(T, c.s, c.s + .25) * 1.2, 12, .55);
  const len = c.words.join(' ').length; let acc = 0;
  return <div style={{ position: 'absolute', left: 60, right: 60, top: 1418, textAlign: 'center' }}>
    <div style={{ display: 'inline-block', fontFamily: 'Mono', fontSize: 30, letterSpacing: 5, color: GLAZE, background: col, padding: '4px 16px', marginBottom: 14, borderRadius: 4 }}>{nm ? nm[0] : 'NARRATOR'}</div>
    <div style={{ fontFamily: nm ? 'Brico' : 'Brico', fontWeight: 800, fontStretch: '85%', fontSize: 70, lineHeight: 1.08, color: BONE, transform: `scale(${.9 + .1 * pop})`, opacity: clamp(pop * 2), fontStyle: nm ? 'normal' : 'italic', textShadow: '0 4px 18px rgba(0,0,0,.7)' }}>
      {c.words.map((w, i) => { const ws = c.s + (c.e - c.s) * acc / len; acc += w.length + 1; const on = T >= ws; return <span key={i} style={{ color: on ? BONE : 'rgba(244,234,216,.38)' }}>{w} </span>; })}
    </div>
  </div>;
};

export const Short: React.FC<{ n: number }> = ({ n }) => {
  const p = SHORTS[n]; const f = useCurrentFrame(); const T = f / FPS;
  const cues = React.useMemo(() => cuesFor(p), [n]);
  const endAt = p.vend - p.from + .3;
  const hk = spring(prog(T, 0, .5) * 1.2, 10, .5);
  const GT = p.from + T;
  const fit = (SHOTS as any[]).filter((x) => x.g).reduce((m, x) => Math.max(m, clamp(Math.min((GT - x.a) * 1e3, (x.b - GT) * 1e3))), 0);
  const ease = fit * fit * (3 - 2 * fit);
  const vz = interpolate(T, [0, p.dur], [.9, .965]) * (1 - ease) + .66 * ease;
  const vw = 1920 * vz, vh = 1080 * vz;
  const end = prog(T, endAt, endAt + .5);
  const vol = (t: number) => { const s = t / FPS; return Math.min(1, s / .25) * (1 - prog(s, p.dur - 1.3, p.dur - .05)); };
  const shake = T < .5 ? Math.sin(T * 60) * 6 * (1 - T * 2) : 0;
  return <AbsoluteFill style={{ background: GLAZE }}>
    <style>{fontFace}</style>
    {/* glaze texture */}
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 50% at 50% ${30 + 10 * Math.sin(T * .3)}%, #3a2418 0%, ${GLAZE} 70%)` }} />
    <Meander y={70} off={-T * 18} />
    {/* hook */}
    <div style={{ position: 'absolute', top: 128, left: 0, right: 0, textAlign: 'center', transform: `translateX(${shake}px)` }}>
      <div style={{ fontFamily: 'Mono', fontSize: 30, letterSpacing: 8, color: TERRA, opacity: clamp(hk * 2) }}>{p.kicker}</div>
      {p.hook.map((h, i) => <div key={i} style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: i === p.hi ? 92 : 84, lineHeight: 1.0, marginTop: i ? 2 : 8,
        color: i === p.hi ? GLAZE : BONE, background: i === p.hi ? TERRA : 'none', display: 'inline-block', padding: i === p.hi ? '2px 22px 8px' : 0,
        transform: `scale(${.6 + .4 * spring(prog(T, .08 * i, .08 * i + .5) * 1.2, 10, .5)}) rotate(${i === p.hi ? -1.5 : 0}deg)` }}>{h}</div>).reduce((a: any[], x, i) => i ? [...a, <br key={'b' + i} />, x] : [x], [])}
    </div>
    {/* video window */}
    <div style={{ position: 'absolute', left: 0, top: 404, width: 1080, height: 990, overflow: 'hidden', borderTop: `6px solid ${TERRA}`, borderBottom: `6px solid ${TERRA}` }}>
      <OffthreadVideo src={staticFile(`shorts/clean_${p.id}.mp4`)} startFrom={Math.round((p.from - p.clip) * FPS)} muted style={{ position: 'absolute', width: vw, height: vh, left: (1080 - vw) / 2, top: (990 - vh) / 2 }} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 8, width: `${clamp(T / endAt) * 100}%`, background: BONE, opacity: .85 }} />
    </div>
    <Caption T={T} cues={cues} />
    <Meander y={1840} off={T * 18} c="#5a3a26" />
    {/* end card */}
    {end > 0 && <AbsoluteFill style={{ background: `rgba(23,17,13,${.93 * end})`, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ opacity: end, transform: `translateY(${(1 - end) * 40}px)` }}>
        <div style={{ fontFamily: 'Mono', fontSize: 34, letterSpacing: 8, color: TERRA }}>THE FULL STORY</div>
        <div style={{ fontFamily: 'Serif', fontSize: 74, color: BONE, marginTop: 20 }}>If you were</div>
        <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 132, lineHeight: .92, color: BONE }}>SOCRATES'<br />STUDENT</div>
        <div style={{ display: 'inline-block', marginTop: 40, fontFamily: 'Brico', fontWeight: 800, fontSize: 46, color: GLAZE, background: TERRA, padding: '12px 34px' }}>8-MIN VIDEO ON THE CHANNEL ▸</div>
      </div>
    </AbsoluteFill>}
    <Audio src={staticFile('mix.wav')} startFrom={Math.round(p.from * FPS)} volume={vol} />
  </AbsoluteFill>;
};
