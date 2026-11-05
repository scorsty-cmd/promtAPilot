// Painted sets for You Were There Ep 1 (Atlantic 1872): parallax sea, brigantine sprite, decks, cabin, hold, galley,
// New York pier, Gibraltar court + harbour, Doyle's study, Atlantic map, Haiti reef, cork board.
import React from 'react';
import {random} from 'remotion';
import {INK, FLOOR} from './kit';
import {Lantern} from '../rig';
import {flickOf, Flame} from '../ep01/sets';
export {Parchment, DarkTable, flickOf, Flame} from '../ep01/sets';

const R = (s: string) => random(s);
export type SeaMode = 'day' | 'storm' | 'night' | 'dusk' | 'sepia' | 'tropic';
const SKY: Record<SeaMode, [string, string, string]> = {
  day: ['#6F7F8A', '#B9C0BC', '#D9D2BE'], storm: ['#1E262E', '#3E4852', '#66707A'], night: ['#0A1220', '#1E2C46', '#34466A'],
  dusk: ['#2A3448', '#7A6A70', '#D99A62'], sepia: ['#8A7458', '#C9B08A', '#E2CFA6'], tropic: ['#5FA8C8', '#A8D8E4', '#E8F0E0'],
};
const SEA: Record<SeaMode, string[]> = {
  day: ['#5E7480', '#4E6470', '#3E5460', '#2E4450'], storm: ['#2E3C46', '#26323C', '#1E2A32', '#162028'], night: ['#1A2840', '#142034', '#0E182A', '#0A1220'],
  dusk: ['#4A5462', '#3C4654', '#2E3846', '#222C38'], sepia: ['#8A7A60', '#7A6A52', '#6A5A44', '#5A4A38'], tropic: ['#3FA0B0', '#2E8C9E', '#22788A', '#186474'],
};

// wave band path
const wave = (y: number, A: number, k: number, ph: number, x0 = -900, x1 = 2900) => {
  let d = `M${x0} 1600 L${x0} ${y}`;
  for (let x = x0; x <= x1; x += 40) d += ` L${x} ${(y + A * Math.sin(x * k + ph) + A * 0.4 * Math.sin(x * k * 2.3 + ph * 1.7)).toFixed(1)}`;
  return d + ` L${x1} 1600 Z`;
};
export const Sky: React.FC<{f: number; mode?: SeaMode; horizon?: number; moon?: boolean; clouds?: number}> = ({f, mode = 'day', horizon = 520, moon, clouds = 1}) => {
  const [a, b, c] = SKY[mode];
  const id = `sky_${mode}`;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="0.75" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient></defs>
      <rect x={-900} y={-800} width={3800} height={horizon + 820} fill={`url(#${id})`} />
      {moon && <g><circle cx={1500} cy={180} r={46} fill="#F2EAD0" /><circle cx={1500} cy={180} r={140} fill="#F2EAD0" opacity={0.08} /></g>}
      {mode === 'tropic' && <circle cx={1600} cy={140} r={70} fill="#FFF4C8" opacity={0.9} />}
      <g opacity={clouds * (mode === 'storm' ? 0.9 : 0.55)}>
        {Array.from({length: 9}, (_, i) => {
          const x = ((R(`cx${i}`) * 3600 + f * (0.3 + R(`cv${i}`) * 0.5)) % 3600) - 900, y = 60 + R(`cy${i}`) * (horizon - 220);
          const s = 0.7 + R(`cs${i}`) * 1.1;
          const col = mode === 'storm' ? '#262E36' : mode === 'night' ? '#1A2438' : mode === 'dusk' ? '#8A6A62' : '#E6E2D6';
          return <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.7}><ellipse rx={220} ry={40} fill={col} /><ellipse cx={-60} cy={-24} rx={110} ry={42} fill={col} /><ellipse cx={70} cy={-14} rx={120} ry={36} fill={col} /></g>;
        })}
      </g>
    </g>
  );
};
// parallax sea: 4 wave bands; camX shifts near bands more than far ones (depth layers)
export const Sea: React.FC<{f: number; mode?: SeaMode; horizon?: number; rough?: number; camX?: number; from?: number}> = ({f, mode = 'day', horizon = 520, rough = 1, camX = 0, from = 0}) => {
  const cols = SEA[mode];
  return (
    <g>
      <rect x={-900} y={horizon} width={3800} height={1400} fill={cols[0]} />
      <path d={`M-900 ${horizon} H2900`} stroke={mode === 'night' ? '#4A5A7A' : '#E8E4D4'} strokeWidth={2} opacity={0.5} />
      {[0, 1, 2, 3].slice(from).map((L) => {
        const y = horizon + 14 + L * L * 34 + L * 30, A = (3 + L * L * 6) * rough, k = 0.012 / (1 + L * 0.5);
        const ph = f * (0.03 + L * 0.018) + L * 1.7;
        return (
          <g key={L} transform={`translate(${-camX * (0.1 + L * 0.3)} 0)`}>
            <path d={wave(y, A, k, ph)} fill={cols[L]} />
            {L >= 1 && <path d={wave(y, A, k, ph).replace(/ L-?\d+ 1600 Z$/, '').replace(/^M-?\d+ 1600 L/, 'M')} fill="none" stroke="#DCE6E6" strokeWidth={1.5 + L * 1.2} opacity={0.18 + L * 0.08} strokeDasharray={`${30 + L * 20} ${60 + L * 30}`} />}
          </g>
        );
      })}
    </g>
  );
};

