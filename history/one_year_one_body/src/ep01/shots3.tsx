// Ep 1 shots, chapters 6–8 (barber-surgeon, what really happened, ending)
import React from 'react';
import {Puppet, TOM, BARBER, SEARCHER, Pliers, Pelican, Cup, ToothProp, Dentures, Bread, Head, restHead, Lantern} from '../rig';
import {walk, flinch, spring, ease, clamp01, lerp, lerp2, knead, collapse, sitLegs, gesture} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, le, speech, FreezeLabel, Tag, BigWord, Stamp, Throb, INK, FLOOR, EOut, EBack, Cut, SIT} from './kit';
import {Bakery, Street, Shopfront, Parchment, DarkTable, Hall, MapLondon, flickOf} from './sets';
import {Interior, Chair, Tooth} from '../BarberScene';
import {tomH} from './shots1';

const Y = (s: number) => FLOOR - 176 * s;
const BX = 1262;

// barber shop stage: Tom in the chair, barber standing. Everything driven by opts.
type Stage = {f: number; tom: any; barber: any; bx?: number; tomProp?: React.ReactNode; tomGripF?: boolean; barberProp?: React.ReactNode; barberPropAng?: number; barberGrip?: boolean; tomSeated?: boolean; tomX?: number; tomPoseB?: any; barberPoseB?: any; barberPropB?: React.ReactNode};
const Shop: React.FC<Stage> = ({f, tom, barber, bx = BX, tomProp, tomGripF, barberProp, barberPropAng, barberGrip, tomSeated = true, tomX = 700, barberPropB}) => {
  const flick = flickOf(f);
  return (
    <g>
      <Interior f={f} flick={flick} />
      <Chair x={700} y={700} part="back" />
      <ellipse cx={810} cy={FLOOR + 2} rx={140} ry={16} fill="#0E0805" opacity={0.4} />
      <g transform={`translate(${tomX} ${tomSeated ? 700 : Y(1.15)}) scale(1.15)`} filter="url(#soft)">
        <Puppet L={TOM} p={tom} propF={tomProp} gripF={tomGripF} gripB />
      </g>
      <Chair x={700} y={700} part="front" />
      <ellipse cx={bx} cy={FLOOR + 2} rx={110} ry={14} fill="#0E0805" opacity={0.45} />
      <g transform={`translate(${bx} 690) scale(-1.25 1.25)`} filter="url(#soft)">
        <Puppet L={BARBER} p={barber} propF={barberProp} propAngF={barberPropAng} gripF={barberGrip} propB={barberPropB} gripB={!!barberPropB} />
      </g>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#FFB866" opacity={0.05 + flick * 0.015} />
    </g>
  );
};
const seatedTom = (f: number, o: any = {}) => mkPose(f, {...SIT, hF: [74, -196], hB: [56, -28], lean: -3, ...o, head: tomH({swell: 1.45, ...(o.head ?? {})}), seed: 2});
const barberPose = (f: number, sp: any, o: any = {}) => mkPose(f, {hF: [60, -64], hB: [30, 40], lean: 4, ...o, head: {turn: 0.7, eyes: sp.talking ? 'dot' : 'sly', mouth: sp.talking ? sp.mouth : 'smile', open: sp.open, lookX: 0.3, browInner: -0.3, browHeight: 0.2, ...(o.head ?? {})}, seed: 8});

// ---------------- CH6 ----------------
export const s33_shopfront = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const st = walk(f / 30, lf < 140 ? 1 : 0);
  const tx = iv(lf, [0, 140], [-200, 1100], EOut);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.05, f0: [960, 540], f1: [960, 530]}, {at: 120, z0: 2.3, z1: 2.5, f0: [730, 560], f1: [730, 550]}]} dur={dur}>
        <Shopfront f={f} />
        <Actor L={TOM} x={tx} y={Y(1.1)} s={1.1} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean, hF: [74, -196], hB: [40 - st.swing * 30, 4], head: tomH({swell: 1.45, lookX: -0.3, lookY: -0.4, turn: 0.4}), seed: 2})} />
      </Cam>
      {lf > L2 - 10 && <Tag x={1450} y={880} t={lf - L2 + 10} text="Advertising, 1665" size={54} />}
    </g>
  );
};

