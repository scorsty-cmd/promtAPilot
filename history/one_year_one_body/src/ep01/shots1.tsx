// Ep 1 shots, chapters 1–3 (hook, Tom's London, the worm)
import React from 'react';
import {Head, TOM, HOLLIS, WATCHMAN, extraLook, restHead, HeadPose, Bread, Peel, Halberd, Look} from '../rig';
import {walk, tiptoe, flinch, spring, ease, clamp01, lerp, lerp2, knead, blinkAt} from '../motion';
import {Actor, mkPose, Cam, SP, iv, ls, le, speech, FreezeLabel, Tag, BigWord, Stamp, Throb, INK, FLOOR, EOut, EBack, STAND, Cut} from './kit';
import {Attic, Blanket, Bakery, Street, MapLondon, Parchment, ToothCut, Worm, DarkTable, doorOf, HOUSES, flickOf, Flame} from './sets';
import {Bottle, Pliers, Funnel} from '../rig';

export const tomH = (o: Partial<HeadPose> = {}): Partial<HeadPose> => ({turn: 0.6, swell: 1, browInner: 0.7, browHeight: 0.1, mouth: 'zigzag', ...o});
const Y = (s: number) => FLOOR - 176 * s; // standing pelvis height for scale s

// lying head on the pillow
const LyingTom: React.FC<{f: number; h: Partial<HeadPose>; x?: number; y?: number; s?: number; rot?: number}> = ({f, h, x = 620, y = 790, s = 0.9, rot = -78}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#soft)">
    <Head h={restHead({...tomH(), ...h})} L={TOM} frame={f} />
  </g>
);

// ---------------- CH1 ----------------
export const s01_attic = ({lf, dur}: SP) => {
  const f = lf;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.12, f0: [960, 560], f1: [900, 600]},
    {at: 150, z0: 2.6, z1: 2.85, f0: [640, 760], f1: [630, 770]},
  ];
  const open = f > 150 ? 1 : 0.85;
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <Attic f={f} />
      <LyingTom f={f} h={{eyes: 'dot', lookX: 0.6, lookY: -0.6, blink: blinkAt(f, [60, 120, 190]) * open, mouth: 'zigzag', browInner: 0.9, swell: 1.05}} />
      <Blanket x={660} y={800} breathe={Math.sin(f * 0.09)} />
      <Throb x={650} y={760} f={f} amt={0.75} />
    </Cam>
  );
};

export const s02_window = ({lf, dur}: SP) => {
  const f = lf;
  // view out of the window: night street, a cart with a lantern and a bell ringer
  const cx = iv(f, [0, dur], [2300, 900]);
  const ring = Math.sin(f * 0.35);
  const bellman = extraLook(7);
  const st = walk(f / 36);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.05, z1: 1.18, f0: [1300, 520], f1: [1200, 540]}]} dur={dur}>
        <g filter="url(#night)">
          <Street f={f} mode="night" crosses={{5: 1}} lamps={[700, 1900]} />
          {/* cart */}
          <g transform={`translate(${cx} ${FLOOR - 150})`}>
            <rect x={-170} y={-60} width={300} height={110} fill="#4A3424" stroke={INK} strokeWidth={6} />
            <path d="M-160 -60 L-150 -120 L120 -120 L130 -60" fill="#3A2A1E" stroke={INK} strokeWidth={5} />
            {[-110, 70].map((wx) => <g key={wx} transform={`translate(${wx} 70) rotate(${-f * 4})`}><circle r={56} fill="#2A1E16" stroke={INK} strokeWidth={6} /><path d="M-56 0 H56 M0 -56 V56" stroke="#5A4436" strokeWidth={6} /></g>)}
            <path d="M130 -10 h120" stroke={INK} strokeWidth={10} />
          </g>
          <Actor L={bellman} x={cx + 360} y={Y(1.0)} s={1.0} flip p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, hF: [70, -150 + ring * 14], head: {turn: 0.7, mouth: 'O', open: 0.4 + 0.3 * Math.abs(ring)}, seed: 3})}
            propF={<g transform="rotate(90)"><path d="M0 0 L-10 40 Q0 50 10 40 Z" fill="#C9A35A" stroke={INK} strokeWidth={4} /></g>} gripF />
        </g>
      </Cam>
      {/* window frame foreground */}
      <g>
        <path d="M0 0 H1920 V1080 H0 Z M180 120 V960 H1740 V120 Z" fill="#2A1F18" fillRule="evenodd" />
        <path d="M960 120 V960 M180 540 H1740" stroke="#3E2A1C" strokeWidth={26} />
        <rect x={180} y={120} width={1560} height={840} fill="none" stroke="#1A120C" strokeWidth={30} />
      </g>
    </g>
  );
};

