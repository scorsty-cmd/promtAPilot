import React from 'react';
import { P } from './art';
import { rng, clamp, lerp } from './lib';
import { MChar, citizen, legionary, greekSoldier, MLook, MPose } from './chars';

/* ===== Bronze Age Troy — "Mycenaean fresco" look: lime plaster, red & yellow ochre, Egyptian blue ===== */
export const F = {
  plaster: '#efe4cc', ochre: '#e0a83a', red: '#b0402a', redD: '#7a2a22', blue: '#3a6fa8', blueD: '#24456a', sky: '#9cc4d4', sea: '#3f7f9a', seaD: '#2a5a72',
  stone: '#cdb58a', stoneD: '#a88e64', brick: '#c88a5a', grass: '#a8a85a', grassD: '#7a7a3a', sand: '#e2c890', night: '#141c2a', nightL: '#2a3650', fire: '#ffb347', bronze: '#c9913a', wood: '#8a5a34', woodD: '#5a3a20', black: '#2a1a12',
};
const ol = (w = 7) => ({ stroke: P.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const W = 2400;

export type Tone = 'day' | 'dawn' | 'dusk' | 'night' | 'fire';
export const Sky: React.FC<{ tone?: Tone; T?: number }> = ({ tone = 'day', T = 0 }) => {
  const g = { day: ['#7fb2c8', '#e8dcb8'], dawn: ['#5a6a9a', '#f4b07a'], dusk: ['#3a3a6a', '#e8844a'], night: ['#0c1220', '#26324a'], fire: ['#1a0e10', '#8a3a1a'] }[tone];
  return <g><defs><linearGradient id={`sk${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={g[0]} /><stop offset="1" stopColor={g[1]} /></linearGradient></defs>
    <rect x={-240} y={-200} width={W} height={1300} fill={`url(#sk${tone})`} />
    {(tone === 'night') && Array.from({ length: 80 }).map((_, i) => { const R = rng(i + 3); return <circle key={i} cx={R() * 1920} cy={R() * 560} r={1 + R() * 2.2} fill="#f6efdc" opacity={(.4 + R() * .5) * (.7 + .3 * Math.sin(T * 2 + i))} />; })}
    {tone === 'night' && <circle cx={1560} cy={170} r={50} fill="#f2ead2" />}
    {(tone === 'dawn' || tone === 'dusk') && <circle cx={tone === 'dawn' ? 1500 : 400} cy={560} r={110} fill="#ffd27a" opacity={.9} />}
    {[0, 1, 2].map((k) => tone !== 'night' && tone !== 'fire' && <path key={k} d={`M ${((k * 700 + T * 12) % 2600) - 400} ${120 + k * 70} q 80 -40 160 0 q 60 -30 120 0 q 50 20 0 30 l -270 0 q -40 -10 -10 -30 Z`} fill="#fff" opacity={.5} />)}
  </g>;
};

/* ---- Troy's walls seen from the plain: sloped ashlar base + mud-brick upper + towers + gate + citadel ---- */
export const TroyWalls: React.FC<{ T: number; x?: number; y?: number; s?: number; tone?: Tone; burning?: number; gateOpen?: number; breach?: boolean }> = ({ T, x = 960, y = 760, s = 1, tone = 'day', burning = 0, gateOpen = 0, breach }) => {
  const dark = tone === 'night' || tone === 'fire';
  const st = dark ? '#5a5048' : F.stone, stD = dark ? '#3a342e' : F.stoneD, br = dark ? '#6a4a3a' : F.brick;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* citadel on top */}
    {[[-520, -560, 200, 150], [-260, -620, 260, 210], [60, -600, 220, 190], [320, -540, 200, 130], [-80, -700, 160, 110]].map(([bx, by, w, h], k) => <g key={k}>
      <rect x={bx} y={by} width={w} height={h} fill={k === 1 ? (dark ? '#6a3a2a' : F.red) : k === 4 ? (dark ? '#4a5a6a' : F.blue) : (dark ? '#7a6a52' : F.plaster)} {...ol(6)} />
      {k === 1 && [0, 1, 2, 3].map((c) => <rect key={c} x={bx + 24 + c * 60} y={by + 60} width={22} height={h - 60} fill={dark ? '#3a2a20' : F.redD} />)}
      <path d={`M ${bx - 10} ${by} L ${bx + w / 2} ${by - 40} L ${bx + w + 10} ${by} Z`} fill={dark ? '#4a3a2a' : F.woodD} {...ol(5)} />
      {dark && [0, 1].map((c) => <rect key={c} x={bx + 30 + c * (w - 80)} y={by + 40} width={26} height={30} fill={F.fire} opacity={.8 + Math.sin(T * 5 + k + c) * .2} />)}
    </g>)}
    {/* sloped stone base */}
    <path d="M -1100 0 L -1060 -260 L 1060 -260 L 1100 0 Z" fill={st} {...ol()} />
    {Array.from({ length: 22 }).map((_, i) => <line key={i} x1={-1080 + i * 100} y1={-260} x2={-1090 + i * 100} y2={0} stroke={stD} strokeWidth={5} />)}
    {[0, 1, 2, 3].map((r) => <line key={'r' + r} x1={-1090} y1={-60 - r * 60} x2={1090} y2={-60 - r * 60} stroke={stD} strokeWidth={4} />)}
    {/* mud-brick upper wall */}
    <rect x={-1060} y={-400} width={2120} height={142} fill={br} {...ol()} />
    {Array.from({ length: 27 }).map((_, i) => <rect key={i} x={-1060 + i * 80} y={-440} width={50} height={44} fill={br} {...ol(5)} />)}
    {/* towers */}
    {[-760, 640].map((tx, k) => <g key={k}><path d={`M ${tx - 130} 0 L ${tx - 110} -520 L ${tx + 110} -520 L ${tx + 130} 0 Z`} fill={st} {...ol()} />
      {[0, 1, 2].map((r) => <line key={r} x1={tx - 126} y1={-120 - r * 130} x2={tx + 126} y2={-120 - r * 130} stroke={stD} strokeWidth={5} />)}
      {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={tx - 110 + i * 60} y={-560} width={40} height={42} fill={st} {...ol(5)} />)}
      <rect x={tx - 20} y={-420} width={40} height={60} fill="#2a1a12" /></g>)}
    {/* the Scaean gate */}
    <g transform="translate(-60 0)">
      <path d="M -150 0 L -140 -320 L 140 -320 L 150 0 Z" fill={stD} {...ol()} />
      <rect x={-100} y={-280} width={200} height={280} fill="#1a100a" />
      <g transform={`translate(-100 0) scale(${1 - gateOpen * .8} 1)`}><rect x={0} y={-280} width={100} height={280} fill={F.wood} {...ol(6)} />{[0, 1, 2].map((k) => <rect key={k} x={0} y={-250 + k * 90} width={100} height={14} fill={F.bronze} />)}</g>
      <g transform={`translate(100 0) scale(${-(1 - gateOpen * .8)} 1)`}><rect x={0} y={-280} width={100} height={280} fill={F.wood} {...ol(6)} />{[0, 1, 2].map((k) => <rect key={k} x={0} y={-250 + k * 90} width={100} height={14} fill={F.bronze} />)}</g>
      <rect x={-160} y={-340} width={320} height={30} fill={dark ? '#4a3a2a' : F.red} {...ol(5)} />
    </g>
    {breach && <path d="M 280 -440 L 330 -300 L 300 -180 L 360 -60 L 330 0 L 520 0 L 500 -120 L 540 -260 L 500 -440 Z" fill={dark ? '#0c0a10' : '#3a2a20'} {...ol(5)} />}
    {/* banners */}
    {[-760, 640].map((tx, k) => <g key={'b' + k}><line x1={tx} y1={-560} x2={tx} y2={-700} stroke={P.ink} strokeWidth={6} /><path d={`M ${tx} -700 q 50 ${8 + Math.sin(T * 3 + k) * 10} 100 0 l 0 40 q -50 ${-8 + Math.sin(T * 3 + k + 1) * 10} -100 0 Z`} fill={F.red} {...ol(4)} /></g>)}
    {burning > 0 && Array.from({ length: 9 }).map((_, i) => { const R = rng(i + 70); const fx = -900 + R() * 1800, fy = -440 - R() * 220; return <g key={'f' + i} opacity={burning}>
      <path d={`M ${fx - 40} ${fy} Q ${fx - 50} ${fy - 80 - Math.sin(T * 7 + i) * 20} ${fx} ${fy - 140 - Math.sin(T * 5 + i) * 30} Q ${fx + 50} ${fy - 80} ${fx + 40} ${fy} Z`} fill={F.fire} opacity={.9} />
      <path d={`M ${fx - 18} ${fy} Q ${fx - 20} ${fy - 50} ${fx} ${fy - 80 - Math.sin(T * 9 + i) * 15} Q ${fx + 20} ${fy - 50} ${fx + 18} ${fy} Z`} fill="#fff2a0" />
      {[0, 1, 2].map((k) => { const p = ((T * .25 + k / 3 + R()) % 1); return <circle key={k} cx={fx + Math.sin(p * 6 + i) * 40} cy={fy - 160 - p * 500} r={40 + p * 90} fill="#2a1a1a" opacity={(1 - p) * .55} />; })}
    </g>; })}
  </g>;
};

/* ---- black ships with painted eyes ---- */
export const Ship: React.FC<{ x: number; y: number; s?: number; flip?: boolean; T?: number; oars?: boolean; fire?: number; beached?: boolean }> = ({ x, y, s = 1, flip, T = 0, oars = true, fire = 0, beached }) => (
  <g transform={`translate(${x} ${y + (beached ? 0 : Math.sin(T * 1.4 + x) * 6)}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${beached ? -3 : Math.sin(T + x) * 1.2})`}>
    <path d="M -300 -40 Q -320 -140 -280 -170 L -260 -60 L 260 -60 Q 300 -120 330 -200 L 350 -190 Q 330 -60 290 0 L -260 0 Z" fill="#2a2420" {...ol()} />
    <path d="M -260 -60 L 260 -60" stroke={F.red} strokeWidth={10} />
    <circle cx={270} cy={-40} r={14} fill="#efe4cc" stroke={P.ink} strokeWidth={4} /><circle cx={274} cy={-40} r={6} fill={P.ink} />
    <line x1={0} y1={-60} x2={0} y2={-380} stroke={P.ink} strokeWidth={12} />
    {!beached && <path d={`M -10 -360 Q ${-180 + Math.sin(T) * 10} -260 -10 -150 Z`} fill="#efe4cc" {...ol(6)} />}
    {oars && Array.from({ length: 8 }).map((_, k) => <line key={k} x1={-200 + k * 55} y1={-30} x2={-230 + k * 55 + Math.sin(T * 3 + k) * 20} y2={60} stroke={F.woodD} strokeWidth={7} />)}
    {fire > 0 && <g opacity={fire}>{[-180, -40, 120].map((fx, k) => <g key={k}><path d={`M ${fx - 60} -60 Q ${fx - 80} ${-180 - Math.sin(T * 7 + k) * 30} ${fx} ${-280 - Math.sin(T * 5 + k) * 40} Q ${fx + 80} -180 ${fx + 60} -60 Z`} fill={F.fire} /><path d={`M ${fx - 26} -60 Q ${fx - 30} -130 ${fx} ${-180 - Math.sin(T * 9 + k) * 20} Q ${fx + 30} -130 ${fx + 26} -60 Z`} fill="#fff2a0" /></g>)}
      {[0, 1, 2, 3].map((k) => { const p = ((T * .2 + k / 4) % 1); return <circle key={'s' + k} cx={-40 + Math.sin(p * 5 + k) * 60} cy={-300 - p * 600} r={70 + p * 140} fill="#2a2020" opacity={(1 - p) * .6} />; })}</g>}
  </g>
);
export const Sea: React.FC<{ y: number; T: number; dark?: boolean; fleet?: number; fleetS?: number; fleetX?: number }> = ({ y, T, dark, fleet = 0, fleetS = .25, fleetX = 0 }) => <g>
  <rect x={-240} y={y} width={W} height={1300 - y} fill={dark ? '#1c2a3a' : F.sea} />
  {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 31); return <path key={i} d={`M ${(R() * 2400 + T * 15) % 2400 - 240} ${y + 10 + R() * 200} q 15 -7 30 0`} stroke="#fff" strokeWidth={3} fill="none" opacity={.4} />; })}
  {Array.from({ length: fleet }).map((_, i) => { const R = rng(i + 90); return <Ship key={i} x={fleetX + 100 + R() * 1800} y={y + 20 + R() * 80 + (i % 3) * 30} s={fleetS * (.6 + R() * .5)} T={T} flip />; })}
