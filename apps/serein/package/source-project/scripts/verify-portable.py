"""Mask/re-inject the original embedded payloads and inspect a complete portable deliverable."""
from pathlib import Path
from html.parser import HTMLParser
import sys,re,json,subprocess,hashlib
target,mapping_path,workdir=map(Path,sys.argv[1:4]);workdir.mkdir(parents=True,exist_ok=True)
mapping=json.loads(mapping_path.read_text());inverse={v:k for k,v in mapping.items()}
original=target.read_text();seen=[]
def mask(m):
 uri=m.group(0)
 if uri not in inverse:raise ValueError('An embedded payload differs from the original app')
 seen.append(inverse[uri]);return inverse[uri]
masked=re.sub(r'data:[^\s"\'<>);]+;base64,[A-Za-z0-9+/=]+',mask,original)
assert set(seen)==set(mapping),'Original payload missing from the output'
(workdir/'phase0-deblobbed.html').write_text(masked)
rebuilt=masked
for token,uri in mapping.items():rebuilt=rebuilt.replace(token,uri)
assert rebuilt==original,'Asset re-injection changed the document'
assert '__ASSET_' not in rebuilt
target.write_text(rebuilt)
class Inspect(HTMLParser):
 def __init__(self):super().__init__();self.scripts=[];self.styles=[];self.active=None;self.ids=[];self.lang=None;self.meta={}
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a.get('lang')
  if 'id' in a:self.ids.append(a['id'])
  if tag=='script':
   assert 'src' not in a,'External script dependency';self.active='script';self.scripts.append('')
  if tag=='style':self.active='style';self.styles.append('')
  if tag=='link':assert a.get('rel') not in ['stylesheet','preload','manifest'],'External app dependency'
  if tag=='img':assert 'alt' in a;assert not a.get('src','').startswith('assets/')
  if tag=='meta' and 'name' in a:self.meta[a['name']]=a.get('content','')
 def handle_data(self,data):
  if self.active=='script':self.scripts[-1]+=data
  if self.active=='style':self.styles[-1]+=data
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.active=None
parser=Inspect();parser.feed(masked)
assert parser.lang=='en-GB';assert parser.meta['serein-version']=='5.0';assert len(parser.ids)==len(set(parser.ids))
for i,script in enumerate(parser.scripts):
 file=workdir/('script-%02d.js'%i);file.write_text(script)
 subprocess.run(['node','--check',str(file)],check=True,capture_output=True)
result={'file':target.name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'scripts_parsed':len(parser.scripts),'styles_parsed':len(parser.styles),'unique_embedded_payloads_preserved':len(mapping),'payload_occurrences':len(seen),'unresolved_placeholders':0,'static_duplicate_ids':0}
(workdir/'inspection.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
