import React from 'react';
import { P } from './art';
import { rng, clamp, lerp } from './lib';
import { MChar, extra } from './chars';
import { Txt } from './graphics';

/* ===== 1900s sets — "sepia ink & chalk" look ===== */
export const C = {
  paper: '#efe3c8', sand: '#d9c39a', sandD: '#b89c6e', wall: '#d8c8a4', wood: '#7a5434', woodD: '#55361f', woodL: '#9a6e46',
  blue: '#5b7a8c', blueD: '#3a4e5c', green: '#3f5e4a', greenD: '#2a3e32', wine: '#7a3b34', brass: '#c49a44', night: '#1e2733', nightL: '#34445a',
  slate: '#2e3c35', chalk: '#f1eee2', amber: '#ffb347', cream: '#f6efdc',
};
const ol = (w = 7) => ({ stroke: P.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const W = 2400; // over-wide so camera moves never show edges

/* sky */
export const Sky: React.FC<{ tone?: 'day' | 'dusk' | 'night' | 'eclipse'; dark?: number }> = ({ tone = 'day', dark = 0 }) => {
  const g = { day: ['#a9c6cf', '#efe1bf'], dusk: ['#5d6a8a', '#f0b27a'], night: ['#121a26', '#2c3a52'], eclipse: ['#a9c6cf', '#efe1bf'] }[tone];
  return <g><defs><linearGradient id={`sk${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={g[0]} /><stop offset="1" stopColor={g[1]} /></linearGradient></defs>
    <rect x={-240} y={-200} width={W} height={1300} fill={`url(#sk${tone})`} />
    {dark > 0 && <rect x={-240} y={-200} width={W} height={1300} fill="#0a0f1a" opacity={dark * .88} />}
    {tone === 'night' && Array.from({ length: 70 }).map((_, i) => { const R = rng(i + 3); return <circle key={i} cx={R() * 1920} cy={R() * 520} r={1 + R() * 2.2} fill="#f6efdc" opacity={.4 + R() * .5} />; })}
  </g>;
};

/* Bern's Zytglogge clock tower — the clock hands actually run */
export const ClockTower: React.FC<{ x: number; y: number; s?: number; T: number; tone?: string }> = ({ x, y, s = 1, T, tone = '#c9a86a' }) => {
  const m = T * 6, h = T * .5 + 140;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 0 L -110 -420 L 110 -420 L 110 0 Z" fill={tone} {...ol()} />
    <path d="M -130 -420 L 0 -600 L 130 -420 Z" fill="#7a3b34" {...ol()} />
    <path d="M -30 -600 L 0 -680 L 30 -600 Z" fill="#7a3b34" {...ol(6)} />
    <rect x={-70} y={-560} width={140} height={60} fill="#7a3b34" {...ol(5)} />
    <circle cx={0} cy={-300} r={74} fill="#2a3e5a" {...ol()} /><circle cx={0} cy={-300} r={58} fill="none" stroke={C.brass} strokeWidth={6} />
    {Array.from({ length: 12 }).map((_, k) => { const a = k * Math.PI / 6; return <circle key={k} cx={Math.sin(a) * 50} cy={-300 - Math.cos(a) * 50} r={5} fill={C.brass} />; })}
    <line x1={0} y1={-300} x2={Math.sin(h * Math.PI / 180) * 32} y2={-300 - Math.cos(h * Math.PI / 180) * 32} stroke={C.brass} strokeWidth={9} strokeLinecap="round" />
    <line x1={0} y1={-300} x2={Math.sin(m * Math.PI / 180) * 48} y2={-300 - Math.cos(m * Math.PI / 180) * 48} stroke={C.brass} strokeWidth={6} strokeLinecap="round" />
    <path d="M -60 0 L -60 -130 Q 0 -190 60 -130 L 60 0 Z" fill="#3a2a1e" {...ol(6)} />
    {[-1, 1].map((q) => <rect key={q} x={q * 80 - 14} y={-470} width={28} height={36} fill="#2a2420" {...ol(4)} />)}
  </g>;
};

const Arcade: React.FC<{ x0: number; n: number; y: number; tone: string; dark?: boolean }> = ({ x0, n, y, tone, dark }) => <g>
  <rect x={x0} y={y - 560} width={n * 230 + 30} height={560} fill={tone} {...ol()} />
  {Array.from({ length: n }).map((_, i) => <g key={i}>
    <path d={`M ${x0 + 30 + i * 230} ${y} L ${x0 + 30 + i * 230} ${y - 170} Q ${x0 + 130 + i * 230} ${y - 280} ${x0 + 230 + i * 230} ${y - 170} L ${x0 + 230 + i * 230} ${y} Z`} fill={dark ? '#2a2420' : '#5a4632'} {...ol(6)} />
    {[0, 1].map((r) => <g key={r}><rect x={x0 + 60 + i * 230} y={y - 500 + r * 150} width={56} height={92} fill={dark ? (i + r) % 3 ? '#ffcf7a' : '#3a4a5a' : '#8fb0bc'} {...ol(5)} /><rect x={x0 + 144 + i * 230} y={y - 500 + r * 150} width={56} height={92} fill={dark ? (i * r) % 2 ? '#3a4a5a' : '#ffcf7a' : '#8fb0bc'} {...ol(5)} /></g>)}
  </g>)}
  <path d={`M ${x0 - 10} ${y - 560} L ${x0 + n * 230 + 40} ${y - 560} L ${x0 + n * 230 + 20} ${y - 620} L ${x0 + 10} ${y - 620} Z`} fill="#8a4a3a" {...ol(6)} />
</g>;

export const BernStreet: React.FC<{ T: number; tone?: 'day' | 'dusk' | 'night'; px?: number; crowd?: number; tower?: boolean }> = ({ T, tone = 'day', px = 0, crowd = 4, tower = true }) => {
  const night = tone === 'night';
  return <g>
    <Sky tone={tone} />
    {tower && <g transform={`translate(${px * .3} 0)`}><ClockTower x={960} y={760} s={.95} T={T} tone={night ? '#7a6a52' : '#c9a86a'} /></g>}
    <g transform={`translate(${px} 0)`}>
      <Arcade x0={-220} n={4} y={900} tone={night ? '#6a5a44' : C.sand} dark={night} />
      <Arcade x0={1240} n={4} y={900} tone={night ? '#5e5040' : '#cdb48a'} dark={night} />
    </g>
    <rect x={-240} y={880} width={W} height={300} fill={night ? '#3a3430' : '#a89070'} />
    {Array.from({ length: 60 }).map((_, i) => { const R = rng(i + 11); return <ellipse key={i} cx={R() * 2200 - 140 + px} cy={900 + R() * 170} rx={18 + R() * 16} ry={6} fill="rgba(0,0,0,.12)" />; })}
    {Array.from({ length: crowd }).map((_, i) => { const dir = i % 2 ? 1 : -1; const xx = ((i * 520 + dir * T * 70) % 2400 + 2400) % 2400 - 240; return <MChar key={i} look={extra(i + 2)} x={xx} y={940 - (i % 2) * 22} s={.8} flip={dir < 0} pose={{ walk: 1, phase: T * 6 + i, expr: 'neutral' }} />; })}
    {night && <rect x={-240} y={-200} width={W} height={1300} fill="#0a1220" opacity={.35} />}
  </g>;
};

/* interior shell: wallpaper + floor + skirting */
const Room: React.FC<{ wall: string; stripe: string; floor: string; night?: boolean; children?: React.ReactNode }> = ({ wall, stripe, floor, night, children }) => <g>
  <rect x={-240} y={-200} width={W} height={1150} fill={wall} />
  {Array.from({ length: 34 }).map((_, i) => <rect key={i} x={-240 + i * 72} y={-200} width={18} height={1150} fill={stripe} opacity={.5} />)}
  {children}
  <rect x={-240} y={900} width={W} height={300} fill={floor} />
  {Array.from({ length: 22 }).map((_, i) => <line key={i} x1={-240 + i * 120} y1={900} x2={-240 + i * 120 + (i - 11) * 40} y2={1180} stroke="rgba(0,0,0,.15)" strokeWidth={4} />)}
  <rect x={-240} y={872} width={W} height={30} fill={C.woodD} {...ol(5)} />
  {night && <rect x={-240} y={-200} width={W} height={1400} fill="url(#lampWash)" />}
</g>;
export const Window: React.FC<{ x: number; y: number; w?: number; h?: number; tone?: 'day' | 'night' | 'dusk'; T?: number }> = ({ x, y, w = 260, h = 340, tone = 'day', T = 0 }) => <g>
  <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} fill={C.woodD} {...ol()} />
  <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`}><rect width={w} height={h} fill={tone === 'night' ? '#1c2636' : tone === 'dusk' ? '#e8a46a' : '#b8d0d4'} />
    {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M ${i * 60 - 20} ${h} L ${i * 60 - 20} ${h * .55 + (i % 3) * 20} L ${i * 60 + 10} ${h * .45 + (i % 3) * 20} L ${i * 60 + 40} ${h * .55 + (i % 3) * 20} L ${i * 60 + 40} ${h} Z`} fill={tone === 'night' ? '#2a3448' : '#a8603a'} stroke={P.ink} strokeWidth={3} />)}
    {tone === 'night' && <circle cx={w * .75} cy={h * .22} r={22} fill="#f6efdc" />}
  </svg>
  <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={C.woodD} strokeWidth={12} /><line x1={x} y1={y + h * .45} x2={x + w} y2={y + h * .45} stroke={C.woodD} strokeWidth={12} />
