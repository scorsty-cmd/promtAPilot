// resumable chunk render: node render.mjs <start> <end> <out>
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
const [s, e, out] = process.argv.slice(2);
const serveUrl = process.env.BUNDLE || await bundle({ entryPoint: path.resolve('src/index.ts') });
const o = { chromiumOptions: { gl: (process.env.GL || 'angle') }, browserExecutable: process.env.CHROME || '/usr/bin/google-chrome' };
const inputProps = process.env.CLEAN ? { clean: true } : {};
const comp = await selectComposition({ serveUrl, id: process.env.COMP || 'Alexander', inputProps, ...o });
const t0 = Date.now();
await renderMedia({ serveUrl, composition: comp, codec: 'h264', crf: 16, x264Preset: 'veryfast', muted: true, frameRange: [+s, +e], inputProps, outputLocation: out, concurrency: +(process.env.CONC || 2), timeoutInMilliseconds: 120000, ...o,
  onProgress: ({ renderedFrames }) => { if (renderedFrames % 30 === 0) console.log('frames', renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + 's'); } });
console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
