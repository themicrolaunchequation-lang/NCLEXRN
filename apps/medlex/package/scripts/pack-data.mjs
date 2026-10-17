// Development-only lossless collection compressor. Source records remain unchanged.
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
const baseline=process.argv[2] || 'src/data/records';

const terms=JSON.parse(fs.readFileSync(`${baseline}/TERMS.json`));
const termIds=new Map(terms.map(t=>[JSON.stringify(t),t.id]));
for(const file of fs.readdirSync('src/data/collections')) {
 const name=file.replace('.js','').toUpperCase(), data=JSON.parse(fs.readFileSync(`${baseline}/${name}.json`));
 const schemas=[],rows=data.map(record=>{if(record===null||typeof record!=='object'||Array.isArray(record))return[-1,record];const keys=Object.keys(record);let i=schemas.findIndex(s=>JSON.stringify(s)===JSON.stringify(keys));if(i<0){i=schemas.length;schemas.push(keys)}return[i,...Object.values(record)]});
 const count=new Map();function tally(v){if(typeof v==='string')count.set(v,(count.get(v)||0)+1);else if(Array.isArray(v))v.forEach(tally);else if(v&&typeof v==='object')Object.values(v).forEach(tally)}tally(rows);
 const dictionary=[...count].filter(([s,n])=>n*(s.length-10)>s.length+8).map(([s])=>s),dict=new Map(dictionary.map((s,i)=>[s,i]));
 function pack(v){if(name!=='TERMS'&&v&&typeof v==='object'&&!Array.isArray(v)&&termIds.has(JSON.stringify(v)))return{$term:termIds.get(JSON.stringify(v))};if(typeof v==='string'&&dict.has(v))return{$:dict.get(v)};if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object'){const keys=Object.keys(v);let i=schemas.findIndex(s=>JSON.stringify(s)===JSON.stringify(keys));if(i<0){i=schemas.length;schemas.push(keys)}return{$o:[i,...Object.values(v).map(pack)]}}return v}
 const raw=JSON.stringify([schemas,dictionary,pack(rows)]);
 const compressed=gzipSync(Buffer.from(raw),{level:9}).toString('base64');
 fs.writeFileSync(`src/data/collections/${file}`,`// Lossless original ${name}; decoded only on first use.\nexport default '${compressed}';\n`);
}
