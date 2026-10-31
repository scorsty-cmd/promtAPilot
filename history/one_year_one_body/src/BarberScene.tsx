import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {Puppet, Pliers, TOM, BARBER, restHead, Pose, HeadPose} from './rig';
import lip from './lipsync.json';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const FLOOR = 905;
const FREEZE = 322;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const fs = [
      new FontFace('FellSC', `url(${staticFile('fonts/im-fell-english-sc-latin-400-normal.woff2')})`),
      new FontFace('FellItalic', `url(${staticFile('fonts/im-fell-english-latin-400-italic.woff2')})`, {style: 'italic'}),
      new FontFace('FrauncesBlack', `url(${staticFile('fonts/fraunces-latin-900-normal.woff2')})`, {weight: '900'}),
    ];
    Promise.all(fs.map((x) => x.load())).then((l) => { l.forEach((x) => (document as any).fonts.add(x)); continueRender(h); });
  }, [h]);
};

// damped spring 0 -> 1 with overshoot, starting at frame s
const spring = (f: number, s: number, k = 0.28, d = 0.16) => {
  if (f < s) return 0;
  const t = f - s;
  return 1 - Math.exp(-d * t) * Math.cos(k * t);
};
const blinkAt = (f: number, list: number[]) => Math.max(0, ...list.map((b) => interpolate(f, [b - 3, b, b + 3], [0, 1, 0], clamp)));

// ---------- set ----------
const Defs: React.FC<{f: number; frozen: boolean}> = ({f, frozen}) => (
  <defs>
    <filter id="paint" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
    </filter>
    <filter id="soft" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="9" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
    </filter>
    <filter id="brush" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.9" numOctaves="2" seed="3" />
      <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 0.5 0" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <filter id="blurFg"><feGaussianBlur stdDeviation="7" /></filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22" /></filter>
    <filter id="glowS" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frozen ? 7 : Math.floor(f / 2) % 50} />
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.09 0" />
    </filter>
    <filter id="freeze"><feColorMatrix type="saturate" values="0.25" /></filter>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1B2A3A" /><stop offset="0.6" stopColor="#5B5A66" /><stop offset="1" stopColor="#D79A5C" />
    </linearGradient>
    <radialGradient id="candle" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#FFD58A" stopOpacity="0.55" /><stop offset="0.5" stopColor="#F2A24A" stopOpacity="0.18" /><stop offset="1" stopColor="#F2A24A" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0B0604" stopOpacity="0.82" />
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A3424" /><stop offset="1" stopColor="#1F150E" /></linearGradient>
  </defs>
);

const Tooth: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <path transform={`translate(${x} ${y}) rotate(${r})`} d="M-7 -8 Q0 -12 7 -8 Q9 2 5 4 L3 14 L0 6 L-3 14 L-5 4 Q-9 2 -7 -8 Z" fill="#F4EEDD" stroke="#2B1D14" strokeWidth={2.5} />
);

