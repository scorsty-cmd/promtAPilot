import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil } from './art';
import { MChar, CAST, legionary, rebel, gladiator, Wagon, Horse } from './chars';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const r1 = ['you', 'youGlad', 'youReb', 'spa', 'spaGlad', 'spaReb', 'cri', 'criGlad', 'oen'];
  const r2 = ['bat', 'doc', 'her', 'ref', 'opp', 'wife', 'gla', 'cra', 'pir'];
  return <AbsoluteFill style={{ background: '#efe6d2' }}><svg width={1920} height={1080}>
    <defs><Boil id="b" frame={f} /></defs>
    <g filter="url(#b)">
      {r1.map((k, i) => <MChar key={k} look={CAST[k]} x={110 + i * 210} y={470} s={.8} pose={{ holdF: k.includes('Glad') ? 'sica' : 'none', propA: 50, armF: -1, elbowF: .9, expr: 'happy' }} />)}
      {r2.map((k, i) => <MChar key={k} look={CAST[k]} x={110 + i * 210} y={830} s={.8} pose={{ holdF: k === 'opp' ? 'gladius' : k === 'doc' ? 'whip' : k === 'ref' ? 'stick' : 'none', propA: 40, expr: 'neutral' }} />)}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <MChar key={'r' + i} look={rebel(i)} x={80 + i * 80} y={1060} s={.4} age={i === 6 ? .3 : 1} />)}
      {[0, 1, 2].map((i) => <MChar key={'l' + i} look={legionary(i)} x={700 + i * 80} y={1060} s={.4} pose={{ holdF: 'gladius', propA: 40 }} />)}
      {[0, 1, 2].map((i) => <MChar key={'g' + i} look={gladiator(i)} x={1000 + i * 90} y={1060} s={.4} />)}
      <Wagon x={1500} y={1060} s={.4} /><Horse x={1800} y={1060} s={.35} ph={f / 3} />
    </g></svg></AbsoluteFill>;
};
