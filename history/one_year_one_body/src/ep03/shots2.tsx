// You Were There Ep 2 — shots ch4–5 (red sky at midnight, the wire catches fire)
import React from 'react';
import {NED, PIKE, KANE, MINER, ROYCE, extraLook} from '../rig';
import {walk, run, spring, clamp01, lerp, flinch, ease, shiver} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, speech, FreezeLabel, Tag, BigWord, INK, FLOOR, EOut, Cut, Y, Sparks, Arc, Smoke, Pulses, glowRamp, sitOpts, Chair, seatY, crowdAct, CROWD_KINDS, Focus, rack} from './kit';
import {Office, BostonStreet, NightSky, Roofline, MinersCamp, Pan, BrickWall, Lark, MapAmericas, MapNE, Space, Clock, OFFICE, DESK_Y, Flame} from './sets';
import {OfficeScene, Pike, NED_X, NED_Y, nedH, keyHand, tap} from './common';

const cutIdx = (f: number, cuts: Cut[]) => cuts.reduce((a, c, i) => (f >= c.at ? i : a), 0);
const Crowd: React.FC<{f: number; xs: number[]; s?: number; seed?: number; y?: number}> = ({f, xs, s = 0.9, seed = 0, y}) => (
  <g>{xs.map((x, i) => {
    const k = CROWD_KINDS[(i + seed) % CROWD_KINDS.length];
    const flip = k === 'whisper' || k === 'nudge' ? i % 2 === 1 : i % 3 === 0;
    return <Actor key={i} L={extraLook(i + seed * 7 + 40)} x={x} y={y ?? Y(s)} s={s} flip={flip} p={mkPose(f + i * 13, crowdAct(f + i * 13, i + seed, k))} poseF={k === 'point' ? 'point' : k === 'shade' ? 'open' : 'mitt'} />;
  })}</g>
);

// ---------------- CH4 RED SKY AT MIDNIGHT ----------------
export const s18_glow = ({lf, dur}: SP) => {
  const f = lf;
  const red = glowRamp(f, 0, 60);
  const wake = spring(f, 52, 0.3, 0.16);
  const cuts: Cut[] = [{at: 0, z0: 1.1, z1: 1.35, f0: [700, 470], f1: [560, 400]}, {at: 50, z0: 2.6, z1: 2.8, f0: [880, 420], f1: [880, 410]}];
  const c = cutIdx(f, cuts);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <OfficeScene f={f} sky="red" skyAmt={0.3 + red * 0.8} green={0} lamp={0.6}
        ned={{lean: 30 - wake * 24, bob: 18 - wake * 18, hF: [90, -70], hB: [80, -70], head: nedH({turn: c ? 0.3 : 0.6, tilt: 18 - wake * 18, eyes: c ? 'fear' : 'squeeze', eyePop: wake * 0.6, browHeight: wake * 1.2, mouth: c ? 'O' : 'line', open: 0.4, lookX: -1, lookY: -0.4})}} />
      <rect x={-400} y={-300} width={2800} height={1500} fill="#E0303A" opacity={red * 0.08} />
    </Cam>
  );
};

export const s19_street = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ks = speech(sh, 'KANE', gf);
  const L1 = ls(sh, 1);
  const g = clamp01((f - 160) / 90);
  const cuts: Cut[] = [
    {at: 0, z0: 2.2, z1: 2.35, f0: [1270, 470], f1: [1260, 460]},
    {at: L1 - 4, z0: 0.92, z1: 0.98, f0: [960, 500], f1: [1060, 480]},
    {at: 170, z0: 1.0, z1: 1.12, f0: [960, 360], f1: [960, 300]},
    {at: 265, z0: 1.5, z1: 1.6, f0: [900, 520], f1: [940, 500]},
  ];
  const c = cutIdx(f, cuts);
  const ring = Math.sin(f * 0.5) * 30;
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} rot={c === 2 ? -5 : 0}>
      <BostonStreet f={f} sky={g < 0.3 ? 'red' : 'aurora'} green={g} camX={c === 1 ? 300 + f : 300} />
      <Actor L={KANE} x={1260} y={Y(1.05)} s={1.05} flip p={mkPose(f, {hF: c === 0 ? [140 + ring * 0.3, -230 + ring] : [40, -110], hB: c === 0 ? [-40, -240 - ring] : [50, -120], lean: -4, head: {turn: 0.5, mouth: ks.talking ? ks.mouth : 'O', open: ks.talking ? ks.open : 0.4, eyes: 'fear', eyePop: 0.4, browInner: 1, browHeight: 1, lookY: -0.6, lookX: c === 0 ? 0.2 : 0}, seed: 12, dart: 0})} poseF="open" poseB="open" />
      {c >= 1 && <Crowd f={f} xs={[300, 520, 1500, 1720]} seed={1} />}
      {c >= 1 && <Actor L={NED} x={880} y={Y(1.12)} s={1.12} p={mkPose(f, {hF: [60, -120], hB: [40, -110], lean: -6, head: nedH({turn: 0.3, lookY: -1, mouth: 'O', open: 0.45, browHeight: 1.1, eyes: c === 3 ? 'fear' : 'dot', eyePop: c === 3 ? 0.3 : 0}), seed: 1, dart: 0})} />}
    </Cam>
  );
};

