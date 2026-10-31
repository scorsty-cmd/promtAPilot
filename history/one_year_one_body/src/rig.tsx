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
};

export type Mouth = 'line' | 'smile' | 'grin' | 'zigzag' | 'talk' | 'O' | 'fear';
export type Eyes = 'dot' | 'squeeze' | 'fear' | 'sly';

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

// mitten hand: palm + thumb, oriented along the forearm; children = held prop
const Hand: React.FC<{x: number; y: number; ang: number; skin: string; ink: string; grip?: boolean; children?: React.ReactNode; propAng?: number}> = ({x, y, ang, skin, ink, grip, children, propAng = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    {children && <g transform={`rotate(${propAng})`}>{children}</g>}
    <ellipse cx={7} cy={0} rx={17} ry={14} fill={skin} stroke={ink} strokeWidth={5} />
    <ellipse cx={grip ? 10 : 4} cy={grip ? -10 : -13} rx={7} ry={grip ? 6 : 9} transform={`rotate(${grip ? 10 : -30} 4 -12)`} fill={skin} stroke={ink} strokeWidth={4.5} />
    {grip && <path d="M14 -6 q6 6 0 12" stroke={ink} strokeWidth={3} fill="none" />}
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
      {mouth}
      {L.moustache && (
        <path transform={`translate(${mx} ${36 - o * 3})`} d="M0 -2 C-10 -10 -26 -8 -34 2 C-38 8 -44 6 -46 0 C-42 14 -24 14 -12 6 C-6 2 -2 2 0 4 C2 2 6 2 12 6 C24 14 42 14 46 0 C44 6 38 8 34 2 C26 -8 10 -10 0 -2 Z" fill={L.moustache} stroke={ink} strokeWidth={4.5} strokeLinejoin="round" />
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

export const Puppet: React.FC<{L: Look; p: Pose; propF?: React.ReactNode; propAngF?: number; gripF?: boolean; gripB?: boolean; front?: React.ReactNode}> = ({L, p, propF, propAngF, gripF, gripB}) => {
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
        <Hand x={aB.hx} y={aB.hy} ang={angB} skin={L.shade} ink={ink} grip={gripB} />
        <Seg p={[[10, by * 0.5], lB.k, lB.f]} w={30} c={L.breeches} w2={22} c2={L.stocking} ink={ink} />
        {shoe(lB.f, lB.sa)}
      </g>
      <Seg p={[[-6, by * 0.5], lF.k, lF.f]} w={30} c={L.breeches} w2={22} c2={L.stocking} ink={ink} />
      {shoe(lF.f, lF.sa)}
      {/* torso */}
      <g transform={`translate(0 ${by}) rotate(${p.lean} 0 0)`}>
        <path d={`M-42 -138 Q0 -150 46 -138 C ${50 + belly * 34} -90, ${48 + belly * 40} -30, 40 8 Q0 18 -40 8 C -44 -40, -46 -100, -42 -138 Z`} fill={L.shirt} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
        {L.vest && (
          <g fill={L.vest} stroke={ink} strokeWidth={5} strokeLinejoin="round">
            <path d={`M-36 -128 L-12 -128 L2 14 L-36 8 Z`} />
            <path d={`M42 -128 L18 -128 L6 14 C ${46 + belly * 36} -10, ${48 + belly * 36} -80, 42 -128 Z`} />
          </g>
        )}
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
      <Hand x={aF.hx} y={aF.hy} ang={angF} skin={L.skin} ink={ink} grip={gripF} propAng={propAngF}>{propF}</Hand>
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
