import React from 'react';
import { P } from './art';
import { rng, clamp, lerp } from './lib';
import { MChar, MLook, MPose, legionary, rebel, gladiator, RC } from './chars';

/* ===== Roman Italy, 73-71 BC — "Pompeian wall-painting" look: Pompeian red, ochre, black dado, travertine, olive & cypress green ===== */
export const F = {
  plaster: '#efe6d2', ochre: '#d9a441', red: '#9b2a22', redD: '#6e1f1a', black: '#21160f', terra: '#c0643a', olive: '#6a7a3a', oliveD: '#4a5a2a', cypress: '#2f4a2a',
  sky: '#9cc4d4', sea: '#3f7f9a', seaD: '#2a5a72', stone: '#cdbb98', stoneD: '#a8957a', sand: '#e6d0a0', sandD: '#c8ae7a', wood: '#8a5a34', woodD: '#5a3a20',
  night: '#141c2a', fire: '#ffb347', bronze: '#c9913a', snow: '#eef3f6', snowS: '#c7d6e0',
};
const ol = (w = 7) => ({ stroke: P.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const W = 2400;

export type Tone = 'day' | 'dawn' | 'dusk' | 'night' | 'fire' | 'snow';
export const Sky: React.FC<{ tone?: Tone; T?: number }> = ({ tone = 'day', T = 0 }) => {
  const g = { day: ['#7fb2c8', '#efe2c0'], dawn: ['#5a6a9a', '#f4b07a'], dusk: ['#3a2f5a', '#e8844a'], night: ['#0c1220', '#26324a'], fire: ['#1a0e10', '#8a3a1a'], snow: ['#2a3448', '#6a7a90'] }[tone];
  return <g><defs><linearGradient id={`sk${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={g[0]} /><stop offset="1" stopColor={g[1]} /></linearGradient></defs>
    <rect x={-240} y={-200} width={W} height={1300} fill={`url(#sk${tone})`} />
    {tone === 'night' && Array.from({ length: 90 }).map((_, i) => { const R = rng(i + 3); return <circle key={i} cx={R() * 2200 - 140} cy={R() * 560} r={1 + R() * 2.2} fill="#f6efdc" opacity={(.4 + R() * .5) * (.7 + .3 * Math.sin(T * 2 + i))} />; })}
    {tone === 'night' && <circle cx={1560} cy={170} r={50} fill="#f2ead2" />}
    {(tone === 'dawn' || tone === 'dusk') && <circle cx={tone === 'dawn' ? 1500 : 420} cy={560} r={110} fill="#ffd27a" opacity={.9} />}
    {(tone === 'day' || tone === 'dawn' || tone === 'dusk') && [0, 1, 2].map((k) => <path key={k} d={`M ${((k * 700 + T * 12) % 2600) - 400} ${120 + k * 70} q 80 -40 160 0 q 60 -30 120 0 q 50 20 0 30 l -270 0 q -40 -10 -10 -30 Z`} fill="#fff" opacity={.5} />)}
  </g>;
};
export const Snow: React.FC<{ T: number; n?: number; o?: number; wind?: number }> = ({ T, n = 140, o = 1, wind = 60 }) => <g opacity={o}>{Array.from({ length: n }).map((_, i) => { const R = rng(i + 900); const sp = 60 + R() * 90; const y = ((R() * 1400 + T * sp) % 1400) - 200; const x = ((R() * 2600 + T * wind + Math.sin(T * 1.3 + i) * 30) % 2600) - 340; return <circle key={i} cx={x} cy={y} r={2 + R() * 4} fill="#fff" opacity={.5 + R() * .5} />; })}</g>;
export const Cypress: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = F.cypress }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-6} y={-30} width={12} height={30} fill={F.woodD} /><path d="M 0 -330 C 34 -260 44 -120 30 -30 Q 0 -18 -30 -30 C -44 -120 -34 -260 0 -330 Z" fill={c} {...ol(6)} />
  <path d="M 0 -300 C 10 -220 14 -130 8 -50" stroke="rgba(255,255,255,.12)" strokeWidth={8} fill="none" /></g>;
export const Pine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -6 0 Q -10 -120 4 -220 L 12 -220 Q 4 -120 8 0 Z" fill={F.woodD} {...ol(5)} /><ellipse cx={0} cy={-240} rx={140} ry={50} fill={F.oliveD} {...ol(6)} /><ellipse cx={-30} cy={-262} rx={90} ry={30} fill={F.olive} /></g>;
/* rolling Campanian hills; vesuvius = the quiet green mountain (no smoke: it's 73 BC) */
export const Hills: React.FC<{ T: number; y?: number; tone?: Tone; vesuv?: number; vines?: boolean; cyp?: boolean; road?: boolean }> = ({ T, y = 760, tone = 'day', vesuv = 0, vines, cyp = true, road }) => {
  const dk = tone === 'night' || tone === 'snow' ? .45 : tone === 'dusk' || tone === 'fire' ? .7 : 1;
  const sh = (c: string, k = dk) => { const n = parseInt(c.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k + (1 - k) * 40)})`; };
  return <g>
    {vesuv > 0 && <g transform={`translate(${1100} ${y + 20}) scale(${vesuv})`}><path d="M -900 0 C -600 -120 -300 -470 -120 -520 L 60 -500 C 260 -440 600 -120 900 0 Z" fill={sh('#6a7a4a')} {...ol(7)} />
      <path d="M -120 -520 L -60 -490 L 0 -510 L 60 -500" stroke={sh('#4a5a2a')} strokeWidth={10} fill="none" />
      {Array.from({ length: 16 }).map((_, i) => { const R = rng(i + 70); return <ellipse key={i} cx={-500 + R() * 1000} cy={-60 - R() * 300 * (1 - Math.abs(R() - .5))} rx={40 + R() * 40} ry={22} fill={sh('#5a6a3a')} />; })}</g>}
    <path d={`M -240 ${y} C 200 ${y - 120} 500 ${y - 40} 900 ${y - 90} C 1300 ${y - 140} 1700 ${y - 30} 2160 ${y - 80} L 2160 1300 L -240 1300 Z`} fill={sh('#9aa05a')} {...ol(6)} />
    <path d={`M -240 ${y + 80} C 300 ${y + 20} 800 ${y + 110} 1300 ${y + 50} C 1700 ${y + 10} 2000 ${y + 70} 2160 ${y + 40} L 2160 1300 L -240 1300 Z`} fill={sh('#b8b06a')} {...ol(6)} />
    {vines && Array.from({ length: 9 }).map((_, r) => <g key={r}>{Array.from({ length: 22 }).map((_, c) => <circle key={c} cx={-200 + c * 110 + (r % 2) * 55} cy={y + 120 + r * 26} r={10 + r * 1.4} fill={sh('#5a7a2a')} />)}</g>)}
    {road && <path d={`M 700 1300 C 820 ${y + 200} 940 ${y + 110} 1010 ${y + 60} L 1050 ${y + 60} C 1050 ${y + 120} 1100 ${y + 220} 1260 1300 Z`} fill={sh('#cdb88a')} {...ol(5)} />}
    {cyp && [[120, y - 30, .7], [260, y - 50, .85], [1640, y - 60, .75], [1780, y - 40, .9], [1900, y - 20, .6]].map(([cx, cy, s], k) => <Cypress key={k} x={cx} y={cy} s={s} c={sh(F.cypress)} />)}
  </g>;
};
export const Villa: React.FC<{ x: number; y: number; s?: number; fire?: number; T?: number }> = ({ x, y, s = 1, fire = 0, T = 0 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-220} y={-140} width={440} height={140} fill={F.plaster} {...ol()} /><rect x={-220} y={-40} width={440} height={40} fill={F.red} {...ol(5)} />
  <path d="M -250 -140 L 0 -210 L 250 -140 Z" fill={F.terra} {...ol()} />{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={-180 + k * 80} y={-120} width={24} height={60} fill={F.black} />)}
  {fire > 0 && <g opacity={fire}>{[-120, 40, 160].map((q, k) => <path key={k} d={`M ${q - 40} -150 Q ${q - 30} ${-240 - Math.sin(T * 7 + k) * 20} ${q} ${-300 - Math.sin(T * 9 + k) * 30} Q ${q + 30} -230 ${q + 40} -150 Z`} fill={F.fire} {...ol(4)} />)}</g>}
</g>;

/* ---- the gladiator school (ludus) of Batiatus, Capua ---- */
export const Palus: React.FC<{ x: number; y: number; s?: number; hit?: number }> = ({ x, y, s = 1, hit = 0 }) => <g transform={`translate(${x} ${y}) scale(${s}) rotate(${hit * 3})`}>
  <rect x={-24} y={-300} width={48} height={300} rx={10} fill="#9a6a3a" {...ol(6)} />{[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M -20 ${-40 - k * 46} q 20 -8 40 0`} stroke="#6a4426" strokeWidth={4} fill="none" />)}
  {[[-10, -220], [8, -160], [-6, -110], [12, -70]].map(([cx, cy], k) => <path key={'n' + k} d={`M ${cx - 10} ${cy} l 20 -6`} stroke="#5a3a20" strokeWidth={4} />)}
  <ellipse cx={0} cy={0} rx={44} ry={10} fill="rgba(0,0,0,.2)" /></g>;