export const s03_situp = ({lf, gf, sh, dur}: SP) => {
  const FREEZE = le(sh, 1) + 8;
  const frozen = lf >= FREEZE;
  const f = Math.min(lf, FREEZE);
  const sp = speech(sh, 'TOM', sh.start + f);
  const antic = iv(f, [0, 6], [0, 1]) * (f < 6 ? 1 : 0);
  const up = spring(f, 6, 0.3, 0.16);
  const ow = sp.talking;
  const h = tomH({eyes: ow ? 'squeeze' : 'dot', mouth: ow ? (sp.open > 0.05 ? 'O' : 'zigzag') : 'zigzag', open: sp.open, browInner: 1, swell: 1.1, lookX: f > 66 ? -0.2 : 0.6, tilt: ow ? Math.sin(f * 0.8) * 6 : 0, turn: f > 66 ? 0.25 : 0.6});
  const cuts: Cut[] = [
    {at: 0, z0: 1.55, z1: 1.65, f0: [820, 640], f1: [820, 630]},
    {at: 66, z0: 2.5, z1: 2.7, f0: [790, 480], f1: [790, 470]},
  ];
  return (
    <g>
      <g filter={frozen ? 'url(#freeze)' : undefined}>
        <Cam lf={f} cuts={cuts} dur={dur} shake={ow ? 3 : 0}>
          <Attic f={f} />
          <Actor L={TOM} x={780} y={760 - up * 40 + antic * 10} s={1.1} shadow={false}
            p={mkPose(f, {legF: [1.5, 1.5], legB: [1.4, 1.4], lean: -20 + up * 20, hF: [74, -196], hB: [60, -10], head: h, seed: 1})} />
          <Blanket x={640} y={830} breathe={0} />
          <Throb x={850} y={500 - up * 40} f={f} amt={ow ? 1 : 0.5} />
        </Cam>
      </g>
      {frozen && <FreezeLabel t={lf - FREEZE} title="TOM, 15." sub="Has bigger problems than the plague." />}
      {frozen && <rect width={1920} height={1080} fill="#fff" opacity={iv(lf - FREEZE, [0, 4], [0.7, 0])} />}
    </g>
  );
};

// teaser montage: 3 quick inserts on a dark table
export const s04_promise = ({lf, dur}: SP) => {
  const seg = Math.floor(lf / (dur / 4));
  const t = lf - seg * (dur / 4);
  const f = lf;
  const items = [
    {word: 'CLOVES', el: <g transform="translate(960 560) scale(2.2)"><Bottle /></g>},
    {word: 'SMOKE', el: <g><g transform="translate(860 600) scale(2)"><Funnel /></g>{Array.from({length: 8}, (_, i) => <circle key={i} cx={760 - i * 30 + Math.sin(f * 0.1 + i) * 20} cy={560 - i * 40} r={30 + i * 10} fill="#B8B0A0" opacity={0.35 - i * 0.03} />)}</g>},
    {word: 'PLIERS', el: <g transform="translate(860 560) rotate(-20) scale(2.6)"><Pliers glint={iv(t, [10, 16, 26], [0, 1.2, 0])} /></g>},
    {word: 'TEETH', el: <g transform="translate(960 520) scale(1)"><Parchment x={-420} y={-300} w={840} h={600} /><text x={0} y={30} textAnchor="middle" fontFamily="FellSC" fontSize={120} fill={INK}>Teeth</text></g>},
  ];
  const it = items[Math.min(3, seg)];
  return (
    <g>
      <Cam lf={lf} cuts={[0, 1, 2, 3].map((i) => ({at: i * dur / 4, z0: 1.0, z1: 1.1, f0: [960 + (i % 2 ? 40 : -40), 540] as [number, number], f1: [960, 540] as [number, number]}))} dur={dur}>
        <DarkTable f={f} />
        {it.el}
      </Cam>
      <BigWord x={960} y={900} t={t - 4} text={it.word} size={150} />
    </g>
  );
};

export const s05_title = ({lf, dur}: SP) => {
  const f = lf;
  const a = iv(f, [0, 14], [0, 1], EOut);
  const st = walk(f / 34);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [960, 530]}]} dur={dur}>
        <g filter="url(#night)"><Street f={f} mode="dawn" crosses={{3: 1, 6: 1}} lamps={[400]} /></g>
        <rect x={-500} y={-300} width={3000} height={1600} fill="#0E0805" opacity={0.55} />
        <g opacity={0.95}>
          <Actor L={TOM} x={iv(f, [0, dur], [300, 760])} y={Y(1.1)} s={1.1} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean, hF: [74, -196], hB: [40 - st.swing * 30, 4], head: tomH({lookX: 0.4})})} />
        </g>
      </Cam>
      <g opacity={a} transform={`translate(0 ${(1 - a) * 30})`}>
        <text x={1300} y={330} textAnchor="middle" fontFamily="FellSC" fontSize={54} fill="#E8D8B0" letterSpacing={8}>ONE YEAR, ONE BODY</text>
        <path d="M1040 360 H1560" stroke="#E5503A" strokeWidth={4} />
        <text x={1300} y={470} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={96} fill="#F3E7CF">You Have a</text>
        <text x={1300} y={580} textAnchor="middle" fontFamily="FrauncesBlack" fontWeight={900} fontSize={110} fill="#E5503A">Toothache</text>
        <text x={1300} y={670} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={58} fill="#E8D8B0">London, 1665</text>
      </g>
    </g>
  );
};

