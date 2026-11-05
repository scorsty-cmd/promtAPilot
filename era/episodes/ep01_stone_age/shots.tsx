import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, easeIn, spring, shake, lerp, clamp, noise1, rng } from './lib';
import { Char, LOOKS, Look, Reindeer, Mammoth, Fire, Sky, Ridge, Snow, Tent, CaveArt, Stencil, HandPath, RockWall, Boil, P } from './art';

const Frame: React.FC<{ children: React.ReactNode; cam?: { x?: number; y?: number; z?: number; r?: number }; boil?: number }> = ({ children, cam = {}, boil = 3.2 }) => {
  const f = useCurrentFrame();
  const { x = 540, y = 960, z = 1, r = 0 } = cam;
  return <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <Boil id="boil" frame={f} scale={boil} />
      <radialGradient id="fireGlow"><stop offset="0" stopColor="#ffb05a" stopOpacity=".75" /><stop offset="1" stopColor="#ff8a2b" stopOpacity="0" /></radialGradient>
      <radialGradient id="warm" cx=".5" cy=".75" r=".7"><stop offset="0" stopColor="#ff9a40" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    </defs>
    <g transform={`translate(540 960) rotate(${r}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
  </svg>;
};
const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <g filter="url(#boil)">{children}</g>;
const blinkAt = (T: number, seed: number) => { const p = (T + seed * 1.7) % 3.4; return p < .13 ? 1 : 0; };
const talk = (T: number) => .3 + .7 * Math.abs(noise1(T * 9, 5));
const YOU_OLD: Look = { ...LOOKS.you, hair: '#d9d2c4', wrinkles: true };

/* baby in a fur bundle */
const Baby: React.FC<{ x: number; y: number; s?: number; T: number }> = ({ x, y, s = 1, T }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-12)`}>
    <ellipse cx={0} cy={0} rx={62} ry={40} fill="#e9dcc4" stroke={P.ink} strokeWidth={6} />
    <circle cx={34} cy={-6} r={27} fill={LOOKS.you.skin} stroke={P.ink} strokeWidth={6} />
    {blinkAt(T, 2) || T % 2 < 1.2 ? <><path d="M 26 -10 q 4 4 8 0 M 42 -10 q 4 4 8 0" stroke={P.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" /></> : <><circle cx={30} cy={-9} r={4} fill={P.ink} /><circle cx={46} cy={-9} r={4} fill={P.ink} /></>}
    <path d="M 32 4 q 6 5 12 0" stroke={P.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <path d="M 20 -2 L 56 -2" stroke={P.ochreR} strokeWidth={5} strokeLinecap="round" opacity={.8} />
    <path d="M -40 -20 q 10 18 0 36 M -14 -30 q 10 22 0 50" stroke="#c9b898" strokeWidth={5} fill="none" />
  </g>
);

/* ===== 1. hook: born in the Ice Age ===== */
export const S1: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const z = lerp(1.7, 2.05, easeInOut(t / 3.9));
  return <Frame cam={{ x: 480, y: 1230, z }}>
    <Sky id="s1" top="#0d1a33" bottom="#3d5a7a" />
    {[0, 1, 2].map((k) => <path key={k} d={`M -100 ${420 + k * 70} C 200 ${300 + k * 60 + Math.sin(T + k) * 30} 600 ${520 + k * 40} 1200 ${360 + k * 70}`} stroke={['#59e3b0', '#7df0c4', '#a77cf0'][k]} strokeWidth={60 - k * 14} fill="none" opacity={.18 + .08 * Math.sin(T * 1.3 + k)} style={{ filter: 'blur(18px)' } as any} />)}
    {Array.from({ length: 70 }).map((_, i) => { const r = rng(i + 3); return <circle key={i} cx={r() * 1080} cy={r() * 700} r={r() * 2.5 + .5} fill="#fff" opacity={.5 + .5 * Math.sin(T * 3 + i)} />; })}
    <Ridge y={1000} amp={260} seed={4} color="#2c4664" snow="#7f9bb4" />
    <Ridge y={1180} amp={120} seed={7} color="#9fb6c8" />
    <rect y={1150} width={1080} height={800} fill="#c9d8e2" />
    <B>
      <Tent x={600} y={1350} s={1.1} glow={.8 + .2 * Math.sin(T * 9)} />
      <Char look={LOOKS.mom} x={400} y={1400} s={1.05} pose={{ armF: -1.05, armB: .9, turn: .45, tilt: 8 + Math.sin(T * 1.5) * 2, mouth: 'smile', lookX: 1, lookY: 1.2, blink: blinkAt(T, 1) }} />
      <Baby x={470} y={1230} s={.9} T={T} />
    </B>
    <ellipse cx={590} cy={1340} rx={260} ry={60} fill="url(#fireGlow)" opacity={.5} />
    <Snow t={T} n={90} seed={2} wind={30} speed={90} size={4} />
  </Frame>;
};

/* ===== 2a. your band crossing the tundra ===== */
export const S2a: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const pan = lerp(0, 160, easeInOut(t / 2.8));
  const band = ['a', 'b', 'elder', 'mom', 'c', 'd', 'a', 'b'];
  return <Frame cam={{ x: 700 + pan, y: 1210, z: 1.6 }}>
    <Sky id="s2" top="#8fb0cc" bottom="#eef2f4" />
    <circle cx={260} cy={520} r={90} fill="#fff6e0" opacity={.85} />
    <g transform={`translate(${pan * .7} 0)`}><Ridge y={980} amp={300} seed={11} color="#9db4c6" snow="#f4f8fb" w={1700} /></g>
    <g transform={`translate(${pan * .4} 0)`}><Ridge y={1180} amp={160} seed={15} color="#c4d4df" snow="#ffffff" w={1700} />
      <g opacity={.55}><Mammoth x={1200} y={1150} s={.35} t={T * .6} /><Mammoth x={1380} y={1170} s={.28} t={T * .6 + 1} /></g></g>
    <rect y={1250} width={1500} height={800} fill={P.snow} />
    <path d="M -100 1420 C 300 1380 700 1460 1500 1400" stroke={P.snowS} strokeWidth={30} fill="none" opacity={.6} />
    <B>
      {band.map((k, i) => { const x = 260 + i * 110 + t * 60, s = .62 + (i % 3) * .03; return <Char key={i} look={LOOKS[k]} x={x} y={1420 + (i % 2) * 18} s={s} age={k === 'c' || k === 'd' ? .6 : 1} pose={{ walk: 1, phase: T * 6 + i, turn: .8, holdF: i % 3 === 0 ? 'spear' : 'none', mouth: 'flat', blink: blinkAt(T, i) }} />; })}
      <Char look={LOOKS.you} x={1180 + t * 60} y={1500} s={.9} age={.55} pose={{ walk: 1, phase: T * 6.5, turn: .7, mouth: 'grin', blink: blinkAt(T, 9) }} />
    </B>
    <Snow t={T} n={60} seed={5} wind={50} speed={70} size={4} />
  </Frame>;
};
/* ===== 2b. you know every single one ===== */
export const S2b: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const pan = lerp(-120, 140, easeInOut(t / 3.3));
  const row: [string, number][] = [['elder', 1.4], ['b', 1], ['mom', 1], ['you', .55], ['a', 1], ['d', .6], ['c', .6]];
  return <Frame cam={{ x: 540 + pan, y: 1000, z: 1.35 }}>
    <Sky id="s2b" top="#a8c0d2" bottom="#eef2f4" />
    <Ridge y={900} amp={200} seed={19} color="#b9cad6" snow="#f4f8fb" w={1700} />
    <Tent x={200} y={1080} s={.8} /><Tent x={960} y={1060} s={.7} />
    <rect y={1060} width={1500} height={900} fill={P.snow} />
    <B>{row.map(([k, age], i) => {
      const x = -60 + i * 190, pop = spring(prog(t, i * .25, i * .25 + .6), 10, .45);
      const L = k === 'you' ? LOOKS.you : LOOKS[k];
      return <Char key={i} look={L} x={x} y={1330 + (1 - pop) * 60} s={k === 'you' ? 1.15 : 1} age={age}
        pose={{ turn: (i - 3) * -.12, mouth: k === 'you' ? 'grin' : i % 3 === 0 ? 'smile' : i % 3 === 1 ? 'talk' : 'smile', open: talk(T + i), armF: i % 2 ? -2.4 + Math.sin(T * 8 + i) * .3 : .15, blink: blinkAt(T, i), brow: i === 0 ? -.5 : .5 }} />;
    })}</B>
  </Frame>;
};

