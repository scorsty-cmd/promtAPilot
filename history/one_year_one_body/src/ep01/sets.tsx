// Painted sets for Ep 1 (London 1665). Static detail is wrapped in the 'paint' displacement filter.
import React from 'react';
import {random} from 'remotion';
import {INK, FLOOR} from './kit';
import {Bread, Candle, Lantern, ToothProp} from '../rig';

const R = (s: string) => random(s);
export const flickOf = (f: number) => (Math.sin(f * 0.9) + Math.sin(f * 1.7 + 1) * 0.5 + Math.sin(f * 3.1) * 0.3) / 1.8;

export const Flame: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, f, s = 1}) => {
  const fl = flickOf(f);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + fl * 0.08)} ${s * (1 + fl * 0.15)})`}>
      <path d="M0 -40 Q14 -14 8 0 Q0 6 -8 0 Q-14 -14 0 -40 Z" fill="#FFD27A" />
      <path d="M0 -26 Q6 -10 3 -2 Q0 1 -3 -2 Q-6 -10 0 -26 Z" fill="#FFF5D6" />
    </g>
  );
};

const Planks: React.FC<{x0: number; x1: number; y0: number; y1: number; c: [number, number, number]; w?: number; seed: string}> = ({x0, x1, y0, y1, c, w = 88, seed}) => (
  <g>
    {Array.from({length: Math.ceil((x1 - x0) / w)}, (_, i) => {
      const k = 0.85 + R(`${seed}${i}`) * 0.22;
      return <rect key={i} x={x0 + i * w} y={y0} width={w} height={y1 - y0} fill={`rgb(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)})`} stroke="#2E1F15" strokeWidth={4} />;
    })}
  </g>
);
const Floor: React.FC<{x0?: number; x1?: number}> = ({x0 = -400, x1 = 2400}) => (
  <g>
    <rect x={x0} y={FLOOR} width={x1 - x0} height={260} fill="url(#floor)" />
    <g stroke="#1A120C" strokeWidth={3} opacity={0.7}>
      {Array.from({length: 20}, (_, i) => <path key={i} d={`M${x0 + i * 160} ${FLOOR} L${x0 - 200 + i * 200} 1160`} />)}
    </g>
  </g>
);

// rooftops silhouette for windows
const Roofs: React.FC<{x: number; y: number; w: number; h: number; c?: string}> = ({x, y, w, h, c = '#141826'}) => (
  <path d={`M${x} ${y + h} V${y + h * 0.55} L${x + w * 0.12} ${y + h * 0.35} L${x + w * 0.24} ${y + h * 0.55} V${y + h * 0.4} L${x + w * 0.38} ${y + h * 0.2} L${x + w * 0.5} ${y + h * 0.42} L${x + w * 0.62} ${y + h * 0.3} L${x + w * 0.66} ${y + h * 0.3} V${y + h * 0.12} h${w * 0.04} V${y + h * 0.34} L${x + w * 0.82} ${y + h * 0.48} L${x + w} ${y + h * 0.36} V${y + h} Z`} fill={c} />
);

// ================= ATTIC (night) =================
export const Attic: React.FC<{f: number; candle?: boolean}> = ({f, candle}) => {
  const fl = flickOf(f);
  return (
    <g>
      <g filter="url(#paint)">
        <Planks x0={-300} x1={2300} y0={0} y1={FLOOR} c={[58, 44, 36]} seed="at" />
        {/* sloped roof */}
        <path d="M-300 -40 L-300 420 L900 -40 Z" fill="#2A1F18" stroke={INK} strokeWidth={6} />
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M${-300 + i * 40} ${420 - i * 15} L${900 - i * 200} -40`} stroke="#1E1610" strokeWidth={4} opacity={0.6} />)}
        <path d="M-300 420 L900 -40" stroke="#4A3424" strokeWidth={30} />
        <path d="M2300 -40 L2300 300 L1500 -40 Z" fill="#2A1F18" stroke={INK} strokeWidth={6} />
        <rect x={980} y={-40} width={36} height={FLOOR + 40} fill="#3A2A1E" stroke={INK} strokeWidth={5} />
        {/* window */}
        <rect x={1240} y={200} width={300} height={330} fill="url(#nightSky)" stroke={INK} strokeWidth={8} />
        <circle cx={1450} cy={280} r={34} fill="#F2EAD0" />
        <circle cx={1462} cy={272} r={30} fill="#1B2640" opacity={0.25} />
        <Roofs x={1240} y={390} w={300} h={140} />
        <path d="M1390 200 V530 M1240 365 H1540" stroke="#3E2A1C" strokeWidth={10} />
        <rect x={1240} y={200} width={300} height={330} fill="none" stroke="#3E2A1C" strokeWidth={20} />
        <rect x={1220} y={530} width={340} height={24} fill="#4A3424" stroke={INK} strokeWidth={5} />
        {/* peg with clothes, chest */}
        <path d="M300 380 v20" stroke={INK} strokeWidth={8} />
        <path d="M262 400 Q300 390 338 400 L352 560 Q300 572 248 560 Z" fill="#5E4630" stroke={INK} strokeWidth={5} />
        <rect x={1640} y={760} width={260} height={150} rx={8} fill="#5A3D27" stroke={INK} strokeWidth={6} />
        <path d="M1640 800 H1900" stroke="#3A2618" strokeWidth={8} />
        <rect x={1755} y={790} width={30} height={26} fill="#C9A35A" stroke={INK} strokeWidth={4} />
      </g>
      <Floor />
      {/* straw mattress */}
      <g filter="url(#paint)">
        <rect x={520} y={830} width={760} height={80} rx={30} fill="#B9A06A" stroke={INK} strokeWidth={6} />
        {Array.from({length: 22}, (_, i) => <path key={i} d={`M${540 + i * 33} ${838 + (i % 3) * 6} l${10 + (i % 4) * 4} -14`} stroke="#8C7444" strokeWidth={3} />)}
        <ellipse cx={600} cy={826} rx={80} ry={30} fill="#D8CBAE" stroke={INK} strokeWidth={5} />
      </g>
      {/* moonlight pool through the window */}
      <path d="M1240 200 L1540 200 L1240 900 L520 900 Z" fill="#9FB6DD" opacity={0.08} />
      <ellipse cx={900} cy={860} rx={460} ry={120} fill="url(#moonPool)" />
      {candle && (
        <g>
          <g transform="translate(1440 760)"><Candle flick={fl} /></g>
          <circle cx={1440} cy={700} r={500} fill="url(#candle)" opacity={0.7 + fl * 0.15} />
        </g>
      )}
    </g>
  );
};
// blanket drawn over a lying character
export const Blanket: React.FC<{x: number; y: number; breathe: number; shiver?: number}> = ({x, y, breathe, shiver = 0}) => (
  <g transform={`translate(${x + shiver} ${y})`} filter="url(#soft)">
    <path d={`M0 0 Q160 ${-46 - breathe * 6} 330 -30 Q470 -40 560 -10 L570 70 Q300 90 -10 70 Z`} fill="#6E5A7A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M40 10 Q200 -20 320 -6 M60 40 Q260 20 520 30" stroke="#55456A" strokeWidth={4} fill="none" />
    <path d="M0 0 Q160 -46 330 -30" stroke="#8A76A0" strokeWidth={5} fill="none" opacity={0.6} />
  </g>
);