const Interior: React.FC<{f: number; flick: number}> = ({f, flick}) => {
  const boards = Array.from({length: 23}, (_, i) => {
    const c = 0.85 + random(`b${i}`) * 0.22;
    return <rect key={i} x={i * 88 - 40} y={0} width={88} height={FLOOR} fill={`rgb(${Math.round(92 * c)},${Math.round(63 * c)},${Math.round(43 * c)})`} stroke="#2E1F15" strokeWidth={4} />;
  });
  const jars = [
    {x: 1410, h: 70, c: '#6E8F5E'}, {x: 1470, h: 54, c: '#9C5A3C'}, {x: 1530, h: 80, c: '#4F6E7E'},
    {x: 1600, h: 62, c: '#B08A4A'}, {x: 1700, h: 74, c: '#5E5E7A'}, {x: 1765, h: 50, c: '#8C3F35'},
  ];
  const teeth = Array.from({length: 9}, (_, i) => {
    const tx = 215 + i * 36;
    const ty = 236 + Math.sin((i / 8) * Math.PI) * 34;
    return <Tooth key={i} x={tx} y={ty + 14} r={Math.sin(f * 0.05 + i) * 6} />;
  });
  return (
    <g>
      <g filter="url(#paint)">
        {boards}
        <rect x={-40} y={0} width={2040} height={FLOOR} filter="url(#brush)" fill="#5B3F2B" />
        <rect x={-40} y={FLOOR - 70} width={2040} height={70} fill="#3E2A1C" stroke="#2B1D14" strokeWidth={5} />
        {/* window */}
        <rect x={180} y={200} width={360} height={380} fill="url(#dusk)" stroke="#2B1D14" strokeWidth={8} />
        <path d="M180 470 L240 440 L300 455 L330 400 L380 430 L430 380 L470 420 L540 395 V580 H180 Z" fill="#2F2A2E" opacity={0.85} />
        <circle cx={460} cy={300} r={30} fill="#F4D9A0" opacity={0.35} filter="url(#glowS)" />
        <g stroke="#2B1D14" strokeWidth={3} opacity={0.75}>
          {Array.from({length: 8}, (_, i) => <path key={`a${i}`} d={`M${180 + i * 60 - 120} 200 l240 380`} />)}
          {Array.from({length: 8}, (_, i) => <path key={`b${i}`} d={`M${180 + i * 60 + 120} 200 l-240 380`} />)}
        </g>
        <rect x={180} y={200} width={360} height={380} fill="none" stroke="#3E2A1C" strokeWidth={22} />
        <rect x={160} y={580} width={400} height={26} fill="#4A3424" stroke="#2B1D14" strokeWidth={5} />
        {/* string of pulled teeth: barber-surgeons displayed them as advertising */}
        <path d="M200 230 Q 360 300 525 230" stroke="#8C7552" strokeWidth={3} fill="none" />
        {teeth}
        {/* shelf with jars, leeches, herbs */}
        <rect x={1370} y={330} width={480} height={18} fill="#4A3424" stroke="#2B1D14" strokeWidth={5} />
        <path d="M1400 348 l20 40 M1820 348 l-20 40" stroke="#2B1D14" strokeWidth={8} />
        {jars.map((j, i) => (
          <g key={i}>
            <rect x={j.x} y={330 - j.h} width={46} height={j.h} rx={10} fill={j.c} stroke="#2B1D14" strokeWidth={4} opacity={0.92} />
            <rect x={j.x + 6} y={330 - j.h - 12} width={34} height={14} rx={3} fill="#C9B08A" stroke="#2B1D14" strokeWidth={3} />
            <rect x={j.x + 8} y={330 - j.h + 14} width={30} height={18} fill="#E8DCC0" opacity={0.85} />
            <rect x={j.x + 8} y={330 - j.h + 4} width={8} height={j.h - 14} rx={4} fill="#fff" opacity={0.18} />
          </g>
        ))}
        <g stroke="#1E1A14" strokeWidth={4} fill="none">
          <path d={`M1540 ${290 + Math.sin(f * 0.2) * 3} q8 -8 14 0 q6 8 12 0`} />
          <path d={`M1546 ${305 + Math.cos(f * 0.17) * 3} q8 -8 14 0`} />
        </g>
        {[1440, 1650, 1790].map((x, i) => (
          <g key={i} transform={`rotate(${Math.sin(f * 0.04 + i) * 2} ${x} 348)`}>
            <path d={`M${x} 348 v26`} stroke="#6B5A3A" strokeWidth={3} />
            <path d={`M${x - 16} 374 L${x} 440 L${x + 16} 374 Z`} fill="#6F7A45" stroke="#2B1D14" strokeWidth={3} />
          </g>
        ))}
        {/* table with basin and candle */}
        <rect x={1480} y={740} width={400} height={22} fill="#5A3F2B" stroke="#2B1D14" strokeWidth={5} />
        <path d="M1510 762 V905 M1850 762 V905" stroke="#2B1D14" strokeWidth={14} />
        <path d="M1510 762 V905 M1850 762 V905" stroke="#4A3424" strokeWidth={6} />
        <ellipse cx={1580} cy={730} rx={70} ry={20} fill="#C9A35A" stroke="#2B1D14" strokeWidth={5} />
        <path d="M1510 730 Q1580 790 1650 730" fill="#A88238" stroke="#2B1D14" strokeWidth={5} />
        <path d="M1520 728 q30 -8 60 -4" stroke="#F6E2A8" strokeWidth={4} fill="none" opacity={0.7} />
        <rect x={1740} y={640} width={26} height={100} fill="#EDE3CC" stroke="#2B1D14" strokeWidth={4} />
        <ellipse cx={1753} cy={742} rx={34} ry={8} fill="#8C6B3A" stroke="#2B1D14" strokeWidth={4} />
      </g>
      {/* candle flame (unfiltered so it stays crisp) */}
      <g transform={`translate(1753 636) scale(${1 + flick * 0.08} ${1 + flick * 0.15})`}>
        <path d="M0 -40 Q14 -14 8 0 Q0 6 -8 0 Q-14 -14 0 -40 Z" fill="#FFD27A" />
        <path d="M0 -26 Q6 -10 3 -2 Q0 1 -3 -2 Q-6 -10 0 -26 Z" fill="#FFF5D6" />
      </g>
      <circle cx={1753} cy={620} r={420} fill="url(#candle)" opacity={0.85 + flick * 0.15} />
      {/* floor */}
      <rect x={-40} y={FLOOR} width={2040} height={200} fill="url(#floor)" />
      <g stroke="#1A120C" strokeWidth={3} opacity={0.7}>
        {Array.from({length: 14}, (_, i) => <path key={i} d={`M${-100 + i * 160} ${FLOOR} L${-300 + i * 200} 1080`} />)}
      </g>
    </g>
  );
};

