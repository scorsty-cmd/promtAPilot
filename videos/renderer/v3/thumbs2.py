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

# A: "$315 to cancel" + redaction bar over "monthly" plan + taped cash/calculator photo
im = paper().convert('RGBA'); d = ImageDraw.Draw(im)
d.text((130, 40), 'THE FINE PRINT', font=F('mono', 26), fill=MUTED)
d.text((120, 70), '$315', font=F('serif', 300), fill=INK)
f = F('ital', 150); d.text((130, 360), 'to ', font=F('serif', 150), fill=INK); x = 130 + F('serif', 150).getlength('to ')
d.rectangle([x - 10, 400, x + f.getlength('cancel') + 14, 530], fill=HL); d.text((x, 360), 'cancel', font=f, fill=INK)
d.text((134, 560), 'a "monthly" plan', font=F('serif', 80), fill=INK); d.rectangle([300, 582, 560, 652], fill=INK)
shadowed(im, taped('calculator', 430, 330, -4), 790, 250)
grain(im).save('thumb_A.jpg', quality=92)

# B: "1 click in. $315 out." with signing photo
im = paper().convert('RGBA'); d = ImageDraw.Draw(im)
d.text((130, 40), 'THE FINE PRINT', font=F('mono', 26), fill=MUTED)
d.text((130, 80), '1 click in.', font=F('serif', 170), fill=INK)
f = F('ital', 210); d.rectangle([120, 330, 130 + f.getlength('$315') + 20, 520], fill=HL); d.text((130, 270), '$315', font=f, fill=INK)
d.text((130 + f.getlength('$315 ') + 10, 330), 'out.', font=F('serif', 170), fill=INK)
d.text((134, 590), 'early termination fee · 50% of the', font=F('mono', 30), fill=INK); d.rectangle([134, 640, 640, 676], fill=INK)
shadowed(im, taped('pen', 380, 300, 5), 850, 330)
grain(im).save('thumb_B_opt.jpg', quality=92)

# C: "The fee to leave" + receipt
im = paper().convert('RGBA'); d = ImageDraw.Draw(im)
d.text((130, 40), 'THE FINE PRINT', font=F('mono', 26), fill=MUTED)
d.text((130, 90), 'The fee', font=F('serif', 190), fill=INK)
f = F('ital', 190); x = 130 + F('serif', 190).getlength('to ')
d.text((130, 290), 'to ', font=F('serif', 190), fill=INK); d.rectangle([x - 10, 345, x + f.getlength('leave') + 16, 500], fill=HL); d.text((x, 290), 'leave', font=f, fill=INK)
d.text((134, 560), 'Annual plan, paid monthly', font=F('serif', 64), fill=INK); d.rectangle([360, 578, 700, 636], fill=INK)
rc = Image.new('RGBA', (400, 520), (0, 0, 0, 0)); r = ImageDraw.Draw(rc)
r.polygon([(0, 0), (400, 0), (400, 500)] + [(400 - k * 20, 500 + (12 if k % 2 else 0)) for k in range(21)] + [(0, 500)], fill=(248, 247, 242, 255))
r.text((200, 50), 'CANCELLATION', font=F('mono', 30), fill=INK, anchor='mm')
for k, (a, b) in enumerate([('Months left', '9'), ('Monthly fee', '$69.99'), ('Fee rate', '50%')]):
    r.text((24, 110 + k * 50), a, font=F('mono', 24), fill=INK); r.text((376, 110 + k * 50), b, font=F('mono', 24), fill=INK, anchor='ra')
r.text((24, 280), '- - - - - - - - - - - - - -', font=F('mono', 24), fill=MUTED)
r.rectangle([90, 330, 390, 430], fill=HL); r.text((380, 320), '$314.96', font=F('serif', 100), fill=INK, anchor='ra')
r.text((24, 455), 'EXAMPLE', font=F('mono', 24), fill=MUTED)
rc = rc.rotate(-3, expand=True, resample=Image.BICUBIC); shadowed(im, rc, 840, 120)
grain(im).save('thumb_C.jpg', quality=92)
for n in ('thumb_A.jpg', 'thumb_B_opt.jpg', 'thumb_C.jpg'):
    Image.open(n).resize((160, 90), Image.LANCZOS).save('small_' + n)
print('ok')
