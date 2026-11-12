// Painted sets for You Were There Ep 2 (Boston / Redhill / Rockies, 1859): telegraph office + instruments, Boston street
// under the aurora, Carrington's observatory + projected sun, Kew magnetograph, space (sun -> CME -> Earth), miners' camp,
// bricklayers, larks, Americas + New England maps, modern city grid, Yale study (re-used), end plate.
import React from 'react';
import {random} from 'remotion';
import {INK, FLOOR, Aurora, StarField, Smoke} from './kit';
import {Lantern} from '../rig';
import {flickOf, Flame} from '../ep01/sets';
import {AM, NE, AM_PATH, NE_PATH, proj} from './geo';
export {Parchment, DarkTable, flickOf, Flame} from '../ep01/sets';
export {Study} from '../ep02/sets';

const R = (s: string) => random(s);
export type SkyMode = 'night' | 'red' | 'aurora' | 'dawn' | 'day' | 'grey';

// ---------------- sky behind windows / streets ----------------
export const NightSky: React.FC<{f: number; mode: SkyMode; x0?: number; x1?: number; y1?: number; green?: number; amt?: number}> = ({f, mode, x0 = -600, x1 = 3600, y1 = 1000, green, amt = 1}) => {
  const top = {night: '#0A1020', red: '#1A0810', aurora: '#0A1420', dawn: '#2A3448', day: '#8FA8BC', grey: '#7A7C80'}[mode];
  const bot = {night: '#24304A', red: '#7A1E22', aurora: '#203A48', dawn: '#E0A070', day: '#DCE2DC', grey: '#B8B4AA'}[mode];
  const id = `ns_${mode}`;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
      <rect x={x0} y={-400} width={x1 - x0} height={y1 + 400} fill={`url(#${id})`} />
      {(mode === 'night' || mode === 'red' || mode === 'aurora') && <StarField f={f} amt={mode === 'night' ? 1 : 0.5} />}
      {mode === 'red' && <Aurora f={f} amt={amt} green={green ?? 0} y0={y1 - 200} x0={x0} x1={x1} spires={0.3} />}
      {mode === 'aurora' && <Aurora f={f} amt={amt} green={green ?? 0.8} y0={y1 - 200} x0={x0} x1={x1} spires={1} />}
      {mode === 'dawn' && <circle cx={x0 + (x1 - x0) * 0.7} cy={y1 - 60} r={160} fill="#FFD9A0" opacity={0.5} filter="url(#glow)" />}
    </g>
  );
};
// Boston rooftops + steeple silhouette
export const Roofline: React.FC<{y: number; x0?: number; x1?: number; c?: string; lit?: boolean}> = ({y, x0 = -600, x1 = 3600, c = '#120E14', lit = true}) => (
  <g>
    {Array.from({length: Math.ceil((x1 - x0) / 130)}, (_, i) => {
      const x = x0 + i * 130, h = 120 + R(`rf${i}`) * 140;
      return (
        <g key={i}>
          <rect x={x} y={y - h} width={132} height={h + 400} fill={c} />
          {R(`rc${i}`) > 0.5 && <rect x={x + 30} y={y - h - 40} width={22} height={44} fill={c} />}
          {lit && R(`rw${i}`) > 0.55 && <rect x={x + 50} y={y - h + 40} width={22} height={30} fill="#FFC870" opacity={0.75} />}
        </g>
      );
    })}
    <path d={`M${x0 + 1100} ${y - 200} V${y - 420} L${x0 + 1130} ${y - 640} L${x0 + 1160} ${y - 420} V${y - 200} Z`} fill={c} />
  </g>
);