export const WeaponRack: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-150} y={-240} width={300} height={20} fill={F.wood} {...ol(5)} /><rect x={-150} y={-120} width={300} height={20} fill={F.wood} {...ol(5)} />{[-140, 130].map((q) => <rect key={q} x={q} y={-250} width={14} height={250} fill={F.woodD} {...ol(4)} />)}
  {[-100, -50, 0, 50, 100].map((q, k) => <g key={k} transform={`translate(${q} -110) rotate(${k % 2 ? 4 : -4})`}><path d="M -9 0 L -9 -120 Q 0 -138 9 -120 L 9 0 Z" fill="#a8743e" {...ol(4)} /><rect x={-16} y={-6} width={32} height={8} fill="#7a5228" /></g>)}</g>;
export const Colonnade: React.FC<{ y: number; n?: number; dark?: boolean; x0?: number; dx?: number; h?: number }> = ({ y, n = 9, dark, x0 = -120, dx = 270, h = 420 }) => <g>
  {Array.from({ length: n }).map((_, i) => { const cx = x0 + i * dx; return <g key={i}>
    <rect x={cx - 26} y={y - h} width={52} height={h} fill={dark ? '#5a5048' : F.plaster} {...ol(6)} /><rect x={cx - 26} y={y - h * .45} width={52} height={h * .45} fill={dark ? '#4a1a14' : F.red} {...ol(6)} />
    {[0, 1, 2].map((k) => <line key={k} x1={cx - 12 + k * 12} y1={y - h + 20} x2={cx - 12 + k * 12} y2={y - h * .45} stroke={dark ? '#3a3028' : '#d8ccb0'} strokeWidth={3} />)}
    <rect x={cx - 38} y={y - h - 22} width={76} height={24} fill={dark ? '#6a5a4a' : F.ochre} {...ol(5)} /></g>; })}
  <rect x={-240} y={y - h - 60} width={W} height={42} fill={dark ? '#3a2a20' : F.terra} {...ol(6)} />