export const s34_greet = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const bs = speech(sh, 'BARBER', gf);
  const SITAT = 70;
  const c = collapse(lf - SITAT);
  const seated = lf >= SITAT;
  const walkIn = iv(lf, [0, SITAT], [0, 1]);
  const st = walk(f / 22, lf < SITAT - 10 ? 1 : 0);
  const tomP = seated
    ? mkPose(f, {legF: sitLegs(c.sit).legF, legB: sitLegs(c.sit).legB, bob: c.drop, squash: c.squash, hF: [74, -196], hB: [56, -28], lean: -3, head: tomH({swell: 1.45, eyes: lf < SITAT + 12 ? 'squeeze' : 'dot', lookX: 0.9, lookY: lf > L2 + 30 ? 0.6 : 0, browInner: 1}), seed: 2})
    : mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean, hF: [74, -196], hB: [40, 4], head: tomH({swell: 1.45, lookX: 0.9}), seed: 2});
  const tomX = seated ? 700 : lerp(200, 700, walkIn);
  const tomY = seated ? lerp(Y(1.15), 700, ease(c.sit)) : Y(1.15);
  const g = gesture(f, bs.amp);
  const cuts: Cut[] = [{at: 0, z0: 1.0, z1: 1.04, f0: [960, 560], f1: [960, 556]}, {at: L2, z0: 1.9, z1: 2.0, f0: [1600, 520], f1: [1560, 500]}, {at: L2 + 100, z0: 2.4, z1: 2.5, f0: [360, 380], f1: [400, 370]}];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <Interior f={f} flick={flickOf(f)} />
      <Chair x={700} y={700} part="back" />
      <g transform={`translate(${tomX} ${tomY}) scale(1.15)`} filter="url(#soft)"><Puppet L={TOM} p={tomP} gripB /></g>
      <Chair x={700} y={700} part="front" />
      <g transform={`translate(${BX} 690) scale(-1.25 1.25)`} filter="url(#soft)">
        <Puppet L={BARBER} p={barberPose(f, bs, {hF: bs.talking ? [100 + g[0], -150 + g[1]] : [60, -64], head: {lookX: 0.6}})} poseF={bs.talking ? 'open' : undefined} />
      </g>
    </Cam>
  );
};

export const s35_tools = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [900, 540], f1: [960, 540]}, {at: 120, z0: 1.6, z1: 1.7, f0: [1250, 560], f1: [1260, 550]}, {at: L2, z0: 1.3, z1: 1.4, f0: [960, 560], f1: [960, 550]}]} dur={dur}>
        <DarkTable f={f} />
        <rect x={300} y={360} width={1320} height={460} rx={20} fill="#6B4A31" stroke={INK} strokeWidth={8} />
        <rect x={340} y={400} width={1240} height={380} rx={14} fill="#8C2A24" stroke={INK} strokeWidth={5} opacity={0.9} />
        <g transform={`translate(560 600) rotate(-12) scale(2.2)`}><Pliers glint={iv(lf, [30, 36, 46], [0, 1.2, 0])} /></g>
        <g transform={`translate(1150 580) rotate(8) scale(2.2)`}><Pelican /></g>
        {lf >= L2 && <g transform={`translate(1450 760) scale(2.4)`}><Cup /></g>}
      </Cam>
      {lf > 20 && lf < 120 && <Tag x={560} y={260} t={lf - 20} text="forceps" size={50} />}
      {lf > 120 && lf < L2 && <Tag x={1260} y={250} t={lf - 120} text="the pelican" sub="named for the bird's beak" size={50} />}
      {lf > 170 && lf < L2 && <Stamp x={700} y={860} t={lf - 180} text="NO ANAESTHETIC" size={70} rot={-4} />}
    </g>
  );
};

export const s35b_company = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const T = ls(sh, 1) - 6;
  const ts = speech(sh, 'TOM', gf);
  if (lf < T) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [960, 560]}, {at: 150, z0: 1.7, z1: 1.8, f0: [1150, 680], f1: [1180, 680]}]} dur={dur}>
          <Hall f={f} />
        </Cam>
        <Tag x={460} y={140} t={lf - 10} text="Barber-Surgeons' Hall" sub="the company's anatomy lessons" size={46} />
      </g>
    );
  }
  return (
    <Cam lf={lf} cuts={[{at: T, z0: 2.6, z1: 2.75, f0: [790, 440], f1: [790, 436]}]} dur={dur}>
      <Shop f={f} tom={seatedTom(f, {head: {eyes: 'half', mouth: ts.talking ? ts.mouth : 'line', open: ts.open, lookX: 1, browInner: 0.4, turn: 0.2}})} barber={barberPose(f, {talking: false, mouth: 'line', open: 0})} />
    </Cam>
  );
};

export const s36_drink = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const bs = speech(sh, 'BARBER', gf), ts = speech(sh, 'TOM', gf);
  const take = ease(iv(lf, [40, 52], [0, 1]));
  const gulp = iv(lf, [52, 90], [0, 1]);
  const cough = lf > 92 && lf < 130 ? flinch(lf - 92) : flinch(-1);
  const tilt = gulp > 0 && gulp < 1 ? -18 : 0;
  const cuts: Cut[] = [{at: 0, z0: 1.4, z1: 1.45, f0: [1000, 520], f1: [1000, 515]}, {at: 52, z0: 2.5, z1: 2.6, f0: [790, 440], f1: [790, 436]}, {at: ls(sh, 2) - 4, z0: 2.4, z1: 2.5, f0: [1210, 400], f1: [1210, 396]}];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} shake={cough.shake}>
      <Shop f={f}
        tom={seatedTom(f, {hF: lf < 52 ? lerp2([74, -196], [140, -100], take) : gulp < 1 ? [100, -230] : [74, -196], lean: cough.lean - 3, head: {tilt: tilt + cough.tilt, eyes: gulp > 0 && gulp < 1 ? 'squeeze' : ts.talking ? 'half' : lf > 90 ? 'squeeze' : 'dot', mouth: ts.talking ? ts.mouth : lf > 92 ? 'zigzag' : 'line', open: ts.open, browInner: 1, gulp: gulp > 0.3 && gulp < 0.9 ? (gulp - 0.3) / 0.6 : 0}})}
        tomProp={lf >= 48 && gulp < 1 ? <g transform="rotate(-60) scale(0.9)"><Cup fill={1 - gulp} /></g> : undefined} tomGripF
        barber={barberPose(f, bs, {hF: lf < 50 ? [150, -120] : [60, -64], head: {lookX: 0.6, eyes: ts.talking ? 'sly' : undefined, mouth: bs.talking ? bs.mouth : 'smile'}})}
        barberProp={lf < 48 ? <g transform="rotate(-80)"><Cup /></g> : undefined} barberGrip={lf < 48} />
    </Cam>
  );
};

