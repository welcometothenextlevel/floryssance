# Resize every Instagram photo to web sizes (JPG + WebP). Run: python3 _build/images.py
from PIL import Image, ImageOps
import os, glob
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'_src','ig'); OUT=os.path.join(ROOT,'assets','img')
names={'p1':'peche-lys','p2':'fuchsia-initiale-m','p3':'rouge-initiale-l','p4':'rouge-paillete','p5':'rose-blanc-lys'}
for f in sorted(glob.glob(os.path.join(SRC,'p*_*.jpg'))):
    b=os.path.basename(f)[:-4]; post,idx=b.split('_')
    im=ImageOps.exif_transpose(Image.open(f)).convert('RGB')
    w,h=im.size
    if (w,h)!=(1179,1571): im=im.resize((1179,1571),Image.LANCZOS)
    for W in (600,1100):
        r=im.resize((W,round(W*1571/1179)),Image.LANCZOS)
        n=f"{names[post]}-{idx}-{W}"
        r.save(os.path.join(OUT,n+'.jpg'),quality=82,optimize=True,progressive=True)
        r.save(os.path.join(OUT,n+'.webp'),quality=80,method=6)
print(len(os.listdir(OUT)),'files')

# Tighter crop of the "Merci" bouquet for its card: drops the train interior at the top.
im=Image.open(os.path.join(SRC,'p1_2.jpg')).convert('RGB').crop((110,292,1069,1571))
for W in (600,1100):
    r=im.resize((W,round(W*4/3)),Image.LANCZOS)
    r.save(os.path.join(OUT,f'peche-lys-2c-{W}.jpg'),quality=82,optimize=True,progressive=True)
    r.save(os.path.join(OUT,f'peche-lys-2c-{W}.webp'),quality=80,method=6)
