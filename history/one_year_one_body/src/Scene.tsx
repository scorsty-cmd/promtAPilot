import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, Audio, Easing, interpolate, random, staticFile,
  useCurrentFrame, delayRender, continueRender,
} from 'remotion';

// ---------- palette (History Sourced · One Year, One Body) ----------
const C = {
  ink: '#2B1D14', skin: '#F3EAD8', skinShade: '#E4D4B8', blush: '#E39A85',
  band: '#B3362B', bandDark: '#7E2119', shirt: '#EDE3CC', shirtShade: '#CDBF9F',
  vest: '#5E4630', breeches: '#4E3A2A', stocking: '#D6CAB2', shoe: '#231811',
  hair: '#6B4528',
};

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- fonts ----------
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const fonts = [
      new FontFace('FellSC', `url(${staticFile('fonts/im-fell-english-sc-latin-400-normal.woff2')})`),
      new FontFace('FellItalic', `url(${staticFile('fonts/im-fell-english-latin-400-italic.woff2')})`, {style: 'italic'}),
      new FontFace('FrauncesBlack', `url(${staticFile('fonts/fraunces-latin-900-normal.woff2')})`, {weight: '900'}),
    ];
    Promise.all(fonts.map((f) => f.load())).then((loaded) => {
      loaded.forEach((f) => (document as any).fonts.add(f));
      continueRender(handle);
    });
  }, [handle]);
};

// ---------- timeline ----------
const WALK_END = 126;
const charX = (f: number) =>
  interpolate(f, [0, WALK_END], [-220, 1460], {...clamp, easing: Easing.bezier(0.25, 0.1, 0.45, 1)});
const camX = (f: number) =>
  interpolate(f, [0, 130], [0, 690], {...clamp, easing: Easing.bezier(0.3, 0.1, 0.4, 1)});
const GROUND = 905;
const CS = 1.32; // character scale

// ---------- painted filters ----------
const Defs: React.FC<{frame: number}> = ({frame}) => (
  <defs>
    <filter id="paint" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
    </filter>
    <filter id="paintSoft" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="9" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" />
    </filter>
    <filter id="brush" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="2" seed="3" />
      <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.13  0 0 0 0 0.08  0 0 0 0.55 0" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <filter id="blurFg"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blurFar"><feGaussianBlur stdDeviation="1.6" /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(frame / 2) % 50} />
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.09 0" />
    </filter>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1F2E33" />
      <stop offset="0.45" stopColor="#4F5A4E" />
      <stop offset="0.78" stopColor="#C88B4D" />
      <stop offset="1" stopColor="#E7B36A" />
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#5A4A3C" />
      <stop offset="1" stopColor="#2C221B" />
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#0E0806" stopOpacity="0.78" />
    </radialGradient>
    <radialGradient id="window" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0" stopColor="#FFE3A0" />
      <stop offset="1" stopColor="#E3A04A" />
    </radialGradient>
    <linearGradient id="textShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#120B08" stopOpacity="0.85" />
      <stop offset="0.55" stopColor="#120B08" stopOpacity="0.45" />
      <stop offset="0.8" stopColor="#120B08" stopOpacity="0" />
    </linearGradient>
  </defs>
);

