import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, spring, lerp, clamp, rng, LINES, FPS } from './lib';
import { Boil, P } from './art';
import { MChar, CAST, MLook, MPose, citizen } from './chars';
import { GR, AthensBG, Courtyard, Workshop, Wheel, Agora, Stoa, Palaestra, Theater, Symposium, Kline, Krater, Delphi, Court, Prison, Phalanx, Classroom, Academy, VaseFrame, GreeceMap, Amphora, Lamp, Rooster, Olive, Ground, Fire } from './greek';
import { DemocracyDots, Plague, SocraticLoop, Rewind, Kleroterion, JuryVote, Sophists, LegacyChain } from './ggraphics';
import { Txt } from './graphics';
import MOUTH from './mouth.json';

/* ---------- frame ---------- */
export type Cam = { x?: number; y?: number; z?: number; r?: number };
export const Frame: React.FC<{ children: React.ReactNode; cam?: Cam; boil?: number; ui?: React.ReactNode }> = ({ children, cam = {}, boil = 2.6, ui }) => {
  const f = useCurrentFrame();
  const { x = 960, y = 540, z = 1, r = 0 } = cam;
  return <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <Boil id="boil" frame={f} scale={boil} />
      <radialGradient id="fireGlow"><stop offset="0" stopColor="#ffb05a" stopOpacity=".75" /><stop offset="1" stopColor="#ff8a2b" stopOpacity="0" /></radialGradient>
      <radialGradient id="sunGlow"><stop offset="0" stopColor="#fff2c0" stopOpacity="1" /><stop offset="1" stopColor="#ffd070" stopOpacity="0" /></radialGradient>
      <radialGradient id="lampWash" gradientUnits="userSpaceOnUse" cx={420} cy={700} r={1100}><stop offset="0" stopColor="#ffb060" stopOpacity=".28" /><stop offset=".6" stopColor="#ff8030" stopOpacity=".06" /><stop offset="1" stopColor="#000" stopOpacity=".25" /></radialGradient>
    </defs>
    <g transform={`translate(960 540) rotate(${r}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
    {ui}
  </svg>;
};
export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <g filter="url(#boil)">{children}</g>;
export const Tag: React.FC<{ x: number; y: number; text: string; o?: number; c?: string; tc?: string; s?: number }> = ({ x, y, text, o = 1, c = '#1d1612', tc = '#ffb347', s = 40 }) => (
  <g opacity={o}><rect x={x - text.length * s * .32 - 26} y={y - s * 1.15} width={text.length * s * .64 + 52} height={s * 1.7} rx={14} fill={c} /><Txt x={x} y={y} s={s} c={tc}>{text}</Txt></g>
);

/* ---------- speech helpers: who is talking, mouth from real audio ---------- */
const M: Record<string, number[]> = MOUTH as any;
const lineAt = (T: number) => (LINES as any[]).find((l) => T >= l.start - .05 && T < l.end + .05);
export const mouthOf = (spk: string, T: number) => { const a = M[spk]; if (!a) return 0; const i = Math.round(T * FPS); return a[i] || 0; };
const SPK: Record<string, string> = { you: 'YOU', youKid: 'YOU', youOld: 'YOU', soc: 'SOC', dad: 'DAD', mom: 'MOM', chaer: 'CHAER', laches: 'LACH', alc: 'ALC', xan: 'XAN', plato: 'PLATO', platoOld: 'PLATO', mel: 'MEL', crito: 'CRITO', jailer: 'JAIL', herald: 'HER' };
const blinkAt = (T: number, s: number) => ((T + s * 1.7) % 3.9) < .12 ? 1 : 0;

export type Actor = { k: string | MLook; id?: string; x: number | ((T: number, t: number) => number); y: number | ((T: number, t: number) => number); s?: number; flip?: boolean | ((T: number) => boolean); age?: number; p?: MPose | ((T: number, t: number) => MPose); still?: boolean; o?: number | ((T: number, t: number) => number); spk?: string; sleep?: boolean };
const val = <V,>(v: V | ((T: number, t: number) => V), T: number, t: number): V => typeof v === 'function' ? (v as any)(T, t) : v;
const ActorEl: React.FC<{ a: Actor; T: number; t: number; i: number; all: Actor[] }> = ({ a, T, t, i, all }) => {
  const key = typeof a.k === 'string' ? a.k : ''; const spk = a.spk ?? SPK[key];
  const look = typeof a.k === 'string' ? CAST[a.k] : a.k;
  const x = val(a.x, T, t), s = a.s ?? 1.2, flip = val(a.flip ?? false, T, t), base: MPose = val(a.p ?? {}, T, t);
  const ln = lineAt(T); const speaking = !!(spk && ln && ln.speaker === spk);
  const m = spk ? mouthOf(spk, T) : 0;
  const pose: MPose = { blink: a.sleep ? 1 : blinkAt(T, i), bob: Math.sin(T * 1.6 + i) * 2, ...base };
  if (speaking) {
    pose.mouth = m > .08 ? 'talk' : (base.mouth === 'talk' ? 'flat' : (base.mouth ?? 'flat')); pose.open = m;
    if (!a.still) { pose.armF = (base.armF ?? -.7) + Math.sin(T * 2.3 + i) * .28; pose.elbowF = (base.elbowF ?? 1.1) + Math.sin(T * 3.1 + i) * .25; pose.tilt = (base.tilt ?? 0) + Math.sin(T * 1.7) * 2; }
  } else if (ln && ln.speaker !== 'NARR' && !a.sleep) {
    const sp = all.find((o) => (o.spk ?? SPK[typeof o.k === 'string' ? o.k : '']) === ln.speaker);
    if (sp && sp !== a) { const dx = val(sp.x, T, t) - x; pose.lookX = base.lookX ?? (dx > 0 ? 1 : -1) * (flip ? -1 : 1) * .9; }
  }
  return <MChar look={look} x={x} y={val(a.y, T, t)} s={s} flip={flip} age={a.age ?? 1} opacity={val(a.o ?? 1, T, t)} pose={pose} />;
};

/* ---------- dialogue scene with automatic coverage (wide / close-up / two-shot cut on each line) ---------- */
export type Scene = { a: number; b: number; bg: (T: number, t: number) => React.ReactNode; actors: Actor[]; fg?: (T: number, t: number) => React.ReactNode; ui?: (T: number, t: number) => React.ReactNode; wide?: Cam; cams?: Record<string, Cam | 'wide' | 'two'>; zcu?: number; boil?: number; cam?: (T: number, t: number) => Cam };
const fit = (c: Required<Cam>): Cam => { const hw = 960 / c.z, hh = 540 / c.z; return { ...c, x: clamp(c.x, hw, 1920 - hw), y: clamp(c.y, hh, 1080 - hh) }; };
const camFor = (sc: Scene, T: number): Cam => {
  if (sc.cam) return sc.cam(T, T - sc.a);
  const W: Required<Cam> = { x: 960, y: 540, z: 1, r: 0, ...(sc.wide as any) };
  const ls = (LINES as any[]).filter((l) => l.start >= sc.a - .01 && l.start < sc.b);
  let li = -1; ls.forEach((l, k) => { if (T >= l.start - .02) li = k; });
  const cur = li >= 0 ? ls[li] : ls[0];
  const since = li >= 0 ? T - cur.start : T - sc.a, push = 1 + clamp(since / 7) * .045;
  if (!cur) return fit({ ...W, z: W.z * push });
  const ov = sc.cams?.[cur.key];
  if (ov && typeof ov === 'object') return fit({ ...W, ...ov, z: (ov.z ?? 1) * push } as any);
  const findA = (spk: string) => sc.actors.find((a) => (a.spk ?? SPK[typeof a.k === 'string' ? a.k : '']) === spk);
  const A = findA(cur.speaker);
  if (!A || ov === 'wide' || li === 0 && !ov) return fit({ ...W, z: W.z * push });
  const ax = val(A.x, T, T - sc.a), as = A.s ?? 1.2;
  const dl = ls.slice(0, li + 1).filter((l) => l.speaker !== 'NARR').length;
  const others = sc.actors.filter((o) => o !== A && !(o.o === 0));
  const near = others.sort((p, q) => Math.abs(val(p.x, T, 0) - ax) - Math.abs(val(q.x, T, 0) - ax))[0];
  if (ov === 'two' || (dl % 3 === 0 && near)) {
    const nx = near ? val(near.x, T, 0) : ax; const cx = (ax + nx) / 2, span = Math.abs(ax - nx) + 520 * as;
    const z = clamp(1920 / span, 1, 1.7);
    return fit({ x: cx, y: val(A.y, T, 0) - 200 * as, z: z * push, r: 0 });
  }
  const z = clamp((sc.zcu ?? 2.05) / as * 1.2, 1.25, 2.7);
  const dir = near ? Math.sign(val(near.x, T, 0) - ax) : 0;
  return fit({ x: ax + dir * 230 / z, y: val(A.y, T, 0) - 250 * as + 120 / z, z: z * push, r: 0 });
};
export const SceneShot: React.FC<{ sc: Scene; T: number }> = ({ sc, T }) => {
  const t = T - sc.a;
  return <Frame cam={camFor(sc, T)} boil={sc.boil} ui={sc.ui?.(T, t)}>
    {sc.bg(T, t)}
    <B>{sc.actors.map((a, i) => <ActorEl key={i} a={a} T={T} t={t} i={i} all={sc.actors} />)}</B>
    {sc.fg?.(T, t)}
  </Frame>;
};
export const Gfx: React.FC<{ C: React.FC<any>; T: number; a: number; b: number }> = ({ C, T, a, b }) => {
  const t = T - a, d = b - a;
  return <Frame cam={{ x: 960, y: 540, z: 1.0 + .04 * (t / d) }} boil={1.4}><B><C t={t} T={T} d={d} /></B></Frame>;
};

/* ---------- timeline helpers ---------- */
const S = (k: string) => (LINES as any[]).find((l) => l.key === k)!.start;
const E = (k: string) => (LINES as any[]).find((l) => l.key === k)!.end;
const pan = (t: number, d: number, a: number, b: number) => lerp(a, b, easeInOut(t / d));
const benchFront = <g><rect x={500} y={792} width={640} height={130} fill="#6a6470" stroke={P.ink} strokeWidth={7} /><rect x={500} y={792} width={640} height={16} fill="#7a7480" /></g>;
const Baby: React.FC<{ x: number; y: number; T: number; s?: number }> = ({ x, y, T, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-12)`}><ellipse cx={0} cy={0} rx={70} ry={34} fill="#efe4cc" stroke={P.ink} strokeWidth={6} /><circle cx={-52} cy={-6} r={30} fill={CAST.baby.skin} stroke={P.ink} strokeWidth={6} /><path d="M -64 -8 q 6 5 12 0 M -46 -8 q 6 5 12 0" stroke={P.ink} strokeWidth={3.5} fill="none" /><path d={`M -60 8 q 8 ${4 + Math.sin(T * 3) * 2} 16 0`} stroke={P.ink} strokeWidth={3} fill="none" /><path d="M -20 -20 L 50 20" stroke={GR.terra} strokeWidth={6} /></g>
);
const amber = '#ffb347';

