
# ======================================================================= v4 overrides: "The Algorithm" ink palette + new beats
DARK = getattr(S, 'PALETTE', 'paper') == 'ink'
BGC = (19, 20, 24) if DARK else PAPER
FG = PAPER if DARK else INK
RULE_D = (52, 53, 58) if DARK else RULE
GHOST_D = (40, 41, 46) if DARK else (208, 203, 192)
REDACT = (226, 222, 212) if DARK else INK
MUT = (150, 147, 138) if DARK else MUTED
GHOST_TXT = ("Pricing terms. Prices shown may vary by location, store, time and channel. Prices in the app may differ from in-store prices. "
             "We may test different prices, offers and fees. Offers may be personalized based on your activity, device and account information. "
             "Delivery fees and service fees are calculated at checkout. Original prices shown for reference. Promotions subject to change. ") * 6

@functools.lru_cache(None)
def paper_base(variant, sec, ghost=True):
    rng = np.random.default_rng(variant + 11)
    a = np.full((H, W, 3), BGC, np.float32)
    a += rng.normal(0, 2.0, (H, W, 1)).astype(np.float32)
    low = cv2.resize(rng.normal(0, 2.4, (18, 32)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
    a += low[..., None]
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    d.line([(150, 0), (150, H)], fill=RULE_D, width=2)
    d.text((190, 58), f'{S.SERIES}  /  {S.EPISODE}  /  {S.TOPIC}  /  {chapter_name(sec)}', font=F('mono', 22), fill=MUT)
    if ghost:
        f = F('mono', 21); off = variant * 97 % 400
        for k, ln in enumerate(wrap(GHOST_TXT[off:], f, 1500)[:4]):
            d.text((190, 720 + k * 34), ln, font=f, fill=GHOST_D)
    return np.asarray(im).copy()

def draw_head(img, segs, size, color, hl_p, dark=False, redact_p=0.0, reveal=False, bar=None):
    d = ImageDraw.Draw(img); bar = bar or (REDACT if (DARK or dark) else INK)
    for txt, st, x, y, w_, f in segs:
        if st == 'i':
            pw = (w_ + 24) * ease(hl_p)
            if pw > 1: d.rectangle([x - 10, y + size * .18, x - 10 + pw, y + size * 1.02], fill=HL)
            d.text((x, y), txt, font=f, fill=color if pw < 1 else (INK if hl_p >= 1 else color))
            if 0 < hl_p < 1 and pw > 1:
                lay = Image.new('RGBA', (int(w_ + 30), int(size * 1.4)), (0, 0, 0, 0))
                ImageDraw.Draw(lay).text((10, 0), txt, font=f, fill=INK)
                lay = lay.crop((0, 0, int(min(pw, lay.width)), lay.height))
                img.paste(lay, (int(x - 10), int(y)), lay)
        elif st == 'r':
            if reveal: d.text((x, y), txt, font=f, fill=color)
            bx0 = x - 6; bx1 = x + w_ + 6
            if reveal: bx0 = bx0 + (bx1 - bx0) * ease(redact_p)
            if bx1 - bx0 > 1: d.rectangle([bx0, y + size * .2, bx1, y + size * 1.0], fill=bar)
        else:
            d.text((x, y), txt, font=f, fill=color)

def margin_note(img, text, lt, start=.9, x=None, y=880, dark=None):
    n = int(max(0, (lt - start) * FPS / 2))
    if n <= 0: return
    dark = DARK if dark is None else dark
    f = F('mono', 25); tw = f.getlength(text); x = x if x is not None else W - 90 - tw
    d = ImageDraw.Draw(img); d.rectangle([x - 24, y + 4, x - 16, y + 30], fill=HL)
    d.text((x, y), text[:n], font=f, fill=PAPER if dark else INK)

def clause_no(img, text, y, dark=None):
    dark = DARK if dark is None else dark
    ImageDraw.Draw(img).text((40, y), text, font=F('mono', 26), fill=(150, 147, 138) if dark else MUTED)

@functools.lru_cache(None)
def stamp_cached(text, size=44, col=None):
    col = col or INK
    f = F('mono', size); tw = f.getlength(text)
    im = Image.new('RGBA', (int(tw + 60), size + 44), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([4, 4, im.width - 5, im.height - 5], outline=col + (235,), width=5)
    d.text((30, 18), text, font=f, fill=col + (235,))
    return im.rotate(4, expand=True, resample=Image.BICUBIC)

def put_stamp(img, text, lt, start, cx, cy, size=44, col=None):
    if lt < start: return
    st = stamp_cached(text, size, col); k = lt - start
    sc = 1.25 if k < 1 / FPS else (1.0 if k > 2 / FPS else 1.06)
    s2 = st.resize((int(st.width * sc), int(st.height * sc)), Image.BICUBIC) if sc != 1 else st
    img.paste(s2, (int(cx - s2.width / 2), int(cy - s2.height / 2)), s2)

def headline_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section']))
    segs = layout_head(b['head'], 128, 190, 300)
    draw_head(img, segs, 128, FG, (lt - .5) * 3, redact_p=(lt - 1.1) * 3, reveal=b.get('reveal_redact', False))
    clause_no(img, b.get('clause', ''), 330)
    if b.get('note'): margin_note(img, b['note'], lt)
    return img

def compare_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.line([(960, 200), (960, 860)], fill=RULE_D if DARK else INK, width=2)
    inst = b.get('instant')
    for k, (lab, sub, val) in enumerate([b['left'], b['right']]):
        t0 = 0 if inst else (.2 + k * 1.1)
        a = 1 if inst else ease((lt - t0) / .3)
        if a <= 0: continue
        x = 240 if k == 0 else 1040
        d.text((x, 240), lab, font=F('mono', 34), fill=MUT)
        d.text((x, 300), sub, font=F('serif', 64), fill=FG)
        vf = F('serif', 210 if len(val) < 9 else 130)
        col = FG
        if k == 1:
            vw = vf.getlength(val); pp = 1 if inst else ease((lt - t0 - .4) / .3); pw = (vw + 40) * pp
            if pw > 0: d.rectangle([x - 20, 460, x - 20 + pw, 460 + vf.size * 1.0], fill=HL)
            if pp > .5: col = INK
        d.text((x, 430 + (210 - vf.size) * .5), val, font=vf, fill=col)
    if b.get('note'): margin_note(img, b['note'], lt, start=.4 if inst else 1.4)
    return img

def counter_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 190), b['label'], font=F('mono', 30), fill=MUT)
    dec = b.get('decimals', 0); v = b['value'] * ease((lt - .3) / 1.4)
    s = f"{b.get('prefix', '')}{v:,.{dec}f}{b.get('suffix', '')}"
    vf = F('serif', 300); y = 250; on = lt > 1.75
    if on:
        vw = vf.getlength(f"{b.get('prefix', '')}{b['value']:,.{dec}f}{b.get('suffix', '')}")
        d.rectangle([180, y + 80, 180 + (vw + 30) * ease((lt - 1.75) / .3), y + 300], fill=HL)
    d.text((190, y), s, font=vf, fill=INK if on and lt > 1.9 else FG)
    for k, ptxt in enumerate(b.get('parts', [])):
        a = ease((lt - 1.9 - k * .5) / .3)
        if a <= 0: continue
        d.text((200, 640 + k * 62), (('+ ' if k else '= ') if b.get('sum', True) else '· ') + ptxt, font=F('serif', 62), fill=FG)
    d.text((190, 870), 'SOURCE: ' + b['src'], font=F('mono', 20), fill=MUT)
    return img

def chart_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 150), b['label'], font=F('mono', 30), fill=MUT)
    mx = max(v for _, v in b['bars']); base_y = 800; u = b.get('unit', '')
    for k, (lab, v) in enumerate(b['bars']):
        p = ease((lt - .4 - k * 1.0) / 1.0)
        if p <= 0: continue
        x = 300 + k * 420; h = 440 * v / mx * p; last = k == len(b['bars']) - 1
        d.rectangle([x, base_y - h, x + 260, base_y], fill=HL if last else (120, 118, 110))
        d.text((x + 130, base_y - h - 20), f'{v * p:.0f}{u}', font=F('serif', 110), fill=FG, anchor='ms')
        d.text((x + 130, base_y + 50), lab, font=F('mono', 30), fill=FG, anchor='mm')
    d.line([(250, base_y), (1250, base_y)], fill=FG, width=3)
    sd = b.get('side', [])
    if sd: d.text((1330, 360), sd[0], font=F('serif', 70), fill=FG)
    if len(sd) > 1: d.text((1330, 440), sd[1], font=F('ital', 70), fill=FG)
    if b.get('note'): margin_note(img, b['note'], lt, start=2.6, x=1330, y=560)
    d.text((190, 900), 'SOURCE: ' + b['src'], font=F('mono', 20), fill=MUT)
    return img