// ---------- background pieces ----------
const House: React.FC<{x: number; w: number; h: number; s: number; door?: 'plague'; flicker: number}> = ({x, w, h, s, door, flicker}) => {
  const r = (k: number) => random(`h${s}-${k}`);
  const plaster = ['#C9AC80', '#BFA176', '#D1B88E', '#B89A70'][Math.floor(r(1) * 4)];
  const timber = '#3A2A1D';
  const g = GROUND;
  const groundH = h * 0.42;
  const jetty = 18;
  const upTop = g - h;
  const roofH = 70 + r(2) * 60;
  const wins = [];
  const nW = Math.max(2, Math.floor(w / 95));
  for (let i = 0; i < nW; i++) {
    const wx = x + 22 + i * ((w - 44) / nW) + 10;
    const ww = (w - 44) / nW - 20;
    const lit = r(10 + i) > 0.35;
    wins.push(
      <g key={i}>
        <rect x={wx} y={upTop + 40} width={ww} height={h * 0.26} fill={lit ? 'url(#window)' : '#3B3128'} stroke={timber} strokeWidth={5} opacity={lit ? 0.85 + flicker * 0.15 : 1} />
        <path d={`M${wx + ww / 2} ${upTop + 40} V${upTop + 40 + h * 0.26} M${wx} ${upTop + 40 + h * 0.13} H${wx + ww}`} stroke={timber} strokeWidth={3} />
        {lit && <rect x={wx - 20} y={upTop + 20} width={ww + 40} height={h * 0.26 + 40} fill="#FFC870" opacity={0.14 + flicker * 0.06} filter="url(#glow)" />}
      </g>,
    );
  }
  return (
    <g filter="url(#paint)">
      {/* roof */}
      <path d={`M${x - jetty - 8} ${upTop} L${x + w / 2} ${upTop - roofH} L${x + w + jetty + 8} ${upTop} Z`} fill="#4A3A33" stroke={C.ink} strokeWidth={5} />
      <path d={`M${x + w * 0.72} ${upTop - roofH * 0.5} v-60 h28 v${60 + 14}`} fill="#5A4436" stroke={C.ink} strokeWidth={4} />
      {/* upper storey (jettied) */}
      <rect x={x - jetty} y={upTop} width={w + jetty * 2} height={h - groundH} fill={plaster} stroke={C.ink} strokeWidth={5} />
      <rect x={x - jetty} y={upTop} width={w + jetty * 2} height={h - groundH} filter="url(#brush)" fill={plaster} />
      <path d={`M${x - jetty} ${upTop + 18} H${x + w + jetty} M${x - jetty} ${g - groundH - 14} H${x + w + jetty} M${x - jetty + 6} ${upTop} V${g - groundH} M${x + w + jetty - 6} ${upTop} V${g - groundH} M${x + 10} ${g - groundH - 14} L${x + w * 0.3} ${upTop + 18} M${x + w - 10} ${g - groundH - 14} L${x + w * 0.7} ${upTop + 18}`} stroke={timber} strokeWidth={9} fill="none" />
      {wins}
      {/* ground floor */}
      <rect x={x} y={g - groundH} width={w} height={groundH} fill={plaster} stroke={C.ink} strokeWidth={5} />
      <rect x={x} y={g - groundH} width={w} height={groundH} filter="url(#brush)" fill={plaster} />
      <path d={`M${x} ${g - groundH + 10} H${x + w} M${x + 8} ${g - groundH} V${g} M${x + w - 8} ${g - groundH} V${g}`} stroke={timber} strokeWidth={9} />
      {/* door */}
      <rect x={x + w * 0.36} y={g - groundH + 40} width={w * 0.24} height={groundH - 40} rx={4} fill="#4B3122" stroke={C.ink} strokeWidth={5} />
      <path d={`M${x + w * 0.42} ${g - groundH + 40} V${g} M${x + w * 0.48} ${g - groundH + 40} V${g} M${x + w * 0.54} ${g - groundH + 40} V${g}`} stroke="#3A2418" strokeWidth={3} />
      {door === 'plague' && (
        <g>
          <path d={`M${x + w * 0.48} ${g - groundH + 70} V${g - groundH + 190} M${x + w * 0.39} ${g - groundH + 112} H${x + w * 0.57}`} stroke="#B3271E" strokeWidth={17} strokeLinecap="round" />
          <rect x={x + w * 0.4} y={g - groundH + 205} width={w * 0.16} height={30} fill="#E8DCC0" stroke={C.ink} strokeWidth={2} />
          <path d={`M${x + w * 0.415} ${g - groundH + 215} h${w * 0.13} M${x + w * 0.415} ${g - groundH + 225} h${w * 0.09}`} stroke="#7A2A20" strokeWidth={2} />
        </g>
      )}
      {/* small shop window */}
      <rect x={x + w * 0.08} y={g - groundH + 50} width={w * 0.2} height={groundH * 0.4} fill={r(5) > 0.4 ? 'url(#window)' : '#3B3128'} stroke={timber} strokeWidth={5} opacity={0.9} />
    </g>
  );
};

