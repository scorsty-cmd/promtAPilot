# Mux video + audio. Writes <slug>_full.mp4 (full quality, for YouTube) and <slug>.mp4 (<= ~28 MB, so it can be
# sent through the chat file card, which has a 30 MB limit). Usage: python3 deliver.py <slug>
import sys, subprocess, json, os
slug = sys.argv[1]
full = f'{slug}_full.mp4'; small = f'{slug}.mp4'
run = lambda c: subprocess.run(c, check=True)
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'video_noaudio.mp4', '-i', 'mix.wav', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
     '-shortest', '-movflags', '+faststart', full])
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', full]))
target_bits = 27.5 * 1024 * 1024 * 8
vk = max(250, int(target_bits / dur / 1000) - 128 - 15)   # video kbps
if os.path.getsize(full) <= 28 * 1048576:
    import shutil; shutil.copy(full, small); print(full, 'already small enough; copied to', small); sys.exit(0)
common = ['-c:v', 'libx264', '-preset', 'medium', '-tune', 'animation', '-b:v', f'{vk}k', '-pix_fmt', 'yuv420p']
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', full] + common + ['-pass', '1', '-passlogfile', 'x264pass', '-an', '-f', 'mp4', os.devnull])
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', full] + common + ['-pass', '2', '-passlogfile', 'x264pass', '-c:a', 'aac', '-b:a', '128k',
     '-movflags', '+faststart', small])
for f in (full, small):
    print(f, round(os.path.getsize(f) / 1048576, 1), 'MB', round(dur, 1), 's')
