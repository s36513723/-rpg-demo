/* Equipment candidates remain transient until explicit confirmation. */
let fittingDraft=null;
const fittingSlots={0:'主武器',1:'副手',2:'予備主武器',3:'予備副手',4:'防具一式',8:'装飾品',9:'携行具'};
function fittingWith(i,items,fn){const saved=eq[i];eq[i]=items.slice();try{return fn()}finally{eq[i]=saved}}
function fittingSession(i){if(!Number.isInteger(i)||i<0||i>=names.length)return null;if(!fittingDraft||fittingDraft.i!==i||JSON.stringify(fittingDraft.base)!==JSON.stringify(eq[i]))fittingDraft={i,base:eq[i].slice(),items:eq[i].slice(),slot:0,filters:{}};return fittingDraft}
function fittingDiscard(){fittingDraft=null}
function fittingHero(i,a,b,k=0){
 const round=n=>Math.round(n*100)/100;
 const value=(x,y,suffix='',lower=false)=>{const delta=round(y-x);return '<b>'+round(y)+suffix+(delta?' <i class="'+((lower?delta<0:delta>0)?'up':'down')+'">'+(delta>0?'+':'')+delta+'</i>':'')+'</b>'};
 const metric=(label,name,x,y,suffix='',lower=false)=>'<span aria-label="'+name+' '+round(y)+suffix+'"><small title="'+name+'">'+label+'</small>'+value(x,y,suffix,lower)+'</span>';
 const ar=characterDisplayRates(i,a),br=characterDisplayRates(i,b);
 return '<section class="fitting-summary"><div class="equip-compare" aria-live="polite"><div class="equip-compare-grid">'+
 metric('HP','最大HP',a.hp,b.hp)+metric('SP','最大SP',a.sp,b.sp)+metric('重量','装備重量',a.weight,b.weight,'/'+b.limit,true)+metric('物攻','物理攻撃力',a.physical,b.physical)+
 metric('魔攻','魔法攻撃力',a.magicArc,b.magicArc)+metric('信攻','信仰攻撃力',a.magicMind,b.magicMind)+
 metric('物防','物理防御力',a.pdef,b.pdef)+metric('魔防','魔法防御力',a.mdef,b.mdef)+metric('命中','命中率',ar.hit,br.hit,'%')+metric('会心','会心率',ar.crit,br.crit,'%')+metric('回避','回避率',ar.evade,br.evade,'%')+metric('速度','行動速度',a.speed,b.speed)+
 '</div></div></section>';
}

