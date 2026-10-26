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
lines = json.load(open('lines.json'))
only = sys.argv[1:] or list(lines)
OUT = '/home/user/NCLEXRN/site/assets/audio/tour'
for app in only:
    style, speed, lang = VOICES[app]
    os.makedirs(f'{OUT}/{app}', exist_ok=True)
    for i, text in enumerate(lines[app]):
        if app == 'snle':
            ph = saudi(k.tokenizer.phonemize(text, 'en-us'))
            s, sr = k.create(ph, voice=style, speed=speed, is_phonemes=True)
        else:
            s, sr = k.create(text, voice=style, speed=speed, lang=lang)
        s = np.concatenate([np.zeros(int(sr * 0.08)), s, np.zeros(int(sr * 0.25))]).astype(np.float32)
        sf.write('/tmp/vo.wav', s, sr)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/vo.wav', '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7', '-ac', '1', '-ar', '24000', '-b:a', '56k', f'{OUT}/{app}/{i}.mp3'], check=True)
    print(app, len(lines[app]), 'clips', flush=True)