export const s20_crowd = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [{at: 0, z0: 1.15, z1: 1.25, f0: [700, 560], f1: [1100, 540]}, {at: 80, z0: 1.9, z1: 2.0, f0: [1290, 470], f1: [1300, 460]}];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <BostonStreet f={f + 200} sky="aurora" green={0.85} camX={500 + f * 0.8} />
      <Crowd f={f} xs={[160, 340, 560, 760, 1020, 1200, 1380, 1580, 1780]} s={0.95} seed={3} />
    </Cam>
  );
};

export const s20b_end = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ks = speech(sh, 'KANE', gf), ns = speech(sh, 'NED', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const cuts: Cut[] = [
    {at: 0, z0: 2.3, z1: 2.45, f0: [1100, 460], f1: [1100, 450]},
    {at: L1 - 4, z0: 1.6, z1: 1.7, f0: [960, 500], f1: [960, 490]},
    {at: L2 - 6, z0: 2.9, z1: 3.1, f0: [830, 440], f1: [830, 430]},
  ];
  const c = cutIdx(f, cuts);
  const glance = c === 2 ? spring(f, L2 - 6, 0.3, 0.2) : 0;
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <BostonStreet f={f + 400} sky="aurora" green={0.9} camX={700} />
      <Actor L={KANE} x={1110} y={Y(1.05)} s={1.05} flip p={mkPose(f, {hF: [40, -130], hB: [60, -125], lean: 6, head: {turn: 0.6, mouth: ks.talking ? ks.mouth : 'line', open: ks.open, browInner: 1, browHeight: 0.8, eyes: c === 2 ? 'half' : 'dot', lookX: 1, lookY: c === 2 ? 0 : -0.2}, seed: 12})} />
      <Actor L={NED} x={830} y={Y(1.12)} s={1.12} p={mkPose(f, {hF: c === 1 ? [90, -100] : [40, -40], hB: [40, 0], head: nedH({turn: 0.75, mouth: ns.talking ? ns.mouth : c === 2 ? 'zigzag' : 'smile', open: ns.open, browInner: c === 2 ? 1 : 0.2, lookY: c === 2 ? -1 * glance : 0, lookX: c === 2 ? 0.3 : 1, eyes: c === 2 ? 'fear' : 'dot', eyePop: glance * 0.3, sweat: c === 2 ? clamp01((f - L2) / 30) : -1}), seed: 1, dart: c === 2 ? 0 : 0.6})} poseF="open" />
    </Cam>
  );
};

