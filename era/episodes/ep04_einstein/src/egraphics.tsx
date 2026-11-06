import React from 'react';
import { clamp, lerp, easeOut, easeInOut, spring, prog, rng } from './lib';
import { P } from './art';
import { C } from './sets';
import { MChar, CAST } from './chars';

/* ===== chalkboard explainers — everything keeps moving (drifting chalk dust + slow wipe) ===== */
const CH = C.chalk, AM = '#ffcf6a', RD = '#ff8a6a', BL = '#9fd0e8';
type GP = { t: number; T: number; d: number };
const T_: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; f?: string; children: React.ReactNode }> = ({ x, y, s = 40, c = CH, a = 'middle', o = 1, f = 'Type', children }) =>
  <text x={x} y={y} fontFamily={f} fontSize={s} fill={c} textAnchor={a} opacity={o}>{children}</text>;
const pop = (t: number, a: number) => spring(prog(t, a, a + .6) * 1.2, 10, .5);
const fade = (t: number, a: number) => clamp((t - a) * 3);
export const Board: React.FC<{ t: number; title: string; note?: string; children: React.ReactNode }> = ({ t, title, note, children }) => <g>
  <rect x={-200} y={-200} width={2320} height={1480} fill="#5a3a22" />
  <rect x={40} y={30} width={1840} height={1020} fill={C.slate} stroke={P.ink} strokeWidth={10} />
  {Array.from({ length: 26 }).map((_, i) => { const R = rng(i + 9); return <ellipse key={i} cx={40 + R() * 1840} cy={30 + R() * 1020} rx={80 + R() * 160} ry={18 + R() * 20} fill="#fff" opacity={.035} transform={`rotate(${R() * 30 - 15})`} />; })}
  {Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 70); const y = (R() * 1000 + t * (12 + R() * 18)) % 1000 + 40; return <circle key={'d' + i} cx={60 + R() * 1800 + Math.sin(t + i) * 10} cy={y} r={1.5 + R() * 2} fill="#fff" opacity={.18} />; })}
  <T_ x={960} y={130} s={64} f="Serif" o={fade(t, .1)}>{title}</T_>
  <path d={`M ${960 - 300 * easeOut(prog(t, .2, 1))} 158 L ${960 + 300 * easeOut(prog(t, .2, 1))} 158`} stroke={AM} strokeWidth={4} />
  {children}
  {note && <T_ x={960} y={204} s={24} c="#c8d0c8" o={fade(t, .8) * .9}>{note}</T_>}
  <rect x={40} y={1050} width={1840} height={20} fill="#3a2414" />
</g>;

export const Rewind: React.FC<GP> = ({ t, d }) => {
  const p = easeInOut(prog(t, .3, d - .6)); const yr = Math.round(lerp(1955, 1902, p));
  return <Board t={t} title="REWIND">
    <T_ x={960} y={600} s={260} f="Serif" c={AM}>{yr}</T_>
    <g transform="translate(960 820)"><line x1={-700} y1={0} x2={700} y2={0} stroke={CH} strokeWidth={4} strokeDasharray="14 12" />
      {[1902, 1905, 1915, 1919, 1927, 1933, 1939, 1955].map((y, k) => { const x = lerp(-650, 650, (y - 1902) / 53); return <g key={k}><line x1={x} y1={-14} x2={x} y2={14} stroke={CH} strokeWidth={4} /><T_ x={x} y={56} s={26}>{y}</T_></g>; })}
      <circle cx={lerp(650, -650, p)} cy={0} r={16} fill={AM} />
    </g>
    <g transform="translate(1500 470)"><circle r={90} fill="none" stroke={CH} strokeWidth={5} /><line x1={0} y1={0} x2={Math.sin(-t * 9) * 70} y2={-Math.cos(-t * 9) * 70} stroke={CH} strokeWidth={6} /><line x1={0} y1={0} x2={Math.sin(-t * 1.2) * 46} y2={-Math.cos(-t * 1.2) * 46} stroke={CH} strokeWidth={8} /></g>
  </Board>;
};

