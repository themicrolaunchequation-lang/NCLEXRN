"""Original music and sound effects, synthesised from scratch (no samples, no third-party audio)."""
import numpy as np
SR = 44100
def t_(d): return np.arange(int(d*SR))/SR
def env(n, a, r, sus=1.0):
    e = np.ones(n)*sus; A=min(int(a*SR), n//2); R=min(int(r*SR), n-A)
    if A: e[:A] = np.linspace(0, sus, A)
    if R: e[-R:] *= np.linspace(1, 0, R)
    return e
def lp(x, cut):  # one-pole low-pass
    a = np.exp(-2*np.pi*cut/SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = (1-a)*x[i] + a*s; y[i] = s
    return y
def lp_fast(x, cut):
    # vectorised approx via FFT
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1/SR)
    X *= 1/np.sqrt(1+(f/cut)**4); return np.fft.irfft(X, len(x))
def hz(m): return 440*2**((m-69)/12)
NOTES = {'Bb':10,'Eb':3,'Ab':8,'Db':1,'Gb':6,'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
def chord(name, octave=4):
    q = {'':[0,4,7], 'm':[0,3,7], 'maj7':[0,4,7,11], 'm7':[0,3,7,10], 'add9':[0,4,7,14], 'sus2':[0,2,7], 'sus4':[0,5,7]}
    root = name[0] + (name[1] if len(name)>1 and name[1] in '#b' else ''); kind = name[len(root):]
    r = 12*(octave+1) + NOTES[root]; return [r+i for i in q[kind]], r
def pad(notes, d, bright=1200, vol=0.12):
    x = np.zeros(int(d*SR)); tt = t_(d)
    for m in notes:
        for det in (-0.09, 0, 0.11):
            f = hz(m+det*0.1)*(1+det*0.004)
            ph = np.random.rand()*6.28
            x += (np.sin(2*np.pi*f*tt+ph) + 0.35*np.sin(4*np.pi*f*tt+ph) + 0.15*np.sin(6*np.pi*f*tt+ph))
    x = lp_fast(x, bright); x *= env(len(x), min(0.9,d/3), min(1.2,d/3))
    return x/ (len(notes)*3) * vol * 3
def pluck(m, d=0.6, vol=0.18, tone=1.0):
    tt = t_(d); f = hz(m)
    x = (np.sin(2*np.pi*f*tt) + 0.5*np.sin(4*np.pi*f*tt)*np.exp(-tt*9*tone) + 0.25*np.sin(6*np.pi*f*tt)*np.exp(-tt*14))
    return x*np.exp(-tt*5.5)*vol*env(len(tt),0.004,0.05)
def bell(m, d=1.6, vol=0.12):
    tt=t_(d); f=hz(m)
    x=np.sin(2*np.pi*f*tt)*np.exp(-tt*2.2)+0.4*np.sin(2*np.pi*f*2.76*tt)*np.exp(-tt*4)+0.2*np.sin(2*np.pi*f*5.4*tt)*np.exp(-tt*7)
    return x*vol*env(len(tt),0.003,0.1)
def kick(vol=0.5):
    tt=t_(0.35); f=50+90*np.exp(-tt*28); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-tt*9)*vol
def hat(vol=0.05, d=0.06):
    n=np.random.randn(int(d*SR)); n=n-lp_fast(n,7000); return n*np.exp(-t_(d)*60)*vol
def snap(vol=0.12):
    n=np.random.randn(int(0.18*SR)); n=lp_fast(n,5000)-lp_fast(n,900); tt=t_(0.18)
    return (n*np.exp(-tt*22)+0.3*np.sin(2*np.pi*190*tt)*np.exp(-tt*30))*vol
def sub(m, d, vol=0.16):
    tt=t_(d); return np.sin(2*np.pi*hz(m)*tt)*env(len(tt),0.02,0.15)*vol
def place(buf, x, at):
    i=int(at*SR)
    if i>=len(buf): return
    n=min(len(x), len(buf)-i); buf[i:i+n]+=x[:n]
# ---------- effects ----------
def sfx_whoosh(d=0.7, up=True, vol=0.35):
    n=np.random.randn(int(d*SR)); tt=t_(d)
    X=np.fft.rfft(n); out=np.zeros(len(n))
    # sweep: crossfade a few band-passed copies
    bands=[(300,900),(800,2200),(2000,5000),(4000,9000)]
    if not up: bands=bands[::-1]
    seg=len(n)//len(bands)
    for k,(lo,hi) in enumerate(bands):
        f=np.fft.rfftfreq(len(n),1/SR); m=((f>lo)&(f<hi)).astype(float); b=np.fft.irfft(X*m,len(n))
        w=np.exp(-((np.arange(len(n))-(k+0.5)*seg)/(seg*0.9))**2); out+=b*w
    e=np.sin(np.pi*np.clip(tt/d,0,1))**1.5
    return out/np.max(np.abs(out)+1e-9)*e*vol
def sfx_click(vol=0.25):
    tt=t_(0.04); return (np.random.randn(len(tt))*0.5+np.sin(2*np.pi*2400*tt))*np.exp(-tt*180)*vol
def sfx_key(vol=0.12):
    tt=t_(0.03); n=lp_fast(np.random.randn(len(tt)),4000); return n*np.exp(-tt*220)*vol*np.random.uniform(.7,1.1)
def sfx_pop(vol=0.3):
    tt=t_(0.16); f=900*np.exp(-tt*16)+300; ph=2*np.pi*np.cumsum(f)/SR; return np.sin(ph)*np.exp(-tt*22)*vol
def sfx_chime(vol=0.22):
    out=np.zeros(int(2.0*SR)); place(out,bell(84,1.8,vol),0); place(out,bell(88,1.6,vol*0.8),0.09); place(out,bell(91,1.5,vol*0.7),0.18); return out
def sfx_rise(d=1.6, vol=0.25):
    tt=t_(d); f=200*2**(tt/d*2.5); ph=2*np.pi*np.cumsum(f)/SR
    n=lp_fast(np.random.randn(len(tt)),3000)*0.4
    return (np.sin(ph)*0.5+n)*(tt/d)**2*vol
def sfx_impact(vol=0.45):
    tt=t_(1.4); f=45+60*np.exp(-tt*10); ph=2*np.pi*np.cumsum(f)/SR
    n=lp_fast(np.random.randn(len(tt)),1200)*np.exp(-tt*6)*0.5
    return (np.sin(ph)*np.exp(-tt*3)+n)*vol
