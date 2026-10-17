import catalog from './catalog.json';
export const IMAGE_BACKUP_MAX_BYTES=Math.max(80,Math.ceil(catalog.length*1.6+1))*1000000;
const IDS=new Set(catalog.map(x=>x.id)),KEY='medlex-infographic-images-v1';
export const infographicAssets=new Map();
let database,loading;
function openDB(){return new Promise((resolve,reject)=>{if(!globalThis.indexedDB){resolve(null);return;}let req;try{req=indexedDB.open('MedLex-Infographic-Images',1);}catch(e){reject(e);return;}req.onupgradeneeded=()=>req.result.createObjectStore('images',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('Image storage is blocked by another tab.'));});}
export function validateImageRecord(row){
 if(!row||!IDS.has(row.id)||typeof row.data!=='string'||row.data.length>1600000)throw Error('Unsupported image record.');
 const match=row.data.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);if(!match)throw Error('Use a PNG, JPEG or WebP image.');
 const binary=atob(match[2].slice(0,40));const valid=match[1]==='png'?binary.startsWith('\x89PNG\r\n\x1a\n'):match[1]==='jpeg'?binary.startsWith('\xff\xd8\xff'):binary.startsWith('RIFF')&&binary.slice(8,12)==='WEBP';if(!valid)throw Error('The image content does not match its type.');
 return{id:row.id,data:row.data,mime:'image/'+match[1],name:String(row.name||'Study image').slice(0,100),updatedAt:Number.isFinite(row.updatedAt)?row.updatedAt:Date.now(),saved:row.saved!==false};
}
export function validateImagePack(pack){if(pack?.app!=='MedLexInfographicImages'||pack.version!==1||!Array.isArray(pack.images)||pack.images.length>catalog.length)throw Error('Choose a supported MedLex image backup.');const rows=pack.images.map(validateImageRecord);if(new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Duplicate topic IDs in the image backup.');return rows;}
export async function loadInfographicAssets(){
 return loading ||= (async()=>{let rows=[];try{database=await openDB();if(database)rows=await new Promise((resolve,reject)=>{const tx=database.transaction('images','readonly'),req=tx.objectStore('images').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});else rows=JSON.parse(localStorage.getItem(KEY)||'[]');}catch{try{rows=JSON.parse(localStorage.getItem(KEY)||'[]');}catch{rows=[];}}
 for(const row of Array.isArray(rows)?rows:[])try{const asset=validateImageRecord(row);infographicAssets.set(asset.id,asset);}catch{}return infographicAssets;
 })();
}
export async function saveInfographicImage(row){await loadInfographicAssets();const item=validateImageRecord(row);infographicAssets.set(item.id,{...item,saved:false});try{if(database)await new Promise((resolve,reject)=>{const tx=database.transaction('images','readwrite');tx.objectStore('images').put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Image save interrupted.'));});else localStorage.setItem(KEY,JSON.stringify([...infographicAssets.values()].map(x=>({...x,saved:true}))));infographicAssets.set(item.id,{...item,saved:true});return true;}catch{throw Error('Image visible for this session only. Export image backup before closing; browser storage could not save it.');}}
export async function removeInfographicImage(id){await loadInfographicAssets();if(!IDS.has(id))return;if(database)await new Promise((resolve,reject)=>{const tx=database.transaction('images','readwrite');tx.objectStore('images').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});else localStorage.setItem(KEY,JSON.stringify([...infographicAssets.values()].filter(x=>x.id!==id)));infographicAssets.delete(id);}
export function infographicImagePack(){return{app:'MedLexInfographicImages',version:1,exportedAt:new Date().toISOString(),images:[...infographicAssets.values()].map(({saved,...item})=>item)};}
export async function prepareInfographicImage(file,id){
 if(!IDS.has(id)||!file||file.size>8e6||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPEG or WebP smaller than 8 MB.');
 const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('The image file could not be read.'));reader.readAsDataURL(file);});
 const img=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('The image could not be decoded.'));image.src=data;});
 if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>32000000)throw Error('Choose an image below 32 megapixels.');
 const scale=Math.min(1,2000/img.naturalWidth,2500/img.naturalHeight),canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image resizing is unavailable in this browser.');ctx.drawImage(img,0,0,canvas.width,canvas.height);
 let resized=canvas.toDataURL('image/webp',.9);if(resized.length>1600000)resized=canvas.toDataURL('image/webp',.65);if(resized.length>1600000)throw Error('This image is still too large after resizing. Use a smaller export.');
 return validateImageRecord({id,data:resized,name:file.name,updatedAt:Date.now()});
}
