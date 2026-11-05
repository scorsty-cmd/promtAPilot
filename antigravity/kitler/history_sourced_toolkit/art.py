"""Procedurally drawn illustrations: character portraits, longships, icons, armies."""
import functools, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
from engine import pil_sprite, hexc, text_sprite, blit, premult

S = 2  # supersampling

def _ell(d, cx, cy, rx, ry, fill, outline=None, width=0):
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=fill, outline=outline, width=width)

CHAR = {
    # skin, hair, beard style, cloak, bg, headgear, eye
    "harald": dict(skin="#e3b48e", hair="#b9802a", beard="long", cloak="#8e1b1b", trim="#d4a640", bg=("#5b1414", "#1d0707"), head="helmet", tall=True),
    "harold": dict(skin="#e0ad86", hair="#7a4a22", beard="moustache", cloak="#1f3c73", trim="#d4a640", bg=("#1c3360", "#08101f"), head="crown"),
    "william": dict(skin="#e6b893", hair="#3a2414", beard="none", cloak="#9c6b12", trim="#e9c46a", bg=("#6b4a0c", "#1f1503"), head="crown_low"),
    "edward": dict(skin="#e8c3a3", hair="#e8e2d4", beard="white", cloak="#5b2a72", trim="#d4a640", bg=("#43205a", "#140820"), head="crown"),
    "tostig": dict(skin="#deaa82", hair="#2e1c10", beard="short", cloak="#2f5e2a", trim="#b9a36a", bg=("#24461f", "#0a1408"), head="none"),
    "baldwin": dict(skin="#e9c6a6", hair="#c8a060", beard="none", cloak="#ece4d0", trim="#d4a640", bg=("#6b5a1c", "#1a1405"), head="crown", hairback=True, emblem="jerusalem", lesions=True),
    "saladin": dict(skin="#c99470", hair="#2a1a10", beard="short", cloak="#1f5a3a", trim="#d4a640", bg=("#1d4a33", "#06140c"), head="turban"),
    "raynald": dict(skin="#e0ad86", hair="#5a3a1e", beard="short", cloak="#7a1d1d", trim="#c9c9c9", bg=("#4a1a14", "#140604"), head="coif"),
    "odo": dict(skin="#deaa82", hair="#3a2a1a", beard="long", cloak="#efe8d8", trim="#b3202a", bg=("#5a1414", "#160505"), head="coif", emblem="templar"),
    "williamtyre": dict(skin="#e6b893", hair="#6a4a2a", beard="short", cloak="#5b2a72", trim="#d4a640", bg=("#3a2050", "#100818"), head="mitre"),
    "taqi": dict(skin="#c48e68", hair="#1e140c", beard="short", cloak="#6b4a12", trim="#d4a640", bg=("#4a3410", "#140c03"), head="turban"),
    "guy": dict(skin="#e8bf9c", hair="#b98a46", beard="short", cloak="#2a4a8a", trim="#e8e2d4", bg=("#24407a", "#08122a"), head="crown_low", emblem="jerusalem"),
    "raymond": dict(skin="#d9a47c", hair="#4a4038", beard="short", cloak="#a8761c", trim="#b3202a", bg=("#6a4a10", "#1a1004"), head="none"),
    "gerard": dict(skin="#deaa82", hair="#8a8478", beard="long", cloak="#efe8d8", trim="#b3202a", bg=("#3a3a3a", "#0e0e0e"), head="coif", emblem="templar"),
    "afdal": dict(skin="#c99a76", hair="#1e140c", beard="none", cloak="#2a6a4a", trim="#d4a640", bg=("#1d4a33", "#06140c"), head="turban"),
    "imad": dict(skin="#c48e68", hair="#d8d2c4", beard="white", cloak="#3a3a5a", trim="#d4a640", bg=("#2a2a44", "#0a0a14"), head="turban"),
    "richard": dict(skin="#e8bf9c", hair="#b8642a", beard="short", cloak="#a01c1c", trim="#e9c46a", bg=("#6a1414", "#1a0404"), head="crown"),
    "urban": dict(skin="#e6c0a0", hair="#e8e2d4", beard="white", cloak="#e8e0cc", trim="#d4a640", bg=("#5a4a1a", "#141004"), head="mitre"),
    # ---- Roanoke 1587 (Unsolved #1): v4 features ruff / hat / roach / cap / female / curls / paint
    "white": dict(skin="#e6b893", hair="#7a5a3a", beard="short", cloak="#3a2a1e", trim="#d4a640", bg=("#2a3442", "#0a0e14"), head="hat", ruff=True),
    "raleigh": dict(skin="#e8bf9c", hair="#3a2414", beard="pointed", cloak="#1e1e2a", trim="#e8e2d4", bg=("#3a2a4a", "#100a16"), head="hat", ruff=True, pearl=True),
    "elizabeth": dict(skin="#f2d6c0", hair="#c0562a", beard="none", cloak="#e8e0cc", trim="#d4a640", bg=("#4a1a2a", "#14060a"), head="crown_small", ruff=True, female=True, curls=True, pearl=True),
    "manteo": dict(skin="#b07a52", hair="#1a120c", beard="none", cloak="#7a5232", trim="#e8dcc0", bg=("#2a4a3a", "#08140e"), head="roach", paint=True, beads=True),
    "wanchese": dict(skin="#a8724c", hair="#1a120c", beard="none", cloak="#6a4228", trim="#b3202a", bg=("#4a2a1a", "#140a06"), head="roach", paint=True),
    "wingina": dict(skin="#a8724c", hair="#1a120c", beard="none", cloak="#5a3a22", trim="#d9b25a", bg=("#3a2a1a", "#100a04"), head="roach", paint=True, beads=True),
    "lane": dict(skin="#deaa82", hair="#4a3020", beard="pointed", cloak="#5a5e64", trim="#c9c9c9", bg=("#3a3e44", "#0e1012"), head="morion", ruff=True),
    "fernandes": dict(skin="#c99470", hair="#2a1a10", beard="short", cloak="#2a3a5a", trim="#d4a640", bg=("#1e2a44", "#060a14"), head="capbonnet"),
    "eleanor": dict(skin="#f0cfb4", hair="#8a5a2b", beard="none", cloak="#4a5a3a", trim="#e8e0cc", bg=("#3a4a3a", "#0c140c"), head="cap", female=True, ruff=True),
    "strachey": dict(skin="#e6b893", hair="#5a3a1e", beard="pointed", cloak="#2a2a2a", trim="#e8e2d4", bg=("#2a2a3a", "#0a0a10"), head="capbonnet", ruff=True),
    "powhatan": dict(skin="#a06a46", hair="#d8d2c4", beard="none", cloak="#5a3a22", trim="#d9b25a", bg=("#4a1a14", "#140604"), head="roach", paint=True, beads=True),
    "orri": dict(skin="#e0b08a", hair="#8a5a2b", beard="short", cloak="#5a3a1e", trim="#a8a8a8", bg=("#4a2e14", "#140b04"), head="helmet"),
    # ---- Lost Ninth Legion (Unsolved #2, 29 Oct 2026): v6 features galea (Roman helmet + crest + cheek guards), laurel wreath,
    #      torc, glasses, toga fold, paint_col
    "trajan": dict(skin="#dcae88", hair="#6a5440", beard="none", cloak="#5a1a3a", trim="#d4a640", bg=("#4a1a34", "#14060e"), head="laurel", toga=True),
    "hadrian": dict(skin="#d9a982", hair="#4a3424", beard="short", cloak="#4a2466", trim="#d4a640", bg=("#3a2050", "#100818"), head="laurel", toga=True),
    "aurelius": dict(skin="#e0b28c", hair="#9a7444", beard="long_full", cloak="#4a2466", trim="#d4a640", bg=("#3a2a50", "#0e0a18"), head="laurel", toga=True),
    "cerialis": dict(skin="#deaa82", hair="#3a2414", beard="none", cloak="#8e1b1b", trim="#d4a640", bg=("#5b1414", "#1d0707"), head="galea", crest="#b01e1e"),
    "agricola": dict(skin="#d9a47c", hair="#8a8478", beard="none", cloak="#8e1b1b", trim="#e8e2d4", bg=("#4a1a14", "#140604"), head="galea", crest="#e8d070"),
    "severianus": dict(skin="#d9a47c", hair="#2a1a10", beard="short", cloak="#6a1414", trim="#d4a640", bg=("#3a1010", "#120404"), head="galea", crest="#d8d2c4"),
    "tacitus": dict(skin="#e0b08a", hair="#5a4a3a", beard="none", cloak="#ece4d0", trim="#8e1b1b", bg=("#3a3424", "#100e08"), head="none", toga=True),
    "fronto": dict(skin="#d6a47e", hair="#9a948a", beard="short", cloak="#ece4d0", trim="#8e1b1b", bg=("#2a3a3a", "#0a1010"), head="none", toga=True),
    "boudica": dict(skin="#f0d0b4", hair="#b8461e", beard="none", cloak="#3a5a2a", trim="#d9a830", bg=("#2a4a1e", "#081206"), head="none", female=True, torc=True,
                    paint=True, paint_col="#2a4a9a"),
    "caledonian": dict(skin="#e3b48e", hair="#8a4a1e", beard="moustache", cloak="#3a4a5a", trim="#b9a36a", bg=("#24364a", "#080e16"), head="none", torc=True,
                       paint=True, paint_col="#2a4a9a"),
    "mommsen": dict(skin="#ecc6a8", hair="#e8e4dc", beard="none", cloak="#1e1e22", trim="#e8e2d4", bg=("#2a2a2a", "#0a0a0a"), head="none", hairback=True, glasses=True),
}

