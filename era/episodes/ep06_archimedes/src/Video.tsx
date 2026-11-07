import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';

export const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}
@font-face{font-family:Gloock;src:url(${staticFile('fonts/Gloock.woff2')}) format('woff2');}
@font-face{font-family:Marcellus;src:url(${staticFile('fonts/Marcellus.woff2')}) format('woff2');}
@font-face{font-family:Caveat;src:url(${staticFile('fonts/Caveat.woff2')}) format('woff2');font-weight:700;}
@font-face{font-family:Stencil;src:url(${staticFile('fonts/Stencil.woff2')}) format('woff2');font-weight:700;}
@font-face{font-family:SerifIt;src:url(${staticFile('fonts/DMSerif-It.woff2')}) format('woff2');}`;
const PL = '#f2e6c4', INK = '#3a2614', OCH = '#e0a83a', RED = '#b0402a', BLU = '#2f9aa8';
const CHAPTERS: Record<string, string> = {
  workshop: 'CIRCLES IN THE ASHES', crown: 'EUREKA!', lever: 'MOVE THE WORLD', numbers: 'COUNTING THE UNIVERSE', siege: 'ROME ARRIVES',
  claw: 'THE CLAW', mirrors: 'THE DEATH RAY?', fall: 'THE FESTIVAL', circles: 'DO NOT DISTURB', book: 'THE LOST BOOK',
};
const L = LINES as any[];
const CH_START = Object.keys(CHAPTERS).map((c, i) => ({ c, n: i + 1, s: L.find((l) => l.chapter === c).start }));
const NAMES: Record<string, [string, string]> = { YOU: ['YOU', '#7fd8d0'], ARCH: ['ARCHIMEDES', '#f6efdc'], KLEO: ['KLEON · APPRENTICE', '#ffb07a'], HIERO: ['KING HIERO II', '#d8a8f0'], GOLD: ['THE GOLDSMITH', '#e8c890'], MARC: ['GENERAL MARCELLUS', '#ff8a7a'], SOLD: ['ROMAN SOLDIER', '#ff9a8a'], MOM: ['YOUR MOTHER', '#e8b8e8'], CAPT: ['SHIPWRIGHT', '#9fd0f0'], CIC: ['CICERO', '#e8e0c8'] };
const tl = require('./timeline.json');
const END_AT = tl.voice_end + .4;

const Plaster = () => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .2 }}>
  <svg width="100%" height="100%"><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves={4} seed={7} /><feColorMatrix type="matrix" values="0 0 0 0 .62  0 0 0 0 .52  0 0 0 0 .38  0 0 0 1.3 -.25" /></filter><rect width="100%" height="100%" filter="url(#pp)" /></svg>
</AbsoluteFill>;
const Grain: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .14 }}>
  <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
</AbsoluteFill>;
const Geometry: React.FC<{ T: number }> = ({ T }) => <AbsoluteFill style={{ pointerEvents: 'none', opacity: .09, mixBlendMode: 'screen' }}><svg width="100%" height="100%">
  {[[300, 260, 220], [1600, 820, 300], [1500, 200, 140]].map(([x, y, r], k) => <g key={k} transform={`rotate(${T * (k % 2 ? 2 : -2)} ${x} ${y})`}><circle cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeWidth={2} /><polygon points={Array.from({ length: 6 + k * 6 }).map((_, j) => `${x + Math.cos(j / (6 + k * 6) * Math.PI * 2) * r},${y + Math.sin(j / (6 + k * 6) * Math.PI * 2) * r}`).join(' ')} fill="none" stroke="#fff" strokeWidth={1.5} /><line x1={x - r} y1={y} x2={x + r} y2={y} stroke="#fff" strokeWidth={1.5} /></g>)}
</svg></AbsoluteFill>;
const Vignette = () => <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 58%, rgba(10,20,30,.5) 100%)' }} />;

/* hook overlay: the first frames must grab */
const Hook: React.FC<{ T: number }> = ({ T }) => {
  if (T > 4.2) return null;
  const a = spring(prog(T, .15, .7) * 1.2, 11, .45), o = 1 - prog(T, 3.6, 4.2);
  return <div style={{ position: 'absolute', left: 70, top: 60, opacity: o }}>
    <div style={{ fontFamily: 'Marcellus', fontSize: 34, letterSpacing: 6, color: OCH, transform: `translateX(${(1 - a) * -60}px)` }}>SYRACUSE · 212 BC</div>
    <div style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 84, color: PL, lineHeight: .95, textShadow: '0 4px 20px rgba(0,0,0,.8)', opacity: clamp(a * 2) }}>the last day of<br />the greatest mind</div>
  </div>;
};
const Title: React.FC<{ T: number }> = ({ T }) => {
  const s0 = L.find((l) => l.key === 'o4').start + .2; if (T < s0 || T > s0 + 5.6) return null;
  const a = spring(prog(T, s0, s0 + .6) * 1.2, 10, .5), b = spring(prog(T, s0 + .8, s0 + 1.4) * 1.2, 9, .45), o = 1 - prog(T, s0 + 5.0, s0 + 5.6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(12,30,40,${.55 * clamp(a * 2)})` }}>
    <div style={{ fontFamily: 'Marcellus', fontSize: 46, letterSpacing: 12, color: OCH, opacity: clamp(a * 2) }}>IF YOU WERE</div>
    <div style={{ fontFamily: 'Marcellus', fontSize: 170, lineHeight: .95, color: PL, transform: `scale(${.8 + .2 * a})`, textShadow: '0 10px 40px rgba(0,0,0,.7)', textAlign: 'center' }}>ARCHIMEDES'<br />STUDENT</div>
    <svg width={700} height={60} style={{ opacity: clamp(b * 3) }}><circle cx={350} cy={30} r={24} fill="none" stroke={OCH} strokeWidth={4} strokeDasharray={`${b * 160} 160`} /><line x1={40} y1={30} x2={320} y2={30} stroke={OCH} strokeWidth={3} /><line x1={380} y1={30} x2={660} y2={30} stroke={OCH} strokeWidth={3} /></svg>
    <div style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 48, color: PL, transform: `scale(${1.3 - .3 * b})`, opacity: clamp(b * 3) }}>Syracuse, 232 – 212 BC</div>
  </AbsoluteFill>;
};
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.9 && T < x.s + .6); if (!c) return null;
  const a = spring(prog(T, c.s - 1.9, c.s - 1.3) * 1.2, 11, .55), o = 1 - prog(T, c.s + .2, c.s + .6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o }}>
    <div style={{ position: 'relative', width: 1100 * Math.max(.05, a), height: 300, background: '#efe0b8', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(160,130,80,.18) 0 3px, transparent 3px 22px)' }}>
      <div style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 44, color: RED, whiteSpace: 'nowrap' }}>Chapter {c.n}</div>
      <div style={{ fontFamily: 'Marcellus', fontSize: 96, color: INK, whiteSpace: 'nowrap' }}>{CHAPTERS[c.c]}</div>
      <svg width={500} height={20}><path d="M 10 10 Q 250 2 490 12" stroke={RED} strokeWidth={4} fill="none" strokeDasharray={`${a * 520} 520`} /></svg>
    </div>
    {[-1, 1].map((q) => <div key={q} style={{ position: 'absolute', left: `calc(50% + ${q * 550 * Math.max(.05, a)}px - 26px)`, top: 'calc(50% - 175px)', width: 52, height: 350, borderRadius: 26, background: 'linear-gradient(90deg,#8a6a40,#d8b880,#8a6a40)', border: '5px solid #3a2614' }} />)}
  </AbsoluteFill>;
};
const k = (key: string) => L.find((l) => l.key === key).start;
const ERAS: [number, string, string][] = [[4.2, 'SYRACUSE', '212 BC'], [k('w1') - 2, 'SYRACUSE', 'c. 232 BC'], [k('c1') - 2, 'SYRACUSE', 'c. 230 BC'], [k('l1') - 2, 'SYRACUSE', 'c. 230 BC'], [k('s1') - 2, 'SYRACUSE', '214 BC'], [k('f1') - 2, 'SYRACUSE', '212 BC'],
  [k('b1') - 2, 'SYRACUSE', '75 BC'], [k('b3'), 'CONSTANTINOPLE', '1229 AD'], [k('b6'), 'BALTIMORE', '2000s'], [k('b7'), 'MEMORY', 'c. 232 BC']];
