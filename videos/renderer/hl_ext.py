# Hidden Layer long-form extension (exec'd inside render.py): real-photo backgrounds with cinematic motion
# (Ken Burns, parallax split, rack focus, light leak, grain, vignette, colour grade) + realistic proof beats
# (doc_quote, counter, chart, receipt, myth, surgemap) + source lower-thirds.
import cv2
TG = '/usr/share/texmf/fonts/opentype/public/tex-gyre/'
DJ = '/usr/share/fonts/truetype/dejavu/'
_xf = {}
def xfont(kind, size):
    k = (kind, size)
    if k not in _xf:
        _xf[k] = ImageFont.truetype({'serif': TG + 'texgyretermes-regular.otf', 'serifb': TG + 'texgyretermes-bold.otf',
                                     'serifi': TG + 'texgyretermes-italic.otf', 'mono': DJ + 'DejaVuSansMono.ttf',
                                     'monob': DJ + 'DejaVuSansMono-Bold.ttf'}[kind], size)
    return _xf[k]

def ease_io(x):
    x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)

PHOTO_DIR = 'photos'
# fractional regions to blur inside a photo (phone screens, signs)
PHOTO_BLUR = getattr(S, 'PHOTO_BLUR', {})
EXT_KINDS = {'photo', 'doc_quote', 'counter', 'chart', 'receipt', 'myth', 'surgemap'}

def grade(a):
    x = a.astype(np.float32) / 255.0
    L = (x * np.array([.299, .587, .114], np.float32)).sum(2, keepdims=True)
    x = L + (x - L) * 0.80                       # gentle desaturation
    x = np.clip((x - 0.5) * 1.10 + 0.5, 0, 1)    # contrast
    sh = (1 - L) ** 2; hi = L ** 2
    x = x + sh * (np.array(A2, np.float32) / 255 - 0.4) * 0.12 + hi * (np.array(A1, np.float32) / 255 - 0.5) * 0.10
    x = x * 0.93 + 0.03                          # lifted blacks, soft highlights
    return np.clip(x * 255, 0, 255).astype(np.uint8)