/* ===== 3. almost half the children ===== */
export const S3: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const kids: [string, boolean][] = [['c', false], ['you', false], ['d', true], ['b', true], ['a', false], ['c', true]];
  const fade = easeInOut(prog(T, 10.9, 12.2));
  return <Frame cam={{ x: 540, y: 1140, z: lerp(1.3, 1.45, t / 4) }}>
    <Sky id="s3" top="#7d8a96" bottom="#cfd6db" />
    <Ridge y={1000} amp={220} seed={23} color="#98a6b0" snow="#dfe6ea" />
    <rect y={1120} width={1080} height={900} fill="#e3e8eb" />
    <B>{kids.map(([k, gone], i) => {
      const x = 110 + i * 172, L = LOOKS[k];
      return <g key={i}>
        {gone && <Char look={L} x={x} y={1420} s={.95} age={.55} ghost opacity={fade * (1 - prog(T, 12.6, 13.6))} pose={{ mouth: 'smile', turn: 0 }} />}
        <Char look={L} x={x} y={1420} s={.95} age={.55} opacity={gone ? 1 - fade : 1} pose={{ mouth: gone ? 'smile' : (T > 11.6 ? 'sad' : 'flat'), brow: T > 11.6 && !gone ? 2 : 0, turn: (i - 2.5) * -.15, blink: blinkAt(T, i), lookX: gone ? 0 : (T > 11.4 ? (i < 3 ? 1 : -1) : 0) }} />
      </g>;
    })}</B>
    <Snow t={T} n={70} seed={8} wind={-20} speed={60} size={4} opacity={.8} />
  </Frame>;
};

