// You Were There Ep 1 — shots ch4–5 (the captain's cabin, Gibraltar)
import React from 'react';
import {DEVEAU, WRIGHT, MOREHOUSE, FLOOD, BRIGGS, SARAH, SOPHIA, extraLook, Lantern, Candle, Look} from '../rig';
import {walk, spring, clamp01, lerp, flinch, drop, roll, ease} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, le, speech, Tag, BigWord, Stamp, INK, Cut, Y, Focus, rack, Rain, lightning, Bars, Card} from './kit';
import {Deck, Ship, Cabin, Pier, Rock, Court, DarkTable, MapAtlantic, MAP, Barrel, Wheel, Board} from './sets';
import {dvH} from './shots1';

const SEPIA = 'url(#sepiaF)';
const SepiaDefs = () => (
  <defs><filter id="sepiaF"><feColorMatrix values="0.39 0.77 0.19 0 0.04  0.35 0.69 0.17 0 0.02  0.27 0.53 0.13 0 0  0 0 0 1 0" /></filter></defs>
);
const Sword: React.FC<{out?: number}> = ({out = 0}) => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-30} y={-7} width={40} height={14} rx={4} fill="#4A3220" />
    <path d="M10 -16 V16" strokeWidth={9} stroke="#C9A35A" />
    <path d={`M14 -6 L${150 + out * 60} -6 L${170 + out * 60} 0 L${150 + out * 60} 6 L14 6 Z`} fill={out > 0.5 ? '#B8BCC0' : '#3A2A22'} />
    {out > 0.5 && <path d={`M60 -2 h40 M110 1 h30`} stroke="#7A4A2A" strokeWidth={4} opacity={0.8} />}
  </g>
);

// ---------------- CH4 ----------------
export const s19_below = ({lf, dur}: SP) => {
  const f = lf;
  const C = Math.round(dur * 0.55);
  if (f < C) {
    const k = ease(clamp01(f / (C - 10)));
    const a = Math.sin(f * 0.35);
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 1.3, z1: 1.4, f0: [520, 400], f1: [520, 480]}]} dur={C}>
        <Cabin f={f} lampLit={0} />
        <path d="M400 -300 L360 905 M600 -300 L560 905" stroke="#5A3D27" strokeWidth={18} />
        {Array.from({length: 10}, (_, i) => <path key={i} d={`M${396 - i * 4} ${-260 + i * 120} H${596 - i * 4}`} stroke="#5A3D27" strokeWidth={14} />)}
        <Actor L={DEVEAU} x={480} y={lerp(-80, Y(1.15), k)} s={1.15} flip p={mkPose(f, {legF: [0.4 + a * 0.3, 0.8], legB: [0.2 - a * 0.3, 0.6], hF: [80, -220 + a * 20], hB: [70, -160 - a * 20], head: dvH({turn: 0.3, lookX: 0.6, lookY: 0.4, browInner: 0.5}), seed: 1})} propF={<g transform="rotate(90) translate(0 10)"><Lantern lit={1} /></g>} gripF gripB />
        <circle cx={460} cy={lerp(-200, 560, k)} r={360} fill="url(#candle)" opacity={0.8} />
      </Cam>
    );
  }
  const t = f - C;
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 0.95, z1: 1.02, f0: [960, 540], f1: [980, 530]}]} dur={dur - C}>
      <Cabin f={f} lampLit={0} />
      <Actor L={DEVEAU} x={560} y={Y(1.15)} s={1.15} p={mkPose(t, {hF: [110, -120], head: dvH({turn: 0.8, lookX: 0.6, lookY: -0.3, browInner: 0.6}), seed: 1, dart: 1.4})} propF={<g transform="rotate(90) translate(0 10)"><Lantern lit={1} /></g>} gripF />
      <circle cx={680} cy={560} r={420} fill="url(#candle)" opacity={0.8} />
    </Cam>
  );
};

