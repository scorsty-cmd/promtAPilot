import React from 'react';
import { clamp, lerp, easeOut, easeInOut, spring, prog, rng } from './lib';
import { P } from './art';
import { F } from './sets';
import { MChar, CAST, RC, legionary } from './chars';
import IT from './italymap.json';

/* ===== "Pompeian wall" explainers: red field, black dado, cream panel framed in ochre; Cinzel titles; every number carries its source ===== */
type GP = { t: number; T: number; d: number };
export const T_: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; f?: string; w?: number; children: React.ReactNode }> = ({ x, y, s = 40, c = P.ink, a = 'middle', o = 1, f = 'Cinzel', w = 700, children }) =>
  <text x={x} y={y} fontFamily={f} fontWeight={f === 'Cinzel' || f === 'Brico' ? w : 400} fontSize={s} fill={c} textAnchor={a} opacity={o}>{children}</text>;
export const pop = (t: number, a: number) => spring(prog(t, a, a + .6) * 1.2, 10, .5);
export const fade = (t: number, a: number) => clamp((t - a) * 3);
/* NEW: every explainer drifts (slow parallax of the frame) so no shot is static */
export const Panel: React.FC<{ t: number; title: string; note?: string; children: React.ReactNode }> = ({ t, title, note, children }) => <g>
  <rect x={-200} y={-200} width={2320} height={1480} fill={F.red} />
  {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 9); return <ellipse key={i} cx={R() * 1920} cy={R() * 1080} rx={60 + R() * 220} ry={30 + R() * 70} fill={R() > .5 ? '#8a2520' : '#a8342a'} opacity={.5} />; })}
  <rect x={-200} y={900} width={2320} height={400} fill={F.black} />
  {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M ${-100 + i * 180 + (t * 14) % 180} 990 q 40 -50 80 0 q 40 50 80 0`} stroke={F.ochre} strokeWidth={5} fill="none" opacity={.6} />)}
  <rect x={110} y={70} width={1700} height={860} fill={F.plaster} stroke={F.ochre} strokeWidth={14} />
  <rect x={130} y={90} width={1660} height={820} fill="none" stroke={P.ink} strokeWidth={3} />
  {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 44); return <ellipse key={'p' + i} cx={140 + R() * 1640} cy={100 + R() * 800} rx={40 + R() * 120} ry={20 + R() * 40} fill="#e2d6bc" opacity={.45} />; })}
  <T_ x={960} y={170} s={62} o={fade(t, .1)}>{title}</T_>
  <path d={`M ${960 - 300 * easeOut(prog(t, .2, 1))} 196 L ${960 + 300 * easeOut(prog(t, .2, 1))} 196`} stroke={F.red} strokeWidth={6} />
  {children}
  {note && <T_ x={960} y={902} s={21} f="Mono" c="#6a5a46" o={fade(t, .8)}>{note}</T_>}
</g>;
/* MYTH / EVIDENCE / MAYBE stamp */
export const Stamp: React.FC<{ kind: 'MYTH' | 'EVIDENCE' | 'MAYBE'; p: number; x?: number; y?: number; s?: number; sub?: string }> = ({ kind, p, x = 0, y = 0, s = 1, sub }) => {
  const c = kind === 'MYTH' ? '#a8322a' : kind === 'EVIDENCE' ? '#2f6a4a' : '#c98a1a';
  const k = spring(clamp(p) * 1.2, 12, .45);
  return <g transform={`translate(${x} ${y}) scale(${s * (2 - k)}) rotate(-8)`} opacity={clamp(p * 4)}>
    <rect x={-190} y={-56} width={380} height={112} rx={10} fill="rgba(239,230,210,.9)" stroke={c} strokeWidth={9} />
    <rect x={-176} y={-42} width={352} height={84} rx={6} fill="none" stroke={c} strokeWidth={3} />
    <text x={0} y={sub ? 6 : 22} fontFamily="Cinzel" fontWeight={900} fontSize={sub ? 54 : 64} fill={c} textAnchor="middle" letterSpacing={4}>{kind}</text>
    {sub && <text x={0} y={34} fontFamily="Mono" fontSize={20} fill={c} textAnchor="middle">{sub}</text>}
  </g>;
};

export const Rewind: React.FC<GP> = ({ t, d }) => {
  const p = easeInOut(prog(t, .3, d - .6)); const yr = lerp(71, 73, p);
  return <Panel t={t} title="TWO YEARS EARLIER">
    <g transform="translate(960 560)">
      <T_ x={0} y={60} s={230} w={900}>{Math.round(yr)} BC</T_>
      {Array.from({ length: 24 }).map((_, k) => { const a = k / 24 * Math.PI * 2 - t * 3; return <line key={k} x1={Math.cos(a) * 380} y1={Math.sin(a) * 300} x2={Math.cos(a) * 420} y2={Math.sin(a) * 330} stroke={k % 6 ? F.ochre : F.red} strokeWidth={k % 6 ? 6 : 12} />; })}
      <T_ x={0} y={210} s={36} f="Mono">◄◄ CAPUA · A GLADIATOR SCHOOL</T_>
    </g>
  </Panel>;
};
/* ---- Italy map with the route of the revolt ---- */
const LON0 = 12.5, K = Math.cos(41.5 * Math.PI / 180);
const MP = (lon: number, lat: number, cx = 960, cy = 540, sc = 118, lat0 = 41.6, lonC = 13.6): [number, number] => [cx + ((lon - LON0) * K - (lonC - LON0) * K) * sc, cy - (lat - lat0) * sc];
export const PL: Record<string, [number, number]> = { CAPUA: [14.21, 41.08], VESUVIUS: [14.43, 40.82], ROME: [12.48, 41.89], MUTINA: [10.93, 44.65], GARGANUS: [15.95, 41.82], RHEGIUM: [15.65, 38.11], THURII: [16.5, 39.71], SILARUS: [15.25, 40.6], WALL: [16.4, 38.9], ALPS: [9.5, 46.2] };
const ROUTE: [number, number][] = [[14.21, 41.08], [14.43, 40.82], [15.4, 40.4], [16.2, 39.8], [15.8, 41.2], [14.6, 42.6], [13.4, 43.6], [12.0, 44.2], [10.93, 44.65], [12.4, 43.6], [14.1, 42.5], [15.6, 41.0], [16.5, 39.71], [16.0, 38.9], [15.65, 38.11], [16.1, 38.7], [16.4, 39.3], [15.6, 40.2], [15.25, 40.6]];
export const ItalyMap: React.FC<GP & { route?: number; mark?: string[]; zoom?: [number, number, number]; extra?: (mp: typeof MP) => React.ReactNode; title?: string; note?: string }> = ({ t, T, route = 0, mark = [], zoom, extra, title, note }) => {
  const zp = zoom ? easeInOut(prog(t, .6, 3.2)) : 0;
  const z = lerp(1, zoom ? zoom[2] : 1, zp); const [fx, fy] = zoom ? MP(zoom[0], zoom[1]) : [960, 540];
  const pts = ROUTE.map(([a, b]) => MP(a, b)); const len = pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
  const rp = easeInOut(prog(t, .8, Math.max(2, route)));
  return <g><rect x={-200} y={-200} width={2320} height={1480} fill="#6f9fb4" />
    {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M ${(i * 137 + T * 10) % 2100 - 100} ${(i * 211) % 1080} q 20 -8 40 0`} stroke="#fff" strokeOpacity={.3} strokeWidth={3} fill="none" />)}
    <g transform={`translate(960 540) scale(${z}) translate(${-lerp(960, fx, zp)} ${-lerp(540, fy, zp)})`}>
      {(IT as number[][][]).map((ring, i) => <path key={i} d={'M ' + ring.map(([x, y]) => { const px = 960 + (x - (13.6 - LON0) * K) * 118, py = 540 - (y - 41.6) * 118; return `${px.toFixed(1)} ${py.toFixed(1)}`; }).join(' L ') + ' Z'} fill="#e6d4a8" stroke={P.ink} strokeWidth={4 / z} strokeLinejoin="round" />)}
      {/* the Apennines */}
      <path d={'M ' + [[9.2, 44.4], [10.5, 44.2], [12.2, 43.6], [13.2, 42.6], [14.4, 41.6], [15.4, 40.7], [16.0, 39.8], [16.2, 38.8]].map(([a, b]) => MP(a, b).join(' ')).join(' L ')} stroke="#b8a070" strokeWidth={22 / z} fill="none" strokeLinecap="round" opacity={.6} />
      {route > 0 && <path d={'M ' + pts.map((p) => p.join(' ')).join(' L ')} stroke={F.red} strokeWidth={9 / z} fill="none" strokeDasharray={`${rp * len} ${len + 10}`} strokeLinecap="round" strokeLinejoin="round" />}
      {route > 0 && (() => { let acc = 0, at = pts[0]; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + d >= rp * len) { const q = (rp * len - acc) / d; at = [lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q)]; break; } acc += d; at = pts[i]; }
        return <g transform={`translate(${at[0]} ${at[1]}) scale(${1 / z})`}><circle r={16} fill={F.red} stroke="#fff" strokeWidth={4} /><circle r={22 + (T * 24) % 26} fill="none" stroke={F.red} strokeWidth={3} opacity={1 - ((T * 24) % 26) / 26} /></g>; })()}
      {extra && extra(MP)}
      {mark.map((m, k) => { const [px, py] = MP(...PL[m]); const o = fade(t, .4 + k * .35); return <g key={m} opacity={o} transform={`translate(${px} ${py}) scale(${1 / z})`}><circle r={10} fill={m === 'ROME' ? F.red : P.ink} stroke="#fff" strokeWidth={3} /><text x={16} y={-12} fontFamily="Cinzel" fontWeight={700} fontSize={30} fill={P.ink} stroke="#e6d4a8" strokeWidth={8} paintOrder="stroke">{m === 'GARGANUS' ? 'MT GARGANUS' : m === 'SILARUS' ? 'RIVER SILARUS' : m}</text></g>; })}
    </g>
    {title && <g><rect x={60} y={50} width={720} height={90} fill={F.plaster} stroke={F.ochre} strokeWidth={8} /><T_ x={420} y={112} s={44}>{title}</T_></g>}
    {note && <g><text x={64} y={186} fontFamily="Mono" fontSize={21} fill={F.plaster} stroke="rgba(33,22,15,.85)" strokeWidth={7} paintOrder="stroke">{note}</text></g>}
  </g>;
};
export const MapCapua: React.FC<GP> = (p) => <ItalyMap {...p} mark={['ROME', 'CAPUA', 'VESUVIUS']} zoom={[14.2, 41.2, 2.0]} title="CAPUA, 73 BC" note="About 200 km south of Rome · Map: Natural Earth" />;
export const MapRoute: React.FC<GP> = (p) => <ItalyMap {...p} route={p.d - 1} mark={['CAPUA', 'VESUVIUS', 'GARGANUS', 'MUTINA', 'THURII', 'RHEGIUM', 'SILARUS']} title="73 – 71 BC" note="Route after Plutarch (Crassus 8–11) and Appian (Civil Wars 1.116–120) · simplified" />;
export const MapWall: React.FC<GP> = (p) => <ItalyMap {...p} zoom={[16.2, 38.9, 3.0]} mark={['RHEGIUM', 'THURII']}
  extra={(mp) => { const a = mp(16.22, 38.98), b = mp(16.6, 38.84); const q = easeOut(prog(p.t, 2.6, 5)); return <g><path d={`M ${a[0]} ${a[1]} L ${lerp(a[0], b[0], q)} ${lerp(a[1], b[1], q)}`} stroke={F.red} strokeWidth={5} strokeDasharray="10 6" /><g opacity={fade(p.t, 5)}><text x={(a[0] + b[0]) / 2} y={a[1] - 26} fontFamily="Mono" fontSize={13} textAnchor="middle" fill={F.red} stroke="#e6d4a8" strokeWidth={4} paintOrder="stroke">DITCH + WALL · ~55 KM</text></g></g>; }}
  title="CRASSUS'S WALL" note="Plutarch: 300 stades (~55 km), sea to sea · position approximate" />;
