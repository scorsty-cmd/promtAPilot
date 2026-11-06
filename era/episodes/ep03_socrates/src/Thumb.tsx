import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Frame, B } from './shots';
import { Agora } from './greek';
import { MChar, CAST } from './chars';
const fontFace = `
@font-face{font-family:Brico;src:url(${staticFile('fonts/Bricolage.ttf')}) format('truetype');font-weight:200 800;font-stretch:75% 100%;}
@font-face{font-family:Mono;src:url(${staticFile('fonts/DMMono-Medium.ttf')}) format('truetype');}`;
export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 960, y: 540, z: 1 }} boil={0}>
      <Agora T={3} crowd={0} tone="dusk" />
      <rect x={-200} y={-200} width={2400} height={1500} fill="rgba(20,10,5,.18)" />
      <B>
        <MChar look={CAST.soc} x={560} y={1480} s={3.0} pose={{ holdF: 'hemlock', armF: -1.2, elbowF: 1.6, mouth: 'smile', turn: .35, lookX: .8, brow: -1 }} />
        <MChar look={CAST.you} x={1180} y={1420} s={2.1} flip pose={{ mouth: 'O', brow: 2, lookX: 1 }} />
      </B>
    </Frame>
  </div>
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 80% at 30% 60%, rgba(0,0,0,0) 50%, rgba(0,0,0,.45) 100%)' }} />
  <div style={{ position: 'absolute', right: 40, top: 60, textAlign: 'right' }}>
    <div style={{ fontFamily: 'Brico', fontWeight: 800, fontStretch: '78%', fontSize: 120, lineHeight: .88, color: '#f4ead8', textShadow: '0 6px 0 #120d0a, 0 10px 30px rgba(0,0,0,.6)' }}>HIS<br /><span style={{ color: '#e07a3c' }}>STUDENT?</span></div>
    <div style={{ display: 'inline-block', marginTop: 20, fontFamily: 'Brico', fontWeight: 800, fontSize: 42, color: '#120d0a', background: '#e07a3c', padding: '6px 22px', transform: 'rotate(-2deg)' }}>ATHENS · 399 BC</div>
  </div>
</AbsoluteFill>;
