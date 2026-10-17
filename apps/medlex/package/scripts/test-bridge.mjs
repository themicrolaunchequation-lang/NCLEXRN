import fs from 'node:fs';
import path from 'node:path';
import {parse} from '@babel/parser';
const imports=[],names=[];
function visit(dir){for(const file of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,file.name);if(file.isDirectory())visit(p);else if(p.endsWith('.js')&&!p.includes('/collections/')&&!['src/main.js','src/bootstrap.js','src/test-bridge.js','src/test-entry.js'].includes(p)){const ast=parse(fs.readFileSync(p,'utf8'),{sourceType:'module'}),exports=[];for(const n of ast.program.body){if(n.type!=='ExportNamedDeclaration'||!n.declaration)continue;const d=n.declaration;if(d.type==='FunctionDeclaration')exports.push(d.id.name);if(d.type==='VariableDeclaration')for(const v of d.declarations)if(v.id.type==='Identifier')exports.push(v.id.name)}if(exports.length){imports.push(`import {${exports.join(',')}} from './${p.slice(4)}';`);names.push(...exports)}}}}
visit('src');
fs.writeFileSync('src/test-bridge.js',imports.join('\n')+`\nconst bindings={${[...new Set(names)].join(',')}};\nconst scope=new Proxy(bindings,{has:(t,k)=>k in t||k in app,get:(t,k)=>k in t?t[k]:app[k],set:(t,k,v)=>{if(k==='downloadText')app.testDownloads=v;else if(k in t)t[k]=v;else app[k]=v;return true}});\nwindow.__MEDLEX_TEST__={evaluate:source=>Function('scope','source','with(scope){return eval(source)}')(scope,source)};\n`);
