import sys, json, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, '.')

# reuse fonts, colors, easing and illustrations from the main renderer
_src = open('render.py').read()
exec(_src.split('# ------------------------------------------------------------------ timeline')[0])
exec(_src.split('# ------------------------------------------------------------------ illustrations (760 x 600 box)')[1]
     .split('# ------------------------------------------------------------------ beat builders')[0])
_hl = _src.split('# ------------------------------------------------------------------ helpers')[1].split('# ------------------------------------------------------------------ illustrations')[0]
exec(_hl)

import os
NAME = os.environ.get('SHORT', '')
SUF = ('_' + NAME) if NAME else ''
B = __import__('short_scenes' + SUF).B
W, H, FPS = 1080, 1920, 30
# Reels/TikTok safe zone: keep key content between y=260 and y=1500, x 70..930
durs = json.load(open(f'vos{SUF}/durs.json')); assert len(durs) == len(B)
t = 0.15; starts = []
for i, b in enumerate(B):
    if i: t += 0.35
    starts.append(t); t += durs[i]
TOTAL = t + 1.6
NF = int(TOTAL * FPS)

def make_bg():
    bw, bh = 1400, 2300
    y, x = np.mgrid[0:bh, 0:bw].astype(np.float32)
    img = np.zeros((bh, bw, 3), np.float32) + np.array(BG, np.float32)
    def glow(cx, cy, r, col, k):
        return np.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r)))[..., None] * np.array(col, np.float32) * k
    img += glow(250, 350, 520, A2, .34) + glow(1200, 1900, 620, A1, .18) + glow(700, 1150, 800, (40, 50, 110), .25)
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for gx in range(0, bw, 60):
        for gy in range(0, bh, 60): d.ellipse([gx - 1.5, gy - 1.5, gx + 1.5, gy + 1.5], fill=(34, 38, 60))
    return np.asarray(im)
BGI = make_bg()
def bgf(t):
    ox = int(160 + 140 * math.sin(t * .09)); oy = int(190 + 170 * math.cos(t * .07))
    return BGI[oy:oy + H, ox:ox + W]

def tw(s, f): return ImageDraw.Draw(canvas(1, 1)).textlength(s, font=f)
def text_layer(s, f, col, maxw=940):
    while tw(s, f) > maxw: f = font_like(f, f.size - 6)
    im = canvas(int(tw(s, f)) + 20, int(f.size * 1.25)); ImageDraw.Draw(im).text((10, 0), s, font=f, fill=col); return im
_fk = {}
def font_like(f, size): return ImageFont.truetype(f.path, size)

