/* Reference values use the integrated battle formulas, before temporary combat effects. */
const CHARACTER_WEAPONS={
hammer:{name:'戦槌',attr:'壊',range:'near',power:22,hit:-5,speed:-5,weight:'heavy',load:7},
axe:{name:'戦斧',attr:'斬',range:'near',power:24,hit:-5,speed:-5,weight:'heavy',load:7},
dagger:{name:'短剣',attr:'斬',range:'near',power:11,hit:8,speed:8,weight:'light',load:2,skillNormal:true,crit:7},
chakram:{name:'回刃',attr:'斬',range:'far',power:12,hit:5,speed:4,weight:'light',load:2,throwing:true,crit:4},
sword:{name:'剣',attr:'斬',range:'near',power:17,hit:3,speed:0,weight:'normal',load:5},
spear:{name:'槍',attr:'突',range:'mid',power:18,hit:2,speed:0,weight:'normal',load:6},
bow:{name:'長弓',attr:'突',range:'far',power:16,hit:7,speed:1,weight:'normal',load:5,skillNormal:true,crit:6},
staff:{name:'杖',attr:'壊',range:'near',power:8,hit:0,speed:0,weight:'light',load:2},
talisman:{name:'呪符',attr:'無',range:'near',power:6,hit:0,speed:0,weight:'light',load:1},
whip:{name:'鞭',attr:'斬',range:'mid',power:12,hit:5,speed:3,weight:'light',load:3,skillNormal:true,crit:3},
scythe:{name:'鎌',attr:'斬',range:'near',power:23,hit:-2,speed:-3,weight:'heavy',load:8},
katana:{name:'刀',attr:'斬',range:'near',power:18,hit:5,speed:5,weight:'normal',load:5,skillNormal:true,crit:8},
gun:{name:'銃',attr:'突',range:'far',power:18,hit:12,speed:0,weight:'normal',load:5,skillNormal:true,crit:5},
fist:{name:'格闘',attr:'壊',range:'near',power:10,hit:6,speed:7,weight:'light',load:3},
shield:{name:'小盾',attr:'壊',range:'near',power:7,hit:0,speed:-1,weight:'normal',load:4}
};
function characterWeapon(n){const aliases={'王国剣':'sword','長槍':'spear','短杖':'staff','拳甲':'fist','古戦槌':'hammer','風裂弓':'bow','星紋杖':'staff','遺跡短剣':'dagger','呪符':'talisman'};if(!n||n==='なし')return {name:'無手',attr:'壊',range:'near',power:0,hit:0,speed:10,load:0,weight:'light'};const k=aliases[n.replace('・異品','')]||Object.keys(CHARACTER_WEAPONS).find(k=>CHARACTER_WEAPONS[k].name===n)||({'槌':'hammer','斧':'axe','短剣':'dagger','剣':'sword','槍':'spear','鞭':'whip','鎌':'scythe','刀':'katana','弓':'bow','銃':'gun','杖':'staff','盾':'shield','格闘':'fist','投擲':'chakram'}[weaponKind(n)]);return k?{...CHARACTER_WEAPONS[k],name:n}:null}

