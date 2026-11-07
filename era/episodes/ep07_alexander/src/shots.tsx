import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P } from './art';
import { MChar, CAST, MLook, MPose, Expr, Horse, Elephant, Chariot, macedon, persian, indian, RC } from './chars';
import { Sky, Hills, Spark, Crowd, Torch, Campfire, Embers, Dust, Smoke, Ship, Sea } from './sets';
import { A, Pella, Mieza, Theatre, Agora, Pithos, Hellespont, Granicus, Knot, Temple, Host, RoyalTent, Plain, Phalanx, Persepolis, Feast, Hydaspes, Rain, Palm, Desert, Babylon, Alexandria } from './sets2';
import { Rewind, MapMacedon, MapAsia1, MapAsia2, MapAsia3, GoldenMean, SarissaGfx, Treasure, Sources, Worlds, Stamp } from './tgraphics';
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
const SPK: Record<string, string> = { you: 'YOU', youSt: 'YOU', youCav: 'YOU', youFst: 'YOU', ale: 'ALE', aleWar: 'ALE', aleCav: 'ALE', alePer: 'ALE', hep: 'HEP', hepWar: 'HEP', ari: 'ARI', phi: 'PHI', cle: 'CLE', cleWar: 'CLE', dio: 'DIO', par: 'PAR', dar: 'DAR', sis: 'SIS', cal: 'CAL', por: 'POR', coe: 'COE', sol: 'SOL' };
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

/* ====================== ep07 helpers ====================== */
const sunFlare = (x: number, y: number, T: number) => <g><circle cx={x} cy={y} r={120} fill="#ffe8a0" opacity={.9} /><circle cx={x} cy={y} r={220 + Math.sin(T) * 10} fill="#ffe8a0" opacity={.25} /></g>;
const rider = (look: MLook, x: number, y: number, s: number, pose: MPose = {}, flip = false, age = 1) => <MChar look={look} x={x} y={y - 232 * s} s={s * .8} age={age} flip={flip} pose={{ sit: 1, armF: -1.2, elbowF: .6, ...pose }} />;
const twoVersions = (T: number, a: number, b: number, label: string) => T > a && T < b ? <g opacity={clamp((T - a) * 4) * (1 - prog(T, b - .3, b))}><rect x={60} y={900} width={560} height={84} fill="#1c1410" /><text x={340} y={956} fontFamily="Cinzel" fontWeight={700} fontSize={36} fill="#f2e2c4" textAnchor="middle">{label}</text></g> : null;

/* ====================== COLD OPEN — the feast at Samarkand, 328 BC ====================== */
const kill = S('o6') + .55;
sc({ a: 0, bg: (T) => <Feast T={T} chaos={clamp((T - S('o5')) / 1.2)} />,
  near: (T) => <g opacity={.9}>{[0, 1, 2].map((k) => <MChar key={k} look={macedon(k + 5, 'bare')} x={-120 + k * 1100} y={1340} s={1.5} flip={k > 0} pose={{ sit: 1, holdF: 'goblet', armF: -1.4, elbowF: 1.4, expr: 'surprised' }} />)}</g>,
  hits: hitsOf('open'), shake: (T) => T > S('o5') - .2 && T < kill + .4 ? .35 : 0,
  cams: { o1: (T, t) => ({ x: lerp(1350, 1250, t / 3.5), y: 520, z: lerp(2.4, 2.0, t / 3.5) }), o2: { x: 600, y: 560, z: 2.2 }, o3: (T, t) => ({ x: 1250, y: 520, z: lerp(2.0, 2.5, t / 4.5) }),
    o4: { x: 900, y: 560, z: 2.3 }, o5: (T, t) => ({ x: lerp(640, 760, t / 1.6), y: 540, z: 2.4 }), o6: (T, t) => ({ x: lerp(900, 1000, t / 1.2), y: 540, z: lerp(1.5, 1.9, t / 1.2) }) },
  ui: (T) => T > kill && T < S('o7') ? <rect width={1920} height={1080} fill={T < kill + .08 ? '#fff' : '#000'} /> : null,
  actors: [{ k: 'alePer', x: (T) => T > S('o6') ? lerp(640, 900, prog(T, S('o6'), kill)) : 640, y: Y, s: 1.3, p: (T) => T < S('o2') + 1.2 ? { sit: 1, holdF: 'goblet', armF: -1.3, elbowF: 1.5 } : T < S('o5') + .8 ? { handF: 'fist', armF: -.8, elbowF: .9 } : { holdF: 'spear', armF: -1.62, elbowF: .1, propA: 92, lean: 18, crouch: .7 }, e: 'angry' },
    { k: 'youFst', x: 960, y: Y + 10, s: 1.2, p: (T) => T > S('o4') ? { armF: -1.7, elbowF: .2, handF: 'open', lean: -6 } : { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'scared' },
    { k: 'cle', x: 1300, y: Y, s: 1.35, flip: true, p: (T) => ({ handF: T < S('o2') ? 'fist' : 'point', armF: -2.2 + Math.sin(T * 5) * .2, elbowF: .4, lean: -4 }), e: 'fierce' },
    { k: macedon(2), id: 'guard', spk: '-', x: 300, y: Y, s: 1.2, p: (T) => T > S('o5') + .8 ? { armF: .1, elbowF: .3, expr: 'scared' } : { holdF: 'spear', propA: 0 }, o: (T) => T > S('o5') - 1 ? 1 : 0 }],
  ex: { o2: { cle: 'laugh' }, o3: { alePer: 'fierce' }, o4: { alePer: 'fierce', cle: 'angry' }, o5: { youFst: 'scared' } } });
sc({ a: S('o7'), bg: (T) => <Feast T={T} chaos={1} dark={.55} />, boil: 1.2,
  cam: (T, t) => ({ x: 960, y: lerp(560, 520, t / 8), z: lerp(1.25, 1.55, t / 8) }),
  actors: [{ k: 'alePer', x: 860, y: Y, s: 1.3, p: { kneel: 1, armF: .2, elbowF: .3, lean: 6 }, e: 'sad', spk: '-' }, { k: 'youFst', x: 1180, y: Y, s: 1.25, flip: true, p: { armF: .1, elbowF: .2 }, e: 'scared' }],
  ex: { o8: { youFst: 'sad' } }, grade: '#c8b0a0' });
sc({ a: S('o9'), bg: (T) => <Mieza T={T} tone="dawn" />, boil: 1.4,
  cam: (T, t) => ({ x: lerp(1100, 960, t / 5), y: lerp(420, 520, t / 5), z: lerp(1.5, 1.1, t / 5) }),
  actors: [{ k: 'ari', x: 1250, y: Y - 40, s: 1.2, flip: true, p: { holdF: 'scroll', armF: -1.1, elbowF: 1.1 }, e: 'thinking', spk: '-' }, { k: 'ale', x: 760, y: Y, s: 1.2, age: .8, p: { sit: 1, holdF: 'tablet', armF: -1.0, elbowF: 1.5 }, e: 'happy', spk: '-' }, { k: 'youSt', x: 520, y: Y, s: 1.2, age: .8, p: { sit: 1, holdF: 'tablet', armF: -1.0, elbowF: 1.5 }, e: 'neutral', spk: '-' }] });
gfx(Rewind, S('o9') + 5.6);

/* ====================== PELLA: Bucephalus ====================== */
gfx(MapMacedon, S('p1'));
const buceRear = (T: number) => T < S('p7') ? Math.max(0, Math.sin(T * 2.6)) * .55 : 0;
sc({ a: S('p2'), bg: (T) => <Pella T={T} />, mid: (T) => <><Horse x={1500} y={Y + 10} s={1.2} ph={T * 3} gallop={.15 + buceRear(T) * .6} c="#1a1410" mane="#0a0806" star rear={buceRear(T)} cloth={A.purple} /><MChar look={macedon(4, 'bare')} x={1160} y={Y} s={1.0} flip pose={{ holdF: 'reins', armF: -1.4, elbowF: .3, lean: -14, expr: 'scared' }} /></>,
  wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'phi', x: 520, y: Y, s: 1.35, p: (T) => ({ armF: -1.4, elbowF: .3, handF: T > S('p4') ? 'open' : 'point' }), e: 'angry' }, { k: { ...CAST.par, outfit: 'tunic', cloth: '#8a2a2a' }, id: 'par', spk: '-', x: 260, y: Y, s: 1.25, e: 'neutral' },
    { k: 'ale', x: 860, y: Y, s: 1.2, age: .6, e: 'fierce' }, { k: 'you', x: 1020, y: Y + 20, s: 1.15, age: .55, flip: true, e: 'worried' }],
  ex: { p3: { phi: 'surprised' }, p4: { ale: 'angry' }, p5: { phi: 'laugh' }, p6: { ale: 'happy' } } });
