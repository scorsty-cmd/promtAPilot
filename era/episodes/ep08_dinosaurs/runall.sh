#!/bin/bash
cd /home/claude/dino2
for r in "0 1443 c0" "1444 2887 c1" "2888 4331 c2" "4332 5775 c3" "5776 7219 c4" "7220 8663 c5" "8664 10107 c6" "10108 11551 c7" "11552 12995 c8" "12996 14440 c9"; do set -- $r
  [ -f chunks/$3.mp4 ] && continue
  node render.mjs $1 $2 chunks/$3.tmp.mp4 > chunks/$3.log 2>&1 && mv chunks/$3.tmp.mp4 chunks/$3.mp4 || { echo FAIL $3; exit 1; }
done
echo ALLDONE
