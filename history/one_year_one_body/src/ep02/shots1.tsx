// You Were There Ep 1 — shots ch1–3 (hook, the Dei Gratia, nobody home)
import React from 'react';
import {DEVEAU, WRIGHT, MOREHOUSE, HeadPose, Look, Puppet, Lantern} from '../rig';
import {walk, spring, clamp01, lerp, flinch, drop, roll, blinkAt, ease} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, le, speech, FreezeLabel, Tag, BigWord, Stamp, INK, FLOOR, EOut, EBack, Cut, Y, Focus, rack, Spray, Bars, Card} from './kit';
import {Deck, Sea, Sky, Ship, Yawl, Hatch, Pump, Binnacle, Galley, DarkTable, MapAtlantic, MAP, Barrel, RopeCoil, Wheel} from './sets';

export const dvH = (o: Partial<HeadPose> = {}): Partial<HeadPose> => ({turn: 0.6, browInner: 0.15, ...o});
export const Scope: React.FC<{ext?: number}> = ({ext = 1}) => (
  <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-10} y={-11} width={60} height={22} rx={4} fill="#8A6A3A" />
    <rect x={40} y={-9} width={46 * ext} height={18} fill="#C9A35A" />
    <rect x={40 + 46 * ext} y={-7} width={30 * ext} height={14} fill="#D8B86A" />
  </g>
);
export const Rod: React.FC = () => (
  <g stroke={INK} strokeWidth={4}><rect x={-10} y={-5} width={170} height={10} rx={4} fill="#8C6B4A" />{[30, 70, 110, 150].map((x) => <path key={x} d={`M${x} -5 v10`} stroke="#3A2818" strokeWidth={3} />)}<path d="M-10 0 q-30 10 -60 -4" fill="none" stroke="#B89A6A" strokeWidth={4} /></g>
);
export const Mug: React.FC = () => (<g stroke={INK} strokeWidth={4}><path d="M-4 -24 H36 L32 20 H0 Z" fill="#E8E0D0" /><path d="M36 -14 q16 2 12 16 q-4 8 -14 6" fill="none" strokeWidth={5} /></g>);
export const Biscuit: React.FC = () => (<g stroke={INK} strokeWidth={4}><rect x={0} y={-22} width={44} height={44} rx={6} fill="#D8B878" />{[[12, -10], [30, -6], [16, 8], [32, 10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.5} fill="#8A6A3A" strokeWidth={0} />)}</g>);

// rowing boat pair
const Rower: React.FC<{L: Look; x: number; y: number; f: number; ph: number; flip?: boolean; head: Partial<HeadPose>; seed: number; s?: number}> = ({L, x, y, f, ph, flip, head, seed, s = 0.9}) => {
  const a = Math.sin(ph * Math.PI * 2);
  return <Actor L={L} x={x} y={y} s={s} flip={flip} shadow={false} p={mkPose(f, {legF: [1.4, 1.2], legB: [1.3, 1.1], lean: 10 + a * 18, hF: [100 + a * 40, -90 + a * 10], hB: [90 + a * 40, -80 + a * 10], head, seed})} gripF gripB />;
};

// ---------------- CH1 ----------------
export const s01_sail = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ws = speech(sh, 'WRIGHT', gf);
  const r = roll(f, 1.2);
  const cuts: Cut[] = [
    {at: 0, z0: 1.75, z1: 1.9, f0: [640, 300], f1: [660, 280]},
    {at: ls(sh, 1) + 2, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [1000, 540]},
    {at: ls(sh, 1) + 110, z0: 2.2, z1: 2.4, f0: [1180, 520], f1: [1190, 510]},
  ];
  const c = cuts.findIndex((x, i) => f >= x.at && (i === cuts.length - 1 || f < cuts[i + 1].at));
  const wk = clamp01((f - cuts[1].at) / 90);
  const st = walk(f / 22, wk < 1 && f > cuts[1].at ? 1 : 0);
  const dx = lerp(700, 1140, ease(wk));
  const spr = f - (cuts[1].at + 60);
  const fl = flinch(spr);
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} rot={c === 0 ? -5 : 0} shake={ws.talking ? 2 : 0}>
        <Deck f={f} mode="day" roll={r} camX={c === 0 ? 0 : (f - 60) * 0.6} />
        {/* Wright up in the shrouds, pointing (low angle in shot 1) */}
        <Actor L={WRIGHT} x={640} y={420} s={1.05} p={mkPose(f, {legF: [0.5, 0.9], legB: [-0.3, 0.4], lean: -4, hF: [150, -220 + Math.sin(f * 0.3) * 6], hB: [-40, -250], head: {turn: 0.8, mouth: ws.mouth, open: ws.open, eyes: ws.talking ? 'fear' : 'dot', eyePop: ws.talking ? 0.4 : 0, browHeight: 0.8, lookX: 1}, seed: 5})} poseF="point" gripB />
        <Actor L={DEVEAU} x={dx} y={Y(1.15) + fl.bob} s={1.15} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean + fl.lean, hF: wk < 1 ? [-10 + st.swing * 30, 6] : [90, -60], hB: [40 - st.swing * 30, 4], head: dvH({turn: 0.75, tilt: fl.tilt, eyes: fl.on > 0.3 ? 'squeeze' : 'dot', mouth: fl.on > 0.3 ? 'grin' : 'line', lookX: 0.7, browInner: 0.4}), seed: 1})} />
        <Spray x={1250} y={640} t={spr} n={26} s={1.4} />
      </Cam>
      {c === 0 && <Bars k={1} />}
    </g>
  );
};

