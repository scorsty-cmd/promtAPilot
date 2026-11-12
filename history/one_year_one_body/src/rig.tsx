// History Sourced puppet rig v2 — reusable cut-out character for every episode.
// Local origin = pelvis (0,0), +y down, character faces +x. Flip with scale(-1,1) outside.
import React from 'react';

export type Look = {
  skin: string; shade: string; outline: string;
  shirt: string; shirtShade: string; vest?: string; breeches: string; stocking: string; shoe: string;
  apron?: string; apronLine?: string;
  hair: 'tuft' | 'ring' | 'none'; hairColor: string;
  moustache?: string; specs?: boolean; band?: string; bandDark?: string;
  belly?: number; // 0 slim .. 1 stout
  blush?: string;
  // v3 additions
  cap?: 'coif' | 'baker' | 'tall' | 'felt' | 'souwester' | 'peaked' | 'knit' | 'visor' | 'nightcap'; capColor?: string;
  // v5 additions
  garters?: string; bowtie?: string; shawl?: string;
  // v4 additions
  sideburns?: string; monocle?: boolean; noStrap?: boolean; collar?: string; buttons?: string;
  skirt?: string; skirtShade?: string; // long skirt hides the legs (women)
  gown?: string; // long coat to the knees (physician, schoolmaster)
  beard?: string; // short full beard
  wrinkles?: boolean; scale?: number;
};

export type Mouth = 'line' | 'smile' | 'grin' | 'zigzag' | 'talk' | 'O' | 'fear' | 'E' | 'S' | 'M' | 'frown' | 'gap' | 'F';
export type Eyes = 'dot' | 'squeeze' | 'fear' | 'sly' | 'happy' | 'dizzy' | 'half';

export type HeadPose = {
  tilt: number; turn: number; // turn 0 = front, 1 = 3/4 toward +x
  lookX: number; lookY: number;
  eyes: Eyes; blink: number; eyePop?: number;
  browInner: number; browHeight: number; // inner>0 worried, <0 angry
  mouth: Mouth; open: number;
  swell?: number; // swollen near cheek (toothache)
  sweat?: number; // 0..1 sweat drop travel, <0 hidden
  gulp?: number;
};

export type Pose = {
  legF: [number, number]; legB: [number, number]; // [hip, knee] radians, hip 0 = straight down, + = forward
  handF: [number, number]; handB: [number, number]; // targets relative to pelvis
  elbowF?: 1 | -1; elbowB?: 1 | -1;
  lean: number; // degrees, + = forward
  bob: number; squash?: number; apronSway?: number;
  head: HeadPose;
  frame: number;
};

const THIGH = 88, SHIN = 88, UP = 66, FORE = 66;
const rad = (d: number) => (d * Math.PI) / 180;

const ik = (sx: number, sy: number, tx: number, ty: number, l1: number, l2: number, bend: 1 | -1) => {
  let dx = tx - sx, dy = ty - sy;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 0.5;
  if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
  const minD = Math.abs(l1 - l2) + 8;
  if (d < minD) { const k = minD / Math.max(d, 0.01); dx *= k; dy *= k; d = minD; }
  const a = Math.atan2(dy, dx);
  const b = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  return {ex: sx + Math.cos(a + bend * b) * l1, ey: sy + Math.sin(a + bend * b) * l1, hx: sx + dx, hy: sy + dy};
};

const Seg: React.FC<{p: number[][]; w: number; c: string; w2?: number; c2?: string; ink: string}> = ({p, w, c, w2, c2, ink}) => (
  <g strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d={`M${p[0][0]} ${p[0][1]} L${p[1][0]} ${p[1][1]} L${p[2][0]} ${p[2][1]}`} stroke={ink} strokeWidth={Math.max(w, w2 ?? w) + 10} />
    <path d={`M${p[1][0]} ${p[1][1]} L${p[2][0]} ${p[2][1]}`} stroke={c2 ?? c} strokeWidth={w2 ?? w} />
    <path d={`M${p[0][0]} ${p[0][1]} L${p[1][0]} ${p[1][1]}`} stroke={c} strokeWidth={w} />
  </g>
);

// mitten hand: palm + thumb, oriented along the forearm; children = held prop.
// v3 hand poses: mitt (default), point (index finger), open (spread palm), fist
export type HandPose = 'mitt' | 'point' | 'open' | 'fist';
const Hand: React.FC<{x: number; y: number; ang: number; skin: string; ink: string; grip?: boolean; children?: React.ReactNode; propAng?: number; pose?: HandPose}> = ({x, y, ang, skin, ink, grip, children, propAng = 0, pose = 'mitt'}) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    {children && <g transform={`rotate(${propAng})`}>{children}</g>}
    {pose === 'point' && <rect x={10} y={-6} width={34} height={12} rx={6} fill={skin} stroke={ink} strokeWidth={4.5} />}
    {pose === 'open' && [-14, -4, 6].map((yy, i) => <rect key={i} x={12} y={yy - 3} width={26 - i * 2} height={10} rx={5} fill={skin} stroke={ink} strokeWidth={4} transform={`rotate(${(i - 1) * 16} 12 ${yy})`} />)}
    <ellipse cx={7} cy={0} rx={pose === 'fist' ? 15 : 17} ry={pose === 'fist' ? 15 : 14} fill={skin} stroke={ink} strokeWidth={5} />
    {pose === 'fist' ? <path d="M12 -8 q6 8 0 16 M4 -10 q6 10 0 20" stroke={ink} strokeWidth={3} fill="none" /> : (
      <ellipse cx={grip ? 10 : 4} cy={grip ? -10 : -13} rx={7} ry={grip ? 6 : 9} transform={`rotate(${grip ? 10 : -30} 4 -12)`} fill={skin} stroke={ink} strokeWidth={4.5} />
    )}
    {grip && pose === 'mitt' && <path d="M14 -6 q6 6 0 12" stroke={ink} strokeWidth={3} fill="none" />}
  </g>
);

