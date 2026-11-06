#!/bin/bash
cd /home/claude/einstein
for r in "0 3752 c0" "3753 7505 c1" "7506 11258 c2" "11259 15013 c3"; do set -- $r
  [ -f chunks/$3.mp4 ] && continue
  node render.mjs $1 $2 chunks/$3.tmp.mp4 > chunks/$3.log 2>&1 && mv chunks/$3.tmp.mp4 chunks/$3.mp4 || { echo FAIL $3; exit 1; }
done
echo ALLDONE
