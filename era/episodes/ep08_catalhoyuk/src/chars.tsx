import React from 'react';
import { clamp, lerp } from './lib';
import { P } from './art';

/* ===== ep08 Çatalhöyük cast — rig v8 adds: hide tunic with fringe, leopard-skin hunter's wrap, bead necklaces, bow, basket, obsidian mirror, plaster brush, sling,
   and animals: aurochs (wild bull), sheep, dog.
   (ep07) Alexander cast — rig v7 adds: Macedonian Phrygian helmet (+ Alexander's two white plumes), kausia, Persian tiara & bashlyk, Indian turban, royal diadem with ribbons,
   'lion' hair (Alexander's swept-up anastole), linen cuirass with pteruges, star shield (Vergina sun), 6 m sarissa, wax tablet, Persian axe, Philip's eye patch.
   (ep06) Spartacus cast — rig v6: gladiator kit (bare-chest loincloth + bronze belt, Thracian griffin helmet,
   Samnite plumed helmet, Gallic helmet, legion helmet; parmula / scutum / oval shields; manica arm guard; one or two greaves),
   Roman toga & mail lorica, slave rags, cloaks, Gallic moustache + torque, scars, Thracian tattoos.
   NEW in ep06: world-angle blades (gladius, curved sica, wooden rudis, cleaver, spit), the hero's red-ochre face stripe is back,
   fight poses come from shots.tsx `fight()` ===== */
export type Mouth = 'smile' | 'grin' | 'O' | 'flat' | 'sad' | 'talk' | 'shout' | 'smirk';
export type Expr = 'neutral' | 'happy' | 'laugh' | 'surprised' | 'angry' | 'worried' | 'thinking' | 'sad' | 'excited' | 'sleepy' | 'fierce' | 'scared';
export type MLook = {
  skin: string; skinS: string; hair: string;
  hairStyle: 'lion' | 'long' | 'curlyLong' | 'short' | 'bun' | 'veil' | 'bald' | 'curly' | 'wild' | 'scarf' | 'braids';
  outfit: 'hide' | 'leopard' | 'linen' | 'tunic' | 'loin' | 'toga' | 'lorica' | 'robe' | 'dress' | 'rags';
  cloth: string; cloth2: string; trim?: string;
  beard?: 'full' | 'short' | 'stubble' | 'long' | 'mous'; helmet?: 'phrygian' | 'kausia' | 'tiara' | 'bashlyk' | 'turban' | 'thraex' | 'samnite' | 'gaul' | 'legion' | 'cap' | 'none'; crestC?: string;
  shield?: 'hoplon' | 'parmula' | 'scutum' | 'oval' | 'legion' | 'none'; shieldC?: string; wrinkles?: boolean; eyeS?: number; broad?: number; nose?: 'big' | 'small'; tall?: number;
  greaves?: boolean | 'one'; patch?: boolean; beads?: string; diadem?: boolean; plumes?: boolean; manica?: boolean; cloak?: string; stripe?: boolean; scar?: boolean; tattoo?: boolean; torque?: boolean; belly?: boolean; earring?: boolean; glow?: boolean;
};
export const SK = { a: ['#e8b88a', '#c8966a'], b: ['#d9a070', '#b88050'], c: ['#c88a5a', '#a86a40'], d: ['#f0caa0', '#d4a880'], e: ['#9a6a42', '#7a4e2c'], f: ['#6e4a30', '#55361f'] };
const BR = '#c9913a', BRL = '#e8b860', BRD = '#8a5a22', STEEL = '#c8ccd0', STEELD = '#8a9098', IRON = '#7a7a80';
export const RC = { red: '#a8322a', redD: '#6e1f1a', gold: '#d9a441', bone: '#efe6d2', ink: '#21160f', purple: '#5a2a5a', green: '#4f6a3a', blue: '#3a5f88', brown: '#7a5634', grey: '#8a8478' };
const G = (o: Partial<MLook>): MLook => ({ skin: SK.b[0], skinS: SK.b[1], hair: '#2a1a12', hairStyle: 'curly', outfit: 'tunic', cloth: '#d9cdb0', cloth2: '#a89878', trim: '#7a5634', helmet: 'none', shield: 'none', ...o });

const HIDE = '#a8784a', HIDED = '#8a5e36', HIDEL = '#c89a68', OCH = '#b5432a';
const youBase = { skin: SK.b[0], skinS: SK.b[1], hair: '#4a2c18', hairStyle: 'curly' as const, stripe: true, outfit: 'hide' as const, cloth: HIDEL, cloth2: HIDE, trim: OCH, beads: '#3a6a5a' };
export const CAST: Record<string, MLook> = {
  you: G({ ...youBase }),
  youH: G({ ...youBase, outfit: 'leopard', cloth: HIDEL, cloth2: HIDE }),
  sis: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#2a1a12', hairStyle: 'braids', outfit: 'dress', cloth: HIDEL, cloth2: '#efe6d2', trim: OCH, beads: '#c0643a', eyeS: 1.1 }),
  mom: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#2a1a12', hairStyle: 'long', outfit: 'dress', cloth: '#9a6a42', cloth2: '#d8c8a0', trim: OCH, beads: '#efe6d2' }),
  fat: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#2a1a12', hairStyle: 'braids', beard: 'full', outfit: 'hide', cloth: HIDE, cloth2: HIDED, trim: OCH, broad: 1.12, beads: '#3a6a5a' }),
  fatH: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#2a1a12', hairStyle: 'braids', beard: 'full', outfit: 'leopard', cloth: HIDE, cloth2: HIDED, trim: OCH, broad: 1.12, beads: '#3a6a5a' }),
  hun: G({ skin: SK.e[0], skinS: SK.e[1], hair: '#1a110a', hairStyle: 'wild', beard: 'short', outfit: 'leopard', cloth: HIDE, cloth2: HIDED, trim: OCH, broad: 1.15, tall: 1.06, scar: true, beads: '#efe6d2' }),
  nei: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#9a9488', hairStyle: 'bald', beard: 'full', outfit: 'hide', cloth: '#8a6a4a', cloth2: '#6a4a2a', trim: '#5a3a20', wrinkles: true, belly: true, nose: 'big' }),
  tra: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#5a3a26', hairStyle: 'long', beard: 'short', outfit: 'tunic', cloth: '#b5432a', cloth2: '#7a2a1a', trim: '#efe6d2', cloak: '#6a5a40', earring: true, beads: '#16121a' }),
  eld: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#e2ddd2', hairStyle: 'long', beard: 'long', outfit: 'hide', cloth: '#9a7a5a', cloth2: '#7a5a3a', trim: OCH, wrinkles: true, beads: '#efe6d2' }),
};
export const villager = (i: number): MLook => { const sk = [SK.a, SK.b, SK.c, SK.e, SK.d][i % 5]; const w = i % 3 === 1;
  return G({ skin: sk[0], skinS: sk[1], hair: ['#2a1a12', '#4a2c18', '#1a110a', '#6a4a2a'][i % 4], hairStyle: w ? (['long', 'braids', 'bun'] as const)[i % 3] : (['short', 'curly', 'wild', 'braids'] as const)[i % 4],
    beard: w ? undefined : (['full', undefined, 'short', 'stubble'] as const)[i % 4], outfit: w ? 'dress' : 'hide', cloth: [HIDEL, '#9a6a42', '#c8a878', '#8a6a4a'][i % 4], cloth2: [HIDE, '#d8c8a0', HIDED][i % 3], trim: OCH, beads: ['#3a6a5a', '#efe6d2', '#c0643a', undefined][i % 4] as any,
    wrinkles: i % 7 === 3 }); };
export const macedon = (i: number, kit?: string) => villager(i);
export const persian = (i: number) => villager(i + 2);
export const indian = (i: number) => villager(i + 4);
export const legionary = (i: number) => villager(i);
export const rebel = (i: number, armed = true) => villager(i);
export const gladiator = (i: number) => villager(i);

export type Prop = 'none' | 'bow' | 'basket' | 'mirror' | 'brush' | 'sling' | 'horn' | 'sarissa' | 'tablet' | 'axe' | 'kopis' | 'helmetW' | 'goblet' | 'spear' | 'gladius' | 'sica' | 'rudis' | 'cleaver' | 'spit' | 'stick' | 'whip' | 'torch' | 'cup' | 'bowl' | 'reins' | 'scroll' | 'vine' | 'bread' | 'coins';
export type MPose = {
  walk?: number; phase?: number; armF?: number; armB?: number; elbowF?: number; elbowB?: number; tilt?: number; turn?: number; blink?: number;
  mouth?: Mouth; open?: number; brow?: number; lookX?: number; lookY?: number; bob?: number; crouch?: number;
  holdF?: Prop; holdB?: Prop; lean?: number; sit?: number; kneel?: number; expr?: Expr; handF?: 'open' | 'point' | 'fist' | 'finger'; shieldUp?: number; run?: number; propA?: number; propB?: number; hurt?: number;
};
const OL = 7;
const HAND = 'M -10 -4 C -13 7 -10 17 -1 19 C 8 20 12 12 11 1 C 10 -5 4 -7 -2 -7 Z';
const THUMB = 'M 7 -1 C 16 -3 19 6 11 10';
const FIST = 'M -11 -4 C -14 6 -10 16 0 16 C 10 16 13 8 12 -2 C 10 -8 -8 -8 -11 -4 Z';
const POINT = 'M -10 -4 C -13 6 -10 14 -1 15 C 6 15 9 10 9 4 L 9 26 C 9 31 3 31 3 26 L 3 8 M -10 -4 C -6 -8 6 -8 10 -2';
const UPRIGHT: Prop[] = ['brush', 'sarissa', 'axe', 'kopis', 'spear', 'gladius', 'sica', 'rudis', 'cleaver', 'spit', 'stick', 'whip', 'torch'];

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

