import {app} from '../../state/runtime.js';
import {esc} from '../../ui/dom.js';
const liveScenes=new Set(),sceneViews=new Map();
const requestFrame=callback=>globalThis.requestAnimationFrame?.(callback)||0,cancelFrame=id=>globalThis.cancelAnimationFrame?.(id);
const toRadians=degrees=>degrees*Math.PI/180;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

/** Offline, dependency-free interaction shell shared by both learning scenes. */
export function scene3DFrame(kind,content,{label,markers=[]}={}){
 const id='scene3d-'+kind;
 return `<div class="scene3d" data-scene3d="${kind}" data-markers="${esc(JSON.stringify(markers))}"><div class="scene3d-topline"><span class="chip">INTERACTIVE 3D</span><span class="scene3d-mode" role="status">Drag to rotate</span></div><div class="scene3d-viewport" tabindex="0" role="group" aria-label="${esc(label)}" aria-describedby="${id}-help"><div class="scene3d-floor" aria-hidden="true"></div>${kind==='atlas'?'<canvas class="scene3d-canvas" aria-hidden="true"></canvas>':''}<div class="${kind==='atlas'?'scene3d-fallback':'scene3d-object'}">${content}</div><span class="scene3d-drag-cue" aria-hidden="true">Drag to turn · explore the depth</span></div><p id="${id}-help" class="scene3d-help">Drag with a mouse or one finger. Focus the scene and use arrow keys to turn; + / − to zoom; Home to reset.${kind==='words'?' Click a word part to read its meaning.':' Select a numbered marker or use the system buttons alongside.'}</p><div class="scene3d-controls" role="group" aria-label="3D view controls"><button type="button" class="btn small" data-scene-control="left" aria-label="Turn left in the 3D view">Turn left</button><button type="button" class="btn small" data-scene-control="right" aria-label="Turn right in the 3D view">Turn right</button><button type="button" class="icon-button" data-scene-control="zoomIn" aria-label="Zoom 3D view in">+</button><button type="button" class="icon-button" data-scene-control="zoomOut" aria-label="Zoom 3D view out">−</button><button type="button" class="btn small" data-scene-control="reset">Reset view</button><button type="button" class="btn small" data-scene-control="play" aria-pressed="false">Play animation</button></div></div>`;
}