/* ---------- the edit ---------- */
type Item = { a: number; b: number; g?: boolean; render: (T: number) => React.ReactNode };
const scenes: Item[] = [];
const sc = (s: Omit<Scene, 'b'> & { b?: number }) => scenes.push({ a: s.a, b: s.b ?? -1, render: (T) => <SceneShot sc={{ ...s, b: s.b ?? (scenes.find((x) => x.a === s.a)!.b) } as Scene} T={T} /> });
const gfx = (C: React.FC<any>, a: number) => scenes.push({ a, b: -1, g: true, render: (T) => <Gfx C={C} T={T} a={a} b={scenes.find((x) => x.a === a)!.b} /> });

// COLD OPEN — prison exterior, then the cell
sc({ a: 0, bg: (T, t) => <AthensBG T={T} tone="night" px={-t * 12} smoke={false} />, actors: [], cam: (T, t) => ({ x: 960, y: 520, z: 1.04 + t * .02 }) });
sc({ a: S('o2'), bg: (T) => <Prison T={T} />, fg: () => benchFront, wide: { x: 960, y: 560, z: 1.05 },
  actors: [{ k: 'you', x: 420, y: 960, s: 1.15, p: { mouth: 'sad', brow: 1 } }, { k: 'soc', x: 820, y: 900, s: 1.2, p: { mouth: 'smile', armB: -.1 } }, { k: 'jailer', x: 1420, y: 960, s: 1.2, flip: true, p: { holdF: 'hemlock', armF: -.9, elbowF: 1.3, mouth: 'flat' }, still: true }] });
