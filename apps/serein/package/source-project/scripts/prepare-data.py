from pathlib import Path
import json
r=Path(__file__).resolve().parents[1];s=json.loads((r/'source-content.json').read_text());assets=json.loads((r/'asset-map.json').read_text())
durations={'tide':[60,120,180,300],'box':[60,120,180,300],'ground':[],'release':[120],'desk':[90],'scan':[120,180,300],'fullrelease':[180,240,300],'handreset':[60,90],'shoulderreset':[60,90],'ankles':[60,120],'listen':[60,120,180],'pause3':[180],'quietplace':[120,180,300],'walk':[120,180,300],'winddown':[180,240,300]}
for p in s['practices']:
 p['durations']=durations[p['id']];p['defaultDuration']=p.get('seconds',p.get('originalPhases',{}).get('defaultSeconds',120));p['selfPaced']=p['id']=='ground'
 p['position']='Walking' if p['id']=='walk' else 'Seated';p['breathFocus']=p['category']=='Breathing';p['movement']=p['category']=='Movement'
 if not p.get('steps'):
  phases=p['originalPhases']
  if p['id']=='ground':p['steps']=[[x['title'],x['line']+' '+x['hint']] for x in s['groundSteps']]
  elif p['id']=='release':p['steps']=[[x['title'],x['releaseCue']] for x in phases['phases']]
  else:p['steps']=[[x['title'],x['cue']] for x in phases['phases']]
 p['photoPlan']=p.get('photoPhasePlan',[])
 if p['id']=='desk':p['photoPlan']=[['shoulders',1],['hands',1],['shoulders',3]]
 if p['id']=='release':p['photoPlan']=[['hands',3],['shoulders',3],['feet',3],['release',3]]
 if p['id']=='ground':p['photoPlan']=[['awareness',min(i,3)] for i in range(5)]
 p['photo']=assets['images'][p['image']]
 if p['photoPlan']:
  key,idx=p['photoPlan'][0];p['photo']=assets['frames'][key][idx]
 p['desc']=p['desc'].replace('with a moving body guide','at your own pace').replace('Trace a steady square, one phase at a time.','Follow a steady rhythm, one phase at a time.')
resources=s['resources']
images={'reset':'breathing','compassion':'support','grounding':'grounding','sleep':'recovery','reflection':'reflection','checkins':'reflection','ask-support':'support','shift-home':'recovery','boundaries':'support','peer-check':'support','priorities':'team','difficult-talk':'support','small-win':'reflection','manager-support':'team'}
for x in resources:
 x['image']=assets['images'][images[x['id']]]
 if x['id']=='checkins':
  x.update(title='A check-in starts a conversation',category='Practitioner care',label='PERSONAL AWARENESS',desc='Notice your experience without turning it into a score.',body='A personal check-in captures a moment in your own words. Feelings change with context; no label can describe your whole experience.',steps=['Choose the feeling that fits this moment, or skip the check-in.','Add context only if useful. Keep it free of patient names and identifying details.','Decide whether to keep the entry for this visit or save it in your browser.','Use your own words to notice what support or practical change would help.'],extra='Serein does not interpret check-ins as a diagnosis, risk assessment, or a measure of professional performance.')
 x['category']='Shared practice' if x['category']=='Patient tools' else x['category']
data={'practices':s['practices'],'resources':resources,'reflections':s['reflections'],'moments':s['momentChoices'],'sources':s['sources'],'images':assets['images'],'frames':assets['frames'],'descriptions':s['imageDescriptions'],'groundSteps':s['groundSteps']}
(r/'dist/data.js').write_text('globalThis.SEREIN_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print('Prepared',len(data['practices']),'practices and',len(resources),'guides')
