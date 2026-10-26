import json, os, re, subprocess, numpy as np, soundfile as sf, sys
from kokoro_onnx import Kokoro
k = Kokoro('kokoro.onnx', 'voices.npz')
V = lambda n: k.get_voice_style(n)
VOICES = {  # voice style, speed, language
  'medlex':    (V('af_bella'), 1.02, 'en-us'),
  'carecraft': (V('bf_emma'), 0.95, 'en-gb'),
  'serein':    (V('af_nicole') * 0.75 + V('af_heart') * 0.25, 0.84, 'en-us'),
  'lumen':     (V('af_heart'), 1.0, 'en-us'),
  'snle':      (V('am_michael') * 0.65 + V('am_fenrir') * 0.35, 0.93, 'en-us'),
  'evinca':    (V('bm_george'), 0.9, 'en-gb'),
  'lss':       (V('bm_fable') * 0.7 + V('bm_george') * 0.3, 1.0, 'en-gb'),
}
def saudi(ph):
    # Approximate a Saudi English accent: tapped r, full vowels, monophthongs.
    for a, b in [('ɚ', 'ɜɾ'), ('ɝ', 'ɜɾ'), ('ɹ', 'ɾ'), ('oʊ', 'o'), ('eɪ', 'e'), ('ə', 'ɐ'), ('ᵻ', 'i'), ('ʌ', 'a'), ('æ', 'a'), ('ɪŋ', 'iŋ')]:
        ph = ph.replace(a, b)
    return ph
SPEAKERS = {  # multi-voice films: speaker -> (style, speed, lang)
  'lss': {'nurse': (V('bf_emma'), 1.0, 'en-gb'), 'coach': VOICES['lss']},
  'evinca': {'host': VOICES['evinca'], 'nurse': (V('bf_emma'), 0.96, 'en-gb'), 'colleague': (V('am_michael'), 0.98, 'en-us'), 'patient': (V('af_heart') * 0.7 + V('af_sarah') * 0.3, 0.93, 'en-us')},
}
def speak(app, text):
    parts = [p.strip() for p in text.split('|')]
    out = []
    for i, part in enumerate(parts):
        m = re.match(r'^([a-z]+):\s*(.*)$', part, re.S)
        style, speed, lang = VOICES[app]
        if m and app in SPEAKERS and m.group(1) in SPEAKERS[app]: style, speed, lang = SPEAKERS[app][m.group(1)]; part = m.group(2)
        elif m: part = m.group(2)
        if app == 'snle':
            s_, sr = k.create(saudi(k.tokenizer.phonemize(part, 'en-us')), voice=style, speed=speed, is_phonemes=True)
        else:
            s_, sr = k.create(part, voice=style, speed=speed, lang=lang)
        if out: out.append(np.zeros(int(sr * 0.35)))
        out.append(s_)
    return np.concatenate(out), 24000
lines = json.load(open('lines.json'))
only = sys.argv[1:] or list(lines)
OUT = '/home/user/NCLEXRN/site/assets/audio/tour'
for app in only:
    os.makedirs(f'{OUT}/{app}', exist_ok=True)
    for f in os.listdir(f'{OUT}/{app}'): os.remove(f'{OUT}/{app}/{f}')
    for i, text in enumerate(lines[app]):
        s, sr = speak(app, text)
        s = np.concatenate([np.zeros(int(sr * 0.08)), s, np.zeros(int(sr * 0.25))]).astype(np.float32)
        sf.write('/tmp/vo.wav', s, sr)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/vo.wav', '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7', '-ac', '1', '-ar', '24000', '-b:a', '56k', f'{OUT}/{app}/{i}.mp3'], check=True)
    print(app, len(lines[app]), 'clips', flush=True)
