"""Publish reviewed, generated raster infographic assets and their editorial text.

Original PNGs live in artwork/infographics. Optimised WebP reader images and
thumbnails are prebuilt with optimise-infographics.py (optional Pillow tool).
This routine build needs only the Python standard library and never replaces
generated artwork with SVG or code-drawn images.
"""
from pathlib import Path
import hashlib, json

root=Path(__file__).resolve().parents[1]
cards=json.loads((root/'infographics-content.json').read_text())
meta=json.loads((root/'infographics-raster.json').read_text())
prompts=['# Serein: informative illustrated raster infographics', '',
         'Serein 5.1.1 · Healthcare Crown Academy Ltd · 16 October 2026', '',
         'Twelve original images were created with built-in image generation, not rasterised from SVG. Original PNGs are in artwork/infographics. Reader WebP images and small thumbnails preserve fast navigation. Each poster includes Serein branding, practical examples, explanatory illustrations and source context. Generated text was visually reviewed; selectable text and full source limitations remain available in the app.', '',
         'Use the existing Serein-logo-reference.png as the logo reference. Each full prompt below begins /infographics:. Sources and exercise counts retain their stated populations, dates and limitations. No source organisation endorses the app.', '']
total=0
for card in cards:
    m=meta['images'][card['id']]
    for field in ['image','thumbnail']:
        p=root/'dist'/m[field]
        if not p.is_file() or p.read_bytes()[:4]!=b'RIFF' or p.read_bytes()[8:12]!=b'WEBP':
            raise ValueError('Missing reviewed raster asset: '+str(p))
        if hashlib.sha256(p.read_bytes()).hexdigest()!=m[field+'Sha256']:
            raise ValueError('Asset changed; review and re-optimise: '+str(p))
    original=root/m['original']
    if not original.is_file() or original.read_bytes()[:8]!=b'\x89PNG\r\n\x1a\n':
        raise ValueError('Original generated PNG is missing: '+str(original))
    if hashlib.sha256(original.read_bytes()).hexdigest()!=m['originalSha256']:
        raise ValueError('Original changed; review it before rebuilding')
    card.update({k:m[k] for k in ['image','thumbnail','width','height']})
    card['format']='webp';card['checked']='16 October 2026'
    total+=(root/'dist'/m['image']).stat().st_size
    prompts += ['## '+str(len([p for p in prompts if p.startswith('## ')])+1)+'. '+card['title'], '',
                '**Value:** '+card['why'], '', '**Source:** '+card['source']['title']+' — '+card['source']['date']+' — '+card['source']['url'], '',
                '```text','/infographics: '+m['prompt'],'```','']
(root/'dist/infographics-data.js').write_text('/* Reviewed raster images; source: infographics-content.json + infographics-raster.json. */\n(function(S){\'use strict\';S.infographicCards='+json.dumps([{k:v for k,v in c.items() if k!='artDirection'} for c in cards],ensure_ascii=False,separators=(',',':'))+';})(globalThis.Serein=globalThis.Serein||{});\n')
(root/'INFOGRAPHICS-PROMPTS.md').write_text('\n'.join(prompts))
print(json.dumps({'reviewed_raster_images':len(cards),'reader_image_bytes':total,'original_pngs':len(cards)}))
