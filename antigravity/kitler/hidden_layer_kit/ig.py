exec(open('brand.py').read().split('# ---------- profile picture')[0])
import os; os.makedirs('ig', exist_ok=True)
A3=(255,77,109)
def fit(d,s,kind,size,mw):
    f=F(kind,size)
    while d.textlength(s,font=f)>mw and size>20: size-=4; f=F(kind,size)
    return f
def post(name, eyebrow, eyecol, lines, accent_i, sub, art):
    W,H=1080,1350
    im=glowbg(W,H,[(150,200,520,A2,.5),(950,1200,520,A1,.25)]); dots(im,44)
    d=ImageDraw.Draw(im)
    # keep key content inside the 3:4 grid crop (y 45..1305)
    fe=F('Inter-SemiBold.otf',36); tw=d.textlength(eyebrow,font=fe)
    d.rounded_rectangle([90,150,90+tw+60,214],32,fill=eyecol+(50,),outline=eyecol+(230,),width=3)
    d.text((120,182),eyebrow,font=fe,fill=TXT,anchor='lm')
    y=270
    for i,l in enumerate(lines):
        f=fit(d,l,'InterDisplay-Black.otf',118,900)
        d.text((90,y),l,font=f,fill=(A1 if i==accent_i else TXT)); y+=int(f.size*1.05)
    y+=24
    fs=F('Inter-Medium.otf',42)
    for l in sub: d.text((92,y),l,font=fs,fill=MUTED); y+=58
    art(im, d, y)
    d.text((90,1240),'HIDDEN LAYER',font=F('InterDisplay-Black.otf',34),fill=TXT)
    d.text((990,1240),'Thu · Fri',font=F('Inter-Medium.otf',30),fill=MUTED,anchor='ra')
    im.convert('RGB').save(f'ig/{name}.jpg',quality=93)
def art_layers(im,d,y):
    im.alpha_composite(layers(520,hi=1),(500,max(y,700)))
def art_price(im,d,y):
    y=max(y+20,760)
    for i,(lab,p,col) in enumerate([('YOU',  '$18.40',A1),('FRIEND','$12.90',A2)]):
        x=90+i*470
        d.rounded_rectangle([x,y,x+430,y+300],34,fill=(22,26,44,235),outline=col+(220,),width=4)
        d.text((x+40,y+50),lab,font=F('Inter-SemiBold.otf',34),fill=MUTED)
        d.text((x+40,y+110),p,font=F('InterDisplay-Black.otf',110),fill=col)
    d.text((90,y+330),'Same ride. Same minute. Example prices.',font=F('Inter-Medium.otf',30),fill=MUTED)
def art_clause(im,d,y):
    y=max(y+20,740)
    d.rounded_rectangle([90,y,990,y+400],34,fill=(22,26,44,235),outline=(255,255,255,40),width=2)
    for k in range(7):
        w=[760,700,800,420,780,690,520][k]; yy=y+50+k*48
        col=(255,196,61,255) if k in (3,4) else (90,96,125,255)
        if k in (3,4): d.rectangle([126,yy-8,130+w,yy+26],fill=(255,196,61,60))
        d.rounded_rectangle([130,yy,130+w,yy+18],9,fill=col)
    st=Image.new('RGBA',(460,150),(0,0,0,0)); sd=ImageDraw.Draw(st)
    sd.rounded_rectangle([6,6,454,144],18,outline=A3+(255,),width=9); sd.text((230,75),'YOU AGREED',font=F('InterDisplay-Black.otf',64),fill=A3,anchor='mm')
    st=st.rotate(-10,expand=True,resample=Image.BICUBIC); im.alpha_composite(st,(520,y+190))
post('post1_welcome','START HERE',A1,['The hidden','rules of your','digital life'],2,['Explained with real sources,','in plain English.'],art_layers)
post('post2_algorithm','THURSDAY · THE ALGORITHM',A2,['Same ride.','2 different','prices.'],2,['How invisible systems decide','what you pay and what you see.'],art_price)
post('post3_fineprint','FRIDAY · THE FINE PRINT',A3,['We read the','terms so you','don\'t have to.'],2,['The exact clauses you agreed to,','quoted word for word.'],art_clause)
# highlight covers 1080x1920, icon centred in the circle
def cover(name,col,label,draw):
    im=Image.new('RGBA',(1080,1920),BG+(255,)); d=ImageDraw.Draw(im)
    d.ellipse([240,660,840,1260],fill=(22,26,44,255),outline=col+(255,),width=14)
    draw(im,d,col); fl=fit(d,label,'InterDisplay-Black.otf',52,400); d.text((540,1150),label,font=fl,fill=TXT,anchor='mm')
    im.convert('RGB').save(f'ig/{name}.jpg',quality=93)
def ic_algo(im,d,c):
    for i,h in enumerate([110,180,250]): x=410+i*95; d.rounded_rectangle([x,1060-h,x+70,1060],14,fill=c)
def ic_print(im,d,c):
    d.rounded_rectangle([440,760,640,1060],18,outline=c,width=12)
    for k in range(4): d.rounded_rectangle([470,805+k*55,600-(k%2)*40,825+k*55],8,fill=c)
def ic_about(im,d,c):
    im.alpha_composite(layers(330,hi=1),(375,725))
def ic_shorts(im,d,c):
    d.polygon([(495,800),(495,1040),(665,920)],fill=c)
cover('cover_algorithm',A2,'ALGORITHM',ic_algo); cover('cover_fineprint',A3,'FINE PRINT',ic_print)
cover('cover_about',A1,'ABOUT',ic_about); cover('cover_shorts',A1,'SHORTS',ic_shorts)
# preview sheet: grid as Instagram shows it (3:4 crop) + covers
g=Image.new('RGB',(1080*3,1440+700),BG)
for i,n in enumerate(['post1_welcome','post2_algorithm','post3_fineprint']):
    p=Image.open(f'ig/{n}.jpg'); g.paste(p.crop((0,0,1080,1350)).resize((1080,1350)),(i*1080,0))
for i,n in enumerate(['cover_about','cover_algorithm','cover_fineprint','cover_shorts']):
    c=Image.open(f'ig/{n}.jpg').crop((240,660,840,1260)).resize((560,560)); m=Image.new('L',(560,560),0); ImageDraw.Draw(m).ellipse([0,0,560,560],fill=255)
    g.paste(c,(140+i*760,1500),m)
g.resize((1620,1070)).save('ig_preview.jpg',quality=85)
