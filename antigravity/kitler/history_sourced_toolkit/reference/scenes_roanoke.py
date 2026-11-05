"""Roanoke 1587 — History Sourced: Unsolved #1. Each scene fn(t, S) -> RGB frame."""
import math, functools
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
from engine import *
from art import *

GOLD = "#f3d27a"; CREAM = "#f4e4bc"; INK = "#2a1a0c"; RED = "#c0392b"

# ======================================================= shared overlays
@functools.lru_cache(None)
def ribbon(textv, w=None):
    spr = text_sprite(textv, "cinzel", 40, CREAM, 700, shadow=False, spacing=4)
    tw = spr[0].shape[1]
    w = w or tw + 40; h = 84
    img = Image.new("RGBA", (w + 30, h), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.polygon([(0, 8), (w, 8), (w + 26, h / 2), (w, h - 8), (0, h - 8)], fill=(92, 22, 22, 240), outline=(214, 170, 80, 255))
    d.line([(0, 14), (w - 4, 14)], fill=(214, 170, 80, 160), width=2); d.line([(0, h - 14), (w - 4, h - 14)], fill=(214, 170, 80, 160), width=2)
    base = premult(np.array(img))
    return base, spr

def datestamp(f, s, t, t0, t1=1e9):
    a = window(t, t0, t1, .6, .6)
    if a <= 0: return
    (bg, tx) = ribbon(s)
    off = (1 - ease_out((t - t0) / .7)) * -bg[0].shape[1]
    blit(f, bg, off, H - 120, a, anchor="l")
    blit(f, tx, off + 10, H - 120, a, anchor="l")

def headline(f, s, t, t0, t1=1e9, y=H * .5, size=96, color=CREAM, grad=("#fff4d0", "#e0a640"), glow="#000000", sub=None, subsize=40):
    a = window(t, t0, t1, .35, .5)
    if a <= 0: return
    sc = .82 + .18 * back_out((t - t0) / .5)
    blit(f, text_sprite(s, "cinzel", size, color, 800, stroke=3, gradient=grad, glow=glow, spacing=6), W / 2, y, a, sc)
    if sub:
        a2 = window(t, t0 + .4, t1, .5, .5)
        blit(f, text_sprite(sub, "garamond", subsize, CREAM, 600, stroke=2, glow="#000000", spacing=2), W / 2, y + size * .85, a2)

def dim(f, a):
    if a > 0: f[:] = (f.astype(np.float32) * (1 - a)).astype(np.uint8)

def plate(f, title, sub, x, y, t, t0, t1=1e9, w=None):
    a = window(t, t0, t1, .4, .4)
    if a <= 0: return
    ts = text_sprite(title, "cinzel", 46, GOLD, 800, stroke=2, glow="#000000", spacing=3)
    blit(f, ts, x, y, a)
    if sub:
        blit(f, text_sprite(sub, "garamond", 34, CREAM, 500, stroke=2, glow="#000000", spacing=1), x, y + 50, window(t, t0 + .3, t1, .4, .4))

def show_portrait(f, who, x, y, t, t0, t1=1e9, size=420, grey=0.0, breathe=True):
    a = window(t, t0, t1, .35, .45)
    if a <= 0: return
    sc = back_out((t - t0) / .55) if t - t0 < .55 else 1.0
    sc *= 1 + (.012 * math.sin(t * 1.7) if breathe else 0)
    blit(f, portrait(who, size), x, y, a * (1 - grey), sc)
    if grey > 0: blit(f, portrait(who, size, True), x, y, a * grey, sc)

def crossmark(f, x, y, t, t0, r=150):
    p = prog(t, t0, .35)
    if p <= 0: return
    for k, (a, b) in enumerate((((-1, -1), (1, 1)), ((1, -1), (-1, 1)))):
        q = clamp(p * 2 - k)
        if q <= 0: continue
        p0 = np.array([x + a[0] * r, y + a[1] * r]); p1 = np.array([x + b[0] * r, y + b[1] * r])
        e = p0 + (p1 - p0) * q
        cv2.line(f, tuple((p0 * 16).astype(int)), tuple((e * 16).astype(int)), (20, 8, 4), 30, cv2.LINE_AA, 4)
        cv2.line(f, tuple((p0 * 16).astype(int)), tuple((e * 16).astype(int)), (200, 30, 30), 20, cv2.LINE_AA, 4)

def flash(f, t, t0, color=(255, 60, 40), d=.6, amt=.45):
    if t0 <= t < t0 + d:
        a = amt * (1 - (t - t0) / d)
        fill_alpha(f, color, a)

def counter(f, value, x, y, size=180, color=CREAM, grad=("#fff4d0", "#e0a640"), a=1.0, scale=1.0):
    blit(f, text_sprite(str(int(round(value))), "cinzel", size, color, 900, stroke=4, gradient=grad, glow="#000000"), x, y, a, scale)

# ======================================================= backgrounds
@functools.lru_cache(None)
def dark_parch():
    return parchment(W, H, 11, .55)
@functools.lru_cache(None)
def light_parch():
    return parchment(W, H, 4, 0.0)

def parch_bg(t, dark=True, z0=1.0, z1=1.06, D=20):
    src = dark_parch() if dark else light_parch()
    z = lerp(z0, z1, clamp(t / D))
    M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, z)
    return cv2.warpAffine(src, M, (W, H), borderMode=cv2.BORDER_REFLECT)

# ---------- night / dusk sea ----------
@functools.lru_cache(None)
def sky(kind):
    if kind == "storm": return storm_sky()
    yy = np.linspace(0, 1, H)[:, None, None]
    if kind == "night": top, hor = np.array([6, 10, 22]), np.array([34, 52, 78])
    elif kind == "dusk": top, hor = np.array([40, 12, 18]), np.array([236, 120, 52])
    else: top, hor = np.array([60, 70, 96]), np.array([228, 170, 120])  # dawn
    g = top * (1 - yy ** .8) + hor * (yy ** .8)
    img = np.repeat(g, W, 1).astype(np.float32)
    rng = np.random.default_rng(5)
    if kind == "night":
        for _ in range(500):
            x, y = rng.integers(0, W), rng.integers(0, int(H * .55)); b = rng.uniform(80, 255)
            cv2.circle(img, (int(x), int(y)), int(rng.choice([1, 1, 1, 2])), (b, b, b * .95), -1, cv2.LINE_AA)
        mx, my = 1450, 230
        glow = np.zeros((H, W), np.float32); cv2.circle(glow, (mx, my), 70, 1, -1)
        glow = cv2.GaussianBlur(glow, (0, 0), 90)[..., None]
        img += glow * np.array([140, 160, 190]) * 1.5
        cv2.circle(img, (mx, my), 62, (235, 232, 215), -1, cv2.LINE_AA)
        cv2.circle(img, (mx + 18, my - 10), 14, (215, 212, 196), -1, cv2.LINE_AA)
        cv2.circle(img, (mx - 20, my + 18), 9, (218, 214, 198), -1, cv2.LINE_AA)
    else:
        sx, sy = (1200, 520) if kind == "dusk" else (600, 560)
        glow = np.zeros((H, W), np.float32); cv2.circle(glow, (sx, sy), 100, 1, -1)
        glow = cv2.GaussianBlur(glow, (0, 0), 160)[..., None]
        img += glow * np.array([255, 170, 90]) * 1.4
        cv2.circle(img, (sx, sy), 90, (255, 236, 190), -1, cv2.LINE_AA)
    return np.clip(img, 0, 255).astype(np.uint8)

WAVE_COLS = {"night": [(34, 52, 74), (25, 39, 58), (17, 28, 44), (10, 17, 29)],
             "dusk": [(90, 40, 40), (70, 30, 34), (52, 22, 28), (34, 14, 20)],
             "storm": [(44, 58, 70), (33, 45, 56), (23, 32, 42), (14, 20, 28)],
             "dawn": [(70, 80, 100), (54, 62, 82), (40, 46, 64), (26, 30, 44)]}

def wave_layer(f, t, k, base_y, col, amp, speed, seed):
    xs = np.arange(-20, W + 40, 16, dtype=np.float32)
    y = base_y + amp * np.sin(xs / (180 + 40 * k) + t * speed + seed) + amp * .5 * np.sin(xs / 67 + t * speed * 1.7 + seed * 2)
    pts = np.vstack([np.stack([xs, y], 1), [[W + 40, H + 10], [-20, H + 10]]])
    cv2.fillPoly(f, [(pts * 8).astype(np.int32)], col, cv2.LINE_AA, 3)
    # crest highlight
    cv2.polylines(f, [(np.stack([xs, y], 1) * 8).astype(np.int32)], False, tuple(min(255, int(c * 1.6) + 10) for c in col), 2, cv2.LINE_AA, 3)
    return y

def wave_y(x, t, k, base_y, amp, speed, seed):
    return base_y + amp * math.sin(x / (180 + 40 * k) + t * speed + seed) + amp * .5 * math.sin(x / 67 + t * speed * 1.7 + seed * 2)

from fx import *
from fx import _bark
# ======================================================= ROANOKE 1587 — palette & places
ENGC = (40, 62, 110)          # English colonists (blue)
NATC = (150, 84, 40)          # Algonquian peoples (ochre)
SPAIN = (170, 120, 30)        # Spain (gold)
BLOODC = (160, 30, 30)
LL = {"roanoke": (-75.67, 35.89), "croatoan": (-75.55, 35.27), "sitex": (-76.73, 36.03), "chesapeake": (-76.2, 37.2),
      "jamestown": (-76.78, 37.21), "london": (-0.12, 51.5), "plymouth": (-4.14, 50.37), "albemarle": (-76.45, 36.05),
      "dasamonquepeuc": (-75.78, 35.88), "england": (-1.5, 52.5)}

def night_tint(img, amt=.35):
    x = img.astype(np.float32)
    x = x * (1 - amt) + (x * np.array([.62, .72, .95], np.float32)) * amt
    return np.clip(x, 0, 255).astype(np.uint8)

@functools.lru_cache(None)
def ob_map():
    m = GeoMap(-76.15, 35.70, 2.8, res="10m", seed=41, sea="#2a3c46")
    for lab in [("ATLANTIC OCEAN", -75.15, 35.55, 56, "#3a2614", False, 12, True), ("ALBEMARLE SOUND", -76.3, 36.12, 40, "#3a2614", False, 8, True),
                ("PAMLICO SOUND", -76.0, 35.32, 44, "#3a2614", False, 8, True)]:
        m.label(*lab)
    m.img = night_tint(m.img, .3)
    return m

@functools.lru_cache(None)
def region_map():
    m = GeoMap(-76.35, 36.85, 6.0, res="10m", seed=43, sea="#2a3c46")
    for lab in [("CHESAPEAKE BAY", -76.12, 37.75, 40, "#3a2614", False, 6, True), ("ATLANTIC OCEAN", -74.6, 36.4, 54, "#3a2614", False, 12, True),
                ("VIRGINIA", -77.9, 37.6, 60), ("CAROLINA", -78.0, 35.9, 60)]:
        m.label(*lab)
    m.img = night_tint(m.img, .3)
    return m

@functools.lru_cache(None)
def atlantic_map():
    m = GeoMap(-38, 42, 95, res="50m", seed=45, sea="#2a3c46", relief=False)
    for lab in [("ATLANTIC OCEAN", -40, 38, 90, "#3a2614", False, 20, True), ("ENGLAND", -1.5, 53.6, 60), ("NORTH AMERICA", -88, 47, 80),
                ("SPAIN", -4, 40, 60), ("NEW SPAIN", -100, 24, 60)]:
        m.label(*lab)
    m.img = night_tint(m.img, .25)
    return m

@functools.lru_cache(None)
def channel_map():
    m = GeoMap(-2.5, 50.0, 18, res="50m", seed=47, sea="#2a3c46")
    for lab in [("ENGLAND", -1.5, 52.4, 70), ("FRANCE", 1.5, 47.8, 70), ("THE CHANNEL", -2.8, 49.9, 46, "#3a2614", False, 10, True)]:
        m.label(*lab)
    m.img = night_tint(m.img, .25)
    return m

@functools.lru_cache(None)
def britain_map():
    m = GeoMap(-3.0, 54.6, 15, res="50m", seed=49, sea="#2a3c46")
    for lab in [("BRITANNIA", -1.6, 52.6, 70), ("CALEDONIA", -4.4, 57.3, 66), ("NORTH SEA", 2.4, 56.0, 50, "#3a2614", False, 10, True)]:
        m.label(*lab)
    m.img = night_tint(m.img, .45)
    return m

def mview(mapf, t, keys):
    m = mapf(); c = cam_path(t, keys); return m, c, c.render(m.img)

def P(m, k): return m.proj(LL[k] if isinstance(k, str) else k)

def place(f, c, m, k, name, t, t0, side="r", color=BLOODC, size=40, r=12, pulse=False, a=1.0, ink="#f4e4bc"):
    x, y = c.pt(P(m, k))
    if a <= 0: return x, y
    marker(f, x, y, t0, t, color, r, pulse=pulse)
    p = prog(t, t0 + .1, .4) * a
    spr = text_sprite(name, "cinzel", size, ink, 800, stroke=2, stroke_color="#120804", glow="#000000", spacing=3)
    if side == "r": blit(f, spr, x + 24, y - 4, p, anchor="l")
    elif side == "l": blit(f, spr, x - 24, y - 4, p, anchor="r")
    elif side == "u": blit(f, spr, x, y - 44, p)
    else: blit(f, spr, x, y + 46, p)
    return x, y

