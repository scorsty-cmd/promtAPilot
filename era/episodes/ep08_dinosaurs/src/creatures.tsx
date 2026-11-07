import React from 'react';
import { clamp, lerp } from './lib';
import { P } from './art';

/* ===== creature rigs (new in ep07): theropod, raptor, dinosauroid guide, tiny primate, sauropod, pterosaur, mosasaur, duckbill, crow ===== */
export const R = { teal: '#0a8f8a', tealD: '#066a66', pink: '#ff4f9a', pinkL: '#ff9ac4', yellow: '#ffd23f', navy: '#233a73', orange: '#ff7a2f', paper: '#f4eee0', green: '#3fa86a', greenD: '#24704a', purple: '#7a4fb0', brown: '#8a5a34' };
const ol = (w = 7) => ({ stroke: P.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
type Ex = 'neutral' | 'happy' | 'laugh' | 'surprised' | 'angry' | 'worried' | 'thinking' | 'sad' | 'excited' | 'scared';
const EYE: Record<Ex, { raise: number; tilt: number; lid: number; wide: number; laugh?: boolean }> = {
  neutral: { raise: 0, tilt: 0, lid: 0, wide: 1 }, happy: { raise: .6, tilt: -.2, lid: .25, wide: 1 }, laugh: { raise: 1, tilt: -.3, lid: 0, wide: 1, laugh: true },
  surprised: { raise: 2.2, tilt: -.2, lid: 0, wide: 1.25 }, angry: { raise: -1, tilt: 1.4, lid: .3, wide: .95 }, worried: { raise: 1.1, tilt: -1.2, lid: .1, wide: 1.05 },
  thinking: { raise: .5, tilt: .3, lid: .35, wide: 1 }, sad: { raise: .4, tilt: -1.3, lid: .45, wide: 1 }, excited: { raise: 1.6, tilt: -.3, lid: 0, wide: 1.15 }, scared: { raise: 2, tilt: -1.4, lid: 0, wide: 1.3 },
};
const Eye: React.FC<{ x: number; y: number; r: number; ex?: Ex; blink?: number; lookX?: number; lookY?: number; brow?: boolean; c?: string }> = ({ x, y, r, ex = 'neutral', blink = 0, lookX = 0, lookY = 0, brow = true, c = '#fff8e8' }) => {
  const E = EYE[ex]; const lid = clamp(Math.max(blink, E.lid)); const h = r * (1 - lid) * E.wide;
  return <g>
    {E.laugh && blink < .5 ? <path d={`M ${x - r} ${y + 2} Q ${x} ${y - r * 1.3} ${x + r} ${y + 2}`} stroke={P.ink} strokeWidth={r * .35} fill="none" strokeLinecap="round" />
      : <><ellipse cx={x} cy={y} rx={r * E.wide} ry={Math.max(1.5, h)} fill={c} {...ol(r * .28)} />
        {h > r * .3 && <circle cx={x + lookX * r * .4} cy={y + lookY * r * .35} r={r * .5} fill={P.ink} />}
        {h > r * .3 && <circle cx={x + lookX * r * .4 + r * .18} cy={y + lookY * r * .35 - r * .2} r={r * .16} fill="#fff" />}</>}
    {brow && <path d={`M ${x - r * 1.1} ${y - r * 1.25 - E.raise * r * .25 - E.tilt * r * .2} L ${x + r * 1.1} ${y - r * 1.25 - E.raise * r * .25 + E.tilt * r * .35}`} stroke={P.ink} strokeWidth={r * .38} strokeLinecap="round" />}
  </g>;
};

/* big theropod (tyrannosaur descendant) */
export const Theropod: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; walk?: number; jaw?: number; head?: number; body?: string; belly?: string; stripes?: string; ex?: Ex; blink?: number; breathe?: number; fluff?: boolean; lookX?: number }> =
  ({ x, y, s = 1, flip, ph = 0, walk = 0, jaw = 0, head = 0, body = R.teal, belly = R.yellow, stripes = R.navy, ex = 'neutral', blink = 0, breathe = 0, fluff, lookX = 0 }) => {
    const bob = -Math.abs(Math.cos(ph)) * 10 * walk + Math.sin(breathe) * 4;
    const dark = '#077a76';
    const leg = (o: number, back: boolean) => {
      const a = Math.sin(ph + o) * 26 * walk, lift = Math.max(0, Math.sin(ph + o + 1.4)) * 30 * walk; const c = back ? dark : body;
      return <g transform={`translate(${back ? -30 : 0} -490) rotate(${a})`}>
        <g transform={`translate(30 210) rotate(${28 + lift})`}>
          <path d="M -32 -10 L 28 -10 L 18 190 L -18 190 Z" fill={c} {...ol(6)} />
          <g transform={`translate(0 186) rotate(${-62 - lift * .6})`}>
            <path d="M -18 0 L 18 0 L 14 130 L -14 130 Z" fill={c} {...ol(6)} />
            <g transform={`translate(0 128) rotate(${34 - a})`}><path d="M -26 -10 L 90 -14 Q 104 0 90 14 L -26 14 Z" fill={c} {...ol(6)} />{[30, 60, 88].map((q) => <path key={q} d={`M ${q} 12 l 16 10`} stroke={P.ink} strokeWidth={6} strokeLinecap="round" />)}</g>
          </g>
        </g>
        <ellipse cx={20} cy={90} rx={92} ry={150} transform="rotate(-14 20 90)" fill={c} {...ol()} />
        {!back && <path d="M -30 30 q 40 70 10 150" stroke={stripes} strokeWidth={12} fill="none" opacity={.6} strokeLinecap="round" />}
      </g>; };
    return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={6} rx={300} ry={26} fill="rgba(0,0,0,.18)" />
      <g transform={`translate(0 ${bob})`}>
        {leg(Math.PI, true)}
        <path d={`M -120 -560 Q -420 -540 -720 ${-470 + Math.sin(ph) * 30 * walk + Math.sin(breathe * .5) * 12} Q -420 -450 -110 -390 Z`} fill={body} {...ol()} />
        <path d="M -240 -500 C -200 -660 120 -700 260 -590 C 330 -530 300 -400 180 -360 C 40 -320 -160 -330 -240 -420 Z" fill={body} {...ol()} />
        <path d="M -180 -380 Q 40 -320 250 -430" fill="none" stroke={belly} strokeWidth={40} strokeLinecap="round" opacity={.9} />
        <path d="M -240 -500 C -200 -660 120 -700 260 -590 L 200 -560 C 60 -640 -160 -620 -220 -480 Z" fill="url(#dots)" opacity={.12} />
        {Array.from({ length: 6 }).map((_, k) => <path key={k} d={`M ${-170 + k * 66} ${-640 + Math.abs(k - 2.5) * 12} q 18 34 4 76`} stroke={stripes} strokeWidth={14} fill="none" strokeLinecap="round" opacity={.75} />)}
        {fluff && Array.from({ length: 12 }).map((_, k) => <path key={'f' + k} d={`M ${-220 + k * 40} ${-630 + Math.abs(k - 6) * 8} q 10 -34 26 -8`} stroke={R.pink} strokeWidth={11} fill="none" strokeLinecap="round" />)}
        <g transform="translate(250 -470) rotate(40)"><rect x={-10} y={0} width={22} height={70} rx={10} fill={body} {...ol(5)} /><path d="M -6 66 l -6 18 M 10 66 l 6 18" stroke={P.ink} strokeWidth={5} /></g>
        {leg(0, false)}
        <g transform={`translate(230 -560) rotate(${head})`}>
          <path d="M -60 40 Q -10 -60 80 -100 L 150 -10 Q 70 40 20 90 Z" fill={body} {...ol()} />
          <g transform={`translate(110 -40) rotate(${jaw * 24})`}><path d="M 0 0 L 270 -6 Q 290 20 250 44 L 30 56 Q -20 40 0 0 Z" fill={body} {...ol()} /><path d="M 40 4 L 260 -2" stroke="#fff" strokeWidth={11} strokeDasharray="11 8" />{jaw > .15 && <path d="M 40 10 L 250 4 L 240 30 L 40 36 Z" fill="#c43a6a" />}</g>
          {jaw > .15 && <path d="M 120 -44 L 380 -60 L 370 -30 L 120 -26 Z" fill="#a02a5a" />}
          <path d="M 70 -150 Q 200 -200 390 -130 Q 420 -100 400 -60 L 120 -40 Q 50 -70 70 -150 Z" fill={body} {...ol()} />
          <path d="M 130 -48 L 396 -62" stroke="#fff" strokeWidth={11} strokeDasharray="11 8" />
          <path d="M 340 -136 q 16 -8 30 2" stroke={P.ink} strokeWidth={7} fill="none" />
          <path d="M 120 -150 Q 200 -190 300 -160" stroke={stripes} strokeWidth={12} fill="none" opacity={.6} strokeLinecap="round" />
          <Eye x={200} y={-118} r={20} ex={ex} blink={blink} lookX={lookX} />
          <path d="M 90 -140 q 20 -40 50 -20" stroke={P.ink} strokeWidth={6} fill="none" />
        </g>
      </g>
    </g>;
  };

/* small feathered raptor */
export const Raptor: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; run?: number; c?: string; c2?: string; ex?: Ex; eyeGlow?: boolean }> = ({ x, y, s = 1, flip, ph = 0, run = 0, c = R.purple, c2 = R.pink, ex = 'angry', eyeGlow }) => {
  const bob = Math.abs(Math.sin(ph)) * 14 * run;
  const leg = (o: number, back: boolean) => { const a = Math.sin(ph + o) * 40 * run; return <g transform={`translate(0 -120) rotate(${a})`} opacity={back ? .8 : 1}><rect x={-12} y={0} width={24} height={70} rx={10} fill={back ? '#5a3a8a' : c} {...ol(5)} /><g transform={`translate(0 66) rotate(${-Math.max(0, Math.sin(ph + o + 1)) * 50 * run})`}><rect x={-8} y={-4} width={16} height={60} rx={7} fill={back ? '#5a3a8a' : c} {...ol(5)} /><path d="M -10 56 L 30 56 M 0 56 l -8 -18" stroke={P.ink} strokeWidth={7} /></g></g>; };
  return <g transform={`translate(${x} ${y - bob}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {leg(Math.PI, true)}
    <path d={`M -40 -160 Q -200 -170 -280 ${-150 + Math.sin(ph) * 14 * run}`} stroke={c} strokeWidth={30} fill="none" strokeLinecap="round" /><path d={`M -40 -160 Q -200 -170 -280 ${-150 + Math.sin(ph) * 14 * run}`} stroke={P.ink} strokeWidth={4} fill="none" opacity={.5} />
    {Array.from({ length: 6 }).map((_, k) => <path key={k} d={`M ${-120 - k * 26} -166 l -20 -22`} stroke={c2} strokeWidth={9} strokeLinecap="round" />)}
    <ellipse cx={0} cy={-160} rx={80} ry={50} fill={c} {...ol()} />
    <path d="M 40 -180 Q 80 -240 120 -250 L 150 -230 Q 110 -210 80 -160 Z" fill={c} {...ol(6)} />
    <path d="M 100 -264 Q 140 -280 200 -250 Q 210 -236 196 -230 L 110 -224 Q 90 -240 100 -264 Z" fill={c} {...ol(6)} />
    <Eye x={128} y={-252} r={10} ex={ex} brow c={eyeGlow ? '#ffe66a' : '#fff8e8'} />
    <g transform="translate(40 -150) rotate(40)"><path d="M 0 0 L 60 30 L 0 40 Z" fill={c2} {...ol(5)} /></g>
    {[0, 1, 2, 3].map((k) => <path key={'c' + k} d={`M ${90 - k * 14} -262 l -12 -22`} stroke={c2} strokeWidth={8} strokeLinecap="round" />)}
    {leg(0, false)}
  </g>;
};

/* the dinosauroid guide — bird-like, upright, expressive, talks */
export type TroodPose = { walk?: number; ph?: number; open?: number; ex?: Ex; blink?: number; lookX?: number; lookY?: number; arm?: number; point?: boolean; tilt?: number; run?: number; crouch?: number; armB?: number };
export const Trood: React.FC<{ x: number; y: number; s?: number; flip?: boolean; p?: TroodPose }> = ({ x, y, s = 1, flip, p = {} }) => {
  const { walk = 0, ph = 0, open = 0, ex = 'neutral', blink = 0, lookX = 0, lookY = 0, arm = 0, point, tilt = 0, run = 0, crouch = 0, armB = 0 } = p;
  const C = '#ff8a5a', CD = '#d8643a', C2 = R.yellow, F = R.pink;
  const bob = -Math.abs(Math.cos(ph)) * (5 + run * 12) * walk + crouch * 40;
  const leg = (o: number, back: boolean) => { const a = Math.sin(ph + o) * (24 + run * 22) * walk, lift = Math.max(0, Math.sin(ph + o + 1.3)) * (30 + run * 30) * walk; const c = back ? CD : C;
    return <g transform={`translate(${back ? -16 : 6} -196) rotate(${a})`}>
      <g transform={`translate(10 74) rotate(${30 + lift + crouch * 30})`}><path d="M -12 -4 L 12 -4 L 8 76 L -8 76 Z" fill={c} {...ol(5)} />
        <g transform={`translate(0 74) rotate(${-64 - lift * .6 - crouch * 40})`}><path d="M -8 0 L 8 0 L 6 64 L -6 64 Z" fill={c} {...ol(5)} />
          <g transform={`translate(0 62) rotate(${34 - a})`}><path d="M -10 -6 L 40 -6 L 46 6 L -10 8 Z" fill={C2} {...ol(5)} /><path d="M 30 6 l 12 8 M 14 6 l 8 10" stroke={P.ink} strokeWidth={5} strokeLinecap="round" /></g></g></g>
      <ellipse cx={8} cy={34} rx={34} ry={52} transform="rotate(-12 8 34)" fill={c} {...ol(6)} />
    </g>; };
  const hand = (pt: boolean) => <g transform="translate(0 72)">{pt ? <><path d="M 0 0 L 4 40" stroke={P.ink} strokeWidth={11} strokeLinecap="round" /><path d="M 0 0 L 4 40" stroke={C2} strokeWidth={5} strokeLinecap="round" /><path d="M -2 4 L -14 18" stroke={P.ink} strokeWidth={10} strokeLinecap="round" /></> : [-14, 0, 14].map((fx) => <g key={fx}><path d={`M 0 0 L ${fx} 26`} stroke={P.ink} strokeWidth={10} strokeLinecap="round" /><path d={`M 0 0 L ${fx} 26`} stroke={C2} strokeWidth={4} strokeLinecap="round" /></g>)}</g>;
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <ellipse cx={0} cy={4} rx={80} ry={12} fill="rgba(0,0,0,.18)" />
    <g transform={`translate(0 ${bob}) rotate(${tilt + run * 14 * walk} 0 -200)`}>
      {leg(Math.PI, true)}
      <path d={`M -40 -240 Q -170 -230 -270 ${-250 + Math.sin(ph * .5 + 1) * 14 - crouch * 20} Q -170 -190 -30 -170 Z`} fill={C} {...ol(6)} />
      {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${-250 + k * 6} ${-246 + Math.sin(ph * .5 + 1) * 14 - crouch * 20} l ${-40 + k * 4} ${-30 + k * 22}`} stroke={F} strokeWidth={14} strokeLinecap="round" />)}
      {/* back arm */}
      <g transform={`translate(-6 -306) rotate(${10 - armB * 60 + Math.sin(ph) * 20 * walk})`}><path d="M -12 0 L 12 0 L 8 70 L -8 70 Z" fill={CD} {...ol(5)} />{hand(false)}</g>
      <path d="M -70 -260 C -80 -330 -20 -360 30 -340 C 80 -310 70 -220 30 -180 C -10 -150 -70 -190 -70 -260 Z" fill={C} {...ol()} />
      <path d="M 10 -320 C 50 -300 50 -230 20 -190" stroke={C2} strokeWidth={30} strokeLinecap="round" fill="none" />
      <path d="M -70 -260 C -80 -330 -20 -360 30 -340 L 10 -330 C -40 -330 -60 -290 -60 -250 Z" fill="url(#dotsL)" opacity={.2} />
      {/* neck + head */}
      <g transform={`translate(20 -330) rotate(${Math.sin(ph * .5) * 3 + lookY * 8})`}>
        <path d="M -24 10 Q -10 -40 10 -60 L 46 -46 Q 26 -10 24 16 Z" fill={C} {...ol(6)} />
        {Array.from({ length: 5 }).map((_, k) => <path key={k} d={`M ${-40 + k * 8} ${-100 - k * 6} q ${-30 - k * 4} ${-20 + k * 4} ${-52 - k * 2} ${-6 + k * 6}`} stroke={F} strokeWidth={13} fill="none" strokeLinecap="round" />)}
        <ellipse cx={20} cy={-96} rx={66} ry={58} fill={C} {...ol()} />
        <path d={`M 70 -110 L 150 ${-96 - open * 4} Q 120 -76 76 -80 Z`} fill={C2} {...ol(6)} />
        <path d={`M 74 -80 Q 112 ${-74 + open * 10} 140 ${-72 + open * 30} L 74 ${-62 + open * 10} Z`} fill={C2} {...ol(6)} />
        {open > .15 && <path d={`M 80 -78 L 128 ${-72 + open * 22} L 78 ${-66 + open * 8} Z`} fill="#b8305a" />}
        <circle cx={118} cy={-100} r={4} fill={P.ink} />
        <Eye x={30} y={-112} r={24} ex={ex} blink={blink} lookX={lookX} lookY={lookY} />
        <circle cx={-6} cy={-72} r={13} fill={R.pink} opacity={.45} />
      </g>
      {/* front arm with feathers */}
      <g transform={`translate(26 -300) rotate(${-10 - arm * 80 + Math.sin(ph + Math.PI) * 20 * walk})`}>
        {[0, 1, 2].map((k) => <path key={k} d={`M -10 ${14 + k * 18} l -26 14`} stroke={F} strokeWidth={10} strokeLinecap="round" />)}
        <path d="M -12 0 L 12 0 L 9 74 L -9 74 Z" fill={C} {...ol(5)} />{hand(!!point)}
      </g>
      {leg(0, false)}
    </g>
  </g>;
};

