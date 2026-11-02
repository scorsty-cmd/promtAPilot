// Thumbnail system (kit v3): hero close-up at peak emotion + max 3 big words + one strong colour contrast.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Head, TOM, BARBER, Pliers, restHead} from '../rig';
import {useFonts, Defs, INK} from './kit';

const Words: React.FC<{lines: {t: string; c: string; s: number}[]; x: number; y: number; anchor?: 'start' | 'middle' | 'end'}> = ({lines, x, y, anchor = 'start'}) => (
  <g>
    {lines.map((l, i) => (
      <text key={i} x={x} y={y + lines.slice(0, i).reduce((a, b) => a + b.s * 0.95, 0)} textAnchor={anchor} fontFamily="FrauncesBlack" fontWeight={900} fontSize={l.s} fill={l.c} stroke={INK} strokeWidth={l.s * 0.09} paintOrder="stroke" letterSpacing={2}>{l.t}</text>
    ))}
  </g>
);

export const Thumb: React.FC<{v: 'A' | 'B' | 'C'}> = ({v}) => {
  useFonts();
  const bg = v === 'A' ? '#12333A' : v === 'B' ? '#163A44' : '#2A1A3A';
  return (
    <AbsoluteFill style={{backgroundColor: bg}}>
      <svg viewBox="0 0 1280 720" width={1280} height={720}>
        <Defs gf={3} />
        <radialGradient id="tg" cx="0.3" cy="0.5" r="0.7"><stop offset="0" stopColor="#FFD58A" stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <rect width={1280} height={720} fill={bg} />
        <rect width={1280} height={720} fill="url(#tg)" />
        {v === 'A' && (
          <g>
            <g transform="translate(330 440) scale(2.75) rotate(-6)" filter="url(#soft)"><Head h={restHead({turn: 0.55, eyes: 'fear', eyePop: 0.5, browInner: 1, browHeight: 1.3, mouth: 'fear', open: 0.7, swell: 1.5, sweat: 0.35, lookX: 0.9})} L={TOM} frame={3} /></g>
            <g transform="translate(1060 250) rotate(200) scale(2.3)"><Pliers glint={1.3} /></g>
            <Words x={1250} y={500} anchor="end" lines={[{t: 'NO', c: '#FFD23F', s: 112}, {t: 'DENTISTS', c: '#FFD23F', s: 112}]} />
            <Words x={1240} y={90} anchor="end" lines={[{t: '1665', c: '#F3E7CF', s: 80}]} />
          </g>
        )}
        {v === 'B' && (
          <g>
            <g transform="translate(340 440) scale(2.85) rotate(-4)" filter="url(#soft)"><Head h={restHead({turn: 0.6, eyes: 'fear', eyePop: 0.6, browInner: 1, browHeight: 1.3, mouth: 'fear', open: 0.75, swell: 1.6, sweat: 0.3, lookX: 1})} L={TOM} frame={3} /></g>
            <g transform="translate(1150 650) scale(-2.0 2.0)" opacity={0.95}><Head h={restHead({turn: 0.7, eyes: 'sly', mouth: 'grin', open: 0.4})} L={BARBER} frame={3} /></g>
            <g transform="translate(880 470) rotate(185) scale(2.2)"><Pliers glint={1.4} /></g>
            <Words x={1250} y={150} anchor="end" lines={[{t: 'TOOTHACHE', c: '#FFD23F', s: 112}, {t: '1665', c: '#F3E7CF', s: 112}]} />
          </g>
        )}
        {v === 'C' && (
          <g>
            {Array.from({length: 9}, (_, i) => <circle key={i} cx={620 + i * 40} cy={560 - i * 50} r={40 + i * 14} fill="#D8D0C0" opacity={0.25} />)}
            <g transform="translate(340 440) scale(2.75) rotate(8)" filter="url(#soft)"><Head h={restHead({turn: 0.6, eyes: 'dizzy', mouth: 'O', open: 0.6, swell: 1.4, browInner: 0.6, browHeight: 0.6})} L={TOM} frame={7} /></g>
            <Words x={1240} y={300} anchor="end" lines={[{t: 'THE', c: '#F3E7CF', s: 110}, {t: 'CURE', c: '#7CF2A0', s: 150}, {t: 'WAS WORSE', c: '#7CF2A0', s: 90}]} />
          </g>
        )}
        <rect width={1280} height={720} fill="url(#vig)" opacity={0.6} />
      </svg>
    </AbsoluteFill>
  );
};
