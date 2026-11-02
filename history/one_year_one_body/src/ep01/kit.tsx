// Episode kit (v3): shared defs, camera, actor helper, captions, labels, cards, overlays.
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, interpolate, staticFile, Easing} from 'remotion';
import {HeadPose, Look, Pose, Puppet, restHead, visMouth, HandPose} from '../rig';
import {blinkAuto, idle, clamp01, ease} from '../motion';
import TL from './timeline.json';

export const INK = '#2B1D14';
export const FLOOR = 905;
export const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const iv = (f: number, a: number[], b: number[], e?: (x: number) => number) => interpolate(f, a, b, e ? {...cl, easing: e} : cl);
export const EOut = Easing.out(Easing.cubic);
export const EBack = Easing.out(Easing.back(1.7));

export type Line = {sp: string; text: string; start: number; end: number; vis?: [string, number][]};
export type Shot = {id: string; ch: number; start: number; end: number; lines: Line[]};
export const SHOTS = TL.shots as unknown as Shot[];
export type SP = {lf: number; gf: number; sh: Shot; dur: number};

// local frame where line i of the shot starts / ends
export const ls = (sh: Shot, i: number) => (sh.lines[i] ? sh.lines[i].start - sh.start : 0);
export const le = (sh: Shot, i: number) => (sh.lines[i] ? sh.lines[i].end - sh.start : 0);

// lip sync for a speaker at global frame gf
export const speech = (sh: Shot, sp: string, gf: number) => {
  const l = sh.lines.find((x) => x.sp === sp && gf >= x.start && gf < x.end);
  if (!l || !l.vis) return {mouth: 'line' as const, open: 0, talking: false, amp: 0};
  const v = l.vis[Math.min(l.vis.length - 1, gf - l.start)] as [string, number];
  const m = visMouth(v);
  return {...m, talking: true, amp: v ? v[1] : 0};
};

export const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const fs = [
      new FontFace('FellSC', `url(${staticFile('fonts/im-fell-english-sc-latin-400-normal.woff2')})`),
      new FontFace('FellItalic', `url(${staticFile('fonts/im-fell-english-latin-400-italic.woff2')})`, {style: 'italic'}),
      new FontFace('FrauncesBlack', `url(${staticFile('fonts/fraunces-latin-900-normal.woff2')})`, {weight: '900'}),
    ];
    Promise.all(fs.map((x) => x.load())).then((l) => { l.forEach((x) => (document as any).fonts.add(x)); continueRender(h); });
  }, [h]);
};

export const Defs: React.FC<{gf: number}> = ({gf}) => (
  <defs>
    <filter id="paint" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
    </filter>
    <filter id="soft" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="1" seed="9" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
    </filter>
    <filter id="brush" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.9" numOctaves="2" seed="3" />
      <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 0.5 0" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <filter id="blurFg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
    <filter id="blurBg"><feGaussianBlur stdDeviation="4" /></filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22" /></filter>
    <filter id="glowS" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed={Math.floor(gf / 2) % 50} />
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.085 0" />
    </filter>
    <filter id="freeze"><feColorMatrix type="saturate" values="0.25" /></filter>
    <filter id="night"><feColorMatrix values="0.36 0.04 0.08 0 0  0.04 0.42 0.12 0 0.01  0.08 0.12 0.66 0 0.03  0 0 0 1 0" /></filter>
    <radialGradient id="candle" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#FFD58A" stopOpacity="0.55" /><stop offset="0.5" stopColor="#F2A24A" stopOpacity="0.18" /><stop offset="1" stopColor="#F2A24A" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="moonPool" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#BFD3F2" stopOpacity="0.42" /><stop offset="0.6" stopColor="#8FA8D0" stopOpacity="0.12" /><stop offset="1" stopColor="#8FA8D0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="ovenGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#FF9A3C" stopOpacity="0.7" /><stop offset="0.45" stopColor="#E86A24" stopOpacity="0.22" /><stop offset="1" stopColor="#E86A24" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0B0604" stopOpacity="0.82" />
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A3424" /><stop offset="1" stopColor="#1F150E" /></linearGradient>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0C1424" /><stop offset="1" stopColor="#2C3A58" /></linearGradient>
    <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FA3A8" /><stop offset="0.7" stopColor="#D9C9A2" /><stop offset="1" stopColor="#E8CF98" /></linearGradient>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B2A3A" /><stop offset="0.6" stopColor="#5B5A66" /><stop offset="1" stopColor="#D79A5C" /></linearGradient>
    <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B2A3A" /><stop offset="0.6" stopColor="#5B5A66" /><stop offset="1" stopColor="#D79A5C" /></linearGradient>
    <linearGradient id="parch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#EADBB8" /><stop offset="1" stopColor="#D2BC8E" /></linearGradient>
  </defs>
);

