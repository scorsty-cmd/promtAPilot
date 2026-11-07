import React from 'react';
import { clamp, lerp, easeOut, easeInOut, spring, prog, rng } from './lib';
import { P } from './art';
import { SY } from './syra';
import { MChar, CAST } from './chars';

/* ===== geometer's papyrus: ink line drawings that draw themselves, handwritten notes ===== */
type GP = { t: number; T: number; d: number };
const INK = '#3a2614', RED = '#b0402a', BLUE = '#2f5a8a';
const T_: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; f?: string; r?: number; children: React.ReactNode }> = ({ x, y, s = 40, c = INK, a = 'middle', o = 1, f = 'Marcellus', r = 0, children }) =>
  <text x={x} y={y} fontFamily={f} fontSize={s} fill={c} textAnchor={a} opacity={o} transform={r ? `rotate(${r} ${x} ${y})` : undefined}>{children}</text>;
const pop = (t: number, a: number) => spring(prog(t, a, a + .6) * 1.2, 10, .5);
const fade = (t: number, a: number) => clamp((t - a) * 3);
const draw = (t: number, a: number, b: number, len = 3000) => ({ strokeDasharray: `${easeOut(prog(t, a, b)) * len} ${len}` });

export const Papyrus: React.FC<{ t: number; title: string; note?: string; children: React.ReactNode }> = ({ t, title, note, children }) => <g>
  <rect x={-200} y={-200} width={2320} height={1480} fill="#3a2a1a" />
  <rect x={60} y={40} width={1800} height={1000} fill={SY.papyrus} />
  {Array.from({ length: 46 }).map((_, i) => <line key={i} x1={60} y1={44 + i * 22} x2={1860} y2={44 + i * 22 + Math.sin(i) * 3} stroke="#d8c48e" strokeWidth={3} opacity={.5} />)}
  {Array.from({ length: 30 }).map((_, i) => <line key={'v' + i} x1={70 + i * 62} y1={40} x2={68 + i * 62} y2={1040} stroke="#e0cc98" strokeWidth={2} opacity={.4} />)}
  {Array.from({ length: 14 }).map((_, i) => { const R = rng(i + 3); return <ellipse key={'s' + i} cx={60 + R() * 1800} cy={40 + R() * 1000} rx={50 + R() * 120} ry={20 + R() * 40} fill="#c8a868" opacity={.15} />; })}
  <path d="M 60 40 Q 40 540 60 1040" stroke="#a88a58" strokeWidth={18} fill="none" /><path d="M 1860 40 Q 1880 540 1860 1040" stroke="#a88a58" strokeWidth={18} fill="none" />
  {/* drifting construction circles keep the panel alive */}
  {[0, 1, 2].map((k) => <circle key={k} cx={300 + k * 700 + Math.sin(t * .3 + k) * 40} cy={540 + Math.cos(t * .25 + k) * 30} r={260 + k * 40} fill="none" stroke="#c8a868" strokeWidth={2} opacity={.25} />)}
  <T_ x={960} y={140} s={64} o={fade(t, .1)}>{title}</T_>
  <path d={`M ${960 - 300 * easeOut(prog(t, .2, 1))} 166 Q 960 ${172} ${960 + 300 * easeOut(prog(t, .2, 1))} 164`} stroke={RED} strokeWidth={5} fill="none" />
  {children}
  {note && <T_ x={960} y={212} s={30} f="Caveat" c="#6a4a2a" o={fade(t, .8)}>{note}</T_>}
