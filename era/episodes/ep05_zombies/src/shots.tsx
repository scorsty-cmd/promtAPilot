import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P } from './art';
import { MChar, CAST, MLook, MPose, Expr } from './chars';
import { C, Sky, CityStreet, Safehouse, MountainRidge } from './sets';
import {
  RZeroExplainer,
  ParasiteExplainer,
  WaterExplainer,
  FoodExplainer,
  GeographyExplainer,
  FreezeExplainer,
  CrashExplainer
} from './egraphics';
import MOUTH from './mouth.json';

/* ---------- camera & frame ---------- */
export type Cam = { x?: number; y?: number; z?: number; r?: number };
export const Frame: React.FC<{ children: React.ReactNode; cam?: Cam; boil?: number; ui?: React.ReactNode }> = ({
  children,
  cam = {},
  boil = 2.4,
  ui
}) => {
  const f = useCurrentFrame();
  const { x = 960, y = 540, z = 1, r = 0 } = cam;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <Boil id="boil" frame={f} scale={boil} />
      </defs>
      <g transform={`translate(960 540) rotate(${r}) scale(${z}) translate(${-x} ${-y})`}>
        {children}
      </g>
      {ui}
    </svg>
  );
};
export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 3) % 5;
  const dx = k === 1 ? 0.8 : k === 3 ? -0.8 : 0;
  const dy = k === 2 ? 0.7 : k === 4 ? -0.7 : 0;
  return <g transform={`translate(${dx} ${dy})`}>{children}</g>;
};

/* ---------- speech & mouth helpers ---------- */
const M: Record<string, number[]> = MOUTH as any;
const lineAt = (T: number) => (LINES as any[]).find((l) => T >= l.start - 0.05 && T < l.end + 0.05);
export const mouthOf = (spk: string, T: number) => {
  const a = M[spk];
  if (!a) return 0;
  const i = Math.round(T * FPS);
  return a[i] || 0;
};

const SPK: Record<string, string> = {
  you: 'YOU',
  sarah: 'SARAH',
  marcus: 'MARCUS',
  kahn: 'KAHN',
};

const blinkAt = (T: number, s: number) => ((T + s * 1.7) % 3.9) < 0.12 ? 1 : 0;

export type Actor = {
  k: string | MLook;
  id?: string;
  x: number | ((T: number, t: number) => number);
  y: number | ((T: number, t: number) => number);
  s?: number;
  flip?: boolean | ((T: number) => boolean);
  p?: MPose | ((T: number, t: number) => MPose);
  still?: boolean;
  o?: number | ((T: number, t: number) => number);
  spk?: string;
  e?: Expr;
};

const val = <V,>(v: V | ((T: number, t: number) => V), T: number, t: number): V =>
  typeof v === 'function' ? (v as any)(T, t) : v;

const autoExpr = (text: string): Expr | null =>
  /!$/.test(text) ? 'tense' : /\?$/.test(text) ? 'surprised' : null;

const ActorEl: React.FC<{
  a: Actor;
  T: number;
  t: number;
  i: number;
  all: Actor[];
  ex?: Record<string, Record<string, Expr>>;
}> = ({ a, T, t, i, all, ex }) => {
  const key = typeof a.k === 'string' ? a.k : '';
  const spk = a.spk ?? SPK[key];
  const id = a.id ?? key;
  const look = typeof a.k === 'string' ? CAST[a.k] : a.k;
  const x = val(a.x, T, t);
  const s = a.s ?? 1.15;
  const flip = val(a.flip ?? false, T, t);
  const base: MPose = val(a.p ?? {}, T, t);
  const ln = lineAt(T);
  const speaking = !!(spk && ln && ln.speaker === spk);
  const m = spk ? mouthOf(spk, T) : 0;
  const pose: MPose = { blink: blinkAt(T, i), bob: Math.sin(T * 1.6 + i) * 2, expr: a.e ?? 'neutral', ...base };
  const lex = ln && ex?.[ln.key]?.[id];

  if (speaking) {
    pose.mouth = m > 0.08 ? 'talk' : 'flat';
    pose.open = m;
    pose.expr = lex || base.expr || autoExpr(ln.text) || a.e || 'tense';
    if (!a.still) {
      pose.armF = (base.armF ?? -0.6) + Math.sin(T * 2.5 + i) * 0.25;
      pose.elbowF = (base.elbowF ?? 1.0) + Math.sin(T * 3.2 + i) * 0.2;
      pose.tilt = (base.tilt ?? 0) + Math.sin(T * 1.8) * 2;
    }
  } else {
    if (lex) {
      pose.expr = lex;
    }
    if (ln && ln.speaker !== 'NARR') {
      const sp = all.find((o) => (o.spk ?? SPK[typeof o.k === 'string' ? o.k : '']) === ln.speaker);
      if (sp && sp !== a) {
        const dx = val(sp.x, T, t) - x;
        pose.lookX = base.lookX ?? (dx > 0 ? 1 : -1) * (flip ? -1 : 1) * 0.9;
      }
    }
  }
  return (
    <g opacity={val(a.o ?? 1, T, t)} transform={flip ? `translate(${x * 2} 0) scale(-1 1)` : undefined}>
      <MChar look={look} x={x} y={val(a.y, T, t)} s={s} pose={pose} />
    </g>
  );
};

