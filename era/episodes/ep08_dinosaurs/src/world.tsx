import React from 'react';
import { clamp, lerp, rng, prog, easeInOut } from './lib';
import { P } from './art';
import { R } from './creatures';

/* ===== ep07 sets: risograph-print Cretaceous world (flat ink layers, halftone, misregistered outlines) ===== */
const ol = (w = 7) => ({ stroke: P.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
export const Blur: React.FC<{ r?: number; children: React.ReactNode }> = ({ r = 6, children }) => <g filter={((globalThis as any).__OFF || '').includes('blur') ? undefined : `url(#dof${Math.round(r)})`}>{children}</g>;
export const DofDefs = () => <>{[3, 6, 10].map((r) => <filter key={r} id={`dof${r}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={r} /></filter>)}
  <pattern id="dots" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(22)"><circle cx={7} cy={7} r={3.2} fill={P.ink} /></pattern>
  <pattern id="dotsL" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(-15)"><circle cx={5} cy={5} r={1.8} fill={P.ink} /></pattern>
  <pattern id="lines" width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width={6} height={16} fill={P.ink} /></pattern>
</>;
/* halftone shade on any shape */
export const Tone: React.FC<{ d: string; o?: number; p?: 'dots' | 'dotsL' | 'lines' }> = ({ d, o = .18, p = 'dots' }) => <path d={d} fill={`url(#${p})`} opacity={o} />;

export type Sk = 'day' | 'dusk' | 'night' | 'dawn' | 'storm';
const SKY: Record<Sk, [string, string, string]> = { day: ['#ffe9a8', '#ffb9cf', '#ffd23f'], dusk: ['#ff7aa8', '#ff9a5a', '#ffd23f'], night: ['#16224a', '#233a73', '#f4eee0'], dawn: ['#ffd8c0', '#9fd8d0', '#fff4c0'], storm: ['#4a3a5a', '#7a5a6a', '#ff7a2f'] };
export const SkyR: React.FC<{ tone?: Sk; T?: number; sun?: [number, number] }> = ({ tone = 'day', T = 0, sun = [1450, 260] }) => {
  const [a, b, c] = SKY[tone];
  return <g>
    <rect x={-300} y={-300} width={2600} height={1700} fill={a} />
    {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={-300} y={180 + k * 110} width={2600} height={1400} fill={b} opacity={.22} />)}
    <circle cx={sun[0]} cy={sun[1] + Math.sin(T * .1) * 6} r={tone === 'night' ? 70 : 130} fill={c} />
    <circle cx={sun[0] + 6} cy={sun[1] + 4} r={tone === 'night' ? 70 : 130} fill="url(#dotsL)" opacity={.18} />
    {tone === 'night' && Array.from({ length: 90 }).map((_, i) => { const r0 = rng(i + 9); return <circle key={i} cx={r0() * 2400 - 240} cy={r0() * 700 - 150} r={1 + r0() * 2.5} fill="#f4eee0" opacity={.4 + .5 * Math.abs(Math.sin(T * (1 + r0()) + i))} />; })}
    {tone !== 'night' && [0, 1, 2].map((k) => { const x = ((k * 900 + T * (12 + k * 6)) % 2900) - 500; return <g key={k} transform={`translate(${x} ${120 + k * 90})`} opacity={.85}><ellipse rx={160} ry={34} fill="#fff4e8" /><ellipse cx={70} cy={-24} rx={90} ry={34} fill="#fff4e8" /><ellipse cx={0} cy={6} rx={160} ry={34} fill="url(#dotsL)" opacity={.12} /></g>; })}
  </g>;
};
export const Volcano: React.FC<{ x: number; y: number; s?: number; T: number; c?: string }> = ({ x, y, s = 1, T, c = R.purple }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  {[0, 1, 2, 3, 4].map((k) => { const p = ((T * .05 + k / 5) % 1); return <circle key={k} cx={Math.sin(p * 4 + k) * 40 + p * 160} cy={-380 - p * 500} r={40 + p * 120} fill="#8a7a8a" opacity={(1 - p) * .5} />; })}
  <path d="M -520 0 L -90 -380 L 90 -380 L 520 0 Z" fill={c} opacity={.75} />
  <path d="M -90 -380 L -40 -330 L 10 -370 L 50 -320 L 90 -380 Z" fill={R.orange} opacity={.8} />
  <path d="M -520 0 L -90 -380 L -40 0 Z" fill="url(#lines)" opacity={.12} />
</g>;
/* Cretaceous plants */
export const Cycad: React.FC<{ x: number; y: number; s?: number; T: number; c?: string; trunk?: string }> = ({ x, y, s = 1, T, c = R.green, trunk = R.brown }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -30 0 Q -40 -200 -10 -420 L 30 -420 Q 20 -200 34 0 Z" fill={trunk} {...ol(6)} />
  {Array.from({ length: 8 }).map((_, k) => <path key={k} d="M 0 0 l 22 10" transform={`translate(${-24 + (k % 2) * 30} ${-40 - k * 48})`} stroke={P.ink} strokeWidth={5} />)}
  {Array.from({ length: 9 }).map((_, k) => { const a = -170 + k * 20 + Math.sin(T * 1.2 + k) * 3; return <g key={k} transform={`translate(10 -420) rotate(${a})`}><path d="M 0 0 Q 140 -40 280 30 Q 140 10 0 0 Z" fill={k % 2 ? c : R.greenD} {...ol(5)} />{[60, 120, 180, 230].map((q) => <path key={q} d={`M ${q} ${-6 + q * .09} l 10 26`} stroke={P.ink} strokeWidth={3} />)}</g>; })}
</g>;
export const Magnolia: React.FC<{ x: number; y: number; s?: number; T: number; c?: string; fl?: string }> = ({ x, y, s = 1, T, c = R.teal, fl = R.pink }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -30 0 Q -10 -200 -20 -360 L 20 -360 Q 30 -200 40 0 Z" fill={R.brown} {...ol(6)} />
  {[[-120, -420, 170], [80, -470, 190], [-10, -560, 160], [150, -360, 130], [-170, -330, 120]].map(([cx, cy, r], k) => <g key={k} transform={`translate(${cx + Math.sin(T * .9 + k) * 4} ${cy})`}><circle r={r} fill={k % 2 ? c : R.tealD} {...ol(6)} /><circle r={r} fill="url(#dotsL)" opacity={.12} transform="translate(14 14)" /></g>)}
  {Array.from({ length: 11 }).map((_, k) => { const r0 = rng(k + 31); return <g key={'f' + k} transform={`translate(${-220 + r0() * 400} ${-640 + r0() * 330}) rotate(${r0() * 90})`}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} rx={9} ry={20} cy={-14} transform={`rotate(${a})`} fill={fl} stroke={P.ink} strokeWidth={3} />)}<circle r={7} fill={R.yellow} /></g>; })}
</g>;
export const Fern: React.FC<{ x: number; y: number; s?: number; T: number; c?: string; flip?: boolean }> = ({ x, y, s = 1, T, c = R.greenD, flip }) => <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
  {[-60, -30, 0, 25, 55].map((a, k) => <g key={k} transform={`rotate(${a + Math.sin(T * 1.4 + k) * 4})`}><path d="M 0 0 Q 30 -160 10 -300" stroke={P.ink} strokeWidth={9} fill="none" /><path d="M 0 0 Q 30 -160 10 -300" stroke={c} strokeWidth={4} fill="none" />
    {Array.from({ length: 9 }).map((_, j) => <g key={j}><path d={`M ${22 - j * 1.2} ${-30 - j * 30} q ${40 - j * 3} -4 ${54 - j * 4} -24`} stroke={c} strokeWidth={12 - j} strokeLinecap="round" fill="none" /><path d={`M ${20 - j * 1.2} ${-30 - j * 30} q ${-40 + j * 3} -4 ${-50 + j * 4} -26`} stroke={c} strokeWidth={12 - j} strokeLinecap="round" fill="none" /></g>)}</g>)}
</g>;
export const Grass: React.FC<{ y: number; T: number; c?: string; n?: number; seed?: number }> = ({ y, T, c = R.green, n = 70, seed = 3 }) => <g>{Array.from({ length: n }).map((_, i) => { const r0 = rng(i + seed); const x = -250 + r0() * 2500, h = 30 + r0() * 50; return <path key={i} d={`M ${x} ${y} q ${6 + Math.sin(T * 2 + i) * 6} ${-h / 2} ${10 + Math.sin(T * 2 + i) * 10} ${-h}`} stroke={c} strokeWidth={6} strokeLinecap="round" fill="none" />; })}</g>;

/* the jungle: 4 parallax layers, px = camera drift */
export const Jungle: React.FC<{ T: number; tone?: Sk; px?: number; volcano?: boolean; ground?: number; dense?: number; sky?: boolean }> = ({ T, tone = 'day', px = 0, volcano = true, ground = 900, dense = 1, sky = true }) => {
  const night = tone === 'night'; const dk = night ? .55 : tone === 'dusk' ? .2 : 0;
  return <g>
    {sky && <SkyR tone={tone} T={T} />}
    {volcano && <g transform={`translate(${-px * .1} 0)`}><Volcano x={1500} y={ground - 120} s={.9} T={T} c={night ? '#2a2a50' : R.purple} /></g>}
    <g transform={`translate(${-px * .25} 0)`} opacity={.9}>{Array.from({ length: 9 }).map((_, i) => <Cycad key={i} x={-300 + i * 340} y={ground - 60} s={.55 + (i % 3) * .08} T={T} c={night ? '#24406a' : '#7ac8a0'} trunk={night ? '#2a2a4a' : '#c8a070'} />)}
      <rect x={-500} y={ground - 70} width={3200} height={80} fill={night ? '#22305a' : '#9fd8a8'} /></g>
    <g transform={`translate(${-px * .55} 0)`}>{Array.from({ length: Math.round(6 * dense) }).map((_, i) => i % 2 ? <Magnolia key={i} x={-200 + i * 480} y={ground + 10} s={.8 + (i % 3) * .1} T={T} c={night ? '#1f4a5a' : R.teal} fl={night ? '#a04a7a' : R.pink} /> : <Cycad key={i} x={-200 + i * 480} y={ground + 10} s={.95} T={T} c={night ? '#1f4a3a' : R.green} trunk={night ? '#3a2a2a' : R.brown} />)}</g>
    <rect x={-400} y={ground} width={3000} height={600} fill={night ? '#1a2a3a' : '#e8c87a'} />
    <rect x={-400} y={ground} width={3000} height={600} fill="url(#dotsL)" opacity={.12} />
    <path d={`M -400 ${ground} Q 400 ${ground - 20} 960 ${ground + 10} T 2500 ${ground}`} fill="none" stroke={P.ink} strokeWidth={7} />
    <Grass y={ground + 8} T={T} c={night ? '#2a4a3a' : R.green} />
    {dk > 0 && <rect x={-400} y={-400} width={3000} height={2000} fill={night ? '#0a1030' : '#ff4f9a'} opacity={dk * .5} />}
  </g>;
};
export const FernsFg: React.FC<{ T: number; px?: number; night?: boolean; y?: number }> = ({ T, px = 0, night, y = 1180 }) => <Blur r={10}><g transform={`translate(${-px * 1.3} 0)`}>
  <Fern x={-120} y={y} s={1.6} T={T} c={night ? '#0a2a2a' : R.greenD} /><Fern x={2050} y={y} s={1.7} T={T} c={night ? '#0a2a2a' : '#1f7a50'} flip />
</g></Blur>;
export const Mosquitoes: React.FC<{ T: number; cx: number; cy: number; n?: number }> = ({ T, cx, cy, n = 6 }) => <g>{Array.from({ length: n }).map((_, i) => { const x = cx + Math.sin(T * (3 + i) + i) * 90, y = cy + Math.cos(T * (4 + i * .5) + i * 2) * 60; return <g key={i} transform={`translate(${x} ${y})`}><circle r={4} fill={P.ink} /><ellipse cx={-5} cy={-6} rx={6} ry={3} fill="#fff" opacity={.7} transform={`rotate(${Math.sin(T * 60 + i) * 30})`} /><ellipse cx={5} cy={-6} rx={6} ry={3} fill="#fff" opacity={.7} /></g>; })}</g>;
export const Fireflies: React.FC<{ T: number; n?: number }> = ({ T, n = 40 }) => <g>{Array.from({ length: n }).map((_, i) => { const r0 = rng(i + 77); return <circle key={i} cx={r0() * 2200 - 140 + Math.sin(T * .6 + i) * 40} cy={300 + r0() * 650 + Math.cos(T * .8 + i) * 30} r={3 + r0() * 3} fill="#ffe66a" opacity={.3 + .7 * Math.max(0, Math.sin(T * (1.5 + r0()) + i * 3))} />; })}</g>;
export const Eyes: React.FC<{ T: number; pts: [number, number][]; o?: number }> = ({ T, pts, o = 1 }) => <g opacity={o}>{pts.map(([x, y], i) => { const bl = ((T + i * 1.3) % 3.2) < .15; return bl ? null : <g key={i} transform={`translate(${x + Math.sin(T * .7 + i) * 10} ${y})`}><ellipse cx={-16} rx={9} ry={6} fill="#ffe66a" /><ellipse cx={16} rx={9} ry={6} fill="#ffe66a" /></g>; })}</g>;

/* coast */
export const Coast: React.FC<{ T: number; tone?: Sk; sea?: number; fin?: number }> = ({ T, tone = 'day', sea = 640, fin = -1 }) => <g>
  <SkyR tone={tone} T={T} sun={[400, 260]} />
  <rect x={-300} y={sea} width={2600} height={800} fill={R.teal} />
  {Array.from({ length: 7 }).map((_, k) => <path key={k} d={Array.from({ length: 30 }).map((_, j) => `${j ? 'L' : 'M'} ${-300 + j * 100} ${sea + 20 + k * 40 + Math.sin(j * .9 + T * (1.2 + k * .2) + k) * 8}`).join(' ')} stroke={k % 2 ? '#7ad8c8' : R.tealD} strokeWidth={5} fill="none" opacity={.8} />)}
  <rect x={-300} y={sea} width={2600} height={300} fill="url(#dotsL)" opacity={.1} />
  {fin >= 0 && <g transform={`translate(${lerp(1900, 400, fin)} ${sea + 120 + Math.sin(T * 2) * 6})`}><path d="M -40 0 L 10 -90 L 40 0 Z" fill={R.navy} {...ol(6)} /><path d="M -70 4 Q 0 -10 70 4" stroke="#fff" strokeWidth={6} fill="none" /></g>}
  <path d={`M -300 ${sea + 300} Q 500 ${sea + 220} 960 ${sea + 260} Q 1500 ${sea + 300} 2300 ${sea + 230} L 2300 1500 L -300 1500 Z`} fill="#f2d48a" {...ol()} />
  <path d={`M -300 ${sea + 300} Q 500 ${sea + 220} 960 ${sea + 260} Q 1500 ${sea + 300} 2300 ${sea + 230}`} stroke="#fff" strokeWidth={14} fill="none" opacity={.7 + .3 * Math.sin(T * 1.5)} strokeDasharray="60 30" />
  <rect x={-300} y={sea + 260} width={2600} height={600} fill="url(#dotsL)" opacity={.1} />
  {[[-80, 1.1], [1980, 1.2]].map(([x, s], k) => <Cycad key={k} x={x} y={sea + 300} s={s} T={T} c={R.green} />)}
</g>;
export const Splash: React.FC<{ x: number; y: number; p: number; s?: number }> = ({ x, y, p, s = 1 }) => p <= 0 || p >= 1 ? null : <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - p * p}>
  {Array.from({ length: 14 }).map((_, k) => { const a = -Math.PI * (k / 13), r = 80 + p * 340; return <circle key={k} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 1.3 + p * p * 300} r={30 * (1 - p) + 8} fill="#bff0ea" stroke={P.ink} strokeWidth={4} />; })}
  <ellipse rx={200 + p * 300} ry={40} fill="#bff0ea" stroke={P.ink} strokeWidth={5} />
</g>;

/* nest town in giant trees */
export const Nest: React.FC<{ x: number; y: number; s?: number; T: number; lit?: number }> = ({ x, y, s = 1, T, lit = 0 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -130 -40 Q -140 60 0 80 Q 140 60 130 -40 Z" fill={R.brown} {...ol(6)} />
  {Array.from({ length: 6 }).map((_, k) => <path key={k} d={`M ${-126 + k * 4} ${-30 + k * 18} Q 0 ${-10 + k * 22} ${126 - k * 4} ${-30 + k * 18}`} stroke={k % 2 ? '#c89a5a' : '#5a3a20'} strokeWidth={8} fill="none" />)}
  <path d="M -150 -50 Q 0 -230 150 -50 Z" fill="#c89a5a" {...ol(6)} />
  {[-80, -30, 20, 70].map((q) => <path key={q} d={`M ${q - 40} -50 Q ${q} -150 ${q + 40} -50`} stroke="#8a5a34" strokeWidth={6} fill="none" />)}
  <ellipse cx={0} cy={-60} rx={34} ry={40} fill={lit ? '#ffd23f' : '#3a2414'} {...ol(5)} opacity={lit ? .6 + .4 * Math.sin(T * 3) : 1} />
</g>;
export const BigTree: React.FC<{ x: number; y: number; s?: number; T: number; nests?: [number, number, number][]; night?: boolean }> = ({ x, y, s = 1, T, nests = [], night }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -110 0 Q -60 -500 -80 -1200 L 80 -1200 Q 60 -500 130 0 Z" fill={night ? '#3a2a2a' : '#9a6a3a'} {...ol()} />
  <path d="M -60 -100 Q -40 -500 -50 -1100" stroke={P.ink} strokeWidth={5} fill="none" opacity={.5} />
  {[[-300, -900, 300], [260, -1000, 320], [0, -1200, 360]].map(([cx, cy, r], k) => <circle key={k} cx={cx + Math.sin(T * .7 + k) * 5} cy={cy} r={r} fill={night ? '#1a3a3a' : k % 2 ? R.green : R.greenD} {...ol()} />)}
  <path d="M -20 -600 L -280 -720 M 30 -700 L 260 -800" stroke={night ? '#3a2a2a' : '#9a6a3a'} strokeWidth={40} strokeLinecap="round" /><path d="M -20 -600 L -280 -720 M 30 -700 L 260 -800" stroke={P.ink} strokeWidth={4} fill="none" opacity={.4} />
  {nests.map(([nx, ny, ns], k) => <Nest key={k} x={nx} y={ny} s={ns} T={T + k} lit={night ? 1 : 0} />)}
</g>;
export const NestTown: React.FC<{ T: number; tone?: Sk; px?: number }> = ({ T, tone = 'day', px = 0 }) => {
  const night = tone === 'night';
  return <g>
    <SkyR tone={tone} T={T} sun={[960, 300]} />
    <g transform={`translate(${-px * .2} 0)`} opacity={.55}>{[0, 1, 2, 3, 4].map((i) => <BigTree key={i} x={-200 + i * 560} y={860} s={.45} T={T} night={night} nests={[[-200, -700, .8], [220, -820, .7]]} />)}</g>
    {/* rope bridges */}
    <g transform={`translate(${-px * .5} 0)`}>
      <path d={`M 300 ${330 + Math.sin(T) * 4} Q 960 ${480 + Math.sin(T) * 6} 1620 330`} stroke={P.ink} strokeWidth={8} fill="none" />
      {Array.from({ length: 20 }).map((_, k) => { const u = k / 19; const xx = lerp(300, 1620, u), yy = 330 + Math.sin(u * Math.PI) * 150 + Math.sin(T) * 5; return <line key={k} x1={xx} y1={yy} x2={xx} y2={yy - 34} stroke="#8a5a34" strokeWidth={6} />; })}
      <BigTree x={200} y={900} s={.8} T={T} night={night} nests={[[-200, -700, 1], [220, -820, .9], [0, -420, .8]]} />
      <BigTree x={1720} y={900} s={.85} T={T + 1} night={night} nests={[[-220, -760, 1], [230, -860, .9], [-40, -460, .85]]} />
    </g>
    <rect x={-400} y={900} width={3000} height={600} fill={night ? '#1a2a3a' : '#c8d87a'} /><rect x={-400} y={900} width={3000} height={600} fill="url(#dotsL)" opacity={.1} />
    <path d="M -400 900 L 2500 900" stroke={P.ink} strokeWidth={7} />
    <Grass y={908} T={T} c={night ? '#2a4a3a' : R.green} />
    {night && <rect x={-400} y={-400} width={3000} height={2000} fill="#0a1030" opacity={.3} />}
  </g>;
};
/* duckbill farm field */
export const Field: React.FC<{ T: number }> = ({ T }) => <g>
  <SkyR tone="dusk" T={T} sun={[1500, 380]} />
  {[0, 1, 2].map((k) => <path key={k} d={`M -400 ${620 + k * 70} Q 600 ${560 + k * 80} 1200 ${640 + k * 60} T 2500 ${610 + k * 70} L 2500 1400 L -400 1400 Z`} fill={['#c8d87a', '#a8c86a', '#e8c87a'][k]} stroke={P.ink} strokeWidth={6} />)}
  {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={-200 + i * 180} y1={780} x2={-200 + i * 180} y2={830} stroke={P.ink} strokeWidth={8} />)}
  <path d="M -300 790 L 2400 790" stroke="#8a5a34" strokeWidth={8} />
  <BigTree x={-100} y={900} s={.7} T={T} nests={[[-200, -700, 1], [230, -820, .9]]} />
</g>;
export const Egg: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = '#9fd8d0' }) => <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M 0 -80 C 46 -80 60 -10 56 20 C 50 60 -50 60 -56 20 C -60 -10 -46 -80 0 -80 Z" fill={c} {...ol(6)} />{[[-20, -30], [18, -6], [-6, 22], [26, -46]].map(([a, b], k) => <circle key={k} cx={a} cy={b} r={7} fill={R.navy} opacity={.6} />)}</g>;

/* modern world */
export const Bedroom: React.FC<{ T: number; light?: number; crowX?: number }> = ({ T, light = 1 }) => <g>
  <rect x={-300} y={-300} width={2600} height={1700} fill="#9fd8d0" />
  <rect x={-300} y={-300} width={2600} height={1700} fill="url(#dotsL)" opacity={.08} />
  {/* window */}
  <g transform="translate(1340 160)"><rect x={0} y={0} width={520} height={460} fill="#ffe9a8" {...ol(9)} />
    <circle cx={380} cy={130} r={70} fill="#ffd23f" />
    <path d="M 0 380 Q 160 330 300 360 Q 420 380 520 330 L 520 460 L 0 460 Z" fill="#7ac8a0" />
    <path d="M -20 300 Q 200 260 540 290" stroke={R.brown} strokeWidth={22} fill="none" strokeLinecap="round" />
    <line x1={260} y1={0} x2={260} y2={460} stroke={P.ink} strokeWidth={9} /><line x1={0} y1={230} x2={520} y2={230} stroke={P.ink} strokeWidth={9} />
    <rect x={-30} y={450} width={580} height={30} fill="#f4eee0" {...ol(6)} />
    <path d={`M -60 -20 Q -30 240 -50 500`} stroke={R.pink} strokeWidth={60} fill="none" /><path d={`M 580 -20 Q 560 240 590 500`} stroke={R.pink} strokeWidth={60} fill="none" />
  </g>
  {/* poster */}
  <g transform="translate(220 180) rotate(-3)"><rect width={300} height={400} fill="#f4eee0" {...ol(7)} /><rect x={20} y={20} width={260} height={300} fill={R.orange} /><path d="M 60 300 L 90 200 Q 120 120 200 110 L 250 130 L 210 150 L 160 160 Q 150 230 190 300 Z" fill={R.navy} /><text x={150} y={370} textAnchor="middle" fontFamily="Dela" fontSize={44} fill={R.navy}>DINO</text></g>
  <rect x={-300} y={930} width={2600} height={500} fill="#e8c890" /><rect x={-300} y={930} width={2600} height={500} fill="url(#lines)" opacity={.06} /><path d="M -300 930 L 2400 930" stroke={P.ink} strokeWidth={7} />
  {/* bed */}
  <g transform="translate(260 930)"><rect x={-40} y={-360} width={60} height={360} fill="#8a5a34" {...ol(7)} /><rect x={-20} y={-180} width={1000} height={130} fill="#f4eee0" {...ol(7)} /><rect x={-20} y={-60} width={1000} height={60} fill="#8a5a34" {...ol(7)} /><ellipse cx={110} cy={-200} rx={120} ry={46} fill="#fff" {...ol(6)} /></g>
  <g transform="translate(1250 930)"><rect x={-90} y={-170} width={180} height={170} fill="#ffd23f" {...ol(7)} /><rect x={-30} y={-260} width={10} height={90} fill={P.ink} /><path d="M -80 -260 L -60 -330 L 30 -330 L 50 -260 Z" fill={R.pink} {...ol(6)} /></g>
  <rect x={-300} y={-300} width={2600} height={1700} fill="#ffd8a0" opacity={.12 * light} />
</g>;
export const BedCover: React.FC<{ off?: number }> = ({ off = 0 }) => <g transform={`translate(${380 + off * 300} 760)`}><path d="M 0 0 Q 300 -60 860 -20 L 880 140 L 0 140 Z" fill={R.pink} {...ol(7)} /><path d="M 0 0 Q 300 -60 860 -20 L 880 140 L 0 140 Z" fill="url(#dots)" opacity={.12} />{[120, 340, 560].map((q) => <path key={q} d={`M ${q} ${-24} q 30 70 0 160`} stroke="#ffd23f" strokeWidth={10} fill="none" />)}</g>;
export const Kitchen: React.FC<{ T: number }> = ({ T }) => <g>
  <rect x={-300} y={-300} width={2600} height={1700} fill="#ffe9a8" />
  {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-300 + i * 220} y={520} width={220} height={140} fill={i % 2 ? '#f4eee0' : '#9fd8d0'} stroke={P.ink} strokeWidth={4} />)}
  <g transform="translate(820 130)"><rect width={560} height={360} fill="#bfe8ff" {...ol(9)} /><path d="M 0 280 Q 200 240 560 270 L 560 360 L 0 360 Z" fill="#7ac8a0" /><line x1={280} y1={0} x2={280} y2={360} stroke={P.ink} strokeWidth={8} /><rect x={-30} y={350} width={620} height={26} fill="#f4eee0" {...ol(6)} /></g>
  <rect x={-300} y={660} width={2600} height={270} fill={R.teal} {...ol(7)} />
  {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-260 + i * 260} y={700} width={220} height={200} rx={10} fill="#0d9f99" stroke={P.ink} strokeWidth={5} />)}
  <rect x={-300} y={640} width={2600} height={30} fill="#f4eee0" {...ol(6)} />
  <g transform="translate(1560 640)"><rect x={-80} y={-110} width={160} height={110} rx={18} fill={R.pink} {...ol(6)} /><rect x={-50} y={-130} width={30} height={30} fill="#333" /><rect x={10} y={-130} width={30} height={30} fill="#333" /></g>
  <g transform="translate(560 640)"><rect x={-36} y={-90} width={72} height={90} rx={8} fill={R.yellow} {...ol(5)} /><path d="M 36 -70 q 30 10 0 40" stroke={P.ink} strokeWidth={8} fill="none" />{[0, 1, 2].map((k) => <path key={k} d={`M ${-14 + k * 14} -100 q ${Math.sin(T * 2 + k) * 10} -30 0 -60`} stroke="#fff" strokeWidth={5} fill="none" opacity={.6} />)}</g>
  <rect x={-300} y={930} width={2600} height={500} fill="#d8a870" /><path d="M -300 930 L 2400 930" stroke={P.ink} strokeWidth={7} />