export const Head: React.FC<{h: HeadPose; L: Look; frame: number}> = ({h, L, frame}) => {
  const t = h.turn;
  const ink = L.outline;
  const exF = 24 + 16 * t, exB = -24 + 22 * t; // near / far eye x
  const ey = -8;
  const mx = 6 + 12 * t;
  const swell = h.swell ?? 0;
  const pop = 1 + (h.eyePop ?? 0) * 0.35;
  const trem = h.eyes === 'fear' ? Math.sin(frame * 2.3) * 1.4 : 0;
  const eye = (cx: number, far: boolean) => {
    const sx = far ? 1 - 0.22 * t : 1;
    if (h.eyes === 'squeeze') {
      const d = far ? `M${cx - 9} -16 L${cx + 5} -8 L${cx - 9} 0` : `M${cx + 9} -16 L${cx - 5} -8 L${cx + 9} 0`;
      return <path d={d} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    }
    if (h.eyes === 'fear') {
      return (
        <g transform={`translate(${cx} ${ey}) scale(${sx * pop} ${pop})`}>
          <ellipse rx={15} ry={19} fill="#FFFDF6" stroke={ink} strokeWidth={4.5} />
          <circle cx={h.lookX * 6 + trem} cy={h.lookY * 7} r={4.2} fill={ink} />
        </g>
      );
    }
    if (h.eyes === 'happy') {
      return <path transform={`translate(${cx} ${ey}) scale(${sx} 1)`} d="M-11 4 Q0 -12 11 4" stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    }
    if (h.eyes === 'dizzy') {
      const r0 = frame * 0.35 * (far ? -1 : 1);
      return (
        <g transform={`translate(${cx} ${ey}) scale(${sx} 1) rotate(${(r0 * 180) / Math.PI})`}>
          <path d="M0 0 m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -9 0 a8 8 0 1 1 15 0 a11 11 0 1 1 -21 0" stroke={ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </g>
      );
    }
    if (h.eyes === 'half') {
      return (
        <g transform={`translate(${cx + h.lookX * 3} ${ey + h.lookY * 3}) scale(${sx} 1)`}>
          <ellipse rx={7} ry={11} fill={ink} />
          <rect x={-11} y={-16} width={22} height={13} fill={L.skin} />
          <path d="M-11 -3 H11" stroke={ink} strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    }
    const ry = Math.max(1.2, 13 * (1 - h.blink));
    return (
      <g transform={`translate(${cx + h.lookX * 3} ${ey + h.lookY * 3}) scale(${sx} 1)`}>
        <ellipse rx={7} ry={ry} fill={ink} />
        {h.blink < 0.5 && <circle cx={2} cy={-5} r={2.2} fill="#fff" />}
        {h.eyes === 'sly' && <path d="M-11 -4 Q0 -9 11 -4" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />}
        {h.eyes === 'sly' && <rect x={-10} y={-16} width={20} height={12} fill={L.skin} />}
      </g>
    );
  };
  const bY = -36 - h.browHeight * 10;
  const bi = h.browInner * 11;
  // mouth
  const o = h.open;
  let mouth: React.ReactNode;
  if (h.mouth === 'talk' || h.mouth === 'O') {
    const w = h.mouth === 'O' ? 9 + 4 * o : 11 + 6 * o;
    const hh = 3 + 15 * o;
    mouth = (
      <g>
        <ellipse cx={mx} cy={47} rx={w} ry={hh} fill="#4A1A14" stroke={ink} strokeWidth={4.5} />
        {o > 0.35 && h.mouth === 'talk' && <rect x={mx - w + 4} y={47 - hh + 2} width={2 * w - 8} height={4} rx={2} fill="#F7F1E4" />}
        {o > 0.25 && <ellipse cx={mx} cy={47 + hh * 0.55} rx={w * 0.55} ry={hh * 0.3} fill="#C9574A" />}
      </g>
    );
  } else if (h.mouth === 'fear') {
    const hh = 6 + 12 * o;
    mouth = (
      <g>
        <rect x={mx - 20} y={47 - hh / 2} width={40} height={hh} rx={6} fill="#4A1A14" stroke={ink} strokeWidth={4.5} />
        <rect x={mx - 17} y={47 - hh / 2 + 2} width={34} height={Math.min(7, hh / 2)} fill="#F7F1E4" />
        <path d={`M${mx - 6} ${47 - hh / 2 + 2} v${Math.min(7, hh / 2)} M${mx + 6} ${47 - hh / 2 + 2} v${Math.min(7, hh / 2)}`} stroke="#B9AE98" strokeWidth={2} />
      </g>
    );
  } else if (h.mouth === 'zigzag') {
    const w = 26;
    const pts = Array.from({length: 7}, (_, i) => `${mx - w / 2 + (w / 6) * i} ${48 + (i % 2 ? 1 : -1) * (4 + 2 * Math.sin(frame * 0.9 + i))}`);
    mouth = <path d={`M${pts.join(' L')}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  } else if (h.mouth === 'grin') {
    mouth = (
      <g>
        <path d={`M${mx - 22} 40 Q${mx} ${64 + o * 8} ${mx + 22} 40 Z`} fill="#4A1A14" stroke={ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d={`M${mx - 18} 42 Q${mx} 47 ${mx + 18} 42 L${mx + 16} 47 Q${mx} 51 ${mx - 16} 47 Z`} fill="#F7F1E4" />
      </g>
    );
  } else if (h.mouth === 'E') {
    // wide "ee": stretched, teeth visible
    const w = 17 + 5 * o, hh = 3 + 8 * o;
    mouth = (
      <g>
        <rect x={mx - w} y={47 - hh} width={2 * w} height={2 * hh} rx={hh} fill="#4A1A14" stroke={ink} strokeWidth={4.5} />
        <rect x={mx - w + 5} y={47 - hh + 1.5} width={2 * w - 10} height={Math.min(5, hh)} rx={2} fill="#F7F1E4" />
      </g>
    );
  } else if (h.mouth === 'S') {
    // s/f/th: teeth together, lips slightly apart
    const w = 13 + 2 * o;
    mouth = (
      <g>
        <rect x={mx - w} y={41} width={2 * w} height={12} rx={6} fill="#F7F1E4" stroke={ink} strokeWidth={4.5} />
        <path d={`M${mx - w + 3} 47 H${mx + w - 3}`} stroke="#B9AE98" strokeWidth={2} />
      </g>
    );
  } else if (h.mouth === 'F') {
    // v4: f/v lip-bite — upper teeth resting on the lower lip
    mouth = (
      <g>
        <path d={`M${mx - 13} 44 Q${mx} 40 ${mx + 13} 44 L${mx + 12} 52 Q${mx} 56 ${mx - 12} 52 Z`} fill="#4A1A14" stroke={ink} strokeWidth={4.5} strokeLinejoin="round" />
        <rect x={mx - 10} y={42} width={20} height={6} rx={2} fill="#F7F1E4" />
        <path d={`M${mx - 12} 51 Q${mx} 47 ${mx + 12} 51`} stroke="#C9574A" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    );
  } else if (h.mouth === 'M') {
    mouth = <path d={`M${mx - 12} 46 Q${mx} 50 ${mx + 12} 46`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
  } else if (h.mouth === 'frown') {
    mouth = <path d={`M${mx - 13} 52 Q${mx} 40 ${mx + 13} 52`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
  } else if (h.mouth === 'gap') {
    // big grin with one missing tooth (after the extraction)
    mouth = (
      <g>
        <path d={`M${mx - 24} 40 Q${mx} ${66 + o * 6} ${mx + 24} 40 Z`} fill="#4A1A14" stroke={ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d={`M${mx - 20} 42 Q${mx} 47 ${mx + 20} 42 L${mx + 18} 48 Q${mx} 52 ${mx - 18} 48 Z`} fill="#F7F1E4" />
        <rect x={mx + 3} y={42} width={9} height={8} fill="#4A1A14" />
      </g>
    );
  } else {
    const c = h.mouth === 'smile' ? 10 : 4;
    mouth = <path d={`M${mx - 11} 45 Q${mx} ${45 + c} ${mx + 11} 45`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
  }
  const sweat = h.sweat ?? -1;
  const gulp = h.gulp ?? 0;
  return (
    <g transform={`rotate(${h.tilt} 0 60)`}>
      {L.hair === 'tuft' && <path d={`M${-58 + 30 * (1 - t)} -52 q-22 10 -18 34 q10 -10 22 -8 q-12 14 -6 30 q12 -16 26 -14`} fill={L.hairColor} stroke={ink} strokeWidth={5} strokeLinejoin="round" />}
      {/* head outline as union with swollen cheek */}
      <g stroke={ink} strokeWidth={13} fill="none">
        {swell > 0 && <ellipse cx={54 + 4 * t} cy={32} rx={22 + 8 * swell} ry={22 + 7 * swell} />}
        <ellipse cx={0} cy={0} rx={72} ry={88} />
      </g>
      <g fill={L.skin}>
        {swell > 0 && <ellipse cx={54 + 4 * t} cy={32} rx={22 + 8 * swell} ry={22 + 7 * swell} />}
        <ellipse cx={0} cy={0} rx={72} ry={88} />
      </g>
      <ellipse cx={-36 + 10 * t} cy={26} rx={36} ry={52} fill={L.shade} opacity={0.45} />
      {L.hair === 'ring' && (
        <g fill={L.hairColor} stroke={ink} strokeWidth={4.5} strokeLinejoin="round">
          <path d={`M-71 -12 q-10 30 4 58 q10 -14 8 -30 q8 10 16 6 q-12 -20 -10 -42 Z`} />
          {t < 0.6 && <path d={`M71 -12 q10 30 -4 58 q-10 -14 -8 -30 q-8 10 -16 6 q12 -20 10 -42 Z`} />}
        </g>
      )}
      {/* ear */}
      <ellipse cx={-66 + 44 * t} cy={10} rx={10} ry={15} fill={L.skin} stroke={ink} strokeWidth={4.5} />
      {t < 0.25 && <ellipse cx={66} cy={10} rx={10} ry={15} fill={L.skin} stroke={ink} strokeWidth={4.5} />}
      {swell > 0 && <ellipse cx={56 + 4 * t} cy={32} rx={18 + 5 * swell} ry={14 + 5 * swell} fill="#D96A55" opacity={0.25 + 0.4 * swell} />}
      {L.blush && <ellipse cx={exF + 12} cy={24} rx={11} ry={7} fill={L.blush} opacity={0.55} />}
      {L.beard && <path d={`M-60 20 Q-58 96 ${mx} 104 Q${70 + 4 * t} 96 ${66 - 4 * (1 - t)} 20 Q${50} 64 ${mx} 66 Q-40 64 -60 20 Z`} fill={L.beard} stroke={ink} strokeWidth={4.5} strokeLinejoin="round" />}
      {L.sideburns && <g fill={L.sideburns} stroke={ink} strokeWidth={4} strokeLinejoin="round">
        <path d={`M${-70 + 30 * t} -20 Q${-80 + 30 * t} 40 ${-50 + 30 * t} 70 Q${-40 + 30 * t} 40 ${-52 + 30 * t} -16 Z`} />
        {t < 0.7 && <path d="M70 -20 Q80 40 50 70 Q40 40 52 -16 Z" />}
      </g>}
      {L.wrinkles && <g stroke={ink} strokeWidth={2.5} fill="none" opacity={0.55}><path d={`M${exF + 14} 6 q8 4 10 12`} /><path d={`M${exB - 18} 6 q-6 4 -8 12`} /><path d={`M-20 -52 q20 -6 40 0`} /></g>}
      {eye(exB, true)}
      {eye(exF, false)}
      <g stroke={ink} strokeWidth={6} strokeLinecap="round">
        <path d={`M${exB - 15} ${bY} L${exB + 11} ${bY - bi}`} />
        <path d={`M${exF - 11} ${bY - bi} L${exF + 15} ${bY}`} />
      </g>
      {L.specs && (
        <g stroke={ink} strokeWidth={4} fill="#DCEAF0" fillOpacity={0.25}>
          <circle cx={exB} cy={ey} r={17} />
          <circle cx={exF} cy={ey} r={18} />
          <path d={`M${exB + 17} ${ey - 2} Q${(exB + exF) / 2} ${ey - 9} ${exF - 18} ${ey - 2}`} fill="none" />
          <path d={`M${exF + 6} ${ey - 12} l6 6`} stroke="#fff" strokeWidth={3} />
        </g>
      )}
      {L.monocle && (
        <g>
          <circle cx={exF} cy={ey} r={20} fill="#DCEAF0" fillOpacity={0.3} stroke="#C9A35A" strokeWidth={4.5} />
          <path d={`M${exF + 14} ${ey + 14} Q${exF + 30} 60 ${exF + 10} 110`} stroke="#C9A35A" strokeWidth={2.5} fill="none" />
          <path d={`M${exF + 4} ${ey - 12} l7 6`} stroke="#fff" strokeWidth={3} />
        </g>
      )}
      {mouth}
      {L.moustache && (
        <path transform={`translate(${mx} ${36 - o * 3})`} d="M0 -2 C-10 -10 -26 -8 -34 2 C-38 8 -44 6 -46 0 C-42 14 -24 14 -12 6 C-6 2 -2 2 0 4 C2 2 6 2 12 6 C24 14 42 14 46 0 C44 6 38 8 34 2 C26 -8 10 -10 0 -2 Z" fill={L.moustache} stroke={ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      {L.cap === 'coif' && (
        <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
          <path d={`M-78 30 C-96 -60 -40 -104 4 -102 C52 -100 ${92 - 10 * t} -60 ${70 - 6 * t} 26 C${56} -30 30 -62 0 -62 C-34 -62 -60 -30 -64 30 Z`} fill={L.capColor ?? '#F4EFE4'} />
          <path d={`M-70 0 C-60 -50 -20 -70 10 -70`} stroke="#CFC6B4" strokeWidth={3} fill="none" />
        </g>
      )}
      {L.cap === 'baker' && (
        <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
          <path d="M-70 -46 C-80 -110 -20 -132 6 -120 C40 -138 86 -110 72 -46 Q0 -30 -70 -46 Z" fill={L.capColor ?? '#F2EDE2'} />
          <path d="M-72 -50 Q0 -32 74 -50 L72 -36 Q0 -18 -70 -36 Z" fill="#E2DACB" />
          <path d="M-20 -110 q6 30 0 58 M24 -116 q6 30 2 62" stroke="#CFC6B4" strokeWidth={3} fill="none" />
        </g>
      )}
      {L.cap === 'tall' && (
        <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
          <ellipse cx={0} cy={-66} rx={104} ry={20} fill={L.capColor ?? '#1F1A18'} />
          <path d="M-52 -70 L-44 -190 Q0 -200 44 -190 L56 -70 Z" fill={L.capColor ?? '#1F1A18'} />
          <path d="M-50 -96 Q0 -88 52 -96 L52 -82 Q0 -74 -50 -82 Z" fill="#6B5A3A" />
        </g>
      )}
      {L.cap === 'souwester' && (
        <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
          {/* oilskin sou'wester: long back brim over the neck, short front brim, seams */}
          <path d={`M${-104 + 20 * t} -40 Q${-120 + 20 * t} 30 ${-84 + 20 * t} 64 Q${-62 + 16 * t} 20 ${-60} -34 Z`} fill={L.capColor ?? '#E2B23A'} />
          <path d="M-74 -40 C-80 -112 -24 -134 8 -132 C52 -130 84 -100 78 -42 Q0 -26 -74 -40 Z" fill={L.capColor ?? '#E2B23A'} />
          <path d={`M-88 -44 Q0 -24 ${96 + 6 * t} -48 Q${104 + 6 * t} -34 ${92 + 6 * t} -26 Q0 -8 -86 -30 Z`} fill={L.capColor ?? '#E2B23A'} />
          <path d="M-20 -126 Q-10 -80 -14 -38 M30 -128 Q40 -84 34 -36" stroke="#A57E22" strokeWidth={3} fill="none" />
          <path d="M-60 -96 Q-30 -116 6 -118" stroke="#FFF1B8" strokeWidth={6} fill="none" opacity={0.6} />
          {!L.noStrap && <path d={`M${60 + 4 * t} -30 Q${54 + 4 * t} 40 ${30} 92`} stroke="#6B4A2F" strokeWidth={3} fill="none" />}
        </g>
      )}
      {L.cap === 'peaked' && (
        <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
          <path d="M-70 -50 C-76 -104 -30 -118 6 -118 C50 -118 84 -100 78 -50 Q0 -36 -70 -50 Z" fill={L.capColor ?? '#1E2A3E'} />
          <path d={`M${10 + 20 * t} -52 Q${70 + 30 * t} -54 ${104 + 20 * t} -34 Q${60 + 20 * t} -30 ${0 + 20 * t} -40 Z`} fill="#141414" />
          <path d="M-70 -58 Q0 -44 78 -58" stroke="#C9A35A" strokeWidth={6} fill="none" />
          <circle cx={6 + 20 * t} cy={-80} r={8} fill="#C9A35A" strokeWidth={3} />
        </g>
      )}
      {L.cap === 'knit' && (
        <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
          <path d="M-72 -36 C-80 -116 -10 -138 10 -134 C60 -128 86 -96 76 -36 Q0 -22 -72 -36 Z" fill={L.capColor ?? '#7A8086'} />
          <path d="M-74 -40 Q0 -24 78 -40 L76 -18 Q0 -2 -72 -16 Z" fill={L.capColor ?? '#7A8086'} />
          {[-50, -26, -2, 22, 46].map((x) => <path key={x} d={`M${x} -36 v18`} stroke="#4A5056" strokeWidth={3} />)}
        </g>
      )}
      {L.cap === 'felt' && (
        <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
          <path d="M-96 -52 Q0 -86 100 -52 Q0 -34 -96 -52 Z" fill={L.capColor ?? '#3E3328'} />
          <path d="M-56 -60 Q-50 -128 4 -130 Q56 -128 58 -60 Q0 -48 -56 -60 Z" fill={L.capColor ?? '#3E3328'} />
        </g>
      )}
      {L.cap === 'visor' && (
        <g stroke={ink} strokeLinejoin="round">
          {/* v5: telegrapher's green celluloid eyeshade — headband + translucent brim that tints the eyes */}
          <path d={`M-74 -44 Q0 -64 76 -44 L74 -30 Q0 -50 -72 -30 Z`} fill="#1E3A2A" strokeWidth={4} />
          <path d={`M${-70 + 34 * t} -42 Q${8 + 30 * t} -60 ${86 + 40 * t} -38 L${118 + 46 * t} -6 Q${30 + 34 * t} -26 ${-62 + 30 * t} -14 Z`} fill={L.capColor ?? '#2F8F5A'} fillOpacity={0.62} strokeWidth={4.5} />
          <path d={`M${-50 + 32 * t} -24 Q${28 + 32 * t} -36 ${104 + 44 * t} -14`} stroke="#BFF2D2" strokeWidth={3} fill="none" opacity={0.55} />
        </g>
      )}
      {L.cap === 'nightcap' && (
        <g stroke={ink} strokeWidth={5} strokeLinejoin="round">
          <path d={`M-74 -54 C-84 -120 -10 -146 30 -132 C70 -120 ${-110 + Math.sin(frame * 0.12) * 8} -170 ${-128 + Math.sin(frame * 0.12) * 10} -96 C-100 -110 -60 -80 76 -58 Q0 -44 -74 -54 Z`} fill={L.capColor ?? '#F1ECE2'} />
          <path d="M-76 -60 Q0 -44 80 -62 L78 -46 Q0 -30 -74 -44 Z" fill="#E2D8C6" />
          <circle cx={-128 + Math.sin(frame * 0.12) * 10} cy={-96} r={12} fill="#C9574A" />
        </g>
      )}
      {L.band && (
        <g>
          <path d="M-4 -90 C -78 -78, -96 60, 4 96" stroke={ink} strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d="M-4 -90 C -78 -78, -96 60, 4 96" stroke={L.band} strokeWidth={24} fill="none" strokeLinecap="round" />
          <path d="M-12 -84 C -70 -70, -86 50, -2 86" stroke={L.bandDark} strokeWidth={4} fill="none" opacity={0.6} />
          <g transform={`rotate(${Math.sin(frame * 0.35) * 6} -6 -94)`}>
            <path d="M-6 -94 L-34 -132 L-12 -126 Z" fill={L.band} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M-6 -94 L18 -136 L22 -114 Z" fill={L.band} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={-6} cy={-94} r={11} fill={L.band} stroke={ink} strokeWidth={5} />
          </g>
        </g>
      )}
      {sweat >= 0 && sweat <= 1 && (
        <path transform={`translate(${-30 + 6 * sweat} ${-60 + sweat * 110}) scale(${1 + sweat * 0.3})`} d="M0 -12 Q9 2 0 9 Q-9 2 0 -12 Z" fill="#BFE3F2" stroke={ink} strokeWidth={3.5} opacity={1 - Math.max(0, sweat - 0.85) * 6} />
      )}
      {gulp > 0 && <ellipse cx={mx - 4} cy={100 + gulp * 20} rx={9} ry={7} fill={L.shade} stroke={ink} strokeWidth={3.5} opacity={Math.sin(gulp * Math.PI)} />}
    </g>
  );
};

export const Puppet: React.FC<{L: Look; p: Pose; propF?: React.ReactNode; propAngF?: number; gripF?: boolean; gripB?: boolean; front?: React.ReactNode; propB?: React.ReactNode; propAngB?: number; poseF?: HandPose; poseB?: HandPose}> = ({L, p, propF, propAngF, gripF, gripB, propB, propAngB, poseF, poseB}) => {
  const ink = L.outline;
  const belly = L.belly ?? 0;
  const lean = rad(p.lean);
  const rot = (x: number, y: number): [number, number] => [x * Math.cos(lean) - y * Math.sin(lean) * -1 * -1 + (-y) * Math.sin(lean) * 0, 0] as any;
  // rotate a torso point (x,y) around pelvis by lean (forward = toward +x)
  const R = (x: number, y: number): [number, number] => [x * Math.cos(lean) - y * Math.sin(lean), x * Math.sin(lean) + y * Math.cos(lean)];
  void rot;
  const by = p.bob;
  const shF = R(-26, -132); const shB = R(30, -136);
  shF[1] += by; shB[1] += by;
  const neck = R(8, -150); neck[1] += by;
  const head = R(10, -238); head[1] += by;
  const leg = ([hip, knee]: [number, number]) => {
    const kx = Math.sin(hip) * THIGH, ky = Math.cos(hip) * THIGH;
    const sa = hip - knee;
    return {k: [kx, ky + by * 0.3], f: [kx + Math.sin(sa) * SHIN, ky + by * 0.3 + Math.cos(sa) * SHIN], sa};
  };
  const lF = leg(p.legF), lB = leg(p.legB);
  const aF = ik(shF[0], shF[1], p.handF[0], p.handF[1] + by, UP, FORE, p.elbowF ?? 1);
  const aB = ik(shB[0], shB[1], p.handB[0], p.handB[1] + by, UP, FORE, p.elbowB ?? 1);
  const angF = (Math.atan2(aF.hy - aF.ey, aF.hx - aF.ex) * 180) / Math.PI;
  const angB = (Math.atan2(aB.hy - aB.ey, aB.hx - aB.ex) * 180) / Math.PI;
  const shoe = (f: number[], sa: number) => (
    <ellipse cx={f[0] + 12} cy={f[1] + 4} rx={25} ry={11} transform={`rotate(${-sa * 15} ${f[0]} ${f[1]})`} fill={L.shoe} stroke={ink} strokeWidth={5} />
  );
  const sq = p.squash ?? 0;
  return (
    <g transform={`scale(${1 - sq * 0.5} ${1 + sq}) `}>
      {/* back limbs */}
      <g opacity={0.93}>
        <Seg p={[shB, [aB.ex, aB.ey], [aB.hx, aB.hy]]} w={24} c={L.shirtShade} ink={ink} />
        <Hand x={aB.hx} y={aB.hy} ang={angB} skin={L.shade} ink={ink} grip={gripB} pose={poseB} propAng={propAngB}>{propB}</Hand>
        <Seg p={[[10, by * 0.5], lB.k, lB.f]} w={30} c={L.breeches} w2={22} c2={L.stocking} ink={ink} />
        {shoe(lB.f, lB.sa)}
      </g>
      <Seg p={[[-6, by * 0.5], lF.k, lF.f]} w={30} c={L.breeches} w2={22} c2={L.stocking} ink={ink} />
      {shoe(lF.f, lF.sa)}
      {L.skirt && (
        <g transform={`translate(0 ${by * 0.6})`}>
          <path d={`M-44 -20 Q0 -30 48 -20 L${78 + (p.apronSway ?? 0) * 2} 178 Q0 196 ${-74 + (p.apronSway ?? 0) * 2} 178 Z`} fill={L.skirt} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M-10 -10 L${-24 + (p.apronSway ?? 0)} 180 M22 -12 L${34 + (p.apronSway ?? 0)} 182`} stroke={L.skirtShade ?? ink} strokeWidth={4} opacity={0.5} />
        </g>
      )}
      {L.gown && (
        <g transform={`translate(0 ${by})`}>
          <path d={`M-46 -130 Q0 -146 50 -130 L${64 + (p.apronSway ?? 0)} 110 Q0 122 ${-60 + (p.apronSway ?? 0)} 110 Z`} fill={L.gown} stroke={ink} strokeWidth={6} strokeLinejoin="round" transform={`rotate(${p.lean} 0 0)`} />
        </g>
      )}
      {/* torso */}
      <g transform={`translate(0 ${by}) rotate(${p.lean} 0 0)`}>
        <path d={`M-42 -138 Q0 -150 46 -138 C ${50 + belly * 34} -90, ${48 + belly * 40} -30, 40 8 Q0 18 -40 8 C -44 -40, -46 -100, -42 -138 Z`} fill={L.shirt} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
        {L.vest && (
          <g fill={L.vest} stroke={ink} strokeWidth={5} strokeLinejoin="round">
            <path d={`M-36 -128 L-12 -128 L2 14 L-36 8 Z`} />
            <path d={`M42 -128 L18 -128 L6 14 C ${46 + belly * 36} -10, ${48 + belly * 36} -80, 42 -128 Z`} />
          </g>
        )}
        {L.shawl && <path d="M-46 -136 Q0 -116 50 -136 L54 -60 Q0 -30 -48 -60 Z" fill={L.shawl} stroke={ink} strokeWidth={5} strokeLinejoin="round" />}
        {L.bowtie && <path d="M4 -132 l-18 -10 v20 Z M4 -132 l18 -10 v20 Z" fill={L.bowtie} stroke={ink} strokeWidth={3.5} strokeLinejoin="round" />}
        {L.collar && <path d="M-36 -140 L-2 -104 L-10 -150 Z M44 -140 L10 -104 L18 -150 Z" fill={L.collar} stroke={ink} strokeWidth={4} strokeLinejoin="round" />}
        {L.buttons && [0, 1, 2, 3].map((i) => <g key={i}><circle cx={-18} cy={-96 + i * 26} r={4.5} fill={L.buttons} stroke={ink} strokeWidth={2} /><circle cx={22 + belly * 12} cy={-96 + i * 26} r={4.5} fill={L.buttons} stroke={ink} strokeWidth={2} /></g>)}
        {L.vest && [0, 1, 2].map((i) => <circle key={i} cx={-4 + belly * 10 * Math.sin((i + 1) * 0.9)} cy={-100 + i * 32} r={4} fill="#C9A35A" stroke={ink} strokeWidth={2} />)}
        {L.apron && (
          <g transform={`rotate(${p.apronSway ?? 0} 0 -40)`}>
            <path d={`M-30 -40 H${34 + belly * 20} L${42 + belly * 22} 90 Q4 102 -36 90 Z`} fill={L.apron} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M-32 -36 H${36 + belly * 20}`} stroke={L.apronLine ?? '#8C7552'} strokeWidth={5} />
          </g>
        )}
      </g>
      <rect x={neck[0] - 11} y={neck[1] - 26} width={22} height={30} fill={L.shade} stroke={ink} strokeWidth={5} />
      <g transform={`translate(${head[0]} ${head[1]})`}>
        <Head h={p.head} L={L} frame={p.frame} />
      </g>
      <Seg p={[shF, [aF.ex, aF.ey], [aF.hx, aF.hy]]} w={24} c={L.shirt} ink={ink} />
      {L.garters && (() => { const mx = shF[0] + (aF.ex - shF[0]) * 0.62, my = shF[1] + (aF.ey - shF[1]) * 0.62; const a = Math.atan2(aF.ey - shF[1], aF.ex - shF[0]); const px = -Math.sin(a) * 15, py = Math.cos(a) * 15; return <path d={`M${mx - px} ${my - py} L${mx + px} ${my + py}`} stroke={L.garters} strokeWidth={8} strokeLinecap="round" />; })()}
      <Hand x={aF.hx} y={aF.hy} ang={angF} skin={L.skin} ink={ink} grip={gripF} propAng={propAngF} pose={poseF}>{propF}</Hand>
    </g>
  );
};

// ---------- props ----------
export const Pliers: React.FC<{glint?: number; ink?: string}> = ({glint = 0, ink = '#2B1D14'}) => (
  <g>
    <path d="M0 -6 L70 -10 L118 -4 L70 2 Z" fill="#7C7F84" stroke={ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M0 6 L70 10 L118 4 L70 -2 Z" fill="#9A9DA2" stroke={ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-4 -8 L-46 -16 M-4 8 L-46 16" stroke={ink} strokeWidth={12} strokeLinecap="round" />
    <path d="M-4 -8 L-46 -16 M-4 8 L-46 16" stroke="#6B4A2F" strokeWidth={6} strokeLinecap="round" />
    <circle cx={70} cy={0} r={6} fill="#C9A35A" stroke={ink} strokeWidth={3} />
    {glint > 0 && (
      <g transform={`translate(108 -6) scale(${glint}) rotate(${glint * 45})`}>
        <path d="M0 -26 L5 -5 L26 0 L5 5 L0 26 L-5 5 L-26 0 L-5 -5 Z" fill="#FFF8DC" />
      </g>
    )}
  </g>
);

// look presets
export const TOM: Look = {
  skin: '#F3EAD8', shade: '#E4D4B8', outline: '#2B1D14', shirt: '#EDE3CC', shirtShade: '#CDBF9F', vest: '#5E4630',
  breeches: '#4E3A2A', stocking: '#D6CAB2', shoe: '#231811', apron: '#E2D6BC', hair: 'tuft', hairColor: '#6B4528',
  band: '#B3362B', bandDark: '#7E2119', blush: '#E39A85',
};
export const BARBER: Look = {
  skin: '#F0E2CC', shade: '#DDC8A8', outline: '#2B1D14', shirt: '#E9E1D0', shirtShade: '#C7BCA6', vest: '#2F4A3E',
  breeches: '#3A2C24', stocking: '#B9AE98', shoe: '#1E1510', apron: '#7A5234', apronLine: '#4E331F', hair: 'ring', hairColor: '#C9C2B6',
  moustache: '#B8B0A2', specs: true, belly: 0.9, blush: '#E0A08C',
};

export const restHead = (o: Partial<HeadPose> = {}): HeadPose => ({
  tilt: 0, turn: 0.6, lookX: 0, lookY: 0, eyes: 'dot', blink: 0, browInner: 0, browHeight: 0, mouth: 'line', open: 0, ...o,
});

// ---------- v3: more cast ----------
export const AGNES: Look = {
  skin: '#F2E6D2', shade: '#E0CDB0', outline: '#2B1D14', shirt: '#7A3B32', shirtShade: '#5C2A23', breeches: '#3A2C24', stocking: '#B9AE98', shoe: '#1E1510',
  apron: '#EDE6D6', apronLine: '#BFB49C', hair: 'none', hairColor: '#7A5236', cap: 'coif', capColor: '#F4EFE4',
  skirt: '#5B4A3A', skirtShade: '#3C3025', belly: 0.5, blush: '#E39A85', wrinkles: true,
};
export const HOLLIS: Look = {
  skin: '#EFDCC2', shade: '#DCC3A2', outline: '#2B1D14', shirt: '#E8E0CF', shirtShade: '#C6BBA5', breeches: '#4A3A2C', stocking: '#CFC4AE', shoe: '#1E1510',
  apron: '#F1ECE2', apronLine: '#C9C0AE', hair: 'none', hairColor: '#3A2A20', cap: 'baker', beard: '#4A3426', belly: 1, blush: '#E2957C',
};
export const WATCHMAN: Look = {
  skin: '#EBD9BF', shade: '#D6BF9E', outline: '#2B1D14', shirt: '#5A4B3E', shirtShade: '#40352B', vest: '#2E2722', breeches: '#2E2722', stocking: '#8A7E6A', shoe: '#1A120C',
  hair: 'none', hairColor: '#2A1E16', cap: 'felt', capColor: '#2E2620', moustache: '#3A2A20', belly: 0.3,
};
export const PHYSICIAN: Look = {
  skin: '#F0E4D2', shade: '#DCCAB0', outline: '#2B1D14', shirt: '#1F1A18', shirtShade: '#151110', breeches: '#1F1A18', stocking: '#2A2420', shoe: '#120C08',
  hair: 'ring', hairColor: '#8C8478', cap: 'tall', gown: '#1B1716', beard: '#9A9286', belly: 0.4,
};
export const SEARCHER: Look = {
  skin: '#EADBC6', shade: '#D4C0A4', outline: '#2B1D14', shirt: '#4E4A44', shirtShade: '#3A3732', breeches: '#3A2C24', stocking: '#8A7E6A', shoe: '#1A120C',
  hair: 'none', hairColor: '#9A9286', cap: 'coif', capColor: '#D9D2C2', skirt: '#3D3934', wrinkles: true, belly: 0.2,
};
export const BOY: Look = {
  skin: '#F3EAD8', shade: '#E4D4B8', outline: '#2B1D14', shirt: '#EDE3CC', shirtShade: '#CDBF9F', vest: '#2D3B52',
  breeches: '#2D3B52', stocking: '#D6CAB2', shoe: '#231811', hair: 'tuft', hairColor: '#C99A5A', blush: '#E39A85',
};
// crowd extras: randomised looks from a seed (backlog: crowd extras)
const PAL = ['#6B4A3A', '#4E5A44', '#3E4A5A', '#7A6248', '#5A3E44', '#8A7A5E', '#44403A'];
export const extraLook = (seed: number): Look => {
  const r = (k: number) => { const x = Math.sin(seed * 91.7 + k * 13.3) * 43758.5; return x - Math.floor(x); };
  const woman = r(1) > 0.55;
  const c1 = PAL[Math.floor(r(2) * PAL.length)], c2 = PAL[Math.floor(r(3) * PAL.length)];
  const hairs = ['#3A2A20', '#6B4528', '#9A9286', '#C99A5A', '#2A1E16'];
  return {
    skin: ['#F3EAD8', '#EFDCC2', '#E8D2B4', '#D9B994'][Math.floor(r(4) * 4)], shade: '#D6BF9E', outline: '#2B1D14',
    shirt: woman ? c1 : '#E6DCC6', shirtShade: '#BFB29A', vest: woman ? undefined : c1, breeches: c2, stocking: '#B9AE98', shoe: '#1E1510',
    hair: woman ? 'none' : (r(5) > 0.5 ? 'tuft' : 'ring'), hairColor: hairs[Math.floor(r(6) * hairs.length)],
    cap: woman ? 'coif' : (r(7) > 0.6 ? 'felt' : undefined), capColor: woman ? '#EEE8DA' : '#3E3328',
    skirt: woman ? c2 : undefined, moustache: !woman && r(8) > 0.6 ? hairs[Math.floor(r(9) * 5)] : undefined,
    belly: r(10) * 0.8, blush: r(11) > 0.5 ? '#E39A85' : undefined,
  };
};

// ---------- v3: viseme lip sync ----------
// vis track from make_episode_voice.py: per frame [viseme, open]; X closed, M pressed, A open, E wide, O round, S teeth
export const visMouth = (v: [string, number] | undefined): {mouth: Mouth; open: number} => {
  if (!v) return {mouth: 'line', open: 0};
  const [k, o] = v;
  if (k === 'X') return {mouth: 'line', open: 0};
  if (k === 'M') return {mouth: 'M', open: 0};
  if (k === 'O') return {mouth: 'O', open: Math.min(1, o * 1.1)};
  if (k === 'E') return {mouth: 'E', open: Math.min(1, o)};
  if (k === 'S') return {mouth: 'S', open: o};
  if (k === 'F') return {mouth: 'F', open: o};
  if (k === 'C') return {mouth: 'talk', open: Math.min(0.42, o * 0.6)};
  return {mouth: 'talk', open: Math.min(1, o * 1.05)};
};

// ---------- v3: props ----------
const INK = '#2B1D14';
export const Forceps: React.FC<{glint?: number}> = ({glint = 0}) => <Pliers glint={glint} />;
export const Pelican: React.FC = () => (
  <g stroke={INK} strokeLinejoin="round">
    <rect x={-50} y={-9} width={90} height={18} rx={8} fill="#6B4A2F" strokeWidth={4} />
    <path d="M40 -4 L110 -4 Q132 -4 134 -26 Q120 -18 112 -14 L40 4 Z" fill="#8A8D92" strokeWidth={4} />
    <path d="M40 6 L104 10 L108 22 L40 12 Z" fill="#6E7176" strokeWidth={4} />
  </g>
);
export const Cup: React.FC<{tilt?: number; fill?: number}> = ({fill = 1}) => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <path d="M-4 -26 L40 -26 L34 22 L2 22 Z" fill="#8C6B4A" />
    {fill > 0 && <ellipse cx={18} cy={-24} rx={20} ry={5} fill="#5A2E1E" strokeWidth={2} />}
    <path d="M38 -16 q18 2 14 18 q-4 10 -16 8" fill="none" strokeWidth={5} />
  </g>
);
export const Bottle: React.FC<{label?: string}> = () => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <path d="M-14 -50 h28 v14 q22 10 22 36 v40 q0 10 -10 10 h-52 q-10 0 -10 -10 v-40 q0 -26 22 -36 Z" fill="#7A5A2E" opacity={0.95} />
    <rect x={-10} y={-64} width={20} height={16} rx={3} fill="#C9A35A" />
    <rect x={-22} y={4} width={44} height={26} fill="#EFE3C6" strokeWidth={3} />
    <path d="M-16 -30 q-6 20 -4 50" stroke="#fff" strokeWidth={4} opacity={0.35} fill="none" />
  </g>
);
export const Root: React.FC = () => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-6 -4 C20 -10 46 -2 62 6 C70 10 66 16 58 14 C40 8 22 8 -4 8 Z" fill="#B88A5A" />
    <path d="M58 12 l14 10 M44 10 l6 14 M24 8 l2 12" fill="none" strokeWidth={3} />
  </g>
);
export const Bread: React.FC<{bite?: boolean}> = ({bite}) => (
  <g stroke={INK} strokeWidth={4.5} strokeLinejoin="round">
    <path d={bite ? 'M-10 -20 Q30 -40 70 -20 Q82 -2 70 14 Q66 4 58 10 Q52 0 44 8 Q30 22 -10 16 Q-26 -2 -10 -20 Z' : 'M-10 -20 Q30 -40 70 -20 Q86 -2 70 16 Q30 26 -10 16 Q-26 -2 -10 -20 Z'} fill="#C98A45" />
    <path d="M6 -18 q8 10 4 22 M28 -24 q8 12 4 26 M50 -22 q6 10 2 22" stroke="#8E5A26" strokeWidth={3} fill="none" />
  </g>
);
export const Funnel: React.FC = () => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <path d="M0 -40 L70 -10 L70 10 L0 40 Z" fill="#8A8D92" />
    <rect x={68} y={-6} width={46} height={12} fill="#7C7F84" />
  </g>
);
export const Halberd: React.FC = () => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-4} y={-260} width={10} height={340} fill="#6B4A2F" />
    <path d="M1 -260 L-6 -300 L8 -300 Z M6 -250 Q46 -240 50 -210 Q30 -220 6 -214 Z M-4 -244 L-26 -232 L-4 -226 Z" fill="#9A9DA2" />
  </g>
);
export const Lantern: React.FC<{lit?: number}> = ({lit = 1}) => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <path d="M0 -56 v14" />
    <path d="M-20 -42 h40 l-6 12 h-28 Z" fill="#3A2C24" />
    <rect x={-16} y={-30} width={32} height={40} fill="#FFD27A" opacity={0.4 + 0.6 * lit} />
    <path d="M-16 -30 v40 M16 -30 v40 M0 -30 v40" />
    <path d="M-20 10 h40 l-4 8 h-32 Z" fill="#3A2C24" />
  </g>
);
export const Candle: React.FC<{flick?: number}> = ({flick = 0}) => (
  <g>
    <rect x={-9} y={-50} width={18} height={50} fill="#EDE3CC" stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={2} rx={22} ry={6} fill="#8C6B3A" stroke={INK} strokeWidth={4} />
    <g transform={`translate(0 -54) scale(${1 + flick * 0.08} ${1 + flick * 0.15})`}>
      <path d="M0 -26 Q10 -9 5 0 Q0 4 -5 0 Q-10 -9 0 -26 Z" fill="#FFD27A" />
      <path d="M0 -16 Q4 -6 2 -1 Q0 1 -2 -1 Q-4 -6 0 -16 Z" fill="#FFF5D6" />
    </g>
  </g>
);
export const Peel: React.FC<{loaf?: boolean}> = ({loaf}) => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-60} y={-5} width={190} height={10} rx={5} fill="#8C6B4A" />
    <path d="M128 -26 h70 q10 0 10 10 v32 q0 10 -10 10 h-70 Z" fill="#A8845E" />
    {loaf && <g transform="translate(150 -30) scale(0.7)"><Bread /></g>}
  </g>
);
export const Sponge: React.FC = () => (
  <g stroke={INK} strokeWidth={3.5}>
    <ellipse cx={10} cy={0} rx={18} ry={14} fill="#D8C27A" />
    {[[4, -4], [14, 4], [16, -6], [6, 6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.5} fill="#A88E48" strokeWidth={0} />)}
  </g>
);
export const Pipe: React.FC<{smoke?: number}> = () => (
  <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
    <path d="M0 -3 L50 -6 L50 0 L0 3 Z" fill="#EDE6D6" />
    <path d="M48 -6 h14 v-14 h-14 Z" fill="#EDE6D6" />
  </g>
);
export const Birch: React.FC = () => (
  <g stroke="#4A3A28" strokeWidth={3} strokeLinecap="round" fill="none">
    <path d="M0 0 L90 -10" strokeWidth={7} stroke="#6B4A2F" />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M70 -8 L${130 + i * 6} ${-40 + i * 16}`} />)}
  </g>
);
export const ToothProp: React.FC<{s?: number}> = ({s = 1}) => (
  <path transform={`scale(${s})`} d="M-14 -16 Q0 -24 14 -16 Q18 4 10 8 L6 28 L0 12 L-6 28 L-10 8 Q-18 4 -14 -16 Z" fill="#F4EEDD" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
);
export const Dentures: React.FC<{open?: number}> = ({open = 0}) => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <g transform={`translate(0 ${-open * 14})`}>
      <path d="M-60 0 Q0 -40 60 0 Z" fill="#D98A8A" />
      <path d="M-50 -2 Q0 -24 50 -2 L50 6 L-50 6 Z" fill="#F2E9D0" />
      {[-36, -18, 0, 18, 36].map((x) => <path key={x} d={`M${x} -12 v18`} stroke="#B9AE98" strokeWidth={2} />)}
    </g>
    <g transform={`translate(0 ${open * 14})`}>
      <path d="M-60 10 Q0 50 60 10 Z" fill="#D98A8A" />
      <path d="M-50 10 L50 10 L50 16 Q0 32 -50 16 Z" fill="#F2E9D0" />
    </g>
  </g>
);

