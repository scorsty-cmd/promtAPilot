import React from 'react';
import { P } from './art';
import { rng, clamp, lerp, easeInOut } from './lib';
import { F, Sky, Tone, Embers } from './sets';

/* ===== Syracuse, 3rd c. BC — limestone, terracotta, Ionian turquoise ===== */
export const SY = { lime: '#ece0c4', limeD: '#cdbb94', terra: '#c8643a', terraD: '#9a4a2a', sea: '#2f9aa8', seaD: '#1f6a80', deep: '#1f4a6a', olive: '#7a8a4a', cypress: '#2f4a32', wood: '#8a5a34', woodD: '#5a3a20', rope: '#c8a870', iron: '#4a4a4e', papyrus: '#efe0b8' };
const ol = (w = 7) => ({ stroke: P.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const W = 2400;

/* depth-of-field: anything wrapped in <Blur> is out of focus (backlog #16) */
export const Blur: React.FC<{ r?: number; children: React.ReactNode }> = ({ r = 6, children }) => <g filter={`url(#dof${Math.round(r)})`}>{children}</g>;
export const DofDefs = () => <>{[3, 6, 10].map((r) => <filter key={r} id={`dof${r}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={r} /></filter>)}</>;

export const SeaW: React.FC<{ y: number; T: number; dark?: boolean; h?: number }> = ({ y, T, dark, h = 700 }) => <g>
  <rect x={-240} y={y} width={W} height={h} fill={dark ? '#14304a' : SY.sea} />
  <rect x={-240} y={y} width={W} height={30} fill={dark ? '#1c405a' : '#5ab8c0'} opacity={.6} />
  {Array.from({ length: 34 }).map((_, i) => { const R = rng(i + 61); return <path key={i} d={`M ${(R() * 2400 + T * 18) % 2400 - 240} ${y + 20 + R() * (h - 60)} q 16 -8 32 0`} stroke="#fff" strokeWidth={3} fill="none" opacity={.45} />; })}
</g>;
/* Roman warship (quinquereme) — red sail, ram, many oars */
export const Warship: React.FC<{ x: number; y: number; s?: number; flip?: boolean; T: number; tilt?: number; lift?: number; sail?: boolean; tower?: boolean }> = ({ x, y, s = 1, flip, T, tilt = 0, lift = 0, sail = true, tower }) => (
  <g transform={`translate(${x} ${y - lift + Math.sin(T * 1.3 + x) * 5}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${tilt + Math.sin(T + x) * 1})`}>
    <path d="M -340 -50 Q -360 -150 -320 -190 L -300 -70 L 290 -70 L 330 -20 L 410 -10 L 300 10 L -300 10 Z" fill="#3a2a22" {...ol()} />
    <path d="M -300 -70 L 290 -70" stroke="#a82a22" strokeWidth={12} /><path d="M -300 -40 L 300 -40" stroke="#c9913a" strokeWidth={5} />
    <path d="M 300 -14 L 420 -8 L 300 4 Z" fill="#c9913a" stroke={P.ink} strokeWidth={5} />
    {Array.from({ length: 14 }).map((_, k) => <line key={k} x1={-260 + k * 40} y1={-20} x2={-290 + k * 40 + Math.sin(T * 4 + k * .4) * 24} y2={80} stroke={SY.woodD} strokeWidth={6} />)}
    {sail && <><line x1={0} y1={-70} x2={0} y2={-420} stroke={P.ink} strokeWidth={12} /><path d={`M -150 -400 L 150 -400 Q ${160 + Math.sin(T) * 10} -260 150 -150 L -150 -150 Q ${-140 + Math.sin(T) * 10} -260 -150 -400 Z`} fill="#b03a2a" {...ol(6)} /><circle cx={0} cy={-280} r={36} fill="none" stroke="#e8c870" strokeWidth={8} /></>}
    {tower && <g><path d="M 120 -70 L 160 -420 L 230 -420 L 220 -70 Z" fill={SY.wood} {...ol(6)} />{[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={150} y1={-110 - k * 52} x2={225} y2={-110 - k * 52} stroke={P.ink} strokeWidth={5} />)}</g>}
  </g>
);
/* the giant Syracusia */
export const Syracusia: React.FC<{ x: number; y: number; s?: number; T: number; moved?: number }> = ({ x, y, s = 1, T, moved = 0 }) => <g transform={`translate(${x + moved} ${y}) scale(${s})`}>
  <path d="M -620 -60 Q -660 -230 -600 -290 L -560 -120 L 560 -120 Q 620 -230 640 -310 L 680 -300 Q 660 -100 600 0 L -560 0 Z" fill="#5a3a22" {...ol()} />
  {[0, 1, 2].map((r) => <path key={r} d={`M -560 ${-100 + r * 34} L 590 ${-100 + r * 34}`} stroke={['#c8643a', '#e8c870', '#1f6a80'][r]} strokeWidth={10} />)}
  {Array.from({ length: 18 }).map((_, k) => <rect key={k} x={-520 + k * 60} y={-90} width={30} height={22} fill="#2a1a12" />)}
  {[-300, 0, 300].map((mx, k) => <g key={k}><line x1={mx} y1={-120} x2={mx} y2={-640 + k * 40} stroke={P.ink} strokeWidth={14} /><path d={`M ${mx - 160} ${-600 + k * 40} L ${mx + 160} ${-600 + k * 40} L ${mx + 150} ${-300} L ${mx - 150} -300 Z`} fill="#efe4cc" {...ol(6)} opacity={.0} /></g>)}
  <path d="M -200 -120 L -200 -220 L 200 -220 L 200 -120" fill="#efe4cc" {...ol(6)} />
  {[-160, -80, 0, 80, 160].map((c) => <rect key={c} x={c - 10} y={-210} width={20} height={80} fill="#c9913a" />)}
  {/* rollers */}
  {Array.from({ length: 9 }).map((_, k) => <g key={'r' + k} transform={`translate(${-560 + k * 140 - moved} 22) rotate(${moved * 2})`}><circle r={22} fill={SY.wood} stroke={P.ink} strokeWidth={5} /><line x1={-20} y1={0} x2={20} y2={0} stroke={P.ink} strokeWidth={4} /></g>)}
</g>;
/* compound pulley block on a frame, ropes to the ship */
export const PulleyRig: React.FC<{ x: number; y: number; T: number; pull: number; toX: number }> = ({ x, y, T, pull, toX }) => <g>
  <path d={`M ${x - 120} ${y} L ${x - 60} ${y - 420} L ${x + 60} ${y - 420} L ${x + 120} ${y}`} fill="none" stroke={SY.woodD} strokeWidth={22} />
  <path d={`M ${x - 120} ${y} L ${x - 60} ${y - 420} L ${x + 60} ${y - 420} L ${x + 120} ${y}`} fill="none" stroke={P.ink} strokeWidth={6} opacity={.6} />
  {[0, 1, 2].map((k) => <g key={k} transform={`translate(${x} ${y - 380 + k * 70}) rotate(${pull * 400 * (k % 2 ? -1 : 1)})`}><circle r={30} fill={SY.wood} stroke={P.ink} strokeWidth={6} /><line x1={-26} y1={0} x2={26} y2={0} stroke={P.ink} strokeWidth={5} /><line x1={0} y1={-26} x2={0} y2={26} stroke={P.ink} strokeWidth={5} /></g>)}
  {[0, 1, 2, 3, 4].map((k) => <line key={'l' + k} x1={x - 20 + k * 10} y1={y - 380} x2={toX} y2={y - 260 + k * 18} stroke={SY.rope} strokeWidth={6} />)}
  <line x1={x} y1={y - 240} x2={x - 160} y2={y - 60} stroke={SY.rope} strokeWidth={7} />
</g>;
/* Syracuse sea walls with towers */
export const SeaWalls: React.FC<{ T: number; x?: number; y?: number; s?: number; tone?: Tone; fire?: number }> = ({ T, x = 0, y = 760, s = 1, tone = 'day', fire = 0 }) => {
  const dark = tone === 'night' || tone === 'fire';
  const st = dark ? '#6a604e' : SY.lime, stD = dark ? '#4a4236' : SY.limeD;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[[-120, -560, 260, 160], [200, -620, 280, 220], [560, -580, 220, 180]].map(([bx, by, w, h], k) => <g key={k}><rect x={bx} y={by} width={w} height={h} fill={dark ? '#7a6a52' : SY.lime} {...ol(6)} /><path d={`M ${bx - 14} ${by} L ${bx + w / 2} ${by - 50} L ${bx + w + 14} ${by} Z`} fill={dark ? '#5a3a2a' : SY.terra} {...ol(5)} />
      {[0, 1].map((c) => <rect key={c} x={bx + 30 + c * (w - 90)} y={by + 50} width={30} height={40} fill={dark ? '#ffcf7a' : '#3a2a20'} {...ol(4)} />)}</g>)}
    <rect x={-300} y={-400} width={1400} height={400} fill={st} {...ol()} />
    {Array.from({ length: 15 }).map((_, i) => <line key={i} x1={-300 + i * 100} y1={-400} x2={-300 + i * 100} y2={0} stroke={stD} strokeWidth={4} />)}
    {[0, 1, 2, 3, 4, 5].map((r) => <line key={'r' + r} x1={-300} y1={-60 - r * 60} x2={1100} y2={-60 - r * 60} stroke={stD} strokeWidth={4} />)}
    {Array.from({ length: 18 }).map((_, i) => <rect key={'m' + i} x={-300 + i * 80} y={-440} width={50} height={44} fill={st} {...ol(5)} />)}
    {[-200, 900].map((tx, k) => <g key={k}><rect x={tx - 110} y={-620} width={220} height={620} fill={st} {...ol()} />{Array.from({ length: 4 }).map((_, i) => <rect key={i} x={tx - 110 + i * 60} y={-660} width={40} height={44} fill={st} {...ol(5)} />)}<rect x={tx - 20} y={-520} width={40} height={60} fill="#2a1a12" /></g>)}
    {fire > 0 && <Embers T={T} n={20} o={fire} />}
  </g>;
};
/* the claw: a swinging crane beam on the wall with chain + iron hook */
export const Claw: React.FC<{ x: number; y: number; s?: number; ang: number; drop: number; flip?: boolean }> = ({ x, y, s = 1, ang, drop, flip }) => {
  const L = 620; const ex = Math.cos(ang * Math.PI / 180) * L, ey = -Math.sin(ang * Math.PI / 180) * L;
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <rect x={-60} y={-60} width={120} height={60} fill={SY.woodD} {...ol(6)} />
    <line x1={0} y1={-40} x2={ex} y2={ey - 40} stroke={P.ink} strokeWidth={34} strokeLinecap="round" /><line x1={0} y1={-40} x2={ex} y2={ey - 40} stroke={SY.wood} strokeWidth={22} strokeLinecap="round" />
    <line x1={-80} y1={-40} x2={0} y2={-40} stroke={P.ink} strokeWidth={30} /><rect x={-150} y={-90} width={90} height={90} fill="#6a6a6a" {...ol(6)} />
    <circle cx={0} cy={-40} r={20} fill="#c9913a" stroke={P.ink} strokeWidth={6} />
    <line x1={ex} y1={ey - 40} x2={ex} y2={ey - 40 + drop} stroke={SY.iron} strokeWidth={10} strokeDasharray="16 6" />
    <g transform={`translate(${ex} ${ey - 40 + drop})`}><path d="M 0 0 L 0 30 M -40 70 Q -40 30 0 30 Q 40 30 40 70 M -40 70 L -24 60 M 40 70 L 24 60" stroke={SY.iron} strokeWidth={14} fill="none" strokeLinecap="round" /><path d="M 0 0 L 0 30 M -40 70 Q -40 30 0 30 Q 40 30 40 70" stroke={P.ink} strokeWidth={4} fill="none" /></g>
  </g>;
};
export const Catapult: React.FC<{ x: number; y: number; s?: number; t: number; period?: number; flip?: boolean }> = ({ x, y, s = 1, t, period = 3, flip }) => {
  const ph = (t % period) / period; const a = ph < .12 ? lerp(-10, -80, ph / .12) : lerp(-80, -10, clamp((ph - .12) / .7));
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <rect x={-120} y={-60} width={240} height={50} fill={SY.wood} {...ol(6)} />{[-90, 90].map((wx) => <circle key={wx} cx={wx} cy={-6} r={30} fill={SY.woodD} {...ol(5)} />)}
    <path d="M -40 -60 L 0 -180 L 40 -60" stroke={SY.woodD} strokeWidth={18} fill="none" />
    <g transform={`translate(-60 -70) rotate(${a})`}><rect x={0} y={-10} width={200} height={20} fill={SY.wood} {...ol(5)} /><circle cx={200} cy={-12} r={18} fill="#8a8a7a" stroke={P.ink} strokeWidth={4} opacity={ph > .12 ? 0 : 1} /></g>
  </g>;
};
export const Stone: React.FC<{ t: number; from: [number, number]; to: [number, number]; dur?: number; period?: number; h?: number }> = ({ t, from, to, dur = 1.2, period = 3, h = 300 }) => {
  const ph = (t % period) / period * period; if (ph < period * .12 || ph > period * .12 + dur) return null;
  const p = (ph - period * .12) / dur; return <circle cx={lerp(from[0], to[0], p)} cy={lerp(from[1], to[1], p) - Math.sin(p * Math.PI) * h} r={16} fill="#8a8a7a" stroke={P.ink} strokeWidth={4} />;
};
export const Splash: React.FC<{ x: number; y: number; p: number; s?: number }> = ({ x, y, p, s = 1 }) => p <= 0 || p >= 1 ? null : <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - p}>
  {Array.from({ length: 9 }).map((_, k) => { const a = -Math.PI * (k + 1) / 10; return <circle key={k} cx={Math.cos(a) * 160 * p} cy={Math.sin(a) * 220 * p + 200 * p * p} r={18 * (1 - p) + 6} fill="#dff4f6" stroke={P.ink} strokeWidth={3} />; })}
  <ellipse cx={0} cy={0} rx={180 * p} ry={30 * p} fill="none" stroke="#fff" strokeWidth={6} />
</g>;

/* interiors */
const Floor: React.FC<{ y?: number; c?: string; tiles?: boolean }> = ({ y = 900, c = '#c8b08a', tiles = true }) => <g>
  <rect x={-240} y={y} width={W} height={400} fill={c} />
  {tiles && Array.from({ length: 26 }).map((_, i) => <line key={i} x1={-240 + i * 100} y1={y} x2={-240 + i * 100 + (i - 13) * 34} y2={y + 300} stroke="rgba(0,0,0,.12)" strokeWidth={4} />)}
  {tiles && [0, 1, 2].map((r) => <line key={'h' + r} x1={-240} y1={y + 40 + r * 70 + r * r * 10} x2={2160} y2={y + 40 + r * 70 + r * r * 10} stroke="rgba(0,0,0,.1)" strokeWidth={4} />)}
</g>;
export const Workshop: React.FC<{ T: number; night?: boolean }> = ({ T, night }) => <g>
  <rect x={-240} y={-200} width={W} height={1150} fill={night ? '#8a7454' : SY.lime} />
  <rect x={-240} y={560} width={W} height={340} fill={night ? '#6a4a34' : '#d8c4a0'} />
  {/* window to the harbor */}
  <rect x={760} y={170} width={400} height={300} fill={night ? '#16304a' : '#9ad0d8'} {...ol()} />
  <rect x={760} y={330} width={400} height={140} fill={night ? '#14304a' : SY.sea} />{!night && <path d="M 900 330 L 920 260 L 940 330 Z" fill="#efe4cc" />}
  <line x1={960} y1={170} x2={960} y2={470} stroke={SY.woodD} strokeWidth={12} />
  {/* shelves of scrolls */}
  {[[-80, 300], [1380, 300]].map(([sx, sy], k) => <g key={k}><rect x={sx} y={sy} width={420} height={420} fill={SY.woodD} {...ol()} />
    {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 8 }).map((_, c) => <circle key={r + '-' + c} cx={sx + 34 + c * 50} cy={sy + 50 + r * 100} r={20} fill={(r + c) % 3 ? SY.papyrus : '#d8c090'} stroke={P.ink} strokeWidth={4} />))}</g>)}
  {/* hanging pulleys + models */}
  {[400, 560, 1560].map((px, k) => <g key={k}><line x1={px} y1={-200} x2={px} y2={140 + k * 30 + Math.sin(T * 1.2 + k) * 6} stroke={SY.rope} strokeWidth={5} /><circle cx={px} cy={160 + k * 30 + Math.sin(T * 1.2 + k) * 6} r={24} fill={SY.wood} stroke={P.ink} strokeWidth={5} /></g>)}
  <g transform="translate(300 560) rotate(-6)"><path d="M -80 0 Q 0 30 80 0 L 60 -14 L -60 -14 Z" fill={SY.wood} {...ol(4)} /><line x1={0} y1={-14} x2={0} y2={-90} stroke={P.ink} strokeWidth={5} /></g>
  <Floor />
  {night && <rect x={-240} y={-200} width={W} height={1400} fill="url(#lampWash)" />}
</g>;
/* the sand tray / dust board with circles drawn progressively */
export const SandTray: React.FC<{ x: number; y: number; w?: number; draw: number; poly?: number; ash?: boolean }> = ({ x, y, w = 420, draw, poly = 0, ash }) => <g transform={`translate(${x} ${y})`}>
  <path d={`M ${-w / 2 - 30} 0 L ${w / 2 + 30} 0 L ${w / 2} -60 L ${-w / 2} -60 Z`} fill={SY.woodD} {...ol(6)} />
  <path d={`M ${-w / 2 + 6} -8 L ${w / 2 - 6} -8 L ${w / 2 - 22} -54 L ${-w / 2 + 22} -54 Z`} fill={ash ? '#8a8478' : '#e2cc96'} />
  <g transform="translate(0 -31) scale(1 .28)">
    <circle r={110} fill="none" stroke="#5a4a30" strokeWidth={8} strokeDasharray={`${draw * 700} 700`} />
    {poly > 0 && <polygon points={Array.from({ length: poly }).map((_, k) => `${Math.cos(k / poly * Math.PI * 2) * 110},${Math.sin(k / poly * Math.PI * 2) * 110}`).join(' ')} fill="none" stroke="#5a4a30" strokeWidth={6} />}
    <rect x={-110} y={-110} width={220} height={220} fill="none" stroke="#5a4a30" strokeWidth={6} opacity={draw > .9 ? 1 : 0} />
  </g>
</g>;
export const Bath: React.FC<{ T: number; spill: number }> = ({ T, spill }) => <g>
  <rect x={-240} y={-200} width={W} height={1150} fill="#d8e6e0" />
  {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-240 + i * 200} y={160} width={200} height={20} fill="#2f9aa8" opacity={.6} />)}
  {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${-100 + k * 600} 120 l 40 -60 l 40 60`} stroke="#9ac4c0" strokeWidth={10} fill="none" />)}
  <Floor c="#b8c8c0" />
  {Array.from({ length: 6 }).map((_, k) => { const p = ((T * .15 + k / 6) % 1); return <ellipse key={k} cx={700 + k * 120 + Math.sin(p * 6) * 40} cy={700 - p * 500} rx={70} ry={40} fill="#fff" opacity={(1 - p) * .35} />; })}
</g>;
export const Tub: React.FC<{ x: number; y: number; spill: number; T: number }> = ({ x, y, spill, T }) => <g transform={`translate(${x} ${y})`}>
  {spill > 0 && <path d={`M -300 -160 Q -340 ${-60} -360 ${-20 + spill * 40} L -260 ${spill * 40} Q -280 -80 -270 -160 Z`} fill="#7ac8d0" opacity={.8} />}
  {spill > 0 && <path d={`M 300 -160 Q 340 -60 ${360 + spill * 80} ${-10 + spill * 30} L ${200 + spill * 160} ${spill * 30} Q 290 -80 270 -160 Z`} fill="#7ac8d0" opacity={.8} />}
  <path d="M -300 -170 L 300 -170 L 260 0 L -260 0 Z" fill="#e8dcc0" {...ol()} />
  <path d="M -290 -160 L 290 -160 L 284 -140 L -284 -140 Z" fill="#5ab8c0" />
  {spill > 0 && <ellipse cx={0} cy={-162} rx={290} ry={14} fill="#9adfe4" opacity={.8} />}
  {Array.from({ length: 6 }).map((_, k) => <path key={k} d={`M ${-240 + k * 90} -120 q 20 -12 40 0`} stroke="#5a4a30" strokeWidth={4} fill="none" opacity={.3} />)}
</g>;
export const Palace: React.FC<{ T: number }> = ({ T }) => <g>
  <rect x={-240} y={-200} width={W} height={1150} fill="#e8d8b8" />
  <rect x={-240} y={80} width={W} height={50} fill={SY.terra} />
  {Array.from({ length: 26 }).map((_, i) => <path key={i} d={`M ${-220 + i * 90} 105 l 20 -16 l 20 16 l 20 -16`} stroke="#e8c870" strokeWidth={5} fill="none" />)}
  {[200, 560, 1360, 1720].map((cx) => <g key={cx}><rect x={cx - 40} y={130} width={80} height={770} fill="#f2ead8" {...ol()} /><rect x={cx - 60} y={110} width={120} height={30} fill="#f2ead8" {...ol(5)} />{[0, 1, 2, 3].map((k) => <line key={k} x1={cx - 20 + k * 14} y1={150} x2={cx - 20 + k * 14} y2={890} stroke="#d0c4a8" strokeWidth={4} />)}</g>)}
  <path d="M 760 900 L 760 380 Q 960 260 1160 380 L 1160 900 Z" fill="#6a2a6a" opacity={.85} {...ol()} />
  <g transform="translate(960 900)"><rect x={-120} y={-160} width={240} height={160} fill="#c9913a" {...ol(6)} /><rect x={-150} y={-300} width={300} height={150} fill="#a8742a" {...ol(6)} /></g>
  <Floor c="#d0b48a" />
</g>;
export const Shipyard: React.FC<{ T: number }> = ({ T }) => <g>
  <Sky tone="day" T={T} />
  <SeaW y={600} T={T} />
  <path d="M -240 700 L 2160 760 L 2160 1300 L -240 1300 Z" fill="#cdb48a" />
  {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={-200 + k * 380} y={720} width={300} height={24} fill={SY.woodD} opacity={.5} />)}
  {[[1650, 820], [1820, 860]].map(([cx, cy], k) => <g key={k}><path d={`M ${cx - 40} ${cy} L ${cx} ${cy - 160} L ${cx + 40} ${cy} Z`} fill={SY.cypress} {...ol(5)} /></g>)}
</g>;
export const Harbor: React.FC<{ T: number; tone?: Tone }> = ({ T, tone = 'day' }) => <g>
  <Sky tone={tone} T={T} />
  <SeaW y={520} T={T} dark={tone === 'night'} />
  {[[-200, 520, 300], [2000, 520, 260]].map(([hx, hy, w], k) => <path key={k} d={`M ${hx} ${hy} L ${hx + 40} ${hy - 120} L ${hx + w} ${hy - 160} L ${hx + w + 60} ${hy} Z`} fill={SY.olive} opacity={.7} />)}
</g>;
export const Festival: React.FC<{ T: number }> = ({ T }) => <g>
  <Sky tone="night" T={T} />
  {Array.from({ length: 6 }).map((_, i) => <g key={i}><rect x={-200 + i * 400} y={560} width={300} height={340} fill="#6a5a44" {...ol()} /><path d={`M ${-214 + i * 400} 560 L ${-50 + i * 400} 500 L ${114 + i * 400} 560 Z`} fill="#5a3a2a" {...ol(5)} /><rect x={-140 + i * 400} y={640} width={60} height={70} fill={i % 2 ? '#ffcf7a' : '#2a1a12'} {...ol(4)} /></g>)}
  {Array.from({ length: 22 }).map((_, i) => <circle key={'l' + i} cx={-200 + i * 110} cy={480 + Math.sin(i * 1.3) * 20} r={10} fill="#ffcf6a" opacity={.6 + Math.sin(T * 4 + i) * .3} />)}
  <path d={`M -240 470 ${Array.from({ length: 23 }).map((_, i) => `Q ${-145 + i * 110} ${520} ${-90 + i * 110} ${480 + Math.sin((i + 1) * 1.3) * 20}`).join(' ')}`} stroke={P.ink} strokeWidth={3} fill="none" />
  <Floor c="#4a3e30" />
</g>;
export const Courtyard: React.FC<{ T: number; tone?: Tone; smoke?: number }> = ({ T, tone = 'day', smoke = 0 }) => <g>
  <Sky tone={tone} T={T} />
  <rect x={-240} y={300} width={W} height={600} fill={tone === 'fire' ? '#8a6a4a' : SY.lime} />
  {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <g key={k}><rect x={-160 + k * 300} y={330} width={50} height={570} fill={tone === 'fire' ? '#a08060' : '#f2ead8'} {...ol(6)} /></g>)}
  <rect x={-240} y={290} width={W} height={50} fill={tone === 'fire' ? '#6a3a2a' : SY.terra} {...ol(6)} />
  <path d="M 800 900 L 820 760 Q 900 700 980 760 L 1000 900 Z" fill={SY.olive} opacity={.0} />
  <g transform="translate(1600 900)"><rect x={-14} y={-260} width={28} height={260} fill="#6a4a2a" {...ol(4)} /><circle cx={0} cy={-300} r={110} fill={SY.olive} {...ol(6)} /><circle cx={-70} cy={-240} r={70} fill={SY.olive} {...ol(6)} /></g>
  <Floor c={tone === 'fire' ? '#7a6a52' : '#d8c49a'} />
  {smoke > 0 && [0, 1, 2].map((k) => { const p = ((T * .12 + k / 3) % 1); return <circle key={k} cx={300 + k * 600 + p * 100} cy={300 - p * 500} r={120 + p * 200} fill="#3a2a2a" opacity={(1 - p) * .5 * smoke} />; })}
