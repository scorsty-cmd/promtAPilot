#!/bin/bash
cd /home/claude/troy
for r in "0 3619 c0" "3620 7239 c1" "7240 10859 c2" "10860 14480 c3"; do set -- $r
  [ -f chunks/$3.mp4 ] && continue
  node render.mjs $1 $2 chunks/$3.tmp.mp4 > chunks/$3.log 2>&1 && mv chunks/$3.tmp.mp4 chunks/$3.mp4 || { echo FAIL $3; exit 1; }
done
echo ALLDONE
