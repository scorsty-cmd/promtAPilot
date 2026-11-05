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

# ======================================================= HATTIN 1187 (Crusades series #2)
GOLDC = (196, 150, 40)         # Raymond / Tripoli
BLUE = (42, 74, 138)           # Guy / royal
LL.update({"sephoria": (35.28, 32.75), "tiberias": (35.535, 32.79), "turan": (35.38, 32.775), "hattin": (35.445, 32.80),
           "hspring": (35.465, 32.815), "meskana": (35.41, 32.785), "cresson": (35.30, 32.70), "nazareth": (35.30, 32.70),
           "sinnabra": (35.575, 32.71), "ashtara": (36.0, 32.80), "kerak": (35.70, 31.18), "sidon": (35.37, 33.56),
           "beirut": (35.50, 33.89), "arsuf": (34.81, 32.20), "tyre": (35.20, 33.27)})

@functools.lru_cache(None)
def galilee_map():
    m = GeoMap(35.40, 32.78, 1.0, res="10m", seed=31)
    rng = np.random.default_rng(4)
    for _ in range(140):   # dry scrub dots
        x, y = rng.uniform(0, m.BW), rng.uniform(0, m.BH)
        if np.abs(m.img[int(y), int(x)].astype(int) - np.array(hexc("#31454c"))).sum() < 90: continue
        cv2.circle(m.img, (int(x), int(y)), int(rng.uniform(4, 8)), (150, 130, 80), -1, cv2.LINE_AA)
    hills(m, 35.2, 35.5, 32.62, 32.95, 70, 9, 40)
    for lab in [("SEA OF GALILEE", 35.59, 32.83, 44, "#3a2614", False, 6, True), ("GALILEE", 35.30, 32.92, 70),
                ("MEDITERRANEAN", 34.98, 32.98, 44, "#3a2614", False, 6, True), ("R. JORDAN", 35.66, 32.62, 30, "#3a2614", False, 4, True)]:
        m.label(*lab)
    return m

@functools.lru_cache(None)
def hattin_field():
    BW, BH = 3840, 2160
    img = parchment(BW, BH, 121).copy()
    hill = fbm(BH, BW, 124, 5, 4)
    img = (img.astype(np.float32) * (0.9 + .16 * hill[..., None]) * np.array([1.05, .99, .88])).clip(0, 255).astype(np.uint8)
    # lake on the east
    lake = np.array([[3350, -50], [3200, 500], [3260, 1000], [3150, 1500], [3300, 2250], [3950, 2250], [3950, -50]], np.float32)
    cv2.fillPoly(img, [(lake * 8).astype(np.int32)], (64, 104, 124), cv2.LINE_AA, 3)
    for k in range(6):
        sh = lake.copy(); sh[:, 0] += 30 + k * 34
        cv2.polylines(img, [(sh[1:5] * 8).astype(np.int32)], False, (88, 130, 148), 2, cv2.LINE_AA, 3)
    cv2.polylines(img, [(lake[:5] * 8).astype(np.int32)], False, (58, 40, 24), 5, cv2.LINE_AA, 3)
    # escarpment down to the lake
    for k in range(5):
        cv2.polylines(img, [(np.array([[3050 - k * 30, 0], [2950 - k * 30, 700], [3000 - k * 30, 1400], [2900 - k * 30, 2160]], np.float32) * 8).astype(np.int32)], False, (150, 112, 70), 3, cv2.LINE_AA, 3)
    # Horns of Hattin (two peaks)
    for (hx, hy) in ((2050, 880), (2330, 820)):
        for k in range(6):
            cv2.ellipse(img, (hx, hy), (230 - k * 34, 150 - k * 22), -8, 0, 360, (140, 100, 62), 4, cv2.LINE_AA)
        cv2.ellipse(img, (hx, hy), (40, 26), -8, 0, 360, (120, 84, 50), -1, cv2.LINE_AA)
    # springs of Hattin + village
    sx, sy = 2700, 520
    cv2.ellipse(img, (sx, sy), (90, 50), 0, 0, 360, (70, 120, 140), -1, cv2.LINE_AA)
    cv2.ellipse(img, (sx, sy), (90, 50), 0, 0, 360, (40, 30, 20), 3, cv2.LINE_AA)
    for k in range(7):
        cv2.rectangle(img, (sx - 160 + k * 40, sy - 160 + (k % 2) * 20), (sx - 130 + k * 40, sy - 130 + (k % 2) * 20), (120, 90, 60), -1)
    # dry grass strokes
    rng = np.random.default_rng(12)
    for _ in range(2600):
        x, y = rng.uniform(0, 3150), rng.uniform(0, BH)
        if (x - 2050) ** 2 / 260 ** 2 + (y - 880) ** 2 / 170 ** 2 < 1 or (x - 2330) ** 2 / 260 ** 2 + (y - 820) ** 2 / 170 ** 2 < 1: continue
        cv2.line(img, (int(x), int(y)), (int(x + rng.uniform(-6, 6)), int(y - rng.uniform(10, 22))), (176, 146, 84), 2, cv2.LINE_AA)
    # road Sephoria -> Tiberias
    road = bezier((-50, 1500), (1200, 1350), (3100, 1250), 80, (2300, 1500))
    cv2.polylines(img, [(road * 8).astype(np.int32)], False, (156, 124, 84), 26, cv2.LINE_AA, 3)
    for s, x, y, sz in (("HORNS OF HATTIN", 2190, 600, 50), ("SPRINGS OF HATTIN", 2700, 400, 38), ("SEA OF GALILEE", 3600, 1100, 46),
                        ("TO TIBERIAS", 3000, 1380, 34), ("FROM SEPHORIA & TURAN", 380, 1600, 34), ("DRY PLATEAU", 1100, 1750, 44)):
        blit(img, text_sprite(s, "cinzel", sz, "#3a2614", 800, shadow=False, spacing=5), x, y, .85)
    return img

def parch(t, S, dark=True): return parch_bg(t, dark, 1.0, 1.06, S.D)

def gal(t, keys):
    m = galilee_map(); c = cam_path(t, keys); return m, c, c.render(m.img)

def water_icon(f, x, y, a=1.0, s=1.0, col=(70, 150, 210)):
    if a <= 0: return
    ov = f.copy()
    cv2.circle(ov, (int(x), int(y + 8 * s)), int(20 * s), col, -1, cv2.LINE_AA)
    cv2.fillPoly(ov, [(np.array([[x - 17 * s, y], [x, y - 34 * s], [x + 17 * s, y]]) * 8).astype(np.int32)], col, cv2.LINE_AA, 3)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)
    cv2.circle(f, (int(x - 6 * s), int(y + 4 * s)), max(1, int(5 * s)), (220, 240, 255), -1, cv2.LINE_AA)

def tent_bg_draw(f, t, color=(110, 30, 26), seed=0):
    """interior of a tent at night: draped walls, candle glow (cheap: cached base + flicker)."""
    base = _tent_base(color)
    f[:] = base
    fl = .85 + .15 * math.sin(t * 9 + seed) * math.sin(t * 5.1)
    g = _tent_glow()
    cv2.add(f, (g * fl).astype(np.uint8), f)

@functools.lru_cache(None)
def _tent_base(color):
    img = np.zeros((H, W, 3), np.float32)
    col = np.array(color, np.float32)
    xs = np.arange(W)[None, :]
    folds = .75 + .25 * np.sin(xs / 70.0) ** 2
    yy = np.linspace(0, 1, H)[:, None]
    img[:] = (col * folds[..., None] * (.55 + .45 * (1 - yy))[..., None])
    # floor
    img[int(H * .78):] = np.array([46, 30, 20], np.float32)
    cv2.line(img, (0, int(H * .78)), (W, int(H * .78)), (20, 12, 8), 4)
    # tent poles
    for x in (200, W - 200):
        cv2.rectangle(img, (x - 10, 0), (x + 10, int(H * .8)), (60, 40, 24), -1)
    v = vignette(.75).astype(np.float32)
    img = img * (v[..., None] if v.ndim == 2 else v)
    return np.clip(img, 0, 255).astype(np.uint8)

@functools.lru_cache(None)
def _tent_glow():
    g = np.zeros((H, W, 3), np.float32)
    for x in (360, W - 360):
        cv2.circle(g, (x, 560), 160, (255, 170, 80), -1, cv2.LINE_AA)
    g = cv2.GaussianBlur(g, (0, 0), 120) * .55
    return g

def candle(f, x, y, t, seed=0):
    cv2.rectangle(f, (int(x - 10), int(y)), (int(x + 10), int(y + 70)), (230, 220, 190), -1)
    fl = 1 + .15 * math.sin(t * 11 + seed)
    cv2.ellipse(f, (int(x), int(y - 16)), (int(8 * fl), int(18 * fl)), 0, 0, 360, (255, 190, 80), -1, cv2.LINE_AA)
    cv2.ellipse(f, (int(x), int(y - 12)), (4, 9), 0, 0, 360, (255, 245, 200), -1, cv2.LINE_AA)

def along(pts, p):
    Lf = polyline_len(pts); idx = min(len(pts) - 1, int(np.searchsorted(Lf, clamp(p) * Lf[-1])))
    return pts[idx]