/* ===== 4. you learn fast ===== */
export const S4a: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const strike = Math.sin(T * 14) > .3 && T < 14.7 ? 1 : 0; const flame = easeOut(prog(T, 14.7, 15.4));
  return <Frame cam={{ x: 520, y: 1300, z: lerp(1.9, 2.1, t / 1.7) }}>
    <rect width={1080} height={1920} fill="#1a1210" />
    <ellipse cx={600} cy={1430} rx={600 * flame + 100} ry={260 * flame + 40} fill="url(#fireGlow)" opacity={.4 + flame * .6} />
    <rect y={1440} width={1080} height={500} fill="#3a2a20" />
    <B>
      <Char look={LOOKS.you} x={420} y={1470} s={1.25} age={.6} pose={{ crouch: 1, armF: .9 + strike * .35, armB: 1.1, holdF: 'flint', turn: .7, lookX: 1, lookY: 1.3, mouth: flame > .5 ? 'grin' : 'flat', brow: flame > .5 ? 1 : -1, blink: blinkAt(T, 4) }} />
      <Fire x={640} y={1450} s={.15 + flame * .55} t={T} />
    </B>
    {T > 14.3 && T < 14.9 && Array.from({ length: 12 }).map((_, i) => { const a = i / 12 * 6.28, d = ((T * 6 + i) % 1) * 90; return <circle key={i} cx={600 + Math.cos(a) * d} cy={1420 + Math.sin(a) * d * .6} r={4} fill={P.fireY} />; })}
  </Frame>;
};
export const S4b: React.FC<{ t: number; T: number }> = ({ t, T }) => (
  <Frame cam={{ x: 520, y: 1000, z: 1.45 }}>
    <rect width={1080} height={1920} fill={P.snow} />
    {Array.from({ length: 30 }).map((_, i) => { const r = rng(i + 30); return <ellipse key={i} cx={r() * 1080} cy={r() * 1920} rx={60 + r() * 120} ry={18 + r() * 30} fill={P.snowS} opacity={.35} />; })}
    {Array.from({ length: 7 }).map((_, i) => { const show = clamp((t - i * .12) * 5); const x = 980 - i * 130, y = 1500 - i * 70 + (i % 2) * 40; return <g key={i} opacity={show} transform={`translate(${x} ${y}) rotate(-28)`}>
      {[-1, 1].map((q) => <path key={q} d={`M ${q * 12} 0 q ${q * 16} -24 ${q * 4} -50 q ${-q * 10} 10 ${-q * 8} 50 z`} fill="#8aa0b0" stroke="#5d7282" strokeWidth={3} />)}</g>; })}
    <B><Char look={LOOKS.you} x={330} y={1180} s={1.3} age={.6} pose={{ crouch: 1, armF: -1.4, turn: .8, lookX: 1, lookY: 1.5, mouth: 'O', brow: .5, blink: blinkAt(T, 6) }} /></B>
    <Snow t={T} n={50} seed={9} wind={20} speed={50} size={4} />
  </Frame>
);
export const S4c: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const p = clamp(t / 1.9); const nx = lerp(300, 780, p), ny = 980 + Math.sin(t * 9) * 70;
  return <Frame cam={{ x: 540, y: 960, z: 1 }}>
    <rect width={1080} height={1920} fill="#2a1d16" />
    <ellipse cx={540} cy={1000} rx={600} ry={500} fill="url(#fireGlow)" opacity={.45} />
    <B>
      <path d="M 120 760 C 300 700 800 720 960 780 L 980 1220 C 760 1260 330 1250 100 1200 Z" fill="#9a7650" stroke={P.ink} strokeWidth={8} />
      <path d="M 120 1010 C 330 990 760 990 980 1010" stroke="#6d5034" strokeWidth={10} fill="none" />
      {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${160 + (i % 10) * 80} ${800 + Math.floor(i / 10) * 140} l 10 18`} stroke="#7a5a3a" strokeWidth={5} strokeLinecap="round" />)}
      <path d={`M 260 1000 ${Array.from({ length: 12 }).map((_, i) => { const x = 280 + i * 45; return x < nx ? `L ${x} ${i % 2 ? 970 : 1030}` : ''; }).join(' ')}`} stroke={P.chalk} strokeWidth={5} fill="none" strokeLinejoin="round" />
      <line x1={nx} y1={ny} x2={nx + 120} y2={ny - 90} stroke={P.ink} strokeWidth={14} strokeLinecap="round" /><line x1={nx} y1={ny} x2={nx + 120} y2={ny - 90} stroke={P.chalk} strokeWidth={7} strokeLinecap="round" />
      <g transform={`translate(${nx + 120} ${ny - 90}) rotate(-35)`}><ellipse cx={30} cy={10} rx={70} ry={52} fill={LOOKS.you.skin} stroke={P.ink} strokeWidth={8} /><path d="M -10 -20 q 30 -16 70 0" stroke={LOOKS.you.skinS} strokeWidth={6} fill="none" /></g>
      <g transform="translate(150 1080) rotate(20)"><ellipse cx={0} cy={0} rx={80} ry={56} fill={LOOKS.you.skin} stroke={P.ink} strokeWidth={8} /></g>
    </B>
  </Frame>;
};

/* ===== 5. winter is the boss ===== */
export const S5: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const pan = lerp(0, 260, t / 4.2);
  return <Frame cam={{ x: 520 + pan, y: 1370, z: 1.5 }}>
    <Sky id="s5" top="#6f8296" bottom="#c9d3da" />
    <g transform={`translate(${pan * .7} 0)`}><Ridge y={1000} amp={240} seed={31} color="#8a9cab" snow="#d8e1e7" w={1800} /></g>
    <g transform={`translate(${pan * .35} 0)`}>{[0, 1, 2, 3, 4].map((i) => <Reindeer key={i} x={700 + i * 140 + t * 70} y={1150 + (i % 2) * 20} s={.42} t={T + i} dark />)}</g>
    <rect y={1180} width={1800} height={800} fill="#dfe6ea" />
    <B><Char look={LOOKS.you} x={400 + t * 75} y={1560} s={1.25} age={.85} pose={{ walk: 1, phase: T * 5.5, turn: .8, holdF: 'spear', armF: -.25, mouth: 'flat', brow: -1.5, tilt: 6, blink: blinkAt(T, 3) }} /></B>
    {Array.from({ length: 40 }).map((_, i) => { const r = rng(i + 50); const x = ((r() * 1800 + T * 900) % 1900) - 200 + pan; const y = r() * 1920; return <line key={i} x1={x} y1={y} x2={x - 80} y2={y + 12} stroke="#fff" strokeWidth={2 + r() * 2} opacity={.6} />; })}
    <Snow t={T} n={160} seed={12} wind={420} speed={160} size={5} />
  </Frame>;
};

/* ===== 6. the mammoth (then it becomes a memory on the wall) ===== */
export const S6: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const enter = easeOut(prog(T, 23.1, 24.3));
  const tr = prog(T, 24.6, 25.0) - prog(T, 25.8, 26.3);
  const s = shake(T, 24.7, 14, 1.0);
  const toArt = easeInOut(prog(T, 26.6, 27.4));
  return <>
    <Frame cam={{ x: 560 + s[0], y: 1350 + s[1], z: 1.45 }}>
      <Sky id="s6" top="#9eb3c4" bottom="#e9eef1" />
      <Ridge y={980} amp={220} seed={37} color="#a9bbc8" snow="#f4f8fb" />
      <rect y={1160} width={1080} height={800} fill={P.snow} />
      <B>
        <Mammoth x={lerp(1500, 760, enter)} y={1500} s={1.25} t={T} trumpet={tr} flip />
        {[0, 1, 2, 3].map((i) => <Char key={i} look={LOOKS[['you', 'a', 'c', 'b'][i]]} x={170 + i * 90} y={1560 + (i % 2) * 30} s={.85} age={i === 0 ? 1 : 1} pose={{ holdF: 'spear', armF: -.4 - (T > 25.2 ? .5 : 0), turn: .8, mouth: tr > .3 ? 'O' : 'flat', brow: -1.5, crouch: .4, blink: blinkAt(T, i) }} />)}
      </B>
      <Snow t={T} n={60} seed={14} wind={60} speed={80} size={4} />
    </Frame>
    {toArt > 0 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: toArt }}>
      <RockWall light={[540, 900]} radius={900} />
      <CaveArt x={600} y={980} s={2.2} kind="mammoth" draw={prog(T, 26.8, 27.8)} />
      {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${200 + i * 70} ${1150 + (i % 2) * 20})`} opacity={clamp((T - 27.2 - i * .08) * 4)}>
        <circle cx={0} cy={-70} r={12} fill={P.ochreR} /><path d="M 0 -58 L 0 -10 M 0 -10 L -14 26 M 0 -10 L 14 26 M 0 -46 L 22 -64 M 22 -64 L 40 -130" stroke={P.ochreR} strokeWidth={8} strokeLinecap="round" fill="none" /></g>)}
    </svg>}
  </>;
};

