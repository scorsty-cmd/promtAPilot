import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ToothacheTest} from './Scene';
import {BarberScene} from './BarberScene';
import {Episode} from './ep01/Episode';
import TL from './ep01/timeline.json';
import {Thumb} from './ep01/Thumb';
import {Episode as Episode2} from './ep02/Episode';
import TL2 from './ep02/timeline.json';
import {Thumb2} from './ep02/Thumb';

const shots = (TL as any).shots as {ch: number; start: number; end: number}[];
const chapters = Array.from(new Set(shots.map((s) => s.ch)));

const Root: React.FC = () => (
  <>
    <Composition id="ToothacheTest" component={ToothacheTest} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition id="BarberScene" component={BarberScene} durationInFrames={360} fps={30} width={1920} height={1080} />
    <Composition id="Ep01" component={Episode} durationInFrames={(TL as any).frames} fps={30} width={1920} height={1080} defaultProps={{offset: 0}} />
    {(['A', 'B', 'C'] as const).map((v) => <Composition key={v} id={`Thumb${v}`} component={Thumb} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{v}} />)}
    {chapters.map((c) => {
      const s = shots.filter((x) => x.ch === c);
      const a = s[0].start, b = s[s.length - 1].end;
      return <Composition key={c} id={`Ep01Ch${c}`} component={Episode} durationInFrames={b - a} fps={30} width={1920} height={1080} defaultProps={{offset: a}} />;
    })}
    <Composition id="Ep02" component={Episode2} durationInFrames={(TL2 as any).frames} fps={30} width={1920} height={1080} defaultProps={{offset: 0}} />
    {(['A', 'B', 'C'] as const).map((v) => <Composition key={`t2${v}`} id={`Thumb2${v}`} component={Thumb2} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{v}} />)}
  </>
);
registerRoot(Root);
