// Phase 1: canonical features/settings/voice implementation.
import { persist } from '../learn/legacy-tools.js';
import { app } from '../../state/runtime.js';
import { termBy } from '../../state/selectors.js';
import { toast } from '../../ui/components/index.js';
import { esc } from '../../ui/dom.js';

export function voiceSpeakerIcon() {
  return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4ZM16 8q4 4 0 8m3-11q7 7 0 14"/></svg>';
}
export const ENGLISH_ACCENTS = {
  'en-AU': 'Australian English',
  'en-GB': 'British English',
  'en-US': 'American English',
  'en-IN': 'Indian English',
  'en-CA': 'Canadian English',
  'en-IE': 'Irish English',
  'en-NZ': 'New Zealand English',
  'en-ZA': 'South African English'
};
export function englishVoices() {
  if (!('speechSynthesis' in window)) return [];
  const seen = new Set();
  return speechSynthesis.getVoices().filter(v => /^en(?:[-_]|$)/i.test(v.lang)).filter(v => {
    const key = (v.voiceURI || v.name) + '|' + v.lang;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));
}
export function accentName(code) {
  return ENGLISH_ACCENTS[code] || code;
}
export function voiceKey(v) {
  return v.voiceURI || v.name;
}
export function voiceOptions(voices, selected, accent = '') {
  let filtered = voices.filter(v => !accent || v.lang.replace('_', '-').toLowerCase() === accent.toLowerCase()),
    html = '<option value="">Automatic English voice</option>';
  const groups = [...new Set(filtered.map(v => v.lang))];
  for (const lang of groups) html += `<optgroup label="${esc(accentName(lang))}">${filtered.filter(v => v.lang === lang).map(v => `<option value="${esc(voiceKey(v))}" ${voiceKey(v) === selected || v.name === selected ? 'selected' : ''}>${esc(v.name)} · ${v.localService ? 'device' : 'online service'}</option>`).join('')}</optgroup>`;
  if (selected && !filtered.some(v => voiceKey(v) === selected || v.name === selected)) html += `<option value="${esc(selected)}" selected>${esc(app.v3.profile.ttsVoice || selected)} · unavailable on this device</option>`;
  return html;
}
export function accentOptions(voices, selected = '') {
  const langs = [...new Set(voices.map(v => v.lang.replace('_', '-')))];
  if (selected && !langs.includes(selected)) langs.push(selected);
  return '<option value="">Any English accent</option>' + langs.sort((a, b) => accentName(a).localeCompare(accentName(b))).map(lang => `<option value="${esc(lang)}" ${selected === lang ? 'selected' : ''}>${esc(accentName(lang))} (${voices.filter(v => v.lang.replace('_', '-') === lang).length})</option>`).join('');
}
export function voiceControls(context, id = '', live = false) {
  const p = app.v3.profile,
    voices = englishVoices(),
    selected = p.ttsVoiceURI || p.ttsVoice || '';
  return `<fieldset class="voice-controls" data-voice-context="${context}" data-voice-term="${esc(id)}" ${live ? 'data-voice-live' : ''}><legend>English listening voice</legend><div class="voice-fields"><label>Accent<select data-voice-accent name="accent">${accentOptions(voices, p.ttsAccent || '')}</select></label><label>Available voice<select data-voice-select name="voice">${voiceOptions(voices, selected, p.ttsAccent || '')}</select></label><label class="voice-speed">Speech speed <output>${Number(p.ttsRate || .85).toFixed(2)}×</output><input name="rate" data-voice-rate type="range" min="0.6" max="1.1" step="0.05" value="${p.ttsRate || .85}"></label></div><div class="voice-presets" role="group" aria-label="Speech speed presets">${[[.65, 'Slower'], [.85, 'Learning pace'], [1, 'Natural pace']].map(([n, label]) => `<button type="button" class="filter-pill" data-voice-speed="${n}">${label} · ${n}×</button>`).join('')}</div><div class="term-actions"><button type="button" class="btn" data-voice-play="sample">Preview voice</button>${id ? `<button type="button" class="btn" data-voice-play="term">Hear term</button><button type="button" class="btn" data-voice-play="definition">Hear definition</button>` : ''}<button type="button" class="btn" data-voice-stop>Stop audio</button><button type="button" class="text-button" data-voice-refresh>Refresh voices</button></div><p class="voice-status" role="status">${voiceAvailabilityText(voices)}</p><details class="voice-install-help"><summary>Need more English voices?</summary><p>MedLex lists English voices supplied by your browser and device. Add another English language voice in your device’s speech or accessibility settings, then refresh this list.</p><ul><li>Windows: Settings → Time & language → Speech → Manage voices.</li><li>iPhone / iPad: Settings → Accessibility → Read & Speak (or Spoken Content) → Voices → English.</li><li>Mac: System Settings → Accessibility → Read & Speak (or Spoken Content) → System voice.</li><li>Android: Settings → Accessibility or General management → Text-to-speech output.</li></ul><p>Some voices use an online service. Device voices may work offline. A device voice is a listening aid; specialist medical pronunciation can vary.</p></details></fieldset>`;
}
export function voiceAvailabilityText(voices = englishVoices()) {
  if (!('speechSynthesis' in window)) return 'Speech playback is unavailable in this browser. Written meanings remain available.';
  if (!voices.length) return 'No English voices loaded yet. Refresh voices, or add an English voice in your device settings.';
  return `${voices.length} English ${voices.length === 1 ? 'voice' : 'voices'} available · ${new Set(voices.map(v => v.lang)).size} accent ${new Set(voices.map(v => v.lang)).size === 1 ? 'option' : 'options'}.`;
}
export function voicePreferencesFrom(root) {
  const value = root.querySelector('[data-voice-select]')?.value || '',
    v = englishVoices().find(v => voiceKey(v) === value || v.name === value),
    keep = value && (value === app.v3.profile.ttsVoiceURI || value === app.v3.profile.ttsVoice);
  return {
    ttsVoice: v?.name || (keep ? app.v3.profile.ttsVoice || '' : ''),
    ttsVoiceURI: v?.voiceURI || (keep ? app.v3.profile.ttsVoiceURI || '' : ''),
    ttsAccent: root.querySelector('[data-voice-accent]')?.value || '',
    ttsRate: Number(root.querySelector('[data-voice-rate]')?.value || app.v3.profile.ttsRate || .85)
  };
}
export function selectedEnglishVoice(p) {
  const voices = englishVoices(),
    accent = p.ttsAccent || '';
  return voices.find(v => voiceKey(v) === p.ttsVoiceURI) || voices.find(v => v.name === p.ttsVoice) || voices.find(v => accent && v.lang.replace('_', '-').toLowerCase() === accent.toLowerCase()) || voices.find(v => v.lang === 'en-AU') || voices.find(v => v.default) || voices[0];
}
export function audioStatus(message) {
  document.querySelectorAll('.voice-status').forEach(el => el.textContent = message);
}
export function stopEnglishAudio(message = 'Audio stopped.', force = false) {
  const wasActive = app.englishAudioActive;
  app.englishAudioActive = false;
  app.audioSequence++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (wasActive || force) audioStatus(message);
}
export function listenEnglish(text, p = app.v3.profile) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    audioStatus('Speech playback is unavailable in this browser.');
    toast('Speech playback is unavailable in this browser.');
    return false;
  }
  const v = selectedEnglishVoice(p);
  if (!v) {
    audioStatus(voiceAvailabilityText());
    toast('No English voice is available yet. Open Voice & listening options.');
    return false;
  }
  stopEnglishAudio();
  const run = app.audioSequence,
    u = new SpeechSynthesisUtterance(text);
  u.voice = v;
  u.lang = v.lang;
  u.rate = Math.min(1.1, Math.max(.6, Number(p.ttsRate) || .85));
  u.onstart = () => {
    if (run === app.audioSequence) audioStatus('Playing · ' + v.name + ' · ' + accentName(v.lang) + ' · ' + u.rate + '×');
  };
  u.onend = () => {
    if (run === app.audioSequence) {
      app.englishAudioActive = false;
      audioStatus('Finished. Listen again, or try another English voice.');
    }
  };
  u.onerror = e => {
    if (run !== app.audioSequence || ['canceled', 'interrupted'].includes(e.error)) return;
    app.englishAudioActive = false;
    audioStatus('This voice could not play. Choose another English voice or refresh the list.');
    toast('This voice could not play. Try another English voice.');
  };
  try {
    app.englishAudioActive = true;
    speechSynthesis.speak(u);
    return true;
  } catch {
    app.englishAudioActive = false;
    audioStatus('Audio could not start. Choose another English voice.');
    return false;
  }
}
export function speak(id) {
  const t = termBy(id);
  if (t) listenEnglish(t.term);
}
export function refreshVoiceControls() {
  const voices = englishVoices();
  document.querySelectorAll('.voice-controls').forEach(root => {
    const select = root.querySelector('[data-voice-select]'),
      accent = root.querySelector('[data-voice-accent]'),
      value = select.value;
    accent.innerHTML = accentOptions(voices, accent.value);
    select.innerHTML = voiceOptions(voices, value, accent.value);
    root.querySelector('.voice-status').textContent = voiceAvailabilityText(voices);
  });
}
export function saveLiveVoice(root) {
  if (root.hasAttribute('data-voice-live')) {
    Object.assign(app.v3.profile, voicePreferencesFrom(root));
    persist();
  }
}