// ================= BRIGANTINE SPRITE (side view, bow to +x) =================
export const Ship: React.FC<{f: number; x: number; y: number; s?: number; torn?: boolean; flip?: boolean; rot?: number; name?: string; dark?: boolean; lights?: boolean}> = ({f, x, y, s = 1, torn, flip, rot = 0, name, dark, lights}) => {
  const hull = dark ? '#1A1614' : '#2E2620', wale = dark ? '#2A2420' : '#6B4A2F', sail = torn ? '#CFC5AC' : '#E8E0CA', sailSh = torn ? '#A89E86' : '#C8BFA6';
  const flap = (i: number) => Math.sin(f * 0.22 + i) * (torn ? 14 : 4);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      {/* masts + rigging */}
      <g stroke={INK} strokeLinecap="round">
        <path d="M200 -10 L200 -640 M-140 -10 L-140 -660" strokeWidth={12} />
        <path d="M200 -10 L200 -640 M-140 -10 L-140 -660" stroke="#6B4A2F" strokeWidth={6} />
        <path d="M420 -60 L620 -150" strokeWidth={10} />
        <g strokeWidth={2.5} opacity={0.8} fill="none">
          <path d="M200 -630 L610 -146 M200 -480 L520 -110 M-140 -650 L200 -600 M-140 -640 L-420 -40 M200 -620 L360 -40 M-140 -600 L-40 -40" />
        </g>
      </g>
      {/* foremast square sails */}
      {[[-560, -470, 150], [-460, -350, 175], [-340, -200, 200]].map(([y0, y1, w], i) => (torn && i === 1) ? (
        <g key={i}><path d={`M${200 - w} ${y0} H${200 + w}`} stroke={INK} strokeWidth={8} /><path d={`M${200 - w + 20} ${y0} q10 ${50 + flap(i)} -6 ${80 + flap(i)} M${200 + 30} ${y0} q14 ${36 + flap(i + 1)} 4 ${60}`} stroke={sailSh} strokeWidth={10} fill="none" /></g>
      ) : (
        <g key={i}>
          <path d={`M${200 - w} ${y0} H${200 + w}`} stroke={INK} strokeWidth={8} />
          <path d={`M${200 - w} ${y0} L${200 + w} ${y0} Q${200 + w + 14 + flap(i)} ${(y0 + y1) / 2} ${200 + w + 10} ${y1} L${200 - w - 10} ${y1} Q${200 - w + 8 + flap(i)} ${(y0 + y1) / 2} ${200 - w} ${y0} Z`} fill={sail} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M${200 - w + 30} ${y1 - 8} Q200 ${y1 - 30} ${200 + w - 30} ${y1 - 8}`} stroke={sailSh} strokeWidth={4} fill="none" />
          {torn && <path d={`M${200 - 40} ${y1} l20 -40 l16 30 l24 -50 l12 60 Z`} fill={dark ? '#141210' : '#5E6A70'} opacity={0.9} />}
        </g>
      ))}
      {/* jibs */}
      <path d={`M210 -600 L600 -150 L330 -150 Z`} fill={sail} stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={torn ? 0.95 : 1} transform={`skewX(${flap(4) * 0.2})`} />
      {!torn && <path d="M220 -470 L520 -112 L310 -112 Z" fill={sailSh} stroke={INK} strokeWidth={4} strokeLinejoin="round" />}
      {/* main gaff sail */}
      {torn ? (
        <g><path d="M-140 -600 L-400 -520" stroke={INK} strokeWidth={8} /><path d={`M-150 -590 Q${-230 + flap(5)} -420 -200 -300 L-170 -320 Q-190 -460 -150 -560 Z`} fill={sail} stroke={INK} strokeWidth={4} /><path d="M-140 -120 L-470 -100" stroke={INK} strokeWidth={9} /></g>
      ) : (
        <g><path d={`M-140 -600 L-400 -520 Q${-440 + flap(5)} -300 -470 -110 L-140 -120 Z`} fill={sail} stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d="M-140 -120 L-470 -100" stroke={INK} strokeWidth={9} /></g>
      )}
      {/* hull */}
      <path d="M-480 -60 L440 -60 Q540 -62 620 -110 Q600 -30 520 40 Q300 92 -360 86 Q-470 70 -500 -10 Z" fill={hull} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M-490 -40 L460 -44 Q540 -50 600 -92" stroke={wale} strokeWidth={10} fill="none" />
      <path d="M-480 -60 L440 -60" stroke="#8A6A4A" strokeWidth={5} />
      {Array.from({length: 14}, (_, i) => <path key={i} d={`M${-450 + i * 66} -60 v-22`} stroke={INK} strokeWidth={4} />)}
      <path d="M-480 -82 L440 -82 Q520 -84 600 -126" stroke={INK} strokeWidth={4} fill="none" />
      {name && <text x={-330} y={10} fontFamily="FellSC" fontSize={34} fill="#E8D8B0" opacity={0.85}>{name}</text>}
      {lights && <circle cx={-470} cy={-120} r={9} fill="#FFD27A" />}
      {lights && <circle cx={-470} cy={-120} r={40} fill="#FFD27A" opacity={0.25} />}
      {torn && <g stroke={INK} strokeWidth={3} fill="none" opacity={0.85}><path d={`M-200 -60 Q-210 0 ${-190 + flap(6) * 0.5} 80`} /><path d={`M60 -60 Q50 10 ${70 + flap(7) * 0.5} 90`} /></g>}
      {/* waterline foam */}
      <path d={`M-520 40 Q-200 ${56 + Math.sin(f * 0.1) * 6} 100 44 Q400 ${30 + Math.sin(f * 0.12 + 1) * 6} 620 20`} stroke="#E8F0F0" strokeWidth={8} fill="none" opacity={0.55} />
    </g>
  );
};
// small rowing boat (yawl) side view
export const Yawl: React.FC<{x: number; y: number; s?: number; rot?: number; children?: React.ReactNode}> = ({x, y, s = 1, rot = 0, children}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {children}
    <path d="M-230 -30 L230 -30 Q250 -30 260 -60 Q250 30 180 50 L-170 50 Q-240 30 -250 -50 Q-244 -30 -230 -30 Z" fill="#6B4A2F" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-236 -14 L240 -14" stroke="#8C6B4A" strokeWidth={6} />
    <path d="M-200 20 L200 20" stroke="#4A3220" strokeWidth={4} />
  </g>
);

// ================= DECK (camera on deck, looking across to the sea) =================
export const Planks: React.FC<{y0: number; y1: number; c?: string; n?: number}> = ({y0, y1, c = '#8A6A48', n = 14}) => (
  <g>
    <rect x={-600} y={y0} width={3200} height={y1 - y0} fill={c} />
    {Array.from({length: n}, (_, i) => { const t = i / n; const y = y0 + (y1 - y0) * t * t; return <path key={i} d={`M-600 ${y} H2600`} stroke="#3A2818" strokeWidth={2 + t * 4} opacity={0.6} />; })}
    {Array.from({length: 22}, (_, i) => <path key={`v${i}`} d={`M${960 + (i - 11) * 40} ${y0} L${960 + (i - 11) * 220} ${y1}`} stroke="#3A2818" strokeWidth={2} opacity={0.25} />)}
  </g>
);
const Rail: React.FC<{y: number; c?: string}> = ({y, c = '#5A3D27'}) => (
  <g stroke={INK} strokeLinejoin="round">
    <rect x={-600} y={y} width={3200} height={34} fill={c} strokeWidth={6} />
    <rect x={-600} y={y + 34} width={3200} height={110} fill="#3E2A1C" strokeWidth={5} />
    {Array.from({length: 24}, (_, i) => <rect key={i} x={-560 + i * 140} y={y + 34} width={22} height={110} fill="#4A3424" strokeWidth={3} />)}
  </g>
);
export const Wheel: React.FC<{x: number; y: number; rot?: number; s?: number}> = ({x, y, rot = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-20} y={0} width={40} height={180} fill="#4A3424" stroke={INK} strokeWidth={5} />
    <g transform={`rotate(${rot})`} stroke={INK} strokeWidth={5}>
      {Array.from({length: 8}, (_, i) => <path key={i} transform={`rotate(${i * 45})`} d="M0 0 L0 -120" stroke="#6B4A2F" strokeWidth={12} />)}
      {Array.from({length: 8}, (_, i) => <circle key={`h${i}`} cx={Math.sin(i * Math.PI / 4) * 124} cy={-Math.cos(i * Math.PI / 4) * 124} r={9} fill="#6B4A2F" />)}
      <circle r={88} fill="none" stroke="#6B4A2F" strokeWidth={16} /><circle r={88} fill="none" strokeWidth={3} /><circle r={18} fill="#C9A35A" />
    </g>
  </g>
);
export const Binnacle: React.FC<{x: number; y: number; broken?: boolean; tilt?: number}> = ({x, y, broken, tilt = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <path d="M-40 0 L40 0 L30 -110 L-30 -110 Z" fill="#6B4A2F" />
    <path d="M-44 -110 Q0 -180 44 -110 Z" fill="#C9A35A" />
    <ellipse cx={0} cy={-112} rx={38} ry={10} fill={broken ? '#2A2420' : '#BFD8E2'} />
    {broken && <path d="M-20 -150 L-6 -128 L-14 -116 M10 -156 L4 -132 L16 -120" stroke="#E8F0F2" strokeWidth={3} fill="none" />}
    {broken && [[-60, 6], [-70, -4], [52, 4]].map(([gx, gy], i) => <path key={i} d={`M${gx} ${gy} l10 -6 l4 8 Z`} fill="#BFD8E2" strokeWidth={2} />)}
  </g>
);
export const Hatch: React.FC<{x: number; y: number; open?: boolean; w?: number; cover?: [number, number, number]}> = ({x, y, open, w = 260, cover}) => (
  <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2 + 20} ${y + 60} L${x - w / 2 - 20} ${y + 60} Z`} fill="#5A3D27" />
    {open ? <path d={`M${x - w / 2 + 14} ${y + 8} L${x + w / 2 - 14} ${y + 8} L${x + w / 2} ${y + 52} L${x - w / 2} ${y + 52} Z`} fill="#0A0604" /> : <path d={`M${x - w / 2 + 6} ${y - 8} L${x + w / 2 - 6} ${y - 8} L${x + w / 2 + 6} ${y + 44} L${x - w / 2 - 6} ${y + 44} Z`} fill="#7A5638" />}
    {open && cover && <g transform={`translate(${cover[0]} ${cover[1]}) rotate(${cover[2]})`}><path d={`M${-w / 2} -16 H${w / 2} L${w / 2 + 14} 30 H${-w / 2 - 14} Z`} fill="#7A5638" />{[-0.25, 0.25].map((k) => <path key={k} d={`M${k * w} -14 L${k * w * 1.1} 28`} stroke="#3A2818" strokeWidth={4} />)}</g>}
  </g>
);
export const Pump: React.FC<{x: number; y: number; apart?: boolean; handle?: number}> = ({x, y, apart, handle = 0}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <rect x={-26} y={-150} width={52} height={150} fill="#6E5A44" />
    <rect x={-34} y={-162} width={68} height={18} fill="#4A3A2A" />
    <path d="M26 -100 h40 v14 h-40" fill="#4A3A2A" />
    {apart ? (
      <g><path d="M-120 -6 L-30 -40" stroke="#4A3A2A" strokeWidth={14} strokeLinecap="round" /><rect x={-90} y={-16} width={40} height={18} rx={4} fill="#8A8D92" transform="rotate(14 -70 -8)" /><circle cx={60} cy={-6} r={10} fill="#8A8D92" /></g>
    ) : (
      <g transform={`rotate(${-20 + handle * 30} 0 -150)`}><path d="M0 -150 L140 -170" stroke="#4A3A2A" strokeWidth={14} strokeLinecap="round" /></g>
    )}
  </g>
);
export const RopeCoil: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={INK} strokeWidth={4}>
    {[60, 46, 32].map((r, i) => <ellipse key={i} rx={r} ry={r * 0.32} fill={i === 0 ? '#B89A6A' : 'none'} />)}
    {[60, 46, 32].map((r, i) => <ellipse key={`c${i}`} rx={r} ry={r * 0.32} stroke="#8C7444" strokeWidth={6} />)}
  </g>
);
export const Barrel: React.FC<{x: number; y: number; s?: number; dark?: boolean}> = ({x, y, s = 1, dark}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <path d="M-50 -60 Q-64 0 -50 60 L50 60 Q64 0 50 -60 Z" fill={dark ? '#4A3222' : '#8A5E3A'} />
    <ellipse cx={0} cy={-60} rx={50} ry={14} fill={dark ? '#5A3E2A' : '#A8784E'} />
    {[-34, 34].map((yy) => <path key={yy} d={`M-56 ${yy} Q0 ${yy + 10} 56 ${yy}`} stroke="#3A3A3A" strokeWidth={7} fill="none" />)}
  </g>
);
// Dei Gratia deck / Mary Celeste deck. side=sea beyond the rail. mc = Mary Celeste details (empty, ropes overboard, open hatches)
export const Deck: React.FC<{f: number; mode?: SeaMode; mc?: boolean; roll?: {rot: number; heave: number}; camX?: number; boatGone?: boolean; showShip?: React.ReactNode}> = ({f, mode = 'day', mc, roll = {rot: 0, heave: 0}, camX = 0, boatGone, showShip}) => {
  const H = 560;
  return (
    <g>
      <g transform={`rotate(${-roll.rot} 960 700) translate(0 ${-roll.heave})`}>
        <Sky f={f} mode={mode} horizon={H} />
        <Sea f={f} mode={mode} horizon={H} rough={mode === 'storm' ? 1.8 : 1} camX={camX} />
        {showShip}
      </g>
      <g filter="url(#paint)">
        {/* rigging + masts */}
        <g stroke={INK} strokeLinecap="round">
          <path d="M520 -400 L520 760" strokeWidth={46} /><path d="M520 -400 L520 760" stroke="#6B4A2F" strokeWidth={34} />
          <path d="M534 -400 L534 760" stroke="#8A6A4A" strokeWidth={6} />
          <g strokeWidth={5} fill="none" opacity={0.9}><path d="M520 -300 L-300 640 M520 -300 L1500 640 M520 -200 L2100 650 M520 -100 L-500 650" /></g>
          <g strokeWidth={3} opacity={0.7}>{Array.from({length: 8}, (_, i) => <path key={i} d={`M${120 - i * 60} ${180 + i * 62} L${980 + i * 60} ${180 + i * 62}`} stroke="none" />)}</g>
        </g>
        <Rail y={620} />
        <Planks y0={764} y1={1300} />
        {/* deckhouse (galley) on the right */}
        <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
          <rect x={1560} y={380} width={520} height={400} fill={mc ? '#7A6650' : '#8A7258'} />
          <path d="M1540 380 L2100 380 L2080 350 L1560 350 Z" fill="#4A3424" />
          <rect x={1640} y={480} width={150} height={300} fill="#3A2818" />
          <rect x={1660} y={500} width={110} height={120} fill={mc ? '#141010' : '#2A2018'} />
          <circle cx={1760} cy={640} r={9} fill="#C9A35A" />
          <rect x={1860} y={460} width={140} height={110} fill={mode === 'night' ? '#E8B060' : '#2A3238'} />
          <path d="M1930 460 v110 M1860 515 h140" stroke="#3E2A1C" strokeWidth={8} />
          <rect x={1980} y={250} width={44} height={110} fill="#2A2420" />
        </g>
        {mc && (
          <g>
            {/* empty boat chocks across the main hatch */}
            <Hatch x={1060} y={770} />
            {[900, 1220].map((x) => <path key={x} d={`M${x - 40} 770 L${x - 30} 730 L${x + 30} 730 L${x + 40} 770 Z`} fill="#5A3D27" stroke={INK} strokeWidth={5} />)}
            {/* ropes hanging over the rail */}
            {[160, 300, 1340].map((x, i) => <path key={x} d={`M${x} 620 Q${x + 30 + Math.sin(f * 0.05 + i) * 10} 700 ${x + 10} 780`} stroke="#B89A6A" strokeWidth={7} fill="none" />)}
          </g>
        )}
        {!mc && !boatGone && (
          <g>
            <path d="M820 760 L850 700 L1300 700 L1330 760 Z" fill="#6B4A2F" stroke={INK} strokeWidth={6} />
            <path d="M850 700 Q1075 660 1300 700" stroke="#8C6B4A" strokeWidth={8} fill="none" />
          </g>
        )}
        <RopeCoil x={360} y={850} />
        <Barrel x={1480} y={840} s={0.9} />
      </g>
    </g>
  );
};

// ================= CABIN (below deck) =================
export const Cabin: React.FC<{f: number; roll?: number; lampLit?: number; mess?: boolean; water?: boolean; shaft?: number}> = ({f, roll = 0, lampLit = 0, mess = true, water = true, shaft = 1}) => {
  const sw = Math.sin(f * 0.035) * 9 + roll * 3;
  return (
    <g>
      <g filter="url(#paint)">
        <rect x={-400} y={-300} width={2800} height={1500} fill="#3E2C1E" />
        {Array.from({length: 26}, (_, i) => <rect key={i} x={-400 + i * 110} y={-300} width={110} height={FLOOR + 300} fill={`rgb(${Math.round(78 * (0.85 + R(`cp${i}`) * 0.2))},${Math.round(56 * (0.85 + R(`cp${i}`) * 0.2))},${Math.round(38 * (0.85 + R(`cp${i}`) * 0.2))})`} stroke="#22170F" strokeWidth={4} />)}
        <rect x={-400} y={520} width={2800} height={24} fill="#5A3D27" stroke={INK} strokeWidth={5} />
        {/* beams */}
        {[-200, 500, 1200, 1900].map((x) => <rect key={x} x={x} y={-300} width={70} height={130} fill="#2A1C12" stroke={INK} strokeWidth={5} />)}
        <rect x={-400} y={-190} width={2800} height={40} fill="#2A1C12" stroke={INK} strokeWidth={5} />
        {/* skylight */}
        <rect x={760} y={-190} width={380} height={40} fill="#9FB0B8" stroke={INK} strokeWidth={5} />
        {/* bunk */}
        <rect x={1330} y={560} width={620} height={250} fill="#4A3220" stroke={INK} strokeWidth={6} />
        <rect x={1350} y={600} width={580} height={150} fill="#1E140D" stroke={INK} strokeWidth={4} />
        <path d={mess ? 'M1360 700 Q1500 640 1640 700 Q1760 660 1920 690 L1920 750 L1360 750 Z' : 'M1360 690 H1920 V750 H1360 Z'} fill="#7A6A5A" stroke={INK} strokeWidth={5} />
        <ellipse cx={1860} cy={680} rx={70} ry={26} fill="#D8CBAE" stroke={INK} strokeWidth={4} />
        {/* shelf with books */}
        <rect x={160} y={300} width={420} height={16} fill="#5A3D27" stroke={INK} strokeWidth={4} />
        {Array.from({length: 9}, (_, i) => <rect key={i} x={176 + i * 40 + (mess && i > 5 ? 12 : 0)} y={300 - [80, 96, 70, 88, 92, 76, 84, 70, 90][i]} width={32} height={[80, 96, 70, 88, 92, 76, 84, 70, 90][i]} fill={['#6E2A22', '#2E4A3A', '#5A4632', '#3A3A5A', '#7A5A2A', '#4A2A3A', '#2A3A4A', '#6A4A2A', '#3A2A1A'][i]} stroke={INK} strokeWidth={3} transform={mess && i > 6 ? `rotate(${-24} ${176 + i * 40} 300)` : undefined} />)}
        {/* clothes on hooks */}
        {[700, 820].map((x, i) => <g key={x}><path d={`M${x} 160 v14`} stroke={INK} strokeWidth={6} /><path d={`M${x - 40} 176 Q${x} 166 ${x + 40} 176 L${x + 50} ${380 + i * 30} Q${x} ${396 + i * 30} ${x - 50} ${380 + i * 30} Z`} fill={i ? '#4E3A5A' : '#2C2A30'} stroke={INK} strokeWidth={5} /></g>)}
        {/* table + chair */}
        <rect x={520} y={680} width={560} height={30} fill="#6B4A2F" stroke={INK} strokeWidth={6} />
        <path d="M560 710 V905 M1040 710 V905" stroke={INK} strokeWidth={18} /><path d="M560 710 V905 M1040 710 V905" stroke="#4A3220" strokeWidth={10} />
        <path d="M260 660 V905 M380 760 V905 M250 760 H390" stroke={INK} strokeWidth={14} /><path d="M260 660 V905 M380 760 V905 M250 760 H390" stroke="#5A3D27" strokeWidth={7} />
      </g>
      {/* skylight light shaft */}
      <path d="M760 -150 L1140 -150 L1300 905 L540 905 Z" fill="#B8CCD8" opacity={0.1 * shaft} />
      <path d="M840 -150 L1060 -150 L1150 905 L700 905 Z" fill="#D8E4EC" opacity={0.08 * shaft} />
      {Array.from({length: 14}, (_, i) => {
        const x = 700 + R(`dm${i}`) * 500, y = ((R(`dy${i}`) * 900 + f * (0.3 + R(`dv${i}`) * 0.5)) % 1000) - 100;
        return <circle key={i} cx={x + Math.sin(f * 0.02 + i) * 20} cy={y} r={2.5} fill="#E8F0F4" opacity={0.5 * shaft} />;
      })}
      {/* swinging lamp */}
      <g transform={`rotate(${sw} 960 -150)`}>
        <path d="M960 -150 V120" stroke={INK} strokeWidth={4} />
        <g transform="translate(960 190) scale(1.6)"><Lantern lit={lampLit} /></g>
        {lampLit > 0 && <circle cx={960} cy={180} r={420} fill="url(#candle)" opacity={0.7 * lampLit + flickOf(f) * 0.05} />}
      </g>
      <rect x={-400} y={FLOOR} width={2800} height={400} fill="url(#floor)" />
      {water && (
        <g>
          <rect x={-400} y={FLOOR + 30} width={2800} height={400} fill="#2E4450" opacity={0.55} />
          {Array.from({length: 10}, (_, i) => <path key={i} d={`M${-200 + i * 260 + Math.sin(f * 0.05 + i) * 30} ${FLOOR + 60 + (i % 3) * 40} q40 -8 80 0`} stroke="#9FB6C4" strokeWidth={3} fill="none" opacity={0.5} />)}
        </g>
      )}
    </g>
  );
};

// ================= HOLD with barrels =================
export const Hold: React.FC<{f: number; vapour?: number; flash?: number; light?: number}> = ({f, vapour = 0, flash = 0, light = 1}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1500} fill="#140D08" />
    <g filter="url(#paint)">
      {Array.from({length: 4}, (_, r) => Array.from({length: 13}, (_, c) => (
        <Barrel key={`${r}-${c}`} x={-200 + c * 190 + (r % 2) * 95} y={860 - r * 130} s={1.05 - r * 0.04} dark={r > 1} />
      )))}
      {/* hull ribs */}
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M${-300 + i * 340} -300 Q${-260 + i * 340} 400 ${-300 + i * 340} 1000`} stroke="#2A1C12" strokeWidth={40} fill="none" opacity={0.9} />)}
      {/* ladder */}
      <path d="M880 -300 L840 600 M1040 -300 L1000 600" stroke="#5A3D27" strokeWidth={18} />
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M${876 - i * 4} ${-260 + i * 100} H${1036 - i * 4}`} stroke="#5A3D27" strokeWidth={14} />)}
    </g>
    <path d="M800 -300 L1120 -300 L1300 1000 L620 1000 Z" fill="#B8C8D0" opacity={0.08 * light} />
    <rect x={-400} y={-300} width={2800} height={1500} fill="#0A0604" opacity={0.35 * (1 - light * 0.5)} />
    {vapour > 0 && (
      <g opacity={vapour}>
        {Array.from({length: 12}, (_, i) => <path key={i} d={wave(260 + i * 60 + Math.sin(f * 0.04 + i) * 20, 14, 0.008, f * 0.03 + i)} fill="#9FC8B4" opacity={0.035} />)}
      </g>
    )}
    {flash > 0 && (
      <g>
        <rect x={-400} y={-300} width={2800} height={1500} fill="#7FB4FF" opacity={0.55 * flash} />
        <circle cx={960} cy={560} r={300 + 900 * flash} fill="#CFE6FF" opacity={0.6 * flash} filter="url(#glow)" />
      </g>
    )}
  </g>
);