</g>;
export const LudusYard: React.FC<{ T: number; tone?: Tone; posts?: number[]; hits?: number[] }> = ({ T, tone = 'day', posts = [], hits = [] }) => {
  const dark = tone === 'night';
  return <g>
    <Sky tone={tone} T={T} />
    <Hills T={T} y={420} tone={tone} cyp vesuv={0} />
    <rect x={-240} y={380} width={W} height={520} fill={dark ? '#4a4038' : F.stone} {...ol()} />
    {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={-240 + i * 90} y1={380} x2={-240 + i * 90} y2={900} stroke={dark ? '#3a3028' : F.stoneD} strokeWidth={3} />)}
    {[0, 1, 2, 3, 4, 5].map((r) => <line key={'r' + r} x1={-240} y1={430 + r * 80} x2={2160} y2={430 + r * 80} stroke={dark ? '#3a3028' : F.stoneD} strokeWidth={3} />)}
    {/* cell doors with bars */}
    {Array.from({ length: 8 }).map((_, i) => { const cx = -60 + i * 290; return <g key={i}><rect x={cx - 70} y={640} width={140} height={260} fill="#1a120c" {...ol(6)} />{[0, 1, 2, 3, 4].map((k) => <line key={k} x1={cx - 56 + k * 28} y1={640} x2={cx - 56 + k * 28} y2={900} stroke={dark ? '#5a5a5a' : '#6a6a6a'} strokeWidth={9} />)}<rect x={cx - 76} y={630} width={152} height={18} fill={F.woodD} {...ol(4)} /></g>; })}
    <rect x={-240} y={360} width={W} height={60} fill={dark ? '#3a1a14' : F.red} {...ol(6)} />
    <text x={960} y={404} fontFamily="Cinzel" fontWeight={700} fontSize={40} fill={dark ? '#a8946a' : F.ochre} textAnchor="middle" letterSpacing={14}>LVDVS · LENTVLI · BATIATI</text>
    <rect x={-240} y={880} width={W} height={420} fill={dark ? '#6a5a44' : F.sand} />
    {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M -240 ${930 + i * 26} Q 960 ${920 + i * 26 + (i % 2) * 10} 2160 ${930 + i * 26}`} stroke={dark ? '#5a4a34' : F.sandD} strokeWidth={3} fill="none" opacity={.6} />)}
    {posts.map((px, k) => <Palus key={k} x={px} y={960} s={.95} hit={hits[k] || 0} />)}
  </g>;
};
export const Cell: React.FC<{ T: number; dawn?: boolean }> = ({ T, dawn }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill={dawn ? '#5a4a3e' : '#2a2420'} />
  {Array.from({ length: 12 }).map((_, r) => Array.from({ length: 10 }).map((_, c) => <rect key={r + '-' + c} x={-240 + c * 260 + (r % 2) * 130} y={-120 + r * 90} width={250} height={84} rx={8} fill={dawn ? '#6a5a4c' : '#3a322c'} stroke="#1a1410" strokeWidth={4} />))}
  <g transform="translate(1180 260)"><rect x={-110} y={-80} width={220} height={150} fill={dawn ? '#c8b8a0' : '#26324a'} {...ol(6)} />{[0, 1, 2, 3].map((k) => <line key={k} x1={-80 + k * 54} y1={-80} x2={-80 + k * 54} y2={70} stroke="#4a4a4a" strokeWidth={12} />)}{!dawn && <circle cx={50} cy={-30} r={22} fill="#f2ead2" />}</g>
  <path d="M 1070 330 L 1290 330 L 1500 1100 L 600 1100 Z" fill={dawn ? '#ffd8a0' : '#9ab0d0'} opacity={.13} />
  <rect x={-240} y={900} width={W} height={400} fill={dawn ? '#5a4a38' : '#2e2620'} />
  {Array.from({ length: 60 }).map((_, i) => { const R = rng(i + 31); return <path key={i} d={`M ${200 + R() * 1500} ${930 + R() * 120} l ${30 + R() * 30} ${-8 + R() * 16}`} stroke={dawn ? '#c8a860' : '#7a6a40'} strokeWidth={4} />; })}
  <g transform="translate(300 600)"><circle r={18} fill="none" stroke="#5a5a5a" strokeWidth={8} />{[0, 1, 2, 3].map((k) => <ellipse key={k} cx={0} cy={30 + k * 26} rx={10} ry={14} fill="none" stroke="#5a5a5a" strokeWidth={7} />)}</g>
</g>;
export const Kitchen: React.FC<{ T: number; chaos?: number }> = ({ T, chaos = 0 }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill="#3a2a20" />
  {Array.from({ length: 10 }).map((_, r) => <line key={r} x1={-240} y1={-100 + r * 100} x2={2160} y2={-100 + r * 100} stroke="#2a1e16" strokeWidth={5} />)}
  <rect x={-240} y={540} width={W} height={60} fill="#2a1e16" />
  {/* hearth */}
  <g transform="translate(1500 900)"><rect x={-260} y={-260} width={520} height={260} fill="#6a5a4a" {...ol()} /><rect x={-200} y={-200} width={400} height={200} fill="#1a100a" {...ol(5)} />
    <circle cx={0} cy={-300} r={420} fill="url(#fireGlow)" opacity={.6 + Math.sin(T * 7) * .08} />
    {[-90, 0, 90].map((q, k) => <path key={k} d={`M ${q - 50} -10 Q ${q - 40} ${-110 - Math.sin(T * 8 + k) * 16} ${q} ${-160 - Math.sin(T * 11 + k) * 20} Q ${q + 40} -100 ${q + 50} -10 Z`} fill={F.fire} {...ol(4)} />)}
    <g transform="translate(0 -170)"><path d="M -80 0 L 80 0 Q 76 70 0 76 Q -76 70 -80 0 Z" fill="#3a3a3a" {...ol(6)} /><line x1={-80} y1={0} x2={0} y2={-80} stroke={P.ink} strokeWidth={5} /><line x1={80} y1={0} x2={0} y2={-80} stroke={P.ink} strokeWidth={5} /></g></g>
  {/* wall rack of cleavers & spits */}
  <g transform="translate(560 420)"><rect x={-260} y={-14} width={520} height={20} fill={F.wood} {...ol(5)} />
    {[-220, -150, -80, -10].map((q, k) => <g key={k} transform={`translate(${q} 0) rotate(${chaos ? Math.sin(T * 20 + k) * 10 * chaos : 0})`} opacity={chaos > .5 && k % 2 === 0 ? 0 : 1}><rect x={-5} y={6} width={10} height={46} fill="#6a4426" {...ol(3)} /><path d="M -6 50 L -6 120 L 44 120 Q 52 86 44 50 Z" fill="#b8bcc0" {...ol(4)} /></g>)}
    {[70, 130, 190, 240].map((q, k) => <g key={'s' + k} opacity={chaos > .5 && k % 2 ? 0 : 1}><line x1={q} y1={6} x2={q} y2={220} stroke={P.ink} strokeWidth={8} /><line x1={q} y1={6} x2={q} y2={220} stroke="#7a7a80" strokeWidth={4} /></g>)}</g>
  {[180, 300].map((q, k) => <g key={k} transform={`translate(${q} 900)`}><path d="M -50 0 Q -80 -100 -40 -170 L -20 -200 L 20 -200 L 40 -170 Q 80 -100 50 0 Z" fill={F.terra} {...ol(6)} /></g>)}
  <rect x={-240} y={900} width={W} height={400} fill="#4a3a2c" />
  <g transform="translate(900 900)"><rect x={-260} y={-90} width={520} height={30} fill={F.wood} {...ol(5)} />{[-230, 210].map((q) => <rect key={q} x={q} y={-62} width={20} height={62} fill={F.woodD} {...ol(4)} />)}
    {[[-180, '#d89a4a'], [-60, '#a8603a'], [80, '#8a9a5a']].map(([q, c], k) => <ellipse key={k} cx={q as number} cy={-104} rx={44} ry={20} fill={c as string} {...ol(4)} />)}</g>
</g>;

/* ---- the arena: wooden stands, mixed crowd, editor's box, sand ---- */
export const ArenaCrowd: React.FC<{ T: number; y0: number; rows?: number; cheer?: number; dark?: boolean; seed?: number; thumbs?: number; wave?: number }> = ({ T, y0, rows = 4, cheer = .3, dark, seed = 0, thumbs = 0, wave = 0 }) => {
  const skins = ['#e8b88a', '#d9a070', '#c88a5a', '#f0caa0', '#9a6a42', '#6e4a30'];
  const cloth = ['#efe6d2', '#9b2a22', '#d9a441', '#6a7a3a', '#3a5f88', '#c0643a', '#7a5634', '#5a2a5a', '#efe6d2', '#d8ccb0'];
  return <g>{Array.from({ length: rows }).map((_, r) => { const rr = rows - 1 - r; const s = 1 - rr * .12; const yy = y0 - rr * 92; return <g key={r}>
    <rect x={-240} y={yy + 8} width={W} height={26} fill={dark ? '#4a3a2a' : F.wood} {...ol(5)} />
    {Array.from({ length: 34 }).map((_, i) => { const R = rng(i * 7 + rr * 131 + seed); const kind = Math.floor(R() * 10); const kid = kind === 9, woman = kind >= 6 && kind < 9, elder = kind === 5;
      const x = -220 + i * 72 + (rr % 2) * 36 + R() * 14; const hs = (kid ? .7 : 1) * s;
      const jump = Math.max(0, Math.sin(T * (5 + R() * 3) + i * 1.7)) * 14 * cheer * (R() > .3 ? 1 : 0) + Math.max(0, Math.sin(T * 3 - i * .35)) * 22 * wave;
      const armUp = cheer > .25 && R() < cheer * 1.1; const sk = skins[Math.floor(R() * 6)]; const cl = cloth[Math.floor(R() * 10)];
      const hair = elder ? '#d8d2c6' : ['#1a110a', '#3a2416', '#5a3a26', '#b0562a'][Math.floor(R() * 4)];
      return <g key={i} transform={`translate(${x} ${yy - jump}) scale(${hs})`} opacity={dark ? .75 : 1}>
        {armUp && <g transform={`rotate(${-20 + Math.sin(T * 6 + i) * 18})`}><rect x={-30} y={-130} width={14} height={60} rx={7} fill={sk} stroke={P.ink} strokeWidth={4} />{thumbs > 0 && <circle cx={-23} cy={-134} r={9} fill={sk} stroke={P.ink} strokeWidth={3} />}</g>}
        <path d="M -30 0 Q -32 -70 0 -76 Q 32 -70 30 0 Z" fill={cl} stroke={P.ink} strokeWidth={5} />
        {woman && <path d="M -32 -96 Q 0 -150 32 -96 L 38 -40 L -38 -40 Z" fill={R() > .5 ? cl : '#efe6d2'} stroke={P.ink} strokeWidth={4} />}
        <circle cx={0} cy={-98} r={24} fill={sk} stroke={P.ink} strokeWidth={5} />
        {!woman && <path d={elder ? 'M -22 -110 Q 0 -128 22 -110' : 'M -24 -102 Q -24 -128 0 -128 Q 24 -128 24 -102 Q 10 -114 -24 -102 Z'} fill={elder ? 'none' : hair} stroke={elder ? hair : P.ink} strokeWidth={elder ? 6 : 4} />}
        <circle cx={-8} cy={-100} r={3} fill={P.ink} /><circle cx={8} cy={-100} r={3} fill={P.ink} />
        <path d={cheer > .5 ? 'M -8 -88 Q 0 -78 8 -88 Z' : 'M -6 -88 L 6 -88'} fill="#5a1f17" stroke={P.ink} strokeWidth={3} />
        {kind === 3 && <ellipse cx={22} cy={-60} rx={12} ry={8} fill="#d89a4a" stroke={P.ink} strokeWidth={3} />}
      </g>; })}</g>; })}</g>;
};
export const Arena: React.FC<{ T: number; cheer?: number; thumbs?: number; wave?: number; editor?: (T: number) => React.ReactNode; tone?: Tone; gate?: number }> = ({ T, cheer = .3, thumbs = 0, wave = 0, editor, tone = 'day', gate = 0 }) => <g>
  <Sky tone={tone} T={T} />
  {/* velarium awning */}
  {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M ${-240 + i * 180} -200 L ${-240 + (i + 1) * 180} -200 L ${-140 + (i + 1) * 170} 60 Q ${-100 + i * 170 + 85} ${80 + Math.sin(T * 1.5 + i) * 6} ${-140 + i * 170} 60 Z`} fill={i % 2 ? F.red : F.plaster} {...ol(5)} opacity={.95} />)}
  <rect x={-240} y={60} width={W} height={560} fill={F.woodD} />
  <ArenaCrowd T={T} y0={560} rows={5} cheer={cheer} thumbs={thumbs} wave={wave} />
  {/* editor's box */}
  <g transform="translate(1500 470)"><rect x={-180} y={-260} width={360} height={260} fill={F.red} {...ol()} /><path d="M -210 -260 L 0 -330 L 210 -260 Z" fill={F.ochre} {...ol(6)} />
    {[-140, 140].map((q) => <rect key={q} x={q - 14} y={-260} width={28} height={260} fill={F.plaster} {...ol(5)} />)}<rect x={-180} y={-60} width={360} height={60} fill={F.black} {...ol(5)} />
    {editor && editor(T)}</g>
  {/* podium wall with painted panels */}
  <rect x={-240} y={600} width={W} height={150} fill={F.plaster} {...ol()} />
  {Array.from({ length: 12 }).map((_, i) => <g key={i}><rect x={-200 + i * 200} y={620} width={160} height={110} fill={i % 3 === 1 ? F.ochre : F.red} {...ol(4)} /><path d={`M ${-180 + i * 200} 700 q 30 -40 60 0 q 30 -40 60 0`} stroke={F.black} strokeWidth={5} fill="none" opacity={.5} /></g>)}
  {/* gate */}
  <g transform="translate(260 750)"><rect x={-110} y={-150} width={220} height={150} fill="#120c08" {...ol(6)} />{[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={-90 + k * 36} y1={-150 - gate * 140} x2={-90 + k * 36} y2={-gate * 140} stroke="#4a4a4a" strokeWidth={10} />)}</g>
  <rect x={-240} y={750} width={W} height={550} fill={F.sand} />
  {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M -240 ${790 + i * 34} Q 960 ${780 + i * 34 + (i % 2) * 12} 2160 ${790 + i * 34}`} stroke={F.sandD} strokeWidth={3} fill="none" opacity={.6} />)}
  {Array.from({ length: 10 }).map((_, i) => { const R = rng(i + 61); return <ellipse key={'b' + i} cx={R() * 1900} cy={820 + R() * 360} rx={20 + R() * 30} ry={6} fill={F.sandD} opacity={.4} />; })}
</g>;
/* impact spark: star burst + speed lines */
export const Spark: React.FC<{ x: number; y: number; p: number; s?: number; c?: string }> = ({ x, y, p, s = 1, c = '#fff4c0' }) => p <= 0 || p >= 1 ? null : <g transform={`translate(${x} ${y}) scale(${s * (.6 + p * .8)})`} opacity={1 - p}>
  <path d="M 0 -90 L 18 -20 L 90 -24 L 26 10 L 60 80 L 0 30 L -60 80 L -26 10 L -90 -24 L -18 -20 Z" fill={c} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
  {Array.from({ length: 10 }).map((_, k) => { const a = k * .628; return <line key={k} x1={Math.cos(a) * 100} y1={Math.sin(a) * 100} x2={Math.cos(a) * (150 + p * 80)} y2={Math.sin(a) * (150 + p * 80)} stroke={P.ink} strokeWidth={5} strokeLinecap="round" />; })}
</g>;

/* ---- Vesuvius: cliffs, wild vines, Glaber's camp ---- */
export const Cliff: React.FC<{ T: number; night?: boolean; vines?: number; ladder?: number }> = ({ T, night, vines = 1, ladder = 0 }) => <g>
  <path d="M -240 -200 L 900 -200 L 940 120 L 860 300 L 980 520 L 880 760 L 1000 1300 L -240 1300 Z" fill={night ? '#3a3a34' : '#8a7a5a'} {...ol()} />
  {Array.from({ length: 22 }).map((_, i) => { const R = rng(i + 140); const x = R() * 900 - 200, y = R() * 1300 - 150; return <path key={i} d={`M ${x} ${y} l ${30 + R() * 60} ${R() * 30 - 15} l ${R() * 40} ${40 + R() * 40}`} stroke={night ? '#24241f' : '#6a5a40'} strokeWidth={5} fill="none" />; })}
  {vines > 0 && Array.from({ length: 9 }).map((_, i) => { const x = 520 + i * 48; return <g key={i} opacity={vines}><path d={`M ${x} -200 C ${x + 40} 100 ${x - 30} 400 ${x + 20 + Math.sin(T + i) * 6} ${700 + (i % 3) * 120}`} stroke={night ? '#2a3a1a' : '#4f6a2a'} strokeWidth={9} fill="none" />
    {Array.from({ length: 8 }).map((_, k) => <ellipse key={k} cx={x + Math.sin(k * 1.3 + i) * 24} cy={-120 + k * 100 + (i % 2) * 40} rx={22} ry={13} fill={night ? '#2f4a22' : '#6a8a3a'} stroke={P.ink} strokeWidth={3} transform={`rotate(${k * 40} ${x} ${-120 + k * 100})`} />)}</g>; })}
  {ladder > 0 && <g transform="translate(880 -200)" opacity={clamp(ladder * 2)}>{[-30, 30].map((q) => <path key={q} d={`M ${q} 0 C ${q + 20} 400 ${q - 20} 800 ${q + 10} ${1400 * clamp(ladder)}`} stroke="#4f6a2a" strokeWidth={11} fill="none" />)}
    {Array.from({ length: 20 }).map((_, k) => k * 70 < 1400 * ladder && <line key={k} x1={-28} y1={30 + k * 70} x2={30} y2={30 + k * 70} stroke="#4f6a2a" strokeWidth={9} />)}</g>}
</g>;
export const RomanCamp: React.FC<{ T: number; x?: number; y: number; s?: number; night?: boolean; panic?: number; fire?: number }> = ({ T, x = 0, y, s = 1, night, panic = 0, fire = 0 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-200} y={-30} width={2300} height={30} fill={night ? '#4a3a2a' : F.wood} {...ol(5)} />
  {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${-200 + i * 78} -30 L ${-180 + i * 78} -96 L ${-160 + i * 78} -30`} fill={night ? '#5a4a3a' : '#9a6a3a'} {...ol(4)} />)}
  {Array.from({ length: 10 }).map((_, i) => { const tx = 40 + i * 210, ty = 150 + (i % 2) * 70; return <g key={'t' + i}><path d={`M ${tx - 80} ${ty} L ${tx} ${ty - 110} L ${tx + 80} ${ty} Z`} fill={night ? '#6a5e50' : '#e2d6b8'} {...ol(5)} /><path d={`M ${tx} ${ty - 110} L ${tx} ${ty}`} stroke={P.ink} strokeWidth={4} /></g>; })}
  {[300, 1100, 1700].map((fx, k) => <g key={'f' + k} transform={`translate(${fx} 260)`}><circle r={180} fill="url(#fireGlow)" opacity={.5} /><path d={`M -24 0 Q -20 ${-50 - Math.sin(T * 9 + k) * 10} 0 ${-70 - Math.sin(T * 7 + k) * 12} Q 20 -50 24 0 Z`} fill={F.fire} {...ol(4)} /></g>)}
  {fire > 0 && [500, 900, 1400].map((fx, k) => <g key={'b' + k} opacity={fire}><path d={`M ${fx - 70} 160 Q ${fx - 50} ${30 - Math.sin(T * 8 + k) * 20} ${fx} ${-30 - Math.sin(T * 10 + k) * 30} Q ${fx + 50} 40 ${fx + 70} 160 Z`} fill={F.fire} {...ol(4)} /></g>)}
  {Array.from({ length: 12 }).map((_, i) => { const R = rng(i + 21); const px = 100 + i * 170 + (panic ? (T * 220 * (R() > .5 ? 1 : -1)) % 400 : 0); return <MChar key={'s' + i} look={legionary(i)} x={px} y={330 + (i % 3) * 30} s={.42} flip={panic ? R() > .5 : i % 2 === 0}
    pose={{ walk: panic, run: panic, phase: T * 14 + i, holdF: panic ? 'none' : 'spear', armF: panic ? -2.6 : -.4, elbowF: panic ? .2 : .6, expr: panic ? 'scared' : 'neutral', blink: night && !panic ? 1 : 0 }} />; })}