// ---------------- telegraph instruments ----------------
export const TKey: React.FC<{x: number; y: number; press?: number; s?: number}> = ({x, y, press = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-80} y={-22} width={170} height={24} rx={4} fill="#6A4A2E" />
    <rect x={-20} y={-40} width={22} height={20} fill="#C9A35A" />
    <g transform={`rotate(${press * 5} -10 -38)`}>
      <rect x={-70} y={-46} width={140} height={12} rx={5} fill="#D8B060" />
      <ellipse cx={74} cy={-48} rx={22} ry={11} fill="#1A1410" />
    </g>
    <rect x={56} y={-30} width={8} height={10} fill="#C9A35A" />
    <circle cx={-62} cy={-12} r={5} fill="#C9A35A" />
  </g>
);
export const Sounder: React.FC<{x: number; y: number; arm?: number; s?: number}> = ({x, y, arm = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-80} y={-20} width={160} height={22} rx={4} fill="#5A3D27" />
    {[-34, 6].map((cx) => <g key={cx}><rect x={cx} y={-80} width={28} height={62} rx={6} fill="#2A2420" /><path d={`M${cx + 4} -70 h20 M${cx + 4} -58 h20 M${cx + 4} -46 h20 M${cx + 4} -34 h20`} stroke="#6B4A2F" strokeWidth={3} /></g>)}
    <rect x={50} y={-110} width={14} height={92} fill="#C9A35A" />
    <g transform={`rotate(${arm * 6} 57 -100)`}><rect x={-60} y={-104} width={124} height={14} rx={4} fill="#D8B060" /></g>
    <rect x={-66} y={-70} width={10} height={52} fill="#C9A35A" />
  </g>
);
// paper-tape register with clockwork; tapeOff scrolls the tape; burn 0..1 scorches the tape end
export const Register: React.FC<{x: number; y: number; f: number; tapeOff?: number; burn?: number; s?: number; garble?: boolean}> = ({x, y, f, tapeOff = 0, burn = 0, s = 1, garble}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-90} y={-120} width={150} height={120} rx={6} fill="#3A2C22" />
    <circle cx={-15} cy={-60} r={34} fill="#C9A35A" />
    <path d={`M-15 -60 L${-15 + Math.cos(f * 0.2) * 26} ${-60 + Math.sin(f * 0.2) * 26}`} stroke={INK} strokeWidth={5} />
    <rect x={-120} y={-132} width={60} height={30} rx={14} fill="#EFE3C6" />
    {/* tape */}
    <rect x={60} y={-70} width={260} height={22} fill={burn > 0.5 ? '#C8B48A' : '#F2E8D0'} strokeWidth={3} />
    {Array.from({length: 16}, (_, i) => {
      const xx = 70 + ((i * 34 + tapeOff) % 250);
      const dash = garble ? R(`g${i}${Math.floor(f / 6)}`) > 0.5 : (i * 7) % 3 === 0;
      return dash ? <rect key={i} x={xx} y={-62} width={18} height={6} fill={INK} stroke="none" /> : <circle key={i} cx={xx + 4} cy={-59} r={3.5} fill={INK} stroke="none" />;
    })}
    {burn > 0 && <g><path d="M290 -72 q20 -6 30 4 v22 q-14 8 -30 2 Z" fill="#2A1A10" opacity={burn} stroke="none" /><circle cx={318} cy={-60} r={8 * burn} fill="#FF8A3A" stroke="none" filter="url(#glowS)" /></g>}
  </g>
);
// glass battery jars (acid cells) on a shelf; unplug 0..1 lifts the end wire away; glow pulses the acid
export const Jars: React.FC<{x: number; y: number; n?: number; f: number; unplug?: number; glow?: number; s?: number}> = ({x, y, n = 6, f, unplug = 0, glow = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-20} y={0} width={n * 70 + 30} height={20} fill="#5A3D27" />
    {Array.from({length: n}, (_, i) => (
      <g key={i} transform={`translate(${i * 70} 0)`}>
        <path d="M0 0 V-96 Q0 -104 8 -104 H48 Q56 -104 56 -96 V0 Z" fill="#9AC8D0" fillOpacity={0.35} />
        <path d={`M3 -2 V-60 Q28 ${-64 + Math.sin(f * 0.1 + i) * 2} 53 -60 V-2 Z`} fill="#4A8AB0" fillOpacity={0.55 + glow * 0.3} strokeWidth={0} />
        <rect x={12} y={-120} width={8} height={100} fill="#8A8D92" strokeWidth={3} />
        <rect x={36} y={-120} width={8} height={100} fill="#C9783A" strokeWidth={3} />
        <path d="M8 -90 q4 -6 8 0" stroke="#fff" strokeWidth={3} opacity={0.5} fill="none" />
        {i < n - 1 && <path d="M40 -120 Q60 -150 86 -120" stroke="#B87A3A" strokeWidth={5} fill="none" />}
      </g>
    ))}
    <path d={`M${(n - 1) * 70 + 40} -120 Q${(n - 1) * 70 + 90 + unplug * 40} ${-200 - unplug * 60} ${(n - 1) * 70 + 130 + unplug * 60} ${-180 + unplug * 130}`} stroke="#B87A3A" strokeWidth={6} fill="none" />
    {unplug > 0.5 && <circle cx={(n - 1) * 70 + 130 + unplug * 60} cy={-180 + unplug * 130} r={7} fill="#C9A35A" />}
    {glow > 0 && <rect x={-10} y={-110} width={n * 70} height={110} fill="#8FE0FF" opacity={glow * 0.25} filter="url(#glow)" strokeWidth={0} />}
  </g>
);
export const Clock: React.FC<{x: number; y: number; h: number; m: number; s?: number}> = ({x, y, h, m, s = 1}) => {
  const ma = (m / 60) * 360, ha = ((h % 12) / 12) * 360 + m * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeLinejoin="round">
      <circle r={70} fill="#4A3220" strokeWidth={6} />
      <circle r={56} fill="#EFE3C6" strokeWidth={4} />
      {Array.from({length: 12}, (_, i) => <path key={i} d="M0 -50 V-42" transform={`rotate(${i * 30})`} strokeWidth={4} />)}
      <path d="M0 0 V-30" transform={`rotate(${ha})`} strokeWidth={7} strokeLinecap="round" />
      <path d="M0 0 V-46" transform={`rotate(${ma})`} strokeWidth={4} strokeLinecap="round" />
      <circle r={5} fill={INK} />
    </g>
  );
};
export const Coffee: React.FC<{x: number; y: number; steam?: number; f?: number; s?: number}> = ({x, y, steam = 1, f = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {steam > 0 && [0, 1].map((i) => <path key={i} d={`M${10 + i * 14} -40 q${8 * Math.sin(f * 0.1 + i)} -18 0 -36 q${-8 * Math.sin(f * 0.1 + i)} -18 0 -36`} stroke="#E8E0D0" strokeWidth={4} fill="none" opacity={0.45 * steam} />)}
    <g stroke={INK} strokeWidth={4} strokeLinejoin="round"><path d="M-6 -36 H42 L38 0 H-2 Z" fill="#E8E0D0" /><path d="M42 -26 q18 2 14 18 q-4 8 -16 6" fill="none" strokeWidth={5} /><ellipse cx={18} cy={-34} rx={22} ry={4} fill="#3A2214" strokeWidth={2} /></g>
  </g>
);

// ---------------- TELEGRAPH OFFICE (wide world: -400..2900) ----------------
// sky: what the window shows; variant 'dc'/'pitt' re-dresses it as the Washington / Pittsburgh office
export const DESK_Y = 690;
export const OFFICE = {nedX: 800, keyX: 1000, sounderX: 1170, regX: 1330, jarX: 1640, pikeDeskX0: 2120, pikeDeskX1: 2620, pikeX: 2330, plugX: 1960};
export const Office: React.FC<{f: number; sky?: SkyMode; green?: number; variant?: 'boston' | 'dc' | 'pitt'; lamp?: number; skyAmt?: number}> = ({f, sky = 'night', green, variant = 'boston', lamp = 1, skyAmt = 1}) => {
  const fl = flickOf(f);
  const wall = variant === 'dc' ? '#5A5040' : variant === 'pitt' ? '#4A3A34' : '#5E4E3A';
  const wains = variant === 'dc' ? '#2E3A30' : variant === 'pitt' ? '#3A2A24' : '#2E3A2E';
  return (
    <g>
      <defs><clipPath id="officeWin"><path d="M180 560 V220 Q400 60 620 220 V560 Z" /></clipPath></defs>
      <g clipPath="url(#officeWin)">
        <NightSky f={f} mode={sky} x0={100} x1={700} y1={560} green={green} amt={skyAmt} />
        <Roofline y={600} x0={100} x1={700} />
      </g>
      <g filter="url(#paint)">
        <path d={`M-400 -300 H2900 V${FLOOR} H-400 Z M180 560 V220 Q400 60 620 220 V560 Z`} fill={wall} fillRule="evenodd" />
        {Array.from({length: 36}, (_, i) => <path key={i} d={`M${-400 + i * 92} -300 V560`} stroke="#4A3C2C" strokeWidth={3} opacity={0.35} />)}
        <rect x={-400} y={560} width={3300} height={FLOOR - 560} fill={wains} />
        {Array.from({length: 26}, (_, i) => <rect key={i} x={-380 + i * 128} y={590} width={104} height={FLOOR - 620} fill="none" stroke="#1E281E" strokeWidth={5} />)}
        <rect x={-400} y={552} width={3300} height={16} fill="#3A2A1C" stroke={INK} strokeWidth={4} />
        {/* window frame */}
        <path d="M180 560 V220 Q400 60 620 220 V560 Z" fill="none" stroke="#3A2A1C" strokeWidth={22} />
        <path d="M400 110 V560 M180 380 H620" stroke="#3A2A1C" strokeWidth={12} />
        <rect x={160} y={556} width={480} height={22} fill="#4A3220" stroke={INK} strokeWidth={4} />
        {/* ceiling wire run with glass insulators, down to the instruments */}
        <path d="M-400 70 H1500 Q1540 70 1540 110 V560" stroke="#2A2420" strokeWidth={5} fill="none" />
        <path d="M-400 92 H1470 Q1500 92 1500 120 V560" stroke="#2A2420" strokeWidth={5} fill="none" />
        {Array.from({length: 10}, (_, i) => <g key={i}><rect x={-300 + i * 190} y={56} width={18} height={44} rx={7} fill="#8FC8C0" stroke={INK} strokeWidth={3} /></g>)}
        {/* pinned line map */}
        <rect x={980} y={180} width={300} height={220} fill="#E6D6B0" stroke={INK} strokeWidth={5} transform="rotate(-2 1130 290)" />
        <g transform="rotate(-2 1130 290)" stroke="#7E2119" strokeWidth={3} fill="#7E2119">
          <path d="M1020 360 L1080 300 L1150 280 L1230 220" fill="none" /><circle cx={1020} cy={360} r={6} /><circle cx={1150} cy={280} r={8} /><circle cx={1230} cy={220} r={6} />
          <text x={1000} y={214} fontFamily="FellSC" fontSize={26} fill={INK} stroke="none">LINES</text>
        </g>
        {/* notice board + tariff */}
        <rect x={1720} y={170} width={180} height={240} fill="#EFE3C6" stroke={INK} strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M1740 ${215 + i * 30} H${1860 - (i % 2) * 40}`} stroke="#8A7A5E" strokeWidth={5} />)}
        <text x={1810} y={200} textAnchor="middle" fontFamily="FellSC" fontSize={24} fill={INK}>TARIFF</text>
        {/* Pike's corner: high desk, ledgers, door */}
        <rect x={2700} y={180} width={190} height={FLOOR - 180} fill="#3A2A1C" stroke={INK} strokeWidth={6} />
        <rect x={2720} y={210} width={150} height={260} fill="#2A1E14" stroke={INK} strokeWidth={4} />
        <circle cx={2730} cy={560} r={9} fill="#C9A35A" stroke={INK} strokeWidth={3} />
        <rect x={2140} y={200} width={420} height={36} fill="#4A3220" stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={2160 + i * 48} y={130 - (i % 3) * 8} width={40} height={72 + (i % 3) * 8} fill={['#6E2A22', '#2E4A3A', '#5A4632', '#3A3A5A'][i % 4]} stroke={INK} strokeWidth={3} />)}
        {/* plug board (battery switch) */}
        <rect x={OFFICE.plugX - 70} y={330} width={140} height={190} rx={8} fill="#4A3220" stroke={INK} strokeWidth={5} />
        {[0, 1, 2].map((r) => [0, 1].map((c) => <circle key={`${r}${c}`} cx={OFFICE.plugX - 30 + c * 60} cy={380 + r * 50} r={12} fill="#C9A35A" stroke={INK} strokeWidth={3} />))}
        {variant === 'pitt' && <rect x={-400} y={-300} width={3300} height={1300} fill="#3A1A10" opacity={0.18} />}
      </g>
      <Clock x={1500} y={260} h={variant === 'boston' ? 1 : 2} m={(f * 0.02) % 60 + 10} s={0.95} />
      {/* gas lamp bracket */}
      <g transform="translate(900 330)">
        <path d="M0 0 h-60 M-60 0 v-30" stroke={INK} strokeWidth={8} fill="none" />
        <path d="M-20 0 L20 0 L12 -30 L-12 -30 Z" fill="#C9A35A" stroke={INK} strokeWidth={4} />
        <path d="M-26 -30 Q-34 -86 0 -104 Q34 -86 26 -30 Z" fill="#F2E8D0" opacity={0.55} stroke={INK} strokeWidth={4} />
        {lamp > 0 && <Flame x={0} y={-48} f={f} s={0.7 * lamp} />}
      </g>
      {lamp > 0 && <circle cx={900} cy={290} r={620} fill="url(#candle)" opacity={(0.7 + fl * 0.08) * lamp} />}
      {/* window light spill onto floor */}
      {(sky === 'red' || sky === 'aurora') && <path d={`M180 560 L620 560 L900 ${FLOOR + 200} L-200 ${FLOOR + 200} Z`} fill={sky === 'red' ? '#E0403A' : '#4CF0A0'} opacity={0.08 * skyAmt} />}
      {sky === 'dawn' && <path d={`M180 560 L620 560 L900 ${FLOOR + 200} L-200 ${FLOOR + 200} Z`} fill="#FFD9A0" opacity={0.12} />}
      <rect x={-400} y={FLOOR} width={3300} height={400} fill="url(#floor)" />
      <g stroke="#1A120C" strokeWidth={3} opacity={0.6}>{Array.from({length: 24}, (_, i) => <path key={i} d={`M${-400 + i * 150} ${FLOOR} L${-600 + i * 190} 1200`} />)}</g>
    </g>
  );
};
// desk top with all instruments (drawn after the seated actor's chair & body, before DeskFront)
export const Instruments: React.FC<{f: number; press?: number; arm?: number; tapeOff?: number; burn?: number; unplug?: number; glow?: number; garble?: boolean; coffee?: boolean}> = ({f, press = 0, arm = 0, tapeOff = 0, burn = 0, unplug = 0, glow = 0, garble, coffee = true}) => (
  <g>
    <TKey x={OFFICE.keyX} y={DESK_Y} press={press} />
    <Sounder x={OFFICE.sounderX} y={DESK_Y} arm={arm} />
    <Register x={OFFICE.regX} y={DESK_Y} f={f} tapeOff={tapeOff} burn={burn} garble={garble} />
    {coffee && <Coffee x={640} y={DESK_Y} f={f} />}
    <g stroke={INK} strokeWidth={4}><rect x={700} y={DESK_Y - 16} width={150} height={16} fill="#EFE3C6" transform={`rotate(-3 760 ${DESK_Y})`} /><rect x={1470} y={DESK_Y - 70} width={8} height={70} fill="#8A8D92" /><path d="M1474 -70" /></g>
    <path d={`M1540 560 V${DESK_Y - 30} Q1540 ${DESK_Y - 10} 1460 ${DESK_Y - 12} L${OFFICE.regX + 70} ${DESK_Y - 12}`} stroke="#2A2420" strokeWidth={5} fill="none" />
    <Jars x={OFFICE.jarX} y={DESK_Y + 2} n={4} f={f} unplug={unplug} glow={glow} s={0.95} />
  </g>
);
// Pike's high desk (front) for his corner
export const PikeDesk: React.FC<{f: number}> = ({f}) => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <path d={`M${OFFICE.pikeDeskX0} 620 L${OFFICE.pikeDeskX1} 600 L${OFFICE.pikeDeskX1} 640 L${OFFICE.pikeDeskX0} 660 Z`} fill="#6A4A30" />
    <rect x={OFFICE.pikeDeskX0 + 20} y={655} width={OFFICE.pikeDeskX1 - OFFICE.pikeDeskX0 - 40} height={FLOOR - 655} fill="#4A3220" />
    <rect x={OFFICE.pikeDeskX0 + 70} y={598} width={160} height={24} fill="#EFE3C6" strokeWidth={3} transform={`rotate(-3 ${OFFICE.pikeDeskX0 + 150} 610)`} />
    <g transform={`translate(${OFFICE.pikeDeskX1 - 120} 604)`}><Coffee x={0} y={0} f={f} /></g>
  </g>
);

// ---------------- BOSTON STREET (night under the aurora / dawn) ----------------
const HOUSE_X = [-500, -140, 220, 560, 920, 1280, 1640, 2000, 2360, 2720];
export const BostonStreet: React.FC<{f: number; sky?: SkyMode; green?: number; camX?: number; amt?: number; lit?: number}> = ({f, sky = 'aurora', green, camX = 0, amt = 1, lit = 1}) => {
  const fl = flickOf(f);
  const glowC = sky === 'red' ? '#E0403A' : sky === 'aurora' ? '#4CF0A0' : '#FFD9A0';
  return (
    <g>
      <g transform={`translate(${-camX * 0.15} 0)`}><NightSky f={f} mode={sky} x0={-800} x1={3800} y1={760} green={green} amt={amt} /></g>
      <g transform={`translate(${-camX * 0.35} 0)`} filter="url(#paint)"><Roofline y={560} x0={-800} x1={3800} c="#140E16" /></g>
      <g transform={`translate(${-camX} 0)`}>
        <g filter="url(#paint)">
          {HOUSE_X.map((x, i) => {
            const h = 600 + (i % 3) * 40, w = 350;
            const brick = ['#6A3428', '#7A3E2E', '#5E2E24'][i % 3];
            return (
              <g key={i}>
                <rect x={x} y={FLOOR - h} width={w} height={h} fill={brick} stroke={INK} strokeWidth={6} />
                {Array.from({length: Math.floor(h / 26)}, (_, r) => <path key={r} d={`M${x} ${FLOOR - h + r * 26} H${x + w}`} stroke="#3A1E16" strokeWidth={2} opacity={0.35} />)}
                <rect x={x - 10} y={FLOOR - h - 24} width={w + 20} height={28} fill="#2A1A14" stroke={INK} strokeWidth={5} />
                {[0, 1].map((r) => [0, 1, 2].map((c) => {
                  const on = lit > 0 && R(`bw${i}${r}${c}`) > 0.45;
                  return <g key={`${r}${c}`}><rect x={x + 40 + c * 100} y={FLOOR - h + 60 + r * 170} width={66} height={110} fill={on ? '#FFC870' : '#1A1E2A'} opacity={on ? 0.85 * lit : 1} stroke={INK} strokeWidth={5} /><path d={`M${x + 73 + c * 100} ${FLOOR - h + 60 + r * 170} v110 M${x + 40 + c * 100} ${FLOOR - h + 115 + r * 170} h66`} stroke="#3A2A1C" strokeWidth={4} /></g>;
                }))}
                <rect x={x + 130} y={FLOOR - 200} width={90} height={200} fill="#2A1E16" stroke={INK} strokeWidth={5} />
                <path d={`M${x + 120} ${FLOOR - 200} Q${x + 175} ${FLOOR - 250} ${x + 230} ${FLOOR - 200}`} fill="none" stroke="#C9B48A" strokeWidth={6} />
                {[0, 1, 2].map((st) => <rect key={st} x={x + 110 - st * 10} y={FLOOR - 30 + st * 10} width={130 + st * 20} height={12} fill="#7A6A5A" stroke={INK} strokeWidth={3} />)}
              </g>
            );
          })}
          <rect x={-800} y={FLOOR} width={4600} height={300} fill="#24201E" />
          {Array.from({length: 6}, (_, row) => Array.from({length: 60}, (_, i) => {
            const y = FLOOR + 10 + row * row * 5 + row * 14, sw = 30 + row * 12, sh = 10 + row * 5;
            const x = -800 + i * sw + (row % 2) * sw * 0.5;
            const k = 0.7 + R(`bc${row}-${i}`) * 0.3;
            return <rect key={`${row}-${i}`} x={x} y={y} width={sw - 4} height={sh} rx={sh / 2} fill={`rgb(${Math.round(56 * k)},${Math.round(52 * k)},${Math.round(54 * k)})`} stroke="#1A1614" strokeWidth={2} />;
          }))}
        </g>
        {/* the sky's coloured light washes the facades */}
        <rect x={-800} y={0} width={4600} height={FLOOR + 300} fill={glowC} opacity={(sky === 'dawn' ? 0.06 : 0.1) * amt} />
        {[300, 1460, 2560].map((x, i) => (
          <g key={i}>
            <path d={`M${x} ${FLOOR + 40} V${FLOOR - 360}`} stroke={INK} strokeWidth={12} />
            <g transform={`translate(${x} ${FLOOR - 360})`}><Lantern lit={0.85 + fl * 0.1} /></g>
            <circle cx={x} cy={FLOOR - 370} r={200} fill="url(#candle)" opacity={0.8} />
          </g>
        ))}
      </g>
    </g>
  );
};

// ---------------- REDHILL OBSERVATORY (1 Sept 1859, late morning) ----------------
// sun disc as projected on the white screen: flare 0..1 (two beads), fade
export const SunDisc: React.FC<{x: number; y: number; r: number; f: number; flare?: number}> = ({x, y, r, f, flare = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <defs><radialGradient id="limb" cx="0.5" cy="0.5" r="0.5"><stop offset="0.6" stopColor="#FFF4D0" /><stop offset="1" stopColor="#E8C080" /></radialGradient></defs>
    <circle r={r} fill="url(#limb)" stroke="#C8A060" strokeWidth={3} />
    {/* sunspot group */}
    {[[0.18, -0.12, 0.13], [0.32, -0.04, 0.08], [0.05, -0.02, 0.06], [0.24, 0.1, 0.07], [-0.4, 0.3, 0.05]].map(([sx, sy, sr], i) => (
      <g key={i}><ellipse cx={sx * r} cy={sy * r} rx={sr * r * 1.5} ry={sr * r * 1.1} fill="#B89060" opacity={0.7} /><ellipse cx={sx * r} cy={sy * r} rx={sr * r * 0.75} ry={sr * r * 0.6} fill="#3A2A1C" /></g>
    ))}
    {flare > 0 && [[0.12, -0.2], [0.3, 0.06]].map(([fx, fy], i) => (
      <g key={i} opacity={flare}>
        <ellipse cx={fx * r} cy={fy * r} rx={r * 0.12} ry={r * 0.05} fill="#FFFFFF" filter="url(#glow)" />
        <path d={`M${fx * r - r * 0.09} ${fy * r} q${r * 0.05} ${-r * 0.06} ${r * 0.1} ${-r * 0.01} q${r * 0.05} ${r * 0.05} ${r * 0.08} ${r * 0.02}`} stroke="#FFFFFF" strokeWidth={r * 0.045} fill="none" strokeLinecap="round" />
      </g>
    ))}
    <circle r={r} fill="none" stroke="#2B1D14" strokeWidth={2} opacity={0.3} />
    <path d={`M${-r} 0 H${r} M0 ${-r} V${r}`} stroke="#8A7A5E" strokeWidth={1.5} opacity={0.4} />
  </g>
);
export const Observatory: React.FC<{f: number; flare?: number}> = ({f, flare = 0}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1500} fill="#BFD0D8" />
    <g filter="url(#paint)">
      <path d="M-400 -300 H2400 V905 H-400 Z M260 -300 H620 L700 380 L180 380 Z" fill="#6A5038" fillRule="evenodd" />
      {Array.from({length: 34}, (_, i) => <path key={i} d={`M${-400 + i * 84} -300 V905`} stroke="#4E3A28" strokeWidth={4} opacity={0.5} />)}
      <path d="M260 -300 L180 380 H700 L620 -300" fill="none" stroke="#3A2A1C" strokeWidth={18} />
      {/* shelf with chronometer + notebooks */}
      <rect x={1500} y={300} width={500} height={24} fill="#4A3220" stroke={INK} strokeWidth={5} />
      <g transform="translate(1600 300)" stroke={INK} strokeWidth={4}><rect x={-44} y={-60} width={88} height={60} rx={6} fill="#5A3D27" /><circle cx={0} cy={-30} r={22} fill="#EFE3C6" /><path d={`M0 -30 L${Math.cos(f * 0.1) * 16} ${-30 + Math.sin(f * 0.1) * 16}`} strokeWidth={3} /></g>
      {[0, 1, 2, 3].map((i) => <rect key={i} x={1700 + i * 40} y={220 - (i % 2) * 10} width={34} height={80 + (i % 2) * 10} fill={['#2E4A3A', '#6E2A22', '#3A3A5A', '#5A4632'][i]} stroke={INK} strokeWidth={3} />)}
      {/* telescope on its pier: objective up at the roof opening, eyepiece low, projecting to the screen */}
      <rect x={700} y={560} width={110} height={345} fill="#7A7068" stroke={INK} strokeWidth={6} />
      <path d="M755 560 L755 470" stroke={INK} strokeWidth={16} />
      <g transform="translate(755 470) rotate(-58)">
        <rect x={-160} y={-26} width={620} height={52} rx={10} fill="#C9A35A" stroke={INK} strokeWidth={6} />
        <rect x={420} y={-34} width={70} height={68} rx={8} fill="#B08A40" stroke={INK} strokeWidth={6} />
        <rect x={-210} y={-14} width={60} height={28} fill="#8A6A3A" stroke={INK} strokeWidth={5} />
        <path d="M-140 -26 V26 M60 -26 V26 M260 -26 V26" stroke="#8A6A3A" strokeWidth={5} />
      </g>
      {/* screen on its stand */}
      <rect x={1080} y={430} width={12} height={475} fill="#4A3220" stroke={INK} strokeWidth={4} />
      <rect x={950} y={250} width={300} height={260} fill="#F6F2E6" stroke={INK} strokeWidth={6} />
    </g>
    {/* beam from eyepiece to screen */}
    <path d="M660 640 L950 270 L950 490 Z" fill="#FFF6D0" opacity={0.12} />
    <SunDisc x={1100} y={380} r={96} f={f} flare={flare} />
    {/* daylight from the roof */}
    <path d="M260 -300 L620 -300 L1300 905 L-300 905 Z" fill="#FFF6E0" opacity={0.08} />
    <rect x={-400} y={905} width={2800} height={400} fill="url(#floor)" />
  </g>
);

// ---------------- KEW magnetograph ----------------
export const Magnetograph: React.FC<{f: number; jump: number}> = ({f, jump}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1500} fill="#2A2420" />
    <g filter="url(#paint)">
      <rect x={260} y={180} width={1400} height={640} rx={20} fill="#5A3D27" stroke={INK} strokeWidth={8} />
      <rect x={300} y={220} width={1320} height={560} rx={10} fill="#EFE3C6" stroke={INK} strokeWidth={5} />
      {Array.from({length: 14}, (_, i) => <path key={i} d={`M${300 + i * 100} 220 V780`} stroke="#C8B48A" strokeWidth={2} />)}
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M300 ${260 + i * 90} H1620`} stroke="#C8B48A" strokeWidth={2} />)}
    </g>
    {(() => {
      const prog = Math.min(1, f / 150);
      const xEnd = 300 + 1320 * prog;
      let d = 'M300 500';
      for (let x = 300; x <= xEnd; x += 8) {
        const k = (x - 300) / 1320;
        const spike = jump * (k > 0.55 ? Math.exp(-(k - 0.55) * 16) * Math.sin((k - 0.55) * 60) * 220 * (k < 0.57 ? (k - 0.55) / 0.02 : 1) : 0);
        d += ` L${x} ${(500 + Math.sin(x * 0.03) * 6 + Math.sin(x * 0.11) * 3 - spike).toFixed(1)}`;
      }
      return <g><path d={d} stroke="#2A1A3A" strokeWidth={6} fill="none" strokeLinejoin="round" /><circle cx={xEnd} cy={500} r={10} fill="#E5503A" opacity={0.8} filter="url(#glowS)" /></g>;
    })()}
    <text x={340} y={760} fontFamily="FellItalic" fontStyle="italic" fontSize={40} fill="#5A4632">Kew Observatory · magnetic record · 1 Sept 1859 (reconstruction)</text>
    <circle cx={960} cy={500} r={900} fill="url(#candle)" opacity={0.25} />
  </g>
);

