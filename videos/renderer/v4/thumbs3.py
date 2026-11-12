import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1280, 720
PAPER = (236, 232, 222); INK = (18, 19, 22); HL = (228, 255, 60); MUTED = (138, 135, 126); RULE = (215, 210, 198)
def F(k, s): return ImageFont.truetype('fonts/' + {'serif': 'InstrumentSerif-Regular.ttf', 'ital': 'InstrumentSerif-Italic.ttf', 'mono': 'IBMPlexMono-Medium.ttf'}[k], s)
from photo_map import PHOTO_MAP

def paper():
    rng = np.random.default_rng(5); a = np.full((H, W, 3), PAPER, np.float32) + rng.normal(0, 2.5, (H, W, 1))
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    d.line([(100, 0), (100, H)], fill=RULE, width=2); return im

def taped(key, w, h, rot):
    im = Image.open('photos/' + PHOTO_MAP[key]).convert('RGB')
    sc = max(w / im.width, h / im.height); im = im.resize((int(im.width * sc) + 1, int(im.height * sc) + 1))
    im = im.crop(((im.width - w) // 2, (im.height - h) // 2, (im.width - w) // 2 + w, (im.height - h) // 2 + h))
    a = np.asarray(im).astype(np.float32); g = a.mean(2, keepdims=True); a = a * .7 + g * .3; a = a * [1.03, 1, .94]
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    fr = Image.new('RGBA', (w + 24, h + 24), (250, 248, 242, 255)); fr.paste(im, (12, 12))
    d = ImageDraw.Draw(fr); d.rectangle([w / 2 - 70, 0, w / 2 + 70, 26], fill=(225, 220, 200, 220))
    return fr.rotate(rot, expand=True, resample=Image.BICUBIC)

def shadowed(base, lay, x, y):
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0)); m = lay.split()[3].point(lambda v: 110 if v else 0)
    sh.paste((0, 0, 0, 255), (x + 10, y + 16), m); sh = sh.filter(ImageFilter.GaussianBlur(14))
    base.alpha_composite(sh); base.alpha_composite(lay, (x, y))

def grain(im):
    n = Image.effect_noise(im.size, 64).convert('RGB'); return Image.blend(im.convert('RGB'), n, .05)


def tag(val, sub, w=330, h=110, hl=False):
    im = Image.new('RGBA', (w + 6, h + 6), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.polygon([(34, 0), (w, 0), (w, h), (34, h), (0, h / 2)], fill=(HL if hl else (248, 246, 240)) + (255,), outline=INK)
    d.ellipse([20, h / 2 - 8, 36, h / 2 + 8], outline=INK, width=3)
    d.text((56, 10), sub, font=F('mono', 18), fill=INK if hl else MUTED); d.text((56, 28), val, font=F('serif', 74), fill=INK)
    return im.rotate(-3, expand=True, resample=Image.BICUBIC)

# A: "Same eggs. 5 prices." + taped eggs photo + two tags
im = paper().convert('RGBA'); d = ImageDraw.Draw(im)
d.text((130, 40), 'THE ALGORITHM', font=F('mono', 26), fill=MUTED)
d.text((125, 70), 'Same eggs.', font=F('serif', 175), fill=INK)
f = F('ital', 190); d.rectangle([118, 320, 140 + f.getlength('5 prices.') + 10, 500], fill=HL); d.text((130, 262), '5 prices.', font=f, fill=INK)
fs = F('serif', 72); d.text((134, 560), 'set using your data', font=fs, fill=INK); bx = 134 + fs.getlength('set using '); d.rectangle([bx - 4, 578, bx + fs.getlength('your data') + 8, 646], fill=INK)
shadowed(im, taped('eggs', 380, 420, 4), 840, 90)
t = tag('$3.99', 'SHOPPER A'); shadowed(im, t, 800, 470)
t = tag('$4.79', 'SHOPPER E', hl=True); shadowed(im, t, 930, 560)
grain(im).save('thumb_A.jpg', quality=92)

# B: big price jump
im = paper().convert('RGBA'); d = ImageDraw.Draw(im)
d.text((130, 40), 'THE ALGORITHM', font=F('mono', 26), fill=MUTED)
d.text((125, 60), '$3.99', font=F('serif', 200), fill=INK)
d.line([(125, 185), (125 + F('serif', 200).getlength('$3.99'), 165)], fill=INK, width=12)
f = F('ital', 230); d.rectangle([118, 330, 140 + f.getlength('$4.79') + 10, 545], fill=HL); d.text((130, 262), '$4.79', font=f, fill=INK)
fm = F('mono', 34); d.text((134, 590), 'same eggs · set by your data', font=fm, fill=INK); bx = 134 + fm.getlength('same eggs · set by '); d.rectangle([bx - 4, 592, bx + fm.getlength('your data') + 6, 636], fill=INK)
shadowed(im, taped('eggs', 430, 470, -4), 760, 120)
grain(im).save('thumb_B_opt.jpg', quality=92)

# C: "Priced for you?" + price tag photo
im = paper().convert('RGBA'); d = ImageDraw.Draw(im)
d.text((130, 40), 'THE ALGORITHM', font=F('mono', 26), fill=MUTED)
d.text((125, 80), 'Priced', font=F('serif', 200), fill=INK)
f = F('ital', 200); d.rectangle([118, 345, 140 + f.getlength('for you?') + 10, 535], fill=HL); d.text((130, 280), 'for you?', font=f, fill=INK)
d.text((134, 585), 'THIS PRICE WAS SET BY AN ALGORITHM', font=F('mono', 27), fill=INK); d.rectangle([134, 630, 640, 664], fill=INK)
shadowed(im, taped('tags', 400, 330, 4), 820, 200)
grain(im).save('thumb_C.jpg', quality=92)
for n in ('thumb_A.jpg', 'thumb_B_opt.jpg', 'thumb_C.jpg'):
    Image.open(n).resize((160, 90), Image.LANCZOS).save('small_' + n)
print('ok')
