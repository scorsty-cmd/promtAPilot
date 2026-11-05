# Hidden Layer paper renderer (long form, 1920x1080) – style DNA: ink on paper, one highlighter, redaction bars.
# python3 render2.py --beats            -> preview sheets
# python3 render2.py --out x.mp4 [--start s --end e]
import sys, json, math, re, os, argparse, subprocess, functools, random
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import scenes as S
from photo_map import PHOTO_MAP, PHOTO_FOCUS

W, H, FPS = 1920, 1080, 30
PAPER = (236, 232, 222); INK = (18, 19, 22); HL = (228, 255, 60); MUTED = (138, 135, 126); GHOST = (189, 184, 172)
RULE = (215, 210,198); SHEET = (244, 241, 233); RECEIPT = (248, 247, 242)
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts')

@functools.lru_cache(None)
def F(kind, size):
    n = {'serif': 'InstrumentSerif-Regular.ttf', 'ital': 'InstrumentSerif-Italic.ttf', 'mono': 'IBMPlexMono-Medium.ttf'}[kind]
    return ImageFont.truetype(os.path.join(FD, n), size)

def clamp(x, a=0., b=1.): return max(a, min(b, x))
def ease(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return x * x * (3 - 2 * x)
def back(x):
    x = clamp(x); c = 1.6; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

tl = json.load(open('timeline.json')); STARTS, DURS, TOTAL = tl['starts'], tl['durs'], tl['total']
SENT = json.load(open('vo/sent.json'))
B = S.B
rnd = random.Random(3)

# ---------------------------------------------------------------- photos
@functools.lru_cache(None)
def photo(key, blur=0):
    fn = PHOTO_MAP[key]
    im = cv2.imread('photos/' + fn)[:, :, ::-1].astype(np.float32)
    h, w = im.shape[:2]; TW, TH = int(W * 1.12), int(H * 1.12)
    sc = max(TW / w, TH / h); im = cv2.resize(im, (int(w * sc + .5), int(h * sc + .5)), interpolation=cv2.INTER_AREA if sc < 1 else cv2.INTER_CUBIC)
    fx, fy = PHOTO_FOCUS.get(key, (.5, .5))
    h, w = im.shape[:2]; x0 = int(clamp(fx * w - TW / 2, 0, w - TW)); y0 = int(clamp(fy * h - TH / 2, 0, h - TH))
    im = im[y0:y0 + TH, x0:x0 + TW]
    # grade: desaturate, warm paper tint, soft contrast, lifted blacks, vignette
    g = im.mean(2, keepdims=True); im = im * .62 + g * .38
    im = im * np.array([1.03, 1.0, .93], np.float32)
    im = (im - 128) * .9 + 128 + 6
    yy, xx = np.mgrid[0:TH, 0:TW].astype(np.float32)
    v = 1 - .42 * (((xx - TW / 2) / (TW / 2)) ** 2 + ((yy - TH / 2) / (TH / 2)) ** 2) ** 1.4
    im = im * np.clip(v, .45, 1)[..., None]
    if blur: im = cv2.GaussianBlur(im, (0, 0), blur)
    return np.clip(im, 0, 255).astype(np.uint8)

def photo_frame(key, lt, dur, mode='push', blur=0, amt=1.0):
    im = photo(key, blur); TH, TW = im.shape[:2]
    p = ease_io(lt / max(dur, .1))
    s0, s1, dx0, dx1 = {'push': (1.0, 1.065, 0, 0), 'pull': (1.07, 1.0, 0, 0), 'panL': (1.02, 1.04, .035, -.035),
                       'panR': (1.02, 1.04, -.035, .035), 'rack': (1.0, 1.045, 0, 0), 'still': (1.0, 1.015, 0, 0)}[mode]
    s = (s0 + (s1 - s0) * p) * W / TW * 1.0
    s = max(s, W / TW)
    cx = TW / 2 + (dx0 + (dx1 - dx0) * p) * TW; cy = TH / 2
    M = np.float32([[s, 0, W / 2 - s * cx], [0, s, H / 2 - s * cy]])
    out = cv2.warpAffine(im, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    if mode == 'rack' and lt < 1.0:
        bl = cv2.warpAffine(photo(key, 14), M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        a = ease(lt / 1.0); out = cv2.addWeighted(bl, 1 - a, out, a, 0)
    return out

# ---------------------------------------------------------------- paper base
GHOST_TXT = ("Subscription terms. If you choose to cancel, the terms below apply to the plan you selected at checkout. "
             "Annual plans are billed in monthly installments for a 12 month term. Fees may vary by region and offer. "
             "Your plan renews automatically unless cancelled before the renewal date. Cancellation charges are calculated "
             "on the remaining months of the term. Refund eligibility depends on when you cancel. Promotional pricing may "
             "change at renewal. Taxes may apply. Contact support for details about your account. ") * 6

def wrap(text, font, maxw):
    words = text.split(); lines = []; cur = ''
    for w_ in words:
        t = (cur + ' ' + w_).strip()
        if font.getlength(t) <= maxw: cur = t
        else: lines.append(cur); cur = w_
    if cur: lines.append(cur)
    return lines

def chapter_name(sec):
    return S.SECTION_NAMES.get(sec, 'COLD OPEN').upper()

@functools.lru_cache(None)
def paper_base(variant, sec, ghost=True):
    rng = np.random.default_rng(variant + 11)
    a = np.full((H, W, 3), PAPER, np.float32)
    a += rng.normal(0, 2.2, (H, W, 1)).astype(np.float32)
    low = cv2.resize(rng.normal(0, 2, (18, 32)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
    a += low[..., None]
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    d.line([(150, 0), (150, H)], fill=RULE, width=2)
    d.text((190, 58), f'{S.SERIES}  /  {S.EPISODE}  /  {S.TOPIC}  /  {chapter_name(sec)}', font=F('mono', 22), fill=MUTED)
    if ghost:
        f = F('mono', 21); off = variant * 97 % 400
        lines = wrap(GHOST_TXT[off:], f, 1500)
        for i, ln in enumerate(lines[:4]):
            d.text((190, 720 + i * 34), ln, font=f, fill=(208, 203, 192))
    return np.asarray(im).copy()

# ---------------------------------------------------------------- rich headline
def parse_line(line):
    """'abc *def* [[ghi]]' -> list of (text, style) style in n|i|r"""
    out = []
    for tok in re.split(r'(\*[^*]+\*|\[\[[^\]]+\]\])', line):
        if not tok: continue
        if tok.startswith('*'): out.append((tok[1:-1], 'i'))
        elif tok.startswith('[['): out.append((tok[2:-2], 'r'))
        else: out.append((tok, 'n'))
    return out

def layout_head(lines, size, x, y, lead=1.08):
    """returns list of segments: (text, style, x, y, w, font)"""
    segs = []
    for li, line in enumerate(lines):
        cx = x; yy = y + li * size * lead
        for txt, st in parse_line(line):
            f = F('ital' if st == 'i' else 'serif', size)
            w_ = f.getlength(txt); segs.append((txt, st, cx, yy, w_, f)); cx += w_
    return segs

def draw_head(img, segs, size, color, hl_p, dark=False, redact_p=0.0, reveal=False):
    d = ImageDraw.Draw(img)
    for txt, st, x, y, w_, f in segs:
        if st == 'i':
            pw = (w_ + 24) * ease(hl_p)
            if pw > 1: d.rectangle([x - 10, y + size * .18, x - 10 + pw, y + size * 1.02], fill=HL)
            d.text((x, y), txt, font=f, fill=INK if (not dark or hl_p >= 1) else color)
            if dark and 0 < hl_p < 1:
                # ink version inside the highlighted part
                lay = Image.new('RGBA', (int(w_ + 30), int(size * 1.4)), (0, 0, 0, 0))
                ImageDraw.Draw(lay).text((10, 0), txt, font=f, fill=INK)
                lay = lay.crop((0, 0, int(pw), lay.height))
                img.paste(lay, (int(x - 10), int(y)), lay)
        elif st == 'r':
            if reveal:
                d.text((x, y), txt, font=f, fill=color)
            bx0 = x - 6; bx1 = x + w_ + 6
            if reveal: bx0 = bx0 + (bx1 - bx0) * ease(redact_p)
            if bx1 - bx0 > 1: d.rectangle([bx0, y + size * .2, bx1, y + size * 1.0], fill=INK)
        else:
            d.text((x, y), txt, font=f, fill=color)

def margin_note(img, text, lt, start=.9, x=None, y=880, dark=False):
    n = int(max(0, (lt - start) * FPS / 2))
    if n <= 0: return
    f = F('mono', 25); s = text[:n]
    tw = f.getlength(text); x = x if x is not None else W - 90 - tw
    d = ImageDraw.Draw(img)
    d.rectangle([x - 24, y + 4, x - 16, y + 30], fill=HL)
    d.text((x, y), s, font=f, fill=PAPER if dark else INK)

def clause_no(img, text, y, dark=False):
    ImageDraw.Draw(img).text((40, y), text, font=F('mono', 26), fill=(200, 196, 186) if dark else MUTED)

def stamp_img(text, size=44):
    f = F('mono', size); tw = f.getlength(text)
    im = Image.new('RGBA', (int(tw + 60), size + 44), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([4, 4, im.width - 5, im.height - 5], outline=INK + (230,), width=5)
    d.text((30, 18), text, font=f, fill=INK + (230,))
    return im.rotate(4, expand=True, resample=Image.BICUBIC)

@functools.lru_cache(None)
def stamp_cached(text, size=44): return stamp_img(text, size)

def put_stamp(img, text, lt, start, cx, cy, size=44):
    if lt < start: return
    st = stamp_cached(text, size); k = lt - start
    sc = 1.25 if k < 1 / FPS else (1.0 if k > 2 / FPS else 1.06)
    s2 = st.resize((int(st.width * sc), int(st.height * sc)), Image.BICUBIC) if sc != 1 else st
    img.paste(s2, (int(cx - s2.width / 2), int(cy - s2.height / 2)), s2)

# ---------------------------------------------------------------- beat renderers. each returns PIL RGB image + zoom focus
def headline_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section']))
    segs = layout_head(b['head'], 128, 190, 300)
    draw_head(img, segs, 128, INK, (lt - .5) * 3, redact_p=(lt - 1.1) * 3, reveal=b.get('reveal_redact', False))
    clause_no(img, b.get('clause', ''), 330)
    if b.get('note'): margin_note(img, b['note'], lt)
    return img

def photo_beat(b, i, lt, dur):
    fr = photo_frame(b['photo'], lt, dur, b.get('mode', 'push'))
    # bottom-left legibility gradient
    g = GRAD
    fr = (fr.astype(np.float32) * g).astype(np.uint8)
    img = Image.fromarray(fr)
    d = ImageDraw.Draw(img)
    d.text((190, 58), f'{S.SERIES}  /  {S.EPISODE}  /  {S.TOPIC}  /  {chapter_name(b["section"])}', font=F('mono', 22), fill=(214, 210, 200))
    if b.get('head'):
        segs = layout_head(b['head'], 112, 190, 620)
        draw_head(img, segs, 112, PAPER, (lt - .6) * 3, dark=True)
    if b.get('note'): margin_note(img, b['note'], lt, dark=True)
    return img

def _grad():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    g = 1 - .62 * np.clip((yy - 420) / 600, 0, 1) * np.clip(1.25 - xx / 1500, 0, 1) - .35 * np.clip((140 - yy) / 140, 0, 1)
    return np.clip(g, .25, 1)[..., None].astype(np.float32)
GRAD = _grad()

def doc_layout(b):
    style = b.get('style', 'web')
    sx, sy, sw, sh = 330, 150, 1260, 790
    f = F('serif', 58); lines = wrap(b['quote'], f, sw - 200)
    if len(lines) > 4: f = F('serif', 50); lines = wrap(b['quote'], f, sw - 200)
    lh = f.size * 1.22; qy = sy + 300 - (len(lines) - 3) * 18
    # word boxes
    words = []
    for li, ln in enumerate(lines):
        x = sx + 100
        for wd in ln.split(' '):
            w_ = f.getlength(wd); words.append([wd, x, qy + li * lh, w_, li]); x += w_ + f.getlength(' ')
    # highlight word span via character search
    hl = b.get('hl'); hlw = set()
    if hl:
        q = ' '.join(w_[0] for w_ in words); k = q.find(hl)
        if k >= 0:
            pos = 0
            for wi, w_ in enumerate(words):
                if pos + len(w_[0]) > k and pos < k + len(hl): hlw.add(wi)
                pos += len(w_[0]) + 1
    return dict(style=style, box=(sx, sy, sw, sh), font=f, lines=lines, lh=lh, qy=qy, words=words, hlw=hlw)

@functools.lru_cache(None)
def doc_static(i):
    b = B[i]; L = doc_layout(b)
    sx, sy, sw, sh = L['box']
    if b.get('photo'): base = Image.fromarray((photo(b['photo'], 9).astype(np.float32)[:H, :W] * .55).astype(np.uint8))
    else: base = Image.fromarray(paper_base(i % 5, b['section'], ghost=False))
    # shadow + sheet
    sh_ = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh_).rectangle([sx + 14, sy + 22, sx + sw + 14, sy + sh + 22], fill=(0, 0, 0, 120))
    sh_ = sh_.filter(ImageFilter.GaussianBlur(18)); base = base.convert('RGBA'); base.alpha_composite(sh_); base = base.convert('RGB')
    d = ImageDraw.Draw(base)
    d.rectangle([sx, sy, sx + sw, sy + sh], fill=SHEET)
    d.line([(sx + 70, sy), (sx + 70, sy + sh)], fill=RULE, width=2)
    if L['style'] == 'memo':
        d.text((sx + 100, sy + 50), b['title'].upper(), font=F('mono', 26), fill=INK)
        for k in range(3): d.rectangle([sx + 100, sy + 110 + k * 30, sx + 100 + (520, 380, 450)[k], sy + 122 + k * 30], fill=(214, 209, 198))
        d.line([(sx + 100, sy + 220), (sx + sw - 80, sy + 220)], fill=INK, width=2)
    else:
        d.text((sx + 100, sy + 40), b['src'].split('·')[0].strip().upper(), font=F('mono', 20), fill=MUTED)
        tf = F('serif', 46); tl_ = wrap(b['title'], tf, sw - 200)
        for k, ln in enumerate(tl_[:2]): d.text((sx + 100, sy + 80 + k * 52), ln, font=tf, fill=INK)
        d.line([(sx + 100, sy + 210), (sx + sw - 80, sy + 210)], fill=RULE, width=2)
    # ghost lines before/after quote
    for k in range(2): d.rectangle([sx + 100, sy + 240 + k * 26, sx + sw - 180 - k * 160, sy + 250 + k * 26], fill=(222, 217, 206))
    ye = L['qy'] + len(L['lines']) * L['lh'] + 30
    for k in range(4):
        y = ye + k * 26
        if y > sy + sh - 90: break
        d.rectangle([sx + 100, y, sx + sw - 120 - (k % 3) * 140, y + 10], fill=(222, 217, 206))
    d.text((sx + 100, sy + sh - 52), 'SOURCE: ' + b['src'], font=F('mono', 19), fill=MUTED)
    clause_no(base, b.get('clause', ''), L['qy'] + 10, dark=bool(b.get('photo')))
    return base, L

def doc_beat(b, i, lt, dur):
    base, L = doc_static(i); img = base.copy(); d = ImageDraw.Draw(img); f = L['font']
    mode = b.get('mode', 'highlight')
    hl_start = {'redact': 1.9, 'highlight': .7, 'plain': 99}[mode]
    # highlight under hl words (swipe in order)
    hw = [L['words'][k] for k in sorted(L['hlw'])]
    sp = f.getlength(' '); tot = sum(w_[3] + sp for w_ in hw) or 1; p = ease((lt - hl_start) / .45) * tot
    for w_ in hw:
        seg = min(p, w_[3] + 6)
        if seg > 0: d.rectangle([w_[1] - 4, w_[2] + f.size * .2, w_[1] + seg + 2, w_[2] + f.size * 1.08], fill=HL)
        p -= w_[3] + sp
    for li, ln in enumerate(L['lines']):
        d.text((L['box'][0] + 100, L['qy'] + li * L['lh']), ln, font=f, fill=INK)
    if mode == 'redact':
        for li, ln in enumerate(L['lines']):
            x0 = L['box'][0] + 94; x1 = x0 + f.getlength(ln) + 12
            r = ease((lt - .55 - li * .12) / .36); x0 = x0 + (x1 - x0) * r
            if x1 - x0 > 1: d.rectangle([x0, L['qy'] + li * L['lh'] + f.size * .16, x1, L['qy'] + li * L['lh'] + f.size * 1.1], fill=INK)
    if b.get('stamp'):
        sx, sy, sw, sh = L['box']; put_stamp(img, b['stamp'], lt, 1.5 if mode != 'plain' else .8, sx + sw - 230, sy + 120, 46)
    focus = None
    if hw: focus = (hw[0][1] + 200, hw[0][2] + 40)
    return img, focus

def compare_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.line([(960, 200), (960, 860)], fill=INK, width=2)
    inst = b.get('instant')
    for k, (lab, sub, val) in enumerate([b['left'], b['right']]):
        t0 = 0 if inst else (.2 + k * 1.1)
        a = 1 if inst else ease((lt - t0) / .3)
        if a <= 0: continue
        x = 240 if k == 0 else 1040
        d.text((x, 240), lab, font=F('mono', 34), fill=MUTED)
        d.text((x, 300), sub, font=F('serif', 64), fill=INK)
        vf = F('serif', 210 if len(val) < 9 else 150)
        if k == 1:
            vw = vf.getlength(val); pw = (vw + 40) * (1 if inst else ease((lt - t0 - .4) / .3))
            if pw > 0: d.rectangle([x - 20, 460, x - 20 + pw, 460 + vf.size * 1.0], fill=HL)
        d.text((x, 430 + (210 - vf.size) * .5), val, font=vf, fill=INK)
    if b.get('note'): margin_note(img, b['note'], lt, start=.4 if inst else 1.4)
    return img

def cards3_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 150), 'Three ways to pay for the same apps', font=F('serif', 70), fill=INK)
    pick = b['pick']
    for k, (t1, t2, t3) in enumerate(b['items']):
        a = ease((lt - .2 - k * .35) / .3)
        if a <= 0: continue
        x = 190 + k * 560; y = 330 + (1 - a) * 40
        dim = lt > 3.2 and k != pick
        col = (190, 186, 177) if dim else INK
        d.rectangle([x, y, x + 500, y + 470], fill=SHEET, outline=col, width=3)
        if k == pick and lt > 2.6:
            d.rectangle([x, y, x + 500 * ease((lt - 2.6) / .3), y + 18], fill=HL)
        d.text((x + 36, y + 60), t1, font=F('mono', 30), fill=col)
        d.text((x + 36, y + 150), t2, font=F('serif', 72), fill=col)
        d.line([(x + 36, y + 270), (x + 464, y + 270)], fill=RULE, width=2)
        d.text((x + 36, y + 300), t3, font=F('serif', 46), fill=col)
    if lt > 3.6: put_stamp(img, '12-MONTH CONTRACT', lt, 3.6, 190 + pick * 560 + 250, 860, 36)
    return img

def slices_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    segs = layout_head(['You\'re paying for *a year*'], 104, 190, 150); draw_head(img, segs, 104, INK, (lt - 2.0) * 3)
    for k in range(12):
        a = ease((lt - .3 - k * .14) / .2)
        if a <= 0: continue
        x = 190 + k * 128; y = 380 + (1 - a) * 30
        d.rectangle([x, y, x + 110, y + 190], fill=INK if k < 3 else SHEET, outline=INK, width=3)
        d.text((x + 55, y + 95), f'{k + 1}', font=F('serif', 70), fill=PAPER if k < 3 else INK, anchor='mm')
    if lt > 2.2:
        d.text((190, 600), 'used', font=F('mono', 28), fill=MUTED)
        d.text((190 + 3 * 128, 600), 'still owed under the contract', font=F('mono', 28), fill=INK)
        w_ = (9 * 128 - 18) * ease((lt - 2.2) / .5); d.rectangle([190 + 3 * 128, 650, 190 + 3 * 128 + w_, 662], fill=HL)
    margin_note(img, '→ ' + b['label'], lt, start=2.8)
    return img

def receipt_beat(b, i, lt, dur):
    img = Image.fromarray((photo(b['photo'], 8).astype(np.float32)[:H, :W] * .5).astype(np.uint8)); d = ImageDraw.Draw(img)
    segs = layout_head(['The exit', '*price*'], 120, 190, 300); draw_head(img, segs, 120, PAPER, (lt - .5) * 3, dark=True)
    d.text((190, 580), 'EXAMPLE · our arithmetic', font=F('mono', 26), fill=(214, 210, 200))
    d.text((190, 620), 'from Adobe\'s stated rule', font=F('mono', 26), fill=(214, 210, 200))
    rx, ry, rw = 1040, 90, 640
    n = len(b['lines']); vis = min(n, int(max(0, lt - .4) / .5) + 1) if lt > .4 else 0
    rh = 230 + 64 * n + 320
    hh = int(ry + 0 + (rh) * ease(lt / .4))
    zig = [(rx + k * 20, hh + (10 if k % 2 else 0)) for k in range(rw // 20 + 1)]
    d.polygon([(rx, ry), (rx + rw, ry)] + [(rx + rw, hh)] + zig[::-1], fill=RECEIPT)
    if lt > .3:
        d.text((rx + rw / 2, ry + 60), 'CANCELLATION', font=F('mono', 34), fill=INK, anchor='mm')
        d.text((rx + rw / 2, ry + 105), 'annual plan, paid monthly', font=F('mono', 24), fill=MUTED, anchor='mm')
        dash = ''.join('- ' for _ in range(27)); d.text((rx + 30, ry + 150), dash, font=F('mono', 24), fill=MUTED)
    f = F('mono', 30)
    for k in range(vis):
        a, v = b['lines'][k]; y = ry + 200 + k * 64
        d.text((rx + 40, y), a, font=f, fill=INK); d.text((rx + rw - 40, y), v, font=f, fill=INK, anchor='ra')
    if vis >= n:
        t0 = .4 + n * .5; y = ry + 200 + n * 64 + 20
        d.text((rx + 30, y), dash, font=F('mono', 24), fill=MUTED)
        lab, val = b['total']; cur = val * ease((lt - t0) / 1.2)
        d.text((rx + 40, y + 50), lab, font=F('mono', 30), fill=INK)
        s = f'${cur:,.2f}'; vf = F('serif', 96); vw = vf.getlength(s)
        if lt > t0 + 1.2: d.rectangle([rx + rw - 50 - vw - 14, y + 104, rx + rw - 36, y + 196], fill=HL)
        d.text((rx + rw - 40, y + 92), s, font=vf, fill=INK, anchor='ra')
        put_stamp(img, 'EXAMPLE', lt, t0 + 1.5, rx + 160, y + 245, 34)
    return img

def counter_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 190), b['label'], font=F('mono', 30), fill=MUTED)
    v = b['value'] * ease((lt - .3) / 1.4); dec = b.get('decimals', 0)
    s = f"{b.get('prefix', '')}{v:,.{dec}f}{b.get('suffix', '')}"
    vf = F('serif', 300); y = 250
    if lt > 1.75:
        vw = vf.getlength(f"{b.get('prefix', '')}{b['value']:,.{dec}f}{b.get('suffix', '')}")
        d.rectangle([180, y + 80, 180 + (vw + 30) * ease((lt - 1.75) / .3), y + 300], fill=HL)
    d.text((190, y), s, font=vf, fill=INK)
    for k, ptxt in enumerate(b.get('parts', [])):
        a = ease((lt - 1.9 - k * .5) / .3)
        if a <= 0: continue
        d.text((200, 640 + k * 62), (('+ ' if k else '= ') if b.get('sum', True) else '· ') + ptxt, font=F('serif', 62), fill=INK)
    d.text((190, 870), 'SOURCE: ' + b['src'], font=F('mono', 20), fill=MUTED)
    return img

def chart_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 150), b['label'], font=F('mono', 30), fill=MUTED)
    mx = max(v for _, v in b['bars']); base_y = 800
    for k, (lab, v) in enumerate(b['bars']):
        p = ease((lt - .4 - k * 1.0) / 1.0)
        if p <= 0: continue
        x = 300 + k * 420; h = 440 * v / mx * p
        d.rectangle([x, base_y - h, x + 260, base_y], fill=HL if k == len(b['bars']) - 1 else INK)
        d.text((x + 130, base_y - h - 20), f'{v * p:.0f}', font=F('serif', 110), fill=INK, anchor='ms')
        d.text((x + 130, base_y + 50), lab, font=F('mono', 34), fill=INK, anchor='mm')
    d.line([(250, base_y), (1250, base_y)], fill=INK, width=3)
    d.text((1330, 360), 'a day,', font=F('serif', 70), fill=INK); d.text((1330, 440), 'on average', font=F('ital', 70), fill=INK)
    margin_note(img, '→ +67% in three years', lt, start=2.6, x=1330, y=560)
    d.text((190, 900), 'SOURCE: ' + b['src'], font=F('mono', 20), fill=MUTED)
    return img

def list_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 140), b['head'], font=F('serif', 92), fill=INK)
    for k, it in enumerate(b['items']):
        t0 = .6 + k * .9; a = ease((lt - t0) / .25)
        if a <= 0: continue
        y = 330 + k * 150; x = 190 + (1 - a) * 30
        d.rectangle([x, y + 14, x + 52, y + 66], outline=INK, width=4)
        if lt > t0 + .3: d.line([(x + 10, y + 40), (x + 24, y + 56), (x + 46, y + 22)], fill=INK, width=6)
        d.text((x + 90, y), it, font=F('serif', 70), fill=INK)
        clause_no(img, f'§ {k + 1}', y + 20)
    if b.get('tag'): put_stamp(img, b['tag'], lt, .9, 1580, 230, 40)
    return img

