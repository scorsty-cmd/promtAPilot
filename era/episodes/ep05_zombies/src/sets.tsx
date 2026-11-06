import React from 'react';
import { P } from './art';
import { rng, clamp, lerp } from './lib';
import { MChar, CAST } from './chars';

export const C = {
  ink: '#11161d',
  nightSky: '#0d131a',
  nightFog: '#1a2332',
  duskSky: '#2d2426',
  duskFog: '#4a3b3a',
  ash: '#4a5568',
  concrete: '#2d3748',
  concreteL: '#4a5568',
  rust: '#9b2c2c',
  amber: '#d69e2e',
  greenBio: '#22543d',
  snow: '#e2e8f0',
  pine: '#1a2e22',
};

const ol = (w = 7) => ({
  stroke: P.ink,
  strokeWidth: w,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
});
const W = 2400;

/* Post-apocalyptic Sky with atmospheric smog/spore fog */
export const Sky: React.FC<{ tone?: 'night' | 'dusk' | 'overcast' | 'winter'; t?: number }> = ({ tone = 'night', t = 0 }) => {
  const g = {
    night: ['#090d14', '#17202e'],
    dusk: ['#1f1418', '#382522'],
    overcast: ['#1c232b', '#3b4754'],
    winter: ['#1a222d', '#4a5b6e'],
  }[tone];

  return (
    <g>
      <defs>
        <linearGradient id={`sk_${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={g[0]} />
          <stop offset="1" stopColor={g[1]} />
        </linearGradient>
      </defs>
      <rect x={-240} y={-200} width={W} height={1300} fill={`url(#sk_${tone})`} />

      {/* Atmospheric Spores / Dust Particles (Improvement Backlog #5) */}
      {Array.from({ length: 45 }).map((_, i) => {
        const R = rng(i + 13);
        const px = (R() * 1920 + t * (15 + R() * 20)) % 1920;
        const py = (R() * 1000 + Math.sin(t * 2 + i) * 20) % 1000;
        return (
          <circle
            key={i}
            cx={px}
            cy={py}
            r={1.5 + R() * 2.5}
            fill={tone === 'winter' ? '#e2e8f0' : '#ecc94b'}
            opacity={0.25 + R() * 0.35}
          />
        );
      })}
    </g>
  );
};

/* Abandoned City Skyline & Street */
export const CityStreet: React.FC<{ T: number; px?: number; siren?: boolean }> = ({ T, px = 0, siren = false }) => {
  const flicker = Math.sin(T * 12) > 0.4 ? 0.9 : 0.2;
  const redAlert = Math.sin(T * 8) > 0 ? 0.7 : 0.1;

  return (
    <g>
      <Sky tone="night" t={T} />
      {/* Background Broken Skyscrapers */}
      <g transform={`translate(${px * 0.2} 0)`}>
        <polygon points="120,850 120,320 280,350 280,850" fill="#141c24" {...ol(6)} />
        <polygon points="260,850 260,240 460,260 460,850" fill="#18222c" {...ol(6)} />
        <polygon points="440,850 440,380 620,400 620,850" fill="#121820" {...ol(6)} />
        <polygon points="800,850 800,200 1020,230 1020,850" fill="#17212b" {...ol(6)} />
        <polygon points="1000,850 1000,340 1200,360 1200,850" fill="#11161d" {...ol(6)} />
        <polygon points="1350,850 1350,280 1580,310 1580,850" fill="#192430" {...ol(6)} />
        <polygon points="1560,850 1560,390 1780,410 1780,850" fill="#131922" {...ol(6)} />
      </g>

      {/* Midground abandoned buildings & barricades */}
      <g transform={`translate(${px * 0.6} 0)`}>
        <rect x={-80} y={550} width={420} height={400} fill="#1f2933" {...ol()} />
        <rect x={50} y={600} width={70} height={100} fill="#0d131a" {...ol(5)} />
        {/* Boarded window */}
        <line x1={45} y1={620} x2={125} y2={640} stroke="#744210" strokeWidth={8} />
        <line x1={45} y1={660} x2={125} y2={675} stroke="#744210" strokeWidth={8} />

        <rect x={1480} y={520} width={480} height={430} fill="#1a232c" {...ol()} />
        <rect x={1580} y={580} width={90} height={120} fill="#0d131a" {...ol(5)} />
        <line x1={1570} y1={610} x2={1680} y2={625} stroke="#744210" strokeWidth={9} />
        <line x1={1570} y1={650} x2={1680} y2={670} stroke="#744210" strokeWidth={9} />
      </g>

      {/* Foreground Street & Abandoned Cars */}
      <g transform={`translate(${px} 0)`}>
        <rect x={-200} y={820} width={W} height={300} fill="#161c24" stroke={P.ink} strokeWidth={8} />
        <line x1={-200} y1={920} x2={W} y2={920} stroke="#4a5568" strokeWidth={8} strokeDasharray="60 50" />

        {/* Abandoned Car Silhouette */}
        <g transform="translate(420 810)">
          <path d="M 0 40 L 40 0 L 160 0 L 210 40 L 250 45 L 250 80 L -30 80 L -30 45 Z" fill="#2d3748" {...ol()} />
          <circle cx={35} cy={80} r={24} fill="#1a202c" {...ol(6)} />
          <circle cx={185} cy={80} r={24} fill="#1a202c" {...ol(6)} />
          <polygon points="50,10 100,10 95,38 45,38" fill="#1a202c" />
          <polygon points="110,10 150,10 155,38 105,38" fill="#1a202c" />
        </g>

        {/* Flickering Streetlamp */}
        <g transform="translate(1120 480)">
          <line x1={0} y1={0} x2={0} y2={360} stroke="#2d3748" strokeWidth={12} />
          <path d="M -30 0 L 30 0 L 20 20 L -20 20 Z" fill="#4a5568" {...ol(5)} />
          <polygon points="-25,20 25,20 180,360 -180,360" fill="rgba(254, 235, 129, 0.15)" opacity={flicker} />
        </g>

        {/* Emergency flashing light (if siren active) */}
        {siren && (
          <g transform="translate(860 740)">
            <circle cx={0} cy={0} r={60} fill="#e53e3e" opacity={redAlert * 0.4} />
            <circle cx={0} cy={0} r={16} fill="#e53e3e" opacity={redAlert} />
          </g>
        )}
      </g>
    </g>
  );
};

/* Safehouse Interior with Wooden Barricades & Emergency Supplies */
export const Safehouse: React.FC<{ T: number; px?: number }> = ({ T, px = 0 }) => {
  const candleFlicker = 0.85 + Math.sin(T * 9) * 0.12;

  return (
    <g transform={`translate(${px} 0)`}>
      <rect x={-200} y={-100} width={W} height={1200} fill="#1a1c20" />
      {/* Wooden floor */}
      <rect x={-200} y={780} width={W} height={350} fill="#2c2117" stroke={P.ink} strokeWidth={8} />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={-200} y1={820 + i * 40} x2={W} y2={820 + i * 40} stroke="#1b140d" strokeWidth={4} />
      ))}

      {/* Barricaded Window */}
      <g transform="translate(680 240)">
        <rect x={0} y={0} width={560} height={420} fill="#0d1117" {...ol()} />
        {/* Outside dark trees & moonlight */}
        <ellipse cx={280} cy={80} rx={45} ry={45} fill="#4a5568" opacity={0.3} />
        {/* Heavy Wooden Planks */}
        <polygon points="-30,60 590,110 590,170 -30,120" fill="#5c381e" {...ol(6)} />
        <polygon points="-20,200 580,180 580,240 -20,260" fill="#4d2f19" {...ol(6)} />
        <polygon points="-30,310 590,340 590,400 -30,370" fill="#5c381e" {...ol(6)} />
        {/* Nails */}
        <circle cx={40} cy={95} r={5} fill="#a0aec0" />
        <circle cx={520} cy={145} r={5} fill="#a0aec0" />
        <circle cx={50} cy={235} r={5} fill="#a0aec0" />
        <circle cx={510} cy={210} r={5} fill="#a0aec0" />
      </g>

      {/* Table with Survival Radio & Cans */}
      <g transform="translate(820 660)">
        <rect x={-160} y={0} width={320} height={25} fill="#3d281a" {...ol()} />
        <line x1={-130} y1={25} x2={-130} y2={120} stroke="#3d281a" strokeWidth={18} strokeLinecap="round" />
        <line x1={130} y1={25} x2={130} y2={120} stroke="#3d281a" strokeWidth={18} strokeLinecap="round" />

        {/* Radio */}
        <rect x={-110} y={-55} width={75} height={55} rx={5} fill="#2d3748" {...ol(5)} />
        <line x1={-90} y1={-55} x2={-80} y2={-110} stroke="#a0aec0" strokeWidth={4} strokeLinecap="round" />
        <circle cx={-55} cy={-25} r={14} fill="#1a202c" />
        <circle cx={-90} cy={-18} r={5} fill="#48bb78" />

        {/* Canned Food Stack */}
        <rect x={30} y={-45} width={40} height={45} rx={3} fill="#a0aec0" {...ol(5)} />
        <rect x={30} y={-35} width={40} height={20} fill="#e53e3e" />
        <rect x={75} y={-45} width={40} height={45} rx={3} fill="#a0aec0" {...ol(5)} />
        <rect x={75} y={-35} width={40} height={20} fill="#3182ce" />
        <rect x={52} y={-90} width={40} height={45} rx={3} fill="#a0aec0" {...ol(5)} />

        {/* Candle */}
        <rect x={-10} y={-40} width={14} height={40} fill="#edf2f7" />
        <polygon points="-3,-40 3,-40 0,-56" fill="#ecc94b" opacity={candleFlicker} />
        <circle cx={0} cy={-48} r={80} fill="rgba(236, 201, 75, 0.12)" opacity={candleFlicker} />
      </g>
    </g>
  );
};

