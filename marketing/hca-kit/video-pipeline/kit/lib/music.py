# usage: python lib/music.py <proj>   reads <proj>/music.json: {"bpm":90,"prog":["Am","F","C","G"],"cta":["F","G","Am","C"],"seed":7,"drums":true,"groove_from":"inputs","calm":["ledger","cta"],"reveal":"reveal","bright":1.0,"impact":[scene,offset]}
import sys, json, numpy as np, soundfile as sf
sys.path.insert(0,'lib'); from synth import *
P=sys.argv[1]; M=json.load(open(f'{P}/music.json')); np.random.seed(M.get('seed',7))
T=json.load(open(f'{P}/timeline.json')); total=T['total']; sc={s['id']:s for s in T['scenes']}
mus=np.zeros(int((total+1)*SR)); BPM=M.get('bpm',90); beat=60/BPM; bar=4*beat; B=M.get('bright',1.0); oc=M.get('oct',0)
def sec(a,b,prog,kick_on,arp_on,bright,padvol=0.11,arpvol=0.13,arp_rate=8):
    t=a; i=0
    while t<b-0.05:
        d=min(bar,b-t); notes,root=chord(prog[i%len(prog)],3+oc)
        place(mus,pad([n+12 for n in notes],d+0.6,bright*B,padvol),t); place(mus,sub(root-12,d,0.10),t)
        for k in range(arp_rate):
            tt=t+k*bar/arp_rate
            if tt>=b: break
            if arp_on: place(mus,pluck(notes[k%len(notes)]+24+(12 if k in (3,7) else 0),0.5,arpvol),tt)
            if kick_on and k in (0,arp_rate//2): place(mus,kick(0.30),tt)
            if kick_on and k in (arp_rate//4,3*arp_rate//4): place(mus,snap(0.06),tt)
            if arp_on and M.get('drums',True): place(mus,hat(0.022 if k%2 else 0.036),tt)
        t+=bar; i+=1
rev=sc[M.get('reveal','reveal')]['start']; g=sc[M['groove_from']]['start'] if M.get('groove_from') else None
c0,c1=(sc[M['calm'][0]]['start'], sc[M['calm'][1]]['start']) if M.get('calm') else (None,None); cta=sc['cta']['start']
intro=M.get('intro',['Am','Am','F','F']); t=0;i=0
while t<rev-0.05:
    d=min(bar,rev-t); notes,root=chord(intro[i%len(intro)],3+oc); place(mus,pad([n+12 for n in notes],d+0.6,700*B,0.10),t); place(mus,sub(root-12,d,0.09),t); t+=bar; i+=1
if M.get('impact'): s,o=M['impact']; place(mus,sfx_rise(2.0,0.09),sc[s]['vo_start']+o-2.0); place(mus,sfx_impact(0.32),sc[s]['vo_start']+o)
drums=M.get('drums',True); rate=M.get('arp',8)
pts=[rev]+([g] if g else [])+([c0,c1] if c0 else [])+[cta]; pts=sorted(set(pts))
for a,b in zip(pts,pts[1:]):
    calm = c0 is not None and a>=c0 and b<=c1
    sec(a,b,M['prog'], drums and g is not None and a>=g and not calm, True, (1500 if calm else 1800), 0.10, 0.11 if calm else 0.13, rate)
place(mus,sfx_rise(1.5,0.07),cta-1.5)
sec(cta,total,M.get('cta',M['prog']),drums,True,2200,0.12,0.14,rate)
notes,root=chord(M.get('final','Cadd9'),3+oc); place(mus,pad([n+12 for n in notes],4,2000,0.12),total-3.2)
for k,m in enumerate([72,76,79,84]): place(mus,bell(m+12*oc,2.5,0.06),total-3.2+k*0.12)
mus=mus[:int(total*SR)]; f=int(2.0*SR); mus[-f:]*=np.linspace(1,0,f)**1.5
mus/=np.max(np.abs(mus))+1e-9; sf.write(f'{P}/music.wav',mus*0.8,SR); print('music',round(total,1))