// ---------------- CH2 ----------------
// painted map transition with Tom's silhouette walking along the route (backlog item)
export const MapWalk: React.FC<{lf: number; dur: number; route: [number, number][]; t0: number; t1: number; cuts: Cut[]; pins?: {p: [number, number]; text: string; at: number}[]; crosses?: number}> = ({lf, dur, route, t0, t1, cuts, pins = [], crosses = 0}) => {
  const f = lf;
  const prog = ease(clamp01((lf - t0) / Math.max(1, t1 - t0)));
  // position along polyline
  const segL = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1]));
  const tot = segL.reduce((a, b) => a + b, 0);
  let d = prog * tot, k = 0;
  while (k < segL.length - 1 && d > segL[k]) { d -= segL[k]; k++; }
  const pos = lerp2(route[k], route[k + 1], Math.min(1, d / segL[k]));
  const dir = route[k + 1][0] >= route[k][0];
  const drawn = route.slice(0, k + 1).concat([pos]);
  const st = walk(f / 18, prog > 0 && prog < 1 ? 1 : 0);
  return (
    <Cam lf={lf} cuts={cuts} dur={dur}>
      <MapLondon f={f} />
      {Array.from({length: crosses}, (_, i) => {
        const x = 650 + ((i * 137) % 780), y = 360 + ((i * 89) % 260);
        const a = iv(lf - i * 6, [0, 8], [0, 1], EBack);
        return <g key={i} transform={`translate(${x} ${y}) scale(${a})`}><path d="M0 -14 V14 M-10 -4 H10" stroke="#B3201A" strokeWidth={6} strokeLinecap="round" /></g>;
      })}
      <path d={`M${route.map((p) => p.join(' ')).join(' L')}`} stroke="#6B4A2F" strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" fill="none" opacity={0.5} />
      <path d={`M${drawn.map((p) => p.join(' ')).join(' L')}`} stroke="#B3362B" strokeWidth={8} strokeDasharray="14 14" strokeLinecap="round" fill="none" />
      {pins.map((p, i) => <Tag key={i} x={p.p[0]} y={p.p[1] - 70} t={lf - p.at} text={p.text} size={34} />)}
      {/* Tom silhouette with the red cloth */}
      <g transform={`translate(${pos[0]} ${pos[1] - 52}) scale(${dir ? 0.3 : -0.3} 0.3)`}>
        <ellipse cx={0} cy={176} rx={70} ry={12} fill="#0E0805" opacity={0.4} />
        <g filter="url(#soft)">
          {/* silhouette = puppet drawn in ink colours with only the cloth in red */}
          <SilTom f={f} st={st} />
        </g>
      </g>
    </Cam>
  );
};
const SIL: Look = {...TOM, skin: '#2B1D14', shade: '#2B1D14', shirt: '#2B1D14', shirtShade: '#2B1D14', vest: '#2B1D14', breeches: '#2B1D14', stocking: '#2B1D14', shoe: '#2B1D14', apron: '#2B1D14', hairColor: '#2B1D14', blush: undefined};
const SilTom: React.FC<{f: number; st: ReturnType<typeof walk>}> = ({f, st}) => (
  <Actor L={SIL} x={0} y={0} s={1} shadow={false} filter="" p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean, hF: [-10 + st.swing * 30, 6], hB: [40 - st.swing * 30, 4], head: {eyes: 'dot', mouth: 'line'}})} />
);

export const s06_map = ({lf, dur}: SP) => (
  <g>
    <MapWalk lf={lf} dur={dur} route={[[1250, 520], [1250, 520]]} t0={0} t1={1}
      cuts={[{at: 0, z0: 0.95, z1: 1.05, f0: [1000, 520], f1: [1020, 520]}, {at: 130, z0: 1.6, z1: 1.75, f0: [1150, 500], f1: [1170, 490]}]}
      pins={[{p: [1250, 470], text: "Tom's bakery", at: 150}]} />
    <Tag x={360} y={150} t={lf - 20} text="London, August 1665" sub="pop. roughly 400,000-500,000" size={48} />
  </g>
);

export const s07_bakery = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const hs = speech(sh, 'HOLLIS', gf);
  const kn = knead(f);
  const shout = lf >= L2;
  const push = shout ? spring(lf, L2, 0.3, 0.15) : 0;
  const cuts: Cut[] = [
    {at: 0, z0: 1.0, z1: 1.08, f0: [900, 540], f1: [860, 540]},
    {at: 100, z0: 1.8, z1: 1.9, f0: [820, 520], f1: [830, 510]},
    {at: L2 - 4, z0: 2.1, z1: 2.25, f0: [420, 420], f1: [430, 410]},
  ];
  return (
    <Cam lf={lf} cuts={cuts} dur={dur} shake={hs.talking ? hs.amp * 2 : 0}>
      <Bakery f={f} />
      <Actor L={TOM} x={760} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: kn.hF, hB: kn.hB, bob: kn.bob, lean: kn.lean, head: tomH({lookX: 0.6, lookY: 0.7, eyes: 'half', mouth: 'zigzag'}), seed: 2})} gripF gripB />
      <Actor L={HOLLIS} x={420} y={Y(1.2)} s={1.2} p={mkPose(f, {
        hF: shout ? [96 + push * 20, -150] : [110, -60 + Math.sin(f * 0.1) * 6], hB: [80, -40], lean: shout ? 8 * push : 3,
        head: {turn: 0.7, mouth: hs.mouth, open: hs.open, eyes: 'dot', browInner: shout ? -0.9 : -0.3, browHeight: shout ? -0.2 : 0.2, lookX: 0.8}, seed: 4,
      })} propF={shout ? undefined : <Peel loaf={f % 120 < 60} />} poseF={shout ? 'point' : undefined} gripF={!shout} />
    </Cam>
  );
};

