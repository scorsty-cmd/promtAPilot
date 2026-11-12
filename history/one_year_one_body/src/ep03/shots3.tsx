// You Were There Ep 2 — shots ch6–8 (unplug the battery, what was it?, ending + end screen)
import React from 'react';
import {NED, PIKE, PORTLAND, CARRINGTON, LOOMIS, Puppet, extraLook} from '../rig';
import {walk, spring, clamp01, lerp, ease, drop} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, speech, FreezeLabel, Tag, BigWord, Stamp, INK, EOut, Cut, Y, Card, Sparks, Pulses, crowdAct, CROWD_KINDS} from './kit';
import {Office, BostonStreet, NightSky, Roofline, Observatory, Space, MapNE, MapAmericas, CITIES, ModernCity, Study, Letters, DarkTable, Clock, OFFICE, DESK_Y} from './sets';
import {OfficeScene, Pike, nedH, keyHand, tap} from './common';

const cutIdx = (f: number, cuts: Cut[]) => cuts.reduce((a, c, i) => (f >= c.at ? i : a), 0);

// ---------------- CH6 UNPLUG THE BATTERY ----------------
export const s32_morning = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 0.82, z1: 0.88, f0: [1200, 520], f1: [1150, 510]},
    {at: 120, z0: 2.6, z1: 2.8, f0: [1340, 600], f1: [1350, 595]},
    {at: 210, z0: 2.4, z1: 2.6, f0: [900, 430], f1: [905, 425]},
  ];
  const c = cutIdx(f, cuts);
  const swell = 0.5 + 0.5 * Math.sin(f * 0.08);
  const press = c === 2 ? tap(f, 1.5) : 0;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <OfficeScene f={f} sky="dawn" lamp={0.4} press={press} arm={swell > 0.6 ? tap(f, 3) : 0} tapeOff={f * 3} garble
          ned={{lean: 14, hF: c === 2 ? keyHand(press) : [70, -150], hB: [70, -90], head: nedH({eyes: c === 2 ? 'dot' : 'half', mouth: c === 2 ? 'frown' : 'line', browInner: c === 2 ? -0.6 : 0.5, lookX: 1, lookY: 0.3})}}
          overDesk={c === 1 ? <rect x={OFFICE.regX + 60} y={DESK_Y - 70} width={260} height={22} fill="#7CFFC0" opacity={0.25 * swell} filter="url(#glowS)" /> : null}
          behind={c === 0 ? <Pike f={f} x={2330} flip o={{hF: [70, -110], hB: [60, -100], head: {eyes: 'half', mouth: 'frown', lookX: -1}}} /> : null} />
      </Cam>
      {c === 0 && <Tag x={1450} y={150} t={f - 8} text="2 September 1859" sub="morning" size={54} />}
    </g>
  );
};

export const s33_idea = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf), ps = speech(sh, 'PIKE', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const cuts: Cut[] = [
    {at: 0, z0: 2.3, z1: 2.5, f0: [920, 430], f1: [930, 420]},
    {at: L1 - 4, z0: 1.9, z1: 2.0, f0: [2330, 440], f1: [2330, 430]},
    {at: L2 - 2, z0: 1.0, z1: 1.08, f0: [1100, 400], f1: [1250, 330]},
    {at: L2 + 170, z0: 1.0, z1: 1.04, f0: [960, 540], f1: [960, 530]},
  ];
  const c = cutIdx(f, cuts);
  const bulb = spring(f, 4, 0.3, 0.15);
  if (c <= 1) return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <OfficeScene f={f} sky="dawn" lamp={0.4}
        ned={{lean: 0, hF: [100, -170], hB: [70, -90], head: nedH({turn: 0.85, mouth: ns.talking ? ns.mouth : 'line', open: ns.open, eyes: c === 1 ? 'dot' : 'happy', browHeight: bulb, lookX: 1})}} nedProps={{poseF: 'point'}}
        behind={<Pike f={f} x={2330} flip o={{hF: c === 1 ? [140, -150] : [70, -110], hB: [60, -100], lean: c === 1 ? -4 : 0, head: {turn: 0.3, mouth: ps.talking ? ps.mouth : 'frown', open: ps.open, browInner: -0.8, eyes: 'half', lookX: -1}}} poseF="open" />} />
    </Cam>
  );
  if (c === 2) {
    const t = f - cuts[2].at;
    return (
      <g>
        <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [1100, 400], f1: [1250, 330]}]} dur={172}>
          <MapNE f={f} hl={['Boston', 'Portland']} dead={1} />
          <Pulses pts={[CITIES['Boston'], CITIES['Portland']]} t={t} speed={6} code=".-- .. .-. ." color="#7CFFC0" s={1.4} />
        </Cam>
        <Tag x={500} y={150} t={t - 8} text="Boston ↔ Portland, Maine" size={52} />
      </g>
    );
  }
  const t = f - cuts[3].at;
  return (
    <g>
      <Cam lf={t} cuts={[{at: 0, z0: 1.0, z1: 1.04, f0: [960, 540], f1: [960, 530]}]} dur={dur - cuts[3].at}><DarkTable f={f} /></Cam>
      <Card x={960} y={520} w={980} h={520} t={t - 4} title="THE WORDS ON THE WIRE" lines={['as printed by the Boston Evening Traveler', 'September 1859', '', 'what follows is their record']} rot={-1.5} />
    </g>
  );
};

