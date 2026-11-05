"""All 14 scenes. Each scene fn(t, S) -> RGB frame, where S has .L (line local start times), .D, .at(i, phrase)."""
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

SHIPS = [  # layer, x0, speed, width, seed
    (0, 200, 22, 180, 1), (0, 900, 20, 160, 2), (0, 1500, 24, 170, 3), (0, -300, 21, 150, 4),
    (1, 500, 34, 280, 5), (1, 1250, 30, 260, 6), (1, -150, 32, 250, 7),
    (2, 80, 52, 460, 8), (2, 1050, 48, 430, 9),
]
def sea_scene(t, kind="night", blend=None, ships=SHIPS, sink=0.0, ship_alpha=1.0):
    f = sky(kind).copy()
    if blend is not None and blend[1] > 0:
        cv2.addWeighted(f, 1 - blend[1], sky(blend[0]), blend[1], 0, f)
    cols = WAVE_COLS[kind]

    params = [(H * .60, 8, .5), (H * .67, 12, .7), (H * .76, 18, .9), (H * .88, 26, 1.1)]
    sil = kind == "night"
    for k, (by, amp, sp) in enumerate(params):
        wave_layer(f, t, k, by, cols[k], amp, sp, k * 1.3)
        if kind == "night" and k == 0:
            for j in range(30):
                y = int(H * .62 + j * 14); w_ = int(40 + j * 8 + 25 * math.sin(t * 2 + j))
                cv2.line(f, (1450 - w_ // 2, y), (1450 + w_ // 2, y), (95, 108, 130), 3, cv2.LINE_AA)
        for (layer, x0, spd, wd, sd) in ships:
            if layer != k: continue
            span = W + 2 * wd
            x = ((x0 + spd * t + wd) % span) - wd
            yb = wave_y(x, t, k, params[k][0], amp, sp, k * 1.3)
            spr = longship(wd, silhouette=sil, seed=sd)
            hh = spr[0].shape[0]
            ang = 3 * math.sin(t * 1.3 + sd)
            blit(f, spr, x, yb - hh * .28 + sink * hh * .9, ship_alpha * (1 - sink), 1.0, "c", ang)
    return f


from fx import *
# ======================================================= MONTGISARD 1177
GREEN = (38, 96, 66); FR = (165, 30, 34); WHITE = (232, 226, 210)

LL = {"jerusalem": (35.23, 31.78), "ascalon": (34.55, 31.66), "gaza": (34.46, 31.50), "ramla": (34.87, 31.93),
      "lydda": (34.89, 31.95), "montgisard": (34.92, 31.86), "jaffa": (34.75, 32.05), "arish": (33.80, 31.13),
      "cairo": (31.24, 30.04), "damascus": (36.29, 33.51), "harim": (36.52, 36.21), "acre": (35.07, 32.93),
      "hattin": (35.45, 32.80), "tripoli": (35.85, 34.43), "antioch": (36.16, 36.2), "kerak": (35.70, 31.18),
      "aleppo": (37.16, 36.2), "blanche": (34.85, 31.70), "darum": (34.32, 31.42), "marj": (35.58, 33.36), "jacobsford": (35.63, 33.0)}

def route(m, names, n=60, bend=.12):
    pts = [m.proj(LL[k]) if isinstance(k, str) else m.proj(k) for k in names]
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        mid = ((a[0] + b[0]) / 2 + (b[1] - a[1]) * bend, (a[1] + b[1]) / 2 - (b[0] - a[0]) * bend)
        out.extend(bezier(a, mid, b, n)[1:].tolist())
    return np.array(out, np.float32)

def draw_lakes(m):
    img = m.img
    ds = [(35.40, 31.76), (35.50, 31.77), (35.56, 31.70), (35.58, 31.55), (35.56, 31.40), (35.53, 31.25), (35.50, 31.10), (35.43, 31.05), (35.40, 31.20), (35.39, 31.45), (35.38, 31.62)]
    gal = [(35.52, 32.88), (35.62, 32.89), (35.65, 32.80), (35.60, 32.71), (35.54, 32.73), (35.51, 32.80)]
    for poly in (ds, gal):
        xy = np.array([m.proj(p) for p in poly], np.float32)
        cv2.fillPoly(img, [(xy * 8).astype(np.int32)], (60, 84, 92), cv2.LINE_AA, 3)
        cv2.polylines(img, [(xy * 8).astype(np.int32)], True, (58, 40, 24), 3, cv2.LINE_AA, 3)
    jr = np.array([m.proj(p) for p in [(35.57, 32.71), (35.56, 32.4), (35.53, 32.1), (35.55, 31.78)]], np.float32)
    cv2.polylines(img, [(jr * 8).astype(np.int32)], False, (70, 100, 108), 4, cv2.LINE_AA, 3)

def hills(m, lon0, lon1, lat0, lat1, n, seed=3, size=30):
    rng = np.random.default_rng(seed)
    for _ in range(n):
        lon, lat = rng.uniform(lon0, lon1), rng.uniform(lat0, lat1)
        x, y = m.proj((lon, lat))
        if not (0 < x < m.BW and 0 < y < m.BH): continue
        if np.abs(m.img[int(y), int(x)].astype(int) - np.array(hexc("#31454c"))).sum() < 90: continue
        s = size * rng.uniform(.7, 1.3)
        pts = np.array([[x - s, y], [x - s * .3, y - s * .8], [x, y - s * .5], [x + s * .4, y - s], [x + s, y]], np.float32)
        cv2.polylines(m.img, [(pts * 8).astype(np.int32)], False, (120, 90, 58), 3, cv2.LINE_AA, 3)
        cv2.line(m.img, (int(x + s * .4), int(y - s)), (int(x + s * .6), int(y - s * .3)), (150, 118, 80), 2, cv2.LINE_AA)

def desert_tint(m, lon0, lat_max, amt=.18):
    """warm the land south/east of the fertile coast (rough desert look)."""
    BH, BW = m.img.shape[:2]
    yy, xx = np.mgrid[0:BH, 0:BW].astype(np.float32)
    lon = (xx - BW / 2) / (m.coslat * m.k) + m.lonc; lat = m.latc - (yy - BH / 2) / m.k
    w = np.clip((lat_max - lat) * 1.2, 0, 1) * np.clip((lon - lon0) * .8 + .6, 0, 1)
    sand = np.array([214, 168, 104], np.float32)
    img = m.img.astype(np.float32)
    land = (np.abs(img - np.array(hexc("#31454c"), np.float32)).sum(-1) > 60)[..., None]
    img = img * (1 - w[..., None] * amt * land) + sand * w[..., None] * amt * land
    m.img = np.clip(img, 0, 255).astype(np.uint8)

@functools.lru_cache(None)
def levant_map():
    m = GeoMap(34.0, 32.4, 14, BH=2700, res="10m", seed=71)
    desert_tint(m, 33.0, 31.2, .22)
    hills(m, 34.9, 36.8, 31.0, 36.5, 120, 5, 22)
    draw_lakes(m)
    for lab in [("EGYPT", 30.6, 29.0, 70), ("SINAI", 33.6, 29.9, 54), ("SYRIA", 38.0, 34.8, 66),
                ("MEDITERRANEAN SEA", 31.4, 33.6, 64, "#3a2614", False, 12, True), ("ARABIAN DESERT", 38.3, 31.0, 50)]:
        m.label(*lab)
    return m

@functools.lru_cache(None)
def south_map():
    m = GeoMap(34.75, 31.62, 3.0, res="10m", seed=81)
    desert_tint(m, 33.0, 31.45, .28)
    hills(m, 34.95, 35.38, 31.25, 32.3, 90, 3, 34)
    hills(m, 35.6, 36.2, 30.9, 32.3, 40, 4, 30)
    draw_lakes(m)
    for lab in [("MEDITERRANEAN SEA", 34.05, 31.95, 60, "#3a2614", False, 12, True), ("SINAI", 33.75, 30.95, 56),
                ("JUDEAN HILLS", 35.05, 31.5, 40), ("DEAD SEA", 35.47, 31.45, 30, "#3a2614", False, 4, True)]:
        m.label(*lab)
    return m

def city(f, c, m, k, name, t, t0, side="r", color=(160, 30, 30), pulse=False, size=40, r=11, ink=INK, a=1.0):
    x, y = c.pt(m.proj(LL[k]))
    marker(f, x, y, t0, t, color, r, pulse=pulse)
    p = prog(t, t0 + .1, .4) * a
    if side == "r": blit(f, text_sprite(name, "cinzel", size, ink, 800, shadow=False, spacing=3), x + 22, y - 4, p, anchor="l")
    elif side == "l": blit(f, text_sprite(name, "cinzel", size, ink, 800, shadow=False, spacing=3), x - 22, y - 4, p, anchor="r")
    elif side == "u": blit(f, text_sprite(name, "cinzel", size, ink, 800, shadow=False, spacing=3), x, y - 40, p)
    else: blit(f, text_sprite(name, "cinzel", size, ink, 800, shadow=False, spacing=3), x, y + 42, p)
    return x, y

def label_box(f, s, x, y, a, size=44, color=CREAM, anchor="c"):
    blit(f, text_sprite(s, "cinzel", size, color, 800, stroke=2, glow="#000000", spacing=3), x, y, a, anchor=anchor)

def small_note(f, s, x, y, a, size=36, color="#e8d8b8", anchor="c"):
    blit(f, text_sprite(s, "garamond", size, color, 600, stroke=2, glow="#000000", spacing=1), x, y, a, anchor=anchor)

def fires(f, x, y, t, a=1.0, seed=0, r=60):
    if a <= 0: return
    embers(f, t, 26, seed, (255, 140, 50), (x - r, y - r * 2.2, x + r, y + 10), speed=55, size=4)
    ov = f.copy(); cv2.circle(ov, (int(x), int(y)), int(r * (.8 + .1 * math.sin(t * 7 + seed))), (255, 110, 30), -1, cv2.LINE_AA)
    ov = cv2.GaussianBlur(ov, (0, 0), 18) if False else ov
    cv2.addWeighted(ov, .25 * a, f, 1 - .25 * a, 0, f)

# ---------- desert backdrop ----------
DUNE = {"night": [(46, 44, 60), (36, 33, 46), (26, 23, 33), (15, 13, 19)],
        "dusk": [(160, 96, 58), (128, 76, 46), (92, 54, 34), (52, 30, 20)],
        "dawn": [(150, 120, 100), (120, 94, 80), (86, 66, 58), (48, 36, 32)]}

def desert_scene(t, kind="night", riders=0.0, ride_dir=1, blend=None):
    f = sky(kind).copy()
    if blend is not None and blend[1] > 0:
        cv2.addWeighted(f, 1 - blend[1], sky(blend[0]), blend[1], 0, f)
    cols = DUNE[kind]
    for k, (by, amp, fr, sp) in enumerate([(H * .62, 30, 260, 6), (H * .70, 46, 210, 12), (H * .80, 60, 170, 22), (H * .92, 50, 140, 40)]):
        xs = np.arange(-20, W + 40, 10, np.float32)
        off = t * sp
        y = by + amp * np.sin((xs + off) / fr + k * 2.1) + amp * .45 * np.sin((xs + off) / (fr * .41) + k)
        pts = np.vstack([np.stack([xs, y], 1), [[W + 40, H + 10], [-20, H + 10]]])
        cv2.fillPoly(f, [(pts * 8).astype(np.int32)], cols[k], cv2.LINE_AA, 3)
        if k == 1 and riders > 0:
            n = 26
            for i in range(n):
                x = ((i * 83 + ride_dir * t * 45) % (W + 200)) - 100
                if i / n > riders: continue
                yy = by + amp * math.sin((x + off) / fr + k * 2.1) + amp * .45 * math.sin((x + off) / (fr * .41) + k)
                bob = 3 * math.sin(t * 9 + i)
                col = (18, 16, 24) if kind == "night" else (40, 24, 16)
                cv2.ellipse(f, (int(x), int(yy - 18 + bob)), (22, 10), 0, 0, 360, col, -1, cv2.LINE_AA)
                cv2.line(f, (int(x - 6), int(yy - 26 + bob)), (int(x - 4), int(yy - 48 + bob)), col, 7, cv2.LINE_AA)
                cv2.circle(f, (int(x - 4), int(yy - 54 + bob)), 6, col, -1, cv2.LINE_AA)
                cv2.line(f, (int(x + 2), int(yy - 40 + bob)), (int(x + 14 * ride_dir), int(yy - 80 + bob)), col, 2, cv2.LINE_AA)
                for lx in (-14, -6, 8, 16): cv2.line(f, (int(x + lx), int(yy - 12 + bob)), (int(x + lx + 3 * math.sin(t * 12 + i + lx)), int(yy + 2)), col, 3, cv2.LINE_AA)
    return f

# ======================================================= SCENES
def s_cold_open(t, S):
    L = S.L
    f = desert_scene(t, "night", riders=prog(t, L[1], 3.0), ride_dir=1)
    fill_alpha(f, (90, 30, 10), .18 * prog(t, L[4], 3))
    dim(f, .1)
    a = window(t, .3, L[1] - .3, .9, .6)
    blit(f, text_sprite("NOVEMBER 1177", "cinzel", 92, CREAM, 700, stroke=2, glow="#000000", spacing=14), W / 2, 300, a)
    small_note(f, "The Kingdom of Jerusalem", W / 2, 400, window(t, .9, L[1] - .3, .6, .6), 44)
    # Saladin
    a = window(t, L[1], L[2] - .2, .5, .5)
    show_portrait(f, "saladin", W / 2, 360, t, L[1], L[2] - .2, 420)
    plate(f, "SALADIN", "Sultan of Egypt and Syria", W / 2, 640, t, L[1] + .4, L[2] - .2)
    # Baldwin
    if t > L[2] - .2:
        show_portrait(f, "baldwin", W / 2, 360, t, L[2] - .2, L[3] - .2, 420)
        tb = S.at(2, "sixteen")
        blit(f, text_sprite("AGE 16", "cinzel", 64, GOLD, 900, stroke=3, glow="#000000", spacing=6), W / 2, 640, window(t, tb, L[3] - .2, .3, .4), .9 + .1 * back_out((t - tb) / .4))
        tl = S.at(2, "leprosy")
        blit(f, text_sprite("LEPROSY", "cinzel", 72, CREAM, 900, stroke=3, gradient=("#ffd0c0", "#c0392b"), glow="#000000", spacing=10), W / 2, 740, window(t, tl, L[3] - .2, .3, .4))
        th = S.at(2, "own hands")
        blit(f, icon("hand", 170), W / 2 + 360, 380, window(t, th - .3, L[3] - .2, .3, .4), back_out((t - th + .3) / .5))
    # numbers
    if t > L[3] - .2:
        a = window(t, L[3] - .2, L[4] - .2, .4, .5)
        dim(f, .35 * a)
        tk = S.at(3, "few hundred")
        v1 = 375 * ease_out((t - tk) / 1.5) if t > tk else 0
        counter(f, v1, 520, 420, 190, a=a)
        label_box(f, "KNIGHTS", 520, 560, a, 50)
        blit(f, portrait("baldwin", 170), 520, 790, a)
        tn = S.at(3, "twenty-six")
        if t > tn - .3:
            v2 = 26000 * ease_out((t - tn + .3) / 1.6)
            blit(f, text_sprite(f"{int(v2):,}", "cinzel", 190, CREAM, 900, stroke=4, gradient=("#d8ffd8", "#3a9a5a"), glow="#000000"), W - 560, 420, a)
            label_box(f, "MEN?", W - 560, 560, a, 50)
            blit(f, portrait("saladin", 170), W - 560, 790, a)
            small_note(f, "the figure claimed by William of Tyre", W - 560, 630, window(t, tn + .8, L[4] - .2, .4, .4), 34)
        blit(f, text_sprite("VS", "cinzel", 110, GOLD, 900, stroke=3, glow="#000000"), W / 2, 420, a)
    # miracle
    tm = S.at(4, "miracle")
    headline(f, "A MIRACLE?", t, tm - .4, 1e9, y=380, size=130)
    return f

def s_title(t, S):
    f = parch_bg(t, True, 1.0, 1.08, S.D)
    embers(f, t, 70, 3, (255, 160, 60), speed=60, size=3)
    blit(f, icon("crown", 170), W / 2, 320, prog(t, .1, .5), .8 + .2 * back_out((t - .1) / .6))
    a = prog(t, .2, .6)
    sc = 1.15 - .15 * ease_out((t - .2) / 1.2)
    blit(f, text_sprite("MONTGISARD", "cinzel", 170, CREAM, 900, stroke=4, gradient=("#fff6d8", "#c98a26"), glow="#ff8a2a", spacing=12), W / 2, 520, a, sc)
    p = prog(t, .8, .9)
    if p > 0:
        x0, x1 = W / 2 - 560 * p, W / 2 + 560 * p
        cv2.line(f, (int(x0), 650), (int(x1), 650), (214, 170, 80), 4, cv2.LINE_AA)
        cv2.circle(f, (W // 2, 650), 9, (214, 170, 80), -1, cv2.LINE_AA)
    blit(f, text_sprite("1177  ·  THE LEPER KING VS SALADIN", "cinzel", 52, CREAM, 600, stroke=2, glow="#000000", spacing=6), W / 2, 725, prog(t, 1.2, .7))
    return f

def s_boy(t, S):
    L = S.L
    f = parch_bg(t, True, 1.0, 1.06, S.D)
    embers(f, t, 30, 41, (230, 170, 90), speed=30)
    if t < L[1] - .2:
        show_portrait(f, "baldwin", W / 2, 420, t, .2, L[1] - .3, 460)
        plate(f, "BALDWIN", "Born 1161 · son of King Amalric", W / 2, 720, t, .6, L[1] - .3)
        blit(f, icon("truecross", 120) if False else icon("crown", 110), W / 2, 150, window(t, S.at(0, "crusader"), L[1] - .3, .4, .4))
        small_note(f, "Kingdom of Jerusalem · founded after the First Crusade (1099)", W / 2, 880, window(t, S.at(0, "crusader"), L[1] - .3, .4, .4), 38)
        datestamp(f, "1161", t, .4, L[1] - .5)
        return f
    if t < L[2] - .2:
        show_portrait(f, "williamtyre", 640, 440, t, L[1] - .2, L[2] - .2, 400)
        plate(f, "WILLIAM OF TYRE", "Scholar · future Archbishop · chronicler", 640, 720, t, L[1] + .2, L[2] - .2)
        show_portrait(f, "baldwin", 1300, 470, t, L[1] + .4, L[2] - .2, 300)
        label_box(f, "AGE 9", 1300, 680, window(t, S.at(1, "nine"), L[2] - .2, .3, .4), 56, GOLD)
        return f
    if t < L[3] - .2:
        # children pinching: hands
        ta = S.at(2, "They pinched")
        for k, x in enumerate((420, 760, 1160, 1500)):
            x = x + 10 * math.sin(t * 3 + k)
            a = window(t, L[2] + .2 + k * .15, L[3] - .2, .3, .4)
            if a > 0.01:
                cv2.ellipse(f, (int(x), 470), (int(75 * a), int(100 * a)), 0, 180, 360, (20, 12, 6), -1, cv2.LINE_AA)
                cv2.ellipse(f, (int(x), 470), (int(70 * a), int(95 * a)), 0, 180, 360, (110, 70, 40) if k != 2 else (232, 226, 210), -1, cv2.LINE_AA)
                cv2.circle(f, (int(x), 320), int(50 * a), (20, 12, 6), -1, cv2.LINE_AA)
                cv2.circle(f, (int(x), 320), int(46 * a), (214, 170, 120), -1, cv2.LINE_AA)
                cv2.ellipse(f, (int(x), 300), (int(48 * a), int(30 * a)), 0, 180, 360, (90, 60, 30) if k != 2 else (200, 160, 96), -1, cv2.LINE_AA)
                for sx in (-1, 1): cv2.circle(f, (int(x + sx * 16 * a), 325), max(1, int(5 * a)), (30, 20, 10), -1, cv2.LINE_AA)
                if k < 3: cv2.line(f, (int(x + 50 * a), 420), (int(x + 140 * a + 15 * math.sin(t * 6)), 400), (214, 170, 120), int(14 * a) + 1, cv2.LINE_AA)
            last = k == 2
            if t > S.at(2, "The others"):
                if not last:
                    blit(f, text_sprite("!", "cinzel", 90, "#ffb8a8", 900, stroke=2, glow="#000000"), x + 70, 270, prog(t, S.at(2, "The others") + k * .2, .3))
            if last:
                label_box(f, "BALDWIN", x, 540, a, 40, GOLD)
        headline(f, "THE OTHERS CRIED OUT", t, S.at(2, "The others"), S.at(2, "Baldwin did") - .1, y=780, size=64)
        headline(f, "BALDWIN DID NOT.", t, S.at(2, "Baldwin did"), L[3], y=780, size=80, grad=("#ffd0c0", "#c0392b"))
        return f
    tl = S.at(3, "The boy had")
    show_portrait(f, "baldwin", W / 2 - 330, 440, t, L[3] - .2, 1e9, 380)
    blit(f, icon("hand", 300), W / 2 + 330, 430, window(t, L[3], 1e9, .4, .3), 1 + .03 * math.sin(t * 2))
    label_box(f, "NO FEELING IN HIS RIGHT ARM", W / 2, 760, window(t, L[3] + .3, tl - .2, .4, .3), 50)
    small_note(f, "William: he could not speak of it without tears", W / 2, 840, window(t, S.at(3, "William later"), tl - .2, .4, .3), 40)
    headline(f, "LEPROSY", t, tl, 1e9, y=820, size=110, grad=("#ffd0c0", "#c0392b"))
    flash(f, t, tl, (180, 30, 20), .6, .3)
    return f

def mask_icon(f, x, y, a, s=1.0):
    if a <= 0: return
    ov = f.copy()
    cv2.ellipse(ov, (int(x), int(y)), (int(110 * s), int(140 * s)), 0, 0, 360, (196, 200, 206), -1, cv2.LINE_AA)
    cv2.ellipse(ov, (int(x), int(y)), (int(110 * s), int(140 * s)), 0, 0, 360, (90, 94, 100), 5, cv2.LINE_AA)
    for sx in (-1, 1): cv2.ellipse(ov, (int(x + sx * 42 * s), int(y - 25 * s)), (int(26 * s), int(12 * s)), 0, 0, 360, (20, 20, 24), -1, cv2.LINE_AA)
    cv2.line(ov, (int(x), int(y - 10 * s)), (int(x), int(y + 40 * s)), (120, 124, 130), 4, cv2.LINE_AA)
    cv2.ellipse(ov, (int(x), int(y + 70 * s)), (int(30 * s), int(6 * s)), 0, 0, 360, (40, 40, 44), -1, cv2.LINE_AA)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)

def s_king(t, S):
    L = S.L
    if t < L[1] - .2:
        f = parch_bg(t, True, 1.0, 1.05, S.D)
        embers(f, t, 50, 43, (255, 200, 110), speed=35)
        tc = S.at(0, "crowned")
        show_portrait(f, "baldwin", W / 2, 470, t, .2, L[1] - .3, 460)
        cy = lerp(-100, 190, ease_out((t - tc + .6) / 1.0))
        blit(f, icon("crown", 160), W / 2, cy, prog(t, tc - .6, .4) * window(t, 0, L[1] - .3, .1, .4))
        plate(f, "KING BALDWIN IV", "Crowned in the Church of the Holy Sepulchre", W / 2, 770, t, tc, L[1] - .3)
        label_box(f, "AGE 13", W / 2, 900, window(t, S.at(0, "thirteen"), L[1] - .3, .3, .4), 60, GOLD)
        datestamp(f, "15 JULY 1174", t, S.at(0, "On the fifteenth"), L[1] - .4)
        small_note(f, "King Amalric dies", 1580, 160, window(t, S.at(0, "died"), tc - .3, .3, .4), 44)
        return f
    if t < L[2] - .2:
        m = levant_map(); P = lambda k: m.proj(LL[k])
        jx, jy = P("jerusalem")
        tm = S.at(1, "And films")
        if t < tm - .2:
            c = cam_path(t, [(L[1] - .2, (jx - 250, jy - 300, .62)), (tm, (jx - 150, jy - 250, .75))])
            f = c.render(m.img)
            # kingdom strip
            strip = [(34.9, 33.1), (35.6, 33.2), (35.9, 32.4), (35.9, 31.0), (35.4, 29.6), (34.9, 29.6), (34.3, 31.3), (34.6, 32.2)]
            pts = c.pts([m.proj(p) for p in strip])
            ov = f.copy(); cv2.fillPoly(ov, [(pts * 8).astype(np.int32)], (180, 40, 40), cv2.LINE_AA, 3)
            aa = prog(t, L[1] + .5, .8) * .35
            cv2.addWeighted(ov, aa, f, 1 - aa, 0, f)
            cv2.polylines(f, [(pts * 8).astype(np.int32)], True, (140, 30, 30), 4, cv2.LINE_AA, 3)
            city(f, c, m, "jerusalem", "JERUSALEM", t, L[1] + .2)
            x, y = c.pt(m.proj((36.6, 31.9)))
            label_box(f, "DESERT", x, y, prog(t, S.at(1, "the desert") - .3, .4), 46)
            x, y = c.pt(m.proj((33.9, 32.4)))
            label_box(f, "SEA", x, y, prog(t, S.at(1, "the sea") - .3, .4), 46)
            fi = prog(t, L[1] - .2, .5)
            if fi < 1: dim(f, 1 - fi)
            return f
        f = parch_bg(t, True, 1.0, 1.05, S.D)
        mask_icon(f, W / 2, 440, window(t, tm - .2, L[2] - .3, .4, .4), 1 + .02 * math.sin(t * 2))
        crossmark(f, W / 2, 440, t, S.at(1, "But no source") + .3, 170)
        label_box(f, "THE SILVER MASK?", W / 2, 150, window(t, tm, L[2] - .3, .4, .4), 66, GOLD)
        small_note(f, "No source from his lifetime mentions one — it comes from modern film", W / 2, 720, window(t, S.at(1, "But no source"), L[2] - .3, .4, .4), 42)
        return f
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    embers(f, t, 40, 47, (230, 170, 90), speed=30)
    show_portrait(f, "baldwin", 560, 470, t, L[2] - .2, 1e9, 420)
    blit(f, icon("swords", 220), 1340, 400, window(t, S.at(2, "sword") - .4, 1e9, .4, .3), back_out((t - S.at(2, "sword") + .4) / .5))
    label_box(f, "GUIDED HIS HORSE WITH HIS KNEES", 1340, 600, window(t, S.at(2, "knees") - .3, 1e9, .4, .3), 44)
    small_note(f, "(by some accounts)", 1340, 660, window(t, S.at(2, "knees"), 1e9, .4, .3), 36)
    headline(f, "NO HIDING FROM DUTY", t, S.at(2, "And who refused"), 1e9, y=880, size=70)
    return f

def s_saladin(t, S):
    L = S.L
    if t < L[1] - .2:
        f = parch_bg(t, True, 1.0, 1.05, S.D)
        embers(f, t, 40, 51, (160, 230, 160), speed=30)
        show_portrait(f, "saladin", W / 2, 440, t, .3, L[1] - .3, 480)
        ta = S.at(0, "History knows")
        blit(f, text_sprite("SALAH AD-DIN YUSUF", "cinzel", 64, GOLD, 800, stroke=2, glow="#000000", spacing=6), W / 2, 780, window(t, S.at(0, "Salah") - .2, ta - .2, .4, .3))
        blit(f, text_sprite("SALADIN", "cinzel", 110, GOLD, 900, stroke=3, gradient=("#e8ffe0", "#4aa86a"), glow="#000000", spacing=12), W / 2, 790, window(t, ta + .5, L[1] - .3, .4, .4))
        return f
    m = levant_map(); P = lambda k: m.proj(LL[k])
    cx_, cy_ = P("cairo"); dx_, dy_ = P("damascus"); jx, jy = P("jerusalem")
    keys = [(L[1] - .2, ((cx_ + jx) / 2, (cy_ + jy) / 2 + 100, .5)), (S.at(1, "In eleven"), ((cx_ + dx_) / 2, (cy_ + dy_) / 2, .45)),
            (L[2], (jx + 100, jy - 150, .5)), (S.D, (jx + 60, jy - 100, .58))]
    c = cam_path(t, keys); f = c.render(m.img)
    fi = prog(t, L[1] - .2, .5)
    # Egypt glow
    ge = prog(t, S.at(1, "Egypt") - .5, 1.5)
    if ge > 0:
        x, y = c.pt(m.proj((31.0, 29.8)))
        ov = f.copy(); cv2.circle(ov, (int(x), int(y)), int(330 * c.z / .45 * ge), GREEN, -1, cv2.LINE_AA)
        cv2.addWeighted(ov, .28, f, .72, 0, f)
    gd = prog(t, S.at(1, "Damascus") - .3, 1.5)
    if gd > 0:
        x, y = c.pt(m.proj((37.0, 33.6)))
        ov = f.copy(); cv2.circle(ov, (int(x), int(y)), int(280 * c.z / .45 * gd), GREEN, -1, cv2.LINE_AA)
        cv2.addWeighted(ov, .28, f, .72, 0, f)
    city(f, c, m, "cairo", "CAIRO", t, L[1] + .2, "l", (38, 96, 66), size=46, r=13)
    x, y = c.pt(P("cairo"))
    small_note(f, "Master of Egypt", x, y + 60, window(t, S.at(1, "Egypt"), 1e9, .4, .3), 38)
    city(f, c, m, "damascus", "DAMASCUS · 1174", t, S.at(1, "Damascus") - .2, "r", (38, 96, 66), size=46, r=13)
    city(f, c, m, "jerusalem", "JERUSALEM", t, L[1] + .4, "l", size=40)
    blit(f, portrait("saladin", 180), 150, 150, window(t, L[1], 1e9, .4, .3))
    ts = S.at(2, "surrounded")
    if t > L[2]:
        for k, (a_, b_, mid) in enumerate(((P("cairo"), m.proj((34.3, 31.0)), m.proj((33.0, 30.0))), (P("damascus"), m.proj((35.7, 33.0)), m.proj((36.4, 33.0))), (P("damascus"), m.proj((36.0, 31.4)), m.proj((36.9, 32.3))))):
            arrow(f, c.pts(bezier(a_, mid, b_, 40)), prog(t, L[2] + .3 + k * .4, 1.6, ease_io), GREEN, 14, head=36)
        headline(f, "SURROUNDED", t, ts - .3, 1e9, y=160, size=96, grad=("#e8ffe0", "#3a9a5a"))
    if fi < 1: dim(f, 1 - fi)
    return f

def s_gamble(t, S):
    L = S.L; m = levant_map(); P = lambda k: m.proj(LL[k])
    jx, jy = P("jerusalem"); hx, hy = P("harim"); cx_, cy_ = P("cairo"); ax, ay = P("arish")
    keys = [(0, (jx + 200, jy - 300, .55)), (L[1] + 2, (jx + 300, hy + 420, .42)), (L[2], (jx + 150, jy - 300, .42)),
            (L[2] + 1, ((cx_ + jx) / 2, (cy_ + jy) / 2 - 100, .5)), (S.D, (ax + 150, ay - 80, .7))]
    c = cam_path(t, keys); f = c.render(m.img)
    datestamp(f, "AUTUMN 1177", t, .3, L[1] - .2)
    city(f, c, m, "jerusalem", "JERUSALEM", t, .3, "l")
    # Philip arrives at Acre
    tp = S.at(1, "Count Philip")
    x, y = c.pt(P("acre"))
    for k in range(5): blit(f, ship_icon(46, "#2b4e7a"), x - 260 + k * 40 * prog(t, tp - .5, 1.5), y - 10 + 14 * (k % 2), prog(t, tp - .5, .4))
    city(f, c, m, "acre", "ACRE", t, tp - .3, "r", size=38)
    label_box(f, "PHILIP OF FLANDERS", x - 180, y + 60, window(t, tp, L[2] - .2, .4, .4), 36)
    # march north
    tn = S.at(1, "marched far")
    rr = route(m, ["jerusalem", "acre", "tripoli", "harim"], 40, .06)
    pm = prog(t, tn - 1.0, 3.2, ease_io)
    arrow(f, c.pts(rr), pm, FR, 14, head=36)
    full = c.pts(rr); Lf = polyline_len(full)
    for k in range(4):
        fk = clamp(pm - k * .04)
        if fk <= 0: continue
        idx = min(len(full) - 1, int(np.searchsorted(Lf, fk * Lf[-1])))
        unit(f, full[idx][0] + 30, full[idx][1] + 20 * (k % 2), 70, 26, FR)
    if pm > .9:
        city(f, c, m, "harim", "HARIM", t, tn + 2.0, "r", size=40)
    city(f, c, m, "tripoli", "TRIPOLI", t, S.at(1, "Tripoli"), "l", size=36)
    headline(f, "THE ARMY MARCHES NORTH", t, S.at(1, "Harim") - .5, L[2] - .3, y=150, size=64)
    # Saladin across the desert
    if t > L[2] - .2:
        city(f, c, m, "cairo", "CAIRO", t, L[2] - .2, "l", (38, 96, 66), size=42, r=12)
        r2 = route(m, ["cairo", "arish", "gaza"], 50, -.08)
        arrow(f, c.pts(r2), prog(t, S.at(2, "he crossed") - .3, 3.5, ease_io), GREEN, 16, head=40)
        datestamp(f, "18 NOVEMBER 1177", t, S.at(2, "eighteenth"), S.D)
        tb = S.at(2, "he left")
        x, y = c.pt(P("arish"))
        if t > tb:
            a = window(t, tb, S.D, .4, .4)
            for k in range(6):
                bx_, by_ = x - 50 + (k % 3) * 34, y + 40 + (k // 3) * 26
                cv2.rectangle(f, (int(bx_ - 14), int(by_ - 10)), (int(bx_ + 14), int(by_ + 10)), (120, 84, 40), -1)
                cv2.rectangle(f, (int(bx_ - 14), int(by_ - 10)), (int(bx_ + 14), int(by_ + 10)), (40, 24, 10), 2)
            label_box(f, "BAGGAGE LEFT AT AL-ARISH", x, y + 130, a, 40)
        blit(f, portrait("saladin", 170), W - 160, 170, window(t, L[2], 1e9, .4, .3))
    return f

def s_ascalon(t, S):
    L = S.L; m = south_map(); P = lambda k: m.proj(LL[k])
    jx, jy = P("jerusalem"); ax, ay = P("ascalon"); gx, gy = P("gaza")
    keys = [(0, ((jx + ax) / 2, (jy + ay) / 2, .55)), (L[1], (ax + 100, ay + 120, .62)), (L[2], (ax + 250, ay, .6)), (S.D, (ax + 450, ay - 100, .62))]
    c = cam_path(t, keys); f = c.render(m.img)
    city(f, c, m, "jerusalem", "JERUSALEM", t, .3, "u")
    # baldwin ride
    rr = route(m, ["jerusalem", "blanche", "ascalon"], 40, .05)
    pb = prog(t, S.at(0, "rode to") - 1.2, 3.0, ease_io)
    arrow(f, c.pts(rr), pb, FR, 14, head=36)
    xa, ya = c.pt(P("ascalon"))
    blit(f, icon("castle", 150), xa, ya - 20, prog(t, S.at(0, "Ascalon") - .4, .4))
    label_box(f, "ASCALON", xa - 90, ya - 20, prog(t, S.at(0, "Ascalon") - .2, .4), 44, CREAM, "r")
    tk = S.at(0, "about three")
    if t > tk:
        a = window(t, tk, L[1] + 2, .4, .4)
        counter(f, min(375, 375 * ease_out((t - tk) / 1.4)), 300, 700, 150, a=a)
        label_box(f, "KNIGHTS", 300, 810, a, 44)
    blit(f, portrait("baldwin", 170), W - 150, 160, window(t, .4, 1e9, .4, .3))
    # templars cut off at gaza
    tt = S.at(1, "The Templars")
    x, y = c.pt(P("gaza"))
    if t > tt - .3:
        for k in range(3): unit(f, x - 30 + k * 30, y + 10, 34, 20, WHITE)
        label_box(f, "TEMPLARS AT GAZA", x - 60, y + 10, window(t, tt - .3, L[2], .4, .4), 36, CREAM, "r")
        crossmark(f, x + 30, (y + ya) / 2 + 30, t, S.at(1, "cut off"), 34)
    # saladin army arrives
    ts = S.at(1, "When Saladin")
    pa = prog(t, ts - .5, 2.5, ease_io)
    if pa > 0:
        for k in range(10):
            ang = math.radians(150 + k * 14)
            p0 = (gx - 200 + (k % 3) * 60, gy + 250 + (k // 3) * 40)
            p1 = (P("ascalon")[0] + 230 * math.cos(ang) + 120, P("ascalon")[1] - 230 * math.sin(ang) * -1 + 40)
            p1 = (P("ascalon")[0] + 120 + (k % 4) * 80, P("ascalon")[1] + 90 + (k // 4) * 80)
            xx, yy = c.pt(lerp2(p0, p1, pa)); unit(f, xx, yy, 60, 24, GREEN)
        datestamp(f, "22 NOVEMBER 1177", t, ts, L[2] - .3)
    tw = S.at(1, "pulled his men")
    if t > tw and t < L[2]:
        label_box(f, "BACK INSIDE THE WALLS", xa, ya - 130, window(t, tw, L[2], .3, .4), 40, GOLD)
    # Saladin turns to Jerusalem
    if t > L[2] - .2:
        r2 = bezier((P("ascalon")[0] + 320, P("ascalon")[1] - 60), ((P("ascalon")[0] + jx) / 2 + 100, P("ascalon")[1] - 200), P("ramla"), 40)
        arrow(f, c.pts(r2), prog(t, S.at(2, "turned") - .5, 2.5, ease_io), GREEN, 16, head=40)
        th = S.at(2, "harmless")
        label_box(f, "“HARMLESS”", xa, ya - 140, window(t, th - .2, 1e9, .4, .3), 50, "#c8f0c8")
        blit(f, portrait("saladin", 150), 150, H - 170, window(t, L[2] - .2, 1e9, .4, .3))
    return f

def s_raid(t, S):
    L = S.L; m = south_map(); P = lambda k: m.proj(LL[k])
    rx, ry = P("ramla"); jx, jy = P("jerusalem"); ax, ay = P("ascalon")
    keys = [(0, (rx - 30, ry + 60, 1.15)), (S.at(0, "Prisoners"), (rx - 30, ry + 80, 1.05)), (L[1], (jx - 200, jy, .7)), (L[2], ((rx + ax) / 2, (ry + ay) / 2, .55)), (S.D, ((rx + ax) / 2 - 50, (ry + ay) / 2, .6))]
    c = cam_path(t, keys); f = c.render(m.img)
    fill_alpha(f, (40, 10, 0), .12)
    # raiding parties
    center = (rx + 60, ry + 200)
    for k in range(12):
        ang = k / 12 * 6.283 + .3
        p0 = center; p1 = (center[0] + 420 * math.cos(ang), center[1] + 300 * math.sin(ang))
        pk = prog(t, .6 + k * .25, 2.5, ease_io)
        if pk <= 0: continue
        arrow(f, c.pts(bezier(p0, ((p0[0] + p1[0]) / 2 + 40, (p0[1] + p1[1]) / 2 - 40), p1, 20)), pk, GREEN, 7, head=20)
    for k, nm, ph, sd in (("ramla", "RAMLA", "Ramla", 1), ("lydda", "LYDDA", "Lydda", 2)):
        t0 = S.at(0, ph)
        x, y = c.pt(P(k))
        fires(f, x, y, t, prog(t, t0 - .5, .8), sd, 50)
        city(f, c, m, k, nm, t, t0 - .3, "l" if k == "ramla" else "r", size=40)
    xj, yj = city(f, c, m, "jerusalem", "JERUSALEM", t, .3, "u", pulse=True)
    city(f, c, m, "jaffa", "JAFFA", t, S.at(0, "fled") - .2, "l", (40, 70, 130), size=36)
    if t > S.at(0, "fled"):
        arrow(f, c.pts(bezier(P("ramla"), (P("ramla")[0] - 100, P("ramla")[1] - 80), P("jaffa"), 20)), prog(t, S.at(0, "fled"), 1.2), (40, 70, 130), 6, dashed=True, head=18)
    headline(f, "THE LAND BURNS", t, .8, L[1] - .3, y=150, size=76, grad=("#ffd0b0", "#d0502a"))
    headline(f, "THE ROAD TO JERUSALEM LOOKS OPEN", t, L[1] + .1, L[2] - .3, y=150, size=60)
    if t > L[2] - .2:
        label_box(f, "NOT ONE ARMY — A DOZEN RAIDING PARTIES", W / 2, H - 180, window(t, L[2] - .2, 1e9, .4, .3), 50, "#c8f0c8")
        tb = S.at(2, "baggage")
        small_note(f, "baggage far behind", W / 2, H - 115, window(t, tb, 1e9, .4, .3), 40)
        xa, ya = c.pt(P("ascalon"))
        blit(f, icon("castle", 120), xa, ya - 20, 1.0)
        tw = S.at(2, "no one was")
        if t > tw:
            ov = f.copy(); cv2.circle(ov, (int(xa), int(ya)), int(110 + 10 * math.sin(t * 5)), (230, 190, 90), 6, cv2.LINE_AA)
            cv2.addWeighted(ov, prog(t, tw, .4), f, 1 - prog(t, tw, .4), 0, f)
            label_box(f, "ASCALON", xa, ya + 80, prog(t, tw, .4), 40, GOLD)
    return f

def s_breakout(t, S):
    L = S.L; m = south_map(); P = lambda k: m.proj(LL[k])
    ax, ay = P("ascalon"); mx, my = P("montgisard")
    keys = [(0, (ax + 100, ay - 50, .75)), (L[1], ((ax + mx) / 2, (ay + my) / 2, .62)), (L[2], (mx - 50, my, .75)), (S.D, (mx, my - 20, 1.0))]
    c = cam_path(t, keys); f = c.render(m.img)
    xa, ya = c.pt(P("ascalon"))
    blit(f, icon("castle", int(120)), xa, ya - 20, 1.0)
    rr = route(m, ["ascalon", (34.62, 31.76), (34.74, 31.84), "montgisard"], 30, .04)
    pb = prog(t, .6, L[2] - .6, ease_io)
    arrow(f, c.pts(rr), pb, FR, 16, head=42)
    full = c.pts(rr); Lf = polyline_len(full)
    for k in range(5):
        fk = clamp(pb - k * .035)
        if fk <= 0: continue
        idx = min(len(full) - 1, int(np.searchsorted(Lf, fk * Lf[-1])))
        col = WHITE if (k >= 3 and t > S.at(0, "The Templar")) else FR
        unit(f, full[idx][0] - 20 + 34 * (k % 2), full[idx][1] + 26, 60, 24, col)
    # portraits
    show_portrait(f, "baldwin", 170, 180, t, .3, 1e9, 200)
    show_portrait(f, "raynald", 400, 180, t, S.at(0, "Raynald") - .2, 1e9, 200)
    small_note(f, "Raynald of Châtillon", 400, 300, window(t, S.at(0, "Raynald"), L[1], .4, .4), 34)
    show_portrait(f, "odo", 630, 180, t, S.at(0, "Odo") - .4, 1e9, 200)
    small_note(f, "Odo of Saint-Amand · Templars", 630, 300, window(t, S.at(0, "Odo"), L[1] + 1, .4, .4), 34)
    tf = S.at(1, "few thousand")
    label_box(f, "+ A FEW THOUSAND FOOT SOLDIERS?", W / 2, H - 230, window(t, tf - .3, L[2] - .3, .4, .4), 44)
    label_box(f, "UNSEEN", W / 2, H - 300, window(t, S.at(1, "unseen") - .2, L[2] - .3, .3, .4), 56, GOLD)
    # green army scattered near montgisard
    for k in range(9):
        p = (mx + 120 + (k % 3) * 110 + 20 * math.sin(t + k), my - 60 + (k // 3) * 90)
        x, y = c.pt(p); unit(f, x, y, 50 * c.z / .62 * .6 + 10, 20, GREEN, angle=15 * math.sin(k))
    if t > L[2] - .2:
        x, y = c.pt(P("montgisard"))
        marker(f, x, y, S.at(2, "Montgisard") - .4, t, (190, 140, 30), 16)
        label_box(f, "MONTGISARD", x - 30, y - 70, prog(t, S.at(2, "Montgisard") - .2, .4), 50, GOLD, "r")
        city(f, c, m, "ramla", "RAMLA", t, S.at(2, "near Ramla") - .2, "r", size=40)
        datestamp(f, "25 NOVEMBER 1177", t, S.at(2, "twenty-fifth"), S.D)
    return f

@functools.lru_cache(None)
def cross_glow():
    g = np.zeros((H, W, 3), np.float32); cv2.circle(g, (W // 2, 420), 200, (255, 200, 110), -1, cv2.LINE_AA)
    return cv2.GaussianBlur(g, (0, 0), 70)

def s_cross(t, S):
    L = S.L
    f = parch_bg(t, True, 1.0, 1.08, S.D)
    dim(f, .35)
    ra = window(t, .3, 1e9, .8, .3)
    cx, cy = W / 2, 420
    if ra > 0:
        sw, sh_ = W // 4, H // 4
        ov = np.zeros((sh_, sw, 3), np.uint8)
        for k in range(24):
            ang = math.radians(k * 15 + t * 6)
            p1 = (int(sw / 2 + 240 * math.cos(ang)), int(cy / 4 + 240 * math.sin(ang)))
            p2 = (int(sw / 2 + 240 * math.cos(ang + .07)), int(cy / 4 + 240 * math.sin(ang + .07)))
            cv2.fillPoly(ov, [np.array([[sw // 2, int(cy / 4)], p1, p2], np.int32)], (255, 220, 140), cv2.LINE_AA)
        ov = cv2.resize(ov, (W, H), interpolation=cv2.INTER_LINEAR)
        cv2.add(f, (ov.astype(np.float32) * .12 * ra).astype(np.uint8), f)
        cv2.add(f, (cross_glow() * .55 * ra).astype(np.uint8), f)
    embers(f, t, 50, 61, (255, 220, 140), speed=25)
    rise = 1 - ease_out((t - .3) / 2.0)
    blit(f, icon("truecross", 380), cx, cy + 80 * rise, ra)
    blit(f, text_sprite("ACCORDING TO THE CHRISTIAN ACCOUNTS", "cinzel", 36, GOLD, 700, stroke=2, glow="#000000", spacing=6), W / 2, 80, window(t, .3, S.D, .5, .5))
    label_box(f, "THE TRUE CROSS", W / 2, 720, window(t, S.at(0, "True Cross") - .3, L[1] - .3, .4, .4), 70, GOLD)
    if t > L[1] - .3:
        kneel = prog(t, S.at(1, "He knelt"), 1.2, ease_io) * (1 - prog(t, L[2], 1.0, ease_io))
        show_portrait(f, "baldwin", W / 2, 780 + 40 * kneel, t, L[1] - .2, 1e9, 280, breathe=False)
        small_note(f, "the sick young king kneels and prays", W / 2, 960, window(t, S.at(1, "He knelt"), L[2] - .2, .4, .4), 42)
    tc = S.at(2, "charge")
    headline(f, "CHARGE!", t, tc - .3, 1e9, y=960, size=110, grad=("#ffe0c0", "#d04020"))
    flash(f, t, tc - .2, (255, 230, 180), .5, .35)
    return f

@functools.lru_cache(None)
def field_map():
    BW, BH = 3840, 2160
    img = parchment(BW, BH, 91).copy()
    hill = fbm(BH, BW, 94, 5, 4)
    img = (img.astype(np.float32) * (0.9 + .16 * hill[..., None])).astype(np.uint8)
    # warm dry tint
    img = np.clip(img.astype(np.float32) * np.array([1.04, .98, .9]), 0, 255).astype(np.uint8)
    # hill contours (Montgisard)
    hx, hy = 1250, 900
    for k in range(6):
        cv2.ellipse(img, (hx, hy), (420 - k * 62, 260 - k * 40), -10, 0, 360, (150, 112, 70), 4, cv2.LINE_AA)
    # wadi / stream
    wadi = bezier((2050, -50), (2300, 700), (2150, 1300), 80, (2400, 2250))
    cv2.polylines(img, [(wadi * 8).astype(np.int32)], False, (70, 90, 92), 70, cv2.LINE_AA, 3)
    cv2.polylines(img, [(wadi * 8).astype(np.int32)], False, (104, 140, 142), 48, cv2.LINE_AA, 3)
    # mud patches
    rng = np.random.default_rng(7)
    for _ in range(120):
        x, y = 2150 + rng.normal(0, 260), 1300 + rng.normal(0, 380)
        cv2.ellipse(img, (int(x), int(y)), (int(rng.uniform(20, 50)), int(rng.uniform(8, 16))), 0, 0, 360, (112, 92, 62), -1, cv2.LINE_AA)
    # olive trees
    for _ in range(160):
        x, y = rng.uniform(0, BW), rng.uniform(0, BH)
        if abs(x - 2200) < 350 or (abs(x - hx) < 450 and abs(y - hy) < 300): continue
        s = rng.uniform(14, 22)
        cv2.circle(img, (int(x), int(y)), int(s), (112, 118, 74), -1, cv2.LINE_AA); cv2.circle(img, (int(x - 3), int(y - 4)), int(s * .6), (140, 146, 96), -1, cv2.LINE_AA)
    # road to Ramla
    road = bezier((-50, 1500), (1200, 1450), (3900, 600), 80)
    cv2.polylines(img, [(road * 8).astype(np.int32)], False, (150, 118, 80), 30, cv2.LINE_AA, 3)
    for s, x, y, sz in (("MONTGISARD", hx, hy - 330, 54), ("STREAM", 2420, 380, 36), ("TO RAMLA", 3500, 560, 40), ("MUD", 2500, 1600, 40)):
        blit(img, text_sprite(s, "cinzel", sz, "#3a2614", 800, shadow=False, spacing=5), x, y, .85)
    return img, (hx, hy)

def s_battle(t, S):
    L = S.L; img, (hx, hy) = field_map()
    keys = [(0, (1800, 1150, .7)), (2.6, (2150, 1150, .9)), (L[1], (2450, 1100, 1.0)), (L[2], (2250, 1150, .85)), (L[3], (2600, 1150, .7)), (S.D, (2800, 1150, .72))]
    c = cam_path(t, keys); f = c.render(img)
    ch = prog(t, .4, 3.0, ease_io)
    rout = prog(t, L[3], 3.0, ease_io)
    z = c.z
    # muslim army: disordered formations east of the stream
    rng = np.random.default_rng(5)
    base = [(2250 + rng.uniform(-80, 520), 650 + i * 70 + rng.uniform(-20, 20), rng.uniform(-25, 25)) for i in range(13)]
    for i, (x, y, ang) in enumerate(base):
        x2 = x + 700 * rout; y2 = y + 160 * rout * (1 if i % 2 else -1)
        if ch > .7 and i % 4 == 0: x2 += 60 * prog(t, 1.5, 1.0)
        xx, yy = c.pt((x2, y2))
        hit = clamp((ch - .6) * 2) * (1 if x < 2450 else .4)
        formation(f, xx, yy, 170 * z, 70 * z, GREEN, t, angle=ang + 90, strength=1 - .35 * hit, rout=rout,
                  flag=(i % 4 == 1), emblem="crescent", seed=10 + i, alpha=1.0)
    # saladin + mamluk guard
    sp = (2620 + 700 * rout, 1150); sx, sy = c.pt(sp)
    if t > L[1] - .3:
        a = window(t, L[1] - .3, 1e9, .4, .3) * (1 - rout)
        formation(f, sx, sy + 120 * z, 220 * z, 70 * z, (190, 150, 50), t, angle=0, flag=True, flag_color=(200, 160, 40),
                  emblem="crescent", seed=40, alpha=a, label=None)
        live_portrait(f, "saladin", sx, sy - 40, 130, t, alpha=a, angry=True, seed=2)
        small_note(f, "Mamluk guard", sx, sy + 210 * z, window(t, S.at(1, "mamluks") - .3, L[2], .4, .4) * (1 - rout), 36)
    # frankish charge from the west (knights red, templars white)
    for i in range(7):
        y0 = 820 + i * 105
        a0 = (900, y0); a1 = (2050 + (i % 2) * 40, y0 + 40); a2 = (2350 + 300 * rout + (i % 2) * 40, y0 + 40)
        p = lerp2(a0, a1, ch) if rout <= 0 else lerp2(a1, a2, rout)
        xx, yy = c.pt(p)
        tem = i in (1, 4)
        formation(f, xx, yy, 150 * z, 70 * z, WHITE if tem else FR, t, angle=90, kind="cav", flag=(i in (0, 1, 4)),
                  flag_color=(232, 226, 210) if tem else (165, 30, 34), emblem="cross", seed=60 + i)
    tc = 2.6
    if ch > .6 and rout < 1:
        x, y = c.pt((2120, 1200)); rr = np.random.default_rng(int(t * 12))
        for _ in range(18):
            ox, oy = rr.uniform(-60, 60) * z / .6, rr.uniform(-450, 450) * z / .6
            cv2.line(f, (int(x + ox), int(y + oy)), (int(x + ox + rr.uniform(-15, 15)), int(y + oy - rr.uniform(10, 30))), (255, 235, 160), 2, cv2.LINE_AA)
        impact_ring(f, x, y, t, tc, 260, (255, 220, 150), .7)
    headline(f, "TOTAL SURPRISE", t, S.at(0, "surprise") - .4, L[1] - .3, y=140, size=80)
    locator(f, south_map(), LL["montgisard"], t, w=300, alpha=window(t, .3, L[1] - .5, .5, .5), box_deg=.25, label="MONTGISARD")
    ta = S.at(1, "Among the dead")
    if ta - .2 < t < L[2] - .2:
        a = window(t, ta - .2, L[2] - .4, .4, .4)
        live_portrait(f, "taqi", W - 280, H - 240, 200, t, alpha=a, grey=True, bob=False)
        small_note(f, "† Ahmad, son of Taqi al-Din", W - 280, H - 100, a, 36, "#f0d0c0")
    if L[2] - .2 < t < L[3] - .2:
        a = window(t, L[2] - .2, L[3] - .4, .4, .4)
        live_portrait(f, "baldwin", 200, H - 250, 220, t, alpha=a, angry=True, seed=1)
        blit(f, icon("hand", 130), 380, H - 220, window(t, S.at(2, "bandages") - .4, L[3] - .4, .4, .4))
        small_note(f, "bandaged hands — according to later accounts", 520, H - 100, window(t, S.at(2, "bandages"), L[3] - .4, .4, .4), 34, anchor="l")
        live_portrait(f, "raynald", 200, 160, 140, t, alpha=window(t, S.at(2, "Raynald") - .3, L[3] - .4, .4, .4), seed=3)
        live_portrait(f, "odo", 360, 160, 140, t, alpha=window(t, S.at(2, "Templars") - .3, L[3] - .4, .4, .4), seed=4)
    headline(f, "THE ARMY BROKE", t, L[3] + .1, 1e9, y=140, size=96, grad=("#ffe0c0", "#d04020"))
    flash(f, t, L[3], (255, 200, 140), .5, .25)
    if rout > 0: grade(f, red=.25 * window(t, L[3], L[3] + 2, .3, 1.5))
    f = shake(f, t, tc, 7, .4)
    f = shake(f, t, L[3], 9, .5)
    return f

def s_camel(t, S):
    L = S.L
    if t < L[2] - .2:
        night = prog(t, L[1] + 2, 3.0)
        f = desert_scene(t, "dusk", riders=0, blend=("night", night))
        # camel fleeing right->left with dust
        if t < L[1] + 1:
            x = lerp(W + 150, -200, clamp((t - .5) / (L[1] + .5)))
            y = 640 + 8 * math.sin(t * 10)
            ov = f.copy()
            for k in range(14):
                cv2.circle(ov, (int(x + 120 + k * 30), int(y + 90 - 6 * k * .3)), int(30 + k * 4), (200, 150, 100), -1, cv2.LINE_AA)
            ov = cv2.GaussianBlur(ov, (0, 0), 10)
            cv2.addWeighted(ov, .5, f, .5, 0, f)
            blit(f, icon("camel", 240), x, y, 1.0, 1.0, rot=0)
            # pursuing knights (small)
            for k in range(5):
                kx = x + 520 + k * 110; ky = 700 + 5 * math.sin(t * 9 + k)
                cv2.ellipse(f, (int(kx), int(ky)), (26, 12), 0, 0, 360, (40, 24, 16), -1, cv2.LINE_AA)
                cv2.circle(f, (int(kx - 6), int(ky - 32)), 8, (40, 24, 16), -1, cv2.LINE_AA)
                cv2.line(f, (int(kx - 5), int(ky - 24)), (int(kx - 4), int(ky - 10)), (40, 24, 16), 8, cv2.LINE_AA)
                cv2.line(f, (int(kx - 30), int(ky - 36)), (int(kx + 10), int(ky - 26)), (40, 24, 16), 3, cv2.LINE_AA)
            label_box(f, "ESCAPE ON A RACING CAMEL", W / 2, 160, window(t, S.at(0, "racing camel") - .4, L[1] + .5, .4, .4), 62, GOLD)
            small_note(f, "— the English chronicler Ralph de Diceto", W / 2, 240, window(t, S.at(0, "An English") , L[1] + .5, .4, .4), 38)
        else:
            tm = S.at(1, "twelve")
            counter(f, min(12, 12 * ease_out((t - tm + .3) / 1.2)) if t > tm - .3 else 0, W / 2, 330, 200, a=window(t, tm - .3, S.at(1, "Then came") - .2, .3, .4))
            label_box(f, "MILES OF PURSUIT", W / 2, 470, window(t, tm, S.at(1, "Then came") - .2, .3, .4), 56)
            tr = S.at(1, "winter rain")
            if t > tr - .5:
                rr = np.random.default_rng(int(t * 24)); a = prog(t, tr - .5, 1.0)
                ov = f.copy()
                for _ in range(260):
                    x0, y0 = rr.uniform(0, W), rr.uniform(0, H)
                    cv2.line(ov, (int(x0), int(y0)), (int(x0 - 8), int(y0 + 34)), (170, 180, 200), 1, cv2.LINE_AA)
                cv2.addWeighted(ov, .6 * a, f, 1 - .6 * a, 0, f)
            label_box(f, "DESERT · RAIN · MUD", W / 2, 400, window(t, S.at(1, "Then came"), L[2] - .3, .4, .4), 64, "#e0d0b0")
            small_note(f, "many never made it home", W / 2, 490, window(t, S.at(1, "many of"), L[2] - .3, .4, .4), 44)
        return f
    m = levant_map(); P = lambda k: m.proj(LL[k])
    cx_, cy_ = P("cairo"); mx, my = P("montgisard")
    c = cam_path(t, [(L[2] - .2, ((cx_ + mx) / 2 + 100, (cy_ + my) / 2, .55)), (S.D, ((cx_ + mx) / 2, (cy_ + my) / 2 + 40, .6))])
    f = c.render(m.img)
    fi = prog(t, L[2] - .2, .5)
    r = route(m, ["montgisard", "arish", "cairo"], 40, -.06)
    arrow(f, c.pts(r), prog(t, L[2], 3.0, ease_io), GREEN, 10, dashed=True, head=30)
    city(f, c, m, "cairo", "CAIRO", t, L[2] + 1.0, "l", GREEN, size=44, r=13)
    city(f, c, m, "jerusalem", "JERUSALEM", t, L[2], "r")
    datestamp(f, "8 DECEMBER 1177", t, S.at(2, "eighth") - .3, S.D)
    tf = S.at(2, "only a fraction")
    if t > tf - .3:
        a = window(t, tf - .3, 1e9, .4, .3)
        for i in range(20):
            x = 300 + (i % 10) * 70; y = 140 + (i // 10) * 70
            keep = i in (0, 11)
            col = GREEN if keep else (90, 90, 80)
            cv2.circle(f, (x, y), 22, col, -1, cv2.LINE_AA); cv2.circle(f, (x, y), 22, (20, 12, 6), 3, cv2.LINE_AA)
        label_box(f, "ONLY A FRACTION RETURNED", 300 + 315, 300, a, 46, "#c8f0c8")
    blit(f, portrait("saladin", 170, True), W - 160, 170, window(t, L[2], 1e9, .4, .3))
    if fi < 1: dim(f, 1 - fi)
    return f

def s_aftermath(t, S):
    L = S.L
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    embers(f, t, 40, 71, (255, 170, 80), speed=35)
    if t < L[1] - .2:
        a = window(t, .2, L[1] - .3, .4, .4)
        tk = S.at(0, "eleven hundred")
        v = int(min(1100, 1100 * ease_out((t - tk + .3) / 1.4))) if t > tk - .3 else 0
        blit(f, text_sprite(f"{v:,}", "cinzel", 180, CREAM, 900, stroke=4, gradient=("#ffd0c0", "#c0392b"), glow="#000000"), 600, 430, a)
        label_box(f, "KILLED", 600, 570, a, 52)
        tw = S.at(0, "seven hundred")
        counter(f, min(750, 750 * ease_out((t - tw + .3) / 1.4)) if t > tw - .3 else 0, W - 600, 430, 180, a=window(t, tw - .3, L[1] - .3, .4, .4))
        label_box(f, "WOUNDED", W - 600, 570, window(t, tw - .3, L[1] - .3, .4, .4), 52)
        headline(f, "A COSTLY VICTORY", t, .4, L[1] - .3, y=180, size=78)
        small_note(f, "figures from a report by the Grand Master of the Hospitallers", W / 2, 720, window(t, 1.0, L[1] - .3, .4, .4), 36)
        return f
    if t < L[2] - .2:
        a = window(t, L[1] - .2, L[2] - .3, .4, .4)
        label_box(f, "HOW BIG WAS SALADIN'S ARMY?", W / 2, 170, a, 60, GOLD)
        x0 = 760; y1, y2 = 420, 640
        p = prog(t, L[1] + .5, 1.5, ease_io)
        cv2.rectangle(f, (x0, y1 - 40), (int(x0 + 950 * p), y1 + 40), (40, 110, 70), -1); cv2.rectangle(f, (x0, y1 - 40), (int(x0 + 950 * p), y1 + 40), (20, 12, 6), 3)
        small_note(f, "William of Tyre: 26,000", x0 - 30, y1, a, 40, anchor="r")
        q = prog(t, S.at(1, "But even") - .5, 1.5, ease_io)
        cv2.rectangle(f, (x0, y2 - 40), (int(x0 + 420 * q), y2 + 40), (90, 140, 100), -1); cv2.rectangle(f, (x0, y2 - 40), (int(x0 + 420 * q), y2 + 40), (20, 12, 6), 3)
        small_note(f, "modern estimates: far fewer", x0 - 30, y2, window(t, S.at(1, "But even") - .5, L[2] - .3, .4, .4), 40, anchor="r")
        cv2.rectangle(f, (x0, 820 - 30), (int(x0 + 60 * q), 820 + 30), (165, 30, 34), -1)
        small_note(f, "the Franks: still heavily outnumbered", x0 + 90, 820, window(t, S.at(1, "heavily") - .3, L[2] - .3, .4, .4), 40, anchor="l")
        dim(f, 0)
        return f
    tsal = S.at(2, "And Saladin")
    if t < tsal - .2:
        blit(f, icon("monastery", 320), W / 2, 420, window(t, L[2] - .2, tsal - .3, .4, .4), back_out((t - L[2]) / .6))
        label_box(f, "MONASTERY OF SAINT CATHERINE", W / 2, 680, window(t, S.at(2, "Saint Catherine") - .3, tsal - .3, .4, .4), 54, GOLD)
        small_note(f, "founded on the battlefield · her feast day: 25 November", W / 2, 760, window(t, S.at(2, "whose feast") - .3, tsal - .3, .4, .4), 40)
        return f
    show_portrait(f, "saladin", 560, 470, t, tsal - .2, 1e9, 380)
    show_portrait(f, "baldwin", W - 560, 470, t, tsal + .4, 1e9, 380)
    headline(f, "NEVER UNDERESTIMATE THE LEPER KING", t, S.at(2, "Never") - .2, 1e9, y=860, size=62)
    return f

def s_ending(t, S):
    L = S.L
    if t < L[1] - .2 or (L[2] - .2 <= t < L[3] - .2):
        f = parch_bg(t, True, 1.0, 1.05, S.D)
        embers(f, t, 40, 81, (230, 170, 90), speed=30)
        g = prog(t, S.at(2, "died") - .3, 1.2)
        show_portrait(f, "baldwin", W / 2, 430, t, .2 if t < L[1] else L[2] - .2, 1e9, 440, grey=g)
        if t < L[1] - .2:
            label_box(f, "BLIND · CARRIED INTO BATTLE ON A LITTER", W / 2, 760, window(t, S.at(0, "lost his sight") - .3, L[1] - .3, .4, .4), 46)
            small_note(f, "eight more years of fighting", W / 2, 840, window(t, S.at(0, "eight more") - .3, L[1] - .3, .4, .4), 42)
        else:
            blit(f, text_sprite("† 1185", "cinzel", 90, "#e8c8c0", 900, stroke=3, glow="#000000", spacing=6), W / 2, 760, window(t, S.at(2, "died") - .2, 1e9, .4, .3))
            label_box(f, "AGE 23", W / 2, 870, window(t, S.at(2, "twenty-three") - .3, 1e9, .4, .3), 60, GOLD)
        return f
    if t < L[2] - .2:
        m = levant_map(); P = lambda k: m.proj(LL[k])
        jx, jy = P("jacobsford")
        c = cam_path(t, [(L[1] - .2, (jx, jy + 150, .7)), (L[2], (jx - 50, jy, .95))])
        f = c.render(m.img)
        fi = prog(t, L[1] - .2, .5)
        datestamp(f, "1179", t, L[1], L[2] - .3)
        x, y = c.pt(P("marj"))
        blit(f, icon("swords", 110), x, y, prog(t, S.at(1, "Marj") - .4, .4))
        label_box(f, "MARJ AYYUN", x + 70, y - 10, prog(t, S.at(1, "Marj") - .2, .4), 40, "#c8f0c8", "l")
        x, y = c.pt(P("jacobsford"))
        td = S.at(1, "destroyed")
        blit(f, icon("castle", 130), x, y, window(t, td - .5, 1e9, .4, .3) * (1 - .6 * prog(t, td + .5, 1.0)))
        if t > td: fires(f, x, y, t, prog(t, td, .6), 5, 70)
        label_box(f, "JACOB'S FORD", x - 80, y + 20, prog(t, S.at(1, "Jacob") - .2, .4), 40, "#ffd0c0", "r")
        headline(f, "THE BALANCE SHIFTS", t, S.at(1, "The balance") - .2, 1e9, y=150, size=76, grad=("#e8ffe0", "#3a9a5a"))
        blit(f, portrait("saladin", 180), W - 160, H - 180, window(t, L[1], 1e9, .4, .3))
        if fi < 1: dim(f, 1 - fi)
        return f
    if t < L[4] - .3:
        m = levant_map(); P = lambda k: m.proj(LL[k])
        hx, hy = P("hattin")
        c = cam_path(t, [(L[3] - .2, (hx, hy + 200, .5)), (L[4], (hx, hy, .9))])
        f = c.render(m.img)
        fill_alpha(f, (60, 0, 0), .15 * prog(t, S.at(3, "Horns"), 1.0))
        r = route(m, ["damascus", "hattin"], 40, .1)
        arrow(f, c.pts(r), prog(t, L[3] + .3, 2.5, ease_io), GREEN, 18, head=46)
        city(f, c, m, "damascus", "DAMASCUS", t, L[3] - .1, "r", GREEN, size=44, r=13)
        x, y = c.pt(P("hattin"))
        marker(f, x, y, S.at(3, "Horns") - .3, t, (200, 30, 30), 18)
        label_box(f, "HORNS OF HATTIN · 1187", x - 40, y + 90, prog(t, S.at(3, "Horns") - .2, .4), 56, "#ffd0c0")
        blit(f, portrait("saladin", 200), W - 180, 190, window(t, L[3], 1e9, .4, .3))
        fi = prog(t, L[3] - .2, .5)
        if fi < 1: dim(f, 1 - fi)
        tn = S.at(3, "there was no")
        if t > tn:
            blit(f, portrait("baldwin", 200, True), 180, 190, window(t, tn, 1e9, .4, .3))
            crossmark(f, 180, 190, t, tn + .5, 80)
        return f
    # end screen
    f = parch_bg(t, True, 1.0, 1.04, 30)
    embers(f, t, 40, 37, (255, 170, 80), speed=30)
    a = prog(t, L[4] - .3, .6)
    x0, y0, x1, y1 = 150, 300, 150 + 960, 300 + 540
    ov = f.copy(); cv2.rectangle(ov, (x0, y0), (x1, y1), (20, 12, 6), -1); cv2.addWeighted(ov, .55 * a, f, 1 - .55 * a, 0, f)
    cv2.rectangle(f, (x0, y0), (x1, y1), (214, 170, 80), 4, cv2.LINE_AA)
    blit(f, text_sprite("WATCH NEXT", "cinzel", 44, GOLD, 800, stroke=2, glow="#000000", spacing=8), (x0 + x1) / 2, y0 - 50, a)
    blit(f, text_sprite("THE BATTLE OF HATTIN", "cinzel", 54, CREAM, 800, stroke=2, glow="#000000", spacing=3), (x0 + x1) / 2, (y0 + y1) / 2 - 30, a)
    blit(f, text_sprite("1187", "cinzel", 70, GOLD, 900, stroke=2, glow="#000000"), (x0 + x1) / 2, (y0 + y1) / 2 + 60, a)
    sx, sy = 1500, 570
    pulse = 1 + .05 * math.sin(t * 4)
    cv2.circle(f, (sx, sy - 120), 130, (40, 22, 12), -1, cv2.LINE_AA)
    blit(f, icon("crown", 170), sx, sy - 120, a)
    btn = text_sprite("SUBSCRIBE", "sans", 54, "#ffffff", None, shadow=False, spacing=2)
    bw, bh = btn[0].shape[1] - 40, 100
    ov = f.copy(); cv2.rectangle(ov, (int(sx - bw / 2), int(sy + 80)), (int(sx + bw / 2), int(sy + 80 + bh)), (204, 0, 0), -1)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)
    blit(f, btn, sx, sy + 130, a, pulse)
    blit(f, text_sprite("HISTORY SOURCED", "cinzel", 50, GOLD, 800, stroke=2, glow="#000000", spacing=6), sx, sy + 260, a)
    return f

SCENE_FUNCS = {"cold_open": s_cold_open, "title": s_title, "boy": s_boy, "king": s_king, "saladin": s_saladin,
               "gamble": s_gamble, "ascalon": s_ascalon, "raid": s_raid, "breakout": s_breakout, "cross": s_cross,
               "battle": s_battle, "camel": s_camel, "aftermath": s_aftermath, "ending": s_ending}