export const Shield: React.FC<{ kind: 'hoplon' | 'parmula' | 'scutum' | 'oval' | 'legion'; c: string; s?: number }> = ({ kind, c, s = 1 }) => {
  const ol = { stroke: P.ink, strokeWidth: 7 / s, strokeLinejoin: 'round' as const };
  if (kind === 'hoplon') return <g transform={`scale(${s})`}><circle r={86} fill={BR} {...ol} /><circle r={70} fill={c} stroke={BRD} strokeWidth={5 / s} />
    {Array.from({ length: 16 }).map((_, k) => { const a = k / 16 * Math.PI * 2; return <path key={k} d={`M ${Math.cos(a - .09) * 14} ${Math.sin(a - .09) * 14} L ${Math.cos(a) * 58} ${Math.sin(a) * 58} L ${Math.cos(a + .09) * 14} ${Math.sin(a + .09) * 14} Z`} fill={BRL} />; })}<circle r={14} fill={BRL} stroke={P.ink} strokeWidth={3 / s} /></g>;
  if (kind === 'parmula') return <g transform={`scale(${s})`}><rect x={-62} y={-70} width={124} height={130} rx={10} fill={c} {...ol} />
    <rect x={-48} y={-56} width={96} height={102} rx={6} fill="none" stroke={BRL} strokeWidth={6 / s} /><circle r={16} fill={BR} stroke={P.ink} strokeWidth={5 / s} />
    {[[-48, -56], [48, -56], [-48, 46], [48, 46]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={5} fill={BRL} />)}</g>;
  if (kind === 'scutum' || kind === 'legion') return <g transform={`scale(${s})`}><path d="M -64 -140 Q 0 -156 64 -140 L 66 130 Q 0 146 -66 130 Z" fill={c} {...ol} />
    <path d="M -50 -124 Q 0 -138 50 -124 L 52 116 Q 0 130 -52 116 Z" fill="none" stroke={kind === 'legion' ? BRL : 'rgba(255,255,255,.35)'} strokeWidth={5 / s} />
    <rect x={-10} y={-138} width={20} height={270} fill="rgba(0,0,0,.18)" /><ellipse rx={26} ry={20} fill={BR} stroke={P.ink} strokeWidth={5 / s} />
    {kind === 'legion' && [-1, 1].map((q) => <g key={q}><path d={`M ${q * 14} -60 q ${q * 30} -10 ${q * 40} -50 q ${q * -6} 40 ${q * -20} 54 Z`} fill={BRL} /><path d={`M ${q * 14} 60 q ${q * 30} 10 ${q * 40} 50 q ${q * -6} -40 ${q * -20} -54 Z`} fill={BRL} /></g>)}</g>;
  return <g transform={`scale(${s})`}><ellipse rx={58} ry={140} fill={c} {...ol} /><ellipse rx={44} ry={124} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={5 / s} />
    <rect x={-8} y={-130} width={16} height={260} fill="rgba(0,0,0,.2)" /><ellipse rx={20} ry={30} fill={IRON} stroke={P.ink} strokeWidth={5 / s} /></g>;
};

