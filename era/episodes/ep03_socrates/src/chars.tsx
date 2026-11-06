import React from 'react';
import { clamp, lerp } from './lib';
import { P } from './art';

/* ===== Athens cast — v3 rig: v2 + Greek dress, curly hair/beards, lip-sync ready ===== */
export type Mouth = 'smile' | 'grin' | 'O' | 'flat' | 'sad' | 'talk' | 'blow' | 'shout';
export type MLook = {
  skin: string; skinS: string; hair: string;
  hairStyle: 'topknot' | 'long' | 'grey' | 'baby' | 'short' | 'bald' | 'curly' | 'bun' | 'baldFringe';
  outfit: 'loin' | 'huipil' | 'royal' | 'priest' | 'player' | 'modern' | 'robe' | 'baby' | 'chiton' | 'exomis' | 'himation' | 'peplos' | 'hoplite';
  cloth: string; cloth2: string; cape?: string;
  head?: 'none' | 'wrap' | 'feathers' | 'tall' | 'mitre' | 'ribbon' | 'wreath' | 'helmet' | 'fillet' | 'veil';
  longHead?: boolean; earspool?: boolean; jadeTeeth?: boolean; stripe?: boolean; collar?: 'jade' | 'beads' | 'shell';
  wrinkles?: boolean; beard?: boolean | 'curly' | 'stubble'; paint?: string; barefoot?: boolean; snub?: boolean; eyeS?: number; nose?: 'hook' | 'snub'; broad?: number; hair2?: string; trim?: string;
};
const SK = { a: ['#e2b48a', '#c4936a'], b: ['#d9a578', '#b8845a'], c: ['#c99468', '#a8744c'], d: ['#ebc29a', '#cfa37a'], e: ['#b98258', '#98633e'] };
const G = (o: Partial<MLook>): MLook => ({ skin: SK.a[0], skinS: SK.a[1], hair: '#2a1a12', hairStyle: 'curly', outfit: 'chiton', cloth: '#e8dcc4', cloth2: '#b8a888', ...o });
export const CAST: Record<string, MLook> = {
  you: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#3a2416', outfit: 'chiton', cloth: '#c8612c', cloth2: '#1d1612', trim: '#1d1612' }),
  youKid: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#3a2416', outfit: 'chiton', cloth: '#c8612c', cloth2: '#1d1612', trim: '#1d1612' }),
  baby: G({ skin: SK.b[0], skinS: SK.b[1], hairStyle: 'baby', outfit: 'baby' }),
  dad: G({ skin: SK.e[0], skinS: SK.e[1], hair: '#1d1410', outfit: 'exomis', cloth: '#6f8494', cloth2: '#4a5a66', beard: 'curly', broad: 1.08 }),
  mom: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#2a1810', hairStyle: 'bun', outfit: 'peplos', cloth: '#2f6f8f', cloth2: '#e9d9b0', head: 'fillet', trim: '#e9d9b0' }),
  sister: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#2a1810', hairStyle: 'bun', outfit: 'peplos', cloth: '#e0a838', cloth2: '#8a3a2a', head: 'fillet', trim: '#8a3a2a' }),
  soc: G({ skin: '#e0ae84', skinS: '#c08c62', hair: '#d9d2c4', hairStyle: 'baldFringe', outfit: 'himation', cloth: '#9a8a68', cloth2: '#d6c8a6', beard: 'curly', snub: true, eyeS: 1.18, barefoot: true, wrinkles: true, broad: 1.1 }),
  chaer: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#120c08', outfit: 'chiton', cloth: '#6a8a3a', cloth2: '#3a4a20', beard: 'stubble', trim: '#3a4a20' }),
  laches: G({ skin: SK.e[0], skinS: SK.e[1], hair: '#3a3a3a', hairStyle: 'short', outfit: 'hoplite', cloth: '#a8322a', cloth2: '#c8963c', cape: '#8a2a22', beard: 'curly', head: 'helmet', broad: 1.15 }),
  alc: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#8a5a2a', outfit: 'himation', cloth: '#6a3a8a', cloth2: '#f0e6d0', head: 'wreath', trim: '#e0b040' }),
  xan: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#1d120c', hairStyle: 'bun', outfit: 'peplos', cloth: '#8a2e2e', cloth2: '#e9d9b0', head: 'veil', trim: '#e0b040' }),
  plato: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#4a2e1a', outfit: 'chiton', cloth: '#f0ead8', cloth2: '#2f6f8f', beard: 'curly', broad: 1.25, trim: '#2f6f8f' }),
  platoOld: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#b8b0a2', outfit: 'himation', cloth: '#2f6f8f', cloth2: '#f0ead8', beard: 'curly', broad: 1.2, wrinkles: true }),
  mel: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#120c08', hairStyle: 'long', outfit: 'himation', cloth: '#2f4a3a', cloth2: '#d8ccb0', beard: true, nose: 'hook' }),
  crito: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#c8c2b6', hairStyle: 'short', outfit: 'himation', cloth: '#4a5f7a', cloth2: '#ece2cc', beard: 'curly', wrinkles: true, trim: '#e0b040' }),
  jailer: G({ skin: SK.e[0], skinS: SK.e[1], hair: '#2a2a2a', hairStyle: 'short', outfit: 'exomis', cloth: '#7a5a3a', cloth2: '#5a3a22', beard: 'stubble', broad: 1.12 }),
  herald: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#2a1a12', hairStyle: 'short', outfit: 'himation', cloth: '#d8ccb0', cloth2: '#8a3a2a', beard: 'curly', head: 'wreath' }),
  tyrant: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#120c08', hairStyle: 'short', outfit: 'himation', cloth: '#1d1612', cloth2: '#8a2a22', beard: true, nose: 'hook' }),
  pythia: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#2a1810', hairStyle: 'long', outfit: 'peplos', cloth: '#f2ecdc', cloth2: '#c8a040', head: 'wreath', trim: '#c8a040' }),
  aristotle: G({ skin: SK.a[0], skinS: SK.a[1], hair: '#3a2416', hairStyle: 'short', outfit: 'himation', cloth: '#7a3a2a', cloth2: '#ece2cc', beard: 'curly' }),
  alex: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#b8803a', outfit: 'chiton', cloth: '#6a2a6a', cloth2: '#e0b040', head: 'fillet', trim: '#e0b040' }),
  student: G({ skin: SK.c[0], skinS: SK.c[1], hair: '#1d1410', outfit: 'chiton', cloth: '#d8ccb0', cloth2: '#6a8a3a', trim: '#6a8a3a' }),
  youOld: G({ skin: SK.b[0], skinS: SK.b[1], hair: '#3a2416', outfit: 'himation', cloth: '#c8612c', cloth2: '#efe4cc', beard: 'curly', trim: '#1d1612' }),
  todayK1: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#2a1810', hairStyle: 'short', outfit: 'modern', cloth: '#e0a838', cloth2: '#3a3f4a' }),
  todayK2: G({ skin: '#6a4228', skinS: '#4a2e1a', hair: '#120c08', hairStyle: 'curly', outfit: 'modern', cloth: '#6a8a3a', cloth2: '#2a2f3a' }),
  todayS: G({ skin: '#8a5a3a', skinS: '#6a4228', hair: '#120c08', hairStyle: 'short', outfit: 'modern', cloth: '#2f6f8f', cloth2: '#3a3f4a' }),
  todayT: G({ skin: SK.d[0], skinS: SK.d[1], hair: '#5a3a26', hairStyle: 'bun', outfit: 'modern', cloth: '#c8612c', cloth2: '#2a2f3a' }),
};
export const citizen = (i: number): MLook => {
  const c = ['#d8ccb0', '#7a8a9a', '#a8743a', '#5f7a4a', '#8a4a3a', '#c8b890', '#4a5f7a', '#9a6a8a'][i % 8];
  const sk = [SK.a, SK.b, SK.c, SK.d, SK.e][(i * 3) % 5]; const h = ['#1d1410', '#3a2416', '#c8c2b6', '#120c08', '#5a3a26'][(i * 7) % 5];
  return G({ skin: sk[0], skinS: sk[1], hair: h, hairStyle: (['curly', 'short', 'baldFringe', 'curly'] as const)[(i * 5) % 4], outfit: i % 3 ? 'himation' : 'chiton', cloth: c, cloth2: '#ece2cc', beard: i % 4 === 3 ? 'stubble' : 'curly', wrinkles: h === '#c8c2b6' });
};


