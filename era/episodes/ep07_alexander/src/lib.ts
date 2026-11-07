import tl from './timeline.json';
export const FPS = 30;
export const W = 1080, H = 1920;
export const TOTAL = Math.ceil((tl.voice_end + 8) * FPS);
export const line = (k: string) => tl.lines.find((l) => l.key === k)!;
export const LINES = tl.lines;

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
// damped spring 0 -> 1 with overshoot
export const spring = (t: number, k = 9, z = 0.45) => t <= 0 ? 0 : 1 - Math.exp(-z * k * t) * Math.cos(k * Math.sqrt(1 - z * z) * t);
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// smooth value noise 1D
export const noise1 = (x: number, seed = 1) => {
  const h = (n: number) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
};
// camera shake offset
export const shake = (t: number, t0: number, amp: number, dur: number) => {
  const p = (t - t0) / dur; if (p < 0 || p > 1) return [0, 0, 0];
  const a = amp * Math.pow(1 - p, 2);
  return [noise1(t * 40, 1) * a, noise1(t * 40, 2) * a, noise1(t * 40, 3) * a * .5];
};
