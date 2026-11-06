#!/bin/bash
cd /home/claude/socrates
for r in "0 3639 c0" "3640 7279 c1" "7280 10919 c2" "10920 14564 c3"; do set -- $r
  [ -f chunks/$3.mp4 ] && continue
  node render.mjs $1 $2 chunks/$3.tmp.mp4 > chunks/$3.log 2>&1 && mv chunks/$3.tmp.mp4 chunks/$3.mp4 || { echo FAIL $3; exit 1; }
done
echo ALLDONE