// split screen: Boston (left) and Portland (right)
const Split: React.FC<{f: number; left: React.ReactNode; right: React.ReactNode; pulse?: number; dir?: 1 | -1}> = ({f, left, right, pulse = -1, dir = 1}) => (
  <g>
    <defs><clipPath id="spL"><rect x={0} y={0} width={954} height={1080} /></clipPath><clipPath id="spR"><rect x={966} y={0} width={954} height={1080} /></clipPath></defs>
    <g clipPath="url(#spL)"><g transform="translate(-480 0)">{left}</g></g>
    <g clipPath="url(#spR)"><g transform="translate(480 0)">{right}</g></g>
    <rect x={954} y={0} width={12} height={1080} fill="#120B08" />
    <rect x={327} y={34} width={300} height={62} rx={8} fill="#120B08" opacity={0.75} /><rect x={1283} y={34} width={320} height={62} rx={8} fill="#120B08" opacity={0.75} />
    <text x={477} y={80} textAnchor="middle" fontFamily="FellSC" fontSize={50} fill="#F3E7CF" stroke={INK} strokeWidth={6} paintOrder="stroke">BOSTON</text>
    <text x={1443} y={80} textAnchor="middle" fontFamily="FellSC" fontSize={50} fill="#F3E7CF" stroke={INK} strokeWidth={6} paintOrder="stroke">PORTLAND</text>
    {pulse >= 0 && <Pulses pts={dir === 1 ? [[300, 120], [1620, 120]] : [[1620, 120], [300, 120]]} t={pulse} speed={22} code=".--. .-.. . .- ... ." color="#7CFFC0" />}
    {void f}
  </g>
);
const portOffice = (f: number, ps: ReturnType<typeof speech>, extra: {arm?: number; glow?: number; z?: number} = {}) => (
  <Cam lf={f} cuts={[{at: 0, z0: extra.z ?? 1.7, z1: (extra.z ?? 1.7) + 0.1, f0: [960, 450], f1: [960, 440]}]} dur={300}>
    <OfficeScene f={f + 77} sky="dawn" lamp={0.3} variant="dc" L={PORTLAND} arm={extra.arm ?? 0} pikeDesk={false}
      ned={{lean: 8, hF: keyHand(ps.talking ? tap(f, 1.2) : 0), head: {turn: 0.75, mouth: ps.talking ? ps.mouth : 'smile', open: ps.open, lookX: 1, lookY: 0.2, eyes: 'dot'}}} press={ps.talking ? tap(f, 1.2) : 0} glow={extra.glow} />
  </Cam>
);
const bosOffice = (f: number, ns: ReturnType<typeof speech>, extra: {unplug?: number; z?: number; head?: any} = {}) => (
  <Cam lf={f} cuts={[{at: 0, z0: extra.z ?? 1.7, z1: (extra.z ?? 1.7) + 0.1, f0: [960, 450], f1: [960, 440]}]} dur={300}>
    <OfficeScene f={f} sky="dawn" lamp={0.3} press={ns.talking ? tap(f, 1.2, 4) : 0} unplug={extra.unplug ?? 0}
      ned={{lean: 10, hF: keyHand(ns.talking ? tap(f, 1.2, 4) : 0), head: nedH({turn: 0.75, mouth: ns.talking ? ns.mouth : 'line', open: ns.open, lookX: 1, lookY: 0.2, ...(extra.head ?? {})})}} />
  </Cam>
);
export const s34_ask = ({lf, gf, sh}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf), ps = speech(sh, 'PORTLAND', gf);
  const L1 = ls(sh, 1);
  return <Split f={f} left={bosOffice(f, ns)} right={portOffice(f, ps, {arm: f < L1 ? tap(f, 1.2, 4) : 0})} pulse={f < L1 ? f : f - L1} dir={f < L1 ? 1 : -1} />;
};