// ---------------- SPACE: sun -> cloud -> Earth ----------------
export const Space: React.FC<{f: number; cme?: number; earthX?: number; sunX?: number; shield?: number; miss?: number}> = ({f, cme = 0, earthX = 1650, sunX = 120, shield = 1, miss = 0}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1500} fill="#05060C" />
    <StarField f={f} n={200} h={1200} />
    <g transform={`translate(${sunX} 540)`}>
      <circle r={460} fill="#FF9A3C" opacity={0.18} filter="url(#glow)" />
      <circle r={360} fill="#FFC060" />
      <circle r={330} fill="#FFE29A" />
      {Array.from({length: 18}, (_, i) => <path key={i} d={`M${Math.cos(i * 0.35 - 3) * 340} ${Math.sin(i * 0.35 - 3) * 340} q${20 + 10 * Math.sin(f * 0.1 + i)} ${-30} ${40} 0`} stroke="#FF8A3A" strokeWidth={8} fill="none" opacity={0.6} />)}
    </g>
    {cme > 0 && (() => {
      const r = 300 + cme * (earthX - sunX - 250);
      return (
        <g opacity={Math.min(1, cme * 4) * (1 - Math.max(0, cme - 1) * 3)}>
          <path d={`M${sunX + Math.cos(-0.7) * r} ${540 + Math.sin(-0.7) * r} A${r} ${r} 0 0 1 ${sunX + Math.cos(0.7) * r} ${540 + Math.sin(0.7) * r}`} stroke="#FFB070" strokeWidth={60 + cme * 40} fill="none" opacity={0.35} filter="url(#glow)" />
          <path d={`M${sunX + Math.cos(-0.65) * r} ${540 + Math.sin(-0.65) * r} A${r} ${r} 0 0 1 ${sunX + Math.cos(0.65) * r} ${540 + Math.sin(0.65) * r}`} stroke="#FFE0B0" strokeWidth={10} fill="none" opacity={0.8} />
          {Array.from({length: 30}, (_, i) => { const a = -0.7 + (i / 29) * 1.4, rr = r - 40 - R(`cm${i}`) * 120; return <circle key={i} cx={sunX + Math.cos(a) * rr} cy={540 + Math.sin(a) * rr} r={3 + R(`cs${i}`) * 5} fill="#FFD9A0" opacity={0.7} />; })}
        </g>
      );
    })()}
    <g transform={`translate(${earthX} ${540 + miss * 300})`}>
      {shield > 0 && [1, 2, 3].map((k) => <ellipse key={k} cx={k * 30 * (1 + cme * 0.2)} cy={0} rx={70 + k * 50 - cme * k * 10} ry={60 + k * 45} fill="none" stroke="#7CC8FF" strokeWidth={3} opacity={0.35 * shield} />)}
      <circle r={60} fill="#2E6AA8" stroke="#BFE0FF" strokeWidth={4} />
      <path d="M-30 -40 q30 10 20 40 q-20 10 -30 -10 Z M10 10 q30 -10 40 20 q-20 20 -40 0 Z" fill="#5AA060" />
      <circle r={60} fill="none" stroke="#FFFFFF" strokeWidth={10} opacity={0.15} />
    </g>
  </g>
);