// ================= GALLEY =================
export const Galley: React.FC<{f: number}> = ({f}) => (
  <g>
    <g filter="url(#paint)">
      <rect x={-400} y={-300} width={2800} height={1500} fill="#4A3828" />
      {Array.from({length: 26}, (_, i) => <path key={i} d={`M${-400 + i * 110} -300 V${FLOOR}`} stroke="#2A1C12" strokeWidth={4} />)}
      {/* stove knocked askew */}
      <g transform="rotate(-7 900 800)" stroke={INK} strokeWidth={6} strokeLinejoin="round">
        <rect x={700} y={560} width={420} height={300} fill="#2A2624" />
        <rect x={740} y={620} width={150} height={110} fill="#141010" />
        <rect x={680} y={540} width={460} height={34} fill="#3A3634" />
        <rect x={1020} y={300} width={60} height={250} fill="#2A2624" />
      </g>
      {/* shelf with washed pots + hanging pans */}
      <rect x={100} y={360} width={480} height={18} fill="#5A3D27" stroke={INK} strokeWidth={4} />
      {[150, 270, 400].map((x, i) => <g key={x}><path d={`M${x - 46} 360 L${x - 40} ${300 - i * 6} H${x + 40} L${x + 46} 360 Z`} fill="#7C7F84" stroke={INK} strokeWidth={4} /><path d={`M${x - 40} ${300 - i * 6} H${x + 40}`} stroke="#B8BCC0" strokeWidth={3} /></g>)}
      {[1320, 1460, 1600].map((x, i) => (
        <g key={x} transform={`rotate(${Math.sin(f * 0.04 + i) * 6} ${x} 160)`}>
          <path d={`M${x} 160 v60`} stroke={INK} strokeWidth={4} />
          <circle cx={x} cy={290} r={60 - i * 8} fill="#5E6268" stroke={INK} strokeWidth={5} />
          <path d={`M${x} 230 v-20`} stroke={INK} strokeWidth={8} />
        </g>
      ))}
      {/* provisions */}
      {[1380, 1520].map((x) => <Barrel key={x} x={x} y={820} s={0.8} />)}
      <rect x={1640} y={720} width={180} height={160} fill="#8A6A48" stroke={INK} strokeWidth={5} />
      <text x={1730} y={810} textAnchor="middle" fontFamily="FellSC" fontSize={34} fill="#3A2818">BISCUIT</text>
    </g>
    <rect x={-400} y={FLOOR} width={2800} height={400} fill="url(#floor)" />
    <rect x={-400} y={FLOOR + 20} width={2800} height={400} fill="#2E4450" opacity={0.5} />
    {Array.from({length: 8}, (_, i) => <path key={i} d={`M${-100 + i * 300 + Math.sin(f * 0.05 + i) * 30} ${FLOOR + 50 + (i % 3) * 36} q40 -8 80 0`} stroke="#9FB6C4" strokeWidth={3} fill="none" opacity={0.5} />)}
  </g>
);