export const s02_scope = ({lf, dur}: SP) => {
  const f = lf;
  const CUT = 90;
  const antic = f < 18 ? iv(f, [8, 18], [0, 1]) : 0;
  const up = spring(f, 18, 0.26, 0.16);
  const r = roll(f + 200, 1);
  if (f < CUT) {
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 2.0, z1: 2.25, f0: [1040, 470], f1: [1050, 450]}]} dur={CUT}>
        <Deck f={f} mode="day" roll={r} />
        <Actor L={DEVEAU} x={980} y={Y(1.15)} s={1.15} p={mkPose(f, {hF: [lerp(80, 70, up), lerp(-40 + antic * 20, -226, up)], hB: [lerp(40, 110, up), lerp(0, -214, up)], lean: -4 * up + antic * 4, bob: antic * 6, head: dvH({turn: 0.85, eyes: up > 0.8 ? 'squeeze' : 'dot', lookX: 0.8, mouth: 'line'}), seed: 1, dart: 0.3})}
          propF={<Scope ext={clamp01(up)} />} propAngF={lerp(60, -70, clamp01(up))} gripF gripB />
      </Cam>
    );
  }
  const t = f - CUT;
  const wob = [Math.sin(t * 0.13) * 18 + Math.sin(t * 0.37) * 6, Math.cos(t * 0.11) * 12];
  return (
    <g>
      <Cam lf={t} cuts={[{at: 0, z0: 2.3, z1: 2.6, f0: [960 + wob[0], 520 + wob[1]], f1: [960 + wob[0], 520 + wob[1]]}]} dur={dur - CUT}>
        <Sky f={f} mode="day" horizon={560} />
        <Sea f={f} mode="day" horizon={560} rough={1.1} />
        <Ship f={f} x={980} y={560} s={0.12} torn rot={Math.sin(f * 0.05) * 5} />
      </Cam>
      <path d="M0 0 H1920 V1080 H0 Z M960 540 m-430 0 a430 430 0 1 0 860 0 a430 430 0 1 0 -860 0" fill="#050302" fillRule="evenodd" />
      <circle cx={960} cy={540} r={430} fill="none" stroke="#2A1C12" strokeWidth={26} />
      <path d="M940 540 H980 M960 520 V560" stroke="#2A1C12" strokeWidth={3} opacity={0.5} />
    </g>
  );
};

export const s03_drift = ({lf, dur}: SP) => {
  const f = lf;
  const yaw = Math.sin(f * 0.045) * 9;
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.18, f0: [960, 520], f1: [1020, 470]}]} dur={dur}>
      <Sky f={f + 400} mode="storm" horizon={600} />
      <Sea f={f} mode="storm" horizon={600} rough={1.4} from={0} />
      <Ship f={f} x={1020} y={640 + Math.sin(f * 0.06) * 8} s={0.62} torn rot={yaw * 0.4} flip={yaw > 4} />
      <g transform="translate(0 40)"><Sea f={f + 30} mode="storm" horizon={660} rough={1.6} from={2} /></g>
      <Tag x={420} y={150} t={lf - 30} text="The Atlantic, 4 Dec 1872" sub="between the Azores and Portugal" size={44} />
    </Cam>
  );
};

export const s04_hail = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ms = speech(sh, 'MOREHOUSE', gf);
  const L2 = ls(sh, 2);
  const r = roll(f + 500, 1);
  const cuts: Cut[] = [
    {at: 0, z0: 1.9, z1: 2.05, f0: [820, 470], f1: [830, 460]},
    {at: le(sh, 0) + 6, z0: 1.0, z1: 1.04, f0: [960, 540], f1: [960, 540]},
    {at: L2 - 6, z0: 1.45, z1: 1.55, f0: [960, 560], f1: [980, 550]},
  ];
  const c = cuts.findIndex((x, i) => f >= x.at && (i === cuts.length - 1 || f < cuts[i + 1].at));
  if (c === 1) {
    const t = f - cuts[1].at;
    return (
      <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [960, 560]}]} dur={L2 - cuts[1].at}>
        <Sky f={f} mode="storm" horizon={600} /><Sea f={f} mode="storm" horizon={600} rough={1.3} />
        <Ship f={f} x={960} y={620} s={0.4} torn rot={Math.sin(f * 0.05) * 4} />
      </Cam>
    );
  }
  const turn = c === 2 ? spring(f, L2 - 6, 0.3, 0.17) : 0;
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <Deck f={f} mode="day" roll={r} showShip={<Ship f={f} x={1500} y={580} s={0.12} torn />} />
      <Actor L={MOREHOUSE} x={840} y={Y(1.2)} s={1.2} flip={turn > 0.5} p={mkPose(f, {
        hF: c === 0 ? [70, -230] : [120, -110], hB: c === 0 ? [90, -224] : [40, 2], lean: c === 0 ? 6 : 2,
        head: {turn: c === 0 ? 0.8 : 0.5, mouth: ms.mouth, open: ms.open, browInner: c === 0 ? 0.3 : -0.2, browHeight: c === 0 ? 0.6 : 0, lookX: c === 0 ? 1 : 0.6}, seed: 7})}
        poseF={c === 2 ? 'point' : 'open'} poseB="open" />
      {c === 2 && <Actor L={DEVEAU} x={1280} y={Y(1.15)} s={1.15} flip p={mkPose(f, {hF: [40, -20], head: dvH({lookX: 0.6, eyes: f > L2 + 30 ? 'fear' : 'dot', eyePop: f > L2 + 30 ? spring(f, L2 + 30) * 0.5 : 0, browInner: 0.7, browHeight: 0.5}), seed: 1})} />}
    </Cam>
  );
};

