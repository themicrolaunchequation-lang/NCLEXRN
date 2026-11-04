# Text to speech with Google Gemini (for Arabic). Usage: python vo_gemini.py <proj>   (reads <proj>/script.json; needs GEMINI_API_KEY)
# Same outputs as vo.py: <proj>/vo/<id>.wav (silence trimmed) and <proj>/vo/durations.json. Lines may carry "style" (an accent/delivery prompt).
import json,sys,os,base64,urllib.request,numpy as np,soundfile as sf,time
d=sys.argv[1]; KEY=os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
# No key in the environment: the session's network secret adds the x-goog-api-key header for us.
M=os.environ.get('GEMINI_TTS_MODEL','gemini-2.5-flash-preview-tts'); os.makedirs(f'{d}/vo',exist_ok=True); out={}
import urllib.error
prev=json.load(open(f'{d}/vo/durations.json')) if os.path.exists(f'{d}/vo/durations.json') else {}
for x in json.load(open(f'{d}/script.json')):
  if os.path.exists(f"{d}/vo/{x['id']}.wav"):
    out[x['id']]=prev.get(x['id']) or round(len(sf.read(f"{d}/vo/{x['id']}.wav")[0])/24000,3); continue
  txt=(f"### DIRECTOR'S NOTES\nStyle: {x['style']}. Pace: natural and lively, no pauses at the end.\n\n### TRANSCRIPT\n{x['text']}" if x.get('style') else x['text'])
  body={'contents':[{'parts':[{'text':txt}]}],'generationConfig':{'responseModalities':['AUDIO'],'speechConfig':{'voiceConfig':{'prebuiltVoiceConfig':{'voiceName':x['voice']}}}}}
  for a in range(8):
    try:
      r=urllib.request.urlopen(urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{M}:generateContent',data=json.dumps(body).encode(),headers=dict({'Content-Type':'application/json'},**({'x-goog-api-key':KEY} if KEY else {}))),timeout=120); break
    except Exception as e:
      if getattr(e,'code',0)==429:
        msg=e.read().decode()
        if 'per day' in msg or 'PerDay' in msg: sys.exit(f"{x['id']}: daily quota reached for {M}")
        print('per-minute limit, waiting 65 s'); time.sleep(65); continue
      if getattr(e,'code',0)==400: sys.exit(f"{x['id']}: HTTP 400 {e.read().decode()[:300]}")
      if a==3: raise
      time.sleep(2**(a+1))
  pcm=base64.b64decode(json.load(r)['candidates'][0]['content']['parts'][0]['inlineData']['data'])
  s=np.frombuffer(pcm,dtype='<i2').astype(np.float32)/32768; sr=24000
  if x.get('speed',1.0)!=1.0: pass  # speed is controlled through the style prompt for Gemini
  a=np.abs(s); idx=np.where(a>0.01)[0]; s=s[max(0,idx[0]-int(.03*sr)):idx[-1]+int(.08*sr)]
  sf.write(f"{d}/vo/{x['id']}.wav",s,sr); time.sleep(int(os.environ.get('TTS_GAP','25'))); out[x['id']]=round(len(s)/sr,3); print(x['id'],out[x['id']])
json.dump(out,open(f'{d}/vo/durations.json','w'),indent=1); print(out,sum(out.values()))