const Cobbles: React.FC = () => {
  const stones = [];
  for (let row = 0; row < 7; row++) {
    const y = GROUND + 10 + row * row * 4.2 + row * 14;
    const sh = 10 + row * 4.5;
    const sw = 28 + row * 10;
    for (let i = -2; i < 3400 / sw; i++) {
      const x = -400 + i * sw + (row % 2) * sw * 0.5 + random(`c${row}-${i}`) * 6;
      const shade = 0.75 + random(`cs${row}-${i}`) * 0.3;
      stones.push(<rect key={`${row}-${i}`} x={x} y={y} width={sw - 5} height={sh} rx={sh / 2.2} fill={`rgb(${Math.round(112 * shade)},${Math.round(96 * shade)},${Math.round(80 * shade)})`} stroke="#2A2019" strokeWidth={2} />);
    }
  }
  return (
    <g filter="url(#paintSoft)">
      <rect x={-500} y={GROUND} width={3600} height={300} fill="url(#ground)" />
      {stones}
      <rect x={-500} y={GROUND} width={3600} height={14} fill="#2A1F18" opacity={0.6} />
    </g>
  );
};

const FarSkyline: React.FC = () => {
  const parts = [];
  for (let i = 0; i < 26; i++) {
    const x = -300 + i * 110;
    const h = 120 + random(`fs${i}`) * 140;
    parts.push(<path key={i} d={`M${x} 760 V${760 - h} L${x + 55} ${760 - h - 50} L${x + 110} ${760 - h} V760 Z`} />);
  }
  return (
    <g fill="#6E6152" opacity={0.75} filter="url(#blurFar)">
      {parts}
      {/* Old St Paul's tower (spire already lost in 1561) */}
      <path d="M1180 760 V470 H1240 V420 H1330 V470 H1390 V760 Z M1150 760 V560 H1420 V760 Z" fill="#5E5346" />
      <path d="M1250 420 v-40 h16 v40 M1312 420 v-40 h16 v40" stroke="#5E5346" strokeWidth={8} />
    </g>
  );
};

// ---------- 2-bone IK ----------
const ik = (sx: number, sy: number, tx: number, ty: number, l1: number, l2: number, bend: 1 | -1) => {
  let dx = tx - sx, dy = ty - sy;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 0.5;
  if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
  const a = Math.atan2(dy, dx);
  const cosB = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const b = Math.acos(Math.max(-1, Math.min(1, cosB)));
  const ex = sx + Math.cos(a + bend * b) * l1;
  const ey = sy + Math.sin(a + bend * b) * l1;
  return {ex, ey, hx: sx + dx, hy: sy + dy};
};

const Limb: React.FC<{pts: [number, number][]; w: number; color: string; w2?: number; color2?: string}> = ({pts, w, color, w2, color2}) => {
  const [a, b, c] = pts;
  const seg1 = `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
  const seg2 = `M${b[0]} ${b[1]} L${c[0]} ${c[1]}`;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}`} stroke={C.ink} strokeWidth={Math.max(w, w2 ?? w) + 10} />
      <path d={seg2} stroke={color2 ?? color} strokeWidth={w2 ?? w} />
      <path d={seg1} stroke={color} strokeWidth={w} />
    </g>
  );
};

// ---------- the character: Tom, a baker's apprentice ----------
type Pose = {walk: number; walking: number; pain: number; handUp: number; blink: number; surprise: number; frame: number; breath: number};