function meshPoint(shape,theta,phi){
 let x=shape.rx*Math.sin(theta)*Math.cos(phi),y=shape.ry*Math.cos(theta),z=shape.rz*Math.sin(theta)*Math.sin(phi);
 if(shape.tilt){const c=Math.cos(shape.tilt),s=Math.sin(shape.tilt);[x,y]=[x*c-y*s,x*s+y*c];}
 return[x+shape.x,y+shape.y,z+(shape.z||0)];
}
/** Volumetric ellipsoid meshes, not a flat image turned in perspective. */
function bodyMesh(){
 const shapes=[{x:0,y:-165,rx:24,ry:31,rz:23},{x:0,y:-126,rx:13,ry:16,rz:13},{x:0,y:-67,rx:49,ry:65,rz:27},{x:0,y:5,rx:39,ry:35,rz:25},...[-1,1].flatMap(side=>[{x:side*61,y:-77,rx:13,ry:43,rz:14,tilt:side*-.22},{x:side*77,y:-8,rx:10,ry:31,rz:11,tilt:side*-.18},{x:side*84,y:32,rx:10,ry:16,rz:9},{x:side*23,y:71,rx:18,ry:47,rz:18,tilt:side*.04},{x:side*27,y:150,rx:12,ry:41,rz:13},{x:side*27,y:193,z:10,rx:13,ry:10,rz:24}])],faces=[];
 for(const shape of shapes)for(let ring=0;ring<10;ring++)for(let side=0;side<16;side++){
  const a=meshPoint(shape,ring*Math.PI/10,side*Math.PI/8),b=meshPoint(shape,(ring+1)*Math.PI/10,side*Math.PI/8),c=meshPoint(shape,(ring+1)*Math.PI/10,(side+1)*Math.PI/8),d=meshPoint(shape,ring*Math.PI/10,(side+1)*Math.PI/8);
  faces.push([a,b,c],[a,c,d]);
 }
 return faces;
}
function rotatePoint(point,yaw,pitch){const[yC,yS,pC,pS]=[Math.cos(yaw),Math.sin(yaw),Math.cos(pitch),Math.sin(pitch)],x=point[0]*yC+point[2]*yS,z=-point[0]*yS+point[2]*yC;return[x,point[1]*pC-z*pS,point[1]*pS+z*pC];}
function colorChannels(value){const h=value.trim();if(h.startsWith('#')){const v=h.length===4?h.slice(1).split('').map(c=>c+c).join(''):h.slice(1);return[0,2,4].map(i=>parseInt(v.slice(i,i+2),16));}const values=h.match(/[\d.]+/g);return values?values.slice(0,3).map(Number):[7,109,105];}
function makeBodyRenderer(root,view){
 const canvas=root.querySelector('canvas');if(!canvas||typeof CanvasRenderingContext2D==='undefined')return null;
 let ctx;try{ctx=canvas.getContext('2d');}catch{return null;}if(!ctx)return null;
 const faces=bodyMesh(),markers=JSON.parse(root.dataset.markers||'[]');let hitTargets=[];
 return{draw(yaw,pitch,zoom){
  const rect=view.getBoundingClientRect(),width=rect.width,height=rect.height,dpr=Math.min(devicePixelRatio||1,2);if(!width||!height)return;
  if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  const styles=getComputedStyle(root),base=colorChannels(styles.getPropertyValue('--brand-teal')),text=styles.getPropertyValue('--text').trim(),surface=styles.getPropertyValue('--surface').trim(),accent=styles.getPropertyValue('--brand-copper').trim(),scale=Math.min(width/285,height/480)*zoom;
  const project=p=>{const f=700/(700-p[2]);return[width/2+p[0]*scale*f,height*.49+p[1]*scale*f];};
  const rotated=faces.map(face=>{const p=face.map(v=>rotatePoint(v,yaw,pitch)),a=p[0],u=p[1].map((n,i)=>n-a[i]),v=p[2].map((n,i)=>n-a[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...normal)||1,light=clamp((normal[0]*-.25+normal[1]*-.4+normal[2]*.8)/length*.35+.7,.34,1);return{p,z:p.reduce((sum,v)=>sum+v[2],0)/3,light};}).sort((a,b)=>a.z-b.z);
  for(const face of rotated){const p=face.p.map(project),rgb=base.map(v=>Math.round(clamp(v*face.light+90*face.light,0,255)));ctx.fillStyle=`rgb(${rgb.join(',')})`;ctx.beginPath();ctx.moveTo(...p[0]);ctx.lineTo(...p[1]);ctx.lineTo(...p[2]);ctx.closePath();ctx.fill();}
  hitTargets=[];const layout=markers.map((marker,i)=>{const point=rotatePoint([(marker.x-150)*.9,(marker.y-225)*.94,31],yaw,pitch),anchor=project(point);return{marker,i,anchor,side:marker.x<150?0:1,pos:[width*(marker.x<150?.1:.9),clamp(anchor[1],24,height-48)]};});
  for(const side of[0,1]){const column=layout.filter(p=>p.side===side).sort((a,b)=>a.pos[1]-b.pos[1]);for(let i=1;i<column.length;i++)column[i].pos[1]=Math.max(column[i].pos[1],column[i-1].pos[1]+30);if(column.length&&column.at(-1).pos[1]>height-48){column.at(-1).pos[1]=height-48;for(let i=column.length-2;i>=0;i--)column[i].pos[1]=Math.min(column[i].pos[1],column[i+1].pos[1]-30);}}
  for(const{marker,i,anchor,pos}of layout){const selected=marker.chapter===app.atlasChapter;
   ctx.strokeStyle=accent;ctx.lineWidth=selected?1.5:.7;ctx.globalAlpha=selected?1:.5;ctx.beginPath();ctx.moveTo(...anchor);ctx.lineTo(...pos);ctx.stroke();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(...anchor,selected?4:2,0,Math.PI*2);ctx.fillStyle=accent;ctx.fill();ctx.beginPath();ctx.arc(...pos,selected?15:12,0,Math.PI*2);ctx.fillStyle=selected?accent:surface;ctx.fill();ctx.strokeStyle=selected?accent:text;ctx.lineWidth=selected?2:1;ctx.stroke();ctx.fillStyle=selected?surface:text;ctx.font='600 14px Studio, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),pos[0],pos[1]+.5);hitTargets.push({...marker,x:pos[0],y:pos[1]});
  }
  root.classList.add('scene3d-ready');root.dataset.meshFaces=String(faces.length);
 },hit(x,y){return hitTargets.find(p=>Math.hypot(p.x-x,p.y-y)<20);}};
}

export function disposeScenes3D(){for(const cleanup of liveScenes)cleanup();liveScenes.clear();}
export function mountScenes3D(){
 for(const root of document.querySelectorAll('[data-scene3d]')){
  if(root.dataset.mounted)continue;root.dataset.mounted='true';
  const viewport=root.querySelector('.scene3d-viewport'),kind=root.dataset.scene3d,object=root.querySelector('.scene3d-object'),renderer=kind==='atlas'?makeBodyRenderer(root,viewport):null,abort=new AbortController(),signal=abort.signal;
  const saved=sceneViews.get(kind);let yaw=saved?.yaw??(kind==='words'?-12:0),pitch=saved?.pitch??(kind==='words'?-10:0),zoom=saved?.zoom??1,playing=false,frame=0,last=0,drag=null,suppressClick=false,visible=true,phase=0,baseYaw=yaw;
  const reduced=()=>app.state?.reduced===true||(app.state?.reduced!==false&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const playButton=root.querySelector('[data-scene-control=play]'),status=root.querySelector('.scene3d-mode');
  function draw(){root.dataset.yaw=String(yaw);root.dataset.pitch=String(pitch);root.dataset.zoom=String(zoom);if(object){object.style.setProperty('--scene-yaw',yaw+'deg');object.style.setProperty('--scene-pitch',pitch+'deg');object.style.setProperty('--scene-zoom',zoom);}renderer?.draw(toRadians(yaw),toRadians(pitch),zoom);}
  function setPlaying(value){playing=!!value&&!reduced()&&typeof globalThis.requestAnimationFrame==='function';root.dataset.playing=String(playing);playButton.setAttribute('aria-pressed',String(playing));playButton.textContent=playing?'Pause animation':'Play animation';status.textContent=playing?'Slow rotation':'Drag to rotate';if(value&&reduced())status.textContent='Reduced motion · drag to explore';if(playing){baseYaw=yaw;phase=0;}cancelFrame(frame);if(playing&&visible&&!document.hidden)frame=requestFrame(animate);}
  function animate(time){if(!root.isConnected||!playing||!visible||document.hidden)return;if(reduced()){setPlaying(false);return;}if(time-last>=40){phase+=.016;yaw=baseYaw+Math.sin(phase)*(kind==='atlas'?38:14);draw();last=time;}frame=requestFrame(animate);}
  function change(action){setPlaying(false);if(action==='left')yaw-=15;if(action==='right')yaw+=15;if(action==='up')pitch=clamp(pitch-10,-35,35);if(action==='down')pitch=clamp(pitch+10,-35,35);if(action==='zoomIn')zoom=clamp(zoom+.1,.75,1.35);if(action==='zoomOut')zoom=clamp(zoom-.1,.75,1.35);if(action==='reset'){yaw=kind==='words'?-12:0;pitch=kind==='words'?-10:0;zoom=1;}draw();}
  root.addEventListener('click',e=>{const button=e.target.closest('[data-scene-control]');if(button){if(button.dataset.sceneControl==='play')setPlaying(!playing);else change(button.dataset.sceneControl);}}, {signal});
  viewport.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('a,input,select'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch,target:e.target,moved:false};}, {signal});
  viewport.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)>6){drag.moved=true;viewport.setPointerCapture(e.pointerId);setPlaying(false);viewport.classList.add('dragging');}if(!drag.moved)return;e.preventDefault();yaw=drag.yaw+dx*.45;pitch=clamp(drag.pitch-dy*.25,-35,35);draw();}, {signal});
  function finish(e){if(!drag||e.pointerId!==drag.id)return;suppressClick=drag.moved;if(drag.moved){e.preventDefault();setTimeout(()=>suppressClick=false,0);}if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);viewport.classList.remove('dragging');drag=null;}
  viewport.addEventListener('pointerup',finish,{signal});viewport.addEventListener('pointercancel',finish,{signal});viewport.addEventListener('lostpointercapture',()=>{drag=null;viewport.classList.remove('dragging');},{signal});
  viewport.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();return;}if(renderer&&e.target.tagName==='CANVAS'){const rect=viewport.getBoundingClientRect(),hit=renderer.hit(e.clientX-rect.left,e.clientY-rect.top);if(hit)document.querySelector(`.atlas-system-list [data-id="${hit.chapter}"]`)?.click();}},{capture:true,signal});
  viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;const action={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down','+':'zoomIn','=':'zoomIn','-':'zoomOut',Home:'reset'}[e.key];if(action){e.preventDefault();e.stopPropagation();change(action);}}, {signal});
  const resize=()=>draw();window.addEventListener('resize',resize,{signal});
  const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener?.('change',()=>{if(reduced())setPlaying(false);},{signal});
  document.addEventListener('visibilitychange',()=>{cancelFrame(frame);if(!document.hidden&&playing)frame=requestFrame(animate);},{signal});
  let observer;if(typeof IntersectionObserver!=='undefined'){observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;cancelFrame(frame);if(playing&&visible&&!document.hidden)frame=requestFrame(animate);});observer.observe(root);}
  draw();setPlaying((saved?.playing??true)&&!reduced()&&(kind==='words'||!!renderer));liveScenes.add(()=>{sceneViews.set(kind,{yaw,pitch,zoom,playing});cancelFrame(frame);abort.abort();observer?.disconnect();});
 }
}
