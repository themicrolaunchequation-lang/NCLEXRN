# Final assembly: video + placed voice + music (if music/<app>-<len>.mp3 exists).
# Usage: python3 tools/final.py <app> <50|180> <16x9|9x16> [before|after]
# - "after" endings: renders the offer/end-card seconds with the after-price text and splices them in.
# - Music: finds the beat drop near the expected second, shifts the track by whole bars so the drop lands on the logo
#   reveal, ducks it under the voice (sidechain), cuts 3 kHz on the music, fades the tail, master at -14 LUFS.
# - Output: out/<app>-<len>-<ar>[-after].mp4, re-encoded at crf 23 if over 100 MB.
import json, sys, os, subprocess, wave
import numpy as np
app, L, ar = sys.argv[1], sys.argv[2], sys.argv[3]
ending = sys.argv[4] if len(sys.argv) > 4 else 'before'
T = json.load(open(f'timeline/{app}-{L}.json'))
total = T['total']
vid = f'render/{app}-{L}-{ar}.mp4'
os.makedirs('out', exist_ok=True)
name = f'out/{app}-{L}-{ar}' + ('-after' if ending == 'after' else '') + '.mp4'
run = lambda *a: subprocess.run(list(a), check=True)

# ----- video (splice the after ending) -----
vin = ['-i', vid]; vf = '[0:v]null[v]'
if ending == 'after':
    offer = T['beats'][-1]['t0']
    tail = f'render/{app}-{L}-{ar}-after-tail.mp4'
    if not os.path.exists(tail):
        run('node', 'tools/frames.js', f'{app}-{L}', ar, tail, 'after', str(offer), str(total))
    vin += ['-i', tail]
    vf = f'[0:v]trim=0:{offer},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]'

# ----- music alignment -----
music = next((f'music/{app}-{L}.{e}' for e in ('wav', 'mp3', 'm4a') if os.path.exists(f'music/{app}-{L}.{e}')), None)
mshift = 0.0
if music:
    tmp = 'music/.m.wav'
    run('ffmpeg', '-y', '-loglevel', 'error', '-i', music, '-ac', '1', '-ar', '22050', tmp)
    w = wave.open(tmp); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32); w.close(); os.remove(tmp)
    hop = 512; n = len(x) // hop
    env = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-9)
    onset = np.maximum(0, np.diff(np.log(env + 1)))
    # tempo by autocorrelation of the onset envelope (60-180 BPM)
    ac = np.correlate(onset - onset.mean(), onset - onset.mean(), 'full')[len(onset) - 1:]
    fps = sr / hop; lags = np.arange(len(ac)) / fps
    ok = (lags > 60 / 180) & (lags < 60 / 60)
    beat = lags[ok][np.argmax(ac[ok])]; bar = beat * 4
    # drop: biggest rise of 2 s loudness around the expected drop second
    logo = next(b['logo'] for b in T['beats'] if b['beat'] == 'turn')
    expected = 14.0 if L == '50' else 23.0
    sec = np.array([env[int(i * fps):int((i + 0.5) * fps)].mean() for i in np.arange(0, len(env) / fps - 0.5, 0.5)])
    rise = np.array([sec[i:i + 4].mean() - sec[max(0, i - 4):i].mean() if i >= 4 else 0 for i in range(len(sec))])
    lo, hi = int((expected - 4) * 2), int((expected + 4) * 2)
    drop = (lo + int(np.argmax(rise[lo:hi]))) * 0.5 if hi < len(rise) else expected
    mshift = logo - drop                # >0: delay the music, <0: start later in the track
    if abs(mshift) > 0.05 and bar > 0:  # keep the shift a whole number of bars away from the track start when trimming
        if mshift < 0:
            bars = round(-mshift / bar); mshift = -bars * bar if bars else mshift
    json.dump({'bpm': round(60 / beat, 1), 'bar': round(bar, 3), 'drop': drop, 'logo': logo, 'shift': round(mshift, 3)}, open(f'music/{app}-{L}-align.json', 'w'))
    print('music', app, L, f'bpm {60 / beat:.1f} drop {drop}s -> logo {logo}s shift {mshift:.2f}s')

# ----- audio mix -----
ain = ['-i', f'voice/{app}-{L}-placed.wav']
if music:
    ain += ['-i', music]
    vi = 1 + (1 if ending == 'after' else 0)  # input indexes after video inputs
    mi = vi + 1
    sh = (f'adelay={int(mshift * 1000)}|{int(mshift * 1000)}' if mshift > 0 else f'atrim=start={-mshift},asetpts=PTS-STARTPTS')
    af = (f'[{vi}:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[vo][sc];'
          f'[{mi}:a]aformat=sample_rates=48000:channel_layouts=stereo,{sh},apad=whole_dur={total},atrim=0:{total},'
          f'equalizer=f=3000:t=q:w=1.4:g=-4,volume=0.55,afade=t=out:st={total - 2.2}:d=2.2[mu];'
          f'[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350:makeup=1[duck];'
          f'[vo][duck]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
else:
    vi = 1 + (1 if ending == 'after' else 0)
    af = f'[{vi}:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=11[a]'

def encode(crf):
    run('ffmpeg', '-y', '-loglevel', 'error', *vin, *ain, '-filter_complex', f'{vf};{af}', '-map', '[v]', '-map', '[a]',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-t', str(total), name)
encode(20)
if os.path.getsize(name) > 100 * 1024 * 1024:
    encode(23)
print('done', name, f'{os.path.getsize(name) / 1048576:.1f} MB', 'music' if music else 'voice only')