const Head: React.FC<Pose> = ({pain, blink, surprise, frame}) => {
  const jitter = Math.sin(frame * 1.9) * 1.6 * pain;
  const brL = -32 - 13 * pain - 8 * surprise;
  const eyesClosed = pain > 0.55;
  const ry = 13 * (1 - blink) + 1 + surprise * 3;
  const mouthW = 16 + 12 * pain;
  const wob = (i: number) => (i % 2 === 0 ? -1 : 1) * (4 + 2 * Math.sin(frame * 0.9 + i)) * pain;
  let mouth = `M${8 - mouthW / 2} 46 Q 8 ${52 - 6 * pain} ${8 + mouthW / 2} 46`;
  if (pain > 0.3) {
    const pts = Array.from({length: 7}, (_, i) => `${8 - mouthW / 2 + (mouthW / 6) * i} ${48 + wob(i)}`);
    mouth = `M${pts.join(' L')}`;
  }
  return (
    <g transform={`translate(${jitter} 0) rotate(${7 * pain} 0 40)`}>
      {/* hair at the back */}
      <path d="M-58 -52 q-22 10 -18 34 q10 -10 22 -8 q-12 14 -6 30 q12 -16 26 -14" fill={C.hair} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* union outline: swollen cheek + egg head */}
      <g stroke={C.ink} strokeWidth={13} fill="none">
        <ellipse cx={56} cy={32} rx={24 + 6 * pain} ry={24 + 5 * pain} />
        <ellipse cx={0} cy={0} rx={72} ry={88} />
      </g>
      <g fill={C.skin}>
        <ellipse cx={56} cy={32} rx={24 + 6 * pain} ry={24 + 5 * pain} />
        <ellipse cx={0} cy={0} rx={72} ry={88} />
      </g>
      {/* soft shading + swelling flush */}
      <ellipse cx={-30} cy={30} rx={40} ry={50} fill={C.skinShade} opacity={0.5} />
      <ellipse cx={58} cy={32} rx={20 + 4 * pain} ry={16 + 4 * pain} fill="#D96A55" opacity={0.3 + 0.35 * pain} />
      {/* eyes */}
      {eyesClosed ? (
        <g stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-20 -14 L-6 -6 L-20 2" />
          <path d="M44 -14 L30 -6 L44 2" />
        </g>
      ) : (
        <g fill={C.ink}>
          <ellipse cx={-10} cy={-8} rx={7 + surprise * 1.5} ry={Math.max(1.2, ry)} />
          <ellipse cx={34} cy={-8} rx={7 + surprise * 1.5} ry={Math.max(1.2, ry)} />
          {blink < 0.5 && <circle cx={-8} cy={-13} r={2.2} fill="#fff" />}
          {blink < 0.5 && <circle cx={36} cy={-13} r={2.2} fill="#fff" />}
        </g>
      )}
      {/* brows: worried when hurting */}
      <g stroke={C.ink} strokeWidth={6} strokeLinecap="round">
        <path d={`M-26 ${-34 - 8 * surprise} L-2 ${brL}`} />
        <path d={`M22 ${brL} L48 ${-34 - 8 * surprise}`} />
      </g>
      {/* mouth */}
      {surprise > 0.4 && pain < 0.3 ? (
        <ellipse cx={8} cy={48} rx={8} ry={10 * surprise} fill="#5A1F18" stroke={C.ink} strokeWidth={4} />
      ) : (
        <path d={mouth} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* signature: the red toothache cloth tied over the head */}
      <path d="M-4 -90 C -78 -78, -96 60, 4 96" stroke={C.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d="M-4 -90 C -78 -78, -96 60, 4 96" stroke={C.band} strokeWidth={24} fill="none" strokeLinecap="round" />
      <path d="M-12 -84 C -70 -70, -86 50, -2 86" stroke={C.bandDark} strokeWidth={4} fill="none" opacity={0.6} />
      <g transform={`rotate(${Math.sin(frame * 0.35) * 6} -6 -94)`}>
        <path d="M-6 -94 L-34 -132 L-12 -126 Z" fill={C.band} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-6 -94 L18 -136 L22 -114 Z" fill={C.band} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-6} cy={-94} r={11} fill={C.band} stroke={C.ink} strokeWidth={5} />
      </g>
    </g>
  );
};

const Character: React.FC<Pose & {x: number}> = (p) => {
  const {walk, walking, handUp, x, breath, pain} = p;
  const ph = walk * Math.PI * 2;
  const bob = walking * (Math.abs(Math.cos(ph)) * -9) + breath * 3;
  const hipY = -182 + bob;
  const shY = -318 + bob;
  const legA = 0.45 * walking;
  const leg = (side: number) => {
    const a = side * legA * Math.sin(ph);
    const kneeBend = walking * Math.max(0, Math.sin(ph + (side > 0 ? 0 : Math.PI) + 0.9)) * 0.75;
    const kx = Math.sin(a) * 88, ky = Math.cos(a) * 88;
    const fa = a - kneeBend;
    const fx = kx + Math.sin(fa) * 88, fy = ky + Math.cos(fa) * 88;
    return {k: [kx, hipY + ky] as [number, number], f: [fx, hipY + fy] as [number, number]};
  };
  const shoe = (f: [number, number], key: string) => (
    <ellipse key={key} cx={f[0] + 12} cy={f[1] + 4} rx={24} ry={11} fill={C.shoe} stroke={C.ink} strokeWidth={5} />
  );
  // arms: swing target, blended to cheek target
  const armSwing = (side: number) => -side * 0.38 * walking * Math.sin(ph);
  const swingHand = (sx: number, side: number) => [sx + Math.sin(armSwing(side)) * 125 + 8, shY + Math.cos(armSwing(side)) * 125] as [number, number];
  const headX = 10, headY = -420 + bob;
  const cheek: [number, number] = [headX + 72, headY + 60 + Math.sin(p.frame * 0.5) * 2 * pain];
  const sFront: [number, number] = [-28 + 44 * handUp, shY + 6];
  const sBack: [number, number] = [30, shY + 2];
  const fh0 = swingHand(sFront[0], 1);
  const ft: [number, number] = [fh0[0] + (cheek[0] - fh0[0]) * handUp, fh0[1] + (cheek[1] - fh0[1]) * handUp];
  const front = ik(sFront[0], sFront[1], ft[0], ft[1], 66, 66, 1);
  const bh = swingHand(sBack[0], -1);
  const back = ik(sBack[0], sBack[1], bh[0], bh[1], 66, 66, 1);
  const L = leg(1), R = leg(-1);
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${CS})`} filter="url(#paintSoft)">
      {/* contact shadow */}
      <ellipse cx={0} cy={4} rx={80} ry={12} fill="#120B07" opacity={0.45} />
      {/* back arm + leg */}
      <g opacity={0.92}>
        <Limb pts={[sBack, [back.ex, back.ey], [back.hx, back.hy]]} w={24} color={C.shirtShade} />
        <circle cx={back.hx} cy={back.hy} r={13} fill={C.skinShade} stroke={C.ink} strokeWidth={5} />
        <Limb pts={[[8, hipY], R.k, R.f]} w={30} color="#3F2F22" w2={22} color2="#BDB29A" />
        {shoe(R.f, 'r')}
      </g>
      <Limb pts={[[-6, hipY], L.k, L.f]} w={30} color={C.breeches} w2={22} color2={C.stocking} />
      {shoe(L.f, 'l')}
      {/* torso */}
      <path d={`M-44 ${shY} Q0 ${shY - 12} 46 ${shY} L40 ${hipY + 8} Q0 ${hipY + 18} -40 ${hipY + 8} Z`} fill={C.shirt} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M-38 ${shY + 8} L-12 ${shY + 8} L2 ${hipY + 14} L-36 ${hipY + 8} Z`} fill={C.vest} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M42 ${shY + 8} L18 ${shY + 8} L6 ${hipY + 14} L38 ${hipY + 8} Z`} fill={C.vest} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => <circle key={i} cx={-6} cy={shY + 40 + i * 32} r={4} fill="#C9A35A" stroke={C.ink} strokeWidth={2} />)}
      {/* apron (baker's apprentice) */}
      <path d={`M-30 ${hipY - 30} H34 L40 ${hipY + 70} Q4 ${hipY + 80} -36 ${hipY + 70} Z`} fill="#E2D6BC" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M-32 ${hipY - 26} H36`} stroke="#8C7552" strokeWidth={5} />
      {/* neck */}
      <rect x={-2} y={shY - 28} width={22} height={30} fill={C.skinShade} stroke={C.ink} strokeWidth={5} />
      {/* head */}
      <g transform={`translate(${headX} ${headY})`}>
        <Head {...p} />
      </g>
      {/* front arm on top (hand goes to the swollen cheek) */}
      <Limb pts={[sFront, [front.ex, front.ey], [front.hx, front.hy]]} w={24} color={C.shirt} />
      <circle cx={front.hx} cy={front.hy} r={14} fill={C.skin} stroke={C.ink} strokeWidth={5} />
    </g>
  );
};