</g>;
export const TombSite: React.FC<{ T: number; cut: number }> = ({ T, cut }) => <g>
  <Sky tone="day" T={T} />
  <rect x={-240} y={600} width={W} height={700} fill="#9aa060" />
  {[[100, 640], [1700, 620]].map(([cx, cy], k) => <g key={k}><path d={`M ${cx - 50} ${cy + 280} L ${cx} ${cy - 120} L ${cx + 50} ${cy + 280} Z`} fill={SY.cypress} {...ol(5)} /></g>)}
  <g transform="translate(1000 900)">
    <rect x={-160} y={-260} width={320} height={260} fill="#cfc4a6" {...ol()} />
    <g transform="translate(0 -360)"><rect x={-80} y={-100} width={160} height={200} fill="#e0d6ba" {...ol(6)} /><ellipse cx={0} cy={-100} rx={80} ry={18} fill="#e8dec4" {...ol(5)} /><circle cx={0} cy={0} r={80} fill="none" stroke={P.ink} strokeWidth={6} /><circle cx={0} cy={0} r={80} fill="#ece4cc" opacity={.6} /></g>
  </g>
  {Array.from({ length: 26 }).map((_, i) => { const R = rng(i + 800); const bx = 640 + R() * 720, by = 520 + R() * 400; const side = bx < 1000 ? -1 : 1; return <g key={i} transform={`translate(${bx + side * cut * 500} ${by}) rotate(${side * cut * 30})`} opacity={1 - cut * .8}><circle r={60 + R() * 40} fill="#5a7a3a" {...ol(5)} /><circle cx={20} cy={-10} r={30} fill="#6a8a4a" /></g>; })}