gfx(Rewind, S('o5'));
// 1 BORN IN ATHENS
sc({ a: S('b1'), bg: (T, t) => <AthensBG T={T} tone="dawn" px={-t * 25} />, actors: [], cam: (T, t) => ({ x: 980, y: 560, z: 1.02 + t * .025 }), ui: (T, t) => <Tag x={960} y={110} text="THE POTTERS' QUARTER · KERAMEIKOS" o={clamp((t - 1.5) * 2)} s={34} /> });
sc({ a: S('b2'), bg: (T) => <Courtyard T={T} />, wide: { x: 960, y: 600, z: 1.1 },
  actors: [{ k: 'dad', x: 760, y: 990, s: 1.3, p: { armF: -1.0, elbowF: 1.7, armB: .5, elbowB: 1.6, mouth: 'grin' }, still: true }, { k: 'mom', x: 1240, y: 990, s: 1.3, flip: true, p: { mouth: 'smile', armF: -.5, elbowF: 1.2 } }],
  fg: (T) => <Baby x={840} y={770} T={T} s={1.1} /> });
gfx(DemocracyDots, S('b4'));
sc({ a: S('b6'), bg: (T) => <Courtyard T={T} />, wide: { x: 960, y: 600, z: 1.08 },
  actors: [{ k: 'youKid', age: .55, x: 620, y: 1000, s: 1.25, p: { mouth: 'smile' } }, { k: 'sister', age: .5, x: 430, y: 1000, s: 1.15, p: { mouth: 'flat' } }, { k: 'mom', x: 1050, y: 990, s: 1.28, flip: true, p: { mouth: 'smile' } }, { k: 'dad', x: 1450, y: 990, s: 1.3, flip: true, p: { mouth: 'flat', holdF: 'kylix', armF: -.6, elbowF: 1.1 } }],
  ui: (T, t) => <Tag x={300} y={110} text="7 YEARS LATER" o={clamp(t * 2) * (1 - prog(t, 4, 4.6))} s={34} /> });
gfx(Plague, S('a1'));
// 2 THE AGORA
sc({ a: S('a2'), bg: (T) => <Courtyard T={T} tone="night" loom={false} />, wide: { x: 900, y: 640, z: 1.35 },
  actors: [{ k: 'mom', x: 860, y: 990, s: 1.35, flip: true, p: { mouth: 'sad', brow: 1.5, armF: -1.2, elbowF: 1.4 } }, { k: 'youKid', age: .3, x: 690, y: 1000, s: 1.1, p: { mouth: 'O', lookX: 1 } }],
  fg: (T) => <Lamp x={1180} y={930} T={T} s={1.3} />, cams: { a2: { x: 860, y: 640, z: 1.45 } } });
