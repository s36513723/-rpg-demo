let frontReplacementUsed={party:new Set(),enemies:new Set()};
const commandPanel=document.querySelector(".command-panel");
const battleMessage=document.getElementById("battleMessage");
const battleMessageText=document.getElementById("battleMessageText");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let lastVisual={actorId:null,targetId:null};
let commandEffectBusy=false;
let replacementFx=[];

function setBattleMode(on){
  commandPanel.classList.toggle("resolving",on);
  if(!on){
    battleMessage.className="battle-message";
    battleMessageText.textContent="";
  }
}
function clearBattleCardEffects(){
  document.querySelectorAll(".battle-acting,.battle-hit,.battle-swap,.battle-switch").forEach(el=>{
    el.classList.remove("battle-acting","battle-hit","battle-swap","battle-switch");
  });
}
function applyBattleCardEffects(v){
  clearBattleCardEffects();
  if(!v)return;
  if(v.actorId){
    const el=document.querySelector('[data-target-id="'+v.actorId+'"]');
    if(el)el.classList.add("battle-acting");
  }
  if(v.targetId){
    const el=document.querySelector('[data-target-id="'+v.targetId+'"]');
    if(el)el.classList.add("battle-hit");
  }
}
async function showBattleMessage(text,cls="",visual=null,delay=900){
  battleMessage.className="battle-message"+(cls?" "+cls:"");
  battleMessageText.textContent=text;
  applyBattleCardEffects(visual);
  await sleep(delay);
}
async function playCapturedEvents(events,visual=null){
  for(let i=0;i<events.length;i++){
    await showBattleMessage(events[i].text,events[i].cls,visual,i===events.length-1?1000:800);
    visual=null;
  }
}
function logOnly(text,cls=""){
  const d=document.createElement("div");
  d.className=cls;
  d.textContent=text;
  E.log.appendChild(d);
  E.log.scrollTop=E.log.scrollHeight;
}
async function animateSwapTransition(text,aId,bId,applyMove){
  battleMessage.className="battle-message sys";
  battleMessageText.textContent=text;
  clearBattleCardEffects();

  const ids=[aId,bId];
  const before={};
  ids.forEach(id=>{
    const el=document.querySelector('[data-target-id="'+id+'"]');
    if(el)before[id]=el.getBoundingClientRect();
  });

  applyMove();
  render();

  const animations=[];
  ids.forEach(id=>{
    const el=document.querySelector('[data-target-id="'+id+'"]');
    const from=before[id];
    if(!el||!from)return;
    const to=el.getBoundingClientRect();
    const dx=from.left-to.left;
    const dy=from.top-to.top;
    const anim=el.animate(
      [
        {transform:"translate("+dx+"px,"+dy+"px) scale(1.02)",filter:"brightness(1.55)"},
        {transform:"translate(0,0) scale(1)",filter:"brightness(1)"}
      ],
      {duration:1000,easing:"cubic-bezier(.2,.8,.2,1)",fill:"both"}
    );
    animations.push(anim.finished.catch(()=>{}));
  });

  if(animations.length)await Promise.all(animations);
  else await sleep(1000);
}
async function playSwitchEffect(u){
  if(commandEffectBusy||phase==="resolve"||over)return;
  commandEffectBusy=true;
  setBattleMode(true);
  render();
  battleMessage.className="battle-message sys";
  battleMessageText.textContent=u.name+"は"+u.weapon.name+"へ換装！";
  clearBattleCardEffects();
  const el=document.querySelector('[data-target-id="'+u.id+'"]');
  if(el)el.classList.add("battle-switch");
  await sleep(900);
  clearBattleCardEffects();
  setBattleMode(false);
  commandEffectBusy=false;
  render();
}
function setAutoButton(){
  if(!E.auto)return;
  E.auto.textContent="Auto";
  E.auto.classList.remove("auto-on");
  E.auto.setAttribute("aria-pressed","false");
  E.auto.disabled=over||phase==="resolve"||commandEffectBusy;
}
function autoTargetFor(a,range){
  return alive(enemies).find(e=>reach(a,e,range))||null;
}
function autoQueueAll(){
  if(over)return false;
  alive(party).forEach(a=>{
    if(a.queued)return;
    const normalTarget=autoTargetFor(a,a.weapon.range);
    if(normalTarget){
      a.defending=false;
      a.queued={type:"attack",targetId:normalTarget.id};
      return;
    }
    const skill=a.skills.find(s=>{
      if(s.target!=="enemy"||!enough(a,s))return false;
      return !!autoTargetFor(a,s.range);
    });
    if(skill){
      const t=autoTargetFor(a,skill.range);
      a.defending=false;
      a.queued={type:"skill",action:skill,targetId:t.id};
      return;
    }
    a.defending=true;
    a.queued={type:"defend"};
  });
  phase="ready";
  const first=party.findIndex(x=>x.alive);
  if(first>=0)idx=first;
  render();
  return allQueued();
}
function runAutoRound(){
  if(over||phase==="resolve"||commandEffectBusy)return;
  autoQueueAll();
  if(allQueued())resolve();
}
function actionIntro(side,u){
  if(side==="h"){
    const q=u.queued;
    if(!q)return u.name+"は様子を見ている。";
    if(q.type==="attack")return u.name+"の"+u.weapon.name+"！";
    if(q.type==="skill")return u.name+"は「"+q.action.name+"」を使った！";
    if(q.type==="escape")return u.name+"は逃走を試みた！";
    return u.name+"の行動！";
  }
  if(u.spell)return u.name+"は「"+u.spell.name+"」を唱えた！";
  return u.name+"の攻撃！";
}
function targetScopeText(s){
  const v=s.scope||"single";
  if(v==="single")return "単体";
  if(v==="row")return "1列";
  if(v==="all")return "全体";
  if(v==="random")return "ランダム複数";
  if(v==="pierce")return "前後貫通";
  if(v==="adjacent")return "隣接";
  return v;
}
function actionEffectText(s){
  const parts=[];
  if(s.attr)parts.push(s.attr);
  if(s.mult&&s.mult!==1)parts.push("威力"+s.mult.toFixed(2).replace(/0+$/,"").replace(/\.$/,""));
  if(s.poison)parts.push("猛毒"+s.poison+"%");
  if(s.stun)parts.push("気絶"+s.stun+"%");
  if(s.headBind)parts.push("頭封じ"+s.headBind+"%");
  if(s.legBind)parts.push("脚封じ"+s.legBind+"%");
  if(s.critBonus)parts.push("CR+"+s.critBonus);
  if(s.heal)parts.push("回復");
  return parts.join("｜")||"効果なし";
}
function syncTargetHighlight(){
  const valid=new Set(Array.from(E.target.options).map(o=>o.value).filter(Boolean));
  const chosen=E.target.value;
  [E.eb,E.ef,E.pf,E.pb].forEach(box=>{
    box.querySelectorAll("[data-target-id]").forEach(el=>{
      const id=el.dataset.targetId;
      el.classList.toggle("target-valid",valid.has(id));
      el.classList.toggle("target-selected",!!chosen&&id===chosen);
    });
  });
}
function chooseCardTarget(id){
  if(!["command","ready"].includes(phase)||over)return false;
  const valid=Array.from(E.target.options).some(o=>o.value===id);
  if(!valid)return false;
  E.target.value=id;
  syncTargetHighlight();
  return true;
}
function render(){
  [E.eb,E.ef,E.pf,E.pb].forEach(x=>x.innerHTML="");
  enemies.filter(x=>x.row==="back").sort((a,b)=>a.slot-b.slot).forEach(x=>E.eb.appendChild(card(x,true)));
  enemies.filter(x=>x.row==="front").sort((a,b)=>a.slot-b.slot).forEach(x=>E.ef.appendChild(card(x,true)));
  party.filter(x=>x.row==="front").sort((a,b)=>a.slot-b.slot).forEach(x=>E.pf.appendChild(card(x,false)));
  party.filter(x=>x.row==="back").sort((a,b)=>a.slot-b.slot).forEach(x=>E.pb.appendChild(card(x,false)));
  E.round.textContent="Round "+round;
  E.terrainEffect.innerHTML="<strong>地形効果："+terrain.name+"</strong>｜"+terrain.desc;
  controls();
}
function allQueued(){return alive(party).every(x=>!!x.queued)}
function adv(){
  const n=party.length;let next=-1;
  for(let step=1;step<=n;step++){const i=(idx+step)%n;if(party[i].alive&&!party[i].queued){next=i;break}}
  if(next<0){phase="ready"}else{idx=next;phase="command"}
  render();
}
function enough(a,s){return !s.costType||(s.costType==="SP"?a.sp>=s.cost:a.mp>=s.cost)}
function spend(a,s){if(s.costType==="SP")a.sp-=s.cost;if(s.costType==="MP")a.mp-=s.cost}
function selected(){const a=current();if(!a)return null;if(E.action.value==="attack")return{kind:"attack",range:a.weapon.range,target:"enemy",hit:0,speed:0};return a.skills[+E.action.value]}
function fillTargets(){
  const a=current(),act=selected();E.target.innerHTML="";if(!a||!act)return;
  const list=act.target==="ally"?alive(party):alive(enemies).filter(e=>reach(a,e,act.range));
  if(!list.length){const o=document.createElement("option");o.value="";o.textContent="有効な対象なし";E.target.appendChild(o);syncTargetHighlight();return}
  list.forEach(u=>{const o=document.createElement("option");o.value=u.id;o.textContent=u.name;E.target.appendChild(o)});
  if(a.queued?.targetId&&list.some(x=>x.id===a.queued.targetId))E.target.value=a.queued.targetId;
  else E.target.value=list[0].id;
  syncTargetHighlight();
}
function controls(){
  const a=current(),on=["command","ready"].includes(phase)&&a&&a.alive&&!over;
  [E.action,E.target,E.queue,E.defend,E.swap,E.escape,E.switch].forEach(x=>x.disabled=!on);
  E.resolve.disabled=!allQueued()||over||phase==="resolve";setAutoButton();
  if(!on){E.actor.textContent=over?"戦闘終了":phase==="resolve"?"戦闘中":"-";return}
  E.actor.textContent=a.name+"｜"+a.style;
  E.action.innerHTML="";
  let o=document.createElement("option");o.value="attack";o.textContent="通常攻撃："+a.weapon.name+"（単体｜"+rangeName(a.weapon.range)+"｜"+a.weapon.attr+"）";E.action.appendChild(o);
  a.skills.forEach((s,i)=>{o=document.createElement("option");o.value=String(i);o.textContent=s.name+"（"+s.costType+s.cost+"｜"+targetScopeText(s)+"｜"+rangeName(s.range)+"｜"+actionEffectText(s)+"）";E.action.appendChild(o)});
  if(a.queued?.type==="attack")E.action.value="attack";
  else if(a.queued?.type==="skill"){const qi=a.skills.indexOf(a.queued.action);if(qi>=0)E.action.value=String(qi)}
  fillTargets();
}
function queue(){
  const a=current(),act=selected();if(!a||!act)return;
  const list=act.target==="ally"?party:enemies,t=list.find(x=>x.id===E.target.value);
  if(!t){lg("対象をカードから選択してください。","bad");return}
  if(act.target!=="ally"&&!reach(a,t,act.range)){lg("その対象には届きません。","bad");return}
  if(act.kind!=="attack"&&!enough(a,act)){lg(a.name+"は"+act.costType+"不足。","bad");return}
  a.defending=false;a.queued={type:act.kind==="attack"?"attack":"skill",action:act,targetId:t.id};adv();
}
function defend(){const a=current();if(!a)return;a.defending=true;a.queued={type:"defend"};adv()}
function escape(){const a=current();if(!a)return;if(a.status.legBind>0){lg("脚封じで逃走できません。","bad");return}a.defending=false;a.queued={type:"escape"};adv()}
function swap(){
    const a=current();if(!a)return;
    if(a.status.legBind>0){lg("脚封じで列変更できません。","bad");return}
    const col=((a.slot-1)%3)+1;
    const b=alive(party).find(x=>x.id!==a.id&&x.row!==a.row&&(((x.slot-1)%3)+1)===col);
    if(!b){lg("対応する反対列のメンバーがいません。","bad");return}
    a.defending=false;
    a.queued={type:"swap",swapId:b.id};
    adv();
  }
