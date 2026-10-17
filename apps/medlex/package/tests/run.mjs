import {spawnSync}from'node:child_process';
for(const file of ['unit.mjs','integrity.cjs','v4-data.cjs','audio-visual.cjs','phase0-dom.cjs','expansion-dom.cjs','language-help.cjs']){
 const r=spawnSync(process.execPath,[`tests/${file}`],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
