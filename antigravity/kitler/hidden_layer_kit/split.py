# Split <slug>_full.mp4 into <=28 MB parts plus BIRLESTIR_cift_tikla.bat (Windows: double-click joins them back into
# <slug>.mp4 with identical bytes). Usage: python3 split.py <slug>   -> folder parts_<slug>/
import sys, os
slug = sys.argv[1]; src = f'{slug}_full.mp4'; out = f'parts_{slug}'
os.makedirs(out, exist_ok=True)
CH = 28 * 1024 * 1024
names = []
with open(src, 'rb') as f:
    i = 1
    while True:
        b = f.read(CH)
        if not b: break
        n = f'{slug}.part{i:02d}'; open(os.path.join(out, n), 'wb').write(b); names.append(n); i += 1
bat = ('@echo off\r\ncd /d "%~dp0"\r\ncopy /b ' + '+'.join(names) + f' "{slug}.mp4"\r\n'
       f'echo.\r\necho Hazir: {slug}.mp4\r\npause\r\n')
open(os.path.join(out, 'BIRLESTIR_cift_tikla.bat'), 'w', newline='').write(bat)
print(out, names)
