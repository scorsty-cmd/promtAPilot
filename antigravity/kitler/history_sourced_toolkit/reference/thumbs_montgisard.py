import math, numpy as np, cv2
from engine import *
from art import *
import scenes as S

def finish(f, name):
    f = post(f, 0, .6)
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

# A: the leper king
f = S.desert_scene(4.0, "dusk")
S.dim(f, .15)
rim_glow(f, 520, 540, 470, (255, 170, 60), .9)
blit(f, portrait("baldwin", 860), 520, 560, 1.0)
blit(f, big("THE LEPER", 140), 1390, 300, 1.0)
blit(f, big("KING", 230, grad=("#ffe0c8", "#d23a1e")), 1390, 490, 1.0)
cv2.rectangle(f, (1180, 660), (1600, 790), (150, 24, 24), -1)
cv2.rectangle(f, (1180, 660), (1600, 790), (214, 170, 80), 5)
blit(f, text_sprite("AGE 16", "cinzel", 96, "#ffffff", 900, shadow=False), 1390, 725, 1.0)
finish(f, "thumb_A.jpg")

# B: 375 vs 26,000
f = S.desert_scene(2.0, "night")
S.dim(f, .25)
rim_glow(f, 400, 470, 330, (255, 190, 80), .45)
blit(f, big("375", 300), 400, 420, 1.0)
blit(f, text_sprite("KNIGHTS", "cinzel", 90, "#f4e4bc", 900, stroke=4, stroke_color="#120804", glow="#000000", spacing=10), 400, 630, 1.0)
blit(f, big("VS", 120, grad=("#ffffff", "#f0b040")), 790, 440, 1.0)
rim_glow(f, 1420, 470, 330, (60, 200, 90), .5)
blit(f, big("26,000", 215, grad=("#e8ffe0", "#2f9a50")), 1430, 420, 1.0)
blit(f, text_sprite("MEN?", "cinzel", 90, "#e8ffe0", 900, stroke=4, stroke_color="#120804", glow="#000000", spacing=8), 1430, 630, 1.0)
blit(f, portrait("baldwin", 300), 260, 880, 1.0)
blit(f, portrait("saladin", 300), W - 260, 880, 1.0)
finish(f, "thumb_B.jpg")

# C: face-off
f = S.desert_scene(1.0, "dusk")
S.dim(f, .2)
rim_glow(f, 430, 470, 380, (255, 60, 30), .8)
rim_glow(f, W - 430, 470, 380, (60, 220, 120), .6)
blit(f, portrait("baldwin", 720), 430, 480, 1.0)
blit(f, portrait("saladin", 720), W - 430, 480, 1.0)
blit(f, big("VS", 200, grad=("#ffffff", "#f0b040")), W / 2, 470, 1.0)
blit(f, big("SALADIN HUMILIATED", 104, spacing=3), W / 2, 950, 1.0)
finish(f, "thumb_C.jpg")
print("ok")
