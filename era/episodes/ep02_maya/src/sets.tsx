import React from 'react';
import { clamp, lerp, noise1, rng } from './lib';
import { P, Fire } from './art';
import MAP from './mapdata.json';

/* ===== shared ===== */
const ol = { stroke: P.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
export const SkyG: React.FC<{ id: string; top: string; bottom: string }> = ({ id, top, bottom }) => (
  <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
    <rect x={-1500} y={-1000} width={4920} height={3080} fill={`url(#${id})`} /></>
);
export const Hills: React.FC<{ y: number; amp: number; seed: number; color: string; w?: number; x0?: number; freq?: number }> = ({ y, amp, seed, color, w = 4000, x0 = -1000, freq = .004 }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) { const x = x0 + i / 80 * w; pts.push(`${x},${y - (noise1(x * freq, seed) * .7 + noise1(x * freq * 3, seed + 2) * .3 + .5) * amp}`); }
  return <polygon points={`${pts.join(' ')} ${x0 + w},3000 ${x0},3000`} fill={color} />;
};
// rounded canopy blob row (rainforest)
export const Canopy: React.FC<{ y: number; seed: number; color: string; color2?: string; n?: number; r?: number; w?: number; x0?: number; T?: number }> = ({ y, seed, color, color2, n = 22, r = 120, w = 3200, x0 = -600, T = 0 }) => {
  const R = rng(seed);
  const blobs = Array.from({ length: n }).map((_, i) => [x0 + i / n * w + R() * 60, y - R() * r * .6, r * (.7 + R() * .6)]);
  return <g>
    <rect x={x0 - 200} y={y} width={w + 400} height={2000} fill={color} />
    {blobs.map(([x, yy, rr], i) => <circle key={i} cx={x + Math.sin(T * .6 + i) * 3} cy={yy} r={rr} fill={color} />)}
    {color2 && blobs.map(([x, yy, rr], i) => <circle key={'h' + i} cx={x - rr * .25} cy={yy - rr * .3} r={rr * .45} fill={color2} opacity={.5} />)}
  </g>;
};
export const Palm: React.FC<{ x: number; y: number; s?: number; T?: number; c?: string }> = ({ x, y, s = 1, T = 0, c = '#2f6b3a' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -8 0 C -4 -120 10 -240 24 -330 L 40 -330 C 30 -240 18 -120 14 0 Z" fill="#7a5a3a" {...ol} />
    {Array.from({ length: 8 }).map((_, k) => { const a = -170 + k * 25 + Math.sin(T + k) * 3; return <path key={k} transform={`translate(32 -330) rotate(${a})`} d="M 0 0 C 60 -30 140 -20 200 30 C 140 0 60 0 0 10 Z" fill={c} {...ol} strokeWidth={5} />; })}
  </g>
);
export const Ceiba: React.FC<{ x: number; y: number; s?: number; c?: string; c2?: string }> = ({ x, y, s = 1, c = '#2b5e34', c2 = '#4f8a46' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -120 0 C -60 -20 -50 -60 -40 -200 L -30 -620 L 30 -620 L 40 -200 C 50 -60 60 -20 120 0 Z" fill="#8a7a62" {...ol} />
    <path d="M -40 -40 L -90 0 M 40 -40 L 90 0" {...ol} />
    {[[-260, -720, 180], [-60, -800, 220], [180, -730, 190], [340, -680, 140], [-400, -660, 130]].map(([cx, cy, r], i) => <g key={i}><ellipse cx={cx} cy={cy} rx={r * 1.4} ry={r * .7} fill={c} {...ol} /><ellipse cx={cx - r * .3} cy={cy - r * .25} rx={r * .7} ry={r * .3} fill={c2} opacity={.6} /></g>)}
    <path d="M -30 -600 L -260 -700 M 30 -600 L 240 -720 M 0 -620 L -60 -780" {...ol} strokeWidth={14} />
  </g>
);
export const BigLeaves: React.FC<{ x: number; y: number; s?: number; flip?: boolean; c?: string; T?: number }> = ({ x, y, s = 1, flip, c = '#3f7a3a', T = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {[[-60, 0], [-20, 20], [20, 10], [60, 30], [0, 40]].map(([a, d], i) => <g key={i} transform={`rotate(${a + Math.sin(T * 1.2 + i) * 2})`}>
      <path d={`M 0 0 C -40 ${-120 - d} -10 ${-260 - d} 0 ${-300 - d} C 10 ${-260 - d} 40 ${-120 - d} 0 0 Z`} fill={c} {...ol} strokeWidth={6} />
      <path d={`M 0 0 L 0 ${-290 - d}`} stroke="#2a5a2a" strokeWidth={4} /></g>)}
  </g>
);
export const Mist: React.FC<{ y: number; T: number; o?: number; c?: string }> = ({ y, T, o = .5, c = '#eef3ea' }) => (
  <g opacity={o}>{[0, 1, 2].map((k) => <ellipse key={k} cx={(k * 900 + T * 30) % 3000 - 400} cy={y + k * 30} rx={800} ry={70} fill={c} style={{ filter: 'blur(30px)' } as any} />)}</g>
);
export const Birds: React.FC<{ T: number; x: number; y: number; n?: number; c?: string }> = ({ T, x, y, n = 5, c = '#1d1612' }) => (
  <g>{Array.from({ length: n }).map((_, i) => { const f = Math.sin(T * 8 + i) * 12; const xx = x + i * 60 + T * 60, yy = y + Math.sin(i * 2) * 30; return <path key={i} d={`M ${xx - 20} ${yy + f} Q ${xx - 8} ${yy - 4} ${xx} ${yy} Q ${xx + 8} ${yy - 4} ${xx + 20} ${yy + f}`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />; })}</g>
);

/* ===== architecture ===== */
// stepped pyramid with temple & roof comb, centered at x, base on y
export const Pyramid: React.FC<{ x: number; y: number; s?: number; c?: string; c2?: string; ruin?: number; steps?: number }> = ({ x, y, s = 1, c = '#c0503a', c2 = '#e9d9b8', ruin = 0, steps = 7 }) => {
  const tiers = Array.from({ length: steps }).map((_, i) => { const w = 520 - i * 56, h = 62; return [w, -i * h]; });
  const topY = -steps * 62;
  const col = (k: number) => ruin ? (k % 2 ? '#8a8270' : '#9a9280') : (k % 2 ? c : '#b0442f');
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {tiers.map(([w, yy], i) => <path key={i} d={`M ${-w / 2} ${yy} L ${-w / 2 + 14} ${yy - 62} L ${w / 2 - 14} ${yy - 62} L ${w / 2} ${yy} Z`} fill={col(i)} {...ol} />)}
    <path d={`M -60 0 L -46 ${topY} L 46 ${topY} L 60 0 Z`} fill={ruin ? '#a49a86' : c2} {...ol} />
    {Array.from({ length: 16 }).map((_, i) => <line key={i} x1={-56 + i * .9} y1={-i * 26} x2={56 - i * .9} y2={-i * 26} stroke={ruin ? '#7a7262' : '#b8a888'} strokeWidth={3} />)}
    <rect x={-80} y={topY - 110} width={160} height={110} fill={ruin ? '#9a9280' : c} {...ol} />
    <rect x={-26} y={topY - 70} width={52} height={70} fill="#1d1612" />
    <path d={`M -50 ${topY - 110} L -40 ${topY - 230} L 40 ${topY - 230} L 50 ${topY - 110} Z`} fill={ruin ? '#8a8270' : c2} {...ol} />
    {!ruin && [-1, 0, 1].map((k) => <rect key={k} x={k * 26 - 9} y={topY - 200} width={18} height={60} rx={4} fill={c} opacity={.8} />)}
    {ruin > 0 && <g opacity={ruin}>
      {Array.from({ length: 14 }).map((_, i) => { const R = rng(i + 9); const xx = (R() - .5) * 460, yy = -R() * steps * 62; return <path key={i} d={`M ${xx} ${yy} c ${R() * 40 - 20} 40 ${R() * 60 - 30} 80 ${R() * 40 - 20} 140`} stroke="#3f7a3a" strokeWidth={10} fill="none" strokeLinecap="round" />; })}
      {Array.from({ length: 10 }).map((_, i) => { const R = rng(i + 40); return <circle key={'b' + i} cx={(R() - .5) * 480} cy={-R() * steps * 60} r={30 + R() * 50} fill="#3f7a3a" stroke={P.ink} strokeWidth={6} />; })}
      <path d={`M -120 ${topY - 110} C -200 ${topY - 60} -220 ${topY + 40} -250 ${topY + 160} M 90 ${topY - 100} C 160 ${topY - 20} 200 ${topY + 60} 230 ${topY + 200}`} stroke="#7a6a52" strokeWidth={22} fill="none" strokeLinecap="round" />
    </g>}
  </g>;
};
export const Hut: React.FC<{ x: number; y: number; s?: number; door?: boolean; smoke?: number; T?: number }> = ({ x, y, s = 1, door = true, smoke = 0, T = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-190} y={-30} width={380} height={34} fill="#b8a888" {...ol} />
    <rect x={-150} y={-190} width={300} height={162} rx={20} fill="#d9c49a" {...ol} />
    {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={-130 + i * 33} y1={-180} x2={-130 + i * 33} y2={-40} stroke="#b89a6a" strokeWidth={4} />)}
    <path d="M -200 -170 L 0 -400 L 200 -170 Z" fill="#c9a24e" {...ol} />
    {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${-180 + i * 40} -176 L ${-60 + i * 12} -330`} stroke="#9a7a32" strokeWidth={5} />)}
    {door && <path d="M -34 -30 L -34 -120 Q 0 -150 34 -120 L 34 -30 Z" fill="#2a1a10" {...ol} />}
    {smoke > 0 && [0, 1, 2].map((k) => <circle key={k} cx={Math.sin(T + k) * 20 + k * 6} cy={-420 - ((T * 40 + k * 60) % 180)} r={20 + k * 8} fill="#d8d4cc" opacity={smoke * (.5 - k * .12)} />)}
  </g>
);
export const Stela: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-260} width={100} height={260} rx={14} fill="#bdb29a" {...ol} />
    {[0, 1, 2, 3, 4].map((k) => <g key={k}><rect x={-38} y={-246 + k * 48} width={34} height={38} rx={8} fill="none" stroke="#7a6e58" strokeWidth={5} /><rect x={4} y={-246 + k * 48} width={34} height={38} rx={8} fill="none" stroke="#7a6e58" strokeWidth={5} /></g>)}
  </g>
);

/* ===== food & things ===== */
export const Maize: React.FC<{ x: number; y: number; s?: number; T?: number; dry?: number }> = ({ x, y, s = 1, T = 0, dry = 0 }) => {
  const c = dry ? '#b49a5a' : '#5f9a3a', c2 = dry ? '#8a7a4a' : '#3f7a2a';
  return <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(T * 1.3 + x) * 2 + dry * 8})`}>
    <path d="M -5 0 L -3 -260 L 5 -260 L 7 0 Z" fill={c2} {...ol} strokeWidth={5} />
    {[-60, -110, -160, -205].map((yy, k) => <path key={k} d={`M 0 ${yy} C ${k % 2 ? 60 : -60} ${yy - 40 + dry * 50} ${k % 2 ? 110 : -110} ${yy + 10 + dry * 70} ${k % 2 ? 130 : -130} ${yy + 40 + dry * 90}`} stroke={c} strokeWidth={14} fill="none" strokeLinecap="round" />)}
    {!dry && <g transform="translate(10 -140) rotate(25)"><ellipse cx={0} cy={-20} rx={12} ry={30} fill="#e8c34a" {...ol} strokeWidth={4} /><path d="M -6 -50 l 0 -18 M 0 -50 l 4 -20" stroke="#c9802a" strokeWidth={3} /></g>}
    <path d="M -2 -260 l -14 -30 M 2 -260 l 4 -34 M 4 -260 l 18 -26" stroke={dry ? '#8a6a3a' : '#c9a24e'} strokeWidth={5} strokeLinecap="round" />
  </g>;
};
export const Squash: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><ellipse cx={0} cy={-30} rx={46} ry={34} fill="#e09a3a" {...ol} />{[-20, 0, 20].map((k) => <path key={k} d={`M ${k} -62 Q ${k * 1.4} -30 ${k} 2`} stroke="#b06a1a" strokeWidth={4} fill="none" />)}<path d="M -60 -10 C -90 -40 -110 -10 -130 -30" stroke="#3f7a2a" strokeWidth={8} fill="none" /><ellipse cx={-110} cy={-40} rx={30} ry={18} fill="#4f8a3a" {...ol} strokeWidth={5} /></g>
);
export const Metate: React.FC<{ x: number; y: number; s?: number; T: number; work?: number }> = ({ x, y, s = 1, T, work = 1 }) => {
  const m = Math.sin(T * 4) * 40 * work;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -130 0 L -110 -50 L 120 -80 L 140 -30 L 120 0 Z" fill="#8f877a" {...ol} />
    {[-90, 100].map((k) => <rect key={k} x={k - 14} y={-6} width={28} height={30} fill="#7a7262" {...ol} strokeWidth={5} />)}
    <ellipse cx={20} cy={-62} rx={70} ry={16} fill="#f0d68a" opacity={.9} />
    <rect x={-60 + m} y={-110} width={120} height={36} rx={18} fill="#a49a8a" {...ol} />
  </g>;
};
export const Dog: React.FC<{ x: number; y: number; s?: number; T: number; flip?: boolean }> = ({ x, y, s = 1, T, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {[-40, 30].map((k, i) => <rect key={k} x={k - 7} y={-40} width={14} height={40} rx={6} fill="#c08a52" stroke={P.ink} strokeWidth={5} transform={`rotate(${Math.sin(T * 8 + i * 3) * 8} ${k} -40)`} />)}
    <ellipse cx={0} cy={-55} rx={60} ry={28} fill="#c08a52" {...ol} />
    <path d={`M -56 -64 q -30 ${-20 + Math.sin(T * 12) * 10} -40 -40`} stroke={P.ink} strokeWidth={14} fill="none" strokeLinecap="round" /><path d={`M -56 -64 q -30 ${-20 + Math.sin(T * 12) * 10} -40 -40`} stroke="#c08a52" strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={62} cy={-80} rx={30} ry={24} fill="#c08a52" {...ol} /><path d="M 52 -100 l 4 -28 l 16 22 Z" fill="#a06a3a" {...ol} strokeWidth={5} /><circle cx={70} cy={-84} r={4} fill={P.ink} /><circle cx={90} cy={-74} r={5} fill={P.ink} />
  </g>
);
export const Turkey: React.FC<{ x: number; y: number; s?: number; T: number; flip?: boolean }> = ({ x, y, s = 1, T, flip }) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(T * 5)) * -4}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {[-12, 12].map((k) => <line key={k} x1={k} y1={-30} x2={k + 4} y2={0} stroke="#c97a3a" strokeWidth={6} />)}
    {Array.from({ length: 7 }).map((_, k) => <ellipse key={k} cx={-40} cy={-70} rx={14} ry={46} fill={k % 2 ? '#3a5a6a' : '#5a3a2a'} stroke={P.ink} strokeWidth={4} transform={`rotate(${-60 + k * 20} -20 -50)`} />)}
    <ellipse cx={0} cy={-50} rx={36} ry={28} fill="#3a3a4a" {...ol} />
    <path d="M 26 -60 C 40 -90 44 -110 40 -120" stroke={P.ink} strokeWidth={16} fill="none" strokeLinecap="round" /><path d="M 26 -60 C 40 -90 44 -110 40 -120" stroke="#4a8aa0" strokeWidth={8} fill="none" strokeLinecap="round" />
    <circle cx={42} cy={-124} r={12} fill="#4a8aa0" stroke={P.ink} strokeWidth={4} /><path d="M 50 -122 l 12 4 l -12 4" fill="#e0a838" stroke={P.ink} strokeWidth={3} /><path d="M 44 -112 q 6 14 -2 22" stroke="#c93a2e" strokeWidth={6} fill="none" />
  </g>
);
export const Jaguar: React.FC<{ x: number; y: number; s?: number; T: number; eyesOnly?: boolean }> = ({ x, y, s = 1, T, eyesOnly }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {eyesOnly ? [-18, 18].map((k) => <ellipse key={k} cx={k} cy={0} rx={10} ry={T % 3 < .15 ? 1 : 7} fill="#e8d84a" />) : <g>
      <ellipse cx={0} cy={-60} rx={110} ry={44} fill="#e0a838" {...ol} />
      {Array.from({ length: 12 }).map((_, k) => { const R = rng(k + 3); return <circle key={k} cx={-80 + R() * 160} cy={-80 + R() * 40} r={7} fill="none" stroke={P.ink} strokeWidth={4} />; })}
      <circle cx={110} cy={-86} r={36} fill="#e0a838" {...ol} /><circle cx={100} cy={-92} r={5} fill={P.ink} /><circle cx={124} cy={-92} r={5} fill={P.ink} />
      {[-70, -20, 40, 80].map((k) => <rect key={k} x={k - 10} y={-30} width={20} height={34} rx={8} fill="#e0a838" stroke={P.ink} strokeWidth={5} />)}
      <path d={`M -106 -64 C -150 ${-40 + Math.sin(T * 3) * 10} -170 -90 -150 -120`} stroke={P.ink} strokeWidth={18} fill="none" strokeLinecap="round" /><path d={`M -106 -64 C -150 ${-40 + Math.sin(T * 3) * 10} -170 -90 -150 -120`} stroke="#e0a838" strokeWidth={9} fill="none" strokeLinecap="round" />
    </g>}
  </g>
);
export const Snake: React.FC<{ x: number; y: number; s?: number; T: number }> = ({ x, y, s = 1, T }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -160 0 ${Array.from({ length: 8 }).map((_, i) => `Q ${-140 + i * 40} ${Math.sin(T * 4 + i) * 24 - 20} ${-120 + i * 40} 0`).join(' ')}`} stroke={P.ink} strokeWidth={26} fill="none" strokeLinecap="round" />
    <path d={`M -160 0 ${Array.from({ length: 8 }).map((_, i) => `Q ${-140 + i * 40} ${Math.sin(T * 4 + i) * 24 - 20} ${-120 + i * 40} 0`).join(' ')}`} stroke="#6a9a3a" strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="10 14" />
    <ellipse cx={210} cy={-6} rx={26} ry={18} fill="#6a9a3a" {...ol} strokeWidth={5} /><circle cx={218} cy={-12} r={4} fill={P.ink} /><path d={`M 234 -2 l ${10 + Math.sin(T * 20) * 6} 4`} stroke="#c93a2e" strokeWidth={4} />
  </g>
);
export const Monkey: React.FC<{ x: number; y: number; s?: number; T: number }> = ({ x, y, s = 1, T }) => {
  const roar = Math.sin(T * 3) > .3;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 30 -40 C 90 -40 100 40 60 60" stroke={P.ink} strokeWidth={16} fill="none" strokeLinecap="round" /><path d="M 30 -40 C 90 -40 100 40 60 60" stroke="#3a2a1e" strokeWidth={8} fill="none" />
    <ellipse cx={0} cy={-40} rx={40} ry={34} fill="#3a2a1e" {...ol} /><circle cx={-10} cy={-96} r={30} fill="#3a2a1e" {...ol} />
    <ellipse cx={-16} cy={-90} rx={16} ry={14} fill="#6a4a3a" /><circle cx={-22} cy={-100} r={4} fill="#e9dcc0" /><circle cx={-8} cy={-100} r={4} fill="#e9dcc0" />
    <ellipse cx={-16} cy={-82} rx={roar ? 8 : 4} ry={roar ? 10 : 2} fill="#1a0e0a" />
    {roar && [0, 1, 2].map((k) => <path key={k} d={`M ${-60 - k * 22} ${-90 - k * 10} q -10 10 0 20`} stroke={P.chalk} strokeWidth={5} fill="none" strokeLinecap="round" />)}
  </g>;
};
export const Ball: React.FC<{ x: number; y: number; r?: number; spin?: number }> = ({ x, y, r = 38, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${spin})`}><circle r={r} fill="#2a2420" stroke={P.ink} strokeWidth={6} /><path d={`M ${-r * .5} ${-r * .4} q ${r * .3} ${-r * .2} ${r * .6} 0`} stroke="#6a625a" strokeWidth={5} fill="none" /></g>
);
export const CacaoPile: React.FC<{ x: number; y: number; s?: number; n?: number }> = ({ x, y, s = 1, n = 40 }) => {
  const R = rng(5);
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{Array.from({ length: n }).map((_, i) => { const a = R(); const row = Math.floor(Math.sqrt(i)); return <ellipse key={i} cx={(R() - .5) * (160 - row * 18)} cy={-row * 14 - R() * 6} rx={13} ry={9} fill={a > .5 ? '#5a2e1a' : '#6e3a22'} stroke={P.ink} strokeWidth={3} transform={`rotate(${R() * 60 - 30})`} />; })}</g>;
};
export const Codex: React.FC<{ x: number; y: number; s?: number; open?: number; burn?: number; seed?: number }> = ({ x, y, s = 1, open = 1, burn = 0, seed = 1 }) => {
  const R = rng(seed); const pages = 6;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: pages }).map((_, i) => { const px = (i - pages / 2) * 120 * open; const tilt = i % 2 ? 8 : -8;
      return <g key={i} transform={`translate(${px} 0) skewY(${tilt * open})`}>
        <rect x={0} y={-220} width={118} height={220} fill={burn > i / pages ? '#3a2a1e' : '#f2ead6'} {...ol} strokeWidth={5} />
        {burn <= i / pages && [0, 1, 2, 3].map((r) => [0, 1].map((c) => <g key={r + '' + c}><rect x={14 + c * 50} y={-204 + r * 52} width={40} height={40} rx={9} fill="none" stroke={R() > .5 ? '#b5432a' : P.ink} strokeWidth={5} /><circle cx={34 + c * 50} cy={-184 + r * 52} r={6} fill={R() > .4 ? P.ink : '#3f7a8a'} /></g>))}
      </g>; })}
  </g>;
};
export const GlyphBlock: React.FC<{ x: number; y: number; s?: number; seed: number; c?: string }> = ({ x, y, s = 1, seed, c = P.ink }) => {
  const R = rng(seed);
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-50} width={100} height={100} rx={26} fill="#efe4cc" stroke={c} strokeWidth={6} />
    <circle cx={-14 + R() * 10} cy={-10} r={16 + R() * 8} fill="none" stroke={c} strokeWidth={6} />
    <path d={`M ${-30} ${20} q 30 ${R() * 30 - 15} 60 0`} stroke={c} strokeWidth={6} fill="none" />
    {[0, 1, 2].map((k) => <circle key={k} cx={-20 + k * 20} cy={36} r={5} fill={c} />)}
    <path d={`M 18 ${-30} l 14 ${R() * 30}`} stroke={c} strokeWidth={6} />
  </g>;
};
export { Fire };

