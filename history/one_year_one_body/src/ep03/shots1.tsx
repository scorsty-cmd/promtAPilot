// You Were There Ep 2 — shots ch1–3 (hook, the night wire, the man who watched the sun)
import React from 'react';
import {NED, PIKE, PORTLAND, CARRINGTON, HeadPose, Puppet} from '../rig';
import {walk, run, spring, clamp01, lerp, flinch, ease} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, le, speech, FreezeLabel, Tag, BigWord, Stamp, INK, FLOOR, EOut, EBack, Cut, Y, Bars, Card, Sparks, Arc, Smoke, Pulses, Aurora, glowRamp, sitOpts, Chair, seatY, crowdAct, Focus, rack} from './kit';
import {Office, BostonStreet, NightSky, Roofline, TKey, Sounder, Register, Jars, Clock, Observatory, SunDisc, Magnetograph, Space, MapNE, CITIES, DarkTable, OFFICE, DESK_Y} from './sets';
import {OfficeScene, Pike, NED_X, NED_Y, NED_S, nedH, keyHand, tap, SideTable} from './common';
import {extraLook} from '../rig';

const cutIdx = (f: number, cuts: Cut[]) => cuts.reduce((a, c, i) => (f >= c.at ? i : a), 0);

// ---------------- CH1 HOOK ----------------
export const s01_spark = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf);
  const ZAP = 12;
  const fl = flinch(f - ZAP);
  const cuts: Cut[] = [
    {at: 0, z0: 3.4, z1: 3.7, f0: [1010, 560], f1: [1010, 555]},
    {at: 20, z0: 2.7, z1: 2.9, f0: [900, 430], f1: [905, 420]},
    {at: 58, z0: 0.82, z1: 0.9, f0: [1060, 520], f1: [1000, 510]},
    {at: 142, z0: 1.9, z1: 2.1, f0: [1150, 520], f1: [1170, 510]},
  ];
  const c = cutIdx(f, cuts);
  const press = f < ZAP ? tap(f, 1.4) : 0;
  const shake = c === 1 ? Math.sin(f * 1.3) * 30 * Math.max(0, 1 - (f - 20) / 40) : 0;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} shake={fl.on * 10}>
        <OfficeScene f={f} sky="red" skyAmt={0.9} green={0.1} press={press} burn={clamp01((f - ZAP) / 30)} arm={tap(f, 2, 3)} garble
          ned={{lean: 10 + fl.lean, bob: fl.bob, hF: f < ZAP ? keyHand(press) : c === 1 ? [40 + shake * 0.3, -190 + shake] : [60, -170], head: nedH({turn: c === 1 ? 0.3 : 0.6, eyes: f > ZAP ? (c === 1 ? 'fear' : 'dot') : 'half', eyePop: c === 1 ? spring(f, 20) * 0.6 : 0, mouth: ns.talking ? ns.mouth : f > ZAP ? 'fear' : 'line', open: ns.talking ? ns.open : 0.3, browInner: f > ZAP ? 1 : 0, browHeight: f > ZAP ? 1 : 0, tilt: fl.tilt})}}
          nedProps={{poseF: c === 1 ? 'open' : 'mitt'}}
          overDesk={<g><Sparks x={OFFICE.keyX + 70} y={DESK_Y - 50} t={f - ZAP} n={30} s={1.2} /><Arc x1={OFFICE.keyX + 70} y1={DESK_Y - 50} x2={NED_X + 125} y2={NED_Y - 150} f={f} on={f >= ZAP && f < ZAP + 6 ? 1 : 0} /><Smoke x={OFFICE.regX + 320} y={DESK_Y - 70} f={f} amt={clamp01((f - ZAP) / 30)} /></g>} />
      </Cam>
      {c === 2 && <Tag x={1450} y={140} t={f - 70} text="Boston · 2 Sept 1859" sub="the small hours" size={50} />}
      {f >= ZAP && f < ZAP + 3 && <rect width={1920} height={1080} fill="#DFF4FF" opacity={0.75} />}
    </g>
  );
};

