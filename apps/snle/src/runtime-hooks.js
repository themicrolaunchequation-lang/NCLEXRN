    const snleViews=new Set(['home','guide','glossary','labs','tools','dossier','practice','reset','progress']);
    const routeView=()=>location.hash.replace(/^#\/?/,'').split(/[?\/]/)[0];
    if(snleViews.has(routeView()))state.view=routeView();
    let snleLastView=null,snleRenderTicket=0;
    function syncSnleRoute(){
      if(snleLastView!==state.view){
        document.body.classList.remove('snle-focus-active');
        if(routeView()!==state.view)history[snleLastView===null?'replaceState':'pushState'](null,'','#'+state.view);
        snleLastView=state.view;
      }
    }
    function restoreSnleRoute(){
      const next=routeView();
      if(snleViews.has(next)&&state.view!==next){
        clearInterval(resetTimer);clearInterval(window.__examClock);
        state.view=next;state.poster=null;state.dossierOpen=null;state.session=[];state.examSimulation=false;
        state.guideDomainInfo=null;state.glossaryInfo=false;state.committeeInfo=false;
        state.learningJourneyInfo=false;state.courseLibraryInfo=false;state.resetTimingInfo=false;
        render();scrollTo(0,0);
      }
    }
    addEventListener('hashchange',restoreSnleRoute);addEventListener('popstate',restoreSnleRoute);
