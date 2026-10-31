import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ToothacheTest} from './Scene';

const Root: React.FC = () => (
  <Composition id="ToothacheTest" component={ToothacheTest} durationInFrames={300} fps={30} width={1920} height={1080} />
);

registerRoot(Root);