def timeline_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 150), 'The case, in three dates', font=F('serif', 84), fill=INK)
    y = 470; p = ease((lt - .2) / 1.4)
    d.line([(220, y), (220 + 1480 * p, y)], fill=INK, width=4)
    for k, (dt, txt) in enumerate(b['items']):
        x = 220 + k * 620
        if p * 1480 < x - 220: continue
        on = k == b.get('upto', 0)
        d.ellipse([x - 18, y - 18, x + 18, y + 18], fill=HL if on else INK, outline=INK, width=4)
        d.text((x - 10, y - 90), dt, font=F('mono', 40), fill=INK)
        for q, ln in enumerate(wrap(txt, F('serif', 54), 520)): d.text((x - 10, y + 50 + q * 60), ln, font=F('serif', 54), fill=INK if on else MUTED)
    return img

def flow_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    st = b['stage']
    if st == 0:
        for k in range(4):
            a = ease((lt - .2 - k * .25) / .3)
            if a <= 0: continue
            x = 260 + k * 70; y = 220 + k * 50 - (1 - a) * 40
            d.rectangle([x, y, x + 520, y + 560], fill=SHEET, outline=INK, width=3)
            d.text((x + 30, y + 24), f'PAGE {k + 1}', font=F('mono', 26), fill=MUTED)
        vals = [('4', 'pages'), ('6', 'clicks'), ('15', 'options')]
        for k, (n, lab) in enumerate(vals):
            a = ease((lt - 1.4 - k * .45) / .3)
            if a <= 0: continue
            y = 260 + k * 190
            d.text((1100, y), n, font=F('serif', 170), fill=INK); d.text((1330, y + 80), lab, font=F('serif', 80), fill=INK)
        if lt > 3: d.rectangle([1100, 820, 1100 + 640 * ease((lt - 3) / .3), 830], fill=HL)
        d.text((1100, 850), '"Iliad Flow" · FTC complaint, 2023', font=F('mono', 24), fill=MUTED)
        return img
    pages = {1: [('Page 1', ['Remind Me Later', 'Keep My Benefits', 'Continue to Cancel'], 2)],
             2: [('Page 2', ['Remind Me Later', 'Keep My Benefits', 'Continue to Cancel'], 2),
                 ('Page 3', ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'End Now'], 4)]}[st]
    seg = dur / len(pages); k = min(len(pages) - 1, int(lt / seg)); lt2 = lt - k * seg
    name, btns, good = pages[k]
    d.text((190, 140), name, font=F('serif', 90), fill=INK)
    d.text((190, 250), 'schematic · not a screenshot', font=F('mono', 22), fill=MUTED)
    d.rectangle([600, 130, 1720, 930], fill=SHEET, outline=INK, width=3)
    for q in range(3): d.rectangle([660, 190 + q * 34, 660 + (700, 520, 610)[q], 204 + q * 34], fill=(214, 209, 198))
    n = len(btns); bh = 86 if n == 3 else 92; gap = 40 if n == 3 else 18
    y0 = 360
    for q, t in enumerate(btns):
        a = ease((lt2 - .2 - q * .18) / .2)
        if a <= 0: continue
        y = y0 + q * (bh + gap)
        isg = q == good
        fill = HL if (isg and lt2 > 1.6) else (236, 232, 222)
        d.rectangle([700, y, 1620, y + bh], fill=fill, outline=INK, width=3)
        d.text((1160, y + bh / 2), t, font=F('mono', 36), fill=INK, anchor='mm')
    # cursor travels to the one button that moves forward
    ty = y0 + good * (bh + gap) + bh / 2
    p = ease_io((lt2 - .7) / .9); cx = 1500 + (1300 - 1500) * p; cy = 900 + (ty - 900) * p
    if lt2 > .5:
        d.polygon([(cx, cy), (cx, cy + 46), (cx + 12, cy + 34), (cx + 22, cy + 56), (cx + 30, cy + 52), (cx + 20, cy + 31), (cx + 36, cy + 31)], fill=INK)
        if 1.6 < lt2 < 1.9: d.ellipse([cx - 30, cy - 30, cx + 30, cy + 30], outline=INK, width=3)
    clause_no(img, f'§ {name[-1]}', 160)
    return img

