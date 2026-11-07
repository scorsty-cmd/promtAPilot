import React from 'react';
import { clamp, lerp, easeOut, easeInOut, spring, prog, rng } from './lib';
import { P } from './art';
import { R, Trood, Theropod, Pip, Mosa, Crow } from './creatures';

/* ===== ep07 graphics: risograph "field guide" posters — two-ink blocks, halftone, misregistered type, everything drifts ===== */
type GP = { t: number; T: number; d: number };
const INK = R.navy, PINK = R.pink, PAPER = R.paper;
const Tx: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; f?: string; r?: number; ls?: number; children: React.ReactNode }> = ({ x, y, s = 40, c = INK, a = 'middle', o = 1, f = 'Grot', r = 0, ls = 0, children }) =>
  <text x={x} y={y} fontFamily={f} fontSize={s} fill={c} textAnchor={a} opacity={o} letterSpacing={ls} transform={r ? `rotate(${r} ${x} ${y})` : undefined}>{children}</text>;
/* misregistered headline: pink plate offset under navy plate */
const Head: React.FC<{ x: number; y: number; s: number; t: number; children: React.ReactNode; a?: 'start' | 'middle' | 'end'; c?: string }> = ({ x, y, s, t, children, a = 'middle', c = INK }) => <g>
  <Tx x={x + 5 + Math.sin(t * 1.3) * 2} y={y + 4} s={s} f="Dela" c={PINK} a={a} o={.9}>{children}</Tx>
  <Tx x={x} y={y} s={s} f="Dela" c={c} a={a}>{children}</Tx>
</g>;
const pop = (t: number, a: number) => spring(prog(t, a, a + .6) * 1.2, 10, .5);
const fade = (t: number, a: number) => clamp((t - a) * 3);
const draw = (t: number, a: number, b: number, len = 3000) => ({ strokeDasharray: `${easeOut(prog(t, a, b)) * len} ${len}` });

export const Poster: React.FC<{ t: number; kicker: string; title: string; bg?: string; children: React.ReactNode }> = ({ t, kicker, title, bg = PAPER, children }) => <g>
  <rect x={-200} y={-200} width={2320} height={1480} fill={bg} />
  {/* drifting ink blobs keep it alive */}
  {[[300, 900, 340, PINK], [1700, 200, 300, R.yellow], [1650, 950, 220, R.teal]].map(([x, y, r, c], k) => <circle key={k} cx={+x + Math.sin(t * .3 + k) * 50} cy={+y + Math.cos(t * .25 + k) * 40} r={+r} fill={c as string} opacity={.16} />)}
  <rect x={-200} y={-200} width={2320} height={1480} fill="url(#dotsL)" opacity={.07} />
  <g transform={`translate(${120 - (1 - pop(t, .05)) * 200} 96)`}><rect x={0} y={-40} width={kicker.length * 23 + 50} height={56} rx={28} fill={INK} /><Tx x={25} y={-2} s={26} f="RubikMono" c={PAPER} a="start">{kicker}</Tx></g>
  <g opacity={fade(t, .15)}><Head x={120} y={210} s={78} t={t} a="start">{title}</Head></g>
  {children}
  <rect x={40} y={30} width={1840} height={1020} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" opacity={.5} />
