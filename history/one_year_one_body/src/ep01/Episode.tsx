import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Defs, useFonts, SHOTS, Caption, Post, SP} from './kit';
import * as S1 from './shots1';
import * as S2 from './shots2';
import * as S3 from './shots3';

const FUNCS: Record<string, (p: SP) => React.ReactNode> = {...(S1 as any), ...(S2 as any), ...(S3 as any)};

export const Episode: React.FC<{offset?: number}> = ({offset = 0}) => {
  useFonts();
  const gf = useCurrentFrame() + offset;
  const sh = SHOTS.find((s) => gf >= s.start && gf < s.end) ?? SHOTS[SHOTS.length - 1];
  const lf = gf - sh.start;
  const fn = FUNCS[sh.id];
  const chStart = SHOTS.find((s) => s.ch === sh.ch)!.start;
  const fadeIn = sh.ch > 1 && gf - chStart < 6 ? 1 - (gf - chStart) / 6 : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#120B08'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Defs gf={gf} />
        {fn ? fn({lf, gf, sh, dur: sh.end - sh.start}) : <text x={960} y={540} fill="#fff" fontSize={60} textAnchor="middle">{sh.id}</text>}
        <Caption sh={sh} gf={gf} />
        <Post fade={Math.max(fadeIn, gf < 6 ? 1 - gf / 6 : 0)} />
      </svg>
    </AbsoluteFill>
  );
};
