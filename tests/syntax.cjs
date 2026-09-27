'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const hubFiles=fs.readdirSync('exploration').filter(f=>f.endsWith('.js')).map(f=>'exploration/'+f);
for(const file of ['battle-v29.js','rpg-rules.js','tests/battle-regression.js','tests/hub-regression.js',...hubFiles])cp.execFileSync(process.execPath,['--check',file]);
for(const file of ['index.html','exploration/index.html']){
 const html=fs.readFileSync(file,'utf8');
 for(const [i,m]of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:file+':script'+i});
}
const R=require('../rpg-rules.js');
assert.equal(Object.keys(R.skills).length,296);assert.equal(Object.keys(R.masteries).length,31);
for(const [n,d]of Object.entries(R.skills)){
 assert.equal(n,d.name);assert(['Active','Passive'].includes(d.mode));assert(d.setCost>=1&&d.setCost<=10,n+' cost');
 assert(Array.isArray(d.unlocks)&&d.unlocks.length,n+' unlocks');
 for(const u of d.unlocks){assert(R.masteries[u.mastery],n+' mastery');assert(u.rank>=0&&u.rank<=50);assert(['PHY','SKL','ARC','MND'].includes(u.stat))}
 if(d.mode==='Active'){assert(Number.isFinite(d.mult));assert(Number.isFinite(d.cost));assert(['SP','MP'].includes(d.costType));assert(['near','mid','far','all'].includes(d.range));assert(['single','row','all','pierce','adjacent','random'].includes(d.scope));}
 else assert(Object.keys(d.passive).length,n+' passive');
}
for(const file of ['battle-v29.js','exploration/index.html']){
 const content=fs.readFileSync(file,'utf8'),names=[...content.matchAll(/(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g)].map(x=>x[1]);
 assert.equal(new Set(names).size,names.length,file+' duplicate function definitions');
}
const hubNames=hubFiles.flatMap(file=>[...fs.readFileSync(file,'utf8').matchAll(/(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
assert.equal(new Set(hubNames).size,hubNames.length,'hub duplicate function definitions');
const path=require('node:path');
for(const m of fs.readFileSync('exploration/index.html','utf8').matchAll(/(?:src|href)="([^"]+)"/g)){const target=m[1].split('?')[0];if(target.startsWith('#'))continue;assert(!/^https?:/.test(target),'hub dependency must be local');assert(fs.existsSync(path.resolve('exploration',target)),'missing hub resource '+target);}
console.log('Syntax, local assets, unique functions, 296 skill definitions and 31 masteries: PASS');