export const MapAppian: React.FC<GP> = (p) => <ItalyMap {...p} zoom={[13.4, 41.5, 2.4]} mark={['ROME', 'CAPUA']}
  extra={(mp) => { const pts = [[14.21, 41.08], [13.9, 41.25], [13.4, 41.3], [13.0, 41.45], [12.7, 41.7], [12.48, 41.89]].map(([a, b]) => mp(a, b)); const q = easeInOut(prog(p.t, 1, 5));
    return <g><path d={'M ' + pts.map((x) => x.join(' ')).join(' L ')} stroke="#2a1a12" strokeWidth={4} fill="none" strokeDasharray={`${q * 400} 400`} />
      {Array.from({ length: 30 }).map((_, i) => { const u = i / 29; if (u > q) return null; const seg = Math.min(4, Math.floor(u * 5)); const w = u * 5 - seg; const x = lerp(pts[seg][0], pts[seg + 1][0], w), y = lerp(pts[seg][1], pts[seg + 1][1], w); return <path key={i} d={`M ${x} ${y - 9} L ${x} ${y + 3} M ${x - 4} ${y - 6} L ${x + 4} ${y - 6}`} stroke="#2a1a12" strokeWidth={1.6} />; })}
      <g opacity={fade(p.t, 4)}><text x={pts[2][0]} y={pts[2][1] + 30} fontFamily="Mono" fontSize={13} textAnchor="middle" fill={P.ink} stroke="#e6d4a8" strokeWidth={4} paintOrder="stroke">VIA APPIA · ~200 KM · 6,000</text></g></g>; }}
  title="THE APPIAN WAY" note="Appian, Civil Wars 1.120" />;