export const s05_aye = ({lf, gf, sh, dur}: SP) => {
  const FREEZE = le(sh, 0) + 10;
  const frozen = lf >= FREEZE;
  const f = Math.min(lf, FREEZE);
  const ds = speech(sh, 'DEVEAU', sh.start + f);
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={f} cuts={[{at: 0, z0: 2.6, z1: 2.8, f0: [1010, 420], f1: [1010, 410]}]} dur={dur}>
          <Deck f={f} mode="day" roll={roll(f + 900, 1)} />
          <Actor L={DEVEAU} x={960} y={Y(1.15)} s={1.15} p={mkPose(f, {hF: [70, -30], head: dvH({turn: 0.35, mouth: ds.talking ? ds.mouth : 'line', open: ds.open, gulp: iv(f, [ls(sh, 0) - 14, ls(sh, 0) - 2], [0, 1]), browInner: 0.9, browHeight: 0.6, eyes: 'dot', lookX: -0.2}), seed: 1, dart: 0.6})} />
        </Cam>
      </g>
      {frozen && <FreezeLabel t={lf - FREEZE} title="OLIVER DEVEAU" sub="First mate. Did not volunteer." />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.7, 0])} />}
    </g>
  );
};

const Person: React.FC<{x: number; y: number; s: number; c: string; o: number}> = ({x, y, s, c, o}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}><ellipse cx={0} cy={-150} rx={36} ry={44} fill={c} /><path d="M-44 -100 Q0 -120 44 -100 L50 40 H-50 Z" fill={c} /></g>
);
export const s06_promise = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const seg = f < L1 ? Math.min(2, Math.floor(f / (L1 / 3))) : 3;
  const segAt = seg < 3 ? (seg * L1) / 3 : L1;
  const t = f - segAt;
  const items = [
    {w: 'NO CREW', el: <g transform="translate(960 380) scale(2.6)"><Hatch x={0} y={0} open cover={[40, 150, 6]} /></g>},
    {w: 'NO BOAT', el: <g transform="translate(960 560) scale(2.2)">{[-160, 160].map((x) => <path key={x} d={`M${x - 40} 40 L${x - 30} 0 L${x + 30} 0 L${x + 40} 40 Z`} fill="#5A3D27" stroke={INK} strokeWidth={5} />)}<path d="M-230 -10 L230 -10 Q250 -10 260 -40 Q250 50 180 70 L-170 70 Q-240 50 -250 -30 Z" fill="none" stroke="#E8D8B0" strokeWidth={4} strokeDasharray="16 12" opacity={0.8} /></g>},
    {w: 'NO ANSWER', el: <g transform="translate(960 420) scale(3.6)"><Binnacle x={0} y={60} broken /></g>},
  ];
  return (
    <g>
      <Cam lf={lf} cuts={[0, 1, 2, 3].map((i) => ({at: i < 3 ? (i * L1) / 3 : L1, z0: 1.0, z1: 1.1, f0: [960 + (i % 2 ? 50 : -50), 540] as [number, number], f1: [960, 530] as [number, number]}))} dur={dur}>
        <DarkTable f={f} />
        {seg < 3 && items[seg].el}
        {seg === 3 && Array.from({length: 10}, (_, i) => {
          const gone = t > 20 + i * 9;
          return <Person key={i} x={330 + i * 140} y={760 + (i % 2) * 10} s={i === 9 ? 0.55 : i === 8 ? 0.85 : 1} c="#E8D8B0" o={gone ? Math.max(0, 1 - (t - 20 - i * 9) / 6) : 0.85} />;
        })}
      </Cam>
      {seg < 3 && <BigWord x={960} y={900} t={t - 4} text={items[seg].w} size={130} />}
      {seg === 3 && <BigWord x={960} y={220} t={t - 100} text="GONE" size={170} />}
    </g>
  );
};