export const MChar: React.FC<{ look: MLook; pose?: MPose; x: number; y: number; s?: number; flip?: boolean; age?: number; opacity?: number }> =
  ({ look, pose = {}, x, y, s = 1, flip = false, age = 1, opacity = 1 }) => {
    const { walk = 0, phase = 0, armF = .15, armB = -.15, elbowF = .35, elbowB = .25, tilt = 0, turn = .35, blink = 0, open = 0,
      brow = 0, lookX = 0, lookY = 0, bob = 0, crouch = 0, holdF = 'none', holdB = 'none', lean = 0, sit = 0, kneel = 0, expr = 'neutral', handF = 'open', shieldUp = 0, run = 0, propA = 0, propB = 0, hurt = 0 } = pose;
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
    const L = look; const skirt = L.outfit === 'dress' || L.outfit === 'robe' || L.outfit === 'toga';
    const U = 46 * body, Fa = 44 * body;
    const leanTot = lean + run * 8 * walk;
    const bare = L.outfit === 'loin';

    const blade = (d: string, c = STEEL) => <path d={d} fill={c} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />;
    const prop = (p: Prop) => {
      switch (p) {
        case 'bow': return <g transform="rotate(90)"><path d="M -90 -10 Q 0 -70 90 -10" stroke={P.ink} strokeWidth={9} fill="none" strokeLinecap="round" /><path d="M -90 -10 Q 0 -70 90 -10" stroke="#8a5a34" strokeWidth={4} fill="none" /><line x1={-90} y1={-10} x2={90} y2={-10} stroke="#d8c8a0" strokeWidth={2} /></g>;
        case 'basket': return <g transform="translate(4 -20)"><path d="M -40 -30 L 40 -30 L 32 26 Q 0 34 -32 26 Z" fill="#c8a060" stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />{[0, 1, 2].map((k) => <path key={k} d={`M -36 ${-16 + k * 14} L 36 ${-16 + k * 14}`} stroke="#8a6a3a" strokeWidth={3} />)}<path d="M -30 -30 Q 0 -70 30 -30" stroke={P.ink} strokeWidth={5} fill="none" /></g>;
        case 'mirror': return <g transform="translate(6 -22)"><ellipse rx={24} ry={28} fill="#16121a" stroke={P.ink} strokeWidth={5} /><path d="M -10 -14 Q -2 -20 8 -16" stroke="#8a8aa0" strokeWidth={4} fill="none" /></g>;
        case 'brush': return <g><rect x={-5} y={-80} width={10} height={90} rx={4} fill="#8a5a34" stroke={P.ink} strokeWidth={4} /><path d="M -12 -80 L 12 -80 L 8 -110 L -8 -110 Z" fill="#efe9dc" stroke={P.ink} strokeWidth={4} /></g>;
        case 'sling': return <g><path d="M 0 0 Q -20 50 0 80 Q 20 50 0 0" stroke="#7a5634" strokeWidth={4} fill="none" /><circle cy={80} r={10} fill="#b89070" stroke={P.ink} strokeWidth={3} /></g>;
        case 'horn': return <g transform="translate(0 -20)"><path d="M -50 0 Q -70 -60 -30 -80 Q -50 -40 -20 -10 L 20 -10 Q 50 -40 30 -80 Q 70 -60 50 0 Z" fill="#efe6d2" stroke={P.ink} strokeWidth={5} /><rect x={-24} y={-14} width={48} height={30} rx={8} fill="#d8ccb0" stroke={P.ink} strokeWidth={4} /></g>;
        case 'sarissa': return <g><line x1={0} y1={260} x2={0} y2={-760} stroke={P.ink} strokeWidth={11} strokeLinecap="round" /><line x1={0} y1={260} x2={0} y2={-760} stroke="#a8743e" strokeWidth={4.5} /><path d="M -11 -760 L 0 -830 L 11 -760 Z" fill={STEEL} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" /><rect x={-7} y={250} width={14} height={30} fill={BR} stroke={P.ink} strokeWidth={3} /></g>;
        case 'axe': return <g><line x1={0} y1={30} x2={0} y2={-120} stroke={P.ink} strokeWidth={10} strokeLinecap="round" /><line x1={0} y1={30} x2={0} y2={-120} stroke="#6a4426" strokeWidth={4} /><path d="M 0 -118 Q 50 -140 56 -100 Q 50 -70 0 -86 Z" fill={STEEL} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" /></g>;
        case 'kopis': return <g>{blade('M -8 -14 L -10 -70 Q -4 -110 18 -118 Q 10 -80 9 -14 Z')}<rect x={-18} y={-18} width={36} height={9} rx={4} fill={BR} stroke={P.ink} strokeWidth={4} /><path d="M -6 -9 L -6 14 Q 6 20 8 6 L 6 -9 Z" fill="#5a3a20" stroke={P.ink} strokeWidth={3} /></g>;
        case 'tablet': return <g transform="translate(0 -18) rotate(-10)"><rect x={-34} y={-24} width={68} height={48} rx={4} fill="#8a5a34" stroke={P.ink} strokeWidth={4} /><rect x={-28} y={-18} width={56} height={36} fill="#3a2a1a" />{[0, 1, 2].map((k) => <path key={k} d={`M -22 ${-10 + k * 10} q 8 -4 16 0 q 8 4 16 0`} stroke="#c8a870" strokeWidth={2} fill="none" />)}</g>;
        case 'helmetW': return <g transform="translate(4 -20)"><path d="M -30 0 C -32 -44 32 -44 30 0 Z" fill={BR} stroke={P.ink} strokeWidth={5} /><ellipse cy={0} rx={30} ry={8} fill="#6aaad0" stroke={P.ink} strokeWidth={4} /></g>;
        case 'goblet': return <g transform="translate(4 -10)"><path d="M -24 -30 Q 0 -10 24 -30 L 18 -8 Q 0 2 -18 -8 Z" fill={RC.gold} stroke={P.ink} strokeWidth={4} /><rect x={-3} y={-6} width={6} height={16} fill={RC.gold} /><ellipse cy={12} rx={14} ry={4} fill={RC.gold} stroke={P.ink} strokeWidth={3} /><ellipse cy={-28} rx={20} ry={4} fill="#6a1a2a" /></g>;
        case 'spear': return <g><line x1={0} y1={170} x2={0} y2={-230} stroke={P.ink} strokeWidth={12} strokeLinecap="round" /><line x1={0} y1={170} x2={0} y2={-230} stroke="#8a5a34" strokeWidth={5} /><path d="M -12 -230 L 0 -290 L 12 -230 Z" fill={STEEL} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" /></g>;
        case 'gladius': return <g>{blade('M -9 -14 L -9 -100 L 0 -122 L 9 -100 L 9 -14 Z')}<line x1={0} y1={-20} x2={0} y2={-104} stroke={STEELD} strokeWidth={3} /><rect x={-20} y={-18} width={40} height={10} rx={4} fill={BR} stroke={P.ink} strokeWidth={4} /><rect x={-6} y={-8} width={12} height={24} fill="#5a3a20" stroke={P.ink} strokeWidth={3} /><circle cy={20} r={8} fill={BR} stroke={P.ink} strokeWidth={4} /></g>;
        case 'sica': return <g>{blade('M -7 -14 Q -14 -60 6 -104 Q 22 -118 26 -112 Q 4 -80 7 -14 Z')}<rect x={-18} y={-18} width={36} height={9} rx={4} fill={BR} stroke={P.ink} strokeWidth={4} /><rect x={-6} y={-9} width={12} height={22} fill="#5a3a20" stroke={P.ink} strokeWidth={3} /></g>;
        case 'rudis': return <g><path d="M -10 -14 L -10 -104 Q 0 -122 10 -104 L 10 -14 Z" fill="#a8743e" stroke={P.ink} strokeWidth={5} strokeLinejoin="round" /><line x1={-2} y1={-30} x2={-2} y2={-96} stroke="#7a5228" strokeWidth={3} /><rect x={-18} y={-18} width={36} height={9} rx={4} fill="#7a5228" stroke={P.ink} strokeWidth={4} /><rect x={-6} y={-9} width={12} height={22} fill="#5a3a20" stroke={P.ink} strokeWidth={3} /></g>;
        case 'cleaver': return <g><rect x={-5} y={-50} width={10} height={64} rx={4} fill="#6a4426" stroke={P.ink} strokeWidth={4} />{blade('M -6 -46 L -6 -104 L 46 -104 Q 54 -76 44 -46 Z', '#b8bcc0')}</g>;
        case 'spit': return <g><line x1={0} y1={14} x2={0} y2={-180} stroke={P.ink} strokeWidth={9} strokeLinecap="round" /><line x1={0} y1={14} x2={0} y2={-180} stroke={IRON} strokeWidth={4} /><path d="M -6 -176 L 0 -200 L 6 -176 Z" fill={IRON} stroke={P.ink} strokeWidth={3} /><circle cy={20} r={9} fill="none" stroke={P.ink} strokeWidth={5} /></g>;
        case 'stick': return <g><line x1={0} y1={60} x2={0} y2={-220} stroke={P.ink} strokeWidth={11} strokeLinecap="round" /><line x1={0} y1={60} x2={0} y2={-220} stroke="#c8a870" strokeWidth={5} /></g>;
        case 'whip': return <g><rect x={-6} y={-44} width={12} height={56} rx={5} fill="#5a3a20" stroke={P.ink} strokeWidth={4} /><path d="M 0 -42 Q 40 -90 80 -40 Q 110 0 70 60" fill="none" stroke={P.ink} strokeWidth={6} strokeLinecap="round" /></g>;
        case 'torch': return <g><rect x={-7} y={-90} width={14} height={110} fill="#6a3a1e" stroke={P.ink} strokeWidth={4} /><path d="M -16 -88 Q -20 -130 0 -160 Q 20 -130 16 -88 Z" fill="#ffb347" stroke={P.ink} strokeWidth={4} /><path d="M -7 -92 Q -8 -116 0 -132 Q 8 -116 7 -92 Z" fill="#fff2a0" /></g>;
        case 'cup': return <g><path d="M -20 -26 L 20 -26 L 16 6 L -16 6 Z" fill="#a8743e" stroke={P.ink} strokeWidth={4} strokeLinejoin="round" /></g>;
        case 'bowl': return <g transform="translate(6 -10)"><path d="M -34 -10 L 34 -10 Q 30 22 0 24 Q -30 22 -34 -10 Z" fill="#a8603a" stroke={P.ink} strokeWidth={5} strokeLinejoin="round" /><ellipse cy={-10} rx={34} ry={8} fill="#d8c08a" stroke={P.ink} strokeWidth={4} />{[-14, 0, 12].map((q) => <circle key={q} cx={q} cy={-12} r={4} fill="#8a6a3a" />)}</g>;
        case 'bread': return <ellipse cx={4} cy={-6} rx={22} ry={13} fill="#d89a4a" stroke={P.ink} strokeWidth={4} />;
        case 'reins': return <path d="M 0 0 Q 60 30 140 -10" fill="none" stroke="#5a3a20" strokeWidth={6} />;
        case 'scroll': return <g transform="translate(0 -14)"><rect x={-30} y={-14} width={60} height={28} fill="#efe2c0" stroke={P.ink} strokeWidth={4} /><circle cx={-30} r={10} fill="#d8c8a0" stroke={P.ink} strokeWidth={4} /><circle cx={30} r={10} fill="#d8c8a0" stroke={P.ink} strokeWidth={4} /></g>;
        case 'vine': return <g transform="translate(0 -10)">{[0, 1, 2].map((k) => <ellipse key={k} cx={10 + k * 6} cy={0} rx={34 - k * 4} ry={14 - k * 2} fill="none" stroke="#4f6a2a" strokeWidth={7} />)}<path d="M 30 0 q 30 30 10 80" stroke="#4f6a2a" strokeWidth={7} fill="none" /><ellipse cx={46} cy={-10} rx={12} ry={7} fill="#6a8a3a" stroke={P.ink} strokeWidth={3} /></g>;
        case 'coins': return <g transform="translate(4 -16)"><path d="M -24 -8 Q 0 -26 24 -8 L 20 18 Q 0 26 -20 18 Z" fill="#8a6a3a" stroke={P.ink} strokeWidth={4} /><circle cx={0} cy={-14} r={7} fill={RC.gold} stroke={P.ink} strokeWidth={3} /></g>;
        default: return null;
      }
    };
    const armoredTop = L.outfit === 'lorica';
    const arm = (side: number, a: number, el: number, hold: Prop, front: boolean, pa: number) => (
      <g transform={`translate(${side * 36 * body} ${shY + 14}) rotate(${a * 57})`}>
        <rect x={-15 * body} y={-8} width={30 * body} height={U + 12} rx={14 * body} fill={L.skin} {...ol} />
        {!bare && <path d={`M ${-17 * body} -10 Q 0 ${-20} ${17 * body} -10 L ${16 * body} ${U * .45} L ${-16 * body} ${U * .45} Z`} fill={armoredTop ? L.cloth : L.cloth} {...ol} strokeWidth={5} />}
        {armoredTop && <path d={`M ${-16 * body} ${U * .45} L ${16 * body} ${U * .45}`} stroke={L.cloth2} strokeWidth={6} />}
        {front && L.manica && [0, 1, 2, 3].map((k) => <rect key={k} x={-17 * body} y={-6 + k * 14} width={34 * body} height={14} rx={6} fill={k % 2 ? '#e8dcc0' : '#d8ccb0'} stroke={P.ink} strokeWidth={4} />)}
        {!front && L.tattoo && <path d={`M -8 ${U * .3} l 8 8 l 8 -8 M -8 ${U * .5} l 8 8 l 8 -8`} stroke="#2a3a5a" strokeWidth={3} fill="none" />}
        <g transform={`translate(0 ${U}) rotate(${-el * 57})`}>
          <rect x={-13 * body} y={-10} width={26 * body} height={Fa + 6} rx={12 * body} fill={L.skin} {...ol} />
          {front && L.manica && [0, 1, 2].map((k) => <rect key={k} x={-15 * body} y={-8 + k * 14} width={30 * body} height={14} rx={6} fill={k % 2 ? '#e8dcc0' : '#d8ccb0'} stroke={P.ink} strokeWidth={4} />)}
          {armoredTop && <rect x={-14 * body} y={Fa * .45} width={28 * body} height={12} rx={5} fill="#5a3a20" stroke={P.ink} strokeWidth={4} />}
          {!front && L.tattoo && <path d={`M -9 ${Fa * .2} l 18 0 M -9 ${Fa * .35} l 9 8 l 9 -8`} stroke="#2a3a5a" strokeWidth={3} fill="none" />}
          <g transform={`translate(0 ${Fa + 2}) scale(${body * 1.05 / (L.tall || 1)})`}>
            {hold !== 'none' && (UPRIGHT.includes(hold) ? <g transform={`rotate(${-(a - el) * 57 - leanTot + pa})`}>{prop(hold)}</g> : prop(hold))}
            {front && handF === 'fist' ? <path d={FIST} fill={L.skin} {...ol} strokeWidth={5} />
              : front && (handF === 'point' || handF === 'finger') ? <path d={POINT} fill={L.skin} {...ol} strokeWidth={5} />
                : <><path d={HAND} fill={L.skin} {...ol} strokeWidth={5} /><path d={THUMB} fill="none" stroke={P.ink} strokeWidth={5} strokeLinecap="round" /></>}
          </g>
        </g>
      </g>);
    const foot = (cx: number, cy: number) => <g><ellipse cx={cx} cy={cy} rx={20 * body} ry={8 * body} fill={bare || L.outfit === 'rags' ? L.skin : '#6a4426'} {...ol} strokeWidth={5} /><path d={`M ${cx - 12} ${cy - 4} L ${cx + 12} ${cy - 4}`} stroke="#5a3a20" strokeWidth={5} /></g>;
    const shinFill = (side: number) => (L.greaves === true || (L.greaves === 'one' && side < 0)) ? BR : L.skin;
    const greaveLine = (side: number, h: number) => shinFill(side) === BR ? <path d={`M ${-10 * body} ${h * .3} q 10 -8 20 0`} stroke={BRD} strokeWidth={4} fill="none" /> : null;
    const leg = (side: number, a: number) => {
      if (kneel > .01 && side > 0) return (
        <g transform={`translate(${side * 14 * body} ${hipY})`}><g transform={`rotate(${-70 * kneel})`}>
          <rect x={-16 * body} y={-4} width={32 * body} height={thigh + 8} rx={14 * body} fill={L.skin} {...ol} />
          <g transform={`translate(0 ${thigh}) rotate(${70 * kneel})`}><rect x={-15 * body} y={-6} width={30 * body} height={shin + 12} rx={13 * body} fill={shinFill(side)} {...ol} />{greaveLine(side, shin)}{foot(9 * body, shin + 8)}</g></g></g>);
      if (kneel > .01) return (
        <g transform={`translate(${side * 14 * body} ${hipY})`}><rect x={-16 * body} y={-4} width={32 * body} height={thigh + 6} rx={14 * body} fill={L.skin} {...ol} />
          <g transform={`translate(0 ${thigh}) rotate(${90 * kneel})`}><rect x={-15 * body} y={-6} width={30 * body} height={shin + 4} rx={13 * body} fill={shinFill(side)} {...ol} /></g></g>);
      if (sit > .01) return (
        <g transform={`translate(${side * 10 * body - 14} ${hipY - 4})`}><g transform={`rotate(${lerp(a * 57, -84, sit)})`}>
          <rect x={-17 * body} y={-6} width={34 * body} height={thigh + 12} rx={15 * body} fill={L.skin} {...ol} />
          <g transform={`translate(0 ${thigh}) rotate(${lerp(0, 84 + side * 4, sit)})`}><rect x={-16 * body} y={-8} width={32 * body} height={shin + 4} rx={14 * body} fill={shinFill(side)} {...ol} />{foot(9 * body, shin - 4)}</g></g></g>);
      const knee = walk ? Math.max(0, Math.sin(phase + (side > 0 ? 0 : Math.PI))) * (.5 + run * .7) * walk : crouch * .25;
      const spread = crouch * .12 * side;
      return <g transform={`translate(${side * 17 * body} ${hipY}) rotate(${(a + spread) * 57})`}>
        <rect x={-17 * body} y={-4} width={34 * body} height={thigh + 6} rx={14 * body} fill={L.skin} {...ol} />
        <g transform={`translate(0 ${thigh}) rotate(${knee * 57})`}><rect x={-15 * body} y={-6} width={30 * body} height={legL - thigh} rx={13 * body} fill={shinFill(side)} {...ol} />{greaveLine(side, legL - thigh)}{foot(9 * body, legL - thigh - 4)}</g>
      </g>;
    };
    const tw = 40 * body, hw = 44 * body;
    const torso = (() => {
      const kilt = (len: number, c = L.cloth2) => <path d={`M ${-hw - 4} ${hipY - 10} L ${hw + 4} ${hipY - 10} L ${hw + 14} ${hipY + len} L ${-hw - 14} ${hipY + len} Z`} fill={c} {...ol} />;
      const chest = (fill: string) => <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw} ${hipY + 4} Q 0 ${hipY + 12} ${-hw} ${hipY + 4} Z`} fill={fill} {...ol} />;
      const neck = <path d={`M ${-14 * body} ${shY - 2} Q 0 ${shY + 16} ${14 * body} ${shY - 2}`} fill={L.skin} {...ol} strokeWidth={5} />;
      const short = sit || kneel;
      switch (L.outfit) {
        case 'tunic': return <g>{kilt(short ? 22 : 44 * body)}{chest(L.cloth)}
          <path d={`M ${-hw - 10} ${hipY + 30 * body} L ${hw + 10} ${hipY + 30 * body}`} stroke={L.trim} strokeWidth={8} opacity={short ? 0 : 1} />
          {L.cloth === '#f2ead6' && [-1, 1].map((q) => <path key={q} d={`M ${q * 16 * body} ${shY + 2} L ${q * 18 * body} ${hipY}`} stroke={L.trim} strokeWidth={7} />)}
          <path d={`M ${-hw + 2} ${hipY - 6} L ${hw - 2} ${hipY - 6}`} stroke="#5a3a20" strokeWidth={10} />{neck}</g>;
        case 'rags': return <g>
          <path d={`M ${-hw - 4} ${hipY - 10} L ${hw + 4} ${hipY - 10} L ${hw + 12} ${hipY + (short ? 20 : 40 * body)} l -14 -10 l -12 12 l -14 -8 l -14 10 l -12 -10 l -14 12 l -12 -8 l -12 10 Z`} fill={L.cloth2} {...ol} />
          {chest(L.cloth)}
          <rect x={-tw + 10} y={shY + 34} width={22} height={18} fill={L.cloth2} stroke={P.ink} strokeWidth={3} transform={`rotate(-8 ${-tw + 20} ${shY + 40})`} />
          <path d={`M ${-hw + 2} ${hipY - 6} L ${hw - 2} ${hipY - 6}`} stroke="#8a7a5a" strokeWidth={7} />{neck}</g>;
        case 'loin': return <g>
          {chest(L.skin)}
          <path d={`M ${-12 * body} ${shY + 34} Q ${-22 * body} ${shY + 50} ${-6 * body} ${shY + 52} M ${12 * body} ${shY + 34} Q ${22 * body} ${shY + 50} ${6 * body} ${shY + 52}`} stroke={L.skinS} strokeWidth={4} fill="none" />
          {[0, 1].map((k) => <path key={k} d={`M ${-10 * body} ${shY + 66 + k * 14} q 10 4 20 0`} stroke={L.skinS} strokeWidth={3.5} fill="none" opacity={L.belly ? 0 : .8} />)}
          {L.belly && <ellipse cx={4} cy={hipY - 30} rx={hw + 6} ry={34 * body} fill={L.skin} {...ol} />}
          <path d={`M ${-hw - 6} ${hipY - 6} L ${hw + 6} ${hipY - 6} L ${hw + 2} ${hipY + 22} Q 0 ${hipY + (short ? 26 : 44)} ${-hw - 2} ${hipY + 22} Z`} fill={L.cloth} {...ol} />
          <path d={`M 0 ${hipY + 4} L 0 ${hipY + (short ? 22 : 40)}`} stroke="rgba(0,0,0,.18)" strokeWidth={5} />
          <rect x={-hw - 8} y={hipY - 30} width={(hw + 8) * 2} height={30} rx={6} fill={L.cloth2} {...ol} strokeWidth={6} />
          {[-1, 0, 1].map((q) => <circle key={q} cx={q * hw * .6} cy={hipY - 15} r={6} fill={BRL} stroke={P.ink} strokeWidth={3} />)}
          {neck}</g>;
        case 'hide': return <g>
          <path d={`M ${-hw - 4} ${hipY - 10} L ${hw + 4} ${hipY - 10} L ${hw + 10} ${hipY + (short ? 20 : 38 * body)} L ${-hw - 10} ${hipY + (short ? 20 : 38 * body)} Z`} fill={L.cloth2} {...ol} />
          {Array.from({ length: 9 }).map((_, k) => <line key={'fr' + k} x1={-hw - 6 + k * (hw * 2 + 12) / 8} y1={hipY + (short ? 18 : 36 * body)} x2={-hw - 8 + k * (hw * 2 + 12) / 8} y2={hipY + (short ? 30 : 50 * body)} stroke={L.cloth2} strokeWidth={5} strokeLinecap="round" />)}
          {chest(L.cloth)}
          <path d={`M ${-tw + 4} ${shY + 8} L ${-tw * .2} ${hipY - 12}`} stroke={L.trim} strokeWidth={5} strokeDasharray="8 7" />
          <path d={`M ${-hw + 2} ${hipY - 6} L ${hw - 2} ${hipY - 6}`} stroke="#5a3a20" strokeWidth={8} />{neck}</g>;
        case 'leopard': return <g>
          <path d={`M ${-hw - 4} ${hipY - 10} L ${hw + 4} ${hipY - 10} L ${hw + 14} ${hipY + (short ? 20 : 40 * body)} L ${-hw - 14} ${hipY + (short ? 20 : 40 * body)} Z`} fill="#d9a441" {...ol} />
          {chest(L.skin)}
          <path d={`M ${-tw - 4} ${shY + 2} L ${tw * .3} ${shY - 6} L ${hw} ${hipY - 4} L ${-hw} ${hipY + 4} Z`} fill="#d9a441" {...ol} strokeWidth={5} />
          {Array.from({ length: 14 }).map((_, k) => <circle key={'sp' + k} cx={-hw + 8 + (k * 37) % (hw * 2 - 10)} cy={shY + 20 + ((k * 53) % 120) * body} r={6} fill="none" stroke={P.ink} strokeWidth={4} />)}
          {Array.from({ length: 6 }).map((_, k) => <circle key={'sk' + k} cx={-hw + 4 + k * hw * .38} cy={hipY + 16} r={5} fill={P.ink} />)}
          <path d={`M ${-hw + 2} ${hipY - 6} L ${hw - 2} ${hipY - 6}`} stroke="#5a3a20" strokeWidth={8} />{neck}</g>;
        case 'linen': return <g>
          {Array.from({ length: 9 }).map((_, k) => <rect key={'pt' + k} x={-hw - 6 + k * (hw * 2 + 12) / 9} y={hipY - 8} width={(hw * 2 + 12) / 9 - 2} height={short ? 22 : 40 * body} rx={3} fill={k % 2 ? L.cloth : L.cloth2} stroke={P.ink} strokeWidth={4} />)}
          {chest(L.cloth)}
          <path d={`M ${-hw + 4} ${hipY - 34} L ${hw - 4} ${hipY - 34}`} stroke={L.trim} strokeWidth={10} />
          {[-1, 1].map((q) => <path key={q} d={`M ${q * (tw + 8)} ${shY - 2} Q ${q * tw * .6} ${shY - 22} ${q * 8} ${shY + 4} L ${q * 12} ${shY + 34} L ${q * (tw + 6)} ${shY + 30} Z`} fill={L.cloth} {...ol} strokeWidth={5} />)}
          {[-1, 1].map((q) => <circle key={'c' + q} cx={q * tw * .55} cy={shY + 20} r={6} fill={L.trim} stroke={P.ink} strokeWidth={3} />)}
          <path d={`M ${-tw * .3} ${shY + 56} l ${tw * .3} 16 l ${tw * .3} -16`} stroke={L.trim} strokeWidth={5} fill="none" />
          {neck}</g>;
        case 'lorica': return <g>{kilt(short ? 22 : 40 * body)}{chest(L.cloth)}
          {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => <circle key={r + '-' + c} cx={-tw + 10 + c * 15 * body + (r % 2) * 7} cy={shY + 22 + r * 18} r={3} fill="none" stroke="#5a5a5a" strokeWidth={2.5} />))}
          {[-1, 1].map((q) => <path key={q} d={`M ${q * (tw + 8)} ${shY - 2} Q ${q * tw * .6} ${shY - 22} ${q * 6} ${shY + 6} L ${q * 10} ${shY + 30} L ${q * (tw + 4)} ${shY + 26} Z`} fill={L.cloth} {...ol} strokeWidth={5} />)}
          <rect x={-hw} y={hipY - 16} width={hw * 2} height={14} fill="#5a3a20" stroke={P.ink} strokeWidth={5} />
          {[-1, 0, 1].map((q) => <rect key={q} x={q * 18 - 3} y={hipY - 4} width={6} height={short ? 14 : 30} fill="#5a3a20" stroke={P.ink} strokeWidth={2} />)}
          {neck}</g>;
        case 'toga': case 'robe': case 'dress': {
          const bottom = sit ? hipY + 24 : kneel ? hipY + 40 : -6;
          const toga = L.outfit === 'toga';
          return <g>
            {sit > .01 ? <path d={`M ${-hw - 10} ${hipY - 8} L ${hw + thigh * sit + 18} ${hipY - 8} L ${hw + thigh * sit + 22} ${-6} L ${hw + thigh * sit - 40} ${-6} L ${hw - 10} ${hipY + 24} L ${-hw - 10} ${hipY + 24} Z`} fill={L.cloth2} {...ol} />
              : <path d={`M ${-tw - 4} ${shY + 40} L ${tw + 4} ${shY + 40} L ${hw + 26} ${bottom} L ${-hw - 26} ${bottom} Z`} fill={L.outfit === 'dress' ? L.cloth : L.cloth2} {...ol} />}
            {L.outfit === 'dress' && !sit && [0, 1].map((k) => <path key={k} d={`M ${-hw - 10 - k * 6} ${hipY + 30 + k * 26} L ${hw + 10 + k * 6} ${hipY + 30 + k * 26}`} stroke={L.trim} strokeWidth={6} />)}
            {L.belly && <ellipse cx={4} cy={hipY - 30} rx={hw + 10} ry={38 * body} fill={L.cloth} {...ol} />}
            <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw + (L.belly ? 10 : 0)} ${hipY + 4} Q 0 ${hipY + 12} ${-hw - (L.belly ? 10 : 0)} ${hipY + 4} Z`} fill={L.cloth} {...ol} opacity={L.belly ? .0 : 1} />
            {toga ? <>
              <path d={`M ${-tw - 6} ${shY - 4} Q ${-tw - 14} ${shY + 50} ${-hw - 20} ${hipY + 40} L ${-hw + 10} ${hipY + 30} Q ${0} ${shY + 80} ${tw + 2} ${shY + 10} Z`} fill={L.cloth} {...ol} strokeWidth={6} />
              <path d={`M ${-tw - 2} ${shY + 6} Q ${-6} ${shY + 90} ${hw + 6} ${hipY + 20}`} stroke={L.trim} strokeWidth={9} fill="none" />
              {[0, 1, 2].map((k) => <path key={k} d={`M ${-tw + 14 + k * 16} ${shY + 20 + k * 10} Q ${-4 + k * 10} ${shY + 60 + k * 10} ${hw - 10 - k * 6} ${hipY - 10 + k * 8}`} stroke="rgba(0,0,0,.12)" strokeWidth={4} fill="none" />)}
            </> : <path d={`M ${-tw} ${shY + 4} L ${tw - 10} ${hipY - 4}`} stroke={L.trim} strokeWidth={9} />}
            {neck}
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
        case 'lion': return <path d="M -64 -10 C -70 -70 70 -70 64 -10 L 66 46 Q 40 60 34 30 L -34 30 Q -40 60 -66 46 Z" fill={c} {...ol} />;
        case 'long': return <path d="M -64 -10 C -70 -70 70 -70 64 -10 L 70 70 Q 40 84 30 50 L -30 50 Q -40 84 -70 70 Z" fill={c} {...ol} />;
        case 'curlyLong': return <g>{[[-62, 30, 20], [-66, 0, 22], [-60, -34, 24], [62, 30, 20], [66, 0, 22], [60, -34, 24], [-58, 58, 16], [58, 58, 16]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={c} {...ol} strokeWidth={5} />)}</g>;
        case 'wild': return <g>{Array.from({ length: 12 }).map((_, k) => { const a = Math.PI * (.9 + k * .11); return <path key={k} d={`M ${Math.cos(a) * 50} ${Math.sin(a) * 50} q ${Math.cos(a) * 40} ${Math.sin(a) * 40 + 20} ${Math.cos(a) * 30} ${Math.sin(a) * 70 + 40}`} stroke={c} strokeWidth={22} strokeLinecap="round" fill="none" />; })}</g>;
        case 'veil': return <path d="M -76 -20 C -80 -100 80 -100 76 -20 L 96 170 L -96 170 Z" fill={L.cloth} {...ol} />;
        case 'braids': return <g>{[-1, 1].map((q) => <g key={q}>{[0, 1, 2, 3].map((k) => <ellipse key={k} cx={q * 58} cy={10 + k * 22} rx={13} ry={14} fill={c} {...ol} strokeWidth={5} />)}</g>)}</g>;
        case 'scarf': return <path d="M 56 -30 Q 96 -10 90 40 Q 80 20 66 14 Z" fill={L.trim} {...ol} strokeWidth={5} />;
        default: return null;
      }
    })();
    const hairFront = (() => {
      const c = L.hair;
      switch (L.hairStyle) {
        case 'lion': return <g>{[[-60, -16, 22], [-62, -42, 24], [-48, -64, 24], [44, -66, 24], [60, -44, 23], [62, -18, 20], [-64, 14, 18], [64, 14, 18]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={c} {...ol} strokeWidth={5} />)}
          <path d="M -40 -50 C -50 -96 -10 -110 0 -84 C 10 -112 54 -98 40 -50 C 28 -66 12 -62 0 -58 C -12 -62 -28 -66 -40 -50 Z" fill={c} {...ol} strokeWidth={5} />
          <path d="M -6 -84 C -14 -100 -30 -104 -36 -92 M 6 -84 C 14 -100 30 -104 36 -92" stroke="rgba(0,0,0,.25)" strokeWidth={4} fill="none" /></g>;
        case 'curly': case 'curlyLong': return <g>{[[-56, -20, 20], [-58, -44, 22], [-44, -62, 24], [-20, -74, 24], [6, -76, 24], [30, -70, 23], [50, -54, 21], [58, -32, 18]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={c} {...ol} strokeWidth={5} />)}
          {[[-34, -50, 18], [-8, -58, 18], [18, -56, 17], [38, -48, 14]].map(([cx, cy, r], k) => <circle key={'f' + k} cx={cx} cy={cy} r={r} fill={c} />)}</g>;
        case 'long': case 'braids': return <path d="M -62 -12 C -66 -60 -30 -76 0 -76 C 34 -76 66 -60 62 -14 C 50 -40 30 -48 6 -46 L 0 -56 L -8 -44 C -30 -44 -52 -36 -62 -12 Z" fill={c} {...ol} />;
        case 'short': return <path d="M -62 -14 C -66 -60 -30 -76 0 -76 C 34 -76 66 -60 62 -16 C 50 -40 30 -50 4 -48 C -24 -46 -50 -40 -62 -14 Z" fill={c} {...ol} />;
        case 'wild': return <path d="M -62 -10 C -66 -60 -30 -78 0 -78 C 34 -78 66 -60 62 -10 C 54 -36 40 -30 30 -44 C 20 -30 0 -40 -10 -46 C -24 -30 -46 -40 -62 -10 Z" fill={c} {...ol} />;
        case 'veil': return <path d="M -66 -8 C -70 -84 70 -84 66 -8 C 56 -54 30 -62 0 -62 C -30 -62 -56 -54 -66 -8 Z" fill={L.cloth} {...ol} />;
        case 'bun': return <g><circle cx={0} cy={-78} r={26} fill={c} {...ol} /><path d="M -62 -10 C -66 -60 -30 -74 0 -74 C 34 -74 66 -60 62 -12 C 48 -42 24 -50 0 -50 C -26 -50 -48 -40 -62 -10 Z" fill={c} {...ol} /></g>;
        case 'bald': return <path d="M -58 -30 Q -40 -64 0 -66 Q 40 -64 58 -30" stroke="rgba(255,255,255,.35)" strokeWidth={8} fill="none" />;
        case 'scarf': return <g><path d="M -64 -14 C -68 -80 68 -80 64 -14 C 40 -30 -40 -30 -64 -14 Z" fill={L.trim} {...ol} />{[0, 1, 2].map((k) => <circle key={k} cx={-30 + k * 30} cy={-46} r={5} fill="#efe6d2" />)}</g>;
        default: return null;
      }
    })();
    const helmet = (() => {
      const crest = L.crestC || '#2a1a12';
      switch (L.helmet) {
        case 'thraex': return <g>
          <path d="M -86 6 Q -60 -4 -64 -20 C -66 -84 66 -84 64 -20 Q 60 -4 86 6 Q 40 -2 0 -2 Q -40 -2 -86 6 Z" fill={BR} {...ol} />
          <path d="M -84 6 Q 0 -8 84 6" stroke={BRD} strokeWidth={5} fill="none" />
          <path d="M -40 -70 C -40 -130 30 -150 70 -120 C 92 -102 96 -80 86 -66 C 80 -90 50 -100 30 -96 C 10 -92 -10 -80 -20 -64 Z" fill={BRL} {...ol} strokeWidth={6} />
          <path d="M 70 -120 L 104 -112 L 84 -96 Z" fill={BRL} {...ol} strokeWidth={5} />
          <circle cx={78} cy={-110} r={3.5} fill={P.ink} />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M ${-30 + k * 18} ${-102 - k * 6} q -10 -40 ${-4 + k * 6} -62`} stroke={crest} strokeWidth={9} strokeLinecap="round" fill="none" />)}
          {[-1, 1].map((q) => <path key={q} d={`M ${q * 62} -26 q ${q * 10} -40 ${q * 26} -56`} stroke={crest} strokeWidth={8} strokeLinecap="round" fill="none" />)}
        </g>;
        case 'samnite': return <g>
          <path d="M -82 4 Q -60 -2 -64 -18 C -66 -86 66 -86 64 -18 Q 60 -2 82 4 Q 40 -4 0 -4 Q -40 -4 -82 4 Z" fill={STEEL} {...ol} />
          <path d="M -6 -80 C -10 -120 20 -150 50 -150 C 30 -130 24 -110 22 -78 Z" fill={BRL} {...ol} strokeWidth={5} />
          {Array.from({ length: 7 }).map((_, k) => <path key={k} d={`M ${4 + k * 6} ${-120 - (k % 2) * 6} q 20 ${-30 - k * 4} ${40 + k * 4} ${-20 - k * 2}`} stroke={crest} strokeWidth={7} strokeLinecap="round" fill="none" />)}
          {[-1, 1].map((q) => <path key={q} d={`M ${q * 58} -50 q ${q * 18} -50 ${q * 6} -90`} stroke={RC.red} strokeWidth={9} strokeLinecap="round" fill="none" />)}
        </g>;
        case 'gaul': return <g><path d="M -66 -2 C -70 -86 70 -86 66 -2 L 54 -4 L 50 -16 L -50 -16 L -54 -4 Z" fill={BR} {...ol} /><path d="M -66 -2 L -62 40 L -44 34 L -48 -4 Z M 66 -2 L 62 40 L 44 34 L 48 -4 Z" fill={BRL} {...ol} strokeWidth={5} /><circle cx={0} cy={-84} r={11} fill={BRL} stroke={P.ink} strokeWidth={5} />{[0, 1, 2].map((k) => <circle key={k} cx={-40 + k * 40} cy={-34} r={5} fill={BRD} />)}</g>;
        case 'legion': return <g><path d="M -64 -4 C -68 -86 68 -86 64 -4 Z" fill={BR} {...ol} /><path d="M 64 -6 L 80 -2 L 76 8 L 60 2 Z" fill={BR} {...ol} strokeWidth={5} /><path d="M -64 -6 L -60 44 L -42 38 L -46 -6 Z" fill={BRL} {...ol} strokeWidth={5} />
          <rect x={-8} y={-92} width={16} height={18} fill={BRL} stroke={P.ink} strokeWidth={4} /><path d={`M 0 -92 C -10 -132 -40 -136 -70 -110 C -40 -116 -20 -110 -2 -88 Z`} fill={crest} {...ol} strokeWidth={5} /></g>;
        case 'phrygian': return <g>
          <path d="M -64 -2 C -72 -70 -30 -102 24 -98 C 62 -96 74 -60 66 -2 L 52 -6 L 48 -18 L -48 -18 L -52 -6 Z" fill={BR} {...ol} />
          <path d="M 4 -96 C 30 -150 86 -150 80 -112 C 74 -96 56 -100 50 -92 Z" fill={BR} {...ol} strokeWidth={6} />
          <path d="M -66 -2 L -60 46 L -40 40 L -44 -6 Z M 66 -2 L 60 46 L 40 40 L 44 -6 Z" fill={BRL} {...ol} strokeWidth={5} />
          <path d="M -48 -18 Q 0 -30 48 -18" stroke={BRD} strokeWidth={5} fill="none" />
          {L.plumes ? [-1, 1].map((q) => <path key={q} d={`M ${q * 50} -60 C ${q * 64} -120 ${q * 50} -170 ${q * 76} -220 C ${q * 86} -170 ${q * 80} -120 ${q * 62} -58 Z`} fill={L.crestC || '#fff'} {...ol} strokeWidth={5} />)
            : <path d="M 0 -96 C -20 -110 -50 -100 -70 -70 C -40 -86 -20 -84 -4 -76 Z" fill={L.crestC || RC.red} {...ol} strokeWidth={5} />}
        </g>;
        case 'kausia': return <g><ellipse cx={0} cy={-46} rx={84} ry={22} fill={L.crestC || '#6a4a3a'} {...ol} /><path d="M -62 -50 C -64 -90 64 -90 62 -50 Z" fill={L.crestC || '#6a4a3a'} {...ol} /></g>;
        case 'tiara': return <g><path d="M -58 -40 L -50 -150 Q 0 -166 50 -150 L 58 -40 Q 0 -54 -58 -40 Z" fill={L.crestC || RC.gold} {...ol} />
          {[0, 1, 2].map((k) => <path key={k} d={`M -54 ${-70 - k * 28} Q 0 ${-84 - k * 28} 54 ${-70 - k * 28}`} stroke={RC.purple} strokeWidth={6} fill="none" />)}
          {[-30, 0, 30].map((q) => <path key={q} d={`M ${q - 12} -150 L ${q} -176 L ${q + 12} -150`} fill={RC.gold} stroke={P.ink} strokeWidth={4} />)}</g>;
        case 'bashlyk': return <g><path d="M -66 30 L -64 -30 C -66 -90 40 -110 66 -40 L 80 -76 Q 70 -30 66 -10 L 66 30 Q 50 40 44 20 L 44 -20 L -44 -20 L -44 20 Q -50 40 -66 30 Z" fill={L.crestC || '#c8b080'} {...ol} /></g>;
        case 'turban': return <g><path d="M -68 -10 C -76 -100 76 -100 68 -10 Q 0 -34 -68 -10 Z" fill={L.crestC || '#efe6d2'} {...ol} />
          {[0, 1, 2].map((k) => <path key={k} d={`M -66 ${-22 - k * 20} Q 0 ${-50 - k * 20} 66 ${-30 - k * 18}`} stroke="rgba(0,0,0,.18)" strokeWidth={5} fill="none" />)}
          <circle cx={0} cy={-60} r={12} fill={RC.red} stroke={P.ink} strokeWidth={4} /><path d="M 0 -72 q 10 -40 -6 -60" stroke={RC.gold} strokeWidth={6} fill="none" /></g>;
        case 'cap': return <g><path d="M -64 -6 C -68 -86 68 -86 64 -6 Z" fill="#8a5a34" {...ol} /></g>;
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
        case 'mous': return <path d={`M ${fx - 4} 20 C ${fx - 20} 14 ${fx - 40} 22 ${fx - 44} 52 C ${fx - 30} 34 ${fx - 16} 30 ${fx} 28 C ${fx + 16} 30 ${fx + 30} 34 ${fx + 44} 52 C ${fx + 40} 22 ${fx + 20} 14 ${fx + 4} 20 Z`} fill={L.hair} {...ol} strokeWidth={5} />;
        default: return null;
      }
    })();
    const sh = L.shield && L.shield !== 'none' ? L.shield : null;
    const helmeted = L.helmet && L.helmet !== 'none' && L.helmet !== 'cap' && L.helmet !== 'kausia';
    return (
      <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s * (L.broad || 1)} ${s}) rotate(${leanTot})`} opacity={opacity}>
        {L.glow && <ellipse cx={0} cy={shY} rx={160} ry={260} fill="url(#heroGlow)" />}
        {sit < .5 && kneel < .5 && <ellipse cx={0} cy={4} rx={56 * body} ry={10 * body} fill="rgba(20,14,10,.25)" />}
        {L.cloak && <path d={`M ${-tw - 10} ${shY + 4} Q ${-tw - 40 - Math.sin(phase) * 10 * walk} ${hipY + 20} ${-hw - 40 - walk * 20} ${sit || kneel ? hipY + 30 : -30} L ${hw - 10} ${sit || kneel ? hipY + 30 : -40} Q ${hw - 6} ${hipY} ${tw + 6} ${shY + 4} Z`} fill={L.cloak} {...ol} />}
        {arm(-1, armB, elbowB, holdB, false, propB)}
        {!(skirt && sit < .01 && !kneel) && sit < .01 && <>{leg(-1, -sw)}{leg(1, sw)}</>}
        {skirt && sit < .01 && !kneel && [-1, 1].map((q) => <ellipse key={q} cx={q * 20 * body + 8} cy={-6} rx={20 * body} ry={8 * body} fill="#6a4426" {...ol} strokeWidth={5} />)}
        {torso}
        {L.beads && <g>{Array.from({ length: 9 }).map((_, k) => { const a = Math.PI * (.15 + k * .0875); return <circle key={k} cx={Math.cos(a) * 22 * body} cy={shY + Math.sin(a) * 22} r={5} fill={k % 3 === 1 ? '#efe6d2' : L.beads} stroke={P.ink} strokeWidth={2} />; })}</g>}
        {L.torque && <path d={`M ${-20 * body} ${shY + 2} Q 0 ${shY + 22} ${20 * body} ${shY + 2}`} stroke={RC.gold} strokeWidth={9} fill="none" strokeLinecap="round" />}
        {sit >= .01 && <>{leg(-1, 0)}{leg(1, 0)}</>}
        <g transform={`translate(${turn * 4} ${headY}) rotate(${tilt}) scale(${headS})`}>
          {!helmeted && hairBack}
          {helmeted && (L.hairStyle === 'long' || L.hairStyle === 'curlyLong' || L.hairStyle === 'braids') && <path d="M -60 0 L -66 60 Q -40 70 -36 40 Z M 60 0 L 66 60 Q 40 70 36 40 Z" fill={L.hair} {...ol} strokeWidth={5} />}
          {[-1, 1].map((q) => <ellipse key={q} cx={q * 62} cy={2} rx={10} ry={14} fill={L.skinS} {...ol} />)}
          {L.earring && <circle cx={64} cy={20} r={7} fill="none" stroke={RC.gold} strokeWidth={4} />}
          <path d={headPath} fill={L.skin} {...ol} />
          <path d="M 30 42 C 44 32 54 16 56 -4" fill="none" stroke={L.skinS} strokeWidth={9} strokeLinecap="round" opacity={.7} />
          {!helmeted && hairFront}
          {L.stripe && <path d={`M ${fx - 50} 6 Q ${fx} 0 ${fx + 50} 6 L ${fx + 48} 18 Q ${fx} 12 ${fx - 48} 18 Z`} fill="#b5432a" opacity={.88} />}
          {beard}
          {[-1, 1].map(eye)}
          {nose}
          {L.patch && <g><path d={`M ${fx - 56} -26 L ${fx + 40} -32`} stroke={P.ink} strokeWidth={4} /><ellipse cx={fx + ex * (1 - turn * .25)} cy={-6} rx={15} ry={13} fill="#1a110a" stroke={P.ink} strokeWidth={3} /></g>}
          {L.diadem && <g><path d="M -62 -34 Q 0 -50 62 -34" stroke="#f4efe4" strokeWidth={10} fill="none" /><path d="M -62 -34 Q 0 -50 62 -34" stroke={RC.gold} strokeWidth={3} fill="none" /><path d="M -60 -30 q -24 30 -12 70 M -60 -30 q -10 34 6 64" stroke="#f4efe4" strokeWidth={8} fill="none" strokeLinecap="round" /></g>}
          {L.scar && <path d={`M ${fx + 26} -40 L ${fx + 38} -10`} stroke={L.skinS} strokeWidth={5} strokeLinecap="round" />}
          {hurt > 0 && <path d={`M ${fx - 34} -4 l 14 10`} stroke="#9a2a20" strokeWidth={5} strokeLinecap="round" opacity={hurt} />}
          {L.wrinkles && [-1, 1].map((q) => <path key={q} d={`M ${fx + q * 38} 0 l ${q * 8} -4 M ${fx + q * 38} 6 l ${q * 9} 0`} stroke={L.skinS} strokeWidth={3} strokeLinecap="round" />)}
          <circle cx={fx - 30} cy={18} r={8} fill="#d86a4f" opacity={expr === 'laugh' || expr === 'happy' || expr === 'excited' ? .45 : .22} /><circle cx={fx + 30} cy={18} r={8} fill="#d86a4f" opacity={expr === 'laugh' || expr === 'happy' || expr === 'excited' ? .45 : .22} />
          {mouthEl}
          <g transform={`translate(0 ${L.helmet === 'thraex' || L.helmet === 'samnite' ? -24 : L.helmet === 'legion' || L.helmet === 'gaul' || L.helmet === 'phrygian' ? -14 : L.helmet === 'turban' || L.helmet === 'tiara' ? -10 : 0})`}>{helmet}</g>
        </g>
        {sh && <g transform={`translate(${34 * body - shieldUp * 10} ${shY + (sh === 'parmula' || sh === 'hoplon' ? 96 : 128) - shieldUp * 46}) rotate(${-4 - shieldUp * 4})`}><Shield kind={sh} c={L.shieldC || RC.red} s={(sh === 'parmula' ? .72 : sh === 'hoplon' ? .66 : .62) * body} /></g>}
        {arm(1, armF, elbowF, holdF, true, propA)}
      </g>
    );
  };

