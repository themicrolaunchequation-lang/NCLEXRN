"""Original background music and sound effects for the Healthcare Crown Academy tours.
Everything is synthesised from scratch with numpy (no samples), so the audio is original and free to use.
Each track is a seamless loop (~60 s) in the mood of its app."""
import numpy as np, subprocess, os, sys
SR = 32000
rng = np.random.default_rng(7)
OUT = '/home/user/NCLEXRN/site/assets/audio'

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def env(n, a, d, s=0.0, r=0.0, sus=None):
    """ADSR envelope of n samples (a,d,r in seconds)."""
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    e = np.zeros(n)
    a = min(a, n); e[:a] = np.linspace(0, 1, a, endpoint=False) if a else 1
    dd = min(d, n - a)
    if dd > 0: e[a:a + dd] = np.linspace(1, s, dd)
    rest = a + dd
    if rest < n: e[rest:] = s
    if r and n > r: e[-r:] *= np.linspace(1, 0, r)
    return e
def lp(x, cut):
    a = np.exp(-2 * np.pi * cut / SR); y = np.empty_like(x); z = 0.0
    for i in range(len(x)): z = (1 - a) * x[i] + a * z; y[i] = z
    return y
def lp_fast(x, cut):
    # FFT low-pass with a soft roll-off (fast for long signals).
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cut) ** 4); return np.fft.irfft(X, len(x))
def hp_fast(x, cut):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cut / np.maximum(f, 1)) ** 4); return np.fft.irfft(X, len(x))

# ---------- instruments (return mono arrays) ----------
def pad(m, dur, bright=1.0, det=0.12):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for dv in (-det, 0, det):
        f = hz(m + dv * 0.1)
        ph = 2 * np.pi * f * t
        x += np.sin(ph) + 0.35 * np.sin(2 * ph) * bright + 0.18 * np.sin(3 * ph) * bright
    x *= env(n, min(1.6, dur * 0.4), 0.1, 1, min(1.8, dur * 0.4))
    return x / 3
def piano(m, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m); x = np.zeros(n)
    for k, (amp, dec) in enumerate([(1, 1.6), (.5, 1.1), (.25, .8), (.14, .6), (.08, .45)], 1):
        x += amp * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * dec * (1 + f / 900))
    x *= np.minimum(1, t / 0.004)
    return x * vel * 0.5
def epiano(m, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    mod = np.sin(2 * np.pi * f * 14 * t) * 1.2 * np.exp(-t * 6)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.4) + 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3)
    return x * np.minimum(1, t / 0.003) * vel * 0.45
def marimba(m, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 14) + 0.12 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t * 30)
    return x * np.minimum(1, t / 0.002) * vel * 0.55
def bell(m, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2 * np.pi * f * t + 2.2 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t * 2)) * np.exp(-t * 1.2)
    return x * np.minimum(1, t / 0.002) * vel * 0.3
def pluck(m, dur, vel=1.0, bright=0.5, damp=0.996):
    """Karplus-Strong string (guitar / oud)."""
    n = int(dur * SR); f = hz(m); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); buf = lp(buf, 2000 + 6000 * bright)
    out = np.zeros(n); idx = 0
    for i in range(n):
        v = buf[idx]; nx = buf[(idx + 1) % p]
        buf[idx] = damp * 0.5 * (v + nx); out[i] = v; idx = (idx + 1) % p
    return out * vel * 0.6