// ---------------- ROCKIES miners' camp ----------------
export const MinersCamp: React.FC<{f: number; fire?: number}> = ({f, fire = 1}) => (
  <g>
    <NightSky f={f} mode="aurora" x0={-600} x1={2600} y1={760} green={0.9} />
    <g filter="url(#paint)">
      <path d="M-600 600 L-200 300 L100 520 L500 200 L900 560 L1300 260 L1700 540 L2100 320 L2600 620 V1200 H-600 Z" fill="#1A2030" />
      <path d="M500 200 L560 260 L520 270 L470 240 Z M1300 260 L1360 320 L1320 330 L1260 300 Z" fill="#C8D4E0" opacity={0.6} />
      <path d="M-600 760 Q400 680 1200 760 T2600 740 V1200 H-600 Z" fill="#141814" />
      {Array.from({length: 18}, (_, i) => { const x = -500 + i * 170 + R(`pn${i}`) * 60, h = 160 + R(`ph${i}`) * 120, y = 760 + R(`py${i}`) * 30; return <path key={i} d={`M${x} ${y} L${x + 40} ${y - h} L${x + 80} ${y} Z`} fill="#0E140E" />; })}
      <rect x={-600} y={FLOOR} width={3200} height={300} fill="#2A2418" />
      {/* tents */}
      {[[300, 0.9], [1500, 1]].map(([x, s], i) => <g key={i} transform={`translate(${x} ${FLOOR}) scale(${s})`}><path d="M-170 0 L0 -260 L170 0 Z" fill="#C8B890" stroke={INK} strokeWidth={6} strokeLinejoin="round" /><path d="M0 -260 L-40 0 L40 0 Z" fill="#2A2418" stroke={INK} strokeWidth={4} /></g>)}
      {/* sluice + pans */}
      <path d="M1750 860 L2300 760 L2300 790 L1750 890 Z" fill="#6A4A30" stroke={INK} strokeWidth={5} />
      <rect x={2000} y={870} width={20} height={40} fill="#6A4A30" stroke={INK} strokeWidth={4} />
    </g>
    {/* campfire */}
    <g transform={`translate(960 ${FLOOR - 10})`}>
      <path d="M-60 10 L60 -10 M-60 -10 L60 10" stroke="#4A3220" strokeWidth={16} strokeLinecap="round" />
      {fire > 0 && <g><Flame x={0} y={-10} f={f} s={1.6 * fire} /><Flame x={-22} y={-4} f={f + 7} s={1.1 * fire} /><Flame x={22} y={-4} f={f + 13} s={1.2 * fire} /></g>}
      <circle cx={0} cy={-40} r={360} fill="url(#ovenGlow)" opacity={0.6 * fire} />
    </g>
    <rect x={-600} y={0} width={3200} height={1200} fill="#4CF0A0" opacity={0.05} />
  </g>
);
export const Pan: React.FC<{sizzle?: number; f?: number; egg?: boolean}> = ({sizzle = 0, f = 0, egg = true}) => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={0} y={-6} width={90} height={12} rx={5} fill="#2A2420" />
    <ellipse cx={150} cy={0} rx={64} ry={20} fill="#3A3430" />
    {egg && <g><ellipse cx={150} cy={-4} rx={34} ry={10} fill="#F6F2E6" strokeWidth={3} /><ellipse cx={154} cy={-6} rx={12} ry={6} fill="#F2B83A" strokeWidth={2} /></g>}
    {sizzle > 0 && [0, 1, 2].map((i) => <path key={i} d={`M${120 + i * 30} -24 q${6 * Math.sin(f * 0.6 + i)} -12 0 -24`} stroke="#E8E0D0" strokeWidth={3} fill="none" opacity={0.6 * sizzle} />)}
  </g>
);

