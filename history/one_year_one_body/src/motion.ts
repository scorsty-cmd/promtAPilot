// History Sourced motion library v1 (kit v3): reusable body actions for the puppet rig.
// Every function returns a partial Pose (legs, bob, lean, hands offsets) for a phase or time since the action began.
import {Pose} from './rig';

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// damped spring 0 -> 1 with overshoot, starting at frame s
export const spring = (f: number, s: number, k = 0.28, d = 0.16) => {
  if (f < s) return 0;
  const t = f - s;
  return 1 - Math.exp(-d * t) * Math.cos(k * t);
};
// blink pulse at a list of frames, plus automatic blinks every 2-4 s
export const blinkAuto = (f: number, seed = 0) => {
  const period = 70 + (seed % 5) * 9;
  const ph = (f + seed * 17) % period;
  return ph < 3 ? [0.5, 1, 0.5][ph] : 0;
};
export const blinkAt = (f: number, list: number[]) => Math.max(0, ...list.map((b) => Math.max(0, 1 - Math.abs(f - b) / 3)));

type Legs = Pick<Pose, 'legF' | 'legB' | 'bob' | 'lean'> & {swing: number};

// walk: ph in cycles (1 = full stride pair). amt 0..1 blends from standing.
export const walk = (ph: number, amt = 1): Legs => {
  const a = ph * Math.PI * 2;
  const hipF = 0.42 * Math.sin(a) * amt, hipB = -0.42 * Math.sin(a) * amt;
  const kF = (0.55 * Math.max(0, Math.sin(a + 1.3)) + 0.06) * amt, kB = (0.55 * Math.max(0, Math.sin(a + 1.3 + Math.PI)) + 0.06) * amt;
  return {legF: [hipF, kF], legB: [hipB, kB], bob: -Math.abs(Math.cos(a)) * 7 * amt + 3 * amt, lean: 4 * amt, swing: Math.sin(a) * amt};
};
// tiptoe: short high-knee steps, leaning back, rising bob
export const tiptoe = (ph: number, amt = 1): Legs => {
  const a = ph * Math.PI * 2;
  return {
    legF: [0.28 * Math.sin(a) * amt + 0.1 * amt, (0.9 * Math.max(0, Math.sin(a + 1)) + 0.2) * amt],
    legB: [-0.28 * Math.sin(a) * amt + 0.1 * amt, (0.9 * Math.max(0, Math.sin(a + 1 + Math.PI)) + 0.2) * amt],
    bob: (-8 - Math.abs(Math.sin(a)) * 10) * amt, lean: -6 * amt, swing: Math.sin(a) * 0.4 * amt,
  };
};
// run
export const run = (ph: number, amt = 1): Legs => {
  const a = ph * Math.PI * 2;
  return {
    legF: [0.75 * Math.sin(a) * amt, (1.1 * Math.max(0, Math.sin(a + 1.4)) + 0.2) * amt],
    legB: [-0.75 * Math.sin(a) * amt, (1.1 * Math.max(0, Math.sin(a + 1.4 + Math.PI)) + 0.2) * amt],
    bob: -Math.abs(Math.cos(a)) * 14 * amt + 4, lean: 14 * amt, swing: Math.sin(a) * 1.4 * amt,
  };
};
// stagger (dizzy / carrying something heavy): uneven steps and a sway
export const stagger = (f: number, amt = 1) => ({sway: Math.sin(f * 0.11) * 9 * amt + Math.sin(f * 0.37) * 3 * amt, tilt: Math.sin(f * 0.13) * 8 * amt});
// flinch: t = frames since the jolt. Quick recoil, overshoot, settle.
export const flinch = (t: number) => {
  if (t < 0) return {lean: 0, bob: 0, squash: 0, tilt: 0, shake: 0, on: 0};
  const e = Math.exp(-t / 9);
  return {lean: -14 * e * Math.cos(t * 0.35), bob: -16 * e, squash: -0.06 * e, tilt: -10 * e * Math.cos(t * 0.3), shake: 6 * e * Math.sin(t * 2.7), on: e};
};
// shiver: fast small jitter (cold / fever)
export const shiver = (f: number, amt = 1) => ({x: Math.sin(f * 2.9) * 2.6 * amt + Math.sin(f * 4.7) * 1.2 * amt, tilt: Math.sin(f * 3.3) * 1.6 * amt});
// sit-down / collapse into chair: legs go from standing (0) to seated (1); collapse adds a drop and bounce
export const sitLegs = (t: number): Pick<Pose, 'legF' | 'legB'> => ({legF: [1.42 * t, 1.42 * t], legB: [1.3 * t, 1.3 * t]});
export const collapse = (t: number) => {
  // t frames since start; 0..10 drop, then bounce
  const s = ease(t / 10);
  const bounce = t > 10 ? Math.exp(-(t - 10) / 6) * Math.sin((t - 10) * 0.6) * 10 : 0;
  return {sit: s, drop: -bounce, squash: t > 10 ? 0.07 * Math.exp(-(t - 10) / 5) : 0};
};
// breathing + idle sway so nobody is ever fully still
export const idle = (f: number, seed = 0, amt = 1) => ({bob: Math.sin(f * 0.1 + seed) * 1.6 * amt, tilt: Math.sin(f * 0.045 + seed * 2) * 2.2 * amt, sway: Math.sin(f * 0.07 + seed) * 0.8 * amt});
// talk gesture: hand bobbing in rhythm with the voice amplitude
export const gesture = (f: number, open: number, seed = 0): [number, number] => [Math.sin(f * 0.18 + seed) * 10 * (0.3 + open), -Math.abs(Math.sin(f * 0.23 + seed)) * 18 * (0.3 + open)];
// kneading: two hands pushing down/forward in a loop
export const knead = (f: number, speed = 0.22): {hF: [number, number]; hB: [number, number]; bob: number; lean: number} => {
  const a = f * speed;
  return {hF: [92 + Math.sin(a) * 18, -40 + Math.max(0, Math.cos(a)) * 22], hB: [82 + Math.sin(a + 0.6) * 18, -36 + Math.max(0, Math.cos(a + 0.6)) * 22], bob: Math.max(0, Math.cos(a)) * 3, lean: 10 + Math.sin(a) * 4};
};