</g>;
export const Stamp: React.FC<{ kind: 'MYTH' | 'EVIDENCE' | 'MAYBE'; p: number; x?: number; y?: number; s?: number; sub?: string }> = ({ kind, p, x = 0, y = 0, s = 1, sub }) => {
  const c = kind === 'MYTH' ? '#e0302a' : kind === 'EVIDENCE' ? R.tealD : R.orange;
  const k = spring(clamp(p) * 1.2, 12, .45);
  return <g transform={`translate(${x} ${y}) scale(${s * (2 - k)}) rotate(-6)`} opacity={clamp(p * 4)}>
    <rect x={-190} y={-62} width={380} height={124} rx={62} fill={c} />
    <rect x={-184 + 6} y={-56 + 5} width={368} height={112} rx={56} fill="none" stroke={PAPER} strokeWidth={4} strokeDasharray="6 8" />
    <text x={0} y={sub ? 6 : 18} fontFamily="Dela" fontSize={sub ? 50 : 56} fill={PAPER} textAnchor="middle">{kind}</text>
    {sub && <text x={0} y={38} fontFamily="Grot" fontSize={22} fill={PAPER} textAnchor="middle">{sub}</text>}
  </g>;
};
const DinoIcon: React.FC<{ x: number; y: number; s?: number; c?: string; bird?: boolean; o?: number }> = ({ x, y, s = 1, c = R.teal, bird, o = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
  {bird ? <><ellipse cx={0} cy={-20} rx={26} ry={18} fill={c} stroke={P.ink} strokeWidth={4} /><circle cx={22} cy={-40} r={13} fill={c} stroke={P.ink} strokeWidth={4} /><path d="M 33 -42 l 14 4 l -14 4 Z" fill={R.yellow} stroke={P.ink} strokeWidth={3} /><path d="M -10 -24 q -10 -26 -36 -20" stroke={P.ink} strokeWidth={6} fill="none" /><path d="M -4 -4 v 10 M 6 -4 v 10" stroke={P.ink} strokeWidth={4} /></>
    : <><path d="M -50 -20 Q -20 -40 10 -30 L 30 -50 L 46 -44 L 30 -24 Q 20 -6 0 -4 L -50 -18 Z" fill={c} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" /><path d="M -6 -6 v 12 M 8 -8 v 14" stroke={P.ink} strokeWidth={5} /></>}
</g>;
const Earth: React.FC<{ r: number; T: number; ice?: number; soot?: number; sea?: string; clip?: string }> = ({ r, T, ice = 0, soot = 0, sea = R.teal, clip = 'earthClip' }) => <g>
  <circle r={r} fill={sea} stroke={P.ink} strokeWidth={7} />
  <g clipPath={`url(#${clip})`}>
    {[[-.4, -.3, .42, .3], [.35, .2, .38, .45], [-.15, .55, .3, .18], [.5, -.45, .25, .2]].map(([x, y, rx, ry], k) => <ellipse key={k} cx={x * r + Math.sin(T * .2) * r * .1} cy={y * r} rx={rx * r} ry={ry * r} fill={R.green} stroke={P.ink} strokeWidth={4} />)}
    {ice > 0 && <><ellipse cx={0} cy={-r * .95} rx={r * .7 * ice} ry={r * .3 * ice} fill="#fff" /><ellipse cx={0} cy={r * .95} rx={r * .7 * ice} ry={r * .3 * ice} fill="#fff" /></>}
    {soot > 0 && Array.from({ length: 9 }).map((_, k) => <circle key={k} cx={Math.cos(k * .7 + T * .3) * r * .6} cy={Math.sin(k * 1.3 + T * .2) * r * .6} r={r * .5 * soot} fill="#2a2430" opacity={.75} />)}
  </g>
  <circle r={r} fill="url(#dotsL)" opacity={.15} />
</g>;

/* m5: the impact winter */
export const ImpactG: React.FC<GP> = ({ t, T, d }) => {
  const soot = easeInOut(prog(t, .5, 4)); const lost = Math.round(easeOut(prog(t, 4.5, 9)) * 75);
  return <Poster t={t} kicker="66 MILLION YEARS AGO" title="The sky went dark">
    <defs><clipPath id="earthClip"><circle r={300} /></clipPath></defs>
    <defs><clipPath id="earthClip2"><circle r={250} /></clipPath></defs>
    <g transform="translate(520 560)"><circle cx={-280 + soot * 120} cy={-240} r={60} fill={R.yellow} opacity={1 - soot * .85} /><Earth r={250} T={T} soot={soot} clip="earthClip2" />
      <Tx x={0} y={320} s={30} f="RubikMono" o={fade(t, 2)}>SOOT + DUST · MONTHS OF DARK</Tx></g>
    <g transform="translate(1060 270)">
      {Array.from({ length: 20 }).map((_, i) => { const dead = i < 15 && lost >= (i + 1) * 5; const bird = i === 19; return <g key={i} transform={`translate(${(i % 5) * 150} ${Math.floor(i / 5) * 130})`}><DinoIcon x={0} y={60} s={1.25} c={dead ? '#b8b0a8' : bird ? PINK : R.teal} bird={bird || i === 17} o={fade(t, .3 + i * .05)} />{dead && <path d="M -46 0 L 46 70 M 46 0 L -46 70" stroke="#e0302a" strokeWidth={8} strokeLinecap="round" />}</g>; })}
      <Head x={-20} y={620} s={120} t={t} a="start">{lost}%</Head>
      <Tx x={330} y={600} s={36} f="Grot" a="start" o={fade(t, 4.5)}>of all species died</Tx>
    </g>
    <g opacity={fade(t, 9.4)}><path d="M 1700 690 q 40 -40 0 -100" stroke={PINK} strokeWidth={6} fill="none" transform="translate(-20 0)" /><Tx x={1560} y={250} s={42} f="Caveat" c={PINK} r={-4}>except the ones that could fly</Tx></g>
  </Poster>;
};
/* m8: 13 percent */
const MAP = 'M 220 420 Q 300 330 420 360 Q 520 380 560 470 Q 600 560 520 600 L 470 700 Q 440 820 520 880 L 480 960 Q 380 900 400 780 Q 360 660 300 600 Q 220 540 220 420 Z M 760 360 Q 880 300 1000 340 Q 1150 320 1300 360 Q 1460 380 1520 470 Q 1440 540 1340 520 Q 1280 600 1180 600 Q 1100 700 1020 660 Q 960 800 900 760 Q 860 640 820 600 Q 760 540 780 460 Z M 1400 780 Q 1500 740 1580 800 Q 1560 880 1460 870 Q 1400 840 1400 780 Z';
export const ThirteenG: React.FC<GP> = ({ t, T, d }) => {
  const n = Math.round(easeOut(prog(t, .6, 3)) * 13);
  return <Poster t={t} kicker="KAIHO & OSHIMA · 2017" title="Where a hit means extinction">
    <g transform="translate(60 40)">
      <path d={MAP} fill={R.green} stroke={P.ink} strokeWidth={6} opacity={.9} />
      <path d={MAP} fill="url(#dotsL)" opacity={.2} />
      {[[480, 520, 60], [380, 440, 40], [1100, 420, 70], [1380, 440, 50], [960, 560, 44], [1500, 820, 36]].map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r * easeOut(prog(t, .6 + k * .3, 1.4 + k * .3)) * (1 + .05 * Math.sin(T * 3 + k))} fill="url(#lines)" stroke="#e0302a" strokeWidth={5} opacity={.85} />)}
      {[[480, 520, 60], [380, 440, 40], [1100, 420, 70], [1380, 440, 50], [960, 560, 44], [1500, 820, 36]].map(([x, y, r], k) => <circle key={'c' + k} cx={x} cy={y} r={r * easeOut(prog(t, .6 + k * .3, 1.4 + k * .3))} fill="#e0302a" opacity={.35} />)}
      <g transform="translate(400 560)" opacity={fade(t, 3.4)}><circle r={22 + Math.sin(T * 6) * 4} fill="none" stroke={INK} strokeWidth={6} /><path d="M 0 0 L -160 140" stroke={INK} strokeWidth={5} /><Tx x={-170} y={180} s={30} f="RubikMono">CHICXULUB</Tx><Tx x={-170} y={218} s={28} f="Caveat" c={PINK}>oil + sulfur rocks</Tx></g>
    </g>
    <g transform="translate(1560 820)"><Head x={0} y={0} s={190} t={t} c="#e0302a">{n}%</Head><Tx x={0} y={60} s={30} f="Grot">of Earth's surface</Tx></g>
    <g transform="translate(1600 330)"><Stamp kind="EVIDENCE" p={prog(t, 4.2, 4.7)} s={.8} sub="a model, not a certainty" /></g>
  </Poster>;
};
/* m11: decline debate */
export const DeclineG: React.FC<GP> = ({ t, T, d }) => {
  const p = easeOut(prog(t, .4, 4));
  const X = (my: number) => lerp(260, 1500, (80 - my) / 14);
  const fine = Array.from({ length: 30 }).map((_, i) => { const my = 80 - i * 14 / 29; return `${i ? 'L' : 'M'} ${X(my)} ${620 - Math.sin(i * .8) * 18 - i * 2}`; }).join(' ');
  const dec = Array.from({ length: 30 }).map((_, i) => { const my = 80 - i * 14 / 29; return `${i ? 'L' : 'M'} ${X(my)} ${600 + i * i * .35}`; }).join(' ');
  return <Poster t={t} kicker="STILL DEBATED" title="Were they already fading?">
    <g transform="translate(0 -90)">
    <line x1={260} y1={900} x2={1560} y2={900} stroke={INK} strokeWidth={6} /><line x1={260} y1={340} x2={260} y2={900} stroke={INK} strokeWidth={6} />
    {[80, 76, 72, 68].map((y) => <Tx key={y} x={X(y)} y={945} s={30} f="RubikMono">{y}</Tx>)}<Tx x={1700} y={945} s={26} f="Grot">million years ago</Tx>
    <Tx x={230} y={600} s={28} f="RubikMono" r={-90}>SPECIES</Tx>
    <path d={dec} stroke={R.orange} strokeWidth={10} fill="none" strokeDasharray={`${p * 1500} 1500`} />
    <path d={fine} stroke={R.teal} strokeWidth={12} fill="none" style={draw(t, 1.5, 5, 1500)} />
    <line x1={X(66)} y1={320} x2={X(66)} y2={900} stroke="#e0302a" strokeWidth={8} strokeDasharray="16 12" />
    <g transform={`translate(${X(66)} ${300 + Math.sin(T * 2) * 6})`}><circle r={30} fill={R.brown} stroke={P.ink} strokeWidth={5} /></g>
    <Tx x={X(70)} y={800} s={38} f="Caveat" c={R.orange} o={fade(t, 2)}>"already in decline"</Tx>
    <Tx x={X(71)} y={540} s={34} f="Caveat" c={R.tealD} o={fade(t, 4)}>"doing fine to the end"</Tx></g>
    <g transform="translate(1680 560)"><Stamp kind="MAYBE" p={prog(t, 4.6, 5.1)} s={.8} sub="scientists disagree" /></g>
  </Poster>;
};
/* w4: greenhouse earth */
export const GreenhouseG: React.FC<GP> = ({ t, T, d }) => {
  const rise = easeInOut(prog(t, 3, 8));
  return <Poster t={t} kicker="CRETACEOUS CLIMATE" title="A greenhouse planet">
    <defs><clipPath id="earthClip"><circle r={220} /></clipPath></defs>
    <g transform="translate(420 560)"><Earth r={220} T={T} ice={1} /><Tx x={0} y={300} s={34} f="RubikMono">TODAY</Tx></g>
    <g transform="translate(980 560)"><Earth r={220} T={T + 3} ice={0} sea="#0d9f99" /><Tx x={0} y={300} s={34} f="RubikMono" c={PINK}>THEN</Tx><Tx x={0} y={346} s={30} f="Grot" o={fade(t, 1.5)}>no ice caps</Tx></g>
    <g transform="translate(1440 300)">
      <rect x={0} y={0} width={260} height={600} fill={PAPER} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 11 }).map((_, k) => <g key={k}><line x1={0} y1={600 - k * 50} x2={k % 2 ? 30 : 50} y2={600 - k * 50} stroke={INK} strokeWidth={4} /></g>)}
      <rect x={6} y={600 - 260 - rise * 200} width={248} height={260 + rise * 200 - 6} fill={R.teal} opacity={.85} />
      <path d={Array.from({ length: 14 }).map((_, j) => `${j ? 'L' : 'M'} ${6 + j * 19} ${600 - 260 - rise * 200 + Math.sin(j + T * 3) * 6}`).join(' ')} stroke="#fff" strokeWidth={5} fill="none" />
      <line x1={-30} y1={340} x2={290} y2={340} stroke={INK} strokeWidth={4} strokeDasharray="10 8" /><Tx x={-40} y={350} s={26} f="RubikMono" a="end">TODAY'S SEA</Tx>
      <Head x={130} y={-40} s={84} t={t}>+{Math.round(rise * 100)} m</Head>
    </g>
    <g transform="translate(1780 700)"><rect x={-16} y={-260} width={32} height={260} rx={16} fill={PAPER} stroke={INK} strokeWidth={5} /><rect x={-9} y={-250 + 120 - rise * 100} width={18} height={250 - 120 + rise * 100} rx={9} fill="#e0302a" /><circle cx={0} cy={14} r={34} fill="#e0302a" stroke={INK} strokeWidth={5} /></g>
  </Poster>;
};
/* l5: scales vs feathers */
export const ScalesG: React.FC<GP> = ({ t, T }) => <Poster t={t} kicker="SKIN FOSSILS" title="Scales on the giants">
  {[[520, 'BIG TYRANNOSAURS', 'mostly scales', 0], [1400, 'SMALLER RELATIVES', 'feathers', 1]].map(([x, a, b, k]) => <g key={k as number} transform={`translate(${x} 600) scale(${pop(t, .3 + (k as number) * 1.4)})`}>
    <circle r={250} fill={PAPER} stroke={INK} strokeWidth={8} />
    <clipPath id={`sk${k}`}><circle r={244} /></clipPath>
    <g clipPath={`url(#sk${k})`} transform={`translate(${Math.sin(T * .4 + (k as number)) * 20} 0)`}>
      {k === 0 ? Array.from({ length: 120 }).map((_, i) => { const cx = -280 + (i % 12) * 52 + (Math.floor(i / 12) % 2) * 26, cy = -280 + Math.floor(i / 12) * 46; return <polygon key={i} points={[0, 1, 2, 3, 4, 5].map((j) => `${cx + Math.cos(j * Math.PI / 3) * 24},${cy + Math.sin(j * Math.PI / 3) * 22}`).join(' ')} fill={i % 3 ? R.teal : R.tealD} stroke={P.ink} strokeWidth={3} />; })
        : Array.from({ length: 60 }).map((_, i) => { const cx = -300 + (i % 8) * 80, cy = -300 + Math.floor(i / 8) * 80; return <path key={i} d={`M ${cx} ${cy} q 40 30 70 90 q -50 -10 -70 -90 Z`} fill={i % 2 ? PINK : '#ff9ac4'} stroke={P.ink} strokeWidth={3} transform={`rotate(${Math.sin(T * 2 + i) * 6} ${cx} ${cy})`} />; })}
    </g>
    <Tx x={0} y={310} s={30} f="RubikMono">{a as string}</Tx><Tx x={0} y={356} s={34} f="Caveat" c={PINK}>{b as string}</Tx>
  </g>)}
  <g transform="translate(960 640)"><Stamp kind="EVIDENCE" p={prog(t, 3.4, 3.9)} s={.75} sub="skin impressions" /></g>
