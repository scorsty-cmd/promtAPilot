"""Core drawing utilities: textures, text sprites, blitting, easing, camera, maps."""
import json, math, functools
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 24
GEO = "geo/"

# ---------------- easing ----------------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def smooth(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def back_out(x):
    x = clamp(x); c1 = 1.70158; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def prog(t, t0, d=0.6, f=ease_out): return f((t - t0) / d) if d > 0 else float(t >= t0)
def lerp(a, b, x): return a + (b - a) * x
def lerp2(p, q, x): return (lerp(p[0], q[0], x), lerp(p[1], q[1], x))
def window(t, t0, t1, fin=.5, fout=.5):
    """1 inside [t0,t1] with fades."""
    if t < t0 or t > t1 + fout: return 0.0
    a = smooth((t - t0) / fin) if fin > 0 else 1
    b = 1 - smooth((t - t1) / fout) if t > t1 else 1
    return a * b

def hexc(h):
    h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

# ---------------- noise / textures ----------------
def fbm(h, w, seed=0, octaves=6, base=4):
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        s = base * 2 ** o
        small = rng.random((max(2, int(s * h / w)) + 1, s + 1)).astype(np.float32)
        out += cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC) * amp
        tot += amp; amp *= .55
    out /= tot
    return (out - out.min()) / (out.max() - out.min() + 1e-6)

@functools.lru_cache(None)
def parchment(w=W, h=H, seed=1, dark=0.0):
    n = fbm(h, w, seed, 7, 3)
    fib = fbm(h, w, seed + 9, 3, 60)
    base = np.array(hexc("#e6d3a8"), np.float32)
    shade = np.array(hexc("#b8956a"), np.float32)
    t = (n * .75 + fib * .25)[..., None]
    img = base * (1 - t * .55) + shade * (t * .55)
    # stains
    st = fbm(h, w, seed + 3, 4, 2)
    img *= (1 - np.clip(st - .62, 0, 1)[..., None] * .6)
    # edge burn
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.minimum.reduce([xx, yy, w - xx, h - yy]) / (min(w, h) * .18)
    burn = np.clip(d + (n - .5) * .5, 0, 1)[..., None]
    img = img * (0.55 + 0.45 * burn)
    img *= (1 - dark)
    return np.clip(img, 0, 255).astype(np.uint8)

@functools.lru_cache(None)
def vignette(strength=.55):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 1.414
    v = 1 - strength * np.clip(r, 0, 1) ** 2.2
    return np.dstack([v] * 3).astype(np.float32)

GRAIN = None
def grain(i):
    global GRAIN
    if GRAIN is None:
        rng = np.random.default_rng(3)
        GRAIN = [cv2.GaussianBlur(rng.normal(0, 3.5, (H, W)).astype(np.float32), (0, 0), .7) for _ in range(1)]
        GRAIN = [np.dstack([g] * 3) for g in GRAIN]
    return GRAIN[i % len(GRAIN)]

def post(frame, i, vig=.55):
    f = frame.astype(np.float32)
    f *= vignette(vig)
    f += grain(i)
    return np.clip(f, 0, 255).astype(np.uint8)