function fittingValues(i,items){return fittingWith(i,items,()=>characterValues(i))}
function fittingScreen(i,k=0,preview){if(H.run?.battle)return pendingBattleMenu();if(!Object.hasOwn(fittingSlots,k))return;const s=fittingSession(i);if(!s)return;const changedSlot=s.slot!==k;if(changedSlot){s.inspected=null;s.blocked=false}s.slot=k;if(preview!==undefined){s.inspected=preview;s.blocked=!fittingWith(i,s.items,()=>canEquip(i,k,preview))}const previous=fittingValues(i,s.base);
 if(preview!==undefined&&fittingWith(i,s.items,()=>canEquip(i,k,preview))){s.items[k]=s.items[k].split('：')[0]+'：'+preview;if(k===4)for(let z=5;z<=7;z++)s.items[z]=s.items[z].split('：')[0]+'：'+preview;if((k===0||k===2)&&isTwoHanded(preview))s.items[k+1]=s.items[k+1].split('：')[0]+'：なし'}
 const comparison=s.items.slice();if(s.blocked&&s.inspected)comparison[k]=comparison[k].split('：')[0]+'：'+s.inspected;const a=previous,b=fittingValues(i,comparison),costBlocked=!skillFits(i,skillSet[i],s.items),dirty=JSON.stringify(s.base)!==JSON.stringify(s.items),current=s.items[k].split('：')[1],list=k<4?['なし',...inventory.weapons]:k===4?['なし',...inventory.armor.filter(n=>Object.hasOwn(ARMOR_VARIANTS,n)).sort((a,b)=>['魔装','軽装','重装'].indexOf(armorFamily(a))-['魔装','軽装','重装'].indexOf(armorFamily(b)))]:k===9?['なし',...Object.keys(hc().tools).filter(n=>hc().tools[n].battle)]:['なし','護符'];
 const group=fittingGroup(k),types=group?fittingTypes(k):[];
 const filter=types.includes(s.filters[k])?s.filters[k]:'すべて';
 const visible=fittingWith(i,s.items,()=>list.filter(n=>(filter==='すべて'||fittingKind(k,n)===filter)&&(canEquip(i,k,n)||n===current)));
 const filters=group?'<div class="fitting-filters" role="group" aria-label="装備の種類"><button class="fitting-filter-current" data-hub="uiEquipTypeMenu" aria-expanded="false" aria-label="装備の種類を選択：'+hesc(filter)+'">種類：'+hesc(filter)+' ▾</button><div class="fitting-filter-options" hidden>'+types.map(t=>'<button data-hub="uiEquipFilter" data-args="'+hesc(JSON.stringify([i,k,t]))+'" aria-pressed="'+(t===filter)+'">'+hesc(t)+'</button>').join('')+'</div></div>':'';
 const slotButtons=keys=>keys.map(n=>'<button data-hub="equipChoice" data-args="'+hesc(JSON.stringify([i,n]))+'" aria-pressed="'+(n===k)+'"><small>'+fittingSlots[n]+'</small><b>'+hesc(s.items[n].split('：')[1])+(s.items[n]!==s.base[n]?' *':'')+'</b></button>').join('');
 const rows=fittingWith(i,s.items,()=>visible.map(n=>{const ok=canEquip(i,k,n),m=WM[n];let desc=k<4?n==='なし'?'武器を外します。':weaponDescription(n):k===4?n==='なし'?'防具を外します。':armorDescription(n):k===9?n==='なし'?'携行具を外します。':toolDescription(n):n==='なし'?'装飾品を外します。':'補助効果を持つ装飾品。';if(!ok){const j={PHY:0,SKL:1,ARC:2,MND:3}[m?.[3]];desc=k<4&&!weaponMasteryReady(i,n)?'必要：'+weaponMasteryFor(n)+'マスタリー Rank 5':m&&j!=null&&stats[i][j]<m[4]?m[3]+'があと'+(m[4]-stats[i][j])+'必要（現在 '+stats[i][j]+' / 必要 '+m[4]+'）':k===4?'必要：'+armorFamily(n)+'マスタリー Rank 5':(k===1||k===3)?'副手条件不足：両手武器との併用不可・二刀流はSKL 30必要':'装備条件不足'}return '<div class="candidate '+((n===(s.inspected||current)?'selected ':'')+(!ok?'unavailable':''))+'">'+'<button type="button" class="row" data-hub="uiEquipPreview" data-args="'+hesc(JSON.stringify([i,k,n]))+'"><b><span class="equipment-kind-icon" aria-label="'+hesc(fittingKind(k,n))+'">'+fittingIcon(k,n)+'</span><span class="equipment-item-name">'+hesc(n)+'</span>'+(!ok?'　条件不足':'')+(n===s.base[k].split('：')[1]?'　装備中':n===current?'　選択中':'')+'</b><span class="small">'+hesc(desc)+'</span></button>'+'</div>'}).join(''));
 show('<h2>'+hesc(names[i])+' / 装備</h2>'+fittingHero(i,a,b,k)+'<div class="fitting-controls"><div class="fitting-slot-group"><div>'+slotButtons([0,1])+'</div></div><div class="fitting-slot-group reserve-slots"><div>'+slotButtons([2,3])+'</div>'+HB('主副セットを換装','','fittingSwap',[i])+'</div><div class="fitting-other-slots">'+slotButtons([4,8,9])+'</div></div>'+filters+(costBlocked?'<p class="inline-warning">二刀流にセットCost 4が必要です。スキルを外してください。</p>':'')+'<div class="fitting-list"><div class="fitting-list-title">'+fittingSlots[k]+'の候補・装備可能'+(k===2||k===3?'（攻撃性能は換装後に反映）':'')+'</div>'+(rows||'<p class="fitting-empty">この種類に装備可能な所持品はありません</p>')+'</div><div class="fitting-confirm"><button data-hub="fittingApply" data-args="'+hesc(JSON.stringify([i]))+'"'+(!dirty||s.blocked||costBlocked?' disabled':'')+'>'+(s.blocked?'条件不足':'確定')+'</button></div>');

 if(changedSlot){const body=document.querySelector('#panel .panel-body');if(body)body.scrollTop=0}
}
function fittingCancel(i){if(H.run?.battle)return;const k=fittingDraft?.slot||0;fittingDiscard();equipChoice(i,k)}
function fittingApply(i){if(H.run?.battle||!fittingDraft||fittingDraft.i!==i)return;const s=fittingDraft;if(s.blocked)return;if(JSON.stringify(s.base)!==JSON.stringify(eq[i])){fittingDiscard();return equip(i)}const valid=fittingWith(i,s.items,()=>Object.keys(fittingSlots).every(k=>{k=Number(k);return s.items[k]===s.base[k]||canEquip(i,k,s.items[k].split('：')[1])})&&skillFits(i,skillSet[i],s.items));if(!valid)return note('装備条件または二刀流のCostが不足しています。スキルを外してから確定してください。');eq[i]=s.items.slice();const k=s.slot;fittingDiscard();persist();equipChoice(i,k)}

