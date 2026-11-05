import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog, easeInOut, easeOut, easeIn, spring, shake, lerp, clamp, noise1, rng } from './lib';
import { Boil, P, Fire } from './art';
import { MChar, CAST, Cradle, MLook, MPose } from './chars';
import { SkyG, Hills, Canopy, Palm, Ceiba, BigLeaves, Mist, Birds, Pyramid, Hut, Stela, Maize, Squash, Metate, Dog, Turkey, Jaguar, Snake, Monkey, Ball, CacaoPile, Codex, GlyphBlock, MayaMap } from './sets';
import { Numerals, CalendarGears, LongCount, RainChart, PopDots, SocialPyramid, FourBooks, TodayCount, Txt } from './graphics';

/* ---------- frame & helpers (16:9) ---------- */
type Cam = { x?: number; y?: number; z?: number; r?: number };
export const Frame: React.FC<{ children: React.ReactNode; cam?: Cam; boil?: number }> = ({ children, cam = {}, boil = 2.6 }) => {
  const f = useCurrentFrame();
  const { x = 960, y = 540, z = 1, r = 0 } = cam;
  return <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <Boil id="boil" frame={f} scale={boil} />
      <radialGradient id="fireGlow"><stop offset="0" stopColor="#ffb05a" stopOpacity=".75" /><stop offset="1" stopColor="#ff8a2b" stopOpacity="0" /></radialGradient>
      <radialGradient id="sunGlow"><stop offset="0" stopColor="#fff2c0" stopOpacity="1" /><stop offset="1" stopColor="#ffd070" stopOpacity="0" /></radialGradient>
    </defs>
    <g transform={`translate(960 540) rotate(${r}) scale(${z}) translate(${-x} ${-y})`}>{React.Children.toArray(children).filter((c: any) => !(c && (c.type === Tag || c.type === UI)))}</g>
    {React.Children.toArray(children).filter((c: any) => c && (c.type === Tag || c.type === UI))}
  </svg>;
};
const UI: React.FC<{ children: React.ReactNode }> = ({ children }) => <g>{children}</g>;
export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <g filter="url(#boil)">{children}</g>;
const blink = (T: number, s: number) => ((T + s * 1.7) % 3.6) < .13 ? 1 : 0;
const talk = (T: number) => .3 + .7 * Math.abs(noise1(T * 9, 5));
const pan = (t: number, d: number, a: number, b: number) => lerp(a, b, easeInOut(t / d));
const C = (k: string) => CAST[k];
export const Ch: React.FC<{ k: string | MLook; x: number; y: number; s?: number; age?: number; flip?: boolean; T: number; seed?: number; p?: MPose; o?: number }> = ({ k, x, y, s = 1, age = 1, flip, T, seed = 0, p = {}, o = 1 }) =>
  <MChar look={typeof k === 'string' ? C(k) : k} x={x} y={y} s={s} age={age} flip={flip} opacity={o} pose={{ blink: blink(T, seed), ...p }} />;
const Rain: React.FC<{ T: number; n?: number; o?: number }> = ({ T, n = 120, o = .6 }) => { const R = rng(9); return <g opacity={o}>{Array.from({ length: n }).map((_, i) => { const x = R() * 2400 - 200, y0 = R() * 1200; const y = (y0 + T * 1400) % 1300 - 100; return <line key={i} x1={x - y * .1} y1={y} x2={x - y * .1 - 8} y2={y + 46} stroke="#cfe2ea" strokeWidth={3} />; })}</g>; };
const Stars: React.FC<{ T: number; n?: number; seed?: number }> = ({ T, n = 140, seed = 3 }) => { const R = rng(seed); return <g>{Array.from({ length: n }).map((_, i) => <circle key={i} cx={R() * 2400 - 240} cy={R() * 700 - 100} r={R() * 2.6 + .6} fill="#fff" opacity={.4 + .4 * Math.sin(T * 2 + i)} />)}</g>; };
const Tag: React.FC<{ x: number; y: number; text: string; o?: number; c?: string }> = ({ x, y, text, o = 1, c = '#1d1612' }) => (
  <g opacity={o}><rect x={x - text.length * 13 - 26} y={y - 46} width={text.length * 26 + 52} height={68} rx={14} fill={c} /><Txt x={x} y={y} s={40} c="#ffb347">{text}</Txt></g>
);

/* ---------- environments ---------- */
export const JungleBG: React.FC<{ T: number; tone?: 'dawn' | 'day' | 'dusk' | 'night' | 'gray'; temples?: boolean; mist?: number; px?: number }> = ({ T, tone = 'day', temples = false, mist = .5, px = 0 }) => {
  const tones = { dawn: ['#f2b07a', '#fbe3b8', '#5f8a6a', '#3f6e4a', '#2f5a38'], day: ['#8fc4d8', '#e6f0d8', '#6a9a6a', '#4a7f4a', '#2f6a38'], dusk: ['#5a3a6a', '#f09a6a', '#4a5a4a', '#33503a', '#24402c'], night: ['#0d1630', '#2a3a5a', '#1a2a2a', '#132420', '#0d1a16'], gray: ['#b8b4a8', '#e0dcd0', '#8a8a6a', '#6a6e52', '#4a5240'] }[tone];
  return <g>
    <SkyG id={'sk' + tone} top={tones[0]} bottom={tones[1]} />
    {tone === 'night' && <Stars T={T} />}
    {(tone === 'dawn' || tone === 'day') && <circle cx={1500 + px * .1} cy={tone === 'dawn' ? 520 : 200} r={tone === 'dawn' ? 220 : 160} fill="url(#sunGlow)" />}
    <g transform={`translate(${px * .2} 0)`}><Canopy y={700} seed={1} color={tones[2]} r={90} n={30} T={T} /></g>
    {temples && <g transform={`translate(${px * .3} 0)`}><Pyramid x={1240} y={720} s={.55} c={tone === 'night' ? '#4a3a3a' : '#b04a36'} c2={tone === 'night' ? '#6a6a62' : '#e9d9b8'} /><Pyramid x={620} y={740} s={.38} c={tone === 'night' ? '#4a3a3a' : '#a8483a'} steps={6} /></g>}
    <Mist y={700} T={T} o={mist} />
    <g transform={`translate(${px * .5} 0)`}><Canopy y={860} seed={4} color={tones[3]} color2="#7aaa6a" r={130} n={22} T={T} /></g>
    <g transform={`translate(${px} 0)`}><Canopy y={1000} seed={7} color={tones[4]} r={150} n={18} T={T} /></g>
  </g>;
};
const Ground: React.FC<{ y: number; c?: string; c2?: string }> = ({ y, c = '#c9a878', c2 = '#b8966a' }) => <g><rect x={-1000} y={y} width={4000} height={1400} fill={c} />{Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 101); return <ellipse key={i} cx={R() * 2400 - 200} cy={y + 30 + R() * 500} rx={40 + R() * 80} ry={8 + R() * 10} fill={c2} opacity={.5} />; })}</g>;
const Compound: React.FC<{ T: number; tone?: 'dawn' | 'day' | 'dusk' | 'night'; smoke?: number }> = ({ T, tone = 'day', smoke = .6 }) => (
  <g>
    <JungleBG T={T} tone={tone} mist={.3} />
    <Palm x={140} y={780} s={1.1} T={T} /><Palm x={1820} y={760} s={1.2} T={T + 1} />
    <Ground y={780} />
    <rect x={-200} y={760} width={2400} height={50} fill="#d6c4a0" stroke={P.ink} strokeWidth={6} />
    <Hut x={480} y={780} s={.9} T={T} /><Hut x={1450} y={780} s={1.0} smoke={smoke} T={T} /><Hut x={980} y={740} s={.7} door={false} />
  </g>
);
const Plaza: React.FC<{ T: number; px?: number; tone?: 'day' | 'dusk' | 'dawn' }> = ({ T, px = 0, tone = 'day' }) => (
  <g>
    <JungleBG T={T} tone={tone} mist={.2} px={px} />
    <g transform={`translate(${px * .6} 0)`}>
      <Pyramid x={960} y={820} s={1.15} /><Pyramid x={300} y={820} s={.7} steps={6} /><Pyramid x={1650} y={820} s={.75} steps={6} />
      <Stela x={640} y={880} s={.7} /><Stela x={1300} y={880} s={.7} />
    </g>
    <rect x={-1000} y={820} width={4000} height={600} fill="#e2d2b0" />
    {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={-400 + i * 260} y1={820} x2={-800 + i * 360} y2={1200} stroke="#cfbd96" strokeWidth={4} />)}
  </g>
);
const MilpaBG: React.FC<{ T: number; dry?: number; tone?: 'dawn' | 'day' }> = ({ T, dry = 0, tone = 'day' }) => (
  <g>
    <SkyG id={'mi' + tone + (dry > .5 ? 'd' : '')} top={dry > .5 ? '#e9b870' : tone === 'dawn' ? '#f2b07a' : '#9cc8dc'} bottom={dry > .5 ? '#f6e2a8' : '#eef2d8'} />
    <circle cx={1500} cy={dry > .5 ? 220 : 300} r={dry > .5 ? 280 : 180} fill="url(#sunGlow)" />
    <Hills y={640} amp={160} seed={3} color={dry > .5 ? '#a49a62' : '#7aa05a'} />
    <Hills y={720} amp={80} seed={8} color={dry > .5 ? '#b8a46a' : '#5f8a4a'} />
    <rect x={-1000} y={760} width={4000} height={800} fill={dry > .5 ? '#c9a46a' : '#8a6a42'} />
    {dry > .5 && Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 300); const x = R() * 2000, y = 800 + R() * 300; return <path key={i} d={`M ${x} ${y} l ${30 + R() * 40} ${R() * 30 - 15} l ${20} ${R() * 40}`} stroke="#8a6a3a" strokeWidth={4} fill="none" />; })}
    {Array.from({ length: 22 }).map((_, i) => <Maize key={i} x={-60 + i * 95 + (i % 2) * 30} y={770 + (i % 3) * 12} s={.75 + (i % 3) * .08} T={T} dry={dry} />)}
  </g>
);
const NightSky: React.FC<{ T: number; venus?: number }> = ({ T, venus = 0 }) => (
  <g>
    <SkyG id="nsk" top="#070c20" bottom="#1d2a4a" />
    <Stars T={T} n={220} seed={7} />
    <path d="M -200 300 C 300 160 900 260 2200 120" stroke="#9fb0e0" strokeWidth={180} opacity={.06} fill="none" style={{ filter: 'blur(30px)' } as any} />
    {venus > 0 && <g opacity={venus}><circle cx={1420} cy={260} r={60} fill="url(#sunGlow)" /><circle cx={1420} cy={260} r={12} fill="#fffbe8" /><Txt x={1420} y={350} s={34} f="Mono" c="#fff2c0">VENUS</Txt></g>}
  </g>
);
const Interior: React.FC<{ wall?: string; floor?: string; glow?: number }> = ({ wall = '#b04a36', floor = '#c9a878', glow = 1 }) => (
  <g>
    <rect x={-400} y={-300} width={2720} height={1200} fill={wall} />
    {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={i * 240 - 80} y={160} width={140} height={140} rx={30} fill="none" stroke="#7a2a1e" strokeWidth={10} opacity={.5} />)}
    <rect x={-400} y={820} width={2720} height={600} fill={floor} />
    <ellipse cx={960} cy={600} rx={900} ry={500} fill="url(#fireGlow)" opacity={.35 * glow} />
  </g>
);
const Xibalba: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <SkyG id="xb" top="#120a1e" bottom="#3a1a3a" />
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${i * 240 - 100} -50 L ${i * 240 + 20} ${200 + (i % 3) * 80} L ${i * 240 + 140} -50 Z`} fill="#1c1028" stroke={P.ink} strokeWidth={6} />)}
    <rect x={-400} y={820} width={2720} height={600} fill="#2a1430" />
    <path d={`M -200 900 C 400 ${860 + Math.sin(T) * 10} 900 960 2200 900 L 2200 960 C 900 1020 400 ${930 + Math.sin(T) * 10} -200 960 Z`} fill="#7a1e2e" opacity={.8} />
    {Array.from({ length: 6 }).map((_, i) => { const x = (i * 360 + T * 40) % 2200 - 140, y = 200 + Math.sin(T * 2 + i) * 60; return <path key={i} d={`M ${x - 30} ${y} q 15 ${-20 + Math.sin(T * 9 + i) * 14} 30 0 q 15 ${-20 + Math.sin(T * 9 + i) * 14} 30 0`} stroke="#0a0610" strokeWidth={8} fill="none" />; })}
  </g>
);
// cartoon lord of death (stylized, not gory)
const DeathLord: React.FC<{ x: number; y: number; s?: number; T: number; mood?: 'grin' | 'shock' }> = ({ x, y, s = 1, T, mood = 'grin' }) => (
  <g transform={`translate(${x} ${y + Math.sin(T * 2 + x) * 6}) scale(${s})`}>
    <path d="M -70 0 L -50 -240 L 50 -240 L 70 0 Z" fill="#2a2a3a" stroke={P.ink} strokeWidth={7} />
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M -40 ${-210 + k * 40} Q 0 ${-196 + k * 40} 40 ${-210 + k * 40}`} stroke="#e9e2d0" strokeWidth={8} fill="none" />)}
    <ellipse cx={0} cy={-300} rx={66} ry={70} fill="#e9e2d0" stroke={P.ink} strokeWidth={7} />
    <ellipse cx={-24} cy={-306} rx={16} ry={mood === 'shock' ? 22 : 16} fill="#1a0e1a" /><ellipse cx={24} cy={-306} rx={16} ry={mood === 'shock' ? 22 : 16} fill="#1a0e1a" />
    <circle cx={-24} cy={-306} r={5} fill="#e8d84a" /><circle cx={24} cy={-306} r={5} fill="#e8d84a" />
    {mood === 'grin' ? <path d="M -34 -262 L 34 -262" stroke={P.ink} strokeWidth={6} /> : <ellipse cx={0} cy={-258} rx={14} ry={18} fill="#1a0e1a" />}
    {[-24, -12, 0, 12, 24].map((k) => <line key={k} x1={k} y1={-270} x2={k} y2={-254} stroke={P.ink} strokeWidth={3} />)}
    <path d="M -50 -360 C -70 -420 -20 -440 0 -400 C 20 -440 70 -420 50 -360" fill="#5a2a6a" stroke={P.ink} strokeWidth={6} />
  </g>
);

