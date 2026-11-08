import React from 'react';
import { P } from './art';
import { rng, clamp, lerp, easeInOut, prog } from './lib';
import { MChar, villager, CAST } from './chars';
import { Sky, Tone, Smoke, Embers, Dust } from './sets';

/* ===== Çatalhöyük, c. 6700 BC — palette: mud-brick ochre, white lime plaster, red ochre paint, soot black, marsh green, Konya-plain gold.
   NEW in ep08: a town with no streets (honeycomb roofs, ladders out of roof hatches, smoke), an interior lit only by the roof hole,
   a cutaway 'doll's house' view of the whole neighbourhood, and a time-lapse of the mound growing house on house ===== */
export const C = { mud: '#b88a5a', mudD: '#9a6e44', mudL: '#d4a978', plaster: '#f1ece0', plasterD: '#ddd4c2', ochre: '#b5432a', soot: '#2a2420', marsh: '#6a8a4a', marshD: '#4a6a3a', plain: '#d8c080', plainD: '#bca060', reed: '#a8a060', water: '#6a9aa8', fire: '#ffb347' };
const ol = (w = 7) => ({ stroke: P.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const W = 2400;

/* Hasan Dağı on the horizon: twin peaks (+ optional eruption) */
export const Volcano: React.FC<{ x: number; y: number; s?: number; T: number; erupt?: number; tone?: Tone }> = ({ x, y, s = 1, T, erupt = 0, tone = 'day' }) => {
  const k = tone === 'night' ? .45 : tone === 'dusk' ? .7 : 1;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {erupt > 0 && <g opacity={erupt}><circle cx={60} cy={-280} r={260} fill="#ff7a30" opacity={.25} />
      {[0, 1, 2, 3, 4, 5].map((i) => { const p = ((T * .25 + i / 6) % 1); return <circle key={i} cx={60 + Math.sin(p * 4 + i) * 60 + p * 140} cy={-300 - p * 520} r={60 + p * 160} fill="#3a2a2a" opacity={(1 - p) * .7} />; })}
      {Array.from({ length: 10 }).map((_, i) => { const R = rng(i + 8); const p = ((T * .8 + R()) % 1); return <circle key={'l' + i} cx={60 + (R() - .5) * 200 * p} cy={-300 - Math.sin(p * Math.PI) * 220 + p * 60} r={6} fill="#ffcf6a" />; })}</g>}
    <path d="M -420 0 C -260 -90 -120 -250 -40 -300 L 10 -270 L 60 -330 C 160 -260 300 -100 440 0 Z" fill={`rgb(${Math.round(150 * k)},${Math.round(140 * k)},${Math.round(160 * k + (1 - k) * 30)})`} {...ol(6)} />
    <path d="M -80 -276 L -40 -300 L 10 -270 L 60 -330 L 100 -300" stroke="#fff" strokeWidth={14} fill="none" opacity={erupt ? 0 : .8 * k} />
    {erupt > 0 && <path d="M 40 -320 Q 60 -250 30 -180 Q 70 -240 80 -320 Z" fill="#ff7a30" opacity={erupt} />}
  </g>;
};
export const Plain: React.FC<{ T: number; tone?: Tone; y?: number; volcano?: number; erupt?: number; marsh?: boolean }> = ({ T, tone = 'day', y = 560, volcano = 1, erupt = 0, marsh }) => {
  const k = tone === 'night' ? .45 : tone === 'dusk' || tone === 'dawn' ? .78 : 1;
  const sh = (c: string) => { const n = parseInt(c.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k + (1 - k) * 40)})`; };
  return <g>
    <Sky tone={tone} T={T} />
    {volcano > 0 && <Volcano x={1500} y={y + 10} s={.55 * volcano} T={T} erupt={erupt} tone={tone} />}
    <path d={`M -240 ${y} C 300 ${y - 20} 900 ${y + 10} 2160 ${y - 10} L 2160 1300 L -240 1300 Z`} fill={sh(C.plain)} {...ol(5)} />
    {Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 31); return <path key={i} d={`M ${R() * 2400 - 240} ${y + 40 + R() * 500} l 30 0`} stroke={sh(C.plainD)} strokeWidth={4} />; })}
    {marsh && <g><path d={`M -240 ${y + 120} C 300 ${y + 90} 800 ${y + 150} 1400 ${y + 110} C 1800 ${y + 90} 2000 ${y + 130} 2160 ${y + 120} L 2160 ${y + 220} L -240 ${y + 240} Z`} fill={sh(C.water)} {...ol(5)} />
      {Array.from({ length: 60 }).map((_, i) => { const R = rng(i + 70); const x = R() * 2400 - 240, yy = y + 110 + R() * 140; return <path key={'r' + i} d={`M ${x} ${yy} q ${4 + Math.sin(T * 2 + i) * 6} -50 ${Math.sin(T * 2 + i) * 10} -90`} stroke={sh(C.reed)} strokeWidth={5} fill="none" />; })}</g>}
  </g>;
};
export const Wheat: React.FC<{ T: number; y0: number; rows?: number; tone?: Tone }> = ({ T, y0, rows = 6, tone = 'day' }) => <g>{Array.from({ length: rows }).map((_, r) => <g key={r}>{Array.from({ length: 40 }).map((_, i) => { const x = -240 + i * 62 + (r % 2) * 31; const sw = Math.sin(T * 1.6 + i * .4 + r) * 6; const yy = y0 + r * 50;
  return <g key={i}><path d={`M ${x} ${yy} q ${sw / 2} -40 ${sw} -80`} stroke={tone === 'dusk' ? '#a88a40' : '#c8a848'} strokeWidth={4} fill="none" /><ellipse cx={x + sw} cy={yy - 90} rx={6} ry={14} fill={tone === 'dusk' ? '#c8a050' : '#e2c060'} stroke={P.ink} strokeWidth={2} /></g>; })}</g>)}</g>;

/* ---- one house seen from outside (block of mud brick with roof hatch + ladder) ---- */
export const HouseBlock: React.FC<{ x: number; y: number; w: number; h: number; T: number; ladder?: boolean; smoke?: boolean; dark?: boolean; seed?: number }> = ({ x, y, w, h, T, ladder = true, smoke = true, dark, seed = 0 }) => {
  const R = rng(seed + 5); const hx = x + w * (.3 + R() * .3);
  return <g>
    <rect x={x} y={y} width={w} height={h} fill={dark ? '#6a5040' : C.mudD} {...ol(6)} />
    <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w - 20} ${y - 30} L ${x + 20} ${y - 30} Z`} fill={dark ? '#7a6050' : C.mudL} {...ol(5)} />
    {Array.from({ length: Math.floor(h / 36) }).map((_, k) => <line key={k} x1={x} y1={y + 30 + k * 36} x2={x + w} y2={y + 30 + k * 36} stroke={dark ? '#5a4030' : C.mud} strokeWidth={3} />)}
    <ellipse cx={hx} cy={y - 16} rx={30} ry={9} fill="#1a1410" />
    {ladder && <g><line x1={hx - 14} y1={y - 14} x2={hx - 22} y2={y - 120} stroke={P.ink} strokeWidth={8} /><line x1={hx + 14} y1={y - 14} x2={hx + 6} y2={y - 120} stroke={P.ink} strokeWidth={8} />{[0, 1, 2].map((k) => <line key={k} x1={hx - 16 - k * 3} y1={y - 40 - k * 28} x2={hx + 12 - k * 3} y2={y - 40 - k * 28} stroke={P.ink} strokeWidth={6} />)}</g>}
    {smoke && <g opacity={.5}>{[0, 1, 2].map((k) => { const p = ((T * .2 + k / 3 + R()) % 1); return <circle key={k} cx={hx + 20 + p * 60 + Math.sin(p * 6) * 10} cy={y - 30 - p * 260} r={14 + p * 40} fill="#cfc6bc" opacity={1 - p} />; })}</g>}
  </g>;
};
/* ---- the rooftops: a honeycomb of flat roofs, walkable, no streets ---- */
export const Roofs: React.FC<{ T: number; tone?: Tone; erupt?: number; people?: number; walkers?: boolean }> = ({ T, tone = 'day', erupt = 0, people = 1, walkers = true }) => {
  const dark = tone === 'night';
  return <g>
    <Plain T={T} tone={tone} y={520} erupt={erupt} />
    {/* far roofs */}
    {Array.from({ length: 4 }).map((_, r) => { const yy = 560 + r * 70; const s = .5 + r * .15; return <g key={r}>{Array.from({ length: 14 - r * 2 }).map((_, i) => { const R = rng(i * 17 + r * 3); const w = (150 + R() * 90) * s * 1.6; const x = -260 + i * (2400 / (14 - r * 2)) + R() * 40; const h = 60 + R() * 60;
      return <HouseBlock key={i} x={x} y={yy - h * s + R() * 30} w={w} h={h * s + 200} T={T} ladder={R() > .3} smoke={R() > .4} dark={dark} seed={i + r * 20} />; })}</g>; })}
    {/* near roof surface we stand on */}
    <path d="M -240 900 L 2160 880 L 2160 1300 L -240 1300 Z" fill={dark ? '#7a6050' : C.mudL} {...ol(6)} />
    {Array.from({ length: 18 }).map((_, i) => <path key={i} d={`M ${-240 + i * 140} 900 l 30 400`} stroke={dark ? '#6a5040' : C.mud} strokeWidth={3} />)}
    <g transform="translate(1480 930)"><ellipse rx={70} ry={20} fill="#1a1410" {...ol(5)} /><line x1={-30} y1={-4} x2={-46} y2={-230} stroke={P.ink} strokeWidth={12} /><line x1={30} y1={-4} x2={14} y2={-230} stroke={P.ink} strokeWidth={12} />{[0, 1, 2, 3].map((k) => <line key={k} x1={-34 - k * 4} y1={-40 - k * 50} x2={26 - k * 4} y2={-40 - k * 50} stroke={P.ink} strokeWidth={9} />)}
      <g opacity={.55}>{[0, 1, 2].map((k) => { const p = ((T * .18 + k / 3) % 1); return <circle key={k} cx={40 + p * 80} cy={-20 - p * 300} r={20 + p * 60} fill="#d8d0c4" opacity={1 - p} />; })}</g></g>
    {people > 0 && walkers && Array.from({ length: 6 }).map((_, i) => { const R = rng(i + 90); const dir = R() > .5 ? 1 : -1; const x = ((R() * 2400 + T * 40 * dir) % 2400 + 2400) % 2400 - 240; const r = Math.floor(R() * 3);
      return <MChar key={i} look={villager(i + 3)} x={x} y={600 + r * 70} s={.24 + r * .06} flip={dir < 0} pose={{ walk: 1, phase: T * 7 + i, holdF: i % 3 === 0 ? 'basket' : 'none', armF: i % 3 === 0 ? -1.2 : .1, elbowF: .6 }} />; })}
  </g>;
};
/* ---- inside the house: plastered room, oven + ladder (south), platforms (north), bull horns, paintings, light from the roof hole ---- */
export const Bucranium: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -40 0 C -40 -60 40 -60 40 0 L 30 70 Q 0 90 -30 70 Z" fill={C.plaster} {...ol(6)} />
  <path d="M -36 -24 C -90 -40 -130 -110 -96 -170 C -96 -110 -64 -70 -20 -44 Z" fill="#efe6d2" {...ol(6)} />
  <path d="M 36 -24 C 90 -40 130 -110 96 -170 C 96 -110 64 -70 20 -44 Z" fill="#efe6d2" {...ol(6)} />
  <circle cx={-14} cy={10} r={6} fill={C.ochre} /><circle cx={14} cy={10} r={6} fill={C.ochre} />
