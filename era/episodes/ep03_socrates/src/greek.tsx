import React from 'react';
import { noise1, rng, clamp, lerp } from './lib';
import { P, Fire } from './art';
import { SkyG, Hills, Mist, Birds } from './sets';
import { MChar, citizen } from './chars';
import GMAP from './greecemap.json';

/* ===== Athens sets — marble, terracotta, Aegean blue ===== */
export const GR = { marble: '#f3ece0', marbleS: '#d6ccba', terra: '#c8612c', tile: '#b5432a', olive: '#6f8a3a', oliveD: '#4f6a2a', aegean: '#2f6f8f', ink: '#1d1612', wall: '#efe3cc', wallS: '#d9c8a8', black: '#17110d' };
const ol = { stroke: P.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
export { SkyG, Hills, Mist, Birds, Fire };

export const Meander: React.FC<{ x: number; y: number; w: number; s?: number; c?: string }> = ({ x, y, w, s = 1, c = GR.ink }) => {
  const u = 24 * s, n = Math.floor(w / u); let d = '';
  for (let i = 0; i < n; i++) { const a = x + i * u; d += `M ${a} ${y + u * .8} L ${a} ${y} L ${a + u * .75} ${y} L ${a + u * .75} ${y + u * .55} L ${a + u * .3} ${y + u * .55} L ${a + u * .3} ${y + u * .3} `; }
  return <g><path d={d} stroke={c} strokeWidth={4 * s} fill="none" /><line x1={x} y1={y - 8 * s} x2={x + n * u} y2={y - 8 * s} stroke={c} strokeWidth={4 * s} /><line x1={x} y1={y + u + 2 * s} x2={x + n * u} y2={y + u + 2 * s} stroke={c} strokeWidth={4 * s} /></g>;
};

export const Temple: React.FC<{ x: number; y: number; s?: number; cols?: number; tone?: number }> = ({ x, y, s = 1, cols = 8, tone = 0 }) => {
  const w = 600, cw = w / cols, m = tone ? '#6f6a7a' : GR.marble, ms = tone ? '#4f4a5a' : GR.marbleS;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2].map((k) => <rect key={k} x={-w / 2 - 40 + k * 14} y={-24 - k * 22} width={w + 80 - k * 28} height={24} fill={k % 2 ? ms : m} {...ol} strokeWidth={5} />)}
    {Array.from({ length: cols }).map((_, k) => { const cx = -w / 2 + cw * (k + .5); return <g key={k}><rect x={cx - 22} y={-330} width={44} height={262} fill={m} {...ol} strokeWidth={5} />{[-10, 0, 10].map((d) => <line key={d} x1={cx + d} y1={-322} x2={cx + d} y2={-76} stroke={ms} strokeWidth={3} />)}<rect x={cx - 30} y={-344} width={60} height={16} fill={m} {...ol} strokeWidth={4} /></g>; })}
    <rect x={-w / 2 - 34} y={-392} width={w + 68} height={50} fill={m} {...ol} strokeWidth={5} />
    {Array.from({ length: 14 }).map((_, k) => <rect key={k} x={-w / 2 - 22 + k * (w + 44) / 14} y={-384} width={14} height={34} fill={k % 2 ? GR.aegean : GR.terra} opacity={tone ? .4 : .9} />)}
    <path d={`M ${-w / 2 - 46} -392 L 0 -486 L ${w / 2 + 46} -392 Z`} fill={m} {...ol} strokeWidth={5} />
    <path d={`M ${-w / 2 + 10} -400 L 0 -470 L ${w / 2 - 10} -400 Z`} fill={tone ? '#4a4a5a' : GR.aegean} opacity={.85} />
  </g>;
};
export const Acropolis: React.FC<{ x: number; y: number; s?: number; tone?: number }> = ({ x, y, s = 1, tone = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -620 60 C -560 -40 -520 -150 -420 -180 L 440 -190 C 520 -150 560 -60 640 60 Z" fill={tone ? '#5a5060' : '#c9a878'} {...ol} />
    <path d="M -430 -180 L 450 -190 L 440 -160 L -420 -152 Z" fill={tone ? '#6a6070' : '#dcc9a0'} {...ol} strokeWidth={5} />
    {[[-480, -40], [-300, 0], [380, -30], [520, 20]].map(([cx, cy], k) => <ellipse key={k} cx={cx} cy={cy} rx={60} ry={20} fill={tone ? '#4a4050' : '#b0905e'} opacity={.6} />)}
    <Temple x={60} y={-184} s={.62} tone={tone} />
    <rect x={-330} y={-260} width={120} height={80} fill={tone ? '#6f6a7a' : GR.marble} {...ol} strokeWidth={5} />
    <path d="M -340 -260 L -270 -300 L -200 -260 Z" fill={tone ? '#6f6a7a' : GR.marble} {...ol} strokeWidth={5} />
    <line x1={-380} y1={-188} x2={-380} y2={-330} stroke={P.ink} strokeWidth={10} /><path d="M -380 -330 L -360 -300 L -380 -290" fill="#c8963c" stroke={P.ink} strokeWidth={4} />
  </g>
);
export const Cypress: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = '#2f4a2a' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M 0 -300 C 40 -220 46 -80 22 0 L -22 0 C -46 -80 -40 -220 0 -300 Z" fill={c} {...ol} strokeWidth={6} /><path d="M 0 -260 C 14 -180 16 -90 6 -20" stroke="#4a6a3a" strokeWidth={6} fill="none" /></g>
);
export const Olive: React.FC<{ x: number; y: number; s?: number; T?: number }> = ({ x, y, s = 1, T = 0 }) => {
  const R = rng(Math.round(x));
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 0 C -20 -60 -50 -110 -30 -160 M 30 0 C 20 -60 40 -100 20 -150 M -30 0 L 30 0" stroke={P.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d="M -30 0 C -20 -60 -50 -110 -30 -160 M 30 0 C 20 -60 40 -100 20 -150" stroke="#8a7a5a" strokeWidth={16} fill="none" strokeLinecap="round" />
    {Array.from({ length: 9 }).map((_, k) => <ellipse key={k} cx={-130 + R() * 260 + Math.sin(T + k) * 2} cy={-170 - R() * 110} rx={70 + R() * 40} ry={44 + R() * 20} fill={k % 2 ? GR.olive : '#86a05a'} {...ol} strokeWidth={5} />)}
    {Array.from({ length: 16 }).map((_, k) => <ellipse key={'l' + k} cx={-120 + R() * 240} cy={-160 - R() * 120} rx={10} ry={4} fill="#c8d8a8" opacity={.7} />)}
  </g>;
};
export const Amphora: React.FC<{ x: number; y: number; s?: number; c?: string; band?: string }> = ({ x, y, s = 1, c = GR.terra, band = P.ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -12 -118 L 12 -118 L 14 -100 C 46 -84 50 -30 18 0 L 6 12 L -6 12 L -18 0 C -50 -30 -46 -84 -14 -100 Z" fill={c} {...ol} strokeWidth={5} /><path d="M -14 -104 C -34 -112 -34 -92 -26 -86 M 14 -104 C 34 -112 34 -92 26 -86" stroke={P.ink} strokeWidth={5} fill="none" /><path d="M -36 -60 L 36 -60 M -38 -44 L 38 -44" stroke={band} strokeWidth={6} /></g>
);
export const Krater: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -70 -140 L 70 -140 C 64 -80 40 -50 20 -40 L 26 0 L -26 0 L -20 -40 C -40 -50 -64 -80 -70 -140 Z" fill={P.ink} {...ol} strokeWidth={5} /><path d="M -60 -120 L 60 -120 C 56 -90 40 -70 0 -64 C -40 -70 -56 -90 -60 -120 Z" fill={GR.terra} /><ellipse cx={0} cy={-140} rx={70} ry={10} fill="#5a1a2a" stroke={P.ink} strokeWidth={4} /></g>
);
export const Lamp: React.FC<{ x: number; y: number; s?: number; T: number }> = ({ x, y, s = 1, T }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle cx={0} cy={-40} r={120} fill="url(#fireGlow)" opacity={.6 + .1 * Math.sin(T * 9)} /><path d="M -30 0 C -30 -20 30 -20 34 -6 L 44 -10 L 40 0 Z" fill={GR.terra} {...ol} strokeWidth={4} /><path d={`M 40 -10 C ${36 + Math.sin(T * 11) * 3} -30 ${44} -40 ${42} -50 C 50 -34 52 -20 44 -10 Z`} fill={P.fireY} /></g>
);
export const Rooster: React.FC<{ x: number; y: number; s?: number; T: number; flip?: boolean }> = ({ x, y, s = 1, T, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d="M -50 -40 C -90 -100 -60 -140 -30 -110 C -20 -80 -10 -70 0 -70 L 30 -110 C 50 -120 60 -100 50 -80 L 40 -40 C 30 -10 -20 -10 -50 -40 Z" fill="#c8612c" {...ol} strokeWidth={5} />
    <path d="M 30 -112 l 6 -16 l 6 12 l 6 -14 l 4 16" fill="#c4302b" stroke={P.ink} strokeWidth={4} /><path d="M 52 -96 l 14 4 l -12 6" fill="#e0a838" stroke={P.ink} strokeWidth={3} />
    <circle cx={40} cy={-98} r={4} fill={P.ink} /><path d="M -10 -14 L -14 10 M 10 -14 L 14 10" stroke="#e0a838" strokeWidth={6} />
  </g>
);

/* ---- skies & city ---- */
export const SKY = { dawn: ['#f2b07a', '#fbe3c8'], day: ['#7fbde0', '#eef4f0'], dusk: ['#5a4a7a', '#f2a07a'], night: ['#0d1630', '#33406a'], storm: ['#6a6a7a', '#c8c0b0'] };
export const AthensBG: React.FC<{ T: number; tone?: keyof typeof SKY; px?: number; smoke?: boolean }> = ({ T, tone = 'day', px = 0, smoke = true }) => {
  const [top, bot] = SKY[tone]; const dark = tone === 'night' ? 1 : 0; const R = rng(5);
  return <g>
    <SkyG id={'ath' + tone} top={top} bottom={bot} />
    {tone === 'night' && Array.from({ length: 120 }).map((_, i) => <circle key={i} cx={R() * 2400 - 240} cy={R() * 600 - 100} r={R() * 2.4 + .6} fill="#fff" opacity={.4 + .4 * Math.sin(T * 2 + i)} />)}
    {tone === 'night' ? <circle cx={1540} cy={180} r={70} fill="#f4ecd0" /> : <circle cx={1500 + px * .05} cy={tone === 'dawn' || tone === 'dusk' ? 560 : 190} r={200} fill="url(#sunGlow)" />}
    <g transform={`translate(${px * .15} 0)`}><Hills y={640} amp={180} seed={3} color={dark ? '#1f2a3a' : '#9aa8a0'} /><Hills y={700} amp={110} seed={8} color={dark ? '#24303a' : '#8a9a78'} /></g>
    <g transform={`translate(${px * .35} 0)`}><Acropolis x={980} y={700} s={1} tone={dark} /></g>
    <g transform={`translate(${px * .6} 0)`}>
      {Array.from({ length: 22 }).map((_, i) => { const x = -300 + i * 120 + (i % 3) * 20, h = 70 + (i * 37) % 60; return <g key={i}><rect x={x} y={800 - h} width={110} height={h + 300} fill={dark ? '#3a3a4a' : i % 2 ? GR.wall : '#e6d6b8'} {...ol} strokeWidth={5} /><path d={`M ${x - 10} ${800 - h} L ${x + 55} ${770 - h} L ${x + 120} ${800 - h} Z`} fill={dark ? '#4a2a2a' : GR.tile} {...ol} strokeWidth={5} />{i % 2 === 0 && <rect x={x + 40} y={830 - h} width={26} height={30} fill={dark ? '#f0c060' : P.ink} opacity={dark ? .8 : .7} />}</g>; })}
      {smoke && [200, 760, 1500].map((sx, k) => <g key={k} opacity={.35}>{[0, 1, 2].map((j) => <circle key={j} cx={sx + Math.sin(T * .7 + j + k) * 20 + j * 14} cy={700 - ((T * 30 + j * 60) % 180)} r={26 + j * 10} fill={dark ? '#556' : '#e8e0d0'} />)}</g>)}
    </g>
    <Cypress x={120 + px * .8} y={980} s={1.2} c={dark ? '#1a2a22' : '#2f4a2a'} /><Cypress x={1830 + px * .8} y={990} s={1.4} c={dark ? '#1a2a22' : '#2f4a2a'} />
    <rect x={-1000} y={900} width={4000} height={600} fill={dark ? '#2a2a34' : '#d9c4a0'} />
  </g>;
};
export const Ground: React.FC<{ y: number; c?: string; c2?: string }> = ({ y, c = '#d9c4a0', c2 = '#c8b088' }) => <g><rect x={-1000} y={y} width={4000} height={1400} fill={c} />{Array.from({ length: 26 }).map((_, i) => { const R = rng(i + 77); return <ellipse key={i} cx={R() * 2400 - 200} cy={y + 30 + R() * 400} rx={40 + R() * 80} ry={6 + R() * 8} fill={c2} opacity={.6} />; })}</g>;

/* house courtyard (white walls, tiled roof, loom, altar) */
export const Courtyard: React.FC<{ T: number; tone?: 'day' | 'night'; loom?: boolean }> = ({ T, tone = 'day', loom = true }) => {
  const n = tone === 'night';
  return <g>
    <SkyG id={'cy' + tone} top={n ? '#0d1630' : '#8cc4e0'} bottom={n ? '#2a3a5a' : '#eef4f0'} />
    <rect x={-300} y={180} width={2520} height={760} fill={n ? '#4a4a58' : GR.wall} {...ol} />
    <path d="M -320 190 L 2240 190 L 2240 140 L -320 140 Z" fill={n ? '#5a2a2a' : GR.tile} {...ol} />
    {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${-300 + i * 88} 140 q 44 -26 88 0`} fill="none" stroke={P.ink} strokeWidth={5} />)}
    {[260, 1660].map((dx) => <g key={dx}><rect x={dx - 80} y={480} width={160} height={460} fill={n ? '#2a2026' : '#6a4a32'} {...ol} /><rect x={dx - 60} y={500} width={120} height={440} fill={n ? '#1a1418' : '#4a3020'} /></g>)}
    <Meander x={-280} y={250} w={2480} c={n ? '#6a6a7a' : GR.terra} />
    {[600, 1320].map((cx) => <g key={cx}><rect x={cx - 26} y={300} width={52} height={640} fill={n ? '#6a6a7a' : GR.marble} {...ol} strokeWidth={5} /><rect x={cx - 36} y={290} width={72} height={20} fill={n ? '#6a6a7a' : GR.marble} {...ol} strokeWidth={4} /></g>)}
    {loom && <g transform="translate(1040 940)"><rect x={-90} y={-330} width={14} height={330} fill="#8a6a44" {...ol} strokeWidth={4} /><rect x={76} y={-330} width={14} height={330} fill="#8a6a44" {...ol} strokeWidth={4} /><rect x={-96} y={-340} width={192} height={16} fill="#8a6a44" {...ol} strokeWidth={4} />{Array.from({ length: 12 }).map((_, k) => <line key={k} x1={-70 + k * 13} y1={-324} x2={-70 + k * 13} y2={-60} stroke="#e8dcc0" strokeWidth={3} />)}<rect x={-74} y={-300} width={150} height={110} fill={GR.aegean} opacity={.8} /><Meander x={-70} y={-290} w={140} s={.6} c="#e9d9b0" />{Array.from({ length: 12 }).map((_, k) => <circle key={'w' + k} cx={-70 + k * 13} cy={-50} r={7} fill="#9a8a6a" stroke={P.ink} strokeWidth={2} />)}</g>}
    <g transform="translate(860 940)"><rect x={-40} y={-90} width={80} height={90} fill={GR.marble} {...ol} strokeWidth={5} /><Fire x={0} y={-90} s={.35} t={T} /></g>
    <Amphora x={1820} y={940} s={.9} /><Amphora x={1900} y={950} s={.8} c="#a8743a" />
    <rect x={-1000} y={930} width={4000} height={500} fill={n ? '#3a3440' : '#cdb48c'} />
    {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-200 + i * 170} y={960} width={150} height={60} fill={n ? '#443c48' : '#d9c4a0'} stroke={n ? '#2a2430' : '#b89a70'} strokeWidth={4} />)}
    {n && <rect x={-400} y={-200} width={2800} height={1500} fill="#0a0c20" opacity={.35} />}
  </g>;
};
export const Workshop: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <AthensBG T={T} tone="day" />
    <rect x={-200} y={520} width={2400} height={30} fill="#8a6a44" {...ol} />
    {[200, 900, 1600].map((x) => <rect key={x} x={x - 14} y={540} width={28} height={420} fill="#8a6a44" {...ol} strokeWidth={5} />)}
    <path d="M -240 520 L 2200 520 L 2200 470 L -240 470 Z" fill={GR.tile} {...ol} />
    <g transform="translate(1500 940)"><path d="M -150 0 C -170 -180 -90 -260 0 -260 C 90 -260 170 -180 150 0 Z" fill="#b8865a" {...ol} /><path d="M -50 0 C -50 -50 50 -50 50 0 Z" fill={P.ink} /><Fire x={0} y={-6} s={.45} t={T} /><circle cx={0} cy={-260} r={0} />{[0, 1, 2].map((j) => <circle key={j} cx={Math.sin(T + j) * 12 + j * 10} cy={-280 - ((T * 40 + j * 50) % 150)} r={18 + j * 8} fill="#ddd6c8" opacity={.5} />)}</g>
    {[[160, 940, 1], [250, 950, .85], [330, 945, .95], [1780, 950, .9], [1860, 945, 1]].map(([x, y, s], k) => <Amphora key={k} x={x} y={y} s={s} c={k % 2 ? GR.terra : '#a8743a'} />)}
    <rect x={500} y={780} width={300} height={24} fill="#8a6a44" {...ol} strokeWidth={5} />{[540, 610, 680, 750].map((x, k) => <g key={x}><path d={`M ${x - 22} 780 C ${x - 30} 740 ${x - 16} 720 ${x} 720 C ${x + 16} 720 ${x + 30} 740 ${x + 22} 780 Z`} fill={k % 2 ? '#c8a07a' : GR.terra} {...ol} strokeWidth={4} /></g>)}
    <Ground y={940} c="#c9ad84" c2="#b8996e" />
  </g>
);
export const Wheel: React.FC<{ x: number; y: number; T: number; s?: number }> = ({ x, y, T, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-14} y={-90} width={28} height={90} fill="#6a4a2a" {...ol} strokeWidth={5} /><ellipse cx={0} cy={-90} rx={90} ry={18} fill="#8a6a44" {...ol} strokeWidth={5} /><line x1={Math.cos(T * 9) * 80} y1={-90 + Math.sin(T * 9) * 14} x2={-Math.cos(T * 9) * 80} y2={-90 - Math.sin(T * 9) * 14} stroke="#5a3a1a" strokeWidth={4} />
    <path d="M -36 -100 C -40 -150 -24 -170 -20 -190 L 20 -190 C 24 -170 40 -150 36 -100 Z" fill="#b8865a" {...ol} strokeWidth={5} /><path d={`M ${-30 + Math.sin(T * 9) * 6} -140 L ${-24 + Math.sin(T * 9) * 6} -150`} stroke="#8a5a3a" strokeWidth={4} /></g>
);
export const Agora: React.FC<{ T: number; px?: number; crowd?: number; tone?: keyof typeof SKY }> = ({ T, px = 0, crowd = 1, tone = 'day' }) => (
  <g>
    <AthensBG T={T} tone={tone} px={px} smoke={false} />
    <g transform={`translate(${px * .7} 0)`}>
      <rect x={-260} y={430} width={1500} height={36} fill={GR.marble} {...ol} /><path d="M -280 430 L 1260 430 L 1240 380 L -260 380 Z" fill={GR.tile} {...ol} />
      <Meander x={-250} y={438} w={1480} s={.7} c={GR.terra} />
      {Array.from({ length: 11 }).map((_, k) => <g key={k}><rect x={-220 + k * 140} y={466} width={36} height={440} fill={GR.marble} {...ol} strokeWidth={5} /></g>)}
      <rect x={-260} y={466} width={1500} height={440} fill="#c8b490" opacity={.35} />
      {[[1420, 'olive'], [1720, 'fish']].map(([x, kind]: any) => <g key={x}><path d={`M ${x - 150} 640 L ${x + 150} 640 L ${x + 170} 690 L ${x - 170} 690 Z`} fill={kind === 'olive' ? '#e9d9b0' : GR.aegean} {...ol} strokeWidth={5} />{[-1, 0, 1].map((q) => <path key={q} d={`M ${x + q * 100 - 50} 690 q 50 30 100 0`} fill={kind === 'olive' ? '#e9d9b0' : GR.aegean} {...ol} strokeWidth={4} />)}<rect x={x - 150} y={690} width={10} height={210} fill="#6a4a2a" /><rect x={x + 140} y={690} width={10} height={210} fill="#6a4a2a" /><rect x={x - 140} y={800} width={290} height={40} fill="#8a6a44" {...ol} strokeWidth={5} />{Array.from({ length: 7 }).map((_, k) => kind === 'olive' ? <circle key={k} cx={x - 110 + k * 36} cy={790} r={14} fill={k % 2 ? GR.olive : '#3a4a2a'} stroke={P.ink} strokeWidth={3} /> : <ellipse key={k} cx={x - 110 + k * 36} cy={790} rx={20} ry={8} fill="#9ab0c0" stroke={P.ink} strokeWidth={3} />)}</g>)}
      <g transform="translate(260 900)"><rect x={-24} y={-200} width={48} height={200} fill={GR.marble} {...ol} strokeWidth={5} /><circle cx={0} cy={-226} r={30} fill={GR.marble} {...ol} strokeWidth={5} /><path d="M -20 -230 q 20 30 40 0" stroke={P.ink} strokeWidth={8} fill="none" /></g>
    </g>
    <Ground y={900} c="#dcc8a2" c2="#ccb48a" />
    {crowd > 0 && <g opacity={crowd}>{Array.from({ length: 9 }).map((_, i) => <MChar key={i} look={citizen(i + 3)} x={-100 + i * 260 + px * .9 + Math.sin(T * .3 + i) * 30} y={1000 + (i % 2) * 20} s={.55} flip={i % 2 === 0} pose={{ walk: i % 3 === 0 ? 1 : 0, phase: T * 5 + i, blink: ((T + i) % 4) < .12 ? 1 : 0, mouth: i % 4 === 0 ? 'talk' : 'smile', open: Math.abs(Math.sin(T * 7 + i)) * .5 }} />)}</g>}
  </g>
);
export const Stoa: React.FC<{ T: number; tone?: keyof typeof SKY }> = ({ T, tone = 'day' }) => (
  <g>
    <SkyG id={'st' + tone} top={SKY[tone][0]} bottom={SKY[tone][1]} />
    <rect x={-300} y={150} width={2520} height={800} fill={tone === 'dusk' ? '#d9b89a' : '#e8dcc4'} />
    <rect x={-300} y={120} width={2520} height={70} fill={GR.marble} {...ol} /><Meander x={-280} y={135} w={2480} c={GR.terra} />
    {Array.from({ length: 9 }).map((_, k) => <g key={k}><rect x={-160 + k * 280} y={190} width={64} height={760} fill={GR.marble} {...ol} />{[-14, 0, 14].map((d) => <line key={d} x1={-128 + k * 280 + d} y1={200} x2={-128 + k * 280 + d} y2={940} stroke={GR.marbleS} strokeWidth={4} />)}</g>)}
    <rect x={-300} y={360} width={2520} height={260} fill={GR.aegean} opacity={.12} />
    {[300, 1000, 1700].map((x) => <g key={x}><rect x={x - 120} y={300} width={240} height={160} fill={GR.terra} opacity={.6} {...ol} strokeWidth={5} /><path d={`M ${x - 80} 420 q 40 -60 80 -30 q 40 -40 80 30`} stroke={P.ink} strokeWidth={6} fill="none" /></g>)}
    <rect x={-1000} y={940} width={4000} height={500} fill="#cdb894" />
    {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-200 + i * 170} y={960} width={150} height={60} fill="#dcc8a2" stroke="#b89a70" strokeWidth={4} />)}
  </g>
);
export const Palaestra: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <SkyG id="pal" top="#7fbde0" bottom="#f4f0e4" /><circle cx={1500} cy={200} r={180} fill="url(#sunGlow)" />
    <Hills y={640} amp={160} seed={12} color="#9aa8a0" />
    {Array.from({ length: 8 }).map((_, k) => <rect key={k} x={-100 + k * 300} y={330} width={44} height={420} fill={GR.marble} {...ol} strokeWidth={5} />)}
    <rect x={-200} y={300} width={2400} height={40} fill={GR.marble} {...ol} />
    <Olive x={160} y={800} s={1.1} T={T} /><Olive x={1760} y={790} s={1.2} T={T + 1} />
    <rect x={-1000} y={760} width={4000} height={700} fill="#e0c690" />
    {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 9); return <circle key={i} cx={R() * 2000} cy={790 + R() * 300} r={2 + R() * 3} fill="#b8986a" />; })}
  </g>
);
export const Theater: React.FC<{ T: number; laugh?: number; bare?: boolean }> = ({ T, laugh = 1, bare }) => (
  <g>
    {!bare && <SkyG id="thr" top="#7fbde0" bottom="#f2e6cc" />}
    {!bare && <Hills y={520} amp={140} seed={21} color="#9aa88a" />}
    {Array.from({ length: 9 }).map((_, r) => <g key={r}><path d={`M ${-200 - r * 60} ${520 + r * 50} Q 960 ${720 + r * 70} ${2120 + r * 60} ${520 + r * 50}`} stroke={GR.marbleS} strokeWidth={46} fill="none" /><path d={`M ${-200 - r * 60} ${520 + r * 50} Q 960 ${720 + r * 70} ${2120 + r * 60} ${520 + r * 50}`} stroke={P.ink} strokeWidth={3} fill="none" opacity={.4} />
      {Array.from({ length: 18 }).map((_, k) => { const u = (k + .5) / 18; const x = lerp(-200 - r * 60, 2120 + r * 60, u); const y = lerp(520 + r * 50, 520 + r * 50, u) + 4 * u * (1 - u) * (200 + r * 20) * 1 - 30 - Math.abs(Math.sin(T * 10 + k + r)) * 8 * laugh; const c = ['#c8612c', '#6f8494', '#e9d9b0', '#5f7a4a', '#8a4a3a'][(k + r) % 5]; return <g key={k}><circle cx={x} cy={y - 20} r={14} fill={['#e2b48a', '#c99468', '#b98258'][(k + r) % 3]} stroke={P.ink} strokeWidth={3} /><rect x={x - 16} y={y - 6} width={32} height={26} rx={8} fill={c} stroke={P.ink} strokeWidth={3} /></g>; })}</g>)}
  </g>
);
export const Symposium: React.FC<{ T: number; dawn?: number }> = ({ T, dawn = 0 }) => (
  <g>
    <rect x={-300} y={-200} width={2520} height={1500} fill="#8a2e22" />
    <rect x={-300} y={-200} width={2520} height={400} fill="#6a2018" />
    <Meander x={-280} y={210} w={2480} c="#e9c070" />
    {[200, 960, 1720].map((x) => <g key={x}><rect x={x - 130} y={300} width={260} height={180} fill="#f0d8a0" opacity={.18} />{/* frescoes */}<path d={`M ${x - 100} 440 q 50 -80 100 -40 q 50 -60 100 40`} stroke="#f0d8a0" strokeWidth={6} fill="none" opacity={.5} /></g>)}
    <rect x={-300} y={860} width={2520} height={500} fill="#5a3a2a" />
    {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={-300 + i * 160} y={880} width={150} height={80} fill={(i % 2) ? '#6a4a34' : '#4a2e22'} />)}
    <Lamp x={300} y={260} T={T} /><Lamp x={1620} y={260} T={T + 2} />
    {dawn > 0 && <rect x={-300} y={-200} width={2520} height={1500} fill="#f2c890" opacity={dawn * .35} />}
  </g>
);
export const Kline: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = '#e0a838' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-200} y={-90} width={400} height={50} rx={14} fill={c} {...ol} /><rect x={-200} y={-120} width={70} height={40} rx={14} fill="#f0e6d0" {...ol} strokeWidth={5} /><rect x={-190} y={-44} width={20} height={44} fill="#5a3a1a" /><rect x={170} y={-44} width={20} height={44} fill="#5a3a1a" /></g>
);
export const Delphi: React.FC<{ T: number; vapor?: number }> = ({ T, vapor = 1 }) => (
  <g>
    <SkyG id="del" top="#5a6a9a" bottom="#f2d8b0" />
    <path d="M -300 700 L 200 120 L 520 420 L 900 40 L 1400 480 L 1700 200 L 2300 700 Z" fill="#8a8a9a" {...ol} />
    <path d="M 900 40 L 1000 160 L 940 150 L 880 220 L 820 140 Z" fill="#e8e8f0" />
    <Temple x={1000} y={640} s={.8} cols={6} />
    <Cypress x={420} y={760} s={1.3} /><Cypress x={1560} y={760} s={1.1} />
    <rect x={-1000} y={740} width={4000} height={700} fill="#b8a07a" />
    <g transform="translate(960 900)"><path d="M -80 0 L -40 -180 M 80 0 L 40 -180 M 0 0 L 0 -180" stroke="#c8963c" strokeWidth={14} strokeLinecap="round" /><path d="M -80 0 L -40 -180 M 80 0 L 40 -180 M 0 0 L 0 -180" stroke={P.ink} strokeWidth={4} fill="none" /><ellipse cx={0} cy={-190} rx={70} ry={18} fill="#c8963c" {...ol} strokeWidth={5} />
      {vapor > 0 && [0, 1, 2, 3, 4].map((j) => <circle key={j} cx={Math.sin(T * 1.3 + j) * 40} cy={-60 - ((T * 50 + j * 50) % 260)} r={30 + j * 12} fill="#e8e0f0" opacity={.35 * vapor} />)}</g>
  </g>
);
export const Court: React.FC<{ T: number; jur?: number; vote?: number }> = ({ T, jur = 1, vote = 0 }) => (
  <g>
    <rect x={-300} y={-200} width={2520} height={1500} fill="#e6d6b8" />
    {Array.from({ length: 7 }).map((_, k) => <rect key={k} x={-200 + k * 340} y={60} width={56} height={900} fill={GR.marble} {...ol} strokeWidth={5} />)}
    <rect x={-300} y={20} width={2520} height={60} fill={GR.marble} {...ol} /><Meander x={-280} y={34} w={2480} c={GR.terra} />
    <g transform="translate(960 760)"><rect x={-160} y={0} width={320} height={60} fill={GR.marble} {...ol} /><rect x={-130} y={-20} width={260} height={24} fill={GR.marble} {...ol} strokeWidth={5} /></g>
    <g transform="translate(1560 820)"><path d="M -50 -160 L 50 -160 L 40 -80 L -40 -80 Z" fill={GR.terra} {...ol} strokeWidth={5} /><line x1={0} y1={-80} x2={0} y2={-6} stroke="#7fb8d8" strokeWidth={5} strokeDasharray="10 8" strokeDashoffset={-T * 60} /><path d="M -50 -40 L 50 -40 L 40 40 L -40 40 Z" fill={GR.terra} {...ol} strokeWidth={5} /><rect x={-38} y={10} width={76} height={26} fill="#7fb8d8" opacity={.7} /></g>
    <rect x={-1000} y={900} width={4000} height={600} fill="#c8b490" />
    {jur > 0 && [0, 1, 2].map((r) => <g key={r}><rect x={-300} y={800 + r * 95} width={2520} height={30} fill="#8a6a44" {...ol} strokeWidth={4} />{Array.from({ length: 13 }).map((_, k) => { const i = r * 13 + k; return <MChar key={k} look={citizen(i)} x={-120 + k * 170 + (r % 2) * 80} y={850 + r * 95} s={.5 + r * .08} pose={{ blink: ((T + i * .7) % 4) < .12 ? 1 : 0, mouth: vote ? (i % 5 < 3 ? 'flat' : 'sad') : 'flat', lookX: Math.sin(T * .4 + i) * .6, armF: vote && i % 3 === 0 ? -1.4 : .15, elbowF: .4, holdF: vote && i % 3 === 0 ? 'pebble' : 'none' }} />; })}</g>)}
  </g>
);
export const Prison: React.FC<{ T: number; lamp?: number; moon?: number }> = ({ T, lamp = 1, moon = 1 }) => (
  <g>
    <rect x={-300} y={-200} width={2520} height={1500} fill="#4a4652" />
    {Array.from({ length: 70 }).map((_, i) => { const r = Math.floor(i / 10), c = i % 10; return <rect key={i} x={-300 + c * 260 + (r % 2) * 130} y={-160 + r * 150} width={250} height={140} rx={10} fill={(i * 7) % 3 ? '#57525e' : '#5f5a66'} stroke="#322e38" strokeWidth={6} />; })}
    <g transform="translate(1300 230)"><rect x={-110} y={-80} width={220} height={160} fill="#0d1630" stroke="#2a2630" strokeWidth={10} /><circle cx={40} cy={-20} r={30} fill="#f4ecd0" opacity={moon} />{[-60, -20, 20, 60].map((x) => <rect key={x} x={x - 6} y={-80} width={12} height={160} fill="#2a2630" />)}</g>
    <path d="M 1200 310 L 1400 310 L 1700 1100 L 900 1100 Z" fill="#c8d8f0" opacity={.1 * moon} />
    <rect x={-1000} y={900} width={4000} height={600} fill="#3a3640" />
    <rect x={520} y={780} width={600} height={60} fill="#6a6470" {...ol} /><rect x={540} y={840} width={40} height={70} fill="#4a4652" {...ol} strokeWidth={5} /><rect x={1060} y={840} width={40} height={70} fill="#4a4652" {...ol} strokeWidth={5} />
    {lamp > 0 && <g opacity={lamp}><Lamp x={420} y={770} T={T} s={1.2} /><rect x={-300} y={-200} width={2520} height={1500} fill="url(#lampWash)" /></g>}
  </g>
);
export const Sea: React.FC<{ T: number; ships?: number }> = ({ T, ships = 3 }) => (
  <g>
    <SkyG id="sea" top="#6a8aaa" bottom="#f0dcc0" />
    <Hills y={560} amp={120} seed={31} color="#8a9a8a" />
    <rect x={-1000} y={560} width={4000} height={900} fill={GR.aegean} />
    {Array.from({ length: 24 }).map((_, i) => { const R = rng(i + 50); const y = 600 + R() * 450; return <path key={i} d={`M ${(R() * 2400 + T * 40 * (1 + y / 1000)) % 2400 - 240} ${y} q 30 -14 60 0 q 30 -14 60 0`} stroke="#9ac8e0" strokeWidth={5} fill="none" />; })}
    {Array.from({ length: ships }).map((_, k) => <g key={k} transform={`translate(${300 + k * 600 + Math.sin(T + k) * 10} ${760 + k * 60}) scale(${.8 + k * .15})`}><path d="M -220 0 L 220 0 L 260 -40 L 240 -10 L 200 40 L -200 40 Z" fill="#5a3a22" {...ol} /><path d="M 230 -14 L 280 20" stroke={P.ink} strokeWidth={8} />{Array.from({ length: 9 }).map((_, j) => <line key={j} x1={-170 + j * 40} y1={30} x2={-190 + j * 40 + Math.sin(T * 4 + j) * 10} y2={90} stroke="#8a6a44" strokeWidth={6} />)}<line x1={0} y1={0} x2={0} y2={-240} stroke={P.ink} strokeWidth={10} /><path d="M -110 -220 L 110 -220 L 100 -60 L -100 -60 Z" fill="#efe4c8" {...ol} strokeWidth={5} /><circle cx={-190} cy={16} r={12} fill="#fff" stroke={P.ink} strokeWidth={4} /><circle cx={-190} cy={16} r={5} fill={P.ink} /></g>)}
  </g>
);
export const Phalanx: React.FC<{ T: number; x: number; y: number; n?: number; s?: number; c?: string; flip?: boolean; march?: number }> = ({ T, x, y, n = 7, s = .6, c = '#a8322a', flip, march = 1 }) => (
  <g>{Array.from({ length: n }).map((_, i) => <g key={i} transform={`translate(${x + i * 120 * s * 1.6 * (flip ? -1 : 1) + T * 20 * march * (flip ? -1 : 1)} ${y + (i % 2) * 14}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <line x1={60} y1={-420 + Math.sin(T * 4 + i) * 6} x2={60} y2={20} stroke={P.ink} strokeWidth={12} /><path d="M 52 -420 L 60 -460 L 68 -420 Z" fill="#555" stroke={P.ink} strokeWidth={4} />
    <rect x={-40} y={-120} width={80} height={120} fill={c} {...ol} /><circle cx={0} cy={-240} r={60} fill="#c8963c" {...ol} /><path d="M -40 -300 C -30 -360 30 -360 40 -300" fill={c} {...ol} strokeWidth={5} />
    <circle cx={20} cy={-150} r={90} fill="#c8963c" {...ol} /><path d="M 20 -200 L 0 -150 L 40 -150 Z" fill={c} /><text x={20} y={-120} fontFamily="Brico" fontWeight={800} fontSize={90} fill={c} textAnchor="middle">Λ</text>
  </g>)}</g>
);
export const Classroom: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <rect x={-300} y={-200} width={2520} height={1500} fill="#e8e2d4" />
    <rect x={460} y={160} width={1000} height={460} rx={10} fill="#2f4a3a" stroke="#6a4a2a" strokeWidth={18} />
    <text x={960} y={330} fontFamily="Mono" fontSize={56} fill="#e8e2d4" textAnchor="middle" opacity={.9}>WHAT IS JUSTICE?</text>
    <text x={960} y={430} fontFamily="Mono" fontSize={40} fill="#e8e2d4" textAnchor="middle" opacity={.75}>→ WHY? → ARE YOU SURE? → WHY?</text>
    {[200, 1720].map((x) => <rect key={x} x={x - 120} y={200} width={240} height={340} fill="#bfe0f0" stroke="#6a6a6a" strokeWidth={10} />)}
    <rect x={-1000} y={900} width={4000} height={600} fill="#b8a080" />
  </g>
);
export const Academy: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <SkyG id="aca" top="#8cc4e0" bottom="#f4ecd8" /><circle cx={1500} cy={240} r={200} fill="url(#sunGlow)" />
    <Hills y={640} amp={140} seed={41} color="#a0aa90" />
    <Temple x={1500} y={700} s={.45} cols={6} />
    <Olive x={200} y={860} s={1.4} T={T} /><Olive x={760} y={800} s={1.0} T={T + 1} /><Olive x={1820} y={880} s={1.3} T={T + 2} />
    <rect x={-1000} y={860} width={4000} height={600} fill="#b8b07a" />
    {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 3); return <path key={i} d={`M ${R() * 2000} ${880 + R() * 300} l -6 -18 m 6 18 l 6 -16`} stroke="#7a8a4a" strokeWidth={4} />; })}
  </g>
);

