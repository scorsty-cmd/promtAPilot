"""Hidden Layer Reel renderer v2 (1080x1920, 30 fps) - standalone, no render.py needed.

Style learned from outperforming faceless privacy/tech Reels (Oct 2026): a "case file" HUD with a live
countdown, real photos with Ken Burns moves, "receipt" cards (documents with a highlighter swipe,
headline cards with REF tags), big count-up numbers, red reticle callouts, a visual change every
~1.5 s (micro punch-ins on every caption group), glitch cuts between beats, word-by-word captions with
a highlighted current word, film grain + vignette, and an SFX event list for reel_audio.py.

Inputs (kit folder): short_scenes_reel.py (B list), vos_reel/durs.json (tts_short.py with SHORT=reel),
optional photos/ (photos.py), optional custom_illos.py (same format as before).
    python3 reel2.py preview     # 2 frames per beat -> rpreview/*.jpg   (LOOK at all of them)
    python3 reel2.py             # reel_noaudio.mp4 + reel_timeline.json (incl. sfx events)

Beat kinds (beat(text, kind, **v) in short_scenes_reel.py; every beat may add photo='key'
for a full-bleed photo background, and file='FILE 017' etc. is set once in module FILE_ID):
  hook      lines=[1-3 short lines], accent=i      -> slams in at frame 0 (no fade), shake + flash
  photo     head='CHIP', body='<= 8 words', photo='key', mark=(x,y) optional 0..1 reticle position
  stat      value=83, prefix='', suffix='%', label='of ...', source='Source: ...'  (count-up)
  doc       doc='Snap Terms of Service', section='Section 3', quote='exact words',
            source='Read 18 Oct 2026', lines=7                     (page + highlighter + zoom on quote)
  headline  outlet='The Markup' (plain text only), title='paraphrased headline', date='2024',
            ref='REF 01'                                           (receipt card slides in, stamped)
  compare   left=('YOU THINK', 'line'), right=('REALITY', 'line')  (myth vs fact split)
  point     head, body, illo='name'  (custom_illos.py / built-ins: lock eye data clock money phone)
  checklist head, items=[<=3]
  cta       lines=['Save this before you forget', 'Follow for the hidden rules']
"""
import sys, os, json, math, subprocess, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
sys.path.insert(0, '.')

S = __import__('short_scenes_reel')
B = S.B
W, H, FPS = 1080, 1920, 30
BG = (8, 9, 14); TXT = (246, 246, 248); MUTED = (150, 154, 170)
A1 = (255, 77, 77); A2 = (255, 196, 61); A3 = (255, 77, 109)
for _k, _v in getattr(S, 'PALETTE', {}).items(): globals()[_k] = tuple(_v)
FILE_ID = getattr(S, 'FILE_ID', 'FILE 001')
SERIES = getattr(S, 'SERIES', 'HIDDEN LAYER')
SEED = getattr(S, 'SEED', 7)
rng = random.Random(SEED)

FD = '/usr/share/fonts/opentype/inter/'
_fc = {}
def font(kind, size):
    size = max(8, int(size)); k = (kind, size)
    if k not in _fc:
        if kind == 'mono':
            for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',):
                if os.path.exists(p): _fc[k] = ImageFont.truetype(p, size); break
            else: _fc[k] = ImageFont.truetype(FD + 'Inter-SemiBold.otf', size)
        else:
            _fc[k] = ImageFont.truetype(FD + {'black': 'InterDisplay-Black.otf', 'xb': 'InterDisplay-ExtraBold.otf',
                     'bold': 'InterDisplay-Bold.otf', 'semi': 'Inter-SemiBold.otf', 'med': 'Inter-Medium.otf',
                     'serif': 'InterDisplay-SemiBold.otf'}[kind], size)
    return _fc[k]

def clamp(x, a=0., b=1.): return min(max(x, a), b)
def ease(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_back(x): x = clamp(x); c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def canvas(w, h): return Image.new('RGBA', (int(w), int(h)), (0, 0, 0, 0))
def rr(d, box, r, **kw): d.rounded_rectangle(box, r, **kw)
_dd = ImageDraw.Draw(canvas(1, 1))
def tw(s, f): return _dd.textlength(s, font=f)
def wrap(s, f, maxw):
    out, cur = [], ''
    for w_ in s.split():
        t_ = (cur + ' ' + w_).strip()
        if tw(t_, f) <= maxw or not cur: cur = t_
        else: out.append(cur); cur = w_
    if cur: out.append(cur)
    return out
def fit(s, kind, size, maxw):
    f = font(kind, size)
    while tw(s, f) > maxw and size > 20: size -= 4; f = font(kind, size)
    return f
def alpha(img, a):
    if a >= .999: return img
    im = img.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * clamp(a)))); return im

# ------------------------------------------------------------------ timeline
durs = json.load(open('vos_reel/durs.json')); assert len(durs) == len(B), (len(durs), len(B))
GAP = 0.06
t = 0.0; starts = []
for i in range(len(B)):
    if i: t += GAP
    starts.append(t); t += durs[i]
TOTAL = t + 0.9
NF = int(TOTAL * FPS)
ends = [starts[i + 1] if i + 1 < len(B) else TOTAL for i in range(len(B))]
SFX = []   # (time, kind)  -> reel_audio.py
def sfx(t_, k):
    if not any(abs(t_ - a) < .08 and k == b for a, b in SFX): SFX.append((round(t_, 3), k))