def centered(im, y, at, **kw): return Layer(im, (W - im.width) // 2, y, at, **kw)

def build(b, dur):
    L = []; k = b['kind']
    if k == 'hook':
        if b['illo'] != 'none':
            L.append(Layer(None, (W - IW) // 2, 250, 0, dyn=('illo', b['illo'])))
            y = 890
        else:
            y = 560
        for i, line in enumerate(b['lines']):
            f = font('black', 150 if i == b['accent'] else 110)
            im = text_layer(line, f, A1 if i == b['accent'] else TXT)
            L.append(centered(im, y, .1 + i * .15, dy=60)); y += int(im.height * .95)
    elif k == 'tool':
        g = canvas(700, 520); gd = ImageDraw.Draw(g)
        gd.text((350, 260), '#' + str(b.get('num', 1)), font=font('black', 420), fill=A1, anchor='mm')
        gl = canvas(700, 520); gl.alpha_composite(g.filter(ImageFilter.GaussianBlur(30))); gl.alpha_composite(g)
        L.append(centered(gl, 300, 0, pop=True))
        L.append(centered(text_layer(b['name'], font('black', 150), TXT), 860, .2, dy=70))
        L.append(centered(text_layer(b['tag'], font('semi', 56), A1), 1060, .35))
        L.append(centered(chip(b.get('by', 'by Google'), A2, 40, fg=TXT, fill_alpha=60), 1180, .5, pop=True))
    elif k == 'point':
        L.append(centered(chip(b['head'].upper(), A1, 40, fill_alpha=40), 280, 0, pop=True))
        f = font('xb', 92); d = ImageDraw.Draw(canvas(1, 1)); lines = wrap(d, b['body'], f, 900)
        y = 410
        for i, ln in enumerate(lines):
            im = text_layer(ln, f, TXT); L.append(centered(im, y, .12 + i * .1)); y += int(f.size * 1.12)
        L.append(Layer(None, (W - IW) // 2, max(y + 50, 760), .2, dyn=('illo', b['illo'])))
    elif k == 'checklist':
        L.append(centered(text_layer(b['head'], font('black', 96), TXT), 300, 0))
        for j, it in enumerate(b['items']):
            im, d = glass(900, 190, 34)
            d.ellipse([40, 45, 140, 145], fill=A1); d.line([(68, 97), (85, 115), (114, 77)], fill=BG, width=12, joint='curve')
            d.text((180, 95), it, font=font('xb', 64), fill=TXT, anchor='lm')
            L.append(centered(im, 480 + j * 230, .2 + j * (dur * .55 / 3), pop=True))
    elif k == 'cta':
        L.append(Layer(None, 0, 0, 0, dyn=('cta', None)))
        L.append(centered(text_layer(b['lines'][0], font('black', 76), TXT), 620, .1, dy=60))
        L.append(centered(text_layer(b['lines'][1], font('semi', 60), MUTED), 760, .3))
    return L

def cta_layer(t):
    im = canvas(W, H); d = ImageDraw.Draw(im)
    s = ease_back(t / .6) * (1 + .03 * math.sin(t * 5)); w, h = 720 * s, 180 * s
    if w > 10:
        rr(d, [W / 2 - w / 2, 1060 - h / 2, W / 2 + w / 2, 1060 + h / 2], int(h / 2), fill=A3)
        d.text((W / 2, 1060), 'FOLLOW', font=font('black', max(1, int(96 * s))), fill=TXT, anchor='mm')
    return im

# captions: big, 1-3 words at a time, centered in safe zone (TikTok/Reels style)
CF = font('black', 92)
caps = []
for i, b in enumerate(B):
    words = b['text'].split(); total = sum(len(w_) + 1 for w_ in words); acc = 0; grp = []
    for w_ in words:
        st = starts[i] + durs[i] * acc / total; acc += len(w_) + 1; en = starts[i] + durs[i] * acc / total
        grp.append((w_, st, en))
        if len(grp) == 3 or w_[-1] in '.,:?!':
            caps.append(grp); grp = []
    if grp: caps.append(grp)
CAPS = [(g[0][1], g[-1][2], g) for g in caps]
CAPS = [(s, CAPS[j + 1][0] if j + 1 < len(CAPS) and CAPS[j + 1][0] - e < .5 else e, g) for j, (s, e, g) in enumerate(CAPS)]
_cc = {}
def cap_img(g, hi):
    key = (tuple(w_ for w_, _, _ in g), hi)
    if key in _cc: return _cc[key]
    ws = [w_.upper() for w_, _, _ in g]; sp = tw(' ', CF); wl = [tw(w_, CF) for w_ in ws]; total = sum(wl) + sp * (len(ws) - 1)
    f = CF
    if total > 960: f = font('black', int(92 * 960 / total)); sp = tw(' ', f); wl = [tw(w_, f) for w_ in ws]; total = sum(wl) + sp * (len(ws) - 1)
    im = canvas(int(total) + 40, 140); d = ImageDraw.Draw(im); x = 20
    for j, w_ in enumerate(ws):
        d.text((x, 70), w_, font=f, fill=(A1 if j == hi else TXT), anchor='lm', stroke_width=7, stroke_fill=(0, 0, 0))
        x += wl[j] + sp
    _cc[key] = im; return im

def main(fs=0, fe=None, out=f'short_noaudio{SUF}.mp4', preview=None):
    fe = fe or NF; built = {}; ic = {}
    p = None if preview else subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                               '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    for fi in range(fs, fe):
        t = fi / FPS; bi = max(i for i, s in enumerate(starts) if s <= t) if t >= starts[0] else 0
        b = B[bi]
        if bi not in built: built = {bi: build(b, durs[bi])}
        tl = t - starts[bi]
        fr = Image.fromarray(bgf(t)).convert('RGBA')
        for ly in built[bi]:
            lt = tl - ly.at
            if lt < 0: continue
            pr = ease(lt / .4)
            if ly.dyn:
                kind, arg = ly.dyn
                if kind == 'illo':
                    key = (bi, arg)
                    if arg not in ANIMATED and lt > ANIM_DUR and key in ic: img = ic[key]
                    else:
                        img = illo(arg, lt)
                        if arg not in ANIMATED and lt > ANIM_DUR: ic[key] = img
                else: img = cta_layer(lt)
            else: img = ly.img
            x, y = ly.x, ly.y
            if ly.pop:
                s = .6 + .4 * ease_back(lt / .45)
                if s < .999:
                    ow, oh = img.width, img.height
                    img = img.resize((max(1, int(ow * s)), max(1, int(oh * s))), Image.BILINEAR)
                    x += (ow - img.width) // 2; y += (oh - img.height) // 2
            else:
                y = int(y + ly.dy * (1 - pr))
            if pr < .999:
                a = np.asarray(img).copy(); a[..., 3] = (a[..., 3] * pr).astype(np.uint8); img = Image.fromarray(a)
            fr.alpha_composite(img, (int(x), int(y)))
        for s, e, g in CAPS:
            if s <= t < e:
                hi = max(j for j, (_, st, _) in enumerate(g) if st <= t)
                ci = cap_img(g, hi); pop = 1 + .08 * (1 - ease((t - s) / .15))
                if pop > 1.001: ci = ci.resize((int(ci.width * pop), int(ci.height * pop)), Image.BILINEAR)
                fr.alpha_composite(ci, ((W - ci.width) // 2, 1440 - ci.height // 2)); break
        # thin progress line at top
        d = ImageDraw.Draw(fr); d.rectangle([0, 0, int(W * t / TOTAL), 8], fill=A1)
        rgb = np.asarray(fr.convert('RGB'))
        if t > TOTAL - .5: rgb = (rgb * max(0, (TOTAL - t) / .5)).astype(np.uint8)
        if preview: Image.fromarray(rgb).save(f'spreview{SUF}/f{fi:05d}.jpg', quality=85)
        else: p.stdin.write(rgb.tobytes())
    if p: p.stdin.close(); p.wait()

if __name__ == '__main__':
    json.dump({'starts': starts, 'durs': durs, 'total': TOTAL}, open(f'short_timeline{SUF}.json', 'w'))
    if len(sys.argv) > 1 and sys.argv[1] == 'preview':
        import os; os.makedirs('spreview' + SUF, exist_ok=True)
        for i, s in enumerate(starts):
            f = int((s + min(1.8, durs[i] * .8)) * FPS); main(f, f + 1, preview=True)
    else:
        main()
