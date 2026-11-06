import sys
from PIL import Image, ImageDraw
fs=sys.argv[2:]; out=sys.argv[1]
ims=[Image.open(f"stills/s_{s}.png").resize((480,270)) for s in fs]
cols=4; rows=(len(ims)+cols-1)//cols
sh=Image.new("RGB",(480*cols,270*rows))
for i,im in enumerate(ims):
    d=ImageDraw.Draw(im); d.rectangle([0,0,70,24],fill=(0,0,0)); d.text((4,4),fs[i],fill=(255,255,0))
    sh.paste(im,((i%cols)*480,(i//cols)*270))
sh.save(out,quality=82)
