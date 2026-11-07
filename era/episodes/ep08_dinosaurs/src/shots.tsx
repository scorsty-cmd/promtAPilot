import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, easeIn, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P } from './art';
import { MChar, CAST, MLook, MPose, Expr } from './chars';
import { R, Theropod, Raptor, Trood, TroodPose, Pip, Sauropod, Ptero, Mosa, Duckbill, Crow } from './creatures';
import { Blur, DofDefs, SkyR, Jungle, FernsFg, Mosquitoes, Fireflies, Eyes, Coast, Splash, NestTown, Field, Egg, Bedroom, BedCover, Kitchen, Space, Cycad, Magnolia, Fern, Volcano, Nest } from './world';
import { Stamp, ImpactG, ThirteenG, DeclineG, GreenhouseG, ScalesG, NoWhalesG, PurgG, SmallG, DinoAG, DinoBG, ChicxG, BirdTreeG, NeuronG } from './dgraphics';
import MOUTH from './mouth.json';

/* ---------- frame (NEW ep07: risograph misregistration — the ink layer prints a second time in pink, offset) ---------- */
export type Cam = { x?: number; y?: number; z?: number; r?: number };
export const Frame: React.FC<{ children: React.ReactNode; cam?: Cam; boil?: number; ui?: React.ReactNode; riso?: number }> = ({ children, cam = {}, boil = 2.4, ui, riso = 1 }) => {
  const f = useCurrentFrame();
  const { x = 960, y = 540, z = 1, r = 0 } = cam;
  const jx = 4 + Math.sin(f * .07) * 1.5, jy = 3 + Math.cos(f * .05) * 1.2;
  return <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <Boil id="boil" frame={f} scale={boil} />
      <DofDefs />
      <filter id="sil" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .05  0 0 0 0 .06  0 0 0 0 .14  0 0 0 1 0" /></filter>
      <filter id="riso" filterUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080} colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values={`0 0 0 0 1  0 0 0 0 .31  0 0 0 0 .6  -1.15 -1.15 -1.15 0 ${.85 * riso}`} result="ink" />
        <feOffset in="ink" dx={jx} dy={jy} result="off" />
        <feBlend in="off" in2="SourceGraphic" mode="multiply" />
      </filter>
    </defs>
    <g filter={riso && !((globalThis as any).__OFF || '').includes('riso') ? 'url(#riso)' : undefined}><g transform={`translate(960 540) rotate(${r}) scale(${z}) translate(${-x} ${-y})`}>{children}</g></g>
    {ui}
  </svg>;
};
/* ep07: line boil dropped (render cost x2, profiled); the riso plate jitter keeps the lines alive instead */
export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <g>{children}</g>;

/* ---------- speech + acting ---------- */
const M: Record<string, number[]> = MOUTH as any;
const lineAt = (T: number) => (LINES as any[]).find((l) => T >= l.start - .05 && T < l.end + .05);
export const mouthOf = (spk: string, T: number) => { const a = M[spk]; if (!a) return 0; const i = Math.round(T * FPS); return a[i] || 0; };
const SPK: Record<string, string> = { you: 'YOU', youPJ: 'YOU', doc: 'DOC' };
const blinkAt = (T: number, s: number) => ((T + s * 1.7) % 3.9) < .12 ? 1 : 0;
const autoExpr = (text: string): string | null => /!$/.test(text) ? 'excited' : /\?$/.test(text) ? 'surprised' : null;
const HX: Record<string, Expr> = { scared: 'worried' };
const hx = (e: string): Expr => (HX[e] ?? e) as Expr;
type Gest = 'point' | 'fist' | 'count' | null;
const gestOf = (text: string): Gest => /\b(Look|That's|There|See|Watch|that)\b/.test(text) && /\?|!|\.$/.test(text) && /\b(Look|That's|There|See|Watch)\b/.test(text) ? 'point'
  : /\b(run|Run|Left|Up|grab|Breathe|move)\b/.test(text) && /!/.test(text) ? 'fist'
  : /\b(three|ten|thirteen|hundred|eleven|seventy|sixty-six|two|million|one)\b/i.test(text) ? 'count' : null;
const humanGest = (g: Gest, k: number): MPose | null => g === 'point' ? { armF: -1.55, elbowF: .1 } : g === 'fist' ? { armF: -2.5 + Math.sin(k * 6) * .15, elbowF: .5 } : g === 'count' ? { armF: -1.2, elbowF: 1.4 + Math.sin(k * 5) * .2 } : null;
export type St = { open: number; ex: any; blink: number; lookX: number; speaking: boolean; gest: Gest; k: number; arm: number };

export type Actor = { k: string | MLook; id?: string; x: number | ((T: number, t: number) => number); y: number | ((T: number, t: number) => number); s?: number; flip?: boolean | ((T: number, t: number) => boolean); age?: number; p?: MPose | ((T: number, t: number) => MPose); still?: boolean; o?: number | ((T: number, t: number) => number); spk?: string; sleep?: boolean; e?: string; sil?: boolean; hh?: number; rot?: number | ((T: number, t: number) => number);
  c?: (T: number, t: number, st: St, x: number, y: number, flip: boolean) => React.ReactNode };
