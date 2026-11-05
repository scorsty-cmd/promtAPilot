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

# ======================================================= SCENES
def s_cold_open(t, S):
    L = S.L
    heat = prog(t, L[3] + 1.0, 3.0, smooth)
    f = sea_scene(t, "night", ("dusk", heat * .85))
    dim(f, .15)
    # SEPTEMBER 1066
    a = window(t, .3, L[1] - .3, .9, .6)
    blit(f, text_sprite("SEPTEMBER 1066", "cinzel", 92, CREAM, 700, stroke=2, glow="#000000", spacing=14), W / 2, 300, a)
    # counter 300 -> 24
    if t >= L[1]:
        up = ease_out((t - L[1]) / 2.0)
        down = ease_io((t - (S.at(2, "only") )) / 2.2)
        v = 300 * up if t < S.at(2, "only") else lerp(300, 24, down)
        a = window(t, L[1], L[3] - .2, .4, .6)
        red = clamp(down) if t >= S.at(2, "only") else 0
        grad = ("#fff4d0", "#e0a640") if red < .5 else ("#ffb0a0", "#c0392b")
        counter(f, v, W / 2, 330, 210, a=a, grad=grad)
        sub = "LONGSHIPS SAILED" if red < .5 else "CAME HOME"
        blit(f, text_sprite(sub, "cinzel", 48, CREAM, 700, stroke=2, glow="#000000", spacing=10), W / 2, 470, a)
    # the hottest day
    a = window(t, L[3] + 1.2, S.D - .6, .7, .5)
    blit(f, text_sprite("ON THE HOTTEST DAY OF THE YEAR", "cinzel", 60, CREAM, 700, stroke=2, glow="#3a0a00", spacing=6), W / 2, 260, a)
    ta = S.at(3, "left their")
    if t > ta:
        a = window(t, ta, S.D - .5, .3, .5)
        blit(f, icon("mail", 230), W / 2, 470, a, .9 + .1 * back_out((t - ta) / .5))
        crossmark(f, W / 2, 470, t, ta + .6, 110)
        blit(f, text_sprite("NO ARMOUR", "cinzel", 70, CREAM, 800, stroke=3, gradient=("#ffd0c0", "#d0402a"), glow="#000000", spacing=8), W / 2, 650, window(t, ta + .8, S.D - .5, .4, .5))
    return f

