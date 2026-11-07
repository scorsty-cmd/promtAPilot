import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';
import { MChar, CAST } from './chars';

export const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}
@font-face{font-family:Cinzel;src:url(${staticFile('fonts/Cinzel.ttf')}) format('truetype');font-weight:400 900;}
@font-face{font-family:Garamond;src:url(${staticFile('fonts/EBGaramond.ttf')}) format('truetype');font-weight:400 800;}`;
const PL = '#f2e2c4', INK = '#1c1410', OCH = '#d9a441', RED = '#5a2a6a', BLK = '#1c1410', TC = '#c8693a';
const CHAPTERS: Record<string, string> = {
  pella: 'THE HORSE NOBODY COULD RIDE', mieza: "ARISTOTLE'S SCHOOL", king: 'THE NEW KING', asia: 'INTO ASIA', issus: 'ISSUS', gauga: 'GAUGAMELA',
  persia: 'PERSEPOLIS', feast: 'THE FEAST', india: 'THE EDGE OF THE WORLD', desert: 'THE DESERT', end: 'BABYLON', real: 'WAS IT REAL?',
};
const L = LINES as any[];
const CH_START = Object.keys(CHAPTERS).map((c, i) => ({ c, n: i + 1, s: L.find((l) => l.chapter === c).start }));
const NAMES: Record<string, [string, string]> = { YOU: ['YOU', '#ffb347'], ALE: ['ALEXANDER', '#f0c860'], HEP: ['HEPHAESTION', '#8fc0f0'], ARI: ['ARISTOTLE', '#e8d8b0'], PHI: ['KING PHILIP II', '#d8a8f0'], CLE: ['CLEITUS THE BLACK', '#ff8a6a'], DIO: ['DIOGENES', '#c8d890'], PAR: ['GENERAL PARMENION', '#f0a890'], DAR: ['DARIUS III · KING OF PERSIA', '#e8b0ff'], SIS: ['SISYGAMBIS · QUEEN MOTHER', '#f0c0d8'], CAL: ['CALLISTHENES · HISTORIAN', '#a8d8f0'], POR: ['KING PORUS', '#9fe0b0'], COE: ['COENUS · OFFICER', '#e0c8a0'], SOL: ['MACEDONIAN SOLDIER', '#d0c8b0'] };
const tl = require('./timeline.json');
const END_AT = tl.voice_end + .4;

const Plaster = () => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .16 }}>
  <svg width="100%" height="100%"><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves={4} seed={7} /><feColorMatrix type="matrix" values="0 0 0 0 .66  0 0 0 0 .5  0 0 0 0 .36  0 0 0 1.3 -.25" /></filter><rect width="100%" height="100%" filter="url(#pp)" /></svg>
</AbsoluteFill>;
const Grain: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .14 }}>
  <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
</AbsoluteFill>;
const Vignette = () => <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 58%, rgba(30,12,4,.5) 100%)' }} />;

/* hook overlay — NEW in ep07: the first second is already mid-argument; a classmate photo-card slams in at the reveal */
const Hook: React.FC<{ T: number }> = ({ T }) => {
  const kill = L.find((l) => l.key === 'o6').start + .55, o8 = L.find((l) => l.key === 'o8');
  const a = spring(prog(T, .1, .6) * 1.2, 11, .45), o = 1 - prog(T, 4.4, 5.0);
  return <>
    {T < 5 && <div style={{ position: 'absolute', left: 70, top: 60, opacity: o }}>
      <div style={{ fontFamily: 'Mono', fontSize: 30, letterSpacing: 6, color: OCH, transform: `translateX(${(1 - a) * -60}px)` }}>SAMARKAND · 328 BC</div>
      <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: 64, color: PL, lineHeight: 1.02, textShadow: '0 4px 20px rgba(0,0,0,.8)', opacity: clamp(a * 2) }}>A ROYAL FEAST.<br /><span style={{ color: '#ff8a6a' }}>EVERYONE IS DRUNK.</span></div>
    </div>}
    {T > o8.start - .2 && T < o8.end + .8 && (() => { const p = spring(prog(T, o8.start - .2, o8.start + .3) * 1.2, 10, .45), q = 1 - prog(T, o8.end + .3, o8.end + .8);
      return <div style={{ position: 'absolute', right: 90, top: 110, opacity: q, transform: `rotate(${-6 + (1 - p) * 20}deg) scale(${.6 + .4 * p})` }}>
        <div style={{ background: PL, padding: '18px 18px 8px', boxShadow: '0 20px 50px rgba(0,0,0,.6)', border: `6px solid ${OCH}` }}>
          <svg width={360} height={230} viewBox="0 0 360 230" style={{ display: 'block', background: 'linear-gradient(#bcd6e0, #e2d6b8)' }}><g transform="translate(0 0)"><MChar look={CAST.ale} x={120} y={232} s={.42} age={.8} pose={{ expr: 'laugh', armF: -2.5, elbowF: .3 }} /><MChar look={CAST.youSt} x={240} y={232} s={.42} age={.8} flip pose={{ expr: 'happy', armF: -2.5, elbowF: .3 }} /></g></svg>
          <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: 40, color: INK, textAlign: 'center', marginTop: 6 }}>CLASSMATES</div>
          <div style={{ fontFamily: 'Mono', fontSize: 20, color: INK, textAlign: 'center' }}>MIEZA · 343 BC</div>
        </div></div>; })()}
    {T > kill - .02 && T < kill + .7 && <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}><div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: 150, color: '#c4302b', opacity: 1 - prog(T, kill + .4, kill + .7), transform: `scale(${1.3 - .3 * prog(T, kill, kill + .2)})`, letterSpacing: 10 }}>CLEITUS</div></AbsoluteFill>}
  </>;
};
const Title: React.FC<{ T: number }> = ({ T }) => {
  const s0 = L.find((l) => l.key === 'o9').start + .4; if (T < s0 || T > s0 + 5.4) return null;
  const a = spring(prog(T, s0, s0 + .6) * 1.2, 10, .5), b = spring(prog(T, s0 + .8, s0 + 1.4) * 1.2, 9, .45), o = 1 - prog(T, s0 + 4.8, s0 + 5.4);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(28,12,30,${.55 * clamp(a * 2)})` }}>
    <div style={{ fontFamily: 'Mono', fontSize: 40, letterSpacing: 12, color: OCH, opacity: clamp(a * 2) }}>IF YOU WERE</div>
    <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: 150, lineHeight: .95, color: PL, transform: `scale(${.8 + .2 * a})`, textShadow: '0 10px 40px rgba(0,0,0,.7)', textAlign: 'center' }}>ALEXANDER'S<br /><span style={{ color: OCH }}>CLASSMATE</span></div>
    <div style={{ marginTop: 26, fontFamily: 'Mono', fontSize: 32, color: PL, background: RED, padding: '6px 24px', transform: `scale(${1.4 - .4 * b})`, opacity: clamp(b * 3) }}>MIEZA → INDIA · 344 – 323 BC</div>
  </AbsoluteFill>;
};
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.9 && T < x.s + .6); if (!c) return null;
  const a = spring(prog(T, c.s - 1.9, c.s - 1.4) * 1.2, 11, .5), o = 1 - prog(T, c.s + .2, c.s + .6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o }}>
    <div style={{ background: TC, border: `12px solid ${BLK}`, outline: `4px solid ${OCH}`, padding: '30px 90px 40px', transform: `scale(${.85 + .15 * a}) rotate(${(1 - a) * -2}deg)`, boxShadow: '0 20px 60px rgba(0,0,0,.5)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Mono', fontSize: 30, letterSpacing: 8, color: BLK }}>ΚΕΦΑΛΑΙΟΝ {['Α','Β','Γ','Δ','Ε','ΣΤ','Ζ','Η','Θ','Ι','ΙΑ','ΙΒ'][c.n - 1]}</div>
      <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: 88, color: BLK }}>{CHAPTERS[c.c]}</div>
    </div>
  </AbsoluteFill>;
};
const k = (key: string) => L.find((l) => l.key === key).start;
const ERAS: [number, string, string][] = [[4.6, 'SAMARKAND', '328 BC'], [k('o9'), 'MIEZA', '343 BC'], [k('p1') - 2, 'PELLA', '344 BC'], [k('m1') - 2, 'MIEZA', '343 BC'], [k('m17'), 'MIEZA', 'TODAY'],
  [k('k1') - 2, 'AEGAE', '336 BC'], [k('k8'), 'CORINTH', '336 BC'], [k('a1') - 2, 'HELLESPONT', '334 BC'], [k('a6'), 'RIVER GRANICUS', '334 BC'], [k('a15'), 'GORDION', '333 BC'],
  [k('i1') - 2, 'ISSUS', '333 BC'], [k('g1') - 2, 'EGYPT', '332 – 331 BC'], [k('g4'), 'GAUGAMELA', '331 BC'], [k('e1') - 2, 'PERSEPOLIS', '330 BC'], [k('e8'), 'IRAN', '330 BC'],
  [k('f1') - 2, 'SAMARKAND', '328 BC'], [k('f6'), 'BACTRIA', '327 BC'], [k('n1') - 2, 'RIVER HYDASPES', '326 BC'], [k('n13'), 'RIVER HYPHASIS', '326 BC'], [k('d1') - 2, 'GEDROSIA', '325 BC'], [k('d6'), 'ECBATANA', '324 BC'],
  [k('z1') - 2, 'BABYLON', '323 BC'], [k('r1') - 2, 'TODAY', '2026']];