export const s20_things = ({lf, dur}: SP) => {
  const f = lf;
  const rk = rack(f, 90, 130, 8);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.7, z1: 1.75, f0: [380, 260], f1: [1640, 640]}]} dur={dur}>
      <Focus blur={rk.bg} id="thbg"><g><Cabin f={f} lampLit={0.6} /></g></Focus>
      <Focus blur={rk.fg} id="thfg">
        <g>
          {/* scattered clothes + books on the floor */}
          <path d="M1100 880 Q1180 840 1260 870 Q1300 900 1240 910 Q1160 920 1100 900 Z" fill="#4E3A5A" stroke={INK} strokeWidth={5} />
          <rect x={1300} y={860} width={80} height={40} fill="#6E2A22" stroke={INK} strokeWidth={4} transform="rotate(-14 1340 880)" />
          <rect x={1000} y={870} width={70} height={36} fill="#2E4A3A" stroke={INK} strokeWidth={4} transform="rotate(10 1030 890)" />
        </g>
      </Focus>
    </Cam>
  );
};

const Ghost: React.FC<{o: number; children: React.ReactNode}> = ({o, children}) => <g opacity={o} filter={SEPIA}>{children}</g>;
export const s21_family = ({lf, dur}: SP) => {
  const f = lf;
  const a = [iv(f, [40, 70], [0, 0.85]), iv(f, [90, 120], [0, 0.85]), iv(f, [140, 170], [0, 0.85])];
  return (
    <g>
      <SepiaDefs />
      <Cam lf={lf} cuts={[{at: 0, z0: 1.15, z1: 1.28, f0: [1000, 560], f1: [1020, 540]}]} dur={dur}>
        <Cabin f={f} lampLit={0.3} />
        <Ghost o={a[0]}><Actor L={BRIGGS} x={820} y={Y(1.2)} s={1.2} p={mkPose(f, {hF: [60, -40], hB: [90, -30], head: {turn: 0.3, mouth: 'smile', lookX: 0.4}, seed: 11})} /></Ghost>
        <Ghost o={a[1]}><Actor L={SARAH} x={1080} y={Y(1.1)} s={1.1} flip p={mkPose(f, {hF: [70, -30], hB: [40, 0], head: {turn: 0.35, mouth: 'smile', lookX: 0.4}, seed: 12})} /></Ghost>
        <Ghost o={a[2]}><Actor L={SOPHIA} x={1220} y={FLOOR_Y(0.6)} s={0.6} flip p={mkPose(f, {hF: [80, -200 + Math.sin(f * 0.2) * 20], head: {turn: 0.3, mouth: 'grin', open: 0.3, eyes: 'happy'}, seed: 13})} poseF="open" /></Ghost>
        <circle cx={1000} cy={600} r={600} fill="#F2D8A8" opacity={0.08} />
      </Cam>
      <Tag x={560} y={200} t={f - 50} text="Benjamin Briggs" sub="captain" size={42} />
      <Tag x={960} y={150} t={f - 100} text="Sarah Briggs" size={42} rot={2} />
      <Tag x={1380} y={210} t={f - 150} text="Sophia, 2" size={42} rot={-3} />
    </g>
  );
};
const FLOOR_Y = (s: number) => 905 - 176 * s;

export const s21b_crew = ({lf, dur}: SP) => {
  const f = lf;
  const roles = ['first mate', 'second mate', 'cook', 'seaman', 'seaman', 'seaman', 'seaman'];
  return (
    <g>
      <SepiaDefs />
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [960, 540]}]} dur={dur}>
        <rect x={-400} y={-300} width={2800} height={1700} fill="#2A1E14" />
        <g filter={SEPIA}>
          <Pier f={f} />
          {roles.map((r, i) => {
            const a = iv(f - i * 8, [0, 12], [0, 1]);
            return <g key={i} opacity={a}><Actor L={extraLook(40 + i * 3)} x={300 + i * 220} y={Y(0.9) + 30} s={0.9} p={mkPose(f, {hF: [-10, 6], head: {turn: 0.5, lookX: 0.3}, seed: 20 + i})} /></g>;
          })}
        </g>
      </Cam>
      {roles.map((r, i) => <text key={i} x={300 + i * 220} y={1000} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={34} fill="#F3E7CF" opacity={iv(f - i * 8 - 10, [0, 10], [0, 1])}>{r}</text>)}
      <g opacity={iv(f, [100, 120], [0, 1])}><path d="M1170 950 V930 H1630 V950" stroke="#E5503A" strokeWidth={6} fill="none" transform="translate(-120 -840)" /><text x={1280} y={70} textAnchor="middle" fontFamily="FrauncesBlack" fontSize={48} fill="#E5503A">brothers</text></g>
    </g>
  );
};

