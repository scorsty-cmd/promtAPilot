import json,sys
T=json.load(open('src/ep01/timeline.json'))
ids=sys.argv[1].split(',') if len(sys.argv)>1 and sys.argv[1] else None
fr=[float(x) for x in (sys.argv[2].split(',') if len(sys.argv)>2 else ['0.3','0.8'])]
out=[]
for s in T['shots']:
    if ids and not any(s['id'].startswith(i) for i in ids): continue
    for q in fr: out.append(str(int(s['start']+(s['end']-s['start'])*q)))
print(' '.join(out))
