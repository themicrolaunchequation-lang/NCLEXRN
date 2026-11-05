import json,sys,soundfile as sf,numpy as np
from kokoro_onnx import Kokoro
d=sys.argv[1]; k=Kokoro('kokoro-v1.0.onnx','voices-v1.0.bin')
S=json.load(open(f'{d}/script.json')); out={}
for x in S:
    s,sr=k.create(x['text'],voice=x['voice'],speed=x['speed'],lang=x['lang'])
    # trim silence
    a=np.abs(s); idx=np.where(a>0.01)[0]; s=s[max(0,idx[0]-int(.03*sr)):idx[-1]+int(.08*sr)]
    sf.write(f"{d}/vo/{x['id']}.wav",s,sr); out[x['id']]=round(len(s)/sr,3)
json.dump(out,open(f'{d}/vo/durations.json','w'),indent=1); print(out, sum(out.values()))
