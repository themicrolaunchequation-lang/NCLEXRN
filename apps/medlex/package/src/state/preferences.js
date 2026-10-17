// Phase 1: canonical state/preferences implementation.
import { app } from './runtime.js';
import { $ } from '../ui/dom.js';

export function applyPreferences() {
  const p = typeof app.v3 === 'undefined' ? {} : app.v3.profile;
  const choice = app.state.theme || 'system',
    dark = choice === 'dark' || choice === 'system' && matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.fontSize = (p.textScale || 1) * 112.5 + '%';
  document.documentElement.classList.toggle('high-contrast', !!p.highContrast);
  const reduce = app.state.reduced == null ? matchMedia('(prefers-reduced-motion: reduce)').matches : app.state.reduced;
  document.body.classList.toggle('reduced-motion', reduce);
  document.documentElement.dataset.motion = reduce ? 'reduce' : 'full';
  document.querySelectorAll('.sidebar [data-page=teach]').forEach(a=>a.hidden=!(p.role==='Educator'||p.teachMode));
  $('#themeButton').removeAttribute('title');
  $('#themeButton').setAttribute('aria-label', 'Theme: ' + choice + '. Change theme');
  $('#themeButton').innerHTML = themeIcon(choice) + '<span class="theme-name">' + choice[0].toUpperCase() + choice.slice(1) + '</span>';
  $('#themeButton').removeAttribute('title');
  $('#themeButton').setAttribute('aria-label', 'Theme: ' + choice[0].toUpperCase() + choice.slice(1));
  $('#profileInitial').textContent = app.state.name ? app.state.name.trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase() : 'HP';
  $('#profileInitial').setAttribute('aria-label', $('#profileInitial').textContent + ' · Learning preferences');
}
export function themeIcon(choice) {
  const path = choice === 'system' ? '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>' : choice === 'dark' ? '<path d="M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15Z"/>' : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>';
  return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">' + path + '</svg>';
}