</g>;

/* ---- crowds & armies (NEW: mixed slaves — women, elders, children) ---- */
export const Crowd: React.FC<{ T: number; n: number; y: number; s?: number; x0?: number; x1?: number; seed?: number; armed?: boolean; walk?: number; flip?: boolean; kids?: boolean; pose?: (i: number) => MPose; lookOf?: (i: number) => MLook; cheer?: number; tw?: number }> = ({ T, n, y, s = .7, x0 = -100, x1 = 2020, seed = 0, armed, walk = 0, flip, kids, pose, lookOf, cheer = 0, tw = 0 }) => <g>
  {Array.from({ length: n }).map((_, i) => { const R = rng(i + seed * 31); const xx = x0 + (x1 - x0) * (i + R() * .6) / n + walk * tw * 60 * (flip ? -1 : 1); const look = lookOf ? lookOf(i + seed) : rebel(i + seed, !!armed);
    const kid = kids && i % 6 === 3; const jump = cheer ? Math.max(0, Math.sin(T * 5 + i)) * 16 * cheer : 0;
    return <MChar key={i} look={look} x={xx} y={y + (i % 2) * 14 - jump} s={s * (.92 + R() * .12)} age={kid ? .3 : 1} flip={flip ?? R() > .5}
      pose={{ bob: Math.sin(T * 2 + i) * 2, walk, phase: T * 8 + i, armF: cheer ? -2.4 + Math.sin(T * 5 + i) * .3 : armed ? -.4 : .1, elbowF: cheer ? .3 : .6, holdF: armed && i % 3 !== 1 ? (i % 2 ? 'spear' : 'gladius') : (i % 5 === 2 ? 'bread' : 'none'), propA: armed && i % 2 === 0 ? 20 : 0, expr: cheer ? 'excited' : 'neutral', blink: ((T + i) % 4) < .1 ? 1 : 0, ...(pose ? pose(i) : {}) }} />; })}
