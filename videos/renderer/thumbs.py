# 3 thumbnail options (1280x720) on real graded photos.
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
TW, TH = 1280, 720
A1 = (255, 196, 61); A2 = (64, 156, 255); RED = (255, 77, 109); TXT = (248, 248, 252)
FD = '/usr/share/fonts/opentype/inter/'
def F(n, s): return ImageFont.truetype(FD + n, s)

def base(key, blur=None, fx=0.5, fy=0.5, zoom=1.0, blurrect=None):
    a = cv2.cvtColor(cv2.imread(f'photos/{key}.jpg'), cv2.COLOR_BGR2RGB)
    h, w = a.shape[:2]
    if blurrect:
        x0, y0, x1, y1 = blurrect; a[int(y0*h):int(y1*h), int(x0*w):int(x1*w)] = cv2.GaussianBlur(a[int(y0*h):int(y1*h), int(x0*w):int(x1*w)], (0, 0), 25)
    s = max(TW / w, TH / h) * zoom
    a = cv2.resize(a, (int(w * s) + 1, int(h * s) + 1), interpolation=cv2.INTER_CUBIC)
    x = int((a.shape[1] - TW) * fx); y = int((a.shape[0] - TH) * fy); a = a[y:y + TH, x:x + TW]
    x = a.astype(np.float32) / 255
    L = (x * np.array([.299, .587, .114])).sum(2, keepdims=True)
    x = L + (x - L) * 1.05; x = np.clip((x - .5) * 1.22 + .5, 0, 1)
    x += (1 - L) ** 2 * (np.array(A2) / 255 - .4) * .18 + L ** 2 * (np.array(A1) / 255 - .5) * .12
    yy, xx = np.mgrid[0:TH, 0:TW].astype(np.float32)
    v = 1 - 0.55 * (((xx - TW * .6) / TW) ** 2 + ((yy - TH * .5) / TH) ** 2) * 1.6
    x *= np.clip(v, .3, 1)[..., None]
    im = Image.fromarray(np.clip(x * 255, 0, 255).astype(np.uint8))
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    return im.convert('RGBA')

def shade_left(im, k=210, frac=.62):
    g = np.zeros((TH, TW, 4), np.uint8); g[..., :3] = (6, 7, 14)
    xs = np.linspace(0, 1, TW); g[..., 3] = (np.clip(1 - xs / frac, 0, 1) ** 1.3 * k).astype(np.uint8)[None, :]
    im.alpha_composite(Image.fromarray(g, 'RGBA'))

def big_text(im, lines, x, y, size, cols, glow=True, maxw=760):
    d = ImageDraw.Draw(im); lh = int(size * .98)
    fs = []
    for s in lines:
        f = F('InterDisplay-Black.otf', size)
        while d.textlength(s, font=f) > maxw: f = F('InterDisplay-Black.otf', f.size - 4)
        fs.append(f)
    if glow:
        gl = Image.new('RGBA', (TW, TH), (0, 0, 0, 0)); gd = ImageDraw.Draw(gl)
        for i, s in enumerate(lines): gd.text((x, y + i * lh), s, font=fs[i], fill=cols[i] + (200,))
        im.alpha_composite(gl.filter(ImageFilter.GaussianBlur(18)))
    for i, s in enumerate(lines):
        d.text((x, y + i * lh), s, font=fs[i], fill=cols[i], stroke_width=5, stroke_fill=(0, 0, 0))

def pill(im, text, x, y, col, fg=(10, 10, 16), size=40, rot=0):
    f = F('InterDisplay-Black.otf', size); tmp = ImageDraw.Draw(im); w = int(tmp.textlength(text, font=f)) + size
    p = Image.new('RGBA', (w + 20, int(size * 1.7) + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(p)
    d.rounded_rectangle([10, 10, w + 10, int(size * 1.7) + 10], 14, fill=col)
    d.text((w / 2 + 10, size * .85 + 10), text, font=f, fill=fg, anchor='mm')
    if rot: p = p.rotate(rot, expand=True, resample=Image.BICUBIC)
    im.alpha_composite(p, (x, y))

def tag(im, text, x, y, size=150, rot=-8):
    # price-tag stamp
    f = F('InterDisplay-Black.otf', size); tmp = ImageDraw.Draw(im); w = int(tmp.textlength(text, font=f)) + 120; h = int(size * 1.35)
    p = Image.new('RGBA', (w + 40, h + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(p)
    d.rounded_rectangle([20, 20, w + 20, h + 20], 28, fill=A1 + (255,))
    d.ellipse([44, h / 2 + 2, 76, h / 2 + 34], fill=(10, 10, 16))
    d.text((w / 2 + 40, h / 2 + 20), text, font=f, fill=(10, 10, 16), anchor='mm')
    sh = Image.new('RGBA', p.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([30, 34, w + 30, h + 34], 28, fill=(0, 0, 0, 170))
    q = Image.new('RGBA', p.size, (0, 0, 0, 0)); q.alpha_composite(sh.filter(ImageFilter.GaussianBlur(12))); q.alpha_composite(p)
    q = q.rotate(rot, expand=True, resample=Image.BICUBIC)
    im.alpha_composite(q, (x, y))

# A: night traffic, "NOT RANDOM" + $? tag
im = base('traffic_1', fx=.5)
shade_left(im)
pill(im, 'YOUR UBER PRICE', 56, 70, TXT, size=44)
big_text(im, ['NOT', 'RANDOM'], 50, 190, 200, [TXT, A1])
tag(im, '$ ?', 860, 360, size=150)
im.convert('RGB').save('thumbnail_1_not_random.jpg', quality=92)

# B: dashboard at night, "SAME TRIP. NEW PRICE."
im = base('carint_0', fx=.4); shade_left(im, 200, .7)
pill(im, 'THE ALGORITHM', 56, 70, A2, fg=TXT, size=40)
big_text(im, ['SAME LENGTH.', 'NEW PRICE.'], 50, 200, 150, [TXT, A1], maxw=820)
d = ImageDraw.Draw(im)
for i, (v, c) in enumerate([('$14', (200, 205, 220)), ('$19', A1)]):
    f = F('InterDisplay-Black.otf', 110); x = 1010; y = 180 + i * 200
    d.text((x, y), v, font=f, fill=c, stroke_width=5, stroke_fill=(0, 0, 0))
d.line([1000, 250, 1215, 228], fill=RED, width=12)
im.convert('RGB').save('thumbnail_2_same_length.jpg', quality=92)

# C: London light trails, "WHO SETS YOUR FARE?"
im = base('london_0', fx=.55); shade_left(im, 215, .66)
pill(im, '1.5M TRIPS STUDIED', 56, 70, A1, size=40)
big_text(im, ['WHO SETS', 'YOUR FARE?'], 50, 200, 150, [TXT, A1], maxw=800)
im.convert('RGB').save('thumbnail_3_who_sets.jpg', quality=92)
for n in ('thumbnail_1_not_random.jpg', 'thumbnail_2_same_length.jpg', 'thumbnail_3_who_sets.jpg'):
    print(n)
