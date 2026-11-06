// resumable chunk render: node render.mjs <start> <end> <out>
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const [s, e, out] = process.argv.slice(2);
const serveUrl = process.env.BUNDLE || await bundle({ entryPoint: path.resolve('src/index.ts') });

let browserExecutable = undefined;
if (process.platform === 'win32') {
  const winChrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (fs.existsSync(winChrome)) browserExecutable = winChrome;
} else if (fs.existsSync('/usr/bin/google-chrome')) {
  browserExecutable = '/usr/bin/google-chrome';
}

const o = {
  chromiumOptions: { gl: 'angle' },
  ...(browserExecutable ? { browserExecutable } : {})
};

const inputProps = process.env.CLEAN ? { clean: true } : {};
const comp = await selectComposition({ serveUrl, id: 'Zombies', inputProps, ...o });
const t0 = Date.now();

await renderMedia({
  serveUrl,
  composition: comp,
  codec: 'h264',
  crf: 16,
  x264Preset: 'veryfast',
  muted: true,
  frameRange: [+s, +e],
  inputProps,
  outputLocation: out,
  concurrency: 2,
  timeoutInMilliseconds: 120000,
  ...o,
  onProgress: ({ renderedFrames }) => {
    if (renderedFrames % 30 === 0) {
      console.log('frames', renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
  }
});
console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