_ph = {}
def photo(key):
    if key in _ph: return _ph[key]
    p = os.path.join(PHOTO_DIR, key + '.jpg')
    a = cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB)
    h, w = a.shape[:2]
    for (x0, y0, x1, y1) in PHOTO_BLUR.get(key, []):
        X0, Y0, X1, Y1 = int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)
        a[Y0:Y1, X0:X1] = cv2.GaussianBlur(a[Y0:Y1, X0:X1], (0, 0), 25)
    BWm, BHm = int(W * 1.16), int(H * 1.16)
    if w / h < 1.2:   # too tall for 16:9: blurred fill + fitted image
        s = BWm / w; fill = cv2.resize(a, (BWm, int(h * s)))
        y0 = max(0, (fill.shape[0] - BHm) // 2); fill = fill[y0:y0 + BHm]
        fill = cv2.resize(fill, (BWm, BHm)); fill = cv2.GaussianBlur(fill, (0, 0), 40)
        fill = (fill * 0.55).astype(np.uint8)
        s2 = BHm / h if w * BHm / h <= BWm else BWm / w
        fit = cv2.resize(a, (int(w * s2), int(h * s2)), interpolation=cv2.INTER_CUBIC)
        if fit.shape[0] >= BHm * 0.98 and fit.shape[1] >= BWm * 0.75:
            # wide enough: just cover-crop instead
            s3 = max(BWm / w, BHm / h); big = cv2.resize(a, (int(w * s3) + 1, int(h * s3) + 1), interpolation=cv2.INTER_CUBIC)
            yy = (big.shape[0] - BHm) // 2; xx = (big.shape[1] - BWm) // 2; big = big[yy:yy + BHm, xx:xx + BWm]
        else:
            big = fill.copy(); ox = (BWm - fit.shape[1]) // 2; oy = (BHm - fit.shape[0]) // 2
            big[oy:oy + fit.shape[0], ox:ox + fit.shape[1]] = fit
    else:
        s3 = max(BWm / w, BHm / h); big = cv2.resize(a, (int(w * s3) + 1, int(h * s3) + 1), interpolation=cv2.INTER_CUBIC)
        yy = (big.shape[0] - BHm) // 2; xx = (big.shape[1] - BWm) // 2; big = big[yy:yy + BHm, xx:xx + BWm]
    big = cv2.GaussianBlur(big, (0, 0), 0.6)
    g = grade(big)
    blur = cv2.GaussianBlur(g, (0, 0), 16)
    bgc = np.array(BG, np.float32)
    dim = np.clip(blur.astype(np.float32) * 0.36 + bgc * 0.45, 0, 255).astype(np.uint8)
    _ph[key] = dict(sharp=g, blur=blur, dim=dim)
    return _ph[key]

_yy, _xx = np.mgrid[0:H, 0:W].astype(np.float32)
PMASK = np.clip(1.6 - np.sqrt(((_xx - W * .5) / (W * .40)) ** 2 + ((_yy - H * .52) / (H * .46)) ** 2), 0, 1)
PMASK = cv2.GaussianBlur(PMASK, (0, 0), 40)[..., None]
_v = np.sqrt(((_xx - W / 2) / (W * .62)) ** 2 + ((_yy - H / 2) / (H * .62)) ** 2)
VIG = np.repeat((np.clip(1.08 - 0.55 * _v ** 2.2, 0.35, 1) * 255).astype(np.uint8)[..., None], 3, 2)
_rng = np.random.default_rng(7)
GRAIN = []
for _ in range(6):
    n = _rng.normal(0, 5.0, (H // 2, W // 2)).astype(np.float32)
    n = cv2.resize(n, (W, H), interpolation=cv2.INTER_LINEAR)
    GRAIN.append((np.clip(n, 0, 40).astype(np.uint8)[..., None].repeat(3, 2), np.clip(-n, 0, 40).astype(np.uint8)[..., None].repeat(3, 2)))
# light leak plate (warm amber + blue), wider than the frame so it can drift
_lw = int(W * 1.6)
_ly, _lx = np.mgrid[0:H, 0:_lw].astype(np.float32)
LEAK = np.zeros((H, _lw, 3), np.float32)
for (cx, cy, r, col, k) in [(W * .25, H * .1, W * .28, (255, 150, 60), .55), (W * 1.2, H * .9, W * .30, A1, .45), (W * .8, -H * .1, W * .2, A2, .25)]:
    LEAK += np.exp(-(((_lx - cx) ** 2 + (_ly - cy) ** 2) / (2 * r * r)))[..., None] * np.array(col, np.float32) * k
LEAK = np.clip(LEAK, 0, 255).astype(np.uint8)
del _yy, _xx, _v, _ly, _lx

def _warp(img, s, cx, cy):
    """scale img by s around its point (cx,cy) which lands at the frame centre"""
    M = np.float32([[s, 0, W / 2 - s * cx], [0, s, H / 2 - s * cy]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def kb(key, bi, tl, which='sharp', mode='push'):
    P = photo(key); img = P[which]; bh, bw = img.shape[:2]
    s0 = max(W / bw, H / bh) * 1.0
    dur = durs[bi] + 1.2
    p = ease_io(tl / dur)
    rnd = random.Random(bi * 7 + 3)
    ang = rnd.uniform(0, 2 * math.pi); dx, dy = math.cos(ang), math.sin(ang) * .6
    if mode == 'pull': z = 1.13 - 0.11 * p
    elif mode == 'parallax': z = 1.04 + 0.05 * p
    else: z = 1.02 + 0.11 * p
    s = s0 * z
    mx = max(0, (bw - W / s) / 2) * .85; my = max(0, (bh - H / s) / 2) * .85
    q = (p - .5) * 2
    cx = bw / 2 + dx * mx * q; cy = bh / 2 + dy * my * q
    out = _warp(img, s, cx, cy)
    if mode == 'parallax' and which == 'sharp':
        back = _warp(P['blur'], s * 0.97, bw / 2 - dx * mx * q * .6, bh / 2 - dy * my * q * .6)
        fg = _warp(img, s * 1.05, cx + dx * mx * q * .25, cy + dy * my * q * .25)
        out = (fg.astype(np.float32) * PMASK + back.astype(np.float32) * (1 - PMASK)).astype(np.uint8)
    return out

def beat_bg(i, t):
    b = B[i]; tl = t - starts[i]
    key = b.get('photo')
    if not key: return bg_frame(t)
    if b['kind'] == 'photo':
        f = kb(key, i, tl, 'sharp', b.get('mode', 'push'))
        if tl < 0.9:   # rack focus pull
            sg = (1 - ease(tl / 0.9)) * 9
            if sg > 0.3: f = cv2.GaussianBlur(f, (0, 0), sg)
        return f
    return kb(key, i, tl, 'dim', 'push')

def bg_for(i, t, tl):
    f = beat_bg(i, t)
    if i > 0 and tl < 0.35 and B[i - 1].get('photo') != B[i].get('photo'):
        pf = beat_bg(i - 1, t)
        a = ease(tl / 0.35)
        f = cv2.addWeighted(f, a, pf, 1 - a, 0)
    return np.ascontiguousarray(f)

def post_fx(frame, b, tl, t, fi):
    rgb = np.asarray(frame.convert('RGB'))
    if b.get('photo') and b['kind'] in ('photo', 'counter', 'doc_quote', 'hero'):
        off = int((math.sin(t * 0.21 + starts.index(starts[0])) * .5 + .5) * (_lw - W))
        k = 0.10 + 0.08 * math.sin(t * 0.7) ** 2
        if b['kind'] == 'photo': k += 0.06
        rgb = cv2.addWeighted(rgb, 1.0, LEAK[:, off:off + W], k, 0)
    rgb = cv2.multiply(rgb, VIG, scale=1 / 255)
    gp, gn = GRAIN[fi % len(GRAIN)]
    rgb = cv2.subtract(cv2.add(rgb, gp), gn)
    return Image.fromarray(rgb).convert('RGBA')

# ------------------------------------------------------------------ shared pieces
def lower_third(text):
    f = font('semi', 28); tmp = ImageDraw.Draw(canvas(1, 1)); tw = int(text_w(tmp, text, f))
    im = canvas(tw + 70, 58); d = ImageDraw.Draw(im)
    rr(d, [0, 0, tw + 69, 57], 12, fill=(6, 7, 14, 200))
    d.rectangle([0, 0, 7, 57], fill=A1)
    d.text((30, 29), text, font=f, fill=(225, 228, 238), anchor='lm')
    return im

GRAD_L = None
def left_grad():
    global GRAD_L
    if GRAD_L is None:
        a = np.zeros((H, W, 4), np.uint8); a[..., :3] = BG
        x = np.linspace(0, 1, W)
        al = np.clip(1.0 - x / 0.62, 0, 1) ** 1.4 * 200
        y = np.linspace(0, 1, H); al2 = np.clip((y - 0.55) / 0.45, 0, 1) ** 1.5 * 150
        a[..., 3] = np.clip(np.maximum(al[None, :], al2[:, None]), 0, 255).astype(np.uint8)
        GRAD_L = Image.fromarray(a, 'RGBA')
    return GRAD_L

def wrap_px(s, f, maxw):
    tmp = ImageDraw.Draw(canvas(1, 1)); return wrap(tmp, s, f, maxw)

def paper_noise(w, h, base, amt=6, seed=1):
    r = np.random.default_rng(seed)
    n = r.normal(0, amt, (h, w)).astype(np.float32)
    n = cv2.GaussianBlur(n, (0, 0), 0.8)
    a = np.zeros((h, w, 4), np.float32); a[..., :3] = np.array(base, np.float32) + n[..., None]
    # slight paper vignette
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    v = 1 - 0.06 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    a[..., :3] *= v[..., None]; a[..., 3] = 255
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')

def with_shadow(im, blur=26, off=(0, 18), alpha=150, pad=60):
    out = canvas(im.width + pad * 2, im.height + pad * 2)
    sh = canvas(out.width, out.height); sd = ImageDraw.Draw(sh)
    sd.rectangle([pad + off[0], pad + off[1], pad + off[0] + im.width, pad + off[1] + im.height], fill=(0, 0, 0, alpha))
    out.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur))); out.alpha_composite(im, (pad, pad))
    return out

# ------------------------------------------------------------------ doc_quote
def build_doc(b):
    style = b.get('style', 'memo'); PW = 1260
    if style in ('blog', 'web'):
        base = (250, 250, 252); ink = (24, 26, 34); qf = font('bold', 54); hf = font('semi', 24); lf = font('med', 26)
    elif style == 'paper':
        base = (252, 251, 247); ink = (20, 20, 22); qf = xfont('serifi', 60); hf = xfont('serif', 26); lf = xfont('serif', 26)
    else:
        base = (243, 239, 228); ink = (28, 26, 24); qf = xfont('serifb', 62); hf = font('semi', 23); lf = xfont('serif', 28)
    q = '“' + b['quote'] + '”'
    lines = wrap_px(q, qf, PW - 180)
    lh = int(qf.size * 1.22)
    PH_ = 150 + 70 + len(lines) * lh + 70 + 120
    paper = paper_noise(PW, PH_, base, seed=len(b['quote']))
    d = ImageDraw.Draw(paper)
    if style in ('blog', 'web'):
        d.rectangle([0, 0, PW, 54], fill=(232, 234, 240))
        for k in range(3): d.ellipse([24 + k * 30, 19, 40 + k * 30, 35], fill=(200, 203, 212))
        rr(d, [140, 14, PW - 140, 40], 13, fill=(250, 250, 252))
        top = 92
    else:
        top = 60
    while d.textlength(b['doc'], font=hf) > PW - 180 and hf.size > 14:
        hf = font('semi', hf.size - 1) if style != 'paper' else xfont('serif', hf.size - 1)
    d.text((90, top), b['doc'], font=hf, fill=(110, 108, 104) if style != 'blog' else (100, 104, 120))
    d.line([90, top + 48, PW - 90, top + 48], fill=(200, 196, 186), width=2)
    # faint context lines (surrounding text, unreadable on purpose)
    rnd = random.Random(len(b['doc']))
    y = top + 78
    for k in range(2):
        d.rounded_rectangle([90, y + k * 26, 90 + rnd.randint(700, PW - 200), y + k * 26 + 10], 5, fill=(214, 210, 200))
    qy = y + 80
    boxes = []
    for i, ln in enumerate(lines):
        w_ = d.textlength(ln, font=qf); boxes.append((80, qy + i * lh - 6, 100 + w_, qy + i * lh + lh - 10))
        d.text((90, qy + i * lh), ln, font=qf, fill=ink)
    yb = qy + len(lines) * lh + 24
    for k in range(2):
        d.rounded_rectangle([90, yb + k * 26, 90 + rnd.randint(600, PW - 260), yb + k * 26 + 10], 5, fill=(214, 210, 200))
    d.line([90, PH_ - 92, PW - 90, PH_ - 92], fill=(205, 200, 190), width=2)
    d.text((90, PH_ - 52), 'Quoted word for word', font=lf, fill=(120, 116, 110), anchor='lm')
    paper_base = paper
    hl_lines = list(range(len(lines)))
    nper = 0.45
    st = canvas(330, 110); sd = ImageDraw.Draw(st)
    rr(sd, [6, 6, 324, 104], 14, outline=A2 + (235,), width=6)
    sd.text((165, 55), 'VERBATIM', font=font('black', 50), fill=A2 + (235,), anchor='mm')
    st = st.rotate(8, expand=True, resample=Image.BICUBIC)
    cache = {}
    def draw(lt):
        k = round(min(lt, 4.0) * 15) / 15
        if k in cache and lt > 3.9: return cache[k]
        im = paper_base.copy(); dd = ImageDraw.Draw(im)
        ov = canvas(PW, PH_); od = ImageDraw.Draw(ov)
        for j, i in enumerate(hl_lines):
            p = ease((lt - 0.7 - j * nper) / nper)
            if p <= 0: continue
            x0, y0, x1, y1 = boxes[i]
            od.rectangle([x0, y0 + 8, x0 + (x1 - x0) * p, y1], fill=(255, 205, 40, 120))
        im.alpha_composite(ov)
        # re-draw ink on top so the highlighter sits under the text
        for i, ln in enumerate(lines): dd.text((90, qy + i * lh), ln, font=qf, fill=ink)
        sp = ease_back((lt - 0.9 - len(lines) * nper) / 0.35)
        if sp > 0.02:
            s2 = 1 + 0.6 * (1 - min(1, sp))
            st2 = st.resize((int(st.width * s2), int(st.height * s2)), Image.BICUBIC)
            a = np.asarray(st2).copy(); a[..., 3] = (a[..., 3] * min(1, sp)).astype(np.uint8)
            im.alpha_composite(Image.fromarray(a), (PW - 60 - st2.width, PH_ - 30 - st2.height))
        im = im.rotate(-0.8 if style != 'blog' else 0, expand=True, resample=Image.BICUBIC)
        out = with_shadow(im)
        sc = 1 + 0.035 * ease_io(lt / (b['_dur'] + 1))
        if sc > 1.001:
            out = out.resize((int(out.width * sc), int(out.height * sc)), Image.BILINEAR)
        cache[k] = out
        return out
    ph = PH_ + 120
    y0 = max(70, (900 - ph) // 2 + 10)
    L = [Layer(None, W // 2 - (PW + 120) // 2, y0, 0.0, dy=50, dyn=('fn', draw))]
    return L

# ------------------------------------------------------------------ counter
def build_counter(b):
    fmt = b.get('fmt', '{:,.0f}'); val = b['value']
    def draw(lt):
        p = ease(lt / 1.4); v = val * p
        s = fmt.format(v)
        im = canvas(W, 520); d = ImageDraw.Draw(im)
        f = font('black', 230)
        g = canvas(W, 520); ImageDraw.Draw(g).text((W / 2, 170), s, font=f, fill=A1 + (255,), anchor='mm')
        im.alpha_composite(g.filter(ImageFilter.GaussianBlur(30))); im.alpha_composite(g)
        if lt > 0.5:
            a = int(255 * ease((lt - .5) / .5))
            d.text((W / 2, 345), b['label'], font=font('xb', 64), fill=TXT + (a,), anchor='mm')
            d.text((W / 2, 425), b.get('sub', ''), font=font('semi', 38), fill=(200, 205, 220, a), anchor='mm')
        return im
    return [Layer(None, 0, 180, 0.0, dy=40, dyn=('fn', draw))]

# ------------------------------------------------------------------ chart
def build_chart(b):
    L = []
    hd = canvas(1700, 80); ImageDraw.Draw(hd).text((0, 0), b['head'], font=font('black', 60), fill=TXT)
    L.append(Layer(hd, 160, 170, 0.05))
    bars = b['bars']; vmax = b['vmax']; BWID = 1180
    def draw(lt):
        im, d = glass(1600, 520, 34, fill=(14, 16, 28, 215))
        for j, (lab, v, txt) in enumerate(bars):
            y = 70 + j * 210
            d.text((60, y), lab, font=font('semi', 38), fill=(205, 210, 225))
            p = ease((lt - 0.3 - j * 0.6) / 1.0)
            w_ = BWID * (v / vmax) * p
            col = A1 if j == len(bars) - 1 else (110, 125, 160)
            if w_ > 20: rr(d, [60, y + 60, 60 + w_, y + 150], 18, fill=col + (255,))
            if p > 0:
                num = v * p
                s = (b.get('unit') == '£' and f'£{num:.2f}') or (b.get('unit') == '%' and f'{num:.0f}%') or f'{num:.0f}'
                d.text((60 + max(w_, 20) + 28, y + 105), s, font=font('black', 72), fill=col, anchor='lm')
        if b.get('note') and lt > 1.8:
            a = int(255 * ease((lt - 1.8) / .5))
            d.text((60, 470), b['note'], font=font('semi', 32), fill=(170, 176, 196, a), anchor='lm')
        return im
    L.append(Layer(None, 160, 265, 0.1, dy=40, dyn=('fn', draw)))
    return L

# ------------------------------------------------------------------ receipt (illustrative)
def build_receipt(b):
    L = []
    hd = canvas(800, 60); ImageDraw.Draw(hd).text((0, 0), 'ILLUSTRATIVE EXAMPLE', font=font('bold', 40), fill=A1)
    L.append(Layer(hd, 120, 300, .05))
    for i, ln in enumerate(['Made-up numbers.', 'Real structure.']):
        im = canvas(900, 110); ImageDraw.Draw(im).text((0, 0), ln, font=font('xb', 88), fill=TXT)
        L.append(Layer(im, 116, 380 + i * 100, .15 + i * .12))
    rows = b['rows']; RW, RH = 640, 700
    base = paper_noise(RW, RH, (246, 244, 238), amt=5, seed=3)
    # torn bottom edge
    m = Image.new('L', (RW, RH), 255); md = ImageDraw.Draw(m)
    pts = [(0, RH)] + [(x, RH - (14 if (x // 20) % 2 else 0)) for x in range(0, RW + 20, 20)] + [(RW, RH)]
    md.polygon(pts, fill=0); base.putalpha(m)
    bd = ImageDraw.Draw(base)
    bd.text((RW / 2, 60), 'TRIP FARE', font=xfont('monob', 40), fill=(30, 30, 30), anchor='mm')
    bd.text((RW / 2, 105), 'example · not a real receipt', font=xfont('mono', 22), fill=(120, 120, 120), anchor='mm')
    bd.line([40, 140, RW - 40, 140], fill=(150, 150, 150), width=2)
    span = max(2.5, b['_dur'] * 0.75)
    def draw(lt):
        im = base.copy(); d = ImageDraw.Draw(im)
        for j, (lab, val) in enumerate(rows):
            p = ease((lt - 0.4 - j * span / len(rows)) / 0.3)
            if p <= 0: continue
            y = 190 + j * 82; a = int(255 * p)
            q = val == '?'
            col = (A3 if q else (30, 30, 30)) + (a,)
            d.text((44, y), lab, font=xfont('mono', 27), fill=(50, 50, 50, a))
            vs = val if not q else '?'
            sz = 34 if not q else int(40 + 6 * abs(math.sin(lt * 4)))
            d.text((RW - 44, y + 14), vs, font=xfont('monob', sz), fill=col, anchor='rm')
        pt = ease((lt - 0.6 - span) / 0.4)
        if pt > 0:
            y = 190 + len(rows) * 82 + 10
            d.line([40, y, RW - 40, y], fill=(150, 150, 150), width=2)
            d.text((44, y + 40), 'TOTAL', font=xfont('monob', 34), fill=(30, 30, 30, int(255 * pt)), anchor='lm')
            d.text((RW - 44, y + 40), b['total'], font=xfont('monob', 34), fill=(30, 30, 30, int(255 * pt)), anchor='rm')
        return with_shadow(im.rotate(2, expand=True, resample=Image.BICUBIC))
    L.append(Layer(None, 1080, 70, 0.1, dy=60, dyn=('fn', draw)))
    return L

# ------------------------------------------------------------------ myth verdict
def build_myth(b):
    def draw(lt):
        im = canvas(1500, 700); d = ImageDraw.Draw(im)
        c = chip('MYTH', A3, 34, fg=TXT, fill_alpha=90); im.alpha_composite(c, (60, 20))
        f = font('xb', 92)
        lines = wrap(d, b['claim'], f, 1300)
        for i, ln in enumerate(lines):
            d.text((60, 110 + i * 104), ln, font=f, fill=TXT)
        p = ease((lt - 0.9) / 0.5)
        if p > 0:
            for i, ln in enumerate(lines):
                w_ = d.textlength(ln, font=f); y = 110 + i * 104 + 56
                d.line([50, y, 50 + (w_ + 20) * p, y], fill=A3, width=12)
        sp = (lt - 1.5) / 0.3
        if sp > 0:
            s = 1 + 1.2 * (1 - ease(sp))
            fs = font('black', 96); tw = d.textlength(b['verdict'], font=fs)
            st = canvas(int(tw + 90), 160); sd = ImageDraw.Draw(st)
            rr(sd, [8, 8, st.width - 8, 152], 20, outline=A1 + (255,), width=12)
            sd.text((st.width / 2, 80), b['verdict'], font=fs, fill=A1, anchor='mm')
            st = st.rotate(-6, expand=True, resample=Image.BICUBIC)
            st = st.resize((int(st.width * s), int(st.height * s)), Image.BICUBIC)
            a = np.asarray(st).copy(); a[..., 3] = (a[..., 3] * min(1, sp)).astype(np.uint8)
            im.alpha_composite(Image.fromarray(a), (int(1460 - st.width), int(110 + len(lines) * 104 + 75 - st.height / 2)))
        fp = ease((lt - 2.3) / 0.5)
        if fp > 0:
            c2 = chip('WHAT WE KNOW', A1, 30, fg=TXT, fill_alpha=70)
            a = np.asarray(c2).copy(); a[..., 3] = (a[..., 3] * fp).astype(np.uint8)
            y = 110 + len(lines) * 104 + 190
            im.alpha_composite(Image.fromarray(a), (60, y))
            d.text((60 + c2.width + 24, y + c2.height / 2), b['fact'], font=font('semi', 44), fill=TXT + (int(255 * fp),), anchor='lm')
        return im
    return [Layer(None, 210, 230, 0.0, dy=40, dyn=('fn', draw))]

# ------------------------------------------------------------------ surge map
def build_surgemap(b):
    L = []
    hd = canvas(900, 80); ImageDraw.Draw(hd).text((0, 0), b['head'], font=font('black', 66), fill=TXT)
    L.append(Layer(hd, 120, 230, .02))
    facts = [('43', 'locations tracked'), ('16', 'surge areas in Manhattan'), ('5 min', 'between price updates')]
    span = max(2.0, b['_dur'] * 0.7)
    for j, (n, lab) in enumerate(facts):
        im = canvas(900, 120); d = ImageDraw.Draw(im)
        d.text((0, 60), n, font=font('black', 84), fill=A1, anchor='lm')
        nw = d.textlength(n, font=font('black', 84))
        d.text((nw + 26, 64), lab, font=font('semi', 42), fill=TXT, anchor='lm')
        L.append(Layer(im, 120, 360 + j * 140, 0.4 + j * span / 3))
    cols = [(255, 214, 160), (255, 170, 90), (240, 110, 50), (200, 50, 40), (150, 20, 30)]
    def draw(lt):
        im, d = glass(760, 640, 30, fill=(14, 16, 28, 225))
        R = 46; hw = R * math.sqrt(3)
        step = int(lt / 1.1)
        for r_ in range(6):
            for c_ in range(6):
                x = 90 + c_ * hw + (hw / 2 if r_ % 2 else 0); y = 90 + r_ * R * 1.5
                rnd = random.Random(r_ * 31 + c_ * 7 + step * 101)
                base = math.exp(-(((c_ - 2.6) ** 2 + (r_ - 2.4) ** 2) / 5.0))
                lvl = min(4, max(0, int(base * 4.6 + rnd.uniform(-1.1, 1.1))))
                pts = [(x + R * .96 * math.cos(math.radians(60 * k + 30)), y + R * .96 * math.sin(math.radians(60 * k + 30))) for k in range(6)]
                d.polygon(pts, fill=cols[lvl] + (225,))
        d.text((380, 590), 'Illustration · prices recalculated by area', font=font('semi', 26), fill=MUTED, anchor='mm')
        return im
    L.append(Layer(None, 1060, 140, .2, dy=40, dyn=('fn', draw)))
    return L

# ------------------------------------------------------------------ photo beat
def build_photo(b):
    L = []
    if b.get('lines'):
        L.append(Layer(left_grad(), 0, 0, 0.0, dy=0))
        f = font('black', 124); lh = 136
        y0 = 560 - lh * (len(b['lines']) - 1)
        for i, ln in enumerate(b['lines']):
            ff = f
            while text_w(ImageDraw.Draw(canvas(1, 1)), ln, ff) > 1100: ff = font('black', ff.size - 6)
            im = canvas(1200, lh + 30); ImageDraw.Draw(im).text((0, 0), ln, font=ff, fill=A1 if i == b.get('accent', -1) else TXT)
            L.append(Layer(im, 110, y0 + i * lh, 0.35 + i * 0.18, dy=50))
    if b.get('label'):
        f = font('bold', 34); tmp = ImageDraw.Draw(canvas(1, 1)); tw = int(text_w(tmp, b['label'], f))
        im = canvas(tw + 80, 74); d = ImageDraw.Draw(im)
        rr(d, [0, 0, tw + 79, 73], 14, fill=(6, 7, 14, 190)); d.rectangle([0, 0, 8, 73], fill=A1)
        d.text((40, 37), b['label'], font=f, fill=TXT, anchor='lm')
        L.append(Layer(im, 110, 790, 0.5, dy=30))
    return L

def build_ext(b):
    k = b['kind']
    L = {'photo': build_photo, 'doc_quote': build_doc, 'counter': build_counter, 'chart': build_chart,
         'receipt': build_receipt, 'myth': build_myth, 'surgemap': build_surgemap}[k](b) if k in EXT_KINDS else []
    if b.get('src'):
        lt3 = lower_third(b['src'])
        y = 820 if k not in ('photo',) else 720
        L.append(Layer(lt3, 110, y, 0.8, dy=20))
    return L
