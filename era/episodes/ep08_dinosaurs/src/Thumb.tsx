import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Frame, B } from './shots';
import { Jungle, FernsFg } from './world';
import { Theropod, Trood } from './creatures';
import { MChar, CAST } from './chars';
import { fontFace } from './Video';
export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 1060, y: 520, z: 1.12 }} boil={0}>
      <Jungle T={3} px={200} />
      <B><Theropod x={2200} y={1080} s={1.3} flip jaw={1} head={-6} ex="angry" /></B>
      <B><MChar look={CAST.you} x={560} y={1010} s={1.75} pose={{ expr: 'worried', mouth: 'O', armF: -2.4, armB: 2.3, elbowF: .3, elbowB: .3, lookX: 1 }} />
        <Trood x={860} y={1010} s={1.25} p={{ ex: 'happy', open: .6, arm: 1, point: true }} /></B>
      <FernsFg T={3} />
    </Frame>
  </div>
  <div style={{ position: 'absolute', left: 28, top: 22, transform: 'rotate(-3deg)' }}>
    <div style={{ display: 'inline-block', background: '#233a73', color: '#f4eee0', fontFamily: 'RubikMono', fontSize: 30, padding: '8px 20px', borderRadius: 30 }}>WHAT IF THE ASTEROID MISSED?</div>
    <div style={{ position: 'relative', fontFamily: 'Dela', fontSize: 92, lineHeight: .92, marginTop: 8 }}>
      <div style={{ position: 'absolute', left: 7, top: 6, color: '#ff4f9a' }}>DINOSAURS<br />NEVER DIED</div>
      <div style={{ position: 'relative', color: '#f4eee0', WebkitTextStroke: '3px #233a73' }}>DINOSAURS<br /><span style={{ color: '#ffd23f' }}>NEVER DIED</span></div>
    </div>
  </div>
</AbsoluteFill>;
