import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Frame, B } from './shots';
import { Sky } from './sets';
import { SeaW, SeaWalls, Claw, Warship, Splash } from './syra';
import { MChar, CAST } from './chars';
import { fontFace } from './Video';
export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 960, y: 540, z: 1 }} boil={0}>
      <Sky tone="dusk" T={2} /><SeaWalls T={2} x={200} y={760} s={.95} /><SeaW y={760} T={2} />
      <Claw x={420} y={360} s={1} ang={34} drop={330} />
      <Warship x={1230} y={760} s={.9} flip T={0} tilt={-30} lift={300} sail={false} />
      <Splash x={1230} y={780} p={.35} s={1.6} />
      <B><MChar look={CAST.arch} x={1550} y={1420} s={2.4} flip pose={{ expr: 'laugh', handF: 'point', armF: -1.5, elbowF: .1, turn: .35 }} /></B>
    </Frame>
  </div>
  <div style={{ position: 'absolute', left: 30, bottom: 26 }}>
    <div style={{ fontFamily: 'Marcellus', fontSize: 92, lineHeight: .92, color: '#f6efdc', textShadow: '0 6px 0 #3a2614, 0 10px 30px rgba(0,0,0,.7)' }}>HE FOUGHT ROME<br /><span style={{ color: '#ffcf6a' }}>WITH MATH</span></div>
  </div>
</AbsoluteFill>;
