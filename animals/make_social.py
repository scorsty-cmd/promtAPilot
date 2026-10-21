#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Instagram feed carousel + story images for Universe Of Animals (posted by the user's
Antigravity agent through Buffer).

    python animals/make_social.py social.json out_dir

social.json:
{
  "frames": ["/abs/frame1.jpg", "/abs/frame2.jpg"],     # stills from today's clip (background photos)
  "carousel": [                                          # 3-6 slides, 1080x1350 (4:5)
     {"kicker": "BUNU BİLİYOR MUYDUN?", "title": "Kediler neden kutuya bayılır?", "body": "...", "frame": 0},
     {"title": "1. Güvende hissederler", "body": "..."},
     {"title": "Sizin kediniz hangisini yapıyor?", "body": "Yorumlara yaz 👇", "cta": true}
  ],
  "stories": [                                           # 1-3 stories, 1080x1920
     {"kind": "teaser", "title": "Yeni video!", "body": "...", "frame": 1},
     {"kind": "question", "title": "Kediniz en çok nerede uyur?", "body": "Cevabını yaz"},
     {"kind": "promo", "title": "Kedin ne düşünüyor?", "body": "Kedi Davranışları Bilimi e-kitabı", "foot": "Link profilde"}
  ]
}
Any slide or story may add "cover": "/abs/cover.jpg" (e-book cover, shown with a shadow) and
"bullets": ["…", "…"] (up to 3 short points shown under the cover).
Outputs IG_post_01.jpg… and IG_story_01.jpg… (emoji are stripped from images; keep them for captions).
"""
import json, os, re, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
F_BLACK = os.path.join(HERE, 'fonts', 'InterDisplay-Black.otf')
F_BOLD = os.path.join(HERE, 'fonts', 'InterDisplay-Bold.otf')
CREAM, INK, YELLOW, RED, WHITE = (255, 248, 235), (20, 20, 20), (255, 205, 0), (230, 33, 23), (255, 255, 255)
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿️‍]+')


def clean(t):
    return EMOJI.sub('', t or '').strip()


def f(path, size):
    return ImageFont.truetype(path, size)


def wrap(d, text, font, maxw):
    out = []
    for para in clean(text).split('\n'):
        cur = ''
        for w in para.split():
            t = (cur + ' ' + w).strip()
            if d.textlength(t, font=font) <= maxw or not cur:
                cur = t
            else:
                out.append(cur); cur = w
        out.append(cur)
    return out


def fit(d, text, path, size, maxw, max_lines, min_size=34):
    while True:
        fnt = f(path, size)
        lines = wrap(d, text, fnt, maxw)
        if len(lines) <= max_lines or size <= min_size:
            return fnt, lines
        size -= 4


def bg_from(frame, w, h, darken=0.55, blur=0):
    im = Image.open(frame).convert('RGB')
    s = max(w / im.width, h / im.height)
    im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    im = im.crop((x, y, x + w, y + h))
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    return ImageEnhance.Brightness(im).enhance(darken)


def draw_lines(d, lines, fnt, x, y, fill, lh, center_w=None, stroke=0):
    for l in lines:
        xx = x if center_w is None else x + (center_w - d.textlength(l, font=fnt)) / 2
        d.text((xx, y), l, font=fnt, fill=fill, stroke_width=stroke, stroke_fill=INK)
        y += lh
    return y


def handle(d, w, y, color):
    t = 'Universe Of Animals'
    fnt = f(F_BOLD, 34)
    d.text(((w - d.textlength(t, font=fnt)) / 2, y), t, font=fnt, fill=color)


def paste_cover(im, cover, cx, top, height):
    """E-book cover with a soft drop shadow, centred on cx; returns bottom y."""
    c = Image.open(cover).convert('RGB')
    w = int(c.width * height / c.height)
    c = c.resize((w, height), Image.LANCZOS)
    sh = Image.new('RGBA', (w + 80, height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([40, 50, w + 40, height + 50], radius=18, fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    im.paste(sh, (int(cx - w / 2 - 40), top - 40), sh)
    im.paste(c, (int(cx - w / 2), top))
    return top + height


def bullets_block(d, items, x, y, w, color, size=50):
    fnt = f(F_BOLD, size)
    for b in items[:3]:
        lines = wrap(d, '✓ ' if False else b, fnt, w - 70)
        d.ellipse([x, y + size * 0.3, x + 30, y + size * 0.3 + 30], fill=RED)
        for l in lines:
            d.text((x + 55, y), l, font=fnt, fill=color); y += int(size * 1.25)
        y += 18
    return y


def slide(s, idx, total, frames, path):
    W, H = 1080, 1350
    has_photo = frames and s.get('frame') is not None and s['frame'] < len(frames)
    if has_photo:
        im = bg_from(frames[s['frame']], W, H, 0.5); d = ImageDraw.Draw(im); txt = WHITE
    else:
        im = Image.new('RGB', (W, H), YELLOW if s.get('cta') else CREAM); d = ImageDraw.Draw(im); txt = INK
    m = 90
    kf = f(F_BLACK, 40)
    tf, tl = fit(d, s.get('title', ''), F_BLACK, 96, W - 2 * m, 4)
    bf, bl = fit(d, s.get('body', ''), F_BOLD, 60, W - 2 * m, 8, 34) if s.get('body') else (None, [])
    block = (120 if s.get('kicker') else 0) + int(tf.size * 1.12) * len(tl) + (40 + int(bf.size * 1.3) * len(bl) if bl else 0)
    y = max(140, (H - 200 - block) / 2) if not (has_photo or s.get('cover') or s.get('bullets')) else 150   # centre text on plain slides
    if s.get('kicker'):
        k = clean(s['kicker']); kw = d.textlength(k, font=kf)
        d.rounded_rectangle([m, y, m + kw + 48, y + 72], radius=36, fill=RED)
        d.text((m + 24, y + 12), k, font=kf, fill=WHITE); y += 120
    y = draw_lines(d, tl, tf, m, y, txt, int(tf.size * 1.12), stroke=6 if has_photo else 0) + 40
    if bl:
        y = draw_lines(d, bl, bf, m, y, txt, int(bf.size * 1.3), stroke=4 if has_photo else 0)
    if s.get('cover') and os.path.exists(s['cover']):
        y = paste_cover(im, s['cover'], W / 2, int(y + 30), min(560, int(H - 260 - y - 40)))
    if s.get('bullets'):
        bullets_block(d, s['bullets'], m, y + 30, W - 2 * m, txt, 44)
    if total > 1:   # page dots + swipe hint
        for i in range(total):
            cx = W / 2 + (i - (total - 1) / 2) * 34
            d.ellipse([cx - 9, H - 150, cx + 9, H - 132], fill=(txt if i == idx else (150, 150, 150)))
        if idx < total - 1:
            hf = f(F_BOLD, 36); d.text((W - m - d.textlength('Kaydır >', font=hf), H - 160), 'Kaydır >', font=hf, fill=txt)
    handle(d, W, H - 80, txt)
    im.save(path, quality=92)


def story(s, frames, path):
    W, H = 1080, 1920
    kind = s.get('kind', 'teaser')
    has_photo = frames and s.get('frame') is not None and s['frame'] < len(frames)
    if has_photo:
        im = bg_from(frames[s['frame']], W, H, 0.55)
    else:
        im = Image.new('RGB', (W, H), {'promo': (24, 70, 120), 'question': YELLOW}.get(kind, CREAM))
    d = ImageDraw.Draw(im)
    txt = INK if (not has_photo and kind == 'question') or (not has_photo and kind == 'teaser') else WHITE
    m = 100
    # top 250 px and bottom 300 px are covered by Instagram UI / stickers
    tf, tl = fit(d, s.get('title', ''), F_BLACK, 110, W - 2 * m, 4)
    lh = int(tf.size * 1.12)
    y = 260 if (s.get('cover') or s.get('bullets')) else 520
    if kind == 'question':
        box_h = lh * len(tl) + 120
        d.rounded_rectangle([m - 30, y - 60, W - m + 30, y - 60 + box_h], radius=48, fill=WHITE)
        txt = INK
    y = draw_lines(d, tl, tf, m, y, txt, lh, center_w=W - 2 * m, stroke=0 if kind == 'question' else (6 if has_photo else 0)) + 60
    if s.get('body'):
        bf, bl = fit(d, s['body'], F_BOLD, 60, W - 2 * m, 5, 36)
        y = draw_lines(d, bl, bf, m, y + (60 if kind == 'question' else 0), WHITE if has_photo or kind == 'promo' else INK,
                       int(bf.size * 1.3), center_w=W - 2 * m, stroke=4 if has_photo else 0) + 40
    if s.get('cover') and os.path.exists(s['cover']):
        y = paste_cover(im, s['cover'], W / 2, int(y), 440) + 50
    if s.get('bullets'):
        y = bullets_block(d, s['bullets'], m + 20, y, W - 2 * m - 40, WHITE if has_photo or kind == 'promo' else INK, 46)
    if kind == 'question':   # space for Buffer/Instagram question sticker
        d.rounded_rectangle([m, y + 40, W - m, y + 220], radius=40, outline=INK if not has_photo else WHITE, width=5)
        hf = f(F_BOLD, 44); t = 'Cevabını buraya yaz'
        d.text(((W - d.textlength(t, font=hf)) / 2, y + 105), t, font=hf, fill=INK if not has_photo else WHITE)
    if s.get('foot'):
        ff = f(F_BLACK, 64); t = clean(s['foot']); tw = d.textlength(t, font=ff)
        fy = max(1470, int(y) + 30)
        d.rounded_rectangle([(W - tw) / 2 - 50, fy, (W + tw) / 2 + 50, fy + 120], radius=60, fill=RED)
        d.text(((W - tw) / 2, fy + 20), t, font=ff, fill=WHITE)
    handle(d, W, 1650, WHITE if has_photo or kind == 'promo' else INK)
    im.save(path, quality=92)


def main(spec, out):
    sp = json.load(open(spec, encoding='utf-8'))
    os.makedirs(out, exist_ok=True)
    frames = sp.get('frames', [])
    car = sp.get('carousel', [])
    for i, s in enumerate(car):
        slide(s, i, len(car), frames, os.path.join(out, f'IG_post_{i + 1:02d}.jpg'))
    for i, s in enumerate(sp.get('stories', [])):
        story(s, frames, os.path.join(out, f'IG_story_{i + 1:02d}.jpg'))
    print('ok', len(car), 'slides', len(sp.get('stories', [])), 'stories')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