</Poster>;
/* s7: no marine mammals */
export const NoWhalesG: React.FC<GP> = ({ t, T }) => {
  const Whale = <path d="M -170 0 Q -120 -90 40 -70 Q 150 -60 180 10 Q 120 60 -40 60 Q -140 50 -170 0 Z M 170 0 L 240 -50 L 230 20 L 250 70 Z" fill={R.navy} stroke={P.ink} strokeWidth={5} />;
  const Dolph = <path d="M -150 10 Q -60 -60 80 -30 L 140 -36 L 110 -10 Q 60 40 -100 30 Z M -150 10 L -200 -30 L -190 30 Z M 0 -44 L 20 -90 L 40 -40 Z" fill="#6a8ab0" stroke={P.ink} strokeWidth={5} />;
  const Seal = <path d="M -120 30 Q -100 -40 0 -30 Q 70 -60 110 -30 Q 120 0 80 10 Q 0 50 -120 30 Z" fill="#8a7a6a" stroke={P.ink} strokeWidth={5} />;
  const rows: [React.ReactNode, string][] = [[Whale, 'WHALES'], [Dolph, 'DOLPHINS'], [Seal, 'SEALS']];
  return <Poster t={t} kicker="THE OCEANS, IN THIS WORLD" title="Who's missing?" bg="#d8f0ea">
    <g transform={`translate(560 640)`}><Mosa x={0} y={Math.sin(T * 1.2) * 14} s={.55} open={.3 + .3 * Math.sin(T * 2)} /><Tx x={0} y={180} s={34} f="RubikMono">MOSASAURS RULE</Tx></g>
    {rows.map(([g, n], i) => { const a = 1.2 + i * 1.1, x = prog(t, a + 4, a + 4.4); return <g key={i} transform={`translate(${1340 + Math.sin(T + i) * 20} ${400 + i * 210}) scale(${pop(t, a)})`}>{g}<Tx x={0} y={110} s={28} f="RubikMono">{n}</Tx>
      <path d={`M -200 -80 L ${-200 + 400 * x} ${-80 + 180 * x}`} stroke="#e0302a" strokeWidth={14} strokeLinecap="round" /><path d={`M 200 -80 L ${200 - 400 * x} ${-80 + 180 * x}`} stroke="#e0302a" strokeWidth={14} strokeLinecap="round" /></g>; })}
    <Tx x={1340} y={1010} s={40} f="Caveat" c={PINK} o={fade(t, 8)}>all mammals that grew big after the asteroid</Tx>
  </Poster>;
};
/* p5: Purgatorius timeline */
export const PurgG: React.FC<GP> = ({ t, T }) => {
  const X = (my: number) => lerp(200, 1720, (67 - my) / 2);
  return <Poster t={t} kicker="PURGATORIUS" title="One of your oldest ancestors?">
    <line x1={200} y1={760} x2={1720} y2={760} stroke={INK} strokeWidth={8} style={draw(t, .2, 1.4, 1600)} />
    {[67, 66.5, 66, 65.5, 65].map((y) => <g key={y} opacity={fade(t, .8)}><line x1={X(y)} y1={740} x2={X(y)} y2={780} stroke={INK} strokeWidth={5} /><Tx x={X(y)} y={830} s={30} f="RubikMono">{y}</Tx></g>)}
    <Tx x={960} y={880} s={26} f="Grot" o={fade(t, .8)}>million years ago</Tx>
    <g transform={`translate(${X(66)} 0)`} opacity={fade(t, 1.6)}><line x1={0} y1={330} x2={0} y2={760} stroke="#e0302a" strokeWidth={8} strokeDasharray="16 10" /><circle cx={0} cy={330 + Math.sin(T * 2) * 6} r={34} fill={R.brown} stroke={P.ink} strokeWidth={5} /><Tx x={0} y={280} s={28} f="RubikMono" c="#e0302a">ASTEROID</Tx></g>
    <g transform={`translate(${X(65.9)} 760)`} opacity={fade(t, 3)}><path d="M 0 0 L 0 -150" stroke={PINK} strokeWidth={6} /><g transform={`scale(${pop(t, 3)})`}><Pip x={30} y={-150} s={.9} ph={T * 4} blink={((T % 3) < .12) ? 1 : 0} /></g><Tx x={160} y={-260} s={36} f="Caveat" c={PINK} a="start">oldest fossils: just after</Tx></g>
    <g transform={`translate(${X(66.4)} 760)`} opacity={fade(t, 6)}><rect x={-230} y={-200} width={300} height={70} rx={35} fill={R.yellow} stroke={INK} strokeWidth={4} /><Tx x={-80} y={-154} s={24} f="RubikMono">FAMILY HERE?</Tx></g>
    <g transform="translate(1580 330)"><Stamp kind="MAYBE" p={prog(t, 9.5, 10)} s={.75} sub="'may be' an ancestor" /></g>
  </Poster>;
};
/* p8: mammals stayed small */
export const SmallG: React.FC<GP> = ({ t, T }) => {
  const g = easeInOut(prog(t, 1, 4)), stuck = prog(t, 4.6, 5.4);
  const bars: [string, number, number][] = [['OUR WORLD', 1, 0], ['THIS WORLD', .1, 1]];
  return <Poster t={t} kicker="BODY SIZE" title="Mammals never grew up">
    {bars.map(([n, mx, k], i) => { const h = lerp(40, 500 * mx, k ? Math.min(g, .07 + .03 * Math.sin(T * 4) * stuck) : g); return <g key={i} transform={`translate(${520 + i * 600} 830)`}>
      <rect x={-140} y={-h} width={280} height={h} fill={k ? PINK : R.teal} stroke={INK} strokeWidth={6} /><rect x={-140} y={-h} width={280} height={h} fill="url(#dotsL)" opacity={.18} />
      <Tx x={0} y={60} s={34} f="RubikMono">{n}</Tx>
      {!k && <Tx x={0} y={-h - 30} s={40} f="Caveat" c={R.tealD} o={fade(t, 3)}>elephants, whales, you</Tx>}
      {k ? <Tx x={0} y={-h - 30} s={40} f="Caveat" c={PINK} o={fade(t, 4.5)}>rat-sized, forever</Tx> : null}
    </g>; })}
    <g transform="translate(1650 520)" opacity={fade(t, 6)}>{['APES', 'HUMANS'].map((n, i) => <g key={n} transform={`translate(0 ${i * 170})`}><rect x={-150} y={-60} width={300} height={110} rx={20} fill={PAPER} stroke={INK} strokeWidth={5} /><Tx x={0} y={14} s={38} f="Dela">{n}</Tx><path d={`M -170 -70 L ${-170 + 340 * prog(t, 6.6 + i * .5, 7 + i * .5)} ${-70 + 140 * prog(t, 6.6 + i * .5, 7 + i * .5)}`} stroke="#e0302a" strokeWidth={14} strokeLinecap="round" /></g>)}</g>
  </Poster>;
};
/* i3: Russell's dinosauroid */
const Humanoid: React.FC<{ x: number; y: number; s?: number; c?: string; d?: number }> = ({ x, y, s = 1, c = R.green, d = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`} style={{ strokeDasharray: `${d * 3000} 3000` } as any}>
  <ellipse cx={0} cy={-470} rx={80} ry={90} fill={c} stroke={P.ink} strokeWidth={7} /><ellipse cx={-28} cy={-480} rx={22} ry={30} fill="#ffe66a" stroke={P.ink} strokeWidth={5} /><ellipse cx={28} cy={-480} rx={22} ry={30} fill="#ffe66a" stroke={P.ink} strokeWidth={5} /><rect x={-30} y={-490} width={60} height={4} fill={P.ink} />
  <path d="M -70 -370 Q 0 -400 70 -370 L 60 -170 L -60 -170 Z" fill={c} stroke={P.ink} strokeWidth={7} />
  <path d="M -70 -360 L -110 -200 M 70 -360 L 110 -200" stroke={P.ink} strokeWidth={30} strokeLinecap="round" /><path d="M -70 -360 L -110 -200 M 70 -360 L 110 -200" stroke={c} strokeWidth={20} strokeLinecap="round" />
  <path d="M -40 -170 L -50 0 M 40 -170 L 50 0" stroke={P.ink} strokeWidth={34} strokeLinecap="round" /><path d="M -40 -170 L -50 0 M 40 -170 L 50 0" stroke={c} strokeWidth={24} strokeLinecap="round" />
</g>;
export const DinoAG: React.FC<GP> = ({ t, T }) => {
  const m = easeInOut(prog(t, 5, 9));
  return <Poster t={t} kicker="DALE RUSSELL · 1982" title="The dinosauroid">
    <g transform="translate(480 860)" opacity={1 - m * .6}><g transform={`scale(${pop(t, .5)})`}><Trood x={0} y={0} s={1.25} p={{ ph: T * 2, ex: 'thinking', blink: ((T % 3.5) < .12) ? 1 : 0 }} /></g><Tx x={0} y={55} s={32} f="RubikMono">TROODON</Tx><Tx x={0} y={92} s={30} f="Caveat" c={PINK}>big brain, grasping hands</Tx></g>
    <g opacity={fade(t, 4)}><path d={`M 820 620 L ${820 + 300 * m} 620`} stroke={INK} strokeWidth={10} /><path d={`M ${820 + 300 * m} 590 l 40 30 l -40 30`} fill={INK} /><Tx x={980} y={580} s={30} f="Caveat" c={PINK}>"what if it kept evolving?"</Tx></g>
    <g opacity={m}><Humanoid x={1460} y={860} s={1.0 * (.8 + .2 * m)} c="#7ac8a0" d={m} /><Tx x={1460} y={915} s={32} f="RubikMono" o={fade(t, 9)}>DINOSAUROID</Tx></g>
    <g transform="translate(1660 310)"><rect x={-130} y={-50} width={260} height={84} rx={12} fill={PAPER} stroke={INK} strokeWidth={4} transform="rotate(4)" /><Tx x={0} y={6} s={30} f="Caveat" r={4}>museum model, 1982</Tx></g>
  </Poster>;
};
/* i6: bird, not human */
export const DinoBG: React.FC<GP> = ({ t, T }) => <Poster t={t} kicker="THE CRITICS" title="More bird than human">
  <g transform="translate(560 860)"><Humanoid x={0} y={0} s={.9} c="#7ac8a0" /><Tx x={0} y={60} s={30} f="RubikMono">RUSSELL'S VERSION</Tx>
    <g transform="translate(0 -560)"><Stamp kind="MYTH" p={prog(t, 2.2, 2.7)} s={.7} sub="too human-shaped" /></g></g>
  <g transform="translate(1380 860)"><g transform={`scale(${pop(t, 3.2)})`}><Trood x={0} y={0} s={1.2} p={{ ph: T * 2, ex: 'happy', open: .2 + .2 * Math.sin(T * 6), arm: .3 + .2 * Math.sin(T * 2), blink: ((T % 3.5) < .12) ? 1 : 0 }} /></g><Tx x={0} y={60} s={30} f="RubikMono">A BIG, CLEVER BIRD</Tx>
    <Tx x={-260} y={-520} s={34} f="Caveat" c={PINK} o={fade(t, 4.4)} r={-8}>tail for balance</Tx><Tx x={240} y={-180} s={34} f="Caveat" c={PINK} o={fade(t, 5)} r={6}>feathers</Tx></g>
</Poster>;
/* t5b: Chicxulub */
export const ChicxG: React.FC<GP> = ({ t, T }) => {
  const r = easeOut(prog(t, .5, 2.5));
  return <Poster t={t} kicker="YUCATÁN, MEXICO" title="Chicxulub crater" bg="#e8f4ee">
    <path d="M 300 380 Q 700 300 900 420 Q 1000 600 1200 640 Q 1400 600 1500 460 Q 1700 420 1800 560 L 1800 1100 L 300 1100 Z" fill="#9fd8a8" stroke={P.ink} strokeWidth={6} />
    <path d="M 200 380 L 300 380 Q 700 300 900 420" fill="none" />
    <rect x={-200} y={-200} width={2320} height={560} fill={R.teal} opacity={.35} />
    <g transform="translate(960 500)">{[1, .75, .5].map((k, i) => <circle key={i} r={230 * k * r * (1 + .02 * Math.sin(T * 3 + i))} fill="none" stroke={i ? R.orange : '#e0302a'} strokeWidth={i ? 6 : 12} strokeDasharray={i ? '18 12' : undefined} />)}
      <line x1={-230} y1={0} x2={230} y2={0} stroke={INK} strokeWidth={8} opacity={fade(t, 2.5)} /><line x1={-230} y1={-20} x2={-230} y2={20} stroke={INK} strokeWidth={8} opacity={fade(t, 2.5)} /><line x1={230} y1={-20} x2={230} y2={20} stroke={INK} strokeWidth={8} opacity={fade(t, 2.5)} /></g>
      <g opacity={fade(t, 2.8)} transform="translate(1480 640)"><rect x={-200} y={-90} width={400} height={130} rx={24} fill={PAPER} stroke={INK} strokeWidth={6} /><Head x={0} y={10} s={78} t={t}>~180 km</Head><Tx x={0} y={-56} s={22} f="RubikMono">WIDE</Tx></g>
    <Tx x={430} y={330} s={34} f="Caveat" c={INK} o={fade(t, 1.4)}>buried under the coast</Tx>
    <g transform="translate(1600 320)"><Stamp kind="EVIDENCE" p={prog(t, 4, 4.5)} s={.8} sub="found in 1978–1991" /></g>
  </Poster>;
};
/* t6: bird family tree */
export const BirdTreeG: React.FC<GP> = ({ t, T }) => {
  const kpg = 560, p = easeOut(prog(t, .3, 3));
  const br: [number, boolean, string][] = [[260, false, 'sauropods'], [500, false, 'horned'], [740, false, 'duckbills'], [990, false, 'tyrannosaurs'], [1260, true, 'BIRDS']];
  return <Poster t={t} kicker="ORGAN ET AL. · 2008" title="Birds ARE dinosaurs">
    <path d={`M 760 1000 L 760 900`} stroke={INK} strokeWidth={12} />
    {br.map(([x, live, n], i) => <g key={i}>
      <path d={`M 760 900 Q ${x} 880 ${x} ${live ? 300 : lerp(900, kpg, p)}`} stroke={live ? PINK : R.teal} strokeWidth={live ? 14 : 12} fill="none" style={live ? draw(t, .3, 3.5, 900) : undefined} />
      {!live && p > .95 && <><path d={`M ${x - 30} ${kpg - 30} L ${x + 30} ${kpg + 30} M ${x + 30} ${kpg - 30} L ${x - 30} ${kpg + 30}`} stroke="#e0302a" strokeWidth={9} /><Tx x={x} y={kpg - 50} s={21} f="RubikMono">{n}</Tx></>}
    </g>)}
    <line x1={160} y1={kpg} x2={1500} y2={kpg} stroke="#e0302a" strokeWidth={6} strokeDasharray="14 10" /><Tx x={1500} y={kpg + 46} s={26} f="RubikMono" c="#e0302a" a="end">66 MILLION YEARS AGO</Tx>
    <g transform="translate(1260 300)">{[[-160, 'CHICKEN'], [0, 'OSTRICH'], [160, 'CROW']].map(([dx, n], i) => <g key={i} transform={`translate(${dx} ${-20 + Math.sin(T * 2 + i) * 6}) scale(${pop(t, 3.6 + i * .5)})`}><DinoIcon x={0} y={0} s={1.5} c={[R.yellow, '#c8a070', '#2a2a3a'][i]} bird /><Tx x={0} y={50} s={22} f="RubikMono">{n}</Tx></g>)}</g>
    <g transform="translate(1660 760)" opacity={fade(t, 6)}><rect x={-190} y={-110} width={380} height={200} rx={20} fill={PAPER} stroke={INK} strokeWidth={5} /><Tx x={0} y={-50} s={30} f="RubikMono">T. REX PROTEIN</Tx><Tx x={0} y={0} s={34} f="Caveat" c={PINK}>closest living match:</Tx><Tx x={0} y={50} s={34} f="Grot">chickens & ostriches</Tx></g>
    <g transform="translate(1660 470)"><Stamp kind="EVIDENCE" p={prog(t, 8, 8.5)} s={.7} sub="68-million-year-old bone" /></g>
  </Poster>;
};
/* t7: 11,000 species + neurons */
export const NeuronG: React.FC<GP> = ({ t, T }) => {
  const n = Math.round(easeOut(prog(t, .3, 3.5)) * 11000);
  return <Poster t={t} kicker="LIVING DINOSAURS" title="Small, many, clever">
    {Array.from({ length: 40 }).map((_, i) => { const r0 = rng(i + 3); const y = ((T * (40 + r0() * 60) + r0() * 900) % 900) + 260; return <DinoIcon key={i} x={80 + r0() * 760} y={y} s={.6 + r0() * .5} c={[R.teal, PINK, R.yellow, R.orange, R.navy][i % 5]} bird o={.8 * fade(t, .3 + i * .03)} />; })}
    <g transform="translate(470 620)"><rect x={-330} y={-110} width={660} height={200} rx={30} fill={PAPER} stroke={INK} strokeWidth={6} /><Head x={0} y={10} s={110} t={t}>{n.toLocaleString('en-US')}</Head><Tx x={0} y={70} s={32} f="RubikMono">BIRD SPECIES</Tx></g>
    {[[1200, 'PARROT', 1.0, PINK], [1640, 'MONKEY', .5, R.teal]].map(([x, nm, dens, c], k) => <g key={k} transform={`translate(${x} 640)`} opacity={fade(t, 4 + (k as number) * .6)}>
      <ellipse rx={170} ry={130} fill={PAPER} stroke={INK} strokeWidth={7} />
      {Array.from({ length: Math.round(110 * (dens as number)) }).map((_, i) => { const r0 = rng(i + 50 + (k as number) * 300); const a = r0() * Math.PI * 2, rr = Math.sqrt(r0()); return <circle key={i} cx={Math.cos(a) * rr * 150} cy={Math.sin(a) * rr * 112} r={6} fill={c as string} opacity={.5 + .5 * Math.abs(Math.sin(T * 4 + i))} />; })}
      <Tx x={0} y={190} s={32} f="RubikMono">{nm as string}</Tx></g>)}
    <Tx x={1420} y={360} s={38} f="Caveat" c={PINK} o={fade(t, 5.5)}>same brain size — more neurons</Tx>
    <g transform="translate(1420 960)"><Stamp kind="EVIDENCE" p={prog(t, 6.5, 7)} s={.7} sub="Olkowicz et al., 2016" /></g>
  </Poster>;
};