export const LightChase: React.FC<GP> = ({ t }) => {
  const v = Math.round(clamp(t / 4) * 150000); const bx = 300 + t * 260;
  return <Board t={t} title="CHASING A BEAM OF LIGHT" note="Maxwell's equations (1860s): light in a vacuum always travels at about 299,792 km/s">
    <g transform="translate(0 430)">
      <line x1={120} y1={60} x2={1800} y2={60} stroke={CH} strokeWidth={3} strokeDasharray="10 14" />
      <path d={`M ${bx + 380} 0 L ${bx + 640} 0`} stroke={AM} strokeWidth={14} strokeLinecap="round" /><path d={`M ${bx + 640} -24 L ${bx + 690} 0 L ${bx + 640} 24 Z`} fill={AM} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${bx + 360 - k * 40} ${-20 + k * 20} l -60 0`} stroke={AM} strokeWidth={4} opacity={.5} />)}
      <g transform={`translate(${bx + 120} 70)`}><MChar look={CAST.you} x={0} y={0} s={.9} pose={{ walk: 1.4, phase: t * 14, expr: 'excited', armF: .8, armB: -.8 }} /></g>
    </g>
    <g transform="translate(560 760)"><T_ x={0} y={0} s={34} c={BL}>YOUR SPEED</T_><T_ x={0} y={80} s={72} f="Serif">{v.toLocaleString('en-US')} km/s</T_></g>
    <g transform="translate(1360 760)"><T_ x={0} y={0} s={34} c={AM}>LIGHT, AS YOU MEASURE IT</T_><T_ x={0} y={80} s={72} f="Serif" c={AM}>299,792 km/s</T_>
      <T_ x={0} y={140} s={30} o={fade(t, 3.2)}>…it never slows down for you</T_></g>
  </Board>;
};

const ClockFace: React.FC<{ x: number; y: number; a: number; r?: number; c?: string }> = ({ x, y, a, r = 80, c = CH }) => <g transform={`translate(${x} ${y})`}>
  <circle r={r} fill="none" stroke={c} strokeWidth={6} />{Array.from({ length: 12 }).map((_, k) => <line key={k} x1={Math.sin(k * Math.PI / 6) * (r - 14)} y1={-Math.cos(k * Math.PI / 6) * (r - 14)} x2={Math.sin(k * Math.PI / 6) * (r - 4)} y2={-Math.cos(k * Math.PI / 6) * (r - 4)} stroke={c} strokeWidth={4} />)}
  <line x1={0} y1={0} x2={Math.sin(a) * (r - 18)} y2={-Math.cos(a) * (r - 18)} stroke={c} strokeWidth={7} strokeLinecap="round" />
</g>;
export const TwoClocks: React.FC<GP> = ({ t }) => {
  const tx = ((t * 380) % 2600) - 500;
  return <Board t={t} title="TIME IS NOT THE SAME FOR EVERYONE" note="Special relativity (1905). At everyday speeds the effect is tiny, but it is real and measured.">
    <g transform="translate(0 0)">
      <T_ x={420} y={300} s={34} c={BL}>CLOCK ON THE PLATFORM</T_>
      <ClockFace x={420} y={440} a={t * 2.4} r={100} />
      <rect x={300} y={560} width={240} height={30} fill="none" stroke={CH} strokeWidth={5} /><line x1={420} y1={540} x2={420} y2={560} stroke={CH} strokeWidth={6} />
      <line x1={80} y1={860} x2={1860} y2={860} stroke={CH} strokeWidth={5} />
      <g transform={`translate(${tx} 0)`}>
        <rect x={0} y={640} width={520} height={200} rx={20} fill="none" stroke={AM} strokeWidth={7} />
        {[0, 1, 2].map((k) => <rect key={k} x={40 + k * 160} y={670} width={120} height={70} fill="none" stroke={AM} strokeWidth={4} />)}
        {[80, 440].map((x) => <circle key={x} cx={x} cy={850} r={26} fill="none" stroke={AM} strokeWidth={6} />)}
        <ClockFace x={260} y={560} a={t * 1.4} r={64} c={AM} />
        <T_ x={260} y={470} s={28} c={AM}>MOVING CLOCK</T_>
        {[1, 2, 3].map((k) => <line key={k} x1={-30 * k} y1={700 + k * 30} x2={-30 * k - 80} y2={700 + k * 30} stroke={AM} strokeWidth={4} opacity={.5} />)}
      </g>
      <T_ x={1400} y={420} s={56} f="Serif" o={fade(t, 1.5)}>moving clocks</T_>
      <T_ x={1400} y={490} s={56} f="Serif" c={AM} o={fade(t, 1.8)}>tick slower</T_>
    </g>
  </Board>;
};

export const Papers1905: React.FC<GP> = ({ t }) => {
  const P5 = [['MARCH', 'Light comes in quanta', '→ Nobel Prize'], ['APRIL', 'Size of molecules', '→ his doctorate'], ['MAY', 'Brownian motion', '→ atoms are real'], ['JUNE', 'Special relativity', '→ time is relative'], ['SEPTEMBER', 'E = mc²', '→ mass is energy']];
  return <Board t={t} title="1905 · THE MIRACLE YEAR" note="Annalen der Physik, 1905 — five papers in about six months, written in his spare time">
    {P5.map(([m, a, b], k) => { const p = pop(t, .4 + k * .5); const x = 230 + k * 365; return <g key={k} transform={`translate(${x} ${560 + Math.sin(t * 1.3 + k) * 8}) scale(${p}) rotate(${(k - 2) * 2})`} opacity={clamp(p * 2)}>
      <rect x={-160} y={-230} width={320} height={420} fill="#f6efdc" stroke={P.ink} strokeWidth={6} />
      <rect x={-160} y={-230} width={320} height={70} fill={k === 3 ? '#b5652e' : '#3a4e5c'} />
      <text x={0} y={-182} fontFamily="Type" fontSize={34} fill="#f6efdc" textAnchor="middle">{m}</text>
      <text x={0} y={-60} fontFamily="Serif" fontSize={40} fill={P.ink} textAnchor="middle">{a.split(' ').slice(0, 2).join(' ')}</text>
      <text x={0} y={-12} fontFamily="Serif" fontSize={40} fill={P.ink} textAnchor="middle">{a.split(' ').slice(2).join(' ')}</text>
      {[0, 1, 2, 3].map((l) => <line key={l} x1={-120} y1={40 + l * 24} x2={120 - (l % 2) * 50} y2={40 + l * 24} stroke="#8a8478" strokeWidth={4} />)}
      <text x={0} y={160} fontFamily="Type" fontSize={28} fill="#7a3b34" textAnchor="middle">{b}</text>
    </g>; })}
  </Board>;
};

export const Emc2: React.FC<GP> = ({ t }) => {
  const f = easeOut(prog(t, 2.5, 6));
  return <Board t={t} title="E = mc²" note="1 gram × (300,000,000 m/s)² = 9 × 10¹³ joules ≈ 21,000 tonnes of TNT">
    <g transform={`translate(420 520) scale(${pop(t, .3)})`}><ellipse rx={70} ry={52} fill="#5a2e3a" stroke={CH} strokeWidth={6} />{[-30, 0, 26].map((k) => <path key={k} d={`M ${k} -40 q 10 40 -4 80`} stroke="#3a1a22" strokeWidth={6} fill="none" />)}</g>
    <T_ x={420} y={660} s={36} o={fade(t, .6)}>1 gram</T_>
    <T_ x={760} y={540} s={90} f="Serif" c={AM} o={fade(t, 1.2)}>×  c²</T_>
    <path d={`M 950 520 L ${950 + 120 * easeOut(prog(t, 1.6, 2.4))} 520`} stroke={CH} strokeWidth={6} />
    <g transform="translate(1180 330)">
      <rect x={0} y={0} width={560} height={300} fill="none" stroke={CH} strokeWidth={5} />
      <rect x={6} y={300 - 294 * f} width={548} height={294 * f} fill={RD} opacity={.75} />
      {Array.from({ length: 10 }).map((_, k) => <line key={k} x1={0} y1={30 * k} x2={20} y2={30 * k} stroke={CH} strokeWidth={3} />)}
      <T_ x={280} y={380} s={44} f="Serif">{Math.round(f * 21000).toLocaleString('en-US')} t of TNT</T_>
    </g>
    <T_ x={960} y={860} s={40} o={fade(t, 5)}>a tiny amount of mass = a huge amount of energy</T_>
  </Board>;
};

export const Elevator: React.FC<GP> = ({ t }) => {
  const fall = (t * 120) % 500;
  return <Board t={t} title="THE HAPPIEST THOUGHT" note="Equivalence principle, 1907: in free fall you cannot feel gravity — so gravity is not an ordinary force">
    <g transform={`translate(560 ${260 + fall * .4})`}>
      <rect x={-170} y={0} width={340} height={440} fill="none" stroke={CH} strokeWidth={7} /><line x1={0} y1={-200} x2={0} y2={0} stroke={CH} strokeWidth={3} strokeDasharray="8 10" opacity={.5} />
      <g transform={`translate(0 ${300 + Math.sin(t * 2) * 14}) rotate(${Math.sin(t) * 10})`}><MChar look={CAST.ein} x={0} y={0} s={.95} pose={{ armF: -2.2, armB: 2.2, elbowF: .3, elbowB: .3, expr: 'surprised', walk: .3, phase: t * 3 }} /></g>
      <circle cx={110} cy={120 + Math.sin(t * 1.6) * 10} r={22} fill={RD} stroke={CH} strokeWidth={4} />
      {[0, 1, 2].map((k) => <line key={k} x1={-120 + k * 120} y1={-40} x2={-120 + k * 120} y2={-110} stroke={AM} strokeWidth={4} opacity={.6} />)}
      <T_ x={0} y={500} s={34} c={AM}>FALLING</T_>
    </g>
    <T_ x={960} y={560} s={120} f="Serif" o={fade(t, 1.4)}>=</T_>
    <g transform="translate(1360 280)">
      <rect x={-170} y={0} width={340} height={440} fill="none" stroke={CH} strokeWidth={7} />
      {Array.from({ length: 16 }).map((_, i) => { const R = rng(i + 4); return <circle key={i} cx={-500 + R() * 1000} cy={-200 + R() * 900} r={2} fill="#fff" opacity={.5} />; })}
      <g transform={`translate(0 ${300 + Math.sin(t * 2 + 1) * 14}) rotate(${Math.sin(t + 1) * 10})`}><MChar look={CAST.ein} x={0} y={0} s={.95} pose={{ armF: -2.2, armB: 2.2, elbowF: .3, elbowB: .3, expr: 'happy' }} /></g>
      <T_ x={0} y={500} s={34} c={BL}>FLOATING IN SPACE</T_>
    </g>
  </Board>;
};

export const Mercury: React.FC<GP> = ({ t }) => {
  const rot = t * 9;
  return <Board t={t} title="THE MERCURY PUZZLE" note="Mercury's orbit turns an extra 43 arc-seconds per century. Newton's gravity can't explain it. Einstein's does.">
    <g transform="translate(760 580)">
      {[0, 1, 2, 3, 4, 5].map((k) => <ellipse key={k} rx={330} ry={230} cx={70} fill="none" stroke={CH} strokeWidth={3} opacity={k === 5 ? .9 : .18 + k * .1} transform={`rotate(${rot - (5 - k) * 8})`} />)}
      <circle r={60} fill="#ffcf6a" /><circle r={90} fill="url(#sunGlow)" opacity={.6} />
      {(() => { const a = t * 1.8; const r = rot * Math.PI / 180; const ex = 70 + Math.cos(a) * 330, ey = Math.sin(a) * 230; return <circle cx={ex * Math.cos(r) - ey * Math.sin(r)} cy={ex * Math.sin(r) + ey * Math.cos(r)} r={20} fill={BL} stroke={CH} strokeWidth={3} />; })()}
    </g>
    <g transform="translate(1420 440)"><T_ x={0} y={0} s={40} c={BL}>NEWTON</T_><T_ x={0} y={56} s={34}>✗ 43″ missing</T_>
      <T_ x={0} y={190} s={40} c={AM} o={fade(t, 2)}>EINSTEIN, 1915</T_><T_ x={0} y={246} s={34} o={fade(t, 2.3)}>✓ exactly 43″</T_></g>
  </Board>;
};

export const Bending: React.FC<GP> = ({ t }) => {
  const draw = easeOut(prog(t, .5, 3));
  return <Board t={t} title="DOES THE SUN BEND STARLIGHT?" note="Eddington & Dyson, total solar eclipse of 29 May 1919 — Príncipe and Sobral. Predicted: 1.75 arc-seconds">
    <g transform="translate(0 40)">
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M 120 ${300 + i * 70} Q 960 ${300 + i * 70 + (i - 4) * -18 + (Math.abs(i - 4) < 3 ? 60 - Math.abs(i - 4) * 20 : 0)} 1800 ${300 + i * 70}`} stroke={CH} strokeWidth={2} fill="none" opacity={.18} />)}
      <circle cx={960} cy={580} r={110} fill="#ffcf6a" /><circle cx={960} cy={580} r={160} fill="url(#sunGlow)" opacity={.5} />
      <circle cx={260} cy={720} r={34} fill={BL} stroke={CH} strokeWidth={4} /><T_ x={260} y={800} s={30}>EARTH</T_>
      <g transform="translate(1720 300)"><path d="M 0 -24 L 7 -7 L 24 0 L 7 7 L 0 24 L -7 7 L -24 0 L -7 -7 Z" fill={CH} /><T_ x={0} y={-50} s={28}>REAL STAR</T_></g>
      <path d={`M 1720 300 Q 1000 380 260 720`} stroke={AM} strokeWidth={6} fill="none" strokeDasharray={`${draw * 1700} 1700`} />
      <path d="M 260 720 L 1720 230" stroke={CH} strokeWidth={3} fill="none" strokeDasharray="12 12" opacity={fade(t, 3)} />
      <g transform="translate(1740 236)" opacity={fade(t, 3.2)}><path d="M 0 -20 L 6 -6 L 20 0 L 6 6 L 0 20 L -6 6 L -20 0 L -6 -6 Z" fill="none" stroke={AM} strokeWidth={3} /><T_ x={0} y={-36} s={26} c={AM}>WHERE WE SEE IT</T_></g>
    </g>
  </Board>;
};