export const s22_newyork = ({lf, dur}: SP) => {
  const f = lf;
  const n = Math.round(iv(f, [120, 230], [0, 1701], ease));
  const roll1 = (k: number) => ((f * 3 + k * 300) % 900);
  return (
    <g>
      <SepiaDefs />
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [960, 540], f1: [1040, 540]}, {at: 150, z0: 1.6, z1: 1.7, f0: [1300, 600], f1: [1320, 600]}]} dur={dur}>
        <g filter={SEPIA}>
          <Pier f={f} />
          <Ship f={f} x={1500} y={760} s={0.85} name="MARY CELESTE" />
          {[0, 1, 2].map((k) => <Barrel key={k} x={200 + roll1(k)} y={720} s={0.7} />)}
          <Actor L={extraLook(51)} x={560} y={Y(1.0) - 10} s={1.0} p={mkPose(f, {...walk(f / 24), hF: [110, -40], hB: [100, -30], lean: 18, head: {turn: 0.7, mouth: 'line'}, seed: 30})} />
          <Actor L={BRIGGS} x={1180} y={560} s={0.8} flip p={mkPose(f, {hF: [70, -120], head: {turn: 0.5, lookX: 0.4}, seed: 11})} />
        </g>
      </Cam>
      <Tag x={420} y={150} t={f - 20} text="New York, 7 Nov 1872" sub="bound for Genoa" size={46} />
      {f > 120 && <g><text x={1500} y={200} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={120} fill="#E2B23A" stroke={INK} strokeWidth={6} paintOrder="stroke">{n.toLocaleString('en-US')}</text><text x={1500} y={260} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={46} fill="#F3E7CF">barrels of alcohol</text></g>}
    </g>
  );
};

export const s23_sword = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ws = speech(sh, 'WRIGHT', gf), ds = speech(sh, 'DEVEAU', gf);
  const PULL = 50;
  const antic = f > PULL - 10 && f < PULL ? iv(f, [PULL - 10, PULL], [0, 1]) : 0;
  const out = spring(f, PULL, 0.3, 0.16);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const cuts: Cut[] = [{at: 0, z0: 1.5, z1: 1.6, f0: [1300, 700], f1: [1300, 680]}, {at: L1 - 4, z0: 1.9, z1: 2.0, f0: [1240, 520], f1: [1250, 510]}, {at: L2 - 6, z0: 3.0, z1: 3.2, f0: [1130, 470], f1: [1130, 460]}];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <Cabin f={f} lampLit={0.8} />
      <Actor L={DEVEAU} x={1120} y={Y(1.15) + 70} s={1.15} p={mkPose(f, {legF: [1.0, 1.9], legB: [0.5, 1.2], lean: 14 - antic * 8, hF: [lerp(150, 60, out), lerp(60, -140, out)], hB: [60, -10], head: dvH({turn: f > L2 - 6 ? 0.2 : 0.7, lookX: f > L2 - 6 ? -0.1 : 0.8, eyes: f > L2 ? 'half' : 'dot', mouth: ds.talking ? ds.mouth : 'line', open: ds.open, browInner: f > L2 ? -0.4 : 0.3}), seed: 1, dart: f > L2 ? 0 : 1})} propF={<Sword out={out} />} propAngF={lerp(0, -40, out)} gripF />
      <Actor L={WRIGHT} x={1440} y={Y(1.05)} s={1.05} flip p={mkPose(f, {lean: 12, hF: [60, -200], hB: [50, -180], head: {turn: 0.6, mouth: ws.talking ? ws.mouth : 'line', open: ws.open, eyes: 'fear', eyePop: ws.talking ? 0.5 : 0.2, browInner: 1, browHeight: 0.8, lookX: 0.6, lookY: 0.4}, seed: 5})} />
    </Cam>
  );
};