const Chair: React.FC<{x: number; y: number; part: 'back' | 'front'}> = ({x, y, part}) => (
  part === 'back' ? (
    <g filter="url(#soft)" stroke="#2B1D14" strokeWidth={5} strokeLinejoin="round">
      <rect x={x - 82} y={y - 230} width={22} height={230 + 205} fill="#4E3421" />
      <rect x={x - 90} y={y - 240} width={38} height={18} rx={6} fill="#5E4230" />
      <path d={`M${x - 70} ${y - 180} h40 M${x - 70} ${y - 120} h40`} stroke="#3A2618" strokeWidth={10} />
      <rect x={x - 90} y={y + 10} width={230} height={26} rx={6} fill="#6B4A31" />
      <rect x={x - 76} y={y + 36} width={18} height={170} fill="#4E3421" />
    </g>
  ) : (
    <g filter="url(#soft)" stroke="#2B1D14" strokeWidth={5} strokeLinejoin="round">
      <rect x={x + 110} y={y + 36} width={20} height={170} fill="#5A3D27" />
      <rect x={x - 70} y={y - 46} width={200} height={16} rx={7} fill="#6B4A31" />
      <rect x={x + 108} y={y - 32} width={14} height={68} fill="#5A3D27" />
    </g>
  )
);

// ---------- shots ----------
type Shot = {from: number; to: number; z0: number; z1: number; f0: [number, number]; f1: [number, number]};
const SHOTS: Shot[] = [
  {from: 0, to: 76, z0: 1.0, z1: 1.07, f0: [990, 560], f1: [960, 555]},
  {from: 76, to: 190, z0: 1.9, z1: 2.05, f0: [1205, 450], f1: [1205, 440]},
  {from: 190, to: 290, z0: 2.65, z1: 2.85, f0: [745, 452], f1: [740, 448]},
  {from: 290, to: 361, z0: 1.1, z1: 1.16, f0: [960, 560], f1: [960, 565]},
];