// ---------- camera ----------
export type Cut = {at: number; z0: number; z1: number; f0: [number, number]; f1: [number, number]};
export const camOf = (lf: number, cuts: Cut[], dur: number) => {
  let i = 0;
  for (let k = 0; k < cuts.length; k++) if (lf >= cuts[k].at) i = k;
  const c = cuts[i];
  const end = i + 1 < cuts.length ? cuts[i + 1].at : dur;
  const t = clamp01((lf - c.at) / Math.max(1, end - c.at));
  const e = t * t * (3 - 2 * t) * 0.6 + t * 0.4;
  return {z: c.z0 + (c.z1 - c.z0) * e, x: c.f0[0] + (c.f1[0] - c.f0[0]) * e, y: c.f0[1] + (c.f1[1] - c.f0[1]) * e, i, cutAt: c.at};
};
export const Cam: React.FC<{lf: number; cuts: Cut[]; dur: number; shake?: number; children: React.ReactNode; rot?: number}> = ({lf, cuts, dur, shake = 0, children, rot = 0}) => {
  const c = camOf(lf, cuts, dur);
  const sx = shake * Math.sin(lf * 3.1), sy = shake * Math.cos(lf * 2.3);
  return <g transform={`translate(${960 + sx} ${540 + sy}) rotate(${rot}) scale(${c.z}) translate(${-c.x} ${-c.y})`}>{children}</g>;
};

// ---------- actor ----------
export type ActOpts = {
  legF?: [number, number]; legB?: [number, number]; hF?: [number, number]; hB?: [number, number]; elbowF?: 1 | -1; elbowB?: 1 | -1;
  lean?: number; bob?: number; squash?: number; sway?: number; head?: Partial<HeadPose>; seed?: number; still?: boolean;
};
export const STAND = {legF: [0.05, 0.03] as [number, number], legB: [-0.05, 0.03] as [number, number], hF: [-10, 6] as [number, number], hB: [40, 2] as [number, number]};
export const SIT = {legF: [1.42, 1.42] as [number, number], legB: [1.3, 1.3] as [number, number]};
export const mkPose = (f: number, o: ActOpts): Pose => {
  const seed = o.seed ?? 0;
  const id = idle(f, seed, o.still ? 0.3 : 1);
  const head: HeadPose = restHead({blink: blinkAuto(f, seed), tilt: id.tilt, ...o.head});
  if (o.head && o.head.blink !== undefined) head.blink = Math.max(o.head.blink, blinkAuto(f, seed));
  return {
    legF: o.legF ?? STAND.legF, legB: o.legB ?? STAND.legB,
    handF: o.hF ?? STAND.hF, handB: o.hB ?? STAND.hB, elbowF: o.elbowF ?? 1, elbowB: o.elbowB ?? 1,
    lean: (o.lean ?? 0) + id.sway, bob: (o.bob ?? 0) + id.bob, squash: o.squash ?? 0, apronSway: (o.sway ?? 0) + Math.sin(f * 0.08 + seed) * 1.2,
    head, frame: f,
  };
};
export const Actor: React.FC<{L: Look; x: number; y: number; s?: number; flip?: boolean; p: Pose; propF?: React.ReactNode; propAngF?: number; propB?: React.ReactNode; propAngB?: number; gripF?: boolean; gripB?: boolean; poseF?: HandPose; poseB?: HandPose; shadow?: boolean; filter?: string}> =
  ({L, x, y, s = 1.15, flip, p, shadow = true, filter = 'url(#soft)', ...r}) => (
    <g>
      {shadow && <ellipse cx={x} cy={y + 186 * s} rx={95 * s} ry={13 * s} fill="#0E0805" opacity={0.4} />}
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter={filter}>
        <Puppet L={L} p={p} {...r} />
      </g>
    </g>
  );