export type Prop = 'none' | 'spear' | 'torch' | 'cob' | 'brush' | 'pod' | 'cup' | 'bundle' | 'book' | 'phone' | 'tablet' | 'jar' | 'bean' | 'kylix' | 'amphora' | 'staff' | 'scroll' | 'hemlock' | 'lyre' | 'pebble' | 'shield';
export type MPose = {
  walk?: number; phase?: number; armF?: number; armB?: number; elbowF?: number; elbowB?: number; tilt?: number; turn?: number; blink?: number;
  mouth?: Mouth; open?: number; brow?: number; lookX?: number; lookY?: number; bob?: number; crouch?: number; kneel?: number;
  holdF?: Prop; holdB?: Prop; lean?: number;
};
const OL = 7;
const HAND = 'M -10 -4 C -13 7 -10 17 -1 19 C 8 20 12 12 11 1 C 10 -5 4 -7 -2 -7 Z';
const THUMB = 'M 7 -1 C 16 -3 19 6 11 10';

export const MChar: React.FC<{ look: MLook; pose?: MPose; x: number; y: number; s?: number; flip?: boolean; age?: number; opacity?: number }> =
  ({ look, pose = {}, x, y, s = 1, flip = false, age = 1, opacity = 1 }) => {
    const { walk = 0, phase = 0, armF = .15, armB = -.15, elbowF = .35, elbowB = .25, tilt = 0, turn = .35, blink = 0, mouth = 'smile', open = 0,
      brow = 0, lookX = 0, lookY = 0, bob = 0, crouch = 0, kneel = 0, holdF = 'none', holdB = 'none', lean = 0 } = pose;
    const kid = clamp(1 - age, 0, 1);
    const body = lerp(1, .62, kid), headS = lerp(1, 1.12, kid);
    const sw = Math.sin(phase) * .55 * walk;
    const lift = walk ? Math.abs(Math.sin(phase)) * 6 * walk : 0;
    const legL = 82 * body, torsoH = 108 * body;
    const hipY = -legL + crouch * 18 + kneel * 44 - lift + bob;
    const shY = hipY - torsoH, headY = shY - 56 * headS;
    const ol = { stroke: P.ink, strokeWidth: OL, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
    const L = look; const skirt = L.outfit === 'huipil' || L.outfit === 'priest' || L.outfit === 'robe' || L.outfit === 'himation' || L.outfit === 'peplos';
    const U = 46 * body, F = 44 * body;

    const prop = (p: Prop) => {
      switch (p) {
        case 'spear': return <g><line x1={0} y1={-170} x2={0} y2={140} stroke={P.ink} strokeWidth={13} strokeLinecap="round" /><line x1={0} y1={-170} x2={0} y2={140} stroke="#8a6a44" strokeWidth={6} /><path d="M -12 -168 L 0 -214 L 12 -168 Z" fill="#26262c" {...ol} strokeWidth={5} /></g>;
        case 'torch': return <g><line x1={0} y1={14} x2={0} y2={-80} stroke={P.ink} strokeWidth={14} strokeLinecap="round" /><line x1={0} y1={14} x2={0} y2={-80} stroke="#6b4a2a" strokeWidth={7} /></g>;
        case 'cob': return <g transform="rotate(-30)"><ellipse cx={0} cy={-22} rx={11} ry={26} fill="#e8c34a" {...ol} strokeWidth={5} />{[0, 1, 2, 3].map((k) => <line key={k} x1={-8} y1={-38 + k * 10} x2={8} y2={-38 + k * 10} stroke="#c99a2a" strokeWidth={3} />)}<path d="M -10 0 C -22 -20 -16 -40 -6 -50 M 10 0 C 20 -18 18 -36 10 -46" stroke="#7fa84a" strokeWidth={6} fill="none" /></g>;
        case 'brush': return <g><line x1={0} y1={6} x2={0} y2={-56} stroke={P.ink} strokeWidth={8} strokeLinecap="round" /><line x1={0} y1={6} x2={0} y2={-56} stroke="#caa86a" strokeWidth={4} /><path d="M -4 -56 L 0 -70 L 4 -56 Z" fill={P.ink} /></g>;
        case 'pod': return <g transform="rotate(-20)"><ellipse cx={0} cy={-24} rx={18} ry={30} fill="#c06a2a" {...ol} strokeWidth={5} />{[-8, 0, 8].map((k) => <path key={k} d={`M ${k} -50 Q ${k * 1.6} -24 ${k} 2`} stroke="#8a4a1a" strokeWidth={3} fill="none" />)}</g>;
        case 'cup': return <g><path d="M -18 -40 L 18 -40 L 14 6 L -14 6 Z" fill="#c9884a" {...ol} strokeWidth={5} /><path d="M -16 -26 L 16 -26" stroke="#7a3a1a" strokeWidth={4} /><ellipse cx={0} cy={-42} rx={18} ry={5} fill="#8a4a2a" stroke={P.ink} strokeWidth={4} /></g>;
        case 'bundle': return <g><ellipse cx={0} cy={-30} rx={40} ry={34} fill="#d9c9a0" {...ol} /><path d="M -30 -50 Q 0 -30 30 -50" stroke="#8a6a3a" strokeWidth={5} fill="none" /></g>;
        case 'book': return <g><rect x={-40} y={-50} width={80} height={52} rx={4} fill="#f2ead8" {...ol} strokeWidth={5} />{[0, 1, 2].map((k) => <rect key={k} x={-30 + k * 22} y={-40} width={14} height={14} rx={3} fill={k % 2 ? '#b5432a' : P.ink} />)}</g>;
        case 'phone': return <g><rect x={-12} y={-44} width={24} height={44} rx={5} fill="#2a2f3a" {...ol} strokeWidth={4} /><rect x={-8} y={-39} width={16} height={32} rx={2} fill="#7fc4e0" /></g>;
        case 'tablet': return <g><rect x={-34} y={-60} width={68} height={52} rx={6} fill="#2a2f3a" {...ol} strokeWidth={4} /><rect x={-28} y={-54} width={56} height={40} rx={3} fill="#e9dcc0" />{[0, 1].map((k) => <rect key={k} x={-22 + k * 24} y={-48} width={18} height={18} rx={3} fill="#b5432a" opacity={.8} />)}</g>;
        case 'jar': return <g><path d="M -26 -60 C -40 -40 -40 -8 -20 0 L 20 0 C 40 -8 40 -40 26 -60 Z" fill="#b8763e" {...ol} strokeWidth={5} /><path d="M -30 -34 L 30 -34" stroke="#7a3a1a" strokeWidth={5} /></g>;
        case 'bean': return <ellipse cx={0} cy={-6} rx={8} ry={6} fill="#5a2e1a" stroke={P.ink} strokeWidth={3} />;
        case 'kylix': return <g><path d="M -40 -30 Q 0 6 40 -30 Z" fill="#c8612c" {...ol} strokeWidth={5} /><path d="M -40 -30 Q 0 -22 40 -30" stroke={P.ink} strokeWidth={5} fill="none" /><path d="M -50 -34 Q -56 -24 -42 -24 M 50 -34 Q 56 -24 42 -24" stroke={P.ink} strokeWidth={5} fill="none" /><path d="M -6 -12 L -10 6 L 10 6 L 6 -12" fill="#1d1612" /></g>;
        case 'hemlock': return <g><path d="M -22 -46 L 22 -46 L 16 4 L -16 4 Z" fill="#8a8a7a" {...ol} strokeWidth={5} /><ellipse cx={0} cy={-46} rx={22} ry={6} fill="#4a5a3a" stroke={P.ink} strokeWidth={4} /></g>;
        case 'amphora': return <g transform="translate(0 30)"><path d="M -12 -118 L 12 -118 L 14 -100 C 46 -84 50 -30 18 0 L 6 12 L -6 12 L -18 0 C -50 -30 -46 -84 -14 -100 Z" fill="#c8612c" {...ol} strokeWidth={5} /><path d="M -14 -104 C -34 -112 -34 -92 -26 -86 M 14 -104 C 34 -112 34 -92 26 -86" stroke={P.ink} strokeWidth={5} fill="none" /><path d="M -36 -60 L 36 -60 M -38 -44 L 38 -44" stroke={P.ink} strokeWidth={6} /></g>;
        case 'staff': return <g><line x1={0} y1={-150} x2={0} y2={150} stroke={P.ink} strokeWidth={12} strokeLinecap="round" /><line x1={0} y1={-150} x2={0} y2={150} stroke="#8a6a44" strokeWidth={5} /></g>;
        case 'scroll': return <g><rect x={-34} y={-30} width={68} height={26} fill="#efe4c8" {...ol} strokeWidth={4} /><circle cx={-36} cy={-17} r={14} fill="#d8c8a0" stroke={P.ink} strokeWidth={4} /><circle cx={36} cy={-17} r={14} fill="#d8c8a0" stroke={P.ink} strokeWidth={4} /></g>;
        case 'lyre': return <g><path d="M -30 0 C -40 -40 -30 -80 -20 -100 M 30 0 C 40 -40 30 -80 20 -100" stroke={P.ink} strokeWidth={9} fill="none" strokeLinecap="round" /><path d="M -24 -86 L 24 -86" stroke={P.ink} strokeWidth={7} />{[-12, -4, 4, 12].map((k) => <line key={k} x1={k} y1={-86} x2={k} y2={-4} stroke="#e9d9b0" strokeWidth={2} />)}<ellipse cx={0} cy={0} rx={34} ry={14} fill="#8a5a2a" {...ol} strokeWidth={5} /></g>;
        case 'pebble': return <circle cx={0} cy={-6} r={9} fill="#3a3a3a" stroke={P.ink} strokeWidth={3} />;
        case 'shield': return <g><circle cx={0} cy={-20} r={70} fill="#c8963c" {...ol} /><circle cx={0} cy={-20} r={54} fill="#a8322a" stroke={P.ink} strokeWidth={5} /><path d="M -20 -40 L 0 -60 L 20 -40 L 0 0 Z" fill="#c8963c" /></g>;
        default: return null;
      }
    };
    const arm = (side: number, a: number, el: number, hold: Prop) => (
      <g transform={`translate(${side * 36 * body} ${shY + 14}) rotate(${a * 57})`}>
        <rect x={-12 * body} y={-6} width={24 * body} height={U + 10} rx={12 * body} fill={L.skin} {...ol} />
        {(L.outfit === 'huipil' || L.outfit === 'modern' || L.outfit === 'robe' || L.outfit === 'priest') && <rect x={-14 * body} y={-8} width={28 * body} height={U * .75} rx={12 * body} fill={L.outfit === 'huipil' ? '#f4ecdc' : L.cloth} {...ol} />}
        {(L.outfit === 'chiton' || L.outfit === 'hoplite' || (L.outfit === 'exomis' && side < 0) || (L.outfit === 'himation' && side > 0)) && <rect x={-15 * body} y={-10} width={30 * body} height={U * .45} rx={12 * body} fill={L.outfit === 'himation' ? L.cloth2 : L.cloth} {...ol} />}
        {L.outfit === 'himation' && side < 0 && <rect x={-17 * body} y={-12} width={34 * body} height={U * .95} rx={14 * body} fill={L.cloth} {...ol} />}
        {L.outfit === 'royal' && <rect x={-13 * body} y={U - 14} width={26 * body} height={12} rx={5} fill="#2f9a6a" {...ol} strokeWidth={4} />}
        <g transform={`translate(0 ${U}) rotate(${-el * 57})`}>
          <rect x={-11 * body} y={-8} width={22 * body} height={F + 8} rx={11 * body} fill={L.skin} {...ol} />
          {L.outfit === 'robe' && <rect x={-13 * body} y={-8} width={26 * body} height={F * .8} rx={10} fill={L.cloth} {...ol} />}
          <g transform={`translate(0 ${F}) scale(${body * 1.05})`}>
            {hold !== 'none' && (hold === 'amphora' || hold === 'scroll' ? <g transform={`rotate(${-(a - el) * 57})`}><g transform={hold === 'amphora' ? 'translate(0 110) scale(.85)' : ''}>{prop(hold)}</g></g> : prop(hold))}
            <path d={HAND} fill={L.skin} {...ol} strokeWidth={5} />
            <path d={THUMB} fill="none" stroke={P.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
      </g>);
    const leg = (side: number, a: number) => (
      <g transform={`translate(${side * 17 * body} ${hipY}) rotate(${(a - kneel * (side > 0 ? 1.3 : .2)) * 57})`}>
        {L.outfit === 'modern' ? <rect x={-17 * body} y={-4} width={34 * body} height={legL - 2} rx={12 * body} fill={L.cloth2} {...ol} />
          : <rect x={-14 * body} y={0} width={28 * body} height={legL - 6} rx={13 * body} fill={L.skin} {...ol} />}
        {L.outfit === 'player' && side > 0 && <rect x={-17 * body} y={legL * .35} width={34 * body} height={18} rx={8} fill={L.cloth} {...ol} strokeWidth={5} />}
        <ellipse cx={8 * body} cy={legL - 6} rx={20 * body} ry={9 * body} fill={L.outfit === 'modern' ? '#3a3a3a' : L.barefoot ? L.skin : '#8a6a44'} {...ol} strokeWidth={5} />
        {!L.barefoot && L.outfit !== 'modern' && <path d={`M ${-6 * body} ${legL - 30} L ${10 * body} ${legL - 16} M ${-8 * body} ${legL - 18} L ${10 * body} ${legL - 26}`} stroke="#6a4a2a" strokeWidth={4} />}
      </g>);
    // torso by outfit
    const tw = 40 * body, hw = 46 * body;
    const torso = (() => {
      const bodyShape = `M ${-tw} ${shY} Q 0 ${shY - 10} ${tw} ${shY} L ${hw} ${hipY + 4} Q 0 ${hipY + 12} ${-hw} ${hipY + 4} Z`;
      switch (L.outfit) {
        case 'huipil': return <g>
          <path d={`M ${-hw - 4} ${hipY - 6} L ${hw + 4} ${hipY - 6} L ${hw + 14} ${-6} L ${-hw - 14} ${-6} Z`} fill={L.cloth} {...ol} />
          {[0, 1, 2].map((k) => <path key={k} d={`M ${-hw - 6 - k * 3} ${hipY + 18 + k * 22} L ${hw + 6 + k * 3} ${hipY + 18 + k * 22}`} stroke={L.cloth2} strokeWidth={6} />)}
          <path d={`M ${-tw - 6} ${shY} Q 0 ${shY - 12} ${tw + 6} ${shY} L ${hw + 8} ${hipY + 6} Q 0 ${hipY + 16} ${-hw - 8} ${hipY + 6} Z`} fill="#f4ecdc" {...ol} />
          <path d={`M ${-22 * body} ${shY + 2} L ${-22 * body} ${shY + 34 * body} L ${22 * body} ${shY + 34 * body} L ${22 * body} ${shY + 2}`} fill="none" stroke={L.cloth2} strokeWidth={9 * body} />
          <path d={`M ${-30 * body} ${shY + 50 * body} l 10 -10 l 10 10 l 10 -10 l 10 10 l 10 -10 l 10 10`} fill="none" stroke={L.cloth} strokeWidth={5} />
        </g>;
        case 'robe': return <g>
          <path d={`M ${-tw - 6} ${shY} Q 0 ${shY - 12} ${tw + 6} ${shY} L ${hw + 20} ${-4} L ${-hw - 20} ${-4} Z`} fill={L.cloth} {...ol} />
          <path d={`M ${-24 * body} ${shY + 2} Q 0 ${shY + 30} ${24 * body} ${shY + 2}`} fill={L.cloth2} {...ol} strokeWidth={5} />
          <path d={`M 0 ${shY + 30} L 0 ${-10}`} stroke="#8a2a2a" strokeWidth={8} />
        </g>;
        case 'priest': return <g>
          <path d={`M ${-tw - 6} ${shY} Q 0 ${shY - 12} ${tw + 6} ${shY} L ${hw + 18} ${-4} L ${-hw - 18} ${-4} Z`} fill={L.cloth} {...ol} />
          {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={(-24 + (k % 3) * 24) * body} cy={shY + 50 + Math.floor(k / 3) * 60} r={6} fill={L.cloth2} />)}
        </g>;
        case 'modern': return <g>
          <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 10} ${tw + 4} ${shY} L ${hw} ${hipY + 8} L ${-hw} ${hipY + 8} Z`} fill={L.cloth} {...ol} />
          <path d={`M ${-12 * body} ${shY - 2} Q 0 ${shY + 14} ${12 * body} ${shY - 2}`} fill="none" stroke={P.ink} strokeWidth={5} />
        </g>;
        case 'baby': return null;
        case 'chiton': case 'exomis': case 'hoplite': {
          const hem = hipY + 50 * body, c = L.cloth;
          return <g>
            {L.outfit === 'exomis' && <path d={bodyShape} fill={L.skin} {...ol} />}
            <path d={L.outfit === 'exomis' ? `M ${-tw - 4} ${shY + 2} Q ${-tw + 10} ${shY - 8} ${-tw + 24} ${shY - 4} L ${tw + 8} ${shY + 50 * body} L ${hw + 12} ${hem} Q 0 ${hem + 10} ${-hw - 12} ${hem} Z` : `M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw + 12} ${hem} Q 0 ${hem + 10} ${-hw - 12} ${hem} Z`} fill={c} {...ol} />
            {[-1, 0, 1].map((k) => <path key={k} d={`M ${k * 18 * body} ${hipY + 4} L ${k * 24 * body} ${hem - 2}`} stroke="rgba(0,0,0,.22)" strokeWidth={4} />)}
            {L.trim && <path d={`M ${-hw - 10} ${hem - 8} Q 0 ${hem + 2} ${hw + 10} ${hem - 8}`} stroke={L.trim} strokeWidth={6} fill="none" strokeDasharray="12 6" />}
            <path d={`M ${-tw - 2} ${hipY - 18} Q 0 ${hipY - 10} ${tw + 2} ${hipY - 18}`} stroke={L.outfit === 'hoplite' ? '#5a3a1a' : L.cloth2} strokeWidth={8} fill="none" />
            {L.outfit === 'hoplite' && <g><path d={`M ${-tw - 2} ${shY + 2} Q 0 ${shY - 10} ${tw + 2} ${shY + 2} L ${tw - 2} ${hipY - 18} Q 0 ${hipY - 8} ${-tw + 2} ${hipY - 18} Z`} fill={L.cloth2} {...ol} />
              <path d={`M ${-20 * body} ${shY + 30} Q ${-6} ${shY + 40} ${-4} ${shY + 60} M ${20 * body} ${shY + 30} Q ${6} ${shY + 40} ${4} ${shY + 60}`} stroke="#8a6020" strokeWidth={5} fill="none" />
              {[-2, -1, 0, 1, 2].map((k) => <rect key={k} x={k * 18 * body - 8} y={hipY - 16} width={16} height={34} rx={4} fill={L.cloth2} stroke={P.ink} strokeWidth={4} />)}</g>}
          </g>;
        }
        case 'peplos': {
          const c = L.cloth;
          return <g>
            <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw + 22} ${-4} L ${-hw - 22} ${-4} Z`} fill={c} {...ol} />
            {[-2, -1, 0, 1, 2].map((k) => <path key={k} d={`M ${k * 14 * body} ${hipY} L ${k * 22 * body} ${-10}`} stroke="rgba(0,0,0,.2)" strokeWidth={4} />)}
            <path d={`M ${-tw - 8} ${shY + 2} Q 0 ${shY - 10} ${tw + 8} ${shY + 2} L ${hw + 10} ${hipY - 6} Q 0 ${hipY + 6} ${-hw - 10} ${hipY - 6} Z`} fill={c} {...ol} />
            {L.trim && <path d={`M ${-hw - 8} ${hipY - 12} Q 0 ${hipY} ${hw + 8} ${hipY - 12}`} stroke={L.trim} strokeWidth={6} fill="none" />}
            {L.trim && <path d={`M ${-hw - 18} ${-14} L ${hw + 18} ${-14}`} stroke={L.trim} strokeWidth={6} />}
            <path d={`M ${-tw + 2} ${shY + 50 * body} Q 0 ${shY + 58 * body} ${tw - 2} ${shY + 50 * body}`} stroke={L.cloth2} strokeWidth={6} fill="none" />
          </g>;
        }
        case 'himation': {
          return <g>
            <path d={`M ${-tw - 4} ${shY} Q 0 ${shY - 12} ${tw + 4} ${shY} L ${hw + 18} ${-4} L ${-hw - 18} ${-4} Z`} fill={L.cloth2} {...ol} />
            <path d={`M ${-tw - 8} ${shY - 4} Q ${-tw + 30} ${shY - 14} ${-6} ${shY - 2} L ${tw + 14} ${hipY + 10} L ${hw + 22} ${-30} Q 0 ${-14} ${-hw - 24} ${-26} Z`} fill={L.cloth} {...ol} />
            {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${-tw + 4 + k * 20} ${shY + 14 + k * 8} Q ${-4 + k * 18} ${hipY - 10 + k * 6} ${-hw + 10 + k * 26} ${-36}`} stroke="rgba(0,0,0,.22)" strokeWidth={5} fill="none" />)}
            {L.trim && <path d={`M ${-hw - 22} ${-30} Q 0 ${-16} ${hw + 20} ${-34}`} stroke={L.trim} strokeWidth={6} fill="none" />}
          </g>;
        }
        default: return <g>
          <path d={bodyShape} fill={L.skin} {...ol} />
          <path d={`M ${12 * body} ${shY + 18} Q ${30 * body} ${shY + 50} ${14 * body} ${hipY - 20}`} fill="none" stroke={L.skinS} strokeWidth={6} strokeLinecap="round" opacity={.6} />
          {L.outfit === 'player'
            ? <path d={`M ${-hw - 10} ${hipY - 34} Q 0 ${hipY - 48} ${hw + 10} ${hipY - 34} L ${hw + 12} ${hipY - 4} Q 0 ${hipY + 8} ${-hw - 12} ${hipY - 4} Z`} fill={L.cloth} {...ol} />
            : <g>
              <path d={`M ${-hw - 2} ${hipY - 24} Q 0 ${hipY - 32} ${hw + 2} ${hipY - 24} L ${hw + 4} ${hipY + 6} Q 0 ${hipY + 14} ${-hw - 4} ${hipY + 6} Z`} fill={L.outfit === 'royal' ? L.cloth : L.cloth} {...ol} />
              {L.outfit === 'royal' && [0, 1, 2, 3, 4].map((k) => <circle key={k} cx={(-34 + k * 17) * body} cy={hipY - 8 + (k % 2) * 6} r={4.5} fill={L.cloth2} />)}
              <path d={`M ${-14 * body} ${hipY} L ${14 * body} ${hipY} L ${10 * body} ${hipY + 46 * body} L ${-10 * body} ${hipY + 46 * body} Z`} fill={L.outfit === 'royal' ? '#f0e2c0' : L.cloth} {...ol} strokeWidth={5} />
              <path d={`M ${-10 * body} ${hipY + 30 * body} L ${10 * body} ${hipY + 30 * body}`} stroke={L.cloth2} strokeWidth={6} />
            </g>}
        </g>;
      }
    })();
    const collar = L.collar && <g>{Array.from({ length: L.collar === 'jade' ? 9 : 7 }).map((_, k, arr) => { const u = k / (arr.length - 1) - .5; return <circle key={k} cx={u * 64 * body} cy={shY + 10 + (1 - 4 * u * u) * 12} r={L.collar === 'jade' ? 8 : 5.5} fill={L.collar === 'jade' ? '#2f9a6a' : L.collar === 'shell' ? '#efe6d2' : '#c93a2e'} stroke={P.ink} strokeWidth={3} />; })}</g>;
    const cape = L.cape && <path d={`M ${-tw - 4} ${shY - 2} Q 0 ${shY - 16} ${tw + 4} ${shY - 2} L ${tw + 26} ${hipY - 6} L ${-tw - 26} ${hipY - 6} Z`} fill={L.cape} {...ol} />;
    const plumes = L.outfit === 'royal' && <g>{[-3, -2, -1, 0, 1, 2, 3].map((k) => <path key={k} d={`M ${k * 8} ${shY + 20} C ${k * 30} ${shY - 90} ${k * 50 - 20} ${shY - 200} ${k * 38 - 30} ${shY - 260}`} stroke="#1f7a5a" strokeWidth={22} fill="none" strokeLinecap="round" />)}
      {[-3, -2, -1, 0, 1, 2, 3].map((k) => <path key={'i' + k} d={`M ${k * 8} ${shY + 20} C ${k * 30} ${shY - 90} ${k * 50 - 20} ${shY - 200} ${k * 38 - 30} ${shY - 260}`} stroke="#3fbf8a" strokeWidth={8} fill="none" strokeLinecap="round" />)}</g>;

    // face
    const ex = 22, fx = turn * 14 + lookX * 3;
    const browY = -24 - brow * 3;
    const mouthEl = (() => {
      const w = 18, oy = 28;
      const teeth = L.jadeTeeth && <rect x={fx - 5} y={oy - 2} width={10} height={6} rx={2} fill="#2f9a6a" />;
      switch (mouth) {
        case 'grin': return <g><path d={`M ${fx - w} ${oy - 4} Q ${fx} ${oy + 20} ${fx + w} ${oy - 4} Z`} fill="#5a1f17" {...ol} strokeWidth={5} /><path d={`M ${fx - w + 3} ${oy - 2} L ${fx + w - 3} ${oy - 2} L ${fx + w - 6} ${oy + 3} L ${fx - w + 6} ${oy + 3} Z`} fill="#f4efe4" />{teeth}</g>;
        case 'O': case 'blow': return <ellipse cx={fx} cy={oy + 2} rx={mouth === 'blow' ? 6 : 9} ry={mouth === 'blow' ? 6 : 12} fill="#5a1f17" {...ol} strokeWidth={5} />;
        case 'shout': return <g><path d={`M ${fx - 16} ${oy - 6} Q ${fx} ${oy - 10} ${fx + 16} ${oy - 6} Q ${fx + 14} ${oy + 22} ${fx} ${oy + 24} Q ${fx - 14} ${oy + 22} ${fx - 16} ${oy - 6} Z`} fill="#5a1f17" {...ol} strokeWidth={5} />{teeth}</g>;
        case 'flat': return <path d={`M ${fx - 13} ${oy + 2} L ${fx + 13} ${oy + 2}`} fill="none" {...ol} strokeWidth={5} />;
        case 'sad': return <path d={`M ${fx - 14} ${oy + 8} Q ${fx} ${oy - 4} ${fx + 14} ${oy + 8}`} fill="none" {...ol} strokeWidth={5} />;
        case 'talk': return <g><ellipse cx={fx} cy={oy + 3} rx={12} ry={2 + open * 10} fill="#5a1f17" {...ol} strokeWidth={5} />{open > .5 && teeth}</g>;
        default: return <path d={`M ${fx - 16} ${oy} Q ${fx} ${oy + 14} ${fx + 16} ${oy}`} fill="none" {...ol} strokeWidth={5} />;
      }
    })();
    const eye = (sx: number) => {
      const cx = fx + sx * ex * (1 - turn * sx * .25), h = 13 * (1 - clamp(blink));
      return <g key={sx}>
        <ellipse cx={cx} cy={-6} rx={11 * (L.eyeS || 1)} ry={Math.max(1.5, h * (L.eyeS || 1))} fill={P.chalk} {...ol} strokeWidth={4.5} />
        {h > 4 && <circle cx={cx + lookX * 4 + turn * 3} cy={-4 + lookY * 3} r={6.5} fill={P.ink} />}
        {h > 4 && <circle cx={cx + lookX * 4 + turn * 3 + 2.5} cy={-7 + lookY * 3} r={2} fill="#fff" />}
        <path d={`M ${cx - 12} ${browY - sx * brow * 2} L ${cx + 12} ${browY + sx * brow * 2}`} stroke={P.ink} strokeWidth={7} strokeLinecap="round" />
      </g>;
    };
    const headPath = L.longHead
      ? 'M -60 -6 C -66 -52 -64 -100 -30 -120 C -2 -134 40 -112 56 -64 C 66 -36 62 -18 60 -6 C 62 32 34 58 0 60 C -34 58 -62 32 -60 -6 Z'
      : 'M -60 -10 C -62 -56 -30 -66 0 -66 C 32 -66 62 -54 60 -10 C 62 30 34 56 0 58 C -34 56 -62 30 -60 -10 Z';
    const top = L.longHead ? -118 : -66;
    const hair = (() => {
      const c = L.hair;
      switch (L.hairStyle) {
        case 'topknot': return <g>
          <path d={L.longHead ? 'M -62 -8 C -68 -56 -64 -102 -30 -122 C 0 -136 42 -114 58 -66 C 40 -84 10 -90 -14 -84 C -36 -70 -50 -40 -62 -8 Z' : 'M -62 -12 C -66 -56 -30 -70 0 -70 C 32 -70 64 -56 62 -14 C 40 -40 -30 -44 -62 -12 Z'} fill={c} {...ol} />
          <g transform={`translate(${L.longHead ? -40 : -20} ${top - 6}) rotate(-30)`}><ellipse cx={0} cy={-16} rx={16} ry={26} fill={c} {...ol} /><rect x={-14} y={2} width={28} height={10} rx={4} fill={L.cloth2} {...ol} strokeWidth={4} /></g>
        </g>;
        case 'long': return <g>
          <path d={`M -64 -10 C -74 40 -70 110 -50 150 L -20 150 C -40 100 -44 40 -40 0 Z`} fill={c} {...ol} />
          <path d={L.longHead ? 'M -62 -8 C -68 -56 -64 -102 -30 -122 C 0 -136 42 -114 58 -66 C 52 -46 40 -40 30 -50 C 10 -70 -30 -60 -44 -30 Z' : 'M -64 -10 C -66 -66 -30 -84 0 -84 C 36 -84 66 -64 64 -8 C 50 -46 26 -58 0 -58 C -28 -58 -52 -44 -64 -10 Z'} fill={c} {...ol} />
        </g>;
        case 'grey': return <g>
          <path d={L.longHead ? 'M -62 -8 C -68 -56 -64 -102 -30 -122 C 0 -136 42 -114 58 -66 C 40 -84 10 -90 -14 -84 C -36 -70 -50 -40 -62 -8 Z' : 'M -62 -12 C -66 -56 -30 -70 0 -70 C 32 -70 64 -56 62 -14 C 40 -40 -30 -44 -62 -12 Z'} fill={c} {...ol} />
          <circle cx={-56} cy={top + 30} r={22} fill={c} {...ol} />
        </g>;
        case 'short': return <path d="M -62 -14 C -66 -60 -30 -76 0 -76 C 34 -76 66 -60 62 -16 C 50 -40 30 -50 4 -48 C -24 -46 -50 -40 -62 -14 Z" fill={c} {...ol} />;
        case 'baby': return <path d="M -10 -62 Q 4 -80 16 -62" fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" />;
        case 'curly': return <g>{[[-56, -20, 20], [-58, -44, 22], [-44, -62, 24], [-20, -74, 24], [6, -76, 24], [30, -70, 23], [50, -54, 21], [58, -32, 18], [-34, -48, 18], [-8, -56, 18], [18, -54, 17]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={c} {...ol} strokeWidth={5} />)}
          {[[-34, -50, 16], [-8, -58, 16], [18, -56, 15], [38, -48, 14]].map(([cx, cy, r], k) => <circle key={'f' + k} cx={cx} cy={cy} r={r} fill={c} />)}</g>;
        case 'bun': return <g><circle cx={-50} cy={-56} r={28} fill={c} {...ol} /><path d="M -62 -10 C -66 -60 -30 -74 0 -74 C 34 -74 66 -60 62 -12 C 48 -42 24 -50 0 -50 C -26 -50 -48 -40 -62 -10 Z" fill={c} {...ol} />
          {[-1, 1].map((q) => <path key={q} d={`M ${q * 30} -48 q ${q * 12} 10 ${q * 6} 22`} stroke={L.hair2 || '#000'} strokeOpacity={.3} strokeWidth={4} fill="none" />)}</g>;
        case 'baldFringe': return <g>{[[-60, -6, 15], [-62, -26, 15], [-54, -44, 13], [60, -6, 15], [62, -26, 15], [54, -44, 13]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={c} {...ol} strokeWidth={5} />)}
          <path d="M -24 -56 Q 0 -62 22 -56" stroke={L.skinS} strokeWidth={5} fill="none" opacity={.6} /></g>;
        default: return <path d="M -60 -10 C -62 -40 -50 -46 -40 -40" fill="none" stroke={c} strokeWidth={8} strokeLinecap="round" />;
      }
    })();
    const headwear = (() => {
      switch (L.head) {
        case 'wrap': return <path d={L.longHead ? 'M -62 -40 C -60 -70 -50 -90 -34 -100 C -10 -110 30 -96 52 -66 L 56 -48 C 30 -78 -10 -84 -34 -74 C -50 -64 -58 -50 -62 -26 Z' : 'M -62 -40 Q 0 -70 62 -40 L 60 -24 Q 0 -54 -60 -24 Z'} fill="#f0e6d0" {...ol} strokeWidth={5} />;
        case 'ribbon': return <g><path d={L.longHead ? 'M -62 -40 C -60 -70 -50 -90 -34 -100 C -10 -110 30 -96 52 -66 L 56 -48 C 30 -78 -10 -84 -34 -74 C -50 -64 -58 -50 -62 -26 Z' : 'M -64 -40 Q 0 -70 64 -40 L 62 -24 Q 0 -54 -62 -24 Z'} fill={L.cloth2} {...ol} strokeWidth={5} /><path d="M -60 -30 l -26 30 M -58 -24 l -14 40" stroke={L.cloth2} strokeWidth={8} strokeLinecap="round" /></g>;
        case 'feathers': return <g>
          {[-2, -1, 0, 1, 2].map((k) => <path key={k} d={`M ${-10 + k * 10} ${top + 10} C ${-20 + k * 30} ${top - 60} ${-40 + k * 40} ${top - 120} ${-70 + k * 36} ${top - 160}`} stroke="#1f7a5a" strokeWidth={16} fill="none" strokeLinecap="round" />)}
          {[-2, -1, 0, 1, 2].map((k) => <path key={'i' + k} d={`M ${-10 + k * 10} ${top + 10} C ${-20 + k * 30} ${top - 60} ${-40 + k * 40} ${top - 120} ${-70 + k * 36} ${top - 160}`} stroke="#3fbf8a" strokeWidth={5} fill="none" strokeLinecap="round" />)}
          <path d={`M -58 ${top + 52} C -60 ${top + 10} -30 ${top - 14} 6 ${top - 10} C 40 ${top - 6} 60 ${top + 24} 58 ${top + 56} Z`} fill="#e0a838" {...ol} />
          <circle cx={0} cy={top + 22} r={14} fill="#2f9a6a" stroke={P.ink} strokeWidth={4} />
        </g>;
        case 'tall': return <g><path d={`M -50 ${top + 50} L -40 ${top - 70} L 40 ${top - 70} L 50 ${top + 50} Z`} fill="#e9d9a0" {...ol} /><path d={`M -44 ${top - 10} L 44 ${top - 10} M -42 ${top - 40} L 42 ${top - 40}`} stroke="#b5432a" strokeWidth={8} />
          {[-1, 0, 1].map((k) => <path key={k} d={`M ${k * 26} ${top - 70} C ${k * 40} ${top - 120} ${k * 50} ${top - 150} ${k * 60} ${top - 170}`} stroke="#1f7a5a" strokeWidth={12} fill="none" strokeLinecap="round" />)}</g>;
        case 'wreath': return <g>{Array.from({ length: 13 }).map((_, k) => { const a = Math.PI * (1.05 + k * .07); const cx = Math.cos(a) * 64, cy = -18 + Math.sin(a) * 52; return <ellipse key={k} cx={cx} cy={cy} rx={14} ry={7} transform={`rotate(${a * 57 + 60} ${cx} ${cy})`} fill={k % 2 ? '#4f8a3a' : '#6aa84a'} stroke={P.ink} strokeWidth={3} />; })}</g>;
        case 'fillet': return <path d="M -64 -34 Q 0 -66 64 -34" stroke={L.trim || L.cloth2} strokeWidth={9} fill="none" strokeLinecap="round" />;
        case 'veil': return <path d="M -70 -20 C -76 -70 -36 -96 0 -96 C 40 -96 76 -70 70 -20 C 76 40 84 110 70 150 L 46 150 C 56 90 56 30 50 -10 C 40 -50 -40 -50 -50 -10 C -56 30 -56 90 -46 150 L -70 150 C -84 110 -76 40 -70 -20 Z" fill={L.cloth} opacity={.9} {...ol} />;
        case 'helmet': return <g><path d="M -62 -30 C -66 -84 -30 -100 0 -100 C 32 -100 66 -84 62 -30 L 60 -40 Q 0 -60 -60 -40 Z" fill="#c8963c" {...ol} /><path d="M -30 -96 C -20 -150 30 -150 40 -96" fill="#a8322a" {...ol} /><path d="M -24 -112 L 32 -112" stroke="#6a1a14" strokeWidth={6} /></g>;
        case 'mitre': return <g><path d={`M -42 ${top + 40} L -36 ${top - 50} Q 0 ${top - 100} 36 ${top - 50} L 42 ${top + 40} Z`} fill="#efe8dc" {...ol} /><path d={`M 0 ${top - 74} L 0 ${top + 36} M -38 ${top + 10} L 38 ${top + 10}`} stroke="#b08a2a" strokeWidth={8} /></g>;
        default: return null;
      }
    })();
    return (
      <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s * (L.broad || 1)} ${s}) rotate(${lean})`} opacity={opacity}>
        <ellipse cx={0} cy={4} rx={56 * body} ry={10 * body} fill="rgba(20,14,10,.28)" />
        {plumes}
        {arm(-1, armB, elbowB, holdB)}
        {L.outfit !== 'baby' && !skirt && <>{leg(-1, -sw)}{leg(1, sw)}</>}
        {skirt && [-1, 1].map((q) => <ellipse key={q} cx={q * 20 * body + 8} cy={-6} rx={22 * body} ry={9 * body} fill={L.barefoot ? L.skin : '#8a6a44'} {...ol} strokeWidth={5} />)}
        {cape}
        {torso}
        {collar}
        {L.paint && <path d={`M ${-tw + 6} ${shY + 30} Q 0 ${shY + 50} ${tw - 6} ${shY + 30}`} stroke={L.paint} strokeWidth={10} fill="none" opacity={.8} />}
        {arm(1, armF, elbowF, holdF)}
        <g transform={`translate(${turn * 4} ${headY}) rotate(${tilt}) scale(${headS}) scale(${L.snub ? 1.06 : 1})`}>
          {[-1, 1].map((q) => <g key={q}><ellipse cx={q * 62} cy={2} rx={10} ry={14} fill={L.skinS} {...ol} />{L.earspool && <circle cx={q * 64} cy={10} r={9} fill="#2f9a6a" stroke={P.ink} strokeWidth={4} />}</g>)}
          <path d={headPath} fill={L.skin} {...ol} />
          <path d="M 30 42 C 44 32 54 16 56 -4" fill="none" stroke={L.skinS} strokeWidth={9} strokeLinecap="round" opacity={.7} />
          {hair}
          {headwear}
          {L.beard === true && <path d={`M -48 16 C -40 70 40 70 48 16 C 40 42 20 46 ${fx} 46 C -20 46 -40 42 -48 16 Z`} fill={L.hair} {...ol} />}
          {L.beard === 'curly' && <g>{[[-50, 14, 15], [-46, 36, 16], [-30, 54, 17], [-8, 64, 18], [16, 62, 17], [36, 50, 16], [50, 30, 15], [54, 10, 13]].map(([cx, cy, r], k) => <circle key={k} cx={cx + fx * .3} cy={cy} r={r * (L.snub ? 1.2 : 1)} fill={L.hair} {...ol} strokeWidth={5} />)}
            <path d={`M ${fx - 34} 34 C ${fx - 20} 26 ${fx + 20} 26 ${fx + 34} 34 C ${fx + 30} 52 ${fx - 30} 52 ${fx - 34} 34 Z`} fill={L.hair} /></g>}
          {(L.beard === 'curly' || L.beard === true) && <ellipse cx={fx} cy={31} rx={17} ry={8.5} fill={L.skin} />}
          {L.beard === 'stubble' && <path d={`M -50 14 C -42 62 42 62 50 14 C 36 44 ${fx + 14} 50 ${fx} 50 C -20 50 -38 42 -50 14 Z`} fill={L.hair} opacity={.28} />}
          {[-1, 1].map(eye)}
          {L.snub ? <g><ellipse cx={fx + 2} cy={10} rx={17} ry={13} fill={L.skin} {...ol} strokeWidth={5} /><circle cx={fx - 5} cy={14} r={3} fill={P.ink} /><circle cx={fx + 9} cy={14} r={3} fill={P.ink} /></g>
            : L.nose === 'hook' ? <path d={`M ${fx} -8 Q ${fx + 22} 4 ${fx + 8} 20 L ${fx - 2} 16`} fill={L.skin} {...ol} strokeWidth={5} />
            : <path d={`M ${fx + 2} 2 Q ${fx + 9} 14 ${fx - 2} 16`} fill="none" stroke={L.skinS} strokeWidth={5} strokeLinecap="round" />}
          {L.stripe && <path d={`M ${fx - 40} 8 L ${fx + 40} 8`} stroke={P.ochreR} strokeWidth={9} strokeLinecap="round" opacity={.9} />}
          {L.paint && <path d={`M ${fx - 46} -26 L ${fx - 30} -26 M ${fx + 30} -26 L ${fx + 46} -26`} stroke={L.paint} strokeWidth={6} strokeLinecap="round" />}
          {L.wrinkles && [-1, 1].map((q) => <path key={q} d={`M ${fx + q * 34} 0 l ${q * 8} -4 M ${fx + q * 34} 6 l ${q * 9} 0`} stroke={L.skinS} strokeWidth={3} strokeLinecap="round" />)}
          <circle cx={fx - 30} cy={18} r={8} fill="#d86a4f" opacity={.25} /><circle cx={fx + 30} cy={18} r={8} fill="#d86a4f" opacity={.25} />
          {mouthEl}
        </g>
      </g>
    );
  };

