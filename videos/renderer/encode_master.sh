set -e
ffmpeg -y -loglevel error -i video_noaudio.mp4 -i mix.wav -c:v libx264 -preset veryfast -crf 20 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart HiddenLayer_Uber_Pricing_full.mp4
echo FULL_DONE
python3 - <<'P'
import subprocess, os
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','HiddenLayer_Uber_Pricing_full.mp4']))
vk=max(250,int(27.5*1024*1024*8/dur/1000)-128-15)
c=['-c:v','libx264','-preset','faster','-b:v',f'{vk}k','-pix_fmt','yuv420p','-vf','hqdn3d=2:2:3:3']
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','HiddenLayer_Uber_Pricing_full.mp4']+c+['-pass','1','-passlogfile','x264pass','-an','-f','mp4',os.devnull],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','HiddenLayer_Uber_Pricing_full.mp4']+c+['-pass','2','-passlogfile','x264pass','-c:a','aac','-b:a','128k','-movflags','+faststart','HiddenLayer_Uber_Pricing.mp4'],check=True)
print('SMALL_DONE', os.path.getsize('HiddenLayer_Uber_Pricing.mp4')/1048576)
P
