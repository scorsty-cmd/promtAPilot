import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P } from './art';
import { MChar, CAST, MLook, MPose, Expr, villager, Aurochs, Sheep, Dog } from './chars';
import { Sky, Spark, Crowd, Campfire, Embers, Dust, Smoke } from './sets';
import { C, Roofs, Interior, Cutaway, Mound, Excavation, Plain, Wheat, Volcano } from './sets3';
import { MapAnatolia, MapObsidian, Timeline, PlasterLayers, AurochsScale, Bones, HeadWounds, Equal, Family, Goddess, MapOrLeopard, Stamp } from './tgraphics';
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
const SPK: Record<string, string> = { you: 'YOU', youH: 'YOU', sis: 'SIS', mom: 'MOM', fat: 'FAT', fatH: 'FAT', hun: 'HUN', nei: 'NEI', tra: 'TRA', eld: 'ELD' };
const blinkAt = (T: number, s: number) => ((T + s * 1.7) % 3.9) < .12 ? 1 : 0;
const autoExpr = (text: string): Expr | null => /!$/.test(text) ? 'excited' : /\?$/.test(text) ? 'surprised' : null;
const gesture = (text: string, T: number, ln: any): MPose | null => {
  const k = T - ln.start;
  if (/\b(Look|Watch|There|Over there)\b/.test(text)) return { handF: 'point', armF: -1.55, elbowF: .1 };
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

/* ====================== ep08 helpers ====================== */
const KID = .82, SIS = .7;
const label = (T: number, a: number, b: number, txt: string, x: number, y: number, c = C.ochre) => T > a && T < b ? <g opacity={clamp((T - a) * 4) * (1 - prog(T, b - .3, b))} transform={`translate(${x} ${y}) rotate(-3)`}><rect x={-230} y={-50} width={460} height={78} rx={12} fill="rgba(241,236,224,.94)" stroke={c} strokeWidth={6} /><text x={0} y={6} fontFamily="Bowlby" fontSize={38} fill={c} textAnchor="middle">{txt}</text></g> : null;
const fog = (T: number, o: number) => <g opacity={o}>{Array.from({ length: 9 }).map((_, i) => { const R = rng(i + 61); return <ellipse key={i} cx={(R() * 2400 + T * 30 * (R() + .3)) % 2600 - 300} cy={100 + R() * 600} rx={400} ry={140} fill="#8a7e70" opacity={.35} />; })}</g>;
const Mat = (x: number, y: number) => <g transform={`translate(${x} ${y})`}><path d="M -260 0 L 260 0 L 230 -40 L -230 -40 Z" fill="#c8a868" stroke={P.ink} strokeWidth={5} />{Array.from({ length: 7 }).map((_, k) => <path key={k} d={`M ${-200 + k * 60} -12 l 16 -34 l 12 34 Z`} fill="#1a1820" stroke="#6a6a80" strokeWidth={2} />)}<circle cx={190} cy={-40} r={30} fill="#1a1820" stroke="#9a9ab0" strokeWidth={4} /><circle cx={182} cy={-48} r={8} fill="#fff" opacity={.6} /></g>;
const spears = (T: number, t0: number, x0: number, x1: number, y0: number, y1: number, n = 3) => <g>{Array.from({ length: n }).map((_, k) => { const p = prog(T, t0 + k * .18, t0 + k * .18 + .45); if (p <= 0) return null; const x = lerp(x0 + k * 60, x1 + k * 40, p), y = lerp(y0, y1, p) - Math.sin(p * Math.PI) * 160; const a = Math.atan2(y1 - y0 - Math.cos(p * Math.PI) * 500, x1 - x0) * 57;
  return <g key={k} transform={`translate(${x} ${y}) rotate(${p >= 1 ? 50 + k * 8 : a})`}><line x1={-90} y1={0} x2={90} y2={0} stroke="#6a4a2a" strokeWidth={7} /><path d="M 90 -8 L 120 0 L 90 8 Z" fill="#1a1820" /></g>; })}</g>;
const kids = (o: Partial<Actor> = {}) => o;

/* ====================== COLD OPEN — a town with no streets ====================== */
sc({ a: 0, bg: (T) => <Roofs T={T} tone="dawn" />, boil: 1.4,
  cam: (T, t) => ({ x: lerp(500, 1300, easeInOut(t / 4)), y: lerp(380, 560, easeInOut(t / 4)), z: lerp(1.9, 1.25, easeInOut(t / 4)) }), actors: [] });
sc({ a: S('o2'), bg: (T) => <Interior T={T} light={.7} hands={[[1600, 520, 10]]} fire={.4} />,
  shake: (T) => T < S('o4') ? .25 + Math.sin(T * 30) * .1 : 0,
  cams: { o2: (T, t) => ({ x: 440, y: lerp(300, 380, t / 3), z: 2.1 }), o3: (T, t) => ({ x: 1480, y: 640, z: lerp(2.1, 2.4, t / 2) }) },
  actors: [{ k: 'sis', x: 410, y: (T) => 520 + Math.sin(T * 18) * 6, s: 1.1, age: SIS, p: (T) => ({ armF: -2.6 + Math.sin(T * 18) * .2, elbowF: .4, lean: 6, handF: 'fist' }), e: 'laugh' },
    { k: 'you', x: 1480, y: 860, s: 1.15, age: KID, flip: true, p: (T) => T < S('o3') - .2 ? { sit: 1, lean: -40, armF: .1, elbowF: .4 } : { sit: 1, lean: -10, armF: -1.7, elbowF: .4, handF: 'open' }, sleep: false, e: 'sleepy' }],
  ex: { o3: { you: 'angry' } } });
sc({ a: S('o4'), bg: (T) => <Roofs T={T} tone="dawn" />,
  cam: (T, t) => ({ x: lerp(1480, 1100, easeInOut(prog(t, 1.2, 3.4))), y: lerp(760, 560, easeInOut(prog(t, 1.2, 3.4))), z: lerp(2.5, 1.3, easeInOut(prog(t, 1.2, 3.4))) }),
  actors: [{ k: 'you', x: 1480, y: (T, t) => lerp(1180, 935, easeOut(prog(t, .2, 1.6))), s: 1.0, age: KID, p: (T, t) => t < 1.6 ? { armF: -2.8, elbowF: .3 + Math.sin(t * 8) * .3, lean: 4 } : { armF: -2.4, elbowF: .6, handF: 'open', lean: -6 }, e: 'happy' }] });
sc({ a: S('o4') + 3.6, bg: (T, t) => <Cutaway T={T} reveal={easeOut(prog(t, 0, 1.6))} tone="dawn" />,
  cam: (T, t) => ({ x: lerp(960, 900, t / 3.5), y: lerp(520, 560, t / 3.5), z: lerp(1.25, 1.1, t / 3.5) }),
  ui: (T) => label(T, S('o4') + 4.2, S('o5'), 'NO STREETS · NO DOORS', 960, 160), actors: [] });
sc({ a: S('o5'), bg: (T) => <Interior T={T} light={.8} fire={.6} burial={0} hands={[[1600, 520, 10]]} />,
  cams: { o5: (T, t) => ({ x: 1380, y: 660, z: lerp(2.2, 2.5, t / 1.5) }), o6: { x: 760, y: 540, z: 2.0 }, o7: (T, t) => ({ x: 1380, y: 660, z: lerp(2.4, 2.9, t / 1.8) }) },
  actors: [{ k: 'you', x: 1380, y: 900, s: 1.15, age: KID, p: (T) => ({ kneel: 1, armF: T > S('o7') ? -1.2 : -.6, elbowF: .8, handF: T > S('o7') ? 'point' : 'open', lean: 12 }), e: 'happy' },
    { k: 'sis', x: 700, y: 920, s: 1.1, age: SIS, p: { armF: -.4, elbowF: 1.2 }, e: 'surprised' }],
  ex: { o7: { sis: 'scared' } } });
sc({ a: S('o8'), bg: (T, t) => <Interior T={T} light={.8} fire={.6} burial={easeOut(prog(t, .4, 2.4))} hands={[[1600, 520, 10]]} />, grade: '#e8dcd0',
  cam: (T, t) => ({ x: lerp(1500, 1560, easeInOut(prog(t, .2, 3))), y: lerp(660, 840, easeInOut(prog(t, .2, 3))), z: lerp(1.9, 1.4, easeInOut(prog(t, .2, 8.6))) }),
  ui: (T) => label(T, S('o8') + 5.4, E('o8'), 'COMPLETELY NORMAL', 960, 150),
  actors: [{ k: 'you', x: 1600, y: 840, s: 1.0, age: KID, p: { sit: 1, lean: -30, armF: .1, elbowF: .4 }, sleep: true, spk: '-' }] });
sc({ a: S('o9'), bg: (T) => <Roofs T={T} tone="day" />, boil: 1.4,
  cam: (T, t) => ({ x: lerp(1480, 960, easeInOut(t / 6)), y: lerp(800, 520, easeInOut(t / 6)), z: lerp(2.3, 1.0, easeInOut(t / 6)) }),
  actors: [{ k: 'you', x: 1380, y: 960, s: 1.0, age: KID, p: { armF: -2.6, elbowF: .3, handF: 'open' }, e: 'excited', spk: '-' }, { k: 'sis', x: 1580, y: 960, s: .95, age: SIS, flip: true, p: { armF: -2.4, elbowF: .4 }, e: 'laugh', spk: '-' }] });
gfx(MapAnatolia, S('o9') + 6.2);

/* ====================== HOME ====================== */
const homeHands = (T: number) => T > S('h11b') - .3 ? [[1600, 520, 10], [1480, 470, -8]] : [[1600, 520, 10]];
sc({ a: S('h1'), bg: (T, t) => <Interior T={T} light={1} fire={1} hands={[[1600, 520, 10]]} paint="geo" />,
  cam: (T, t) => ({ x: lerp(700, 1000, t / 10), y: 540, z: lerp(1.15, 1.05, t / 10) }),
  ui: (T) => <>{label(T, S('h1') + 6, E('h1'), 'ONE ROOM · ~5 STEPS WIDE', 960, 150)}</>,
  actors: [{ k: 'mom', x: 420, y: 920, s: 1.15, p: (T) => ({ kneel: 1, holdF: 'bowl', armF: -1.0 + Math.sin(T * 2) * .2, elbowF: 1.2, lean: 10 }), e: 'neutral', spk: '-' },
    { k: 'you', x: 1300, y: 900, s: 1.1, age: KID, p: { armF: -.6, elbowF: 1.2 }, spk: '-' }] });
sc({ a: S('h2'), bg: (T) => <Interior T={T} light={1} fire={1} hands={homeHands(T)} wet={T > S('h4') ? clamp((T - S('h6')) / 4) : 0} paint="geo" />,
  ui: (T) => <>{label(T, S('h3') + 1, S('h3') + 7, '"DIRTY" SIDE · oven, ladder', 420, 160, P.ink)}{label(T, S('h3') + 4, E('h3'), '"CLEAN" SIDE · platforms', 1500, 160, C.ochre)}</>,
  cams: { h3: (T, t) => ({ x: 960, y: 540, z: lerp(1.05, 1.0, t / 12) }), h9: 'wide' },
  actors: [{ k: 'mom', x: (T) => T < S('h4') ? 520 : 820, y: 920, s: 1.15, p: (T) => T > S('h6') ? { holdF: 'brush', armF: -1.9 + Math.sin(T * 5) * .4, elbowF: .6, propA: 30 } : T < S('h3') ? { armF: -1.5, elbowF: .2, handF: 'point' } : {}, e: 'angry' },
    { k: 'you', x: (T) => T < S('h3') ? 980 : 1120, y: 920, s: 1.1, age: KID, flip: true, p: (T) => T > S('h4') ? { holdF: 'bowl', armF: -1.1, elbowF: 1.2 } : { lean: -8, armF: -.3, elbowF: .8 }, e: 'worried' },
    { k: 'sis', x: 1460, y: 860, s: 1.05, age: SIS, flip: true, p: { sit: 1, armF: -.8, elbowF: 1.3 }, e: 'thinking' }],
  ex: { h4: { mom: 'neutral' }, h5: { you: 'angry' }, h6: { mom: 'happy' }, h8: { mom: 'happy', sis: 'thinking' } } });
gfx(PlasterLayers, S('h9'));
sc({ a: S('h10'), bg: (T) => <Interior T={T} light={1} fire={1} hands={homeHands(T)} wet={1 - prog(T, S('h11b'), S('h12'))} paint="geo" />,
  cams: { h11b: (T, t) => ({ x: 1480, y: 470, z: lerp(3.0, 2.4, easeOut(t / 2)) }), h11c: { x: 1150, y: 600, z: 2.0 }, h11d: { x: 1400, y: 560, z: 2.6 }, h12: (T, t) => ({ x: 1060, y: 480, z: lerp(1.6, 2.0, t / 2) }), h13: { x: 1025, y: 480, z: 2.2 }, h14: (T, t) => ({ x: 1025, y: lerp(560, 380, t / 9), z: lerp(2.0, 2.6, t / 9) }) },
  actors: [{ k: 'sis', x: 1440, y: 920, s: 1.05, age: SIS, flip: false, p: (T) => T > S('h11') + 2 && T < S('h11c') ? { armF: -1.85, elbowF: .3, handF: 'open', lean: 10 } : { armF: -.5, elbowF: 1.0 }, e: 'excited' },
    { k: 'mom', x: 1760, y: 920, s: 1.15, flip: true, p: { holdF: 'brush', armF: -1.0, elbowF: 1.0, propA: 30 }, e: 'happy' },
    { k: 'you', x: 1180, y: 920, s: 1.1, age: KID, p: (T) => T > S('h12') ? { armF: -1.55, elbowF: .1, handF: 'point' } : { holdF: 'bowl', armF: -1.1, elbowF: 1.2 }, e: 'happy' }],
  ex: { h11c: { you: 'laugh', sis: 'angry' }, h11d: { sis: 'angry' }, h12: { you: 'thinking' }, h14: { you: 'surprised' } } });

/* ====================== FOOD ====================== */
sc({ a: S('f1'), bg: (T) => <Roofs T={T} />, cam: (T, t) => ({ x: lerp(600, 1300, t / 7), y: lerp(500, 560, t / 7), z: lerp(1.3, 1.15, t / 7) }), actors: [] });
sc({ a: S('f2'), bg: (T) => <><Roofs T={T} walkers={false} /><ellipse cx={1200} cy={1000} rx={360} ry={60} fill="#8a6a4a" opacity={.5} /><ellipse cx={1150} cy={990} rx={120} ry={14} fill="#fff" opacity={.35} /></>,
  cams: { f2: { x: 1400, y: 640, z: 2.0 }, f3: (T, t) => ({ x: lerp(1100, 800, t / 1.2), y: 640, z: 2.0 }) },
  actors: [{ k: 'nei', x: 1560, y: 960, s: 1.2, flip: true, p: { armF: -2.4, elbowF: .4, handF: 'fist' }, e: 'angry' },
    { k: 'you', x: (T) => lerp(1340, 700, prog(T, S('f2'), E('f3'))), y: 960, s: 1.05, age: KID, flip: true, p: (T) => ({ run: 1, walk: 1, phase: T * 14, armF: -1.2, elbowF: 1.2 }), e: 'scared' }] });
sc({ a: S('f4'), bg: (T) => <><Plain T={T} y={560} marsh /><Wheat T={T} y0={900} rows={4} /></>,
  mid: (T) => <>{[0, 1, 2].map((k) => <MChar key={k} look={villager(k + 10)} x={300 + k * 520} y={880} s={.6} pose={{ crouch: 1, lean: 30, armF: -.5 + Math.sin(T * 3 + k) * .4, elbowF: .6 }} />)}{[0, 1, 2, 3].map((k) => <Sheep key={'s' + k} x={1400 + k * 140} y={760} s={.4} goat={k === 2} ph={T * 3 + k} walk={.2} flip={k % 2 === 1} />)}</>,
  cam: (T, t) => ({ x: lerp(800, 1200, t / 7), y: 640, z: lerp(1.2, 1.35, t / 7) }), actors: [] });
const wolfX = (T: number) => T < S('f7d') ? 1720 : lerp(1720, 2300, prog(T, S('f7d') + .8, S('f7d') + 2.2));
sc({ a: S('f5'), bg: (T) => <Plain T={T} y={560} marsh />,
  mid: (T) => <>{[0, 1, 2, 3, 4].map((k) => { const inW = T > S('f7b') ? clamp((T - S('f7b')) / 1.5) : 0; return <Sheep key={k} x={900 + k * 150 + (k === 2 ? inW * 120 : 0)} y={k === 2 ? 900 - inW * 80 : 940 + (k % 2) * 30} s={.6} goat={k === 3} ph={T * 3 + k} walk={k === 2 ? inW : .2} flip={k % 2 === 1} />; })}
    {T > S('f7c') - .4 && <g filter="url(#sil)"><Dog x={wolfX(T)} y={760} s={.7} flip={T < S('f7d') + .8} ph={T * 8} walk={T > S('f7d') + .8 ? 1 : 0} /></g>}
    {T > S('f7c') - .4 && T < S('f7d') + .8 && [0, 1].map((k) => <circle key={k} cx={wolfX(T) - 70 + k * 16} cy={680} r={5} fill="#ffd040" />)}
    {T > S('f7d') + .3 && [0, 1, 2].map((k) => { const p = prog(T, S('f7d') + .3 + k * .3, S('f7d') + .9 + k * .3); return p > 0 && p < 1 ? <circle key={'st' + k} cx={lerp(560, 1700, p)} cy={lerp(760, 720, p) - Math.sin(p * Math.PI) * 200} r={12} fill="#8a7a6a" stroke={P.ink} strokeWidth={3} /> : null; })}</>,
  cams: { f7c: (T, t) => ({ x: 1500, y: 640, z: lerp(1.6, 2.2, t / 2) }), f7d: (T, t) => ({ x: lerp(700, 1100, t / 2), y: 600, z: 1.6 }) },
  actors: [{ k: 'fat', x: 380, y: 960, s: 1.2, p: (T) => T < S('f7b') ? { holdF: 'stick', armF: -1.2, elbowF: .6, propA: 20 } : {}, o: (T) => T < S('f7b') ? 1 : 0, e: 'neutral' },
    { k: 'you', x: (T) => T < S('f7b') ? 660 : 560, y: 960, s: 1.1, age: KID, flip: (T) => T < S('f7b'), p: (T) => T > S('f7d') ? { armF: -2.8 + Math.sin(T * 9) * .4, elbowF: .3, handF: 'fist', lean: 8 } : { holdF: 'stick', armF: -1.0, elbowF: .7 }, e: 'worried' },
    { k: 'sis', x: 800, y: 960, s: 1.0, age: SIS, p: (T) => T > S('f7c') ? { armF: -1.55, elbowF: .1, handF: 'point' } : {}, o: (T) => T > S('f7b') ? 1 : 0, e: 'scared' }],
  ex: { f5: { you: 'sleepy' }, f6: { you: 'angry' }, f7: { fat: 'thinking' }, f7d: { you: 'fierce' } } });
const eat = (k: string, x: number, flip = false, age = 1, s = 1.1, e: Expr = 'neutral'): Actor => ({ k, x, y: 900, s, age, flip, p: (T) => ({ sit: 1, holdF: 'bowl', armF: -1.1 + Math.sin(T * 2 + x) * .15, elbowF: 1.4 }), e });
sc({ a: S('f8'), bg: (T) => <Interior T={T} light={.8} fire={1} hands={[[1600, 520, 10], [1480, 470, -8]]} paint="geo" />,
  cams: { f8: (T, t) => ({ x: 900, y: 600, z: lerp(1.2, 1.4, t / 7) }), f9: { x: 1150, y: 640, z: 2.3 }, f10: { x: 780, y: 640, z: 2.2 } },
  actors: [eat('mom', 760), { ...eat('sis', 1130, true, SIS, 1.0, 'sad'), p: { sit: 1, armF: -1.9, elbowF: .2, handF: 'open', lean: 6 } }, eat('you', 1380, true, KID, 1.05), eat('fat', 520, false, 1, 1.2)],
  ui: (T) => stamp('EVIDENCE', S('f8') + 4.6, 3.2, 'dental caries in many burials')(T), ex: { f10: { mom: 'angry', sis: 'worried' } } });
sc({ a: S('f11'), bg: (T) => <Roofs T={T} walkers={false} />,
  cam: (T, t) => ({ x: lerp(800, 1100, t / 8), y: 640, z: 1.7 }),
  ui: (T) => stamp('EVIDENCE', S('f11') + 2.4, 5, 'beeswax in pots · Roffet-Salque, Nature 2015')(T),
  actors: [{ k: 'sis', x: (T, t) => lerp(700, 1200, prog(t, 0, 4)), y: 960, s: 1.0, age: SIS, p: (T, t) => t < 4 ? { walk: 1, phase: t * 6, crouch: 1.2, lean: 20, holdF: 'bowl', armF: -1.1, elbowF: 1.2 } : { holdF: 'bowl', armF: -1.8, elbowF: 1.6 }, e: 'happy', spk: '-' },
    { k: 'nei', x: 1600, y: 960, s: 1.2, flip: true, o: (T, t) => t > 4.5 ? 1 : 0, p: { armF: -2.4, elbowF: .4, handF: 'fist' }, e: 'angry', spk: '-' }] });

/* ====================== THE HUNT ====================== */
sc({ a: S('u1'), bg: (T) => <Roofs T={T} tone="day" walkers={false} />,
  cams: { u1: (T, t) => ({ x: lerp(500, 800, t / 3), y: 600, z: 1.5 }), u3: { x: 1060, y: 600, z: 2.0 }, u5: { x: 1400, y: 600, z: 2.1 } },
  actors: [{ k: 'hun', x: (T) => lerp(-100, 600, prog(T, S('u1'), S('u2'))), y: 960, s: 1.3, p: walkP(0, 2.6, { holdF: 'spear', armF: -1.2, elbowF: .6, propA: 10 }), e: 'excited' },
    { k: 'fat', x: 960, y: 960, s: 1.25, flip: true, p: (T) => T > S('u3') ? { holdF: 'spear', armF: -1.2, elbowF: .6, propA: 10 } : {}, e: 'thinking' },
    { k: 'you', x: 1220, y: 960, s: 1.05, age: KID, flip: true, e: 'surprised' }, { k: 'mom', x: 1520, y: 960, s: 1.15, flip: true, e: 'worried' }],
  ex: { u3: { fat: 'happy' }, u4: { you: 'excited' }, u5: { mom: 'worried', you: 'happy' } } });
gfx(AurochsScale, S('u6'));
const ch = (T: number) => prog(T, S('u10') + .9, S('u11') + 1.4);
sc({ a: S('u7'), bg: (T) => <><Plain T={T} y={520} /><Wheat T={T} y0={1010} rows={3} /></>,
  mid: (T) => <><Aurochs x={T < S('u10') + .9 ? 1560 : lerp(1560, 600, ch(T) * ch(T))} y={900} s={.95} flip ph={T * (T > S('u10') ? 9 : 1)} walk={T > S('u10') + .9 ? 1 : .2} charge={T > S('u10') + .9 ? 1 : 0} head={T > S('u8') && T < S('u10') ? -.3 : 0} />{spears(T, S('u10') + .15, 400, 1400, 760, 760)}</>,
  hits: hitsOf('hunt'), shake: (T) => T > S('u10') + .9 && T < S('u12') - .3 ? .4 : 0,
  cams: { u7: { x: 520, y: 620, z: 1.9 }, u8: (T, t) => ({ x: lerp(1300, 1500, t / 2), y: 600, z: lerp(1.8, 2.2, t / 2) }), u9: { x: 560, y: 640, z: 2.0 }, u10: (T, t) => ({ x: 900, y: 600, z: lerp(1.6, 1.25, t) }), u11: (T, t) => ({ x: lerp(900, 640, t / 1.4), y: 620, z: lerp(1.3, 1.6, t / 1.4) }) },
  actors: [{ k: 'hun', x: 300, y: 980, s: 1.2, p: (T) => T > S('u10') && T < S('u10') + .5 ? { holdF: 'spear', armF: -2.6, elbowF: .4, propA: -30, lean: -8 } : T > S('u10') ? { armF: -1.5, elbowF: .2, handF: 'open', lean: 10, crouch: .5 } : { holdF: 'spear', crouch: 1.4, lean: 20, armF: -1.0, elbowF: .7, propA: 70 }, e: 'fierce' },
    { k: 'fatH', x: 560, y: 990, s: 1.2, p: (T) => T > S('u10') + .2 && T < S('u10') + .7 ? { holdF: 'spear', armF: -2.6, elbowF: .4, propA: -30 } : T > S('u11') ? { run: 1, walk: 1, phase: T * 14, armF: -1.2, elbowF: 1 } : { holdF: 'spear', crouch: 1.4, lean: 20, armF: -1.0, elbowF: .7, propA: 70 }, e: 'fierce' },
    { k: 'youH', x: (T) => T > S('u11') + .6 ? lerp(800, 700, prog(T, S('u11') + .6, S('u11') + 1)) : 800, y: 1000, s: 1.05, age: KID, p: (T) => T > S('u11') + 1 ? { kneel: 1, lean: -20, armF: .2, elbowF: .4, hurt: .5 } : T > S('u10') + .4 && T < S('u10') + .9 ? { holdF: 'spear', armF: -2.6, elbowF: .4, propA: -30 } : { holdF: T > S('u10') + .9 ? 'none' : 'spear', crouch: 1.6, lean: 16, armF: -1.0, elbowF: .7, propA: 70 }, e: 'scared' }],
  ex: { u7: { hun: 'fierce' }, u9: { fatH: 'worried' }, u10: { hun: 'fierce' } } });
sc({ a: S('u12'), bg: (T) => <Interior T={T} light={.9} fire={.8} paint="hunt" hands={[[1600, 520, 10]]} />,
  cam: (T, t) => ({ x: lerp(1360, 1460, t / 12), y: lerp(330, 300, t / 12), z: lerp(2.3, 2.0, t / 12) }), actors: [],
  ui: (T) => stamp('MAYBE', S('u12') + 7.4, 4.6, 'real hunts? myths? both?', 1560, 860)(T) });
sc({ a: S('u13'), bg: (T) => <Plain T={T} y={520} />, mid: (T) => <Aurochs x={1250} y={940} s={.95} flip down={1} />,
  cams: { u13b: { x: 820, y: 640, z: 2.1 }, u13c: (T, t) => ({ x: lerp(1000, 900, t / 2), y: 620, z: 1.7 }), u13d: { x: 1500, y: 600, z: 2.0 } },
  actors: [{ k: 'hun', x: 1520, y: 980, s: 1.25, flip: true, p: { holdF: 'spear', armF: -2.6, elbowF: .3, propA: -10 }, e: 'laugh' }, { k: 'fatH', x: 1020, y: 980, s: 1.2, flip: true, p: { armF: -.7, elbowF: 1.2 }, e: 'happy' },
    { k: 'youH', x: 760, y: 990, s: 1.05, age: KID, p: (T) => T > S('u13b') ? { armF: -1.4, elbowF: .4, handF: 'open' } : { kneel: 1, armF: .2, elbowF: .4 }, e: 'excited' }],
  ex: { u13c: { fatH: 'laugh', youH: 'sad' }, u13d: { hun: 'laugh', youH: 'worried' } } });
sc({ a: S('u14'), bg: (T) => <><Roofs T={T} tone="dusk" walkers={false} /><Campfire x={960} y={990} T={T} s={.9} /></>, fg: (T) => <Embers T={T} n={20} o={.5} />,
  mid: (T) => <Crowd T={T} n={9} y={1000} s={.75} x0={200} x1={1800} seed={41} lookOf={(i) => villager(i + 20)} pose={(i) => ({ sit: 1, holdF: i % 2 ? 'bowl' : 'none', armF: -1.2 + Math.sin(T * 3 + i) * .3, elbowF: 1.3, expr: i % 3 ? 'laugh' : 'happy' })} />,
  cam: (T, t) => ({ x: 960, y: lerp(560, 640, t / 9), z: lerp(1.1, 1.45, t / 9) }),
  ui: (T) => label(T, S('u14') + 6.4, E('u14'), '→ HORNS INTO THE WALLS', 960, 150), actors: [] });

/* ====================== TRADE: the black glass ====================== */
sc({ a: S('t1'), bg: (T) => <Roofs T={T} walkers={false} />, mid: (T) => Mat(1180, 990),
  cam: (T, t) => ({ x: lerp(800, 1100, t / 6.7), y: 640, z: lerp(1.3, 1.6, t / 6.7) }),
  actors: [{ k: 'tra', x: (T, t) => lerp(400, 1440, easeOut(prog(t, 0, 4))), y: 960, s: 1.2, flip: false, p: (T, t) => ({ ...walkP(0, 4)(T, t), holdF: 'basket', armF: -1.1, elbowF: .9 }), e: 'happy', spk: '-' }] });
sc({ a: S('t2'), bg: (T) => <Roofs T={T} walkers={false} />, mid: (T) => Mat(1180, 990),
  cams: { t2: (T, t) => ({ x: 1360, y: 600, z: lerp(1.9, 2.2, t / 4) }), t4: { x: 1180, y: 620, z: 2.0 },
    t5: (T, t) => ({ x: 860, y: 600, z: lerp(2.4, 2.9, t / 2.3) }), t7: { x: 860, y: 600, z: 2.3 }, t8: (T, t) => ({ x: 1050, y: 620, z: lerp(1.5, 1.7, t / 6) }) },
  ui: (T) => stamp('EVIDENCE', S('t8') + 1.2, 5, 'obsidian mirrors · c. 6000 BC')(T),
  actors: [{ k: 'tra', x: 1500, y: 960, s: 1.2, flip: true, p: (T) => T > S('t4') - .3 && T < S('t5') ? { holdF: 'mirror', armF: -1.4, elbowF: .3 } : { armF: -1.2, elbowF: .9, handF: 'open' }, e: 'happy' },
    { k: 'you', x: 880, y: 960, s: 1.05, age: KID, p: (T) => T > S('t5') - .3 && T < S('t8') ? { holdF: 'mirror', armF: -1.75, elbowF: 1.5 } : {}, e: 'surprised' },
    { k: 'sis', x: 640, y: 960, s: 1.0, age: SIS, o: (T) => T > S('t3') ? 1 : 0, e: 'happy', spk: '-' }],
  ex: { t5: { you: 'excited' }, t6: { tra: 'happy', you: 'thinking' }, t7: { you: 'scared' }, t7b: { tra: 'laugh' }, t7c: { you: 'excited' } } });
gfx(MapObsidian, S('t9'));
const er = (T: number) => clamp((T - S('t10') + .6) * 1.5);
sc({ a: S('t10'), bg: (T) => <Roofs T={T} tone="dusk" erupt={er(T)} walkers={false} />,
  mid: (T) => <>{[0, 1, 2, 3, 4].map((k) => <MChar key={k} look={villager(k + 30)} x={200 + k * 380 + Math.sin(k) * 40} y={700 + (k % 2) * 60} s={.36} flip={k % 2 === 0} pose={{ run: 1, walk: 1, phase: T * 14 + k, armF: -2.4, elbowF: .3, expr: 'scared' }} />)}</>,
  shake: (T) => T > S('t10') ? .18 : 0,
  cams: { t10: (T, t) => ({ x: lerp(1500, 1450, t / 2.5), y: lerp(300, 400, t / 2.5), z: lerp(2.6, 2.0, t / 2.5) }), t11: (T, t) => ({ x: 900, y: 620, z: lerp(1.5, 1.8, t / 2.3) }) },
  actors: [{ k: 'sis', x: 760, y: 960, s: 1.0, age: SIS, p: { armF: -1.55, elbowF: .1, handF: 'point' }, e: 'scared' }, { k: 'fat', x: 1080, y: 960, s: 1.25, flip: true, p: { armF: -2.5, elbowF: .4, handF: 'open' }, e: 'fierce' }] });
sc({ a: S('t12'), bg: (T) => <Interior T={T} light={.7} fire={.9} paint="map" erupt={clamp((T - S('t12') - 6) * 2)} hands={[[1600, 520, 10]]} />,
  cam: (T, t) => ({ x: lerp(1300, 1400, t / 12), y: lerp(400, 300, t / 12), z: lerp(1.8, 2.3, t / 12) }), actors: [] });
gfx(MapOrLeopard, S('t13'));

/* ====================== LIFE ====================== */
sc({ a: S('l1'), bg: (T) => <Cutaway T={T} />, fg: (T) => <>{[200, 700, 1200, 1700].map((x, k) => <Smoke key={k} T={T + k} x={x} y={500} o={.35} s={.8} />)}</>,
  cam: (T, t) => ({ x: lerp(700, 1200, t / 9), y: 560, z: lerp(1.35, 1.2, t / 9) }), actors: [] });
sc({ a: S('l2'), bg: (T) => <Interior T={T} light={.3} fire={1} hands={[[1600, 520, 10], [1480, 470, -8]]} />, fg: (T) => fog(T, .8), grade: '#d8ccbc',
  cams: { l2: { x: 860, y: 600, z: 2.1 }, l3: (T, t) => ({ x: 640, y: 600, z: lerp(1.8, 2.1, t / 4) }) },
  actors: [{ k: 'you', x: 860, y: 920, s: 1.1, age: KID, p: (T) => ({ sit: 1, lean: 14 + Math.max(0, Math.sin(T * 9)) * 10, armF: -1.6, elbowF: 2.0, handF: 'fist' }), e: 'worried' },
    { k: 'mom', x: 460, y: 920, s: 1.15, p: (T) => ({ kneel: 1, holdF: 'bowl', armF: -1.0, elbowF: 1.2 }), e: 'neutral' }] });
gfx(Bones, S('l4'));
sc({ a: S('l5'), bg: (T) => <Roofs T={T} walkers={false} />,
  cams: { l7: (T, t) => ({ x: 1000, y: 600, z: lerp(1.6, 1.8, t / 2) }), l7c: { x: 500, y: 640, z: 2.4 } },
  actors: [{ k: 'nei', x: 1360, y: 960, s: 1.2, flip: true, p: (T) => ({ armF: -2.0 + Math.sin(T * 6) * .3, elbowF: .4, handF: 'point' }), e: 'angry' },
    { k: 'fat', x: 860, y: 960, s: 1.25, p: (T) => ({ armF: -1.6, elbowF: .3, handF: 'fist' }), e: 'angry' },
    { k: 'mom', x: (T) => T < S('l7') ? 300 : lerp(300, 1100, easeOut(prog(T, S('l7'), S('l7') + .8))), y: 960, s: 1.15, p: (T) => T > S('l7') ? { armF: -2.6, elbowF: .2, handF: 'open' } : walkP(0, 0)(T, 0), e: 'fierce' },
    { k: 'sis', x: 520, y: 960, s: 1.0, age: SIS, e: 'worried' }],
  ex: { l7b: { nei: 'thinking', fat: 'neutral' }, l7c: { sis: 'angry', nei: 'angry' } } });
gfx(HeadWounds, S('l8'));
gfx(Equal, S('l9'));
sc({ a: S('l10'), bg: (T) => <Roofs T={T} tone="dusk" walkers={false} />,
  cams: { l10: (T, t) => ({ x: lerp(1000, 960, t / 2.6), y: 680, z: 2.0 }), l12: (T, t) => ({ x: 860, y: 680, z: lerp(2.2, 2.6, t / 1.1) }) },
  actors: [{ k: 'sis', x: 860, y: 990, s: 1.0, age: SIS, p: { sit: 1, armF: -.8, elbowF: 1.3 }, e: 'excited' }, { k: 'youH', x: 1120, y: 990, s: 1.05, age: KID, flip: true, p: { sit: 1, holdF: 'spear', armF: -1.2, elbowF: .9, propA: 10 }, e: 'happy' }],
  ex: { l11: { youH: 'laugh' }, l12: { sis: 'fierce' } } });

/* ====================== DEATH: the storyteller ====================== */
sc({ a: S('d1'), bg: (T) => <Interior T={T} light={0} fire={.7} dark={.25} hands={[[1600, 520, 10], [1480, 470, -8]]} />, grade: '#b8b0c8',
  cam: (T, t) => ({ x: lerp(1200, 1500, t / 9.4), y: 660, z: lerp(1.4, 2.0, t / 9.4) }),
  actors: [{ k: 'eld', x: 1560, y: 860, s: 1.15, flip: true, sleep: true, p: { sit: 1, lean: -36, armF: .2, elbowF: .3 }, spk: '-' },
    { k: 'you', x: 1200, y: 920, s: 1.1, age: KID, p: { kneel: 1, armF: -.8, elbowF: 1.4, lean: 14 }, e: 'sad', spk: '-' }] });
sc({ a: S('d2'), bg: (T) => <Interior T={T} light={.4} fire={.8} hands={[[1600, 520, 10], [1480, 470, -8]]} />, grade: '#c8c0d0',
  cams: { d3b: { x: 1160, y: 620, z: 2.2 }, d3c: (T, t) => ({ x: 860, y: 600, z: lerp(2.0, 2.3, t / 2.5) }) },
  actors: [{ k: 'you', x: 1380, y: 920, s: 1.1, age: KID, flip: true, e: 'sad' }, { k: 'mom', x: 820, y: 920, s: 1.15, p: { kneel: 1, armF: -.6, elbowF: 1.2 }, e: 'sad' },
    { k: 'sis', x: 1140, y: 920, s: 1.0, age: SIS, flip: true, p: (T) => T > S('d3c') + 1 ? { holdF: 'bowl', armF: -1.2, elbowF: 1.0 } : {}, e: 'sad' }],
  ex: { d3: { mom: 'sad' }, d3c: { mom: 'happy' } } });
sc({ a: S('d4'), bg: (T, t) => <Interior T={T} light={.4} fire={.8} burial={easeOut(prog(t, 1, 3.5))} hands={[[1600, 520, 10], [1480, 470, -8]]} />, grade: '#c8c0d0',
  cam: (T, t) => ({ x: lerp(1500, 1440, t / 8), y: lerp(760, 960, easeInOut(prog(t, .5, 4))), z: lerp(1.4, 1.9, t / 8) }), actors: [] });
gfx(Family, S('d5'));
sc({ a: S('d6'), bg: (T) => <Interior T={T} light={0} fire={.6} dark={.3} burial={.55} hands={[[1600, 520, 10], [1480, 470, -8]]} />, grade: '#a8a8c8',
  cams: { d6: { x: 1500, y: 720, z: 2.0 }, d7: (T, t) => ({ x: lerp(1500, 1450, t / 3), y: lerp(720, 860, t / 3), z: lerp(2.0, 1.6, t / 3) }) },
  actors: [{ k: 'sis', x: 1340, y: 860, s: 1.0, age: SIS, p: { sit: 1, armF: -.6, elbowF: 1.4 }, e: 'worried' }, { k: 'you', x: 1640, y: 860, s: 1.05, age: KID, flip: true, p: { sit: 1, lean: -10, armF: -.6, elbowF: 1.2 }, e: 'sad' }],
  ex: { d7: { you: 'happy', sis: 'happy' } } });
sc({ a: S('d8'), bg: (T, t) => <Interior T={T} light={.5} fire={.7} burial={1} skull={easeOut(prog(t, 3, 5))} hands={[[1600, 520, 10], [1480, 470, -8]]} />,
  cam: (T, t) => { const z = lerp(1.6, 3.0, easeInOut(prog(t, 2, 10))); return { x: Math.min(lerp(1560, 1760, easeInOut(prog(t, 1, 5))), 2150 - 960 / z), y: Math.min(lerp(900, 1060, easeInOut(prog(t, 1, 5))), 1290 - 540 / z), z }; },
  ui: (T) => stamp('EVIDENCE', S('d8') + 7, 4, 'plastered skulls · Hodder 2006')(T), actors: [] });

/* ====================== BUILD: house on house ====================== */
sc({ a: S('b1'), bg: (T) => <><Interior T={T} light={1} fire={.6} hands={[[1600, 520, 10], [1480, 470, -8]]} /><path d="M 820 -40 L 860 120 L 830 260 L 880 420 M 1700 0 L 1660 180 L 1720 330" stroke={P.ink} strokeWidth={6} fill="none" /></>,
  cam: (T, t) => ({ x: lerp(800, 1100, t / 4.8), y: 520, z: lerp(1.6, 1.3, t / 4.8) }),
  actors: [{ k: 'youH', x: 1200, y: 920, s: 1.25, p: { armF: -1.0, elbowF: 1.2 }, e: 'thinking', spk: '-' }] });
sc({ a: S('b2'), bg: (T) => <Roofs T={T} walkers={false} />,
  cams: { b3: { x: 1180, y: 600, z: 2.3 }, b4: (T, t) => ({ x: 900, y: 640, z: lerp(1.8, 1.4, t / 1.7) }) },
  actors: [{ k: { ...CAST.fat, hair: '#9a9488', wrinkles: true } as any, id: 'fat', spk: 'FAT', x: 820, y: 960, s: 1.2, p: (T) => T > S('b4') ? { armF: -1.55, elbowF: .1, handF: 'point', lean: 8 } : {}, e: 'happy' }, { k: 'youH', x: 1180, y: 960, s: 1.25, flip: true, e: 'surprised' }],
  ex: { b4: { youH: 'surprised' } } });
sc({ a: S('b5'), bg: (T, t) => <Mound T={T} p={lerp(.05, 1, easeInOut(prog(T, S('b5'), E('b6'))))} />,
  cam: (T, t) => ({ x: 960, y: lerp(720, 520, prog(T, S('b5'), E('b6'))), z: lerp(1.5, 1.05, prog(T, S('b5'), E('b6'))) }),
  ui: (T) => label(T, S('b6') + 1, E('b6'), '~1,100 YEARS · ~20 m', 960, 150), actors: [] });
sc({ a: S('b7'), bg: (T, t) => <Cutaway T={T} tone="day" />,
  mid: (T, t) => <g opacity={clamp(t * 1.5)}>{[0, 1, 2].map((k) => <g key={k} transform={`translate(0 ${200 + k * 170})`}><rect x={-240} y={600} width={2400} height={160} fill={[C.mud, C.mudD, '#7a5a3a'][k]} stroke={P.ink} strokeWidth={5} /><text x={120} y={700} fontFamily="Brush" fontSize={44} fill={C.plaster}>{['your old house', "grandmother's house", "her grandmother's house"][k]}</text></g>)}</g>,
  cams: { b7: (T, t) => ({ x: 960, y: lerp(540, 760, t / 2.1), z: 1.1 }), b8: (T, t) => ({ x: 960, y: lerp(760, 960, t / 3.8), z: lerp(1.1, 1.0, t / 3.8) }) }, actors: [] });
sc({ a: S('b9'), bg: (T) => <Mound T={T} p={1} />, cam: (T, t) => ({ x: 960, y: 520, z: lerp(1.05, 1.15, t / 7) }),
  ui: (T) => <>{label(T, S('b9') + 3.2, E('b9') + .3, 'HÖYÜK = MOUND', 620, 170)}{label(T, S('b9') + 5.6, E('b9') + .3, 'ÇATAL = FORK', 1300, 170, P.ink)}</>, actors: [] });

/* ====================== THE END ====================== */
sc({ a: S('z1'), bg: (T) => <Roofs T={T} tone="dusk" walkers={false} />,
  mid: (T) => <Crowd T={T} tw={T * .4} n={8} y={980} s={.8} x0={-200} x1={1900} walk={.6} seed={51} lookOf={(i) => villager(i + 40)} pose={(i) => ({ walk: 1, phase: T * 7 + i, holdF: i % 2 ? 'basket' : 'none', armF: -1.1, elbowF: .8, expr: 'sad' })} />,
  cam: (T, t) => ({ x: lerp(900, 1200, t / 9.5), y: 560, z: lerp(1.25, 1.05, t / 9.5) }), actors: [] });
sc({ a: S('z2'), bg: (T) => <><Plain T={T} y={560} tone="dusk" /><Mound T={T} p={1} /></>, fg: (T) => <Dust T={T} x={960} y={1000} w={2000} o={.6} />,
  cam: (T, t) => ({ x: 960, y: 560, z: lerp(1.2, 1.05, t / 6.5) }), actors: [] });
sc({ a: S('z3'), bg: (T) => <Interior T={T} light={.5} fire={.5} hands={[[1600, 520, 10], [1480, 470, -8], [1720, 600, 20]]} />, grade: '#e0c8b0',
  cams: { z3: (T, t) => ({ x: lerp(1300, 1200, t / 5), y: 600, z: lerp(1.6, 1.9, t / 5) }), z4: { x: 1500, y: 600, z: 2.2 }, z5: (T, t) => ({ x: 1150, y: 560, z: lerp(2.2, 2.7, t / 1.2) }) },
  actors: [{ k: 'youH', x: 1150, y: 920, s: 1.25, p: { armF: -1.0, elbowF: 1.2 }, e: 'thinking' }, { k: 'sis', x: 1500, y: 920, s: 1.15, age: .95, flip: true, e: 'sad' }],
  ex: { z5: { youH: 'happy' } } });

/* ====================== WAS IT REAL? ====================== */
sc({ a: S('r1'), bg: (T) => <Mound T={T} p={1} today={1} />, cam: (T, t) => ({ x: 960, y: lerp(540, 500, t / 12), z: lerp(1.25, 1.05, t / 12) }),
  ui: (T) => label(T, S('r1') + 1, S('r1') + 5, 'JAMES MELLAART · 1958', 960, 150), actors: [] });
gfx(Goddess, S('r2'));
sc({ a: S('r4'), bg: (T) => <Interior T={T} light={1} fire={0} paint="vulture" />, cam: (T, t) => ({ x: 1400, y: 300, z: lerp(2.0, 2.3, t / 8) }),
  ui: (T) => stamp('MAYBE', S('r4') + 3.4, 4.6, 'drawings never seen by others', 1500, 860)(T), actors: [] });
sc({ a: S('r5'), bg: (T) => <Excavation T={T} />, cam: (T, t) => ({ x: lerp(800, 1000, t / 11.6), y: 640, z: lerp(1.4, 1.15, t / 11.6) }),
  ui: (T) => label(T, S('r5') + 7.4, E('r5'), 'UNESCO · 2012', 960, 150), actors: [] });
gfx(Timeline, S('r6'));
sc({ a: S('r7'), bg: (T) => <Roofs T={T} tone="dusk" walkers={false} />,
  cams: { r7: (T, t) => ({ x: lerp(1300, 1200, t / 5), y: 660, z: 1.9 }), r8: (T, t) => ({ x: lerp(1200, 960, easeInOut(t / 10)), y: lerp(660, 480, easeInOut(t / 10)), z: lerp(1.9, 1.0, easeInOut(t / 10)) }) },
  actors: [{ k: 'youH', x: 1240, y: 980, s: 1.05, age: KID, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'thinking' }, { k: 'sis', x: 1440, y: 980, s: .95, age: SIS, flip: true, p: { sit: 1, armF: -.6, elbowF: 1.2 }, e: 'happy', spk: '-' }] });


// close the list
scenes.sort((p, q) => p.a - q.a);
scenes.forEach((s, i) => { s.b = i < scenes.length - 1 ? scenes[i + 1].a : 9999; });
export const SHOTS = scenes;