# ======================================================= SCENES
def s_cold_open(t, S):
    L = S.L
    if t < L[1] - .2:
        f = desert_scene(t, "dawn", riders=prog(t, 1.5, 4.0), ride_dir=-1)
        smoke(f, t, .35 * prog(t, 1.0, 3.0), seed=1, speed=40)
        a = window(t, .3, L[1] - .3, .8, .5)
        blit(f, text_sprite("4 JULY 1187", "cinzel", 100, CREAM, 800, stroke=3, glow="#000000", spacing=14), W / 2, 330, a, .95 + .05 * ease_out((t - .3) / 2))
        small_note(f, "a dry plateau in Galilee", W / 2, 440, window(t, S.at(0, "A dry") - .2, L[1] - .3, .5, .5), 50)
        return f
    if t < L[2] - .2:
        m = galilee_map(); P = lambda k: m.proj(LL[k])
        hx, hy = P("meskana"); lx, ly = m.proj((35.59, 32.82))
        c = cam_path(t, [(L[1] - .2, (hx + 150, hy, .9)), (L[2], ((hx + lx) / 2 + 60, hy - 20, .75))])
        f = c.render(m.img)
        x1, y1 = c.pt((lx, ly))
        g = prog(t, L[1] + .5, 1.0)
        ov = f.copy(); cv2.circle(ov, (int(x1), int(y1)), int(230 * g), (90, 170, 220), -1, cv2.LINE_AA); cv2.addWeighted(ov, .25 * g, f, 1 - .25 * g, 0, f)
        for k in range(5):
            water_icon(f, x1 - 120 + k * 60, y1 - 40 + 20 * math.sin(t * 2 + k), prog(t, S.at(1, "Fresh") - .3 + k * .12, .3), 1.0)
        x0, y0 = c.pt((hx, hy))
        marker(f, x0, y0, L[1], t, (165, 30, 34), 16)
        arrow(f, [(x0 + 30, y0), (x1 - 150, y1 + 10)], prog(t, S.at(1, "only a few") - .3, 1.2), (214, 170, 80), 8, head=26, dashed=True)
        label_box(f, "ONLY A FEW MILES", (x0 + x1) / 2 - 40, (y0 + y1) / 2 - 70, window(t, S.at(1, "only a few"), L[2] - .3, .4, .4), 44, GOLD)
        fi = prog(t, L[1] - .2, .5)
        if fi < 1: dim(f, 1 - fi)
        return f
    img = hattin_field()
    c = cam_path(t, [(L[2] - .2, (1150, 1250, .85)), (L[3], (1250, 1200, .72)), (L[4] - .2, (1500, 1150, .6))])
    f = c.render(img)
    z = c.z
    th = prog(t, L[3], 3.0)
    for i in range(6):
        x, y = c.pt((900 + (i % 3) * 250, 1100 + (i // 3) * 190))
        formation(f, x, y, 210 * z, 90 * z, FR if i != 4 else WHITE, t * .3, angle=0, kind="cav" if i in (0, 2) else "inf",
                  flag=i in (1, 4), emblem="cross", flag_color=(165, 30, 34) if i != 4 else (232, 226, 210), seed=200 + i, strength=1 - .15 * th)
    if t > L[3] - .3:
        a = prog(t, L[3] - .3, 2.0)
        for k in range(12):
            ang = k / 12 * 6.283
            r = lerp(1100, 560, a)
            x, y = c.pt((1130 + r * math.cos(ang) * 1.3, 1200 + r * math.sin(ang) * .8))
            formation(f, x, y, 180 * z, 72 * z, GREEN, t, angle=math.degrees(ang) + 90, kind="cav", flag=k % 4 == 0, emblem="crescent", seed=300 + k, alpha=a)
        fl = [c.pt((300 + k * 90, 1900 - k * 10 + 20 * math.sin(k))) for k in range(14)]
        fire_line(f, fl, t, prog(t, S.at(3, "burning") - .3, .6), 3, 50 * z / .7)
    smoke(f, t, .15 + .35 * prog(t, S.at(3, "smoke") - .5, 1.5), seed=2, speed=70)
    thirst_meter(f, lerp(.25, .06, prog(t, L[2], 8)), t, window(t, S.at(2, "thirst") - .4, L[4] - .3, .4, .4), x=110, y=760, h=300)
    tc = S.at(2, "largest army")
    label_box(f, "THE LARGEST ARMY THE KINGDOM EVER FIELDED", W / 2, 120, window(t, tc - .2, L[3] - .3, .4, .4), 50)
    headline(f, "DYING OF THIRST", t, S.at(2, "dying") - .2, L[3] - .3, y=H - 150, size=86, grad=("#ffe0c8", "#c0392b"))
    show_portrait(f, "saladin", W - 170, 170, t, S.at(3, "Saladin") - .3, L[4] - .3, 230)
    if t > L[4] - .3:
        dim(f, .5 * prog(t, L[4] - .3, .6))
        tg = S.at(4, "And the kingdom")
        headline(f, "BY EVENING: GONE", t, L[4] - .2, tg - .1, y=380, size=96)
        headline(f, "AND THE KINGDOM WITH IT", t, tg - .1, S.at(4, "This is how") - .2, y=380, size=80, grad=("#ffe0c8", "#c0392b"))
        td = S.at(4, "This is how")
        show_portrait(f, "guy", W / 2 - 260, 450, t, td, 1e9, 340)
        show_portrait(f, "gerard", W / 2 + 260, 450, t, td + .4, 1e9, 340)
        headline(f, "ONE DECISION. TAKEN AT NIGHT.", t, S.at(4, "one decision") - .1, 1e9, y=780, size=70)
    return f

def s_title(t, S):
    f = parch_bg(t, True, 1.0, 1.1, 4)
    embers(f, t, 80, 3, (255, 150, 60), speed=70, size=3)
    water_icon(f, W / 2, 300, prog(t, .05, .4), 2.2, (200, 60, 40))
    a = prog(t, .1, .5)
    sc = 1.15 - .15 * ease_out((t - .1) / 1.2)
    blit(f, text_sprite("HATTIN", "cinzel", 200, CREAM, 900, stroke=4, gradient=("#fff6d8", "#c94a26"), glow="#ff6a2a", spacing=20), W / 2, 520, a, sc)
    p = prog(t, .5, .8)
    if p > 0:
        cv2.line(f, (int(W / 2 - 560 * p), 660), (int(W / 2 + 560 * p), 660), (214, 170, 80), 4, cv2.LINE_AA)
    blit(f, text_sprite("1187  ·  HOW THIRST KILLED A KINGDOM", "cinzel", 52, CREAM, 600, stroke=2, glow="#000000", spacing=6), W / 2, 735, prog(t, .8, .6))
    blit(f, text_sprite("THE CRUSADES · PART 2", "cinzel", 32, GOLD, 700, stroke=2, glow="#000000", spacing=10), W / 2, 820, prog(t, 1.2, .6))
    return f

def s_recap(t, S):
    L = S.L
    f = parch(t, S)
    embers(f, t, 30, 11, (230, 170, 90), speed=30)
    if t < L[1] - .2:
        show_portrait(f, "baldwin", 620, 450, t, .2, L[1] - .3, 420)
        show_portrait(f, "saladin", W - 620, 450, t, .6, L[1] - .3, 340, grey=.0)
        label_box(f, "PREVIOUSLY: MONTGISARD 1177", W / 2, 130, window(t, .3, L[1] - .3, .4, .4), 56, GOLD)
        label_box(f, "VICTORY", 620, 730, window(t, S.at(0, "humiliated") - .3, L[1] - .3, .3, .4), 60, "#fff1d0")
        crossmark(f, W - 620, 450, t, S.at(0, "humiliated"), 120)
        return f
    if t < L[2] - .2:
        g = prog(t, S.at(1, "died") - .2, 1.2)
        show_portrait(f, "baldwin", 620, 440, t, L[1] - .2, L[2] - .3, 400, grey=g)
        blit(f, text_sprite("† 1185 · AGE 23", "cinzel", 60, "#e8c8c0", 900, stroke=3, glow="#000000", spacing=4), 620, 740, window(t, S.at(1, "eleven eighty-five") - .3, L[2] - .3, .4, .4))
        tn = S.at(1, "His little")
        blit(f, icon("crown", 170), W - 560, 380, window(t, tn - .3, L[2] - .3, .4, .4) * (1 - .6 * prog(t, tn + 1.5, .8)))
        label_box(f, "BALDWIN V · CHILD KING", W - 560, 540, window(t, tn - .2, L[2] - .3, .4, .4), 46)
        blit(f, text_sprite("† 1186", "cinzel", 60, "#e8c8c0", 900, stroke=3, glow="#000000"), W - 560, 640, window(t, S.at(1, "year after") - .3, L[2] - .3, .4, .4))
        return f
    tc = S.at(2, "despised")
    cy = lerp(-120, 300, ease_out((t - L[2]) / 1.4))
    blit(f, icon("crown", 220), W / 2, cy, window(t, L[2] - .2, 1e9, .3, .3))
    show_portrait(f, "guy", W / 2, 560, t, L[2] + 1.0, 1e9, 400)
    headline(f, "A KING MANY BARONS DESPISED", t, tc - .3, 1e9, y=880, size=66)
    return f

def s_guy(t, S):
    L = S.L
    if t < L[2] - .2:
        f = parch(t, S)
        embers(f, t, 30, 21, (230, 170, 90), speed=30)
        if t < L[1] - .2:
            show_portrait(f, "guy", W / 2, 420, t, .2, L[1] - .3, 440)
            plate(f, "GUY OF LUSIGNAN", "a newcomer from Poitou, France", W / 2, 700, t, .5, L[1] - .3)
            ts = S.at(0, "Sibylla")
            label_box(f, "+ SIBYLLA, BALDWIN'S SISTER", W / 2, 820, window(t, ts - .3, S.at(0, "In eleven") - .1, .4, .4), 46, GOLD)
            datestamp(f, "1186", t, S.at(0, "In eleven"), L[1] - .4)
            tk = S.at(0, "crowned him")
            cy = lerp(60, 175, ease_out((t - tk + .3) / .8))
            blit(f, icon("crown", 130), W / 2, cy, window(t, tk - .3, L[1] - .3, .3, .4))
            headline(f, "KING GUY", t, tk + .3, L[1] - .3, y=820, size=74)
            return f
        live_portrait(f, "guy", 520, 420, 360, t, alpha=window(t, L[1] - .2, L[2] - .3, .4, .4), seed=1)
        live_portrait(f, "raymond", W - 520, 420, 420, t, alpha=window(t, L[1] + .3, L[2] - .3, .4, .4), seed=2)
        plate(f, "RAYMOND III OF TRIPOLI", "the most experienced lord in the East", W - 520, 700, t, L[1] + .5, L[2] - .3)
        blit(f, text_sprite("RIVALS", "cinzel", 90, GOLD, 900, stroke=3, glow="#000000", spacing=10), W / 2, 420, window(t, S.at(1, "rival") - .2, L[2] - .3, .3, .4), 1 + .04 * math.sin(t * 3))
        te = S.at(1, "Eschiva")
        blit(f, icon("castle", 130), W - 520, 870, window(t, S.at(1, "Tiberias") - .3, L[2] - .3, .4, .4))
        small_note(f, "lord of Tiberias through his wife Eschiva", W - 520, 975, window(t, te - .3, L[2] - .3, .4, .4), 36)
        return f
    m = levant_map(); P = lambda k: m.proj(LL[k])
    jx, jy = P("jerusalem"); tx, ty = P("tripoli")
    c = cam_path(t, [(L[2] - .2, ((jx + tx) / 2 + 150, (jy + ty) / 2, .55)), (S.D, ((jx + tx) / 2 + 250, (jy + ty) / 2 + 40, .6))])
    f = c.render(m.img)
    a1 = prog(t, L[2], .8) * .3
    king = [(34.95, 33.25), (35.6, 33.3), (35.9, 32.4), (35.9, 31.0), (35.4, 29.6), (34.9, 29.6), (34.3, 31.3), (34.6, 32.2)]
    trip = [(35.6, 33.95), (36.4, 34.2), (36.3, 34.9), (35.8, 34.9), (35.6, 34.4)]
    gall = [(35.2, 32.6), (35.6, 32.6), (35.65, 33.0), (35.25, 33.05)]
    for poly, col, aa in ((king, BLUE, a1), (trip, GOLDC, prog(t, L[2] + 1, .8) * .4), (gall, GOLDC, prog(t, L[2] + 1.6, .8) * .5)):
        pts = c.pts([m.proj(p) for p in poly])
        ov = f.copy(); cv2.fillPoly(ov, [(pts * 8).astype(np.int32)], col, cv2.LINE_AA, 3); cv2.addWeighted(ov, aa, f, 1 - aa, 0, f)
        if aa > 0: cv2.polylines(f, [(pts * 8).astype(np.int32)], True, col, 3, cv2.LINE_AA, 3)
    city(f, c, m, "jerusalem", "JERUSALEM", t, L[2] + .2, "l", BLUE, size=40)
    city(f, c, m, "tripoli", "TRIPOLI", t, L[2] + .8, "l", GOLDC, size=40)
    city(f, c, m, "tiberias", "TIBERIAS", t, L[2] + 1.4, "r", GOLDC, size=36)
    city(f, c, m, "damascus", "DAMASCUS", t, S.at(2, "own truce") - .4, "r", GREEN, size=40)
    blit(f, portrait("guy", 170), 150, H - 170, window(t, L[2], 1e9, .4, .3))
    blit(f, portrait("raymond", 170), 150, 170, window(t, L[2] + .6, 1e9, .4, .3))
    th = S.at(2, "own truce")
    x, y = c.pt(((P("tiberias")[0] + P("damascus")[0]) / 2, (P("tiberias")[1] + P("damascus")[1]) / 2))
    blit(f, icon("handshake", 150), x, y - 40, window(t, th - .3, S.at(2, "The kingdom") - .1, .4, .4), back_out((t - th + .3) / .5))
    label_box(f, "RAYMOND'S OWN TRUCE WITH SALADIN", W / 2 + 120, H - 150, window(t, th, S.at(2, "The kingdom") - .1, .4, .4), 44, "#c8f0c8")
    headline(f, "ON THE EDGE OF CIVIL WAR", t, S.at(2, "The kingdom") - .2, 1e9, y=H - 150, size=72, grad=("#ffe0c8", "#c0392b"))
    fi = prog(t, L[2] - .2, .5)
    if fi < 1: dim(f, 1 - fi)
    return f

def s_raynald(t, S):
    L = S.L
    if t < L[2] - .2:
        m = levant_map(); P = lambda k: m.proj(LL[k])
        kx, ky = P("kerak"); cx_, cy_ = P("cairo"); dx_, dy_ = P("damascus")
        if t < L[1] - .2:
            c = cam_path(t, [(0, (kx - 100, ky - 50, .7)), (L[1], (kx, ky, .85))])
        else:
            c = cam_path(t, [(L[1] - .2, (kx, ky, .85)), (L[1] + 2, (kx + 100, ky - 50, .55)), (L[2], (kx + 150, ky - 80, .5))])
        f = c.render(m.img)
        x, y = c.pt((kx, ky))
        blit(f, icon("castle", 150), x, y - 20, prog(t, S.at(0, "Kerak") - .5, .4), back_out((t - S.at(0, "Kerak") + .5) / .5))
        label_box(f, "KERAK", x + 100, y - 20, prog(t, S.at(0, "Kerak") - .3, .4), 50, GOLD, "l")
        show_portrait(f, "raynald", 330, 230, t, .2, 1e9, 300)
        plate(f, "RAYNALD OF CHÂTILLON", None, 330, 420, t, .5, L[1] - .3)
        small_note(f, "he charged at Montgisard", 330, 470, window(t, S.at(0, "Montgisard") - .3, L[1] - .3, .4, .4), 36)
        if t > L[1] - .2:
            r = [m.proj(LL["cairo"]), m.proj((33.6, 30.2)), m.proj((35.0, 30.4)), m.proj((35.8, 31.0)), m.proj((36.2, 32.4)), m.proj(LL["damascus"])]
            rr = c.pts(np.array(bezier(r[0], r[2], r[3], 40, r[5])))
            arrow(f, rr, 1.0, (214, 190, 140), 6, head=1, dashed=True)
            pc = prog(t, L[1], 5.0)
            stop = S.at(1, "attacked")
            pc = min(pc, .62) if t > stop else pc
            for k in range(4):
                px, py = along(rr, pc - k * .025)
                blit(f, icon("camel", 70), px, py - 30, 1.0 if t < stop + .8 else 1 - prog(t, stop + .8, .8))
            label_box(f, "CARAVAN", rr[len(rr) // 3][0], rr[len(rr) // 3][1] + 60, window(t, L[1] + .4, stop, .4, .4), 40)
            if t > stop - .4:
                px, py = along(rr, .62)
                arrow(f, [(x, y), (px + 10, py)], prog(t, stop - .4, .8), FR, 14, head=36)
                impact_ring(f, px, py, t, stop + .4, 120, (255, 200, 140), .7)
                label_box(f, "DURING A TRUCE", W / 2, H - 140, window(t, S.at(1, "During") , L[2], .3, .4), 64, "#ffd0c0")
                small_note(f, "its people taken prisoner", px, py + 90, window(t, S.at(1, "prisoner") - .3, L[2], .4, .4), 38)
        return f
    f = parch(t, S)
    embers(f, t, 50, 31, (255, 160, 60), speed=40)
    tr = S.at(2, "Raynald refused")
    live_portrait(f, "saladin", 560, 450, 420, t, alpha=window(t, L[2] - .2, 1e9, .4, .3), angry=t > tr, seed=1)
    live_portrait(f, "raynald", W - 560, 450, 340, t, alpha=window(t, L[2] + .3, 1e9, .4, .3), seed=2)
    label_box(f, "RELEASE THE PRISONERS", 560, 760, window(t, L[2] + .2, tr - .1, .3, .3), 46)
    label_box(f, "REFUSED", W - 560, 760, window(t, tr - .1, S.at(2, "And Saladin") - .1, .3, .3), 64, "#ffd0c0")
    to = S.at(2, "swore")
    headline(f, "THE OATH", t, to - .2, 1e9, y=140, size=96, grad=("#ffe0c8", "#c0392b"))
    small_note(f, "to kill Raynald with his own hand", W / 2, 230, window(t, S.at(2, "kill him") - .3, 1e9, .4, .3), 46)
    if t > S.at(2, "kill him"):
        crossmark(f, W - 560, 450, t, S.at(2, "kill him") + .4, 110)
    flash(f, t, to, (180, 30, 20), .6, .3)
    return f

def s_cresson(t, S):
    L = S.L
    m = galilee_map(); P = lambda k: m.proj(LL[k])
    cx_, cy_ = P("cresson")
    if t < L[2] - .2:
        c = cam_path(t, [(0, (cx_ + 200, cy_ - 100, .6)), (L[1], (cx_ + 40, cy_, 1.0)), (L[2], (cx_ + 80, cy_, 1.15))])
    else:
        c = cam_path(t, [(L[2] - .2, (cx_ + 80, cy_, 1.15)), (S.D, (cx_ + 120, cy_, 1.25))])
    f = c.render(m.img); z = c.z
    datestamp(f, "1 MAY 1187", t, .4, L[1] - .3)
    x, y = c.pt((cx_, cy_))
    water_icon(f, x, y + 10, prog(t, S.at(0, "Springs") - .3, .4), 1.0)
    label_box(f, "SPRINGS OF CRESSON", x, y + 80, prog(t, S.at(0, "Springs") - .2, .4) * (1 - .7 * prog(t, L[1], .5)), 48, GOLD)
    city(f, c, m, "sephoria", "SEPHORIA", t, .6, "l", size=36)
    rout = prog(t, L[2] + .5, 3.0, ease_io)
    hit = prog(t, S.at(1, "charged") + .8, 1.0)
    if t > L[1] - .3:
        # Templars charging from the west
        p = prog(t, S.at(1, "charged") - .3, 1.6, ease_io)
        tx_, ty_ = c.pt((cx_ - 260 + 300 * p, cy_ - 60))
        formation(f, tx_, ty_, 150 * z, 60 * z, WHITE, t, angle=90, kind="cav", flag=True, emblem="cross", flag_color=WHITE, seed=11,
                  strength=1 - .9 * rout, rout=rout * .6)
        for k in range(8):
            gx, gy = c.pt((cx_ + 300 + (k % 4) * 110 - 120 * hit * (k % 2), cy_ - 260 + (k // 4) * 380 + 100 * hit * (1 if k < 4 else -1)))
            formation(f, gx, gy, 130 * z, 56 * z, GREEN, t, angle=-90 + 30 * hit * (1 if k < 4 else -1), kind="cav", flag=k in (1, 6), emblem="crescent", seed=20 + k)
        tk = S.at(1, "hundred and forty")
        if t > tk - .3:
            a = window(t, tk - .3, L[2] - .3, .3, .4)
            counter(f, min(140, 140 * ease_out((t - tk + .3) / 1.2)), 300, 820, 150, a=a)
            label_box(f, "KNIGHTS", 300, 930, a, 44)
        live_portrait(f, "gerard", W - 200, 210, 260, t, alpha=window(t, L[1] - .2, 1e9, .4, .3), angry=True, seed=3)
        plate(f, "GERARD OF RIDEFORT", "Grand Master of the Templars", W - 330, 400, t, L[1], L[2] - .3)
        headline(f, "HE CHARGED ANYWAY", t, S.at(1, "He charged") - .2, L[2] - .3, y=140, size=72)
    if t > L[2] - .2:
        grade(f, desat=.4 * prog(t, L[2], 1.5), red=.3 * window(t, L[2], L[2] + 2.5, .3, 1.2))
        headline(f, "MASSACRE", t, L[2] - .1, S.at(2, "Gerard escaped") - .2, y=150, size=110, grad=("#ffe0c8", "#c0392b"))
        label_box(f, "GERARD ESCAPED, WOUNDED", W / 2, 150, window(t, S.at(2, "Gerard escaped") - .1, 1e9, .4, .3), 56, GOLD)
        small_note(f, "...and soon he would be advising the king", W / 2, 230, window(t, S.at(2, "advice") - 1.0, 1e9, .4, .3), 42)
    f = shake(f, t, S.at(1, "charged") + .9, 7, .4)
    return f

def s_muster(t, S):
    L = S.L
    if t < L[2] - .2:
        m = levant_map(); P = lambda k: m.proj(LL[k])
        ax, ay = P("ashtara"); sx, sy = P("sinnabra"); hx, hy = P("hattin")
        c = cam_path(t, [(0, (ax - 100, ay, .55)), (L[1], (ax - 150, ay + 20, .75)), (L[2], ((ax + sx) / 2, ay + 20, 1.05))])
        f = c.render(m.img); z = c.z
        x, y = c.pt((ax, ay))
        for k in range(10):
            bx, by = c.pt((ax + 60 + (k % 5) * 70 - 140, ay - 120 + (k // 5) * 120))
            p = prog(t, .4 + k * .25, .6)
            if p > 0: formation(f, bx, by, 120 * z / .6 * .5, 50 * z / .6 * .5, GREEN, t, angle=-90, kind="cav" if k % 2 else "inf", flag=k % 3 == 0, emblem="crescent", seed=40 + k, alpha=p)
        live_portrait(f, "saladin", W - 190, 200, 260, t, alpha=window(t, .2, 1e9, .4, .3), seed=1)
        ta = S.at(0, "thirty")
        if t < L[1] - .2:
            a = window(t, ta - .3, L[1] - .3, .4, .4)
            dim(f, .3 * a)
            v1 = 30000 * ease_out((t - ta + .3) / 1.2) if t > ta - .3 else 0
            blit(f, text_sprite(f"{int(v1):,}–40,000", "cinzel", 120, CREAM, 900, stroke=4, gradient=("#e8ffe0", "#3a9a5a"), glow="#000000"), W / 2, 430, a)
            small_note(f, "modern estimates of Saladin's army", W / 2, 530, a, 40)
            tc = S.at(0, "twelve thousand")
            v2 = 12000 * ease_out((t - tc + .3) / 1.2) if t > tc - .3 else 0
            label_box(f, f"INCL. ~{int(v2):,} REGULAR CAVALRY", W / 2, 640, window(t, tc - .3, L[1] - .3, .4, .4), 50, "#c8f0c8")
            headline(f, "HIS LARGEST ARMY", t, .4, ta - .4, y=170, size=84, grad=("#e8ffe0", "#3a9a5a"))
        else:
            r = route(m, ["ashtara", "sinnabra"], 30, .1)
            arrow(f, c.pts(r), prog(t, L[1] + .2, 3.0, ease_io), GREEN, 18, head=46)
            city(f, c, m, "tiberias", "TIBERIAS", t, L[1] + .4, "l", size=40)
            x2, y2 = c.pt(P("sinnabra"))
            label_box(f, "CROSSING THE JORDAN", x2 + 30, y2 + 80, prog(t, S.at(1, "Jordan") - .3, .4), 44, "#c8f0c8")
            datestamp(f, "END OF JUNE 1187", t, L[1] + .2, L[2] - .4)
        fi = prog(t, 0, .5)
        return f
    # ORDER OF BATTLE screen
    f = parch(t, S)
    dim(f, .25)
    a = window(t, L[2] - .2, 1e9, .4, .3) * (1 - prog(t, L[3] - .4, .5))
    label_box(f, "ORDER OF BATTLE · JULY 1187", W / 2, 90, a, 56, GOLD)
    if a > .05: cv2.line(f, (W // 2, 170), (W // 2, int(170 + 760 * prog(t, L[2], .8))), tuple(int(v * a) for v in (214, 170, 80)), 3, cv2.LINE_AA)
    blit(f, portrait("guy", 170), W / 2 - 520, 250, a)
    label_box(f, "KINGDOM OF JERUSALEM", W / 2 - 520, 370, a, 40, "#ffd0c0")
    blit(f, portrait("saladin", 170), W / 2 + 520, 250, a)
    label_box(f, "SALADIN", W / 2 + 520, 370, a, 40, "#c8f0c8")
    tk = S.at(2, "twelve hundred"); tl = S.at(2, "Thousands of light"); tf = S.at(2, "fifteen thousand"); tt = S.at(2, "Perhaps")
    oob_row(f, 180, 480, t, tk - .3, "cav", FR, "knights", 1200, a, seed=1)
    oob_row(f, 180, 620, t, tl - .3, "cav", (150, 110, 70), "light cavalry (turcopoles)", "THOUSANDS", a, seed=2)
    oob_row(f, 180, 760, t, tf - .3, "inf", FR, "foot soldiers (approx.)", 15000, a, seed=3)
    oob_row(f, W - 180, 480, t, L[2] + .4, "cav", GREEN, "regular cavalry (approx.)", 12000, a, align="r", seed=4)
    oob_row(f, W - 180, 640, t, L[2] + .9, "inf", GREEN, "total, modern estimates", "30–40,000", a, align="r", seed=5)
    if t > tt - .3:
        aa = window(t, tt - .3, 1e9, .4, .3)
        aa = window(t, tt - .3, L[3] - .3, .4, .4)
        blit(f, text_sprite("≈ 20,000", "cinzel", 96, CREAM, 900, stroke=4, gradient=("#ffe0c8", "#c0392b"), glow="#000000"), W / 2 - 520, 900, aa)
    if t > L[3] - .3:
        aa = window(t, L[3] - .3, 1e9, .4, .3)
        for k in range(6):
            x = 310 + k * 260
            blit(f, icon("castle", 150), x, 560, aa * (1 - .55 * prog(t, L[3] + .6 + k * .2, .4)))
            if t > L[3] + .6 + k * .2: label_box(f, "EMPTY", x, 670, prog(t, L[3] + .6 + k * .2, .3) * aa, 36, "#ffd0c0")
        label_box(f, "GARRISONS STRIPPED", W / 2, 330, aa, 60, GOLD)
        headline(f, "EVERYTHING THE KINGDOM HAD", t, S.at(3, "everything") - .3, 1e9, y=860, size=70, grad=("#ffe0c8", "#c0392b"))
    return f

def s_sephoria(t, S):
    L = S.L
    m = galilee_map(); P = lambda k: m.proj(LL[k])
    sx, sy = P("sephoria"); tx, ty = P("tiberias")
    keys = [(0, (sx + 50, sy, 1.1)), (L[1], (sx + 200, sy - 20, .8)), (L[2], ((sx + tx) / 2 + 200, ty, .7)), (S.D, (tx - 150, ty, .95))]
    c = cam_path(t, keys); f = c.render(m.img); z = c.z
    x, y = c.pt((sx, sy))
    for k in range(6):
        bx, by = c.pt((sx - 150 + (k % 3) * 120, sy + 100 + (k // 3) * 90))
        formation(f, bx, by, 100 * z, 44 * z, FR if k != 4 else WHITE, t * .3, angle=0, kind="inf" if k % 2 else "cav", flag=k in (1, 4), emblem="cross",
                  flag_color=FR if k != 4 else WHITE, seed=50 + k, shadow=False)
    city(f, c, m, "sephoria", "SEPHORIA", t, .2, "u", BLUE, size=46, r=13)
    items = [("SPRINGS", S.at(0, "springs")), ("PASTURE", S.at(0, "pasture")), ("A CASTLE", S.at(0, "small castle"))]
    for k, (s, t0) in enumerate(items):
        a = window(t, t0 - .3, L[1] - .3, .3, .4)
        bx = 300; by = 300 + k * 110
        if k == 0: water_icon(f, bx - 90, by, a, .9)
        elif k == 1:
            if a > 0: cv2.ellipse(f, (bx - 90, by + 6), (26, 16), 0, 0, 360, (90, 130, 60), -1, cv2.LINE_AA)
        else: blit(f, icon("castle", 70), bx - 90, by, a)
        label_box(f, s, bx - 50, by, a, 46, CREAM, "l")
    headline(f, "A GOOD PLACE", t, S.at(0, "good place") - .3, L[1] - .3, y=H - 140, size=74)
    live_portrait(f, "saladin", W - 190, 200, 260, t, alpha=window(t, L[1] - .3, 1e9, .4, .3), seed=1, talk=None)
    headline(f, "HE HAD TO MAKE THEM MOVE", t, S.at(1, "He had") - .2, L[2] - .3, y=H - 140, size=70, grad=("#e8ffe0", "#3a9a5a"))
    if t > L[1] + 1:
        for k in range(6):
            bx, by = c.pt((tx - 220 + (k % 3) * 80, ty - 140 + (k // 3) * 260))
            formation(f, bx, by, 90 * z, 40 * z, GREEN, t, angle=90, kind="cav", flag=k == 1, emblem="crescent", seed=60 + k, alpha=prog(t, L[1] + 1 + k * .2, .5))
    if t > L[2] - .3:
        city(f, c, m, "tiberias", "TIBERIAS", t, L[2] - .3, "l", size=44, r=13)
        x2, y2 = c.pt((tx, ty))
        td = S.at(2, "The town fell")
        fires(f, x2 - 20, y2 + 10, t, prog(t, td - .3, .8), 4, 60)
        datestamp(f, "2 JULY 1187", t, L[2] + .3, S.D)
        tc = S.at(2, "citadel")
        blit(f, icon("castle", 120), x2 + 20, y2 - 90, window(t, tc - .4, 1e9, .4, .3), back_out((t - tc + .4) / .5))
        label_box(f, "ESCHIVA HOLDS THE CITADEL", x2 - 60, y2 - 190, window(t, S.at(2, "Eschiva") - .3, 1e9, .4, .3), 42, GOLD, "r")
        th = S.at(2, "sent for help")
        arrow(f, [(x2 - 30, y2), c.pt((sx + 80, sy - 30))], prog(t, th - .2, 1.5, ease_io), (214, 170, 80), 6, head=22, dashed=True)
        label_box(f, "HELP!", (x2 + x) / 2, (y2 + y) / 2 - 60, window(t, th, 1e9, .3, .3), 54, "#ffd0c0")
    return f

def s_council(t, S):
    L = S.L
    f = np.empty((H, W, 3), np.uint8)
    tent_bg_draw(f, t, (110, 30, 26))
    candle(f, 360, 640, t, 1); candle(f, W - 360, 640, t, 2)
    # table
    cv2.rectangle(f, (520, 820), (W - 520, 880), (70, 44, 24), -1); cv2.rectangle(f, (520, 820), (W - 520, 880), (30, 18, 8), 3)
    label_box(f, "COUNCIL OF WAR", W / 2, 110, window(t, .3, L[1] - .3, .4, .4), 64, GOLD)
    small_note(f, "the king's tent at Sephoria · night of 2 July", W / 2, 190, window(t, .7, L[1] - .3, .4, .4), 40)
    tg = S.at(3, "Gerard")
    # seats
    guy_a = window(t, .5, 1e9, .4, .3)
    live_portrait(f, "guy", W / 2, 600, 300, t, alpha=guy_a, seed=1)
    if t < L[3] + 3:
        ra = window(t, L[1] - .3, L[3] + 3, .4, .6)
        live_portrait(f, "raymond", 520, 600, 300, t, alpha=ra, talk="voice" if L[1] < t < L[3] else None, T=S.start + t, seed=2)
        live_portrait(f, "gerard", W - 520, 600, 260, t, alpha=window(t, L[1] + .2, L[3] + 3, .4, .6), angry=True, seed=3)
        if L[1] - .3 < t < L[3] - .3:
            label_box(f, "RAYMOND: DO NOT MOVE", 520, 800, window(t, S.at(1, "not to move") - .3, L[3] - .3, .3, .4), 44, GOLD)
            label_box(f, "HIS TOWN · HIS WIFE", W / 2, 230, window(t, S.at(1, "Tiberias was") - .2, L[2] - .3, .3, .4), 52, "#ffd0c0")
        if L[2] - .3 < t < L[3] - .3:
            # map card: no water between Sephoria and Tiberias
            a = window(t, L[2] - .3, L[3] - .3, .4, .4)
            ov = f.copy(); cv2.rectangle(ov, (480, 150), (W - 480, 420), (226, 206, 160), -1); cv2.addWeighted(ov, a, f, 1 - a, 0, f)
            cv2.rectangle(f, (480, 150), (W - 480, 420), (90, 60, 30), 3)
            for k, (s, x) in enumerate((("SEPHORIA", 640), ("TIBERIAS", W - 640))):
                water_icon(f, x, 210, a, .8)
                blit(f, text_sprite(s, "cinzel", 34, INK, 800, shadow=False, spacing=3), x, 275, a)
            arrow(f, [(780, 220), (W - 780, 220)], prog(t, L[2] + .2, 1.5), FR, 10, head=28)
            nw = S.at(2, "no water")
            blit(f, text_sprite("NO WATER", "cinzel", 50, "#a01c1c", 900, shadow=False, spacing=4), W / 2, 320, window(t, nw - .2, L[3] - .3, .3, .4) * a)
            blit(f, text_sprite("JULY HEAT", "cinzel", 36, "#8a3a10", 800, shadow=False, spacing=4), W / 2, 380, window(t, S.at(2, "heat") - .3, L[3] - .3, .3, .4) * a)
        if L[3] - .3 < t < L[4]:
            label_box(f, "THE COUNCIL AGREED", W / 2, 250, window(t, L[3] - .2, tg - .3, .3, .4), 64, "#c8f0c8")
    if t > S.at(3, "late that night") - .5:
        dim(f, .35 * window(t, S.at(3, "late that night") - .5, L[5] - .3, .6, .6))
    if t > L[3] + 3 and t < L[5] - .2:
        a = window(t, S.at(3, "came back") - .3, L[5] - .3, .6, .4)
        live_portrait(f, "gerard", W / 2 + 400, 560, 360, t, alpha=a, angry=True, talk="voice" if t > L[4] else None, T=S.start + t, seed=3)
        small_note(f, "alone", W / 2 + 400, 800, window(t, S.at(3, "alone") - .3, L[4], .3, .4), 44)
        words = [("TRAITOR", S.at(4, "traitor"), (-560, 250)), ("DEALS WITH SALADIN", S.at(4, "deals"), (-420, 720)), ("SHAMED FOREVER", S.at(4, "shamed"), (0, 880))]
        for s, t0, (dx, dy) in words:
            aa = window(t, t0 - .3, L[5] - .3, .25, .4)
            blit(f, text_sprite(s, "cinzel", 64, "#ffd0c0", 900, stroke=3, glow="#000000", spacing=4), W / 2 + dx, dy, aa, .8 + .2 * back_out((t - t0 + .3) / .4))
        small_note(f, "the argument as reported in the chronicle attributed to Ernoul", W / 2, 1010, window(t, L[4], L[5] - .3, .4, .4), 32)
    if t > L[5] - .2:
        tt = S.at(5, "trumpets")
        headline(f, "GUY CHANGED HIS MIND", t, L[5] - .1, tt - .2, y=820, size=74)
        headline(f, "THE ARMY WILL MARCH", t, tt - .1, 1e9, y=820, size=84, grad=("#ffe0c8", "#c0392b"))
        for k in range(5):
            banner(f, 300 + k * 330, 300 + 20 * (k % 2), t, FR if k != 2 else WHITE, h=150, seed=k, alpha=prog(t, tt - .2 + k * .12, .4), emblem="cross")
        f = shake(f, t, tt, 6, .4)
    return f

def s_march(t, S):
    L = S.L
    m = galilee_map(); P = lambda k: m.proj(LL[k])
    sx, sy = P("sephoria"); ux, uy = P("turan"); hx, hy = P("meskana"); tx, ty = P("tiberias")
    keys = [(0, (sx + 150, sy, 1.0)), (L[1], (sx + 250, sy - 10, 1.15)), (L[2], (sx + 350, sy - 10, 1.0)), (L[3], (ux - 50, uy, 1.4)),
            (L[4], (ux, uy, 1.2)), (L[5], (hx - 60, hy, 1.1)), (L[6], ((hx + tx) / 2 - 100, hy, .8)), (S.D, ((hx + tx) / 2 - 100, hy, .85))]
    c = cam_path(t, keys); f = c.render(m.img); z = c.z
    rr = route(m, ["sephoria", "turan", "meskana"], 40, .03)
    tot = L[5] + 1
    pm = prog(t, .8, tot, lambda x: x) * .98
    rs = c.pts(rr)
    arrow(f, rs, pm, (214, 170, 80), 6, head=1, dashed=True)
    arrow(f, c.pts(np.array([m.proj(LL["meskana"]), m.proj(LL["tiberias"])])), 1.0, (120, 90, 60), 4, head=20, dashed=True)
    city(f, c, m, "sephoria", "SEPHORIA", t, .2, "l", BLUE, size=40)
    city(f, c, m, "tiberias", "TIBERIAS", t, .2, "r", size=40)
    xu, yu = c.pt((ux, uy))
    water_icon(f, xu, yu - 30, prog(t, L[4] - .5, .4), .7)
    label_box(f, "SPRING OF TURAN", xu, yu + 120, window(t, L[4] - .3, L[5], .4, .4), 40, GOLD)
    small_note(f, "too small for 20,000 men", xu, yu + 175, window(t, S.at(4, "It could not") - .3, L[5], .4, .4), 38)
    # army: vanguard (gold) / centre (red, cross) / rear (white)
    th = prog(t, L[5], 2.0)
    for k, (col, lab, seed, kind) in enumerate(((GOLDC, "VANGUARD · RAYMOND", 70, "cav"), (FR, "KING GUY · TRUE CROSS", 71, "inf"), (WHITE, "REAR · TEMPLARS & HOSPITALLERS", 72, "cav"))):
        pk = pm - k * .15
        if pk <= 0: continue
        px, py = along(rs, pk)
        q2 = along(rs, min(.999, pk + .02)); ang = math.degrees(math.atan2(q2[1] - py, q2[0] - px)) + 90 if pk < .97 else 90
        formation(f, px, py, 125 * z, 56 * z, col, t, angle=ang, kind=kind, flag=True, flag_color=col, emblem="cross", seed=seed, shadow=False, density=.9)
        la = window(t, S.at(1, ["Raymond", "The king", "The Templars"][k]) - .3, L[2] + 1, .3, .4)
        label_box(f, lab, px, py + (90 * z + 30) * (1 if k == 1 else -1) - (40 * z if k != 1 else 0), la, 32, "#fff1d0")
        if k == 1:
            blit(f, icon("truecross", 70), px, py - 70 * z - 20, window(t, S.at(1, "True Cross") - .4, 1e9, .4, .3))
    # horse archers circling + volleys
    if t > L[2] - .3:
        a = prog(t, L[2] - .3, .8)
        cx0, cy0 = along(rs, max(.05, pm - .07))
        for k in range(8):
            ang = k / 8 * 6.283 + t * .5
            rx, ry = 330 * z / 1.0, 230 * z / 1.0
            x = cx0 + rx * math.cos(ang); y = cy0 + ry * math.sin(ang)
            formation(f, x, y, 100 * z, 44 * z, GREEN, t, angle=math.degrees(ang) + 180, kind="cav", flag=False, seed=80 + k, alpha=a, shadow=False, density=.8)
            if k % 2 == 0:
                for j in range(3):
                    volley_arcs(f, (x, y), (cx0, cy0), t, L[2] + .3 + j * 2.8 + k * .3, 1.0, 16, seed=k * 7 + j, spread=25, height=70)
        label_box(f, "SHOOT · RIDE AWAY · RETURN", W / 2, 140, window(t, S.at(2, "They shot") - .2, L[3] - .3, .4, .4), 56, "#c8f0c8")
    headline(f, "EVERY MILE SLOWER", t, S.at(3, "Every mile") - .3, L[4] - .3, y=140, size=74)
    label_box(f, "TIGHT FORMATION", W / 2, H - 140, window(t, S.at(3, "tight") - .3, L[4] - .3, .4, .4), 50)
    if t > L[5] - .3:
        label_box(f, "THE REARGUARD IS PINNED", W / 2, 140, window(t, L[5] - .2, L[6] - .3, .4, .4), 56, "#ffd0c0")
        label_box(f, "THE ARMY STOPS", W / 2, H - 140, window(t, S.at(5, "stopped") - .3, L[6] - .3, .4, .4), 56, GOLD)
        x0, y0 = along(rs, pm)
        lx, ly = c.pt(m.proj((35.56, 32.82)))
        arrow(f, [(x0 + 40, y0), (lx - 60, ly)], prog(t, S.at(5, "miles") - .4, 1.0), (90, 160, 210), 8, head=26, dashed=True)
        small_note(f, "water: still miles away", (x0 + lx) / 2, (y0 + ly) / 2 - 50, window(t, S.at(5, "miles") - .2, L[6] - .3, .4, .4), 40, "#d8ecff")
    datestamp(f, "3 JULY 1187", t, .4, L[2])
    locator(f, levant_map(), LL["hattin"], t, w=280, alpha=window(t, .5, L[6] - .5, .5, .5), box_deg=.6, label="GALILEE")
    thirst_meter(f, lerp(1.0, .3, prog(t, .8, L[6], lambda x: x)), t, window(t, .8, L[6] - .2, .4, .4))
    if t > L[6] - .3:
        dim(f, .55 * prog(t, L[6] - .3, .5))
        quote_card(f, ["“Alas, Lord God, the war is over.", "We are dead men.", "The kingdom is finished.”"],
                   "Raymond of Tripoli, in the chronicle attributed to Ernoul", t, L[6] - .2, 1e9, y=H / 2 + 10, size=54)
        live_portrait(f, "raymond", 260, 300, 240, t, alpha=window(t, L[6], 1e9, .4, .3), talk="voice", T=S.start + t, seed=2)
    return f

def s_night(t, S):
    L = S.L
    f = desert_scene(t * .2, "night", riders=0)
    dim(f, .15)
    # camp silhouettes on the plateau
    for k in range(14):
        x = 120 + k * 130; y = 760 + 18 * math.sin(k)
        cv2.fillPoly(f, [np.array([[x - 40, y], [x, y - 55], [x + 40, y]], np.int32)], (20, 16, 22), cv2.LINE_AA)
    label_box(f, "NIGHT · NO WATER", W / 2, 140, window(t, .4, L[1] - .3, .5, .4), 66, "#d8ecff")
    small_note(f, "not for the men · not for the horses", W / 2, 220, window(t, S.at(0, "none for") - .3, L[1] - .3, .4, .4), 44)
    thirst_meter(f, lerp(.3, .12, prog(t, 0, S.D, lambda x: x)), t, window(t, .3, 1e9, .4, .3))
    # enemy fires/drums on the horizon
    if t > L[1] - .3:
        a = prog(t, L[1] - .3, 1.0)
        for k in range(9):
            x = 180 + k * 200; y = 590 + 12 * math.sin(k * 2.1)
            fires(f, x, y, t, a * .8, 10 + k, 26)
            if k % 3 == 1: banner(f, x + 20, y - 10, t, (38, 96, 66), h=70, seed=k, alpha=a, emblem="crescent")
        beat = (t * 1.43) % 1
        if beat < .2:
            for k in (2, 6):
                impact_ring(f, 180 + k * 200, 590, t, t - beat / 1.43, 90, (255, 200, 120), .2 / 1.43)
        lab = [("PRAYING", S.at(1, "praying")), ("SINGING", S.at(1, "singing")), ("DRUMS", S.at(1, "drums"))]
        for k, (s, t0) in enumerate(lab):
            label_box(f, s, W / 2 - 420 + k * 420, 400, window(t, t0 - .3, L[2] - .3, .3, .4), 56, "#c8f0c8")
    if t > L[2] - .3 and t < L[3] - .2:
        a = window(t, L[2] - .3, L[3] - .3, .4, .4)
        for k in range(5):
            x = W + 120 - ((t - L[2]) * 70 + k * 190) % (W + 400)
            blit(f, icon("camel", 110), x, 560 + 6 * math.sin(t * 6 + k), a * .9)
            water_icon(f, x + 20, 500, a, .5)
        label_box(f, "WATER FROM THE LAKE", W / 2, 400, window(t, S.at(2, "camels") - .3, S.at(2, "according") - .2, .3, .4), 52, "#d8ecff")
        ta = S.at(2, "four hundred")
        if t > ta - .5:
            aa = window(t, ta - .5, L[3] - .3, .4, .4)
            counter(f, min(400, 400 * ease_out((t - ta + .5) / 1.2)), W / 2, 330, 150, a=aa)
            label_box(f, "LOADS OF ARROWS", W / 2, 440, aa, 52)
            small_note(f, "— Imad ad-Din, Saladin's secretary", W / 2, 510, window(t, ta, L[3] - .3, .4, .4), 38)
            blit(f, portrait("imad", 170), W - 170, 170, aa)
    if t > L[3] - .3:
        a = prog(t, L[3] - .3, .6)
        pf = prog(t, S.at(3, "set fire") - .3, 4.0)
        fl = [(lerp(-100, W + 100, k / 18), 860 - 10 * math.sin(k + t * .5)) for k in range(19)]
        fl = [p for i, p in enumerate(fl) if i / 18 < pf + .02]
        fire_line(f, fl, t, a, 7, 90)
        smoke(f, t, .5 * prog(t, S.at(3, "The smoke") - .5, 2.0), seed=3, speed=90)
        label_box(f, "UPWIND", 260, 940, window(t, S.at(3, "upwind") - .3, 1e9, .3, .3), 44, "#ffd0b0")
        arrow(f, [(140, 1010), (460, 1010)], prog(t, S.at(3, "upwind") - .3, .8), (230, 200, 160), 8, head=22)
        headline(f, "THE GRASS IS SET ON FIRE", t, S.at(3, "set fire") - .2, 1e9, y=140, size=70, grad=("#ffe0c8", "#d04020"))
    return f

def s_battle(t, S):
    L = S.L; img = hattin_field()
    keys = [(0, (1300, 1150, .75)), (L[1], (1700, 1050, .7)), (L[2], (1600, 1150, .95)), (L[3], (2100, 1000, .6)),
            (L[3] + 6, (2500, 900, .7)), (L[4], (1700, 1100, .85)), (L[5], (1650, 1150, 1.05)), (L[6], (1650, 1150, 1.0)), (L[7], (1650, 1150, 1.15)), (S.D, (1650, 1150, 1.2))]
    c = cam_path(t, keys); f = c.render(img); z = c.z
    # muslim ring
    rng = np.random.default_rng(9)
    ring = [(1650 + 950 * math.cos(a_) * 1.15, 1100 + 600 * math.sin(a_)) for a_ in np.linspace(0, 6.283, 15)[:-1]]
    tr = S.at(3, "open their ranks")
    gap = prog(t, tr - .2, 1.2) * (1 - prog(t, L[4] - 1, 1.5))
    close = prog(t, L[5], 6.0)
    for i, (x, y) in enumerate(ring):
        ang = math.atan2(y - 1100, x - 1650)
        if i in (0, 1):  # the east (Taqi ad-Din) — opens
            y += (-260 if i == 0 else 260) * gap
        r = 1 - .35 * close
        xx, yy = c.pt((1650 + (x - 1650) * r, 1100 + (y - 1100) * r))
        formation(f, xx, yy, 230 * z, 88 * z, GREEN if i not in (0, 1) else (60, 120, 80), t, angle=math.degrees(ang) - 90, kind="cav" if i % 2 else "inf",
                  flag=i % 3 == 0, emblem="crescent", seed=100 + i, shadow=False)
    # franks
    adv = prog(t, .5, 5.0, ease_io) * (1 - prog(t, L[1] + 1, 3.0))
    inf_up = prog(t, S.at(1, "climbed") - .5, 4.0, ease_io)
    knights = 1 - .5 * prog(t, L[2] + 1, 6.0) - .3 * prog(t, L[5], 10)
    for i in range(4):  # infantry -> the Horns
        p0 = (1400 + (i % 2) * 180 + 250 * adv, 1000 + (i // 2) * 170)
        p1 = (2000 + (i % 2) * 300, 830 + (i // 2) * 40 - (i % 2) * 40)
        x, y = c.pt(lerp2(p0, p1, inf_up))
        formation(f, x, y, 210 * z, 90 * z, (140, 40, 40), t, angle=0, kind="inf", flag=i == 0, emblem="cross", seed=120 + i,
                  strength=.9 - .2 * inf_up, density=1.0 - .3 * inf_up)
    label_box(f, "THE INFANTRY BREAKS", W / 2, 140, window(t, L[1] - .2, S.at(1, "Horns") - .2, .3, .4), 58, "#ffd0c0")
    if inf_up > .3:
        hx_, hy_ = c.pt((2190, 700))
        label_box(f, "HORNS OF HATTIN", hx_, hy_, window(t, S.at(1, "Horns") - .3, L[3], .4, .4), 50, GOLD)
    # knights + tent
    tent = c.pt((1650, 1180))
    tfall = S.at(7, "the tent fell")
    tp = prog(t, tfall - .2, .7, ease_io)
    if True:
        pole_h = 120 * z * (1 - tp * .85)
        tx_, ty_ = tent
        pts = np.array([[tx_ - 80 * z, ty_ + 10], [tx_, ty_ - pole_h], [tx_ + 80 * z, ty_ + 10]], np.float32)
        cv2.fillPoly(f, [(pts * 8).astype(np.int32)], (170, 26, 26), cv2.LINE_AA, 3)
        cv2.polylines(f, [(pts * 8).astype(np.int32)], True, (40, 10, 6), 3, cv2.LINE_AA, 3)
        if tp < .5: banner(f, tx_, ty_ - pole_h, t, (170, 26, 26), h=int(70 * z), seed=3, emblem="cross")
    for i in range(6):
        ang = i / 6 * 6.283 + .3
        rad = 230 if t < L[5] else 230 + 60 * math.sin(t * 1.3 + i) * (1 - tp)
        x, y = c.pt((1650 + rad * math.cos(ang) + 250 * adv * (i < 3), 1150 + rad * .7 * math.sin(ang)))
        col = WHITE if i in (1, 4) else FR
        formation(f, x, y, 160 * z, 66 * z, col, t, angle=math.degrees(ang) + 90, kind="cav", flag=i in (0, 3), emblem="cross",
                  flag_color=col, seed=140 + i, strength=knights * (1 - .8 * tp), rout=.6 * tp, shadow=False)
    # Raymond's charge east, through the gap
    trc = S.at(3, "charged")
    if t > trc - .3 and t < L[4] + 2:
        pr = prog(t, trc - .2, (tr + 2.5) - trc, ease_io)
        p0 = (1850, 1100); p1 = (2500, 1100); p2 = (3500, 1000)
        p = lerp2(p0, p1, pr) if t < tr + .8 else lerp2(p1, p2, prog(t, tr + .8, 4.0, ease_io))
        x, y = c.pt(p)
        formation(f, x, y, 180 * z, 70 * z, GOLDC, t, angle=90, kind="cav", flag=True, flag_color=GOLDC, emblem="cross", seed=160,
                  label="RAYMOND" if t < L[4] else None)
    if L[3] - .2 < t < L[4] - .2:
        live_portrait(f, "taqi", W - 300, H - 250, 220, t, alpha=window(t, S.at(3, "Taqi") - .4, L[4] - .3, .4, .4), seed=4)
        small_note(f, "Taqi ad-Din, Saladin's nephew", W - 300, H - 100, window(t, S.at(3, "Taqi") - .2, L[4] - .3, .4, .4), 34)
        label_box(f, "THE RANKS OPEN", W / 2, 140, window(t, tr - .2, S.at(3, "kept riding") - .2, .3, .4), 58, "#c8f0c8")
        label_box(f, "RAYMOND IS OUT OF THE BATTLE", W / 2, 140, window(t, S.at(3, "kept riding") - .2, L[4] - .3, .3, .4), 54, GOLD)
    # arrows
    if L[2] - .3 < t < L[7]:
        for j in range(10):
            src = ring[(j * 3) % len(ring)]
            volley_arcs(f, c.pt(src), tent, t, L[2] + j * 3.0, 1.3, 16, seed=j, spread=60 * z, height=200 * z)
        if t < L[3] - .2:
            headline(f, "THE HORSES BEGIN TO FALL", t, S.at(2, "horses") - .3, L[3] - .3, y=140, size=66, grad=("#ffe0c8", "#c0392b"))
    # True Cross captured
    if L[4] - .3 < t < L[5] - .2:
        tc = L[4]
        blit(f, icon("truecross", 260), W / 2, 470, window(t, tc - .2, L[5] - .3, .4, .4))
        crossmark(f, W / 2, 470, t, S.at(4, "captured") + .2, 140)
        headline(f, "THE TRUE CROSS IS LOST", t, S.at(4, "captured") - .2, L[5] - .3, y=760, size=76, grad=("#ffe0c8", "#c0392b"))
    # al-Afdal + tent
    if L[5] - .3 < t < L[6] - .2:
        label_box(f, "THE KING'S RED TENT", tent[0], tent[1] + 110 * z, window(t, S.at(5, "red tent") - .3, L[6] - .3, .4, .4), 46, "#ffd0c0")
        live_portrait(f, "saladin", W - 400, 200, 220, t, alpha=window(t, S.at(5, "al-Afdal") - .6, L[6] - .3, .4, .4), seed=1)
        live_portrait(f, "afdal", W - 170, 220, 180, t, alpha=window(t, S.at(5, "al-Afdal") - .3, L[6] - .3, .4, .4), seed=5)
        small_note(f, "al-Afdal, Saladin's son", W - 280, 360, window(t, S.at(5, "al-Afdal"), L[6] - .3, .4, .4), 36)
        label_box(f, "CHARGE AFTER CHARGE", W / 2, H - 140, window(t, S.at(5, "charge after") - .3, L[6] - .3, .4, .4), 56)
    if L[6] - .3 < t < L[7] - .1:
        dim(f, .5 * prog(t, L[6] - .3, .4))
        quote_card(f, ["“We have not beaten them", "until that tent falls.”"], "Saladin, as told by al-Afdal to Ibn al-Athir",
                   t, S.at(6, "We have not") - .4, L[7] - .2, y=H / 2 - 20, size=60)
        live_portrait(f, "afdal", 220, 260, 200, t, alpha=window(t, L[6] - .2, S.at(6, "Each time, Saladin") - .1, .4, .3), talk="voice", T=S.start + t, seed=5)
        live_portrait(f, "saladin", 220, 260, 220, t, alpha=window(t, S.at(6, "Each time, Saladin"), L[7] - .2, .3, .3), seed=1)
        label_box(f, "“WE HAVE WON!”", W / 2, 150, window(t, S.at(6, "they had won") - .4, S.at(6, "Each time, Saladin") - .1, .3, .3), 54, "#c8f0c8")
    smoke(f, t, .45 * (1 - prog(t, L[1], 12)) + .12, seed=4, speed=80)
    if t > L[7] - .2:
        headline(f, "THE TENT FELL", t, tfall, 1e9, y=150, size=110, grad=("#ffe0c8", "#c0392b"))
        grade(f, desat=.5 * prog(t, tfall, 1.0), red=.3 * window(t, tfall, tfall + 2, .2, 1.0))
        flash(f, t, tfall, (255, 220, 180), .5, .35)
    locator(f, galilee_map(), LL["hattin"], t, w=300, alpha=window(t, .4, L[1] + 2, .5, .5), box_deg=.12, label="HATTIN")
    datestamp(f, "4 JULY 1187 · DAWN", t, .4, L[1] - .3)
    thirst_meter(f, lerp(.12, .0, prog(t, 0, L[3], lambda x: x)), t, window(t, .3, L[4] - .3, .4, .4))
    f = shake(f, t, tfall, 10, .6)
    return f

def s_tent(t, S):
    L = S.L
    f = np.empty((H, W, 3), np.uint8)
    tent_bg_draw(f, t, (40, 84, 58), 3)
    candle(f, 120, 700, t, 3); candle(f, W - 120, 700, t, 4)
    label_box(f, "SALADIN'S TENT", W / 2, 100, window(t, .3, L[1] - .3, .4, .4), 60, GOLD)
    sal = (W / 2, 430)
    rd = S.at(3, "Raynald of Châtillon was killed")
    live_portrait(f, "saladin", sal[0], sal[1], 360, t, alpha=window(t, .2, 1e9, .4, .3), angry=L[3] < t < L[4], seed=1)
    gx, gy = 470, 520; rx, ry = W - 470, 520
    live_portrait(f, "guy", gx, gy, 300, t, alpha=window(t, S.at(0, "king of Jerusalem") - .3, 1e9, .4, .3), seed=2)
    rg = prog(t, rd - .2, 1.0)
    if t < L[4] + 1:
        live_portrait(f, "raynald", rx, ry, 300, t, alpha=window(t, S.at(0, "Raynald") - .3, L[4] + 1, .4, .6), grey=rg > .5, seed=3, bob=rg < .5)
    small_note(f, "Guy of Lusignan", gx, gy + 190, window(t, .8, L[1], .4, .4), 36)
    small_note(f, "Raynald of Châtillon", rx, ry + 190, window(t, S.at(0, "Raynald") , L[1], .4, .4), 36)
    # the cup
    if L[1] - .3 < t < L[3]:
        to = S.at(1, "offered"); tp = S.at(1, "passed")
        if t < tp: p = lerp2((sal[0], sal[1] + 260), (gx + 120, gy + 40), prog(t, to - .2, 1.0, ease_io))
        else: p = lerp2((gx + 120, gy + 40), (rx - 120, ry + 40), prog(t, tp - .1, 1.4, ease_io))
        blit(f, goblet(110), p[0], p[1], window(t, L[1] - .3, L[3] - .3, .3, .4))
        label_box(f, "COOL WATER", W / 2, 860, window(t, S.at(1, "cool water") - .3, tp, .3, .3), 54, "#d8ecff")
    if L[2] - .3 < t < L[3] - .2:
        label_box(f, "FOOD OR DRINK FROM THE CAPTOR = PROTECTION", W / 2, 860, window(t, L[2] - .2, S.at(2, "And Saladin") - .2, .4, .4), 44, GOLD)
        label_box(f, "IT WAS NOT SALADIN WHO GAVE RAYNALD WATER", W / 2, 860, window(t, S.at(2, "And Saladin") - .1, L[3] - .3, .4, .4), 44, "#ffd0c0")
    if L[3] - .3 < t < L[4] - .2:
        label_box(f, "THE BROKEN TRUCE", W / 2, 860, window(t, L[3] - .2, rd - .3, .4, .4), 54, "#ffd0c0")
        crossmark(f, rx, ry, t, rd + .1, 130)
        label_box(f, "† RAYNALD OF CHÂTILLON", W / 2, 860, window(t, rd, L[4] - .3, .4, .4), 56, "#e8c8c0")
        small_note(f, "accounts differ on who struck the blow", W / 2, 940, window(t, S.at(3, "Accounts differ") - .2, L[4] - .3, .4, .4), 40)
        flash(f, t, rd, (180, 20, 10), .6, .45)
    if L[4] - .3 < t < L[5] - .2:
        dim(f, .45 * window(t, L[4] - .3, L[5] - .2, .4, .4))
        quote_card(f, ["“Kings do not kill kings.”"], "Saladin to Guy, as reported by his biographer Baha ad-Din",
                   t, S.at(4, "kings do not") - .5, L[5] - .2, y=740, size=64, w=1300)
    if t > L[5] - .3:
        dim(f, .7 * prog(t, L[5] - .3, .5))
        a = window(t, L[5] - .2, 1e9, .4, .3)
        tb = S.at(5, "Around two hundred")
        n = int(clamp((t - tb + .3) / 2.0) * 200)
        for i in range(200):
            x = 260 + (i % 25) * 56; y = 330 + (i // 25) * 62
            col = (232, 226, 210) if i % 3 else (40, 40, 40)
            if i >= n: continue
            g = prog(t, S.at(5, "beheaded") + i * .004, .5)
            cc = tuple(int(lerp(v, 90, g)) for v in col)
            cv2.rectangle(f, (x - 18, y - 22), (x + 18, y + 22), cc, -1); cv2.rectangle(f, (x - 18, y - 22), (x + 18, y + 22), (20, 12, 6), 2)
            cv2.line(f, (x, y - 16), (x, y + 16), (170, 30, 34) if i % 3 else (230, 230, 230), 4); cv2.line(f, (x - 12, y - 4), (x + 12, y - 4), (170, 30, 34) if i % 3 else (230, 230, 230), 4)
        label_box(f, "TEMPLARS & HOSPITALLERS", W / 2, 200, a, 56, CREAM)
        counter(f, n, W / 2, 900, 120, a=a, grad=("#ffd0c0", "#c0392b"))
        small_note(f, "around 200 executed on Saladin's orders — described by Imad ad-Din", W / 2, 1000, window(t, S.at(5, "beheaded"), 1e9, .4, .3), 36)
    return f

def s_aftermath(t, S):
    L = S.L
    if t < L[1] - .2:
        f = parch(t, S)
        embers(f, t, 30, 61, (230, 170, 90), speed=30)
        headline(f, "NO FIELD ARMY LEFT", t, .3, L[1] - .3, y=200, size=84, grad=("#ffe0c8", "#c0392b"))
        for k in range(6):
            x = 360 + k * 240
            blit(f, icon("castle", 140), x, 560, window(t, .6 + k * .15, L[1] - .3, .3, .4) * (1 - .55 * prog(t, S.at(0, "emptied") - .2 + k * .1, .4)))
            label_box(f, "EMPTY", x, 680, window(t, S.at(0, "emptied") + k * .1, L[1] - .3, .3, .4), 34, "#ffd0c0")
        return f
    m = levant_map(); P = lambda k: m.proj(LL[k])
    jx, jy = P("jerusalem")
    if t < L[2] - .2:
        c = cam_path(t, [(L[1] - .2, (jx - 50, jy - 420, .75)), (L[2], (jx - 80, jy - 380, .8))])
    else:
        c = cam_path(t, [(L[2] - .2, (jx - 80, jy - 380, .8)), (L[2] + 3, (jx, jy, 1.1)), (S.D, (jx, jy, 1.2))])
    f = c.render(m.img)
    seq = [("tiberias", "TIBERIAS", S.at(1, "Eschiva")), ("acre", "ACRE", S.at(1, "Acre")), ("jaffa", "JAFFA", S.at(1, "Jaffa")),
           ("sidon", "SIDON", S.at(1, "Sidon")), ("beirut", "BEIRUT", S.at(1, "Beirut")), ("ascalon", "ASCALON", S.at(1, "Ascalon"))]
    for k, nm, t0 in seq:
        x, y = c.pt(P(k))
        g = prog(t, t0, .5)
        ov = f.copy(); cv2.circle(ov, (int(x), int(y)), int(60 * g), GREEN, -1, cv2.LINE_AA); cv2.addWeighted(ov, .5 * g, f, 1 - .5 * g, 0, f)
        city(f, c, m, k, nm, t, t0 - .2, "l" if k in ("acre", "jaffa", "ascalon") else "r", GREEN if t > t0 else FR, size=36)
    city(f, c, m, "tyre", "TYRE HOLDS", t, S.at(1, "few months"), "l", BLUE, size=34)
    tc = S.at(1, "more than fifty")
    if L[1] < t < L[2] - .2:
        a = window(t, tc - .3, L[2] - .3, .4, .4)
        v = min(52, 52 * ease_out((t - tc + .3) / 1.4)) if t > tc - .3 else 0
        counter(f, v, 260, 760, 160, a=a, grad=("#e8ffe0", "#3a9a5a"))
        label_box(f, "TOWNS & CASTLES", 260, 870, a, 40)
        small_note(f, "(by some counts)", 260, 930, a, 34)
    city(f, c, m, "jerusalem", "JERUSALEM", t, L[1], "r", FR, pulse=True, size=44, r=13)
    if t > L[2] - .2:
        x, y = c.pt(P("jerusalem"))
        g = prog(t, S.at(2, "surrendered") - .2, 1.5)
        ov = f.copy(); cv2.circle(ov, (int(x), int(y)), int(240 * g * c.z), GREEN, -1, cv2.LINE_AA); cv2.addWeighted(ov, .45 * g, f, 1 - .45 * g, 0, f)
        datestamp(f, "2 OCTOBER 1187", t, L[2] + .3, S.D)
        headline(f, "JERUSALEM SURRENDERS", t, S.at(2, "surrendered") - .2, 1e9, y=150, size=86, grad=("#e8ffe0", "#3a9a5a"))
        tf = S.at(2, "Eighty-eight")
        label_box(f, "88 YEARS AFTER 1099", W / 2, H - 240, window(t, tf - .3, 1e9, .4, .3), 56, GOLD)
        blit(f, portrait("saladin", 200), W - 180, H - 200, window(t, L[2], 1e9, .4, .3))
    return f

def s_ending(t, S):
    L = S.L
    if t < L[1] - .2:
        f = parch(t, S)
        embers(f, t, 30, 71, (230, 170, 90), speed=30)
        g = prog(t, S.at(0, "died") - .3, 1.2)
        show_portrait(f, "urban", W / 2, 430, t, .2, L[1] - .3, 420, grey=g)
        plate(f, "POPE URBAN III", None, W / 2, 700, t, S.at(0, "Pope") - .3, L[1] - .3)
        label_box(f, "DIED OF GRIEF?", W / 2, 800, window(t, S.at(0, "died") - .2, L[1] - .3, .4, .4), 56, "#e8c8c0")
        small_note(f, "according to one chronicler", W / 2, 870, window(t, S.at(0, "died"), L[1] - .3, .4, .4), 38)
        headline(f, "SHOCK IN EUROPE", t, .3, S.at(0, "According") - .1, y=160, size=80)
        return f
    if t < L[2] - .2:
        f = parch(t, S)
        embers(f, t, 50, 72, (255, 160, 60), speed=40)
        headline(f, "A NEW CRUSADE", t, L[1] - .1, 1e9, y=160, size=84)
        show_portrait(f, "richard", W / 2, 490, t, L[1] + .6, 1e9, 440)
        plate(f, "RICHARD THE LIONHEART", "King of England", W / 2, 790, t, S.at(1, "Lionheart") - .3, 1e9)
        for k in range(2):
            blit(f, icon("crown", 110), W / 2 + (-520 if k == 0 else 520), 470, window(t, S.at(1, "kings of Europe") - .3 + k * .3, 1e9, .4, .3))
        return f
    if t < L[3] - .3:
        m = levant_map(); P = lambda k: m.proj(LL[k])
        ax, ay = P("arsuf"); acx, acy = P("acre")
        c = cam_path(t, [(L[2] - .2, (ax + 100, (ay + acy) / 2, .6)), (L[3], (ax + 50, ay, .9))])
        f = c.render(m.img)
        r = route(m, ["acre", (34.95, 32.6), "arsuf"], 30, .04)
        arrow(f, c.pts(r), prog(t, L[2] + .2, 3.0, ease_io), (165, 30, 34), 16, head=42)
        x, y = c.pt(P("arsuf"))
        arrow(f, [c.pt(m.proj((35.3, 32.25))), (x + 40, y)], prog(t, L[2] + 1.0, 2.5, ease_io), GREEN, 16, head=42)
        marker(f, x, y, S.at(2, "Arsuf") - .4, t, (200, 160, 40), 18)
        label_box(f, "ARSUF · 1191", x - 40, y + 90, prog(t, S.at(2, "Arsuf") - .3, .4), 60, GOLD)
        blit(f, portrait("richard", 200), 170, 190, window(t, L[2], 1e9, .4, .3))
        blit(f, portrait("saladin", 200), W - 170, 190, window(t, L[2] + .3, 1e9, .4, .3))
        headline(f, "NEXT: OPEN BATTLE", t, L[2] + .3, 1e9, y=H - 140, size=64)
        fi = prog(t, L[2] - .2, .5)
        if fi < 1: dim(f, 1 - fi)
        return f
    # end screen (≈ 12 s after the narration)
    f = parch_bg(t, True, 1.0, 1.04, 30)
    embers(f, t, 40, 37, (255, 170, 80), speed=30)
    a = prog(t, L[3] - .3, .6)
    x0, y0, x1, y1 = 150, 300, 150 + 960, 300 + 540
    ov = f.copy(); cv2.rectangle(ov, (x0, y0), (x1, y1), (20, 12, 6), -1); cv2.addWeighted(ov, .55 * a, f, 1 - .55 * a, 0, f)
    cv2.rectangle(f, (x0, y0), (x1, y1), (214, 170, 80), 4, cv2.LINE_AA)
    blit(f, text_sprite("WATCH NEXT", "cinzel", 44, GOLD, 800, stroke=2, glow="#000000", spacing=8), (x0 + x1) / 2, y0 - 50, a)
    blit(f, portrait("richard", 200), (x0 + x1) / 2 - 300, (y0 + y1) / 2 - 20, a * .9)
    blit(f, portrait("saladin", 200), (x0 + x1) / 2 + 300, (y0 + y1) / 2 - 20, a * .9)
    blit(f, text_sprite("ARSUF", "cinzel", 80, CREAM, 900, stroke=2, glow="#000000", spacing=6), (x0 + x1) / 2, (y0 + y1) / 2 - 40, a)
    blit(f, text_sprite("1191", "cinzel", 60, GOLD, 900, stroke=2, glow="#000000"), (x0 + x1) / 2, (y0 + y1) / 2 + 50, a)
    small_note(f, "the Lionheart vs Saladin", (x0 + x1) / 2, y1 - 70, a, 40)
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

SCENE_FUNCS = {"cold_open": s_cold_open, "title": s_title, "recap": s_recap, "guy": s_guy, "raynald": s_raynald, "cresson": s_cresson,
               "muster": s_muster, "sephoria": s_sephoria, "council": s_council, "march": s_march, "night": s_night, "battle": s_battle,
               "tent": s_tent, "aftermath": s_aftermath, "ending": s_ending}

# ---- pacing helper (v3): per-line slow push-in, alternating focus point -> a new "shot" at every line start
def _push(fn, amt=.07):
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
for _k in ("recap", "council", "night", "tent"):
    SCENE_FUNCS[_k] = _push(SCENE_FUNCS[_k])
