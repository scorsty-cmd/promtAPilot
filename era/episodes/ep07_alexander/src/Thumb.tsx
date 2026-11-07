import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Frame, B } from './shots';
import { Feast } from './sets2';
import { MChar, CAST } from './chars';
import { fontFace } from './Video';
/* thumbnail: the feast — Alexander with the spear, you between him and Cleitus. Big faces, 3 words. */
export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 960, y: 560, z: 1.08 }} boil={0}>
      <Feast T={2} chaos={.6} />
      <rect x={-240} y={-200} width={2400} height={1500} fill="#3a0a1a" opacity={.25} />
      <B><MChar look={CAST.cle} x={1500} y={1040} s={1.5} flip pose={{ handF: 'point', armF: -2.2, elbowF: .4, expr: 'fierce' }} />
        <MChar look={CAST.alePer} x={420} y={1060} s={1.6} pose={{ holdF: 'spear', armF: -2.8, elbowF: .9, propA: -60, lean: -8, expr: 'fierce' }} />
        <MChar look={CAST.youFst} x={940} y={1090} s={1.75} pose={{ armF: -1.7, elbowF: .2, lean: -6, expr: 'scared' }} /></B>
    </Frame>
  </div>
  <div style={{ position: 'absolute', right: 26, top: 22, textAlign: 'right' }}>
    <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: 92, lineHeight: .9, color: '#f2e2c4', textShadow: '0 6px 0 #1c1410, 0 10px 30px rgba(0,0,0,.8)' }}>MY CLASSMATE<br /><span style={{ color: '#d9a441' }}>ALEXANDER</span></div>
    <div style={{ display: 'inline-block', marginTop: 12, fontFamily: 'Mono', fontSize: 30, letterSpacing: 4, color: '#f2e2c4', background: '#5a2a6a', padding: '4px 16px' }}>TAUGHT BY ARISTOTLE · 343 BC</div>
  </div>
</AbsoluteFill>;