export const s37_openwide = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const bs = speech(sh, 'BARBER', gf);
  const RAISE = ls(sh, 1) - 6;
  const antic = iv(f, [RAISE - 8, RAISE], [0, 1]) * (f < RAISE ? 1 : 0);
  const raise = spring(f, RAISE, 0.3, 0.14);
  const FEAR = ls(sh, 2) - 2;
  const fearT = spring(f, FEAR, 0.35, 0.12);
  const fearOn = f >= FEAR;
  const upT = Math.min(1.15, raise);
  const hF: [number, number] = [60 + 44 * upT - antic * 8, -64 - 108 * upT + antic * 30];
  const glint = iv(f, [RAISE + 14, RAISE + 20, RAISE + 30], [0, 1.2, 0]);
  const cuts: Cut[] = [{at: 0, z0: 2.1, z1: 2.2, f0: [1000, 470], f1: [1000, 466]}, {at: RAISE - 10, z0: 2.3, z1: 2.5, f0: [1225, 400], f1: [1230, 390]}, {at: FEAR - 2, z0: 3.3, z1: 3.5, f0: [735, 430], f1: [732, 426]}];
  const dutch = lf >= RAISE - 10 && lf < FEAR - 2 ? -5 : 0;
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} rot={dutch} shake={fearOn ? Math.exp(-(f - FEAR) / 10) * 9 : 0}>
      <Shop f={f}
        tom={seatedTom(f, {lean: -3 - (fearOn ? 9 * Math.min(1, fearT) : 0), head: {eyes: fearOn ? 'fear' : 'dot', eyePop: fearOn ? Math.max(0, 1 - fearT) * 2 + 0.15 : 0, browInner: 1, browHeight: fearOn ? 1.2 : 0.1, mouth: fearOn ? 'fear' : lf < RAISE ? 'O' : 'zigzag', open: fearOn ? 0.55 : 0.7, lookX: fearOn ? 0.9 : 0.5, tilt: fearOn ? -6 : 5, sweat: iv(f, [FEAR + 10, dur], [0, 1]) - (f < FEAR + 10 ? 2 : 0)}})}
        barber={barberPose(f, bs, {hF, lean: 4 + raise * 3 - antic * 4, head: {lookY: 0, browInner: f > RAISE + 20 && f < FEAR ? 0.6 : -0.3, browHeight: f > RAISE + 20 && f < FEAR ? 0.9 : 0.2, mouth: bs.talking ? bs.mouth : f > FEAR + 6 ? 'grin' : 'smile', eyes: bs.talking ? 'dot' : 'sly'}})}
        barberProp={<Pliers glint={glint} />} barberPropAng={-10 - 30 * Math.min(1, upT)} barberGrip />
    </Cam>
  );
};

export const s38_regret = ({lf, dur}: SP) => {
  // freeze-frame on the fear face: reframed wide, desaturated
  const f = 0;
  return (
    <g>
      <g filter="url(#freeze)">
        <Cam lf={lf} cuts={[{at: 0, z0: 2.4, z1: 2.4, f0: [820, 440], f1: [820, 440]}]} dur={dur}>
          <Shop f={300} tom={seatedTom(f, {lean: -12, head: {eyes: 'fear', eyePop: 0.15, browInner: 1, browHeight: 1.2, mouth: 'fear', open: 0.55, lookX: 0.9, tilt: -6, sweat: 0.4}})}
            barber={barberPose(f, {talking: false}, {hF: [104, -172], head: {mouth: 'grin', eyes: 'sly'}})} barberProp={<Pliers />} barberPropAng={-40} barberGrip />
        </Cam>
      </g>
      <FreezeLabel t={lf} title="TOM, 15." sub="Reconsidering everything." x={1080} y={760} />
      <rect width={1920} height={1080} fill="#fff" opacity={iv(lf, [0, 4], [0.7, 0])} />
    </g>
  );
};

