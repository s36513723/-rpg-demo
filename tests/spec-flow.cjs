const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('exploration/explore.js','utf8');
const growth=fs.readFileSync('exploration/character-stats.js','utf8');
const hub=fs.readFileSync('exploration/hub.js','utf8');
function get(src,name){const start=src.indexOf('function '+name+'(');assert(start>=0,`function ${name}`);const opening=src.indexOf('{',start);let depth=0;for(let i=opening;i<src.length;i++){if(src[i]==='{')depth++;if(src[i]==='}'&&!--depth)return src.slice(start,i+1)}throw Error(`unterminated ${name}`)}
const names=['askReturn','returnTown','finishExpedition','escrowRunLoot','finalizeExpedition','appraiseRunLoot','growthCount','awardExperience'];
const context={Date,Math,Object,Number,console};vm.createContext(context);
vm.runInContext(names.map(n=>get(['growthCount','awardExperience'].includes(n)?growth:n==='appraiseRunLoot'?hub:source,n)).join('\n'),context);
let saveCount=0;
Object.assign(context,{H:{run:null,history:[],unappraised:{materials:{},tools:{},weapons:[]},pendingGrowth:{stat:0,mastery:0},experience:0,milestones:{}},
 loot:{皮:0},inventory:{tools:{回復薬:2}},gold:100,rareGear:[],lastExpedition:null,
 dungeonProgress:{古代迷宮:{best:0}},expeditionActive:false,expeditionStartLoot:null,
 RPG_STORE:{removeItem(){}},cp:x=>JSON.parse(JSON.stringify(x)),moneyText:x=>x+'G',
 persist:()=>saveCount++,town:()=>{},requireTown:()=>true,addUnique:(a,x)=>{if(!a.includes(x))a.push(x)},note:()=>{},activeRun:()=>!!context.H.run,
 confirmAction:(title,body,fn,args)=>context[fn](...args),pendingBattleMenu:()=>{throw Error('battle pending')},
 hc:()=>({labels:{}}),logRun:()=>{}});
function start(){context.H.run={id:'qa',dungeon:'古代迷宮',floor:2,themes:['森林','洞窟','廃墟都市'],log:[],baseline:{gold:100,materials:{皮:0},tools:{回復薬:2},rare:0},routeCount:2,battles:1,rescues:[],startedAt:0};context.loot.皮=4;context.gold=250}
start();context.askReturn();assert.equal(context.H.run,null);assert.equal(context.loot.皮,0);assert.equal(context.H.unappraised.materials.皮,4);assert.equal(context.gold,250);assert.equal(context.H.history[0].result,'任意帰還');context.appraiseRunLoot();assert.equal(context.loot.皮,4);
start();context.finalizeExpedition('敗北');assert.equal(context.H.run,null);assert.equal(context.loot.皮,0);assert.equal(context.H.unappraised.materials.皮,4);assert.equal(context.H.history[0].result,'敗北');
assert.deepEqual([99,100,219,220,599,600].map(n=>context.growthCount(n).count),[0,1,1,2,4,4]);
context.awardExperience(600,'QA');assert.equal(context.H.experience,600);assert.equal(context.H.pendingGrowth.stat,4);assert.equal(context.H.pendingGrowth.mastery,8);
context.awardExperience(300,'QA');assert.equal(context.H.pendingGrowth.stat,7);assert.equal(context.H.pendingGrowth.mastery,12);
console.log('Voluntary return, defeat loot retention, EXP curve and point distribution: PASS');
