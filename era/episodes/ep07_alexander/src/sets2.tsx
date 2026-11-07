import React from 'react';
import { P } from './art';
import { rng, clamp, lerp } from './lib';
import { MChar, MLook, MPose, macedon, persian, indian, CAST, RC, Horse } from './chars';
import { Sky, Hills, Cypress, Pine, Torch, Campfire, Sea, Ship, Dust, Smoke, Embers, Tone } from './sets';

/* ===== ep07 world: Macedon → Persia → India, 344–323 BC.
   Palette per region: Macedon = limestone, pine, royal purple & gold; Persia = glazed blue, cedar, gold; India = monsoon green; desert = ochre haze ===== */
export const A = { lime: '#e2d6b8', limeD: '#c2b48e', marble: '#efe9dc', purple: '#5a2a6a', gold: '#d9a441', terra: '#c8693a', black: '#1c1410', glaze: '#2f5f9a', glazeD: '#1f4070', cedar: '#7a4a2a',
  river: '#5f9ab0', riverD: '#3f7a90', sand: '#e6c88a', sandD: '#c9a865', jungle: '#3f6a3a', jungleD: '#2a4a2a', fire: '#ffb347' };
const ol = (w = 7) => ({ stroke: P.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const W = 2400;

/* Vergina sun (16 rays) */
export const Star: React.FC<{ x: number; y: number; r: number; c?: string; o?: number }> = ({ x, y, r, c = A.gold, o = 1 }) => <g transform={`translate(${x} ${y})`} opacity={o}>
  {Array.from({ length: 16 }).map((_, k) => { const a = k / 16 * Math.PI * 2; return <path key={k} d={`M ${Math.cos(a - .1) * r * .22} ${Math.sin(a - .1) * r * .22} L ${Math.cos(a) * r} ${Math.sin(a) * r} L ${Math.cos(a + .1) * r * .22} ${Math.sin(a + .1) * r * .22} Z`} fill={c} />; })}<circle r={r * .22} fill={c} /></g>;

/* ---- Pella: palace courtyard with a pebble mosaic floor ---- */
export const Pella: React.FC<{ T: number; tone?: Tone }> = ({ T, tone = 'day' }) => <g>
  <Sky tone={tone} T={T} />
  <Hills T={T} y={520} tone={tone} cyp={false} />
  {Array.from({ length: 9 }).map((_, i) => { const cx = -120 + i * 270; return <g key={i}><rect x={cx - 24} y={300} width={48} height={420} fill={A.marble} {...ol(6)} />{[0, 1, 2].map((k) => <line key={k} x1={cx - 12 + k * 12} y1={318} x2={cx - 12 + k * 12} y2={710} stroke={A.limeD} strokeWidth={3} />)}
    <path d={`M ${cx - 46} 300 q 10 -26 46 -18 q 36 -8 46 18 Z`} fill={A.marble} {...ol(5)} /><circle cx={cx - 36} cy={292} r={9} fill="none" stroke={P.ink} strokeWidth={4} /><circle cx={cx + 36} cy={292} r={9} fill="none" stroke={P.ink} strokeWidth={4} /></g>; })}
  <rect x={-240} y={240} width={W} height={40} fill={A.purple} {...ol(6)} />
  {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${-240 + i * 84} 270 l 20 0 l 0 -20 l 20 0 l 0 30 l -40 0`} stroke={A.gold} strokeWidth={4} fill="none" />)}
  <rect x={-240} y={720} width={W} height={600} fill="#d8ccb0" />
  {/* pebble mosaic: border meander + a stag-hunt-like panel of black & white pebbles */}
  <rect x={300} y={800} width={1320} height={300} fill="#2a2420" {...ol(6)} />
  {Array.from({ length: 300 }).map((_, i) => { const R = rng(i + 77); return <circle key={i} cx={310 + R() * 1300} cy={810 + R() * 280} r={2 + R() * 3} fill={R() > .7 ? '#f4efe4' : '#4a4038'} />; })}
  <path d="M 700 1060 C 760 940 860 900 960 930 C 1040 880 1120 900 1180 960 M 960 930 L 980 860 M 1000 930 L 1040 870" stroke="#f4efe4" strokeWidth={9} fill="none" strokeLinecap="round" />
  {Array.from({ length: 22 }).map((_, i) => <path key={'m' + i} d={`M ${300 + i * 60} 790 l 20 0 l 0 -18 l 20 0 l 0 26`} stroke="#4a4038" strokeWidth={5} fill="none" />)}
</g>;

/* ---- Mieza: the sanctuary of the nymphs — limestone cliff with caves, a spring, an Ionic stoa, plane trees ---- */
export const PlaneTree: React.FC<{ x: number; y: number; s?: number; T?: number }> = ({ x, y, s = 1, T = 0 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -26 0 C -20 -120 -40 -200 -10 -300 L 20 -300 C 40 -200 24 -120 30 0 Z" fill="#b8a888" {...ol(6)} />
  {[[-30, -120], [10, -200], [-6, -60]].map(([px, py], k) => <ellipse key={k} cx={px} cy={py} rx={10} ry={16} fill="#8a7a5a" opacity={.6} />)}
  {[[-150, -360, 140], [20, -420, 160], [160, -350, 130], [-60, -300, 120], [90, -290, 110]].map(([cx, cy, r], k) => <circle key={k} cx={cx + Math.sin(T * .8 + k) * 4} cy={cy} r={r} fill={k % 2 ? '#5a7a3a' : '#6a8a42'} {...ol(6)} />)}
</g>;
export const Mieza: React.FC<{ T: number; tone?: Tone; today?: number }> = ({ T, tone = 'day', today = 0 }) => <g>
  <Sky tone={tone} T={T} />
  <path d="M -240 -200 L 2160 -200 L 2160 620 C 1800 600 1600 640 1300 620 C 1000 600 600 640 -240 620 Z" fill={today ? '#cfc2a2' : A.lime} {...ol()} />
  {Array.from({ length: 26 }).map((_, i) => { const R = rng(i + 12); const x = R() * 2300 - 200, y = R() * 700 - 150; return <path key={i} d={`M ${x} ${y} l ${40 + R() * 80} ${R() * 30 - 15}`} stroke={A.limeD} strokeWidth={5} />; })}
  {[[300, 470, 130, 160], [900, 430, 170, 200], [1520, 470, 140, 170]].map(([cx, cy, rx, ry], k) => <g key={k}><path d={`M ${cx - rx} ${cy + ry * .6} C ${cx - rx} ${cy - ry} ${cx + rx} ${cy - ry} ${cx + rx} ${cy + ry * .6} Z`} fill="#2a2018" {...ol(6)} /><path d={`M ${cx - rx * .6} ${cy + ry * .6} C ${cx - rx * .5} ${cy - ry * .4} ${cx + rx * .4} ${cy - ry * .4} ${cx + rx * .6} ${cy + ry * .6}`} fill="#3a3024" /></g>)}
  {/* ivy & hanging green */}
  {Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 400); const x = R() * 2300 - 200; return <path key={i} d={`M ${x} ${-100 + R() * 300} q ${10 + Math.sin(T + i) * 4} 60 0 ${120 + R() * 100}`} stroke="#5a7a3a" strokeWidth={8} fill="none" opacity={.8} />; })}
  {/* Ionic stoa (in ruin when 'today') */}
  {Array.from({ length: 8 }).map((_, i) => { const cx = 120 + i * 250; const ruin = today && i % 3 !== 0; const h = ruin ? 80 + (i * 37) % 120 : 360; return <g key={'c' + i}>
    <rect x={cx - 24} y={640 - h} width={48} height={h} fill={A.marble} {...ol(6)} />
    {!ruin && <><path d={`M ${cx - 44} ${280} q 8 -24 44 -16 q 36 -8 44 16 Z`} fill={A.marble} {...ol(5)} /><circle cx={cx - 34} cy={274} r={8} fill="none" stroke={P.ink} strokeWidth={4} /><circle cx={cx + 34} cy={274} r={8} fill="none" stroke={P.ink} strokeWidth={4} /></>}
    {[0, 1].map((k) => <line key={k} x1={cx - 8 + k * 16} y1={650 - h} x2={cx - 8 + k * 16} y2={636} stroke={A.limeD} strokeWidth={3} />)}</g>; })}
  {!today && <rect x={-240} y={226} width={W} height={36} fill={A.marble} {...ol(6)} />}
  {!today && <path d={`M -240 226 L 2160 226`} stroke={A.terra} strokeWidth={10} />}
  <rect x={-240} y={640} width={W} height={660} fill={today ? '#b8b08a' : '#c8b88a'} />
  {/* stone benches */}
  {[[420, 900], [960, 940], [1500, 900]].map(([bx, by], k) => <g key={'b' + k}><rect x={bx - 200} y={by - 60} width={400} height={44} rx={6} fill={today ? '#b8ad92' : A.limeD} {...ol(6)} /><rect x={bx - 190} y={by - 16} width={380} height={18} fill="#8a7a5a" /></g>)}
  {/* the spring */}
  {!today && <g transform="translate(900 640)"><ellipse rx={150} ry={26} fill={A.river} {...ol(5)} />{[0, 1, 2].map((k) => <ellipse key={k} rx={40 + ((T * 30 + k * 30) % 110)} ry={6 + ((T * 30 + k * 30) % 110) * .15} fill="none" stroke="#fff" strokeOpacity={.5 * (1 - ((T * 30 + k * 30) % 110) / 110)} strokeWidth={3} />)}</g>}
  {!today && <><PlaneTree x={-60} y={1000} s={1.15} T={T} /><PlaneTree x={1960} y={1020} s={1.2} T={T} /></>}
  {today > 0 && <g><rect x={1300} y={980} width={420} height={70} fill="#efe9dc" {...ol(5)} /><text x={1510} y={1026} fontFamily="Mono" fontSize={30} textAnchor="middle" fill={P.ink}>ΣΧΟΛΗ ΑΡΙΣΤΟΤΕΛΟΥΣ</text></g>}
  {/* light shafts & floating seeds */}
  {!today && Array.from({ length: 18 }).map((_, i) => { const R = rng(i + 90); const p = (T * .05 + R()) % 1; return <circle key={'s' + i} cx={R() * 1900 + Math.sin(T + i) * 40} cy={200 + p * 800} r={3} fill="#fff8d0" opacity={.7 * Math.sin(p * Math.PI)} />; })}
</g>;

/* ---- the theatre at Aegae ---- */
export const Theatre: React.FC<{ T: number; panic?: number }> = ({ T, panic = 0 }) => <g>
  <Sky tone="day" T={T} />
  <Hills T={T} y={300} cyp={false} />
  {Array.from({ length: 9 }).map((_, r) => <path key={r} d={`M ${-240} ${330 + r * 56} Q 960 ${250 + r * 56 - 90} 2160 ${330 + r * 56}`} stroke={A.limeD} strokeWidth={44} fill="none" />)}
  {Array.from({ length: 9 }).map((_, r) => <path key={'l' + r} d={`M ${-240} ${352 + r * 56} Q 960 ${272 + r * 56 - 90} 2160 ${352 + r * 56}`} stroke={P.ink} strokeWidth={4} fill="none" />)}
  {Array.from({ length: 9 }).map((_, r) => Array.from({ length: 26 }).map((_, i) => { const R = rng(i * 13 + r * 7); const x = -200 + i * 92 + (r % 2) * 46; const yb = 318 + r * 56 - 90 * (1 - Math.pow((x - 960) / 1200, 2)); const j = panic ? Math.sin(T * 9 + i + r) * 8 * panic : 0;
    return <g key={r + '-' + i} transform={`translate(${x + j} ${yb + 6})`}><path d="M -18 0 Q -18 -34 0 -36 Q 18 -34 18 0 Z" fill={['#efe6d2', '#8a2a2a', '#3a5f88', '#d9a441', '#5a2a6a', '#6a7a3a'][Math.floor(R() * 6)]} stroke={P.ink} strokeWidth={3} /><circle cy={-46} r={13} fill={['#e8b88a', '#d9a070', '#c88a5a'][Math.floor(R() * 3)]} stroke={P.ink} strokeWidth={3} />{panic > .3 && R() > .5 && <rect x={8} y={-86} width={7} height={30} rx={3} fill="#d9a070" stroke={P.ink} strokeWidth={2} />}</g>; }))}
  <ellipse cx={960} cy={1000} rx={1200} ry={260} fill={A.marble} {...ol()} />
  <ellipse cx={960} cy={1000} rx={1000} ry={200} fill="none" stroke={A.limeD} strokeWidth={8} />
</g>;
/* ---- Corinth: Diogenes's clay jar in the sun ---- */
export const Pithos: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s}) rotate(-80)`}>
  <path d="M -150 -40 C -170 -260 170 -260 150 -40 C 150 120 60 170 0 170 C -60 170 -150 120 -150 -40 Z" fill={A.terra} {...ol()} />
  <ellipse cx={0} cy={-210} rx={70} ry={24} fill="#2a1a12" {...ol(6)} />
  {[0, 1, 2].map((k) => <path key={k} d={`M -140 ${-100 + k * 70} Q 0 ${-120 + k * 70} 140 ${-100 + k * 70}`} stroke="#8a4a2a" strokeWidth={6} fill="none" />)}
  <path d="M -60 40 L -20 80 L -40 120" stroke="#5a2a1a" strokeWidth={5} fill="none" />
</g>;
export const Agora: React.FC<{ T: number }> = ({ T }) => <g>
  <Sky tone="day" T={T} />
  <circle cx={1580} cy={180} r={90} fill="#ffe08a" /><circle cx={1580} cy={180} r={140} fill="#ffe08a" opacity={.25} />
  {Array.from({ length: 12 }).map((_, k) => { const a = k / 12 * Math.PI * 2 + T * .1; return <line key={k} x1={1580 + Math.cos(a) * 160} y1={180 + Math.sin(a) * 160} x2={1580 + Math.cos(a) * 230} y2={180 + Math.sin(a) * 230} stroke="#ffe08a" strokeWidth={8} strokeLinecap="round" />; })}
  <path d="M -240 560 L 600 560 L 600 380 L 640 360 L 1000 360 L 1040 380 L 1040 560 L 2160 560 L 2160 1300 L -240 1300 Z" fill={A.lime} {...ol(6)} />
  {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={640 + i * 70} y={380} width={24} height={180} fill={A.marble} {...ol(4)} />)}
  <rect x={-240} y={700} width={W} height={600} fill="#d8c8a0" />
  {Array.from({ length: 30 }).map((_, i) => <line key={'t' + i} x1={-240 + i * 90} y1={700} x2={-300 + i * 90} y2={1300} stroke="#c8b890" strokeWidth={3} />)}
</g>;

/* ---- Hellespont crossing ---- */
export const Hellespont: React.FC<{ T: number }> = ({ T }) => <g>
  <Sky tone="dawn" T={T} />
  <path d="M -240 520 C 400 480 900 540 2160 500 L 2160 560 L -240 560 Z" fill="#8a9a8a" opacity={.7} />
  <Sea y={540} T={T} />
  <path d="M 900 1300 C 1100 900 1500 860 2160 840 L 2160 1300 Z" fill={A.sand} {...ol(6)} />
  <path d="M 1100 1300 C 1250 1000 1600 960 2160 960 L 2160 1300 Z" fill={A.sandD} />
</g>;
/* ---- the river Granicus: Macedonians in the water, Persian cavalry on a steep far bank ---- */
export const Granicus: React.FC<{ T: number; dust?: number }> = ({ T, dust = 0 }) => <g>
  <Sky tone="dusk" T={T} />
  <Hills T={T} y={460} tone="dusk" cyp={false} />
  <path d="M 1000 460 C 1200 500 1300 620 1340 1300 L 2160 1300 L 2160 460 Z" fill="#8a6a4a" {...ol(6)} />
  <path d="M 1080 520 L 1340 1300" stroke="#6a4a2a" strokeWidth={14} />
  <path d="M -240 620 C 300 600 700 620 1100 600 C 1250 700 1300 900 1340 1300 L -240 1300 Z" fill={A.river} {...ol(6)} />
  {Array.from({ length: 34 }).map((_, i) => { const R = rng(i + 20); const x = ((R() * 1500 + T * 50) % 1500) - 240, y = 640 + R() * 640; return <path key={i} d={`M ${x} ${y} q 30 -12 60 0 q 30 -12 60 0`} stroke="#fff" strokeOpacity={.4} strokeWidth={4} fill="none" />; })}
  {dust > 0 && <Dust T={T} x={1600} y={700} w={1000} o={dust} />}
</g>;
/* ---- Gordion: the ox-cart and the knot ---- */
export const Knot: React.FC<{ x: number; y: number; s?: number; cut?: number; pin?: number; T?: number }> = ({ x, y, s = 1, cut = 0, pin = 0, T = 0 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-380} y={-30} width={300} height={36} fill="#8a5a34" {...ol(6)} />
  <rect x={80} y={-30} width={300} height={36} fill="#8a5a34" {...ol(6)} transform={cut ? `translate(${cut * 40} ${cut * 30}) rotate(${cut * 8})` : undefined} />
  <g transform={`translate(0 -12) rotate(${cut * 40})`} opacity={1 - cut * .5}>
    {Array.from({ length: 26 }).map((_, i) => { const a = i * 2.39; const r = 40 + (i % 5) * 18; return <ellipse key={i} cx={Math.cos(a) * 20} cy={Math.sin(a) * 14} rx={r} ry={r * .55} transform={`rotate(${i * 37})`} fill="none" stroke={i % 2 ? '#8a6a3a' : '#a8864a'} strokeWidth={9} />; })}
    {Array.from({ length: 26 }).map((_, i) => { const a = i * 2.39; const r = 40 + (i % 5) * 18; return <ellipse key={'o' + i} cx={Math.cos(a) * 20} cy={Math.sin(a) * 14} rx={r} ry={r * .55} transform={`rotate(${i * 37})`} fill="none" stroke={P.ink} strokeWidth={2} />; })}
  </g>
  <rect x={-12 + pin * 200} y={-150 - pin * 100} width={24} height={200} rx={8} fill="#6a4426" {...ol(5)} transform={`rotate(${pin * 30})`} />
</g>;
export const Temple: React.FC<{ T: number }> = ({ T }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill="#4a3a2c" />
  {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-200 + i * 300} y={-200} width={70} height={1100} fill="#5a4838" {...ol(5)} />)}
  {[[200, 600], [1720, 600]].map(([x, y], k) => <Torch key={k} x={x} y={y + 300} T={T} />)}
  <rect x={-240} y={900} width={W} height={400} fill="#6a5644" />
  <g transform="translate(960 900)"><rect x={-500} y={-180} width={1000} height={120} fill="#7a5634" {...ol(6)} />{[-360, 360].map((q) => <g key={q} transform={`translate(${q} -60)`}><circle r={90} fill="none" stroke={P.ink} strokeWidth={16} /><circle r={90} fill="none" stroke="#8a5a34" strokeWidth={8} />{[0, 1, 2, 3].map((k) => <line key={k} x1={0} y1={0} x2={Math.cos(k * .785) * 88} y2={Math.sin(k * .785) * 88} stroke={P.ink} strokeWidth={8} />)}</g>)}</g>
</g>;

/* ---- Persian army & Darius's royal tent ---- */
export const Host: React.FC<{ T: number; rows: number; per: number; x0: number; y0: number; dx?: number; dy?: number; s0?: number; flip?: boolean; seed?: number; flee?: number; kind?: 'persian' | 'indian' }> = ({ T, rows, per, x0, y0, dx = 90, dy = -26, s0 = .55, flip, seed = 0, flee = 0, kind = 'persian' }) => <g>
  {Array.from({ length: rows }).map((_, r) => { const rr = rows - 1 - r; return <g key={r}>{Array.from({ length: per }).map((_, i) => { const R = rng(i * 11 + rr * 5 + seed); const s = s0 * (1 - rr * .08);
    const run = flee > 0 && R() < flee; const xx = x0 + i * dx * (1 - rr * .07) + (rr % 2) * dx * .5 + R() * 18 + (run ? T * 260 * (flip ? -1 : 1) % 900 : 0);
    return <MChar key={i} look={kind === 'indian' ? indian(i + rr + seed) : persian(i + rr * 2 + seed)} x={xx} y={y0 + rr * dy} s={s} flip={run ? !flip : flip}
      pose={{ walk: run ? 1 : 0, run: run ? 1 : 0, phase: T * 14 + i, holdF: run ? 'none' : i % 3 === 0 ? 'axe' : 'spear', armF: run ? -2.6 : -.5, elbowF: .7, propA: 20, expr: run ? 'scared' : 'neutral', shieldUp: .3, bob: Math.sin(T * 3 + i) * 2 }} />; })}</g>; })}
</g>;
export const RoyalTent: React.FC<{ T: number }> = ({ T }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill="#3a1a3a" />
  {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${-240 + i * 210} -200 Q ${-135 + i * 210} 200 ${-240 + i * 210} 900`} stroke={i % 2 ? '#5a2a5a' : '#4a2a4a'} strokeWidth={110} fill="none" />)}
  {Array.from({ length: 12 }).map((_, i) => <line key={'g' + i} x1={-240 + i * 210} y1={-200} x2={-240 + i * 210} y2={900} stroke={A.gold} strokeWidth={4} opacity={.6} />)}
  <rect x={-240} y={160} width={W} height={60} fill={A.gold} opacity={.85} />
  {Array.from({ length: 24 }).map((_, i) => <circle key={'r' + i} cx={-200 + i * 100} cy={190} r={14} fill="#8a1a2a" stroke={P.ink} strokeWidth={3} />)}
  {[[260, 860], [1660, 860]].map(([x, y], k) => <g key={k} transform={`translate(${x} ${y})`}><rect x={-14} y={-260} width={28} height={260} fill={A.gold} {...ol(4)} /><circle cy={-300} r={180} fill="url(#fireGlow)" opacity={.6 + Math.sin(T * 8 + k) * .08} /><path d={`M -30 -262 Q -24 ${-320 - Math.sin(T * 9 + k) * 10} 0 ${-340 - Math.sin(T * 7 + k) * 12} Q 24 -320 30 -262 Z`} fill={A.fire} {...ol(4)} /></g>)}
  <rect x={-240} y={900} width={W} height={400} fill="#6a1a2a" />
  <g transform="translate(960 1040)"><rect x={-700} y={-110} width={1400} height={220} fill="#8a2a3a" {...ol(6)} /><rect x={-660} y={-80} width={1320} height={160} fill="none" stroke={A.gold} strokeWidth={8} />
    {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M ${-600 + i * 133} -40 l 30 40 l -30 40 l -30 -40 Z`} fill={A.gold} opacity={.8} />)}</g>