export const s39_pull = ({lf, sh, dur}: SP) => {
  const f = lf;
  const ONE = 70, TWO = ls(sh, 1);
  const rock = (t0: number) => (f > t0 ? Math.exp(-(f - t0) / 8) * Math.sin((f - t0) * 0.7) : 0);
  const r = rock(ONE) + rock(TWO) * 1.3;
  const brace = ease(iv(f, [10, 40], [0, 1]));
  // over-the-shoulder: big blurred barber shoulder in the foreground (backlog: OTS shot)
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 2.3, z1: 2.5, f0: [790, 450], f1: [790, 444]}]} dur={dur} shake={Math.abs(r) * 6}>
        <Shop f={f} bx={3200}
          tom={seatedTom(f, {lean: -12 + r * 6, legF: [1.42, 1.42], hF: [96, -26], head: {eyes: 'squeeze', mouth: 'fear', open: 0.7, tilt: r * 12, browInner: 1, swell: 1.45, sweat: (f % 50) / 50}})}
          barber={barberPose(f, {talking: false})} />
        <g transform={`translate(${745 + brace * 0} ${470 + r * 6}) rotate(${172 + r * 14}) scale(1.4)`}><Pliers /></g>
      </Cam>
      <g filter="url(#blurFg)">
        <ellipse cx={1760} cy={1060} rx={460} ry={380} fill="#2F4A3E" />
        <path d={`M1500 900 Q1300 ${720 + r * 20} 1080 ${650 + r * 30}`} stroke="#E9E1D0" strokeWidth={130} strokeLinecap="round" fill="none" />
        <ellipse cx={1640} cy={560} rx={210} ry={260} fill="#C9C2B6" />
        <ellipse cx={1600} cy={600} rx={175} ry={225} fill="#F0E2CC" />
      </g>
      {f > ONE && f < ONE + 20 && <BigWord x={500} y={240} t={f - ONE} text="ONCE." size={110} color="#F3E7CF" />}
      {f > TWO && f < TWO + 24 && <BigWord x={520} y={240} t={f - TWO} text="TWICE." size={120} color="#E5503A" />}
    </g>
  );
};

export const s40_pop = ({lf, sh, dur}: SP) => {
  const f = lf;
  const POP = 12;
  const t = f - POP;
  const fly = clamp01(t / 70);
  const slow = t < 70;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.3, z1: 1.38, f0: [900, 520], f1: [900, 515]}, {at: 82, z0: 2.6, z1: 2.7, f0: [790, 440], f1: [790, 436]}]} dur={dur} shake={t > 0 && t < 12 ? 14 * (1 - t / 12) : 0}>
        <Shop f={f} bx={BX - 120}
          tom={seatedTom(f, {lean: t > 0 ? -16 : -10, head: {eyes: t < 0 ? 'squeeze' : t < 82 ? 'fear' : 'dizzy', eyePop: t > 0 && t < 20 ? 1.5 : 0.1, mouth: t < 82 ? 'fear' : 'gap', open: 0.8, swell: t > 0 ? 1.0 : 1.45, browHeight: 1.1, browInner: 0.6}})}
          barber={barberPose(f, {talking: false}, {hF: t > 0 ? [140, -260] : [190, -170], lean: t > 0 ? -6 : 18, head: {eyes: t > 0 ? 'fear' : 'squeeze', mouth: 'O', open: 0.5, browHeight: 1}})}
          barberProp={<Pliers />} barberPropAng={t > 0 ? -60 : 180} barberGrip />
        {t > 0 && t < 82 && (
          <g transform={`translate(${lerp(840, 1500, fly)} ${lerp(420, 160, fly) + 300 * (fly - 0.5) * (fly - 0.5) - 75}) rotate(${t * (slow ? 6 : 14)}) scale(2.2)`}>
            <ToothProp />
            {[0, 1, 2, 3].map((i) => <path key={i} transform={`rotate(${i * 90 + t * 3}) translate(36 0)`} d="M0 -8 L3 -3 L8 0 L3 3 L0 8 L-3 3 L-8 0 L-3 -3 Z" fill="#FFF8DC" />)}
          </g>
        )}
      </Cam>
      {t >= 0 && t < 6 && <rect width={1920} height={1080} fill="#fff" opacity={1 - t / 6} />}
      {t > 2 && t < 40 && <BigWord x={1300} y={800} t={t - 2} text="POP!" size={180} color="#FFE45A" />}
    </g>
  );
};