const Outline: React.FC<{x: number; y: number; w: number; h: number; t: number; label: string}> = ({x, y, w, h, t, label}) => (
  <g opacity={iv(t, [0, 10], [0, 1])}>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill="none" stroke="#E8D8B0" strokeWidth={6} strokeDasharray="20 14" />
    <text x={x} y={y + h / 2 + 60} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={44} fill="#E8D8B0">{label}</text>
    <Stamp x={x} y={y} t={t - 16} text="MISSING" size={46} rot={-14} />
  </g>
);
export const s24_missing = ({lf, dur}: SP) => {
  const f = lf;
  const C = Math.round(dur * 0.66);
  if (f < C) {
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [960, 530]}]} dur={C}>
        <DarkTable f={f} />
        <Outline x={420} y={500} w={360} h={260} t={f - 40} label="ship's papers" />
        <Outline x={960} y={500} w={300} h={300} t={f - 90} label="sextant" />
        <Outline x={1500} y={500} w={280} h={240} t={f - 140} label="chronometer" />
      </Cam>
    );
  }
  const t = f - C;
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 2.0, z1: 2.15, f0: [800, 600], f1: [800, 590]}]} dur={dur - C}>
      <Cabin f={f} lampLit={0.8} />
      <rect x={560} y={600} width={300} height={80} fill="#4A3220" stroke={INK} strokeWidth={5} />
      <rect x={600} y={680} width={220} height={40} fill="#1A110B" stroke={INK} strokeWidth={4} />
      <Actor L={DEVEAU} x={980} y={Y(1.15)} s={1.15} flip p={mkPose(t, {lean: 10, hF: [130, -60], head: dvH({turn: 0.6, lookY: 0.6, lookX: 0.5, browInner: 0.8, mouth: 'frown'}), seed: 1})} poseF="open" />
    </Cam>
  );
};

export const s25_log = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const C1 = 120, C2 = L1 - 6;
  if (f < C1) {
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 1.4, z1: 1.55, f0: [900, 560], f1: [880, 560]}]} dur={C1}>
        <Cabin f={f} lampLit={1} mess={false} />
        <rect x={600} y={650} width={260} height={30} fill="#EFE3C6" stroke={INK} strokeWidth={4} />
        <Actor L={DEVEAU} x={1000} y={Y(1.15)} s={1.15} flip p={mkPose(f, {lean: 14, hF: [140, -50], hB: [120, -40], head: dvH({turn: 0.7, lookY: 0.7, lookX: 0.6, browInner: 0.6}), seed: 1, dart: 0.4})} />
      </Cam>
    );
  }
  if (f < C2) {
    const t = f - C1;
    const w = iv(t, [10, 140], [0, 1]);
    const text = '25th Nov.  8 a.m.  Eastern point of St. Mary\'s bore SSW, 6 miles';
    return (
      <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.12, f0: [960, 540], f1: [1000, 520]}]} dur={C2 - C1}>
        <DarkTable f={f} />
        <g transform="rotate(-3 960 540)">
          <rect x={300} y={240} width={1320} height={620} fill="#EADBB8" stroke={INK} strokeWidth={6} />
          <rect x={300} y={240} width={1320} height={620} filter="url(#brush)" fill="#EADBB8" />
          <path d="M960 240 V860" stroke="#B8A47A" strokeWidth={6} />
          {Array.from({length: 10}, (_, i) => <path key={i} d={`M340 ${320 + i * 52} H1580`} stroke="#C8B48A" strokeWidth={2} />)}
          {['24th Nov.  Fine weather, wind light', 'Lat. 36° 56\' N   Long. 27° 20\' W'].map((s, i) => <text key={i} x={360} y={360 + i * 52} fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill="#3A2A5A" opacity={0.75}>{s}</text>)}
          <text x={360} y={520} fontFamily="FellItalic" fontStyle="italic" fontSize={44} fill="#2A1E4A">{text.slice(0, Math.round(text.length * w))}</text>
        </g>
        <Tag x={1500} y={960} t={t - 150} text="the last entry" sub="(reconstruction)" size={40} />
      </Cam>
    );
  }
  const t = f - C2;
  const prog = ease(clamp01((t - 20) / 200));
  const p = [lerp(MAP.santa[0], MAP.found[0], prog), lerp(MAP.santa[1], MAP.found[1], prog)];
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 2.2, z1: 2.4, f0: [1240, 540], f1: [1250, 540]}]} dur={dur - C2}>
      <MapAtlantic f={f} />
      <path d={`M${MAP.santa[0]} ${MAP.santa[1]} L${p[0]} ${p[1]}`} stroke="#B3362B" strokeWidth={6} strokeDasharray="10 10" />
      <g transform={`translate(${p[0]} ${p[1]}) scale(0.06) rotate(${Math.sin(f * 0.1) * 10})`}><Ship f={f} x={0} y={0} torn /></g>
      <Tag x={MAP.santa[0] - 10} y={MAP.santa[1] + 60} t={t - 10} text="25 Nov" size={26} />
      <Tag x={MAP.found[0] + 30} y={MAP.found[1] + 60} t={t - 200} text="4 Dec" size={26} />
      <BigWord x={1240} y={420} t={t - 120} text="9 DAYS" size={70} />
    </Cam>
  );
};