</g>;
export const Lab: React.FC<{ T: number; scan: number }> = ({ T, scan }) => <g>
  <rect x={-240} y={-200} width={W} height={1400} fill="#141c26" />
  {Array.from({ length: 8 }).map((_, k) => <rect key={k} x={-200 + k * 300} y={-100} width={20} height={1000} fill="#1c2836" />)}
  <rect x={560} y={260} width={800} height={560} fill="#e8dcc0" {...ol(6)} />
  {Array.from({ length: 14 }).map((_, r) => <line key={r} x1={600} y1={300 + r * 36} x2={1320 - (r % 3) * 60} y2={300 + r * 36} stroke="#5a3a2a" strokeWidth={6} opacity={.7} />)}
  <g opacity={.25 + scan * .75}>{Array.from({ length: 10 }).map((_, c) => <line key={c} x1={640 + c * 70} y1={290} x2={640 + c * 70} y2={790} stroke="#c8302a" strokeWidth={4} strokeDasharray="10 6" />)}<circle cx={1000} cy={540} r={140} fill="none" stroke="#c8302a" strokeWidth={5} /><path d="M 860 540 L 1140 540 M 1000 400 L 1000 680" stroke="#c8302a" strokeWidth={4} /></g>
  <rect x={560 + (T * 200 % 800)} y={240} width={14} height={600} fill="#9a7aff" opacity={.7} />
  <rect x={540} y={180} width={840} height={30} fill="#3a4a5a" {...ol(5)} /><circle cx={960} cy={150} r={40} fill="#2a2a3a" {...ol(5)} />
  <rect x={-240} y={900} width={W} height={400} fill="#0c1218" />
</g>;