const Newspaper: React.FC<{lit: number}> = ({lit}) => (
  <g stroke={INK} strokeWidth={4}>
    <rect x={-10} y={-120} width={210} height={240} fill="#E8E0CC" />
    <text x={95} y={-88} textAnchor="middle" fontFamily="FellSC" fontSize={22} fill={INK} stroke="none">BOSTON DAILY</text>
    <path d="M10 -76 H180" strokeWidth={3} />
    {Array.from({length: 9}, (_, i) => <path key={i} d={`M14 ${-60 + i * 18} H${180 - (i % 3) * 22}`} stroke="#8A7A5E" strokeWidth={5} />)}
    <rect x={-10} y={-120} width={210} height={240} fill="#4CF0A0" opacity={0.12 * lit} stroke="none" />
  </g>
);
export const s21_paper = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ps = speech(sh, 'PIKE', gf);
  const L1 = ls(sh, 1);
  const cuts: Cut[] = [
    {at: 0, z0: 2.0, z1: 2.15, f0: [1080, 450], f1: [1070, 440]},
    {at: L1 - 4, z0: 3.6, z1: 3.9, f0: [1230, 360], f1: [1235, 365]},
    {at: L1 + 100, z0: 1.0, z1: 1.06, f0: [960, 520], f1: [1000, 510]},
  ];
  const c = cutIdx(f, cuts);
  const hold = Math.sin(f * 0.07) * 6;
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <BostonStreet f={f + 600} sky="aurora" green={0.95} camX={900} />
      {c === 2 && <Crowd f={f} xs={[260, 500, 1500, 1720]} seed={5} />}
      <Pike f={f} x={1080} o={{hF: [110, -170 + hold], hB: [130, -160 + hold], lean: -4, head: {turn: 0.7, mouth: ps.talking ? ps.mouth : 'smile', open: ps.open, lookX: 1, lookY: -0.4, eyes: c === 1 ? 'half' : 'dot', browHeight: 0.5}}} propF={<g transform="rotate(-90)"><Newspaper lit={1} /></g>} propAngF={0} gripF gripB />
      <Actor L={NED} x={820} y={Y(1.12)} s={1.12} p={mkPose(f, {hF: [50, -60], hB: [40, 0], head: nedH({turn: 0.7, mouth: 'line', lookX: 1, browInner: -0.2, eyes: 'half'}), seed: 1})} />
    </Cam>
  );
};

export const s22_miners = ({lf, gf, sh, dur}: SP) => {
  const ms = speech(sh, 'MINER', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const FREEZE = dur - 46;
  const frozen = lf >= FREEZE;
  const f = frozen ? FREEZE : lf;
  const cuts: Cut[] = [
    {at: 0, z0: 0.95, z1: 1.05, f0: [960, 480], f1: [900, 500]},
    {at: 80, z0: 1.7, z1: 1.8, f0: [440, 580], f1: [460, 570]},
    {at: L1 - 4, z0: 2.2, z1: 2.3, f0: [520, 480], f1: [520, 470]},
    {at: L2 - 4, z0: 1.7, z1: 1.85, f0: [1000, 640], f1: [1010, 640]},
  ];
  const c = cutIdx(f, cuts);
  const out = clamp01((f - 80) / 50);
  const stretch = c === 2 ? spring(f, L1 - 2, 0.25, 0.14) : 0;
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={f} cuts={cuts} dur={dur}>
          <MinersCamp f={f} fire={c === 3 ? 1 : 0.35} />
          {c <= 2 && <Actor L={MINER} x={lerp(360, 520, ease(out))} y={Y(1.05)} s={1.05} p={mkPose(f, {legF: out < 1 && out > 0 ? walk(f / 20).legF : undefined, legB: out < 1 && out > 0 ? walk(f / 20).legB : undefined, hF: c === 2 ? [40 + stretch * 60, -280 * stretch - 60 * (1 - stretch)] : [60, -60], hB: c === 2 ? [-20, -270 * stretch] : [30, 0], lean: -6 * stretch, head: {turn: 0.4, eyes: c === 2 ? (ms.talking ? 'happy' : 'dot') : 'half', mouth: ms.talking ? ms.mouth : c === 2 ? 'grin' : 'O', open: ms.talking ? ms.open : 0.3, lookY: -0.5, browHeight: 0.6}, seed: 14})} poseF="open" poseB="open" />}
          {c === 3 && <g>
            <Actor L={MINER} x={760} y={Y(1.05)} s={1.05} p={mkPose(f, {hF: [190, -60 + Math.sin(f * 0.5) * 8], hB: [80, -40], lean: 14, head: {turn: 0.7, eyes: 'happy', mouth: 'grin', lookY: 0.5, lookX: 1}, seed: 14})} propF={<Pan sizzle={1} f={f} />} propAngF={-10} gripF />
            <Actor L={{...extraLook(91), cap: 'felt', capColor: '#3E3328', beard: '#3A2A20'}} x={1260} y={Y(1.0)} s={1.0} flip p={mkPose(f, {hF: [70, -110], hB: [60, -80], head: {turn: 0.6, eyes: 'half', mouth: 'line', lookX: 1}, seed: 21})} />
          </g>}
        </Cam>
      </g>
      {frozen && <FreezeLabel t={lf - FREEZE} title="BREAKFAST" sub="Served at about 1 in the morning." />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.7, 0])} />}
      {c === 0 && <Tag x={1420} y={150} t={f - 10} text="Rocky Mountains" sub="gold-mining camp" size={52} />}
    </g>
  );
};