// ---------- v4 cast: You Were There Ep 1 (Mary Celeste, 1872) ----------
export const DEVEAU: Look = {
  skin: '#F0DFC6', shade: '#DCC4A2', outline: '#2B1D14', shirt: '#26344A', shirtShade: '#1A2536', vest: '#1F2B3E', breeches: '#2A2622', stocking: '#2A2622', shoe: '#17110C',
  hair: 'none', hairColor: '#3A2618', cap: 'souwester', capColor: '#E2B23A', moustache: '#3A2618', beard: undefined, blush: '#E09A84', belly: 0.2, collar: '#E9E1D0', buttons: '#C9A35A',
};
export const WRIGHT: Look = {
  skin: '#F3E6D2', shade: '#E2CDAE', outline: '#2B1D14', shirt: '#B9432F', shirtShade: '#8C3022', vest: '#3E3A36', breeches: '#3A3530', stocking: '#3A3530', shoe: '#17110C',
  hair: 'tuft', hairColor: '#C46A2E', cap: 'knit', capColor: '#7A8086', blush: '#E8957E', belly: 0,
};
export const MOREHOUSE: Look = {
  skin: '#EAD6BA', shade: '#D4BC98', outline: '#2B1D14', shirt: '#1E2A3E', shirtShade: '#141D2C', vest: '#141D2C', breeches: '#1E2A3E', stocking: '#1E2A3E', shoe: '#120C08',
  hair: 'ring', hairColor: '#8A8276', cap: 'peaked', capColor: '#1E2A3E', beard: '#8A8276', belly: 0.6, buttons: '#C9A35A', wrinkles: true,
};
export const FLOOD: Look = {
  skin: '#F2E2CE', shade: '#DEC8AA', outline: '#2B1D14', shirt: '#F1ECE2', shirtShade: '#C9C0AE', vest: '#2A2024', breeches: '#1F1A1C', stocking: '#1F1A1C', shoe: '#0E0A08',
  hair: 'ring', hairColor: '#D8D2C6', sideburns: '#D8D2C6', monocle: true, gown: '#141012', belly: 1, blush: '#E8A08E', wrinkles: true,
};
export const BRIGGS: Look = {
  skin: '#EEDCC2', shade: '#D8C2A0', outline: '#2B1D14', shirt: '#2C2A30', shirtShade: '#1E1C22', vest: '#3A3238', breeches: '#2C2A30', stocking: '#2C2A30', shoe: '#120C08',
  hair: 'tuft', hairColor: '#4A3426', beard: '#4A3426', cap: 'peaked', capColor: '#22222A', belly: 0.3, buttons: '#C9A35A',
};
export const SARAH: Look = {
  skin: '#F4E8D6', shade: '#E2CFB4', outline: '#2B1D14', shirt: '#4E3A5A', shirtShade: '#3A2A44', breeches: '#3A2C24', stocking: '#B9AE98', shoe: '#1E1510',
  hair: 'ring', hairColor: '#5A3A26', skirt: '#4E3A5A', skirtShade: '#36283F', blush: '#E39A85', collar: '#F1ECE2', belly: 0.2,
};
export const SOPHIA: Look = {
  skin: '#F6EBDA', shade: '#E6D4BA', outline: '#2B1D14', shirt: '#E8D4C8', shirtShade: '#CDB6A8', breeches: '#3A2C24', stocking: '#B9AE98', shoe: '#1E1510',
  hair: 'tuft', hairColor: '#7A5236', skirt: '#C98A8A', skirtShade: '#A86A6A', blush: '#EE9A88', cap: 'coif', capColor: '#F6F0E4',
};
export const DOYLE: Look = {
  skin: '#F0DEC6', shade: '#DCC6A6', outline: '#2B1D14', shirt: '#E9E1D0', shirtShade: '#C7BCA6', vest: '#5A4632', breeches: '#3A3028', stocking: '#3A3028', shoe: '#120C08',
  hair: 'tuft', hairColor: '#5A3A22', moustache: '#5A3A22', belly: 0.3, collar: '#F4F0E8',
};