const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 4.6) return null;
  let e = ERAS[0]; let s0 = 0; ERAS.forEach((x) => { if (T >= x[0]) { e = x; s0 = x[0]; } });
  const st = spring(prog(T, s0, s0 + .5) * 1.2, 12, .5);
  return <div style={{ position: 'absolute', top: 40, right: 50, textAlign: 'center', background: RED, color: PL, padding: '6px 18px 8px', borderBottom: `6px solid ${OCH}`, transform: `scale(${T - s0 < 1 ? 1.2 - .2 * st : 1})`, opacity: T > END_AT ? 1 - prog(T, END_AT, END_AT + .5) : 1 }}>
    <div style={{ fontFamily: 'Mono', fontSize: 18, letterSpacing: 3, color: OCH }}>{e[1]}</div><div style={{ fontFamily: 'Cinzel', fontWeight: 700, fontSize: 30, lineHeight: 1.1 }}>{e[2]}</div>
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
    <div style={{ background: 'rgba(33,22,15,.86)', padding: '10px 28px 12px', maxWidth: 1500, textAlign: 'center', borderBottom: `5px solid ${nm ? nm[1] : OCH}` }}>
      {nm && <div style={{ fontFamily: 'Mono', fontSize: 22, letterSpacing: 3, color: nm[1], marginBottom: 2 }}>{nm[0]}</div>}
      <div style={{ fontFamily: nm ? 'Brico' : 'Garamond', fontWeight: nm ? 700 : 600, fontSize: nm ? 42 : 46, fontStyle: nm ? 'normal' : 'italic', color: PL, lineHeight: 1.15 }}>{c.text}</div>
    </div>
  </div>;
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT) return null;
  const c = spring(prog(T, END_AT + .1, END_AT + .7) * 1.2, 10, .5); const dz = 1 + (T - END_AT) * .035;
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(28,12,30,${.66 * clamp(c * 2)})`, transform: `scale(${dz}) rotate(${Math.sin(T * .9) * .8}deg)` }}>
    <div style={{ fontFamily: 'Mono', fontSize: 38, letterSpacing: 8, color: OCH, opacity: clamp(c * 2) }}>YOUR DECISION</div>
    <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: 110, lineHeight: 1.0, color: PL, textAlign: 'center', transform: `scale(${.75 + .25 * c})`, opacity: clamp(c * 2), textShadow: '0 6px 30px rgba(0,0,0,.7)' }}>Stay silent<br /><span style={{ color: OCH }}>or tell the truth?</span></div>
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