/* Mountain Ridge & High Altitude Safe Haven (Ch 6, 7, 10) */
export const MountainRidge: React.FC<{ T: number; px?: number; winter?: boolean }> = ({ T, px = 0, winter = false }) => {
  return (
    <g>
      <Sky tone={winter ? 'winter' : 'dusk'} t={T} />
      {/* Distant Mountain Peaks */}
      <g transform={`translate(${px * 0.2} 0)`}>
        <polygon points="-100,750 350,220 800,750" fill={winter ? '#3b4c5e' : '#27202b'} {...ol(6)} />
        {winter && <polygon points="350,220 280,320 340,300 370,330 420,310" fill="#e2e8f0" />}
        <polygon points="600,750 1100,180 1600,750" fill={winter ? '#2d3b4b' : '#1f1a23'} {...ol(6)} />
        {winter && <polygon points="1100,180 1020,290 1090,270 1120,310 1180,280" fill="#e2e8f0" />}
        <polygon points="1350,750 1800,280 2250,750" fill={winter ? '#334455' : '#251e28'} {...ol(6)} />
      </g>

      {/* Pine Trees Forest */}
      <g transform={`translate(${px * 0.5} 0)`}>
        {Array.from({ length: 14 }).map((_, i) => {
          const tx = i * 150 - 40;
          return (
            <g key={i} transform={`translate(${tx} 680)`}>
              <polygon points="0,-180 -45,-40 45,-40" fill={winter ? '#1a2e22' : '#14231a'} {...ol(5)} />
              <polygon points="0,-120 -55,20 55,20" fill={winter ? '#1e3527' : '#172a1f'} {...ol(5)} />
              <line x1={0} y1={20} x2={0} y2={60} stroke="#3d281a" strokeWidth={14} />
              {winter && (
                <polygon points="0,-180 -25,-120 0,-130 25,-120" fill="#e2e8f0" opacity={0.8} />
              )}
            </g>
          );
        })}
      </g>

      {/* Rocky Cliff Foreground with Cabin */}
      <g transform={`translate(${px} 0)`}>
        <polygon points="-120,740 600,720 1200,750 2100,730 2100,1100 -120,1100" fill={winter ? '#4a5568' : '#332924'} {...ol()} />
        {winter && (
          <path d="M -120 740 Q 300 730 600 720 Q 900 745 1200 750 Q 1600 735 2100 730 L 2100 755 L -120 765 Z" fill="#e2e8f0" />
        )}

        {/* Small Log Cabin / Haven */}
        <g transform="translate(1420 580)">
          <rect x={0} y={40} width={220} height={130} fill="#4a3525" {...ol()} />
          <polygon points="-20,40 110,-30 240,40" fill="#2d1f16" {...ol()} />
          <rect x={140} y={75} width={50} height={95} fill="#1a130e" {...ol(5)} />
          <rect x={35} y={80} width={50} height={50} fill="#f6e05e" opacity={0.8} {...ol(5)} />
          <line x1={60} y1={80} x2={60} y2={130} stroke="#1a130e" strokeWidth={4} />
          <line x1={35} y1={105} x2={85} y2={105} stroke="#1a130e" strokeWidth={4} />
          {/* Chimney & Smoke */}
          <rect x={170} y={-50} width={30} height={50} fill="#742a2a" {...ol(5)} />
          <ellipse cx={185} cy={-75 - (T * 12) % 40} rx={12 + (T * 4) % 15} ry={10 + (T * 4) % 15} fill="#e2e8f0" opacity={0.5} />
        </g>
      </g>
    </g>
  );
};
