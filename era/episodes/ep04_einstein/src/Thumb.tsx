import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Frame, B } from './shots';
import { Study, Chalk } from './sets';
import { MChar, CAST } from './chars';
import { fontFace } from './Video';
export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 960, y: 540, z: 1 }} boil={0}>
      <Study T={3} night={false} eq={['E = mc²', 'Δt′ = γΔt']} />
      <B>
        <MChar look={CAST.einOld} x={560} y={1500} s={3.1} pose={{ holdF: 'chalk', armF: -2.4, elbowF: .7, expr: 'laugh', turn: .35 }} />
        <MChar look={CAST.you} x={1250} y={1430} s={2.2} flip pose={{ expr: 'surprised', lookX: 1 }} />
      </B>
    </Frame>
  </div>
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 80% at 30% 60%, rgba(0,0,0,0) 50%, rgba(20,10,0,.5) 100%)' }} />
  <div style={{ position: 'absolute', right: 34, top: 34, textAlign: 'right' }}>
    <div style={{ fontFamily: 'Serif', fontSize: 104, lineHeight: .9, color: '#f6efdc', textShadow: '0 6px 0 #1d1612, 0 10px 30px rgba(0,0,0,.6)' }}>50 YEARS<br /><span style={{ color: '#ffcf6a' }}>WITH HIM</span></div>
    <div style={{ display: 'inline-block', marginTop: 18, fontFamily: 'Type', fontSize: 36, color: '#c8443a', border: '4px solid #c8443a', background: 'rgba(246,239,220,.92)', padding: '4px 18px', transform: 'rotate(-3deg)' }}>BERN · 1902</div>
  </div>
</AbsoluteFill>;