def list_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 140), b['head'], font=F('serif', 92), fill=FG)
    for k, it in enumerate(b['items']):
        t0 = .6 + k * .9; a = ease((lt - t0) / .25)
        if a <= 0: continue
        y = 330 + k * 150; x = 190 + (1 - a) * 30
        d.rectangle([x, y + 14, x + 52, y + 66], outline=FG, width=4)
        if lt > t0 + .3: d.line([(x + 10, y + 40), (x + 24, y + 56), (x + 46, y + 22)], fill=HL, width=6)
        d.text((x + 90, y), it, font=F('serif', 70), fill=FG)
        clause_no(img, f'§ {k + 1}', y + 20)
    if b.get('tag'): put_stamp(img, b['tag'], lt, .9, 1560, 230, 38, col=HL if DARK else INK)
    return img

def takeaway_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False))
    fr = photo_frame(b['photo'], lt, dur, 'push')
    x0 = 1150; img.paste(Image.fromarray(fr[:, 300:300 + (W - x0)]), (x0, 0))
    d = ImageDraw.Draw(img)
    d.line([(x0, 0), (x0, H)], fill=HL, width=3)
    d.text((190, 150), f'{b["n"]}', font=F('serif', 240), fill=FG)
    d.text((330, 270), '/ 4', font=F('mono', 34), fill=MUT)
    d.text((190, 470), b['head'], font=F('serif', 84), fill=FG)
    sf = F('mono', 34); lines = wrap(b['sub'], sf, 880)
    for k, ln in enumerate(lines):
        y = 600 + k * 54; p = ease((lt - .7 - k * .3) / .35); hl = p > 0 and k == 0
        if hl: d.rectangle([186, y + 6, 186 + (sf.getlength(ln) + 10) * p, y + 46], fill=HL)
        d.text((190, y), ln, font=sf, fill=INK if (hl and p > .6) else FG)
    d.rectangle([180, 50, 1148, 90], fill=BGC)
    d.text((190, 58), f'{S.SERIES}  /  {S.EPISODE}  /  4 CHECKS BEFORE YOU PAY', font=F('mono', 22), fill=MUT)
    return img

