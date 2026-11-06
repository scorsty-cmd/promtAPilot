import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Frame, B } from './shots';
import { Arena, Spark } from './sets';
import { MChar, CAST } from './chars';
import { fontFace } from './Video';
/* thumbnail: the arena, mid-strike, Spartacus behind you — big readable face + 3-word title */
export const Thumb: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <style>{fontFace}</style>
  <div style={{ width: 1920, height: 1080, transform: 'scale(.6667)', transformOrigin: '0 0' }}>
    <Frame cam={{ x: 960, y: 560, z: 1.05 }} boil={0}>
      <Arena T={3} cheer={1} />
      <rect x={-240} y={-200} width={2400} height={1500} fill="#3a0a04" opacity={.25} />
      <B><MChar look={CAST.opp} x={1330} y={1040} s={1.55} flip pose={{ holdF: 'gladius', armF: -2.9, elbowF: .7, propA: -40, shieldUp: .8, expr: 'fierce', crouch: .4 }} />
        <MChar look={CAST.spaGlad} x={330} y={1060} s={1.5} pose={{ holdF: 'sica', armF: -1.0, elbowF: .9, propA: 55, shieldUp: .6, expr: 'fierce' }} />
        <MChar look={CAST.youGlad} x={820} y={1090} s={1.75} pose={{ holdF: 'sica', armF: -1.62, elbowF: .05, propA: 92, shieldUp: .5, crouch: .9, lean: 14, expr: 'scared' }} /></B>
      <Spark x={1130} y={640} p={.2} s={1.3} />
    </Frame>
  </div>
  <div style={{ position: 'absolute', right: 26, top: 22, textAlign: 'right' }}>
    <div style={{ fontFamily: 'Cinzel', fontWeight: 900, fontSize: 96, lineHeight: .9, color: '#efe6d2', textShadow: '0 6px 0 #21160f, 0 10px 30px rgba(0,0,0,.8)' }}>SURVIVE<br /><span style={{ color: '#d9a441' }}>THE ARENA</span></div>
    <div style={{ display: 'inline-block', marginTop: 12, fontFamily: 'Mono', fontSize: 30, letterSpacing: 4, color: '#efe6d2', background: '#9b2a22', padding: '4px 16px' }}>WITH SPARTACUS · 73 BC</div>
  </div>
</AbsoluteFill>;