/* ---------- dialogue scene with automatic dynamic coverage ---------- */
type CamV = Cam | 'wide' | 'two' | ((T: number, t: number) => Cam);
export type Scene = {
  a: number;
  b: number;
  bg: (T: number, t: number) => React.ReactNode;
  actors: Actor[];
  fg?: (T: number, t: number) => React.ReactNode;
  ui?: (T: number, t: number) => React.ReactNode;
  wide?: Cam;
  cams?: Record<string, CamV>;
  zcu?: number;
  boil?: number;
  cam?: (T: number, t: number) => Cam;
  ex?: Record<string, Record<string, Expr>>;
};

const fit = (c: Required<Cam>): Cam => {
  const hw = 960 / c.z, hh = 540 / c.z;
  return { ...c, x: clamp(c.x, hw - 200, 2120 - hw), y: clamp(c.y, hh - 150, 1230 - hh) };
};

const camFor = (sc: Scene, T: number): Cam => {
  if (sc.cam) return sc.cam(T, T - sc.a);
  const W: Required<Cam> = { x: 960, y: 540, z: 1, r: 0, ...(sc.wide as any) };
  const ls = (LINES as any[]).filter((l) => l.start >= sc.a - 0.01 && l.start < sc.b);
  let li = -1;
  ls.forEach((l, k) => {
    if (T >= l.start - 0.02) li = k;
  });
  const cur = li >= 0 ? ls[li] : ls[0];
  const since = li >= 0 ? T - cur.start : T - sc.a;
  const push = 1 + clamp(since / 7) * 0.05;

  if (!cur) return fit({ ...W, z: W.z * push });
  const ov = sc.cams?.[cur.key];
  if (typeof ov === 'function') return fit({ ...W, ...ov(T, since) } as any);
  if (ov && typeof ov === 'object') return fit({ ...W, ...ov, z: (ov.z ?? 1) * push } as any);

  const findA = (spk: string) => sc.actors.find((a) => (a.spk ?? SPK[typeof a.k === 'string' ? a.k : '']) === spk);
  const A = findA(cur.speaker);
  if (!A || ov === 'wide' || (li === 0 && !ov)) {
    return fit({ ...W, z: W.z * push, x: W.x + Math.sin(since * 0.25) * 30 });
  }

  const ax = val(A.x, T, T - sc.a), as = A.s ?? 1.15;
  const ay = val(A.y, T, 0);
  const dl = ls.slice(0, li + 1).filter((l) => l.speaker !== 'NARR').length;
  const others = sc.actors.filter((o) => o !== A && !(o.o === 0));
  const near = others.sort((p, q) => Math.abs(val(p.x, T, 0) - ax) - Math.abs(val(q.x, T, 0) - ax))[0];

  if (ov === 'two' || (dl % 3 === 0 && near)) {
    const nx = near ? val(near.x, T, 0) : ax;
    const cx = (ax + nx) / 2;
    const span = Math.abs(ax - nx) + 520 * as;
    const z = clamp(1920 / span, 1, 1.7);
    return fit({ x: cx, y: ay - 200 * as, z: z * push, r: 0 });
  }

  const z = clamp((sc.zcu ?? 1.95) / as * 1.2, 1.25, 2.6);
  const dir = near ? Math.sign(val(near.x, T, 0) - ax) : 0;
  return fit({ x: ax + dir * 210 / z, y: ay - 240 * as + 110 / z, z: z * push, r: 0 });
};

export const SceneShot: React.FC<{ sc: Scene; T: number }> = ({ sc, T }) => {
  const t = T - sc.a;
  return (
    <Frame cam={camFor(sc, T)} boil={sc.boil} ui={sc.ui?.(T, t)}>
      {sc.bg(T, t)}
      <B>{sc.actors.map((a, i) => <ActorEl key={i} a={a} T={T} t={t} i={i} all={sc.actors} ex={sc.ex} />)}</B>
      {sc.fg?.(T, t)}
    </Frame>
  );
};

