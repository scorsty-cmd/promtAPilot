import sys, os, json, math, subprocess, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, '.')
import scenes as S
B = S.B
SECTION_NAMES = getattr(S, 'SECTION_NAMES', {})          # {section_id: 'Label'}
SECTION_ORDER = getattr(S, 'SECTION_ORDER', list(SECTION_NAMES))
SECTION_PREFIX = getattr(S, 'SECTION_PREFIX', '#')        # '' to show only the label
RECAP_TITLE = getattr(S, 'RECAP_TITLE', 'Quick recap')
TIMER_TEXT = getattr(S, 'TIMER_TEXT', '10:00')

W, H, FPS = 1920, 1080, 30
BG = (7, 8, 15); TXT = (244, 246, 251); MUTED = (138, 144, 166)
A1 = (53, 240, 208)   # teal
A2 = (139, 108, 255)  # violet
A3 = (255, 77, 109)   # warm red (subscribe / warning)
CARD = (20, 23, 38)
# per-video palette override, e.g. PALETTE = {'A1': (255, 196, 61), 'A2': (64, 156, 255)}
for _k, _v in getattr(S, 'PALETTE', {}).items(): globals()[_k] = tuple(_v)

FD = '/usr/share/fonts/opentype/inter/'
def F(name, size): return ImageFont.truetype(FD + name, size)
_fc = {}
def font(kind, size):
    k = (kind, size)
    if k not in _fc:
        _fc[k] = F({'black': 'InterDisplay-Black.otf', 'xb': 'InterDisplay-ExtraBold.otf',
                    'bold': 'InterDisplay-Bold.otf', 'semi': 'Inter-SemiBold.otf',
                    'med': 'Inter-Medium.otf'}[kind], size)
    return _fc[k]

def ease(x):  # easeOutCubic
    x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def ease_back(x):
    x = min(max(x, 0.0), 1.0); c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ------------------------------------------------------------------ timeline
durs = json.load(open('vo/durs.json'))
assert len(durs) == len(B), (len(durs), len(B))
t = 0.3; starts = []
for i, b in enumerate(B):
    if i > 0:
        t += 1.6 if b['section'] != B[i - 1]['section'] else 0.55
    starts.append(t); t += durs[i]
TOTAL = t + 2.6
ends = [starts[i + 1] if i + 1 < len(B) else TOTAL for i in range(len(B))]
NFRAMES = int(TOTAL * FPS)

# ------------------------------------------------------------------ background
def make_bg():
    bw, bh = 2300, 1400
    y, x = np.mgrid[0:bh, 0:bw].astype(np.float32)
    img = np.zeros((bh, bw, 3), np.float32) + np.array(BG, np.float32)
    def glow(cx, cy, r, col, k):
        d = np.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r)))
        return d[..., None] * np.array(col, np.float32) * k
    img += glow(350, 250, 520, A2, 0.30)
    img += glow(1950, 1150, 600, A1, 0.16)
    img += glow(1200, 700, 900, (40, 50, 110), 0.25)
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    for gx in range(0, bw, 64):
        for gy in range(0, bh, 64):
            d.ellipse([gx - 1.5, gy - 1.5, gx + 1.5, gy + 1.5], fill=(34, 38, 60))
    arr = np.asarray(im).astype(np.int16)
    rng = np.random.default_rng(1)
    arr += rng.integers(-4, 5, arr.shape[:2], dtype=np.int16)[..., None]
    return np.clip(arr, 0, 255).astype(np.uint8)
BGIMG = make_bg()
def bg_frame(t):
    ox = int(190 + 160 * math.sin(t * 0.045)); oy = int(160 + 140 * math.cos(t * 0.037))
    return BGIMG[oy:oy + H, ox:ox + W]

# ------------------------------------------------------------------ helpers
def rr(d, box, r, **kw): d.rounded_rectangle(box, r, **kw)
def text_w(d, s, f): return d.textlength(s, font=f)
def wrap(d, s, f, maxw):
    words, lines, cur = s.split(), [], ''
    for w_ in words:
        tr = (cur + ' ' + w_).strip()
        if text_w(d, tr, f) <= maxw: cur = tr
        else: lines.append(cur); cur = w_
    lines.append(cur); return lines

