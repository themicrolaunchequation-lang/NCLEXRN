#!/usr/bin/env python3
"""assemble.py <app> <fmt> [--disclaimer]  -> out/<app>-<fmt>.mp4 : video from screencast frames + mixed original audio."""
import json, sys, os, subprocess, re, numpy as np
SR=44100
HERE=os.path.dirname(os.path.abspath(__file__)); SITE='/home/user/nclexrn/site'
app,fmt=sys.argv[1],sys.argv[2]; disc='--disclaimer' in sys.argv
W=f'{HERE}/work/{app}-{fmt}'; meta=json.load(open(W+'/meta.json'))
S=meta['S']; d0=meta['d0']; open_ms=meta['open']
fr=meta['frames']; n=len(fr)
virt=[(t*1000-d0)*S+d0 for t in fr]            # frame times in the page's slowed clock (ms)
i0=next(i for i,v in enumerate(virt) if v>=open_ms)   # first frame at/after the tour opened
rel=[max(0,(v-open_ms)/1000) for v in virt[i0:]]
total=rel[-1]+0.5
print('frames',n-i0,'video secs',round(total,1))
# ---------- video list (variable frame durations) ----------
with open(W+'/list.txt','w') as f:
    for k in range(i0,n):
        dur=(rel[k-i0+1]-rel[k-i0]) if k+1<n else 0.5
        f.write(f"file 'f/{k:06d}.jpg'\nduration {max(dur,0.001):.4f}\n")
    f.write(f"file 'f/{n-1:06d}.jpg'\n")
# ---------- audio mix ----------
cache={}
def dec(url):
    p=re.sub(r'^https?://[^/]+','',url)
    path=SITE+p
    if path not in cache:
        out=subprocess.run(['ffmpeg','-v','error','-i',path,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True).stdout
        cache[path]=np.frombuffer(out,dtype='<f4').reshape(-1,2)
    return cache[path]
ev=sorted(meta['ev'],key=lambda e:e['t'])
cur={}; segs=[]; vols={}
def close(i,t):
    s=cur.pop(i,None)
    if s: s['t1']=t; segs.append(s)
for e in ev:
    i=e['id'];k=e['k']
    if k=='play':
        close(i,e['t']); cur[i]=dict(id=i,src=e['src'],t0=e['t'],ct0=e['ct']); vols.setdefault(i,[]).append((e['t'],e['vol']))
    elif k=='volumechange': vols.setdefault(i,[]).append((e['t'],e['vol']))
    elif k in('pause','ended'): close(i,e['t'])
end_ms=open_ms+total*1000
for i in list(cur): close(i,end_ms)
# the tour pauses its closing line at the end card: play it in full, keep the music going, end just after it
tp=[s for s in segs if '/assets/audio/tour/' in s['src']]
lv=max(tp,key=lambda s:s['t0']); fl=len(dec(lv['src']))/SR
lv['t1']=lv['t0']+fl*1000
end_ms=min(open_ms+total*1000,lv['t0']+(fl+2.2)*1000); total=(end_ms-open_ms)/1000
for s in segs:
    if '/music/' in s['src']: s['t1']=end_ms
print('trimmed video secs',round(total,1))
N=int(total*SR)+SR
mix=np.zeros((N,2),np.float32)
for s in segs:
    if not re.search(r'/assets/audio/',s['src']): continue
    a=dec(s['src']); 
    if len(a)==0: continue
    start=(s['t0']-open_ms)/1000; dur=(s['t1']-s['t0'])/1000
    if dur<=0 or start+dur<0: continue
    ct0=s['ct0']; idx0=int(ct0*SR); cnt=int(dur*SR)
    idx=(idx0+np.arange(cnt))%len(a) if '/music/' in s['src'] else np.arange(idx0,idx0+cnt)
    if '/music/' not in s['src']: idx=idx[idx<len(a)]
    chunk=a[idx]
    pos=int(start*SR)
    if '/music/' in s['src']:
        vv=vols.get(s['id'],[]); tt=np.array([v[0] for v in vv]); vl=np.array([v[1] for v in vv])
        tsamp=s['t0']+np.arange(len(chunk))/SR*1000
        env=np.interp(tsamp,tt,vl).astype(np.float32); chunk=chunk*env[:,None]
    else:
        vol=vols.get(s['id'],[(0,1)])
        # use the volume logged when this segment started
        vsel=[v for v in vol if v[0]<=s['t0']+1]; chunk=chunk*(vsel[-1][1] if vsel else 1.0)
    a0=max(0,pos); b0=a0+len(chunk)-(a0-pos)
    c=chunk[(a0-pos):]
    m=min(len(c),N-a0); 
    if m>0: mix[a0:a0+m]+=c[:m]
pk=np.abs(mix).max(); print('peak',round(float(pk),2))
if pk>0.95: mix*=0.95/pk
_f=int(1.5*SR); _e=int(total*SR); mix[_e-_f:_e]*=np.linspace(1,0,_f)[:,None]; mix[_e:]=0
# fade out the last 0.8 s
fo=int(0.8*SR); mix[-fo-SR:][:fo]=mix[-fo-SR:][:fo]*np.linspace(1,0,fo)[:,None] if False else mix[-fo-SR:][:fo]
wav=W+'/mix.wav'
import wave
with wave.open(wav,'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
# ---------- encode ----------
os.makedirs(HERE+'/out',exist_ok=True)
out=f'{HERE}/out/{app}-{fmt}.mp4'
tw,th=(1920,1080) if fmt=='wide' else (1080,1920)
vf=f"fps=30,scale={tw}:{th}:flags=lanczos,format=yuv420p"
if disc:
    png=f'{HERE}/disclaimer-{fmt}.png'
    vf=f"fps=30,scale={tw}:{th}:flags=lanczos[v];[v][2:v]overlay=0:H-h,format=yuv420p"
cmd=['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',W+'/list.txt','-i',wav]
if disc: cmd+=['-i',png,'-filter_complex',vf]
else: cmd+=['-vf',vf]
cmd+=['-c:v','libx264','-preset','medium','-crf','20','-r','30','-c:a','aac','-b:a','160k','-t',f'{total:.2f}','-movflags','+faststart',out]
subprocess.run(cmd,check=True)
print('wrote',out,round(os.path.getsize(out)/1e6,1),'MB')