sc({ a: S('p7'), bg: (T) => <><Pella T={T} tone="dawn" />{sunFlare(260, 380, T)}</>,
  mid: (T, t) => { const on = T > S('p8') + 3.2; const gx = T > S('p10') ? (T - S('p10')) * 520 : 0;
    return <><Horse x={1040 - gx} y={Y + 10} s={1.2} flip ph={T * (on ? 9 : 2)} gallop={T > S('p10') ? 1 : .1} c="#1a1410" mane="#0a0806" star cloth={A.purple} />
      {on && rider(CAST.ale, 1000 - gx, Y + 10, 1.2, { armF: T > S('p9') ? -2.4 : -1.4, elbowF: .3, expr: 'laugh', lean: T > S('p10') ? -14 : 0, holdF: 'reins' }, true, .6)}</>; },
  cams: { p7: (T, t) => ({ x: lerp(1100, 1000, t / 3.7), y: 520, z: 1.9 }), p8: (T, t) => ({ x: lerp(1100, 900, t / 8), y: 540, z: lerp(1.5, 1.2, t / 8) }), p9: { x: 520, y: 560, z: 2.0 }, p10: (T, t) => ({ x: lerp(800, 500, t / 6), y: 560, z: 1.1 }) },
  actors: [{ k: 'ale', x: (T) => T > S('p8') + 3.2 ? -999 : 1120, y: Y, s: 1.2, age: .6, flip: true, p: (T) => ({ holdF: 'reins', armF: -1.4, elbowF: .3, crouch: T > S('p8') + 2.6 ? 1 : 0 }), e: 'thinking' },
    { k: 'phi', x: 440, y: Y, s: 1.35, p: (T) => T > S('p9') ? { armF: -2.5, elbowF: .2, handF: 'fist' } : { armF: -.4, elbowF: .9 }, e: 'surprised' }, { k: 'you', x: 1560, y: Y + 20, s: 1.15, age: .55, flip: true, e: 'scared' }],
  ex: { p8: { phi: 'surprised', you: 'surprised' }, p9: { you: 'laugh' }, p10: { phi: 'laugh', you: 'excited' } } });

/* ====================== MIEZA ====================== */
const lesson = (T: number) => <Mieza T={T} />;
sc({ a: S('m1'), bg: lesson, cam: (T, t) => ({ x: lerp(1200, 900, easeInOut(t / 11.7)), y: lerp(380, 560, easeInOut(t / 11.7)), z: lerp(1.6, 1.0, easeInOut(t / 11.7)) }),
  actors: [{ k: 'ale', x: walkTo(-200, 660, 3, 5), y: Y, s: 1.1, age: .8, p: walkP(3, 5), e: 'happy', spk: '-' }, { k: 'hep', x: walkTo(-380, 900, 3.3, 5.4), y: Y + 10, s: 1.1, age: .8, p: walkP(3.3, 5.4), e: 'laugh', spk: '-' }, { k: 'youSt', x: walkTo(-560, 420, 3.6, 5), y: Y, s: 1.1, age: .8, p: walkP(3.6, 5), e: 'surprised', spk: '-' },
    { k: 'ari', x: 1360, y: Y - 40, s: 1.2, flip: true, p: { holdF: 'scroll', armF: -1.0, elbowF: 1.2 }, e: 'neutral', spk: '-' }] });
const studs = (extra: Partial<Record<string, MPose>> = {}): Actor[] => [
  { k: 'youSt', x: 340, y: Y - 60, s: 1.15, age: .8, p: { sit: 1, holdF: 'tablet', armF: -1.0, elbowF: 1.5, ...(extra.you || {}) }, e: 'thinking' },
  { k: 'ale', x: 600, y: Y - 60, s: 1.15, age: .8, p: { sit: 1, armF: -.8, elbowF: 1.4, ...(extra.ale || {}) }, e: 'neutral' },
  { k: 'hep', x: 860, y: Y - 30, s: 1.15, age: .8, p: { sit: 1, holdF: 'tablet', armF: -1.0, elbowF: 1.5, ...(extra.hep || {}) }, e: 'happy' },
  { k: 'ari', x: 1300, y: Y - 40, s: 1.25, flip: true, p: { armF: -1.2, elbowF: 1.0, ...(extra.ari || {}) }, e: 'thinking' }];
sc({ a: S('m2'), bg: lesson, actors: studs(), ex: { m3: { ari: 'happy' }, m4: { ale: 'surprised' }, m5: { ari: 'surprised' }, m6: { youSt: 'happy', ale: 'thinking' } } });
gfx(GoldenMean, S('m7'));
sc({ a: S('m8'), bg: lesson, cam: (T, t) => ({ x: lerp(700, 1300, easeInOut(t / 4)), y: 600, z: lerp(1.5, 1.3, t / 4) }),
  actors: [{ k: 'hep', x: walkTo(860, 1500, .3, 3.2), y: Y - 20, s: 1.15, age: .8, p: walkP(.3, 3.2, {}, 1), e: 'laugh' }, { k: 'ale', x: walkTo(600, 1450, 1.6, 3), y: Y, s: 1.15, age: .8, p: walkP(1.6, 3, {}, 1), e: 'excited' }, { k: 'youSt', x: 340, y: Y - 60, s: 1.15, age: .8, p: { sit: 1, holdF: 'tablet', armF: -1.0, elbowF: 1.5 }, e: 'laugh', spk: '-' }] });
sc({ a: S('m10'), bg: lesson, cam: (T, t) => ({ x: lerp(1420, 1300, t / 10), y: lerp(560, 600, t / 10), z: lerp(2.2, 1.6, t / 10) }),
  ui: (T) => stamp('MAYBE', S('m10') + 5.2, 4.6, 'classmates not recorded')(T),
  actors: [{ k: 'hep', x: 1380, y: Y - 10, s: 1.15, age: .8, p: { armF: -2.6, elbowF: .3, handF: 'fist' }, e: 'laugh', spk: '-' }, { k: 'ale', x: 1180, y: Y, s: 1.15, age: .8, p: { armF: -2.2, elbowF: .4 }, e: 'laugh', spk: '-' }] });
