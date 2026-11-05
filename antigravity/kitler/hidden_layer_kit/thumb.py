# Thumbnail 1280x720 from scenes.THUMB:
# THUMB = dict(top='5 FREE AI TOOLS', big=['FEELS', 'ILLEGAL'], stamp='FREE', badge='AI')
# Optional: big_color 'A1'|'A2'|'A3', stamp_color, layout 'left' (default) or 'center' (no stamp/badge)
import sys
sys.argv = ['x']
src = open('render.py').read().split('# ------------------------------------------------------------------ timeline')[0]
exec(src)
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
T = S.THUMB
TW, TH = 1280, 720
col = lambda k, d: globals()[T.get(k, d)]
bg = np.zeros((TH, TW, 3), np.float32) + np.array(BG, np.float32)
y, x = np.mgrid[0:TH, 0:TW].astype(np.float32)
def glow(cx, cy, r, c, k): return np.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r)))[..., None] * np.array(c, np.float32) * k
bg += glow(150, 100, 380, A2, .55) + glow(1150, 650, 420, A1, .35)
im = Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8)).convert('RGBA'); d = ImageDraw.Draw(im)
BIGC = col('big_color', 'A1')
center = T.get('layout') == 'center'
maxw = 1180 if center else 760

def fit(s, kind, size, mw):
    f = font(kind, size)
    while d.textlength(s, font=f) > mw and size > 40: size -= 6; f = font(kind, size)
    return f

top = T.get('top', '')
ftop = fit(top, 'black', 96, maxw)
big = T['big']
fbig = min((fit(s, 'black', 175 if len(big) <= 2 else 140, maxw) for s in big), key=lambda f: f.size)
lh = int(fbig.size * .94)
y0 = 80 + (ftop.size + 40 if top else 0)
ax = (TW // 2) if center else 60
anchor = 'ma' if center else 'la'
glowL = Image.new('RGBA', (TW, TH), (0, 0, 0, 0)); gd = ImageDraw.Draw(glowL)
for i, s in enumerate(big): gd.text((ax, y0 + i * lh), s, font=fbig, fill=BIGC + (255,), anchor=anchor)
im.alpha_composite(glowL.filter(ImageFilter.GaussianBlur(22)))
if top: d.text((ax + (0 if center else 4), 80), top, font=ftop, fill=TXT, stroke_width=3, stroke_fill=(0, 0, 0), anchor=anchor)
for i, s in enumerate(big): d.text((ax, y0 + i * lh), s, font=fbig, fill=BIGC, stroke_width=4, stroke_fill=(0, 0, 0), anchor=anchor)
if not center:
    if T.get('stamp'):
        SC = col('stamp_color', 'A3')
        fs = fit(T['stamp'], 'black', 120, 440)
        st = Image.new('RGBA', (520, 200), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
        sd.rounded_rectangle([8, 8, 512, 192], 22, outline=SC + (255,), width=12)
        sd.text((260, 100), T['stamp'], font=fs, fill=SC, anchor='mm')
        st = st.rotate(14, expand=True, resample=Image.BICUBIC)
        im.alpha_composite(st, (790, 40))
    if T.get('badge'):
        cd = ImageDraw.Draw(im)
        cd.rounded_rectangle([870, 420, 1220, 650], 30, fill=(30, 35, 58, 255), outline=A2 + (255,), width=5)
        fb = fit(T['badge'], 'black', 150, 300)
        cd.text((1045, 535), T['badge'], font=fb, fill=TXT, anchor='mm')
im.convert('RGB').save('thumbnail.jpg', quality=92)
print('thumbnail.jpg written')
