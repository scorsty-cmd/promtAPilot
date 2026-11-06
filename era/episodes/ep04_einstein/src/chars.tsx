import React from 'react';
import { clamp, lerp } from './lib';
import { P } from './art';

/* ===== Einstein cast — v4 rig: 1900s dress, wild hair, moustaches, glasses,
   NEW: real sitting pose (thigh + shin joints) and an expression system (brows, lids, laugh eyes) ===== */
export type Mouth = 'smile' | 'grin' | 'O' | 'flat' | 'sad' | 'talk' | 'shout' | 'smirk';
export type Expr = 'neutral' | 'happy' | 'laugh' | 'surprised' | 'angry' | 'worried' | 'thinking' | 'sad' | 'excited' | 'sleepy';
export type MLook = {
  skin: string; skinS: string; hair: string;
  hairStyle: 'wild' | 'wildYoung' | 'parted' | 'slick' | 'bun' | 'bald' | 'short' | 'curly' | 'bob';
  outfit: 'suit' | 'sweater' | 'dress' | 'gown' | 'coat' | 'uniform';
  cloth: string; cloth2: string; shirt?: string; tie?: 'tie' | 'bow' | 'none'; tieC?: string; vest?: string;
  moustache?: 'bushy' | 'thin' | 'walrus' | 'brush'; beard?: 'goatee' | 'full' | 'stubble'; glasses?: 'round' | 'pince';
  hat?: 'bowler' | 'fedora' | 'cap' | 'none'; wrinkles?: boolean; eyeS?: number; broad?: number; nose?: 'big' | 'small'; tall?: number;
};
const SK = { a: ['#ecc9a4', '#cfa682'], b: ['#e2b48a', '#c4936a'], c: ['#d9a578', '#b8845a'], d: ['#f0d2b2', '#d4b08e'], e: ['#c99468', '#a8744c'] };
const G = (o: Partial<MLook>): MLook => ({ skin: SK.a[0], skinS: SK.a[1], hair: '#3a2416', hairStyle: 'short', outfit: 'suit', cloth: '#4a4a52', cloth2: '#3a3a42', shirt: '#f4efe2', tie: 'tie', tieC: '#7a2e2a', ...o });
export const CAST: Record<string, MLook> = {
  you: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#c8903a', hairStyle: 'parted', outfit: 'suit', cloth: '#b5652e', cloth2: '#4a3a30', vest: '#e8d6a8', tie: 'bow', tieC: '#2a2a3a' }),
  youOld: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#d8d2c6', hairStyle: 'parted', outfit: 'suit', cloth: '#b5652e', cloth2: '#4a3a30', vest: '#e8d6a8', tie: 'bow', tieC: '#2a2a3a', wrinkles: true, glasses: 'round', moustache: 'thin' }),
  ein: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#3a2a1e', hairStyle: 'wildYoung', outfit: 'suit', cloth: '#5a5e6a', cloth2: '#45484f', vest: '#7a6a52', tie: 'bow', tieC: '#1d1612', moustache: 'brush', eyeS: 1.08, nose: 'big' }),
  einMid: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#6a6058', hairStyle: 'wild', outfit: 'suit', cloth: '#4e4a44', cloth2: '#3e3a36', vest: '#6a5a46', tie: 'tie', tieC: '#5a2a26', moustache: 'bushy', eyeS: 1.08, nose: 'big', wrinkles: true }),
  einOld: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#f2efe8', hairStyle: 'wild', outfit: 'sweater', cloth: '#8a8a7e', cloth2: '#5a5a58', moustache: 'walrus', eyeS: 1.1, nose: 'big', wrinkles: true }),
  einBed: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#f2efe8', hairStyle: 'wild', outfit: 'gown', cloth: '#dfe6ea', cloth2: '#c8d2d8', moustache: 'walrus', eyeS: 1.05, nose: 'big', wrinkles: true }),
  sol: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#1d1410', hairStyle: 'parted', outfit: 'suit', cloth: '#3f5e4a', cloth2: '#2f3a32', tieC: '#c8a040', beard: 'goatee', glasses: 'pince' }),
  hab: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#8a5a2a', hairStyle: 'slick', outfit: 'suit', cloth: '#7a3b34', cloth2: '#3a2a26', tie: 'bow', tieC: '#e8d6a8', moustache: 'thin', broad: 1.08 }),
  mil: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#1d1410', hairStyle: 'bun', outfit: 'dress', cloth: '#3f4e6a', cloth2: '#3f4e6a', shirt: '#efe6d4', tie: 'none' }),
  bes: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#2a1a12', hairStyle: 'curly', outfit: 'suit', cloth: '#6a5a3a', cloth2: '#3a3226', tieC: '#3a5a7a', beard: 'full', moustache: 'bushy' }),
  gro: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#2a2a2a', hairStyle: 'parted', outfit: 'suit', cloth: '#2f3a4a', cloth2: '#262c36', tieC: '#8a2a2a', moustache: 'walrus', glasses: 'pince' }),
  edd: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#4a3a2a', hairStyle: 'parted', outfit: 'coat', cloth: '#d8ccaa', cloth2: '#6a5a46', tieC: '#2a3a5a', hat: 'none', tall: 1.06 }),
  bohr: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#6a5038', hairStyle: 'slick', outfit: 'suit', cloth: '#3a3e4a', cloth2: '#2a2e38', tieC: '#5a6a3a', broad: 1.1, nose: 'big', tall: 1.04 }),
  szi: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#3a2a1e', hairStyle: 'slick', outfit: 'suit', cloth: '#5a4a6a', cloth2: '#3a3446', tieC: '#c8a040', broad: 1.12 }),
  doc: G({ skin: SK.e[0], skinS: SK.e[1], hair: '#2a2a2a', hairStyle: 'short', outfit: 'coat', cloth: '#f2f2ee', cloth2: '#3a3a42', tieC: '#3a5a7a', glasses: 'round' }),
  nurse: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#5a3a26', hairStyle: 'bun', outfit: 'dress', cloth: '#f2f2ee', cloth2: '#f2f2ee', tie: 'none' }),
  boy: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#8a5a2a', hairStyle: 'short', outfit: 'sweater', cloth: '#3f5e4a', cloth2: '#4a3a30', hat: 'cap' }),
  todayG: G({ skin: '#8a5a3a', skinS: '#6a4228', hair: '#120c08', hairStyle: 'curly', outfit: 'sweater', cloth: '#d86a3a', cloth2: '#2a2f3a' }),
};
export const extra = (i: number): MLook => {
  const c = ['#4a4a52', '#5a4a3a', '#3f4e5a', '#6a5a46', '#2f3a32', '#5a3a3a', '#4e4a44', '#3a3e4a'][i % 8];
  const sk = [SK.a, SK.b, SK.c, SK.d, SK.e][(i * 3) % 5]; const h = ['#1d1410', '#3a2416', '#c8c2b6', '#6a5038', '#5a3a26'][(i * 7) % 5];
  return G({ skin: sk[0], skinS: sk[1], hair: h, hairStyle: (['parted', 'short', 'bald', 'slick'] as const)[(i * 5) % 4], cloth: c, cloth2: '#2a2a30', tieC: ['#7a2e2a', '#2a3a5a', '#c8a040'][i % 3],
    moustache: (['thin', undefined, 'walrus', 'brush', undefined] as const)[i % 5], beard: i % 6 === 2 ? 'full' : undefined, glasses: i % 4 === 1 ? 'pince' : undefined, wrinkles: h === '#c8c2b6', hat: i % 5 === 3 ? 'bowler' : 'none' });
};