/* ===== 7. stories at the fire ===== */
export const S7: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const z = lerp(1.35, 1.55, easeInOut(t / 5.5));
  const sit = (k: string, x: number, y: number, s: number, flip: boolean, age = 1, i = 0) => <Char key={k + x} look={LOOKS[k]} x={x} y={y} s={s} flip={flip} age={age} pose={{ crouch: 1, turn: .7, mouth: 'smile', lookX: 1, blink: blinkAt(T, i), armF: .6, armB: .4 }} />;
  return <Frame cam={{ x: 540, y: 1260, z }}>
    <Sky id="s7" top="#060a16" bottom="#1d2238" />
    {Array.from({ length: 90 }).map((_, i) => { const r = rng(i + 70); return <circle key={i} cx={r() * 1080} cy={r() * 900} r={r() * 2.4 + .4} fill="#fff" opacity={.4 + .4 * Math.sin(T * 2 + i)} />; })}
    <Ridge y={1100} amp={180} seed={41} color="#141a2b" />
    <rect y={1300} width={1080} height={700} fill="#20212b" />
    <ellipse cx={540} cy={1440} rx={700} ry={300} fill="url(#fireGlow)" opacity={.7} />
    <g opacity={.75}>{[0, 1, 2].map((k) => <path key={k} d={`M ${540 + Math.sin(T + k) * 20} 1300 C ${520 + k * 30} ${1150 - k * 40} ${600 - k * 40} ${1000 - k * 30} ${540 + Math.sin(T * .7 + k) * 40} ${860 - k * 40}`} stroke="#8d8a92" strokeWidth={40 - k * 8} fill="none" opacity={.25} strokeLinecap="round" />)}</g>
    <CaveArt x={560} y={820} s={1.6} kind="deer" color={P.chalk} draw={prog(T, 29.6, 31.4)} />
    <CaveArt x={560} y={820} s={1.6} kind="mammoth" color={P.chalk} draw={prog(T, 31.6, 33.0) * (T > 31.5 ? 1 : 0)} />
    <B>
      {sit('a', 180, 1420, .9, false, 1, 1)}{sit('mom', 300, 1520, .95, false, 1, 2)}{sit('d', 860, 1430, .8, true, .6, 3)}{sit('b', 760, 1530, .95, true, 1, 4)}
      <Char look={LOOKS.elder} x={260} y={1350} s={.85} age={1.4} pose={{ crouch: .6, turn: .7, mouth: 'talk', open: talk(T), armF: -1.6 + Math.sin(T * 2.4) * .5, lookX: 1, brow: .5, blink: blinkAt(T, 5) }} />
      <Char look={LOOKS.you} x={600} y={1600} s={1.05} age={.6} pose={{ crouch: 1, turn: -.1, mouth: 'O', lookY: -1.5, lookX: -.3, armF: .5, blink: blinkAt(T, 6) }} />
      <Fire x={540} y={1440} s={.75} t={T} />
    </B>
  </Frame>;
};