/* ===== scene components ===== */
type S = React.FC<{ t: number; T: number; d: number }>;

// OPEN
const O1: S = ({ t, T, d }) => <Frame cam={{ x: 960, y: pan(t, d, 600, 540), z: pan(t, d, 1.05, 1.25) }}><JungleBG T={T} tone="dawn" temples mist={.8} /><Birds T={T} x={300} y={260} n={6} /><Mist y={820} T={T} o={.6} /></Frame>;
const O2: S = ({ t, T }) => <Frame cam={{ z: 1.5, y: 640, x: 960 }}><Plaza T={T} /><rect x={560} y={820} width={800} height={40} fill="#8a5a3a" stroke={P.ink} strokeWidth={6} />
  <B><CacaoPile x={1180} y={830} s={1.1} n={45} /><Ch k="you" x={820} y={1010} s={1.2} T={T} p={{ holdF: 'bean', armF: -1.5, elbowF: 1.3, mouth: 'grin', turn: .5, lookX: 1, brow: 1 }} /></B>
  <Tag x={960} y={150} text="YOUR MONEY? CHOCOLATE." o={clamp((t - .2) * 3)} /></Frame>;
const O3: S = ({ t, T }) => <Frame cam={{ z: pan(t, 2, 1.5, 1.7), y: 520 }}><Compound T={T} tone="dawn" /><rect x={-400} y={-300} width={2720} height={1700} fill="rgba(30,20,10,.35)" /><B><Cradle x={960} y={560} s={1.5} T={T} rot={-4} /></B></Frame>;
const O4: S = ({ t, T }) => <Frame cam={{ z: 1.1 }}><NightSky T={T} /><g transform={`translate(960 430) rotate(${T * 8})`}>{Array.from({ length: 20 }).map((_, i) => { const a = i / 20 * 6.28; return <g key={i} transform={`translate(${Math.cos(a) * 320} ${Math.sin(a) * 320}) scale(.55) rotate(${-T * 8})`} opacity={clamp(t * 4 - i * .12)}><GlyphBlock x={0} y={0} seed={i + 1} c="#b5432a" /></g>; })}</g><B><Ch k="youKid" age={.5} x={960} y={1050} s={1.4} T={T} p={{ lookY: -1.6, mouth: 'O', turn: 0 }} /></B></Frame>;
const O5: S = ({ t, T, d }) => <Frame cam={{ x: pan(t, d, 700, 1100), y: 600, z: 1.3 }}><Plaza T={T} /><B><Ch k="trader" x={500} y={1000} T={T} seed={2} p={{ walk: 1, phase: T * 6, holdF: 'bundle', armF: -.3, turn: .8 }} /><Ch k="mom" x={1500} y={1010} T={T} seed={3} p={{ holdF: 'jar', armF: -.5, elbowF: 1.4, turn: -.5 }} flip /><Ch k="you" x={pan(t, d, 700, 1150)} y={1050} s={1.15} T={T} p={{ walk: 1, phase: T * 6.5, turn: .8, mouth: 'grin' }} /></B></Frame>;
const O6: S = ({ t, T, d }) => <Frame cam={{ z: pan(t, d, 1.0, 1.25), y: 560 }}><JungleBG T={T} tone="day" mist={.3} /><Pyramid x={960} y={860} s={1.1} ruin={easeInOut(clamp(t / d * 1.2))} /><Canopy y={980} seed={12} color="#2f5a38" r={140} T={T} /></Frame>;
const O7: S = ({ t, T }) => <Frame cam={{ z: 1.6, y: 620 }}><JungleBG T={T} tone="day" /><Ground y={900} c="#d9c49a" /><B><Ch k="todayKid" x={960} y={1060} s={1.4} age={.6} T={T} p={{ mouth: t > 1 ? 'grin' : 'smile', turn: 0, armF: -2.4 + Math.sin(T * 8) * .3, elbowF: .4 }} /></B></Frame>;

