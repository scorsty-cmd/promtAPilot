import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';

export const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}
@font-face{font-family:Gloock;src:url(${staticFile('fonts/Gloock.woff2')}) format('woff2');}
@font-face{font-family:Stencil;src:url(${staticFile('fonts/Stencil.woff2')}) format('woff2');font-weight:700;}
@font-face{font-family:SerifIt;src:url(${staticFile('fonts/DMSerif-It.woff2')}) format('woff2');}`;
const PL = '#efe4cc', INK = '#2a1a12', OCH = '#e0a83a', RED = '#b0402a', BLU = '#3a6fa8';
const CHAPTERS: Record<string, string> = {
  home: 'THE HORSE-TAMERS', ships: 'A THOUSAND SHIPS', siege: 'NINE LONG YEARS', achilles: 'THE ANGER OF ACHILLES', battle: 'BATTLE AT THE SHIPS',
  hector: 'HECTOR', horse: 'THE GIFT', night: 'THE LAST NIGHT', real: 'WAS IT REAL?',
};
const L = LINES as any[];
const CH_START = Object.keys(CHAPTERS).map((c, i) => ({ c, n: i + 1, s: L.find((l) => l.chapter === c).start }));
const NAMES: Record<string, [string, string]> = { YOU: ['YOU', '#ffb347'], ILOS: ['ILOS · YOUR FRIEND', '#8fc0f0'], DAD: ['YOUR FATHER', '#e8c890'], HEC: ['PRINCE HECTOR', '#ff8a6a'], AND: ['ANDROMACHE', '#a8c8f0'], PRI: ['KING PRIAM', '#d8a8f0'], LAO: ['LAOCOÖN · PRIEST', '#f0e0b0'], CAS: ['CASSANDRA', '#ff9ab0'], AEN: ['PRINCE AENEAS', '#a8e0b0'], SCOUT: ['SCOUT', '#d0c8b0'], ACH: ['ACHILLES', '#ffe08a'], SIN: ['SINON · A GREEK', '#c8c8c8'] };
const tl = require('./timeline.json');
const END_AT = tl.voice_end + .4;

const Plaster = () => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .2 }}>
  <svg width="100%" height="100%"><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves={4} seed={7} /><feColorMatrix type="matrix" values="0 0 0 0 .62  0 0 0 0 .52  0 0 0 0 .38  0 0 0 1.3 -.25" /></filter><rect width="100%" height="100%" filter="url(#pp)" /></svg>
</AbsoluteFill>;
const Grain: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .14 }}>
  <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
</AbsoluteFill>;
const Vignette = () => <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 58%, rgba(30,12,4,.5) 100%)' }} />;

/* hook overlay: the first frames must grab */
const Hook: React.FC<{ T: number }> = ({ T }) => {
  if (T > 4.2) return null;
  const a = spring(prog(T, .15, .7) * 1.2, 11, .45), o = 1 - prog(T, 3.6, 4.2);
  return <div style={{ position: 'absolute', left: 70, top: 60, opacity: o }}>
    <div style={{ fontFamily: 'Stencil', fontWeight: 700, fontSize: 34, letterSpacing: 6, color: OCH, transform: `translateX(${(1 - a) * -60}px)` }}>TROY · c. 1180 BC</div>
    <div style={{ fontFamily: 'Gloock', fontSize: 74, color: PL, lineHeight: 1, textShadow: '0 4px 20px rgba(0,0,0,.8)', opacity: clamp(a * 2) }}>6 hours before<br />the city falls</div>
  </div>;
};
const Title: React.FC<{ T: number }> = ({ T }) => {
  const s0 = L.find((l) => l.key === 'o5').start + .4; if (T < s0 || T > s0 + 5.6) return null;
  const a = spring(prog(T, s0, s0 + .6) * 1.2, 10, .5), b = spring(prog(T, s0 + .8, s0 + 1.4) * 1.2, 9, .45), o = 1 - prog(T, s0 + 5.0, s0 + 5.6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(20,8,4,${.45 * clamp(a * 2)})` }}>
    <div style={{ fontFamily: 'Stencil', fontWeight: 700, fontSize: 44, letterSpacing: 10, color: OCH, opacity: clamp(a * 2) }}>IF YOU WERE A</div>
    <div style={{ fontFamily: 'Gloock', fontSize: 190, lineHeight: .9, color: PL, transform: `scale(${.8 + .2 * a})`, textShadow: '0 10px 40px rgba(0,0,0,.7)', textAlign: 'center' }}>Soldier<br />at Troy</div>
    <div style={{ marginTop: 26, fontFamily: 'Mono', fontSize: 34, color: INK, background: OCH, padding: '6px 24px', transform: `scale(${1.4 - .4 * b})`, opacity: clamp(b * 3) }}>THE TROJAN SIDE OF THE STORY</div>
  </AbsoluteFill>;
};
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.9 && T < x.s + .6); if (!c) return null;
  const a = spring(prog(T, c.s - 1.9, c.s - 1.4) * 1.2, 11, .5), o = 1 - prog(T, c.s + .2, c.s + .6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o }}>
    <div style={{ background: PL, border: `10px solid ${INK}`, padding: '30px 90px 40px', transform: `scale(${.85 + .15 * a}) rotate(${(1 - a) * -2}deg)`, boxShadow: '0 20px 60px rgba(0,0,0,.5)', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 22, background: `repeating-linear-gradient(90deg, ${BLU} 0 40px, ${OCH} 40px 50px)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 22, background: `repeating-linear-gradient(90deg, ${RED} 0 40px, ${OCH} 40px 50px)` }} />
      <div style={{ fontFamily: 'Stencil', fontWeight: 700, fontSize: 34, letterSpacing: 8, color: RED, marginTop: 14 }}>CHAPTER {c.n}</div>
      <div style={{ fontFamily: 'Gloock', fontSize: 110, color: INK }}>{CHAPTERS[c.c]}</div>
    </div>
  </AbsoluteFill>;
};
const k = (key: string) => L.find((l) => l.key === key).start;
const ERAS: [number, string, string][] = [[4.2, 'TROY', 'LAST NIGHT'], [k('h1') - 2, 'TROY', '10 YEARS EARLIER'], [k('s1') - 2, 'TROY', 'YEAR 1'], [k('w1') - 2, 'GREEK CAMP', 'YEARS 1–9'], [k('w2'), 'TROY', 'YEAR 9'],
  [k('a1') - 2, 'TROY', 'YEAR 10'], [k('k9'), 'GREEK CAMP', 'YEAR 10'], [k('t1') - 2, 'THE BEACH', 'YEAR 10'], [k('n1') - 2, 'TROY', 'LAST NIGHT'], [k('n10'), 'THE SEA', 'DAWN'], [k('r1') - 2, 'HISARLIK, TÜRKİYE', 'TODAY']];
const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 4.2) return null;
  let e = ERAS[0]; let s0 = 0; ERAS.forEach((x) => { if (T >= x[0]) { e = x; s0 = x[0]; } });
  const st = spring(prog(T, s0, s0 + .5) * 1.2, 12, .5);
  return <div style={{ position: 'absolute', top: 40, right: 50, textAlign: 'center', background: INK, color: PL, padding: '6px 18px 8px', borderBottom: `6px solid ${OCH}`, transform: `scale(${T - s0 < 1 ? 1.2 - .2 * st : 1})`, opacity: T > END_AT ? 1 - prog(T, END_AT, END_AT + .5) : 1 }}>
    <div style={{ fontFamily: 'Mono', fontSize: 18, letterSpacing: 3, color: OCH }}>{e[1]}</div><div style={{ fontFamily: 'Gloock', fontSize: 32, lineHeight: 1.05 }}>{e[2]}</div>
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
    <div style={{ background: 'rgba(42,26,18,.86)', padding: '10px 28px 12px', maxWidth: 1500, textAlign: 'center', borderBottom: `5px solid ${nm ? nm[1] : OCH}` }}>
      {nm && <div style={{ fontFamily: 'Mono', fontSize: 22, letterSpacing: 3, color: nm[1], marginBottom: 2 }}>{nm[0]}</div>}
      <div style={{ fontFamily: nm ? 'Brico' : 'SerifIt', fontWeight: 700, fontSize: nm ? 42 : 44, color: PL, lineHeight: 1.15 }}>{c.text}</div>
    </div>
  </div>;
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT) return null;
  const c = spring(prog(T, END_AT + .1, END_AT + .7) * 1.2, 10, .5); const dz = 1 + (T - END_AT) * .035;
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(20,8,4,${.62 * clamp(c * 2)})`, transform: `scale(${dz}) rotate(${Math.sin(T * .9) * .8}deg)` }}>
    <div style={{ fontFamily: 'Stencil', fontWeight: 700, fontSize: 38, letterSpacing: 8, color: OCH, opacity: clamp(c * 2) }}>YOUR DECISION</div>
    <div style={{ fontFamily: 'Gloock', fontSize: 120, lineHeight: .98, color: PL, textAlign: 'center', transform: `scale(${.75 + .25 * c})`, opacity: clamp(c * 2), textShadow: '0 6px 30px rgba(0,0,0,.7)' }}>Would you have<br /><span style={{ color: OCH }}>pulled it inside?</span></div>
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
    <Plaster /><Vignette />
    {!clean && <><Captions T={T} /><Hook T={T} /><Title T={T} /><ChapterCard T={T} /><EraChip T={T} /><Ending T={T} /></>}
    <Grain f={f} />
    <Audio src={staticFile('mix.wav')} />
  </AbsoluteFill>;
};
const Inner: React.FC<{ render: (T: number) => React.ReactNode; a: number }> = ({ render, a }) => { const f = useCurrentFrame(); return <AbsoluteFill>{render(a + f / FPS)}</AbsoluteFill>; };
