import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Frame, B, Ch, JungleBG } from './shots';
import { Pyramid, CacaoPile } from './sets';

const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}`;

export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 960, y: 540, z: 1 }} boil={0}>
      <JungleBG T={3} tone="dawn" mist={.4} />
      <Pyramid x={1480} y={1000} s={1.35} />
      <rect x={-200} y={-200} width={2400} height={1500} fill="rgba(20,10,5,.12)" />
      <B><CacaoPile x={1050} y={1100} s={2.2} n={50} />
        <Ch k="you" x={560} y={1500} s={3.1} T={3} p={{ holdF: 'bean', armF: -1.6, elbowF: 1.4, mouth: 'O', open: 1, brow: 1, turn: .35, lookX: .6 }} /></B>
    </Frame>
  </div>
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 80% at 25% 60%, rgba(0,0,0,0) 50%, rgba(0,0,0,.45) 100%)' }} />
  <div style={{ position: 'absolute', right: 46, top: 70, textAlign: 'right' }}>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 150, lineHeight: .86, color: '#f4ead8', textShadow: '0 6px 0 #120d0a, 0 10px 30px rgba(0,0,0,.6)' }}>BORN<br /><span style={{ color: '#ffb347' }}>MAYA?</span></div>
    <div style={{ display: 'inline-block', marginTop: 22, fontFamily: 'Brico', fontWeight: 800, fontSize: 44, color: '#120d0a', background: '#ffb347', padding: '6px 22px', transform: 'rotate(-2deg)' }}>AD 750</div>
  </div>
</AbsoluteFill>;