export const Gfx: React.FC<{ C: React.FC<any>; T: number; a: number; b: number }> = ({ C: G, T, a, b }) => {
  const t = T - a, d = b - a;
  return (
    <Frame cam={{ x: 960, y: 540, z: 1.0 + 0.05 * (t / d) }} boil={1.2}>
      <B><G t={t} T={T} d={d} /></B>
    </Frame>
  );
};

/* ---------- timeline helpers ---------- */
const S = (k: string) => (LINES as any[]).find((l) => l.key === k)!.start;
const Y = 940; // ground floor line

type Item = { a: number; b: number; g?: boolean; render: (T: number) => React.ReactNode };
const scenes: Item[] = [];
const sc = (s: Omit<Scene, 'b'> & { b?: number }) =>
  scenes.push({ a: s.a, b: s.b ?? -1, render: (T) => <SceneShot sc={{ ...s, b: s.b ?? scenes.find((x) => x.a === s.a)!.b } as Scene} T={T} /> });
const gfx = (G: React.FC<any>, a: number) =>
  scenes.push({ a, b: -1, g: true, render: (T) => <Gfx C={G} T={T} a={a} b={scenes.find((x) => x.a === a)!.b} /> });

/* ================= 10 CHAPTERS EPISODE STRUCTURE ================= */

/* CH 1: DAY ZERO (0s -> S('r1')) - Cold open hook with sirens */
sc({
  a: 0,
  bg: (T, t) => <CityStreet T={T} px={-t * 15} siren={true} />,
  wide: { x: 960, y: 560, z: 1.05 },
  cams: {
    o1: (T, t) => ({ x: 880 + t * 20, y: 540, z: 1.05 + t * 0.01 }),
    o9: (T, t) => ({ x: 1350, y: 620, z: 1.3 + t * 0.02 }),
  },
  actors: [
    { k: 'you', x: 620, y: Y, s: 1.15, p: { holdF: 'flashlight', expr: 'surprised' } },
    { k: 'marcus', x: 980, y: Y, s: 1.2, p: { holdF: 'radio', expr: 'angry' } },
    { k: 'sarah', x: 1340, y: Y, s: 1.15, flip: true, p: { expr: 'worried' } },
    { k: 'stalker', x: 1720, y: Y + 20, s: 0.95, p: { crouch: 1, expr: 'tense' }, o: (T) => clamp((T - 22) * 0.5) }
  ]
});

/* CH 2: OUTBREAK MATH (S('r1') -> S('b1')) */
sc({
  a: S('r1'),
  bg: (T, t) => <Safehouse T={T} px={0} />,
  wide: { x: 960, y: 550, z: 1.1 },
  actors: [
    { k: 'you', x: 640, y: Y, s: 1.15, p: { expr: 'thinking' } },
    { k: 'sarah', x: 960, y: Y, s: 1.15, p: { expr: 'tense', holdF: 'map' } },
    { k: 'marcus', x: 1320, y: Y, s: 1.2, flip: true, p: { holdF: 'radio', expr: 'tense' } }
  ]
});
gfx(RZeroExplainer, S('r2'));

/* CH 3: NATURE'S REAL ZOMBIES (S('b1') -> S('w1')) */
sc({
  a: S('b1'),
  bg: (T, t) => <Safehouse T={T} px={0} />,
  wide: { x: 960, y: 550, z: 1.1 },
  actors: [
    { k: 'you', x: 600, y: Y, s: 1.15, p: { expr: 'thinking' } },
    { k: 'kahn', x: 960, y: Y, s: 1.15, p: { expr: 'thinking' } },
    { k: 'sarah', x: 1320, y: Y, s: 1.15, flip: true, p: { expr: 'tense' } }
  ]
});
gfx(ParasiteExplainer, S('b5'));

/* CH 4: THE 72-HOUR BLACKOUT (WATER) (S('w1') -> S('f1')) */
sc({
  a: S('w1'),
  bg: (T, t) => <Safehouse T={T} px={0} />,
  wide: { x: 960, y: 550, z: 1.1 },
  actors: [
    { k: 'you', x: 620, y: Y, s: 1.15, p: { holdF: 'water', expr: 'worried' } },
    { k: 'marcus', x: 980, y: Y, s: 1.2, p: { expr: 'tense' } },
    { k: 'kahn', x: 1340, y: Y, s: 1.15, flip: true, p: { holdF: 'filter', expr: 'thinking' } }
  ]
});
gfx(WaterExplainer, S('w8'));

