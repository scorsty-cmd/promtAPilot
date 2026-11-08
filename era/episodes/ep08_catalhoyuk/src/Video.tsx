import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';

export const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}
@font-face{font-family:Cinzel;src:url(${staticFile('fonts/Cinzel.ttf')}) format('truetype');font-weight:400 900;}
@font-face{font-family:Garamond;src:url(${staticFile('fonts/EBGaramond.ttf')}) format('truetype');font-weight:400 800;}
@font-face{font-family:Dirt;src:url(${staticFile('fonts/RubikDirt.woff2')}) format('woff2');unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF,U+2260;}
@font-face{font-family:Dirt;src:url(${staticFile('fonts/RubikDirtExt.woff2')}) format('woff2');unicode-range:U+0100-02AF,U+1E00-1EFF;}
@font-face{font-family:Bowlby;src:url(${staticFile('fonts/Bowlby.woff2')}) format('woff2');unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF,U+2260;}
@font-face{font-family:Bowlby;src:url(${staticFile('fonts/BowlbyExt.woff2')}) format('woff2');unicode-range:U+0100-02AF,U+1E00-1EFF;}
@font-face{font-family:Brush;src:url(${staticFile('fonts/CaveatBrush.woff2')}) format('woff2');unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF,U+2260;}
@font-face{font-family:Brush;src:url(${staticFile('fonts/CaveatBrushExt.woff2')}) format('woff2');unicode-range:U+0100-02AF,U+1E00-1EFF;}`;
const PL = '#f1ece0', INK = '#2a2420', OCH = '#ffcf3a', RED = '#b5432a', BLK = '#2a2420', TC = '#b5432a';
const CHAPTERS: Record<string, string> = {
  home: 'THE HOUSE WITH NO DOOR', food: 'STREETS IN THE SKY', hunt: 'THE GIANT BULL', trade: 'BLACK GLASS', life: 'SMOKE AND STONES',
  death: 'UNDER THE FLOOR', build: 'HOUSE ON HOUSE', end: 'THE LAST LADDER', real: 'WAS IT REAL?',
};
const L = LINES as any[];
const CH_START = Object.keys(CHAPTERS).map((c, i) => ({ c, n: i + 1, s: L.find((l) => l.chapter === c).start }));
const NAMES: Record<string, [string, string]> = { YOU: ['YOU', '#ffcf3a'], SIS: ['YOUR LITTLE SISTER', '#ff9ac0'], MOM: ['MOTHER', '#ffb08a'], FAT: ['FATHER', '#9ad0ff'], HUN: ['THE HUNTER', '#ff7a5a'], NEI: ['THE NEIGHBOUR', '#c8e08a'], TRA: ['THE OBSIDIAN TRADER', '#d0b0ff'] };
const tl = require('./timeline.json');
const END_AT = tl.voice_end + .4;

const Plaster = () => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .16 }}>
  <svg width="100%" height="100%"><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves={4} seed={7} /><feColorMatrix type="matrix" values="0 0 0 0 .66  0 0 0 0 .5  0 0 0 0 .36  0 0 0 1.3 -.25" /></filter><rect width="100%" height="100%" filter="url(#pp)" /></svg>
</AbsoluteFill>;
const Grain: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .14 }}>
  <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
</AbsoluteFill>;
const Vignette = () => <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 58%, rgba(30,12,4,.5) 100%)' }} />;

/* hook overlay — NEW in ep08: the rule of the town arrives as three slammed words, then a ladder counter; at "under my bed" a dashed cutaway arrow drops through the floor */
const Hook: React.FC<{ T: number }> = ({ T }) => {
  const words = [['NO STREETS.', .3], ['NO DOORS.', 1.6], ['NO WINDOWS.', 2.7]] as [string, number][];
  const o7 = L.find((l) => l.key === 'o7'), o8 = L.find((l) => l.key === 'o8');
  return <>
    {T < 4.4 && <div style={{ position: 'absolute', left: 80, top: 70, opacity: 1 - prog(T, 3.9, 4.4) }}>
      {words.map(([w, at], i) => { const p = spring(prog(T, at, at + .45) * 1.2, 11, .45); return T > at ? <div key={i} style={{ fontFamily: 'Dirt', fontSize: 104, lineHeight: 1.0, color: i === 2 ? OCH : PL, textShadow: '0 6px 0 #2a2420, 0 10px 30px rgba(0,0,0,.7)', transform: `translateX(${(1 - p) * -80}px) scale(${1.25 - .25 * p})`, transformOrigin: 'left center', opacity: clamp(p * 3) }}>{w}</div> : null; })}
    </div>}
    {T > o7.start + .4 && T < o8.start + 2.6 && (() => { const p = spring(prog(T, o7.start + .4, o7.start + .9) * 1.2, 10, .45), q = 1 - prog(T, o8.start + 2.1, o8.start + 2.6);
      return <div style={{ position: 'absolute', left: 90, top: 90, opacity: q, transform: `rotate(${-4 + (1 - p) * 14}deg) scale(${.6 + .4 * p})`, transformOrigin: 'left top' }}>
        <div style={{ background: PL, border: `8px solid ${RED}`, padding: '14px 26px', boxShadow: '0 20px 50px rgba(0,0,0,.6)' }}>
          <div style={{ fontFamily: 'Bowlby', fontSize: 30, color: RED, letterSpacing: 2 }}>LOCATION OF GRANDMOTHER:</div>
          <div style={{ fontFamily: 'Dirt', fontSize: 72, color: INK, lineHeight: 1 }}>UNDER THE BED ↓</div>
        </div></div>; })()}
  </>;
};
const Title: React.FC<{ T: number }> = ({ T }) => {
  const s0 = L.find((l) => l.key === 'o9').start + .3; if (T < s0 || T > s0 + 5.8) return null;
  const a = spring(prog(T, s0, s0 + .6) * 1.2, 10, .5), b = spring(prog(T, s0 + .9, s0 + 1.5) * 1.2, 9, .45), o = 1 - prog(T, s0 + 5.2, s0 + 5.8);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(42,36,32,${.5 * clamp(a * 2)})` }}>
    <div style={{ fontFamily: 'Bowlby', fontSize: 42, letterSpacing: 10, color: OCH, opacity: clamp(a * 2) }}>IF YOU WERE BORN IN</div>
    <div style={{ fontFamily: 'Dirt', fontSize: 190, lineHeight: .95, color: PL, transform: `scale(${.8 + .2 * a})`, textShadow: `0 8px 0 ${RED}, 0 14px 40px rgba(0,0,0,.7)`, textAlign: 'center' }}>ÇATALHÖYÜK</div>
    <div style={{ marginTop: 30, fontFamily: 'Bowlby', fontSize: 34, color: PL, background: RED, padding: '6px 26px', transform: `scale(${1.4 - .4 * b}) rotate(-2deg)`, opacity: clamp(b * 3) }}>ANATOLIA · c. 7000 BC</div>
  </AbsoluteFill>;
};
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.9 && T < x.s + .6); if (!c) return null;
  const a = spring(prog(T, c.s - 1.9, c.s - 1.4) * 1.2, 11, .5), h = spring(prog(T, c.s - 1.3, c.s - 1.0) * 1.2, 12, .4), o = 1 - prog(T, c.s + .2, c.s + .6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o }}>
    <div style={{ position: 'relative', background: PL, borderRadius: 28, border: `10px solid ${INK}`, padding: '34px 110px 42px', transform: `scale(${.85 + .15 * a}) rotate(${(1 - a) * -2}deg)`, boxShadow: '0 20px 60px rgba(0,0,0,.5)', textAlign: 'center' }}>
      <svg width={150} height={170} viewBox="-45 -80 90 130" style={{ position: 'absolute', left: -60, top: -70, transform: `scale(${1.6 - .6 * h}) rotate(-14deg)`, opacity: clamp(h * 3) }}><path d="M -26 40 C -30 10 -30 -6 -24 -16 L -28 -54 Q -22 -62 -16 -54 L -10 -24 L -8 -66 Q -1 -74 6 -66 L 6 -26 L 14 -60 Q 21 -66 26 -58 L 20 -20 L 32 -42 Q 40 -44 40 -36 L 26 10 C 22 30 14 42 -26 40 Z" fill={RED} /></svg>
      <div style={{ fontFamily: 'Bowlby', fontSize: 30, letterSpacing: 8, color: RED }}>CHAPTER {c.n}</div>
      <div style={{ fontFamily: 'Dirt', fontSize: 96, color: INK, lineHeight: 1.05 }}>{CHAPTERS[c.c]}</div>
    </div>
  </AbsoluteFill>;
};
const k = (key: string) => L.find((l) => l.key === key).start;
const ERAS: [number, string, string][] = [[4.6, 'ÇATALHÖYÜK', 'c. 6700 BC'], [k('f4'), 'THE KONYA PLAIN', 'c. 6700 BC'], [k('u7') - 1, 'THE LAKE SHORE', 'c. 6700 BC'], [k('t1'), 'ÇATALHÖYÜK', 'c. 6700 BC'],
  [k('b1'), 'YEARS LATER', 'c. 6680 BC'], [k('z1'), 'ÇATALHÖYÜK', 'c. 6000 BC'], [k('r1') - 2, 'KONYA, TURKEY', 'TODAY']];