// ---------------- South Carolina wall / Virginia larks ----------------
export const BrickWall: React.FC<{f: number; built: number}> = ({f, built}) => (
  <g>
    <NightSky f={f} mode="aurora" x0={-600} x1={2600} y1={760} green={0.6} />
    <g filter="url(#paint)">
      <path d="M-600 760 Q600 700 2600 760 V1200 H-600 Z" fill="#1A1E16" />
      <rect x={-600} y={FLOOR} width={3200} height={300} fill="#3A3024" />
      {Array.from({length: 9}, (_, r) => Array.from({length: 12}, (_, c) => {
        const idx = r * 12 + c;
        if (idx > built) return null;
        return <rect key={`${r}-${c}`} x={420 + c * 90 + (r % 2) * 45} y={FLOOR - 40 - r * 40} width={86} height={36} fill={['#9A4A34', '#8A3E2E', '#A85A40'][(r + c) % 3]} stroke="#3A1E16" strokeWidth={3} />;
      }))}
      <rect x={300} y={FLOOR - 420} width={20} height={420} fill="#7A5A3A" stroke={INK} strokeWidth={4} />
      <rect x={1570} y={FLOOR - 420} width={20} height={420} fill="#7A5A3A" stroke={INK} strokeWidth={4} />
      <rect x={280} y={FLOOR - 430} width={1330} height={22} fill="#8A6A48" stroke={INK} strokeWidth={4} />
    </g>
    <rect x={-600} y={0} width={3200} height={1200} fill="#4CF0A0" opacity={0.05} />
  </g>
);
export const Lark: React.FC<{x: number; y: number; f: number; sing?: number; s?: number; flip?: boolean}> = ({x, y, f, sing = 0, s = 1, flip}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <ellipse cx={0} cy={0} rx={40} ry={28} fill="#A8865A" />
    <circle cx={34} cy={-20} r={20} fill="#B8966A" />
    <path d={`M50 -22 L${72 + sing * 4} ${-24 - sing * 8} L52 -16 Z`} fill="#E2B23A" />
    {sing > 0.3 && <path d="M52 -16 L72 -10 L52 -12 Z" fill="#E2B23A" />}
    <circle cx={40} cy={-24} r={4} fill={INK} />
    <path d="M-36 0 L-70 -10 L-60 10 Z" fill="#8A6A44" />
    <path d={`M-10 -6 Q10 ${-30 - Math.sin(f * 0.5) * 6} 20 -4`} fill="#8A6A44" />
    <path d="M-6 26 v20 M10 26 v20" strokeWidth={3} />
    {sing > 0 && [0, 1, 2].map((i) => { const ph = ((f * 0.04 + i * 0.33) % 1); return <text key={i} x={70 + ph * 80} y={-40 - ph * 90 + i * 6} fontFamily="FrauncesBlack" fontSize={44} fill="#F3E7CF" stroke="none" opacity={(1 - ph) * sing}>♪</text>; })}
  </g>
);