# ------------------------------------------------------------------ photos
PH = {}
if os.path.exists('photos/manifest.json'):
    for im in json.load(open('photos/manifest.json'))['images']:
        p = os.path.join('photos', im['file'])
        if os.path.exists(p):
            PH[im['file'][:-4]] = p
            PH.setdefault(im['key'], p)
_pc = {}
def photo_base(key):
    """1300x2300 cover crop, graded toward the palette (darker, cooler, contrasty)."""
    if key in _pc: return _pc[key]
    p = PH.get(key)
    if not p: _pc[key] = None; return None
    im = Image.open(p).convert('RGB')
    im = ImageOps.fit(im, (1300, 2300), Image.LANCZOS, centering=(.5, .45))
    a = np.asarray(im).astype(np.float32) / 255
    lum = a @ np.array([.299, .587, .114], np.float32)
    a = a * .55 + lum[..., None] * .45                       # desaturate a little
    a = (a - .5) * 1.15 + .5                                 # contrast
    tint = np.array(BG, np.float32) / 255 * .6 + np.array(A2, np.float32) / 255 * .08
    a = a * .72 + tint * .28
    a = np.clip(a * .78, 0, 1)                               # darker so text reads
    _pc[key] = Image.fromarray((a * 255).astype(np.uint8)); return _pc[key]

def photo_frame(key, lt, dur, seed):
    base = photo_base(key)
    if base is None: return None
    r = random.Random(seed); dx, dy = r.choice([(-1, -1), (1, -1), (-1, 1), (1, 1), (0, -1)])
    p = ease_io(lt / max(dur, .1))
    z = 1.0 + .10 * p                                         # Ken Burns push-in
    cw, ch = 1300 / z, 2300 / z
    cx = 650 + dx * 60 * p; cy = 1150 + dy * 80 * p
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    box = (box[0] + (1300 - 1080 * 1.0) / 2 * 0, box[1], box[2], box[3])
    im = base.crop(tuple(int(v) for v in box)).resize((W, int(W * ch / cw)), Image.BILINEAR)
    if im.height < H: im = im.resize((W, H), Image.BILINEAR)
    y0 = (im.height - H) // 2
    return im.crop((0, y0, W, y0 + H)).convert('RGBA')

# ------------------------------------------------------------------ background
def make_bg():
    bw, bh = 1300, 2300
    y, x = np.mgrid[0:bh, 0:bw].astype(np.float32)
    img = np.zeros((bh, bw, 3), np.float32) + np.array(BG, np.float32)
    def glow(cx, cy, r, col, k): return np.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r)))[..., None] * np.array(col, np.float32) * k
    img += glow(200, 300, 560, A1, .16) + glow(1150, 1900, 650, A2, .12) + glow(650, 1100, 900, (30, 34, 60), .35)
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for gx in range(0, bw, 54): d.line([(gx, 0), (gx, bh)], fill=(20, 22, 32))
    for gy in range(0, bh, 54): d.line([(0, gy), (bw, gy)], fill=(20, 22, 32))
    return im
BGI = make_bg()
def bg_frame(t):
    ox = int(110 + 100 * math.sin(t * .23)); oy = int(190 + 170 * math.cos(t * .17))
    return BGI.crop((ox, oy, ox + W, oy + H)).convert('RGBA')

# light leak sprite (soft additive-looking glow in the accent colours)
def _mk_leak():
    s_ = 1200; y, x = np.mgrid[0:s_, 0:s_].astype(np.float32)
    g = np.exp(-(((x - 600) ** 2) / (2 * 260 ** 2) + ((y - 600) ** 2) / (2 * 420 ** 2)))
    col = np.array(A2, np.float32) * .6 + np.array((255, 170, 120), np.float32) * .4
    a = np.dstack([np.broadcast_to(col, (s_, s_, 3)), (g * 70)[..., None]]).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')
LEAK = _mk_leak()

