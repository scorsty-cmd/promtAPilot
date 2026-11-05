"""The Lost Ninth Legion — History Sourced: Unsolved #2. Each scene fn(t, S) -> RGB frame."""
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
    blit(f, text_sprite.__wrapped__(f"{int(round(value)):,}", "cinzel", size, color, 900, stroke=4, gradient=grad, glow="#000000"), x, y, a, scale)   # uncached: changing number

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
# ======================================================= LOST NINTH LEGION — palette & places
ROMC = (150, 26, 26)          # Rome / the Ninth (crimson)
VIC = (176, 128, 30)          # Legio VI Victrix (gold)
BRITC = (40, 86, 130)         # Britons / Caledonians (woad blue)
PARC = (168, 120, 52)         # Parthians (sand)
BLOODC = (160, 30, 30)
LL = {"york": (-1.08, 53.96), "lincoln": (-0.54, 53.23), "colchester": (0.90, 51.89), "richborough": (1.33, 51.29),
      "london": (-0.10, 51.51), "rome": (12.48, 41.89), "nijmegen": (5.86, 51.84), "jerusalem": (35.22, 31.77),
      "elegeia": (41.0, 39.95), "silchester": (-1.08, 51.36), "malton": (-0.80, 54.13), "carlisle": (-2.93, 54.89),
      "wallsend": (-1.53, 54.99), "bowness": (-3.21, 54.95), "caledonia": (-3.9, 56.6), "camp9": (-3.4, 56.35),
      "spain": (-4.0, 40.2), "germany": (7.0, 50.9), "armenia": (44.0, 40.2), "judaea": (35.0, 31.6)}
WALL = [(-3.21, 54.95), (-2.93, 54.92), (-2.6, 54.97), (-2.3, 55.0), (-2.05, 55.02), (-1.75, 55.0), (-1.53, 54.99)]

def night_tint(img, amt=.35):
    x = img.astype(np.float32)
    x = x * (1 - amt) + (x * np.array([.62, .72, .95], np.float32)) * amt
    return np.clip(x, 0, 255).astype(np.uint8)

@disk_cached
def britain_map():
    m = GeoMap(-2.6, 54.2, 13, BW=3840, BH=4400, res="10m", seed=61, sea="#2c3e46")
    for lab in [("BRITANNIA", -1.6, 52.6, 72), ("CALEDONIA", -4.3, 57.2, 66), ("HIBERNIA", -7.9, 53.4, 60),
                ("MARE GERMANICUM", 2.0, 55.6, 46, "#3a2614", False, 10, True), ("BRIGANTES", -2.1, 54.35, 40, "#5a3a1e")]:
        m.label(*lab)
    m.img = night_tint(m.img, .22)
    return m

@disk_cached
def york_map():
    m = GeoMap(-1.0, 54.0, 2.6, res="10m", seed=63, sea="#2c3e46")
    for lab in [("BRIGANTES", -1.75, 54.35, 54, "#5a3a1e"), ("PARISI", -0.45, 53.95, 46, "#5a3a1e"), ("OUSE", -1.25, 53.85, 30, "#2a4450")]:
        m.label(*lab)
    m.img = night_tint(m.img, .2)
    return m

@disk_cached
def empire_map():
    m = GeoMap(17.0, 45.0, 56, BW=3840, BH=3000, res="50m", seed=65, sea="#2c3e46", relief=False)
    for lab in [("IMPERIVM ROMANVM", 14.0, 47.3, 60), ("MARE INTERNVM", 18.0, 35.0, 54, "#3a2614", False, 12, True),
                ("BRITANNIA", -2.0, 53.0, 44), ("GERMANIA", 9.5, 52.6, 44), ("HISPANIA", -4.0, 39.6, 46), ("ARMENIA", 43.5, 41.4, 40),
                ("IVDAEA", 35.6, 30.6, 38), ("PARTHIA", 44.5, 34.5, 46), ("ITALIA", 13.2, 43.2, 40)]:
        m.label(*lab)
    m.img = night_tint(m.img, .22)
    return m

def P(m, k): return m.proj(LL[k] if isinstance(k, str) else k)

# ======================================================= establishing shots: fortress at dusk (parallax, cached layers)
@functools.lru_cache(None)
def hills(k, seed):
    w = W + 700; img = np.zeros((H, w, 4), np.uint8)
    rng = np.random.default_rng(seed)
    base = [H * .58, H * .64, H * .74][k]; col = [(54, 46, 58), (36, 30, 40), (20, 16, 22)][k]
    xs = np.arange(0, w + 20, 20, dtype=np.float32)
    ph = rng.uniform(0, 6, 3)
    ys = base - 40 * np.sin(xs / (420 + 120 * k) + ph[0]) - 18 * np.sin(xs / 130 + ph[1]) - (k == 0) * 30 * np.sin(xs / 900 + ph[2])
    pts = np.vstack([np.stack([xs, ys], 1), [[w, H], [0, H]]])
    cv2.fillPoly(img, [(pts * 8).astype(np.int32)], col + (255,), cv2.LINE_AA, 3)
    return premult(img)

