import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil, P } from './art';
import { MChar, CAST, Cradle } from './chars';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame(); const T = f / 30;
  const row1 = [['you', 1, { mouth: 'grin', holdF: 'cob', armF: -.6 }], ['mom', 1, { mouth: 'smile', armF: -.4, elbowF: 1.2 }], ['dad', 1, { holdF: 'spear', armF: -.3 }], ['grandma', 1.4, { mouth: 'talk', open: .6 }]] as const;
  const row2 = [['king', 1, { mouth: 'grin' }], ['priest', 1, { mouth: 'O', armF: -2.2, elbowF: .2 }], ['scribe', 1, { holdF: 'brush', armF: -.9, elbowF: 1.0 }], ['player', 1, { mouth: 'shout', armF: -1.2 }]] as const;
  const row3 = [['youKid', .55, { mouth: 'grin', holdF: 'pod', armF: -.8 }], ['trader', 1, { holdF: 'bundle', armF: -.2 }], ['bishop', 1, { mouth: 'flat', holdF: 'book', armF: -.7, elbowF: 1 }], ['todayW', 1, { mouth: 'smile', holdF: 'phone', armF: -.6, elbowF: 1.4 }]] as const;
  return <AbsoluteFill style={{ background: '#e7dcc4' }}><svg width={1080} height={1920}>
    <defs><Boil id="b" frame={f} /></defs>
    <g filter="url(#b)">
      {row1.map(([k, a, p], i) => <MChar key={k} look={CAST[k]} x={140 + i * 265} y={560} age={a} pose={p as any} />)}
      {row2.map(([k, a, p], i) => <MChar key={k} look={CAST[k]} x={140 + i * 265} y={1100} age={a} pose={p as any} />)}
      {row3.map(([k, a, p], i) => <MChar key={k} look={CAST[k]} x={140 + i * 265} y={1640} age={a} pose={p as any} />)}
      <Cradle x={960} y={300} s={.6} T={T} />
    </g></svg></AbsoluteFill>;
};