def saw(m, dur, cut=1800, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = 2 * ((f * t) % 1) - 1; x = lp_fast(x, cut)
    return x * env(n, 0.005, 0.12, 0.35, 0.05) * vel * 0.4
def bass(m, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.tanh(1.6 * np.sin(2 * np.pi * f * t)) * env(n, 0.01, 0.25, 0.6, 0.08)
    return x * vel * 0.5
def kick(vel=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t * 32); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    return x * vel * 0.9
def snare(vel=1.0, tone=200):
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = hp_fast(rng.normal(0, 1, n), 1500) * np.exp(-t * 20) * 0.5 + np.sin(2 * np.pi * tone * t) * np.exp(-t * 25) * 0.5
    return x * vel * 0.5
def hat(vel=1.0, dec=60):
    n = int(0.12 * SR); t = np.arange(n) / SR
    return hp_fast(rng.normal(0, 1, n), 7000) * np.exp(-t * dec) * vel * 0.25
def doum(vel=1.0):
    n = int(0.6 * SR); t = np.arange(n) / SR; f = 70 + 40 * np.exp(-t * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * vel * 0.8
def tek(vel=1.0):
    n = int(0.12 * SR); t = np.arange(n) / SR
    return (hp_fast(rng.normal(0, 1, n), 2500) * 0.6 + np.sin(2 * np.pi * 900 * t) * 0.4) * np.exp(-t * 45) * vel * 0.45
def timpani(m, vel=1.0):
    n = int(2.0 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 1.8) + 0.4 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 3)
    x += lp_fast(rng.normal(0, 1, n), 400) * np.exp(-t * 12) * 0.3
    return x * vel * 0.6

def reverb(x, secs=2.2, wet=0.28, bright=4000):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t * 6.9 / secs); ir = lp_fast(ir, bright); ir[:int(0.012 * SR)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n; N = 1 << (L - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:len(x) + n]
    # fold the tail back to the start so the loop stays seamless
    out = x * (1 - wet) + y[:len(x)] * wet
    out[:n] += y[len(x):len(x) + n] * wet
    return out

class Track:
    def __init__(self, bpm, bars, beats=4):
        self.spb = 60 / bpm; self.n = int(bars * beats * self.spb * SR)
        self.L = np.zeros(self.n); self.R = np.zeros(self.n)
    def put(self, x, beat, pan=0.0, gain=1.0):
        i = int(beat * self.spb * SR) % self.n
        x = x * gain; l = x * np.sqrt((1 - pan) / 2); r = x * np.sqrt((1 + pan) / 2)
        end = i + len(x)
        if end <= self.n: self.L[i:end] += l; self.R[i:end] += r
        else:
            k = self.n - i; self.L[i:] += l[:k]; self.R[i:] += r[:k]; self.L[:end - self.n] += l[k:]; self.R[:end - self.n] += r[k:]
    def render(self, name, rv=2.2, wet=0.28, bright=4000, duck=None):
        L, R = reverb(self.L, rv, wet, bright), reverb(self.R, rv * 1.05, wet, bright)
        m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * 0.8, R / m * 0.8
        st = np.stack([L, R], 1).astype(np.float32)
        raw = f'/tmp/{name}.raw'; st.tofile(raw)
        os.makedirs(f'{OUT}/music', exist_ok=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', raw,
                        '-af', 'loudnorm=I=-20:TP=-2:LRA=9', '-ar', '32000', '-b:a', '96k', f'{OUT}/music/{name}.mp3'], check=True)
        print('music', name, round(self.n / SR, 1), 's', flush=True)

CH = {  # chord tones (MIDI) for simple triads/sevenths
    'C': [60, 64, 67], 'Cmaj7': [60, 64, 67, 71], 'G': [55, 59, 62], 'Am': [57, 60, 64], 'Am7': [57, 60, 64, 67], 'F': [53, 57, 60], 'Fmaj7': [53, 57, 60, 64],
    'Em': [52, 55, 59], 'Dm7': [50, 53, 57, 60], 'D': [50, 54, 57], 'Bm': [47, 50, 54], 'Gmaj7': [55, 59, 62, 66], 'Dmaj7': [50, 54, 57, 61], 'A': [57, 61, 64],
    'Eb': [51, 55, 58], 'Bb': [46, 50, 53], 'Cm': [48, 51, 55], 'Ab': [44, 48, 51], 'Gm': [55, 58, 62], 'Bbmaj7': [46, 50, 53, 57], 'E7': [52, 56, 59, 62],
}

def medlex():  # bright, curious: marimba arpeggios, light percussion, C major, 100 bpm
    t = Track(100, 24); prog = ['C', 'G', 'Am', 'F'] * 6
    for b, c in enumerate(prog):
        notes = CH[c]
        t.put(pad(notes[0] - 12, 4 * t.spb, 0.4) * 0.35, b * 4, 0)
        for k, s in enumerate([0, 1, 2, 1, 0, 2, 1, 2]):
            t.put(marimba(notes[s] + 12, 0.9, 0.8 if k % 2 else 1.0), b * 4 + k * 0.5, -0.3 + 0.6 * (k % 2))
        t.put(bass(notes[0] - 24, 0.9), b * 4); t.put(bass(notes[0] - 24, 0.4, 0.7), b * 4 + 2.5)
        if b >= 2:
            for q in range(8): t.put(hat(0.5 + 0.3 * (q % 2 == 1)), b * 4 + q * 0.5, 0.4)
            t.put(kick(0.6), b * 4); t.put(kick(0.5), b * 4 + 2); t.put(snare(0.35, 240), b * 4 + 1); t.put(snare(0.35, 240), b * 4 + 3)
        if b % 4 == 3: t.put(bell(84, 2.5, 0.8), b * 4 + 3, 0.5)
    t.render('medlex', 1.6, 0.22, 5000)

def carecraft():  # warm, hopeful: piano chords + plucked guitar, G major, 88 bpm
    t = Track(88, 22); prog = ['G', 'Em', 'C', 'D'] * 6
    for b, c in enumerate(prog[:22]):
        notes = CH[c]
        for s in notes: t.put(piano(s, 3.2, 0.45), b * 4, -0.1)
        for k, s in enumerate([0, 2, 1, 2, 0, 2, 1, 2]): t.put(pluck(notes[s] + 12, 1.4, 0.55, 0.45), b * 4 + k * 0.5, 0.35)
        t.put(bass(notes[0] - 12, 1.6, 0.8), b * 4); t.put(bass(notes[0] - 12, 0.8, 0.6), b * 4 + 3)
        if b >= 4:
            t.put(kick(0.45), b * 4); t.put(kick(0.35), b * 4 + 2.5); t.put(snare(0.22, 300), b * 4 + 1); t.put(snare(0.22, 300), b * 4 + 3)
            for q in range(4): t.put(hat(0.35, 80), b * 4 + q + 0.5, -0.4)
        if b % 2 == 1: t.put(piano([74, 76, 79, 81, 79, 76][b % 6], 2.0, 0.5), b * 4 + 2, 0.2)
    t.render('carecraft', 2.0, 0.26, 4500)

def serein():  # calm, ambient: long pads, sparse bells, wind, D lydian-ish, 60 bpm
    t = Track(60, 15); prog = ['Dmaj7', 'Gmaj7', 'Bm', 'A', 'Dmaj7']
    for b in range(15):
        notes = CH[prog[b % 5]]
        for s in notes: t.put(pad(s, 4.6, 0.25, 0.2) * 0.45, b * 4, -0.3 + 0.2 * (s % 3))
        t.put(pad(notes[0] - 12, 4.5, 0.1) * 0.4, b * 4)
        if b % 2 == 0: t.put(bell(notes[(b // 2) % len(notes)] + 24, 5.0, 0.55), b * 4 + 1.5, 0.4)
        if b % 3 == 1: t.put(bell(notes[1] + 19, 5.0, 0.4), b * 4 + 3, -0.4)
    wind = lp_fast(rng.normal(0, 1, t.n), 600) * (0.6 + 0.4 * np.sin(np.arange(t.n) / SR * 2 * np.pi / 15)) * 0.05
    t.L += wind; t.R += np.roll(wind, 4000)
    t.render('serein', 3.5, 0.4, 3500)

def lumen():  # lo-fi study: e-piano 7ths, swing hats, soft kick, vinyl, F major, 78 bpm
    t = Track(78, 20); prog = ['Fmaj7', 'Em', 'Dm7', 'Cmaj7'] * 5
    sw = 0.08
    for b, c in enumerate(prog):
        notes = CH[c]
        for s in notes: t.put(epiano(s, 3.0, 0.5), b * 4, -0.15)
        for s in notes: t.put(epiano(s + 12, 1.2, 0.25), b * 4 + 2.5, 0.2)
        t.put(bass(notes[0] - 12, 1.8, 0.75), b * 4); t.put(bass(notes[1] - 12, 0.9, 0.55), b * 4 + 2.5)
        t.put(kick(0.55), b * 4); t.put(kick(0.4), b * 4 + 2.75); t.put(snare(0.3, 180), b * 4 + 1); t.put(snare(0.3, 180), b * 4 + 3)
        for q in range(8): t.put(hat(0.3 + 0.15 * (q % 2 == 0), 70), b * 4 + q * 0.5 + (sw if q % 2 else 0), 0.35)
        if b % 2 == 1: t.put(epiano([72, 74, 76, 79][b % 4], 1.6, 0.4), b * 4 + 1.5, 0.3)
    crack = (rng.random(t.n) > 0.9993) * rng.normal(0, 0.5, t.n); crack = hp_fast(crack, 2000) * 0.25
    hiss = hp_fast(rng.normal(0, 1, t.n), 5000) * 0.006
    t.L += crack + hiss; t.R += np.roll(crack, 1200) + hiss
    t.render('lumen', 1.8, 0.24, 3000)

def gulf():  # Gulf Region: oud-like plucks in maqam Hijaz on D, frame drum (doum/tek), drone, 90 bpm
    t = Track(90, 22); D = 50  # D3
    hijaz = [0, 1, 4, 5, 7, 8, 10, 12]  # D Eb F# G A Bb C D
    phrase = [7, 5, 4, 1, 0, 1, 4, 5, 7, 8, 7, 5, 4, 5, 4, 1]
    for b in range(22):
        t.put(pad(D - 12, 4 * t.spb + 0.3, 0.3, 0.05) * 0.35, b * 4); t.put(pad(D - 5, 4 * t.spb + 0.3, 0.2, 0.05) * 0.2, b * 4, 0.3)
        # frame drum: doum . tek tek doum . tek .
        for beat, kind in [(0, 'D'), (1, 'T'), (1.5, 'T'), (2, 'D'), (3, 'T'), (3.5, 't')]:
            t.put(doum(0.7) if kind == 'D' else tek(0.6 if kind == 'T' else 0.35), b * 4 + beat, -0.1 if kind == 'D' else 0.25)
        if b >= 2:
            seg = phrase[(b % 4) * 4:(b % 4) * 4 + 4]
            for k, deg in enumerate(seg):
                m = D + 12 + hijaz[deg % 8] + (12 if deg >= 8 else 0)
                t.put(pluck(m, 1.6, 0.75, 0.75, 0.9965), b * 4 + k, 0.15)
                if k % 2 == 1: t.put(pluck(m + 12, 0.6, 0.35, 0.8, 0.993), b * 4 + k + 0.5, -0.2)  # tremolo ornament
        if b % 4 == 3: t.put(bell(D + 31, 3.0, 0.35), b * 4 + 2, -0.4)
    t.render('gulf', 2.4, 0.3, 4000)

def evinca():  # cinematic, inspirational: swelling strings, piano motif, timpani, Eb major, 70 bpm
    t = Track(70, 18); prog = ['Eb', 'Cm', 'Ab', 'Bb'] * 5
    motif = [70, 72, 75, 74, 70, 67]
    for b, c in enumerate(prog[:18]):
        notes = CH[c]
        for s in notes + [notes[0] + 12]: t.put(pad(s, 4 * t.spb + 0.6, 0.8, 0.25) * (0.3 + 0.2 * (b >= 8)), b * 4, -0.4 + 0.25 * (s % 4))
        t.put(pad(notes[0] - 12, 4 * t.spb + 0.6, 0.4) * 0.45, b * 4)
        for k in range(2): t.put(piano(motif[(b * 2 + k) % len(motif)] + (12 if b >= 8 else 0), 2.6, 0.55), b * 4 + k * 2, 0.2)
        if b % 4 == 0: t.put(timpani(notes[0] - 24, 0.8), b * 4)
        if b >= 8 and b % 2 == 0: t.put(timpani(notes[0] - 24, 0.5), b * 4 + 3)
    t.render('evinca', 3.0, 0.34, 4200)

def lss():  # modern tech: pulsing 16th saw arps, punchy kick, claps, A minor, 112 bpm
    t = Track(112, 28); prog = ['Am', 'F', 'C', 'G'] * 7
    for b, c in enumerate(prog):
        notes = CH[c]
        t.put(pad(notes[0], 4 * t.spb, 0.6) * 0.25, b * 4, 0)
        for q in range(16):
            s = notes[[0, 1, 2, 1][q % 4]] + (12 if q % 8 >= 4 else 0)
            t.put(saw(s + 12, 0.22, 1400 + 900 * np.sin(b * 0.7 + q * 0.4) ** 2, 0.55), b * 4 + q * 0.25, -0.35 + 0.7 * (q % 2))
        for q in range(4): t.put(kick(0.75), b * 4 + q)
        for q in range(4): t.put(bass(notes[0] - 24, 0.22, 0.6), b * 4 + q + 0.5)
        if b >= 2: t.put(snare(0.45, 220), b * 4 + 1); t.put(snare(0.45, 220), b * 4 + 3)
        for q in range(8): t.put(hat(0.3 + 0.2 * (q % 2 == 1), 90), b * 4 + q * 0.5 + 0.25, 0.4)
    # gentle side-chain pump from the kick
    beat = int(t.spb * SR); ph = (np.arange(t.n) % beat) / beat; pump = 0.55 + 0.45 * np.minimum(1, ph * 3)
    t.L *= pump; t.R *= pump
    t.render('lss', 1.4, 0.18, 5500)

def sfx():
    os.makedirs(f'{OUT}/sfx', exist_ok=True)
    def save(x, name):
        x = x / (np.abs(x).max() + 1e-9) * 0.85
        st = np.stack([x, x], 1).astype(np.float32); st.tofile('/tmp/s.raw')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '/tmp/s.raw', '-b:a', '96k', f'{OUT}/sfx/{name}.mp3'], check=True)
    n = int(0.7 * SR); t = np.arange(n) / SR
    noise = rng.normal(0, 1, n); X = np.fft.rfft(noise); f = np.fft.rfftfreq(n, 1 / SR)
    # whoosh: band-pass sweep up then down
    w = np.zeros(n); seg = 2048
    for i in range(0, n - seg, seg // 2):
        c = 300 + 3500 * np.sin(np.pi * i / n) ** 2
        S = np.fft.rfft(noise[i:i + seg] * np.hanning(seg)); ff = np.fft.rfftfreq(seg, 1 / SR)
        S *= np.exp(-((ff - c) / (c * 0.6)) ** 2); w[i:i + seg] += np.fft.irfft(S, seg)
    save(w * np.sin(np.pi * t / t[-1]) ** 1.5, 'whoosh')
    save(bell(88, 1.6, 1) + bell(95, 1.6, 0.6), 'chime')
    m = int(0.12 * SR); tt = np.arange(m) / SR
    save(np.sin(2 * np.pi * (900 + 600 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 38), 'tick')
    save(np.concatenate([marimba(76, 0.5), np.zeros(int(0.02 * SR))]) + np.pad(marimba(83, 0.5), (int(0.09 * SR), 0))[:int(0.52 * SR)], 'pop')
    rise = np.sin(2 * np.pi * np.cumsum(200 + 900 * (np.arange(int(1.2 * SR)) / SR) ** 2) / SR) * np.linspace(0, 1, int(1.2 * SR)) ** 2
    save(reverb(rise * 0.5 + hp_fast(rng.normal(0, 1, len(rise)), 3000) * np.linspace(0, 0.4, len(rise)), 1.2, 0.3), 'rise')
    print('sfx done')

if __name__ == '__main__':
    which = sys.argv[1:] or ['sfx', 'medlex', 'carecraft', 'serein', 'lumen', 'gulf', 'evinca', 'lss']
    for w in which: globals()[w]()