</g>;
export const Shelf: React.FC<{ x: number; y: number; n?: number; seed?: number }> = ({ x, y, n = 3, seed = 1 }) => <g>
  <rect x={x} y={y} width={300} height={n * 120 + 20} fill={C.woodD} {...ol()} />
  {Array.from({ length: n }).map((_, r) => <g key={r}>{Array.from({ length: 9 }).map((_, k) => { const R = rng(seed * 50 + r * 9 + k); const hh = 70 + R() * 30; return <rect key={k} x={x + 14 + k * 30} y={y + 10 + r * 120 + (100 - hh)} width={26} height={hh} fill={['#7a3b34', '#3f5e4a', '#c49a44', '#5b7a8c', '#efe3c8'][Math.floor(R() * 5)]} stroke={P.ink} strokeWidth={3} />; })}
    <rect x={x} y={y + 110 + r * 120} width={300} height={12} fill={C.wood} stroke={P.ink} strokeWidth={4} /></g>)}
</g>;
export const Table: React.FC<{ x: number; y: number; w?: number; cloth?: string; children?: React.ReactNode }> = ({ x, y, w = 420, cloth, children }) => <g>
  {[-1, 1].map((q) => <rect key={q} x={x + q * (w / 2 - 30) - 10} y={y} width={20} height={900 - y + 40} fill={C.woodD} {...ol(5)} />)}
  <rect x={x - w / 2} y={y - 22} width={w} height={26} rx={6} fill={cloth || C.wood} {...ol()} />
  {cloth && <path d={`M ${x - w / 2} ${y} L ${x - w / 2 + 10} ${y + 70} L ${x + w / 2 - 10} ${y + 70} L ${x + w / 2} ${y} Z`} fill={cloth} {...ol(5)} />}
  {children}