export const s41_trophy = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const bs = speech(sh, 'BARBER', gf);
  const lift = spring(f, 4, 0.3, 0.14);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 2.0, z1: 2.1, f0: [1205, 430], f1: [1205, 425]}, {at: L2, z0: 2.5, z1: 2.65, f0: [780, 440], f1: [780, 436]}, {at: L2 + 80, z0: 1.15, z1: 1.2, f0: [960, 560], f1: [940, 560]}]} dur={dur}>
        <Shop f={f}
          tom={seatedTom(f, {hF: [74, -196], head: {eyes: f > L2 + 40 ? 'happy' : 'dizzy', mouth: 'gap', open: 0.4, swell: 0.5, browInner: 0.3, tilt: Math.sin(f * 0.07) * 8}})}
          barber={barberPose(f, bs, {hF: [60 + 50 * Math.min(1.1, lift), -64 - 130 * Math.min(1.1, lift)], head: {lookX: 0.2, lookY: -0.7, eyes: bs.talking ? 'happy' : 'sly', mouth: bs.talking ? bs.mouth : 'grin'}})}
          barberProp={<g><Pliers glint={iv(f, [10, 16, 26], [0, 1, 0])} /><g transform="translate(124 0) rotate(90)"><ToothProp s={1.1} /></g></g>} barberPropAng={-70} barberGrip />
        {/* the new tooth on the string in the window */}
        {f > L2 + 80 && <g transform={`translate(${520} ${270}) rotate(${Math.sin(f * 0.1) * 12})`}><Tooth x={0} y={0} r={0} /><circle cx={0} cy={0} r={30} fill="#FFF8DC" opacity={iv(f - L2 - 80, [0, 10, 30], [0, 0.6, 0])} /></g>}
      </Cam>
      {f > L2 + 120 && <Tag x={1450} y={900} t={f - L2 - 120} text="~3 seconds" size={56} />}
    </g>
  );
};

// ---------------- CH7 ----------------
const Counter: React.FC<{x: number; y: number; t: number; to: number; dur?: number; size?: number; color?: string; prefix?: string}> = ({x, y, t, to, dur = 50, size = 130, color = INK, prefix = ''}) => {
  const v = Math.round(to * ease(clamp01(t / dur)));
  return t < 0 ? null : <text x={x} y={y} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={size} fill={color}>{prefix}{v.toLocaleString('en-US')}</text>;
};

export const s42_generalbill = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 0.95, z1: 1.02, f0: [960, 540], f1: [960, 540]}, {at: L2, z0: 1.25, z1: 1.32, f0: [960, 500], f1: [960, 490]}]} dur={dur}>
        <DarkTable f={f} />
        <Parchment x={360} y={40} w={1200} h={1000} />
        <text x={960} y={150} textAnchor="middle" fontFamily="FellSC" fontSize={50} fill={INK}>A General Bill for this present Year</text>
        <text x={960} y={210} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill="#5A4030">ending the 19th of December, 1665</text>
        <path d="M480 240 H1440" stroke={INK} strokeWidth={3} />
        <text x={960} y={400} textAnchor="middle" fontFamily="FellSC" fontSize={70} fill="#7E2119" opacity={iv(lf, [L2 - 10, L2 + 4], [0, 1])}>Plague</text>
        <Counter x={960} y={560} t={lf - L2 - 10} to={68596} dur={60} size={150} />
        {lf > L2 + 150 && <Stamp x={1180} y={800} t={lf - L2 - 160} text="REAL TOLL ~100,000?" size={64} rot={-6} />}
      </Cam>
      {lf < L2 && <Tag x={1550} y={930} t={lf - 30} text="Total burials: 97,306" sub="the whole year, all causes" size={42} />}
    </g>
  );
};

export const s43_teethcount = ({lf, dur}: SP) => {
  const f = lf;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.3, z1: 1.45, f0: [960, 560], f1: [960, 560]}]} dur={dur}>
        <DarkTable f={f} />
        <Parchment x={360} y={40} w={1200} h={1000} />
        <text x={960} y={460} textAnchor="middle" fontFamily="FellSC" fontSize={90} fill="#7E2119" opacity={iv(lf, [30, 40], [0, 1])}>Teeth</text>
        <Counter x={960} y={640} t={lf - 70} to={2614} dur={40} size={160} />
      </Cam>
      {lf > 120 && <Tag x={1500} y={930} t={lf - 120} text="General Bill, 1665" size={42} />}
    </g>
  );
};

export const s44_babies = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  if (lf < L2) {
    const rock = Math.sin(f * 0.12) * 6;
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [960, 540]}]} dur={dur}>
          <DarkTable f={f} />
          <g transform={`translate(960 640) rotate(${rock})`} filter="url(#paint)">
            <path d="M-260 -60 Q0 40 260 -60 L230 120 Q0 180 -230 120 Z" fill="#7A5638" stroke={INK} strokeWidth={8} />
            <path d="M-300 160 Q0 260 300 160" stroke="#5A3D27" strokeWidth={22} fill="none" />
            <path d="M-200 -50 Q0 20 200 -50 L180 0 Q0 60 -180 0 Z" fill="#EDE6D6" stroke={INK} strokeWidth={5} />
          </g>
        </Cam>
        <Tag x={480} y={160} t={lf - 20} text="'Teeth'" sub="often babies who died while teething" size={52} />
      </g>
    );
  }
  // searcher walking at night with her white wand; coins
  const t = lf - L2;
  const st = walk(f / 32);
  const x = iv(t, [0, dur - L2], [400, 1500]);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: L2, z0: 1.15, z1: 1.2, f0: [800, 560], f1: [1100, 560]}]} dur={dur}>
        <Street f={f} mode="night" crosses={{3: 1, 5: 1}} lamps={[900, 2000]} />
        <rect x={-600} y={-300} width={4200} height={1500} fill="#0C1424" opacity={0.25} />
        <Actor L={SEARCHER} x={x} y={Y(1.05)} s={1.05} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: 8, hF: [100, -40], hB: [60, -120], head: {turn: 0.6, eyes: 'half', mouth: 'frown', browInner: 0.4}, seed: 14})}
          propF={<g transform="rotate(-80)"><rect x={-4} y={-4} width={260} height={8} fill="#F4F0E6" stroke={INK} strokeWidth={3} /></g>} gripF propB={<g transform="translate(0 30)"><Lantern /></g>} gripB />
        {t > 120 && Array.from({length: 3}, (_, i) => {
          const tt = t - 130 - i * 14;
          return tt > 0 ? <g key={i} transform={`translate(${x + 120 + i * 30} ${lerp(300, 820, ease(clamp01(tt / 16)))})`}><ellipse rx={18} ry={18} fill="#C9C2B6" stroke={INK} strokeWidth={4} /><text y={7} textAnchor="middle" fontFamily="FellSC" fontSize={18} fill={INK}>d</text></g> : null;
        })}
      </Cam>
      <Tag x={1500} y={150} t={t - 20} text="The searchers" sub="paid per body · no medical training" size={46} />
    </g>
  );
};