</g>;
export const Army: React.FC<{ T: number; rows: number; per: number; x0: number; y0: number; dx?: number; dy?: number; s0?: number; roman?: boolean; flip?: boolean; speed?: number; charge?: number; seed?: number; wall?: boolean }> = ({ T, rows, per, x0, y0, dx = 90, dy = -26, s0 = .62, roman, flip, speed = 0, charge = 0, seed = 0, wall }) => <g>
  {Array.from({ length: rows }).map((_, r) => { const rr = rows - 1 - r; return <g key={r}>{Array.from({ length: per }).map((_, i) => { const R = rng(i * 13 + rr * 7 + seed); const s = s0 * (1 - rr * .09);
    const xx = x0 + i * dx * (1 - rr * .08) + (roman ? 0 : (rr % 2) * dx * .5 + R() * 14) + (flip ? -1 : 1) * T * speed; const yy = y0 + rr * dy;
    return <MChar key={i} look={roman ? legionary(i + rr * 3 + seed) : rebel(i + rr * 3 + seed)} x={xx} y={yy} s={s} flip={flip}
      pose={{ walk: speed || charge ? 1 : 0, run: charge, phase: T * (speed || charge ? 8 + charge * 4 : 0) + (roman ? 0 : i + rr), holdF: roman ? 'gladius' : (i % 3 ? 'spear' : 'gladius'), armF: charge ? -1.5 : -.5, elbowF: charge ? .3 : .9, propA: charge ? 80 : 30, expr: charge ? 'fierce' : 'neutral', shieldUp: wall ? .9 : charge ? .4 : 0, bob: Math.sin(T * 3 + i) * 2 }} />; })}</g>; })}
