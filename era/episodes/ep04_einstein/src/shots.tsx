import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P, Fire } from './art';
import { MChar, CAST, MLook, MPose, Expr, Chair, extra } from './chars';
import { C, BernStreet, Apartment, PatentOffice, Desk, Cafe, CafeTable, Study, Island, Hall, Porch, Hospital, Bed, BedFront, Table, Lamp, Papers, Sky, Chalk } from './sets';
import { Rewind, LightChase, TwoClocks, Papers1905, Emc2, Elevator, Mercury, Bending, Headline, Quantum, Letter, GPS, Legacy } from './egraphics';
import MOUTH from './mouth.json';

/* ---------- frame ---------- */
export type Cam = { x?: number; y?: number; z?: number; r?: number };
export const Frame: React.FC<{ children: React.ReactNode; cam?: Cam; boil?: number; ui?: React.ReactNode }> = ({ children, cam = {}, boil = 2.4, ui }) => {
  const f = useCurrentFrame();
  const { x = 960, y = 540, z = 1, r = 0 } = cam;
  return <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <Boil id="boil" frame={f} scale={boil} />
      <radialGradient id="fireGlow"><stop offset="0" stopColor="#ffc070" stopOpacity=".7" /><stop offset="1" stopColor="#ff9a3b" stopOpacity="0" /></radialGradient>
      <radialGradient id="sunGlow"><stop offset="0" stopColor="#fff6d0" stopOpacity="1" /><stop offset="1" stopColor="#ffd070" stopOpacity="0" /></radialGradient>
      <radialGradient id="lampWash" gradientUnits="userSpaceOnUse" cx={960} cy={500} r={1200}><stop offset="0" stopColor="#ffb060" stopOpacity=".16" /><stop offset=".6" stopColor="#ff8030" stopOpacity=".04" /><stop offset="1" stopColor="#000" stopOpacity=".3" /></radialGradient>
    </defs>
    <g transform={`translate(960 540) rotate(${r}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
    {ui}
  </svg>;
};
export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <g filter="url(#boil)">{children}</g>;

/* ---------- speech helpers ---------- */
const M: Record<string, number[]> = MOUTH as any;
const lineAt = (T: number) => (LINES as any[]).find((l) => T >= l.start - .05 && T < l.end + .05);
export const mouthOf = (spk: string, T: number) => { const a = M[spk]; if (!a) return 0; const i = Math.round(T * FPS); return a[i] || 0; };
const SPK: Record<string, string> = { you: 'YOU', youOld: 'YOU', ein: 'EIN', einMid: 'EIN', einOld: 'EIN', einBed: 'EIN', sol: 'SOL', hab: 'HAB', mil: 'MIL', bes: 'BES', gro: 'GRO', edd: 'EDD', bohr: 'BOHR', szi: 'SZI', doc: 'DOC' };
const blinkAt = (T: number, s: number) => ((T + s * 1.7) % 3.9) < .12 ? 1 : 0;

export type Actor = { k: string | MLook; id?: string; x: number | ((T: number, t: number) => number); y: number | ((T: number, t: number) => number); s?: number; flip?: boolean | ((T: number) => boolean); age?: number; p?: MPose | ((T: number, t: number) => MPose); still?: boolean; o?: number | ((T: number, t: number) => number); spk?: string; sleep?: boolean; e?: Expr };
const val = <V,>(v: V | ((T: number, t: number) => V), T: number, t: number): V => typeof v === 'function' ? (v as any)(T, t) : v;
const autoExpr = (text: string): Expr | null => /!$/.test(text) ? 'excited' : /\?$/.test(text) ? 'surprised' : null;
const ActorEl: React.FC<{ a: Actor; T: number; t: number; i: number; all: Actor[]; ex?: Record<string, Record<string, Expr>> }> = ({ a, T, t, i, all, ex }) => {
  const key = typeof a.k === 'string' ? a.k : ''; const spk = a.spk ?? SPK[key]; const id = a.id ?? key;
  const look = typeof a.k === 'string' ? CAST[a.k] : a.k;
  const x = val(a.x, T, t), s = a.s ?? 1.2, flip = val(a.flip ?? false, T, t), base: MPose = val(a.p ?? {}, T, t);
  const ln = lineAt(T); const speaking = !!(spk && ln && ln.speaker === spk);
  const m = spk ? mouthOf(spk, T) : 0;
  const pose: MPose = { blink: a.sleep ? 1 : blinkAt(T, i), bob: Math.sin(T * 1.6 + i) * 2, expr: a.e ?? 'neutral', ...base };
  const lex = ln && ex?.[ln.key]?.[id];
  if (speaking) {
    pose.mouth = m > .08 ? 'talk' : 'flat'; pose.open = m;
    pose.expr = lex || base.expr || autoExpr(ln.text) || a.e || 'happy';
    if (!a.still) { const sitF = base.sit ? .5 : 1; pose.armF = (base.armF ?? -.7) + Math.sin(T * 2.3 + i) * .28 * sitF; pose.elbowF = (base.elbowF ?? 1.1) + Math.sin(T * 3.1 + i) * .25; pose.tilt = (base.tilt ?? 0) + Math.sin(T * 1.7) * 2; }
  } else {
    if (lex) { pose.expr = lex; if (!base.mouth) pose.mouth = undefined; }
    if (ln && ln.speaker !== 'NARR' && !a.sleep) {
      const sp = all.find((o) => (o.spk ?? SPK[typeof o.k === 'string' ? o.k : '']) === ln.speaker);
      if (sp && sp !== a) { const dx = val(sp.x, T, t) - x; pose.lookX = base.lookX ?? (dx > 0 ? 1 : -1) * (flip ? -1 : 1) * .9; }
    }
  }
  return <MChar look={look} x={x} y={val(a.y, T, t)} s={s} flip={flip} age={a.age ?? 1} opacity={val(a.o ?? 1, T, t)} pose={pose} />;
};

/* ---------- dialogue scene with automatic coverage ---------- */
type CamV = Cam | 'wide' | 'two' | ((T: number, t: number) => Cam);
export type Scene = { a: number; b: number; bg: (T: number, t: number) => React.ReactNode; actors: Actor[]; fg?: (T: number, t: number) => React.ReactNode; ui?: (T: number, t: number) => React.ReactNode; wide?: Cam; cams?: Record<string, CamV>; zcu?: number; boil?: number; cam?: (T: number, t: number) => Cam; ex?: Record<string, Record<string, Expr>>; mid?: (T: number, t: number) => React.ReactNode };
const fit = (c: Required<Cam>): Cam => { const hw = 960 / c.z, hh = 540 / c.z; return { ...c, x: clamp(c.x, hw - 200, 2120 - hw), y: clamp(c.y, hh - 150, 1230 - hh) }; };
const camFor = (sc: Scene, T: number): Cam => {
  if (sc.cam) return sc.cam(T, T - sc.a);
  const W: Required<Cam> = { x: 960, y: 540, z: 1, r: 0, ...(sc.wide as any) };
  const ls = (LINES as any[]).filter((l) => l.start >= sc.a - .01 && l.start < sc.b);
  let li = -1; ls.forEach((l, k) => { if (T >= l.start - .02) li = k; });
  const cur = li >= 0 ? ls[li] : ls[0];
  const since = li >= 0 ? T - cur.start : T - sc.a, push = 1 + clamp(since / 7) * .05;
  if (!cur) return fit({ ...W, z: W.z * push });
  const ov = sc.cams?.[cur.key];
  if (typeof ov === 'function') return fit({ ...W, ...ov(T, since) } as any);
  if (ov && typeof ov === 'object') return fit({ ...W, ...ov, z: (ov.z ?? 1) * push } as any);
  const findA = (spk: string) => sc.actors.find((a) => (a.spk ?? SPK[typeof a.k === 'string' ? a.k : '']) === spk);
  const A = findA(cur.speaker);
  if (!A || ov === 'wide' || li === 0 && !ov) return fit({ ...W, z: W.z * push, x: W.x + Math.sin(since * .25) * 30 });
  const ax = val(A.x, T, T - sc.a), as = A.s ?? 1.2;
  const sitting = !!(val(A.p ?? {}, T, T - sc.a) as MPose).sit;
  const ay = val(A.y, T, 0) - (sitting ? 60 * as : 0);
  const dl = ls.slice(0, li + 1).filter((l) => l.speaker !== 'NARR').length;
  const others = sc.actors.filter((o) => o !== A && !(o.o === 0));
  const near = others.sort((p, q) => Math.abs(val(p.x, T, 0) - ax) - Math.abs(val(q.x, T, 0) - ax))[0];
  if (ov === 'two' || (dl % 3 === 0 && near)) {
    const nx = near ? val(near.x, T, 0) : ax; const cx = (ax + nx) / 2, span = Math.abs(ax - nx) + 520 * as;
    const z = clamp(1920 / span, 1, 1.7);
    return fit({ x: cx, y: ay - 200 * as, z: z * push, r: 0 });
  }
  const z = clamp((sc.zcu ?? 2.05) / as * 1.2, 1.25, 2.7);
  const dir = near ? Math.sign(val(near.x, T, 0) - ax) : 0;
  return fit({ x: ax + dir * 230 / z, y: ay - 250 * as + 120 / z, z: z * push, r: 0 });
};
export const SceneShot: React.FC<{ sc: Scene; T: number }> = ({ sc, T }) => {
  const t = T - sc.a;
  return <Frame cam={camFor(sc, T)} boil={sc.boil} ui={sc.ui?.(T, t)}>
    {sc.bg(T, t)}
    {sc.mid?.(T, t)}
    <B>{sc.actors.map((a, i) => <ActorEl key={i} a={a} T={T} t={t} i={i} all={sc.actors} ex={sc.ex} />)}</B>
    {sc.fg?.(T, t)}
  </Frame>;
};
export const Gfx: React.FC<{ C: React.FC<any>; T: number; a: number; b: number }> = ({ C: G, T, a, b }) => {
  const t = T - a, d = b - a;
  return <Frame cam={{ x: 960, y: 540, z: 1.0 + .05 * (t / d) }} boil={1.2}><B><G t={t} T={T} d={d} /></B></Frame>;
};

/* ---------- timeline helpers ---------- */
const S = (k: string) => (LINES as any[]).find((l) => l.key === k)!.start;
const E = (k: string) => (LINES as any[]).find((l) => l.key === k)!.end;
const Y = 930; // floor line for actors
const seat = (x: number, flip = false) => <Chair x={x - (flip ? -8 : 8)} y={Y} s={1.25} flip={flip} />;
const walkTo = (x0: number, x1: number, t0: number, dur: number) => (T: number, t: number) => lerp(x0, x1, easeInOut(prog(t, t0, t0 + dur)));
const walkP = (t0: number, dur: number, extraP: MPose = {}) => (T: number, t: number): MPose => ({ ...extraP, walk: t > t0 && t < t0 + dur ? 1 : 0, phase: t * 9 });

type Item = { a: number; b: number; g?: boolean; render: (T: number) => React.ReactNode };
const scenes: Item[] = [];
const sc = (s: Omit<Scene, 'b'> & { b?: number }) => scenes.push({ a: s.a, b: s.b ?? -1, render: (T) => <SceneShot sc={{ ...s, b: s.b ?? (scenes.find((x) => x.a === s.a)!.b) } as Scene} T={T} /> });
const gfx = (G: React.FC<any>, a: number) => scenes.push({ a, b: -1, g: true, render: (T) => <Gfx C={G} T={T} a={a} b={scenes.find((x) => x.a === a)!.b} /> });

/* ===== COLD OPEN — Princeton hospital, 1955 ===== */
sc({ a: 0, bg: (T) => <><Hospital T={T} /><Bed x={860} /><Lamp x={1180} y={640} /><rect x={1110} y={640} width={140} height={260} fill={C.woodD} stroke={P.ink} strokeWidth={6} /><Papers x={1180} y={640} n={7} seed={3} /></>,
  fg: () => <BedFront x={860} />, wide: { x: 960, y: 560, z: 1.05 },
  cams: { o1: (T, t) => ({ x: 900, y: 520, z: 1.0 + t * .025 }) },
  actors: [{ k: 'einBed', x: 760, y: 800, s: 1.15, p: { sit: 1, armF: -.8, elbowF: 1.2, holdF: 'paper' }, e: 'thinking' }, { k: 'doc', x: 1420, y: Y, s: 1.2, flip: true, e: 'worried' }, { k: 'you', id: 'you', x: 1640, y: Y, s: 1.15, flip: true, o: 0 }],
  ex: { o4: { doc: 'worried' } } });
gfx(Rewind, S('o5'));

/* ===== THE AD — Bern 1902 ===== */
sc({ a: S('d1'), bg: (T, t) => <BernStreet T={T} px={-t * 14} crowd={4} />, wide: { x: 960, y: 560, z: 1.0 },
  cams: { d1: (T, t) => ({ x: 860 + t * 22, y: 560, z: 1.05 + t * .01 }) },
  actors: [{ k: 'you', x: (T, t) => 700 + Math.min(t, 6.6) * 40, y: Y, s: 1.25, p: (T, t) => ({ walk: t < 6.6 ? .8 : 0, phase: t * 8, holdF: 'newspaper', armF: -1.1, elbowF: 1.5, lookY: .6 }), e: 'thinking' }] });
sc({ a: S('d3'), bg: (T) => <Apartment T={T} />, wide: { x: 960, y: 540, z: 1.0 },
  cams: { d3: (T, t) => ({ x: 1000, y: 520, z: 1.02 + t * .02 }) },
  actors: [{ k: 'you', x: 680, y: Y, s: 1.25, e: 'worried' }, { k: 'ein', x: walkTo(1500, 1150, .3, 1.6), flip: true, y: Y, s: 1.25, p: walkP(.3, 1.6), e: 'happy' }],
  ex: { d5: { ein: 'thinking' }, d6: { you: 'surprised' }, d6b: { ein: 'thinking' }, d6c: { you: 'laugh' } } });
sc({ a: S('d7'), bg: (T) => <><Apartment T={T} night />{seat(700)}{seat(1220, true)}<Lamp x={960} y={780} /></>, fg: () => <Table x={960} y={800} w={380} cloth="#7a3b34" />, wide: { x: 960, y: 560, z: 1.08 },
  cams: { d7: (T, t) => ({ x: 960, y: 560, z: 1.08 + t * .02 }) },
  actors: [{ k: 'you', x: 700, y: Y, s: 1.25, p: { sit: 1, holdF: 'teacup', armF: -1.0, elbowF: 1.6 }, e: 'happy' }, { k: 'ein', x: 1220, y: Y, s: 1.25, flip: true, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.2 }, e: 'excited' }],
  ex: { d8: { you: 'happy' } } });

/* ===== OLYMPIA ACADEMY ===== */
const dinner = (T: number) => <><Apartment T={T} night />{seat(560)}{seat(820)}{seat(1120, true)}{seat(1380, true)}<Lamp x={960} y={790} /></>;
const dinnerFg = (T: number, t: number) => <Table x={960} y={810} w={720} cloth="#e8dcc4">
  <ellipse cx={800} cy={786} rx={50} ry={10} fill="#f4f0e6" stroke={P.ink} strokeWidth={4} /><path d="M 775 780 q 25 -14 50 0" stroke="#8a3a2a" strokeWidth={10} strokeLinecap="round" opacity={T < S('k5') ? 1 : 0} />
  <path d="M 1060 782 l 30 -20 l 30 20 Z" fill="#f0d070" stroke={P.ink} strokeWidth={4} />
  <g opacity={T >= S('k6') && T < S('k8') + 2 ? 1 : 0}><ellipse cx={960} cy={786} rx={46} ry={10} fill="#f4f0e6" stroke={P.ink} strokeWidth={4} /><ellipse cx={960} cy={781} rx={26 * (1 - clamp((T - S('k7')) / 5))} ry={5} fill="#1d1612" /></g>
</Table>;
sc({ a: S('k1'), bg: (T) => dinner(T), fg: dinnerFg, wide: { x: 960, y: 560, z: 1.05 },
  cams: { k1: (T, t) => ({ x: 960 + Math.sin(t * .4) * 40, y: 560, z: 1.0 + t * .015 }), k7: (T, t) => ({ x: 1120, y: 620, z: 1.8 + t * .02 }) },
  actors: [{ k: 'hab', x: 560, y: Y, s: 1.2, p: { sit: 1 }, e: 'happy' }, { k: 'sol', x: 820, y: Y, s: 1.2, p: { sit: 1, holdF: 'notebook', armF: -1, elbowF: 1.4 }, e: 'happy' },
    { k: 'ein', x: 1120, y: Y, s: 1.2, flip: true, p: (T) => ({ sit: 1, armF: T > S('k7') && T < S('k8') ? -1.6 + Math.sin(T * 6) * .3 : -.8, elbowF: 1.6 }), e: 'excited' }, { k: 'you', x: 1380, y: Y, s: 1.2, flip: true, p: { sit: 1, holdF: 'teacup', armF: -1, elbowF: 1.6 }, e: 'happy' }],
  ex: { k5: { ein: 'laugh', hab: 'laugh', sol: 'laugh' }, k6: { you: 'surprised', sol: 'thinking' }, k7: { hab: 'laugh', sol: 'laugh', you: 'laugh' }, k8: { hab: 'laugh', sol: 'laugh', you: 'laugh' }, k4: { you: 'thinking', hab: 'thinking' } } });
sc({ a: S('k9'), bg: (T) => <><PatentOffice T={T} />{seat(880)}</>, fg: () => <Desk x={1060} y={790} />, wide: { x: 960, y: 540, z: 1.0 },
  cams: { k9: (T, t) => ({ x: lerp(700, 1050, easeInOut(t / 12)), y: 540, z: lerp(1.0, 1.35, easeInOut(t / 12)) }) },
  actors: [{ k: 'ein', x: 880, y: Y, s: 1.2, p: (T) => ({ sit: 1, holdF: 'pen', armF: -.9 + Math.sin(T * 5) * .08, elbowF: 1.7, lookY: .7 }), e: 'thinking' },
    { k: extra(1), x: (T, t) => 1700 - t * 40, y: Y, s: 1.15, flip: true, p: (T, t) => ({ walk: 1, phase: t * 8, holdF: 'paper', armF: -.9, elbowF: 1.4 }), spk: '-' },
    { k: 'mil', x: walkTo(1600, 1330, 12.6, 1.4), y: Y, s: 1.2, flip: true, p: walkP(12.6, 1.4), e: 'worried', o: (T, t) => t > 12.4 ? 1 : 0 }],
  ex: { k11: { mil: 'thinking' } } });

/* ===== MIRACLE YEAR — café, May 1905 ===== */
const cafeSet = (T: number) => <><Cafe T={T} />{seat(700)}{seat(1220, true)}{seat(1480, true)}</>;
sc({ a: S('m1'), bg: cafeSet, fg: () => <CafeTable x={960} />, wide: { x: 1000, y: 560, z: 1.05 },
  cams: { m1: (T, t) => ({ x: lerp(500, 1000, easeInOut(t / 7)), y: lerp(420, 560, easeInOut(t / 7)), z: lerp(1.5, 1.05, easeInOut(t / 7)) }) },
  actors: [{ k: 'ein', x: 700, y: Y, s: 1.2, p: { sit: 1, armF: -1.2, elbowF: 1.4 }, e: 'worried' }, { k: 'bes', x: 1220, y: Y, s: 1.2, flip: true, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.1 }, e: 'happy' }, { k: 'you', x: 1480, y: Y, s: 1.2, flip: true, p: { sit: 1, holdF: 'glass', armF: -1, elbowF: 1.5 }, e: 'neutral' }],
  ex: { m2: { ein: 'worried', bes: 'surprised' }, m5: { ein: 'thinking' }, m6: { ein: 'worried', bes: 'thinking', you: 'thinking' } } });
gfx(LightChase, S('m4'));
sc({ a: S('m5'), bg: cafeSet, fg: () => <CafeTable x={960} />, wide: { x: 1000, y: 560, z: 1.05 },
  actors: [{ k: 'ein', x: 700, y: Y, s: 1.2, p: { sit: 1, armF: -1.2, elbowF: 1.4 }, e: 'worried' }, { k: 'bes', x: 1220, y: Y, s: 1.2, flip: true, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.1 }, e: 'thinking' }, { k: 'you', x: 1480, y: Y, s: 1.2, flip: true, p: { sit: 1, holdF: 'glass', armF: -1, elbowF: 1.5 }, e: 'thinking' }],
  ex: { m6: { ein: 'worried' } } });
sc({ a: S('m7'), bg: (T) => <><PatentOffice T={T} />{seat(1260, true)}</>, fg: () => <Desk x={1420} y={790} />, wide: { x: 1000, y: 540, z: 1.0 },
  cams: { m7: (T, t) => ({ x: lerp(600, 1000, easeInOut(t / 4.5)), y: 560, z: 1.15 }) },
  actors: [{ k: 'ein', x: walkTo(200, 900, 0, 4.2), y: Y, s: 1.2, p: walkP(0, 4.2, { armF: -.3 }), e: 'excited' }, { k: 'bes', x: 1260, y: Y, s: 1.2, flip: true, p: { sit: 1, holdF: 'paper', armF: -1, elbowF: 1.4 }, e: 'neutral' }],
  ex: { m8: { bes: 'surprised' } } });
gfx(TwoClocks, S('m9'));
sc({ a: S('m10'), bg: (T) => <><PatentOffice T={T} />{seat(1260, true)}</>, fg: () => <Desk x={1420} y={790} />, wide: { x: 960, y: 540, z: 1.0 },
  actors: [{ k: 'you', x: 520, y: Y, s: 1.2, e: 'surprised' }, { k: 'ein', x: 900, y: Y, s: 1.2, e: 'excited' }, { k: 'bes', x: 1260, y: Y, s: 1.2, flip: true, p: { sit: 1, holdF: 'paper', armF: -1, elbowF: 1.4 }, e: 'happy' }],
  ex: { m11: { you: 'happy', bes: 'laugh' }, m11c: { you: 'laugh', bes: 'happy' } } });
gfx(Papers1905, S('m12'));

/* ===== E = mc² ===== */
sc({ a: S('e1'), bg: (T) => <><Apartment T={T} />{seat(1100, true)}</>, fg: () => <Desk x={1280} y={790} />, wide: { x: 960, y: 540, z: 1.0 },
  actors: [{ k: 'you', x: 640, y: Y, s: 1.25, p: { holdF: 'paper', armF: -1.3, elbowF: 1.2 }, e: 'surprised' }, { k: 'ein', x: 1100, y: Y, s: 1.25, flip: true, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.2 }, e: 'happy' }],
  ex: { e3: { ein: 'laugh' }, e4: { you: 'surprised' } } });
gfx(Emc2, S('e5'));

/* ===== HAPPIEST THOUGHT — 1907 ===== */
sc({ a: S('h1'), bg: (T) => <><PatentOffice T={T} />{seat(900)}</>, fg: () => <Desk x={1080} y={790} />, wide: { x: 960, y: 540, z: 1.0 },
  cams: { h1: (T, t) => ({ x: lerp(1500, 1000, easeInOut(t / 4.5)), y: 470, z: 1.4 }) },
  actors: [{ k: 'ein', x: (T) => T < S('h2') ? 900 : 720, y: Y, s: 1.25, p: (T) => T < S('h2') ? { sit: 1, lookX: -1, lookY: -.6, armF: -1.8, elbowF: 2.6 } : {}, e: 'thinking' },
    { k: 'you', x: 1450, y: Y, s: 1.25, flip: true, e: 'neutral' }],
  ex: { h2: { you: 'surprised' }, h4: { you: 'thinking' }, h5: { ein: 'laugh' }, h6: { you: 'surprised' } } });
gfx(Elevator, S('h6'));
sc({ a: S('h8'), bg: (T) => <Study T={T} night={false} eq={['ds² = gμν dxμ dxν', '?']} />, wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'ein', x: 720, y: Y, s: 1.25, p: { holdF: 'chalk', armF: -2.2, elbowF: .6 }, e: 'worried' }, { k: 'gro', x: 1260, y: Y, s: 1.25, flip: true, e: 'worried' }],
  ex: { h10: { gro: 'laugh' }, h9: { ein: 'surprised' } } });

/* ===== BENDING LIGHT ===== */
gfx(Mercury, S('s1'));
sc({ a: S('s2'), bg: (T) => <Study T={T} />, wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'einMid', x: 860, y: (T, t) => Y - Math.abs(Math.sin(t * 5)) * 26 * (t < 4 ? 1 : 0), s: 1.25, p: { armF: -2.6, armB: 2.4, elbowF: .4, elbowB: .4 }, e: 'excited' }, { k: 'you', x: 1360, y: Y, s: 1.25, flip: true, e: 'laugh' }],
  ex: {} });
gfx(Bending, S('s3'));
sc({ a: S('s4'), bg: (T, t) => <Island T={T} dark={easeInOut(prog(t, 1.5, 6.5)) * (1 - prog(t, 9.5, 11.5) * .7)} />, wide: { x: 960, y: 540, z: 1.0 },
  cams: { s4: (T, t) => ({ x: lerp(1300, 900, easeInOut(t / 7.5)), y: lerp(320, 520, easeInOut(t / 7.5)), z: lerp(1.5, 1.08, easeInOut(t / 7.5)) }), s5: (T, t) => ({ x: 820, y: 600, z: 1.7 + t * .02 }) },
  actors: [{ k: 'edd', x: 760, y: Y, s: 1.2, p: (T, t) => t > 7.5 ? { holdF: 'paper', armF: -1.4, elbowF: 1.0 } : { armF: -1.6, elbowF: 1.4 }, e: 'surprised' }, { k: extra(7), x: 380, y: Y, s: 1.15, spk: '-', e: 'thinking' }] });
sc({ a: S('s6'), bg: (T) => <><Study T={T} night={false} />{seat(1180, true)}</>, wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'you', x: walkTo(300, 700, 0, 1.2), y: Y, s: 1.25, p: (T, t) => ({ walk: t < 1.2 ? 1 : 0, phase: t * 10, holdF: 'telegram', armF: -1.5, elbowF: 1.0 }), e: 'excited' },
    { k: 'einMid', x: 1180, y: Y, s: 1.25, flip: true, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.2 }, e: 'happy' }],
  ex: { s7: { you: 'laugh' } } });
gfx(Headline, S('s8'));
sc({ a: S('s9'), bg: (T) => <><Study T={T} night={false} />{seat(1180, true)}</>, wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'you', x: 700, y: Y, s: 1.25, p: { holdF: 'newspaper', armF: -1.3, elbowF: 1.3 }, e: 'excited' }, { k: 'einMid', x: 1180, y: Y, s: 1.25, flip: true, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.2 }, e: 'thinking' }],
  ex: { s10: { you: 'surprised' } } });

/* ===== GOD AND DICE — Brussels 1927 ===== */
const hallSeats = (T: number) => <><Hall T={T} />{[300, 560, 1360, 1620].map((x, k) => <g key={k}>{seat(x, k > 1)}</g>)}</>;
sc({ a: S('q1'), bg: hallSeats, fg: () => <Table x={960} y={820} w={1600} cloth="#2f4a3a" />, wide: { x: 960, y: 560, z: 1.0 },
  cams: { q1: (T, t) => ({ x: lerp(600, 1100, easeInOut(t / 7.5)), y: 560, z: 1.15 }) },
  actors: [{ k: extra(0), x: 300, y: Y, s: 1.15, p: { sit: 1 }, spk: '-', e: 'thinking' }, { k: extra(4), x: 560, y: Y, s: 1.15, p: { sit: 1 }, spk: '-', e: 'neutral' },
    { k: 'bohr', x: 860, y: Y, s: 1.25, e: 'happy' }, { k: 'einMid', x: 1100, y: Y, s: 1.25, flip: true, e: 'thinking' },
    { k: extra(6), x: 1360, y: Y, s: 1.15, flip: true, p: { sit: 1 }, spk: '-', e: 'surprised' }, { k: extra(9), x: 1620, y: Y, s: 1.15, flip: true, p: { sit: 1, holdF: 'notebook', armF: -1, elbowF: 1.4 }, spk: '-' }],
  ex: { q3: { bohr: 'surprised' }, q4: { einMid: 'angry' } } });
gfx(Quantum, S('q2'));
sc({ a: S('q3'), bg: hallSeats, fg: () => <Table x={960} y={820} w={1600} cloth="#2f4a3a" />, wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: extra(0), x: 300, y: Y, s: 1.15, p: { sit: 1 }, spk: '-', e: 'thinking' }, { k: extra(4), x: 560, y: Y, s: 1.15, p: { sit: 1 }, spk: '-', e: 'neutral' },
    { k: 'bohr', x: 860, y: Y, s: 1.25, e: 'happy' }, { k: 'einMid', x: 1100, y: Y, s: 1.25, flip: true, e: 'angry' },
    { k: extra(6), x: 1360, y: Y, s: 1.15, flip: true, p: { sit: 1 }, spk: '-', e: 'surprised' }, { k: extra(9), x: 1620, y: Y, s: 1.15, flip: true, p: { sit: 1, holdF: 'notebook', armF: -1, elbowF: 1.4 }, spk: '-' }],
  cams: { q3: { x: 1060, y: 470, z: 2.0 }, q4: { x: 900, y: 470, z: 2.0 } },
  ex: { q4: { einMid: 'angry' } } });
sc({ a: S('q5'), bg: (T) => <><Hall T={T} breakfast />{seat(760)}{seat(1160, true)}</>, fg: () => <Table x={960} y={810} w={360} cloth="#efe6d4"><g transform="translate(960 790)"><path d="M -16 -26 L 16 -26 L 12 0 L -12 0 Z" fill="#f4f0e6" stroke={P.ink} strokeWidth={4} /></g></Table>, wide: { x: 960, y: 560, z: 1.05 },
  cams: { q5: (T, t) => ({ x: 960, y: 560 - t * 4, z: 1.05 + t * .03 }) },
  actors: [{ k: 'einMid', x: 760, y: Y, s: 1.25, p: (T) => ({ sit: 1, holdF: T > S('q5b') - .5 ? 'box' : 'teacup', armF: T > S('q5b') - .5 ? -1.5 : -1, elbowF: 1.3 }), e: 'excited' }, { k: 'bohr', x: 1160, y: Y, s: 1.25, flip: true, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.2 }, e: 'thinking' },
    { k: 'you', x: 1500, y: Y, s: 1.2, flip: true, e: 'thinking' }],
  ex: { q5c: { einMid: 'surprised' }, q6: { bohr: 'laugh' }, q7: { you: 'laugh', bohr: 'happy' } } });
sc({ a: S('q8'), bg: (T, t) => <BernStreet T={T} tone="dusk" px={-t * 30} crowd={2} tower={false} />, wide: { x: 960, y: 560, z: 1.0 },
  cam: (T, t) => ({ x: 900 + t * 30, y: 560, z: 1.12 }),
  actors: [{ k: 'bohr', x: (T, t) => 760 + t * 60, y: Y, s: 1.25, p: (T, t) => ({ walk: 1, phase: t * 7, armF: -.8 + Math.sin(t * 2) * .3, elbowF: 1.2 }), e: 'happy' }, { k: 'einMid', x: (T, t) => 1020 + t * 60, y: Y, s: 1.25, flip: true, p: (T, t) => ({ walk: 1, phase: t * 7 + 1, holdF: 'pipe', armF: -.9, elbowF: 2.2 }), e: 'laugh' }] });

/* ===== EXILE & THE BOMB ===== */
sc({ a: S('x1'), bg: (T) => <Porch T={T} />, wide: { x: 960, y: 560, z: 1.0 },
  cams: { x1: (T, t) => ({ x: lerp(1400, 960, easeInOut(t / 6)), y: 560, z: lerp(1.3, 1.05, easeInOut(t / 6)) }) },
  actors: [{ k: 'einMid', x: walkTo(1700, 1150, 0, 5), flip: true, y: Y, s: 1.25, p: (T, t) => ({ walk: t < 5 ? 1 : 0, phase: t * 7, holdF: 'notebook', armF: -.3 }), e: 'sad' }, { k: 'you', x: 720, y: Y, s: 1.2, e: 'worried' }] });
sc({ a: S('x3'), bg: (T) => <BernStreet T={T} tone="night" crowd={0} tower={false} />, mid: (T, t) => <><Fire x={960} y={900} s={2.2} t={t} />{Array.from({ length: 10 }).map((_, k) => { const p = ((t * .3 + k * .1) % 1); return <rect key={k} x={900 + Math.sin(k * 3 + t) * 200} y={860 - p * 600} width={30} height={22} fill="#efe3c8" opacity={1 - p} transform={`rotate(${t * 90 + k * 40} ${900 + Math.sin(k * 3 + t) * 200} ${860 - p * 600})`} />; })}</>,
  wide: { x: 960, y: 560, z: 1.0 }, cam: (T, t) => ({ x: 960, y: lerp(520, 640, t / 8), z: 1.1 + t * .04 }), actors: [] });
sc({ a: S('x4'), bg: (T) => <><Porch T={T} sea />{seat(760)}</>, wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'einOld', x: 760, y: Y, s: 1.25, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.2 }, e: 'neutral' }, { k: 'szi', x: 1200, y: Y, s: 1.25, flip: true, p: { holdF: 'paper', armF: -1.2, elbowF: 1.2 }, e: 'worried' }, { k: 'you', x: 1480, y: Y, s: 1.2, flip: true, e: 'worried' }],
  ex: { x4: { einOld: 'surprised', you: 'worried' }, x5: { szi: 'worried' }, x7: { szi: 'worried', you: 'sad' } } });
gfx(Letter, S('x8'));
sc({ a: S('x9'), bg: (T) => <><Study T={T} night={false} eq={['E = mc²']} />{seat(820)}</>, wide: { x: 960, y: 560, z: 1.0 },
  cams: { x9: (T, t) => ({ x: 900, y: 520, z: 1.5 + t * .03 }) },
  actors: [{ k: 'einOld', x: 820, y: Y, s: 1.25, p: { sit: 1, armF: -.6, elbowF: 1.4 }, e: 'sad' }, { k: 'youOld', x: 1300, y: Y, s: 1.25, flip: true, e: 'sad' }] });

/* ===== WHAT HE LEFT US ===== */
sc({ a: S('c1'), bg: (T) => <><Hospital T={T} /><Bed x={860} /><Lamp x={1180} y={640} on={false} /><rect x={1110} y={640} width={140} height={260} fill={C.woodD} stroke={P.ink} strokeWidth={6} /><Papers x={1180} y={640} n={9} seed={3} /></>,
  fg: () => <BedFront x={860} />, wide: { x: 960, y: 560, z: 1.05 },
  cams: { c1: (T, t) => ({ x: lerp(1180, 900, easeInOut(t / 10)), y: 560, z: lerp(1.6, 1.1, easeInOut(t / 10)) }) },
  actors: [{ k: 'einBed', x: 1000, y: 742, s: 1.1, p: { lean: -84, armF: .2 }, sleep: true, e: 'sleepy' }, { k: 'youOld', x: 1480, y: Y, s: 1.2, flip: true, e: 'sad' }] });
gfx(GPS, S('c3'));
gfx(Legacy, S('c4'));
sc({ a: S('c5a'), bg: (T) => <><Apartment T={T} night />{seat(700)}{seat(1220, true)}<Lamp x={960} y={780} /></>, fg: () => <Table x={960} y={800} w={380} cloth="#7a3b34" />, wide: { x: 960, y: 560, z: 1.08 },
  ui: (T, t) => <rect x={0} y={0} width={1920} height={1080} fill="#d8b878" opacity={.12} style={{ mixBlendMode: 'multiply' } as any} />,
  actors: [{ k: 'you', x: 700, y: Y, s: 1.25, p: { sit: 1, holdF: 'teacup', armF: -1.0, elbowF: 1.6 }, e: 'thinking' }, { k: 'ein', x: 1220, y: Y, s: 1.25, flip: true, p: { sit: 1, holdF: 'pipe', armF: -.9, elbowF: 2.2 }, e: 'happy' }],
  ex: { c5: { you: 'happy' } } });
sc({ a: S('c6'), bg: (T, t) => <BernStreet T={T} tone="dusk" px={-t * 10} crowd={3} />, wide: { x: 960, y: 560, z: 1.0 },
  cam: (T, t) => ({ x: 960, y: lerp(560, 380, easeInOut(t / 12)), z: lerp(1.15, 1.0, easeInOut(t / 12)) }),
  actors: [{ k: 'you', x: (T, t) => 880 + t * 8, y: (T, t) => Y - t * 4, s: (1.25), p: (T, t) => ({ walk: 1, phase: t * 6 }), e: 'thinking' }] });

// close the list
scenes.sort((p, q) => p.a - q.a);
scenes.forEach((s, i) => { s.b = i < scenes.length - 1 ? scenes[i + 1].a : 9999; });
export const SHOTS = scenes;