export type Prop = 'none' | 'pipe' | 'violin' | 'chalk' | 'paper' | 'telegram' | 'newspaper' | 'teacup' | 'notebook' | 'watch' | 'pen' | 'plate' | 'glass' | 'letter' | 'box';
export type MPose = {
  walk?: number; phase?: number; armF?: number; armB?: number; elbowF?: number; elbowB?: number; tilt?: number; turn?: number; blink?: number;
  mouth?: Mouth; open?: number; brow?: number; lookX?: number; lookY?: number; bob?: number; crouch?: number;
  holdF?: Prop; holdB?: Prop; lean?: number; sit?: number; expr?: Expr; lie?: number;
};
const OL = 7;
const HAND = 'M -10 -4 C -13 7 -10 17 -1 19 C 8 20 12 12 11 1 C 10 -5 4 -7 -2 -7 Z';
const THUMB = 'M 7 -1 C 16 -3 19 6 11 10';

/* expression presets: brow raise, brow tilt (+ = angry/inner down, - = worried), lid (0 open .. 1 shut), wide eyes, default mouth */
const EX: Record<Expr, { raise: number; tilt: number; lid: number; wide: number; mouth: Mouth; laugh?: boolean; asym?: number }> = {
  neutral: { raise: 0, tilt: 0, lid: 0, wide: 1, mouth: 'flat' },
  happy: { raise: .6, tilt: -.2, lid: .2, wide: 1, mouth: 'smile' },
  laugh: { raise: 1, tilt: -.3, lid: 0, wide: 1, mouth: 'grin', laugh: true },
  surprised: { raise: 2.4, tilt: -.2, lid: 0, wide: 1.22, mouth: 'O' },
  excited: { raise: 1.6, tilt: -.3, lid: 0, wide: 1.12, mouth: 'grin' },
  angry: { raise: -1, tilt: 1.3, lid: .25, wide: .95, mouth: 'flat' },
  worried: { raise: 1.1, tilt: -1.2, lid: .1, wide: 1.02, mouth: 'sad' },
  thinking: { raise: .4, tilt: 0, lid: .3, wide: 1, mouth: 'smirk', asym: 1.6 },
  sad: { raise: .5, tilt: -1.3, lid: .45, wide: 1, mouth: 'sad' },
  sleepy: { raise: -.2, tilt: 0, lid: .7, wide: 1, mouth: 'flat' },
};