export const s07_title = ({lf, dur}: SP) => {
  const f = lf;
  const a = iv(f, [0, 14], [0, 1], EOut);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 530]}]} dur={dur}>
        <Sky f={f} mode="dusk" horizon={640} />
        <Sea f={f} mode="dusk" horizon={640} rough={0.8} />
        <Ship f={f} x={520} y={690} s={0.5} torn dark rot={Math.sin(f * 0.05) * 3} />
      </Cam>
      <rect width={1920} height={1080} fill="#0E0805" opacity={0.25} />
      <g opacity={a} transform={`translate(0 ${(1 - a) * 30})`}>
        <text x={1340} y={330} textAnchor="middle" fontFamily="FellSC" fontSize={54} fill="#E8D8B0" letterSpacing={8}>YOU WERE THERE</text>
        <path d="M1080 360 H1600" stroke="#E5503A" strokeWidth={4} />
        <text x={1340} y={470} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={96} fill="#F3E7CF">You Find the</text>
        <text x={1340} y={590} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={120} fill="#E2B23A">Ghost Ship</text>
        <text x={1340} y={680} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={58} fill="#E8D8B0">The Mary Celeste, 1872</text>
      </g>
    </g>
  );
};

// ---------------- CH2 ----------------
export const s08_map = ({lf, dur}: SP) => {
  const f = lf;
  const prog = ease(clamp01((f - 20) / 220));
  const p = [lerp(MAP.ny[0] + 60, MAP.found[0], prog), lerp(MAP.ny[1] + 30, MAP.found[1], prog) - Math.sin(prog * Math.PI) * 60];
  const cuts: Cut[] = [{at: 0, z0: 0.92, z1: 1.0, f0: [960, 560], f1: [1000, 540]}, {at: 200, z0: 1.8, z1: 1.95, f0: [1300, 520], f1: [1330, 515]}];
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <MapAtlantic f={f} />
        <path d={`M${MAP.ny[0] + 60} ${MAP.ny[1] + 30} Q${(MAP.ny[0] + MAP.found[0]) / 2} ${MAP.ny[1] - 90} ${p[0]} ${p[1]}`} stroke="#B3362B" strokeWidth={8} strokeDasharray="14 14" fill="none" opacity={0.9} />
        <g transform={`translate(${p[0]} ${p[1]}) scale(0.09)`}><Ship f={f} x={0} y={0} /></g>
        <Tag x={p[0]} y={p[1] - 110} t={f - 30} text="Dei Gratia" size={34} />
        {f > 200 && <g transform={`translate(${MAP.found[0] + 60} ${MAP.found[1] - 10}) scale(0.08)`}><Ship f={f} x={0} y={0} torn /></g>}
        {f > 200 && <Tag x={MAP.found[0] + 90} y={MAP.found[1] - 110} t={f - 214} text="Mary Celeste" size={34} rot={3} />}
      </Cam>
      <Tag x={420} y={130} t={lf - 10} text="Oliver Deveau" sub="first mate · from Nova Scotia" size={50} />
      <g opacity={iv(lf, [40, 60, dur - 20, dur], [0, 1, 1, 0])}>
        <rect x={560} y={1010} width={800} height={50} rx={8} fill="#120B08" opacity={0.6} />
        <text x={960} y={1044} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={32} fill="#E8D8B0">animated reconstruction · dialogue dramatized</text>
      </g>
    </g>
  );
};

export const s09_deck = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const ws = speech(sh, 'WRIGHT', gf), ds = speech(sh, 'DEVEAU', gf);
  const r = roll(f, 1.6);
  const SPLASH = 70;
  const fl = flinch(f - SPLASH - 6);
  const drip = f > SPLASH ? 1 : 0;
  const cuts: Cut[] = [
    {at: 0, z0: 1.15, z1: 1.25, f0: [900, 560], f1: [880, 560]},
    {at: L1 - 4, z0: 1.6, z1: 1.7, f0: [900, 520], f1: [920, 520]},
    {at: L2 - 4, z0: 2.7, z1: 2.9, f0: [770, 410], f1: [770, 400]},
  ];
  const st = walk(f / 20, f > L1 - 40 && f < L1 + 20 ? 1 : 0);
  const wx = iv(f, [L1 - 40, L1 + 20], [1500, 1080]);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} shake={fl.on * 6}>
      <Deck f={f} mode="storm" roll={r} />
      <Wheel x={620} y={700} rot={Math.sin(f * 0.04) * 30} s={1} />
      <Actor L={DEVEAU} x={760} y={Y(1.15) + fl.bob} s={1.15} p={mkPose(f, {hF: [140, -150 + Math.sin(f * 0.04) * 8], hB: [130, -110], lean: 4 + fl.lean, head: dvH({tilt: fl.tilt, eyes: f > SPLASH && f < SPLASH + 30 ? 'squeeze' : f > L2 - 4 ? 'half' : 'dot', mouth: ds.talking ? ds.mouth : f > SPLASH && f < SPLASH + 30 ? 'zigzag' : 'line', open: ds.open, browInner: f > L2 - 4 ? -0.6 : 0.3, browHeight: f > L2 - 4 ? -0.3 : 0, lookX: f > L1 ? 0.8 : 0.5, sweat: drip ? ((f - SPLASH) % 50) / 50 : -1}), seed: 1})} gripF gripB />
      <Actor L={WRIGHT} x={wx} y={Y(1.05)} s={1.05} flip p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, hF: [90, -120], hB: [40 - st.swing * 20, 4], head: {turn: 0.6, mouth: ws.talking ? ws.mouth : 'smile', open: ws.open, eyes: ws.talking ? 'happy' : 'dot', browHeight: 0.4}, seed: 5})} propF={<Mug />} propAngF={-30} gripF />
      <Spray x={880} y={600} t={f - SPLASH} n={34} s={1.8} />
    </Cam>
  );
};