sc({ a: S('m11'), bg: lesson, mid: (T) => <g transform="translate(1000 760)"><rect x={-90} y={-30} width={180} height={50} fill={A.limeD} stroke={P.ink} strokeWidth={5} /><path d={`M -60 -40 Q -20 ${-80 - Math.sin(T * 3) * 6} 30 -50 Q 60 -40 70 -60 L 70 -30 Q 40 -40 30 -36 Q -20 -10 -60 -40 Z`} fill="#8aa0b0" stroke={P.ink} strokeWidth={4} /><path d="M -80 -40 q 10 -60 0 -110 M -80 -100 q -30 -10 -40 -40 M -80 -80 q 30 -20 44 -50" stroke="#4f6a2a" strokeWidth={6} fill="none" /></g>,
  cam: (T, t) => ({ x: lerp(900, 1050, t / 5.4), y: 580, z: 1.5 }), actors: studs({ ari: { handF: 'point', armF: -1.6, elbowF: .1 } }).map((a) => ({ ...a, spk: '-' })) });
sc({ a: S('m12'), bg: lesson, actors: studs({ ari: { holdF: 'scroll', armF: -1.6, elbowF: .2 }, ale: { holdF: 'scroll', armF: -1.5, elbowF: .6 } }).map((a) => a.k === 'ale' ? { ...a, p: (T: number) => ({ sit: 1, holdF: T > S('m12') + 3 ? 'scroll' as const : 'none' as const, armF: -1.3, elbowF: .9 }) } : a.k === 'ari' ? { ...a, x: (T: number) => lerp(1300, 860, prog(T, S('m12'), S('m12') + 1.6)), p: (T: number) => ({ holdF: T > S('m12') + 3 ? 'none' as const : 'scroll' as const, armF: -1.5, elbowF: .3, walk: T < S('m12') + 1.6 ? 1 : 0, phase: T * 8 }) } : a),
  ex: { m13: { ari: 'happy' }, m14: { ale: 'happy' } }, cams: { m14: (T, t) => ({ x: 600, y: 600, z: lerp(2.0, 2.3, t / 3.6) }) } });
sc({ a: S('m15'), bg: (T) => <Mieza T={T} tone="dusk" />, cams: { m15: { x: 760, y: 600, z: 2.1 }, m16: (T, t) => ({ x: lerp(1050, 960, t / 5), y: 580, z: lerp(2.0, 1.5, t / 5) }) },
  actors: [{ k: 'ale', x: 760, y: Y - 60, s: 1.15, age: .82, p: { sit: 1, armF: -.8, elbowF: 1.3, lookX: 1 }, e: 'thinking' }, { k: 'ari', x: 1150, y: Y - 40, s: 1.25, flip: true, p: { armF: -.9, elbowF: 1.2 }, e: 'happy' }, { k: 'youSt', x: 420, y: Y - 60, s: 1.15, age: .8, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'neutral', spk: '-' }],
  ex: { m16: { ale: 'surprised' } } });
sc({ a: S('m17'), bg: (T) => <Mieza T={T} today={1} />, cam: (T, t) => ({ x: lerp(800, 1100, t / 8.4), y: lerp(600, 540, t / 8.4), z: lerp(1.3, 1.1, t / 8.4) }),
  ui: (T) => stamp('EVIDENCE', S('m17') + 3.5, 4.5, 'Plutarch, Alexander 7')(T),
  mid: (T, t) => <g opacity={.35 * (1 - prog(t, 4, 7))}>{studs().map((a, i) => <MChar key={i} look={typeof a.k === 'string' ? CAST[a.k] : a.k} x={a.x as number} y={a.y as number} s={a.s} age={a.age} flip={!!a.flip} pose={a.p as MPose} />)}</g>, actors: [] });

/* ====================== THE NEW KING ====================== */
const pauX = (T: number) => T < S('k3') ? -300 : lerp(-300, 860, prog(T, S('k3'), S('k4') + 1));
sc({ a: S('k1'), bg: (T) => <Theatre T={T} panic={clamp((T - S('k4')) / 1)} />,
  cams: { k1: (T, t) => ({ x: 960, y: lerp(420, 600, easeInOut(t / 6.4)), z: lerp(1.0, 1.2, t / 6.4) }), k2: { x: 960, y: 640, z: 1.9 }, k3: { x: 1500, y: 620, z: 2.0 }, k4: (T, t) => ({ x: lerp(500, 900, t / 3), y: 640, z: 1.5 }) },
  actors: [{ k: 'phi', x: 960, y: Y + 40, s: 1.25, p: (T) => T > S('k4') + 1.2 ? { kneel: 1, lean: -14, armF: .2, elbowF: .3 } : { armF: -2.5, elbowF: .2 }, e: 'happy' },
    { k: 'pau', x: pauX, y: Y + 60, s: 1.2, p: (T) => ({ walk: T > S('k3') && T < S('k4') + 1 ? 1 : 0, run: 1, phase: T * 14, holdF: 'kopis', armF: -1.5, elbowF: .2, propA: 80 }), e: 'fierce', spk: '-' },
    { k: 'youFst', x: 1600, y: Y + 30, s: 1.15, flip: true, p: (T) => T > S('k3') ? { handF: 'point', armF: -1.55, elbowF: .1 } : {}, e: 'scared' }],
  ex: { k4: { phi: 'scared' } } });
sc({ a: S('k5'), bg: (T) => <Theatre T={T} panic={1} />, fg: (T) => null,
  actors: [{ k: 'hepWar', x: 560, y: Y + 40, s: 1.25, e: 'scared' }, { k: 'youFst', x: 860, y: Y + 40, s: 1.2, e: 'worried' }, { k: 'aleCav', x: 1260, y: Y + 40, s: 1.3, flip: true, p: (T) => T > S('k7') ? { handF: 'fist', armF: -.7, elbowF: .9 } : {}, e: 'sad' }],
  ex: { k7: { youFst: 'surprised', hepWar: 'surprised' } }, cams: { k7: (T, t) => ({ x: 1260, y: 560, z: lerp(2.1, 2.6, t / 3.8) }) } });
sc({ a: S('k8'), bg: (T) => <Agora T={T} />, mid: () => <Pithos x={1300} y={900} s={.9} />,
  cams: { k8: (T, t) => ({ x: lerp(1500, 1150, t / 8), y: lerp(380, 600, easeInOut(t / 8)), z: lerp(1.6, 1.3, t / 8) }), k10: { x: 1250, y: 680, z: 2.2 }, k11: { x: 520, y: 560, z: 2.0 }, k13: (T, t) => ({ x: 960, y: 580, z: lerp(1.15, 1.3, t / 8) }) },
  ui: (T) => stamp('MAYBE', S('k13') + 3.4, 4.6, 'Plutarch, Alexander 14', 1560, 200)(T),
  actors: [{ k: 'dio', x: 1250, y: Y + 30, s: 1.25, flip: true, p: { sit: 1, lean: -8, armF: -.4, elbowF: 1.0, lookY: -.4 }, e: 'sleepy' },
    { k: 'aleCav', x: walkTo(500, 900, .5, 3), y: Y, s: 1.3, p: walkP(.5, 3), e: 'happy' }, { k: 'hepWar', x: walkTo(260, 580, .7, 3), y: Y, s: 1.25, p: walkP(.7, 3), e: 'neutral' }],
  ex: { k10: { aleCav: 'surprised' }, k11: { aleCav: 'thinking', dio: 'sleepy' }, k12: { hepWar: 'surprised', dio: 'thinking' } } });

