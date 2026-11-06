import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './art';
import { MChar, CAST } from './chars';
import { CityStreet } from './sets';

export const Thumb: React.FC = () => {
  return (
    <AbsoluteFill style={{ width: 1280, height: 720, background: '#090d14', overflow: 'hidden' }}>
      {/* Background Street with Sirens */}
      <CityStreet T={12} px={-120} siren={true} />

      {/* Dark Vignette Overlay */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 35%, rgba(9,13,20,0.85) 100%)',
        }}
      />

      {/* Characters in Heroic/Survival Pose */}
      {/* Marcus (Left) */}
      <g transform="translate(280 620) scale(0.95)">
        <MChar look={CAST.marcus} x={0} y={0} s={1.25} pose={{ holdF: 'radio', expr: 'tense' }} />
      </g>

      {/* Hero "YOU" (Center) */}
      <g transform="translate(640 600) scale(1.15)">
        <MChar look={CAST.you} x={0} y={0} s={1.3} pose={{ holdF: 'flashlight', expr: 'surprised' }} />
      </g>

      {/* Dr. Sarah Chen (Right) */}
      <g transform="translate(1000 620) scale(0.95) scale(-1 1)">
        <MChar look={CAST.sarah} x={0} y={0} s={1.25} pose={{ holdF: 'map', expr: 'tense' }} />
      </g>

      {/* Big High-CTR Typography Header */}
      <div
        style={{
          position: 'absolute',
          top: 35,
          left: 0,
          right: 0,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'DMMono-Medium, monospace',
            fontSize: 26,
            fontWeight: 'bold',
            color: '#e53e3e',
            letterSpacing: 6,
            textShadow: '0 4px 12px rgba(0,0,0,0.9)',
            background: 'rgba(26,32,44,0.9)',
            padding: '6px 24px',
            borderRadius: 6,
            border: '2px solid #e53e3e',
          }}
        >
          IF THE WHOLE WORLD TURNED INTO
        </div>
        <div
          style={{
            fontFamily: 'Bricolage, sans-serif',
            fontSize: 104,
            fontWeight: 900,
            color: '#ecc94b',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            letterSpacing: 3,
            textShadow: '0 8px 30px rgba(0,0,0,0.95), 0 0 20px rgba(236,201,75,0.4)',
            marginTop: 10,
          }}
        >
          ZOMBIES?
        </div>
        <div
          style={{
            fontFamily: 'Bricolage, sans-serif',
            fontSize: 32,
            fontWeight: 800,
            color: '#ffffff',
            marginTop: 10,
            background: '#9b2c2c',
            padding: '4px 30px',
            borderRadius: 6,
            boxShadow: '0 6px 20px rgba(0,0,0,0.8)',
            letterSpacing: 2,
          }}
        >
          HOW SCIENCE DETERMINES YOUR SURVIVAL
        </div>
      </div>
    </AbsoluteFill>
  );
};