</g>;
export const Lamp: React.FC<{ x: number; y: number; on?: boolean }> = ({ x, y, on = true }) => <g>
  {on && <circle cx={x} cy={y - 60} r={220} fill="url(#fireGlow)" opacity={.55} />}
  <rect x={x - 8} y={y - 60} width={16} height={60} fill={C.brass} {...ol(4)} /><ellipse cx={x} cy={y} rx={30} ry={8} fill={C.brass} {...ol(4)} />
  <path d={`M ${x - 46} ${y - 56} L ${x + 46} ${y - 56} L ${x + 26} ${y - 110} L ${x - 26} ${y - 110} Z`} fill={on ? '#f2c870' : '#a8905a'} {...ol(5)} />
</g>;
export const WallClock: React.FC<{ x: number; y: number; T: number; r?: number }> = ({ x, y, T, r = 54 }) => <g>
  <circle cx={x} cy={y} r={r + 10} fill={C.wood} {...ol()} /><circle cx={x} cy={y} r={r} fill={C.cream} {...ol(4)} />
  {Array.from({ length: 12 }).map((_, k) => <line key={k} x1={x + Math.sin(k * Math.PI / 6) * (r - 12)} y1={y - Math.cos(k * Math.PI / 6) * (r - 12)} x2={x + Math.sin(k * Math.PI / 6) * (r - 4)} y2={y - Math.cos(k * Math.PI / 6) * (r - 4)} stroke={P.ink} strokeWidth={3} />)}
  <line x1={x} y1={y} x2={x + Math.sin(T * .1) * r * .5} y2={y - Math.cos(T * .1) * r * .5} stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
  <line x1={x} y1={y} x2={x + Math.sin(Math.floor(T) * Math.PI / 30) * r * .8} y2={y - Math.cos(Math.floor(T) * Math.PI / 30) * r * .8} stroke="#a83a2a" strokeWidth={3} />