</g>;
export const Javelins: React.FC<{ t: number; n?: number; from: [number, number]; to: [number, number]; spread?: number; dur?: number; seed?: number }> = ({ t, n = 30, from, to, spread = 400, dur = 1.4, seed = 1 }) => <g>
  {Array.from({ length: n }).map((_, i) => { const R = rng(i + seed * 50); const st = R() * 1.2; const p = (t - st) / dur; if (p < 0 || p > 1) return null;
    const x0 = from[0] + (R() - .5) * spread, y0 = from[1] + (R() - .5) * 120, x1 = to[0] + (R() - .5) * spread, y1 = to[1] + (R() - .5) * 120;
    const x = lerp(x0, x1, p), y = lerp(y0, y1, p) - Math.sin(p * Math.PI) * 360; const dxv = x1 - x0, dyv = (y1 - y0) - Math.cos(p * Math.PI) * 360 * Math.PI; const a = Math.atan2(dyv, dxv) * 57.3;
    return <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}><line x1={-80} y1={0} x2={30} y2={0} stroke={P.ink} strokeWidth={6} /><line x1={-80} y1={0} x2={10} y2={0} stroke="#8a5a34" strokeWidth={3} /><path d="M 30 -5 L 52 0 L 30 5 Z" fill="#7a7a80" stroke={P.ink} strokeWidth={2} /></g>; })}