export const s35_unplug = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf), ps = speech(sh, 'PORTLAND', gf);
  const L1 = ls(sh, 1);
  const cuts: Cut[] = [
    {at: 0, z0: 2.8, z1: 3.0, f0: [1790, 560], f1: [1800, 550]},
    {at: 62, z0: 2.4, z1: 2.55, f0: [920, 440], f1: [920, 430]},
    {at: L1 - 4, z0: 2.4, z1: 2.55, f0: [960, 430], f1: [960, 420]},
  ];
  const c = cutIdx(f, cuts);
  const un = ease(clamp01((f - 10) / 30));
  if (c === 2) return <Cam lf={f - cuts[2].at} cuts={[cuts[2]].map((x) => ({...x, at: 0}))} dur={dur - cuts[2].at}><OfficeScene f={f + 77} sky="dawn" lamp={0.3} variant="dc" L={PORTLAND} pikeDesk={false} arm={tap(f, 1.4)} tapeOff={f * 2}
    ned={{lean: 6, hF: [70, -90], hB: [60, -150], head: {turn: 0.5, mouth: ps.talking ? ps.mouth : 'grin', open: ps.open, eyes: ps.talking ? 'dot' : 'happy', browHeight: 0.8, lookX: 1}}} nedProps={{poseF: 'open'}} /></Cam>;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <OfficeScene f={f} sky="dawn" lamp={0.3} unplug={un}
          ned={c === 1 ? {lean: 10, hF: keyHand(ns.talking ? tap(f, 1.2) : 0), head: nedH({turn: 0.7, mouth: ns.talking ? ns.mouth : 'line', open: ns.open, lookX: 1, browHeight: 0.4})} : null}
          press={c === 1 && ns.talking ? tap(f, 1.2) : 0}
          front={c === 0 ? <g><g transform={`translate(${1760 + un * 60} ${DESK_Y - 210 + un * 120})`}><circle r={40} fill="#F4E7D3" stroke={INK} strokeWidth={6} /><path d="M10 -36 h30" stroke={INK} strokeWidth={6} /></g></g> : null} />
      </Cam>
      {c === 0 && f > 40 && <BigWord x={960} y={880} t={f - 42} text="UNPLUGGED" size={130} color="#7CFFC0" />}
    </g>
  );
};

export const s36_pike = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ps = speech(sh, 'PIKE', gf);
  const jaw = spring(f, 4, 0.3, 0.15);
  const d = drop(f - 10, -72, 200, 2.4, 0.35, 9);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.45, z1: 1.6, f0: [2300, 560], f1: [2300, 540]}]} dur={dur}>
      <Office f={f} sky="dawn" lamp={0.3} />
      <Pike f={f} x={2330} flip o={{hF: [80, -60], hB: [60, -100], lean: -4, head: {turn: 0.15, mouth: ps.talking ? ps.mouth : 'O', open: ps.talking ? ps.open : 0.8 * jaw, eyes: 'fear', eyePop: jaw * 0.6, browHeight: 1.4 * jaw, lookX: -0.6}}} poseF="open" />
      <g transform={`translate(${2236} ${Y(1.18) + d.y}) rotate(${d.rot})`}><g stroke={INK} strokeWidth={4}><path d="M-20 -20 H24 L20 16 H-16 Z" fill="#E8E0D0" /></g></g>
      {d.landed && <Sparks x={2236} y={Y(1.18) + 210} t={f - 10 - d.impact} n={14} color="#6A4A30" seed="cof" s={0.8} />}
    </Cam>
  );
};