/* ====================== ASIA ====================== */
gfx(MapAsia1, S('a1'));
const spearFly = (T: number) => { const p = prog(T, S('a2') + .35, S('a2') + 1.2); if (p <= 0) return null; const x = lerp(1060, 1520, p), y = lerp(660, 930, p) - Math.sin(p * Math.PI) * 260; const ang = p < 1 ? lerp(-25, 55, p) : 55;
  return <g transform={`translate(${x} ${y}) rotate(${ang})`}><line x1={-160} y1={0} x2={60} y2={0} stroke={P.ink} strokeWidth={10} /><line x1={-160} y1={0} x2={60} y2={0} stroke="#8a5a34" strokeWidth={4} /><path d="M 60 -9 L 100 0 L 60 9 Z" fill="#c8ccd0" stroke={P.ink} strokeWidth={4} /></g>; };
sc({ a: S('a2'), bg: (T) => <Hellespont T={T} />, mid: (T) => <><Ship x={760} y={790} s={1.1} T={T} sail={A.purple} />{spearFly(T)}</>,
  cams: { a2: (T, t) => ({ x: lerp(900, 1200, prog(t, .3, 1.2)), y: 600, z: 1.3 }), a3: { x: 820, y: 600, z: 2.0 }, a4: { x: 640, y: 600, z: 2.0 }, a5: (T, t) => ({ x: lerp(1300, 1500, t / 8), y: 700, z: lerp(1.4, 1.8, t / 8) }) },
  ui: (T) => stamp('EVIDENCE', S('a5') + 2.5, 4.4, 'Diodorus 17.17')(T),
  actors: [{ k: 'aleWar', x: (T) => T > S('a5') + 3 ? lerp(1000, 1420, prog(T, S('a5') + 3, S('a5') + 6)) : 1000, y: (T) => T > S('a5') + 3 ? lerp(750, 960, prog(T, S('a5') + 3, S('a5') + 3.6)) : 750, s: 1.05, p: (T) => T < S('a2') + .4 ? { holdF: 'spear', armF: -2.8, elbowF: .9, propA: -60, lean: -10 } : { armF: -.6, elbowF: .3, lean: 12, walk: T > S('a5') + 3.6 ? 1 : 0, phase: T * 8 }, e: 'fierce' },
    { k: 'youCav', x: 760, y: 750, s: 1.0, flip: false, e: 'surprised' }, { k: 'hepWar', x: 560, y: 750, s: 1.05, e: 'happy' }],
  ex: { a4: { youCav: 'thinking' } } });
const persianBank = (T: number) => <Host T={T} rows={2} per={7} x0={1180} y0={620} dx={120} s0={.5} flip seed={4} />;
sc({ a: S('a6'), bg: (T) => <><Granicus T={T} /><path d="M -240 900 C 300 870 700 900 1150 880 L 1200 1300 L -240 1300 Z" fill="#a8865a" stroke="#1c1410" strokeWidth={7} /></>, mid: persianBank,
  cams: { a6: (T, t) => ({ x: lerp(800, 1400, easeInOut(t / 5)), y: 560, z: lerp(1.1, 1.5, t / 5) }), a7: { x: 560, y: 560, z: 2.0 }, a8: { x: 860, y: 540, z: 2.0 } },
  actors: [{ k: 'par', x: 560, y: Y, s: 1.25, e: 'worried' }, { k: 'aleWar', x: 860, y: Y, s: 1.3, flip: true, p: (T) => T > S('a8') + 3 ? { holdF: 'kopis', armF: -2.6, elbowF: .2, propA: 0 } : { holdF: 'kopis', propA: 150 }, e: 'fierce' }],
  ex: { a8: { par: 'surprised' } } });
