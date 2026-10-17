import re,base64,io,pathlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1]; s=(root/'upload/MedLex-Medical-Terminology.html').read_text()
# Keep complete educational records; compress only illustration bytes.
assets={}
for uri in set(re.findall(r'data:image/webp;base64,[A-Za-z0-9+/=]+',s)):
 im=Image.open(io.BytesIO(base64.b64decode(uri.split(',')[1])));im.thumbnail((640,480));b=io.BytesIO();im.save(b,'WEBP',quality=65,method=6);assets[uri]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
for a,b in assets.items():s=s.replace(a,b)
# References to anatomy assets rather than repeated image literals.
m=re.search(r'const INLINE_ASSETS=(.*?);\n',s);am=__import__('json').loads(m[1])
after=s[m.end():]
for name,uri in am.items():after=after.replace(uri,'${INLINE_ASSETS.'+name+'}')
s=s[:m.end()]+after
s=s.replace('<html lang="en">','<html lang="en-AU">').replace('width=device-width, initial-scale=1','width=device-width, initial-scale=1, viewport-fit=cover')
s=re.sub(r'@font-face\{.*?\}', '',s)
font=''
for family,file,weight in [('Studio','inter-latin-wght-normal.woff2','100 900'),('Editorial','playfair-display-latin-400-normal.woff2','400')]:
 data=base64.b64encode((root/'brand/HCA-Brand-Kit/03-fonts'/file).read_bytes()).decode();font+=f"@font-face{{font-family:{family};src:url(data:font/woff2;base64,{data}) format('woff2');font-weight:{weight};font-display:swap}}"
s=s.replace('<style>','<style>'+font,1)
# Raise every legacy undersized declaration, including inline templates.
s=re.sub(r'font-size:\s*(\d+(?:\.\d+)?)px',lambda m:'font-size:'+str(max(14,float(m[1]))).removesuffix('.0')+'px',s)
# Original icons retain fallback-free SVG replacements in the shell.
crest=(root/'brand/HCA-Brand-Kit/01-logos/TEMPLATE-crest-letter-H.svg').read_text();crest=re.sub(r'<\?xml.*?\?>','',crest).replace('>H<','>M<')
s=re.sub(r'<span class="brand-mark">.*?</span></span>', '<span class="hca-crest">'+crest+'</span>',s,count=1)
s=s.replace('WORDS INTO UNDERSTANDING','HEALTHCARE CROWN ACADEMY')
s=s.replace('<aside class="sidebar" id="sidebar">','<aside class="sidebar" id="sidebar" aria-label="Learning navigation">')
start=s.index('<nav aria-label="Main navigation">');end=s.index('</nav>',start)+6
icons={'Today':'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>','Learn':'<path d="m2 8 10-5 10 5-10 5Z"/><path d="M6 10v7q6 5 12 0v-7M22 8v9"/>','Explore':'<path d="M12 5v16M3 4q5-2 9 1 4-3 9-1v15q-5-2-9 2-4-4-9-2Z"/>','Practice':'<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>','Progress':'<path d="M4 3v17h17M7 15l4-5 4 2 6-7"/>','Tools':'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 13h18M10 12v3h4v-3"/>'}
navs=[('today','home','Today'),('learn','modules','Learn'),('explore/terms','library','Explore'),('practice','practice','Practice'),('progress','progress','Progress'),('tools','toolkit','Tools')]
nav=''.join(f'<a href="#{url}" data-page="{page}" aria-label="{label}"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">{icons[label]}</svg><span class="nav-text">{label}</span></a>' for url,page,label in navs)
s=s[:start]+'<nav aria-label="Main navigation">'+nav+'</nav>'+s[end:]
s=s.replace('applyPreferences();$(\'#navTerms\').textContent=TERMS.length;','applyPreferences();')
s=s.replace('<div class="sidebar-note">','<div class="sidebar-note">',1)
s=re.sub(r'<div class="sidebar-footer">.*?</div>','<div class="sidebar-footer">By Healthcare Crown Academy<br>Learning, with distinction.</div>',s,count=1)
s=s.replace('<footer class="page-footer">','<nav class="bottom-nav" aria-label="Mobile navigation">'+nav[:nav.rfind('<a href="#tools"')]+'</nav><footer class="page-footer">',1)
s=s.replace('Book-informed. Curiosity-led.','References & learning notes')
s=s.replace('MedLex <span class="muted">/</span> The language of better care.','<a href="https://healthcarecrownacademy.co.uk" target="_blank" rel="noopener">By Healthcare Crown Academy</a><br>HEALTHCARE CROWN ACADEMY LTD · Company 17501904 · ICO ZC273259')
s=s.replace('</footer>','</footer><button class="nav-scrim" data-action="menu" aria-label="Close navigation" hidden></button>',1)
# All mutations target v3; legacy keys are read-only rollback snapshots.
s=s.replace("localStorage.setItem('medlex-v1',JSON.stringify(state))","saveV3()")
s=s.replace("function persistCourse(){try{localStorage.setItem('medlex-course-v2',JSON.stringify(course));return true}catch{toast('Course records could not be saved. Export your progress before closing.');return false}}","function persistCourse(){return persist()}")
# New preferences are applied after initialization; early old call removed.
s=s.replace('applyPreferences();\nlet route=', 'let route=')
s=s.replace("const originalRender=render,originalHome=home,originalPractice=practice,originalProgress=progress;",'')
# Remove the original router and install one unified router after all data initializes.
s=re.sub(r'^function render\(\).*$', '',s,flags=re.M)
s=re.sub(r'^render=function\(\).*$', '',s,flags=re.M)
s=re.sub(r'^render\(\);$', '',s,flags=re.M)
s=s.replace("if(!location.hash)location.hash='#modules';",'')
# Inline function replacement helper, with known multi-line boundary.
def fn(name,body,nextname=None):
 global s
 if nextname:
  a=s.index('function '+name+'(');b=s.index('function '+nextname+'(',a);s=s[:a]+body+'\n'+s[b:]
 else:s,n=re.subn(r'^function '+name+r'\([^\n]*$',lambda _:body,s,flags=re.M);assert n==1,(name,n)
