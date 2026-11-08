import React from 'react';
import { clamp, lerp, easeOut, easeInOut, spring, prog, rng } from './lib';
import { P } from './art';
import { MChar, CAST, villager, Aurochs } from './chars';
import { Hand, Bucranium, C } from './sets3';

/* ===== NEW look for ep08: explainers painted ON a Çatalhöyük wall — white lime plaster, red ochre, soot black,
   a zig-zag border band and painted handprints. Numbers carry their source line. Fonts: Rubik Dirt (earthy titles),
   Bowlby One SC (labels), Caveat Brush (painted notes). ===== */
type GP = { t: number; T: number; d: number };
const PL = C.plaster, RED = C.ochre, BLK = C.soot;
export const T_: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; f?: string; children: React.ReactNode }> = ({ x, y, s = 40, c = BLK, a = 'middle', o = 1, f = 'Bowlby', children }) =>
  <text x={x} y={y} fontFamily={f} fontSize={s} fill={c} textAnchor={a} opacity={o}>{children}</text>;
export const pop = (t: number, a: number) => spring(prog(t, a, a + .6) * 1.2, 10, .5);
export const fade = (t: number, a: number) => clamp((t - a) * 3);
const Zig: React.FC<{ y: number; t: number; c?: string }> = ({ y, t, c = RED }) => <g>{Array.from({ length: 40 }).map((_, i) => { const x = -120 + i * 56 + (t * 8) % 56; return <path key={i} d={`M ${x} ${y + 30} L ${x + 28} ${y} L ${x + 56} ${y + 30}`} stroke={c} strokeWidth={9} fill="none" strokeLinejoin="round" />; })}</g>;
export const Wall: React.FC<{ t: number; title: string; note?: string; children: React.ReactNode }> = ({ t, title, note, children }) => <g>
  <rect x={-200} y={-200} width={2320} height={1480} fill="#e6dccb" />
  <rect x={30} y={30} width={1860} height={1020} rx={40} fill={PL} />
  {Array.from({ length: 36 }).map((_, i) => { const R = rng(i + 4); return <ellipse key={i} cx={60 + R() * 1800} cy={60 + R() * 960} rx={60 + R() * 200} ry={20 + R() * 60} fill={C.plasterD} opacity={.4} />; })}
  <rect x={30} y={30} width={1860} height={64} fill={BLK} /><Zig y={47} t={t} />
  <rect x={30} y={986} width={1860} height={64} fill={BLK} /><Zig y={1003} t={-t} />
  <Hand x={110} y={200} s={1.1} r={-14} o={.85 * fade(t, .1)} /><Hand x={1810} y={200} s={1.1} r={14} o={.85 * fade(t, .2)} />
  <T_ x={960} y={196} s={78} f="Dirt" c={RED} o={fade(t, .1)}>{title}</T_>
  <path d={`M ${960 - 340 * easeOut(prog(t, .2, 1))} 224 L ${960 + 340 * easeOut(prog(t, .2, 1))} 224`} stroke={BLK} strokeWidth={6} strokeLinecap="round" />
  {children}
  {note && <T_ x={960} y={950} s={30} f="Brush" c={BLK} o={fade(t, .8)}>{note}</T_>}
</g>;
export const Stamp: React.FC<{ kind: 'MYTH' | 'EVIDENCE' | 'MAYBE'; p: number; x?: number; y?: number; s?: number; sub?: string }> = ({ kind, p, x = 0, y = 0, s = 1, sub }) => {
  const c = kind === 'MYTH' ? '#a8322a' : kind === 'EVIDENCE' ? '#2f6a4a' : '#b8781a';
  const k = spring(clamp(p) * 1.2, 12, .45);
  return <g transform={`translate(${x} ${y}) scale(${s * (2 - k)}) rotate(-8)`} opacity={clamp(p * 4)}>
    <rect x={-200} y={-58} width={400} height={116} rx={12} fill="rgba(241,236,224,.94)" stroke={c} strokeWidth={9} />
    <rect x={-186} y={-44} width={372} height={88} rx={8} fill="none" stroke={c} strokeWidth={3} strokeDasharray="10 6" />
    <text x={0} y={sub ? 8 : 24} fontFamily="Dirt" fontSize={sub ? 58 : 70} fill={c} textAnchor="middle" letterSpacing={4}>{kind}</text>
    {sub && <text x={0} y={36} fontFamily="Mono" fontSize={19} fill={c} textAnchor="middle">{sub}</text>}
  </g>;
};

