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
 return {...s,phy:a[0],skl:a[1],arc:a[2],mnd:a[3],total:a.reduce((x,y)=>x+y,0),physical:Math.round(attack*10)/10,magicArc:a[2]+14,magicMind:a[3]+14,accuracy:a[1]+(w.hit||0),evade:a[1]+effect('evade')-pen,speed:a[1]+(w.speed||0)-pen,castSpeed:a[1]+effect('castSpeed')-pen,crit:Math.min(50,Math.max(0,5+(w.crit||0)+effect('crit'))),power:w.power,upgrade:(upgrades[eq[i][0].split('：')[1]]||0)*4,capacity:skillCap(i),cost:skillCost(i),resistance:calcResist(i),enabled};
}
function actorAttributes(i,tab='basic'){
 if(H.run?.battle)return pendingBattleMenu();if(!Number.isInteger(i)||i<0||i>=names.length)return;
 const s=characterValues(i),cell=(k,v)=>'<div class="attribute-cell"><small>'+hesc(k)+'</small><b>'+hesc(String(v))+'</b></div>';
 const pages={basic:[['PHY・肉体',s.phy],['SKL・技巧',s.skl],['ARC・異能',s.arc],['MND・精神',s.mnd],['HP',vitals[i].hp+' / '+s.hp],['SP',vitals[i].sp+' / '+s.sp],['総能力値',s.total],['セットCost',s.cost+' / '+s.capacity],['装備重量',s.weight+' / '+s.limit],['使用可能技',s.usable+' / '+s.setCount],['能力 Pt',statPt[i]],['Mastery Pt',mp[i]]],combat:[['通常攻撃力',s.physical],['魔攻・ARC基準',s.magicArc],['魔攻・MND基準',s.magicMind],['物理防御',s.pdef],['魔法防御',s.mdef],['命中値',s.accuracy],['回避値',s.evade],['通常行動速度',s.speed],['術の行動速度',s.castSpeed],['同SKL相手の会心',s.crit+'%'],['武器威力',s.power],['武器強化補正','+'+s.upgrade+'%']],resist:Object.entries(s.resistance).map(([k,v])=>[k,(v>0?'+':'')+v])};
 const notes={basic:'現在の装備・セットスキルでの能力。HP／SPは現在値／最大値。',combat:'戦闘前の基準値。魔攻は術威力14で算出。命中値は％ではなく、技・敵・地形・一時効果で結果が変化します。',resist:'全属性・状態異常・封じの耐性。＋は耐性、−は弱点、0は標準。',effects:'セットしたパッシブの効果。装備条件を満たしていないものは発動しません。'};
 if(!Object.hasOwn(notes,tab))tab='basic';
 const controls='<div class="ui-tabs attribute-heading">'+[['basic','基本'],['combat','戦闘'],['resist','耐性'],['effects','効果']].map(([k,v])=>'<button data-hub="actorAttributes" data-args="'+hesc(JSON.stringify([i,k]))+'" aria-pressed="'+(tab===k)+'">'+v+'</button>').join('')+'</div>';
 const content=tab==='effects'?skillSet[i].filter(n=>rules().meta(n)?.mode==='Passive').map(n=>HT(n+(s.enabled.includes(n)?'':'（装備条件不足）'),skillExplanation(rules().meta(n)))).join('')||HT('パッシブ未設定','スキルタブでセットできます。'):'<div class="attribute-grid '+(tab==='resist'?'resistance-grid':'')+'">'+pages[tab].map(([k,v])=>cell(k,v)).join('')+'</div>';
 show('<h2>'+hesc(names[i])+' / 能力値</h2>'+controls+'<p class="screen-hint">'+notes[tab]+'</p>'+content);
}
