import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P } from './art';
import { MChar, CAST, MLook, MPose, Expr, Chair, citizen, legionary } from './chars';
import { F, Sky, Torch, Embers, Crowd, Army, Arrows, Dust, Smoke } from './sets';
import { SY, Blur, DofDefs, SeaW, Warship, Syracusia, PulleyRig, SeaWalls, Claw, Catapult, Stone, Splash, Workshop, SandTray, Bath, Tub, Palace, Shipyard, Harbor, Festival, Courtyard, TombSite, Lab } from './syra';
import { Rewind, CrownWater, Lever, Pulleys, Screw, SandReckoner, PiPolys, MirrorTest, PalimpsestG, SiegePlan, Stamp } from './agraphics';
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
      <DofDefs />
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
const SPK: Record<string, string> = { you: 'YOU', youKid: 'YOU', arch: 'ARCH', archYoung: 'ARCH', archBath: 'ARCH', kleo: 'KLEO', kleoKid: 'KLEO', mom: 'MOM', hiero: 'HIERO', gold: 'GOLD', capt: 'CAPT', marc: 'MARC', sold: 'SOLD', cic: 'CIC' };
const blinkAt = (T: number, s: number) => ((T + s * 1.7) % 3.9) < .12 ? 1 : 0;
const autoExpr = (text: string): Expr | null => /!$/.test(text) ? 'excited' : /\?$/.test(text) ? 'surprised' : null;
/* NEW in ep05: gestures driven by the words being said */
const gesture = (text: string, T: number, ln: any): MPose | null => {
  const k = T - ln.start;
  if (/\b(Look|That's|There|See|Watch)\b/.test(text)) return { handF: 'point', armF: -1.55, elbowF: .1 };
  if (/\b(Push|Forward|Fire|Hold|Burn|Run|Pull|Go|Lower|Drop|Eureka|Wake|Prove)\b/.test(text) && /!/.test(text)) return { handF: 'fist', armF: -2.5 + Math.sin(k * 6) * .15, elbowF: .5 };
  if (/\b(three|six|twelve|sixty|hundred|two|ten|one|first|sixty-three|ninety-six)\b/i.test(text)) return { handF: 'point', armF: -1.2, elbowF: 1.4 + Math.sin(k * 5) * .2 };
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

/* ---------- recurring pieces ---------- */
const kidAge = .66;
const crowdFg = (T: number, n = 5, seed = 7, y = 1190) => <Blur r={6}><Crowd T={T} n={n} y={y} s={1.05} x0={-200} x1={2100} seed={seed} /></Blur>;
const sandCircles = (T: number, t: number, wipe = 0) => <g>
  <ellipse cx={960} cy={980} rx={520} ry={80} fill="#d8c49a" />
  <g transform="translate(960 975) scale(1 .22)" opacity={1 - wipe}>
    <circle r={300} fill="none" stroke="#5a4a30" strokeWidth={10} strokeDasharray={`${clamp(t / 4) * 1900} 1900`} />
    <polygon points={Array.from({ length: 12 }).map((_, k) => `${Math.cos(k / 12 * Math.PI * 2) * 300},${Math.sin(k / 12 * Math.PI * 2) * 300}`).join(' ')} fill="none" stroke="#5a4a30" strokeWidth={7} />
    <circle cx={150} cy={0} r={150} fill="none" stroke="#5a4a30" strokeWidth={7} /><line x1={-300} y1={0} x2={300} y2={0} stroke="#5a4a30" strokeWidth={7} />
  </g>
  {wipe > 0 && <path d={`M ${700} 990 q 100 -30 ${240 * wipe} 10`} stroke="#c8b080" strokeWidth={40} fill="none" opacity={.8} />}
</g>;

/* ====================== HOOK ====================== */
sc({ a: 0, bg: (T, t) => <><Courtyard T={T} tone="fire" smoke={1} />{sandCircles(T, t + 4)}</>, fg: (T) => <Embers T={T} n={30} />,
  mid: (T, t) => t > 3.2 && t < 6.3 ? <path d={`M ${2100 - (t - 3.2) * 260} 1000 L ${1500 - (t - 3.2) * 200} 1000 L ${1300 - (t - 3.2) * 200} 600 Z`} fill="#000" opacity={.35} /> : null,
  cams: { o1: (T, t) => ({ x: lerp(960, 900, t / 6), y: lerp(880, 620, easeInOut(prog(t, .5, 5.5))), z: lerp(2.1, 1.1, easeInOut(prog(t, .5, 5.5))) }), o2: { x: 1450, y: 560, z: 1.8 }, o3: (T, t) => ({ x: 820, y: 640, z: 1.9 + t * .25 }), o4: (T, t) => ({ x: 960, y: lerp(640, 480, t / 6), z: lerp(1.6, 1.05, easeInOut(t / 6)) }) },
  shake: hitShake([S('o2') + .1], .7),
  actors: [{ k: 'arch', x: 800, y: 990, s: 1.2, p: (T) => ({ kneel: 1, holdF: 'stick', armF: -1.0 + Math.sin(T * 2) * .15, elbowF: .4, lookY: .9 }), e: 'thinking' },
    { k: 'sold', x: (T, t) => t < 5.8 ? lerp(2300, 1500, prog(t, 4.3, 5.8)) : 1500, y: Y + 40, s: 1.3, flip: true, p: (T, t) => ({ walk: t > 4.3 && t < 5.8 ? 1 : 0, phase: t * 9, holdF: 'gladius', armF: -1.4, elbowF: .6 }), e: 'angry' }],
  ex: { o3: { sold: 'surprised' } } });
gfx(Rewind, S('o4') + 5.6);

/* ====================== THE WORKSHOP ====================== */
sc({ a: S('w1'), bg: (T) => <><Harbor T={T} /><g transform="translate(0 0)">{[0, 1, 2, 3].map((i) => <g key={i}><rect x={-200 + i * 560} y={440} width={420} height={460} fill={i % 2 ? SY.lime : '#e8cfa8'} stroke={P.ink} strokeWidth={7} /><path d={`M ${-214 + i * 560} 440 L ${10 + i * 560} 380 L ${234 + i * 560} 440 Z`} fill={SY.terra} stroke={P.ink} strokeWidth={6} /><rect x={-60 + i * 560} y={720} width={110} height={180} fill={SY.woodD} stroke={P.ink} strokeWidth={6} /></g>)}</g><rect x={-240} y={900} width={2400} height={300} fill="#d8c49a" /></>,
  fg: (T) => crowdFg(T, 4, 3),
  wide: { x: 960, y: 560, z: 1.0 }, cams: { w1: (T, t) => ({ x: lerp(1300, 700, easeInOut(t / 5.4)), y: 560, z: 1.15 }) },
  actors: [{ k: 'mom', x: 520, y: Y, s: 1.2, e: 'happy' }, { k: 'youKid', age: kidAge, x: 820, y: Y, s: 1.2, flip: true, p: { holdF: 'bread', armF: -1.2, elbowF: 1.4 }, e: 'happy' }] });
sc({ a: S('w3'), bg: (T) => <><Workshop T={T} /><SandTray x={960} y={950} w={420} draw={1} ash /></>, wide: { x: 960, y: 560, z: 1.05 },
  cams: { w4: { x: 900, y: 700, z: 1.6 }, w7: (T, t) => ({ x: lerp(960, 1200, t / 11), y: 540, z: lerp(1.0, 1.25, t / 11) }) },
  actors: [{ k: 'archYoung', x: 760, y: Y, s: 1.25, p: (T) => T < S('w4') + 4 ? { kneel: 1, holdF: 'stick', armF: -1.0 + Math.sin(T * 2) * .1, elbowF: .4, lookY: .8 } : {}, e: 'thinking' },
    { k: 'youKid', age: kidAge, x: walkTo(1700, 1180, 0, 1.5), y: Y, s: 1.25, flip: true, p: (T, t) => ({ walk: t < 1.5 ? 1 : 0, phase: t * 9, holdF: t < S('w6') - S('w3') ? 'bread' : 'none', armF: -1.2, elbowF: 1.4 }), e: 'surprised' },
    { k: 'kleoKid', age: kidAge, x: walkTo(2200, 1500, 27.6, 1.5), y: Y, s: 1.25, flip: true, p: walkP(27.6, 1.5), e: 'laugh', o: (T, t) => t > 27.4 ? 1 : 0 }],
  ex: { w5: { archYoung: 'happy' }, w6: { youKid: 'excited' }, w8: { youKid: 'laugh' } } });

/* ====================== THE CROWN ====================== */
const palaceActors = (goldE: Expr = 'worried'): Actor[] => [{ k: 'hiero', x: 960, y: 880, s: 1.2, p: { sit: 1, holdF: 'crown', armF: -1.2, elbowF: 1.3 }, e: 'angry' },
  { k: 'gold', x: 1440, y: Y, s: 1.2, flip: true, e: goldE }, { k: 'archYoung', x: 520, y: Y, s: 1.25, e: 'thinking' }, { k: 'you', x: 300, y: Y, s: 1.15, e: 'surprised' }];
sc({ a: S('c1'), bg: (T) => <Palace T={T} />, wide: { x: 960, y: 560, z: 1.0 }, cams: { c1: (T, t) => ({ x: 960, y: lerp(300, 540, easeInOut(t / 3.2)), z: lerp(1.5, 1.05, easeInOut(t / 3.2)) }) },
  actors: palaceActors(), ex: { c3: { hiero: 'angry', archYoung: 'thinking' }, c5: { you: 'laugh' } } });
sc({ a: S('c6'), bg: (T, t) => <Bath T={T} spill={0} />, fg: (T, t) => <Tub x={960} y={940} spill={easeOut(prog(t, 1.2, 3.5))} T={T} />, wide: { x: 960, y: 600, z: 1.2 },
  cams: { c6: (T, t) => ({ x: 960, y: 580, z: lerp(1.1, 1.5, t / 5) }), c7: (T, t) => ({ x: 960, y: 480, z: 1.6 }) },
  actors: [{ k: 'archBath', x: 960, y: (T, t) => T < S('c7') ? 900 + Math.min(1, t / 1.5) * 30 : 760 - Math.abs(Math.sin((T - S('c7')) * 8)) * 30, s: 1.25, p: (T) => T < S('c7') ? { armF: -.3, elbowF: .4, expr: 'thinking' } : { armF: -2.7, armB: 2.6, elbowF: .2, elbowB: .2 }, e: 'excited' }],
  shake: hitShake([S('c7')], .5) });
sc({ a: S('c8'), bg: (T, t) => <><Harbor T={T} />{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={-200 + i * 480 - t * 60} y={460} width={380} height={440} fill={i % 2 ? SY.lime : '#e8cfa8'} stroke={P.ink} strokeWidth={7} /><path d={`M ${-214 + i * 480 - t * 60} 460 L ${-10 + i * 480 - t * 60} 400 L ${194 + i * 480 - t * 60} 460 Z`} fill={SY.terra} stroke={P.ink} strokeWidth={6} /></g>)}<rect x={-240} y={900} width={2400} height={300} fill="#d8c49a" /><Crowd T={T} n={8} y={900} s={.7} x0={-100 - t * 60} x1={2100 - t * 60} seed={12} pose={(i) => ({ expr: i % 3 ? 'laugh' : 'surprised', lookX: 1 })} /></>,
  fg: (T, t) => <Blur r={8}><Crowd T={T} n={4} y={1210} s={1.1} x0={-300 - t * 140} x1={2300 - t * 140} seed={21} pose={() => ({ expr: 'laugh' })} /></Blur>,
  cam: (T, t) => ({ x: 900 + t * 140, y: 560, z: 1.15 }),
  actors: [{ k: 'archBath', x: (T, t) => 900 + t * 200, y: Y, s: 1.2, p: (T, t) => ({ walk: 1, run: 1, phase: t * 14, holdF: 'towel', armF: -2.4, elbowF: .3 }), e: 'excited' },
    { k: 'kleo', x: (T, t) => 520 + t * 200, y: Y, s: 1.15, p: (T, t) => ({ walk: 1, run: 1, phase: t * 14 + 1, armF: -1.6, elbowF: .2, handF: 'point' }), e: 'laugh' },
    { k: 'you', x: (T, t) => 300 + t * 200, y: Y, s: 1.15, p: (T, t) => ({ walk: 1, run: 1, phase: t * 14 + 2 }), e: 'laugh' }] });
gfx(CrownWater, S('c9'));
sc({ a: S('c9b'), bg: (T) => <><Workshop T={T} /><g transform="translate(1180 900)"><path d="M -110 -200 L -100 0 L 100 0 L 110 -200 Z" fill="rgba(140,200,210,.3)" stroke={P.ink} strokeWidth={6} /><rect x={-104} y={-180} width={208} height={178} fill="#7ac0cc" opacity={.7} /></g></>, wide: { x: 960, y: 560, z: 1.1 },
  actors: [{ k: 'you', x: 720, y: Y, s: 1.25, e: 'thinking' }, { k: 'archYoung', x: 960, y: Y, s: 1.25, flip: true, p: { holdF: 'crown', armF: -1.4, elbowF: 1.2 }, e: 'excited' }] });
sc({ a: S('c10'), bg: (T) => <Palace T={T} />, wide: { x: 960, y: 560, z: 1.0 },
  ui: (T) => stamp('MAYBE', S('c10') + 6.5, 4, 'Vitruvius, 200 years later')(T),
  cam: (T, t) => ({ x: lerp(1300, 960, easeInOut(t / 6)), y: 540, z: lerp(1.6, 1.05, easeInOut(t / 6)) }),
  actors: palaceActors('scared').map((a) => a.k === 'gold' ? { ...a, p: (T: number, t: number) => ({ kneel: easeOut(prog(t, 2, 3)), armF: -2.4, elbowF: .3 }) } : a.k === 'hiero' ? { ...a, e: 'angry' as Expr } : a.k === 'archYoung' ? { ...a, e: 'happy' as Expr } : a) });

/* ====================== THE LEVER ====================== */
const yard = (T: number, moved = 0) => <><Shipyard T={T} /><Syracusia x={1080} y={780} s={.62} T={T} moved={moved} /></>;
sc({ a: S('l1'), bg: (T) => yard(T), fg: (T) => crowdFg(T, 4, 33), wide: { x: 960, y: 560, z: 1.0 },
  cams: { l1: (T, t) => ({ x: lerp(1300, 900, easeInOut(t / 7)), y: lerp(420, 560, easeInOut(t / 7)), z: lerp(1.25, 1.1, t / 7) }) },
  actors: [{ k: 'hiero', x: 460, y: Y, s: 1.2, p: { handF: 'point', armF: -1.5, elbowF: .1 }, e: 'neutral' }, { k: 'archYoung', x: 760, y: Y, s: 1.25, e: 'happy' }, { k: 'capt', x: 1080, y: Y, s: 1.2, flip: true, e: 'surprised' }, { k: 'you', x: 240, y: Y, s: 1.15, e: 'excited' }],
  ex: { l3: { archYoung: 'laugh', hiero: 'laugh' } } });
gfx(Lever, S('l2'));
sc({ a: S('l3'), bg: (T) => yard(T), wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'archYoung', x: 760, y: Y, s: 1.25, e: 'happy' }, { k: 'capt', x: 1080, y: Y, s: 1.2, flip: true, e: 'surprised' }],
  cams: { l3: { x: 1000, y: 600, z: 1.7 } } });