</g>;
export const Papers: React.FC<{ x: number; y: number; n?: number; seed?: number }> = ({ x, y, n = 5, seed = 1 }) => <g>{Array.from({ length: n }).map((_, k) => { const R = rng(seed + k); return <rect key={k} x={x - 40 + R() * 20} y={y - 6 - k * 6} width={84} height={10} fill={C.cream} stroke={P.ink} strokeWidth={3} transform={`rotate(${(R() - .5) * 8} ${x} ${y})`} />; })}</g>;

export const Apartment: React.FC<{ T: number; night?: boolean }> = ({ T, night }) => <Room wall={night ? '#a89878' : '#d8c8a0'} stripe={night ? '#8a7a5e' : '#c8b48a'} floor={C.woodL} night={night}>
  <Window x={760} y={250} tone={night ? 'night' : 'day'} T={T} />
  <Shelf x={1360} y={420} n={3} seed={3} />
  <Shelf x={-80} y={420} n={3} seed={7} />
  <rect x={300} y={330} width={180} height={130} fill={C.cream} {...ol(5)} /><path d="M 320 440 L 380 370 L 420 410 L 460 360 L 460 440 Z" fill="#8aa06a" />
  <path d="M 1150 300 L 1150 900" stroke={C.woodD} strokeWidth={0} />
</Room>;
export const PatentOffice: React.FC<{ T: number }> = ({ T }) => <Room wall="#c8c0a4" stripe="#b8b094" floor="#8a6a4a">
  <Window x={140} y={200} w={300} h={420} T={T} />
  <Window x={1480} y={200} w={300} h={420} T={T} />
  <rect x={780} y={150} width={360} height={500} fill="none" />
  <WallClock x={960} y={190} T={T} />
  {[600, 1320].map((x, k) => <g key={k}><rect x={x - 90} y={420} width={180} height={460} fill={C.woodD} {...ol()} />{[0, 1, 2, 3].map((r) => <g key={r}><rect x={x - 76} y={436 + r * 108} width={152} height={94} fill={C.wood} {...ol(4)} /><rect x={x - 16} y={476 + r * 108} width={32} height={10} fill={C.brass} /></g>)}</g>)}
