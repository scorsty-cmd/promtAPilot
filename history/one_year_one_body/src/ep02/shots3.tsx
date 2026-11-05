// You Were There Ep 1 — shots ch6–8 (the legend, what happened, the empty deck)
import React from 'react';
import {DEVEAU, WRIGHT, DOYLE, BRIGGS, SARAH, extraLook, Puppet, Candle} from '../rig';
import {spring, clamp01, lerp, drop, roll, ease, walk} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, le, speech, Tag, BigWord, Stamp, FreezeLabel, INK, Cut, Y, Rain, Card, Bars, Spray} from './kit';
import {Deck, Sea, Sky, Ship, Yawl, Cabin, Hold, Study, Board, Reef, DarkTable, MapAtlantic, MAP, Barrel, Pier} from './sets';
import {dvH} from './shots1';

// ---------------- CH6 ----------------
export const s34_doyle = ({lf, dur}: SP) => {
  const FREEZE = dur - 70;
  const frozen = lf >= FREEZE;
  const f = Math.min(lf, FREEZE);
  const wr = Math.sin(f * 0.5);
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={f} cuts={[{at: 0, z0: 1.25, z1: 1.4, f0: [900, 520], f1: [880, 500]}]} dur={dur}>
          <Study f={f} />
          <Actor L={DOYLE} x={760} y={Y(1.15) + 60} s={1.15} p={mkPose(f, {legF: [1.42, 1.42], legB: [1.3, 1.3], lean: 18, hF: [150 + wr * 12, -40 + Math.abs(wr) * 6], hB: [120, -30], head: {turn: 0.75, lookX: 0.7, lookY: 0.7, mouth: 'smile', browInner: -0.2, browHeight: 0.3, eyes: 'dot'}, seed: 15, dart: 0.3})} propF={<path d="M0 0 L70 -40" stroke="#EDE6D6" strokeWidth={6} />} gripF />
        </Cam>
      </g>
      {frozen && <FreezeLabel t={lf - FREEZE} title="CONAN DOYLE" sub="Sherlock Holmes: not invented yet." />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.7, 0])} />}
      {!frozen && <Tag x={1420} y={160} t={lf - 20} text="London, 1884" sub="The Cornhill Magazine" size={44} />}
    </g>
  );
};

const Teacup: React.FC<{x: number; y: number; f: number; a: number}> = ({x, y, f, a}) => (
  <g transform={`translate(${x} ${y}) scale(${a})`} opacity={clamp01(a * 1.5)}>
    <path d="M-36 -30 H36 Q34 20 0 26 Q-34 20 -36 -30 Z" fill="#F2ECE0" stroke={INK} strokeWidth={4} />
    <ellipse cy={-30} rx={36} ry={8} fill="#8A5A2E" stroke={INK} strokeWidth={3} />
    <path d="M36 -20 q20 0 16 18 q-4 10 -16 8" fill="none" stroke={INK} strokeWidth={4} />
    <ellipse cy={30} rx={56} ry={10} fill="#E2DACB" stroke={INK} strokeWidth={4} />
    {[0, 1].map((i) => <path key={i} d={`M${-12 + i * 22} -44 q${10 * Math.sin(f * 0.15 + i)} -20 0 -40 q${-10 * Math.sin(f * 0.15 + i)} -20 0 -40`} stroke="#F2F2F2" strokeWidth={5} fill="none" opacity={0.5} />)}
  </g>
);
export const s35_myths = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const REW = L1 - 10;
  const rew = f >= REW;
  const appear = (at: number) => (rew ? iv(f, [REW, REW + 10], [1, 0]) : spring(f, at, 0.32, 0.18));
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.7, z1: 1.85, f0: [800, 600], f1: [800, 590]}, {at: REW, z0: 1.25, z1: 1.3, f0: [960, 560], f1: [960, 560]}]} dur={dur} shake={rew && f < REW + 12 ? 6 : 0}>
        <g filter={rew && f < REW + 12 ? 'url(#freeze)' : undefined}>
          <Cabin f={f} lampLit={rew ? 0.6 : 1} mess={false} water={rew} />
          <Teacup x={650} y={650} f={f} a={appear(60)} />
          <Teacup x={900} y={650} f={f} a={appear(80)} />
          <g transform={`translate(760 672) scale(${appear(140)})`} opacity={clamp01(appear(140) * 1.5)}>
            <ellipse rx={80} ry={16} fill="#F2ECE0" stroke={INK} strokeWidth={4} />
            <ellipse cx={-20} cy={-10} rx={30} ry={12} fill="#E8C060" stroke={INK} strokeWidth={3} />
            <path d="M14 -16 q20 -10 40 0 q-6 10 -20 8 Z" fill="#C98A45" stroke={INK} strokeWidth={3} />
          </g>
          {rew && <Actor L={DEVEAU} x={1250} y={Y(1.15)} s={1.15} flip p={mkPose(f, {hF: [70, -40], head: dvH({turn: 0.5 + Math.sin(f * 0.25) * 0.3, mouth: 'frown', eyes: 'half', browInner: -0.4, lookX: 0.5}), seed: 1, dart: 0})} />}
        </g>
      </Cam>
      {!rew && <Tag x={560} y={330} t={f - 70} text="warm tea" size={44} />}
      {!rew && <Tag x={1100} y={250} t={f - 150} text="half-eaten breakfast" size={44} rot={3} />}
      {rew && <Stamp x={760} y={300} t={f - REW - 14} text="MADE UP" size={100} />}
    </g>
  );
};