// CH1 birth
const B1: S = ({ t, T }) => <Frame cam={{ x: pan(t, 5, 960, 1020), y: pan(t, 5, 540, 600), z: pan(t, 5, 1, 2.2) }}><MayaMap T={T} highlight={['TIKAL']} dots={clamp(t)} /></Frame>;
const B2: S = ({ t, T, d }) => <Frame cam={{ x: 1300, y: 600, z: pan(t, d, 1.3, 1.5) }}><Compound T={T} tone="dawn" /><B><Ch k="mom" x={1380} y={890} s={1.2} T={T} p={{ armF: -1.1, armB: .9, elbowF: 1.2, turn: .4, tilt: 6, mouth: 'smile', lookX: 1, lookY: 1.2 }} /><g transform="translate(1470 690) scale(.55) rotate(-70)"><Cradle x={0} y={0} T={T} /></g><Ch k="dad" x={1660} y={900} s={1.1} T={T} seed={2} p={{ mouth: 'grin', turn: -.5 }} flip /></B></Frame>;
const B3: S = ({ t, T }) => <Frame cam={{ z: 2.0, y: 560, x: 960 }}><Interior wall="#a8683e" floor="#8a6a42" /><B><g transform={`translate(960 600) rotate(${-90 + easeInOut(clamp(t / 2)) * 90})`}><Cradle x={0} y={0} s={1.3} T={T} /></g></B></Frame>;
const B4: S = ({ t, T }) => { const m = easeInOut(clamp((t - .6) / 2.4)); return <Frame><rect x={0} y={0} width={1920} height={1080} fill="#efe2c6" /><Txt x={960} y={140} s={58}>HEAD SHAPING</Txt>
  <B><g transform="translate(700 620)"><path d={`M -150 0 C -170 -120 ${-140 - m * 60} ${-220 - m * 90} ${-40 - m * 50} ${-260 - m * 70} C 60 -280 160 -200 150 -60 C 150 60 60 120 0 120 C -100 120 -140 80 -150 0 Z`} fill={C('baby').skin} stroke={P.ink} strokeWidth={8} /><circle cx={60} cy={-60} r={12} fill={P.ink} /><path d="M 30 20 q 30 16 60 0" stroke={P.ink} strokeWidth={6} fill="none" />
    <rect x={-210 - m * 30} y={-300} width={34} height={360} rx={10} fill="#9a7650" stroke={P.ink} strokeWidth={6} transform={`rotate(${-12 - m * 10} -190 -120)`} />
    <rect x={-70} y={-330 - m * 40} width={220} height={30} rx={10} fill="#c8a878" stroke={P.ink} strokeWidth={6} transform="rotate(12 40 -310)" /></g></B>
  <g opacity={clamp((t - 1.2) * 2)}><path d="M 1000 560 L 1180 560" stroke={P.ink} strokeWidth={10} markerEnd="" /><path d="M 1180 530 L 1230 560 L 1180 590 Z" fill={P.ink} /><Txt x={1500} y={520} s={42}>BOARDS + WRAPS</Txt><Txt x={1500} y={590} s={42}>OVER MONTHS</Txt><Txt x={1500} y={700} s={26} f="Mono" c="#7a5a3a">GENTLE, GRADUAL PRESSURE*</Txt></g>
  <Txt x={960} y={1020} s={22} f="Mono" c="#7a5a3a">*cradleboards & head binding in infancy (Tiesler, studies of Maya cranial modification)</Txt></Frame>; };
const B5: S = ({ t, T }) => <Frame cam={{ x: 1100, y: 640, z: 1.6 }}><Compound T={T} tone="day" /><B><Ch k="mom" x={1000} y={900} s={1.1} T={T} p={{ armF: -.6, elbowF: 1, turn: .5, mouth: 'smile' }} /><Ch k="youKid" age={lerp(.25, .45, clamp(t / 4))} x={1200} y={905} s={1.1} T={T} seed={2} p={{ mouth: 'grin', turn: -.3, walk: .5, phase: T * 5 }} /></B></Frame>;
const B6: S = ({ t, T }) => <Frame cam={{ z: 1.3, y: 600 }}><Plaza T={T} /><B>{[['dad', 560], ['aunt', 820], ['trader', 1100], ['cousin', 1360]].map(([k, x]: any, i) => <Ch key={i} k={k} x={x} y={1000} s={1.1} T={T} seed={i} p={{ mouth: 'smile', turn: (i - 1.5) * -.2 }} />)}</B>
  {[560, 820, 1100, 1360].map((x, i) => <circle key={i} cx={x} cy={600 - (i % 2) * 20} r={18 + Math.sin(T * 3 + i) * 4} fill="#fff6c8" opacity={clamp((t - 1) * 2) * .8} />)}
  <Tag x={960} y={240} text="A SIGN OF BELONGING" o={clamp((t - .5) * 3)} /></Frame>;
const B7: S = ({ t, T }) => <Frame><CalendarGears t={t} T={T} /></Frame>;
const B8: S = ({ t, T }) => <Frame cam={{ z: 1.5, y: 640 }}><Compound T={T} tone="dusk" smoke={.8} /><Stars T={T} n={50} /><B><Ch k="youKid" age={.35} x={960} y={900} s={1.2} T={T} p={{ lookY: -1.5, mouth: 'O', turn: 0, armF: -2.6, elbowF: .2 }} /></B></Frame>;

// CH2 home
const H1: S = ({ t, T, d }) => <Frame cam={{ x: pan(t, d, 800, 1100), y: 560, z: pan(t, d, 1.05, 1.2) }}><Compound T={T} tone="day" /><B><Dog x={760} y={880} s={.7} T={T} /><Turkey x={1240} y={880} s={.6} T={T} flip /></B><g opacity={clamp((t - .8) * 3)}><Tag x={960} y={200} text="RAISED STONE PLATFORM" /></g></Frame>;
const H2: S = ({ t, T }) => <Frame cam={{ z: 1.2, y: 560 }}><Compound T={T} tone="day" /><rect x={-400} y={-300} width={2720} height={1700} fill="rgba(60,80,110,.35)" /><Rain T={T} /><B><Ch k="youKid" age={.45} x={1450} y={790} s={1} T={T} p={{ mouth: 'grin', lookY: -1, armF: -2.2, elbowF: .3 }} /></B></Frame>;
const H3: S = ({ t, T, d }) => { const fam: [string, number, number][] = [['grandma', 1.4, 300], ['dad', 1, 560], ['mom', 1, 820], ['youKid', .45, 1060], ['aunt', 1, 1300], ['cousin', .55, 1560]];
  return <Frame cam={{ x: pan(t, d, 750, 1150), y: 760, z: 1.2 }}><Interior wall="#a8683e" floor="#8a6a42" /><rect x={-200} y={950} width={2400} height={60} fill="#c9a24e" stroke={P.ink} strokeWidth={6} /><B>{fam.map(([k, a, x], i) => <Ch key={i} k={k} age={a} x={x} y={1000} T={T} seed={i} p={{ kneel: i % 2 ? 1 : .6, mouth: i % 3 === 0 ? 'talk' : 'smile', open: talk(T + i), turn: (i - 2.5) * -.15 }} />)}</B><Fire x={960} y={1000} s={.4} t={T} /></Frame>; };
const H4: S = ({ t, T }) => { const bark = Math.sin(T * 10) > .2; return <Frame cam={{ z: 1.6, x: 900, y: 700 }}><Compound T={T} /><B><Dog x={760} y={900} s={1.2} T={T} />{bark && <Txt x={760} y={640} s={60} c="#b5432a">WOOF!</Txt>}<Turkey x={pan(t, 3.8, 1500, 1200)} y={900} s={1} T={T} flip /><Turkey x={pan(t, 3.8, 1700, 1420)} y={920} s={.9} T={T + .5} flip /></B></Frame>; };
const H5: S = ({ t, T }) => <Frame cam={{ z: pan(t, 4.2, 1.5, 1.9), x: 1450, y: 520 }}><Compound T={T} tone="dusk" smoke={1} /><B><Fire x={1300} y={800} s={.5} t={T} /><Ch k="mom" x={1180} y={810} s={.9} T={T} p={{ kneel: 1, armF: -.8, elbowF: 1.2, turn: .7 }} /></B></Frame>;
const H6: S = ({ t, T }) => { const cut = easeInOut(clamp(t / 1.5)); return <Frame cam={{ z: 1.1, y: 560 }}>
  <SkyG id="h6" top="#e6d2a8" bottom="#f2e4c4" /><Hut x={960} y={600} s={1.2} /><rect x={-400} y={600} width={2720} height={900} fill="#9a7650" />
  <rect x={300} y={600} width={1320} height={22} fill="#d6c4a0" stroke={P.ink} strokeWidth={6} />
  <g opacity={cut}><rect x={420} y={680} width={1080} height={300} rx={30} fill="#6e5236" stroke={P.ink} strokeWidth={6} strokeDasharray="20 14" />
    <B><g transform="translate(960 830)"><ellipse cx={0} cy={0} rx={380} ry={80} fill="#5a4230" /><circle cx={-280} cy={-10} r={44} fill="#e9e2d0" stroke={P.ink} strokeWidth={6} /><circle cx={-292} cy={-16} r={8} fill={P.ink} /><circle cx={-266} cy={-16} r={8} fill={P.ink} />
      <path d="M -230 0 L 260 0 M -100 -30 L -100 30 M 0 -30 L 0 30 M 100 -30 L 100 30 M 260 -10 L 300 30 M 260 10 L 310 -20" stroke="#e9e2d0" strokeWidth={14} strokeLinecap="round" />
      {[-140, 60].map((k) => <circle key={k} cx={k} cy={-40} r={10} fill="#2f9a6a" stroke={P.ink} strokeWidth={3} />)}</g></B></g>
  <B><Ch k="youKid" age={.45} x={760} y={600} s={.9} T={T} p={{ lookY: 1.6, mouth: 'O' }} /><Ch k="grandma" age={1.4} x={1160} y={600} s={.9} T={T} seed={2} p={{ lookY: 1.4, mouth: 'smile' }} flip /></B>
  <Tag x={960} y={150} text="ANCESTORS BENEATH THE FLOOR" o={clamp((t - 1) * 3)} /></Frame>; };