export const s37_goahead = ({lf, gf, sh}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf), ps = speech(sh, 'PORTLAND', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const nedLine = f < L1 || f >= L2 - 4;
  return <Split f={f} left={bosOffice(f, ns, {unplug: 1, z: 2.3, head: f >= L2 - 4 ? {eyes: 'happy', browHeight: 0.8} : {}})} right={portOffice(f, ps, {z: 2.3, arm: nedLine ? tap(f, 1.2, 4) : 0})} pulse={f < L1 ? f : f < L2 ? f - L1 : f - L2} dir={nedLine ? 1 : -1} />;
};

export const s38_hours = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [{at: 0, z0: 1.4, z1: 1.55, f0: [1400, 260], f1: [1420, 240]}, {at: 90, z0: 3.0, z1: 3.2, f0: [1500, 260], f1: [1500, 255]}, {at: 150, z0: 0.85, z1: 0.9, f0: [1200, 520], f1: [1150, 510]}];
  const c = cutIdx(f, cuts);
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        {c === 0 ? <g><MapNE f={f} hl={['Boston', 'Portland']} dead={1} /><Pulses pts={[CITIES['Boston'], CITIES['Portland']]} t={f % 60} speed={8} code="-.-. --- -- . " color="#7CFFC0" s={1.4} /><Pulses pts={[CITIES['Portland'], CITIES['Boston']]} t={(f + 30) % 60} speed={8} code=". .-. ." color="#7CFFC0" s={1.4} /></g>
          : <OfficeScene f={f} sky="day" unplug={1} lamp={0} press={tap(f, 1.4)} arm={tap(f + 9, 1.4)} tapeOff={f * 3}
            ned={{lean: 10, hF: keyHand(tap(f, 1.4)), head: nedH({eyes: 'happy', mouth: 'smile', lookX: 1})}}
            behind={<Pike f={f} x={2330} flip o={{hF: [70, -110], hB: [60, -100], head: {mouth: 'smile', eyes: 'happy', lookX: -1}}} />} />}
      </Cam>
      {c === 1 && <g transform="translate(1500 320) scale(3)"><Clock x={0} y={0} h={8 + Math.min(2, (f - 90) / 30)} m={((f - 90) * 4) % 60} /></g>}
      {c === 2 && <BigWord x={960} y={900} t={f - 156} text="ABOUT TWO HOURS" size={110} color="#7CFFC0" />}
    </g>
  );
};

export const s39_after = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [1000, 560], f1: [1080, 520]}]} dur={dur}>
        <MapNE f={f} dead={0} />
        {[['Boston', 'New York'], ['New York', 'Philadelphia'], ['Philadelphia', 'Washington']].map(([a, b], i) => <Pulses key={i} pts={[CITIES[a], CITIES[b]]} t={(f + i * 20) % 80} speed={9} code="... -.- -.--" color="#7CFFC0" s={1.2} />)}
      </Cam>
      <Tag x={1450} y={150} t={f - 8} text="3 September 1859" sub="“atmospheric current” alone" size={52} />
    </g>
  );
};

export const s39b_secret = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ps = speech(sh, 'PIKE', gf), ns = speech(sh, 'NED', gf);
  const L1 = ls(sh, 1);
  const cuts: Cut[] = [{at: 0, z0: 2.2, z1: 2.35, f0: [1120, 430], f1: [1110, 420]}, {at: L1 - 4, z0: 2.8, z1: 3.0, f0: [905, 430], f1: [905, 425]}];
  const c = cutIdx(f, cuts);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <OfficeScene f={f} sky="day" lamp={0} unplug={1}
        ned={{lean: 4, hF: c === 1 ? [90, -200] : keyHand(0), head: nedH({turn: 0.8, mouth: ns.talking ? ns.mouth : c === 1 ? 'smile' : 'line', open: ns.open, lookX: 1, eyes: c === 1 && !ns.talking ? 'happy' : 'dot', browHeight: 0.4})}} nedProps={{poseF: c === 1 ? 'open' : 'mitt'}}
        behind={<Pike f={f} x={1290} flip o={{hF: [100, -230], hB: [60, -100], lean: 8, head: {turn: 0.6, mouth: ps.talking ? ps.mouth : 'line', open: ps.open, eyes: 'sly', lookX: 1, browInner: -0.4}}} poseF="point" />} />
    </Cam>
  );
};