sc({ a: S('a3'), bg: (T, t) => <Agora T={T} px={-t * 30} />, cam: (T, t) => ({ x: 960, y: 560, z: 1.06 }),
  actors: [{ k: 'you', x: (T, t) => 200 + t * 150, y: 1010, s: 1.25, p: (T) => ({ walk: 1, phase: T * 7, holdF: 'amphora', armF: .1, elbowF: .2, mouth: 'smile' }), still: true }],
  ui: (T, t) => <Tag x={240} y={110} text="AGE 17" o={clamp((t - .5) * 2)} s={36} /> });
sc({ a: S('a4'), bg: (T) => <Workshop T={T} />, wide: { x: 960, y: 600, z: 1.1 },
  fg: (T) => <Wheel x={1180} y={990} T={T} s={1.3} />,
  actors: [{ k: 'you', x: 560, y: 990, s: 1.3, p: { mouth: 'smile', holdF: 'amphora', armF: .1, elbowF: .2 } }, { k: 'dad', x: 1330, y: 990, s: 1.32, flip: true, p: { armF: -.9, elbowF: .9, mouth: 'flat' } }],
  cams: { a6: { x: 1250, y: 640, z: 1.9 } } });
// 3 THE BAREFOOT MAN
sc({ a: S('s1'), bg: (T) => <Agora T={T} crowd={0} />, wide: { x: 960, y: 600, z: 1.1 },
  fg: (T) => <g>{[0, 1, 2, 3].map((i) => <MChar key={i} look={citizen(i + 10)} x={[220, 1700, 1820, 120][i]} y={1080} s={.95} flip={i % 2 === 0 ? false : true} pose={{ blink: blinkAt(T, i + 9), mouth: 'smile', lookX: i % 2 ? -1 : 1 }} />)}</g>,
  actors: [{ k: 'you', x: 680, y: 1000, s: 1.3, p: { holdF: 'amphora', armF: .1, elbowF: .2, mouth: 'flat' } }, { k: 'soc', x: 1180, y: 1000, s: 1.3, flip: true, p: { mouth: 'smile' } }],
  ui: (T, t) => <Tag x={420} y={110} text="SOCRATES · AGE 52" o={clamp((t - .6) * 2) * (1 - prog(t, 5, 5.6))} s={34} />, cams: { s7: 'two' } });
sc({ a: S('s8'), bg: (T) => <Agora T={T} crowd={0} />, wide: { x: 960, y: 560, z: 1.0 }, cam: (T, t) => ({ x: 960, y: 560 - t * 2, z: 1.05 + t * .01 }),
  fg: () => <rect x={-200} y={-200} width={2400} height={1500} fill="#1d1612" opacity={.0} />,
  actors: [{ k: 'soc', x: 960, y: 1060, s: 2.0, p: { mouth: 'smile', armF: -.5, elbowF: 1.2 } }],
  ui: (T, t) => <g>{[['SNUB NOSE', 1450, 300, 1], ['SAME CLOAK ALL YEAR', 470, 640, 2.4], ['BAREFOOT', 1460, 900, 3.8], ['WROTE NOTHING', 470, 300, 5.4]].map(([s, x, y, d]: any) => <Tag key={s} x={x} y={y} text={s} o={clamp((t - d) * 3)} s={40} />)}</g> });
sc({ a: S('s9'), boil: 1.6, bg: (T, t) => <VaseFrame T={T} label="AS AN ATHENIAN VASE-PAINTER MIGHT HAVE SHOWN IT"><g transform="translate(0 200)"><Theater T={T} bare /></g><g transform={`translate(960 ${380 + Math.sin(T * 1.5) * 16}) scale(1.3)`}><line x1={0} y1={-400} x2={0} y2={-90} stroke={P.ink} strokeWidth={6} /><path d="M -90 -90 L 90 -90 L 70 40 L -70 40 Z" fill="#c8a060" stroke={P.ink} strokeWidth={6} /><MChar look={CAST.soc} x={0} y={60} s={.75} pose={{ mouth: 'O', lookY: -1, armF: -2.4, elbowF: .2 }} /></g>
    {t > S('s10') - S('s9') && <MChar look={CAST.soc} x={1320} y={980} s={1.05} flip pose={{ mouth: 'grin', armF: -2.2, elbowF: .4, blink: blinkAt(T, 3) }} />}</VaseFrame>, actors: [], cam: (T, t) => ({ x: 960, y: 540, z: 1.0 + t * .012 }),
  ui: (T, t) => <g>{t > S('s11') - S('s9') && <Tag x={1590} y={985} text="LEGEND · AELIAN, VARIA HISTORIA 2.13" s={22} o={clamp((t - (S('s11') - S('s9'))) * 3)} />}</g> });
// 4 QUESTIONS THAT HURT
sc({ a: S('q1'), bg: (T) => <Stoa T={T} />, wide: { x: 960, y: 600, z: 1.08 },
  actors: [{ k: 'you', x: 380, y: 1000, s: 1.25, p: { mouth: 'smile' } }, { k: 'soc', x: 760, y: 1000, s: 1.3, p: { mouth: 'smile' } }, { k: 'laches', x: 1380, y: 1000, s: 1.35, flip: true, p: { holdF: 'spear', armF: -.2, elbowF: .3, mouth: 'flat', brow: 1 } }],
  ui: (T, t) => <Tag x={520} y={110} text="LACHES · ATHENIAN GENERAL" o={clamp((t - 2) * 2) * (1 - prog(t, 6, 6.6))} s={32} />,
  cams: { q7: { x: 1380, y: 640, z: 1.9 } } });
