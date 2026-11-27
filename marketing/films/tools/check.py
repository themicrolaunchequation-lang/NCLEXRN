# Usage: python3 tools/check.py <app> <50|180>
# 1) Gemini transcribes the take; prints words that differ from the script.
# 2) Finds the N-1 longest pauses (N = paragraphs) and writes voice/<app>-<len>-times.json with paragraph start/end times.
import json, sys, base64, subprocess, re, difflib, os
app, L = sys.argv[1], sys.argv[2]
films = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./films.js")))']))
paras = films[app]['film50' if L == '50' else 'film180']
wav = f'voice/{app}-{L}-raw.wav'
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]))
# silence detection
out = subprocess.run(['ffmpeg', '-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.35', '-f', 'null', '-'], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
sil = [(s, e) for s, e in zip(starts, ends) if s > 0.3 and e < dur - 0.2]
n = len(paras)
# global fit: pick n-1 pauses so each paragraph's length best matches its share of characters
lens = [len(p['say']) for p in paras]; tot = sum(lens)
speech = dur - sum(e - s for s, e in sil)
rate = speech / tot
C = sorted(sil)
import math
INF = float('inf')
m = len(C)
# dp[k][j]: best cost with k-th cut at candidate j
def seg_cost(t0, t1, i, gap):
    exp = lens[i] * rate
    return ((t1 - t0) - exp) ** 2 / max(exp, 1) - 1.5 * gap
dp = [[INF] * m for _ in range(n - 1)]; bk = [[-1] * m for _ in range(n - 1)]
for j in range(m):
    dp[0][j] = seg_cost(0, C[j][0], 0, C[j][1] - C[j][0])
for k in range(1, n - 1):
    for j in range(m):
        g = C[j][1] - C[j][0]
        for q in range(j):
            if dp[k-1][q] == INF: continue
            c = dp[k-1][q] + seg_cost(C[q][1], C[j][0], k, g)
            if c < dp[k][j]: dp[k][j], bk[k][j] = c, q
best, bj = INF, -1
for j in range(m):
    if dp[n-2][j] == INF: continue
    c = dp[n-2][j] + seg_cost(C[j][1], dur, n - 1, 0)
    if c < best: best, bj = c, j
idx = []
k = n - 2
while k >= 0: idx.append(bj); bj = bk[k][bj]; k -= 1
cuts = [C[j] for j in reversed(idx)]
times = []
prev = 0.0
for s, e in cuts:
    times.append([round(prev, 3), round(s, 3)]); prev = e
times.append([round(prev, 3), round(dur, 3)])
# trim leading/trailing silence of first/last
json.dump({'duration': dur, 'paras': times, 'gaps': [round(e - s, 2) for s, e in cuts]}, open(f'voice/{app}-{L}-times.json', 'w'))
print(app, L, 'dur', round(dur, 1), 'paras', len(times), 'gaps', [round(e - s, 2) for s, e in cuts])
if len(times) != n: print('WARNING paragraph count mismatch')
rates = [(t[1]-t[0])/len(p['say']) for t, p in zip(times, paras)]; mr = sum(rates)/len(rates)
bad = [i+1 for i, r in enumerate(rates) if abs(r-mr)/mr > 0.45]
if bad: print('CHECK paragraphs with odd speed:', bad, [round(r*100,1) for r in rates])
if '--split-only' in sys.argv: sys.exit(0)
# transcription
b64 = base64.b64encode(open(wav, 'rb').read()).decode()
req = {'contents': [{'parts': [{'inlineData': {'mimeType': 'audio/wav', 'data': b64}}, {'text': 'Transcribe this audio exactly, word for word. Output only the transcript, as plain text.'}]}]}
open('voice/.tr.json', 'w').write(json.dumps(req))
r = json.loads(subprocess.check_output(['curl', '-s', '--max-time', '300', '-H', 'Content-Type: application/json', '-H', 'x-goog-api-key: dummy', '-d', '@voice/.tr.json', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent']))
os.remove('voice/.tr.json')
try: tr = r['candidates'][0]['content']['parts'][0]['text']
except Exception: print('transcribe failed', str(r)[:300]); sys.exit(0)
norm = lambda t: re.findall(r"[a-z0-9']+", t.lower().replace('’', "'"))
a, b = norm(' '.join(p['say'] for p in paras)), norm(tr)
diff = [d for d in difflib.ndiff(a, b) if d[0] in '+-']
open(f'voice/{app}-{L}-transcript.txt', 'w').write(tr)
print('word diffs:', len(diff), ' '.join(diff[:40]))