// pain throb effect around the cheek
const Throb: React.FC<{frame: number; x: number; y: number; on: number}> = ({frame, x, y, on}) => {
  if (on <= 0) return null;
  const beat = ((frame - 150) % 22 + 22) % 22;
  const k = beat / 22;
  const r = 30 + k * 70;
  const op = (1 - k) * on;
  const zap = beat < 7 ? 1 - beat / 7 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="none" stroke="#E0442F" strokeWidth={8 * (1 - k) + 2} opacity={op * 0.8} />
      <circle r={r * 0.6} fill="none" stroke="#F2A03D" strokeWidth={5} opacity={op * 0.6} />
      <g stroke="#E0442F" strokeWidth={7} strokeLinecap="round" opacity={zap * on}>
        <path d="M70 -40 l26 -18" />
        <path d="M82 4 l32 -2" />
        <path d="M68 46 l24 18" />
      </g>
    </g>
  );
};

// ---------- main composition ----------
export const ToothacheTest: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flicker = (Math.sin(f * 0.7) + Math.sin(f * 1.31) * 0.6) * 0.5;

  const x = charX(f);
  const cam = camX(f);
  const walking = interpolate(f, [0, 8, WALK_END - 14, WALK_END + 2], [0.6, 1, 1, 0], clamp);
  // distance-driven walk phase so feet don't slide
  const walk = (x + 220) / 300;

  const surprise = interpolate(f, [120, 126, 140, 150], [0, 1, 1, 0], clamp);
  const handUp = interpolate(f, [130, 152], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const pain = interpolate(f, [140, 158], [0, 1], clamp);
  const blinkAt = [38, 92, 205, 262];
  const blink = Math.max(...blinkAt.map((b) => interpolate(f, [b - 3, b, b + 3], [0, 1, 0], clamp)));
  const breath = Math.sin(f * 0.12);

  // camera: wide follow -> push into close-up, head on right third
  const zoom = interpolate(f, [150, 205], [1, 2.15], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const shake = interpolate(f, [122, 126, 134], [0, 7, 0], clamp) * Math.sin(f * 3.1);
  const screenX = x - cam;
  const headWX = screenX + 10 * CS;
  const headWY = GROUND - 420 * CS;
  const focusX = interpolate(zoom, [1, 2.15], [960, headWX - 300 / 2.15]);
  const focusY = interpolate(zoom, [1, 2.15], [540, headWY + 60]);
  const camT = `translate(960 540) scale(${zoom}) translate(${-focusX + shake} ${-focusY})`;

  const titleIn = interpolate(f, [214, 232], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const line2 = interpolate(f, [226, 246], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const line3 = interpolate(f, [250, 268], [0, 1], clamp);
  const fadeIn = interpolate(f, [0, 12], [1, 0], clamp);
  const fadeOut = interpolate(f, [288, 300], [0, 1], clamp);

  const motes = Array.from({length: 40}, (_, i) => {
    const sx = random(`mx${i}`) * 2200 - 100;
    const sy = random(`my${i}`) * 900;
    const sp = 0.3 + random(`ms${i}`) * 0.8;
    return (
      <circle key={i} cx={((sx - cam * 1.2 + f * sp * 1.5) % 2300 + 2300) % 2300 - 150} cy={sy + Math.sin(f * 0.03 + i) * 20} r={1.5 + random(`mr${i}`) * 3} fill="#FFD9A0" opacity={0.25 + 0.3 * random(`mo${i}`)} />
    );
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#140D0A'}}>
      <Audio src={staticFile('ambience.wav')} />
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Defs frame={f} />
        <g transform={camT}>
          {/* sky */}
          <rect x={-2000} y={-800} width={6000} height={1700} fill="url(#sky)" />
          <circle cx={1500 - cam * 0.05} cy={690} r={140} fill="#FFD48A" opacity={0.55} filter="url(#glow)" />
          <g transform={`translate(${-cam * 0.18} 0)`}><FarSkyline /></g>
          {/* low haze between layers */}
          <rect x={-2000} y={640} width={6000} height={160} fill="#D9A766" opacity={0.25} filter="url(#glow)" />
          {/* street */}
          <g transform={`translate(${-cam} 0)`}>
            <House x={-260} w={330} h={470} s={1} flicker={flicker} />
            <House x={120} w={300} h={520} s={2} flicker={flicker} />
            <House x={470} w={360} h={450} s={3} flicker={flicker} />
            <House x={880} w={310} h={540} s={4} flicker={flicker} />
            <House x={1240} w={360} h={500} s={5} door="plague" flicker={flicker} />
            <House x={1650} w={320} h={530} s={6} flicker={flicker} />
            <House x={2020} w={360} h={480} s={7} flicker={flicker} />
            <House x={2430} w={300} h={510} s={8} flicker={flicker} />
            <Cobbles />
            {/* warm pool of light from the windows on the street */}
            <ellipse cx={1420} cy={GROUND + 40} rx={420} ry={60} fill="#F3B864" opacity={0.12 + flicker * 0.04} filter="url(#glow)" />
          </g>
          {/* fog drifting at street level */}
          <g opacity={0.35}>
            <ellipse cx={((f * 1.4 - cam * 0.6) % 2600) - 300} cy={860} rx={600} ry={60} fill="#C9B49A" filter="url(#glow)" />
            <ellipse cx={((f * 0.9 - cam * 0.6 + 1300) % 2600) - 300} cy={880} rx={500} ry={50} fill="#BFA98E" filter="url(#glow)" />
          </g>
          {/* character */}
          <Character x={screenX} walk={walk} walking={walking} pain={pain} handUp={handUp} blink={blink} surprise={surprise} frame={f} breath={breath} />
          <Throb frame={f} x={headWX + 62 * CS} y={headWY + 32 * CS} on={pain} />
          {/* foreground: post and hanging sign, faster parallax, out of focus */}
          <g transform={`translate(${-cam * 1.6} 0)`} filter="url(#blurFg)" opacity={0.95}>
            <rect x={1000} y={300} width={36} height={900} fill="#1C140F" />
            <rect x={1000} y={330} width={190} height={16} fill="#1C140F" />
            <path d="M1060 346 v30 M1170 346 v30" stroke="#1C140F" strokeWidth={6} />
            <path d="M1040 376 h150 v100 q-75 26 -150 0 Z" fill="#2A1D15" />
          </g>
          {motes}
        </g>

        {/* title card over the close-up */}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#textShade)" opacity={titleIn} />
        <g transform={`translate(${130 - (1 - titleIn) * 40} 0)`} opacity={titleIn}>
          <text x={0} y={330} fontFamily="FellSC" fontSize={56} letterSpacing={14} fill="#E9B55E">London, 1665</text>
          <rect x={0} y={356} width={360 * titleIn} height={4} fill="#E9B55E" />
        </g>
        <g opacity={line2} transform={`translate(${130} ${(1 - line2) * 30})`}>
          <text x={0} y={490} fontFamily="FrauncesBlack" fontWeight={900} fontSize={112} fill="#F6EEDC">Your tooth</text>
          <text x={0} y={610} fontFamily="FrauncesBlack" fontWeight={900} fontSize={112} fill="#F6EEDC">is <tspan fill="#E5503A">rotting.</tspan></text>
        </g>
        <g opacity={line3}>
          <text x={132} y={710} fontFamily="FellItalic" fontStyle="italic" fontSize={46} fill="#E4D6BA">And the only man who can help…</text>
          <text x={132} y={768} fontFamily="FellItalic" fontStyle="italic" fontSize={46} fill="#E4D6BA">is the barber.</text>
        </g>
        <g opacity={titleIn * 0.9}>
          <rect x={130} y={928} width={420} height={2} fill="#9C8466" />
          <text x={130} y={968} fontFamily="FellSC" fontSize={28} letterSpacing={6} fill="#C8B08A">One Year, One Body · Ep. 01</text>
        </g>

        {/* finishing: vignette, grain, fades */}
        <rect width={1920} height={1080} fill="url(#vignette)" />
        <rect width={1920} height={1080} filter="url(#grain)" />
        <rect width={1920} height={1080} fill="#000" opacity={Math.max(fadeIn, fadeOut)} />
      </svg>
    </AbsoluteFill>
  );
};