/* ===== map of the Maya world ===== */
export const MayaMap: React.FC<{ T: number; reveal?: number; highlight?: string[]; dots?: number; routes?: number; arrowNorth?: number; dim?: number }> = ({ T, reveal = 1, highlight = [], dots = 1, routes = 0, arrowNorth = 0, dim = 0 }) => {
  const cities = MAP.cities as Record<string, number[]>; const labels = MAP.labels as Record<string, number[]>;
  return <g>
    <rect x={-400} y={-300} width={2720} height={1680} fill="#9ec4c8" />
    {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M -100 ${i * 90 + 20} q 40 -10 80 0 t 80 0`} stroke="#b9d8d8" strokeWidth={4} fill="none" transform={`translate(${(i * 237) % 1900} 0)`} />)}
    <g opacity={reveal}>{(MAP.paths as string[]).map((d, i) => <path key={i} d={d} fill="#d9c49a" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />)}</g>
    <path d="M 760 560 C 900 520 1100 560 1240 640 C 1260 760 1150 830 1000 840 C 860 820 760 720 760 560 Z" fill="#5f9a3a" opacity={.35 * reveal * (1 - dim)} />
    {Object.entries(labels).map(([k, [x, y]]) => <text key={k} x={x} y={y} textAnchor="middle" fontFamily="Mono" fontSize={k.includes('SEA') || k.includes('OCEAN') || k.includes('GULF') ? 26 : 30} letterSpacing={6} fill={k.includes('SEA') || k.includes('OCEAN') || k.includes('GULF') ? '#4f7f8a' : '#7a5a3a'} opacity={reveal * .9}>{k}</text>)}
    {routes > 0 && [['TIKAL', [600, 560]], ['TIKAL', [1500, 380]], ['TIKAL', [1080, 1000]]].map(([c, [ex, ey]]: any, i) => { const [x0, y0] = cities[c]; return <path key={i} d={`M ${x0} ${y0} Q ${(x0 + ex) / 2} ${(y0 + ey) / 2 - 80} ${ex} ${ey}`} stroke="#b5432a" strokeWidth={7} fill="none" strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - clamp(routes * 1.3 - i * .15)} strokeLinecap="round" />; })}
    {arrowNorth > 0 && <path d={`M ${cities.TIKAL[0]} ${cities.TIKAL[1] - 30} C ${cities.TIKAL[0] + 60} ${cities.TIKAL[1] - 200} ${cities['CHICHEN ITZA'][0] - 60} ${cities['CHICHEN ITZA'][1] + 200} ${cities['CHICHEN ITZA'][0]} ${cities['CHICHEN ITZA'][1] + 30}`} stroke="#b5432a" strokeWidth={10} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(arrowNorth)} strokeLinecap="round" />}
    {Object.entries(cities).map(([k, [x, y]], i) => { const on = highlight.length === 0 || highlight.includes(k); const p = clamp(dots * 3 - i * .3);
      return <g key={k} opacity={on ? p : p * .35}>
        <circle cx={x} cy={y} r={on && highlight.length ? 16 + Math.sin(T * 4) * 3 : 12} fill={on && highlight.length ? '#b5432a' : P.ink} stroke="#f4ecdc" strokeWidth={4} />
        <text x={x + 24} y={y + 10} fontFamily="Brico" fontWeight={800} fontSize={on && highlight.length ? 40 : 30} fill={P.ink} stroke="#f4ecdc" strokeWidth={8} paintOrder="stroke">{k}</text>
      </g>; })}
  </g>;
};