// ---------- text helpers ----------
export const Caption: React.FC<{sh: Shot; gf: number}> = ({sh, gf}) => {
  const l = sh.lines.find((x) => x.sp !== 'N' && gf >= x.start && gf <= x.end + 10);
  if (!l) return null;
  const w = Math.min(1700, l.text.length * 25 + 60);
  return (
    <g>
      <rect x={960 - w / 2} y={948} width={w} height={66} rx={10} fill="#120B08" opacity={0.74} />
      <text x={960} y={993} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={44} fill="#F3E7CF">{l.text}</text>
    </g>
  );
};
// freeze-frame comedy label
export const FreezeLabel: React.FC<{t: number; title: string; sub: string; x?: number; y?: number}> = ({t, title, sub, x = 170, y = 150}) => {
  const lab = iv(t, [2, 14], [0, 1], EBack);
  const w = Math.max(title.length * 52, sub.length * 25) + 80;
  return (
    <g transform={`translate(${x + (1 - lab) * -60} ${y}) rotate(-4) scale(${0.55 + 0.3 * lab})`} opacity={Math.min(1, lab * 1.5)}>
      <rect x={-30} y={-90} width={w} height={200} fill="#EFE3C6" stroke={INK} strokeWidth={6} />
      <rect x={-30} y={-90} width={w} height={200} filter="url(#brush)" fill="#EFE3C6" />
      <text x={0} y={-10} fontFamily="FrauncesBlack" fontWeight={900} fontSize={84} fill={INK}>{title}</text>
      <text x={2} y={66} fontFamily="FellItalic" fontStyle="italic" fontSize={50} fill="#7E2119">{sub}</text>
    </g>
  );
};
// paper tag label (place/date, info)
export const Tag: React.FC<{x: number; y: number; t: number; text: string; sub?: string; size?: number; rot?: number; color?: string}> = ({x, y, t, text, sub, size = 56, rot = -2, color = INK}) => {
  const a = iv(t, [0, 10], [0, 1], EBack);
  const w = Math.max(text.length * size * 0.62, (sub?.length ?? 0) * size * 0.38) + 60;
  const h = sub ? size * 2.2 : size * 1.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${a})`} opacity={clamp01(a * 1.4)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#EFE3C6" stroke={INK} strokeWidth={5} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} filter="url(#brush)" fill="#EFE3C6" />
      <text x={0} y={sub ? -h / 2 + size * 1.05 : size * 0.33} textAnchor="middle" fontFamily="FellSC" fontSize={size} fill={color}>{text}</text>
      {sub && <text x={0} y={-h / 2 + size * 1.8} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={size * 0.6} fill="#7E2119">{sub}</text>}
    </g>
  );
};
// big statement word (Fraunces Black), slams in
export const BigWord: React.FC<{x: number; y: number; t: number; text: string; size?: number; color?: string; stroke?: string}> = ({x, y, t, text, size = 200, color = '#E5503A', stroke = INK}) => {
  const a = iv(t, [0, 7], [1.8, 1], EOut);
  const o = iv(t, [0, 3], [0, 1]);
  return (
    <g transform={`translate(${x} ${y}) scale(${a})`} opacity={o}>
      <text x={0} y={size * 0.34} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={size} fill={color} stroke={stroke} strokeWidth={size * 0.05} paintOrder="stroke" letterSpacing={4}>{text}</text>
    </g>
  );
};
// rubber stamp
export const Stamp: React.FC<{x: number; y: number; t: number; text: string; rot?: number; color?: string; size?: number}> = ({x, y, t, text, rot = -12, color = '#B3362B', size = 90}) => {
  if (t < 0) return null;
  const s = iv(t, [0, 5, 9], [2.4, 0.92, 1], EOut);
  const w = text.length * size * 0.66 + 50;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={iv(t, [0, 3], [0, 0.92])}>
      <rect x={-w / 2} y={-size * 0.75} width={w} height={size * 1.5} rx={10} fill="none" stroke={color} strokeWidth={10} />
      <text x={0} y={size * 0.33} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={size} fill={color} letterSpacing={3}>{text}</text>
    </g>
  );
};
// "Cure No. n" card
export const CureCard: React.FC<{t: number; n: number; name: string; x?: number; y?: number}> = ({t, n, name, x = 1480, y = 190}) => {
  const a = iv(t, [0, 12], [0, 1], EBack);
  return (
    <g transform={`translate(${x + (1 - a) * 300} ${y}) rotate(3)`} opacity={clamp01(a * 1.5)}>
      <rect x={-300} y={-95} width={600} height={190} fill="#EFE3C6" stroke={INK} strokeWidth={6} />
      <rect x={-300} y={-95} width={600} height={190} filter="url(#brush)" fill="#EFE3C6" />
      <text x={0} y={-28} textAnchor="middle" fontFamily="FellSC" fontSize={44} fill="#7E2119">{`Cure No. ${n}`}</text>
      <text x={0} y={52} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={62} fill={INK}>{name}</text>
    </g>
  );
};
// throbbing pain rings at a point
export const Throb: React.FC<{x: number; y: number; f: number; amt?: number; color?: string}> = ({x, y, f, amt = 1, color = '#E5503A'}) => (
  <g opacity={amt}>
    {[0, 1, 2].map((i) => {
      const ph = ((f + i * 9) % 27) / 27;
      return <circle key={i} cx={x} cy={y} r={20 + ph * 70} fill="none" stroke={color} strokeWidth={9 * (1 - ph)} opacity={1 - ph} />;
    })}
  </g>
);
// post: vignette, grain, fades
export const Post: React.FC<{fade?: number; tint?: string; tintO?: number}> = ({fade = 0, tint, tintO = 0}) => (
  <g>
    {tint && <rect width={1920} height={1080} fill={tint} opacity={tintO} />}
    <rect width={1920} height={1080} fill="url(#vig)" />
    <rect width={1920} height={1080} filter="url(#grain)" />
    {fade > 0 && <rect width={1920} height={1080} fill="#000" opacity={fade} />}
  </g>
);
export {ease};