sc({ a: S('l4'), bg: (T, t) => <>{yard(T, easeInOut(prog(t, 3, 20)) * 260)}<PulleyRig x={420} y={920} T={T} pull={prog(t, 3, 20)} toX={(T => 600)(T)} /><Crowd T={T} n={7} y={880} s={.6} x0={1500} x1={2100} seed={41} pose={(i) => ({ expr: t > 5 ? (i % 2 ? 'surprised' : 'excited') : 'thinking', armF: t > 5 && i % 2 ? -2.4 : .1, elbowF: .3 })} /></>,
  fg: (T) => crowdFg(T, 3, 44), wide: { x: 960, y: 560, z: 1.0 },
  cams: { l4: (T, t) => ({ x: lerp(400, 900, easeInOut(t / 5.6)), y: 600, z: lerp(1.5, 1.05, easeInOut(t / 5.6)) }) },
  actors: [{ k: 'archYoung', x: 260, y: Y, s: 1.2, p: (T, t) => ({ sit: 1, armF: -1.3 + Math.sin(t * 2) * .2, elbowF: .9 + Math.sin(t * 2) * .2 }), e: 'happy' },
    { k: 'kleo', x: 720, y: Y, s: 1.15, flip: true, e: 'excited' }, { k: 'you', x: 960, y: Y, s: 1.15, flip: true, e: 'surprised' }, { k: 'hiero', x: 1240, y: Y, s: 1.2, flip: true, e: 'surprised' }],
  ex: { l7b: { archYoung: 'laugh', you: 'laugh', kleo: 'laugh' } } });
