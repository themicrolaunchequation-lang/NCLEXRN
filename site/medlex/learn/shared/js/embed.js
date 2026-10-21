/* Marks a deck that is shown inside the MedLex lesson viewer so embed.css can fit it to one screen. */
try { if (window.top !== window) document.documentElement.classList.add('hca-embed'); } catch (e) { document.documentElement.classList.add('hca-embed'); }

/* Viewer-only controls; medical text and the exported standalone decks are unchanged. */
document.addEventListener('DOMContentLoaded', function () {
  if (!document.documentElement.classList.contains('hca-embed') || !document.querySelector('.course-view')) return;
  document.getElementById('mainDialog')?.setAttribute('aria-labelledby', 'dialogEyebrow');
  const sidebar = document.querySelector('.sidebar'), atlas = document.querySelector('.term-atlas-open');
  document.querySelectorAll('.detail-read').forEach(button => { button.textContent = 'Reading view'; });
  if (atlas && atlas.firstChild?.nodeType === 3) atlas.firstChild.textContent = 'Illustrated terms ';
  document.querySelectorAll('.build-reveal').forEach(button => { button.textContent = 'Build & explain'; });
  const key = document.createElement('button'); key.type = 'button'; key.className = 'study-key-open'; key.textContent = 'Visual study key';
  if (atlas) atlas.after(key); else if (sidebar) sidebar.prepend(key);
  const sync = () => { key.disabled = !document.querySelector('.slide.active .slide-art'); };
  new MutationObserver(sync).observe(document.getElementById('slides'), {subtree:true,attributes:true,attributeFilter:['class']}); sync();
  let opener = null;
  // Capture the visible opener before the existing deck code calls showModal().
  document.addEventListener('click', function (event) { if (!event.target.closest('dialog')) opener = event.target.closest('button,a,input') || document.activeElement; }, true);
  key.addEventListener('click', function () { document.querySelector('.slide.active .slide-art')?.click(); opener = key; });
  document.addEventListener('click', function (event) {
    const art = event.target.closest?.('.slide-art'); if (!art) return;
    queueMicrotask(function () {
      const model = window.HCAStudyModels?.[art.dataset.label], panel = document.querySelector('.art-inspector');
      if (!model || !panel) return;
      const image = panel.querySelector('img'), heading = panel.querySelector('h2'), note = panel.querySelector('p'), credit = panel.querySelector('a');
      image.src = model.src; image.alt = model.alt; heading.textContent = model.alt;
      note.textContent = 'A conceptual teaching illustration. Use the lesson text and sources for the precise clinical meaning.';
      credit.href = model.source; credit.textContent = 'Artwork credits';
    });
  }, true);

  const restore = new WeakMap();
  new MutationObserver(function (changes) {
    changes.forEach(function (change) {
      const dlg = change.target; if (dlg.tagName !== 'DIALOG') return;
      if (dlg.open) {
        if (!restore.has(dlg)) restore.set(dlg, opener || document.activeElement);
        if (!dlg.contains(document.activeElement)) (dlg.querySelector('button:not([disabled]),input,a[href]') || dlg).focus({preventScroll:true});
      } else {
        const back = restore.get(dlg); restore.delete(dlg);
        if (back && back.isConnected && !document.querySelector('dialog[open]') && back.getClientRects().length) back.focus({preventScroll:true});
      }
    });
  }).observe(document.body, {subtree:true,attributes:true,attributeFilter:['open']});
});

window.HCAStudyModels={"heart organ":{"src":"shared/img/266ad679f4277131.webp","alt":"Heart teaching model with the major vessels","source":"credits/batch2-asset-credits.json"},"lungs":{"src":"shared/img/232c74bc795ee5ef.webp","alt":"Respiratory teaching model showing the lungs and airways","source":"credits/batch2-asset-credits.json"},"neurology":{"src":"shared/img/92791b4319f8232a.webp","alt":"Brain teaching model","source":"credits/batch3-asset-credits.json"},"skeleton":{"src":"shared/img/4f994e795561a67e.webp","alt":"Skeleton teaching model","source":"credits/batch2-asset-credits.json"},"blood cells":{"src":"shared/img/b1322eb5fac19e6e.webp","alt":"Conceptual illustration of blood cells","source":"credits/batch3-asset-credits.json"},"book":{"src":"shared/img/5ccd16687255fde8.webp","alt":"Medical terminology study materials","source":"credits/batch1-asset-credits.json"}};