function fittingSwap(i){if(H.run?.battle)return;const s=fittingSession(i);if(!s)return;const v=s.items.slice(0,4).map(x=>x.split('：')[1]);for(let k=0;k<4;k++)s.items[k]=s.items[k].split('：')[0]+'：'+v[(k+2)%4];equipChoice(i,s.slot)}

function fittingFilter(i,k,type){const s=fittingSession(i);if(!s||!Object.hasOwn(fittingSlots,k))return;const group=fittingGroup(k);if(!group)return;s.filters[k]=type;equipChoice(i,k);const body=document.querySelector('#panel .equipment-right>.panel-body');if(body)body.scrollTop=0}

function fittingGroup(k){return k<4?'weapon':k===4?'armor':k===8?'accessory':k===9?'tool':null}
function fittingIcon(k,n){const kind=fittingKind(k,n);return ({格闘:'🥊',短剣:'🗡',剣:'⚔',槌:'🔨',斧:'🪓',槍:'🔱',鞭:'〰',鎌:'☾',刀:'🗡',弓:'🏹',銃:'⚙',杖:'🪄',盾:'🛡',投擲:'✦',呪符:'📜',魔装:'✧',軽装:'♧',重装:'🛡',護符:'◇','回復・治療':'✚','攻撃・投擲':'✦',補助:'◈',なし:'○'})[kind]||'◆'}
function fittingTypes(k){return k<4?['すべて','格闘','短剣','剣','槌','斧','槍','鞭','鎌','刀','弓','銃','杖','盾','投擲','呪符']:k===4?['すべて','魔装','軽装','重装']:k===8?['すべて','護符']:['すべて','回復・治療','攻撃・投擲','補助']}
function fittingKind(k,n){if(n==='なし')return 'なし';if(k<4)return weaponKind(n);if(k===4)return armorFamily(n);if(k===8)return '護符';return hc().tools[n]?.field?'回復・治療':['投げナイフ','鉄針','投石','爆弾'].includes(n)?'攻撃・投擲':'補助'}
