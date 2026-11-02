// Ep 1 shots, chapters 4–5 (kitchen cures, who pulls teeth)
import React from 'react';
import {TOM, AGNES, HOLLIS, PHYSICIAN, BOY, extraLook, Bottle, Root, Funnel, Candle, Sponge, Pipe, Birch, Pliers, ToothProp, Look} from '../rig';
import {walk, tiptoe, flinch, spring, ease, clamp01, lerp, lerp2, knead, shiver, stagger, gesture} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, le, speech, FreezeLabel, Tag, BigWord, Stamp, Throb, CureCard, INK, FLOOR, EOut, EBack, Cut} from './kit';
import {Attic, Blanket, Bakery, Street, Parchment, DarkTable, Fair, flickOf, Flame} from './sets';
import {tomH, MapWalk} from './shots1';

const Y = (s: number) => FLOOR - 176 * s;
const TX = 2280, AX = 2560; // Tom and Agnes positions at the hearth corner
const agnesHead = (sp: ReturnType<typeof speech>, o: any = {}) => ({turn: 0.7, mouth: sp.mouth, open: sp.open, eyes: 'dot' as const, browInner: 0.3, lookX: 0.6, tilt: sp.talking ? Math.sin(sp.amp * 6) * 3 : 0, ...o});

// ---------------- CH4 ----------------
export const s17_agnes = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const as = speech(sh, 'AGNES', gf);
  const ax = iv(lf, [0, L2 - 10], [2900, AX], EOut);
  const aw = walk(f / 26, lf < L2 - 10 ? 1 : 0);
  const grab = ease(iv(lf, [L2 + 20, L2 + 34], [0, 1]));
  const cuts: Cut[] = [{at: 0, z0: 1.15, z1: 1.2, f0: [2400, 560], f1: [2440, 560]}, {at: L2, z0: 2.0, z1: 2.15, f0: [2430, 450], f1: [2440, 440]}];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <Bakery f={f + 1200} />
      <Actor L={TOM} x={TX} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: [74, -196], hB: [50, -20], head: tomH({lookX: 0.8, turn: lerp(0.6, 0.85, grab), tilt: grab * 6, swell: 1.15}), seed: 2})} />
      <Actor L={AGNES} x={ax} y={Y(1.1)} s={1.1} flip p={mkPose(f, {legF: aw.legF, legB: aw.legB, bob: aw.bob, lean: 4 + grab * 10, hF: lerp2([-10, 6], [180, -200], grab), hB: [40, -60], head: agnesHead(as, {browInner: grab > 0.5 ? 0.8 : 0.3}), seed: 6})} poseF={grab > 0.5 ? 'mitt' : undefined} gripF={grab > 0.5} />
    </Cam>
  );
};

