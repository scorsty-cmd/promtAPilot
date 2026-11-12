// shared staging for Ep 2 (Carrington): Ned seated at his desk (chair -> body -> instruments -> desk front), Pike, side table view.
import React from 'react';
import {NED, PIKE, HeadPose, Look} from '../rig';
import {Actor, mkPose, Chair, DeskFront, seatY, sitOpts, ActOpts, speech, Shot, INK, FLOOR, Y} from './kit';
import {Office, Instruments, OFFICE, DESK_Y, SkyMode, PikeDesk} from './sets';

export const NED_S = 1.15;
export const NED_X = 880;
export const NED_Y = seatY(NED_S) - 38; // tall office chair: elbows at desk height
export const nedH = (o: Partial<HeadPose> = {}): Partial<HeadPose> => ({turn: 0.6, ...o});
export const pikeH = (o: Partial<HeadPose> = {}): Partial<HeadPose> => ({turn: 0.5, ...o});
// typing on the key: returns press 0..1 and the hand target for a seated Ned (rel. to pelvis, unscaled)
export const keyHand = (press: number): [number, number] => [104, -84 + press * 8];
// rhythmic morse tapping: pattern of on/off per frame
export const tap = (f: number, rate = 1, seed = 0) => {
  const k = Math.floor((f * rate + seed * 7) / 4);
  const on = Math.sin(k * 12.9898 + seed) * 43758.5 % 1;
  return Math.abs(on) > 0.45 ? 1 : 0;
};
export const lipOf = (sh: Shot, sp: string, gf: number) => speech(sh, sp, gf);

type NedOpts = ActOpts & {dart?: number};
export const OfficeScene: React.FC<{
  f: number; sky?: SkyMode; green?: number; skyAmt?: number; lamp?: number;
  ned?: NedOpts | null; nedPose?: 'sit' | 'none'; nedProps?: {propF?: React.ReactNode; propAngF?: number; poseF?: any; poseB?: any; gripF?: boolean};
  press?: number; arm?: number; tapeOff?: number; burn?: number; unplug?: number; glow?: number; garble?: boolean;
  behind?: React.ReactNode; front?: React.ReactNode; overDesk?: React.ReactNode; L?: Look; variant?: 'boston' | 'dc' | 'pitt'; pikeDesk?: boolean;
}> = ({f, sky = 'night', green, skyAmt, lamp = 1, ned = {}, nedProps = {}, press = 0, arm = 0, tapeOff, burn, unplug, glow, garble, behind, front, overDesk, L = NED, variant, pikeDesk = true}) => (
  <g>
    <Office f={f} sky={sky} green={green} skyAmt={skyAmt} lamp={lamp} variant={variant} />
    {pikeDesk && <PikeDesk f={f} />}
    {behind}
    {ned && <Chair x={NED_X} y={NED_Y} s={NED_S} />}
    {ned && <Actor L={L} x={NED_X} y={NED_Y} s={NED_S} shadow={false} p={mkPose(f, sitOpts({hF: keyHand(press), hB: [80, -78], lean: 10, seed: 1, ...ned, head: nedH(ned.head)}))} gripB {...nedProps} />}
    <Instruments f={f} press={press} arm={arm} tapeOff={tapeOff} burn={burn} unplug={unplug} glow={glow} garble={garble} />
    {overDesk}
    <DeskFront x0={560} x1={1940} y={DESK_Y} />
    {front}
  </g>
);
// Pike standing (world coords), lip-synced
export const Pike: React.FC<{f: number; x: number; y?: number; s?: number; flip?: boolean; o?: NedOpts; propF?: React.ReactNode; propAngF?: number; poseF?: any; poseB?: any; gripF?: boolean; gripB?: boolean}> = ({f, x, y, s = 1.18, flip, o = {}, ...r}) => (
  <Actor L={PIKE} x={x} y={y ?? Y(s)} s={s} flip={flip} p={mkPose(f, {seed: 4, ...o, head: pikeH(o.head)})} {...r} />
);
// side view of Ned at a plain table so the seated legs + chair read clearly
export const SideTable: React.FC<{x0: number; x1: number; y: number; c?: string}> = ({x0, x1, y, c = '#6A4A30'}) => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={x0} y={y} width={x1 - x0} height={30} fill={c} />
    <rect x={x0 + 20} y={y + 30} width={20} height={FLOOR - y - 30} fill="#4A3220" />
    <rect x={x1 - 40} y={y + 30} width={20} height={FLOOR - y - 30} fill="#4A3220" />
  </g>
);
export {OFFICE, DESK_Y};