gfx(SocraticLoop, S('q8'));
sc({ a: S('q9'), bg: (T) => <Palaestra T={T} />, wide: { x: 960, y: 600, z: 1.08 },
  actors: [{ k: 'you', x: 460, y: 1000, s: 1.25, p: { mouth: 'smile' } }, { k: 'soc', x: 820, y: 1000, s: 1.3, p: { mouth: 'smile' } }, { k: 'plato', x: 1350, y: 1000, s: 1.38, flip: true, p: { mouth: 'smile', armB: .3 } }],
  ui: (T, t) => <Tag x={420} y={110} text="PLATO · c. 427–347 BC" o={clamp((t - (S('q10') - S('q9'))) * 3)} s={34} />, cams: { q10: { x: 1250, y: 620, z: 1.6 } } });
sc({ a: S('q11'), bg: (T) => <Courtyard T={T} tone="night" />, wide: { x: 960, y: 620, z: 1.12 },
  fg: (T) => <Lamp x={960} y={960} T={T} s={1.2} />,
  actors: [{ k: 'you', x: (T, t) => t > S('q13') - S('q11') ? 640 - (t - (S('q13') - S('q11'))) * 120 : 640, y: 1000, s: 1.28, flip: (T) => T > S('q13'), p: (T) => T > S('q13') ? { walk: 1, phase: T * 6, mouth: 'sad' } : { mouth: 'smile', armF: -1, elbowF: 1.3 } },
    { k: 'dad', x: 1300, y: 1000, s: 1.32, flip: true, p: (T) => T > S('q12') - .1 ? { armF: -1.65, elbowF: .05, mouth: 'flat', brow: 2 } : { mouth: 'flat', brow: 1.2, holdF: 'kylix', armF: -.6, elbowF: 1.1 } }],
  cams: { q12: { x: 1300, y: 640, z: 2.0 }, q13: 'wide' } });
// 5 SYMPOSIUM
const guests = (T: number, dawn: number) => <g>
  <Kline x={560} y={1000} s={1.3} c="#e0a838" /><Kline x={1380} y={1000} s={1.3} c={GR.aegean} /><Krater x={960} y={1060} s={1.0} />
</g>;
sc({ a: S('y1'), bg: (T) => <Symposium T={T} />, wide: { x: 960, y: 600, z: 1.06 },
  fg: (T) => guests(T, 0),
  actors: [{ k: 'soc', x: 520, y: 1010, s: 1.3, p: { mouth: 'smile', holdF: 'kylix', armF: -.9, elbowF: 1.1 } }, { k: citizen(4), id: 'g1', x: 300, y: 1010, s: 1.2, p: { mouth: 'grin' } }, { k: 'you', x: 1260, y: 1010, s: 1.28, flip: true, p: { mouth: 'smile' } }, { k: citizen(6), id: 'g2', x: 1560, y: 1010, s: 1.2, flip: true, p: { mouth: 'smile', holdF: 'lyre', armF: -.6, elbowF: 1.0 } },
    { k: 'alc', x: (T) => T < S('y2') ? 2400 : Math.max(1780, 2300 - (T - S('y2')) * 500), y: 1000, s: 1.3, flip: true, p: (T) => ({ holdF: 'kylix', armF: -2.0, elbowF: .5, mouth: 'grin', walk: T > S('y2') && T < S('y2') + 1.2 ? 1 : 0, phase: T * 7, lean: -4 + Math.sin(T * 2) * 4 }) }],
  cams: { y2: { x: 1500, y: 620, z: 1.4 } } });
sc({ a: S('y5'), boil: 1.6, bg: (T, t) => <VaseFrame T={T} label="POTIDAEA, 432 BC"><Phalanx T={T} x={1500} y={700} n={5} s={.5} flip march={.3} c="#666" />
    <MChar look={CAST.alc} x={760} y={900} s={1.1} pose={{ lean: -84, mouth: 'O', blink: 0 }} /><MChar look={{ ...CAST.soc, head: 'helmet' }} x={980} y={960} s={1.2} pose={{ holdF: 'shield', armF: -1.2, elbowF: 1.2, holdB: 'spear', armB: -.4, mouth: 'flat', brow: 1.5 }} /></VaseFrame>, actors: [], cam: (T, t) => ({ x: 960, y: 540, z: 1.0 + t * .012 }) });
sc({ a: S('y6'), bg: (T, t) => <Symposium T={T} dawn={clamp(t / 4)} />, wide: { x: 960, y: 600, z: 1.06 },
  fg: (T) => guests(T, 1),
  actors: [{ k: citizen(4), x: 300, y: 1010, s: 1.2, sleep: true, p: { tilt: 18, mouth: 'O' } }, { k: 'you', x: 1260, y: 1010, s: 1.28, flip: true, sleep: true, p: { tilt: -16, mouth: 'flat' } }, { k: 'alc', x: 1560, y: 1010, s: 1.25, flip: true, sleep: true, p: { tilt: -22, mouth: 'O' } },
    { k: 'soc', x: (T, t) => t < 2.5 ? 560 : 560 - (t - 2.5) * 160, y: 1010, s: 1.3, flip: (T) => T - S('y6') > 2.5, p: (T) => T - S('y6') > 2.5 ? { walk: 1, phase: T * 6, mouth: 'smile' } : { mouth: 'smile', lookX: 1 } }] });
