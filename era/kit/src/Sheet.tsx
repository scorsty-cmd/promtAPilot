import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Char, LOOKS, Reindeer, Mammoth, Fire, Sky, Ridge, Boil, P } from './art';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  return <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920">
    <defs><Boil id="b" frame={f} /><radialGradient id="fireGlow"><stop offset="0" stopColor="#ffb05a" stopOpacity=".7" /><stop offset="1" stopColor="#ff8a2b" stopOpacity="0" /></radialGradient></defs>
    <Sky id="s" top="#9fb8cc" bottom="#e9eef2" />
    <Ridge y={760} amp={220} seed={2} color="#b8c9d6" snow="#f3f7fa" />
    <rect y={900} width={1080} height={1020} fill={P.snow} />
    <g filter="url(#b)">
      <Char look={LOOKS.you} x={150} y={600} age={.55} pose={{ mouth: 'grin', brow: 1 }} />
      <Char look={LOOKS.you} x={380} y={600} pose={{ mouth: 'talk', open: .6, turn: .6, holdF: 'spear', armF: -.4 }} />
      <Char look={LOOKS.mom} x={620} y={600} pose={{ mouth: 'smile', turn: -.2 }} />
      <Char look={LOOKS.elder} x={880} y={600} age={1.4} pose={{ mouth: 'O', brow: -1, armF: -1.2 }} />
      <Char look={LOOKS.a} x={160} y={1150} pose={{ mouth: 'flat', walk: 1, phase: 1 }} />
      <Char look={LOOKS.b} x={400} y={1150} pose={{ mouth: 'sad', brow: 2 }} />
      <Char look={LOOKS.c} x={640} y={1150} age={.5} pose={{ mouth: 'O', blink: 0 }} />
      <Char look={LOOKS.d} x={880} y={1150} age={.6} pose={{ mouth: 'smile', holdF: 'torch' }} />
      <Reindeer x={250} y={1520} t={t} s={1.1} />
      <Mammoth x={620} y={1880} t={t} s={1.0} trumpet={.6} />
      <Fire x={930} y={1560} t={t} s={.6} />
    </g>
  </svg></AbsoluteFill>;
};