export const s09b_watch = ({lf, dur}: SP) => {
  const f = lf;
  const taps = [40, 58, 76];
  const tap = Math.max(0, ...taps.map((a) => (f >= a && f < a + 8 ? 1 - (f - a) / 8 : 0)));
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.3, z1: 1.45, f0: [900, 560], f1: [920, 540]}]} dur={dur}>
      <Deck f={f} mode="night" roll={roll(f + 300, 0.8)} />
      <g transform="translate(1180 520) scale(1.3)"><circle r={300} fill="url(#candle)" /></g>
      <Actor L={DEVEAU} x={900} y={Y(1.15)} s={1.15} p={mkPose(f, {hF: [120, -150 + tap * 30], hB: [60, -30], head: dvH({eyes: 'half', mouth: tap > 0.5 ? 'zigzag' : 'line', lookX: 0.8, lookY: 0.5, browInner: 0.6}), seed: 1, dart: 0.2})} propF={<Biscuit />} gripF />
      <Actor L={WRIGHT} x={1360} y={Y(1.05) + 70} s={1.05} flip shadow={false} p={mkPose(f, {legF: [1.42, 1.42], legB: [1.3, 1.3], lean: 20, hF: [60, -10], head: {turn: 0.5, eyes: 'half', blink: 1, mouth: 'O', open: 0.2 + 0.15 * Math.sin(f * 0.12), tilt: 16}, seed: 5, dart: 0})} />
      {taps.map((a, i) => f >= a && f < a + 10 && <text key={i} x={1050} y={460 - i * 30} fontFamily="FrauncesBlack" fontSize={46} fill="#E8D8B0" opacity={1 - (f - a) / 10}>tok</text>)}
    </Cam>
  );
};

export const s10_hull = ({lf, sh, dur}: SP) => {
  const f = lf;
  const C = ls(sh, 1) - 6;
  if (f < C) {
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 0.95, z1: 1.35, f0: [960, 560], f1: [1060, 640]}]} dur={C}>
        <Sky f={f} mode="day" horizon={560} />
        <Sea f={f} mode="day" horizon={560} rough={1.1} />
        <Ship f={f} x={1060} y={640 + Math.sin(f * 0.06) * 10} s={0.95} torn rot={Math.sin(f * 0.04) * 3} />
        <g transform="translate(0 40)"><Sea f={f + 10} mode="day" horizon={640} rough={1.3} from={2} /></g>
      </Cam>
    );
  }
  const t = f - C;
  const rk = rack(t, 20, 60, 9);
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 1.25, z1: 1.35, f0: [960, 520], f1: [960, 510]}]} dur={dur - C}>
      <Focus blur={rk.bg} id="hullbg"><g><Sky f={f} mode="day" horizon={560} /><Sea f={f} mode="day" horizon={560} /><Ship f={f} x={1400} y={600} s={0.35} torn /></g></Focus>
      <Focus blur={rk.fg} id="hullfg">
        <g>
          <rect x={-400} y={700} width={2800} height={500} fill="#3E2A1C" />
          <rect x={-400} y={690} width={2800} height={30} fill="#5A3D27" stroke={INK} strokeWidth={5} />
          <Actor L={MOREHOUSE} x={560} y={Y(1.2) + 40} s={1.2} p={mkPose(t, {hF: [110, -60], hB: [90, -56], head: {turn: 0.75, browInner: 0.4, lookX: 0.8, mouth: 'line'}, seed: 7})} />
          <Actor L={DEVEAU} x={840} y={Y(1.15) + 40} s={1.15} p={mkPose(t, {hF: [110, -60], hB: [90, -50], head: dvH({turn: 0.8, lookX: 0.9, browInner: 0.6, mouth: 'frown'}), seed: 1})} />
        </g>
      </Focus>
    </Cam>
  );
};

export const s11_row = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ws = speech(sh, 'WRIGHT', gf), ds = speech(sh, 'DEVEAU', gf);
  const L2 = ls(sh, 2);
  const swell = Math.sin(f * 0.05) * 30, rot = Math.sin(f * 0.05 + 0.8) * 6;
  const ph = f / 46;
  const cuts: Cut[] = [{at: 0, z0: 0.9, z1: 1.0, f0: [960, 560], f1: [900, 580]}, {at: ls(sh, 1) - 6, z0: 1.7, z1: 1.8, f0: [880, 560 + swell * 0.4], f1: [900, 560 + swell * 0.4]}, {at: L2 - 4, z0: 2.5, z1: 2.6, f0: [700, 490 + swell * 0.6], f1: [700, 480 + swell * 0.6]}];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <Sky f={f} mode="day" horizon={500} />
      <Sea f={f} mode="day" horizon={500} rough={1.4} from={0} />
      <Ship f={f} x={1620} y={560} s={0.75} torn rot={Math.sin(f * 0.04) * 3} />
      <Yawl x={860} y={760 + swell} s={1.15} rot={rot}>
        <Rower L={DEVEAU} x={-110} y={-110} f={f} ph={ph} head={dvH({turn: 0.5, mouth: ds.talking ? ds.mouth : 'line', open: ds.open, browInner: f > L2 ? -0.3 : 0.4, eyes: f > L2 ? 'half' : 'dot', lookX: f > L2 ? -0.1 : 0.5})} seed={1} />
        <Rower L={WRIGHT} x={120} y={-110} f={f} ph={ph + 0.1} head={{turn: 0.5, mouth: ws.mouth, open: ws.open, eyes: ws.talking ? 'fear' : 'dot', eyePop: ws.talking ? 0.3 : 0, browInner: 0.8, browHeight: 0.6, lookX: 0.8}} seed={5} />
        {[-60, 180].map((x, i) => <path key={i} d={`M${x} -40 L${x + 220 + Math.sin(ph * Math.PI * 2) * 60} 60`} stroke="#8C6B4A" strokeWidth={12} strokeLinecap="round" />)}
      </Yawl>
      <g transform="translate(0 60)"><Sea f={f + 40} mode="day" horizon={780} rough={1.7} from={3} /></g>
    </Cam>
  );
};