export const s02_window = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ps = speech(sh, 'PIKE', gf);
  const L1 = ls(sh, 1);
  const cuts: Cut[] = [
    {at: 0, z0: 1.45, z1: 1.6, f0: [560, 430], f1: [520, 400]},
    {at: 92, z0: 2.3, z1: 2.6, f0: [400, 330], f1: [400, 300]},
    {at: L1 - 8, z0: 1.15, z1: 1.25, f0: [2420, 520], f1: [2380, 510]},
  ];
  const c = cutIdx(f, cuts);
  const red = glowRamp(f, 0, 160);
  // Ned walks from the desk to the window (flip = facing left)
  const wk = clamp01(f / 70);
  const st = walk(f / 20, wk < 1 ? 1 : 0);
  const nx = lerp(820, 600, ease(wk));
  // Pike bursts through the door and runs in
  const pt = f - (L1 - 8);
  const pr = clamp01(pt / 34);
  const prun = run(pt / 14, pr < 1 ? 1 : 0);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} shake={c === 2 && ps.talking ? 3 : 0}>
      <Office f={f} sky="red" skyAmt={0.5 + red * 0.6} green={0} />
      <Actor L={NED} x={nx} y={Y(1.15)} s={1.15} flip p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean - (wk >= 1 ? 4 : 0), hF: wk >= 1 ? [80, -190 + Math.sin(f * 0.1) * 4] : [-10 + st.swing * 30, 6], hB: [40 - st.swing * 30, 4], head: nedH({turn: 0.8, lookY: -0.7, eyes: wk >= 1 ? 'fear' : 'dot', eyePop: wk >= 1 ? spring(f, 70) * 0.5 : 0, mouth: wk >= 1 ? 'O' : 'line', open: 0.5, browHeight: 1}), seed: 1, dart: 0})} poseF="open" />
      <rect x={180} y={60} width={440} height={500} fill="#E0303A" opacity={0.08 + red * 0.1} filter="url(#glow)" />
      {c === 2 && <g>
        <rect x={2720} y={210} width={150} height={260} fill="#E8A070" opacity={0.5} />
        <Pike f={f} x={lerp(2780, 2380, ease(pr))} flip o={{legF: prun.legF, legB: prun.legB, bob: prun.bob, lean: prun.lean, hF: [160, -230 + Math.sin(f * 0.6) * 20], hB: [-70, -240 + Math.cos(f * 0.6) * 20], head: {turn: 0.4, mouth: ps.talking ? ps.mouth : 'O', open: ps.talking ? ps.open : 0.5, eyes: 'fear', eyePop: 0.5, browInner: 1, browHeight: 1.2, sweat: (f % 30) / 30}}} poseF="open" poseB="open" />
      </g>}
    </Cam>
  );
};

export const s03_nofire = ({lf, dur}: SP) => {
  const f = lf;
  const g = clamp01((f - 40) / 110);
  const cuts: Cut[] = [
    {at: 0, z0: 0.95, z1: 1.0, f0: [900, 520], f1: [1100, 500]},
    {at: 96, z0: 1.0, z1: 1.12, f0: [960, 380], f1: [960, 320]},
    {at: 150, z0: 2.4, z1: 2.6, f0: [980, 520], f1: [985, 505]},
  ];
  const c = cutIdx(f, cuts);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} rot={c === 1 ? -4 : 0}>
      <BostonStreet f={f} sky={g < 0.4 ? 'red' : 'aurora'} green={g} camX={f * 1.2} />
      {[200, 420, 1400, 1640, 1820].map((x, i) => <Actor key={i} L={extraLook(i + 11)} x={x} y={Y(0.85)} s={0.85} flip={i % 2 === 1} p={mkPose(f, crowdAct(f, i + 3))} poseF="point" />)}
      <Actor L={NED} x={980} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: [60, -120], hB: [40, -110], lean: -6, head: nedH({turn: 0.2, lookY: -1, eyes: 'dot', mouth: 'O', open: 0.4 + 0.1 * Math.sin(f * 0.1), browHeight: 1.1, browInner: 0.3}), seed: 1, dart: 0})} />
      {c === 1 && <rect x={-400} y={-300} width={2800} height={1500} fill="#4CF0A0" opacity={0.04} />}
    </Cam>
  );
};

export const s04_promise = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const A = L1 / 3;
  const seg = f < L1 ? Math.min(2, Math.floor(f / A)) : f < L1 + 110 ? 3 : 4;
  const segAt = [0, A, 2 * A, L1, L1 + 110][seg];
  const t = f - segAt;
  const words = ['FIRE', 'SHOCKS', 'IMPOSSIBLE', 'NO BATTERY', 'POWERED BY THE SKY'];
  const cutsSeg: Cut[] = [{at: 0, z0: 2.6, z1: 2.9, f0: [1180, 570], f1: [1190, 560]}];
  let el: React.ReactNode = null;
  if (seg === 0) el = <Cam lf={t} cuts={cutsSeg} dur={A}><OfficeScene f={f} sky="red" ned={null} arm={tap(f, 3)} burn={clamp01(t / 40)} garble overDesk={<g><Sparks x={OFFICE.sounderX + 50} y={DESK_Y - 110} t={t % 26} n={26} seed={`p${Math.floor(t / 26)}`} /><Smoke x={OFFICE.regX + 320} y={DESK_Y - 70} f={f} /></g>} /></Cam>;
  if (seg === 1) {
    const fl = flinch(t - 10);
    el = <Cam lf={t} cuts={[{at: 0, z0: 2.4, z1: 2.6, f0: [900, 430], f1: [905, 425]}]} dur={A} shake={fl.on * 12}><OfficeScene f={f} sky="red" ned={{lean: 8 + fl.lean, bob: fl.bob, hF: [130, -140], head: nedH({eyes: t > 10 ? 'dizzy' : 'dot', mouth: t > 10 ? 'zigzag' : 'line', browHeight: 1.3, tilt: fl.tilt})}} overDesk={<Arc x1={OFFICE.keyX + 70} y1={DESK_Y - 50} x2={NED_X + 150} y2={NED_Y - 160} f={f} on={t > 8 && t < 22 ? 1 : 0} />} /></Cam>;
  }
  if (seg === 2) el = <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [960, 540], f1: [960, 520]}]} dur={A}><BostonStreet f={f} sky="aurora" green={0.7} camX={t * 2} /></Cam>;
  if (seg === 3) el = <Cam lf={t} cuts={[{at: 0, z0: 3.0, z1: 3.3, f0: [1790, 520], f1: [1800, 510]}]} dur={110}><OfficeScene f={f} sky="aurora" ned={null} unplug={ease(clamp01((t - 20) / 30))} glow={0.3} /></Cam>;
  if (seg === 4) el = <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.15, f0: [960, 500], f1: [960, 420]}]} dur={dur - segAt}><NightSky f={f} mode="aurora" x0={-400} x1={2400} y1={1000} green={0.9} /><Roofline y={1000} x0={-400} x1={2400} /><Pulses pts={[[-200, 980], [600, 900], [1300, 930], [2200, 880]]} t={t} speed={12} color="#7CFFC0" s={1.4} /></Cam>;
  return (
    <g>
      {el}
      <BigWord x={960} y={seg === 4 ? 860 : 880} t={t - 6} text={words[seg]} size={seg >= 3 ? 120 : 150} color={seg >= 3 ? '#7CFFC0' : '#E5503A'} />
    </g>
  );
};