gfx(Pulleys, S('l7'));
sc({ a: S('l7b'), bg: (T, t) => <>{yard(T, 260)}</>, fg: (T) => crowdFg(T, 4, 47), wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'hiero', x: 760, y: Y, s: 1.25, p: { armF: -2.5, elbowF: .3, handF: 'fist' }, e: 'excited' }, { k: 'archYoung', x: 1100, y: Y, s: 1.25, flip: true, e: 'laugh' }],
  cams: { l7b: (T, t) => ({ x: 900, y: 560, z: 1.6 + t * .03 }) } });
gfx(Screw, S('l8'));

/* ====================== NUMBERS ====================== */
const nightWS = (T: number, poly = 0) => <><Workshop T={T} night /><SandTray x={960} y={950} w={460} draw={1} poly={poly} /><Torch x={300} y={900} T={T} s={.8} /></>;
sc({ a: S('p1'), bg: (T) => nightWS(T), wide: { x: 960, y: 560, z: 1.05 },
  actors: [{ k: 'archYoung', x: 760, y: Y, s: 1.25, p: (T) => ({ kneel: 1, holdF: 'stick', armF: -1.0 + Math.sin(T * 2) * .1, elbowF: .4, lookY: .7 }), e: 'thinking' }, { k: 'you', x: 1200, y: Y, s: 1.2, flip: true, e: 'thinking' }, { k: 'kleo', x: 1460, y: Y, s: 1.2, flip: true, e: 'laugh' }],
  ex: { p3: { you: 'thinking' } } });