def subscribe_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(2, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    segs = layout_head(['Subscribe for the', '*next hidden rule*'], 130, 190, 230)
    draw_head(img, segs, 130, FG, (lt - .4) * 3)
    d.text((190, 560), 'HIDDEN LAYER · the hidden rules that decide what you pay', font=F('mono', 30), fill=FG)
    put_stamp(img, 'HIDDEN LAYER', lt, .9, 1500, 220, 40, col=HL)
    return img

def receipt_beat(b, i, lt, dur):
    img = Image.fromarray((photo(b['photo'], 8).astype(np.float32)[:H, :W] * .45).astype(np.uint8)); d = ImageDraw.Draw(img)
    segs = layout_head(b['head'], 120, 190, 300); draw_head(img, segs, 120, PAPER, (lt - .5) * 3, dark=True)
    for k, ln in enumerate(wrap(b['tag'], F('mono', 26), 700)): d.text((190, 580 + k * 40), ln, font=F('mono', 26), fill=(214, 210, 200))
    rx, ry, rw = 1040, 90, 640
    n = len(b['lines']); vis = min(n, int(max(0, lt - .4) / .5) + 1) if lt > .4 else 0
    rh = 230 + 64 * n + 320
    hh = int(ry + rh * ease(lt / .4))
    zig = [(rx + k * 20, hh + (10 if k % 2 else 0)) for k in range(rw // 20 + 1)]
    d.polygon([(rx, ry), (rx + rw, ry)] + [(rx + rw, hh)] + zig[::-1], fill=RECEIPT)
    dash = ''.join('- ' for _ in range(27))
    if lt > .3:
        d.text((rx + rw / 2, ry + 60), b['title'], font=F('mono', 34), fill=INK, anchor='mm')
        d.text((rx + rw / 2, ry + 105), b['subtitle'], font=F('mono', 24), fill=MUTED, anchor='mm')
        d.text((rx + 30, ry + 150), dash, font=F('mono', 24), fill=MUTED)
    f = F('mono', 30)
    for k in range(vis):
        a, v = b['lines'][k]; y = ry + 200 + k * 64
        d.text((rx + 40, y), a, font=f, fill=INK); d.text((rx + rw - 40, y), v, font=f, fill=INK, anchor='ra')
    if vis >= n:
        t0 = .4 + n * .5; y = ry + 200 + n * 64 + 20
        d.text((rx + 30, y), dash, font=F('mono', 24), fill=MUTED)
        lab, val = b['total']; cur = val * ease((lt - t0) / 1.2)
        d.text((rx + 40, y + 50), lab, font=F('mono', 30), fill=INK)
        s = f'${cur:,.0f}' if val >= 1000 else f'${cur:,.2f}'; vf = F('serif', 96); vw = vf.getlength(s)
        if lt > t0 + 1.2: d.rectangle([rx + rw - 50 - vw - 14, y + 104, rx + rw - 36, y + 196], fill=HL)
        d.text((rx + rw - 40, y + 92), s, font=vf, fill=INK, anchor='ra')
        put_stamp(img, b.get('stamp', 'EXAMPLE'), lt, t0 + 1.5, rx + 170, y + 245, 34)
    return img

# ---- new beats
@functools.lru_cache(None)
def tag_img(val, sub, w=420, h=128, hl=False):
    im = Image.new('RGBA', (w + 8, h + 8), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.polygon([(40, 0), (w, 0), (w, h), (40, h), (0, h / 2)], fill=(HL if hl else SHEET) + (255,), outline=INK)
    d.ellipse([26, h / 2 - 9, 44, h / 2 + 9], outline=INK, width=3)
    d.text((66, 14), sub.upper(), font=F('mono', 20), fill=INK if hl else MUTED)
    d.text((66, 34), val, font=F('serif', 84), fill=INK)
    return im

def ladder_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False))
    fr = photo_frame('eggs', lt, dur, 'push'); x0 = 1240
    img.paste(Image.fromarray(fr[:, 260:260 + (W - x0)]), (x0, 0))
    d = ImageDraw.Draw(img); d.line([(x0, 0), (x0, H)], fill=HL, width=3)
    d.text((190, 130), b['head'], font=F('mono', 30), fill=MUT)
    vals = [float(v.strip('$')) for v, _ in b['items']]; lo, hi_ = min(vals), max(vals)
    for k, ((v, who), fv) in enumerate(zip(b['items'], vals)):
        y = 180 + k * 140
        a = 1 if b.get('instant') else ease((lt - .2 - k * .25) / .3)
        if a <= 0: continue
        last = fv == hi_
        t = tag_img(v, who, hl=last and lt > 1.6)
        img.paste(t, (190, y), t)
        L = 30 + 560 * (fv - lo + .15) / (hi_ - lo + .15) * ease((lt - .3 - k * .15) / .7)
        d.rectangle([650, y + 54, 650 + L, y + 74], fill=HL if last else (110, 108, 102))
    margin_note(img, '→ +20% for the same dozen', lt, start=1.8, x=650, y=890)
    d.text((190, 1042), 'SOURCE: ' + b['src'], font=F('mono', 18), fill=MUT)
    return img

def baskets_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    d.text((190, 130), b['head'], font=F('serif', 84), fill=FG)
    hi_ = max(v for _, v in b['items']); lo = min(v for _, v in b['items'])
    for k, (lab, v) in enumerate(b['items']):
        t0 = .3 + k * .6; a = ease((lt - t0) / .4)
        if a <= 0: continue
        x = 190 + k * 520; y = 280; hh = int(560 * a)
        zig = [(x + q * 20, y + hh + (10 if q % 2 else 0)) for q in range(440 // 20 + 1)]
        d.polygon([(x, y), (x + 440, y), (x + 440, y + hh)] + zig[::-1], fill=RECEIPT)
        if a < .9: continue
        d.text((x + 220, y + 50), f'SHOPPER {lab}', font=F('mono', 30), fill=INK, anchor='mm')
        d.text((x + 220, y + 90), '18-20 items · same basket', font=F('mono', 20), fill=MUTED, anchor='mm')
        for q in range(5): d.rectangle([x + 40, y + 140 + q * 40, x + 400 - (q % 3) * 50, y + 152 + q * 40], fill=(222, 218, 208))
        cur = v * ease((lt - t0 - .4) / 1.0); s = f'${cur:,.2f}'; vf = F('serif', 96)
        if v == hi_ and lt > t0 + 1.4: d.rectangle([x + 30, y + 400, x + 410, y + 500], fill=HL)
        d.text((x + 220, y + 390), s, font=vf, fill=INK, anchor='ma')
    if lt > 2.6:
        put_stamp(img, f'${hi_ - lo:.2f} APART', lt, 2.6, 1500, 190, 38, col=HL)
    d.text((190, 900), 'SOURCE: ' + b['src'], font=F('mono', 20), fill=MUT)
    return img

def datamap_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False)); d = ImageDraw.Draw(img)
    cx, cy = 1180, 520
    t = tag_img('$ ?', 'your price', 460, 140); img.paste(t, (int(cx - 230), int(cy - 70)), t)
    pos = [(330, 260), (330, 520), (330, 780), (1600, 300), (1600, 760)]
    for k, it in enumerate(b['items']):
        t0 = .3 + k * .8; a = ease((lt - t0) / .35)
        if a <= 0: continue
        px, py = pos[k]; on = k == b.get('hl') and lt > t0 + .3
        f = F('mono', 34); tw = f.getlength(it)
        bx0 = px - (0 if px < cx else tw + 40); bx1 = bx0 + tw + 40
        ex = bx1 if px < cx else bx0
        tx = cx - 240 if px < cx else cx + 240
        lx = ex + (tx - ex) * a; ly = py + (cy - py) * a
        d.line([(ex, py + 30), (lx, ly)], fill=(120, 118, 110), width=2)
        d.rectangle([bx0, py, bx1, py + 60], fill=HL if on else BGC, outline=FG, width=2)
        d.text((bx0 + 20, py + 8), it, font=f, fill=INK if on else FG)
    d.text((190, 130), 'What pricing tools can work with', font=F('serif', 76), fill=FG)
    d.text((190, 960), 'SOURCE: ' + b['src'], font=F('mono', 20), fill=MUT)
    return img

def verdict_beat(b, i, lt, dur):
    img = Image.fromarray(paper_base(i % 5, b['section'], ghost=False))
    fr = photo_frame(b['photo'], lt, dur, 'push'); x0 = 1240
    img.paste(Image.fromarray(fr[:, 260:260 + (W - x0)]), (x0, 0))
    d = ImageDraw.Draw(img); d.line([(x0, 0), (x0, H)], fill=HL, width=3)
    d.text((190, 170), 'THE CLAIM', font=F('mono', 28), fill=MUT)
    f = F('serif', 84); lines = wrap(b['claim'], f, 960)
    for k, ln in enumerate(lines):
        y = 220 + k * 96; d.text((190, y), ln, font=f, fill=FG)
        if b['verdict'] != 'DOCUMENTED':
            p = ease((lt - 1.4 - k * .2) / .4)
            if p > 0: d.line([(186, y + 56), (186 + (f.getlength(ln) + 8) * p, y + 56)], fill=HL, width=6)
    yb = 240 + len(lines) * 96 + 40
    if lt > .9:
        d.text((190, yb), 'WHAT\'S ON RECORD', font=F('mono', 28), fill=MUT)
        for k, ln in enumerate(wrap(b['fact'], F('mono', 36), 980)):
            d.text((190, yb + 50 + k * 52), ln[:int((lt - .9) * 60)], font=F('mono', 36), fill=FG)
    put_stamp(img, b['verdict'], lt, 1.8, 900, 860, 54, col=HL)
    return img

R.update(headline=headline_beat, compare=compare_beat, counter=counter_beat, chart=chart_beat, list=list_beat, takeaway=takeaway_beat,
         subscribe=subscribe_beat, receipt=receipt_beat, ladder=ladder_beat, baskets=baskets_beat, datamap=datamap_beat, verdict=verdict_beat)

CAPS.clear()
CAPFIX = [('four hundred and thirty-seven', '437'), ('three ninety-nine', '$3.99'), ('four seventy-nine', '$4.79'),
  ('a hundred and fourteen thirty-four', '$114.34'), ('a hundred and nineteen eighty-five', '$119.85'), ('a hundred and twenty-three ninety-three', '$123.93'),
  ('two hundred and sixty-two dollars', '$262'), ('two hundred and fifty', '250'), ('twelve hundred dollars', '$1,200'), ('a thousand dollars', '$1,000'),
  ('twenty twenty-six', '2026'), ('twenty twenty-five', '2025'), ('twenty twenty-four', '2024'), ('twenty twenty-two', '2022'), ('twenty nineteen', '2019'),
  ('twenty sixteen', '2016'), ('twenty fourteen', '2014'), ('twenty twelve', '2012'), ('Seventy-four percent', '74%'), ('thirteen percent', '13%'),
  ('was twenty-three', 'was 23%'), ('one to three percent', '1-3%'), ('two to five', '2-5%'), ('about seven percent', 'about 7%'), ('three percent', '3%'),
  ('KARE eleven', 'KARE 11'), ('sixteen big', '16 big'), ('nine of them', '9 of them'), ('August nineteenth', 'August 19'), ('September twenty-fifth', 'September 25'),
  ('eleven more', '11 more'), ('F T C', 'FTC'), ('Four checks', '4 checks'), ('two minutes', '2 minutes'), ('eight companies', '8 companies'), ('five different', '5 different'),
  ('family of four', 'family of 4')]
build_caps()
