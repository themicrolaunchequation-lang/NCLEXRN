// Phase 1: canonical features/settings/language implementation.
import { WORD_PART_GLOSSES } from '../../data/config.js';
import { app } from '../../state/runtime.js';
import { termBy } from '../../state/selectors.js';
import { $, $$, esc, modal } from '../../ui/dom.js';
import { hideGuide, uiIcon } from '../../ui/guidance.js';

export const ASSIST_LANGUAGES = {
  "ar": {
    "name": "Arabic · العربية",
    "short": "Arabic",
    "dir": "rtl",
    "index": 0
  },
  "es": {
    "name": "Spanish · Español",
    "short": "Spanish",
    "dir": "ltr",
    "index": 1
  },
  "fr": {
    "name": "French · Français",
    "short": "French",
    "dir": "ltr",
    "index": 2
  },
  "pt": {
    "name": "Portuguese · Português",
    "short": "Portuguese",
    "dir": "ltr",
    "index": 3
  },
  "hi": {
    "name": "Hindi · हिन्दी",
    "short": "Hindi",
    "dir": "ltr",
    "index": 4
  },
  "ur": {
    "name": "Urdu · اردو",
    "short": "Urdu",
    "dir": "rtl",
    "index": 5
  },
  "bn": {
    "name": "Bengali · বাংলা",
    "short": "Bengali",
    "dir": "ltr",
    "index": 6
  },
  "zh-CN": {
    "name": "Chinese · 简体中文",
    "short": "Chinese (Simplified)",
    "dir": "ltr",
    "index": 7
  },
  "de": {
    "name": "German · Deutsch",
    "short": "German",
    "dir": "ltr",
    "index": 8
  },
  "ru": {
    "name": "Russian · Русский",
    "short": "Russian",
    "dir": "ltr",
    "index": 9
  },
  "id": {
    "name": "Indonesian · Bahasa Indonesia",
    "short": "Indonesian",
    "dir": "ltr",
    "index": 10
  },
  "ja": {
    "name": "Japanese · 日本語",
    "short": "Japanese",
    "dir": "ltr",
    "index": 11
  },
  "ko": {
    "name": "Korean · 한국어",
    "short": "Korean",
    "dir": "ltr",
    "index": 12
  },
  "tr": {
    "name": "Turkish · Türkçe",
    "short": "Turkish",
    "dir": "ltr",
    "index": 13
  },
  "sw": {
    "name": "Swahili · Kiswahili",
    "short": "Swahili",
    "dir": "ltr",
    "index": 14
  }
};
export const MEANING_GUIDES = {
  prefix: ['Prefix', 'A part at the beginning of a word that can modify its meaning.', 'جزء في بداية الكلمة قد يغيّر معناها.', 'Parte al principio de una palabra que puede modificar su significado.', 'Élément au début d’un mot qui peut en modifier le sens.'],
  root: ['Root', 'The central part that carries the main meaning of a word.', 'الجزء الأساسي الذي يحمل المعنى الرئيسي للكلمة.', 'Parte central que aporta el significado principal de una palabra.', 'Élément central qui porte le sens principal d’un mot.'],
  suffix: ['Suffix', 'A part at the end of a word that can modify its meaning.', 'جزء في نهاية الكلمة قد يغيّر معناها.', 'Parte al final de una palabra que puede modificar su significado.', 'Élément à la fin d’un mot qui peut en modifier le sens.'],
  vowel: ['Combining vowel', 'A vowel that joins word parts; it adds no separate clinical meaning.', 'حرف علّة يربط أجزاء الكلمة ولا يضيف معنى سريريًا مستقلًا.', 'Vocal que une partes de una palabra sin añadir un significado clínico propio.', 'Voyelle qui relie les éléments d’un mot sans ajouter de sens clinique propre.'],
  precise: ['Precise meaning', 'The complete definition. Check this after exploring the individual word parts.', 'التعريف الكامل. ارجع إليه بعد استكشاف أجزاء الكلمة.', 'Definición completa. Consúltala después de explorar las partes de la palabra.', 'Définition complète. Consultez-la après avoir exploré les éléments du mot.'],
  everyday: ['In everyday words', 'The same idea expressed in everyday language to support understanding.', 'الفكرة نفسها بلغة يومية للمساعدة على الفهم.', 'La misma idea en lenguaje cotidiano para facilitar la comprensión.', 'La même idée en langage courant pour faciliter la compréhension.'],
  fictional: ['Fictional example', 'An invented teaching sentence showing how a term can appear in a note.', 'جملة تعليمية تخيّلية توضّح كيف قد يظهر المصطلح في ملاحظة.', 'Frase didáctica inventada que muestra cómo puede aparecer un término en una nota.', 'Phrase pédagogique fictive montrant comment un terme peut figurer dans une note.'],
  save: ['Save word', 'Keep this term in your saved collection for later study.', 'احتفظ بهذا المصطلح في مجموعتك المحفوظة للدراسة لاحقًا.', 'Guarda este término en tu colección para estudiarlo después.', 'Conservez ce terme dans votre collection pour l’étudier plus tard.'],
  familiar: ['Mark as familiar', 'A personal familiarity rating. It does not replace an objective practice result.', 'تقييم شخصي للألفة بالمصطلح؛ لا يحلّ محل نتيجة تدريب موضوعية.', 'Valoración personal de familiaridad; no sustituye un resultado objetivo de práctica.', 'Évaluation personnelle de familiarité ; elle ne remplace pas un résultat objectif de pratique.']
};
export function assistLanguage() {
  return ASSIST_LANGUAGES[app.v3?.profile?.assistingLanguage] ? app.v3.profile.assistingLanguage : '';
}
export function languageOptions(selected = assistLanguage()) {
  return `<option value="">English only · no assisting language</option>` + Object.entries(ASSIST_LANGUAGES).sort((a, b) => a[1].short.localeCompare(b[1].short)).map(([code, l]) => `<option value="${code}" lang="${code}" ${selected === code ? 'selected' : ''}>${l.name}</option>`).join('');
}
export function assistingLanguageField(live = false) {
  return `<label class="language-field">Assisting language · optional<select name="assistingLanguage" ${live ? 'data-assist-language' : ''} aria-describedby="${live ? 'termLanguageNote' : 'languagePreferenceNote'}">${languageOptions()}</select></label><p id="${live ? 'termLanguageNote' : 'languagePreferenceNote'}" class="language-note">${live ? 'Bilingual word-part meanings and guides. English stays visible.' : 'English stays visible. Word-part meanings and short guides are bilingual and work offline. Full definitions have an optional online translation link.'}</p>`;
}
export function translatedLine(text, cls = '') {
  const code = assistLanguage(),
    l = ASSIST_LANGUAGES[code];
  return text && l ? `<p class="assist-gloss ${cls}" lang="${code}" dir="${l.dir}">${esc(text)}</p>` : '';
}
export function partTranslation(p) {
  const l = ASSIST_LANGUAGES[assistLanguage()];
  return l ? WORD_PART_GLOSSES[p.meaning]?.[l.index] || '' : '';
}
export function guideTranslation(key) {
  const l = ASSIST_LANGUAGES[assistLanguage()];
  return l ? MEANING_GUIDES[key]?.[l.index + 2] || '' : '';
}
export function meaningLabel(key, label = '') {
  return `<button type="button" class="meaning-label" data-meaning-guide="${key}" aria-controls="meaningGuideInline" aria-expanded="false">${esc(label || MEANING_GUIDES[key][0])}${uiIcon('help')}</button>`;
}
export function meaningGuideHTML() {
  return `<details class="word-part-guide"><summary>Simple word-part guide</summary><dl>${['prefix', 'root', 'suffix', 'vowel'].map(key => `<div><dt><span class="type-dot ${key}" aria-hidden="true"></span>${MEANING_GUIDES[key][0]}</dt><dd>${MEANING_GUIDES[key][1]}${translatedLine(guideTranslation(key))}</dd></div>`).join('')}</dl><p class="language-note">A word part is a clue. Always check the full definition in context.</p></details>`;
}
export function definitionTranslationLink(t) {
  const code = assistLanguage(),
    l = ASSIST_LANGUAGES[code];
  return l ? `<a class="text-button translation-link" href="https://translate.google.com/?sl=en&amp;tl=${code}&amp;text=${encodeURIComponent(t.definition)}&amp;op=translate" target="_blank" rel="noopener noreferrer">Translate this definition into ${l.short} ↗</a><small class="translation-note">Google Translate · online · opens a new tab and shares this definition only. Machine translation may miss medical nuance.</small>` : '';
}
export function hideMeaningTip() {
  clearTimeout(app.meaningTipTimer);
  clearTimeout(app.meaningLeaveTimer);
  if (app.meaningTipTarget) {
    const ids = (app.meaningTipTarget.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== 'meaningTooltip');
    if (ids.length) app.meaningTipTarget.setAttribute('aria-describedby', ids.join(' '));else app.meaningTipTarget.removeAttribute('aria-describedby');
  }
  app.meaningTip?.remove();
  app.meaningTip = null;
  app.meaningTipTarget = null;
}
export function tipContent(el) {
  if (el.hasAttribute('data-meaning-guide')) {
    const key = el.dataset.meaningGuide,
      g = MEANING_GUIDES[key];
    return g ? `<strong>${g[0]}</strong><p lang="en">${g[1]}</p>${translatedLine(guideTranslation(key))}` : '';
  }
  const id = el.dataset.id || app.labTerm,
    t = termBy(id),
    p = t?.parts[+el.dataset.index];
  if (!p) return '';
  return `<strong>${esc(p.text)} <span>· ${p.type === 'vowel' ? 'combining vowel' : p.type}</span></strong><p lang="en">${esc(p.meaning)}</p>${translatedLine(partTranslation(p))}<small>Click or tap to keep the meaning open.</small>`;
}
export function showMeaningTip(el) {
  hideMeaningTip();
  if (!el.isConnected) return;
  const html = tipContent(el);
  if (!html) return;
  hideGuide();
  app.meaningTip = document.createElement('div');
  app.meaningTip.id = 'meaningTooltip';
  app.meaningTip.className = 'meaning-tooltip';
  app.meaningTip.setAttribute('role', 'tooltip');
  app.meaningTip.innerHTML = html;
  (modal.open ? modal : document.body).append(app.meaningTip);
  app.meaningTipTarget = el;
  el.setAttribute('aria-describedby', ((el.getAttribute('aria-describedby') || '') + ' meaningTooltip').trim());
  const boundary = modal.open ? modal.getBoundingClientRect() : {
    left: 0,
    right: innerWidth,
    top: 0,
    bottom: innerHeight
  };
  app.meaningTip.style.maxWidth = Math.min(360, boundary.right - boundary.left - 32) + 'px';
  const r = el.getBoundingClientRect(),
    w = app.meaningTip.offsetWidth,
    h = app.meaningTip.offsetHeight;
  app.meaningTip.style.left = Math.max(boundary.left + 12, Math.min(boundary.right - w - 12, r.left)) + 'px';
  const bottom = Math.min(innerHeight, boundary.bottom) - 12,
    top = Math.max(12, boundary.top + 12);
  app.meaningTip.style.top = (r.bottom + h + 10 < bottom ? r.bottom + 8 : Math.max(top, r.top - h - 8)) + 'px';
  app.meaningTip.onpointerenter = () => clearTimeout(app.meaningLeaveTimer);
  app.meaningTip.onpointerleave = hideMeaningTip;
}
export function pinPartMeaning(id, index) {
  const p = termBy(id)?.parts[index],
    el = $('#partInline');
  if (!p || !el) return;
  hideMeaningTip();
  el.hidden = false;
  el.className = 'pinned-meaning';
  el.innerHTML = `<div class="pinned-heading"><strong>${esc(p.text)} · ${p.type === 'vowel' ? 'combining vowel' : p.type}</strong><button type="button" class="btn small" data-word-help="clear" aria-label="Close word-part meaning">Close</button></div><p lang="en">${esc(p.meaning)}</p>${translatedLine(partTranslation(p))}<p class="language-note">${MEANING_GUIDES[p.type]?.[1] || ''}</p>`;
  el.dataset.index = index;
  $$('[data-word-help="part"]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.index === index)));
}
export function pinMeaningGuide(key) {
  const g = MEANING_GUIDES[key],
    el = $('#meaningGuideInline');
  if (!g || !el) return;
  hideMeaningTip();
  const close = el.dataset.key === key && !el.hidden;
  el.hidden = close;
  $$('[data-meaning-guide]').forEach(b => b.setAttribute('aria-expanded', String(!close && b.dataset.meaningGuide === key)));
  if (close) return;
  el.dataset.key = key;
  el.innerHTML = `<strong>${g[0]}</strong><p lang="en">${g[1]}</p>${translatedLine(guideTranslation(key))}`;
}
export const meaningTarget = '[data-word-help="part"],[data-action="labpart"],[data-meaning-guide]';
