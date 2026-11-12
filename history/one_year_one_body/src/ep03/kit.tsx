// Episode kit v5 (You Were There Ep 2, Carrington Event 1859): re-uses v4 and adds
//  - real SEATED pose + Chair (behind) + DeskFront (in front) "behind mask" so desks overlap legs correctly
//  - crowd idle interactions (nudge, point up, whisper pairs, hand-to-mouth, clutch) — crowdAct()
//  - electric FX: Sparks burst, Arc (jagged lightning between two points), Smoke wisps
//  - Aurora curtains (animated, colour-shifting red -> green), StarField
//  - typewriter Morse ticker (dots/dashes travelling along a wire)
import React from 'react';
import {random} from 'remotion';
import {HeadPose} from '../rig';
import {clamp01} from '../motion';
import {mkPose, ActOpts, iv, EOut, INK, FLOOR} from '../ep02/kit';
import TL from './timeline.json';
export * from '../ep02/kit';
import type {Shot} from '../ep02/kit';

export const SHOTS = TL.shots as unknown as Shot[];

// ---------------- seated pose (backlog: real seated pose + chair helper + behind mask) ----------------
// pelvis sits ON the seat: thighs forward, shins down to the floor. seatY(s, floor) = pelvis y for a chair whose feet are on `floor`.
export const seatY = (s: number, floor = FLOOR) => floor - (88 + 22) * s;
export const SEAT = {legF: [1.5, 1.45] as [number, number], legB: [1.38, 1.3] as [number, number]};
// seated actor options: typing/working at a desk with both hands on the desk top at height dy (relative to pelvis)
export const sitOpts = (o: ActOpts & {dart?: number}): ActOpts & {dart?: number} => ({legF: SEAT.legF, legB: SEAT.legB, ...o});
// chair drawn BEFORE the actor (back + seat); x,y = pelvis position in world; flip = chair faces -x
export const Chair: React.FC<{x: number; y: number; s?: number; flip?: boolean; c?: string}> = ({x, y, s = 1, flip, c = '#5A3D27'}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <rect x={-62} y={-150} width={16} height={262} rx={4} fill={c} />
    <rect x={-60} y={-150} width={40} height={18} rx={4} fill={c} />
    <rect x={-60} y={-104} width={30} height={12} rx={4} fill={c} />
    <rect x={-64} y={6} width={130} height={18} rx={5} fill={c} />
    <rect x={50} y={20} width={13} height={92} fill={c} />
    <rect x={-58} y={20} width={13} height={92} fill={c} opacity={0.9} />
  </g>
);
// desk front panel drawn AFTER the actor (hides legs / lap) — x0..x1, top y, floor
export const DeskFront: React.FC<{x0: number; x1: number; y: number; floor?: number; c?: string; drawers?: boolean}> = ({x0, x1, y, floor = FLOOR, c = '#4A3220', drawers = true}) => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={x0} y={y} width={x1 - x0} height={34} fill="#6A4A30" />
    <rect x={x0 + 16} y={y + 34} width={x1 - x0 - 32} height={floor - y - 34} fill={c} />
    {drawers && [0, 1, 2].map((i) => <g key={i}><rect x={x0 + 40} y={y + 60 + i * 66} width={(x1 - x0) * 0.28} height={52} fill="#563A26" strokeWidth={4} /><circle cx={x0 + 40 + (x1 - x0) * 0.14} cy={y + 86 + i * 66} r={6} fill="#C9A35A" strokeWidth={2} /></g>)}
    <rect x={x0 + 16} y={y + 34} width={x1 - x0 - 32} height={floor - y - 34} fill="#000" opacity={0.18} stroke="none" />
  </g>
);