/* CH 5: THE FOOD EQUATION (S('f1') -> S('g1')) */
sc({
  a: S('f1'),
  bg: (T, t) => <Safehouse T={T} px={0} />,
  wide: { x: 960, y: 550, z: 1.1 },
  actors: [
    { k: 'you', x: 620, y: Y, s: 1.15, p: { holdF: 'can', expr: 'thinking' } },
    { k: 'sarah', x: 980, y: Y, s: 1.15, p: { expr: 'tense' } },
    { k: 'kahn', x: 1340, y: Y, s: 1.15, flip: true, p: { expr: 'thinking' } }
  ]
});
gfx(FoodExplainer, S('f5'));

/* CH 6: GEOGRAPHY OF SURVIVAL (S('g1') -> S('z1')) */
sc({
  a: S('g1'),
  bg: (T, t) => <MountainRidge T={T} px={-t * 8} winter={false} />,
  wide: { x: 960, y: 550, z: 1.05 },
  actors: [
    { k: 'you', x: 580, y: Y, s: 1.15, p: { holdF: 'binoculars', expr: 'thinking' } },
    { k: 'sarah', x: 940, y: Y, s: 1.15, p: { holdF: 'map', expr: 'excited' } },
    { k: 'marcus', x: 1320, y: Y, s: 1.2, flip: true, p: { holdF: 'radio', expr: 'neutral' } }
  ]
});
gfx(GeographyExplainer, S('g3'));

/* CH 7: THE FREEZING DEAD (S('z1') -> S('n1')) */
sc({
  a: S('z1'),
  bg: (T, t) => <MountainRidge T={T} px={-t * 10} winter={true} />,
  wide: { x: 960, y: 550, z: 1.05 },
  actors: [
    { k: 'you', x: 600, y: Y, s: 1.15, p: { expr: 'thinking' } },
    { k: 'kahn', x: 980, y: Y, s: 1.15, p: { expr: 'thinking' } },
    { k: 'sarah', x: 1340, y: Y, s: 1.15, flip: true, p: { expr: 'excited' } }
  ]
});
gfx(FreezeExplainer, S('z3'));

/* CH 8: THE PHYSICS OF SILENCE (S('n1') -> S('d1')) */
sc({
  a: S('n1'),
  bg: (T, t) => <CityStreet T={T} px={0} siren={false} />,
  wide: { x: 960, y: 560, z: 1.1 },
  cams: {
    n1: (T, t) => ({ x: 800, y: 540, z: 1.2 }),
    n4: (T, t) => ({ x: 1540, y: 640, z: 1.4 + t * 0.02 })
  },
  actors: [
    { k: 'you', x: 680, y: Y, s: 1.15, p: { expr: 'tense', armF: -0.2 } },
    { k: 'marcus', x: 940, y: Y, s: 1.2, p: { expr: 'tense', armF: 0.8 } },
    { k: 'stalker', x: 1680, y: Y - 20, s: 0.9, flip: true, p: { crouch: 1, expr: 'tense' }, o: (T) => clamp((T - S('n4')) * 0.8) }
  ]
});

/* CH 9: THE METABOLIC CRASH (S('d1') -> S('c1')) */
sc({
  a: S('d1'),
  bg: (T, t) => <Safehouse T={T} px={0} />,
  wide: { x: 960, y: 550, z: 1.1 },
  actors: [
    { k: 'you', x: 620, y: Y, s: 1.15, p: { expr: 'thinking' } },
    { k: 'kahn', x: 980, y: Y, s: 1.15, p: { expr: 'thinking' } },
    { k: 'sarah', x: 1340, y: Y, s: 1.15, flip: true, p: { expr: 'neutral' } }
  ]
});
gfx(CrashExplainer, S('d2'));

/* CH 10: REBUILDING THE WORLD (S('c1') -> END) */
sc({
  a: S('c1'),
  bg: (T, t) => <MountainRidge T={T} px={-t * 6} winter={false} />,
  wide: { x: 960, y: 540, z: 1.05 },
  cams: {
    c7: (T, t) => ({ x: 960, y: 540, z: 1.0 + t * 0.015 })
  },
  actors: [
    { k: 'you', x: 580, y: Y, s: 1.15, p: { holdF: 'seed', expr: 'happy' } },
    { k: 'sarah', x: 880, y: Y, s: 1.15, p: { expr: 'happy' } },
    { k: 'marcus', x: 1180, y: Y, s: 1.2, p: { expr: 'happy' } },
    { k: 'kahn', x: 1480, y: Y, s: 1.15, flip: true, p: { expr: 'happy' } }
  ]
});

// Calculate scene boundaries
for (let i = 0; i < scenes.length; i++) {
  if (scenes[i].b < 0) {
    scenes[i].b = i + 1 < scenes.length ? scenes[i + 1].a : 99999;
  }
}

export const SHOTS = scenes;
