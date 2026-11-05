import sys
from PIL import Image
fs=sys.argv[2:]; out=sys.argv[1]
ims=[Image.open(f"stills/s_{s}.png").resize((270,480)) for s in fs]
cols=min(7,len(ims)); rows=(len(ims)+cols-1)//cols
sheet=Image.new("RGB",(270*cols,480*rows))
for i,im in enumerate(ims): sheet.paste(im,((i%cols)*270,(i//cols)*480))
sheet.save(out,quality=85)