const val = <V,>(v: V | ((T: number, t: number) => V), T: number, t: number): V => typeof v === 'function' ? (v as any)(T, t) : v;
const ActorEl: React.FC<{ a: Actor; T: number; t: number; i: number; all: Actor[]; ex?: Record<string, Record<string, string>> }> = ({ a, T, t, i, all, ex }) => {
  const key = typeof a.k === 'string' ? a.k : ''; const spk = a.spk ?? SPK[key]; const id = a.id ?? key;
  const x = val(a.x, T, t), y = val(a.y, T, t), flip = val(a.flip ?? false, T, t);
  const ln = lineAt(T); const speaking = !!(spk && ln && ln.speaker === spk);
  const m = spk ? mouthOf(spk, T) : 0; const lex = ln && ex?.[ln.key]?.[id];
  let lookX = 0;
  if (!speaking && ln && ln.speaker !== 'NARR' && !a.sleep) {
    const sp = all.find((o) => (o.spk ?? SPK[typeof o.k === 'string' ? o.k : '']) === ln.speaker);
    if (sp && sp !== a) { const dx = val(sp.x, T, t) - x; lookX = (dx > 0 ? 1 : -1) * (flip ? -1 : 1) * .9; }
  }
  if (a.c) {
    const g = speaking ? gestOf(ln.text) : null; const k = ln ? T - ln.start : 0;
    const st: St = { open: speaking ? m : 0, ex: (speaking ? lex || autoExpr(ln.text) || a.e || 'happy' : lex || a.e || 'neutral'), blink: a.sleep ? 1 : blinkAt(T, i), lookX, speaking, gest: g, k,
      arm: speaking ? (g === 'point' ? 1 : g === 'fist' ? 1.6 + Math.sin(k * 6) * .2 : g === 'count' ? .7 + Math.sin(k * 5) * .15 : .35 + Math.sin(T * 2.3 + i) * .25) : 0 };
    const el = a.c(T, t, st, x, y, flip);
    return <g opacity={val(a.o ?? 1, T, t)}>{a.sil ? <g filter="url(#sil)">{el}</g> : el}</g>;
  }
  const look = typeof a.k === 'string' ? CAST[a.k] : a.k;
  const s = a.s ?? 1.2, base: MPose = val(a.p ?? {}, T, t);
  const pose: MPose = { blink: a.sleep ? 1 : blinkAt(T, i), bob: Math.sin(T * 1.6 + i) * 2, expr: hx(a.e ?? 'neutral'), ...base };
  if (base.expr) pose.expr = hx(base.expr as any);
  if (speaking) {
    pose.mouth = m > .08 ? 'talk' : 'flat'; pose.open = m;
    pose.expr = hx(lex || (base.expr as any) || autoExpr(ln.text) || a.e || 'happy');
    if (!a.still) {
      const g = !base.holdF || base.holdF === 'none' ? humanGest(gestOf(ln.text), T - ln.start) : null;
      if (g) Object.assign(pose, g);
      else { const sitF = base.sit ? .5 : 1; pose.armF = (base.armF ?? -.7) + Math.sin(T * 2.3 + i) * .28 * sitF; pose.elbowF = (base.elbowF ?? 1.1) + Math.sin(T * 3.1 + i) * .25; }
      pose.tilt = (base.tilt ?? 0) + Math.sin(T * 1.7) * 2;
    }
  } else {
    if (lex) { pose.expr = hx(lex); if (!base.mouth) pose.mouth = undefined; }
    if (lookX && base.lookX === undefined) pose.lookX = lookX;
  }
  const rot = val(a.rot ?? 0, T, t);
  let el = <MChar look={look} x={x} y={y} s={s} flip={flip} age={a.age ?? 1} opacity={val(a.o ?? 1, T, t)} pose={pose} />;
  if (rot) el = <g transform={`rotate(${rot} ${x} ${y})`}>{el}</g>;
  return a.sil ? <g filter="url(#sil)">{el}</g> : el;
};

/* ---------- dialogue scene with automatic coverage ---------- */
type CamV = Cam | 'wide' | 'two' | ((T: number, t: number) => Cam);
export type Scene = { a: number; b: number; bg: (T: number, t: number) => React.ReactNode; actors: Actor[]; fg?: (T: number, t: number) => React.ReactNode; ui?: (T: number, t: number) => React.ReactNode; wide?: Cam; cams?: Record<string, CamV>; zcu?: number; boil?: number; cam?: (T: number, t: number) => Cam; ex?: Record<string, Record<string, string>>; mid?: (T: number, t: number) => React.ReactNode; shake?: (T: number, t: number) => number };
const fit = (c: Required<Cam>): Cam => { const hw = 960 / c.z, hh = 540 / c.z; return { ...c, x: clamp(c.x, hw - 200, 2120 - hw), y: clamp(c.y, hh - 150, 1230 - hh) }; };
const headH = (a: Actor) => a.hh ?? 250 * (a.s ?? 1.2);
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
  const bp = (A.c ? {} : val(A.p ?? {}, T, T - sc.a)) as MPose; const sitting = !!bp.sit;
  const ay = val(A.y, T, T - sc.a) - (sitting ? 60 * as : 0);
  const dl = ls.slice(0, li + 1).filter((l) => l.speaker !== 'NARR').length;
  const others = sc.actors.filter((o) => o !== A && !(o.o === 0) && !o.sil);
  const near = others.sort((p, q) => Math.abs(val(p.x, T, 0) - ax) - Math.abs(val(q.x, T, 0) - ax))[0];
  const hh = headH(A);
  if (ov === 'two' || (dl % 3 === 0 && near)) {
    const nx = near ? val(near.x, T, 0) : ax; const cx = (ax + nx) / 2, span = Math.abs(ax - nx) + 520 * Math.max(as, .9);
    const z = clamp(1920 / span, 1, 1.7);
    return fit({ x: cx, y: ay - hh * .8, z: z * push, r: 0 });
  }
  const z = clamp((sc.zcu ?? 2.05) * 300 / Math.max(hh, 120), 1.25, 2.7);
  const dir = near ? Math.sign(val(near.x, T, 0) - ax) : 0;
  return fit({ x: ax + dir * 230 / z, y: ay - hh + 120 / z, z: z * push, r: 0 });
};
export const SceneShot: React.FC<{ sc: Scene; T: number }> = ({ sc, T }) => {
  const t = T - sc.a; const c = camFor(sc, T); const sh = sc.shake ? sc.shake(T, t) : 0;
  const cam = sh ? { ...c, x: (c.x ?? 960) + Math.sin(T * 47) * sh * 14, y: (c.y ?? 540) + Math.cos(T * 53) * sh * 10, r: (c.r ?? 0) + Math.sin(T * 31) * sh * .6 } : c;
  return <Frame cam={cam} boil={sc.boil} ui={sc.ui?.(T, t)}>
    {sc.bg(T, t)}
    {sc.mid?.(T, t)}
    <B>{sc.actors.map((a, i) => <ActorEl key={i} a={a} T={T} t={t} i={i} all={sc.actors} ex={sc.ex} />)}</B>
    {sc.fg?.(T, t)}
  </Frame>;
};
export const Gfx: React.FC<{ C: React.FC<any>; T: number; a: number; b: number }> = ({ C: G, T, a, b }) => {
  const t = T - a, d = b - a;
  return <Frame cam={{ x: 960, y: 540, z: 1.0 + .05 * (t / d) }} boil={1.2} riso={.8}><B><G t={t} T={T} d={d} /></B></Frame>;
};