// 6 THE ORACLE
sc({ a: S('r1'), bg: (T) => <Agora T={T} crowd={.6} tone="dusk" />, wide: { x: 960, y: 600, z: 1.08 },
  actors: [{ k: 'you', x: 700, y: 1000, s: 1.3, p: { mouth: 'smile' } }, { k: 'chaer', x: 1200, y: 1000, s: 1.3, flip: true, p: { mouth: 'grin', brow: -1 } }], cams: { r1: { x: 1150, y: 640, z: 1.75 } } });
sc({ a: S('r2'), bg: (T) => <Delphi T={T} />, wide: { x: 960, y: 560, z: 1.0 }, cam: (T, t) => ({ x: 960, y: 600, z: 1.1 + t * .05 }),
  fg: (T) => <g />, actors: [{ k: 'pythia', x: 960, y: 760, s: 1.0, p: { mouth: 'O', armF: -2.4, elbowF: .2, armB: -2.4, elbowB: .2, blink: 1 }, still: true }, { k: 'chaer', x: 560, y: 1010, s: 1.2, p: { kneel: 1, lean: 12, mouth: 'O', lookY: -1 } }],
  ui: (T, t) => <Tag x={960} y={110} text="THE ORACLE OF APOLLO · DELPHI" o={clamp(t * 3)} s={32} /> });
sc({ a: S('r3'), bg: (T) => <Agora T={T} crowd={0} />, wide: { x: 960, y: 600, z: 1.05 },
  actors: [{ k: 'soc', x: 960, y: 1010, s: 1.3, p: { mouth: 'smile' } },
    { k: 'tyrant', x: 420, y: 1000, s: 1.2, o: (T) => clamp((T - S('r4')) * 3), p: { mouth: 'flat', brow: 2, armF: -1.2, elbowF: .4 } },
    { k: citizen(9), x: 1450, y: 1000, s: 1.2, flip: true, o: (T) => clamp((T - S('r4') - 1.2) * 3), p: { mouth: 'O', holdF: 'lyre', armF: -.6, elbowF: 1.0 } },
    { k: 'dad', x: 1760, y: 1000, s: 1.15, flip: true, o: (T) => clamp((T - S('r4') - 2.4) * 3), p: { mouth: 'flat', armF: -1.4, elbowF: .3 } }],
  cams: { r3: { x: 960, y: 640, z: 1.7 }, r4: 'wide', r5: { x: 960, y: 640, z: 1.8 } },
  ui: (T, t) => <g>{[['POLITICIANS', 420, 0], ['POETS', 1450, 1.2], ['CRAFTSMEN', 1760, 2.4]].map(([s, x, d]: any) => { const o = clamp((T - S('r4') - d) * 3) * (T < S('r5') ? 1 : 0); return <Tag key={s} x={x} y={300} text={s} o={o} s={36} />; })}</g> });
sc({ a: S('r6'), bg: (T) => <Agora T={T} crowd={0} tone="dusk" />, wide: { x: 960, y: 600, z: 1.05 }, cam: (T, t) => ({ x: 960, y: 600, z: 1.05 + t * .04 }),
  actors: [{ k: 'soc', x: 960, y: 1010, s: 1.25, p: { mouth: 'flat' } }, ...[0, 1, 2, 3, 4, 5].map((i) => ({ k: citizen(i + 20), x: [260, 520, 1400, 1660, 380, 1540][i], y: [1000, 1040, 1040, 1000, 1100, 1100][i], s: 1.1, flip: i % 2 === 0 ? false : true, p: (T: number) => ({ mouth: 'shout' as const, brow: 2, armF: -2.2 + Math.sin(T * 6 + i) * .3, elbowF: .3 }) }))] });
sc({ a: S('r7'), bg: (T) => <Courtyard T={T} />, wide: { x: 960, y: 600, z: 1.1 },
  actors: [{ k: 'soc', x: 760, y: 1000, s: 1.3, p: { mouth: 'smile', armF: -.6, elbowF: 1.4, armB: -.6, elbowB: 1.4 } }, { k: 'xan', x: 1250, y: 1000, s: 1.3, flip: true, p: { mouth: 'shout', brow: 2, armF: -2.1, elbowF: .6 } },
    ...[0, 1].map((i) => ({ k: 'youKid', x: 1500 + i * 150, y: 1000, s: 1.0, age: .45 + i * .1, flip: true, p: { mouth: 'O' as const } }))] });