export const s26_creep = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ws = speech(sh, 'WRIGHT', gf), ds = speech(sh, 'DEVEAU', gf);
  const L1 = ls(sh, 1);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.9, z1: 2.1, f0: [960, 420], f1: [960, 410]}]} dur={dur}>
      <Cabin f={f} lampLit={0.15} shaft={0.4} />
      <rect x={-400} y={-300} width={2800} height={1500} fill="#05030A" opacity={0.45} />
      <g transform="translate(960 640)"><Candle flick={Math.sin(f * 0.9)} /></g>
      <circle cx={960} cy={560} r={520} fill="url(#candle)" opacity={0.9} />
      <Actor L={WRIGHT} x={1160} y={Y(1.05)} s={1.05} flip p={mkPose(f, {hF: [60, -150], hB: [40, -130], head: {turn: 0.4, mouth: ws.talking ? ws.mouth : 'zigzag', open: ws.open, eyes: 'fear', browInner: 1, browHeight: 0.6, lookX: Math.sin(f * 0.1) * 0.8, gulp: iv(f, [L1 + 20, L1 + 34], [0, 1])}, seed: 5, dart: 0})} />
      <Actor L={DEVEAU} x={760} y={Y(1.15)} s={1.15} p={mkPose(f, {hF: [40, -10], head: dvH({turn: 0.5, mouth: ds.talking ? ds.mouth : 'line', open: ds.open, eyes: f > L1 ? 'fear' : 'dot', browInner: 0.9, browHeight: 0.3, lookX: -0.6, gulp: iv(f, [L1 + 34, L1 + 48], [0, 1])}), seed: 1, dart: 1.6})} />
    </Cam>
  );
};

// ---------------- CH5 ----------------
const Coin: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const s = Math.abs(Math.cos(t * 0.2));
  return <g transform={`translate(${x} ${y - Math.max(0, t) * 0.8}) scale(${s} 1)`} opacity={t < 0 ? 0 : iv(t, [0, 6, 40, 50], [0, 1, 1, 0])}><circle r={26} fill="#E2B23A" stroke={INK} strokeWidth={4} /><text y={10} textAnchor="middle" fontFamily="FrauncesBlack" fontSize={28} fill="#8A6A1A">£</text></g>;
};
export const s27_prize = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ms = speech(sh, 'MOREHOUSE', gf);
  const L1 = ls(sh, 1);
  const rub = Math.sin(f * 0.6);
  const cuts: Cut[] = [{at: 0, z0: 1.5, z1: 1.65, f0: [820, 450], f1: [840, 440]}, {at: L1 - 6, z0: 1.15, z1: 1.2, f0: [960, 540], f1: [980, 540]}];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <Deck f={f} mode="day" roll={roll(f + 1500, 1)} showShip={<Ship f={f} x={1600} y={590} s={0.14} torn />} />
      <Actor L={MOREHOUSE} x={820} y={Y(1.2)} s={1.2} p={mkPose(f, {hF: f < L1 ? [70 + rub * 8, -110] : [150, -120], hB: f < L1 ? [80 - rub * 8, -104] : [40, 2], lean: 4, head: {turn: 0.6, eyes: f < L1 ? 'sly' : 'dot', mouth: ms.talking ? ms.mouth : 'grin', open: ms.open, browInner: -0.4, lookX: 0.6}, seed: 7})} poseF={f >= L1 ? 'point' : undefined} />
      {f >= L1 && <Actor L={DEVEAU} x={1260} y={Y(1.15)} s={1.15} flip p={mkPose(f, {hF: [50, -20], head: dvH({turn: 0.5, mouth: 'line', eyes: f > L1 + 50 ? 'half' : 'dot', browInner: 0.4, lookX: 0.5}), seed: 1})} />}
      {f < L1 && [0, 1, 2, 3, 4].map((i) => <Coin key={i} x={700 + i * 60} y={240} t={f - 30 - i * 12} />)}
      <Tag x={420} y={140} t={f - 40} text="Salvage" sub="a share of ship + cargo" size={46} />
    </Cam>
  );
};

