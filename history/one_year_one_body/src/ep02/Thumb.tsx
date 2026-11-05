// Thumbnail system v4: hero fear close-up + ghost ship + max 3 words, yellow (hat) vs teal-black sea contrast.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Head, DEVEAU, restHead} from '../rig';
import {useFonts, Defs, INK} from './kit';
import {Sky, Sea, Ship} from './sets';

const Words: React.FC<{lines: {t: string; c: string; s: number}[]; x: number; y: number; anchor?: 'start' | 'middle' | 'end'}> = ({lines, x, y, anchor = 'start'}) => (
  <g>
    {lines.map((l, i) => (
      <text key={i} x={x} y={y + lines.slice(0, i).reduce((a, b) => a + b.s * 0.95, 0)} textAnchor={anchor} fontFamily="FrauncesBlack" fontWeight={900} fontSize={l.s} fill={l.c} stroke={INK} strokeWidth={l.s * 0.1} paintOrder="stroke" letterSpacing={2}>{l.t}</text>
    ))}
  </g>
);
const DV = {...DEVEAU, noStrap: true};
const fear = restHead({turn: 0.55, eyes: 'fear', eyePop: 0.6, browInner: 1, browHeight: 1.3, mouth: 'fear', open: 0.75, sweat: 0.35, lookX: 1, lookY: -0.1});

export const Thumb2: React.FC<{v: 'A' | 'B' | 'C'}> = ({v}) => {
  useFonts();
  return (
    <AbsoluteFill style={{backgroundColor: '#0E1E26'}}>
      <svg viewBox="0 0 1280 720" width={1280} height={720}>
        <Defs gf={3} />
        <radialGradient id="tg2" cx="0.75" cy="0.45" r="0.6"><stop offset="0" stopColor="#BFE0E8" stopOpacity="0.45" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <g transform="scale(0.6667)">
          <Sky f={40} mode="storm" horizon={700} />
          <Sea f={40} mode="storm" horizon={700} rough={1.5} />
        </g>
        <rect width={1280} height={720} fill="url(#tg2)" />
        {v === 'A' && (
          <g>
            <g transform="translate(980 500)"><Ship f={20} x={0} y={0} s={0.42} torn dark rot={-6} /></g>
            <g transform="translate(330 460) scale(2.6) rotate(-6)" filter="url(#soft)"><Head h={fear} L={DV} frame={3} /></g>
            <Words x={1250} y={110} anchor="end" lines={[{t: 'NO ONE', c: '#FFD23F', s: 120}, {t: 'ABOARD', c: '#F3E7CF', s: 120}]} />
          </g>
        )}
        {v === 'B' && (
          <g>
            <g transform="translate(860 560)"><Ship f={20} x={0} y={0} s={0.55} torn dark rot={5} /></g>
            <circle cx={860} cy={360} r={260} fill="#BFE0E8" opacity={0.12} />
            <g transform="translate(320 470) scale(2.85) rotate(-4)" filter="url(#soft)"><Head h={fear} L={DV} frame={3} /></g>
            <Words x={1260} y={150} anchor="end" lines={[{t: 'EVERYONE', c: '#FFD23F', s: 112}, {t: 'GONE', c: '#FF5A3A', s: 150}]} />
            <Words x={1250} y={690} anchor="end" lines={[{t: '1872', c: '#F3E7CF', s: 70}]} />
          </g>
        )}
        {v === 'C' && (
          <g>
            <g transform="translate(940 520)"><Ship f={20} x={0} y={0} s={0.45} torn dark /></g>
            <g transform="translate(360 470) scale(2.7) rotate(5)" filter="url(#soft)"><Head h={restHead({turn: 0.6, eyes: 'fear', eyePop: 0.4, browInner: 1, browHeight: 0.9, mouth: 'O', open: 0.7, lookX: 1})} L={DV} frame={7} /></g>
            <Words x={1250} y={120} anchor="end" lines={[{t: 'GHOST', c: '#7CF2E0', s: 130}, {t: 'SHIP', c: '#FFD23F', s: 150}]} />
          </g>
        )}
        <rect width={1280} height={720} fill="url(#vig)" opacity={0.55} />
      </svg>
    </AbsoluteFill>
  );
};