// ---------------- crowd idle interactions (backlog) ----------------
// returns pose options for an extra: kinds cycle per seed; partner offset lets two extras face each other
export type CrowdKind = 'point' | 'nudge' | 'whisper' | 'mouth' | 'clutch' | 'pray' | 'shade';
export const CROWD_KINDS: CrowdKind[] = ['point', 'nudge', 'whisper', 'mouth', 'clutch', 'pray', 'shade'];
export const crowdAct = (f: number, seed: number, kind?: CrowdKind): ActOpts & {dart?: number} => {
  const k = kind ?? CROWD_KINDS[seed % CROWD_KINDS.length];
  const ph = f * (0.05 + (seed % 5) * 0.008) + seed;
  const up: Partial<HeadPose> = {lookY: -1, lookX: 0.3, browHeight: 0.9, browInner: 0.4, mouth: 'O', open: 0.35 + 0.15 * Math.sin(ph * 2), eyes: 'dot'};
  const cyc = (Math.sin(ph) + 1) / 2;
  switch (k) {
    case 'point': return {hF: [110 + cyc * 20, -270 + cyc * 20], hB: [30, 0], lean: -6, head: {...up, turn: 0.7}, seed, dart: 0};
    case 'nudge': { const n = Math.max(0, Math.sin(ph * 1.6)); return {hF: [60 + n * 50, -70], hB: [30, 0], lean: n * 8, bob: -n * 3, head: {...up, turn: n > 0.5 ? 0.9 : 0.5, lookY: n > 0.5 ? 0 : -1, mouth: n > 0.5 ? 'talk' : 'O', open: n > 0.5 ? 0.4 * Math.abs(Math.sin(f * 0.6)) : 0.3}, seed}; }
    case 'whisper': return {hF: [70, -150], hB: [30, 0], lean: 12 + cyc * 4, head: {turn: 0.9, mouth: 'talk', open: 0.3 * Math.abs(Math.sin(f * 0.55 + seed)), browInner: 0.6, lookX: 0.8, tilt: 6}, seed};
    case 'mouth': return {hF: [40, -220], hB: [40, -120], lean: -4, head: {...up, mouth: 'line', open: 0, eyes: 'fear', eyePop: 0.2, turn: 0.4}, seed, dart: 0};
    case 'clutch': return {hF: [30, -110], hB: [50, -120], lean: -2, head: {...up, browInner: 0.9, turn: 0.5}, seed};
    case 'pray': return {hF: [64, -160 + Math.sin(f * 0.2) * 4], hB: [60, -156], lean: 8, head: {turn: 0.5, eyes: 'squeeze', mouth: 'talk', open: 0.25 * Math.abs(Math.sin(f * 0.5 + seed)), browInner: 0.9, lookY: 0.4}, seed};
    case 'shade': return {hF: [80, -250], hB: [30, 0], lean: -3, head: {...up, eyes: 'half', turn: 0.6}, seed, dart: 0};
  }
  return {seed};
};