/* ---------- helpers ---------- */
const S = (k: string) => (LINES as any[]).find((l) => l.key === k)!.start;
const E = (k: string) => (LINES as any[]).find((l) => l.key === k)!.end;
const Y = 930;
const walkTo = (x0: number, x1: number, t0: number, dur: number) => (T: number, t: number) => lerp(x0, x1, easeInOut(prog(t, t0, t0 + dur)));
const walkP = (t0: number, dur: number, extraP: MPose = {}) => (T: number, t: number): MPose => ({ ...extraP, walk: t > t0 && t < t0 + dur ? 1 : 0, phase: t * 9 });
const stamp = (kind: 'MYTH' | 'EVIDENCE' | 'MAYBE', at: number, dur: number, sub?: string, x = 1600, y = 180) => (T: number) => T > at - .1 && T < at + dur ? <g opacity={1 - prog(T, at + dur - .4, at + dur)}><Stamp kind={kind} p={prog(T, at, at + .5)} x={x} y={y} s={.85} sub={sub} /></g> : null;
const hitShake = (times: number[], amp = 1) => (T: number) => times.reduce((m, h) => Math.max(m, T >= h ? amp * Math.exp(-(T - h) * 5) : 0), 0);

/* creature actors */
type TP = (T: number, t: number, st: St) => TroodPose;
const trood = (x: Actor['x'], y: Actor['y'], o: { s?: number; flip?: Actor['flip']; p?: TP; e?: string } = {}): Actor => {
  const s = o.s ?? .95;
  return { k: '-', id: 'trood', spk: 'TROOD', x, y, s, hh: 430 * s, flip: o.flip, e: o.e,
    c: (T, t, st, X, Yy, F) => { const extra = o.p ? o.p(T, t, st) : {}; return <Trood x={X} y={Yy} s={s} flip={F} p={{ ph: T * 1.2, open: st.open, ex: st.ex, blink: st.blink, lookX: st.lookX * .6, arm: st.arm, point: st.gest === 'point', tilt: st.speaking ? Math.sin(T * 1.7) * 2 : 0, ...extra }} />; } };
};
const pip = (x: Actor['x'], y: Actor['y'], o: { s?: number; flip?: Actor['flip']; hop?: (T: number, t: number) => number; e?: string } = {}): Actor => {
  const s = o.s ?? .8;
  return { k: '-', id: 'pip', spk: 'PIP', x, y, s, hh: 130 * s, flip: o.flip, e: o.e ?? 'happy',
    c: (T, t, st, X, Yy, F) => <Pip x={X} y={Yy} s={s} flip={F} open={st.open} ex={st.ex} blink={st.blink} ph={T * 8} hop={(o.hop ? o.hop(T, t) : 0) + (st.speaking ? .3 : 0)} /> };
};
const crow = (x: number, y: number, s = .7, flip = false): Actor => ({ k: '-', id: 'crow', spk: 'CROW', x, y, s, hh: 120 * s, flip,
  c: (T, t, st, X, Yy, F) => <Crow x={X} y={Yy} s={s} flip={F} open={st.open} ph={T * (st.speaking ? 8 : 1.5)} blink={st.blink} /> });
const breath = (x: number, y: number, T: number, dir = -1) => <g>{[0, 1, 2].map((k) => { const p = ((T * .55 + k / 3) % 1); return <circle key={k} cx={x + dir * p * 120} cy={y + p * 30} r={10 + p * 40} fill="#fff" opacity={(1 - p) * .55 * (((T * .55) % 1) < .5 ? 1 : .4)} />; })}</g>;

type Item = { a: number; b: number; g?: boolean; render: (T: number) => React.ReactNode };
const scenes: Item[] = [];
const sc = (s: Omit<Scene, 'b'> & { b?: number }) => scenes.push({ a: s.a, b: s.b ?? -1, render: (T) => <SceneShot sc={{ ...s, b: s.b ?? (scenes.find((x) => x.a === s.a)!.b) } as Scene} T={T} /> });
const gfx = (G: React.FC<any>, a: number) => scenes.push({ a, b: -1, g: true, render: (T) => <Gfx C={G} T={T} a={a} b={scenes.find((x) => x.a === a)!.b} /> });

/* ====================== HOOK ====================== */
const lying = (t0: number, t1: number) => (T: number, t: number) => lerp(-90, -90, prog(t, t0, t1));
sc({ a: 0, bg: (T) => <Jungle T={T} px={0} dense={1.2} />,
  mid: (T, t) => <B><Theropod x={1420} y={1120} s={1.1} flip head={36 + Math.sin(T * 1.1) * 3} breathe={T * 3.4} jaw={t > 2.6 && t < 3.2 ? .3 : .04} ex={t > 8.5 ? 'thinking' : 'neutral'} blink={blinkAt(T, 4)} lookX={t > 8.5 ? -1 : 0} />{breath(760, 780, T, -1)}</B>,
  fg: (T) => <FernsFg T={T} />,
  cams: { o1: (T, t) => ({ x: lerp(560, 960, easeInOut(prog(t, 2.2, 4.4))), y: lerp(820, 560, easeInOut(prog(t, 2.2, 4.4))), z: lerp(2.6, 1.05, easeInOut(prog(t, 2.2, 4.4))) }),
    o2: (T, t) => ({ x: 600, y: 770, z: 2.2 + t * .04 }), o3: (T, t) => ({ x: lerp(560, 360, easeInOut(t / 1.4)), y: 600, z: 1.7 }) },
  shake: hitShake([S('o2') + .05], .5),
  actors: [{ k: 'you', x: 950, y: 905, s: 1.2, rot: -90, p: (T, t) => ({ blink: t < 1.4 ? 1 : blinkAt(T, 2), lookY: -.8, lookX: .4, armF: .1 + (t > 4.8 ? Math.sin(T * 8) * .06 : 0) }), e: 'scared' },
    trood(walkTo(-150, 320, 8.0, 1.2), Y, { p: (T, t) => ({ walk: t > 8 && t < 9.2 ? 1 : 0, ph: t * 7 }) })],
  ex: { o1: { you: 'neutral' }, o2: { you: 'scared' }, o3: { trood: 'happy', you: 'scared' } } });
