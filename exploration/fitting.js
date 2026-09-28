/* Tapping an equipment candidate commits immediately and keeps its comparison visible. */
let fittingDraft=null;
const fittingSlots={0:'主武器',1:'副手',2:'予備主武器',3:'予備副手',4:'防具一式',8:'装飾品',9:'携行具'};
function fittingWith(i,items,fn){const saved=eq[i];eq[i]=items.slice();try{return fn()}finally{eq[i]=saved}}
function fittingSession(i){if(!Number.isInteger(i)||i<0||i>=names.length)return null;if(!fittingDraft||fittingDraft.i!==i||JSON.stringify(fittingDraft.base)!==JSON.stringify(eq[i]))fittingDraft={i,base:eq[i].slice(),items:eq[i].slice(),slot:0};return fittingDraft}
function fittingDiscard(){fittingDraft=null}
function fittingHero(i,a,b,k=0){
 const round=n=>Math.round(n*100)/100;
 const value=(x,y,suffix='',lower=false)=>{const delta=round(y-x);return '<b>'+round(y)+suffix+(delta?' <i class="'+((lower?delta<0:delta>0)?'up':'down')+'">('+(delta>0?'+':'')+delta+')</i>':'')+'</b>'};
 const metric=(name,x,y,suffix='',lower=false)=>'<span><small>'+name+'</small>'+value(x,y,suffix,lower)+'</span>';
 const ar=characterDisplayRates(i,a),br=characterDisplayRates(i,b);
 return '<section class="fitting-summary"><div class="equip-compare" aria-live="polite"><small>'+(k===2||k===3?'予備セット使用時（換装後）':'現在のセット')+' · 差分は括弧内</small><div class="equip-compare-grid">'+
 metric('最大HP',a.hp,b.hp)+metric('最大SP',a.sp,b.sp)+metric('装備重量',a.weight,b.weight,' / '+b.limit,true)+metric('物理攻撃力',a.physical,b.physical)+
 metric('魔法攻撃力',a.magicArc,b.magicArc)+metric('信仰攻撃力',a.magicMind,b.magicMind)+
 metric('物理防御力',a.pdef,b.pdef)+metric('魔法防御力',a.mdef,b.mdef)+metric('命中率',ar.hit,br.hit,'%')+metric('会心率',ar.crit,br.crit,'%')+metric('回避率',ar.evade,br.evade,'%')+metric('行動速度',a.speed,b.speed)+
 '</div><small class="equipment-reference">魔法ARC／信仰MND・術威力14。率はSKL30基準。</small></div></section>';
}

