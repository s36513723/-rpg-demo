'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const hubFiles=fs.readdirSync('exploration').filter(f=>f.endsWith('.js')).map(f=>'exploration/'+f);
for(const file of ['battle-v29.js','battle-plan-v36.js','skill-catalog-315.js','skill-catalog-437.js','rpg-rules.js','sanctuary-v92.js','tests/battle-regression.js','tests/hub-regression.js',...hubFiles])cp.execFileSync(process.execPath,['--check',file]);
for(const file of ['index.html','battle-v44.html','exploration/index.html']){
 const html=fs.readFileSync(file,'utf8');
 for(const [i,m]of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:file+':script'+i});
}
const battleUi=fs.readFileSync('sanctuary-v92.js','utf8'),battleCss=fs.readFileSync('sanctuary-v92.css','utf8'),battleV44=fs.readFileSync('battle-v44.html','utf8');
assert(fs.existsSync('images/paladin-turn.webp'),'Paladin turn-order art missing');
assert(fs.existsSync('images/paladin-battle.webp'),'Paladin battle art missing');
assert(battleUi.includes("run:'images/paladin-turn.webp'"),'Paladin formation/icon mapping missing');
assert(battleUi.includes('DIRECT_FACE_SRC'),'Paladin direct face source missing');
assert(battleUi.includes("run:['images/paladin-battle.webp',168,226]"),'Paladin battle portrait mapping missing');
assert(battleV44.includes('skill-catalog-437.js'),'battle-v44 canonical 437 catalog missing');
assert(battleV44.includes('unified-sp.css'),'battle-v44 must hide obsolete MP display');
assert(battleCss.includes('data-actor-id="run"]::before{background-image:url("images/paladin-turn.webp")}'),'Paladin turn-order CSS mapping missing');
const C315=require('../skill-catalog-315.js'),C=require('../skill-catalog-437.js'),F=require('../exploration/field-skills-437.js'),R=require('../rpg-rules.js');
assert.equal(C315.count,315);assert.equal(C.count,437);assert.equal(F.count,25);assert.equal(Object.keys(R.skills).length,437);assert.equal(Object.keys(R.masteries).length,31);assert.equal(R.catalogVersion,437);assert.equal(R.fieldCatalogVersion,437);
assert(R.skills['速射（弓）']);assert(R.skills['速射（銃）']);assert.equal(R.skills['速射（弓）'].name,'速射');assert.equal(R.skills['速射（銃）'].name,'速射');
const fieldAliases={解錠:'宝箱解錠',隠し道発見:'宝箱探知',素材鑑定:'素材見極め',探索極意:'魔物知識'};
for(const [n,d]of Object.entries(R.skills)){
 assert(n===d.name||n===d.catalogKey||fieldAliases[n]===d.name,n+' key/name');assert(['Active','Passive','Field'].includes(d.mode));assert(d.setCost>=1&&d.setCost<=4,n+' cost');
 assert(Array.isArray(d.unlocks)&&d.unlocks.length,n+' unlocks');
 for(const u of d.unlocks){assert(R.masteries[u.mastery],n+' mastery');assert(u.rank>=1&&u.rank<=10);assert(['PHY','SKL','ARC','MND'].includes(u.stat))}
 if(d.mode==='Active'){assert(Number.isFinite(d.mult));assert(Number.isFinite(d.cost));assert.equal(d.costType,'SP');assert(['near','mid','far','long','global','all'].includes(d.range));assert(['single','row','all','pierce','adjacent','random'].includes(d.scope));const t=d.targeting;assert(t,n+' targeting');assert(['enemy','ally','self'].includes(t.side),n+' targeting side');assert(['same','select','self'].includes(t.column),n+' targeting column');assert(['front','through','last','ally','self'].includes(t.order),n+' targeting order');assert(['single','cross','x','vertical','horizontal','3x3'].includes(t.area),n+' targeting area');}
 if(d.mode==='Passive')assert(Object.keys(d.passive).length,n+' passive');
}
assert.equal(R.version,14);assert.equal(R.targetRules.board.allyNear,'back');assert.equal(R.targetRules.board.enemyNear,'front');assert.equal(R.targetRules.board.forwardAxis,'vertical');
assert.deepEqual(R.targetRules.normalAttack,{side:'enemy',column:'same',order:'front',area:'single'});
assert.equal(R.targetRules.emptySameColumn,'choose-occupied-column');assert.equal(R.targetRules.throughFallback,'front');assert.equal(R.targetRules.counterChain,false);
assert(R.skills['毒刃'].poison);assert(R.skills['頭封じの符'].headBind);assert(R.skills['誘惑'].temptation);assert(R.skills['盾撃'].stun);assert.equal(R.skills['集中指示'].target,'enemy');assert(R.skills['集中指示'].special?.lockOn,'集中指示 lock-on');
assert(R.skills['照準器'].special?.lockOn);assert(R.skills['大元素術'].cast===1&&R.skills['大元素術'].mult>0);assert(R.skills['蘇生祈願'].revive);assert(R.skills['誘惑'].special?.temptation);
assert.equal(R.skills['宝箱解錠'].mode,'Field');assert.equal(R.skills['魔装極意'].mode,'Passive');
for(const [n,d] of Object.entries(R.skills)){const text=R.skillExplain(d);assert.equal(typeof text,'string',n+' explanation type');assert(text.trim().length>=2,n+' explanation')}
for(const [n,d] of Object.entries(R.masteries)){assert(R.masteryDescription(n).trim().length>=8,n+' mastery explanation');for(const b of Object.keys(d.branches))assert(R.branchDescription(n,b).trim().length>=2,n+' / '+b+' branch explanation')}
for(const file of ['battle-v29.js','exploration/index.html']){
 const content=fs.readFileSync(file,'utf8'),names=[...content.matchAll(/(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g)].map(x=>x[1]);
 assert.equal(new Set(names).size,names.length,file+' duplicate function definitions');
}
const hubNames=hubFiles.flatMap(file=>[...fs.readFileSync(file,'utf8').matchAll(/(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
assert.equal(new Set(hubNames).size,hubNames.length,'hub duplicate function definitions');
const path=require('node:path');
for(const m of fs.readFileSync('exploration/index.html','utf8').matchAll(/(?:src|href)="([^"]+)"/g)){const target=m[1].split('?')[0];if(target.startsWith('#'))continue;assert(!/^https?:/.test(target),'hub dependency must be local');assert(fs.existsSync(path.resolve('exploration',target)),'missing hub resource '+target);}
const battleSource=fs.readFileSync('index.html','utf8');
assert(battleSource.includes("dagger:{name:'短剣',normalStat:'SKL'"),'dagger normal attack must scale with SKL');
assert(battleSource.includes("bow:{name:'長弓',normalStat:'SKL'"),'bow normal attack must scale with SKL');
assert(battleSource.includes("staff:{name:'杖',normalStat:'ARC'"),'staff normal attack must scale with ARC');
assert(battleSource.includes("stat:u.weapon?.normalStat||'PHY'"),'normal attack must use weapon-configured stat');
assert(battleSource.includes("if(req.includes('投擲')&&throwAction(u))return ''"),'throwing mastery must use carry-item throw action');
assert(battleSource.includes("if(!n||n==='なし')return'なし'"),'unarmed must be represented by no equipped hand weapon');
const growthSource=fs.readFileSync('exploration/character-stats.js','utf8');
assert(growthSource.includes("normalStat:'SKL'"),'character preview must preserve SKL weapon scaling');
assert(growthSource.includes("normalStat:'ARC'"),'character preview must preserve ARC weapon scaling');
assert(growthSource.includes('function awardExperience('),'shared EXP award function');
assert(growthSource.includes('H.pendingGrowth.stat+=growth;H.pendingGrowth.mastery+=growth'),'EXP threshold grants both growth point types');
const exploreSource=fs.readFileSync('exploration/explore.js','utf8'),hubSource=fs.readFileSync('exploration/hub.js','utf8');
assert(exploreSource.includes("awardExperience(40,'強敵撃破'"),'elite EXP reward');
assert(exploreSource.includes("awardExperience(80,'層ボス撃破'"),'boss EXP reward');
assert(hubSource.includes("awardExperience(60,'依頼達成'"),'quest EXP reward');
assert(hubSource.includes("awardExperience(100,'章報告'"),'story EXP reward');
assert(!/grant\(\{[^\n}]*stat:/.test(exploreSource),'exploration no longer grants Stat Pt directly');
assert(!/grant\(\{[^\n}]*stat:/.test(hubSource),'hub no longer grants Stat Pt directly');
console.log('Syntax, local assets, single canonical 437 SkillDB + derived 25 Field Skills and 31 masteries: PASS');

const T=require('../exploration/terrain-runtime.js');
assert.equal(Object.keys(T.TERRAIN).length,19,'TerrainDB must contain 19 terrain tags');
assert.equal(Object.keys(T.TILE).length,26,'TileDB must contain 26 tile traits');
assert.equal(Object.keys(T.BOARD_TEMPLATE).length,8,'BoardTemplateDB must contain 8 templates');
assert.equal(Object.keys(T.BOSS).length,6,'BossBattlefield must contain 6 fixed examples');
const baseTerrains=Object.keys(T.TERRAIN).filter(id=>!T.TERRAIN[id].condition);
assert.equal(baseTerrains.length,15);
const isOuter=i=>{const r=Math.floor(i/3),cc=i%3;return r===0||r===2||cc===0||cc===2};
const stats={};
for(const tr of baseTerrains){
 let maxDiff=0,minSafe=9,maxAllyRisk3=0,maxEnemyRisk3=0,hazardErrors=0;
 for(let seed=1;seed<=1000;seed++){
  const place={placeType:'分岐路',primaryTerrain:tr,secondaryTerrains:[],conditionTerrain:null,terrainTags:[tr],fieldTags:[],battleOverlay:false};
  const b=T.createBattlefield(place,seed,'normal','森林'),same=T.createBattlefield(place,seed,'normal','森林');
  assert.equal(JSON.stringify(b),JSON.stringify(same),tr+' seeded board must be deterministic');
  assert.equal(b.cells.enemy.length+b.cells.ally.length,18,tr+' board size');
  for(const side of ['enemy','ally'])for(const cell of b.cells[side]){
   assert(T.TILE[cell.baseTile],tr+' unknown tile '+cell.baseTile);
   if(cell.baseTile==='TL10'&&(!isOuter(cell.index)||!cell.hazardDir))hazardErrors++;
  }
  const safe=b.cells.ally.filter(x=>(T.TILE[x.baseTile]?.risk||0)<=1).length;
  const ar=b.cells.ally.filter(x=>(T.TILE[x.baseTile]?.risk||0)>=3).length;
  const er=b.cells.enemy.filter(x=>(T.TILE[x.baseTile]?.risk||0)>=3).length;
  const diff=Math.abs(T.sideValue(b.cells.enemy)-T.sideValue(b.cells.ally));
  minSafe=Math.min(minSafe,safe);maxAllyRisk3=Math.max(maxAllyRisk3,ar);maxEnemyRisk3=Math.max(maxEnemyRisk3,er);maxDiff=Math.max(maxDiff,diff);
  assert(safe>=6,tr+' ally safe cells '+safe);assert(ar===0,tr+' ally risk3 '+ar);assert(er<=1,tr+' enemy risk3 '+er);assert(diff<=3,tr+' tactical value diff '+diff);
 }
 assert.equal(hazardErrors,0,tr+' hazard edge placement');stats[tr]={maxDiff,minSafe,maxAllyRisk3,maxEnemyRisk3};
}
for(const cond of ['TR16','TR17','TR18','TR19']){
 for(let seed=1;seed<=1000;seed++){
  const place={placeType:'分岐路',primaryTerrain:'TR10',secondaryTerrains:[],conditionTerrain:cond,terrainTags:['TR10',cond],fieldTags:[],battleOverlay:false};
  const b=T.createBattlefield(place,seed,'normal','森林');assert.equal(b.conditionTerrain,cond);assert(T.CONDITION[cond]);assert.equal(b.cells.enemy.length+b.cells.ally.length,18);
  for(const side of ['enemy','ally'])for(const cell of b.cells[side])assert(T.TILE[cell.baseTile],cond+' unknown tile '+cell.baseTile);
 }
}
for(const type of ['elite','ambush','tutorial']){
 const place={placeType:'分岐路',primaryTerrain:'TR10',secondaryTerrains:[],conditionTerrain:null,terrainTags:['TR10'],fieldTags:[],battleOverlay:false};
 const b=T.createBattlefield(place,777,type,'森林');assert.equal(b.templateId,{elite:'BT03',ambush:'BT04',tutorial:'BT08'}[type]);assert.equal(b.cells.enemy.length+b.cells.ally.length,18);
}
for(const [id,bf] of Object.entries(T.BOSS)){
 const b=T.createBattlefield({primaryTerrain:bf.terrain[0],terrainTags:bf.terrain,fieldTags:id==='BF05'?['機械']:[],placeType:'深部・主室'},100+Number(id.slice(2)),'boss',id==='BF02'?'山岳':id==='BF06'?'山岳':'地下神殿');
 assert.equal(b.cells.enemy.length+b.cells.ally.length,18);assert(T.BOARD_TEMPLATE[b.templateId],id+' template');
}
{
 const b=T.tutorialBoard({primaryTerrain:'TR10'},9),base=b.cells.ally[0].baseTile;assert(T.setTempTile(b,'ally',0,'TL20',2));assert.equal(b.cells.ally[0].baseTile,base);assert.equal(b.cells.ally[0].tempTile,'TL20');
 assert(T.setTempTile(b,'ally',0,'TL21',2));assert.equal(b.cells.ally[0].tempTile,'TL21');T.decayTempTiles(b);assert.equal(b.cells.ally[0].tempRemaining,1);T.decayTempTiles(b);assert.equal(b.cells.ally[0].tempTile,null);
}
{
 const old={cells:{enemy:Array.from({length:9},(_,i)=>({index:i,side:'enemy',baseTile:'TL00'})),ally:Array.from({length:9},(_,i)=>({index:i,side:'ally',baseTile:'TL00'}))}};
 const m=T.migrateBattlefield(old,{placeType:'分岐路',primaryTerrain:'TR10',terrainTags:['TR10'],fieldTags:[]},11);assert.equal(m.version,3);assert(m.cells.ally.every(x=>'tempTile'in x&&'tempRemaining'in x));
}
{
 const b=T.tutorialBoard({primaryTerrain:'TR10'},5);b.cells.enemy[T.cellIndex('enemy','front',1)].baseTile='TL00';b.cells.enemy[T.cellIndex('enemy','mid',1)].baseTile='TL09';
 const u={id:'x',enemy:true,row:'front',gridCol:1,style:'弓兵',ai:'archer'};const mv=T.bestAiMove(b,u,new Map(),true);assert(mv&&mv.row==='mid'&&mv.delta>=20,'ranged AI should move for +20 high-ground gain');
 b.cells.enemy[T.cellIndex('enemy','front',1)].baseTile='TL06';const fly={...u,style:'飛行',terrainImmunity:'ignore_ground_negative'},golem={...u,style:'ゴーレム',terrainImmunity:'ignore_poison_terrain'};
 assert(!('endRoundHp'in T.unitTileEffect(b,fly).effect),'flying ignores ground negative');assert(!('endRoundHp'in T.unitTileEffect(b,golem).effect),'golem ignores poison swamp damage');
}
{
 const b=T.fixedBoss?T.fixedBoss('BF02',1):T.createBattlefield({primaryTerrain:'TR07',terrainTags:['TR07','TR08','TR17'],fieldTags:[],placeType:'深部・主室'},1,'boss','山岳');
 const before=b.windDir,x=T.bossPhaseChange(b,.69);assert(x.text&&b.windDir!==before,'BF02 wind phase');
 const b3={...T.createBattlefield({primaryTerrain:'TR03',terrainTags:['TR03','TR13'],fieldTags:[],placeType:'深部・主室'},2,'boss','海上・船'),bossFieldId:'BF03',phaseFlags:{}};const p=T.bossPhaseChange(b3,.49);assert(p.changed.length<=4);
}

{
 const check=(tr,fn,label)=>{for(let seed=1;seed<=1000;seed++){const p={placeType:'分岐路',primaryTerrain:tr,secondaryTerrains:[],conditionTerrain:null,terrainTags:[tr],fieldTags:[],battleOverlay:false},b=T.createBattlefield(p,seed,'normal','森林');for(const side of ['enemy','ally'])fn(b.cells[side],seed,side)}console.log(label+': PASS')};
 check('TR03',(cells,seed,side)=>{const n=cells.filter(x=>['TL03','TL04'].includes(x.baseTile)).length,land=cells.filter(x=>!['TL03','TL04'].includes(x.baseTile)).length;assert(n>=4&&n<=9,'TR03 water '+seed+' '+side+' '+n);assert(land>=2)},'TERR-002 water coverage');
 check('TR04',(cells,seed,side)=>{const n=cells.filter(x=>['TL03','TL04','TL05','TL06','TL02'].includes(x.baseTile)).length,poison=cells.filter(x=>x.baseTile==='TL06').length;assert(n>=7&&n<=13,'TR04 wet '+seed+' '+side+' '+n);assert(poison<=2)},'TERR-003 wetland coverage');
 check('TR07',(cells,seed,side)=>{const n=cells.filter(x=>x.baseTile==='TL09').length;assert(n>=2&&n<=4,'TR07 high '+seed+' '+side+' '+n)},'TERR-004 elevation coverage');
 check('TR08',(cells,seed,side)=>{const edge=cells.filter(x=>x.baseTile==='TL10');assert(edge.length>=2&&edge.length<=4,'TR08 edge '+seed+' '+side+' '+edge.length);for(const x of edge){assert(isOuter(x.index));assert(x.hazardDir)}},'TERR-005 cliff coverage');
 check('TR11',(cells,seed,side)=>{const sand=cells.filter(x=>['TL12','TL13'].includes(x.baseTile)).length,qs=cells.filter(x=>x.baseTile==='TL13').length;assert(sand>=8&&sand<=9,'TR11 sand '+seed+' '+side+' '+sand);assert(qs<=3)},'TERR-006 desert coverage');
 check('TR12',(cells,seed,side)=>{const snow=cells.filter(x=>['TL14','TL15'].includes(x.baseTile)).length,ice=cells.filter(x=>x.baseTile==='TL15').length;assert(snow>=8&&snow<=9,'TR12 snow '+seed+' '+side+' '+snow);assert(ice<=4)},'TERR-007 snow coverage');
}

console.log('Terrain 19 / Tile 26 / 1000-board generation / templates / AI / temp/save migration: PASS',JSON.stringify(stats));


const caster=[10,10,60,20],old=R.legacyDerived(caster),max=R.derived(caster);
assert.equal(R.resourceVersion,2);assert.equal(max.sp,100);assert.equal(R.capacity(caster,[]),12);assert(!('mp' in max),'current derived vitals must not expose MP');
const migrated=R.migrateVitals({hp:80,sp:10,mp:42,status:{poison:2}},caster);
assert.equal(migrated.sp,52);assert(!('mp' in migrated),'migrated current vitals must not expose MP');assert.equal(migrated.status.poison,2);
assert.deepEqual(R.migrateVitals(migrated,caster,2),migrated);
assert.equal(R.migrateVitals({hp:10,sp:30,mp:80},caster,0,4).sp,max.sp);
assert.equal(R.migrateVitals({hp:0,sp:0,mp:0},caster).sp,0);
assert(R.skills['気力回復']);assert(R.skills['魔力循環']);assert(!R.skills['MP回復']);
for(const d of Object.values(R.skills)){
 assert.notEqual(d.costType,'MP',d.name+' old costType');
 assert(!('mpDiscount' in (d.passive||{})),d.name+' old mpDiscount');
 assert(!('mpOnce' in (d.passive||{})),d.name+' old mpOnce');
 assert(!('mp' in (d.resourceRecovery||{})),d.name+' old recovery key');
 assert(!String(d.description||'').includes('MP'),d.name+' old description');
 assert(!R.skillExplain(d).includes('MP'),d.name+' explanation');
}
const baseSource=fs.readFileSync('exploration/base.js','utf8'),stateSource=fs.readFileSync('exploration/state.js','utf8');
assert(!/\bvar\s+mp\s*=/.test(baseSource),'Mastery Pt runtime variable must not be named mp');
assert(baseSource.includes('var masteryPt='),'Mastery Pt has explicit runtime name');
assert(stateSource.includes("'masteryPt'"),'save schema stores Mastery Pt explicitly');assert(stateSource.includes('progressionVersion:7'),'save schema must mark canonical 315 progression');assert(stateSource.includes('migrateSkillCatalog315'),'legacy 296 saves must migrate explicitly');
console.log('Unified SP costs, recovery, Mastery Pt naming and old-save migration: PASS');
