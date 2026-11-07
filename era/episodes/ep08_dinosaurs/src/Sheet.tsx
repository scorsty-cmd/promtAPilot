import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil } from './art';
import { MChar, CAST } from './chars';
import { Theropod, Raptor, Trood, Pip, Sauropod, Ptero, Mosa, Duckbill, Crow } from './creatures';
import { Jungle, DofDefs, FernsFg } from './world';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame(); const T = f / 30;
  return <AbsoluteFill style={{ background: '#efe4cc' }}><svg width={1920} height={1080}>
    <defs><Boil id="b" frame={f} /><DofDefs /></defs>
    <Jungle T={T} />
    <g filter="url(#b)">
      <Sauropod x={1500} y={760} s={.3} ph={T} />
      <Theropod x={1250} y={930} s={1.0} ph={T * 4} walk={0} jaw={.6} ex="angry" fluff />
      <MChar look={CAST.you} x={200} y={930} s={1.2} pose={{ expr: 'surprised' }} />
      <MChar look={CAST.doc} x={350} y={930} s={1.2} pose={{ expr: 'happy' }} />
      <Trood x={520} y={930} s={.9} p={{ open: .5, ex: 'happy', arm: .6, point: true }} />
      <Pip x={680} y={930} s={.8} open={.5} />
      <Raptor x={850} y={930} s={1} />
      <Crow x={680} y={700} s={.8} open={.6} />
      <Ptero x={600} y={250} s={.5} ph={1} />
      <Duckbill x={1750} y={930} s={.6} />
      <Mosa x={400} y={1040} s={.4} open={.5} />
    </g>
    <FernsFg T={T} />
  </svg></AbsoluteFill>;
};