export const s23_masons = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [1000, 540]},
    {at: 105, z0: 2.4, z1: 2.6, f0: [1300, 470], f1: [1300, 460]},
    {at: 165, z0: 1.2, z1: 1.3, f0: [960, 420], f1: [960, 400]},
  ];
  const c = cutIdx(f, cuts);
  const lay = (f * 0.06) % 1;
  if (c <= 1) {
    const shock = c === 1 ? spring(f, 125, 0.32, 0.15) : 0;
    return (
      <g>
        <Cam lf={lf} cuts={cuts} dur={dur}>
          <BrickWall f={f} built={60 + Math.floor(f / 6)} />
          <Actor L={{...extraLook(55), cap: 'felt'}} x={700} y={Y(1.0)} s={1.0} p={mkPose(f, {hF: [120, -60 - Math.sin(lay * Math.PI) * 60], hB: [60, -40], lean: 14, head: {turn: 0.6, eyes: 'dot', mouth: 'line', lookY: 0.5, lookX: 1}, seed: 31})} propF={<g><rect x={0} y={-16} width={60} height={30} fill="#9A4A34" stroke={INK} strokeWidth={3} /></g>} gripF />
          <Actor L={{...extraLook(57), cap: 'felt'}} x={1300} y={Y(1.0)} s={1.0} flip p={mkPose(f, {hF: c === 1 ? [80, -170] : [110, -70], hB: [60, -60], lean: c === 1 ? -6 * shock : 10, head: {turn: 0.5, eyes: c === 1 ? 'fear' : 'dot', eyePop: shock * 0.6, browHeight: shock * 1.2, mouth: c === 1 ? 'O' : 'line', open: 0.6, lookY: c === 1 ? 0.3 : 0.5, lookX: 0.6}, seed: 33})} propF={c === 1 ? <g transform="rotate(90)"><circle cx={0} cy={-10} r={22} fill="#C9A35A" stroke={INK} strokeWidth={4} /><circle cx={0} cy={-10} r={15} fill="#EFE3C6" /></g> : <rect x={0} y={-8} width={50} height={16} fill="#8A8D92" stroke={INK} strokeWidth={3} />} gripF />
        </Cam>
        {c === 0 && <Tag x={440} y={150} t={f - 8} text="South Carolina" sub="bricklayers at work" size={52} />}
        {c === 1 && <BigWord x={960} y={880} t={f - 135} text="1 A.M.?!" size={140} />}
      </g>
    );
  }
  const t = f - 165;
  return (
    <g>
      <Cam lf={t} cuts={[{at: 0, z0: 1.2, z1: 1.3, f0: [960, 420], f1: [960, 400]}]} dur={dur - 165}>
        <NightSky f={f} mode="aurora" x0={-400} x1={2400} y1={1080} green={0.7} />
        <path d="M-400 700 Q400 640 900 660 Q1400 690 2400 600" stroke="#2A1E14" strokeWidth={40} fill="none" />
        <path d="M600 660 Q700 560 820 540" stroke="#2A1E14" strokeWidth={20} fill="none" />
        {[[500, 610, 1], [960, 615, 0.9], [1400, 600, 1.1]].map(([x, y, s], i) => <Lark key={i} x={x} y={y - 40} f={f + i * 9} sing={clamp01((t - 10 - i * 12) / 10)} s={s} flip={i === 1} />)}
      </Cam>
      <Tag x={440} y={150} t={t - 6} text="Virginia" sub="birds singing at 1 a.m." size={52} />
    </g>
  );
};