</Room>;
export const Desk: React.FC<{ x: number; y?: number; papers?: boolean }> = ({ x, y = 760, papers = true }) => <g>
  <rect x={x - 200} y={y} width={400} height={30} fill={C.wood} {...ol()} />
  <rect x={x - 190} y={y + 30} width={120} height={110} fill={C.woodD} {...ol(5)} /><rect x={x + 70} y={y + 30} width={120} height={110} fill={C.woodD} {...ol(5)} />
  {papers && <><Papers x={x - 90} y={y} n={6} seed={x} /><Papers x={x + 110} y={y} n={4} seed={x + 9} /></>}
  <rect x={x - 10} y={y - 46} width={18} height={46} fill="#2a2420" {...ol(3)} />
</g>;
export const Cafe: React.FC<{ T: number }> = ({ T }) => <Room wall="#5a3a2a" stripe="#4a2e22" floor="#3a2a20" night>
  <rect x={-240} y={500} width={W} height={380} fill="#6a4630" />
  {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-220 + i * 170} y={520} width={140} height={330} rx={6} fill="none" stroke={C.woodD} strokeWidth={6} />)}
  {[200, 760, 1320].map((x, k) => <g key={k}><rect x={x} y={150} width={400} height={290} fill="#7a8a90" opacity={.55} {...ol(6)} /><rect x={x} y={150} width={400} height={290} fill="none" stroke={C.brass} strokeWidth={10} /></g>)}
  {[480, 1440].map((x, k) => <g key={k}><line x1={x} y1={-200} x2={x} y2={90} stroke={P.ink} strokeWidth={4} /><path d={`M ${x - 60} 140 Q ${x} 60 ${x + 60} 140 Z`} fill="#c8a040" {...ol(5)} /><circle cx={x} cy={150} r={140} fill="url(#fireGlow)" opacity={.6 + Math.sin(T * 3 + k) * .05} /></g>)}
</Room>;
export const CafeTable: React.FC<{ x: number; y?: number }> = ({ x, y = 790 }) => <g>
  <rect x={x - 10} y={y} width={20} height={140} fill="#2a2420" {...ol(4)} /><ellipse cx={x} cy={940} rx={60} ry={12} fill="#2a2420" {...ol(4)} />
  <ellipse cx={x} cy={y} rx={150} ry={26} fill="#e8e2d6" {...ol(6)} />
  <g transform={`translate(${x - 40} ${y - 4})`}><path d="M -16 -26 L 16 -26 L 12 0 L -12 0 Z" fill="#f4f0e6" {...ol(4)} /></g>
  <g transform={`translate(${x + 50} ${y - 4})`}><path d="M -10 -34 L 10 -34 L 8 0 L -8 0 Z" fill="rgba(200,140,60,.8)" stroke={P.ink} strokeWidth={4} /></g>
</g>;
export const Blackboard: React.FC<{ x: number; y: number; w?: number; h?: number; children?: React.ReactNode }> = ({ x, y, w = 640, h = 380, children }) => <g>
  <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} fill={C.wood} {...ol()} />
  <rect x={x} y={y} width={w} height={h} fill={C.slate} {...ol(4)} />
  {Array.from({ length: 14 }).map((_, i) => { const R = rng(i + x); return <ellipse key={i} cx={x + R() * w} cy={y + R() * h} rx={60 + R() * 80} ry={14} fill="#fff" opacity={.04} />; })}
  <g fontFamily="Hand">{children}</g>
  <rect x={x + 20} y={y + h + 4} width={w - 40} height={14} fill={C.woodD} />
</g>;
export const Chalk: React.FC<{ x: number; y: number; s?: number; a?: 'start' | 'middle'; o?: number; children: React.ReactNode }> = ({ x, y, s = 40, a = 'start', o = 1, children }) => <text x={x} y={y} fontFamily="Type" fontSize={s} fill={C.chalk} opacity={o * .9} textAnchor={a}>{children}</text>;
export const Study: React.FC<{ T: number; night?: boolean; eq?: string[] }> = ({ T, night = true, eq = ['Rμν − ½gμνR = 8πG/c⁴ Tμν', 'Δφ = 43″ / century'] }) => <Room wall={night ? '#7a6a58' : '#b8a888'} stripe={night ? '#6a5a4a' : '#a89878'} floor="#5a3a22" night={night}>
  <Blackboard x={560} y={180} w={800} h={420}>{eq.map((e, k) => <Chalk key={k} x={600} y={290 + k * 110} s={50}>{e}</Chalk>)}</Blackboard>
  <Shelf x={-80} y={360} n={4} seed={11} /><Shelf x={1640} y={360} n={4} seed={13} />
  <Window x={1420} y={220} w={160} h={300} tone={night ? 'night' : 'day'} />
