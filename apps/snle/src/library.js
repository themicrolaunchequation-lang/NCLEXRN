/* Companion study views rebuilt from the intact embedded records. */
(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mode = document.body.dataset.library;
  const tools = mode === 'tools';
  const records = tools ? window.SNLE_POSTERS : mode === 'questions' ? window.SNLE_QUESTIONS : window.SNLE_DOSSIERS.flatMap(d => d.qs.map(q => ({
    id:d.id + ':' + q.g, tool:d.title, specialty:d.specialty, stem:q.stem,
    options:q.o.map((text,i) => ({label:String.fromCharCode(65+i),text})), key:String.fromCharCode(65+q.a),
    rationale:q.r, pearl:q.p, trap:q.t, hyp:q.h, difficulty:q.d, judgment:q.c, domain:q.dom
  })));
  const root = document.querySelector('#library');
  root.innerHTML = '<header><a href="/">← SNLE learning studio</a><p>HEALTHCARE CROWN ACADEMY · COURSE LIBRARY</p><h1>' + (tools ? 'All 67 clinical tools' : mode === 'questions' ? 'All 1,350 practice questions' : 'All 350 dossier cases') + '</h1><p>Educational content, not actual examination questions. Clinical expert review remains pending. HYP labels are editorial study priorities.</p></header><section class="filters" aria-label="Library filters"><label>Search<input id="search" type="search" placeholder="Find a clinical clue or topic"></label><div id="selects"></div></section><p id="count" role="status"></p><section id="items" aria-label="Study records"></section><nav class="pager" aria-label="Library pages"><button id="previous">Previous</button><span id="position"></span><button id="next">Next</button></nav><dialog id="poster"><button id="close-poster" aria-label="Close poster">Close</button><h2 id="poster-title"></h2><img draggable="false" alt=""></dialog>';
  const fields = tools ? [['groupLabel','Learning group']] : [['tool',mode === 'questions'?'Tool':'Dossier'],['domain','Nursing domain'],...(mode === 'dossiers'?[['specialty','Specialty']]:[]),['difficulty','Difficulty'],['judgment','Clinical judgment']];
  const selectArea = document.querySelector('#selects');
  for (const [key,label] of fields) {
    const values = [...new Set(records.map(r => r[key]).filter(Boolean))].sort();
    selectArea.insertAdjacentHTML('beforeend','<label>'+label+'<select data-field="'+key+'"><option value="">All</option>'+values.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('')+'</select></label>');
  }
  selectArea.insertAdjacentHTML('beforeend','<label>Study priority<select id="hyp"><option value="0">All HYP values</option><option value="90">HYP ≥ 90</option><option value="80">HYP ≥ 80</option><option value="70">HYP ≥ 70</option></select></label><label>Sort<select id="sort"><option value="default">Original order</option><option value="high">HYP highest first</option><option value="low">HYP lowest first</option><option value="title">Title / question A–Z</option></select></label>');
  let page = 0;
  const pageSize = 20;
  function render() {
    const search = document.querySelector('#search').value.trim().toLowerCase();
    const minimum = Number(document.querySelector('#hyp').value);
    let selected = records.filter(r => (!search || [r.title,r.stem,r.tool,r.job,r.boundary,r.domain,r.specialty].join(' ').toLowerCase().includes(search)) && Number(r.meanHyp ?? r.hyp) >= minimum && [...document.querySelectorAll('[data-field]')].every(s => !s.value || r[s.dataset.field] === s.value));
    const sort = document.querySelector('#sort').value;
    if(sort === 'high' || sort === 'low') selected.sort((a,b) => (Number(a.meanHyp ?? a.hyp)-Number(b.meanHyp ?? b.hyp))*(sort === 'high'?-1:1));
    if(sort === 'title') selected.sort((a,b) => String(a.title || a.stem).localeCompare(String(b.title || b.stem)));
    const pages = Math.max(1,Math.ceil(selected.length/pageSize));page = Math.min(page,pages-1);
    document.querySelector('#count').textContent = selected.length + ' of ' + records.length + ' records';
    document.querySelector('#position').textContent = 'Page ' + (page+1) + ' of ' + pages;
    document.querySelector('#previous').disabled = page === 0;document.querySelector('#next').disabled = page >= pages-1;
    document.querySelector('#items').innerHTML = selected.slice(page*pageSize,(page+1)*pageSize).map(r => tools ?
      '<article><p>'+esc(r.groupLabel)+' · HYP '+esc(r.meanHyp)+'</p><h2>'+esc(r.title)+'</h2><p>'+esc(r.job)+'</p><p><b>Boundary:</b> '+esc(r.boundary)+'</p><p><b>Clinical pearl:</b> '+esc(r.pearl)+'</p><p><b>Trap:</b> '+esc(r.trap)+'</p><button data-open-poster="'+esc(r.id)+'">Open full poster</button></article>' :
      '<article><p>'+esc(r.id)+' · '+esc(r.domain)+' · HYP '+esc(r.hyp)+' · '+esc(r.difficulty)+' · '+esc(r.judgment)+'</p><h2>'+esc(r.stem)+'</h2><ol type="A">'+r.options.map(o=>'<li>'+esc(o.text)+'</li>').join('')+'</ol><details><summary>Reveal answer and reasoning</summary><p><b>Answer '+esc(r.key)+':</b> '+esc(r.options.find(o=>o.label===r.key)?.text)+'</p><p>'+esc(r.rationale)+'</p><p><b>Clinical pearl:</b> '+esc(r.pearl)+'</p><p><b>Trap:</b> '+esc(r.trap)+'</p>'+(r.misconceptions?'<h3>Alternative responses</h3>'+r.options.filter(o=>o.label!==r.key).map(o=>'<p><b>'+o.label+':</b> '+esc(r.misconceptions[o.label])+'</p>').join(''):'')+'</details></article>').join('') || '<p>No records match these filters.</p>';
  }
  root.addEventListener('input', e => {if(e.target.matches('input,select')){page=0;render()}});
  root.addEventListener('change', e => {if(e.target.matches('select')){page=0;render()}});
  document.querySelector('#previous').onclick=()=>{page--;render();document.querySelector('#count').scrollIntoView()};
  document.querySelector('#next').onclick=()=>{page++;render();document.querySelector('#count').scrollIntoView()};
  const dialog = document.querySelector('#poster');
  dialog.setAttribute('aria-labelledby','poster-title');
  document.querySelector('#close-poster').onclick=()=>dialog.close();
  root.addEventListener('click',e=>{const button=e.target.closest('[data-open-poster]');if(!button)return;const p=records.find(p=>p.id===button.dataset.openPoster);document.querySelector('#poster-title').textContent=p.title;const img=dialog.querySelector('img');img.src=p.dataUri;img.alt=p.title+' clinical poster';dialog.showModal()});
  // Preserve the source's stated view-only affordances; these cannot prevent screenshots.
  document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['p','s'].includes(e.key.toLowerCase()))e.preventDefault()});
  addEventListener('blur',()=>document.body.classList.add('privacy-shield'));
  addEventListener('focus',()=>document.body.classList.remove('privacy-shield'));
  render();
})();