// ---------------- CH7 WHAT WAS IT? ----------------
const Swallow: React.FC<{x: number; y: number; f: number; s?: number}> = ({x, y, f, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <path d={`M-60 0 Q0 ${-40 - Math.sin(f * 0.8) * 30} 40 -6 Q0 ${20 + Math.sin(f * 0.8) * 30} -60 0 Z`} fill="#1E2A44" />
    <path d="M-60 0 L-110 -16 L-80 2 L-110 18 Z" fill="#1E2A44" />
    <circle cx={44} cy={-2} r={14} fill="#1E2A44" /><path d="M56 -2 L70 2 L56 6" fill="#E2B23A" /><circle cx={48} cy={-6} r={3} fill="#fff" strokeWidth={0} />
    <ellipse cx={20} cy={6} rx={16} ry={8} fill="#C8653A" strokeWidth={2} />
  </g>
);
export const s40_swallow = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [{at: 0, z0: 1.5, z1: 1.6, f0: [1300, 480], f1: [1280, 470]}, {at: 130, z0: 1.0, z1: 1.04, f0: [960, 540], f1: [960, 530]}];
  const c = cutIdx(f, cuts);
  const bx = lerp(-200, 2200, clamp01((f - 150) / 90));
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        {c === 0 ? <g><Observatory f={f} /><Actor L={CARRINGTON} x={1400} y={Y(1.15)} s={1.15} flip p={mkPose(f, {hF: [60 + Math.sin(f * 0.6) * 6, -110], hB: [40, -200], lean: 6, head: {turn: 0.7, lookX: 1, lookY: 0.3, browInner: 0.5, mouth: 'line'}, seed: 6})} poseB="open" /></g> : <DarkTable f={f} />}
      </Cam>
      {c === 1 && <Card x={960} y={500} w={1100} h={360} t={f - 136} title="“One swallow does not" lines={['make a summer.”', '— Richard Carrington, 1859, on linking flare and storm']} />}
      {c === 1 && <Swallow x={bx} y={300 + Math.sin(f * 0.1) * 40} f={f} s={1.4} />}
    </g>
  );
};

export const s41_loomis = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [{at: 0, z0: 1.0, z1: 1.08, f0: [960, 520], f1: [920, 500]}, {at: 170, z0: 1.8, z1: 1.95, f0: [900, 520], f1: [900, 510]}];
  const c = cutIdx(f, cuts);
  const n = Math.min(30, Math.floor(f / 6));
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <Study f={f} />
        <Letters n={n} f={f} />
        <Actor L={LOOMIS} x={1180} y={Y(1.15)} s={1.15} flip p={mkPose(f, {hF: [120, -120 + Math.sin(f * 0.3) * 10], hB: [90, -160], lean: 10, head: {turn: 0.6, lookX: 1, lookY: 0.4, eyes: c === 1 ? 'fear' : 'dot', eyePop: c === 1 ? 0.3 : 0, browHeight: c === 1 ? 1 : 0.3, mouth: c === 1 ? 'O' : 'line', open: 0.3}, seed: 23})} propB={<rect x={0} y={-30} width={70} height={50} fill="#EFE3C6" stroke={INK} strokeWidth={3} />} gripB />
      </Cam>
      {c === 0 && <Tag x={520} y={150} t={f - 8} text="Elias Loomis" sub="Yale College" size={54} />}
      {c === 1 && <Stamp x={1350} y={260} t={f - 180} text="9 ARTICLES · 1859–62" size={64} rot={-6} />}
    </g>
  );
};

export const s42_name = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.6, z1: 2.0, f0: [1500, 540], f1: [1600, 540]}]} dur={dur}>
        <Space f={f} cme={1} shield={1.3} />
        <ellipse cx={1650} cy={540} rx={80} ry={70} fill="none" stroke="#4CF0A0" strokeWidth={10} opacity={0.6} filter="url(#glowS)" />
      </Cam>
      <BigWord x={960} y={240} t={f - 10} text="THE CARRINGTON EVENT" size={110} color="#FFD27A" />
      <Stamp x={960} y={860} t={f - 80} text="MOST INTENSE ON RECORD" size={70} rot={-3} />
    </g>
  );
};

