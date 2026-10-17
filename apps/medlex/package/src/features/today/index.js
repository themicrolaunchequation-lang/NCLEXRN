import { renderPage } from "../../ui/page.js";
// Phase 1: canonical features/today/index implementation.
import { COURSE_MODULES, QUOTES, TERMS } from '../../data/index.js';
import { dueCount, today } from '../learn/legacy-tools.js';
import { streak } from '../../state/actions.js';
import { app } from '../../state/runtime.js';
import { getModule, moduleStatus, outcomeCount, pct } from '../../state/selectors.js';
import { header } from '../../ui/components/index.js';
import { esc, main } from '../../ui/dom.js';
export function home() {
  const curated = TERMS.filter(t => t.parts.length || t.plain !== t.definition),
    n = Math.floor(Date.now() / 86400000),
    d = curated[n % curated.length],
    m = getModule(app.course.last),
    a = app.v3.activity[today()] || {
      minutes: 0,
      items: 0
    },
    goal = app.v3.profile.dailyGoalMin || 10,
    h = new Date().getHours(),
    g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  renderPage(header('YOUR DAILY LEARNING SPACE', `${g}${app.state.name ? ', ' + esc(app.state.name.split(' ')[0]) : ''}.`, 'A little clarity today. Greater confidence tomorrow.', `<div class="daily-status"><span>${streak()} day streak</span><span class="goal-orb" aria-label="${Math.floor(a.minutes)} of ${goal} minutes">${Math.floor(a.minutes)}/${goal}<small>min today</small></span></div>`) + `<section class="continue-card"><div><span class="eyebrow">${moduleStatus(m)} · ${m.affixKind ? 'Word elements' : 'Chapter ' + m.chapter}</span><h2>${esc(m.title)}</h2><p>${esc(m.subtitle)}</p><div class="progress-track"><i style="width:${pct(outcomeCount(m), m.outcomes.length)}%"></i></div><p>${outcomeCount(m)} of ${m.outcomes.length} outcomes self-rated</p><a class="btn primary" href="#module?id=${m.id}">${outcomeCount(m) ? 'Resume learning' : 'Start this chapter'} <span>→</span></a></div><div class="continue-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span>Understand.<br><em>Connect.</em><br>Remember.</span><small>THE LANGUAGE OF BETTER CARE</small></div></section><div class="today-grid"><section class="surface reviews-card"><span class="eyebrow">SPACED RECALL</span><h2>${dueCount()} <span class="muted">reviews due</span></h2><p>${dueCount() ? 'Your next connection is waiting. Revisit up to 20 words in a focused session.' : 'Build your recall habit. Start a short set of new words, then revisit them over time.'}</p><button class="btn" data-action="flashstart">${dueCount() ? 'Review now' : 'Try recall cards'} →</button></section><section class="daily-card"><div class="card-kicker">WORD OF THE DAY <button class="bookmark" data-action="save" data-id="${d.id}" aria-label="Save word of the day">${app.state.saved.includes(d.id) ? '◆' : '◇'}</button></div><h3>${esc(d.term)}</h3><p class="definition">${esc(d.definition)}</p><div class="anatomy-inline">${d.parts.map(p => `<span class="${p.type}">${esc(p.text)}<small>${esc(p.type)}</small></span>`).join('')}</div><div class="daily-bottom"><button class="text-button" data-action="term" data-id="${d.id}">Explore this word →</button><button class="btn small" data-action="speak" data-id="${d.id}">Listen</button></div></section></div><div class="section-head"><div><span class="eyebrow">A FEW MINUTES, WELL SPENT</span><h2>Make a connection.</h2></div><a class="text-button" href="#practice">All practice →</a></div><div class="quick-grid"><button class="surface quick-tile" data-action="quiz" data-id="meaning"><span class="tile-number">01</span><h3>Meaning check</h3><p>5 questions · about 3 min</p></button><a class="surface quick-tile" href="#module?id=${m.id}&tab=practice"><span class="tile-number">02</span><h3>Spell & recognise</h3><p>Practice from your current chapter</p></a><button class="surface quick-tile" data-v3="build"><span class="tile-number">03</span><h3>Build a word</h3><p>Curated word parts · 5 rounds</p></button></div><div class="section-head"><div><span class="eyebrow">EXPLORE THE BODY</span><h2>One system. Many connections.</h2></div><a class="text-button" href="#learn?view=systems">Explore systems →</a></div><div class="system-carousel">${COURSE_MODULES.filter(x => x.words.length >= 100 && !x.affixKind).map(x => `<a href="#module?id=${x.id}" class="surface"><span class="eyebrow">Chapter ${x.chapter}</span><h3>${esc(x.title)}</h3><p>${x.words.length} terms</p><span>${pct(x.words.filter(id => app.state.learned.includes(id)).length, x.words.length)}% familiar →</span></a>`).join('')}</div><div class="quote-banner"><span class="quote-sign" aria-hidden="true">“</span><div><blockquote>${QUOTES[n % QUOTES.length]}</blockquote><cite>MEDLEX · ORIGINAL LEARNING REFLECTION</cite></div></div>`, {
    overview: true
  });
}