</g>;

export const Plain: React.FC<{ T: number; y?: number; tone?: Tone; dust?: number }> = ({ T, y = 780, tone = 'day', dust = 0 }) => {
  const dark = tone === 'night' || tone === 'fire';
  return <g>
    <rect x={-240} y={y} width={W} height={1300 - y} fill={dark ? '#3a3020' : tone === 'dusk' ? '#a8804a' : F.grass} />
    <path d={`M -240 ${y + 120} Q 400 ${y + 80} 900 ${y + 150} T 2160 ${y + 110}`} stroke={dark ? '#2a3a4a' : '#7ab0c0'} strokeWidth={36} fill="none" opacity={.8} />
    {Array.from({ length: 70 }).map((_, i) => { const R = rng(i + 13); const gx = R() * 2400 - 240, gy = y + 20 + R() * 300; return <path key={i} d={`M ${gx} ${gy} l 6 -18 l 6 18 l 6 -14 l 4 14`} stroke={dark ? '#2a2418' : F.grassD} strokeWidth={4} fill="none" />; })}
    {dust > 0 && Array.from({ length: 16 }).map((_, i) => { const R = rng(i + 140); const p = (T * .15 + R()) % 1; return <ellipse key={'d' + i} cx={R() * 2200 - 140 + p * 200} cy={y + 60 + R() * 200 - p * 160} rx={160 + p * 200} ry={60 + p * 70} fill="#d8c090" opacity={dust * (1 - p) * .5} />; })}
  </g>;
};

