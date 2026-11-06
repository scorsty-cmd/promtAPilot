import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Frame, B } from './shots';
import { Sky, Houses, WoodenHorse, Torch, Embers } from './sets';
import { MChar, CAST } from './chars';
import { fontFace } from './Video';
export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 960, y: 540, z: 1 }} boil={0}>
      <Sky tone="fire" T={2} /><Houses T={2} dark fire={1} /><rect x={-240} y={880} width={2400} height={400} fill="#2a2018" />
      <circle cx={700} cy={500} r={700} fill="url(#fireGlow)" opacity={.8} />
      <WoodenHorse x={640} y={1020} s={1.0} T={2} hatch={.6} glow={1} />
      <Embers T={3} n={60} />
      <B><MChar look={CAST.youArm} x={1480} y={1500} s={2.6} flip pose={{ expr: 'scared', lookX: 1, lookY: -1, holdF: 'spear', armF: -.4, elbowF: .6 }} /></B>
    </Frame>
  </div>
  <div style={{ position: 'absolute', right: 30, top: 26, textAlign: 'right' }}>
    <div style={{ fontFamily: 'Gloock', fontSize: 108, lineHeight: .88, color: '#efe4cc', textShadow: '0 6px 0 #2a1a12, 0 10px 30px rgba(0,0,0,.7)' }}>DON'T<br /><span style={{ color: '#ffb347' }}>OPEN IT</span></div>
    <div style={{ display: 'inline-block', marginTop: 14, fontFamily: 'Stencil', fontWeight: 700, fontSize: 34, letterSpacing: 4, color: '#2a1a12', background: '#e0a83a', padding: '4px 16px' }}>TROY · 1180 BC</div>
  </div>
</AbsoluteFill>;