const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 4.6) return null;
  let e = ERAS[0]; let s0 = 0; ERAS.forEach((x) => { if (T >= x[0]) { e = x; s0 = x[0]; } });
  const st = spring(prog(T, s0, s0 + .5) * 1.2, 12, .5);
  return <div style={{ position: 'absolute', top: 40, right: 50, textAlign: 'center', background: PL, color: INK, padding: '6px 18px 8px', borderBottom: `6px solid ${RED}`, borderRadius: 10, transform: `scale(${T - s0 < 1 ? 1.2 - .2 * st : 1})`, opacity: T > END_AT ? 1 - prog(T, END_AT, END_AT + .5) : 1 }}>
    <div style={{ fontFamily: 'Bowlby', fontSize: 18, letterSpacing: 2, color: RED }}>{e[1]}</div><div style={{ fontFamily: 'Dirt', fontSize: 34, lineHeight: 1.1 }}>{e[2]}</div>
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
    <div style={{ background: 'rgba(42,36,32,.86)', borderRadius: 14, padding: '10px 28px 12px', maxWidth: 1500, textAlign: 'center', borderBottom: `5px solid ${nm ? nm[1] : OCH}` }}>
      {nm && <div style={{ fontFamily: 'Bowlby', fontSize: 22, letterSpacing: 2, color: nm[1], marginBottom: 2 }}>{nm[0]}</div>}
      <div style={{ fontFamily: nm ? 'Brico' : 'Brush', fontWeight: nm ? 700 : 400, fontSize: nm ? 42 : 52, fontStyle: 'normal', color: PL, lineHeight: 1.15 }}>{c.text}</div>
    </div>
  </div>;
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT) return null;
  const c = spring(prog(T, END_AT + .1, END_AT + .7) * 1.2, 10, .5); const dz = 1 + (T - END_AT) * .035;
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(42,36,32,${.66 * clamp(c * 2)})`, transform: `scale(${dz})` }}>
    <div style={{ fontFamily: 'Bowlby', fontSize: 40, letterSpacing: 8, color: OCH, opacity: clamp(c * 2) }}>NO STREETS · NO DOORS · ANCESTORS UNDER THE BED</div>
    <div style={{ fontFamily: 'Dirt', fontSize: 130, lineHeight: 1.0, color: PL, textAlign: 'center', transform: `scale(${.75 + .25 * c})`, opacity: clamp(c * 2), textShadow: `0 8px 0 ${RED}, 0 12px 30px rgba(0,0,0,.7)` }}>Could you<br /><span style={{ color: OCH }}>live here?</span></div>
    <div style={{ display: 'flex', gap: 30, marginTop: 40, opacity: clamp((T - END_AT - 1) * 3) }}>
      <div style={{ fontFamily: 'Bowlby', fontSize: 34, color: INK, background: PL, padding: '14px 30px', borderRadius: 10 }}>YES / NO ↓ COMMENTS</div>
      <div style={{ fontFamily: 'Bowlby', fontSize: 38, color: PL, background: RED, padding: '12px 34px', borderRadius: 10 }}>SUBSCRIBE</div>
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
