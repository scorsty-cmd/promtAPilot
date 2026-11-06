import React from 'react';
import { P } from './art';
export type F = 'Brico' | 'Mono' | 'Serif' | 'Type' | 'Hand';
export const Txt: React.FC<{ x: number; y: number; s: number; c?: string; f?: F; a?: 'start' | 'middle' | 'end'; o?: number; w?: number; r?: number; children: React.ReactNode }> = ({ x, y, s, c = P.ink, f = 'Brico', a = 'middle', o = 1, w = 800, r = 0, children }) => (
  <text x={x} y={y} fontFamily={f} fontWeight={f === 'Brico' ? w : 400} fontSize={s} fill={c} textAnchor={a} opacity={o} letterSpacing={f === 'Mono' ? 4 : 0} transform={r ? `rotate(${r} ${x} ${y})` : undefined}>{children}</text>
);
