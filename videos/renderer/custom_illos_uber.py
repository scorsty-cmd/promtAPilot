# Uber-pricing illustrations (760x600 glass card). All shapes sized by ease_back() are guarded so y1 >= y0.
CUSTOM_ANIMATED = {'nn', 'clock'}

def _box(d, x0, y0, x1, y1, r, **kw):
    if x1 - x0 > 2 and y1 - y0 > 2: rr(d, [x0, y0, x1, y1], r, **kw)

def custom_illo(name, t, im, d):
    cx, cy = IW / 2, IH / 2
    if name == 'formula':
        items = [('TIME', A2), ('DISTANCE', A2), ('FEES + TOLLS', (150, 156, 185))]
        for k, (lab, col) in enumerate(items):
            p = ease_back((t - k * .35) / .5)
            w = 560 * max(0, p); y = 70 + k * 120
            _box(d, cx - w / 2, y, cx + w / 2, y + 90, 22, fill=col + (70,), outline=col + (255,), width=4)
            if p > .6: d.text((cx, y + 45), lab, font=font('bold', 40), fill=TXT, anchor='mm')
            if k < 2 and p > .8: d.text((cx, y + 105), '+', font=font('black', 40), fill=MUTED, anchor='mm')
        p = ease((t - 1.3) / .5)
        if p > 0:
            d.line([110, 440, 650, 440], fill=(255, 255, 255, int(120 * p)), width=4)
            d.text((cx, 510), 'BASE FARE', font=font('black', 64), fill=A1 + (int(255 * p),), anchor='mm')
        return True
    if name == 'nn':
        layers = [3, 5, 5, 2]; xs = [130, 300, 470, 630]
        pos = [[(xs[i], cy - 20 + (j - (n - 1) / 2) * 92) for j in range(n)] for i, n in enumerate(layers)]
        for i in range(3):
            for a in pos[i]:
                for b_ in pos[i + 1]:
                    ph = (math.sin(t * 3 - i * 1.2 + a[1] * .02) + 1) / 2
                    d.line([a, b_], fill=A2 + (int(40 + 120 * ph),), width=2)
        for i, col in enumerate(pos):
            for (x, y) in col:
                ph = (math.sin(t * 3 - i * 1.2 + y * .02) + 1) / 2
                c = A1 if i == 3 else A2
                d.ellipse([x - 22, y - 22, x + 22, y + 22], fill=c + (int(120 + 135 * ph),))
        d.text((130, 540), 'Route, traffic', font=font('semi', 26), fill=MUTED, anchor='mm')
        d.text((630, 540), 'ETA', font=font('bold', 30), fill=A1, anchor='mm')
        return True
    if name == 'routes':
        A = (110, 470); Bp = (650, 130)
        p = ease(t / 1.2)
        pts1 = [A, (110, 300), (380, 300), (380, 130), Bp]
        pts2 = [A, (380, 470), (380, 300), (650, 300), Bp]
        for pts, col, lab, ly in [(pts1, A2, '$14', 220), (pts2, A1, '$19', 400)]:
            n = max(2, int(len(pts) * p + 1)); seg = pts[:min(len(pts), n)]
            if len(seg) >= 2: d.line(seg, fill=col, width=12, joint='curve')
            if p > .9: d.text((pts[2][0] + 40, ly), lab, font=font('black', 52), fill=col, anchor='lm')
        for (x, y) in (A, Bp): d.ellipse([x - 22, y - 22, x + 22, y + 22], fill=TXT)
        d.text((cx, 550), 'Same distance · example prices', font=font('semi', 26), fill=MUTED, anchor='mm')
        return True
    if name == 'split':
        p = ease(t / 1.0); off = 70 * p
        for k, (lab, col, val) in enumerate([('RIDER PAYS', A1, '$24'), ('DRIVER GETS', A2, '$15')]):
            x = 90 + k * 310; y = 150 + (off if k else -off) * .6
            _box(d, x, y, x + 270, y + 240, 28, fill=col + (60,), outline=col + (255,), width=5)
            d.text((x + 135, y + 70), lab, font=font('bold', 30), fill=TXT, anchor='mm')
            d.text((x + 135, y + 160), val, font=font('black', 84), fill=col, anchor='mm')
        if p > .7: d.text((cx, 530), 'Two separate numbers · example', font=font('semi', 26), fill=MUTED, anchor='mm')
        return True
    if name == 'battery':
        _box(d, 170, 180, 560, 400, 30, outline=TXT + (255,), width=10)
        _box(d, 560, 250, 600, 330, 10, fill=TXT + (255,))
        lvl = max(0.08, 0.9 - 0.82 * ease(t / 1.4))
        col = A3 if lvl < .25 else A1
        _box(d, 190, 200, 190 + 350 * lvl, 380, 18, fill=col + (255,))
        d.text((cx, 470), f'{int(lvl * 100)}%', font=font('black', 70), fill=col, anchor='mm')
        return True
    if name == 'clock':
        r = 190; d.ellipse([cx - r, cy - 30 - r, cx + r, cy - 30 + r], outline=(80, 86, 115), width=14)
        a = t * 1.4
        d.line([cx, cy - 30, cx + 150 * math.sin(a), cy - 30 - 150 * math.cos(a)], fill=A1, width=12)
        d.line([cx, cy - 30, cx + 90 * math.sin(a / 12), cy - 30 - 90 * math.cos(a / 12)], fill=TXT, width=14)
        d.ellipse([cx - 16, cy - 46, cx + 16, cy - 14], fill=A1)
        d.text((cx, 545), 'Where + when you ask', font=font('semi', 30), fill=MUTED, anchor='mm')
        return True
    return False