const H7: S = ({ t, T }) => <Frame cam={{ z: 1.35, y: 620 }}><Interior wall="#a8683e" floor="#8a6a42" glow={1.2} /><Fire x={960} y={1000} s={.45} t={T} />
  <g opacity={.55}>{[[620, 1.3], [1300, 1.2]].map(([x, a]: any, i) => <MChar key={i} look={C(i ? 'dad' : 'grandma')} x={x} y={900 + Math.sin(T + i) * 10} s={1.1} age={a} opacity={.5} pose={{ mouth: 'smile', blink: 1 }} />)}</g>
  <B><Ch k="grandma" age={1.4} x={820} y={1000} s={1.15} T={T} p={{ mouth: 'smile', armF: -1, elbowF: .6, turn: .5 }} /><Ch k="youKid" age={.45} x={1080} y={1000} s={1.15} T={T} seed={3} p={{ mouth: 'smile', armF: -1, turn: -.4 }} flip /></B></Frame>;

// CH3 city
const C1: S = ({ t, T, d }) => <Frame cam={{ x: pan(t, d, 400, 960), y: pan(t, d, 760, 520), z: pan(t, d, 1.8, 1.05) }}><Plaza T={T} tone="dawn" /><B><Ch k="you" age={.85} x={pan(t, d, 380, 640)} y={1000} s={1.1} T={T} p={{ walk: 1, phase: T * 6, turn: .8, mouth: 'O', lookY: -1.2 }} /></B></Frame>;
const C2: S = ({ t, T, d }) => <Frame cam={{ x: 960, y: pan(t, d, 380, 520), z: pan(t, d, 1.4, 1.1) }}><Plaza T={T} /><Birds T={T} x={200} y={200} n={7} /></Frame>;
const C3: S = ({ t, T }) => <Frame cam={{ z: 1.25, y: 640, x: pan(t, 3.3, 860, 1060) }}><Plaza T={T} /><B>
  <Ch k="trader" x={420} y={1010} T={T} seed={1} p={{ holdF: 'bundle', armF: -.4, turn: .7, mouth: 'talk', open: talk(T) }} />
  <Ch k="priest" x={760} y={1000} T={T} seed={2} p={{ mouth: 'flat', armF: -1.8, elbowF: .3, turn: .3 }} />
  <Ch k="aunt" x={1060} y={1010} T={T} seed={3} p={{ holdF: 'jar', armF: -.4, elbowF: 1.3, turn: -.3, mouth: 'smile' }} />
  <g transform={`translate(1380 1010)`}><Ch k="cousin" x={0} y={0} T={T} seed={4} p={{ armF: -1.3 + Math.abs(Math.sin(T * 8)) * .5, elbowF: 1.2, mouth: 'grin', turn: -.4 }} flip /><rect x={40} y={-170} width={70} height={90} rx={10} fill="#8a5a3a" stroke={P.ink} strokeWidth={6} /><ellipse cx={75} cy={-170} rx={35} ry={10} fill="#d9c49a" stroke={P.ink} strokeWidth={5} /></g>
  <Ch k="dad" x={1640} y={1020} T={T} seed={5} p={{ walk: 1, phase: T * 6, turn: -.8 }} flip /></B></Frame>;
const C4: S = ({ t }) => <Frame><PopDots t={t} /></Frame>;
const C5: S = ({ t, T }) => <Frame><SocialPyramid t={t} T={T} /></Frame>;
const C6: S = ({ t, T }) => <Frame cam={{ z: 1.5, y: 640 }}><MilpaBG T={T} /><B><Ch k="you" x={960} y={960} s={1.2} T={T} p={{ mouth: 'grin', armF: -1.3, armB: 1.0, elbowF: .9, turn: 0, tilt: Math.sin(T * 2) * 4, brow: 1 }} /></B><Tag x={960} y={220} text="PROBABLY... A FARMER" o={clamp((t - .4) * 3)} /></Frame>;
const C7: S = ({ t, T }) => <Frame cam={{ z: pan(t, 5.6, 1.0, 1.3), x: 960, y: 560 }}><MayaMap T={T} highlight={['TIKAL']} routes={clamp(t / 3)} />
  {[['SALT', 600, 480], ['OBSIDIAN', 1500, 330], ['JADE', 1080, 960]].map(([n, x, y]: any, i) => <g key={n} opacity={clamp((t - 1 - i * .6) * 3)}><rect x={x - 110} y={y - 50} width={220} height={66} rx={14} fill={P.ink} /><Txt x={x} y={y} s={36} c="#ffb347">{n}</Txt></g>)}</Frame>;
const C8: S = ({ t, T }) => { const items = [0, 1, 2]; const k = Math.min(2, Math.floor(t / 2.6)); return <Frame cam={{ z: 1.5, y: 600 }}><Interior wall="#7a4a2e" floor="#c9a878" />
  <B>{k === 0 && <g transform="translate(960 760)">{[-200, 0, 200].map((x, i) => <path key={i} d={`M ${x - 70} 0 L ${x} -200 L ${x + 70} 0 Z`} fill="#f4f0e8" stroke={P.ink} strokeWidth={7} />)}<Txt x={0} y={140} s={60}>SALT</Txt></g>}
  {k === 1 && <g transform="translate(960 760)">{[-160, 0, 160].map((x, i) => <path key={i} d={`M ${x - 30} 0 L ${x - 10} -230 L ${x + 30} -10 Z`} fill="#20242c" stroke="#8a9aaa" strokeWidth={6} />)}<Txt x={0} y={140} s={60}>OBSIDIAN BLADES</Txt></g>}
  {k === 2 && <g transform="translate(960 760)">{[-160, 0, 160].map((x, i) => <g key={i}><circle cx={x} cy={-90} r={70} fill="#2f9a6a" stroke={P.ink} strokeWidth={7} /><circle cx={x - 20} cy={-110} r={18} fill="#8ad0a8" /></g>)}<Txt x={0} y={140} s={60}>JADE</Txt></g>}</B></Frame>; };
const C9: S = ({ t, T, d }) => <Frame cam={{ x: pan(t, d, 700, 1200), z: 1.3, y: 600 }}><JungleBG T={T} px={-t * 40} /><Ground y={900} c="#a88a5a" /><B>
  {[0, 1, 2].map((i) => <g key={i}><Ch k={i % 2 ? 'trader' : 'cousin'} x={500 + i * 330 + t * 70} y={960 + (i % 2) * 20} s={1} T={T} seed={i} p={{ walk: 1, phase: T * 5 + i, turn: .8, lean: 8, mouth: 'flat', brow: -1 }} /><g transform={`translate(${430 + i * 330 + t * 70} ${760 + (i % 2) * 20})`}><rect x={-60} y={-80} width={110} height={130} rx={16} fill="#c9a24e" stroke={P.ink} strokeWidth={6} /><path d="M 40 -60 Q 90 -100 70 -170" stroke="#8a6a3a" strokeWidth={6} fill="none" /></g></g>)}</B>
  <Tag x={960} y={200} text="NO HORSES · NO OXEN · NO CARTS" o={clamp((t - 1) * 3)} /></Frame>;

// CH4 maize
const M1: S = ({ t, T }) => { const fig = easeOut(clamp((t - 2) / 2)); return <Frame cam={{ z: 1.4, y: 600 }}><MilpaBG T={T} tone="dawn" /><rect x={-400} y={-300} width={2720} height={1700} fill="rgba(255,200,120,.15)" />
  <B>{[0, 1, 2].map((i) => <g key={i} transform={`translate(${740 + i * 220} 900)`}><g opacity={1 - fig} transform="scale(1.6)"><ellipse cx={0} cy={-60} rx={30} ry={70} fill="#e8c34a" stroke={P.ink} strokeWidth={5} /></g><g opacity={fig}><MChar look={{ ...C('cousin'), skin: '#e8c34a', skinS: '#c99a2a', cloth: '#e8dca0', head: 'none' }} x={0} y={0} s={.9 * (.6 + .4 * fig)} pose={{ mouth: 'grin', armF: -2.4, elbowF: .3, blink: blink(T, i) }} /></g></g>)}</B>
  <Tag x={960} y={220} text="PEOPLE MADE OF MAIZE" o={clamp((t - .5) * 3)} /><UI><Txt x={960} y={1050} s={22} f="Mono" c="#f2e7d0">*K'iche' Maya creation story (Popol Vuh)</Txt></UI></Frame>; };
const M2: S = ({ t, T }) => <Frame cam={{ z: 1.6, y: 560 }}><MilpaBG T={T} /><B><MChar look={{ ...C('you'), stripe: false, head: 'feathers', collar: 'jade', outfit: 'royal', cloth: '#e8c34a', cape: undefined, jadeTeeth: false }} x={960} y={930} s={1.2} pose={{ armF: -2 + Math.sin(T * 3) * .4, armB: 1.6 - Math.sin(T * 3) * .3, elbowF: .6, mouth: 'smile', tilt: Math.sin(T * 3) * 6, bob: Math.abs(Math.sin(T * 3)) * -10, blink: blink(T, 4) }} /></B>
  <Tag x={960} y={150} text="THE MAIZE GOD" o={clamp((t - .4) * 3)} /></Frame>;
const M3: S = ({ t, T }) => <Frame cam={{ z: 1.7, y: 700 }}><MilpaBG T={T} /><B>{[-1, 0, 1].map((k) => <g key={k}><path d={`M ${960 + k * 300} 900 C ${980 + k * 300} 820 ${940 + k * 300} 760 ${970 + k * 300} 660`} stroke="#3f7a2a" strokeWidth={8} fill="none" />{[0, 1, 2].map((j) => <ellipse key={j} cx={968 + k * 300 + (j % 2 ? 20 : -20)} cy={860 - j * 70} rx={18} ry={10} fill="#5f9a3a" stroke={P.ink} strokeWidth={4} />)}</g>)}<Squash x={820} y={940} s={1} /><Squash x={1150} y={950} s={.9} /></B>
  {[['MAIZE', 640, 560], ['BEANS', 1000, 520], ['SQUASH', 1320, 820]].map(([n, x, y]: any, i) => <g key={n} opacity={clamp((t - .3 - i * .5) * 3)}><rect x={x - 100} y={y - 44} width={200} height={62} rx={14} fill={P.ink} /><Txt x={x} y={y} s={34} c="#ffb347">{n}</Txt></g>)}</Frame>;