// ================= BAKERY (wide set, x -300..2700) =================
export const Bakery: React.FC<{f: number; fire?: number; night?: boolean; snow?: boolean}> = ({f, fire = 1, snow}) => {
  const fl = flickOf(f);
  const bricks = [];
  for (let r = 0; r < 22; r++) for (let c = 0; c < 18; c++) {
    const k = 0.82 + R(`br${r}-${c}`) * 0.26;
    bricks.push(<rect key={`${r}-${c}`} x={-300 + c * 70 + (r % 2) * 35} y={r * 42} width={70} height={42} fill={`rgb(${Math.round(126 * k)},${Math.round(70 * k)},${Math.round(48 * k)})`} stroke="#3A2218" strokeWidth={3} />);
  }
  return (
    <g>
      <g filter="url(#paint)">
        <Planks x0={900} x1={2800} y0={0} y1={FLOOR} c={[96, 72, 50]} seed="bk" />
        {bricks}
        {/* big domed oven */}
        <path d="M-200 905 V420 Q120 160 440 420 V905 Z" fill="#8A5238" stroke={INK} strokeWidth={8} />
        <path d="M-120 905 V470 Q120 260 360 470 V905" fill="none" stroke="#6E3E2A" strokeWidth={6} />
        <path d="M30 760 V600 Q120 520 210 600 V760 Z" fill="#1A0D08" stroke={INK} strokeWidth={8} />
        <rect x={-210} y={760} width={660} height={40} fill="#5A3A28" stroke={INK} strokeWidth={6} />
        {/* window with shutters */}
        <rect x={1300} y={170} width={300} height={300} fill={snow ? '#B8C4CC' : 'url(#dawnSky)'} stroke={INK} strokeWidth={8} />
        <Roofs x={1300} y={330} w={300} h={140} c={snow ? '#6A7280' : '#2A2830'} />
        {snow && <path d="M1300 345 L1336 330 L1360 345 V340 L1400 316 L1450 338 L1486 326 L1500 326 L1525 342 L1600 330 V350 H1300 Z" fill="#F2F4F6" />}
        <path d="M1450 170 V470 M1300 320 H1600" stroke="#3E2A1C" strokeWidth={10} />
        <rect x={1300} y={170} width={300} height={300} fill="none" stroke="#3E2A1C" strokeWidth={18} />
        <rect x={1210} y={160} width={80} height={320} fill="#4E3A26" stroke={INK} strokeWidth={5} />
        <rect x={1610} y={160} width={80} height={320} fill="#4E3A26" stroke={INK} strokeWidth={5} />
        {/* shelves of loaves */}
        {[300, 470].map((y, si) => (
          <g key={y}>
            <rect x={1760} y={y} width={560} height={18} fill="#4A3424" stroke={INK} strokeWidth={5} />
            {Array.from({length: 6}, (_, i) => <g key={i} transform={`translate(${1790 + i * 88} ${y - 22}) scale(0.62)`}><Bread /></g>)}
            {si === 1 && <path d="M1790 488 l20 40 M2290 488 l-20 40" stroke={INK} strokeWidth={8} />}
          </g>
        ))}
        {/* flour sacks */}
        {[[960, 0], [1060, 1], [1010, 2]].map(([x, i]) => (
          <g key={i} transform={`translate(${x} ${i === 2 ? 760 : 800})`}>
            <path d="M-50 105 Q-60 20 -30 -10 Q0 -30 30 -10 Q60 20 50 105 Z" fill="#E4D8BE" stroke={INK} strokeWidth={6} />
            <path d="M-20 -14 q20 -14 40 0" stroke={INK} strokeWidth={5} fill="none" />
            <text x={0} y={60} textAnchor="middle" fontFamily="FellSC" fontSize={30} fill="#8C7552">FLOUR</text>
          </g>
        ))}
        {/* hearth corner (Agnes) */}
        <rect x={2380} y={430} width={420} height={475} fill="#6E4A34" stroke={INK} strokeWidth={8} />
        <rect x={2440} y={620} width={300} height={285} fill="#1E120C" stroke={INK} strokeWidth={6} />
        <rect x={2360} y={410} width={460} height={34} fill="#4A3424" stroke={INK} strokeWidth={6} />
        {[2420, 2520, 2640, 2740].map((x, i) => (
          <g key={x} transform={`rotate(${Math.sin(f * 0.04 + i) * 2} ${x} 444)`}>
            <path d={`M${x} 444 v20`} stroke="#6B5A3A" strokeWidth={3} />
            <path d={`M${x - 14} 464 L${x} 520 L${x + 14} 464 Z`} fill={['#6F7A45', '#7A6A45', '#5E7045', '#8A7A4A'][i]} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        <path d="M2530 780 Q2590 720 2650 780 L2640 850 Q2590 870 2540 850 Z" fill="#2A2420" stroke={INK} strokeWidth={6} />
        {/* recipe shelf with jars + box */}
        {[2420, 2490, 2560].map((x, i) => <rect key={x} x={x} y={350 - [50, 64, 44][i]} width={46} height={[50, 64, 44][i]} rx={8} fill={['#6E8F5E', '#9C5A3C', '#4F6E7E'][i]} stroke={INK} strokeWidth={4} />)}
        <rect x={2640} y={300} width={110} height={50} fill="#5A3D27" stroke={INK} strokeWidth={5} />
        {/* table (kneading trough) */}
        <rect x={560} y={740} width={560} height={30} fill="#7A5638" stroke={INK} strokeWidth={6} />
        <path d="M600 770 V905 M1080 770 V905" stroke={INK} strokeWidth={16} />
        <path d="M600 770 V905 M1080 770 V905" stroke="#5A3D27" strokeWidth={8} />
      </g>
      {/* fire inside the oven (live) */}
      <g opacity={fire}>
        <path d={`M50 760 Q80 ${690 - fl * 20} 100 740 Q120 ${660 + fl * 18} 140 740 Q160 ${690 - fl * 14} 190 760 Z`} fill="#FF8A2A" />
        <path d={`M80 760 Q110 ${712 - fl * 12} 130 745 Q150 ${720 + fl * 10} 170 760 Z`} fill="#FFD27A" />
        <circle cx={120} cy={700} r={560} fill="url(#ovenGlow)" opacity={0.75 + fl * 0.15} />
      </g>
      <g opacity={0.6 * fire}>
        <path d={`M2490 900 Q2520 ${850 - fl * 10} 2550 890 Q2590 ${840 + fl * 12} 2630 895 Q2660 ${860 - fl * 8} 2690 900 Z`} fill="#FF8A2A" />
        <circle cx={2590} cy={820} r={360} fill="url(#ovenGlow)" opacity={0.5 + fl * 0.1} />
      </g>
      <Floor x0={-400} x1={2900} />
      {/* dough on the table */}
      <ellipse cx={840} cy={732} rx={120} ry={22} fill="#EADBB8" stroke={INK} strokeWidth={5} />
    </g>
  );
};

// ================= STREET (day / dawn / night) =================
const House: React.FC<{x: number; w: number; h: number; s: number; night?: boolean; cross?: number; shut?: boolean}> = ({x, w, h, s, night, cross = 0, shut}) => {
  const r = (k: number) => R(`h${s}-${k}`);
  const plaster = ['#C9AC80', '#BFA176', '#D1B88E', '#B89A70'][Math.floor(r(1) * 4)];
  const timber = '#3A2A1D';
  const g = FLOOR, upTop = g - h, roofH = 70 + r(2) * 60;
  const nW = Math.max(2, Math.floor(w / 95));
  const doorX = x + w * 0.35;
  return (
    <g>
      <path d={`M${x - 26} ${upTop} L${x + w / 2} ${upTop - roofH} L${x + w + 26} ${upTop} Z`} fill="#4A3A33" stroke={INK} strokeWidth={5} />
      <path d={`M${x + w * 0.72} ${upTop - roofH * 0.5} v-60 h28 v${74}`} fill="#5A4436" stroke={INK} strokeWidth={4} />
      <rect x={x - 18} y={upTop} width={w + 36} height={h * 0.58} fill={plaster} stroke={INK} strokeWidth={5} />
      <path d={`M${x - 18} ${upTop + h * 0.29} H${x + w + 18} M${x + w * 0.33} ${upTop} V${upTop + h * 0.58} M${x + w * 0.66} ${upTop} V${upTop + h * 0.58} M${x - 18} ${upTop} L${x + w * 0.33} ${upTop + h * 0.29} M${x + w + 18} ${upTop} L${x + w * 0.66} ${upTop + h * 0.29}`} stroke={timber} strokeWidth={9} />
      <rect x={x} y={upTop + h * 0.58} width={w} height={h * 0.42} fill={plaster} stroke={INK} strokeWidth={5} />
      {Array.from({length: nW}, (_, i) => {
        const wx = x + 14 + i * ((w - 28) / nW) + 10, ww = (w - 28) / nW - 20;
        const lit = night && r(10 + i) > 0.7;
        return (
          <g key={i}>
            <rect x={wx} y={upTop + 36} width={ww} height={h * 0.2} fill={lit ? '#E8B060' : night ? '#1A1E28' : '#3B3128'} stroke={timber} strokeWidth={5} />
            <path d={`M${wx + ww / 2} ${upTop + 36} V${upTop + 36 + h * 0.2}`} stroke={timber} strokeWidth={3} />
            {shut && i === 0 && <rect x={wx - 4} y={upTop + 32} width={ww + 8} height={h * 0.2 + 8} fill="#5A4436" stroke={INK} strokeWidth={4} />}
          </g>
        );
      })}
      <rect x={doorX} y={g - h * 0.34} width={w * 0.24} height={h * 0.34} fill="#4A3020" stroke={INK} strokeWidth={5} />
      <path d={`M${doorX + w * 0.06} ${g - h * 0.34} V${g} M${doorX + w * 0.18} ${g - h * 0.34} V${g}`} stroke="#2E1E14" strokeWidth={3} />
      {cross > 0 && (
        <g>
          <path d={`M${doorX + w * 0.12} ${g - h * 0.31} V${g - h * 0.31 + h * 0.26 * Math.min(1, cross * 2)}`} stroke="#B3201A" strokeWidth={16} strokeLinecap="round" />
          {cross > 0.5 && <path d={`M${doorX + w * 0.02} ${g - h * 0.24} H${doorX + w * 0.02 + w * 0.2 * Math.min(1, (cross - 0.5) * 2)}`} stroke="#B3201A" strokeWidth={16} strokeLinecap="round" />}
        </g>
      )}
    </g>
  );
};
export const HOUSES = [
  {x: -380, w: 300, h: 560}, {x: -50, w: 260, h: 610}, {x: 240, w: 330, h: 540}, {x: 600, w: 280, h: 600}, {x: 910, w: 360, h: 570},
  {x: 1300, w: 300, h: 620}, {x: 1630, w: 340, h: 560}, {x: 2000, w: 290, h: 600}, {x: 2320, w: 330, h: 580}, {x: 2680, w: 300, h: 610},
];
export const doorOf = (i: number) => ({x: HOUSES[i].x + HOUSES[i].w * 0.47, top: FLOOR - HOUSES[i].h * 0.34, h: HOUSES[i].h});
export const Street: React.FC<{f: number; mode?: 'day' | 'dawn' | 'night'; crosses?: Record<number, number>; lamps?: number[]}> = ({f, mode = 'day', crosses = {}, lamps = []}) => {
  const night = mode === 'night';
  const fl = flickOf(f);
  return (
    <g>
      <rect x={-600} y={-300} width={4200} height={1400} fill={night ? 'url(#nightSky)' : mode === 'dawn' ? 'url(#dawnSky)' : 'url(#daySky)'} />
      {night && <circle cx={1500} cy={120} r={40} fill="#F2EAD0" opacity={0.9} />}
      {/* far skyline with St Paul's (no dome yet in 1665: old Gothic cathedral without spire) */}
      <g filter="url(#paint)" opacity={night ? 0.8 : 0.55}>
        {Array.from({length: 26}, (_, i) => <rect key={i} x={-500 + i * 150} y={FLOOR - 640 - R(`fs${i}`) * 160} width={150} height={700} fill={night ? '#151a28' : '#7D7A72'} />)}
        <path d="M1050 300 h260 v-60 h50 v60 h20 V500 h-330 Z" fill={night ? '#121624' : '#6E6B64'} />
        <path d="M1240 240 V140 h70 V240" fill={night ? '#121624' : '#6E6B64'} />
      </g>
      <g filter="url(#paint)">
        {HOUSES.map((h, i) => <House key={i} {...h} s={i + 3} night={night} cross={crosses[i] ?? 0} shut={(crosses[i] ?? 0) > 0} />)}
        {/* cobbles */}
        <rect x={-600} y={FLOOR} width={4200} height={260} fill={night ? '#22201E' : '#5A4A3C'} />
        {Array.from({length: 7}, (_, row) => Array.from({length: 70}, (_, i) => {
          const y = FLOOR + 8 + row * row * 4.2 + row * 14, sw = 28 + row * 10, sh = 10 + row * 4.5;
          const x = -600 + i * sw + (row % 2) * sw * 0.5;
          const k = 0.75 + R(`c${row}-${i}`) * 0.3;
          return <rect key={`${row}-${i}`} x={x} y={y} width={sw - 4} height={sh} rx={sh / 2} fill={night ? `rgb(${Math.round(52 * k)},${Math.round(50 * k)},${Math.round(50 * k)})` : `rgb(${Math.round(120 * k)},${Math.round(104 * k)},${Math.round(86 * k)})`} stroke="#2A2018" strokeWidth={2} />;
        }))}
        <path d={`M-600 ${FLOOR + 120} Q1000 ${FLOOR + 100} 3600 ${FLOOR + 120}`} stroke="#3A3028" strokeWidth={18} opacity={0.5} fill="none" />
      </g>
      {lamps.map((x, i) => (
        <g key={i}>
          <path d={`M${x} ${FLOOR} V${FLOOR - 330} h60`} stroke={INK} strokeWidth={10} fill="none" />
          <g transform={`translate(${x + 60} ${FLOOR - 270})`}><Lantern lit={0.9 + fl * 0.1} /></g>
          <circle cx={x + 60} cy={FLOOR - 280} r={260} fill="url(#candle)" opacity={night ? 1 : 0.2} />
          {night && <ellipse cx={x + 60} cy={FLOOR + 60} rx={240} ry={60} fill="#FFC870" opacity={0.18 + fl * 0.04} />}
        </g>
      ))}
    </g>
  );
};

// ================= BARBER SHOPFRONT =================
export const Shopfront: React.FC<{f: number}> = ({f}) => (
  <g>
    <rect x={-600} y={-300} width={3200} height={1400} fill="url(#dawnSky)" />
    <g filter="url(#paint)">
      <rect x={200} y={120} width={1500} height={785} fill="#BFA176" stroke={INK} strokeWidth={6} />
      <path d="M200 380 H1700 M700 120 V380 M1200 120 V380" stroke="#3A2A1D" strokeWidth={14} />
      <path d="M140 120 L950 -120 L1760 120 Z" fill="#4A3A33" stroke={INK} strokeWidth={6} />
      {/* big shop window */}
      <rect x={420} y={440} width={620} height={360} fill="#2F2A2E" stroke="#3A2A1D" strokeWidth={14} />
      <rect x={430} y={450} width={600} height={340} fill="#4A3A30" opacity={0.6} />
      <circle cx={900} cy={700} r={160} fill="url(#candle)" opacity={0.9} />
      <g stroke="#2B1D14" strokeWidth={3} opacity={0.7}>
        {Array.from({length: 9}, (_, i) => <path key={`a${i}`} d={`M${420 + i * 70 - 120} 440 l200 360`} />)}
        {Array.from({length: 9}, (_, i) => <path key={`b${i}`} d={`M${420 + i * 70 + 120} 440 l-200 360`} />)}
      </g>
      <rect x={1180} y={480} width={240} height={425} fill="#4A3020" stroke={INK} strokeWidth={6} />
      <circle cx={1390} cy={700} r={10} fill="#C9A35A" stroke={INK} strokeWidth={3} />
      <rect x={400} y={800} width={660} height={26} fill="#4A3424" stroke={INK} strokeWidth={5} />
    </g>
    {/* string of teeth in the window (live, they sway) */}
    <path d="M450 480 Q730 580 1010 480" stroke="#8C7552" strokeWidth={4} fill="none" />
    {Array.from({length: 14}, (_, i) => {
      const tx = 470 + i * 40, ty = 486 + Math.sin((i / 13) * Math.PI) * 48;
      return <g key={i} transform={`translate(${tx} ${ty + 20}) rotate(${Math.sin(f * 0.05 + i) * 7})`}><ToothProp s={0.7} /></g>;
    })}
    {/* hanging barber's basin sign */}
    <g transform={`rotate(${Math.sin(f * 0.05) * 3} 1580 440)`}>
      <path d="M1500 440 H1700" stroke={INK} strokeWidth={10} />
      <path d="M1580 440 v40" stroke={INK} strokeWidth={4} />
      <path d="M1520 480 Q1580 560 1640 480 Z" fill="#C9A35A" stroke={INK} strokeWidth={6} />
      <path d="M1566 480 q14 18 28 0" fill="#2F2A2E" stroke={INK} strokeWidth={3} />
    </g>
    {/* striped pole */}
    <g>
      <rect x={1740} y={420} width={44} height={420} fill="#F2EDE2" stroke={INK} strokeWidth={6} />
      <clipPath id="poleClip"><rect x={1740} y={420} width={44} height={420} /></clipPath>
      <g clipPath="url(#poleClip)">
        {Array.from({length: 12}, (_, i) => <path key={i} d={`M1730 ${380 + i * 50 + ((f * 1.5) % 50)} l70 -40 v20 l-70 40 Z`} fill="#B3201A" />)}
      </g>
      <circle cx={1762} cy={412} r={20} fill="#C9A35A" stroke={INK} strokeWidth={5} />
    </g>
    <rect x={-600} y={FLOOR} width={3200} height={260} fill="#5A4A3C" />
    <g opacity={0.6}>{Array.from({length: 40}, (_, i) => <rect key={i} x={-600 + i * 80} y={FLOOR + 20 + (i % 2) * 30} width={70} height={22} rx={10} fill="#6E5C4A" />)}</g>
  </g>
);

// ================= PARCHMENT (bill / map base) =================
export const Parchment: React.FC<{x?: number; y?: number; w?: number; h?: number}> = ({x = 260, y = 60, w = 1400, h = 960}) => (
  <g filter="url(#paint)">
    <rect x={x + 12} y={y + 16} width={w} height={h} fill="#0E0805" opacity={0.5} />
    <path d={`M${x} ${y} H${x + w} V${y + h} H${x} Z`} fill="url(#parch)" stroke="#6B5434" strokeWidth={6} />
    <rect x={x} y={y} width={w} height={h} filter="url(#brush)" fill="#D8C49A" opacity={0.7} />
    <rect x={x + 30} y={y + 30} width={w - 60} height={h - 60} fill="none" stroke="#6B5434" strokeWidth={3} />
  </g>
);
export const DarkTable: React.FC<{f: number; glow?: boolean}> = ({f, glow = true}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1700} fill="#1A110B" />
    <g filter="url(#paint)">
      <Planks x0={-400} x1={2400} y0={-300} y1={1400} c={[70, 50, 34]} w={160} seed="dt" />
    </g>
    {glow && <circle cx={1400} cy={200} r={900} fill="url(#candle)" opacity={0.6 + flickOf(f) * 0.08} />}
  </g>
);

// ================= LONDON MAP (painted) =================
export const WALL: [number, number][] = [[560, 620], [600, 420], [700, 330], [900, 300], [1100, 290], [1300, 310], [1420, 380], [1470, 520], [1460, 660]];
export const MapLondon: React.FC<{f: number; labels?: number; bakery?: [number, number]}> = ({f, labels = 1}) => {
  const river = 'M-200 760 C200 700 500 720 800 700 C1100 680 1400 720 1700 690 C1900 670 2100 700 2300 690';
  return (
    <g>
      <rect x={-400} y={-300} width={2800} height={1700} fill="#C9B48A" />
      <Parchment x={-200} y={-150} w={2320} h={1380} />
      <g filter="url(#paint)">
        {/* river Thames */}
        <path d={river} stroke="#6E8A94" strokeWidth={130} fill="none" opacity={0.85} />
        <path d={river} stroke="#8FA8AE" strokeWidth={70} fill="none" opacity={0.6} />
        {Array.from({length: 10}, (_, i) => <path key={i} d={`M${-100 + i * 240 + ((f * 0.6) % 240)} ${712 + (i % 3) * 14} q20 -8 40 0`} stroke="#DDE6E4" strokeWidth={3} fill="none" opacity={0.6} />)}
        {/* city wall */}
        <path d={`M${WALL.map((p) => p.join(' ')).join(' L')}`} fill="#BFA77A" stroke="#6B4A2F" strokeWidth={14} strokeDasharray="30 10" opacity={0.95} />
        {/* houses texture */}
        {Array.from({length: 140}, (_, i) => {
          const x = 600 + R(`mx${i}`) * 840, y = 340 + R(`my${i}`) * 300;
          return <rect key={i} x={x} y={y} width={16} height={12} fill="#A0805A" stroke="#6B4A2F" strokeWidth={2} opacity={0.8} />;
        })}
        {Array.from({length: 90}, (_, i) => {
          const x = R(`ox${i}`) * 2000 - 100, y = 200 + R(`oy${i}`) * 420;
          return (x < 520 || x > 1500) ? <rect key={i} x={x} y={y} width={14} height={10} fill="#A0805A" stroke="#6B4A2F" strokeWidth={2} opacity={0.6} /> : null;
        })}
        {/* St Paul's */}
        <g transform="translate(820 400)">
          <rect x={-60} y={-30} width={120} height={50} fill="#8E8576" stroke={INK} strokeWidth={4} />
          <rect x={-16} y={-70} width={32} height={50} fill="#8E8576" stroke={INK} strokeWidth={4} />
        </g>
        {/* Tower of London */}
        <g transform="translate(1520 640)">
          <rect x={-40} y={-50} width={80} height={60} fill="#B8AE98" stroke={INK} strokeWidth={4} />
          {[-40, -12, 16].map((x) => <rect key={x} x={x} y={-62} width={20} height={14} fill="#B8AE98" stroke={INK} strokeWidth={3} />)}
        </g>
        {/* London Bridge */}
        <path d="M1180 640 L1200 790" stroke="#8A7458" strokeWidth={36} />
        {Array.from({length: 7}, (_, i) => <rect key={i} x={1176 + i * 3} y={650 + i * 20} width={30} height={12} fill="#6B5434" stroke={INK} strokeWidth={2} />)}
        {/* compass */}
        <g transform="translate(1900 220)">
          <circle r={70} fill="none" stroke="#6B4A2F" strokeWidth={4} />
          <path d="M0 -90 L14 0 L0 90 L-14 0 Z" fill="#7E2119" stroke={INK} strokeWidth={3} />
          <text y={-100} textAnchor="middle" fontFamily="FellSC" fontSize={40} fill="#6B4A2F">N</text>
        </g>
      </g>
      <g opacity={labels}>
        <text x={1020} y={250} textAnchor="middle" fontFamily="FellSC" fontSize={64} fill="#4A2E1A">The City of London</text>
        <text x={1700} y={780} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={48} fill="#2E4650">River Thames</text>
        <text x={820} y={470} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={34} fill="#4A2E1A">St Paul's</text>
        <text x={1520} y={560} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={34} fill="#4A2E1A">The Tower</text>
        <text x={1260} y={860} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={34} fill="#4A2E1A">London Bridge</text>
      </g>
    </g>
  );
};

// ================= ANATOMY HALL =================
export const Hall: React.FC<{f: number}> = ({f}) => {
  const fl = flickOf(f);
  return (
    <g>
      <g filter="url(#paint)">
        <Planks x0={-300} x1={2300} y0={0} y1={FLOOR} c={[80, 60, 44]} seed="hl" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path d={`M${-200 + i * 60} ${560 - i * 150} Q960 ${640 - i * 150} ${2120 - i * 60} ${560 - i * 150}`} stroke="#4A3424" strokeWidth={26} fill="none" />
            <path d={`M${-200 + i * 60} ${600 - i * 150} Q960 ${680 - i * 150} ${2120 - i * 60} ${600 - i * 150}`} stroke="#3A2618" strokeWidth={10} fill="none" />
          </g>
        ))}
        {/* table with covered body (feet poking out) */}
        <rect x={640} y={720} width={640} height={30} fill="#6B4A31" stroke={INK} strokeWidth={6} />
        <path d="M680 750 V905 M1240 750 V905" stroke={INK} strokeWidth={14} />
        <path d="M660 724 Q700 640 800 650 Q960 610 1120 650 Q1220 660 1260 724 Z" fill="#E8E2D2" stroke={INK} strokeWidth={6} />
        <path d="M760 660 Q900 640 1000 670 M900 650 Q1050 630 1180 672" stroke="#C8C0AE" strokeWidth={4} fill="none" />
      </g>
      <g transform="translate(1268 700)">
        <ellipse cx={0} cy={0} rx={16} ry={22} fill="#E9DDC6" stroke={INK} strokeWidth={4} />
        <ellipse cx={14} cy={14} rx={14} ry={20} fill="#E9DDC6" stroke={INK} strokeWidth={4} />
      </g>
      <Floor />
      {[300, 1620].map((x) => <g key={x}><g transform={`translate(${x} 700)`}><Candle flick={fl} /></g><circle cx={x} cy={650} r={420} fill="url(#candle)" opacity={0.7} /></g>)}
    </g>
  );
};