@functools.lru_cache(None)
def portrait(who, size=420, grey=False):
    c = CHAR[who]; n = size * S
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    # radial background
    bg0, bg1 = np.array(hexc(c["bg"][0])), np.array(hexc(c["bg"][1]))
    yy, xx = np.mgrid[0:n, 0:n]; r = np.sqrt((xx - n / 2) ** 2 + (yy - n * .42) ** 2) / (n * .6)
    g = (bg0 * (1 - np.clip(r, 0, 1)[..., None]) + bg1 * np.clip(r, 0, 1)[..., None]).astype(np.uint8)
    bgimg = Image.fromarray(np.dstack([g, np.full((n, n), 255, np.uint8)]), "RGBA")
    img = Image.alpha_composite(img, bgimg); d = ImageDraw.Draw(img)
    cx = n / 2; hy = n * .43 if c.get("tall") else n * .45
    skin = c["skin"]; dark = tuple(int(v * .78) for v in hexc(skin))
    # shoulders / cloak
    d.ellipse([cx - n * .42, n * .76, cx + n * .42, n * 1.25], fill=c["cloak"])
    d.polygon([(cx - n * .12, n * .74), (cx + n * .12, n * .74), (cx, n * .92)], fill=dark)  # neck V
    d.polygon([(cx - n * .30, n * .80), (cx - n * .05, n * .78), (cx - n * .14, n * 1.0)], fill=tuple(int(v * .8) for v in hexc(c["cloak"])))
    _ell(d, cx + n * .2, n * .86, n * .035, n * .035, c["trim"])  # brooch
    # neck
    d.rectangle([cx - n * .065, hy + n * .14, cx + n * .065, n * .8], fill=dark)
    # hair back (long)
    if who in ("harald", "edward"):
        d.ellipse([cx - n * .17, hy - n * .15, cx + n * .17, hy + n * .27], fill=c["hair"])
    elif c.get("female"):
        d.rounded_rectangle([cx - n * .19, hy - n * .19, cx + n * .19, hy + n * .3], int(n * .14), fill=c["hair"])
    elif c.get("hairback"):
        d.rounded_rectangle([cx - n * .165, hy - n * .17, cx + n * .165, hy + n * .13], int(n * .1), fill=c["hair"])
    # head
    _ell(d, cx, hy, n * .135, n * .17, skin)
    _ell(d, cx + n * .06, hy + n * .02, n * .07, n * .14, tuple(int(v * .93) for v in hexc(skin)))  # shade
    # ears
    _ell(d, cx - n * .135, hy + n * .01, n * .02, n * .035, dark); _ell(d, cx + n * .135, hy + n * .01, n * .02, n * .035, dark)
    # eyes & brows
    ey = hy - n * .005
    for sx in (-1, 1):
        _ell(d, cx + sx * n * .052, ey, n * .02, n * .011, "#f3ead8")
        _ell(d, cx + sx * n * .05, ey, n * .009, n * .01, "#20140c")
        d.line([cx + sx * n * .025, ey - n * .03, cx + sx * n * .08, ey - n * .035], fill=c["hair"] if who != "edward" else "#cfc8b8", width=int(n * .012))
    # nose
    d.line([cx, ey + n * .005, cx + n * .012, ey + n * .055, cx - n * .006, ey + n * .06], fill=dark, width=int(n * .008))
    if c.get("lesions"):
        for (lx, ly, lr) in ((-.085, .06, .022), (.075, .075, .018), (-.04, -.09, .014), (.095, -.02, .012)):
            _ell(d, cx + n * lx, hy + n * ly, n * lr, n * lr * .8, tuple(int(v * .9) for v in hexc("#d9a08a")))
    # beard
    bh = c["beard"]; hc = c["hair"] if bh != "white" else "#ece7da"
    if bh in ("long", "white", "long_full"):
        d.polygon([(cx - n * .135, hy + n * .03), (cx - n * .1, hy + n * .07), (cx - n * .03, hy + n * .065), (cx, hy + n * .075), (cx + n * .03, hy + n * .065), (cx + n * .1, hy + n * .07), (cx + n * .135, hy + n * .03), (cx + n * .11, hy + n * .2),
                   (cx + n * .03, hy + n * .33), (cx - n * .03, hy + n * .33), (cx - n * .11, hy + n * .2)], fill=hc)
        if bh == "long":  # braids
            d.line([cx - n * .03, hy + n * .25, cx - n * .025, hy + n * .38], fill=hc, width=int(n * .025))
            d.line([cx + n * .03, hy + n * .25, cx + n * .025, hy + n * .38], fill=hc, width=int(n * .025))
            for sx in (-1, 1): _ell(d, cx + sx * n * .025, hy + n * .38, n * .012, n * .012, c["trim"])
        _ell(d, cx, hy + n * .105, n * .035, n * .013, "#5a2a1e")
    elif bh == "short":
        d.polygon([(cx - n * .135, hy + n * .04), (cx - n * .09, hy + n * .075), (cx, hy + n * .07), (cx + n * .09, hy + n * .075), (cx + n * .135, hy + n * .04), (cx + n * .1, hy + n * .14),
                   (cx, hy + n * .2), (cx - n * .1, hy + n * .14)], fill=hc)
        _ell(d, cx, hy + n * .105, n * .032, n * .012, "#5a2a1e")
    elif bh == "pointed":   # Elizabethan spade beard + moustache
        d.polygon([(cx - n * .1, hy + n * .07), (cx - n * .03, hy + n * .085), (cx + n * .03, hy + n * .085), (cx + n * .1, hy + n * .07), (cx + n * .05, hy + n * .16), (cx, hy + n * .25), (cx - n * .05, hy + n * .16)], fill=hc)
        d.polygon([(cx - n * .005, hy + n * .07), (cx - n * .08, hy + n * .085), (cx - n * .09, hy + n * .06), (cx - n * .04, hy + n * .07)], fill=hc)
        d.polygon([(cx + n * .005, hy + n * .07), (cx + n * .08, hy + n * .085), (cx + n * .09, hy + n * .06), (cx + n * .04, hy + n * .07)], fill=hc)
        _ell(d, cx, hy + n * .1, n * .03, n * .011, "#6a2f22")
    elif bh == "moustache":
        _ell(d, cx, hy + n * .095, n * .03, n * .011, "#6a2f22")
        d.polygon([(cx - n * .005, hy + n * .07), (cx - n * .07, hy + n * .09), (cx - n * .085, hy + n * .14), (cx - n * .05, hy + n * .095)], fill=hc)
        d.polygon([(cx + n * .005, hy + n * .07), (cx + n * .07, hy + n * .09), (cx + n * .085, hy + n * .14), (cx + n * .05, hy + n * .095)], fill=hc)
    else:
        _ell(d, cx, hy + n * .095, n * .032, n * .011, "#b8584a" if c.get("female") else "#7a3a2a")
    if c.get("paint"):   # Algonquian face paint: two thin lines on each cheek
        for sx in (-1, 1):
            for k in range(2):
                d.line([cx + sx * n * .06, hy + n * (.03 + k * .03), cx + sx * n * .115, hy + n * (.02 + k * .03)], fill=c.get("paint_col", "#8e2a1e"), width=int(n * (.016 if c.get("paint_col") else .01)))
    # hair top
    if c.get("curls"):
        for k in range(-3, 4):
            _ell(d, cx + k * n * .045, hy - n * .15 + abs(k) * n * .012, n * .045, n * .045, c["hair"])
        for sx in (-1, 1):
            for k in range(3): _ell(d, cx + sx * n * (.14 + k * .005), hy - n * .1 + k * n * .05, n * .04, n * .04, c["hair"])
    elif c["head"] in ("none", "crown", "crown_low", "hat", "cap", "capbonnet", "morion", "laurel") or c.get("female"):
        if who == "william":
            d.chord([cx - n * .14, hy - n * .19, cx + n * .14, hy + n * .06], 180, 360, fill=c["hair"])
        else:
            d.chord([cx - n * .15, hy - n * .2, cx + n * .15, hy + n * .1], 180, 360, fill=c["hair"])
            if who in ("tostig", "harold"):
                d.polygon([(cx - n * .15, hy - n * .05), (cx - n * .13, hy + n * .1), (cx - n * .115, hy - n * .03)], fill=c["hair"])
                d.polygon([(cx + n * .15, hy - n * .05), (cx + n * .13, hy + n * .1), (cx + n * .115, hy - n * .03)], fill=c["hair"])
    if c.get("ruff"):
        ry = hy + n * (.285 if c.get("female") else .3); rw = n * (.2 if c.get("female") else .17)
        _ell(d, cx, ry, rw, n * .055, "#efe9dc", "#9a9080", 3)
        for k in range(14):
            a_ = k / 14 * 6.283
            _ell(d, cx + rw * .82 * math.cos(a_), ry + n * .045 * math.sin(a_), n * .022, n * .016, "#f7f2e8", "#b0a694", 2)
    if c.get("beads"):
        for k in range(9):
            a_ = .5 + k / 8 * 2.1
            _ell(d, cx + n * .16 * math.cos(a_), hy + n * .27 + n * .06 * math.sin(a_), n * .014, n * .014, ["#e8dcc0", "#2a5a8a", "#b3202a"][k % 3])
    if c.get("pearl"):
        for sx in (-1, 1): _ell(d, cx + sx * n * .14, hy + n * .05, n * .012, n * .016, "#f4f0e6", "#9a9080", 1)
    if c.get("toga"):   # draped toga fold across the chest
        d.polygon([(cx - n * .36, n * .86), (cx + n * .05, n * .76), (cx + n * .3, n * .9), (cx + n * .1, n * .84), (cx - n * .2, n * .98)], fill=tuple(int(v * .86) for v in hexc(c["cloak"])))
        d.line([cx - n * .3, n * .9, cx + n * .2, n * .8], fill=c["trim"], width=int(n * .014))
    if c.get("torc"):   # Celtic gold neck ring
        d.arc([cx - n * .1, hy + n * .13, cx + n * .1, hy + n * .33], 20, 160, fill="#d9a830", width=int(n * .026))
        for sx in (-1, 1): _ell(d, cx + sx * n * .085, hy + n * .27, n * .022, n * .022, "#e8bb40", "#7a5a1a", 2)
    if c.get("glasses"):
        for sx in (-1, 1): _ell(d, cx + sx * n * .052, hy - n * .005, n * .036, n * .03, None, "#2a2018", int(n * .008))
        d.line([cx - n * .016, hy - n * .01, cx + n * .016, hy - n * .01], fill="#2a2018", width=int(n * .007))
    # headgear
    if c["head"] == "galea":   # Roman legionary/officer helmet: crest, steel bowl, brass brow band, cheek guards, neck guard
        steel, steeld, brass = "#a9b0b4", "#5d666b", "#c8a040"
        cr = c.get("crest", "#a01c1c"); crd = tuple(int(v * .7) for v in hexc(cr))
        d.chord([cx - n * .19, hy - n * .4, cx + n * .19, hy - n * .16], 180, 360, fill=cr)
        for k in range(16):
            xk = cx - n * .18 + k * n * .024
            d.line([xk, hy - n * .29, xk + n * .008, hy - n * .385 + abs(k - 7.5) * n * .005], fill=crd, width=max(1, int(n * .006)))
        d.rectangle([cx - n * .02, hy - n * .32, cx + n * .02, hy - n * .27], fill=brass)
        d.ellipse([cx - n * .205, hy - n * .11, cx + n * .205, hy - n * .055], fill=steeld)          # neck guard rim
        d.chord([cx - n * .165, hy - n * .31, cx + n * .165, hy + n * .02], 180, 360, fill=steel)
        d.arc([cx - n * .12, hy - n * .27, cx + n * .06, hy - n * .05], 200, 280, fill="#d8dee0", width=int(n * .012))  # highlight
        d.rectangle([cx - n * .168, hy - n * .115, cx + n * .168, hy - n * .08], fill=brass)
        for k in range(-2, 3): _ell(d, cx + k * n * .06, hy - n * .098, n * .009, n * .009, "#f0d070")
        for sx in (-1, 1):
            d.polygon([(cx + sx * n * .168, hy - n * .085), (cx + sx * n * .118, hy - n * .085), (cx + sx * n * .106, hy + n * .07),
                       (cx + sx * n * .13, hy + n * .13), (cx + sx * n * .172, hy + n * .03)], fill=steel, outline=steeld)
            _ell(d, cx + sx * n * .14, hy + n * .02, n * .01, n * .01, brass)
    elif c["head"] == "laurel":   # victor's wreath of leaves around the head
        lc, lc2 = "#5a7a2a", "#2e4414"
        for k in range(15):
            a_ = math.pi * (1.0 + k / 14)
            px, py = cx + n * .155 * math.cos(a_), hy - n * .06 + n * .13 * math.sin(a_)
            ang = math.degrees(a_) + 90
            lw, lh = n * .034, n * .016
            pts = [(px + lw * math.cos(math.radians(ang)) * s_ - lh * math.sin(math.radians(ang)) * u_,
                    py + lw * math.sin(math.radians(ang)) * s_ + lh * math.cos(math.radians(ang)) * u_)
                   for s_, u_ in ((-1, 0), (0, 1), (1, 0), (0, -1))]
            d.polygon(pts, fill=lc if k % 2 else "#6e9034", outline=lc2)
        for sx in (-1, 1): d.line([cx + sx * n * .15, hy - n * .05, cx + sx * n * .19, hy + n * .08], fill="#b3202a", width=int(n * .012))
    elif c["head"] == "turban":
        tc, tc2 = "#efe6d2", "#cfc3a8"
        d.ellipse([cx - n * .19, hy - n * .3, cx + n * .19, hy - n * .02], fill=tc)
        for k in range(4):
            yk = hy - n * (.25 - k * .055)
            d.arc([cx - n * .19, yk - n * .06, cx + n * .19, yk + n * .06], 200, 340, fill=tc2, width=int(n * .012))
        _ell(d, cx, hy - n * .14, n * .03, n * .03, "#2a8f4a" if who == "saladin" else "#b3202a", "#d9a830", 4)
    elif c["head"] == "hat":   # Elizabethan tall felt hat with band + feather
        hc_ = "#1e1a18"
        d.ellipse([cx - n * .24, hy - n * .17, cx + n * .24, hy - n * .09], fill=hc_)
        d.polygon([(cx - n * .15, hy - n * .14), (cx - n * .12, hy - n * .36), (cx + n * .12, hy - n * .36), (cx + n * .15, hy - n * .14)], fill=hc_)
        d.ellipse([cx - n * .12, hy - n * .39, cx + n * .12, hy - n * .33], fill="#2a2420")
        d.rectangle([cx - n * .145, hy - n * .2, cx + n * .145, hy - n * .165], fill=c["trim"])
        d.line([cx + n * .1, hy - n * .19, cx + n * .2, hy - n * .38, cx + n * .26, hy - n * .4], fill="#efe9dc", width=int(n * .025))
    elif c["head"] == "roach":   # shaved sides, crest of hair, one feather
        d.rounded_rectangle([cx - n * .035, hy - n * .25, cx + n * .035, hy - n * .135], int(n * .03), fill=c["hair"])
        for k in range(7):
            d.line([cx - n * .03 + k * n * .01, hy - n * .25, cx - n * .04 + k * n * .013, hy - n * .29], fill=c["hair"], width=int(n * .01))
        d.polygon([(cx + n * .02, hy - n * .22), (cx + n * .09, hy - n * .4), (cx + n * .11, hy - n * .39), (cx + n * .04, hy - n * .21)], fill="#e8dcc0", outline="#3a2410")
        d.line([cx + n * .03, hy - n * .215, cx + n * .1, hy - n * .395], fill="#3a2410", width=2)
    elif c["head"] == "cap":   # linen coif
        d.chord([cx - n * .17, hy - n * .22, cx + n * .17, hy + n * .1], 180, 360, fill="#efe9dc", outline="#b0a694", width=3)
        d.rectangle([cx - n * .17, hy - n * .06, cx - n * .135, hy + n * .12], fill="#efe9dc")
        d.rectangle([cx + n * .135, hy - n * .06, cx + n * .17, hy + n * .12], fill="#efe9dc")
        d.chord([cx - n * .14, hy - n * .19, cx + n * .14, hy - n * .02], 180, 360, fill=c["hair"])
    elif c["head"] == "capbonnet":   # flat Tudor cap
        d.ellipse([cx - n * .21, hy - n * .25, cx + n * .21, hy - n * .1], fill="#1e1a18")
        d.ellipse([cx - n * .16, hy - n * .28, cx + n * .16, hy - n * .15], fill="#2a2420")
        _ell(d, cx + n * .1, hy - n * .2, n * .02, n * .02, c["trim"])
    elif c["head"] == "morion":   # crested Spanish-style helmet
        steel, steeld = "#9aa3a8", "#5d666b"
        d.ellipse([cx - n * .26, hy - n * .15, cx + n * .26, hy - n * .07], fill=steeld)
        d.chord([cx - n * .16, hy - n * .32, cx + n * .16, hy - n * .02], 180, 360, fill=steel)
        d.polygon([(cx - n * .08, hy - n * .3), (cx, hy - n * .4), (cx + n * .08, hy - n * .3)], fill=steeld)
    elif c["head"] == "crown_small":
        top = hy - n * .25
        d.rectangle([cx - n * .07, top + n * .04, cx + n * .07, top + n * .07], fill="#d9a830")
        for k in (-1, 0, 1):
            px = cx + k * n * .045
            d.polygon([(px - n * .02, top + n * .045), (px, top - n * .01), (px + n * .02, top + n * .045)], fill="#e8bb40")
            _ell(d, px, top, n * .01, n * .01, "#f4f0e6")
    elif c["head"] == "mitre":
        d.polygon([(cx - n * .14, hy - n * .07), (cx - n * .11, hy - n * .3), (cx, hy - n * .38), (cx + n * .11, hy - n * .3), (cx + n * .14, hy - n * .07)], fill="#efe6d2", outline="#d9a830")
        d.rectangle([cx - n * .015, hy - n * .36, cx + n * .015, hy - n * .07], fill="#d9a830")
        d.rectangle([cx - n * .14, hy - n * .2, cx + n * .14, hy - n * .17], fill="#d9a830")
    elif c["head"] == "coif":
        steel, steeld = "#8e979c", "#5d666b"
        d.chord([cx - n * .175, hy - n * .25, cx + n * .175, hy + n * .12], 180, 360, fill=steel)
        d.rectangle([cx - n * .175, hy - n * .07, cx - n * .12, hy + n * .2], fill=steel)
        d.rectangle([cx + n * .12, hy - n * .07, cx + n * .175, hy + n * .2], fill=steel)
        for yy_ in range(int(hy - n * .22), int(hy + n * .2), int(n * .03)):
            if yy_ < hy - n * .08: d.line([cx - n * .15, yy_, cx + n * .15, yy_], fill=steeld, width=2)
            else:
                d.line([cx - n * .17, yy_, cx - n * .125, yy_], fill=steeld, width=2); d.line([cx + n * .125, yy_, cx + n * .17, yy_], fill=steeld, width=2)
        _ell(d, cx, hy - n * .015, n * .135, n * .17 * .55, skin) if False else None
        d.rectangle([cx - n * .135, hy - n * .08, cx + n * .135, hy - n * .06], fill=steeld)
    elif c["head"] == "helmet":
        steel, steeld = "#9aa3a8", "#5d666b"
        d.polygon([(cx - n * .155, hy - n * .04), (cx, hy - n * .3), (cx + n * .155, hy - n * .04)], fill=steel)
        d.polygon([(cx, hy - n * .3), (cx + n * .155, hy - n * .04), (cx + n * .04, hy - n * .04)], fill=steeld)
        d.rectangle([cx - n * .16, hy - n * .075, cx + n * .16, hy - n * .035], fill="#7b5a2a")
        for k in range(-3, 4): _ell(d, cx + k * n * .045, hy - n * .055, n * .008, n * .008, "#e0c070")
        d.rectangle([cx - n * .016, hy - n * .04, cx + n * .016, hy + n * .07], fill=steel)
    elif c["head"] in ("crown", "crown_low"):
        top = hy - (n * .2 if c["head"] == "crown" else n * .16)
        band = top + n * .06
        d.rectangle([cx - n * .15, band, cx + n * .15, band + n * .05], fill="#d9a830")
        for k in (-2, -1, 0, 1, 2):
            px = cx + k * n * .07
            d.polygon([(px - n * .03, band + 2), (px, top - (n * .03 if k == 0 else 0)), (px + n * .03, band + 2)], fill="#e8bb40")
            _ell(d, px, top - (n * .03 if k == 0 else 0), n * .012, n * .012, "#f5d77a")
        for k in (-1, 0, 1): _ell(d, cx + k * n * .08, band + n * .025, n * .012, n * .012, ["#b3202a", "#2a6db3", "#2a8f4a"][k + 1])
    em = c.get("emblem")
    if em == "templar":
        ex, ey, r = cx - n * .2, n * .9, n * .06
        d.polygon([(ex - r * .3, ey - r), (ex + r * .3, ey - r), (ex + r * .15, ey - r * .15), (ex + r, ey - r * .3), (ex + r, ey + r * .3), (ex + r * .15, ey + r * .15), (ex + r * .3, ey + r), (ex - r * .3, ey + r), (ex - r * .15, ey + r * .15), (ex - r, ey + r * .3), (ex - r, ey - r * .3), (ex - r * .15, ey - r * .15)], fill="#b3202a")
    elif em == "jerusalem":
        ex, ey, r = cx - n * .2, n * .9, n * .055
        for (ox, oy, rr) in ((0, 0, 1), (-1.5, -1.5, .4), (1.5, -1.5, .4), (-1.5, 1.5, .4), (1.5, 1.5, .4)):
            x0, y0, q = ex + ox * r, ey + oy * r, r * rr
            d.rectangle([x0 - q, y0 - q * .25, x0 + q, y0 + q * .25], fill="#d9a830"); d.rectangle([x0 - q * .25, y0 - q, x0 + q * .25, y0 + q], fill="#d9a830")
    # circle mask + rings
    mask = Image.new("L", (n, n), 0); ImageDraw.Draw(mask).ellipse([n * .02, n * .02, n * .98, n * .98], fill=255)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0)); out.paste(img, (0, 0), mask)
    d = ImageDraw.Draw(out)
    d.ellipse([n * .02, n * .02, n * .98, n * .98], outline="#3a2410", width=int(n * .04))
    d.ellipse([n * .035, n * .035, n * .965, n * .965], outline="#d9b25a", width=int(n * .018))
    out = out.resize((size, size), Image.LANCZOS)
    if grey:
        a = np.array(out); g = a[..., :3].mean(-1, keepdims=True) * .6
        a[..., :3] = np.repeat(g, 3, -1).astype(np.uint8); out = Image.fromarray(a)
    # drop shadow
    sh = Image.new("RGBA", (size + 60, size + 60), (0, 0, 0, 0))
    m2 = Image.new("L", (size + 60, size + 60), 0); ImageDraw.Draw(m2).ellipse([30, 42, size + 30, size + 42], fill=170)
    sh.putalpha(m2.filter(ImageFilter.GaussianBlur(16)))
    sh.alpha_composite(out, (30, 30))
    return pil_sprite(sh)

