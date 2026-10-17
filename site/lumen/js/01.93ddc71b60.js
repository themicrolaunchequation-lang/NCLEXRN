(function(){
 const blobs=[];
 const decode=async id=>{const el=document.getElementById(id);let bytes=Uint8Array.from(atob(el.textContent.trim()),c=>c.charCodeAt(0));if(el.dataset.encoding==='gzip'){if(!globalThis.DecompressionStream)throw Error('This browser cannot unpack the OCR engine. Please update it.');bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}return bytes};
  let workerPath, corePath;
 window.LumenOCR={
  async createWorker(logger){
   if(!window.Tesseract)throw Error('The local OCR engine did not load.');
   if(!workerPath){
     const core=await decode('lumen-ocr-core');corePath='lumen-inline-core.js';
    const worker=await decode('lumen-ocr-worker');
    const lang=document.getElementById('lumen-ocr-lang').textContent.trim();
     const script=`const nativeFetch=self.fetch.bind(self);self.fetch=async function(input,options){if(String(input).includes('lumen-ocr-local/eng.traineddata.gz')){const data=Uint8Array.from(atob('${lang}'),c=>c.charCodeAt(0));return new Response(data,{status:200,headers:{'Content-Type':'application/octet-stream'}})}return nativeFetch(input,options)};`;
    workerPath=URL.createObjectURL(new Blob([script,'\n',core,'\n;\n',worker],{type:'text/javascript'}));blobs.push(workerPath)
   }
   return window.Tesseract.createWorker('eng',1,{workerPath,workerBlobURL:false,corePath,langPath:'https://lumen-ocr-local',logger,cacheMethod:'none'});
  }
 };
})();