// ================= FAIR STAGE =================
export const Fair: React.FC<{f: number}> = ({f}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1400} fill="url(#daySky)" />
    <g filter="url(#paint)">
      {Array.from({length: 7}, (_, i) => (
        <g key={i} transform={`translate(${-200 + i * 380} 0)`}>
          <path d="M0 520 L150 360 L300 520 Z" fill={i % 2 ? '#B3362B' : '#E8D8B0'} stroke={INK} strokeWidth={5} />
          <rect x={20} y={520} width={260} height={160} fill={i % 2 ? '#E8D8B0' : '#7E2119'} stroke={INK} strokeWidth={5} />
        </g>
      ))}
      <rect x={560} y={560} width={800} height={150} fill="#7A5638" stroke={INK} strokeWidth={8} />
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M${560 + i * 100} 560 V710`} stroke="#5A3D27" strokeWidth={5} />)}
      {/* banner with a giant tooth */}
      <rect x={1240} y={180} width={22} height={380} fill="#5A3D27" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${Math.sin(f * 0.06) * 2} 1250 200)`}>
        <path d="M1262 200 H1560 V420 L1500 390 L1440 420 L1380 390 L1320 420 L1262 400 Z" fill="#E8D8B0" stroke={INK} strokeWidth={6} />
        <g transform="translate(1410 300) scale(2.4)"><ToothProp /></g>
      </g>
      <rect x={-400} y={710} width={2800} height={500} fill="#6E5C44" />
    </g>
  </g>
);

