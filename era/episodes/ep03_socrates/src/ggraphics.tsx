import React from 'react';
import { clamp, lerp, easeOut, spring, prog, rng } from './lib';
import { P } from './art';
import { Txt } from './graphics';
import { GR, Meander } from './greek';
import { MChar, CAST } from './chars';

/* All explainer graphics share the red-figure look: black glaze, terracotta, bone. Every one keeps moving (QC lesson from ep02). */
const BONE = '#f2e6cc', T1 = GR.terra, BG = GR.black;
const Glaze: React.FC<{ children: React.ReactNode; T: number; title: string; foot?: string }> = ({ children, T, title, foot }) => {
  const R = rng(4);
  return <g>
    <rect x={-300} y={-200} width={2520} height={1500} fill={BG} />
    {Array.from({ length: 40 }).map((_, i) => { const x = R() * 1920, y = R() * 1080, sp = .3 + R() * .7; return <circle key={i} cx={(x + T * 12 * sp) % 1960 - 20} cy={y + Math.sin(T * sp + i) * 10} r={1.5 + R() * 2.5} fill={T1} opacity={.18 + .12 * Math.sin(T * 2 + i)} />; })}
    <Meander x={60} y={40} w={1800} c={T1} /><Meander x={60} y={1010} w={1800} c={T1} />
    <Txt x={960} y={150} s={64} c={BONE}>{title}</Txt>
    {children}
    {foot && <Txt x={960} y={205} s={22} f="Mono" c="#b8a888">{foot}</Txt>}
  </g>;
};
const Person: React.FC<{ x: number; y: number; s?: number; c: string; o?: number }> = ({ x, y, s = 1, c, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}><circle cx={0} cy={-34} r={13} fill={c} /><path d="M -16 0 C -16 -22 16 -22 16 0 Z" fill={c} /></g>
);

