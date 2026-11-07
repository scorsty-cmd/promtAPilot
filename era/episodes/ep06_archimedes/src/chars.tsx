import React from 'react';
import { clamp, lerp } from './lib';
import { P } from './art';

/* ===== Troy cast — rig v5: Bronze Age kit (tunics, bronze cuirass, greaves, crested & boar's-tusk helmets,
   figure-eight / tower / round shields, spears), NEW: hand gestures (point, fist), kneel pose; keeps sit + expressions ===== */
export type Mouth = 'smile' | 'grin' | 'O' | 'flat' | 'sad' | 'talk' | 'shout' | 'smirk';
export type Expr = 'neutral' | 'happy' | 'laugh' | 'surprised' | 'angry' | 'worried' | 'thinking' | 'sad' | 'excited' | 'sleepy' | 'fierce' | 'scared';
export type MLook = {
  skin: string; skinS: string; hair: string;
  hairStyle: 'long' | 'curlyLong' | 'short' | 'bun' | 'veil' | 'bald' | 'curly' | 'wild';
  outfit: 'tunic' | 'armor' | 'robe' | 'dress' | 'scale';
  cloth: string; cloth2: string; trim?: string;
  beard?: 'full' | 'short' | 'stubble' | 'long'; helmet?: 'crest' | 'boar' | 'cap' | 'crown' | 'roman' | 'diadem' | 'none'; crestC?: string;
  shield?: 'eight' | 'tower' | 'round' | 'scutum' | 'none'; apron?: string; cloak?: string; freckles?: boolean; shieldC?: string; wrinkles?: boolean; eyeS?: number; broad?: number; nose?: 'big' | 'small'; tall?: number; greaves?: boolean; glow?: boolean;
};
const SK = { a: ['#e8b88a', '#c8966a'], b: ['#d9a070', '#b88050'], c: ['#c88a5a', '#a86a40'], d: ['#f0caa0', '#d4a880'], e: ['#b07a4e', '#8a5a34'] };
const BR = '#c9913a', BRL = '#e8b860', BRD = '#8a5a22';
const G = (o: Partial<MLook>): MLook => ({ skin: SK.b[0], skinS: SK.b[1], hair: '#2a1a12', hairStyle: 'curly', outfit: 'tunic', cloth: '#efe4cc', cloth2: '#b0402a', trim: '#3a6fa8', helmet: 'none', shield: 'none', ...o });
export const CAST: Record<string, MLook> = {
  you: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#3a2416', hairStyle: 'curly', outfit: 'tunic', cloth: '#3f8a8a', cloth2: '#efe4cc', trim: '#e0a83a' }),
  youKid: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#3a2416', hairStyle: 'curly', outfit: 'tunic', cloth: '#3f8a8a', cloth2: '#efe4cc', trim: '#e0a83a' }),
  arch: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#ece6da', hairStyle: 'bald', outfit: 'robe', cloth: '#f2ecdc', cloth2: '#d8cfb8', trim: '#3a6fa8', beard: 'long', wrinkles: true, eyeS: 1.08, nose: 'big' }),
  archYoung: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#b8b0a2', hairStyle: 'bald', outfit: 'robe', cloth: '#f2ecdc', cloth2: '#d8cfb8', trim: '#3a6fa8', beard: 'full', wrinkles: true, eyeS: 1.08, nose: 'big' }),
  archBath: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#b8b0a2', hairStyle: 'bald', outfit: 'tunic', cloth: '#f6f2e8', cloth2: '#f6f2e8', trim: '#f6f2e8', beard: 'full', wrinkles: true, eyeS: 1.08, nose: 'big' }),
  kleo: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#a8552a', hairStyle: 'curly', outfit: 'tunic', cloth: '#c86a3a', cloth2: '#7a4a2a', trim: '#efe4cc', freckles: true }),
  kleoKid: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#a8552a', hairStyle: 'curly', outfit: 'tunic', cloth: '#c86a3a', cloth2: '#7a4a2a', trim: '#efe4cc', freckles: true }),
  mom: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#2a1a12', hairStyle: 'veil', outfit: 'dress', cloth: '#8a5a8a', cloth2: '#efe4cc', trim: '#e0a83a' }),
  hiero: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#d8d2c6', hairStyle: 'short', outfit: 'robe', cloth: '#6a2a6a', cloth2: '#4a1a4a', trim: '#e8b860', beard: 'full', helmet: 'diadem', wrinkles: true, broad: 1.1 }),
  gold: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#1a100a', hairStyle: 'short', outfit: 'tunic', cloth: '#8a7a5a', cloth2: '#5a4a30', trim: '#e0a83a', beard: 'short', apron: '#5a3a20', nose: 'big' }),
  capt: G({ skin: SK.e[0], skinS: SK.e[1], hair: '#2a1a12', hairStyle: 'curly', outfit: 'tunic', cloth: '#3a6fa8', cloth2: '#efe4cc', trim: '#efe4cc', beard: 'full', broad: 1.12 }),
  marc: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#4a3020', hairStyle: 'short', outfit: 'armor', cloth: '#9a2a22', cloth2: '#efe4cc', trim: '#e8b860', helmet: 'roman', crestC: '#c8302a', greaves: true, cloak: '#a82a22', tall: 1.04 }),
  sold: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#4a3020', hairStyle: 'short', outfit: 'scale', cloth: '#9a2a22', cloth2: '#7a2a22', trim: '#efe4cc', helmet: 'roman', crestC: '#2a1a12', shield: 'scutum', shieldC: '#a82a22', beard: 'stubble' }),
  cic: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#6a5a4a', hairStyle: 'short', outfit: 'robe', cloth: '#f2ecdc', cloth2: '#f2ecdc', trim: '#7a2a6a', nose: 'big', wrinkles: true }),
};
/* crowd variety (backlog #16): men, women, elders and children */
export const citizen = (i: number): { look: MLook; age: number } => {
  const R = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
  const sk = [SK.a, SK.b, SK.c, SK.d, SK.e][(i * 3) % 5]; const kind = i % 5; // 0,1 men; 2,3 women; 4 child
  const elder = R(1) > .72; const c = ['#b0402a', '#3a6fa8', '#e0a83a', '#2f5a4a', '#8a5a8a', '#efe4cc', '#c86a3a'][(i * 5) % 7];
  if (kind === 2 || kind === 3) return { age: 1, look: G({ skin: sk[0], skinS: sk[1], hair: elder ? '#d8d2c6' : ['#1a100a', '#3a2416', '#6a3a1e'][i % 3], hairStyle: R(2) > .5 ? 'veil' : 'bun', outfit: 'dress', cloth: c, cloth2: '#efe4cc', trim: ['#e0a83a', '#3a6fa8', '#b0402a'][i % 3], wrinkles: elder }) };
  if (kind === 4) return { age: .55 + R(3) * .2, look: G({ skin: sk[0], skinS: sk[1], hair: ['#1a100a', '#6a3a1e', '#c89040'][i % 3], hairStyle: 'curly', outfit: 'tunic', cloth: c, cloth2: c, trim: '#efe4cc' }) };
  return { age: 1, look: G({ skin: sk[0], skinS: sk[1], hair: elder ? '#d8d2c6' : ['#1a100a', '#3a2416', '#5a3a26'][i % 3], hairStyle: elder ? 'bald' : (['curly', 'short', 'long'] as const)[i % 3], outfit: R(4) > .6 ? 'robe' : 'tunic', cloth: c, cloth2: '#efe4cc', trim: '#e0a83a', beard: elder ? 'long' : (['full', 'short', undefined, 'stubble'] as const)[i % 4], wrinkles: elder }) };
};
export const legionary = (i: number): MLook => G({ ...CAST.sold, skin: [SK.d, SK.a, SK.b][i % 3][0], skinS: [SK.d, SK.a, SK.b][i % 3][1], beard: (['stubble', undefined, 'short'] as const)[i % 3], crestC: i % 4 === 0 ? '#c8302a' : '#2a1a12' });
export const trojan = (i: number, armed = true): MLook => citizen(i).look;
export const greekSoldier = (i: number): MLook => G({ ...CAST.kleo, outfit: 'scale', helmet: 'crest', crestC: '#efe4cc', shield: 'round', shieldC: ['#3a6fa8', '#efe4cc', '#e0a83a'][i % 3], cloth: '#3a6fa8', greaves: true, beard: (['full', 'short', undefined] as const)[i % 3], hair: ['#1a100a', '#3a2416'][i % 2], hairStyle: 'curly', freckles: false, skin: [SK.b, SK.c, SK.a][i % 3][0], skinS: [SK.b, SK.c, SK.a][i % 3][1] });