export const s28_storm = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const lt = lightning(f, [50, 150]);
  const r = roll(f, 2.6);
  if (f < L1 - 6) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.1, z1: 1.2, f0: [900, 560], f1: [920, 550]}]} dur={L1} shake={2 + lt * 6}>
          <Deck f={f} mode="storm" mc roll={r} />
          <Wheel x={760} y={700} rot={Math.sin(f * 0.07) * 70} />
          <Actor L={DEVEAU} x={880} y={Y(1.15)} s={1.15} p={mkPose(f, {hF: [140, -170 + Math.sin(f * 0.07) * 20], hB: [120, -140], lean: 10 + r.rot * 2, head: dvH({eyes: 'squeeze', mouth: 'zigzag', browInner: 0.6, tilt: r.rot * 2}), seed: 1})} gripF gripB />
          <Rain f={f} amt={1} />
        </Cam>
        <rect width={1920} height={1080} fill="#D8E8FF" opacity={lt * 0.55} />
      </g>
    );
  }
  const t = f - L1 + 6;
  const yawn = iv(t, [10, 30, 50], [0, 1, 0]);
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 2.7, z1: 2.9, f0: [900, 400], f1: [900, 390]}]} dur={dur - L1}>
      <Deck f={f} mode="night" mc roll={roll(f, 1.2)} />
      <Actor L={DEVEAU} x={880} y={Y(1.15)} s={1.15} p={mkPose(f, {hF: [140, -170], hB: [120, -140], head: dvH({eyes: yawn > 0.3 ? 'squeeze' : 'half', mouth: yawn > 0.2 ? 'O' : 'line', open: yawn, tilt: 6 + yawn * 8, browInner: 0.5}), seed: 1, dart: 0})} gripF gripB />
      <Rain f={f} amt={0.5} />
    </Cam>
  );
};

export const s29_arrive = ({lf, sh, dur}: SP) => {
  const f = lf;
  const C = ls(sh, 1) - 4;
  if (f < C) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [920, 540]}]} dur={C}>
          <Rock f={f} mode="dusk" />
          <Ship f={f} x={iv(f, [0, C], [1700, 1250])} y={700} s={0.22} torn flip />
          <Ship f={f} x={500} y={690} s={0.14} />
        </Cam>
        <Tag x={420} y={150} t={f - 20} text="Gibraltar, 13 Dec 1872" size={46} />
      </g>
    );
  }
  const t = f - C;
  const drop1 = t > 22;
  return (
    <g>
      <Cam lf={t} cuts={[{at: 0, z0: 2.5, z1: 2.6, f0: [960, 420], f1: [960, 410]}]} dur={dur - C}>
        <Rock f={f} mode="dusk" />
        <Actor L={DEVEAU} x={960} y={Y(1.15)} s={1.15} p={mkPose(t, {hF: [40, -10], head: dvH({turn: 0.3, eyes: drop1 ? 'dot' : 'happy', mouth: drop1 ? 'frown' : 'grin', open: 0.3, browInner: drop1 ? 0.8 : -0.2, browHeight: drop1 ? 0.4 : 0.4, lookX: 0}), seed: 1, dart: 0})} />
      </Cam>
      <Stamp x={960} y={860} t={t - 22} text="INVESTIGATION" size={80} rot={-8} />
    </g>
  );
};

export const s29b_testimony = ({lf, dur}: SP) => {
  const f = lf;
  const talk = (Math.sin(f * 0.55) * 0.5 + 0.5) * (Math.sin(f * 0.07) > -0.3 ? 1 : 0);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [1000, 540]}, {at: Math.round(dur * 0.5), z0: 2.0, z1: 2.15, f0: [1700, 440], f1: [1700, 430]}]} dur={dur}>
        <Court f={f} />
        <Actor L={DEVEAU} x={1710} y={Y(1.1) - 30} s={1.1} flip p={mkPose(f, {hF: [120 + Math.sin(f * 0.2) * 20, -140 + Math.sin(f * 0.27) * 20], hB: [80, -60], head: dvH({turn: 0.45, mouth: talk > 0.15 ? 'talk' : 'line', open: talk * 0.6, browInner: 0.4, lookX: 0.5}), seed: 1})} poseF="open" />
        <rect x={1490} y={760} width={440} height={145} fill="#4A3220" stroke={INK} strokeWidth={6} />
        <Actor L={extraLook(77)} x={960} y={Y(1.0) - 330} s={1.0} p={mkPose(f, {hF: [90, -90], head: {turn: 0.3, eyes: 'half', mouth: 'line', lookX: 0.6}, seed: 33})} />
      </Cam>
      <Tag x={460} y={150} t={f - 20} text="Salvage court, Gibraltar" sub="from 17 December 1872" size={44} />
    </g>
  );
};