gfx(Sophists, S('r9'));
// 7 WAR & TYRANTS
scenes.push({ a: S('w1'), b: -1, render: (T) => { const a = S('w1'), t = T - a; return <Frame cam={{ x: 930, y: 600, z: 1.55 + t * .03 }} boil={1.2} ui={<g><Tag x={960} y={110} text={t < 4.6 ? '431–404 BC · ATHENS vs SPARTA' : '404 BC · THE THIRTY TYRANTS'} s={36} /></g>}><GreeceMap T={T} t={t} highlight={['ATHENS', 'SPARTA']} arrows={[['SPARTA', 'CORINTH', '#a8322a'], ['CORINTH', 'ATHENS', '#a8322a']]} dark={clamp((t - 4.6) * .5)} />{t > 4.6 && <g opacity={clamp((t - 4.6) * 2)}><Phalanx T={T} x={1150} y={700} n={4} s={.35} flip march={.6} /></g>}</Frame>; } });
sc({ a: S('w2'), bg: (T) => <g><Stoa T={T} tone="dusk" /><rect x={-300} y={-200} width={2520} height={1500} fill="#1a0e18" opacity={.45} /></g>, wide: { x: 960, y: 600, z: 1.08 },
  actors: [{ k: 'tyrant', x: 1650, y: 980, s: 1.25, flip: true, p: { mouth: 'flat', brow: 2 } }, { k: 'herald', x: 1300, y: 1000, s: 1.3, flip: true, p: { holdF: 'staff', armF: -.3, elbowF: .3, mouth: 'flat', brow: 2 } }, { k: 'soc', x: 700, y: 1000, s: 1.3, p: { mouth: 'flat' } }, ...[0, 1, 2].map((i) => ({ k: citizen(i + 30), x: 260 + i * 140, y: 1000, s: 1.15, p: { mouth: 'O' as const } }))] });
sc({ a: S('w3b'), bg: (T, t) => <AthensBG T={T} tone="night" px={-t * 60} smoke={false} />, wide: { x: 960, y: 620, z: 1.15 },
  actors: [{ k: 'you', x: 760, y: 1000, s: 1.3, p: (T) => ({ walk: 1, phase: T * 6, mouth: 'sad' }) }, { k: 'soc', x: 1120, y: 1000, s: 1.3, p: (T) => ({ walk: 1, phase: T * 6 + 1, mouth: 'smile' }) }] });
sc({ a: S('w4'), bg: (T, t) => <AthensBG T={T} tone="dusk" px={-t * 40} smoke={false} />, wide: { x: 960, y: 560, z: 1.05 }, cam: (T, t) => ({ x: 960, y: 560, z: 1.05 + t * .02 }),
  actors: [{ k: 'soc', x: (T, t) => 500 + t * 60, y: 1000, s: 1.2, p: (T) => ({ walk: 1, phase: T * 6, mouth: 'smile' }) }, ...[0, 1, 2].map((i) => ({ k: 'tyrant', x: 1300 + i * 200, y: 980, s: 1.1, flip: true, o: (T: number, t: number) => .6 * (1 - clamp((t - 3) / 3)), p: { mouth: 'flat' as const, brow: 2 } }))] });
// 8 THE TRIAL
sc({ a: S('t1'), bg: (T) => <Court T={T} />, actors: [], cam: (T, t) => ({ x: 960, y: 560, z: 1.0 + t * .02 }), ui: (T, t) => <Tag x={960} y={110} text="501 JURORS · ONE DAY · ONE VERDICT" o={clamp((t - 3) * 2)} s={34} /> });
gfx(Kleroterion, S('t1b'));
sc({ a: S('t2'), bg: (T) => <Court T={T} jur={0} />, wide: { x: 960, y: 560, z: 1.05 },
  fg: (T) => <g>{[0, 1].map((r) => <g key={r}>{Array.from({ length: 12 }).map((_, k) => { const i = r * 12 + k + 3; return <MChar key={k} look={citizen(i)} x={-60 + k * 180 + r * 90} y={1130 + r * 70} s={.75 + r * .1} pose={{ blink: blinkAt(T, i), mouth: 'flat', lookX: (k < 6 ? 1 : -1) * .7 }} />; })}</g>)}</g>,
  actors: [{ k: 'mel', x: 900, y: 770, s: 1.15, p: { mouth: 'flat', brow: 2, armF: -1.5, elbowF: .3 } }, { k: 'soc', x: 1420, y: 900, s: 1.25, flip: true, p: { mouth: 'smile' } }, { k: 'you', x: 380, y: 980, s: 1.2, p: { mouth: 'O', brow: 1 } }],
  cams: { t3: { x: 420, y: 680, z: 1.8 }, t4: { x: 1400, y: 640, z: 1.6 } } });
gfx(JuryVote, S('t5'));
sc({ a: S('t6'), bg: (T) => <Court T={T} vote={T > S('t7') ? 1 : 0} />, wide: { x: 960, y: 560, z: 1.0 },
  actors: [{ k: 'soc', x: 960, y: 830, s: 1.2, p: { mouth: 'grin' } }], cams: { t6: { x: 960, y: 560, z: 1.55 }, t7: 'wide' },
  ui: (T, t) => <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={clamp((T - S('t7') - 1.5) / 2.5) * .55} /> });