</g>;
export const Torch: React.FC<{ x: number; y: number; T: number; s?: number }> = ({ x, y, T, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <circle cx={0} cy={-200} r={220} fill="url(#fireGlow)" opacity={.7 + Math.sin(T * 9 + x) * .1} />
  <rect x={-8} y={-180} width={16} height={180} fill={F.woodD} {...ol(4)} /><path d={`M -24 -180 Q -30 ${-240 - Math.sin(T * 8 + x) * 10} 0 ${-270 - Math.sin(T * 11 + x) * 14} Q 30 -240 24 -180 Z`} fill={F.fire} {...ol(4)} /><path d="M -10 -184 Q -12 -214 0 -232 Q 12 -214 10 -184 Z" fill="#fff2a0" />
</g>;
export const Campfire: React.FC<{ x: number; y: number; T: number; s?: number }> = ({ x, y, T, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <circle cx={0} cy={-60} r={260} fill="url(#fireGlow)" opacity={.6 + Math.sin(T * 7 + x) * .08} />
  {[-1, 1].map((q) => <rect key={q} x={-60} y={-12} width={120} height={18} rx={8} fill={F.woodD} {...ol(4)} transform={`rotate(${q * 18})`} />)}
  {[-26, 0, 26].map((q, k) => <path key={k} d={`M ${q - 22} 0 Q ${q - 18} ${-50 - Math.sin(T * 8 + k + x) * 10} ${q} ${-80 - Math.sin(T * 11 + k + x) * 14} Q ${q + 18} -50 ${q + 22} 0 Z`} fill={F.fire} {...ol(4)} />)}
</g>;
export const Embers: React.FC<{ T: number; n?: number; o?: number }> = ({ T, n = 40, o = 1 }) => <g>{Array.from({ length: n }).map((_, i) => { const R = rng(i + 200); const p = (T * (.08 + R() * .1) + R()) % 1; return <circle key={i} cx={R() * 2000 - 40 + Math.sin(T * 2 + i) * 30} cy={1100 - p * 1200} r={2 + R() * 3} fill={R() > .5 ? '#ffcf6a' : '#ff8a3a'} opacity={o * (1 - p)} />; })}</g>;
export const Dust: React.FC<{ T: number; x: number; y: number; w?: number; o?: number }> = ({ T, x, y, w = 800, o = 1 }) => <g opacity={o}>{Array.from({ length: 12 }).map((_, i) => { const R = rng(i + 400); const p = (T * .4 + R()) % 1; return <ellipse key={i} cx={x + (R() - .5) * w + p * 80} cy={y - p * 140} rx={70 + p * 110} ry={40 + p * 50} fill="#d8c090" opacity={(1 - p) * .55} />; })}</g>;
export const Smoke: React.FC<{ T: number; x: number; y: number; o?: number; s?: number }> = ({ T, x, y, o = 1, s = 1 }) => <g opacity={o}>{[0, 1, 2, 3, 4].map((k) => { const p = ((T * .15 + k / 5) % 1); return <circle key={k} cx={x + Math.sin(p * 5 + k) * 80 * s + p * 120 * s} cy={y - p * 700 * s} r={(80 + p * 200) * s} fill="#2a2020" opacity={(1 - p) * .55} />; })}</g>;

/* ---- the sea, pirate ships, Sicily ---- */
export const Ship: React.FC<{ x: number; y: number; s?: number; flip?: boolean; T?: number; sail?: string }> = ({ x, y, s = 1, flip, T = 0, sail = F.red }) => (
  <g transform={`translate(${x} ${y + Math.sin(T * 1.4 + x) * 6}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${Math.sin(T * 1.1 + x) * 1.5})`}>
    <path d="M -300 -40 L 300 -40 Q 290 30 220 50 L -240 50 Q -300 20 -340 -60 Z" fill="#3a2a20" {...ol()} /><path d="M 300 -40 Q 360 -60 380 -110" stroke={P.ink} strokeWidth={10} fill="none" />
    <path d="M -280 -10 L 280 -10" stroke={F.ochre} strokeWidth={8} />{Array.from({ length: 10 }).map((_, k) => <line key={k} x1={-230 + k * 50} y1={30} x2={-250 + k * 50 + Math.sin(T * 4 + k) * 20} y2={110} stroke={P.ink} strokeWidth={6} />)}
    <rect x={-8} y={-360} width={16} height={330} fill={F.woodD} {...ol(4)} /><path d={`M -150 -340 L 150 -340 Q ${160 + Math.sin(T * 2) * 10} -200 150 -90 L -150 -90 Q ${-140 + Math.sin(T * 2) * 10} -200 -150 -340 Z`} fill={sail} {...ol(6)} />
    {[0, 1, 2].map((k) => <line key={k} x1={-150} y1={-280 + k * 70} x2={150} y2={-280 + k * 70} stroke="rgba(255,255,255,.3)" strokeWidth={5} />)}
    <circle cx={-310} cy={-30} r={10} fill={F.plaster} stroke={P.ink} strokeWidth={4} /></g>);
export const Sea: React.FC<{ y: number; T: number; dark?: boolean }> = ({ y, T, dark }) => <g>
  <rect x={-240} y={y} width={W} height={1300 - y} fill={dark ? F.seaD : F.sea} />
  {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 50); const yy = y + 20 + R() * (1000 - y); return <path key={i} d={`M ${((R() * 2400 + T * 30) % 2600) - 340} ${yy} q 30 -12 60 0 q 30 -12 60 0`} stroke="rgba(255,255,255,.35)" strokeWidth={4} fill="none" />; })}
</g>;
export const Coast: React.FC<{ T: number; tone?: Tone; sicily?: boolean }> = ({ T, tone = 'day', sicily = true }) => <g>
  <Sky tone={tone} T={T} />
  {sicily && <path d="M 900 560 C 1100 500 1300 520 1500 470 C 1700 460 1900 500 2160 520 L 2160 580 L 900 580 Z" fill={tone === 'dusk' ? '#6a5a6a' : '#8aa0a8'} opacity={.8} />}
  {sicily && <path d="M 1500 480 L 1560 430 L 1620 470 Z" fill={tone === 'dusk' ? '#5a4a5a' : '#7a909a'} />}
  <Sea y={560} T={T} dark={tone === 'dusk' || tone === 'night'} />
  <path d="M -240 760 C 200 720 500 800 800 780 L 900 1300 L -240 1300 Z" fill={tone === 'dusk' ? '#8a7a5a' : F.sand} {...ol(6)} />
  <path d="M -240 860 C 200 840 500 900 860 900 L 900 1300 L -240 1300 Z" fill={tone === 'dusk' ? '#7a6a4a' : F.sandD} />
</g>;
/* ---- Crassus's ditch & wall across the toe of Italy, in snow ---- */
export const DitchWall: React.FC<{ T: number; filled?: number; breach?: number }> = ({ T, filled = 0, breach = 0 }) => <g>
  <Sky tone="snow" T={T} />
  <path d="M -240 600 C 300 560 900 620 1500 580 C 1800 560 2000 600 2160 590 L 2160 1300 L -240 1300 Z" fill="#c8d0d8" {...ol(6)} />
  {/* palisade on the far bank */}
  <g transform="translate(0 640)">{Array.from({ length: 40 }).map((_, i) => { const gap = breach > 0 && i > 16 && i < 23; return <g key={i} transform={gap ? `translate(${(i - 19.5) * 30 * breach} ${breach * 60}) rotate(${(i - 19.5) * 14 * breach} ${-200 + i * 62} 0)` : undefined}><path d={`M ${-220 + i * 62} 0 L ${-220 + i * 62} -150 L ${-196 + i * 62} -180 L ${-172 + i * 62} -150 L ${-172 + i * 62} 0 Z`} fill="#6a5040" {...ol(4)} /><path d={`M ${-212 + i * 62} -150 L ${-196 + i * 62} -168 L ${-180 + i * 62} -150 Z`} fill="#fff" /></g>; })}
    <rect x={-240} y={-80} width={W} height={14} fill="#4a3a2a" opacity={.6} /></g>
  {/* the ditch */}
  <path d="M -240 760 L 2160 740 L 2160 880 L -240 900 Z" fill="#3a3a44" {...ol(6)} />
  {filled > 0 && <path d={`M 600 ${900 - 140 * filled} L 1300 ${890 - 140 * filled} L 1300 890 L 600 900 Z`} fill="#6a5a44" {...ol(5)} />}
  {filled > 0 && Array.from({ length: 14 }).map((_, i) => <line key={i} x1={620 + i * 48} y1={890 - 130 * filled} x2={660 + i * 48} y2={880 - 100 * filled} stroke="#3a2a1a" strokeWidth={8} opacity={filled} />)}
  <rect x={-240} y={900} width={W} height={400} fill={F.snow} />
  {Array.from({ length: 18 }).map((_, i) => { const R = rng(i + 300); return <ellipse key={i} cx={R() * 2200 - 100} cy={940 + R() * 260} rx={60 + R() * 100} ry={10} fill={F.snowS} />; })}
  <Snow T={T} n={170} wind={110} />
</g>;
/* ---- the last battlefield (Silarus, Lucania) ---- */
export const Field: React.FC<{ T: number; tone?: Tone; dust?: number }> = ({ T, tone = 'dawn', dust = 0 }) => <g>
  <Sky tone={tone} T={T} />
  <Hills T={T} y={640} tone={tone} cyp={false} />
  <rect x={-240} y={720} width={W} height={600} fill={tone === 'dusk' ? '#8a7a4a' : '#a89a5a'} />
  {Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 500); return <path key={i} d={`M ${R() * 2400 - 240} ${760 + R() * 480} l 6 -18 l 6 18`} stroke="#6a6a3a" strokeWidth={4} fill="none" />; })}
  {dust > 0 && <Dust T={T} x={960} y={800} w={2400} o={dust} />}
