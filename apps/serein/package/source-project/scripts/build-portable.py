"""Self-contained HTML: catalogue paths stay stable; media resolves on visibility."""
from pathlib import Path
import base64,json,mimetypes,re,sys,hashlib
root=Path(__file__).resolve().parents[1];dist=root/'dist'
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root/'portable/Serein-v5.0.html'
out.parent.mkdir(parents=True,exist_ok=True)
def data_url(path):
 return 'data:'+(mimetypes.guess_type(path)[0] or 'application/octet-stream')+';base64,'+base64.b64encode(Path(path).read_bytes()).decode()
html=(dist/'index.html').read_text();css=(dist/'styles.css').read_text()
css=re.sub(r"url\(['\"]?(assets/[^)'\"]+)['\"]?\)",lambda m:'url("'+data_url(dist/m.group(1))+'")',css)
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+css+'\n</style>')
html=re.sub(r'<link rel="preload"[^>]+>','',html)
html=re.sub(r'(src|href)="(assets/[^\"]+)"',lambda m:m.group(1)+'="'+data_url(dist/m.group(2))+'"',html)
media={p.relative_to(dist).as_posix():data_url(p) for p in sorted((dist/'assets').rglob('*')) if p.suffix in ['.webp','.jpg','.jpeg','.png'] or p.suffix=='.svg' and 'infographics' in p.parts}
for name in re.findall(r'<script src="([^"]+)"></script>',html):
 script=(dist/name).read_text()
 if name=='media.js':script=script.replace('S.media=S.media||{};','S.media='+json.dumps(media,separators=(',',':'))+';')
 script=re.sub(r'</script',r'<\/script',script,flags=re.I)
 html=html.replace('<script src="'+name+'"></script>','<script>\n'+script+'\n</script>')
version=re.search(r"const APP_VERSION='([^']+)'",(root/'source/app.js').read_text()).group(1)
html=html.replace('<meta name="serein-version" content="">','<meta name="serein-version" content="'+version+'">').replace('<span id="app-version"></span>','<span id="app-version">'+version+'</span>')
cache_name='serein-hca-portable-'+version+'-'+hashlib.sha256(html.encode()).hexdigest()[:12]
html=html.replace('</head>','<meta name="serein-distribution" content="portable"><meta name="serein-offline-cache" content="'+cache_name+'"></head>')
worker=(root/'scripts/portable-worker-template.js').read_text().replace('__CACHE_NAME__',json.dumps(cache_name)).replace('Serein-v5.0-p0.html','Serein-v5.0.html')
(out.parent/'sw.js').write_text(worker)
html=re.sub(r'<link rel="manifest"[^>]+>','',html)
out.write_text(html)
print(json.dumps({'path':str(out),'bytes':out.stat().st_size,'media_assets':len(media)}))