/* ---- red-figure vase frame: renders children as terracotta-on-black pottery painting ---- */
export const VaseFrame: React.FC<{ children: React.ReactNode; T: number; label?: string }> = ({ children, T, label }) => (
  <g>
    <defs>
      <filter id="redfig" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 1 0" />
        <feComponentTransfer><feFuncR type="discrete" tableValues=".09 .78 .86" /><feFuncG type="discrete" tableValues=".067 .38 .52" /><feFuncB type="discrete" tableValues=".05 .17 .28" /></feComponentTransfer>
      </filter>
      <clipPath id="vaseClip"><path d="M 560 120 L 1360 120 C 1600 200 1680 480 1560 760 C 1480 920 1320 980 960 990 C 600 980 440 920 360 760 C 240 480 320 200 560 120 Z" /></clipPath>
    </defs>
    <rect x={-300} y={-200} width={2520} height={1500} fill="#e6d6b8" />
    <path d="M 560 120 L 1360 120 C 1600 200 1680 480 1560 760 C 1480 920 1320 980 960 990 C 600 980 440 920 360 760 C 240 480 320 200 560 120 Z" fill={GR.black} stroke={P.ink} strokeWidth={12} />
    <path d="M 600 120 C 520 40 540 -40 640 -60 L 1280 -60 C 1380 -40 1400 40 1320 120" fill={GR.black} stroke={P.ink} strokeWidth={12} />
    <path d="M 560 180 C 380 160 340 300 420 380 M 1360 180 C 1540 160 1580 300 1500 380" stroke={GR.black} strokeWidth={34} fill="none" strokeLinecap="round" />
    <g clipPath="url(#vaseClip)"><g filter="url(#redfig)">{children}</g></g>
    <g clipPath="url(#vaseClip)"><Meander x={360} y={150} w={1200} s={1.1} c={GR.terra} /><Meander x={360} y={880} w={1200} s={1.1} c={GR.terra} /></g>
    {label && <text x={960} y={1050} fontFamily="Mono" fontSize={30} fill={P.ink} textAnchor="middle" letterSpacing={4}>{label}</text>}
  </g>
);