export const s30_flood = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const fs = speech(sh, 'FLOOD', gf);
  const L1 = ls(sh, 1);
  const glint = iv(f, [30, 36, 44], [0, 1, 0]);
  const jab = fs.talking ? Math.max(0, Math.sin(f * 0.3)) : 0;
  const cuts: Cut[] = [{at: 0, z0: 1.4, z1: 1.5, f0: [330, 520], f1: [330, 500]}, {at: L1 - 4, z0: 1.9, z1: 2.1, f0: [360, 380], f1: [370, 370]}, {at: L1 + 120, z0: 1.15, z1: 1.2, f0: [700, 520], f1: [720, 520]}];
  const c = f >= L1 + 120 ? 2 : f >= L1 - 4 ? 1 : 0;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} rot={c === 0 ? 4 : 0} shake={fs.talking ? fs.amp * 3 : 0}>
        <Court f={f} />
        <Actor L={FLOOD} x={300} y={Y(1.2)} s={1.2} p={mkPose(f, {hF: fs.talking ? [130 + jab * 30, -200 + jab * 20] : [90, -60], hB: [70, -50], lean: fs.talking ? 6 : -4, head: {turn: 0.7, mouth: fs.talking ? fs.mouth : 'line', open: fs.open, eyes: fs.talking ? 'dot' : 'sly', browInner: fs.talking ? -0.9 : -0.4, browHeight: fs.talking ? 0.2 : -0.1, lookX: 0.8, tilt: -6}, seed: 9, dart: 0.4})} poseF={fs.talking ? 'point' : undefined} />
        {c === 2 && <Actor L={DEVEAU} x={1710} y={Y(1.1) - 30} s={1.1} flip p={mkPose(f, {hF: [40, -40], head: dvH({turn: 0.5, eyes: 'fear', eyePop: 0.4, mouth: 'O', open: 0.4, browInner: 1, browHeight: 0.8}), seed: 1})} />}
        {c === 2 && <rect x={1490} y={760} width={440} height={145} fill="#4A3220" stroke={INK} strokeWidth={6} />}
        <g transform="translate(395 300)" opacity={glint}><path d="M0 -40 L8 -8 L40 0 L8 8 L0 40 L-8 8 L-40 0 L-8 -8 Z" fill="#FFF8DC" /></g>
      </Cam>
      {c === 0 && <Tag x={1300} y={200} t={f - 20} text="Frederick Solly-Flood" sub="Attorney General of Gibraltar" size={46} />}
    </g>
  );
};

export const s31_accuse = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const fs = speech(sh, 'FLOOD', gf), ds = speech(sh, 'DEVEAU', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const MON = L2 + 22;
  const d = drop(f - MON, -240, 40, 2.0, 0.4, 6);
  const cuts: Cut[] = [
    {at: 0, z0: 1.3, z1: 1.4, f0: [1200, 520], f1: [1220, 510]},
    {at: L1 - 4, z0: 2.7, z1: 2.9, f0: [1700, 380], f1: [1700, 370]},
    {at: L2 - 4, z0: 2.6, z1: 2.8, f0: [360, 400], f1: [360, 400]},
  ];
  const c = f >= L2 - 4 ? 2 : f >= L1 - 4 ? 1 : 0;
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <Court f={f} />
      <Actor L={FLOOD} x={300} y={Y(1.2)} s={1.2} p={mkPose(f, {hF: c === 0 ? [150, -150] : [80, -60], hB: [70, -50], lean: c === 2 ? -6 : 8, head: {turn: 0.7, mouth: fs.talking ? fs.mouth : f > MON ? 'O' : 'line', open: fs.talking ? fs.open : f > MON ? 0.4 : 0, eyes: c === 2 && f < MON ? 'sly' : 'dot', browInner: -0.8, lookX: 0.8, tilt: c === 2 ? -10 : 0}, seed: 9, dart: 0.3})} poseF={c === 0 ? 'point' : undefined} />
      {f > MON && <g transform={`translate(${380 + (f - MON) * 0.6} ${Y(1.2) + d.y * 1.0}) rotate(${d.rot})`}><circle r={22} fill="#DCEAF0" fillOpacity={0.4} stroke="#C9A35A" strokeWidth={5} /></g>}
      <Actor L={DEVEAU} x={1710} y={Y(1.1) - 30} s={1.1} flip p={mkPose(f, {hF: [60, -40], head: dvH({turn: 0.5, mouth: ds.talking ? ds.mouth : 'line', open: ds.open, eyes: 'dot', browInner: -0.3, browHeight: -0.1, lookX: 0.6}), seed: 1})} />
      <rect x={1490} y={760} width={440} height={145} fill="#4A3220" stroke={INK} strokeWidth={6} />
    </Cam>
  );
};