export const s24_south = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 0.9, z1: 1.0, f0: [960, 540], f1: [1060, 600]}]} dur={dur}>
        <MapAmericas f={f} oval={iv(f, [0, 30], [0, 1])} pins={f - 20} />
      </Cam>
      <Tag x={1520} y={140} t={f - 6} text="Aurora sightings" sub="as reported in 1859" size={50} />
    </g>
  );
};

// ---------------- CH5 THE WIRE CATCHES FIRE ----------------
export const s25_back = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.05, f0: [1500, 520], f1: [1300, 520]},
    {at: 70, z0: 2.6, z1: 2.8, f0: [1220, 600], f1: [1230, 600]},
    {at: 140, z0: 2.3, z1: 2.4, f0: [1300, 430], f1: [1300, 420]},
  ];
  const c = cutIdx(f, cuts);
  const r = run(f / 12);
  const nx = c === 0 ? lerp(2700, 1350, ease(clamp01(f / 60))) : 1350;
  const arm = tap(f, 2.2, 7);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} shake={c === 1 ? 1.5 : 0}>
      <OfficeScene f={f} sky="aurora" green={0.8} ned={null} arm={arm} tapeOff={f * 5} garble
        front={<Actor L={NED} x={nx} y={Y(1.15)} s={1.15} flip p={mkPose(f, {legF: c === 0 && f < 60 ? r.legF : undefined, legB: c === 0 && f < 60 ? r.legB : undefined, bob: c === 0 && f < 60 ? r.bob : 0, lean: c === 0 ? r.lean : 4, hF: c === 2 ? [80, -150] : [60, -60], hB: [40, -40], head: nedH({turn: 0.6, eyes: c === 2 ? 'fear' : 'dot', eyePop: c === 2 ? spring(f, 140) * 0.5 : 0, mouth: c === 2 ? 'fear' : 'line', open: 0.5, browInner: 0.8, browHeight: 0.8, lookX: 1, lookY: 0.4}), seed: 1, dart: 0})} poseF="open" />} />
    </Cam>
  );
};

export const s25b_ghost = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf);
  const cuts: Cut[] = [{at: 0, z0: 2.0, z1: 2.2, f0: [1260, 470], f1: [1250, 460]}, {at: 50, z0: 1.5, z1: 1.55, f0: [1800, 480], f1: [1820, 470]}];
  const c = cutIdx(f, cuts);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <OfficeScene f={f} sky="aurora" green={0.8} ned={null} arm={tap(f, 2.4, 3)} tapeOff={f * 5} garble
        front={<g>
          <Actor L={NED} x={1350} y={Y(1.15)} s={1.15} flip p={mkPose(f, {hF: [150, -160 + Math.sin(f * 0.5) * 10], hB: [40, -120], lean: 6, head: nedH({turn: 0.4, mouth: ns.talking ? ns.mouth : 'fear', open: ns.open, eyes: 'fear', eyePop: 0.4, browInner: 1, browHeight: 1, lookX: c ? -0.5 : 1}), seed: 1})} poseF="point" />
          {c === 1 && <Pike f={f} x={2100} flip o={{hF: [60, -150], hB: [40, -150], lean: -6, head: {turn: 0.4, eyes: 'fear', eyePop: 0.3, mouth: 'O', open: 0.4, browHeight: 1, lookX: 1}}} />}
        </g>} />
    </Cam>
  );
};