def funnel_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 120), '1,000 people head for the exit', font=F('serif', 80), fill=INK)
    d.text((190, 215), 'ILLUSTRATIVE EXAMPLE · not company data', font=F('mono', 24), fill=MUTED)
    steps, stays = b['steps'], b['stays']
    gt = [1.2 + k * 1.3 for k in range(len(steps))]
    stayed = sum(s for s, t0 in zip(stays, gt) if lt > t0)
    # dot field 40 x 25
    for k in range(1000):
        cx = 220 + (k % 50) * 18; cy = 300 + (k // 50) * 18
        on = k < stayed
        d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=HL if on else INK, outline=INK if on else None)
    for k, (st, sv) in enumerate(zip(steps, stays)):
        if lt < gt[k]: continue
        y = 300 + k * 110
        d.text((1180, y), st, font=F('serif', 58), fill=INK)
        d.text((1580, y + 10), f'+{sv} stay', font=F('mono', 34), fill=INK)
    if lt > gt[-1] + .6:
        tot = sum(stays); d.rectangle([1170, 790, 1170 + 620 * ease((lt - gt[-1] - .6) / .3), 870], fill=HL)
        d.text((1180, 795), f'{tot} keep paying', font=F('serif', 64), fill=INK)
    return img

def takeaway_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False))
    fr = photo_frame(b['photo'], lt, dur, 'push')
    x0 = 1150; img.paste(Image.fromarray(fr[:, 300:300 + (W - x0)]), (x0, 0))
    d = ImageDraw.Draw(img)
    d.line([(x0, 0), (x0, H)], fill=INK, width=3)
    d.text((190, 150), f'{b["n"]}', font=F('serif', 240), fill=INK)
    d.text((330, 270), '/ 5', font=F('mono', 34), fill=MUTED)
    d.text((190, 470), b['head'], font=F('serif', 84), fill=INK)
    sf = F('mono', 34); lines = wrap(b['sub'], sf, 880)
    for k, ln in enumerate(lines):
        y = 600 + k * 54; p = ease((lt - .7 - k * .3) / .35)
        if p > 0 and (b.get('formula') or k == 0): d.rectangle([186, y + 6, 186 + (sf.getlength(ln) + 10) * p, y + 46], fill=HL)
        d.text((190, y), ln, font=sf, fill=INK)
    d.rectangle([180, 50, 1140, 90], fill=PAPER)
    d.text((190, 58), f'{S.SERIES}  /  {S.EPISODE}  /  THE 2-MINUTE CHECK', font=F('mono', 22), fill=MUTED)
    return img