</g>;
/* ---- Gaugamela plain ---- */
export const Plain: React.FC<{ T: number; tone?: Tone; dust?: number; flat?: number }> = ({ T, tone = 'day', dust = 0, flat = 1 }) => <g>
  <Sky tone={tone} T={T} />
  <path d="M -240 560 C 400 530 900 560 1400 540 C 1800 530 2000 550 2160 545 L 2160 1300 L -240 1300 Z" fill="#b8a070" {...ol(5)} />
  <rect x={-240} y={600} width={W} height={700} fill="#c8b07a" />
  {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 77); return <path key={i} d={`M ${R() * 2400 - 240} ${640 + R() * 600} l 40 0`} stroke="#a8905a" strokeWidth={4} opacity={flat} />; })}
  {dust > 0 && <Dust T={T} x={960} y={760} w={2600} o={dust} />}
</g>;
/* ---- the phalanx: 16 deep, sarissas lowered for the first five ranks ---- */
export const Phalanx: React.FC<{ T: number; x0: number; y0: number; files?: number; ranks?: number; s0?: number; level?: number; open?: number; march?: number; flip?: boolean; seed?: number; dx?: number }> = ({ T, x0, y0, files = 12, ranks = 6, s0 = .5, level = 1, open = 0, march = 0, flip, seed = 0, dx = 70 }) => <g>
  {Array.from({ length: ranks }).map((_, r) => { const rr = ranks - 1 - r; const s = s0 * (1 - rr * .06); const front = rr < 5;
    const ang = lerp(0, front ? 90 - rr * 4 : 20 + (rr - 5) * 6, level);
    return <g key={r}>{Array.from({ length: files }).map((_, i) => { const lane = open && i % 4 === 2 ? 1 : 0; const shift = lane ? 0 : (i % 4 < 2 ? -1 : 1) * open * 26;
      const xx = x0 + (flip ? -1 : 1) * (i * dx * (1 - rr * .05) + rr * 18) + shift + march * T * 40 * (flip ? -1 : 1); const yy = y0 - rr * 22;
      return <MChar key={i} look={macedon(i + rr * 3 + seed)} x={xx} y={yy} s={s} flip={flip}
        pose={{ holdF: 'sarissa', armF: lerp(-.3, -1.1, level), elbowF: lerp(.3, .6, level), propA: ang, walk: march, phase: T * 7 + rr * .3, shieldUp: .4, expr: front && level > .5 ? 'fierce' : 'neutral', blink: 0 }} />; })}</g>; })}