// ================= NEW YORK PIER (sepia flashback) =================
export const Pier: React.FC<{f: number}> = ({f}) => (
  <g>
    <Sky f={f} mode="sepia" horizon={600} />
    <g filter="url(#paint)">
      {/* Manhattan-ish skyline of 1872: low warehouses, church spires */}
      {Array.from({length: 18}, (_, i) => {
        const x = -400 + i * 160, h = 80 + R(`ny${i}`) * 140;
        return <g key={i}><rect x={x} y={600 - h} width={150} height={h} fill="#7A6650" stroke="#5A4A38" strokeWidth={3} />{R(`sp${i}`) > 0.8 && <path d={`M${x + 50} ${600 - h} L${x + 75} ${600 - h - 150} L${x + 100} ${600 - h} Z`} fill="#6A5640" />}</g>;
      })}
    </g>
    <Sea f={f} mode="sepia" horizon={600} rough={0.4} />
    <g filter="url(#paint)">
      <rect x={-400} y={780} width={2800} height={500} fill="#6B5034" />
      {Array.from({length: 30}, (_, i) => <path key={i} d={`M${-400 + i * 100} 780 V1300`} stroke="#3A2818" strokeWidth={4} />)}
      <rect x={-400} y={770} width={2800} height={20} fill="#4A3424" stroke={INK} strokeWidth={4} />
      {[180, 320].map((x) => <rect key={x} x={x} y={640} width={130} height={130} fill="#9A7A52" stroke={INK} strokeWidth={5} />)}
      <Barrel x={1700} y={710} s={0.9} /><Barrel x={1810} y={710} s={0.9} /><Barrel x={1755} y={600} s={0.9} />
      <text x={255} y={715} textAnchor="middle" fontFamily="FellSC" fontSize={30} fill="#4A3424" transform="rotate(0)">GENOA</text>
    </g>
  </g>
);

