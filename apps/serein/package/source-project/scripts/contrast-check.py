from pathlib import Path
import re,json
s=Path('dist/styles.css').read_text()
def tokens(block):return dict(re.findall(r'--color-([a-z-]+):(#\w+)',block))
light=tokens(s[s.index(':root{'):s.index('/* BASE */')]);themes={'Light':light}
for name,key in [('Dark','night'),('High contrast','contrast')]:themes[name]={**light,**tokens(re.search(r'body\[data-theme='+key+r'\]{([^}]+)}',s)[1])}
def lum(h):
 h=h.lstrip('#');h=''.join(c*2 for c in h) if len(h)==3 else h
 c=[int(h[i:i+2],16)/255 for i in (0,2,4)];c=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c];return sum(x*w for x,w in zip(c,[.2126,.7152,.0722]))
def ratio(a,b):
 a,b=sorted([lum(a),lum(b)]);return (b+.05)/(a+.05)
rows=[]
for theme,t in themes.items():
 for fg in ['text','text-muted','accent','danger']:
  for bg in ['bg','surface','surface-raised']:rows.append({'theme':theme,'foreground':fg,'background':bg,'hex_fg':t[fg],'hex_bg':t[bg],'ratio':round(ratio(t[fg],t[bg]),2)})
 rows.append({'theme':theme,'foreground':'accent-contrast','background':'accent','hex_fg':t['accent-contrast'],'hex_bg':t['accent'],'ratio':round(ratio(t['accent-contrast'],t['accent']),2)})
Path('scripts/contrast-results.json').write_text(json.dumps(rows,indent=2))
fails=[r for r in rows if r['ratio']<4.5];print(len(rows),'contrast pairs measured; failures:',fails)
assert not fails

nontext=[]
for theme,t in themes.items():
 for fg in ['border','focus']:
  for bg in ['bg','surface','surface-raised']:
   value=round(ratio(t[fg],t[bg]),2);nontext.append({'theme':theme,'foreground':fg,'background':bg,'hex_fg':t[fg],'hex_bg':t[bg],'ratio':value});assert value>=3,(theme,fg,bg,value)
Path('scripts/contrast-nontext-results.json').write_text(json.dumps(nontext,indent=2))
print(len(nontext),'border/focus contrast pairs measured; all >=3:1')
