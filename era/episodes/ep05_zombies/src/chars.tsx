import React from 'react';
import { clamp, lerp } from './lib';
import { P } from './art';

/* ===== Zombie Apocalypse Cast — v5 rig: Post-apocalyptic survivor gear, lab coats,
   tactical vests, survivor props, expression system & atmospheric depth ===== */
export type Mouth = 'smile' | 'grin' | 'O' | 'flat' | 'sad' | 'talk' | 'shout' | 'smirk';
export type Expr = 'neutral' | 'happy' | 'laugh' | 'surprised' | 'angry' | 'worried' | 'thinking' | 'sad' | 'excited' | 'tense';
export type MLook = {
  skin: string; skinS: string; hair: string;
  hairStyle: 'wild' | 'wildYoung' | 'parted' | 'slick' | 'bun' | 'bald' | 'short' | 'curly' | 'bob';
  outfit: 'survivor' | 'tactical' | 'labcoat' | 'jacket' | 'hoodie' | 'infected';
  cloth: string; cloth2: string; shirt?: string; vest?: string;
  moustache?: 'bushy' | 'thin' | 'walrus' | 'brush'; beard?: 'goatee' | 'full' | 'stubble'; glasses?: 'round' | 'tactical';
  hat?: 'cap' | 'beanie' | 'hood' | 'none'; wrinkles?: boolean; eyeS?: number; broad?: number; nose?: 'big' | 'small'; tall?: number;
  faceMark?: 'ochre' | 'none'; // Mascot ochre stripe for "YOU"
};

const SK = {
  a: ['#ecc9a4', '#cfa682'],
  b: ['#e2b48a', '#c4936a'],
  c: ['#d9a578', '#b8845a'],
  d: ['#f0d2b2', '#d4b08e'],
  e: ['#c99468', '#a8744c'],
  z: ['#7d8c7c', '#5e6b5d'], // infected greyish skin
};

const G = (o: Partial<MLook>): MLook => ({
  skin: SK.a[0], skinS: SK.a[1], hair: '#2a1a10', hairStyle: 'short', outfit: 'survivor',
  cloth: '#3a4045', cloth2: '#252a2e', shirt: '#d4cfc7', ...o
});

export const CAST: Record<string, MLook> = {
  // Hero: "YOU" - Signature ochre stripe across cheeks & nose
  you: G({
    skin: SK.c[0], skinS: SK.c[1], hair: '#c8903a', hairStyle: 'parted', outfit: 'hoodie',
    cloth: '#2d3748', cloth2: '#1a202c', shirt: '#b5432a', vest: '#4a5568', faceMark: 'ochre'
  }),
  // Dr. Sarah Chen: Lead Epidemiologist
  sarah: G({
    skin: SK.b[0], skinS: SK.b[1], hair: '#120f0d', hairStyle: 'bun', outfit: 'labcoat',
    cloth: '#4a5568', cloth2: '#2d3748', shirt: '#2c7a7b', glasses: 'round', broad: 0.95
  }),
  // Marcus: Survival & Combat Specialist
  marcus: G({
    skin: SK.d[0], skinS: SK.d[1], hair: '#4a3828', hairStyle: 'short', outfit: 'tactical',
    cloth: '#2f3e2e', cloth2: '#1f2a1e', vest: '#4a3f35', beard: 'stubble', broad: 1.15, tall: 1.05
  }),
  // Dr. Kahn: Veteran Biochemist
  kahn: G({
    skin: SK.a[0], skinS: SK.a[1], hair: '#e2e8f0', hairStyle: 'wild', outfit: 'jacket',
    cloth: '#3b3a36', cloth2: '#282724', shirt: '#718096', moustache: 'brush', glasses: 'round', wrinkles: true
  }),
  // Shadow infected silhouette
  stalker: G({
    skin: SK.z[0], skinS: SK.z[1], hair: '#1a1a1a', hairStyle: 'wild', outfit: 'infected',
    cloth: '#1a1d20', cloth2: '#0d0f12', eyeS: 1.2
  }),
};

export type Prop = 'none' | 'radio' | 'flashlight' | 'can' | 'map' | 'water' | 'seed' | 'wrench' | 'binoculars' | 'filter';
export type MPose = {
  walk?: number; phase?: number; armF?: number; armB?: number; elbowF?: number; elbowB?: number; tilt?: number; turn?: number; blink?: number;
  mouth?: Mouth; open?: number; brow?: number; lookX?: number; lookY?: number; bob?: number; crouch?: number;
  holdF?: Prop; holdB?: Prop; lean?: number; sit?: number; expr?: Expr; lie?: number;
};

