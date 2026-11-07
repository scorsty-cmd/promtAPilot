#!/bin/bash
cd /home/claude/archi
for r in "0 3607 c0" "3608 7215 c1" "7216 10823 c2" "10824 14432 c3"; do set -- $r
  [ -f chunks/$3.mp4 ] && continue
  node render.mjs $1 $2 chunks/$3.tmp.mp4 > chunks/$3.log 2>&1 && mv chunks/$3.tmp.mp4 chunks/$3.mp4 || { echo FAIL $3; exit 1; }
done
echo ALLDONE