export const Headline: React.FC<GP> = ({ t }) => (
  <g><rect x={-200} y={-200} width={2320} height={1480} fill="#2a2420" />
    <g transform={`translate(960 560) rotate(${-3 + t * .5}) scale(${.9 + pop(t, .1) * .1 + t * .01})`}>
      <rect x={-640} y={-480} width={1280} height={980} fill="#ece4d0" stroke={P.ink} strokeWidth={6} />
      <text x={0} y={-370} fontFamily="Serif" fontSize={96} fill={P.ink} textAnchor="middle">THE LONDON DAILY</text>
      <line x1={-600} y1={-340} x2={600} y2={-340} stroke={P.ink} strokeWidth={6} /><text x={0} y={-305} fontFamily="Type" fontSize={28} fill={P.ink} textAnchor="middle">FRIDAY, NOVEMBER 7, 1919</text>
      <line x1={-600} y1={-285} x2={600} y2={-285} stroke={P.ink} strokeWidth={3} />
      <text x={0} y={-180} fontFamily="Serif" fontSize={120} fill={P.ink} textAnchor="middle" opacity={fade(t, .4)}>REVOLUTION</text>
      <text x={0} y={-60} fontFamily="Serif" fontSize={120} fill={P.ink} textAnchor="middle" opacity={fade(t, .7)}>IN SCIENCE</text>
      <text x={0} y={30} fontFamily="Type" fontSize={40} fill="#7a3b34" textAnchor="middle" opacity={fade(t, 1.1)}>NEW THEORY OF THE UNIVERSE</text>
      <text x={0} y={84} fontFamily="Type" fontSize={40} fill="#7a3b34" textAnchor="middle" opacity={fade(t, 1.4)}>NEWTONIAN IDEAS OVERTHROWN</text>
      {Array.from({ length: 3 }).map((_, c) => Array.from({ length: 9 }).map((_, l) => <line key={c + '-' + l} x1={-580 + c * 400} y1={150 + l * 34} x2={-240 + c * 400 - (l % 3) * 30} y2={150 + l * 34} stroke="#8a8478" strokeWidth={5} />))}
    </g>
    <text x={960} y={1050} fontFamily="Type" fontSize={24} fill="#c8c0b0" textAnchor="middle">Headlines as printed in The Times, 7 November 1919</text>
  </g>
);

