import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Defs, useFonts, SHOTS, Caption, Post, SP, Whip} from './kit';
import * as S1 from './shots1';
import * as S2 from './shots2';
import * as S3 from './shots3';

const FUNCS: Record<string, (p: SP) => React.ReactNode> = {...(S1 as any), ...(S2 as any), ...(S3 as any)};
// kit v4: whip-pan transitions INTO these shots (motion-blur streak across the cut)
export const WHIP_IN = new Set(['s09_deck', 's11_row', 's18_galley', 's27_prize', 's29b_testimony', 's39_barrels', 's43b_spout', 's46_after', 's22_newyork', 's34_doyle']);
const GRADE: Record<number, [string, number]> = {1: ['#3A5A70', 0.08], 2: ['#3A5A70', 0.06], 3: ['#5A6A70', 0.08], 4: ['#6A4A2A', 0.08], 5: ['#7A5A30', 0.06], 6: ['#5A3A5A', 0.06], 7: ['#2A3A50', 0.08], 8: ['#7A4A30', 0.07]};

export const Episode: React.FC<{offset?: number}> = ({offset = 0}) => {
  useFonts();
  const gf = useCurrentFrame() + offset;
  const idx = Math.max(0, SHOTS.findIndex((s) => gf >= s.start && gf < s.end));
  const sh = SHOTS[idx] ?? SHOTS[SHOTS.length - 1];
  const nx = SHOTS[idx + 1];
  const lf = gf - sh.start;
  const fn = FUNCS[sh.id];
  const chStart = SHOTS.find((s) => s.ch === sh.ch)!.start;
  const fadeIn = sh.ch > 1 && gf - chStart < 6 && !WHIP_IN.has(sh.id) ? 1 - (gf - chStart) / 6 : 0;
  let wk = 0, wd = 1;
  if (WHIP_IN.has(sh.id) && lf < 8) { wk = 1 - lf / 8; wd = -1; }
  else if (nx && WHIP_IN.has(nx.id) && sh.end - gf <= 6) { wk = 1 - (sh.end - gf - 1) / 6; wd = 1; }
  const [tint, tintO] = GRADE[sh.ch] ?? ['#000', 0];
  return (
    <AbsoluteFill style={{backgroundColor: '#120B08'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Defs gf={gf} />
        <Whip k={wk} dir={wd}>
          {fn ? fn({lf, gf, sh, dur: sh.end - sh.start}) : <text x={960} y={540} fill="#fff" fontSize={60} textAnchor="middle">{sh.id}</text>}
        </Whip>
        <Caption sh={sh} gf={gf} />
        <Post fade={Math.max(fadeIn, gf < 6 ? 1 - gf / 6 : 0)} tint={tint} tintO={tintO} />
      </svg>
    </AbsoluteFill>
  );
};
