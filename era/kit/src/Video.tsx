import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINES, prog, easeOut, spring, clamp, lerp, noise1 } from './lib';
import { S1, S2a, S2b, S3, S4a, S4b, S4c, S5, S6, S7, S8, S9, S10 } from './shots';

const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}`;
const AMBER = '#ffb347', BONE = '#f4ead8', INK = '#120d0a';

// [component, start, end, css grade]
const SHOTS: [React.FC<any>, number, number, string][] = [
  [S1, 0, 3.85, 'saturate(1.05)'], [S2a, 3.85, 6.6, 'none'], [S2b, 6.6, 9.87, 'none'], [S3, 9.87, 13.96, 'saturate(.8)'],
  [S4a, 13.96, 15.6, 'none'], [S4b, 15.6, 17.0, 'none'], [S4c, 17.0, 18.93, 'none'], [S5, 18.93, 23.08, 'none'],
  [S6, 23.08, 28.23, 'none'], [S7, 28.23, 33.73, 'none'], [S8, 33.73, 38.78, 'none'], [S9, 38.78, 43.55, 'none'], [S10, 43.55, 60, 'none'],
];

const Shot: React.FC<{ C: React.FC<any>; start: number; grade: string }> = ({ C, start, grade }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  return <AbsoluteFill style={{ filter: grade }}><C t={t} T={start + t} /></AbsoluteFill>;
};

/* ---------- overlay pieces ---------- */
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .22 }}>
    <svg width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
  </AbsoluteFill>
);
const Vignette = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,.62) 100%)' }} />;

const Title: React.FC<{ T: number }> = ({ T }) => {
  const a = .8 + .2 * spring(prog(T, 0, .6) * 1.2, 10, .5), b = spring(prog(T, 1.9, 2.5) * 1.2, 10, .5);
  const out = 1 - prog(T, 3.6, 3.85);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 420, opacity: out, background: 'linear-gradient(180deg, rgba(10,6,4,.55) 0%, rgba(10,6,4,.35) 45%, rgba(0,0,0,0) 62%)' }}>
      <div style={{ fontFamily: 'Mono', fontSize: 34, letterSpacing: 8, color: AMBER, opacity: clamp(a), marginBottom: 18 }}>IF YOU WERE BORN</div>
      <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 168, lineHeight: .88, color: BONE, textAlign: 'center', transform: `scale(${.7 + .3 * a})`, opacity: clamp(a * 2), textShadow: '0 8px 40px rgba(0,0,0,.55)' }}>
        20,000<br />YEARS AGO</div>
      <div style={{ marginTop: 46, fontFamily: 'Brico', fontWeight: 700, fontStretch: '85%', fontSize: 64, color: INK, background: AMBER, padding: '10px 26px', transform: `translateY(${(1 - b) * 40}px) rotate(-1.5deg)`, opacity: clamp(b * 3) }}>
        THIS IS YOUR LIFE.</div>
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ T: number; t0: number; t1: number; lines: string[]; top?: number; left?: number }> = ({ T, t0, t1, lines, top = 300, left = 80 }) => {
  if (T < t0 - .1 || T > t1 + .3) return null;
  const a = spring(prog(T, t0, t0 + .5) * 1.2, 11, .55), o = 1 - prog(T, t1, t1 + .3);
  return (
    <div style={{ position: 'absolute', top, left, opacity: o, transform: `translateX(${(1 - a) * -60}px)` }}>
      <div style={{ fontFamily: 'Mono', fontSize: 30, color: INK, background: BONE, padding: '14px 22px 12px', borderLeft: `10px solid ${AMBER}`, boxShadow: '0 10px 30px rgba(0,0,0,.4)' }}>
        {lines.map((l, i) => <div key={i} style={{ opacity: clamp((T - t0 - i * .18) * 4), fontSize: i === 0 ? 24 : 32, letterSpacing: i === 0 ? 4 : 1, color: i === 0 ? '#8a5a35' : INK, lineHeight: 1.35 }}>{l}</div>)}
      </div>
    </div>
  );
};

const EraChip: React.FC<{ T: number }> = ({ T }) => {
  if (T < 3.85) return null;
  const era = T < 43.55 ? ['ICE AGE', '20,000 YA'] : ['TODAY', '0 YA'];
  const flip = T < 43.55 ? prog(T, 3.85, 4.2) : prog(T, 43.55, 43.95);
  return (
    <div style={{ position: 'absolute', top: 150, right: 70, fontFamily: 'Mono', textAlign: 'right', color: BONE, textShadow: '0 2px 10px rgba(0,0,0,.6)', opacity: T > 47.9 ? 1 - prog(T, 47.9, 48.2) : 1 }}>
      <div style={{ fontSize: 24, letterSpacing: 5, opacity: .85 }}>{era[0]}</div>
      <div style={{ fontSize: 46, color: AMBER, transform: `translateY(${(1 - easeOut(flip)) * 20}px)` }}>{era[1]}</div>
    </div>
  );
};

// phrase captions with active-word highlight
const PHRASES = LINES.flatMap((l) => {
  const parts = l.text.match(/[^.,?!]+[.,?!]*/g)!.map((s) => s.trim()).filter(Boolean);
  const tot = parts.reduce((a, p) => a + p.length, 0); let t = l.start;
  return parts.map((p) => { const d = (l.end - l.start) * p.length / tot; const o = { key: l.key, text: p, start: t, end: t + d }; t += d; return o; });
});
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const ph = PHRASES.find((p) => T >= p.start - .05 && T < p.end + .25);
  if (!ph || ph.key === 'hook' || ph.key === 'cta') return null;
  const words = ph.text.split(' '); const tot = words.reduce((a, w) => a + w.length + 1, 0); let acc = 0;
  const pop = spring(prog(T, ph.start - .05, ph.start + .2) * 1.2, 12, .5);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 430 }}>
      <div style={{ maxWidth: 900, textAlign: 'center', fontFamily: 'Brico', fontWeight: 760, fontStretch: '88%', fontSize: 66, lineHeight: 1.08, transform: `scale(${.92 + .08 * pop})`, background: 'rgba(22,15,11,.78)', padding: '14px 28px 18px', borderRadius: 18, boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}>
        {words.map((w, i) => { const ws = ph.start + (ph.end - ph.start) * acc / tot; acc += w.length + 1; const on = T >= ws;
          return <span key={i} style={{ color: on ? (/ice|half|fast|fire|reindeer|hungry|mammoth|stories|books|sixties|seventies|hand|red|today|yours/i.test(w) ? AMBER : BONE) : 'rgba(244,234,216,.5)' }}>{w} </span>; })}
      </div>
    </AbsoluteFill>
  );
};

const Ending: React.FC<{ T: number }> = ({ T }) => {
  const c = spring(prog(T, 48.0, 48.6) * 1.2, 10, .5);
  if (T < 47.9) return null;
  return <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(10,7,5,${.55 * clamp((T - 47.9) * 3)})` }}>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 150, lineHeight: .9, color: BONE, textAlign: 'center', transform: `scale(${.7 + .3 * c})`, opacity: clamp(c * 2), textShadow: '0 6px 30px rgba(0,0,0,.7)' }}>WHICH ERA<br /><span style={{ color: AMBER }}>NEXT?</span></div>
    <div style={{ marginTop: 40, fontFamily: 'Mono', fontSize: 38, color: INK, background: BONE, padding: '12px 26px', opacity: clamp((T - 48.6) * 3) }}>COMMENT YOUR ERA ↓</div>
  </AbsoluteFill>;
};

