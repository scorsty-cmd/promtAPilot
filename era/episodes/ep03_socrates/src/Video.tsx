import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';

const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}`;
const TERRA = '#e07a3c', BONE = '#f4ead8', INK = '#120d0a';
const CHAPTERS: Record<string, string> = {
  born: 'BORN IN ATHENS', agora: 'THE AGORA', barefoot: 'THE BAREFOOT MAN', questions: 'QUESTIONS THAT HURT', symposium: 'THE SYMPOSIUM',
  oracle: 'THE ORACLE', war: 'WAR & TYRANTS', trial: 'THE TRIAL', hemlock: 'THE HEMLOCK', legacy: 'WHAT YOU CARRY ON',
};
const L = LINES as any[];
const CH_START = Object.keys(CHAPTERS).map((c, i) => ({ c, n: i + 1, s: L.find((l) => l.chapter === c).start }));
const NAMES: Record<string, [string, string]> = { YOU: ['YOU', '#ffb347'], SOC: ['SOCRATES', '#f4ead8'], DAD: ['FATHER', '#9fc0d8'], MOM: ['MOTHER', '#8fd0e0'], CHAER: ['CHAEREPHON', '#b8d878'], LACH: ['LACHES', '#ff8a7a'], ALC: ['ALCIBIADES', '#d8a8f0'], XAN: ['XANTHIPPE', '#ff9a9a'], PLATO: ['PLATO', '#8fd0e0'], MEL: ['MELETUS', '#a8d8a0'], CRITO: ['CRITO', '#c8d0e8'], JAIL: ['JAILER', '#d8b890'], HER: ['HERALD', '#e0c070'] };
export const TOTAL_S = (require('./timeline.json').voice_end) + 8;
const END_AT = (require('./timeline.json').voice_end) + .4;

const Paper = () => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .14 }}>
  <svg width="100%" height="100%"><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves={4} seed={11} /><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .32  0 0 0 1.2 -.2" /></filter><rect width="100%" height="100%" filter="url(#pp)" /></svg>
</AbsoluteFill>;
const Grain: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .14 }}>
  <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
</AbsoluteFill>;
const Vignette = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)' }} />;

const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T > 6.0) return null;
  const a = .85 + .15 * spring(prog(T, .2, .8) * 1.2, 10, .5), b = spring(prog(T, 1.2, 1.8) * 1.2, 10, .5), o = 1 - prog(T, 5.5, 6.0);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(10,6,4,.5), rgba(0,0,0,0))' }}>
    <div style={{ fontFamily: 'Mono', fontSize: 34, letterSpacing: 10, color: TERRA, marginBottom: 6 }}>IF YOU WERE</div>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 168, lineHeight: .9, color: BONE, transform: `scale(${a})`, textShadow: '0 8px 40px rgba(0,0,0,.6)', textAlign: 'center' }}>SOCRATES'<br />STUDENT</div>
    <div style={{ marginTop: 26, fontFamily: 'Brico', fontWeight: 700, fontStretch: '85%', fontSize: 46, color: INK, background: TERRA, padding: '8px 26px', transform: `translateY(${(1 - b) * 30}px) rotate(-1.2deg)`, opacity: clamp(b * 3) }}>ATHENS · 435–399 BC</div>
  </AbsoluteFill>;
};
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.9 && T < x.s + .6); if (!c) return null;
  const a = spring(prog(T, c.s - 1.9, c.s - 1.4) * 1.2, 11, .5), o = 1 - prog(T, c.s + .2, c.s + .6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(23,17,13,${.78 * clamp(a * 2)})` }}>
    <div style={{ fontFamily: 'Mono', fontSize: 32, letterSpacing: 10, color: TERRA, opacity: clamp(a * 2) }}>CHAPTER {c.n}</div>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '80%', fontSize: 120, color: BONE, transform: `scale(${.85 + .15 * a})`, opacity: clamp(a * 2), textAlign: 'center' }}>{CHAPTERS[c.c]}</div>
    <svg width={520} height={40} style={{ marginTop: 14, opacity: clamp(a * 2) }}><path d={Array.from({ length: 20 }).map((_, i) => { const x = i * 26; return `M ${x} 32 L ${x} 8 L ${x + 20} 8 L ${x + 20} 24 L ${x + 8} 24 L ${x + 8} 16`; }).join(' ')} stroke={TERRA} strokeWidth={4} fill="none" strokeDasharray={`${a * 900} 900`} /></svg>
  </AbsoluteFill>;
};
const ERAS: [number, string, string][] = [[0, 'ATHENS', '399 BC'], [L.find((l) => l.key === 'b1').start - 2, 'ATHENS', '435 BC'], [L.find((l) => l.key === 'a1').start - 2, 'ATHENS', '430 BC'], [L.find((l) => l.key === 'a3').start, 'ATHENS', 'c. 418 BC'],
  [L.find((l) => l.key === 'y1').start - 2, 'ATHENS', '416 BC'], [L.find((l) => l.key === 'r1').start - 2, 'ATHENS', 'c. 410 BC'], [L.find((l) => l.key === 'w1').start - 2, 'ATHENS', '404 BC'], [L.find((l) => l.key === 't1').start - 2, 'ATHENS', '399 BC'],
  [L.find((l) => l.key === 'c1').start - 2, 'AFTER', '399 BC'], [L.find((l) => l.key === 'c2').start, 'TODAY', '2026'], [L.find((l) => l.key === 'c3').start, 'ATHENS', 'c. 387 BC']];