export const s18_recipes = ({lf, dur}: SP) => {
  const f = lf;
  const flip = iv(lf, [90, 110], [0, 1], EOut);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.12, f0: [960, 560], f1: [960, 540]}]} dur={dur}>
      <DarkTable f={f} />
      <g filter="url(#paint)">
        <rect x={320} y={180} width={1280} height={760} rx={20} fill="#5A2E22" stroke={INK} strokeWidth={8} />
        <path d="M360 210 H950 V910 H360 Z" fill="#EADBB8" stroke="#6B5434" strokeWidth={4} />
        <path d="M970 210 H1560 V910 H970 Z" fill="#E4D2AA" stroke="#6B5434" strokeWidth={4} />
      </g>
      <text x={655} y={300} textAnchor="middle" fontFamily="FellSC" fontSize={46} fill="#7E2119">For the Tooth-ach</text>
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M420 ${370 + i * 56} q60 -10 120 0 t120 0 t120 0 t110 0`} stroke="#5A4030" strokeWidth={3} fill="none" opacity={0.75} />)}
      <g transform="translate(1265 420)"><Bottle /></g>
      <g transform="translate(1180 640) scale(1.4)"><Root /></g>
      <text x={1265} y={830} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill="#5A4030">cloves · pellitory · henbane</text>
      {/* page turning */}
      {flip > 0 && flip < 1 && <path d={`M970 210 Q${970 + 590 * (1 - flip * 2)} 260 ${970 + 590 * (1 - flip * 2)} 560 Q${970 + 590 * (1 - flip * 2)} 860 970 910 Z`} fill="#F0E2BE" stroke="#6B5434" strokeWidth={4} />}
    </Cam>
  );
};

export const s19_clove = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1), L3 = ls(sh, 2);
  const as = speech(sh, 'AGNES', gf);
  const dab = ease(iv(lf, [20, 40], [0, 1])) * (1 - ease(iv(lf, [L2 + 40, L2 + 60], [0, 1])));
  const burn = flinch(lf - 42);
  const relief = lf > L3 + 20;
  if (lf >= L2 + 10 && lf < L3) {
    // insert: the clove bottle
    return (
      <g>
        <Cam lf={lf} cuts={[{at: L2 + 10, z0: 1.0, z1: 1.1, f0: [960, 560], f1: [960, 540]}]} dur={dur}>
          <DarkTable f={f} />
          <g transform="translate(860 600) scale(3)"><Bottle /></g>
          {Array.from({length: 14}, (_, i) => <path key={i} transform={`translate(${1180 + (i % 5) * 60} ${700 + Math.floor(i / 5) * 50}) rotate(${i * 40})`} d="M0 -18 L4 4 L0 8 L-4 4 Z M-8 -18 h16" stroke={INK} strokeWidth={3} fill="#5A3A22" />)}
        </Cam>
        <CureCard t={lf - L2 - 14} n={1} name="Oil of Cloves" />
      </g>
    );
  }
  const cuts: Cut[] = [{at: 0, z0: 1.9, z1: 2.0, f0: [2420, 450], f1: [2420, 445]}, {at: L3, z0: 2.6, z1: 2.8, f0: [2300, 420], f1: [2300, 415]}];
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} shake={burn.shake * (lf < L2 ? 1 : 0)}>
        <Bakery f={f + 1500} />
        <Actor L={TOM} x={TX} y={Y(1.1) + burn.bob * 0.5} s={1.1} p={mkPose(f, {hF: [74, -196], hB: [50, -20], lean: burn.lean * 0.6, head: tomH({eyes: relief ? 'happy' : lf > 42 && lf < 90 ? 'squeeze' : 'dot', mouth: relief ? 'smile' : lf > 42 && lf < 90 ? 'fear' : 'zigzag', open: 0.3, browInner: relief ? 0 : 1, swell: 1.15, lookX: 0.8, tilt: burn.tilt}), seed: 2})} />
        <Actor L={AGNES} x={AX} y={Y(1.1)} s={1.1} flip p={mkPose(f, {lean: 6 + dab * 8, hF: lerp2([90, -80], [200, -210], dab), hB: [60, -70], head: agnesHead(as), seed: 6})} propB={<g transform="translate(0 -10) scale(0.55)"><Bottle /></g>} gripB poseF="point" />
        {lf > 42 && lf < 100 && Array.from({length: 4}, (_, i) => <circle key={i} cx={2380 + i * 12} cy={430 - ((lf - 42 + i * 8) % 40) * 3} r={10 + i * 3} fill="#EEE" opacity={0.4} />)}
      </Cam>
      {lf < L2 + 10 && <CureCard t={lf - 50} n={1} name="Oil of Cloves" />}
      {relief && <Tag x={1450} y={880} t={lf - L3 - 30} text="eugenol" sub="the numbing oil in cloves" size={44} />}
    </g>
  );
};

export const s20_happy = ({lf, gf, sh, dur}: SP) => {
  const f0 = lf;
  const OFF = ls(sh, 2);
  const FREEZE = OFF + 22;
  const frozen = lf >= FREEZE;
  const f = Math.min(lf, FREEZE);
  const ts = speech(sh, 'TOM', sh.start + f);
  const hop = Math.abs(Math.sin(f * 0.22)) * (f < OFF ? 1 : 0);
  const snap = f >= OFF + 10;
  const cuts: Cut[] = [{at: 0, z0: 1.5, z1: 1.6, f0: [2300, 520], f1: [2300, 510]}, {at: OFF, z0: 2.7, z1: 2.9, f0: [2300, 410], f1: [2300, 405]}];
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={f} cuts={cuts} dur={dur}>
          <Bakery f={f + 1800} />
          <Actor L={TOM} x={TX} y={Y(1.1) - hop * 40} s={1.1} p={mkPose(f, {
            legF: [hop * 0.5, hop * 0.9], legB: [-hop * 0.3, hop * 0.9], hF: snap ? [74, -196] : [80 + Math.sin(f * 0.3) * 20, -260], hB: snap ? [50, -20] : [70, -250], squash: hop > 0.9 ? -0.04 : 0,
            head: tomH({eyes: snap ? 'fear' : 'happy', eyePop: snap ? 1.2 : 0, mouth: ts.talking ? (ts.open > 0.05 ? ts.mouth : 'grin') : snap ? 'zigzag' : 'grin', open: ts.open, browInner: snap ? 1 : -0.2, browHeight: snap ? 1 : 0.4, swell: 1.15}), seed: 2,
          })} poseF={snap ? undefined : 'open'} poseB={snap ? undefined : 'open'} />
          {snap && <Throb x={2370} y={420} f={f} />}
        </Cam>
      </g>
      {frozen && <FreezeLabel t={lf - FREEZE} title="1 HOUR." sub="That was the good part." />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.6, 0])} />}
    </g>
  );
};

export const s20b_back = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const hs = speech(sh, 'HOLLIS', gf), ts = speech(sh, 'TOM', gf);
  const kn = knead(f, 0.3);
  const L3 = ls(sh, 2);
  const cuts: Cut[] = [{at: 0, z0: 1.8, z1: 1.9, f0: [520, 470], f1: [520, 465]}, {at: ls(sh, 1) - 4, z0: 2.2, z1: 2.3, f0: [790, 450], f1: [790, 445]}, {at: L3, z0: 1.15, z1: 1.2, f0: [720, 560], f1: [740, 560]}];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} shake={hs.talking ? 3 * hs.amp : 0}>
      <Bakery f={f + 2100} />
      <Actor L={TOM} x={760} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: kn.hF, hB: kn.hB, bob: kn.bob, lean: kn.lean, head: tomH({mouth: ts.talking ? ts.mouth : 'zigzag', open: ts.open, eyes: lf > L3 ? 'squeeze' : 'half', lookX: 0.5, lookY: 0.6, swell: 1.2, browInner: 1}), seed: 2})} gripF gripB />
      <Actor L={HOLLIS} x={430} y={Y(1.2)} s={1.2} p={mkPose(f, {hF: [100, -150], hB: [60, -60], lean: 6, head: {turn: 0.7, mouth: hs.mouth, open: hs.open, browInner: -1, lookX: 0.8}, seed: 4})} poseF="point" />
      {lf > L3 && <Throb x={850} y={480} f={f} />}
    </Cam>
  );
};

export const s21_root = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1), L3 = ls(sh, 2);
  const as = speech(sh, 'AGNES', gf);
  const give = ease(iv(lf, [10, 30], [0, 1]));
  const take = lf > 40;
  const chew = take ? Math.max(0, Math.sin(f * 0.45)) : 0;
  const drool = iv(lf, [L3 - 20, dur], [0, 1]);
  const cuts: Cut[] = [{at: 0, z0: 1.7, z1: 1.8, f0: [2420, 480], f1: [2420, 470]}, {at: L2, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [960, 540]}, {at: L3, z0: 2.6, z1: 2.8, f0: [2300, 420], f1: [2300, 415]}];
  const insert = lf >= L2 && lf < L3;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        {insert ? (
          <g>
            <DarkTable f={f} />
            {[0, 1, 2].map((i) => <g key={i} transform={`translate(${700 + i * 220} ${560 + i * 30}) rotate(${-10 + i * 15}) scale(3)`}><Root /></g>)}
            {Array.from({length: 6}, (_, i) => <path key={i} d={`M${1400 + i * 30} ${480 - i * 10} q10 -30 0 -60`} stroke="#E5503A" strokeWidth={5} fill="none" opacity={0.6} />)}
          </g>
        ) : (
          <g>
            <Bakery f={f + 2400} />
            <Actor L={TOM} x={TX} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: take ? [100 + chew * 6, -216 + chew * 4] : [74, -196], hB: [50, -20], head: tomH({eyes: lf > L3 ? 'half' : 'dot', mouth: chew > 0.3 ? 'O' : 'M', open: chew * 0.4, lookX: 0.7, swell: 1.2, browInner: 0.6}), seed: 2})} propF={take ? <g transform="rotate(-90) scale(0.7)"><Root /></g> : undefined} gripF={take} />
            <Actor L={AGNES} x={AX} y={Y(1.1)} s={1.1} flip p={mkPose(f, {lean: 4 + give * 6, hF: take ? [60, -60] : lerp2([60, -60], [190, -120], give), hB: [50, -40], head: agnesHead(as), seed: 6})} propF={!take ? <g transform="scale(0.8)"><Root /></g> : undefined} gripF={!take} />
            {drool > 0 && <path d={`M2378 ${398} q-4 ${40 * drool} 2 ${70 * drool}`} stroke="#BFE3F2" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.9} />}
          </g>
        )}
      </Cam>
      {insert && <CureCard t={lf - L2 - 4} n={2} name="Pellitory Root" />}
    </g>
  );
};

export const s22_drool = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const A = ls(sh, 1) - 4;
  const ts = speech(sh, 'TOM', gf), as = speech(sh, 'AGNES', gf);
  if (lf < A) {
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 2.9, z1: 3.1, f0: [2300, 410], f1: [2300, 405]}]} dur={dur}>
        <Bakery f={f + 2800} />
        <Actor L={TOM} x={TX} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: [74, -196], hB: [50, -20], head: tomH({eyes: 'half', mouth: ts.talking ? ts.mouth : 'O', open: ts.open + 0.1, swell: 1.2, lookX: 0.8, browInner: 0.8}), seed: 2})} />
        <path d={`M2378 398 q-4 ${50 + Math.sin(f * 0.2) * 8} 2 ${90 + Math.sin(f * 0.2) * 10}`} stroke="#BFE3F2" strokeWidth={9} strokeLinecap="round" fill="none" />
        <circle cx={2380} cy={500 + ((f * 4) % 120)} r={7} fill="#BFE3F2" stroke={INK} strokeWidth={2} />
      </Cam>
    );
  }
  // reaction shot: Agnes, deadpan
  return (
    <Cam lf={lf} cuts={[{at: A, z0: 2.9, z1: 3.0, f0: [2590, 410], f1: [2590, 408]}]} dur={dur}>
      <Bakery f={f + 2800} />
      <Actor L={AGNES} x={AX} y={Y(1.1)} s={1.1} flip p={mkPose(f, {hF: [60, -60], hB: [50, -40], head: agnesHead(as, {eyes: 'half', browInner: 0, lookX: 0.2}), still: true, seed: 6})} />
    </Cam>
  );
};

const Smoke: React.FC<{f: number; x: number; y: number; amt: number; dx?: number}> = ({f, x, y, amt, dx = 1}) => (
  <g opacity={amt}>
    {Array.from({length: 10}, (_, i) => {
      const ph = ((f * 1.2 + i * 14) % 140) / 140;
      return <circle key={i} cx={x + Math.sin(f * 0.05 + i) * 20 + ph * 80 * dx} cy={y - ph * 260} r={14 + ph * 50} fill="#C8C0B0" opacity={0.45 * (1 - ph)} />;
    })}
  </g>
);

export const s23_henbane = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const as = speech(sh, 'AGNES', gf);
  const fn = ease(iv(lf, [L2 + 90, L2 + 110], [0, 1]));
  const cuts: Cut[] = [{at: 0, z0: 1.35, z1: 1.42, f0: [2440, 540], f1: [2440, 535]}, {at: L2, z0: 2.5, z1: 2.7, f0: [2440, 640], f1: [2440, 630]}, {at: L2 + 90, z0: 1.9, z1: 2.0, f0: [2420, 470], f1: [2420, 465]}];
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <Bakery f={f + 3100} />
        <Actor L={TOM} x={TX} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: [74, -196], hB: [50, -20], lean: fn * 10, head: tomH({eyes: fn > 0.5 ? 'fear' : 'dot', mouth: fn > 0.5 ? 'O' : 'zigzag', open: 0.6, lookX: 0.8, swell: 1.2}), seed: 2})} />
        {/* stool with the candle and seeds */}
        <rect x={2380} y={760} width={140} height={20} fill="#6B4A31" stroke={INK} strokeWidth={5} />
        <path d="M2395 780 V905 M2505 780 V905" stroke={INK} strokeWidth={10} />
        <g transform="translate(2450 760)"><Candle flick={flickOf(f)} /></g>
        <circle cx={2450} cy={700} r={220} fill="url(#candle)" opacity={0.8} />
        <Smoke f={f} x={2450} y={680} amt={iv(lf, [L2, L2 + 30], [0, 1])} dx={fn > 0.5 ? -0.8 : 0.2} />
        <Actor L={AGNES} x={AX} y={Y(1.1)} s={1.1} flip p={mkPose(f, {lean: 6 + fn * 10, hF: lerp2([110, 60], [220, -180], fn), hB: [100, 20], head: agnesHead(as, {lookY: fn > 0.5 ? 0 : 0.8}), seed: 6})} propF={fn > 0.2 ? <g transform="rotate(0) scale(0.8)"><Funnel /></g> : undefined} gripF={fn > 0.2} />
      </Cam>
      {lf > L2 && <CureCard t={lf - L2 - 6} n={3} name="Henbane Smoke" />}
    </g>
  );
};

export const s24_trick = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const drop = iv(lf, [40, 90], [0, 1]);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [960, 560], f1: [960, 540]}, {at: L2, z0: 1.5, z1: 1.6, f0: [960, 600], f1: [960, 590]}]} dur={dur}>
        <DarkTable f={f} />
        <ellipse cx={960} cy={680} rx={420} ry={130} fill="#A88238" stroke={INK} strokeWidth={8} />
        <ellipse cx={960} cy={660} rx={370} ry={100} fill="#7A9AA4" opacity={0.85} />
        {Array.from({length: 6}, (_, i) => {
          const y = lerp(300, 640 + (i % 3) * 14, Math.min(1, drop * 1.4 - i * 0.08));
          return <path key={i} d={`M${800 + i * 60} ${y} q10 ${-8 + Math.sin(f * 0.3 + i) * 8} 20 0 q10 ${8 - Math.sin(f * 0.3 + i) * 8} 20 0`} stroke="#F4F0E6" strokeWidth={11} fill="none" strokeLinecap="round" transform={`translate(${-(800 + i * 60)} ${-y}) scale(1.8) translate(${(800 + i * 60) / 1.8} ${y / 1.8})`} />;
        })}
        {/* a hand dropping them */}
        <g transform={`translate(${1000 + iv(lf, [0, 40], [300, 0])} ${220})`} opacity={iv(lf, [100, 120], [1, 0])}>
          <ellipse cx={0} cy={0} rx={50} ry={40} fill="#E8D2B4" stroke={INK} strokeWidth={5} />
          <rect x={20} y={-30} width={300} height={60} fill="#5A3E44" stroke={INK} strokeWidth={5} />
        </g>
      </Cam>
      <BigWord x={960} y={200} t={lf - 100} text="Look, worms!" size={110} color="#F3E7CF" />
      <Stamp x={1450} y={820} t={lf - L2 - 10} text="TRICK" />
    </g>
  );
};

export const s25_dizzy = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1), L3 = ls(sh, 2);
  const ts = speech(sh, 'TOM', gf);
  const amt = iv(lf, [0, 80], [0.2, 1]);
  const sw = stagger(f, amt);
  const ghost = iv(lf, [L2, L2 + 40], [0, 1]);
  const cuts: Cut[] = [{at: 0, z0: 1.5, z1: 1.6, f0: [2420, 520], f1: [2420, 515]}, {at: 190, z0: 2.6, z1: 2.8, f0: [2300, 420], f1: [2300, 415]}, {at: L3 - 6, z0: 1.9, z1: 2.0, f0: [2580, 440], f1: [2580, 435]}];
  const cam = cuts.length;
  void cam;
  const ag = (dx: number, op: number) => <g opacity={op}><Actor L={AGNES} x={AX + dx} y={Y(1.1)} s={1.1} flip p={mkPose(f, {hF: [60, -60], hB: [50, -40], head: {turn: 0.7, browInner: 0.9, browHeight: 0.6, mouth: 'O', open: 0.2, lookX: 0.6}, seed: 6})} /></g>;
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} rot={Math.sin(f * 0.07) * 3 * amt}>
        <Bakery f={f + 3500} />
        <Actor L={TOM} x={TX + sw.sway} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: [74, -196], hB: [80, -100 + Math.sin(f * 0.1) * 20], lean: sw.tilt, head: tomH({eyes: lf > 40 ? 'dizzy' : 'dot', mouth: ts.talking ? ts.mouth : 'O', open: ts.talking ? ts.open : 0.3, tilt: sw.tilt * 1.5, swell: 1.2, browInner: 0.4}), seed: 2})} poseB="open" />
        {lf > 60 && Array.from({length: 5}, (_, i) => {
          const a = f * 0.12 + (i * Math.PI * 2) / 5;
          return <path key={i} transform={`translate(${2300 + Math.cos(a) * 110} ${280 + Math.sin(a) * 26})`} d="M0 -16 L5 -5 L16 0 L5 5 L0 16 L-5 5 L-16 0 L-5 -5 Z" fill="#FFE45A" stroke={INK} strokeWidth={3} />;
        })}
        {ag(0, 1)}
        {ghost > 0 && ag(90 * ghost * (1 + 0.2 * Math.sin(f * 0.1)), 0.45)}
      </Cam>
      {lf > L2 - 20 && lf < L3 && <Stamp x={1450} y={220} t={lf - L2 + 10} text="POISON" rot={8} />}
      {lf < 190 && <Tag x={460} y={880} t={lf - 40} text="Henbane" sub="dizziness · racing heart · visions" size={46} />}
    </g>
  );
};

export const s26_night3 = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const sv = shiver(f, 1);
  const cuts: Cut[] = [{at: 0, z0: 1.15, z1: 1.25, f0: [900, 620], f1: [860, 640]}, {at: L2 - 6, z0: 2.9, z1: 3.1, f0: [640, 760], f1: [640, 765]}];
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <Attic f={f + 500} candle />
        <g transform={`translate(${sv.x} 0)`}>
          <g transform={`translate(620 790) rotate(${-78 + sv.tilt}) scale(0.9)`} filter="url(#soft)">
            {/* reuse head from rig directly */}
            <g><HeadOf f={f} /></g>
          </g>
        </g>
        <Blanket x={660} y={800} breathe={Math.sin(f * 0.2)} shiver={sv.x} />
        <Throb x={650} y={760} f={f} amt={1} />
        {/* shadow of pliers on the wall at the end */}
        {lf > L2 && <g opacity={iv(lf, [L2, L2 + 20], [0, 0.55])} transform="translate(980 360) rotate(-30) scale(4)"><g filter="url(#blurBg)"><path d="M0 -6 L70 -10 L118 -4 L70 2 Z M0 6 L70 10 L118 4 L70 -2 Z M-4 -8 L-46 -16 M-4 8 L-46 16" stroke="#0A0604" strokeWidth={8} fill="#0A0604" /></g></g>}
      </Cam>
    </g>
  );
};
import {Head, restHead} from '../rig';
const HeadOf: React.FC<{f: number}> = ({f}) => <Head h={restHead({...tomH(), swell: 1.45, eyes: 'squeeze', mouth: 'zigzag', browInner: 1, sweat: ((f % 80) / 80)})} L={TOM} frame={f} />;

// ---------------- CH5 ----------------
export const s27_options = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const drawer = extraLook(51);
  const crowd = Array.from({length: 7}, (_, i) => extraLook(60 + i));
  const drum = Math.sin(f * 0.6);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [960, 540]}, {at: 140, z0: 1.9, z1: 2.0, f0: [860, 360], f1: [860, 355]}, {at: L2, z0: 1.0, z1: 1.04, f0: [960, 560], f1: [960, 560]}]} dur={dur}>
        <Fair f={f} />
        {/* tooth-drawer on stage pulling a tooth, drummer beside */}
        <Actor L={{...drawer, cap: 'tall', capColor: '#7E2119'}} x={820} y={560 - 176} s={1.0} flip p={mkPose(f, {hF: [120, -200 + Math.sin(f * 0.25) * 30], hB: [60, -40], lean: 10 + Math.sin(f * 0.25) * 8, head: {turn: 0.6, mouth: 'grin', eyes: 'sly'}, seed: 9})} propF={<g transform="rotate(-30)"><Pliers /></g>} gripF />
        <Actor L={extraLook(53)} x={650} y={560 - 176} s={0.95} p={mkPose(f, {legF: [1.42, 1.42], legB: [1.3, 1.3], hF: [74, -196], hB: [60, -10], lean: -14 + Math.sin(f * 0.5) * 6, head: {turn: 0.6, eyes: 'squeeze', mouth: 'fear', open: 0.6 + 0.3 * Math.sin(f * 0.7), browInner: 1}, seed: 10})} />
        <Actor L={extraLook(54)} x={1100} y={560 - 176} s={0.95} flip p={mkPose(f, {hF: [90, -60 - Math.max(0, drum) * 50], hB: [80, -40 - Math.max(0, -drum) * 50], head: {turn: 0.6, mouth: 'smile', eyes: 'happy'}, seed: 11})} />
        <ellipse cx={1010} cy={420} rx={56} ry={40} fill="#B3362B" stroke={INK} strokeWidth={6} />
        {crowd.map((L, i) => <Actor key={i} L={L} x={200 + i * 230} y={FLOOR - 30} s={0.9} flip={i % 2 === 0} p={mkPose(f, {hF: i % 3 ? [60, -240 + Math.sin(f * 0.2 + i) * 20] : [-10, 6], hB: [40, 2], head: {turn: 0.6, mouth: i % 2 ? 'grin' : 'O', open: 0.4, eyes: 'dot', lookY: -0.6}, seed: i + 30})} />)}
      </Cam>
      {lf >= L2 && <rect width={1920} height={1080} fill="#120B08" opacity={0.6} />}
      {lf >= L2 && <Stamp x={960} y={520} t={lf - L2 - 4} text="CROWDS = PLAGUE" size={100} rot={-6} />}
      {lf < 140 && <Tag x={400} y={140} t={lf - 20} text="The tooth-drawer" sub="a normal year at the fair" size={48} />}
    </g>
  );
};

export const s28_physician = ({lf, dur}: SP) => {
  const f = lf;
  const leave = iv(lf, [150, dur], [0, 1]);
  const st = walk(f / 26, leave > 0 ? 1 : 0);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.4, z1: 1.5, f0: [900, 520], f1: [900, 510]}, {at: 150, z0: 1.0, z1: 1.05, f0: [1100, 540], f1: [1300, 540]}]} dur={dur}>
        <Street f={f} mode="day" crosses={{4: 1}} />
        <Actor L={PHYSICIAN} x={900 + leave * 1500} y={Y(1.15)} s={1.15} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, hF: leave > 0 ? [-10 + st.swing * 20, 6] : [100, -150], hB: [60, -40], lean: 2, head: {turn: 0.6, eyes: 'sly', mouth: 'smile', browInner: -0.3, lookX: 0.5}, seed: 12})} poseF={leave > 0 ? undefined : 'open'} propB={<g transform="translate(0 40)"><rect x={-40} y={-30} width={80} height={60} rx={8} fill="#5A3D27" stroke={INK} strokeWidth={5} /></g>} gripB />
        {leave === 0 && <g transform={`translate(1120 ${380 + Math.sin(f * 0.1) * 6}) rotate(6)`}><rect x={-120} y={-50} width={240} height={100} fill="#EFE3C6" stroke={INK} strokeWidth={5} /><text x={0} y={18} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={54} fill="#7E2119">£££</text></g>}
      </Cam>
      {lf < 150 && <Tag x={460} y={140} t={lf - 10} text="The physician" sub="university-trained, expensive" size={48} />}
      {lf >= 150 && <Tag x={1450} y={160} t={lf - 170} text="Gone to the country" size={48} />}
    </g>
  );
};

export const s29_barberopt = ({lf, dur}: SP) => {
  const f = lf;
  const panels = [
    {t: 10, label: 'shaves', el: <g><path d="M-80 20 L60 -10 L70 6 L-70 36 Z" fill="#B8BCC2" stroke={INK} strokeWidth={5} /><rect x={-150} y={20} width={80} height={24} rx={8} fill="#6B4A2F" stroke={INK} strokeWidth={5} transform="rotate(-12)" /></g>},
    {t: 60, label: 'lets blood', el: <g><path d="M-90 -10 Q0 80 90 -10 Z" fill="#C9A35A" stroke={INK} strokeWidth={6} /><path d="M-30 -10 q30 30 60 0" fill="#9A1E1A" stroke={INK} strokeWidth={4} /></g>},
    {t: 110, label: 'pulls teeth', el: <g transform="rotate(-25) scale(1.2)"><Pliers glint={iv(f, [130, 136, 146], [0, 1, 0])} /></g>},
  ];
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 530]}]} dur={dur}>
        <DarkTable f={f} />
        {panels.map((p, i) => {
          const a = iv(f - p.t, [0, 12], [0, 1], EBack);
          return (
            <g key={i} transform={`translate(${440 + i * 520} 520) scale(${a}) rotate(${(i - 1) * 3})`}>
              <rect x={-220} y={-260} width={440} height={520} fill="#EFE3C6" stroke={INK} strokeWidth={7} />
              <rect x={-220} y={-260} width={440} height={520} filter="url(#brush)" fill="#EFE3C6" />
              <g transform="translate(0 -40)">{p.el}</g>
              <text x={0} y={190} textAnchor="middle" fontFamily="FellSC" fontSize={54} fill={INK}>{p.label}</text>
            </g>
          );
        })}
      </Cam>
      <Tag x={960} y={110} t={lf - 2} text="The barber-surgeon" size={60} color="#7E2119" />
    </g>
  );
};

export const s30_route = ({lf, dur}: SP) => (
  <MapWalk lf={lf} dur={dur} route={[[1250, 520], [1150, 470], [1000, 450], [900, 380], [780, 360]]} t0={6} t1={dur - 6} crosses={14}
    cuts={[{at: 0, z0: 1.35, z1: 1.45, f0: [1020, 460], f1: [960, 440]}]} pins={[{p: [780, 360], text: 'Barber-surgeon', at: dur - 40}]} />
);

export const s31_nightstreet = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const tp = tiptoe(f / 24);
  const tx = iv(lf, [0, dur], [200, 1700]);
  const cartX = iv(lf, [0, L2 + 40], [2600, 1200]);
  const st = walk(f / 30);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.05, f0: [800, 560], f1: [1000, 560]}, {at: L2, z0: 1.6, z1: 1.7, f0: [1300, 500], f1: [1360, 500]}]} dur={dur}>
      <Street f={f} mode="dawn" crosses={{2: 1, 4: 1, 7: 1}} lamps={[500, 1500, 2400]} />
      <rect x={-600} y={-300} width={4200} height={1500} fill="#0C1424" opacity={0.42} />
      {/* the dead-cart, far, lantern swinging */}
      <g transform={`translate(${cartX} ${FLOOR - 120}) scale(0.7)`} opacity={0.9}>
        <rect x={-170} y={-60} width={300} height={110} fill="#2A1E16" stroke={INK} strokeWidth={6} />
        {[-110, 70].map((wx) => <g key={wx} transform={`translate(${wx} 70) rotate(${-f * 4})`}><circle r={56} fill="#1A120C" stroke={INK} strokeWidth={6} /><path d="M-56 0 H56 M0 -56 V56" stroke="#3A2A1E" strokeWidth={6} /></g>)}
        <g transform={`translate(180 -120) rotate(${Math.sin(f * 0.15) * 14})`}><Lantern lit={1} /></g>
        <circle cx={180} cy={-140} r={200} fill="url(#candle)" />
      </g>
      {lf > L2 && [0, 1].map((i) => {
        const L = extraLook(70 + i);
        const x = 1200 + i * 260 + (lf - L2) * (i ? -1.6 : 1.2);
        return <Actor key={i} L={L} x={x} y={Y(1.05)} s={1.05} flip={i === 1} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, hF: [118, -214], hB: [40, 2], head: {turn: 0.6, eyes: 'dot', browInner: 0.8, mouth: 'line'}, seed: 40 + i})} propF={<g transform="translate(6 -4)"><Sponge /></g>} gripF />;
      })}
      <Actor L={TOM} x={tx} y={Y(1.1) + tp.bob} s={1.1} p={mkPose(f, {legF: tp.legF, legB: tp.legB, lean: tp.lean, hF: [74, -196], hB: [30, -60], head: tomH({lookX: lf > L2 ? 0.9 : 0.3, browInner: 1, browHeight: 0.6, mouth: 'line', swell: 1.4}), seed: 2})} />
    </Cam>
  );
};
import {Lantern} from '../rig';

export const s32_tobacco = ({lf, sh, dur}: SP) => {
  const f = lf;
  const END = le(sh, 0);
  const FREEZE = END + 10;
  const frozen = lf >= FREEZE;
  const ff = Math.min(lf, FREEZE);
  const boys = [0, 1, 2].map((i) => ({x: 560 + i * 300, seed: i}));
  const cough = (i: number) => Math.max(0, Math.sin(ff * 0.3 + i * 2));
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={ff} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 560], f1: [960, 550]}, {at: 120, z0: 1.8, z1: 1.9, f0: [860, 460], f1: [860, 455]}]} dur={dur}>
          <g>
            <rect x={-400} y={-300} width={2800} height={1500} fill="#4A3424" />
            <g filter="url(#paint)">
              {Array.from({length: 12}, (_, i) => <rect key={i} x={-300 + i * 220} y={-200} width={220} height={1105} fill={i % 2 ? '#5E4630' : '#56402C'} stroke={INK} strokeWidth={4} />)}
              <rect x={200} y={200} width={500} height={340} fill="#2A3A2E" stroke={INK} strokeWidth={10} />
              <text x={450} y={340} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={46} fill="#E8E2D2">Fumus contra pestem</text>
              <rect x={-400} y={FLOOR} width={2800} height={300} fill="#2E2016" />
            </g>
          </g>
          {boys.map((b) => (
            <g key={b.seed}>
              <Actor L={{...BOY, vest: ['#2D3B52', '#3E4A3A', '#5A2E2A'][b.seed], hairColor: ['#C99A5A', '#3A2A20', '#6B4528'][b.seed]}} x={b.x} y={Y(0.9)} s={0.9}
                p={mkPose(ff, {hF: [110, -214], hB: [40, -10 + cough(b.seed) * -20], lean: cough(b.seed) * 14, head: {turn: 0.6, eyes: cough(b.seed) > 0.6 ? 'squeeze' : 'dot', mouth: cough(b.seed) > 0.6 ? 'O' : 'line', open: cough(b.seed), browInner: 0.9, tilt: cough(b.seed) * 8}, seed: b.seed + 50})}
                propF={<g transform="rotate(-10)"><Pipe /></g>} gripF />
              <Smoke f={ff + b.seed * 20} x={b.x + 110} y={Y(0.9) - 230} amt={0.8} />
            </g>
          ))}
          <Actor L={{...PHYSICIAN, cap: undefined, gown: '#1F1A18', beard: undefined, moustache: '#5A5048'}} x={1480} y={Y(1.15)} s={1.15} flip p={mkPose(ff, {hF: [110, -150 + Math.sin(ff * 0.3) * 30], hB: [60, -40], lean: 6, head: {turn: 0.7, eyes: 'sly', browInner: -0.8, mouth: 'frown', lookX: 0.8}, seed: 13})} propF={<g transform="rotate(-40)"><Birch /></g>} gripF />
        </Cam>
      </g>
      {lf < 120 && <Tag x={1500} y={150} t={lf - 30} text="Eton, 1665" sub="according to a later account" size={46} />}
      {frozen && <FreezeLabel t={lf - FREEZE} title="DOCTOR'S ORDERS." sub="Smoke. Or else." x={140} y={140} />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.6, 0])} />}
    </g>
  );
};