export const MChar: React.FC<{ look: MLook; pose?: MPose; x: number; y: number; s?: number; flip?: boolean; age?: number; opacity?: number }> =
  ({ look, pose = {}, x, y, s = 1, flip = false, age = 1, opacity = 1 }) => {
    const { walk = 0, phase = 0, armF = .15, armB = -.15, elbowF = .35, elbowB = .25, tilt = 0, turn = .35, blink = 0, open = 0,
      brow = 0, lookX = 0, lookY = 0, bob = 0, crouch = 0, holdF = 'none', holdB = 'none', lean = 0, sit = 0, expr = 'neutral' } = pose;
    const E = EX[expr]; const mouth: Mouth = pose.mouth ?? E.mouth;
    const kid = clamp(1 - age, 0, 1);
    const body = lerp(1, .64, kid) * (look.tall || 1), headS = lerp(1, 1.12, kid);
    const sw = Math.sin(phase) * .55 * walk * (1 - sit);
    const lift = walk ? Math.abs(Math.sin(phase)) * 6 * walk : 0;
    const legL = 82 * body, torsoH = 104 * body, thigh = legL * .62, shin = legL * .54;
    const hipY = lerp(-legL + crouch * 18 - lift, -shin + 4, sit) + bob;
    const shY = hipY - torsoH, headY = shY - 56 * headS;
    const ol = { stroke: P.ink, strokeWidth: OL, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
    const L = look; const skirt = L.outfit === 'dress' || L.outfit === 'gown';
    const U = 46 * body, Fa = 44 * body;
    const sleeve = L.outfit === 'sweater' ? L.cloth : L.outfit === 'dress' || L.outfit === 'gown' ? L.cloth : L.cloth;

    const prop = (p: Prop) => {
      switch (p) {
        case 'pipe': return <g><path d="M -4 -6 L 30 -16" stroke={P.ink} strokeWidth={9} strokeLinecap="round" /><path d="M 26 -30 L 44 -30 L 42 -6 Q 35 0 28 -6 Z" fill="#6a3a1e" stroke={P.ink} strokeWidth={4} /></g>;
        case 'violin': return <g transform="rotate(-60)"><path d="M -18 -40 C -34 -40 -34 -14 -20 -10 C -34 -4 -34 26 -16 26 L 16 26 C 34 26 34 -4 20 -10 C 34 -14 34 -40 18 -40 Z" fill="#a8522a" {...ol} strokeWidth={5} /><rect x={-5} y={-110} width={10} height={72} fill="#2a1a12" /><path d="M -8 -4 L 8 -4" stroke={P.ink} strokeWidth={4} /></g>;
        case 'chalk': return <rect x={-4} y={-18} width={8} height={18} rx={2} fill="#f4f2ea" stroke={P.ink} strokeWidth={3} />;
        case 'paper': return <g transform="rotate(-8)"><rect x={-32} y={-58} width={64} height={80} fill="#f6f0e0" {...ol} strokeWidth={4} />{[0, 1, 2, 3, 4].map((k) => <line key={k} x1={-22} y1={-44 + k * 12} x2={18 - (k % 2) * 12} y2={-44 + k * 12} stroke="#5a5a6a" strokeWidth={3} />)}</g>;
        case 'telegram': return <g transform="rotate(-6)"><rect x={-40} y={-44} width={80} height={52} fill="#f0dca0" {...ol} strokeWidth={4} /><rect x={-30} y={-34} width={60} height={8} fill="#5a3a1e" /><line x1={-30} y1={-16} x2={22} y2={-16} stroke="#5a5a6a" strokeWidth={3} /><line x1={-30} y1={-4} x2={10} y2={-4} stroke="#5a5a6a" strokeWidth={3} /></g>;
        case 'newspaper': return <g transform="rotate(-4)"><rect x={-60} y={-80} width={120} height={90} fill="#ece6d6" {...ol} strokeWidth={4} /><rect x={-50} y={-70} width={100} height={14} fill={P.ink} /><rect x={-50} y={-48} width={46} height={44} fill="#b8b0a0" />{[0, 1, 2].map((k) => <line key={k} x1={4} y1={-44 + k * 14} x2={50} y2={-44 + k * 14} stroke="#5a5a6a" strokeWidth={3} />)}</g>;
        case 'teacup': return <g><path d="M -16 -26 L 16 -26 L 12 0 L -12 0 Z" fill="#f4f0e6" {...ol} strokeWidth={4} /><path d="M 16 -20 q 12 2 2 12" fill="none" stroke={P.ink} strokeWidth={4} /><ellipse cx={0} cy={2} rx={22} ry={5} fill="#e8e0d0" stroke={P.ink} strokeWidth={3} /></g>;
        case 'notebook': return <g><rect x={-36} y={-50} width={72} height={52} rx={3} fill="#3a4a3a" {...ol} strokeWidth={4} /><rect x={-30} y={-44} width={60} height={40} fill="#f2ecdc" /></g>;
        case 'watch': return <g><circle cx={0} cy={-12} r={14} fill="#d8b04a" {...ol} strokeWidth={4} /><circle cx={0} cy={-12} r={9} fill="#f6f0e0" /><path d="M 0 -12 L 0 -18 M 0 -12 L 5 -10" stroke={P.ink} strokeWidth={2} /></g>;
        case 'pen': return <line x1={0} y1={0} x2={20} y2={-34} stroke={P.ink} strokeWidth={6} strokeLinecap="round" />;
        case 'plate': return <g><ellipse cx={10} cy={-4} rx={40} ry={11} fill="#f4f0e6" {...ol} strokeWidth={4} /><ellipse cx={10} cy={-8} rx={20} ry={5} fill="#2a2a2a" /></g>;
        case 'glass': return <g><path d="M -10 -34 L 10 -34 L 8 0 L -8 0 Z" fill="rgba(220,235,240,.7)" stroke={P.ink} strokeWidth={4} /></g>;
        case 'letter': return <g transform="rotate(-4)"><rect x={-36} y={-70} width={72} height={92} fill="#f6f0e0" {...ol} strokeWidth={4} />{[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={-26} y1={-56 + k * 12} x2={24 - (k % 3) * 8} y2={-56 + k * 12} stroke="#3a3a5a" strokeWidth={2.5} />)}</g>;
        case 'box': return <g><rect x={-40} y={-80} width={80} height={80} fill="#8a6a44" {...ol} strokeWidth={5} /><circle cx={0} cy={-40} r={16} fill="#f6f0e0" stroke={P.ink} strokeWidth={4} /><path d="M 0 -40 L 0 -50 M 0 -40 L 8 -36" stroke={P.ink} strokeWidth={3} /></g>;
        default: return null;
      }
    };
    const arm = (side: number, a: number, el: number, hold: Prop) => (
      <g transform={`translate(${side * 36 * body} ${shY + 14}) rotate(${a * 57})`}>
        <rect x={-15 * body} y={-8} width={30 * body} height={U + 12} rx={14 * body} fill={sleeve} {...ol} />
        <g transform={`translate(0 ${U}) rotate(${-el * 57})`}>
          <rect x={-13 * body} y={-10} width={26 * body} height={Fa + 6} rx={12 * body} fill={sleeve} {...ol} />
          {L.outfit !== 'sweater' && L.outfit !== 'gown' && <rect x={-12 * body} y={Fa - 10} width={24 * body} height={10} rx={4} fill={L.shirt || '#f4efe2'} stroke={P.ink} strokeWidth={4} />}
          <g transform={`translate(0 ${Fa + 2}) scale(${body * 1.05 / (L.tall || 1)})`}>
            {hold !== 'none' && prop(hold)}
            <path d={HAND} fill={L.skin} {...ol} strokeWidth={5} />
            <path d={THUMB} fill="none" stroke={P.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
      </g>);
    const trouser = L.outfit === 'gown' ? L.skin : L.cloth2;
    const shoe = (cx: number, cy: number) => <ellipse cx={cx} cy={cy} rx={21 * body} ry={9 * body} fill={L.outfit === 'gown' ? L.skin : '#231a14'} {...ol} strokeWidth={5} />;
    const leg = (side: number, a: number) => sit > .01 ? (
      // seated: thigh forward, shin down
      <g transform={`translate(${side * 10 * body - 14} ${hipY - 4})`}>
        <g transform={`rotate(${lerp(a * 57, -84, sit)})`}>
          <rect x={-17 * body} y={-6} width={34 * body} height={thigh + 12} rx={15 * body} fill={trouser} {...ol} />
          <g transform={`translate(0 ${thigh}) rotate(${lerp(0, 84 + side * 4, sit)})`}>
            <rect x={-16 * body} y={-8} width={32 * body} height={shin + 4} rx={14 * body} fill={trouser} {...ol} />
            {shoe(9 * body, shin - 4)}
          </g>
        </g>
      </g>) : (
      <g transform={`translate(${side * 17 * body} ${hipY}) rotate(${a * 57})`}>
        <rect x={-17 * body} y={-4} width={34 * body} height={legL - 2} rx={14 * body} fill={trouser} {...ol} />
        {shoe(9 * body, legL - 6)}
      </g>);
    // torso by outfit
    const tw = 40 * body, hw = 44 * body;
    const torso = (() => {
      const jacket = `M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw + 4} ${hipY + 14} Q 0 ${hipY + 22} ${-hw - 4} ${hipY + 14} Z`;
      switch (L.outfit) {
        case 'suit': case 'coat': {
          const long = L.outfit === 'coat';
          const hem = long ? lerp(hipY + 70 * body, hipY + 10, sit) : hipY + 18 - sit * 10;
          return <g>
            <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw + 6} ${hem} Q 0 ${hem + 8} ${-hw - 6} ${hem} Z`} fill={L.cloth} {...ol} />
            <path d={`M ${-16 * body} ${shY - 2} L 0 ${shY + 44 * body} L ${16 * body} ${shY - 2} Z`} fill={L.shirt || '#f4efe2'} {...ol} strokeWidth={5} />
            {L.vest && <path d={`M ${-14 * body} ${shY + 34 * body} L 0 ${shY + 44 * body} L ${14 * body} ${shY + 34 * body} L ${16 * body} ${hipY + 6} L ${-16 * body} ${hipY + 6} Z`} fill={L.vest} {...ol} strokeWidth={5} />}
            {L.vest && [0, 1, 2].map((k) => <circle key={k} cx={0} cy={shY + 54 * body + k * 16} r={3} fill={P.ink} />)}
            <path d={`M ${-18 * body} ${shY} L ${-6 * body} ${shY + 58 * body} M ${18 * body} ${shY} L ${6 * body} ${shY + 58 * body}`} stroke={P.ink} strokeWidth={5} />
            {L.tie === 'tie' && <path d={`M -6 ${shY + 6} L 6 ${shY + 6} L 9 ${shY + 40 * body} L 0 ${shY + 50 * body} L -9 ${shY + 40 * body} Z`} fill={L.tieC} stroke={P.ink} strokeWidth={4} />}
            {L.tie === 'bow' && <path d={`M 0 ${shY + 8} L -16 ${shY} L -16 ${shY + 16} Z M 0 ${shY + 8} L 16 ${shY} L 16 ${shY + 16} Z`} fill={L.tieC} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />}
            {!long && <path d={`M ${hw - 14} ${hipY - 30} l 18 0`} stroke="rgba(0,0,0,.35)" strokeWidth={5} />}
          </g>;
        }
        case 'sweater': return <g>
          <path d={jacket} fill={L.cloth} {...ol} />
          <path d={`M ${-14 * body} ${shY - 2} Q 0 ${shY + 18} ${14 * body} ${shY - 2}`} fill={L.shirt || '#f4efe2'} {...ol} strokeWidth={5} />
          {[-1, 0, 1].map((k) => <path key={k} d={`M ${k * 20 * body} ${hipY - 2} L ${k * 20 * body} ${hipY + 14}`} stroke="rgba(0,0,0,.25)" strokeWidth={4} />)}
        </g>;
        case 'dress': case 'gown': {
          const bottom = L.outfit === 'gown' ? hipY + 70 * body : -4;
          return <g>
            {sit > .01
              ? <path d={`M ${-hw - 10} ${hipY - 8} L ${hw + thigh * sit + 18} ${hipY - 8} L ${hw + thigh * sit + 22} ${-6} L ${hw + thigh * sit - 40} ${-6} L ${hw - 10} ${hipY + 24} L ${-hw - 10} ${hipY + 24} Z`} fill={L.cloth2} {...ol} />
              : <path d={`M ${-tw - 4} ${shY + 40} L ${tw + 4} ${shY + 40} L ${hw + 26} ${bottom} L ${-hw - 26} ${bottom} Z`} fill={L.cloth2} {...ol} />}
            <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw} ${hipY + 4} Q 0 ${hipY + 12} ${-hw} ${hipY + 4} Z`} fill={L.cloth} {...ol} />
            <path d={`M ${-12 * body} ${shY - 2} L 0 ${shY + 18} L ${12 * body} ${shY - 2}`} fill={L.shirt || '#efe6d4'} {...ol} strokeWidth={5} />
            {L.outfit === 'dress' && <path d={`M ${-hw} ${hipY - 4} Q 0 ${hipY + 4} ${hw} ${hipY - 4}`} stroke="rgba(0,0,0,.3)" strokeWidth={6} fill="none" />}
          </g>;
        }
        default: return null;
      }
    })();

    // ---------- face ----------
    const ex = 22, fx = turn * 14 + lookX * 3 + (E.asym ? 2 : 0);
    const browBase = -24 - (brow + E.raise) * 3.2;
    const mouthEl = (() => {
      const w = 18, oy = 28;
      switch (mouth) {
        case 'grin': return <g><path d={`M ${fx - w} ${oy - 4} Q ${fx} ${oy + 22} ${fx + w} ${oy - 4} Z`} fill="#5a1f17" {...ol} strokeWidth={5} /><path d={`M ${fx - w + 3} ${oy - 2} L ${fx + w - 3} ${oy - 2} L ${fx + w - 6} ${oy + 3} L ${fx - w + 6} ${oy + 3} Z`} fill="#f4efe4" /></g>;
        case 'O': return <ellipse cx={fx} cy={oy + 4} rx={9} ry={13} fill="#5a1f17" {...ol} strokeWidth={5} />;
        case 'shout': return <path d={`M ${fx - 16} ${oy - 6} Q ${fx} ${oy - 10} ${fx + 16} ${oy - 6} Q ${fx + 14} ${oy + 22} ${fx} ${oy + 24} Q ${fx - 14} ${oy + 22} ${fx - 16} ${oy - 6} Z`} fill="#5a1f17" {...ol} strokeWidth={5} />;
        case 'flat': return <path d={`M ${fx - 13} ${oy + 2} L ${fx + 13} ${oy + 2}`} fill="none" {...ol} strokeWidth={5} />;
        case 'smirk': return <path d={`M ${fx - 13} ${oy + 4} Q ${fx + 4} ${oy + 6} ${fx + 15} ${oy - 4}`} fill="none" {...ol} strokeWidth={5} />;
        case 'sad': return <path d={`M ${fx - 14} ${oy + 8} Q ${fx} ${oy - 4} ${fx + 14} ${oy + 8}`} fill="none" {...ol} strokeWidth={5} />;
        case 'talk': return <ellipse cx={fx} cy={oy + 3} rx={12} ry={2 + open * 10} fill="#5a1f17" {...ol} strokeWidth={5} />;
        default: return <path d={`M ${fx - 16} ${oy} Q ${fx} ${oy + 14} ${fx + 16} ${oy}`} fill="none" {...ol} strokeWidth={5} />;
      }
    })();
    const eS = (L.eyeS || 1) * E.wide;
    const eye = (sx: number) => {
      const cx = fx + sx * ex * (1 - turn * sx * .25);
      const lidC = clamp(Math.max(blink, E.lid)), h = 13 * (1 - lidC);
      const inner = cx - sx * 12, outer = cx + sx * 12;
      const asym = E.asym ? (sx > 0 ? -E.asym * 3 : 0) : 0;
      const yIn = browBase + E.tilt * 5 + asym, yOut = browBase - E.tilt * 2 + asym;
      return <g key={sx}>
        {E.laugh && blink < .5
          ? <path d={`M ${cx - 11} -2 Q ${cx} -16 ${cx + 11} -2`} fill="none" stroke={P.ink} strokeWidth={5.5} strokeLinecap="round" />
          : <>
            <ellipse cx={cx} cy={-6} rx={11 * eS} ry={Math.max(1.5, h * eS)} fill={P.chalk} {...ol} strokeWidth={4.5} />
            {h > 4 && <circle cx={cx + lookX * 4 + turn * 3} cy={-4 + lookY * 3 + lidC * 2} r={6.5} fill={P.ink} />}
            {h > 4 && <circle cx={cx + lookX * 4 + turn * 3 + 2.5} cy={-7 + lookY * 3 + lidC * 2} r={2} fill="#fff" />}
            {lidC > .05 && lidC < .95 && <path d={`M ${cx - 11 * eS} ${-6 - h * eS + 1} L ${cx + 11 * eS} ${-6 - h * eS + 1}`} stroke={P.ink} strokeWidth={4} />}
          </>}
        <path d={`M ${Math.min(inner, outer)} ${sx < 0 ? yOut : yIn} L ${Math.max(inner, outer)} ${sx < 0 ? yIn : yOut}`} stroke={L.hairStyle === 'wild' && L.hair === '#f2efe8' ? '#8a8478' : P.ink} strokeWidth={L.moustache === 'walrus' || L.moustache === 'bushy' ? 9 : 7} strokeLinecap="round" />
      </g>;
    };
    const headPath = 'M -60 -10 C -62 -56 -30 -66 0 -66 C 32 -66 62 -54 60 -10 C 62 30 34 56 0 58 C -34 56 -62 30 -60 -10 Z';
    const hair = (() => {
      const c = L.hair;
      switch (L.hairStyle) {
        case 'wild': case 'wildYoung': {
          const B = L.hairStyle === 'wild' ? 1 : .64;
          const blobs: [number, number, number][] = [[-66, 6, 20], [-74, -18, 24], [-70, -44, 26], [-52, -66, 28], [-26, -80, 28], [2, -86, 28], [30, -80, 28], [54, -66, 26], [70, -44, 24], [74, -18, 22], [66, 6, 18], [-40, -60, 22], [0, -66, 24], [36, -60, 22]];
          const sc = (v: number) => v * (1 + (B - .7) * .9);
          return <g>
            {blobs.map(([cx, cy, r], k) => <circle key={k} cx={sc(cx)} cy={sc(cy) - 4} r={r * B + 4} fill={c} {...ol} strokeWidth={5} />)}
            {blobs.map(([cx, cy, r], k) => <circle key={'i' + k} cx={sc(cx) * .82} cy={sc(cy) * .82 - 4} r={r * B} fill={c} />)}
            {B > .9 && [[-1, -30], [1, -26], [-1, 0], [1, 4]].map(([q, y0], k) => <path key={'w' + k} d={`M ${q * 92} ${y0} q ${q * 16} -10 ${q * 10} -26`} stroke={P.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />)}
            {[-30, 0, 28].map((x0, k) => <path key={'l' + k} d={`M ${x0} ${-40 - B * 30} q 10 -12 4 -24`} stroke="rgba(0,0,0,.25)" strokeWidth={4} fill="none" />)}
          </g>;
        }
        case 'parted': return <g><path d="M -62 -14 C -66 -60 -30 -76 0 -76 C 34 -76 66 -60 62 -16 C 52 -44 26 -52 -14 -50 L -16 -60 L -22 -48 C -40 -44 -54 -34 -62 -14 Z" fill={c} {...ol} /></g>;
        case 'slick': return <path d="M -62 -14 C -66 -64 -30 -78 4 -78 C 38 -78 66 -60 62 -14 C 56 -44 40 -56 6 -58 C -30 -58 -52 -40 -62 -14 Z" fill={c} {...ol} />;
        case 'short': return <path d="M -62 -14 C -66 -60 -30 -76 0 -76 C 34 -76 66 -60 62 -16 C 50 -40 30 -50 4 -48 C -24 -46 -50 -40 -62 -14 Z" fill={c} {...ol} />;
        case 'curly': return <g>{[[-56, -20, 20], [-58, -44, 22], [-44, -62, 24], [-20, -74, 24], [6, -76, 24], [30, -70, 23], [50, -54, 21], [58, -32, 18], [-34, -48, 18], [-8, -56, 18], [18, -54, 17]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={c} {...ol} strokeWidth={5} />)}
          {[[-34, -50, 16], [-8, -58, 16], [18, -56, 15], [38, -48, 14]].map(([cx, cy, r], k) => <circle key={'f' + k} cx={cx} cy={cy} r={r} fill={c} />)}</g>;
        case 'bun': return <g><circle cx={0} cy={-78} r={26} fill={c} {...ol} /><path d="M -62 -10 C -66 -60 -30 -74 0 -74 C 34 -74 66 -60 62 -12 C 48 -42 24 -50 0 -50 C -26 -50 -48 -40 -62 -10 Z" fill={c} {...ol} /></g>;
        case 'bob': return <path d="M -66 30 C -76 -60 -30 -80 0 -80 C 34 -80 76 -60 66 30 L 50 30 C 52 -20 30 -46 0 -46 C -30 -46 -52 -20 -50 30 Z" fill={c} {...ol} />;
        case 'bald': return <g>{[-1, 1].map((q) => <path key={q} d={`M ${q * 60} 8 C ${q * 66} -10 ${q * 64} -26 ${q * 56} -36`} stroke={c} strokeWidth={16} strokeLinecap="round" fill="none" />)}</g>;
        default: return null;
      }
    })();
    const hat = (() => {
      switch (L.hat) {
        case 'bowler': return <g><path d="M -80 -40 Q 0 -54 80 -40" stroke={P.ink} strokeWidth={14} strokeLinecap="round" fill="none" /><path d="M -50 -44 C -50 -110 50 -110 50 -44 Z" fill="#26201c" {...ol} /></g>;
        case 'fedora': return <g><path d="M -84 -42 Q 0 -60 84 -42" stroke={P.ink} strokeWidth={16} strokeLinecap="round" fill="none" /><path d="M -52 -46 L -46 -100 Q 0 -86 46 -100 L 52 -46 Z" fill="#4a4038" {...ol} /><rect x={-52} y={-60} width={104} height={12} fill="#2a2420" /></g>;
        case 'cap': return <g><path d="M -64 -34 C -60 -86 60 -86 64 -34 Z" fill="#5a5048" {...ol} /><path d="M 30 -36 Q 70 -40 86 -28" stroke={P.ink} strokeWidth={12} strokeLinecap="round" fill="none" /></g>;
        default: return null;
      }
    })();
    const nose = L.nose === 'big'
      ? <g><path d={`M ${fx - 4} -2 Q ${fx + 4} 8 ${fx + 2} 12`} fill="none" stroke={L.skinS} strokeWidth={5} strokeLinecap="round" /><ellipse cx={fx + 4} cy={14} rx={14} ry={10} fill={L.skin} {...ol} strokeWidth={4.5} /></g>
      : <path d={`M ${fx + 2} 2 Q ${fx + 9} 14 ${fx - 2} 16`} fill="none" stroke={L.skinS} strokeWidth={5} strokeLinecap="round" />;
    const mst = (() => {
      const mc = L.hair === '#f2efe8' ? '#e8e4dc' : L.hair; const oy = 25;
      switch (L.moustache) {
        case 'walrus': return <path d={`M ${fx - 34} ${oy + 10} C ${fx - 30} ${oy - 12} ${fx - 8} ${oy - 10} ${fx} ${oy - 6} C ${fx + 8} ${oy - 10} ${fx + 30} ${oy - 12} ${fx + 34} ${oy + 10} C ${fx + 20} ${oy + 2} ${fx + 8} ${oy + 4} ${fx} ${oy + 2} C ${fx - 8} ${oy + 4} ${fx - 20} ${oy + 2} ${fx - 34} ${oy + 10} Z`} fill={mc} {...ol} strokeWidth={4.5} />;
        case 'bushy': return <path d={`M ${fx - 28} ${oy + 4} C ${fx - 26} ${oy - 12} ${fx - 6} ${oy - 10} ${fx} ${oy - 6} C ${fx + 6} ${oy - 10} ${fx + 26} ${oy - 12} ${fx + 28} ${oy + 4} C ${fx + 14} ${oy} ${fx} ${oy + 2} ${fx - 28} ${oy + 4} Z`} fill={mc} {...ol} strokeWidth={4.5} />;
        case 'brush': return <path d={`M ${fx - 22} ${oy + 1} C ${fx - 20} ${oy - 10} ${fx + 20} ${oy - 10} ${fx + 22} ${oy + 1} Z`} fill={mc} {...ol} strokeWidth={4} />;
        case 'thin': return <path d={`M ${fx - 20} ${oy} Q ${fx} ${oy - 8} ${fx + 20} ${oy}`} fill="none" stroke={mc} strokeWidth={6} strokeLinecap="round" />;
        default: return null;
      }
    })();
    const beard = (() => {
      switch (L.beard) {
        case 'full': return <path d={`M -54 6 C -50 76 50 76 54 6 C 44 40 ${fx + 16} 46 ${fx} 46 C ${fx - 16} 46 -44 40 -54 6 Z`} fill={L.hair} {...ol} />;
        case 'goatee': return <path d={`M ${fx - 16} 40 Q ${fx} 76 ${fx + 16} 40 Q ${fx} 48 ${fx - 16} 40 Z`} fill={L.hair} {...ol} strokeWidth={5} />;
        case 'stubble': return <path d={`M -50 14 C -42 62 42 62 50 14 C 36 44 ${fx + 14} 50 ${fx} 50 C -20 50 -38 42 -50 14 Z`} fill={L.hair} opacity={.28} />;
        default: return null;
      }
    })();
    const glasses = L.glasses && <g>{[-1, 1].map((q) => { const cx = fx + q * ex * (1 - turn * q * .25); return <circle key={q} cx={cx} cy={-6} r={L.glasses === 'pince' ? 13 : 16} fill="rgba(220,235,240,.25)" stroke={P.ink} strokeWidth={4} />; })}
      <path d={`M ${fx - 6} -8 Q ${fx} -12 ${fx + 6} -8`} stroke={P.ink} strokeWidth={4} fill="none" /></g>;
    const leanTot = lean;
    return (
      <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s * (L.broad || 1)} ${s}) rotate(${leanTot})`} opacity={opacity}>
        {sit < .5 && <ellipse cx={0} cy={4} rx={56 * body} ry={10 * body} fill="rgba(20,14,10,.25)" />}
        {arm(-1, armB, elbowB, holdB)}
        {L.outfit !== 'gown' && !(skirt && sit < .01) && sit < .01 && <>{leg(-1, -sw)}{leg(1, sw)}</>}
        {skirt && sit < .01 && L.outfit === 'dress' && [-1, 1].map((q) => <ellipse key={q} cx={q * 20 * body + 8} cy={-6} rx={20 * body} ry={9 * body} fill="#231a14" {...ol} strokeWidth={5} />)}
        {torso}
        {L.outfit !== 'gown' && sit >= .01 && <>{leg(-1, 0)}{leg(1, 0)}</>}
        {arm(1, armF, elbowF, holdF)}
        <g transform={`translate(${turn * 4} ${headY}) rotate(${tilt}) scale(${headS})`}>
          {[-1, 1].map((q) => <ellipse key={q} cx={q * 62} cy={2} rx={10} ry={14} fill={L.skinS} {...ol} />)}
          {(L.hairStyle === 'wild' || L.hairStyle === 'wildYoung') && hair}
          <path d={headPath} fill={L.skin} {...ol} />
          <path d="M 30 42 C 44 32 54 16 56 -4" fill="none" stroke={L.skinS} strokeWidth={9} strokeLinecap="round" opacity={.7} />
          {L.hairStyle !== 'wild' && L.hairStyle !== 'wildYoung' && hair}
          {(L.hairStyle === 'wild' || L.hairStyle === 'wildYoung') && <path d="M -60 -12 C -60 -50 -30 -66 0 -66 C 30 -66 60 -50 60 -12 C 50 -34 40 -40 24 -42 C 18 -34 8 -32 -2 -40 C -14 -32 -30 -34 -40 -42 C -50 -38 -56 -28 -60 -12 Z" fill={L.hair} {...ol} strokeWidth={5} />}
          {hat}
          {beard}
          {[-1, 1].map(eye)}
          {nose}
          {glasses}
          {L.wrinkles && [-1, 1].map((q) => <path key={q} d={`M ${fx + q * 38} 0 l ${q * 8} -4 M ${fx + q * 38} 6 l ${q * 9} 0`} stroke={L.skinS} strokeWidth={3} strokeLinecap="round" />)}
          {L.wrinkles && <path d={`M ${fx - 16} -40 Q ${fx} -44 ${fx + 16} -40`} stroke={L.skinS} strokeWidth={3} fill="none" />}
          <circle cx={fx - 30} cy={18} r={8} fill="#d86a4f" opacity={expr === 'laugh' || expr === 'happy' || expr === 'excited' ? .45 : .22} /><circle cx={fx + 30} cy={18} r={8} fill="#d86a4f" opacity={expr === 'laugh' || expr === 'happy' || expr === 'excited' ? .45 : .22} />
          {mouthEl}
          {mst}
        </g>
      </g>
    );
  };

/* a bentwood chair; sitter's y = chair y (floor) */
export const Chair: React.FC<{ x: number; y: number; s?: number; flip?: boolean; c?: string }> = ({ x, y, s = 1.2, flip, c = '#6a4226' }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d="M -46 -44 C -56 -120 -50 -170 -40 -196" stroke={P.ink} strokeWidth={16} fill="none" strokeLinecap="round" /><path d="M -46 -44 C -56 -120 -50 -170 -40 -196" stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -50 -110 Q -40 -130 -46 -160" stroke={P.ink} strokeWidth={5} fill="none" />
    {[[-40, -48], [40, 52], [10, 14]].map(([a, b], k) => <g key={k}><line x1={a} y1={-44} x2={b} y2={0} stroke={P.ink} strokeWidth={13} strokeLinecap="round" /><line x1={a} y1={-44} x2={b} y2={0} stroke={c} strokeWidth={6} strokeLinecap="round" /></g>)}
    <rect x={-58} y={-56} width={116} height={16} rx={8} fill={c} stroke={P.ink} strokeWidth={6} />
  </g>
);
