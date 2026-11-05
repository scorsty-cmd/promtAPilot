import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, easeOut, spring, clamp } from './lib';
import { SHOTS } from './shots';

const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}`;
const AMBER = '#ffb347', BONE = '#f4ead8', INK = '#120d0a';

const CHAPTERS: Record<string, string> = {
  birth: 'YOUR FIRST DAYS', home: 'YOUR HOME', city: 'YOUR CITY', maize: 'MAIZE & MONEY', ball: 'THE BALLGAME',
  fear: 'WHAT YOU FEAR', sky: 'STARS & SIGNS', kings: 'KINGS & GODS', rain: 'WHEN THE RAIN STOPPED', today: 'STILL HERE',
};
const CH_START = Object.keys(CHAPTERS).map((c, i) => ({ c, n: i + 1, s: (LINES as any[]).find((l) => l.chapter === c).start }));

const DRIFT = [60.7, 93.2, 127.2, 300.4, 309.8, 365.1, 384.9, 401.0, 440.0, 458.5, 476.1];
const Shot: React.FC<{ C: React.FC<any>; start: number; end: number }> = ({ C, start, end }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const inner = <C t={t} T={start + t} d={end - start} />;
  if (!DRIFT.includes(start)) return <AbsoluteFill>{inner}</AbsoluteFill>;
  // slow "breathing" camera + travelling light so long explanatory shots never feel frozen
  const d = end - start, k = t / d, z = 1.03 + .05 * k, dx = Math.sin(t * .5) * 14, dy = Math.cos(t * .37) * 9;
  const lx = 10 + 80 * k;
  return <AbsoluteFill>
    <AbsoluteFill style={{ transform: `translate(${dx}px,${dy}px) scale(${z})`, transformOrigin: '50% 50%' }}>{inner}</AbsoluteFill>
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'soft-light', background: `radial-gradient(ellipse 45% 70% at ${lx}% 40%, rgba(255,230,190,.55), rgba(0,0,0,.25) 70%)` }} />
  </AbsoluteFill>;
};
const Paper = () => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: .16 }}>
  <svg width="100%" height="100%"><filter id="pp"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves={4} seed={11} /><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .32  0 0 0 1.2 -.2" /></filter><rect width="100%" height="100%" filter="url(#pp)" /></svg>
</AbsoluteFill>;
const Grain: React.FC<{ f: number }> = ({ f }) => <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .16 }}>
  <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
</AbsoluteFill>;
const Vignette = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.5) 100%)' }} />;

const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T > 5.2) return null;
  const a = .85 + .15 * spring(prog(T, 0, .6) * 1.2, 10, .5), b = spring(prog(T, 1.0, 1.6) * 1.2, 10, .5), o = 1 - prog(T, 4.7, 5.2);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(10,6,4,.45), rgba(0,0,0,0))' }}>
    <div style={{ fontFamily: 'Mono', fontSize: 34, letterSpacing: 10, color: AMBER, marginBottom: 10 }}>IF YOU WERE BORN</div>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 210, lineHeight: .9, color: BONE, transform: `scale(${a})`, textShadow: '0 8px 40px rgba(0,0,0,.6)' }}>MAYA</div>
    <div style={{ marginTop: 26, fontFamily: 'Brico', fontWeight: 700, fontStretch: '85%', fontSize: 50, color: INK, background: AMBER, padding: '8px 26px', transform: `translateY(${(1 - b) * 30}px) rotate(-1.2deg)`, opacity: clamp(b * 3) }}>A LIFE IN TIKAL · c. AD 750</div>
  </AbsoluteFill>;
};
const ChapterCard: React.FC<{ T: number }> = ({ T }) => {
  const c = CH_START.find((x) => T > x.s - 1.9 && T < x.s + .6); if (!c) return null;
  const a = spring(prog(T, c.s - 1.9, c.s - 1.4) * 1.2, 11, .5), o = 1 - prog(T, c.s + .2, c.s + .6);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(18,13,10,${.72 * clamp(a * 2)})` }}>
    <div style={{ fontFamily: 'Mono', fontSize: 34, letterSpacing: 10, color: AMBER, opacity: clamp(a * 2) }}>CHAPTER {c.n}</div>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '80%', fontSize: 120, color: BONE, transform: `scale(${.85 + .15 * a})`, opacity: clamp(a * 2), textAlign: 'center' }}>{CHAPTERS[c.c]}</div>
    <div style={{ width: 300 * a, height: 10, background: '#b5432a', marginTop: 18, borderRadius: 5 }} />
  </AbsoluteFill>;
};
const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 5.2) return null;
  const today = T >= 434.4, late = T >= 381.5 && !today;
  const era = today ? ['MAYA WORLD', 'TODAY'] : late ? ['TERMINAL CLASSIC', 'c. AD 800–950'] : ['LATE CLASSIC MAYA', 'c. AD 750'];
  return <div style={{ position: 'absolute', top: 44, right: 56, fontFamily: 'Mono', textAlign: 'right', color: BONE, textShadow: '0 2px 10px rgba(0,0,0,.7)', opacity: T > 486.3 ? 1 - prog(T, 486.3, 486.8) : 1 }}>
    <div style={{ fontSize: 20, letterSpacing: 5, opacity: .85 }}>{era[0]}</div>
    <div style={{ fontSize: 36, color: AMBER }}>{era[1]}</div>
  </div>;
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  if (T < 486.4) return null;
  const c = spring(prog(T, 486.5, 487.1) * 1.2, 10, .5);
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ fontFamily: 'Mono', fontSize: 34, letterSpacing: 8, color: AMBER, opacity: clamp(c * 2) }}>YOUR TURN</div>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 130, lineHeight: .92, color: BONE, textAlign: 'center', transform: `scale(${.75 + .25 * c})`, opacity: clamp(c * 2), textShadow: '0 6px 30px rgba(0,0,0,.7)' }}>WHICH CIVILIZATION<br /><span style={{ color: AMBER }}>NEXT?</span></div>
    <div style={{ display: 'flex', gap: 30, marginTop: 40, opacity: clamp((T - 487.4) * 3) }}>
      <div style={{ fontFamily: 'Mono', fontSize: 36, color: INK, background: BONE, padding: '14px 30px' }}>COMMENT BELOW ↓</div>
      <div style={{ fontFamily: 'Brico', fontWeight: 800, fontSize: 40, color: BONE, background: '#c4302b', padding: '10px 34px', borderRadius: 10 }}>SUBSCRIBE</div>
    </div>
  </AbsoluteFill>;
};

export const Video: React.FC = () => {
  const f = useCurrentFrame(); const T = f / FPS;
  return <AbsoluteFill style={{ background: '#000' }}>
    <style>{fontFace}</style>
    {SHOTS.map(([C, s, e], i) => <Sequence key={i} from={Math.round(s * FPS)} durationInFrames={Math.max(1, Math.round((Math.min(e, 600) - s) * FPS))}><Shot C={C} start={s} end={e} /></Sequence>)}
    <Paper /><Vignette />
    <Title T={T} /><ChapterCard T={T} /><EraChip T={T} /><Ending T={T} />
    <Grain f={f} />
    <Audio src={staticFile('mix.wav')} />
  </AbsoluteFill>;
};
