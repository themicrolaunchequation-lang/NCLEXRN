# Usage: python3 tools/tighten.py <app> <50|180> [tempo]
# Cuts the take into paragraph clips, shortens pauses inside a paragraph to 0.4 s, optional tempo (<=1.05),
# writes voice/clips/<app>-<len>-<i>.wav and voice/<app>-<len>-clips.json (clip lengths).
import json, sys, wave, numpy as np, subprocess, os
app, L = sys.argv[1], sys.argv[2]; tempo = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0; MAXP = float(sys.argv[4]) if len(sys.argv) > 4 else 0.4
src = f'voice/{app}-{L}-raw.wav'
tmp = f'voice/.mono-{app}-{L}.wav'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-ac', '1', '-ar', '24000', '-sample_fmt', 's16', tmp], check=True)
w = wave.open(tmp); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32); w.close(); os.remove(tmp)
times = json.load(open(f'voice/{app}-{L}-times.json'))['paras']
os.makedirs('voice/clips', exist_ok=True)
win = int(sr * 0.02); lens = []
for i, (s, e) in enumerate(times):
    seg = x[int(s * sr):int(e * sr)]
    n = len(seg) // win
    rms = np.sqrt(np.mean(seg[:n * win].reshape(n, win) ** 2, axis=1) + 1e-9)
    db = 20 * np.log10(rms / 32768)
    quiet = db < -40
    # trim leading/trailing quiet
    nz = np.where(~quiet)[0]
    a, b = (nz[0], nz[-1] + 1) if len(nz) else (0, n)
    keep = []
    run = 0
    for k in range(a, b):
        if quiet[k]:
            run += 1
            if run * 0.02 <= MAXP: keep.append(k)
        else:
            run = 0; keep.append(k)
    out = np.concatenate([seg[k * win:(k + 1) * win] for k in keep]) if keep else seg
    # 30 ms padding each side
    pad = np.zeros(int(sr * 0.03), dtype=np.float32); out = np.concatenate([pad, out, pad])
    p = f'voice/clips/{app}-{L}-{i}.wav'
    with wave.open(p + '.tmp.wav', 'wb') as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(np.clip(out, -32768, 32767).astype(np.int16).tobytes())
    af = f'atempo={tempo}' if tempo != 1.0 else 'anull'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', p + '.tmp.wav', '-af', af, p], check=True); os.remove(p + '.tmp.wav')
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
    lens.append(round(d, 3))
json.dump({'tempo': tempo, 'lens': lens}, open(f'voice/{app}-{L}-clips.json', 'w'))
print(app, L, 'tempo', tempo, 'before', round(sum(e - s for s, e in times), 1), 'after', round(sum(lens), 1))
