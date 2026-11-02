import sys,glob
from PIL import Image, ImageDraw
files=sorted(glob.glob(sys.argv[1]+'/*.png')); out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 3
W,H=640,360; rows=(len(files)+cols-1)//cols
sh=Image.new('RGB',(W*cols,H*rows),'black'); d=ImageDraw.Draw(sh)
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((W,H)); sh.paste(im,((i%cols)*W,(i//cols)*H))
    d.text(((i%cols)*W+8,(i//cols)*H+6),f.split('_')[-1][:-4],fill='yellow')
sh.save(out,quality=85); print(out, len(files))