export const s12_climb = ({lf, dur}: SP) => {
  const f = lf;
  const up = ease(clamp01(f / (dur - 20)));
  const ph = f / 16;
  const a = Math.sin(ph * Math.PI * 2);
  return (
    <g>
      {/* LOW ANGLE: camera below the hull looking up, the ship towers over you */}
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.12, f0: [960, 560], f1: [960, 480]}]} dur={dur} rot={7}>
        <Sky f={f} mode="storm" horizon={1400} />
        <g transform="translate(960 1400) scale(2.6)"><Ship f={f} x={-200} y={-120} torn /></g>
        <Actor L={DEVEAU} x={980} y={lerp(1180, 560, up)} s={1.3} shadow={false} p={mkPose(f, {legF: [0.4 + a * 0.4, 0.9], legB: [0.3 - a * 0.4, 0.9], lean: 20, hF: [60, -270 + a * 30], hB: [80, -250 - a * 30], head: dvH({turn: 0.9, lookY: -0.8, lookX: 0.5, eyes: 'squeeze', mouth: 'zigzag', browInner: 0.6}), seed: 1})} gripF gripB />
        <path d={`M1060 -200 L1060 1400`} stroke="#B89A6A" strokeWidth={10} />
      </Cam>
      <Bars k={1} />
    </g>
  );
};

// ---------------- CH3 ----------------
export const s13_empty = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ds = speech(sh, 'DEVEAU', gf);
  const C = ls(sh, 2) - 4;
  const r = roll(f + 1200, 1);
  if (f < C) {
    const pop = spring(f, 4, 0.25, 0.15);
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [960, 560], f1: [940, 560]}, {at: le(sh, 0) + 8, z0: 0.82, z1: 0.86, f0: [960, 520], f1: [960, 520]}]} dur={C}>
        <Deck f={f} mode="day" mc roll={r} />
        <g>
          <Actor L={DEVEAU} x={300} y={lerp(800, Y(1.15) - 10, pop)} s={1.15} p={mkPose(f, {hF: [100, -230], hB: [60, -40], head: dvH({turn: 0.9, mouth: ds.talking ? ds.mouth : 'line', open: ds.open, browInner: 0.7, browHeight: 0.4, lookX: 0.9}), seed: 1, dart: 1.4})} poseF="open" />
          <rect x={-200} y={654} width={900} height={110} fill="#3E2A1C" stroke={INK} strokeWidth={5} />
        </g>
        {ds.talking && <g opacity={0.5}>{[1, 2, 3].map((k) => <text key={k} x={500 + k * 260} y={300 - k * 20} fontFamily="FellItalic" fontStyle="italic" fontSize={56 - k * 10} fill="#E8D8B0" opacity={1 - k * 0.25}>hello?</text>)}</g>}
      </Cam>
    );
  }
  const t = f - C;
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 1.6, z1: 1.85, f0: [1340, 700], f1: [1360, 760]}]} dur={dur - C}>
      <Deck f={f} mode="day" mc roll={r} />
      <path d={`M1340 620 Q${1380 + Math.sin(f * 0.07) * 20} 760 ${1350 + Math.sin(f * 0.05) * 30} 1000`} stroke="#B89A6A" strokeWidth={10} fill="none" />
    </Cam>
  );
};

export const s13b_listen = ({lf, dur}: SP) => {
  const f = lf;
  const seg = Math.min(2, Math.floor(f / (dur / 3)));
  const t = f - (seg * dur) / 3;
  const shots = [
    <Cam key={0} lf={t} cuts={[{at: 0, z0: 2.4, z1: 2.6, f0: [520, 300], f1: [520, 280]}]} dur={dur / 3}><Deck f={f} mode="day" mc roll={roll(f, 1.4)} /></Cam>,
    <Cam key={1} lf={t} cuts={[{at: 0, z0: 1.1, z1: 1.2, f0: [960, 400], f1: [960, 380]}]} dur={dur / 3} rot={-6}><Sky f={f} mode="day" horizon={1200} /><g transform="translate(700 1500) scale(2.2)"><Ship f={f * 2} x={0} y={0} torn /></g></Cam>,
    <Cam key={2} lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.05, f0: [960, 540], f1: [960, 540]}]} dur={dur / 3}><Sky f={f} mode="day" horizon={400} /><Sea f={f} mode="day" horizon={400} rough={1.6} /></Cam>,
  ];
  return <g>{shots[seg]}<Tag x={1600} y={160} t={t - 4} text={['creak', 'flap', 'hush'][seg]} size={44} rot={4} /></g>;
};

