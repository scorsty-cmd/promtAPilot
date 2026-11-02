#!/bin/bash
# resumable chunked render of Ep01 (video only)
cd "$(dirname "$0")"
TOTAL=$(python3 -c "import json;print(json.load(open('src/ep01/timeline.json'))['frames'])")
CH=600
mkdir -p chunks
npx remotion bundle src/index.tsx --out-dir=out/bundle > /dev/null 2>&1 || true
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  n=$(printf "%05d" $a)
  [ -f chunks/c$n.mp4 ] && continue
  npx remotion render out/bundle Ep01 chunks/tmp_c$n.mp4 --frames=$a-$b --browser-executable=/usr/bin/google-chrome --codec=h264 --crf=18 --x264-preset=veryfast --concurrency=2 --muted --log=error && mv chunks/tmp_c$n.mp4 chunks/c$n.mp4
  echo "done $a-$b $(date +%T)"
done
echo ALLDONE