// ---------- v5 cast: You Were There Ep 2 (Carrington Event, 1859) ----------
export const NED: Look = {
  skin: '#F4E7D3', shade: '#E2CFB2', outline: '#2B1D14', shirt: '#EEE8DA', shirtShade: '#CBC2B0', vest: '#5A3A2A', breeches: '#3A3530', stocking: '#3A3530', shoe: '#17110C',
  hair: 'tuft', hairColor: '#9A4E22', cap: 'visor', capColor: '#2F9A5E', blush: '#EC9A84', belly: 0, garters: '#B3362B', bowtie: '#2B1D14',
};
export const PIKE: Look = {
  skin: '#EAD5B8', shade: '#D4BA96', outline: '#2B1D14', shirt: '#E9E1D0', shirtShade: '#C7BCA6', vest: '#2A3A4A', breeches: '#2A2622', stocking: '#2A2622', shoe: '#120C08',
  hair: 'ring', hairColor: '#8C8478', sideburns: '#8C8478', belly: 1, buttons: '#C9A35A', wrinkles: true, blush: '#E2957C', garters: '#3A3A44',
};
export const PORTLAND: Look = {
  skin: '#F0E0C8', shade: '#DCC6A6', outline: '#2B1D14', shirt: '#C8D4DE', shirtShade: '#9FB0BE', vest: '#3A3A44', breeches: '#2E2A28', stocking: '#2E2A28', shoe: '#120C08',
  hair: 'ring', hairColor: '#5A3A22', moustache: '#5A3A22', specs: true, cap: 'visor', capColor: '#2F7A9A', belly: 0.4,
};
export const KANE: Look = {
  skin: '#F2E4D0', shade: '#DFCAAE', outline: '#2B1D14', shirt: '#EDE6D6', shirtShade: '#C9C0AE', breeches: '#3A2C24', stocking: '#B9AE98', shoe: '#1E1510',
  hair: 'none', hairColor: '#8A6A4A', cap: 'nightcap', capColor: '#F4EFE4', skirt: '#E8E0D0', skirtShade: '#BFB49C', shawl: '#8A3A3A', belly: 0.6, wrinkles: true, blush: '#E39A85',
};
export const MINER: Look = {
  skin: '#E8D0B0', shade: '#D0B48E', outline: '#2B1D14', shirt: '#A8402E', shirtShade: '#7E2E20', breeches: '#3E4A5A', stocking: '#3E4A5A', shoe: '#2A1E14',
  hair: 'none', hairColor: '#6B4528', beard: '#7A5232', cap: 'felt', capColor: '#5A4632', belly: 0.3, blush: '#E09A84',
};
export const CARRINGTON: Look = {
  skin: '#F1E2CC', shade: '#DCC8A8', outline: '#2B1D14', shirt: '#EEE8DA', shirtShade: '#C7BCA6', vest: '#3A3028', breeches: '#2A2420', stocking: '#2A2420', shoe: '#120C08',
  hair: 'tuft', hairColor: '#4A3020', sideburns: '#4A3020', gown: '#2A2420', collar: '#F4F0E8', bowtie: '#1A1410', belly: 0.2,
};
export const ROYCE: Look = {
  skin: '#EEDCC2', shade: '#D8C2A0', outline: '#2B1D14', shirt: '#E6DCC6', shirtShade: '#BFB29A', vest: '#4E5A44', breeches: '#2E2A26', stocking: '#2E2A26', shoe: '#120C08',
  hair: 'tuft', hairColor: '#2A1E16', moustache: '#2A1E16', belly: 0.3, garters: '#2A3A6A',
};
export const LOOMIS: Look = {
  skin: '#F0E0CA', shade: '#DCC8AA', outline: '#2B1D14', shirt: '#E9E1D0', shirtShade: '#C7BCA6', vest: '#3A2E26', breeches: '#2A2420', stocking: '#2A2420', shoe: '#120C08',
  hair: 'ring', hairColor: '#D8D2C6', specs: true, gown: '#1F1A18', wrinkles: true, belly: 0.4, collar: '#F4F0E8',
};
