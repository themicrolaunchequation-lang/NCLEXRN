import json,sys; P=sys.argv[1]
tl=json.load(open(f'{P}/timeline.json')); m=json.load(open(f'{P}/cap/meta.json'))
open(f'{P}/data.js','w').write('window.TL='+json.dumps(tl)+';window.META='+json.dumps(m)+';')
