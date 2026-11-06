import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Boil } from './art';
import { MChar, CAST, Chariot, Horse, trojan, greekSoldier } from './chars';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const r1 = [['you', { expr: 'worried' }], ['youArm', { holdF: 'spear', armF: -.4, elbowF: .6, expr: 'fierce' }], ['ilos', { holdF: 'cup', armF: -1.3, elbowF: 1.2, expr: 'laugh' }], ['ilosArm', { handF: 'point', armF: -1.5, elbowF: .1, expr: 'excited' }], ['dad', { holdF: 'reins' }], ['hec', { holdF: 'spear', armF: -.4, elbowF: .6, expr: 'fierce' }], ['and', { holdF: 'baby', armF: -1.2, elbowF: 1.5, expr: 'worried' }], ['pri', { kneel: 1, expr: 'sad', armF: -1.4, elbowF: .6 }]] as const;
  const r2 = [['ach', { holdF: 'sword', handF: 'fist', armF: -2.4, elbowF: .3, expr: 'angry' }], ['lao', { holdF: 'staff', expr: 'angry' }], ['cas', { expr: 'scared', armF: -2.2, elbowF: .2 }], ['aen', { expr: 'worried' }], ['scout', { expr: 'excited', walk: 1, run: 1, phase: 1 }], ['sin', { expr: 'worried' }], ['aga', {}], ['greek', { holdF: 'spear', armF: -.4, elbowF: .6 }]] as const;
  return <AbsoluteFill style={{ background: '#efe4cc' }}><svg width={1920} height={1080}>
    <defs><Boil id="b" frame={f} /><radialGradient id="heroGlow"><stop offset="0" stopColor="#fff2a0" stopOpacity=".6" /><stop offset="1" stopColor="#fff2a0" stopOpacity="0" /></radialGradient></defs>
    <g filter="url(#b)">
      {r1.map(([k, p], i) => <MChar key={k} look={CAST[k]} x={110 + i * 225} y={470} s={.85} pose={p as any} />)}
      {r2.map(([k, p], i) => <MChar key={k} look={CAST[k]} x={110 + i * 225} y={830} s={.85} pose={p as any} />)}
      <Chariot x={300} y={1060} s={.45} t={f / 30} driver={trojan(1)} warrior={CAST.hec} />
      <Horse x={1500} y={1060} s={.45} ph={f / 3} />
      {[0, 1, 2, 3].map((i) => <MChar key={i} look={trojan(i)} x={900 + i * 70} y={1060} s={.45} pose={{ holdF: 'spear', armF: -.4, elbowF: .6 }} />)}
      {[0, 1, 2].map((i) => <MChar key={'g' + i} look={greekSoldier(i)} x={1720 + i * 70} y={1060} s={.45} flip pose={{ holdF: 'spear', armF: -.4, elbowF: .6 }} />)}
    </g></svg></AbsoluteFill>;
};