def label_box(f, s, x, y, a, size=44, color=CREAM, anchor="c"):
    blit(f, text_sprite(s, "cinzel", size, color, 800, stroke=2, glow="#000000", spacing=3), x, y, a, anchor=anchor)

def small_note(f, s, x, y, a, size=36, color="#e8d8b8", anchor="c"):
    blit(f, text_sprite(s, "garamond", size, color, 600, stroke=2, glow="#000000", spacing=1), x, y, a, anchor=anchor)

def along(pts, p):
    Lf = polyline_len(pts); idx = min(len(pts) - 1, int(np.searchsorted(Lf, clamp(p) * Lf[-1])))
    return pts[idx]

def curve(a, b, bend=.15, n=60):
    mid = ((a[0] + b[0]) / 2 + (b[1] - a[1]) * bend, (a[1] + b[1]) / 2 - (b[0] - a[0]) * bend)
    return bezier(a, mid, b, n).astype(np.float32)

def fade_in(f, t, t0, d=.5):
    fi = prog(t, t0, d)
    if fi < 1: dim(f, 1 - fi)

def header(f, s, t, t0=0, t1=1e9, color=GOLD):
    a = window(t, t0, t1, .4, .4)
    if a <= 0: return
    ov = f.copy(); cv2.rectangle(ov, (0, 0), (W, 110), (10, 8, 6), -1); cv2.addWeighted(ov, .55 * a, f, 1 - .55 * a, 0, f)
    blit(f, text_sprite(s, "cinzel", 46, color, 800, stroke=2, glow="#000000", spacing=8), W / 2, 56, a)

# ======================================================= night coast / forest backdrop (parallax, fog)
@functools.lru_cache(None)
def treeline(k, seed):
    """one silhouette layer of pine forest (RGBA premult), wider than the frame for parallax."""
    w = W + 600; h = H
    img = np.zeros((h, w, 4), np.uint8)
    rng = np.random.default_rng(seed)
    base = [H * .56, H * .6, H * .66][k]
    col = [(26, 34, 48), (17, 23, 34), (8, 11, 17)][k]
    hh = [70, 120, 210][k]
    pts = [(0, h)]
    x = -20
    while x < w + 40:
        th = hh * rng.uniform(.6, 1.25); tw = th * rng.uniform(.28, .4)
        yb = base + rng.uniform(-8, 8)
        pts += [(x, yb), (x + tw * .5, yb - th), (x + tw, yb)]
        x += tw * rng.uniform(.55, .9)
    pts += [(w, h)]
    cv2.fillPoly(img, [(np.array(pts, np.float32) * 8).astype(np.int32)], col + (255,), cv2.LINE_AA, 3)
    cv2.rectangle(img, (0, int(base)), (w, h), col + (255,), -1)
    return premult(img)

def coast_scene(t, kind="night", pan=0.0, smoke_col=0.0, water=True, blend=None):
    f = sky(kind).copy()
    if blend is not None and blend[1] > 0: cv2.addWeighted(f, 1 - blend[1], sky(blend[0]), blend[1], 0, f)
    for k in range(3):
        blit(f, treeline(k, 11 + k), -60 - pan * (25 + 45 * k), 0, 1.0, anchor="tl")
        if k == 1 and smoke_col > 0: smoke_column(f, 1180 - pan * 70, H * .58, t, smoke_col)
    if water:
        cols = WAVE_COLS["night" if kind == "night" else "dawn"]
        for k, (by, amp, sp) in enumerate([(H * .78, 6, .5), (H * .86, 10, .7), (H * .95, 16, .9)]):
            wave_layer(f, t, k, by, tuple(int(c * .8) for c in cols[k + 1]), amp, sp, k * 1.7)
    return f

def smoke_column(f, x, y, t, a=1.0, h=520):
    """thin rising column of smoke (cheap: ~40 soft discs on one overlay)."""
    ov = f.copy(); rng = np.random.default_rng(3)
    for i in range(44):
        u = ((i / 44) + t * .05) % 1.0
        r = 8 + 60 * u
        xx = x + 50 * u * math.sin(u * 5 + t * .5) + rng.normal(0, 4) + 120 * u * u
        yy = y - h * u
        cv2.circle(ov, (int(xx), int(yy)), int(r), (110, 112, 120), -1, cv2.LINE_AA)
    cv2.addWeighted(ov, .28 * a, f, 1 - .28 * a, 0, f)

def sea_ships(t, kind="night", ships=((520, .62, 520, 0), (1260, .64, 380, 1)), blend=None, sil=None, toss=1.0, drift=0.0):
    f = sky(kind).copy()
    if blend is not None and blend[1] > 0: cv2.addWeighted(f, 1 - blend[1], sky(blend[0]), blend[1], 0, f)
    cols = WAVE_COLS[kind if kind in WAVE_COLS else "night"]
    sil = (kind == "night") if sil is None else sil
    params = [(H * .62, 8 * toss, .5), (H * .7, 12 * toss, .7), (H * .8, 18 * toss, .9), (H * .9, 26 * toss, 1.1)]
    for k, (by, amp, sp) in enumerate(params):
        wave_layer(f, t, k, by, cols[k], amp, sp, k * 1.3)
        for (x0, yy, wd, layer) in ships:
            if layer != k: continue
            x = x0 + drift * t
            yb = wave_y(x, t, k, params[k][0], amp, sp, k * 1.3)
            spr = galleon(wd, silhouette=sil, seed=layer)
            hh = spr[0].shape[0]
            blit(f, spr, x, yb - hh * .32, 1.0, 1.0, "c", 3 * toss * math.sin(t * 1.1 + x0))
    return f

def rowboat(f, x, y, t, s=1.0, ang=0.0, col=(20, 18, 22), men=4):
    ov = np.zeros((int(200 * s), int(360 * s), 4), np.uint8)
    w_, h_ = ov.shape[1], ov.shape[0]
    hull = np.array([[10, h_ * .55], [w_ - 10, h_ * .5], [w_ * .8, h_ * .85], [w_ * .2, h_ * .85]], np.float32)
    cv2.fillPoly(ov, [(hull * 8).astype(np.int32)], col + (255,), cv2.LINE_AA, 3)
    for k in range(men):
        mx = w_ * (.25 + k * .15); bob = 4 * s * math.sin(t * 3 + k)
        cv2.ellipse(ov, (int(mx), int(h_ * .45 + bob)), (int(14 * s), int(24 * s)), 0, 0, 360, col + (255,), -1, cv2.LINE_AA)
        cv2.circle(ov, (int(mx), int(h_ * .28 + bob)), int(11 * s), col + (255,), -1, cv2.LINE_AA)
        oa = math.sin(t * 2.4 + k * .3) * .5
        cv2.line(ov, (int(mx), int(h_ * .5)), (int(mx - 60 * s * math.cos(oa)), int(h_ * .9 + 10 * s * math.sin(oa))), col + (255,), max(2, int(4 * s)), cv2.LINE_AA)
    blit(f, premult(ov), x, y, 1.0, 1.0, "c", ang)

# ======================================================= people + small icons (procedural)
def person(f, x, y, h, col, a=1.0, kind="man"):
    """tiny standing figure; kind man|woman|child."""
    if a <= 0: return
    if kind == "child": h *= .62
    ov = f.copy()
    hr = h * .13
    cv2.circle(ov, (int(x), int(y - h + hr)), int(hr), (226, 196, 160), -1, cv2.LINE_AA)
    if kind == "woman":
        pts = np.array([[x - h * .08, y - h * .74], [x + h * .08, y - h * .74], [x + h * .2, y], [x - h * .2, y]], np.float32)
        cv2.fillPoly(ov, [(pts * 8).astype(np.int32)], col, cv2.LINE_AA, 3)
        cv2.ellipse(ov, (int(x), int(y - h + hr * .7)), (int(hr * 1.15), int(hr * .8)), 0, 180, 360, (236, 230, 216), -1, cv2.LINE_AA)
    else:
        cv2.rectangle(ov, (int(x - h * .1), int(y - h * .74)), (int(x + h * .1), int(y - h * .32)), col, -1)
        cv2.line(ov, (int(x - h * .05), int(y - h * .32)), (int(x - h * .06), int(y)), col, max(2, int(h * .07)), cv2.LINE_AA)
        cv2.line(ov, (int(x + h * .05), int(y - h * .32)), (int(x + h * .06), int(y)), col, max(2, int(h * .07)), cv2.LINE_AA)
        if kind == "man":
            cv2.ellipse(ov, (int(x), int(y - h + hr * .5)), (int(hr * 1.6), int(hr * .35)), 0, 0, 360, (24, 20, 18), -1, cv2.LINE_AA)
            cv2.rectangle(ov, (int(x - hr * .8), int(y - h - hr * .5)), (int(x + hr * .8), int(y - h + hr * .5)), (24, 20, 18), -1)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)

def crowd_grid(f, x0, y0, cols, rows, sp, h, t, t0, vanish=0.0, seed=0, col=ENGC):
    """grid of colonists (men/women/children by the 1587 ratio) appearing; vanish 0..1 removes them randomly."""
    rng = np.random.default_rng(seed); n = cols * rows
    order = rng.permutation(n); kinds = ["woman"] * 17 + ["child"] * 11 + ["man"] * (n - 28)
    kinds = [kinds[i] for i in rng.permutation(n)]
    for i in range(n):
        r_, c_ = divmod(i, cols)
        ap = prog(t, t0 + i * .012, .3)
        gone = clamp((vanish * n - order[i]) / 2.0)
        a = ap * (1 - gone)
        if a > 0: person(f, x0 + c_ * sp + (r_ % 2) * sp * .5 + 2.5 * math.sin(t * 1.3 + i * .9), y0 + r_ * sp * 1.3 - abs(2.0 * math.sin(t * 1.9 + i * 1.7)), h, col, a, kinds[i])

