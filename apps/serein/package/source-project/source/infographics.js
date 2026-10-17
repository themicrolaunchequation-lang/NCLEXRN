/* Serein educational infographic reader. No tracking or private-record storage. */
(function(S){
'use strict';
S.createInfographics=function(c){
 const cards=S.infographicCards,esc=c.esc,icon=c.icon;
 let category='All',lastImage='',direction=1,start=null,suppressClick=false,pendingFocus='';
 const categories=['All','Reset','Recovery','Work','Privacy'];
 const filtered=()=>category==='All'?cards:cards.filter(x=>x.category===category);
 const current=()=>cards.find(x=>x.id===c.route().tab)||cards[0];
 const imageURL=card=>S.mediaURL(card.image);
 function select(id){
  const card=cards.find(x=>x.id===id);if(!card)return;
  pendingFocus=document.activeElement?.dataset.ig||'';
  direction=cards.indexOf(card)>=cards.indexOf(current())?1:-1;
  c.navigate('infographics/'+card.id,{focus:false,scroll:false});
 }
 function move(amount){const list=filtered(),i=list.findIndex(x=>x.id===current().id);if(list[i+amount])select(list[i+amount].id);}
 function sourceHTML(card){
  const external=/^https:\/\//.test(card.source.url);
  return '<a class="source-link" href="'+esc(card.source.url)+'"'+(external?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(card.source.title)+(external?' ↗':' →')+'</a><p class="small-note">'+esc(card.source.date)+' · Checked '+esc(card.checked)+'</p>';
 }
 function render(){
  const card=current();if(category!=='All'&&card.category!==category)category='All';
  const list=filtered(),i=list.findIndex(x=>x.id===card.id);
  return '<header class="page-header infographic-heading"><div><p class="eyebrow">SEREIN / VISUAL LEARNING</p><h1>A clearer picture. A useful next step.</h1><p class="page-sub">Twelve richly illustrated guides for real working days. Read at your pace, enlarge a page, or explore the sources.</p></div><span class="infographic-count">12 illustrated guides</span></header>'+
   '<div class="infographic-filters" role="group" aria-label="Infographic topics">'+categories.map(name=>'<button class="ig-filter" data-ig="filter" data-value="'+name+'" aria-pressed="'+(category===name)+'">'+name+'</button>').join('')+'</div>'+
   '<section class="ig-viewer" aria-label="Educational infographic viewer" aria-roledescription="carousel" data-key="infographic-reader">'+
    '<div class="ig-book"><div class="ig-pagebar"><div><span class="eyebrow">'+esc(card.category)+'</span><p id="ig-position" aria-live="polite" aria-atomic="true">'+(i+1)+' of '+list.length+' · '+esc(card.title)+'</p></div><div class="ig-turns"><button class="icon-btn" data-ig="previous" aria-label="Previous infographic"'+(i===0?' disabled':'')+'>'+icon('arrow')+'</button><button class="icon-btn" data-ig="next" aria-label="Next infographic"'+(i===list.length-1?' disabled':'')+'>'+icon('arrow')+'</button></div></div>'+
     '<figure class="ig-figure" aria-label="'+esc(card.title)+'"><button class="ig-artwork" data-ig="zoom" aria-label="Enlarge '+esc(card.title)+'" aria-describedby="ig-image-help"><img id="ig-image" src="'+esc(imageURL(card))+'" width="'+card.width+'" height="'+card.height+'" alt="'+esc(card.title+'. '+card.metric+': '+card.metricLabel+'. Full text follows this image.')+'" decoding="async"></button><figcaption id="ig-image-help">Illustrated infographic · Click to enlarge · Swipe or use the arrow buttons to flip</figcaption></figure>'+
     '<div class="ig-actions"><button class="button button-outline" data-ig="zoom">'+icon('expand')+' Enlarge image</button><a class="button button-outline" href="'+esc(imageURL(card))+'" download="Serein-'+esc(card.id)+'.webp">'+icon('download')+' Download image</a></div><p class="small-note ig-key-help">With the viewer focused: ← / → changes the page; Home / End jumps to the first / last page. Pages never turn automatically.</p></div>'+
    '<div class="ig-reading" data-key="infographic-text"><p class="eyebrow">'+esc(card.kind)+'</p><h2 id="ig-reading-title">'+esc(card.title)+'</h2><div class="ig-fact"><strong>'+esc(card.metric)+'</strong><span>'+esc(card.metricLabel)+'</span><p>'+esc(card.metricNote)+'</p></div><p>'+esc(card.summary)+'</p><dl class="ig-context"><dt>Who it is for</dt><dd>'+esc(card.who)+'</dd><dt>When to use it</dt><dd>'+esc(card.when)+'</dd><dt>Why it matters</dt><dd>'+esc(card.why)+'</dd></dl><h3>How to put it into practice</h3><ol class="ig-steps">'+card.steps.map(([title,body])=>'<li><strong>'+esc(title)+'</strong><p>'+esc(body)+'</p></li>').join('')+'</ol><a class="button button-teal" href="#'+esc(card.action.route)+'">'+esc(card.action.label)+' '+icon('arrow')+'</a><details class="ig-source"><summary>Source, context &amp; limitations</summary><p>'+esc(card.limit)+'</p>'+sourceHTML(card)+'</details></div></section>'+
   '<section class="ig-collection" aria-labelledby="ig-collection-heading"><div class="section-heading"><div><h2 id="ig-collection-heading">Choose a page</h2><p>'+list.length+' '+(category==='All'?'guides in the collection':category.toLowerCase()+' guides')+'</p></div><a class="text-button" href="#toolkit">Return to Toolkit →</a></div><div class="ig-thumbnails">'+list.map((x,n)=>'<button class="ig-thumb" data-ig="select" data-id="'+x.id+'" aria-pressed="'+(x.id===card.id)+'"><img src="'+esc(S.mediaURL(x.thumbnail))+'" width="120" height="160" alt="" loading="lazy" decoding="async"><span><small>'+String(n+1).padStart(2,'0')+' / '+esc(x.category)+'</small><strong>'+esc(x.title)+'</strong></span></button>').join('')+'</div></section>';
 }
 function zoom(){
  const card=current();
  c.openModal(card.title,'<div class="ig-zoom"><p class="small-note">Scroll in both directions to explore the enlarged image. A text version and source details are available in the reader.</p><div class="ig-zoom-image-wrap" tabindex="0" role="region" aria-label="Enlarged infographic; scroll horizontally and vertically"><img src="'+esc(imageURL(card))+'" width="'+card.width+'" height="'+card.height+'" alt="'+esc(card.title+'. '+card.metric+': '+card.metricLabel)+'"></div><a class="button button-outline" href="'+esc(imageURL(card))+'" download="Serein-'+esc(card.id)+'.webp">'+icon('download')+' Download this infographic</a></div>');
  document.querySelector('#modal').classList.add('ig-zoom-dialog');
 }
 function handle(button,event){
  const action=button.dataset.ig;
  if(action==='filter'){
   if(!categories.includes(button.dataset.value))return;
   category=button.dataset.value;const list=filtered();select(list.some(x=>x.id===current().id)?current().id:list[0].id);
  }else if(action==='next')move(1);
  else if(action==='previous')move(-1);
  else if(action==='select')select(button.dataset.id);
  else if(action==='zoom'){if(suppressClick&&event?.detail!==0){suppressClick=false;return;}suppressClick=false;zoom();}
 }
 function keyboard(event){
  if(c.route().view!=='infographics'||document.querySelector('dialog[open]')||!event.target.closest('.ig-viewer')||event.target.closest('input,select,textarea,a,summary,[contenteditable="true"]')||event.ctrlKey||event.altKey||event.metaKey)return false;
  const key=event.key.toLowerCase();if(!['arrowleft','arrowright','home','end'].includes(key))return false;
  event.preventDefault();event.stopImmediatePropagation();
  if(key==='arrowleft'||key==='arrowright')move(key==='arrowleft'?-1:1);else{const list=filtered();select(key==='home'?list[0].id:list[list.length-1].id);}return true;
 }
 function pointerDown(event){
  suppressClick=false;start=null;
  if(c.route().view==='infographics'&&event.isPrimary!==false&&event.pointerType!=='mouse'&&event.target.closest('.ig-artwork'))start={x:event.clientX,y:event.clientY,id:event.pointerId};
 }
 function pointerUp(event){
  if(!start||start.id!==event.pointerId)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;
  if(c.route().view==='infographics'&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5){suppressClick=true;move(dx<0?1:-1);}
 }
 function mounted(){
  if(c.route().view!=='infographics'){lastImage='';return;}
  const card=current(),img=document.querySelector('#ig-image');
  if(pendingFocus==='next'||pendingFocus==='previous'){
   const control=document.querySelector('[data-ig="'+pendingFocus+'"]');
   if(control?.disabled)document.querySelector('[data-ig="'+(pendingFocus==='next'?'previous':'next')+'"]:not(:disabled)')?.focus({preventScroll:true});
  }
  pendingFocus='';
  if(img&&lastImage!==card.id&&!c.reduced()&&typeof img.animate==='function')img.animate([{opacity:.5,transform:'perspective(1200px) rotateY('+direction*6+'deg) translateX('+direction*10+'px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
  lastImage=card.id;
 }
 function initialise(){
  document.addEventListener('pointerdown',pointerDown,{passive:true});document.addEventListener('pointerup',pointerUp,{passive:true});document.addEventListener('pointercancel',()=>{start=null;suppressClick=false;},{passive:true});
  document.querySelector('#modal').addEventListener('close',()=>document.querySelector('#modal').classList.remove('ig-zoom-dialog'));
 }
 return {render,handle,keyboard,mounted,initialise};
};
})(globalThis.Serein=globalThis.Serein||{});