/* ---- the three styles of 73 BC ---- */
export const Styles: React.FC<GP> = ({ t }) => {
  const c = [{ k: 'opp', n: 'SAMNITE', g: ['tall plumed helmet', 'big rectangular shield', 'short straight sword'] },
    { k: 'criGlad', n: 'GAUL', g: ['round helmet', 'long oval shield', 'straight sword'] },
    { k: 'spaGlad', n: 'THRACIAN', g: ['griffin-crest helmet', 'small square shield', 'curved sica sword'] }];
  return <Panel t={t} title="THREE WAYS TO FIGHT · 73 BC" note="Later the Empire added murmillo, retiarius & secutor — not yet in Spartacus's time">
    {c.map((x, i) => { const px = 420 + i * 540; const a = pop(t, .4 + i * .6); return <g key={i} transform={`translate(${px} 0)`} opacity={clamp(a * 2)}>
      <g transform={`translate(0 ${720}) scale(${1.35 * (.8 + .2 * a)})`}><MChar look={{ ...CAST[x.k] }} x={0} y={0} s={1} flip={i === 0} pose={{ holdF: x.k === 'spaGlad' ? 'sica' : 'gladius', armF: -1.0, elbowF: .9, propA: 50, shieldUp: .5, expr: 'fierce', crouch: .4 }} /></g>
      <rect x={-200} y={750} width={400} height={64} fill={i === 2 ? F.red : P.ink} /><T_ x={0} y={796} s={40} c={F.plaster}>{x.n}</T_>
      {x.g.map((g, k) => <T_ key={k} x={0} y={850 + k * 30} s={22} f="Mono" o={fade(t, 1.2 + i * .6 + k * .2)}>{g}</T_>)}
    </g>; })}
    <g transform="translate(1600 290)"><Stamp kind="EVIDENCE" p={prog(t, 4.2, 4.8)} s={.7} sub="Thraex = 'the Thracian'" /></g>
  </Panel>;
};
/* ---- barley men ---- */
export const Diet: React.FC<GP> = ({ t, T }) => <Panel t={t} title="THE BARLEY MEN" note="Lösch et al. 2014, PLoS ONE — bones from the gladiator cemetery at Ephesus (2nd–3rd c. AD)">
  <g transform={`translate(560 640) scale(${2.6 * pop(t, .3)})`}><path d="M -110 -30 L 110 -30 Q 100 60 0 70 Q -100 60 -110 -30 Z" fill="#a8603a" stroke={P.ink} strokeWidth={5} /><ellipse cy={-30} rx={110} ry={24} fill="#d8c08a" stroke={P.ink} strokeWidth={4} />
    {Array.from({ length: 30 }).map((_, i) => { const R = rng(i + 3); return <ellipse key={i} cx={(R() - .5) * 180} cy={-30 + (R() - .5) * 26} rx={R() > .5 ? 7 : 5} ry={4} fill={R() > .5 ? '#8a6a3a' : '#c8a868'} />; })}</g>
  <T_ x={560} y={340} s={48} o={fade(t, .8)} f="Brico" w={800}>barley + beans</T_>
  <g opacity={fade(t, 2.2)} transform="translate(1340 560)">
    <rect x={-50} y={-120} width={100} height={170} rx={14} fill="#efe6d2" stroke={P.ink} strokeWidth={6} /><rect x={-50} y={-40} width={100} height={90} rx={10} fill="#8a8478" opacity={.7} />
    {Array.from({ length: 6 }).map((_, k) => <circle key={k} cx={-20 + (k % 3) * 20} cy={-10 - Math.floor(k / 3) * 30 - ((T * 30 + k * 13) % 40)} r={4} fill="#fff" opacity={.7} />)}
    <T_ x={0} y={120} s={36} f="Brico" w={800}>plant-ash drink</T_><T_ x={0} y={160} s={22} f="Mono">high calcium · for bones?</T_>
  </g>
  <g transform="translate(960 830)" opacity={fade(t, 3.4)}><T_ x={0} y={0} s={38} f="Brico" w={700}>Romans called them hordearii — "barley men"</T_></g>
