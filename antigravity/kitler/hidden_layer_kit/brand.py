import numpy as np, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
BG=(7,8,15); TXT=(244,246,251); MUTED=(138,144,166); A1=(53,240,208); A2=(139,108,255)
FD='/usr/share/fonts/opentype/inter/'
def F(n,s): return ImageFont.truetype(FD+n,s)
def glowbg(w,h,spots):
    y,x=np.mgrid[0:h,0:w].astype(np.float32); img=np.zeros((h,w,3),np.float32)+np.array(BG,np.float32)
    for cx,cy,r,c,k in spots: img+=np.exp(-(((x-cx)**2+(y-cy)**2)/(2*r*r)))[...,None]*np.array(c,np.float32)*k
    return Image.fromarray(np.clip(img,0,255).astype(np.uint8)).convert('RGBA')
def dots(im,step,col=(34,38,60),r=1.6):
    d=ImageDraw.Draw(im)
    for gx in range(0,im.width,step):
        for gy in range(0,im.height,step): d.ellipse([gx-r,gy-r,gx+r,gy+r],fill=col)
def layers(size, hi=1, n=3, glow=True):
    """isometric stacked planes; the `hi` layer is the highlighted hidden one"""
    S=size; im=Image.new('RGBA',(S,S),(0,0,0,0))
    cx=S/2; w=S*.42; h=S*.21; gap=S*.15; top=S/2-gap*(n-1)/2
    for i in reversed(range(n)):
        cy=top+i*gap
        pts=[(cx,cy-h),(cx+w,cy),(cx,cy+h),(cx-w,cy)]
        L=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(L)
        if i==hi:
            d.polygon(pts,fill=A1+(235,))
            if glow:
                g=L.filter(ImageFilter.GaussianBlur(S*.04)); im.alpha_composite(g)
        else:
            d.polygon(pts,fill=(30,35,62,235)); d.line(pts+[pts[0]],fill=A2+(255,),width=max(2,int(S*.012)),joint='curve')
        im.alpha_composite(L)
    return im
# ---------- profile picture 800x800 (content kept inside the centre circle)
P=800
im=glowbg(P,P,[(200,180,420,A2,.55),(640,680,380,A1,.28)])
im.alpha_composite(layers(560,hi=1),(120,110))
im.convert('RGB').save('HiddenLayer_profile_800.png')
# circle preview
m=Image.new('L',(P,P),0); ImageDraw.Draw(m).ellipse([0,0,P,P],fill=255)
pv=Image.new('RGBA',(P,P),(255,255,255,0)); pv.paste(im,(0,0),m); pv.save('preview_circle.png')
# ---------- banner 2560x1440, safe area 1546x423 centred (507..2053, 508..931)
W,H=2560,1440
b=glowbg(W,H,[(700,600,700,A2,.45),(1950,900,650,A1,.22),(1280,720,1100,(40,50,110),.3)])
dots(b,48)
# decorative layer stacks outside the safe text zone (visible on TV/desktop)
for x,y,s,a in [(-60,380,700,90),(1960,300,760,110)]:
    L=layers(s,hi=1); L.putalpha(L.getchannel('A').point(lambda v:int(v*a/255))); b.alpha_composite(L,(x,y))
d=ImageDraw.Draw(b)
# logo mark left inside safe area
b.alpha_composite(layers(330,hi=1),(560,555))
fT=F('InterDisplay-Black.otf',150)
d.text((920,640),'HIDDEN',font=fT,fill=TXT,anchor='ls')
wH=d.textlength('HIDDEN ',font=fT)
d.text((920+wH,640),'LAYER',font=fT,fill=A1,anchor='ls')
d.text((924,712),'The hidden rules that run your digital life',font=F('Inter-SemiBold.otf',52),fill=TXT,anchor='ls')
# series chips
x=924; y=760
for lab,col in [('THU  ·  THE ALGORITHM',A2),('FRI  ·  THE FINE PRINT',A1)]:
    f=F('Inter-SemiBold.otf',34); tw=d.textlength(lab,font=f); bw=int(tw+64)
    d.rounded_rectangle([x,y,x+bw,y+70],35,fill=col+(50,),outline=col+(230,),width=3)
    d.text((x+bw/2,y+35),lab,font=f,fill=TXT,anchor='mm'); x+=bw+24
print('text right edge', x, 'title end', 920+wH+d.textlength('LAYER',font=fT))
b.convert('RGB').save('HiddenLayer_banner_2560x1440.png')
# safe-area check overlay
c=b.copy(); dc=ImageDraw.Draw(c); dc.rectangle([507,508,2053,931],outline=(255,0,0,255),width=6)
c.convert('RGB').resize((1280,720)).save('preview_banner_safe.jpg',quality=85)
