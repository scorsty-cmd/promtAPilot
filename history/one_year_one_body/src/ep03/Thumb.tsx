// Thumbnail system v5: hero fear close-up lit by a blood-red / green aurora, sparks, max 3 big words.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Head, NED, restHead} from '../rig';
import {useFonts, Defs, INK, Aurora, Sparks, Arc} from './kit';
import {NightSky, Roofline} from './sets';

const Words: React.FC<{lines: {t: string; c: string; s: number}[]; x: number; y: number; anchor?: 'start' | 'middle' | 'end'}> = ({lines, x, y, anchor = 'start'}) => (
  <g>
    {lines.map((l, i) => (
      <text key={i} x={x} y={y + lines.slice(0, i).reduce((a, b) => a + b.s * 0.95, 0)} textAnchor={anchor} fontFamily="FrauncesBlack" fontWeight={900} fontSize={l.s} fill={l.c} stroke={INK} strokeWidth={l.s * 0.1} paintOrder="stroke" letterSpacing={2}>{l.t}</text>
    ))}
  </g>
);
const fear = restHead({turn: 0.45, eyes: 'fear', eyePop: 0.7, browInner: 1, browHeight: 1.4, mouth: 'fear', open: 0.8, sweat: 0.35, lookX: 0.6, lookY: -0.8});

export const Thumb3: React.FC<{v: 'A' | 'B' | 'C'}> = ({v}) => {
  useFonts();
  const green = v === 'C' ? 0.9 : 0.15;
  return (
    <AbsoluteFill style={{backgroundColor: '#1A0810'}}>
      <svg viewBox="0 0 1280 720" width={1280} height={720}>
        <Defs gf={3} />
        <g transform="scale(0.6667)">
          <NightSky f={60} mode={v === 'C' ? 'aurora' : 'red'} x0={-100} x1={2100} y1={1080} green={green} amt={1.2} />
          <Roofline y={1100} x0={-100} x1={2100} />
        </g>
        {v === 'A' && (
          <g>
            <g transform="translate(330 470) scale(2.7) rotate(-6)" filter="url(#soft)"><Head h={fear} L={NED} frame={3} /></g>
            <Sparks x={640} y={640} t={6} n={34} s={2} seed="th" />
            <Words x={1250} y={150} anchor="end" lines={[{t: 'THE SKY', c: '#F3E7CF', s: 118}, {t: 'CAUGHT', c: '#FFD23F', s: 118}, {t: 'FIRE', c: '#FF4A3A', s: 150}]} />
          </g>
        )}
        {v === 'B' && (
          <g>
            <rect width={1280} height={720} fill="#FF2A2A" opacity={0.08} />
            <g transform="translate(320 480) scale(2.9) rotate(-4)" filter="url(#soft)"><Head h={fear} L={NED} frame={3} /></g>
            <Words x={1255} y={170} anchor="end" lines={[{t: 'SKY ON', c: '#FFD23F', s: 140}, {t: 'FIRE', c: '#FF4A3A', s: 190}]} />
            <Words x={1240} y={690} anchor="end" lines={[{t: '1859', c: '#F3E7CF', s: 74}]} />
          </g>
        )}
        {v === 'C' && (
          <g>
            <g transform="translate(340 470) scale(2.7) rotate(5)" filter="url(#soft)"><Head h={restHead({turn: 0.5, eyes: 'dizzy', browHeight: 1.4, mouth: 'zigzag', lookY: -0.5})} L={NED} frame={5} /></g>
            <g transform="translate(350 120)">{[-120, -60, 0, 60, 120].map((dx, i) => <path key={i} d={`M${dx} 60 L${dx * 1.4} -60`} stroke={INK} strokeWidth={22} strokeLinecap="round" />)}</g>
            <Arc x1={560} y1={300} x2={760} y2={620} f={4} w={9} />
            <Words x={1250} y={160} anchor="end" lines={[{t: 'POWERED', c: '#7CFFC0', s: 120}, {t: 'BY THE', c: '#F3E7CF', s: 110}, {t: 'SKY', c: '#FFD23F', s: 160}]} />
          </g>
        )}
        <rect width={1280} height={720} fill="url(#vig)" opacity={0.5} />
      </svg>
    </AbsoluteFill>
  );
};
void Aurora;