export const s36_fiction = ({lf, dur}: SP) => {
  const f = lf;
  const g = spring(f, 10, 0.25, 0.15);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [960, 530]}]} dur={dur}>
      <DarkTable f={f} />
      <g transform={`translate(700 540) rotate(-4) scale(${0.6 + g * 0.5})`}>
        <rect x={-260} y={-340} width={520} height={680} fill="#C9A87A" stroke={INK} strokeWidth={6} />
        <rect x={-260} y={-340} width={520} height={680} filter="url(#brush)" fill="#C9A87A" />
        <text y={-240} textAnchor="middle" fontFamily="FellSC" fontSize={40} fill="#4A2E1A">The Cornhill Magazine</text>
        <text y={-190} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={30} fill="#4A2E1A">January 1884</text>
        <path d="M-200 -160 H200" stroke="#4A2E1A" strokeWidth={3} />
        <text y={-60} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={36} fill="#2A1E14">J. Habakuk Jephson's</text>
        <text y={-14} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={36} fill="#2A1E14">Statement</text>
        <text y={110} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={60} fill="#B3362B">MARIE</text>
        <text y={176} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={60} fill="#B3362B">CELESTE</text>
      </g>
      <g transform="translate(1420 620) rotate(5) scale(0.7)">
        <rect x={-200} y={-260} width={400} height={520} fill="#EFE3C6" stroke={INK} strokeWidth={5} />
        {Array.from({length: 12}, (_, i) => <path key={i} d={`M-160 ${-200 + i * 36} H${120 - (i % 3) * 30}`} stroke="#6B5A44" strokeWidth={4} />)}
        <text y={240} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={40} fill="#2A1E14">the testimony</text>
      </g>
      <BigWord x={1420} y={260} t={f - 70} text="facts" size={90} color="#E8D8B0" />
      <BigWord x={700} y={110} t={f - 40} text="FICTION" size={110} />
    </Cam>
  );
};

