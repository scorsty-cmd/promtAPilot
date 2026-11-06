import React from 'react';
import { clamp, lerp, noise1, rng } from './lib';

/* ============ palette: Ice Age cave pigments ============ */
export const P = {
  ink: '#1d1612', chalk: '#f2e7d0', ochreR: '#b5432a', ochreY: '#d9a441', ochreD: '#8a4b24',
  snow: '#eef3f6', snowS: '#c7d6e0', ice: '#a9c6d6', night: '#16233a', fire: '#ff8a2b', fireY: '#ffd166',
};
const OL = 7; // outline width

/* hand-drawn line boil: displacement that changes every 3 frames */
export const Boil: React.FC<{ id: string; frame: number; scale?: number }> = ({ id, frame, scale = 3.2 }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves={2} seed={Math.floor(frame / 3) % 7} />
    <feDisplacementMap in="SourceGraphic" scale={scale} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

/* ============ characters ============ */
export type Mouth = 'smile' | 'grin' | 'O' | 'flat' | 'sad' | 'talk' | 'blow';
export type Look = {
  skin: string; skinS: string; hair: string; hairStyle: 'mop' | 'braids' | 'bun' | 'band' | 'grey' | 'baby';
  tunic: string; tunicS: string; band?: string; stripe?: boolean; beard?: boolean; necklace?: boolean; wrinkles?: boolean;
};
export const LOOKS: Record<string, Look> = {
  you: { skin: '#c8875a', skinS: '#a86a43', hair: '#3b2216', hairStyle: 'mop', tunic: '#a77b4f', tunicS: '#7f5a36', band: P.ochreR, stripe: true },
  mom: { skin: '#b97a50', skinS: '#99603a', hair: '#24160f', hairStyle: 'braids', tunic: '#8c6a48', tunicS: '#6a4e33', band: P.ochreY, necklace: true },
  elder: { skin: '#b9825c', skinS: '#97643f', hair: '#d9d2c4', hairStyle: 'grey', tunic: '#6f5a44', tunicS: '#51412f', band: P.chalk, beard: true, wrinkles: true },
  a: { skin: '#9e6640', skinS: '#7f4f2f', hair: '#1a110c', hairStyle: 'band', tunic: '#94704a', tunicS: '#6e5235', band: P.ochreY },
  b: { skin: '#d39a6c', skinS: '#b27a50', hair: '#6b3a1e', hairStyle: 'bun', tunic: '#7d6248', tunicS: '#5c4632', band: P.ochreR, necklace: true },
  c: { skin: '#8a5636', skinS: '#6c4126', hair: '#140c08', hairStyle: 'mop', tunic: '#a58a62', tunicS: '#7d6646', band: P.chalk },
  d: { skin: '#c48b62', skinS: '#a26c46', hair: '#4a2c18', hairStyle: 'braids', tunic: '#896748', tunicS: '#664b33', band: P.ochreR },
};
export type CPose = {
  walk?: number; phase?: number; armF?: number; armB?: number; tilt?: number; turn?: number; blink?: number;
  mouth?: Mouth; open?: number; brow?: number; lookX?: number; lookY?: number; bob?: number; crouch?: number; holdF?: 'spear' | 'torch' | 'needle' | 'flint' | 'none';
};
export const Char: React.FC<{ look: Look; pose?: CPose; x: number; y: number; s?: number; flip?: boolean; age?: number; opacity?: number; ghost?: boolean }> =
  ({ look, pose = {}, x, y, s = 1, flip = false, age = 1, opacity = 1, ghost = false }) => {
    const { walk = 0, phase = 0, armF = .15, armB = -.15, tilt = 0, turn = .35, blink = 0, mouth = 'smile', open = 0, brow = 0, lookX = 0, lookY = 0, bob = 0, crouch = 0, holdF = 'none' } = pose;
    // age: 0 baby .. .55 kid .. 1 adult .. 1.6 elder
    const kid = clamp(1 - age, 0, 1);
    const body = lerp(1, .62, kid), headS = lerp(1, 1.12, kid);
    const sw = Math.sin(phase) * .55 * walk;
    const lift = walk ? Math.abs(Math.sin(phase)) * 6 * walk : 0;
    const legL = 80 * body, torsoH = 112 * body, hipY = -legL + crouch * 18 - lift + bob;
    const shY = hipY - torsoH, headY = shY - 58 * headS;
    const ol = { stroke: P.ink, strokeWidth: OL, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
    const fill = (c: string) => ghost ? 'none' : c;
    const st = ghost ? { stroke: P.chalk, strokeWidth: 5, strokeDasharray: '2 14', strokeLinecap: 'round' as const } : ol;
    const leg = (side: number, a: number) => (
      <g transform={`translate(${side * 17 * body} ${hipY}) rotate(${a * 57})`}>
        <rect x={-15 * body} y={0} width={30 * body} height={legL - 6} rx={14 * body} fill={fill(look.skin)} {...st} />
        <rect x={-18 * body} y={legL * .48} width={36 * body} height={legL * .5} rx={12} fill={fill(look.tunicS)} {...st} />
        <ellipse cx={8 * body} cy={legL - 6} rx={22 * body} ry={11 * body} fill={fill(look.tunicS)} {...st} />
      </g>);
    const hand = holdF;
    const arm = (side: number, a: number, front: boolean) => (
      <g transform={`translate(${side * 38 * body} ${shY + 14}) rotate(${a * 57})`}>
        <rect x={-13 * body} y={-6} width={26 * body} height={86 * body} rx={13 * body} fill={fill(look.skin)} {...st} />
        <rect x={-15 * body} y={-8} width={30 * body} height={38 * body} rx={13 * body} fill={fill(look.tunic)} {...st} />
        {front && hand === 'spear' && <g><line x1={0} y1={86 * body - 160} x2={0} y2={86 * body + 150} stroke={P.ink} strokeWidth={13} strokeLinecap="round" /><line x1={0} y1={86 * body - 160} x2={0} y2={86 * body + 150} stroke="#8a6a44" strokeWidth={6} strokeLinecap="round" /><path d={`M -12 ${86 * body - 158} L 0 ${86 * body - 200} L 12 ${86 * body - 158} Z`} fill="#6d7072" {...ol} strokeWidth={5} /></g>}
        {front && hand === 'torch' && <g><line x1={0} y1={86 * body + 10} x2={0} y2={86 * body - 70} stroke={P.ink} strokeWidth={14} strokeLinecap="round" /><line x1={0} y1={86 * body + 10} x2={0} y2={86 * body - 70} stroke="#6b4a2a" strokeWidth={7} /></g>}
        {front && hand === 'needle' && <line x1={-4} y1={86 * body} x2={30} y2={86 * body - 22} stroke={P.chalk} strokeWidth={4} strokeLinecap="round" />}
        {front && hand === 'flint' && <path d={`M -8 ${86 * body - 4} l 18 -6 l 6 14 l -16 8 z`} fill="#5c5f63" {...ol} strokeWidth={4} />}
        <circle cx={0} cy={86 * body - 4} r={15 * body} fill={fill(look.skin)} {...st} />
      </g>);
    // head features
    const ex = 22, fx = turn * 14 + lookX * 3;
    const browY = -26 - brow * 3;
    const mouthPath = (() => {
      const w = 18, oy = 26;
      switch (mouth) {
        case 'grin': return <path d={`M ${fx - w} ${oy - 4} Q ${fx} ${oy + 20} ${fx + w} ${oy - 4} Z`} fill="#5a1f17" {...ol} strokeWidth={5} />;
        case 'O': case 'blow': return <ellipse cx={fx} cy={oy + 2} rx={mouth === 'blow' ? 6 : 9} ry={mouth === 'blow' ? 6 : 12} fill="#5a1f17" {...ol} strokeWidth={5} />;
        case 'flat': return <path d={`M ${fx - 13} ${oy + 2} L ${fx + 13} ${oy + 2}`} fill="none" {...ol} strokeWidth={5} />;
        case 'sad': return <path d={`M ${fx - 14} ${oy + 8} Q ${fx} ${oy - 4} ${fx + 14} ${oy + 8}`} fill="none" {...ol} strokeWidth={5} />;
        case 'talk': return <ellipse cx={fx} cy={oy + 3} rx={12} ry={2 + open * 10} fill="#5a1f17" {...ol} strokeWidth={5} />;
        default: return <path d={`M ${fx - 16} ${oy} Q ${fx} ${oy + 14} ${fx + 16} ${oy}`} fill="none" {...ol} strokeWidth={5} />;
      }
    })();
    const eye = (sx: number) => {
      const cx = fx + sx * ex * (1 - turn * sx * .25), h = 13 * (1 - clamp(blink));
      return <g key={sx}>
        <ellipse cx={cx} cy={-8} rx={11} ry={Math.max(1.5, h)} fill={P.chalk} {...ol} strokeWidth={4.5} />
        {h > 4 && <circle cx={cx + lookX * 4 + turn * 3} cy={-6 + lookY * 3} r={6.5} fill={P.ink} />}
        {h > 4 && <circle cx={cx + lookX * 4 + turn * 3 + 2.5} cy={-9 + lookY * 3} r={2} fill="#fff" />}
        <path d={`M ${cx - 12} ${browY - sx * brow * 2} L ${cx + 12} ${browY + sx * brow * 2}`} stroke={P.ink} strokeWidth={7} strokeLinecap="round" />
      </g>;
    };
    const hair = (() => {
      const c = fill(look.hair);
      switch (look.hairStyle) {
        case 'mop': return <path d="M -62 -14 C -74 -60 -40 -88 -6 -84 C 20 -100 64 -80 66 -30 L 58 -12 L 50 -34 L 38 -16 L 30 -42 L 14 -22 L 4 -46 L -10 -24 L -22 -48 L -34 -22 L -46 -42 Z" fill={c} {...st} />;
        case 'braids': return <g><path d="M -64 -6 C -70 -70 -30 -88 2 -86 C 40 -88 70 -66 64 -6 C 56 -40 30 -60 0 -58 C -30 -60 -56 -40 -64 -6 Z" fill={c} {...st} />
          {[-1, 1].map((q) => <g key={q}>{[0, 1, 2, 3].map((k) => <ellipse key={k} cx={q * 62} cy={4 + k * 22} rx={10} ry={13} fill={c} {...st} strokeWidth={5} />)}<circle cx={q * 62} cy={92} r={6} fill={look.band} {...st} strokeWidth={4} /></g>)}</g>;
        case 'bun': return <g><circle cx={-6} cy={-86} r={24} fill={c} {...st} /><path d="M -64 -8 C -66 -66 -30 -84 0 -84 C 36 -84 66 -64 64 -8 C 50 -46 26 -58 0 -58 C -28 -58 -52 -44 -64 -8 Z" fill={c} {...st} /></g>;
        case 'band': return <g><path d="M -64 -10 C -66 -70 -30 -86 0 -86 C 34 -86 66 -66 64 -10 C 52 -40 26 -52 0 -52 C -26 -52 -54 -40 -64 -10 Z" fill={c} {...st} /><path d="M -64 -40 Q 0 -66 64 -40 L 62 -26 Q 0 -50 -62 -26 Z" fill={look.band} {...st} strokeWidth={5} /></g>;
        case 'grey': return <g><path d="M -64 -6 C -70 -58 -36 -80 0 -80 C 36 -80 70 -58 64 -6 C 58 -30 40 -46 22 -48 C 10 -40 -14 -40 -24 -48 C -44 -44 -58 -30 -64 -6 Z" fill={c} {...st} /></g>;
        default: return <path d="M -18 -60 Q 0 -78 18 -60" fill="none" stroke={look.hair} strokeWidth={8} strokeLinecap="round" />;
      }
    })();
    return (
      <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={opacity}>
        {!ghost && <ellipse cx={0} cy={4} rx={56 * body} ry={10 * body} fill="rgba(20,14,10,.28)" />}
        {arm(-1, armB, false)}
        {leg(-1, -sw)}{leg(1, sw)}
        {/* tunic */}
        <path d={`M ${-42 * body} ${shY} Q 0 ${shY - 12} ${42 * body} ${shY} L ${56 * body} ${hipY + 22} L ${44 * body} ${hipY + 12} L ${32 * body} ${hipY + 26} L ${18 * body} ${hipY + 14} L ${4 * body} ${hipY + 28} L ${-10 * body} ${hipY + 14} L ${-24 * body} ${hipY + 26} L ${-38 * body} ${hipY + 12} L ${-54 * body} ${hipY + 22} Z`} fill={fill(look.tunic)} {...st} />
        {!ghost && look.band && <path d={`M ${-44 * body} ${shY + torsoH * .32} L ${-30 * body} ${shY + torsoH * .24} L ${-16 * body} ${shY + torsoH * .32} L ${-2 * body} ${shY + torsoH * .24} L ${12 * body} ${shY + torsoH * .32} L ${26 * body} ${shY + torsoH * .24} L ${44 * body} ${shY + torsoH * .32}`} fill="none" stroke={look.band} strokeWidth={8 * body} strokeLinejoin="round" />}
        {!ghost && <path d={`M ${-48 * body} ${hipY - 16} Q 0 ${hipY - 6} ${48 * body} ${hipY - 16}`} fill="none" stroke={P.ink} strokeWidth={6} />}
        {!ghost && [-30, -14, 6, 22, 34].map((k, i) => <path key={i} d={`M ${k * body} ${shY + torsoH * (.5 + (i % 2) * .18)} l ${4 * body} ${10 * body}`} stroke={look.tunicS} strokeWidth={4} strokeLinecap="round" />)}
        {!ghost && <path d={`M ${42 * body} ${shY + 4} L ${54 * body} ${hipY + 20} L ${30 * body} ${hipY + 18} Q ${36 * body} ${shY + 40} ${26 * body} ${shY + 6} Z`} fill={look.tunicS} opacity={.55} />}
        {/* fur collar */}
        {!ghost && <path d={`M ${-46 * body} ${shY + 2} ${[-36, -24, -12, 0, 12, 24, 36].map((k, i) => `Q ${(k - 6) * body} ${shY + (i % 2 ? 22 : 16) * body} ${k * body} ${shY + 8 * body}`).join(' ')} Q ${44 * body} ${shY + 20 * body} ${48 * body} ${shY + 2} Q 0 ${shY - 16} ${-46 * body} ${shY + 2} Z`} fill="#e9dcc4" stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />}
        {!ghost && look.necklace && [-2, -1, 0, 1, 2].map((k) => <circle key={k} cx={k * 11 * body} cy={shY + 8 + Math.abs(k) * -2 + 6} r={5} fill={P.chalk} stroke={P.ink} strokeWidth={3} />)}
        {arm(1, armF, true)}
        {/* head */}
        <g transform={`translate(${turn * 4} ${headY}) rotate(${tilt}) scale(${headS})`}>
          {[-1, 1].map((q) => <ellipse key={q} cx={q * 62} cy={0} rx={10} ry={14} fill={fill(look.skinS)} {...st} />)}
          <path d="M -60 -10 C -62 -56 -30 -66 0 -66 C 32 -66 62 -54 60 -10 C 62 30 34 56 0 58 C -34 56 -62 30 -60 -10 Z" fill={fill(look.skin)} {...st} />
          {!ghost && <path d="M 30 40 C 44 30 54 14 56 -6" fill="none" stroke={look.skinS} strokeWidth={9} strokeLinecap="round" opacity={.7} />}
          {hair}
          {!ghost && look.beard && <path d={`M -48 14 C -40 70 40 70 48 14 C 40 40 20 44 ${fx} 44 C -20 44 -40 40 -48 14 Z`} fill={look.hair} {...ol} />}
          {!ghost && <>{[-1, 1].map(eye)}</>}
          {!ghost && <path d={`M ${fx + 2} 0 Q ${fx + 9} 12 ${fx - 2} 14`} fill="none" stroke={look.skinS} strokeWidth={5} strokeLinecap="round" />}
          {!ghost && look.stripe && <path d={`M ${fx - 40} 6 L ${fx + 40} 6`} stroke={P.ochreR} strokeWidth={9} strokeLinecap="round" opacity={.9} />}
          {!ghost && look.wrinkles && [-1, 1].map((q) => <path key={q} d={`M ${fx + q * 34} -2 l ${q * 8} -4 M ${fx + q * 34} 4 l ${q * 9} 0`} stroke={look.skinS} strokeWidth={3} strokeLinecap="round" />)}
          {!ghost && <circle cx={fx - 30} cy={16} r={8} fill="#d86a4f" opacity={.25} />}
          {!ghost && <circle cx={fx + 30} cy={16} r={8} fill="#d86a4f" opacity={.25} />}
          {!ghost && mouthPath}
        </g>
      </g>
    );
  };

/* ============ animals ============ */
export const Reindeer: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean; dark?: boolean }> = ({ x, y, s = 1, t, flip, dark }) => {
  const ph = t * 7; const c = dark ? '#3a2c22' : '#8a6040', c2 = dark ? '#2c2018' : '#e4d5bd';
  const leg = (lx: number, o: number) => <g transform={`translate(${lx} -70) rotate(${Math.sin(ph + o) * 20})`}><rect x={-6} y={0} width={12} height={74} rx={6} fill={c} stroke={P.ink} strokeWidth={5} /></g>;
  return <g transform={`translate(${x} ${y + Math.abs(Math.sin(ph)) * -4}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {leg(-48, 0)}{leg(42, Math.PI)}
    <path d="M -70 -86 C -76 -126 -30 -132 10 -128 C 50 -128 76 -118 72 -84 C 70 -66 40 -60 0 -62 C -40 -60 -66 -66 -70 -86 Z" fill={c} stroke={P.ink} strokeWidth={6} />
    <path d="M -60 -74 C -30 -66 30 -66 62 -74" fill="none" stroke={c2} strokeWidth={10} opacity={.7} />
    <path d="M 56 -112 L 82 -150 L 112 -146 L 110 -130 L 86 -128 L 72 -96 Z" fill={c} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 84 -150 C 70 -190 80 -214 96 -226 M 80 -178 L 60 -196 M 92 -200 L 112 -214 M 96 -150 C 110 -184 132 -194 146 -200 M 118 -184 L 124 -206" fill="none" stroke={P.ink} strokeWidth={7} strokeLinecap="round" />
    <path d="M 84 -150 C 70 -190 80 -214 96 -226 M 80 -178 L 60 -196 M 92 -200 L 112 -214 M 96 -150 C 110 -184 132 -194 146 -200 M 118 -184 L 124 -206" fill="none" stroke="#cdb48c" strokeWidth={3} strokeLinecap="round" />
    <circle cx={96} cy={-140} r={3.5} fill={P.ink} />
    {leg(-30, Math.PI)}{leg(56, 0)}
  </g>;
};
export const Mammoth: React.FC<{ x: number; y: number; s?: number; t: number; trumpet?: number; flip?: boolean }> = ({ x, y, s = 1, t, trumpet = 0, flip }) => {
  const ph = t * 2.5; const c = '#5a3a26', c2 = '#3e2718';
  const trunk = -trumpet * 70 + Math.sin(t * 1.8) * 8;
  const leg = (lx: number, o: number, w = 46) => <g transform={`translate(${lx} -120) rotate(${Math.sin(ph + o) * 7})`}><rect x={-w / 2} y={0} width={w} height={124} rx={18} fill={c2} stroke={P.ink} strokeWidth={7} /><path d={`M ${-w / 2 + 4} 100 l 8 -10 l 8 10 l 8 -10 l 8 10`} fill="none" stroke="#2a1a10" strokeWidth={4} /></g>;
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {leg(-110, 0)}{leg(70, Math.PI)}
    <path d="M -190 -140 C -210 -260 -90 -330 20 -320 C 110 -330 170 -290 176 -220 C 182 -160 150 -110 60 -104 L -120 -104 C -170 -104 -186 -120 -190 -140 Z" fill={c} stroke={P.ink} strokeWidth={8} />
    {Array.from({ length: 14 }).map((_, k) => { const xx = -170 + k * 24; return <path key={k} d={`M ${xx} -150 q 6 ${30 + (k % 3) * 8} ${-4} ${46 + (k % 2) * 10}`} fill="none" stroke={c2} strokeWidth={9} strokeLinecap="round" />; })}
    <path d="M 120 -300 C 170 -340 240 -310 236 -240 C 232 -200 210 -180 190 -170 L 140 -200 Z" fill={c} stroke={P.ink} strokeWidth={8} />
    <path d={`M 214 -200 C 240 -150 236 ${-90 + trunk} 214 ${-60 + trunk * .8} C 206 ${-50 + trunk * .8} 196 ${-58 + trunk * .8} 200 ${-70 + trunk * .8} C 214 ${-110 + trunk * .5} 206 -150 190 -180 Z`} fill={c} stroke={P.ink} strokeWidth={7} />
    <path d="M 190 -190 C 250 -170 290 -230 262 -280" fill="none" stroke={P.ink} strokeWidth={22} strokeLinecap="round" />
    <path d="M 190 -190 C 250 -170 290 -230 262 -280" fill="none" stroke="#efe6d2" strokeWidth={13} strokeLinecap="round" />
    <path d="M 150 -270 C 130 -250 132 -214 152 -200" fill={c2} stroke={P.ink} strokeWidth={6} />
    <circle cx={196} cy={-248} r={6} fill={P.ink} />
    {leg(-60, Math.PI, 50)}{leg(120, 0, 50)}
  </g>;
};

/* ============ fire ============ */
export const Fire: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const f = (k: number, w: number, h: number, c: string) => {
    const a = noise1(t * 4 + k, k) * 10, b = noise1(t * 5 + k * 3, k + 9) * 14;
    return <path key={k} d={`M ${-w} 0 C ${-w} ${-h * .4} ${-w * .3 + a} ${-h * .6} ${a * .5 + b * .3} ${-h - b} C ${w * .4 + a} ${-h * .6} ${w} ${-h * .4} ${w} 0 Z`} fill={c} />;
  };
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={220} ry={70} fill="url(#fireGlow)" />
    {[-1, 1].map((q) => <rect key={q} x={-70} y={-10} width={140} height={20} rx={10} fill="#4a3020" stroke={P.ink} strokeWidth={6} transform={`rotate(${q * 18})`} />)}
    {f(1, 46, 150, P.fire)}{f(2, 32, 112, P.fireY)}{f(3, 16, 70, '#fff3c4')}
    {[0, 1, 2, 3, 4].map((k) => { const p = ((t * .8 + k * .21) % 1); return <circle key={k} cx={noise1(t + k * 7, 3) * 40} cy={-60 - p * 220} r={4 * (1 - p)} fill={P.fireY} opacity={1 - p} />; })}
  </g>;
};

/* ============ landscapes ============ */
export const Sky: React.FC<{ id: string; top: string; bottom: string; w?: number; h?: number }> = ({ id, top, bottom, w = 1080, h = 1920 }) => (
  <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs><rect x={-1200} y={-800} width={w + 2400} height={h + 1600} fill={`url(#${id})`} /></>
);
// ridge silhouette with optional snow cap
export const Ridge: React.FC<{ y: number; amp: number; seed: number; color: string; snow?: string; off?: number; w?: number }> = ({ y, amp, seed, color, snow, off = 0, w = 1500 }) => {
  const pts: string[] = []; const sp: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = -200 + i / 60 * w; const yy = y - (noise1((x + off) * .006, seed) * .7 + noise1((x + off) * .02, seed + 3) * .3 + .5) * amp;
    pts.push(`${x},${yy}`); sp.push(`${x},${yy + amp * .12}`);
  }
  return <g><polygon points={`${pts.join(' ')} ${w},2400 -200,2400`} fill={color} />
    {snow && <polygon points={`${pts.join(' ')} ${sp.reverse().join(' ')}`} fill={snow} opacity={.9} />}</g>;
};
export const Snow: React.FC<{ t: number; n?: number; seed?: number; wind?: number; speed?: number; size?: number; opacity?: number }> = ({ t, n = 120, seed = 1, wind = 40, speed = 120, size = 5, opacity = .9 }) => {
  const r = rng(seed);
  return <g opacity={opacity}>{Array.from({ length: n }).map((_, i) => {
    const x0 = r() * 1300 - 100, y0 = r() * 2000, z = .4 + r() * .9;
    const y = (y0 + t * speed * z) % 2000 - 40, x = (x0 + t * wind * z + Math.sin(t * 2 + i) * 12 + 1300) % 1300 - 100;
    return <circle key={i} cx={x} cy={y} r={size * z} fill="#fff" />;
  })}</g>;
};
export const Tent: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -170 0 L -10 -300 L 170 0 Z" fill="#9a7650" stroke={P.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -120 -60 L 120 -60 M -80 -140 L 80 -140" stroke="#7a5a3a" strokeWidth={6} />
    <path d="M -10 -300 L -40 -350 M -10 -300 L 14 -356 M -10 -300 L 30 -340" stroke={P.ink} strokeWidth={9} strokeLinecap="round" />
    <path d="M -60 0 L -6 -130 L 50 0 Z" fill={glow ? `rgba(255,170,80,${.4 + glow * .6})` : '#2a1a10'} stroke={P.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -150 -30 l 30 -10 l 20 14 M 90 -40 l 30 -8 l 24 16" stroke={P.ochreR} strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);
// cave painting animal (ochre outline drawing)
export const CaveArt: React.FC<{ x: number; y: number; s?: number; kind: 'deer' | 'mammoth' | 'horse'; color?: string; draw?: number }> = ({ x, y, s = 1, kind, color = P.ochreR, draw = 1 }) => {
  const d = kind === 'deer' ? 'M -90 0 C -100 -50 -40 -60 10 -56 C 50 -60 80 -50 84 -16 L 100 -40 L 120 -42 L 116 -20 L 90 0 M -70 0 L -76 50 M -40 6 L -40 52 M 40 4 L 46 52 M 70 0 L 74 50 M 104 -42 C 100 -80 112 -96 124 -104 M 112 -70 L 96 -84'
    : kind === 'mammoth' ? 'M -110 10 C -130 -80 -40 -120 30 -110 C 90 -110 120 -70 110 -20 C 130 0 128 40 116 60 M -90 10 L -92 60 M -50 14 L -48 60 M 40 10 L 42 60 M 80 0 L 84 60 M 110 -30 C 150 -20 160 -60 140 -90'
    : 'M -90 0 C -96 -40 -40 -50 20 -46 C 60 -48 80 -40 90 -20 L 116 -50 L 132 -44 L 110 -6 M -80 0 L -88 46 M -50 4 L -50 48 M 40 2 L 44 48 M 70 -4 L 76 46 M 104 -44 L 90 -70 L 70 -54';
  return <path transform={`translate(${x} ${y}) scale(${s})`} d={d} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(draw)} opacity={.85} />;
};
export const HandPath = 'M -34 70 C -40 30 -44 10 -60 -20 C -66 -32 -52 -40 -44 -28 L -26 0 L -34 -70 C -36 -84 -20 -86 -18 -72 L -10 -16 L -8 -90 C -8 -104 8 -104 8 -90 L 10 -18 L 20 -82 C 22 -96 38 -94 36 -80 L 28 -14 L 42 -62 C 46 -74 60 -70 58 -58 L 44 10 C 40 40 34 56 30 70 Z';
// negative hand stencil: sprayed pigment dots around a hand shape
export const Stencil: React.FC<{ x: number; y: number; s?: number; rot?: number; seed?: number; amount?: number; color?: string; id: string }> = ({ x, y, s = 1, rot = 0, seed = 1, amount = 1, color = P.ochreR, id }) => {
  const r = rng(seed); const dots = Array.from({ length: 260 }).map(() => { const a = r() * 6.28, d = 40 + Math.pow(r(), .6) * 110; return [Math.cos(a) * d, Math.sin(a) * d * 1.2, 2 + r() * 9, r()]; });
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <defs><mask id={id}><rect x={-200} y={-200} width={400} height={400} fill="#fff" /><path d={HandPath} fill="#000" /></mask></defs>
    <g mask={`url(#${id})`}>
      <ellipse cx={0} cy={0} rx={95 * clamp(amount * 1.2)} ry={120 * clamp(amount * 1.2)} fill={color} opacity={.55} />
      {dots.map(([dx, dy, rr, q], i) => q < amount && <circle key={i} cx={dx} cy={dy} r={rr} fill={color} opacity={.5} />)}
    </g>
  </g>;
};
export const RockWall: React.FC<{ light: number[]; radius: number; tone?: string; cool?: boolean }> = ({ light, radius, tone = '#7a5a3e', cool }) => (
  <>
    <defs>
      <radialGradient id="torch" cx={light[0] / 1080} cy={light[1] / 1920} r={radius / 1080} gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor={cool ? '#e9eef2' : '#ffd29a'} stopOpacity=".95" /><stop offset=".45" stopColor={cool ? '#9aa6ad' : '#c77a3a'} stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <filter id="rock"><feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves={4} seed={4} /><feColorMatrix type="matrix" values="0 0 0 0 .48  0 0 0 0 .36  0 0 0 0 .25  0 0 0 -1.4 1.1" /></filter>
    </defs>
    <rect width={1080} height={1920} fill={tone} />
    <rect width={1080} height={1920} filter="url(#rock)" opacity={.9} />
    <rect width={1080} height={1920} fill="url(#torch)" style={{ mixBlendMode: 'overlay' } as any} />
  </>
);