const M4: S = ({ t, T }) => <Frame cam={{ z: 1.6, y: 700, x: 960 }}><Compound T={T} tone="dawn" /><B><Metate x={760} y={960} s={1.2} T={T} /><Ch k="mom" x={620} y={990} s={1.1} T={T} p={{ kneel: 1, lean: 14 + Math.sin(T * 4) * 6, armF: -1.2 + Math.sin(T * 4) * .3, elbowF: .6, turn: .8, mouth: 'flat' }} /><Metate x={1220} y={960} s={1.1} T={T + 1} /><Ch k="aunt" x={1080} y={990} s={1.05} T={T} seed={3} p={{ kneel: 1, lean: 14 + Math.sin(T * 4 + 1) * 6, armF: -1.2 + Math.sin(T * 4 + 1) * .3, elbowF: .6, turn: .8, mouth: 'talk', open: talk(T) }} /></B>
  <UI><g opacity={clamp((t - 2.5) * 3)}><circle cx={1640} cy={200} r={90} fill="#f2e7d0" stroke={P.ink} strokeWidth={7} /><line x1={1640} y1={200} x2={1640 + Math.cos(T * 4) * 60} y2={200 + Math.sin(T * 4) * 60} stroke={P.ink} strokeWidth={8} strokeLinecap="round" /><line x1={1640} y1={200} x2={1640} y2={150} stroke="#b5432a" strokeWidth={8} strokeLinecap="round" /></g></UI><Tag x={1500} y={380} text="HOURS · EVERY DAY" o={clamp((t - 2.5) * 3)} /></Frame>;
const M5: S = ({ t, T }) => { const k = Math.min(2, Math.floor(t / 2.7)); return <Frame cam={{ z: 1.45, y: 660 }}>{k === 1 ? <MilpaBG T={T} /> : <Compound T={T} />}<B>
  {k === 0 && <Ch k="youKid" age={.5} x={pan(t, 2.7, 500, 1300)} y={960} s={1.15} T={T} p={{ walk: 1, phase: T * 5, holdF: 'jar', armF: -2.9, elbowF: .2, turn: .8, lean: 6, mouth: 'flat', brow: -.5 }} />}
  {k === 1 && <><Ch k="youKid" age={.5} x={900} y={960} s={1.15} T={T} p={{ armF: -2.6 + Math.sin(T * 10) * .5, armB: 2.4 - Math.sin(T * 10) * .5, elbowF: .3, mouth: 'shout', turn: .3, bob: -Math.abs(Math.sin(T * 10)) * 20 }} /><Birds T={T * 1.5} x={1000} y={420} n={4} /></>}
  {k === 2 && <><Ch k="youKid" age={.5} x={pan(t - 5.4, 2.6, 1400, 700)} y={960} s={1.15} T={T} flip p={{ walk: 1, phase: T * 5, turn: .8, holdF: 'bundle', armF: -2.8, elbowF: .3, lean: 8, mouth: 'flat' }} /></>}</B>
  <Tag x={960} y={200} text={['CARRYING WATER', 'GUARDING THE FIELD', 'GATHERING FIREWOOD'][k]} /></Frame>; };
const M6: S = ({ t, T }) => <Frame cam={{ z: 1.2, y: 580 }}><Interior wall="#a8683e" floor="#8a6a42" /><B>
  {[[640, 'TAMALES'], [960, 'MAIZE PORRIDGE'], [1280, 'CHILI']].map(([x, n]: any, i) => { const a = spring(prog(t, i * .6, i * .6 + .5), 10, .45); return <g key={i} transform={`translate(${x} 720) scale(${a})`}>
    <ellipse cx={0} cy={40} rx={150} ry={40} fill="#b8763e" stroke={P.ink} strokeWidth={7} />
    {i === 0 && [-50, 0, 50].map((k) => <path key={k} d={`M ${k - 30} 20 L ${k} -60 L ${k + 30} 20 Z`} fill="#c9b060" stroke={P.ink} strokeWidth={5} />)}
    {i === 1 && <ellipse cx={0} cy={20} rx={110} ry={26} fill="#f0e2b0" stroke={P.ink} strokeWidth={5} />}
    {i === 2 && [-40, 10, 50].map((k) => <path key={k} d={`M ${k} 20 C ${k - 10} -40 ${k + 20} -60 ${k + 30} -40`} stroke="#c93a2e" strokeWidth={22} fill="none" strokeLinecap="round" />)}
    <Txt x={0} y={160} s={36}>{n}</Txt></g>; })}</B></Frame>;
const M7: S = ({ t, T }) => { const pourY = 300 + Math.sin(T * 2) * 30; return <Frame cam={{ z: 1.45, y: 600 }}><Interior wall="#b04a36" floor="#c9a878" /><B>
  <Ch k="queen" x={760} y={1010} s={1.1} T={T} p={{ holdF: 'cup', armF: -2.9, elbowF: .1, holdB: 'cup', armB: .2, turn: .6, mouth: 'smile', lookY: 1 }} />
  <path d={`M 840 ${pourY + 40} C 850 ${pourY + 200} 840 ${pourY + 350} 850 760`} stroke="#5a2e1a" strokeWidth={10} fill="none" />
  {[0, 1, 2, 3].map((k) => <circle key={k} cx={850 + Math.sin(T * 9 + k) * 14} cy={760 - k * 8} r={10 - k * 2} fill="#d8b890" />)}
  <Ch k="king" x={1260} y={1010} s={1.1} T={T} seed={2} p={{ holdF: 'cup', armF: -1.5, elbowF: 1.3, mouth: t > 3 ? 'grin' : 'flat', turn: -.4 }} flip /></B>
  <Tag x={960} y={180} text="BITTER · FROTHY · FOR NOBLES" o={clamp((t - .6) * 3)} /></Frame>; };
const M8: S = ({ t, T }) => <Frame cam={{ z: 1.4, y: 640 }}><Plaza T={T} /><rect x={480} y={760} width={960} height={40} fill="#8a5a3a" stroke={P.ink} strokeWidth={6} /><path d="M 460 560 L 960 480 L 1460 560 Z" fill="#c93a2e" stroke={P.ink} strokeWidth={7} />
  <B><CacaoPile x={760} y={760} s={1} n={40} /><Ch k="trader" x={1160} y={1010} s={1.1} T={T} p={{ holdF: 'bean', armF: -1.4 + Math.sin(T * 6) * .2, elbowF: 1.2, mouth: 'talk', open: talk(T), turn: -.4 }} flip />
    <Ch k="aunt" x={560} y={1010} s={1.05} T={T} seed={3} p={{ holdF: 'pod', armF: -1.2, elbowF: 1, turn: .6, mouth: 'smile' }} /></B>
  <Tag x={960} y={210} text="CACAO AS MONEY · BY THE 8TH CENTURY*" o={clamp((t - .4) * 3)} /><UI><Txt x={960} y={1050} s={22} f="Mono" c="#f2e7d0">*evidence from Classic Maya art and tribute scenes (Baron, 2018)</Txt></UI></Frame>;
const M9: S = ({ t, T }) => { const sneak = t > 3.3; return <Frame cam={{ z: sneak ? 1.75 : 1.4, y: sneak ? 720 : 680, x: sneak ? 960 : 960 }}><Plaza T={T} /><rect x={480} y={760} width={960} height={40} fill="#8a5a3a" stroke={P.ink} strokeWidth={6} />
  <B><Ch k="trader" x={1240} y={1010} s={1.1} T={T} p={{ holdF: 'cup', armF: -1.2, elbowF: 1.2, mouth: 'smile', turn: -.4 }} flip />
    <Ch k="you" x={900} y={1010} s={1.15} T={T} seed={2} p={sneak ? { holdF: 'bean', armF: -2.0, elbowF: 2.0, mouth: 'O', lookX: -1, brow: 1.2, turn: .3 } : { holdF: 'bean', armF: -1.3, elbowF: .9, mouth: 'grin', turn: .7 }} /></B>
  {sneak && <Tag x={960} y={160} text="...JUST ONE." />}</Frame>; };