export const Quantum: React.FC<GP> = ({ t }) => {
  const n = Math.floor(clamp(t / 5) * 420);
  const R = rng(5); const dots: [number, number][] = [];
  for (let i = 0; i < 420; i++) { let x = 0; for (;;) { const u = R() * 2 - 1; const pr = Math.pow(Math.cos(u * 9), 2) * Math.exp(-u * u * 2.2); if (R() < pr) { x = u; break; } } dots.push([1100 + x * 520, 300 + R() * 520]); }
  return <Board t={t} title="NATURE'S DICE?" note="Double-slit experiment: each particle lands at random, but the pattern follows exact probabilities">
    <g transform="translate(300 560)">
      <rect x={-20} y={-280} width={24} height={220} fill={CH} /><rect x={-20} y={-30} width={24} height={60} fill={CH} /><rect x={-20} y={60} width={24} height={220} fill={CH} />
      {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={-200 + ((t * 300 + k * 60) % 220)} cy={0} r={8} fill={AM} opacity={.8} />)}
      <T_ x={-120} y={-320} s={30} c={AM}>ONE PARTICLE AT A TIME</T_>
    </g>
    <rect x={1080 - 520} y={290} width={1080} height={540} fill="none" stroke={CH} strokeWidth={3} opacity={.0} />
    {dots.slice(0, n).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={i === n - 1 ? AM : CH} opacity={.85} />)}
    <line x1={1620} y1={290} x2={1620} y2={830} stroke={CH} strokeWidth={6} />
    <T_ x={1260} y={900} s={34} o={fade(t, 2)}>random hits → a perfect pattern</T_>
  </Board>;
};

