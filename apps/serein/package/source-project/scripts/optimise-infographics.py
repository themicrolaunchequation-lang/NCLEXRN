"""Optional asset-preparation tool; requires Pillow. Never alters source PNGs.

Run after visually reviewing new artwork/infographics/*.png. The original PNG
hash and exact generation prompt must already be recorded in infographics-raster.json.
"""
from pathlib import Path
from PIL import Image,ImageOps
import hashlib,json

root=Path(__file__).resolve().parents[1]
path=root/'infographics-raster.json';meta=json.loads(path.read_text())
out=root/'dist/assets/infographics';(out/'thumbs').mkdir(parents=True,exist_ok=True)
for id,m in meta['images'].items():
    original=root/m['original'];raw=original.read_bytes()
    if hashlib.sha256(raw).hexdigest()!=m['originalSha256']:raise ValueError('Unreviewed source change: '+id)
    im=ImageOps.exif_transpose(Image.open(original)).convert('RGB')
    m.update(width=im.width,height=im.height,image='assets/infographics/'+id+'.webp',thumbnail='assets/infographics/thumbs/'+id+'.webp')
    im.save(root/'dist'/m['image'],'WEBP',quality=90,method=6)
    im.thumbnail((180,240));im.save(root/'dist'/m['thumbnail'],'WEBP',quality=80,method=6)
    for field in ['image','thumbnail']:m[field+'Sha256']=hashlib.sha256((root/'dist'/m[field]).read_bytes()).hexdigest()
path.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print('Prepared',len(meta['images']),'raster images and thumbnails without altering originals')