export const s26_sparks = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 2.4, z1: 2.6, f0: [1180, 600], f1: [1180, 590]},
    {at: 70, z0: 0.9, z1: 0.95, f0: [1200, 520], f1: [1200, 520]},
    {at: 140, z0: 3.0, z1: 3.3, f0: [1620, 610], f1: [1630, 610]},
    {at: 200, z0: 1.8, z1: 1.9, f0: [1300, 480], f1: [1300, 470]},
  ];
  const c = cutIdx(f, cuts);
  const burn = clamp01((f - 140) / 40);
  const duck = c === 3 ? spring(f, 202, 0.3, 0.15) : 0;
  const S = [[OFFICE.sounderX + 50, DESK_Y - 110, 0], [OFFICE.keyX + 70, DESK_Y - 50, 12], [1540, 300, 25], [OFFICE.plugX, 420, 40], [OFFICE.regX, DESK_Y - 80, 55]];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} shake={2}>
      <OfficeScene f={f} sky="aurora" green={0.8} ned={null} arm={tap(f, 3)} tapeOff={f * 6} garble burn={burn}
        overDesk={<g>
          {S.map(([x, y, o], i) => <Sparks key={i} x={x} y={y} t={(f + o) % 34} n={24} seed={`s${i}${Math.floor((f + o) / 34)}`} />)}
          <Arc x1={1540} y1={110} x2={1540} y2={DESK_Y - 40} f={f} on={(f % 40) < 6 ? 1 : 0} w={4} />
          {burn > 0 && <g><Flame x={OFFICE.regX + 380} y={DESK_Y - 60} f={f} s={1.2 * burn} /><Smoke x={OFFICE.regX + 380} y={DESK_Y - 90} f={f} amt={burn} /></g>}
        </g>}
        front={c === 3 ? <Actor L={NED} x={1250} y={Y(1.15) + duck * 40} s={1.15} flip p={mkPose(f, {legF: [0.5 * duck, 0.9 * duck], legB: [0.2 * duck, 0.6 * duck], hF: [60, -250 + duck * 40], hB: [40, -240 + duck * 40], lean: 20 * duck, head: nedH({eyes: 'squeeze', mouth: 'fear', open: 0.6, browInner: 1}), seed: 1})} poseF="open" poseB="open" /> : null} />
    </Cam>
  );
};

export const s27_shock = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf), ps = speech(sh, 'PIKE', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const ZAP = L1 + 30;
  const fl = flinch(f - ZAP);
  const cuts: Cut[] = [
    {at: 0, z0: 1.7, z1: 1.8, f0: [1400, 470], f1: [1410, 460]},
    {at: L1 - 4, z0: 2.0, z1: 2.1, f0: [2050, 450], f1: [2040, 440]},
    {at: ZAP - 2, z0: 1.6, z1: 1.7, f0: [1450, 480], f1: [1450, 470]},
    {at: L2 - 6, z0: 2.9, z1: 3.1, f0: [1400, 380], f1: [1400, 375]},
  ];
  const c = cutIdx(f, cuts);
  const zapped = f >= ZAP;
  const sv = shiver(f, zapped ? 1.5 : 0);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} shake={fl.on * 14}>
      <OfficeScene f={f} sky="aurora" green={0.8} ned={null} arm={tap(f, 3)} garble
        front={<g>
          <path d={`M1540 560 Q1500 620 ${1455 + sv.x} ${470}`} stroke="#2A2420" strokeWidth={6} fill="none" />
          <Actor L={zapped ? {...NED, hairColor: '#C46A2E'} : NED} x={1400 + sv.x} y={Y(1.15) + fl.bob} s={1.15} p={mkPose(f, {lean: fl.lean, hF: [50, -230], hB: [40, -60], head: nedH({turn: zapped ? 0.2 : 0.7, tilt: sv.tilt + fl.tilt, eyes: zapped ? 'dizzy' : 'fear', eyePop: 0.4, mouth: ns.talking ? ns.mouth : zapped ? 'zigzag' : 'fear', open: ns.talking ? ns.open : 0.5, browHeight: zapped ? 1.4 : 1, browInner: 1}), seed: 1, dart: 0})} propF={<g><rect x={0} y={-4} width={50} height={8} fill="#B87A3A" stroke={INK} strokeWidth={2} /></g>} gripF />
          {zapped && <g transform={`translate(${1410 + sv.x} ${Y(1.15) - 360})`}>{[-50, -25, 0, 25, 50].map((dx, i) => <path key={i} d={`M${dx} 20 L${dx * 1.5 + Math.sin(f + i) * 4} -50`} stroke={INK} strokeWidth={9} strokeLinecap="round" />)}</g>}
          {zapped && <Smoke x={1420} y={Y(1.15) - 380} f={f} amt={0.8} n={4} s={0.6} />}
          <Arc x1={1460} y1={470} x2={1540} y2={560} f={f} on={f >= ZAP && f < ZAP + 10 ? 1 : 0} />
          <Pike f={f} x={2050} flip o={{hF: c === 1 ? [170, -160] : [60, -100], hB: [60, -150], lean: c === 1 ? 10 : 0, head: {turn: 0.4, mouth: ps.talking ? ps.mouth : c === 3 ? 'O' : 'line', open: ps.open || (c === 3 ? 0.4 : 0), eyes: 'fear', eyePop: c === 1 ? 0.5 : 0.2, browInner: 1, browHeight: 1, lookX: 1}}} poseF="open" />
        </g>} />
      {f >= ZAP && f < ZAP + 3 && <rect x={-400} y={-300} width={2800} height={1500} fill="#DFF4FF" opacity={0.7} />}
    </Cam>
  );
};