gfx(SandReckoner, S('p4'));
sc({ a: S('p5'), bg: (T, t) => nightWS(T, [6, 12, 24][Math.min(2, Math.floor(t / 1.2))]), wide: { x: 960, y: 560, z: 1.05 },
  actors: [{ k: 'archYoung', x: 760, y: Y, s: 1.25, p: { kneel: 1, holdF: 'stick', armF: -1.0, elbowF: .4, lookY: .7 }, e: 'happy' }, { k: 'you', x: 1200, y: Y, s: 1.2, flip: true, e: 'surprised' }],
  cams: { p5: (T, t) => ({ x: 960, y: 760, z: 2.0 }) } });
gfx(PiPolys, S('p6'));
sc({ a: S('p7'), bg: (T) => <><Workshop T={T} /><SandTray x={1140} y={950} w={420} draw={1} poly={24} /></>, fg: (T) => <Blur r={10}><g transform="translate(1700 1180)"><circle r={140} fill={SY.woodD} /><rect x={-260} y={-40} width={300} height={60} fill={SY.wood} /></g></Blur>,
  cam: (T, t) => ({ x: lerp(600, 1250, easeInOut(t / 14)), y: 560, z: lerp(1.25, 1.1, t / 14) }),
  actors: [{ k: 'you', x: 600, y: Y, s: 1.2, p: { holdF: 'tablet', armF: -1.2, elbowF: 1.4, lookY: .6 }, e: 'thinking' }, { k: 'kleo', x: 860, y: Y, s: 1.2, p: { holdF: 'scroll', armF: -1.2, elbowF: 1.4 }, e: 'happy' }, { k: 'archYoung', x: 1360, y: Y, s: 1.25, flip: true, p: { holdF: 'compass', armF: -1.4, elbowF: 1.2 }, e: 'happy' }] });