@functools.lru_cache(None)
def ico(kind, size=220):
    n = size * 2; img = Image.new("RGBA", (n, n), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    ink = (42, 26, 12, 255); wood = (150, 100, 56, 255); steel = (150, 158, 164, 255)
    if kind == "house":
        d.polygon([(n * .15, n * .5), (n * .5, n * .2), (n * .85, n * .5)], fill=(120, 96, 60, 255), outline=ink, width=8)
        d.rectangle([n * .22, n * .5, n * .78, n * .85], fill=(186, 150, 100, 255), outline=ink, width=8)
        d.rectangle([n * .44, n * .62, n * .56, n * .85], fill=ink)
    elif kind == "longhouse":
        d.chord([n * .08, n * .3, n * .92, n * 1.1], 180, 360, fill=(170, 140, 90, 255), outline=ink, width=8)
        for k in range(6): d.arc([n * (.1 + k * .0), n * (.32 + k * .07), n * .9, n * (1.08 - k * .0)], 190, 350, fill=(120, 96, 60, 255), width=4)
        d.rectangle([n * .45, n * .55, n * .55, n * .7], fill=ink)
    elif kind == "chest":
        d.rectangle([n * .15, n * .42, n * .85, n * .82], fill=wood, outline=ink, width=8)
        d.polygon([(n * .15, n * .42), (n * .3, n * .18), (n * .9, n * .1), (n * .85, n * .42)], fill=(120, 80, 44, 255), outline=ink, width=8)
        for x in (.3, .7): d.rectangle([n * (x - .03), n * .42, n * (x + .03), n * .82], fill=(80, 70, 60, 255))
        d.line([(n * .5, n * .5), (n * .58, n * .78)], fill=ink, width=6)
    elif kind == "cradle":
        d.chord([n * .12, n * .2, n * .88, n * .9], 0, 180, fill=wood, outline=ink, width=8)
        d.ellipse([n * .35, n * .36, n * .55, n * .56], fill=(232, 200, 170, 255), outline=ink, width=5)
        d.chord([n * .2, n * .45, n * .8, n * .75], 180, 360, fill=(236, 230, 216, 255), outline=ink, width=5)
        d.arc([n * .1, n * .7, n * .9, n * 1.0], 200, 340, fill=ink, width=10)
    elif kind == "hilt":
        d.line([(n * .5, n * .08), (n * .5, n * .55)], fill=steel, width=int(n * .05))
        d.arc([n * .28, n * .4, n * .72, n * .85], 180, 360, fill=(200, 160, 60, 255), width=int(n * .04))
        d.line([(n * .2, n * .62), (n * .8, n * .62)], fill=(200, 160, 60, 255), width=int(n * .045))
        d.rectangle([n * .46, n * .62, n * .54, n * .86], fill=(90, 56, 30, 255), outline=ink, width=4)
        _ell(d, n * .5, n * .9, n * .05, n * .05, (200, 160, 60, 255), ink, 4)
        d.line([(n * .5, n * .08), (n * .62, n * .02)], fill=(0, 0, 0, 0), width=1)
    elif kind == "gun":
        d.rectangle([n * .1, n * .4, n * .62, n * .48], fill=steel, outline=ink, width=5)
        d.polygon([(n * .55, n * .4), (n * .9, n * .44), (n * .92, n * .62), (n * .62, n * .52)], fill=wood, outline=ink, width=6)
        d.arc([n * .48, n * .44, n * .62, n * .62], 0, 180, fill=ink, width=6)
        d.rectangle([n * .5, n * .3, n * .56, n * .4], fill=steel, outline=ink, width=4)
    elif kind == "slate":
        d.rectangle([n * .18, n * .2, n * .82, n * .8], fill=(70, 78, 88, 255), outline=(120, 90, 56, 255), width=18)
        d.line([(n * .35, n * .62), (n * .38, n * .4), (n * .45, n * .55), (n * .52, n * .4), (n * .55, n * .62)], fill=(220, 220, 214, 255), width=6)
    elif kind == "pencil":
        d.polygon([(n * .15, n * .8), (n * .75, n * .2), (n * .85, n * .3), (n * .25, n * .9)], fill=(110, 116, 124, 255), outline=ink)
        d.polygon([(n * .15, n * .8), (n * .25, n * .9), (n * .08, n * .95)], fill=(60, 60, 64, 255))
    elif kind == "sherd":
        d.polygon([(n * .15, n * .4), (n * .45, n * .2), (n * .82, n * .3), (n * .78, n * .7), (n * .4, n * .8), (n * .2, n * .62)], fill=(176, 120, 60, 255), outline=ink, width=6)
        d.polygon([(n * .3, n * .38), (n * .7, n * .36), (n * .68, n * .6), (n * .35, n * .62)], fill=(214, 180, 70, 255))
    elif kind == "stone":
        d.polygon([(n * .12, n * .3), (n * .55, n * .15), (n * .88, n * .35), (n * .82, n * .82), (n * .2, n * .86)], fill=(130, 126, 118, 255), outline=ink, width=8)
        for k in range(4): d.line([(n * .28, n * (.4 + k * .1)), (n * (.7 - k * .03), n * (.38 + k * .1))], fill=(60, 56, 50, 255), width=5)
    elif kind == "trowel":
        d.polygon([(n * .5, n * .1), (n * .72, n * .45), (n * .5, n * .6), (n * .28, n * .45)], fill=steel, outline=ink, width=6)
        d.line([(n * .5, n * .6), (n * .5, n * .75)], fill=ink, width=10)
        d.rounded_rectangle([n * .44, n * .72, n * .56, n * .95], 10, fill=wood, outline=ink, width=4)
    elif kind == "barrel":
        d.rounded_rectangle([n * .25, n * .15, n * .75, n * .88], 60, fill=wood, outline=ink, width=8)
        for y in (.3, .7): d.line([(n * .25, n * y), (n * .75, n * y)], fill=(70, 66, 60, 255), width=12)
    elif kind == "eagle":
        d.line([(n * .5, n * .3), (n * .5, n * .95)], fill=(90, 60, 30, 255), width=14)
        d.polygon([(n * .5, n * .1), (n * .2, n * .2), (n * .32, n * .3), (n * .5, n * .26), (n * .68, n * .3), (n * .8, n * .2)], fill=(214, 170, 60, 255), outline=ink, width=5)
        d.rectangle([n * .32, n * .4, n * .68, n * .6], fill=(150, 30, 30, 255), outline=(214, 170, 60, 255), width=6)
    elif kind == "fort":
        d.polygon([(n * .5, n * .1), (n * .62, n * .38), (n * .9, n * .5), (n * .62, n * .62), (n * .5, n * .9), (n * .38, n * .62), (n * .1, n * .5), (n * .38, n * .38)], fill=(190, 40, 40, 255), outline=(40, 60, 140, 255), width=10)
    elif kind == "question":
        d.ellipse([n * .1, n * .1, n * .9, n * .9], fill=(140, 26, 26, 255), outline=(214, 170, 80, 255), width=10)
    img = img.resize((size, size), Image.LANCZOS)
    return pil_sprite(img)

def _ell(d, cx, cy, rx, ry, fill, outline=None, width=0):
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=fill, outline=outline, width=width)

def board_bg(t, S=None):
    """investigation board: dark cork texture + candle glow (cached)."""
    f = _board().copy()
    fl = .9 + .1 * math.sin(t * 7) * math.sin(t * 3.3)
    f[:] = (f.astype(np.float32) * fl).astype(np.uint8)
    return f

@functools.lru_cache(None)
def _board():
    n = fbm(H, W, 77, 7, 6)
    base = np.array([64, 44, 28], np.float32)
    img = base * (.7 + .5 * n[..., None])
    rng = np.random.default_rng(2)
    for _ in range(2500):
        x, y = rng.integers(0, W), rng.integers(0, H)
        cv2.circle(img, (int(x), int(y)), int(rng.integers(1, 3)), (36, 24, 14), -1)
    img *= vignette(.8)
    return np.clip(img, 0, 255).astype(np.uint8)

# ======================================================= SCENES
def s_cold_open(t, S):
    L = S.L
    if t < L[2] - .2:   # night: two ships off a dark island, smoke on shore
        pan = prog(t, L[1] - .5, 4.0, ease_io)
        if t < L[1] - .2:
            f = sea_ships(t, "night", ships=((560, .62, 520, 1), (1380, .64, 360, 0)), toss=.8)
            fog(f, t, .35, seed=4)
            datestamp(f, "18 AUGUST 1590", t, .4)
            a = window(t, .5, L[1] - .5, .8, .5)
            blit(f, text_sprite("OFF ROANOKE ISLAND", "cinzel", 70, CREAM, 800, stroke=3, glow="#000000", spacing=12), 800, 200, a, .96 + .04 * ease_out((t - .5) / 3))
            small_note(f, "the coast of North America", 800, 285, window(t, S.at(0, "on the coast") - .3, L[1] - .5), 44)
            return f
        f = coast_scene(t, "night", pan=pan * 2, smoke_col=prog(t, S.at(1, "smoke") - .6, 1.5))
        fog(f, t, .45, seed=6)
        label_box(f, "SMOKE", 1180 - pan * 140 + 230, H * .3, window(t, S.at(1, "smoke"), L[2] - .4), 52, GOLD)
        headline(f, "SOMEONE IS THERE", t, S.at(1, "Someone") - .1, L[2] - .4, y=H - 170, size=72)
        fade_in(f, t, L[1] - .2)
        return f
    if t < L[4] - .2:   # dawn: boat rows in, trumpet, songs, silence
        bl = prog(t, L[2] - .2, 4.0)
        f = coast_scene(t, "night", pan=2.0 + prog(t, L[2], 10) * .6, smoke_col=.0, blend=("dawn", bl * .7))
        fog(f, t, .4, seed=7)
        bx = lerp(1500, 1000, prog(t, L[2], L[3] - L[2] + 1, ease_out))
        rowboat(f, bx, H * .8 + 6 * math.sin(t * 2), t, .9, 2 * math.sin(t * 1.5))
        tt = S.at(2, "trumpet")
        if t > tt - .2:
            for k in range(3):
                ph = ((t - tt) * .6 + k / 3) % 1
                ov = f.copy(); cv2.ellipse(ov, (int(bx - 120), int(H * .74)), (int(60 + 260 * ph), int(30 + 120 * ph)), 0, 200, 340, (230, 220, 190), 3, cv2.LINE_AA)
                cv2.addWeighted(ov, (1 - ph) * .7 * (1 - prog(t, L[3] - .2, .4)), f, 1 - (1 - ph) * .7 * (1 - prog(t, L[3] - .2, .4)), 0, f)
        label_box(f, "A TRUMPET CALL", W / 2, 170, window(t, tt - .2, S.at(2, "sing") - .3), 56, GOLD)
        label_box(f, "ENGLISH SONGS", W / 2, 170, window(t, S.at(2, "sing") - .2, S.at(2, "call out") - .3), 56, GOLD)
        label_box(f, "NAMES CALLED OUT", W / 2, 170, window(t, S.at(2, "call out") - .2, L[3] - .3), 56, GOLD)
        live_portrait(f, "white", 190, 210, 260, t, window(t, L[2] + .3, L[3] - .4), talk="voice" if False else None)
        plate(f, "JOHN WHITE", "Governor", 190, 380, t, L[2] + .5, L[3] - .4)
        if t > L[3] - .3:
            dim(f, .45 * prog(t, L[3] - .3, .8))
            headline(f, "NO ONE ANSWERS.", t, L[3] - .1, L[4] - .3, y=H / 2, size=110, grad=("#f0f0f0", "#8aa0b8"))
        return f
    if t < L[6] - .25:  # 115 people -> gone
        f = parch_bg(t, True, 1.0, 1.05, 20); f = night_tint(f, .3)
        fog(f, t, .25, seed=8, low=False)
        van = prog(t, S.at(5, "Every one") - .2, 3.0, ease_io)
        crowd_grid(f, 330, 470, 23, 5, 56, 54, t, L[4] + .2, vanish=van, seed=3)
        v = 115 * ease_out((t - L[4] - .2) / 2.5) * (1 - van)
        counter(f, v, W / 2, 230, 150, a=prog(t, L[4], .4))
        small_note(f, "men, women and children", W / 2, 345, window(t, S.at(4, "men,") - .3, S.at(5, "Every") - .3), 44)
        show_portrait(f, "eleanor", W - 230, 230, t, S.at(4, "daughter") - .4, S.at(5, "Every") - .3, 260)
        plate(f, "ELEANOR DARE", "his daughter", W - 230, 410, t, S.at(4, "daughter") - .2, S.at(5, "Every") - .3)
        blit(f, ico("cradle", 170), 230, 250, window(t, S.at(4, "granddaughter") - .3, S.at(5, "Every") - .3))
        small_note(f, "his granddaughter", 230, 380, window(t, S.at(4, "granddaughter") - .2, S.at(5, "Every") - .3), 38)
        headline(f, "NO BODIES", t, S.at(5, "No bodies") - .1, S.at(5, "No graves") - .1, y=H - 160, size=90, grad=("#f0f0f0", "#8aa0b8"))
        headline(f, "NO GRAVES", t, S.at(5, "No graves") - .1, S.at(5, "Just one") - .1, y=H - 160, size=90, grad=("#f0f0f0", "#8aa0b8"))
        headline(f, "ONE WORD", t, S.at(5, "Just one") - .1, L[6] - .3, y=H - 160, size=90)
        return f
    if t < L[7] - .2:   # CROATOAN carved
        f = night_tint(parch_bg(t, True, 1.0, 1.04, 10), .2)
        dim(f, .3)
        carve(f, "CROATOAN", W / 2, H / 2, t, L[6] - .2, 1.3, 170, panel=(1500, 380), seed=2)
        f = shake(f, t, L[6] + .2, 10, .5)
        return f
    # promise: zoom out to an evidence board
    f = board_bg(t)
    z = 1 - .25 * prog(t, L[7] - .2, 3.0)
    blit(f, _carved_card(), W / 2, H / 2 - 40, 1.0, z)
    for k, kind in enumerate(("chest", "house", "cradle")):
        evidence_card(f, k + 1, ["CHESTS", "HOUSES", "VIRGINIA"][k], [360, W - 360, 360][k] if k < 2 else W - 360, [330, 330, 780][k] if k < 2 else 780,
                      t, L[7] + .6 + k * .5, 1e9, draw=lambda c, x, y, s, a, kd=kind: blit(c, ico(kd, 190), x, y, a), w=300, h=340, rot=[4, -5, 3][k])
    headline(f, "FOLLOW THE EVIDENCE", t, S.at(7, "follow") - .2, 1e9, y=H - 120, size=76)
    return f

@functools.lru_cache(None)
def _carved_card():
    f = np.zeros((420, 1100, 3), np.uint8)
    f[:] = _bark(1100, 420, 2, True)
    carve(f, "CROATOAN", 550, 210, 99, 0, 1, 130)
    a = np.ones((420, 1100, 1), np.float32)
    return (f.astype(np.float32) * .85, a)

def s_title(t, S):
    f = night_tint(parch_bg(t, True, 1.0, 1.08, 5), .35)
    fog(f, t, .3, seed=9)
    a = prog(t, .05, .6)
    sc = 1.12 - .12 * ease_out((t - .05) / 1.4)
    blit(f, text_sprite("HISTORY SOURCED: UNSOLVED", "cinzel", 40, GOLD, 800, stroke=2, glow="#000000", spacing=12), W / 2, 260, a)
    blit(f, text_sprite("ROANOKE", "cinzel", 210, CREAM, 900, stroke=4, gradient=("#f4f2ea", "#7f97b2"), glow="#2a4a7a", spacing=22), W / 2, 480, a, sc)
    p = prog(t, .5, .8)
    if p > 0: cv2.line(f, (int(W / 2 - 560 * p), 625), (int(W / 2 + 560 * p), 625), (214, 170, 80), 4, cv2.LINE_AA)
    blit(f, text_sprite("THE LOST COLONY  ·  1587 – 1590", "cinzel", 54, CREAM, 600, stroke=2, glow="#000000", spacing=6), W / 2, 700, prog(t, .8, .6))
    stamp(f, "UNSOLVED", W / 2 + 520, 880, t, 1.4, 84, rot=-9)
    blit(f, text_sprite("CASE 01", "cinzel", 34, "#c9b48a", 700, stroke=2, glow="#000000", spacing=10), W / 2 - 520, 880, prog(t, 1.2, .5))
    return shake(f, t, 1.45, 8, .3)