export const s28_royce = ({lf, dur}: SP) => {
  const f = lf;
  const ZAP = 150;
  const fl = flinch(f - ZAP);
  const cuts: Cut[] = [
    {at: 0, z0: 0.95, z1: 1.0, f0: [1100, 520], f1: [1050, 510]},
    {at: 90, z0: 2.4, z1: 2.6, f0: [980, 420], f1: [990, 410]},
    {at: ZAP + 30, z0: 1.4, z1: 1.5, f0: [1000, 470], f1: [1020, 460]},
    {at: 280, z0: 2.2, z1: 2.4, f0: [1500, 450], f1: [1500, 440]},
  ];
  const c = cutIdx(f, cuts);
  const leanIn = f < ZAP ? iv(f, [90, ZAP], [10, 26]) : 26 + fl.lean;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} shake={fl.on * 10}>
        <OfficeScene f={f} sky="aurora" green={0.6} variant="dc" L={ROYCE} pikeDesk={false}
          ned={{lean: leanIn, bob: fl.bob, hF: keyHand(tap(f, 1)), head: {turn: 0.6, eyes: f >= ZAP ? 'dizzy' : 'dot', mouth: f >= ZAP ? 'zigzag' : 'line', tilt: fl.tilt, lookX: 1, lookY: 0.3}}}
          front={<g>
            <path d="M1090 100 Q1080 300 1060 420" stroke="#2A2420" strokeWidth={6} fill="none" />
            <Arc x1={1000} y1={430} x2={OFFICE.sounderX} y2={DESK_Y - 100} f={f} on={f >= ZAP && f < ZAP + 16 ? 1 : 0} w={7} />
            <Actor L={extraLook(77)} x={1500} y={Y(1.05)} s={1.05} flip p={mkPose(f, crowdAct(f, 3, f > ZAP ? 'mouth' : 'clutch'))} />
          </g>} press={tap(f, 1)} arm={tap(f, 1)} />
      </Cam>
      {f >= ZAP && f < ZAP + 3 && <rect width={1920} height={1080} fill="#DFF4FF" opacity={0.7} />}
      {c === 0 && <Tag x={1500} y={150} t={f - 8} text="Washington" sub="operator Frederick Royce" size={52} />}
      {c === 3 && <Tag x={960} y={150} t={f - 290} text="“an arc of fire”" sub="according to a witness" size={52} />}
    </g>
  );
};

export const s29_pitt = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [{at: 0, z0: 1.9, z1: 2.1, f0: [1960, 440], f1: [1960, 430]}, {at: 75, z0: 1.2, z1: 1.3, f0: [1800, 500], f1: [1820, 490]}];
  const c = cutIdx(f, cuts);
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} shake={3}>
        <OfficeScene f={f} sky="aurora" green={0.5} variant="pitt" ned={null} pikeDesk={false} garble arm={tap(f, 3)}
          front={<g>
            {[0, 1, 2, 3].map((i) => <Arc key={i} x1={OFFICE.plugX - 30 + (i % 2) * 60} y1={380 + i * 30} x2={OFFICE.plugX - 200 + i * 120} y2={DESK_Y - 20} f={f + i * 3} on={(f + i * 7) % 18 < 10 ? 1 : 0} color="#FFC07A" w={5} />)}
            <Sparks x={OFFICE.plugX} y={430} t={f % 26} n={30} seed={`pt${Math.floor(f / 26)}`} color="#FFC07A" />
            <Actor L={{...extraLook(66), moustache: '#3A2A20', vest: '#2A2420'}} x={1600} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: [-60, -200], hB: [-40, -180], lean: -14, head: {turn: 0.6, eyes: 'fear', eyePop: 0.5, mouth: 'fear', open: 0.6, browHeight: 1.2, browInner: 1, lookX: 1}, seed: 19})} poseF="open" poseB="open" />
          </g>} />
      </Cam>
      {c === 0 && <Tag x={600} y={150} t={f - 6} text="Pittsburgh" sub="“streams of fire”" size={52} />}
    </g>
  );
};