/* ====================== THE SIEGE ====================== */
gfx(SiegePlan, S('s1'));
sc({ a: S('s2'), bg: (T) => <><Harbor T={T} /><Warship x={1500} y={640} s={.6} flip T={T} /><Warship x={600} y={600} s={.45} flip T={T} /><rect x={-240} y={760} width={2400} height={500} fill="#cdb48a" /></>,
  mid: (T) => <Army T={T} rows={2} per={8} x0={1100} y0={900} dx={150} s0={.6} greek seed={3} />, wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'marc', x: 760, y: Y, s: 1.3, p: { handF: 'point', armF: -1.5, elbowF: .1 }, e: 'happy' }], cams: { s2: (T, t) => ({ x: 860, y: lerp(620, 520, t / 7), z: lerp(1.2, 1.6, easeInOut(t / 7)) }) } });
const wallTop = (T: number, n = 10, tower = false) => <><Sky tone="day" T={T} /><SeaW y={480} T={T} />{Array.from({ length: n }).map((_, k) => <Warship key={k} x={(k * 337) % 2200 - 100} y={560 + (k % 3) * 40} s={.24 + (k % 3) * .04} flip T={T} tower={tower && k % 3 === 0} />)}
  <rect x={-240} y={860} width={2400} height={400} fill={SY.lime} stroke={P.ink} strokeWidth={7} />{Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-240 + i * 190} y={810} width={120} height={60} fill={SY.lime} stroke={P.ink} strokeWidth={6} />)}</>;
sc({ a: S('s3'), bg: (T) => wallTop(T, 12, true), wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'kleo', x: 720, y: 880, s: 1.25, e: 'scared' }, { k: 'you', x: 1000, y: 880, s: 1.25, e: 'worried' }, { k: 'arch', x: 1320, y: 880, s: 1.25, flip: true, e: 'thinking' }],
  ex: { s3c: { you: 'laugh' }, s4: { kleo: 'excited', you: 'excited' } } });

/* ====================== THE CLAW ====================== */
const fromSea = (T: number, t: number, opt: { claw?: number; lift?: number; drop?: number; cata?: boolean } = {}) => {
  const lift = opt.lift ?? 0;
  return <><Sky tone="day" T={T} /><SeaWalls T={T} x={560} y={700} s={.9} /><SeaW y={700} T={T} />
    <Claw x={760} y={330} s={.9} ang={opt.claw ?? 10} drop={opt.drop ?? 200} flip={false} />
    <Warship x={1180} y={830 - lift * 220} s={.8} flip T={T} tilt={-lift * 28} sail={false} />
    <Warship x={1780} y={800} s={.55} flip T={T} tower />
    {opt.cata && <><Stone t={t} from={[500, 300]} to={[1500, 780]} period={2.4} /><Stone t={t + 1.2} from={[700, 300]} to={[1800, 760]} period={2.4} h={420} /><Splash x={1500} y={790} p={((t % 2.4) - 1.6) / .7} /><Splash x={1800} y={770} p={(((t + 1.2) % 2.4) - 1.6) / .7} s={.8} /></>}
  </>;
};
sc({ a: S('k1'), bg: (T, t) => fromSea(T, t, { claw: lerp(60, 8, easeInOut(prog(t, .5, 4))), drop: 120 }), wide: { x: 1000, y: 540, z: 1.0 },
  cam: (T, t) => ({ x: lerp(1400, 1000, easeInOut(t / 5)), y: lerp(600, 520, t / 5), z: lerp(1.3, 1.0, easeInOut(t / 5)) }), actors: [] });
sc({ a: S('k2'), bg: (T) => wallTop(T, 8), shake: () => .5,
  actors: [{ k: 'you', x: 800, y: 880, s: 1.3, e: 'fierce' }, { k: 'kleo', x: 1150, y: 880, s: 1.25, flip: true, p: (T, t) => ({ armF: -2.2 + Math.sin(t * 6) * .3, elbowF: .3, lean: 12 }), e: 'fierce' }],
  cams: { k2: { x: 900, y: 600, z: 1.8 } } });
sc({ a: S('k3'), bg: (T, t) => { const lift = easeInOut(prog(t, .9, 3)) * (t < 3.8 ? 1 : Math.max(0, 1 - (t - 3.8) * 3)); return fromSea(T, t, { claw: 30, drop: lerp(300, 850, easeOut(prog(t, 0, .8))) - lift * 245, lift }); },
  mid: (T, t) => <Splash x={1180} y={830} p={(t - 4) / .9} s={1.4} />, shake: (T, t) => t > 4 ? Math.exp(-(t - 4) * 4) * 1.4 : 0,
  cam: (T, t) => ({ x: 1050, y: lerp(560, 480, t / 5), z: 1.15 }), actors: [] });
sc({ a: S('k4'), bg: (T) => wallTop(T, 8), actors: [{ k: 'kleo', x: 960, y: 880, s: 1.35, p: { handF: 'point', armF: -1.6, elbowF: .1 }, e: 'laugh' }], cams: { k4: { x: 980, y: 620, z: 2.0 } } });
sc({ a: S('k5'), bg: (T, t) => fromSea(T, t, { cata: true }), mid: (T, t) => <><Catapult x={420} y={310} s={.55} t={t} period={2.4} /><Catapult x={640} y={300} s={.5} t={t + 1.2} period={2.4} /></>,
  shake: (T, t) => .2, cam: (T, t) => ({ x: lerp(800, 1300, easeInOut(t / 7)), y: 520, z: 1.15 }), actors: [] });