</g>;
export const Hand: React.FC<{ x: number; y: number; s?: number; r?: number; c?: string; o?: number }> = ({ x, y, s = 1, r = 0, c = C.ochre, o = 1 }) => <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
  <path d="M -26 40 C -30 10 -30 -6 -24 -16 L -28 -54 Q -22 -62 -16 -54 L -10 -24 L -8 -66 Q -1 -74 6 -66 L 6 -26 L 14 -60 Q 21 -66 26 -58 L 20 -20 L 32 -42 Q 40 -44 40 -36 L 26 10 C 22 30 14 42 -26 40 Z" fill={c} />
</g>;
export const Interior: React.FC<{ T: number; light?: number; hands?: number[][]; wet?: number; burial?: number; skull?: number; paint?: 'hunt' | 'geo' | 'map' | 'vulture'; erupt?: number; dark?: number; fire?: number }> = ({ T, light = 1, hands = [] as number[][], wet = 0, burial = 0, skull = 0, paint = 'geo', erupt = 0, dark = 0, fire = 1 }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill={C.plaster} />
  {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 3); return <ellipse key={i} cx={R() * 2300 - 200} cy={R() * 900} rx={60 + R() * 200} ry={20 + R() * 50} fill={C.plasterD} opacity={.35} />; })}
  {wet > 0 && <rect x={-240} y={-200} width={W} height={1100} fill="#ffffff" opacity={wet * .5} />}
  {/* ceiling beams + roof hole with light shaft */}
  <rect x={-240} y={-200} width={W} height={150} fill="#5a4030" />
  {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-240 + i * 260} y={-60} width={60} height={30} rx={8} fill="#7a5634" {...ol(4)} />)}
  <rect x={300} y={-200} width={240} height={150} fill={light > 0 ? '#fff6d8' : '#1a2030'} />
  {light > 0 && <path d="M 300 -50 L 540 -50 L 760 1000 L 120 1000 Z" fill="#fff8d0" opacity={.22 * light} />}
  {light > 0 && Array.from({ length: 14 }).map((_, i) => { const R = rng(i + 50); const p = (T * .04 + R()) % 1; return <circle key={'d' + i} cx={lerp(320, 700, R()) - p * 100} cy={-40 + p * 900} r={2.5} fill="#fff" opacity={.6 * Math.sin(p * Math.PI)} />; })}
  {/* ladder from hole to floor, oven to its left (south) */}
  <line x1={380} y1={-60} x2={330} y2={900} stroke={P.ink} strokeWidth={16} /><line x1={470} y1={-60} x2={430} y2={900} stroke={P.ink} strokeWidth={16} />
  <line x1={380} y1={-60} x2={330} y2={900} stroke="#8a5a34" strokeWidth={7} /><line x1={470} y1={-60} x2={430} y2={900} stroke="#8a5a34" strokeWidth={7} />
  {Array.from({ length: 9 }).map((_, k) => { const t = k / 9; return <line key={k} x1={lerp(380, 330, t) - 4} y1={lerp(-60, 900, t) + 40} x2={lerp(470, 430, t) + 4} y2={lerp(-60, 900, t) + 40} stroke={P.ink} strokeWidth={10} />; })}
  <g transform="translate(120 900)"><path d="M -150 0 L -150 -150 Q -150 -230 0 -230 Q 150 -230 150 -150 L 150 0 Z" fill="#c8b8a0" {...ol(7)} /><path d="M -70 0 L -70 -80 Q 0 -140 70 -80 L 70 0 Z" fill="#1a100a" />
    {fire > 0 && <g><circle cx={0} cy={-40} r={220} fill="url(#fireGlow)" opacity={.6 * fire + Math.sin(T * 7) * .05} />{[-26, 0, 26].map((q, k) => <path key={k} d={`M ${q - 18} 0 Q ${q - 14} ${-40 - Math.sin(T * 8 + k) * 10} ${q} ${-64 - Math.sin(T * 11 + k) * 12} Q ${q + 14} -40 ${q + 18} 0 Z`} fill={C.fire} stroke={P.ink} strokeWidth={3} />)}</g>}
    <path d="M -150 -150 Q -150 -230 0 -230 Q 150 -230 150 -150" stroke={C.soot} strokeWidth={30} fill="none" opacity={.5} /></g>
  {/* soot on the wall above the oven */}
  <ellipse cx={130} cy={420} rx={260} ry={360} fill={C.soot} opacity={.12} />
  {/* wall paintings */}
  {paint === 'geo' && <g transform="translate(1180 220)">{Array.from({ length: 6 }).map((_, i) => <g key={i} transform={`translate(${i * 110} 0)`}><path d="M 0 0 L 50 -60 L 100 0 L 50 60 Z" fill="none" stroke={C.ochre} strokeWidth={14} /><path d="M 30 0 L 50 -24 L 70 0 L 50 24 Z" fill={C.soot} /></g>)}<rect x={-20} y={-90} width={680} height={14} fill={C.ochre} /><rect x={-20} y={80} width={680} height={14} fill={C.ochre} /></g>}
  {paint === 'hunt' && <g transform="translate(1100 140)">
    <path d="M 160 120 C 160 60 400 40 460 90 C 500 120 520 180 470 220 L 220 220 C 170 210 150 170 160 120 Z" fill={C.ochre} />
    <path d="M 450 90 C 480 40 540 20 580 40 C 540 50 520 70 500 100 Z M 470 96 C 520 60 600 70 620 110 C 580 96 540 100 500 120 Z" fill={C.ochre} />
    {[200, 260, 400, 440].map((q, k) => <rect key={k} x={q} y={210} width={18} height={70} fill={C.ochre} />)}
    {Array.from({ length: 12 }).map((_, i) => { const a = i / 12 * Math.PI * 2; const px = 330 + Math.cos(a) * 300, py = 160 + Math.sin(a) * 160; return <g key={i} transform={`translate(${px} ${py}) rotate(${Math.cos(a) * 20})`}><circle cy={-44} r={10} fill={C.soot} /><path d="M 0 -34 L 0 0 M 0 0 L -12 30 M 0 0 L 12 30 M 0 -24 L -18 -8 M 0 -24 L 20 -36" stroke={C.soot} strokeWidth={7} strokeLinecap="round" /></g>; })}</g>}
  {paint === 'map' && <g transform="translate(1100 160)">
    {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 9 }).map((_, c) => <rect key={r + '-' + c} x={c * 70 + (r % 2) * 20} y={200 + r * 50} width={60} height={42} fill="none" stroke={C.ochre} strokeWidth={8} />))}
    <path d="M 160 180 C 220 120 280 40 320 20 L 340 40 L 370 10 C 420 60 470 130 520 180 Z" fill="none" stroke={C.ochre} strokeWidth={12} />
    {Array.from({ length: 18 }).map((_, i) => { const R = rng(i + 1); return <circle key={i} cx={250 + R() * 180} cy={80 + R() * 90} r={9} fill={C.soot} />; })}
    <g opacity={erupt}>{Array.from({ length: 10 }).map((_, i) => <line key={i} x1={355} y1={10} x2={355 + Math.cos(-Math.PI / 2 + (i - 4.5) * .2) * 120} y2={10 + Math.sin(-Math.PI / 2 + (i - 4.5) * .2) * 120} stroke={C.soot} strokeWidth={6} />)}</g></g>}
  {paint === 'vulture' && <g transform="translate(1120 200)">{[0, 1].map((k) => <g key={k} transform={`translate(${k * 340} 0)`}><path d="M 0 60 Q 60 -40 140 0 Q 220 -40 280 60 Q 220 30 140 80 Q 60 30 0 60 Z" fill={C.ochre} /><path d="M 140 0 L 150 -40 L 175 -30" stroke={C.ochre} strokeWidth={14} fill="none" /></g>)}</g>}
  {hands.map(([hx, hy, hr], k) => <Hand key={k} x={hx} y={hy} r={hr || 0} />)}
  {/* bull horns on a pillar & bench */}
  <rect x={980} y={150} width={90} height={750} fill={C.plaster} {...ol(6)} />
  <Bucranium x={1025} y={360} s={1.0} /><Bucranium x={1025} y={620} s={.8} />
  {/* floor + platforms (north = clean side) */}
  <rect x={-240} y={900} width={W} height={400} fill="#c8bca4" />
  <rect x={1100} y={830} width={1100} height={90} fill={C.plaster} {...ol(6)} />
  <rect x={560} y={860} width={420} height={60} fill={C.plaster} {...ol(6)} />
  {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M ${-240 + i * 420} 940 l 300 0`} stroke="#b8ac94" strokeWidth={4} />)}
  {/* cutaway burial under the big platform */}
  {burial > 0 && <g opacity={burial}><rect x={1150} y={930} width={900} height={320} fill="#8a7458" {...ol(5)} />
    <g transform="translate(1420 1080)"><ellipse rx={120} ry={60} fill="#c8a070" {...ol(5)} /><path d="M -100 -10 Q 0 -60 100 -10 M -90 20 Q 0 -20 90 20" stroke="#8a6a3a" strokeWidth={5} fill="none" />{Array.from({ length: 7 }).map((_, k) => <circle key={k} cx={-60 + k * 20} cy={-56 + Math.abs(k - 3) * 4} r={6} fill="#3a6a5a" stroke={P.ink} strokeWidth={2} />)}</g>
    <g transform="translate(1800 1100)" opacity={.6}><ellipse rx={100} ry={48} fill="#b89060" {...ol(4)} /></g>
    {skull > 0 && <g transform="translate(1800 1090)" opacity={skull}><ellipse rx={40} ry={34} fill={C.plaster} {...ol(5)} /><circle cx={-12} cy={-2} r={7} fill={C.ochre} /><circle cx={14} cy={-2} r={7} fill={C.ochre} /><path d="M -20 -26 Q 0 -40 20 -26" stroke={C.ochre} strokeWidth={6} fill="none" /></g>}</g>}
  {dark > 0 && <rect x={-240} y={-200} width={W} height={1500} fill="#0a0806" opacity={dark} />}
</g>;
/* ---- cutaway of a neighbourhood: walls touching, roofs as streets, ladders down into every room ---- */
export const Cutaway: React.FC<{ T: number; reveal?: number; tone?: Tone; people?: boolean }> = ({ T, reveal = 1, tone = 'day', people = true }) => {
  const rooms = [[-120, 520, 330, 300], [230, 470, 360, 350], [610, 540, 300, 280], [930, 450, 380, 370], [1330, 510, 320, 310], [1670, 470, 360, 350]];
  return <g>
    <Plain T={T} tone={tone} y={380} volcano={.8} />
    <rect x={-240} y={820} width={W} height={500} fill={C.mudD} />
    {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={-240} y1={850 + i * 50} x2={2160} y2={850 + i * 50} stroke={C.mud} strokeWidth={3} />)}
    {rooms.map(([x, y, w, h], i) => { const open = clamp(reveal * 1.5 - i * .1);
      return <g key={i}>
        <rect x={x - 26} y={y - 34} width={w + 52} height={h + 34 + (820 - y - h)} fill={C.mud} {...ol(6)} />
        <rect x={x} y={y} width={w} height={h} fill={C.plaster} opacity={open} {...ol(5)} />
        <rect x={x - 26} y={y - 34} width={w + 52} height={34} fill={C.mudL} {...ol(5)} />
        <rect x={x + w * .3} y={y - 34} width={70} height={34} fill="#1a1410" />
        <g opacity={open}>
          <line x1={x + w * .3 + 14} y1={y - 120} x2={x + w * .3 + 4} y2={y + h} stroke={P.ink} strokeWidth={8} /><line x1={x + w * .3 + 56} y1={y - 120} x2={x + w * .3 + 46} y2={y + h} stroke={P.ink} strokeWidth={8} />
          {Array.from({ length: 6 }).map((_, k) => <line key={k} x1={x + w * .3 + 10} y1={y - 90 + k * (h + 90) / 6} x2={x + w * .3 + 50} y2={y - 90 + k * (h + 90) / 6} stroke={P.ink} strokeWidth={6} />)}
          <path d={`M ${x + 10} ${y + h} L ${x + 10} ${y + h - 60} Q ${x + 10} ${y + h - 100} ${x + 50} ${y + h - 100} Q ${x + 90} ${y + h - 100} ${x + 90} ${y + h - 60} L ${x + 90} ${y + h} Z`} fill="#c8b8a0" stroke={P.ink} strokeWidth={4} />
          <rect x={x + w - 130} y={y + h - 40} width={120} height={40} fill={C.plasterD} stroke={P.ink} strokeWidth={4} />
          {i % 2 === 0 && <Bucranium x={x + w - 70} y={y + 90} s={.4} />}{i % 2 === 1 && <Hand x={x + w - 80} y={y + 80} s={.6} />}
          {i % 3 === 0 && <path d={`M ${x + w * .6} ${y + 50} l 40 -40 l 40 40 l -40 40 Z`} fill="none" stroke={C.ochre} strokeWidth={8} />}
          {people && <MChar look={villager(i * 2 + 1)} x={x + w * .7} y={y + h} s={.34} flip={i % 2 === 1} pose={{ sit: i % 2 ? 1 : 0, armF: -1 + Math.sin(T * 2 + i) * .3, elbowF: 1, holdF: i % 3 === 1 ? 'bowl' : 'none' }} />}
        </g>
        {Array.from({ length: Math.floor(h / 30) }).map((_, k) => <line key={'b' + k} x1={x - 26} y1={y + k * 30} x2={x} y2={y + k * 30} stroke={C.mudD} strokeWidth={3} />)}
      </g>; })}
    {people && Array.from({ length: 5 }).map((_, i) => { const R = rng(i + 13); const dir = R() > .5 ? 1 : -1; const x = ((R() * 2400 + T * 50 * dir) % 2400 + 2400) % 2400 - 240; const rr = rooms.find((q) => x >= q[0] - 26 && x <= q[0] + q[2] + 26) || rooms[0];
      return <MChar key={'w' + i} look={villager(i + 7)} x={x} y={rr[1] - 34} s={.3} flip={dir < 0} pose={{ walk: 1, phase: T * 7 + i }} />; })}
  </g>;
};
/* ---- the mound growing: time-lapse of house on house ---- */
export const Mound: React.FC<{ T: number; p: number; today?: number }> = ({ T, p, today = 0 }) => {
  const layers = 18; const n = Math.floor(p * layers + .001);
  return <g>
    <Sky tone={today ? 'day' : 'dusk'} T={T} />
    <Volcano x={1650} y={700} s={.4} T={T} tone={today ? 'day' : 'dusk'} />
    <rect x={-240} y={900} width={W} height={400} fill={today ? '#c8b070' : C.plainD} />
    {Array.from({ length: Math.min(layers, n + 1) }).map((_, l) => { const grow = l === n ? (p * layers) % 1 : 1; const y = 900 - l * 27; const w = 1700 - l * 44 - (l > 12 ? (l - 12) * 30 : 0);
      return <g key={l} opacity={l === n ? grow : 1}><path d={`M ${960 - w / 2} ${y} Q 960 ${y - 30} ${960 + w / 2} ${y} Q ${960 + w / 2 + 30} ${y + 14} ${960 + w / 2 + 40} ${y + 27} L ${960 - w / 2 - 40} ${y + 27} Q ${960 - w / 2 - 30} ${y + 14} ${960 - w / 2} ${y} Z`} fill={l % 2 ? C.mud : C.mudD} {...ol(4)} />
        {Array.from({ length: Math.floor(w / 110) }).map((_, k) => <rect key={k} x={960 - w / 2 + 20 + k * 110} y={y + 4} width={80} height={18} fill={l === n || today ? 'none' : C.mudL} stroke={C.mudD} strokeWidth={2} opacity={.6} />)}
        {l === n && !today && Array.from({ length: Math.floor(w / 140) }).map((_, k) => <HouseBlock key={'h' + k} x={960 - w / 2 + 30 + k * 140} y={y - 60} w={110} h={60} T={T} ladder={k % 2 === 0} seed={k + l * 9} />)}</g>; })}
    {today > 0 && <g opacity={today}><path d="M 300 380 L 1620 380 L 1700 520 L 220 520 Z" fill="#f4f0e8" stroke={P.ink} strokeWidth={6} />{Array.from({ length: 8 }).map((_, i) => <line key={i} x1={300 + i * 190} y1={380} x2={260 + i * 200} y2={720} stroke={P.ink} strokeWidth={6} />)}</g>}
    <g transform="translate(1760 900)"><line x1={0} y1={0} x2={0} y2={-490} stroke={P.ink} strokeWidth={6} />{[0, 5, 10, 15, 20].map((m) => <g key={m} transform={`translate(0 ${-m * 24})`}><line x1={-16} y1={0} x2={0} y2={0} stroke={P.ink} strokeWidth={5} /><text x={12} y={8} fontFamily="Mono" fontSize={26} fill={P.ink}>{m} m</text></g>)}</g>
  </g>;
};
/* ---- today: the excavation under its shelter ---- */
export const Excavation: React.FC<{ T: number }> = ({ T }) => <g>
  <Sky tone="day" T={T} />
  <rect x={-240} y={600} width={W} height={700} fill="#c8b070" />
  <path d="M 100 320 L 1820 320 L 1980 560 L -60 560 Z" fill="#f4f0e8" {...ol(7)} />
  {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={120 + i * 190} y1={320} x2={-20 + i * 220} y2={900} stroke={P.ink} strokeWidth={8} />)}
  <path d="M 200 900 L 1720 900 L 1600 1180 L 320 1180 Z" fill={C.mudD} {...ol(6)} />
  {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 5 }).map((_, c) => <rect key={r + '-' + c} x={360 + c * 260 + (r % 2) * 40} y={930 + r * 60} width={200} height={48} fill={C.plasterD} stroke={P.ink} strokeWidth={4} />))}
  {[[520, 900], [1300, 900]].map(([x, y], k) => <g key={k} transform={`translate(${x} ${y})`}><MChar look={{ ...villager(k + 1), outfit: 'tunic', cloth: '#5a7a9a', cloth2: '#3a5a7a', beads: undefined, helmet: 'kausia', crestC: '#efe6d2' }} x={0} y={0} s={.6} pose={{ kneel: 1, holdF: 'brush', armF: -1.0, elbowF: .8, propA: 60, lean: 20 }} /></g>)}
</g>;
export { Smoke, Embers, Dust };