/* ---- the horse ---- */
export const WoodenHorse: React.FC<{ x: number; y: number; s?: number; T?: number; hatch?: number; glow?: number }> = ({ x, y, s = 1, T = 0, hatch = 0, glow = 0 }) => {
  const plank = (d: string, k: number) => <path key={k} d={d} stroke="#5a3a20" strokeWidth={5} fill="none" />;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-380} y={-90} width={760} height={60} fill={F.woodD} {...ol()} />
    {[-300, -100, 100, 300].map((wx) => <g key={wx} transform={`translate(${wx} -20)`}><circle r={52} fill={F.wood} {...ol()} /><circle r={14} fill={F.bronze} stroke={P.ink} strokeWidth={5} />{[0, 1, 2].map((k) => <line key={k} x1={-46} y1={0} x2={46} y2={0} stroke={P.ink} strokeWidth={6} transform={`rotate(${k * 60})`} />)}</g>)}
    {[[-260, 1], [-150, 1], [170, 1], [280, 1]].map(([lx], k) => <path key={k} d={`M ${lx - 34} -90 L ${lx - 26} -470 L ${lx + 34} -470 L ${lx + 30} -90 Z`} fill={k % 2 ? '#a06a3a' : '#b07a44'} {...ol()} />)}
    <path d="M -380 -460 C -380 -640 -200 -700 60 -690 C 260 -690 360 -640 380 -520 C 380 -430 300 -400 200 -400 L -280 -400 C -360 -400 -380 -420 -380 -460 Z" fill="#b07a44" {...ol()} />
    {Array.from({ length: 6 }).map((_, k) => plank(`M -370 ${-600 + k * 36} Q 0 ${-620 + k * 36} 370 ${-590 + k * 36}`, k))}
    <path d="M 220 -620 C 260 -760 320 -900 380 -980 L 540 -900 C 560 -880 560 -840 530 -830 L 420 -840 C 380 -760 360 -660 350 -560 Z" fill="#b07a44" {...ol()} />
    <path d="M 240 -640 C 270 -760 320 -880 380 -980 C 330 -900 300 -800 290 -680 Z" fill="#5a3a20" {...ol(5)} />
    {[0, 1, 2, 3, 4].map((k) => <path key={'m' + k} d={`M ${250 + k * 26} ${-660 - k * 60} l -50 -30`} stroke="#3a2414" strokeWidth={14} strokeLinecap="round" />)}
    <path d="M 380 -980 L 392 -1040 L 420 -990" fill="#b07a44" {...ol(6)} />
    <circle cx={450} cy={-910} r={20} fill="#efe4cc" stroke={P.ink} strokeWidth={6} /><circle cx={456} cy={-910} r={9} fill={P.ink} />
    {glow > 0 && <circle cx={450} cy={-910} r={40} fill="#ffcf6a" opacity={glow * .5} />}
    <path d="M -380 -560 C -460 -540 -480 -460 -470 -360" stroke="#5a3a20" strokeWidth={30} fill="none" strokeLinecap="round" />
    {/* hidden hatch */}
    <g transform="translate(-60 -400)"><rect x={-60} y={-4} width={120} height={hatch * 90} fill="#120a06" />{hatch > 0 && <rect x={-60} y={-4 + hatch * 80} width={120} height={14} fill={F.wood} stroke={P.ink} strokeWidth={4} />}
      {hatch > 0 && <line x1={-20} y1={0} x2={-30} y2={hatch * 380} stroke="#c8a870" strokeWidth={8} />}{hatch > .3 && <rect x={-60} y={-4} width={120} height={hatch * 90} fill="#ffb347" opacity={.25} />}</g>
    <rect x={-120} y={-404} width={120} height={8} fill="rgba(0,0,0,.4)" />
  </g>;
};