export const s07b_apprentice = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  if (lf < L2) {
    // Tom staggers across with a flour sack
    const x = iv(lf, [0, L2], [1300, 300]);
    const st = walk(f / 22);
    return (
      <Cam lf={lf} cuts={[{at: 0, z0: 1.15, z1: 1.2, f0: [1100, 560], f1: [600, 560]}]} dur={dur}>
        <Bakery f={f} />
        <Actor L={TOM} x={x} y={Y(1.1) + 6} s={1.1} flip p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob * 1.4, lean: 12 + Math.sin(f * 0.13) * 5, hF: [40, -330], hB: [20, -326], head: tomH({lookY: 0.2, mouth: 'zigzag', browInner: 1, sweat: ((f % 60) / 60)}), seed: 2})} gripF gripB />
        <g transform={`translate(${x - 10} ${Y(1.1) - 420 + st.bob})`}><path d="M-90 40 Q-100 -30 -40 -50 Q0 -64 40 -50 Q100 -30 90 40 Q0 70 -90 40 Z" fill="#E4D8BE" stroke={INK} strokeWidth={6} /><text x={0} y={10} textAnchor="middle" fontFamily="FellSC" fontSize={30} fill="#8C7552">FLOUR</text></g>
      </Cam>
    );
  }
  // tally of seven years
  const t = lf - L2;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: L2, z0: 1.0, z1: 1.05, f0: [960, 540], f1: [960, 540]}]} dur={dur}>
        <DarkTable f={f} />
        <Parchment x={360} y={180} w={1200} h={720} />
        {Array.from({length: 7}, (_, i) => {
          const a = iv(t - 8 - i * 9, [0, 6], [0, 1], EOut);
          return <path key={i} d={`M${560 + i * 120} 380 l${i === 6 ? 0 : 0} ${260 * a}`} stroke={i < 2 ? '#B3362B' : INK} strokeWidth={18} strokeLinecap="round" />;
        })}
        <text x={960} y={780} textAnchor="middle" fontFamily="FellSC" fontSize={70} fill={INK}>seven years · two done</text>
      </Cam>
      <g transform={`translate(${1600} ${880}) scale(0.62)`} opacity={iv(t, [60, 70], [0, 1])}>
        <Actor L={TOM} x={0} y={0} s={1} shadow={false} p={mkPose(f, {hF: [-10, 6], hB: [40, 2], head: tomH({eyes: 'half', mouth: 'line', lookX: -0.8})})} />
      </g>
    </g>
  );
};

export const s08_crust = ({lf, sh, dur}: SP) => {
  const f = lf;
  const BITE = ls(sh, 1) - 6;
  const bring = ease(iv(f, [20, BITE], [0, 1]));
  const bit = f > BITE;
  const fl = flinch(f - BITE);
  const h = tomH({swell: 0.5, eyes: bit ? 'squeeze' : 'dot', mouth: bit ? 'fear' : f > BITE - 20 ? 'O' : 'smile', open: bit ? 0.4 : 0.6, browInner: bit ? 1 : 0.2, tilt: fl.tilt, turn: 0.55, lookX: 0.6});
  const cuts: Cut[] = [
    {at: 0, z0: 2.2, z1: 2.35, f0: [880, 470], f1: [880, 460]},
    {at: BITE, z0: 3.4, z1: 3.6, f0: [890, 450], f1: [890, 446]},
  ];
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur} shake={fl.shake}>
        <Bakery f={f} />
        <Actor L={{...TOM, band: undefined}} x={800} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: lerp2([90, -60], [118, -214], bring), hB: [60, -10], lean: fl.lean, bob: fl.bob, squash: fl.squash, head: h, seed: 2})} propF={<g transform="translate(6 -30) rotate(-80)"><Bread bite={bit} /></g>} />
        {bit && (
          <g opacity={iv(f - BITE, [0, 3, 30, 40], [0, 1, 1, 0])}>
            <path d="M905 480 L930 420 L912 418 L945 340 L925 336 L960 250" stroke="#FFE45A" strokeWidth={14} fill="none" strokeLinejoin="round" />
            <path d="M905 480 L930 420 L912 418 L945 340 L925 336 L960 250" stroke="#E5503A" strokeWidth={5} fill="none" strokeLinejoin="round" />
          </g>
        )}
      </Cam>
    </g>
  );
};