function characterValues(i){
 const a=stats[i],s=equipmentSnapshot(i),w=characterWeapon(eq[i][0].split('：')[1])||characterWeapon('なし');
 const enabled=skillSet[i].filter(n=>rules().meta(n)?.mode==='Passive'&&skillUsable(i,n)),effect=k=>rules().effect(enabled,k),pen=[0,5,15,30][s.weightLevel];
 const attack=(w.power+(w.throwing?a[1]:w.skillNormal?a[0]*.4+a[1]*.7:a[0]))*[1,.95,.9,.8][s.weightLevel];
 const off=eq[i][1].split('：')[1],guard=Math.round((1-Math.max(.3,.5-(/盾/.test(off)?.1:0)-effect('guard')))*100);
 return {...s,guard,offhand:off,phy:a[0],skl:a[1],arc:a[2],mnd:a[3],total:a.reduce((x,y)=>x+y,0),physical:Math.round(attack*10)/10,magicArc:a[2]+14,magicMind:a[3]+14,accuracy:a[1]+(w.hit||0),evade:a[1]+effect('evade')-pen,speed:a[1]+(w.speed||0)-pen,castSpeed:a[1]+effect('castSpeed')-pen,crit:Math.min(50,Math.max(0,5+(w.crit||0)+effect('crit'))),weaponCrit:w.crit||0,power:w.power,upgrade:(upgrades[eq[i][0].split('：')[1]]||0)*4,capacity:skillCap(i),cost:skillCost(i),resistance:calcResist(i),enabled};
}
// Rates share one neutral SKL 30 opponent across character and equipment screens.
function characterDisplayRates(i,v){
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
 return {hit:clamp(90+(v.accuracy-30)*.5,30,100),evade:100-clamp(90+(30-v.evade)*.5,30,100),crit:clamp(5+(v.skl-30)/4+(v.weaponCrit||0)+rules().effect(v.enabled,'crit'),0,50)};
}
// Allocation is a transient preview. Saving and battle exports use only committed stats.
let attributeDraft=null;
function attributeDiscard(){attributeDraft=null}
function attributeSession(i){
 if(!Number.isInteger(i)||i<0||i>=names.length)return null;
 if(!attributeDraft||attributeDraft.i!==i||JSON.stringify(attributeDraft.base)!==JSON.stringify(stats[i])||attributeDraft.points!==statPt[i])attributeDraft={i,base:stats[i].slice(),values:stats[i].slice(),points:statPt[i]};
 return attributeDraft;
}
function attributeRemaining(d){return d.points-d.values.reduce((n,x,j)=>n+x-d.base[j],0)}
function attributeWith(i,values,fn){const original=stats[i];stats[i]=values.slice();try{return fn()}finally{stats[i]=original}}
function attributeAdjust(i,j,delta){
 if(H.run?.battle||!Number.isInteger(j)||j<0||j>3||![1,-1].includes(delta))return;
 const d=attributeSession(i);if(!d||delta===1&&attributeRemaining(d)<=0||delta===-1&&d.values[j]<=d.base[j])return;
 d.values[j]+=delta;actorAttributes(i,'basic');
}
function attributeApply(i){
 if(H.run?.battle||!attributeDraft||attributeDraft.i!==i)return;
 const d=attributeDraft;
 if(JSON.stringify(d.base)!==JSON.stringify(stats[i])||d.points!==statPt[i]){attributeDiscard();return actorAttributes(i)}
 const remaining=attributeRemaining(d),spent=d.points-remaining;
 if(spent<=0||remaining<0||!d.values.every((x,j)=>Number.isInteger(x)&&x>=d.base[j]))return;
 const old=rules().derived(d.base),next=rules().derived(d.values);
 stats[i]=d.values.slice();statPt[i]=remaining;
 for(const key of ['hp','sp','mp'])if(key!=='hp'||vitals[i].hp>0)vitals[i][key]+=next[key]-old[key];
 attributeDiscard();persist();actorAttributes(i);
}
function actorAttributes(i,tab='basic'){
 if(H.run?.battle)return pendingBattleMenu();const d=attributeSession(i);if(!d)return;
 tab='basic';
 const before=characterValues(i),s=attributeWith(i,d.values,()=>characterValues(i)),remaining=attributeRemaining(d),dirty=remaining!==d.points;
 const format=v=>hesc(String(v)),compare=(x,y)=>format(x)+(x!==y?'<span class="attribute-change"> → '+format(typeof x==='string'&&typeof y==='string'&&x.includes(' / ')&&x.split(' / ')[0]===y.split(' / ')[0]?y.split(' / ')[1]:y)+'</span>':''),cell=(k,x,y=x)=>'<div class="attribute-cell"><small>'+hesc(k)+'</small><b>'+compare(x,y)+'</b></div>';
 const rate=v=>Math.round(v*100)/100+'%',beforeRates=characterDisplayRates(i,before),afterRates=characterDisplayRates(i,s);
 const pages={basic:[['最大HP',before.hp,s.hp],['最大SP',before.sp,s.sp],['装備重量',before.weight+' / '+before.limit,s.weight+' / '+s.limit],['物理攻撃力',before.physical,s.physical],['魔法攻撃力',before.magicArc,s.magicArc],['信仰攻撃力',before.magicMind,s.magicMind],['物理防御力',before.pdef,s.pdef],['魔法防御力',before.mdef,s.mdef],['命中率',rate(beforeRates.hit),rate(afterRates.hit)],['会心率',rate(beforeRates.crit),rate(afterRates.crit)],['回避率',rate(beforeRates.evade),rate(afterRates.evade)],['行動速度',before.speed,s.speed]],resist:Object.entries(s.resistance).map(([k,v])=>[k,(v>0?'+':'')+v])};
 const button=(label,action,args,disabled=false,aria=label)=>'<button data-hub="'+action+'" data-args="'+hesc(JSON.stringify(args))+'" aria-label="'+hesc(aria)+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
 const pointbar='<div class="allocation-bar"><b>能力ポイント <span>'+remaining+' Pt</span></b>'+button(tab==='basic'?'割り振りを確定':'仮割り振りを見る',tab==='basic'?'attributeApply':'actorAttributes',tab==='basic'?[i]:[i,'basic'],tab==='basic'&&!dirty)+'</div>';
 const editor=tab==='basic'?'<div class="allocation-grid">'+['PHY','SKL','ARC','MND'].map((k,j)=>'<div class="allocation-stat">'+button('−','attributeAdjust',[i,j,-1],d.values[j]===d.base[j],k+'の仮割り振りを1戻す')+'<span><small>'+k+'</small><b>'+compare(d.base[j],d.values[j])+'</b></span>'+button('＋','attributeAdjust',[i,j,1],remaining<=0,k+'に1ポイント仮割り振り')+'</div>').join('')+'</div>':'';
 const content='<section class="attributes-overview"><div class="attribute-grid combined-attributes">'+pages.basic.map(([k,x,y])=>cell(k,x,y)).join('')+'</div><div class="resistance-heading"><b>耐性</b><small>＋耐性／−弱点／0標準</small></div><div class="attribute-grid resistance-grid">'+pages.resist.map(([k,x,y])=>cell(k,x,y)).join('')+'</div></section>';

 show('<h2>'+hesc(names[i])+' / 能力値</h2>'+pointbar+editor+content);
}