fn('home',(root/'work/today.js').read_text(),'systems')
fn('applyPreferences',(root/'work/preferences.js').read_text())
# Meaning distractors: chapter/category first, then closest definition lengths.
s=s.replace("shuffle(TERMS.filter(x=>x.id!==t.id&&x.definition!==t.definition)).slice(0,3)","distractors(t)")
s=s.replace("quiz={mode,index:0", "sessionStarted=Date.now();quiz={mode,index:0")
s=s.replace("list=shuffle(list).sort((a,b)=>Number(!!state.reviews[b.id])-Number(!!state.reviews[a.id]));flash=", "list=shuffle(list).sort((a,b)=>Number(!!state.reviews[b.id])-Number(!!state.reviews[a.id])).slice(0,20);sessionStarted=Date.now();flash=")
s=s.replace("<small class=\"muted\">In everyday words: ${t.plain}</small>","${t.plain!==t.definition?`<small class=\"muted\">In everyday words: ${esc(t.plain)}</small>`:''}")
s=s.replace('<button class="btn" data-action="rate" data-id="again">↻ Review again</button><button class="btn lime" data-action="rate" data-id="known">✓ Got it</button>', '${[1,2,3,4].map((n)=>`<button class="btn ${n===3?\'primary\':\'\'}" data-action="rate" data-id="${n}">${[\'Again\',\'Hard\',\'Good\',\'Easy\'][n-1]}<small>${intervalLabel(t.id,n)}</small></button>`).join(\'\')}')
s=s.replace("rateFlash(id==='known')",'rateFlash(Number(id))').replace("rateFlash(e.key==='ArrowRight')","rateFlash(e.key==='ArrowRight'?3:1)")
s=s.replace('Space to flip · ← Review again · → Got it <br>Review again keeps the word due. Got it schedules a later review.','Space to reveal · 1 Again · 2 Hard · 3 Good · 4 Easy')
fn('rateFlash',(root/'work/srs.js').read_text())
# Only curated helpful fields are displayed; original records remain unchanged.
s=s.replace('<h2 id="modalTitle" class="modal-title">${t.term}</h2>','<h2 id="modalTitle" class="modal-title">${esc(t.term)}</h2>')
s=s.replace('<div class="context-box"><span class="eyebrow">IN EVERYDAY WORDS</span><p>${esc(t.plain)}</p></div>', '${t.plain!==t.definition?`<div class="context-box"><span class="eyebrow">IN EVERYDAY WORDS</span><p>${esc(t.plain)}</p></div>`:\'\'}')
s=s.replace('<div class="context-box"><span class="eyebrow">IN A CLINICAL NOTE · FICTIONAL EXAMPLE</span><p>“${esc(t.example)}”</p></div>', '${t.example&&!/^In a fictional teaching glossary/.test(t.example)?`<div class="context-box"><span class="eyebrow">IN A CLINICAL NOTE · FICTIONAL EXAMPLE</span><p>“${esc(t.example)}”</p></div>`:\'\'}')
s=s.replace('${t.note?`<div class="callout">${esc(t.note)}</div>`:', '${t.note&&!/^Concise companion definition/.test(t.note)?`<div class="callout">${esc(t.note)}</div>`:')
s=s.replace("const at=COURSE_MODULES.indexOf(m),next=COURSE_MODULES[at+1]", "const at=COURSE_MODULES.indexOf(m),next=COURSE_MODULES[at+1]")
s=s.replace('${COURSE_TRACKS[m.track]} / MODULE ${String(at+1).padStart(2,\'0\')}', '${COURSE_TRACKS[m.track]} / ${m.affixKind?\'Word elements\':\'Chapter \'+m.chapter}')
# v3 export has an explicit source-of-truth snapshot.
s=re.sub(r'^function exportProgress\(\).*$', '',s,flags=re.M)
s=re.sub(r'^exportProgress=function\(\).*$', "function exportProgress(){saveV3();downloadText('MedLex-Learning-Record-v3.json',JSON.stringify({app:'MedLex',version:3,data:v3},null,2),'application/json');toast('Your learning record has been exported.')}" ,s,flags=re.M)
# Preserve strict existing v2 validator, extend v3 via a wrapper entry.
s=s.replace('function validateImport(x){','function validateV2Import(x){')
s=s.replace("state=pendingImport.studio;course=pendingImport.course;", "if(pendingImport.v3)v3=pendingImport.v3;state=pendingImport.studio;course=pendingImport.course;")
# Add settings as accessible labelled fields; submission remains in the single handler.
fn('profile',(root/'work/profile.js').read_text())
s=s.replace("state.reduced=f.has('reduced');persist();", "state.reduced=f.get('motion')==='system'?null:f.get('motion')==='reduce';state.theme=f.get('theme');v3.profile={...v3.profile,role:f.get('role'),dailyGoalMin:+f.get('goal'),textScale:+f.get('scale'),highContrast:f.has('contrast'),...voicePreferencesFrom(e.target),assistingLanguage:ASSIST_LANGUAGES[f.get('assistingLanguage')]?f.get('assistingLanguage'):''};persist();")
s=s.replace("state.theme=state.theme==='dark'?'light':'dark'", "state.theme=({light:'dark',dark:'system',system:'light'})[state.theme]||'light'")
s=s.replace("utterance.rate=.8", "utterance.rate=v3.profile.ttsRate||.85")
# Remove default source mutation wrappers by integrating original body and append.
for var,name in [('oldSources','sources'),('oldOpenChapter','openChapter'),('oldLibrary','library')]:
 pattern=r'const '+var+r'='+name+r';'+name+r'=function\(([^)]*)\)\{'+var+r'\([^)]*\);(.*?)\};'
 m=re.search(pattern,s)
 if m:
  extra=m[2];s=s[:m.start()]+s[m.end():]
  old=re.search(r'^function '+name+r'\([^\n]*$',s,re.M)
  if old:s=s[:old.start()]+old[0][:-1]+';'+extra+'}'+s[old.end():]