// ================= GIBRALTAR harbour + court =================
export const Rock: React.FC<{f: number; mode?: SeaMode}> = ({f, mode = 'dusk'}) => (
  <g>
    <Sky f={f} mode={mode} horizon={640} />
    <g filter="url(#paint)">
      <path d="M200 640 L520 300 L700 210 L860 140 L1000 180 L1180 250 L1400 420 L1620 640 Z" fill="#5A5248" stroke={INK} strokeWidth={6} />
      <path d="M860 140 L900 300 L840 460 L900 640 M1000 180 L1060 380" stroke="#46403A" strokeWidth={8} fill="none" />
      {Array.from({length: 40}, (_, i) => <rect key={i} x={260 + R(`gx${i}`) * 1300} y={560 + R(`gy${i}`) * 70} width={22} height={16} fill="#D8C8A8" stroke="#6B5A44" strokeWidth={2} />)}
    </g>
    <Sea f={f} mode={mode} horizon={640} rough={0.5} />
  </g>
);
export const Court: React.FC<{f: number}> = ({f}) => (
  <g>
    <g filter="url(#paint)">
      <rect x={-400} y={-300} width={2800} height={1500} fill="#5A3A26" />
      {Array.from({length: 13}, (_, i) => <g key={i}><rect x={-400 + i * 220} y={-300} width={220} height={FLOOR + 300} fill="#6B4A30" stroke="#3A2618" strokeWidth={5} /><rect x={-370 + i * 220} y={400} width={160} height={360} fill="#5E412A" stroke="#3A2618" strokeWidth={4} /></g>)}
      {/* tall window with the Rock */}
      <rect x={780} y={-60} width={360} height={460} fill="#C9A87A" stroke={INK} strokeWidth={8} />
      <path d="M800 400 L900 200 L980 120 L1060 180 L1120 400 Z" fill="#7A7064" />
      <path d="M960 -60 V400 M780 170 H1140" stroke="#3E2A1C" strokeWidth={12} />
      <rect x={780} y={-60} width={360} height={460} fill="none" stroke="#3E2A1C" strokeWidth={22} />
      {/* crest (generic) */}
      <circle cx={960} cy={480} r={56} fill="#C9A35A" stroke={INK} strokeWidth={5} /><path d="M930 470 L960 440 L990 470 L980 510 H940 Z" fill="#7E2119" stroke={INK} strokeWidth={3} />
      {/* bench */}
      <rect x={560} y={560} width={800} height={60} fill="#3A2618" stroke={INK} strokeWidth={6} />
      <rect x={580} y={620} width={760} height={285} fill="#4A3220" stroke={INK} strokeWidth={6} />
      {[700, 960, 1220].map((x) => <rect key={x} x={x - 80} y={660} width={160} height={200} fill="#3E2A1C" stroke={INK} strokeWidth={4} />)}
      {/* papers on the bench, inkwell */}
      <rect x={640} y={540} width={140} height={24} fill="#EFE3C6" stroke={INK} strokeWidth={3} transform="rotate(-4 700 550)" />
      <rect x={1180} y={536} width={50} height={28} fill="#1A1210" stroke={INK} strokeWidth={3} />
      {/* lectern left */}
      <path d="M140 905 L180 660 L380 660 L420 905 Z" fill="#4A3220" stroke={INK} strokeWidth={6} />
      <path d="M150 640 L410 610 L420 660 L160 680 Z" fill="#5A3D27" stroke={INK} strokeWidth={5} />
      {/* witness box right */}
      <rect x={1500} y={640} width={420} height={265} fill="#4A3220" stroke={INK} strokeWidth={6} />
      <rect x={1490} y={620} width={440} height={30} fill="#3A2618" stroke={INK} strokeWidth={5} />
    </g>
    <rect x={-400} y={FLOOR} width={2800} height={400} fill="url(#floor)" />
    <path d="M780 -60 L1140 -60 L1500 905 L420 905 Z" fill="#FFE2A8" opacity={0.08} />
  </g>
);