sc({ a: S('o4'), bg: (T, t) => <Space T={T} p={easeInOut(prog(t, .4, 6.8))} />, cam: (T, t) => ({ x: lerp(900, 1040, t / 6), y: 560, z: lerp(1.15, 1.0, t / 6) }), boil: 1, actors: [] });
sc({ a: S('o4') + 6.4, bg: (T) => <Jungle T={T} px={(T - S('o4')) * 10} />,
  mid: (T, t) => <B><Theropod x={lerp(1450, 2100, t / 6)} y={880} s={.62} ph={t * 3.2} walk={1} ex="neutral" /></B>, fg: (T) => <FernsFg T={T} />,
  cam: (T, t) => ({ x: lerp(760, 960, t / 4), y: 560, z: lerp(1.25, 1.1, t / 4) }),
  actors: [{ k: 'you', x: 760, y: Y, s: 1.2, e: 'scared', p: { lookX: 1 } }, trood(1030, Y, { flip: true, e: 'happy' })] });

/* ====================== THE MISS ====================== */
sc({ a: S('m1'), bg: (T, t) => <Jungle T={T} px={200} />, mid: (T, t) => <B><Theropod x={lerp(1900, 1500, t / 16)} y={850} s={.38} ph={t * 3} walk={1} flip /></B>, fg: (T) => <FernsFg T={T} />,
  wide: { x: 960, y: 560, z: 1.1 },
  actors: [{ k: 'you', x: 760, y: Y, s: 1.2, e: 'surprised' }, trood(1180, Y, { flip: true })],
  ex: { m1: { you: 'surprised' }, m2: { trood: 'happy', you: 'surprised' }, m3: { you: 'thinking' }, m4: { trood: 'surprised' } } });
gfx(ImpactG, S('m5'));
sc({ a: S('m6'), bg: (T) => <Jungle T={T} px={600} volcano={false} />, fg: (T) => <FernsFg T={T} />, wide: { x: 960, y: 560, z: 1.1 },
  cams: { m6: (T, t) => ({ x: lerp(820, 900, t / 11), y: lerp(600, 560, t / 11), z: lerp(1.9, 1.45, t / 11) }) },
  mid: (T, t) => <g transform="translate(980 940)" opacity={.85}><path d={`M -120 0 Q 0 -30 140 0`} stroke={P.ink} strokeWidth={5} fill="none" strokeDasharray={`${clamp(t / 4) * 300} 300`} /><circle cx={60} cy={-6} r={24 * clamp(t / 5)} fill="none" stroke={P.ink} strokeWidth={5} /></g>,
  actors: [{ k: 'you', x: 760, y: Y, s: 1.2, e: 'excited' }, trood(1180, Y, { flip: true, e: 'thinking' })],
  ex: { m6: { trood: 'thinking' }, m7: { trood: 'sad' } } });
gfx(ThirteenG, S('m8'));
sc({ a: S('m9'), bg: (T) => <Jungle T={T} px={400} />, fg: (T) => <FernsFg T={T} />, wide: { x: 960, y: 560, z: 1.1 },
  cams: { m10: (T, t) => ({ x: 1120, y: 560, z: 1.9 }) },
  actors: [{ k: 'you', x: 760, y: Y, s: 1.2, e: 'thinking' }, trood(1180, Y, { flip: true, p: (T, t, st) => T > S('m10') ? { arm: 1.3, armB: 1.3, tilt: -4 } : {} })],
  ex: { m9: { trood: 'surprised' }, m10: { trood: 'angry', you: 'happy' } } });
gfx(DeclineG, S('m11'));

/* ====================== GREENHOUSE WORLD ====================== */
sc({ a: S('w1'), bg: (T, t) => <Jungle T={T} px={t * 150} />, fg: (T, t) => <FernsFg T={T} px={t * 150} />,
  cam: (T, t) => ({ x: lerp(900, 1000, t / 12), y: 580, z: 1.15 + Math.sin(t * .4) * .03 }),
  actors: [{ k: 'you', x: 800, y: Y, s: 1.2, p: (T, t) => ({ walk: 1, phase: t * 8.5 }), e: 'happy' }, trood(1180, Y, { p: (T, t) => ({ walk: 1, ph: t * 8 }) })],
  ex: { w2: { you: 'worried' } } });
gfx(GreenhouseG, S('w4'));
sc({ a: S('w5'), bg: (T) => <Jungle T={T} px={900} tone="day" />, mid: (T) => <Magnolia x={1500} y={960} s={1.4} T={T} />, fg: (T) => <FernsFg T={T} />,
  wide: { x: 1100, y: 520, z: 1.1 }, cams: { w5: (T, t) => ({ x: lerp(1500, 1200, easeInOut(t / 2.9)), y: lerp(300, 480, easeInOut(t / 2.9)), z: 1.6 }) },
  actors: [{ k: 'you', x: 1120, y: Y, s: 1.2, p: { lookY: -.6, lookX: 1 }, e: 'excited' }, trood(760, Y, { e: 'happy' })],
  ex: { w6: { you: 'happy' } } });