async function switchWeapon(){
    const a=current();if(!a||commandEffectBusy||phase==="resolve"||over)return;
    a.wi=a.wi?0:1;
    a.weapon=W[a.weapons[a.wi]];
    render();
    await playSwitchEffect(a);
  }
function am(t,a){if(t.weak?.[a])return t.weak[a];if(t.resist?.[a])return t.resist[a];return 1}
function hit(att,t,act,weaponBased){if(t.status?.legBind>0)return 100;let h=90+(att.SKL-t.SKL)*.5+(act.hit||0);if(weaponBased)h+=(att.weapon.hit||0)+terrain.wHit(att.weapon);return Math.max(30,Math.min(100,h))}
function crit(a,t,act){return Math.max(0,Math.min(50,5+(a.SKL-t.SKL)/4+(act.critBonus||0)))}
function atkVal(a,act){if(act.kind==="attack"){const s=a.weapon.normal==="SKL"?a.SKL:a.PHY;return a.weapon.power+s}if(act.stat==="PHY")return a.weapon.power+a.PHY;if(act.stat==="SKL")return a.weapon.power+a.SKL;if(act.stat==="ARC")return 14+a.ARC;if(act.stat==="MND")return 12+a.MND;if(act.stat==="MIX")return a.weapon.power+.5*a.PHY+.5*a.ARC;return a.weapon.power+a.PHY}
function damage(a,t,act){const attr=act.kind==="attack"?a.weapon.attr:act.attr,m=act.kind==="attack"?1:act.mult,magic=act.kind==="spell"||["ARC","MND"].includes(act.stat),def=magic?t.magDef:t.physDef,dm=100/(100+def),cr=Math.random()*100<crit(a,t,act);let tm=1;if(act.kind==="attack"&&a.weapon.range==="far")tm=terrain.ranged;let d=atkVal(a,act)*m*dm*am(t,attr)*(cr?1.5:1)*tm*(.95+Math.random()*.1);if(t.defending)d*=.5;return{d:Math.max(1,Math.floor(d)),cr,weak:am(t,attr)>1}}
function statuses(a,t,s){[["poison","猛毒",s.poison,3],["stun","気絶",s.stun,1],["headBind","頭封じ",s.headBind,2],["legBind","脚封じ",s.legBind,2]].forEach(([k,n,b,d])=>{if(!b)return;let st=a.SKL;if(k==="stun")st=a.PHY;if(s.stat==="ARC")st=a.ARC;if(s.stat==="MND")st=a.MND;const c=Math.max(5,Math.min(95,b+.75*(st-t.MND)));if(Math.random()*100<c){t.status[k]=d;lg(t.name+"に"+n+"！","ok")}})}
function replaceDeadFrontOnce(list,label,u){
  if(u.row!=="front")return;
  const side=list===party?"party":"enemies";
  const col=((u.slot-1)%3)+1;
  if(frontReplacementUsed[side].has(col))return;

  const reserve=list.find(x=>x.alive&&x.row==="back"&&(((x.slot-1)%3)+1)===col);
  frontReplacementUsed[side].add(col);
  if(!reserve)return;

  const text=label+" "+col+"列目："+reserve.name+"が前列へ交代。";
  replacementFx.push({a:u,b:reserve,aId:u.id,bId:reserve.id,col,text});
}
function applyReplacement(r){
  r.a.row="back";
  r.a.slot=r.col+3;
  r.b.row="front";
  r.b.slot=r.col;
  logOnly(r.text,"sys");
}
function death(u){
  if(u.hp<=0&&u.alive){
    u.hp=0;
    u.alive=false;
    lg(u.name+"は戦闘不能。","sys");
    if(party.includes(u))replaceDeadFrontOnce(party,"味方",u);
    else if(enemies.includes(u))replaceDeadFrontOnce(enemies,"敵",u);
  }
}
function heroAct(a){
  const q=a.queued;lastVisual={actorId:a.id,targetId:q?.targetId||null};if(!q||!a.alive)return;if(a.status.stun>0){lg(a.name+"は気絶して動けない。","bad");return}
  if(["defend","swap"].includes(q.type))return;
  if(q.type==="escape"){const p=alive(party),e=alive(enemies),ap=p.reduce((s,x)=>s+x.SKL,0)/p.length,ae=e.reduce((s,x)=>s+x.SKL,0)/e.length,c=Math.max(20,Math.min(90,55+(ap-ae)*.7));if(Math.random()*100<c){finish("escape");return}lg(a.name+"の逃走は失敗。","bad");return}
  const act=q.type==="attack"?{kind:"attack",range:a.weapon.range,target:"enemy",hit:0,speed:0}:q.action;
  if(a.status.headBind>0&&act.kind==="spell"){lg(a.name+"は頭封じで"+act.name+"を使えない。","bad");return}
  if(q.type==="skill"){if(!enough(a,act)){lg(a.name+"は"+act.costType+"不足で"+act.name+"を使えない。","bad");return}spend(a,act)}
  if(act.heal){const t=party.find(x=>x.id===q.targetId&&x.alive);if(!t)return;lastVisual.targetId=t.id;const n=Math.floor(12+a.MND*.8);t.hp=Math.min(t.maxHp,t.hp+n);lg(a.name+"の"+act.name+"。"+t.name+"が"+n+"回復。","ok");return}
  let t=enemies.find(x=>x.id===q.targetId&&x.alive);if(!t||!reach(a,t,act.range))t=alive(enemies).find(e=>reach(a,e,act.range));if(t)lastVisual.targetId=t.id;if(!t){lg(a.name+"には有効な対象がない。","bad");return}
  const wb=act.kind==="attack"||act.kind==="skill";if(Math.random()*100>hit(a,t,act,wb)){lg(a.name+"の"+(act.kind==="attack"?a.weapon.name:act.name)+"は外れた。","bad");return}
  const r=damage(a,t,act);t.hp-=r.d;lg(a.name+"の"+(act.kind==="attack"?a.weapon.name:act.name)+" → "+t.name+" "+r.d+"ダメージ"+(r.cr?" CRITICAL":"")+(r.weak?" 弱点":""),r.weak?"ok":"");if(act.kind!=="attack")statuses(a,t,act);death(t);
}
function enemyAct(e){
  lastVisual={actorId:e.id,targetId:null};
  if(!e.alive)return;if(e.status.stun>0){lg(e.name+"は気絶して動けない。","bad");return}
  const act=e.spell?{...e.spell,kind:"spell"}:{kind:"attack",range:e.weapon.range,attr:e.weapon.attr,mult:1,stat:"PHY",hit:0,speed:0};
  if(e.status.headBind>0&&act.kind==="spell"){lg(e.name+"は頭封じで術を使えない。","ok");return}
  if(act.costType==="MP"){if(e.mp<act.cost){lg(e.name+"はMP不足。","ok");return}e.mp-=act.cost}
  const cs=alive(party).filter(p=>ereach(e,p,act.range));if(!cs.length)return;let t=e.ai==="archer"?[...cs].sort((a,b)=>a.hp-b.hp)[0]:cs[Math.floor(Math.random()*cs.length)];lastVisual.targetId=t.id;
  const pseudo={...e,weapon:e.weapon||{power:0,hit:0,speed:0,range:"far",weight:"light"}};if(Math.random()*100>hit(pseudo,t,act,act.kind==="attack")){lg(e.name+"の攻撃は外れた。");return}
  const r=damage(pseudo,t,act);t.hp-=r.d;lg(e.name+" → "+t.name+" "+r.d+"ダメージ","bad");death(t);
}
function speed(u,q,enemy=false){if(u.status?.legBind>0)return-999;if(enemy){const a=u.spell||{speed:0};return u.SKL+(a.speed||0)}if(q?.type==="attack")return u.SKL+(u.weapon.speed||0)+terrain.wSpeed(u.weapon);if(q?.type==="skill"){const a=q.action;return a.kind==="spell"?u.SKL+(a.speed||0):u.SKL+(u.weapon.speed||0)+(a.speed||0)+terrain.wSpeed(u.weapon)}return u.SKL}
function swaps(){
  const used=new Set(),fx=[];
  party.forEach(a=>{
    if(!a.alive||a.queued?.type!=="swap")return;
    const b=party.find(x=>x.id===a.queued.swapId&&x.alive);
    if(!b||used.has(a.id)||used.has(b.id))return;
    used.add(a.id);used.add(b.id);
    const text=a.name+"と"+b.name+"が列を入れ替えた。";
    fx.push({a,b,aId:a.id,bId:b.id,text});
  });
  return fx;
}
function applyManualSwap(s){
  const r=s.a.row,slot=s.a.slot;
  s.a.row=s.b.row;s.a.slot=s.b.slot;
  s.b.row=r;s.b.slot=slot;
  logOnly(s.text,"sys");
}
async function resolve(){
  if(!allQueued()||over||phase==="resolve")return;
  phase="resolve";
  setBattleMode(true);
  battleEvents=[];
  render();

  // Resolve row changes and defensive stances first.
  battleEvents=[];
  const swapFx=swaps();
  party.filter(p=>p.alive&&p.queued?.type==="defend").forEach(p=>lg(p.name+"は身を守っている。","sys"));
  render();
  for(const s of swapFx){
    await animateSwapTransition(s.text,s.aId,s.bId,()=>applyManualSwap(s));
  }
  const setupEvents=battleEvents.splice(0);
  if(setupEvents.length)await playCapturedEvents(setupEvents);

  const order=[];
  party.forEach(p=>{
    if(p.alive&&p.queued&&!["swap","defend"].includes(p.queued.type)){
      order.push({side:"h",u:p,s:speed(p,p.queued)});
    }
  });
  enemies.forEach(e=>{if(e.alive)order.push({side:"e",u:e,s:speed(e,null,true)})});
  order.sort((a,b)=>b.s-a.s);

  for(const x of order){
    if(over)break;
    lastVisual={actorId:x.u.id,targetId:null};
    await showBattleMessage(actionIntro(x.side,x.u),"",lastVisual,850);

    battleEvents=[];
    replacementFx=[];
    x.side==="h"?heroAct(x.u):enemyAct(x.u);

    if(!over&&!alive(enemies).length)finish("win");
    if(!over&&!alive(party).length)finish("lose");

    render();
    const replacements=replacementFx.splice(0);
    const events=battleEvents.splice(0);
    if(events.length)await playCapturedEvents(events,{...lastVisual});
    else if(!replacements.length)await showBattleMessage("……","",lastVisual,550);
    for(const r of replacements){
      await animateSwapTransition(r.text,r.aId,r.bId,()=>applyReplacement(r));
    }
  }

  if(!over){
    battleEvents=[];
    replacementFx=[];
    endRound();
    render();
    const replacements=replacementFx.splice(0);
    const endEvents=battleEvents.splice(0);
    if(endEvents.length)await playCapturedEvents(endEvents);
    for(const r of replacements){
      await animateSwapTransition(r.text,r.aId,r.bId,()=>applyReplacement(r));
    }
  }

  clearBattleCardEffects();
  setBattleMode(false);
  render();
}
function tick(u){if(!u.alive)return;if(u.status.poison>0){const d=Math.max(1,Math.floor(u.maxHp*.04));u.hp-=d;lg(u.name+"は猛毒で"+d+"ダメージ。","bad");death(u)}["poison","stun","headBind","legBind"].forEach(k=>{if(u.status[k]>0)u.status[k]--})}
function endRound(){[...party,...enemies].forEach(tick);if(!alive(enemies).length){finish("win");return}if(!alive(party).length){finish("lose");return}party.forEach(x=>{x.queued=null;x.defending=false});enemies.forEach(x=>{x.queued=null;x.defending=false});round++;idx=0;while(idx<party.length&&!party[idx].alive)idx++;phase="command";lg("―― Round "+round+" ――","sys")}
function finish(t){over=true;if(t==="win")lg("―― 勝利 ―― 敵を撃破しました。","ok");if(t==="lose")lg("―― 敗北 ―― 再挑戦できます。","bad");if(t==="escape")lg("―― 撤退成功 ―― 戦闘から離脱しました。","sys");phase="done";}
function fresh(){setAutoButton();setBattleMode(false);frontReplacementUsed={party:new Set(),enemies:new Set()};party=HT.map(x=>H({...x,weapons:[...x.weapons],skills:x.skills.map(s=>({...s}))}));enemies=ET.map(x=>En({...x,weak:{...(x.weak||{})},resist:{...(x.resist||{})},weapon:x.weapon?{...x.weapon}:null,spell:x.spell?{...x.spell}:null}));round=1;idx=0;phase="command";over=false;terrain=terrainList[Math.floor(Math.random()*terrainList.length)];E.log.innerHTML="";lg("戦闘開始。地形「"+terrain.name+"」: "+terrain.desc,"sys");render()}
E.action.addEventListener("change",fillTargets);
E.queue.addEventListener("click",queue);
E.defend.addEventListener("click",defend);
E.escape.addEventListener("click",escape);
E.swap.addEventListener("click",swap);
E.switch.addEventListener("click",switchWeapon);
E.resolve.addEventListener("click",resolve);
E.auto.addEventListener("click",runAutoRound);
E.newB.addEventListener("click",fresh);
[E.eb,E.ef].forEach(box=>{
  box.addEventListener("click",ev=>{
    const c=ev.target.closest("[data-target-id]");
    if(!c)return;
    chooseCardTarget(c.dataset.targetId);
  });
  box.addEventListener("keydown",ev=>{
    if(ev.key!=="Enter"&&ev.key!==" ")return;
    const c=ev.target.closest("[data-target-id]");
    if(!c)return;
    ev.preventDefault();
    chooseCardTarget(c.dataset.targetId);
  });
});
E.target.addEventListener("change",syncTargetHighlight);
[E.pf,E.pb].forEach(box=>{
  box.addEventListener("click",ev=>{
    const c=ev.target.closest("[data-char-id]");if(!c||!["command","ready"].includes(phase))return;
    const act=selected();
    if(act?.target==="ally"&&chooseCardTarget(c.dataset.charId))return;
    const ni=party.findIndex(x=>x.id===c.dataset.charId&&x.alive);
    if(ni>=0){idx=ni;render()}
  });
  box.addEventListener("keydown",ev=>{
    if(ev.key!=="Enter"&&ev.key!==" ")return;
    const c=ev.target.closest("[data-char-id]");if(!c||!["command","ready"].includes(phase))return;
    ev.preventDefault();
    const act=selected();
    if(act?.target==="ally"&&chooseCardTarget(c.dataset.charId))return;
    const ni=party.findIndex(x=>x.id===c.dataset.charId&&x.alive);
    if(ni>=0){idx=ni;render()}
  });
});
fresh();