// ================= DOYLE's study (1884) =================
export const Study: React.FC<{f: number}> = ({f}) => {
  const fl = flickOf(f);
  return (
    <g>
      <g filter="url(#paint)">
        <rect x={-400} y={-300} width={2800} height={1500} fill="#3A2E3A" />
        <rect x={-400} y={-300} width={2800} height={1500} fill="#5A3A2A" opacity={0.5} />
        {Array.from({length: 40}, (_, i) => <path key={i} d={`M${-400 + i * 70} -300 V${FLOOR}`} stroke="#4A2E24" strokeWidth={3} opacity={0.5} />)}
        {/* bookcase */}
        <rect x={1300} y={40} width={620} height={865} fill="#3A2618" stroke={INK} strokeWidth={6} />
        {[0, 1, 2, 3].map((r) => <g key={r}><rect x={1320} y={70 + r * 200} width={580} height={180} fill="#1E140D" />{Array.from({length: 13}, (_, i) => <rect key={i} x={1326 + i * 44} y={110 + r * 200 - (i % 3) * 8} width={38} height={140 + (i % 3) * 8} fill={['#6E2A22', '#2E4A3A', '#5A4632', '#3A3A5A', '#7A5A2A'][(i + r) % 5]} stroke={INK} strokeWidth={2} />)}</g>)}
        {/* window */}
        <rect x={160} y={100} width={360} height={440} fill="#1A2438" stroke={INK} strokeWidth={8} />
        <path d="M340 100 V540 M160 320 H520" stroke="#3E2A1C" strokeWidth={12} />
        {/* desk */}
        <rect x={420} y={640} width={900} height={36} fill="#5A3D27" stroke={INK} strokeWidth={6} />
        <rect x={460} y={676} width={240} height={229} fill="#4A3220" stroke={INK} strokeWidth={5} />
        <rect x={1060} y={676} width={240} height={229} fill="#4A3220" stroke={INK} strokeWidth={5} />
        {[0, 1, 2].map((i) => <rect key={i} x={780 + i * 30} y={600 - i * 6} width={260} height={50} fill="#EFE3C6" stroke={INK} strokeWidth={3} transform={`rotate(${-6 + i * 5} 900 620)`} />)}
        <rect x={1150} y={590} width={40} height={50} fill="#1A1210" stroke={INK} strokeWidth={3} />
        <path d="M1170 590 L1220 470" stroke="#EDE6D6" strokeWidth={6} />
      </g>
      {/* oil lamp */}
      <g transform="translate(560 640)">
        <path d="M-30 0 L30 0 L20 -40 L-20 -40 Z" fill="#C9A35A" stroke={INK} strokeWidth={4} />
        <path d="M-26 -40 Q-40 -110 0 -140 Q40 -110 26 -40 Z" fill="#F2E8D0" opacity={0.6} stroke={INK} strokeWidth={4} />
        <Flame x={0} y={-60} f={f} s={0.8} />
      </g>
      <circle cx={560} cy={570} r={560} fill="url(#candle)" opacity={0.75 + fl * 0.1} />
      <rect x={-400} y={FLOOR} width={2800} height={400} fill="url(#floor)" />
    </g>
  );
};