sc({ a: S('w7'), bg: (T) => <Jungle T={T} px={1100} />, fg: (T, t) => <><Mosquitoes T={T} cx={820} cy={600} n={7} /><FernsFg T={T} /></>,
  wide: { x: 960, y: 560, z: 1.15 }, shake: hitShake([S('w7') + 1.6], .35),
  actors: [{ k: 'you', x: 800, y: Y, s: 1.2, p: (T, t) => t > 1.4 && t < 2.2 ? { armF: -1.6, elbowF: 1.6 } : t > 2.2 && t < 6 ? { armF: -.4 + Math.sin(T * 9) * .3, elbowF: 1.8 } : {}, e: 'worried' }, trood(1200, Y, { flip: true, e: 'happy' })],
  ex: { w8: { trood: 'laugh', you: 'worried' } } });

/* ====================== THE LOCALS ====================== */
const rexAt = (t: number) => lerp(1700, 1420, easeInOut(prog(t, 0, 3)));
sc({ a: S('l1'), bg: (T) => <Jungle T={T} px={300} dense={.8} />,
  mid: (T, t) => <B><Theropod x={rexAt(t)} y={900} s={.82} flip ph={t * 3} walk={t < 3 ? 1 : 0} jaw={T > S('l3c') - .3 && T < S('l3c') + 1.4 ? .9 : (t > .2 && t < 1.6 ? .85 : .06)} breathe={T * 2} ex={T > S('l3c') - .3 ? 'angry' : 'neutral'} blink={blinkAt(T, 3)} head={t > .2 && t < 1.6 ? -12 : 0} /></B>,
  fg: (T) => <FernsFg T={T} />, wide: { x: 960, y: 500, z: 1.0 }, shake: hitShake([S('l1') + .3, S('l3c') - .2], .8),
  cams: { l1: (T, t) => ({ x: lerp(1300, 900, easeInOut(prog(t, 0, 2.4))), y: lerp(300, 520, easeInOut(prog(t, 0, 2.4))), z: lerp(1.5, 1.0, easeInOut(prog(t, 0, 2.4))) }),
    l3c: (T, t) => ({ x: 1000, y: 330, z: 1.9 }) },
  actors: [{ k: 'you', x: 420, y: Y, s: 1.2, e: 'excited' }, trood(700, Y, { e: 'thinking' })],
  ex: { l1: { you: 'excited', trood: 'worried' }, l2: { you: 'surprised' }, l3c: { you: 'scared', trood: 'happy' } } });
sc({ a: S('l4'), bg: (T) => <Jungle T={T} px={700} />,
  mid: (T, t) => <B><Theropod x={1550} y={890} s={.7} flip breathe={T * 2} ph={0} />{[0, 1, 2].map((k) => <Theropod key={k} x={1000 + k * 170} y={930 - Math.abs(Math.sin(T * 5 + k)) * 20} s={.2} flip={k !== 1} fluff ex="happy" ph={T * 6 + k} walk={.6} blink={blinkAt(T, k)} />)}</B>,
  fg: (T) => <FernsFg T={T} />, wide: { x: 960, y: 560, z: 1.05 },
  cams: { l4: (T, t) => ({ x: lerp(1150, 860, easeInOut(prog(t, 3, 7))), y: lerp(780, 600, easeInOut(prog(t, 3, 7))), z: lerp(2.0, 1.25, easeInOut(prog(t, 3, 7))) }) },
  actors: [{ k: 'you', x: 420, y: Y, s: 1.2, e: 'happy' }, trood(660, Y, { e: 'happy' })] });
gfx(ScalesG, S('l5'));
const pteroX = (t: number) => t < 4.5 ? lerp(-500, 1450, easeOut(prog(t, 0, 4.5))) : 1450;
sc({ a: S('l5b'), bg: (T) => <Jungle T={T} px={1000} />,
  mid: (T, t) => <B><Ptero x={pteroX(t)} y={t < 4.5 ? lerp(160, 700, easeIn(prog(t, 1, 4.5))) : 700} s={t < 4.5 ? .7 : .7} ph={T * (t < 4.5 ? 5 : .5)} flap={t < 4.5 ? 1 : .15} /></B>,
  fg: (T) => <FernsFg T={T} />, wide: { x: 960, y: 520, z: 1.0 },
  cams: { l5b: (T, t) => ({ x: lerp(600, 900, t / 2), y: 420, z: 1.3 }), l5c: (T, t) => ({ x: lerp(1000, 1150, t / 5), y: lerp(520, 600, t / 5), z: 1.15 }) },
  actors: [{ k: 'you', x: 520, y: Y, s: 1.2, p: { lookY: -.8, lookX: 1 }, e: 'surprised' }, trood(820, Y, { p: () => ({ lookY: -.4 }) })] });
sc({ a: S('l6'), bg: (T, t) => <><SkyR tone="day" T={T} /><Volcano x={1500} y={780} s={.9} T={T} />{[0, 1, 2, 3].map((k) => <Sauropod key={k} x={lerp(-600 - k * 500, 2600 - k * 500, t / 14)} y={800 + (k % 2) * 30} s={.42 - (k % 2) * .06} ph={t * 3 + k} c={k % 2 ? R.greenD : R.green} />)}<Jungle T={T} px={0} volcano={false} dense={.0001} sky={false} /></>,
  mid: (T) => <Cycad x={1000} y={940} s={1.4} T={T} />, fg: (T) => <FernsFg T={T} />,
  wide: { x: 960, y: 540, z: 1.0 }, shake: (T, t) => .2 + .15 * Math.max(0, Math.sin(T * 4.2)) ** 6,
  actors: [{ k: 'you', x: walkTo(700, 900, 4.5, 1), y: Y, s: 1.2, p: walkP(4.5, 1), e: 'scared' }, trood(walkTo(500, 1080, 3.5, 1.2), Y, { flip: (T, t) => t > 4.7, p: (T, t) => ({ walk: t > 3.5 && t < 4.7 ? 1 : 0, ph: t * 8 }) })],
  ex: { l7: { trood: 'worried', you: 'scared' } } });
