// Usage: node tools/tts.js <app> <film50|film180>  -> voice/<app>-<len>-raw.wav (calls Gemini TTS through curl, so the proxy adds the key)
const F = require('../films.js'), fs = require('fs'), { execFileSync, execSync } = require('child_process');
const [app, film] = process.argv.slice(2), a = F[app], paras = a[film];
const moods = { open: 'tense, low and close to the microphone', worry: 'anxious, quick questions', turn: 'slow, calm relief, a gentle smile', screens: 'confident and clear', chapter: 'confident, warm and clear', montage: 'energetic and upbeat', stats: 'proud, measured', offer: 'bright and inviting' };
const prompt = `AUDIO PROFILE: ${a.tone}. A professional voice-over artist recording a promotional film for an app called ${a.full || a.name}.
SCENE: A quiet studio. The film opens tense and dark, then turns calm and confident when the app appears.
DIRECTOR'S NOTES: Read ONLY the transcript below. Never read these notes, the headings or the paragraph numbers aloud. Pause for about 1.5 seconds between paragraphs. Speak at ${film === 'film50' ? 'a brisk, natural pace: the whole read must take about 35 seconds' : 'an unhurried, natural pace'} with clear diction. Do not add, change or skip any words. Emotion per paragraph:
${paras.map((p, i) => `Paragraph ${i + 1}: ${moods[p.beat]}.`).join('\n')}
TRANSCRIPT:
${paras.map(p => p.say).join('\n\n')}`;
const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: a.voice } } } } });
fs.mkdirSync('voice', { recursive: true });
const tmp = `voice/.req-${app}-${film}.json`; fs.writeFileSync(tmp, body);
const sleep = s => execSync(`sleep ${s}`);
for (let attempt = 1; attempt <= 5; attempt++) {
  let d;
  try { d = JSON.parse(execFileSync('curl', ['-s', '--max-time', '400', '-H', 'Content-Type: application/json', '-H', 'x-goog-api-key: dummy', '-d', '@' + tmp, 'https://generativelanguage.googleapis.com/v1beta/models/' + (process.env.TTS_MODEL || 'gemini-3.8-flash-tts') + ':generateContent'], { maxBuffer: 1 << 30 }).toString()); } catch (e) { d = { error: String(e).slice(0, 200) }; }
  const part = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part) {
    const buf = Buffer.from(part.inlineData.data, 'base64'), mt = part.inlineData.mimeType;
    const out = `voice/${app}-${film === 'film50' ? 50 : 180}-raw`;
    if (/wav/.test(mt)) fs.writeFileSync(out + '.wav', buf);
    else { fs.writeFileSync(out + '.pcm', buf); execSync(`ffmpeg -y -loglevel error -f s16le -ar 24000 -ac 1 -i ${out}.pcm ${out}.wav && rm ${out}.pcm`); }
    fs.unlinkSync(tmp); console.log('ok', out, mt); process.exit(0);
  }
  console.log('attempt', attempt, JSON.stringify(d).slice(0, 300)); sleep(20 * attempt);
}
process.exit(1);