def subscribe_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(2, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    segs = layout_head(['Subscribe for the', '*next document*'], 130, 190, 230)
    draw_head(img, segs, 130, INK, (lt - .4) * 3)
    d.text((190, 560), 'HIDDEN LAYER · the hidden rules that decide what you pay', font=F('mono', 30), fill=INK)
    put_stamp(img, 'HIDDEN LAYER', lt, .9, 1500, 220, 40)
    return img

R = dict(headline=headline_beat, photo=photo_beat, doc=doc_beat, compare=compare_beat, cards3=cards3_beat, slices=slices_beat,
         receipt=receipt_beat, counter=counter_beat, chart=chart_beat, list=list_beat, timeline=timeline_beat, flow=flow_beat,
         funnel=funnel_beat, takeaway=takeaway_beat, subscribe=subscribe_beat)

# ---------------------------------------------------------------- global overlays
def meter_at(i):
    m = None; since = None
    for k in range(i + 1):
        if B[k].get('meter'):
            if m != B[k]['meter']: since = k
            m = B[k]['meter']
    return m, since

def draw_meter(img, i, lt):
    if B[i]['section'] >= 6 or B[i]['kind'] in ('subscribe',): return
    m, since = meter_at(i)
    if not m: return
    lab, val = m
    if since == i and lt < 1.2:
        mm = re.match(r'([^\d]*)([\d.,]+)(.*)', val)
        if mm:
            num = float(mm.group(2).replace(',', '')); dec = len(mm.group(2).split('.')[1]) if '.' in mm.group(2) else 0
            val = f'{mm.group(1)}{num * ease(lt / 1.1):,.{dec}f}{mm.group(3)}'
    d = ImageDraw.Draw(img); x, y, w_, h = 1520, 30, 340, 118
    d.polygon([(x + 30, y), (x + w_, y), (x + w_, y + h), (x + 30, y + h), (x, y + h / 2)], fill=SHEET, outline=INK)
    d.ellipse([x + 22, y + h / 2 - 8, x + 38, y + h / 2 + 8], outline=INK, width=3)
    d.text((x + 56, y + 14), lab, font=F('mono', 18), fill=MUTED)
    d.text((x + 56, y + 34), val, font=F('serif', 70), fill=INK)

CAPS = []
CAPFIX = [('three hundred and fifteen dollars', '$315'), ('three hundred and fifteen', '315'), ('six hundred and thirty dollars', '$630'),
  ('a hundred and fifty million dollar', '$150 million'), ('Seventy-five million dollars', '$75 million'), ('seventy-five million', '$75 million'),
  ('two and a half billion dollars', '$2.5 billion'), ('One billion', '$1 billion'), ('one and a half billion', '$1.5 billion'),
  ('five hundred and twenty-five dollars', '$525'), ('a hundred and sixty-two million dollars', '$162 million'), ('fifty-one dollars', '$51'),
  ('sixty-nine ninety-nine', '$69.99'), ('fifty percent', '50%'), ('fourteen percent', '14%'), ('half a percent', '0.5%'),
  ('January twenty-seventh', 'January 27'), ('November fifth', 'November 5'), ('March thirteenth', 'March 13'), ('July eighth', 'July 8'),
  ('October first', 'October 1'), ('twenty twenty-six', '2026'), ('twenty twenty-five', '2025'), ('twenty twenty-four', '2024'),
  ('twenty twenty-three', '2023'), ('twenty twenty-one', '2021'), ('twenty seventeen', '2017'), ('F T C', 'FTC'),
  ('five gigabyte', '5GB'), ('thirty days', '30 days'), ('fourteen days', '14 days'), ('forty million', '40 million'),
  ('seventy a day', '70 a day'), ('forty-two a day', '42 a day'), ('twelve-month', '12-month'), ('twelve slices', '12 slices'),
  ('Nine months', '9 months'), ('three months', '3 months'), ('ninth month', '9th month'), ('three remaining', '3 remaining'),
  ('seven days', '7 days'), ('n y c dot gov, slash click to cancel', 'nyc.gov/click-to-cancel'), ('four steps', '4 steps'),
  ('four-page, six-click, fifteen-option', '4-page, 6-click, 15-option'), ('a thousand people', '1,000 people'), ('two minutes', '2 minutes')]
def capfix(s):
    for a, r in CAPFIX: s = s.replace(a, r)
    return s
def build_caps():
    for i, sents in enumerate(SENT):
        for a, e, s in sents:
            words = capfix(s).split(); chunks = []; cur = []
            for w_ in words:
                cur.append(w_)
                if len(cur) >= 4 or w_[-1] in ',.;:?!' and len(cur) >= 2: chunks.append(cur); cur = []
            if cur:
                if chunks and len(cur) == 1: chunks[-1] += cur
                else: chunks.append(cur)
            tot = sum(len(' '.join(c)) + 1 for c in chunks); t = STARTS[i] + a
            for c in chunks:
                L = (len(' '.join(c)) + 1) / tot * (e - a); CAPS.append((t, t + L, c)); t += L
build_caps()

@functools.lru_cache(512)
def cap_img(words):
    f = F('mono', 34); txt = ' '.join(words)
    key = None
    for w_ in words:
        if re.search(r'\d', w_) and key is None: key = w_
    if key is None:
        cands = [w_ for w_ in words if len(w_.strip('.,?!')) >= 7]; key = max(cands, key=len) if cands else None
    tw = f.getlength(txt); im = Image.new('RGBA', (int(tw + 56), 64), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, im.width - 1, 63], 30, fill=PAPER + (245,), outline=(160, 156, 146, 255), width=2)
    x = 28
    for w_ in words:
        ww = f.getlength(w_)
        if w_ == key: d.rectangle([x - 4, 12, x + ww + 4, 52], fill=HL)
        d.text((x, 10), w_, font=f, fill=INK); x += ww + f.getlength(' ')
    return im

