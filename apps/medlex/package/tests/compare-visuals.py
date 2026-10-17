"""Compare locally captured before/after screenshots; no network or user data."""
import json,sys
from pathlib import Path
from PIL import Image,ImageChops
import numpy as np
root=Path(sys.argv[1])
a=json.loads((root/'before.json').read_text());b=json.loads((root/'after.json').read_text());rows=[]
for x,y in zip(a['results'],b['results']):
 assert x['name']==y['name']
 p=Image.open(root/'before'/f"{x['name']}.png").convert('RGB');q=Image.open(root/'after'/f"{x['name']}.png").convert('RGB')
 same_size=p.size==q.size
 delta=np.asarray(ImageChops.difference(p,q)) if same_size else None
 pixels=int(np.any(delta>0,axis=2).sum()) if delta is not None else None
 rows.append({'name':x['name'],'textEqual':x['text']==y['text'],'rectsEqual':x['rects']==y['rects'],'sameSize':same_size,'changedPixels':pixels,'changedPixelPercent':pixels/(p.width*p.height)*100 if pixels is not None else None})
result={'screenshotsPerBuild':len(rows),'allTextEqual':all(r['textEqual'] for r in rows),'allPageGeometryEqual':all(r['rectsEqual'] for r in rows),'allImageSizesEqual':all(r['sameSize'] for r in rows),'pixelExact':sum(r['changedPixels']==0 for r in rows),'maximumChangedPixelPercent':max(r['changedPixelPercent'] or 0 for r in rows),'beforeErrors':a['errors'],'afterErrors':b['errors'],'beforeViolations':sum(len(r['violations'])for r in a['results']),'afterViolations':sum(len(r['violations'])for r in b['results']),'results':rows}
Path('review/phase1/visual-comparison.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items()if k!='results'}))
if not result['allTextEqual'] or not result['allPageGeometryEqual'] or not result['allImageSizesEqual'] or result['afterErrors'] or result['afterViolations']:sys.exit(1)
