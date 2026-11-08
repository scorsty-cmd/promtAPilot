import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil } from './art';
import { MChar, CAST, villager, Aurochs, Sheep, Dog } from './chars';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const r1 = ['you', 'youH', 'sis', 'mom', 'fat', 'fatH', 'hun', 'nei', 'tra', 'eld'];
  return <AbsoluteFill style={{ background: '#efe6d2' }}><svg width={1920} height={1080}>
    <defs><Boil id="b" frame={f} /></defs>
    <g filter="url(#b)">
      {r1.map((k, i) => <MChar key={k} look={CAST[k]} x={100 + i * 190} y={460} s={.72} age={k === 'sis' ? .7 : k.startsWith('you') ? .82 : 1} pose={{ holdF: ['spear', 'bow', 'basket', 'brush', 'spear', 'horn', 'spear', 'none', 'mirror', 'none'][i] as any, propA: 40, armF: -1, elbowF: .9, expr: 'happy' }} />)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <MChar key={'v' + i} look={villager(i)} x={80 + i * 110} y={800} s={.5} pose={{ expr: 'neutral' }} />)}
      <Aurochs x={1200} y={1040} s={.5} ph={f / 4} walk={1} /><Sheep x={1560} y={1040} s={.6} ph={f / 3} walk={1} /><Sheep x={1720} y={1040} s={.6} goat /><Dog x={1500} y={800} s={.6} ph={f / 3} walk={1} />
    </g></svg></AbsoluteFill>;
};