/* ---- inside the city ---- */
export const Houses: React.FC<{ T: number; dark?: boolean; y?: number; fire?: number }> = ({ T, dark, y = 880, fire = 0 }) => <g>
  {[[-240, 360, 'a'], [120, 300, 'b'], [420, 420, 'c'], [1180, 360, 'b'], [1500, 300, 'a'], [1800, 380, 'c']].map(([hx, h, k], i) => { const c = { a: dark ? '#6a5a44' : F.plaster, b: dark ? '#5a3a2a' : F.ochre, c: dark ? '#4a3a32' : '#e8d0a8' }[k as string]; return <g key={i}>
    <rect x={+hx} y={y - +h} width={300} height={+h} fill={c} {...ol()} /><rect x={+hx - 10} y={y - +h - 24} width={320} height={24} fill={dark ? '#3a2a20' : F.woodD} {...ol(5)} />
    {[0, 1].map((w) => <rect key={w} x={+hx + 40 + w * 140} y={y - +h + 60} width={60} height={70} fill={dark ? (i + w) % 2 ? '#ffcf7a' : '#1a1410' : '#3a2a20'} {...ol(5)} />)}
    <rect x={+hx + 110} y={y - 140} width={80} height={140} fill={dark ? '#1a1410' : F.redD} {...ol(5)} />
    {fire > 0 && <g opacity={fire}><path d={`M ${+hx + 20} ${y - +h - 20} Q ${+hx + 60} ${y - +h - 200 - Math.sin(T * 6 + i) * 40} ${+hx + 150} ${y - +h - 260} Q ${+hx + 260} ${y - +h - 160} ${+hx + 290} ${y - +h - 20} Z`} fill={F.fire} /><path d={`M ${+hx + 80} ${y - +h - 20} Q ${+hx + 110} ${y - +h - 120} ${+hx + 150} ${y - +h - 160 - Math.sin(T * 8 + i) * 20} Q ${+hx + 200} ${y - +h - 100} ${+hx + 230} ${y - +h - 20} Z`} fill="#fff2a0" /></g>}
  </g>; })}
  <g transform="translate(960 0)"><rect x={-260} y={y - 520} width={520} height={30} fill={dark ? '#5a4a3a' : F.plaster} {...ol()} /><path d={`M -280 ${y - 520} L 0 ${y - 640} L 280 ${y - 520} Z`} fill={dark ? '#4a2a22' : F.red} {...ol()} />
    {[-200, -100, 0, 100, 200].map((cx) => <path key={cx} d={`M ${cx - 20} ${y - 490} L ${cx - 26} ${y} L ${cx + 26} ${y} L ${cx + 20} ${y - 490} Z`} fill={dark ? '#6a5a4a' : '#efe4cc'} {...ol(5)} />)}</g>