export const s30_dead = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [1000, 540], f1: [1080, 520]}, {at: 150, z0: 1.6, z1: 1.75, f0: [1500, 380], f1: [1500, 360]}]} dur={dur}>
        <MapNE f={f} dead={iv(f, [10, 140], [0, 1])} sparkle={1} />
      </Cam>
      <BigWord x={960} y={900} t={f - 150} text="LINES DOWN" size={130} />
    </g>
  );
};

export const s31_why = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const cuts: Cut[] = [
    {at: 0, z0: 2.2, z1: 2.4, f0: [1650, 540], f1: [1650, 540]},
    {at: 150, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 520]},
    {at: L1 - 4, z0: 2.0, z1: 2.2, f0: [900, 420], f1: [900, 400]},
  ];
  const c = cutIdx(f, cuts);
  if (c === 0) return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}><Space f={f} cme={1} shield={1 + 0.4 * Math.sin(f * 0.4)} /></Cam>
      <Tag x={600} y={150} t={f - 10} text="Earth's magnetic field" sub="shaken by the storm" size={50} />
    </g>
  );
  if (c === 1) {
    const t = f - 150;
    return (
      <g>
        <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 520]}]} dur={L1 - 154}>
          <NightSky f={f} mode="aurora" x0={-400} x1={2400} y1={900} green={0.8} />
          <rect x={-400} y={900} width={2800} height={400} fill="#1A1E16" />
          {[100, 700, 1300, 1900].map((x) => <g key={x} stroke={INK} strokeWidth={6}><rect x={x - 10} y={560} width={20} height={360} fill="#6A4A30" /><rect x={x - 60} y={580} width={120} height={14} fill="#5A3D27" /></g>)}
          <path d="M-400 600 Q-150 640 100 584 Q400 640 700 584 Q1000 640 1300 584 Q1600 640 1900 584 Q2150 640 2400 600" stroke="#2A2420" strokeWidth={6} fill="none" />
          <path d="M-400 600 Q-150 640 100 584 Q400 640 700 584 Q1000 640 1300 584 Q1600 640 1900 584 Q2150 640 2400 600" stroke="#7CFFC0" strokeWidth={14} fill="none" opacity={0.3 + 0.3 * Math.sin(t * 0.2)} filter="url(#glowS)" />
          {[0, 1, 2, 3, 4, 5].map((i) => { const x = 100 + i * 300 + Math.sin(t * 0.05 + i) * 40; return <path key={i} d={`M${x} 200 L${x} ${400 + (t * 4 + i * 30) % 160}`} stroke="#7CFFC0" strokeWidth={4} strokeDasharray="12 14" opacity={0.6} />; })}
        </Cam>
        <BigWord x={960} y={880} t={t - 30} text="CURRENT FROM THE SKY" size={96} color="#7CFFC0" />
      </g>
    );
  }
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <OfficeScene f={f} sky="aurora" green={0.9} glow={0.5}
        ned={{lean: -4, hF: [60, -150], hB: [40, -96], head: nedH({turn: 0.4, lookY: -1, lookX: 0.6, eyes: 'dot', mouth: 'O', open: 0.4, browHeight: 1.2})}}
        overDesk={<g><path d="M-400 70 H1500 Q1540 70 1540 110 V560" stroke="#7CFFC0" strokeWidth={10} fill="none" opacity={0.4 + 0.3 * Math.sin(f * 0.3)} filter="url(#glowS)" /></g>} />
    </Cam>
  );
};
void PIKE; void Office; void Roofline; void Clock; void Pulses; void sitOpts; void Chair; void seatY; void Focus; void rack; void EOut; void FLOOR; void NED_X; void NED_Y; void keyHand;
