/* Canonical terrain / battlefield runtime from sheets 19-29. */
(function(root){'use strict';
const TILE={
TL00:{name:'通常',risk:0},
TL01:{name:'草地',risk:0,shinraEffect:.05},
TL02:{name:'茂み',risk:1,incomingRangedHit:-10,shinraStatus:5},
TL03:{name:'水場',risk:1,waterEffect:.10,incomingFire:-.10,speed:-.10},
TL04:{name:'浅瀬',risk:1,waterEffect:.05,speed:-.05},
TL05:{name:'泥濘',risk:2,speed:-.15,evasion:-10,moveMax:1,ground:true},
TL06:{name:'毒沼',risk:3,speed:-.10,endRoundHp:.04,ground:true},
TL07:{name:'岩場',risk:1,incomingPhysical:-.05,forcedDelta:-1},
TL08:{name:'遮蔽',risk:1,incomingRangedHit:-20,areaIgnores:true},
TL09:{name:'高所',risk:0,highAccuracy:10,highDamage:.10},
TL10:{name:'危険縁',risk:3,edgeDamage:.15,bossEdgeDamage:.05},
TL11:{name:'瓦礫',risk:1,incomingPhysical:-.10,speed:-.10},
TL12:{name:'砂地',risk:1,speed:-.05,evasion:-5,ground:true},
TL13:{name:'流砂',risk:3,speed:-.20,evasion:-10,moveMax:1,ground:true},
TL14:{name:'雪地',risk:1,speed:-.10,forcedDelta:-1,ground:true},
TL15:{name:'氷面',risk:2,evasion:-10,forcedDelta:1,ground:true},
TL16:{name:'術式陣',risk:1,sourceSp:-2,sourceEffect:.10,incomingMagic:.10},
TL17:{name:'聖印',risk:0,healingReceived:.20,statusResist:10,bindResist:10},
TL18:{name:'呪刻',risk:2,statusApply:10,bindApply:10,statusResist:-10,bindResist:-10},
TL19:{name:'機構床',risk:0,kikouSp:-2,deviceRounds:1},
TL20:{name:'氷床',risk:2,speed:-.15,evasion:-10,forcedDelta:1,ground:true,temp:2},
TL21:{name:'炎上',risk:3,endRoundFire:.05,temp:2},
TL22:{name:'砂幕',risk:1,outgoingRangedHit:-15,incomingRangedHit:-15,speed:-.05,temp:2},
TL23:{name:'煙霧',risk:1,outgoingRangedHit:-15,incomingRangedHit:-15,temp:2},
TL24:{name:'霧幕',risk:0,incomingRangedHit:-15,temp:2},
TL25:{name:'石壁',risk:0,incomingPhysical:-.15,incomingRangedHit:-15,forcedDelta:-1,temp:2}
};
const TERRAIN={
TR01:{name:'森林',tiles:{TL00:1,TL01:5,TL02:4,TL07:1,TL08:1}},
TR02:{name:'草地',tiles:{TL00:3,TL01:6,TL02:2,TL07:1}},
TR03:{name:'水辺',tiles:{TL00:1,TL01:2,TL03:5,TL04:6,TL07:2,TL12:2}},
TR04:{name:'湿地',tiles:{TL01:2,TL02:2,TL03:3,TL04:4,TL05:5,TL06:1}},
TR05:{name:'泥濘',tiles:{TL01:1,TL03:1,TL04:2,TL05:6,TL06:1}},
TR06:{name:'岩場',tiles:{TL00:2,TL07:6,TL08:3,TL09:1,TL11:1}},
TR07:{name:'高低差',tiles:{TL00:2,TL07:3,TL08:1,TL09:5,TL10:2}},
TR08:{name:'崖',tiles:{TL00:1,TL07:3,TL08:1,TL09:3,TL10:6}},
TR09:{name:'狭所',tiles:{TL00:3,TL07:3,TL08:3,TL11:2}},
TR10:{name:'開地',tiles:{TL00:7,TL01:2,TL09:1,TL12:2}},
TR11:{name:'砂地',tiles:{TL00:1,TL07:1,TL09:1,TL12:6,TL13:2}},
TR12:{name:'雪氷',tiles:{TL00:1,TL07:2,TL09:1,TL14:6,TL15:3}},
TR13:{name:'遺構',tiles:{TL00:3,TL08:4,TL09:1,TL11:5}},
TR14:{name:'石造',tiles:{TL00:5,TL08:3,TL09:1,TL11:3}},
TR15:{name:'船上',tiles:{TL00:6,TL08:2,TL09:1,TL10:4}},
TR16:{name:'暗所',condition:true},TR17:{name:'強風',condition:true},TR18:{name:'豪雨',condition:true},TR19:{name:'瘴気',condition:true}
};

const THEME={
'森林':{primary:[['TR01',5],['TR02',4]],secondary:[['TR03',2],['TR06',1],['TR07',1],['TR10',1],['TR13',1]],condition:[['TR16',1],['TR18',1]]},
'洞窟':{primary:[['TR06',5],['TR09',4]],secondary:[['TR03',2],['TR07',2],['TR13',1],['TR14',2]],condition:[['TR16',4],['TR19',1]]},
'廃墟都市':{primary:[['TR13',5],['TR14',4]],secondary:[['TR10',3],['TR09',2],['TR07',2],['TR06',1]],condition:[['TR16',1],['TR17',1]]},
'山岳':{primary:[['TR06',5],['TR07',5]],secondary:[['TR08',3],['TR10',2],['TR12',2],['TR02',1]],condition:[['TR17',3],['TR18',1]]},
'沼地':{primary:[['TR04',5],['TR05',4],['TR03',4]],secondary:[['TR02',2],['TR01',1]],condition:[['TR16',1],['TR18',2],['TR19',3]]},
'砂漠遺跡':{primary:[['TR11',5],['TR13',4]],secondary:[['TR14',3],['TR10',3],['TR07',2],['TR06',1]],condition:[['TR16',1],['TR17',1]]},
'海上・船':{primary:[['TR15',5]],secondary:[['TR03',3],['TR09',2],['TR10',2],['TR07',2]],condition:[['TR17',3],['TR18',2]]},
'地下神殿':{primary:[['TR13',5],['TR14',5]],secondary:[['TR09',3],['TR03',1],['TR07',1]],condition:[['TR16',4],['TR19',2]]}
};
const PLACE={
'廃屋':{id:'PT01',preferred:['TR13','TR14','TR09'],tileAdd:{TL08:2,TL11:2},field:{機械:2,遺物:2},overlay:false},
'狭路・通路':{id:'PT02',required:'TR09',preferred:['TR06','TR14','TR13','TR16'],forbidden:['TR10'],tileAdd:{TL08:1,TL11:1},field:{機械:2,遺物:2},overlay:false},
'広間・開けた場所':{id:'PT03',required:'TR10',preferred:['TR02','TR11','TR14','TR15'],forbidden:['TR09'],tileAdd:{TL00:3},field:{獣:2,星象:2},overlay:false},
'分岐路':{id:'PT04',preferred:['TR09','TR10','TR13','TR01'],tileAdd:{},field:{},overlay:false},
'崖道・段丘':{id:'PT05',required:'TR07',preferred:['TR08','TR06','TR17'],tileAdd:{TL09:2,TL10:2},field:{鉱物:2,獣:2},overlay:false},
'水辺・水路':{id:'PT06',required:'TR03',preferred:['TR04','TR06','TR02','TR14'],tileAdd:{TL03:2,TL04:3},field:{水域:3,植物:2,鉱物:2},overlay:false},
'崩落・障害区域':{id:'PT07',preferred:['TR06','TR13','TR14','TR09'],tileAdd:{TL11:4,TL08:1},field:{鉱物:2,遺物:2},overlay:false},
'遺構・人工物':{id:'PT08',required:'TR13',preferred:['TR14','TR09','TR10','TR16'],tileAdd:{TL11:2,TL08:2},field:{遺物:3,機械:3,聖域:2,呪い:2,星象:1},overlay:'field_match'},
'隠し区画・脇道':{id:'PT09',preferred:['TR09','TR16','TR13','TR01'],forbidden:['TR10'],tileAdd:{TL08:1,TL02:1},field:{遺物:2,鉱物:2,植物:2},overlay:false},
'深部・主室':{id:'PT10',preferred:['TR10','TR13','TR14','TR06'],tileAdd:{TL00:2},field:{遺物:2,聖域:2,呪い:2,星象:2},overlay:'boss_or_event'}
};
const FIELD_BY_TERRAIN={
TR01:{植物:5,獣:4,水域:1},TR02:{植物:4,獣:3,水域:1},TR03:{水域:5,植物:1,獣:1,鉱物:1},
TR04:{水域:5,植物:4,獣:3,呪い:1},TR05:{水域:3,植物:2,獣:1},TR06:{鉱物:5,獣:2,遺物:1},
TR07:{鉱物:3,獣:2,星象:1},TR08:{鉱物:3,獣:3,星象:1},TR09:{遺物:2,機械:2,鉱物:2},
TR10:{獣:3,星象:2,植物:1},TR11:{遺物:3,鉱物:2,星象:1},TR12:{獣:3,鉱物:3,星象:1},
TR13:{遺物:5,機械:4,聖域:2,呪い:2,星象:1},TR14:{遺物:3,機械:2,聖域:2,呪い:2},
TR15:{水域:5,機械:3,遺物:1},TR16:{呪い:3,遺物:2,星象:2},TR17:{星象:3,獣:1},
TR18:{水域:3,植物:2},TR19:{呪い:4,植物:2,獣:1}
};

const BOSS={
BF01:{name:'中立主室',template:'BT05',terrain:['TR13','TR14','TR10'],enemy:['TL00','TL08','TL00','TL00','TL00','TL00','TL09','TL00','TL08'],ally:['TL08','TL00','TL09','TL00','TL00','TL00','TL00','TL08','TL00']},
BF02:{name:'断崖戦',template:'BT06',terrain:['TR07','TR08','TR17'],enemy:['TL09','TL10','TL07','TL07','TL08','TL09','TL00','TL07','TL10'],ally:['TL10','TL07','TL00','TL09','TL08','TL07','TL07','TL10','TL09']},
BF03:{name:'浸水遺構',template:'BT07',terrain:['TR03','TR13'],enemy:['TL03','TL04','TL00','TL04','TL08','TL03','TL00','TL16','TL04'],ally:['TL04','TL00','TL03','TL03','TL08','TL04','TL04','TL17','TL00']},
BF04:{name:'呪祭壇',template:'BT07',terrain:['TR13','TR14','TR16'],enemy:['TL18','TL00','TL16','TL08','TL18','TL00','TL00','TL17','TL08'],ally:['TL08','TL17','TL00','TL00','TL18','TL08','TL16','TL00','TL18']},
BF05:{name:'機巧中枢',template:'BT07',terrain:['TR13','TR14'],enemy:['TL19','TL08','TL00','TL00','TL19','TL00','TL08','TL00','TL19'],ally:['TL00','TL19','TL08','TL19','TL00','TL00','TL00','TL08','TL19']},
BF06:{name:'氷雪稜線',template:'BT07',terrain:['TR12','TR07','TR17'],enemy:['TL09','TL15','TL14','TL07','TL14','TL09','TL14','TL15','TL07'],ally:['TL07','TL14','TL15','TL09','TL14','TL07','TL15','TL09','TL14']}
};
const EXCLUDE=[['TR09','TR10'],['TR04','TR11'],['TR15','TR01'],['TR15','TR04'],['TR15','TR11'],['TR15','TR12']];
function hashSeed(v){let h=2166136261>>>0;for(const ch of String(v)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function randomFrom(seed){let s=(Number(seed)>>>0)||1;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function weighted(entries,rand){const a=Array.isArray(entries)?entries:Object.entries(entries||{}),sum=a.reduce((n,x)=>n+Math.max(0,Number(x[1])||0),0);if(!sum)return a[0]?.[0]||null;let p=rand()*sum;for(const [k,w] of a){p-=Math.max(0,Number(w)||0);if(p<=0)return k}return a[a.length-1]?.[0]||null}
function weightedDistinct(weights,count,rand){const work={...weights},out=[];while(out.length<count&&Object.keys(work).length){const k=weighted(work,rand);if(!k)break;out.push(k);delete work[k]}return out}
function terrainName(id){return TERRAIN[id]?.name||String(id||'')}
function tileName(id){return TILE[id]?.name||String(id||'')}
function prohibited(a,b){return EXCLUDE.some(x=>x.includes(a)&&x.includes(b))}
function allowedSecondary(primary,id,place){if(!id||id===primary||prohibited(primary,id))return false;return !(place?.forbidden||[]).includes(id)}
function placeSpec(name){return PLACE[name]||PLACE['分岐路']}
function fieldCount(rand){const x=rand();return x<.25?0:x<.80?1:2}
function generatePlace(theme,placeType,seed,battleType='normal'){
 const rand=randomFrom(seed),td=THEME[theme]||THEME['森林'],ps=placeSpec(placeType);
 let primary=ps.required||weighted(td.primary,rand);
 if(!TERRAIN[primary]||TERRAIN[primary].condition)primary=weighted(td.primary,rand);
 const weights={};for(const [id,w] of td.secondary||[])if(allowedSecondary(primary,id,ps))weights[id]=(weights[id]||0)+w;
 for(const id of ps.preferred||[])if(TERRAIN[id]&&!TERRAIN[id].condition&&allowedSecondary(primary,id,ps))weights[id]=(weights[id]||0)+2;
 const secondary=rand()<.65&&Object.keys(weights).length?[weighted(weights,rand)]:[];
 const conditionChance=['elite','boss','event'].includes(battleType)?.50:.30;
 let condition=null;if(rand()<conditionChance){const candidates=(td.condition||[]).filter(([id])=>!(ps.forbidden||[]).includes(id));condition=weighted(candidates,rand)}
 const terrainTags=[primary,...secondary,condition].filter(Boolean);
 const fw={};for(const id of terrainTags)for(const [tag,w]of Object.entries(FIELD_BY_TERRAIN[id]||{}))fw[tag]=(fw[tag]||0)+w;
 for(const [tag,w]of Object.entries(ps.field||{}))fw[tag]=(fw[tag]||0)+w;
 const fieldTags=weightedDistinct(fw,fieldCount(rand),rand);
 const battleOverlay=ps.overlay==='field_match'||ps.overlay==='boss_or_event'&&['boss','event'].includes(battleType);
 return {placeTypeId:ps.id,primaryTerrain:primary,secondaryTerrains:secondary,conditionTerrain:condition,terrainTags,fieldTags,battleOverlay};
}
function addWeights(dst,src,m=1){for(const[k,v]of Object.entries(src||{}))dst[k]=(dst[k]||0)+Number(v||0)*m}
function boardWeights(place){const w={};addWeights(w,TERRAIN[place.primaryTerrain]?.tiles,2);for(const t of place.secondaryTerrains||[])addWeights(w,TERRAIN[t]?.tiles,1);addWeights(w,placeSpec(place.placeType)?.tileAdd,1);if(!Object.keys(w).length)w.TL00=1;return w}
function outerIndex(i){const r=Math.floor(i/3),c=i%3;return r===0||r===2||c===0||c===2}
function hazardDir(i){const r=Math.floor(i/3),c=i%3;if(r===0)return'back';if(r===2)return'front';return c===0?'left':'right'}
function replaceSome(cells,ids,count,tile,rand,filter=()=>true){const ix=cells.map((_,i)=>i).filter(i=>ids.includes(cells[i].baseTile)&&filter(i));for(const i of ix.sort(()=>rand()-.5).slice(0,count))cells[i].baseTile=tile}
function ensureAtLeast(cells,ids,min,tile,rand,filter=()=>true){let have=cells.filter(c=>ids.includes(c.baseTile)).length;if(have>=min)return;const candidates=cells.map((_,i)=>i).filter(i=>!ids.includes(cells[i].baseTile)&&filter(i)).sort(()=>rand()-.5);for(const i of candidates.slice(0,min-have))cells[i].baseTile=tile}
function ensureAtMost(cells,ids,max,repl,rand){let ix=cells.map((c,i)=>ids.includes(c.baseTile)?i:-1).filter(i=>i>=0);if(ix.length<=max)return;for(const i of ix.sort(()=>rand()-.5).slice(max))cells[i].baseTile=repl}
function enforceCoverage(cells,primary,rand){
 if(primary==='TR03'){ensureAtLeast(cells,['TL03','TL04'],4,'TL04',rand);ensureAtMost(cells,['TL03','TL04'],9,'TL00',rand)}
 if(primary==='TR04'){ensureAtLeast(cells,['TL03','TL04','TL05','TL02'],7,'TL05',rand);ensureAtMost(cells,['TL03','TL04','TL05','TL02'],13,'TL01',rand);ensureAtMost(cells,['TL06'],2,'TL05',rand)}
 if(primary==='TR05'){ensureAtLeast(cells,['TL05'],5,'TL05',rand);ensureAtMost(cells,['TL05'],10,'TL04',rand)}
 if(primary==='TR07'){ensureAtLeast(cells,['TL09'],2,'TL09',rand);ensureAtMost(cells,['TL09'],4,'TL07',rand)}
 if(primary==='TR08'){ensureAtLeast(cells,['TL10'],2,'TL10',rand,outerIndex);ensureAtMost(cells,['TL10'],4,'TL07',rand);cells.forEach((c,i)=>{if(c.baseTile==='TL10'&&!outerIndex(i))c.baseTile='TL07'})}
 if(primary==='TR10'){ensureAtLeast(cells,['TL00','TL01','TL12'],12,'TL00',rand);ensureAtMost(cells,['TL08'],2,'TL00',rand)}
 if(primary==='TR11'){ensureAtLeast(cells,['TL12','TL13'],8,'TL12',rand);ensureAtMost(cells,['TL12','TL13'],14,'TL00',rand);ensureAtMost(cells,['TL13'],3,'TL12',rand)}
 if(primary==='TR12'){ensureAtLeast(cells,['TL14','TL15'],8,'TL14',rand);ensureAtMost(cells,['TL14','TL15'],14,'TL00',rand);ensureAtMost(cells,['TL15'],4,'TL14',rand)}
 if(primary==='TR15'){ensureAtLeast(cells,['TL10'],2,'TL10',rand,outerIndex);ensureAtMost(cells,['TL10'],4,'TL00',rand);cells.forEach((c,i)=>{if(c.baseTile==='TL10'&&!outerIndex(i))c.baseTile='TL00'})}
 return cells
}

function applyFieldOverlay(cells,place,rand){
 if(!place.battleOverlay)return;
 const options=[];
 if(place.fieldTags?.includes('遺物')||place.fieldTags?.includes('星象'))options.push('TL16');
 if(place.fieldTags?.includes('聖域'))options.push('TL17');
 if(place.fieldTags?.includes('呪い'))options.push('TL18','TL18');
 if(place.fieldTags?.includes('機械'))options.push('TL19','TL19');
 for(const id of options.slice(0,2)){const i=Math.floor(rand()*cells.length);cells[i].baseTile=id}
}
function safeSide(cells,maxRisk3=0,minSafe=6){
 let risk3=cells.map((c,i)=>TILE[c.baseTile]?.risk>=3?i:-1).filter(i=>i>=0);
 for(const i of risk3.slice(maxRisk3))cells[i].baseTile='TL00';
 const safe=cells.filter(c=>(TILE[c.baseTile]?.risk||0)<=1).length;
 if(safe<minSafe){let need=minSafe-safe;for(const c of cells){if(need<=0)break;if((TILE[c.baseTile]?.risk||0)>1){c.baseTile='TL00';need--}}}
}
function fixedBoss(bfId,seed){
 const bf=BOSS[bfId]||BOSS.BF01,rand=randomFrom(seed),mk=(side,arr)=>arr.map((id,i)=>({index:i,side,baseTile:id,overlay:null,hazardDir:id==='TL10'?hazardDir(i):null}));
 return {version:1,seed:Number(seed)>>>0,templateId:bf.template,bossFieldId:bfId,name:bf.name,primaryTerrain:bf.terrain[0],secondaryTerrains:bf.terrain.slice(1).filter(x=>!TERRAIN[x]?.condition),conditionTerrain:bf.terrain.find(x=>TERRAIN[x]?.condition)||null,terrainTags:bf.terrain.slice(),cells:{enemy:mk('enemy',bf.enemy),ally:mk('ally',bf.ally)},windDir:bf.terrain.includes('TR17')?(rand()<.5?'left':'right'):null,ambush:false,fixed:true}
}
function bossFieldFor(place,theme){
 if(place.primaryTerrain==='TR12')return'BF06';
 if(place.terrainTags?.includes('TR08')||theme==='山岳')return'BF02';
 if(place.terrainTags?.includes('TR03')||theme==='海上・船')return'BF03';
 if(place.fieldTags?.includes('機械'))return'BF05';
 if(place.fieldTags?.includes('呪い')||place.conditionTerrain==='TR16'||theme==='地下神殿')return'BF04';
 return'BF01'
}
function createBattlefield(place,seed,battleType='normal',theme='森林'){
 if(battleType==='boss')return fixedBoss(bossFieldFor(place,theme),seed);
 const rand=randomFrom(seed),weights=boardWeights(place),make=side=>Array.from({length:9},(_,i)=>({index:i,side,baseTile:weighted(weights,rand)||'TL00',overlay:null,hazardDir:null}));
 const all=[...make('enemy'),...make('ally')];enforceCoverage(all,place.primaryTerrain,rand);applyFieldOverlay(all,place,rand);
 const enemy=all.slice(0,9),ally=all.slice(9);for(const side of [enemy,ally])side.forEach((c,i)=>{if(c.baseTile==='TL10')c.hazardDir=hazardDir(i)});
 if(place.primaryTerrain==='TR03'){for(const side of [enemy,ally]){let land=side.filter(c=>!['TL03','TL04'].includes(c.baseTile)).length;for(const c of side){if(land>=2)break;if(['TL03','TL04'].includes(c.baseTile)){c.baseTile='TL00';land++}}}}
 const templateId=battleType==='elite'?'BT03':place.primaryTerrain&&['TR03','TR04','TR12'].includes(place.primaryTerrain)?'BT02':'BT01';
 safeSide(ally,battleType==='elite'?1:0,6);safeSide(enemy,1,battleType==='elite'?5:6);
 return {version:1,seed:Number(seed)>>>0,templateId,bossFieldId:null,name:terrainName(place.primaryTerrain),primaryTerrain:place.primaryTerrain,secondaryTerrains:[...(place.secondaryTerrains||[])],conditionTerrain:place.conditionTerrain||null,terrainTags:[...(place.terrainTags||[])],cells:{enemy,ally},windDir:place.conditionTerrain==='TR17'?(rand()<.5?'left':'right'):null,ambush:false,fixed:false}
}
function migrateNode(node,theme,runSeed,floor=1){
 const seed=node.encounterSeed??hashSeed(runSeed+':'+floor+':'+node.id);
 const placeType=PLACE[node.placeType]?node.placeType:({'高所・低所':'崖道・段丘','水辺・特殊地形':'水辺・水路'}[node.placeType]||node.placeType||'分岐路');
 let spec;if(node.primaryTerrain){spec={placeTypeId:node.placeTypeId||placeSpec(placeType).id,primaryTerrain:node.primaryTerrain,secondaryTerrains:node.secondaryTerrains||[],conditionTerrain:node.conditionTerrain||null,terrainTags:node.terrainTags||[node.primaryTerrain,...(node.secondaryTerrains||[]),node.conditionTerrain].filter(Boolean),fieldTags:node.fieldTags||[],battleOverlay:node.battleOverlay??false}}else spec=generatePlace(theme,placeType,seed,node.type);
 return Object.assign(node,{placeType,placeTypeId:spec.placeTypeId,primaryTerrain:spec.primaryTerrain,secondaryTerrains:spec.secondaryTerrains,conditionTerrain:spec.conditionTerrain,terrainTags:spec.terrainTags,fieldTags:spec.fieldTags,battleOverlay:spec.battleOverlay,encounterSeed:seed,terrain:terrainName(spec.primaryTerrain)});
}
const api={version:1,TILE,TERRAIN,THEME,PLACE,FIELD_BY_TERRAIN,BOSS,hashSeed,randomFrom,weighted,terrainName,tileName,placeSpec,generatePlace,createBattlefield,migrateNode};
if(typeof module!=='undefined')module.exports=api;root.RPG_TERRAIN=api;
})(typeof globalThis!=='undefined'?globalThis:this);
