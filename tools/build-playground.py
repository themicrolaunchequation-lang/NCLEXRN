import re
import os
SP=os.path.dirname(os.path.abspath(__file__))+'/'
def split(path):
    s=open(path).read()
    css=re.search(r'<style>(.*?)</style>',s,re.S).group(1)
    body=s[s.index('<body>')+6:s.index('<script>')]
    js=re.search(r'<script>(.*)</script>',s,re.S).group(1).strip()
    return css,body,js
def scope_css(css):
    css=css.replace(':root{',':host{',1)
    css=css.replace('html,body{margin:0}','')
    css=re.sub(r'(^|\n)body\{','\\1.app-root{display:block;min-height:100vh;',css,count=1)
    assert 'body{' not in css.replace('.app-root{',''), 'body left'
    return css+'.modal{padding-top:72px!important}.toast{top:calc(70px + env(safe-area-inset-top,0px))!important}'
def scope_js(js, exports):
    assert js.startswith('(function(){') and js.endswith('})();'), js[:20]+js[-20:]
    inner=js[len('(function(){'):-len('})();')]
    reps=[('const $ = (s,r=document)=>r.querySelector(s);','const $ = (s,r=ROOT)=>r.querySelector(s);'),
          ('document.querySelectorAll(','ROOT.querySelectorAll('),
          ('document.querySelector(','ROOT.querySelector('),
          ('document.body.appendChild(','ROOT.querySelector(".app-root").appendChild('),
          ('document.elementFromPoint(','ROOT.elementFromPoint(')]
    for a,b in reps: inner=inner.replace(a,b)
    inner=re.sub(r'\n[^\n]*window\.claude[^\n]*','',inner)
    inner=re.sub(r'\n[^\n]*window\.__SA[^\n]*','',inner)
    return inner+'\nreturn {'+exports+'};\n'
lt_css,lt_body,lt_js=split('lss-game/index.html')
sa_css,sa_body,sa_js=split('sigma-arcade/index.html')
sa_js=sa_js.replace('if(!G.game || $("#play").hidden) return;','if(!G.game || $("#play").hidden || ROOT.host.hidden) return;')
assert 'ROOT.host.hidden' in sa_js
shell=open(SP+'playground-shell.html').read()
shell=shell.replace('In real processes, waste is often 80-90% of the time.','In many real processes, most of the time is waste.')
out=shell.replace('{{TPL_LT}}','<style>'+scope_css(lt_css)+'</style><div class="app-root">'+lt_body+'</div>')
out=out.replace('{{TPL_SA}}','<style>'+scope_css(sa_css)+'</style><div class="app-root">'+sa_body+'</div>')
out=out.replace('{{JS_LT}}',scope_js(lt_js,'intro, homeScreen, mapScreen'))
out=out.replace('{{JS_SA}}',scope_js(sa_js,'startGame, goHome, renderHome'))
assert '{{' not in out
for bad in ['document.querySelectorAll(','document.body']:
    seg=out[out.index('function mountLeanTown'):out.index('</script>',out.index('function mountLeanTown'))]
    assert bad not in seg, bad
open('index.html','w').write(out)
# artifact copy (no doctype/html/head/body wrappers)
body=out[out.index('<body>')+6:out.index('</body>')]
open(os.devnull,'w').write(out[out.index('<title>'):out.index('</head>')]+body)
print(len(out))