/* ---------- Anatolia map (hand-simplified outline) ---------- */
const TR: [number, number][] = [[26.0, 41.8], [28.0, 41.6], [29.1, 41.2], [31.2, 41.1], [33.4, 42.0], [35.2, 42.0], [36.8, 41.3], [38.4, 40.9], [40.1, 41.0], [41.5, 41.5], [43.4, 41.1], [44.8, 39.7], [44.2, 37.2], [42.8, 37.3], [40.7, 37.1], [38.5, 36.8], [36.7, 36.8], [36.0, 36.0], [35.8, 36.8], [34.6, 36.8], [33.5, 36.2], [32.0, 36.5], [30.6, 36.7], [29.6, 36.2], [28.3, 36.8], [27.3, 37.4], [26.3, 38.3], [26.7, 39.3], [26.1, 39.5], [26.6, 40.3], [26.0, 40.6]];
const pj = (lon: number, lat: number, z = 1, cx = 35, cy = 39): [number, number] => [960 + (lon - cx) * 86 * z, 590 - (lat - cy) * 100 * z];
export const PLACE: Record<string, [number, number, string]> = { CAT: [32.83, 37.67, 'ÇATALHÖYÜK'], KON: [32.49, 37.87, 'Konya'], HAS: [34.17, 38.13, 'Hasan Dağı'], GOL: [34.57, 38.27, 'Göllüdağ'], IST: [28.98, 41.01, 'Istanbul'], ANK: [32.85, 39.93, 'Ankara'] };
const MapBase: React.FC<GP & { z?: [number, number, number]; mark: string[]; route?: boolean; title: string; note?: string; erupt?: boolean }> = ({ t, T, d, z = [35, 39, 1], mark, route, title, note, erupt }) => {
  const zz = lerp(1, z[2], easeInOut(prog(t, .6, 3.2))); const cx = lerp(35, z[0], easeInOut(prog(t, .6, 3.2))), cy = lerp(39, z[1], easeInOut(prog(t, .6, 3.2)));
  const P2 = (lon: number, lat: number) => pj(lon, lat, zz, cx, cy);
  const path = TR.map(([a, b], i) => (i ? 'L' : 'M') + P2(a, b).join(' ')).join(' ') + ' Z';
  const c = P2(PLACE.CAT[0], PLACE.CAT[1]), g = P2(PLACE.GOL[0], PLACE.GOL[1]), h = P2(PLACE.HAS[0], PLACE.HAS[1]);
  const rp = easeOut(prog(t, 1.6, 4));
  return <Wall t={t} title={title} note={note}>
    <defs><clipPath id="mapclip"><rect x={80} y={250} width={1760} height={660} rx={30} /></clipPath></defs>
    <g clipPath="url(#mapclip)">
      <rect x={80} y={250} width={1760} height={660} fill="#cfdcd6" />
      {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M 60 ${270 + i * 42} q 40 -12 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`} stroke="#b6c8c0" strokeWidth={3} fill="none" transform={`translate(${(T * 10 + i * 20) % 80 - 80} 0)`} />)}
      <path d={path} fill="#e6d2a8" stroke={BLK} strokeWidth={6} strokeLinejoin="round" />
      <path d={path} fill="none" stroke={RED} strokeWidth={2} strokeDasharray="4 10" transform="translate(6 6)" opacity={.5} />
      {route && <g><path d={`M ${g[0]} ${g[1]} Q ${(g[0] + c[0]) / 2} ${Math.min(g[1], c[1]) - 80} ${c[0]} ${c[1]}`} stroke={RED} strokeWidth={10} fill="none" strokeDasharray="2000" strokeDashoffset={2000 * (1 - rp)} strokeLinecap="round" />
        {rp > .05 && rp < .99 && (() => { const q = rp; const x = (1 - q) * (1 - q) * g[0] + 2 * (1 - q) * q * (g[0] + c[0]) / 2 + q * q * c[0], y = (1 - q) * (1 - q) * g[1] + 2 * (1 - q) * q * (Math.min(g[1], c[1]) - 80) + q * q * c[1]; return <g transform={`translate(${x} ${y})`}><path d="M -16 -10 L 0 -24 L 16 -10 L 0 16 Z" fill={BLK} /></g>; })()}
        <T_ x={(g[0] + c[0]) / 2} y={Math.min(g[1], c[1]) - 110} s={34} f="Brush" o={fade(t, 2.6)}>~140 km on foot</T_></g>}
      {(erupt || mark.includes('HAS')) && <g transform={`translate(${h[0]} ${h[1]})`}><path d="M -46 18 L -14 -30 L 0 -18 L 14 -38 L 46 18 Z" fill="#8a8090" stroke={BLK} strokeWidth={4} />
        {erupt && Array.from({ length: 5 }).map((_, i) => { const p = ((T * .5 + i / 5) % 1); return <circle key={i} cx={14 + p * 30} cy={-40 - p * 120} r={10 + p * 26} fill="#4a3a3a" opacity={(1 - p) * .8} />; })}</g>}
      {mark.map((m, i) => { const [lon, lat, nm] = PLACE[m]; const [x, y] = P2(lon, lat); const s = pop(t, .8 + i * .35); const main = m === 'CAT';
        return <g key={m} transform={`translate(${x} ${y}) scale(${s})`}>{main ? <><circle r={30 + Math.sin(T * 4) * 4} fill={RED} opacity={.25} /><Hand x={0} y={-6} s={.42} c={RED} /></> : <circle r={11} fill={BLK} />}
          <T_ x={0} y={main ? 64 : m === 'HAS' ? 60 : -22} s={main ? 40 : 30} c={main ? RED : BLK}>{nm}</T_></g>; })}
    </g>
    <rect x={80} y={250} width={1760} height={660} rx={30} fill="none" stroke={BLK} strokeWidth={6} />
  </Wall>;
};
export const MapAnatolia: React.FC<GP> = (p) => <MapBase {...p} z={[35, 39, 1]} mark={['IST', 'ANK', 'KON', 'CAT', 'HAS']} title="CENTRAL ANATOLIA" note="Konya plain, southern Turkey · c. 7100 – 6000 BC · outline simplified" />;
export const MapObsidian: React.FC<GP> = (p) => <MapBase {...p} z={[33.7, 38.0, 3.2]} mark={['CAT', 'KON', 'HAS', 'GOL']} route title="WHERE THE BLACK GLASS CAME FROM" note="Obsidian sourced to Göllüdağ & Nenezi Dağ, Cappadocia (chemical fingerprinting)" />;

/* ---------- timeline: older than the pyramids ---------- */
export const Timeline: React.FC<GP> = ({ t, T }) => {
  const X = (y: number) => lerp(170, 1750, (y + 7500) / (7500 + 2030)); const p = easeOut(prog(t, .4, 2.4));
  const ev: [number, string, string][] = [[-7100, 'ÇATALHÖYÜK', 'founded'], [-6000, 'abandoned', ''], [-3000, 'STONEHENGE', 'begun'], [-2560, 'GREAT PYRAMID', 'Giza'], [2026, 'YOU', 'today']];
  return <Wall t={t} title="OLDER THAN THE PYRAMIDS" note="Dates approximate · Çatalhöyük East c. 7100–5950 BC (radiocarbon)">
    <line x1={X(-7500)} y1={640} x2={lerp(X(-7500), X(2030), p)} y2={640} stroke={BLK} strokeWidth={10} strokeLinecap="round" />
    {[-7000, -6000, -5000, -4000, -3000, -2000, -1000, 0, 1000, 2000].map((y) => <g key={y} opacity={X(y) < lerp(X(-7500), X(2030), p) ? 1 : 0}><line x1={X(y)} y1={626} x2={X(y)} y2={654} stroke={BLK} strokeWidth={5} /><T_ x={X(y)} y={700} s={24} f="Mono">{y === 0 ? '0' : y < 0 ? -y + ' BC' : y + ''}</T_></g>)}
    <rect x={X(-7100)} y={600} width={(X(-6000) - X(-7100)) * clamp(p * 4)} height={80} fill={RED} opacity={.85} rx={10} />
    {ev.map(([y, a, b], i) => { const s = pop(t, 1.0 + i * .6); const up = i % 2 === 0;
      return <g key={i} transform={`translate(${X(y)} ${up ? 520 : 780}) scale(${s})`}>
        <line x1={0} y1={up ? 30 : -50} x2={0} y2={up ? 70 : -110} stroke={BLK} strokeWidth={4} />
        {i === 0 && <Hand x={0} y={-120} s={.7} />}{i === 2 && <g transform="translate(0 -110)">{[-40, 0, 40].map((q) => <rect key={q} x={q - 10} y={-40} width={20} height={60} fill="#9a9488" stroke={BLK} strokeWidth={3} />)}<rect x={-54} y={-52} width={108} height={16} fill="#9a9488" stroke={BLK} strokeWidth={3} /></g>}
        {i === 3 && <path d="M -60 40 L 0 -60 L 60 40 Z" fill="#d8b878" stroke={BLK} strokeWidth={4} transform="translate(0 70)" />}
        {i === 4 && <g transform="translate(0 70)"><MChar look={CAST.you} x={0} y={60} s={.24} pose={{ expr: 'surprised' }} /></g>}
        <T_ x={0} y={up ? 0 : 0} s={34} c={i === 0 ? RED : BLK}>{a}</T_>{b && <T_ x={0} y={30} s={26} f="Brush">{b}</T_>}</g>; })}
    <g opacity={fade(t, 4.4)}><path d={`M ${X(-7100)} 860 L ${X(-2560)} 860`} stroke={RED} strokeWidth={6} markerEnd="" /><T_ x={(X(-7100) + X(-2560)) / 2} y={900} s={40} c={RED} f="Dirt">4,500 YEARS</T_></g>
  </Wall>;
};
/* ---------- hundreds of plaster layers ---------- */
export const PlasterLayers: React.FC<GP> = ({ t }) => {
  const n = Math.floor(easeOut(prog(t, .4, 4.2)) * 450);
  return <Wall t={t} title="A NEW COAT, AGAIN AND AGAIN" note="Wall samples show up to ~450 plaster layers; some re-plastered every season or year">
    <g transform="translate(560 300)"><rect x={0} y={0} width={800} height={560} fill="#b9a68a" stroke={BLK} strokeWidth={6} rx={10} />
      {Array.from({ length: Math.min(140, Math.ceil(n / 3.2)) }).map((_, i) => <rect key={i} x={0} y={556 - i * 4} width={800} height={3} fill={i % 9 === 4 ? RED : i % 13 === 7 ? '#8a7a68' : PL} opacity={.95} />)}
    </g>
    <g transform="translate(1600 560)"><T_ x={0} y={0} s={140} f="Dirt" c={RED}>{n}</T_><T_ x={0} y={60} s={40}>LAYERS</T_></g>
    <g transform="translate(300 560)" opacity={fade(t, 1)}><T_ x={0} y={0} s={44} f="Brush">one wall,</T_><T_ x={0} y={56} s={44} f="Brush">a few cm thick</T_></g>
  </Wall>;
};
/* ---------- aurochs vs a person ---------- */
export const AurochsScale: React.FC<GP> = ({ t, T }) => {
  const g = easeOut(prog(t, .4, 1.6));
  return <Wall t={t} title="THE AUROCHS" note="Bos primigenius · bulls up to ~1.8 m at the shoulder · extinct since 1627 (Poland)">
    <line x1={200} y1={880} x2={1720} y2={880} stroke={BLK} strokeWidth={6} />
    <g transform="translate(1520 880)">{[0, .5, 1, 1.5, 2].map((m) => <g key={m} transform={`translate(0 ${-m * 300})`}><line x1={-20} y1={0} x2={20} y2={0} stroke={BLK} strokeWidth={5} /><T_ x={34} y={10} s={26} f="Mono" a="start">{m} m</T_></g>)}<line x1={0} y1={0} x2={0} y2={-600} stroke={BLK} strokeWidth={5} /></g>
    <g opacity={g}><Aurochs x={900} y={880} s={1.55 * (.85 + .15 * g)} ph={T * 1.2} /></g>
    <MChar look={CAST.youH} x={280} y={880} s={.84} pose={{ expr: 'scared', holdF: 'spear', armF: -1.0, elbowF: .6, propA: 60, lean: -10 }} />
    <line x1={1420} y1={880 - 540} x2={1500} y2={880 - 540} stroke={RED} strokeWidth={6} strokeDasharray="12 8" opacity={fade(t, 1.6)} />
    <T_ x={1300} y={330} s={38} f="Brush" c={RED} o={fade(t, 1.8)}>~1.8 m</T_>
    <T_ x={360} y={330} s={34} f="Brush" o={fade(t, 2.4)}>you, about 1.6 m</T_>
  </Wall>;
};
/* ---------- the bones remember: teeth, soot, wounds ---------- */
const Skull: React.FC<{ x: number; y: number; s?: number; mark?: number; c?: string }> = ({ x, y, s = 1, mark = 0, c = PL }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M -30 10 C -40 -30 -20 -46 0 -46 C 20 -46 40 -30 30 10 L 20 14 L 18 30 L -18 30 L -20 14 Z" fill={c} stroke={BLK} strokeWidth={4} />
  <ellipse cx={-12} cy={-6} rx={8} ry={9} fill={BLK} /><ellipse cx={12} cy={-6} rx={8} ry={9} fill={BLK} /><path d="M -3 8 L 0 2 L 3 8 Z" fill={BLK} />
  {mark > 0 && <g opacity={mark}><circle cx={14} cy={-32} r={12} fill="none" stroke={RED} strokeWidth={5} /><path d="M 6 -36 l 16 8" stroke={RED} strokeWidth={4} /></g>}
</g>;
export const Bones: React.FC<GP> = ({ t, T }) => <Wall t={t} title="WHAT THE BONES REMEMBER" note="Larsen et al., PNAS 2019 · Çatalhöyük Research Project">
  {[['TEETH', 'cavities from sticky grain', 0], ['RIBS', 'soot from smoky rooms', 1], ['LEGS', 'long walks to the fields', 2]].map(([a, b, i]: any) => { const s = pop(t, .6 + i * .9);
    return <g key={a} transform={`translate(${420 + i * 540} 560) scale(${s})`}>
      <circle r={190} fill={C.plasterD} stroke={BLK} strokeWidth={6} />
      {i === 0 && <g>{Array.from({ length: 8 }).map((_, k) => <g key={k} transform={`translate(${-105 + k * 30} ${-10 + Math.abs(k - 3.5) * 8})`}><path d="M -12 -30 Q -14 20 -6 40 L 6 40 Q 14 20 12 -30 Q 0 -40 -12 -30 Z" fill={PL} stroke={BLK} strokeWidth={3} />{(k === 2 || k === 5) && <circle cx={0} cy={-18} r={6} fill="#4a3020" />}</g>)}</g>}
      {i === 1 && <g>{Array.from({ length: 6 }).map((_, k) => <path key={k} d={`M 0 ${-90 + k * 32} C -60 ${-80 + k * 32} -110 ${-50 + k * 32} -120 ${-10 + k * 32} M 0 ${-90 + k * 32} C 60 ${-80 + k * 32} 110 ${-50 + k * 32} 120 ${-10 + k * 32}`} stroke={k > 1 ? '#5a5048' : PL} strokeWidth={11} fill="none" />)}<line x1={0} y1={-100} x2={0} y2={110} stroke={PL} strokeWidth={14} /></g>}
      {i === 2 && <g><path d="M -20 -140 L -30 0 L -24 140 M 20 -140 L 34 0 L 26 140" stroke={PL} strokeWidth={22} strokeLinecap="round" /><path d="M -20 -140 L -30 0 L -24 140 M 20 -140 L 34 0 L 26 140" stroke={BLK} strokeWidth={3} fill="none" /></g>}
      <T_ x={0} y={250} s={42} c={RED}>{a}</T_><T_ x={0} y={294} s={32} f="Brush">{b}</T_></g>; })}
</Wall>;
export const HeadWounds: React.FC<GP> = ({ t }) => { const hit = new Set([1, 6, 9, 13, 17, 22]); const p = prog(t, 1.4, 4.4);
  return <Wall t={t} title="ABOUT 1 IN 4" note="Healed head wounds in 25 of 93 skulls · many on the top/back · Larsen et al., PNAS 2019">
    {Array.from({ length: 24 }).map((_, i) => { const x = 330 + (i % 8) * 120, y = 380 + Math.floor(i / 8) * 150; return <Skull key={i} x={x} y={y} s={1.15 * pop(t, .3 + i * .04)} mark={hit.has(i) ? clamp((p * 24 - [...hit].indexOf(i) * 4) / 2) : 0} c={hit.has(i) && p > .1 ? '#f4e2d0' : PL} />; })}
    <g transform="translate(1520 520)" opacity={fade(t, 3.4)}>{[0, 1, 2].map((k) => <circle key={k} cx={-60 + k * 60} cy={0} r={24} fill="#a88a6a" stroke={BLK} strokeWidth={4} />)}<T_ x={0} y={80} s={36} f="Brush">clay sling balls</T_><T_ x={0} y={120} s={30} f="Brush">found in the houses</T_></g>
  </Wall>; };
/* ---------- men and women ---------- */
export const Equal: React.FC<GP> = ({ t, T }) => { const tilt = Math.sin(t * 2.2) * 12 * (1 - prog(t, 1.4, 3));
  return <Wall t={t} title="SAME FOOD. SAME WORK." note="Bone chemistry (diet) & skeletal wear show few differences · Hodder 2014; Pilloud et al. 2016">
    <g transform="translate(960 400)"><path d="M -40 520 L 0 0 L 40 520 Z" fill={BLK} />
      <g transform={`rotate(${tilt})`}><rect x={-560} y={-12} width={1120} height={24} rx={12} fill={RED} stroke={BLK} strokeWidth={4} />
        {[-1, 1].map((q) => <g key={q} transform={`translate(${q * 500} 0)`}><line x1={0} y1={0} x2={-120} y2={180} stroke={BLK} strokeWidth={4} /><line x1={0} y1={0} x2={120} y2={180} stroke={BLK} strokeWidth={4} /><path d="M -150 180 Q 0 240 150 180 Z" fill={C.plasterD} stroke={BLK} strokeWidth={5} />
          <g transform={`rotate(${-tilt})`}><MChar look={q < 0 ? CAST.fat : CAST.mom} x={0} y={186} s={.52} flip={q > 0} pose={{ expr: 'happy', armF: -.9, elbowF: 1.2 }} /></g></g>)}</g></g>
    <T_ x={460} y={880} s={40} c={RED} o={fade(t, 2.6)}>MEN</T_><T_ x={1460} y={880} s={40} c={RED} o={fade(t, 2.6)}>WOMEN</T_>
  </Wall>; };
/* ---------- family is who you live with ---------- */
export const Family: React.FC<GP> = ({ t, T }) => { const p = prog(t, 1.2, 3.2);
  const ppl = [0, 1, 2, 3, 4, 5]; const pairs = [[0, 1], [2, 3]]; const fam = (i: number) => i < 2 ? '#6a8a4a' : i < 4 ? '#3a6a9a' : '#9a6a3a';
  return <Wall t={t} title="FAMILY ≠ BLOOD?" note="Ancient DNA: many people buried in one house were not close relatives · Yaka et al., Current Biology 2021">
    <g transform="translate(960 640)"><path d="M -660 160 L -660 -170 L 660 -170 L 660 160 Z" fill={C.plasterD} stroke={BLK} strokeWidth={8} /><rect x={-660} y={-210} width={1320} height={40} fill={C.mudL} stroke={BLK} strokeWidth={6} />
      <T_ x={0} y={-230} s={34}>ONE HOUSE</T_>
      {ppl.map((i) => { const x = -520 + i * 208; return <g key={i} transform={`translate(${x} 130) scale(${pop(t, .4 + i * .15)})`}><MChar look={villager(i * 3 + 1)} x={0} y={0} s={.44} pose={{ expr: 'happy' }} />
        <circle cx={0} cy={-300} r={30} fill={lerp(0, 1, p) > .5 ? fam(i) : '#c8bca4'} stroke={BLK} strokeWidth={4} /><T_ x={0} y={-290} s={24} f="Mono" c={PL}>DNA</T_></g>; })}
      {pairs.map(([a, b], k) => <path key={k} d={`M ${-520 + a * 208} -340 Q ${-520 + (a + b) * 104} -400 ${-520 + b * 208} -340`} stroke={RED} strokeWidth={6} fill="none" opacity={fade(t, 3.4)} />)}
    </g>
    <T_ x={960} y={880} s={38} f="Brush" c={RED} o={fade(t, 4)}>colours = genetic families · they lived and were buried together</T_>
  </Wall>; };
/* ---------- the "mother goddess" ---------- */
export const Goddess: React.FC<GP> = ({ t, T }) => <Wall t={t} title="THE SEATED WOMAN" note="Clay figurine, c. 6000 BC · Museum of Anatolian Civilizations, Ankara · height ~16.5 cm">
  <g transform={`translate(800 560) scale(${1 + .03 * Math.sin(T)})`}>
    <ellipse cx={0} cy={300} rx={260} ry={40} fill={C.plasterD} />
    {[-1, 1].map((q) => <g key={q} transform={`translate(${q * 190} 150) scale(${q} 1)`}><path d="M -40 60 C -60 0 -40 -60 0 -70 C 40 -76 60 -40 50 0 L 60 140 L 10 140 L 0 60 Z" fill="#c8a070" stroke={BLK} strokeWidth={5} /><circle cx={10} cy={-70} r={34} fill="#c8a070" stroke={BLK} strokeWidth={5} />{[0, 1, 2].map((k) => <circle key={k} cx={-10 + k * 16} cy={20 + k * 30} r={6} fill={BLK} />)}</g>)}
    <path d="M -120 280 C -180 160 -160 -20 -90 -80 C -50 -120 50 -120 90 -80 C 160 -20 180 160 120 280 Z" fill="#c8a070" stroke={BLK} strokeWidth={6} />
    <circle cx={0} cy={-150} r={60} fill="#c8a070" stroke={BLK} strokeWidth={6} />
    <path d="M -60 40 C -40 60 40 60 60 40 M -80 140 C -40 170 40 170 80 140" stroke="#9a7040" strokeWidth={6} fill="none" />
  </g>
  <g transform="translate(1440 440)"><Stamp kind="MYTH" p={prog(t, 2.0, 2.6)} s={.95} sub="'the great mother goddess'" /></g>
  <g transform="translate(1440 700)"><Stamp kind="MAYBE" p={prog(t, 4.2, 4.8)} s={.95} sub="a respected elder? an ancestor?" /></g>
</Wall>;
/* ---------- hasan dağı painting: map or leopard? ---------- */
export const MapOrLeopard: React.FC<GP> = ({ t, T }) => { const s = Math.sin(clamp((t - 1.5) / 3) * Math.PI * 3);
  return <Wall t={t} title="A MAP… OR A LEOPARD?" note="Wall painting, Shrine VII.14 (Mellaart) · eruption c. 6960 BC dated: Schmitt et al., PLOS ONE 2014">
    <g transform="translate(560 580)"><rect x={-380} y={-260} width={760} height={460} fill={PL} stroke={BLK} strokeWidth={6} />
      {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 9 }).map((_, c) => <rect key={r + '-' + c} x={-330 + c * 74 + (r % 2) * 20} y={30 + r * 40} width={64} height={34} fill="none" stroke={RED} strokeWidth={7} />))}
      <path d="M -170 10 C -110 -60 -50 -150 -10 -180 L 10 -160 L 40 -190 C 90 -140 140 -70 190 10 Z" fill={s > 0 ? 'none' : '#d8a060'} stroke={RED} strokeWidth={12} />
      {Array.from({ length: 22 }).map((_, i) => { const R = rng(i + 1); return <circle key={i} cx={-110 + R() * 230} cy={-120 + R() * 110} r={9} fill={BLK} />; })}
      <T_ x={0} y={250} s={40} c={RED} o={fade(t, 1)}>?</T_></g>
    <g transform="translate(1340 420)" opacity={clamp(s * 3)}><T_ x={0} y={0} s={46} c={RED}>MAP</T_><T_ x={0} y={46} s={32} f="Brush">houses + a twin-peaked volcano</T_></g>
    <g transform="translate(1340 720)" opacity={clamp(-s * 3)}><T_ x={0} y={0} s={46} c={RED}>LEOPARD SKIN</T_><T_ x={0} y={46} s={32} f="Brush">spots + geometric pattern</T_></g>
  </Wall>; };
export { Hand, Bucranium };