sc({ a: S('k5b'), bg: (T, t) => <><Sky tone="day" T={T} /><SeaW y={480} T={T} /><Warship x={lerp(1900, 1550, t / 5)} y={640} s={.55} flip T={T} tower /><Warship x={lerp(1960, 1610, t / 5)} y={680} s={.55} flip T={T} />
    {t > 3.2 && [0, 1, 2].map((k) => { const p = prog(t, 3.2 + k * .2, 3.9 + k * .2); return <circle key={k} cx={1520 + k * 30} cy={lerp(820, 470, 1 - p) } r={30} fill="#8a8a7a" stroke={P.ink} strokeWidth={5} opacity={p > 0 && p < 1 ? 1 : 0} />; })}
    <rect x={-240} y={860} width={2400} height={400} fill={SY.lime} stroke={P.ink} strokeWidth={7} />{Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-240 + i * 190} y={810} width={120} height={60} fill={SY.lime} stroke={P.ink} strokeWidth={6} />)}</>,
  shake: hitShake([S('k5c') + 1.2], 1.0),
  actors: [{ k: 'kleo', x: 600, y: 880, s: 1.25, p: { handF: 'point', armF: -1.6, elbowF: .1 }, e: 'scared' }, { k: 'you', x: 960, y: 880, s: 1.3, e: 'fierce' }],
  cams: { k5b: (T, t) => ({ x: lerp(800, 1300, t / 2.8), y: 560, z: 1.25 }), k5c: { x: 1000, y: 600, z: 1.7 } } });
sc({ a: S('k6'), bg: (T) => <><Sky tone="day" T={T} /><SeaW y={600} T={T} />{[0, 1, 2].map((k) => <Warship key={k} x={300 + k * 600} y={720} s={.35} T={T} sail={false} />)}
    <path d="M -240 820 L 2160 820 L 2160 1300 L -240 1300 Z" fill="#5a3a22" /><path d="M -240 820 L 2160 820" stroke="#a82a22" strokeWidth={16} /></>,
  actors: [{ k: 'marc', x: 900, y: 950, s: 1.35, p: { armF: -2.2, elbowF: .5, handF: 'fist' }, e: 'angry' }, { k: legionary(2), x: 1300, y: 950, s: 1.25, flip: true, spk: '-', e: 'scared' }],
  cams: { k6: (T, t) => ({ x: 980, y: 600, z: 1.7 + t * .03 }) } });
sc({ a: S('k7'), bg: (T, t) => <><Sky tone="day" T={T} /><SeaWalls T={T} x={300} y={700} s={.8} /><SeaW y={700} T={T} />
    <line x1={360} y1={170} x2={360 + 120 * Math.sin(t * 2)} y2={260} stroke={SY.rope} strokeWidth={10} />
    {[0, 1, 2].map((k) => <Warship key={k} x={1100 + k * 300 + prog(t, 1.5, 8) * 900} y={800 + k * 30} s={.5} T={T} sail={false} />)}</>,
  mid: (T, t) => <Crowd T={T} n={6} y={760} s={.4} x0={1000 + prog(t, 1.5, 8) * 900} x1={1800 + prog(t, 1.5, 8) * 900} seed={60} roman pose={(i) => ({ expr: 'scared', armF: -2.5, elbowF: .2 })} />,
  cam: (T, t) => ({ x: lerp(900, 1300, easeInOut(t / 8.6)), y: 540, z: 1.1 }), actors: [] });

/* ====================== MIRRORS ====================== */
sc({ a: S('m1'), bg: (T) => wallTop(T, 6), wide: { x: 960, y: 560, z: 1.0 },
  mid: (T, t) => T > S('m3') ? <g opacity={.6 + Math.sin(T * 9) * .3}><path d={`M 1180 640 L 1700 520 L 1720 560 Z`} fill="#fff6c0" opacity={.6} /></g> : null,
  actors: [{ k: 'kleo', x: 700, y: 880, s: 1.25, e: 'excited' }, { k: 'arch', x: 960, y: 880, s: 1.25, flip: true, e: 'thinking' }, { k: 'you', x: 1240, y: 880, s: 1.25, p: (T) => T > S('m3') ? { holdF: 'none', armF: -1.8, elbowF: .6 } : {}, e: 'thinking' }],
  ex: { m2: { kleo: 'laugh', you: 'laugh' }, m4: { you: 'thinking' } } });
gfx(MirrorTest, S('m5'));

/* ====================== THE FALL ====================== */
sc({ a: S('f1'), bg: (T) => <Festival T={T} />, mid: (T) => <><Crowd T={T} n={11} y={900} s={.62} seed={70} dance={1} /><Torch x={200} y={900} T={T} /><Torch x={1720} y={900} T={T} /></>, fg: (T) => <Blur r={8}><Crowd T={T} n={4} y={1220} s={1.15} x0={-300} x1={2200} seed={77} dance={.8} /></Blur>,
  cam: (T, t) => ({ x: lerp(700, 1200, easeInOut(t / 7)), y: 560, z: 1.15 }), actors: [] });
