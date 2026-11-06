import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P } from './art';
import { MChar, CAST, MLook, MPose, Expr, Chair, Chariot, Horse, trojan, greekSoldier } from './chars';
import { F, Sky, TroyWalls, Ship, Sea, Plain, WoodenHorse, Houses, Torch, Embers, Crowd, Army, Arrows, Dust, Smoke, Courtyard, Hearth, Ranch, Beach, Tent, Rampart, Fresco } from './sets';
import { Rewind, MapTroy, Ships1186, ArmorCost, IliadSpan, WallsChase, NineCities, Tablet, Stamp } from './tgraphics';
import MOUTH from './mouth.json';

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
      <radialGradient id="lampWash" gradientUnits="userSpaceOnUse" cx={960} cy={500} r={1200}><stop offset="0" stopColor="#ffb060" stopOpacity=".16" /><stop offset=".6" stopColor="#ff8030" stopOpacity=".04" /><stop offset="1" stopColor="#000" stopOpacity=".3" /></radialGradient>
      <filter id="sil" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .07  0 0 0 0 .04  0 0 0 0 .03  0 0 0 1 0" /></filter>
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
const SPK: Record<string, string> = { you: 'YOU', youArm: 'YOU', ilos: 'ILOS', ilosArm: 'ILOS', dad: 'DAD', hec: 'HEC', hecBare: 'HEC', and: 'AND', pri: 'PRI', ach: 'ACH', achBare: 'ACH', lao: 'LAO', cas: 'CAS', aen: 'AEN', scout: 'SCOUT', sin: 'SIN' };
const blinkAt = (T: number, s: number) => ((T + s * 1.7) % 3.9) < .12 ? 1 : 0;
const autoExpr = (text: string): Expr | null => /!$/.test(text) ? 'excited' : /\?$/.test(text) ? 'surprised' : null;
/* NEW in ep05: gestures driven by the words being said */
const gesture = (text: string, T: number, ln: any): MPose | null => {
  const k = T - ln.start;
  if (/\b(Look|That's|There|See)\b/.test(text)) return { handF: 'point', armF: -1.55, elbowF: .1 };
  if (/\b(Push|Forward|Fire|Hold|Shields up|Burn|Run|Pull|Go)\b/.test(text) && /!/.test(text)) return { handF: 'fist', armF: -2.5 + Math.sin(k * 6) * .15, elbowF: .5 };
  if (/\b(three|nine|two|ten|one|first)\b/i.test(text)) return { handF: 'point', armF: -1.2, elbowF: 1.4 + Math.sin(k * 5) * .2 };
  return null;
};

export type Actor = { k: string | MLook; id?: string; x: number | ((T: number, t: number) => number); y: number | ((T: number, t: number) => number); s?: number; flip?: boolean | ((T: number, t: number) => boolean); age?: number; p?: MPose | ((T: number, t: number) => MPose); still?: boolean; o?: number | ((T: number, t: number) => number); spk?: string; sleep?: boolean; e?: Expr; sil?: boolean; look?: (T: number, t: number) => MLook };
const val = <V,>(v: V | ((T: number, t: number) => V), T: number, t: number): V => typeof v === 'function' ? (v as any)(T, t) : v;
const ActorEl: React.FC<{ a: Actor; T: number; t: number; i: number; all: Actor[]; ex?: Record<string, Record<string, Expr>> }> = ({ a, T, t, i, all, ex }) => {
  const key = typeof a.k === 'string' ? a.k : ''; const spk = a.spk ?? SPK[key]; const id = a.id ?? key;
  const look = a.look ? a.look(T, t) : typeof a.k === 'string' ? CAST[a.k] : a.k;
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
      else { const sitF = base.sit ? .5 : 1; pose.armF = (base.armF ?? -.7) + Math.sin(T * 2.3 + i) * .28 * sitF; pose.elbowF = (base.elbowF ?? 1.1) + Math.sin(T * 3.1 + i) * .25; }
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
export type Scene = { a: number; b: number; bg: (T: number, t: number) => React.ReactNode; actors: Actor[]; fg?: (T: number, t: number) => React.ReactNode; ui?: (T: number, t: number) => React.ReactNode; wide?: Cam; cams?: Record<string, CamV>; zcu?: number; boil?: number; cam?: (T: number, t: number) => Cam; ex?: Record<string, Record<string, Expr>>; mid?: (T: number, t: number) => React.ReactNode; shake?: (T: number, t: number) => number };
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
  return <Frame cam={{ x: 960, y: 540, z: 1.0 + .05 * (t / d) }} boil={1.2}><B><G t={t} T={T} d={d} /></B></Frame>;
};

/* ---------- helpers ---------- */
const S = (k: string) => (LINES as any[]).find((l) => l.key === k)!.start;
const E = (k: string) => (LINES as any[]).find((l) => l.key === k)!.end;
const Y = 930;
const walkTo = (x0: number, x1: number, t0: number, dur: number) => (T: number, t: number) => lerp(x0, x1, easeInOut(prog(t, t0, t0 + dur)));
const walkP = (t0: number, dur: number, extraP: MPose = {}) => (T: number, t: number): MPose => ({ ...extraP, walk: t > t0 && t < t0 + dur ? 1 : 0, phase: t * 9 });
const stamp = (kind: 'MYTH' | 'EVIDENCE' | 'MAYBE', at: number, dur: number, sub?: string, x = 1600, y = 180) => (T: number) => T > at - .1 && T < at + dur ? <g opacity={1 - prog(T, at + dur - .4, at + dur)}><Stamp kind={kind} p={prog(T, at, at + .5)} x={x} y={y} s={.85} sub={sub} /></g> : null;
const hitShake = (times: number[], amp = 1) => (T: number) => times.reduce((m, h) => Math.max(m, T >= h ? amp * Math.exp(-(T - h) * 5) : 0), 0);

type Item = { a: number; b: number; g?: boolean; render: (T: number) => React.ReactNode };
const scenes: Item[] = [];
const sc = (s: Omit<Scene, 'b'> & { b?: number }) => scenes.push({ a: s.a, b: s.b ?? -1, render: (T) => <SceneShot sc={{ ...s, b: s.b ?? (scenes.find((x) => x.a === s.a)!.b) } as Scene} T={T} /> });
const gfx = (G: React.FC<any>, a: number) => scenes.push({ a, b: -1, g: true, render: (T) => <Gfx C={G} T={T} a={a} b={scenes.find((x) => x.a === a)!.b} /> });

/* square at night with the horse */
const Square = (T: number, t: number, opt: { party?: number; hatch?: number; fire?: number } = {}) => <>
  <Sky tone="night" T={T} />
  <Houses T={T} dark fire={opt.fire} />
  <rect x={-240} y={880} width={2400} height={400} fill="#3a3028" />
  {Array.from({ length: 30 }).map((_, i) => <ellipse key={i} cx={-200 + (i % 10) * 240 + (Math.floor(i / 10) % 2) * 120} cy={920 + Math.floor(i / 10) * 70} rx={100} ry={18} fill="rgba(0,0,0,.18)" />)}
  {[160, 1760].map((x) => <Torch key={x} x={x} y={900} T={T} />)}
  {opt.party ? <Crowd T={T} n={12} y={860} s={.55} seed={3} dance={opt.party} /> : null}
  <WoodenHorse x={900} y={930} s={.78} T={T} hatch={opt.hatch ?? 0} glow={opt.hatch ? .8 : 0} />
</>;
/* ruins of Hisarlık today */
const Ruins = (T: number, t: number, tone: 'day' | 'dusk' = 'day', horse = false) => <>
  <Sky tone={tone} T={T} />
  <rect x={-240} y={620} width={2400} height={700} fill={tone === 'dusk' ? '#9a8a5a' : '#b8b06a'} />
  {Array.from({ length: 50 }).map((_, i) => { const R = rng(i + 500); return <path key={i} d={`M ${R() * 2400 - 240} ${640 + R() * 400} l 6 -18 l 6 18`} stroke="#7a7a3a" strokeWidth={4} fill="none" />; })}
  {[[200, 700, 520, 140], [820, 760, 600, 110], [1460, 690, 520, 160]].map(([x, y, w, h], k) => <g key={k}>
    <path d={`M ${x} ${y} L ${x + 30} ${y - h} L ${x + w * .3} ${y - h + 30} L ${x + w * .55} ${y - h - 10} L ${x + w * .8} ${y - h + 40} L ${x + w} ${y - h + 20} L ${x + w} ${y} Z`} fill={F.stone} stroke={P.ink} strokeWidth={7} strokeLinejoin="round" />
    {Array.from({ length: 6 }).map((_, j) => <line key={j} x1={x + j * w / 6} y1={y} x2={x + j * w / 6 + 10} y2={y - h + 40} stroke={F.stoneD} strokeWidth={4} />)}
    {[0, 1, 2].map((r) => <line key={'r' + r} x1={x} y1={y - 30 - r * 34} x2={x + w} y2={y - 30 - r * 34} stroke={F.stoneD} strokeWidth={3} />)}</g>)}
  <path d="M 700 980 L 1220 980 L 1180 860 L 740 860 Z" fill="#c8b08a" stroke={P.ink} strokeWidth={6} />
  {horse && <WoodenHorse x={1500} y={960} s={.55} T={T} />}
  <g transform="translate(300 930)"><rect x={-6} y={-130} width={12} height={130} fill="#5a5a5a" /><rect x={-90} y={-200} width={180} height={90} fill="#3a5a7a" stroke={P.ink} strokeWidth={5} /><text x={0} y={-162} fontFamily="Mono" fontSize={22} fill="#fff" textAnchor="middle">TROIA</text><text x={0} y={-132} fontFamily="Mono" fontSize={16} fill="#fff" textAnchor="middle">UNESCO 1998</text></g>
</>;

/* ====================== HOOK — the horse is already inside ====================== */
sc({ a: 0, bg: (T, t) => Square(T, t, { party: 1 }), fg: (T) => <><Crowd T={T} n={5} y={1190} s={.95} x0={-200} x1={2100} seed={11} dance={1} /><Embers T={T} n={25} o={.6} /></>,
  wide: { x: 960, y: 560, z: 1.0 },
  cams: { o1: (T, t) => ({ x: lerp(1236, 960, easeInOut(prog(t, .2, 3.6))), y: lerp(230, 520, easeInOut(prog(t, .2, 3.6))), z: lerp(3.2, 1.05, easeInOut(prog(t, .2, 3.6))) }) },
  actors: [{ k: 'ilos', x: 560, y: Y, s: 1.2, p: (T) => ({ holdF: 'cup', armF: -1.6 + Math.sin(T * 4) * .2, elbowF: 1.2 }), e: 'laugh' }, { k: 'you', x: 1300, y: Y, s: 1.2, flip: true, p: { lookY: -1.2, lookX: 1 }, e: 'worried' }],
  ex: { o3: { ilos: 'happy' }, o4: { you: 'thinking' } } });
sc({ a: S('o5'), bg: (T) => <><Sky tone="fire" T={T} /><TroyWalls T={T} tone="fire" burning={1} breach /><Plain T={T} tone="fire" y={760} /></>, fg: (T) => <Embers T={T} n={60} />,
  cam: (T, t) => ({ x: 960, y: lerp(420, 540, t / 6), z: lerp(1.25, 1.05, t / 6) }), actors: [] });
gfx(Rewind, S('o5') + 5.6);

/* ====================== HOME ====================== */
gfx(MapTroy, S('h1'));
sc({ a: S('h2'), bg: (T) => <Ranch T={T} />, wide: { x: 960, y: 560, z: 1.0 },
  mid: (T) => <Horse x={1120} y={940} s={.75} ph={T * 2} gallop={.06} c="#c8a070" />,
  ui: (T) => stamp('MAYBE', S('h4') + .4, 3.2, 'Helen: a legend')(T),
  actors: [{ k: 'dad', x: 820, y: Y, s: 1.2, p: { holdF: 'reins', armF: -.9, elbowF: 1.2 }, e: 'neutral' }, { k: 'you', x: 560, y: Y, s: 1.2, e: 'happy' },
    { k: 'ilos', x: walkTo(-200, 300, 3.5, 1.6), y: Y, s: 1.2, p: walkP(3.5, 1.6), e: 'excited' }],
  ex: { h2c: { ilos: 'laugh' }, h4: { you: 'worried' }, h6: { you: 'scared', ilos: 'worried' }, h7: { dad: 'sad' }, h8: { you: 'thinking' } } });

/* ====================== THE SHIPS ====================== */
sc({ a: S('s1'), bg: (T) => <Rampart T={T} tone="dawn" fleet={70} />, wide: { x: 960, y: 560, z: 1.0 },
  cams: { s1: (T, t) => ({ x: lerp(1400, 900, easeInOut(t / 2.5)), y: lerp(560, 600, t / 2.5), z: lerp(1.6, 1.1, easeInOut(t / 2.5)) }) },
  actors: [{ k: 'ilos', x: 700, y: 900, s: 1.2, e: 'scared', p: { lookX: 1, lookY: -.3 } }, { k: 'you', x: 1050, y: 900, s: 1.2, e: 'worried' }],
  ex: { s3: { ilos: 'scared' } } });
gfx(Ships1186, S('s4'));
sc({ a: S('s5'), bg: (T) => <><Sky tone="dawn" T={T} /><Sea y={560} T={T} fleet={20} fleetS={.3} /><Plain T={T} y={660} tone="dawn" dust={.5} /></>,
  mid: (T, t) => <Army T={T} rows={3} per={14} x0={-100} y0={900} dx={130} s0={.6} seed={2} />,
  shake: hitShake([S('s5') + 2.2], .6),
  actors: [{ k: 'hec', x: 1100, y: 1000, s: 1.3, flip: true, p: { holdF: 'spear', armF: -1.0, elbowF: .3 }, e: 'fierce' }],
  cams: { s5: (T, t) => ({ x: 1050, y: 560, z: 1.25 + t * .05 }) } });
sc({ a: S('s6'), bg: (T) => <><Sky tone="dawn" T={T} /><Sea y={500} T={T} fleet={10} fleetS={.24} /><rect x={-240} y={720} width={2400} height={600} fill={F.sand} /></>,
  mid: (T, t) => <><Ship x={1480} y={700} s={.9} flip T={T} oars={false} />
    {t > 2 && t < 6.5 && <g filter="url(#boil)"><MChar look={greekSoldier(1)} x={lerp(1300, 1060, prog(t, 2, 3))} y={lerp(560, 760, prog(t, 2, 3)) - Math.sin(prog(t, 2, 3) * Math.PI) * 90} s={.7} flip pose={{ holdF: 'spear', armF: -1.2, elbowF: .3, lean: t > 4.4 ? lerp(0, 90, prog(t, 4.4, 5)) : 0 }} opacity={1 - prog(t, 5.2, 6)} /></g>}
    <Arrows t={t - 3.6} n={22} from={[-100, 600]} to={[1060, 740]} spread={240} seed={4} /></>,
  fg: (T, t) => <Army T={T} rows={1} per={8} x0={-120} y0={1200} dx={150} s0={1.0} seed={5} />,
  cam: (T, t) => ({ x: lerp(1300, 900, easeInOut(t / 7)), y: 560, z: 1.15 }), actors: [] });
sc({ a: S('s7'), bg: (T) => <><Sky tone="dawn" T={T} /><Plain T={T} y={640} tone="dawn" /></>, mid: (T) => <Army T={T} rows={2} per={10} x0={-100} y0={800} dx={190} s0={.6} seed={9} />,
  actors: [{ k: 'ilosArm', x: 900, y: Y, s: 1.3, p: { holdF: 'spear', armF: -.4, elbowF: .6 }, e: 'laugh' }, { k: 'youArm', x: 1300, y: Y, s: 1.3, flip: true, p: { holdF: 'spear', armF: -.4, elbowF: .6 }, e: 'worried' }],
  cams: { s7: { x: 1000, y: 580, z: 1.8 }, s8: (T, t) => ({ x: 960, y: 560, z: 1.0 }) } });
sc({ a: S('s8'), bg: (T) => <><Sky tone="day" T={T} /><Sea y={500} T={T} fleet={14} fleetS={.3} /><rect x={-240} y={700} width={2400} height={600} fill={F.sand} /></>,
  mid: (T, t) => <><Dust T={T} x={1300} y={900} w={1200} o={.8} /><Army T={T} rows={4} per={12} x0={2300} y0={1000} dx={-140} dy={-40} s0={.55} greek flip charge={1} speed={140} seed={7} /></>,
  cam: (T, t) => ({ x: 1100 - t * 40, y: 600, z: 1.1 }), shake: () => .25, actors: [] });

/* ====================== NINE YEARS ====================== */
sc({ a: S('w1'), bg: (T, t) => <Beach T={T} tone={t < 2.5 ? 'day' : 'dusk'} ships={6} />, mid: (T) => <><Smoke T={T} x={380} y={700} o={.4} s={.5} /><Crowd T={T} n={6} y={760} s={.45} x0={100} x1={1000} greek seed={2} armed /></>,
  cam: (T, t) => ({ x: lerp(600, 1300, easeInOut(t / 5.6)), y: 560, z: 1.2 }), actors: [] });
sc({ a: S('w2'), bg: (T) => <><Courtyard T={T} night /><Hearth x={960} T={T} /><Chair x={640} y={Y} s={1.0} /><Chair x={1280} y={Y} s={1.0} flip /></>, wide: { x: 960, y: 580, z: 1.05 },
  actors: [{ k: 'you', x: 640, y: Y, s: 1.2, p: { sit: 1, armF: -.8, elbowF: 1.4 }, e: 'sad' }, { k: 'ilos', x: 1280, y: Y, s: 1.2, flip: true, p: (T) => ({ sit: 1, holdF: 'bread', armF: -1.2, elbowF: 1.5 }), e: 'happy' }],
  ex: { w3: { you: 'laugh' }, w3c: { ilos: 'surprised' }, w3d: { you: 'laugh' } } });
sc({ a: S('w4'), bg: (T) => <><Sky tone="day" T={T} /><TroyWalls T={T} x={960} y={900} s={1.25} /><Plain T={T} y={900} /></>,
  ui: (T) => <>{stamp('MYTH', S('w5') + 1.2, 2.8, 'built by Poseidon')(T)}{stamp('EVIDENCE', S('w7') + .6, 3.2, 'the walls are real')(T)}</>,
  cams: { w4: (T, t) => ({ x: 960, y: lerp(300, 600, easeInOut(t / 2.2)), z: 1.1 }), w5: (T, t) => ({ x: 900, y: lerp(560, 260, easeInOut(t / 3.5)), z: 1.3 }) },
  actors: [{ k: 'dad', x: 760, y: 1010, s: 1.25, e: 'neutral', p: { lookY: -1 } }, { k: 'you', x: 1120, y: 1010, s: 1.25, flip: true, e: 'thinking' }],
  ex: { w7: { you: 'happy' } } });
gfx(ArmorCost, S('w8'));
sc({ a: S('w9'), bg: (T) => <Courtyard T={T} />, wide: { x: 960, y: 560, z: 1.05 },
  actors: [{ k: 'youArm', x: 760, y: Y, s: 1.25, p: (T, t) => ({ holdF: 'spear', armF: -.4, elbowF: .6, shieldUp: .5 + Math.sin(t * 2) * .3 }), e: 'worried' },
    { k: 'dad', x: 1180, y: Y, s: 1.25, flip: true, e: 'angry' }, { k: 'ilosArm', x: 420, y: Y, s: 1.2, p: { holdF: 'spear', armF: -.4, elbowF: .6, shieldUp: .6 }, e: 'neutral' }],
  ex: { w10: { dad: 'happy' } } });

/* ====================== ACHILLES WON'T FIGHT ====================== */
sc({ a: S('a1'), bg: (T) => <><Sky tone="night" T={T} /><Houses T={T} dark /><rect x={-240} y={880} width={2400} height={400} fill="#3a3028" />{[300, 1600].map((x) => <Torch key={x} x={x} y={900} T={T} />)}</>, wide: { x: 960, y: 560, z: 1.05 },
  actors: [{ k: 'scout', x: walkTo(2100, 1300, 0, 1.4), y: Y, s: 1.2, flip: true, p: (T, t) => ({ walk: t < 1.4 ? 1 : 0, run: 1, phase: t * 14 }), e: 'excited' },
    { k: 'ilos', x: 900, y: Y, s: 1.2, e: 'surprised' }, { k: 'you', x: 620, y: Y, s: 1.2, e: 'surprised' },
    { k: 'hec', x: walkTo(-300, 300, 15.5, 2), y: Y, s: 1.3, p: walkP(15.5, 2, { holdF: 'spear', armF: -.4, elbowF: .6 }), e: 'fierce' }],
  ex: { a3: { ilos: 'excited' }, a4: { ilos: 'excited', you: 'surprised' }, a4c: { you: 'worried' } } });
sc({ a: S('a5'), bg: (T) => <><Tent T={T} /><Chair x={960} y={Y} s={1.1} /></>, wide: { x: 960, y: 560, z: 1.1 },
  cam: (T, t) => ({ x: 960, y: lerp(620, 520, t / 8), z: lerp(1.0, 1.5, easeInOut(t / 8)) }),
  actors: [{ k: 'achBare', x: 960, y: Y, s: 1.3, p: (T) => ({ sit: 1, armF: -1.9, elbowF: 2.4, lookX: -1, lookY: .5 }), e: 'angry' }] });

/* ====================== THE BATTLE ====================== */
sc({ a: S('b1'), bg: (T) => <><Sky tone="dawn" T={T} /><TroyWalls T={T} x={760} y={760} s={.8} gateOpen={1} /><Plain T={T} y={760} tone="dawn" dust={.7} /></>,
  mid: (T, t) => <><Army T={T} rows={3} per={9} x0={600 - 1000} y0={900} dx={120} s0={.5} speed={120} seed={1} /><Army T={T} rows={2} per={6} x0={200} y0={1060} dx={170} s0={.75} speed={90} seed={3} /></>,
  cam: (T, t) => ({ x: lerp(760, 1000, easeInOut(t / 6)), y: lerp(420, 620, easeInOut(t / 6)), z: lerp(1.35, 1.0, easeInOut(t / 6)) }), actors: [] });
sc({ a: S('b1b'), bg: (T) => <><Sky tone="dawn" T={T} /><Plain T={T} y={700} tone="dawn" dust={.6} /></>,
  mid: (T, t) => <><Army T={T} rows={3} per={15} x0={-160} y0={800} dx={150} dy={-22} s0={.5} seed={6} /><Chariot x={1000} y={900} s={1.1} t={T} speed={.06} driver={trojan(4, false)} warrior={CAST.hec} pose={{ armF: -2.2, elbowF: .3, handF: 'fist', expr: 'fierce', mouth: mouthOf('HEC', T) > .08 ? 'talk' : 'shout', open: mouthOf('HEC', T) }} /></>,
  shake: hitShake([E('b1b') - .3], .9),
  cam: (T, t) => ({ x: lerp(1000, 900, t / 5.4), y: lerp(600, 540, t / 5.4), z: lerp(1.05, 1.4, easeInOut(t / 5.4)) }), actors: [] });
sc({ a: S('b2'), bg: (T) => <><Sky tone="day" T={T} /><Plain T={T} y={640} dust={.8} /></>, mid: (T) => <Army T={T} rows={2} per={8} x0={-200} y0={820} dx={220} s0={.75} seed={8} />,
  shake: () => .35, fg: (T) => <Dust T={T} x={960} y={1100} w={2200} o={.6} />,
  actors: [{ k: 'ilosArm', x: 760, y: Y + 40, s: 1.4, p: { holdF: 'spear', armF: -.4, elbowF: .6, shieldUp: 1 }, e: 'fierce' }, { k: 'youArm', x: 1180, y: Y + 40, s: 1.4, p: { holdF: 'spear', armF: -.4, elbowF: .6, shieldUp: 1 }, e: 'scared' }],
  cams: { b2: { x: 900, y: 520, z: 1.55 } } });
sc({ a: S('b3'), bg: (T) => <><Sky tone="day" T={T} /><Plain T={T} y={600} dust={1} /></>,
  mid: (T, t) => { const meet = prog(t, 0, 4.4); return <>
    <Army T={T} rows={4} per={8} x0={lerp(-1000, -160, meet)} y0={1020} dx={130} dy={-40} s0={.7} charge={1} speed={0} seed={2} />
    <Army T={T} rows={4} per={8} x0={lerp(2900, 2080, meet)} y0={1020} dx={-130} dy={-40} s0={.7} charge={1} greek flip seed={5} />
    <Arrows t={t - .3} n={40} from={[200, 700]} to={[1500, 860]} spread={600} seed={1} /><Arrows t={t - 1.0} n={30} from={[1800, 700]} to={[500, 860]} spread={600} seed={2} />
    {t > 4.3 && <Dust T={T} x={960} y={900} w={900} o={clamp((t - 4.3) * 2)} />}
    {t > 4.4 && t < 4.9 && <circle cx={960} cy={760} r={300 * prog(t, 4.4, 4.9)} fill="#fff6d0" opacity={.5 * (1 - prog(t, 4.4, 4.9))} />}</>; },
  fg: (T, t) => <Chariot x={lerp(-900, 2600, prog(t, .3, 3.0))} y={1180} s={.95} t={T} speed={1} driver={trojan(2, false)} warrior={trojan(7)} pose={{ propA: 70, armF: -1.4, elbowF: .3, expr: 'fierce' }} />,
  shake: (T, t) => (t > 4.4 ? Math.exp(-(t - 4.4) * 2) * 1.2 : 0) + (t > .3 && t < 3 ? .3 : 0),
  cam: (T, t) => ({ x: 960, y: 620, z: lerp(1.05, 1.3, prog(t, 3.8, 5.5)) }), actors: [] });
const melee = (T: number) => <><Sky tone="day" T={T} /><Plain T={T} y={600} dust={1} /><Army T={T} rows={2} per={7} x0={-200} y0={820} dx={170} s0={.6} charge={.6} seed={12} /><Army T={T} rows={2} per={7} x0={2200} y0={820} dx={-170} s0={.6} charge={.6} greek flip seed={13} /></>;
sc({ a: S('b3b'), bg: melee, shake: () => .8,
  fg: (T, t) => <Chariot x={lerp(2600, -1200, prog(t, 0, 1.1))} y={1240} s={1.4} t={T} speed={1} flip driver={trojan(9, false)} warrior={trojan(10)} />,
  actors: [{ k: 'ilosArm', x: 760, y: Y, s: 1.3, p: { holdF: 'spear', armF: -.4, elbowF: .6, crouch: 1, shieldUp: 1 }, e: 'scared' }, { k: 'youArm', x: 1080, y: Y, s: 1.3, p: { holdF: 'spear', armF: -.4, elbowF: .6, crouch: 1, shieldUp: 1 }, e: 'scared' }],
  cams: { b3b: { x: 920, y: 560, z: 1.25 } } });
sc({ a: S('b4'), bg: melee, shake: (T, t) => .45 + hitShake([S('b4') + .5, S('b5') + .3, S('b5b') + .4], 1.2)(T),
  fg: (T) => <Dust T={T} x={960} y={1160} w={2200} o={.5} />,
  actors: [{ k: 'youArm', x: 560, y: Y, s: 1.3, p: (T, t) => ({ holdF: 'spear', armF: -1.4, elbowF: .3, propA: 70, shieldUp: 1, lean: Math.sin(t * 6) * 3 + 4 }), e: 'fierce' },
    { k: 'ilosArm', x: 900, y: Y, s: 1.3, p: (T, t) => ({ holdF: 'spear', armF: -1.5 + Math.sin(t * 7) * .3, elbowF: .3, propA: 70, shieldUp: 1, lean: 6 }), e: 'fierce' },
    { k: greekSoldier(2), x: (T, t) => 1260 - Math.sin(t * 6) * 20, y: Y, s: 1.3, flip: true, spk: '-', p: { holdF: 'spear', armF: -1.4, elbowF: .3, propA: 70, shieldUp: 1, lean: 6 }, e: 'fierce' },
    { k: greekSoldier(4), x: 1560, y: Y, s: 1.25, flip: true, spk: '-', p: { holdF: 'spear', armF: -1.4, elbowF: .3, propA: 70, shieldUp: 1 }, e: 'angry' }],
  cams: { b4: { x: 700, y: 500, z: 1.7 }, b5: { x: 980, y: 520, z: 1.5 }, b5b: { x: 640, y: 480, z: 1.9 } } });
sc({ a: S('b6'), bg: (T) => <Beach T={T} ships={5} fire={.3} />, shake: () => .3,
  mid: (T, t) => <Crowd T={T} n={5} y={900} s={.7} x0={300} x1={1100} seed={21} armed flip={false} pose={(i) => ({ holdF: 'torch', armF: -2.2, elbowF: .4, walk: 1, run: 1, phase: t * 12 + i })} />,
  actors: [{ k: 'hec', x: 520, y: Y + 40, s: 1.35, p: { holdF: 'torch', armF: -2.4, elbowF: .3 }, e: 'fierce' }],
  cams: { b6: { x: 640, y: 480, z: 1.6 } } });
sc({ a: S('b7'), bg: (T, t) => <Beach T={T} ships={5} fire={clamp(.3 + t * .3)} tone="dusk" />, mid: (T, t) => <><Smoke T={T} x={1360} y={700} s={1.2} /><Smoke T={T + 2} x={1000} y={760} s={.9} o={.8} /></>,
  fg: (T, t) => <Embers T={T} n={40} />,
  actors: [{ k: 'pat', x: (T, t) => lerp(1500, 1150, prog(t, 3.5, 7.5)), y: (T, t) => lerp(820, 960, prog(t, 3.5, 7.5)), s: 1.15, flip: true, o: (T, t) => clamp((t - 3.4) * 1.5), p: (T, t) => ({ walk: t > 3.5 ? 1 : 0, run: .6, phase: t * 10, holdF: 'spear', armF: -1.4, elbowF: .3, propA: 70 }), e: 'fierce', spk: '-' }],
  cam: (T, t) => ({ x: lerp(1100, 1250, t / 7.7), y: lerp(520, 600, t / 7.7), z: lerp(1.0, 1.5, easeInOut(prog(t, 3, 7.7))) }) });
sc({ a: S('b8'), bg: (T) => <Beach T={T} ships={5} fire={1} tone="dusk" />, fg: (T) => <Embers T={T} n={30} />, shake: () => .3,
  actors: [{ k: 'youArm', x: 900, y: Y, s: 1.3, p: { holdF: 'spear', armF: -.4, elbowF: .6, shieldUp: 1, lean: -6 }, e: 'scared' }],
  cams: { b8: (T, t) => ({ x: 940, y: 580, z: 2.1 + t * .1 }) } });
sc({ a: S('b9'), bg: (T) => <><Sky tone="fire" T={T} /><rect x={-240} y={760} width={2400} height={600} fill="#2a1a14" /><Ship x={1500} y={760} s={.7} flip beached oars={false} T={T} fire={1} /><Ship x={500} y={780} s={.6} beached oars={false} T={T} fire={1} /><circle cx={960} cy={700} r={520} fill="url(#fireGlow)" opacity={.9} /></>,
  fg: (T) => <Embers T={T} n={50} />,
  actors: [{ k: 'hec', x: (T, t) => 760 + Math.sin(t * 3) * 30, y: Y, s: 1.35, sil: true, p: (T, t) => ({ holdF: 'spear', armF: t > 4.5 ? -2.4 : -1.4, elbowF: .3, propA: t > 4.5 ? 0 : 70, shieldUp: 1 }) },
    { k: 'pat', x: (T, t) => 1160 - Math.sin(t * 3) * 30, y: Y, s: 1.3, flip: true, sil: true, spk: '-', o: (T, t) => 1 - prog(t, 4.2, 5.2), p: (T, t) => ({ holdF: 'spear', armF: -1.4, elbowF: .3, propA: 70, shieldUp: 1, lean: lerp(0, -70, prog(t, 3.6, 4.6)) }) }],
  shake: hitShake([S('b9') + 3.6], 1.2),
  cam: (T, t) => ({ x: 960, y: lerp(540, 600, t / 8.7), z: lerp(1.2, 1.05, t / 8.7) }) });
sc({ a: S('b10'), bg: (T) => <><Sky tone="dusk" T={T} /><Plain T={T} y={700} tone="dusk" /><TroyWalls T={T} x={1500} y={700} s={.45} tone="dusk" /></>, mid: (T) => <><ellipse cx={720} cy={940} rx={90} ry={30} fill={F.stoneD} stroke={P.ink} strokeWidth={6} /><ellipse cx={1180} cy={940} rx={90} ry={30} fill={F.stoneD} stroke={P.ink} strokeWidth={6} /></>,
  actors: [{ k: 'youArm', x: 720, y: Y + 20, s: 1.25, p: { sit: 1, holdF: 'none', armF: -.6, elbowF: 1.2 }, e: 'worried' }, { k: 'ilosArm', x: 1180, y: Y + 20, s: 1.25, flip: true, p: { sit: 1, armF: -1.8, elbowF: 2.4 }, e: 'laugh' }] });

/* ====================== HECTOR ====================== */
sc({ a: S('k1'), bg: (T) => <><Sky tone="dusk" T={T} /><rect x={-240} y={-200} width={2400} height={1100} fill="#8a7458" /><Fresco y={100} h={60} />
    <path d="M 760 900 L 760 330 Q 960 230 1160 330 L 1160 900 Z" fill="#2a1a12" stroke={P.ink} strokeWidth={8} /><path d="M 780 900 L 780 340 Q 960 250 1140 340 L 1140 900 Z" fill="#6a5a8a" opacity={.6} />
    <rect x={-240} y={900} width={2400} height={300} fill="#6a5a44" /><Torch x={640} y={900} T={T} /><Torch x={1280} y={900} T={T} /></>,
  wide: { x: 960, y: 560, z: 1.05 },
  cams: { k4: (T, t) => ({ x: 980, y: 590, z: 1.9 + t * .02 }) },
  actors: [{ k: 'hec', x: 1080, y: Y, s: 1.3, flip: true, look: (T) => T > S('k4') + 4 ? CAST.hecBare : CAST.hec, p: (T) => T > S('k4') + 1.2 ? { holdF: 'baby', armF: -1.3, elbowF: 1.6, holdB: T > S('k4') + 4 ? 'helmet' : 'none', armB: -.6, elbowB: .8 } : { holdF: 'spear', armF: -.4, elbowF: .6 }, e: 'sad' },
    { k: 'and', x: 820, y: Y, s: 1.2, p: (T) => T < S('k4') + 1.2 ? { holdF: 'baby', armF: -1.3, elbowF: 1.6 } : { armF: -.6, elbowF: 1.2 }, e: 'worried' },
    { k: 'youArm', x: 1560, y: Y, s: 1.15, flip: true, p: { holdF: 'spear', armF: -.4, elbowF: .6 }, e: 'sad', spk: '-' }],
  ex: { k3c: { and: 'sad' }, k4b: { and: 'sad', hec: 'happy' } } });
sc({ a: S('k5'), bg: (T) => <><Sky tone="day" T={T} /><TroyWalls T={T} x={960} y={860} s={1.0} gateOpen={1} /><Plain T={T} y={860} dust={.4} /></>,
  mid: (T, t) => <Crowd T={T} n={9} y={900} s={.55} x0={1700} x1={2400} seed={30} armed flip pose={(i) => ({ walk: 1, run: 1, phase: t * 13 + i })} />,
  actors: [{ k: 'hec', x: 1260, y: 1000, s: 1.15, p: { holdF: 'spear', armF: -.4, elbowF: .6, lookX: 1 }, e: 'fierce' }],
  cam: (T, t) => ({ x: lerp(1500, 1200, easeInOut(t / 5)), y: 560, z: 1.15 }) });
sc({ a: S('k6'), bg: (T) => <Rampart T={T} tone="day" fleet={0} />, shake: () => .2,
  actors: [{ k: 'ilos', x: 820, y: 900, s: 1.3, p: { armF: -2.4, elbowF: .2, handF: 'open' }, e: 'scared' }, { k: 'you', x: 1160, y: 900, s: 1.3, e: 'scared' }],
  cams: { k6: { x: 900, y: 580, z: 1.8 } } });
sc({ a: S('k7'), bg: (T) => <><Sky tone="day" T={T} /><Plain T={T} y={700} dust={.7} /></>, shake: () => .4,
  actors: [{ k: 'ach', x: 960, y: Y, s: 1.4, p: { holdF: 'spear', armF: -1.4, elbowF: .3, propA: 70 }, e: 'fierce' }],
  cams: { k7: (T, t) => ({ x: 980, y: 560, z: 2.1 + t * .12 }) } });
gfx(WallsChase, S('k8'));
sc({ a: S('k8b'), bg: (T) => <Rampart T={T} tone="dusk" fleet={0} />, actors: [{ k: 'you', x: 960, y: 900, s: 1.35, e: 'sad', p: { lookY: .6 } }, { k: 'ilos', x: 1300, y: 900, s: 1.3, flip: true, e: 'sad' }],
  cams: { k8b: (T, t) => ({ x: 1050, y: 580, z: 1.9 + t * .04 }) } });
sc({ a: S('k9'), bg: (T) => <><Tent T={T} /><Chair x={1200} y={Y} s={1.1} flip /></>, wide: { x: 960, y: 560, z: 1.05 },
  cams: { k9: (T, t) => ({ x: lerp(500, 960, easeInOut(t / 5.5)), y: 560, z: lerp(1.4, 1.1, easeInOut(t / 5.5)) }), k11: { x: 1080, y: 600, z: 1.7 } },
  actors: [{ k: 'pri', x: (T, t) => t < 3.5 ? lerp(300, 820, prog(t, 0, 3.4)) : 820, y: Y, s: 1.25, p: (T, t) => t < 3.4 ? { walk: 1, phase: t * 6, holdF: 'staff', armF: -.4, elbowF: .5 } : { kneel: easeOut(prog(t, 3.4, 4.2)), armF: -1.5, elbowF: .6 }, e: 'sad' },
    { k: 'achBare', x: 1200, y: Y, s: 1.3, flip: true, p: (T) => T > S('k11') ? { armF: -1.2, elbowF: .9 } : { sit: 1, armF: -.8, elbowF: 1.5 }, e: 'angry' }],
  ex: { k10: { achBare: 'sad' }, k11: { pri: 'sad' }, k12: { achBare: 'sad' } } });
gfx(IliadSpan, S('k12'));

/* ====================== THE HORSE ====================== */
sc({ a: S('t1'), bg: (T, t) => <><Sky tone="dawn" T={T} /><Sea y={560} T={T} /><rect x={-240} y={650} width={2400} height={700} fill={F.sand} />
    {[300, 700].map((x, k) => <path key={k} d={`M ${x - 110} 700 L ${x} 640 L ${x + 110} 700`} stroke={P.ink} strokeWidth={5} fill="none" opacity={.5} />)}{[260, 620].map((x) => <ellipse key={x} cx={x} cy={720} rx={60} ry={14} fill="#2a2420" opacity={.4} />)}
    <WoodenHorse x={1380} y={940} s={.7} T={T} /></>,
  cam: (T, t) => ({ x: lerp(500, 1300, easeInOut(t / 7)), y: lerp(560, 420, easeInOut(t / 7)), z: lerp(1.3, 1.1, t / 7) }),
  actors: [{ k: 'you', x: 820, y: Y, s: 1.0, p: { lookY: -1 }, e: 'surprised' }, { k: 'ilos', x: 640, y: Y, s: 1.0, e: 'surprised' }] });
sc({ a: S('t2'), bg: (T) => <><Sky tone="day" T={T} /><Sea y={560} T={T} /><rect x={-240} y={650} width={2400} height={700} fill={F.sand} /><WoodenHorse x={1500} y={940} s={.7} T={T} /><Crowd T={T} n={8} y={860} s={.5} x0={100} x1={1200} seed={40} /></>,
  wide: { x: 960, y: 560, z: 1.0 },
  ui: (T) => stamp('MAYBE', S('t3b') + 4, 3.5, 'Sinon: from the Aeneid')(T),
  actors: [{ k: 'ilos', x: 520, y: Y, s: 1.2, e: 'excited' }, { k: 'lao', x: 860, y: Y, s: 1.2, p: { holdF: 'staff', armF: -.4, elbowF: .5 }, e: 'angry' },
    { k: 'sin', x: 1200, y: Y, s: 1.15, flip: true, e: 'worried' }, { k: 'cas', x: walkTo(-260, 260, 16.4, 1.3), y: Y, s: 1.15, p: (T, t) => ({ walk: t > 16.4 && t < 17.7 ? 1 : 0, run: 1, phase: t * 12, armF: -2.4, elbowF: .2 }), e: 'scared' },
    { k: 'you', x: 1420, y: Y, s: 1.15, flip: true, e: 'thinking', o: 1 }],
  ex: { t3: { ilos: 'surprised' }, t3b: { lao: 'angry', ilos: 'happy' }, t4: { ilos: 'laugh', you: 'worried' }, t5: { ilos: 'laugh' }, t5b: { you: 'worried' } } });
sc({ a: S('t6'), bg: (T) => <><Sky tone="day" T={T} /><TroyWalls T={T} x={1300} y={820} s={.75} breach /><Plain T={T} y={820} /></>,
  mid: (T, t) => <><WoodenHorse x={lerp(250, 520, t / 11)} y={1000} s={.55} T={T} /><path d={`M ${lerp(250, 520, t / 11) + 230} 640 Q ${900} 760 1300 900`} stroke="#c8a870" strokeWidth={10} strokeDasharray="14 6" fill="none" /></>,
  ui: (T) => stamp('MAYBE', S('t7') + 2.2, 3.4, 'the horse is not in the Iliad', 1560, 960)(T),
  fg: (T, t) => <Crowd T={T} n={7} y={1080} s={.85} x0={800} x1={1900} seed={44} flip pose={(i) => ({ armF: -1.6 + Math.sin(t * 4 + i) * .25, elbowF: .4, lean: 14, walk: .4, phase: t * 4 + i, expr: 'fierce' })} />,
  actors: [{ k: 'ilos', x: 1180, y: 1000, s: 1.2, flip: true, p: (T, t) => ({ armF: -1.6 + Math.sin(t * 4) * .25, elbowF: .4, lean: 14 }), e: 'excited' }, { k: 'you', x: 1450, y: 1000, s: 1.2, flip: true, p: (T, t) => ({ armF: -1.6 + Math.sin(t * 4 + 1) * .25, elbowF: .4, lean: 12 }), e: 'worried' }],
  cams: { t6: { x: 1250, y: 640, z: 1.6 }, t7: (T, t) => ({ x: lerp(1000, 960, t / 6), y: 520, z: lerp(1.15, 1.0, t / 6) }), t8: { x: 1350, y: 650, z: 1.8 }, t9: { x: 1150, y: 650, z: 1.8 } } });

/* ====================== THE LAST NIGHT ====================== */
sc({ a: S('n1'), bg: (T, t) => Square(T, t, { hatch: prog(t, 1.5, 4.5) }), fg: (T, t) => <rect x={-240} y={-200} width={2400} height={1400} fill="#000" opacity={.25} />,
  cam: (T, t) => ({ x: lerp(960, 860, t / 6), y: lerp(560, 600, t / 6), z: lerp(1.0, 1.8, easeInOut(t / 6)) }),
  actors: [{ k: 'ilos', x: 420, y: 1000, s: 1.0, p: { lean: -84 }, sleep: true, spk: '-' }, { k: trojan(3, false), x: 1500, y: 1010, s: .95, p: { lean: 82 }, sleep: true, spk: '-' }] });
sc({ a: S('n2'), bg: (T, t) => <><Sky tone="night" T={T} /><Houses T={T} dark fire={clamp(t / 6)} /><rect x={-240} y={880} width={2400} height={400} fill="#3a3028" /></>, fg: (T, t) => <Embers T={T} n={30} o={clamp(t / 5)} />,
  shake: hitShake([S('n3') + .2], .6),
  actors: [{ k: 'you', x: 760, y: Y, s: 1.3, p: (T, t) => t < 1.5 ? { kneel: 1, armF: -.6, elbowF: 1 } : {}, e: 'scared' }, { k: 'ilos', x: 1160, y: Y, s: 1.3, flip: true, p: (T, t) => t < 2.6 ? { sit: 1, armF: -.5, elbowF: 1 } : { holdF: 'spear', armF: -.4, elbowF: .6 }, e: 'scared' }],
  ex: { n3c: { you: 'sad' } } });
sc({ a: S('n4'), bg: (T) => <><Sky tone="fire" T={T} /><Sea y={600} T={T} dark fleet={18} fleetS={.25} /><TroyWalls T={T} x={1100} y={860} s={.75} tone="fire" burning={.6} gateOpen={1} /><Plain T={T} y={860} tone="fire" /></>,
  mid: (T, t) => <Army T={T} rows={3} per={10} x0={2100} y0={1000} dx={-110} dy={-30} s0={.5} greek flip speed={150} seed={50} />,
  fg: (T) => <Embers T={T} n={40} />,
  cam: (T, t) => ({ x: lerp(1500, 1050, easeInOut(t / 6.6)), y: 600, z: lerp(1.0, 1.25, t / 6.6) }), actors: [] });
const burning = (T: number) => <><Sky tone="fire" T={T} /><Houses T={T} dark fire={1} /><rect x={-240} y={880} width={2400} height={400} fill="#2a2018" /><Smoke T={T} x={400} y={500} /><Smoke T={T + 3} x={1600} y={460} /></>;
sc({ a: S('n5'), bg: burning, fg: (T) => <Embers T={T} n={50} />, shake: () => .25,
  actors: [{ k: 'aen', x: 600, y: Y, s: 1.3, p: { handF: 'point', armF: -1.5, elbowF: .1 }, e: 'fierce' }, { k: 'anch', x: 520, y: 760, s: .8, p: { armF: -1.2, elbowF: 1.2 }, e: 'scared', spk: '-' },
    { k: 'youArm', x: 1000, y: Y, s: 1.3, flip: true, e: 'scared' }, { k: 'ilosArm', x: 1400, y: Y, s: 1.3, flip: true, p: { holdF: 'spear', armF: -1.4, elbowF: .3, propA: 70, shieldUp: 1 }, e: 'fierce' }],
  ex: { n6: { ilosArm: 'fierce' }, n6b: { youArm: 'sad' } } });
sc({ a: S('n7'), bg: burning, fg: (T) => <Embers T={T} n={60} />,
  cam: (T, t) => ({ x: 1300 - t * 70, y: 540, z: 1.25 }),
  actors: [{ k: 'aen', x: (T, t) => 1300 - t * 70, y: Y, s: 1.25, flip: true, p: (T, t) => ({ walk: 1, phase: t * 7, armF: -1.8, elbowF: 1.6 }), e: 'fierce' },
    { k: 'anch', x: (T, t) => 1310 - t * 70, y: (T, t) => 740 + Math.abs(Math.sin(t * 7)) * 6, s: .8, flip: true, p: { armF: -1.2, elbowF: 1.2 }, e: 'scared', spk: '-' },
    { k: 'youArm', x: (T, t) => 1560 - t * 70, y: Y, s: 1.25, flip: true, p: (T, t) => ({ walk: 1, phase: t * 7 + 1, lookX: 1 }), e: 'sad' }] });
sc({ a: S('n10'), bg: (T) => <><Sky tone="dawn" T={T} /><Sea y={520} T={T} /><path d="M -240 520 L 300 470 L 700 520 Z" fill="#6a5a6a" opacity={.6} /></>,
  mid: (T, t) => <>{[0, 1, 2, 3].map((k) => <Ship key={k} x={1300 - t * 40 - k * 260} y={680 + (k % 2) * 60} s={.45 - k * .05} T={T} flip />)}<TroyWalls T={T} x={1900} y={560} s={.18} tone="fire" burning={1} /></>,
  ui: (T) => stamp('MYTH', S('n10') + 2.5, 3.5, 'Rome founded by Trojans')(T),
  cam: (T, t) => ({ x: lerp(1100, 900, t / 7), y: 540, z: 1.1 }), actors: [] });

/* ====================== WHAT'S REAL ====================== */
sc({ a: S('r1'), bg: (T) => Ruins(T, 0), cam: (T, t) => ({ x: 960, y: lerp(420, 560, t / 1.8), z: lerp(1.3, 1.05, t / 1.8) }), actors: [] });
gfx(NineCities, S('r2'));
gfx(Tablet, S('r4'));
sc({ a: S('r4c'), bg: (T) => Ruins(T, 0, 'day', true), ui: (T) => stamp('MAYBE', S('r4d') + 1, 4, 'siege engine? earthquake?', 520, 200)(T),
  actors: [{ k: 'you', x: 900, y: 1000, s: 1.2, o: .75, e: 'thinking', p: { lookX: 1 } }],
  cams: { r4c: { x: 1000, y: 520, z: 1.6 }, r4d: (T, t) => ({ x: lerp(1000, 1450, easeInOut(t / 6)), y: lerp(560, 460, t / 11), z: lerp(1.2, 1.5, t / 11) }) } });
sc({ a: S('r5'), bg: (T) => Ruins(T, 0, 'dusk', true), fg: (T) => <Embers T={T} n={14} o={.35} />,
  actors: [{ k: 'you', x: 840, y: 1000, s: 1.2, o: .8, e: 'thinking' }, { k: 'ilos', x: 600, y: 1000, s: 1.2, o: (T, t) => .65 * clamp((t - 2) / 2), e: 'happy' }],
  cams: { r5: { x: 860, y: 520, z: 1.8 }, r6: (T, t) => ({ x: 800, y: 560, z: 1.3 }), r7: (T, t) => ({ x: lerp(800, 1450, easeInOut(t / 7)), y: lerp(560, 380, easeInOut(t / 7)), z: lerp(1.2, 1.7, easeInOut(t / 7)) }) } });

// close the list
scenes.sort((p, q) => p.a - q.a);
scenes.forEach((s, i) => { s.b = i < scenes.length - 1 ? scenes[i + 1].a : 9999; });
export const SHOTS = scenes;