</g>;
/* ---- the Appian Way at dusk: crosses far away, never close ---- */
export const AppianWay: React.FC<{ T: number; n?: number; reveal?: number }> = ({ T, n = 40, reveal = 1 }) => <g>
  <Sky tone="dusk" T={T} />
  <path d="M -240 560 C 300 520 700 560 1100 540 C 1500 520 1900 560 2160 550 L 2160 1300 L -240 1300 Z" fill="#6a5a3a" {...ol(5)} />
  <path d="M 900 560 L 1020 560 L 1600 1300 L 300 1300 Z" fill="#9a8a6a" {...ol(5)} />
  {Array.from({ length: 16 }).map((_, i) => { const p = i / 16; return <line key={i} x1={lerp(910, 320, p)} y1={lerp(560, 1300, p * p)} x2={lerp(1010, 1580, p)} y2={lerp(560, 1300, p * p)} stroke="#7a6a4a" strokeWidth={3 + p * 5} />; })}
  {Array.from({ length: n }).map((_, i) => { const k = Math.floor(i / 2), side = i % 2 ? 1 : -1; const p = Math.pow(1 - k / (n / 2), 2.2); const vis = clamp((reveal * n / 2 - (n / 2 - k)) * .5);
    const x = 960 + side * lerp(70, 760, p), y = lerp(560, 1080, p), h = lerp(26, 300, p);
    return <g key={i} opacity={vis * .9}><line x1={x} y1={y} x2={x} y2={y - h} stroke="#1a120c" strokeWidth={lerp(3, 16, p)} /><line x1={x - h * .28} y1={y - h * .78} x2={x + h * .28} y2={y - h * .78} stroke="#1a120c" strokeWidth={lerp(3, 14, p)} /></g>; })}
  {[[-60, 640, .9], [100, 600, .7], [1840, 620, .8], [2000, 650, 1]].map(([cx, cy, s], k) => <Cypress key={k} x={cx} y={cy} s={s} c="#1f2a1a" />)}
  <g transform="translate(1180 760)"><rect x={-26} y={-110} width={52} height={110} rx={10} fill="#b8a888" {...ol(5)} /><text x={0} y={-56} fontFamily="Cinzel" fontWeight={700} fontSize={22} textAnchor="middle" fill={P.ink}>CXII</text></g>
</g>;
/* ---- Pompeii wall today: the 'Spartaks' fresco ---- */
export const PompeiiWall: React.FC<{ T: number; reveal?: number }> = ({ T, reveal = 1 }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill="#cdb48a" />
  {Array.from({ length: 50 }).map((_, i) => { const R = rng(i + 66); return <ellipse key={i} cx={R() * 2200 - 100} cy={R() * 1200} rx={40 + R() * 200} ry={20 + R() * 70} fill={R() > .5 ? '#b89a6a' : '#e0c8a0'} opacity={.4} />; })}
  <rect x={160} y={180} width={1600} height={640} fill="#e8d6b0" {...ol(6)} />
  <g opacity={reveal}>
    <g transform="translate(560 640) scale(.9)"><path d="M -120 0 L -100 -110 L 80 -110 L 110 -20 L 200 -90 L 230 -80 L 140 0 L 120 120 M -100 -110 L -150 -60 M -60 0 L -80 130 M 60 0 L 80 130" stroke={F.red} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={-20} cy={-170} r={34} fill="none" stroke={F.red} strokeWidth={12} /><path d="M -20 -140 L -20 -40 M -20 -110 L 60 -150 M 60 -150 L 140 -220" stroke={F.red} strokeWidth={12} strokeLinecap="round" fill="none" /></g>
    <g transform="translate(1260 650) scale(-.9 .9)"><path d="M -120 0 L -100 -110 L 80 -110 L 110 -20 L 200 -90 L 230 -80 L 140 0 L 120 120 M -100 -110 L -150 -60 M -60 0 L -80 130 M 60 0 L 80 130" stroke="#5a3a20" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={-20} cy={-170} r={34} fill="none" stroke="#5a3a20" strokeWidth={12} /><path d="M -20 -140 L -20 -40 M -20 -110 L 60 -150" stroke="#5a3a20" strokeWidth={12} strokeLinecap="round" fill="none" /></g>
    <text x={560} y={360} fontFamily="Cinzel" fontWeight={700} fontSize={60} fill={F.red} textAnchor="middle" letterSpacing={10}>SPARTAKS</text>
  </g>
  {Array.from({ length: 14 }).map((_, i) => { const R = rng(i + 99); const x = 160 + R() * 1600, y = 180 + R() * 640; return <path key={i} d={`M ${x} ${y} l ${R() * 80 - 40} ${R() * 70} l ${R() * 60 - 30} ${R() * 80}`} stroke="#8a7a5a" strokeWidth={3} fill="none" />; })}
  {[[160, 180, 260, 200], [1500, 620, 260, 200]].map(([x, y, w, h], k) => <path key={k} d={`M ${x} ${y} l ${w} 0 l -60 ${h * .5} l -80 ${h * .3} l -120 ${h * .2} Z`} fill="#cdb48a" stroke="#8a7a5a" strokeWidth={4} />)}
  <rect x={-240} y={880} width={W} height={420} fill="#9a8a6a" /><rect x={-240} y={860} width={W} height={30} fill="#6a5a44" />
</g>;
export { RC };