# ---------------- fonts & text sprites ----------------
@functools.lru_cache(None)
def font(name, size, wght=None):
    path = {"cinzel": GEO + "Cinzel.ttf", "garamond": GEO + "EBGaramond.ttf",
            "sans": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"}[name]
    f = ImageFont.truetype(path, size)
    if wght and name != "sans":
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f

@functools.lru_cache(maxsize=600)   # v6: was 2048 -> OOM (5 GB) with per-frame counter texts
def text_sprite(text, name="cinzel", size=60, color="#f4e4bc", wght=700, stroke=0, stroke_color="#1a1008",
                shadow=True, spacing=0, glow=None, gradient=None):
    f = font(name, size, wght)
    # letter-spaced layout
    widths = [f.getlength(c) for c in text]
    tw = int(sum(widths) + spacing * max(0, len(text) - 1))
    asc, desc = f.getmetrics()
    pad = int(size * .6) + stroke * 2
    w, h = tw + pad * 2, asc + desc + pad * 2
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x = pad
    for c, cw in zip(text, widths):
        d.text((x, pad), c, font=f, fill=color, stroke_width=stroke, stroke_fill=stroke_color)
        x += cw + spacing
    if gradient:
        a = np.array(layer)
        g0, g1 = np.array(hexc(gradient[0])), np.array(hexc(gradient[1]))
        yy = np.linspace(0, 1, h)[:, None, None]
        grad = g0 * (1 - yy) + g1 * yy
        mask = a[..., 3:4] > 0
        body = np.all(a[..., :3] == np.array(hexc(color)), axis=-1)[..., None] if stroke else mask
        a[..., :3] = np.where(body & mask, grad, a[..., :3]).astype(np.uint8)
        layer = Image.fromarray(a)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    if glow:
        gl = Image.new("RGBA", (w, h), hexc(glow) + (0,))
        gl.putalpha(layer.split()[3].filter(ImageFilter.GaussianBlur(size * .25)))
        out = Image.alpha_composite(out, gl); out = Image.alpha_composite(out, gl)
    if shadow:
        sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        sh.putalpha(layer.split()[3].point(lambda v: int(v * .65)).filter(ImageFilter.GaussianBlur(max(2, size * .06))))
        sh = sh.transform(sh.size, Image.AFFINE, (1, 0, -size * .04, 0, 1, -size * .06))
        out = Image.alpha_composite(out, sh)
    out = Image.alpha_composite(out, layer)
    return premult(np.array(out))

def premult(rgba):
    a = rgba[..., 3:4].astype(np.float32) / 255
    return (rgba[..., :3].astype(np.float32) * a, a)

def pil_sprite(img):
    return premult(np.array(img.convert("RGBA")))

@functools.lru_cache(maxsize=512)
def _scaled(key, sid, s):
    rgb, a = SPR_REG[sid]
    w, h = max(1, int(rgb.shape[1] * s)), max(1, int(rgb.shape[0] * s))
    interp = cv2.INTER_AREA if s < 1 else cv2.INTER_LINEAR
    r2 = cv2.resize(rgb, (w, h), interpolation=interp)
    a2 = cv2.resize(a, (w, h), interpolation=interp)
    return r2, a2[..., None] if a2.ndim == 2 else a2
SPR_REG = {}

def blit(dst, spr, x, y, alpha=1.0, scale=1.0, anchor="c", rot=0.0):
    """Composite premultiplied sprite onto uint8 frame. (x,y) is anchor position."""
    if alpha <= 0.003 or scale <= 0.01: return
    rgb, a = spr
    if scale != 1.0 or rot:
        if len(SPR_REG) > 400:   # v4: transient sprites (per-frame cards) leaked memory -> OOM kills of render workers
            SPR_REG.clear(); _scaled.cache_clear()
        q = round(scale, 3)
        if rgb.size > 400_000:   # v6: big transient sprites (stones, cards, crops) are NOT cached -> was 5 GB OOM
            w_, h_ = max(1, int(rgb.shape[1] * q)), max(1, int(rgb.shape[0] * q))
            ip = cv2.INTER_AREA if q < 1 else cv2.INTER_LINEAR
            r2 = cv2.resize(rgb, (w_, h_), interpolation=ip); a2 = cv2.resize(a, (w_, h_), interpolation=ip)
            rgb, a = r2, (a2[..., None] if a2.ndim == 2 else a2)
        else:
            sid = id(rgb); SPR_REG[sid] = spr
            rgb, a = _scaled(None, sid, q)
        if rot:
            h, w = rgb.shape[:2]
            M = cv2.getRotationMatrix2D((w / 2, h / 2), rot, 1)
            rgb = cv2.warpAffine(rgb, M, (w, h)); a = cv2.warpAffine(a, M, (w, h))[..., None]
    h, w = rgb.shape[:2]
    if anchor == "c": x0, y0 = int(x - w / 2), int(y - h / 2)
    elif anchor == "l": x0, y0 = int(x), int(y - h / 2)
    elif anchor == "r": x0, y0 = int(x - w), int(y - h / 2)
    elif anchor == "tl": x0, y0 = int(x), int(y)
    elif anchor == "b": x0, y0 = int(x - w / 2), int(y - h)
    else: x0, y0 = int(x), int(y)
    X0, Y0 = max(0, x0), max(0, y0)
    X1, Y1 = min(dst.shape[1], x0 + w), min(dst.shape[0], y0 + h)
    if X1 <= X0 or Y1 <= Y0: return
    sr = rgb[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
    sa = a[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
    roi = dst[Y0:Y1, X0:X1].astype(np.float32)
    out = roi * (1 - sa * alpha) + sr * alpha
    dst[Y0:Y1, X0:X1] = np.clip(out, 0, 255).astype(np.uint8)

def text(dst, s, x, y, size=60, alpha=1, scale=1, anchor="c", **kw):
    spr = text_sprite(s, size=size, **kw)
    blit(dst, spr, x, y, alpha, scale, anchor)
    return spr[0].shape[1]

def fill_alpha(dst, color, alpha, rect=None):
    x0, y0, x1, y1 = rect or (0, 0, dst.shape[1], dst.shape[0])
    roi = dst[y0:y1, x0:x1]
    cv2.addWeighted(roi, 1 - alpha, np.full_like(roi, color), alpha, 0, roi)

# ---------------- drawing helpers ----------------
def bezier(p0, p1, p2, n=80, p3=None):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2 = map(np.array, (p0, p1, p2))
    if p3 is None:
        return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2
    p3 = np.array(p3)
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3

def polyline_len(pts):
    d = np.sqrt(((pts[1:] - pts[:-1]) ** 2).sum(1)); return np.concatenate([[0], np.cumsum(d)])

def partial(pts, x):
    """first fraction x of a polyline, by length."""
    if x <= 0: return pts[:1]
    L = polyline_len(pts); tgt = L[-1] * clamp(x)
    i = int(np.searchsorted(L, tgt))
    if i >= len(pts): return pts
    if i == 0: return pts[:1]
    f = (tgt - L[i - 1]) / max(1e-6, L[i] - L[i - 1])
    end = pts[i - 1] + (pts[i] - pts[i - 1]) * f
    return np.vstack([pts[:i], end])

def arrow(dst, pts, x, color, width=14, outline=(25, 15, 8), head=34, dashed=False):
    """Animated thick arrow along polyline pts (screen coords), drawn to fraction x."""
    if x <= 0.001: return
    p = partial(np.asarray(pts, np.float32), x)
    if len(p) < 2: return
    ip = (p * 16).astype(np.int32)
    if dashed:
        L = polyline_len(p); seg = 34
        for k in range(len(p) - 1):
            if int(L[k] / seg) % 2 == 0:
                cv2.line(dst, tuple(ip[k]), tuple(ip[k + 1]), outline, width + 6, cv2.LINE_AA, 4)
        for k in range(len(p) - 1):
            if int(L[k] / seg) % 2 == 0:
                cv2.line(dst, tuple(ip[k]), tuple(ip[k + 1]), color, width, cv2.LINE_AA, 4)
    else:
        cv2.polylines(dst, [ip[:-1] if len(ip) > 2 else ip], False, outline, width + 6, cv2.LINE_AA, 4)
        cv2.polylines(dst, [ip[:-1] if len(ip) > 2 else ip], False, color, width, cv2.LINE_AA, 4)
    # head
    tip = p[-1]; back = p[max(0, len(p) - 6)]
    d = tip - back; n = np.linalg.norm(d)
    if n < 1e-3: return
    d /= n; nrm = np.array([-d[1], d[0]])
    tipx = tip + d * head * .45
    tri = np.array([tipx, tip - d * head * .6 + nrm * head * .55, tip - d * head * .6 - nrm * head * .55])
    cv2.fillPoly(dst, [(tri * 16).astype(np.int32)], outline, cv2.LINE_AA, 4)
    tri2 = np.array([tipx - d * 5, tip - d * head * .5 + nrm * head * .4, tip - d * head * .5 - nrm * head * .4])
    cv2.fillPoly(dst, [(tri2 * 16).astype(np.int32)], color, cv2.LINE_AA, 4)

def marker(dst, x, y, t0, t, color=(160, 30, 30), r=14, pulse=True):
    p = prog(t, t0, .4, back_out)
    if p <= 0: return
    if pulse:
        ph = ((t - t0) % 1.6) / 1.6
        rr = int(r * (1 + ph * 2.2))
        ov = dst.copy()
        cv2.circle(ov, (int(x), int(y)), rr, color, 3, cv2.LINE_AA)
        cv2.addWeighted(ov, (1 - ph) * .8, dst, 1 - (1 - ph) * .8, 0, dst)
    cv2.circle(dst, (int(x), int(y)), int(r * p + 4), (30, 18, 10), -1, cv2.LINE_AA)
    cv2.circle(dst, (int(x), int(y)), int(r * p), color, -1, cv2.LINE_AA)
    cv2.circle(dst, (int(x - r * .3), int(y - r * .3)), max(1, int(r * .3 * p)), (255, 230, 200), -1, cv2.LINE_AA)

def embers(dst, t, n=60, seed=0, color=(255, 170, 70), area=(0, 0, W, H), speed=40, size=3):
    rng = np.random.default_rng(seed)
    x0, y0, x1, y1 = area
    bx = rng.uniform(x0, x1, n); by = rng.uniform(y0, y1, n)
    vy = rng.uniform(.5, 1.5, n) * speed; ph = rng.uniform(0, 6.28, n); sz = rng.uniform(.5, 1.0, n) * size
    br = rng.uniform(.35, 1, n)
    ys = y1 - ((y1 - by + vy * t) % (y1 - y0))
    xs = bx + np.sin(t * .8 + ph) * 25
    for i in range(n):
        fl = .6 + .4 * math.sin(t * 5 + ph[i] * 3)
        c = tuple(int(cc * br[i] * fl) for cc in color)
        cv2.circle(dst, (int(xs[i] * 4), int(ys[i] * 4)), int(sz[i] * 4), c, -1, cv2.LINE_AA, 2)

def dust(dst, t, n=40, seed=2, color=(255, 240, 210)):
    rng = np.random.default_rng(seed)
    bx = rng.uniform(0, W, n); by = rng.uniform(0, H, n); vx = rng.uniform(4, 14, n); ph = rng.uniform(0, 6.3, n)
    ov = dst.copy()
    for i in range(n):
        x = (bx[i] + vx[i] * t) % W; y = by[i] + math.sin(t * .5 + ph[i]) * 20
        cv2.circle(ov, (int(x), int(y)), int(1 + 2 * (i % 3)), color, -1, cv2.LINE_AA)
    cv2.addWeighted(ov, .35, dst, .65, 0, dst)

# ---------------- camera ----------------
class Cam:
    def __init__(self, cx, cy, z): self.cx, self.cy, self.z = cx, cy, z
    def M(self): return np.float32([[self.z, 0, W / 2 - self.cx * self.z], [0, self.z, H / 2 - self.cy * self.z]])
    def pt(self, p): return (W / 2 + (p[0] - self.cx) * self.z, H / 2 + (p[1] - self.cy) * self.z)
    def pts(self, ps):
        ps = np.asarray(ps, np.float32); return np.stack([W / 2 + (ps[:, 0] - self.cx) * self.z, H / 2 + (ps[:, 1] - self.cy) * self.z], 1)
    def render(self, big):
        BH_, BW_ = big.shape[:2]
        hw, hh = W / 2 / self.z, H / 2 / self.z
        if hw * 2 >= BW_: self.cx = BW_ / 2
        else: self.cx = min(max(self.cx, hw), BW_ - hw)
        if hh * 2 >= BH_: self.cy = BH_ / 2
        else: self.cy = min(max(self.cy, hh), BH_ - hh)
        return cv2.warpAffine(big, self.M(), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def cam_lerp(a, b, x):
    # zoom interpolated geometrically
    z = math.exp(lerp(math.log(a[2]), math.log(b[2]), x))
    return Cam(lerp(a[0], b[0], x), lerp(a[1], b[1], x), z)

def cam_path(t, keys):
    """keys: list of (time, (cx,cy,z)). eased interpolation between keys."""
    if t <= keys[0][0]: return Cam(*keys[0][1])
    for (t0, a), (t1, b) in zip(keys, keys[1:]):
        if t <= t1: return cam_lerp(a, b, ease_io((t - t0) / max(1e-6, t1 - t0)))
    return Cam(*keys[-1][1])

# ---------------- maps ----------------
_LAND = {}
def land_polys(res):
    if res not in _LAND:
        g = json.load(open(GEO + ("land10.geojson" if res == "10m" else "land.geojson")))
        polys = []
        for f in g["features"]:
            geom = f["geometry"]
            cs = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
            for poly in cs:
                polys.append(np.array(poly[0], np.float64))
        _LAND[res] = polys
    return _LAND[res]

_WATER = {}
def water_features(res):
    """lakes (polygons) + rivers (polylines) from Natural Earth, if present in geo/."""
    if res not in _WATER:
        import os
        suf = "10" if res == "10m" else ""
        lakes, rivers = [], []
        lp, rp = GEO + f"lakes{suf}.geojson", GEO + f"rivers{suf}.geojson"
        if os.path.exists(lp):
            for f in json.load(open(lp))["features"]:
                g = f["geometry"]; cs = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
                for poly in cs: lakes.append(np.array(poly[0], np.float64))
        if os.path.exists(rp):
            for f in json.load(open(rp))["features"]:
                g = f["geometry"]; sr = f["properties"].get("scalerank", 5) or 5
                cs = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
                for ln in cs: rivers.append((np.array(ln, np.float64), sr))
        _WATER[res] = (lakes, rivers)
    return _WATER[res]

class GeoMap:
    """Rendered parchment-style map of a lon/lat window. self.img is BW x BH.
    water=True draws Natural Earth lakes + rivers; relief=True adds procedural hill-shading on land."""
    def __init__(self, lonc, latc, width_deg, BW=3840, BH=2160, res="50m", labels=(), seed=5, sea="#31454c", water=True, relief=True, river_max_rank=9):
        self.lonc, self.latc = lonc, latc
        self.coslat = math.cos(math.radians(latc))
        self.k = BW / (width_deg * self.coslat)
        self.BW, self.BH = BW, BH
        lon_half = width_deg / 2; lat_half = BH / self.k / 2
        mask = Image.new("L", (BW, BH), 0); md = ImageDraw.Draw(mask)
        coast = []
        for p in land_polys(res):
            if p[:, 0].max() < lonc - lon_half - 2 or p[:, 0].min() > lonc + lon_half + 2: continue
            if p[:, 1].max() < latc - lat_half - 2 or p[:, 1].min() > latc + lat_half + 2: continue
            xy = self.proj_arr(p)
            md.polygon([tuple(q) for q in xy], fill=255)
            coast.append(xy)
        m = np.array(mask).astype(np.float32) / 255
        # sea
        seac = np.array(hexc(sea), np.float32)
        n = fbm(BH, BW, seed, 6, 3)[..., None]
        img = seac * (0.82 + 0.3 * n)
        # wave hatch lines
        hatch = np.zeros((BH, BW), np.uint8)
        for yy in range(0, BH, 26):
            xs = np.arange(0, BW, 8); ys = yy + 3 * np.sin(xs / 37.0 + yy)
            cv2.polylines(hatch, [np.stack([xs, ys], 1).astype(np.int32)], False, 255, 1, cv2.LINE_AA)
        hatch = hatch.astype(np.float32)[..., None] / 255
        img = img * (1 - hatch * .10) + 255 * hatch * .03
        # shallow halo
        halo = cv2.GaussianBlur(m, (0, 0), 28)[..., None]
        img = img * (1 - halo * .35) + np.array(hexc("#6f8d8a"), np.float32) * halo * .35
        # land
        par = parchment(BW, BH, seed + 2).astype(np.float32)
        inner = cv2.GaussianBlur(1 - m, (0, 0), 14)[..., None]  # darken near coast
        landc = par * (1 - inner * .35)
        hill = fbm(BH, BW, seed + 7, 5, 6)[..., None]
        landc = landc * (0.9 + .18 * hill)
        M3 = m[..., None]
        img = img * (1 - M3) + landc * M3
        img = np.clip(img, 0, 255).astype(np.uint8)
        # grid
        step = 5 if width_deg > 30 else (2 if width_deg > 12 else 1)
        for lon in range(int(lonc - lon_half) // step * step - step, int(lonc + lon_half) + 2, step):
            x = int(self.proj((lon, latc))[0]); cv2.line(img, (x, 0), (x, BH), (190, 170, 130), 1, cv2.LINE_AA)
        for lat in range(int(latc - lat_half) // step * step - step, int(latc + lat_half) + 2, step):
            y = int(self.proj((lonc, lat))[1]); cv2.line(img, (0, y), (BW, y), (190, 170, 130), 1, cv2.LINE_AA)
        if relief:
            hgt = fbm(BH, BW, seed + 13, 7, 4) ** 1.5
            gy_, gx_ = np.gradient(cv2.GaussianBlur(hgt, (0, 0), 6))
            g = (-gx_ - gy_) * BW
            g = g / (np.percentile(np.abs(g), 98) + 1e-6)
            shade = np.clip(1 + g * .12, .86, 1.12)[..., None]
            img = np.clip(img.astype(np.float32) * (1 - M3 + M3 * shade), 0, 255).astype(np.uint8)
        if water:
            lakes, rivers = water_features(res)
            wbox = lambda p: not (p[:, 0].max() < lonc - lon_half - 1 or p[:, 0].min() > lonc + lon_half + 1 or p[:, 1].max() < latc - lat_half - 1 or p[:, 1].min() > latc + lat_half + 1)
            rc, rc2 = (70, 98, 106), (110, 146, 150)
            wpx = max(2, int(BW / 1100))
            for ln, sr in rivers:
                if sr > river_max_rank or not wbox(ln): continue
                xy = (self.proj_arr(ln) * 8).astype(np.int32)
                wdt = max(2, int(wpx * (1.6 if sr <= 3 else 1.0)))
                cv2.polylines(img, [xy], False, rc, wdt + 2, cv2.LINE_AA, 3)
                cv2.polylines(img, [xy], False, rc2, max(1, wdt - 1), cv2.LINE_AA, 3)
            seac2 = tuple(int(v) for v in np.array(hexc(sea)) * 1.15)
            for p in lakes:
                if not wbox(p): continue
                xy = (self.proj_arr(p) * 8).astype(np.int32)
                cv2.fillPoly(img, [xy], seac2, cv2.LINE_AA, 3)
                cv2.polylines(img, [xy], True, (58, 40, 24), 3, cv2.LINE_AA, 3)
        for xy in coast:
            cv2.polylines(img, [(xy * 8).astype(np.int32)], True, (58, 40, 24), 4, cv2.LINE_AA, 3)
        self.img = img
        for lab in labels: self.label(*lab)

    def proj(self, ll):
        lon, lat = ll
        return ((lon - self.lonc) * self.coslat * self.k + self.BW / 2, (self.latc - lat) * self.k + self.BH / 2)
    def proj_arr(self, p):
        return np.stack([(p[:, 0] - self.lonc) * self.coslat * self.k + self.BW / 2,
                         (self.latc - p[:, 1]) * self.k + self.BH / 2], 1)
    def label(self, s, lon, lat, size=56, color="#3a2614", italic=False, spacing=6, sea=False):
        spr = text_sprite(s, name="garamond" if sea else "cinzel", size=size, color=("#cfe0dc" if sea else color),
                          wght=600 if sea else 700, shadow=False, spacing=spacing)
        x, y = self.proj((lon, lat)); blit(self.img, spr, x, y, .85 if sea else .9)

# ---------------- v6 (29 Oct 2026): on-disk cache shared by render workers [backlog #19]
def disk_cached(fn):
    """lru + pickle cache in ./cache/ for expensive pure builders (e.g. 10m GeoMaps): the first worker builds,
    the others load in ~1 s instead of rebuilding (~200 s per worker before). Delete ./cache after editing a builder."""
    import os, pickle
    @functools.lru_cache(None)
    def g(*a):
        os.makedirs("cache", exist_ok=True)
        p = f"cache/{fn.__name__}_{'_'.join(str(v) for v in a)}.pkl"
        if os.path.exists(p):
            try:
                with open(p, "rb") as fh: return pickle.load(fh)
            except Exception: pass
        r = fn(*a)
        tmp = p + f".{os.getpid()}.tmp"
        with open(tmp, "wb") as fh: pickle.dump(r, fh, protocol=4)
        os.replace(tmp, p)
        return r
    g.__name__ = fn.__name__
    return g