</Panel>;
/* ---- how deadly was the arena? ---- */
export const Odds: React.FC<GP> = ({ t }) => <Panel t={t} title="HOW OFTEN DID A FIGHT KILL?" note="Ville 1981 (1st-century AD fight records) · roughly 1 fight in 5 ended with a death">
  {Array.from({ length: 5 }).map((_, i) => { const a = pop(t, .4 + i * .35); const dead = i === 3 && t > 2.6; return <g key={i} transform={`translate(${380 + i * 290} 640) scale(${a})`}>
    <MChar look={{ ...CAST.youGlad, stripe: false, shieldC: [RC.red, RC.blue, RC.green, RC.gold, RC.red][i] }} x={-50} y={120} s={.7} pose={{ holdF: 'sica', armF: -1, elbowF: .8, propA: 60 }} />
    <MChar look={{ ...CAST.opp, shieldC: [RC.blue, RC.red, RC.gold, RC.green, RC.blue][i] }} x={60} y={120} s={.7} flip opacity={dead ? .35 : 1} pose={dead ? { kneel: 1, lean: -10 } : { holdF: 'gladius', armF: -1, elbowF: .8, propA: 60 }} />
    {dead && <T_ x={0} y={-170} s={46} c={F.red}>✕</T_>}
  </g>; })}
  <T_ x={960} y={420} s={72} o={fade(t, 3)} c={F.red}>1 fight in 5</T_>
  <T_ x={960} y={850} s={34} o={fade(t, 4)} f="Brico" w={700}>Most losers walked out alive — they were expensive.</T_>