export const s14_hatch = ({lf, dur}: SP) => {
  const f = lf;
  const C = Math.round(dur * 0.5);
  if (f < C) {
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 1.4, z1: 1.6, f0: [1060, 700], f1: [1060, 740]}]} dur={C}>
        <Deck f={f} mode="day" mc roll={roll(f + 100, 1)} />
        <Hatch x={700} y={860} open cover={[420, 960, -8]} />
        <Actor L={DEVEAU} x={1000} y={Y(1.15) + 40} s={1.15} flip p={mkPose(f, {lean: 30, hF: [90, -30], hB: [60, 0], head: dvH({turn: 0.8, lookY: 0.8, lookX: 0.6, browInner: 0.5, eyes: 'dot'}), seed: 1})} />
      </Cam>
    );
  }
  const t = f - C;
  const look = spring(t, 20, 0.3, 0.16);
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 2.1, z1: 2.3, f0: [920, 640], f1: [930, 650]}]} dur={dur - C}>
      <Deck f={f} mode="day" mc roll={roll(f + 100, 1)} />
      <Binnacle x={820} y={860} broken tilt={-14} />
      <Actor L={WRIGHT} x={1080} y={Y(1.05) + 90} s={1.05} flip shadow={false} p={mkPose(t, {legF: [1.2, 2.2], legB: [0.9, 2.0], lean: 20, hF: [110, -20 + look * 10], hB: [60, 0], head: {turn: 0.7, lookX: 0.6, lookY: 0.6, eyes: look > 0.5 ? 'fear' : 'dot', eyePop: look * 0.3, browInner: 0.8, browHeight: 0.4, mouth: look > 0.5 ? 'O' : 'line', open: 0.4}, seed: 5})} poseF="point" />
    </Cam>
  );
};

export const s15_pump = ({lf, dur}: SP) => {
  const f = lf;
  const PICK = 100, SLIP = 170;
  const holding = f >= PICK && f < SLIP;
  const d = drop(f - SLIP, 640, 880, 2.4, 0.45, 9);
  const fl = flinch(d.impact >= 0 ? f - SLIP - d.impact : -1);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.3, z1: 1.45, f0: [900, 640], f1: [920, 660]}, {at: SLIP - 4, z0: 1.9, z1: 2.0, f0: [960, 700], f1: [960, 720]}]} dur={dur} shake={fl.on * 3}>
      <Deck f={f} mode="day" mc roll={roll(f + 600, 1)} />
      <Pump x={760} y={880} apart />
      <Pump x={1180} y={880} />
      {f < PICK && <g transform="translate(900 880) rotate(4)"><Rod /></g>}
      {f >= SLIP && <g transform={`translate(${940 + (f - SLIP) * (d.landed ? 0.3 : 2)} ${d.y}) rotate(${d.rot})`}><Rod /></g>}
      <Actor L={DEVEAU} x={980} y={Y(1.15) + 60} s={1.15} flip p={mkPose(f, {legF: [1.0, 1.8], legB: [0.4, 1.0], lean: 24, hF: holding ? [110, -110] : [120, 40], hB: [60, 0], head: dvH({turn: 0.7, lookX: 0.7, lookY: holding ? -0.3 : 0.6, eyes: fl.on > 0.3 ? 'squeeze' : 'dot', mouth: fl.on > 0.3 ? 'grin' : 'line', browInner: 0.4}), seed: 1})} propF={holding ? <Rod /> : undefined} propAngF={-20} gripF={holding} />
      <Actor L={WRIGHT} x={1380} y={Y(1.05) + fl.bob} s={1.05} flip p={mkPose(f, {hF: [80, -200 * fl.on - 40], hB: [60, -170 * fl.on], lean: fl.lean, head: {turn: 0.6, eyes: fl.on > 0.2 ? 'fear' : 'dot', eyePop: fl.on * 0.6, mouth: fl.on > 0.2 ? 'fear' : 'line', open: fl.on, browHeight: fl.on, lookX: 0.6, lookY: 0.4}, seed: 5})} />
      {d.impact >= 0 && f - SLIP - d.impact < 14 && <text x={1000} y={820} fontFamily="FrauncesBlack" fontSize={60} fill="#E8D8B0" opacity={1 - (f - SLIP - d.impact) / 14}>CLACK</text>}
    </Cam>
  );
};