// ---------------- MAPS ----------------
export const MapAmericas: React.FC<{f: number; oval?: number; pins?: number}> = ({f, oval = 1, pins = 0}) => {
  const P = (lo: number, la: number) => proj(AM, lo, la);
  const places: [string, number, number][] = [['Boston', -71, 42.4], ['Rockies', -105.5, 39.7], ['Cuba', -79.5, 21.9], ['Jamaica', -77.3, 18.1], ['Hawaii', -157, 20.8], ['Colombia', -74, 4.6]];
  return (
    <g>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#1E2A38" />
      <path d={AM_PATH} fill="#D9C79E" stroke={INK} strokeWidth={3} filter="url(#paint)" />
      {/* aurora oval pushed south (schematic) */}
      {oval > 0 && <g opacity={oval}>
        <path d={`M-100 ${P(0, 52)[1]} Q960 ${P(0, 28 - 6 * Math.sin(f * 0.03))[1]} 2100 ${P(0, 50)[1]}`} stroke="#4CF0A0" strokeWidth={150} fill="none" opacity={0.28} filter="url(#glow)" />
        <path d={`M-100 ${P(0, 60)[1]} Q960 ${P(0, 40)[1]} 2100 ${P(0, 58)[1]}`} stroke="#E0303A" strokeWidth={120} fill="none" opacity={0.25} filter="url(#glow)" />
      </g>}
      {places.map(([n, lo, la], i) => {
        const t = pins - i * 16;
        if (t <= 0) return null;
        const [x, y] = P(lo, la);
        const a = Math.min(1, t / 8);
        return <g key={n} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * a})`} opacity={a}><circle r={14} fill="#E5503A" stroke={INK} strokeWidth={4} /><text x={22} y={10} fontFamily="FellSC" fontSize={46} fill="#F3E7CF" stroke={INK} strokeWidth={6} paintOrder="stroke">{n}</text></g>;
      })}
      <rect x={-200} y={-200} width={2400} height={1500} fill="url(#vig)" opacity={0.6} />
    </g>
  );
};
export const CITIES: Record<string, [number, number]> = {Boston: proj(NE, -71.06, 42.36), Portland: proj(NE, -70.26, 43.66), 'New York': proj(NE, -74.0, 40.71), Washington: proj(NE, -77.04, 38.9), Pittsburgh: proj(NE, -80.0, 40.44), Albany: proj(NE, -73.75, 42.65), Philadelphia: proj(NE, -75.16, 39.95)};
export const LINES: [string, string][] = [['Boston', 'Portland'], ['Boston', 'New York'], ['New York', 'Philadelphia'], ['Philadelphia', 'Washington'], ['Philadelphia', 'Pittsburgh'], ['New York', 'Albany'], ['Albany', 'Boston']];
export const MapNE: React.FC<{f: number; dead?: number; hl?: [string, string]; labels?: number; sparkle?: number}> = ({f, dead = 0, hl, labels = 1, sparkle = 0}) => (
  <g>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#22344A" />
    <g filter="url(#paint)"><path d={NE_PATH} fill="#D9C79E" stroke={INK} strokeWidth={4} /></g>
    {LINES.map(([a, b], i) => {
      const [x1, y1] = CITIES[a], [x2, y2] = CITIES[b];
      const isH = hl && ((hl[0] === a && hl[1] === b) || (hl[0] === b && hl[1] === a));
      const d = Math.min(1, Math.max(0, dead * 7 - i));
      const live = isH ? 1 : 1 - d;
      return (
        <g key={i}>
          <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
          <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={isH ? '#4CF0A0' : '#E2B23A'} strokeWidth={6} strokeDasharray={live > 0.5 ? undefined : '6 18'} opacity={0.35 + 0.65 * live} strokeLinecap="round" />
          {sparkle > 0 && live < 0.5 && R(`sp${i}${Math.floor(f / 3)}`) > 0.6 && <circle cx={x1 + (x2 - x1) * R(`sx${i}${Math.floor(f / 3)}`)} cy={y1 + (y2 - y1) * R(`sx${i}${Math.floor(f / 3)}`)} r={14} fill="#CFEFFF" filter="url(#glowS)" />}
        </g>
      );
    })}
    {Object.entries(CITIES).map(([n, [x, y]]) => (
      <g key={n}>
        <circle cx={x} cy={y} r={14} fill={n === 'Boston' ? '#E5503A' : '#F3E7CF'} stroke={INK} strokeWidth={4} />
        {labels > 0 && <text x={x + (n === 'Portland' || n === 'Boston' ? 24 : -24)} y={y + 12} textAnchor={n === 'Portland' || n === 'Boston' ? 'start' : 'end'} fontFamily="FellSC" fontSize={44} fill="#2B1D14" stroke="#EFE3C6" strokeWidth={8} paintOrder="stroke" opacity={labels}>{n}</text>}
      </g>
    ))}
    <rect x={-200} y={-200} width={2400} height={1500} fill="url(#vig)" opacity={0.5} />
  </g>
);

// ---------------- MODERN GRID (night city, pylons, satellites) ----------------
export const ModernCity: React.FC<{f: number; out?: number; snow?: boolean; sats?: number}> = ({f, out = 0, snow, sats = 1}) => (
  <g>
    <NightSky f={f} mode="night" x0={-600} x1={2600} y1={800} />
    {sats > 0 && [0, 1, 2].map((i) => { const x = ((f * (1.4 + i * 0.5) + i * 700) % 2600) - 300, y = 120 + i * 90; return <g key={i} transform={`translate(${x} ${y})`} opacity={sats}><rect x={-10} y={-8} width={20} height={16} fill="#C8C8C8" stroke={INK} strokeWidth={2} /><rect x={-50} y={-5} width={34} height={10} fill="#3A5A8A" stroke={INK} strokeWidth={2} /><rect x={16} y={-5} width={34} height={10} fill="#3A5A8A" stroke={INK} strokeWidth={2} /></g>; })}
    <g filter="url(#paint)">
      {Array.from({length: 24}, (_, i) => {
        const x = -500 + i * 130, h = 220 + R(`mh${i}`) * 420, w = 120;
        return (
          <g key={i}>
            <rect x={x} y={FLOOR - 120 - h} width={w} height={h + 200} fill="#141A26" stroke="#0A0E16" strokeWidth={4} />
            {Array.from({length: Math.floor(h / 40)}, (_, r) => [0, 1, 2].map((c) => {
              const id = i * 100 + r * 3 + c;
              const lit = R(`mw${id}`) > 0.35 && R(`mo${id}`) > out;
              return lit ? <rect key={`${r}${c}`} x={x + 14 + c * 36} y={FLOOR - 100 - h + r * 40} width={20} height={22} fill="#FFD27A" opacity={0.85} /> : null;
            }))}
          </g>
        );
      })}
      <rect x={-600} y={FLOOR - 40} width={3200} height={400} fill="#0E1018" />
    </g>
    {/* pylons */}
    {[200, 900, 1600, 2300].map((x, i) => (
      <g key={i} stroke="#4A5260" strokeWidth={6} fill="none">
        <path d={`M${x - 60} ${FLOOR + 80} L${x} ${FLOOR - 420} L${x + 60} ${FLOOR + 80} M${x - 90} ${FLOOR - 340} H${x + 90} M${x - 70} ${FLOOR - 260} H${x + 70} M${x - 40} ${FLOOR - 40} L${x + 30} ${FLOOR - 200} M${x + 40} ${FLOOR - 40} L${x - 30} ${FLOOR - 200}`} />
      </g>
    ))}
    {[-340, -260].map((dy, k) => <path key={k} d={`M-600 ${FLOOR + dy + 20} Q-200 ${FLOOR + dy + 80} 200 ${FLOOR + dy} Q550 ${FLOOR + dy + 70} 900 ${FLOOR + dy} Q1250 ${FLOOR + dy + 70} 1600 ${FLOOR + dy} Q1950 ${FLOOR + dy + 70} 2300 ${FLOOR + dy} Q2500 ${FLOOR + dy + 40} 2700 ${FLOOR + dy + 20}`} stroke="#6A7280" strokeWidth={3} fill="none" opacity={1 - out * 0.5} />)}
    {snow && Array.from({length: 80}, (_, i) => { const x = R(`sn${i}`) * 2400 - 200, y = ((R(`sy${i}`) * 1200 + f * (2 + R(`ss${i}`) * 2)) % 1200) - 100; return <circle key={i} cx={x + Math.sin(f * 0.05 + i) * 20} cy={y} r={3 + R(`sr${i}`) * 3} fill="#F4F4F4" opacity={0.8} />; })}
    <rect x={-600} y={0} width={3200} height={1200} fill="#000" opacity={out * 0.35} />
  </g>
);

// Loomis' letters pile (on top of Study)
export const Letters: React.FC<{n: number; f: number}> = ({n, f}) => (
  <g>
    {Array.from({length: n}, (_, i) => <g key={i} transform={`translate(${760 + (i % 5) * 70 + R(`lx${i}`) * 30} ${620 - Math.floor(i / 5) * 14}) rotate(${(R(`lr${i}`) - 0.5) * 30})`}><rect x={-60} y={-40} width={120} height={80} fill="#EFE3C6" stroke={INK} strokeWidth={3} /><path d="M-60 -40 L0 6 L60 -40" stroke={INK} strokeWidth={3} fill="none" /><rect x={30} y={-34} width={20} height={20} fill="#B3362B" /></g>)}
    {void f}
  </g>
);
export {Smoke};