def s_title(t, S):
    f = parch_bg(t, True, 1.0, 1.08, S.D)
    embers(f, t, 70, 3, (255, 160, 60), speed=60, size=3)
    blit(f, icon("swords", 170), W / 2, 330, prog(t, .1, .5), .8 + .2 * back_out((t - .1) / .6))
    a = prog(t, .2, .6)
    sc = 1.15 - .15 * ease_out((t - .2) / 1.2)
    blit(f, text_sprite("STAMFORD BRIDGE", "cinzel", 150, CREAM, 900, stroke=4, gradient=("#fff6d8", "#c98a26"), glow="#ff8a2a", spacing=10), W / 2, 520, a, sc)
    # divider
    p = prog(t, .8, .9)
    if p > 0:
        x0, x1 = W / 2 - 520 * p, W / 2 + 520 * p
        cv2.line(f, (int(x0), 640), (int(x1), 640), (214, 170, 80), 4, cv2.LINE_AA)
        cv2.circle(f, (W // 2, 640), 9, (214, 170, 80), -1, cv2.LINE_AA)
    blit(f, text_sprite("1066  ·  THE DAY THE VIKING AGE ENDED", "cinzel", 52, CREAM, 600, stroke=2, glow="#000000", spacing=6), W / 2, 715, prog(t, 1.2, .7))
    return f

# ---------- journey map ----------
@functools.lru_cache(None)
def journey_map():
    return GeoMap(17, 51, 78, BH=2700, res="50m", seed=21, labels=[
        ("NORWAY", 9.5, 61.6, 70), ("KIEVAN RUS", 33, 55.0, 70), ("BYZANTINE EMPIRE", 31, 39.6, 60),
        ("ENGLAND", -1.8, 52.6, 48), ("SWEDEN", 16, 64.2, 52), ("NORTH SEA", 3.5, 56.5, 52, "#3a2614", False, 8, True),
        ("MEDITERRANEAN SEA", 18, 35.5, 56, "#3a2614", False, 10, True), ("BLACK SEA", 34.5, 43.3, 46, "#3a2614", False, 8, True),
        ("BALTIC SEA", 19.5, 57.5, 44, "#3a2614", False, 8, True)])
LL = {"stiklestad": (11.56, 63.79), "nidaros": (10.4, 63.43), "novgorod": (31.27, 58.52), "kyiv": (30.52, 50.45),
      "constantinople": (28.98, 41.01), "sicily": (14.2, 37.6), "bulgaria": (25.3, 42.7), "aldeigja": (32.3, 60.0),
      "york": (-1.08, 53.96), "riccall": (-1.06, 53.83), "fulford": (-1.07, 53.93), "stamford": (-0.91, 54.0),
      "tadcaster": (-1.26, 53.88), "london": (-0.12, 51.51), "pevensey": (0.33, 50.82), "hastings": (0.57, 50.86),
      "stvalery": (1.63, 50.18), "humber": (0.15, 53.57), "tyne": (-1.42, 55.01), "scarborough": (-0.4, 54.28),
      "shetland": (-1.25, 60.25), "orkney": (-2.95, 58.98), "solund": (4.9, 61.1), "bergen": (5.32, 60.39)}

def route(m, names, n=60):
    pts = [m.proj(LL[k]) for k in names]
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        mid = ((a[0] + b[0]) / 2 + (b[1] - a[1]) * .12, (a[1] + b[1]) / 2 - (b[0] - a[0]) * .12)
        out.extend(bezier(a, mid, b, n)[1:].tolist())
    return np.array(out, np.float32)

def s_harald(t, S):
    L = S.L; m = journey_map()
    P = lambda k: m.proj(LL[k])
    if t < L[1] - .4:
        f = parch_bg(t, True, 1.0, 1.05, L[1])
        embers(f, t, 40, 7, (255, 170, 80), speed=40)
        show_portrait(f, "harald", W / 2, 470, t, .2, L[1] - 1.0, 500)
        hr = S.at(0, "Hard Ruler")
        a1 = window(t, .6, S.at(0, "History") - .2, .4, .3)
        blit(f, text_sprite("HARALD SIGURDSSON", "cinzel", 64, GOLD, 800, stroke=2, glow="#000000", spacing=6), W / 2, 820, a1)
        a2 = window(t, S.at(0, "History"), L[1] - 1.0, .4, .4)
        blit(f, text_sprite("HARALD HARDRADA", "cinzel", 78, GOLD, 900, stroke=3, gradient=("#fff4d0", "#e0a640"), glow="#000000", spacing=8), W / 2, 820, a2)
        blit(f, text_sprite("“HARD RULER”", "garamond", 50, CREAM, 600, stroke=2, glow="#000000", spacing=4), W / 2, 900, window(t, hr, L[1] - 1.0, .4, .4))
        fa = prog(t, L[1] - 1.0, .6)
        dim(f, fa)
        return f
    # map part
    sk, kv, cs = P("stiklestad"), P("kyiv"), P("constantinople")
    keys = [(L[1] - .4, (sk[0], sk[1] + 150, 1.1)), (L[1] + 4, (sk[0] + 100, sk[1] + 200, 1.0)),
            (L[2] + 1, (P("novgorod")[0], P("novgorod")[1] + 200, .75)), (S.at(2, "Then he went"), (kv[0], kv[1], .7)),
            (L[3] - .5, (cs[0] - 150, cs[1] - 100, .75)), (L[3] + 5, (cs[0] - 600, cs[1] - 150, .6)),
            (L[4] + 1, (P("nidaros")[0] + 500, P("nidaros")[1] + 600, .52)), (S.at(4, "Twenty years"), (P("nidaros")[0], P("nidaros")[1] + 400, .6)),
            (S.at(4, "looking west"), (P("nidaros")[0] - 500, P("nidaros")[1] + 700, .62)), (S.D, (P("york")[0] + 300, P("york")[1] - 50, .7))]
    c = cam_path(t, keys)
    f = c.render(m.img)
    fin = prog(t, L[1] - .4, .6);
    if fin < 1: dim(f, 1 - fin)
    # stiklestad
    sx, sy = c.pt(sk)
    marker(f, sx, sy, L[1] + .5, t, (170, 30, 30))
    a = window(t, L[1] + .7, L[2] + 2, .4, .6)
    blit(f, text_sprite("STIKLESTAD · 1030", "cinzel", 44, INK, 800, shadow=False, spacing=3), sx, sy - 55, a)
    blit(f, text_sprite("AGE 15 · WOUNDED · EXILED", "garamond", 40, "#5a1a10", 700, shadow=False, spacing=2), sx, sy + 55, window(t, S.at(1, "The battle"), L[2] + 2, .4, .6))
    # route east
    r1 = route(m, ["stiklestad", "aldeigja", "novgorod", "kyiv"]); r2 = route(m, ["kyiv", "constantinople"])
    p1 = prog(t, L[2] - .3, S.at(2, "Then he went") - L[2] + .3, ease_io)
    arrow(f, c.pts(r1), p1, (150, 30, 30), 10, dashed=True, head=26)
    if p1 >= 1: arrow(f, c.pts(r2), prog(t, S.at(2, "Then he went"), 3.5, ease_io), (150, 30, 30), 10, dashed=True, head=26)
    for k, nm, t0 in (("kyiv", "KYIV", S.at(2, "Yaroslav")), ("constantinople", "CONSTANTINOPLE", S.at(2, "Constantinople") - .5)):
        x, y = c.pt(P(k)); marker(f, x, y, t0, t, (170, 30, 30), 12)
        blit(f, text_sprite(nm, "cinzel", 44, INK, 800, shadow=False, spacing=3), x + 30, y - 40, prog(t, t0 + .2, .4), anchor="l")
    # varangian guard
    headline(f, "THE VARANGIAN GUARD", t, L[3] + .3, L[4] - .5, y=170, size=74, sub="Elite Norse bodyguard of the Byzantine emperor")
    for k, nm, ph in (("sicily", "SICILY", "Sicily"), ("bulgaria", "BULGARIA", "Bulgaria")):
        t0 = S.at(3, ph); x, y = c.pt(P(k))
        if t > t0:
            blit(f, icon("swords", 110), x, y, window(t, t0, L[4] + 1, .3, .5), back_out((t - t0) / .5))
            blit(f, text_sprite(nm, "cinzel", 40, INK, 800, shadow=False, spacing=3), x, y + 70, window(t, t0 + .2, L[4] + 1, .3, .5))
    tg = S.at(3, "fortune")
    if t > tg - .5:
        x, y = c.pt(cs)
        embers(f, t, 40, 11, (255, 210, 90), (x - 250, y - 300, x + 250, y + 50), speed=-60 if False else 50, size=5)
    # return home
    r3 = route(m, ["constantinople", "kyiv", "novgorod", "nidaros"])
    arrow(f, c.pts(r3), prog(t, L[4] - .2, 3.0, ease_io), (212, 160, 40), 12, head=30)
    x, y = c.pt(P("nidaros"))
    if t > L[4] + 2.6:
        blit(f, icon("crown", 120), x, y - 90, window(t, L[4] + 2.6, S.D, .3, .4), back_out((t - L[4] - 2.6) / .5))
        blit(f, text_sprite("KING OF NORWAY · 1046", "cinzel", 46, INK, 800, shadow=False, spacing=3), x, y + 50, window(t, L[4] + 2.8, S.D, .3, .4))
    # looking west
    tw = S.at(4, "looking west")
    if t > tw - .5:
        a1 = m.proj(LL["bergen"]); a2 = m.proj(LL["york"])
        pts = bezier(a1, ((a1[0] + a2[0]) / 2, a1[1] - 100), a2, 60)
        arrow(f, c.pts(pts), prog(t, tw - .5, 2.2, ease_io), (170, 30, 30), 16, head=40)
    # corner medallion
    blit(f, portrait("harald", 200), 140, 140, window(t, L[1] + .3, S.D, .4, .4))
    return f

def s_crisis(t, S):
    L = S.L
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    embers(f, t, 30, 13, (230, 170, 90), speed=30)
    # Edward
    te = 0.2; tg = S.at(0, "died")
    g = prog(t, tg, 1.0)
    ex = W / 2 if t < L[1] else lerp(W / 2, W / 2 - 300, ease_io((t - L[1]) / .8))
    show_portrait(f, "edward", ex, 440, t, te, L[1] + .3, 440, grey=g)
    plate(f, "EDWARD THE CONFESSOR", "King of England", ex, 740, t, te + .3, L[1] + .3)
    if t > tg + .5:
        blit(f, text_sprite("† 5 JANUARY 1066", "cinzel", 50, "#e8c8c0", 800, stroke=2, glow="#000000", spacing=4), ex, 880, window(t, tg + .5, L[1] + .3, .4, .4))
    # Harold crowned
    if t > L[1]:
        hx = W / 2 if t < L[2] else lerp(W / 2, 400, ease_io((t - L[2]) / .9))
        show_portrait(f, "harold", hx, 440, t, L[1] + .2, 1e9, 400)
        cy = lerp(120, 225, ease_out((t - S.at(1, "crowned") ) / .8)) if t > S.at(1, "crowned") else -500
        blit(f, icon("crown", 140), hx, cy, prog(t, S.at(1, "crowned"), .4))
        plate(f, "HAROLD GODWINSON", "Crowned 6 January 1066", hx, 720, t, L[1] + .5, L[2] + .4)
        plate(f, "ENGLAND", None, hx, 720, t, L[2] + .9)
    tw = S.at(2, "Duke William"); tn = S.at(2, "And in Norway")
    if t > tw - .3:
        show_portrait(f, "william", W / 2, 440, t, tw - .3, 1e9, 400)
        plate(f, "WILLIAM", "Duke of Normandy", W / 2, 720, t, tw)
    if t > tn - .3:
        show_portrait(f, "harald", W - 400, 440, t, tn - .3, 1e9, 400)
        plate(f, "HARALD HARDRADA", "King of Norway", W - 400, 720, t, tn)
    # three men one crown
    t3 = L[3]
    if t > t3:
        blit(f, icon("crown", 170), W / 2, 150, window(t, t3, 1e9, .3, .3), 1 + .05 * math.sin(t * 3))
        headline(f, "THREE MEN. ONE CROWN.", t, t3 + .1, 1e9, y=930, size=80)
    tt = S.at(3, "within ten months")
    if t > tt:
        a = window(t, tt, 1e9, .5, .3)
        blit(f, text_sprite("WITHIN 10 MONTHS, TWO WOULD BE DEAD", "garamond", 46, "#ffb8a8", 700, stroke=2, glow="#000000", spacing=3), W / 2, 1010, a)
    flash(f, t, t3, (255, 200, 120), .5, .25)
    return f

def s_tostig(t, S):
    L = S.L
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    embers(f, t, 30, 17, (230, 170, 90), speed=30)
    show_portrait(f, "harald", 420, 460, t, .1, 1e9, 360)
    plate(f, "HARALD HARDRADA", None, 420, 700, t, .3)
    # mystery -> Tostig
    tx = W - 520 if t < L[2] + 1 else lerp(W - 520, W / 2 + 120, ease_io((t - L[2] - 1) / 1.0))
    if t < L[1] + .3:
        a = window(t, .6, L[1], .4, .3)
        cv2.circle(f, (W - 520, 460), int(175 * a), (40, 28, 18), -1, cv2.LINE_AA)
        blit(f, text_sprite("?", "cinzel", 220, CREAM, 900, glow="#000000"), W - 520, 450, a)
        blit(f, text_sprite("AN ENGLISHMAN", "cinzel", 50, GOLD, 800, stroke=2, glow="#000000", spacing=4), W - 520, 700, a)
    else:
        show_portrait(f, "tostig", tx, 460, t, L[1], 1e9, 360)
        plate(f, "TOSTIG GODWINSON", "Earl of Northumbria", tx, 700, t, L[1] + .2, L[2] + .8)
    # Harold brother link
    th = S.at(1, "own brother")
    if t > th:
        hx, hy = 1600 - 330, 160
        a = window(t, th, L[2] + 1.2, .4, .6)
        blit(f, portrait("harold", 200), hx + 330, 230, a)
        blit(f, text_sprite("KING HAROLD", "cinzel", 34, GOLD, 800, stroke=2, glow="#000000"), hx + 330, 360, a)
        broke = S.at(1, "did not stand")
        col = (214, 170, 80) if t < broke else (190, 40, 30)
        p = prog(t, th, .6)
        p0 = np.array([W - 520 + 120, 330]); p1 = np.array([hx + 330 - 90, 280])
        if t < broke + .3 or True:
            mid = p0 + (p1 - p0) * .5
            e = p0 + (p1 - p0) * p
            if t < broke:
                cv2.line(f, tuple((p0 * 16).astype(int)), tuple((e * 16).astype(int)), col, 6, cv2.LINE_AA, 4)
            else:
                gap = 18 * prog(t, broke, .4)
                d = (p1 - p0) / np.linalg.norm(p1 - p0)
                for a0, b0 in ((p0, mid - d * gap), (mid + d * gap, p1)):
                    if a > .01: cv2.line(f, tuple((a0 * 16).astype(int)), tuple((b0 * 16).astype(int)), col, 6, cv2.LINE_AA, 4)
            blit(f, text_sprite("BROTHERS", "garamond", 32, CREAM, 700, stroke=2, glow="#000000"), mid[0] + 40, mid[1] - 40, a)
    tr = S.at(1, "until a revolt")
    if t > tr:
        a = window(t, tr, L[2], .3, .5)
        blit(f, text_sprite("1065: REVOLT — EXILED", "cinzel", 46, "#ffb8a8", 800, stroke=2, glow="#000000", spacing=3), W - 520, 800, a, .9 + .1 * back_out((t - tr) / .4))
    # alliance
    ta = S.at(2, "In Harald Hardrada")
    if t > ta:
        p = prog(t, ta, .8)
        x0, x1 = 420 + 190, tx - 190
        if x1 > x0:
            xe = lerp(x0, x1, p)
            cv2.line(f, (int(x0 * 16), 460 * 16), (int(xe * 16), 460 * 16), (214, 170, 80), 8, cv2.LINE_AA, 4)
        blit(f, text_sprite("ALLIANCE", "cinzel", 46, GOLD, 800, stroke=2, glow="#000000", spacing=6), (420 + tx) / 2, 410, window(t, ta + .5, 1e9, .4, .3))
    headline(f, "THE KING'S BROTHER JOINS THE INVASION", t, S.at(2, "The brother"), 1e9, y=900, size=56)
    return f

@functools.lru_cache(None)
def northsea_map():
    return GeoMap(1.5, 57.3, 27, res="10m", seed=31, labels=[
        ("NORWAY", 8.0, 60.0, 80), ("SCOTLAND", -4.2, 57.0, 70), ("ENGLAND", -1.6, 53.5, 64),
        ("NORTH SEA", 2.2, 56.6, 80, "#3a2614", False, 14, True), ("SHETLAND", 0.6, 60.6, 40), ("ORKNEY", -1.0, 59.2, 40)])

def s_invasion(t, S):
    L = S.L; m = northsea_map()
    P = lambda k: m.proj(LL[k])
    pts1 = route(m, ["solund", "shetland", "orkney"], 50)
    coast = [m.proj(p) for p in [(-2.2, 58.2), (-1.6, 57.2), (-1.9, 56.4), (-1.5, 55.6)]] + [P("tyne")]
    pts2 = np.vstack([pts1, bezier(P("orkney"), coast[0], coast[1], 30)[1:], bezier(coast[1], coast[2], coast[3], 30)[1:], bezier(coast[3], ((coast[3][0] + coast[4][0]) / 2 + 60, coast[4][1] - 80), coast[4], 20)[1:]]).astype(np.float32)
    pts3 = np.vstack([bezier(P("tyne"), m.proj((-0.6, 54.6)), P("scarborough"), 30), bezier(P("scarborough"), m.proj((0.4, 54.0)), P("humber"), 30)[1:],
                      bezier(P("humber"), m.proj((-0.6, 53.72)), P("riccall"), 30)[1:]]).astype(np.float32)
    keys = [(0, (P("bergen")[0] - 200, P("bergen")[1], .7)), (S.at(0, "Shetland"), (P("shetland")[0], P("shetland")[1] + 200, .62)),
            (S.at(0, "swept down"), (P("orkney")[0] + 300, P("orkney")[1] + 500, .55)), (L[1], (P("tyne")[0] + 150, P("tyne")[1] + 300, .62)),
            (S.D - 1, (P("riccall")[0] + 120, P("riccall")[1] - 80, 1.2))]
    c = cam_path(t, keys); f = c.render(m.img)
    p_a = prog(t, .8, L[1] - .8, ease_io)
    arrow(f, c.pts(pts2), p_a, (160, 30, 30), 12, head=34)
    arrow(f, c.pts(pts3), prog(t, L[1] + .2, S.D - L[1] - 1.8, ease_io), (160, 30, 30), 12, head=34)
    # fleet icons following route head
    full = np.vstack([pts2, pts3[1:]]).astype(np.float32); Lf = polyline_len(full)
    frac = (p_a * polyline_len(pts2)[-1] + prog(t, L[1] + .2, S.D - L[1] - 1.8, ease_io) * polyline_len(pts3)[-1]) / Lf[-1]
    for k in range(7):
        fk = clamp(frac - k * .012)
        if fk <= 0: continue
        idx = np.searchsorted(Lf, fk * Lf[-1]); idx = min(idx, len(full) - 1)
        x, y = c.pt(full[idx])
        off = ((k % 3) - 1) * 26
        blit(f, ship_icon(50, "#8e1b1b"), x + off, y + (k // 3) * 20 - 30, .95)
    # Tostig joins
    tt = S.at(0, "Tostig joined")
    if t > tt:
        x, y = c.pt(P("tyne"))
        for k in range(3): blit(f, ship_icon(48, "#2f5e2a"), x - 70 - k * 40, y + 20 * (k % 2) - 10, prog(t, tt, .4))
        blit(f, portrait("tostig", 150), x - 230, y - 40, window(t, tt, L[1] + 3, .4, .5))
    # labels
    for k, nm, ph, i in (("york", "YORK", "York", 1), ("riccall", "RICCALL", "Riccall", 1), ("humber", "HUMBER", "Humber", 1)):
        t0 = S.at(i, ph)
        x, y = c.pt(P(k))
        if k != "humber": marker(f, x, y, t0, t, (170, 30, 30), 10, pulse=(k == "riccall"))
        blit(f, text_sprite(nm, "cinzel", 40, INK, 800, shadow=False, spacing=3), x + 24, y - 30, prog(t, t0, .4), anchor="l")
    # stats box
    a = window(t, .8, S.D - 1, .5, .5)
    blit(f, text_sprite("≈ 300 SHIPS", "cinzel", 58, GOLD, 800, stroke=2, glow="#000000", spacing=4), 70, 110, a, anchor="l")
    blit(f, text_sprite("≈ 9,000 MEN", "cinzel", 46, CREAM, 700, stroke=2, glow="#000000", spacing=4), 70, 180, window(t, 1.6, S.D - 1, .5, .5), anchor="l")
    datestamp(f, "SEPTEMBER 1066", t, .5, S.D - 1)
    return f

# ---------- tactical York map ----------
@functools.lru_cache(None)
def york_map():
    BW, BH = 3840, 2160
    img = parchment(BW, BH, 41).copy()
    hill = fbm(BH, BW, 44, 5, 5)
    img = (img.astype(np.float32) * (0.92 + .14 * hill[..., None])).astype(np.uint8)
    P = {"york": (1700, 760), "fulford": (1730, 1010), "riccall": (1840, 1760), "stamford": (2700, 640),
         "tadcaster": (820, 1060), "marsh": (1560, 1060)}
    ouse = bezier((1420, -40), (1820, 400), (1700, 760), 60, (1650, 900))
    ouse2 = bezier((1650, 900), (1820, 1250), (1760, 1500), 60, (1880, 2200))
    derw = bezier((2600, -40), (2760, 300), (2700, 640), 60, (2640, 900))
    derw2 = bezier((2640, 900), (2700, 1400), (2300, 1900), 60, (1980, 2200))
    wharfe = bezier((-40, 900), (500, 1000), (820, 1060), 40, (1100, 1150))
    wharfe2 = bezier((1100, 1150), (1400, 1250), (1600, 1450), 40, (1780, 1600))
    for r, wdt in ((ouse, 34), (ouse2, 34), (derw, 26), (derw2, 26), (wharfe, 20), (wharfe2, 20)):
        cv2.polylines(img, [(r * 8).astype(np.int32)], False, (70, 90, 92), wdt + 10, cv2.LINE_AA, 3)
        cv2.polylines(img, [(r * 8).astype(np.int32)], False, (104, 140, 142), wdt, cv2.LINE_AA, 3)
    # marsh hatching
    for k in range(70):
        rng = np.random.default_rng(k)
        x, y = 1450 + rng.uniform(0, 230), 980 + rng.uniform(0, 220)
        for j in range(3):
            cv2.line(img, (int(x + j * 10), int(y)), (int(x + j * 10 - 4), int(y - 18)), (90, 110, 80), 3, cv2.LINE_AA)
    # roads
    for a, b, cc in ((P["york"], P["stamford"], (1950, 560)), (P["tadcaster"], P["york"], (1250, 860)), (P["york"], P["riccall"], (1960, 1300))):
        pts = bezier(a, cc, b, 60)
        Lp = polyline_len(pts)
        for i in range(len(pts) - 1):
            if int(Lp[i] / 30) % 2 == 0:
                cv2.line(img, tuple((pts[i] * 8).astype(int)), tuple((pts[i + 1] * 8).astype(int)), (120, 84, 50), 6, cv2.LINE_AA, 3)
    # forests
    rng = np.random.default_rng(9)
    for _ in range(260):
        x, y = rng.uniform(0, BW), rng.uniform(0, BH)
        if any(abs(x - p[0]) < 220 and abs(y - p[1]) < 180 for p in P.values()): continue
        s = rng.uniform(16, 26)
        cv2.circle(img, (int(x), int(y)), int(s), (110, 120, 70), -1, cv2.LINE_AA)
        cv2.circle(img, (int(x - 4), int(y - 5)), int(s * .6), (140, 148, 92), -1, cv2.LINE_AA)
        cv2.line(img, (int(x), int(y + s)), (int(x), int(y + s + 10)), (80, 60, 40), 4)
    # York walls
    cv2.circle(img, P["york"], 110, (90, 64, 40), 10, cv2.LINE_AA)
    for a in range(0, 360, 30):
        x = int(P["york"][0] + 110 * math.cos(math.radians(a))); y = int(P["york"][1] + 110 * math.sin(math.radians(a)))
        cv2.rectangle(img, (x - 14, y - 14), (x + 14, y + 14), (90, 64, 40), -1)
    for k in range(18):
        rng2 = np.random.default_rng(100 + k)
        x, y = P["york"][0] + rng2.uniform(-70, 70), P["york"][1] + rng2.uniform(-70, 70)
        cv2.rectangle(img, (int(x - 12), int(y - 9)), (int(x + 12), int(y + 9)), (150, 110, 70), -1); cv2.rectangle(img, (int(x - 12), int(y - 9)), (int(x + 12), int(y + 9)), (70, 50, 30), 2)
    # bridge
    sb = P["stamford"]; cv2.line(img, (sb[0] - 50, sb[1]), (sb[0] + 50, sb[1]), (90, 60, 30), 18, cv2.LINE_AA)
    labels = [("YORK", P["york"][0], P["york"][1] - 160, 56), ("GATE FULFORD", P["fulford"][0] + 230, P["fulford"][1], 44),
              ("RICCALL", P["riccall"][0] + 170, P["riccall"][1], 48), ("STAMFORD BRIDGE", sb[0], sb[1] - 110, 48),
              ("TADCASTER", P["tadcaster"][0], P["tadcaster"][1] - 90, 46), ("RIVER OUSE", 1900, 1350, 36), ("RIVER DERWENT", 2900, 1150, 36)]
    for s, x, y, sz in labels:
        blit(img, text_sprite(s, "cinzel", sz, "#3a2614", 800, shadow=False, spacing=4), x, y, .9)
    # ships at riccall
    for k in range(6):
        blit(img, ship_icon(56, "#8e1b1b"), P["riccall"][0] - 60 + (k % 3) * 46, P["riccall"][1] + 60 + (k // 3) * 40)
    return img, P

def york_cam(t, keys):
    return cam_path(t, keys)

def s_fulford(t, S):
    L = S.L; img, P = york_map()
    keys = [(0, (1750, 1300, .62)), (L[1], (1700, 1050, .9)), (L[2], (1700, 900, .75)), (S.at(2, "at a quiet") , (2200, 760, .7)),
            (L[3], (2550, 700, .85)), (S.D, (2600, 700, .9))]
    c = cam_path(t, keys); f = c.render(img)
    # armies
    pn = prog(t, .5, L[1] - 1.0, ease_io)
    clash = prog(t, L[1] + .5, S.at(1, "drove them") - L[1], ease_io)
    rout = prog(t, S.at(1, "drove them"), 3.0, ease_io)
    norse = [(-60, 0), (60, 0), (0, 70), (-120, 70), (120, 70)]
    eng = [(-60, 0), (60, 0), (0, -60)]
    for i, (dx, dy) in enumerate(norse):
        p = lerp2((P["riccall"][0] + dx, P["riccall"][1] - 120 + dy), (P["fulford"][0] + dx, P["fulford"][1] + 90 + dy), pn)
        p = (p[0] - 120 * rout, p[1] - 60 * clash - 60 * rout)
        x, y = c.pt(p); unit(f, x, y, 120 * c.z * 1.4, 44 * c.z * 1.4, NORSE)
    for i, (dx, dy) in enumerate(eng):
        p = lerp2((P["york"][0] + dx, P["york"][1] + 150 + dy), (P["fulford"][0] + dx, P["fulford"][1] - 20 + dy), pn)
        p = (p[0] - 190 * rout, p[1] - 40 * clash + 40 * rout)
        x, y = c.pt(p); unit(f, x, y, 120 * c.z * 1.4, 44 * c.z * 1.4, ENG, alpha=1 - .75 * rout)
    if clash > 0 and rout < 1:
        x, y = c.pt((P["fulford"][0], P["fulford"][1] + 40))
        rng = np.random.default_rng(int(t * 10))
        for _ in range(8):
            ox, oy = rng.uniform(-110, 110), rng.uniform(-30, 30)
            cv2.line(f, (int(x + ox), int(y + oy)), (int(x + ox + rng.uniform(-15, 15)), int(y + oy - 20)), (255, 230, 150), 2, cv2.LINE_AA)
    x, y = c.pt((P["york"][0] - 260, P["york"][1] + 120))
    blit(f, text_sprite("EDWIN & MORCAR", "cinzel", 36, "#1d3557", 800, shadow=False, spacing=3), x, y, window(t, .8, L[1] + 3, .4, .5))
    headline(f, "BATTLE OF FULFORD", t, L[0] + 1.0, L[1] - .5, y=150, size=72, sub="20 September 1066")
    headline(f, "VIKING VICTORY", t, S.at(1, "drove them") + .5, L[2] - .2, y=150, size=80, grad=("#ffd0c0", "#c0392b"))
    # York surrenders
    ty = L[2]
    if t > ty:
        x, y = c.pt(P["york"])
        a = window(t, ty, S.at(2, "at a quiet"), .3, .5)
        blit(f, text_sprite("YORK SURRENDERS", "cinzel", 54, "#ffe0d0", 900, stroke=3, glow="#5a0000", spacing=4), x, y - 150 * c.z * 1.3, a, .9 + .1 * back_out((t - ty) / .4))
    ts = S.at(2, "Stamford Bridge") - 1.0
    x, y = c.pt(P["stamford"]); marker(f, x, y, ts, t, (190, 140, 30), 16)
    headline(f, "THEY WERE WRONG.", t, L[3] + 1.2, 1e9, y=930, size=90, grad=("#ffd0c0", "#c0392b"))
    datestamp(f, "20 SEPTEMBER 1066", t, .3, L[3])
    return f

@functools.lru_cache(None)
def england_map():
    return GeoMap(-0.5, 52.4, 16, res="10m", seed=51, labels=[
        ("ENGLAND", -1.8, 52.4, 80), ("NORMANDY", 0.6, 49.45, 60), ("WALES", -3.7, 52.3, 50),
        ("NORTH SEA", 2.6, 54.2, 64, "#3a2614", False, 12, True), ("ENGLISH CHANNEL", -1.0, 50.1, 50, "#3a2614", False, 10, True)])

def s_march(t, S):
    L = S.L; m = england_map(); P = lambda k: m.proj(LL[k])
    keys = [(0, (m.proj((-0.3, 50.9))[0], m.proj((-0.3, 50.9))[1], .8)), (L[1] - 1, (m.proj((-0.6, 52.6))[0], m.proj((-0.6, 52.6))[1], .58)),
            (L[2] + 3, (m.proj((-0.7, 52.8))[0], m.proj((-0.7, 52.8))[1], .62)), (S.D, (P("tadcaster")[0] + 100, P("tadcaster")[1] + 120, .95))]
    c = cam_path(t, keys); f = c.render(m.img)
    # Harold guarding coast
    coast = [(-1.4, 50.8), (-0.8, 50.82), (-0.1, 50.82), (0.6, 50.92)]
    gather = prog(t, S.at(1, "He gathered") - .5, 2.0, ease_io)
    for i, ll in enumerate(coast):
        p = lerp2(m.proj(ll), (P("london")[0] + (i - 1.5) * 40, P("london")[1] + 30), gather)
        x, y = c.pt(p); unit(f, x, y, 70, 28, ENG, angle=0)
    if t < L[1] + 2:
        x, y = c.pt(m.proj((-0.5, 51.25)))
        blit(f, portrait("harold", 150), x, y - 40, window(t, .4, L[1] + 1, .4, .5))
        x2, y2 = c.pt(m.proj((0.4, 49.6)))
        blit(f, portrait("william", 150), x2, y2, window(t, .9, L[1] + 1, .4, .5))
        for k in range(4): blit(f, ship_icon(42, "#1f3c73"), x2 + 110 + k * 36, y2 - 30 + 18 * (k % 2), window(t, 1.2, L[1] + 1, .4, .5))
    # news arrow York -> London
    tn = S.at(0, "When the news")
    nn = bezier(P("york"), (P("york")[0] + 200, (P("york")[1] + P("london")[1]) / 2), P("london"), 60)
    if t < L[2]:
        arrow(f, c.pts(nn), prog(t, tn, 1.6, ease_io), (150, 30, 30), 8, dashed=True, head=24)
    x, y = c.pt(P("york")); marker(f, x, y, .3, t, (160, 30, 30), 11)
    blit(f, text_sprite("YORK", "cinzel", 38, INK, 800, shadow=False, spacing=3), x + 22, y - 26, 1, anchor="l")
    x, y = c.pt(P("london")); marker(f, x, y, .3, t, (40, 70, 130), 11, pulse=False)
    blit(f, text_sprite("LONDON", "cinzel", 38, INK, 800, shadow=False, spacing=3), x + 22, y - 10, 1, anchor="l")
    # march route
    rr = np.vstack([bezier(P("london"), m.proj((-0.35, 52.2)), m.proj((-0.55, 52.9)), 40), bezier(m.proj((-0.55, 52.9)), m.proj((-0.9, 53.4)), P("tadcaster"), 40)[1:]])
    t0 = S.at(1, "and marched"); t1 = S.at(2, "By the evening")
    pm = prog(t, t0, t1 - t0, lambda x: x)
    arrow(f, c.pts(rr), pm, (40, 70, 140), 16, head=42)
    if t > t0:
        a = window(t, t0, S.D, .4, .4)
        day = 1 + min(3, int(pm * 4))
        blit(f, text_sprite(f"DAY {day}", "cinzel", 70, GOLD, 900, stroke=3, glow="#000000", spacing=6), W - 260, 130, a)
        blit(f, text_sprite(f"{int(185 * pm)} MILES" if pm < 1 else "≈ 185 MILES", "cinzel", 50, CREAM, 800, stroke=2, glow="#000000", spacing=4), W - 260, 210, a)
    x, y = c.pt(P("tadcaster"))
    if t > t1:
        marker(f, x, y, t1, t, (40, 70, 130), 13)
        blit(f, text_sprite("TADCASTER", "cinzel", 40, INK, 800, shadow=False, spacing=3), x - 24, y + 40, prog(t, t1, .4), anchor="r")
    tv = S.at(2, "And the Vikings")
    if t > tv:
        x, y = c.pt(m.proj((-0.95, 54.02)))
        unit(f, x, y, 70, 28, NORSE)
        blit(f, text_sprite("?", "cinzel", 70, "#5a1a10", 900, shadow=False), x + 50, y - 50, prog(t, tv + .4, .4), 1 + .1 * math.sin(t * 6))
    datestamp(f, "24 SEPTEMBER 1066", t, t1, S.D)
    return f

def heat_scene(t, dust_p=0.0, glints=0.0):
    f = sky("dusk").copy()
    # hills
    for k, (by, col, amp, fr) in enumerate([(H * .58, (150, 92, 60), 40, 300), (H * .66, (120, 76, 48), 50, 230), (H * .78, (88, 58, 36), 60, 190), (H * .9, (55, 36, 24), 40, 150)]):
        xs = np.arange(-10, W + 20, 10, np.float32)
        y = by + amp * np.sin(xs / fr + k * 2.1) + amp * .4 * np.sin(xs / (fr * .37) + k)
        pts = np.vstack([np.stack([xs, y], 1), [[W + 20, H + 10], [-10, H + 10]]])
        cv2.fillPoly(f, [(pts * 8).astype(np.int32)], col, cv2.LINE_AA, 3)
        if k == 0 and dust_p > 0:
            # dust cloud on ridge
            ov = f.copy()
            rng = np.random.default_rng(4)
            for j in range(60):
                cx = 250 + rng.uniform(0, 700) + 30 * t; cy = by - 10 - rng.uniform(0, 160) * dust_p
                r = rng.uniform(30, 90) * (.4 + .6 * dust_p)
                cv2.circle(ov, (int(cx), int(cy)), int(r), (214, 170, 120), -1, cv2.LINE_AA)
            ov = cv2.GaussianBlur(ov, (0, 0), 12)
            cv2.addWeighted(ov, .7 * dust_p, f, 1 - .7 * dust_p, 0, f)
            if glints > 0:
                rng2 = np.random.default_rng(int(t * 8))
                for j in range(45):
                    gx = 260 + rng2.uniform(0, 700) + 30 * t; gy = by - 5 + rng2.uniform(-12, 8)
                    s = rng2.uniform(3, 12) * glints
                    cv2.line(f, (int(gx - s), int(gy)), (int(gx + s), int(gy)), (255, 255, 240), 2, cv2.LINE_AA)
                    cv2.line(f, (int(gx), int(gy - s)), (int(gx), int(gy + s)), (255, 255, 240), 2, cv2.LINE_AA)
    # heat shimmer
    sh = (np.sin(np.arange(H, dtype=np.float32)[:, None] / 7 + t * 6) * 2.0).astype(np.float32)
    mx, my = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    f = cv2.remap(f, mx + sh, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return f

def s_morning(t, S):
    L = S.L; img, P = york_map()
    if t < L[2] - .3:
        c = cam_path(t, [(0, (2250, 1200, .55)), (L[1], (2250, 1150, .6)), (S.D, (2400, 900, .7))])
        f = c.render(img)
        fill_alpha(f, (255, 140, 40), .12 + .04 * math.sin(t * 2))
        # split
        ps = prog(t, S.at(0, "Harald took"), 3.5, ease_io)
        for i in range(6):
            dx = (i % 3 - 1) * 70; dy = (i // 3) * 60
            start = (P["york"][0] + 180 + dx, P["york"][1] + 220 + dy)
            dest = (P["stamford"][0] - 40 + dx, P["stamford"][1] - 40 + dy) if i < 4 else (P["riccall"][0] + dx * .6, P["riccall"][1] - 110 + dy * .6)
            p = lerp2(start, dest, ps); x, y = c.pt(p)
            light = prog(t, L[1] + 1.5, 1.0)
            col = NORSE if i >= 4 else tuple(int(lerp(a, b, light)) for a, b in zip(NORSE, (215, 120, 110)))
            unit(f, x, y, 66, 26, col)
        t2 = S.at(0, "The rest")
        if t > t2:
            blit(f, text_sprite("2/3", "cinzel", 56, "#ffe0d0", 900, stroke=3, glow="#000000"), *c.pt((P["stamford"][0] - 30, P["stamford"][1] - 170)), prog(t, t2 - 1.5, .4))
            blit(f, text_sprite("1/3", "cinzel", 56, "#ffe0d0", 900, stroke=3, glow="#000000"), *c.pt((P["riccall"][0] + 260, P["riccall"][1] - 60)), prog(t, t2, .4))
            a1, a2 = c.pt(P["riccall"]), c.pt(P["stamford"])
            arrow(f, [a1, ((a1[0] + a2[0]) / 2 + 120, (a1[1] + a2[1]) / 2), a2], 0, (0, 0, 0))
            pts = bezier(a1, ((a1[0] + a2[0]) / 2 + 160, (a1[1] + a2[1]) / 2 + 40), a2, 40)
            pr = prog(t, S.at(0, "about twelve"), 1.2)
            arrow(f, pts, pr, (230, 200, 120), 6, dashed=True, head=20)
            mid = pts[20]
            blit(f, text_sprite("≈ 12 MILES", "cinzel", 48, "#fff0c8", 900, stroke=3, glow="#000000", spacing=3), mid[0] + 130, mid[1], prog(t, S.at(0, "about twelve"), .5))
        # sun icon
        cx, cy = W - 170, 160
        cv2.circle(f, (cx, cy), 60, (255, 200, 80), -1, cv2.LINE_AA)
        for k in range(12):
            a = math.radians(k * 30 + t * 20)
            cv2.line(f, (int(cx + 75 * math.cos(a)), int(cy + 75 * math.sin(a))), (int(cx + 100 * math.cos(a)), int(cy + 100 * math.sin(a))), (255, 200, 80), 6, cv2.LINE_AA)
        if t > L[1] - .2:
            a = window(t, L[1] - .2, L[2] - .6, .3, .4)
            dim(f, .45 * a)
            blit(f, icon("mail", 300), W / 2, 450, a, .9 + .1 * back_out((t - L[1]) / .5))
            crossmark(f, W / 2, 450, t, L[1] + .8, 140)
            blit(f, text_sprite("LEFT AT THE SHIPS", "cinzel", 70, CREAM, 900, stroke=3, gradient=("#ffd0c0", "#d0402a"), glow="#000000", spacing=6), W / 2, 700, window(t, L[1] + 1.2, L[2] - .6, .4, .4))
            blit(f, text_sprite("Shields · swords · helmets — little more", "garamond", 44, CREAM, 600, stroke=2, glow="#000000"), W / 2, 790, window(t, S.at(1, "They carried"), L[2] - .6, .4, .4))
        datestamp(f, "25 SEPTEMBER 1066", t, .3, L[2] - .5)
        return f
    tl = t - L[2]
    f = heat_scene(t, prog(t, S.at(2, "cloud of dust") - .5, 2.0), prog(t, S.at(2, "glitter") - .3, 1.0))
    # silhouettes of norse watching, foreground
    for k in range(7):
        x = 1150 + k * 95; y = H - 40
        cv2.ellipse(f, (x, y - 150), (22, 26), 0, 0, 360, (24, 14, 10), -1, cv2.LINE_AA)
        cv2.fillPoly(f, [np.array([[x - 40, y], [x - 30, y - 125], [x + 30, y - 125], [x + 40, y]], np.int32)], (24, 14, 10), cv2.LINE_AA)
        cv2.circle(f, (x - 30, y - 70), 36, (60, 30, 20) if k % 2 else (90, 26, 24), -1, cv2.LINE_AA)
        cv2.line(f, (x + 30, y - 120), (x + 50, y - 230), (24, 14, 10), 6, cv2.LINE_AA)
    fin = prog(t, L[2] - .3, .6)
    if fin < 1: dim(f, 1 - fin)
    return f

# ---------- bridge tactical ----------
@functools.lru_cache(None)
def bridge_map():
    BW, BH = 3840, 2160
    img = parchment(BW, BH, 61).copy()
    hill = fbm(BH, BW, 64, 5, 4)
    img = (img.astype(np.float32) * (0.9 + .16 * hill[..., None])).astype(np.uint8)
    # east bank rising ground shading
    grad = np.clip((np.arange(BW) - 2000) / 1500, 0, 1)[None, :, None]
    img = (img.astype(np.float32) * (1 - .12 * grad)).astype(np.uint8)
    river = bezier((1820, -50), (2050, 600), (1900, 1100), 80, (1980, 2250))
    cv2.polylines(img, [(river * 8).astype(np.int32)], False, (70, 90, 92), 150, cv2.LINE_AA, 3)
    cv2.polylines(img, [(river * 8).astype(np.int32)], False, (104, 140, 142), 120, cv2.LINE_AA, 3)
    for k in range(0, 2160, 60):
        idx = int(k / 2160 * 79); x = river[idx][0]
        cv2.line(img, (int(x - 30), k), (int(x + 10), k + 4), (140, 170, 170), 2, cv2.LINE_AA)
    # bridge
    by = 1080; bx = int(river[np.argmin(np.abs(river[:, 1] - by))][0])
    cv2.rectangle(img, (bx - 120, by - 34), (bx + 120, by + 34), (60, 38, 20), -1)
    for k in range(-110, 120, 22): cv2.line(img, (bx + k, by - 34), (bx + k, by + 34), (110, 76, 44), 4)
    cv2.rectangle(img, (bx - 120, by - 34), (bx + 120, by + 34), (40, 26, 14), 5)
    # road
    road = bezier((-50, 1150), (900, 1050), (bx - 120, by), 60)
    cv2.polylines(img, [(road * 8).astype(np.int32)], False, (150, 118, 80), 40, cv2.LINE_AA, 3)
    road2 = bezier((bx + 120, by), (2600, 1100), (3900, 900), 60)
    cv2.polylines(img, [(road2 * 8).astype(np.int32)], False, (150, 118, 80), 40, cv2.LINE_AA, 3)
    rng = np.random.default_rng(3)
    for _ in range(180):
        x, y = rng.uniform(0, BW), rng.uniform(0, BH)
        if abs(y - 1100) < 260 or abs(x - bx) < 260: continue
        s = rng.uniform(18, 28)
        cv2.circle(img, (int(x), int(y)), int(s), (110, 120, 70), -1, cv2.LINE_AA); cv2.circle(img, (int(x - 4), int(y - 5)), int(s * .6), (140, 148, 92), -1, cv2.LINE_AA)
    for s, x, y, sz in (("RIVER DERWENT", 2120, 300, 44), ("TO YORK", 300, 1240, 40), ("BATTLE FLATS", 3000, 700, 48)):
        blit(img, text_sprite(s, "cinzel", sz, "#3a2614", 800, shadow=False, spacing=5), x, y, .85)
    return img, (bx, by)

def side_bridge(t, S, t0):
    f = sky("dusk").copy()
    dim(f, .25)
    # far bank hills
    cv2.fillPoly(f, [np.array([[0, 640], [400, 600], [900, 630], [1400, 590], [W, 620], [W, H], [0, H]], np.int32)], (70, 46, 30), cv2.LINE_AA)
    # water
    cv2.rectangle(f, (0, 780), (W, H), (40, 60, 70), -1)
    for k in range(18):
        y = 800 + k * 16; x0 = int((k * 137 + t * 40) % W)
        cv2.line(f, (x0, y), (x0 + 120, y), (80, 104, 112), 2, cv2.LINE_AA)
    # bridge deck
    cv2.rectangle(f, (300, 700), (1620, 740), (70, 44, 24), -1)
    for x in range(330, 1620, 180): cv2.rectangle(f, (x, 740), (x + 30, 860), (55, 34, 18), -1)
    for x in range(300, 1620, 40): cv2.line(f, (x, 700), (x, 740), (100, 66, 36), 2)
    # lone warrior centre
    wx = 1000
    def man(x, y, col, axe=False, s=1.0, lean=0):
        cv2.ellipse(f, (int(x), int(y - 165 * s)), (int(22 * s), int(26 * s)), 0, 0, 360, col, -1, cv2.LINE_AA)
        cv2.fillPoly(f, [np.array([[x - 40 * s, y], [x - 30 * s + lean, y - 140 * s], [x + 30 * s + lean, y - 140 * s], [x + 40 * s, y]], np.int32)], col, cv2.LINE_AA)
        cv2.circle(f, (int(x - 34 * s), int(y - 80 * s)), int(36 * s), (90, 26, 24) if col == (20, 12, 8) else (30, 50, 90), -1, cv2.LINE_AA)
        if axe:
            sw = math.sin(t * 5) * 30
            ex, ey = x + 70 * s + sw, y - 230 * s
            cv2.line(f, (int(x + 30 * s), int(y - 120 * s)), (int(ex), int(ey)), col, int(8 * s), cv2.LINE_AA)
            cv2.ellipse(f, (int(ex + 10), int(ey + 10)), (int(26 * s), int(36 * s)), 30, -90, 90, (150, 150, 150), -1, cv2.LINE_AA)
    man(wx, 700, (20, 12, 8), axe=True, s=1.35)
    for k in range(5):
        x = 520 + k * 70; fallen = (k % 2 == 0) and t > t0 + 2 + k
        if fallen:
            cv2.ellipse(f, (x, 690), (60, 16), 0, 0, 360, (22, 30, 50), -1, cv2.LINE_AA)
        else:
            man(x, 700, (22, 30, 50), s=1.0, lean=12)
    # boat beneath + spear
    ts = S.at(1, "floated beneath")
    if t > ts:
        bxp = lerp(300, wx - 40, ease_io((t - ts) / 2.2))
        cv2.ellipse(f, (int(bxp), 800), (70, 26), 0, 0, 180, (60, 38, 20), -1, cv2.LINE_AA)
        man(bxp, 800, (22, 30, 50), s=.6)
        tsp = S.at(1, "thrust a spear")
        if t > tsp:
            p = ease_out((t - tsp) / .4)
            cv2.line(f, (int(bxp + 20), 770), (int(bxp + 20 + 20 * p), int(770 - 120 * p)), (180, 180, 180), 6, cv2.LINE_AA)
            flash(f, t, tsp + .4, (255, 60, 40), .5, .35)
    blit(f, text_sprite("THE LEGEND OF THE BRIDGE", "cinzel", 56, GOLD, 800, stroke=2, glow="#000000", spacing=6), W / 2, 150, window(t, t0 + .3, 1e9, .4, .3))
    return f

def s_bridge(t, S):
    L = S.L; img, (bx, by) = bridge_map()
    if L[1] - .2 <= t < L[2] - .2:
        f = side_bridge(t, S, L[1])
        a = prog(t, L[1] - .2, .5)
        if a < 1: dim(f, 1 - a)
        return f
    c = cam_path(t, [(0, (1700, 1150, .55)), (L[1], (1900, 1100, .62)), (L[2], (1850, 1100, .6)), (S.D, (2200, 1050, .7))])
    f = c.render(img)
    pr = prog(t, .5, 4.0, ease_io)
    # norse cross to east bank and form shield wall
    for i in range(5):
        a0 = (bx - 400 + (i % 2) * 60, by - 180 + i * 90); a1 = (bx + 330 + (i % 2) * 70, by - 250 + i * 120)
        p = lerp2(a0, a1, pr)
        if pr < 1: x, y = c.pt(p); unit(f, x, y, 110 * c.z * 1.6, 40 * c.z * 1.6, NORSE, angle=90)
    if pr >= 1:
        p0 = c.pt((bx + 300, by - 380)); p1 = c.pt((bx + 330, by + 380))
        shieldwall(f, p0[0], p0[1], p1[0], p1[1], 16)
    # rider to Riccall
    tr = .8
    rp = bezier((bx + 300, by), (2900, 1500), (3500, 2200), 50)
    arrow(f, c.pts(rp), prog(t, tr, 3.5, ease_io), (230, 200, 120), 6, dashed=True, head=22)
    blit(f, text_sprite("RIDERS TO RICCALL", "cinzel", 36, "#3a2614", 800, shadow=False, spacing=3), *c.pt((3050, 1720)), window(t, tr + 1, L[1] - .5, .4, .4))
    # english advance
    pe = prog(t, 1.5, L[1] - 2, ease_io)
    pc = prog(t, L[2] + .5, 3.0, ease_io)
    for i in range(6):
        a0 = (-100 + (i % 2) * 120, 1000 + (i // 2) * 120); a1 = (bx - 350 + (i % 2) * 100, by - 150 + (i // 2) * 120)
        p = lerp2(a0, a1, pe)
        if pc > 0:
            a2 = (bx + 180 + (i % 2) * 40, by - 300 + i * 110)
            p = lerp2(a1, a2, pc)
        x, y = c.pt(p); unit(f, x, y, 110 * c.z * 1.6, 40 * c.z * 1.6, ENG, angle=90)
    headline(f, "SHIELD WALL", t, 4.5, L[1] - .6, y=150, size=72)
    headline(f, "THE ENGLISH CROSS", t, L[2] + 1, 1e9, y=150, size=72)
    datestamp(f, "25 SEPTEMBER 1066", t, .3, L[1] - .5)
    return f

def s_parley(t, S):
    L = S.L
    f = parch_bg(t, True, 1.0, 1.06, S.D)
    embers(f, t, 30, 23, (230, 170, 90), speed=30)
    blit(f, text_sprite("ACCORDING TO THE SAGAS", "cinzel", 40, GOLD, 700, stroke=2, glow="#000000", spacing=8), W / 2, 90, window(t, .3, S.D, .5, .5))
    # riders
    if t < L[1]:
        n = 20; pr = prog(t, .8, 4, ease_out)
        for i in range(n):
            x = lerp(-100, 300, pr) + (i % 5) * 46; y = 380 + (i // 5) * 60
            cv2.circle(f, (int(x), int(y)), 18, (35, 64, 118), -1, cv2.LINE_AA); cv2.circle(f, (int(x), int(y)), 18, (20, 12, 8), 3, cv2.LINE_AA)
        blit(f, text_sprite("20 RIDERS", "cinzel", 40, CREAM, 800, stroke=2, glow="#000000", spacing=4), 380, 660, window(t, 1.5, L[1] - .3, .4, .4))
        show_portrait(f, "tostig", W - 360, 470, t, S.at(0, "One of them") - .2, L[1] - .2, 340)
        q = S.at(0, "Return to")
        a = window(t, q, L[1] - .2, .4, .4)
        blit(f, text_sprite("“Return to your brother,", "garamond", 62, CREAM, 600, stroke=2, glow="#000000"), W / 2 - 60, 820, a)
        blit(f, text_sprite("and you can have Northumbria again.”", "garamond", 62, CREAM, 600, stroke=2, glow="#000000"), W / 2 - 60, 900, window(t, q + .8, L[1] - .2, .4, .4))
    elif t < L[2]:
        show_portrait(f, "harald", W / 2, 330, t, L[1], L[2] - .2, 330)
        tq = S.at(1, "Seven feet")
        a = window(t, tq - .2, L[2] - .2, .4, .4)
        blit(f, text_sprite("“SEVEN FEET OF ENGLISH GROUND”", "cinzel", 82, CREAM, 900, stroke=3, gradient=("#fff4d0", "#e0a640"), glow="#000000", spacing=4), W / 2, 640, a, .9 + .1 * back_out((t - tq) / .5))
        blit(f, text_sprite("…or as much more as he is taller than other men.", "garamond", 50, CREAM, 600, stroke=2, glow="#000000"), W / 2, 760, window(t, S.at(1, "Or as much"), L[2] - .2, .4, .4))
    else:
        tb = S.at(2, "That, said")
        show_portrait(f, "tostig", 450, 460, t, L[2], 1e9, 330)
        a = window(t, tb, 1e9, .5, .3)
        if t > tb:
            glow = np.zeros_like(f); cv2.circle(glow, (W - 450, 460), 230, (255, 200, 120), -1, cv2.LINE_AA)
            glow = cv2.GaussianBlur(glow, (0, 0), 60); cv2.add(f, (glow * .5 * a).astype(np.uint8), f)
        show_portrait(f, "harold", W - 450, 460, t, tb, 1e9, 380)
        blit(f, text_sprite("\u201cWho was that man?\u201d", "garamond", 58, CREAM, 600, stroke=2, glow="#000000"), W - 450, 460, window(t, L[2] + 2.0, tb - .2, .4, .3))
        blit(f, text_sprite("“That was my brother.", "garamond", 66, CREAM, 600, stroke=2, glow="#000000"), W / 2, 820, window(t, tb + .3, 1e9, .4, .3))
        blit(f, text_sprite("King Harold himself.”", "garamond", 66, GOLD, 700, stroke=2, glow="#000000"), W / 2, 905, window(t, tb + 1.2, 1e9, .4, .3))
    return f

def s_battle(t, S):
    L = S.L; img, (bx, by) = bridge_map()
    c = cam_path(t, [(0, (bx + 200, by, .75)), (L[1], (bx + 330, by - 60, 1.0)), (L[2], (bx + 330, by, .9)), (L[3], (bx + 700, by + 300, .6)), (S.D, (bx + 450, by + 100, .7))])
    f = c.render(img)
    ch = prog(t, .6, 2.5, ease_io)
    cut = prog(t, S.at(0, "Without"), L[1] + 6 - S.at(0, "Without"), lambda x: x)
    # shield wall remnants
    n = 16
    for i in range(n):
        alive = (i * 7919 % n) / n >= cut * .8
        if not alive: continue
        u = i / (n - 1)
        p = c.pt((bx + 300 + 30 * u, by - 380 + 760 * u))
        cv2.circle(f, (int(p[0]), int(p[1])), int(17 * c.z / .75), (28, 16, 8), -1, cv2.LINE_AA)
        cv2.circle(f, (int(p[0]), int(p[1])), int(13 * c.z / .75), NORSE if i % 2 else (190, 50, 50), -1, cv2.LINE_AA)
    for i in range(6):
        a1 = (bx + 180 + (i % 2) * 40, by - 300 + i * 110); a2 = (bx + 260 + (i % 2) * 30, by - 300 + i * 110)
        x, y = c.pt(lerp2(a1, a2, ch)); unit(f, x, y, 110 * c.z * 1.6, 40 * c.z * 1.6, ENG, angle=90)
    if ch > .5 and t < L[3]:
        rng = np.random.default_rng(int(t * 12))
        for _ in range(14):
            yy = rng.uniform(by - 380, by + 380); p = c.pt((bx + 290, yy))
            cv2.line(f, (int(p[0]), int(p[1])), (int(p[0] + rng.uniform(-20, 20)), int(p[1] - rng.uniform(10, 30))), (255, 235, 160), 2, cv2.LINE_AA)
    headline(f, "NO ARMOUR", t, 1.0, L[1] - .4, y=140, size=80, grad=("#ffd0c0", "#c0392b"))
    # Harald's banner & arrow
    hp = (bx + 380, by - 40)
    if L[1] - .5 < t < L[2] + .5:
        x, y = c.pt(hp)
        blit(f, icon("raven", 150), x + 60, y - 60, window(t, L[1] - .5, S.at(1, "Then an arrow") + .5, .3, .3))
        blit(f, portrait("harald", 150), x, y, window(t, L[1] - .5, S.at(1, "Then an arrow") + 1.2, .3, .3))
        ta = S.at(1, "Then an arrow")
        if t > ta:
            pa = ease_in = clamp((t - ta) / .5)
            a0 = c.pt((bx + 100, by - 500)); e = lerp2(a0, (x, y), pa)
            cv2.line(f, (int(a0[0] + (e[0] - a0[0]) * .6), int(a0[1] + (e[1] - a0[1]) * .6)), (int(e[0]), int(e[1])), (230, 220, 200), 5, cv2.LINE_AA)
            flash(f, t, ta + .5, (255, 40, 30), .8, .5)
    td = S.at(1, "The last great")
    if td - .3 < t < L[2] - .2:
        a = window(t, td - .3, L[2] - .4, .4, .4)
        dim(f, .55 * a)
        blit(f, portrait("harald", 380, True), W / 2, 430, a)
        blit(f, text_sprite("† HARALD HARDRADA", "cinzel", 76, CREAM, 900, stroke=3, glow="#000000", spacing=6), W / 2, 720, a)
        blit(f, text_sprite("The last great Viking king", "garamond", 48, "#e8c8b8", 600, stroke=2, glow="#000000"), W / 2, 810, a)
    # Tostig with Landwaster
    if L[2] - .2 < t < L[3] - .2:
        a = window(t, L[2] - .2, L[3] - .5, .4, .4)
        dim(f, .5 * a)
        tf = S.at(2, "And Tostig fell")
        g = prog(t, tf, .8)
        blit(f, icon("raven", 260), W / 2 + 260, 420, a * (1 - g * .6))
        blit(f, portrait("tostig", 360), W / 2 - 160, 440, a * (1 - g))
        blit(f, portrait("tostig", 360, True), W / 2 - 160, 440, a * g)
        blit(f, text_sprite("LANDWASTER", "cinzel", 56, GOLD, 800, stroke=2, glow="#000000", spacing=6), W / 2 + 260, 620, a)
        if g > 0: blit(f, text_sprite("† TOSTIG GODWINSON", "cinzel", 64, CREAM, 900, stroke=3, glow="#000000", spacing=5), W / 2, 820, a * g)
    # Orri's storm
    if t > L[3] - .2:
        po = prog(t, S.at(3, "They had run") - 1.0, 4.0, ease_io)
        for i in range(4):
            a0 = (3600 + i * 50, 2250 + i * 40); a1 = (bx + 520 + i * 40, by + 200 + i * 60)
            x, y = c.pt(lerp2(a0, a1, po)); unit(f, x, y, 110 * c.z * 1.6, 40 * c.z * 1.6, (110, 70, 40), angle=40)
        rp = [c.pt((3700, 2300)), c.pt((3100, 1700)), c.pt((bx + 600, by + 250))]
        arrow(f, bezier(*rp, 40), po, (110, 70, 40), 12, head=34)
        blit(f, portrait("orri", 170), W - 200, H - 230, window(t, L[3] + .5, 1e9, .4, .3))
        blit(f, text_sprite("EYSTEIN ORRI", "cinzel", 38, GOLD, 800, stroke=2, glow="#000000", spacing=3), W - 200, H - 105, window(t, L[3] + .7, 1e9, .4, .3))
        headline(f, "ORRI'S STORM", t, S.at(3, "Orri's Storm") - .3, S.at(3, "It was not") - .2, y=140, size=86)
        headline(f, "IT WAS NOT ENOUGH.", t, S.at(3, "It was not"), 1e9, y=140, size=80, grad=("#ffd0c0", "#c0392b"))
        if t > S.at(3, "It was not") + .3:
            fill_alpha(f, (120, 20, 20), .18 * prog(t, S.at(3, "It was not"), 1.0))
    return f

def s_aftermath(t, S):
    L = S.L
    if t < L[1] - .3:
        f = sea_scene(t, "dawn", ships=[(1, 300, 26, 260, 5), (2, 1100, 40, 420, 9)])
        dim(f, .55)
        tf = S.at(0, "only twenty-four")
        cols, rows = 25, 12
        for i in range(300):
            cx = 360 + (i % cols) * 50; cy = 310 + (i // cols) * 46
            keep = (i * 37 % 300) < 24
            a = prog(t, 1.0 + i * .006, .3)
            if t > tf and not keep: a *= 1 - prog(t, tf + (i % 17) * .04, .5)
            blit(f, ship_icon(38, "#8e1b1b" if keep or t < tf else "#5a3a2a"), cx, cy, a)
        v = 300 if t < tf else lerp(300, 24, ease_io((t - tf) / 1.6))
        blit(f, text_sprite(f"{int(round(v))} SHIPS", "cinzel", 90, CREAM, 900, stroke=3, gradient=("#fff4d0", "#e0a640") if t < tf else ("#ffd0c0", "#c0392b"), glow="#000000", spacing=6), W / 2, 170, prog(t, .8, .5))
        blit(f, text_sprite("SAILED HOME", "cinzel", 46, CREAM, 700, stroke=2, glow="#000000", spacing=8), W / 2, 900, window(t, tf + 1.0, 1e9, .4, .3))
        blit(f, portrait("harald", 130, True), 140, 140, window(t, .3, 1e9, .4, .3))
        blit(f, text_sprite("Olaf, Harald's son, allowed to leave", "garamond", 38, CREAM, 600, stroke=2, glow="#000000"), 230, 140, window(t, S.at(0, "Olaf"), tf, .4, .4), anchor="l")
        return f
    f = parch_bg(t, True, 1.0, 1.05, S.D)
    embers(f, t, 40, 29, (255, 170, 80), speed=35)
    a = prog(t, L[1] - .3, .6)
    x0, x1, y = 260, W - 260, 560
    p = prog(t, L[1] + .3, 3.0, ease_io)
    cv2.line(f, (x0, y), (int(lerp(x0, x1, p)), y), (214, 170, 80), 8, cv2.LINE_AA)
    events = [(0, "793", "LINDISFARNE RAID"), (.35, "865", "GREAT HEATHEN ARMY"), (.7, "1016", "CNUT RULES ENGLAND"), (1, "1066", "STAMFORD BRIDGE")]
    for u, yr, nm in events:
        if p >= u - .001:
            x = lerp(x0, x1, u); aa = prog(t, L[1] + .3 + u * 3.0, .4)
            cv2.circle(f, (int(x), y), int(18 * aa), (214, 170, 80) if u < 1 else (200, 40, 30), -1, cv2.LINE_AA)
            blit(f, text_sprite(yr, "cinzel", 64, GOLD, 900, stroke=2, glow="#000000"), x, y - 80, aa)
            blit(f, text_sprite(nm, "cinzel", 30, CREAM, 700, stroke=2, glow="#000000", spacing=2), x, y + 70, aa)
    headline(f, "THE END OF THE VIKING AGE", t, S.at(1, "After Stamford") - .2, 1e9, y=240, size=80)
    if a < 1: dim(f, 1 - a)
    return f

def s_ending(t, S):
    L = S.L; m = england_map(); P = lambda k: m.proj(LL[k])
    if t < L[2] - .3:
        c = cam_path(t, [(0, (m.proj((-0.2, 52.0))[0], m.proj((-0.2, 52.0))[1], .55)), (L[1], (m.proj((-0.3, 52.3))[0], m.proj((-0.3, 52.3))[1], .55)), (L[2], (m.proj((0.2, 51.3))[0], m.proj((0.2, 51.3))[1], .7))])
        f = c.render(m.img)
        # victory banner at York
        x, y = c.pt(P("stamford"))
        blit(f, portrait("harold", 140), x + 110, y - 40, window(t, .2, 1e9, .4, .3))
        blit(f, text_sprite("VICTORY", "cinzel", 40, CREAM, 900, stroke=2, glow="#000000", spacing=4), x + 110, y + 50, window(t, .4, L[1], .4, .3))
        tw = S.at(0, "the wind changed") - .5
        w = bezier(P("stvalery"), m.proj((1.2, 50.6)), P("pevensey"), 40)
        arrow(f, c.pts(w), prog(t, tw, 2.5, ease_io), (180, 130, 20), 14, head=38)
        for k in range(5):
            pp = partial(c.pts(w), prog(t, tw, 2.5, ease_io))[-1]
            blit(f, ship_icon(40, "#9c6b12"), pp[0] - 40 + k * 22, pp[1] + 20 + 12 * (k % 2), prog(t, tw, .4))
        x, y = c.pt(P("pevensey")); marker(f, x, y, tw + 2.4, t, (180, 130, 20), 12)
        blit(f, text_sprite("PEVENSEY", "cinzel", 40, INK, 800, shadow=False, spacing=3), x - 30, y + 45, prog(t, tw + 2.4, .4), anchor="r")
        x2, y2 = c.pt(P("stvalery"))
        blit(f, portrait("william", 150), x2 + 150, y2 - 120, window(t, tw - .3, 1e9, .4, .3))
        datestamp(f, "28 SEPTEMBER 1066", t, tw, L[1])
        # march back
        rr = np.vstack([bezier(P("york"), m.proj((-0.9, 53.0)), P("london"), 50), bezier(P("london"), m.proj((0.3, 51.2)), P("hastings"), 30)[1:]])
        arrow(f, c.pts(rr), prog(t, L[1], L[2] - L[1] - .6, ease_io), (40, 70, 140), 14, head=40)
        x, y = c.pt(P("hastings")); marker(f, x, y, L[2] - 1.5, t, (40, 70, 140), 12)
        blit(f, text_sprite("HASTINGS", "cinzel", 40, INK, 800, shadow=False, spacing=3), x + 24, y + 40, prog(t, L[2] - 1.5, .4), anchor="l")
        return f
    if t < L[3] - .3:
        f = parch_bg(t, True, 1.0, 1.04, S.D)
        dim(f, .4)
        embers(f, t, 50, 31, (255, 120, 60), speed=50)
        blit(f, portrait("harold", 300), W / 2, 330, prog(t, L[2] - .3, .5))
        v = max(19, 25 - int((t - L[2]) * 6))
        counter(f, v, W / 2 - 30, 640, 220, grad=("#ffd0c0", "#c0392b"), scale=1 + .04 * math.sin(t * 8))
        blit(f, text_sprite("DAYS LEFT TO LIVE", "cinzel", 60, CREAM, 800, stroke=2, glow="#000000", spacing=8), W / 2, 820, prog(t, L[2] + .6, .5))
        return f
    # end screen
    f = parch_bg(t, True, 1.0, 1.04, 30)
    embers(f, t, 40, 37, (255, 170, 80), speed=30)
    a = prog(t, L[3] - .3, .6)
    # next video frame placeholder (left)
    x0, y0, x1, y1 = 150, 300, 150 + 960, 300 + 540
    ov = f.copy(); cv2.rectangle(ov, (x0, y0), (x1, y1), (20, 12, 6), -1); cv2.addWeighted(ov, .55 * a, f, 1 - .55 * a, 0, f)
    cv2.rectangle(f, (x0, y0), (x1, y1), (214, 170, 80), 4, cv2.LINE_AA)
    blit(f, text_sprite("WATCH NEXT", "cinzel", 44, GOLD, 800, stroke=2, glow="#000000", spacing=8), (x0 + x1) / 2, y0 - 50, a)
    blit(f, text_sprite("THE BATTLE OF HASTINGS", "cinzel", 50, CREAM, 800, stroke=2, glow="#000000", spacing=3), (x0 + x1) / 2, (y0 + y1) / 2 - 30, a)
    blit(f, text_sprite("1066", "cinzel", 70, GOLD, 900, stroke=2, glow="#000000"), (x0 + x1) / 2, (y0 + y1) / 2 + 60, a)
    # subscribe
    sx, sy = 1500, 570
    pulse = 1 + .05 * math.sin(t * 4)
    cv2.circle(f, (sx, sy - 120), 130, (40, 22, 12), -1, cv2.LINE_AA)
    blit(f, icon("swords", 170), sx, sy - 120, a)
    btn = text_sprite("SUBSCRIBE", "sans", 54, "#ffffff", None, shadow=False, spacing=2)
    bw, bh = btn[0].shape[1] - 40, 100
    ov = f.copy(); cv2.rectangle(ov, (int(sx - bw / 2), int(sy + 80)), (int(sx + bw / 2), int(sy + 80 + bh)), (204, 0, 0), -1)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)
    blit(f, btn, sx, sy + 130, a, pulse)
    blit(f, text_sprite("HISTORY SOURCED", "cinzel", 50, GOLD, 800, stroke=2, glow="#000000", spacing=6), sx, sy + 260, a)
    return f

SCENE_FUNCS = {"cold_open": s_cold_open, "title": s_title, "harald": s_harald, "crisis": s_crisis, "tostig": s_tostig,
               "invasion": s_invasion, "fulford": s_fulford, "march": s_march, "morning": s_morning, "bridge": s_bridge,
               "parley": s_parley, "battle": s_battle, "aftermath": s_aftermath, "ending": s_ending}