/* tiny primate ancestor */
export const Pip: React.FC<{ x: number; y: number; s?: number; flip?: boolean; open?: number; ex?: Ex; blink?: number; ph?: number; hop?: number }> = ({ x, y, s = 1, flip, open = 0, ex = 'happy', blink = 0, ph = 0, hop = 0 }) => {
  const C = '#b8743a', C2 = '#f0d0a8';
  return <g transform={`translate(${x} ${y - Math.abs(Math.sin(ph)) * 20 * hop}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d={`M -30 -20 Q -120 -40 -140 ${-120 + Math.sin(ph * .7) * 20}`} stroke={C} strokeWidth={14} fill="none" strokeLinecap="round" /><path d={`M -30 -20 Q -120 -40 -140 ${-120 + Math.sin(ph * .7) * 20}`} stroke={P.ink} strokeWidth={3} fill="none" opacity={.5} />
    <ellipse cx={0} cy={-40} rx={50} ry={40} fill={C} {...ol(6)} /><ellipse cx={10} cy={-30} rx={28} ry={24} fill={C2} />
    {[-24, 20].map((fx) => <ellipse key={fx} cx={fx} cy={-4} rx={14} ry={8} fill={C} {...ol(5)} />)}
    <g transform="translate(36 -88)">
      {[-26, 22].map((ex2) => <g key={ex2}><circle cx={ex2} cy={-40} r={18} fill={C} {...ol(5)} /><circle cx={ex2} cy={-40} r={9} fill={R.pinkL} /></g>)}
      <ellipse cx={0} cy={0} rx={46} ry={40} fill={C} {...ol(6)} /><ellipse cx={20} cy={14} rx={24} ry={16} fill={C2} />
      <Eye x={-10} y={-6} r={14} ex={ex} blink={blink} brow={false} /><Eye x={20} y={-6} r={14} ex={ex} blink={blink} brow={false} />
      <circle cx={42} cy={10} r={6} fill={P.ink} />
      <ellipse cx={30} cy={24} rx={8} ry={2 + open * 8} fill="#5a1f17" stroke={P.ink} strokeWidth={3} />
    </g>
  </g>;
};

export const Sauropod: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; walk?: number; c?: string }> = ({ x, y, s = 1, flip, ph = 0, walk = 1, c = R.green }) => {
  const leg = (lx: number, o: number, back: boolean) => <g transform={`translate(${lx} -240) rotate(${Math.sin(ph + o) * 12 * walk})`}><rect x={-40} y={0} width={80} height={250} rx={34} fill={back ? R.greenD : c} {...ol()} /></g>;
  return <g transform={`translate(${x} ${y + Math.sin(ph * 2) * 4 * walk}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {leg(-160, Math.PI, true)}{leg(170, 0, true)}
    <path d={`M -200 -380 Q -560 -330 -760 ${-200 + Math.sin(ph) * 30}`} stroke={c} strokeWidth={80} fill="none" strokeLinecap="round" /><path d={`M -200 -380 Q -560 -330 -760 ${-200 + Math.sin(ph) * 30}`} stroke={P.ink} strokeWidth={6} fill="none" opacity={.4} />
    <ellipse cx={0} cy={-360} rx={300} ry={170} fill={c} {...ol()} />
    {Array.from({ length: 6 }).map((_, k) => <circle key={k} cx={-180 + k * 70} cy={-460 + Math.abs(k - 2.5) * 10} r={22} fill={R.yellow} opacity={.8} />)}
    <path d={`M 220 -420 Q 380 -700 ${520 + Math.sin(ph * .5) * 20} -900`} stroke={c} strokeWidth={70} fill="none" strokeLinecap="round" /><path d={`M 220 -420 Q 380 -700 ${520 + Math.sin(ph * .5) * 20} -900`} stroke={P.ink} strokeWidth={6} fill="none" opacity={.4} />
    <g transform={`translate(${530 + Math.sin(ph * .5) * 20} -910)`}><ellipse cx={30} cy={0} rx={70} ry={40} fill={c} {...ol()} /><circle cx={44} cy={-12} r={8} fill={P.ink} /></g>
    {leg(-120, 0, false)}{leg(210, Math.PI, false)}
  </g>;
};
export const Ptero: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; flap?: number }> = ({ x, y, s = 1, flip, ph = 0, flap = 1 }) => {
  const w = Math.sin(ph) * 40 * flap;
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d={`M 0 0 L -420 ${-60 - w} L -380 ${-20 - w * .6} L -60 30 Z`} fill={R.orange} {...ol()} />
    <path d={`M 0 0 L 420 ${-60 - w} L 380 ${-20 - w * .6} L 60 30 Z`} fill="#ff9a5a" {...ol()} />
    <ellipse cx={0} cy={10} rx={70} ry={30} fill={R.orange} {...ol()} />
    <path d="M 50 0 Q 140 -60 200 -70 L 330 -40 L 200 -40 Q 150 -20 70 20 Z" fill={R.orange} {...ol(6)} />
    <path d="M 160 -70 L 120 -170 L 200 -80 Z" fill={R.pink} {...ol(5)} /><circle cx={180} cy={-56} r={8} fill={P.ink} />
  </g>;
};
export const Mosa: React.FC<{ x: number; y: number; s?: number; flip?: boolean; open?: number; rot?: number }> = ({ x, y, s = 1, flip, open = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${rot})`}>
    <path d="M -600 40 Q -300 -40 0 -60 Q 200 -70 380 -40 L 380 40 Q 200 70 0 60 Q -300 60 -600 40 Z" fill={R.navy} {...ol()} />
    <path d="M -600 40 L -760 -60 L -720 60 L -760 160 Z" fill={R.navy} {...ol()} />
    <path d="M -380 30 Q 0 40 360 20" stroke="#8ab8e8" strokeWidth={30} fill="none" opacity={.6} />
    <g transform="translate(360 -20)"><path d="M 0 -40 L 260 -30 Q 280 -10 260 0 L 0 10 Z" fill={R.navy} {...ol()} /><g transform={`rotate(${open * 30})`}><path d="M 0 10 L 250 10 Q 260 30 240 40 L 0 50 Z" fill={R.navy} {...ol()} /></g>
      <path d={`M 20 0 L 250 -4`} stroke="#fff" strokeWidth={9} strokeDasharray="9 7" /><circle cx={60} cy={-22} r={10} fill="#ffe66a" stroke={P.ink} strokeWidth={4} /></g>
    {[-200, 100].map((fx) => <path key={fx} d={`M ${fx} 50 l -60 70 l 50 -10 Z`} fill={R.navy} {...ol(5)} />)}
  </g>
);
export const Duckbill: React.FC<{ x: number; y: number; s?: number; flip?: boolean; ph?: number; walk?: number; c?: string }> = ({ x, y, s = 1, flip, ph = 0, walk = 0, c = R.orange }) => (
  <g transform={`translate(${x} ${y + Math.sin(ph * 2) * 4 * walk}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {[[-60, Math.PI, true], [70, 0, false]].map(([lx, o, b], k) => <g key={k} transform={`translate(${lx} -150) rotate(${Math.sin(ph + +o) * 18 * walk})`}><rect x={-26} y={0} width={52} height={150} rx={22} fill={b ? '#c8602a' : c} {...ol(6)} /></g>)}
    <path d="M -80 -240 Q -300 -230 -420 -150" stroke={c} strokeWidth={50} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-220} rx={150} ry={90} fill={c} {...ol()} />
    <path d="M 120 -260 Q 180 -360 240 -380 L 300 -350 Q 250 -330 200 -220 Z" fill={c} {...ol(6)} />
    <path d="M 230 -400 Q 300 -420 340 -380 L 330 -350 L 250 -350 Z" fill={c} {...ol(6)} /><path d="M 250 -400 Q 230 -470 200 -480" stroke={R.yellow} strokeWidth={22} strokeLinecap="round" fill="none" />
    <circle cx={270} cy={-388} r={7} fill={P.ink} />
  </g>
);
export const Crow: React.FC<{ x: number; y: number; s?: number; flip?: boolean; open?: number; ph?: number; blink?: number }> = ({ x, y, s = 1, flip, open = 0, ph = 0, blink = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${Math.sin(ph) * 4})`}>
    <path d="M -40 -40 L -140 10 L -120 -20 L -150 -10 Z" fill="#1e2230" {...ol(5)} />
    <ellipse cx={0} cy={-50} rx={70} ry={50} fill="#1e2230" {...ol()} />
    <circle cx={60} cy={-100} r={40} fill="#1e2230" {...ol()} />
    <path d={`M 90 -110 L 150 ${-100 - open * 6} L 92 -92 Z`} fill="#3a3a46" {...ol(5)} /><path d={`M 92 -92 L 146 ${-92 + open * 18} L 90 -84 Z`} fill="#3a3a46" {...ol(5)} />
    <Eye x={66} y={-108} r={9} ex="thinking" blink={blink} brow={false} c="#e8e0d0" />
    {[-20, 20].map((lx) => <path key={lx} d={`M ${lx} 0 L ${lx} 40 M ${lx - 10} 40 L ${lx + 14} 40`} stroke={P.ink} strokeWidth={7} />)}
  </g>
);