# pagination's assignment becomes the canonical declaration
s=re.sub(r'^function filterLibrary\([^\n]*\n','',s,flags=re.M)
s=s.replace('filterLibrary=function(){','function filterLibrary(){').replace('let globalLimit=60;const oldLibrary=library;library=function(){globalLimit=60;oldLibrary()};','let globalLimit=60;')
s=s.replace("let globalLimit=60;const oldLibrary=library;library=function(){globalLimit=60;oldLibrary()};",'let globalLimit=60;')
# Keep retained module logic, with a bounded paginated library and improved type/layout.
s=s.replace('</style>',(root/'work/design.css').read_text()+'</style>',1)
s=s.replace("// The original application remains available; the course is now the entry point.", (root/'work/core.js').read_text())
# Additional javascript is before the final script terminator, after all data/functions.
s=s.replace('\n</script>\n</body>', '\ninitializeV3();\n</script>\n</body>')
(root/'MedLex.html').write_text(s)
print('Original', (root/'upload/MedLex-Medical-Terminology.html').stat().st_size,'New',(root/'MedLex.html').stat().st_size)
# Compact lossless table storage: every original field is reconstructed exactly once.
s=(root/'MedLex.html').read_text();m=re.search(r'^TERMS.push\(\.\.\.(\[.*\])\);$',s,re.M)
if m:
 import json
 records=json.loads(m[1]);keys=list(dict.fromkeys(k for r in records for k in r));rows=[]
 for r in records:
  row=[r.get(k) for k in keys]
  if 'plain' in keys and r.get('plain')==r.get('definition'):row[keys.index('plain')]=None
  rows.append(row)
 data=json.dumps(rows,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
 code="TERMS.push(...JSON.parse(document.getElementById('extended-terms').textContent).map(r=>{const t=Object.fromEntries("+json.dumps(keys)+".map((k,i)=>[k,r[i]]));if(t.plain===null)t.plain=t.definition;return t}));"
 s=s[:m.start()]+code+s[m.end():];s=s.replace('<script>','<script type="application/json" id="extended-terms">'+data+'</script>\n<script>',1)
s=s.replace('u.rate=.8','u.rate=v3.profile.ttsRate||.85').replace("const v=voices.find(v=>v.lang==='en-AU')", "const v=voices.find(v=>v.name===v3.profile.ttsVoice)||voices.find(v=>v.lang==='en-AU')")
# Answered items contribute to the daily learning goal.
s=s.replace('quiz.selection=i;if(quiz.items', 'quiz.selection=i;trackItem();if(quiz.items')
s=s.replace('e.selection=value;const right', 'e.selection=value;trackItem();const right')
(root/'MedLex.html').write_text(s)
print('Final bytes',len(s.encode()))
s=(root/'MedLex.html').read_text()
# Consolidate existing event callbacks into one DOM listener per type.
for event in ['click','input','change','submit','keydown']:
 s=s.replace("document.addEventListener('"+event+"',e=>{", "eventHandlers."+event+".push(e=>{")
s=s.replace("const $=(s,el=document)=>", "const eventHandlers={click:[],input:[],change:[],submit:[],keydown:[]};\nconst $=(s,el=document)=>",1)
s=s.replace('initializeV3();', "for(const [type,handlers]of Object.entries(eventHandlers))document.addEventListener(type,e=>{for(const handler of handlers)handler(e)});\ninitializeV3();",1)
# Function source fixes and complete v2 restore migration.
s=s.replace('if(pendingImport.v3)v3=pendingImport.v3;state=pendingImport.studio;', 'v3=pendingImport.v3||migrate(pendingImport.studio,pendingImport.course);state=pendingImport.studio;')
s=s.replace("studio.reviews[id]={due:r.due,reps:Math.max(0,Math.min(100,r.reps))}","studio.reviews[id]={...r,due:r.due,reps:Math.max(0,Math.min(100,r.reps))}")
s=s.replace("function renderSearch(q){", "function legacySearchResults(q){")
s=s.replace("renderSearch(e.target.value)","debouncedSearch(e.target.value)")
s=s.replace("function render(){", "function render(){",1)
s=s.replace("if(route==='practice')enhancePractice();", "if(route==='practice'){enhancePractice();addPracticeModes();}")
s=s.replace('drawSpecial()}\nfunction drawSpecial', 'prepareSpecial()}\nfunction drawSpecial')
extra=(root/'work/enhancements.js').read_text().replace('closeModal();drawSpecial()','closeModal();prepareSpecial()')
extra+='''
function renderSearch(q){groupedSearch(q)}
let searchTimer;
function debouncedSearch(q){clearTimeout(searchTimer);searchTimer=setTimeout(()=>groupedSearch(q),80)}
function addPracticeModes(){main.insertAdjacentHTML('afterbegin',`<section class="continue-card"><div><span class="eyebrow">TODAY’S SESSION</span><h2>Five clear connections.</h2><p>Alternate between terms and meanings, using clinically related distractors.</p><button class="btn primary" data-v3="special" data-id="mixed">Start today’s session →</button></div><div><span class="eyebrow">MORE WAYS TO LEARN</span><div class="term-actions"><button class="btn" data-v3="build">Build a word</button><button class="btn" data-v3="special" data-id="spell">Listen & spell</button><button class="btn" data-v3="special" data-id="match">Match a meaning</button></div></div></section>`)}
eventHandlers.click.push(e=>{const b=e.target.closest('[data-v3]');if(b?.dataset.v3==='special')startSpecial(b.dataset.id);if(b?.dataset.v3==='specialanswer')answerSpecial(b.dataset.id);if(b?.dataset.v3==='specialnext')nextSpecial();if(b?.dataset.v3==='reviewmistakes'){for(const id of special.wrong)state.reviews[id]={reps:0,due:Date.now(),interval:0,ease:2.5,lapses:0};persist();toast('These words are ready for recall review.')}if(b?.dataset.v3==='recentsearch'){$('#globalSearch').value=b.dataset.id;groupedSearch(b.dataset.id)}if(e.target.closest('#globalResults [data-action],#globalResults [data-course],#globalResults a')){const q=$('#globalSearch')?.value.trim();if(q){v3.search.recent=[q,...v3.search.recent.filter(x=>x!==q)].slice(0,8);persist()}}});
eventHandlers.submit.push(e=>{if(e.target.id==='listenSpell'){e.preventDefault();answerSpecial(new FormData(e.target).get('answer'))}});
eventHandlers.keydown.push(e=>{if(modal.open&&e.target.id==='globalSearch'&&['ArrowDown','ArrowUp','Enter'].includes(e.key)){const list=$$('#globalResults button,#globalResults a');if(e.key==='Enter'&&searchFocus>=0){e.preventDefault();list[searchFocus]?.click()}else if(e.key!=='Enter'){e.preventDefault();searchFocus=(searchFocus+(e.key==='ArrowDown'?1:-1)+list.length)%list.length;list.forEach((el,i)=>el.classList.toggle('search-focused',i===searchFocus));list[searchFocus]?.scrollIntoView?.({block:'nearest'})}}if(special&&!modal.open&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){if(/^[a-d]$/i.test(e.key)&&!special.answered&&special.mode!=='spell')answerSpecial(e.key.toLowerCase().charCodeAt(0)-97);else if(e.key==='Enter'&&special.answered)nextSpecial()}});
'''
s=s.replace('for(const [type,handlers]of Object.entries(eventHandlers))',extra+'\nfor(const [type,handlers]of Object.entries(eventHandlers))',1)
# Explicit mobile close control, focusable and labelled.
s=s.replace('<p class="nav-label">YOUR STUDIO</p>','<button class="btn mobile-nav-close" data-action="menu">Close navigation ×</button><p class="nav-label">YOUR STUDIO</p>',1)
# New semantic headings within card buttons, preserving visual size.
s=s.replace('</style>', '.card-heading{display:block;font-family:Editorial,Georgia,serif;font-size:1.5rem;line-height:1.35;margin-block:12px}.flashcard .card-heading{font-size:2rem}.search-result{font-size:1rem;min-height:56px}.search-result small{font-size:.8125rem;color:var(--muted)}.search-focused{outline:3px solid var(--primary);outline-offset:-3px}.mobile-nav-close{display:none}@media(max-width:1023px){.mobile-nav-close{display:flex;margin-bottom:20px}}\n</style>',1)
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
# Theme all legacy component colours through HCA semantic variables.
def css_normalize(m):
 css=m[1];marker=css.index('/* HCA identity')
 old=css[:marker];new=css[marker:]
 def decl(d):
  prop,val=d[1],d[2]
  if prop.startswith('--'):return d[0]
  def color(c):
   raw=c[0][1:];rgb=raw[:6] if len(raw)>=6 else ''.join(ch*2 for ch in raw[:3]);r,g,b=[int(rgb[i:i+2],16)/255 for i in (0,2,4)];lum=.2126*r+.7152*g+.0722*b
   if 'background' in prop or prop in ['fill']:
    if lum<.35:return 'var(--ink)'
    if max(r,g,b)-min(r,g,b)<.06:return 'var(--panel)'
    if r>g*1.04 and r>b*1.04:return 'var(--peach)'
    if b>g*1.015:return 'var(--purple)'
    return 'var(--sage)'
   if 'border' in prop or prop in ['box-shadow','outline']:return 'var(--line)'
   if prop in ['color','stroke']:
    return 'var(--ink)' if lum<.4 else 'var(--muted)'
   return 'var(--line)'
  return prop+':'+re.sub(r'#[0-9a-fA-F]{3,8}\b',color,val)
 old=re.sub(r'([\w-]+)\s*:\s*([^;{}]+)',decl,old)
 return '<style>'+old+new+'</style>'
s=re.sub(r'<style>(.*?)</style>',css_normalize,s,count=1,flags=re.S)
# Undo for unsaving, without changing the complete term record.
a=s.index('function toggleSave(');b=s.index('\n',a)
s=s[:a]+'''function toggleSave(id){const t=termBy(id);if(!t)return;const was=state.saved.includes(id);state.saved=was?state.saved.filter(x=>x!==id):[...state.saved,id];persist();if(modal.open&&activeTerm===id)openTerm(id);refreshBehindModal();toast(was?t.term+' removed from saved words.':t.term+' saved to your collection.');if(was){const el=$('#toast'),undo=document.createElement('button');undo.className='btn small';undo.textContent='Undo';undo.onclick=()=>{if(!state.saved.includes(id))state.saved.push(id);persist();refreshBehindModal();if(modal.open&&activeTerm===id)openTerm(id);el.classList.remove('show')};el.append(undo);clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),5000)}}'''+s[b:]
s=s.replace('state.history=state.history.slice(0,50)','state.history=state.history.slice(0,500)')
s=s.replace('mode:quiz.mode,score:quiz.score,total:quiz.items.length}', 'mode:quiz.mode,score:quiz.score,total:quiz.items.length,durationMs:Date.now()-sessionStarted}')
s=s.replace('<p>Your result is a practice snapshot, not a measure of clinical competence.</p>','<p>${Math.max(1,Math.round((Date.now()-sessionStarted)/60000))} minutes · ${quiz.score*10} XP · ${streak()} day streak</p><p>Your result is a practice snapshot, not a measure of clinical competence.</p><a class="btn" href="#today">Back to Today</a>')
# Real speech settings and playing indication.
s=s.replace("u.onerror=()=>toast(", "const playing=$$('[data-action=speak]').filter(b=>b.dataset.id===id);playing.forEach(b=>b.setAttribute('aria-busy','true'));u.onend=()=>playing.forEach(b=>b.removeAttribute('aria-busy'));u.onerror=()=>toast(")
# Saving is debounced, with synchronous flush on departure and export.
s=s.replace('function persist(){try{saveV3();return true}', "let saveTimer;function persist(){try{if(v3){clearTimeout(saveTimer);storageState.pending=true;storageState.dirty=true;storageState.error=null;updateWorksheetSaveStatus();saveTimer=setTimeout(flushPendingSave,250)}return true}")
s=s.replace('hydrateV3();applyPreferences();persist();matchMedia', 'hydrateV3();applyPreferences();try{saveV3()}catch(e){storageState.error=e.name;storageState.dirty=true}matchMedia')
s=s.replace('initializeV3();\n</script>',"window.addEventListener('pagehide',()=>{try{saveV3()}catch{}});\ninitializeV3();\n</script>")
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
s=s.replace("terms:shuffle(rich).slice(0,5)","terms:shuffle(rich).slice(0,mode==='mixed'?10:5)")
s=s.replace('Question ${s.index+1} of 5','Question ${s.index+1} of ${s.terms.length}').replace('${s.index/5*100}', '${s.index/s.terms.length*100}').replace("${s.index===4?'See summary':'Continue'}", "${s.index===s.terms.length-1?'See summary':'Continue'}")
s=s.replace('if(++s.index<5)', 'if(++s.index<s.terms.length)').replace('mode:s.mode,score:s.score,total:5','mode:s.mode,score:s.score,total:s.terms.length').replace('${s.score}/5','${s.score}/${s.terms.length}').replace('${s.score*20}% accuracy','${pct(s.score,s.terms.length)}% accuracy')
s=s.replace('Five clear connections.</h2><p>Alternate','Ten clear connections.</h2><p>Alternate')
# Optional offline install metadata (does not imply a service worker from file://).
import json,urllib.parse
manifest={'name':'MedLex · Healthcare Crown Academy','short_name':'MedLex','start_url':'./','display':'standalone','background_color':'#F8F5EF','theme_color':'#10253A'}
s=s.replace('</head>','<link rel="manifest" href="data:application/manifest+json,'+urllib.parse.quote(json.dumps(manifest))+'"></head>',1)
# Session exit confirmation is part of the sole click dispatcher.
s=s.replace('for(const handler of handlers)handler(e)',"if(type==='click'&&guardSessionExit(e))return;for(const handler of handlers)handler(e)")
extra='''
let pendingExit=null;
function guardSessionExit(e){const b=e.target.closest('a[href^="#"],[data-action="exitpractice"],[data-course="exitexercise"]');if(!b||modal.open)return false;const running=(quiz&&(quiz.index>0||quiz.answered))||(flash&&flash.rated.length>0)||(exercise&&(exercise.index>0||exercise.answered))||(special&&special.index>0);if(!running)return false;e.preventDefault();pendingExit=b.getAttribute('href')||((b.dataset.course==='exitexercise')?'#module?id='+exercise.module+'&tab=practice':'#practice');showModal('<h2 id="modalTitle" class="modal-title">Leave this practice session?</h2><p>Completed recall ratings are saved. An unfinished quiz will not receive a session score.</p><div class="term-actions"><button class="btn primary" data-action="close">Keep practising</button><button class="btn" data-v3="leavesession">Leave session</button></div>','PAUSE & RETURN');return true}
eventHandlers.click.push(e=>{if(e.target.closest('[data-v3="leavesession"]')){const target=pendingExit;quiz=null;flash=null;exercise=null;special=null;pendingExit=null;closeModal();if(location.hash===target)render();else navigate(target)}});
'''
s=s.replace('for(const [type,handlers]of Object.entries(eventHandlers))',extra+'\nfor(const [type,handlers]of Object.entries(eventHandlers))',1)
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text().replace('quiz=null;flash=null;exercise=null;setNav(false)','quiz=null;flash=null;exercise=null;special=null;setNav(false)')
s=s.replace('</style>','\n:root{--control-line:#7a8484}:root[data-theme=dark]{--control-line:#7b919b}input,select,textarea,.select,.btn:not(.primary){border-color:var(--control-line)}\n</style>',1)
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
s=s.replace("if(type==='click'&&guardSessionExit(e))return;for(const handler", "if(type==='click'&&guardSessionExit(e))return;if(type==='click'&&e.target.closest('#globalResults button,#globalResults a')){const q=$('#globalSearch')?.value.trim();if(q){v3.search.recent=[q,...v3.search.recent.filter(x=>x!==q)].slice(0,8);persist()}}for(const handler")
(root/'MedLex.html').write_text(s)
exec((root/'work/expand.py').read_text())