</Panel>;
/* ---- the thumb myth ---- */
export const Thumbs: React.FC<GP> = ({ t }) => <Panel t={t} title="THUMBS DOWN?" note="'Pollice verso' = 'with a turned thumb'. The thumbs-down idea comes from J.-L. Gérôme's painting of 1872.">
  <g transform="translate(700 580)"><rect x={-300} y={-230} width={600} height={420} fill="#5a3a20" stroke={F.ochre} strokeWidth={16} /><rect x={-270} y={-200} width={540} height={360} fill="#c8a870" />
    <g transform={`translate(0 0) rotate(${180 * easeOut(prog(t, .6, 1.4))})`}><path d="M -40 -60 L 40 -60 Q 60 -60 60 -30 L 60 50 Q 60 80 30 80 L -30 80 Q -60 80 -60 50 Z" fill="#e8b88a" stroke={P.ink} strokeWidth={6} /><path d="M -20 -60 L -20 -140 Q 0 -160 20 -140 L 20 -60" fill="#e8b88a" stroke={P.ink} strokeWidth={6} /></g>
    <T_ x={0} y={230} s={30} f="Mono" c={F.plaster}>PAINTED 1872</T_></g>
  <g transform="translate(1300 560)"><Stamp kind="MYTH" p={prog(t, 2.2, 2.8)} s={1.1} sub="no Roman source shows it" /></g>
  <T_ x={1300} y={780} s={32} f="Brico" w={700} o={fade(t, 3.4)}>Nobody knows the real gesture.</T_>
</Panel>;
/* ---- 200 plotted, ~70 escaped ---- */
export const Escaped: React.FC<GP> = ({ t }) => { const n = Math.floor(easeOut(prog(t, 1.2, 3.2)) * 130);
  return <Panel t={t} title="THE BREAKOUT" note="Plutarch: 78 escaped · Appian: about 70 · 'kitchen choppers and spits'">
    <g transform="translate(260 300)">{Array.from({ length: 200 }).map((_, i) => { const out = i >= n; return <g key={i} transform={`translate(${(i % 25) * 56} ${Math.floor(i / 25) * 66})`} opacity={out ? 1 : .15}><circle cy={-26} r={11} fill={out ? F.red : '#8a7a6a'} /><path d="M -14 0 Q -14 -16 0 -16 Q 14 -16 14 0 Z" fill={out ? F.red : '#8a7a6a'} /></g>; })}</g>
    <T_ x={960} y={845} s={66} o={fade(t, 3)}>200 planned · ~70 got out</T_>
  </Panel>; };
