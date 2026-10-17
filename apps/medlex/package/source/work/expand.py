import re,json,collections
s=(root/'MedLex.html').read_text()
# Add independent studio routes to the unified router.
s=s.replace("const match=path.match(/^learn", "const studio=path.match(/^studio(?:\\/(.*))?$/);const match=path.match(/^learn")
s=s.replace("route=sheet?'worksheet':match?'module':", "route=sheet?'worksheet':studio?'studio':match?'module':")
s=s.replace("const group=route==='module'?", "const group=route==='studio'?(['educator','portfolio','editor'].includes(studio?.[1])?'toolkit':'library'):route==='module'?")
s=s.replace("const title=({home:", "const title=route==='studio'?(STUDIO_INFO[studio?.[1]]||STUDIO_INFO.hub).title:({home:")
s=s.replace("if(route==='module'){moduleTab=", "if(route==='studio'){renderStudio(studio?.[1]||'hub')}else if(route==='module'){moduleTab=")
s=s.replace("quiz=null;flash=null;exercise=null;special=null;setNav(false)", "stopRecording();adaptiveRun=null;quiz=null;flash=null;exercise=null;special=null;setNav(false)")
# Profiles connect the preserved source to editorial overlays and learning evidence.
a=s.index('function openTerm(');b=s.index('\n',a);line=s[a:b];line=line[:-1]+";modalContent.insertAdjacentHTML('beforeend',termEnrichment(id))}";s=s[:a]+line+s[b:]
# Original source records remain unchanged; events record objective responses separately.
s=s.replace("quiz.selection=i;trackItem();", "quiz.selection=i;recordLearning(quiz.items[quiz.index].term,quiz.mode==='context'?'context':'meaning',quiz.items[quiz.index].answers[i].correct,{source:'practice-quiz'});trackItem();")
s=s.replace("e.answered=true;if(right)e.score++;", "e.answered=true;recordLearning(q.term,e.mode==='components'?'components':e.mode==='spelling'?'spelling':e.mode==='classify'?'context':'meaning',right,{source:'module-'+e.mode});trackItem();if(right)e.score++;")
s=s.replace("state.reviews[t.id]=r;if(rating", "state.reviews[t.id]=r;recordLearning(t.id,'recall',rating>=3,{objective:false,source:'self-rated-recall'});if(rating")
s=s.replace("if(s.correct)s.score++;else s.wrong.push(t.id);trackItem();", "recordLearning(t.id,s.mode==='spell'?'spelling':'meaning',s.correct,{source:s.mode});if(s.correct)s.score++;else s.wrong.push(t.id);trackItem();")
s=s.replace("case'checkbuild':build.checked=true;if(build.chosen.every((n,i)=>n===i))build.score++;", "case'checkbuild':build.checked=true;recordLearning(build.terms[build.index].id,'components',build.chosen.every((n,i)=>n===i),{source:'build-a-word'});if(build.chosen.every((n,i)=>n===i))build.score++;")
# Discoverable destinations, keeping six primary navigation groups.
s=s.replace('href="#explore/terms" data-page="library"','href="#studio/hub" data-page="library"')
s=s.replace("[['terms','Terms'],['elements','Word elements'],['lab','Word lab']]", "[['../studio/hub','Studios'],['terms','Terms'],['elements','Word elements'],['lab','Word lab']]")
s=s.replace('href="#explore/${r}"','href="${r===\'../studio/hub\'?\'#studio/hub\':\'#explore/\'+r}"')
s=s.replace("if(route==='progress'){enhanceProgress();renderActivity()}", "if(route==='progress'){enhanceProgress();renderActivity();main.insertAdjacentHTML('afterbegin',studioProgress())}")
s=s.replace("if(route==='practice'){enhancePractice();addPracticeModes();}", "if(route==='practice'){enhancePractice();addPracticeModes();main.insertAdjacentHTML('afterbegin',studioCallout())}")
s=s.replace("if(route==='wordlab')$('.surface')", "if(route==='home')main.querySelector('.quick-grid')?.insertAdjacentHTML('beforebegin',studioCallout());if(route==='toolkit')main.insertAdjacentHTML('afterbegin',studioTools());if(route==='wordlab'){enhanceWordLab()}if(route==='wordlab')$('.surface')")
s=s.replace("fixHeadings()}\nfunction applyLearnView", "applyReading();fixHeadings()}\nfunction applyLearnView")
s=s.replace("if(route==='toolkit'){", "if(route==='toolkit'){")
# Recover reading controls after preferences changes.
s=s.replace("function applyPreferences(){", "function applyPreferences(){")
# Enrichment state is included in v3 exports/imports and reset by the existing full reset.
s=s.replace("v3.course;}","v3.course;}")
s=s.replace("if(!stored&&!existing)setTimeout(()=>showModal(`", "if(!stored&&!existing)setTimeout(()=>showModal(`")
# Additional domain validation for optional expansion records before restore.
s=s.replace("const d=x.data;if(!d.profile", "const d=x.data;if(d.expansion)validateExpansion(d.expansion);if(!d.profile")
# Store expansion JS before event handlers are registered (no function monkey-patches).
extra=(root/'work/advanced.js').read_text()+'''\n
function studioCallout(){return `<section class="studio-quick-access"><div><span class="eyebrow">YOUR NEXT LEVEL OF LEARNING</span><h2>Explore. Apply. Explain.</h2><p>Connect a system, its words, fictional notes and your own explanation.</p></div><div class="term-actions"><a class="btn primary" href="#studio/hub">Open interactive studios</a><a class="btn" href="#studio/adaptive">My adaptive pathway</a></div></section>`}
function studioTools(){return `<section class="surface"><h2>Teach, review and keep the evidence.</h2><div class="term-actions"><a class="btn primary" href="#studio/educator">Educator assignments</a><a class="btn" href="#studio/editor">Editorial review</a><a class="btn" href="#studio/portfolio">Evidence & encrypted backups</a></div>${readingControls()}</section>`}
function studioProgress(){const events=xp().events.filter(e=>e.objective),delayed=events.filter(e=>e.gapDays>=7);return `<section class="surface"><div class="section-head"><div><span class="eyebrow">EVIDENCE, NOT JUST COMPLETION</span><h2>Know what your progress means.</h2></div><a class="btn" href="#studio/portfolio">Inspect learning evidence</a></div><div class="data-facts"><div><strong>${state.learned.length}</strong><span>self-rated familiar</span></div><div><strong>${events.length}</strong><span>objective responses</span></div><div><strong>${delayed.length?Math.round(delayed.filter(e=>e.correct).length/delayed.length*100)+'%':'—'}</strong><span>accuracy after ≥7-day gap (${delayed.length} responses)</span></div></div><p class="access-note">Delayed recall uses the gap since the previous objective response in the same skill. It is not an estimate of clinical competence.</p></section>`}
function validateExpansion(x){if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Invalid studio records.');for(const [key,cap]of [['events',4000],['artifacts',500],['assignments',50]])if(!Array.isArray(x[key])||x[key].length>cap)throw Error('Invalid studio '+key+'.');for(const key of ['drafts','editorial','feedback','reading'])if(!x[key]||typeof x[key]!=='object'||Array.isArray(x[key]))throw Error('Invalid studio '+key+'.');for(const e of x.events)if(!e||!termBy(e.termId)||!Number.isFinite(e.at)||typeof e.correct!=='boolean'||typeof e.objective!=='boolean')throw Error('Invalid learning response.');for(const a of x.artifacts)if(!a||typeof a.id!=='string'||typeof a.title!=='string'||!Number.isFinite(a.date))throw Error('Invalid evidence item.');if(x.active&&(!Array.isArray(x.active.items)||x.active.items.length>20||!Number.isInteger(x.active.index)||x.active.index<0||x.active.index>=x.active.items.length))throw Error('Invalid saved session.');}
function enhanceWordLab(){const old=$('#labSelect');if(!old)return;const label=old.previousElementSibling;if(label?.tagName==='LABEL')label.remove();const wrapper=document.createElement('label');wrapper.className='wordlab-combo field';wrapper.innerHTML='<span>Search a word with curated components</span><input id="labCombo" list="labOptions" value="'+esc(termBy(labTerm).term)+'" autocomplete="off"><datalist id="labOptions">'+TERMS.filter(t=>t.parts.length&&t.parts.length<=6).map(t=>'<option value="'+esc(t.term)+'">'+esc(chapter(t.chapter).name)+'</option>').join('')+'</datalist>';old.replaceWith(wrapper)}
eventHandlers.change.push(e=>{if(e.target.id==='labCombo'){const t=TERMS.find(t=>t.parts.length&&t.term.toLowerCase()===e.target.value.trim().toLowerCase());if(t){labTerm=t.id;wordlab();enhanceWordLab()}else toast('Choose a term with curated components from the suggestions.')}});
'''
s=s.replace('for(const [type,handlers]of Object.entries(eventHandlers))',extra+'\nfor(const [type,handlers]of Object.entries(eventHandlers))',1)
s=s.replace('</style>',(root/'work/advanced.css').read_text()+'\n</style>',1)
# Lossless dictionary compression of repeated strings in the original extended-term table.
m=re.search(r'(<script type="application/json" id="extended-terms">)(.*?)(</script>)',s,re.S)
if m:
 rows=json.loads(m[2]);count=collections.Counter()
 def tally(v):
  if isinstance(v,str):count[v]+=1
  elif isinstance(v,list):
   for a in v:tally(a)
  elif isinstance(v,dict):
   for a in v.values():tally(a)
 tally(rows);dictionary=[v for v,n in count.items() if n>2 and len(v)>20];lookup={v:i for i,v in enumerate(dictionary)}
 def pack(v):
  if isinstance(v,str):return {'$':lookup[v]} if v in lookup else v
  if isinstance(v,list):return[pack(a) for a in v]
  if isinstance(v,dict):return{k:pack(a) for k,a in v.items()}
  return v
 data=json.dumps([dictionary,pack(rows)],ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
 s=s[:m.start(2)]+data+s[m.end(2):]
 s=s.replace("JSON.parse(document.getElementById('extended-terms').textContent).map(r=>", "unpackTermTable(JSON.parse(document.getElementById('extended-terms').textContent)).map(r=>")
 decode="function unpackTermTable([dictionary,rows]){const unpack=v=>Array.isArray(v)?v.map(unpack):v&&typeof v==='object'?(Object.keys(v).length===1&&Number.isInteger(v.$)?dictionary[v.$]:Object.fromEntries(Object.entries(v).map(([k,a])=>[k,unpack(a)]))):v;return unpack(rows)}\n"
 s=s.replace('TERMS.push(...unpackTermTable',decode+'TERMS.push(...unpackTermTable',1)
(root/'MedLex.html').write_text(s)
print('Expanded app bytes',len(s.encode()))
s=(root/'MedLex.html').read_text()
s=s.replace('aria-label="MedLex home"','aria-label="MedLex Healthcare Crown Academy home"').replace('<span class="hca-crest">','<span class="hca-crest" aria-hidden="true">')
s=s.replace('class="search-trigger" data-action="search"','class="search-trigger" data-action="search" aria-label="Search MedLex"')
s=s.replace('aria-label="About ${esc(h.title)}"','aria-label="Information about ${esc(h.title)}"')
s=s.replace("function applyPreferences(){", "function applyPreferences(){",1)
a=s.index('function applyPreferences(');b=s.index('\n',a);line=s[a:b];line=line[:-1]+";$('#profileInitial').setAttribute('aria-label',$('#profileInitial').textContent+' · Learning preferences')}";s=s[:a]+line+s[b:]
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
s=s.replace(' aria-label="MedLex Healthcare Crown Academy home"','')
s=s.replace('aria-label="Search MedLex"','aria-labelledby="searchTriggerLabel"')
s=s.replace('<span>⌕</span><span>Find a term, find clarity…</span><kbd>⌘ K</kbd>','<span aria-hidden="true">⌕</span><span id="searchTriggerLabel">Find a term, find clarity…</span><kbd aria-hidden="true">⌘ K</kbd>')
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
s=s.replace('aria-labelledby="searchTriggerLabel"','aria-labelledby="searchTriggerLabel searchKeyHint"')
s=s.replace('<span aria-hidden="true">⌕</span><span id="searchTriggerLabel">Find a term, find clarity…</span><kbd aria-hidden="true">⌘ K</kbd>','<svg class="search-glyph" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg> <span id="searchTriggerLabel">Find a term, find clarity…</span> <kbd id="searchKeyHint">⌘ K</kbd>')
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
s=s.replace("hub:{title:'Interactive studios'", "matching:{title:'Match Pairs Studio',what:'A five-pair board connecting terms with their companion meanings.',why:'Work through several distinct concepts in one visible workspace.',when:'After exploring definitions or as a short revision activity.',how:'Choose a term and then its meaning. Feedback records first-attempt accuracy and retries separately.',who:'All learners. This is objective terminology practice.'},\nhub:{title:'Interactive studios'",1)
s=s.replace("const STUDIO_ROUTES=['hub'", "const STUDIO_ROUTES=['matching','hub'",1)
s=s.replace("({hub:studioHub,adaptive:adaptivePage", "({matching:matchingPage,hub:studioHub,adaptive:adaptivePage",1)
s=s.replace("['clinical','explain','confusions','atlas','pronunciation','coding','educator','portfolio','editor'].map", "['clinical','explain','confusions','matching','atlas','pronunciation','coding','educator','portfolio','editor'].map",1)
s=s.replace("function startSpecial(mode){quiz=null", "function startSpecial(mode){if(mode==='match'){startPairs();return}quiz=null",1)
# New learners get a skippable, three-step setup. Existing records are not interrupted.
a=s.index('function initializeV3(');b=s.index('\n',a);line=s[a:b];at=line.find('if(!stored&&!existing)setTimeout(')
if at>=0:line=line[:at]+"if(!stored&&!existing)setTimeout(()=>startOnboarding(0),200)}";s=s[:a]+line+s[b:]
# Avoid repeating an existing context prompt within a short adaptive session.
s=s.replace("c=shuffle(cases.length?cases:CASES)[0]", "c=shuffle([...(cases.length?cases:CASES),...CASES].filter(c=>!items.some(q=>q.prompt===c.prompt)))[0]||CASES[0]")
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text().replace('>Match a meaning<','>Match pairs<')
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
# Keep focus within the learning task after question rendering.
a=s.index('function renderAdaptive(');b=s.index('\n',a);line=s[a:b];line=line[:-1]+";const focusTarget=s.answered?$('[data-advance=adaptiveNext]'):q.dimension==='spelling'?$('#adaptiveSpellingInput'):$('.adaptive-panel h2');if(focusTarget){if(focusTarget.tagName==='H2')focusTarget.tabIndex=-1;focusTarget.focus({preventScroll:true})}}";s=s[:a]+line+s[b:]
# Preserve import provenance and keep the most recent bounded evidence collection.
s=s.replace("xp().artifacts=xp().artifacts.slice(-500)","xp().artifacts=xp().artifacts.sort((a,b)=>b.date-a.date).slice(0,500)")
s=s.replace("${evidenceTitle(a)} · ${new Date(a.date).toLocaleString('en-AU')}","${evidenceTitle(a)}${a.importedFrom?' · Imported from '+esc(a.importedFrom):''} · ${new Date(a.date).toLocaleString('en-AU')}")
s=s.replace("<p>${new Date(a.date).toLocaleString('en-AU')}${a.score", "<p>${a.importedFrom?'Imported from '+esc(a.importedFrom)+' · ':''}${new Date(a.date).toLocaleString('en-AU')}${a.score")
# Optional assignment linkage in educator-entered feedback.
s=s.replace('<label class="field"><span>Educator / reviewer name and role</span>', '<label class="field"><span>Link feedback to an assignment · optional</span><select class="select" name="assignment"><option value="">No assignment selected</option>${xp().assignments.map(a=>`<option value="${a.id}" ${f.assignmentId===a.id?\'selected\':\'\'}>${esc(a.title)}</option>`).join(\'\')}</select></label><label class="field"><span>Educator / reviewer name and role</span>')
s=s.replace("xp().feedback[reviewArtifact]={reviewer:","xp().feedback[reviewArtifact]={assignmentId:String(f.get('assignment')||''),reviewer:")
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
s=s.replace("$('#globalSearch').setAttribute('aria-expanded','true')","$('#globalSearch').removeAttribute('aria-expanded')")
s=s.replace('<div class="session-segments" aria-label=', '<div class="session-segments" role="group" aria-label=')
s=s.replace(' aria-label="${flash.revealed?\'Hide\':\'Reveal\'} meaning of ${esc(t.term)}"','')
s=s.replace("const previous=JSON.stringify(v3);v3=blankV3()", "saveV3();const previous=JSON.stringify(v3);v3=blankV3()")
(root/'MedLex.html').write_text(s)
s=(root/'MedLex.html').read_text()
# Reports retain original course and quiz evidence alongside the new studios.
a=s.index('function portfolioReport(');b=s.index('\n',a);line=s[a:b]
line=line.replace("downloadText('MedLex-Learning-Evidence.html'", "body+=originalRecordReport();downloadText('MedLex-Learning-Evidence.html'")
s=s[:a]+line+s[b:]
extra='''
function originalRecordReport(){return `<section><h2>Original course and practice records</h2><p>Self-assessed outcomes: ${Object.values(course.outcomes).filter(Boolean).length}. Classroom / independent activities marked complete: ${Object.values(course.activities).filter(Boolean).length}. Completion and self-assessment are not automatic correctness scores.</p><h3>Module exercise records</h3><table><tr><th>Date</th><th>Module / mode</th><th>Evidence</th></tr>${course.attempts.map(a=>`<tr><td>${new Date(a.date).toLocaleDateString('en-AU')}</td><td>${esc(getModule(a.module).title)} · ${esc(a.mode)}</td><td>${a.mode==='case'?'Written reflection · human review<br>'+esc(a.reflection||''):a.score+'/'+a.total+' correct<br>'+esc((a.errors||[]).map(e=>e.prompt+': '+e.given+'; companion answer: '+e.correct).join('\\n'))}</td></tr>`).join('')}</table><h3>Practice session history</h3><table><tr><th>Date</th><th>Mode</th><th>Record</th></tr>${state.history.map(h=>`<tr><td>${new Date(h.date).toLocaleDateString('en-AU')}</td><td>${esc(h.mode||'Practice')}</td><td>${h.mode==='recall'?h.total+' self-rated recall cards':h.score+'/'+h.total+' correct'}</td></tr>`).join('')}</table></section>`}
'''
s=s.replace('for(const [type,handlers]of Object.entries(eventHandlers))',extra+'\nfor(const [type,handlers]of Object.entries(eventHandlers))',1)
(root/'MedLex.html').write_text(s)
# Complete the HCA serif family with true semibold and italic faces.
import base64
s=(root/'MedLex.html').read_text();faces=''
for filename,weight,style in [('playfair-display-latin-600-normal.woff2','600','normal'),('playfair-display-latin-400-italic.woff2','400','italic')]:
 data=base64.b64encode((root/'brand/HCA-Brand-Kit/03-fonts'/filename).read_bytes()).decode()
 faces+=f"@font-face{{font-family:Editorial;src:url(data:font/woff2;base64,{data}) format('woff2');font-weight:{weight};font-style:{style};font-display:swap}}"
s=s.replace('<style>','<style>'+faces,1)
# Lossless field-table representation for the two affix banks.
for name in ['PREFIXES','SUFFIXES']:
 m=re.search(r'^const '+name+r'=(.*);$',s,re.M)
 records=json.loads(m[1]);keys=list(records[0]);rows=[[r[k] for k in keys] for r in records]
 payload=json.dumps(rows,ensure_ascii=False,separators=(',',':'))
 code='const '+name+'='+payload+'.map(row=>Object.fromEntries('+json.dumps(keys)+'.map((key,i)=>[key,row[i]])));'
 s=s[:m.start()]+code+s[m.end():]
s=s.replace('</style>','h1,h2,h3,.modal-title,.card-heading{font-weight:400}.brand{font-weight:600}\n</style>',1)
(root/'MedLex.html').write_text(s)
print('Final expanded bytes',len(s.encode()))
s=(root/'MedLex.html').read_text()
icon=(root/'brand/HCA-Brand-Kit/01-logos/TEMPLATE-crest-letter-H.svg').read_text().replace('>H<','>M<')
s=re.sub(r'<link rel="icon"[^>]+>', '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,'+base64.b64encode(icon.encode()).decode()+'">',s,count=1)
s=s.replace('<meta name="theme-color" content="#f5f6ef">','<meta name="theme-color" content="#10253A">')
(root/'MedLex.html').write_text(s)
assert len(s.encode())<=1200000, 'Single-file performance size budget exceeded'
s=(root/'MedLex.html').read_text()
s=s.replace("totalAnswered=state.history.reduce", "totalAnswered=state.history.filter(h=>h.mode!=='recall').reduce")
s=s.replace("correct=state.history.reduce", "correct=state.history.filter(h=>h.mode!=='recall').reduce")
(root/'MedLex.html').write_text(s)
exec((root/'work/refine.py').read_text())