export const s09_flinch = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const fl = flinch(f);
  const ts = speech(sh, 'TOM', gf), hs = speech(sh, 'HOLLIS', gf);
  const turn = iv(f, [26, 36], [0, 1], EOut);
  const breadY = iv(f, [0, 20], [0, 1]);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.25, z1: 1.32, f0: [640, 560], f1: [640, 550]}]} dur={dur} shake={fl.shake * 1.5}>
      <Bakery f={f + 300} />
      <Actor L={TOM} x={800} y={Y(1.1) + fl.bob} s={1.1} p={mkPose(f, {hF: [74, -196], hB: [80 - fl.lean * 3, -150 + fl.lean * 4], lean: fl.lean - 6, squash: fl.squash, head: tomH({eyes: 'squeeze', mouth: ts.talking ? 'O' : 'zigzag', open: ts.open + (ts.talking ? 0.3 : 0), tilt: fl.tilt - 6}), seed: 2})} poseB="open" />
      <g transform={`translate(${900 + breadY * 60} ${560 + breadY * breadY * 340}) rotate(${breadY * 300})`}><Bread bite /></g>
      <Actor L={HOLLIS} x={360} y={Y(1.2)} s={1.2} p={mkPose(f, {hF: turn > 0.5 ? [110, -120] : [110, -60], hB: [80, -40], head: {turn: lerp(-0.3, 0.7, turn), mouth: hs.mouth, open: hs.open, browInner: -0.8, lookX: 0.9}, seed: 4})} poseF={turn > 0.5 ? 'point' : undefined} />
    </Cam>
  );
};

export const s10_street = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const st = walk(f / 30);
  const tomX = iv(lf, [0, L2 + 60], [-100, 1150]);
  const extras = [0, 1, 2, 3].map((i) => ({L: extraLook(11 + i), x0: 2200 + i * 300, sp: 2.2 + i * 0.4, seed: i}));
  const hammer = lf > L2 ? Math.sin((lf - L2) * 0.5) : 0;
  const d = doorOf(4);
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.05, f0: [700, 540], f1: [950, 540]}, {at: L2, z0: 1.45, z1: 1.55, f0: [d.x + 120, 560], f1: [d.x + 120, 550]}]} dur={dur}>
      <Street f={f} mode="day" crosses={{2: 1}} />
      {/* watchman nailing a door shut */}
      <Actor L={WATCHMAN} x={d.x + 230} y={Y(1.1)} s={1.1} flip p={mkPose(f, {hF: [100, -140 + Math.max(0, hammer) * -40], hB: [96, -120], lean: 6, head: {turn: 0.7, browInner: -0.4, lookX: 0.7}, seed: 5})}
        propF={<g transform="rotate(-90)"><rect x={-6} y={-6} width={60} height={12} fill="#6B4A2F" stroke={INK} strokeWidth={3} /><rect x={50} y={-16} width={20} height={32} fill="#7C7F84" stroke={INK} strokeWidth={3} /></g>} gripF />
      <rect x={d.x - 50} y={d.top + 70} width={130} height={18} fill="#8C6B4A" stroke={INK} strokeWidth={4} transform={`rotate(-8 ${d.x} ${d.top})`} />
      {extras.map((e) => {
        const ew = walk((f + e.seed * 7) / 28);
        return <Actor key={e.seed} L={e.L} x={e.x0 - f * e.sp} y={Y(1.0) + 10} s={1.0} flip p={mkPose(f, {legF: ew.legF, legB: ew.legB, bob: ew.bob, lean: ew.lean, hF: [-10 + ew.swing * 24, 6], hB: [40 - ew.swing * 24, 2], head: {turn: 0.6, eyes: 'dot', browInner: 0.5}, seed: e.seed + 20})} />;
      })}
      <Actor L={TOM} x={tomX} y={Y(1.1)} s={1.1} p={mkPose(f, {legF: st.legF, legB: st.legB, bob: st.bob, lean: st.lean, hF: [74, -196], hB: [60, -40], head: tomH({lookX: lf > L2 ? 0.9 : 0.4}), seed: 2})}
        propB={<g transform="translate(0 30)"><path d="M-40 0 Q0 30 40 0 L34 40 Q0 50 -34 40 Z" fill="#9A7A4A" stroke={INK} strokeWidth={4} /><g transform="translate(-20 -6) scale(0.4)"><Bread /></g></g>} />
    </Cam>
  );
};

