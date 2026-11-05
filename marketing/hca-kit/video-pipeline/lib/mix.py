# usage: python lib/mix.py <proj> <fmt>  -> <proj>/mix-<fmt>.wav (voices + ducked music + effects)
import sys, json, numpy as np, soundfile as sf
sys.path.insert(0,'lib'); from synth import *
proj, fmt = sys.argv[1], sys.argv[2]
T=json.load(open(f'{proj}/timeline.json')); total=T['total']; N=int(total*SR)
vo=np.zeros(N); voice_mask=np.zeros(N)
for s in T['scenes']:
    x,sr=sf.read(f"{proj}/vo/{s['id']}.wav");
    if x.ndim>1: x=x.mean(1)
    if sr!=SR: x=np.interp(np.arange(int(len(x)*SR/sr))*sr/SR, np.arange(len(x)), x)
    i=int(s['vo_start']*SR); n=min(len(x),N-i); vo[i:i+n]+=x[:n]*0.95; voice_mask[i:i+n]=1
mus,_=sf.read(f'{proj}/music.wav'); mus=mus[:N] if len(mus)>=N else np.pad(mus,(0,N-len(mus)))
# ducking envelope: music at -14 dB under the voice, smooth 0.25 s attack / 0.5 s release
k=int(0.02*SR); m=np.convolve(voice_mask,np.ones(k)/k,'same')
g=np.empty(N); cur=1.0
att=1-np.exp(-1/(0.12*SR)); rel=1-np.exp(-1/(0.45*SR))
for i in range(0,N,64):
    tgt=0.30 if m[i]>0.05 else 1.0
    a=att if tgt<cur else rel
    cur=cur+(tgt-cur)*(1-(1-a)**64); g[i:i+64]=cur
music=mus*g*0.55
fx=np.zeros(N); E=json.load(open(f'{proj}/events-{fmt}.json'))
np.random.seed(3)
gen={'click':lambda:sfx_click(0.22),'key':lambda:sfx_key(0.10),'pop':lambda:sfx_pop(0.20),'chime':lambda:sfx_chime(0.16),'whoosh':lambda:sfx_whoosh(0.55,True,0.16),'whoosh_big':lambda:sfx_whoosh(0.9,True,0.28)}
for kind,t in E:
    if t is None or t<0: continue
    if kind=='key':
        for j in range(3): place(fx, gen['key'](), t+j*0.06)
    else: place(fx, gen[kind](), t)
mix=vo+music+fx
st=np.stack([mix*0.98+np.roll(music,int(.011*SR))*0.02, mix],1)  # tiny width on the music
pk=np.max(np.abs(st)); st=st/pk*0.9 if pk>0.98 else st
sf.write(f'{proj}/mix-{fmt}.wav',st,SR); print('mix',fmt,round(total,2),'s')