// CH5 ballgame
const Court: React.FC<{ T: number; crowd?: number }> = ({ T, crowd = 1 }) => (
  <g>
    <JungleBG T={T} tone="day" mist={.2} />
    <path d="M -200 620 L 700 620 L 820 900 L -200 900 Z" fill="#d9c49a" stroke={P.ink} strokeWidth={7} />
    <path d="M 2120 620 L 1220 620 L 1100 900 L 2120 900 Z" fill="#d9c49a" stroke={P.ink} strokeWidth={7} />
    <path d="M -200 560 L 680 560 L 700 620 L -200 620 Z M 2120 560 L 1240 560 L 1220 620 L 2120 620 Z" fill="#c0503a" stroke={P.ink} strokeWidth={7} />
    <rect x={-200} y={900} width={2320} height={400} fill="#e2d2b0" />
    {crowd > 0 && <B>{Array.from({ length: 16 }).map((_, i) => { const left = i < 8; const x = left ? 40 + i * 80 : 1300 + (i - 8) * 80; const ks = ['cousin', 'aunt', 'dad', 'trader', 'mom', 'youKid']; return <MChar key={i} look={C(ks[i % 6])} x={x} y={560 + Math.abs(Math.sin(T * 6 + i)) * -10 * crowd} s={.5} age={ks[i % 6] === 'youKid' ? .5 : 1} pose={{ armF: -2.5 + Math.sin(T * 7 + i) * .4 * crowd, elbowF: .3, mouth: crowd > .5 ? 'shout' : 'smile', turn: left ? .4 : -.4, blink: blink(T, i) }} flip={!left} />; })}</B>}
  </g>
);
const G1: S = ({ t, T }) => { const bx = 960 + Math.sin(T * 1.6) * 260, by = 820 - Math.abs(Math.sin(T * 3.2)) * 260; return <Frame cam={{ z: pan(t, 6, 1.0, 1.15), y: 600 }}><Court T={T} /><B><Ch k="player" x={760} y={1000} s={1} T={T} p={{ mouth: 'shout', armF: -1.4, armB: 1, lean: -10, turn: .7, crouch: .5 }} /><Ch k="player2" x={1180} y={1000} s={1} T={T} seed={2} p={{ mouth: 'shout', armF: -1.4, armB: 1, lean: -10, turn: .7, crouch: .5 }} flip /><Ball x={bx} y={by} spin={T * 400} /></B></Frame>; };
const G2: S = ({ t, T }) => { const hit = (t % 2) > 1.5; const k = spring(prog(t % 2, 1.5, 1.8), 12, .4); return <Frame cam={{ z: 2.0, y: 760, x: 960 }}><Court T={T} crowd={0} /><B><Ch k="player" x={960} y={1000} s={1.2} T={T} p={{ mouth: hit ? 'shout' : 'flat', brow: -1.5, lean: hit ? -18 : -4, armF: .6, armB: .9, elbowF: .2, turn: .9, crouch: .6 }} /><Ball x={hit ? 1060 + k * 420 : 1560 - (t % 2) * 330} y={hit ? 880 - k * 320 : 880} spin={T * 500} />
  {hit && k < .6 && <path transform="translate(-40 110)" d="M 1060 760 l 20 -60 l 20 60 l 60 -20 l -60 40 l 60 20 l -60 0 l 20 60 l -40 -40 l -40 40 l 10 -60 l -60 0 l 60 -20 l -60 -40 Z" fill="#ffd166" stroke={P.ink} strokeWidth={5} />}</B>
  <Tag x={960} y={240} text="NO HANDS · HIPS ONLY" o={clamp((t - .3) * 3)} /></Frame>; };
const G3: S = ({ t, T }) => <Frame cam={{ z: 1.6, y: 520, x: 700 }}><Court T={T} crowd={1} /><B><Ch k="youKid" age={.6} x={600} y={620} s={1} T={T} p={{ armF: -2.7, armB: 2.6, elbowF: .2, mouth: 'shout', bob: -Math.abs(Math.sin(T * 8)) * 20 }} /></B>
  {t > 3 && [0, 1, 2].map((k) => <Txt key={k} x={1000 + k * 120} y={300 - Math.sin(T * 3 + k) * 20} s={110} c="#b5432a">?</Txt>)}</Frame>;
const G4: S = ({ t, T }) => <Frame cam={{ z: 1.4, y: 560 }}><Court T={T} crowd={.5} /><B><Ch k="king" x={960} y={560} s={1.1} T={T} p={{ mouth: 'flat', armF: -.6, elbowF: 1.4, turn: 0 }} /></B>
  <g opacity={clamp((t - 3.5) * 2)}><rect x={-200} y={-200} width={2320} height={1480} fill="rgba(20,10,30,.55)" /><Txt x={960} y={520} s={66} c="#f2e7d0">SPORT · POLITICS · RELIGION</Txt><Txt x={960} y={610} s={36} f="Mono" c="#ffb347">A REPLAY OF THE GODS' OWN MYTHS</Txt></g></Frame>;

// CH6 fear
const F1: S = ({ t, T }) => { const k = Math.min(3, Math.floor(t / 1.4)); return <Frame cam={{ z: 1.5, y: 620 }}><JungleBG T={T} tone="night" mist={.15} />
  <B>{k === 0 && <><Jaguar x={1200} y={860} s={1.6} T={T} eyesOnly /><Jaguar x={700} y={760} s={1.2} T={T + 1} eyesOnly /></>}{k === 1 && <Snake x={960} y={880} s={1.6} T={T} />}
  {k >= 2 && <Ch k="youKid" age={.5} x={960} y={960} s={1.3} T={T} p={{ mouth: k === 2 ? 'sad' : 'O', brow: 2, tilt: Math.sin(T * 20) * 2, armF: -1.2, armB: -1.2, elbowF: 1.6, elbowB: 1.6 }} />}</B>
  <Tag x={960} y={200} text={['JAGUARS', 'SNAKES', 'FEVER', 'HUNGER'][k]} /></Frame>; };
const F2: S = ({ t, T }) => <Frame cam={{ z: pan(t, 8.5, 1.0, 1.2), y: 560 }}><Xibalba T={T} /><B><DeathLord x={560} y={900} s={1.1} T={T} /><DeathLord x={960} y={880} s={1.25} T={T + 1} /><DeathLord x={1360} y={900} s={1.1} T={T + 2} /></B><Tag x={960} y={180} text="XIBALBA · THE UNDERWORLD" o={clamp((t - .6) * 3)} c="#3a1a3a" /></Frame>;
const F3: S = ({ t, T }) => { const win = t > 4.5; const bx = 960 + Math.sin(T * 2) * 300, by = 760 - Math.abs(Math.sin(T * 4)) * 200; return <Frame cam={{ z: 1.15, y: 560 }}><Xibalba T={T} /><B>
  <DeathLord x={1500} y={900} s={.9} T={T} mood={win ? 'shock' : 'grin'} /><DeathLord x={1720} y={920} s={.8} T={T + 1} mood={win ? 'shock' : 'grin'} />
  <Ch k="player" x={360} y={1000} s={1} T={T} p={{ mouth: win ? 'grin' : 'shout', armF: win ? -2.7 : -1.4, elbowF: .2, crouch: win ? 0 : .5, turn: .7, bob: win ? -Math.abs(Math.sin(T * 8)) * 30 : 0 }} />
  <Ch k="player2" x={620} y={1000} s={1} T={T} seed={2} p={{ mouth: win ? 'grin' : 'shout', armF: win ? -2.7 : -1.4, elbowF: .2, crouch: win ? 0 : .5, turn: .7, bob: win ? -Math.abs(Math.sin(T * 8 + 1)) * 30 : 0 }} />
  {!win && <Ball x={bx} y={by} spin={T * 400} />}</B>
  <Tag x={960} y={200} text={win ? 'THE HERO TWINS WIN' : 'THE HERO TWINS'} /></Frame>; };

// CH7 sky
const K1: S = ({ t, T, d }) => <Frame cam={{ z: pan(t, d, 1.0, 1.4), y: pan(t, d, 520, 420), x: 1100 }}><NightSky T={T} /><Pyramid x={1100} y={1180} s={1.1} c="#4a3a3a" c2="#6a6a62" /><B><Ch k="priest" x={1100} y={540} s={.9} T={T} p={{ lookY: -1.6, armF: -2.4, elbowF: .3, mouth: 'O', turn: .2 }} /></B></Frame>;
const K2: S = ({ t, T }) => <Frame><NightSky T={T} venus={clamp(t * 2)} /><g opacity={clamp((t - 1.6) * 3)}><circle cx={500} cy={300} r={90} fill="#ffd070" /><circle cx={500 + clamp((t - 1.6) / 2) * 60} cy={300} r={88} fill="#0d1630" /><Txt x={500} y={460} s={34} f="Mono" c="#fff2c0">ECLIPSES</Txt></g>
  <g opacity={clamp((t - 3) * 3)}>{['RAIN', 'DRY', 'PLANT', 'HARVEST'].map((n, i) => <g key={n} transform={`translate(${800 + i * 140} 820)`}><circle r={52} fill={['#3f7a8a', '#d9a441', '#5f9a3a', '#e0a838'][i]} stroke={P.ink} strokeWidth={5} /><Txt x={0} y={90} s={24} f="Mono" c="#fff2c0">{n}</Txt></g>)}</g>
  <B><Ch k="priest" x={1700} y={1080} s={1} T={T} p={{ armF: -2.2, elbowF: .2, lookY: -1.4, mouth: 'talk', open: talk(T) }} flip /></B></Frame>;
const K3: S = ({ t }) => <Frame><Numerals t={t} /></Frame>;
const K4: S = ({ t }) => <Frame><LongCount t={t} /></Frame>;
const K5: S = ({ t, T }) => <Frame cam={{ z: 1.4, y: 600 }}><Interior wall="#c9a878" floor="#8a6a42" /><B><Codex x={1060} y={860} s={1} open={easeOut(clamp(t / 1.5))} seed={4} /><Ch k="scribe" x={560} y={1010} s={1.15} T={T} p={{ kneel: 1, holdF: 'brush', armF: -1.4 + Math.sin(T * 5) * .15, elbowF: 1.0, lookX: 1, lookY: 1, mouth: 'flat', turn: .8 }} /></B>
  <Tag x={1100} y={240} text="BARK-PAPER BOOKS" o={clamp((t - .5) * 3)} /></Frame>;
