"""Lost Ninth Legion thumbnails (1280x720): A eagle in fog + 5,000 VANISHED, B legionary face + GONE, C the list with a gap."""
import math, numpy as np, cv2
from engine import *
from art import *
import scenes as S
from fx import live_portrait, stamp, fog, aquila, formation, roman_stone, chisel

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

# A: the eagle in the fog
f = S.moor(1.0, .5); fog(f, 1.0, .5, seed=21)
glow(f, 520, 520, 420, (200, 150, 60), .55)
blit(f, aquila(760), 520, 560, 1.0)
fog(f, 2.0, .35, seed=22)
blit(f, big("5,000", 230, grad=("#ffffff", "#ffb0a0")), 1370, 330, 1.0)
blit(f, big("VANISHED", 150, grad=("#ffffff", "#c8d4e4")), 1370, 560, 1.0)
stamp(f, "UNSOLVED", 1400, 860, 9, 0, 90, rot=-8)
finish(f, "thumb_1_eagle.jpg")

# B: legionary face + GONE
f = S.moor(2.0, .2); fog(f, 3.0, .5, seed=7)
glow(f, 520, 540, 420, (170, 40, 30), .8)
live_portrait(f, "cerialis", 520, 540, 840, 1.0, bob=False, angry=True)
blit(f, big("GONE", 270, grad=("#ffffff", "#ffb0a0")), 1390, 380, 1.0)
cv2.rectangle(f, (1040, 560), (1740, 690), (150, 24, 24), -1); cv2.rectangle(f, (1040, 560), (1740, 690), (214, 170, 80), 5)
blit(f, text_sprite("THE NINTH LEGION", "cinzel", 64, "#ffffff", 900, shadow=False, spacing=3), 1390, 625, 1.0)
blit(f, text_sprite("5,000 ROMAN SOLDIERS", "cinzel", 56, "#f4e4bc", 800, stroke=3, glow="#000000", spacing=3), 1390, 790, 1.0)
finish(f, "thumb_2_face.jpg")

# C: the list with the missing Ninth
f = S.night_tint(S.parch_bg(1.0, True), .2)
img = S.column_list(); yo = 200 + S.GAP_I * 84 - 540
crop = img[yo:yo + 1080, :]
S.paste(f, crop, 520, 540, 1.0)
gy = 540
cv2.rectangle(f, (520 - 360, gy - 44), (520 + 360, gy + 44), (220, 40, 30), 8)
blit(f, big("VIIII ?", 80, grad=("#ffffff", "#ff8070")), 520, gy, 1.0)
blit(f, big("WHERE DID", 120, grad=("#ffffff", "#e0c080")), 1390, 340, 1.0)
blit(f, big("THEY GO?", 150, grad=("#ffffff", "#ff9a8a")), 1390, 510, 1.0)
blit(f, text_sprite("ROME'S LOST LEGION", "cinzel", 60, "#f4e4bc", 800, stroke=3, glow="#000000", spacing=3), 1390, 690, 1.0)
finish(f, "thumb_3_list.jpg")
print("ok")
