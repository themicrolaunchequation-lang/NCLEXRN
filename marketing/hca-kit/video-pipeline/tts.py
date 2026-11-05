import sys,soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro('kokoro-v1.0.onnx','voices-v1.0.bin')
print(sorted(k.get_voices()))
for v,lang in [('bm_george','en-gb'),('bf_emma','en-gb'),('am_michael','en-us'),('af_heart','en-us')]:
    s,sr=k.create("Your ward is losing money every single shift. And nobody can see it.",voice=v,speed=1.0,lang=lang)
    sf.write(f'test_{v}.wav',s,sr)
print('ok')