export const s05_title = ({lf, dur}: SP) => {
  const f = lf;
  const a = iv(f, [0, 14], [0, 1], EOut);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 520]}]} dur={dur}>
        <BostonStreet f={f + 300} sky="aurora" green={0.6} camX={200 + f} />
      </Cam>
      <rect width={1920} height={1080} fill="#0E0805" opacity={0.5} />
      <g opacity={a} transform={`translate(0 ${(1 - a) * 30})`}>
        <text x={960} y={300} textAnchor="middle" fontFamily="FellSC" fontSize={54} fill="#E8D8B0" letterSpacing={8}>YOU WERE THERE · EPISODE 2</text>
        <path d="M640 330 H1280" stroke="#4CF0A0" strokeWidth={4} />
        <text x={960} y={460} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={104} fill="#F3E7CF">The Night the Sky</text>
        <text x={960} y={590} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={128} fill="#E5503A" stroke={INK} strokeWidth={5} paintOrder="stroke">Caught Fire</text>
        <text x={960} y={680} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={48} fill="#E8D8B0">Boston · September 1859</text>
      </g>
    </g>
  );
};

// ---------------- CH2 THE NIGHT WIRE ----------------
export const s06_ned = ({lf, sh, dur}: SP) => {
  const L1 = ls(sh, 1);
  const FREEZE = 130, UNF = L1 - 4;
  const frozen = lf >= FREEZE && lf < UNF;
  const f = frozen ? FREEZE : lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.55, z1: 1.75, f0: [960, 470], f1: [930, 450]},
    {at: UNF, z0: 0.78, z1: 0.84, f0: [1250, 520], f1: [1200, 520]},
    {at: L1 + 130, z0: 2.5, z1: 2.7, f0: [1340, 600], f1: [1350, 590]},
  ];
  const c = cutIdx(lf, cuts);
  const press = tap(f, 1.2, 2);
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={f} cuts={cuts} dur={dur}>
          <OfficeScene f={f} sky="night" press={c === 1 ? 0 : press} arm={press} tapeOff={f * 2}
            ned={{lean: 12, hF: c === 1 ? [60, -150] : keyHand(press), head: nedH({turn: 0.75, lookX: 0.8, lookY: 0.4, mouth: frozen ? 'smile' : 'line', eyes: frozen ? 'happy' : 'dot'})}}
            behind={c === 1 ? <Pike f={f} x={2330} y={Y(1.18)} o={{hF: [70, -100], hB: [60, -90], lean: 4, head: {turn: 0.5, eyes: 'half', lookX: -0.8}}} propF={<g transform="translate(0 -10)"><rect x={0} y={-30} width={90} height={60} fill="#EFE3C6" stroke={INK} strokeWidth={3} /></g>} /> : null} />
        </Cam>
      </g>
      {frozen && <FreezeLabel t={lf - FREEZE} title="NED BARLOW" sub="17. Night operator. Runs on coffee." />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.7, 0])} />}
      {c === 2 && <Stamp x={1300} y={300} t={lf - cuts[2].at - 20} text="REAL REPORTS" rot={-8} size={80} />}
      {c === 1 && <Tag x={960} y={150} t={lf - UNF - 10} text="Ned is fictional" sub="what happens to him tonight is documented" size={50} />}
    </g>
  );
};

