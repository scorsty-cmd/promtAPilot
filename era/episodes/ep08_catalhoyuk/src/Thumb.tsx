import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Frame, B } from './shots';
import { Interior } from './sets3';
import { MChar, CAST } from './chars';
import { fontFace } from './Video';
/* thumbnail: you sleeping on the platform — and the cutaway shows grandmother buried right under you. 3 words. */
export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 1330, y: 850, z: 1.3 }} boil={0}>
      <Interior T={2} light={.8} fire={.8} burial={1} hands={[[1600, 520, 10], [1480, 470, -8]]} />
      <B><MChar look={CAST.you} x={1600} y={860} s={1.15} age={.82} pose={{ sit: 1, lean: -14, armF: -1.6, elbowF: .3, handF: 'open', expr: 'scared' }} /></B>
      <g transform="translate(1440 960)"><path d="M 0 -40 L 0 60" stroke="#ffcf3a" strokeWidth={18} strokeLinecap="round" /><path d="M -40 30 L 0 80 L 40 30" stroke="#ffcf3a" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
    </Frame>
  </div>
  <div style={{ position: 'absolute', left: 30, top: 26 }}>
    <div style={{ fontFamily: 'Dirt', fontSize: 96, lineHeight: .92, color: '#f1ece0', textShadow: '0 6px 0 #2a2420, 0 10px 30px rgba(0,0,0,.8)' }}>GRANDMA IS<br /><span style={{ color: '#ffcf3a' }}>UNDER MY BED</span></div>
    <div style={{ display: 'inline-block', marginTop: 12, fontFamily: 'Bowlby', fontSize: 30, letterSpacing: 2, color: '#f1ece0', background: '#b5432a', padding: '4px 16px' }}>ÇATALHÖYÜK · 7000 BC</div>
  </div>
</AbsoluteFill>;
