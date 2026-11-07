import React from 'react';
import { clamp, lerp, easeOut, easeInOut, spring, prog, rng } from './lib';
import { P } from './art';
import { A, Star } from './sets2';
import { MChar, CAST, macedon, persian } from './chars';
import LAND from './asiamap.json';

/* ===== NEW look for ep07: explainers painted like a Greek black-figure vase — terracotta field, black figures, meander borders, incised white lines.
   Every number carries its source line. ===== */
type GP = { t: number; T: number; d: number };
const TC = '#c8693a', BLK = '#1c1410', CRM = '#f2e2c4';
export const T_: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; f?: string; w?: number; children: React.ReactNode }> = ({ x, y, s = 40, c = BLK, a = 'middle', o = 1, f = 'Cinzel', w = 700, children }) =>
  <text x={x} y={y} fontFamily={f} fontWeight={f === 'Cinzel' || f === 'Brico' ? w : 400} fontSize={s} fill={c} textAnchor={a} opacity={o}>{children}</text>;
export const pop = (t: number, a: number) => spring(prog(t, a, a + .6) * 1.2, 10, .5);
export const fade = (t: number, a: number) => clamp((t - a) * 3);
const Meander: React.FC<{ y: number; t: number; c?: string; h?: number }> = ({ y, t, c = BLK, h = 34 }) => <g>{Array.from({ length: 34 }).map((_, i) => { const x = -120 + i * 64 + (t * 10) % 64; return <path key={i} d={`M ${x} ${y + h} L ${x} ${y} L ${x + 48} ${y} L ${x + 48} ${y + h * .7} L ${x + 16} ${y + h * .7} L ${x + 16} ${y + h * .35} L ${x + 32} ${y + h * .35}`} stroke={c} strokeWidth={6} fill="none" />; })}</g>;
export const Vase: React.FC<{ t: number; title: string; note?: string; children: React.ReactNode }> = ({ t, title, note, children }) => <g>
  <rect x={-200} y={-200} width={2320} height={1480} fill={BLK} />
  <rect x={40} y={40} width={1840} height={1000} rx={30} fill={TC} />
  {Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 9); return <ellipse key={i} cx={60 + R() * 1800} cy={60 + R() * 960} rx={40 + R() * 160} ry={20 + R() * 60} fill={R() > .5 ? '#b85a2e' : '#d4784a'} opacity={.35} />; })}
  <rect x={40} y={40} width={1840} height={70} fill={BLK} /><Meander y={58} t={t} c={TC} />
  <rect x={40} y={970} width={1840} height={70} fill={BLK} /><Meander y={988} t={-t} c={TC} />
  <T_ x={960} y={196} s={66} o={fade(t, .1)}>{title}</T_>
  <path d={`M ${960 - 320 * easeOut(prog(t, .2, 1))} 222 L ${960 + 320 * easeOut(prog(t, .2, 1))} 222`} stroke={BLK} strokeWidth={6} />
  {children}
  {note && <T_ x={960} y={944} s={22} f="Mono" c={BLK} o={fade(t, .8)}>{note}</T_>}
</g>;
/* black-figure silhouette of a rig character, with incised cream lines */
export const BF: React.FC<{ children: React.ReactNode }> = ({ children }) => <g filter="url(#sil)">{children}</g>;
export const Stamp: React.FC<{ kind: 'MYTH' | 'EVIDENCE' | 'MAYBE'; p: number; x?: number; y?: number; s?: number; sub?: string }> = ({ kind, p, x = 0, y = 0, s = 1, sub }) => {
  const c = kind === 'MYTH' ? '#a8322a' : kind === 'EVIDENCE' ? '#2f6a4a' : '#b8781a';
  const k = spring(clamp(p) * 1.2, 12, .45);
  return <g transform={`translate(${x} ${y}) scale(${s * (2 - k)}) rotate(-8)`} opacity={clamp(p * 4)}>
    <rect x={-190} y={-56} width={380} height={112} rx={10} fill="rgba(242,226,196,.92)" stroke={c} strokeWidth={9} />
    <rect x={-176} y={-42} width={352} height={84} rx={6} fill="none" stroke={c} strokeWidth={3} />
    <text x={0} y={sub ? 6 : 22} fontFamily="Cinzel" fontWeight={900} fontSize={sub ? 54 : 64} fill={c} textAnchor="middle" letterSpacing={4}>{kind}</text>
    {sub && <text x={0} y={34} fontFamily="Mono" fontSize={20} fill={c} textAnchor="middle">{sub}</text>}
  </g>;
};
export const Rewind: React.FC<GP> = ({ t, d }) => {
  const p = easeInOut(prog(t, .3, d - .6)); const yr = lerp(328, 344, p);
  return <Vase t={t} title="SIXTEEN YEARS EARLIER">
    <g transform="translate(960 600)">
      <Star x={0} y={-10} r={300 + Math.sin(t * 2) * 8} c={BLK} o={.18} />
      <T_ x={0} y={70} s={230} w={900}>{Math.round(yr)} BC</T_>
      <T_ x={0} y={200} s={36} f="Mono">◄◄ PELLA · MACEDON</T_>
    </g>
  </Vase>;
};