# vignette + grain
_yy, _xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIG = (1 - .55 * np.clip(((_xx - W / 2) ** 2 / (W * .62) ** 2 + (_yy - H / 2) ** 2 / (H * .6) ** 2) - .35, 0, 1))[..., None].astype(np.float32)
_nr = np.random.default_rng(SEED)
GRAIN = [(_nr.standard_normal((H // 2, W // 2, 1)) * 3.2).astype(np.float32) for _ in range(6)]

# ------------------------------------------------------------------ built-in illustrations (760x600)
IW, IH = 760, 600
def builtin_illo(name, t, im, d):
    cx, cy = IW / 2, IH / 2
    if name == 'lock':
        p = ease(t / .6); rr(d, [cx - 150, cy - 30, cx + 150, cy + 190], 30, fill=A1)
        lift = 50 * ease((t - .7) / .5)
        d.arc([cx - 100, cy - 190 - lift, cx + 100, cy + 10 - lift], 180, 360, fill=TXT, width=34)
        d.ellipse([cx - 22, cy + 50, cx + 22, cy + 94], fill=BG); return True
    if name == 'eye':
        o = .15 + .85 * abs(math.sin(min(t, 1.2) * 1.3))
        d.ellipse([cx - 250, cy - 120 * o, cx + 250, cy + 120 * o], outline=TXT, width=14)
        px = cx + 60 * math.sin(t * 1.7); d.ellipse([px - 75, cy - 75 * o, px + 75, cy + 75 * o], fill=A1)
        d.ellipse([px - 26, cy - 26 * o, px + 26, cy + 26 * o], fill=BG); return True
    if name == 'data':
        for k in range(14):
            ph = (t * .8 + k / 14) % 1; x = 120 + ph * 520; y = cy - 120 + (k * 53) % 260
            d.rounded_rectangle([x, y, x + 46, y + 30], 6, fill=A1 if k % 3 == 0 else (90, 96, 125))
        rr(d, [40, cy - 90, 140, cy + 90], 20, fill=(60, 66, 95)); rr(d, [640, cy - 130, 730, cy + 130], 20, fill=A2); return True
    if name == 'clock':
        d.ellipse([cx - 200, cy - 200, cx + 200, cy + 200], outline=TXT, width=16)
        a = t * 3; d.line([cx, cy, cx + 150 * math.sin(a), cy - 150 * math.cos(a)], fill=A1, width=14)
        d.line([cx, cy, cx + 100 * math.sin(a / 12), cy - 100 * math.cos(a / 12)], fill=TXT, width=18); return True
    if name == 'money':
        for k in range(5):
            y = cy + 140 - k * 60 * ease((t - k * .12) / .4); rr(d, [cx - 160, y - 28, cx + 160, y + 28], 12, fill=A2 if k % 2 else A1)
        d.text((cx, cy - 200), '$', font=font('black', 150), fill=TXT, anchor='mm'); return True
    if name == 'phone':
        rr(d, [cx - 150, 40, cx + 150, 560], 44, fill=(30, 33, 48), outline=(90, 96, 125), width=6)
        for k in range(5):
            p = ease((t - k * .15) / .4); rr(d, [cx - 115, 110 + k * 85, cx - 115 + 230 * p, 170 + k * 85], 14, fill=A1 if k == 2 else (70, 76, 105))
        return True
    return False
CUSTOM_ANIMATED = set()
custom_illo = None
if os.path.exists('custom_illos.py'):
    _g = globals(); exec(open('custom_illos.py').read(), _g)
def illo(name, t):
    im = canvas(IW, IH); d = ImageDraw.Draw(im)
    if custom_illo and custom_illo(name, t, im, d): return im
    if builtin_illo(name, t, im, d): return im
    d.text((IW / 2, IH / 2), name.upper(), font=font('black', 90), fill=A1, anchor='mm'); return im

# ------------------------------------------------------------------ HUD (case-file frame + countdown)
def hud(t, bi):
    im = canvas(W, H); d = ImageDraw.Draw(im); c = TXT + (150,)
    L = 46
    for (x, y, sx, sy) in [(40, 200, 1, 1), (W - 40, 200, -1, 1), (40, 1560, 1, -1), (W - 40, 1560, -1, -1)]:
        d.line([(x, y), (x + sx * L, y)], fill=c, width=5); d.line([(x, y), (x, y + sy * L)], fill=c, width=5)
    f = font('mono', 30)
    if int(t * 2) % 2 == 0: d.ellipse([70, 132, 92, 154], fill=A1)
    d.text((104, 143), f'{SERIES} // {FILE_ID}', font=f, fill=TXT + (220,), anchor='lm')
    rem = max(0, TOTAL - t); s = f'00:{int(rem):02d}'
    bw = tw(s, font('mono', 34)) + 36
    rr(d, [W - 70 - bw, 120, W - 70, 166], 10, fill=(0, 0, 0, 150), outline=A1 + (200,), width=3)
    d.text((W - 70 - bw / 2, 143), s, font=font('mono', 34), fill=TXT, anchor='mm')
    d.rectangle([0, 0, int(W * t / TOTAL), 7], fill=A1)
    return im

# ------------------------------------------------------------------ beat layers
class Layer:
    def __init__(self, img=None, x=0, y=0, at=0., dy=50, pop=False, fn=None, slide=0, fade=.3):
        self.img, self.x, self.y, self.at, self.dy, self.pop, self.fn, self.slide, self.fade = img, x, y, at, dy, pop, fn, slide, fade

def text_img(s, f, col, stroke=0, shadow=True):
    w_, h_ = int(tw(s, f)) + 40, int(f.size * 1.3) + 20
    im = canvas(w_, h_); d = ImageDraw.Draw(im)
    if shadow:
        sh = canvas(w_, h_); ImageDraw.Draw(sh).text((20, 10), s, font=f, fill=(0, 0, 0, 200)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    d.text((20, 10), s, font=f, fill=col, stroke_width=stroke, stroke_fill=(0, 0, 0))
    return im
def centered(img, y, at, **kw): return Layer(img, (W - img.width) // 2, y, at, **kw)
def chip(label, col, size=36):
    f = font('mono', size); w_ = int(tw(label, f)) + 56; h_ = int(size * 1.9)
    im = canvas(w_, h_); d = ImageDraw.Draw(im)
    rr(d, [0, 0, w_ - 1, h_ - 1], 10, fill=col + (235,)); d.text((w_ / 2, h_ / 2), label, font=f, fill=BG, anchor='mm'); return im
def panel(w_, h_, r=26, fill=(14, 16, 24, 236)):
    im = canvas(w_, h_); d = ImageDraw.Draw(im); rr(d, [0, 0, w_ - 1, h_ - 1], r, fill=fill, outline=(255, 255, 255, 36), width=2); return im, d

def build(i, b, dur):
    k = b['kind']; L = []; st = starts[i]
    if k == 'hook':
        y = 520 if len(b['lines']) > 2 else 600
        for j, line in enumerate(b['lines']):
            acc = j == b.get('accent', -1)
            f = fit(line.upper(), 'black', 150 if acc else 128, 820 if acc else 860)
            if acc:
                tw_ = int(tw(line.upper(), f)); im = canvas(tw_ + 80, int(f.size * 1.25)); dd = ImageDraw.Draw(im)
                rr(dd, [0, 0, im.width - 1, im.height - 1], 18, fill=A1 + (255,))
                dd.text((40, im.height / 2), line.upper(), font=f, fill=BG, anchor='lm')
            else:
                im = text_img(line.upper(), f, TXT, stroke=0)
            L.append(centered(im, y, 0, pop=True)); y += int(f.size * (1.18 if acc else 1.08)) + (24 if j + 1 < len(b['lines']) and b.get('accent') == j + 1 else 0)
        if getattr(S, 'KICKER', ''):
            L.append(centered(chip(S.KICKER, A2, 34), (520 if len(b['lines']) > 2 else 600) - 110, 0, pop=True))
        sfx(st, 'impact')
    elif k == 'numswap':
        L.append(Layer(None, 0, 0, 0, fn=('numswap', b), fade=.01)); sfx(st + .05, 'click'); sfx(st + .7, 'lock'); sfx(st + 1.1, 'pop')
    elif k in ('photo', 'point'):
        if b.get('head'):
            L.append(Layer(chip(b['head'].upper(), A1, 38), 70, 250, 0, slide=-300)); sfx(st, 'click')
        f = font('black', 104); lines = wrap(b.get('body', ''), f, 930); y = 360
        for j, ln in enumerate(lines):
            L.append(Layer(text_img(ln, f, TXT), 50, y, .1 + j * .12, dy=40)); y += int(f.size * 1.1)
        if k == 'photo' and not PH.get(b.get('photo', '')) and not b.get('illo'): b['illo'] = 'eye'
        if b.get('illo') and (k == 'point' or not PH.get(b.get('photo', ''))):
            L.append(Layer(None, (W - IW) // 2, max(y + 40, 740), .2, fn=('illo', b['illo']), pop=True)); sfx(st + .2, 'pop')
        if b.get('mark') and PH.get(b.get('photo', '')):
            mx, my = b['mark']; L.append(Layer(None, 0, 0, .55, fn=('reticle', (mx * W, my * H)), fade=.01)); sfx(st + .55, 'lock')
    elif k == 'stat':
        L.append(Layer(None, 0, 0, 0, fn=('count', b), fade=.01)); sfx(st, 'hit')
        if b.get('label'):
            f = font('xb', 78)
            for j, ln in enumerate(wrap(b['label'], f, 940)):
                L.append(centered(text_img(ln, f, TXT), 1010 + j * 90, .35 + j * .1))
        if b.get('source'):
            L.append(centered(text_img(b['source'], font('mono', 30), MUTED, shadow=False), 1250, .6))
        sfx(st + min(1.0, dur * .45), 'ding')
    elif k == 'doc':
        L.append(Layer(None, 0, 0, 0, fn=('doc', b), fade=.15)); sfx(st, 'paper'); sfx(st + .55, 'marker')
    elif k == 'headline':
        L.append(Layer(None, 0, 0, 0, fn=('headline', b), fade=.01)); sfx(st, 'whoosh'); sfx(st + .55, 'stamp')
    elif k == 'compare':
        L.append(Layer(None, 0, 0, 0, fn=('compare', b), fade=.01)); sfx(st + .05, 'hit'); sfx(st + min(1.2, dur * .45), 'hit')
    elif k == 'checklist':
        L.append(centered(text_img(b['head'], font('black', 100), TXT), 280, 0))
        n = len(b['items'])
        for j, it in enumerate(b['items']):
            im, d = panel(940, 180)
            d.ellipse([34, 40, 134, 140], fill=A1); d.line([(62, 92), (79, 110), (108, 72)], fill=BG, width=12, joint='curve')
            f = fit(it, 'xb', 62, 740); d.text((170, 90), it, font=f, fill=TXT, anchor='lm')
            a = .15 + j * (dur * .6 / max(n, 1)); L.append(centered(im, 470 + j * 210, a, pop=True)); sfx(st + a, 'tick')
    elif k == 'cta':
        L.append(Layer(None, 0, 0, 0, fn=('save', None), fade=.01)); sfx(st + .05, 'riser'); sfx(st + .45, 'ding')
        f = fit(b['lines'][0], 'black', 92, 960)
        for j, ln in enumerate(wrap(b['lines'][0], f, 960)):
            L.append(centered(text_img(ln, f, TXT), 980 + j * int(f.size * 1.1), .3 + j * .1))
        if len(b['lines']) > 1:
            L.append(centered(text_img(b['lines'][1], font('semi', 54), A1), 1240, .6))
    return L

# dynamic layer painters ------------------------------------------------------------
def reticle(t, pos):
    im = canvas(W, H); d = ImageDraw.Draw(im); x, y = pos
    r = 220 - 120 * ease_back(t / .45); a = int(255 * clamp(t / .15))
    d.ellipse([x - r, y - r, x + r, y + r], outline=A1 + (a,), width=10)
    for ang in (0, 90, 180, 270):
        ca, sa = math.cos(math.radians(ang)), math.sin(math.radians(ang))
        d.line([(x + ca * (r + 10), y + sa * (r + 10)), (x + ca * (r + 50), y + sa * (r + 50))], fill=A1 + (a,), width=10)
    if t > .4:
        rr(d, [x + r * .7, y - r - 70, x + r * .7 + 260, y - r - 14], 8, fill=A1 + (230,))
        d.text((x + r * .7 + 130, y - r - 42), 'LOOK HERE', font=font('mono', 30), fill=BG, anchor='mm')
    return im

def count(t, b):
    im = canvas(W, H); d = ImageDraw.Draw(im)
    p = ease(t / .9); v = b['value'] * p
    s = (b.get('prefix', '') + (f'{v:,.0f}' if float(b['value']).is_integer() else f'{v:,.1f}') + b.get('suffix', ''))
    f = fit(b.get('prefix', '') + f"{b['value']:,}" + b.get('suffix', ''), 'black', 330, 980)
    sc = 1 + .12 * (1 - ease((t - .9) / .25)) if t > .9 else 1
    g = canvas(W, 520); gd = ImageDraw.Draw(g); gd.text((W / 2, 260), s, font=font('black', int(f.size * sc)), fill=A1, anchor='mm')
    glow = g.filter(ImageFilter.GaussianBlur(28)); im.alpha_composite(glow, (0, 470)); im.alpha_composite(g, (0, 470))
    return im

def doc(t, b):
    im = canvas(W, H); d = ImageDraw.Draw(im)
    z = 1 + .22 * ease_io((t - .9) / 1.4)            # zoom into the highlighted lines
    pw, ph = 900, 960; px, py = 90, 290
    page = canvas(pw, ph); pd = ImageDraw.Draw(page)
    rr(pd, [0, 0, pw - 1, ph - 1], 18, fill=(238, 236, 228, 255))
    pd.text((50, 50), b.get('doc', 'Terms of Service').upper(), font=fit(b.get('doc', '').upper(), 'xb', 40, 800), fill=(30, 30, 36))
    pd.text((50, 108), b.get('section', ''), font=font('mono', 28), fill=(110, 110, 120))
    pd.line([(50, 160), (pw - 50, 160)], fill=(190, 188, 180), width=3)
    qf = font('serif', 46); ql = wrap('“' + b['quote'] + '”', qf, pw - 120)
    nl = b.get('lines', 7); hi0 = 2
    y = 200; rows = []
    for r_ in range(nl + len(ql)):
        if hi0 <= r_ < hi0 + len(ql): rows.append(('q', ql[r_ - hi0], y)); y += 66
        else: rows.append(('l', [520, 760, 690, 800, 610, 740, 560, 700, 650][r_ % 9], y)); y += 50
    for kind, val, yy in rows:
        if kind == 'l': pd.rounded_rectangle([50, yy + 10, 50 + val, yy + 26], 8, fill=(196, 194, 186))
    sweep = ease((t - .5) / .7)
    for j, (kind, val, yy) in enumerate([r for r in rows if r[0] == 'q']):
        lw = tw(val, qf); sp = clamp(sweep * len(ql) - j)
        if sp > 0: pd.rectangle([42, yy - 2, 58 + lw * sp, yy + 60], fill=A2 + (170,))
        pd.text((50, yy), val, font=qf, fill=(18, 18, 22))
    if t > 1.3:
        sa = ease_back((t - 1.3) / .35); stp = canvas(420, 120); sd = ImageDraw.Draw(stp)
        rr(sd, [6, 6, 414, 114], 14, outline=A1 + (255,), width=8); sd.text((210, 60), b.get('stamp', 'YOU AGREED'), font=fit(b.get('stamp', 'YOU AGREED'), 'black', 56, 370), fill=A1, anchor='mm')
        stp = stp.rotate(-9, expand=True, resample=Image.BICUBIC); s2 = 1.6 - .6 * sa
        stp = alpha(stp.resize((int(stp.width * s2), int(stp.height * s2))), sa)
        qend = [r for r in rows if r[0] == 'q'][-1][2] + 70
        page.alpha_composite(stp, (pw - stp.width - 30, min(ph - stp.height - 10, qend + 20)))
    qy = rows[hi0][2]
    cx_, cy_ = pw / 2, qy + 40
    if z > 1.001:
        page = page.resize((int(pw * z), int(ph * z)), Image.BILINEAR)
    im.alpha_composite(page, (int(px - (cx_ * z - cx_)), int(py - (cy_ * z - cy_))))
    if b.get('source'):
        rr(d, [90, 1272, 990, 1326], 10, fill=(0, 0, 0, 200))
        d.text((W / 2, 1299), 'SOURCE: ' + b['source'], font=fit('SOURCE: ' + b['source'], 'mono', 30, 860), fill=TXT, anchor='mm')
    return im

def headline(t, b):
    im = canvas(W, H)
    p = ease_back(t / .45); card, d = panel(960, 560, 22, fill=(246, 245, 240, 255))
    d.text((44, 40), b.get('outlet', '').upper(), font=font('black', 44), fill=(20, 20, 24))
    d.text((916, 52), b.get('date', ''), font=font('mono', 28), fill=(120, 120, 128), anchor='ra')
    d.line([(44, 110), (916, 110)], fill=(20, 20, 24), width=4)
    f = font('serif', 64); y = 140
    for ln in wrap(b['title'], f, 870)[:5]: d.text((44, y), ln, font=f, fill=(16, 16, 20)); y += 78
    for k_ in range(3): d.rounded_rectangle([44, y + 30 + k_ * 34, 44 + [820, 700, 540][k_], y + 46 + k_ * 34], 8, fill=(200, 198, 190))
    rot = -4 + 4 * (1 - p); card = card.rotate(rot, expand=True, resample=Image.BICUBIC)
    x = (W - card.width) // 2 + int((1 - ease(t / .4)) * 900); im.alpha_composite(card, (x, 470))
    if t > .55:
        sa = ease_back((t - .55) / .3); stp = chip(b.get('ref', 'REF 01'), A1, 40)
        s2 = 1.8 - .8 * sa; stp = alpha(stp.resize((int(stp.width * s2), int(stp.height * s2))), sa)
        im.alpha_composite(stp, (W - 110 - stp.width, 420))
    return im

def compare(t, b, dur):
    im = canvas(W, H); d = ImageDraw.Draw(im)
    sp = (b.get('split') or min(1.2, dur * .45))
    for j, (side, col, mark) in enumerate([(b['left'], (120, 124, 140), 'X'), (b['right'], A1, 'OK')]):
        at = 0 if j == 0 else sp; lt = t - at
        if lt < 0: continue
        p = ease(lt / .35); y0 = 270 + j * 510
        pn, pd = panel(960, 470, 28, fill=(14, 16, 24, 236))
        pd.text((50, 50), side[0], font=font('mono', 40), fill=col)
        f = font('black', 84); yy = 130
        for ln in wrap(side[1], f, 860)[:3]: pd.text((50, yy), ln, font=f, fill=TXT if j else (190, 192, 200)); yy += 96
        im.alpha_composite(alpha(pn, p), (60 + int((1 - p) * (-200 if j == 0 else 200)), y0))
        if lt > .25:
            sa = ease_back((lt - .25) / .3); r = 70 * sa; cx_, cy_ = 930, y0 + 70
            d.ellipse([cx_ - r, cy_ - r, cx_ + r, cy_ + r], fill=((200, 60, 60) if j == 0 else col) + (255,))
            if j == 0: d.line([(cx_ - r * .4, cy_ - r * .4), (cx_ + r * .4, cy_ + r * .4)], fill=TXT, width=12); d.line([(cx_ + r * .4, cy_ - r * .4), (cx_ - r * .4, cy_ + r * .4)], fill=TXT, width=12)
            else: d.line([(cx_ - r * .45, cy_), (cx_ - r * .1, cy_ + r * .35), (cx_ + r * .45, cy_ - r * .35)], fill=BG, width=12, joint='curve')
    return im
starts_cur = [0]

def numswap(t, b, dur):
    """A phone-number card changes owner: OLD OWNER label strikes out, NEW OWNER slides in, then a login-code
    text bubble flies to the new owner. Generic drawing, no brand UI."""
    im = canvas(W, H); d = ImageDraw.Draw(im)
    p = ease_back(t / .4); cw, ch = 940, 330
    card, cd = panel(cw, ch, 30, fill=(16, 18, 30, 240))
    cd.text((50, 52), 'PHONE NUMBER', font=font('mono', 32), fill=MUTED)
    num = b.get('number', '+1 (555) 014-2297'); nshow = int(len(num) * ease(t / .7))
    cd.text((50, 170), num[:nshow] + ('_' if nshow < len(num) and int(t * 8) % 2 else ''), font=fit(num, 'black', 112, 840), fill=TXT, anchor='lm')
    sw = ease((t - .45) / .3)
    lab_old = 'OWNER: YOU'; fo = font('mono', 40)
    cd.text((50, 270), lab_old, font=fo, fill=(MUTED if sw > 0 else A1), anchor='lm')
    if sw > 0: cd.line([(44, 272), (44 + (tw(lab_old, fo) + 12) * sw, 272)], fill=(255, 90, 90), width=8)
    if t > .7:
        q = ease_back((t - .7) / .3); nl = chip('NEW OWNER: STRANGER', A2, 36)
        cd2 = alpha(nl, q); card.alpha_composite(cd2, (int(cw - 30 - nl.width + (1 - q) * 120), 240))
    s_ = .7 + .3 * p; cimg = card.resize((max(1, int(cw * s_)), max(1, int(ch * s_))), Image.BILINEAR)
    im.alpha_composite(alpha(cimg, clamp(t / .2)), ((W - cimg.width) // 2, 400 + (ch - cimg.height) // 2))
    if t > 1.1:   # login-code text bubble flies down to the new owner
        q = ease((t - 1.1) / .4); bw, bh = 760, 190
        bub, bd = panel(bw, bh, 40, fill=(235, 238, 245, 250))
        bd.text((44, 46), 'TEXT MESSAGE', font=font('mono', 28), fill=(110, 112, 125))
        bd.text((44, 120), 'Your login code: 48 21 07', font=fit('Your login code: 48 21 07', 'xb', 54, 680), fill=(16, 16, 22), anchor='lm')
        y = int(760 + 120 * (1 - q) - 30 * math.sin(min(1, q) * math.pi))
        im.alpha_composite(alpha(bub, q), ((W - bw) // 2 + 40, y))
        if t > 1.6:
            a = ease((t - 1.6) / .3); f = font('black', 64)
            ti = text_img('...sent to the stranger', f, A1); im.alpha_composite(alpha(ti, a), ((W - ti.width) // 2, 1010))
    return im

def save_icon(t):
    im = canvas(W, H); d = ImageDraw.Draw(im)
    p = ease_back(t / .5); bob = 12 * math.sin(t * 4)
    w_, h_ = 300 * p, 380 * p; cx_, cy_ = W / 2, 620 + bob
    if w_ > 4:
        fill_p = ease((t - .5) / .4)
        pts = [(cx_ - w_ / 2, cy_ - h_ / 2), (cx_ + w_ / 2, cy_ - h_ / 2), (cx_ + w_ / 2, cy_ + h_ / 2), (cx_, cy_ + h_ / 2 - w_ * .35), (cx_ - w_ / 2, cy_ + h_ / 2)]
        d.polygon(pts, outline=TXT, width=14)
        if fill_p > 0:
            g = canvas(W, H); gd = ImageDraw.Draw(g); gd.polygon(pts, fill=A1 + (int(255 * fill_p),)); im.alpha_composite(g.filter(ImageFilter.GaussianBlur(30))); im.alpha_composite(g)
    return im

def paint(ly, lt, b, dur):
    kind, arg = ly.fn
    if kind == 'illo': return illo(arg, lt)
    if kind == 'reticle': return reticle(lt, arg)
    if kind == 'count': return count(lt, arg)
    if kind == 'doc': return doc(lt, arg)
    if kind == 'headline': return headline(lt, arg)
    if kind == 'compare': return compare(lt, arg, dur)
    if kind == 'save': return save_icon(lt)
    if kind == 'numswap': return numswap(lt, arg, dur)

# ------------------------------------------------------------------ captions (word by word, current word boxed)
CF = font('black', 76)
CAPS = []
for i, b in enumerate(B):
    words = b['text'].split(); tot = sum(len(w_) + 1 for w_ in words); acc = 0; grp = []
    for w_ in words:
        s0 = starts[i] + durs[i] * acc / tot; acc += len(w_) + 1; e0 = starts[i] + durs[i] * acc / tot
        grp.append((w_, s0, e0))
        if len(grp) == 3 or w_[-1] in '.,:;?!—':
            CAPS.append(grp); grp = []
    if grp: CAPS.append(grp)
CAPS = [(g[0][1], g[-1][2], g) for g in CAPS]
CAPS = [(s, CAPS[j + 1][0] if j + 1 < len(CAPS) and CAPS[j + 1][0] - e < .45 else e, g) for j, (s, e, g) in enumerate(CAPS)]
CAP_STARTS = [s for s, _, _ in CAPS]
_cc = {}
def cap_img(g, hi):
    key = (tuple(x[0] for x in g), hi)
    if key in _cc: return _cc[key]
    ws = [x[0].upper().strip('"“”') for x in g]; f = CF; sp = tw(' ', f)
    tot = sum(tw(w_, f) for w_ in ws) + sp * (len(ws) - 1)
    if tot > 900: f = font('black', int(76 * 900 / tot)); sp = tw(' ', f)
    wl = [tw(w_, f) for w_ in ws]; tot = sum(wl) + sp * (len(ws) - 1)
    im = canvas(tot + 60, f.size * 1.6); d = ImageDraw.Draw(im); x = 30; cy_ = im.height / 2
    for j, w_ in enumerate(ws):
        if j == hi: rr(d, [x - 12, cy_ - f.size * .62, x + wl[j] + 12, cy_ + f.size * .62], 12, fill=A1 + (255,))
        d.text((x, cy_), w_, font=f, fill=(BG if j == hi else TXT), anchor='lm', stroke_width=0 if j == hi else 6, stroke_fill=(0, 0, 0))
        x += wl[j] + sp
    _cc[key] = im; return im
CAP_Y = getattr(S, 'CAP_Y', 1390)

# ------------------------------------------------------------------ frame
def glitch(rgb, amt, r_):
    if amt <= 0: return rgb
    out = rgb.copy(); s = int(26 * amt)
    out[..., 0] = np.roll(rgb[..., 0], s, axis=1); out[..., 2] = np.roll(rgb[..., 2], -s, axis=1)
    for _ in range(int(7 * amt) + 1):
        y = r_.randrange(0, H - 80); h_ = r_.randrange(20, 120); dx = r_.randrange(-90, 90)
        out[y:y + h_] = np.roll(out[y:y + h_], dx, axis=1)
    return out

def render_frame(fi, built):
    t = fi / FPS
    bi = max(i for i, s in enumerate(starts) if s <= t + 1e-6) if t >= starts[0] else 0
    b = B[bi]; st = starts[bi]; dur = durs[bi]; lt = t - st; starts_cur[0] = st
    if bi not in built: built.clear(); built[bi] = build(bi, b, dur)
    ph = photo_frame(b['photo'], lt, ends[bi] - st, bi) if b.get('photo') else None
    if ph is not None and b.get('style') == 'card':
        # parallax split: dark blurred plate drifting one way + sharp framed card drifting the other
        plate = ph.filter(ImageFilter.GaussianBlur(26)); plate = Image.blend(plate, Image.new('RGBA', (W, H), BG + (255,)), .35)
        cwid, chei = 900, 660; base = photo_base(b['photo']); pp = ease_io(lt / max(ends[bi] - st, .1))
        crop = ImageOps.fit(base, (cwid, chei), Image.LANCZOS, centering=(.5, .5 - .08 * pp))
        z = 1.08 - .06 * pp; crop = crop.resize((int(cwid * z), int(chei * z)), Image.BILINEAR)
        crop = crop.crop(((crop.width - cwid) // 2, (crop.height - chei) // 2, (crop.width - cwid) // 2 + cwid, (crop.height - chei) // 2 + chei)).convert('RGBA')
        m = Image.new('L', (cwid, chei), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, cwid - 1, chei - 1], 34, fill=255); crop.putalpha(m)
        fr = plate.copy(); sh = canvas(cwid + 120, chei + 120); ImageDraw.Draw(sh).rounded_rectangle([60, 70, cwid + 60, chei + 70], 34, fill=(0, 0, 0, 190))
        cx0 = (W - cwid) // 2 + int(-40 + 80 * pp); cy0 = 720 - int(30 * pp)
        fr.alpha_composite(sh.filter(ImageFilter.GaussianBlur(24)), (cx0 - 60, cy0 - 60))
        ring = canvas(cwid + 12, chei + 12); ImageDraw.Draw(ring).rounded_rectangle([0, 0, cwid + 11, chei + 11], 38, outline=A1 + (220,), width=5)
        fr.alpha_composite(crop, (cx0, cy0)); fr.alpha_composite(ring, (cx0 - 6, cy0 - 6)); ph = fr
    elif ph is not None and lt < .45:
        ph = ph.filter(ImageFilter.GaussianBlur(16 * (1 - ease(lt / .45))))      # rack-focus pull
    fr = ph if ph is not None else bg_frame(t)
    if ph is not None:                                                            # drifting light leak
        lx = int(-300 + 1500 * ((t * .09 + bi * .37) % 1)); leak = LEAK.copy()
        fr.alpha_composite(leak, (lx - 600, int(200 + 300 * math.sin(t * .4 + bi))))
    if ph is not None:
        grad = canvas(W, H); gd = ImageDraw.Draw(grad)
        for y in range(0, H, 8):
            a = int(200 * max(clamp((620 - y) / 620), clamp((y - 1150) / 600) * .9)); gd.rectangle([0, y, W, y + 8], fill=(0, 0, 0, a))
        fr.alpha_composite(grad)
    for ly in built[bi]:
        l2 = lt - ly.at
        if l2 < 0: continue
        img = paint(ly, l2, b, dur) if ly.fn else ly.img
        if img is None: continue
        x, y = ly.x, ly.y; pr = ease(l2 / ly.fade) if ly.fade > .02 else 1
        if ly.pop:
            s = .55 + .45 * ease_back(l2 / .32)
            if bi == 0 and ly.at == 0: s = 1.06 - .06 * ease(l2 / .25); pr = 1   # frame-0 slam, readable at once
            if abs(s - 1) > .002:
                ow, oh = img.width, img.height; img = img.resize((max(1, int(ow * s)), max(1, int(oh * s))), Image.BILINEAR)
                x += (ow - img.width) // 2; y += (oh - img.height) // 2
        elif ly.slide: x = int(x + ly.slide * (1 - ease(l2 / .3)))
        else: y = int(y + ly.dy * (1 - pr))
        fr.alpha_composite(alpha(img, pr), (int(x), int(y)))
    fr.alpha_composite(hud(t, bi))
    # camera: slow drift + micro punch-in on every caption group (a visual change every ~1.5 s)
    cs = max([s for s in CAP_STARTS if s <= t] or [0]); k_ = CAP_STARTS.index(cs) if cs in CAP_STARTS else 0
    punch = .035 * (1 - ease((t - cs) / .35)) if t - cs < .35 and k_ % 2 == 0 else 0
    z = 1.0 + .03 * ease_io(lt / max(dur, .1)) + punch
    shake = 0
    if bi == 0 and lt < .35: shake = 14 * (1 - lt / .35)
    if abs(z - 1) > .001 or shake:
        nw, nh = int(W * z), int(H * z); big = fr.resize((nw, nh), Image.BILINEAR)
        ox = (nw - W) // 2 + int(shake * math.sin(fi * 2.1)); oy = (nh - H) // 2 + int(shake * math.cos(fi * 1.7))
        fr = big.crop((ox, oy, ox + W, oy + H))
    for s, e, g in CAPS:     # captions drawn after camera so they stay steady
        if s <= t < e:
            hi = max(j for j, (_, s0, _) in enumerate(g) if s0 <= t)
            ci = cap_img(g, hi); pp = 1 + .1 * (1 - ease((t - s) / .12))
            if pp > 1.002: ci = ci.resize((int(ci.width * pp), int(ci.height * pp)), Image.BILINEAR)
            fr.alpha_composite(ci, ((W - ci.width) // 2, CAP_Y - ci.height // 2)); break
    rgb = np.asarray(fr.convert('RGB')).astype(np.float32)
    rgb = rgb * VIG
    g_ = GRAIN[fi % len(GRAIN)]; rgb += np.repeat(np.repeat(g_, 2, 0), 2, 1)
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    # glitch cut around each beat change
    for i in range(1, len(B)):
        dt_ = t - starts[i]
        if -0.1 <= dt_ < 0.12: rgb = glitch(rgb, 1 - abs(dt_) / .12, random.Random(fi)); break
    if t > TOTAL - .25: rgb = (rgb * max(0, (TOTAL - t) / .25)).astype(np.uint8)
    return rgb

def main(preview=False):
    for i in range(1, len(B)): sfx(starts[i] - .08, 'whoosh'); sfx(starts[i], 'hit')
    built = {}
    if preview:
        os.makedirs('rpreview', exist_ok=True)
        for i, s in enumerate(starts):
            for tag, tt in (('a', s + .02 if i == 0 else s + .45), ('b', s + min(durs[i] * .8, 2.2))):
                fi = int(tt * FPS); Image.fromarray(render_frame(fi, built)).save(f'rpreview/b{i:02d}{tag}_f{fi:04d}.jpg', quality=85)
        Image.fromarray(render_frame(0, built)).save('rpreview/frame0.jpg', quality=90)
        print('preview frames in rpreview/  total', round(TOTAL, 2), 's'); return
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', 'reel_noaudio.mp4'], stdin=subprocess.PIPE)
    for fi in range(NF):
        p.stdin.write(render_frame(fi, built).tobytes())
        if fi % 150 == 0: print('frame', fi, '/', NF, flush=True)
    p.stdin.close(); p.wait()
    json.dump({'starts': starts, 'durs': durs, 'total': TOTAL, 'sfx': sorted(SFX)}, open('reel_timeline.json', 'w'))
    print('done reel_noaudio.mp4', round(TOTAL, 2), 's')

if __name__ == '__main__':
    main(preview=len(sys.argv) > 1 and sys.argv[1] == 'preview')