@functools.lru_cache(None)
def fortress_layer(build=1.0):
    """timber-and-stone fortress wall with a twin-towered gate (front silhouette lit by dusk), RGBA premult."""
    w = W + 400; img = np.zeros((H, w, 4), np.uint8)
    base = int(H * .80); top = int(H * .52)
    wall_c = (78, 64, 58, 255); dk = (44, 36, 34, 255); lit = (150, 110, 80, 255)
    cv2.rectangle(img, (0, top + 40), (w, base), wall_c, -1)
    for x in range(0, w, 46):   # crenellations
        cv2.rectangle(img, (x, top + 14), (x + 26, top + 40), wall_c, -1)
    for y in range(top + 60, base, 34):   # masonry courses
        cv2.line(img, (0, y), (w, y), dk, 2)
        off = 0 if (y // 34) % 2 else 40
        for x in range(off, w, 80): cv2.line(img, (x, y), (x, y + 34), dk, 2)
    gx = w // 2 + 60
    for sx in (-1, 1):   # gate towers
        tx = gx + sx * 190
        cv2.rectangle(img, (tx - 90, top - 90), (tx + 90, base), (88, 72, 64, 255), -1)
        for x in range(tx - 90, tx + 90, 40): cv2.rectangle(img, (x, top - 118), (x + 24, top - 90), (88, 72, 64, 255), -1)
        cv2.rectangle(img, (tx - 18, top - 40), (tx + 18, top + 10), (255, 190, 110, 255), -1)   # lit window
        cv2.line(img, (tx + sx * 90, top - 90), (tx + sx * 90, base), lit, 4)
    cv2.rectangle(img, (gx - 100, top + 30), (gx + 100, base), (88, 72, 64, 255), -1)
    cv2.ellipse(img, (gx, top + 150), (70, 70), 0, 180, 360, (16, 12, 12, 255), -1)
    cv2.rectangle(img, (gx - 70, top + 150), (gx + 70, base), (16, 12, 12, 255), -1)
    cv2.rectangle(img, (gx - 110, top + 40), (gx + 110, top + 72), (196, 180, 150, 255), -1)       # the new inscription slab
    cv2.rectangle(img, (gx - 110, top + 40), (gx + 110, top + 72), (90, 76, 60, 255), 3)
    for k in range(5):   # scaffold poles
        x = gx - 130 + k * 65
        cv2.line(img, (x, top - 30), (x + 6, base), (70, 48, 30, 255), 6)
    cv2.line(img, (gx - 140, top + 100), (gx + 140, top + 100), (70, 48, 30, 255), 6)
    cv2.line(img, (gx - 140, top + 20), (gx + 140, top + 20), (70, 48, 30, 255), 6)
    return premult(img)

def torch(f, x, y, t, seed=0, r=60):
    fl = .75 + .25 * math.sin(t * 13 + seed) * math.sin(t * 7.3 + seed * 2)
    ov = f.copy(); cv2.circle(ov, (int(x), int(y)), int(r * fl), (255, 170, 80), -1, cv2.LINE_AA)
    cv2.addWeighted(ov, .18, f, .82, 0, f)
    cv2.circle(f, (int(x), int(y)), int(9 * fl), (255, 220, 140), -1, cv2.LINE_AA)
    cv2.line(f, (int(x), int(y + 6)), (int(x), int(y + 40)), (50, 30, 18), 5, cv2.LINE_AA)

def fortress_scene(t, kind="dusk", pan=0.0, tint=0.0):
    f = sky(kind).copy()
    for k in range(2): blit(f, hills(k, 21 + k), -80 - pan * (20 + 30 * k), 0, 1.0, anchor="tl")
    blit(f, fortress_layer(), -200 - pan * 90, 0, 1.0, anchor="tl")
    gx = -200 - pan * 90 + (W + 400) // 2 + 60
    for k, dx in enumerate((-300, 300, -560, 560)): torch(f, gx + dx, H * .52 + 90, t, k)
    blit(f, hills(2, 29), -80 - pan * 160, 60, 1.0, anchor="tl")
    if tint: f = night_tint(f, tint)
    return f

# ======================================================= Roman props
@functools.lru_cache(None)
def tile_img(text="LEG HISP IX", w=420, h=300, seed=3):
    """terracotta roof tile (tegula) with a rectangular legionary stamp."""
    n = fbm(h, w, seed, 5, 5)[..., None]
    img = np.array([176, 92, 56], np.float32) * (.82 + .3 * n)
    img = np.clip(img, 0, 255).astype(np.uint8)
    cv2.rectangle(img, (0, 0), (w - 1, h - 1), (110, 54, 32), 10)
    cv2.rectangle(img, (0, 0), (40, h), (150, 76, 46), -1); cv2.rectangle(img, (w - 40, 0), (w, h), (150, 76, 46), -1)
    bx0, by0, bx1, by1 = 80, h // 2 - 46, w - 80, h // 2 + 46
    cv2.rectangle(img, (bx0, by0), (bx1, by1), (120, 58, 34), -1)
    spr = text_sprite(text, "cinzel", 44, "#e8b890", 900, shadow=False, spacing=4)
    blit(img, spr, w / 2 + 2, h / 2 + 3, 1.0)
    blit(img, text_sprite(text, "cinzel", 44, "#5a2a14", 900, shadow=False, spacing=4), w / 2, h / 2, 1.0)
    return img

@functools.lru_cache(None)
def book_img(w=300, h=420):
    img = np.zeros((h, w, 3), np.uint8); img[:] = (40, 70, 60)
    cv2.rectangle(img, (0, 0), (24, h), (24, 44, 38), -1)
    cv2.rectangle(img, (40, 30), (w - 20, h - 30), (214, 170, 80), 3)
    blit(img, text_sprite("THE EAGLE", "cinzel", 34, "#f0d890", 800, shadow=False), w / 2 + 10, 120, 1.0)
    blit(img, text_sprite("OF THE", "cinzel", 26, "#f0d890", 700, shadow=False), w / 2 + 10, 165, 1.0)
    blit(img, text_sprite("NINTH", "cinzel", 40, "#f0d890", 800, shadow=False), w / 2 + 10, 210, 1.0)
    blit(img, text_sprite("1954", "garamond", 30, "#e8e0c8", 600, shadow=False), w / 2 + 10, h - 80, 1.0)
    return img

def paste(f, img, x, y, a=1.0, sc=1.0, rot=0.0):
    al = np.ones(img.shape[:2] + (1,), np.float32)
    blit(f, (img.astype(np.float32), al), x, y, a, sc, rot=rot)

LEGIONS_165 = ["I ADIVTRIX", "I ITALICA", "I MINERVIA", "II ADIVTRIX", "II AVGVSTA", "II TRAIANA", "III AVGVSTA", "III CYRENAICA",
               "III GALLICA", "IV FLAVIA", "IV SCYTHICA", "V MACEDONICA", "VI FERRATA", "VI VICTRIX", "VII CLAVDIA", "VII GEMINA",
               "VIII AVGVSTA", None, "X FRETENSIS", "X GEMINA", "XI CLAVDIA", "XII FVLMINATA", "XIII GEMINA", "XIV GEMINA",
               "XV APOLLINARIS", "XVI FLAVIA", "XX VALERIA VICTRIX", "XXII PRIMIGENIA", "XXX VLPIA"]
GAP_I = LEGIONS_165.index(None)

@functools.lru_cache(None)
def column_list(gap=True):
    """marble column face with the legion list (our own layout; 28 legions known to exist c. AD 165)."""
    w, h = 760, 2700
    img = roman_stone(w, h, 9, False).astype(np.float32)
    img = np.clip(img * np.array([1.08, 1.06, 1.04]) + 10, 0, 255).astype(np.uint8)
    for k in range(0, w, 95): cv2.line(img, (k, 0), (k, h), (176, 168, 150), 6)   # flutes
    blit(img, text_sprite("NOMINA LEGIONVM", "cinzel", 56, "#3a2c1c", 900, shadow=False, spacing=6), w / 2, 90, 1.0)
    for i, nm in enumerate(LEGIONS_165):
        if nm is None: continue
        blit(img, text_sprite(f"LEG {nm}", "cinzel", 48, "#3a2c1c", 800, shadow=False, spacing=3), w / 2, 200 + i * 84, 1.0)
    return img

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
            spr = galleon(wd, silhouette=sil, seed=layer, cross=False)
            hh = spr[0].shape[0]
            blit(f, spr, x, yb - hh * .32, 1.0, 1.0, "c", 3 * toss * math.sin(t * 1.1 + x0))
    return f

# ======================================================= small drawing helpers for this video
def mini_stone(c, x, y, s, a, text="LEG VIIII HISP"):
    img = roman_stone(300, 170, 4, True)
    paste(c, img, x, y, a, s)
    blit(c, text_sprite(text, "cinzel", int(30 * s), "#3a2c1c", 900, shadow=False, spacing=2), x, y, a)

def mini_banner(c, x, y, s, a, txt="VI", col=(176, 128, 30)):
    cv2.line(c, (int(x), int(y - 110 * s)), (int(x), int(y + 110 * s)), (70, 48, 30), max(3, int(8 * s)), cv2.LINE_AA)
    cv2.rectangle(c, (int(x - 70 * s), int(y - 90 * s)), (int(x + 70 * s), int(y + 40 * s)), col, -1)
    cv2.rectangle(c, (int(x - 70 * s), int(y - 90 * s)), (int(x + 70 * s), int(y + 40 * s)), (40, 24, 10), 3)
    blit(c, text_sprite(txt, "cinzel", int(70 * s), "#fff0c0", 900, shadow=False), x, y - 25 * s, a)

def mini_tile(c, x, y, s, a):
    paste(c, cv2.resize(tile_img(), (int(300 * s), int(214 * s))), x, y, a, 1.0, rot=-6)

def mini_column(c, x, y, s, a):
    img = column_list()
    yo = 200 + (GAP_I - 2) * 84
    crop = img[yo:yo + 420, 60:700]
    crop = cv2.resize(crop, (int(300 * s), int(196 * s)))
    paste(c, crop, x, y, a)
    gy = y - 98 * s + (2 * 84 + 0) * 196 * s / 420
    cv2.rectangle(c, (int(x - 120 * s), int(gy - 14 * s)), (int(x + 120 * s), int(gy + 18 * s)), (200, 30, 30), 3, cv2.LINE_AA)
    blit(c, text_sprite("?", "cinzel", int(36 * s), "#c0392b", 900, shadow=False), x, gy, a)

def mini_eagle(c, x, y, s, a):
    blit(c, aquila(int(220 * s)), x, y, a)

def fort_plan(f, x, y, s, a=1.0, col=(70, 50, 30), fill=(196, 170, 120)):
    """playing-card shaped legionary fortress seen from above, 4 gates."""
    if a <= 0: return
    ov = f.copy()
    w_, h_ = 120 * s, 150 * s
    cv2.rectangle(ov, (int(x - w_), int(y - h_)), (int(x + w_), int(y + h_)), fill, -1)
    cv2.rectangle(ov, (int(x - w_), int(y - h_)), (int(x + w_), int(y + h_)), col, max(2, int(6 * s)))
    cv2.line(ov, (int(x - w_), int(y)), (int(x + w_), int(y)), col, max(1, int(3 * s)))
    cv2.line(ov, (int(x), int(y - h_)), (int(x), int(y + h_)), col, max(1, int(3 * s)))
    for k in range(-3, 4):
        for j in (-1, 1):
            cv2.rectangle(ov, (int(x + k * 30 * s - 8 * s), int(y + j * 70 * s - 18 * s)), (int(x + k * 30 * s + 8 * s), int(y + j * 70 * s + 18 * s)), (150, 120, 80), -1)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)

def camp_scene(t, fires=True):
    """night camp from above: palisade square, tents, camp fires (cached base)."""
    f = _camp_base().copy()
    if fires:
        for k, (x, y) in enumerate(((760, 470), (1160, 470), (760, 640), (1160, 640), (960, 560))):
            torch(f, x, y, t, k, 70)
    return f

@functools.lru_cache(None)
def _camp_base():
    f = night_tint(parchment(W, H, 71, .45), .55)
    x0, y0, x1, y1 = 560, 300, 1360, 800
    cv2.rectangle(f, (x0 - 20, y0 - 20), (x1 + 20, y1 + 20), (40, 30, 22), -1)
    cv2.rectangle(f, (x0, y0), (x1, y1), (70, 62, 50), -1)
    for x in range(x0 - 20, x1 + 20, 18):
        for yy in (y0 - 20, y1 + 6):
            cv2.rectangle(f, (x, yy), (x + 12, yy + 14), (96, 72, 44), -1)
    for y in range(y0 - 20, y1 + 20, 18):
        for xx in (x0 - 20, x1 + 6):
            cv2.rectangle(f, (xx, y), (xx + 14, y + 12), (96, 72, 44), -1)
    for i in range(6):
        for j in range(4):
            tx, ty = x0 + 90 + i * 125, y0 + 70 + j * 115
            cv2.fillPoly(f, [np.array([[tx - 34, ty + 26], [tx, ty - 26], [tx + 34, ty + 26]], np.int32)], (150, 136, 112), cv2.LINE_AA)
            cv2.line(f, (tx, ty - 26), (tx, ty + 26), (90, 80, 64), 2, cv2.LINE_AA)
    return f

def moor(t, pan=0.0):
    f = sky("night").copy()
    for k in range(3): blit(f, hills(k, 41 + k), -80 - pan * (25 + 40 * k), 0 if k < 2 else 40, 1.0, anchor="tl")
    return f

