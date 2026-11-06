import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil } from './art';
import { MChar, CAST, Chair, extra } from './chars';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const r1 = [['you', {}], ['ein', { expr: 'excited', armF: -1.4, elbowF: 1.0 }], ['einMid', { expr: 'thinking', holdF: 'pipe', armF: -.9, elbowF: 2.2 }], ['einOld', { expr: 'laugh', holdF: 'violin', armF: -1.2, elbowF: 1.6 }], ['sol', { expr: 'happy' }], ['hab', { expr: 'surprised' }], ['mil', { expr: 'worried' }], ['bes', { expr: 'angry' }], ['gro', { expr: 'sad' }]] as const;
  const r2 = [['edd', { holdF: 'telegram', armF: -1, elbowF: 1.2 }], ['bohr', { expr: 'happy' }], ['szi', { expr: 'worried' }], ['doc', {}], ['nurse', {}], ['youOld', { expr: 'sad' }], ['einBed', {}]] as const;
  return <AbsoluteFill style={{ background: '#efe6d2' }}><svg width={1920} height={1080}>
    <defs><Boil id="b" frame={f} /></defs>
    <g filter="url(#b)">
      {r1.map(([k, p], i) => <MChar key={k} look={CAST[k]} x={110 + i * 212} y={480} s={.9} pose={p as any} />)}
      {r2.map(([k, p], i) => <MChar key={k} look={CAST[k]} x={110 + i * 212} y={1000} s={.9} pose={p as any} />)}
      <Chair x={1700} y={1000} s={1.2} /><MChar look={CAST.ein} x={1700} y={1000} s={1.2} pose={{ sit: 1, expr: 'happy', holdF: 'teacup', armF: -1.1, elbowF: 1.6 }} />
      <MChar look={extra(3)} x={1700} y={480} s={.7} /><MChar look={extra(5)} x={1820} y={480} s={.7} />
    </g></svg></AbsoluteFill>;
};