/* hack: the jungle in l6 sits in front of the herd — the herd walks behind the tree line */

/* ====================== THE SEA ====================== */
sc({ a: S('s1'), bg: (T) => <Coast T={T} />, wide: { x: 960, y: 560, z: 1.0 },
  cams: { s1: (T, t) => ({ x: lerp(500, 960, easeInOut(t / 6.9)), y: lerp(400, 560, t / 6.9), z: lerp(1.3, 1.05, t / 6.9) }) },
  actors: [{ k: 'you', x: walkTo(-400, 760, 0, 5), y: 1000, s: 1.2, p: walkP(0, 5), e: 'happy' }, trood(walkTo(200, 1120, 0, 5.4), 1000, { p: (T, t) => ({ walk: t < 5.4 ? 1 : 0, ph: t * 8 }) })],
  ex: { s2: { you: 'excited' }, s3: { trood: 'thinking' } } });
sc({ a: S('s4'), bg: (T, t) => <Coast T={T} />,
  mid: (T, t) => { const p = prog(t, .6, 3.6); const up = Math.sin(p * Math.PI); return <><B><g opacity={p > 0 && p < 1 ? 1 : 0}><Mosa x={lerp(700, 1500, p)} y={900 - up * 520} s={.95} rot={lerp(-40, 40, p)} open={up} /></g></B><Splash x={700} y={700} p={prog(t, .5, 2)} s={1.3} /><Splash x={1500} y={700} p={prog(t, 3.5, 5)} s={1.5} /></>; },
  shake: hitShake([S('s4') + .6, S('s4') + 3.6], 1),
  cam: (T, t) => ({ x: lerp(900, 1100, t / 10), y: lerp(560, 520, t / 10), z: lerp(1.0, 1.08, t / 10) }),
  actors: [{ k: 'you', x: 520, y: 1000, s: 1.15, e: 'scared', p: (T, t) => ({ lookX: 1, lookY: -.4, armF: -2.2, elbowF: .4 }) }, trood(300, 1000, { e: 'happy' })] });
sc({ a: S('s5'), bg: (T, t) => <Coast T={T} fin={prog(t, 0, 9)} />, wide: { x: 960, y: 580, z: 1.1 },
  actors: [{ k: 'you', x: 760, y: 1000, s: 1.2, e: 'worried' }, trood(1150, 1000, { flip: true })],
  ex: { s5b: { you: 'scared' }, s6: { trood: 'laugh', you: 'happy' } } });
gfx(NoWhalesG, S('s7'));

/* ====================== THE MAMMALS ====================== */
sc({ a: S('p1'), bg: (T) => <Jungle T={T} px={1400} />, fg: (T) => <FernsFg T={T} />,
  mid: (T) => <g><ellipse cx={1040} cy={945} rx={70} ry={18} fill="#3a2414" /></g>,
  wide: { x: 960, y: 560, z: 1.1 },
  cams: { p2: (T, t) => ({ x: 1040, y: 830, z: 2.6 }), p4: (T, t) => ({ x: lerp(1040, 960, t / 7), y: lerp(840, 760, t / 7), z: lerp(2.5, 1.9, t / 7) }) },
  actors: [{ k: 'you', x: 820, y: Y, s: 1.2, e: 'thinking', p: (T, t) => T > S('p2') ? { lookY: .8, lookX: 1 } : {} }, trood(1300, Y, { flip: true, e: 'happy' }),
    pip(1040, (T, t) => T < S('p2') ? 1010 : lerp(1010, 950, easeOut(prog(T, S('p2'), S('p2') + .4))), { hop: (T) => T > S('p2') && T < S('p2') + 1 ? 1 : 0 })],
  ex: { p1: { you: 'worried' }, p3: { you: 'surprised' } } });
gfx(PurgG, S('p5'));
sc({ a: S('p6'), bg: (T) => <Jungle T={T} px={1600} />, fg: (T) => <FernsFg T={T} />,
  mid: (T, t) => <><rect x={900} y={870} width={320} height={60} rx={30} fill={R.brown} stroke={P.ink} strokeWidth={6} />{T > S('p7') + 4 && <g opacity={.35}><B><Theropod x={lerp(2500, 1900, prog(T, S('p7') + 4, S('p7') + 5.5))} y={900} s={.9} flip jaw={.8} /></B></g>}</>,
  wide: { x: 960, y: 640, z: 1.35 },
  actors: [{ k: 'you', x: 780, y: Y, s: 1.2, p: { crouch: 1, lookY: .6, lookX: 1 }, e: 'happy' }, pip(1080, 880, { flip: true })],
  ex: { p6: { you: 'excited' }, p7: { pip: 'laugh' } } });
gfx(SmallG, S('p8'));

/* ====================== THE MINDS ====================== */
sc({ a: S('i1'), bg: (T, t) => <NestTown T={T} px={t * 20} />, wide: { x: 960, y: 520, z: 1.0 },
  cams: { i1: (T, t) => ({ x: 960, y: lerp(820, 380, easeInOut(prog(t, 0, 3))), z: lerp(1.6, 1.0, easeInOut(prog(t, 0, 3))) }), i2: (T, t) => ({ x: lerp(1000, 900, t / 4), y: lerp(380, 520, t / 4), z: 1.05 }) },
  actors: [{ k: 'you', x: 820, y: Y, s: 1.2, p: { lookY: -.8 }, e: 'surprised' }, trood(1120, Y, { flip: true, e: 'happy' })] });
gfx(DinoAG, S('i3'));
sc({ a: S('i4'), bg: (T, t) => <NestTown T={T} px={300} />, wide: { x: 960, y: 560, z: 1.1 },
  cams: { i5: (T, t) => t > 4.2 ? { x: lerp(1100, 1250, prog(t, 4.2, 6)), y: 640, z: 1.5 } : { x: 1150, y: 560, z: 1.8 } },
  actors: [{ k: 'you', x: 760, y: Y, s: 1.2, e: 'thinking' }, trood(1180, Y, { flip: (T, t) => !(T > S('i5') + 4 && T < S('i5') + 6), p: (T, t) => T > S('i5') + 4 && T < S('i5') + 6.2 ? { ph: T * 6, tilt: Math.sin(T * 5) * 3 } : {} })],
  ex: { i4: { you: 'thinking' }, i5: { trood: 'happy' } } });
