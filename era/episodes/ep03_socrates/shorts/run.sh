cd /home/claude/socrates
for r in "A 10638 12155" "B 12135 13430" "C 4698 6353"; do set -- $r; [ -f shorts/clean_$1.mp4 ] || CLEAN=1 node render.mjs $2 $3 shorts/clean_$1.mp4 > shorts/$1.log 2>&1; done; echo ALLDONE