</g>;
/* ---- Persepolis: Apadana columns with bull capitals; optional fire ---- */
export const Persepolis: React.FC<{ T: number; fire?: number; night?: boolean; gold?: number }> = ({ T, fire = 0, night, gold = 0 }) => <g>
  <Sky tone={night ? 'night' : 'day'} T={T} />
  <path d="M -240 520 L 300 380 L 700 470 L 1100 360 L 1600 460 L 2160 420 L 2160 700 L -240 700 Z" fill={night ? '#3a3440' : '#a89878'} {...ol(5)} />
  {Array.from({ length: 9 }).map((_, i) => { const cx = -100 + i * 270; return <g key={i}><rect x={cx - 22} y={160} width={44} height={640} fill={night ? '#6a6058' : '#d8ccb0'} {...ol(5)} />{Array.from({ length: 6 }).map((_, k) => <line key={k} x1={cx - 14 + k * 6} y1={180} x2={cx - 14 + k * 6} y2={790} stroke={night ? '#5a5048' : '#b8ac90'} strokeWidth={2} />)}
    <g transform={`translate(${cx} 160)`}><path d="M -90 0 Q -110 -50 -70 -60 L 70 -60 Q 110 -50 90 0 Z" fill={night ? '#6a6058' : '#d8ccb0'} {...ol(5)} /><circle cx={-74} cy={-36} r={8} fill={P.ink} /><circle cx={74} cy={-36} r={8} fill={P.ink} /><path d="M -110 -50 l -20 -20 M 110 -50 l 20 -20" stroke={P.ink} strokeWidth={6} /></g></g>; })}
  <rect x={-240} y={60} width={W} height={50} fill={A.cedar} {...ol(5)} />
  <rect x={-240} y={800} width={W} height={500} fill={night ? '#4a4038' : '#c8b898'} />
  {Array.from({ length: 20 }).map((_, i) => <g key={'f' + i} transform={`translate(${-200 + i * 120} 800)`}><rect x={-30} y={0} width={60} height={40} fill={night ? '#3a3028' : '#b8a888'} stroke={P.ink} strokeWidth={3} /><path d="M -20 30 l 10 -24 l 10 24 M 2 30 l 10 -24 l 10 24" stroke={P.ink} strokeWidth={3} fill="none" /></g>)}
  {gold > 0 && Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 31); return <g key={'g' + i} transform={`translate(${200 + R() * 1500} ${900 + R() * 260})`}><ellipse rx={30} ry={10} fill={A.gold} stroke={P.ink} strokeWidth={3} /><ellipse cy={-6} rx={30} ry={10} fill="#f0c860" stroke={P.ink} strokeWidth={3} /></g>; })}
  {fire > 0 && <g opacity={fire}><rect x={-240} y={-200} width={W} height={1500} fill="#ff6a20" opacity={.18} />
    {Array.from({ length: 12 }).map((_, k) => { const fx = -100 + k * 200; return <path key={k} d={`M ${fx - 90} 820 Q ${fx - 70} ${400 - Math.sin(T * 7 + k) * 60} ${fx} ${200 - Math.sin(T * 9 + k) * 80} Q ${fx + 70} ${400 - Math.cos(T * 8 + k) * 60} ${fx + 90} 820 Z`} fill={A.fire} {...ol(5)} />; })}
    <Smoke T={T} x={600} y={300} s={1.4} /><Smoke T={T} x={1400} y={260} s={1.6} /></g>}