/* ---- 70 -> 70,000 ---- */
export const Growth: React.FC<GP> = ({ t }) => { const p = easeInOut(prog(t, .6, 4)); const n = Math.round(Math.pow(1000, p) * 70);
  return <Panel t={t} title="FROM 70 TO 70,000" note="Appian, Civil Wars 1.116 — numbers in ancient sources are rough">
    <g transform="translate(960 640)">{Array.from({ length: 420 }).map((_, i) => { const R = rng(i + 5); const a = R() * Math.PI * 2, r = Math.sqrt(R()) * 330 * p; const kind = i % 7;
      return <circle key={i} cx={Math.cos(a) * r * 1.9} cy={Math.sin(a) * r * .55} r={kind === 4 ? 6 : 8} fill={kind === 4 ? F.ochre : kind === 5 ? '#d8d2c6' : kind === 6 ? F.olive : F.red} opacity={i / 420 < Math.max(.02, p) ? 1 : 0} />; })}</g>
    <T_ x={960} y={360} s={120} w={900}>{n.toLocaleString('en-US')}</T_>
    <g opacity={fade(t, 3.4)}>{[['men', F.red], ['women', F.ochre], ['elders', '#d8d2c6'], ['young', F.olive]].map(([l, c], k) => <g key={k} transform={`translate(${580 + k * 240} 860)`}><circle r={12} fill={c} stroke={P.ink} strokeWidth={3} /><T_ x={22} y={10} s={28} a="start" f="Mono">{l}</T_></g>)}</g>
  </Panel>; };
/* ---- decimation ---- */
export const Decimation: React.FC<GP> = ({ t }) => <Panel t={t} title="DECIMATION" note="Plutarch, Crassus 10 — 500 men who fled, in groups of ten: one in each group was killed">
  <g transform="translate(260 700)">{Array.from({ length: 10 }).map((_, i) => { const chosen = i === 6 && t > 1.6; return <g key={i} transform={`translate(${i * 156} 0) scale(${pop(t, .2 + i * .08)})`}>
    <MChar look={legionary(i)} x={0} y={0} s={.9} opacity={chosen ? .9 : 1} pose={{ expr: chosen ? 'scared' : 'worried', armF: -.2, elbowF: .4 }} />
    {chosen && <g><rect x={-60} y={-360} width={120} height={60} fill={F.red} /><T_ x={0} y={-318} s={34} c={F.plaster}>1 / 10</T_></g>}</g>; })}</g>
  <T_ x={960} y={400} s={84} o={fade(t, 3)} c={F.red}>× 50</T_>
</Panel>;
/* ---- sources timeline ---- */
export const Sources: React.FC<GP> = ({ t }) => { const p = easeOut(prog(t, .4, 3));
  const ev: [number, string, string][] = [[-73, '73 BC', 'THE REVOLT'], [-71, '71 BC', 'THE END'], [79, '79 AD', 'POMPEII BURIED'], [100, 'c. 100 AD', 'PLUTARCH WRITES'], [150, 'c. 150 AD', 'APPIAN WRITES']];
  const X = (y: number) => 260 + (y + 90) / 260 * 1400;
  return <Panel t={t} title="WHO TOLD THE STORY?" note="Plutarch, Life of Crassus · Appian, Civil Wars book 1 — both Greek, both writing generations later">
    <line x1={X(-90)} y1={600} x2={lerp(X(-90), X(170), p)} y2={600} stroke={P.ink} strokeWidth={8} />
    {ev.map(([y, d, l], k) => <g key={k} opacity={fade(t, .6 + k * .5)} transform={`translate(${X(y)} 600)`}><circle r={18} fill={k < 2 ? F.red : k === 2 ? '#5a5048' : F.ochre} stroke={P.ink} strokeWidth={5} />
      <T_ x={0} y={k % 2 ? 80 : -46} s={30} f="Mono">{d}</T_><T_ x={0} y={k % 2 ? 120 : -86} s={32}>{l}</T_></g>)}
    <g opacity={fade(t, 3.4)}><path d={`M ${X(-71)} 700 Q ${(X(-71) + X(100)) / 2} 800 ${X(100)} 700`} stroke={F.red} strokeWidth={5} fill="none" strokeDasharray="12 8" /><T_ x={(X(-71) + X(100)) / 2} y={840} s={34} c={F.red} f="Brico" w={800}>170+ years later</T_></g>
  </Panel>; };