/* ---------- horse (side view, gallop cycle) ---------- */
export const Horse: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; gallop?: number; c?: string; mane?: string; down?: number; star?: boolean; rear?: number; cloth?: string }> = ({ x, y, s = 1, flip, ph = 0, gallop = 1, c = '#8a4a2a', mane = '#2a1a12', down = 0, star, rear = 0, cloth = RC.red }) => {
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
  return <g transform={`translate(${x} ${y + bob}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${down * 6 - rear * 28} ${rear ? -100 : 0} 0)`} opacity={1 - down * .9}>
    {leg(-70, 0, false, true)}{leg(90, 1.6, true, true)}
    <path d={`M -150 -200 Q -190 -190 -200 ${-150 + Math.sin(ph * 2) * 20}`} stroke={mane} strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M -130 -230 C -60 -260 80 -250 120 -220 C 140 -200 140 -160 110 -140 C 60 -126 -60 -126 -120 -140 C -150 -156 -156 -210 -130 -230 Z" fill={c} {...ol} />
    <path d="M 90 -228 C 120 -280 150 -330 170 -350 L 236 -300 C 240 -290 236 -276 226 -276 L 180 -284 C 160 -250 150 -210 130 -180 Z" fill={c} {...ol} />
    <path d="M 100 -236 C 120 -290 150 -330 172 -352 C 150 -320 140 -300 124 -250 Z" fill={mane} {...ol} strokeWidth={5} />
    <path d="M 170 -350 L 176 -380 L 190 -356" fill={c} {...ol} strokeWidth={5} />
    <circle cx={196} cy={-322} r={6} fill={c === '#1a1410' ? '#f4efe4' : P.ink} />
    {star && <path d="M 178 -336 l 6 -12 l 6 12 l -6 10 Z" fill="#f4efe4" />}
    <path d="M 160 -300 L 236 -296" stroke={RC.gold} strokeWidth={6} />
    {leg(-90, 3.1, false, false)}{leg(70, 4.7, true, false)}
    <path d="M -70 -246 Q 0 -262 70 -246 L 60 -200 Q 0 -210 -60 -200 Z" fill={cloth} stroke={P.ink} strokeWidth={5} />
  </g>;
};
/* wagon (carries the gladiator weapons) */
export const Wagon: React.FC<{ x: number; y: number; s?: number; t?: number; weapons?: number; flip?: boolean }> = ({ x, y, s = 1, t = 0, weapons = 1, flip }) => {
  const ol = { stroke: P.ink, strokeWidth: 7, strokeLinejoin: 'round' as const };
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {weapons > 0 && <g opacity={weapons}>{[-120, -60, 0, 60, 120].map((q, k) => <g key={k} transform={`translate(${q} -170) rotate(${-14 + k * 7})`}><path d="M -8 0 L -8 -90 L 0 -108 L 8 -90 L 8 0 Z" fill={STEEL} stroke={P.ink} strokeWidth={5} /><rect x={-18} y={-4} width={36} height={9} fill={BR} stroke={P.ink} strokeWidth={4} /></g>)}
      {[-90, 30].map((q) => <g key={q} transform={`translate(${q} -150)`}><Shield kind="parmula" c={RC.red} s={.5} /></g>)}<g transform="translate(110 -140) rotate(10)"><Shield kind="scutum" c={RC.blue} s={.4} /></g></g>}
    <path d="M -200 -150 L 200 -150 L 186 -60 L -186 -60 Z" fill="#8a5a34" {...ol} />
    {[0, 1, 2].map((k) => <line key={k} x1={-196 + k * 4} y1={-120 + k * 24} x2={196 - k * 4} y2={-120 + k * 24} stroke="#5a3a20" strokeWidth={5} />)}
    <line x1={200} y1={-90} x2={360} y2={-60} stroke={P.ink} strokeWidth={10} />
    {[-120, 120].map((q) => <g key={q} transform={`translate(${q} -40) rotate(${t * 90})`}><circle r={58} fill="none" stroke={P.ink} strokeWidth={14} /><circle r={58} fill="none" stroke="#8a5a34" strokeWidth={7} />{[0, 1, 2, 3].map((k) => <line key={k} x1={0} y1={0} x2={Math.cos(k * .785 * 2) * 56} y2={Math.sin(k * .785 * 2) * 56} stroke={P.ink} strokeWidth={7} />)}<circle r={11} fill={BR} stroke={P.ink} strokeWidth={4} /></g>)}
  </g>;
};
export const Bench: React.FC<{ x: number; y: number; w?: number; s?: number }> = ({ x, y, w = 260, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-w / 2} y={-62} width={w} height={22} rx={6} fill="#8a5a34" stroke={P.ink} strokeWidth={6} />{[-w / 2 + 24, w / 2 - 38].map((a) => <rect key={a} x={a} y={-42} width={14} height={42} fill="#8a5a34" stroke={P.ink} strokeWidth={5} />)}</g>
);