// 9 THE HEMLOCK
sc({ a: S('h1'), bg: (T) => <Prison T={T} />, fg: () => benchFront, wide: { x: 960, y: 580, z: 1.05 },
  actors: [{ k: 'soc', x: 820, y: 900, s: 1.2, p: { mouth: 'smile' } }, { k: 'crito', x: 1250, y: 980, s: 1.25, flip: true, p: { mouth: 'sad', brow: 1.4 } }, { k: 'you', x: 420, y: 980, s: 1.2, p: { mouth: 'sad', brow: 1.2 } },
    { k: 'xan', x: (T) => T < S('h4') + 1 ? 1600 : 1600 + (T - S('h4') - 1) * 300, y: 980, s: 1.25, flip: (T) => T < S('h4') + 1, o: (T) => clamp((T - S('h3') + .6) * 3), p: (T) => T < S('h4') + 1 ? { mouth: 'sad', brow: 2, armF: -2, elbowF: 1.4 } : { walk: 1, phase: T * 6, mouth: 'sad' } }],
  cams: { h3: { x: 1500, y: 640, z: 1.7 } } });
sc({ a: S('h5'), bg: (T, t) => <Prison T={T} lamp={1 - clamp((T - S('h7')) / 1.4)} />, fg: (T, t) => <g>{benchFront}{t < 2.6 && <g transform={`translate(${870} ${640}) rotate(${-20 - clamp(t / 2) * 40}) scale(1.3)`}><path d="M -22 -46 L 22 -46 L 16 4 L -16 4 Z" fill="#8a8a7a" stroke={P.ink} strokeWidth={6} /><ellipse cx={0} cy={-46} rx={22} ry={6} fill="#4a5a3a" stroke={P.ink} strokeWidth={4} /></g>}</g>, wide: { x: 900, y: 600, z: 1.15 },
  actors: [
    { k: 'soc', x: (T) => T < S('h5') + 2.6 ? 820 : 1130, y: (T) => T < S('h5') + 2.6 ? 900 : 800, s: 1.2, still: true, p: (T) => T < S('h5') + 2.6 ? { armF: -1.5, elbowF: 1.9, mouth: 'flat', blink: 1, tilt: -8 } : { lean: -86, mouth: 'smile', blink: T > S('h7') ? 1 : 0 } } as Actor,
    { k: 'crito', x: 1350, y: 980, s: 1.25, flip: true, p: { mouth: 'sad', brow: 1.6 } }, { k: 'you', x: 420, y: 980, s: 1.2, p: { mouth: 'sad', brow: 1.6 } }],
  cams: { h6: { x: 820, y: 640, z: 1.75 }, h7: 'wide' } });
// 10 LEGACY
gfx(LegacyChain, S('c1'));
sc({ a: S('c2'), bg: (T) => <Classroom T={T} />, wide: { x: 960, y: 560, z: 1.05 },
  actors: [{ k: 'todayT', x: 1500, y: 1000, s: 1.25, flip: true, spk: 'X', p: (T) => ({ mouth: 'talk', open: Math.abs(Math.sin(T * 7)) * .6, armF: -2.0, elbowF: .4 }) }, { k: 'todayS', x: 360, y: 1040, s: 1.15, spk: 'X', p: (T) => ({ armF: -2.6, elbowF: .1, mouth: 'grin' }) }, { k: 'todayK1', x: 640, y: 1060, s: 1.1, spk: 'X', p: { mouth: 'smile' } }, { k: 'todayK2', x: 900, y: 1040, s: 1.15, spk: 'X', p: (T) => ({ mouth: 'O', armF: -2.4 + Math.sin(T * 5) * .2, elbowF: .2 }) }],
  ui: (T, t) => <Tag x={300} y={110} text="TODAY" s={34} /> });
sc({ a: S('c3'), bg: (T) => <Academy T={T} />, wide: { x: 960, y: 600, z: 1.08 },
  actors: [{ k: 'youOld', x: 700, y: 1000, s: 1.3, p: { mouth: 'smile', holdF: 'scroll', armF: -.8, elbowF: 1.2 } }, { k: 'platoOld', x: 1240, y: 1000, s: 1.32, flip: true, p: { mouth: 'smile', holdF: 'scroll', armF: -.9, elbowF: 1.4 } }, ...[0, 1, 2].map((i) => ({ k: { ...citizen(i + 41), outfit: 'chiton' as const }, x: 1550 + i * 130, y: 1020, s: 1.0, flip: true, age: .85, spk: 'X', p: { mouth: 'smile' as const } }))],
  ui: (T, t) => <Tag x={960} y={110} text="PLATO'S ACADEMY · c. 387 BC" o={clamp(t * 2)} s={34} /> });
sc({ a: S('c4'), bg: (T, t) => <AthensBG T={T} tone="dusk" px={-t * 10} />, wide: { x: 960, y: 560, z: 1.05 }, cam: (T, t) => ({ x: 960, y: 560, z: 1.05 + t * .015 }),
  actors: [{ k: 'soc', x: 820, y: 1010, s: 1.25, p: { mouth: 'smile', lookX: 1 } }, { k: 'you', x: 1100, y: 1010, s: 1.25, flip: true, p: { mouth: 'smile' } }] });

// close each item at the next item's start
scenes.sort((p, q) => p.a - q.a).forEach((s, i, arr) => { s.b = i + 1 < arr.length ? arr[i + 1].a : 10000; });
export const SHOTS = scenes;