sc({ a: S('f2'), bg: (T, t) => <><Sky tone="night" T={T} /><rect x={-240} y={860} width={2400} height={400} fill="#6a604e" stroke={P.ink} strokeWidth={7} />{Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-240 + i * 190} y={810} width={120} height={60} fill="#6a604e" stroke={P.ink} strokeWidth={6} />)}
    {[1400, 1700].map((lx, k) => <g key={k}><line x1={lx} y1={1100} x2={lx + 40} y2={790 - prog(t, .5 + k, 2 + k) * 0} stroke={SY.woodD} strokeWidth={12} opacity={t > .5 + k ? 1 : 0} /><line x1={lx + 50} y1={1100} x2={lx + 90} y2={790} stroke={SY.woodD} strokeWidth={12} opacity={t > .5 + k ? 1 : 0} /></g>)}
    {t > 2.5 && [0, 1, 2].map((k) => <MChar key={k} look={legionary(k)} x={1440 + k * 150} y={lerp(1200, 880, prog(t, 2.5 + k * .5, 4 + k * .5))} s={.9} pose={{ holdF: 'gladius', armF: -1.4, elbowF: .6 }} />)}</>,
  shake: hitShake([S('f3') + .1], .7),
  actors: [{ k: 'kleo', x: 640, y: 880, s: 1.25, e: 'worried' }, { k: 'you', x: 940, y: 880, s: 1.3, e: 'scared' }],
  ex: { f3: { kleo: 'scared' } } });
sc({ a: S('f4'), bg: (T) => <><Sky tone="dawn" T={T} /><SeaW y={600} T={T} /><SeaWalls T={T} x={760} y={740} s={.55} tone="fire" fire={1} /><g opacity={.7}>{[0, 1, 2].map((k) => { const p = ((T * .12 + k / 3) % 1); return <circle key={k} cx={900 + k * 200 + p * 80} cy={400 - p * 400} r={80 + p * 140} fill="#3a2a2a" opacity={(1 - p) * .6} />; })}</g>
    <path d="M -240 760 Q 500 700 900 820 L 900 1300 L -240 1300 Z" fill="#8a8a4a" /></>,
  actors: [{ k: 'marc', x: 460, y: 900, s: 1.3, p: { lookX: 1 }, e: 'sad' }, { k: legionary(5), x: 200, y: 900, s: 1.2, spk: '-', e: 'neutral' }],
  cams: { f4: (T, t) => ({ x: lerp(1100, 600, easeInOut(t / 6.9)), y: lerp(420, 580, t / 6.9), z: lerp(1.0, 1.5, easeInOut(t / 6.9)) }), f5: { x: 500, y: 600, z: 1.8 } } });

/* ====================== THE CIRCLES ====================== */
const lastCourt = (T: number, t: number, wipe = 0) => <><Courtyard T={T} tone="fire" smoke={1} />{sandCircles(T, 20, wipe)}</>;
sc({ a: S('d1'), bg: (T, t) => lastCourt(T, t), fg: (T) => <Embers T={T} n={30} />,
  actors: [{ k: 'arch', x: 800, y: 990, s: 1.2, p: (T) => ({ kneel: 1, holdF: 'stick', armF: -1.0 + Math.sin(T * 2) * .15, elbowF: .4, lookY: .9 }), e: 'thinking' },
    { k: 'you', x: walkTo(1900, 1240, 0, 1.2), y: Y + 40, s: 1.25, flip: true, p: (T, t) => ({ walk: t < 1.2 ? 1 : 0, run: 1, phase: t * 13 }), e: 'scared' }],
  ex: { d2: { you: 'scared' } } });
sc({ a: S('d3'), bg: (T, t) => lastCourt(T, t), fg: (T) => <Embers T={T} n={30} />, shake: hitShake([S('d3') + .1], .7),
  actors: [{ k: 'arch', x: 800, y: 990, s: 1.2, p: { kneel: 1, holdF: 'stick', armF: -1.0, elbowF: .4, lookY: .9 }, e: 'angry' }, { k: 'sold', x: 1500, y: Y + 40, s: 1.3, flip: true, p: { holdF: 'gladius', armF: -1.4, elbowF: .6 }, e: 'angry' }, { k: 'you', x: 1150, y: Y + 40, s: 1.2, flip: true, e: 'scared' }],
  cams: { d3: { x: 1450, y: 560, z: 1.8 }, d4: (T, t) => ({ x: 820, y: 640, z: 1.9 + t * .25 }) } });
sc({ a: S('d5'), bg: (T, t) => lastCourt(T, t, easeOut(prog(t, .5, 2.5))), fg: (T) => <Embers T={T} n={30} />,
  mid: (T, t) => <path d={`M 1700 1000 L ${1100 - t * 20} 1000 L ${900 - t * 20} 640 Z`} fill="#000" opacity={.3} />,
  ui: (T) => stamp('MAYBE', S('d5') + 8.5, 3.8, 'Plutarch: three versions')(T),
  cam: (T, t) => ({ x: 960, y: lerp(980, 700, easeInOut(t / 12)), z: lerp(2.4, 1.3, easeInOut(t / 12)) }), actors: [] });
