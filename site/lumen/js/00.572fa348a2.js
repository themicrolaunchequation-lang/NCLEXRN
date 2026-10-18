(function(){
 const V={"lib":"/lumen/vendor/ocr/tesseract.000c27d9cd.js","worker":"/lumen/vendor/ocr/worker.4bc644d9a9.js","langDir":"/lumen/vendor/ocr/45b4cb3467"};let ready=null;
 const load=()=>ready??=new Promise((ok,bad)=>{if(window.Tesseract)return ok();const s=document.createElement('script');s.src=V.lib;s.onload=ok;s.onerror=()=>{ready=null;s.remove();bad(Error('The OCR engine could not load. Check your connection and try again.'))};document.head.appendChild(s)});
 window.LumenOCR={
  preload:load,
  async createWorker(logger){
   await load();
   if(!window.Tesseract)throw Error('The local OCR engine did not load.');
   return window.Tesseract.createWorker('eng',1,{workerPath:V.worker,workerBlobURL:false,corePath:'lumen-inline-core.js',langPath:location.origin+V.langDir,logger,cacheMethod:'none'});
  }
 };
})();
