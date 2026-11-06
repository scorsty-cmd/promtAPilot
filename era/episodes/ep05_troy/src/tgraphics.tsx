import React from 'react';
import { clamp, lerp, easeOut, easeInOut, spring, prog, rng } from './lib';
import { P } from './art';
import { F, Ship } from './sets';
import { MChar, CAST } from './chars';
import GMAP from './greecemap.json';

/* ===== fresco-panel explainers: plaster panel, painted spiral border, ochre/blue ===== */
type GP = { t: number; T: number; d: number };
const T_: React.FC<{ x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; f?: string; children: React.ReactNode }> = ({ x, y, s = 40, c = P.ink, a = 'middle', o = 1, f = 'Gloock', children }) =>
  <text x={x} y={y} fontFamily={f} fontSize={s} fill={c} textAnchor={a} opacity={o}>{children}</text>;
const pop = (t: number, a: number) => spring(prog(t, a, a + .6) * 1.2, 10, .5);
const fade = (t: number, a: number) => clamp((t - a) * 3);
const Spiral: React.FC<{ y: number; flip?: boolean; t: number }> = ({ y, flip, t }) => <g>
  <rect x={-200} y={y} width={2320} height={64} fill={F.blue} />
  {Array.from({ length: 26 }).map((_, i) => <g key={i} transform={`translate(${-160 + i * 90 + (flip ? -1 : 1) * (t * 20 % 90)} ${y + 32}) scale(${flip ? -1 : 1} 1)`}><path d="M -32 0 C -32 -26 0 -26 0 0 C 0 26 32 26 32 0" stroke={F.ochre} strokeWidth={9} fill="none" /><circle cx={-16} cy={-6} r={5} fill={F.plaster} /><circle cx={16} cy={6} r={5} fill={F.plaster} /></g>)}
</g>;
export const Panel: React.FC<{ t: number; title: string; note?: string; children: React.ReactNode; bg?: string }> = ({ t, title, note, children, bg = F.plaster }) => <g>
  <rect x={-200} y={-200} width={2320} height={1480} fill={bg} />
  {Array.from({ length: 40 }).map((_, i) => { const R = rng(i + 9); return <ellipse key={i} cx={R() * 1920} cy={R() * 1080} rx={60 + R() * 200} ry={30 + R() * 60} fill={R() > .5 ? '#d8c8a4' : '#f6eedc'} opacity={.35} />; })}
  {Array.from({ length: 10 }).map((_, i) => { const R = rng(i + 77); const x = R() * 1920, y = R() * 1080; return <path key={'c' + i} d={`M ${x} ${y} l ${R() * 60 - 30} ${R() * 50} l ${R() * 50 - 25} ${R() * 60} l ${R() * 40} ${R() * 30}`} stroke="#a89878" strokeWidth={2} fill="none" opacity={.5} />; })}
  <Spiral y={0} t={t} /><Spiral y={1016} flip t={t} />
  <T_ x={960} y={160} s={70} o={fade(t, .1)}>{title}</T_>
  <path d={`M ${960 - 280 * easeOut(prog(t, .2, 1))} 186 L ${960 + 280 * easeOut(prog(t, .2, 1))} 186`} stroke={F.red} strokeWidth={6} />
  {children}
  {note && <T_ x={960} y={232} s={24} f="Mono" c="#6a5a46" o={fade(t, .8)}>{note}</T_>}
</g>;
/* the MYTH / EVIDENCE / MAYBE stamp — also used as an overlay in scenes */
export const Stamp: React.FC<{ kind: 'MYTH' | 'EVIDENCE' | 'MAYBE'; p: number; x?: number; y?: number; s?: number; sub?: string }> = ({ kind, p, x = 0, y = 0, s = 1, sub }) => {
  const c = kind === 'MYTH' ? '#b0402a' : kind === 'EVIDENCE' ? '#2f6a4a' : '#c98a1a';
  const k = spring(clamp(p) * 1.2, 12, .45);
  return <g transform={`translate(${x} ${y}) scale(${s * (2 - k)}) rotate(-8)`} opacity={clamp(p * 4)}>
    <rect x={-170} y={-52} width={340} height={104} rx={10} fill="rgba(239,228,204,.85)" stroke={c} strokeWidth={9} />
    <rect x={-158} y={-40} width={316} height={80} rx={6} fill="none" stroke={c} strokeWidth={3} />
    <text x={0} y={sub ? 6 : 20} fontFamily="Stencil" fontWeight={700} fontSize={sub ? 54 : 62} fill={c} textAnchor="middle" letterSpacing={4}>{kind}</text>
    {sub && <text x={0} y={34} fontFamily="Mono" fontSize={20} fill={c} textAnchor="middle">{sub}</text>}
  </g>;
};

