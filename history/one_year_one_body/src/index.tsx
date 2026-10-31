import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ToothacheTest} from './Scene';
import {BarberScene} from './BarberScene';

const Root: React.FC = () => (
  <>
    <Composition id="ToothacheTest" component={ToothacheTest} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition id="BarberScene" component={BarberScene} durationInFrames={360} fps={30} width={1920} height={1080} />
  </>
);

registerRoot(Root);
