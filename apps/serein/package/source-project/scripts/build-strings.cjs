/* Build-time copy extraction. Runtime remains vanilla and dependency-free. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const mod={exports:{}};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{exports:mod.exports,module:mod});const acorn=mod.exports;
const root=path.join(__dirname,'..'),author=path.join(root,'source'),dist=path.join(root,'dist');fs.mkdirSync(author,{recursive:true});
const files=['app.js','advance.js','context-info.js','modern.js','insights.js','player-tools.js','vault.js','infographics.js'];let copy={},num=0;
const key=s=>{const found=Object.keys(copy).find(k=>copy[k]===s);if(found)return found;const k='copy_'+String(++num).padStart(4,'0');copy[k]=s;return k};
for(const file of files){const p=path.join(author,file);if(!fs.existsSync(p))fs.copyFileSync(path.join(dist,file),p);const src=fs.readFileSync(p,'utf8'),ast=acorn.parse(src,{ecmaVersion:'latest'});
 function render(n,parent,prop){
  if(n.type==='TemplateLiteral'&&parent?.type!=='TaggedTemplateExpression'){
   const params={};let text='';n.quasis.forEach((q,i)=>{text+=q.value.cooked;if(i<n.expressions.length){const v='v'+i;text+='{'+v+'}';params[v]=render(n.expressions[i],n,'expressions');}});
   return 'Serein.t('+JSON.stringify(key(text))+(n.expressions.length?',{'+Object.entries(params).map(([k,v])=>k+':('+v+')').join(',')+'}':'')+')';
  }
  if(n.type==='Literal'&&n.value!=='use strict'&&typeof n.value==='string'&&!(parent?.type==='Property'&&prop==='key')&&!(parent?.type==='MemberExpression'&&prop==='property')&&(/[a-zA-Z]{2}.*\s+[a-zA-Z]{2}/.test(n.value)||/^(Today|Library|Toolkit|Support|Settings|Journal|Saved|Routine|Insights|Search|Pause|Resume|Continue|Cancel|Close|Remove|Save|Begin|Done|Playing|Paused|Complete)$/.test(n.value))&&!/^[.#\[]|^\^|^data:|^assets\/|^\s*$/.test(n.value))return 'Serein.t('+JSON.stringify(key(n.value))+')';
  const children=[];for(const [k,v] of Object.entries(n)){if(v&&typeof v==='object'){if(Array.isArray(v))v.forEach(c=>{if(c?.type)children.push([c,k])});else if(v.type)children.push([v,k]);}}
  let out='',cursor=n.start;for(const [child,k] of children.sort((a,b)=>a[0].start-b[0].start)){if(child.start<cursor)continue;out+=src.slice(cursor,child.start)+render(child,n,k);cursor=child.end;}return out+src.slice(cursor,n.end);
 }
 fs.writeFileSync(path.join(dist,file),render(ast,null,''));
}
const runtime="/* English copy catalogue; content libraries remain structured in Serein.data/content. */\n(function(S){'use strict';S.STRINGS={'en-GB':"+JSON.stringify(copy)+"};S.locale='en-GB';S.t=function(key,vars){const text=S.STRINGS[S.locale]?.[key]??S.STRINGS['en-GB'][key]??key;return String(text).replace(/\\{(v[0-9]+)\\}/g,function(match,name){return vars&&Object.prototype.hasOwnProperty.call(vars,name)?String(vars[name]):match;});};})(globalThis.Serein=globalThis.Serein||{});\n";
fs.writeFileSync(path.join(dist,'strings.js'),runtime);console.log(Object.keys(copy).length+' English copy entries compiled');