// ---------------- CH7 ----------------
export const s37_known = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [960, 520]}]} dur={dur}>
      <Board />
      <Card x={960} y={520} w={1100} h={640} t={f - 10} title="WHAT WE KNOW" lines={[]} />
      {['a sound ship, about 3½ ft of water', 'the one small boat: gone', 'papers + instruments: gone', 'food, water, belongings: left'].map((s, i) => (
        <g key={i} opacity={iv(f - 40 - i * 45, [0, 10], [0, 1])}>
          <text x={500} y={420 + i * 90} fontFamily="FellItalic" fontStyle="italic" fontSize={50} fill="#2A1E14">{s}</text>
          <path d={`M440 ${405 + i * 90} l14 14 l26 -30`} stroke="#2E6A3A" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </Cam>
  );
};

export const s38_pirates = ({lf, dur}: SP) => {
  const f = lf;
  const H = Math.round(dur / 2);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.05, z1: 1.1, f0: [700, 540], f1: [720, 540]}, {at: H, z0: 1.05, z1: 1.1, f0: [1240, 540], f1: [1220, 540]}]} dur={dur}>
      <Board />
      <Card x={620} y={540} w={620} h={420} t={f - 4} title="PIRATES?" lines={['nothing of value taken']} rot={-3} />
      <Card x={1320} y={540} w={620} h={420} t={f - H + 4} title="MUTINY?" lines={['no sign of a fight']} rot={3} />
      <Stamp x={620} y={600} t={f - 50} text="UNLIKELY" size={70} />
      <Stamp x={1320} y={600} t={f - H - 40} text="UNLIKELY" size={70} rot={8} />
    </Cam>
  );
};

export const s39_barrels = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.12, f0: [960, 560], f1: [960, 600]}]} dur={dur}>
        <Pier f={f} />
        {Array.from({length: 3}, (_, r) => Array.from({length: 9}, (_, c) => {
          const k = r * 9 + c, empty = k % 3 === 1;
          const hl = empty && f > 60 + (k / 3) * 8;
          return (
            <g key={k}>
              <Barrel x={260 + c * 175} y={900 - r * 120} s={0.9} />
              {hl && <ellipse cx={260 + c * 175} cy={900 - r * 120} rx={62} ry={66} fill="none" stroke="#E2B23A" strokeWidth={8} />}
            </g>
          );
        }))}
      </Cam>
      <Tag x={420} y={150} t={f - 10} text="Genoa, 1873" size={46} />
      <BigWord x={1500} y={200} t={f - 120} text="9 EMPTY" size={110} color="#E2B23A" />
    </g>
  );
};

const Thermo: React.FC<{x: number; y: number; hot: number}> = ({x, y, hot}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={5}>
    <rect x={-22} y={-300} width={44} height={300} rx={22} fill="#EFE3C6" />
    <circle cy={20} r={40} fill={hot > 0.5 ? '#D8402A' : '#3A7AC8'} />
    <rect x={-10} y={-40 - hot * 220} width={20} height={60 + hot * 220} fill={hot > 0.5 ? '#D8402A' : '#3A7AC8'} strokeWidth={0} />
  </g>
);
const Spark: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (t >= 0 && t < 10 ? <g transform={`translate(${x} ${y}) scale(${1 + t * 0.1}) rotate(${t * 20})`}><path d="M0 -40 L8 -8 L40 0 L8 8 L0 40 L-8 8 L-40 0 L-8 -8 Z" fill="#FFF8C0" stroke="#E2B23A" strokeWidth={3} /></g> : null);
export const s40_vapour = ({lf, sh, dur}: SP) => {
  const f = lf;
  const C1 = le(sh, 0) - 160, C2 = ls(sh, 1) - 4, C3 = ls(sh, 1) + 110;
  if (f < C1) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.18, f0: [960, 560], f1: [960, 600]}]} dur={C1}>
          <Hold f={f} vapour={iv(f, [20, 140], [0, 1])} light={0.6} />
        </Cam>
        <Tag x={1450} y={160} t={f - 60} text="alcohol vapour" sub="heavier than air, invisible" size={44} />
      </g>
    );
  }
  const lab = (hot: number, t: number, sparkAt: number, flashAt: number) => {
    const fl = flashAt > 0 ? iv(t - flashAt, [0, 3, 30], [0, 1, 0]) : 0;
    return (
      <g>
        <DarkTable f={f} />
        <rect x={-400} y={700} width={2800} height={600} fill="#2A1E14" />
        <g transform="translate(960 640) scale(0.55)"><Ship f={0} x={0} y={0} /></g>
        <rect x={700} y={600} width={520} height={120} fill="none" stroke="#E8D8B0" strokeWidth={4} strokeDasharray="12 10" />
        <Thermo x={1500} y={640} hot={hot} />
        <Spark x={960} y={640} t={t - sparkAt} />
        {fl > 0 && <circle cx={960} cy={640} r={100 + fl * 500} fill="#8FC0FF" opacity={0.75 * fl} filter="url(#glow)" />}
        {fl > 0 && <rect x={-400} y={-300} width={2800} height={1700} fill="#CFE6FF" opacity={0.4 * fl} />}
      </g>
    );
  };
  if (f < C2) {
    const t = f - C1;
    return (
      <g>
        <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [1060, 560], f1: [1080, 560]}]} dur={C2 - C1}>{lab(0.35, t, 1e9, 0)}</Cam>
        <Tag x={420} y={150} t={t - 6} text="University of Manchester, 2026" sub="1:18 scale model, for TV" size={42} />
      </g>
    );
  }
  if (f < C3) {
    const t = f - C2;
    return (
      <g>
        <Cam lf={t} cuts={[{at: 0, z0: 1.2, z1: 1.3, f0: [1060, 560], f1: [1060, 560]}]} dur={C3 - C2}>{lab(0.1, t, 40, 0)}</Cam>
        <BigWord x={960} y={220} t={t - 60} text="COLD: NOTHING" size={100} color="#7FB4FF" />
      </g>
    );
  }
  const t = f - C3;
  return (
    <g>
      <Cam lf={t} cuts={[{at: 0, z0: 1.2, z1: 1.35, f0: [1060, 560], f1: [1000, 560]}]} dur={dur - C3} shake={iv(t - 70, [0, 2, 20], [0, 14, 0])}>{lab(iv(t, [0, 50], [0.1, 0.8]), t, 64, 70)}</Cam>
      <BigWord x={960} y={220} t={t - 90} text="WARM: FLASH" size={100} />
    </g>
  );
};