export const DemocracyDots: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const cols = 20, rows = 5;
  return <Glaze T={T} title="WHO COULD VOTE IN ATHENS?" foot="Estimates for Attica, c. 430 BC: ~30,000 citizen men out of ~250,000+ people (M. H. Hansen 1991)">
    {Array.from({ length: cols * rows }).map((_, i) => { const c = i % cols, r = Math.floor(i / cols); const voter = (c * 7 + r * 3) % 8 === 0; const a = clamp((t - i * .012) * 3);
      const hl = t > 3; return <Person key={i} x={330 + c * 66} y={330 + r * 110 + (voter && hl ? -8 - Math.sin(T * 3 + i) * 5 : 0)} s={1.25 * spring(a, 10, .5)} c={voter && hl ? T1 : '#8a7a62'} o={hl && !voter ? .45 : 1} />; })}
    <g opacity={clamp((t - 3.2) * 2)}>
      <rect x={300} y={820} width={600} height={90} rx={12} fill={T1} /><Txt x={600} y={880} s={40} c={BG}>VOTERS ≈ 1 IN 8</Txt>
      <Txt x={1300} y={862} s={30} f="Mono" c={BONE}>NO VOTE: WOMEN · SLAVES</Txt><Txt x={1300} y={904} s={30} f="Mono" c={BONE}>FOREIGNERS · CHILDREN</Txt>
    </g>
  </Glaze>;
};
export const Plague: React.FC<{ t: number; T: number }> = ({ t, T }) => (
  <Glaze T={T} title="THE PLAGUE OF ATHENS · 430 BC" foot="Thucydides, History 2.47–54 · modern estimates: roughly 25% of the population died">
    {[0, 1, 2, 3].map((k) => { const dead = k === 2 && t > 2.4; const a = spring(clamp(t * 2 - k * .3), 10, .5);
      return <g key={k} transform={`translate(${480 + k * 320} ${720 + (dead ? clamp((t - 2.4) * 2) * 30 : 0)}) scale(${2.4 * a})`}><Person x={0} y={0} s={2.2} c={dead ? '#a8322a' : '#8a7a62'} o={dead ? 1 - clamp((t - 2.4) * .8) * .7 : .8} /></g>; })}
    <g opacity={clamp((t - 2.8) * 2)}><Txt x={960} y={330} s={110} c={T1}>UP TO 1 IN 4 DIED</Txt><Txt x={960} y={400} s={34} f="Mono" c={BONE}>INCLUDING PERICLES, 429 BC</Txt></g>
    {Array.from({ length: 14 }).map((_, i) => { const R = rng(i + 30); return <circle key={i} cx={R() * 1920} cy={(R() * 1080 + T * 30) % 1080} r={20 + R() * 40} fill="#6a5a3a" opacity={.08} />; })}
  </Glaze>
);
export const SocraticLoop: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const steps = ['CLAIM', 'QUESTION', 'CONTRADICTION', 'BETTER CLAIM'], cx = 960, cy = 570, R0 = 300;
  const act = Math.floor(T * .9) % 4;
  return <Glaze T={T} title="THE SOCRATIC METHOD" foot="Called elenchus: testing an idea by questioning it (Plato, Laches · Euthyphro)">
    <circle cx={cx} cy={cy} r={R0} fill="none" stroke={T1} strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-T * 40} opacity={clamp(t * 2)} />
    {steps.map((s, k) => { const a = -Math.PI / 2 + k * Math.PI / 2; const x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0; const on = act === k; const sc = spring(clamp(t * 2 - k * .25), 10, .5);
      return <g key={k} transform={`translate(${x} ${y}) scale(${sc * (on ? 1.12 : 1)})`}><rect x={-200} y={-50} width={400} height={92} rx={46} fill={on ? T1 : '#2a201a'} stroke={T1} strokeWidth={5} /><Txt x={0} y={12} s={s.length > 10 ? 36 : 44} c={on ? BG : BONE}>{s}</Txt></g>; })}
    <g opacity={clamp(t - .6)}><Txt x={cx} y={cy - 10} s={140} c={T1}>?</Txt><Txt x={cx} y={cy + 60} s={28} f="Mono" c={BONE}>REPEAT</Txt></g>
  </Glaze>;
};
export const Rewind: React.FC<{ t: number; T: number; d: number }> = ({ t, T, d }) => {
  const ev: [number, string][] = [[470, 'SOCRATES BORN'], [435, 'YOU ARE BORN'], [430, 'PLAGUE'], [423, 'THE CLOUDS'], [416, 'SYMPOSIUM'], [404, 'WAR LOST'], [399, 'THE TRIAL']];
  const X = (y: number) => 240 + (470 - y) / 71 * 1440;
  const yr = lerp(399, 435, easeOut(clamp(t / (d * .85))));
  return <Glaze T={T} title="REWIND">
    <line x1={200} y1={600} x2={1720} y2={600} stroke={BONE} strokeWidth={8} />
    {ev.map(([y, l], k) => <g key={k}><line x1={X(y)} y1={580} x2={X(y)} y2={620} stroke={BONE} strokeWidth={6} /><Txt x={X(y)} y={k % 2 ? 690 : 540} s={26} f="Mono" c={y === 435 ? T1 : '#b8a888'}>{l}</Txt><Txt x={X(y)} y={k % 2 ? 730 : 500} s={30} c={BONE}>{`${y} BC`}</Txt></g>)}
    <g transform={`translate(${X(yr)} 600)`}><circle r={30} fill={T1} stroke={BONE} strokeWidth={6} /><circle r={50 + (T * 40) % 30} fill="none" stroke={T1} strokeWidth={4} opacity={.6} /></g>
    <Txt x={960} y={900} s={110} c={T1}>{`${Math.round(yr)} BC`}</Txt>
  </Glaze>;
};
export const Kleroterion: React.FC<{ t: number; T: number }> = ({ t, T }) => (
  <Glaze T={T} title="THE KLEROTERION" foot="Allotment machine for picking jurors at random (Aristotle, Ath. Pol. 63–66; fragments in the Athenian Agora Museum)">
    <g transform="translate(760 560)">
      <path d="M -260 -320 L 200 -320 L 220 380 L -280 380 Z" fill="#cfc4ae" stroke={P.ink} strokeWidth={8} />
      {Array.from({ length: 11 * 5 }).map((_, i) => { const c = i % 5, r = Math.floor(i / 5); const filled = (i * 7) % 3 !== 0; return <g key={i}><rect x={-230 + c * 80} y={-290 + r * 58} width={60} height={30} rx={4} fill="#3a3640" />{filled && <rect x={-226 + c * 80} y={-286 + r * 58} width={52} height={22} rx={3} fill={BONE} opacity={clamp(t * 2 - r * .1)} />}</g>; })}
      <rect x={200} y={-300} width={40} height={660} rx={20} fill="#3a3640" stroke={P.ink} strokeWidth={6} />
      {Array.from({ length: 9 }).map((_, k) => { const y = -280 + ((T * 140 + k * 74) % 640); return <circle key={k} cx={220} cy={y} r={16} fill={k % 3 ? '#fff' : '#111'} stroke={T1} strokeWidth={3} />; })}
    </g>
    <g opacity={clamp((t - 1.5) * 2)}>
      <circle cx={1360} cy={460} r={18} fill="#fff" stroke={T1} strokeWidth={4} /><Txt x={1400} y={472} s={34} f="Mono" c={BONE} a="start">WHITE = ROW SERVES</Txt>
      <circle cx={1360} cy={540} r={18} fill="#111" stroke={T1} strokeWidth={4} /><Txt x={1400} y={552} s={34} f="Mono" c={BONE} a="start">BLACK = ROW GOES HOME</Txt>
      <Txt x={1500} y={680} s={60} c={T1}>NO BRIBES</Txt><Txt x={1500} y={740} s={60} c={T1}>IN ADVANCE</Txt>
    </g>
  </Glaze>
);
export const JuryVote: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const cols = 29, N = 501;
  return <Glaze T={T} title="THE VERDICT · 501 JURORS" foot="Plato, Apology 36a: “if only thirty votes had gone the other way, I would have been acquitted”">
    {Array.from({ length: N }).map((_, i) => { const c = i % cols, r = Math.floor(i / cols); const shown = clamp((t * 260 - i) / 20); const guilty = i < 280; const swing = i >= 250 && i < 280 && t > 3.2;
      return <circle key={i} cx={500 + c * 32} cy={290 + r * 32} r={12 * shown + (swing ? 2 * Math.sin(T * 6) : 0)} fill={guilty ? (swing ? '#f2c060' : T1) : BONE} opacity={.95} />; })}
    <g opacity={clamp((t - 2.2) * 2)}>
      <rect x={110} y={330} width={250} height={130} rx={12} fill={T1} /><Txt x={235} y={390} s={60} c={BG}>280</Txt><Txt x={235} y={440} s={28} f="Mono" c={BG}>GUILTY</Txt>
      <rect x={1560} y={330} width={250} height={130} rx={12} fill={BONE} /><Txt x={1685} y={390} s={60} c={BG}>220</Txt><Txt x={1685} y={440} s={28} f="Mono" c={BG}>NOT GUILTY</Txt>
    </g>
    <g opacity={clamp((t - 3.4) * 2)}><Txt x={960} y={940} s={44} c="#f2c060">ONLY 30 VOTES FROM FREEDOM</Txt></g>
  </Glaze>;
};
export const Sophists: React.FC<{ t: number; T: number }> = ({ t, T }) => (
  <Glaze T={T} title="PAID TEACHERS vs. SOCRATES" foot="Protagoras reportedly charged 100 minas for a course (Diogenes Laertius 9.52) · Socrates: Plato, Apology 19d–20c">
    <g transform="translate(560 560)" opacity={clamp(t * 2)}>
      {Array.from({ length: 14 }).map((_, k) => <ellipse key={k} cx={-120 + (k % 5) * 60} cy={120 - Math.floor(k / 5) * 34 - (k === 13 ? Math.abs(Math.sin(T * 3)) * 30 : 0)} rx={30} ry={12} fill="#e0b040" stroke={P.ink} strokeWidth={4} />)}
      <Txt x={0} y={-150} s={64} c={BONE}>SOPHISTS</Txt><Txt x={0} y={260} s={44} c="#e0b040">“100 MINAS, PLEASE”</Txt>
    </g>
    <line x1={960} y1={260} x2={960} y2={900} stroke={T1} strokeWidth={4} strokeDasharray="12 10" />
    <g transform="translate(1360 560)" opacity={clamp((t - 1) * 2)}>
      <Txt x={0} y={-150} s={64} c={BONE}>SOCRATES</Txt><Txt x={0} y={60} s={160} c={T1} o={.8 + .2 * Math.sin(T * 3)}>FREE</Txt><Txt x={0} y={260} s={44} c={BONE}>“ANYONE CAN ASK”</Txt>
    </g>
  </Glaze>
);
export const LegacyChain: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const P4 = [['soc', 'SOCRATES', 'c. 470–399 BC'], ['platoOld', 'PLATO', 'c. 427–347 BC'], ['aristotle', 'ARISTOTLE', '384–322 BC'], ['alex', 'ALEXANDER', '356–323 BC']];
  return <Glaze T={T} title="TEACHER → STUDENT" foot="Plato founded the Academy c. 387 BC · Aristotle studied there ~20 years, then tutored Alexander (343 BC)">
    {P4.map(([k, n, d], i) => { const x = 330 + i * 420; const a = spring(clamp(t * 1.2 - i * .45), 10, .5);
      return <g key={k}>
        {i > 0 && <path d={`M ${x - 330} 560 L ${x - 120} 560`} stroke={T1} strokeWidth={10} pathLength={1} strokeDasharray={`${clamp(t * 1.2 - i * .45)} 1`} />}
        {i > 0 && clamp(t * 1.2 - i * .45) > .95 && <path d={`M ${x - 140} 540 L ${x - 112} 560 L ${x - 140} 580`} fill={T1} />}
        <g transform={`translate(${x} 640) scale(${a})`}><circle cx={0} cy={-90} r={140} fill="#2a201a" stroke={T1} strokeWidth={6} /><MChar look={CAST[k]} x={0} y={170 + Math.sin(T * 2 + i) * 4} s={.9} pose={{ mouth: 'smile', blink: ((T + i) % 4) < .12 ? 1 : 0 }} /></g>
        <Txt x={x} y={850} s={44} c={BONE} o={a}>{n}</Txt><Txt x={x} y={895} s={26} f="Mono" c="#b8a888" o={a}>{d}</Txt>
      </g>; })}
  </Glaze>;
};
