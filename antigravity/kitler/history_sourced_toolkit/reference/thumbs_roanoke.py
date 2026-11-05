"""Roanoke thumbnails (1280x720): A carved word + 115 VANISHED, B face + GONE, C evidence board."""
import math, numpy as np, cv2
from engine import *
from art import *
import scenes as S
from fx import live_portrait, stamp, fog, carve, _bark, evidence_card

def finish(f, name):
    f = post(f, 0, .5)
    hsv = cv2.cvtColor(f, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.15, 0, 255)
    f = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    f = cv2.convertScaleAbs(f, alpha=1.1, beta=-4)
    out = cv2.resize(f, (1280, 720), interpolation=cv2.INTER_AREA)
    cv2.imwrite(name, cv2.cvtColor(out, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])

def big(s, size, grad=("#ffffff", "#c8d4e4"), stroke=7, spacing=4, glow="#000000"):
    return text_sprite(s, "cinzel", size, "#f4e4bc", 900, stroke=stroke, stroke_color="#0a0604", gradient=grad, glow=glow, spacing=spacing)

def glow(f, x, y, r, color, k=.8):
    g = np.zeros_like(f); cv2.circle(g, (int(x), int(y)), int(r), color, -1, cv2.LINE_AA)
    g = cv2.GaussianBlur(g, (0, 0), r * .4); cv2.add(f, (g * k).astype(np.uint8), f)

# A: the carved word
f = S.coast_scene(3.0, "night", pan=1.0); fog(f, 2.0, .45, seed=6)
glow(f, W / 2, 560, 520, (120, 90, 50), .6)
pw, ph = 1560, 360; x0, y0 = (W - pw) // 2, 420
f[y0:y0 + ph, x0:x0 + pw] = _bark(pw, ph, 13, True)
cv2.rectangle(f, (x0, y0), (x0 + pw, y0 + ph), (30, 18, 8), 8)
carve(f, "CROATOAN", W / 2, y0 + ph / 2, 99, 0, 1, 200, seed=5, spacing=14)
blit(f, big("115 VANISHED", 150, grad=("#ffffff", "#ff9a8a")), W / 2, 230, 1.0)
stamp(f, "UNSOLVED", W - 500, 920, 9, 0, 100, rot=-8)
finish(f, "thumb_1_carved.jpg")

# B: the governor's face + GONE
f = S.coast_scene(4.0, "night", pan=.3); fog(f, 3.0, .5, seed=7)
glow(f, 520, 520, 420, (60, 90, 170), .8)
live_portrait(f, "white", 520, 520, 820, 1.0, bob=False)
blit(f, big("GONE", 260, grad=("#ffffff", "#9fb4d4")), 1390, 400, 1.0)
cv2.rectangle(f, (1050, 560), (1730, 690), (150, 24, 24), -1); cv2.rectangle(f, (1050, 560), (1730, 690), (214, 170, 80), 5)
blit(f, text_sprite("ROANOKE 1590", "cinzel", 72, "#ffffff", 900, shadow=False, spacing=4), 1390, 625, 1.0)
blit(f, text_sprite("NO BODIES · NO GRAVES", "cinzel", 54, "#f4e4bc", 800, stroke=3, glow="#000000", spacing=4), 1390, 780, 1.0)
finish(f, "thumb_2_face.jpg")

# C: evidence board
f = S.board_bg(1.0); glow(f, W / 2, H / 2, 600, (110, 70, 30), .5)
f[160:160 + 760, 120:120 + 640] = cv2.resize(_bark(320, 380, 8, False), (640, 760))
f[380:380 + 320, 200:200 + 480] = _bark(480, 320, 9, True)
carve(f, "CRO", 440, 540, 99, 0, 1, 170, seed=4)
blit(f, big("WHERE DID", 120, grad=("#ffffff", "#e0c080")), 1340, 330, 1.0)
blit(f, big("115 PEOPLE GO?", 110, grad=("#ffffff", "#ff9a8a")), 1340, 490, 1.0)
blit(f, S.ico("question", 220), 1340, 760, 1.0)
blit(f, text_sprite("?", "cinzel", 200, "#ffffff", 900, stroke=4, glow="#000000"), 1340, 750, 1.0)
finish(f, "thumb_3_board.jpg")
print("ok")