const Pole: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={-14} y={-520} width={28} height={620} fill="#6A4A30" />
    <rect x={-120} y={-480} width={240} height={22} fill="#5A3D27" />
    {[-90, 90].map((dx) => <rect key={dx} x={dx - 10} y={-512} width={20} height={34} rx={8} fill="#8FC8C0" strokeWidth={4} />)}
  </g>
);
export const s07_wire = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.12, f0: [1150, 560], f1: [1250, 500]},
    {at: 150, z0: 1.0, z1: 1.05, f0: [960, 540], f1: [980, 540]},
    {at: 300, z0: 1.6, z1: 1.9, f0: [960, 380], f1: [1000, 360]},
  ];
  const c = cutIdx(f, cuts);
  const B = CITIES['Boston'], NY = CITIES['New York'], W = CITIES['Washington'];
  if (c === 0) return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <MapNE f={f} labels={iv(f, [10, 30], [0, 1])} />
      <Pulses pts={[B, CITIES['Albany'], NY, CITIES['Philadelphia'], W]} t={f - 20} speed={14} code="-. . .-- ...  -.-. --- -- .. -. --." s={1.2} />
      <Pulses pts={[B, CITIES['Portland']]} t={f - 50} speed={10} code=".-- .. .-. ." s={1.2} />
    </Cam>
  );
  if (c === 1) {
    const t = f - 150;
    const hx = 200 + t * 2.2;
    return (
      <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.05, f0: [960, 540], f1: [980, 540]}]} dur={150}>
        <NightSky f={f} mode="dawn" x0={-400} x1={2400} y1={820} />
        <rect x={-400} y={820} width={2800} height={400} fill="#5A5A3A" filter="url(#paint)" />
        <path d="M-400 760 L2400 700" stroke={INK} strokeWidth={4} />
        {[0, 700, 1400, 2100].map((x) => <Pole key={x} x={x} y={860} f={f} s={0.55} />)}
        <Pulses pts={[[-400, 588], [2400, 588]]} t={t} speed={30} code="- - - - - - - -" s={1.5} />
        {/* horse rider, comically slow */}
        <g transform={`translate(${hx} ${880 + Math.abs(Math.sin(t * 0.3)) * -10})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
          <path d="M-90 -80 Q0 -120 90 -86 L110 -130 L140 -120 L120 -70 Q100 -40 80 -40 L-80 -40 Q-110 -50 -90 -80 Z" fill="#6A4A30" />
          {[-70, -40, 50, 80].map((lx, i) => <path key={i} d={`M${lx} -40 L${lx + Math.sin(t * 0.4 + i * 1.6) * 16} 0`} strokeWidth={10} stroke="#4A3220" />)}
          <ellipse cx={0} cy={-150} rx={26} ry={34} fill="#F0DFC6" /><rect x={-24} y={-130} width={48} height={60} fill="#3A3028" />
        </g>
        <Tag x={1500} y={160} t={t - 20} text="Horse: days" sub="Telegraph: minutes" size={52} />
      </Cam>
    );
  }
  const t = f - 300;
  return (
    <Cam lf={t} cuts={[{at: 0, z0: 1.6, z1: 1.9, f0: [960, 380], f1: [1000, 360]}]} dur={dur - 300}>
      <NightSky f={f} mode="night" x0={-400} x1={2400} y1={1080} />
      <Pole x={960} y={1100} f={f} s={1.2} />
      <path d="M-400 486 Q400 520 852 486 M1068 486 Q1600 520 2400 486" stroke="#9A9080" strokeWidth={7} fill="none" />
      <Pulses pts={[[-400, 490], [852, 488]]} t={t} speed={16} code=".-.-.- -- --- .-. ... ." s={1.6} />
      <Tag x={960} y={150} t={t - 10} text="one iron wire" size={56} />
    </Cam>
  );
};

export const s08_how = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 2.4, z1: 2.7, f0: [1760, 560], f1: [1770, 550]},
    {at: 110, z0: 2.8, z1: 3.0, f0: [1010, 560], f1: [1010, 560]},
    {at: 205, z0: 1.8, z1: 1.95, f0: [1100, 470], f1: [1120, 460]},
  ];
  const c = cutIdx(f, cuts);
  const press = c === 1 ? tap(f, 1, 5) : 0;
  if (c === 2) {
    const t = f - 205;
    const arm = tap(t, 1, 5);
    return (
      <g>
        <Cam lf={t} cuts={[{at: 0, z0: 1.8, z1: 1.95, f0: [1100, 470], f1: [1120, 460]}]} dur={dur - 205}>
          <OfficeScene f={f} sky="night" variant="dc" L={PORTLAND} arm={arm} press={0} ned={{lean: 6, hF: [90, -150], head: {turn: 0.7, lookX: 0.9, lookY: 0.3, eyes: 'half'}}} />
        </Cam>
        <Tag x={420} y={150} t={t - 6} text="Far away…" sub="the sounder clicks" size={52} />
        <text x={960} y={330} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={110} fill="#FFD27A" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={iv(t, [10, 20], [0, 1])}>{['·', '—', '·', '·', '—', '—'].slice(0, Math.min(6, Math.floor(t / 14) + 1)).join(' ')}</text>
      </g>
    );
  }
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <OfficeScene f={f} sky="night" press={press} arm={press} ned={c === 1 ? {lean: 12, hF: keyHand(press)} : null} glow={c === 0 ? 0.2 + 0.2 * Math.sin(f * 0.2) : 0}
          overDesk={c === 1 ? <Pulses pts={[[1080, DESK_Y - 20], [1460, DESK_Y - 12], [1540, DESK_Y - 30], [1540, 110], [1500, 70], [-400, 70]]} t={f - 110} speed={10} code=".... . .-.. .-.. ---" /> : null} />
      </Cam>
      {c === 0 && <Tag x={1300} y={160} t={f - 10} text="The battery" sub="glass jars of acid and metal" size={52} />}
    </g>
  );
};

export const s08b_ear = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ps = speech(sh, 'PIKE', gf), ns = speech(sh, 'NED', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const cuts: Cut[] = [
    {at: 0, z0: 2.3, z1: 2.5, f0: [905, 430], f1: [900, 420]},
    {at: 105, z0: 1.7, z1: 1.8, f0: [1050, 520], f1: [1060, 510]},
    {at: L1 - 6, z0: 1.6, z1: 1.7, f0: [2330, 450], f1: [2320, 440]},
    {at: L2 - 6, z0: 2.7, z1: 2.9, f0: [905, 430], f1: [905, 425]},
  ];
  const c = cutIdx(f, cuts);
  const arm = tap(f, 1.3, 9);
  const write = Math.sin(f * 0.5) * 8;
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <OfficeScene f={f} sky="night" arm={arm} tapeOff={f * 2}
        ned={{lean: 4, hF: [70 + write, -80 + Math.cos(f * 0.5) * 4], hB: [40, -96], head: nedH({turn: c === 3 ? 0.9 : 0.4, eyes: c === 3 ? 'sly' : 'squeeze', tilt: Math.sin(f * 0.25) * 4 * arm, mouth: ns.talking ? ns.mouth : c === 3 ? 'smile' : 'line', open: ns.open, lookX: 1})}}
        nedProps={{propF: <rect x={10} y={-4} width={60} height={8} fill="#E2B23A" stroke={INK} strokeWidth={2} />, propAngF: 40, gripF: true}}
        behind={<Pike f={f} x={2330} o={{hF: c >= 2 && ps.talking ? [150, -150] : [70, -100], hB: [60, -110], lean: 2, head: {turn: 0.3, mouth: ps.talking ? ps.mouth : c === 3 ? 'frown' : 'line', open: ps.open, browInner: c === 3 ? -0.8 : 0, lookX: -1, eyes: c === 3 ? 'half' : 'dot'}}} flip poseF={ps.talking ? 'point' : 'mitt'} propB={<g transform="translate(-10 0) rotate(-90)"><rect x={-20} y={-30} width={40} height={40} fill="#E8E0D0" stroke={INK} strokeWidth={4} /></g>} gripB />} />
    </Cam>
  );
};

export const s09_pike = ({lf, gf, sh, dur}: SP) => {
  const ps = speech(sh, 'PIKE', gf), ns = speech(sh, 'NED', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2), L3 = ls(sh, 3);
  const FREEZE = 34, UNF = L1 - 6;
  const frozen = lf >= FREEZE && lf < UNF;
  const f = frozen ? FREEZE : lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.9, z1: 2.1, f0: [2340, 430], f1: [2330, 420]},
    {at: UNF, z0: 1.3, z1: 1.35, f0: [2300, 500], f1: [2300, 500]},
    {at: L2 - 6, z0: 2.6, z1: 2.8, f0: [900, 430], f1: [900, 425]},
    {at: L3 - 6, z0: 1.9, z1: 2.05, f0: [2330, 440], f1: [2330, 430]},
  ];
  const c = cutIdx(lf, cuts);
  const wave = c === 3 ? Math.sin(f * 0.4) * 30 : 0;
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={f} cuts={cuts} dur={dur}>
          <OfficeScene f={f} sky="night" arm={tap(f, 0.8)}
            ned={{lean: 6, hF: keyHand(0), head: nedH({turn: c === 2 ? 0.9 : 0.6, mouth: ns.talking ? ns.mouth : 'line', open: ns.open, browInner: 0.6, lookX: 1, eyes: 'dot'})}}
            behind={<Pike f={f} x={2330} flip o={{hF: c === 1 ? [80, -130] : c === 3 ? [130 + wave, -170] : [70, -100], hB: frozen ? [90, -190] : [60, -90], lean: 2, head: {turn: 0.35, mouth: ps.talking ? ps.mouth : frozen ? 'smile' : 'line', open: ps.open, browInner: -0.5, browHeight: c === 1 ? 0.6 : 0, lookX: -0.8, eyes: frozen ? 'sly' : 'dot'}}} poseF={c === 3 ? 'open' : c === 1 ? 'point' : 'mitt'} propB={frozen ? <g transform="rotate(-90)"><rect x={-18} y={-26} width={36} height={36} fill="#E8E0D0" stroke={INK} strokeWidth={4} /></g> : undefined} gripB />} />
        </Cam>
      </g>
      {frozen && <FreezeLabel t={lf - FREEZE} title="MR. PIKE" sub="Night manager. Expert napper." x={160} y={170} />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.7, 0])} />}
    </g>
  );
};

export const s10_week = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.1, f0: [1100, 560], f1: [1180, 520]},
    {at: 150, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [1000, 520]},
    {at: L1 - 6, z0: 1.5, z1: 1.6, f0: [1100, 480], f1: [1080, 470]},
  ];
  const c = cutIdx(f, cuts);
  if (c === 0) return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}><MapNE f={f} dead={iv(f, [30, 130], [0, 1]) * (0.6 + 0.4 * Math.sin(f * 0.3))} sparkle={1} /></Cam>
      <Tag x={420} y={150} t={f - 6} text="28 August 1859" sub="four nights earlier" size={54} />
    </g>
  );
  if (c === 1) {
    const t = f - 150;
    return (
      <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [1000, 520]}]} dur={L1 - 156}>
        <BostonStreet f={f} sky="red" green={0.2} amt={0.55} camX={t} />
        {[500, 700, 1200, 1350].map((x, i) => <Actor key={i} L={extraLook(i + 30)} x={x} y={Y(0.9)} s={0.9} flip={i % 2 === 0} p={mkPose(f, crowdAct(f, i + 1))} poseF="point" />)}
      </Cam>
    );
  }
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <OfficeScene f={f} sky="night" ned={{lean: 14, hF: [70, -150], hB: [60, -140], head: nedH({eyes: 'half', mouth: 'line'})}} />
    </Cam>
  );
};

export const s11_dull = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf);
  const yawn = iv(f, [62, 72, 88], [0, 1, 0]);
  const red = glowRamp(f, 50, 98);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.55, z1: 1.75, f0: [760, 450], f1: [720, 430]}]} dur={dur}>
      <OfficeScene f={f} sky="red" skyAmt={red * 0.6} green={0}
        ned={{lean: 16, hF: [70, -200], hB: [60, -130], head: nedH({turn: 0.5, tilt: 10, eyes: yawn > 0.3 ? 'squeeze' : 'half', mouth: ns.talking ? ns.mouth : yawn > 0.1 ? 'O' : 'line', open: ns.talking ? ns.open : yawn})}}
        nedProps={{poseF: 'fist'}} />
    </Cam>
  );
};

// ---------------- CH3 THE MAN WHO WATCHED THE SUN ----------------
const Hills: React.FC<{f: number}> = ({f}) => (
  <g>
    <NightSky f={f} mode="day" x0={-400} x1={2400} y1={700} />
    {[0, 1, 2].map((i) => <path key={i} d={`M-400 ${620 + i * 90} Q300 ${540 + i * 80} 960 ${610 + i * 90} T2400 ${600 + i * 90} V1300 H-400 Z`} fill={['#7A9A5A', '#5E8048', '#4A6A3A'][i]} filter="url(#paint)" />)}
    <g transform="translate(1180 700)" filter="url(#paint)" stroke={INK} strokeWidth={6} strokeLinejoin="round">
      <rect x={-260} y={-220} width={360} height={220} fill="#C9B48A" /><path d="M-280 -220 L-80 -340 L120 -220 Z" fill="#6A3A2A" />
      {[-210, -110, 10].map((x) => <rect key={x} x={x} y={-170} width={60} height={70} fill="#3A4A5A" />)}
      <rect x={140} y={-160} width={180} height={160} fill="#D8C8A0" /><path d="M140 -160 Q230 -260 320 -160 Z" fill="#8A8D92" /><rect x={215} y={-250} width={22} height={70} fill="#2A2420" transform="rotate(12 226 -215)" />
    </g>
  </g>
);
export const s12_redhill = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.12, f0: [960, 520], f1: [1100, 520]},
    {at: 150, z0: 0.9, z1: 0.98, f0: [960, 520], f1: [1000, 500]},
  ];
  const c = cutIdx(f, cuts);
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        {c === 0 ? <Hills f={f} /> : <Observatory f={f} />}
      </Cam>
      {c === 0 && <Tag x={520} y={160} t={f - 10} text="Redhill, England" sub="1 September 1859 · morning" size={54} />}
    </g>
  );
};

const carrPose = (f: number, o: any = {}) => mkPose(f, {seed: 6, ...o, head: {turn: 0.6, ...(o.head ?? {})}});
export const s13_carr = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.45, z1: 1.6, f0: [1200, 470], f1: [1180, 450]},
    {at: 125, z0: 3.4, z1: 3.7, f0: [1100, 380], f1: [1110, 380]},
    {at: 245, z0: 0.95, z1: 1.0, f0: [960, 520], f1: [900, 520]},
  ];
  const c = cutIdx(f, cuts);
  const lookScreen = Math.floor(f / 40) % 2 === 0;
  const draw = Math.sin(f * 0.6) * 6;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <Observatory f={f} />
        {c !== 1 && <Actor L={CARRINGTON} x={1400} y={Y(1.15)} s={1.15} flip p={carrPose(f, {hF: [70 + draw, -130 + Math.cos(f * 0.6) * 4], hB: [80, -150], lean: 6, head: {turn: 0.7, lookX: lookScreen ? 1 : 0.2, lookY: lookScreen ? -0.3 : 0.8, browInner: 0.3}})} propB={<g><rect x={0} y={-40} width={90} height={80} fill="#F6F2E6" stroke={INK} strokeWidth={3} /><circle cx={45} cy={0} r={28} fill="none" stroke={INK} strokeWidth={2} /></g>} propAngB={-80} gripB propF={<rect x={10} y={-3} width={50} height={6} fill="#3A3028" />} propAngF={30} gripF />}
      </Cam>
      {c === 1 && <Tag x={1450} y={170} t={f - 135} text="never look directly" sub="the image is projected onto a screen" size={46} />}
      {c === 2 && <Tag x={960} y={140} t={f - 255} text="Richard Carrington" sub="amateur astronomer, aged 33" size={52} />}
    </g>
  );
};

export const s14_flash = ({lf, dur}: SP) => {
  const f = lf;
  const FL = 70;
  const fl = clamp01((f - FL) / 8);
  const cuts: Cut[] = [
    {at: 0, z0: 3.6, z1: 4.0, f0: [1100, 380], f1: [1110, 370]},
    {at: 110, z0: 2.6, z1: 2.8, f0: [1395, 430], f1: [1395, 420]},
    {at: 170, z0: 4.3, z1: 4.8, f0: [1110, 375], f1: [1112, 370]},
  ];
  const c = cutIdx(f, cuts);
  const pop = spring(f, 112, 0.3, 0.14);
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <Observatory f={f} flare={fl} />
        <Actor L={CARRINGTON} x={1400} y={Y(1.15)} s={1.15} flip p={carrPose(f, {hF: [60, -150], hB: [90, -140], lean: c === 1 ? -6 * pop : 4, head: {turn: 0.8, eyes: c >= 1 ? 'fear' : 'dot', eyePop: pop * 0.7, browHeight: 1.3 * pop, mouth: c >= 1 ? 'O' : 'line', open: 0.6, lookX: 1, lookY: -0.2}})} />
      </Cam>
      {f >= FL && f < FL + 4 && <rect width={1920} height={1080} fill="#FFFFFF" opacity={0.6} />}
      {c === 0 && f > FL + 8 && <BigWord x={960} y={880} t={f - FL - 8} text="WHITE LIGHT" size={120} color="#FFF6D0" />}
    </g>
  );
};

export const s15_run = ({lf, dur}: SP) => {
  const f = lf;
  const OUT = 20, BACK = 110, FREEZE = 236;
  const frozen = f >= FREEZE;
  const ff = frozen ? FREEZE : f;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.04, f0: [960, 520], f1: [960, 520]},
    {at: 140, z0: 3.0, z1: 3.2, f0: [1600, 290], f1: [1600, 285]},
    {at: 175, z0: 3.6, z1: 3.9, f0: [1100, 380], f1: [1105, 380]},
    {at: 210, z0: 1.4, z1: 1.5, f0: [1350, 470], f1: [1350, 460]},
  ];
  const c = cutIdx(ff, cuts);
  // runs out to the left, empty room beat, runs back in panting
  let x = 1400, flip = true, legs: any = {}, lean = 0;
  if (ff >= OUT && ff < 60) { const r = run((ff - OUT) / 10); x = lerp(1400, -300, (ff - OUT) / 40); legs = r; lean = r.lean; }
  else if (ff >= 60 && ff < BACK) x = -600;
  else if (ff >= BACK && ff < BACK + 30) { const r = run((ff - BACK) / 10); x = lerp(-300, 1400, (ff - BACK) / 30); flip = false; legs = r; lean = r.lean; }
  const pant = ff > BACK + 30 ? Math.sin(ff * 0.5) * 4 : 0;
  const fade = 1 - clamp01((ff - 150) / 80);
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={ff} cuts={cuts} dur={dur}>
          <Observatory f={ff} flare={fade} />
          {x > -500 && <Actor L={CARRINGTON} x={x} y={Y(1.15)} s={1.15} flip={flip} p={carrPose(ff, {legF: legs.legF, legB: legs.legB, bob: (legs.bob ?? 0) + pant, lean: lean + (pant ? 10 : 0), hF: [60, -100], hB: [40, -60], head: {turn: 0.7, mouth: pant ? 'O' : 'line', open: 0.5, eyes: ff > BACK + 30 ? 'dot' : 'fear', eyePop: 0.3, browInner: 0.8, sweat: pant ? (ff % 40) / 40 : -1, lookX: 1}})} />}
        </Cam>
      </g>
      {c === 1 && <Tag x={960} y={820} t={ff - 145} text="back within 60 seconds" size={56} />}
      {c === 2 && <BigWord x={960} y={900} t={ff - 180} text="FADING" size={130} color="#F3E7CF" />}
      {frozen && <FreezeLabel t={lf - FREEZE} title="CARRINGTON" sub="Left for one minute. Missed most of it." />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.7, 0])} />}
    </g>
  );
};

export const s16_kew = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.1, f0: [960, 520], f1: [1000, 500]},
    {at: 130, z0: 1.0, z1: 1.15, f0: [960, 500], f1: [1060, 480]},
  ];
  const c = cutIdx(f, cuts);
  if (c === 0) return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <NightSky f={f} mode="grey" x0={-400} x1={2400} y1={760} />
        <Roofline y={820} x0={-400} x1={2400} c="#4A4A4E" lit={false} />
        <rect x={-400} y={820} width={2800} height={400} fill="#3A3A3C" />
        <circle cx={1500} cy={220} r={90} fill="#FFF4D0" filter="url(#glowS)" />
        <g transform="translate(700 700)"><Actor L={{...CARRINGTON, hairColor: '#7A6A5A', sideburns: undefined, beard: '#7A6A5A', vest: '#4A3A2A', gown: '#3A3028'}} x={0} y={0} s={1.0} p={mkPose(f, {hF: [90, -230], hB: [110, -220], lean: -6, head: {turn: 0.8, lookY: -1, lookX: 1, eyes: 'fear', eyePop: spring(f, 40) * 0.5, browHeight: 1.2, mouth: 'O', open: 0.5}, seed: 8, dart: 0})} gripF gripB propF={<g><rect x={-20} y={-12} width={160} height={24} fill="#C9A35A" stroke={INK} strokeWidth={4} /></g>} propAngF={-60} /></g>
      </Cam>
      <Tag x={500} y={150} t={f - 8} text="Richard Hodgson" sub="London · the same moment" size={52} />
    </g>
  );
  return (
    <g>
      <Cam lf={f - 130} cuts={[{at: 0, z0: 1.0, z1: 1.15, f0: [960, 500], f1: [1060, 480]}]} dur={dur - 130}><Magnetograph f={(f - 130) * 1.6} jump={1} /></Cam>
      <Tag x={1500} y={130} t={f - 150} text="Kew Observatory" sub="the magnets jump" size={50} />
    </g>
  );
};

export const s16b_report = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [960, 520]},
    {at: 200, z0: 1.5, z1: 1.65, f0: [700, 520], f1: [720, 500]},
  ];
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <DarkTable f={f} />
        <Card x={640} y={500} w={560} h={600} t={f - 10} title="CARRINGTON" lines={['Monthly Notices', 'of the R.A.S.', 'Nov 1859', '', 'two beads of light']} rot={-4} />
        <Card x={1280} y={510} w={560} h={600} t={f - 40} title="HODGSON" lines={['Monthly Notices', 'of the R.A.S.', 'Nov 1859', '', 'the same flash']} rot={3} />
        <g transform="translate(640 760) scale(0.55)" opacity={iv(f, [20, 32], [0, 1])}><SunDisc x={0} y={0} r={120} f={f} flare={1} /></g>
      </Cam>
      <Stamp x={960} y={900} t={f - 220} text="FIRST SOLAR FLARE ON RECORD" size={56} rot={-4} />
    </g>
  );
};

export const s17_cloud = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L1 = ls(sh, 1);
  const cuts: Cut[] = [
    {at: 0, z0: 2.0, z1: 2.3, f0: [420, 540], f1: [460, 530]},
    {at: 110, z0: 0.95, z1: 1.0, f0: [960, 540], f1: [960, 540]},
    {at: L1 - 4, z0: 1.0, z1: 1.0, f0: [960, 540], f1: [960, 540]},
    {at: L1 + 170, z0: 2.4, z1: 2.8, f0: [1640, 540], f1: [1650, 540]},
  ];
  const c = cutIdx(f, cuts);
  const cme = c <= 1 ? iv(f, [20, L1], [0, 0.45]) : c === 2 ? iv(f, [L1, L1 + 170], [0.45, 1.0], EOut) : 1.0;
  const hours = c === 2 ? Math.min(17.6, iv(f, [L1 + 40, L1 + 165], [0, 17.6])) : c === 3 ? 17.6 : 0;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} shake={c === 3 ? 4 * Math.max(0, 1 - (f - cuts[3].at) / 40) : 0}>
        <Space f={f} cme={cme} shield={c === 3 ? 1.4 : 1} />
      </Cam>
      {c === 2 && <g>
        <Tag x={560} y={140} t={f - L1 - 6} text="usually: several days" size={46} rot={-3} />
        <text x={1420} y={200} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={110} fill="#FFD27A" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={iv(f, [L1 + 40, L1 + 50], [0, 1])}>{hours.toFixed(1)} h</text>
        <text x={1420} y={260} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={42} fill="#F3E7CF" opacity={iv(f, [L1 + 40, L1 + 50], [0, 1])}>~150 million km</text>
      </g>}
      {c === 3 && <BigWord x={960} y={900} t={f - cuts[3].at - 6} text="IMPACT" size={140} />}
    </g>
  );
};
void Puppet; void Bars; void Focus; void rack; void Chair; void seatY; void sitOpts; void le; void EBack; void Jars; void Register; void Sounder; void TKey; void Clock; void Aurora; void SideTable; void PIKE; void NED_S; void FLOOR; void flinch; void Roofline;