const FA = fight((FIGHTS as any).gran.ale, 'kopis'), FR = fight((FIGHTS as any).gran.rho, 'axe'), FSp = fight((FIGHTS as any).gran.spi, 'kopis');
const granHits = hitsOf('gran');
sc({ a: S('a9'), bg: (T) => <Granicus T={T} dust={.5} />, hits: granHits,
  mid: (T) => <><Host T={T} rows={1} per={5} x0={1350} y0={760} dx={150} s0={.6} flip seed={9} /><Phalanx T={T} x0={-150} y0={860} files={5} ranks={2} s0={.6} level={.6} dx={110} seed={3} /></>,
  near: (T) => <g>{Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M ${-200 + i * 420 + ((T * 140) % 420)} 1120 q 70 -40 140 0 q 70 -40 140 0`} stroke="#fff" strokeOpacity={.55} strokeWidth={16} fill="none" />)}</g>,
  cams: { a9: (T, t) => ({ x: lerp(700, 940, t / 6.9), y: 600, z: lerp(1.2, 1.45, t / 6.9) }), a10: { x: 760, y: 560, z: 1.9 },
    a11: (T, t) => t < 1.6 ? { x: 860, y: 560, z: 2.1 } : { x: lerp(860, 700, prog(t, 3.8, 6)), y: 600, z: lerp(1.6, 1.4, prog(t, 3.8, 6)) }, a12: { x: 620, y: 580, z: 1.6 }, a13: { x: 520, y: 600, z: 1.7 }, a14: (T, t) => ({ x: lerp(560, 760, t / 8), y: 600, z: lerp(1.6, 1.3, t / 8) }) },
  actors: [{ k: 'aleWar', x: (T) => 760 + FA.dx(T), y: Y + 30, s: 1.25, p: (T) => FA.pose(T) },
    { k: { ...persian(3), helmet: 'bashlyk', crestC: '#efe6d2', cloth: '#8a2a2a', beard: 'long' }, id: 'rho', spk: '-', x: (T) => 1180 - FR.dx(T), y: Y + 30, s: 1.25, flip: true, p: (T) => FR.pose(T), o: (T) => 1 - prog(T, S('a12'), S('a12') + .6) },
    { k: { ...persian(1), helmet: 'bashlyk', crestC: RC.gold, cloth: '#3a5f88' }, id: 'spi', spk: '-', x: (T) => 520 + FSp.dx(T), y: Y + 30, s: 1.25, p: (T) => FSp.pose(T), o: (T) => prog(T, S('a11') + 4.1, S('a11') + 4.5) * (1 - prog(T, S('a14') + 1, S('a14') + 1.6)) },
    { k: 'cleWar', x: (T) => lerp(-200, 330, prog(T, S('a12') - .2, S('a13') + .25)), y: Y + 30, s: 1.3, p: (T) => T > S('a13') + .15 ? { holdF: 'kopis', armF: -.55, elbowF: .2, propA: 140, lean: 18, crouch: .9 } : { holdF: 'kopis', armF: -2.9, elbowF: .7, propA: -40, walk: 1, run: 1, phase: T * 14 }, e: 'fierce' },
    { k: 'youCav', x: 220, y: Y + 30, s: 1.15, o: (T) => T < S('a10') - .1 ? 0 : 1, p: (T) => T > S('a12') - .1 && T < S('a13') ? { handF: 'point', armF: -1.55, elbowF: .1 } : { holdF: 'kopis', propA: 60, armF: -1, elbowF: .9 }, e: 'scared' }],
  ex: { a12: { aleWar: 'scared' }, a14: { aleWar: 'surprised', cleWar: 'fierce' } } });
sc({ a: S('a15'), bg: (T) => <Temple T={T} />, mid: (T) => { const cut = T > S('a17') + .9 && T < S('a18') + 4.5 ? clamp((T - S('a17') - .9) * 4) : 0; const pin = T > S('a18') + 5 ? clamp((T - S('a18') - 5.3) * 2) : 0; return <Knot x={960} y={720} s={1.0} cut={cut} pin={pin} T={T} />; },
  hits: [{ t: S('a17') + .9, x: 960, y: 700, kind: 'clash' }],
  ui: (T) => <>{twoVersions(T, S('a18') + .2, S('a18') + 4.5, 'VERSION 1 · THE SWORD')}{twoVersions(T, S('a18') + 4.6, S('a18') + 8.6, 'VERSION 2 · THE PIN')}{stamp('MAYBE', S('a18') + 6.2, 2.2, 'Arrian 2.3', 1560, 200)(T)}</>,
  cams: { a15: (T, t) => ({ x: 960, y: lerp(560, 640, t / 7), z: lerp(1.2, 1.6, t / 7) }), a17: (T, t) => ({ x: lerp(760, 900, t / 2.3), y: 600, z: 1.8 }), a18: { x: 960, y: 600, z: 1.35 } },
  actors: [{ k: 'aleWar', x: (T) => T > S('a18') + 4.6 ? 1180 : 700, flip: (T) => T > S('a18') + 4.6, y: Y, s: 1.25, p: (T) => T > S('a18') + 4.6 ? { handF: 'fist', armF: -1.4, elbowF: .9 } : T > S('a17') + .5 ? { holdF: 'kopis', armF: T > S('a17') + .9 ? -.55 : -2.9, elbowF: .3, propA: T > S('a17') + .9 ? 140 : -40, lean: 16 } : { holdF: 'kopis', propA: 150 }, e: 'thinking' },
    { k: 'hepWar', x: 360, y: Y, s: 1.2, e: 'surprised' }, { k: 'youCav', x: 1560, y: Y, s: 1.15, flip: true, e: 'surprised', spk: '-' }],
  ex: { a17: { hepWar: 'surprised' } } });

/* ====================== ISSUS ====================== */
const issHits = hitsOf('issus');
sc({ a: S('i1'), bg: (T) => <><Plain T={T} dust={.3} /><rect x={-240} y={536} width={2400} height={40} fill="#3f7f9a" /></>, mid: (T) => <><Host T={T} rows={3} per={10} x0={1050} y0={900} dx={100} s0={.48} flip seed={2} /><Phalanx T={T} x0={-160} y0={940} files={10} ranks={4} s0={.5} level={.8} dx={90} /></>,
  cam: (T, t) => ({ x: lerp(500, 1400, easeInOut(t / 11.3)), y: lerp(600, 560, t / 11.3), z: lerp(1.4, 1.15, t / 11.3) }), actors: [] });
sc({ a: S('i2'), bg: (T) => <Plain T={T} dust={.5} />, hits: issHits, shake: (T) => T > S('i3') ? .25 : 0,
  mid: (T) => <><Host T={T} rows={2} per={8} x0={1100} y0={760} dx={110} s0={.42} flip seed={6} flee={T > S('i5') ? .7 : 0} />
    <Chariot x={T > S('i5') + .4 ? 1420 + (T - S('i5') - .4) * 600 : 1420} y={Y + 10} s={.95} king ph={T * (T > S('i5') ? 9 : 1)} gallop={T > S('i5') ? 1 : .05} flip={T < S('i5') + .4} turn={T > S('i5') - .2 ? 1 : 0} /></>,
  cams: { i2: { x: 1400, y: 560, z: 1.7 }, i3: (T, t) => ({ x: lerp(600, 900, t / 2.7), y: 600, z: 1.5 }), i4: { x: 1000, y: 600, z: 1.3 }, i5: (T, t) => ({ x: lerp(1400, 1700, t / 3), y: 580, z: 1.6 }), i6: (T, t) => ({ x: lerp(1500, 1300, t / 4.6), y: 600, z: 1.2 }) },
  actors: [{ k: 'aleCav', id: 'aleH', x: (T) => lerp(-200, 900, prog(T, S('i3') + .4, S('i5') + 1)), y: Y + 10, s: .01, o: 0 },
    { k: 'youCav', x: 220, y: Y + 20, s: 1.15, p: (T) => T > S('i4') ? { handF: 'point', armF: -1.55, elbowF: .1 } : { holdF: 'kopis', propA: 60 }, e: 'excited' }],
  fg: (T) => { const x = lerp(-200, 900, prog(T, S('i3') + .4, S('i5') + 1)); return T > S('i3') ? <g filter="url(#boil)"><Horse x={x} y={Y + 10} s={.9} ph={T * 9} gallop={1} c="#1a1410" mane="#0a0806" star cloth={A.purple} />{rider(CAST.aleCav, x - 30, Y + 10, .85, { holdF: 'spear', armF: -1.6, elbowF: .1, propA: 88, lean: 10, expr: 'fierce' })}</g> : null; } });
sc({ a: S('i7'), bg: (T) => <RoyalTent T={T} />,
  cams: { i8: { x: 820, y: 680, z: 1.9 }, i9: { x: 1100, y: 560, z: 2.0 }, i11: (T, t) => ({ x: lerp(1400, 1300, t / 3), y: 540, z: 2.1 }), i12: (T, t) => ({ x: 1100, y: 580, z: lerp(1.4, 1.2, t / 6) }) },
  actors: [{ k: 'sis', x: 760, y: Y, s: 1.15, p: (T) => T > S('i10') + 1 ? { armF: -1.2, elbowF: 1.4 } : { kneel: 1, armF: -1.6, elbowF: .6, lean: 10 }, e: 'worried' },
    { k: 'hep', x: 1100, y: Y, s: 1.3, flip: true, e: 'surprised' }, { k: 'aleCav', x: 1400, y: Y, s: 1.22, flip: true, e: 'happy' }],
  ex: { i8: { hep: 'surprised', aleCav: 'neutral' }, i10: { hep: 'happy' }, i11: { sis: 'surprised', hep: 'happy' }, i12: { sis: 'happy' } } });

/* ====================== GAUGAMELA ====================== */
gfx(MapAsia2, S('g1'));
sc({ a: S('g2'), bg: (T) => <Desert T={T} />, mid: (T) => <><Palm x={300} y={980} s={1.1} T={T} /><Palm x={1700} y={990} s={1.2} T={T} /><g transform="translate(1180 980)"><rect x={-180} y={-260} width={360} height={260} fill="#d8c090" stroke={P.ink} strokeWidth={6} /><rect x={-50} y={-160} width={100} height={160} fill="#2a1a12" /></g></>,
  actors: [{ k: 'youCav', x: 640, y: Y, s: 1.25, e: 'thinking' }, { k: 'aleCav', x: 960, y: Y, s: 1.3, flip: true, e: 'thinking' }], ex: { g3: { youCav: 'worried', aleCav: 'thinking' } } });
const scythe = (T: number, a: number, k: number) => { const p = T - a; return <Chariot key={k} x={2200 - p * 520} y={Y + 10 + (k % 2) * 40} s={.62} scythe ph={T * 9 + k} gallop={1} flip />; };
sc({ a: S('g4'), bg: (T) => <Plain T={T} dust={.4} />, mid: (T) => <><Host T={T} rows={4} per={14} x0={-100} y0={760} dx={150} s0={.38} flip seed={11} />{[0, 1, 2].map((k) => <Chariot key={k} x={300 + k * 600} y={940} s={.6} scythe flip ph={0} gallop={0} />)}</>,
  cams: { g4: (T, t) => ({ x: lerp(400, 1500, easeInOut(t / 11.4)), y: 600, z: lerp(1.3, 1.1, t / 11.4) }), g5: { x: 1200, y: 540, z: 1.8 } },
  actors: [{ k: 'dar', x: 1200, y: Y, s: 1.3, flip: true, p: { handF: 'point', armF: -1.55, elbowF: .1 }, o: (T) => T > S('g5') - .3 ? 1 : 0 }] });
gfx(SarissaGfx, S('g6'));
const gHits = hitsOf('gauga');
sc({ a: S('g7'), bg: (T) => <Plain T={T} dust={.6} />, hits: gHits, shake: (T) => T > S('g9') ? .2 : 0,
  mid: (T) => <><Phalanx T={T} x0={-100} y0={900} files={18} ranks={5} s0={.48} level={1} open={clamp((T - S('g8') - .4) * 2) * (1 - prog(T, S('g10'), S('g10') + 1))} dx={110} />{T > S('g7') && [0, 1, 2].map((k) => scythe(T, S('g7') + .3 + k * .5, k))}</>,
  cams: { g7: { x: 360, y: 560, z: 2.0 }, g8: { x: 800, y: 560, z: 1.9 }, g9: (T, t) => ({ x: lerp(1300, 700, t / 5.8), y: 680, z: 1.2 }), g10: (T, t) => ({ x: 900, y: 560, z: 1.7 }), g11: { x: 400, y: 560, z: 2.0 }, g12: (T, t) => ({ x: lerp(1000, 1400, t / 7), y: 600, z: 1.15 }) },
  actors: [{ k: 'youCav', x: 360, y: (T) => T > S('g12') ? 2000 : 820, s: 1.1, p: (T) => T > S('g11') ? { handF: 'point', armF: -1.55, elbowF: .1 } : { holdF: 'kopis', propA: 60 }, e: 'scared' },
    { k: 'aleCav', x: 820, y: (T) => T > S('g12') ? 2000 : 820, s: 1.15, flip: true, p: (T) => T > S('g10') ? { handF: 'point', armF: -1.55, elbowF: .1 } : { handF: 'fist', armF: -2.5, elbowF: .3 }, e: 'fierce' }],
  fg: (T) => T > S('g12') ? <g filter="url(#boil)"><Chariot x={1200 + (T - S('g12')) * 420} y={980} s={.85} king ph={T * 9} turn={1} /><Host T={T} rows={2} per={8} x0={900} y0={1060} dx={150} s0={.5} seed={14} flee={1} /></g> : null,
  ex: { g11: { aleCav: 'excited' } } });

/* ====================== PERSEPOLIS ====================== */
sc({ a: S('e1'), bg: (T) => <Persepolis T={T} gold={T > S('e2') ? 1 : 0} />, cam: (T, t) => ({ x: lerp(900, 1100, t / 7), y: lerp(380, 600, easeInOut(prog(t, 0, 5.6))), z: lerp(1.1, 1.4, t / 7) }),
  actors: [{ k: 'sol', x: 900, y: Y + 40, s: 1.25, p: (T) => T > S('e2') ? { holdF: 'goblet', armF: -2.6, elbowF: .2 } : {}, o: (T) => T > S('e2') - .4 ? 1 : 0, e: 'excited' }] });
gfx(Treasure, S('e3'));
sc({ a: S('e4'), bg: (T) => <Persepolis T={T} night fire={clamp((T - S('e4') - 1.5) / 2)} />, fg: (T) => <Embers T={T} n={50} o={clamp((T - S('e4') - 1.5) / 2)} />,
  ui: (T) => stamp('MAYBE', S('e7') + 1.5, 3.3, 'Arrian 3.18 vs Plutarch 38', 1560, 200)(T),
  cams: { e4: (T, t) => ({ x: 960, y: lerp(400, 560, t / 3.7), z: lerp(1.0, 1.2, t / 3.7) }), e5: { x: 700, y: 600, z: 2.0 }, e6: { x: 1060, y: 580, z: 2.1 }, e7: (T, t) => ({ x: 960, y: 560, z: lerp(1.3, 1.05, t / 4.8) }) },
  actors: [{ k: 'hep', x: 700, y: Y + 40, s: 1.25, e: 'worried' }, { k: 'alePer', x: 1060, y: Y + 40, s: 1.3, flip: true, p: { holdF: 'torch', armF: -2.2, elbowF: .4 }, e: 'fierce' }] });
sc({ a: S('e8'), bg: (T) => <><Sky tone="dusk" T={T} /><Hills T={T} y={760} tone="dusk" cyp={false} /><Campfire x={960} y={Y + 20} T={T} s={.8} /></>,
  mid: (T) => <g opacity={.9}><MChar look={CAST.alePer} x={1640} y={880} s={.8} flip pose={{ armF: -1, elbowF: .9 }} /><MChar look={persian(1)} x={1480} y={880} s={.75} flip pose={{ holdF: 'spear', propA: 0 }} /><MChar look={persian(3)} x={1800} y={880} s={.75} flip pose={{ holdF: 'spear', propA: 0 }} /></g>,
  actors: [{ k: 'youCav', x: 620, y: Y + 30, s: 1.25, p: { handF: 'point', armF: -1.4, elbowF: .2 }, e: 'worried' }, { k: 'hepWar', x: 1180, y: Y + 30, s: 1.3, flip: true, e: 'sad' }] });

/* ====================== THE FEAST, AGAIN ====================== */
sc({ a: S('f1'), bg: (T) => <Feast T={T} chaos={1} dark={.35} />, grade: '#b8a0a0',
  cams: { f1: (T, t) => ({ x: 960, y: 560, z: lerp(1.1, 1.4, t / 2.7) }), f2: (T, t) => ({ x: 860, y: 600, z: lerp(2.0, 2.4, t / 2.3) }) },
  actors: [{ k: 'alePer', x: 860, y: Y, s: 1.3, p: { kneel: 1, armF: -.4, elbowF: 1.6, lean: 10 }, e: 'sad' }] });
sc({ a: S('f3'), bg: (T) => <><Sky tone="night" T={T} /><Hills T={T} y={760} tone="night" cyp={false} /><g transform="translate(1300 900)"><path d="M -330 0 L 0 -380 L 330 0 Z" fill="#5a2a5a" stroke={P.ink} strokeWidth={8} /><path d="M -60 0 L 0 -150 L 60 0 Z" fill="#1a0a14" /><circle cx={0} cy={-60} r={90} fill="url(#fireGlow)" opacity={.25} /></g><Campfire x={500} y={Y + 10} T={T} s={.7} /></>,
  cams: { f3: (T, t) => ({ x: lerp(1300, 1100, t / 5.5), y: 560, z: lerp(1.6, 1.2, t / 5.5) }) },
  actors: [{ k: 'hepWar', x: 560, y: Y, s: 1.25, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'sad' }, { k: 'youCav', x: 820, y: Y, s: 1.2, flip: true, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'sad' }] });
sc({ a: S('f6'), bg: (T) => <RoyalTent T={T} />, mid: (T) => <><g transform="translate(1500 900)"><rect x={-150} y={-260} width={300} height={260} fill={A.gold} stroke={P.ink} strokeWidth={7} /><rect x={-120} y={-230} width={240} height={140} fill="#8a1a2a" /></g>
    {[0, 1, 2, 3].map((k) => <MChar key={k} look={persian(k)} x={420 + k * 230} y={Y + 30} s={.9} flip pose={{ kneel: 1, lean: 34, armF: -.6, elbowF: .2 }} />)}</>,
  cams: { f6: (T, t) => ({ x: lerp(800, 1200, t / 5.2), y: 560, z: lerp(1.1, 1.3, t / 5.2) }), f7: { x: 380, y: 560, z: 2.1 }, f8: { x: 1500, y: 470, z: 2.0 }, f9: (T, t) => ({ x: lerp(500, 300, t / 7), y: 560, z: 1.6 }), f10: { x: 900, y: 560, z: 2.2 } },
  actors: [{ k: 'alePer', x: 1500, y: 700, s: 1.2, flip: true, p: { sit: 1, armF: -1.0, elbowF: 1.0 }, e: 'angry' },
    { k: 'cal', x: (T) => T > S('f9') + 1 ? lerp(380, -300, prog(T, S('f9') + 1, S('f9') + 6)) : 380, y: Y + 30, s: 1.25, p: (T) => ({ handF: T > S('f7') && T < S('f8') ? 'fist' : 'open', walk: T > S('f9') + 1 ? 1 : 0, phase: T * 6 }), flip: (T) => T > S('f9') + 1, e: 'angry' },
    { k: macedon(3), id: 'g1', spk: '-', x: (T) => T > S('f9') + 1 ? lerp(220, -460, prog(T, S('f9') + 1, S('f9') + 6)) : 140, y: Y + 30, s: 1.2, flip: (T) => T > S('f9') + 1, p: (T) => ({ holdF: 'spear', propA: 0, walk: T > S('f9') + 1 ? 1 : 0, phase: T * 6 }), o: (T) => T > S('f9') ? 1 : 0 },
    { k: 'youCav', x: 900, y: Y + 30, s: 1.2, e: 'worried', o: (T) => T > S('f9') ? 1 : 0 }],
  ex: { f9: { cal: 'sad' }, f10: { youCav: 'sad' } } });

/* ====================== INDIA ====================== */
const iHits = hitsOf('india');
sc({ a: S('n1'), bg: (T) => <Hydaspes T={T} />, mid: (T) => <>{[0, 1, 2, 3].map((k) => <Elephant key={k} x={500 + k * 380} y={590} s={.32} ph={T * 1.5 + k} walk={.3} />)}<Host T={T} rows={1} per={12} x0={300} y0={600} dx={130} s0={.28} kind="indian" seed={5} /></>,
  cams: { n1: (T, t) => ({ x: lerp(1300, 900, easeInOut(t / 10)), y: lerp(420, 560, easeInOut(t / 10)), z: lerp(1.7, 1.1, easeInOut(t / 10)) }), n3: { x: 1200, y: 640, z: 1.8 } },
  actors: [{ k: 'youCav', x: 700, y: Y + 40, s: 1.25, p: (T) => T > S('n2') ? { handF: 'point', armF: -1.55, elbowF: .1 } : {}, e: 'scared', o: (T) => T > S('n2') - .5 ? 1 : 0 }, { k: 'hepWar', x: 1150, y: Y + 40, s: 1.3, flip: true, e: 'worried', o: (T) => T > S('n2') - .5 ? 1 : 0 }] });
sc({ a: S('n4'), bg: (T) => <Hydaspes T={T} storm={1} bank={false} />, mid: (T, t) => <>{Array.from({ length: 7 }).map((_, k) => <MChar key={k} look={macedon(k)} x={((k * 300 + t * 90) % 2200) - 200} y={800 + (k % 3) * 40} s={.62} pose={{ walk: 1, phase: T * 4 + k, holdF: 'sarissa', propA: 10, armF: -2.6, elbowF: .3, armB: -2.8, expr: 'worried', bob: Math.sin(T * 3 + k) * 6 }} />)}<rect x={-240} y={860} width={2400} height={400} fill="#2a4a5a" opacity={.85} /></>,
  cam: (T, t) => ({ x: 960, y: 640, z: 1.2 }), actors: [] });
sc({ a: S('n5'), bg: (T) => <Hydaspes T={T} />, hits: iHits, shake: (T) => T > S('n5') ? .2 + (T > S('n7') && T < S('n8') + 1 ? .3 : 0) : 0,
  mid: (T) => <><Phalanx T={T} x0={-150} y0={1000} files={7} ranks={3} s0={.55} level={1} dx={120} />
    <Elephant x={T > S('n7') ? lerp(1500, 1000, prog(T, S('n7'), S('n8') + .5)) : 1500} y={1000} s={1.25} flip ph={T * 4} walk={1} rear={T > S('n8') ? Math.max(0, Math.sin(T * 3)) * .6 : 0} panic={T > S('n8') ? 1 : 0} rider={T < S('n9')} /></>,
  cams: { n5: { x: 1520, y: 240, z: 1.8 }, n6: { x: 600, y: 600, z: 2.0 }, n7: (T, t) => ({ x: lerp(900, 1000, t / 2.2), y: 620, z: lerp(1.3, 1.7, t / 2.2) }), n8: (T, t) => ({ x: 1000, y: 560, z: lerp(1.3, 1.0, t / 6.8) }) },
  actors: [{ k: 'por', x: 1640, y: 420, s: .01, o: 0 }, { k: 'aleCav', x: 600, y: Y + 40, s: 1.25, p: { handF: 'fist', armF: -2.5, elbowF: .3 }, e: 'fierce' },
    { k: 'youCav', x: 850, y: Y + 40, s: 1.2, p: (T) => ({ holdF: 'sarissa', propA: 80, armF: -1.1, elbowF: .6, crouch: .8, lean: -6 }), e: 'scared' }],
  fg: (T) => T < S('n6') ? <g filter="url(#boil)"><MChar look={CAST.por} x={1560} y={T < S('n7') ? 420 : 9999} s={.9} flip pose={{ handF: 'point', armF: -1.55, elbowF: .1, mouth: 'talk', open: mouthOf('POR', T), expr: 'fierce' }} /></g> : null });
sc({ a: S('n9'), bg: (T) => <Hydaspes T={T} />, mid: (T) => <Elephant x={1750} y={1000} s={.6} flip ph={T} walk={.1} rider={false} />,
  cams: { n9: { x: 700, y: 560, z: 2.0 }, n10: { x: 1180, y: 480, z: 2.2 }, n11: (T, t) => ({ x: 960, y: 560, z: lerp(1.4, 1.2, t / 5.6) }) },
  actors: [{ k: 'aleCav', x: 720, y: Y + 40, s: 1.25, e: 'thinking' }, { k: { ...CAST.por, scar: true }, id: 'por', spk: 'POR', x: 1180, y: Y + 40, s: 1.25, flip: true, p: { hurt: 1, armF: -.4, elbowF: .4 }, e: 'neutral' }],
  ex: { n11: { aleCav: 'happy', por: 'happy' } } });
sc({ a: S('n12'), bg: (T) => <><Sky tone="dusk" T={T} /><Hills T={T} y={760} tone="dusk" cyp={false} /></>, grade: '#d8c0a8',
  mid: (T, t) => <g opacity={1 - prog(t, 6, 8.5)}><Horse x={1100} y={Y + 10} s={.9} flip ph={0} gallop={0} c="#1a1410" mane="#0a0806" star cloth={A.purple} /></g>,
  cam: (T, t) => ({ x: lerp(1000, 900, t / 9), y: 600, z: lerp(1.6, 1.4, t / 9) }),
  actors: [{ k: 'aleCav', x: 760, y: Y, s: 1.25, p: { armF: -1.6, elbowF: .3 }, e: 'sad', spk: '-' }] });
sc({ a: S('n13'), bg: (T) => <><Sky tone="day" T={T} /><Hills T={T} y={700} cyp={false} /><Rain T={T} o={.5} n={80} /></>,
  mid: (T) => <Crowd T={T} n={9} y={880} s={.55} x0={-150} x1={2000} seed={21} armed lookOf={(i) => macedon(i)} pose={(i) => ({ sit: T > S('n16') ? 1 : 0, expr: 'sad' })} />,
  actors: [{ k: 'aleCav', x: 640, y: Y + 30, s: 1.3, p: (T) => T < S('n14') ? { handF: 'point', armF: -1.55, elbowF: .1 } : T > S('n15') && T < S('n16') ? { handF: 'fist', armF: -2.4, elbowF: .3 } : {}, e: 'excited' },
    { k: 'coe', x: 1100, y: Y + 30, s: 1.25, flip: true, e: 'sad' }, { k: 'youCav', x: 1400, y: Y + 30, s: 1.2, flip: true, e: 'sad', spk: '-' }],
  ex: { n14: { aleCav: 'surprised' }, n15: { aleCav: 'fierce', coe: 'worried' }, n16: { aleCav: 'sad' } }, cams: { n16: (T, t) => ({ x: lerp(800, 1100, t / 8.9), y: 560, z: lerp(1.3, 1.05, t / 8.9) }) } });

/* ====================== THE DESERT ====================== */
sc({ a: S('d1'), bg: (T) => <Desert T={T} />, mid: (T, t) => <Crowd T={T} tw={t * .5} n={10} y={900} s={.6} x0={-400} x1={1800} walk={.5} flip={false} seed={31} lookOf={(i) => macedon(i, 'bare')} pose={(i) => ({ walk: .5, phase: T * 4 + i, lean: 10, expr: 'sad', blink: .5 })} />,
  cam: (T, t) => ({ x: lerp(700, 1100, t / 9), y: 560, z: lerp(1.3, 1.1, t / 9) }), actors: [] });
sc({ a: S('d2'), bg: (T) => <Desert T={T} />, mid: (T) => <Crowd T={T} n={8} y={880} s={.55} x0={-150} x1={2000} seed={33} lookOf={(i) => macedon(i, 'bare')} pose={() => ({ expr: 'sad', lookX: 1 })} />,
  actors: [{ k: 'sol', x: 1250, y: Y + 30, s: 1.2, flip: true, p: (T) => T < S('d4') + .5 ? { holdF: 'helmetW', armF: -1.6, elbowF: .4 } : {}, e: 'worried' },
    { k: { ...CAST.aleCav, diadem: false }, id: 'ale', spk: 'ALE', x: 860, y: Y + 30, s: 1.3, p: (T) => T > S('d4') + .5 ? { holdF: 'helmetW', armF: -1.4, elbowF: .2, propA: 0 } : { lean: 6 }, e: 'sad' }, { k: 'youCav', x: 560, y: Y + 30, s: 1.2, e: 'worried' }],
  fg: (T) => T > S('d5') + 1 ? <g>{Array.from({ length: 20 }).map((_, i) => { const p = ((T - S('d5') - 1) * 1.6 + i / 20) % 1; return <circle key={i} cx={940 + Math.sin(i) * 10} cy={640 + p * 330} r={6} fill="#6aaad0" opacity={(1 - p) * (1 - prog(T, S('d5') + 5, S('d5') + 6))} />; })}</g> : null,
  cams: { d5: (T, t) => ({ x: 960, y: lerp(620, 560, t / 8), z: lerp(2.0, 1.2, easeInOut(t / 8)) }) },
  ex: { d4: { sol: 'surprised', youCav: 'surprised' }, d5: { sol: 'happy' } } } as any);
sc({ a: S('d6'), bg: (T) => <><Sky tone="night" T={T} /><Hills T={T} y={760} tone="night" cyp={false} /><Campfire x={960} y={Y + 10} T={T} /></>, fg: (T) => <Embers T={T} n={16} o={.4} />,
  cams: { d6: (T, t) => ({ x: 960, y: 600, z: lerp(1.2, 1.5, t / 5.8) }), d7: { x: 640, y: 600, z: 2.1 }, d8: (T, t) => ({ x: 1260, y: 600, z: lerp(2.2, 2.6, t / 2) }) },
  actors: [{ k: 'youCav', x: 640, y: Y, s: 1.25, e: 'sad' }, { k: 'alePer', x: 1260, y: Y, s: 1.3, flip: true, p: { kneel: 1, armF: -.4, elbowF: 1.7, lean: 14 }, e: 'sad' }] });

/* ====================== BABYLON ====================== */
sc({ a: S('z1'), bg: (T) => <Babylon T={T} dim={prog(T, S('z7') + .8, S('z8') + 2) * .5} />,
  cams: { z1: (T, t) => ({ x: lerp(1200, 960, t / 8.6), y: lerp(420, 560, t / 8.6), z: lerp(1.4, 1.2, t / 8.6) }), z3: { x: 760, y: 640, z: 2.2 }, z5: (T, t) => ({ x: 800, y: 640, z: lerp(2.2, 2.6, t / 3.8) }), z6: { x: 1400, y: 560, z: 2.0 }, z7: (T, t) => ({ x: 780, y: 650, z: lerp(2.4, 3.0, t / 1.8) }), z8: (T, t) => ({ x: 960, y: 560, z: lerp(1.4, 1.2, t / 6.3) }) },
  ui: (T) => stamp('MAYBE', S('z8') + 2.4, 3.6, 'Arrian 7.26 · Diodorus 17.117', 1560, 200)(T),
  actors: [{ k: { ...CAST.alePer, cloak: undefined }, id: 'ale', spk: 'ALE', x: 760, y: 840, s: 1.2, p: { sit: 1, lean: -30, armF: -.3, elbowF: .6 }, e: 'sleepy' },
    { k: 'youCav', x: 1080, y: Y + 40, s: 1.25, flip: true, p: { kneel: 1, armF: -1.2, elbowF: 1.0 }, e: 'worried' }, { k: macedon(6, 'cav'), id: 'sol', spk: 'SOL', x: 1440, y: Y + 40, s: 1.25, flip: true, o: (T) => T > S('z6') - 1.5 ? 1 : 0, e: 'worried' }],
  ex: { z3: { ale: 'happy' }, z4: { youCav: 'sad' }, z5: { youCav: 'sad' }, z7: { youCav: 'scared' } } });
gfx(MapAsia3, S('z9'));

/* ====================== WAS IT REAL? ====================== */
sc({ a: S('r1'), bg: (T) => <Mieza T={T} today={1} />, cam: (T, t) => ({ x: 960, y: 560, z: lerp(1.2, 1.05, t / 2) }), actors: [] });
gfx(Sources, S('r2'));
gfx(Worlds, S('r5'));
sc({ a: S('r6'), bg: (T) => <Alexandria T={T} />, cam: (T, t) => ({ x: lerp(900, 1000, t / 8.8), y: 520, z: lerp(1.05, 1.25, t / 8.8) }), actors: [] });
sc({ a: S('r7'), bg: (T) => <Mieza T={T} today={1} tone="dusk" />,
  mid: (T, t) => <g opacity={.3 * clamp(t / 2)}>{studs().filter((a) => a.k !== 'youSt').map((a, i) => <MChar key={i} look={typeof a.k === 'string' ? CAST[a.k] : a.k} x={a.x as number} y={a.y as number} s={a.s} age={a.age} flip={!!a.flip} pose={a.p as MPose} />)}</g>,
  cams: { r7: (T, t) => ({ x: lerp(500, 700, t / 5), y: 600, z: 1.7 }), r8: (T, t) => ({ x: lerp(800, 960, t / 8), y: lerp(560, 480, t / 8), z: lerp(1.5, 1.0, easeInOut(t / 8)) }) },
  actors: [{ k: 'youCav', x: 340, y: Y - 60, s: 1.15, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'thinking' }] });

// close the list
scenes.sort((p, q) => p.a - q.a);
scenes.forEach((s, i) => { s.b = i < scenes.length - 1 ? scenes[i + 1].a : 9999; });
export const SHOTS = scenes;
