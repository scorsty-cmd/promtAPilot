import React from 'react';
import { clamp, lerp, easeOut, spring, prog, rng } from './lib';
import { P } from './art';
import { Codex } from './sets';

const ol = { stroke: P.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const AMBER = '#ffb347';
export const Txt: React.FC<{ x: number; y: number; s: number; c?: string; f?: 'Brico' | 'Mono'; a?: 'start' | 'middle' | 'end'; o?: number; w?: number; children: React.ReactNode }> = ({ x, y, s, c = P.ink, f = 'Brico', a = 'middle', o = 1, w = 800, children }) => (
  <text x={x} y={y} fontFamily={f} fontWeight={f === 'Brico' ? w : 500} fontSize={s} fill={c} textAnchor={a} opacity={o} letterSpacing={f === 'Mono' ? 4 : 0}>{children}</text>
);
const Paper: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = '#efe2c6' }) => (
  <g><rect x={-200} y={-200} width={2320} height={1480} fill={bg} />
    {bg !== '#1d1612' && Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 77); return <circle key={i} cx={R() * 1920} cy={R() * 1080} r={40 + R() * 160} fill="#d9c7a2" opacity={.18} />; })}
    {children}</g>
);

/* Maya numbers: dot = 1, bar = 5, shell = 0 */
const Dot = ({ x, y, r = 22 }: any) => <circle cx={x} cy={y} r={r} fill={P.ink} />;
const Bar = ({ x, y, w = 190, h = 34 }: any) => <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={P.ink} />;
const Shell = ({ x, y, s = 1 }: any) => <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -90 10 C -80 -50 80 -50 90 10 C 60 40 -60 40 -90 10 Z" fill="#f4ecdc" {...ol} /><path d="M -60 0 C -40 -26 40 -26 60 0 M -40 18 C -20 0 20 0 40 18" fill="none" {...ol} strokeWidth={5} /></g>;
export const Numerals: React.FC<{ t: number }> = ({ t }) => {
  const a = (k: number) => clamp((t - k) * 3);
  return <Paper>
    <Txt x={960} y={150} s={64}>HOW THE MAYA WROTE NUMBERS</Txt>
    <g opacity={a(.2)}><Dot x={420} y={430} /><Txt x={420} y={560} s={44} f="Mono">1</Txt></g>
    <g opacity={a(.8)}><Bar x={760} y={430} /><Txt x={760} y={560} s={44} f="Mono">5</Txt></g>
    <g opacity={a(1.4)}>{[0, 1, 2, 3].map((k) => <Dot key={k} x={1040 + k * 50} y={380} r={18} />)}{[0, 1, 2].map((k) => <Bar key={k} x={1115} y={430 + k * 46} w={170} h={28} />)}<Txt x={1115} y={600} s={44} f="Mono">19</Txt></g>
    <g opacity={a(2.2)} transform={`translate(1560 450) scale(${.8 + .2 * spring(prog(t, 2.2, 2.8), 10, .45)})`}><Shell x={0} y={0} s={1.2} /><Txt x={0} y={130} s={44} f="Mono" c="#b5432a">0</Txt></g>
    <g opacity={a(2.8)}><rect x={560} y={760} width={800} height={110} rx={18} fill={P.ink} /><Txt x={960} y={830} s={46} c={AMBER}>ZERO, CARVED BY c. AD 180*</Txt></g>
    <Txt x={960} y={940} s={24} f="Mono" c="#7a5a3a" o={a(3)}>*El Palmar Stela 46 · zero as a placeholder in the Long Count</Txt>
  </Paper>;
};
export const CalendarGears: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const gear = (cx: number, cy: number, r: number, teeth: number, rot: number, c: string, label: string, sub: string) => (
    <g>
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
        {Array.from({ length: teeth }).map((_, i) => <rect key={i} x={-14} y={-r - 30} width={28} height={40} rx={6} fill={c} {...ol} strokeWidth={5} transform={`rotate(${i / teeth * 360})`} />)}
        <circle r={r} fill={c} {...ol} /><circle r={r * .62} fill="#f2e7d0" {...ol} strokeWidth={5} />
        {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={Math.cos(i / 10 * 6.28) * r * .8} cy={Math.sin(i / 10 * 6.28) * r * .8} r={9} fill="#f2e7d0" />)}
      </g>
      <Txt x={cx} y={cy - 6} s={58}>{label}</Txt><Txt x={cx} y={cy + 44} s={26} f="Mono">{sub}</Txt>
    </g>);
  return <Paper>
    <Txt x={960} y={120} s={60}>TWO CALENDARS, ONE CYCLE</Txt>
    {gear(720, 560, 230, 20, T * 22, '#b5432a', '260 DAYS', "TZOLK'IN")}
    {gear(1210, 600, 290, 26, -T * 22 * 20 / 26, '#d9a441', '365 DAYS', "HAAB'")}
    <g opacity={clamp((t - 1.5) * 3)}><rect x={620} y={940} width={680} height={90} rx={16} fill={P.ink} /><Txt x={960} y={1000} s={42} c={AMBER}>TOGETHER: A 52-YEAR CYCLE</Txt></g>
  </Paper>;
};
export const LongCount: React.FC<{ t: number }> = ({ t }) => {
  const roll = clamp((t - 1.2) / 1.2); const before = ['12', '19', '19', '17', '19'], after = ['13', '0', '0', '0', '0'];
  return <Paper bg="#1d1612">
    <Txt x={960} y={200} s={46} f="Mono" c="#d9c49a">THE LONG COUNT</Txt>
    {before.map((b, i) => { const x = 420 + i * 270; const flip = clamp(roll * 5 - (4 - i) * .6);
      return <g key={i}><rect x={x - 115} y={340} width={230} height={260} rx={24} fill="#2c231d" stroke={AMBER} strokeWidth={5} />
        <Txt x={x} y={520 + (flip > .5 ? 0 : 0)} s={150} c={flip > .5 ? AMBER : '#f2e7d0'}>{flip > .5 ? after[i] : b}</Txt>{i < 4 && <Txt x={x + 135} y={520} s={120} c="#d9c49a">.</Txt>}</g>; })}
    <Txt x={960} y={760} s={64} c="#f2e7d0" o={clamp((t - 2.4) * 3)}>DECEMBER 21, 2012</Txt>
    <Txt x={960} y={860} s={40} f="Mono" c={AMBER} o={clamp((t - 3.2) * 3)}>NOT THE END OF THE WORLD. A NEW CYCLE.</Txt>
  </Paper>;
};
export const RainChart: React.FC<{ t: number }> = ({ t }) => {
  const g = clamp((t - .3) / 2);
  const bars = [['AD 600', 1], ['AD 700', .97], ['AD 800', .72], ['AD 900', .62], ['AD 1000', .85]] as const;
  return <Paper bg="#e9d2a6">
    <Txt x={960} y={140} s={60}>RAINFALL IN THE MAYA LOWLANDS</Txt>
    <Txt x={960} y={200} s={26} f="Mono" c="#7a5a3a">ILLUSTRATIVE SHAPE OF THE DECLINE · 25–40% DROP BETWEEN AD 800–950*</Txt>
    <line x1={360} y1={880} x2={1560} y2={880} {...ol} />
    {bars.map(([lab, v], i) => { const h = 560 * v * easeOut(clamp(g * 1.6 - i * .2)); const x = 440 + i * 240; const low = v < .8;
      return <g key={i}><rect x={x - 70} y={880 - h} width={140} height={h} rx={14} fill={low ? '#b5432a' : '#3f7a8a'} {...ol} strokeWidth={5} />
        {[0, 1, 2].map((k) => <path key={k} d={`M ${x - 30 + k * 30} ${860 - h - 30} q 8 14 0 22 q -8 -8 0 -22`} fill={low ? '#d9a4a0' : '#8ad0e0'} opacity={h > 20 ? 1 : 0} />)}
        <Txt x={x} y={940} s={30} f="Mono">{lab}</Txt></g>; })}
    <g opacity={clamp((t - 2.4) * 3)}><rect x={1040} y={280} width={520} height={100} rx={16} fill={P.ink} /><Txt x={1300} y={346} s={46} c={AMBER}>−25% TO −40%</Txt></g>
    <Txt x={960} y={1030} s={22} f="Mono" c="#7a5a3a">*Medina-Elizalde & Rohling, Science (2012)</Txt>
  </Paper>;
};
export const PopDots: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.floor(clamp(t / 2.5) * 320); const R = rng(4);
  const pts = Array.from({ length: 320 }).map(() => [480 + R() * 960, 300 + R() * 520]);
  return <Paper>
    <Txt x={960} y={160} s={58}>THE MAYA LOWLANDS AT THEIR PEAK</Txt>
    {pts.slice(0, n).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill={i % 7 ? '#7a5a3a' : '#b5432a'} />)}
    <g opacity={clamp((t - 1.6) * 3)}><rect x={520} y={850} width={880} height={110} rx={18} fill={P.ink} /><Txt x={960} y={924} s={54} c={AMBER}>9.5 – 16 MILLION PEOPLE*</Txt></g>
    <Txt x={960} y={1010} s={22} f="Mono" c="#7a5a3a">*estimate from lidar surveys, Late Classic AD 600–900 (Estrada-Belli et al., 2025)</Txt>
  </Paper>;
};
export const SocialPyramid: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const tiers = [['THE KING', '#e0a838', 180], ['NOBLES & PRIESTS', '#c0503a', 420], ['CRAFTSPEOPLE & TRADERS', '#d9a441', 700], ['FARMERS · MOST PEOPLE', '#5f9a3a', 1000]] as const;
  return <Paper>
    <Txt x={960} y={120} s={56}>WHERE WERE YOU MOST LIKELY BORN?</Txt>
    {tiers.map(([lab, c, w], i) => { const y = 220 + i * 190; const a = spring(prog(t, i * .35, i * .35 + .5), 10, .5);
      return <g key={i} opacity={clamp(a * 2)} transform={`translate(960 ${y + 80}) scale(${a}) translate(-960 ${-(y + 80)})`}>
        <path d={`M ${960 - w / 2} ${y + 170} L ${960 - w / 2 + 70} ${y} L ${960 + w / 2 - 70} ${y} L ${960 + w / 2} ${y + 170} Z`} fill={c} {...ol} />
        <Txt x={960} y={y + 108} s={i === 3 ? 52 : 40}>{lab}</Txt></g>; })}
    {t > 1.8 && <g transform={`translate(${1560 + Math.sin(T * 5) * 10} 880)`}><path d="M 0 0 L 70 -40 L 70 40 Z" fill="#b5432a" {...ol} /><rect x={70} y={-36} width={250} height={72} rx={14} fill={P.ink} /><Txt x={195} y={14} s={36} c={AMBER}>YOU ARE HERE</Txt></g>}
  </Paper>;
};
export const FourBooks: React.FC<{ t: number }> = ({ t }) => (
  <Paper bg="#1d1612">
    <Txt x={960} y={160} s={58} c="#f2e7d0">MAYA BOOKS KNOWN TO SURVIVE</Txt>
    {['DRESDEN', 'MADRID', 'PARIS', 'MEXICO'].map((n, i) => { const a = spring(prog(t, .3 + i * .3, .8 + i * .3), 10, .45);
      return <g key={n} opacity={clamp(a * 2)} transform={`translate(${300 + i * 440} 660) scale(${.85 * a})`}><Codex x={0} y={0} s={1} open={.4} seed={i + 2} /><text x={0} y={110} textAnchor="middle" fontFamily="Mono" fontSize={40} fill="#f2e7d0">{n} CODEX</text></g>; })}
    <g opacity={clamp((t - 1.8) * 3)}><rect x={760} y={860} width={400} height={110} rx={18} fill={AMBER} /><Txt x={960} y={936} s={72}>ONLY 4</Txt></g>
  </Paper>
);
export const TodayCount: React.FC<{ t: number }> = ({ t }) => (
  <Paper>
    <Txt x={960} y={170} s={60}>THE MAYA TODAY</Txt>
    {[['GUATEMALA', 7.1], ['MEXICO', 3.8], ['BELIZE, HONDURAS, USA & MORE', .5]].map(([n, v]: any, i) => { const w = easeOut(clamp((t - .3 - i * .3) * 1.4)) * v / 7.1 * 1100;
      return <g key={n}><Txt x={360} y={340 + i * 170} s={34} a="start" f="Mono">{n}</Txt><rect x={360} y={360 + i * 170} width={Math.max(30, w)} height={70} rx={16} fill={['#b5432a', '#d9a441', '#3f7a8a'][i]} {...ol} strokeWidth={5} />
        <Txt x={380 + Math.max(30, w)} y={412 + i * 170} s={40} a="start">{i < 2 ? `≈ ${v} M` : ''}</Txt></g>; })}
    <g opacity={clamp((t - 1.6) * 3)}><rect x={560} y={860} width={800} height={110} rx={18} fill={P.ink} /><Txt x={960} y={935} s={54} c={AMBER}>11+ MILLION PEOPLE*</Txt></g>
    <Txt x={960} y={1020} s={22} f="Mono" c="#7a5a3a">*approximate recent census estimates</Txt>
  </Paper>
);
