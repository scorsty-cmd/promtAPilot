cd /home/claude/socrates
until grep -q ALLDONE /tmp/claude-0/-home-claude/5781a22a-b2e5-566e-9435-fdda96e6b81b/tasks/bwnfuajpw.output 2>/dev/null; do sleep 10; done
for x in A B C; do [ -f shorts/raw_$x.mp4 ] || node shorts/rs.mjs Short$x shorts/raw_$x.mp4 > shorts/S$x.log 2>&1; done; echo FINALDONE
