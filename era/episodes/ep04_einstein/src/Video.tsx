import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';

export const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}
@font-face{font-family:Serif;src:url(${staticFile('fonts/DMSerif.woff2')}) format('woff2');}
@font-face{font-family:SerifIt;src:url(${staticFile('fonts/DMSerif-It.woff2')}) format('woff2');}
@font-face{font-family:Type;src:url(${staticFile('fonts/Typewriter.woff2')}) format('woff2');}`;
const CREAM = '#f6efdc', INK = '#1d1612', BRASS = '#e0b04a', WINE = '#8a3b34', SLATE = '#2e3c35', CHALK = '#f1eee2';
const CHAPTERS: Record<string, string> = {
  ad: 'THE NEWSPAPER AD', academy: 'THE OLYMPIA ACADEMY', miracle: 'THE MIRACLE YEAR', emc2: 'E = mc²', happy: 'THE HAPPIEST THOUGHT',
  eclipse: 'BENDING LIGHT', bohr: 'GOD AND DICE', exile: 'EXILE & THE BOMB', legacy: 'WHAT HE LEFT US',
};
const L = LINES as any[];
const CH_START = Object.keys(CHAPTERS).map((c, i) => ({ c, n: i + 1, s: L.find((l) => l.chapter === c).start }));
const NAMES: Record<string, [string, string]> = { YOU: ['YOU', '#ffb347'], EIN: ['EINSTEIN', '#f6efdc'], HAB: ['CONRAD HABICHT', '#e8a090'], SOL: ['MAURICE SOLOVINE', '#a8d8a0'], MIL: ['MILEVA MARIĆ', '#9fc0e8'], BES: ['MICHELE BESSO', '#e0c070'], GRO: ['MARCEL GROSSMANN', '#c8b0e8'], EDD: ['ARTHUR EDDINGTON', '#e8d8b0'], BOHR: ['NIELS BOHR', '#8fd0c0'], SZI: ['LEO SZILARD', '#d8a8f0'], DOC: ['DOCTOR', '#c8d0e8'] };
const tl = require('./timeline.json');
const END_AT = tl.voice_end + .4;

const Paper = () => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .16 }}>
  <svg width="100%" height="100%"><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".011 .018" numOctaves={4} seed={21} /><feColorMatrix type="matrix" values="0 0 0 0 .58  0 0 0 0 .48  0 0 0 0 .34  0 0 0 1.2 -.2" /></filter><rect width="100%" height="100%" filter="url(#pp)" /></svg>
</AbsoluteFill>;
const Grain: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .16 }}>
  <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
</AbsoluteFill>;
/* old-film gate: soft sepia vignette + occasional flicker */
const Gate: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 78% 72% at 50% 50%, rgba(0,0,0,0) 58%, rgba(30,18,8,.5) 100%)', opacity: .92 + ((f * 7919) % 13) / 160 }} />;

const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T > 7.0) return null;
  const a = spring(prog(T, .2, .8) * 1.2, 10, .5), b = spring(prog(T, 1.0, 1.6) * 1.2, 9, .45), o = 1 - prog(T, 6.4, 7.0);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(20,14,8,${.55 * clamp(a * 2)})` }}>
    <div style={{ fontFamily: 'Type', fontSize: 40, letterSpacing: 6, color: BRASS, opacity: clamp(a * 2) }}>IF YOU WERE</div>
    <div style={{ fontFamily: 'Serif', fontSize: 170, lineHeight: .92, color: CREAM, transform: `scale(${.85 + .15 * a})`, textShadow: '0 8px 40px rgba(0,0,0,.6)', textAlign: 'center' }}>Einstein's<br />Student</div>
    <div style={{ marginTop: 34, fontFamily: 'Type', fontSize: 44, color: WINE, border: `5px solid ${WINE}`, padding: '6px 26px', background: 'rgba(246,239,220,.92)', transform: `rotate(${-4 + (1 - b) * 10}deg) scale(${1.6 - .6 * b})`, opacity: clamp(b * 3) }}>BERN · 1902 — PRINCETON · 1955</div>
  </AbsoluteFill>;
};
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.9 && T < x.s + .6); if (!c) return null;
  const a = spring(prog(T, c.s - 1.9, c.s - 1.4) * 1.2, 11, .5), o = 1 - prog(T, c.s + .2, c.s + .6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o }}>
    <div style={{ background: SLATE, border: `14px solid #6a4426`, padding: '40px 90px 50px', transform: `translateY(${(1 - a) * 60}px) rotate(${(1 - a) * -3}deg)`, boxShadow: '0 20px 60px rgba(0,0,0,.5)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Type', fontSize: 34, letterSpacing: 8, color: BRASS }}>CHAPTER {c.n}</div>
      <div style={{ fontFamily: 'Serif', fontSize: 112, color: CHALK, opacity: .95 }}>{CHAPTERS[c.c]}</div>
      <svg width={520} height={20}><path d="M 10 10 Q 130 2 260 10 T 510 9" stroke={CHALK} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={`${a * 560} 600`} opacity={.8} /></svg>
    </div>
  </AbsoluteFill>;
};
const k = (key: string) => L.find((l) => l.key === key).start;
const ERAS: [number, string, string][] = [[0, 'PRINCETON', '1955'], [k('d1') - 2, 'BERN', '1902'], [k('m1') - 2, 'BERN', '1905'], [k('h1') - 2, 'BERN', '1907'], [k('h8'), 'ZURICH', '1912'],
  [k('s1') - 2, 'BERLIN', '1915'], [k('s4'), 'PRÍNCIPE', '1919'], [k('s6'), 'BERLIN', '1919'], [k('s9'), 'BERLIN', '1922'], [k('q1') - 2, 'BRUSSELS', '1927'], [k('x1') - 2, 'PRINCETON', '1933'],
  [k('x3'), 'GERMANY', '1933'], [k('x4'), 'LONG ISLAND', '1939'], [k('x9'), 'PRINCETON', '1954'], [k('c1') - 2, 'PRINCETON', '1955'], [k('c3'), 'TODAY', '2026'], [k('c5a'), 'BERN · MEMORY', '1902'], [k('c6'), 'BERN', '1902']];