sc({ a: S('d6'), bg: (T, t) => lastCourt(T, t, 1), fg: (T) => <Embers T={T} n={20} />,
  actors: [{ k: 'marc', x: 900, y: Y + 40, s: 1.35, p: { armF: -2.2, elbowF: .5, handF: 'fist' }, e: 'angry' }, { k: 'sold', x: 1400, y: Y + 40, s: 1.25, flip: true, p: { crouch: 1 }, e: 'scared' }, { k: 'you', x: 520, y: Y + 40, s: 1.2, e: 'sad' }],
  cams: { d6: { x: 950, y: 600, z: 1.7 } } });
sc({ a: S('d7'), bg: (T) => <TombSite T={T} cut={1} />, mid: (T) => <Crowd T={T} n={6} y={940} s={.7} x0={200} x1={700} seed={88} pose={() => ({ expr: 'sad', lookX: 1 })} />,
  cam: (T, t) => ({ x: lerp(600, 1000, easeInOut(t / 9)), y: lerp(600, 480, t / 9), z: lerp(1.1, 1.4, t / 9) }),
  actors: [{ k: 'you', x: 820, y: Y, s: 1.2, e: 'sad' }, { k: 'kleo', x: 600, y: Y, s: 1.2, e: 'sad' }] });

/* ====================== THE LOST BOOK ====================== */
sc({ a: S('b1'), bg: (T, t) => <TombSite T={T} cut={easeInOut(prog(t, 8, 13))} />,
  ui: (T) => stamp('EVIDENCE', S('b2') + 4.5, 3.5, 'Cicero wrote it himself', 520, 200)(T),
  actors: [{ k: 'cic', x: walkTo(-100, 520, 0, 4), y: Y, s: 1.25, p: (T, t) => ({ walk: t < 4 ? 1 : 0, phase: t * 7, holdF: 'scroll', armF: -1.2, elbowF: 1.4 }), e: 'thinking' },
    { k: citizen(5).look, x: walkTo(-300, 300, .5, 4), y: Y, s: 1.15, spk: '-', p: (T, t) => ({ walk: t > .5 && t < 4.5 ? 1 : 0, phase: t * 7, armF: t > 7 ? -2 + Math.sin(t * 8) * .4 : .1, elbowF: .4 }), e: 'neutral' }],
  ex: { b2: { cic: 'excited' } }, cams: { b1: (T, t) => ({ x: lerp(500, 900, easeInOut(t / 6.8)), y: 560, z: 1.15 }), b2: (T, t) => ({ x: lerp(800, 1000, t / 7.6), y: lerp(560, 460, t / 7.6), z: 1.25 }) } });
gfx(PalimpsestG, S('b3'));
sc({ a: S('b6'), bg: (T, t) => <Lab T={T} scan={easeInOut(prog(t, .5, 8))} />, cam: (T, t) => ({ x: 960, y: 540, z: lerp(1.0, 1.35, easeInOut(t / 12)) }), actors: [] });
sc({ a: S('b7'), bg: (T) => <><Workshop T={T} /><SandTray x={960} y={950} w={420} draw={1} poly={96} /></>, fg: (T) => <Blur r={10}><g transform="translate(1750 1150)"><circle r={160} fill={SY.woodD} /></g></Blur>,
  ui: () => <rect x={0} y={0} width={1920} height={1080} fill="#e8c890" opacity={.14} />,
  actors: [{ k: 'archYoung', x: 760, y: Y, s: 1.25, p: { kneel: 1, holdF: 'stick', armF: -1.0, elbowF: .4, lookY: .5 }, e: 'happy' }, { k: 'youKid', age: kidAge, x: 1160, y: Y, s: 1.25, flip: true, e: 'happy' }],
  cams: { b7: (T, t) => ({ x: 900, y: 660, z: 1.7 + t * .05 }) } });
sc({ a: S('b8'), bg: (T) => <><Sky tone="dusk" T={T} /><SeaW y={600} T={T} /><rect x={-240} y={860} width={2400} height={400} fill="#d8c49a" stroke={P.ink} strokeWidth={7} />{Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-240 + i * 190} y={810} width={120} height={60} fill="#d8c49a" stroke={P.ink} strokeWidth={6} />)}
    <g opacity={.35}><circle cx={1300} cy={420} r={220} fill="none" stroke="#fff" strokeWidth={4} /><polygon points={Array.from({ length: 12 }).map((_, k) => `${1300 + Math.cos(k / 12 * Math.PI * 2) * 220},${420 + Math.sin(k / 12 * Math.PI * 2) * 220}`).join(' ')} fill="none" stroke="#fff" strokeWidth={3} /></g></>,
  cam: (T, t) => ({ x: lerp(900, 1200, easeInOut(t / 10)), y: lerp(640, 460, easeInOut(t / 10)), z: lerp(1.5, 1.1, easeInOut(t / 10)) }),
  actors: [{ k: 'you', x: 960, y: 880, s: 1.3, p: { lookY: -.6, lookX: 1 }, e: 'thinking' }] });

// close the list
scenes.sort((p, q) => p.a - q.a);
scenes.forEach((s, i) => { s.b = i < scenes.length - 1 ? scenes[i + 1].a : 9999; });
export const SHOTS = scenes;