export const s42b_aurora = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [{at: 0, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [960, 520]}, {at: 260, z0: 1.0, z1: 1.12, f0: [1000, 520], f1: [1150, 620]}, {at: 380, z0: 2.2, z1: 2.4, f0: [960, 430], f1: [960, 420]}];
  const c = cutIdx(f, cuts);
  if (c === 0) return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <rect x={-400} y={-300} width={2800} height={1500} fill="#060812" />
        <path d="M-400 900 Q960 760 2400 900 V1400 H-400 Z" fill="#1E3A5A" />
        <path d="M-400 900 Q960 760 2400 900" stroke="#7CC8FF" strokeWidth={30} opacity={0.25} fill="none" filter="url(#glow)" />
        {/* layers */}
        <path d="M-400 520 Q960 400 2400 520" stroke="#4CF0A0" strokeWidth={130} fill="none" opacity={iv(f, [60, 90], [0, 0.5])} filter="url(#glow)" />
        <path d="M-400 300 Q960 180 2400 300" stroke="#E0303A" strokeWidth={130} fill="none" opacity={iv(f, [130, 160], [0, 0.5])} filter="url(#glow)" />
        {Array.from({length: 40}, (_, i) => { const x = (i * 97) % 2200 - 100, y = ((f * 9 + i * 53) % 900) - 200; return <path key={i} d={`M${x} ${y} l14 40`} stroke="#FFE0B0" strokeWidth={4} opacity={0.7} />; })}
      </Cam>
      <Tag x={1580} y={500} t={f - 70} text="green" sub="oxygen, lower down" size={50} />
      <Tag x={1580} y={250} t={f - 140} text="deep red" sub="oxygen, higher up" size={50} />
      <Tag x={420} y={120} t={f - 6} text="charged particles hit the air" size={46} />
    </g>
  );
  if (c === 1) return <Cam lf={f - 260} cuts={[{at: 0, z0: 1.0, z1: 1.12, f0: [1000, 520], f1: [1150, 620]}]} dur={120}><MapAmericas f={f} oval={1} pins={0} /></Cam>;
  return (
    <Cam lf={f - 380} cuts={[{at: 0, z0: 2.2, z1: 2.4, f0: [960, 430], f1: [960, 420]}]} dur={dur - 380}>
      <BostonStreet f={f} sky="aurora" green={0.7} camX={600} />
      <Actor L={NED} x={960} y={Y(1.12)} s={1.12} p={mkPose(f, {hF: [60, -120], hB: [40, -110], lean: -6, head: nedH({turn: 0.25, lookY: -1, mouth: 'smile', browHeight: 0.8}), seed: 1, dart: 0})} />
    </Cam>
  );
};

export const s43_today = ({lf, dur}: SP) => {
  const f = lf;
  const words = ['POWER GRIDS', 'SATELLITES', 'NAVIGATION', 'THE INTERNET'];
  const st = 200;
  const k = f < st ? -1 : Math.min(3, Math.floor((f - st) / 50));
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 520], f1: [1000, 480]}, {at: st, z0: 1.3, z1: 1.45, f0: [900, 400], f1: [1000, 380]}]} dur={dur}>
        {f < st ? <OfficeScene f={f} sky="day" lamp={0} unplug={1} ned={{hF: keyHand(tap(f, 1)), head: nedH({eyes: 'dot', lookX: 1})}} press={tap(f, 1)} burn={0.3} /> : <ModernCity f={f} />}
      </Cam>
      {k >= 0 && <BigWord key={k} x={960} y={880} t={f - st - k * 50} text={words[k]} size={130} color="#FFD27A" />}
      {f < st && <Tag x={1450} y={150} t={f - 8} text="1859: some burnt paper" size={50} />}
    </g>
  );
};

export const s44_2012 = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.05, f0: [960, 540], f1: [1000, 560]}]} dur={dur}>
        <Space f={f} cme={iv(f, [0, 200], [0.2, 1.05])} miss={1} />
        <circle cx={1650} cy={540} r={60} fill="none" stroke="#F3E7CF" strokeWidth={4} strokeDasharray="10 12" opacity={0.7} />
      </Cam>
      <Tag x={420} y={140} t={f - 6} text="23 July 2012" size={56} />
      <Tag x={1500} y={980} t={f - 110} text="Earth: missed by ~9 days" size={46} />
    </g>
  );
};