const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 7) return null;
  let e = ERAS[0]; let s0 = 0; ERAS.forEach((x) => { if (T >= x[0]) { e = x; s0 = x[0]; } });
  const st = spring(prog(T, s0, s0 + .5) * 1.2, 12, .5);
  return <div style={{ position: 'absolute', top: 40, right: 50, fontFamily: 'Type', textAlign: 'center', color: '#c8443a', border: '4px solid #c8443a', padding: '4px 16px 2px', background: 'rgba(246,239,220,.82)', transform: `rotate(-3deg) scale(${T - s0 < 1 ? 1.25 - .25 * st : 1})`, opacity: T > END_AT ? 1 - prog(T, END_AT, END_AT + .5) : 1 }}>
    <div style={{ fontSize: 20, letterSpacing: 4 }}>{e[1]}</div><div style={{ fontSize: 38, lineHeight: 1 }}>{e[2]}</div>
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
export const CUE_LIST = CUES;
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const c = CUES.find((x) => T >= x.s && T < x.e + .15); if (!c || T > END_AT) return null;
  const nm = NAMES[c.spk];
  return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: 'rgba(29,22,18,.86)', padding: '10px 28px 12px', maxWidth: 1500, textAlign: 'center', borderLeft: `6px solid ${nm ? nm[1] : BRASS}`, borderRight: `6px solid ${nm ? nm[1] : BRASS}` }}>
      {nm && <div style={{ fontFamily: 'Type', fontSize: 24, letterSpacing: 3, color: nm[1], marginBottom: 2 }}>{nm[0]}</div>}
      <div style={{ fontFamily: nm ? 'Brico' : 'SerifIt', fontWeight: 700, fontSize: nm ? 42 : 44, color: CREAM, lineHeight: 1.15 }}>{c.text}</div>
    </div>
  </div>;
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT) return null;
  const c = spring(prog(T, END_AT + .1, END_AT + .7) * 1.2, 10, .5);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(20,14,8,${.6 * clamp(c * 2)})` }}>
    <div style={{ fontFamily: 'Type', fontSize: 36, letterSpacing: 6, color: BRASS, opacity: clamp(c * 2) }}>YOUR TURN</div>
    <div style={{ fontFamily: 'Serif', fontSize: 124, lineHeight: .98, color: CREAM, textAlign: 'center', transform: `scale(${.75 + .25 * c})`, opacity: clamp(c * 2), textShadow: '0 6px 30px rgba(0,0,0,.7)' }}>What would <i style={{ fontFamily: 'SerifIt', color: BRASS }}>you</i><br />ask Einstein?</div>
    <div style={{ display: 'flex', gap: 30, marginTop: 40, opacity: clamp((T - END_AT - 1) * 3) }}>
      <div style={{ fontFamily: 'Type', fontSize: 36, color: INK, background: CREAM, padding: '14px 30px' }}>COMMENT BELOW ↓</div>
      <div style={{ fontFamily: 'Brico', fontWeight: 800, fontSize: 40, color: CREAM, background: '#c4302b', padding: '10px 34px', borderRadius: 10 }}>SUBSCRIBE</div>
    </div>
  </AbsoluteFill>;
};

export const Video: React.FC<{ clean?: boolean }> = ({ clean }) => {
  const f = useCurrentFrame(); const T = f / FPS;
  return <AbsoluteFill style={{ background: '#000' }}>
    <style>{fontFace}</style>
    {SHOTS.map((s, i) => { const a = Math.round(s.a * FPS), b = Math.round(Math.min(s.b, 2000) * FPS); return <Sequence key={i} from={a} durationInFrames={Math.max(1, b - a)}><Inner render={s.render} a={s.a} /></Sequence>; })}
    <Paper /><Gate f={f} />
    {!clean && <><Captions T={T} /><Title T={T} /><ChapterCard T={T} /><EraChip T={T} /><Ending T={T} /></>}
    <Grain f={f} />
    <Audio src={staticFile('mix.wav')} />
  </AbsoluteFill>;
};
const Inner: React.FC<{ render: (T: number) => React.ReactNode; a: number }> = ({ render, a }) => { const f = useCurrentFrame(); return <AbsoluteFill>{render(a + f / FPS)}</AbsoluteFill>; };
