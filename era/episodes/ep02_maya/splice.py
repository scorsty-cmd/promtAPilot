import subprocess
R=[(1821,2009),(2796,3146),(3816,4061),(9012,9614),(10953,11204),(11547,11822),(12030,12320),(13200,13493),(13755,14072),(14283,14588)]
TOT=14754
inp=['-i','out/if_you_were_born_maya.mp4']+sum([['-i',f'fix/f{i+1}.mp4'] for i in range(len(R))],[])
keep=[];prev=0
for s,e in R: keep.append((prev,s)); prev=e+1
keep.append((prev,TOT))
fl=[f"[0:v]split={len(keep)}"+''.join(f'[s{i}]' for i in range(len(keep)))]
order=[]
for i,(a,b) in enumerate(keep):
    fl.append(f"[s{i}]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS[k{i}]"); order.append(f'[k{i}]')
    if i<len(R): fl.append(f"[{i+1}:v]setpts=PTS-STARTPTS[x{i}]"); order.append(f'[x{i}]')
fl.append(''.join(order)+f"concat=n={len(order)}:v=1:a=0[v]")
cmd=['ffmpeg','-hide_banner','-loglevel','error','-y',*inp,'-i','public/mix.wav','-filter_complex',';'.join(fl),'-map','[v]','-map',f'{len(R)+1}:a',
 '-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','out/maya_final.mp4']
subprocess.run(cmd,check=True); print('ok')