const GROWTH_EXP_STEP=100;
function initializeCharacterProgress(){
 H.experience=Math.max(0,Math.floor(Number(H.experience)||0));
 if(!H.pendingGrowth)H.pendingGrowth={stat:0,mastery:0};
 H.pendingGrowth.stat=Math.max(0,Math.floor(Number(H.pendingGrowth.stat)||0));
 H.pendingGrowth.mastery=Math.max(0,Math.floor(Number(H.pendingGrowth.mastery)||0));
 if(!H.flags['character-points-41']){statPt=statPt.map(n=>n+10);H.flags['character-points-41']=true}
}
function awardExperience(amount,source='冒険',key=''){
 amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return {exp:0,growth:0};
 if(key){const milestone='xp:'+key;if(H.milestones[milestone])return {exp:0,growth:0};H.milestones[milestone]=true}
 const old=H.experience||0,next=old+amount;
 H.experience=next;
 const growth=Math.floor(next/GROWTH_EXP_STEP)-Math.floor(old/GROWTH_EXP_STEP);
 if(growth){H.pendingGrowth.stat+=growth;H.pendingGrowth.mastery+=growth}
 const reward=growth?' / 成長到達：全員 Stat Pt +'+growth+' / Mastery Pt +'+growth+'（宿で受取）':'';
 logRun(source+' EXP +'+amount+reward);
 return {exp:amount,growth};
}
function awardExplorationExperience(r,n){
 awardExperience(20,'初踏破',r.dungeon+':'+r.floor+':'+n.id);
}
function characterExperience(){const exp=H.experience||0,part=exp%GROWTH_EXP_STEP,left=part?GROWTH_EXP_STEP-part:GROWTH_EXP_STEP;return '<div class="character-experience"><div><b>EXP '+part+' / '+GROWTH_EXP_STEP+'</b><small>戦闘・探索・依頼で獲得 · 次の成長まで '+left+'</small></div><div class="experience-track" role="progressbar" aria-label="経験値" aria-valuemin="0" aria-valuemax="'+GROWTH_EXP_STEP+'" aria-valuenow="'+part+'"><i style="width:"+(part/GROWTH_EXP_STEP*100)+"%"></i></div></div>'}