export const s45_infection = ({lf, dur}: SP) => {
  const f = lf;
  const spread = iv(lf, [20, dur - 30], [0, 1]);
  const pulse = 0.7 + 0.3 * Math.sin(f * 0.3);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [960, 540], f1: [960, 560]}]} dur={dur}>
        <rect x={-400} y={-300} width={2800} height={1700} fill="#1E1418" />
        <g transform="translate(960 470) scale(3.2)" opacity={0.95}>
          <Head h={restHead({turn: 0.6, swell: 1.4, eyes: 'squeeze', mouth: 'zigzag', browInner: 1})} L={{...TOM, skin: '#E8DCC8', band: undefined}} frame={f} />
        </g>
        {/* red spreading veins: tooth -> jaw -> neck -> blood */}
        <g stroke="#E5503A" strokeWidth={10} fill="none" strokeLinecap="round" opacity={pulse}>
          <path d="M1170 570 Q1180 680 1100 760" strokeDasharray="400" strokeDashoffset={400 * (1 - clamp01(spread * 3))} />
          <path d="M1100 760 Q1000 860 1020 1000" strokeDasharray="400" strokeDashoffset={400 * (1 - clamp01(spread * 3 - 1))} />
          <path d="M1020 1000 Q900 1060 760 1080 M1020 1000 Q1140 1060 1260 1080" strokeDasharray="500" strokeDashoffset={500 * (1 - clamp01(spread * 3 - 2))} />
        </g>
        <circle cx={1170} cy={560} r={90} fill="#E5503A" opacity={0.25 * pulse} filter="url(#glowS)" />
      </Cam>
      {['tooth', 'jaw', 'blood'].map((w, i) => spread * 3 > i + 0.3 && <Tag key={w} x={1560} y={300 + i * 180} t={(spread * 3 - i - 0.3) * 40} text={w} size={56} color="#7E2119" />)}
      <Tag x={420} y={900} t={lf - 160} text="no antibiotics" sub="until the 20th century" size={46} />
    </g>
  );
};

export const s46_verdict = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const tip = lf < L2 ? Math.sin(f * 0.08) * 6 : -16 * ease(iv(lf, [L2, L2 + 30], [0, 1])) + Math.sin(f * 0.1) * 1.5;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 530]}, {at: L2, z0: 1.2, z1: 1.28, f0: [960, 540], f1: [940, 540]}]} dur={dur}>
        <DarkTable f={f} />
        <g transform="translate(960 300)">
          <rect x={-14} y={0} width={28} height={600} fill="#8C6B3A" stroke={INK} strokeWidth={6} />
          <ellipse cx={0} cy={610} rx={180} ry={30} fill="#6B4A2F" stroke={INK} strokeWidth={6} />
          <g transform={`rotate(${tip})`}>
            <rect x={-420} y={-12} width={840} height={24} rx={10} fill="#C9A35A" stroke={INK} strokeWidth={6} />
            {[-1, 1].map((s) => (
              <g key={s} transform={`translate(${s * 400} 0) rotate(${-tip})`}>
                <path d="M0 0 L-110 200 M0 0 L110 200" stroke={INK} strokeWidth={4} />
                <path d="M-140 200 Q0 270 140 200 Z" fill="#C9A35A" stroke={INK} strokeWidth={6} />
                {s < 0 ? <g transform="translate(-10 160) rotate(-10) scale(1.1)"><Pliers /></g> : <g transform="translate(0 170)"><text textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={36} fill="#F3E7CF" y={-20}>cloves · root · smoke</text></g>}
              </g>
            ))}
          </g>
        </g>
      </Cam>
      {lf < L2 && <Tag x={460} y={150} t={lf - 30} text="Risks" sub="broken jaw · infection" size={48} />}
      {lf >= L2 && <Stamp x={1450} y={880} t={lf - L2 - 40} text="IT WORKED" rot={-8} />}
    </g>
  );
};