/* ---- Greece map ---- */
export const GreeceMap: React.FC<{ T: number; t: number; highlight?: string[]; arrows?: [string, string, string][]; reveal?: number; dark?: number }> = ({ T, t, highlight = [], arrows = [], reveal = 1, dark = 0 }) => {
  const C: any = (GMAP as any).cities;
  return <g>
    <rect x={-300} y={-200} width={2520} height={1500} fill={dark ? '#1d2a36' : '#9ac4d8'} />
    {Array.from({ length: 20 }).map((_, i) => <path key={i} d={`M ${(i * 137 + T * 10) % 2100 - 100} ${(i * 211) % 1080} q 20 -8 40 0`} stroke="#ffffff" strokeOpacity={.35} strokeWidth={3} fill="none" />)}
    {(GMAP as any).paths.map((d: string, i: number) => <path key={i} d={d} fill={dark ? '#5a5248' : '#e9dcbc'} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />)}
    {arrows.map(([a, b, c], i) => { const [x1, y1] = C[a], [x2, y2] = C[b]; const p = clamp(t * .8 - i * .5); const mx = (x1 + x2) / 2 + (y2 - y1) * .25, my = (y1 + y2) / 2 - (x2 - x1) * .25; return <path key={i} d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} stroke={c} strokeWidth={12} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />; })}
    {Object.entries(C).map(([n, [x, y]]: any, i) => { const hl = highlight.includes(n); const o = clamp(reveal * 3 - i * .2); return <g key={n} opacity={hl ? 1 : .55 * o}><circle cx={x} cy={y} r={hl ? 9 + Math.sin(T * 4) * 2 : 5} fill={hl ? GR.terra : P.ink} stroke="#fff" strokeWidth={2.5} />{hl && <circle cx={x} cy={y} r={18 + (T * 20) % 26} fill="none" stroke={GR.terra} strokeWidth={3} opacity={1 - ((T * 20) % 26) / 26} />}{hl && <text x={x + 16} y={y + (n === 'SPARTA' ? 30 : -12)} fontFamily="Mono" fontSize={24} fill={P.ink} stroke={dark ? '#1d2a36' : '#e9dcbc'} strokeWidth={6} paintOrder="stroke">{n}</text>}</g>; })}
  </g>;
};