gfx(DinoBG, S('i6'));
sc({ a: S('i7'), bg: (T) => <NestTown T={T} px={600} tone="dusk" />, mid: (T) => <rect x={600} y={880} width={600} height={56} rx={28} fill={R.brown} stroke={P.ink} strokeWidth={6} />,
  wide: { x: 960, y: 600, z: 1.2 },
  actors: [{ k: 'you', x: 760, y: 935, s: 1.2, p: { sit: 1 }, e: 'thinking' }, trood(1120, Y, { flip: true, e: 'thinking' })],
  ex: { i7: { you: 'thinking' }, i8: { trood: 'surprised' }, i9: { you: 'sad', trood: 'thinking' } },
  cams: { i9: (T, t) => ({ x: lerp(1000, 940, t / 4), y: 580, z: lerp(1.3, 1.5, t / 4) }) } });
sc({ a: S('i10'), bg: (T) => <Field T={T} />,
  mid: (T, t) => <B>{[0, 1, 2, 3, 4].map((k) => <Duckbill key={k} x={lerp(300 + k * 360, 500 + k * 360, t / 18)} y={760 + (k % 2) * 40} s={.38 + (k % 2) * .05} ph={t * 3 + k} walk={1} c={k % 2 ? R.orange : '#ff9a5a'} />)}
    <Trood x={lerp(-100, 300, t / 18)} y={790} s={.45} p={{ walk: 1, ph: t * 7, arm: .8 }} />
    <Egg x={1500} y={1000} s={1.1} /><Egg x={1610} y={1010} s={.9} c="#ffd8a0" /><Egg x={1400} y={1015} s={.85} c="#ffb0c8" /></B>,
  wide: { x: 960, y: 560, z: 1.0 },
  cams: { i10: (T, t) => ({ x: lerp(700, 1100, easeInOut(t / 9)), y: 560, z: lerp(1.25, 1.05, t / 9) }), i12: (T, t) => t > 2.4 ? { x: 1500, y: 880, z: 2.1 } : { x: 1200, y: 640, z: 1.6 }, i13: (T, t) => ({ x: 1300, y: 640, z: 1.6 }) },
  actors: [{ k: 'you', x: 1180, y: 1000, s: 1.2, e: 'surprised' }, trood(1800, 1000, { flip: true, e: 'happy' })],
  ex: { i12: { you: 'surprised' }, i13: { you: 'laugh', trood: 'laugh' } } });

/* ====================== DANGER ====================== */
sc({ a: S('d1'), bg: (T) => <NestTown T={T} px={900} tone="dusk" />, mid: (T) => <rect x={560} y={880} width={680} height={56} rx={28} fill={R.brown} stroke={P.ink} strokeWidth={6} />,
  wide: { x: 960, y: 600, z: 1.15 },
  actors: [{ k: 'you', x: 820, y: 935, s: 1.2, p: { sit: 1 }, e: 'thinking' }, trood(1220, Y, { flip: true, e: 'thinking' }), pip(620, 880, {})],
  ex: { d2: { trood: 'happy', you: 'worried' }, d3: { you: 'thinking' }, d4: { trood: 'worried' }, d5: { pip: 'excited' }, d6: { you: 'laugh' } } });
const raptorsMid = (T: number, t: number, o = 1) => <g opacity={o}>{[0, 1, 2].map((k) => <g key={k} filter="url(#sil)"><Raptor x={((t * 140 + k * 700) % 2600) - 300} y={820 + k * 12} s={.6} ph={T * 8 + k} run={1} flip={k % 2 === 1} /></g>)}</g>;
sc({ a: S('d7'), bg: (T) => <Jungle T={T} tone="night" px={1200} />,
  mid: (T, t) => <><Fireflies T={T} n={30} />{raptorsMid(T, t, .9)}<Eyes T={T} pts={[[300, 640], [1650, 600], [1420, 700], [180, 760]]} o={clamp((t - 1) * .5)} /></>,
  fg: (T) => <FernsFg T={T} night />, wide: { x: 960, y: 580, z: 1.1 },
  cams: { d7: (T, t) => ({ x: lerp(400, 1200, easeInOut(t / 5.7)), y: 600, z: 1.35 }), d9: (T, t) => ({ x: 1030, y: 640, z: 2.2 }) },
  actors: [{ k: 'you', x: 880, y: Y, s: 1.2, p: { crouch: 1 }, e: 'scared' }, pip(950, (T) => 760 + Math.sin(T * 30) * 2, { s: .5, e: 'scared' }), trood(1200, Y, { flip: true, e: 'worried', p: () => ({ crouch: .6 }) })],
  ex: { d8: { trood: 'worried', you: 'scared' }, d10: { you: 'scared' } } });