export const s46b_gap = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const RICH = L2 + 110;
  if (lf < L2) {
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 3.0, z1: 3.2, f0: [800, 440], f1: [800, 436]}]} dur={dur}>
        <Bakery f={f + 4000} />
        <rect x={-400} y={-300} width={3200} height={1500} fill="#2B1D14" opacity={0.15} />
        <g transform={`translate(800 ${Y(1.1)}) scale(1.1)`} filter="url(#soft)">
          <Puppet L={TOM} p={mkPose(f, {hF: [-10, 6], hB: [40, 2], head: tomH({swell: 0.3, mouth: 'gap', open: 0.4, eyes: 'dot', browInner: 0.2, lookX: 0.2})})} />
        </g>
      </Cam>
    );
  }
  const chatter = Math.abs(Math.sin(f * 0.5));
  if (lf < RICH) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: L2, z0: 1.0, z1: 1.1, f0: [960, 560], f1: [960, 540]}]} dur={dur}>
          <DarkTable f={f} />
          <rect x={560} y={680} width={800} height={60} rx={12} fill="#5A2E22" stroke={INK} strokeWidth={6} />
          <g transform={`translate(960 ${560 - chatter * 10}) scale(3)`}><Dentures open={chatter} /></g>
        </Cam>
        <Tag x={960} y={150} t={lf - L2 - 10} text="Ivory or bone dentures" sub="for those who could pay" size={50} />
      </g>
    );
  }
  // deadpan reaction
  return (
    <g>
      <Cam lf={lf} cuts={[{at: RICH, z0: 2.9, z1: 3.0, f0: [800, 440], f1: [800, 438]}]} dur={dur}>
        <Bakery f={f + 4000} />
        <g transform={`translate(800 ${Y(1.1)}) scale(1.1)`} filter="url(#soft)">
          <Puppet L={TOM} p={mkPose(f, {hF: [-10, 6], hB: [40, 2], still: true, head: tomH({swell: 0.3, mouth: 'line', eyes: 'half', browInner: 0, lookX: 1, turn: 0.2})})} />
        </g>
      </Cam>
      <Stamp x={1400} y={300} t={lf - RICH - 30} text="NOT RICH" rot={10} />
    </g>
  );
};

// ---------------- CH8 ----------------
export const s47_recover = ({lf, dur}: SP) => {
  const f = lf;
  const kn = knead(f, 0.2);
  const chew = Math.max(0, Math.sin(f * 0.4));
  const snow = Array.from({length: 40}, (_, i) => [1300 + ((i * 53 + f * (1 + (i % 3) * 0.4)) % 300), 170 + ((i * 97 + f * (2 + (i % 4))) % 300)]);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [900, 540], f1: [940, 540]}, {at: 130, z0: 1.7, z1: 1.8, f0: [800, 500], f1: [800, 496]}]} dur={dur}>
        <Bakery f={f + 4300} snow />
        {snow.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="#fff" opacity={0.85} />)}
        <Actor L={{...TOM, band: undefined}} x={760} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: kn.hF, hB: kn.hB, bob: kn.bob, lean: kn.lean, head: {turn: 0.6, eyes: 'happy', mouth: chew > 0.4 ? 'O' : 'smile', open: chew * 0.3, browInner: -0.1, lookX: 0.5, lookY: 0.6}, seed: 2})} gripF gripB />
      </Cam>
      <Tag x={1480} y={880} t={lf - 20} text="Winter, 1665" sub="the plague begins to fade" size={50} />
    </g>
  );
};

export const s48_fire = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  if (lf < L2) {
    const glow = iv(lf, [0, L2], [0.6, 1.4]);
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 1.4, z1: 1.6, f0: [500, 560], f1: [380, 600]}]} dur={dur}>
        <g filter="url(#night)"><Bakery f={f + 4600} /></g>
        <circle cx={120} cy={700} r={700} fill="url(#ovenGlow)" opacity={glow} />
        <g transform={`translate(600 ${Y(1.1)}) scale(-1.1 1.1)`} filter="url(#soft)">
          <Puppet L={{...TOM, band: undefined}} p={mkPose(f, {hF: [-10, 6], hB: [40, 2], head: {turn: 0.6, eyes: 'dot', mouth: 'line', browInner: 0.6, lookX: 0.8}, seed: 2})} />
        </g>
        {Array.from({length: 14}, (_, i) => {
          const ph = ((f * 1.5 + i * 37) % 200) / 200;
          return <circle key={i} cx={120 + Math.sin(i * 3 + f * 0.05) * 80 + ph * 200} cy={640 - ph * 500} r={4} fill="#FFB24A" opacity={1 - ph} />;
        })}
      </Cam>
    );
  }
  const t = lf - L2;
  const glow = iv(t, [40, 140], [0, 1]);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: L2, z0: 1.4, z1: 1.9, f0: [1100, 560], f1: [1200, 620]}]} dur={dur}>
        <MapLondon f={f} labels={0.6} />
        <circle cx={1210} cy={620} r={60 + glow * 200} fill="#FF7A2A" opacity={0.4 * glow} filter="url(#glowS)" />
        <circle cx={1210} cy={620} r={16} fill="#FFD27A" stroke={INK} strokeWidth={4} opacity={glow > 0 ? 1 : 0} />
      </Cam>
      <Tag x={1450} y={250} t={t - 60} text="Pudding Lane" sub="2 September 1666" size={56} />
    </g>
  );
};