const Crew: React.FC<{f: number; n: number; x0: number; flee: number}> = ({f, n, x0, flee}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const st = walk((f + i * 7) / 14, 1);
      return <Actor key={i} L={i === 0 ? BRIGGS : i === 1 ? SARAH : extraLook(60 + i)} x={x0 + i * 150 - flee * (i * 30 + 200)} y={Y(0.9)} s={0.9} flip p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: 12, hF: [80, -200], hB: [60, -210], head: {turn: 0.5, eyes: 'fear', mouth: 'fear', open: 0.6, browInner: 1, browHeight: 0.8}, seed: 40 + i})} />;
    })}
  </g>
);
export const s41_flash = ({lf, sh, dur}: SP) => {
  const f = lf;
  const C1 = 150, C2 = ls(sh, 1) - 4;
  if (f < C1) {
    const fl = iv(f, [40, 44, 80], [0, 1, 0.1]);
    const hd = drop(f - 44, 0, 0, -1, 0.3);
    void hd;
    const coverY = f < 44 ? -260 : -260 - iv(f, [44, 70], [0, 500], (x) => 1 - (1 - x) * (1 - x)) + iv(f, [70, 110], [0, 900], (x) => x * x);
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.04, f0: [960, 540], f1: [960, 520]}]} dur={C1} shake={iv(f, [44, 46, 70], [0, 18, 0])}>
          <Hold f={f} vapour={f < 44 ? 1 : 0.2} flash={fl} light={0.5} />
          <g transform={`translate(${960 + Math.max(0, f - 44) * 3} ${coverY}) rotate(${Math.max(0, f - 44) * 9})`}><rect x={-160} y={-26} width={320} height={52} fill="#7A5638" stroke={INK} strokeWidth={6} /></g>
        </Cam>
        <Tag x={460} y={150} t={f - 10} text="UCL test, 2006" sub="a blast with almost no scorch marks" size={42} />
      </g>
    );
  }
  if (f < C2) {
    const t = f - C1;
    return (
      <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [900, 560]}]} dur={C2 - C1}>
        <Deck f={f} mode="day" mc roll={roll(f, 1.4)} />
        <Crew f={t} n={6} x0={1100} flee={ease(clamp01(t / 80))} />
        <Spray x={1060} y={760} t={t % 50} n={10} s={0.8} />
      </Cam>
    );
  }
  const t = f - C2;
  const ropeY = 700 + Math.sin(f * 0.05) * 10;
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 0.85, z1: 0.95, f0: [960, 560], f1: [900, 560]}]} dur={dur - C2}>
      <Sky f={f} mode="day" horizon={520} />
      <Sea f={f} mode="day" horizon={520} rough={1.1} />
      <Ship f={f} x={1450} y={660} s={0.55} torn={false} rot={Math.sin(f * 0.04) * 2} />
      <path d={`M1180 ${ropeY - 40} Q800 ${ropeY + 60} 420 ${ropeY + 20}`} stroke="#B89A6A" strokeWidth={6} fill="none" />
      <Yawl x={360} y={ropeY + 60 + Math.sin(f * 0.07) * 14} s={0.5} rot={Math.sin(f * 0.07) * 5}>
        {[-140, -40, 60, 150].map((x, i) => <circle key={i} cx={x} cy={-60} r={30} fill="#2B1D14" />)}
      </Yawl>
      <Tag x={500} y={170} t={t - 20} text="a theory, not a proven fact" size={40} />
    </Cam>
  );
};