// ================= TOOTH CUTAWAY =================
export const ToothCut: React.FC<{f: number; decay: number; abscess: number; nerveGlow: number}> = ({f, decay, abscess, nerveGlow}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1700} fill="#2A1712" />
    <circle cx={960} cy={540} r={700} fill="#4A2A20" opacity={0.6} />
    {/* gum */}
    <g filter="url(#paint)">
      <path d="M200 620 Q960 560 1720 620 V1200 H200 Z" fill="#C8606A" stroke={INK} strokeWidth={8} />
      <path d="M200 680 Q960 620 1720 680" stroke="#A84850" strokeWidth={6} fill="none" />
      {/* tooth body */}
      <path d="M700 260 Q960 160 1220 260 Q1290 420 1220 620 L1160 1000 Q1130 1060 1080 1000 L990 760 L930 760 L840 1000 Q790 1060 760 1000 L700 620 Q630 420 700 260 Z" fill="#F4EEDD" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {/* dentine & pulp */}
      <path d="M760 320 Q960 240 1160 320 Q1210 440 1160 600 L1110 940 L1000 720 L920 720 L810 940 L760 600 Q710 440 760 320 Z" fill="#EADFC2" />
      <path d="M880 420 Q960 380 1040 420 Q1060 540 1030 640 L1080 900 L990 700 L930 700 L840 900 L890 640 Q860 540 880 420 Z" fill={`rgb(${200 + nerveGlow * 55},${110 - nerveGlow * 40},${110 - nerveGlow * 40})`} stroke={INK} strokeWidth={5} />
    </g>
    {/* nerve lines */}
    <g stroke={nerveGlow > 0.1 ? '#FFDD66' : '#E5A0A0'} strokeWidth={4 + nerveGlow * 3} fill="none" opacity={0.5 + nerveGlow * 0.5}>
      <path d={`M960 440 Q${950 + Math.sin(f * 0.6) * 6 * nerveGlow} 600 960 720 L860 900 M960 720 L1060 900`} />
    </g>
    {nerveGlow > 0.1 && <circle cx={960} cy={560} r={140} fill="#FFDD66" opacity={0.15 * nerveGlow * (0.7 + 0.3 * Math.sin(f * 0.5))} filter="url(#glowS)" />}
    {/* cavity */}
    {decay > 0 && (
      <g>
        <path d={`M1080 ${250 + 4} Q${1090 - 40 * decay} ${330 + 120 * decay} ${1030 - 30 * decay} ${300 + 160 * decay} Q${1000} ${300 + 60 * decay} 1040 260 Z`} fill="#3A2416" stroke={INK} strokeWidth={5} />
        {Array.from({length: 8}, (_, i) => <circle key={i} cx={1040 - i * 6 + Math.sin(f * 0.3 + i) * 4} cy={300 + i * 18 * decay} r={4} fill="#7A9A3A" opacity={decay} />)}
      </g>
    )}
    {/* abscess at the root */}
    {abscess > 0 && (
      <g>
        <ellipse cx={1120} cy={1040} rx={70 * abscess + 6 * Math.sin(f * 0.3)} ry={56 * abscess + 4 * Math.sin(f * 0.3)} fill="#E3D27A" stroke="#8A6A2A" strokeWidth={6} opacity={0.95} />
        {Array.from({length: 10}, (_, i) => <circle key={i} cx={1120 + Math.cos(i + f * 0.05) * 40 * abscess} cy={1040 + Math.sin(i * 1.7 + f * 0.05) * 30 * abscess} r={5} fill="#7A9A3A" />)}
      </g>
    )}
  </g>
);