export type Prop = 'none' | 'spear' | 'sword' | 'bow' | 'torch' | 'cup' | 'reins' | 'rope' | 'bread' | 'baby' | 'helmet' | 'staff' | 'compass' | 'scroll' | 'tablet' | 'stick' | 'crown' | 'towel' | 'gladius';
export type MPose = {
  walk?: number; phase?: number; armF?: number; armB?: number; elbowF?: number; elbowB?: number; tilt?: number; turn?: number; blink?: number;
  mouth?: Mouth; open?: number; brow?: number; lookX?: number; lookY?: number; bob?: number; crouch?: number;
  holdF?: Prop; holdB?: Prop; lean?: number; sit?: number; kneel?: number; expr?: Expr; handF?: 'open' | 'point' | 'fist'; shieldUp?: number; run?: number; propA?: number;
};
const OL = 7;
const HAND = 'M -10 -4 C -13 7 -10 17 -1 19 C 8 20 12 12 11 1 C 10 -5 4 -7 -2 -7 Z';
const THUMB = 'M 7 -1 C 16 -3 19 6 11 10';
const FIST = 'M -11 -4 C -14 6 -10 16 0 16 C 10 16 13 8 12 -2 C 10 -8 -8 -8 -11 -4 Z';
const POINT = 'M -10 -4 C -13 6 -10 14 -1 15 C 6 15 9 10 9 4 L 9 26 C 9 31 3 31 3 26 L 3 8 M -10 -4 C -6 -8 6 -8 10 -2';

const EX: Record<Expr, { raise: number; tilt: number; lid: number; wide: number; mouth: Mouth; laugh?: boolean; asym?: number }> = {
  neutral: { raise: 0, tilt: 0, lid: 0, wide: 1, mouth: 'flat' },
  happy: { raise: .6, tilt: -.2, lid: .2, wide: 1, mouth: 'smile' },
  laugh: { raise: 1, tilt: -.3, lid: 0, wide: 1, mouth: 'grin', laugh: true },
  surprised: { raise: 2.4, tilt: -.2, lid: 0, wide: 1.22, mouth: 'O' },
  excited: { raise: 1.6, tilt: -.3, lid: 0, wide: 1.12, mouth: 'grin' },
  angry: { raise: -1, tilt: 1.3, lid: .25, wide: .95, mouth: 'flat' },
  fierce: { raise: -1.2, tilt: 1.6, lid: .15, wide: 1.05, mouth: 'shout' },
  worried: { raise: 1.1, tilt: -1.2, lid: .1, wide: 1.02, mouth: 'sad' },
  scared: { raise: 2.0, tilt: -1.4, lid: 0, wide: 1.25, mouth: 'O' },
  thinking: { raise: .4, tilt: 0, lid: .3, wide: 1, mouth: 'smirk', asym: 1.6 },
  sad: { raise: .5, tilt: -1.3, lid: .45, wide: 1, mouth: 'sad' },
  sleepy: { raise: -.2, tilt: 0, lid: .7, wide: 1, mouth: 'flat' },
};