const OL = 7;
const HAND = 'M -10 -4 C -13 7 -10 17 -1 19 C 8 20 12 12 11 1 C 10 -5 4 -7 -2 -7 Z';
const THUMB = 'M 7 -1 C 16 -3 19 6 11 10';

const EX: Record<Expr, { raise: number; tilt: number; lid: number; wide: number; mouth: Mouth; laugh?: boolean }> = {
  neutral: { raise: 0, tilt: 0, lid: 0, wide: 1, mouth: 'flat' },
  happy: { raise: 0.6, tilt: -0.2, lid: 0.2, wide: 1, mouth: 'smile' },
  laugh: { raise: 1, tilt: -0.3, lid: 0, wide: 1, mouth: 'grin', laugh: true },
  surprised: { raise: 1.2, tilt: 0, lid: 0, wide: 1.35, mouth: 'O' },
  angry: { raise: -0.4, tilt: 0.8, lid: 0.1, wide: 0.95, mouth: 'shout' },
  worried: { raise: 0.7, tilt: -0.7, lid: 0.05, wide: 1.15, mouth: 'sad' },
  thinking: { raise: 0.2, tilt: 0.3, lid: 0.25, wide: 0.9, mouth: 'flat' },
  sad: { raise: 0.4, tilt: -0.6, lid: 0.3, wide: 0.9, mouth: 'sad' },
  excited: { raise: 0.8, tilt: -0.1, lid: 0, wide: 1.25, mouth: 'smile' },
  tense: { raise: 0.5, tilt: -0.5, lid: 0, wide: 1.2, mouth: 'flat' },
};

/* Survivor Props */
const drawProp = (p: Prop) => {
  if (p === 'radio') {
    return (
      <g>
        <rect x={-8} y={-24} width={16} height={28} rx={3} fill="#1a202c" stroke={P.ink} strokeWidth={4} />
        <line x1={4} y1={-24} x2={6} y2={-42} stroke={P.ink} strokeWidth={4} strokeLinecap="round" />
        <circle cx={0} cy={-12} r={4} fill="#e2e8f0" />
        <rect x={-5} y={-4} width={10} height={4} fill="#48bb78" />
      </g>
    );
  }
  if (p === 'flashlight') {
    return (
      <g>
        <rect x={-6} y={-20} width={12} height={26} rx={2} fill="#4a5568" stroke={P.ink} strokeWidth={4} />
        <polygon points="-9,-20 9,-20 6,-14 -6,-14" fill="#cbd5e0" stroke={P.ink} strokeWidth={4} />
        <polygon points="-8,-20 8,-20 40,-70 -40,-70" fill="rgba(254, 235, 129, 0.35)" />
      </g>
    );
  }
  if (p === 'can') {
    return (
      <g>
        <cylinder />
        <rect x={-9} y={-16} width={18} height={24} rx={2} fill="#a0aec0" stroke={P.ink} strokeWidth={4} />
        <rect x={-9} y={-10} width={18} height={12} fill="#e53e3e" />
        <line x1={-7} y1={-4} x2={7} y2={-4} stroke="#fff" strokeWidth={2} />
      </g>
    );
  }
  if (p === 'map') {
    return (
      <g transform="rotate(-15)">
        <polygon points="-16,-22 18,-26 22,12 -12,16" fill="#fefcbf" stroke={P.ink} strokeWidth={4} />
        <line x1={-6} y1={-18} x2={6} y2={-10} stroke="#e53e3e" strokeWidth={3} strokeDasharray="3 3" />
        <circle cx={6} cy={-10} r={3} fill="#e53e3e" />
      </g>
    );
  }
  if (p === 'water') {
    return (
      <g>
        <rect x={-8} y={-22} width={16} height={26} rx={4} fill="#bee3f8" stroke={P.ink} strokeWidth={4} />
        <rect x={-4} y={-26} width={8} height={5} fill="#3182ce" stroke={P.ink} strokeWidth={3} />
      </g>
    );
  }
  if (p === 'seed') {
    return (
      <g>
        <path d="M -10 -15 C -12 2 -8 10 0 10 C 8 10 12 2 10 -15 Z" fill="#b7791f" stroke={P.ink} strokeWidth={4} />
        <line x1={-10} y1={-14} x2={10} y2={-14} stroke="#eed" strokeWidth={3} />
      </g>
    );
  }
  return null;
};