/* ===== 8. survive childhood -> 60s and 70s ===== */
export const S8: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const stages = [[33.7, .45], [35.0, .8], [36.1, 1.0], [37.2, 1.5]] as const;
  let k = 0; stages.forEach(([s0], i) => { if (T >= s0) k = i; });
  const age = stages[k][1]; const pop = spring(prog(T, stages[k][0], stages[k][0] + .4), 12, .4);
  const look = age > 1.3 ? YOU_OLD : LOOKS.you;
  return <Frame cam={{ x: 540, y: 1100, z: 1.2 }}>
    <rect width={1080} height={1920} fill="#d9a441" />
    {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M 540 1150 L ${540 + Math.cos(i / 14 * 6.28 + T * .2) * 1600} ${1150 + Math.sin(i / 14 * 6.28 + T * .2) * 1600} L ${540 + Math.cos((i + .5) / 14 * 6.28 + T * .2) * 1600} ${1150 + Math.sin((i + .5) / 14 * 6.28 + T * .2) * 1600} Z`} fill="#e3b45a" />)}
    <ellipse cx={540} cy={1480} rx={260} ry={40} fill="rgba(60,30,10,.25)" />
    <B><Char look={look} x={540} y={1470} s={1.25 * (.9 + .1 * pop)} age={age} pose={{ mouth: age > 1.3 ? 'smile' : 'grin', turn: .2, armF: age > 1.3 ? .1 : -.3, holdF: age > .7 && age < 1.3 ? 'spear' : 'none', blink: blinkAt(T, 7), brow: .8, tilt: Math.sin(T * 2) * 3 }} /></B>
  </Frame>;
};

/* ===== 9. your hand on the cave wall ===== */
export const S9: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const press = easeOut(prog(T, 39.2, 39.7)), lift = easeIn(prog(T, 42.3, 42.9));
  const spray = prog(T, 39.9, 42.2);
  const flick = 1 + .05 * Math.sin(T * 11) + .03 * Math.sin(T * 23);
  return <Frame cam={{ x: 560, y: 980, z: lerp(1.05, 1.2, easeInOut(t / 4.8)) }} boil={2.4}>
    <RockWall light={[700, 820]} radius={760 * flick} />
    <CaveArt x={260} y={520} s={1.2} kind="horse" draw={1} />
    <CaveArt x={820} y={1340} s={1.1} kind="deer" draw={1} color={P.ochreD} />
    <Stencil x={600} y={940} s={1.5} rot={-8} seed={3} amount={spray} id="st1" />
    {lift < 1 && <g transform={`translate(${600 + lift * 220} ${940 + lift * 420}) rotate(-8) scale(${1.5 * (1 - press * .02)})`} opacity={1 - lift}>
      <path d={HandPath} fill={LOOKS.you.skin} stroke={P.ink} strokeWidth={5} />
      <path d="M -34 70 L 30 70 L 40 300 L -40 300 Z" fill={LOOKS.you.skin} stroke={P.ink} strokeWidth={5} />
      <path d="M -40 120 L 40 120 L 44 300 L -44 300 Z" fill={LOOKS.you.tunic} stroke={P.ink} strokeWidth={5} />
    </g>}
    {spray > 0 && spray < 1 && Array.from({ length: 40 }).map((_, i) => { const r = rng(i * 7 + Math.floor(T * 30)); const a = r() * 6.28, d = 150 + r() * 220; return <circle key={i} cx={600 + Math.cos(a) * d * .6 - 200 * (1 - r())} cy={940 + Math.sin(a) * d * .5} r={2 + r() * 4} fill={P.ochreR} opacity={.6} />; })}
    <B>{spray > 0 && lift < .5 && <g transform="translate(-60 1060)"><Char look={LOOKS.you} x={0} y={600} s={1.4} pose={{ mouth: 'blow', turn: .9, lookX: 1, armF: -2.2, blink: 0, brow: -.5 }} /></g>}</B>
  </Frame>;
};

/* ===== 10. still there today ===== */
export const S10: React.FC<{ t: number; T: number }> = ({ t, T }) => {
  const z = lerp(1.0, 1.5, easeInOut(t / 4.6));
  const beam = 620 + Math.sin(T * 1.3) * 40;
  return <Frame cam={{ x: 600, y: 940, z }} boil={2}>
    <RockWall light={[beam, 900]} radius={560} tone="#5b4636" cool />
    {[[260, 560, 14, .55], [860, 620, -18, .45], [380, 1320, 6, .5], [820, 1260, 24, .4], [180, 980, -30, .35]].map(([x, y, r, a], i) =>
      <g key={i} opacity={a}><Stencil x={x} y={y} s={1.1} rot={r} seed={i + 10} amount={1} id={`sx${i}`} color={i % 2 ? P.ochreD : P.ochreR} /></g>)}
    <g opacity={.75}><Stencil x={600} y={940} s={1.5} rot={-8} seed={3} amount={1} id="st2" /></g>
    <CaveArt x={260} y={520} s={1.2} kind="horse" draw={1} color={P.ochreD} />
    <rect width={1080} height={1920} fill="rgba(10,14,20,.25)" />
  </Frame>;
};