const K6: S = ({ t, T }) => <Frame cam={{ z: 1.35, y: 600 }}><SkyG id="k6" top="#1a1020" bottom="#4a2a20" /><path d="M 1300 820 L 1300 360 L 1440 260 L 1580 360 L 1580 820 Z" fill="#2a1c1a" stroke={P.ink} strokeWidth={6} /><rect x={1424} y={180} width={32} height={100} fill="#2a1c1a" /><rect x={1394} y={210} width={92} height={28} fill="#2a1c1a" />
  <rect x={-200} y={820} width={2320} height={400} fill="#3a2a22" /><ellipse cx={860} cy={820} rx={600} ry={240} fill="url(#fireGlow)" />
  <B><Codex x={760} y={880} s={.6} open={.6} burn={clamp(t / 4)} seed={7} /><Fire x={860} y={880} s={1.4} t={T} /><Ch k="bishop" x={1240} y={1010} s={1.15} T={T} p={{ mouth: 'flat', brow: -1, armF: -1.4, elbowF: .4, turn: -.5 }} flip /></B>
  <Tag x={960} y={160} text="MANÍ, 1562" o={clamp((t - .3) * 3)} /></Frame>;
const K7: S = ({ t }) => <Frame><FourBooks t={t} /></Frame>;

// CH8 kings
const Throne: React.FC<{ T: number }> = ({ T }) => <g><Interior wall="#b04a36" floor="#c9a878" /><rect x={560} y={760} width={800} height={110} fill="#e9d9b8" stroke={P.ink} strokeWidth={7} />{[620, 1300].map((x) => <rect key={x} x={x - 30} y={360} width={60} height={400} fill="#7a2a1e" stroke={P.ink} strokeWidth={6} />)}<path d="M 560 360 Q 960 300 1360 360" stroke="#1f7a5a" strokeWidth={30} fill="none" /></g>;
const R1: S = ({ t, T }) => <Frame cam={{ z: pan(t, 6.5, 1.2, 1.5), y: 560 }}><Throne T={T} /><B><Ch k="king" x={960} y={790} s={1.25} T={T} p={{ kneel: .8, mouth: 'flat', armF: -.6, elbowF: 1.2, turn: 0 }} /><Ch k="trader" x={420} y={930} s={.9} T={T} seed={2} p={{ kneel: 1, lean: 30, turn: .8, mouth: 'flat' }} /><Ch k="scribe" x={1500} y={930} s={.9} T={T} seed={3} p={{ kneel: 1, lean: 30, turn: .8, mouth: 'flat' }} flip /></B><Tag x={960} y={150} text="K'UHUL AJAW · HOLY LORD" o={clamp((t - .6) * 3)} /></Frame>;
const R2: S = ({ t, T }) => <Frame cam={{ z: 2.6, y: 470, x: 960 }}><Throne T={T} /><B><Ch k="king" x={960} y={790} s={1.25} T={T} p={{ kneel: .8, mouth: t > 1.2 ? 'grin' : 'flat', armF: -.6, elbowF: 1.2, turn: 0, brow: t > 1.2 ? 1 : 0 }} /></B>{t > 1.4 && t < 3 && <g>{[0, 1, 2, 3].map((k) => <path key={k} d={`M ${1000 + Math.cos(k * 1.6) * 60} ${500 + Math.sin(k * 1.6) * 30} l ${Math.cos(k * 1.6) * 30} ${Math.sin(k * 1.6) * 30}`} stroke="#3fbf8a" strokeWidth={6} strokeLinecap="round" />)}</g>}<Tag x={960} y={210} text="JADE TOOTH INLAYS" o={clamp((t - 1.5) * 3)} /></Frame>;
const R3: S = ({ t, T }) => <Frame cam={{ z: 1.4, y: 560 }}><Interior wall="#5a2a3a" floor="#3a2a22" glow={.8} /><B><Ch k="king" x={700} y={1000} s={1.1} T={T} p={{ kneel: 1, mouth: 'flat', blink: 1, armF: -1.6, elbowF: 1.4, turn: .6 }} /><Ch k="queen" x={1220} y={1000} s={1.1} T={T} seed={2} p={{ kneel: 1, mouth: 'flat', blink: 1, armF: -1.6, elbowF: 1.4, turn: .6 }} flip />
  <ellipse cx={960} cy={960} rx={90} ry={30} fill="#b8763e" stroke={P.ink} strokeWidth={6} />
  <path d={`M 960 940 C ${900 + Math.sin(T) * 40} 800 ${1040 + Math.sin(T * 1.3) * 40} 640 ${960 + Math.sin(T * .8) * 60} 420`} stroke="#d8d0c4" strokeWidth={50} fill="none" opacity={.5} strokeLinecap="round" />
  <g transform={`translate(${960 + Math.sin(T * .8) * 60} 400)`} opacity={clamp((t - 2) * 2)}><ellipse cx={0} cy={0} rx={80} ry={56} fill="#3fbf8a" stroke={P.ink} strokeWidth={7} /><circle cx={30} cy={-16} r={10} fill={P.ink} /><path d="M 40 30 L 90 40 L 40 50" fill="#e9e2d0" stroke={P.ink} strokeWidth={5} /></g></B>
  <Tag x={960} y={150} text="BLOOD OFFERINGS · VISION SERPENT" o={clamp((t - .6) * 3)} c="#3a1a2a" /></Frame>;
const R4: S = ({ t, T }) => <Frame cam={{ z: 1.2, y: 560 }}><SkyG id="r4" top="#2a1a1a" bottom="#5a3a2a" /><rect x={-200} y={800} width={2320} height={500} fill="#3a2a22" />
  {[0, 1, 2].map((i) => <MChar key={i} look={{ ...C('cousin'), head: 'none' }} x={720 + i * 240} y={960} s={1.1} opacity={.55 * clamp((t - i * .3) * 2)} pose={{ kneel: 1, mouth: 'sad', brow: 2, blink: 1, armB: .3, armF: .3 }} />)}
  <rect x={-200} y={-200} width={2320} height={1480} fill="rgba(10,6,4,.35)" /></Frame>;
const R5: S = ({ t, T, d }) => <Frame cam={{ x: 960, y: pan(t, d, 700, 520), z: 1.25 }}><Plaza T={T} /><B><Ch k="you" x={pan(t, d, 560, 860)} y={pan(t, d, 1000, 900)} s={1.05} T={T} p={{ walk: 1, phase: T * 5, holdF: 'bundle', armF: -2.8, elbowF: .3, lean: 10, turn: .8, mouth: 'flat' }} /><Ch k="king" x={1300} y={460} s={.7} T={T} seed={2} p={{ lookY: -1.5, mouth: 'flat', turn: -.3 }} flip /></B><Tag x={960} y={150} text="TRIBUTE · LABOUR · RAIN" o={clamp((t - .8) * 3)} /></Frame>;

// CH9 rain
const D1: S = ({ t, T }) => <Frame cam={{ z: 1.1 }}><SkyG id="d1" top="#5a8ab8" bottom="#d0e4ea" />{[0, 1, 2].map((k) => <ellipse key={k} cx={500 + k * 450 + t * 100} cy={260 + k * 30} rx={200 * (1 - clamp(t / 1.8))} ry={70 * (1 - clamp(t / 1.8))} fill="#f4f6f8" />)}<circle cx={960} cy={300} r={140 + t * 40} fill="url(#sunGlow)" /><Hills y={900} amp={120} seed={5} color="#9a8a52" /></Frame>;
const D2: S = ({ t }) => <Frame><RainChart t={t} /></Frame>;
const D3: S = ({ t, T }) => <Frame cam={{ z: 1.4, y: 640 }}><MilpaBG T={T} dry={clamp(.6 + t / 3)} /><B><Ch k="dad" x={960} y={980} s={1.2} T={T} p={{ mouth: 'sad', brow: 2, holdF: 'cob', armF: -1.3, elbowF: 1.2, lookY: 1 }} /></B></Frame>;
const D4: S = ({ t, T }) => <Frame cam={{ z: 1.3, y: 640 }}><MilpaBG T={T} dry={1} /><ellipse cx={960} cy={880} rx={500 * (1 - clamp(t / 2) * .7)} ry={80 * (1 - clamp(t / 2) * .7)} fill="#5a8ab8" stroke={P.ink} strokeWidth={6} />
  {t > 2 && <B><Ch k="player" x={620} y={1000} s={1.1} T={T} p={{ holdF: 'spear', armF: -1.8, elbowF: .4, mouth: 'shout', brow: -2, turn: .7, lean: 10 }} /><Ch k="player2" x={1300} y={1000} s={1.1} T={T} seed={2} p={{ holdF: 'spear', armF: -1.8, elbowF: .4, mouth: 'shout', brow: -2, turn: .7, lean: 10 }} flip /></B>}</Frame>;
const D5: S = ({ t, T }) => <Frame cam={{ z: 1.2, y: 560 }}><rect x={-200} y={-200} width={2320} height={1480} fill="#efe2c6" /><B><Ch k="scholar" x={960} y={1000} s={1.2} T={T} p={{ armF: -1.4, elbowF: 1.6, mouth: 'flat', lookY: -1, brow: 1.5, tilt: Math.sin(T) * 4 }} /></B>
  {['DROUGHT', 'WAR', 'TOO MANY PEOPLE'].map((n, i) => <g key={n} opacity={clamp((t - .5 - i * .8) * 3)} transform={`translate(${520 + i * 440} 300)`}><circle r={110} fill={['#d9a441', '#b5432a', '#3f7a8a'][i]} stroke={P.ink} strokeWidth={7} /><Txt x={0} y={12} s={n.length > 8 ? 24 : 40} c="#1d1612">{n}</Txt></g>)}
  {t > 3.5 && <Txt x={960} y={560} s={52} c="#1d1612">ALL OF THE ABOVE?</Txt>}</Frame>;
const D6: S = ({ t, T, d }) => <Frame cam={{ x: pan(t, d, 900, 1200), z: 1.25, y: 600 }}><Plaza T={T} tone="dusk" /><B>
  {[['grandma', 1.4], ['dad', 1], ['mom', 1], ['youKid', .5], ['cousin', .5]].map(([k, a]: any, i) => <Ch key={i} k={k} age={a} x={500 + i * 170 + t * 90} y={1000 + (i % 2) * 20} s={1} T={T} seed={i} p={{ walk: 1, phase: T * 5 + i, turn: .8, holdF: i % 2 ? 'bundle' : 'jar', armF: -2.8, elbowF: .3, mouth: 'sad', lean: 6 }} />)}</B></Frame>;
