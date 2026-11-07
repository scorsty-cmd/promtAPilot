import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil } from './art';
import { MChar, CAST, citizen, legionary } from './chars';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const r1 = [['you', { expr: 'excited', holdF: 'tablet', armF: -1.2, elbowF: 1.4 }], ['youKid', { expr: 'surprised', holdF: 'bread', armF: -1.2, elbowF: 1.4 }], ['arch', { expr: 'thinking', holdF: 'compass', armF: -1.6, elbowF: 1.2 }], ['archYoung', { expr: 'excited', handF: 'point', armF: -1.6, elbowF: .1 }], ['archBath', { expr: 'laugh', holdF: 'towel', armF: -2.4, elbowF: .3, walk: 1, run: 1, phase: 1 }], ['kleo', { expr: 'laugh' }], ['mom', { expr: 'happy' }], ['hiero', { expr: 'angry', holdF: 'crown', armF: -1.4, elbowF: 1.2 }]] as const;
  const r2 = [['gold', { expr: 'scared' }], ['capt', { expr: 'surprised' }], ['marc', { expr: 'sad' }], ['sold', { holdF: 'gladius', armF: -1.4, elbowF: .6, expr: 'angry' }], ['cic', { holdF: 'scroll', armF: -1.2, elbowF: 1.4 }]] as const;
  return <AbsoluteFill style={{ background: '#efe4cc' }}><svg width={1920} height={1080}>
    <defs><Boil id="b" frame={f} /><radialGradient id="heroGlow"><stop offset="0" stopColor="#fff2a0" stopOpacity=".6" /><stop offset="1" stopColor="#fff2a0" stopOpacity="0" /></radialGradient></defs>
    <g filter="url(#b)">
      {r1.map(([k, p], i) => <MChar key={k} look={CAST[k]} x={110 + i * 235} y={470} s={.85} age={k.endsWith('Kid') ? .65 : 1} pose={p as any} />)}
      {r2.map(([k, p], i) => <MChar key={k} look={CAST[k]} x={110 + i * 235} y={1000} s={.85} pose={p as any} />)}
      {Array.from({ length: 10 }).map((_, i) => { const c = citizen(i); return <MChar key={'c' + i} look={c.look} age={c.age} x={1300 + (i % 5) * 120} y={i < 5 ? 760 : 1040} s={.5} />; })}
      {[0, 1].map((i) => <MChar key={'l' + i} look={legionary(i)} x={1250 + i * 110} y={560} s={.45} pose={{ holdF: 'spear', armF: -.4, elbowF: .6 }} />)}
    </g></svg></AbsoluteFill>;
};
