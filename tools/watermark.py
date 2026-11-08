#!/usr/bin/env python3
"""Watermark an original painting and save web copies.
Usage: watermark.py <original.png> <out.webp> <width> [<out2.webp> <width2> ...]"""
import sys
from PIL import Image,ImageDraw,ImageFont
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
TEXT='© JamestownIslandNews.com'
src=Image.open(sys.argv[1]).convert('RGB')
args=sys.argv[2:]
for out,w in zip(args[0::2],args[1::2]):
    w=int(w);im=src.resize((w,round(src.size[1]*w/src.size[0])),Image.LANCZOS).convert('RGBA')
    fs=max(10,round(w*0.017));f=ImageFont.truetype(FONT,fs)
    lay=Image.new('RGBA',im.size,(0,0,0,0));d=ImageDraw.Draw(lay)
    bb=d.textbbox((0,0),TEXT,font=f);tw,th=bb[2]-bb[0],bb[3]-bb[1]
    x=im.size[0]-tw-round(w*0.02);y=round(w*0.018)
    # a second, fainter mark across the middle-left so a crop can't remove both
    d.text((x+1,y+1),TEXT,font=f,fill=(0,0,0,110));d.text((x,y),TEXT,font=f,fill=(255,255,255,175))
    f2=ImageFont.truetype(FONT,round(fs*0.8));d.text((round(w*0.03),round(im.size[1]*0.45)),TEXT,font=f2,fill=(255,255,255,48))
    Image.alpha_composite(im,lay).convert('RGB').save(out,quality=84,method=6)
    print('wrote',out)