const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 6) return null;
  let e = ERAS[0]; ERAS.forEach((x) => { if (T >= x[0]) e = x; });
  return <div style={{ position: 'absolute', top: 44, right: 56, fontFamily: 'Mono', textAlign: 'right', color: BONE, textShadow: '0 2px 10px rgba(0,0,0,.8)', opacity: T > END_AT ? 1 - prog(T, END_AT, END_AT + .5) : 1 }}>
    <div style={{ fontSize: 20, letterSpacing: 5, opacity: .85 }}>{e[1]}</div><div style={{ fontSize: 36, color: TERRA }}>{e[2]}</div>
  </div>;
};
/* burned-in captions: speaker name + phrase, chunked ~8 words */
const CUES = (() => {
  const out: { s: number; e: number; spk: string; text: string }[] = [];
  L.forEach((l) => {
    const w = l.text.split(' '); const ch: string[][] = []; let cur: string[] = [];
    w.forEach((x: string) => { cur.push(x); if (cur.length >= 8 || (cur.length >= 4 && /[.,?!]$/.test(x))) { ch.push(cur); cur = []; } }); if (cur.length) ch.push(cur);
    const tot = ch.reduce((a, c) => a + c.join(' ').length, 0); let t = l.start;
    ch.forEach((c) => { const d = (l.end - l.start) * c.join(' ').length / tot; out.push({ s: t, e: t + d, spk: l.speaker, text: c.join(' ') }); t += d; });
  });
  return out;
})();
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const c = CUES.find((x) => T >= x.s && T < x.e + .15); if (!c || T > END_AT) return null;
  const nm = NAMES[c.spk];
  return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: 'rgba(18,13,10,.82)', borderRadius: 14, padding: '10px 26px 12px', maxWidth: 1500, textAlign: 'center', borderBottom: `4px solid ${nm ? nm[1] : '#6a5a4a'}` }}>
      {nm && <div style={{ fontFamily: 'Mono', fontSize: 22, letterSpacing: 4, color: nm[1], marginBottom: 2 }}>{nm[0]}</div>}
      <div style={{ fontFamily: 'Brico', fontWeight: 700, fontSize: 42, color: BONE, fontStyle: nm ? 'normal' : 'italic', lineHeight: 1.15 }}>{c.text}</div>
    </div>
  </div>;
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT) return null;
  const c = spring(prog(T, END_AT + .1, END_AT + .7) * 1.2, 10, .5);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(18,13,10,${.55 * clamp(c * 2)})` }}>
    <div style={{ fontFamily: 'Mono', fontSize: 34, letterSpacing: 8, color: TERRA, opacity: clamp(c * 2) }}>YOUR VERDICT</div>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 120, lineHeight: .95, color: BONE, textAlign: 'center', transform: `scale(${.75 + .25 * c})`, opacity: clamp(c * 2), textShadow: '0 6px 30px rgba(0,0,0,.7)' }}>FOLLOW HIM<br />OR <span style={{ color: TERRA }}>VOTE GUILTY?</span></div>
    <div style={{ display: 'flex', gap: 30, marginTop: 40, opacity: clamp((T - END_AT - 1) * 3) }}>
      <div style={{ fontFamily: 'Mono', fontSize: 36, color: INK, background: BONE, padding: '14px 30px' }}>COMMENT BELOW ↓</div>
      <div style={{ fontFamily: 'Brico', fontWeight: 800, fontSize: 40, color: BONE, background: '#c4302b', padding: '10px 34px', borderRadius: 10 }}>SUBSCRIBE</div>
    </div>
  </AbsoluteFill>;
};

export const Video: React.FC = () => {
  const f = useCurrentFrame(); const T = f / FPS;
  return <AbsoluteFill style={{ background: '#000' }}>
    <style>{fontFace}</style>
    {SHOTS.map((s, i) => { const a = Math.round(s.a * FPS), b = Math.round(Math.min(s.b, 2000) * FPS); return <Sequence key={i} from={a} durationInFrames={Math.max(1, b - a)}><Inner render={s.render} a={s.a} /></Sequence>; })}
    <Paper /><Vignette />
    <Captions T={T} /><Title T={T} /><ChapterCard T={T} /><EraChip T={T} /><Ending T={T} />
    <Grain f={f} />
    <Audio src={staticFile('mix.wav')} />
  </AbsoluteFill>;
};
const Inner: React.FC<{ render: (T: number) => React.ReactNode; a: number }> = ({ render, a }) => { const f = useCurrentFrame(); return <AbsoluteFill>{render(a + f / FPS)}</AbsoluteFill>; };