</Room>;

/* Príncipe, 1919: palms, sea, the eclipse camera */
export const Island: React.FC<{ T: number; dark?: number }> = ({ T, dark = 0 }) => <g>
  <Sky tone="eclipse" dark={dark} />
  <g opacity={1 - dark * .6}><circle cx={1400} cy={240} r={70} fill="#fff2c0" /></g>
  {dark > .02 && <g><circle cx={1400} cy={240} r={70 + dark * 60} fill="url(#sunGlow)" opacity={dark} /><circle cx={1400 + (1 - dark) * 90} cy={240} r={72} fill="#0a0f1a" /></g>}
  {dark > .5 && Array.from({ length: 14 }).map((_, i) => { const R = rng(i + 40); return <circle key={i} cx={1100 + R() * 640} cy={60 + R() * 380} r={2 + R() * 2} fill="#fff" opacity={(dark - .5) * 2} />; })}
  <rect x={-240} y={640} width={W} height={120} fill={dark > .5 ? '#1e3040' : '#3a7a8a'} />
  {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${-200 + i * 200 + Math.sin(T + i) * 20} 680 q 30 -10 60 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={.4} />)}
  <path d="M -240 760 Q 960 700 2160 760 L 2160 1300 L -240 1300 Z" fill="#d8c08a" />
  {[[140, 1], [1720, -1], [1880, 1]].map(([x, q], k) => <g key={k} transform={`translate(${x} 860)`}><path d={`M 0 0 Q ${q * 30} -200 ${q * 10} -400`} stroke={P.ink} strokeWidth={30} fill="none" /><path d={`M 0 0 Q ${q * 30} -200 ${q * 10} -400`} stroke="#8a6a44" strokeWidth={18} fill="none" />
    {[0, 1, 2, 3, 4].map((f) => <path key={f} d={`M ${q * 10} -400 q ${(f - 2) * 70} ${-40 + Math.abs(f - 2) * 30} ${(f - 2) * 150} ${40 + Math.abs(f - 2) * 40}`} stroke="#3f6e3a" strokeWidth={22} fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(T * 1.2 + f) * 3} ${q * 10} -400)`} />)}</g>)}
  <g transform="translate(560 900)"><rect x={-60} y={-80} width={120} height={80} fill="#7a6a52" {...ol(5)} /><g transform="rotate(-28)"><rect x={-24} y={-300} width={48} height={260} fill="#3a3a3a" {...ol(5)} /><rect x={-30} y={-310} width={60} height={30} fill={C.brass} {...ol(4)} /></g>
    {[-1, 1].map((q) => <line key={q} x1={q * 40} y1={0} x2={q * 90} y2={60} stroke={P.ink} strokeWidth={8} />)}</g>
  <path d="M 1000 900 L 1120 760 L 1240 900 Z" fill="#efe6d0" {...ol(6)} />
  {dark > .02 && <rect x={-240} y={640} width={W} height={700} fill="#0a0f1a" opacity={dark * .55} />}
</g>;

/* Solvay hall — Brussels, 1927 */
export const Hall: React.FC<{ T: number; breakfast?: boolean }> = ({ T, breakfast }) => <Room wall="#cdbf9c" stripe="#bcae8a" floor="#7a5a3a">
  {[0, 1, 2, 3].map((k) => <g key={k}><rect x={60 + k * 480} y={120} width={240} height={560} rx={120} fill="#b8d0d4" {...ol()} /><rect x={60 + k * 480} y={120} width={240} height={560} rx={120} fill="none" stroke={C.cream} strokeWidth={14} />
    <line x1={180 + k * 480} y1={120} x2={180 + k * 480} y2={680} stroke={C.cream} strokeWidth={8} /></g>)}
  {breakfast && [420, 1380].map((x, k) => <g key={k}><path d={`M ${x - 40} 620 l 0 -50 q 40 -20 80 0 l 0 50 Z`} fill="#c8a040" {...ol(5)} /></g>)}
  <path d="M -240 100 L 2160 100" stroke={C.brass} strokeWidth={10} />
</Room>;

export const Porch: React.FC<{ T: number; sea?: boolean; tone?: 'day' | 'dusk' }> = ({ T, sea, tone = 'day' }) => <g>
  <Sky tone={tone} />
  {sea && <rect x={-240} y={560} width={W} height={200} fill="#4a8a9a" />}
  {sea && Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${-200 + i * 240 + Math.sin(T + i) * 20} 620 q 30 -10 60 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={.5} />)}
  {!sea && [[200, '#c8742a'], [1700, '#b84a2a'], [1900, '#d89a3a']].map(([x, c], k) => <g key={k}><rect x={+x - 14} y={420} width={28} height={420} fill="#5a3a22" {...ol(5)} /><circle cx={+x} cy={400} r={150} fill={c as string} {...ol(6)} /><circle cx={+x - 70} cy={460} r={90} fill={c as string} {...ol(6)} /></g>)}
  <rect x={360} y={180} width={1240} height={700} fill="#efeae0" {...ol()} />
  {Array.from({ length: 16 }).map((_, i) => <line key={i} x1={360} y1={200 + i * 42} x2={1600} y2={200 + i * 42} stroke="#d0c8b8" strokeWidth={4} />)}
  <path d="M 320 190 L 980 20 L 1640 190 Z" fill="#5a5a62" {...ol()} />
  {[520, 1300].map((x, k) => <g key={k}><rect x={x - 80} y={300} width={160} height={220} fill="#3a4a5a" {...ol(5)} />{[-1, 1].map((q) => <rect key={q} x={x + q * 80 - (q > 0 ? 0 : 36)} y={300} width={36} height={220} fill="#2f4a3a" {...ol(4)} />)}</g>)}
  <rect x={900} y={560} width={160} height={320} fill="#4a3a2a" {...ol()} />
  <rect x={-240} y={880} width={W} height={300} fill={sea ? '#c8b080' : '#8a9a5a'} />
  <rect x={300} y={860} width={1360} height={40} fill="#d8d0c0" {...ol(5)} />
</g>;
export const Hospital: React.FC<{ T: number }> = ({ T }) => <Room wall="#8a9a98" stripe="#7a8a88" floor="#5a6260" night>
  <Window x={1300} y={200} w={300} h={380} tone="night" />
  <rect x={300} y={300} width={240} height={160} fill="#6a7a78" opacity={.6} {...ol(5)} />
</Room>;
export const Bed: React.FC<{ x: number; y?: number }> = ({ x, y = 900 }) => <g>
  <rect x={x - 340} y={y - 300} width={30} height={300} fill="#c8ccd0" {...ol(5)} /><rect x={x + 310} y={y - 220} width={30} height={220} fill="#c8ccd0" {...ol(5)} />
  <rect x={x - 330} y={y - 150} width={660} height={60} fill="#e8ecee" {...ol(6)} />
</g>;
export const BedFront: React.FC<{ x: number; y?: number }> = ({ x, y = 900 }) => <g>
  <path d={`M ${x - 300} ${y - 170} Q ${x} ${y - 210} ${x + 320} ${y - 160} L ${x + 330} ${y - 30} L ${x - 330} ${y - 30} Z`} fill="#dfe6ea" {...ol(6)} />
  <path d={`M ${x - 200} ${y - 170} Q ${x - 100} ${y - 150} ${x} ${y - 180}`} stroke="#b8c4ca" strokeWidth={5} fill="none" />
</g>;