export const Letter: React.FC<GP> = ({ t }) => {
  const txt = 'Some recent work by E. Fermi and L. Szilard, which has been communicated to me in manuscript, leads me to expect that the element uranium may be turned into a new and important source of energy in the immediate future.';
  const n = Math.floor(clamp((t - .8) / 6) * txt.length); const shown = txt.slice(0, n);
  const lines: string[] = []; let cur = ''; shown.split(' ').forEach((w) => { if ((cur + ' ' + w).length > 46) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }); lines.push(cur);
  return <g><rect x={-200} y={-200} width={2320} height={1480} fill="#3a2a20" />
    <g transform={`translate(960 ${560 - t * 4}) rotate(-1.5)`}>
      <rect x={-560} y={-500} width={1120} height={1100} fill="#f6efdc" stroke={P.ink} strokeWidth={6} />
      <text x={480} y={-420} fontFamily="Type" fontSize={30} fill={P.ink} textAnchor="end">August 2nd, 1939</text>
      <text x={-480} y={-330} fontFamily="Type" fontSize={32} fill={P.ink}>F.D. Roosevelt,</text><text x={-480} y={-290} fontFamily="Type" fontSize={32} fill={P.ink}>President of the United States</text>
      <text x={-480} y={-210} fontFamily="Type" fontSize={32} fill={P.ink}>Sir:</text>
      {lines.map((l, k) => <text key={k} x={-480} y={-140 + k * 52} fontFamily="Type" fontSize={36} fill={P.ink}>{l}{k === lines.length - 1 && Math.floor(t * 3) % 2 ? '▌' : ''}</text>)}
      <text x={300} y={480} fontFamily="Serif" fontSize={56} fill="#2a3a6a" fontStyle="italic" opacity={fade(t, 7.5)}>A. Einstein</text>
    </g>
    <text x={960} y={1050} fontFamily="Type" fontSize={24} fill="#c8c0b0" textAnchor="middle">Opening of Einstein's letter to President Roosevelt (drafted with Leo Szilard)</text>
  </g>;
};