// ---------------- electric FX ----------------
export const Sparks: React.FC<{x: number; y: number; t: number; n?: number; s?: number; color?: string; seed?: string}> = ({x, y, t, n = 22, s = 1, color = '#BFE8FF', seed = 'k'}) => {
  if (t < 0 || t > 26) return null;
  return (
    <g opacity={1 - t / 26} filter="url(#glowS)">
      {Array.from({length: n}, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2, v = (6 + random(`${seed}v${i}`) * 16) * s;
        const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 0.5 * t * t;
        const qx = px - Math.cos(a) * v * 1.6, qy = py - Math.sin(a) * v * 1.6 - t;
        return <path key={i} d={`M${qx} ${qy} L${px} ${py}`} stroke={i % 3 ? color : '#FFF6C8'} strokeWidth={(3 + random(`${seed}w${i}`) * 3) * s} strokeLinecap="round" />;
      })}
      <circle cx={x} cy={y} r={30 * s * (1 - t / 26)} fill="#FFFFFF" />
    </g>
  );
};
// jagged arc between two points, re-randomised every 2 frames
export const Arc: React.FC<{x1: number; y1: number; x2: number; y2: number; f: number; w?: number; on?: number; color?: string}> = ({x1, y1, x2, y2, f, w = 6, on = 1, color = '#CFEFFF'}) => {
  if (on <= 0) return null;
  const k = Math.floor(f / 2);
  const N = 10;
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const pts = Array.from({length: N + 1}, (_, i) => {
    const t = i / N, j = i === 0 || i === N ? 0 : (random(`arc${k}_${i}`) - 0.5) * L * 0.22;
    return `${(x1 + dx * t + nx * j).toFixed(1)} ${(y1 + dy * t + ny * j).toFixed(1)}`;
  });
  const d = `M${pts.join(' L')}`;
  return (
    <g opacity={on}>
      <path d={d} stroke={color} strokeWidth={w * 4} fill="none" opacity={0.35} filter="url(#glowS)" strokeLinejoin="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};
export const Smoke: React.FC<{x: number; y: number; f: number; amt?: number; n?: number; s?: number}> = ({x, y, f, amt = 1, n = 6, s = 1}) => (
  <g opacity={amt * 0.6}>
    {Array.from({length: n}, (_, i) => {
      const ph = ((f * 0.9 + i * (60 / n)) % 60) / 60;
      return <circle key={i} cx={x + Math.sin(ph * 6 + i) * 18 * s + ph * 30 * s} cy={y - ph * 220 * s} r={(10 + ph * 46) * s} fill="#9A948C" opacity={(1 - ph) * 0.7} />;
    })}
  </g>
);

// ---------------- aurora + stars ----------------
// mode: 0 = all red, 1 = all green (blend between); amt = brightness; y0 = lower edge of curtains
export const Aurora: React.FC<{f: number; amt?: number; green?: number; y0?: number; x0?: number; x1?: number; spires?: number}> = ({f, amt = 1, green = 0.5, y0 = 640, x0 = -400, x1 = 2400, spires = 1}) => {
  const id = `aur${Math.round(green * 10)}`;
  const red = '#E0303A', grn = '#4CF0A0';
  const bands = 7;
  return (
    <g opacity={amt}>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={red} stopOpacity={0} />
          <stop offset="0.25" stopColor={red} stopOpacity={0.55} />
          <stop offset="0.65" stopColor={green > 0.15 ? grn : red} stopOpacity={0.35 + 0.45 * green} />
          <stop offset="1" stopColor={green > 0.15 ? grn : red} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A1020" stopOpacity={0} /><stop offset="0.6" stopColor="#C82838" stopOpacity={0.5 * (1 - green * 0.5)} /><stop offset="1" stopColor="#E85A3A" stopOpacity={0.7 * (1 - green * 0.6)} />
        </linearGradient>
      </defs>
      {/* red sky wash */}
      <rect x={x0} y={-400} width={x1 - x0} height={y0 + 500} fill={`url(#${id}w)`} />
      <g filter="url(#glow)">
        {Array.from({length: bands}, (_, b) => {
          const yTop = -200 + b * 40, yBot = y0 - 80 + Math.sin(f * 0.02 + b) * 40;
          let d = `M${x0} ${yBot}`;
          const step = 120;
          for (let x = x0; x <= x1; x += step) d += ` L${x} ${(yBot + Math.sin(x * 0.004 + f * 0.03 + b * 1.7) * 60 + Math.sin(x * 0.011 - f * 0.05 + b) * 25).toFixed(0)}`;
          for (let x = x1; x >= x0; x -= step) d += ` L${x} ${(yTop + Math.sin(x * 0.003 - f * 0.02 + b) * 90).toFixed(0)}`;
          return <path key={b} d={d + 'Z'} fill={`url(#${id}c)`} opacity={0.35 + 0.25 * Math.sin(f * 0.04 + b * 2.1)} />;
        })}
      </g>
      {/* vertical rays (spires) */}
      {spires > 0 && <g opacity={spires * (0.5 + 0.3 * Math.sin(f * 0.07))}>
        {Array.from({length: 46}, (_, i) => {
          const x = x0 + (i / 46) * (x1 - x0) + Math.sin(f * 0.02 + i) * 30;
          const h = 260 + random(`sp${i}`) * 380 + Math.sin(f * 0.09 + i * 1.3) * 80;
          const w = 10 + random(`spw${i}`) * 26;
          const top = y0 - 60 - h;
          return <rect key={i} x={x} y={top} width={w} height={h} fill={`url(#${id}c)`} opacity={0.25 + 0.5 * Math.max(0, Math.sin(f * 0.13 + i * 2.7))} />;
        })}
      </g>}
    </g>
  );
};
export const StarField: React.FC<{f: number; n?: number; h?: number; amt?: number}> = ({f, n = 120, h = 700, amt = 1}) => (
  <g opacity={amt}>
    {Array.from({length: n}, (_, i) => <circle key={i} cx={random(`stx${i}`) * 2400 - 240} cy={random(`sty${i}`) * h - 100} r={0.8 + random(`str${i}`) * 2.2} fill="#F4F0E0" opacity={0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + i))} />)}
  </g>
);

// Morse pulses travelling along a polyline (dots/dashes). pts = [[x,y]...], t = frames, code e.g. '.-.. --- -.-.'
export const Pulses: React.FC<{pts: [number, number][]; t: number; code?: string; speed?: number; color?: string; s?: number}> = ({pts, t, code = '.... . .-.. .-.. ---', speed = 9, color = '#FFD27A', s = 1}) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = seg.reduce((a, b) => a + b, 0);
  const at = (d: number): [number, number] => {
    let r = d;
    for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const k = r / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } r -= seg[i]; }
    return pts[pts.length - 1];
  };
  const marks: React.ReactNode[] = [];
  let off = 0;
  code.split('').forEach((c, i) => {
    const d = t * speed - off;
    if (c === ' ') { off += 30; return; }
    if (d > 0 && d < tot) {
      const [x, y] = at(d);
      marks.push(c === '-' ? <rect key={i} x={x - 14 * s} y={y - 6 * s} width={28 * s} height={12 * s} rx={6 * s} fill={color} /> : <circle key={i} cx={x} cy={y} r={7 * s} fill={color} />);
    }
    off += c === '-' ? 44 : 26;
  });
  return <g filter="url(#glowS)">{marks}</g>;
};

// ripple of light across a sky for the hook (red glow intensity over time)
export const glowRamp = (f: number, a: number, b: number) => clamp01((f - a) / Math.max(1, b - a));
export {mkPose, iv, EOut, INK, FLOOR};
