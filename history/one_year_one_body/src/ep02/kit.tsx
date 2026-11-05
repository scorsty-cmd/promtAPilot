// Episode kit v4 (You Were There Ep 1): re-uses the v3 kit and adds saccades, rack focus, whip pans, low angles, weather.
import React from 'react';
import {random} from 'remotion';
import {HeadPose, Pose} from '../rig';
import {saccade, clamp01} from '../motion';
import {mkPose as mkPose3, ActOpts, Shot, iv, EOut, INK} from '../ep01/kit';
import TL from './timeline.json';
export {Defs, useFonts, Cam, camOf, Actor, Caption, FreezeLabel, Tag, BigWord, Stamp, Throb, Post, ls, le, speech, iv, EOut, EBack, INK, STAND, SIT, cl} from '../ep01/kit';
export type {Cut, SP, Shot, Line, ActOpts} from '../ep01/kit';

export const SHOTS = TL.shots as unknown as Shot[];
export const FLOOR = 905;
export const Y = (s: number) => FLOOR - 176 * s; // standing pelvis height for scale s

// v4 mkPose: automatic eye darts (saccades) unless the shot sets the gaze; listeners glance more, talkers less
export const mkPose = (f: number, o: ActOpts & {dart?: number}): Pose => {
  const seed = o.seed ?? 0;
  const h: Partial<HeadPose> = {...(o.head ?? {})};
  const amt = o.dart ?? 1;
  if (amt > 0 && (h.eyes === undefined || h.eyes === 'dot' || h.eyes === 'half')) {
    const [dx, dy] = saccade(f, seed + 3, amt);
    h.lookX = (h.lookX ?? 0) + dx;
    h.lookY = (h.lookY ?? 0) + dy;
  }
  return mkPose3(f, {...o, head: h});
};

// rack focus: blur a layer by amount (px). Animated between layers to shift attention.
export const Focus: React.FC<{blur: number; id: string; children: React.ReactNode}> = ({blur, id, children}) => {
  if (blur < 0.3) return <g>{children}</g>;
  const fid = `rf_${id}_${Math.round(blur * 4)}`;
  return (
    <g>
      <defs><filter id={fid} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={blur.toFixed(2)} /></filter></defs>
      <g filter={`url(#${fid})`}>{children}</g>
    </g>
  );
};
// rack value helper: from layer A sharp -> layer B sharp across frames [a, b]
export const rack = (lf: number, a: number, b: number, max = 10) => {
  const t = clamp01((lf - a) / Math.max(1, b - a));
  const e = t * t * (3 - 2 * t);
  return {fg: max * e, bg: max * (1 - e)};
};

// whip pan: horizontal motion-blur streak; dir +1 = content travels left. k 0..1 strength
export const Whip: React.FC<{k: number; dir?: number; children: React.ReactNode}> = ({k, dir = 1, children}) => {
  if (k <= 0.02) return <g>{children}</g>;
  const fid = `wp_${Math.round(k * 20)}`;
  return (
    <g>
      <defs><filter id={fid} x="-30%" y="-5%" width="160%" height="110%"><feGaussianBlur stdDeviation={`${(k * 60).toFixed(1)} 0`} /></filter></defs>
      <g transform={`translate(${-dir * k * 900} 0)`} filter={`url(#${fid})`}>{children}</g>
    </g>
  );
};

// rain sheets (two parallax layers) + optional lightning flash
export const Rain: React.FC<{f: number; amt?: number; wind?: number; light?: string}> = ({f, amt = 1, wind = 0.35, light = '#C8D6E4'}) => (
  <g opacity={amt} pointerEvents="none">
    {[0, 1].map((L) => (
      <g key={L} opacity={L ? 0.5 : 0.8}>
        {Array.from({length: L ? 90 : 60}, (_, i) => {
          const sp = L ? 34 : 52;
          const x0 = random(`rx${L}${i}`) * 2600 - 300, y0 = random(`ry${L}${i}`) * 1400;
          const y = ((y0 + f * sp) % 1400) - 200, x = x0 + (y + 200) * wind;
          const len = L ? 40 : 70;
          return <path key={i} d={`M${x} ${y} l${len * wind} ${len}`} stroke={light} strokeWidth={L ? 2 : 3.5} strokeLinecap="round" />;
        })}
      </g>
    ))}
  </g>
);
export const lightning = (f: number, at: number[]) => Math.max(0, ...at.map((a) => (f >= a && f < a + 14 ? [1, 0.3, 0.9, 0.5, 0.2, 0.1, 0.05][Math.min(6, Math.floor((f - a) / 2))] : 0)));

// sea spray burst
export const Spray: React.FC<{x: number; y: number; t: number; n?: number; s?: number}> = ({x, y, t, n = 18, s = 1}) => {
  if (t < 0 || t > 40) return null;
  return (
    <g opacity={1 - t / 40}>
      {Array.from({length: n}, (_, i) => {
        const a = -Math.PI / 2 + (random(`sa${i}`) - 0.5) * 1.6, v = (8 + random(`sv${i}`) * 14) * s;
        const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 0.55 * t * t;
        return <circle key={i} cx={px} cy={py} r={(5 + random(`sr${i}`) * 9) * s} fill="#E8F0F2" opacity={0.85} />;
      })}
    </g>
  );
};

// letterbox bars for dramatic shots
export const Bars: React.FC<{k: number}> = ({k}) => (k > 0 ? <g><rect width={1920} height={110 * k} fill="#050302" /><rect y={1080 - 110 * k} width={1920} height={110 * k} fill="#050302" /></g> : null);

// paper card with a title + body lines (what we know / unknown board)
export const Card: React.FC<{x: number; y: number; w: number; h: number; t: number; title: string; lines?: string[]; rot?: number; color?: string}> = ({x, y, w, h, t, title, lines = [], rot = 0, color = INK}) => {
  const a = iv(t, [0, 12], [0, 1], EOut);
  if (t < 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - a) * 60}) rotate(${rot})`} opacity={clamp01(a * 1.4)}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} fill="#0E0805" opacity={0.45} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#EFE3C6" stroke={INK} strokeWidth={5} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} filter="url(#brush)" fill="#EFE3C6" />
      <circle cx={0} cy={-h / 2 + 18} r={11} fill="#B3362B" stroke={INK} strokeWidth={3} />
      <text x={0} y={-h / 2 + 76} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={Math.min(56, (w * 1.6) / Math.max(6, title.length))} fill={color}>{title}</text>
      {lines.map((l, i) => <text key={i} x={0} y={-h / 2 + 130 + i * 46} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill="#3A2A1E">{l}</text>)}
    </g>
  );
};
