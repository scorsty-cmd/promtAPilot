import math, numpy as np, cv2
from engine import *
from art import *
import scenes as S

def finish(f, name):
    f = post(f, 0, .6)
    # contrast/saturation punch
    hsv = cv2.cvtColor(f, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.18, 0, 255)
    f = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    f = cv2.convertScaleAbs(f, alpha=1.08, beta=-6)
    out = cv2.resize(f, (1280, 720), interpolation=cv2.INTER_AREA)
    cv2.imwrite(name, cv2.cvtColor(out, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])

def rim_glow(f, x, y, r, color, strength=.8):
    g = np.zeros_like(f); cv2.circle(g, (int(x), int(y)), int(r), color, -1, cv2.LINE_AA)
    g = cv2.GaussianBlur(g, (0, 0), r * .35)
    cv2.add(f, (g * strength).astype(np.uint8), f)

def big(s, size, grad=("#fff6d8", "#e0a640"), stroke=6, spacing=4, glow="#000000"):
    return text_sprite(s, "cinzel", size, "#f4e4bc", 900, stroke=stroke, stroke_color="#120804", gradient=grad, glow=glow, spacing=spacing)

# ---------- A: THE LAST VIKING ----------
f = S.sea_scene(3.0, "dusk", ships=[(1, 1180, 0, 300, 5), (2, 1500, 0, 520, 9), (0, 900, 0, 170, 2)])
f = S.sea_scene(3.0, "night", ("dusk", 1.0), ships=[(1, 1250, 0, 300, 5), (2, 1560, 0, 540, 9), (0, 960, 0, 180, 2)])
rim_glow(f, 520, 540, 470, (255, 90, 30), .9)
blit(f, portrait("harald", 860), 520, 560, 1.0)
blit(f, big("THE LAST", 150), 1390, 300, 1.0)
blit(f, big("VIKING", 210, grad=("#ffe0c8", "#d23a1e")), 1390, 480, 1.0)
# red badge 1066
cv2.rectangle(f, (1230, 640), (1550, 760), (150, 24, 24), -1)
cv2.rectangle(f, (1230, 640), (1550, 760), (214, 170, 80), 5)
blit(f, text_sprite("1066", "cinzel", 96, "#ffffff", 900, shadow=False), 1390, 700, 1.0)
finish(f, "thumb_A.jpg")

# ---------- B: 300 -> 24 ----------
f = S.sea_scene(5.0, "night")
S.dim(f, .25)
rim_glow(f, 480, 470, 330, (255, 190, 80), .45)
blit(f, big("300", 330), 470, 420, 1.0)
blit(f, text_sprite("SHIPS", "cinzel", 90, "#f4e4bc", 900, stroke=4, stroke_color="#120804", glow="#000000", spacing=12), 470, 640, 1.0)
arrow(f, bezier((800, 460), (975, 380), (1150, 460), 60), 1.0, (210, 40, 30), 34, head=80)
rim_glow(f, 1470, 470, 300, (255, 50, 30), .6)
blit(f, big("24", 380, grad=("#ffd8c8", "#c0261a")), 1470, 420, 1.0)
blit(f, text_sprite("CAME HOME", "cinzel", 90, "#ffd8c8", 900, stroke=4, stroke_color="#120804", glow="#000000", spacing=8), 1470, 640, 1.0)
blit(f, portrait("harald", 300, True), 1700, 880, 1.0)
finish(f, "thumb_B.jpg")

# ---------- C: face-off ----------
f = S.sky("dusk").copy()
cv2.fillPoly(f, [np.array([[0, 760], [500, 700], [1000, 740], [1500, 690], [W, 730], [W, H], [0, H]], np.int32)], (60, 30, 22), cv2.LINE_AA)
cv2.rectangle(f, (0, 880), (W, H), (40, 56, 66), -1)
cv2.rectangle(f, (560, 840), (1360, 880), (50, 30, 16), -1)
for x in range(590, 1360, 150): cv2.rectangle(f, (x, 880), (x + 26, 1000), (40, 24, 12), -1)
S.dim(f, .2)
rim_glow(f, 430, 470, 380, (255, 60, 30), .8)
rim_glow(f, W - 430, 470, 380, (60, 120, 255), .7)
blit(f, portrait("harald", 720), 430, 480, 1.0)
blit(f, portrait("harold", 720), W - 430, 480, 1.0)
blit(f, big("VS", 200, grad=("#ffffff", "#f0b040")), W / 2, 470, 1.0)
blit(f, big("7 FEET OF ENGLAND", 104, spacing=3), W / 2, 950, 1.0)
finish(f, "thumb_C.jpg")
print("ok")
