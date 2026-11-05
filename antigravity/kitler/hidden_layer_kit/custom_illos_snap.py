CUSTOM_ANIMATED = {'globe'}
def custom_illo(name, t, im, d):
    cx, cy = IW / 2, IH / 2
    if name == 'quote':
        rr(d, [90, 70, 670, 500], 30, fill=(40, 46, 74, 255))
        d.text((130, 115), 'TERMS OF SERVICE  ·  §2', font=font('semi', 28), fill=MUTED)
        for k, w in enumerate([480, 520, 300, 500, 460, 380]):
            y = 180 + k * 48
            if k in (2, 3):
                p = ease((t - .3) / .6)
                d.rectangle([122, y - 10, 122 + 30 + w * p, y + 26], fill=(255, 196, 61, 80))
            d.rounded_rectangle([130, y, 130 + w, y + 16], 8, fill=(255, 196, 61) if k in (2, 3) else (110, 116, 145))
        d.text((cx, 545), 'Snap Inc. Terms (US), eff. Sep 21 2026', font=font('semi', 26), fill=MUTED, anchor='mm')
        return True
    if name == 'globe':
        r = 190; d.ellipse([cx - r, cy - 20 - r, cx + r, cy - 20 + r], outline=A2, width=8)
        for k in range(-2, 3):
            w = abs(r * math.cos(t * .8 + k * .6)); d.ellipse([cx - w, cy - 20 - r, cx + w, cy - 20 + r], outline=A2 + (120,), width=4)
        for k in (-1, 0, 1):
            y = cy - 20 + k * 90; hw = math.sqrt(max(0, r * r - (k * 90) ** 2)); d.line([cx - hw, y, cx + hw, y], fill=A2 + (120,), width=4)
        for (px, py) in [(-80, -70), (60, 10), (-20, 90)]:
            x, y = cx + px, cy - 20 + py; d.ellipse([x - 18, y - 18, x + 18, y + 18], fill=A1)
        d.text((cx, 560), 'Public = visible to everyone', font=font('semi', 28), fill=MUTED, anchor='mm')
        return True
    if name == 'face':
        d.ellipse([cx - 95, 110, cx + 95, 300], fill=(90, 96, 125))
        d.pieslice([cx - 170, 290, cx + 170, 560], 180, 360, fill=(90, 96, 125))
        for i in range(14):
            amp = .3 + .7 * abs(math.sin(t * 5 + i * .8)); h = 120 * amp; x = 560 + (i % 7) * 22 if i < 7 else 120 + (i - 7) * 22
            d.rounded_rectangle([x, 300 - h / 2, x + 10, 300 + h / 2], 5, fill=A1)
        return True
    return False
CUSTOM_ANIMATED.add('face')