</g>;
/* space: asteroid misses Earth */
export const Space: React.FC<{ T: number; p: number; hit?: boolean }> = ({ T, p, hit }) => {
  const ax = lerp(-300, 2300, p), ay = lerp(160, 700, p) + (hit ? 0 : -Math.sin(p * Math.PI) * 180);
  return <g>
    <rect x={-300} y={-300} width={2600} height={1700} fill="#101a3a" />
    {Array.from({ length: 160 }).map((_, i) => { const r0 = rng(i + 5); return <circle key={i} cx={r0() * 2400 - 240} cy={r0() * 1400 - 160} r={1 + r0() * 2.6} fill="#f4eee0" opacity={.3 + .6 * r0()} />; })}
    <g transform={`translate(1040 640) rotate(${T * 3})`}>
      <circle r={330} fill={R.teal} {...ol(9)} />
      {[[-120, -100, 140, 90], [110, 60, 120, 150], [-60, 170, 90, 60], [160, -150, 70, 60]].map(([x, y, rx, ry], k) => <ellipse key={k} cx={x} cy={y} rx={rx} ry={ry} fill={R.green} stroke={P.ink} strokeWidth={5} />)}
      <circle r={330} fill="url(#dotsL)" opacity={.12} />
    </g>
    <path d="M 710 640 A 330 330 0 0 0 1370 640 A 330 280 0 0 1 710 640" fill="#0a1030" opacity={.4} />
    <g transform={`translate(${ax} ${ay})`}>
      {Array.from({ length: 10 }).map((_, k) => <circle key={k} cx={-k * 46} cy={-k * 12} r={60 - k * 5} fill={k % 2 ? R.orange : R.yellow} opacity={.75 - k * .07} />)}
      <circle r={70} fill={R.brown} {...ol(7)} /><circle cx={-20} cy={-14} r={16} fill="#5a3a20" /><circle cx={24} cy={20} r={11} fill="#5a3a20" />
    </g>
  </g>;
};