class Layer:
    """RGBA image placed at (x, y), revealed at time `at` (sec after beat start)."""
    def __init__(self, img, x, y, at=0.0, dy=40, pop=False, dyn=None):
        self.img, self.x, self.y, self.at, self.dy, self.pop, self.dyn = img, x, y, at, dy, pop, dyn

def canvas(w, h): return Image.new('RGBA', (w, h), (0, 0, 0, 0))

def glass(w, h, r=36, fill=(22, 26, 44, 225), outline=(255, 255, 255, 28)):
    im = canvas(w, h); d = ImageDraw.Draw(im)
    rr(d, [0, 0, w - 1, h - 1], r, fill=fill, outline=outline, width=2)
    return im, d

def chip(label, col=A1, size=34, fg=None, fill_alpha=40):
    f = font('semi', size); tmp = ImageDraw.Draw(canvas(1, 1))
    w = int(text_w(tmp, label, f)) + size * 2; h = int(size * 1.9)
    im = canvas(w, h); d = ImageDraw.Draw(im)
    rr(d, [0, 0, w - 1, h - 1], h // 2, fill=col + (fill_alpha,), outline=col + (200,), width=2)
    d.text((w / 2, h / 2), label, font=f, fill=fg or col, anchor='mm')
    return im

# ------------------------------------------------------------------ illustrations (760 x 600 box)
IW, IH = 760, 600
def landscape(w, h):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    for yy in range(h):
        k = yy / h; d.line([0, yy, w, yy], fill=(int(255 - 120 * k), int(150 + 40 * k), int(120 + 110 * k)))
    d.ellipse([w * .62, h * .16, w * .80, h * .16 + w * .18], fill=(255, 236, 170))
    d.polygon([(0, h), (0, h * .62), (w * .28, h * .34), (w * .55, h * .66), (w * .55, h)], fill=(70, 60, 120))
    d.polygon([(w * .3, h), (w * .62, h * .48), (w, h * .70), (w, h)], fill=(40, 40, 90))
    d.rectangle([0, h * .86, w, h], fill=(25, 30, 60))
    return im

def illo(name, t):
    im, d = glass(IW, IH)
    cx, cy = IW / 2, IH / 2
    a = ease(t / 0.9)
    if 'custom_illo' in globals() and custom_illo(name, t, im, d):
        return im
    if name == 'pixel':
        small = landscape(24, 18).resize((520, 390), Image.NEAREST)
        im.paste(small, (120, 105))
        rr(d, [120, 105, 640, 495], 8, outline=(255, 255, 255, 60), width=2)
        d.text((cx, 545), 'Enlarged 4x:  blocky & blurry', font=font('semi', 30), fill=MUTED, anchor='mm')
    elif name == 'upscale':
        sm = landscape(60, 45).resize((220, 165), Image.BILINEAR).filter(ImageFilter.GaussianBlur(3))
        im.paste(sm, (50, 215))
        d.text((160, 410), 'Before', font=font('semi', 28), fill=MUTED, anchor='mm')
        x0 = 290 + 40 * a
        d.line([290, 297, x0 + 20, 297], fill=A1, width=8)
        d.polygon([(x0 + 20, 280), (x0 + 48, 297), (x0 + 20, 314)], fill=A1)
        bw = int(330 + 0 * a); big = landscape(bw, int(bw * .75))
        im.paste(big, (390, 175))
        rr(d, [390, 175, 390 + bw, 175 + int(bw * .75)], 6, outline=A1 + (220,), width=4)
        d.text((555, 455), 'After  (4x, sharp)', font=font('semi', 28), fill=A1, anchor='mm')
    elif name == 'walltext':
        rng = random.Random(3)
        for i in range(13):
            y = 70 + i * 36; w = rng.randint(380, 600) if i % 4 != 3 else rng.randint(200, 360)
            d.rounded_rectangle([80, y, 80 + w, y + 16], 8, fill=(90, 96, 125, 200))
        d.text((cx, 555), 'Nobody reads this.', font=font('semi', 32), fill=MUTED, anchor='mm')
    elif name == 'flow':
        nodes = [(150, 140, 'Idea'), (380, 140, 'Plan'), (610, 140, 'Build'), (380, 400, 'Launch')]
        cols = [A2, A1, A2, A1]
        n = min(4, int(t / 0.35) + 1)
        links = [(0, 1), (1, 2), (2, 3)]
        for k, (p, q) in enumerate(links):
            if k + 1 < n:
                x1, y1 = nodes[p][:2]; x2, y2 = nodes[q][:2]
                d.line([x1, y1, x2, y2], fill=(255, 255, 255, 110), width=5)
        for k in range(n):
            x, y, lab = nodes[k]
            rr(d, [x - 100, y - 52, x + 100, y + 52], 26, fill=cols[k] + (60,), outline=cols[k] + (255,), width=4)
            d.text((x, y), lab, font=font('bold', 38), fill=TXT, anchor='mm')
    elif name == 'info':
        r = 150 * ease_back(t / 0.6)
        if r > 2:
            d.ellipse([cx - r, cy - 30 - r, cx + r, cy - 30 + r], fill=(255, 196, 61, 45), outline=(255, 196, 61, 255), width=8)
            d.text((cx, cy - 30), '!', font=font('black', int(r * 1.3) + 1), fill=(255, 196, 61), anchor='mm')
        d.text((cx, 520), 'Good to know', font=font('semi', 34), fill=MUTED, anchor='mm')
    elif name == 'laptop':
        rr(d, [170, 110, 590, 380], 22, fill=(30, 35, 58, 255), outline=(255, 255, 255, 90), width=4)
        d.polygon([(110, 400), (650, 400), (610, 440), (150, 440)], fill=(60, 66, 95))
        rr(d, [210, 150, 430, 200], 20, fill=A2 + (200,))
        rr(d, [330, 220, 550, 270], 20, fill=A1 + (200,))
        rr(d, [210, 290, 400, 340], 20, fill=A2 + (200,))
        # lock
        lx, ly = 380, 500
        d.arc([lx - 40, ly - 85, lx + 40, ly - 5], 180, 360, fill=A1, width=10)
        rr(d, [lx - 58, ly - 45, lx + 58, ly + 45], 14, fill=A1)
        d.ellipse([lx - 10, ly - 12, lx + 10, ly + 8], fill=CARD)
        d.text((470, 500), 'Stays on your device', font=font('semi', 28), fill=MUTED, anchor='lm')
    elif name == 'chat':
        rr(d, [70, 90, 470, 180], 30, fill=(60, 66, 95, 255))
        d.text((100, 135), 'Summarize this...', font=font('med', 32), fill=TXT, anchor='lm')
        if t > .4:
            rr(d, [250, 220, 690, 360], 30, fill=A1 + (70,), outline=A1 + (255,), width=3)
            for i, w in enumerate([340, 380, 250]):
                d.rounded_rectangle([285, 250 + i * 34, 285 + w, 266 + i * 34], 8, fill=(220, 255, 245, 210))
        if t > .8:
            for i, (lab, v) in enumerate([('Creativity', .7), ('Length', .45)]):
                y = 420 + i * 75
                d.text((90, y), lab, font=font('semi', 28), fill=MUTED, anchor='lm')
                d.rounded_rectangle([300, y - 6, 670, y + 6], 6, fill=(60, 66, 95))
                d.rounded_rectangle([300, y - 6, 300 + 370 * v, y + 6], 6, fill=A2)
                kx = 300 + 370 * v; d.ellipse([kx - 16, y - 16, kx + 16, y + 16], fill=TXT)
    elif name == 'context':
        segs = [('DOCS', A2, .30), ('VIDEO', A1, .38), ('CODE', (255, 196, 61), .32)]
        d.text((80, 150), 'One prompt can hold:', font=font('semi', 34), fill=MUTED, anchor='lm')
        x = 80; full = 600
        for k, (lab, col, fr) in enumerate(segs):
            p = ease((t - k * .3) / .6); w = full * fr * p
            if w > 2:
                rr(d, [x, 230, x + w, 340], 18, fill=col + (220,))
                if p > .6: d.text((x + w / 2, 285), lab, font=font('bold', 34), fill=BG, anchor='mm')
            x += full * fr + (0 if k == 2 else 0)
        d.text((80, 430), 'Hundreds of pages', font=font('bold', 44), fill=TXT, anchor='lm')
        d.text((80, 490), 'in a single conversation', font=font('med', 34), fill=MUTED, anchor='lm')
    elif name == 'docs':
        for k in range(3):
            p = ease((t - k * .2) / .5); x = 70 + k * 40; y = 120 + k * 120
            if p <= 0: continue
            rr(d, [x, y, x + 150, y + 100], 14, fill=(60, 66, 95, int(255 * p)))
            for j in range(3): d.rounded_rectangle([x + 20, y + 22 + j * 22, x + 130 - j * 25, y + 32 + j * 22], 5, fill=(150, 156, 185))
            d.line([x + 170, y + 50, 440, 300], fill=A1 + (int(160 * p),), width=4)
        q = ease_back((t - .5) / .6); r = 140 * q
        if r > 2:
            rr(d, [570 - r, 300 - r, 570 + r, 300 + r], 30, fill=A2 + (90,), outline=A2 + (255,), width=5)
            d.text((570, 300), 'AI', font=font('black', int(r * .8) + 1), fill=TXT, anchor='mm')
    elif name == 'cite':
        rr(d, [60, 100, 700, 320], 30, fill=(40, 46, 74, 255))
        for i, w in enumerate([520, 560, 300]):
            d.rounded_rectangle([100, 140 + i * 50, 100 + w, 160 + i * 50], 9, fill=(160, 166, 195))
        for k in range(3):
            p = ease_back((t - .3 - k * .2) / .5)
            if p <= 0: continue
            x = 180 + k * 200; r = int(44 * p)
            d.ellipse([x - r, 410 - r, x + r, 410 + r], fill=A1)
            d.text((x, 410), str(k + 1), font=font('black', max(1, int(46 * p))), fill=BG, anchor='mm')
            d.text((x, 495), 'Source', font=font('semi', 28), fill=MUTED, anchor='mm')
    elif name == 'podcast':
        for k, (x, col) in enumerate([(220, A2), (540, A1)]):
            d.ellipse([x - 90, 110, x + 90, 290], fill=col + (70,), outline=col + (255,), width=5)
            d.ellipse([x - 32, 150, x + 32, 214], fill=col)
            d.pieslice([x - 60, 210, x + 60, 330], 180, 360, fill=col)
        n = 26
        for i in range(n):
            amp = (0.35 + 0.65 * abs(math.sin(t * 6 + i * .7) * math.sin(t * 2.3 + i * .3)))
            h = 140 * amp; x = 120 + i * 20
            d.rounded_rectangle([x, 450 - h / 2, x + 10, 450 + h / 2], 5, fill=(A1 if i % 2 else A2) + (230,))
    elif name in ('cards', 'coin'):
        for k in range(3):
            p = ease((t - k * .15) / .5); y = 140 + k * 70 + (1 - p) * 60
            if p <= 0: continue
            x = 140 + k * 50
            rr(d, [x, y, x + 400, y + 240], 26, fill=[A2, (70, 80, 130), A1][k] + (int(240 * p),))
            d.rounded_rectangle([x + 40, y + 60, x + 110, y + 110], 10, fill=(255, 220, 120, int(230 * p)))
        tag = '$20/mo' if name == 'cards' else '$ per image'
        d.text((cx, 545), tag, font=font('black', 56), fill=A3, anchor='mm')
    elif name == 'sparkle':
        s = ease_back(t / .7)
        f = font('black', max(1, int(190 * s)))
        d.text((cx, cy), 'FREE', font=f, fill=A1, anchor='mm')
        for k, (x, y, r) in enumerate([(130, 130, 34), (640, 160, 26), (600, 470, 38), (150, 460, 22)]):
            rr_ = r * (0.6 + 0.4 * abs(math.sin(t * 3 + k)))
            d.polygon([(x, y - rr_), (x + rr_ * .25, y), (x, y + rr_), (x - rr_ * .25, y)], fill=TXT)
            d.polygon([(x - rr_, y), (x, y + rr_ * .25), (x + rr_, y), (x, y - rr_ * .25)], fill=TXT)
    elif name == 'stamp':
        s = 1 + 1.5 * (1 - ease(t / .35))
        st = canvas(620, 240); sd = ImageDraw.Draw(st)
        rr(sd, [10, 10, 610, 230], 24, outline=A3 + (255,), width=12)
        sd.text((310, 120), 'CLASSIFIED', font=font('black', 92), fill=A3, anchor='mm')
        st = st.rotate(-12, expand=True, resample=Image.BICUBIC)
        sw, sh = int(st.width * s * .95), int(st.height * s * .95)
        st = st.resize((sw, sh), Image.BICUBIC)
        if t > 0.02: im.alpha_composite(st, (int(cx - sw / 2), int(cy - sh / 2)))
    elif name == 'timer':
        r = 190
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(60, 66, 95), width=22)
        d.arc([cx - r, cy - r, cx + r, cy + r], -90, -90 + 360 * ease(t / 1.6) * .75, fill=A1, width=22)
        rr(d, [cx - 30, cy - r - 60, cx + 30, cy - r - 20], 8, fill=(90, 96, 125))
        d.text((cx, cy), TIMER_TEXT, font=font('black', 110), fill=TXT, anchor='mm')
    elif name == 'comment':
        rr(d, [110, 140, 650, 400], 50, fill=A2 + (80,), outline=A2 + (255,), width=5)
        d.polygon([(200, 395), (260, 395), (180, 480)], fill=A2 + (255,))
        for k in range(3):
            p = abs(math.sin(t * 4 - k * .7)); r = 18 + 8 * p
            x = 290 + k * 90
            d.ellipse([x - r, 270 - r, x + r, 270 + r], fill=TXT)
    return im

