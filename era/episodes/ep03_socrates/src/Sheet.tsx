import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil } from './art';
import { MChar, CAST } from './chars';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const r1 = [['you', 1, { mouth: 'grin', holdF: 'amphora', armF: -.3, elbowF: .9 }], ['soc', 1, { mouth: 'talk', open: .6, armF: -1.3, elbowF: 1.2 }], ['dad', 1, { mouth: 'flat' }], ['mom', 1, { mouth: 'smile', armF: -.4, elbowF: 1.2 }], ['sister', .6, {}], ['chaer', 1, { mouth: 'O', armF: -2, elbowF: .3 }], ['laches', 1, { holdF: 'spear', armF: -.3 }], ['alc', 1, { mouth: 'grin', holdF: 'kylix', armF: -1.4, elbowF: .9 }]] as const;
  const r2 = [['xan', 1, { mouth: 'shout', armF: -1.6 }], ['plato', 1, { mouth: 'smile' }], ['mel', 1, { mouth: 'flat', armF: -1.4, elbowF: .2 }], ['crito', 1, { mouth: 'sad' }], ['jailer', 1, { holdF: 'hemlock', armF: -.9, elbowF: 1.2 }], ['herald', 1, { holdF: 'staff', armF: -.2 }], ['pythia', 1, {}], ['youKid', .6, { mouth: 'grin' }]] as const;
  return <AbsoluteFill style={{ background: '#efe6d2' }}><svg width={1920} height={1080}>
    <defs><Boil id="b" frame={f} /></defs>
    <g filter="url(#b)">
      {r1.map(([k, a, p], i) => <MChar key={k} look={CAST[k]} x={130 + i * 237} y={500} s={.95} age={a} pose={p as any} />)}
      {r2.map(([k, a, p], i) => <MChar key={k} look={CAST[k]} x={130 + i * 237} y={1030} s={.95} age={a} pose={p as any} />)}
    </g></svg></AbsoluteFill>;
};