</g>;
export const Torch: React.FC<{ x: number; y: number; T: number; s?: number }> = ({ x, y, T, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <circle cx={0} cy={-200} r={220} fill="url(#fireGlow)" opacity={.7 + Math.sin(T * 9 + x) * .1} />
  <rect x={-8} y={-180} width={16} height={180} fill={F.woodD} {...ol(4)} /><path d={`M -24 -180 Q -30 ${-240 - Math.sin(T * 8 + x) * 10} 0 ${-270 - Math.sin(T * 11 + x) * 14} Q 30 -240 24 -180 Z`} fill={F.fire} {...ol(4)} /><path d="M -10 -184 Q -12 -214 0 -232 Q 12 -214 10 -184 Z" fill="#fff2a0" />
</g>;
export const Embers: React.FC<{ T: number; n?: number; o?: number }> = ({ T, n = 40, o = 1 }) => <g>{Array.from({ length: n }).map((_, i) => { const R = rng(i + 200); const p = (T * (.08 + R() * .1) + R()) % 1; return <circle key={i} cx={R() * 2000 - 40 + Math.sin(T * 2 + i) * 30} cy={1100 - p * 1200} r={2 + R() * 3} fill={R() > .5 ? '#ffcf6a' : '#ff8a3a'} opacity={o * (1 - p)} />; })}</g>;
export const Crowd: React.FC<{ T: number; n: number; y: number; s?: number; x0?: number; x1?: number; seed?: number; armed?: boolean; dance?: number; greek?: boolean; roman?: boolean; flip?: boolean; pose?: (i: number) => MPose }> = ({ T, n, y, s = .7, x0 = -100, x1 = 2020, seed = 0, armed, dance = 0, greek, roman, flip, pose }) => <g>
  {Array.from({ length: n }).map((_, i) => { const R = rng(i + seed * 31); const xx = x0 + (x1 - x0) * (i + R() * .6) / n; const c = citizen(i + seed); const look = roman ? legionary(i + seed) : greek ? greekSoldier(i + seed) : c.look; const age = roman || greek ? 1 : c.age;
    const b = dance ? Math.abs(Math.sin(T * 5 + i)) * 18 * dance : 0;
    return <MChar key={i} look={look} age={age} x={xx} y={y + (i % 2) * 14 - b} s={s * (.92 + R() * .12)} flip={flip ?? R() > .5} pose={{ bob: Math.sin(T * 2 + i) * 2, armF: dance ? -2.2 + Math.sin(T * 5 + i) * .4 : armed ? -.4 : .1, elbowF: dance ? .4 : .6, holdF: armed ? 'spear' : (i % 4 === 0 && dance ? 'cup' : 'none'), expr: dance ? 'laugh' : 'neutral', blink: ((T + i) % 4) < .1 ? 1 : 0, ...(pose ? pose(i) : {}) }} />; })}
</g>;

/* ---- army formation + volley ---- */
export const Army: React.FC<{ T: number; rows: number; per: number; x0: number; y0: number; dx?: number; dy?: number; s0?: number; greek?: boolean; flip?: boolean; speed?: number; charge?: number; seed?: number }> = ({ T, rows, per, x0, y0, dx = 90, dy = -26, s0 = .62, greek, flip, speed = 0, charge = 0, seed = 0 }) => <g>
  {Array.from({ length: rows }).map((_, r) => { const rr = rows - 1 - r; return <g key={r}>{Array.from({ length: per }).map((_, i) => { const R = rng(i * 13 + rr * 7 + seed); const s = s0 * (1 - rr * .09);
    const xx = x0 + i * dx * (1 - rr * .08) + (rr % 2) * dx * .5 + R() * 14 + (flip ? -1 : 1) * T * speed; const yy = y0 + rr * dy;
    return <MChar key={i} look={greek ? legionary(i + rr * 3 + seed) : greekSoldier(i + rr * 3 + seed)} x={xx} y={yy} s={s} flip={flip}
      pose={{ walk: speed || charge ? 1 : 0, run: charge, phase: T * (speed || charge ? 8 + charge * 4 : 0) + i + rr, holdF: 'spear', armF: charge ? -1.5 : -.4, elbowF: charge ? .3 : .6, propA: charge ? 70 : 0, expr: charge ? 'fierce' : 'neutral', shieldUp: charge ? .4 : 0, bob: Math.sin(T * 3 + i) * 2 }} />; })}</g>; })}
</g>;
export const Arrows: React.FC<{ t: number; n?: number; from: [number, number]; to: [number, number]; spread?: number; dur?: number; seed?: number }> = ({ t, n = 30, from, to, spread = 400, dur = 1.6, seed = 1 }) => <g>
  {Array.from({ length: n }).map((_, i) => { const R = rng(i + seed * 50); const st = R() * 1.4; const p = (t - st) / dur; if (p < 0 || p > 1) return null;
    const x0 = from[0] + (R() - .5) * spread, y0 = from[1] + (R() - .5) * 120, x1 = to[0] + (R() - .5) * spread, y1 = to[1] + (R() - .5) * 120;
    const x = lerp(x0, x1, p), y = lerp(y0, y1, p) - Math.sin(p * Math.PI) * 420; const dxv = x1 - x0, dyv = (y1 - y0) - Math.cos(p * Math.PI) * 420 * Math.PI; const a = Math.atan2(dyv, dxv) * 57.3;
    return <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}><line x1={-50} y1={0} x2={30} y2={0} stroke={P.ink} strokeWidth={5} /><path d="M 30 -7 L 46 0 L 30 7 Z" fill={P.ink} /><path d="M -50 0 l -10 -8 M -50 0 l -10 8" stroke="#efe4cc" strokeWidth={4} /></g>; })}
</g>;
export const Dust: React.FC<{ T: number; x: number; y: number; w?: number; o?: number }> = ({ T, x, y, w = 800, o = 1 }) => <g opacity={o}>{Array.from({ length: 12 }).map((_, i) => { const R = rng(i + 400); const p = (T * .4 + R()) % 1; return <ellipse key={i} cx={x + (R() - .5) * w + p * 80} cy={y - p * 140} rx={70 + p * 110} ry={40 + p * 50} fill="#d8c090" opacity={(1 - p) * .55} />; })}</g>;
export const Smoke: React.FC<{ T: number; x: number; y: number; o?: number; s?: number }> = ({ T, x, y, o = 1, s = 1 }) => <g opacity={o}>{[0, 1, 2, 3, 4].map((k) => { const p = ((T * .15 + k / 5) % 1); return <circle key={k} cx={x + Math.sin(p * 5 + k) * 80 * s + p * 120 * s} cy={y - p * 700 * s} r={(80 + p * 200) * s} fill="#2a2020" opacity={(1 - p) * .55} />; })}</g>;

