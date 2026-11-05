import math, numpy as np, cv2
from engine import *
from art import *
import scenes as S
from fx import fire_line, smoke, live_portrait

def finish(f, name):
    f = post(f, 0, .6)
    hsv = cv2.cvtColor(f, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.2, 0, 255)
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

def fire_bg(t, kind="dusk"):
    f = S.desert_scene(t, kind)
    fire_line(f, [(x, 960 + 12 * math.sin(x / 90)) for x in range(-60, W + 80, 110)], 1.3, 1.0, 5, 150)
    smoke(f, 2.0, .3, seed=3)
    return f

# A: the thirsty king
f = fire_bg(3.0, "dusk"); S.dim(f, .1)
rim_glow(f, 520, 480, 470, (255, 120, 40), .9)
live_portrait(f, "guy", 520, 470, 820, 1.0, angry=False, bob=False)
blit(f, big("NO", 210, grad=("#e8f6ff", "#4aa0e0")), 1400, 270, 1.0)
blit(f, big("WATER", 200, grad=("#e8f6ff", "#4aa0e0")), 1400, 470, 1.0)
cv2.rectangle(f, (1150, 610), (1650, 740), (150, 24, 24), -1); cv2.rectangle(f, (1150, 610), (1650, 740), (214, 170, 80), 5)
blit(f, text_sprite("HATTIN 1187", "cinzel", 70, "#ffffff", 900, shadow=False), 1400, 675, 1.0)
S.water_icon(f, 1700, 300, 1.0, 3.0, (200, 50, 40))
finish(f, "thumb_A.jpg")

# B: 20,000 men vs thirst
f = fire_bg(1.0, "night"); S.dim(f, .2)
rim_glow(f, 520, 430, 360, (255, 80, 40), .7)
blit(f, big("20,000", 190, grad=("#ffe0c8", "#c0392b")), 470, 390, 1.0)
blit(f, text_sprite("MEN", "cinzel", 100, "#f4e4bc", 900, stroke=4, stroke_color="#120804", glow="#000000", spacing=12), 520, 590, 1.0)
blit(f, big("VS", 130, grad=("#ffffff", "#f0b040")), 1010, 470, 1.0)
rim_glow(f, 1450, 430, 330, (60, 150, 255), .6)
S.water_icon(f, 1450, 360, 1.0, 5.0, (60, 140, 220))
blit(f, big("THIRST", 150, grad=("#e8f6ff", "#4aa0e0")), 1450, 640, 1.0)
blit(f, portrait("saladin", 280), W - 200, 880, 1.0)
finish(f, "thumb_B.jpg")

# C: face-off, kingdom lost
f = fire_bg(2.0, "dusk"); S.dim(f, .25)
rim_glow(f, 430, 470, 380, (60, 90, 255), .6)
rim_glow(f, W - 430, 470, 380, (60, 220, 120), .6)
live_portrait(f, "guy", 430, 460, 680, 1.0, bob=False)
live_portrait(f, "saladin", W - 430, 460, 680, 1.0, angry=True, bob=False)
blit(f, big("VS", 200, grad=("#ffffff", "#f0b040")), W / 2, 450, 1.0)
blit(f, big("KINGDOM LOST", 130, grad=("#ffe0c8", "#c0392b"), spacing=4), W / 2, 930, 1.0)
finish(f, "thumb_C.jpg")
print("ok")