sc({ a: S('d11'), bg: (T, t) => <Jungle T={T} tone="night" px={t < 1.5 ? 1200 : 1200 + (t - 1.5) * 700} />,
  mid: (T, t) => t > 1.5 ? <B>{[0, 1, 2].map((k) => <Raptor key={k} x={lerp(-500 - k * 160, 380 - k * 150, easeOut(prog(t, 1.5, 4))) + Math.sin(T * 2 + k) * 40} y={Y + k * 10} s={.85 - k * .08} ph={T * 14 + k} run={1} eyeGlow />)}</B> : <Eyes T={T} pts={[[300, 700], [520, 690]]} />,
  fg: (T, t) => <FernsFg T={T} night px={t < 1.5 ? 0 : (t - 1.5) * 700} />,
  shake: (T, t) => t > 1.5 ? .25 : 0,
  cam: (T, t) => t < 1.5 ? { x: 1000, y: 640, z: 1.9 } : { x: 900 + Math.sin(t * 9) * 6, y: 580, z: 1.12 },
  actors: [{ k: 'you', x: (T, t) => t < 1.5 ? 900 : 860, y: Y, s: 1.2, p: (T, t) => t < 1.5 ? {} : { walk: 1, phase: t * 15, armF: T > S('d15') ? -1.7 : undefined, elbowF: T > S('d15') ? .2 : undefined }, e: 'scared' },
    pip((T, t) => t < 1.5 ? 960 : 900, (T, t) => (t < 1.5 ? 760 : 745) + Math.abs(Math.sin(t * 15)) * -10, { s: .5, e: 'scared' }),
    trood((T, t) => t < 1.5 ? 1200 : lerp(1200, 1320, prog(t, 1.5, 3)), Y, { flip: (T, t) => t < 1.5, e: 'worried', p: (T, t) => t < 1.5 ? {} : { walk: 1, run: 1, ph: t * 15 } })],
  cams: {}, ex: { d11: { trood: 'angry' }, d13: { pip: 'scared' }, d14: { you: 'scared' }, d15: { trood: 'worried' } } });

/* ====================== THE TWIST ====================== */
const bedYou = (T: number) => T < S('t3') - .2;
sc({ a: S('t1'), bg: (T) => <Bedroom T={T} />, fg: (T) => <BedCover off={0} />,
  wide: { x: 960, y: 560, z: 1.05 }, shake: hitShake([S('t3') - .2], .6),
  cams: { t1: (T, t) => ({ x: lerp(600, 900, easeInOut(prog(t, 0, 4))), y: lerp(720, 560, easeInOut(prog(t, 0, 4))), z: lerp(2.0, 1.1, easeInOut(prog(t, 0, 4))) }), t2: { x: 1600, y: 540, z: 2.2 } },
  actors: [{ k: 'youPJ', x: (T) => bedYou(T) ? 700 : 560, y: (T) => bedYou(T) ? 735 : 800, s: 1.2, rot: (T) => bedYou(T) ? -90 : 0, p: (T, t) => bedYou(T) ? { blink: t < 1.5 ? 1 : blinkAt(T, 1) } : { sit: 1 }, e: 'sleepy' },
    crow(1600, 570, .8, true),
    { k: 'doc', x: walkTo(2200, 1180, S('t3b') - S('t1') - .8, 1.4), y: Y, s: 1.2, flip: true, p: (T, t) => ({ walk: t > S('t3b') - S('t1') - .8 && t < S('t3b') - S('t1') + .6 ? 1 : 0, phase: t * 9 }), e: 'happy' }],
  ex: { t3: { youPJ: 'surprised' }, t3c: { youPJ: 'sleepy', doc: 'laugh' } } });
sc({ a: S('t4'), bg: (T) => <Kitchen T={T} />,
  wide: { x: 960, y: 560, z: 1.05 },
  cams: { t4: (T, t) => t < 2.5 ? { x: 1240, y: 420, z: 2.2 } : { x: lerp(1000, 900, t / 7), y: 560, z: 1.25 } },
  actors: [{ k: 'doc', x: 1100, y: Y, s: 1.2, flip: true, p: { holdF: 'teacup', armF: -1.2, elbowF: 1.4 }, e: 'happy' }, { k: 'youPJ', x: 700, y: Y, s: 1.2, e: 'sleepy' }, crow(1240, 450, .6, true)],
  ex: { t5: { youPJ: 'surprised' } } });
gfx(ChicxG, S('t5b'));
sc({ a: S('t5c'), bg: (T) => <Kitchen T={T} />, cam: (T, t) => ({ x: 760, y: 600, z: lerp(1.9, 2.05, t / 2.4) }),
  actors: [{ k: 'doc', x: 1100, y: Y, s: 1.2, flip: true, p: { holdF: 'teacup', armF: -1.2, elbowF: 1.4 }, e: 'happy' }, { k: 'youPJ', x: 700, y: Y, s: 1.2, e: 'sad' }] });
gfx(BirdTreeG, S('t6'));
gfx(NeuronG, S('t7'));
sc({ a: S('t8'), bg: (T) => <Bedroom T={T} />, wide: { x: 1300, y: 540, z: 1.2 },
  cams: { t8: (T, t) => ({ x: lerp(1100, 1350, t / 2.5), y: 540, z: 1.3 }), t9b: { x: 1450, y: 480, z: 1.9 }, t9c: (T, t) => ({ x: 1590, y: 480, z: 2.6 }) },
  actors: [{ k: 'youPJ', x: 1250, y: Y, s: 1.2, e: 'happy', p: { lookX: 1, lookY: -.3 } }, crow(1600, 570, .8, true), { k: 'doc', x: 600, y: Y, s: 1.2, e: 'happy' }],
  ex: { t8: { youPJ: 'thinking' }, t9: { youPJ: 'happy' }, t9b: { youPJ: 'happy' } } });
sc({ a: S('t10'), bg: (T) => <Bedroom T={T} />,
  mid: (T, t) => <g opacity={.35 * clamp((t - .5) * 1.5)} transform="translate(1600 640)"><clipPath id="win"><rect x={-260} y={-480} width={520} height={460} /></clipPath><g clipPath="url(#win)"><Trood x={60} y={130} s={1.0} flip p={{ ex: 'happy', arm: 1.6 + Math.sin(T * 6) * .4, ph: T, blink: blinkAt(T, 7) }} /></g></g>,
  cam: (T, t) => ({ x: lerp(1350, 1500, t / 12), y: lerp(520, 470, t / 12), z: lerp(1.25, 1.5, easeInOut(t / 12)) }),
  actors: [{ k: 'youPJ', x: 1250, y: Y, s: 1.2, e: 'happy', p: { lookX: 1, lookY: -.3 } }, crow(1560, 570, .8, true)] });

// close the list
scenes.sort((p, q) => p.a - q.a);
scenes.forEach((s, i) => { s.b = i < scenes.length - 1 ? scenes[i + 1].a : 9999; });
export const SHOTS = scenes;