</g>;
export const Stamp: React.FC<{ kind: 'MYTH' | 'EVIDENCE' | 'MAYBE'; p: number; x?: number; y?: number; s?: number; sub?: string }> = ({ kind, p, x = 0, y = 0, s = 1, sub }) => {
  const c = kind === 'MYTH' ? '#b0402a' : kind === 'EVIDENCE' ? '#2f6a4a' : '#c98a1a';
  const k = spring(clamp(p) * 1.2, 12, .45);
  return <g transform={`translate(${x} ${y}) scale(${s * (2 - k)}) rotate(-8)`} opacity={clamp(p * 4)}>
    <rect x={-170} y={-52} width={340} height={104} rx={10} fill="rgba(239,228,204,.88)" stroke={c} strokeWidth={9} />
    <rect x={-158} y={-40} width={316} height={80} rx={6} fill="none" stroke={c} strokeWidth={3} />
    <text x={0} y={sub ? 6 : 20} fontFamily="Stencil" fontWeight={700} fontSize={sub ? 54 : 62} fill={c} textAnchor="middle" letterSpacing={4}>{kind}</text>
    {sub && <text x={0} y={34} fontFamily="Mono" fontSize={20} fill={c} textAnchor="middle">{sub}</text>}
  </g>;
};

export const Rewind: React.FC<GP> = ({ t, d }) => {
  const p = easeInOut(prog(t, .3, d - .4)); const yr = Math.round(lerp(212, 232, p));
  return <Papyrus t={t} title="TWENTY YEARS EARLIER">
    <T_ x={960} y={600} s={240} c={RED}>{yr} BC</T_>
    <g transform="translate(960 800)"><line x1={-600} y1={0} x2={600} y2={0} stroke={INK} strokeWidth={4} />{[232, 225, 215, 212].map((y) => { const x = lerp(-600, 600, (232 - y) / 20); return <g key={y}><line x1={x} y1={-14} x2={x} y2={14} stroke={INK} strokeWidth={4} /><T_ x={x} y={60} s={32} f="Caveat">{y} BC</T_></g>; })}
      <circle cx={lerp(600, -600, p)} cy={0} r={14} fill={RED} /></g>
  </Papyrus>;
};
export const CrownWater: React.FC<GP> = ({ t }) => {
  const sink = easeInOut(prog(t, 1.2, 3.2)); const spillG = sink * 40, spillC = sink * 70;
  const vessel = (x: number, label: string, spill: number, obj: 'gold' | 'crown') => <g transform={`translate(${x} 760)`}>
    <path d="M -170 -300 L -150 0 L 150 0 L 170 -300" fill="rgba(140,200,210,.15)" stroke={INK} strokeWidth={6} />
    <rect x={-158} y={-290} width={316} height={288} fill="#7ac0cc" opacity={.6} />
    <g transform={`translate(0 ${lerp(-420, -120, sink)})`}>{obj === 'gold' ? <rect x={-50} y={-30} width={100} height={60} fill="#e0b040" stroke={INK} strokeWidth={5} /> : <g><ellipse rx={70} ry={26} fill="none" stroke="#c8a040" strokeWidth={16} />{[-50, -18, 18, 50].map((cx) => <path key={cx} d={`M ${cx - 8} -10 q 8 -26 16 0`} fill="#4a8a3a" stroke={INK} strokeWidth={3} />)}</g>}</g>
    <path d={`M 170 -300 Q 200 -260 ${200 + spill} ${-20}`} stroke="#7ac0cc" strokeWidth={10 + spill * .3} fill="none" opacity={sink > .05 ? .9 : 0} />
    <rect x={160 + spill * .2} y={-spill * 1.8} width={70} height={spill * 1.8} fill="#7ac0cc" opacity={.8} stroke={INK} strokeWidth={3} />
    <T_ x={0} y={70} s={40} f="Caveat">{label}</T_>
  </g>;
  return <Papyrus t={t} title="EUREKA: THE CROWN TEST" note="Same weight — different volume. Silver takes up more space than gold.">
    {vessel(600, 'pure gold, 1 kg', spillG, 'gold')}
    {vessel(1240, 'the crown, 1 kg', spillC, 'crown')}
    <g opacity={fade(t, 3.6)}><T_ x={1560} y={600} s={46} f="Caveat" c={RED} r={-6}>more water</T_><T_ x={1560} y={650} s={46} f="Caveat" c={RED} r={-6}>= silver inside!</T_></g>
    <g transform="translate(1600 900)"><Stamp kind="MAYBE" p={prog(t, 5, 5.6)} s={.7} sub="told 200 years later" /></g>
  </Papyrus>;
};
export const Lever: React.FC<GP> = ({ t }) => {
  const a = lerp(-8, 6, easeInOut(prog(t, 2.2, 5)));
  return <Papyrus t={t} title='"GIVE ME A PLACE TO STAND…"' note="The law of the lever: a long arm and a small force can lift a huge weight">
    <g transform="translate(1060 760)">
      <path d="M -40 0 L 0 -70 L 40 0 Z" fill="#c8a868" stroke={INK} strokeWidth={6} />
      <g transform={`translate(0 -70) rotate(${a})`}>
        <line x1={-260} y1={0} x2={760} y2={0} stroke={INK} strokeWidth={14} strokeLinecap="round" {...draw(t, .2, 1.2, 1100)} />
        <g transform="translate(-260 -110)"><circle r={110} fill="#5a9ab8" stroke={INK} strokeWidth={6} /><path d="M -60 -40 q 30 -30 70 -10 q 20 30 -20 40 q -40 10 -50 -30 Z M 20 40 q 30 -20 60 10 q -10 30 -40 20 Z" fill="#7aa05a" /></g>
        <g transform="translate(740 0)"><MChar look={CAST.arch} x={0} y={0} s={.55} pose={{ armF: -2.6, elbowF: .2, armB: -2.4, elbowB: .2, expr: 'excited' }} /></g>
      </g>
      <path d={`M 620 140 L 820 140`} stroke={RED} strokeWidth={6} opacity={fade(t, 3)} /><T_ x={720} y={190} s={36} f="Caveat" c={RED} o={fade(t, 3)}>long arm</T_>
      <T_ x={-260} y={190} s={36} f="Caveat" c={BLUE} o={fade(t, 3.4)}>short arm</T_>
    </g>
    <g transform="translate(1620 330)"><Stamp kind="MAYBE" p={prog(t, 5.5, 6)} s={.65} sub="quoted by Pappus, 500 yrs later" /></g>
  </Papyrus>;
};
export const Pulleys: React.FC<GP> = ({ t }) => {
  const n = Math.min(4, 1 + Math.floor(prog(t, .5, 5) * 4)); const segs = Math.pow(2, n - 1);
  return <Papyrus t={t} title="ONE OLD MAN vs. A HUNDRED" note="Each extra pulley halves the force — but you pull the rope twice as far">
    {[1, 2, 3, 4].map((k) => { const on = k <= n; const sx = 260 + (k - 1) * 380; return <g key={k} transform={`translate(${sx} 300)`} opacity={on ? 1 : .2}>
      <line x1={-80} y1={0} x2={80} y2={0} stroke={INK} strokeWidth={10} />
      {Array.from({ length: Math.pow(2, k - 1) }).map((_, j) => <line key={j} x1={-50 + j * (100 / Math.max(1, Math.pow(2, k - 1) - 1 || 1))} y1={0} x2={-50 + j * (100 / Math.max(1, Math.pow(2, k - 1) - 1 || 1))} y2={300} stroke={SY.rope} strokeWidth={5} />)}
      <rect x={-60} y={300} width={120} height={80} fill="#8a6a44" stroke={INK} strokeWidth={5} /><T_ x={0} y={352} s={30} c="#fff">100</T_>
      <T_ x={0} y={460} s={54} f="Caveat" c={RED}>{Math.round(100 / Math.pow(2, k - 1))}</T_><T_ x={0} y={500} s={26} f="Caveat">force needed</T_>
    </g>; })}
    <T_ x={960} y={620 + 340} s={36} f="Caveat" o={fade(t, 4)}>with enough pulleys, one man can move a ship</T_>
    <g transform="translate(1620 880)"><Stamp kind="EVIDENCE" p={prog(t, 5, 5.5)} s={.6} sub="Plutarch, Athenaeus" /></g>
  </Papyrus>;
};
export const Screw: React.FC<GP> = ({ t }) => {
  const ph = t * 3;
  return <Papyrus t={t} title="THE ARCHIMEDES SCREW" note="Turn the handle — water climbs the spiral. Still used today on farms and in water plants.">
    <g transform="translate(960 620) rotate(-28)">
      <rect x={-460} y={-90} width={920} height={180} rx={20} fill="rgba(140,200,210,.15)" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 14 }).map((_, k) => { const x = -440 + k * 66 + ((ph * 66 / Math.PI) % 66); return x < 450 ? <path key={k} d={`M ${x} -84 Q ${x + 30} 0 ${x} 84`} stroke={INK} strokeWidth={6} fill="none" /> : null; })}
      {Array.from({ length: 10 }).map((_, k) => { const p = ((t * .15 + k / 10) % 1); return <circle key={'w' + k} cx={-420 + p * 860} cy={50 + Math.sin(p * 40 + ph) * 20} r={16} fill="#5ab8c8" stroke={INK} strokeWidth={3} />; })}
      <line x1={460} y1={0} x2={540} y2={0} stroke={INK} strokeWidth={14} /><g transform="translate(540 0)"><line x1={0} y1={0} x2={Math.cos(ph) * 60} y2={Math.sin(ph) * 60} stroke={INK} strokeWidth={10} /></g>
    </g>
    <path d="M 300 900 Q 500 860 700 900" stroke="#5ab8c8" strokeWidth={30} fill="none" /><T_ x={420} y={980} s={34} f="Caveat">low water</T_>
    <path d="M 1450 420 Q 1600 400 1760 420" stroke="#5ab8c8" strokeWidth={30} fill="none" /><T_ x={1600} y={380} s={34} f="Caveat">high ground</T_>
  </Papyrus>;
};
export const SandReckoner: React.FC<GP> = ({ t }) => {
  const fill = easeOut(prog(t, .5, 5)); const zeros = Math.round(fill * 63);
  return <Papyrus t={t} title="THE SAND RECKONER" note="His estimate: about 10⁶³ grains to fill the universe as the Greeks imagined it">
    <g transform="translate(620 600)"><circle r={300} fill="none" stroke={INK} strokeWidth={6} /><circle r={16} fill="#e0b040" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 520 }).map((_, i) => { const R = rng(i + 5); const a = R() * Math.PI * 2, r = Math.sqrt(R()) * 290; return i / 520 < fill ? <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={4} fill="#c8a050" /> : null; })}</g>
    <g transform="translate(1340 420)"><T_ x={0} y={0} s={46} f="Caveat">grains needed:</T_>
      <foreignObject x={-330} y={30} width={660} height={300}><div style={{ fontFamily: 'Mono', fontSize: 34, color: '#3a2614', wordBreak: 'break-all', lineHeight: 1.25 }}>1{'0'.repeat(zeros)}</div></foreignObject>
      <T_ x={0} y={420} s={120} c={RED} o={fade(t, 5)}>10⁶³</T_></g>
  </Papyrus>;
};
export const PiPolys: React.FC<GP> = ({ t }) => {
  const steps = [6, 12, 24, 48, 96]; const k = Math.min(4, Math.floor(prog(t, .5, 6) * 5)); const n = steps[k];
  const R = 280; const pin = (m: number) => Array.from({ length: m }).map((_, j) => `${Math.cos(j / m * Math.PI * 2 - Math.PI / 2) * R},${Math.sin(j / m * Math.PI * 2 - Math.PI / 2) * R}`).join(' ');
  const Rc = R / Math.cos(Math.PI / n);
  const pout = Array.from({ length: n }).map((_, j) => `${Math.cos(j / n * Math.PI * 2 - Math.PI / 2 + Math.PI / n) * Rc},${Math.sin(j / n * Math.PI * 2 - Math.PI / 2 + Math.PI / n) * Rc}`).join(' ');
  const lo = n * Math.sin(Math.PI / n), hi = n * Math.tan(Math.PI / n);
  return <Papyrus t={t} title="TRAPPING π" note="Polygons inside and outside the circle squeeze π between two numbers">
    <g transform={`translate(620 620) rotate(${t * 2})`}><polygon points={pout} fill="rgba(176,64,42,.08)" stroke={RED} strokeWidth={4} /><circle r={R} fill="none" stroke={INK} strokeWidth={7} /><polygon points={pin(n)} fill="rgba(47,90,138,.1)" stroke={BLUE} strokeWidth={4} /></g>
    <g transform="translate(1340 420)">
      <T_ x={0} y={0} s={52} f="Caveat">{n} sides</T_>
      <T_ x={0} y={110} s={58} f="Mono" c={BLUE}>{lo.toFixed(4)}</T_><T_ x={0} y={190} s={70}>&lt; π &lt;</T_><T_ x={0} y={270} s={58} f="Mono" c={RED}>{hi.toFixed(4)}</T_>
      <g opacity={fade(t, 6)}><T_ x={0} y={400} s={44}>3 ¹⁰⁄₇₁  &lt;  π  &lt;  3 ¹⁄₇</T_><T_ x={0} y={460} s={34} f="Caveat">Archimedes, c. 250 BC</T_></g>
    </g>
  </Papyrus>;
};
export const MirrorTest: React.FC<GP> = ({ t }) => {
  const clock = Math.min(10, Math.floor(prog(t, .5, 6) * 10)); const lit = t > 6.2;
  return <Papyrus t={t} title="THE DEATH RAY TEST" note="MIT, 2005: 127 mirrors, 30 m away — fire only after ~10 minutes of clear sky and a ship that did not move">
    <circle cx={260} cy={330} r={70} fill="#f0c040" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 9 }).map((_, k) => <g key={k} transform={`translate(${380 + (k % 3) * 70} ${560 + Math.floor(k / 3) * 90}) rotate(-20)`}><rect x={-26} y={-34} width={52} height={68} fill="#cfe4ea" stroke={INK} strokeWidth={4} /></g>)}
    {Array.from({ length: 9 }).map((_, k) => <line key={'r' + k} x1={380 + (k % 3) * 70} y1={560 + Math.floor(k / 3) * 90} x2={1400} y2={640} stroke="#f0c040" strokeWidth={3} opacity={.35 + .2 * Math.sin(t * 6 + k)} />)}
    <g transform="translate(1440 700)"><path d="M -160 -40 L 180 -40 L 140 20 L -140 20 Z" fill="#6a4a2a" stroke={INK} strokeWidth={5} />{lit && <path d={`M -30 -40 Q -40 ${-120 - Math.sin(t * 9) * 20} 0 ${-170 - Math.sin(t * 7) * 20} Q 40 -120 30 -40 Z`} fill="#ffb347" stroke={INK} strokeWidth={4} />}</g>
    <g transform="translate(960 380)"><circle r={70} fill="none" stroke={INK} strokeWidth={5} /><line x1={0} y1={0} x2={Math.sin(clock / 10 * Math.PI * 2) * 54} y2={-Math.cos(clock / 10 * Math.PI * 2) * 54} stroke={RED} strokeWidth={6} /><T_ x={0} y={120} s={40} f="Caveat">{clock} min</T_></g>
    <g transform="translate(1620 960)"><Stamp kind="MAYBE" p={prog(t, 7, 7.5)} s={.65} sub="no ancient witness" /></g>
  </Papyrus>;
};
export const PalimpsestG: React.FC<GP> = ({ t }) => {
  const scan = easeInOut(prog(t, 1.5, 7)); const tl = [['c. 950', 'copied in Constantinople'], ['1229', 'scraped & reused as a prayer book'], ['1906', 'Heiberg spots it in Istanbul'], ['1998', 'sold for $2 million'], ['1999–2008', 'X-ray & multispectral imaging']];
  return <Papyrus t={t} title="THE BOOK UNDER THE PRAYERS">
    <g transform="translate(560 600) rotate(-3)">
      <rect x={-300} y={-360} width={600} height={720} fill="#efe6cc" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 22 }).map((_, r) => <line key={r} x1={-260} y1={-320 + r * 30} x2={260 - (r % 4) * 30} y2={-320 + r * 30} stroke="#5a3a2a" strokeWidth={6} opacity={1 - scan * .7} />)}
      <g opacity={.12 + scan * .88}>{Array.from({ length: 12 }).map((_, c) => <line key={c} x1={-250 + c * 44} y1={-330} x2={-250 + c * 44} y2={330} stroke={RED} strokeWidth={5} strokeDasharray="14 8" />)}
        <circle cx={0} cy={60} r={150} fill="none" stroke={RED} strokeWidth={6} /><path d="M -150 60 L 150 60 M 0 -90 L 0 210 M -106 -46 L 106 166" stroke={RED} strokeWidth={5} /></g>
      <rect x={-310} y={-370 + scan * 740} width={620} height={10} fill="#9a7aff" opacity={scan < 1 ? .8 : 0} />
    </g>
    <g transform="translate(1100 330)">{tl.map(([y, d], k) => <g key={k} opacity={fade(t, .6 + k * 1.1)} transform={`translate(0 ${k * 120})`}><circle cx={0} cy={-12} r={12} fill={k === 1 ? RED : INK} /><T_ x={36} y={0} s={40} a="start">{y}</T_><T_ x={36} y={44} s={32} f="Caveat" a="start">{d}</T_></g>)}</g>
    <g transform="translate(1620 950)"><Stamp kind="EVIDENCE" p={prog(t, 7.5, 8)} s={.6} sub="The Method, rediscovered" /></g>
  </Papyrus>;
};
export const SiegePlan: React.FC<GP> = ({ t, T }) => (
  <Papyrus t={t} title="214 BC: ROME ATTACKS" note="Marcellus attacks from the sea; Appius Claudius from the land (Polybius, Livy, Plutarch)">
    <path d="M 300 900 Q 500 500 800 420 Q 1100 360 1300 480 Q 1460 600 1500 900" fill="#e2cc96" stroke={INK} strokeWidth={6} {...draw(t, .2, 2)} />
    <path d="M 800 420 L 900 520 L 1060 470 L 1180 560 L 1300 480" fill="none" stroke={RED} strokeWidth={10} strokeDasharray="20 10" opacity={fade(t, 1.4)} />
    <T_ x={1000} y={640} s={60} o={fade(t, 1)}>SYRACUSE</T_>
    <rect x={60} y={40} width={300} height={1000} fill="#9ad0d8" opacity={.25} /><T_ x={200} y={540} s={34} f="Caveat" r={-90}>the sea</T_>
    {Array.from({ length: 12 }).map((_, k) => { const p = easeOut(prog(t, 2 + k * .15, 5 + k * .1)); return <g key={k} transform={`translate(${lerp(-80, 330 + (k % 3) * 60, p)} ${300 + k * 50})`}><path d="M -30 0 L 30 0 L 40 -10 L -36 -10 Z" fill="#a82a22" stroke={INK} strokeWidth={3} /></g>; })}
    {Array.from({ length: 6 }).map((_, k) => { const p = easeOut(prog(t, 3 + k * .2, 6)); return <path key={'a' + k} d={`M ${1800 - p * 260} ${400 + k * 80} l -40 0 l 14 -10 m -14 10 l 14 10`} stroke="#a82a22" strokeWidth={6} fill="none" />; })}
    <T_ x={1680} y={330} s={36} f="Caveat" c={RED} o={fade(t, 3.5)}>legions</T_><T_ x={430} y={260} s={36} f="Caveat" c={RED} o={fade(t, 2.5)}>60 warships</T_>
  </Papyrus>
);