const Src: React.FC<{ t: string }> = ({ t }) => <div style={{ position: 'absolute', top: 480, left: 80, fontFamily: 'Mono', fontSize: 22, color: BONE, opacity: .85, textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>{t}</div>;

export const Video: React.FC = () => {
  const f = useCurrentFrame(); const T = f / FPS;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{fontFace}</style>
      {SHOTS.map(([C, s, e, g], i) => (
        <Sequence key={i} from={Math.round(s * FPS)} durationInFrames={Math.round((e - s) * FPS)}>
          <Shot C={C} start={s} grade={g} />
        </Sequence>))}
      <Vignette />
      <Title T={T} />
      <EraChip T={T} />
      <Tag T={T} t0={4.3} t1={6.5} lines={['YOUR BAND', 'a few dozen people', 'nomadic hunter-gatherers']} top={330} />
      <Tag T={T} t0={10.6} t1={13.8} lines={['CHILDHOOD SURVIVAL', '≈ 1 in 2 died', 'before adulthood*']} top={330} />
      <Tag T={T} t0={34.2} t1={38.6} lines={['IF YOU MAKE IT TO 15', 'many live to', 'their 60s–70s*']} top={330} />
      <Tag T={T} t0={39.4} t1={43.3} lines={['HAND STENCIL', 'red ochre, blown', 'around your hand']} top={330} />
      <Captions T={T} />
      <Ending T={T} />
      {T > 10.6 && T < 13.8 && <Src t='*hunter-gatherer studies (Volk & Atkinson 2013)' />}
      {T > 34.2 && T < 38.6 && <Src t='*forager life spans (Gurven & Kaplan 2007)' />}
      <Grain f={f} />
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