const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 4.2) return null;
  let e = ERAS[0]; let s0 = 0; ERAS.forEach((x) => { if (T >= x[0]) { e = x; s0 = x[0]; } });
  const st = spring(prog(T, s0, s0 + .5) * 1.2, 12, .5);
  return <div style={{ position: 'absolute', top: 30, right: 40, width: 150, height: 150, borderRadius: 75, background: 'radial-gradient(circle at 40% 35%, #f0d890, #c8a050 70%, #8a6a30)', border: '5px solid #3a2614', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', transform: `scale(${T - s0 < 1 ? 1.25 - .25 * st : 1}) rotate(${(T - s0 < 1 ? (1 - st) * 180 : 0)}deg)`, opacity: T > END_AT ? 1 - prog(T, END_AT, END_AT + .5) : 1, boxShadow: '0 6px 20px rgba(0,0,0,.4)' }}>
    <div style={{ fontFamily: 'Marcellus', fontSize: e[1].length > 10 ? 13 : 17, letterSpacing: 2, color: '#3a2614' }}>{e[1]}</div><div style={{ fontFamily: 'Marcellus', fontSize: 28, lineHeight: 1.05, color: '#3a2614' }}>{e[2]}</div>
  </div>;
};
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
  return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: 'rgba(20,34,40,.86)', padding: '10px 28px 12px', maxWidth: 1500, textAlign: 'center', borderBottom: `5px solid ${nm ? nm[1] : OCH}` }}>
      {nm && <div style={{ fontFamily: 'Marcellus', fontSize: 24, letterSpacing: 3, color: nm[1], marginBottom: 2 }}>{nm[0]}</div>}
      <div style={{ fontFamily: nm ? 'Brico' : 'SerifIt', fontWeight: 700, fontSize: nm ? 42 : 44, color: PL, lineHeight: 1.15 }}>{c.text}</div>
    </div>
  </div>;
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT) return null;
  const c = spring(prog(T, END_AT + .1, END_AT + .7) * 1.2, 10, .5); const dz = 1 + (T - END_AT) * .035;
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(12,30,40,${.66 * clamp(c * 2)})`, transform: `scale(${dz}) rotate(${Math.sin(T * .9) * .8}deg)` }}>
    <div style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 52, color: OCH, opacity: clamp(c * 2) }}>your turn, apprentice</div>
    <div style={{ fontFamily: 'Marcellus', fontSize: 110, lineHeight: 1.0, color: PL, textAlign: 'center', transform: `scale(${.75 + .25 * c})`, opacity: clamp(c * 2), textShadow: '0 6px 30px rgba(0,0,0,.7)' }}>Which machine would<br /><span style={{ color: OCH }}>you build first?</span></div>
    <div style={{ display: 'flex', gap: 30, marginTop: 40, opacity: clamp((T - END_AT - 1) * 3) }}>
      <div style={{ fontFamily: 'Mono', fontSize: 34, color: INK, background: PL, padding: '14px 30px' }}>COMMENT ↓</div>
      <div style={{ fontFamily: 'Brico', fontWeight: 800, fontSize: 40, color: PL, background: '#c4302b', padding: '10px 34px', borderRadius: 10 }}>SUBSCRIBE</div>
    </div>
  </AbsoluteFill>;
};

export const Video: React.FC<{ clean?: boolean }> = ({ clean }) => {
  const f = useCurrentFrame(); const T = f / FPS;
  return <AbsoluteFill style={{ background: '#000' }}>
    <style>{fontFace}</style>
    {SHOTS.map((s, i) => { const a = Math.round(s.a * FPS), b = Math.round(Math.min(s.b, 2000) * FPS); return <Sequence key={i} from={a} durationInFrames={Math.max(1, b - a)}><Inner render={s.render} a={s.a} /></Sequence>; })}
    <Plaster /><Geometry T={T} /><Vignette />
    {!clean && <><Captions T={T} /><Hook T={T} /><Title T={T} /><ChapterCard T={T} /><EraChip T={T} /><Ending T={T} /></>}
    <Grain f={f} />
    <Audio src={staticFile('mix.wav')} />
  </AbsoluteFill>;
};
const Inner: React.FC<{ render: (T: number) => React.ReactNode; a: number }> = ({ render, a }) => { const f = useCurrentFrame(); return <AbsoluteFill>{render(a + f / FPS)}</AbsoluteFill>; };
