"""Quality upgrades (v2): formation blocks of soldier figures with waving banners, living portraits
(blink / mouth-flap / head bob), camera shake, impact rings, inset locator map, voice envelope.
Import in scenes.py with:  from fx import *
"""
import math, functools, json
import numpy as np, cv2
from engine import *
from art import portrait, CHAR

# ---------------------------------------------------------------- voice envelope (for mouth flap)
_ENV = None
def voice_amp(T):
    """0..1 loudness of the narration at global time T (s). Needs voice.wav."""
    global _ENV
    if _ENV is None:
        try:
            import soundfile as sf
            v, sr = sf.read("voice.wav")
            if v.ndim > 1: v = v.mean(1)
            hop = sr // 48
            n = len(v) // hop
            e = np.sqrt((v[: n * hop].reshape(n, hop) ** 2).mean(1))
            _ENV = (e / (np.percentile(e, 97) + 1e-9)).clip(0, 1), 48
        except Exception:
            _ENV = (np.zeros(1), 48)
    e, r = _ENV
    i = int(T * r)
    return float(e[i]) if 0 <= i < len(e) else 0.0

# ---------------------------------------------------------------- living portraits
def _face_geom(who, size):
    c = CHAR[who]
    hy = .43 if c.get("tall") else .45
    pad = 30
    return dict(cx=pad + size * .5, ey=pad + size * (hy - .005), ex=size * .052, er=size * .02,
                my=pad + size * (hy + .095), mw=size * .032, skin=hexc(c["skin"]), hy=pad + size * hy)

def live_portrait(f, who, x, y, size, t, alpha=1.0, scale=1.0, talk=None, T=None, angry=False, grey=False, seed=0, bob=True):
    """Portrait medallion that blinks every few seconds, bobs slightly and (optionally) moves its mouth.
    talk: None = closed mouth; a float 0..1 = mouth opening; 'voice' = follow narration loudness at global time T."""
    if alpha <= 0.003: return
    spr = portrait(who, size, grey)
    rgb, a = spr
    canvas_rgb = rgb.copy(); canvas_a = a.copy()
    g = _face_geom(who, size)
    skin = np.array(g["skin"], np.float32) * (0.6 if grey else 1.0)
    if grey: skin = np.full(3, skin.mean() * .6, np.float32)
    # blink: 0.14 s closed every 3–6 s (deterministic per seed)
    period = 3.2 + (hash(who) % 7) * .4 + seed * .3
    ph = (t + seed * 1.37) % period
    blink = ph < .14
    al = canvas_a[..., 0] if canvas_a.ndim == 3 else canvas_a
    def draw(fn):
        tmp = np.zeros(canvas_rgb.shape[:2] + (3,), np.uint8); fn(tmp)
        m = tmp.any(-1)
        return m, tmp
    if blink:
        for sx in (-1, 1):
            cx_, cy_ = int(g["cx"] + sx * g["ex"]), int(g["ey"])
            cv2.ellipse(canvas_rgb, (cx_, cy_), (int(g["er"] * 1.25) + 1, int(g["er"] * .75) + 1), 0, 0, 360, tuple(float(v) * float(al[cy_, cx_]) for v in skin), -1, cv2.LINE_AA)
            cv2.line(canvas_rgb, (cx_ - int(g["er"]), cy_ + 1), (cx_ + int(g["er"]), cy_ + 1), (30, 20, 12), max(1, int(size / 160)), cv2.LINE_AA)
    if angry:
        for sx in (-1, 1):
            p0 = (int(g["cx"] + sx * size * .025), int(g["ey"] - size * .022)); p1 = (int(g["cx"] + sx * size * .085), int(g["ey"] - size * .045))
            cv2.line(canvas_rgb, p0, p1, (40, 24, 14), max(2, int(size / 70)), cv2.LINE_AA)
    op = 0.0
    if talk == "voice" and T is not None: op = voice_amp(T)
    elif isinstance(talk, (int, float)): op = float(talk)
    if op > .08:
        h = int(size * .028 * min(1, op * 1.3)) + 1
        cv2.ellipse(canvas_rgb, (int(g["cx"]), int(g["my"] + h * .4)), (int(g["mw"]), h), 0, 0, 360, (60, 18, 14), -1, cv2.LINE_AA)
    sc = scale * (1 + (.01 * math.sin(t * 1.6 + seed) if bob else 0))
    rot = 1.2 * math.sin(t * .9 + seed) if bob else 0
    hh, ww = canvas_rgb.shape[:2]
    M = cv2.getRotationMatrix2D((ww / 2, hh / 2), rot, sc)
    nw, nh = int(ww * sc) + 2, int(hh * sc) + 2
    M[0, 2] += (nw - ww) / 2; M[1, 2] += (nh - hh) / 2
    r2 = cv2.warpAffine(canvas_rgb, M, (nw, nh), flags=cv2.INTER_LINEAR)
    a2 = cv2.warpAffine(canvas_a[..., 0] if canvas_a.ndim == 3 else canvas_a, M, (nw, nh), flags=cv2.INTER_LINEAR)[..., None]
    blit(f, (r2, a2), x, y + (3 * math.sin(t * 1.3 + seed) if bob else 0), alpha)