export const Rewind: React.FC<GP> = ({ t, d }) => {
  const p = easeInOut(prog(t, .3, d - .5)); const yr = Math.round(lerp(10, 0, p));
  return <Panel t={t} title="TEN YEARS EARLIER" bg="#e8d8b4">
    <g transform="translate(960 600)">
      {Array.from({ length: 10 }).map((_, k) => { const on = k < 10 - yr; return <g key={k} transform={`translate(${(k - 4.5) * 150} 0)`}><circle r={56} fill={on ? F.ochre : 'none'} stroke={P.ink} strokeWidth={6} /><text y={14} fontFamily="Gloock" fontSize={40} textAnchor="middle" fill={P.ink}>{k + 1}</text></g>; })}
      <T_ x={0} y={190} s={46} f="Mono">YEARS OF WAR</T_>
      <g transform={`translate(${lerp(700, -700, p)} -150) rotate(${-t * 200})`}><circle r={40} fill="none" stroke={F.red} strokeWidth={8} /><path d="M 0 -40 L 10 -60 L -10 -60 Z" fill={F.red} /></g>
    </g>
  </Panel>;
};
export const MapTroy: React.FC<GP> = ({ t, T }) => {
  const C: any = (GMAP as any).cities; const [tx, ty] = C.TROY;
  const z = lerp(1, 1.6, easeInOut(prog(t, 2.5, 6)));
  return <g><rect x={-200} y={-200} width={2320} height={1480} fill="#7fb2c8" />
    <g transform={`translate(960 540) scale(${z}) translate(${-lerp(960, tx, easeInOut(prog(t, 2.5, 6)))} ${-lerp(540, ty + 80, easeInOut(prog(t, 2.5, 6)))})`}>
      {Array.from({ length: 24 }).map((_, i) => <path key={i} d={`M ${(i * 137 + T * 10) % 2100 - 100} ${(i * 211) % 1080} q 20 -8 40 0`} stroke="#fff" strokeOpacity={.35} strokeWidth={3} fill="none" />)}
      {(GMAP as any).paths.map((d: string, i: number) => <path key={i} d={d} fill="#e8d8b0" stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />)}
      {/* trade route through the straits */}
      <path d={`M ${tx - 120} ${ty + 260} Q ${tx - 30} ${ty + 60} ${tx + 40} ${ty - 40} T ${tx + 330} ${ty - 230}`} stroke={F.red} strokeWidth={10} strokeDasharray={`${easeOut(prog(t, .8, 3)) * 900} 900`} fill="none" strokeLinecap="round" />
      <g opacity={fade(t, 3)}><text x={tx + 330} y={ty - 260} fontFamily="Mono" fontSize={26} fill={P.ink} textAnchor="end">→ TO THE BLACK SEA</text></g>
      <circle cx={tx} cy={ty} r={12 + Math.sin(T * 4) * 3} fill={F.red} stroke="#fff" strokeWidth={3} /><circle cx={tx} cy={ty} r={22 + (T * 24) % 30} fill="none" stroke={F.red} strokeWidth={3} opacity={1 - ((T * 24) % 30) / 30} />
      <text x={tx + 20} y={ty - 16} fontFamily="Gloock" fontSize={40} fill={P.ink} stroke="#e8d8b0" strokeWidth={8} paintOrder="stroke">TROY</text>
      <text x={tx + 20} y={ty + 22} fontFamily="Mono" fontSize={20} fill={P.ink} stroke="#e8d8b0" strokeWidth={6} paintOrder="stroke" opacity={fade(t, 4)}>today: near Çanakkale, Türkiye</text>
      {['MYCENAE', 'SPARTA'].map((n) => <g key={n}><circle cx={C[n][0]} cy={C[n][1]} r={8} fill={P.ink} /><text x={C[n][0] + 14} y={C[n][1] - 8} fontFamily="Mono" fontSize={24} fill={P.ink} stroke="#e8d8b0" strokeWidth={6} paintOrder="stroke">{n}</text></g>)}
    </g>
    <Spiral y={0} t={t} /><Spiral y={1016} flip t={t} />
  </g>;
};
export const Ships1186: React.FC<GP> = ({ t }) => {
  const n = Math.floor(easeOut(prog(t, .4, 4.5)) * 1186);
  return <Panel t={t} title="HOW MANY SHIPS?" note="Iliad, Book 2 — the 'Catalogue of Ships'">
    <g transform="translate(160 300)">{Array.from({ length: 240 }).map((_, i) => { const on = i < n / 1186 * 240; return <g key={i} transform={`translate(${(i % 30) * 54} ${Math.floor(i / 30) * 70})`} opacity={on ? 1 : .12}><path d="M -18 0 L 18 0 L 24 -12 L -24 -12 Z" fill={on ? '#2a2420' : '#8a7a6a'} /><line x1={0} y1={-12} x2={0} y2={-34} stroke={P.ink} strokeWidth={3} /></g>; })}</g>
    <T_ x={960} y={930} s={86}>{n.toLocaleString('en-US')} ships</T_>
    <g transform="translate(1600 900)"><Stamp kind="MAYBE" p={prog(t, 5, 5.6)} s={.8} sub="probably far fewer" /></g>
  </Panel>;
};
export const ArmorCost: React.FC<GP> = ({ t }) => (
  <Panel t={t} title="THE PRICE OF BRONZE" note="Dendra panoply, c. 1400 BC — a real bronze armour found in Greece">
    <g transform={`translate(520 820) scale(${1.7 * pop(t, .3)})`}><MChar look={{ ...CAST.hec, glow: false }} x={0} y={0} s={1} pose={{ holdF: 'spear', armF: -.3, elbowF: .5, expr: 'fierce' }} /></g>
    <T_ x={960} y={600} s={130} o={fade(t, 1.2)}>=</T_>
    <g transform={`translate(1400 760) scale(${pop(t, 1.6)})`}>
      <path d="M -220 0 L -220 -150 L 0 -260 L 220 -150 L 220 0 Z" fill={F.plaster} stroke={P.ink} strokeWidth={8} /><rect x={-40} y={-120} width={80} height={120} fill={F.redD} stroke={P.ink} strokeWidth={6} />
      {Array.from({ length: 6 }).map((_, k) => <ellipse key={k} cx={-260 + k * 100} cy={60} rx={40} ry={24} fill={F.ochre} stroke={P.ink} strokeWidth={5} />)}
      <T_ x={0} y={150} s={48}>a whole farm</T_>
    </g>
    <g transform="translate(1500 330)"><Stamp kind="EVIDENCE" p={prog(t, 3, 3.6)} s={.8} sub="Dendra, Greece" /></g>
  </Panel>
);
export const IliadSpan: React.FC<GP> = ({ t }) => {
  const p = easeOut(prog(t, .5, 3));
  return <Panel t={t} title="WHAT THE ILIAD ACTUALLY COVERS" note="Homer's Iliad tells about 50 days in the tenth year. The horse and the fall of Troy come from later poems.">
    <g transform="translate(160 560)">
      <rect x={0} y={-40} width={1600 * p} height={80} fill={F.ochre} stroke={P.ink} strokeWidth={6} />
      {Array.from({ length: 11 }).map((_, k) => <g key={k}><line x1={k * 160} y1={-60} x2={k * 160} y2={60} stroke={P.ink} strokeWidth={4} /><text x={k * 160} y={110} fontFamily="Mono" fontSize={26} textAnchor="middle">{k === 0 ? 'START' : `YEAR ${k}`}</text></g>)}
      <rect x={1440 + 120} y={-60} width={30} height={120} fill={F.red} stroke={P.ink} strokeWidth={5} opacity={fade(t, 2.5)} />
      <g opacity={fade(t, 2.8)}><path d="M 1575 -70 L 1575 -170" stroke={F.red} strokeWidth={6} /><T_ x={1575} y={-190} s={40} c={F.red}>THE ILIAD</T_><T_ x={1575} y={-240} s={28} f="Mono" c={F.red}>~50 days</T_></g>
    </g>
  </Panel>;
};
export const WallsChase: React.FC<GP> = ({ t }) => {
  const laps = clamp(t / 6.5) * 3; const a = laps * Math.PI * 2 - Math.PI / 2;
  const R = (aa: number) => [960 + Math.cos(aa) * 380, 600 + Math.sin(aa) * 280];
  const [hx, hy] = R(a), [ax, ay] = R(a - .55);
  return <Panel t={t} title="THREE TIMES AROUND THE WALLS" note="Iliad, Book 22">
    <ellipse cx={960} cy={600} rx={380} ry={280} fill="none" stroke={P.ink} strokeWidth={4} strokeDasharray="16 14" />
    <ellipse cx={960} cy={600} rx={300} ry={210} fill={F.stone} stroke={P.ink} strokeWidth={8} />
    {Array.from({ length: 16 }).map((_, k) => { const aa = k / 16 * Math.PI * 2; return <rect key={k} x={960 + Math.cos(aa) * 300 - 14} y={600 + Math.sin(aa) * 210 - 14} width={28} height={28} fill={F.stoneD} stroke={P.ink} strokeWidth={4} />; })}
    <T_ x={960} y={620} s={60}>TROY</T_>
    <circle cx={hx} cy={hy} r={26} fill={F.red} stroke={P.ink} strokeWidth={5} /><T_ x={hx} y={hy - 40} s={26} f="Mono">HECTOR</T_>
    <circle cx={ax} cy={ay} r={26} fill={F.ochre} stroke={P.ink} strokeWidth={5} /><T_ x={ax} y={ay + 62} s={26} f="Mono">ACHILLES</T_>
    <T_ x={1620} y={900} s={110} c={F.red}>{Math.min(3, Math.floor(laps) + 1)}/3</T_>
  </Panel>;
};
export const NineCities: React.FC<GP> = ({ t }) => {
  const L = [['IX', 'Roman Ilion'], ['VIII', 'Greek Ilion'], ['VIIb', ''], ['VIIa', 'burned c. 1180 BC'], ['VI', 'great walls'], ['V', ''], ['IV', ''], ['III', ''], ['II', '"Priam\'s treasure"'], ['I', 'c. 3000 BC']];
  return <Panel t={t} title="NINE CITIES IN ONE HILL" note="Hisarlık, near Çanakkale — excavated by Calvert & Schliemann from 1870s, later Blegen, Korfmann, Aslan">
    {L.map(([n, d], k) => { const p = pop(t, .3 + (9 - k) * .22); const y = 290 + k * 68; const hot = n === 'VIIa';
      return <g key={k} opacity={clamp(p * 2)} transform={`translate(${(1 - p) * -200} 0)`}>
        <rect x={420} y={y} width={820} height={60} fill={hot ? F.red : ['#cdb58a', '#bfa47a', '#d8c49a', '#b89a70'][k % 4]} stroke={P.ink} strokeWidth={5} />
        {hot && Array.from({ length: 8 }).map((_, f) => <path key={f} d={`M ${460 + f * 100} ${y + 60} q 10 -40 20 0`} fill={F.fire} />)}
        <text x={460} y={y + 42} fontFamily="Gloock" fontSize={36} fill={hot ? '#fff' : P.ink}>TROY {n}</text>
        <text x={1270} y={y + 42} fontFamily="Mono" fontSize={26} fill={hot ? F.red : '#5a4a36'}>{d}</text>
      </g>; })}
    <g transform="translate(1640 760)"><Stamp kind="EVIDENCE" p={prog(t, 3.2, 3.8)} s={.75} sub="fire, arrowheads" /></g>
  </Panel>;
};
export const Tablet: React.FC<GP> = ({ t }) => (
  <Panel t={t} title="WHAT THE HITTITES WROTE" note="Hittite treaty with Alaksandu of Wilusa, c. 1280 BC — many scholars link Wilusa with (W)Ilios">
    <g transform={`translate(560 640) rotate(${-4 + Math.sin(t) * 1}) scale(${pop(t, .3)})`}>
      <path d="M -260 -300 Q -280 0 -250 300 Q 0 330 250 300 Q 280 0 260 -300 Q 0 -330 -260 -300 Z" fill="#c8a878" stroke={P.ink} strokeWidth={8} />
      {Array.from({ length: 10 }).map((_, r) => Array.from({ length: 12 }).map((_, c) => { const R = rng(r * 12 + c); return <g key={r + '-' + c} transform={`translate(${-220 + c * 38} ${-250 + r * 52})`}><path d={`M 0 0 l 14 6 l -14 6 Z`} fill="#6a5034" />{R() > .5 && <path d="M 18 -2 l 0 16" stroke="#6a5034" strokeWidth={5} />}</g>; }))}
    </g>
    <g transform="translate(1340 420)" opacity={fade(t, 1.4)}><T_ x={0} y={0} s={60} c={F.red}>WILUSA</T_><T_ x={0} y={60} s={40} f="Mono">→ (W)ILIOS = TROY ?</T_></g>
    <g transform="translate(1340 680)" opacity={fade(t, 3)}><T_ x={0} y={0} s={60} c={F.blue}>ALAKSANDU</T_><T_ x={0} y={60} s={40} f="Mono">→ ALEXANDROS (PARIS) ?</T_></g>
    <g transform="translate(1340 900)"><Stamp kind="MAYBE" p={prog(t, 5, 5.6)} s={.7} sub="still debated" /></g>
  </Panel>
);