# ======================================================= SCENES
def s_cold_open(t, S):
    L = S.L
    if t < L[1] - .2:   # York, dusk: the new gate
        pan = prog(t, 0, L[1], ease_io)
        f = fortress_scene(t, "dusk", pan=pan * 1.4, tint=.15)
        fog(f, t, .3, seed=4)
        datestamp(f, "c. AD 108", t, .4)
        label_box(f, "YORK", W / 2, 170, window(t, .3, S.at(0, "Stonemasons") - .3), 96, CREAM)
        label_box(f, "A NEW STONE GATE", W / 2, 170, window(t, S.at(0, "Stonemasons") - .2, S.at(0, "Eboracum") - .3), 66, GOLD)
        label_box(f, "EBORACUM", W / 2, 170, window(t, S.at(0, "Eboracum") - .2, L[1] - .3), 96, CREAM)
        small_note(f, "Roman fortress · today York", W / 2, 255, window(t, S.at(0, "Eboracum"), L[1] - .3), 42)
        return f
    if t < L[2] - .2:   # the inscription is cut
        f = parch_bg(t, True, 1.0, 1.05, 10); dim(f, .25)
        z = 1 + .04 * prog(t, L[1], L[2] - L[1])
        paste(f, roman_stone(1560, 560, 2), W / 2, H / 2 + 40, 1.0, z)
        chisel(f, ["IMP CAESAR NERVA TRAIANVS AVG"], W / 2, H / 2 - 50, t, L[1] + .3, S.at(1, "Trajan") + .6 - L[1], 74)
        chisel(f, ["PER LEG VIIII HISP"], W / 2, H / 2 + 120, t, S.at(1, "The Ninth") - .6, 1.0, 96, red=True)
        g = window(t, S.at(1, "Hispana") - .3, 1e9)
        if g > 0:
            ov = f.copy(); cv2.rectangle(ov, (W // 2 - 520, H // 2 + 60), (W // 2 + 520, H // 2 + 180), (255, 200, 120), 6, cv2.LINE_AA)
            cv2.addWeighted(ov, .7 * g, f, 1 - .7 * g, 0, f)
        live_portrait(f, "trajan", 190, 190, 250, t, window(t, S.at(1, "Trajan") - .4, S.at(1, "the men") - .2), seed=2)
        plate(f, "TRAJAN", "emperor 98–117", 190, 350, t, S.at(1, "Trajan") - .2, S.at(1, "the men") - .2)
        label_box(f, "THE NINTH LEGION · HISPANA", W / 2, H - 130, window(t, S.at(1, "Ninth") - .2, L[2] - .3), 60, GOLD)
        return shake(f, t, S.at(1, "The Ninth") + .2, 6, .3)
    if t < L[3] - .2:   # ~5,000 men
        f = parch_bg(t, True, 1.0, 1.06, 12)
        yv = 640 - 60 * prog(t, L[2], L[3] - L[2])
        formation(f, W / 2, yv, 1300, 300, ROMC, t, kind="inf", flag=True, flag_color=ROMC, emblem="eagle", seed=11, alpha=prog(t, L[2] - .2, .6))
        counter(f, 5000 * ease_out((t - L[2]) / 2.0), W / 2, 200, 150, a=prog(t, L[2], .4))
        small_note(f, "professional soldiers (approx.)", W / 2, 300, window(t, L[2] + .2, S.at(2, "Veterans") - .3), 44)
        for k, (ph, lab) in enumerate((("conquest", "THE CONQUEST OF BRITAIN"), ("Boudica", "BOUDICA'S REVOLT"), ("far north", "WARS IN THE FAR NORTH"))):
            nxt = [S.at(2, "Boudica"), S.at(2, "far north"), L[3]][k]
            label_box(f, lab, W / 2, 310, window(t, S.at(2, ph) - .2, nxt - .3), 58, GOLD)
        return f
    if t < L[4] - .2:   # last record in Britain
        f = parch_bg(t, True, 1.02, 1.06, 8)
        case_timeline(f, t, 220, 1700, 600, 40, 180, [(108, "YORK STONE", L[3] + .6, "last")], t0=L[3] - .2, cursor=(108, L[3] - .1))
        headline(f, "THE LAST RECORD IN BRITAIN", t, L[3] + .1, 1e9, y=250, size=74)
        return f
    if t < L[6] - .2:   # the list in Rome
        f = night_tint(parch_bg(t, True, 1.0, 1.04, 12), .2); dim(f, .2)
        img = column_list()
        yo_end = 200 + GAP_I * 84 - H / 2
        yo = int(lerp(-200, yo_end, prog(t, L[4], L[5] - L[4] + .2, ease_io)))
        crop = np.zeros((H, img.shape[1], 3), np.uint8)
        s0, s1 = max(0, yo), min(img.shape[0], yo + H)
        crop[s0 - yo:s1 - yo] = img[s0:s1]
        al = np.zeros((H, img.shape[1], 1), np.float32); al[s0 - yo:s1 - yo] = 1
        blit(f, (crop.astype(np.float32) * al, al), W / 2, H / 2, prog(t, L[4] - .2, .5))
        datestamp(f, "ROME · c. AD 165", t, L[4] + .2, L[5] - .4)
        gy = 200 + GAP_I * 84 - yo
        if t > L[5] - .3:
            a = prog(t, L[5] - .3, .4)
            ov = f.copy(); cv2.rectangle(ov, (W // 2 - 330, int(gy - 36)), (W // 2 + 330, int(gy + 36)), (150, 20, 20), -1); cv2.addWeighted(ov, .35 * a, f, 1 - .35 * a, 0, f)
            cv2.rectangle(f, (W // 2 - 330, int(gy - 36)), (W // 2 + 330, int(gy + 36)), (220, 40, 30), 4, cv2.LINE_AA)
            blit(f, text_sprite("VIIII ?", "cinzel", 54, "#ffb0a0", 900, stroke=2, glow="#000000", spacing=6), W / 2, gy, a * (.6 + .4 * math.sin(t * 5) ** 2))
            label_box(f, "VIII", W / 2 - 520, gy - 84, a, 50, "#c9b48a"); label_box(f, "X", W / 2 - 520, gy + 84, a, 50, "#c9b48a")
            headline(f, "THE NINTH IS NOT ON IT", t, L[5], 1e9, y=H - 120, size=76, grad=("#ffe0c8", "#c0392b"))
        return f
    if t < L[7] - .2:   # no report, no surrender, no eagle
        f = night_tint(parch_bg(t, True, 1.0, 1.05, 8), .35)
        fog(f, t, .3, seed=8, low=False)
        sink = prog(t, S.at(6, "drops out") - .3, 2.0, ease_io)
        g = prog(t, S.at(6, "captured eagle") - .2, .8)
        blit(f, aquila(420), W / 2 + 420, 470 + 260 * sink, (1 - g) * (1 - sink))
        blit(f, aquila(420, True), W / 2 + 420, 470 + 260 * sink, g * (1 - sink))
        fog(f, t, .35 * sink, seed=9)
        for k, (ph, lab) in enumerate((("No battle", "NO BATTLE REPORT"), ("No surrender", "NO SURRENDER"), ("No captured", "NO CAPTURED EAGLE"))):
            y = 300 + k * 150; a = prog(t, S.at(6, ph) - .2, .4)
            label_box(f, lab, 640, y, a, 58, CREAM)
            if a > 0: crossmark(f, 150, y, t, S.at(6, ph) + .5, 40)
        return f
    f = board_bg(t)
    z = 1 + .05 * prog(t, L[7], S.D - L[7])
    draws = [mini_stone, mini_tile, mini_column, mini_eagle]
    titles = ["THE YORK STONE", "STAMPED TILES", "THE LIST IN ROME", "THE EAGLE"]
    for k in range(4):
        x, y, rot = [(330, 400, -4), (760, 690, 3), (1170, 400, -2), (1600, 690, 4)][k]
        evidence_card(f, k + 1, titles[k], x, y, t, L[7] + .2 + k * .45, 1e9, draw=draws[k], w=340, h=400, rot=rot)
    for k in range(3):
        red_string(f, [((330, 222), (760, 512), (1170, 222), (1600, 512))[k], ((760, 512), (1170, 222), (1600, 512))[k]], t, L[7] + 1.0 + k * .45, .5)
    stamp(f, "CASE 02", 300, H - 120, t, S.at(7, "case file") - .1, 70, rot=-6)
    headline(f, "FOLLOW THE EVIDENCE", t, S.at(7, "follow") - .2, 1e9, y=H - 110, size=72)
    return f

def s_title(t, S):
    f = night_tint(parch_bg(t, True, 1.0, 1.08, 5), .3)
    fog(f, t, .3, seed=9)
    blit(f, aquila(560, True), W / 2, 470, .22 * prog(t, 0, .8))
    a = prog(t, .05, .6)
    sc = 1.12 - .12 * ease_out((t - .05) / 1.4)
    blit(f, text_sprite("HISTORY SOURCED: UNSOLVED", "cinzel", 40, GOLD, 800, stroke=2, glow="#000000", spacing=12), W / 2, 220, a)
    blit(f, text_sprite("THE LOST", "cinzel", 70, CREAM, 800, stroke=3, glow="#000000", spacing=18), W / 2, 330, a)
    blit(f, text_sprite("NINTH LEGION", "cinzel", 170, CREAM, 900, stroke=4, gradient=("#f4f2ea", "#c9a46a"), glow="#5a1a10", spacing=14), W / 2, 480, a, sc)
    p = prog(t, .5, .8)
    if p > 0: cv2.line(f, (int(W / 2 - 600 * p), 610), (int(W / 2 + 600 * p), 610), (214, 170, 80), 4, cv2.LINE_AA)
    blit(f, text_sprite("LEGIO VIIII HISPANA  ·  AD 43 – ?", "cinzel", 54, CREAM, 600, stroke=2, glow="#000000", spacing=6), W / 2, 685, prog(t, .8, .6))
    stamp(f, "UNSOLVED", W / 2 + 520, 870, t, 1.4, 84, rot=-9)
    blit(f, text_sprite("CASE 02", "cinzel", 34, "#c9b48a", 700, stroke=2, glow="#000000", spacing=10), W / 2 - 520, 870, prog(t, 1.2, .5))
    return shake(f, t, 1.45, 8, .3)

def s_invasion(t, S):
    L = S.L
    if t < L[1] - .2:   # Hispana: the Spanish
        m = empire_map(); sp = P(m, "spain")
        c = cam_path(t, [(0, (m.BW * .45, m.BH * .52, .62)), (L[1] - .5, (sp[0] + 260, sp[1] - 40, 1.25))])
        f = c.render(m.img)
        header(f, "LEGIO VIIII HISPANA", t, .1, L[1] - .3)
        blit(f, aquila(330), 250, 560, prog(t, .3, .6))
        place(f, c, m, "spain", "SPAIN", t, S.at(0, "Hispana") - .3, "r", ROMC, 50, 15, pulse=True)
        label_box(f, "\"THE SPANISH\"", W / 2 + 300, H - 170, window(t, S.at(0, "the Spanish") - .3, S.at(0, "probably") + .8), 60, GOLD)
        small_note(f, "service in Spain under Augustus (probably)", W / 2 + 250, H - 170, window(t, S.at(0, "Augustus") - .6, L[1] - .3), 46)
        return f
    m = britain_map()
    if t < L[2] - .2:   # AD 43: four legions
        rb = P(m, "richborough"); ld = P(m, "london")
        c = cam_path(t, [(L[1] - .2, (rb[0] - 250, rb[1] - 80, 1.5)), (L[2], ((rb[0] + ld[0]) / 2, ld[1] - 60, 1.7))])
        f = c.render(m.img)
        datestamp(f, "AD 43", t, L[1])
        for k in range(4):
            a0 = c.pt(m.proj((1.25 - k * .05, 51.22 + k * .06))); a1 = c.pt(m.proj((-1.1 + k * .5, 51.35 + k * .3)))
            pts = curve(a0, a1, .08 * (k - 1.5), 40)
            march_column(f, pts, prog(t, L[1] + .4 + k * .3, 6.0, ease_out), 300, ROMC, t, ranks=3, px=22, seed=k, flag=True)
        label_box(f, "4 LEGIONS", W / 2, 150, window(t, S.at(1, "four legions") - .3, L[2] - .3), 64, GOLD)
        small_note(f, "sent by the emperor Claudius", W / 2, 230, window(t, S.at(1, "Claudius") - .3, L[2] - .3), 44)
        return f
    co = P(m, "colchester"); li = P(m, "lincoln")
    if t < L[4] - .2:   # Boudica, Colchester burns, Cerialis marches
        c = cam_path(t, [(L[2] - .2, (co[0] - 200, co[1] - 30, 1.7)), (L[3], ((co[0] + li[0]) / 2, (co[1] + li[1]) / 2, 1.15)), (L[4], ((co[0] + li[0]) / 2 + 60, (co[1] + li[1]) / 2 + 40, 1.3))])
        f = c.render(m.img)
        datestamp(f, "AD 60 / 61", t, L[2])
        x, y = place(f, c, m, "colchester", "CAMVLODVNVM", t, S.at(2, "Colchester") - .8, "d", BLOODC, 40, 14)
        bt = S.at(2, "burned") - .3
        if t > bt:
            fire_line(f, [(x - 90, y + 20), (x - 30, y - 10), (x + 40, y + 15), (x + 100, y - 5)], t, prog(t, bt, .8), seed=3, h=70)
            smoke(f, t, .35 * prog(t, bt, 1.5), seed=7, speed=50)
        if t < L[3] - .2:
            live_portrait(f, "boudica", W - 260, 300, 330, t, window(t, S.at(2, "Boudica") - .4, L[3] - .3), angry=True, seed=3)
            plate(f, "BOUDICA", "queen of the Iceni", W - 260, 500, t, S.at(2, "Boudica") - .3, L[3] - .3)
        else:
            lx, ly = place(f, c, m, "lincoln", "LINDVM", t, L[3] - .2, "u", ROMC, 36)
            route = curve((lx, ly), (x, y), .1, 50)
            hp = march_column(f, route, .58 * prog(t, L[3], 3.5, ease_out), 300, ROMC, t, ranks=3, px=22, seed=5)
            if t > S.at(3, "never") - .4 and hp is not None:
                for k in range(3):
                    formation(f, hp[0] + 140 + k * 40, hp[1] - 110 + k * 110, 120, 70, BRITC, t, kind="inf", flag=False, seed=20 + k, alpha=prog(t, S.at(3, "never") - .4 + k * .15, .4))
            live_portrait(f, "cerialis", 260, 300, 300, t, window(t, L[3] - .1, L[4] - .3), seed=4)
            plate(f, "PETILLIUS CERIALIS", "commander of the Ninth", 300, 485, t, L[3], L[4] - .3)
            label_box(f, "HE NEVER GOT THERE", W / 2, H - 130, window(t, S.at(3, "never") - .2, L[4] - .3), 60, "#ffb0a0")
        return f
    if t < L[5] - .2:   # the ambush: infantry destroyed, cavalry escapes
        f = parch_bg(t, True, 1.0, 1.05, 10)
        hit = S.at(4, "routed") - .3
        st = 1 - .92 * prog(t, S.at(4, "destroyed") - .2, 2.0)
        rout = .6 * prog(t, S.at(4, "destroyed") + .8, 1.5)
        formation(f, W / 2, 470, 520, 180, ROMC, t, kind="inf", strength=st, rout=rout, flag=True, flag_color=ROMC, emblem="eagle", seed=31, label="LEG VIIII · INFANTRY")
        for k, (x0, y0, x1, y1) in enumerate(((200, 300, 620, 420), (1720, 300, 1300, 420), (300, 760, 760, 600), (1640, 760, 1180, 600))):
            pp = prog(t, hit - 1.0 + k * .2, 1.4, ease_io)
            formation(f, lerp(x0, x1, pp), lerp(y0, y1, pp), 300, 130, BRITC, t, kind="inf", flag=False, seed=40 + k)
        esc = prog(t, S.at(4, "Cerialis escaped") - .2, 3.0, ease_io)
        formation(f, lerp(W / 2 + 200, 1700, esc), lerp(330, 170, esc), 160, 70, ROMC, t, kind="cav", flag=False, seed=50, alpha=prog(t, S.at(4, "Cerialis") - .5, .4))
        if esc > 0:
            cv2.rectangle(f, (1620, 90), (1860, 250), (90, 64, 36), 6, cv2.LINE_AA)
            small_note(f, "camp", 1740, 280, prog(t, S.at(4, "Cerialis") - .3, .4), 36)
        grade(f, red=.4 * window(t, S.at(4, "destroyed") - .2, S.at(4, "Cerialis") - .2))
        quote_card(f, ["routed his troops, and destroyed all his infantry"], "Tacitus, Annals XIV.32", t, S.at(4, "Tacitus") - .3, S.at(4, "Cerialis") - .3, x=W / 2, y=H - 150, w=1300, size=46, seal=True)
        return shake(f, t, S.at(4, "destroyed"), 9, .5)
    m2 = empire_map(); ge = P(m2, "germany"); br = m2.proj((-0.6, 52.6))
    c = cam_path(t, [(L[5] - .2, ((ge[0] + br[0]) / 2, (ge[1] + br[1]) / 2, 1.5)), (S.D, ((ge[0] + br[0]) / 2 - 30, (ge[1] + br[1]) / 2, 1.7))])
    f = c.render(m2.img)
    r = curve(c.pt(ge), c.pt(br), .2, 50)
    arrow(f, r, prog(t, L[5] + .3, 1.6, ease_io), (214, 170, 80), 12, head=34)
    oob_row(f, 760, 860, t, S.at(5, "two thousand") - .3, "inf", ROMC, "legionaries sent from Germany", 2000, seed=3)
    headline(f, "FOR NOW", t, S.at(5, "For now") - .1, 1e9, y=180, size=96, grad=("#ffe0c8", "#c0392b"))
    return f

def s_york(t, S):
    L = S.L
    m = britain_map()
    yk = P(m, "york"); li = P(m, "lincoln")
    if t < L[1] - .2:   # north to York, the fortress where two rivers meet
        c = cam_path(t, [(0, ((yk[0] + li[0]) / 2, (yk[1] + li[1]) / 2, 1.6)), (S.at(0, "fortress") - .3, ((yk[0] + li[0]) / 2, yk[1] + 60, 1.9)), (L[1] - .2, (yk[0], yk[1], 3.4))])
        f = c.render(m.img)
        datestamp(f, "c. AD 71", t, .3)
        lx, ly = c.pt(li); x, y = c.pt(yk)
        march_column(f, curve((lx, ly), (x, y), -.1, 40), prog(t, .5, S.at(0, "fortress") - .8, ease_out), 320, ROMC, t, ranks=3, px=22, seed=7)
        rv = prog(t, S.at(0, "two rivers") - .3, 1.0)
        if rv > 0:
            for pts in ([(-1.6, 54.32), (-1.35, 54.12), (-1.15, 54.02), yk_ll(), (-1.02, 53.85), (-0.85, 53.72)], [(-0.82, 54.2), (-0.95, 54.08), (-1.04, 54.0), yk_ll()]):
                q = c.pts([m.proj(p) for p in pts])
                arrow(f, q, rv, (90, 130, 150), 7, outline=(40, 60, 70), head=0)
        fort_plan(f, x, y, .32 * c.z / 3.4 * 2.2, prog(t, S.at(0, "fortress") - .2, .6))
        label_box(f, "EBORACUM", x + 230, y - 60, window(t, S.at(0, "Eboracum") - .3, L[1] - .3), 56, CREAM)
        small_note(f, "today: York", x + 230, y + 10, window(t, S.at(0, "Today") - .3, L[1] - .3), 44)
        return f
    if t < L[2] - .2:   # Agricola into Scotland
        ca = P(m, "camp9")
        c = cam_path(t, [(L[1] - .2, (yk[0], yk[1] - 100, 1.3)), (L[2], ((yk[0] + ca[0]) / 2, (yk[1] + ca[1]) / 2, 1.05))])
        f = c.render(m.img)
        datestamp(f, "AD 77 – 84", t, L[1])
        march_column(f, curve(c.pt(yk), c.pt(ca), .12, 60), prog(t, L[1] + .3, L[2] - L[1] - .8, ease_io), 420, ROMC, t, ranks=3, px=20, seed=8)
        live_portrait(f, "agricola", W - 250, 300, 300, t, window(t, S.at(1, "Agricola") - .4, L[2] - .3), seed=5)
        plate(f, "AGRICOLA", "governor of Britain", W - 250, 485, t, S.at(1, "Agricola") - .2, L[2] - .3)
        locator(f, empire_map(), LL["caledonia"], t, x=180, y=150, w=300, box_deg=8)
        return f
    if t < L[4] - .2:   # night attack on the camp
        f = camp_scene(t)
        inside = 1 - .7 * prog(t, S.at(3, "broke") - .2, 1.5)
        formation(f, 960, 560, 380, 160, ROMC, t, kind="inf", strength=inside, flag=True, flag_color=ROMC, emblem="eagle", seed=60, label="VIIII")
        at_ = S.at(2, "attacked") - .5
        for k, (x0, y0, x1, y1) in enumerate(((-150, 300, 450, 420), (2070, 360, 1470, 470), (960, 1250, 960, 900), (-100, 900, 470, 760))):
            pp = prog(t, at_ + k * .25, 2.2, ease_io)
            br_ = prog(t, S.at(3, "broke") - .2, 1.2, ease_io)
            xx, yy = lerp(x0, x1, pp), lerp(y0, y1, pp)
            xx, yy = lerp(xx, lerp(xx, 960, .45), br_), lerp(yy, lerp(yy, 560, .45), br_)
            rout = prog(t, S.at(3, "arrival") + .8, 1.5)
            formation(f, xx, yy, 260, 120, BRITC, t, kind="inf", flag=False, seed=70 + k, rout=rout)
        ar = prog(t, S.at(3, "arrival") - .3, 2.0, ease_out)
        if ar > 0:
            formation(f, lerp(-300, 300, ar), 560, 300, 260, ROMC, t, kind="cav", flag=True, flag_color=ROMC, emblem="eagle", seed=80, label="AGRICOLA")
            formation(f, lerp(2200, 1640, ar), 560, 300, 260, ROMC, t, kind="inf", flag=True, flag_color=ROMC, emblem="eagle", seed=81)
        if t < L[3] - .2:
            live_portrait(f, "caledonian", 250, 200, 260, t, window(t, S.at(2, "Caledonians") - .4, L[3] - .3), angry=True, seed=6)
            plate(f, "CALEDONIANS", None, 250, 370, t, S.at(2, "Caledonians") - .2, L[3] - .3)
            quote_card(f, ["... the ninth legion, as being the weakest"], "Tacitus, Agricola 26", t, S.at(2, "because") - .5, L[3] - .3, x=W / 2, y=H - 140, w=1200, size=48, seal=True)
        else:
            label_box(f, "THE CAMP IS BREACHED", W / 2, 120, window(t, S.at(3, "broke") - .2, S.at(3, "Only") - .3), 60, "#ffb0a0")
            label_box(f, "RESCUED BY AGRICOLA", W / 2, 120, window(t, S.at(3, "Only") - .2, L[4] - .3), 60, GOLD)
        f = shake(f, t, S.at(3, "broke"), 9, .45)
        return f
    f = parch_bg(t, True, 1.02, 1.06, 10)
    case_timeline(f, t, 220, 1700, 560, 40, 180, [(61, "BOUDICA", L[4] + .3, "gone"), (82, "NIGHT ATTACK", L[4] + .9, "gone")], t0=L[4] - .2)
    headline(f, "MAULED TWICE", t, S.at(4, "mauled") - .2, S.at(4, "Remember") - .2, y=250, size=96, grad=("#ffe0c8", "#c0392b"))
    headline(f, "REMEMBER THAT", t, S.at(4, "Remember") - .1, 1e9, y=250, size=96)
    small_note(f, "the root of the most famous theory", W / 2, 860, window(t, S.at(4, "foundation") - .3, 1e9), 48)
    return f

def yk_ll(): return LL["york"]

INSCR = ["IMP CAESAR DIVI NERVAE F NERVA", "TRAIANVS AVG GERM DACICVS", "PONTIFEX MAXIMVS TRIB POTESTATIS XII", "IMP VI COS V P P PORTAM", "PER LEG VIIII HISP FECIT"]

def s_lastseen(t, S):
    L = S.L
    if t < L[1] - .2:
        f = board_bg(t)
        evidence_card(f, 1, "THE YORK STONE", W / 2, H / 2 + 20, t, .3, 1e9, draw=lambda c, x, y, s, a: mini_stone(c, x, y, s * 1.2, a), w=520, h=560, rot=-2, sub="last dated record in Britain")
        stamp(f, "EXHIBIT 01", W / 2 + 430, 250, t, S.at(0, "Exhibit one") - .1, 70, rot=8)
        return shake(f, t, S.at(0, "Exhibit one"), 6, .3)
    if t < L[2] - .2:   # found 1854
        f = parch_bg(t, True, 1.0, 1.04, 8)
        for k, col in enumerate(((120, 86, 52), (104, 74, 46), (88, 62, 38), (72, 52, 32))):
            cv2.rectangle(f, (0, 520 + k * 140), (W, 660 + k * 140), col, -1)
        up = prog(t, L[1] + .2, 2.5, ease_out)
        paste(f, roman_stone(760, 280, 2), W / 2, lerp(900, 560, up), 1.0, 1.0)
        chisel(f, ["LEG VIIII HISP"], W / 2, lerp(900, 560, up), t, 0, .01, 64, chips=False)
        blit(f, ico("trowel", 180), 1460 + 20 * math.sin(t * 4), 560, prog(t, L[1], .4), rot=20 * math.sin(t * 4))
        label_box(f, "FOUND 1854", W / 2, 170, window(t, S.at(1, "eighteen") - .4, 1e9), 90, GOLD)
        small_note(f, "King's Square, York · near the site of the fortress's south-east gate", W / 2, 280, window(t, S.at(1, "close") - .4, 1e9), 42)
        return f
    f = parch_bg(t, True, 1.0, 1.03, 14); dim(f, .2)
    z = 1 + .05 * prog(t, L[2], S.D - L[2])
    if t > L[4] - .2:
        case_timeline(f, t, 220, 1700, 560, 40, 180, [(43, "INVASION", L[4] - .1, "seen"), (61, "BOUDICA", L[4], "seen"), (71, "YORK", L[4] + .1, "seen"),
                                                     (82, "CALEDONIA", L[4] + .2, "seen"), (108, "YORK STONE", L[4] + .5, "last")],
                      t0=L[4] - .2, gap=(108, 180, S.at(4, "no dated") - .2), label_size=26)
        header(f, "THE NINTH IN BRITAIN · DATED RECORDS", t, L[4] - .2)
        return f
    paste(f, roman_stone(1700, 640, 3), W / 2, H / 2, 1.0, z)
    sz = 54
    chisel(f, INSCR, W / 2, H / 2, t, L[2] - .2, 2.2, sz, spacing=6, lh=1.5, chips=True)
    small_note(f, "RIB 665 · text partly restored", W - 300, 60, prog(t, L[2] + 1.0, .5), 34)
    # highlight XII (end of line 3) and the last line
    yl = lambda i: H / 2 + (i - 2) * sz * 1.5
    full3 = text_sprite(INSCR[2], "cinzel", sz, "#000", 900, shadow=False, spacing=6)[0].shape[1]
    w12 = text_sprite("XII", "cinzel", sz, "#000", 900, shadow=False, spacing=6)[0].shape[1]
    xr = W / 2 + full3 / 2 - sz * .6
    h1 = window(t, S.at(2, "twelfth") - .2, L[3] - .3)
    if h1 > 0:
        ov = f.copy(); cv2.ellipse(ov, (int(xr - w12 / 2 + sz * .6), int(yl(2))), (int(w12 * .55), int(sz * .8)), 0, 0, 360, (200, 30, 30), 5, cv2.LINE_AA)
        cv2.addWeighted(ov, h1, f, 1 - h1, 0, f)
        label_box(f, "= AD 107 / 108", W / 2, 170, window(t, S.at(2, "dates") - .3, L[3] - .3), 72, GOLD)
        label_box(f, "12TH YEAR OF TRIBUNICIAN POWER", W / 2, 170, window(t, S.at(2, "twelfth") - .2, S.at(2, "dates") - .3), 52, CREAM)
    h2 = window(t, L[3] - .2, 1e9)
    if h2 > 0:
        ov = f.copy(); cv2.rectangle(ov, (W // 2 - 520, int(yl(4) - sz)), (W // 2 + 520, int(yl(4) + sz)), (220, 40, 30), 6, cv2.LINE_AA)
        cv2.addWeighted(ov, h2, f, 1 - h2, 0, f)
        label_box(f, "\"...BY THE NINTH LEGION HISPANA\"", W / 2, H - 120, h2, 56, GOLD)
    return f

def s_silence(t, S):
    L = S.L
    m = britain_map()
    if t < L[1] - .2:
        tr = S.at(0, "And Britain") - .3
        if t < tr:
            f = parch_bg(t, True, 1.0, 1.05, 8)
            datestamp(f, "AD 117", t, .3)
            live_portrait(f, "hadrian", W / 2, 470, 460, t, prog(t, .2, .5), seed=7)
            plate(f, "HADRIAN", "emperor 117–138", W / 2, 760, t, .5)
            return f
        yk = P(m, "york")
        c = cam_path(t, [(tr, (yk[0], yk[1] - 260, 1.25)), (L[1], (yk[0], yk[1] - 300, 1.4))])
        f = c.render(m.img)
        rng = np.random.default_rng(4)
        for k in range(7):
            ll = (-3.4 + rng.uniform(0, 2.6), 54.4 + rng.uniform(0, 1.6))
            x, y = c.pt(m.proj(ll)); p = prog(t, tr + .2 + k * .2, .5)
            if p > 0:
                rr = 40 + 30 * math.sin(t * 3 + k)
                ov = f.copy(); cv2.circle(ov, (int(x), int(y)), int(rr * p), (190, 30, 30), -1, cv2.LINE_AA); cv2.addWeighted(ov, .3, f, .7, 0, f)
                cv2.circle(f, (int(x), int(y)), int(10 * p), (220, 40, 30), -1, cv2.LINE_AA)
        smoke(f, t, .25 * prog(t, tr, 1.0), seed=12, speed=40)
        label_box(f, "TROUBLE IN BRITAIN", W / 2, 150, prog(t, tr + .2, .4), 66, "#ffb0a0")
        return f
    if t < L[2] - .2:
        f = parch_bg(t, True, 1.0, 1.04, 10)
        live_portrait(f, "hadrian", 260, 300, 300, t, prog(t, L[1] - .2, .4), seed=7)
        quote_card(f, ["the Britons could not be kept", "under Roman sway"], "Historia Augusta, Life of Hadrian 5", t, L[1], 1e9, x=W / 2 + 160, y=H / 2 + 40, w=1300, size=56, seal=True)
        return f
    if t < L[3] - .2:   # Fronto -> Marcus Aurelius
        f = parch_bg(t, True, 1.0, 1.04, 12)
        live_portrait(f, "fronto", 330, 330, 320, t, prog(t, L[2] - .1, .4), talk="voice" if S.at(2, "Fronto") < t < S.at(2, "how many") else None, T=S.start + t, seed=8)
        plate(f, "FRONTO", "tutor and writer", 330, 530, t, S.at(2, "Fronto") - .2)
        live_portrait(f, "aurelius", W - 330, 330, 320, t, prog(t, S.at(2, "Marcus") - .3, .4), seed=9)
        plate(f, "MARCUS AURELIUS", "emperor 161–180", W - 330, 530, t, S.at(2, "Marcus") - .2)
        lp = prog(t, S.at(2, "reminded") - .2, 1.4, ease_io)
        if lp > 0:
            cv2.ellipse(f, (int(lerp(560, W - 560, lp)), 330), (60, 40), 0, 0, 360, (230, 214, 176), -1, cv2.LINE_AA)
            cv2.ellipse(f, (int(lerp(560, W - 560, lp)), 330), (60, 40), 0, 0, 360, (120, 86, 50), 3, cv2.LINE_AA)
        quote_card(f, ["what a number of soldiers were killed by the Jews,", "what a number by the Britons"], "Fronto, letter to Marcus Aurelius, c. AD 162",
                   t, S.at(2, "how many") - .4, 1e9, x=W / 2, y=H - 230, w=1500, size=46, seal=True)
        return f
    if t < L[4] - .2:   # AD 122: the wall
        w0 = P(m, "bowness"); w1 = P(m, "wallsend")
        c = cam_path(t, [(L[3] - .2, ((w0[0] + w1[0]) / 2, w0[1] + 120, 1.3)), (L[4], ((w0[0] + w1[0]) / 2, w0[1] + 40, 1.9))])
        f = c.render(m.img)
        datestamp(f, "AD 122", t, L[3])
        q = c.pts([m.proj(p) for p in WALL])
        wp = prog(t, S.at(3, "wall") - .5, 2.2, ease_io)
        if wp > 0:
            arrow(f, q, wp, (196, 184, 160), 16, outline=(60, 44, 30), head=0)
            pq = partial(q, wp)
            for k in range(0, len(pq), 4):
                cv2.rectangle(f, (int(pq[k][0] - 5), int(pq[k][1] - 16)), (int(pq[k][0] + 5), int(pq[k][1] - 6)), (196, 184, 160), -1)
        live_portrait(f, "hadrian", 250, 820, 260, t, window(t, L[3], L[4] - .3), seed=7)
        label_box(f, "HADRIAN'S WALL", W / 2, 200, window(t, S.at(3, "wall") - .2, L[4] - .3), 70, GOLD)
        label_box(f, "HADRIAN IN BRITAIN", W / 2, 200, window(t, S.at(3, "in person") - .3, S.at(3, "wall") - .3), 60, CREAM)
        return f
    yk = P(m, "york")
    if t < L[5] - .2:   # the Sixth arrives at York
        c = cam_path(t, [(L[4] - .2, (yk[0] + 120, yk[1] - 20, 2.0)), (L[5], (yk[0] + 40, yk[1], 2.6))])
        f = c.render(m.img)
        x, y = c.pt(yk)
        src = c.pt(m.proj((0.4, 53.62)))
        fort_plan(f, x, y, .35, 1.0)
        march_column(f, curve(src, (x, y + 60), .15, 50), prog(t, L[4] + .2, 4.5, ease_out), 360, VIC, t, ranks=3, px=22, seed=9, flag=False)
        hd = along(curve(src, (x, y + 60), .15, 50), prog(t, L[4] + .2, 4.5, ease_out))
        banner(f, hd[0], hd[1] - 10, t, VIC, h=80, seed=3, emblem="eagle")
        label_box(f, "LEGIO VI VICTRIX", W / 2, 150, window(t, S.at(4, "Sixth") - .3, L[5] - .3), 66, GOLD)
        small_note(f, "moves into the fortress at York", W / 2, 230, window(t, S.at(4, "moved into") - .3, L[5] - .3), 44)
        return f
    c = Cam(yk[0], yk[1], 3.0); f = c.render(m.img)
    x, y = c.pt(yk)
    fort_plan(f, x, y + 40, .7, 1.0)
    mini_banner(f, x - 90, y + 20, 1.0, 1.0, "VI", VIC)
    g = 1 - prog(t, L[5] + .5, 1.5)
    mini_banner(f, x + 120, y + 20, 1.0, .3 + .7 * g, "VIIII", ROMC)
    if g < 1: crossmark(f, x + 120, y + 5, t, L[5] + 1.0, 90)
    dim(f, .4 * prog(t, S.at(5, "Where") - .3, .5))
    headline(f, "WHERE DID 5,000 MEN GO?", t, S.at(5, "Where") - .1, 1e9, y=200, size=96, grad=("#ffe0c8", "#c0392b"))
    return f

EV = [("YORK · c. AD 108", "the last dated stone", mini_stone), ("VI VICTRIX AT YORK", "by about AD 122", lambda c, x, y, s, a: mini_banner(c, x, y, s, a, "VI", VIC)),
      ("NIJMEGEN TILES", "stamped tiles + a pendant", mini_tile), ("MISSING · c. AD 165", "not on the list in Rome", mini_column)]
EVPOS = [(330, 420, -4), (760, 700, 3), (1170, 420, -2), (1600, 700, 4)]

def evidence_board(f, t, t0s, a=1.0):
    for k, (title, sub, dr) in enumerate(EV):
        x, y, rot = EVPOS[k]
        evidence_card(f, k + 1, title, x, y, t, t0s[k], 1e9, draw=dr, w=380, h=430, rot=rot, sub=sub, a=a)
    pins = [(EVPOS[k][0], EVPOS[k][1] - 215 + 22) for k in range(4)]
    for k in range(3):
        red_string(f, [pins[k], pins[k + 1]], t, t0s[k + 1] + .3, .6, a)

def s_evidence(t, S):
    L = S.L
    f = board_bg(t)
    header(f, "WHAT WE KNOW", t, .2)
    evidence_board(f, t, [L[1], L[2], L[3], L[4]])
    if t < L[1] - .2:
        small_note(f, "four facts from stone and clay", W / 2, H - 120, window(t, .5, L[1] - .3), 46)
    if L[3] + 1.5 < t < L[4] - .3:   # inset: where Nijmegen is
        locator(f, empire_map(), LL["nijmegen"], t, x=W - 400, y=60, w=340, box_deg=6, label="NIJMEGEN")
    z = 1 + .12 * prog(t, L[5] - .2, 3.0, ease_io)
    if z > 1.001:
        M = np.float32([[z, 0, W / 2 - W / 2 * z], [0, z, H / 2 - H / 2 * z]])
        f = cv2.warpAffine(f, M, (W, H), borderMode=cv2.BORDER_REFLECT)
        dim(f, .45 * prog(t, L[5] - .2, .8))
        headline(f, "NOW, THE THEORIES", t, L[5], 1e9, y=H / 2, size=96)
    return f

def verdict_panel(f, t, t0, title, score, word, note, stamp_txt=None, stamp_t=None, grad=("#fff4d0", "#e0a640")):
    blit(f, text_sprite(word, "cinzel", 104, CREAM, 900, stroke=3, gradient=grad, glow="#000000", spacing=8), W / 2, 330, prog(t, t0, .4))
    evidence_meter(f, W / 2, 560, score, t, t0 + .3, "STRENGTH OF EVIDENCE", w=700)
    small_note(f, note, W / 2, 700, prog(t, t0 + .8, .5), 50)
    if stamp_txt: stamp(f, stamp_txt, W / 2 + 430, 860, t, stamp_t, 80, rot=-6)

def s_theory1(t, S):
    L = S.L
    if t < L[1] - .2:   # destroyed in the north (imagined)
        f = moor(t, pan=prog(t, 0, L[1]) * 2)
        fog(f, t, .45, seed=21)
        st = 1 - .85 * prog(t, S.at(0, "fighting") - .2, 3.0)
        formation(f, W / 2, H * .72, 560, 150, ROMC, t, kind="inf", strength=st, flag=True, flag_color=ROMC, emblem="eagle", seed=90, alpha=1 - .5 * prog(t, L[1] - 1.5, 1.2))
        for k, (x0, x1) in enumerate(((-200, 520), (2120, 1400), (-100, 640), (2000, 1300))):
            pp = prog(t, .8 + k * .3, 2.5, ease_io)
            formation(f, lerp(x0, x1, pp), H * (.68 if k < 2 else .86), 300, 110, BRITC, t, kind="inf", flag=False, seed=95 + k)
        fog(f, t, .3, seed=22)
        header(f, "THEORY 1 · DESTROYED IN BRITAIN", t, 0, L[1] - .3)
        small_note(f, "a dramatisation of the theory", W - 300, H - 60, window(t, .5, L[1] - .3), 34)
        return f
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    if t < L[2] - .2:
        header(f, "THEORY 1 · DESTROYED IN BRITAIN", t, L[1] - .2)
        live_portrait(f, "mommsen", 520, 480, 360, t, window(t, L[1] - .1, 1e9), seed=10)
        plate(f, "THEODOR MOMMSEN", "historian · 19th century", 520, 720, t, S.at(1, "Mommsen") - .3)
        bp = prog(t, S.at(1, "Sutcliff") - .3, .5, back_out)
        paste(f, book_img(), 1350, 480, bp, 1.0, rot=4)
        small_note(f, "Rosemary Sutcliff's novel · 1954", 1350, 760, window(t, S.at(1, "Sutcliff"), 1e9), 42)
        arrow(f, curve((760, 470), (1150, 470), .12, 30), prog(t, S.at(1, "inspired") - .3, .8), (214, 170, 80), 10, head=30)
        return f
    if t < L[3] - .2:
        header(f, "THE CASE FOR", t, L[2] - .2)
        small_note(f, "argued e.g. by archaeologist Miles Russell (2011)", W / 2, 200, window(t, S.at(2, "Miles") - .3, 1e9), 42)
        chips = [("FRONTO'S DEAD", "Fronto's"), ("HADRIAN'S VISIT", "sudden visit"), ("THE WALL", "the wall")]
        dr = [lambda c, x, y, s, a: live_portrait(c, "fronto", x, y, int(180 * s), t, a, bob=False),
              lambda c, x, y, s, a: live_portrait(c, "hadrian", x, y, int(180 * s), t, a, bob=False),
              lambda c, x, y, s, a: [cv2.rectangle(c, (int(x - 120 * s + k * 40 * s), int(y - 20 * s - (k % 2) * 14 * s)), (int(x - 90 * s + k * 40 * s), int(y + 30 * s)), (196, 184, 160), -1) for k in range(6)]]
        for k, (lab, ph) in enumerate(chips):
            evidence_card(f, k + 1, lab, 420 + k * 540, 560, t, S.at(2, ph) - .3, 1e9, draw=dr[k], w=360, h=400, rot=[-3, 2, -2][k])
        label_box(f, "SOMETHING WENT WRONG IN THE NORTH", W / 2, H - 110, window(t, S.at(2, "Something") - .3, 1e9), 54, "#ffb0a0")
        return f
    if t < L[4] - .2:   # the problem: Nijmegen + officers
        m = empire_map(); yk = P(m, "york"); nj = P(m, "nijmegen")
        c = cam_path(t, [(L[3] - .2, ((yk[0] + nj[0]) / 2, (yk[1] + nj[1]) / 2, 2.0)), (L[4], ((yk[0] + nj[0]) / 2 + 40, (yk[1] + nj[1]) / 2, 2.3))])
        f = c.render(m.img)
        header(f, "THE PROBLEM", t, L[3] - .2)
        r = curve(c.pt(yk), c.pt(nj), -.2, 50)
        arrow(f, r, prog(t, S.at(3, "tiles") - .5, 1.5, ease_io), (214, 170, 80), 12, head=34, dashed=True)
        place(f, c, m, "nijmegen", "NIJMEGEN", t, S.at(3, "tiles") - .4, "d", ROMC, 40)
        place(f, c, m, "york", "EBORACVM", t, L[3], "l", ROMC, 38)
        tp = prog(t, S.at(3, "tiles") - .2, .5, back_out)
        paste(f, tile_img(), 520, 820, tp, .8, rot=-5)
        for k in range(3):
            a = prog(t, S.at(3, "officers") - .3 + k * .3, .4, back_out)
            evidence_card(f, k + 1, "TRIBUNE", 1180 + k * 270, 330, t, S.at(3, "officers") - .3 + k * .3, 1e9,
                          draw=lambda c_, x, y, s, a_: (blit(c_, text_sprite("LEG VIIII", "cinzel", 38, "#5a2a14", 900, shadow=False), x, y - 30, a_),
                                                        blit(c_, text_sprite("AD 120s?", "cinzel", 34, "#8e1b1b", 900, shadow=False), x, y + 25, a_)), w=250, h=300, rot=[-4, 2, 5][k])
        return f
    header(f, "THEORY 1 · DESTROYED IN BRITAIN", t, L[4] - .2)
    verdict_panel(f, t, L[4], "", 1.5, "DRAMATIC", "but at least part of the Ninth seems to have left Britain alive", "DOUBTFUL", S.at(4, "But the evidence") - .1, ("#ffe0c8", "#c0392b"))
    return f

def s_theory2(t, S):
    L = S.L
    m = empire_map()
    yk, nj, ju = P(m, "york"), P(m, "nijmegen"), P(m, "jerusalem")
    if t < L[1] - .2:
        c = cam_path(t, [(0, ((yk[0] + nj[0]) / 2, (yk[1] + nj[1]) / 2, 1.6)), (L[1] - .2, ((nj[0] + ju[0]) / 2, (nj[1] + ju[1]) / 2, .85))])
        f = c.render(m.img)
        header(f, "THEORY 2 · THE RHINE, THEN THE EAST", t, 0, L[1] - .3)
        march_column(f, curve(c.pt(yk), c.pt(nj), -.2, 40), prog(t, .5, 2.0, ease_io), 200, ROMC, t, ranks=2, px=16, seed=12, flag=False)
        arrow(f, curve(c.pt(nj), c.pt(ju), .1, 60), prog(t, S.at(0, "marched east") - .5, 2.0, ease_io), (214, 170, 80), 12, head=34, dashed=True)
        place(f, c, m, "nijmegen", "RHINE FRONTIER", t, S.at(0, "Rhine") - .3, "r", ROMC, 36)
        return f
    if t < L[2] - .2:   # Bar Kokhba revolt
        c = cam_path(t, [(L[1] - .2, (ju[0], ju[1] - 60, 2.0)), (L[2], (ju[0] + 40, ju[1] - 40, 2.4))])
        f = c.render(m.img)
        datestamp(f, "AD 132 – 135", t, L[1])
        x, y = place(f, c, m, "jerusalem", "JERUSALEM", t, S.at(1, "Judaea") - .3, "l", BLOODC, 46, 15, pulse=True)
        fire_line(f, [(x - 120, y + 60), (x - 40, y + 40), (x + 50, y + 70), (x + 140, y + 50)], t, prog(t, S.at(1, "exploded") - .3, .8), seed=5, h=60)
        smoke(f, t, .3 * prog(t, S.at(1, "exploded") - .3, 1.5), seed=13, speed=45)
        for k in range(3):
            pp = prog(t, S.at(1, "rushed") - .3 + k * .3, 3.0, ease_out)
            formation(f, x + 60 + k * 190, lerp(y - 700, y - 240, pp), 170, 80, ROMC, t, kind="inf", flag=k == 1, flag_color=ROMC, emblem="eagle", seed=100 + k, strength=1 - .4 * prog(t, S.at(1, "losses") - .2, 2.0))
        label_box(f, "THE BAR KOKHBA REVOLT", W / 2, 140, window(t, S.at(1, "Bar Kokhba") - .3, S.at(1, "Fronto") - .3), 62, "#ffb0a0")
        quote_card(f, ["... killed by the Jews, ... by the Britons"], "Fronto", t, S.at(1, "Fronto") - .3, L[2] - .3, x=W / 2, y=H - 150, w=1100, size=48, seal=False)
        return f
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    if t < L[3] - .2:   # XXII Deiotariana vanishes
        header(f, "A LEGION THAT DID VANISH", t, L[2] - .2)
        fd = prog(t, S.at(2, "vanishes") - .2, 5.0)
        formation(f, W / 2, 560, 700, 220, (120, 60, 120), t, kind="inf", strength=1 - fd, flag=fd < .9, flag_color=(120, 60, 120), emblem="eagle", seed=110, alpha=1 - .7 * fd)
        label_box(f, "LEGIO XXII DEIOTARIANA", W / 2, 260, prog(t, L[2], .4), 66, GOLD)
        small_note(f, "vanishes from the record around this time", W / 2, 840, window(t, S.at(2, "vanishes") - .3, 1e9), 46)
        if fd > .5: blit(f, text_sprite("?", "cinzel", 200, "#ff8070", 900, stroke=3, glow="#000000"), W / 2, 560, prog(t, S.at(2, "vanishes") + 1.4, .5))
        return f
    if t < L[4] - .2:   # no proof for the Ninth
        header(f, "BUT FOR THE NINTH?", t, L[3] - .2)
        label_box(f, "A LEGION COULD VANISH", W / 2, H / 2 - 40, window(t, L[3], S.at(3, "But no") - .3), 80, "#ffb0a0")
        small_note(f, "without a trace", W / 2, H / 2 + 50, window(t, S.at(3, "without") - .3, S.at(3, "But no") - .3), 50)
        items = [("NO INSCRIPTION", "no inscription", lambda c, x, y: mini_stone(c, x, y, 1.0, 1.0)), ("NO TILE", "no tile", lambda c, x, y: mini_tile(c, x, y, 1.0, 1.0)),
                 ("NO GRAVE", "no grave", lambda c, x, y: blit(c, ico("stone", 220), x, y, 1.0))]
        for k, (lab, ph, dr) in enumerate(items):
            x = 420 + k * 540; a = prog(t, S.at(3, ph) - .3, .4, back_out)
            if a <= 0: continue
            tmp = f.copy(); dr(tmp, x, 520); cv2.addWeighted(tmp, a, f, 1 - a, 0, f)
            label_box(f, lab, x, 760, a, 50, CREAM)
            crossmark(f, x, 520, t, S.at(3, ph) + .3, 120)
        label_box(f, "IN JUDAEA", W / 2, 900, window(t, S.at(3, "Judaea") - .3, 1e9), 56, "#ffb0a0")
        return f
    header(f, "THEORY 2 · JUDAEA", t, L[4] - .2)
    verdict_panel(f, t, L[4], "", 2, "PLAUSIBLE TIMING", "direct evidence: zero", "NO PROOF", S.at(4, "zero") - .1)
    return f

def s_theory3(t, S):
    L = S.L
    m = empire_map(); ju, el = P(m, "jerusalem"), P(m, "elegeia")
    if t < L[1] - .2:
        c = cam_path(t, [(0, (ju[0], ju[1] - 100, 1.6)), (L[1], (el[0] - 40, el[1] + 40, 2.2))])
        f = c.render(m.img)
        header(f, "THEORY 3 · ARMENIA", t, 0, L[1] - .3)
        datestamp(f, "AD 161", t, S.at(0, "one hundred") - .3)
        return f
    if t < L[2] - .2:
        c = cam_path(t, [(L[1] - .2, (el[0] - 40, el[1] + 40, 2.2)), (L[2], (el[0], el[1] + 20, 2.8))])
        f = c.render(m.img)
        x, y = place(f, c, m, "elegeia", "ELEGEIA", t, S.at(1, "Elegeia") - .4, "u", BLOODC, 44, 15, pulse=True)
        for k in range(3):
            pp = prog(t, L[1] + .3 + k * .3, 3.0, ease_out)
            formation(f, lerp(x + 650, x + 160, pp), y + 160 - k * 130, 170, 70, PARC, t, kind="cav", flag=False, seed=120 + k)
        cap = c.pt(m.proj((35.5, 38.7)))
        march_column(f, curve(cap, (x - 30, y + 10), -.1, 50), prog(t, S.at(1, "marched") - .3, 3.0, ease_out), 260, ROMC, t, ranks=3, px=20, seed=13)
        live_portrait(f, "severianus", 260, 300, 300, t, window(t, S.at(1, "Severianus") - .4, L[2] - .3), seed=11)
        plate(f, "SEVERIANUS", "governor of Cappadocia", 300, 490, t, S.at(1, "Severianus") - .2, L[2] - .3)
        label_box(f, "PARTHIAN INVASION", W / 2, H - 120, window(t, L[1], S.at(1, "Roman governor") - .3), 60, "#ffd890")
        label_box(f, "TRAPPED", W / 2, H - 120, window(t, S.at(1, "trapped") - .3, L[2] - .3), 72, "#ffb0a0")
        locator(f, empire_map(), LL["elegeia"], t, x=W - 360, y=H - 240, w=300, box_deg=8)
        return f
    if t < L[3] - .2:   # surrounded and shot down
        f = parch_bg(t, True, 1.0, 1.05, 12)
        st = 1 - .95 * prog(t, S.at(2, "shot down") - .3, 3.5)
        formation(f, W / 2, 500, 420, 200, ROMC, t, kind="inf", strength=st, flag=st > .3, flag_color=ROMC, emblem="eagle", seed=130)
        for k in range(6):
            ang = k / 6 * 6.283 + t * .35
            x, y = W / 2 + 520 * math.cos(ang), 500 + 300 * math.sin(ang)
            formation(f, x, y, 150, 64, PARC, t, angle=math.degrees(ang) + 90, kind="cav", flag=False, seed=140 + k)
            for j in range(3):
                t0_ = S.at(2, "surrounded") - .5 + j * 1.6 + k * .27
                if t0_ < t < t0_ + 1.4: volley_arcs(f, (x, y), (W / 2, 500), t, t0_, 1.4, n=12, seed=k * 7 + j, spread=60, height=150)
        grade(f, red=.35 * prog(t, S.at(2, "shot down") - .2, 1.0))
        if t < S.at(2, "Other ancient") - .3:
            quote_card(f, ["surrounded and shot down, commanders and all,", "a whole Roman legion"], "Cassius Dio, Roman History 71.2", t, S.at(2, "Cassius") - .3, S.at(2, "Other") - .3, x=W / 2, y=H - 170, w=1400, size=46, seal=True)
        else:
            live_portrait(f, "severianus", W / 2, H - 200, 250, t, prog(t, S.at(2, "Other") - .3, .4), grey=True, seed=11)
            small_note(f, "Severianus took his own life", W / 2, H - 50, prog(t, S.at(2, "took") - .3, .4), 44)
        return f
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    if t < L[4] - .2:
        header(f, "WHICH LEGION?", t, L[3] - .2)
        mini_banner(f, 520, 460, 1.6, 1.0, "???", ROMC)
        small_note(f, "Dio does not name it", 520, 720, prog(t, S.at(3, "does not name") - .3, .4), 46)
        if t > S.at(3, "date fits") - .3:
            case_timeline(f, t, 900, 1780, 520, 100, 180, [(161, "ELEGEIA", S.at(3, "date fits"), "gone"), (165, "THE LIST", S.at(3, "list") - .2, "other")], t0=S.at(3, "date fits") - .3, ticks=20, label_size=26)
        return f
    header(f, "THEORY 3 · ARMENIA", t, L[4] - .2)
    verdict_panel(f, t, L[4], "", 2, "THE TIMING WORKS", "but again, there is no name", "NO NAME", S.at(4, "no name") - .1)
    return f

def s_theory4(t, S):
    L = S.L
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    if t < L[1] - .2:
        header(f, "THEORY 4 · DISBANDED IN DISGRACE", t, 0)
        paste(f, roman_stone(1100, 360, 6), W / 2, H / 2 + 40, 1.0)
        chisel(f, ["LEG VIIII HISP"], W / 2, H / 2 + 40, t, 0, .01, 110, chips=False)
        label_box(f, "NAME ERASED?", W / 2, 820, prog(t, S.at(0, "erased") - .3, .4), 70, "#ffb0a0")
        return f
    if t < L[2] - .2:
        header(f, "WHAT A REAL DISGRACE LOOKS LIKE", t, L[1] - .2)
        for k, (txt, x) in enumerate((("LEG III AVG", 540), ("LEG VIIII HISP", 1380))):
            a = prog(t, L[1] + (0 if k == 0 else S.at(1, "The Ninth's") - L[1] - .4), .5)
            if a <= 0: continue
            tmp = f.copy(); paste(tmp, roman_stone(720, 300, 7 + k), x, 520, 1.0)
            chisel(tmp, [txt], x, 520, t, 0, .01, 60, chips=False)
            if k == 0: deface(tmp, (x - 300, 470, x + 300, 570), t, S.at(1, "chiselled") - .3, 1.6, seed=2)
            cv2.addWeighted(tmp, a, f, 1 - a, 0, f)
            label_box(f, ["THIRD AUGUSTA · AD 238", "THE NINTH"][k], x, 760, a, 46, CREAM)
        if t > S.at(1, "never defaced") - .2:
            p = prog(t, S.at(1, "never defaced") - .2, .4)
            cv2.circle(f, (1380, 340), int(46 * p), (60, 140, 60), -1, cv2.LINE_AA)
            cv2.polylines(f, [np.array([[1356, 342], [1374, 362], [1406, 322]], np.int32)], False, (255, 255, 255), 7, cv2.LINE_AA)
            label_box(f, "NEVER DEFACED", 1380, 860, p, 52, "#b8e0b0")
        return f
    if t < L[3] - .2:
        header(f, "THEORY 4 · DISGRACE", t, L[2] - .2)
        verdict_panel(f, t, L[2], "", 1, "UNLIKELY", "no erased names", None, None, ("#ffe0c8", "#c0392b"))
        return f
    f = board_bg(t)
    header(f, "BEWARE OF SHORTCUTS", t, L[3] - .2)
    ov = f.copy(); cv2.circle(ov, (int(620 + 120 * math.sin(t * .7)), 560), 330, (120, 90, 50), -1, cv2.LINE_AA); cv2.addWeighted(ov, .18, f, .82, 0, f)
    blit(f, aquila(560, bronze=True, wings=False, pole=False), 620, 600 + 8 * math.sin(t * 1.3), prog(t, S.at(3, "bronze eagle") - .3, .5, back_out), rot=3 * math.sin(t * .9))
    label_box(f, "THE SILCHESTER EAGLE", 1320, 380, window(t, S.at(3, "Silchester") - .3, 1e9), 58, CREAM)
    small_note(f, "found 1866 · now in Reading Museum", 1320, 460, window(t, S.at(3, "eighteen") - .3, 1e9), 42)
    paste(f, book_img(), 1320, 680, prog(t, S.at(3, "inspire") - .3, .5, back_out), .55, rot=-4)
    stamp(f, "NOT A STANDARD", 640, 840, t, S.at(3, "not a legion") - .1, 80, rot=-8)
    small_note(f, "most likely from a statue", 1320, 880, window(t, S.at(3, "statue") - .4, 1e9), 46)
    return shake(f, t, S.at(3, "not a legion"), 7, .3)

def s_verdict(t, S):
    L = S.L
    if t < L[3] - .2:
        f = board_bg(t)
        header(f, "THE VERDICT", t, 0)
        if t < L[1] + 1.8:
            for k, (nm, sc) in enumerate((("BRITAIN", 1.5), ("JUDAEA", 2), ("ARMENIA", 2), ("DISGRACE", 1))):
                evidence_meter(f, 260 + k * 466, 700, sc, t, .3 + k * .3, nm, a=window(t, .2, L[1] + 1.5), w=380)
            headline(f, "WHERE DOES THAT LEAVE US?", t, .2, L[1] + 1.5, y=360, size=74)
            return f
        known = ["at York c. AD 108", "part of it left Britain alive?", "gone by the AD 160s"]
        unknown = ["where it went", "when it died", "the fate of its eagle"]
        label_box(f, "WHAT WE KNOW", 520, 260, prog(t, L[1] + 1.8, .4), 60, "#b8e0b0")
        for k, s_ in enumerate(known):
            a = prog(t, max(L[1] + 2.0 + k * .4, S.at(1, ["York around", "left Britain", "gone by"][k])) - .3, .4)
            if a > 0:
                cv2.circle(f, (200, 400 + k * 130), int(26 * a), (90, 170, 90), -1, cv2.LINE_AA)
                cv2.polylines(f, [np.array([[188, 400 + k * 130], [198, 412 + k * 130], [216, 388 + k * 130]], np.int32)], False, (255, 255, 255), 5, cv2.LINE_AA)
            small_note(f, s_, 250, 400 + k * 130, a, 48, anchor="l")
        label_box(f, "STILL UNKNOWN", 1400, 260, prog(t, L[2] - .1, .4), 60, "#ffb0a0")
        for k, s_ in enumerate(unknown):
            a = prog(t, S.at(2, ["where it went", "when it died", "eagle"][k]) - .3, .4)
            blit(f, text_sprite("?", "cinzel", 64, "#ff8070", 900, stroke=2, glow="#000000"), 1100, 400 + k * 130, a)
            small_note(f, s_, 1150, 400 + k * 130, a, 48, anchor="l")
        return f
    if t < L[4] - .2:
        m = empire_map(); yk, nj, ju, el = P(m, "york"), P(m, "nijmegen"), P(m, "jerusalem"), P(m, "elegeia")
        zc = min(W / ((el[0] - yk[0]) * 1.2), H / ((ju[1] - yk[1]) * 1.3)); cx_, cy_ = (yk[0] + el[0]) / 2, (yk[1] + ju[1]) / 2
        c = cam_path(t, [(L[3] - .2, (cx_, cy_, zc)), (L[4], (cx_ + 20, cy_, zc * 1.06))])
        f = c.render(m.img)
        arrow(f, curve(c.pt(yk), c.pt(nj), -.2, 40), prog(t, L[3] + .3, 1.0, ease_io), (214, 170, 80), 10, head=28)
        for k, tgt in enumerate((ju, el)):
            arrow(f, curve(c.pt(nj), c.pt(tgt), [.12, -.1][k], 60), prog(t, S.at(3, ["Judaea", "Armenia"][k]) - .4, 1.2, ease_io), (214, 170, 80), 10, head=28, dashed=True)
            tx, ty = c.pt(tgt)
            blit(f, text_sprite("?", "cinzel", 80, "#ff8070", 900, stroke=3, glow="#000000"), tx, ty - 60, prog(t, S.at(3, ["Judaea", "Armenia"][k]), .4))
        place(f, c, m, "york", "YORK", t, L[3], "l", ROMC, 34)
        small_note(f, "the view of many historians today", W / 2, 150, window(t, L[3] + .3, S.at(3, "But until") - .3), 50)
        stamp(f, "CASE OPEN", W / 2 + 300, H - 200, t, S.at(3, "case stays open") - .1, 100, rot=-8)
        return f
    f = night_tint(parch_bg(t, True, 1.0, 1.06, S.D), .3)
    fog(f, t, .3, seed=13)
    headline(f, "WHAT'S YOUR THEORY?", t, L[4] - .1, 1e9, y=140, size=84)
    poll_card(f, t, S.at(4, "what do you") - .2, ["Destroyed in Britain (c. 117–122)", "Bar Kokhba revolt, Judaea (132–135)", "Elegeia, Armenia (161)", "Something else"],
              y=H / 2 + 40, w=1180, title="WHAT HAPPENED TO THE NINTH LEGION?", hl_times=tuple(S.at(4, "Tell") - .3 + k * .8 for k in range(4)), hl_d=.8)
    return f

def s_ending(t, S):
    L = S.L
    if t < L[1] - .2:
        f = sea_ships(t, "dawn", ships=((1100, .62, 460, 1),), toss=1.0, drift=-6, sil=False)
        fog(f, t, .55, seed=31)
        header(f, "NEXT ON HISTORY SOURCED: UNSOLVED", t, .1)
        label_box(f, "1872 · THE ATLANTIC", W / 2, 230, window(t, S.at(0, "drifting") - .4, S.at(0, "sails") - .3), 62, CREAM)
        for k, (ph, lab) in enumerate((("sails set", "SAILS SET"), ("cargo", "CARGO INTACT"), ("not one", "10 PEOPLE · GONE"))):
            nxt = [S.at(0, "cargo"), S.at(0, "not one"), L[1]][k]
            label_box(f, lab, W / 2, 230, window(t, S.at(0, ph) - .3, nxt - .3), 64, GOLD if k < 2 else "#ffb0a0")
        return f
    if t < S.D - 12.2:
        f = sea_ships(t, "night", ships=((1100, .62, 460, 1),), toss=1.0, drift=-6, sil=True)
        fog(f, t, .5, seed=32)
        dim(f, .25)
        headline(f, "THE MARY CELESTE", t, L[1] - .1, 1e9, y=420, size=110, grad=("#f0f0f0", "#8aa0b8"))
        stamp(f, "UNSOLVED", W / 2 + 420, 600, t, L[1] + .8, 70, rot=-8)
        blit(f, text_sprite("CASE 03", "cinzel", 40, "#c9b48a", 700, stroke=2, glow="#000000", spacing=10), W / 2 - 420, 600, prog(t, L[1] + .6, .5))
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
    blit(f, galleon(360, silhouette=True, cross=False), (x0 + x1) / 2, (y0 + y1) / 2 - 90, a)
    blit(f, text_sprite("THE MARY CELESTE", "cinzel", 60, CREAM, 900, stroke=2, glow="#000000", spacing=4), (x0 + x1) / 2, (y0 + y1) / 2 + 100, a)
    small_note(f, "History Sourced: Unsolved · case 03", (x0 + x1) / 2, y1 - 50, a, 40)
    sx, sy = 1500, 570
    pulse = 1 + .05 * math.sin(t * 4)
    blit(f, aquila(260), sx, sy - 140, a)
    btn = text_sprite("SUBSCRIBE", "sans", 54, "#ffffff", None, shadow=False, spacing=2)
    bw, bh = btn[0].shape[1] - 40, 100
    ov = f.copy(); cv2.rectangle(ov, (int(sx - bw / 2), int(sy + 80)), (int(sx + bw / 2), int(sy + 80 + bh)), (204, 0, 0), -1)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)
    blit(f, btn, sx, sy + 130, a, pulse)
    blit(f, text_sprite("HISTORY SOURCED", "cinzel", 50, GOLD, 800, stroke=2, glow="#000000", spacing=6), sx, sy + 260, a)
    return f

SCENE_FUNCS = {"cold_open": s_cold_open, "title": s_title, "invasion": s_invasion, "york": s_york, "lastseen": s_lastseen, "silence": s_silence,
               "evidence": s_evidence, "theory1": s_theory1, "theory2": s_theory2, "theory3": s_theory3, "theory4": s_theory4,
               "verdict": s_verdict, "ending": s_ending}

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
for _k in ("lastseen", "theory1", "theory2", "theory3"):
    SCENE_FUNCS[_k] = _push(SCENE_FUNCS[_k], .04)
SCENE_FUNCS["theory4"] = _push(SCENE_FUNCS["theory4"], .1)   # pacing_check: 7.5 s static / 15 s without major change
SCENE_FUNCS["verdict"] = _push(SCENE_FUNCS["verdict"], .06)