export const s44b_quebec = ({lf, dur}: SP) => {
  const f = lf;
  const out = iv(f, [120, 170], [0, 1]);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 520], f1: [980, 500]}, {at: 260, z0: 1.4, z1: 1.5, f0: [700, 600], f1: [720, 590]}]} dur={dur}>
        <ModernCity f={f} out={out} snow sats={0} />
        <g opacity={out}><NightSky f={f} mode="aurora" x0={-600} x1={2600} y1={200} green={0.9} amt={0.5} /></g>
      </Cam>
      <Tag x={460} y={140} t={f - 6} text="Quebec · March 1989" size={54} />
      <BigWord x={960} y={880} t={f - 260} text="6 MILLION · 9 HOURS" size={110} />
    </g>
  );
};

export const s45_cost = ({lf, dur}: SP) => {
  const f = lf;
  const v = iv(f, [140, 300], [0, 2.6], EOut);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 520]}]} dur={dur}><DarkTable f={f} /></Cam>
      <Card x={960} y={330} w={1000} h={300} t={f - 6} title="LLOYD'S OF LONDON · 2013" lines={['estimate for a repeat of 1859', 'United States only']} />
      <text x={960} y={760} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={150} fill="#FFD27A" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={iv(f, [130, 140], [0, 1])}>{`$0.6 – $${Math.max(0.6, v).toFixed(1)}`}</text>
      <text x={960} y={880} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={110} fill="#F3E7CF" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={iv(f, [140, 150], [0, 1])}>TRILLION</text>
    </g>
  );
};

export const s46_2024 = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.05, z1: 1.12, f0: [960, 520], f1: [1000, 500]}, {at: 150, z0: 1.4, z1: 1.48, f0: [1000, 640], f1: [1010, 630]}]} dur={dur}>
        <ModernCity f={f} sats={0} />
        <NightSky f={f} mode="aurora" x0={-600} x1={2600} y1={420} green={0.5} amt={0.7} />
        {[600, 800, 1000, 1200, 1400].map((x, i) => (
          <Actor key={i} L={{...extraLook(i + 120), cap: undefined, skirt: undefined, vest: undefined, shirt: ['#3A6A9A', '#9A3A5A', '#5A8A4A', '#E2B23A', '#6A4A8A'][i]}} x={x} y={Y(0.95)} s={0.95} flip={i % 2 === 1}
            p={mkPose(f + i * 11, {...crowdAct(f + i * 11, i, CROWD_KINDS[i % 2 ? 1 : 0]), hF: [90, -250 + Math.sin(f * 0.05 + i) * 6]})}
            propF={<g transform="rotate(-90)"><rect x={-18} y={-30} width={36} height={60} rx={6} fill="#1A1A1A" stroke={INK} strokeWidth={3} /><rect x={-13} y={-24} width={26} height={46} fill="#7CFFC0" opacity={0.85} /></g>} gripF />
        ))}
      </Cam>
      <Tag x={440} y={140} t={f - 6} text="May 2024" sub="a far weaker storm" size={54} />
    </g>
  );
};

// ---------------- CH8 ENDING ----------------
export const s47_home = ({lf, dur}: SP) => {
  const f = lf;
  const st = walk(f / 22);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.1, z1: 1.15, f0: [700 + f * 2.4, 540], f1: [700 + f * 2.4, 530]}, {at: 150, z0: 2.0, z1: 2.1, f0: [700 + 150 * 2.4 + (f - 150) * 2.4, 470], f1: [700 + f * 2.4, 460]}]} dur={dur}>
      <BostonStreet f={f} sky="dawn" lit={0.4} />
      {[[300, 'whisper'], [420, 'whisper'], [1500, 'nudge'], [1640, 'point'], [2300, 'whisper'], [2440, 'whisper']].map(([x, k], i) => <Actor key={i} L={extraLook(i + 200)} x={x as number} y={Y(0.95)} s={0.95} flip={i % 2 === 1} p={mkPose(f + i * 9, crowdAct(f + i * 9, i, k as any))} />)}
      <Actor L={NED} x={500 + f * 2.4} y={Y(1.12)} s={1.12} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean, hF: [-10 + st.swing * 30, 6], hB: [40 - st.swing * 30, 4], head: nedH({turn: 0.7, eyes: 'half', mouth: 'smile', lookX: 1, lookY: -0.3}), seed: 1})} />
    </Cam>
  );
};