// worm character (what they believed)
export const Worm: React.FC<{f: number; x: number; y: number; s?: number; chomp?: number; hat?: boolean}> = ({f, x, y, s = 1, chomp = 0, hat}) => {
  const segs = Array.from({length: 7}, (_, i) => [i * -26, Math.sin(f * 0.25 - i * 0.8) * 12]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {segs.slice().reverse().map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={24 - i * 0.5} fill="#D79A8A" stroke={INK} strokeWidth={5} />)}
      <circle cx={6} cy={segs[0][1] - 4} r={30} fill="#E0A898" stroke={INK} strokeWidth={5} />
      <circle cx={16} cy={segs[0][1] - 12} r={6} fill={INK} />
      <path d={`M14 ${segs[0][1] + 6} q12 ${6 + chomp * 10} 22 0`} stroke={INK} strokeWidth={4} fill={chomp > 0.3 ? '#4A1A14' : 'none'} />
      {hat && <g transform={`translate(4 ${segs[0][1] - 40})`}><rect x={-22} y={-30} width={44} height={30} fill="#1F1A18" stroke={INK} strokeWidth={4} /><rect x={-34} y={-4} width={68} height={8} fill="#1F1A18" stroke={INK} strokeWidth={4} /></g>}
    </g>
  );
};
