s=(root/'MedLex.html').read_text()
s=s.replace("${m.classroom.map((a,i)=>activityCard(a,i,m,'classroom')).join('')}</div>","${m.classroom.map((a,i)=>activityCard(a,i,m,'classroom')).join('')}${classroomSupport(m)}</div>",1)
s=s.replace('</style>' ,(root/'work/workspace.css').read_text()+'\n'+(root/'work/phase0.css').read_text()+'\n'+(root/'work/language-help.css').read_text()+'\n'+(root/'work/audio-visual.css').read_text()+'\n</style>',1)
# Build complete offline glosses in the same language-index order used by the UI.
import json
rows=[row.split('|') for row in (root/'work/language-help/glosses.txt').read_text().splitlines() if row]
extra_languages=['pt','hi','ur','bn','zh-CN','de','ru','id','ja','ko','tr','sw']
for code in extra_languages:
 lines=(root/'work/language-help'/f'{code}.txt').read_text().splitlines()
 assert len(lines)==len(rows),(code,len(lines),len(rows))
 for row,line in zip(rows,lines):
  assert line.strip(),code
  row.append(line)
glosses=json.dumps({row[0]:row[1:] for row in rows},ensure_ascii=False,separators=(',',':'))
guides=json.dumps(json.loads((root/'work/language-help/extra-guides.json').read_text()),ensure_ascii=False,separators=(',',':'))
extra_guides="const EXTRA_LANGUAGE_GUIDES="+guides+";for(const [code,strings]of Object.entries(EXTRA_LANGUAGE_GUIDES)){['prefix','root','suffix','vowel','precise','everyday','fictional'].forEach((key,i)=>{MEANING_GUIDES[key][ASSIST_LANGUAGES[code].index+2]=strings[i]})}"
extra_js='\n'.join((root/'work'/file).read_text() for file in ['workspace.js','worksheet.js','search.js','shell-tools.js','language-help.js','voice-tools.js','term-visuals.js'])+'\nconst WORD_PART_GLOSSES='+glosses+';\n'+extra_guides+'\n'
s=s.replace('for(const [type,handlers]of Object.entries(eventHandlers))',extra_js+'for(const [type,handlers]of Object.entries(eventHandlers))',1)

# Reuse visual symbols in learning cards; assessment prompts stay unchanged.
s=s.replace('<span class="tag">${esc(chapter(t.chapter).name)}</span><h3>', '<span class="tag">${esc(chapter(t.chapter).name)}</span><span class="term-card-symbol" aria-hidden="true">${termVisualIcon(t)}</span><h3>')
# Fix original template chrome without changing any educational record.
s=re.sub(r'<button[^>]*class="workspace"[^>]*>.*?</button>', '',s,count=1,flags=re.S)
s=s.replace('id="profileInitial"','id="profileInitial" aria-haspopup="dialog"')
s=s.replace('data-action="profile" id="profileInitial"','data-action="account" id="profileInitial"')
s=s.replace('id="profileInitial" data-action="profile"','id="profileInitial" data-action="account"')
s=s.replace('Got it schedules a return in 1, 3, then 7 days; Review again keeps a word due.', 'Rate each recall Again, Hard, Good or Easy. The next interval appears on each button and adapts to your review history.')
s=s.replace('Got it schedules a return in 1, 3, then 7 days. Review again keeps a word due.', 'Rate each recall Again, Hard, Good or Easy. Each button shows the actual next interval.')
s=re.sub(r'font-size:\s*(\d*\.?\d+)rem', lambda m:'font-size:'+str(max(.875,float(m[1])))+'rem',s)
s=re.sub(r'font-size:\s*(\d*\.?\d+)px',lambda m:'font-size:'+str(max(14,float(m[1]))).removesuffix('.0')+'px',s)
s=s.replace('“Got it” schedules a return in 1, 3, then 7 days; “Review again” keeps a word due.', 'Rate each recall Again, Hard, Good or Easy. Each button shows the next interval, adapted to your review history.')
s=s.replace('function exportProgress(){saveV3();','function exportProgress(){try{saveV3()}catch(e){storageState.error=e.name;storageState.dirty=true}')
# Task-sized word detail: wide dialog, explicit hover/tap help and optional bilingual glosses.
a=s.index('function openTerm(');b=s.index('\n',a);s=s[:a]+(root/'work/term-detail.js').read_text()+s[b:]
s=s.replace("function showModal(html,eyebrow='EXPLORE & UNDERSTAND'){","function showModal(html,eyebrow='EXPLORE & UNDERSTAND'){hideMeaningTip();modal.classList.toggle('term-dialog',html.includes('class=\"term-detail\"'));")
s=s.replace('function closeModal(){modal.close();','function closeModal(){hideMeaningTip();stopEnglishAudio();modal.classList.remove(\"term-dialog\");modal.close();')
# The word lab shares the same precise, bilingual word-part tips.
s=s.replace("break}case'libfilter':","$('#labPartDetail').insertAdjacentHTML('beforeend',translatedLine(partTranslation(p)));break}case'libfilter':",1)
s=s.replace('title=\"${p.type}: ${esc(p.meaning)}\"','')
# Canonical module renderer from its readable feature file.
a=s.index('function renderModule(');b=s.index('\n',a);s=s[:a]+(root/'work/module-page.js').read_text()+s[b:]
(root/'MedLex.html').write_text(s)
print('Workspace release bytes',len(s.encode()))
# Subset HCA faces to the supplied app glyphs and Latin-1; preserve original outlines.
import re,base64
face_index=0
def replace_face(m):
 global face_index
 p=root/'work/font-subsets'/f'face-{face_index}.woff2';face_index+=1
 return 'data:font/woff2;base64,'+base64.b64encode(p.read_bytes()).decode()
s=re.sub(r'data:font/woff2;base64,[A-Za-z0-9+/=]+',replace_face,s)
(root/'MedLex.html').write_text(s)
import subprocess
subprocess.run(['node',str(root/'work/minify.cjs')],cwd=root,check=True)
