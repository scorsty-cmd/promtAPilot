import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil } from './art';
import { MChar, CAST, macedon, persian, indian, Horse, Elephant, Chariot } from './chars';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const r1 = ['you', 'youSt', 'youCav', 'ale', 'aleWar', 'aleCav', 'alePer', 'hep', 'hepWar', 'ari'];
  const r2 = ['phi', 'cle', 'cleWar', 'dio', 'par', 'dar', 'sis', 'cal', 'por', 'coe'];
  return <AbsoluteFill style={{ background: '#efe6d2' }}><svg width={1920} height={1080}>
    <defs><Boil id="b" frame={f} /></defs>
    <g filter="url(#b)">
      {r1.map((k, i) => <MChar key={k} look={CAST[k]} x={100 + i * 190} y={430} s={.72} age={k === 'youSt' ? .8 : 1} pose={{ holdF: k === 'aleWar' ? 'kopis' : k === 'youCav' ? 'sarissa' : 'none', propA: 40, armF: -1, elbowF: .9, expr: 'happy' }} />)}
      {r2.map((k, i) => <MChar key={k} look={CAST[k]} x={100 + i * 190} y={790} s={.72} pose={{ expr: 'neutral' }} />)}
      {[0, 1, 2, 3].map((i) => <MChar key={'m' + i} look={macedon(i)} x={60 + i * 70} y={1060} s={.36} pose={{ holdF: 'sarissa', propA: 60 }} />)}
      {[0, 1, 2].map((i) => <MChar key={'p' + i} look={persian(i)} x={400 + i * 70} y={1060} s={.36} pose={{ holdF: 'axe', propA: 30 }} />)}
      {[0, 1].map((i) => <MChar key={'n' + i} look={indian(i)} x={640 + i * 70} y={1060} s={.36} />)}
      <Horse x={900} y={1060} s={.32} ph={f / 3} c="#1a1410" mane="#0a0806" star /><Elephant x={1240} y={1060} s={.4} ph={f / 4} /><Chariot x={1560} y={1060} s={.38} scythe king ph={f / 4} />
    </g></svg></AbsoluteFill>;
};