@functools.lru_cache(None)
def name_plate(title, sub=None, w=520, color="#f3e2b5"):
    h = 120 if sub else 80
    img = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, w + 20, h + 20], 10, fill=(28, 18, 10, 235), outline=(214, 170, 80, 255), width=3)
    out = pil_sprite(img)
    return out

# ---------------- longship ----------------
@functools.lru_cache(None)
def longship(width=520, silhouette=False, sail=("#a31d1d", "#efe2c4"), seed=0):
    n = width * S; h = int(n * .75)
    img = Image.new("RGBA", (n, h), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    base_y = h * .78
    hull = "#4a2c16" if not silhouette else "#0b1018"
    hull2 = "#6b4122" if not silhouette else "#111823"
    # hull curve
    pts = []
    for i in range(41):
        x = n * (.08 + .84 * i / 40); u = (i / 40 - .5) * 2
        pts.append((x, base_y - n * .06 * u ** 4 - n * .01))
    bottom = [(n * .92, base_y - n * .06), (n * .78, base_y + n * .05), (n * .22, base_y + n * .05), (n * .08, base_y - n * .06)]
    d.polygon(pts + bottom, fill=hull)
    d.line(pts, fill=hull2, width=int(n * .012))
    # prow & stern curls
    d.line([(n * .92, base_y - n * .06), (n * .96, base_y - n * .16), (n * .955, base_y - n * .22)], fill=hull, width=int(n * .022))
    _ell(d, n * .945, base_y - n * .225, n * .018, n * .018, hull)
    d.line([(n * .08, base_y - n * .06), (n * .04, base_y - n * .16), (n * .05, base_y - n * .21)], fill=hull, width=int(n * .022))
    # shields
    rng = np.random.default_rng(seed)
    cols = ["#b5302a", "#e8d9b0", "#2b4e7a", "#d4a640", "#1f1f1f"]
    for i in range(12):
        x = n * (.2 + .6 * i / 11)
        col = "#151c26" if silhouette else cols[rng.integers(0, len(cols))]
        _ell(d, x, base_y - n * .02, n * .026, n * .026, col, outline="#20140a" if not silhouette else "#0b1018", width=3)
        if not silhouette: _ell(d, x, base_y - n * .02, n * .007, n * .007, "#c9c9c9")
    # mast & sail
    mx = n * .5
    d.line([(mx, base_y - n * .02), (mx, base_y - n * .5)], fill=hull, width=int(n * .012))
    sx0, sx1, sy0, sy1 = n * .32, n * .68, base_y - n * .47, base_y - n * .14
    stripes = 6
    for k in range(stripes):
        a = sx0 + (sx1 - sx0) * k / stripes; b = sx0 + (sx1 - sx0) * (k + 1) / stripes
        col = (sail[k % 2] if not silhouette else ("#121a26" if k % 2 else "#18222f"))
        d.polygon([(a, sy0), (b, sy0), (b + n * .01, sy1 + n * .02), (a + n * .01, sy1 + n * .02)], fill=col)
    d.line([(sx0 - n * .02, sy0), (sx1 + n * .02, sy0)], fill=hull, width=int(n * .01))
    img = img.resize((width, h // S), Image.LANCZOS)
    return pil_sprite(img)

@functools.lru_cache(None)
def ship_icon(size=46, color="#7a1d1d"):
    n = size * 4; img = Image.new("RGBA", (n, n), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.polygon([(n * .05, n * .6), (n * .95, n * .6), (n * .78, n * .82), (n * .22, n * .82)], fill="#2a180c")
    d.line([(n * .5, n * .62), (n * .5, n * .12)], fill="#2a180c", width=int(n * .06))
    d.polygon([(n * .26, n * .15), (n * .74, n * .15), (n * .76, n * .55), (n * .24, n * .55)], fill=color, outline="#2a180c", width=int(n * .04))
    d.line([(n * .5, n * .15), (n * .5, n * .55)], fill="#efe2c4", width=int(n * .1))
    return pil_sprite(img.resize((size, size), Image.LANCZOS))

# ---------------- icons ----------------
@functools.lru_cache(None)
def icon(kind, size=200, color="#d9b25a"):
    n = size * S; img = Image.new("RGBA", (n, n), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    if kind == "crown":
        d.polygon([(n * .12, n * .72), (n * .12, n * .32), (n * .32, n * .52), (n * .5, n * .2), (n * .68, n * .52), (n * .88, n * .32), (n * .88, n * .72)], fill=color, outline="#3a2410", width=int(n * .025))
        d.rectangle([n * .12, n * .72, n * .88, n * .84], fill=color, outline="#3a2410", width=int(n * .025))
        for k, col in enumerate(["#b3202a", "#2a6db3", "#b3202a"]): _ell(d, n * (.3 + .2 * k), n * .78, n * .035, n * .035, col)
        for x, y in ((.12, .32), (.5, .2), (.88, .32)): _ell(d, n * x, n * y, n * .045, n * .045, "#f5d77a", "#3a2410", 4)
    elif kind == "mail":
        d.polygon([(n * .3, n * .12), (n * .7, n * .12), (n * .92, n * .3), (n * .82, n * .42), (n * .74, n * .36), (n * .74, n * .88), (n * .26, n * .88), (n * .26, n * .36), (n * .18, n * .42), (n * .08, n * .3)], fill="#8e979c", outline="#2b3033", width=int(n * .025))
        for yy in range(int(n * .2), int(n * .86), int(n * .045)):
            for xx in range(int(n * .3), int(n * .72), int(n * .045)):
                d.arc([xx, yy, xx + n * .04, yy + n * .04], 0, 180, fill="#5d666b", width=3)
        _ell(d, n * .5, n * .15, n * .1, n * .05, "#3a3f42")
    elif kind == "swords":
        for sgn in (-1, 1):
            a, b = (n * .5 - sgn * n * .36, n * .86), (n * .5 + sgn * n * .3, n * .14)
            d.line([a, b], fill="#c9d0d4", width=int(n * .06))
            d.line([a, b], fill="#2b3033", width=int(n * .012))
            hx, hy = a[0] + (b[0] - a[0]) * .18, a[1] + (b[1] - a[1]) * .18
            d.line([(hx - n * .1, hy - sgn * n * .08 * 0 - n * .06), (hx + n * .1, hy + n * .06)], fill=color, width=int(n * .05))
            _ell(d, a[0], a[1], n * .035, n * .035, color)
    elif kind == "skull":
        _ell(d, n * .5, n * .42, n * .3, n * .28, "#e9e1cc", "#3a2410", 5)
        d.rectangle([n * .34, n * .58, n * .66, n * .8], fill="#e9e1cc", outline="#3a2410", width=5)
        for sx in (-1, 1): _ell(d, n * .5 + sx * n * .12, n * .45, n * .07, n * .08, "#2a1a10")
        d.polygon([(n * .5, n * .53), (n * .46, n * .62), (n * .54, n * .62)], fill="#2a1a10")
    elif kind == "raven":  # Landwaster banner
        d.rectangle([n * .1, n * .05, n * .14, n * .95], fill="#3a2410")
        d.polygon([(n * .14, n * .08), (n * .9, n * .08), (n * .78, n * .3), (n * .9, n * .52), (n * .14, n * .52)], fill="#e8dcc0", outline="#3a2410", width=5)
        d.polygon([(n * .3, n * .36), (n * .5, n * .2), (n * .62, n * .22), (n * .7, n * .16), (n * .66, n * .27), (n * .56, n * .34), (n * .64, n * .44), (n * .42, n * .4)], fill="#111")
    elif kind == "handshake":
        d.rounded_rectangle([n * .08, n * .38, n * .55, n * .62], 30, fill="#8e1b1b", outline="#2a1a10", width=5)
        d.rounded_rectangle([n * .45, n * .38, n * .92, n * .62], 30, fill="#2f5e2a", outline="#2a1a10", width=5)
        _ell(d, n * .5, n * .5, n * .13, n * .11, "#e3b48e", "#2a1a10", 5)
    elif kind == "truecross":
        g = "#e2b640"
        d.rectangle([n * .44, n * .06, n * .56, n * .92], fill=g, outline="#3a2410", width=5)
        d.rectangle([n * .18, n * .24, n * .82, n * .36], fill=g, outline="#3a2410", width=5)
        d.rectangle([n * .26, n * .5, n * .74, n * .58], fill=g, outline="#3a2410", width=5)
        d.rectangle([n * .48, n * .14, n * .52, n * .84], fill="#6b4122")
        for x, y in ((.5, .06), (.18, .3), (.82, .3), (.26, .54), (.74, .54), (.5, .92)): _ell(d, n * x, n * y, n * .035, n * .035, "#b3202a", "#3a2410", 3)
    elif kind == "camel":
        col = "#2a1a10"
        d.ellipse([n * .3, n * .3, n * .72, n * .58], fill=col)          # body
        d.ellipse([n * .4, n * .18, n * .58, n * .4], fill=col)           # hump
        d.polygon([(n * .66, n * .4), (n * .78, n * .14), (n * .84, n * .14), (n * .74, n * .46)], fill=col)  # neck
        d.ellipse([n * .76, n * .08, n * .94, n * .18], fill=col)         # head
        for x0, x1 in ((.34, .28), (.4, .44), (.62, .58), (.68, .74)):
            d.line([(n * x0, n * .54), (n * x1, n * .92)], fill=col, width=int(n * .035))
        d.line([(n * .3, n * .4), (n * .2, n * .55)], fill=col, width=int(n * .02))
        d.polygon([(n * .44, n * .2), (n * .52, n * .2), (n * .5, n * .06), (n * .46, n * .06)], fill="#efe6d2")  # rider
        _ell(d, n * .48, n * .05, n * .04, n * .035, "#efe6d2")
    elif kind == "castle":
        col, dk = "#c9b48a", "#3a2410"
        d.rectangle([n * .15, n * .4, n * .85, n * .9], fill=col, outline=dk, width=6)
        for x in (.15, .73):
            d.rectangle([n * x, n * .22, n * (x + .12), n * .9], fill=col, outline=dk, width=6)
            for k in range(3): d.rectangle([n * (x + k * .045), n * .16, n * (x + k * .045 + .03), n * .22], fill=col, outline=dk, width=4)
        for k in range(7): d.rectangle([n * (.28 + k * .065), n * .34, n * (.28 + k * .065 + .035), n * .4], fill=col, outline=dk, width=4)
        d.chord([n * .42, n * .62, n * .58, n * .9], 180, 360, fill=dk); d.rectangle([n * .42, n * .76, n * .58, n * .9], fill=dk)
    elif kind == "monastery":
        col, dk = "#d9c9a0", "#3a2410"
        d.rectangle([n * .2, n * .5, n * .8, n * .9], fill=col, outline=dk, width=6)
        d.polygon([(n * .14, n * .52), (n * .5, n * .26), (n * .86, n * .52)], fill="#8e3a22", outline=dk, width=6)
        d.rectangle([n * .48, n * .06, n * .52, n * .26], fill=dk); d.rectangle([n * .42, n * .11, n * .58, n * .15], fill=dk)
        d.chord([n * .42, n * .64, n * .58, n * .9], 180, 360, fill=dk); d.rectangle([n * .42, n * .77, n * .58, n * .9], fill=dk)
    elif kind == "hand":
        sk = "#e9c6a6"
        d.rounded_rectangle([n * .3, n * .4, n * .7, n * .86], 40, fill=sk, outline="#3a2410", width=5)
        for k, (x, h_) in enumerate(((.3, .2), (.4, .1), (.5, .08), (.6, .14))):
            d.rounded_rectangle([n * x, n * h_, n * (x + .09), n * .5], 25, fill=sk, outline="#3a2410", width=5)
        d.rounded_rectangle([n * .62, n * .5, n * .86, n * .6], 25, fill=sk, outline="#3a2410", width=5)
        for k in range(5): d.line([(n * .3, n * (.5 + k * .07)), (n * .7, n * (.46 + k * .07))], fill="#e8e2d4", width=int(n * .03))
    elif kind == "arrow_hit":
        d.line([(n * .1, n * .9), (n * .75, n * .25)], fill="#5a3a1e", width=int(n * .03))
        d.polygon([(n * .9, n * .1), (n * .7, n * .2), (n * .8, n * .3)], fill="#9aa3a8", outline="#2b3033")
        for k in range(3):
            d.polygon([(n * (.12 + k * .05), n * (.88 - k * .05)), (n * (.05 + k * .05), n * (.8 - k * .05)), (n * (.2 + k * .05), n * (.82 - k * .05))], fill="#d9c9a0")
    img = img.resize((size, size), Image.LANCZOS)
    return pil_sprite(img)

# ---------------- army units ----------------
NORSE = (150, 32, 36); ENG = (35, 64, 118); FRANK = (165, 30, 34); TEMPLAR = (232, 226, 210); AYY = (38, 96, 66); DARK = (28, 16, 8)
def unit(dst, x, y, w=120, h=46, color=NORSE, angle=0, alpha=1.0, label=None):
    rect = ((x, y), (w, h), angle)
    box = cv2.boxPoints(rect)
    if alpha < 1:
        ov = dst.copy()
        cv2.fillPoly(ov, [(box * 16).astype(np.int32)], color, cv2.LINE_AA, 4)
        cv2.polylines(ov, [(box * 16).astype(np.int32)], True, DARK, 4, cv2.LINE_AA, 4)
        x0, y0 = int(box[:, 0].min()) - 6, int(box[:, 1].min()) - 6
        x1, y1 = int(box[:, 0].max()) + 6, int(box[:, 1].max()) + 6
        x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(dst.shape[1], x1), min(dst.shape[0], y1)
        if x1 > x0 and y1 > y0:
            cv2.addWeighted(ov[y0:y1, x0:x1], alpha, dst[y0:y1, x0:x1], 1 - alpha, 0, dst[y0:y1, x0:x1])
        return
    cv2.fillPoly(dst, [(box * 16).astype(np.int32)], color, cv2.LINE_AA, 4)
    # inner hatch (soldier rows)
    lite = tuple(min(255, int(c * 1.35)) for c in color)
    for k in range(1, 4):
        p = box[0] + (box[1] - box[0]) * 0 + (box[3] - box[0]) * (k / 4)
        q = box[1] + (box[2] - box[1]) * (k / 4)
        q = p + (box[2] - box[1]) * 0 + (box[1] - box[0]) * 0 + (box[3] - box[0]) * 0
    pa, pb, pc, pd = box
    for k in range(1, 3):
        u = k / 3
        a = pa + (pd - pa) * u if np.linalg.norm(pd - pa) > np.linalg.norm(pb - pa) else pa + (pb - pa) * u
        b = pb + (pc - pb) * u if np.linalg.norm(pd - pa) > np.linalg.norm(pb - pa) else pd + (pc - pd) * u
        cv2.line(dst, (int(a[0] * 16), int(a[1] * 16)), (int(b[0] * 16), int(b[1] * 16)), lite, 2, cv2.LINE_AA, 4)
    cv2.polylines(dst, [(box * 16).astype(np.int32)], True, DARK, 4, cv2.LINE_AA, 4)

def shieldwall(dst, x0, y0, x1, y1, n, color=NORSE, t=0, alpha=1.0):
    for i in range(n):
        u = i / max(1, n - 1)
        x, y = x0 + (x1 - x0) * u, y0 + (y1 - y0) * u
        r = 13
        cv2.circle(dst, (int(x * 4), int(y * 4)), (r + 3) * 4, DARK, -1, cv2.LINE_AA, 2)
        cv2.circle(dst, (int(x * 4), int(y * 4)), r * 4, color if i % 2 else tuple(min(255, int(c * 1.3)) for c in color), -1, cv2.LINE_AA, 2)
        cv2.circle(dst, (int(x * 4), int(y * 4)), 4 * 4, (200, 200, 200), -1, cv2.LINE_AA, 2)

# ---------------- v4: Elizabethan ship (Roanoke 1587) ----------------
@functools.lru_cache(None)
def galleon(width=520, silhouette=False, seed=0, cross=True, sails=True):
    """three-masted Elizabethan ship, side view facing right. silhouette=True -> dark night shape."""
    n = width * S; hgt = int(n * 1.0)
    img = Image.new("RGBA", (n, hgt), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    dk = (14, 16, 24, 255) if silhouette else (52, 32, 18, 255)
    wood = (14, 16, 24, 255) if silhouette else (110, 70, 38, 255)
    wood2 = (14, 16, 24, 255) if silhouette else (150, 98, 52, 255)
    sail = (24, 28, 38, 255) if silhouette else (232, 220, 192, 255)
    wl = hgt * .8   # waterline
    hull = [(n * .04, wl - n * .16), (n * .2, wl - n * .12), (n * .78, wl - n * .1), (n * .95, wl - n * .16), (n * .86, wl), (n * .2, wl + n * .02)]
    d.polygon(hull, fill=wood, outline=dk)
    d.polygon([(n * .04, wl - n * .16), (n * .04, wl - n * .27), (n * .2, wl - n * .25), (n * .22, wl - n * .12)], fill=wood2, outline=dk)   # stern castle
    d.polygon([(n * .74, wl - n * .1), (n * .76, wl - n * .19), (n * .9, wl - n * .2), (n * .95, wl - n * .16)], fill=wood2, outline=dk)   # forecastle
    if not silhouette:
        for k in range(7):
            x = n * (.26 + k * .075); d.rectangle([x, wl - n * .075, x + n * .025, wl - n * .055], fill=(30, 18, 10, 255))
        d.line([(n * .06, wl - n * .13), (n * .93, wl - n * .13)], fill=(214, 170, 80, 255), width=max(2, n // 300))
    d.line([(n * .94, wl - n * .17), (n * 1.0, wl - n * .3)], fill=dk, width=max(3, n // 160))   # bowsprit
    masts = [(.3, .62), (.52, .78), (.74, .6)]
    for i, (mx, mh) in enumerate(masts):
        x = n * mx; top = wl - n * mh
        d.line([(x, wl - n * .1), (x, top)], fill=dk, width=max(4, n // 110))
        if sails:
            for j, (y0, y1, sw) in enumerate(((.18, .36, .17), (.4, .54, .13))):
                if mh < .62 and j == 1: continue
                ya, yb = wl - n * (mh - y0 + .02), wl - n * (mh - y1 + .02)
                ya, yb = top + n * (y0 - .1), top + n * (y1 - .1)
                bulge = n * .02 * (1 + .3 * math.sin(seed + i))
                d.polygon([(x - n * sw / 2, ya), (x + n * sw / 2, ya), (x + n * sw / 2 + bulge, yb), (x - n * sw / 2 + bulge, yb)], fill=sail, outline=dk)
                if cross and not silhouette and j == 0:
                    cxs, cys = x + bulge / 2, (ya + yb) / 2
                    d.rectangle([cxs - n * .012, ya + 4, cxs + n * .012, yb - 4], fill=(178, 32, 36, 255))
                    d.rectangle([x - n * sw / 2 + 4, cys - n * .012, x + n * sw / 2 + bulge - 4, cys + n * .012], fill=(178, 32, 36, 255))
        # pennant
        d.polygon([(x, top), (x + n * .07, top + n * .012), (x, top + n * .024)], fill=(178, 32, 36, 255) if not silhouette else dk)
    # rigging
    for (mx, mh) in masts:
        d.line([(n * mx, wl - n * mh), (n * .05, wl - n * .26)], fill=dk, width=max(1, n // 500))
        d.line([(n * mx, wl - n * mh), (n * .98, wl - n * .28)], fill=dk, width=max(1, n // 500))
    img = img.resize((width, int(hgt / S)), Image.LANCZOS)
    return pil_sprite(img)
