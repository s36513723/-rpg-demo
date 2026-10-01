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