const D7: S = ({ t, T, d }) => <Frame cam={{ z: pan(t, d, 1.1, 1.3), y: 560 }}><JungleBG T={T} tone="day" mist={.4} /><Pyramid x={960} y={880} s={1.15} ruin={clamp(t / d * 1.1)} /><Pyramid x={300} y={880} s={.7} steps={6} ruin={clamp(t / d * 1.3)} /><Canopy y={980} seed={14} color="#2f5a38" r={150} T={T} />
  <Txt x={1700} y={150} s={70} f="Mono" c="#f2e7d0">{`AD ${Math.round(lerp(900, 1500, clamp(t / d)))}`}</Txt></Frame>;
const D8: S = ({ t, T }) => <Frame cam={{ z: pan(t, 7, 1.0, 1.25), y: pan(t, 7, 540, 420) }}><MayaMap T={T} highlight={['TIKAL', 'CHICHEN ITZA']} arrowNorth={clamp(t / 3)} /></Frame>;

// CH10 today
const T1: S = ({ t, T }) => <Frame cam={{ z: pan(t, 4.4, 1.5, 1.7), y: 620 }}><SkyG id="t1" top="#8fc4d8" bottom="#e6f0d8" /><Hills y={760} amp={120} seed={21} color="#5f8a4a" /><rect x={-200} y={800} width={2320} height={500} fill="#d9c49a" />
  {[[300, '#c93a2e'], [640, '#3fa0a0'], [1280, '#7a2e5a'], [1620, '#e0a838']].map(([x, c]: any, i) => <g key={i}><rect x={x - 140} y={560} width={280} height={240} fill={c} stroke={P.ink} strokeWidth={6} />{[0, 1, 2].map((k) => <path key={k} d={`M ${x - 130} ${600 + k * 60} l 20 -20 l 20 20 l 20 -20 l 20 20 l 20 -20 l 20 20 l 20 -20 l 20 20 l 20 -20 l 20 20 l 20 -20 l 20 20`} stroke="#f2e7d0" strokeWidth={5} fill="none" />)}</g>)}
  <B><Ch k="todayW" x={960} y={1010} s={1.2} T={T} p={{ mouth: 'grin', turn: 0, armF: -.5, elbowF: 1.2 }} /></B></Frame>;
const T2: S = ({ t }) => <Frame><TodayCount t={t} /></Frame>;
const T3: S = ({ t, T }) => <Frame cam={{ z: pan(t, 8.5, 1.0, 1.5), y: pan(t, 8.5, 560, 330), x: 960 }}><JungleBG T={T} tone="day" mist={.5} /><Pyramid x={960} y={900} s={1.25} ruin={.35} /><B><Monkey x={960} y={250} s={1.1} T={T} />{[0, 1, 2].map((i) => <MChar key={i} look={C(i === 1 ? 'todayW' : 'scholar')} x={500 + i * 80} y={1000} s={.4} pose={{ holdF: 'phone', armF: -2, elbowF: .8, turn: .4 }} />)}</B>
  <Tag x={960} y={1000} text="TIKAL · UNESCO WORLD HERITAGE" o={clamp((t - 1) * 3)} /></Frame>;
const T4: S = ({ t, T }) => <Frame cam={{ z: 1.3, y: 560 }}><rect x={-200} y={-200} width={2320} height={1480} fill="#efe2c6" /><B><Ch k="scholar" x={480} y={1020} s={1.15} T={T} p={{ holdF: 'tablet', armF: -1.3, elbowF: 1.3, mouth: t > 4 ? 'grin' : 'flat', lookX: 1, turn: .7 }} /></B>
  {[0, 1, 2].map((i) => { const on = t > 1.5 + i * 1.2; return <g key={i} transform={`translate(${900 + i * 300} 420)`}><g transform="scale(1.8)"><GlyphBlock x={0} y={0} seed={i + 21} c={on ? '#b5432a' : P.ink} /></g><Txt x={0} y={200} s={40} o={on ? 1 : 0}>{["K'UHUL", 'AJAW', 'OF TIKAL'][i]}</Txt></g>; })}
  <Txt x={1180} y={760} s={26} f="Mono" c="#7a5a3a" o={clamp((t - 5) * 3)}>"HOLY LORD" — A ROYAL TITLE, READ AGAIN TODAY</Txt></Frame>;
const T5: S = ({ t, T }) => { const k = t < 3.3 ? 0 : 1; return <Frame cam={{ z: 1.45, y: 640 }}>{k === 0 ? <MilpaBG T={T} /> : <Compound T={T} tone="dusk" />}<B>
  {k === 0 ? <Ch k="todayM" x={960} y={980} s={1.2} T={T} p={{ holdF: 'cob', armF: -1, elbowF: 1, mouth: 'smile', lean: 10 }} />
    : <><Ch k="todayKid" age={.55} x={960} y={900} s={1.3} T={T} p={{ holdF: 'phone', armF: -1.6, elbowF: 1.7, lookY: 1, mouth: 'O' }} /><g transform="translate(1020 640)"><rect x={-10} y={-10} width={80} height={60} rx={8} fill="#7fc4e0" opacity={.0} /></g></>}</B>
  <Tag x={960} y={200} text={k === 0 ? 'STILL PLANTING MILPA' : 'STILL HERE'} /></Frame>; };
const T6: S = ({ t, T }) => { const split = easeInOut(clamp(t / 1.2)); return <Frame><g><rect x={-200} y={-200} width={1160} height={1480} fill="#d9a441" /><rect x={960} y={-200} width={1160} height={1480} fill="#3fa0a0" /><line x1={960} y1={0} x2={960} y2={1080} stroke={P.ink} strokeWidth={10} />
  <Txt x={480} y={160} s={56}>AD 750</Txt><Txt x={1440} y={160} s={56}>TODAY</Txt>
  <B><Ch k="you" x={480} y={960} s={1.7 * split} T={T} p={{ mouth: 'grin', turn: .2, armF: -2.4, elbowF: .3 }} /><Ch k="todayKid" age={.75} x={1440} y={960} s={1.7 * split} T={T} seed={3} p={{ mouth: 'grin', turn: -.2, armF: -2.4, elbowF: .3 }} flip /></B>
  <Txt x={960} y={995} s={30} f="Mono" c="#1d1612" o={clamp((t - 3) * 3)}>SAME PEOPLE · SAME CORN · SAME LANGUAGE FAMILY</Txt></g></Frame>; };
const T7: S = ({ t, T }) => <Frame cam={{ z: 1.1, y: 560 }}><JungleBG T={T} tone="dusk" temples mist={.6} /><rect x={-200} y={-200} width={2320} height={1480} fill="rgba(20,10,8,.45)" /></Frame>;

/* ===== the cut list (seconds) ===== */
export const SHOTS: [S, number, number][] = [
  [O1, 0, 5.2], [O2, 5.2, 7.4], [O3, 7.4, 9.3], [O4, 9.3, 12.0], [O5, 12.0, 16.6], [O6, 16.6, 21.2], [O7, 21.2, 24.6],
  [B1, 24.6, 30.2], [B2, 30.2, 34.9], [B3, 34.9, 39.2], [B4, 39.2, 43.5], [B5, 43.5, 48.6], [B6, 48.6, 53.8], [B7, 53.8, 60.7], [B8, 60.7, 67.0],
  [H1, 67.0, 73.0], [H2, 73.0, 78.4], [H3, 78.4, 85.3], [H4, 85.3, 89.2], [H5, 89.2, 93.2], [H6, 93.2, 104.9], [H7, 104.9, 113.0],
  [C1, 113.0, 119.8], [C2, 119.8, 123.6], [C3, 123.6, 127.2], [C4, 127.2, 135.4], [C5, 135.4, 139.2], [C6, 139.2, 143.4], [C7, 143.4, 149.4], [C8, 149.4, 156.9], [C9, 156.9, 164.6],
  [M1, 164.6, 173.3], [M2, 173.3, 183.2], [M3, 183.2, 188.1], [M4, 188.1, 197.1], [M5, 197.1, 205.5], [M6, 205.5, 210.1], [M7, 210.1, 217.3], [M8, 217.3, 224.7], [M9, 224.7, 232.2],
  [G1, 232.2, 240.0], [G2, 240.0, 246.7], [G3, 246.7, 253.7], [G4, 253.7, 263.4],
  [F1, 263.4, 270.4], [F2, 270.4, 279.3], [F3, 279.3, 287.6],
  [K1, 287.6, 294.3], [K2, 294.3, 300.4], [K3, 300.4, 309.8], [K4, 309.8, 320.5], [K5, 320.5, 327.9], [K6, 327.9, 333.6], [K7, 333.6, 339.0],
  [R1, 339.0, 346.8], [R2, 346.8, 355.7], [R3, 355.7, 365.1], [R4, 365.1, 373.5], [R5, 373.5, 381.5],
  [D1, 381.5, 384.9], [D2, 384.9, 394.1], [D3, 394.1, 397.6], [D4, 397.6, 401.0], [D5, 401.0, 410.7], [D6, 410.7, 418.5], [D7, 418.5, 426.2], [D8, 426.2, 434.4],
  [T1, 434.4, 440.0], [T2, 440.0, 449.8], [T3, 449.8, 458.5], [T4, 458.5, 469.1], [T5, 469.1, 476.1], [T6, 476.1, 486.3], [T7, 486.3, 600],
];