function fittingValues(i,items,k){return fittingWith(i,items,()=>{if(k===2||k===3){eq[i][0]=items[2];eq[i][1]=items[3]}return characterValues(i)})}
function fittingScreen(i,k=0,preview){if(H.run?.battle)return pendingBattleMenu();if(!Object.hasOwn(fittingSlots,k))return;const s=fittingSession(i);if(!s)return;const changedSlot=s.slot!==k;s.slot=k;const previous=fittingValues(i,s.items,k);
 if(preview!==undefined&&fittingWith(i,s.items,()=>canEquip(i,k,preview))){s.items[k]=s.items[k].split('：')[0]+'：'+preview;if(k===4)for(let z=5;z<=7;z++)s.items[z]=s.items[z].split('：')[0]+'：'+preview;if((k===0||k===2)&&isTwoHanded(preview))s.items[k+1]=s.items[k+1].split('：')[0]+'：なし';eq[i]=s.items.slice();s.base=eq[i].slice();persist()}
 const a=previous,b=fittingValues(i,s.items,k),dirty=JSON.stringify(s.base)!==JSON.stringify(s.items),current=s.items[k].split('：')[1],list=k<4?['なし',...inventory.weapons]:k===4?inventory.armor.slice().sort((a,b)=>['魔装','軽装','重装'].indexOf(armorFamily(a))-['魔装','軽装','重装'].indexOf(armorFamily(b))):k===9?['なし',...Object.keys(hc().tools).filter(n=>hc().tools[n].battle)]:['なし','護符'];
 const slotButtons=keys=>keys.map(n=>'<button data-hub="equipChoice" data-args="'+hesc(JSON.stringify([i,n]))+'" aria-pressed="'+(n===k)+'"><small>'+fittingSlots[n]+'</small><b>'+hesc(s.items[n].split('：')[1])+'</b></button>').join('');
 let previousArmorFamily='';const rows=fittingWith(i,s.items,()=>list.map(n=>{const ok=canEquip(i,k,n),m=WM[n];let desc=k<4?n==='なし'?'武器を外します。':weaponDescription(n):k===4?armorDescription(n):k===9?n==='なし'?'携行具を外します。':toolDescription(n):n==='なし'?'装飾品を外します。':'補助効果を持つ装飾品。';if(!ok){const j={PHY:0,SKL:1,ARC:2,MND:3}[m?.[3]];desc=m&&j!=null&&stats[i][j]<m[4]?m[3]+' '+stats[i][j]+' / 必要 '+m[4]:(k===1||k===3)?'副手条件不足：両手武器との併用不可・二刀流はSKL 30必要':'装備条件不足'}const family=k===4?armorFamily(n):'',heading=family&&family!==previousArmorFamily?'<h3 class="armor-family-heading">'+hesc(family)+'</h3>':'';previousArmorFamily=family;return heading+'<div class="candidate '+(n===current?'selected':'')+'">'+HB(n+(n===current?('　装備中'):n===s.base[k].split('：')[1]?'　現在装備':''),desc,'uiEquipPreview',[i,k,n],!ok)+'</div>'}).join(''));
 show('<h2>'+hesc(names[i])+' / 装備</h2>'+fittingHero(i,a,b,k)+'<div class="fitting-controls"><div class="fitting-slot-group"><small>現在のセット</small><div>'+slotButtons([0,1])+'</div></div><div class="fitting-slot-group"><small>予備セット</small><div>'+slotButtons([2,3])+'</div></div><div class="fitting-other-slots">'+slotButtons([4,8,9])+'</div><p class="fitting-hint screen-hint">'+hesc(b.weightLevel?b.weightText:k===2||k===3?'予備：換装後の値を表示。':k===1?'副手：技・重量・防御に反映。':'タップで装備変更。')+'</p></div><div class="fitting-list"><div class="fitting-list-title">'+fittingSlots[k]+'の候補 <small>属性・射程 '+hesc(b.attack)+' / '+hesc(b.stance)+'</small></div>'+rows+HB('主副セットを換装','現在と予備を入れ替えます','fittingSwap',[i])+'</div>');
 if(changedSlot){const body=document.querySelector('#panel .panel-body');if(body)body.scrollTop=0}
}
function fittingCancel(i){if(H.run?.battle)return;const k=fittingDraft?.slot||0;fittingDiscard();equipChoice(i,k)}
function fittingApply(i){if(H.run?.battle||!fittingDraft||fittingDraft.i!==i)return;const s=fittingDraft;if(JSON.stringify(s.base)!==JSON.stringify(eq[i])){fittingDiscard();return equip(i)}const valid=fittingWith(i,s.items,()=>Object.keys(fittingSlots).every(k=>{k=Number(k);return s.items[k]===s.base[k]||canEquip(i,k,s.items[k].split('：')[1])}));if(!valid)return note('装備条件や所持品が変わりました。もう一度選んでください。');eq[i]=s.items.slice();const k=s.slot;fittingDiscard();persist();equipChoice(i,k)}

function fittingSwap(i){if(H.run?.battle)return;const s=fittingSession(i);if(!s)return;const v=s.items.slice(0,4).map(x=>x.split('：')[1]);for(let k=0;k<4;k++)s.items[k]=s.items[k].split('：')[0]+'：'+v[(k+2)%4];eq[i]=s.items.slice();s.base=eq[i].slice();persist();equipChoice(i,s.slot)}