export const Shield: React.FC<{ kind: 'eight' | 'tower' | 'round' | 'scutum'; c: string; s?: number }> = ({ kind, c, s = 1 }) => {
  const ol = { stroke: P.ink, strokeWidth: 7 / s, strokeLinejoin: 'round' as const };
  if (kind === 'eight') return <g transform={`scale(${s})`}><path d="M 0 -120 C 60 -120 64 -50 30 -26 C 64 -2 64 110 0 110 C -64 110 -64 -2 -30 -26 C -64 -50 -60 -120 0 -120 Z" fill={c} {...ol} />
    {[[-24, -70], [24, -70], [-30, 40], [30, 40], [0, -100], [0, 90]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={6} fill="#2a1a12" opacity={.5} />)}<path d="M 0 -110 L 0 100" stroke={P.ink} strokeWidth={4 / s} opacity={.4} /></g>;
  if (kind === 'tower') return <g transform={`scale(${s})`}><path d="M -56 -130 Q 0 -150 56 -130 L 60 120 Q 0 132 -60 120 Z" fill={c} {...ol} />
    {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={-40 + (k % 2) * 80} cy={-100 + k * 50} r={9} fill="#2a1a12" opacity={.35} />)}<path d="M -50 -40 Q 0 -30 50 -40" stroke={P.ink} strokeWidth={4 / s} opacity={.35} fill="none" /></g>;
  if (kind === 'scutum') return <g transform={`scale(${s})`}><path d="M -62 -120 Q 0 -134 62 -120 Q 76 0 62 120 Q 0 134 -62 120 Q -76 0 -62 -120 Z" fill={c} {...ol} /><circle r={22} fill={BRL} stroke={P.ink} strokeWidth={6 / s} /><path d="M 0 -110 L 0 -24 M 0 24 L 0 110" stroke={BRL} strokeWidth={8 / s} />{[-1, 1].map((q) => <path key={q} d={`M ${q * 30} -60 q ${q * 14} 20 0 40`} stroke={BRL} strokeWidth={5 / s} fill="none" />)}</g>;
  return <g transform={`scale(${s})`}><circle r={84} fill={c} {...ol} /><circle r={62} fill="none" stroke={P.ink} strokeWidth={4 / s} opacity={.45} /><circle r={18} fill={BR} stroke={P.ink} strokeWidth={5 / s} />
    {Array.from({ length: 8 }).map((_, k) => <circle key={k} cx={Math.cos(k * .785) * 72} cy={Math.sin(k * .785) * 72} r={5} fill={BRL} />)}</g>;
};