export const GPS: React.FC<GP> = ({ t }) => {
  const a = t * .7; const drift = clamp(t / 6) * 10.8;
  return <Board t={t} title="RELATIVITY IN YOUR POCKET" note="GPS satellite clocks run ~38 microseconds a day fast. Uncorrected, positions drift ~10 km per day.">
    <g transform="translate(560 580)">
      <circle r={170} fill="#3a6a8a" stroke={CH} strokeWidth={5} /><path d="M -120 -60 q 40 -40 90 -10 q 30 40 -20 60 q -60 10 -70 -50 Z M 40 40 q 50 -30 90 10 q -10 60 -60 50 Z" fill="#5a8a5a" />
      <ellipse rx={360} ry={130} fill="none" stroke={CH} strokeWidth={3} strokeDasharray="10 12" opacity={.6} />
      <g transform={`translate(${Math.cos(a) * 360} ${Math.sin(a) * 130})`}><rect x={-22} y={-16} width={44} height={32} fill={AM} stroke={P.ink} strokeWidth={4} /><rect x={-80} y={-8} width={50} height={16} fill={BL} stroke={P.ink} strokeWidth={3} /><rect x={30} y={-8} width={50} height={16} fill={BL} stroke={P.ink} strokeWidth={3} /></g>
    </g>
    <g transform="translate(1260 380)">
      <T_ x={0} y={0} s={36} c={AM}>SATELLITE CLOCK</T_><T_ x={0} y={70} s={64} f="Serif">+38 μs / day</T_>
      <T_ x={0} y={200} s={36} c={BL}>YOUR POSITION ERROR</T_><T_ x={0} y={270} s={64} f="Serif" c={RD}>{drift.toFixed(1)} km</T_>
      <g transform="translate(0 380)"><line x1={-240} y1={0} x2={240} y2={0} stroke={CH} strokeWidth={4} /><circle cx={-200} cy={0} r={12} fill={CH} /><path d={`M ${-200 + drift * 40} -60 q 20 -30 0 -50 q -20 20 0 50`} fill={RD} stroke={CH} strokeWidth={3} /></g>
    </g>
  </Board>;
};