ANIMATED = {'podcast', 'comment', 'sparkle'}  # loop forever
ANIM_DUR = 2.0
# Optional per-video illustrations: custom_illos.py defines custom_illo(name, t, im, d) -> bool
# (draw into the 760x600 glass card `im` with ImageDraw `d`; return True if handled)
# and may add names to CUSTOM_ANIMATED for looping animations.
if os.path.exists('custom_illos.py'):
    exec(open('custom_illos.py').read(), globals())
    ANIMATED |= set(globals().get('CUSTOM_ANIMATED', set()))
exec(open('hl_ext.py').read(), globals())

# ------------------------------------------------------------------ beat builders
def section_header(b):
    s = b['section']
    if s not in SECTION_NAMES or b['kind'] == 'tool': return []
    lab = f"{SECTION_PREFIX}{s}  {SECTION_NAMES[s]}" if SECTION_PREFIX else SECTION_NAMES[s]
    return [Layer(chip(lab, A2, 30, fg=TXT, fill_alpha=70), 110, 92, 0, dy=0)]

def build(b):
    L = section_header(b); k = b['kind']; tmp = ImageDraw.Draw(canvas(1, 1))
    if k == 'hero':
        size = 150 if not b.get('small') else 132
        f = font('black', size)
        has_illo = b.get('illo', 'none') != 'none'
        lines = b['lines']; lh = int(size * 1.08)
        block_h = lh * len(lines)
        if has_illo:
            # illustration left, text right
            L.append(Layer(None, 140, 230, 0.05, dyn=('illo', b['illo'])))
            tx = 1000; maxw = 820
        else:
            tx = None; maxw = 1640
        y0 = (H - block_h) // 2 - 30
        for i, line in enumerate(lines):
            ff = f
            while text_w(tmp, line, ff) > maxw: ff = font('black', ff.size - 6)
            w = int(text_w(tmp, line, ff)) + 20
            im = canvas(w, lh + 20); d = ImageDraw.Draw(im)
            col = A1 if i == b.get('accent', -1) else TXT
            d.text((10, 0), line, font=ff, fill=col)
            x = tx if tx else (W - w) // 2
            L.append(Layer(im, x, y0 + i * lh, 0.08 + i * 0.18, dy=60))
    elif k == 'tool':
        num = str(b['num'])
        WORDS = {1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN'}
        im = canvas(560, 640); d = ImageDraw.Draw(im)
        d.text((280, 320), num, font=font('black', 560), fill=A1 + (255,), anchor='mm', stroke_width=0)
        g = im.filter(ImageFilter.GaussianBlur(28))
        glowim = canvas(560, 640); glowim.alpha_composite(g); glowim.alpha_composite(im)
        L.append(Layer(glowim, 150, 200, 0, pop=True))
        kicker = b.get('kicker') or (f"NUMBER {WORDS[b['num']]}" if b['num'] in WORDS else f"PART {num}")
        lab = canvas(1000, 60); ImageDraw.Draw(lab).text((0, 0), kicker.upper(), font=font('bold', 44), fill=MUTED)
        L.append(Layer(lab, 790, 300, .12))
        ff = font('black', 140)
        while text_w(tmp, b['name'], ff) > 1020: ff = font('black', ff.size - 6)
        nm = canvas(1100, 190); ImageDraw.Draw(nm).text((0, 0), b['name'], font=ff, fill=TXT)
        L.append(Layer(nm, 785, 370, .22, dy=70))
        tg = canvas(1100, 70); ImageDraw.Draw(tg).text((0, 0), b['tag'], font=font('semi', 50), fill=A1)
        L.append(Layer(tg, 790, 560, .34))
        x = 790
        for j, c in enumerate(b['chips']):
            ci = chip(c, A2, 32, fg=TXT, fill_alpha=60); L.append(Layer(ci, x, 670, .46 + j * .1, pop=True)); x += ci.width + 22
    elif k == 'point':
        hd = canvas(800, 60); ImageDraw.Draw(hd).text((0, 0), b['head'].upper(), font=font('bold', 40), fill=A1)
        L.append(Layer(hd, 110, 300, .05))
        f = font('xb', 88); lines = wrap(tmp, b['body'], f, 820)
        if len(lines) > 4: f = font('xb', 74); lines = wrap(tmp, b['body'], f, 820)
        lh = int(f.size * 1.12)
        for i, line in enumerate(lines):
            im = canvas(900, lh + 24); ImageDraw.Draw(im).text((0, 0), line, font=f, fill=TXT)
            L.append(Layer(im, 106, 380 + i * lh, .15 + i * .12))
        L.append(Layer(None, 1040, 230, .1, dyn=('illo', b['illo'])))
    elif k in ('checklist', 'steps'):
        hd = canvas(1200, 70); ImageDraw.Draw(hd).text((0, 0), b['head'], font=font('black', 64), fill=TXT)
        L.append(Layer(hd, 140, 230, .02))
        n = len(b['items']); cw = min(520, (W - 280 - (n - 1) * 40) // n); gap = (W - 280 - n * cw) // max(1, n - 1)
        for j, it in enumerate(b['items']):
            im, d = glass(cw, 360)
            if k == 'steps':
                d.ellipse([50, 50, 150, 150], fill=A2); d.text((100, 100), str(j + 1), font=font('black', 60), fill=TXT, anchor='mm')
            else:
                d.ellipse([50, 50, 150, 150], fill=A1); d.line([(78, 102), (95, 120), (124, 82)], fill=BG, width=12, joint='curve')
            ff = font('xb', 54 if n <= 3 else 44); ls = wrap(d, it, ff, cw - 90)
            for q, ln in enumerate(ls): d.text((50, 190 + q * int(ff.size * 1.18)), ln, font=ff, fill=TXT)
            at = 0.25 + j * max(0.35, b['_dur'] * 0.6 / n)
            L.append(Layer(im, 140 + j * (cw + gap), 380, at, pop=True))
    elif k == 'recap':
        hd = canvas(1400, 80); ImageDraw.Draw(hd).text((0, 0), b.get('head', RECAP_TITLE), font=font('black', 64), fill=TXT)
        L.append(Layer(hd, 160, 120, 0))
        nI = len(b['items']); step = min(148, 650 // max(1, nI)); rh = min(128, step - 14); m = rh // 2
        fs = 54 if rh >= 110 else 44
        for j, (n_, name, what) in enumerate(b['items']):
            im, d = glass(1600, rh, 30)
            d.ellipse([28, m - 40, 108, m + 40], fill=A1); d.text((68, m), n_, font=font('black', 50), fill=BG, anchor='mm')
            d.text((150, m), name, font=font('xb', fs), fill=TXT, anchor='lm')
            d.text((1560, m), what, font=font('semi', fs - 12), fill=A1, anchor='rm')
            at = 0.15 + j * (b['_dur'] - 1.5) / nI
            L.append(Layer(im, 160, 240 + j * step, at, dy=30))
    elif k == 'subscribe':
        L.append(Layer(None, 0, 0, 0, dyn=('subscribe', None)))
        sub = canvas(1800, 90); ImageDraw.Draw(sub).text((900, 45), b['lines'][1], font=font('semi', 52), fill=MUTED, anchor='mm')
        L.append(Layer(sub, 60, 680, .4))
    if k in EXT_KINDS or b.get('src'): L += build_ext(b)
    return L

def subscribe_layer(t):
    im = canvas(W, H); d = ImageDraw.Draw(im)
    s = ease_back(t / .6) * (1 + 0.03 * math.sin(t * 5))
    w, h = 760 * s, 190 * s
    if w > 10:
        rr(d, [W / 2 - w / 2, 430 - h / 2, W / 2 + w / 2, 430 + h / 2], int(h / 2), fill=A3)
        d.text((W / 2, 430), 'SUBSCRIBE', font=font('black', max(1, int(96 * s))), fill=TXT, anchor='mm')
    return im

# ------------------------------------------------------------------ captions
CAP_F = font('xb', 54)
_capcache = {}
def chunks(text, maxw=1500):
    words = text.replace('->', 'to').split(); out, cur = [], []
    tmp = ImageDraw.Draw(canvas(1, 1))
    for w_ in words:
        trial = cur + [w_]
        if len(trial) > 7 or text_w(tmp, ' '.join(trial), CAP_F) > maxw:
            out.append(cur); cur = [w_]
        else: cur = trial
        if w_[-1] in '.?!:' and len(cur) >= 3: out.append(cur); cur = []
    if cur: out.append(cur)
    return out
def caption_img(words, hi):
    key = (tuple(words), hi)
    if key in _capcache: return _capcache[key]
    tmp = ImageDraw.Draw(canvas(1, 1)); sp = text_w(tmp, ' ', CAP_F)
    ws = [text_w(tmp, w_, CAP_F) for w_ in words]; tw = sum(ws) + sp * (len(words) - 1)
    im = canvas(int(tw) + 80, 100); d = ImageDraw.Draw(im)
    rr(d, [0, 0, im.width - 1, 99], 26, fill=(5, 6, 12, 190))
    x = 40
    for i, w_ in enumerate(words):
        col = A1 if i == hi else TXT
        d.text((x, 50), w_, font=CAP_F, fill=col, anchor='lm', stroke_width=2, stroke_fill=(0, 0, 0))
        x += ws[i] + sp
    _capcache[key] = im; return im

CAPS = []  # (start, end, words, word_times)
for i, b in enumerate(B):
    ch = chunks(b['text']); total_chars = sum(len(w_) + 1 for c in ch for w_ in c)
    t0 = starts[i]; dur = durs[i]; acc = 0
    for c in ch:
        wt = []
        for w_ in c:
            wt.append(t0 + dur * acc / total_chars); acc += len(w_) + 1
        CAPS.append([wt[0], t0 + dur * acc / total_chars, c, wt])
for j in range(len(CAPS) - 1):  # hold caption until next one
    if CAPS[j + 1][0] - CAPS[j][1] < 0.6: CAPS[j][1] = CAPS[j + 1][0]

# ------------------------------------------------------------------ progress bar
def progress_layer(sec):
    im = canvas(760, 40); d = ImageDraw.Draw(im)
    order = SECTION_ORDER; seg = 760 // max(1, len(order))
    for j, n in enumerate(order):
        x = j * seg
        done = sec in order and order.index(sec) >= j
        cur = sec == n
        rr(d, [x, 14, x + seg - 12, 26], 6, fill=(A1 if cur else (A2 if done else (50, 55, 80))))
    return im
_pcache = {}

# ------------------------------------------------------------------ render
def main(start_f=0, end_f=None, out='video.mp4', preview_every=None):
    end_f = end_f or NFRAMES
    built = {}
    illocache = {}
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
           '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', out]
    p = None if preview_every else subprocess.Popen(cmd, stdin=subprocess.PIPE)
    bi = 0
    for fi in range(start_f, end_f, preview_every or 1):
        t = fi / FPS
        while bi + 1 < len(B) and t >= starts[bi + 1] - 0.0: bi += 1
        while bi > 0 and t < starts[bi]: bi -= 1
        b = B[bi]; b['_dur'] = durs[bi]
        if bi not in built:
            built = {bi: build(b)}
        tl = t - starts[bi]
        frame = Image.fromarray(bg_for(bi, t, tl)).convert('RGBA')
        # beat transition: outgoing fade handled by quick fade-in of the new layers
        for ly in built[bi]:
            lt = tl - ly.at
            if lt < 0: continue
            pr = ease(lt / 0.45)
            if ly.dyn:
                kind, arg = ly.dyn
                if kind == 'fn':
                    img = arg(lt)
                elif kind == 'illo':
                    key = (bi, arg)
                    if arg not in ANIMATED and lt > ANIM_DUR and key in illocache: img = illocache[key]
                    else:
                        img = illo(arg, lt)
                        if arg not in ANIMATED and lt > ANIM_DUR: illocache[key] = img
                else:
                    img = subscribe_layer(lt)
            else:
                img = ly.img
            if ly.pop:
                s = 0.6 + 0.4 * ease_back(lt / 0.45)
                if s < 0.999:
                    img = img.resize((max(1, int(img.width * s)), max(1, int(img.height * s))), Image.BILINEAR)
                    x = ly.x + (ly.img.width - img.width) // 2 if ly.img else ly.x; y = ly.y + ((ly.img.height if ly.img else img.height) - img.height) // 2
                else: x, y = ly.x, ly.y
            else:
                x, y = ly.x, int(ly.y + ly.dy * (1 - pr))
            if pr < 0.999:
                a = np.asarray(img).copy(); a[..., 3] = (a[..., 3] * pr).astype(np.uint8); img = Image.fromarray(a)
            frame.alpha_composite(img, (int(x), int(y)))
        # progress bar for tool sections
        sec = b['section']
        if sec in SECTION_NAMES:
            if sec not in _pcache: _pcache[sec] = progress_layer(sec)
            frame.alpha_composite(_pcache[sec], (W - 760 - 110, 100))
        # section-change flash wipe
        if b['kind'] == 'tool' and tl < 0.5:
            k = tl / 0.5; wx = int(-W * 0.4 + (W * 1.6) * ease(k))
            wipe = canvas(W, H); dw = ImageDraw.Draw(wipe)
            dw.polygon([(wx, 0), (wx + 260, 0), (wx + 60, H), (wx - 200, H)], fill=A1 + (int(160 * (1 - k)),))
            frame.alpha_composite(wipe)
        frame = post_fx(frame, b, tl, t, fi)
        # captions
        for c in CAPS:
            if c[0] <= t < c[1]:
                hi = max(i for i, wt in enumerate(c[3]) if wt <= t)
                ci = caption_img(c[2], hi)
                frame.alpha_composite(ci, ((W - ci.width) // 2, H - 170))
                break
        # global fade in/out
        rgb = np.asarray(frame.convert('RGB'))
        if t < 0.3: rgb = (rgb * (t / 0.3)).astype(np.uint8)
        if t > TOTAL - 1.0: rgb = (rgb * max(0, (TOTAL - t) / 1.0)).astype(np.uint8)
        if preview_every:
            Image.fromarray(rgb).save(f'preview/f{fi:05d}.jpg', quality=85)
        else:
            p.stdin.write(rgb.tobytes())
        if fi % 300 == 0: print('frame', fi, '/', end_f, flush=True)
    if p: p.stdin.close(); p.wait()

if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument('--start', type=float, default=0); ap.add_argument('--end', type=float, default=None)
    ap.add_argument('--out', default='video.mp4'); ap.add_argument('--preview', type=int, default=None)
    ap.add_argument('--beats', action='store_true', help='write one preview JPG per beat to preview/ and a contact sheet')
    a = ap.parse_args()
    json.dump({'starts': starts, 'durs': durs, 'total': TOTAL}, open('timeline.json', 'w'))
    if a.beats:
        os.makedirs('preview', exist_ok=True)
        for f_ in os.listdir('preview'): os.remove(os.path.join('preview', f_))
        for i, s_ in enumerate(starts):
            fi = int((s_ + min(2.2, durs[i] * 0.8)) * FPS); main(fi, fi + 1, preview_every=1)
        fs = sorted(os.listdir('preview')); cols = 3
        for k in range(0, len(fs), 9):
            sheet = Image.new('RGB', (640 * cols, 360 * 3))
            for j, f_ in enumerate(fs[k:k + 9]):
                sheet.paste(Image.open(os.path.join('preview', f_)).resize((640, 360)), ((j % cols) * 640, (j // cols) * 360))
            sheet.save(f'preview_sheet_{k // 9}.jpg', quality=82)
        print('preview sheets:', (len(fs) + 8) // 9, 'total', round(TOTAL, 1), 's')
    else:
        main(int(a.start * FPS), int(a.end * FPS) if a.end else None, a.out, a.preview)