export const BarberScene: React.FC = () => {
  useFonts();
  const real = useCurrentFrame();
  const frozen = real >= FREEZE;
  const f = frozen ? FREEZE : real;
  const shot = SHOTS.find((s) => real >= s.from && real < s.to) ?? SHOTS[SHOTS.length - 1];
  const sp = interpolate(real, [shot.from, shot.to], [0, 1], clamp);
  const zoom = shot.z0 + (shot.z1 - shot.z0) * sp;
  const fx = shot.f0[0] + (shot.f1[0] - shot.f0[0]) * sp;
  const fy = shot.f0[1] + (shot.f1[1] - shot.f0[1]) * sp;
  const flick = (Math.sin(f * 0.9) + Math.sin(f * 1.7 + 1) * 0.5 + Math.sin(f * 3.1) * 0.3) / 1.8;

  // ----- lip sync -----
  const li = f - lip.start;
  const open = li >= 0 && li < lip.env.length ? (lip.env as number[])[li] : 0;
  const talking = li >= 0 && li < lip.env.length;

  // ----- Tom -----
  const fearT = spring(f, 212, 0.35, 0.12);
  const fearOn = f >= 212;
  const recoil = fearOn ? Math.exp(-(f - 212) / 10) : 0;
  const shake = (fearOn ? recoil * 9 : 0) * Math.sin(real * 3.3);
  const grip = interpolate(f, [292, 304], [0, 1], clamp);
  const tomHead: HeadPose = restHead({
    turn: 0.6,
    lookX: fearOn ? 0.9 : 0.5, lookY: fearOn ? -0.1 : 0,
    eyes: fearOn ? 'fear' : 'dot', eyePop: fearOn ? Math.max(0, 1 - fearT) * 2 + 0.15 : 0,
    blink: blinkAt(f, [30, 150]),
    browInner: fearOn ? 1 : 0.7, browHeight: fearOn ? 1.2 * Math.min(1, fearT) : 0.1,
    mouth: fearOn ? 'fear' : 'zigzag', open: fearOn ? 0.55 + 0.1 * Math.sin(f * 0.6) : 0,
    swell: 1, tilt: fearOn ? -6 * Math.min(1, fearT) : 5,
    sweat: interpolate(f, [236, 300], [0, 1], clamp) - (f < 236 ? 2 : 0),
    gulp: interpolate(f, [250, 262], [0, 1], clamp) * (f < 262 ? 1 : 0),
  });
  const knee = fearOn ? 0 : Math.sin(f * 0.85) * 0.07; // nervous knee bounce
  const cheekHand: [number, number] = [74, -196];
  const chairHandF: [number, number] = [96, -26];
  const tomPose: Pose = {
    legF: [1.42 + knee + grip * 0.12, 1.42 + grip * 0.2], legB: [1.3, 1.3],
    handF: [cheekHand[0] + (chairHandF[0] - cheekHand[0]) * grip, cheekHand[1] + (chairHandF[1] - cheekHand[1]) * grip],
    handB: [56, -28], elbowF: 1, elbowB: 1,
    lean: -3 - (fearOn ? 9 * Math.min(1, fearT) : 0), bob: Math.sin(f * 0.12) * 1.5 + (fearOn ? -recoil * 6 : 0),
    squash: fearOn ? -recoil * 0.05 : 0, apronSway: knee * 20,
    head: tomHead, frame: f,
  };

  // ----- Barber -----
  const lookUp = interpolate(f, [44, 56], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const antic = interpolate(f, [96, 104], [0, 1], clamp) * (f < 104 ? 1 : 0); // dip before the raise
  const raise = spring(f, 104, 0.3, 0.14);
  const polish = f < 60 ? Math.sin(f * 0.5) * 10 : 0;
  const bStep = interpolate(f, [294, 320], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const bx = 1262 - bStep * 140;
  const stepPh = bStep * Math.PI * 2;
  const walking = f >= 294 && f < 320 ? 1 : 0;
  const sly = !talking || open < 0.05;
  const barberHead: HeadPose = restHead({
    turn: 0.7, lookX: 0.3, lookY: 1 - lookUp,
    eyes: 'sly', blink: blinkAt(f, [22, 70, 178, 300]),
    browInner: -0.3 + (f > 150 && f < 190 ? 0.6 : 0), browHeight: f > 150 && f < 190 ? 0.9 : 0.2,
    mouth: talking && open > 0.04 ? 'talk' : f > 290 ? 'grin' : sly && f > 56 ? 'smile' : 'line', open: talking ? open : 0.2,
    tilt: -6 * (1 - lookUp) + (talking ? Math.sin(f * 0.3) * 2 : 0),
  });
  const handUpT = Math.min(1.15, raise);
  const restHand: [number, number] = [60 + polish * 0.2, -64];
  const upHand: [number, number] = [104, -172];
  const handF: [number, number] = [
    restHand[0] + (upHand[0] - restHand[0]) * handUpT - antic * 8,
    restHand[1] + (upHand[1] - restHand[1]) * handUpT + antic * 30,
  ];
  const barberPose: Pose = {
    legF: [walking * 0.35 * Math.sin(stepPh) + 0.04, walking * 0.4 * Math.max(0, Math.sin(stepPh + 1))],
    legB: [-walking * 0.35 * Math.sin(stepPh) - 0.04, walking * 0.4 * Math.max(0, Math.sin(stepPh + 1 + Math.PI))],
    handF, handB: f < 60 ? [54 - polish, -58] : [30, 40], elbowF: 1, elbowB: 1,
    lean: 4 + lookUp * -3 + raise * 3 - antic * 4, bob: Math.sin(f * 0.1) * 2 - walking * Math.abs(Math.cos(stepPh)) * 6,
    apronSway: Math.sin(f * 0.1) * 1.5 + walking * Math.sin(stepPh) * 6,
    head: barberHead, frame: f,
  };
  const glint = interpolate(f, [118, 124, 134], [0, 1.2, 0], clamp) + interpolate(f, [300, 306, 316], [0, 1, 0], clamp);
  const pliersAng = -10 - 30 * Math.min(1, handUpT);

  // captions for the spoken line
  const sub = (lip.subs as {text: string; start: number; end: number}[]).find((s) => f >= s.start && f <= s.end + 8);

  // freeze-frame label
  const lab = interpolate(real, [FREEZE + 2, FREEZE + 14], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const flash = frozen ? interpolate(real, [FREEZE, FREEZE + 4], [0.7, 0], clamp) : 0;

  const camT = `translate(960 540) scale(${zoom}) translate(${-fx + shake} ${-fy})`;
  const fgT = `translate(960 540) scale(${zoom}) translate(${-fx * 1.25 + 240} ${-fy})`;

  return (
    <AbsoluteFill style={{backgroundColor: '#120B08'}}>
      <Audio src={staticFile('barber_mix.wav')} />
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Defs f={real} frozen={frozen} />
        <g filter={frozen ? 'url(#freeze)' : undefined}>
          <g transform={camT}>
            <Interior f={f} flick={flick} />
            <Chair x={700} y={700} part="back" />
            <g transform={`translate(700 700) scale(1.15)`} filter="url(#soft)">
              <Puppet L={TOM} p={tomPose} gripF={grip > 0.5} gripB />
            </g>
            <Chair x={700} y={700} part="front" />
            {/* barber, flipped to face Tom */}
            <ellipse cx={bx} cy={FLOOR + 2} rx={110} ry={14} fill="#0E0805" opacity={0.45} />
            <ellipse cx={810} cy={FLOOR + 2} rx={140} ry={16} fill="#0E0805" opacity={0.4} />
            <g transform={`translate(${bx} 690) scale(-1.25 1.25)`} filter="url(#soft)">
              <Puppet L={BARBER} p={barberPose} propF={<Pliers glint={glint} />} propAngF={pliersAng - (Math.atan2(handF[1] - (-132), handF[0] + 26) * 180) / Math.PI * 0} gripF />
            </g>
            {/* warm rim light from the candle over everything */}
            <rect x={-200} y={-200} width={2400} height={1500} fill="#FFB866" opacity={0.05 + flick * 0.015} />
          </g>
          {/* foreground: hanging herb bundle, blurred, faster parallax */}
          <g transform={fgT} filter="url(#blurFg)" opacity={0.95}>
            <path d="M120 -40 V120" stroke="#1A120C" strokeWidth={6} />
            <path d="M80 120 L120 330 L170 120 Z" fill="#2A2A16" />
            <path d="M60 140 L118 300 L100 130 Z" fill="#33331B" />
          </g>
        </g>

        {/* spoken line caption */}
        {sub && !frozen && (
          <g>
            <rect x={960 - sub.text.length * 13} y={940} width={sub.text.length * 26} height={64} rx={8} fill="#120B08" opacity={0.72} />
            <text x={960} y={984} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={44} fill="#F3E7CF">{sub.text}</text>
          </g>
        )}

        {/* freeze label (comedy beat) */}
        {frozen && (
          <g transform={`translate(${170 + (1 - lab) * -60} 150) rotate(-4) scale(${0.55 + 0.3 * lab})`} opacity={Math.min(1, lab * 1.5)}>
            <rect x={-30} y={-90} width={760} height={200} fill="#EFE3C6" stroke="#2B1D14" strokeWidth={6} />
            <rect x={-30} y={-90} width={760} height={200} filter="url(#brush)" fill="#EFE3C6" />
            <text x={0} y={-10} fontFamily="FrauncesBlack" fontWeight={900} fontSize={84} fill="#2B1D14">TOM, 15.</text>
            <text x={2} y={66} fontFamily="FellItalic" fontStyle="italic" fontSize={50} fill="#7E2119">Starting to regret this.</text>
          </g>
        )}
        <rect width={1920} height={1080} fill="#fff" opacity={flash} />
        <rect width={1920} height={1080} fill="url(#vig)" />
        <rect width={1920} height={1080} filter="url(#grain)" />
        <rect width={1920} height={1080} fill="#000" opacity={interpolate(real, [0, 8], [1, 0], clamp) + interpolate(real, [350, 360], [0, 1], clamp)} />
      </svg>
    </AbsoluteFill>
  );
};