export const s11_door = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const d = doorOf(5);
  const paint = iv(lf, [10, 70], [0, 1]);
  const words = iv(lf, [70, 130], [0, 1]);
  const tp = tiptoe(f / 26);
  const tx = iv(lf, [L2, dur], [d.x + 700, d.x - 600]);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 2.3, z1: 2.5, f0: [d.x + 40, d.top + 50], f1: [d.x + 40, d.top + 40]}, {at: L2, z0: 1.25, z1: 1.3, f0: [d.x + 60, 560], f1: [d.x - 20, 560]}]} dur={dur}>
        <Street f={f} mode="day" crosses={{5: paint}} />
        <g opacity={words}>
          <rect x={d.x - 150} y={d.top - 80} width={300} height={56} fill="#EFE3C6" stroke={INK} strokeWidth={4} />
          <text x={d.x} y={d.top - 42} textAnchor="middle" fontFamily="FellSC" fontSize={26} fill="#7E2119">{'LORD HAVE MERCY UPON US'.slice(0, Math.round(23 * words))}</text>
        </g>
        {lf >= L2 && (
          <>
            <Actor L={WATCHMAN} x={d.x + 200} y={Y(1.15)} s={1.15} flip p={mkPose(f, {hF: [60, -40], hB: [70, -60], head: {turn: 0.4, eyes: 'sly', lookX: iv(lf, [L2, dur], [-0.6, 0.8]), browInner: -0.5}, seed: 5})} propF={<g transform="rotate(-80)"><Halberd /></g>} gripF />
            <Actor L={TOM} x={tx} y={Y(1.1) + tp.bob} s={1.1} flip p={mkPose(f, {legF: tp.legF, legB: tp.legB, lean: tp.lean, hF: [74, -196], hB: [30, -60], head: tomH({lookX: -0.9, eyes: 'dot', mouth: 'line', browInner: 1, browHeight: 0.6}), seed: 2})} />
          </>
        )}
      </Cam>
      {lf < L2 && <Tag x={1520} y={900} t={lf - 30} text="40 days" sub="shut in with the sick" size={50} />}
    </g>
  );
};

export const s11b_cart = ({lf, dur}: SP) => {
  const f = lf;
  // the royal coach leaves; people flee with bundles
  const cx = iv(lf, [20, dur - 40], [600, 2600], (x) => x * x);
  const extras = [0, 1, 2, 3, 4].map((i) => ({L: extraLook(31 + i), x0: 300 + i * 240, sp: 3 + i * 0.5, seed: i}));
  const st = walk(f / 30, 0);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.06, f0: [960, 540], f1: [1060, 540]}, {at: 150, z0: 1.6, z1: 1.7, f0: [700, 600], f1: [700, 590]}]} dur={dur}>
        <Street f={f} mode="day" crosses={{1: 1, 3: 1, 6: 1, 8: 1}} />
        {extras.map((e) => {
          const ew = walk((f + e.seed * 5) / 20);
          return <Actor key={e.seed} L={e.L} x={e.x0 + f * e.sp} y={Y(0.95) + 16} s={0.95} p={mkPose(f, {legF: ew.legF, legB: ew.legB, bob: ew.bob, lean: ew.lean + 4, hF: [90, -150], hB: [80, -146], head: {turn: 0.7, browInner: 0.8, mouth: 'line'}, seed: e.seed})}
            propF={<g transform="translate(10 -10)"><circle r={46} fill={['#8A7A5E', '#6B4A3A', '#4E5A44'][e.seed % 3]} stroke={INK} strokeWidth={5} /><path d="M-10 -46 l10 -16 l10 16" stroke={INK} strokeWidth={5} fill="none" /></g>} gripF gripB />;
        })}
        {/* coach */}
        <g transform={`translate(${cx} ${FLOOR - 200})`}>
          <rect x={-200} y={-150} width={360} height={200} rx={20} fill="#3A1E22" stroke={INK} strokeWidth={7} />
          <rect x={-150} y={-120} width={110} height={80} fill="#C9A35A" opacity={0.6} stroke={INK} strokeWidth={5} />
          <path d="M-40 -150 L0 -200 L40 -150" fill="#C9A35A" stroke={INK} strokeWidth={5} />
          <path d="M-20 -190 l10 -20 l10 14 l10 -14 l10 20 Z" fill="#E8C15A" stroke={INK} strokeWidth={4} />
          {[-140, 110].map((wx) => <g key={wx} transform={`translate(${wx} 80) rotate(${f * 9})`}><circle r={70} fill="#4A2A20" stroke={INK} strokeWidth={7} /><path d="M-70 0 H70 M0 -70 V70 M-50 -50 L50 50 M-50 50 L50 -50" stroke="#C9A35A" strokeWidth={5} /></g>)}
          {Array.from({length: 6}, (_, i) => <circle key={i} cx={-260 - i * 50} cy={150 - i * 6} r={30 + i * 12} fill="#B8A688" opacity={0.3 - i * 0.04} />)}
        </g>
        <Actor L={TOM} x={980} y={Y(1.1)} s={1.1} p={mkPose(f, {legF: st.legF, legB: st.legB, hF: [74, -196], hB: [80, -150 + Math.sin(f * 0.4) * 30], head: tomH({lookX: 0.9, mouth: 'O', open: 0.3, browHeight: 0.7}), seed: 2})} poseB="open" />
      </Cam>
      <Tag x={1550} y={160} t={lf - 160} text="The court leaves" sub="July 1665" size={46} />
    </g>
  );
};