export const s32_evidence = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 530]}, {at: L1 - 4, z0: 1.15, z1: 1.2, f0: [960, 560], f1: [980, 560]}]} dur={dur}>
      <Board />
      <Card x={420} y={480} w={480} h={340} t={f - 30} title="CUTS IN THE BOW" lines={['deliberate?']} rot={-3} />
      <Card x={960} y={520} w={480} h={340} t={f - 70} title="STAINS: SWORD" lines={['blood?']} rot={2} />
      <Card x={1500} y={480} w={480} h={340} t={f - 110} title="STAINS: RAIL" lines={['blood?']} rot={-2} />
      <path d="M420 330 Q690 260 960 370 Q1230 260 1500 330" stroke="#B3201A" strokeWidth={4} fill="none" opacity={iv(f, [120, 140], [0, 1])} />
      <Stamp x={960} y={560} t={f - L1 - 50} text="NOT BLOOD" size={70} />
      <Stamp x={1500} y={520} t={f - L1 - 60} text="NOT BLOOD" size={60} rot={8} />
      <Stamp x={420} y={520} t={f - L1 - 150} text="THE SEA?" size={60} rot={-6} color="#2E4A6A" />
    </Cam>
  );
};

export const s33_award = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const pie = iv(f, [140, 190], [0, 0.2]);
  const a = pie * Math.PI * 2;
  if (f < L1 - 6) {
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 530]}]} dur={L1}>
        <DarkTable f={f} />
        <g transform="translate(1340 560)">
          <circle r={250} fill="#5A4632" stroke={INK} strokeWidth={6} />
          {pie > 0 && <path d={`M0 0 L0 -250 A250 250 0 ${pie > 0.5 ? 1 : 0} 1 ${Math.sin(a) * 250} ${-Math.cos(a) * 250} Z`} fill="#E2B23A" stroke={INK} strokeWidth={5} />}
          <text y={330} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={44} fill="#E8D8B0" opacity={iv(f, [190, 210], [0, 1])}>about a fifth of the value</text>
        </g>
        <BigWord x={600} y={500} t={f - 40} text="£1,700" size={170} color="#E2B23A" />
      </Cam>
    );
  }
  const t = f - L1 + 6;
  return (
    <g>
      <Cam lf={t} cuts={[{at: 0, z0: 1.3, z1: 1.4, f0: [960, 520], f1: [960, 510]}]} dur={dur - L1}>
        <Court f={f} />
        <Actor L={FLOOD} x={600} y={Y(1.2)} s={1.2} p={mkPose(t, {hF: [70, -110], hB: [80, -104], head: {turn: 0.6, eyes: 'half', mouth: 'frown', browInner: -0.9, lookX: 0.7}, seed: 9})} />
        <Actor L={DEVEAU} x={1300} y={Y(1.15)} s={1.15} flip p={mkPose(t, {hF: [70, -60], head: dvH({turn: 0.5, mouth: 'line', eyes: 'half', browInner: 0.2, lookX: 0.4}), seed: 1})} />
      </Cam>
      <Stamp x={960} y={220} t={t - 20} text="NO CHARGES" size={80} />
    </g>
  );
};
void Bars; void Focus; void flinch; void le; void Look;