// ================= ATLANTIC MAP (painted) =================
export const MAP = {ny: [250, 380] as [number, number], azores: [1050, 520] as [number, number], santa: [1110, 560] as [number, number], found: [1370, 520] as [number, number], gib: [1640, 640] as [number, number], genoa: [1880, 400] as [number, number], haiti: [180, 860] as [number, number]};
export const MapAtlantic: React.FC<{f: number; labels?: number}> = ({f, labels = 1}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1700} fill="#C9B48A" />
    <g filter="url(#paint)">
      <rect x={-300} y={-200} width={2600} height={1500} fill="url(#parch)" stroke="#6B5434" strokeWidth={6} />
      <rect x={-300} y={-200} width={2600} height={1500} filter="url(#brush)" fill="#D8C49A" opacity={0.6} />
      {/* ocean wash */}
      <path d="M300 -200 Q260 200 330 420 Q180 600 220 820 Q160 1000 300 1300 L1600 1300 Q1500 900 1560 760 Q1600 640 1520 520 Q1580 300 1640 -200 Z" fill="#9FB0A4" opacity={0.35} />
      {/* North America coast */}
      <path d="M-300 -200 L340 -200 Q300 60 360 200 Q300 300 300 380 Q240 470 260 560 Q200 640 140 700 Q120 800 40 840 Q-60 900 -300 900 Z" fill="#B89A6A" stroke="#6B4A2F" strokeWidth={5} />
      {/* Caribbean islands */}
      <path d="M120 860 q40 -20 90 -6 q30 10 60 0 q-10 26 -60 26 q-50 4 -90 -20 Z" fill="#B89A6A" stroke="#6B4A2F" strokeWidth={4} />
      {/* Europe + Africa */}
      <path d="M2300 -200 L1640 -200 Q1700 40 1660 160 Q1590 260 1620 380 Q1560 460 1590 560 L1600 640 Q1680 620 1720 650 Q1740 700 1640 760 Q1560 860 1580 1000 Q1600 1150 1700 1300 L2300 1300 Z" fill="#B89A6A" stroke="#6B4A2F" strokeWidth={5} />
      <path d="M1720 650 Q1800 560 1900 520 Q2000 470 2300 480" fill="none" stroke="#6B4A2F" strokeWidth={4} />
      {/* Azores */}
      {[[960, 470], [1000, 500], [1030, 495], [1070, 520], [1110, 560]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={12} ry={7} fill="#B89A6A" stroke="#6B4A2F" strokeWidth={3} />)}
      {/* compass */}
      <g transform="translate(700 1000)"><circle r={80} fill="none" stroke="#6B4A2F" strokeWidth={4} /><path d="M0 -100 L16 0 L0 100 L-16 0 Z" fill="#7E2119" stroke={INK} strokeWidth={3} /><text y={-112} textAnchor="middle" fontFamily="FellSC" fontSize={44} fill="#6B4A2F">N</text></g>
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M${500 + i * 140 + ((f * 0.5) % 140)} ${700 + (i % 3) * 30} q24 -10 48 0`} stroke="#6E8A84" strokeWidth={3} fill="none" opacity={0.6} />)}
    </g>
    <g opacity={labels} fontFamily="FellSC" fill="#4A2E1A">
      <text x={240} y={340} textAnchor="middle" fontSize={44}>New York</text>
      <circle cx={MAP.ny[0]} cy={MAP.ny[1]} r={10} fill="#7E2119" />
      <text x={1000} y={440} textAnchor="middle" fontSize={40}>The Azores</text>
      <text x={1650} y={700} textAnchor="end" fontSize={40}>Gibraltar</text>
      <circle cx={MAP.gib[0]} cy={MAP.gib[1]} r={10} fill="#7E2119" />
      <text x={1880} y={360} textAnchor="middle" fontSize={40}>Genoa</text>
      <circle cx={MAP.genoa[0]} cy={MAP.genoa[1]} r={10} fill="#7E2119" />
      <text x={1760} y={300} textAnchor="middle" fontSize={36} fontFamily="FellItalic" fontStyle="italic">Portugal</text>
      <text x={800} y={260} textAnchor="middle" fontSize={64} fontFamily="FellItalic" fontStyle="italic" opacity={0.6}>Atlantic Ocean</text>
    </g>
  </g>
);

// ================= HAITI REEF (1885) =================
export const Reef: React.FC<{f: number}> = ({f}) => (
  <g>
    <Sky f={f} mode="tropic" horizon={560} />
    <g filter="url(#paint)"><path d="M1300 560 Q1500 420 1700 470 Q1900 430 2300 520 L2300 560 Z" fill="#4E7A4A" stroke={INK} strokeWidth={4} /></g>
    <Sea f={f} mode="tropic" horizon={560} rough={0.5} />
    <g filter="url(#paint)">
      {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={200 + i * 200} cy={820 + (i % 2) * 40} rx={90} ry={26} fill="#C9B07A" opacity={0.7} />)}
      <path d="M600 860 Q700 780 820 800 Q900 760 980 820 Q1080 800 1140 860 Z" fill="#8A7458" stroke={INK} strokeWidth={5} />
    </g>
  </g>
);

// ================= CORK BOARD =================
export const Board: React.FC = () => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1700} fill="#3A2818" />
    <g filter="url(#paint)">
      <rect x={-100} y={-100} width={2120} height={1280} fill="#A87E52" stroke="#4A3220" strokeWidth={30} />
      {Array.from({length: 260}, (_, i) => <circle key={i} cx={-80 + R(`kx${i}`) * 2080} cy={-80 + R(`ky${i}`) * 1240} r={2 + R(`kr${i}`) * 3} fill="#7A5634" opacity={0.6} />)}
    </g>
  </g>
);
