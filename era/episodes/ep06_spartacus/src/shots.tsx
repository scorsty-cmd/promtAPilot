import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P } from './art';
import { MChar, CAST, MLook, MPose, Expr, Horse, Wagon, Bench, legionary, rebel, gladiator, RC } from './chars';
import { F, Sky, Hills, Villa, LudusYard, Cell, Kitchen, Arena, ArenaCrowd, Spark, Cliff, RomanCamp, Crowd, Army, Javelins, Torch, Campfire, Embers, Dust, Smoke, Ship, Coast, DitchWall, Field, AppianWay, PompeiiWall, Colonnade, Snow, Cypress, Palus, WeaponRack } from './sets';
import { Rewind, MapCapua, MapRoute, MapWall, MapAppian, Styles, Diet, Odds, Thumbs, Escaped, Growth, Decimation, Sources, Stamp } from './tgraphics';
import MOUTH from './mouth.json';
import FIGHTS from './fights.json';

/* ---------- frame ---------- */
export type Cam = { x?: number; y?: number; z?: number; r?: number };
export const Frame: React.FC<{ children: React.ReactNode; cam?: Cam; boil?: number; ui?: React.ReactNode }> = ({ children, cam = {}, boil = 2.4, ui }) => {
  const f = useCurrentFrame();
  const { x = 960, y = 540, z = 1, r = 0 } = cam;
  return <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <Boil id="boil" frame={f} scale={boil} />
      <radialGradient id="fireGlow"><stop offset="0" stopColor="#ffc070" stopOpacity=".75" /><stop offset="1" stopColor="#ff9a3b" stopOpacity="0" /></radialGradient>
      <radialGradient id="heroGlow"><stop offset="0" stopColor="#fff2a0" stopOpacity=".7" /><stop offset="1" stopColor="#fff2a0" stopOpacity="0" /></radialGradient>
      <filter id="sil" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .07  0 0 0 0 .04  0 0 0 0 .03  0 0 0 1 0" /></filter>
      {/* NEW in ep06: depth-of-field blur for foreground layers */}
      <filter id="dof" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7" /></filter>
      <filter id="dofS" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>
    <g transform={`translate(960 540) rotate(${r}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
    {ui}
  </svg>;
};
export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <g filter="url(#boil)">{children}</g>;

/* ---------- speech + acting helpers ---------- */
const M: Record<string, number[]> = MOUTH as any;
const lineAt = (T: number) => (LINES as any[]).find((l) => T >= l.start - .05 && T < l.end + .05);
export const mouthOf = (spk: string, T: number) => { const a = M[spk]; if (!a) return 0; const i = Math.round(T * FPS); return a[i] || 0; };
const SPK: Record<string, string> = { you: 'YOU', youGlad: 'YOU', youBare: 'YOU', youReb: 'YOU', spa: 'SPA', spaGlad: 'SPA', spaReb: 'SPA', cri: 'CRI', criGlad: 'CRI', criReb: 'CRI', oen: 'OEN', oenReb: 'OEN', bat: 'BAT', doc: 'DOC', her: 'HER', ref: 'REF', opp: 'OPP', wife: 'WIFE', gla: 'GLA', cra: 'CRA', craWar: 'CRA', pir: 'PIR' };
const blinkAt = (T: number, s: number) => ((T + s * 1.7) % 3.9) < .12 ? 1 : 0;
const autoExpr = (text: string): Expr | null => /!$/.test(text) ? 'excited' : /\?$/.test(text) ? 'surprised' : null;
const gesture = (text: string, T: number, ln: any): MPose | null => {
  const k = T - ln.start;
  if (/\b(Look|Watch|There|Here)\b/.test(text)) return { handF: 'point', armF: -1.55, elbowF: .1 };
  if (/\b(Go|Attack|Now|Strike|Again|Take|Begin|Dig|Stop)\b/.test(text) && /!/.test(text)) return { handF: 'fist', armF: -2.5 + Math.sin(k * 6) * .15, elbowF: .5 };
  if (/\b(one|two|three|ten|five|seventy|thousand|tenth)\b/i.test(text)) return { handF: 'point', armF: -1.2, elbowF: 1.4 + Math.sin(k * 5) * .2 };
  return null;
};

export type Actor = { k: string | MLook; id?: string; x: number | ((T: number, t: number) => number); y: number | ((T: number, t: number) => number); s?: number; flip?: boolean | ((T: number, t: number) => boolean); age?: number; p?: MPose | ((T: number, t: number) => MPose); still?: boolean; o?: number | ((T: number, t: number) => number); spk?: string; sleep?: boolean; e?: Expr; sil?: boolean };
const val = <V,>(v: V | ((T: number, t: number) => V), T: number, t: number): V => typeof v === 'function' ? (v as any)(T, t) : v;
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
    if (!a.still) {
      const g = !base.holdF || base.holdF === 'none' ? gesture(ln.text, T, ln) : null;
      if (g) Object.assign(pose, g);
      else if (!base.holdF || base.holdF === 'none' || base.holdF === 'bowl' || base.holdF === 'cup') { const sitF = base.sit ? .5 : 1; pose.armF = (base.armF ?? -.7) + Math.sin(T * 2.3 + i) * .28 * sitF; pose.elbowF = (base.elbowF ?? 1.1) + Math.sin(T * 3.1 + i) * .25; }
      pose.tilt = (base.tilt ?? 0) + Math.sin(T * 1.7) * 2;
    }
  } else {
    if (lex) { pose.expr = lex; if (!base.mouth) pose.mouth = undefined; }
    if (ln && ln.speaker !== 'NARR' && !a.sleep) {
      const sp = all.find((o) => (o.spk ?? SPK[typeof o.k === 'string' ? o.k : '']) === ln.speaker);
      if (sp && sp !== a) { const dx = val(sp.x, T, t) - x; pose.lookX = base.lookX ?? (dx > 0 ? 1 : -1) * (flip ? -1 : 1) * .9; }
    }
  }
  const el = <MChar look={look} x={x} y={val(a.y, T, t)} s={s} flip={flip} age={a.age ?? 1} opacity={val(a.o ?? 1, T, t)} pose={pose} />;
  return a.sil ? <g filter="url(#sil)">{el}</g> : el;
};

/* ---------- dialogue scene with automatic coverage ---------- */
type CamV = Cam | 'wide' | 'two' | ((T: number, t: number) => Cam);
type Hit = { t: number; x: number; y: number; kind: string };
export type Scene = { a: number; b: number; bg: (T: number, t: number) => React.ReactNode; actors: Actor[]; fg?: (T: number, t: number) => React.ReactNode; near?: (T: number, t: number) => React.ReactNode; ui?: (T: number, t: number) => React.ReactNode; wide?: Cam; cams?: Record<string, CamV>; zcu?: number; boil?: number; cam?: (T: number, t: number) => Cam; ex?: Record<string, Record<string, Expr>>; mid?: (T: number, t: number) => React.ReactNode; shake?: (T: number, t: number) => number; hits?: Hit[]; grade?: string };
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
  const bp = val(A.p ?? {}, T, T - sc.a) as MPose; const sitting = !!(bp.sit || bp.kneel);
  const ay = val(A.y, T, T - sc.a) - (sitting ? 60 * as : 0);
  const dl = ls.slice(0, li + 1).filter((l) => l.speaker !== 'NARR').length;
  const others = sc.actors.filter((o) => o !== A && !(o.o === 0) && !o.sil);
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
  const t = T - sc.a; const c = camFor(sc, T);
  const hs = (sc.hits || []).reduce((m, h) => Math.max(m, T >= h.t ? (h.kind === 'whoosh' ? 0 : h.kind === 'wood' ? .25 : 1) * Math.exp(-(T - h.t) * 6) : 0), 0);
  const sh = Math.max(sc.shake ? sc.shake(T, t) : 0, hs);
  const punch = (sc.hits || []).reduce((m, h) => Math.max(m, T >= h.t && (h.kind === 'clash' || h.kind === 'flesh') ? .08 * Math.exp(-(T - h.t) * 7) : 0), 0);
  const cam = sh ? { ...c, z: (c.z ?? 1) * (1 + punch), x: (c.x ?? 960) + Math.sin(T * 47) * sh * 14, y: (c.y ?? 540) + Math.cos(T * 53) * sh * 10, r: (c.r ?? 0) + Math.sin(T * 31) * sh * .6 } : c;
  const flash = (sc.hits || []).reduce((m, h) => Math.max(m, T >= h.t && h.kind === 'clash' ? .55 * Math.exp(-(T - h.t) * 14) : 0), 0);
  return <Frame cam={cam} boil={sc.boil} ui={<>{sc.ui?.(T, t)}{flash > .01 && <rect width={1920} height={1080} fill="#fff8e0" opacity={flash} />}{sc.grade && <rect width={1920} height={1080} fill={sc.grade} style={{ mixBlendMode: 'multiply' }} />}</>}>
    {sc.bg(T, t)}
    {sc.mid?.(T, t)}
    <B>{sc.actors.map((a, i) => <ActorEl key={i} a={a} T={T} t={t} i={i} all={sc.actors} ex={sc.ex} />)}</B>
    {(sc.hits || []).filter((h) => h.x > 0 && h.kind !== 'whoosh' && h.kind !== 'thud').map((h, k) => <Spark key={k} x={h.x} y={h.y} p={(T - h.t) / .35} s={h.kind === 'wood' ? .5 : h.kind === 'flesh' ? .7 : 1} c={h.kind === 'flesh' ? '#ffb090' : h.kind === 'block' ? '#ffe0a0' : '#fff4c0'} />)}
    {sc.fg?.(T, t)}
    {sc.near && <g filter="url(#dof)">{sc.near(T, t)}</g>}
  </Frame>;
};
export const Gfx: React.FC<{ C: React.FC<any>; T: number; a: number; b: number }> = ({ C: G, T, a, b }) => {
  const t = T - a, d = b - a;
  return <Frame cam={{ x: 960 + Math.sin(t * .4) * 10, y: 540, z: 1.0 + .05 * (t / d) }} boil={1.2}><B><G t={t} T={T} d={d} /></B></Frame>;
};

/* ---------- helpers ---------- */
const S = (k: string) => (LINES as any[]).find((l) => l.key === k)!.start;
const E = (k: string) => (LINES as any[]).find((l) => l.key === k)!.end;
const Y = 960;
const walkTo = (x0: number, x1: number, t0: number, dur: number) => (T: number, t: number) => lerp(x0, x1, easeInOut(prog(t, t0, t0 + dur)));
const walkP = (t0: number, dur: number, extraP: MPose = {}, run = 0) => (T: number, t: number): MPose => ({ ...extraP, walk: t > t0 && t < t0 + dur ? 1 : 0, run, phase: t * (9 + run * 5) });
const stamp = (kind: 'MYTH' | 'EVIDENCE' | 'MAYBE', at: number, dur: number, sub?: string, x = 1580, y = 190) => (T: number) => T > at - .1 && T < at + dur ? <g opacity={1 - prog(T, at + dur - .4, at + dur)}><Stamp kind={kind} p={prog(T, at, at + .5)} x={x} y={y} s={.85} sub={sub} /></g> : null;
const hitShake = (times: number[], amp = 1) => (T: number) => times.reduce((m, h) => Math.max(m, T >= h ? amp * Math.exp(-(T - h) * 5) : 0), 0);

/* ---------- NEW in ep06: fight choreography (moves blend into each other; shared with audio.py via fights.json) ---------- */
type Mv = 'guard' | 'step' | 'thrust' | 'wind' | 'slash' | 'block' | 'dodge' | 'low' | 'hit' | 'fall' | 'beg' | 'bash' | 'victory' | 'rest';
const MV: Record<Mv, { p: MPose; dx: number }> = {
  guard: { p: { armF: -.95, elbowF: .95, propA: 55, shieldUp: .6, crouch: .6, lean: 4, expr: 'fierce' }, dx: 0 },
  step: { p: { armF: -.9, elbowF: .9, propA: 50, shieldUp: .7, crouch: .5, lean: 8, walk: .6, expr: 'fierce' }, dx: 50 },
  thrust: { p: { armF: -1.62, elbowF: .05, propA: 92, shieldUp: .4, crouch: .9, lean: 16, expr: 'fierce' }, dx: 80 },
  wind: { p: { armF: -2.9, elbowF: .7, propA: -40, shieldUp: .7, crouch: .4, lean: -4, expr: 'fierce' }, dx: -10 },
  slash: { p: { armF: -.55, elbowF: .2, propA: 140, shieldUp: .5, crouch: .9, lean: 18, expr: 'fierce' }, dx: 60 },
  block: { p: { armF: -.6, elbowF: 1.3, propA: 30, shieldUp: 1.35, crouch: 1.0, lean: -8, expr: 'angry' }, dx: -25 },
  dodge: { p: { armF: -.5, elbowF: 1.1, propA: 40, shieldUp: .8, crouch: 1.9, lean: -18, expr: 'scared' }, dx: -70 },
  low: { p: { armF: -1.05, elbowF: -.2, propA: 125, shieldUp: .9, crouch: 2.0, lean: 24, expr: 'fierce' }, dx: 90 },
  hit: { p: { armF: -.3, elbowF: .6, propA: 40, shieldUp: .2, crouch: .3, lean: -20, expr: 'scared', hurt: 1 }, dx: -60 },
  fall: { p: { kneel: 1, lean: -6, armF: .2, elbowF: .4, holdF: 'none', shieldUp: 0, expr: 'scared', hurt: 1 }, dx: -40 },
  beg: { p: { kneel: 1, lean: -4, armF: -2.85, elbowF: .1, handF: 'point', holdF: 'none', shieldUp: 0, expr: 'worried', hurt: 1 }, dx: -40 },
  bash: { p: { armF: -.7, elbowF: 1.0, propA: 40, shieldUp: 1.6, crouch: .7, lean: 20, expr: 'fierce' }, dx: 70 },
  victory: { p: { armF: -1.3, elbowF: .3, propA: 120, shieldUp: .4, crouch: .2, lean: 6, expr: 'fierce' }, dx: 40 },
  rest: { p: { armF: -.4, elbowF: .5, propA: 160, shieldUp: .1, crouch: 0, lean: 0, expr: 'worried' }, dx: 20 },
};
const NUM = ['armF', 'elbowF', 'propA', 'shieldUp', 'crouch', 'lean', 'kneel', 'walk', 'hurt'];
const fightTrack = (seq: [string, number, string][]) => seq.map(([k, dt, m]) => ({ t: S(k) + dt, m: m as Mv })).sort((a, b) => a.t - b.t);
const fight = (seq: [string, number, string][], hold: MPose['holdF'] = 'sica') => {
  const tr = fightTrack(seq);
  const at = (T: number) => { let i = -1; tr.forEach((s, k) => { if (T >= s.t) i = k; }); if (i < 0) return { p: { ...MV.rest.p, holdF: hold } as MPose, dx: MV.rest.dx };
    const cur = MV[tr[i].m], prev = i > 0 ? MV[tr[i - 1].m] : MV.rest; const q = easeOut(prog(T, tr[i].t, tr[i].t + (tr[i].m === 'fall' ? .45 : .17)));
    const p: any = { holdF: hold, ...(q > .5 ? cur.p : prev.p) };
    NUM.forEach((n) => { const a = (prev.p as any)[n] ?? 0, b = (cur.p as any)[n] ?? 0; p[n] = lerp(a, b, q); });
    if (p.walk) p.phase = T * 10; if (q > .5 && cur.p.holdF) p.holdF = cur.p.holdF; else if (q <= .5 && prev.p.holdF) p.holdF = prev.p.holdF;
    return { p: p as MPose, dx: lerp(prev.dx, cur.dx, q) }; };
  return { pose: (T: number) => at(T).p, dx: (T: number) => at(T).dx };
};
const hitsOf = (name: string, ox = 0, oy = 0): Hit[] => ((FIGHTS as any)[name].hits as [string, number, string, number, number][]).map(([k, dt, kind, x, y]) => ({ t: S(k) + dt, kind, x: x ? x + ox : 0, y: y ? y + oy : 0 }));

type Item = { a: number; b: number; g?: boolean; render: (T: number) => React.ReactNode };
const scenes: Item[] = [];
const sc = (s: Omit<Scene, 'b'> & { b?: number }) => scenes.push({ a: s.a, b: s.b ?? -1, render: (T) => <SceneShot sc={{ ...s, b: s.b ?? (scenes.find((x) => x.a === s.a)!.b) } as Scene} T={T} /> });
const gfx = (G: React.FC<any>, a: number) => scenes.push({ a, b: -1, g: true, render: (T) => <Gfx C={G} T={T} a={a} b={scenes.find((x) => x.a === a)!.b} /> });

/* foreground silhouettes of spectators' heads (blurred, depth) */
const Heads = (T: number, y = 1180, n = 9, c = '#1a120c') => <g>{Array.from({ length: n }).map((_, i) => { const R = rng(i + 7); const x = -200 + i * 290 + R() * 60; const b = Math.max(0, Math.sin(T * 4 + i)) * 10; return <g key={i} transform={`translate(${x} ${y - b})`}><circle cy={-150} r={78} fill={c} /><path d="M -130 0 Q -130 -90 0 -90 Q 130 -90 130 0 Z" fill={c} /></g>; })}</g>;
const Bars = (x0: number, x1: number, c = '#2a2a2a') => <g>{Array.from({ length: Math.ceil((x1 - x0) / 70) }).map((_, k) => <rect key={k} x={x0 + k * 70} y={-200} width={22} height={1500} fill={c} />)}<rect x={x0 - 40} y={180} width={x1 - x0 + 80} height={26} fill={c} /></g>;
const FilmFrame = (T: number) => <g>{[-1, 1].map((q) => <g key={q}><rect x={q < 0 ? -240 : 1800} y={-200} width={360} height={1500} fill="#111" />{Array.from({ length: 14 }).map((_, k) => <rect key={k} x={q < 0 ? 60 : 1820} y={((k * 110 + T * 220) % 1540) - 220} width={40} height={60} rx={8} fill="#e8e0c8" />)}</g>)}</g>;

/* ====================== COLD OPEN — the last morning, 71 BC ====================== */
const dawnField = (T: number) => <><Field T={T} tone="dawn" /><Army T={T} rows={3} per={16} x0={1250} y0={760} dx={60} dy={-16} s0={.3} roman wall seed={3} /></>;
sc({ a: 0, bg: dawnField, mid: (T, t) => <><Crowd T={T} n={8} y={880} s={.5} x0={-150} x1={700} seed={4} armed /><Horse x={1080} y={Y + 10} s={.62} ph={T * 1.5} gallop={.05} c="#6a3a20" /></>,
  near: (T) => <Crowd T={T} n={5} y={1300} s={1.3} x0={-200} x1={2100} seed={9} armed />,
  wide: { x: 960, y: 560, z: 1.0 },
  cams: { o1: (T, t) => ({ x: lerp(1500, 1000, easeInOut(prog(t, 0, 4.6))), y: lerp(560, 600, t / 5), z: lerp(1.5, 1.1, easeInOut(prog(t, 0, 4.6))) }), o5: { x: 1100, y: 600, z: 1.9 } },
  actors: [{ k: 'spaReb', x: 900, y: Y, s: 1.25, p: (T) => ({ holdF: 'gladius', armF: -2.3, elbowF: .4, propA: 20 }), e: 'sad' }, { k: 'youReb', x: 1470, y: Y, s: 1.25, flip: true, p: { holdF: 'sica', propA: 150 }, e: 'surprised' }],
  ex: { o3: { youReb: 'worried' }, o4: { spaReb: 'sad' }, o5: { youReb: 'sad' } } });
sc({ a: S('o6'), bg: (T) => <><Field T={T} tone="dawn" dust={.3} /></>, mid: (T, t) => <><Army T={T} rows={5} per={22} x0={-120} y0={900} dx={100} dy={-34} s0={.48} roman wall seed={11} />
    <g filter="url(#boil)"><Horse x={1460} y={720} s={.5} ph={T * 1.5} gallop={.06} c="#e8e0d0" mane="#5a4a3a" /><MChar look={CAST.craWar} x={1420} y={590} s={.62} pose={{ armF: -1.4, elbowF: .2, handF: 'point', expr: 'angry' }} /></g></>,
  cam: (T, t) => ({ x: lerp(500, 1350, easeInOut(t / 6.5)), y: lerp(640, 560, t / 6.5), z: lerp(1.4, 1.2, t / 6.5) }), actors: [] });
sc({ a: S('o7'), bg: dawnField, mid: (T) => <Crowd T={T} n={9} y={870} s={.48} x0={-150} x1={2000} seed={14} armed />,
  near: (T) => <Crowd T={T} n={4} y={1320} s={1.3} x0={-100} x1={2200} seed={19} armed />,
  actors: [{ k: 'youReb', x: 760, y: Y, s: 1.3, p: { holdF: 'sica', propA: 150 }, e: 'sad' }, { k: 'spaReb', x: 1180, y: Y, s: 1.3, flip: true, p: { holdF: 'gladius', propA: 160 }, e: 'neutral' }],
  ex: { o8: { youReb: 'thinking' } }, cams: { o7: 'two' } });
sc({ a: S('o9'), bg: (T) => <><Sky tone="dawn" T={T} /><Hills T={T} y={720} tone="dawn" /></>,
  cam: (T, t) => ({ x: 960, y: lerp(560, 480, t / 6), z: lerp(1.1, 1.6, easeInOut(t / 6)) }),
  actors: [{ k: 'youReb', x: 960, y: Y + 20, s: 1.4, p: { holdF: 'sica', propA: 150, lookX: 1 }, e: 'thinking', spk: '-' }] });
gfx(Rewind, S('o9') + 6.2);

/* ====================== THE HOUSE OF BATIATUS ====================== */
gfx(MapCapua, S('l1'));
sc({ a: S('l2'), bg: (T) => <LudusYard T={T} posts={[1820]} />, mid: (T) => <><WeaponRack x={1600} y={940} s={.8} /><Crowd T={T} n={4} y={930} s={.75} x0={-150} x1={460} seed={31} lookOf={(i) => rebel(i * 3 + 1, false)} pose={() => ({ expr: 'worried', armF: .2, elbowF: .2 })} /></>,
  wide: { x: 960, y: 560, z: 1.0 },
  ui: (T) => stamp('EVIDENCE', S('l6') + .6, 3.6, 'Petronius · Seneca')(T),
  cams: { l6: (T, t) => ({ x: lerp(900, 980, t / 4.5), y: 560, z: lerp(1.15, 1.35, t / 4.5) }), l7: { x: 760, y: 700, z: 2.2 } },
  actors: [{ k: 'you', x: 760, y: Y, s: 1.25, p: (T) => T > S('l7') - .4 ? { kneel: 1, armF: -.4, elbowF: 1.2 } : { armF: .1, elbowF: .3 }, e: 'scared' },
    { k: 'bat', x: 1080, y: Y, s: 1.3, flip: true, p: { armF: -1.1, elbowF: 1.3 }, e: 'thinking' }, { k: 'doc', x: 1380, y: Y, s: 1.3, flip: true, p: { holdF: 'whip', armF: -.6, elbowF: 1.1, propA: 10 }, e: 'angry' }],
  ex: { l2: { you: 'worried' }, l3: { bat: 'laugh' }, l4: { you: 'angry' }, l5: { you: 'scared' }, l7: { bat: 'happy', doc: 'neutral' } } });
sc({ a: S('l8'), bg: (T) => <Cell T={T} />, near: (T, t) => t > 14 ? <g opacity={clamp((t - 14) * 2)}>{Bars(1480, 2200, '#1a1a1a')}</g> : null,
  cams: { l8: (T, t) => ({ x: lerp(1180, 900, easeInOut(t / 6)), y: lerp(380, 600, easeInOut(t / 6)), z: lerp(1.8, 1.25, easeInOut(t / 6)) }), l14: { x: 1600, y: 600, z: 1.9 }, l16: { x: 1620, y: 600, z: 2.1 } },
  actors: [{ k: 'you', x: 720, y: Y, s: 1.2, p: (T) => ({ sit: 1, armF: -.9 + Math.sin(T * 30) * .03, elbowF: 1.6 }), e: 'scared' }, { k: 'spa', x: 1120, y: Y, s: 1.2, flip: true, p: { sit: 1, armF: -.7, elbowF: 1.4 }, e: 'neutral' },
    { k: 'cri', x: 1720, y: Y, s: 1.2, flip: true, o: (T) => T > S('l14') - .5 ? 1 : 0, e: 'laugh' }],
  ex: { l10: { spa: 'happy' }, l11: { you: 'worried' }, l13: { you: 'worried' }, l14: { spa: 'angry', you: 'worried' }, l15: { cri: 'laugh' }, l16: { spa: 'angry', you: 'scared' } } });

/* ====================== A GLADIATOR'S DAY ====================== */
const trainHits = hitsOf('train');
const swingAt = (T: number, off = 0) => { const h = trainHits.filter((x) => x.t + off <= T + .25).pop(); if (!h) return { armF: -1.0, elbowF: .9, propA: 40 }; const q = (T - (h.t + off) + .25) / .5; return q < .5 ? { armF: lerp(-1, -2.8, q * 2), elbowF: .7, propA: -30 } : { armF: lerp(-2.8, -.7, Math.min(1, (q - .5) * 3)), elbowF: .3, propA: 120 }; };
sc({ a: S('t1'), bg: (T) => <LudusYard T={T} tone="dawn" posts={[1010, 1640]} hits={[Math.max(0, 1 - ((T - (trainHits.filter((h) => h.t <= T).pop()?.t ?? -9)) * 6)), 0]} />,
  mid: (T) => <Crowd T={T} n={5} y={900} s={.55} x0={-150} x1={700} seed={41} lookOf={(i) => ({ ...gladiator(i), helmet: 'none', shield: 'none' })} pose={(i) => ({ holdF: 'rudis', ...swingAt(T, i * .17), expr: 'fierce' })} />,
  hits: trainHits.map((h) => ({ ...h, x: 990, y: 720 })),
  ui: (T) => stamp('EVIDENCE', S('t3b') + 1.5, 3.4, 'Vegetius 1.11')(T),
  cams: { t1: (T, t) => ({ x: lerp(1300, 960, easeInOut(t / 3)), y: lerp(400, 560, easeInOut(t / 3)), z: lerp(1.6, 1.05, easeInOut(t / 3)) }), t3b: (T, t) => ({ x: lerp(900, 1000, t / 7), y: 640, z: lerp(1.6, 2.0, t / 7) }) },
  actors: [{ k: 'youBare', x: 820, y: Y, s: 1.25, p: (T) => T > S('t4') && T < S('t5') + 2.8 ? { holdF: 'rudis', armF: -.2, elbowF: .3, propA: 170, crouch: .8, lean: 8 } : { holdF: 'rudis', crouch: .5, ...swingAt(T) }, e: 'fierce' },
    { k: 'spa', x: 1470, y: Y, s: 1.25, p: (T) => ({ holdF: 'rudis', crouch: .5, ...swingAt(T, .25) }), e: 'fierce', spk: '-' },
    { k: 'doc', x: walkTo(1250, 560, 0, 0.1), y: Y + 40, s: 1.35, flip: true, p: { holdF: 'whip', armF: -1.0, elbowF: 1.0, propA: 20 }, e: 'angry' }],
  ex: { t4: { youBare: 'sad' }, t5: { youBare: 'worried' } } });
const messHall = (T: number) => <><LudusYard T={T} tone="dusk" /><Bench x={760} y={Y + 4} w={300} /><Bench x={1260} y={Y + 4} w={300} /><Torch x={160} y={900} T={T} /><Torch x={1880} y={900} T={T} /></>;
sc({ a: S('t6'), bg: messHall, mid: (T) => <Crowd T={T} n={4} y={880} s={.5} x0={1500} x1={2050} seed={51} lookOf={(i) => ({ ...gladiator(i), helmet: 'none', shield: 'none' })} pose={() => ({ sit: 1, holdF: 'bowl', armF: -1.1, elbowF: 1.6 })} />,
  actors: [{ k: 'youBare', x: 720, y: Y, s: 1.25, p: (T) => ({ sit: 1, holdF: T > S('t6') + .8 ? 'bowl' : 'none', armF: -1.0, elbowF: 1.5 }), e: 'sad' },
    { k: 'oen', x: 1090, y: Y, s: 1.25, flip: true, p: (T, t) => ({ sit: 1, holdF: t < .8 ? 'bowl' : 'none', armF: t < .8 ? -1.5 : -1.0, elbowF: 1.2 }), e: 'happy' }],
  ex: { t7: { oen: 'happy' }, t8: { youBare: 'thinking' } } });
gfx(Diet, S('t9'));
sc({ a: S('t9b'), bg: messHall,
  ui: (T) => stamp('MAYBE', S('t10') + 1.6, 3, 'fat as armour: a theory')(T),
  actors: [{ k: 'youBare', x: 720, y: Y, s: 1.25, p: (T) => ({ sit: 1, holdF: T > S('t9b') + 1.2 ? 'cup' : 'bowl', armF: T > S('t9c') - .2 && T < S('t9c') + 1.2 ? -2.0 : -1.0, elbowF: T > S('t9c') - .2 && T < S('t9c') + 1.2 ? 2.2 : 1.5 }), e: 'neutral' },
    { k: 'oen', x: 1090, y: Y, s: 1.25, flip: true, p: (T, t) => ({ sit: 1, holdF: t < 1.2 ? 'cup' : 'none', armF: t < 1.2 ? -1.5 : -1.0, elbowF: 1.2 }), e: 'happy' },
    { k: 'spa', x: walkTo(2200, 1420, S('t11') - S('t9b') - .6, 2.2), y: Y, s: 1.3, flip: true, p: walkP(S('t11') - S('t9b') - .6, 2.2), e: 'neutral' }],
  ex: { t9c: { youBare: 'scared', oen: 'laugh' }, t9d: { youBare: 'sad' }, t10: { youBare: 'thinking' }, t12: { youBare: 'worried', oen: 'sad' } } });
sc({ a: S('t13'), bg: (T) => <LudusYard T={T} posts={[1880]} />, mid: () => <WeaponRack x={260} y={940} s={.9} />,
  actors: [{ k: 'doc', x: 520, y: Y, s: 1.35, p: (T) => T < S('t14') ? { holdF: 'sica', armF: -1.4, elbowF: .4, propA: 90 } : { holdF: 'whip', armF: -.6, elbowF: 1, propA: 10 }, e: 'angry' },
    { k: 'youGlad', x: 900, y: Y, s: 1.25, flip: true, p: (T) => T > S('t14') ? { holdF: 'sica', armF: -1.0, elbowF: .9, propA: 50, shieldUp: .5 } : { armF: -.5, elbowF: .4 }, e: 'surprised' },
    { k: 'spaGlad', x: 1280, y: Y, s: 1.3, flip: true, p: { holdF: 'sica', armF: -.5, elbowF: .6, propA: 150 }, e: 'neutral' }],
  ex: { t15: { youGlad: 'happy' } } });
gfx(Styles, S('t16'));
sc({ a: S('t17'), bg: (T) => <LudusYard T={T} posts={[1880]} />,
  actors: [{ k: 'criGlad', x: 1180, y: Y, s: 1.35, flip: true, p: (T) => ({ holdF: 'gladius', armF: -1.2 + Math.sin(T * 3) * .2, elbowF: .6, propA: 70, shieldUp: .6 }), e: 'laugh' },
    { k: 'youGlad', x: 760, y: Y, s: 1.25, p: { holdF: 'sica', armF: -1.0, elbowF: .9, propA: 50, shieldUp: .5 }, e: 'angry' }],
  cams: { t17: { x: 1140, y: 560, z: 1.9 } } });

/* ====================== THE ARENA ====================== */
const editorAt = (open: (T: number) => number) => (T: number) => <g filter="url(#boil)"><MChar look={CAST.editor} x={0} y={-60} s={.7} pose={{ armF: lerp(-.3, -2.4, open(T)), elbowF: lerp(.4, .2, open(T)), expr: open(T) > .5 ? 'happy' : 'thinking' }} /></g>;
sc({ a: S('a1'), bg: (T) => <Arena T={T} cheer={.8} editor={editorAt(() => 0)} gate={1} />,
  mid: (T, t) => <Crowd T={T} tw={t * 2} n={8} y={960} s={.62} x0={-300} x1={900} seed={61} walk={1} flip={false} lookOf={(i) => gladiator(i)} pose={(i) => ({ walk: 1, phase: T * 7 + i, holdF: i % 2 ? 'gladius' : 'sica', armF: -2.4, elbowF: .2, propA: 0, expr: 'fierce' })} />,
  near: (T) => Heads(T, 1240),
  cams: { a1: (T, t) => ({ x: lerp(600, 960, easeInOut(t / 2.3)), y: lerp(300, 520, easeInOut(t / 2.3)), z: lerp(1.6, 1.0, easeInOut(t / 2.3)) }), a2: (T, t) => ({ x: 1350, y: 560, z: 1.55 }) },
  actors: [{ k: 'her', x: 1380, y: 900, s: 1.1, flip: true, p: { armF: -2.6, elbowF: .2 }, e: 'excited' }] });
sc({ a: S('a3'), bg: (T) => <><Arena T={T} cheer={.5} /><rect x={-240} y={-200} width={2400} height={1500} fill="#000" opacity={.35} /></>,
  near: () => Bars(-200, 2200, '#140e0a'), grade: '#e8d8c0',
  actors: [{ k: 'oen', x: 560, y: 1000, s: 1.3, p: { holdF: 'gladius', propA: 160 }, e: 'neutral' }, { k: 'youGlad', x: 960, y: 1000, s: 1.3, flip: true, p: { holdF: 'sica', propA: 150, armF: -.2, elbowF: .4 }, e: 'scared' }, { k: 'spaGlad', x: 1380, y: 1000, s: 1.35, flip: true, p: { holdF: 'sica', propA: 150 }, e: 'neutral' }],
  ex: { a4: { oen: 'happy' }, a5: { youGlad: 'worried' } } });
sc({ a: S('a6'), bg: (T) => <Arena T={T} cheer={.4} editor={editorAt(() => 0)} />,
  cam: (T, t) => ({ x: lerp(800, 1100, t / 4.3), y: 600, z: 1.25 }),
  actors: [0, 1].flatMap((k) => [{ k: gladiator(k * 2), x: 500 + k * 700, y: Y, s: 1.1, p: (T: number) => ({ holdF: 'rudis' as const, ...swingAt(T * .7 + k), crouch: .6, shieldUp: .6 }), spk: '-' } as Actor, { k: gladiator(k * 2 + 1), x: 760 + k * 700, y: Y, s: 1.1, flip: true, p: (T: number) => ({ holdF: 'rudis' as const, shieldUp: .9 + Math.sin(T * 4) * .3, crouch: .7, armF: -.8, elbowF: 1, propA: 40 }), spk: '-' } as Actor]) });
/* THE FIGHT */
const FY = fight((FIGHTS as any).arena.you, 'sica'), FO = fight((FIGHTS as any).arena.opp, 'gladius');
const arenaHits = hitsOf('arena');
const fightCam = (z: number, dy = 0) => (T: number, t: number): Cam => { const yx = 700 + FY.dx(T), ox = 1230 - FO.dx(T); return { x: (yx + ox) / 2, y: 600 + dy, z }; };
sc({ a: S('a7'), bg: (T) => <Arena T={T} cheer={T > S('a12') ? 1 : .55} editor={editorAt(() => 0)} />, hits: arenaHits,
  near: (T) => Heads(T, 1250),
  cams: { a7: (T, t) => ({ x: 960, y: 600, z: lerp(1.05, 1.25, t / 3) }), a8: (T, t) => fightCam(lerp(1.3, 1.5, t / 6))(T, t), a9: { x: 1230, y: 540, z: 2.1 }, a10: { x: 720, y: 560, z: 2.1 },
    a11: (T, t) => t < 1.2 ? { x: 420, y: 560, z: 2.2 } : fightCam(1.55)(T, t), a12: (T, t) => fightCam(1.7, 40)(T, t), a13: (T, t) => ({ x: 1300, y: 420, z: 1.6 }),
    a14: (T, t) => ({ x: 980, y: 600, z: 1.5 }), a14b: (T, t) => ({ x: lerp(1400, 1500, t / 5), y: lerp(380, 300, t / 5), z: lerp(2.0, 2.4, t / 5) }), a15: { x: 760, y: 560, z: 2.2 }, a16: { x: 420, y: 560, z: 2.2 } },
  actors: [{ k: 'youGlad', x: (T) => 700 + FY.dx(T), y: Y, s: 1.25, p: (T) => FY.pose(T) },
    { k: 'opp', x: (T) => 1230 - FO.dx(T), y: Y, s: 1.25, flip: true, p: (T) => FO.pose(T) },
    { k: 'ref', x: (T) => T > S('a14') - .2 ? lerp(1500, 1010, prog(T, S('a14') - .2, S('a14') + .5)) : 1500, y: (T) => T > S('a14') - .2 ? Y + 10 : 900, s: (1.05), flip: true, p: (T) => T > S('a14') - .2 ? { holdF: 'stick', armF: -1.5, elbowF: .1, propA: 80 } : { holdF: 'stick', armF: -.5, elbowF: .6, propA: 0 }, e: 'neutral' },
    { k: 'spaGlad', x: 380, y: 900, s: 1.0, p: (T) => ({ holdF: 'sica', propA: 150, ...(T > S('a11') - .1 && T < E('a11') ? { handF: 'fist', armF: -2.4, elbowF: .4 } : {}) }), e: 'worried' }],
  ex: { a9: { youGlad: 'fierce' }, a12: { youGlad: 'surprised' }, a15: { youGlad: 'worried', opp: 'scared' }, a16: { youGlad: 'worried' } } });
gfx(Thumbs, S('a17'));
sc({ a: S('a18'), bg: (T, t) => <Arena T={T} cheer={1} wave={clamp(t / 2)} editor={editorAt((T) => prog(T, S('a18') + .1, S('a18') + .6))} />,
  cams: { a18: (T, t) => ({ x: lerp(1500, 1100, easeInOut(prog(t, .6, 2))), y: lerp(330, 560, easeInOut(prog(t, .6, 2))), z: lerp(2.2, 1.2, easeInOut(prog(t, .6, 2))) }), a19: { x: 820, y: 560, z: 2.1 } },
  actors: [{ k: 'youGlad', x: 820, y: Y, s: 1.25, p: { holdF: 'sica', armF: -.3, elbowF: .4, propA: 160, shieldUp: .1 }, e: 'happy' },
    { k: 'opp', x: 1110, y: Y, s: 1.25, flip: true, p: { kneel: 1, armF: -.5, elbowF: .9, hurt: 1 }, e: 'happy' }],
  ex: { a19: { opp: 'happy' } } });
gfx(Odds, S('a20'));
sc({ a: S('a21'), bg: (T) => <><LudusYard T={T} tone="night" posts={[1700]} /><Torch x={960} y={880} T={T} s={.9} /></>,
  actors: [{ k: 'spa', x: 700, y: Y, s: 1.25, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'neutral' }, { k: 'youBare', x: 1200, y: Y, s: 1.25, flip: true, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'sad' }],
  ex: { a22: { spa: 'thinking' }, a23: { youBare: 'surprised' } }, cams: { a23: { x: 700, y: 640, z: 2.4 } } });

/* ====================== KITCHEN KNIVES ====================== */
sc({ a: S('e1'), bg: (T) => <><LudusYard T={T} tone="night" /><Torch x={160} y={880} T={T} /></>,
  mid: (T) => <Crowd T={T} n={7} y={890} s={.6} x0={1300} x1={2100} seed={71} lookOf={(i) => ({ ...gladiator(i), helmet: 'none', shield: 'none' })} pose={(i) => ({ lean: 10, expr: 'thinking', lookX: -1 })} />,
  wide: { x: 960, y: 580, z: 1.05 },
  actors: [{ k: 'spa', x: 640, y: Y, s: 1.25, p: { lean: 8 }, e: 'fierce' }, { k: 'youBare', x: 900, y: Y, s: 1.2, flip: true, e: 'worried' }, { k: 'oen', x: 1120, y: Y, s: 1.2, flip: true, e: 'neutral' }, { k: 'cri', x: 1350, y: Y, s: 1.3, flip: true, e: 'angry' }],
  ex: { e3: { spa: 'angry' }, e4: { cri: 'thinking' }, e5: { spa: 'happy', youBare: 'happy' } } });
sc({ a: S('e6'), bg: (T) => <><LudusYard T={T} tone="night" /><Colonnade y={940} n={3} dark x0={500} dx={500} h={620} /></>,
  cam: (T, t) => ({ x: lerp(800, 1100, t / 2.6), y: 560, z: 1.5 }),
  actors: [{ k: 'guard', x: walkTo(860, 1500, 1.2, 1.2), y: Y, s: 1.25, flip: (T, t) => t < 1.2, p: (T, t) => ({ walk: t > 1.2 ? 1 : 0, run: 1, phase: t * 14, lean: t < 1.2 ? -10 : 0, holdF: 'spear' }), e: 'surprised' }] });
const escHits = hitsOf('escape');
sc({ a: S('e7'), bg: (T, t) => <Kitchen T={T} chaos={clamp(t / 1.5)} />, hits: escHits, shake: () => .15,
  mid: (T, t) => t > 2 ? <Crowd T={T} tw={(t - 2) * 3} n={5} y={950} s={.75} x0={-300} x1={2400} walk={1} flip seed={81} lookOf={(i) => ({ ...gladiator(i), helmet: 'none', shield: 'none' })} pose={(i) => ({ run: 1, holdF: i % 2 ? 'cleaver' : 'spit', armF: -2.4, elbowF: .3, propA: 0, expr: 'fierce' })} /> : null,
  actors: [{ k: 'youBare', x: 560, y: Y, s: 1.3, p: (T, t) => ({ holdF: 'cleaver', armF: -2.3, elbowF: .4, propA: 10 }), e: 'scared' },
    { k: 'spa', x: 980, y: Y, s: 1.35, flip: true, p: (T, t) => ({ holdF: 'spit', armF: -2.6, elbowF: .2, propA: 0, handF: 'fist' }), e: 'fierce' }],
  ex: { e8: { youBare: 'fierce' } } });
gfx(Escaped, S('e9'));
sc({ a: S('e10'), bg: (T) => <><Sky tone="dawn" T={T} /><Hills T={T} y={720} tone="dawn" road /></>,
  mid: (T, t) => <><Wagon x={1300} y={Y + 10} s={.9} weapons={1} /><Crowd T={T} n={6} y={900} s={.55} x0={-150} x1={800} seed={91} lookOf={(i) => ({ ...gladiator(i), helmet: 'none', shield: 'none' })} pose={(i) => ({ holdF: i % 2 ? 'cleaver' : 'spit', armF: -.6, elbowF: .6, propA: 20, expr: 'excited' })} /></>,
  actors: [{ k: 'oen', x: 500, y: Y, s: 1.25, p: { holdF: 'cleaver', propA: 150 }, e: 'excited' }, { k: 'youBare', x: 820, y: Y, s: 1.25, p: (T) => T > S('e12') ? { holdF: 'sica', armF: -2.2, elbowF: .3, propA: 10 } : { holdF: 'cleaver', propA: 150 }, e: 'excited' },
    { k: 'spa', x: 1700, y: Y, s: 1.35, flip: true, p: (T) => T > S('e12') ? { holdF: 'gladius', armF: -2.5, elbowF: .2, propA: 0 } : {}, e: 'happy' }],
  ex: { e12: { youBare: 'happy', oen: 'laugh' } }, cams: { e12: (T, t) => ({ x: lerp(1500, 1250, t / 5.8), y: lerp(520, 560, t / 5.8), z: lerp(1.9, 1.15, easeInOut(t / 5.8)) }) } });

/* ====================== THE VINE LADDERS ====================== */
sc({ a: S('v1'), bg: (T) => <><Sky tone="day" T={T} /><Hills T={T} y={860} vesuv={1.05} vines /></>,
  ui: (T) => stamp('EVIDENCE', S('v1') + 5.5, 3.3, 'erupted 152 years later, 79 AD', 1500, 860)(T),
  cam: (T, t) => ({ x: lerp(1100, 1050, t / 9), y: lerp(780, 480, easeInOut(t / 9)), z: lerp(1.7, 1.05, easeInOut(t / 9)) }), actors: [] });
sc({ a: S('v2'), bg: (T) => <><Sky tone="dusk" T={T} /><Hills T={T} y={520} tone="dusk" vesuv={.7} cyp={false} /><RomanCamp T={T} y={640} s={.8} /></>,
  cams: { v2: { x: 900, y: 600, z: 1.9 }, v3: (T, t) => ({ x: lerp(900, 1100, easeInOut(t / 6)), y: lerp(600, 420, easeInOut(t / 6)), z: lerp(1.9, 1.0, easeInOut(t / 6)) }) },
  actors: [{ k: 'gla', x: 900, y: 1000, s: 1.3, p: { handF: 'point', armF: -1.6, elbowF: .1 }, e: 'thinking' }] });
sc({ a: S('v4'), bg: (T) => <><Sky tone="night" T={T} /><Hills T={T} y={800} tone="night" cyp={false} /><Campfire x={960} y={Y + 10} T={T} /></>, fg: (T) => <Embers T={T} n={16} o={.5} />,
  ui: (T) => stamp('EVIDENCE', S('v7') + .6, 4, 'Plutarch, Crassus 8', 1560, 200)(T),
  actors: [{ k: 'wife', x: 640, y: Y, s: 1.2, p: { sit: 1, armF: -1.0, elbowF: 1.4 }, e: 'worried' }, { k: 'spa', x: 1280, y: Y, s: 1.3, flip: true, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'neutral' },
    { k: 'youBare', x: 1650, y: Y + 20, s: 1.1, flip: true, p: { lean: 84 }, sleep: true, spk: '-' }],
  ex: { v5: { wife: 'thinking' }, v6: { spa: 'worried' } }, cams: { v7: (T, t) => ({ x: lerp(960, 900, t / 5), y: lerp(560, 620, t / 5), z: lerp(1.1, 1.4, t / 5) }) } });
sc({ a: S('v8'), bg: (T) => <><Sky tone="day" T={T} /><Hills T={T} y={980} tone="day" cyp={false} /><Cliff T={T} /></>,
  actors: [{ k: 'youBare', x: 1180, y: Y, s: 1.3, p: (T) => ({ holdF: T > S('v8') + 1.2 ? 'vine' : 'none', armF: -2.2, elbowF: .6 }), e: 'excited' }, { k: 'spa', x: 1560, y: Y, s: 1.35, flip: true, e: 'thinking' }],
  ex: { v9: { spa: 'laugh', youBare: 'happy' } } });
sc({ a: S('v10'), bg: (T, t) => <><Sky tone="night" T={T} /><Cliff T={T} night ladder={clamp(t / 1.5)} /></>,
  mid: (T, t) => <g filter="url(#boil)">{[0, 1, 2, 3, 4].map((k) => { const yy = -60 + ((t * 120 + k * 260) % 1300); return <MChar key={k} look={k === 2 ? CAST.youBare : { ...gladiator(k), helmet: 'none', shield: 'none' }} x={880} y={yy + 160} s={.55} flip={false} pose={{ armF: -2.8 + Math.sin(t * 5 + k) * .3, elbowF: .3, armB: 2.8 - Math.sin(t * 5 + k) * .3, elbowB: -.3, blink: 0, expr: 'worried', turn: -.3 }} />; })}</g>,
  cam: (T, t) => ({ x: 960, y: lerp(200, 800, easeInOut(t / 5.4)), z: 1.35 }), actors: [] });
sc({ a: S('v11'), bg: (T, t) => <><Sky tone="night" T={T} /><Hills T={T} y={500} tone="night" vesuv={.6} cyp={false} /><RomanCamp T={T} y={640} s={.8} night panic={T > S('v12') + .6 ? 1 : 0} fire={clamp((T - S('v13')) / 1.5)} /></>,
  mid: (T, t) => T > S('v12') + .3 ? <Army T={T - S('v12')} rows={2} per={8} x0={-700} y0={1040} dx={160} s0={.75} charge={1} speed={320} seed={5} /> : null,
  fg: (T) => <Embers T={T} n={30} o={clamp((T - S('v13')) / 2)} />, shake: (T) => T > S('v12') ? .3 : 0,
  cams: { v11: { x: 1240, y: 580, z: 2.0 }, v12: { x: 600, y: 600, z: 1.7 }, v13: { x: 700, y: 620, z: 1.8 }, v14: (T, t) => ({ x: lerp(800, 1200, t / 5.6), y: 560, z: lerp(1.4, 1.1, t / 5.6) }) },
  actors: [{ k: 'gla', x: 1250, y: 990, s: 1.2, flip: true, p: (T) => T > S('v12') + .5 ? { walk: 1, run: 1, phase: T * 14 } : { lookX: -1 }, o: (T) => T > S('v13') ? 0 : 1, e: 'scared' },
    { k: 'spa', x: (T) => T > S('v12') ? 560 + (T - S('v12')) * 60 : 560, y: 1000, s: 1.3, p: { holdF: 'gladius', armF: -2.4, elbowF: .3, propA: 10 }, e: 'fierce' },
    { k: 'youBare', x: (T) => T > S('v13') ? 300 + (T - S('v13')) * 150 : 300, y: 1000, s: 1.25, p: (T) => ({ holdF: 'sica', armF: -2.2, elbowF: .3, propA: 0, walk: T > S('v13') ? 1 : 0, run: 1, phase: T * 14 }), e: 'excited' }] });

/* ====================== SEVENTY THOUSAND ====================== */
sc({ a: S('w1'), bg: (T) => <><Sky tone="day" T={T} /><Hills T={T} y={700} road /><Villa x={1600} y={720} s={.6} /></>,
  mid: (T, t) => <><Crowd T={T} tw={t} n={9} y={860} s={.5} x0={-400} x1={1200} walk={.6} flip={false} kids seed={101} /><Crowd T={T} tw={t} n={6} y={1000} s={.75} x0={-600} x1={900} walk={.6} flip={false} kids seed={107} /></>,
  cam: (T, t) => ({ x: lerp(700, 1100, t / 5.4), y: 560, z: 1.2 }), actors: [] });
const campBg = (T: number) => <><Sky tone="day" T={T} /><Hills T={T} y={760} /><Campfire x={1720} y={900} T={T} s={.7} /></>;
sc({ a: S('w2'), bg: campBg, mid: (T, t) => <Crowd T={T} tw={t} n={12} y={860} s={.45} x0={-200} x1={1500} walk={.5} flip={false} kids seed={111} />,
  actors: [{ k: 'youReb', x: 1180, y: Y, s: 1.25, flip: true, p: { handF: 'point', armF: -1.5, elbowF: .1 }, e: 'excited' }, { k: 'spaReb', x: 1520, y: Y, s: 1.3, flip: true, e: 'happy' }, { k: 'oenReb', x: 860, y: Y, s: 1.25, o: (T) => T > S('w4') - .6 ? 1 : 0, e: 'thinking' }],
  ex: { w3: { youReb: 'happy' }, w5: { oenReb: 'surprised', youReb: 'thinking' } } });
sc({ a: S('w6'), bg: campBg, mid: (T, t) => <Crowd T={T} n={6} y={Y} s={.95} x0={1050} x1={2000} seed={117} pose={(i) => ({ holdF: t > 1.5 + i * .4 ? 'gladius' : 'none', armF: -1.4, elbowF: .6, propA: 30, expr: t > 1.5 + i * .4 ? 'happy' : 'neutral' })} />,
  ui: (T) => stamp('EVIDENCE', S('w6') + 3, 3.6, 'Appian, Civil Wars 1.117')(T),
  cam: (T, t) => ({ x: lerp(900, 1100, t / 7.4), y: 600, z: 1.3 }),
  actors: [{ k: 'spaReb', x: 760, y: Y, s: 1.3, p: (T, t) => ({ holdF: (Math.floor(t / .4) % 2) ? 'gladius' : 'coins', armF: -1.4, elbowF: .6, propA: 80 }), e: 'happy' }] });
sc({ a: S('w7'), bg: (T) => <><Sky tone="dusk" T={T} /><Hills T={T} y={760} tone="dusk" /></>,
  mid: () => <g transform="translate(1180 960)"><path d="M -160 0 Q -120 -90 0 -110 Q 120 -90 160 0 Z" fill="#8a7a6a" stroke={P.ink} strokeWidth={7} /><g transform="translate(-20 -140) rotate(-8)"><circle r={50} fill="#c9913a" stroke={P.ink} strokeWidth={6} /></g>{[-60, 40, 90].map((q, k) => <circle key={k} cx={q} cy={-30 - k * 6} r={9} fill={['#d86a4f', '#efe6d2', RC.gold][k]} stroke={P.ink} strokeWidth={3} />)}</g>,
  cam: (T, t) => ({ x: lerp(1000, 1080, t / 8), y: lerp(600, 640, t / 8), z: lerp(1.3, 1.6, t / 8) }),
  actors: [{ k: 'youReb', x: 840, y: Y, s: 1.25, p: { kneel: 1, armF: -.4, elbowF: 1.2 }, e: 'sad', spk: '-' }] });
gfx(Growth, S('w8'));
sc({ a: S('w9'), bg: (T) => <><Field T={T} tone="day" dust={.4} /></>, mid: (T) => <><g transform="translate(1500 900) rotate(70)"><line x1={0} y1={0} x2={0} y2={-260} stroke={P.ink} strokeWidth={10} /><circle cy={-280} r={30} fill="#c9913a" stroke={P.ink} strokeWidth={5} /></g><Crowd T={T} n={10} y={880} s={.55} x0={-100} x1={2000} armed cheer={1} seed={121} /></>,
  actors: [{ k: 'youReb', x: 760, y: Y, s: 1.3, p: (T) => ({ holdF: 'sica', armF: -2.6 + Math.sin(T * 6) * .2, elbowF: .2, propA: 0 }), e: 'laugh' }, { k: 'spaReb', x: 1160, y: Y, s: 1.35, flip: true, p: { holdF: 'gladius', propA: 160 }, e: 'thinking' }],
  ex: { w10: { youReb: 'worried' } } });

/* ====================== THE SPLIT ====================== */
const council = (T: number) => <><Sky tone="night" T={T} /><Hills T={T} y={760} tone="night" cyp={false} /><Campfire x={960} y={Y + 10} T={T} /></>;
sc({ a: S('x1'), bg: council, fg: (T) => <Embers T={T} n={20} o={.5} />, wide: { x: 960, y: 580, z: 1.05 },
  near: (T) => <Crowd T={T} n={4} y={1330} s={1.3} x0={-300} x1={2200} seed={131} armed />,
  actors: [{ k: 'spaReb', x: 560, y: Y, s: 1.3, e: 'neutral' }, { k: 'youReb', x: 900, y: Y + 10, s: 1.2, flip: true, e: 'worried' }, { k: 'criReb', x: 1380, y: Y, s: 1.35, flip: true, e: 'angry' }],
  ex: { x3: { spaReb: 'angry' }, x4: { criReb: 'fierce' }, x5: { spaReb: 'sad', youReb: 'scared' }, x7: { youReb: 'sad', spaReb: 'angry' } } });
/* NEW in ep06: split-screen decision */
sc({ a: S('x8'), bg: (T, t) => <>
    <g><Sky tone="dawn" T={T} /><Hills T={T} y={700} tone="dawn" /><path d="M -240 700 L 200 300 L 420 520 L 640 260 L 900 700 Z" fill="#c8d0d8" stroke={P.ink} strokeWidth={7} /></g>
    <g clipPath="url(#rightHalf)"><Sky tone="fire" T={T} /><Hills T={T} y={700} tone="fire" /><Villa x={1500} y={720} s={.7} fire={1} T={T} /><Smoke T={T} x={1500} y={500} /></g>
    <defs><clipPath id="rightHalf"><path d={`M ${1000 + Math.sin(t) * 10} -300 L 2400 -300 L 2400 1400 L ${920 + Math.sin(t) * 10} 1400 Z`} /></clipPath></defs>
    <path d={`M ${1000 + Math.sin(t) * 10} -300 L ${920 + Math.sin(t) * 10} 1400`} stroke={P.ink} strokeWidth={16} /></>,
  ui: (T, t) => <g opacity={clamp(t * 3)}><rect x={150} y={70} width={520} height={80} fill="#21160f" /><text x={410} y={124} fontFamily="Cinzel" fontWeight={700} fontSize={40} fill="#efe6d2" textAnchor="middle">NORTH · FREEDOM</text>
    <rect x={1250} y={70} width={520} height={80} fill="#9b2a22" /><text x={1510} y={124} fontFamily="Cinzel" fontWeight={700} fontSize={40} fill="#efe6d2" textAnchor="middle">SOUTH · REVENGE</text></g>,
  cam: (T, t) => ({ x: 960, y: 560, z: lerp(1.0, 1.08, t / 4) }),
  actors: [{ k: 'spaReb', x: 480, y: Y, s: 1.4, p: { handF: 'point', armF: -1.6, elbowF: .1 }, e: 'thinking', spk: '-' }, { k: 'criReb', x: 1460, y: Y, s: 1.45, flip: true, p: { holdF: 'gladius', armF: -2.5, elbowF: .2, propA: 0 }, e: 'fierce', spk: '-' }] });
sc({ a: S('x9'), bg: council, fg: (T) => <Embers T={T} n={20} o={.5} />,
  mid: (T, t) => T > S('x10') + .8 ? <Crowd T={T} tw={T - S('x10')} n={6} y={880} s={.55} x0={1400} x1={2100} walk={1} flip={false} seed={137} armed lookOf={(i) => rebel(i * 7 + 3)} /> : null,
  actors: [{ k: 'spaReb', x: 560, y: Y, s: 1.3, e: 'neutral' }, { k: 'youReb', x: 900, y: Y + 10, s: 1.2, flip: true, e: 'sad' },
    { k: 'criReb', x: (T) => T > S('x10') + .9 ? 1380 + (T - S('x10') - .9) * 180 : 1380, y: Y, s: 1.35, flip: (T) => !(T > S('x10') + .9), p: (T) => T > S('x10') + .9 ? { walk: 1, phase: T * 9 } : {}, e: 'sad' }],
  ex: { x9: { spaReb: 'happy', criReb: 'angry' } }, cams: { x9: { x: 900, y: 600, z: 2.2 }, x10: (T, t) => ({ x: 1300, y: 600, z: lerp(1.9, 1.3, t / 2) }) } });
sc({ a: S('x11'), bg: (T) => <><Sky tone="dusk" T={T} /><Hills T={T} y={640} tone="dusk" vesuv={.55} cyp={false} /></>,
  mid: (T, t) => <><Army T={T} rows={3} per={12} x0={1200} y0={980} dx={110} s0={.55} roman wall flip seed={41} /><g filter="url(#sil)"><Crowd T={T} n={8} y={980} s={.6} x0={100} x1={1100} armed seed={141} pose={(i) => ({ armF: -2.4 + Math.sin(T * 6 + i) * .4, elbowF: .3, propA: 30, crouch: .6 })} /></g></>,
  fg: (T) => <Dust T={T} x={960} y={1050} w={2400} o={.7} />, shake: () => .2,
  cam: (T, t) => ({ x: lerp(800, 1100, t / 9.9), y: lerp(560, 600, t / 9.9), z: lerp(1.2, 1.4, t / 9.9) }), actors: [] });
sc({ a: S('x12'), bg: council,
  actors: [{ k: 'youReb', x: 760, y: Y, s: 1.25, e: 'sad' }, { k: 'spaReb', x: 1160, y: Y, s: 1.3, flip: true, p: { handF: 'fist', armF: -.6, elbowF: .8 }, e: 'angry' }], ex: { x13: { youReb: 'sad' } } });
sc({ a: S('x14'), bg: (T) => <><Sky tone="dusk" T={T} /><Hills T={T} y={700} tone="dusk" cyp={false} /><g transform="translate(1600 720)"><rect x={-90} y={-120} width={180} height={120} fill="#6a4426" stroke={P.ink} strokeWidth={6} /><circle cx={0} cy={-260} r={240} fill="url(#fireGlow)" />{[-40, 0, 40].map((q, k) => <path key={k} d={`M ${q - 34} -120 Q ${q - 24} ${-220 - Math.sin(T * 8 + k) * 20} ${q} ${-280 - Math.sin(T * 10 + k) * 24} Q ${q + 24} -200 ${q + 34} -120 Z`} fill={F.fire} stroke={P.ink} strokeWidth={4} />)}</g></>,
  mid: (T) => <><ArenaCrowd T={T} y0={800} rows={2} cheer={.9} dark seed={9} /><g filter="url(#sil)"><MChar look={{ ...legionary(1), helmet: 'none', shield: 'none' }} x={800 + Math.sin(T * 2) * 30} y={980} s={.75} pose={{ holdF: 'gladius', armF: -1.6 + Math.sin(T * 5) * .5, elbowF: .2, propA: 90, crouch: .6 }} /><MChar look={{ ...legionary(4), helmet: 'none', shield: 'none' }} x={1060 - Math.sin(T * 2) * 30} y={980} s={.75} flip pose={{ holdF: 'gladius', armF: -1.4 + Math.cos(T * 5) * .5, elbowF: .3, propA: 90, crouch: .6 }} /></g></>,
  ui: (T) => stamp('EVIDENCE', S('x14') + 3, 4.5, 'Appian, Civil Wars 1.117', 1560, 200)(T),
  cams: { x14: (T, t) => ({ x: lerp(1300, 950, easeInOut(t / 9)), y: 620, z: lerp(1.15, 1.35, t / 9) }) },
  actors: [{ k: 'youReb', x: 380, y: 1040, s: 1.25, e: 'sad' }, { k: 'spaReb', x: 180, y: 1040, s: 1.3, e: 'angry' }], ex: { x16: { youReb: 'sad' } }, cams2: undefined } as any);

/* ====================== CRASSUS ====================== */
sc({ a: S('c1'), bg: (T) => <><Sky tone="day" T={T} /><Colonnade y={940} n={9} /><rect x={-240} y={940} width={2400} height={400} fill="#cdbb98" /></>,
  mid: (T) => <Crowd T={T} n={7} y={930} s={.7} x0={-150} x1={700} seed={151} lookOf={(i) => ({ ...CAST.her, cloth: i % 2 ? '#f2ead6' : '#e2d8c0', hair: ['#9a9088', '#3a2a1a', '#6a5a4a'][i % 3] })} pose={() => ({ lookX: 1, expr: 'worried' })} />,
  cam: (T, t) => ({ x: lerp(1300, 1150, t / 6), y: lerp(520, 560, t / 6), z: lerp(1.6, 1.3, t / 6) }),
  actors: [{ k: 'cra', x: 1240, y: Y, s: 1.35, flip: true, p: { holdF: 'scroll', armF: -1.2, elbowF: 1.0 }, e: 'happy', spk: '-' }] });
sc({ a: S('c2'), bg: (T) => <Field T={T} tone="day" />, mid: (T) => <Army T={T} rows={2} per={12} x0={-150} y0={880} dx={150} dy={-20} s0={.55} roman seed={23} />,
  actors: [{ k: 'craWar', x: 1300, y: Y, s: 1.35, flip: true, p: { handF: 'point', armF: -1.55, elbowF: .1 }, e: 'angry' }], cams: { c2: { x: 1200, y: 560, z: 1.8 } } });
gfx(Decimation, S('c3'));
sc({ a: S('c4'), bg: (T) => <><Sky tone="dusk" T={T} /><Hills T={T} y={620} tone="dusk" cyp={false} /></>, mid: (T) => <Army T={T} rows={3} per={20} x0={-100} y0={760} dx={60} dy={-14} s0={.28} roman seed={33} />,
  actors: [{ k: 'youReb', x: 1450, y: 1010, s: 1.3, flip: true, e: 'worried' }], cams: { c4: { x: 1250, y: 600, z: 1.6 } } });
gfx(MapRoute, S('c5'));
sc({ a: S('c6'), bg: (T) => <Coast T={T} />, mid: (T) => <><Ship x={1500} y={650} s={.55} T={T} flip /><Ship x={1900} y={640} s={.45} T={T} flip sail="#3a5f88" /></>,
  actors: [{ k: 'pir', x: 1040, y: Y, s: 1.3, flip: true, p: (T) => T > S('c7') + .6 ? { armF: -1.5, elbowF: .2 } : { holdF: 'coins', armF: -1.2, elbowF: 1.0 }, e: 'happy' }, { k: 'spaReb', x: 660, y: Y, s: 1.35, p: (T) => T > S('c7') + .6 ? { armF: -1.5, elbowF: .2 } : {}, e: 'thinking' }],
  ex: { c6: { spaReb: 'thinking' }, c7: { pir: 'laugh' } } });
sc({ a: S('c8'), bg: (T) => <Coast T={T} tone="dusk" />, mid: (T, t) => <><Ship x={1500 + t * 90} y={620} s={.4 - t * .02} T={T} flip /><Ship x={1850 + t * 90} y={610} s={.32 - t * .015} T={T} flip sail="#3a5f88" /></>,
  actors: [{ k: 'youReb', x: 600, y: Y, s: 1.3, p: (T) => T > S('c9') ? { handF: 'point', armF: -1.6, elbowF: .1 } : {}, e: 'surprised' }, { k: 'spaReb', x: 360, y: Y, s: 1.3, e: 'sad' }],
  cams: { c8: (T, t) => ({ x: lerp(800, 1300, t / 3.8), y: 560, z: 1.2 }), c9: { x: 520, y: 620, z: 2.0 } } });
sc({ a: S('c10'), bg: (T) => <><Sky tone="day" T={T} /><Hills T={T} y={640} cyp={false} /><path d="M -240 860 L 2160 840 L 2160 940 L -240 960 Z" fill="#6a5a44" stroke={P.ink} strokeWidth={6} /></>,
  mid: (T) => <Crowd T={T} n={9} y={830} s={.5} x0={-150} x1={1400} seed={161} lookOf={(i) => ({ ...legionary(i), shield: 'none' })} pose={(i) => ({ holdF: 'spear', armF: -1.6 + Math.sin(T * 4 + i) * .7, elbowF: .4, propA: 150 + Math.sin(T * 4 + i) * 30, crouch: .6 })} />,
  actors: [{ k: 'craWar', x: 1500, y: Y + 20, s: 1.35, flip: true, p: { handF: 'point', armF: -1.55, elbowF: .1 }, e: 'happy' }], cams: { c10: (T, t) => ({ x: lerp(1450, 1250, t / 4.8), y: 560, z: lerp(1.9, 1.5, t / 4.8) }) } });
gfx(MapWall, S('c10b'));
sc({ a: S('c11'), bg: (T) => <DitchWall T={T} />,
  actors: [{ k: 'youReb', x: 760, y: 1060, s: 1.3, p: { lookY: -.6 }, e: 'worried' }, { k: 'spaReb', x: 1140, y: 1060, s: 1.35, flip: true, e: 'thinking' }] });
sc({ a: S('c13'), bg: (T, t) => <DitchWall T={T} filled={clamp(t / 4)} breach={clamp((t - 4.2) / 1)} />,
  mid: (T, t) => <Crowd T={T} tw={t * 2} n={8} y={1060} s={.7} x0={-1200} x1={600} walk={1} flip={false} armed seed={171} pose={(i) => ({ run: 1, phase: T * 12 + i, expr: 'fierce' })} />,
  cam: (T, t) => ({ x: lerp(800, 1100, t / 7.5), y: lerp(640, 560, t / 7.5), z: lerp(1.3, 1.1, t / 7.5) }), shake: (T) => T > S('c14') ? .3 : 0,
  actors: [{ k: 'youReb', x: (T, t) => 500 + t * 70, y: 1080, s: 1.25, p: (T) => ({ walk: 1, run: 1, phase: T * 12, holdF: 'sica', armF: -2.4, elbowF: .2, propA: 0 }), e: 'excited' }] });

/* ====================== THE LAST MORNING ====================== */
sc({ a: S('f1'), bg: dawnField, mid: (T) => <Crowd T={T} n={9} y={880} s={.5} x0={-150} x1={1000} seed={4} armed />,
  cam: (T, t) => ({ x: lerp(1400, 960, easeInOut(t / 4.4)), y: 580, z: lerp(1.5, 1.05, easeInOut(t / 4.4)) }),
  actors: [{ k: 'spaReb', x: 900, y: Y, s: 1.25, p: { holdF: 'gladius', propA: 160 }, e: 'neutral', spk: '-' }, { k: 'youReb', x: 1300, y: Y, s: 1.25, flip: true, p: { holdF: 'sica', propA: 150 }, e: 'worried', spk: '-' }] });
sc({ a: S('f2'), bg: dawnField, near: (T) => <Crowd T={T} n={4} y={1320} s={1.3} x0={-100} x1={2200} seed={19} armed />,
  actors: [{ k: 'youReb', x: 760, y: Y, s: 1.3, p: { holdF: 'sica', propA: 150 }, e: 'sad' }, { k: 'spaReb', x: 1180, y: Y, s: 1.35, flip: true, p: (T) => T > S('f4') ? { holdF: 'gladius', armF: -2.4, elbowF: .3, propA: 0 } : { holdF: 'gladius', propA: 160 }, e: 'happy' }],
  ex: { f3: { youReb: 'sad' }, f4: { spaReb: 'fierce', youReb: 'worried' } }, cams: { f4: { x: 1180, y: 560, z: 2.3 } } });
const FS = fight((FIGHTS as any).last.spa, 'gladius');
sc({ a: S('f5'), bg: (T) => <Field T={T} tone="day" dust={.8} />, hits: hitsOf('last').map((h) => ({ ...h, x: 1080, y: 700 })),
  mid: (T, t) => <><Army T={T} rows={3} per={10} x0={1250} y0={980} dx={120} s0={.6} roman flip wall seed={51} /></>,
  fg: (T) => <Dust T={T} x={960} y={1100} w={2400} o={.6} />,
  cam: (T, t) => ({ x: lerp(800, 1000, t / 7.6), y: 600, z: lerp(1.3, 1.5, t / 7.6) }),
  actors: [{ k: 'spaReb', x: (T) => 860 + FS.dx(T) + (T - S('f5')) * 20, y: Y, s: 1.35, p: (T) => FS.pose(T) },
    { k: legionary(0), id: 'c1', spk: '-', x: 1200, y: Y, s: 1.25, flip: true, p: (T) => T > S('f5') + 1.55 ? { kneel: 1, lean: -30 } : { holdF: 'gladius', shieldUp: .8, armF: -1, elbowF: .9, propA: 50 }, o: (T) => 1 - prog(T, S('f5') + 2, S('f5') + 2.6) },
    { k: { ...legionary(7), crestC: RC.red }, id: 'c2', spk: '-', x: 1260, y: Y, s: 1.25, flip: true, o: (T) => prog(T, S('f5') + 2.2, S('f5') + 2.6) * (1 - prog(T, S('f5') + 5.6, S('f5') + 6.2)), p: (T) => T > S('f5') + 5.35 ? { kneel: 1, lean: -30 } : { holdF: 'gladius', shieldUp: .8, armF: -1, elbowF: .9, propA: 50 } }],
  ui: (T) => stamp('EVIDENCE', S('f5') + 6, 1.8, 'Plutarch, Crassus 11')(T) });
sc({ a: S('f6'), bg: (T) => <Field T={T} tone="dusk" dust={1} />, fg: (T) => <Dust T={T} x={960} y={1000} w={2400} o={.9} />,
  actors: [{ k: 'youReb', x: (T, t) => 700 + t * 60, y: Y, s: 1.35, p: (T) => ({ walk: 1, phase: T * 6, holdF: 'sica', propA: 150, armF: -.5, elbowF: .8 }), e: 'scared' }], cams: { f6: (T, t) => ({ x: 760 + t * 60, y: 560, z: 1.9 }) } });
sc({ a: S('f7'), bg: (T) => <><Sky tone="dusk" T={T} /><rect x={-240} y={760} width={2400} height={600} fill="#4a3a2a" /></>,
  mid: (T, t) => <g filter="url(#sil)">{Array.from({ length: 10 }).map((_, k) => { const a = k / 10 * Math.PI * 2; const r = lerp(700, 260, easeOut(prog(t, 0, 2.5))); return <MChar key={k} look={legionary(k)} x={960 + Math.cos(a) * r} y={940 + Math.sin(a) * 60} s={.8} flip={Math.cos(a) > 0} pose={{ holdF: 'gladius', armF: -1.4, elbowF: .3, propA: 80, shieldUp: .8 }} />; })}
    <MChar look={CAST.spaReb} x={960} y={950} s={.95} opacity={1 - prog(t, 2.6, 3.6)} pose={{ holdF: 'gladius', armF: -2.6, elbowF: .2, propA: 0 }} /></g>,
  fg: (T, t) => <><Dust T={T} x={960} y={950} w={1400} o={clamp(t / 2.5)} /><g transform="translate(980 990)" opacity={prog(t, 3.2, 3.8)}><rect x={-62} y={-50} width={124} height={100} rx={10} fill={RC.gold} stroke={P.ink} strokeWidth={6} transform="rotate(-70)" /></g></>,
  cam: (T, t) => ({ x: 960, y: lerp(600, 760, t / 4), z: lerp(1.1, 1.6, easeInOut(t / 4)) }), actors: [] });
sc({ a: S('f8'), bg: (T, t) => <AppianWay T={T} reveal={clamp(t / 4)} />, cam: (T, t) => ({ x: 960, y: lerp(560, 640, t / 6), z: lerp(1.0, 1.25, t / 6) }), actors: [] });
gfx(MapAppian, S('f8') + 5.6);
sc({ a: S('f9'), bg: (T) => <><Sky tone="night" T={T} /><Hills T={T} y={720} tone="night" vesuv={.8} /></>,
  cam: (T, t) => ({ x: 600 + t * 160, y: 600, z: 1.4 }),
  actors: [{ k: 'youReb', x: (T, t) => 500 + t * 160, y: Y, s: 1.2, p: (T) => ({ walk: 1, run: 1, phase: T * 14 }), e: 'sad' }] });
sc({ a: S('f10'), bg: (T) => <><Sky tone="day" T={T} /><Colonnade y={940} n={9} /><rect x={-240} y={940} width={2400} height={400} fill="#cdbb98" /></>,
  ui: (T) => stamp('EVIDENCE', S('f10') + 3, 3.6, 'Plutarch, Crassus 11')(T),
  actors: [{ k: { ...CAST.gla, cloak: '#efe6d2', crestC: '#efe6d2', helmet: 'none', hair: '#6a4a2a' }, id: 'pom', spk: '-', x: 760, y: Y, s: 1.35, p: { armF: -2.6, elbowF: .2 }, e: 'laugh' }, { k: 'cra', x: 1240, y: Y, s: 1.35, flip: true, e: 'angry', spk: '-' }],
  cam: (T, t) => ({ x: lerp(800, 1150, easeInOut(prog(t, 3, 6))), y: 560, z: 1.6 }) });

/* ====================== WAS IT REAL? ====================== */
sc({ a: S('r1'), bg: (T) => <PompeiiWall T={T} reveal={0} />, cam: (T, t) => ({ x: 960, y: 540, z: lerp(1.2, 1.0, t / 1.6) }),
  actors: [{ k: 'youReb', x: 1500, y: 1000, s: 1.2, o: .8, e: 'thinking', spk: '-' }] });
gfx(Sources, S('r2'));
sc({ a: S('r3'), bg: (T, t) => <PompeiiWall T={T} reveal={prog(T, S('r4') + 3, S('r4') + 6)} />,
  ui: (T) => stamp('MAYBE', S('r6') + .8, 5, 'date debated', 1560, 960)(T),
  actors: [{ k: 'youReb', x: 1500, y: 1000, s: 1.2, o: .85, flip: true, e: 'thinking', p: (T) => T > S('r5') ? { handF: 'point', armF: -1.6, elbowF: .1 } : {} }],
  cams: { r3: { x: 1450, y: 600, z: 1.8 }, r4: (T, t) => ({ x: lerp(1300, 700, easeInOut(prog(t, 2, 7))), y: lerp(600, 480, easeInOut(prog(t, 2, 7))), z: lerp(1.3, 1.9, easeInOut(prog(t, 2, 7))) }), r6: (T, t) => ({ x: lerp(700, 960, t / 7), y: 520, z: lerp(1.6, 1.1, t / 7) }) } });
sc({ a: S('r7'), bg: (T) => <><Sky tone="day" T={T} /><Hills T={T} y={720} /></>, grade: '#e8c890',
  mid: (T, t) => <Crowd T={T} n={9} y={940} s={.75} x0={300} x1={1650} seed={181} pose={(i) => ({ armF: t > 1 + i * .25 ? -2.6 : .1, elbowF: .2, handF: 'fist', expr: t > 1 + i * .25 ? 'fierce' : 'neutral' })} />,
  fg: (T) => FilmFrame(T), ui: (T) => stamp('MYTH', S('r7') + 5, 3.4, 'film, 1960', 960, 200)(T),
  cam: (T, t) => ({ x: 960, y: 560, z: lerp(1.05, 1.15, t / 8) }), actors: [] });
sc({ a: S('r8'), bg: (T) => <><Sky tone="dusk" T={T} /><Hills T={T} y={760} tone="dusk" vesuv={.6} /></>,
  cams: { r8: { x: 1000, y: 560, z: 1.8 }, r9: (T, t) => ({ x: lerp(1000, 960, t / 9), y: lerp(560, 440, t / 9), z: lerp(1.5, 1.0, easeInOut(t / 9)) }) },
  actors: [{ k: 'youReb', x: 1080, y: Y, s: 1.3, flip: true, e: 'thinking' }, { k: 'spaReb', x: 800, y: Y, s: 1.35, o: (T, t) => .7 * clamp((t - 2) / 2), e: 'happy', spk: '-' }] });

// close the list
scenes.sort((p, q) => p.a - q.a);
scenes.forEach((s, i) => { s.b = i < scenes.length - 1 ? scenes[i + 1].a : 9999; });
export const SHOTS = scenes;