/* baby on a cradleboard (head-shaping board) */
export const Cradle: React.FC<{ x: number; y: number; s?: number; T: number; rot?: number }> = ({ x, y, s = 1, T, rot = 0 }) => {
  const L = CAST.baby; const sleep = (T % 4) < 2.6;
  return <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-60} y={-120} width={120} height={250} rx={18} fill="#9a7650" stroke={P.ink} strokeWidth={7} />
    {[-80, -20, 40, 100].map((k) => <line key={k} x1={-56} y1={k} x2={56} y2={k} stroke="#7a5a3a" strokeWidth={5} />)}
    <path d="M -46 -20 L 46 -20 L 50 110 L -50 110 Z" fill="#efe4cc" stroke={P.ink} strokeWidth={6} />
    <path d="M -50 10 L 50 30 M -50 50 L 50 70" stroke="#b5432a" strokeWidth={7} />
    <circle cx={0} cy={-62} r={44} fill={L.skin} stroke={P.ink} strokeWidth={6} />
    <rect x={-50} y={-122} width={100} height={30} rx={8} fill="#c8a878" stroke={P.ink} strokeWidth={6} />
    <path d="M -54 -96 L 54 -96" stroke="#8a6a44" strokeWidth={5} />
    {sleep ? <path d="M -22 -60 q 7 6 14 0 M 8 -60 q 7 6 14 0" stroke={P.ink} strokeWidth={4} fill="none" strokeLinecap="round" /> : <><circle cx={-15} cy={-60} r={5} fill={P.ink} /><circle cx={15} cy={-60} r={5} fill={P.ink} /></>}
    <path d="M -8 -40 q 8 6 16 0" stroke={P.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M -30 -50 L 30 -50" stroke={P.ochreR} strokeWidth={6} strokeLinecap="round" opacity={.8} />
  </g>;
};