def s_dream(t, S):
    L = S.L
    if t < L[1] - .2:
        f = parch_bg(t, True, 1.0, 1.06, S.D)
        header(f, "1584 · A ROYAL CHARTER", t, .2, L[1] - .3)
        live_portrait(f, "elizabeth", 620, 520, 420, t, window(t, .3, L[1] - .3))
        plate(f, "ELIZABETH I", "Queen of England", 620, 790, t, S.at(0, "Elizabeth") - .3, L[1] - .3)
        live_portrait(f, "raleigh", W - 620, 520, 420, t, window(t, S.at(0, "Raleigh") - .4, L[1] - .3), seed=2)
        plate(f, "SIR WALTER RALEIGH", "courtier, adventurer", W - 620, 790, t, S.at(0, "Raleigh") - .2, L[1] - .3)
        a = window(t, S.at(0, "a base") - .2, L[1] - .3)
        if a > 0:
            dim(f, .35 * a)
            headline(f, "A BASE AGAINST SPAIN", t, S.at(0, "a base") - .2, L[1] - .3, y=985, size=70, grad=("#ffe9b0", "#d49a2a"))
        return f
    if t < L[2] - .2:
        m = atlantic_map()
        e = P(m, "plymouth"); o = P(m, "roanoke")
        tz = S.at(1, "barrier") - .5
        if t < tz:
            c = cam_path(t, [(L[1] - .2, ((e[0] + o[0]) / 2, (e[1] + o[1]) / 2 - 120, .5)), (tz, (o[0] + 300, o[1], .6))])
            f = c.render(m.img)
            r = curve(c.pt(e), c.pt(o), -.12, 80)
            pr = prog(t, L[1] + .2, 3.0, ease_io)
            arrow(f, r, pr, (214, 170, 80), 10, head=30, dashed=True)
            sx, sy = along(r, pr); blit(f, galleon(110), sx, sy - 30, prog(t, L[1], .4))
            place(f, c, m, "london", "LONDON", t, L[1] + .2, "l", (200, 160, 40), 36)
            fade_in(f, t, L[1] - .2)
        else:
            m2 = ob_map()
            c = cam_path(t, [(tz, (m2.BW * .62, m2.BH * .5, .55)), (L[2], (m2.BW * .66, m2.BH * .45, .7))])
            f = c.render(m2.img)
            label_box(f, "THE OUTER BANKS", W / 2 + 200, 150, prog(t, tz + .2, .5), 60, GOLD)
            small_note(f, "a chain of thin barrier islands", W / 2 + 200, 225, prog(t, tz + .5, .5), 40)
            locator(f, atlantic_map(), LL["roanoke"], t, x=60, y=H - 330, w=360, box_deg=6, label="NORTH AMERICA")
            fade_in(f, t, tz, .5)
        return f
    if t < L[3] - .2:
        f = parch_bg(t, True, 1.0, 1.06, S.D)
        header(f, "TWO MEN SAIL TO LONDON", t, L[2] - .1, L[3] - .3)
        live_portrait(f, "manteo", 640, 520, 400, t, window(t, S.at(2, "Manteo") - .4, L[3] - .3), seed=1)
        plate(f, "MANTEO", "from CROATOAN", 640, 780, t, S.at(2, "Manteo") - .2, L[3] - .3)
        live_portrait(f, "wanchese", W - 640, 520, 400, t, window(t, S.at(2, "Wanchese") - .4, L[3] - .3), seed=3)
        plate(f, "WANCHESE", "from ROANOKE", W - 640, 780, t, S.at(2, "Wanchese") - .2, L[3] - .3)
        return f
    m = ob_map()
    c = cam_path(t, [(L[3] - .2, (m.BW * .66, m.BH * .45, .7)), (L[3] + 3, (*P(m, "croatoan"), 1.15))])
    f = c.render(m.img)
    place(f, c, m, "roanoke", "ROANOKE", t, L[3], "r", ENGC, 40)
    x, y = place(f, c, m, "croatoan", "CROATOAN", t, L[3] + .8, "l", (200, 160, 40), 52, 16, pulse=True)
    live_portrait(f, "manteo", 260, 260, 270, t, window(t, L[3] + 1.0, 1e9), seed=1)
    headline(f, "REMEMBER THIS ISLAND", t, S.at(3, "It will") - .2, 1e9, y=H - 140, size=74)
    return f

def s_lane(t, S):
    L = S.L
    m = ob_map(); ro = P(m, "roanoke")
    if t < L[2] - .2:
        c = cam_path(t, [(0, (ro[0] + 200, ro[1], .7)), (L[1], (ro[0], ro[1], 1.4)), (L[2], (ro[0] - 100, ro[1] + 20, 1.6))])
        f = c.render(m.img)
        x, y = c.pt(ro)
        datestamp(f, "1585", t, .2, L[2] - .3)
        place(f, c, m, "roanoke", "ROANOKE ISLAND", t, .4, "r", ENGC, 40, a=1 - prog(t, S.at(0, "fort") - .5, .4))
        blit(f, icon("castle", int(110 * c.z)), x, y - 40 * c.z, prog(t, S.at(0, "fort") - .3, .4, back_out))
        for k in range(3):
            formation(f, x - 300 + k * 190, y + 120, 170, 70, (110, 116, 124), t * .4, kind="inf", flag=k == 1, flag_color=(232, 226, 210), emblem="cross", seed=40 + k, alpha=prog(t, S.at(0, "soldiers") - .3 + k * .2, .4))
        label_box(f, "≈ 100 SOLDIERS", x - 130, y + 220, window(t, S.at(0, "soldiers") - .2, L[1] - .3), 46, CREAM)
        live_portrait(f, "lane", 200, 220, 280, t, window(t, S.at(0, "Ralph") - .4, L[2] - .3), seed=4)
        plate(f, "RALPH LANE", "commander", 200, 400, t, S.at(0, "Ralph") - .2, L[2] - .3)
        if t > L[1] - .3:   # villages: food -> threats
            for k, ll in enumerate(((-75.78, 35.88), (-75.62, 36.0), (-75.95, 35.75))):
                vx, vy = c.pt(m.proj(ll))
                blit(f, ico("longhouse", 110), vx, vy, prog(t, L[1] + k * .3, .4))
                arrow(f, [(vx, vy - 20), ((vx + x) / 2, (vy + y) / 2 - 60), (x, y - 20)], prog(t, S.at(1, "food") - .2 + k * .2, .7), (214, 170, 80), 8, head=22)
                if t > S.at(1, "threats") - .3:
                    arrow(f, [(x, y + 10), ((vx + x) / 2, (vy + y) / 2 + 40), (vx, vy + 20)], prog(t, S.at(1, "threats") - .2 + k * .15, .5), BLOODC, 10, head=26)
            label_box(f, "FOOD", W / 2, H - 200, window(t, S.at(1, "food") - .2, S.at(1, "threats") - .3), 60, GOLD)
            label_box(f, "THREATS", W / 2, H - 200, window(t, S.at(1, "threats") - .2, L[2] - .3), 60, "#ffb0a0")
        return f
    if t < L[3] - .2:
        f = parch_bg(t, True, 1.0, 1.05, S.D)
        grade(f, red=.4 * prog(t, S.at(2, "kill") - .2, .6))
        datestamp(f, "JUNE 1586", t, L[2])
        g = prog(t, S.at(2, "kill"), 1.0)
        live_portrait(f, "wingina", W / 2, 470, 440, t, window(t, L[2] - .1, L[3] - .3), grey=g > .5, seed=5)
        plate(f, "WINGINA", "chief of the Roanoke", W / 2, 750, t, S.at(2, "Wingina") - .3, L[3] - .3)
        crossmark(f, W / 2, 470, t, S.at(2, "kill"), 170)
        flash(f, t, S.at(2, "kill"), amt=.35)
        return shake(f, t, S.at(2, "kill"), 9, .4)
    if t < L[4] - .2:
        f = sea_ships(t - L[3], "dusk", ships=((100, .6, 260, 0), (500, .6, 300, 1), (900, .6, 280, 0), (1300, .6, 340, 1)), drift=25, sil=True)
        label_box(f, "FRANCIS DRAKE'S FLEET", W / 2, 150, window(t, S.at(3, "Drake") - .3, L[4] - .3), 56, GOLD)
        headline(f, "COLONY ABANDONED", t, S.at(3, "abandon") - .2, L[4] - .3, y=H - 150, size=80)
        fade_in(f, t, L[3] - .2)
        return f
    if t < L[5] - .2:
        f = night_tint(parch_bg(t, True, 1.0, 1.05, S.D), .3)
        van = prog(t, S.at(4, "find only") - .3, 2.0)
        for k in range(15):
            person(f, 420 + k * 76, 640, 120, (110, 116, 124), prog(t, L[4] + .3 + k * .06, .3) * (1 - (van if k else 0)), "soldier")
        label_box(f, "15 MEN LEFT BEHIND", W / 2, 250, window(t, S.at(4, "fifteen") - .3, L[5] - .3), 64, CREAM)
        blit(f, icon("skull", 140), 420, 450, prog(t, S.at(4, "bones") - .3, .5))
        small_note(f, "a year later: the bones of one man", W / 2, 820, window(t, S.at(4, "bones") - .3, L[5] - .3), 46)
        return f
    f = c_ = None
    c = cam_path(t, [(L[5] - .2, (ro[0], ro[1], 1.0)), (S.D, (ro[0], ro[1], .8))])
    f = c.render(m.img)
    x, y = c.pt(ro)
    ov = f.copy(); r = 260 + 30 * math.sin(t * 3)
    cv2.circle(ov, (int(x), int(y)), int(r), (160, 20, 20), -1, cv2.LINE_AA)
    cv2.addWeighted(ov, .25 * prog(t, L[5], .6), f, 1 - .25 * prog(t, L[5], .6), 0, f)
    place(f, c, m, "roanoke", "ROANOKE", t, L[5] - .1, "r", BLOODC, 46, 14, pulse=True)
    headline(f, "BITTER ENEMIES", t, S.at(5, "bitter") - .3, 1e9, y=H - 150, size=86, grad=("#ffe0c8", "#c0392b"))
    return f

def s_colony(t, S):
    L = S.L
    if t < L[2] - .2:
        f = parch_bg(t, True, 1.0, 1.06, S.D)
        if t < L[1] - .2:
            datestamp(f, "1587", t, .2, L[1] - .3)
            headline(f, "NOT SOLDIERS", t, .3, S.at(0, "but families") - .2, y=200, size=80, grad=("#f0f0f0", "#8aa0b8"))
            headline(f, "FAMILIES", t, S.at(0, "but families") - .2, L[1] - .3, y=200, size=96)
            sa = window(t, .3, S.at(0, "but families") - .3)
            for k in range(6): person(f, 660 + k * 120, 700, 230, (110, 116, 124), sa, "soldier")
            if sa > 0: crossmark(f, 960, 590, t, S.at(0, "Not soldiers") + .3, 200)
            for k, kd in enumerate(("man", "woman", "child", "man", "woman", "child", "child")):
                person(f, 640 + k * 105, 720, 230, ENGC, prog(t, S.at(0, "families") - .3 + k * .1, .4), kd)
            return f
        header(f, "THE 1587 COLONY", t, L[1] - .1, L[2] - .3)
        oob_row(f, 260, 330, t, L[1] + .2, "inf", ENGC, "settlers (about)", 115, a=window(t, L[1], L[2] - .3))
        oob_row(f, 260, 520, t, S.at(1, "seventeen") - .2, "inf", (120, 60, 100), "women", 17, a=window(t, L[1], L[2] - .3))
        oob_row(f, 260, 710, t, S.at(1, "eleven") - .2, "inf", (60, 110, 80), "children", 11, a=window(t, L[1], L[2] - .3))
        live_portrait(f, "white", W - 520, 470, 420, t, window(t, S.at(1, "governor") - .4, L[2] - .3), seed=1)
        plate(f, "JOHN WHITE", "governor · artist", W - 520, 740, t, S.at(1, "John White") - .3, L[2] - .3)
        return f
    m = region_map(); ch = P(m, "chesapeake"); ro = P(m, "roanoke")
    if t < L[4] - .2:
        c = cam_path(t, [(L[2] - .2, ((ch[0] + ro[0]) / 2 + 200, (ch[1] + ro[1]) / 2, .5)), (L[3] + 2, ((ch[0] + ro[0]) / 2 + 150, (ch[1] + ro[1]) / 2, .62))])
        f = c.render(m.img)
        sea_pt = m.proj((-74.9, 35.6))
        r = curve(c.pt(sea_pt), c.pt(ch), .15, 60)
        stop = .45 if t > S.at(3, "refused") - .2 else 1.0
        pr = min(stop, prog(t, L[2] + .3, 2.5, ease_io))
        arrow(f, r, pr, (214, 170, 80), 12, head=34, dashed=True)
        place(f, c, m, "chesapeake", "CHESAPEAKE BAY", t, S.at(2, "Chesapeake") - .3, "r", (200, 160, 40), 44, 15, pulse=t < S.at(3, "refused"))
        if t > S.at(3, "refused") - .2:
            cx_, cy_ = along(r, .45)
            crossmark(f, cx_, cy_ - 10, t, S.at(3, "refused"), 50)
            r2 = curve((cx_, cy_), c.pt(ro), -.2, 40)
            arrow(f, r2, prog(t, S.at(3, "put ashore") - .3, 1.2, ease_io), BLOODC, 12, head=34)
            place(f, c, m, "roanoke", "ROANOKE", t, S.at(3, "put ashore"), "l", BLOODC, 48, 15, pulse=True)
        live_portrait(f, "fernandes", 300, 230, 280, t, window(t, S.at(3, "Simon") - .4, L[4] - .3), angry=True, seed=6)
        plate(f, "SIMON FERNANDES", "pilot", 300, 410, t, S.at(3, "Simon") - .2, L[4] - .3)
        fade_in(f, t, L[2] - .2)
        return f
    f = sea_ships(t, "night", ships=(), toss=.5)
    fog(f, t, .35, seed=11)
    grade(f, desat=.4)
    blit(f, icon("skull", 180), W / 2, 420, prog(t, S.at(4, "found dead") - .3, .5))
    label_box(f, "GEORGE HOWE", W / 2, 600, window(t, S.at(4, "George") - .3, 1e9), 64, CREAM)
    small_note(f, "killed while catching crabs", W / 2, 680, window(t, S.at(4, "killed") - .3, 1e9), 46)
    datestamp(f, "28 JULY 1587", t, L[4] + .2)
    fade_in(f, t, L[4] - .2)
    return f

