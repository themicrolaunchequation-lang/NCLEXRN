import json
D=json.load(open('p1/vo/durations.json'))
S={x['id']:x for x in json.load(open('p1/script.json'))}
order=[('hook',0.35,0.45),('mgr1',0.3,0.35),('reveal',0.45,0.3),('inputs',0.2,0.35),('result',0.2,0.4),('payoff',0.3,0.4),('mgr2',0.15,0.45),('ledger',0.4,0.3),('studio',0.45,0.4),('cta',0.5,1.6)]
t=0; scenes=[]
for sid,pre,post in order:
    t+=pre; scenes.append({'id':sid,'vo_start':round(t,3),'vo_end':round(t+D[sid],3),'start':round(t-pre,3),'text':S[sid]['text'],'voice':S[sid]['voice']}); t+=D[sid]+post
for i,s in enumerate(scenes): s['end']=scenes[i+1]['start'] if i+1<len(scenes) else round(t,3)
total=round(t+0.6,3)
json.dump({'total':total,'scenes':scenes},open('p1/timeline.json','w'),indent=1)
for s in scenes: print(s['id'],s['start'],s['vo_start'],s['vo_end'],s['end'])
print('total',total)
