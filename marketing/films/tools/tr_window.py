import json,base64,subprocess,sys
src,a,b=sys.argv[1],sys.argv[2],sys.argv[3]
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',src,'-ss',a,'-to',b,'voice/.w.wav'],check=True)
d=base64.b64encode(open('voice/.w.wav','rb').read()).decode()
open('voice/.q.json','w').write(json.dumps({'contents':[{'parts':[{'inlineData':{'mimeType':'audio/wav','data':d}},{'text':'Transcribe exactly. Output only the words.'}]}]}))
r=json.loads(subprocess.check_output(['curl','-s','-H','Content-Type: application/json','-H','x-goog-api-key: dummy','-d','@voice/.q.json','https://generativelanguage.googleapis.com/v1beta/models/'+__import__('os').environ.get('TR_MODEL','gemini-3.5-flash')+':generateContent']))
print(a,b,'|',r['candidates'][0]['content']['parts'][0]['text'].strip())