// cross-section of the hull showing the water level
const HullCut: React.FC<{f: number; level: number}> = ({f, level}) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1500} fill="#1A110B" />
    <path d="M360 260 L1560 260 Q1600 700 960 900 Q320 700 360 260 Z" fill="#3E2A1C" stroke={INK} strokeWidth={10} />
    <clipPath id="hullclip"><path d="M376 276 L1544 276 Q1580 690 960 882 Q340 690 376 276 Z" /></clipPath>
    <g clipPath="url(#hullclip)">
      <rect x={300} y={276} width={1300} height={700} fill="#1E140D" />
      {Array.from({length: 4}, (_, r) => Array.from({length: 7}, (_, c) => <Barrel key={`${r}${c}`} x={520 + c * 150} y={760 - r * 120} s={0.8} dark />))}
      <path d={`M300 ${880 - level} Q960 ${870 - level + Math.sin(f * 0.1) * 8} 1600 ${880 - level} V1000 H300 Z`} fill="#3E7C9A" opacity={0.75} />
    </g>
    <path d="M1620 880 V600" stroke="#E8D8B0" strokeWidth={4} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M1610 ${880 - i * 70} h20`} stroke="#E8D8B0" strokeWidth={4} />)}
  </g>
);
export const s16_sound = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ws = speech(sh, 'WRIGHT', gf);
  const L1 = ls(sh, 1);
  const level = iv(f, [20, 120], [0, 245], EOut);
  if (f < L1 - 6) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 0.95, z1: 1.02, f0: [960, 560], f1: [960, 560]}]} dur={L1}>
          <HullCut f={f} level={level} />
        </Cam>
        <BigWord x={1500} y={240} t={f - 110} text="3½ FEET" size={120} />
        <Tag x={480} y={170} t={f - 150} text="not enough to sink her" size={42} />
      </g>
    );
  }
  const t = f - L1 + 6;
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 2.5, z1: 2.65, f0: [980, 420], f1: [990, 410]}]} dur={dur - L1}>
      <Deck f={f} mode="day" mc roll={roll(f + 700, 1)} />
      <Actor L={WRIGHT} x={960} y={Y(1.05)} s={1.05} flip p={mkPose(f, {hF: [70, -60], hB: [60, -60], head: {turn: 0.45, mouth: ws.mouth, open: ws.open, browInner: 0.9, browHeight: 0.4, lookX: 0.3}, seed: 5, dart: 1.2})} poseF="open" poseB="open" />
    </Cam>
  );
};

export const s17_boat = ({lf, dur}: SP) => {
  const f = lf;
  const rk = rack(f, 70, 110, 10);
  const real = f > 120;
  const pop = spring(f, 120, 0.3, 0.15);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.5, z1: 1.7, f0: [1000, 640], f1: [1010, 620]}]} dur={dur}>
      <Focus blur={rk.bg} id="boatbg"><g><Deck f={f} mode="day" mc roll={roll(f + 800, 0.8)} /></g></Focus>
      <Focus blur={rk.fg * 0.8} id="boatfg">
        <g transform="translate(0 40)">
          {[760, 1240].map((x) => <path key={x} d={`M${x - 60} 1000 L${x - 44} 930 L${x + 44} 930 L${x + 60} 1000 Z`} fill="#5A3D27" stroke={INK} strokeWidth={6} />)}
          <g opacity={iv(f, [150, 180], [0, 0.9])}><path d="M560 920 L1440 920 Q1480 920 1500 870 Q1480 1000 1360 1030 L640 1030 Q520 1000 500 860 Q510 920 560 920 Z" fill="none" stroke="#E8D8B0" strokeWidth={6} strokeDasharray="22 16" /></g>
        </g>
      </Focus>
      <Focus blur={rk.bg * 0.6} id="boatdv">
        <Actor L={DEVEAU} x={1180} y={Y(1.15) - 40} s={1.0} flip p={mkPose(f, {hF: real ? [90, -200] : [40, -10], head: dvH({turn: 0.4, eyes: real ? 'fear' : 'dot', eyePop: pop * 0.6, browInner: 1, browHeight: real ? 1 : 0.2, mouth: real ? 'O' : 'line', open: 0.5, lookY: 0.6}), seed: 1, dart: real ? 0 : 1})} poseF="open" />
      </Focus>
      {f > 180 && <Stamp x={960} y={300} t={f - 180} text="BOAT GONE" />}
    </Cam>
  );
};

export const s18_galley = ({lf, dur}: SP) => {
  const f = lf;
  const st = walk(f / 22, f < 80 ? 1 : 0);
  const x = iv(f, [0, 80], [260, 1180]);
  const C = Math.round(dur * 0.62);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [1000, 560]}, {at: C, z0: 1.9, z1: 2.0, f0: [1620, 700], f1: [1640, 700]}]} dur={dur}>
      <Galley f={f} />
      <Actor L={DEVEAU} x={x} y={Y(1.15)} s={1.15} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean, hF: f > C ? [140, -40] : [80, -120], hB: [40 - st.swing * 30, 4], head: dvH({turn: 0.7, lookX: 0.6, lookY: f > C ? 0.6 : 0, browInner: 0.5}), seed: 1})} propF={<g transform="rotate(90) translate(0 10)"><Lantern lit={1} /></g>} gripF />
      <g transform={`translate(${x + 100} ${Y(1.15) - 140})`}><circle r={240} fill="url(#candle)" opacity={0.8} /></g>
    </Cam>
  );
};
void Puppet; void blinkAt; void EBack; void FLOOR; void Card; void Barrel; void RopeCoil;