const BILL = ['Aged', 'Ague', 'Childbed', 'Consumption', 'Dropsie', 'Feaver', 'Griping in the Guts', 'Plague', 'Rising of the Lights', 'Surfet', 'Teeth'];
export const s12_bill = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const fy = iv(lf, [L2 + 30, dur - 10], [0, 9.2]);
  const row = (i: number) => 330 + i * 52;
  return (
    <Cam lf={lf} cuts={[{at: 0, z0: 0.95, z1: 1.0, f0: [960, 540], f1: [960, 540]}, {at: L2, z0: 1.7, z1: 1.8, f0: [900, row(fy) - 30], f1: [900, row(fy) - 20]}]} dur={dur}>
      <DarkTable f={f} />
      <Parchment x={460} y={50} w={1000} h={980} />
      <text x={960} y={150} textAnchor="middle" fontFamily="FellSC" fontSize={54} fill={INK}>London's Dreadful Visitation</text>
      <text x={960} y={210} textAnchor="middle" fontFamily="FellItalic" fontStyle="italic" fontSize={36} fill="#5A4030">A Bill of all the Burials this Week</text>
      <path d="M560 240 H1360" stroke={INK} strokeWidth={3} />
      {BILL.map((b, i) => (
        <g key={b} opacity={iv(lf, [10 + i * 6, 18 + i * 6], [0, 1])}>
          <text x={600} y={row(i)} fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill={b === 'Plague' ? '#7E2119' : INK}>{b}</text>
          <path d={`M${600 + b.length * 17} ${row(i) - 8} H1240`} stroke="#8C7552" strokeWidth={2} strokeDasharray="4 8" />
          <path d={`M1250 ${row(i) - 10} q8 -12 14 0 q8 12 14 0 q8 -12 14 0`} stroke={INK} strokeWidth={4} fill="none" opacity={0.7} />
        </g>
      ))}
      {/* Tom's finger */}
      {lf > L2 + 20 && (
        <g transform={`translate(${1260} ${row(fy) - 10})`}>
          <rect x={0} y={-12} width={60} height={24} rx={12} fill="#F3EAD8" stroke={INK} strokeWidth={5} />
          <ellipse cx={90} cy={6} rx={46} ry={36} fill="#F3EAD8" stroke={INK} strokeWidth={5} />
          <rect x={120} y={-10} width={300} height={70} fill="#EDE3CC" stroke={INK} strokeWidth={5} />
        </g>
      )}
    </Cam>
  );
};

export const s13_teeth = ({lf, gf, sh, dur}: SP) => {
  const f = lf;
  const T2 = ls(sh, 1) - 14;
  const ts = speech(sh, 'TOM', gf);
  if (lf < T2) {
    return (
      <g>
        <Cam lf={lf} cuts={[{at: 0, z0: 2.6, z1: 3.0, f0: [760, 850], f1: [760, 850]}]} dur={dur}>
          <DarkTable f={f} />
          <Parchment x={460} y={50} w={1000} h={980} />
          <text x={600} y={850} fontFamily="FellItalic" fontStyle="italic" fontSize={38} fill="#7E2119">Teeth</text>
          <path d="M680 862 Q720 880 760 862" stroke="#B3362B" strokeWidth={4} fill="none" opacity={iv(lf, [8, 20], [0, 1])} />
        </Cam>
        <BigWord x={960} y={520} t={lf - 8} text="TEETH" size={260} />
      </g>
    );
  }
  const t = lf - T2;
  const zoom = iv(t, [0, 5], [1.6, 2.7], EOut);
  return (
    <Cam lf={lf} cuts={[{at: T2, z0: zoom, z1: zoom, f0: [800, 440], f1: [800, 440]}]} dur={dur}>
      <Bakery f={f + 900} />
      <Actor L={TOM} x={800} y={Y(1.1)} s={1.1} p={mkPose(f, {hF: [74, -196], hB: [60, -40], head: tomH({eyes: 'fear', eyePop: Math.max(0, 1 - spring(t, 0, 0.35, 0.12)) * 1.5 + 0.1, mouth: ts.talking ? ts.mouth : 'fear', open: ts.talking ? ts.open : 0.3, browHeight: 1, browInner: 1, gulp: iv(t, [36, 50], [0, 1]) * (t < 50 ? 1 : 0), sweat: iv(t, [20, 70], [0, 1])}), seed: 2})} />
    </Cam>
  );
};

// ---------------- CH3 ----------------
export const s14_worm = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const cuts: Cut[] = [{at: 0, z0: 0.9, z1: 1.0, f0: [960, 600], f1: [960, 580]}, {at: L2, z0: 1.0, z1: 1.08, f0: [960, 560], f1: [980, 540]}, {at: L2 + 120, z0: 2.4, z1: 2.6, f0: [1050, 380], f1: [1050, 370]}];
  const wx = iv(lf, [L2, dur], [1180, 980]);
  return (
    <g>
      <Cam lf={lf} cuts={cuts} dur={dur}>
        <ToothCut f={f} decay={iv(lf, [L2, dur], [0, 0.6])} abscess={0} nerveGlow={0.2} />
        <Worm f={f} x={lf < L2 ? 1100 : wx} y={lf < L2 ? 300 : iv(lf, [L2, dur], [300, 380])} s={1.1} chomp={Math.max(0, Math.sin(f * 0.4))} hat={lf > L2 + 120} />
      </Cam>
      <Tag x={420} y={130} t={lf - 10} text="What they believed" size={52} color="#7E2119" />
      {lf < L2 && <Tag x={1500} y={930} t={lf - 60} text="'The tooth-worm'" sub="belief recorded since ancient Babylon" size={40} />}
    </g>
  );
};