export const s49_question = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const ts = speech(sh, 'TOM', gf);
  const L2 = ls(sh, 1), T = ls(sh, 2) - 6;
  const cards = ['Clove oil', 'Henbane smoke', "Barber's pliers"];
  if (lf < T) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.05, f0: [960, 540], f1: [960, 530]}]} dur={dur}>
          <DarkTable f={f} />
          {cards.map((c, i) => {
            const a = iv(lf - 10 - i * 28, [0, 12], [0, 1], EBack);
            const hl = lf > L2 ? 1 : 0;
            return (
              <g key={c} transform={`translate(${420 + i * 540} ${520 + Math.sin(f * 0.06 + i) * 8}) scale(${a}) rotate(${(i - 1) * 4})`}>
                <rect x={-230} y={-160} width={460} height={320} fill="#EFE3C6" stroke={INK} strokeWidth={7} />
                <rect x={-230} y={-160} width={460} height={320} filter="url(#brush)" fill="#EFE3C6" />
                <text x={0} y={-60} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={90} fill="#7E2119">{['A', 'B', 'C'][i]}</text>
                <text x={0} y={70} textAnchor="middle" fontFamily="FellSC" fontSize={50} fill={INK}>{c}</text>
                {hl > 0 && <rect x={-230} y={-160} width={460} height={320} fill="none" stroke="#E5503A" strokeWidth={8} opacity={0.5 + 0.5 * Math.sin(f * 0.2 + i)} />}
              </g>
            );
          })}
        </Cam>
        {lf > L2 && <BigWord x={960} y={900} t={lf - L2} text="Would you have survived?" size={86} color="#F3E7CF" />}
      </g>
    );
  }
  return (
    <Cam lf={lf} cuts={[{at: T, z0: 2.7, z1: 2.85, f0: [800, 440], f1: [800, 436]}]} dur={dur}>
      <Bakery f={f + 5000} />
      <g transform={`translate(800 ${Y(1.1)}) scale(1.1)`} filter="url(#soft)">
        <Puppet L={{...TOM, band: undefined}} p={mkPose(f, {hF: [120, -120], hB: [40, 2], head: {turn: 0.15, eyes: 'half', mouth: ts.talking ? ts.mouth : 'line', open: ts.open, browInner: -0.6, browHeight: -0.2, lookX: 0}, seed: 2})} propF={<g transform="translate(6 -30) rotate(-80)"><Bread /></g>} />
      </g>
    </Cam>
  );
};

export const s50_end = ({lf, dur}: SP) => {
  const f = lf;
  const a = iv(lf, [0, 14], [0, 1], EOut);
  const st = walk(f / 30);
  return (
    <g>
      <rect width={1920} height={1080} fill="#1A110B" />
      <g filter="url(#paint)" opacity={0.5}><MapLondon f={f} labels={0} /></g>
      <rect width={1920} height={1080} fill="#120B08" opacity={0.6} />
      <g opacity={a}>
        <text x={960} y={120} textAnchor="middle" fontFamily="FellSC" fontSize={50} fill="#E8D8B0" letterSpacing={6}>ONE YEAR, ONE BODY · EPISODE 1</text>
        {/* watch-next box (YouTube end-screen element goes here) */}
        <rect x={180} y={260} width={800} height={450} rx={16} fill="#0E0805" stroke="#E5503A" strokeWidth={6} />
        <text x={580} y={430} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={70} fill="#F3E7CF">WATCH NEXT</text>
        <text x={580} y={510} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={44} fill="#E8D8B0">Episode 2: You Get Sick</text>
        <text x={580} y={566} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={44} fill="#E8D8B0">in 1500s Edirne</text>
        {/* subscribe */}
        <circle cx={1440} cy={430} r={150} fill="#0E0805" stroke="#E8D8B0" strokeWidth={6} />
        <g transform="translate(1440 520) scale(0.75)"><Puppet L={TOM} p={mkPose(f, {hF: [100, -260 + Math.sin(f * 0.3) * 20], hB: [40, 2], head: {turn: 0.4, eyes: 'happy', mouth: 'gap', open: 0.3}, seed: 2})} poseF="open" /></g>
        <rect x={1240} y={640} width={400} height={90} rx={14} fill="#C4302B" stroke={INK} strokeWidth={5} transform={`scale(${1 + 0.03 * Math.sin(f * 0.2)})`} style={{transformOrigin: '1440px 685px'}} />
        <text x={1440} y={702} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={52} fill="#fff">SUBSCRIBE</text>
        <text x={960} y={930} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={110} fill="#E5503A" letterSpacing={8}>HISTORY SOURCED</text>
        <text x={960} y={1000} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill="#E8D8B0">animated reconstruction · sources in the description</text>
      </g>
      {void st}
    </g>
  );
};