export const MChar: React.FC<{ look: MLook; pose?: MPose; x: number; y: number; s?: number; flip?: boolean; age?: number; opacity?: number }> =
  ({ look, pose = {}, x, y, s = 1, flip = false, age = 1, opacity = 1 }) => {
    const { walk = 0, phase = 0, armF = .15, armB = -.15, elbowF = .35, elbowB = .25, tilt = 0, turn = .35, blink = 0, open = 0,
      brow = 0, lookX = 0, lookY = 0, bob = 0, crouch = 0, holdF = 'none', holdB = 'none', lean = 0, sit = 0, kneel = 0, expr = 'neutral', handF = 'open', shieldUp = 0, run = 0, propA = 0 } = pose;
    const E = EX[expr]; const mouth: Mouth = pose.mouth ?? E.mouth;
    const kid = clamp(1 - age, 0, 1);
    const body = lerp(1, .64, kid) * (look.tall || 1), headS = lerp(1, 1.12, kid);
    const stride = .55 + run * .35;
    const sw = Math.sin(phase) * stride * walk * (1 - sit) * (1 - kneel);
    const lift = walk ? Math.abs(Math.sin(phase)) * (6 + run * 10) * walk : 0;
    const legL = 82 * body, torsoH = 104 * body, thigh = legL * .62, shin = legL * .54;
    const hipY = lerp(lerp(-legL + crouch * 18 - lift, -shin + 4, sit), -thigh - 6, kneel) + bob;
    const shY = hipY - torsoH, headY = shY - 56 * headS;
    const ol = { stroke: P.ink, strokeWidth: OL, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
    const L = look; const skirt = L.outfit === 'dress' || L.outfit === 'robe';
    const U = 46 * body, Fa = 44 * body;
    const leanTot = lean + run * 8 * walk;

    const prop = (p: Prop) => {
      switch (p) {
        case 'spear': return <g><line x1={0} y1={170} x2={0} y2={-230} stroke={P.ink} strokeWidth={12} strokeLinecap="round" /><line x1={0} y1={170} x2={0} y2={-230} stroke="#8a5a34" strokeWidth={5} /><path d="M -12 -230 L 0 -290 L 12 -230 Z" fill={BRL} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" /></g>;
        case 'sword': return <g transform="rotate(-30)"><path d="M -6 -10 L 0 -130 L 6 -10 Z" fill={BRL} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" /><rect x={-16} y={-12} width={32} height={8} fill={BRD} stroke={P.ink} strokeWidth={4} /></g>;
        case 'bow': return <g><path d="M 10 -110 Q 70 0 10 110" fill="none" stroke={P.ink} strokeWidth={12} /><path d="M 10 -110 Q 70 0 10 110" fill="none" stroke="#8a5a34" strokeWidth={6} /><line x1={10} y1={-110} x2={10} y2={110} stroke="#efe4cc" strokeWidth={2} /></g>;
        case 'torch': return <g><rect x={-7} y={-90} width={14} height={110} fill="#6a3a1e" stroke={P.ink} strokeWidth={4} /><path d="M -16 -88 Q -20 -130 0 -160 Q 20 -130 16 -88 Z" fill="#ffb347" stroke={P.ink} strokeWidth={4} /><path d="M -7 -92 Q -8 -116 0 -132 Q 8 -116 7 -92 Z" fill="#fff2a0" /></g>;
        case 'cup': return <g><path d="M -22 -24 L 22 -24 Q 18 0 0 2 Q -18 0 -22 -24 Z" fill={BRL} stroke={P.ink} strokeWidth={4} /><path d="M -4 2 L -6 14 L 6 14 L 4 2" fill={BRL} stroke={P.ink} strokeWidth={4} /></g>;
        case 'reins': return <path d="M 0 0 Q 60 30 140 -10" fill="none" stroke="#5a3a20" strokeWidth={6} />;
        case 'rope': return <path d="M 0 0 Q 120 40 300 -20" fill="none" stroke="#c8a870" strokeWidth={10} strokeDasharray="14 6" />;
        case 'bread': return <ellipse cx={4} cy={-6} rx={22} ry={13} fill="#d89a4a" stroke={P.ink} strokeWidth={4} />;
        case 'staff': return <line x1={0} y1={160} x2={0} y2={-150} stroke="#6a4a2a" strokeWidth={10} strokeLinecap="round" />;
        case 'helmet': return <g transform="translate(0 -20) scale(.55)"><path d="M -60 10 C -64 -70 64 -70 60 10 Z" fill={BR} stroke={P.ink} strokeWidth={8} /><path d="M -10 -60 C 0 -120 80 -110 110 -60 C 80 -80 30 -80 10 -56" fill="#2a1a12" stroke={P.ink} strokeWidth={6} /></g>;
        case 'baby': return <g transform="translate(14 -24)"><ellipse rx={34} ry={22} fill="#efe4cc" stroke={P.ink} strokeWidth={5} /><circle cx={-24} cy={-14} r={18} fill={SK.d[0]} stroke={P.ink} strokeWidth={5} /><circle cx={-28} cy={-16} r={2.5} fill={P.ink} /><circle cx={-20} cy={-16} r={2.5} fill={P.ink} /></g>;
        case 'compass': return <g transform="translate(0 -10)"><path d="M 0 -40 L -18 30 M 0 -40 L 18 30" stroke={P.ink} strokeWidth={6} strokeLinecap="round" /><circle cx={0} cy={-42} r={7} fill={BR} stroke={P.ink} strokeWidth={4} /></g>;
        case 'scroll': return <g transform="rotate(-10)"><rect x={-40} y={-20} width={80} height={36} fill="#efe0b8" stroke={P.ink} strokeWidth={4} /><circle cx={-40} cy={-2} r={12} fill="#d8c090" stroke={P.ink} strokeWidth={4} /><circle cx={40} cy={-2} r={12} fill="#d8c090" stroke={P.ink} strokeWidth={4} /></g>;
        case 'tablet': return <g><rect x={-34} y={-46} width={68} height={52} rx={4} fill="#8a5a34" stroke={P.ink} strokeWidth={4} /><rect x={-28} y={-40} width={56} height={40} fill="#3a2a20" /><circle cx={0} cy={-20} r={12} fill="none" stroke="#e8d8a8" strokeWidth={3} /></g>;
        case 'stick': return <g transform={`rotate(${0})`}><line x1={0} y1={-20} x2={0} y2={110} stroke="#6a4a2a" strokeWidth={7} strokeLinecap="round" /></g>;
        case 'crown': return <g transform="translate(0 -24)"><ellipse rx={34} ry={12} fill="none" stroke="#e8b860" strokeWidth={9} />{[-24, -8, 8, 24].map((x) => <path key={x} d={`M ${x - 6} -4 q 6 -18 12 0`} fill="#4a8a3a" stroke={P.ink} strokeWidth={3} />)}</g>;
        case 'towel': return <path d="M -30 -10 Q 0 30 30 -10 L 26 60 Q 0 70 -26 60 Z" fill="#f6f2e8" stroke={P.ink} strokeWidth={4} />;
        case 'gladius': return <g transform="rotate(-20)"><path d="M -7 -10 L 0 -100 L 7 -10 Z" fill="#d8d8d0" stroke={P.ink} strokeWidth={5} strokeLinejoin="round" /><rect x={-14} y={-12} width={28} height={8} fill={BRD} stroke={P.ink} strokeWidth={4} /></g>;
        default: return null;
      }
    };
    const armored = L.outfit === 'armor' || L.outfit === 'scale';
    const arm = (side: number, a: number, el: number, hold: Prop, front: boolean) => (
      <g transform={`translate(${side * 36 * body} ${shY + 14}) rotate(${a * 57})`}>
        <rect x={-15 * body} y={-8} width={30 * body} height={U + 12} rx={14 * body} fill={L.skin} {...ol} />
        <path d={`M ${-17 * body} -10 Q 0 ${-20} ${17 * body} -10 L ${16 * body} ${U * .45} L ${-16 * body} ${U * .45} Z`} fill={armored ? BR : L.cloth} {...ol} strokeWidth={5} />
        <g transform={`translate(0 ${U}) rotate(${-el * 57})`}>
          <rect x={-13 * body} y={-10} width={26 * body} height={Fa + 6} rx={12 * body} fill={L.skin} {...ol} />
          {armored && <rect x={-14 * body} y={Fa * .45} width={28 * body} height={14} rx={5} fill={BRL} stroke={P.ink} strokeWidth={4} />}
          <g transform={`translate(0 ${Fa + 2}) scale(${body * 1.05 / (L.tall || 1)})`}>
            {hold !== 'none' && (['spear', 'staff', 'torch', 'bow', 'stick'].includes(hold) ? <g transform={`rotate(${-(a - el) * 57 - leanTot + (front ? propA : 0)})`}>{prop(hold)}</g> : prop(hold))}
            {front && handF === 'fist' ? <path d={FIST} fill={L.skin} {...ol} strokeWidth={5} />
              : front && handF === 'point' ? <path d={POINT} fill={L.skin} {...ol} strokeWidth={5} />
                : <><path d={HAND} fill={L.skin} {...ol} strokeWidth={5} /><path d={THUMB} fill="none" stroke={P.ink} strokeWidth={5} strokeLinecap="round" /></>}
          </g>
        </g>
      </g>);
    const sandal = (cx: number, cy: number) => <g><ellipse cx={cx} cy={cy} rx={20 * body} ry={8 * body} fill={L.skin} {...ol} strokeWidth={5} /><path d={`M ${cx - 12} ${cy - 4} L ${cx + 12} ${cy - 4}`} stroke="#5a3a20" strokeWidth={5} /></g>;
    const shinFill = L.greaves ? BR : L.skin;
    const leg = (side: number, a: number) => {
      if (kneel > .01 && side > 0) return (  // front leg: foot planted, knee up
        <g transform={`translate(${side * 14 * body} ${hipY})`}><g transform={`rotate(${-70 * kneel})`}>
          <rect x={-16 * body} y={-4} width={32 * body} height={thigh + 8} rx={14 * body} fill={L.skin} {...ol} />
          <g transform={`translate(0 ${thigh}) rotate(${70 * kneel})`}><rect x={-15 * body} y={-6} width={30 * body} height={shin + 12} rx={13 * body} fill={shinFill} {...ol} />{sandal(9 * body, shin + 8)}</g></g></g>);
      if (kneel > .01) return (  // back leg: knee on the ground
        <g transform={`translate(${side * 14 * body} ${hipY})`}><rect x={-16 * body} y={-4} width={32 * body} height={thigh + 6} rx={14 * body} fill={L.skin} {...ol} />
          <g transform={`translate(0 ${thigh}) rotate(${90 * kneel})`}><rect x={-15 * body} y={-6} width={30 * body} height={shin + 4} rx={13 * body} fill={shinFill} {...ol} /></g></g>);
      if (sit > .01) return (
        <g transform={`translate(${side * 10 * body - 14} ${hipY - 4})`}><g transform={`rotate(${lerp(a * 57, -84, sit)})`}>
          <rect x={-17 * body} y={-6} width={34 * body} height={thigh + 12} rx={15 * body} fill={L.skin} {...ol} />
          <g transform={`translate(0 ${thigh}) rotate(${lerp(0, 84 + side * 4, sit)})`}><rect x={-16 * body} y={-8} width={32 * body} height={shin + 4} rx={14 * body} fill={shinFill} {...ol} />{sandal(9 * body, shin - 4)}</g></g></g>);
      const knee = walk ? Math.max(0, Math.sin(phase + (side > 0 ? 0 : Math.PI))) * (.5 + run * .7) * walk : 0;
      return <g transform={`translate(${side * 17 * body} ${hipY}) rotate(${a * 57})`}>
        <rect x={-17 * body} y={-4} width={34 * body} height={thigh + 6} rx={14 * body} fill={L.skin} {...ol} />
        <g transform={`translate(0 ${thigh}) rotate(${knee * 57})`}><rect x={-15 * body} y={-6} width={30 * body} height={legL - thigh} rx={13 * body} fill={shinFill} {...ol} />{sandal(9 * body, legL - thigh - 4)}</g>
      </g>;
    };
    const tw = 40 * body, hw = 44 * body;
    const torso = (() => {
      const kilt = (len: number) => <path d={`M ${-hw - 4} ${hipY - 10} L ${hw + 4} ${hipY - 10} L ${hw + 14} ${hipY + len} L ${-hw - 14} ${hipY + len} Z`} fill={L.cloth2} {...ol} />;
      const chest = (fill: string) => <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw} ${hipY + 4} Q 0 ${hipY + 12} ${-hw} ${hipY + 4} Z`} fill={fill} {...ol} />;
      switch (L.outfit) {
        case 'tunic': return <g>{kilt(sit || kneel ? 22 : 44 * body)}{chest(L.cloth)}
          <path d={`M ${-hw - 10} ${hipY + 30 * body} L ${hw + 10} ${hipY + 30 * body}`} stroke={L.trim} strokeWidth={8} opacity={sit || kneel ? 0 : 1} />
          <path d={`M ${-hw + 2} ${hipY - 6} L ${hw - 2} ${hipY - 6}`} stroke={L.trim} strokeWidth={10} />
          <path d={`M ${-14 * body} ${shY - 2} Q 0 ${shY + 16} ${14 * body} ${shY - 2}`} fill={L.skin} {...ol} strokeWidth={5} /></g>;
        case 'scale': return <g>{kilt(sit || kneel ? 22 : 40 * body)}{chest(L.cloth)}
          {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 5 }).map((_, c) => <path key={r + '-' + c} d={`M ${-tw + 4 + c * 18 * body + (r % 2) * 9} ${shY + 20 + r * 20} q 8 14 16 0`} fill="none" stroke={BRD} strokeWidth={4} />))}
          <rect x={-hw} y={hipY - 14} width={hw * 2} height={14} fill={BRD} stroke={P.ink} strokeWidth={5} /></g>;
        case 'armor': return <g>
          {[0, 1, 2].map((k) => <path key={k} d={`M ${-hw - 6 - k * 3} ${hipY - 12 + k * 16} L ${hw + 6 + k * 3} ${hipY - 12 + k * 16} L ${hw + 10 + k * 3} ${hipY + 6 + k * 16} L ${-hw - 10 - k * 3} ${hipY + 6 + k * 16} Z`} fill={k % 2 ? BRL : BR} {...ol} strokeWidth={5} />)}
          <path d={`M ${-tw - 6} ${shY} Q 0 ${shY - 16} ${tw + 6} ${shY} L ${hw - 2} ${hipY - 8} Q 0 ${hipY} ${-hw + 2} ${hipY - 8} Z`} fill={BR} {...ol} />
          <path d={`M ${-tw + 6} ${shY + 30} Q ${-14} ${shY + 50} ${-4} ${shY + 34} M ${tw - 6} ${shY + 30} Q ${14} ${shY + 50} ${4} ${shY + 34}`} stroke={BRD} strokeWidth={5} fill="none" />
          <path d={`M ${-tw - 14} ${shY - 4} Q ${-tw} ${shY - 26} ${-tw + 24} ${shY - 6} L ${-tw + 12} ${shY + 20} Z M ${tw + 14} ${shY - 4} Q ${tw} ${shY - 26} ${tw - 24} ${shY - 6} L ${tw - 12} ${shY + 20} Z`} fill={BRL} {...ol} strokeWidth={5} />
          <path d={`M ${-12 * body} ${shY - 6} Q 0 ${shY + 8} ${12 * body} ${shY - 6}`} fill={L.skin} {...ol} strokeWidth={4} />
          <path d={`M ${-hw - 2} ${hipY + 6} L ${-hw - 8} ${hipY + 30} M ${-hw + 22} ${hipY + 6} L ${-hw + 20} ${hipY + 34} M ${hw - 22} ${hipY + 6} L ${hw - 20} ${hipY + 34}`} stroke={L.cloth} strokeWidth={10} strokeLinecap="round" opacity={sit ? 0 : 1} />
        </g>;
        case 'robe': case 'dress': {
          const bottom = sit ? hipY + 24 : kneel ? hipY + 40 : -6;
          return <g>
            {sit > .01 ? <path d={`M ${-hw - 10} ${hipY - 8} L ${hw + thigh * sit + 18} ${hipY - 8} L ${hw + thigh * sit + 22} ${-6} L ${hw + thigh * sit - 40} ${-6} L ${hw - 10} ${hipY + 24} L ${-hw - 10} ${hipY + 24} Z`} fill={L.cloth2} {...ol} />
              : <path d={`M ${-tw - 4} ${shY + 40} L ${tw + 4} ${shY + 40} L ${hw + 26} ${bottom} L ${-hw - 26} ${bottom} Z`} fill={L.outfit === 'dress' ? L.cloth : L.cloth2} {...ol} />}
            {L.outfit === 'dress' && !sit && [0, 1, 2].map((k) => <path key={k} d={`M ${-hw - 10 - k * 6} ${hipY + 20 + k * 22} L ${hw + 10 + k * 6} ${hipY + 20 + k * 22}`} stroke={L.trim} strokeWidth={7} />)}
            {L.outfit === 'robe' && !sit && <path d={`M ${-hw - 20} ${bottom - 14} L ${hw + 20} ${bottom - 14}`} stroke={L.trim} strokeWidth={10} />}
            <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw} ${hipY + 4} Q 0 ${hipY + 12} ${-hw} ${hipY + 4} Z`} fill={L.cloth} {...ol} />
            <path d={`M ${-tw} ${shY + 4} L ${tw - 10} ${hipY - 4}`} stroke={L.trim} strokeWidth={9} />
            <path d={`M ${-12 * body} ${shY - 2} Q 0 ${shY + 16} ${12 * body} ${shY - 2}`} fill={L.skin} {...ol} strokeWidth={5} />
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
        <path d={`M ${Math.min(inner, outer)} ${sx < 0 ? yOut : yIn} L ${Math.max(inner, outer)} ${sx < 0 ? yIn : yOut}`} stroke={P.ink} strokeWidth={7} strokeLinecap="round" />
      </g>;
    };
    const headPath = 'M -60 -10 C -62 -56 -30 -66 0 -66 C 32 -66 62 -54 60 -10 C 62 30 34 56 0 58 C -34 56 -62 30 -60 -10 Z';
    const hairBack = (() => {
      const c = L.hair;
      switch (L.hairStyle) {
        case 'long': return <path d="M -64 -10 C -70 -70 70 -70 64 -10 L 70 70 Q 40 84 30 50 L -30 50 Q -40 84 -70 70 Z" fill={c} {...ol} />;
        case 'curlyLong': return <g>{[[-62, 30, 20], [-66, 0, 22], [-60, -34, 24], [62, 30, 20], [66, 0, 22], [60, -34, 24], [-58, 58, 16], [58, 58, 16]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={c} {...ol} strokeWidth={5} />)}</g>;
        case 'wild': return <g>{Array.from({ length: 12 }).map((_, k) => { const a = Math.PI * (.9 + k * .11); return <path key={k} d={`M ${Math.cos(a) * 50} ${Math.sin(a) * 50} q ${Math.cos(a) * 40} ${Math.sin(a) * 40 + 20} ${Math.cos(a) * 30} ${Math.sin(a) * 70 + 40}`} stroke={c} strokeWidth={22} strokeLinecap="round" fill="none" />; })}</g>;
        case 'veil': return <path d="M -76 -20 C -80 -100 80 -100 76 -20 L 96 170 L -96 170 Z" fill={L.cloth} {...ol} />;
        case 'bald': return <g>{[-1, 1].map((q) => <path key={q} d={`M ${q * 56} 20 C ${q * 74} 0 ${q * 74} -30 ${q * 52} -48 C ${q * 68} -20 ${q * 66} 0 ${q * 56} 20 Z`} fill={c} {...ol} strokeWidth={5} />)}</g>;
        default: return null;
      }
    })();
    const hairFront = (() => {
      const c = L.hair;
      switch (L.hairStyle) {
        case 'curly': case 'curlyLong': return <g>{[[-56, -20, 20], [-58, -44, 22], [-44, -62, 24], [-20, -74, 24], [6, -76, 24], [30, -70, 23], [50, -54, 21], [58, -32, 18]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={c} {...ol} strokeWidth={5} />)}
          {[[-34, -50, 18], [-8, -58, 18], [18, -56, 17], [38, -48, 14]].map(([cx, cy, r], k) => <circle key={'f' + k} cx={cx} cy={cy} r={r} fill={c} />)}</g>;
        case 'long': return <path d="M -62 -12 C -66 -60 -30 -76 0 -76 C 34 -76 66 -60 62 -14 C 50 -40 30 -48 6 -46 L 0 -56 L -8 -44 C -30 -44 -52 -36 -62 -12 Z" fill={c} {...ol} />;
        case 'short': return <path d="M -62 -14 C -66 -60 -30 -76 0 -76 C 34 -76 66 -60 62 -16 C 50 -40 30 -50 4 -48 C -24 -46 -50 -40 -62 -14 Z" fill={c} {...ol} />;
        case 'wild': return <path d="M -62 -10 C -66 -60 -30 -78 0 -78 C 34 -78 66 -60 62 -10 C 54 -36 40 -30 30 -44 C 20 -30 0 -40 -10 -46 C -24 -30 -46 -40 -62 -10 Z" fill={c} {...ol} />;
        case 'veil': return <path d="M -66 -8 C -70 -84 70 -84 66 -8 C 56 -54 30 -62 0 -62 C -30 -62 -56 -54 -66 -8 Z" fill={L.cloth} {...ol} />;
        case 'bun': return <g><circle cx={0} cy={-78} r={26} fill={c} {...ol} /><path d="M -62 -10 C -66 -60 -30 -74 0 -74 C 34 -74 66 -60 62 -12 C 48 -42 24 -50 0 -50 C -26 -50 -48 -40 -62 -10 Z" fill={c} {...ol} /></g>;
        default: return null;
      }
    })();
    const helmet = (() => {
      switch (L.helmet) {
        case 'crest': return <g>
          <path d="M -66 4 C -70 -80 70 -80 66 4 L 56 4 L 50 -12 L -50 -12 L -56 4 Z" fill={BR} {...ol} />
          <path d="M -66 4 L -60 46 L -42 40 L -46 0 Z" fill={BRL} {...ol} strokeWidth={5} />
          <g transform="scale(-1 1)"><path d="M -40 -70 C -20 -120 60 -130 96 -84 C 110 -60 100 -20 86 6 C 80 -30 60 -66 10 -70 Z" fill={L.crestC || '#2a1a12'} {...ol} strokeWidth={6} />
          {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${10 + k * 20} -${96 - k * 6} q 14 30 6 64`} stroke="rgba(0,0,0,.25)" strokeWidth={4} fill="none" />)}</g>
          <path d="M -50 -12 L 50 -12" stroke={BRD} strokeWidth={6} /></g>;
        case 'boar': return <g>
          <path d="M -64 0 C -68 -90 68 -90 64 0 Z" fill="#efe4cc" {...ol} />
          {[0, 1, 2, 3].map((r) => <g key={r}>{Array.from({ length: 6 }).map((_, c) => <path key={c} d={`M ${-56 + c * 20 + (r % 2) * 10} ${-8 - r * 18} q 8 -14 18 0`} fill="#f6efdc" stroke={P.ink} strokeWidth={3.5} />)}</g>)}
          <circle cx={0} cy={-80} r={10} fill={BR} stroke={P.ink} strokeWidth={5} /><path d="M -64 0 L -58 40 L -44 36 L -48 0 Z" fill="#efe4cc" {...ol} strokeWidth={5} /></g>;
        case 'cap': return <g><path d="M -64 -6 C -68 -86 68 -86 64 -6 Z" fill="#8a5a34" {...ol} />{[0, 1, 2].map((k) => <path key={k} d={`M -60 ${-20 - k * 18} Q 0 ${-30 - k * 18} 60 ${-20 - k * 18}`} stroke="#5a3a20" strokeWidth={4} fill="none" />)}<circle cx={0} cy={-76} r={8} fill={BR} stroke={P.ink} strokeWidth={4} /></g>;
        case 'roman': return <g transform="translate(0 -26)">
          <path d="M -64 2 C -68 -86 68 -86 64 2 L 72 8 L -72 8 Z" fill={BR} {...ol} />
          <path d="M -64 0 L -58 52 L -36 46 L -40 0 Z M 64 0 L 58 52 L 36 46 L 40 0 Z" fill={BRL} {...ol} strokeWidth={5} />
          <rect x={-6} y={-96} width={12} height={20} fill={BRD} stroke={P.ink} strokeWidth={4} />
          <path d="M -6 -94 C -40 -150 40 -150 60 -110 C 40 -120 10 -120 6 -94 Z" fill={L.crestC || '#c8302a'} {...ol} strokeWidth={5} /></g>;
        case 'diadem': return <path d="M -62 -40 Q 0 -60 62 -40" stroke="#e8b860" strokeWidth={10} fill="none" />;
        case 'crown': return <g><path d="M -50 -50 L -40 -84 L -20 -60 L 0 -92 L 20 -60 L 40 -84 L 50 -50 Z" fill={BRL} {...ol} strokeWidth={5} /></g>;
        default: return null;
      }
    })();
    const nose = L.nose === 'big'
      ? <g><ellipse cx={fx + 4} cy={14} rx={14} ry={10} fill={L.skin} {...ol} strokeWidth={4.5} /></g>
      : <path d={`M ${fx + 2} 2 Q ${fx + 9} 14 ${fx - 2} 16`} fill="none" stroke={L.skinS} strokeWidth={5} strokeLinecap="round" />;
    const beard = (() => {
      switch (L.beard) {
        case 'full': return <path d={`M -54 6 C -50 80 50 80 54 6 C 44 40 ${fx + 16} 44 ${fx} 44 C ${fx - 16} 44 -44 40 -54 6 Z`} fill={L.hair} {...ol} />;
        case 'long': return <path d={`M -54 6 C -50 130 50 130 54 6 C 44 40 ${fx + 16} 44 ${fx} 44 C ${fx - 16} 44 -44 40 -54 6 Z`} fill={L.hair} {...ol} />;
        case 'short': return <path d={`M -54 10 C -46 66 46 66 54 10 C 42 40 ${fx + 16} 46 ${fx} 46 C ${fx - 16} 46 -42 40 -54 10 Z`} fill={L.hair} {...ol} strokeWidth={5} />;
        case 'stubble': return <path d={`M -50 14 C -42 62 42 62 50 14 C 36 44 ${fx + 14} 50 ${fx} 50 C -20 50 -38 42 -50 14 Z`} fill={L.hair} opacity={.28} />;
        default: return null;
      }
    })();
    const sh = L.shield && L.shield !== 'none' ? L.shield : null;
    return (
      <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s * (L.broad || 1)} ${s}) rotate(${leanTot})`} opacity={opacity}>
        {L.glow && <ellipse cx={0} cy={shY} rx={160} ry={260} fill="url(#heroGlow)" />}
        {sit < .5 && kneel < .5 && <ellipse cx={0} cy={4} rx={56 * body} ry={10 * body} fill="rgba(20,14,10,.25)" />}
        {arm(-1, armB, elbowB, holdB, false)}
        {!(skirt && sit < .01 && !kneel) && sit < .01 && <>{leg(-1, -sw)}{leg(1, sw)}</>}
        {skirt && sit < .01 && !kneel && [-1, 1].map((q) => <ellipse key={q} cx={q * 20 * body + 8} cy={-6} rx={20 * body} ry={8 * body} fill={L.skin} {...ol} strokeWidth={5} />)}
        {L.cloak && <path d={`M ${-tw - 6} ${shY} L ${-hw - 30} ${hipY + 60} L ${-hw + 10} ${hipY + 70} Z`} fill={L.cloak} stroke={P.ink} strokeWidth={6} />}
        {torso}
        {L.apron && <path d={`M ${-hw + 6} ${shY + 50} L ${hw - 6} ${shY + 50} L ${hw + 2} ${hipY + 50} L ${-hw - 2} ${hipY + 50} Z`} fill={L.apron} stroke={P.ink} strokeWidth={5} />}
        {sit >= .01 && <>{leg(-1, 0)}{leg(1, 0)}</>}
        <g transform={`translate(${turn * 4} ${headY}) rotate(${tilt}) scale(${headS})`}>
          {L.helmet !== 'crest' && L.helmet !== 'boar' && L.helmet !== 'cap' && L.helmet !== 'roman' && hairBack}
          {(L.helmet === 'crest' || L.helmet === 'boar' || L.helmet === 'cap' || L.helmet === 'roman') && (L.hairStyle === 'long' || L.hairStyle === 'curlyLong') && <path d="M -60 0 L -66 60 Q -40 70 -36 40 Z M 60 0 L 66 60 Q 40 70 36 40 Z" fill={L.hair} {...ol} strokeWidth={5} />}
          {[-1, 1].map((q) => <ellipse key={q} cx={q * 62} cy={2} rx={10} ry={14} fill={L.skinS} {...ol} />)}
          <path d={headPath} fill={L.skin} {...ol} />
          <path d="M 30 42 C 44 32 54 16 56 -4" fill="none" stroke={L.skinS} strokeWidth={9} strokeLinecap="round" opacity={.7} />
          {(!L.helmet || L.helmet === 'none' || L.helmet === 'crown' || L.helmet === 'diadem') && hairFront}
          {beard}
          {[-1, 1].map(eye)}
          {nose}
          {L.wrinkles && [-1, 1].map((q) => <path key={q} d={`M ${fx + q * 38} 0 l ${q * 8} -4 M ${fx + q * 38} 6 l ${q * 9} 0`} stroke={L.skinS} strokeWidth={3} strokeLinecap="round" />)}
          <circle cx={fx - 30} cy={18} r={8} fill="#d86a4f" opacity={expr === 'laugh' || expr === 'happy' || expr === 'excited' ? .45 : .22} /><circle cx={fx + 30} cy={18} r={8} fill="#d86a4f" opacity={expr === 'laugh' || expr === 'happy' || expr === 'excited' ? .45 : .22} />
          {L.freckles && [[-34, 10], [-26, 16], [-40, 18], [30, 10], [38, 16], [24, 18]].map(([a, b], k) => <circle key={k} cx={fx + a} cy={b} r={2.5} fill="#a8603a" />)}
          {mouthEl}
          {helmet}
        </g>
        {sh && <g transform={`translate(${34 * body - shieldUp * 6} ${shY + (sh === 'tower' || sh === 'scutum' ? 150 : 128) - shieldUp * 42}) rotate(${-4 - shieldUp * 4})`}><Shield kind={sh} c={L.shieldC || '#b0402a'} s={(sh === 'tower' || sh === 'scutum' ? .62 : .72) * body} /></g>}
        {arm(1, armF, elbowF, holdF, true)}
      </g>
    );
  };

/* ---------- horse + chariot (side view, gallop cycle) ---------- */
export const Horse: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; gallop?: number; c?: string; mane?: string }> = ({ x, y, s = 1, flip, ph = 0, gallop = 1, c = '#8a4a2a', mane = '#2a1a12' }) => {
  const ol = { stroke: P.ink, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const bob = Math.sin(ph * 2) * 8 * gallop;
  const legA = (o: number, front: boolean) => Math.sin(ph + o) * (front ? 38 : 34) * gallop;
  const leg = (lx: number, o: number, front: boolean, back: boolean) => {
    const a = legA(o, front), k = Math.max(0, Math.sin(ph + o + 1)) * 60 * gallop;
    return <g transform={`translate(${lx} -150) rotate(${a})`} opacity={back ? .8 : 1}>
      <rect x={-13} y={-10} width={26} height={78} rx={12} fill={back ? '#6a3a20' : c} {...ol} />
      <g transform={`translate(0 66) rotate(${front ? -k : k})`}><rect x={-9} y={-6} width={18} height={78} rx={8} fill={back ? '#6a3a20' : c} {...ol} /><rect x={-11} y={66} width={22} height={14} rx={4} fill="#2a1a12" /></g>
    </g>;
  };
  return <g transform={`translate(${x} ${y + bob}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {leg(-70, 0, false, true)}{leg(90, 1.6, true, true)}
    <path d={`M -150 -200 Q -190 -190 -200 ${-150 + Math.sin(ph * 2) * 20}`} stroke={mane} strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M -130 -230 C -60 -260 80 -250 120 -220 C 140 -200 140 -160 110 -140 C 60 -126 -60 -126 -120 -140 C -150 -156 -156 -210 -130 -230 Z" fill={c} {...ol} />
    <path d="M 90 -228 C 120 -280 150 -330 170 -350 L 236 -300 C 240 -290 236 -276 226 -276 L 180 -284 C 160 -250 150 -210 130 -180 Z" fill={c} {...ol} />
    <path d="M 100 -236 C 120 -290 150 -330 172 -352 C 150 -320 140 -300 124 -250 Z" fill={mane} {...ol} strokeWidth={5} />
    <path d="M 170 -350 L 176 -380 L 190 -356" fill={c} {...ol} strokeWidth={5} />
    <circle cx={196} cy={-322} r={6} fill={P.ink} />
    <path d="M 160 -300 L 236 -296" stroke="#e0a83a" strokeWidth={6} />
    {leg(-90, 3.1, false, false)}{leg(70, 4.7, true, false)}
    <rect x={-60} y={-236} width={120} height={18} fill="#b0402a" stroke={P.ink} strokeWidth={5} />
  </g>;
};
export const Chariot: React.FC<{ x: number; y: number; s?: number; flip?: boolean; t: number; speed?: number; driver?: MLook; warrior?: MLook; pose?: MPose }> = ({ x, y, s = 1, flip, t, speed = 1, driver, warrior, pose }) => {
  const ol = { stroke: P.ink, strokeWidth: 7, strokeLinejoin: 'round' as const };
  const ph = t * 9 * speed;
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <Horse x={420} y={0} ph={ph + 1.2} gallop={speed} c="#5a3a20" s={.9} />
    <line x1={-60} y1={-120} x2={400} y2={-190} stroke={P.ink} strokeWidth={12} /><line x1={-60} y1={-120} x2={400} y2={-190} stroke="#8a5a34" strokeWidth={6} />
    {warrior && <MChar look={warrior} x={-90} y={-88} s={1} pose={{ holdF: 'spear', armF: -.6, elbowF: .8, ...pose }} />}
    {driver && <MChar look={driver} x={-10} y={-88} s={.95} pose={{ holdF: 'reins', armF: -1.2, elbowF: .9, lean: 8 }} />}
    <path d="M -170 -230 L -170 -110 L 20 -110 L 30 -200 Q -60 -240 -170 -230 Z" fill="#b0402a" {...ol} />
    <path d="M -150 -200 Q -70 -220 10 -190" stroke="#e0a83a" strokeWidth={8} fill="none" />
    <Horse x={300} y={0} ph={ph} gallop={speed} c="#8a4a2a" />
    <g transform={`translate(-80 -60) rotate(${t * 400 * speed})`}><circle r={62} fill="none" stroke={P.ink} strokeWidth={14} /><circle r={62} fill="none" stroke="#8a5a34" strokeWidth={7} />{[0, 1, 2, 3].map((k) => <line key={k} x1={0} y1={0} x2={Math.cos(k * .785 * 2) * 60} y2={Math.sin(k * .785 * 2) * 60} stroke={P.ink} strokeWidth={8} />)}<circle r={12} fill="#c9913a" stroke={P.ink} strokeWidth={5} /></g>
  </g>;
};

export const Chair: React.FC<{ x: number; y: number; s?: number; flip?: boolean; c?: string }> = ({ x, y, s = 1.2, flip, c = '#8a5a34' }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <rect x={-58} y={-56} width={116} height={20} rx={6} fill={c} stroke={P.ink} strokeWidth={6} />
    {[-44, 44].map((a) => <rect key={a} x={a - 7} y={-40} width={14} height={40} fill={c} stroke={P.ink} strokeWidth={5} />)}
  </g>
);
