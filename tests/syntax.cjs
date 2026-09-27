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
 if(d.mode==='Active'){assert(Number.isFinite(d.mult));assert(Number.isFinite(d.cost));assert(['SP','MP'].includes(d.costType));assert(['near','mid','far','all'].includes(d.range));assert(['single','row','all','pierce','adjacent','random'].includes(d.scope));const t=d.targeting;assert(t,n+' targeting');assert(['enemy','ally','self'].includes(t.side),n+' targeting side');assert(['same','select','self'].includes(t.column),n+' targeting column');assert(['front','through','last','ally','self'].includes(t.order),n+' targeting order');assert(['single','cross','x','vertical','horizontal','3x3'].includes(t.area),n+' targeting area');assert(typeof t.ignoreTaunt==='boolean',n+' ignoreTaunt');}
 else assert(Object.keys(d.passive).length,n+' passive');
}
assert.equal(R.version,8);assert.equal(R.targetRules.board.allyNear,'back');assert.equal(R.targetRules.board.enemyNear,'front');assert.equal(R.targetRules.board.forwardAxis,'vertical');
assert.deepEqual(R.targetRules.normalAttack,{side:'enemy',column:'same',order:'front',area:'single'});
assert.equal(R.targetRules.emptySameColumn,'choose-occupied-column');assert.equal(R.targetRules.throughFallback,'front');assert.equal(R.targetRules.counterChain,false);
assert.equal(R.targetingText(R.skills['毒刃']),'正面・スルー・単体');
assert.equal(R.targetingText(R.skills['貫穿']),'正面・最前・縦列');
assert.equal(R.targetingText(R.skills['狙撃']),'横指定・最後・単体・挑発無視');
assert.equal(R.targetingText(R.skills['火球']),'横指定・最前・十字');
assert.equal(R.targetingText(R.skills['神雷']),'横指定・最前・X字');
assert.equal(R.targetingText(R.skills['大火炎']),'正面・最前・3×3');
assert.equal(R.targetingText(R.skills['鼓舞歌']),'自分中心・横列');
assert(R.skills['挑発'].special?.taunt);assert(R.skills['精神感応'].special?.lockOn);assert(R.skills['悪夢'].special?.temptation);
for(const n of ['徒手反撃','反撃刃','剣反撃','守護反撃','心眼反撃','盾反撃'])assert.deepEqual(R.skills[n].reaction,{trigger:'hit',kind:'counter',target:'attacker',area:'single',noChain:true});
for(const [n,d] of Object.entries(R.skills)){const text=R.skillExplain(d);assert.equal(typeof text,'string',n+' explanation type');assert(text.trim().length>=6,n+' explanation');assert(!/能力・戦術効果を付与/.test(text),n+' generic explanation')}
for(const [n,d] of Object.entries(R.masteries)){assert(R.masteryDescription(n).trim().length>=8,n+' mastery explanation');for(const b of Object.keys(d.branches))assert(R.branchDescription(n,b).trim().length>=6,n+' / '+b+' branch explanation')}
assert(R.skillExplain(R.skills['毒刃']).includes('最前を1体飛ばして'));assert(R.skillExplain(R.skills['狙撃']).includes('最後尾'));assert(R.skillExplain(R.skills['挑発']).includes('攻撃を自分へ集める'));
for(const file of ['battle-v29.js','exploration/index.html']){
 const content=fs.readFileSync(file,'utf8'),names=[...content.matchAll(/(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g)].map(x=>x[1]);
 assert.equal(new Set(names).size,names.length,file+' duplicate function definitions');
}
const hubNames=hubFiles.flatMap(file=>[...fs.readFileSync(file,'utf8').matchAll(/(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
assert.equal(new Set(hubNames).size,hubNames.length,'hub duplicate function definitions');
const path=require('node:path');
for(const m of fs.readFileSync('exploration/index.html','utf8').matchAll(/(?:src|href)="([^"]+)"/g)){const target=m[1].split('?')[0];if(target.startsWith('#'))continue;assert(!/^https?:/.test(target),'hub dependency must be local');assert(fs.existsSync(path.resolve('exploration',target)),'missing hub resource '+target);}
console.log('Syntax, local assets, unique functions, 296 skill definitions and 31 masteries: PASS');