/* ---- the map: Greece → India (Natural Earth land; Caspian drawn by hand) ---- */
const K = Math.cos(34 * Math.PI / 180);
const CASPIAN: [number, number][] = [[47, 45], [49, 46.8], [51.5, 47], [53, 45.5], [51, 44.5], [50.5, 43], [51.5, 41.5], [52.8, 41], [54, 39], [53.9, 37.3], [51, 36.7], [49, 37.6], [49.3, 40], [48, 42.5], [47.5, 43.6]];
export const PL: Record<string, [number, number]> = { PELLA: [22.52, 40.76], MIEZA: [22.1, 40.63], AEGAE: [22.32, 40.48], ATHENS: [23.73, 37.98], CORINTH: [22.93, 37.91], HELLESPONT: [26.4, 40.2], GRANICUS: [27.3, 40.25], GORDION: [32.0, 39.65], ISSUS: [36.2, 36.85], TYRE: [35.2, 33.27], SIWA: [25.52, 29.2], MEMPHIS: [31.25, 29.85], GAUGAMELA: [43.5, 36.55], BABYLON: [44.42, 32.54], PERSEPOLIS: [52.89, 29.93], ECBATANA: [48.51, 34.8], SAMARKAND: [66.96, 39.65], HYDASPES: [73.6, 32.8], HYPHASIS: [75.2, 31.5], GEDROSIA: [62.5, 26.2] };
const ROUTE: [number, number][] = [[22.52, 40.76], [24.5, 40.9], [26.4, 40.2], [27.3, 40.25], [28.0, 38.6], [27.4, 37.04], [30.7, 36.9], [32.0, 39.65], [34.6, 37.4], [36.2, 36.85], [35.2, 33.27], [34.0, 31.4], [31.25, 29.85], [29.9, 31.2], [25.52, 29.2], [31.25, 29.85], [35.2, 33.27], [38.0, 36.4], [43.5, 36.55], [44.42, 32.54], [48.6, 32.0], [52.89, 29.93], [48.51, 34.8], [54.4, 36.6], [59.6, 36.3], [62.2, 34.3], [65.7, 31.6], [67.0, 36.7], [66.96, 39.65], [69.2, 34.5], [72.4, 33.9], [73.6, 32.8], [75.2, 31.5], [73.0, 30.0], [70.0, 27.0], [67.0, 24.9], [62.5, 26.2], [58.0, 27.1], [52.89, 29.93], [48.6, 32.0], [44.42, 32.54]];
const RLEN = (() => { let a = [0]; for (let i = 1; i < ROUTE.length; i++) a.push(a[i - 1] + Math.hypot((ROUTE[i][0] - ROUTE[i - 1][0]) * K, ROUTE[i][1] - ROUTE[i - 1][1])); return a; })();
const MP = (lon: number, lat: number): [number, number] => [960 + (lon - 47) * K * 30, 560 - (lat - 33.5) * 30];
const MapBase: React.FC<GP & { from?: number; to?: number; mark?: string[]; zoom?: [number, number, number]; title?: string; note?: string; extra?: React.ReactNode }> = ({ t, T, from = 0, to = 0, mark = [], zoom, title, note, extra }) => {
  const zp = zoom ? easeInOut(prog(t, .3, 2.8)) : 0;
  const z = lerp(1, zoom ? zoom[2] : 1, zp); const [fx, fy] = zoom ? MP(zoom[0], zoom[1]) : [960, 540];
  const L0 = RLEN[RLEN.length - 1]; const a = from * L0, b = lerp(from, to, easeInOut(prog(t, .8, Math.max(2.5, t * 0 + 5.5)))) * L0;
  const pts = ROUTE.map(([x, y]) => MP(x, y)); const len = RLEN.map((v) => v * K * 30 / K);
  const seg = (lo: number, hi: number) => { const out: string[] = []; let at: [number, number] = pts[0];
    for (let i = 1; i < pts.length; i++) { const s0 = RLEN[i - 1], s1 = RLEN[i]; if (s1 < lo || s0 > hi) continue; const q0 = clamp((lo - s0) / (s1 - s0)), q1 = clamp((hi - s0) / (s1 - s0));
      const p0: [number, number] = [lerp(pts[i - 1][0], pts[i][0], q0), lerp(pts[i - 1][1], pts[i][1], q0)], p1: [number, number] = [lerp(pts[i - 1][0], pts[i][0], q1), lerp(pts[i - 1][1], pts[i][1], q1)];
      if (!out.length) out.push(`M ${p0[0]} ${p0[1]}`); out.push(`L ${p1[0]} ${p1[1]}`); at = p1; }
    return { d: out.join(' '), at }; };
  const done = seg(0, a), now = seg(a, b);
  return <g><rect x={-200} y={-200} width={2320} height={1480} fill="#3f6f86" />
    {Array.from({ length: 34 }).map((_, i) => <path key={i} d={`M ${(i * 137 + T * 10) % 2100 - 100} ${(i * 211) % 1080} q 20 -8 40 0`} stroke="#fff" strokeOpacity={.25} strokeWidth={3} fill="none" />)}
    <g transform={`translate(960 540) scale(${z}) translate(${-lerp(960, fx, zp)} ${-lerp(540, fy, zp)})`}>
      {(LAND as number[][][]).map((ring, i) => <path key={i} d={'M ' + ring.map(([x, y]) => MP(x, y).map((v) => v.toFixed(1)).join(' ')).join(' L ') + ' Z'} fill={TC} stroke={BLK} strokeWidth={3 / z} strokeLinejoin="round" />)}
      <path d={'M ' + CASPIAN.map(([x, y]) => MP(x, y).join(' ')).join(' L ') + ' Z'} fill="#3f6f86" stroke={BLK} strokeWidth={3 / z} />
      {/* Persian empire tint */}
      <path d={'M ' + [[26, 41], [34, 42], [42, 41.5], [48, 42], [55, 40], [62, 42], [68, 41], [72, 37], [74, 33], [71, 27], [62, 25], [56, 26], [50, 29], [47, 30], [40, 29], [34, 28], [30, 31], [27, 35], [26, 38]].map(([x, y]) => MP(x, y).join(' ')).join(' L ') + ' Z'} fill={BLK} opacity={.14 * fade(t, .5)} />
      {done.d && <path d={done.d} stroke={CRM} strokeWidth={6 / z} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={.8} />}
      {now.d && <path d={now.d} stroke={CRM} strokeWidth={9 / z} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {to > 0 && <g transform={`translate(${now.at[0]} ${now.at[1]}) scale(${1 / z})`}><circle r={15} fill={A.purple} stroke={CRM} strokeWidth={4} /><circle r={22 + (T * 24) % 26} fill="none" stroke={CRM} strokeWidth={3} opacity={1 - ((T * 24) % 26) / 26} /></g>}
      {mark.map((m, k) => { const [px, py] = MP(...PL[m]); return <g key={m} opacity={fade(t, .5 + k * .3)} transform={`translate(${px} ${py}) scale(${1 / z})`}><circle r={9} fill={BLK} stroke={CRM} strokeWidth={3} /><text x={14} y={-12} fontFamily="Cinzel" fontWeight={700} fontSize={26} fill={BLK} stroke={TC} strokeWidth={7} paintOrder="stroke">{m}</text></g>; })}
      {extra}
    </g>
    {title && <g><rect x={60} y={50} width={760} height={90} fill={BLK} /><T_ x={440} y={112} s={44} c={CRM}>{title}</T_></g>}
    {note && <text x={64} y={186} fontFamily="Mono" fontSize={21} fill={CRM} stroke="rgba(28,20,16,.85)" strokeWidth={7} paintOrder="stroke">{note}</text>}
  </g>;
};
export const MapMacedon: React.FC<GP> = (p) => <MapBase {...p} zoom={[23.3, 39.5, 5.2]} mark={['PELLA', 'MIEZA', 'AEGAE', 'ATHENS', 'CORINTH']} title="MACEDON, 344 BC" note="Pella, Mieza and Aegae lie within ~40 km of each other · Map: Natural Earth" />;
export const MapAsia1: React.FC<GP> = (p) => <MapBase {...p} zoom={[30, 38.5, 2.6]} to={.12} mark={['PELLA', 'HELLESPONT', 'GRANICUS', 'GORDION']} title="334 – 333 BC" note="Route after Arrian, Anabasis books 1–2 · simplified" />;
export const MapAsia2: React.FC<GP> = (p) => <MapBase {...p} from={.12} to={.45} zoom={[38, 33.5, 1.4]} mark={['ISSUS', 'TYRE', 'SIWA', 'GAUGAMELA', 'BABYLON', 'PERSEPOLIS']} title="333 – 330 BC" note="Arrian books 2–3 · Siwa visit 331 BC" />;
export const MapAsia3: React.FC<GP> = (p) => <MapBase {...p} from={.45} to={1} mark={['PELLA', 'GAUGAMELA', 'PERSEPOLIS', 'SAMARKAND', 'HYDASPES', 'HYPHASIS', 'GEDROSIA', 'BABYLON']} title="PELLA TO INDIA, AND BACK" note="334–323 BC · route after Arrian, Anabasis 3–7 · simplified" />;

/* ---- the golden mean ---- */
export const GoldenMean: React.FC<GP> = ({ t, T }) => { const p = Math.sin(t * 1.3) * (1 - prog(t, 3.2, 4.2)); const x = 960 + p * 560;
  return <Vase t={t} title="THE GOLDEN MEAN" note="Aristotle, Nicomachean Ethics, book 2 — courage lies between cowardice and recklessness">
    <line x1={300} y1={600} x2={1620} y2={600} stroke={BLK} strokeWidth={12} strokeLinecap="round" />
    {[[360, 'COWARDICE', 'too little'], [960, 'COURAGE', 'the middle'], [1560, 'RECKLESSNESS', 'too much']].map(([px, l, s], k) => <g key={k} opacity={fade(t, .5 + k * .5)}>
      <circle cx={px as number} cy={600} r={k === 1 ? 26 : 18} fill={k === 1 ? CRM : BLK} stroke={BLK} strokeWidth={5} /><T_ x={px as number} y={700} s={k === 1 ? 50 : 40} c={k === 1 ? CRM : BLK}>{l}</T_><T_ x={px as number} y={746} s={26} f="Mono">{s}</T_></g>)}
    <g transform={`translate(${x} 470)`}><BF><MChar look={CAST.youSt} x={0} y={110} s={.55} pose={{ walk: 1, phase: t * 8, armF: -1.2, armB: 1.2, elbowF: .2, expr: 'worried' }} /></BF></g>
    <g opacity={fade(t, 4.2)}><Star x={960} y={410} r={70} c={CRM} /></g>
  </Vase>; };
/* ---- the phalanx & the sarissa ---- */
export const SarissaGfx: React.FC<GP> = ({ t }) => { const p = easeOut(prog(t, .6, 2.2));
  return <Vase t={t} title="THE SARISSA" note="Theophrastus: 12 cubits (~5.5 m) · Polybius: 14 cubits in later times · Persian spear ~2 m">
    <g transform="translate(330 760)">
      <BF><MChar look={macedon(1)} x={0} y={0} s={.95} pose={{ holdF: 'sarissa', propA: 88, armF: -1.1, elbowF: .6, expr: 'fierce' }} /></BF>
      <line x1={-60} y1={40} x2={-60 + 1220 * p} y2={40} stroke={BLK} strokeWidth={5} />{p > .98 && <T_ x={560} y={90} s={36} f="Mono">≈ 6 m</T_>}
    </g>
    <g transform="translate(1560 760)" opacity={fade(t, 2.2)}>
      <BF><MChar look={persian(2)} x={0} y={0} s={.95} flip pose={{ holdF: 'spear', propA: -60, armF: -1.1, elbowF: .6, expr: 'scared' }} /></BF>
      <T_ x={-60} y={90} s={36} f="Mono">≈ 2 m</T_>
    </g>
    <g opacity={fade(t, 3.6)}>{Array.from({ length: 16 }).map((_, r) => <rect key={r} x={760 + (r % 4) * 30} y={300 + Math.floor(r / 4) * 30} width={22} height={22} fill={BLK} />)}<T_ x={1090} y={350} s={34} a="start" f="Mono">16 men deep</T_><T_ x={1090} y={392} s={26} a="start" f="Mono">5 rows of points reach the front</T_></g>
  </Vase>; };
/* ---- Persepolis treasure ---- */
export const Treasure: React.FC<GP> = ({ t }) => { const n = Math.floor(easeOut(prog(t, .6, 4)) * 150);
  return <Vase t={t} title="THE TREASURE OF PERSEPOLIS" note="Plutarch, Alexander 37: 10,000 pairs of mules and 5,000 camels">
    <g transform="translate(220 360)">{Array.from({ length: 150 }).map((_, i) => <g key={i} transform={`translate(${(i % 25) * 60} ${Math.floor(i / 25) * 80})`} opacity={i < n ? 1 : .12}>
      {i % 3 === 2 ? <path d="M -20 0 L -18 -30 Q -10 -50 0 -36 Q 10 -54 20 -34 L 26 -30 L 30 -50 L 38 -46 L 30 -26 L 22 0 M -14 0 L -14 -30 M 14 0 L 14 -30" stroke={BLK} strokeWidth={6} fill={BLK} />
        : <path d="M -22 0 L -20 -26 L 18 -26 L 26 -40 L 32 -36 L 24 -20 L 20 0 M -14 -26 L -14 0 M 12 -26 L 12 0" stroke={BLK} strokeWidth={7} fill={BLK} />}</g>)}</g>
    <g opacity={fade(t, 2)}><T_ x={600} y={880} s={44}>20,000 mules</T_><T_ x={1320} y={880} s={44}>5,000 camels</T_></g>
  </Vase>; };
/* ---- who wrote it down ---- */
export const Sources: React.FC<GP> = ({ t }) => { const p = easeOut(prog(t, .4, 3));
  const ev: [number, string, string, boolean][] = [[-323, '323 BC', 'ALEXANDER DIES', true], [-300, 'c. 300 BC', 'PTOLEMY · ARISTOBULUS (LOST)', false], [-30, 'c. 30 BC', 'DIODORUS', true], [50, 'c. 50 AD', 'CURTIUS', true], [100, 'c. 100 AD', 'PLUTARCH', true], [130, 'c. 130 AD', 'ARRIAN', true]];
  const X = (y: number) => 260 + (y + 340) / 500 * 1400;
  return <Vase t={t} title="WHO TOLD THE STORY?" note="Eyewitness books by Ptolemy, Aristobulus, Callisthenes & Nearchus survive only as quotations">
    <line x1={X(-340)} y1={590} x2={lerp(X(-340), X(160), p)} y2={590} stroke={BLK} strokeWidth={8} />
    {ev.map(([y, d, l, ok], k) => <g key={k} opacity={fade(t, .6 + k * .45)} transform={`translate(${X(y)} 590)`}><circle r={18} fill={ok ? (k ? CRM : BLK) : 'none'} stroke={BLK} strokeWidth={5} strokeDasharray={ok ? undefined : '6 5'} />
      <T_ x={0} y={k % 2 ? 76 : -44} s={26} f="Mono">{d}</T_><T_ x={0} y={k % 2 ? 114 : -82} s={k === 1 ? 24 : 32} c={ok ? BLK : '#5a3a2a'}>{l}</T_></g>)}
    <g opacity={fade(t, 3.6)}><path d={`M ${X(-323)} 720 Q ${(X(-323) + X(130)) / 2} 840 ${X(130)} 720`} stroke={CRM} strokeWidth={6} fill="none" strokeDasharray="12 8" /><T_ x={(X(-323) + X(130)) / 2} y={860} s={36} c={CRM} f="Brico" w={800}>300 – 450 years later</T_></g>
  </Vase>; };
/* ---- the 'no more worlds' myth ---- */
export const Worlds: React.FC<GP> = ({ t, T }) => <Vase t={t} title="NO MORE WORLDS TO CONQUER?" note="Plutarch, On Tranquillity of Mind 4 (466D): he wept at hearing of infinite worlds, 'and we have not yet conquered even one'">
  {Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 3); const a = R() * Math.PI * 2, r = 120 + R() * 480 * easeOut(prog(t, 2.2, 4.5)); return <circle key={i} cx={960 + Math.cos(a + T * .05) * r * 1.4} cy={560 + Math.sin(a + T * .05) * r * .6} r={10 + R() * 22} fill={BLK} opacity={fade(t, 2.2)} />; })}
  <circle cx={960} cy={560} r={70} fill={CRM} stroke={BLK} strokeWidth={6} />
  <g transform="translate(560 420)"><Stamp kind="MYTH" p={prog(t, 1, 1.6)} s={.9} sub="the popular version" /></g>
  <g transform="translate(1380 720)"><Stamp kind="EVIDENCE" p={prog(t, 4.8, 5.4)} s={.9} sub="Plutarch's version" /></g>
</Vase>;