def draw_caption(img, t, i):
    if B[i]['kind'] == 'subscribe': return
    for a, e, c in CAPS:
        if a <= t < e + .05:
            im = cap_img(tuple(c)); img.paste(im, (int(W / 2 - im.width / 2), 968), im); return

GRAIN = [np.asarray(Image.effect_noise((W, H), 64).convert('RGB')) for _ in range(6)]

def beat_at(t):
    k = 0
    for i, s in enumerate(STARTS):
        if s <= t + 1e-6: k = i
    return k

def frame(t, fi=0):
    i = beat_at(t); b = B[i]; lt = t - STARTS[i]
    end = STARTS[i + 1] if i + 1 < len(B) else TOTAL; dur = end - STARTS[i]
    out = R[b['kind']](b, i, lt, dur); focus = None
    if isinstance(out, tuple): out, focus = out
    img = out
    if b.get('zoom') or b['kind'] in ('headline',):
        amt = .045 if b.get('zoom') else .025
        s = 1 + amt * ease_io(lt / dur); fx, fy = focus or (700, 420)
        a = np.asarray(img); M = np.float32([[s, 0, fx - s * fx], [0, s, fy - s * fy]])
        img = Image.fromarray(cv2.warpAffine(a, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE))
    draw_meter(img, i, lt)
    draw_caption(img, t, i)
    a = np.asarray(img)
    a = cv2.addWeighted(a, .94, GRAIN[fi % 6], .06, 0)
    return a

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--beats', action='store_true'); ap.add_argument('--out')
    ap.add_argument('--start', type=float, default=0); ap.add_argument('--end', type=float, default=None)
    ap.add_argument('--at', type=float, nargs='*')
    A = ap.parse_args()
    if A.at:
        for t in A.at: Image.fromarray(frame(t)).save(f'at_{t:07.2f}.jpg', quality=88)
        sys.exit()
    if A.beats:
        tiles = []
        for i, s in enumerate(STARTS):
            t = s + min(DURS[i] * .8, 4.5); tiles.append((i, Image.fromarray(frame(t)).resize((640, 360))))
        for p in range(0, len(tiles), 9):
            sh = Image.new('RGB', (1920, 1080), 'white'); d = ImageDraw.Draw(sh)
            for q, (i, im) in enumerate(tiles[p:p + 9]):
                sh.paste(im, ((q % 3) * 640, (q // 3) * 360)); d.rectangle([(q % 3) * 640, (q // 3) * 360, (q % 3) * 640 + 60, (q // 3) * 360 + 26], fill='red'); d.text(((q % 3) * 640 + 4, (q // 3) * 360 + 4), str(i), fill='white')
            sh.save(f'preview_sheet_{p // 9}.jpg', quality=85)
        print('total', TOTAL, 'beats', len(B)); sys.exit()
    end = A.end if A.end is not None else TOTAL
    n0 = int(round(A.start * FPS)); n1 = int(round(end * FPS))
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-maxrate', '14M', '-bufsize', '28M', '-pix_fmt', 'yuv420p', A.out], stdin=subprocess.PIPE)
    import time; t0 = time.time()
    for n in range(n0, n1):
        p.stdin.write(frame(n / FPS, n).tobytes())
        if n % 300 == 0: print(n, n1, round((n - n0) / (time.time() - t0 + 1e-9), 1), 'fps', flush=True)
    p.stdin.close(); p.wait(); print('done', A.out)