export const s42_rope = ({lf, sh, dur}: SP) => {
  const f = lf;
  const SNAP = le(sh, 0) + 10;
  const snapped = f >= SNAP;
  const away = snapped ? ease(clamp01((f - SNAP) / 140)) : 0;
  const wind = iv(f, [0, SNAP], [1, 1.8]);
  const shipX = 1300 + away * 900;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 0.9, z1: 0.98, f0: [960, 540], f1: [960, 540]}, {at: SNAP, z0: 1.4, z1: 1.3, f0: [800, 600], f1: [960, 580]}]} dur={dur} shake={snapped && f < SNAP + 10 ? 6 : 0}>
        <Sky f={f * 3} mode="storm" horizon={520} />
        <Sea f={f * 1.5} mode="storm" horizon={520} rough={wind} />
        <Ship f={f} x={shipX} y={660} s={0.55} rot={Math.sin(f * 0.06) * 3} />
        {!snapped && <path d={`M1030 640 Q700 ${760 + Math.sin(f * 0.3) * 30} 420 700`} stroke="#B89A6A" strokeWidth={6} fill="none" />}
        {snapped && <path d={`M${1030 + away * 900} 640 Q${960 + away * 900} 720 ${880 + away * 800} ${760 + Math.sin(f * 0.2) * 20}`} stroke="#B89A6A" strokeWidth={6} fill="none" />}
        {snapped && <path d={`M420 700 Q500 760 ${560 - away * 30} ${800 + Math.sin(f * 0.2) * 20}`} stroke="#B89A6A" strokeWidth={6} fill="none" />}
        <Yawl x={360} y={760 + Math.sin(f * 0.08) * 24} s={0.5} rot={Math.sin(f * 0.08) * 7}>
          {[-140, -40, 60, 150].map((x, i) => <circle key={i} cx={x} cy={-60} r={30} fill="#2B1D14" />)}
        </Yawl>
        <Rain f={f} amt={0.4} />
      </Cam>
      {snapped && f < SNAP + 12 && <text x={700} y={500} fontFamily="FrauncesBlack" fontSize={80} fill="#E8D8B0" opacity={1 - (f - SNAP) / 12}>SNAP</text>}
    </g>
  );
};