export const s15_truth = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const poof = iv(lf, [6, 16], [1, 0]);
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.05, f0: [960, 560], f1: [960, 560]}, {at: 110, z0: 1.7, z1: 1.8, f0: [1040, 520], f1: [1040, 500]}, {at: L2, z0: 1.5, z1: 1.65, f0: [1100, 900], f1: [1110, 940]}]} dur={dur}>
        <ToothCut f={f} decay={0.85} abscess={iv(lf, [L2 - 30, dur], [0.2, 1.3])} nerveGlow={iv(lf, [60, 120], [0.2, 1])} />
        {poof > 0 && <g opacity={poof} transform={`translate(1030 330) scale(${2 - poof})`}><Worm f={f} x={0} y={0} s={1} hat /></g>}
      </Cam>
      <Stamp x={1500} y={240} t={lf - 4} text="NO WORM" />
      <Tag x={460} y={130} t={lf - 20} text="What was really happening" size={48} color="#2E4650" />
      {lf > 120 && lf < L2 && <Tag x={600} y={880} t={lf - 130} text="bacteria + pus" size={44} />}
      {lf > L2 && <Tag x={600} y={880} t={lf - L2} text="abscess" sub="it keeps growing" size={48} />}
    </g>
  );
};

export const s16_why = ({lf, sh, dur}: SP) => {
  const f = lf;
  const L2 = ls(sh, 1);
  const L2b = L2 + 150; // toothbrush part
  const part = lf < L2 ? 0 : lf < L2b ? 1 : 2;
  const t = part === 0 ? lf : part === 1 ? lf - L2 : lf - L2b;
  return (
    <g>
      <Cam lf={lf} cuts={[{at: 0, z0: 1.0, z1: 1.1, f0: [960, 540], f1: [960, 520]}, {at: L2, z0: 1.0, z1: 1.08, f0: [960, 540], f1: [980, 540]}, {at: L2b, z0: 1.05, z1: 1.12, f0: [960, 540], f1: [940, 540]}]} dur={dur}>
        <DarkTable f={f} />
        {part === 0 && (
          <g>
            {/* millstone grinding, grit falling into a loaf */}
            <g transform={`translate(760 420) rotate(${f * 2})`}>
              <circle r={240} fill="#8E8576" stroke={INK} strokeWidth={8} />
              {Array.from({length: 10}, (_, i) => <path key={i} d={`M0 0 L${Math.cos(i * 0.628) * 230} ${Math.sin(i * 0.628) * 230}`} stroke="#6E6658" strokeWidth={6} />)}
              <circle r={40} fill="#4A4438" stroke={INK} strokeWidth={6} />
            </g>
            {Array.from({length: 26}, (_, i) => {
              const ph = ((f * 2 + i * 23) % 160) / 160;
              return <circle key={i} cx={1040 + Math.sin(i * 7) * 40} cy={520 + ph * 300} r={i % 3 ? 5 : 8} fill={i % 4 ? '#E8DCC0' : '#5A5248'} stroke={i % 4 ? 'none' : INK} strokeWidth={2} />;
            })}
            <g transform="translate(980 860) scale(2.2)"><Bread /></g>
            <Tag x={1400} y={330} t={t - 30} text="stone grit" sub="in every loaf" size={52} />
          </g>
        )}
        {part === 1 && (
          <g>
            <g transform="translate(800 560)">
              <path d="M0 -260 L130 200 Q0 240 -130 200 Z" fill="#F4F0E6" stroke={INK} strokeWidth={8} />
              <path d="M-40 -100 L-70 160" stroke="#D8D0C0" strokeWidth={8} />
              <rect x={-150} y={190} width={300} height={40} rx={10} fill="#2D3B52" stroke={INK} strokeWidth={6} />
            </g>
            <Tag x={1350} y={380} t={t - 20} text="Sugar" sub="getting cheaper every year" size={64} />
            <BigWord x={1350} y={640} t={t - 60} text="£££" size={130} color="#C9A35A" />
            {t > 100 && <path d="M1200 640 L1500 600" stroke="#B3362B" strokeWidth={14} strokeLinecap="round" opacity={iv(t, [100, 106], [0, 1])} />}
          </g>
        )}
        {part === 2 && (
          <g>
            <g transform={`translate(860 540) rotate(${-15 + Math.sin(f * 0.08) * 4})`}>
              <rect x={-300} y={-20} width={460} height={40} rx={20} fill="#E8DCC0" stroke={INK} strokeWidth={7} />
              <rect x={150} y={-34} width={150} height={68} rx={10} fill="#E8DCC0" stroke={INK} strokeWidth={7} />
              {Array.from({length: 10}, (_, i) => <path key={i} d={`M${160 + i * 14} -34 v-50`} stroke="#F4F0E6" strokeWidth={8} />)}
            </g>
            <Stamp x={1300} y={720} t={t - 30} text="NOT YET" rot={-8} />
            <Tag x={1350} y={300} t={t - 10} text="Toothbrush" sub="common in England ~ a century later" size={54} />
          </g>
        )}
      </Cam>
    </g>
  );
};
