#!/bin/bash
cd /home/claude/maya
for r in "0 3699 c0" "3700 7399 c1" "7400 11099 c2" "11100 14753 c3"; do set -- $r
  [ -f chunks/$3.mp4 ] && continue
  node render.mjs $1 $2 chunks/$3.tmp.mp4 > chunks/$3.log 2>&1 && mv chunks/$3.tmp.mp4 chunks/$3.mp4 || { echo FAIL $3; exit 1; }
done
echo ALLDONE