/* ===== NEW in ep08: aurochs (wild bull), sheep, dog ===== */
export const Aurochs: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; walk?: number; charge?: number; head?: number; down?: number }> = ({ x, y, s = 1, flip, ph = 0, walk = 0, charge = 0, head = 0, down = 0 }) => {
  const ol = { stroke: P.ink, strokeWidth: 8, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const C = '#2a1a12', CL = '#4a3020';
  const leg = (lx: number, o: number, back: boolean) => { const a = Math.sin(ph + o) * (14 + charge * 22) * walk; return <g transform={`translate(${lx} -130) rotate(${a})`}><rect x={-18} y={-16} width={36} height={86} rx={14} fill={back ? '#1a100a' : C} {...ol} /><g transform={`translate(0 66) rotate(${-Math.max(0, Math.sin(ph + o)) * 40 * walk})`}><rect x={-13} y={-8} width={26} height={74} rx={10} fill={back ? '#1a100a' : C} {...ol} /><path d="M -15 62 L 15 62 L 12 78 L -12 78 Z" fill="#1a1410" /></g></g>; };
  return <g transform={`translate(${x} ${y + Math.abs(Math.sin(ph)) * 6 * walk}) scale(${(flip ? -1 : 1) * s} ${s}) translate(0 ${down * 118})`}>
    {down < .5 && <>{leg(-150, 0, true)}{leg(120, Math.PI, true)}</>}{down >= .5 && <><ellipse cx={-120} cy={-118} rx={70} ry={22} fill="#1a100a" stroke={P.ink} strokeWidth={6} /><ellipse cx={130} cy={-118} rx={70} ry={22} fill="#1a100a" stroke={P.ink} strokeWidth={6} /></>}
    <path d={`M -210 -230 Q ${-260 - Math.sin(ph * 2) * 20} -190 ${-250 - Math.sin(ph * 2) * 26} -120`} stroke={C} strokeWidth={10} fill="none" /><path d={`M ${-250 - Math.sin(ph * 2) * 26} -120 l -10 30 l 22 -6 Z`} fill={C} />
    <path d="M -220 -250 C -230 -330 -40 -350 120 -320 C 200 -306 230 -250 200 -150 L 170 -120 L -190 -120 C -230 -150 -230 -210 -220 -250 Z" fill={C} {...ol} />
    <path d="M -40 -330 C 30 -360 140 -350 190 -300" stroke={CL} strokeWidth={22} fill="none" opacity={.8} />
    <path d="M -150 -320 C -100 -334 -40 -340 0 -338" stroke="#d8c8a0" strokeWidth={10} fill="none" opacity={.5} />
    <g transform={`translate(200 -250) rotate(${head * 30 + charge * 25 + down * 38})`}>
      <path d="M -20 -40 C 40 -70 100 -40 110 20 C 116 60 90 80 60 74 L -10 40 Z" fill={C} {...ol} />
      <ellipse cx={88} cy={56} rx={26} ry={18} fill="#6a4a3a" {...ol} strokeWidth={5} /><circle cx={92} cy={52} r={4} fill={P.ink} />
      <circle cx={50} cy={-6} r={7} fill="#f4efe4" /><circle cx={52} cy={-6} r={4} fill={P.ink} />
      <path d="M 10 -40 C -20 -110 50 -150 110 -120 C 70 -118 40 -100 36 -50 Z" fill="#efe6d2" {...ol} strokeWidth={6} />
      <path d="M 30 -44 C 30 -80 80 -110 130 -96 C 90 -86 70 -70 56 -40 Z" fill="#e2d6b8" {...ol} strokeWidth={5} />
      <path d="M -20 -30 C -50 -20 -50 10 -26 16" fill={C} {...ol} strokeWidth={5} />
    </g>
    {down < .5 && <>{leg(-120, Math.PI, false)}{leg(150, 0, false)}</>}
  </g>;
};
export const Sheep: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; walk?: number; c?: string; goat?: boolean }> = ({ x, y, s = 1, flip, ph = 0, walk = 0, c = '#efe6d2', goat }) => {
  const ol = { stroke: P.ink, strokeWidth: 6, strokeLinejoin: 'round' as const };
  return <g transform={`translate(${x} ${y + Math.abs(Math.sin(ph)) * 4 * walk}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {[-50, -30, 30, 50].map((lx, k) => <rect key={k} x={lx - 7} y={-50} width={14} height={50 + Math.sin(ph + k * 1.6) * 6 * walk} rx={6} fill="#3a2a1a" {...ol} strokeWidth={4} />)}
    {goat ? <path d="M -80 -110 C -80 -150 70 -150 80 -110 L 76 -50 L -76 -50 Z" fill={c} {...ol} /> : <g>{[[-60, -90], [-30, -110], [10, -112], [50, -100], [70, -76], [-70, -66], [30, -64], [-20, -60]].map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={34} fill={c} {...ol} />)}<ellipse cx={0} cy={-86} rx={70} ry={30} fill={c} /></g>}
    <g transform={`translate(84 -104) rotate(${Math.sin(ph * .5) * 8})`}><ellipse rx={26} ry={20} fill={goat ? c : '#3a2a1a'} {...ol} /><circle cx={10} cy={-4} r={4} fill="#fff" />{goat && <path d="M -10 -16 Q -30 -60 -46 -40 M 0 -18 Q -10 -60 -28 -54" stroke="#8a7a5a" strokeWidth={7} fill="none" />}{goat && <path d="M 14 16 L 10 34 L 4 18" fill="#8a7a5a" />}<ellipse cx={-18} cy={-8} rx={14} ry={7} fill={goat ? c : '#3a2a1a'} {...ol} strokeWidth={4} /></g>
  </g>;
};
export const Dog: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; walk?: number }> = ({ x, y, s = 1, flip, ph = 0, walk = 0 }) => {
  const ol = { stroke: P.ink, strokeWidth: 6, strokeLinejoin: 'round' as const };
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {[-50, -30, 34, 54].map((lx, k) => <rect key={k} x={lx - 7} y={-60} width={14} height={60} rx={6} fill="#a8784a" {...ol} strokeWidth={4} transform={`rotate(${Math.sin(ph + k * 1.6) * 20 * walk} ${lx} -60)`} />)}
    <path d="M -70 -100 C -70 -130 70 -130 74 -96 L 70 -56 L -66 -56 Z" fill="#c89a68" {...ol} />
    <path d={`M -70 -96 Q -110 ${-130 + Math.sin(ph * 3) * 10} -100 -150`} stroke="#c89a68" strokeWidth={14} strokeLinecap="round" fill="none" />
    <g transform="translate(80 -116)"><path d="M -20 -10 L 40 -6 L 44 14 L -14 24 Z" fill="#c89a68" {...ol} /><path d="M -12 -14 L -4 -46 L 10 -12 Z" fill="#a8784a" {...ol} strokeWidth={4} /><circle cx={6} cy={0} r={4} fill={P.ink} /><circle cx={44} cy={4} r={5} fill={P.ink} /></g>
  </g>;
};
