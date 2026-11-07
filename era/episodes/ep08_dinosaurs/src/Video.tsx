import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, spring, clamp } from './lib';
import { SHOTS } from './shots';

export const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Dela;src:url(${staticFile('fonts/Dela.woff2')}) format('woff2');}
@font-face{font-family:RubikMono;src:url(${staticFile('fonts/RubikMono.woff2')}) format('woff2');}
@font-face{font-family:Grot;src:url(${staticFile('fonts/Grotesk.woff2')}) format('woff2');font-weight:700;}
@font-face{font-family:Caveat;src:url(${staticFile('fonts/Caveat.woff2')}) format('woff2');font-weight:700;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}`;
const PAPER = '#f4eee0', NAVY = '#233a73', PINK = '#ff4f9a', YEL = '#ffd23f', TEAL = '#0a8f8a';
const CHAPTERS: Record<string, string> = {
  miss: 'THE ROCK THAT MISSED', world: 'NO WINTER, EVER', locals: 'THE LOCALS', sea: "DON'T SWIM", mammals: 'WHERE ARE THE MAMMALS?', minds: 'THE SMART ONES', danger: 'AFTER DARK', twist: 'WAKE UP',
};
const L = LINES as any[];
const CH_START = Object.keys(CHAPTERS).map((c, i) => ({ c, n: i + 1, s: L.find((l) => l.chapter === c).start }));
const NAMES: Record<string, [string, string]> = { YOU: ['YOU', TEAL], TROOD: ['TROOD · TROODONT', PINK], PIP: ['PIP · TINY PRIMATE', '#b8743a'], CROW: ['THE CROW', '#2a2a3a'], DOC: ['YOUR SISTER', '#d8a000'] };
const tl = require('./timeline.json');
const END_AT = tl.voice_end + .4;
const k = (key: string) => L.find((l) => l.key === key).start;

/* NEW ep07 finish: risograph paper, halftone screen, grain */
const Paper = () => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .22 }}>
  <svg width="100%" height="100%"><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves={2} seed={3} /><feColorMatrix type="matrix" values="0 0 0 0 .86  0 0 0 0 .8  0 0 0 0 .7  0 0 0 1.6 -.55" /></filter><rect width="100%" height="100%" filter="url(#pp)" /></svg>
</AbsoluteFill>;
const Halftone: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .07 }}>
  <svg width="100%" height="100%"><defs><pattern id="ht" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform={`rotate(15) translate(${(f % 3) * .6} 0)`}><circle cx={4.5} cy={4.5} r={2.2} fill="#233a73" /></pattern>
    <radialGradient id="htm"><stop offset=".45" stopColor="#000" /><stop offset="1" stopColor="#fff" /></radialGradient><mask id="htk"><rect width="100%" height="100%" fill="url(#htm)" /></mask></defs>
    <rect width="100%" height="100%" fill="url(#ht)" mask="url(#htk)" /></svg>
</AbsoluteFill>;
const Grain: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .12 }}>
  <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
</AbsoluteFill>;
const Mis: React.FC<{ children: React.ReactNode; f: string; s: number; c?: string; c2?: string; T: number; style?: React.CSSProperties }> = ({ children, f, s, c = PAPER, c2 = PINK, T, style }) => <div style={{ position: 'relative', fontFamily: f, fontSize: s, lineHeight: .95, ...style }}>
  <div style={{ position: 'absolute', left: 6 + Math.sin(T * 1.7) * 2, top: 5, color: c2, opacity: .9, whiteSpace: 'pre' }}>{children}</div>
  <div style={{ position: 'relative', color: c, whiteSpace: 'pre' }}>{children}</div>
</div>;

/* hook: the first frames must grab */
const Hook: React.FC<{ T: number }> = ({ T }) => {
  if (T > 4.3) return null;
  const a = spring(prog(T, .2, .8) * 1.2, 11, .45), o = 1 - prog(T, 3.7, 4.3);
  return <div style={{ position: 'absolute', left: 70, top: 60, opacity: o, transform: `rotate(-2deg) translateX(${(1 - a) * -80}px)` }}>
    <div style={{ display: 'inline-block', background: NAVY, color: PAPER, fontFamily: 'RubikMono', fontSize: 30, padding: '10px 22px', borderRadius: 30 }}>DAY 1 · THE ASTEROID MISSED</div>
    <Mis f="Dela" s={86} T={T} c={YEL} style={{ marginTop: 14, opacity: clamp(a * 2), textShadow: '0 4px 18px rgba(0,0,0,.45)' }}>{'don\'t move.'}</Mis>
  </div>;
};
const Title: React.FC<{ T: number }> = ({ T }) => {
  const s0 = k('o4') + .2; if (T < s0 || T > s0 + 5.8) return null;
  const a = spring(prog(T, s0, s0 + .6) * 1.2, 10, .5), b = spring(prog(T, s0 + .8, s0 + 1.4) * 1.2, 9, .45), o = 1 - prog(T, s0 + 5.2, s0 + 5.8);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o }}>
    <div style={{ background: YEL, color: NAVY, fontFamily: 'RubikMono', fontSize: 36, padding: '10px 26px', borderRadius: 40, transform: `rotate(-3deg) scale(${a})`, marginBottom: 18 }}>WHAT IF</div>
    <Mis f="Dela" s={150} T={T} style={{ textAlign: 'center', transform: `scale(${.8 + .2 * a})`, textShadow: '0 8px 40px rgba(0,0,0,.5)' }}>{'THE DINOSAURS\nNEVER WENT\nEXTINCT?'}</Mis>
    <div style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 52, color: YEL, marginTop: 14, transform: `scale(${1.3 - .3 * b}) rotate(-2deg)`, opacity: clamp(b * 3) }}>a field trip to Earth B</div>
  </AbsoluteFill>;
};
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.9 && T < x.s + .6); if (!c) return null;
  const a = spring(prog(T, c.s - 1.9, c.s - 1.3) * 1.2, 11, .55), o = 1 - prog(T, c.s + .2, c.s + .6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(35,58,115,${.35 * clamp(a * 2)})` }}>
    <div style={{ position: 'relative', transform: `rotate(${-3 + (1 - a) * 10}deg) scale(${.6 + .4 * a})` }}>
      <div style={{ position: 'absolute', inset: 0, background: PINK, transform: 'translate(14px, 12px)', borderRadius: 26 }} />
      <div style={{ position: 'relative', background: PAPER, border: `6px solid ${NAVY}`, borderRadius: 26, padding: '26px 60px 30px', textAlign: 'center',
        backgroundImage: `radial-gradient(${NAVY}22 2px, transparent 2.5px)`, backgroundSize: '14px 14px' }}>
        <div style={{ fontFamily: 'RubikMono', fontSize: 34, color: PINK, letterSpacing: 4 }}>FIELD NOTE {String(c.n).padStart(2, '0')}</div>
        <div style={{ fontFamily: 'Dela', fontSize: 92, color: NAVY, whiteSpace: 'nowrap', lineHeight: 1.05 }}>{CHAPTERS[c.c]}</div>
      </div>
    </div>
  </AbsoluteFill>;
};
const ERAS: [number, string, string, string][] = [[4.3, 'EARTH B', 'no asteroid', PINK], [k('t1') - .3, 'EARTH A', 'our world', TEAL]];
const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 4.3 || T > END_AT + .5) return null;
  let e = ERAS[0]; let s0 = 0; ERAS.forEach((x) => { if (T >= x[0]) { e = x; s0 = x[0]; } });
  const st = spring(prog(T, s0, s0 + .5) * 1.2, 12, .5);
  return <div style={{ position: 'absolute', top: 34, right: 40, transform: `rotate(${4 + Math.sin(T * .8) * 1.2}deg) scale(${T - s0 < 1 ? 1.3 - .3 * st : 1})`, opacity: 1 - prog(T, END_AT, END_AT + .5) }}>
    <div style={{ position: 'absolute', inset: 0, background: NAVY, transform: 'translate(7px,7px)', borderRadius: 18 }} />
    <div style={{ position: 'relative', background: e[3], borderRadius: 18, padding: '10px 22px', border: `4px solid ${NAVY}`, textAlign: 'center' }}>
      <div style={{ fontFamily: 'Dela', fontSize: 34, color: PAPER, lineHeight: 1 }}>{e[1]}</div>
      <div style={{ fontFamily: 'RubikMono', fontSize: 16, color: PAPER, marginTop: 4 }}>{e[2]}</div>
    </div>
  </div>;
};
const CUES = (() => {
  const out: { s: number; e: number; spk: string; text: string }[] = [];
  L.forEach((l) => {
    const w = l.text.split(' '); const ch: string[][] = []; let cur: string[] = [];
    w.forEach((x: string) => { cur.push(x); if (cur.length >= 8 || (cur.length >= 4 && /[.,?!:]$/.test(x))) { ch.push(cur); cur = []; } }); if (cur.length) ch.push(cur);
    const tot = ch.reduce((a, c) => a + c.join(' ').length, 0); let t = l.start;
    ch.forEach((c) => { const d = (l.end - l.start) * c.join(' ').length / tot; out.push({ s: t, e: t + d, spk: l.speaker, text: c.join(' ') }); t += d; });
  });
  return out;
})();
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const c = CUES.find((x) => T >= x.s && T < x.e + .15); if (!c || T > END_AT) return null;
  const nm = NAMES[c.spk]; const pp = spring(prog(T, c.s, c.s + .25) * 1.2, 14, .6);
  return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 54, display: 'flex', justifyContent: 'center' }}>
    <div style={{ position: 'relative', maxWidth: 1500, transform: `scale(${.94 + .06 * pp})` }}>
      <div style={{ position: 'absolute', inset: 0, background: nm ? nm[1] : NAVY, transform: 'translate(8px,8px)', borderRadius: 16 }} />
      <div style={{ position: 'relative', background: nm ? PAPER : NAVY, border: `4px solid ${NAVY}`, borderRadius: 16, padding: nm ? '8px 30px 12px' : '12px 32px 14px', textAlign: 'center' }}>
        {nm && <div style={{ position: 'absolute', top: -26, left: 24, background: nm[1], color: PAPER, fontFamily: 'RubikMono', fontSize: 22, padding: '5px 16px', borderRadius: 20, border: `3px solid ${NAVY}` }}>{nm[0]}</div>}
        <div style={{ fontFamily: 'Grot', fontWeight: 700, fontSize: 44, color: nm ? NAVY : PAPER, lineHeight: 1.15, marginTop: nm ? 8 : 0 }}>{c.text}</div>
      </div>
    </div>
  </div>;
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT) return null;
  const c = spring(prog(T, END_AT + .1, END_AT + .7) * 1.2, 10, .5); const dz = 1 + (T - END_AT) * .035;
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(35,58,115,${.62 * clamp(c * 2)})`, transform: `scale(${dz}) rotate(${Math.sin(T * .9) * .8}deg)` }}>
    <div style={{ fontFamily: 'RubikMono', fontSize: 34, color: YEL, opacity: clamp(c * 2), letterSpacing: 3 }}>YOUR FIELD REPORT</div>
    <Mis f="Dela" s={104} T={T} style={{ textAlign: 'center', transform: `scale(${.75 + .25 * c})`, opacity: clamp(c * 2), marginTop: 10 }}>{'Which world would\nyou rather live in?'}</Mis>
    <div style={{ display: 'flex', gap: 34, marginTop: 44, opacity: clamp((T - END_AT - 1) * 3) }}>
      {[['THEIRS', PINK], ['OURS', TEAL]].map(([n, c2], i) => <div key={n} style={{ fontFamily: 'Dela', fontSize: 48, color: PAPER, background: c2, padding: '12px 40px', borderRadius: 40, border: `5px solid ${NAVY}`, transform: `rotate(${i ? 3 : -3}deg) translateY(${Math.sin(T * 3 + i * 2) * 6}px)` }}>{n}</div>)}
      <div style={{ fontFamily: 'Brico', fontWeight: 800, fontSize: 40, color: PAPER, background: '#c4302b', padding: '16px 34px', borderRadius: 10 }}>SUBSCRIBE</div>
    </div>
    <div style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 44, color: PAPER, marginTop: 30, opacity: clamp((T - END_AT - 1.6) * 3) }}>tell me in the comments ↓</div>
  </AbsoluteFill>;
};

export const Video: React.FC<{ clean?: boolean; off?: string }> = ({ clean, off = '' }) => {
  const f = useCurrentFrame(); const T = f / FPS; (globalThis as any).__OFF = off;
  return <AbsoluteFill style={{ background: '#000' }}>
    <style>{fontFace}</style>
    {SHOTS.map((s, i) => { const a = Math.round(s.a * FPS), b = Math.round(Math.min(s.b, 2000) * FPS); return <Sequence key={i} from={a} durationInFrames={Math.max(1, b - a)}><Inner render={s.render} a={s.a} /></Sequence>; })}
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .45 }}><Img src={staticFile('paper.png')} style={{ width: 1920, height: 1080 }} /></AbsoluteFill>
    {!clean && <><Captions T={T} /><Hook T={T} /><Title T={T} /><ChapterCard T={T} /><EraChip T={T} /><Ending T={T} /></>}
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .16 }}><Img src={staticFile(`grain${Math.floor(f / 2) % 6}.png`)} style={{ width: 1920, height: 1080, imageRendering: 'pixelated' }} /></AbsoluteFill>
    <Audio src={staticFile('mix.wav')} />
  </AbsoluteFill>;
};
const Inner: React.FC<{ render: (T: number) => React.ReactNode; a: number }> = ({ render, a }) => { const f = useCurrentFrame(); return <AbsoluteFill>{render(a + f / FPS)}</AbsoluteFill>; };
