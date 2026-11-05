# usage: python lib/timeline.py <proj>   (script.json lines may carry "pre" and "post" gaps in seconds)
import json,sys
P=sys.argv[1]; D=json.load(open(f'{P}/vo/durations.json')); S=json.load(open(f'{P}/script.json'))
t=0; scenes=[]
for x in S:
    pre=x.get('pre',0.3); post=x.get('post',0.35)
    t+=pre; scenes.append({'id':x['id'],'vo_start':round(t,3),'vo_end':round(t+D[x['id']],3),'start':round(t-pre,3),'text':x['text'],'voice':x['voice']}); t+=D[x['id']]+post
for i,s in enumerate(scenes): s['end']=scenes[i+1]['start'] if i+1<len(scenes) else round(t,3)
json.dump({'total':round(t+0.6,3),'scenes':scenes},open(f'{P}/timeline.json','w'),indent=1)
print(' '.join(f"{s['id']}@{s['start']}" for s in scenes),'total',round(t+0.6,2))