</g>;
/* ---- the feast at Maracanda (Samarkand): couches, lamps, wine ---- */
export const Feast: React.FC<{ T: number; chaos?: number; dark?: number }> = ({ T, chaos = 0, dark = 0 }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill="#2a1420" />
  {Array.from({ length: 10 }).map((_, i) => <g key={i}><rect x={-200 + i * 250} y={-200} width={220} height={760} fill={i % 2 ? '#5a2030' : '#4a1a2a'} /><path d={`M ${-200 + i * 250} 560 l 110 50 l 110 -50`} fill={i % 2 ? '#5a2030' : '#4a1a2a'} /><path d={`M ${-150 + i * 250} 100 l 60 -60 l 60 60 l -60 60 Z`} fill="none" stroke={A.gold} strokeWidth={5} opacity={.6} /></g>)}
  {[[180, 640], [960, 520], [1740, 640]].map(([x, y], k) => <g key={'l' + k} transform={`translate(${x} ${y})`}><circle r={240} fill="url(#fireGlow)" opacity={.55 + Math.sin(T * 8 + k) * .06} /><line x1={0} y1={0} x2={0} y2={-500} stroke={P.ink} strokeWidth={4} /><path d="M -50 0 Q 0 30 50 0 Z" fill={A.gold} {...ol(4)} /><path d={`M 30 -4 Q 36 ${-30 - Math.sin(T * 9 + k) * 6} 44 -40 Q 50 -20 46 -4 Z`} fill={A.fire} /></g>)}
  <rect x={-240} y={880} width={W} height={420} fill="#4a2018" />
  {Array.from({ length: 14 }).map((_, i) => <path key={'c' + i} d={`M ${-240 + i * 180} 1300 L ${-140 + i * 180} 880`} stroke="#3a1610" strokeWidth={4} />)}
  {[[340, 960], [1580, 960]].map(([x, y], k) => <g key={'k' + k} transform={`translate(${x} ${y})`}><rect x={-260} y={-90} width={520} height={60} rx={20} fill="#8a3a4a" {...ol(6)} /><rect x={-250} y={-30} width={20} height={60} fill={A.gold} /><rect x={230} y={-30} width={20} height={60} fill={A.gold} /><ellipse cx={-220} cy={-110} rx={60} ry={34} fill="#d9a441" {...ol(5)} /></g>)}
  <g transform={`translate(${960 + chaos * 120} 960) rotate(${chaos * 70})`}><path d="M -70 -120 Q -90 -40 -50 0 L 50 0 Q 90 -40 70 -120 Z" fill={A.terra} {...ol(6)} /><path d="M -60 -90 L 60 -90" stroke={P.ink} strokeWidth={14} opacity={.8} /></g>
  {chaos > 0 && <ellipse cx={1100} cy={1010} rx={160 * chaos} ry={24 * chaos} fill="#5a1020" opacity={.85} />}
  {dark > 0 && <rect x={-240} y={-200} width={W} height={1500} fill="#000" opacity={dark} />}
</g>;
/* ---- Hydaspes in the monsoon ---- */
export const Rain: React.FC<{ T: number; o?: number; n?: number }> = ({ T, o = 1, n = 160 }) => <g opacity={o}>{Array.from({ length: n }).map((_, i) => { const R = rng(i + 700); const y = ((R() * 1500 + T * 1400) % 1500) - 200; const x = ((R() * 2600 - T * 200) % 2600 + 2600) % 2600 - 340; return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 46} stroke="#cfe0f0" strokeWidth={2.5} opacity={.6} />; })}</g>;
export const Palm: React.FC<{ x: number; y: number; s?: number; T?: number }> = ({ x, y, s = 1, T = 0 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -10 0 Q -30 -200 10 -380 L 26 -380 Q 0 -200 14 0 Z" fill="#7a5a3a" {...ol(5)} />
  {Array.from({ length: 7 }).map((_, k) => { const a = -Math.PI + k * Math.PI / 6 + Math.sin(T * 1.5 + k) * .06; return <path key={k} d={`M 18 -380 Q ${18 + Math.cos(a) * 120} ${-380 + Math.sin(a) * 120 - 40} ${18 + Math.cos(a) * 220} ${-380 + Math.sin(a) * 160 + 40}`} stroke={A.jungle} strokeWidth={26} fill="none" strokeLinecap="round" />; })}</g>;
export const Hydaspes: React.FC<{ T: number; storm?: number; bank?: boolean }> = ({ T, storm = 0, bank = true }) => <g>
  <Sky tone={storm ? 'night' : 'day'} T={T} />
  {storm > 0 && ((T * 7) % 5) < .12 && <rect x={-240} y={-200} width={W} height={1500} fill="#fff" opacity={.6} />}
  <path d="M -240 520 C 300 480 900 520 2160 490 L 2160 600 L -240 600 Z" fill={storm ? '#1f3a2a' : A.jungleD} {...ol(5)} />
  {[[-100, 560, .8], [180, 560, 1], [1600, 560, .9], [1900, 560, .75]].map(([x, y, s], k) => <Palm key={k} x={x} y={y} s={s} T={T} />)}
  <rect x={-240} y={590} width={W} height={260} fill={storm ? '#2a4a5a' : A.river} />
  {Array.from({ length: 26 }).map((_, i) => { const R = rng(i + 30); const x = ((R() * 2400 + T * 70) % 2400) - 240, y = 600 + R() * 240; return <path key={i} d={`M ${x} ${y} q 30 -10 60 0`} stroke="#fff" strokeOpacity={.35} strokeWidth={4} fill="none" />; })}
  {bank && <rect x={-240} y={840} width={W} height={460} fill={storm ? '#3a4a2a' : '#7a8a4a'} />}
  {storm > 0 && <Rain T={T} o={storm} />}
</g>;
/* ---- Gedrosian desert ---- */
export const Desert: React.FC<{ T: number; haze?: number }> = ({ T, haze = 1 }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill="#f0c890" />
  <circle cx={1500} cy={170} r={110} fill="#fff6d0" /><circle cx={1500} cy={170} r={200} fill="#fff6d0" opacity={.3} />
  {[[620, '#e0b070'], [760, '#d8a460'], [920, '#c99050']].map(([y, c], k) => <path key={k} d={`M -240 ${y} C 200 ${(y as number) - 80} 500 ${(y as number) + 40} 900 ${(y as number) - 50} C 1300 ${(y as number) - 120} 1700 ${(y as number) + 30} 2160 ${(y as number) - 60} L 2160 1300 L -240 1300 Z`} fill={c as string} {...ol(5)} />)}
  {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M -240 ${560 + i * 18 + Math.sin(T * 3 + i) * 6} Q 960 ${540 + i * 18 + Math.cos(T * 2.5 + i) * 10} 2160 ${560 + i * 18}`} stroke="#fff" strokeOpacity={.12 * haze} strokeWidth={8} fill="none" />)}
  {[[300, 1080], [1640, 1100]].map(([x, y], k) => <g key={k} transform={`translate(${x} ${y})`}><path d="M -80 0 Q -60 -30 0 -36 Q 60 -30 80 0 Z" fill="#efe6d2" stroke={P.ink} strokeWidth={4} /><path d="M -30 -20 l 60 0 M -20 -30 l 40 0" stroke="#c8b898" strokeWidth={6} /></g>)}
</g>;
/* ---- Babylon palace bedroom (glazed brick, lions) ---- */
export const Babylon: React.FC<{ T: number; dim?: number }> = ({ T, dim = 0 }) => <g>
  <rect x={-240} y={-200} width={W} height={1500} fill={A.glaze} />
  {Array.from({ length: 16 }).map((_, r) => Array.from({ length: 16 }).map((_, c) => <rect key={r + '-' + c} x={-240 + c * 160 + (r % 2) * 80} y={-200 + r * 70} width={156} height={66} fill={(r + c) % 5 ? A.glaze : '#3a6aa8'} stroke={A.glazeD} strokeWidth={4} />))}
  {[0, 1, 2].map((k) => <g key={k} transform={`translate(${200 + k * 700} 420)`}><path d="M -120 0 C -110 -60 -40 -80 20 -70 C 60 -110 110 -90 120 -50 L 130 0 L 100 0 L 96 -30 L -70 -30 L -80 0 Z" fill="#e8c060" {...ol(5)} /><path d="M 80 -96 Q 120 -130 140 -80" stroke="#d08a30" strokeWidth={14} fill="none" /></g>)}
  <rect x={-240} y={300} width={W} height={20} fill="#efe6d2" /><rect x={-240} y={500} width={W} height={20} fill="#efe6d2" />
  {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={-200 + i * 84} cy={310} r={6} fill="#efe6d2" />)}
  <rect x={-240} y={880} width={W} height={420} fill="#5a3a2a" />
  <g transform="translate(960 900)"><rect x={-520} y={-120} width={1040} height={110} rx={20} fill="#efe6d2" {...ol(6)} /><rect x={-540} y={-10} width={1080} height={60} fill={A.cedar} {...ol(6)} />{[-520, 500].map((q) => <rect key={q} x={q} y={40} width={30} height={80} fill={A.gold} {...ol(4)} />)}<path d="M -520 -120 L -520 -260 Q -480 -300 -440 -260 L -440 -120" fill={A.cedar} {...ol(6)} /></g>
  {[[120, 860], [1800, 860]].map(([x, y], k) => <Torch key={k} x={x} y={y} T={T} />)}
  {dim > 0 && <rect x={-240} y={-200} width={W} height={1500} fill="#05060c" opacity={dim} />}
</g>;
/* ---- Alexandria, the lost tomb (silhouette of the city + Pharos) ---- */
export const Alexandria: React.FC<{ T: number }> = ({ T }) => <g>
  <Sky tone="dusk" T={T} />
  <Sea y={700} T={T} dark />
  <g fill="#2a1a2a">{Array.from({ length: 22 }).map((_, i) => { const R = rng(i + 5); const h = 80 + R() * 200; return <rect key={i} x={-200 + i * 90} y={700 - h} width={80} height={h} />; })}
    <path d="M 1500 700 L 1520 300 L 1600 300 L 1620 700 Z M 1530 300 L 1540 160 L 1580 160 L 1590 300 Z M 1550 160 L 1560 90 L 1570 160 Z" /></g>
  <circle cx={1560} cy={110} r={40} fill="#ffd27a" opacity={.6 + Math.sin(T * 3) * .2} />
  <g transform="translate(700 520)"><path d="M -160 0 L 0 -150 L 160 0 Z" fill="#3a2a3a" stroke="#d9a441" strokeWidth={4} /><text x={0} y={-30} fontFamily="Cinzel" fontWeight={900} fontSize={90} textAnchor="middle" fill="#d9a441">?</text></g>
</g>;