export const MChar: React.FC<{
  look: MLook; x: number; y: number; s?: number; pose?: MPose; talkOpen?: number;
}> = ({ look, x, y, s = 1, pose = {}, talkOpen = 0 }) => {
  const ex = EX[pose.expr || 'neutral'];
  const w = pose.walk || 0;
  const ph = pose.phase || 0;
  const armF = pose.armF ?? Math.sin(ph) * 0.4 * w;
  const armB = pose.armB ?? -Math.sin(ph) * 0.4 * w;
  const legF = Math.sin(ph) * 0.5 * w;
  const legB = -Math.sin(ph) * 0.5 * w;
  const bob = Math.abs(Math.sin(ph * 2)) * 6 * w;
  const open = Math.max(talkOpen, pose.open || 0);

  return (
    <g transform={`translate(${x} ${y - bob}) scale(${s * (look.tall || 1)} ${s * (look.tall || 1)})`}>
      {/* Back arm */}
      <g transform={`translate(-28 -80) rotate(${armB * 45})`}>
        <line x1={0} y1={0} x2={-10} y2={45} stroke={look.cloth2} strokeWidth={24} strokeLinecap="round" />
        <line x1={0} y1={0} x2={-10} y2={45} stroke={P.ink} strokeWidth={OL} strokeLinecap="round" />
        {pose.holdB && <g transform="translate(-10 45)">{drawProp(pose.holdB)}</g>}
      </g>

      {/* Back leg */}
      <g transform={`translate(-18 0) rotate(${legB * 40})`}>
        <line x1={0} y1={0} x2={0} y2={85} stroke={look.cloth2} strokeWidth={24} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={85} stroke={P.ink} strokeWidth={OL} strokeLinecap="round" />
        {/* Boot */}
        <polygon points="-8,75 14,75 16,92 -8,92" fill="#1a202c" stroke={P.ink} strokeWidth={OL} />
      </g>

      {/* Front leg */}
      <g transform={`translate(18 0) rotate(${legF * 40})`}>
        <line x1={0} y1={0} x2={0} y2={85} stroke={look.cloth} strokeWidth={24} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={85} stroke={P.ink} strokeWidth={OL} strokeLinecap="round" />
        {/* Boot */}
        <polygon points="-8,75 16,75 18,92 -8,92" fill="#1a202c" stroke={P.ink} strokeWidth={OL} />
      </g>

      {/* Body / Torso */}
      <g transform="translate(0 -50)">
        <ellipse cx={0} cy={-25} rx={36 * (look.broad || 1)} ry={48} fill={look.cloth} stroke={P.ink} strokeWidth={OL} />
        {look.shirt && (
          <path d="M -12 -65 L 0 -35 L 12 -65 Z" fill={look.shirt} stroke={P.ink} strokeWidth={5} />
        )}
        {look.vest && (
          <path d="M -30 -60 C -15 -20 -15 10 -25 15 L 25 15 C 15 10 15 -20 30 -60 Z" fill={look.vest} stroke={P.ink} strokeWidth={OL} />
        )}
      </g>

      {/* Head */}
      <g transform="translate(0 -160)">
        {/* Neck */}
        <rect x={-14} y={30} width={28} height={25} fill={look.skin} stroke={P.ink} strokeWidth={OL} />
        {/* Head shape */}
        <circle cx={0} cy={0} r={58} fill={look.skin} stroke={P.ink} strokeWidth={OL} />

        {/* Mascot Ochre Mark (for YOU) */}
        {look.faceMark === 'ochre' && (
          <path d="M -45 5 Q 0 12 45 5 Q 0 -2 -45 5 Z" fill="#b5432a" opacity={0.88} />
        )}

        {/* Cheeks */}
        <circle cx={-32} cy={14} r={10} fill="#f56565" opacity={0.35} />
        <circle cx={32} cy={14} r={10} fill="#f56565" opacity={0.35} />

        {/* Eyes */}
        <g transform={`translate(${pose.lookX || 0} ${pose.lookY || 0})`}>
          <circle cx={-20} cy={-4} r={12 * ex.wide} fill="#ffffff" stroke={P.ink} strokeWidth={5} />
          <circle cx={20} cy={-4} r={12 * ex.wide} fill="#ffffff" stroke={P.ink} strokeWidth={5} />
          <circle cx={-18} cy={-4} r={6} fill={look.outfit === 'infected' ? '#e53e3e' : P.ink} />
          <circle cx={22} cy={-4} r={6} fill={look.outfit === 'infected' ? '#e53e3e' : P.ink} />
          {/* Highlight */}
          <circle cx={-20} cy={-6} r={2.5} fill="#ffffff" />
          <circle cx={20} cy={-6} r={2.5} fill="#ffffff" />
        </g>

        {/* Eyebrows */}
        <g transform={`translate(0 ${-ex.raise * 10})`}>
          <line x1={-32} y1={-20 + ex.tilt * 10} x2={-10} y2={-20 - ex.tilt * 8} stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={10} y1={-20 - ex.tilt * 8} x2={32} y2={-20 + ex.tilt * 10} stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
        </g>

        {/* Glasses */}
        {look.glasses === 'round' && (
          <g>
            <circle cx={-20} cy={-4} r={18} fill="none" stroke="#2d3748" strokeWidth={5} />
            <circle cx={20} cy={-4} r={18} fill="none" stroke="#2d3748" strokeWidth={5} />
            <line x1={-2} y1={-4} x2={2} y2={-4} stroke="#2d3748" strokeWidth={5} />
          </g>
        )}

        {/* Nose */}
        <path d="M 0 -8 L 4 6 L -2 7" fill="none" stroke={P.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Mouth */}
        {open > 0.15 ? (
          <ellipse cx={0} cy={26} rx={14} ry={12 * open} fill="#742a2a" stroke={P.ink} strokeWidth={5} />
        ) : (
          <path d="M -12 26 Q 0 30 12 26" fill="none" stroke={P.ink} strokeWidth={5} strokeLinecap="round" />
        )}

        {/* Hair */}
        {look.hairStyle === 'parted' && (
          <path d="M -54 -20 C -56 -68 -20 -78 0 -72 C 28 -78 56 -64 54 -20 C 44 -50 15 -55 0 -45 C -20 -55 -42 -48 -54 -20 Z" fill={look.hair} stroke={P.ink} strokeWidth={OL} />
        )}
        {look.hairStyle === 'bun' && (
          <g>
            <path d="M -52 -15 C -54 -60 -10 -74 0 -70 C 20 -74 54 -55 52 -15 Z" fill={look.hair} stroke={P.ink} strokeWidth={OL} />
            <circle cx={0} cy={-75} r={22} fill={look.hair} stroke={P.ink} strokeWidth={OL} />
          </g>
        )}
        {look.hairStyle === 'wild' && (
          <path d="M -60 -10 C -70 -70 0 -90 60 -10 C 45 -40 30 -60 0 -50 C -30 -60 -45 -40 -60 -10 Z" fill={look.hair} stroke={P.ink} strokeWidth={OL} />
        )}
        {look.hairStyle === 'short' && (
          <path d="M -52 -10 C -54 -55 0 -68 52 -10 C 40 -35 20 -48 0 -45 C -20 -48 -40 -35 -52 -10 Z" fill={look.hair} stroke={P.ink} strokeWidth={OL} />
        )}

        {/* Beard / Stubble */}
        {look.beard === 'stubble' && (
          <path d="M -25 25 Q 0 45 25 25" fill="none" stroke="#4a5568" strokeWidth={4} strokeDasharray="2 4" />
        )}
      </g>

      {/* Front arm */}
      <g transform={`translate(28 -80) rotate(${armF * 45})`}>
        <line x1={0} y1={0} x2={10} y2={45} stroke={look.cloth} strokeWidth={24} strokeLinecap="round" />
        <line x1={0} y1={0} x2={10} y2={45} stroke={P.ink} strokeWidth={OL} strokeLinecap="round" />
        {/* Hand */}
        <circle cx={10} cy={50} r={10} fill={look.skin} stroke={P.ink} strokeWidth={OL} />
        {pose.holdF && <g transform="translate(10 50)">{drawProp(pose.holdF)}</g>}
      </g>
    </g>
  );
};