export const s48_question = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ns = speech(sh, 'NED', gf), ps = speech(sh, 'PIKE', gf);
  const L1 = ls(sh, 1), L2 = ls(sh, 2);
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 520]},
    {at: L1 - 4, z0: 2.6, z1: 2.8, f0: [900, 440], f1: [900, 430]},
    {at: L2 - 4, z0: 2.0, z1: 2.1, f0: [2330, 440], f1: [2330, 430]},
  ];
  const c = cutIdx(f, cuts);
  if (c === 0) return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}><BostonStreet f={f + 900} sky="red" green={0.2} camX={400} /></Cam>
      <rect width={1920} height={1080} fill="#0E0805" opacity={0.35} />
      <Card x={960} y={480} w={1150} h={360} t={f - 20} title="WOULD YOU HAVE" lines={['unplugged the battery?', 'tell us in the comments']} />
    </g>
  );
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <OfficeScene f={f} sky="day" lamp={0} unplug={1}
        ned={{lean: 4, hF: [100, -200], head: nedH({turn: 0.4, mouth: ns.talking ? ns.mouth : 'smile', open: ns.open, eyes: ns.talking ? 'dot' : 'happy', lookX: 0.6, browHeight: 0.5})}} nedProps={{poseF: 'point'}}
        behind={<Pike f={f} x={2330} flip o={{hF: [130, -150], hB: [60, -100], head: {turn: 0.35, mouth: ps.talking ? ps.mouth : c === 2 ? 'smile' : 'line', open: ps.open, eyes: c === 2 && !ps.talking ? 'happy' : 'half', lookX: -0.4}}} propF={<g transform="rotate(-80)"><rect x={-18} y={-26} width={36} height={36} fill="#E8E0D0" stroke={INK} strokeWidth={4} /></g>} gripF />} />
    </Cam>
  );
};

export const s49_end = ({lf}: SP) => {
  const f = lf;
  const a = iv(lf, [0, 14], [0, 1]);
  return (
    <g>
      <rect width={1920} height={1080} fill="#0E1418" />
      <g opacity={0.35}><BostonStreet f={f} sky="aurora" green={0.7} camX={f} /></g>
      <rect width={1920} height={1080} fill="#120B08" opacity={0.5} />
      <g opacity={a}>
        <text x={960} y={120} textAnchor="middle" fontFamily="FellSC" fontSize={50} fill="#E8D8B0" letterSpacing={6}>YOU WERE THERE · EPISODE 2</text>
        <rect x={180} y={240} width={800} height={450} rx={16} fill="#0E0805" stroke="#4CF0A0" strokeWidth={6} />
        <text x={580} y={410} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={70} fill="#F3E7CF">WATCH NEXT</text>
        <text x={580} y={490} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={42} fill="#E8D8B0">You Were There, Episode 1:</text>
        <text x={580} y={546} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={42} fill="#E8D8B0">You Board the Mary Celeste</text>
        <circle cx={1440} cy={410} r={150} fill="#0E0805" stroke="#E8D8B0" strokeWidth={6} />
        <g transform="translate(1440 520) scale(0.75)"><Puppet L={NED} p={mkPose(f, {hF: [100, -260 + Math.sin(f * 0.3) * 20], hB: [40, 2], head: {turn: 0.4, eyes: 'happy', mouth: 'grin', open: 0.3}, seed: 2})} poseF="open" /></g>
        <rect x={1240} y={620} width={400} height={90} rx={14} fill="#C4302B" stroke={INK} strokeWidth={5} />
        <text x={1440} y={682} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={52} fill="#fff">SUBSCRIBE</text>
        <text x={960} y={910} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={110} fill="#4CF0A0" letterSpacing={8}>HISTORY SOURCED</text>
        <text x={960} y={985} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill="#E8D8B0">animated reconstruction · Ned is fictional · sources in the description</text>
      </g>
    </g>
  );
};
void PIKE; void Office; void Roofline; void NightSky; void Sparks; void FreezeLabel; void lerp;