def s_virginia(t, S):
    L = S.L
    f = parch_bg(t, True, 1.0, 1.06, S.D)
    embers(f, t, 24, 5, (255, 220, 150), speed=20, size=2)
    if t < L[1] - .2:
        datestamp(f, "13 AUGUST 1587", t, .3, L[1] - .3)
        rim = prog(t, S.at(0, "baptised") - .3, 1.0)
        ov = f.copy(); cv2.circle(ov, (W // 2, 470), 300, (255, 210, 120), -1, cv2.LINE_AA)
        cv2.addWeighted(ov, .18 * rim, f, 1 - .18 * rim, 0, f)
        live_portrait(f, "manteo", W / 2, 470, 440, t, window(t, .2, L[1] - .3), seed=1)
        plate(f, "MANTEO", None, W / 2, 740, t, .4, L[1] - .3)
        headline(f, "LORD OF ROANOKE", t, S.at(0, "Lord") - .3, L[1] - .3, y=860, size=70)
        return f
    if t < L[2] - .2:
        datestamp(f, "18 AUGUST 1587", t, L[1], L[2] - .3)
        live_portrait(f, "eleanor", 560, 400, 360, t, window(t, L[1] - .1, L[2] - .3), seed=2)
        plate(f, "ELEANOR DARE", "John White's daughter", 560, 640, t, S.at(1, "Eleanor") - .3, L[2] - .3)
        blit(f, ico("cradle", 300), W - 560, 400, window(t, S.at(1, "a girl") - .3, L[2] - .3) * prog(t, S.at(1, "a girl") - .3, .5, back_out))
        headline(f, "VIRGINIA DARE", t, S.at(1, "Virginia Dare") - .3, L[2] - .3, y=820, size=90)
        small_note(f, "first English child born in the Americas", W / 2, 930, window(t, S.at(1, "the first") - .3, L[2] - .3), 46)
        return f
    if t < L[3] - .2:
        lvl = 1 - .8 * prog(t, L[2], 4.0)
        for k in range(6):
            blit(f, ico("barrel", 130), 260 + k * 120, 460, 1.0 if k / 6 < lvl else .18)
        label_box(f, "SUPPLIES", 560, 330, window(t, L[2], L[3] - .3), 50, CREAM)
        live_portrait(f, "white", W - 480, 420, 380, t, window(t, S.at(2, "begged") - .4, L[3] - .3), seed=1)
        headline(f, "SAIL HOME. BRING HELP.", t, S.at(2, "sail back") - .3, L[3] - .3, y=860, size=70)
        return f
    headline(f, "A SIMPLE CODE", t, L[3] - .1, 1e9, y=H / 2, size=110)
    return f

@functools.lru_cache(None)
def _post_panel(w=760, h=980):
    """vertical post: dark bark edges, stripped pale middle."""
    img = _bark(w, h, 5, False).copy()
    inner = _bark(w - 200, h - 160, 6, True)
    img[80:80 + h - 160, 100:100 + w - 200] = inner
    return img

def s_code(t, S):
    L = S.L
    if t < L[2] - .2:
        f = night_tint(parch_bg(t, True, 1.0, 1.05, S.D), .2)
        pw, ph = 760, 980
        img = _post_panel(pw, ph)
        x0, y0 = 120, 50
        f[y0:y0 + ph, x0:x0 + pw] = img
        carve(f, "PLACE", x0 + pw / 2, 560, t, S.at(0, "carve") - .1, 1.2, 120, seed=3)
        label_box(f, "RULE 1", 1350, 260, window(t, .3, 1e9), 50, GOLD)
        small_note(f, "if we move: carve the name", 1350, 340, window(t, .5, 1e9), 44)
        small_note(f, "of the place we have gone", 1350, 395, window(t, .7, 1e9), 44)
        if t > L[1] - .3:
            tc = S.at(1, "carve a cross") - .1
            cx_, cy_ = x0 + pw / 2, 330
            for k, (a_, b_) in enumerate((((cx_, cy_ - 110), (cx_, cy_ + 110)), ((cx_ - 80, cy_ - 30), (cx_ + 80, cy_ - 30)))):
                q = prog(t, tc + k * .5, .5)
                if q > 0:
                    e = (lerp(a_[0], b_[0], q), lerp(a_[1], b_[1], q))
                    cv2.line(f, (int(a_[0] + 3), int(a_[1] + 4)), (int(e[0] + 3), int(e[1] + 4)), (240, 214, 168), 22, cv2.LINE_AA)
                    cv2.line(f, (int(a_[0]), int(a_[1])), (int(e[0]), int(e[1])), (42, 22, 10), 20, cv2.LINE_AA)
            label_box(f, "RULE 2", 1350, 560, window(t, L[1] - .2, 1e9), 50, "#ffb0a0")
            small_note(f, "in danger: carve a cross above it", 1350, 640, window(t, L[1], 1e9), 44)
            quote_card(f, ["if they should happen to be distressed ...", "they should carve over the letters or name, a Crosse"],
                       "John White, 1590", t, S.at(1, "cross") + .2, 1e9, x=1340, y=870, w=1000, size=34, seal=False)
        return f
    m = ob_map(); ro = P(m, "roanoke")
    c = cam_path(t, [(L[2] - .2, (ro[0] - 300, ro[1], .7)), (S.D, (ro[0] - 450, ro[1], .58))])
    f = c.render(m.img)
    x, y = c.pt(ro)
    rr = 50 / 69.0 * m.k * c.z   # 50 miles in degrees of latitude
    q = prog(t, S.at(2, "fifty") - .4, 1.4)
    ov = f.copy(); cv2.ellipse(ov, (int(x), int(y)), (int(rr), int(rr)), 0, 0, 360 * q, (214, 170, 80), 5, cv2.LINE_AA)
    cv2.addWeighted(ov, .9, f, .1, 0, f)
    arrow(f, [(x - 20, y), (x - rr * .55, y + 30), (x - rr + 10, y + 10)], prog(t, S.at(2, "mainland") - .4, 1.0, ease_io), (214, 170, 80), 12, head=34)
    place(f, c, m, "roanoke", "ROANOKE", t, L[2], "r", ENGC, 42)
    label_box(f, "50 MILES INTO THE MAIN", x - rr * .55, y - rr * .35, window(t, S.at(2, "fifty") - .2, 1e9), 50, GOLD)
    fade_in(f, t, L[2] - .2)
    return f

def s_armada(t, S):
    L = S.L
    if t < L[1] - .2:
        m = channel_map()
        c = cam_path(t, [(0, (m.BW * .5, m.BH * .5, .55)), (L[1], (m.BW * .45, m.BH * .55, .7))])
        f = c.render(m.img)
        datestamp(f, "1588", t, .3, L[1] - .3)
        cx0, cy0 = c.pt(m.proj((-5.5, 49.6)))
        adv = prog(t, .5, L[1] - 1, smooth) * 220 * c.z
        for k in range(15):   # crescent formation
            ang = (k / 14 - .5) * 2.4
            x = cx0 + adv - 260 * math.cos(ang) * c.z
            y = cy0 + 520 * math.sin(ang) * c.z
            blit(f, galleon(int(90 * c.z / .55)), x, y, prog(t, .4 + k * .05, .4))
        label_box(f, "THE SPANISH ARMADA", cx0 + adv, cy0 + 260 * c.z, window(t, S.at(0, "Armada") - .3, L[1] - .3), 52, "#ffd890")
        for k in range(4):
            ex, ey = c.pt(m.proj((-3.6 + k * 1.0, 50.3)))
            blit(f, galleon(int(60 * c.z / .55), cross=True), ex, ey - 10, prog(t, S.at(0, "held back") - .3 + k * .1, .4))
        small_note(f, "every good ship held back", W / 2, H - 120, window(t, S.at(0, "held back") - .3, L[1] - .3), 48)
        return f
    if t < L[2] - .2:
        f = sea_ships(t, "dusk", ships=((700, .6, 240, 1), (1000, .6, 200, 2), (1420, .6, 380, 1)), sil=True, toss=1.2)
        ta = S.at(1, "attacked") - .2
        for k in range(5):
            tk = ta + k * .35
            if tk < t < tk + .5:
                ov = f.copy(); cv2.circle(ov, (1300, int(H * .58)), int(30 + 200 * (t - tk)), (255, 200, 120), -1, cv2.LINE_AA)
                cv2.addWeighted(ov, .5 * (1 - (t - tk) / .5), f, 1 - .5 * (1 - (t - tk) / .5), 0, f)
        smoke(f, t, .3 * prog(t, ta, 1.0), seed=4, speed=50)
        label_box(f, "TWO SMALL SHIPS", W / 2, 150, window(t, S.at(1, "two small") - .3, S.at(1, "attacked") - .2), 56, CREAM)
        headline(f, "ATTACKED · PLUNDERED", t, ta, L[2] - .3, y=170, size=70, grad=("#ffe0c8", "#c0392b"))
        return shake(f, t, ta + .1, 7, .4)
    if t < L[3] - .2:
        f = coast_scene(t, "night", pan=.5 + prog(t, L[2], 8) * .5)
        fog(f, t, .45, seed=12)
        yrs = ["1587", "1588", "1589", "1590"]
        idx = min(3, int((t - L[2] + .2) / max(.8, (L[3] - L[2]) / 4)))
        for k in range(idx + 1):
            a = window(t, L[2] - .1 + k * (L[3] - L[2]) / 4, (L[2] + (k + 1) * (L[3] - L[2]) / 4 - .2) if k < 3 else 1e9, .25, .25)
            blit(f, text_sprite(yrs[k], "cinzel", 180, CREAM, 900, stroke=4, gradient=("#f4f2ea", "#7f97b2"), glow="#000000", spacing=10), W / 2, 380, a)
        headline(f, "NO SHIP CAME", t, S.at(2, "no ship") - .2, L[3] - .3, y=H - 170, size=80, grad=("#f0f0f0", "#8aa0b8"))
        fade_in(f, t, L[2] - .2)
        return f
    f = parch_bg(t, True, 1.0, 1.06, S.D)
    blit(f, ico("cradle", 260), W / 2, 420, prog(t, L[3], .4))
    headline(f, "VIRGINIA DARE · AGE 3", t, S.at(3, "granddaughter") - .2, 1e9, y=700, size=80)
    small_note(f, "White landed on her third birthday: 18 August 1590", W / 2, 800, window(t, S.at(3, "three") - .2, 1e9), 44)
    return f

@functools.lru_cache(None)
def _settlement(w=1500, h=860):
    """bird's-eye sketch of the settlement (ink on parchment)."""
    img = parchment(w, h, 61, .15).copy()
    rng = np.random.default_rng(6)
    for _ in range(90):   # trees around
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        if (x - w / 2) ** 2 / 560 ** 2 + (y - h / 2) ** 2 / 330 ** 2 < 1: continue
        r = rng.uniform(14, 26)
        cv2.circle(img, (int(x), int(y)), int(r), (70, 84, 50), -1, cv2.LINE_AA)
        cv2.circle(img, (int(x), int(y)), int(r), (40, 30, 18), 2, cv2.LINE_AA)
    return img

HOUSES = [(-300, -120), (-140, -170), (40, -150), (220, -110), (-330, 60), (-160, 40), (20, 70), (200, 60), (330, -20), (-40, 190)]

def s_return(t, S):
    L = S.L
    if t < L[1] - .2:
        f = board_bg(t)
        stamp(f, "EVIDENCE", W / 2, H / 2 - 40, t, .4, 140, rot=-4)
        datestamp(f, "AUGUST 1590", t, .3)
        return shake(f, t, .45, 7, .3)
    if t < L[2] - .2:
        f = sea_ships(t, "dawn", ships=((1500, .6, 300, 0),), toss=1.6)
        tc = S.at(1, "overturned") - .2
        ang = 0 if t < tc else min(150, (t - tc) * 160)
        rowboat(f, 820, H * .78 + (t - tc) * 30 * (t > tc), t, 1.0, ang)
        headline(f, "SEVEN MEN DROWNED", t, S.at(1, "Seven") - .2, L[2] - .3, y=180, size=80, grad=("#f0f0f0", "#8aa0b8"))
        fade_in(f, t, L[1] - .2)
        return f
    if t < L[3] - .2:   # CRO on a tree
        f = night_tint(parch_bg(t, True, 1.0, 1.05, 8), .2)
        tw = 620
        f[:, (W - tw) // 2:(W + tw) // 2] = cv2.resize(_bark(tw, 540, 8, False), (tw, H))
        x0 = W // 2; f[300:780, x0 - 260:x0 + 260] = _bark(520, 480, 9, True)
        carve(f, "CRO", x0, 540, t, S.at(2, "C R O") - .4, 1.4, 190, seed=4)
        evidence_card(f, 1, "C R O", 1600, 520, t, S.at(2, "three letters") - .3, 1e9, draw=lambda c, x, y, s, a: blit(c, text_sprite("CRO", "cinzel", 120, "#2a160a", 900, shadow=False, spacing=12), x, y, a), w=360, h=420, rot=4)
        small_note(f, "carved into a tree on the sandy bank", 330, 900, window(t, S.at(2, "carved") - .3, 1e9), 40)
        return f
    if t < L[4] - .2:   # settlement taken down, palisade
        f = parch_bg(t, True, 1.0, 1.04, S.D)
        img = _settlement()
        f[110:110 + 860, 210:210 + 1500] = img
        cx_, cy_ = 960, 540
        gone = prog(t, S.at(3, "taken down") - .3, 1.6)
        for k, (dx, dy) in enumerate(HOUSES):
            blit(f, ico("house", 110), cx_ + dx, cy_ + dy, 1 - clamp(gone * 1.6 - k * .06))
            if gone > 0: cv2.rectangle(f, (int(cx_ + dx - 40), int(cy_ + dy + 30)), (int(cx_ + dx + 40), int(cy_ + dy + 40)), (120, 90, 58), -1)
        q = prog(t, S.at(3, "palisade") - .4, 1.6)
        if q > 0:
            n = int(120 * q)
            for k in range(n):
                a_ = k / 120 * 6.283 - 1.57
                px, py = cx_ + 560 * math.cos(a_), cy_ + 330 * math.sin(a_)
                cv2.rectangle(f, (int(px - 7), int(py - 20)), (int(px + 7), int(py + 20)), (92, 62, 34), -1)
                cv2.rectangle(f, (int(px - 7), int(py - 20)), (int(px + 7), int(py + 20)), (40, 26, 14), 2)
        label_box(f, "HOUSES TAKEN DOWN", W / 2, 70, window(t, S.at(3, "taken down") - .2, S.at(3, "palisade") - .3), 54, CREAM)
        label_box(f, "A TALL PALISADE", W / 2, 70, window(t, S.at(3, "palisade") - .2, L[4] - .3), 54, GOLD)
        return f
    if t < L[6] - .2:   # the post: bark stripped, CROATOAN, no cross
        f = night_tint(parch_bg(t, True, 1.0, 1.04, S.D), .25)
        dim(f, .25)
        pw, ph = 1700, 520; x0, y0 = 110, 260
        dark = _bark(pw, ph, 12, False); pale = _bark(pw, ph, 13, True)
        sp = prog(t, S.at(4, "stripped") - .3, 1.4, ease_io)
        cut = int(pw * sp)
        f[y0:y0 + ph, x0:x0 + pw] = dark
        if cut > 0: f[y0:y0 + ph, x0:x0 + cut] = pale[:, :cut]
        carve(f, "CROATOAN", x0 + pw / 2, y0 + ph / 2, t, S.at(4, "one word") - .2, 1.6, 190, seed=5)
        if t > L[5] - .2:
            cx_, cy_ = x0 + pw / 2, y0 - 120
            ov = f.copy()
            cv2.line(ov, (int(cx_), int(cy_ - 90)), (int(cx_), int(cy_ + 90)), (240, 230, 210), 4, cv2.LINE_AA)
            cv2.line(ov, (int(cx_ - 65), int(cy_ - 20)), (int(cx_ + 65), int(cy_ - 20)), (240, 230, 210), 4, cv2.LINE_AA)
            cv2.addWeighted(ov, .5 * window(t, S.at(5, "without") - .4, 1e9), f, 1 - .5 * window(t, S.at(5, "without") - .4, 1e9), 0, f)
            crossmark(f, cx_, cy_ - 10, t, S.at(5, "without") + .3, 90)
            label_box(f, "NO CROSS", cx_ + 330, cy_, window(t, S.at(5, "without") + .2, 1e9), 64, "#ffb0a0")
            quote_card(f, ["CROATOAN without any crosse or signe of distresse"], "John White, 1590", t, S.at(5, "in White") - .2, 1e9, x=W / 2, y=930, w=1500, size=48, seal=True)
        return shake(f, t, S.at(4, "one word") + 1.5, 6, .35)
    if t < L[7] - .2:   # chests dug up
        f = parch_bg(t, True, 1.0, 1.05, S.D)
        for k in range(3):
            x = 520 + k * 440
            blit(f, ico("chest", 300), x, 470, prog(t, L[6] + k * .3, .4, back_out), rot=[-12, 6, 15][k])
        for k in range(14):
            rng = np.random.default_rng(k)
            px = 300 + rng.uniform(0, 1300); py = 640 + rng.uniform(0, 200)
            cv2.rectangle(f, (int(px), int(py)), (int(px + 70), int(py + 50)), (220, 206, 170), -1)
            cv2.rectangle(f, (int(px), int(py)), (int(px + 70), int(py + 50)), (90, 70, 40), 2)
        for k in range(80):   # rain streaks
            rng = np.random.default_rng(100 + k); x = rng.uniform(0, W); y = (rng.uniform(0, H) + t * 900) % H
            cv2.line(f, (int(x), int(y)), (int(x - 6), int(y + 30)), (180, 196, 220), 1, cv2.LINE_AA)
        label_box(f, "DUG UP · BROKEN OPEN", W / 2, 180, window(t, S.at(6, "dug up") - .3, 1e9), 60, CREAM)
        small_note(f, "books torn · maps and pictures rotten with rain", W / 2, 260, window(t, S.at(6, "books") - .3, 1e9), 46)
        return f
    m = ob_map(); ro = P(m, "roanoke"); cr = P(m, "croatoan")
    c = cam_path(t, [(L[7] - .2, (ro[0] + 100, ro[1], .9)), (L[7] + 6, ((ro[0] + cr[0]) / 2 + 100, (ro[1] + cr[1]) / 2, .62))])
    f = c.render(m.img)
    place(f, c, m, "roanoke", "ROANOKE", t, L[7], "l", ENGC, 42)
    r = curve(c.pt(ro), c.pt(cr), -.18, 60)
    arrow(f, r, prog(t, S.at(7, "safe at") - .5, 1.6, ease_io), (214, 170, 80), 12, head=34, dashed=True)
    place(f, c, m, "croatoan", "CROATOAN", t, S.at(7, "Croatoan") - .3, "r", (200, 160, 40), 50, 15, pulse=True)
    label_box(f, "≈ 50 MILES SOUTH", W / 2 + 330, H / 2 + 60, window(t, S.at(7, "fifty") - .3, 1e9), 48, GOLD)
    live_portrait(f, "white", 210, 230, 280, t, window(t, L[7], 1e9), seed=1)
    quote_card(f, ["I greatly joyed"], "John White", t, S.at(7, "greatly") - .3, S.at(7, "He believed") + 1.5, x=W / 2, y=H - 170, w=760, size=50, seal=False)
    return f

def s_storm(t, S):
    L = S.L
    bolts = [(S.at(0, "storm") - .1, 1400), (S.at(0, "anchors") + .2, 520), (S.at(0, "captains") - .2, 1150), (S.at(0, "John White") + 1.2, 300)]
    f = sea_ships(t, "storm", ships=((620, .6, 420, 1), (1300, .6, 300, 2)), toss=2.4, sil=True)
    smoke(f, t, .45, seed=21, speed=160, color=(22, 26, 34))
    weather(f, t, rain=.6, cloud=.7, bolts=bolts, seed=2)
    label_box(f, "ANCHORS AND CABLES LOST", W / 2, 160, window(t, S.at(0, "anchors") - .3, S.at(0, "John White") - .3), 56, CREAM)
    if t > S.at(0, "John White") - .3:
        dim(f, .45 * prog(t, S.at(0, "John White") - .3, .5))
        g = prog(t, S.at(0, "never") - .2, 1.2)
        live_portrait(f, "white", W / 2, 470, 400, t, prog(t, S.at(0, "John White") - .3, .4), grey=g > .4, seed=1)
        headline(f, "NEVER RETURNED", t, S.at(0, "never") - .2, 1e9, y=800, size=80, grad=("#f0f0f0", "#8aa0b8"))
    for b, _ in bolts[:3]: f = shake(f, t, b, 8, .5)
    return f

EV = [("HOUSES TAKEN DOWN", "time to pack up", "house"), ("CROATOAN, NO CROSS", "the code was followed", "carve"),
      ("50 MILES INLAND", "planned move", "map"), ("WHITE'S BELIEF", "safe at Croatoan", "white")]
EVPOS = [(330, 400, -4), (760, 690, 3), (1170, 400, -2), (1600, 690, 4)]

def _ev_draw(kind):
    def d(c, x, y, s, a):
        if kind == "house": blit(c, ico("house", 190), x, y, a)
        elif kind == "carve":
            blit(c, text_sprite("CROATOAN", "cinzel", 50, "#2a160a", 900, shadow=False, spacing=4), x, y - 20, a)
            cv2.line(c, (int(x - 40), int(y + 40)), (int(x + 40), int(y + 100)), (190, 30, 30), 6, cv2.LINE_AA)
            cv2.line(c, (int(x + 40), int(y + 40)), (int(x - 40), int(y + 100)), (190, 30, 30), 6, cv2.LINE_AA)
            cv2.line(c, (int(x), int(y + 30)), (int(x), int(y + 110)), (90, 60, 30), 4, cv2.LINE_AA)
            cv2.line(c, (int(x - 26), int(y + 55)), (int(x + 26), int(y + 55)), (90, 60, 30), 4, cv2.LINE_AA)
        elif kind == "map":
            cv2.circle(c, (int(x), int(y)), 80, (120, 90, 50), 3, cv2.LINE_AA)
            cv2.arrowedLine(c, (int(x + 10), int(y)), (int(x - 70), int(y)), (150, 30, 30), 7, cv2.LINE_AA, tipLength=.3)
            cv2.circle(c, (int(x + 10), int(y)), 9, (40, 62, 110), -1, cv2.LINE_AA)
        elif kind == "white": blit(c, portrait("white", 210), x, y, a)
    return d

def evidence_board(f, t, t0s, a=1.0):
    for k, (title, sub, kind) in enumerate(EV):
        x, y, rot = EVPOS[k]
        evidence_card(f, k + 1, title, x, y, t, t0s[k], 1e9, draw=_ev_draw(kind), w=380, h=430, rot=rot, sub=sub, a=a)
    pins = [(EVPOS[k][0], EVPOS[k][1] - 215 + 22) for k in range(4)]
    for k in range(3):
        red_string(f, [pins[k], pins[k + 1]], t, t0s[k + 1] + .3, .6, a)

def s_evidence(t, S):
    L = S.L
    f = board_bg(t)
    header(f, "WHAT WE KNOW", t, .2)
    z = 1 + .12 * prog(t, L[5] - .2, 3.0, ease_io)
    evidence_board(f, t, [L[1], L[2], L[3], L[4]])
    if z > 1.001:
        M = np.float32([[z, 0, W / 2 - W / 2 * z], [0, z, H / 2 - H / 2 * z]])
        f = cv2.warpAffine(f, M, (W, H), borderMode=cv2.BORDER_REFLECT)
        dim(f, .45 * prog(t, L[5] - .2, .8))
        headline(f, "NOW, THE THEORIES", t, L[5], 1e9, y=H / 2, size=96)
    if t < L[1] - .3:
        small_note(f, "four facts from White's own account", W / 2, H - 120, window(t, .5, L[1] - .3), 44)
    return f

@functools.lru_cache(None)
def white_map():
    """John White-style watercolour map of the sounds (our own drawing, not a copy of the original)."""
    m = GeoMap(-76.1, 35.85, 2.4, BW=1600, BH=1000, res="10m", seed=51, sea="#86a9a6", water=False, relief=False)
    img = m.img.astype(np.float32)
    land = (np.abs(img - np.array(hexc("#86a9a6"), np.float32)).sum(-1) > 80)
    img[land] = img[land] * .55 + np.array([214, 196, 150], np.float32) * .45
    rng = np.random.default_rng(3)
    out = np.clip(img, 0, 255).astype(np.uint8)
    for _ in range(260):
        x, y = rng.integers(0, 1600), rng.integers(0, 1000)
        if land[y, x]:
            cv2.circle(out, (int(x), int(y)), 6, (96, 120, 70), -1, cv2.LINE_AA); cv2.line(out, (int(x), int(y + 6)), (int(x), int(y + 12)), (70, 50, 30), 2)
    for k in range(5):
        x = 1350 + k * 40; y = 260 + k * 60
        cv2.ellipse(out, (x, y), (60, 18), -20, 0, 360, (110, 80, 50), 2, cv2.LINE_AA)   # sea monsters' wake / ships
    cv2.rectangle(out, (10, 10), (1589, 989), (90, 60, 30), 6)
    return m, out

def s_theory1(t, S):
    L = S.L
    if t < L[1] - .2:
        m = ob_map(); cr = P(m, "croatoan"); ro = P(m, "roanoke")
        c = cam_path(t, [(0, (ro[0], (ro[1] + cr[1]) / 2, .62)), (L[1], (cr[0] - 100, cr[1] - 50, 1.0))])
        f = c.render(m.img)
        header(f, "THEORY 1 · CROATOAN", t, 0, L[1] - .3)
        r = curve(c.pt(ro), c.pt(cr), -.18, 60)
        arrow(f, r, prog(t, .5, 2.0, ease_io), (214, 170, 80), 12, head=34)
        place(f, c, m, "croatoan", "HATTERAS ISLAND", t, S.at(0, "Hatteras") - .3, "l", (200, 160, 40), 48, 15, pulse=True)
        live_portrait(f, "manteo", W - 220, 300, 280, t, window(t, S.at(0, "Manteo") - .4, L[1] - .3), seed=1)
        return f
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    if t < L[3] - .2:
        header(f, "THEORY 1 · CROATOAN", t, 0)
        datestamp(f, "DIGS SINCE 2009", t, L[1], L[2] - .3)
        if t < L[2] - .2:
            x0, y0 = 460, 260
            ov = f.copy(); cv2.rectangle(ov, (x0, y0), (x0 + 1000, y0 + 560), (110, 78, 44), -1); cv2.addWeighted(ov, .8, f, .2, 0, f)
            for k in range(11): cv2.line(f, (x0 + k * 100, y0), (x0 + k * 100, y0 + 560), (230, 220, 190), 2, cv2.LINE_AA)
            for k in range(7): cv2.line(f, (x0, y0 + k * 93), (x0 + 1000, y0 + k * 93), (230, 220, 190), 2, cv2.LINE_AA)
            rng_ = np.random.default_rng(5)
            for k in range(18):
                fx_, fy_ = x0 + 50 + rng_.integers(0, 10) * 100, y0 + 46 + rng_.integers(0, 6) * 93
                q = prog(t, L[1] + .8 + k * .35, .3, back_out)
                if q > 0: cv2.circle(f, (int(fx_), int(fy_)), int(12 * q), [(214, 170, 80), (180, 180, 186), (200, 120, 60)][k % 3], -1, cv2.LINE_AA)
            blit(f, ico("trowel", 200), 1300 + 20 * math.sin(t * 4), 520 + 15 * math.cos(t * 4), prog(t, L[1] + .3, .4), rot=20 * math.sin(t * 4))
            label_box(f, "A NATIVE TOWN SITE ON HATTERAS", W / 2, 900, window(t, S.at(1, "Native town") - .3, L[2] - .3), 48, CREAM)
            small_note(f, "excavations led by archaeologist Mark Horton", W / 2, 970, window(t, S.at(1, "Mark") - .3, L[2] - .3), 40)
            return f
        items = [("hilt", "RAPIER HILT", "rapier"), ("gun", "GUN PART", "gun"), ("slate", "WRITING SLATE", "slate"), ("pencil", "LEAD PENCIL", "pencil")]
        for k, (kind, name, ph) in enumerate(items):
            x = 300 + k * 440
            evidence_card(f, k + 1, name, x, 520, t, S.at(2, ph) - .3, 1e9, draw=lambda c, x_, y_, s, a, kd=kind: blit(c, ico(kd, 220), x_, y_, a), w=360, h=420, rot=[-3, 2, -2, 4][k])
        small_note(f, "objects that hint at literate Europeans", W / 2, 930, window(t, S.at(2, "Objects") - .3, L[3] - .3), 46)
        return f
    if t < L[4] - .2:
        header(f, "THE COUNTER-ARGUMENT", t, L[3] - .2)
        x0, y0, w_ = 360, 250, 900
        layers = [("1700s", (150, 120, 80)), ("1600s", (130, 96, 60)), ("1600s + 'Roanoke' finds", (112, 80, 48)), ("1500s", (96, 66, 40))]
        for k, (lab, col) in enumerate(layers):
            a = prog(t, L[3] + k * .25, .4)
            ov = f.copy(); cv2.rectangle(ov, (x0, y0 + k * 140), (x0 + w_, y0 + (k + 1) * 140), col, -1); cv2.addWeighted(ov, a, f, 1 - a, 0, f)
            blit(f, text_sprite(lab, "cinzel", 38, "#f4e4bc", 700, stroke=2, glow="#000000"), x0 + w_ / 2, y0 + k * 140 + 70, a)
        hl = window(t, S.at(3, "layers") - .3, 1e9)
        cv2.rectangle(f, (x0 - 6, y0 + 2 * 140 - 6), (x0 + w_ + 6, y0 + 3 * 140 + 6), (200, 40, 30), int(6 * hl) + 1 if hl > 0 else 1)
        arrow(f, [(1700, 420), (1500, 520), (1300, 600)], prog(t, S.at(3, "traded") - .3, .8), (214, 170, 80), 12, head=34)
        label_box(f, "TRADE GOODS?", 1600, 330, window(t, S.at(3, "traded") - .3, 1e9), 54, GOLD)
        return f
    header(f, "THEORY 1 · CROATOAN", t, L[4] - .2)
    blit(f, text_sprite("PLAUSIBLE", "cinzel", 110, CREAM, 900, stroke=3, gradient=("#fff4d0", "#e0a640"), glow="#000000", spacing=8), W / 2, 330, prog(t, L[4], .4))
    evidence_meter(f, W / 2, 560, 3, t, L[4] + .3, "STRENGTH OF EVIDENCE", w=700)
    small_note(f, "no grave  ·  no name  ·  no proof", W / 2, 700, window(t, S.at(4, "no grave") - .3, 1e9), 54)
    stamp(f, "NO PROOF", W / 2 + 420, 860, t, S.at(4, "no proof") - .1, 80, rot=-6)
    return f

def s_theory2(t, S):
    L = S.L
    if t < L[1] - .2:
        m = ob_map(); ro = P(m, "roanoke"); sx = P(m, "sitex")
        c = cam_path(t, [(0, ((ro[0] + sx[0]) / 2, ro[1], .58)), (L[1], ((ro[0] + sx[0]) / 2, ro[1], .66))])
        f = c.render(m.img)
        header(f, "THEORY 2 · INLAND", t, 0, L[1] - .3)
        r = curve(c.pt(ro), c.pt(sx), .12, 60)
        arrow(f, r, prog(t, .6, 2.0, ease_io), (214, 170, 80), 12, head=34)
        place(f, c, m, "roanoke", "ROANOKE", t, .2, "r", ENGC, 40)
        return f
    if t < L[3] - .2:
        f = board_bg(t)
        header(f, "JOHN WHITE'S MAP · THE HIDDEN PATCH", t, L[1] - .1, L[3] - .3)
        m, img = white_map()
        z = lerp(.95, 1.0, prog(t, L[1], 3))
        mw, mh = 1600, 1000
        x0, y0 = 160, 60
        ff = img.copy()
        px, py = (int(v) for v in m.proj(LL["sitex"]))
        pa, pb = (px - 70, py - 60), (px + 70, py + 60)
        scan = prog(t, S.at(2, "Under") - .4, 2.0, ease_io)
        star = icoarr = None
        if scan > 0:
            blit(ff, ico("fort", 110), px, py, 1.0)
        # paper patches (one over the fort, one elsewhere)
        for (qa, qb), k in (((pa, pb), 0), (((900, 620), (1040, 720)), 1)):
            patch = np.full((qb[1] - qa[1], qb[0] - qa[0], 3), (226, 212, 176), np.uint8)
            if k == 0 and scan > 0:   # X-ray scan reveals what is under it
                cut = int(patch.shape[0] * scan)
                roi = ff[qa[1]:qb[1], qa[0]:qa[0] + patch.shape[1]]
                patch[:cut] = (roi[:cut].astype(np.float32) * .55 + np.array([120, 200, 255], np.float32) * .45).astype(np.uint8)
            ff[qa[1]:qb[1], qa[0]:qb[0]] = patch
            cv2.rectangle(ff, qa, qb, (120, 96, 60), 2)
            if k == 0 and 0 < scan < 1:
                yy = int(qa[1] + (qb[1] - qa[1]) * scan)
                cv2.line(ff, (qa[0] - 30, yy), (qb[0] + 30, yy), (140, 220, 255), 4, cv2.LINE_AA)
        a = prog(t, L[1] - .2, .5)
        sc_ = .9 * z
        small = cv2.resize(ff, (int(mw * sc_), int(mh * sc_)))
        hh, ww = small.shape[:2]
        x0, y0 = (W - ww) // 2, 125
        roi = f[y0:y0 + hh, x0:x0 + ww]
        cv2.addWeighted(small, a, roi, 1 - a, 0, roi)
        sx_, sy_ = x0 + px * sc_, y0 + py * sc_
        z = sc_; y0 -= 60
        if scan > .7:
            ov = f.copy(); cv2.circle(ov, (int(sx_), int(sy_)), 120, (255, 220, 120), 6, cv2.LINE_AA); cv2.addWeighted(ov, .8, f, .2, 0, f)
        label_box(f, "PATCH", x0 + 970 * z, y0 + 60 + 590 * z, window(t, S.at(1, "patches") - .3, S.at(2, "Under") - .3), 40, GOLD)
        label_box(f, "A FORT SYMBOL?", sx_ + 40, sy_ - 170, window(t, S.at(2, "fort") - .3, L[3] - .3), 50, "#ffd890")
        label_box(f, "HEAD OF ALBEMARLE SOUND", W / 2, H - 70, window(t, S.at(2, "Albemarle") - .3, L[3] - .3), 46, CREAM)
        small_note(f, "British Museum, 2012", W - 300, 170, window(t, L[1], S.at(2, "Under") - .3), 40)
        return f
    m = ob_map(); sx = P(m, "sitex")
    if t < L[5] - .2:
        c = cam_path(t, [(L[3] - .2, (sx[0] + 300, sx[1], .9)), (L[5], (sx[0] + 150, sx[1], 1.3))])
        f = c.render(m.img)
        x, y = place(f, c, m, "sitex", "SITE X", t, L[3], "r", BLOODC, 52, 16, pulse=True)
        locator(f, region_map(), LL["sitex"], t, x=W - 420, y=150, w=360, box_deg=1.2)
        for k in range(4):
            blit(f, ico("sherd", 120), x - 260 + k * 150, y + 190, prog(t, S.at(3, "pottery") - .3 + k * .15, .4, back_out), rot=k * 25)
        small_note(f, "English pottery · late 1500s style", x + 20, y + 300, window(t, S.at(3, "pottery") - .3, L[4] - .3), 44)
        if t > L[4] - .3:
            arrow(f, [(x + 300, -40), (x + 260, y - 250), (x + 120, y - 60)], prog(t, S.at(4, "later") - .3, 1.0, ease_io), (150, 150, 150), 12, head=34, dashed=True)
            label_box(f, "LATER TRADERS FROM JAMESTOWN?", W / 2, H - 120, window(t, S.at(4, "Jamestown") - .3, L[5] - .3), 48, CREAM)
            label_box(f, "HARD TO DATE", W / 2, 160, window(t, S.at(4, "hard to date") - .3, L[5] - .3), 56, "#ffb0a0")
        fade_in(f, t, L[3] - .2)
        return f
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    header(f, "THEORY 2 · INLAND", t, L[5] - .2)
    blit(f, text_sprite("FITS THE 50 MILES", "cinzel", 96, CREAM, 900, stroke=3, gradient=("#fff4d0", "#e0a640"), glow="#000000", spacing=6), W / 2, 330, prog(t, L[5], .4))
    evidence_meter(f, W / 2, 560, 2.5, t, L[5] + .3, "STRENGTH OF EVIDENCE", w=700)
    for k in range(3): blit(f, ico("sherd", 110), W / 2 - 150 + k * 150, 760, prog(t, S.at(5, "broken pots") - .3 + k * .1, .4), rot=k * 30)
    return f

def s_theory3(t, S):
    L = S.L
    if t < L[1] - .2:
        f = night_tint(parch_bg(t, True, 1.0, 1.05, 6), .2)
        grade(f, red=.5)
        header(f, "THEORY 3 · MASSACRE", t, 0)
        headline(f, "DARKER", t, .2, 1e9, y=H / 2, size=130, grad=("#ffe0c8", "#c0392b"))
        return f
    if t < L[2] - .2:
        m = region_map(); js = P(m, "jamestown"); ro = P(m, "roanoke"); ch = P(m, "chesapeake")
        c = cam_path(t, [(L[1] - .2, (js[0] + 150, (js[1] + ro[1]) / 2, .55)), (L[2], (ch[0], ch[1] + 80, .7))])
        f = c.render(m.img)
        header(f, "THEORY 3 · MASSACRE", t, L[1] - .2)
        place(f, c, m, "jamestown", "JAMESTOWN 1607", t, S.at(1, "Jamestown") - .3, "l", ENGC, 42)
        place(f, c, m, "roanoke", "ROANOKE", t, L[1], "r", ENGC, 38)
        tp = S.at(1, "Powhatan") - .3
        if t > tp:
            x, y = c.pt(ch)
            ov = f.copy(); cv2.circle(ov, (int(x), int(y)), int(200 * prog(t, tp, .8)), (170, 20, 20), -1, cv2.LINE_AA)
            cv2.addWeighted(ov, .3, f, .7, 0, f)
        live_portrait(f, "strachey", 260, 700, 270, t, window(t, S.at(1, "Strachey") - .4, S.at(1, "Powhatan") - .3), seed=7)
        plate(f, "WILLIAM STRACHEY", "Jamestown colonist", 300, 880, t, S.at(1, "Strachey") - .3, S.at(1, "Powhatan") - .3)
        live_portrait(f, "powhatan", 260, 700, 270, t, window(t, S.at(1, "Powhatan") - .4, L[2] - .3), angry=True, seed=8)
        plate(f, "POWHATAN", "paramount chief", 260, 880, t, S.at(1, "Powhatan") - .3, L[2] - .3)
        label_box(f, "LIVING WITH THE CHESAPEAKE?", W / 2 + 250, 175, window(t, S.at(1, "Chesapeake people") - .3, S.at(1, "A few") - .3), 48, CREAM)
        label_box(f, "SURVIVORS · BEATING COPPER?", W / 2 + 250, 175, window(t, S.at(1, "A few") - .2, L[2] - .3), 48, GOLD)
        small_note(f, "reported by Strachey, written c. 1610-1612", W / 2 + 250, 245, window(t, S.at(1, "wrote") - .2, L[2] - .3), 38)
        if t > S.at(1, "slaughtered") - .3: grade(f, red=.35 * window(t, S.at(1, "slaughtered") - .3, S.at(1, "A few") - .3))
        return f
    if t < L[3] - .2:
        f = parch_bg(t, True, 1.0, 1.05, S.D)
        header(f, "EVIDENCE IN THE TREES", t, L[2] - .2)
        tree_rings(f, 620, 560, 360, t, L[2] + .3)
        label_box(f, "BALD CYPRESS RINGS", 620, 980, window(t, S.at(2, "bald") - .3, 1e9), 40, CREAM)
        label_box(f, "1587 – 1589", 1360, 420, window(t, S.at(2, "fifteen eighty-seven") - .3, 1e9), 90, "#ffb0a0")
        label_box(f, "WORST DROUGHT", 1360, 560, window(t, S.at(2, "most severe") - .3, 1e9), 64, CREAM)
        label_box(f, "IN 800 YEARS", 1360, 650, window(t, S.at(2, "eight hundred") - .3, 1e9), 64, GOLD)
        small_note(f, "Stahle et al., Science, 1998", 1360, 760, window(t, S.at(2, "eight hundred"), 1e9), 38)
        return f
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    if t < L[4] - .2:
        header(f, "THEORY 3 · MASSACRE", t, L[3] - .2)
        blit(f, text_sprite("POSSIBLE", "cinzel", 110, CREAM, 900, stroke=3, gradient=("#ffe0c8", "#c0392b"), glow="#000000", spacing=8), W / 2, 330, prog(t, L[3], .4))
        evidence_meter(f, W / 2, 560, 2, t, L[3] + .3, "STRENGTH OF EVIDENCE", w=700)
        small_note(f, "second-hand  ·  written down decades later", W / 2, 700, window(t, S.at(3, "second hand") - .3, 1e9), 50)
        return f
    header(f, "BEWARE OF SHORTCUTS", t, L[4] - .2)
    blit(f, ico("stone", 380), W / 2 - 260, 520, prog(t, L[4] + .3, .5, back_out))
    label_box(f, "THE DARE STONES", W / 2 + 330, 430, window(t, S.at(4, "Dare Stones") - .3, 1e9), 64, CREAM)
    small_note(f, "first stone found in 1937", W / 2 + 330, 510, window(t, S.at(4, "thirties") - .3, 1e9), 44)
    stamp(f, "HOAX", W / 2 - 240, 520, t, S.at(4, "hoax") - .1, 150, rot=-14)
    return shake(f, t, S.at(4, "hoax"), 7, .3)

def s_verdict(t, S):
    L = S.L
    if t < L[3] - .2:
        f = board_bg(t)
        header(f, "THE VERDICT", t, 0)
        if t < L[1] - .2:
            for k, (nm, sc) in enumerate((("CROATOAN", 3), ("INLAND", 2.5), ("MASSACRE", 2))):
                evidence_meter(f, 360 + k * 600, 700, sc, t, .4 + k * .4, nm, a=window(t, .2, L[1] - .3), w=440)
            headline(f, "WHERE DOES THAT LEAVE US?", t, .2, L[1] - .3, y=360, size=74)
            return f
        known = ["left in an orderly way", "signalled CROATOAN", "planned to go inland"]
        unknown = ["where most of them died", "how they died", "the fate of Virginia Dare"]
        label_box(f, "WHAT WE KNOW", 520, 260, prog(t, L[1] - .1, .4), 60, "#b8e0b0")
        for k, s_ in enumerate(known):
            a = prog(t, S.at(1, ["orderly", "signalled", "planned"][k]) - .3, .4)
            if a > 0:
                cv2.circle(f, (220, 400 + k * 130), int(26 * a), (90, 170, 90), -1, cv2.LINE_AA)
                cv2.polylines(f, [np.array([[208, 400 + k * 130], [218, 412 + k * 130], [236, 388 + k * 130]], np.int32)], False, (255, 255, 255), 5, cv2.LINE_AA)
            small_note(f, s_, 270, 400 + k * 130, a, 50, anchor="l")
        label_box(f, "STILL UNKNOWN", 1400, 260, prog(t, L[2] - .1, .4), 60, "#ffb0a0")
        for k, s_ in enumerate(unknown):
            a = prog(t, S.at(2, ["where most", "or how", "Virginia"][k]) - .3, .4)
            blit(f, text_sprite("?", "cinzel", 64, "#ff8070", 900, stroke=2, glow="#000000"), 1080, 400 + k * 130, a)
            small_note(f, s_, 1130, 400 + k * 130, a, 50, anchor="l")
        return f
    if t < L[4] - .2:
        m = ob_map(); ro = P(m, "roanoke"); cr = P(m, "croatoan"); sx = P(m, "sitex")
        c = cam_path(t, [(L[3] - .2, ((ro[0] + sx[0]) / 2, (ro[1] + cr[1]) / 2, .52)), (L[4], ((ro[0] + sx[0]) / 2, (ro[1] + cr[1]) / 2, .58))])
        f = c.render(m.img)
        x, y = c.pt(ro)
        for tgt, k in ((cr, 0), (sx, 1)):
            r = curve((x, y), c.pt(tgt), [-.18, .12][k], 60)
            arrow(f, r, prog(t, S.at(3, ["some to Croatoan", "some inland"][k]) - .3, 1.2, ease_io), (214, 170, 80), 12, head=34, dashed=True)
            tx, ty = c.pt(tgt)
            for j in range(6):
                person(f, tx - 60 + j * 24, ty - 30, 50, ENGC, window(t, S.at(3, ["some to Croatoan", "some inland"][k]) + .6, S.at(3, "absorbed") + 1.0 + j * .2, .4, .8))
                person(f, tx - 60 + j * 24, ty - 30, 50, NATC, window(t, S.at(3, "absorbed") + .6 + j * .2, 1e9, .6, .4))
        place(f, c, m, "roanoke", "ROANOKE", t, L[3], "u", ENGC, 40)
        small_note(f, "a split colony?", W / 2, 170, window(t, S.at(3, "split") - .3, S.at(3, "But until") - .3), 60)
        stamp(f, "CASE OPEN", W / 2 + 300, H - 220, t, S.at(3, "case stays open") - .1, 100, rot=-8)
        return f
    f = night_tint(parch_bg(t, True, 1.0, 1.06, S.D), .3)
    fog(f, t, .3, seed=13)
    headline(f, "WHAT'S YOUR THEORY?", t, L[4] - .1, 1e9, y=150, size=84)
    poll_card(f, t, S.at(4, "what do you") - .2, ["Croatoan (Hatteras Island)", "Inland, 50 miles (Site X)", "Massacre or drought", "Something else"],
              y=H / 2 + 40, w=1060, title="WHAT HAPPENED TO THE LOST COLONY?", hl_times=tuple(S.at(4, "Tell") - .3 + k * .8 for k in range(4)), hl_d=.8)
    return f

def s_ending(t, S):
    L = S.L
    if t < L[1] - .2:
        m = britain_map()
        c = cam_path(t, [(0, (m.BW * .52, m.BH * .62, .6)), (L[1], (m.BW * .5, m.BH * .38, .75))])
        f = c.render(m.img)
        pr = prog(t, .5, L[1] - 1.0, ease_io)
        p0 = c.pt(m.proj((-2.7, 53.96))); p1 = c.pt(m.proj((-3.6, 56.6)))
        x, y = lerp(p0[0], p1[0], pr), lerp(p0[1], p1[1], pr)
        formation(f, x, y, 200, 90, (150, 30, 30), t, angle=0, kind="inf", strength=1 - .9 * prog(t, S.at(0, "vanish") - .4, 1.2), flag=True, flag_color=(150, 30, 30), seed=91,
                  alpha=1 - prog(t, S.at(0, "vanish"), 1.2))
        label_box(f, "≈ 5,000 SOLDIERS", x, y + 110, window(t, S.at(0, "five thousand") - .3, S.at(0, "vanish") - .3), 46, CREAM)
        fog(f, t, .35 + .3 * prog(t, S.at(0, "vanish") - .4, 1.2), seed=14, low=False)
        header(f, "NEXT ON HISTORY SOURCED: UNSOLVED", t, .1)
        return f
    if t < L[1] + 3.0 or t < S.D - 12.2:
        f = night_tint(parch_bg(t, True, 1.0, 1.06, 6), .45)
        fog(f, t, .35, seed=15)
        blit(f, ico("eagle", 300), W / 2, 380, prog(t, L[1] - .2, .5))
        headline(f, "THE LOST NINTH LEGION", t, L[1] - .1, 1e9, y=640, size=96, grad=("#ffe0c8", "#c0392b"))
        stamp(f, "UNSOLVED", W / 2 + 420, 800, t, L[1] + .8, 70, rot=-8)
        return f
    # end screen (12 s)
    f = parch_bg(t, True, 1.0, 1.04, 30)
    f = night_tint(f, .3)
    fog(f, t, .25, seed=16)
    a = prog(t, S.D - 12.2, .6)
    x0, y0, x1, y1 = 150, 300, 150 + 960, 300 + 540
    ov = f.copy(); cv2.rectangle(ov, (x0, y0), (x1, y1), (20, 12, 6), -1); cv2.addWeighted(ov, .55 * a, f, 1 - .55 * a, 0, f)
    cv2.rectangle(f, (x0, y0), (x1, y1), (214, 170, 80), 4, cv2.LINE_AA)
    blit(f, text_sprite("WATCH NEXT", "cinzel", 44, GOLD, 800, stroke=2, glow="#000000", spacing=8), (x0 + x1) / 2, y0 - 50, a)
    blit(f, ico("eagle", 180), (x0 + x1) / 2, (y0 + y1) / 2 - 110, a)
    blit(f, text_sprite("THE LOST NINTH LEGION", "cinzel", 60, CREAM, 900, stroke=2, glow="#000000", spacing=4), (x0 + x1) / 2, (y0 + y1) / 2 + 40, a)
    small_note(f, "History Sourced: Unsolved · case 02", (x0 + x1) / 2, y1 - 80, a, 40)
    sx, sy = 1500, 570
    pulse = 1 + .05 * math.sin(t * 4)
    cv2.circle(f, (sx, sy - 120), 130, (40, 22, 12), -1, cv2.LINE_AA)
    blit(f, text_sprite("?", "cinzel", 170, "#ff8070", 900, stroke=3, glow="#000000"), sx, sy - 120, a)
    btn = text_sprite("SUBSCRIBE", "sans", 54, "#ffffff", None, shadow=False, spacing=2)
    bw, bh = btn[0].shape[1] - 40, 100
    ov = f.copy(); cv2.rectangle(ov, (int(sx - bw / 2), int(sy + 80)), (int(sx + bw / 2), int(sy + 80 + bh)), (204, 0, 0), -1)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)
    blit(f, btn, sx, sy + 130, a, pulse)
    blit(f, text_sprite("HISTORY SOURCED", "cinzel", 50, GOLD, 800, stroke=2, glow="#000000", spacing=6), sx, sy + 260, a)
    return f

SCENE_FUNCS = {"cold_open": s_cold_open, "title": s_title, "dream": s_dream, "lane": s_lane, "colony": s_colony, "virginia": s_virginia,
               "code": s_code, "armada": s_armada, "return": s_return, "storm": s_storm, "evidence": s_evidence, "theory1": s_theory1,
               "theory2": s_theory2, "theory3": s_theory3, "verdict": s_verdict, "ending": s_ending}

# ---- pacing helper: per-line slow push-in, alternating focus point -> a new "shot" at every line start
def _push(fn, amt=.06):
    def g(t, S):
        f = fn(t, S)
        L = list(S.L) + [S.D]
        i = max(k for k in range(len(L) - 1) if L[k] <= t + 1e-9) if t >= L[0] else 0
        a, b = L[i], L[i + 1]
        z = 1 + amt * smooth((t - a) / max(1e-3, b - a)) + .015 * (i % 2)
        cx = W / 2 + (120 if i % 2 else -120); cy = H / 2 + (40 if i % 3 == 1 else -30)
        M = np.float32([[z, 0, cx - cx * z], [0, z, cy - cy * z]])
        return cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return g
for _k in ("dream", "colony", "virginia", "code", "theory1", "theory2", "theory3", "verdict"):
    SCENE_FUNCS[_k] = _push(SCENE_FUNCS[_k])