export const s43_other = ({lf, dur}: SP) => {
  const f = lf;
  const H = Math.round(dur * 0.45);
  const tick = Math.floor(f / 8);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.1, z1: 1.16, f0: [620, 540], f1: [640, 540]}, {at: H, z0: 1.1, z1: 1.16, f0: [1320, 540], f1: [1300, 540]}]} dur={dur}>
      <Board />
      <Card x={620} y={540} w={640} h={560} t={f - 4} title="A FAULTY PUMP?" lines={['the leak looked worse', 'than it was']} rot={-2} />
      <Card x={1320} y={540} w={640} h={560} t={f - H + 4} title="A BAD CLOCK?" lines={['land seemed closer', 'than it was']} rot={2} />
      <g transform="translate(1320 680)" opacity={iv(f - H, [10, 20], [0, 1])}>
        <circle r={80} fill="#EFE3C6" stroke={INK} strokeWidth={6} />
        <path d={`M0 0 L${Math.sin(tick * 0.5) * 60} ${-Math.cos(tick * 0.5) * 60}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d={`M0 0 L${Math.sin(tick * 0.04 + 1) * 40} ${-Math.cos(tick * 0.04 + 1) * 40}`} stroke="#B3362B" strokeWidth={8} strokeLinecap="round" />
      </g>
      <Stamp x={960} y={900} t={f - dur + 70} text="NOT PROVEN" size={80} rot={-4} />
    </Cam>
  );
};

export const s43b_spout = ({lf, dur}: SP) => {
  const f = lf;
  const C = Math.round(dur * 0.62);
  if (f < C) {
    const sx = iv(f, [0, C], [300, 900]);
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 0.95, z1: 1.05, f0: [960, 540], f1: [1060, 540]}]} dur={C}>
        <Sky f={f * 2} mode="storm" horizon={600} />
        <Sea f={f} mode="storm" horizon={600} rough={1.5} />
        <g transform={`translate(${sx} 600)`}>
          <path d={`M-30 0 Q${-50 + Math.sin(f * 0.2) * 20} -300 -140 -620 L140 -620 Q${50 + Math.sin(f * 0.2) * 20} -300 30 0 Z`} fill="#8A96A0" opacity={0.75} />
          <path d={`M-10 0 Q${-20 + Math.sin(f * 0.25) * 16} -300 -60 -620`} stroke="#C8D0D6" strokeWidth={6} fill="none" opacity={0.6} />
          <ellipse cy={0} rx={130} ry={24} fill="#C8D0D6" opacity={0.6} />
        </g>
        <Ship f={f} x={1450} y={660} s={0.5} rot={Math.sin(f * 0.07) * 4} />
        <Tag x={420} y={150} t={f - 10} text="waterspout" size={46} />
      </Cam>
    );
  }
  const t = f - C;
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 540]}]} dur={dur - C} shake={4}>
      <Sky f={f} mode="day" horizon={420} />
      <Sea f={f} mode="day" horizon={420} rough={0.6} />
      {[0, 1, 2].map((i) => { const ph = ((t + i * 14) % 42) / 42; return <ellipse key={i} cx={960} cy={760} rx={100 + ph * 800} ry={20 + ph * 160} fill="none" stroke="#E8F0F2" strokeWidth={8 * (1 - ph)} opacity={1 - ph} />; })}
      <Ship f={f} x={960} y={560} s={0.4} rot={Math.sin(t * 1.2) * 2} />
      <Tag x={420} y={150} t={t - 6} text="seaquake" size={46} />
    </Cam>
  );
};

export const s44_unknown = ({lf, dur}: SP) => {
  const f = lf;
  const z = iv(f, [0, dur], [2.6, 0.75], (x) => 1 - (1 - x) * (1 - x));
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: z, z1: z, f0: [960, 640], f1: [960, 640]}]} dur={dur}>
        <Sky f={f} mode="dusk" horizon={560} />
        <Sea f={f} mode="dusk" horizon={560} rough={0.9} />
        <Yawl x={960} y={640 + Math.sin(f * 0.06) * 8} s={0.25} rot={Math.sin(f * 0.06) * 6}>
          {[-140, -40, 60, 150].map((x, i) => <circle key={i} cx={x} cy={-60} r={30} fill="#2B1D14" />)}
        </Yawl>
      </Cam>
      <BigWord x={960} y={260} t={f - 200} text="?" size={260} color="#E8D8B0" />
      <Bars k={1} />
    </g>
  );
};

// ---------------- CH8 ----------------
export const s45_fate = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const C1 = 160, HIT = 280;
  if (f < C1) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.5, f0: [960, 540], f1: [500, 760]}]} dur={C1}>
          <MapAtlantic f={f} />
          <g transform={`translate(${lerp(1640, MAP.haiti[0] + 30, ease(clamp01(f / 140)))} ${lerp(640, MAP.haiti[1] - 20, ease(clamp01(f / 140)))}) scale(0.07)`}><Ship f={f} x={0} y={0} flip /></g>
        </Cam>
        <Tag x={420} y={150} t={f - 10} text="1872 → 1885" sub="twelve more years at sea" size={44} />
      </g>
    );
  }
  const t = f - C1;
  const hit = f >= HIT;
  const x = hit ? 900 : iv(f, [C1, HIT], [1700, 900]);
  const tilt = hit ? spring(f, HIT, 0.25, 0.12) * 8 : 0;
  return (
    <g>
      <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 560], f1: [960, 560]}, {at: L1 - C1, z0: 1.5, z1: 1.6, f0: [900, 560], f1: [900, 550]}]} dur={dur - C1} shake={hit && f < HIT + 16 ? 10 : 0}>
        <Reef f={f} />
        <Ship f={f} x={x} y={720 + tilt * 3} s={0.6} flip rot={-tilt} />
        <Spray x={720} y={800} t={f - HIT} n={30} s={1.6} />
      </Cam>
      <Tag x={420} y={150} t={t - 10} text="Haiti, 3 Jan 1885" sub="run onto a reef on purpose" size={44} />
      <Stamp x={1400} y={860} t={f - HIT - 30} text="INSURANCE FRAUD" size={70} />
    </g>
  );
};

export const s45b_cussler = ({lf, dur}: SP) => {
  const f = lf;
  const rings = 30;
  const scan = iv(f, [100, 300], [0, 1]);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [960, 540], f1: [900, 540]}]} dur={dur}>
      <DarkTable f={f} />
      <g transform="translate(760 560)">
        {Array.from({length: rings}, (_, i) => <circle key={i} r={380 - i * 12 + Math.sin(i * 1.7) * 3} fill={i % 2 ? '#C9A06A' : '#B88A54'} stroke="#7A5634" strokeWidth={2} />)}
        <circle r={20} fill="#6B4A2F" />
        <path d={`M0 0 L${380 * scan} 0`} stroke="#E5503A" strokeWidth={6} />
        <circle cx={380 - 3 * 12} cy={0} r={18} fill="none" stroke="#E2B23A" strokeWidth={6} opacity={iv(f, [300, 310], [0, 1])} />
      </g>
      <Tag x={1500} y={300} t={f - 20} text="2001: wreck found?" sub="Clive Cussler's expedition" size={42} />
      <BigWord x={1500} y={600} t={f - 310} text="1890s" size={140} color="#E2B23A" />
      <Stamp x={1500} y={820} t={f - 340} text="NOT HER" size={80} />
    </Cam>
  );
};

export const s46_after = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.2, z1: 1.35, f0: [900, 500], f1: [880, 480]}]} dur={dur}>
      <Deck f={f} mode="dusk" roll={roll(f, 0.8)} />
      <g opacity={iv(f, [40, 90], [0, 0.4])}><path d={`M1340 620 Q${1380 + Math.sin(f * 0.07) * 20} 760 ${1350 + Math.sin(f * 0.05) * 30} 1000`} stroke="#E8D8B0" strokeWidth={10} fill="none" /></g>
      <Actor L={DEVEAU} x={900} y={Y(1.15)} s={1.15} p={mkPose(f, {hF: [120, -60], hB: [100, -56], head: dvH({turn: 0.85, lookX: 0.9, browInner: 0.5, mouth: 'line', eyes: 'dot'}), seed: 1, dart: 0.4})} />
    </Cam>
  );
};

export const s47_question = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ws = speech(sh, 'WRIGHT', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  if (f < L2 - 6) {
    const hl = f >= L1 ? Math.min(2, Math.floor((f - L1) / ((L2 - L1) / 3))) : -1;
    const opts = ['A  Exploding fumes', 'B  A bad pump', 'C  Something else'];
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.6, z1: 1.75, f0: [880, 440], f1: [870, 430]}]} dur={L2}>
          <Deck f={f} mode="dusk" roll={roll(f + 100, 0.8)} />
          <Actor L={DEVEAU} x={560} y={Y(1.15)} s={1.15} p={mkPose(f, {hF: [110, -150], head: dvH({turn: 0.35, lookX: 0.2, browInner: 0.3, browHeight: 0.5, mouth: 'smile'}), seed: 1, dart: 0.4})} poseF="open" />
        </Cam>
        {opts.map((o, i) => (
          <g key={i} opacity={iv(f - 20 - i * 10, [0, 10], [0, 1])} transform={`translate(1320 ${330 + i * 150})`}>
            <rect x={-420} y={-55} width={840} height={110} rx={12} fill={hl === i ? '#E2B23A' : '#EFE3C6'} stroke={INK} strokeWidth={5} />
            <text x={-380} y={18} fontFamily="FrauncesBlack" fontWeight={900} fontSize={54} fill={INK}>{o}</text>
          </g>
        ))}
        <text x={1320} y={830} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={44} fill="#E8D8B0" opacity={iv(f, [60, 80], [0, 1])}>Tell me in the comments.</text>
      </g>
    );
  }
  const t = f - L2 + 6;
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 1.9, z1: 2.0, f0: [860, 560], f1: [860, 550]}]} dur={dur - L2}>
      <Sky f={f} mode="dusk" horizon={560} />
      <Sea f={f} mode="dusk" horizon={560} rough={0.8} />
      <Yawl x={860} y={800 + Math.sin(f * 0.06) * 10} s={1.1} rot={Math.sin(f * 0.06) * 4}>
        <Actor L={WRIGHT} x={0} y={-50} s={0.9} shadow={false} p={mkPose(f, {legF: [1.4, 1.2], legB: [1.3, 1.1], hF: [50, -90], hB: [70, -96], head: {turn: 0.3, mouth: ws.talking ? ws.mouth : 'smile', open: ws.open, eyes: ws.talking ? 'dot' : 'happy', browHeight: 0.4, lookX: 0.2}, seed: 5})} />
      </Yawl>
    </Cam>
  );
};

export const s48_end = ({lf}: SP) => {
  const f = lf;
  const a = iv(lf, [0, 14], [0, 1]);
  return (
    <g>
      <rect width={1920} height={1080} fill="#0E1418" />
      <g opacity={0.35}><Sky f={f} mode="night" horizon={760} moon /><Sea f={f} mode="night" horizon={760} rough={0.7} /><Ship f={f} x={1550} y={800} s={0.3} torn dark /></g>
      <rect width={1920} height={1080} fill="#120B08" opacity={0.45} />
      <g opacity={a}>
        <text x={960} y={120} textAnchor="middle" fontFamily="FellSC" fontSize={50} fill="#E8D8B0" letterSpacing={6}>YOU WERE THERE · EPISODE 1</text>
        <rect x={180} y={240} width={800} height={450} rx={16} fill="#0E0805" stroke="#E2B23A" strokeWidth={6} />
        <text x={580} y={410} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={70} fill="#F3E7CF">WATCH NEXT</text>
        <text x={580} y={490} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={42} fill="#E8D8B0">One Year, One Body:</text>
        <text x={580} y={546} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={42} fill="#E8D8B0">You Have a Toothache in 1665</text>
        <circle cx={1440} cy={410} r={150} fill="#0E0805" stroke="#E8D8B0" strokeWidth={6} />
        <g transform="translate(1440 500) scale(0.75)"><Puppet L={DEVEAU} p={mkPose(f, {hF: [100, -260 + Math.sin(f * 0.3) * 20], hB: [40, 2], head: {turn: 0.4, eyes: 'happy', mouth: 'grin', open: 0.3}, seed: 2})} poseF="open" /></g>
        <rect x={1240} y={620} width={400} height={90} rx={14} fill="#C4302B" stroke={INK} strokeWidth={5} />
        <text x={1440} y={682} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={52} fill="#fff">SUBSCRIBE</text>
        <text x={960} y={910} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={110} fill="#E2B23A" letterSpacing={8}>HISTORY SOURCED</text>
        <text x={960} y={985} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill="#E8D8B0">animated reconstruction · dialogue dramatized · sources in the description</text>
      </g>
    </g>
  );
};
void Candle; void Rain; void Cabin; void Barrel; void speech; void Cut;