export const Legacy: React.FC<GP> = ({ t }) => {
  const items = [['1905', 'SOLAR PANELS', 'light quanta'], ['1915', 'GPS', 'relativity'], ['1917', 'LASERS', 'stimulated emission'], ['2019', 'BLACK HOLE PHOTO', 'general relativity']];
  return <Board t={t} title="STILL WORKING FOR YOU">
    {items.map(([y, a, b], k) => { const p = pop(t, .3 + k * .45); const x = 300 + k * 440; return <g key={k} transform={`translate(${x} ${560 + Math.sin(t * 1.5 + k) * 10}) scale(${p})`} opacity={clamp(p * 2)}>
      <circle r={150} fill="none" stroke={CH} strokeWidth={5} />
      {k === 0 && <g>{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={r + '' + c} x={-90 + c * 62} y={-70 + r * 46} width={56} height={40} fill={BL} opacity={.7} stroke={CH} strokeWidth={3} />))}</g>}
      {k === 1 && <g><path d="M 0 -80 C 50 -80 60 -20 0 70 C -60 -20 -50 -80 0 -80 Z" fill={RD} stroke={CH} strokeWidth={4} /><circle cy={-36} r={20} fill={C.slate} /></g>}
      {k === 2 && <g><rect x={-100} y={-20} width={70} height={40} fill={CH} /><line x1={-30} y1={0} x2={110} y2={0} stroke={RD} strokeWidth={10} opacity={.6 + Math.sin(t * 8) * .3} /></g>}
      {k === 3 && <g><circle r={80} fill="none" stroke={AM} strokeWidth={26} opacity={.85} /><circle r={52} fill="#000" /></g>}
      <text x={0} y={220} fontFamily="Serif" fontSize={40} fill={CH} textAnchor="middle">{a}</text>
      <text x={0} y={262} fontFamily="Type" fontSize={26} fill={AM} textAnchor="middle">{y} · {b}</text>
    </g>; })}
  </Board>;
};
