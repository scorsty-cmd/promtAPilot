# Copy to custom_illos.py and add topic-specific illustrations. Executed inside render.py, so every helper
# is available: font(kind,size), rr(d,box,r,...), ease(), ease_back(), canvas(), glass(), colors A1 A2 A3 TXT MUTED BG CARD,
# IW=760, IH=600. `t` = seconds since the illustration appeared. Return True when you drew `name`.
CUSTOM_ANIMATED = {'radar'}   # names that animate forever (others freeze after 2 s)

def custom_illo(name, t, im, d):
    cx, cy = IW / 2, IH / 2
    if name == 'shield':
        s = ease_back(t / .6); r = 170 * s
        if r > 2:
            d.polygon([(cx, cy - r - 20), (cx + r, cy - r * .55), (cx + r * .8, cy + r * .5), (cx, cy + r + 10),
                       (cx - r * .8, cy + r * .5), (cx - r, cy - r * .55)], fill=A1 + (60,), outline=A1 + (255,))
            d.line([(cx - 60 * s, cy), (cx - 15 * s, cy + 45 * s), (cx + 70 * s, cy - 50 * s)], fill=A1, width=16, joint='curve')
        return True
    if name == 'radar':
        for k in range(3):
            r = ((t * 120 + k * 90) % 270)
            a = int(255 * (1 - r / 270))
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=A2 + (a,), width=6)
        d.ellipse([cx - 22, cy - 22, cx + 22, cy + 22], fill=A1)
        return True
    if name == 'bars':   # simple animated bar chart; edit labels/values per video
        vals = [('2023', .35), ('2024', .6), ('2025', .8), ('2026', 1.0)]
        for i, (lab, v) in enumerate(vals):
            p = ease((t - i * .15) / .6); h = 360 * v * p; x = 110 + i * 150
            rr(d, [x, 470 - h, x + 100, 470], 14, fill=(A1 if i == len(vals) - 1 else A2) + (230,))
            d.text((x + 50, 510), lab, font=font('semi', 30), fill=MUTED, anchor='mm')
        return True
    return False
