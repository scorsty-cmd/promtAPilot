import React from 'react';
import { Composition } from 'remotion';
import { Sheet } from './Sheet';
import { FPS, TOTAL } from './lib';
let Video: any = null; try { Video = require('./Video').Video; } catch (e) {}
let Thumb: any = null; try { Thumb = require('./Thumb').Thumb; } catch (e) {}
let SH: any = null; try { SH = require('./Short'); } catch (e) {}
export const Root: React.FC = () => <>
  {Video && <Composition id="Spartacus" component={Video} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />}
  {Thumb && <Composition id="Thumb" component={Thumb} durationInFrames={30} fps={FPS} width={1280} height={720} />}
  <Composition id="Sheet" component={Sheet} durationInFrames={60} fps={FPS} width={1920} height={1080} />
</>;
