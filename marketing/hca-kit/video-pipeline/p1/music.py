import sys, json, numpy as np, soundfile as sf
sys.path.insert(0,'lib'); from synth import *
np.random.seed(7)
T=json.load(open('p1/timeline.json')); total=T['total']; sc={s['id']:s for s in T['scenes']}
L=int((total+1)*SR); mus=np.zeros(L)
BPM=90; beat=60/BPM; bar=4*beat
prog=['Am','F','C','G']; prog_cta=['F','G','Am','C']
def sec(a,b,progression,kick_on,arp_on,bright,padvol=0.11,arpvol=0.13):
    t=a; i=0
    while t<b-0.05:
        d=min(bar,b-t); notes,root=chord(progression[i%len(progression)],3)
        place(mus,pad([n+12 for n in notes],d+0.6,bright,padvol),t)
        place(mus,sub(root-12,d,0.11),t)
        for k in range(8):
            tt=t+k*beat/2
            if tt>=b: break
            if arp_on: place(mus,pluck(notes[k%len(notes)]+24+(12 if k in (3,7) else 0),0.5,arpvol),tt)
            if kick_on and k in (0,4): place(mus,kick(0.32),tt)
            if kick_on and k in (2,6): place(mus,snap(0.07),tt)
            if arp_on: place(mus,hat(0.025 if k%2 else 0.04),tt)
        t+=bar; i+=1
# intro: tense pad, swell to impact under the hook number
hookN=sc['hook']
for k,c in enumerate(['Am','Am','F']):
    notes,root=chord(c,3); place(mus,pad([n+12 for n in notes],bar+0.6,700,0.10),k*bar); place(mus,sub(root-12,bar,0.10),k*bar)
place(mus,sfx_rise(2.2,0.10),hookN['vo_start']+2.0)
place(mus,sfx_impact(0.35),hookN['vo_start']+4.25)
g0=sc['reveal']['start']; g1=sc['ledger']['start']; g2=sc['cta']['start']
sec(bar*3,g0,['F'],False,False,800,0.09)
sec(g0, sc['inputs']['start'], prog, False, True, 1400)
sec(sc['inputs']['start'], g1, prog, True, True, 1800)
sec(g1, g2, prog, False, True, 1500, 0.10, 0.11)
place(mus,sfx_rise(1.5,0.08),g2-1.5)
sec(g2, total, prog_cta, True, True, 2200, 0.12, 0.14)
# final chord ring + bells
notes,root=chord('Cadd9',3); place(mus,pad([n+12 for n in notes],4,2000,0.12),total-3.2)
for k,m in enumerate([72,76,79,84]): place(mus,bell(m,2.5,0.06),total-3.2+k*0.12)
mus=mus[:int(total*SR)]
fade=int(2.0*SR); mus[-fade:]*=np.linspace(1,0,fade)**1.5
mus/=np.max(np.abs(mus))+1e-9; mus*=0.8
sf.write('p1/music.wav',mus,SR); print('music',len(mus)/SR)