# ---------------------------------------------------------------- formations
@functools.lru_cache(None)
def _soldier(kind, color, px):
    """tiny soldier glyph (premultiplied), px = height in pixels."""
    n = px * 4; img = np.zeros((n, n, 4), np.uint8)
    col = tuple(int(c) for c in color) + (255,)
    dark = (24, 14, 8, 255)
    if kind == "cav":
        cv2.ellipse(img, (n // 2, int(n * .68)), (int(n * .34), int(n * .16)), 0, 0, 360, (70, 48, 30, 255), -1, cv2.LINE_AA)
        cv2.line(img, (int(n * .78), int(n * .62)), (int(n * .9), int(n * .42)), (70, 48, 30, 255), int(n * .1), cv2.LINE_AA)
        cv2.circle(img, (n // 2, int(n * .36)), int(n * .14), col, -1, cv2.LINE_AA)
        cv2.circle(img, (n // 2, int(n * .2)), int(n * .09), (225, 190, 150, 255), -1, cv2.LINE_AA)
        cv2.line(img, (int(n * .3), int(n * .45)), (int(n * .95), int(n * .1)), (200, 200, 200, 255), max(2, n // 24), cv2.LINE_AA)
    else:
        cv2.circle(img, (n // 2, int(n * .22)), int(n * .12), (225, 190, 150, 255), -1, cv2.LINE_AA)
        cv2.ellipse(img, (n // 2, int(n * .62)), (int(n * .2), int(n * .3)), 0, 0, 360, col, -1, cv2.LINE_AA)
        cv2.circle(img, (int(n * .36), int(n * .58)), int(n * .17), dark, -1, cv2.LINE_AA)
        cv2.circle(img, (int(n * .36), int(n * .58)), int(n * .13), tuple(min(255, int(c * 1.3)) for c in color) + (255,), -1, cv2.LINE_AA)
        cv2.line(img, (int(n * .66), int(n * .95)), (int(n * .72), int(n * .02)), (180, 180, 180, 255), max(2, n // 26), cv2.LINE_AA)
    img = cv2.resize(img, (px, px), interpolation=cv2.INTER_AREA)
    return premult(img)

def banner(f, x, y, t, color, h=60, seed=0, alpha=1.0, emblem=None):
    """pole + waving flag whose base is at (x,y)."""
    if alpha <= 0: return
    ov = f.copy() if alpha < 1 else f
    cv2.line(ov, (int(x), int(y)), (int(x), int(y - h)), (40, 26, 14), max(2, h // 22), cv2.LINE_AA)
    fw, fh = h * .7, h * .42
    pts_top, pts_bot = [], []
    for k in range(9):
        u = k / 8
        dy = math.sin(t * 6 + seed + u * 4) * fh * .12 * u
        pts_top.append((x + u * fw, y - h + dy)); pts_bot.append((x + u * fw * .95, y - h + fh + dy))
    poly = np.array(pts_top + pts_bot[::-1], np.float32)
    cv2.fillPoly(ov, [(poly * 8).astype(np.int32)], color, cv2.LINE_AA, 3)
    cv2.polylines(ov, [(poly * 8).astype(np.int32)], True, (24, 14, 8), 2, cv2.LINE_AA, 3)
    if emblem == "cross":
        ec = (170, 30, 34) if sum(color) > 500 else (240, 230, 210)
        cx, cy = x + fw * .45, y - h + fh * .5 + math.sin(t * 6 + seed + 1.8) * fh * .06
        cv2.line(ov, (int(cx - fh * .25), int(cy)), (int(cx + fh * .25), int(cy)), ec, max(2, h // 18), cv2.LINE_AA)
        cv2.line(ov, (int(cx), int(cy - fh * .3)), (int(cx), int(cy + fh * .3)), ec, max(2, h // 18), cv2.LINE_AA)
    elif emblem == "eagle":   # v6: gold Roman eagle on red vexillum
        cx, cy = x + fw * .45, y - h + fh * .5 + math.sin(t * 6 + seed + 1.8) * fh * .06
        r = fh * .3; g = (236, 196, 80)
        cv2.fillPoly(ov, [(np.array([[cx - r * 1.3, cy - r * .5], [cx - r * .2, cy - r * .1], [cx, cy - r * .7], [cx + r * .2, cy - r * .1],
                                      [cx + r * 1.3, cy - r * .5], [cx + r * .3, cy + r * .4], [cx, cy + r * .9], [cx - r * .3, cy + r * .4]]) * 8).astype(np.int32)], g, cv2.LINE_AA, 3)
    elif emblem == "crescent":
        cx, cy = x + fw * .45, y - h + fh * .5
        cv2.circle(ov, (int(cx), int(cy)), int(fh * .28), (240, 220, 140), -1, cv2.LINE_AA)
        cv2.circle(ov, (int(cx + fh * .1), int(cy - fh * .04)), int(fh * .24), color, -1, cv2.LINE_AA)
    if alpha < 1: cv2.addWeighted(ov, alpha, f, 1 - alpha, 0, f)

def formation(f, x, y, w, h, color, t, angle=0.0, kind="inf", strength=1.0, rout=0.0, alpha=1.0,
              flag=True, flag_color=None, emblem=None, label=None, seed=0, shadow=True, density=1.0):
    """Army block made of many small soldier figures (Kings-and-Generals style).
    (x,y) centre, w,h block size in px, angle in degrees (0 = facing up/front row on top).
    strength 0..1 thins the block (casualties); rout 0..1 scatters it; alpha fades."""
    if alpha <= .01 or w < 6: return
    px = int(np.clip(min(w, h) / 2.6, 9, 30) * (1.0 if kind == "inf" else 1.2))
    cols = max(2, int(w / (px * .8) * density)); rows = max(1, int(h / (px * .8) * density))
    rng = np.random.default_rng(seed)
    gx = (np.arange(cols) + .5) / cols - .5; gy = (np.arange(rows) + .5) / rows - .5
    GX, GY = np.meshgrid(gx * w, gy * h)
    P = np.stack([GX.ravel(), GY.ravel()], 1)
    alive = rng.random(len(P)) < strength
    jit = rng.normal(0, 1, P.shape)
    P = P + jit * px * .08 + rout * jit * np.array([w, h]) * .9 + rout * np.array([0, h * 1.5])
    ca, sa = math.cos(math.radians(angle)), math.sin(math.radians(angle))
    R = np.array([[ca, -sa], [sa, ca]])
    Q = P @ R.T + np.array([x, y])
    a = alpha * (1 - .6 * rout)
    if shadow and rout < .5:
        box = cv2.boxPoints(((x + 6, y + 8), (w * 1.05, h * 1.1), angle))
        ov = f.copy(); cv2.fillPoly(ov, [(box * 8).astype(np.int32)], (30, 20, 10), cv2.LINE_AA, 3)
        cv2.addWeighted(ov, .22 * a * (1 - rout * 2), f, 1 - .22 * a * (1 - rout * 2), 0, f)
    spr = _soldier(kind, tuple(int(c) for c in color), px)
    order = np.argsort(Q[:, 1])
    ph = rng.uniform(0, 6.28, len(Q))
    for i in order:
        if not alive[i]: continue
        bobv = math.sin(t * (7 if kind == "cav" else 4) + ph[i]) * px * .06
        blit(f, spr, Q[i, 0], Q[i, 1] + bobv, a)
    top = Q[:, 1].min(); bot = Q[:, 1].max()
    if flag and rout < .7:
        fx_, fy_ = x, top + px * .3
        banner(f, fx_, fy_, t, flag_color or tuple(int(c) for c in color), h=int(max(34, px * 3.2)), seed=seed, alpha=a * (1 - rout), emblem=emblem)
    if label:
        blit(f, text_sprite(label, "cinzel", max(22, int(px * 1.25)), "#f4e4bc", 800, stroke=2, glow="#000000", spacing=2), x, bot + px * 1.3, a)

# ---------------------------------------------------------------- camera / impact helpers
def shake(f, t, t0, amp=6, dur=.35):
    """small camera shake starting at t0 (call last, after drawing)."""
    if not (t0 <= t < t0 + dur): return f
    k = 1 - (t - t0) / dur
    dx = amp * k * math.sin(t * 90); dy = amp * k * math.cos(t * 77)
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(f, M, (f.shape[1], f.shape[0]), borderMode=cv2.BORDER_REFLECT)

def impact_ring(f, x, y, t, t0, r=120, color=(255, 230, 170), dur=.6):
    if not (t0 <= t < t0 + dur): return
    p = (t - t0) / dur
    ov = f.copy()
    cv2.circle(ov, (int(x), int(y)), int(r * ease_out(p)), color, max(2, int(10 * (1 - p))), cv2.LINE_AA)
    cv2.addWeighted(ov, 1 - p, f, p, 0, f)

def grade(f, warm=.0, desat=.0, red=.0):
    """quick colour grade: warm tint, desaturation (defeat/death), red pulse (slaughter)."""
    x = f.astype(np.float32)
    if desat > 0:
        g = x.mean(-1, keepdims=True); x = x * (1 - desat) + g * desat
    if warm: x *= np.array([1 + .06 * warm, 1 + .02 * warm, 1 - .06 * warm], np.float32)
    if red: x = x * (1 - .25 * red) + np.array([160, 20, 10], np.float32) * .25 * red
    f[:] = np.clip(x, 0, 255).astype(np.uint8)

@functools.lru_cache(None)
def _inset_img(id_, w, h):
    m = _INSETS[id_]
    return cv2.resize(m.img, (w, h), interpolation=cv2.INTER_AREA)
_INSETS = {}
def locator(f, m, ll, t, x=None, y=None, w=360, h=None, alpha=1.0, box_deg=0.6, label=None):
    """inset locator map (top-right by default) with a pulsing red box at lon/lat ll."""
    if alpha <= 0: return
    h = h or int(w * m.BH / m.BW)
    x = W - w - 40 if x is None else x; y = 40 if y is None else y
    x = int(max(6, min(x, W - w - 6))); y = int(max(6, min(y, H - h - 6)))   # v6: never off-frame
    _INSETS[id(m)] = m
    img = _inset_img(id(m), w, h)
    roi = f[y:y + h, x:x + w]
    cv2.addWeighted(img, alpha, roi, 1 - alpha, 0, roi)
    cv2.rectangle(f, (x - 3, y - 3), (x + w + 3, y + h + 3), (24, 14, 8), 6)
    cv2.rectangle(f, (x - 3, y - 3), (x + w + 3, y + h + 3), (214, 170, 80), 2)
    sx, sy = w / m.BW, h / m.BH
    px, py = m.proj(ll)
    half = box_deg / 2 * m.k * sx
    pulse = 1 + .15 * math.sin(t * 5)
    cv2.rectangle(f, (int(x + px * sx - half * pulse), int(y + py * sy - half * pulse)), (int(x + px * sx + half * pulse), int(y + py * sy + half * pulse)), (200, 30, 30), 3, cv2.LINE_AA)
    if label:
        blit(f, text_sprite(label, "cinzel", 26, "#f4e4bc", 800, stroke=2, glow="#000000", spacing=2), x + w / 2, y + h + 26, alpha)

# ================================================================ v3 additions (Hattin 1187, 20 Oct 2026)
# quote_card (primary-source card), thirst_meter (resource HUD), smoke (cached drifting smoke), volley_arcs
# (animated arrow storms), fire_line (spreading grass fire), oob_row (order-of-battle row), goblet icon.
@functools.lru_cache(None)
def _card_bg(w, h, seed=3):
    img = parchment(w, h, seed, 0.0).astype(np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    edge = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy))
    img *= (0.72 + 0.28 * np.clip(edge / 60, 0, 1))[..., None]
    img = np.clip(img, 0, 255).astype(np.uint8)
    rgba = np.dstack([img, np.full((h, w), 255, np.uint8)])
    # torn edge alpha
    rng = np.random.default_rng(seed)
    a = np.full((h, w), 255, np.uint8)
    for side in range(4):
        n = 80; jit = rng.uniform(0, 9, n)
        if side < 2:
            xs = np.linspace(0, w, n); ys = jit if side == 0 else h - jit
            for i in range(n - 1):
                if side == 0: a[: int(ys[i]), int(xs[i]):int(xs[i + 1]) + 1] = 0
                else: a[int(ys[i]):, int(xs[i]):int(xs[i + 1]) + 1] = 0
        else:
            ys = np.linspace(0, h, n); xs = jit if side == 2 else w - jit
            for i in range(n - 1):
                if side == 2: a[int(ys[i]):int(ys[i + 1]) + 1, : int(xs[i])] = 0
                else: a[int(ys[i]):int(ys[i + 1]) + 1, int(xs[i]):] = 0
    rgba[..., 3] = a
    cv2.rectangle(rgba, (26, 26), (w - 27, h - 27), (120, 84, 44, 255), 2, cv2.LINE_AA)
    return premult(rgba)

def quote_card(f, lines, source, t, t0, t1=1e9, x=None, y=None, w=1360, size=50, seal=True, label="PRIMARY SOURCE"):
    """Parchment card with a primary-source quote: words appear one by one, source line + wax seal."""
    a = window(t, t0, t1, .45, .45)
    if a <= 0: return
    x = W / 2 if x is None else x; y = H / 2 if y is None else y
    lh = int(size * 1.35); h = 120 + lh * len(lines) + 110
    bg = _card_bg(w, h)
    rise = (1 - ease_out((t - t0) / .6)) * 40
    ov = f.copy(); cv2.rectangle(ov, (int(x - w / 2 + 18), int(y - h / 2 + 22 + rise)), (int(x + w / 2 + 18), int(y + h / 2 + 22 + rise)), (0, 0, 0), -1)
    cv2.addWeighted(ov, .35 * a, f, 1 - .35 * a, 0, f)
    blit(f, bg, x, y + rise, a)
    blit(f, text_sprite(label, "cinzel", 26, "#7a2a1a", 800, shadow=False, spacing=8), x, y - h / 2 + 58 + rise, a)
    words = sum(len(l.split()) for l in lines)
    shown = int(clamp((t - t0 - .4) / max(.8, words * .16)) * words + .999)
    k = 0
    for i, l in enumerate(lines):
        ws = l.split(); n = max(0, min(len(ws), shown - k)); k += len(ws)
        if n <= 0: continue
        full = text_sprite(l, "garamond", size, "#2a1a0c", 600, shadow=False, spacing=1)
        part = text_sprite(" ".join(ws[:n]), "garamond", size, "#2a1a0c", 600, shadow=False, spacing=1)
        x0 = x - full[0].shape[1] / 2
        blit(f, part, x0, y - h / 2 + 120 + lh * i + lh / 2 + rise, a, anchor="l")
    blit(f, text_sprite("— " + source, "cinzel", 30, "#5a3a1e", 700, shadow=False, spacing=2), x + w / 2 - 70, y + h / 2 - 62 + rise, a * prog(t, t0 + .8, .5), anchor="r")
    if seal:
        sx, sy = x - w / 2 + 90, y + h / 2 - 60 + rise
        p = prog(t, t0 + .6, .35, back_out)
        if p > 0:
            ov = f.copy(); r = int(44 * p)
            cv2.circle(ov, (int(sx), int(sy)), r, (130, 20, 22), -1, cv2.LINE_AA)
            cv2.circle(ov, (int(sx), int(sy)), int(r * .7), (170, 40, 36), 3, cv2.LINE_AA)
            cv2.addWeighted(ov, a, f, 1 - a, 0, f)

def thirst_meter(f, level, t, a=1.0, x=110, y=620, h=330):
    """Water-skin HUD: a vertical gauge that drains; turns red and pulses when low (level 0..1)."""
    if a <= 0: return
    level = clamp(level)
    ov = f.copy()
    w = 56
    cv2.rectangle(ov, (int(x - w / 2 - 8), int(y - h - 8)), (int(x + w / 2 + 8), int(y + 8)), (20, 12, 6), -1)
    cv2.addWeighted(ov, .6 * a, f, 1 - .6 * a, 0, f)
    low = level < .3
    col = (200, 40, 30) if low else (60, 140, 200)
    if low: col = tuple(int(c * (.75 + .25 * math.sin(t * 8))) for c in col)
    top = y - h * level
    ov = f.copy()
    cv2.rectangle(ov, (int(x - w / 2), int(top)), (int(x + w / 2), int(y)), col, -1)
    # wavy surface
    xs = np.arange(int(x - w / 2), int(x + w / 2) + 1, 2)
    ys = top + 3 * np.sin(xs / 6 + t * 5)
    cv2.polylines(ov, [np.stack([xs, ys], 1).astype(np.int32)], False, (220, 240, 255), 2, cv2.LINE_AA)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)
    cv2.rectangle(f, (int(x - w / 2 - 2), int(y - h - 2)), (int(x + w / 2 + 2), int(y + 2)), (214, 170, 80), 3, cv2.LINE_AA)
    # drop icon
    dy = y - h - 60
    pts = np.array([[x, dy - 34], [x + 22, dy + 2], [x, dy + 24], [x - 22, dy + 2]], np.float32)
    ov = f.copy()
    cv2.circle(ov, (int(x), int(dy + 6)), 21, col, -1, cv2.LINE_AA)
    cv2.fillPoly(ov, [(np.array([[x - 18, dy - 2], [x, dy - 36], [x + 18, dy - 2]]) * 8).astype(np.int32)], col, cv2.LINE_AA, 3)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)
    blit(f, text_sprite("WATER", "cinzel", 26, "#f4e4bc", 800, stroke=2, glow="#000000", spacing=3), x, y + 34, a)
    blit(f, text_sprite(f"{int(round(level * 100))}%", "cinzel", 30, "#ffd0c0" if low else "#d8ecff", 800, stroke=2, glow="#000000"), x, y - h - 110, a)

@functools.lru_cache(None)
def _smoke_tex(seed=0):
    n = fbm(400, 1200, seed, 5, 3)
    n = np.clip((n - .35) * 2.2, 0, 1).astype(np.float32)
    return np.hstack([n, n[:, ::-1]])   # mirrored -> seamless when scrolled

def smoke(f, t, amt, seed=0, speed=60, color=(120, 108, 96), dir=1):
    """drifting smoke layer (cached noise, scrolled) — cheap: one resize per frame."""
    if amt <= 0.01: return
    tex = _smoke_tex(seed)
    off = int((t * speed / 4) % 2400) if dir > 0 else int((-t * speed / 4) % 2400)
    tt = np.roll(tex, off, 1)[:, :480]
    m = cv2.resize(tt, (W, H), interpolation=cv2.INTER_LINEAR)[..., None] * amt
    col = np.array(color, np.float32)
    f[:] = (f.astype(np.float32) * (1 - m) + col * m).astype(np.uint8)

def volley_arcs(f, p0, p1, t, t0, dur=1.4, n=30, seed=0, spread=60, height=180, color=(30, 20, 10)):
    """arrow storm: n small arrows fly along parabolic arcs from around p0 to around p1."""
    if not (t0 <= t < t0 + dur + .6): return
    rng = np.random.default_rng(seed)
    for i in range(n):
        d0 = rng.uniform(0, .6); u = (t - t0 - d0) / dur
        if u < 0 or u > 1: continue
        a0 = (p0[0] + rng.normal(0, spread * .5), p0[1] + rng.normal(0, spread * .5))
        a1 = (p1[0] + rng.normal(0, spread), p1[1] + rng.normal(0, spread))
        def P(v): return (lerp(a0[0], a1[0], v), lerp(a0[1], a1[1], v) - height * 4 * v * (1 - v))
        x, y = P(u); x2, y2 = P(max(0, u - .05))
        ang = math.atan2(y - y2, x - x2); L = 16
        tail = (x - L * math.cos(ang), y - L * math.sin(ang))
        cv2.line(f, (int(tail[0]), int(tail[1])), (int(x), int(y)), color, 2, cv2.LINE_AA)
        cv2.line(f, (int(tail[0]), int(tail[1])), (int(tail[0] - 5 * math.cos(ang - .6)), int(tail[1] - 5 * math.sin(ang - .6))), (230, 220, 200), 1, cv2.LINE_AA)

def fire_line(f, pts, t, a=1.0, seed=0, h=60):
    """a burning front along polyline pts (screen coords): glow band, layered flickering flame tongues, embers."""
    if a <= 0 or not len(pts): return
    ov = f.copy()
    P = np.array(pts, np.float32)
    cv2.polylines(ov, [(P * 8).astype(np.int32)], False, (200, 70, 20), int(h * .9), cv2.LINE_AA, 3)
    cv2.addWeighted(ov, .35 * a, f, 1 - .35 * a, 0, f)
    ov = f.copy()
    for i in range(len(P) - 1):
        for j in range(3):
            u = (j + .5) / 3
            x = P[i, 0] + (P[i + 1, 0] - P[i, 0]) * u; y = P[i, 1] + (P[i + 1, 1] - P[i, 1]) * u
            k = i * 3 + j
            fl = h * (.7 + .45 * math.sin(t * 9 + k * 1.7) * math.sin(t * 5.3 + k * .9))
            sw = math.sin(t * 6 + k) * h * .15
            for col, s_ in (((230, 80, 20), 1.0), ((255, 150, 40), .7), ((255, 225, 120), .4)):
                wdt = h * .45 * s_
                pts_ = np.array([[x - wdt, y], [x - wdt * .5, y - fl * s_ * .5], [x + sw * s_, y - fl * s_], [x + wdt * .5, y - fl * s_ * .5], [x + wdt, y]], np.float32)
                cv2.fillPoly(ov, [(pts_ * 8).astype(np.int32)], col, cv2.LINE_AA, 3)
    cv2.addWeighted(ov, .9 * a, f, 1 - .9 * a, 0, f)
    xs = P[:, 0]; ys = P[:, 1]
    embers(f, t, 40, seed, (255, 170, 60), (xs.min() - 20, ys.min() - h * 3, xs.max() + 20, ys.max()), speed=70, size=3)

@functools.lru_cache(None)
def goblet(size=120):
    n = size * 2; img = np.zeros((n, n, 4), np.uint8)
    gold = (214, 170, 80, 255); dk = (60, 40, 14, 255)
    cv2.ellipse(img, (n // 2, int(n * .3)), (int(n * .3), int(n * .22)), 0, 0, 180, dk, -1, cv2.LINE_AA)
    cv2.ellipse(img, (n // 2, int(n * .3)), (int(n * .27), int(n * .19)), 0, 0, 180, gold, -1, cv2.LINE_AA)
    cv2.ellipse(img, (n // 2, int(n * .3)), (int(n * .3), int(n * .06)), 0, 0, 360, (90, 160, 210, 255), -1, cv2.LINE_AA)
    cv2.ellipse(img, (n // 2, int(n * .3)), (int(n * .3), int(n * .06)), 0, 0, 360, dk, 3, cv2.LINE_AA)
    cv2.rectangle(img, (int(n * .47), int(n * .5)), (int(n * .53), int(n * .8)), gold, -1)
    cv2.ellipse(img, (n // 2, int(n * .82)), (int(n * .18), int(n * .05)), 0, 0, 360, gold, -1, cv2.LINE_AA)
    cv2.ellipse(img, (n // 2, int(n * .82)), (int(n * .18), int(n * .05)), 0, 0, 360, dk, 2, cv2.LINE_AA)
    img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
    return premult(img)

def oob_row(f, x, y, t, t0, kind, color, label, value, a=1.0, align="l", vfmt="{:,}", seed=0):
    """order-of-battle row: small formation icon + animated counter + label."""
    p = prog(t, t0, .5)
    if p <= 0 or a <= 0: return
    aa = a * p
    sx = x + (1 - ease_out(p)) * (-80 if align == "l" else 80)
    formation(f, sx + (60 if align == "l" else -60), y, 120, 54, color, t, angle=0, kind=kind, flag=False, seed=seed, alpha=aa, shadow=False)
    v = value * ease_out((t - t0) / 1.3) if isinstance(value, (int, float)) else value
    txt = vfmt.format(int(v)) if isinstance(value, (int, float)) else value
    xs = sx + (150 if align == "l" else -150)
    blit(f, (text_sprite.__wrapped__ if isinstance(value, (int, float)) and txt != vfmt.format(int(value)) else text_sprite)(txt, "cinzel", 64, "#fff1d0", 900, stroke=3, glow="#000000"), xs, y - 10, aa, anchor="l" if align == "l" else "r")
    blit(f, text_sprite(label, "garamond", 34, "#e8d8b8", 600, stroke=2, glow="#000000", spacing=1), xs, y + 44, aa, anchor="l" if align == "l" else "r")

# ================================================================ v4 additions (Roanoke / Unsolved #1, 22 Oct 2026)
# Mystery toolkit: carve (letters cut into bark, chip particles), evidence_card + red_string (investigation board),
# stamp (slammed rubber stamp), evidence_meter (theory rating 0..5), tree_rings (dendro chart), fog (low ground mist),
# patch_reveal (X-ray scan under a paper patch).
@functools.lru_cache(None)
def _bark(w, h, seed=0, stripped=False):
    rng = np.random.default_rng(seed)
    n = fbm(h, w, seed, 6, 3)
    fib = cv2.resize(rng.random((h // 6 + 1, 8)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    if stripped:   # pale inner wood with vertical grain
        base = np.array([196, 160, 112], np.float32); dk = np.array([140, 104, 66], np.float32)
        g = np.clip(fib * .6 + n * .4, 0, 1)[..., None]
    else:
        base = np.array([92, 70, 52], np.float32); dk = np.array([34, 24, 18], np.float32)
        g = np.clip(fib * .7 + n * .5 - .1, 0, 1)[..., None]
    img = base * (1 - g) + dk * g
    if not stripped:
        for x in range(0, w, 70):   # deep bark furrows (sparse, organic)
            xx = x + int(rng.integers(-20, 20))
            pts = np.array([[xx + 14 * math.sin(y / 90 + x), y] for y in range(0, h + 40, 40)], np.int32)
            cv2.polylines(img, [pts], False, tuple(float(v) for v in dk), int(rng.integers(5, 11)), cv2.LINE_AA)
    return np.clip(img, 0, 255).astype(np.uint8)

def carve(f, text, x, y, t, t0, dur=2.0, size=150, panel=None, seed=0, a=1.0, spacing=18):
    """Letters cut into stripped wood one by one (dark grooves + light bevel), with flying wood chips.
    panel=(w,h) draws a stripped-bark panel behind the letters."""
    if a <= 0: return
    if panel:
        pw, ph = panel
        img = _bark(pw, ph, seed, True)
        x0, y0 = int(x - pw / 2), int(y - ph / 2)
        X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(W, x0 + pw), min(H, y0 + ph)
        if X1 > X0 and Y1 > Y0:
            roi = f[Y0:Y1, X0:X1]
            cv2.addWeighted(img[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0], a, roi, 1 - a, 0, roi)
    n = len(text); p = clamp((t - t0) / dur) * n
    full = text_sprite(text, "cinzel", size, "#2a160a", 900, shadow=False, spacing=spacing)
    tw = full[0].shape[1]
    xl = x - tw / 2
    shown = text[: int(p)]
    if shown:
        bev = text_sprite(shown, "cinzel", size, "#f0d6a8", 900, shadow=False, spacing=spacing)
        groove = text_sprite(shown, "cinzel", size, "#2a160a", 900, shadow=False, spacing=spacing)
        blit(f, bev, xl + 3, y + 4, a * .8, anchor="l")
        blit(f, groove, xl, y, a, anchor="l")
    if 0 < p < n:   # chips flying off the current letter
        cur = text_sprite(text[: int(p) + 1], "cinzel", size, "#000", 900, shadow=False, spacing=spacing)[0].shape[1]
        cx_ = xl + cur - size * .45
        rng = np.random.default_rng(int(p) + seed)
        fr = (p % 1)
        for k in range(10):
            ang = rng.uniform(-2.6, -.4); sp = rng.uniform(80, 240)
            px = cx_ + math.cos(ang) * sp * fr; py = y + math.sin(ang) * sp * fr + 260 * fr * fr
            cv2.circle(f, (int(px), int(py)), int(rng.uniform(2, 5)), (214, 180, 130), -1, cv2.LINE_AA)

@functools.lru_cache(None)
def _ecard(w, h, seed):
    bg = _card_bg(w, h, seed)
    return bg

def evidence_card(f, num, title, x, y, t, t0, t1=1e9, draw=None, w=420, h=470, rot=0.0, sub=None, a=1.0):
    """Pinned parchment evidence card: 'EVIDENCE 0n' tag, sketch area (draw(f, cx, cy, s, a)), caption."""
    aa = window(t, t0, t1, .35, .45) * a
    if aa <= 0: return
    drop = (1 - ease_out((t - t0) / .45)) * -60
    sc = 1 + .25 * (1 - back_out((t - t0) / .45))
    tmp = np.zeros((h + 80, w + 80, 3), np.uint8)
    rgb, al = _ecard(w, h, 7 + num)
    card = np.zeros((h + 80, w + 80, 4), np.float32)
    canvas = tmp.copy()
    blit(canvas, (rgb, al), (w + 80) / 2, (h + 80) / 2, 1.0)
    blit(canvas, text_sprite(f"EVIDENCE {num:02d}", "cinzel", 24, "#8e1b1b", 800, shadow=False, spacing=5), (w + 80) / 2, 40 + 48, 1.0)
    if draw: draw(canvas, (w + 80) / 2, 40 + h * .46, w / 420, 1.0)
    blit(canvas, text_sprite(title, "cinzel", int(min(34, w * 1.05 / max(1, len(title)))), "#2a1a0c", 800, shadow=False, spacing=2), (w + 80) / 2, 40 + h - 92, 1.0)
    if sub: blit(canvas, text_sprite(sub, "garamond", 26, "#5a3a1e", 600, shadow=False), (w + 80) / 2, 40 + h - 54, 1.0)
    mask = np.zeros((h + 80, w + 80), np.float32)
    mask[40:40 + h, 40:40 + w] = cv2.resize(al[..., 0] if al.ndim == 3 else al, (w, h))
    spr = (canvas.astype(np.float32) * mask[..., None], mask[..., None])
    # shadow
    ov = f.copy()
    cv2.rectangle(ov, (int(x - w * sc / 2 + 14), int(y + drop - h * sc / 2 + 18)), (int(x + w * sc / 2 + 14), int(y + drop + h * sc / 2 + 18)), (0, 0, 0), -1)
    cv2.addWeighted(ov, .35 * aa, f, 1 - .35 * aa, 0, f)
    blit(f, spr, x, y + drop, aa, sc, rot=rot)
    # pin
    px, py = x, y + drop - h * sc / 2 + 22
    ov = f.copy()
    cv2.circle(ov, (int(px), int(py)), 13, (40, 10, 10), -1, cv2.LINE_AA)
    cv2.circle(ov, (int(px), int(py)), 10, (190, 30, 30), -1, cv2.LINE_AA)
    cv2.circle(ov, (int(px - 3), int(py - 3)), 3, (255, 200, 200), -1, cv2.LINE_AA)
    cv2.addWeighted(ov, aa, f, 1 - aa, 0, f)

def red_string(f, pts, t, t0, dur=.8, a=1.0):
    """red thread stretched between pins (drawn progressively)."""
    if a <= 0 or t < t0: return
    P = np.array(pts, np.float32)
    sag = []
    for i in range(len(P) - 1):
        p0, p1 = P[i], P[i + 1]
        mid = (p0 + p1) / 2 + np.array([0, 30], np.float32)
        sag.extend(bezier(p0, mid, p1, 30).tolist())
    sag = np.array(sag, np.float32)
    q = partial(sag, clamp((t - t0) / dur))
    if len(q) < 2: return
    ov = f.copy()
    cv2.polylines(ov, [(q * 8).astype(np.int32)], False, (20, 4, 4), 6, cv2.LINE_AA, 3)
    cv2.polylines(ov, [(q * 8).astype(np.int32)], False, (190, 26, 26), 3, cv2.LINE_AA, 3)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)

@functools.lru_cache(None)
def _stamp_spr(text, size, color):
    spr = text_sprite(text, "cinzel", size, color, 900, shadow=False, spacing=int(size * .12))
    rgb, al = spr
    h, w = al.shape[:2]
    pad = int(size * .35)
    img = np.zeros((h + pad * 2, w + pad * 2, 4), np.uint8)
    c = hexc(color)
    cv2.rectangle(img, (pad // 2, pad // 2), (w + pad * 3 // 2, h + pad * 3 // 2), c + (255,), max(4, size // 12))
    a2 = np.zeros((h + pad * 2, w + pad * 2), np.float32)
    a2[pad:pad + h, pad:pad + w] = al[..., 0] if al.ndim == 3 else al
    a2 = np.maximum(a2, img[..., 3].astype(np.float32) / 255)
    grit = fbm(a2.shape[0], a2.shape[1], 9, 5, 8)
    a2 *= np.clip((grit - .08) * 4, .35, 1)
    rgbf = np.zeros(a2.shape + (3,), np.float32) + np.array(c, np.float32)
    return (rgbf * a2[..., None], a2[..., None])

def stamp(f, text, x, y, t, t0, size=120, color="#b01e1e", rot=-8, a=1.0):
    """rubber stamp slammed onto the frame (scale 1.8 -> 1 with a thud ring)."""
    if t < t0 or a <= 0: return
    p = ease_out((t - t0) / .22)
    sc = lerp(1.8, 1.0, p)
    blit(f, _stamp_spr(text, size, color), x, y, a * min(1, (t - t0) / .12 + .2) * .92, sc, rot=rot)

def evidence_meter(f, x, y, score, t, t0, label="EVIDENCE", a=1.0, w=520):
    """theory rating: 5 segments fill up to `score` (0..5, halves allowed)."""
    aa = prog(t, t0, .4) * a
    if aa <= 0: return
    blit(f, text_sprite(label, "cinzel", 30, "#e8d8b8", 800, stroke=2, glow="#000000", spacing=5), x, y - 52, aa)
    seg = w / 5; fill = score * ease_out((t - t0 - .3) / 1.2)
    for k in range(5):
        x0 = x - w / 2 + k * seg + 6; x1 = x0 + seg - 12
        ov = f.copy()
        cv2.rectangle(ov, (int(x0), int(y - 18)), (int(x1), int(y + 18)), (20, 12, 6), -1)
        q = clamp(fill - k)
        if q > 0:
            col = (190, 50, 40) if score < 2 else ((214, 160, 60) if score < 3.5 else (90, 170, 90))
            cv2.rectangle(ov, (int(x0), int(y - 18)), (int(x0 + (x1 - x0) * q), int(y + 18)), col, -1)
        cv2.addWeighted(ov, aa, f, 1 - aa, 0, f)
        cv2.rectangle(f, (int(x0), int(y - 18)), (int(x1), int(y + 18)), (214, 170, 80), 2, cv2.LINE_AA)

def tree_rings(f, x, y, r, t, t0, years=(1560, 1600), hl=(1587, 1589), a=1.0):
    """cross-section of a cypress: rings grow outward year by year; drought years drawn thin + red."""
    if a <= 0 or t < t0: return
    rng = np.random.default_rng(4)
    n = years[1] - years[0]
    widths = rng.uniform(.8, 1.3, n)
    for k in range(n):
        if hl[0] <= years[0] + k <= hl[1]: widths[k] = .22
    radii = np.cumsum(widths); radii = radii / radii[-1] * r
    shown = int(clamp((t - t0) / 3.0) * n)
    ov = f.copy()
    cv2.circle(ov, (int(x), int(y)), int(r + 18), (60, 38, 22), -1, cv2.LINE_AA)
    cv2.circle(ov, (int(x), int(y)), int(r + 4), (200, 160, 110), -1, cv2.LINE_AA)
    cv2.addWeighted(ov, a, f, 1 - a, 0, f)
    for k in range(shown):
        yr = years[0] + k
        dr = hl[0] <= yr <= hl[1]
        wob = [radii[k] * (1 + .03 * math.sin(j * .7 + k)) for j in range(36)]
        pts = np.array([[x + wob[j] * math.cos(j / 36 * 6.283), y + wob[j] * math.sin(j / 36 * 6.283)] for j in range(36)], np.float32)
        cv2.polylines(f, [(pts * 8).astype(np.int32)], True, (200, 40, 30) if dr else (120, 80, 46), 4 if dr else 2, cv2.LINE_AA, 3)
    cv2.circle(f, (int(x), int(y)), 6, (90, 60, 30), -1, cv2.LINE_AA)

def fog(f, t, amt, seed=5, speed=25, color=(150, 162, 178), low=True):
    """drifting ground mist; low=True concentrates it in the lower half."""
    if amt <= 0.01: return
    tex = _smoke_tex(seed)
    off = int((t * speed / 4) % 2400)
    tt = np.roll(tex, off, 1)[:, :480]
    m = cv2.resize(tt, (W, H), interpolation=cv2.INTER_LINEAR)
    if low: m = m * _fog_ramp()
    m = m[..., None] * amt
    f[:] = (f.astype(np.float32) * (1 - m) + np.array(color, np.float32) * m).astype(np.uint8)

@functools.lru_cache(None)
def _fog_ramp():
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    return np.clip((yy - .35) * 1.8, 0, 1) * np.ones((1, W), np.float32)

# ---------------------------------------------------------------- v5 (23 Oct 2026): weather layer + viewer poll card
@functools.lru_cache(None)
def storm_sky():
    """moonless storm sky: dark gradient + layered cloud deck (no stars, no moon). Cached."""
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    top, hor = np.array([16, 20, 28], np.float32), np.array([70, 82, 98], np.float32)
    img = np.repeat(top * (1 - yy ** .9) + hor * yy ** .9, W, 1)
    n = fbm(270, 960, 41, 6, 3); n = cv2.resize(n.astype(np.float32), (W, int(H * .62)))
    sh = np.clip((n - .3) * 1.6, 0, 1)[..., None]
    img[: int(H * .62)] = img[: int(H * .62)] * (1 - .35 * sh) + np.array([70, 76, 88], np.float32) * .35 * sh
    return np.clip(img, 0, 255).astype(np.uint8)

@functools.lru_cache(None)
def _cloud_tex(seed=0):
    n = fbm(300, 1200, seed, 6, 3)
    n = np.clip((n - .38) * 2.6, 0, 1).astype(np.float32)
    return np.hstack([n, n[:, ::-1]])

def clouds(f, t, amt=.85, seed=31, speed=40, color=(26, 30, 38), y1=.62, light=0.0):
    """scrolling cloud deck over the top part of the frame (hides moon/stars). light>0 = underlit by lightning."""
    if amt <= .01: return
    h1 = int(H * y1); tex = _cloud_tex(seed)
    off = int((t * speed / 4) % 2400)
    m = cv2.resize(np.roll(tex, off, 1)[:, :480], (W, h1), interpolation=cv2.INTER_LINEAR)
    ramp = np.clip(1.15 - np.linspace(0, 1, h1, dtype=np.float32) ** 1.6, 0, 1)[:, None]
    m = (m * ramp * amt)[..., None]
    col = np.array(color, np.float32) + light * np.array([150, 160, 190], np.float32)
    f[:h1] = (f[:h1].astype(np.float32) * (1 - m) + col * m).astype(np.uint8)

@functools.lru_cache(None)
def _rain_tile(seed=0, n=260, ln=46, slant=14, tw=W, th=H):
    tile = np.zeros((th, tw), np.uint8); rng = np.random.default_rng(seed)
    for _ in range(n):
        x, y = rng.uniform(0, tw), rng.uniform(0, th); l = ln * rng.uniform(.6, 1.2)
        cv2.line(tile, (int(x), int(y)), (int(x - slant * l / ln), int(y + l)), int(rng.uniform(90, 230)), 1, cv2.LINE_AA)
    return tile

def rain_layer(f, t, amt=.6, speed=1500, seed=0, color=(170, 184, 206), layers=2):
    """two parallax sheets of rain streaks from cached tiles — cheap (np.roll + blend)."""
    for k in range(layers):
        tile = _rain_tile(seed + k, 260 - 90 * k, 46 + 22 * k, 14 + 8 * k)
        off = int((t * speed * (1 + .5 * k)) % H)
        m = np.roll(tile, off, 0).astype(np.float32)[..., None] / 255 * amt * (1 - .25 * k)
        f[:] = (f.astype(np.float32) * (1 - m) + np.array(color, np.float32) * m).astype(np.uint8)

def _bolt_pts(x0, y0, y1, seed, rough=60):
    rng = np.random.default_rng(seed); pts = [(x0, y0)]; x, y = x0, y0
    while y < y1:
        y += rng.uniform(30, 70); x += rng.uniform(-rough, rough) * .6; pts.append((x, min(y, y1)))
    return pts

def lightning(f, t, t0, x=None, seed=0, y1=None, dur=.45):
    """forked lightning bolt + full-frame flash; returns flash intensity 0..1 (use to underlight clouds)."""
    if not (t0 <= t < t0 + dur): return 0.0
    k = (t - t0) / dur
    inten = (1 - k) ** 1.5 * (1 if (int(k * 9) % 3) else .45)   # flicker
    x = W * .7 if x is None else x; y1 = H * .6 if y1 is None else y1
    main = _bolt_pts(x, -10, y1, seed)
    ov = np.zeros_like(f)
    for (pts, wdt) in [(main, 5)] + [(_bolt_pts(*main[j], main[j][1] + 180, seed + j, 50), 2) for j in (3, 6) if j < len(main)]:
        p = np.array(pts, np.int32)
        cv2.polylines(ov, [p], False, (90, 110, 170), wdt * 6, cv2.LINE_AA)
        cv2.polylines(ov, [p], False, (255, 255, 255), wdt, cv2.LINE_AA)
    cv2.add(f, (ov * inten).astype(np.uint8), f)
    fill_alpha(f, (210, 222, 255), .35 * inten)
    return inten

def weather(f, t, rain=.6, cloud=.85, bolts=(), seed=0, speed=1500):
    """one call storm layer: cloud deck + rain sheets + lightning at times `bolts` [(t0, x), ...]."""
    light = 0.0
    for j, b in enumerate(bolts):
        t0, bx = b if isinstance(b, (tuple, list)) else (b, None)
        if t0 <= t < t0 + .45:
            k = (t - t0) / .45; light = max(light, (1 - k) ** 1.5)
    clouds(f, t, cloud, seed=31 + seed, light=light)
    for j, b in enumerate(bolts):
        t0, bx = b if isinstance(b, (tuple, list)) else (b, None)
        lightning(f, t, t0, bx, seed=seed * 10 + j)
    if rain > 0: rain_layer(f, t, rain, speed, seed)

def poll_card(f, t, t0, options, x=None, y=None, w=1100, a=1.0, title="WHAT DO YOU THINK HAPPENED?", hl_times=(), hl_d=1.0):
    """viewer prompt card (community-poll style): question + lettered options A/B/C/D that slide in; the option
    whose time is in hl_times gets highlighted while it is named. No fake vote numbers. Ends with a typing comment line."""
    if t < t0 or a <= 0: return
    x = W / 2 if x is None else x; y = H / 2 if y is None else y
    n = len(options); rh = 104; hh = 124 + n * rh + 20
    ap = min(1.0, prog(t, t0, .45, back_out)) * a
    if ap <= .02: return
    x0, y0 = int(x - w / 2), int(y - hh / 2)
    ov = f.copy(); cv2.rectangle(ov, (x0, y0), (x0 + w, y0 + hh), (242, 238, 230), -1)
    cv2.addWeighted(ov, ap * .96, f, 1 - ap * .96, 0, f)
    cv2.rectangle(f, (x0, y0), (x0 + w, y0 + hh), (190, 30, 30), 5, cv2.LINE_AA)
    blit(f, text_sprite(title, "sans", 44, "#1a1a1a", None, shadow=False), x, y0 + 64, ap)
    for i, opt in enumerate(options):
        oy = y0 + 124 + i * rh; ra = prog(t, t0 + .35 + i * .22, .35) * a
        if ra <= 0: continue
        sl = int(60 * (1 - ra)); bx0, bx1 = x0 + 40 + sl, x0 + w - 40 + sl
        hl = any(h0 <= t < h0 + hl_d for h0 in (hl_times[i:i + 1] if i < len(hl_times) else ()))
        ov = f.copy(); cv2.rectangle(ov, (bx0, oy), (bx1, oy + 82), (232, 176, 160) if hl else (226, 218, 204), -1)
        cv2.addWeighted(ov, ra, f, 1 - ra, 0, f)
        cv2.circle(f, (bx0 + 50, oy + 41), 28, (190, 30, 30) if hl else (90, 70, 50), -1, cv2.LINE_AA)
        blit(f, text_sprite("ABCD"[i], "sans", 36, "#ffffff", None, shadow=False), bx0 + 50, oy + 41, ra)
        blit(f, text_sprite(opt, "sans", 40, "#222222", None, shadow=False), bx0 + 100, oy + 41, ra, anchor="l")
    cy = y0 + hh + 70; ca = prog(t, t0 + 1.2, .4) * a
    if ca > 0:
        ov = f.copy(); cv2.rectangle(ov, (x0, cy - 44), (x0 + w, cy + 44), (30, 26, 24), -1); cv2.addWeighted(ov, .8 * ca, f, 1 - .8 * ca, 0, f)
        msg = "My theory: ..."
        typed = msg[: int(clamp((t - t0 - 1.4) / 1.4) * len(msg))]
        blit(f, text_sprite(typed + ("|" if int(t * 2) % 2 else " "), "sans", 38, "#f0f0f0", None, shadow=False), x0 + 30, cy, ca, anchor="l")

# ================================================================ v6 additions (Lost Ninth Legion / Unsolved #2, 29 Oct 2026)
# Roman toolkit: aquila() eagle standard, march_column() soldiers marching along a route [backlog #11],
# case_timeline() dated "last seen" case-file ruler, roman_stone() + chisel() engraved inscription with V-cut letters,
# deface() hacking a name off a stone (damnatio memoriae), eagle emblem for banners.
@functools.lru_cache(None)
def aquila(size=300, grey=False, bronze=False, wings=True, pole=True):
    """golden legionary eagle with spread wings on a wreath and pole (premultiplied sprite, size = height)."""
    n = size * 2; img = Image.new("RGBA", (n, n), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    gold, gd, hi = (222, 176, 60, 255), (120, 84, 20, 255), (255, 226, 130, 255)
    if grey: gold, gd, hi = (150, 146, 140, 255), (70, 68, 64, 255), (200, 196, 190, 255)
    if bronze: gold, gd, hi = (112, 104, 64, 255), (52, 46, 26, 255), (150, 140, 92, 255)
    cx = n / 2
    if pole: d.rectangle([cx - n * .018, n * .52, cx + n * .018, n * .99], fill=(96, 62, 30, 255), outline=(40, 24, 10, 255), width=3)
    if not wings:   # broken wing sockets (Silchester eagle)
        for sx in (-1, 1): d.ellipse([cx + sx * n * .07 - n * .03, n * .33, cx + sx * n * .07 + n * .03, n * .39], fill=gd)
    if pole: d.ellipse([cx - n * .13, n * .5, cx + n * .13, n * .62], outline=gold, width=int(n * .03))     # wreath
    for k in (range(10) if pole else ()):
        a_ = math.pi * k / 9; px, py = cx + n * .13 * math.cos(a_), n * .56 + n * .06 * math.sin(a_)
        d.ellipse([px - n * .02, py - n * .012, px + n * .02, py + n * .012], fill=gold, outline=gd)
    d.rectangle([cx - n * .1, n * .46, cx + n * .1, n * .5], fill=gold, outline=gd, width=3)          # perch
    for sx in ((-1, 1) if wings else ()):   # wings: three feather rows
        for row in range(3):
            pts = [(cx + sx * n * .04, n * (.36 + row * .03))]
            for k in range(7):
                u = k / 6
                pts.append((cx + sx * n * (.06 + .34 * u), n * (.36 + row * .03) - n * (.24 - row * .05) * math.sin(u * 2.4) + n * .02 * row))
            pts.append((cx + sx * n * .38, n * (.42 + row * .02)))
            pts.append((cx + sx * n * .05, n * (.44 + row * .01)))
            d.polygon(pts, fill=[gold, hi, gold][row] if row != 1 else gold, outline=gd)
    d.ellipse([cx - n * .07, n * .3, cx + n * .07, n * .48], fill=gold, outline=gd, width=3)          # body
    d.ellipse([cx - n * .045, n * .21, cx + n * .045, n * .3], fill=gold, outline=gd, width=3)        # head
    d.polygon([(cx + n * .035, n * .245), (cx + n * .085, n * .26), (cx + n * .04, n * .28)], fill=(200, 120, 30, 255), outline=gd)
    d.ellipse([cx + n * .008, n * .235, cx + n * .022, n * .249], fill=(30, 20, 10, 255))
    img = img.resize((size, size), Image.LANCZOS)
    return pil_sprite(img)

def march_column(f, pts, p, length, color, t, ranks=4, px=20, alpha=1.0, flag=True, emblem="eagle", seed=0, gap=None, fade_tail=True):
    """[backlog #11] a column of marching soldiers along polyline pts: head at fraction p of the route, the column
    trailing `length` px behind it, `ranks` men abreast. Legs bob in step; standard-bearer with banner at the head."""
    if alpha <= 0 or p <= 0: return
    P = np.asarray(pts, np.float32)
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)]); Ltot = cum[-1]
    head = clamp(p) * Ltot
    def at(s):
        s = clamp(s, 0, Ltot); i = min(len(seg) - 1, int(np.searchsorted(cum, s, side="right") - 1))
        u = (s - cum[i]) / max(1e-6, seg[i]); q = P[i] + (P[i + 1] - P[i]) * u
        dvec = (P[i + 1] - P[i]) / max(1e-6, seg[i]); return q, dvec
    spr = _soldier("inf", tuple(int(c) for c in color), px)
    step = gap or px * .9; n = int(min(length, head) / step)
    rng = np.random.default_rng(seed)
    items = []
    for j in range(n):
        q, dv = at(head - j * step)
        nrm = np.array([-dv[1], dv[0]])
        for r in range(ranks):
            off = (r - (ranks - 1) / 2) * px * .7
            bob = abs(math.sin(t * 6 + j * .9 + r * .4)) * px * .12
            a = alpha * (1 - (j / max(1, n)) ** 3 * .6 if fade_tail else 1)
            items.append((q[1] + nrm[1] * off, q[0] + nrm[0] * off + rng.normal(0, .6), q[1] + nrm[1] * off - bob, a))
    for yy, xx, yb, a in sorted(items):
        blit(f, spr, xx, yb, a)
    if flag:
        q, _ = at(head)
        banner(f, q[0] + px * .4, q[1] - px * .2, t, (150, 24, 24), h=int(px * 3.4), seed=seed, alpha=alpha, emblem=emblem)
    return at(head)[0]

def case_timeline(f, t, x0, x1, y, y0, y1, events, t0=0.0, a=1.0, cursor=None, gap=None, ticks=20, label_size=30, tick_lab=True):
    """case-file ruler from year y0..y1 at height y. events: list of (year, text, appear_time, kind) with kind in
    'seen' (gold pin), 'last' (red LAST SEEN pin), 'other' (grey), 'gone' (red X). gap=(ya, yb, appear_time) shades an
    unknown stretch with '?' marks. cursor=(year, appear_time) slides a scan line."""
    aa = prog(t, t0, .5) * a
    if aa <= 0: return
    X = lambda yr: x0 + (x1 - x0) * (yr - y0) / (y1 - y0)
    ov = f.copy()
    cv2.rectangle(ov, (int(x0 - 40), int(y - 70)), (int(x1 + 40), int(y + 70)), (12, 8, 6), -1)
    cv2.addWeighted(ov, .55 * aa, f, 1 - .55 * aa, 0, f)
    draw = prog(t, t0, 1.0, ease_io)
    xe = x0 + (x1 - x0) * draw
    cv2.line(f, (int(x0), int(y)), (int(xe), int(y)), (214, 170, 80), 4, cv2.LINE_AA)
    for yr in range(int(math.ceil(y0 / ticks) * ticks), int(y1) + 1, ticks):
        x = X(yr)
        if x > xe: break
        cv2.line(f, (int(x), int(y - 12)), (int(x), int(y + 12)), (214, 170, 80), 2, cv2.LINE_AA)
        if tick_lab: blit(f, text_sprite(f"AD {yr}", "garamond", 26, "#c9b48a", 600, shadow=False), x, y + 34, aa * .9)
    if gap:
        ga, gb, gt = gap; gp = prog(t, gt, .8) * aa
        if gp > 0:
            ov = f.copy(); cv2.rectangle(ov, (int(X(ga)), int(y - 46)), (int(X(ga) + (X(gb) - X(ga)) * gp), int(y + 46)), (150, 30, 30), -1)
            cv2.addWeighted(ov, .35 * gp, f, 1 - .35 * gp, 0, f)
            for k in range(3):
                qx = X(ga) + (X(gb) - X(ga)) * (k + .5) / 3
                blit(f, text_sprite("?", "cinzel", 46, "#ffb0a0", 900, stroke=2, glow="#000000"), qx, y - 2 + 4 * math.sin(t * 2 + k), gp * (.6 + .4 * math.sin(t * 3 + k) ** 2))
    for k, (yr, txt, te, kind) in enumerate(events):
        p = prog(t, te, .45, back_out)
        if p <= 0: continue
        x = X(yr); up = (k % 2 == 0)
        col = {"seen": (214, 170, 80), "last": (200, 40, 30), "other": (150, 150, 150), "gone": (200, 40, 30)}[kind]
        ly = y - 120 if up else y + 120
        cv2.line(f, (int(x), int(y)), (int(x), int(lerp(y, ly + (30 if up else -30), p))), col, 3, cv2.LINE_AA)
        if kind == "gone":
            r = 16 * p
            cv2.line(f, (int(x - r), int(y - r)), (int(x + r), int(y + r)), col, 6, cv2.LINE_AA); cv2.line(f, (int(x - r), int(y + r)), (int(x + r), int(y - r)), col, 6, cv2.LINE_AA)
        else:
            cv2.circle(f, (int(x), int(y)), int(13 * p), (20, 10, 6), -1, cv2.LINE_AA); cv2.circle(f, (int(x), int(y)), int(10 * p), col, -1, cv2.LINE_AA)
        blit(f, text_sprite(txt, "cinzel", label_size, "#f4e4bc" if kind != "last" else "#ffb0a0", 800, stroke=2, glow="#000000", spacing=2), x, ly, min(1, p) * aa)
        if kind == "last":
            blit(f, _stamp_spr("LAST SEEN", 30, "#c0392b"), x, ly - 64 if up else ly + 64, min(1, p) * aa, rot=-4)
    if cursor:
        cy_, ct = cursor; cp = prog(t, ct, 1.4, ease_io)
        if cp > 0:
            x = X(y0) + (X(cy_) - X(y0)) * cp
            ov = f.copy(); cv2.line(ov, (int(x), int(y - 60)), (int(x), int(y + 60)), (140, 220, 255), 3, cv2.LINE_AA); cv2.addWeighted(ov, .8 * aa, f, 1 - .8 * aa, 0, f)

@functools.lru_cache(None)
def roman_stone(w, h, seed=0, frame=True):
    """pale sandstone / limestone slab with grain, pits and a moulded border (RGB uint8)."""
    rng = np.random.default_rng(seed)
    n = fbm(h, w, seed + 40, 7, 4); fine = fbm(h, w, seed + 41, 3, 90)
    base = np.array([196, 184, 160], np.float32); dk = np.array([130, 118, 98], np.float32)
    g = np.clip(n * .7 + fine * .3, 0, 1)[..., None]
    img = base * (1 - g * .7) + dk * (g * .7)
    for _ in range(int(w * h / 900)):
        x, y = rng.integers(0, w), rng.integers(0, h)
        cv2.circle(img, (int(x), int(y)), int(rng.integers(1, 3)), tuple(float(v) for v in dk * .8), -1, cv2.LINE_AA)
    if frame:
        for k, (c1, c2) in enumerate((((236, 226, 204), (96, 86, 70)), ((230, 220, 198), (110, 98, 80)))):
            m = 26 + k * 22
            cv2.rectangle(img, (m, m), (w - m, h - m), c2, 6, cv2.LINE_AA)
            cv2.rectangle(img, (m + 4, m + 4), (w - m + 4, h - m + 4), c1, 3, cv2.LINE_AA)
    edge = np.ones((h, w), np.float32); cv2.rectangle(edge, (0, 0), (w - 1, h - 1), 0, 10)
    edge = cv2.GaussianBlur(edge, (0, 0), 8)[..., None]
    img = img * (.75 + .25 * edge)
    return np.clip(img, 0, 255).astype(np.uint8)

def chisel(f, lines, x, y, t, t0, dur=3.0, size=88, spacing=10, lh=1.25, a=1.0, red=False, chips=True):
    """Roman capitals cut into stone letter by letter: V-cut look = dark upper-left groove + light lower-right bevel,
    optional red paint in the letters (as many inscriptions originally had)."""
    if a <= 0 or t < t0: return
    total = sum(len(s) for s in lines); p = clamp((t - t0) / dur) * total
    done = 0
    for li, s in enumerate(lines):
        yy = y + (li - (len(lines) - 1) / 2) * size * lh
        k = int(clamp(p - done, 0, len(s))); done += len(s)
        full = text_sprite(s, "cinzel", size, "#000", 900, shadow=False, spacing=spacing)
        xl = x - full[0].shape[1] / 2
        if k <= 0: continue
        sh = s[:k]
        blit(f, text_sprite(sh, "cinzel", size, "#fbf4e2", 900, shadow=False, spacing=spacing), xl + 3, yy + 3, a * .85, anchor="l")
        blit(f, text_sprite(sh, "cinzel", size, "#3a2c1c" if not red else "#8e1e16", 900, shadow=False, spacing=spacing), xl, yy, a, anchor="l")
        if chips and k < len(s) and p - (done - len(s)) < len(s):
            cur = text_sprite(s[:k + 1], "cinzel", size, "#000", 900, shadow=False, spacing=spacing)[0].shape[1]
            cx_ = xl + cur - size * .45; fr = (p % 1)
            rng = np.random.default_rng(k + li * 31)
            for q in range(9):
                ang = rng.uniform(-2.8, -.3); sp = rng.uniform(60, 200)
                cv2.circle(f, (int(cx_ + math.cos(ang) * sp * fr), int(yy + math.sin(ang) * sp * fr + 220 * fr * fr)), int(rng.uniform(2, 5)), (226, 216, 194), -1, cv2.LINE_AA)

def deface(f, rect, t, t0, dur=1.6, seed=0, a=1.0):
    """chisel strokes hacking out a rectangle of an inscription (damnatio memoriae)."""
    if t < t0 or a <= 0: return
    x0, y0, x1, y1 = rect; p = clamp((t - t0) / dur)
    rng = np.random.default_rng(seed); n = 70
    for k in range(int(n * p)):
        cx_, cy_ = rng.uniform(x0, x1), rng.uniform(y0, y1); r = rng.uniform(14, 34)
        pts = np.array([[cx_ + r * math.cos(u) * rng.uniform(.6, 1.1), cy_ + r * .6 * math.sin(u) * rng.uniform(.6, 1.1)] for u in np.linspace(0, 6.28, 9)], np.float32)
        cv2.fillPoly(f, [(pts * 8).astype(np.int32)], (120, 108, 88), cv2.LINE_AA, 3)
        cv2.polylines(f, [(pts * 8).astype(np.int32)], True, (78, 68, 54), 2, cv2.LINE_AA, 3)
