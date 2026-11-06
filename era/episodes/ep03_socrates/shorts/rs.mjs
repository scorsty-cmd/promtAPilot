// node shorts/rs.mjs <compId> <out.mp4>  — render a Short with audio
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, renderStill } from '@remotion/renderer';
import path from 'path';
const [id, out, still] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const o = { chromiumOptions: { gl: 'angle' }, browserExecutable: '/usr/bin/google-chrome' };
const comp = await selectComposition({ serveUrl, id, ...o });
if (still) { for (const s of still.split(',')) await renderStill({ serveUrl, composition: comp, frame: Math.round(+s * 30), output: `${out}_${s}.png`, ...o }); process.exit(0); }
const t0 = Date.now();
await renderMedia({ serveUrl, composition: comp, codec: 'h264', crf: 18, x264Preset: 'medium', audioCodec: 'aac', outputLocation: out, concurrency: 2, timeoutInMilliseconds: 120000, ...o,
  onProgress: ({ renderedFrames }) => { if (renderedFrames % 150 === 0) console.log('frames', renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + 's'); } });
console.log('done', out);
