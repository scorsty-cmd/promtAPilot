#!/bin/bash
# kit v4 renderer: run TWO of these (W=0 and W=1) — each owns one Chrome (its single-threaded GPU process was the bottleneck)
cd "$(dirname "$0")"
W=$1; NW=${2:-2}
TOTAL=$(python3 -c "import json;print(json.load(open('src/ep02/timeline.json'))['frames'])")
CH=300
mkdir -p chunks2
i=0
for ((a=0; a<TOTAL; a+=CH)); do
  if (( i % NW != W )); then i=$((i+1)); continue; fi
  i=$((i+1))
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  n=$(printf "%05d" $a)
  [ -f chunks2/c$n.mp4 ] && continue
  npx remotion render out/bundle2 Ep02 chunks2/tmp_c$n.mp4 --frames=$a-$b --browser-executable=$PWD/chrome-nogpu.sh --gl=swiftshader --codec=h264 --crf=18 --x264-preset=veryfast --concurrency=1 --timeout=120000 --muted --log=error && mv chunks2/tmp_c$n.mp4 chunks2/c$n.mp4
  echo "w$W done $a-$b $(date +%T)"
done
echo "w$W ALLDONE"
