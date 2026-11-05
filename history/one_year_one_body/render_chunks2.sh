#!/bin/bash
# resumable chunked render of Ep02 (video only)
cd "$(dirname "$0")"
TOTAL=$(python3 -c "import json;print(json.load(open('src/ep02/timeline.json'))['frames'])")
CH=600
mkdir -p chunks2
npx remotion bundle src/index.tsx --out-dir=out/bundle2 > /dev/null 2>&1 || true
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  n=$(printf "%05d" $a)
  [ -f chunks2/c$n.mp4 ] && continue
  npx remotion render out/bundle2 Ep02 chunks2/tmp_c$n.mp4 --frames=$a-$b --browser-executable=$PWD/chrome-nogpu.sh --codec=h264 --crf=18 --x264-preset=veryfast --concurrency=2 --timeout=120000 --gl=swiftshader --muted --log=error && mv chunks2/tmp_c$n.mp4 chunks2/c$n.mp4
  echo "done $a-$b $(date +%T)"
done
echo ALLDONE
