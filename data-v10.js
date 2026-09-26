const jw=document.getElementById("jsWarning");if(jw)jw.style.display="none";const es=document.getElementById("engineStatus");if(es){es.textContent="JavaScript動作中";es.style.color="var(--ok)";}
const $=id=>document.getElementById(id),E={engineStatus:$("engineStatus"),round:$("round"),eb:$("eb"),ef:$("ef"),pf:$("pf"),pb:$("pb"),actor:$("actor"),terrainEffect:$("terrainEffect"),action:$("action"),target:$("target"),queue:$("queue"),defend:$("defend"),swap:$("swap"),escape:$("escape"),switch:$("switch"),newB:$("new"),resolve:$("resolve"),log:$("log"),result:$("result"),rtitle:$("rtitle"),rtext:$("rtext")};
const terrainList=[
{name:"狭所",desc:"重量武器の命中-10・速度-5",wHit:w=>w.weight==="heavy"?-10:0,wSpeed:w=>w.weight==="heavy"?-5:0,ranged:1},
{name:"高台",desc:"後列からの武器遠距離攻撃+10%",wHit:()=>0,wSpeed:()=>0,ranged:1.1},
{name:"茂み",desc:"武器遠距離攻撃の命中-10（術は影響なし）",wHit:w=>w.range==="far"?-10:0,wSpeed:()=>0,ranged:1},
{name:"開所",desc:"武器遠距離攻撃+10%",wHit:()=>0,wSpeed:()=>0,ranged:1.1}
];
const W={
hammer:{name:"戦槌",attr:"壊",range:"near",power:22,hit:-5,speed:-5,weight:"heavy"},
axe:{name:"戦斧",attr:"斬",range:"near",power:24,hit:-5,speed:-5,weight:"heavy"},
dagger:{name:"短剣",attr:"斬",range:"near",power:11,hit:8,speed:8,weight:"light",normal:"SKL"},
chakram:{name:"回刃",attr:"斬",range:"far",power:12,hit:5,speed:4,weight:"light",normal:"SKL"},
sword:{name:"剣",attr:"斬",range:"near",power:17,hit:3,speed:0,weight:"normal"},
spear:{name:"槍",attr:"突",range:"mid",power:18,hit:2,speed:0,weight:"normal"},
bow:{name:"長弓",attr:"突",range:"far",power:16,hit:7,speed:1,weight:"normal",normal:"SKL"},
staff:{name:"杖",attr:"壊",range:"near",power:8,hit:0,speed:0,weight:"light"},
talisman:{name:"呪符",attr:"無",range:"near",power:6,hit:0,speed:0,weight:"light"}
},ARM={heavy:{p:28,m:8},light:{p:15,m:11},magic:{p:7,m:20}};
function drv(P,S,A,M){const T=P+S+A+M,p=Math.max(0,P-10),s=Math.max(0,S-10),x=Math.max(0,A+M-20);return{hp:Math.floor(100+.5*(T-100)+2*p+Math.max(0,p-20)),sp:Math.floor(20+.1*(T-100)+.4*p+s),mp:Math.floor(x<=50?2*x:100+.5*(x-50))}}
function H(o){const d=drv(o.PHY,o.SKL,o.ARC,o.MND),ar=ARM[o.armor];return{...o,maxHp:d.hp,hp:d.hp,maxSp:d.sp,sp:d.sp,maxMp:d.mp,mp:d.mp,physDef:o.PHY+ar.p,magDef:o.ARC+o.MND+ar.m,wi:0,weapon:W[o.weapons[0]],alive:true,defending:false,status:{},queued:null}}
const HT=[
{id:"war",name:"ガルド",style:"ウォーリアー",row:"front",slot:1,PHY:55,SKL:25,ARC:10,MND:10,armor:"heavy",weapons:["hammer","axe"],skills:[
{name:"破砕撃",kind:"skill",costType:"SP",cost:10,mult:1.45,attr:"壊",range:"near",stat:"PHY",target:"enemy",scope:"single",speed:-2},
{name:"震撃",kind:"skill",costType:"SP",cost:15,mult:1.2,attr:"壊",range:"near",stat:"PHY",target:"enemy",scope:"single",speed:-5,stun:45}]},
{id:"rog",name:"リゼ",style:"ローグ",row:"front",slot:2,PHY:30,SKL:50,ARC:10,MND:10,armor:"light",weapons:["dagger","chakram"],skills:[
{name:"毒刃",kind:"skill",costType:"SP",cost:8,mult:1.15,attr:"斬",range:"near",stat:"SKL",target:"enemy",scope:"single",hit:8,speed:6,poison:60},
{name:"急所突き",kind:"skill",costType:"SP",cost:12,mult:1.5,attr:"斬",range:"near",stat:"SKL",target:"enemy",scope:"single",hit:5,speed:3,critBonus:20}]},
{id:"run",name:"エルン",style:"ルーンフェンサー",row:"front",slot:3,PHY:40,SKL:20,ARC:30,MND:10,armor:"light",weapons:["sword","spear"],skills:[
{name:"火炎剣",kind:"skill",costType:"MP",cost:12,mult:1.35,attr:"火",range:"near",stat:"MIX",target:"enemy",scope:"single"},
{name:"貫穿",kind:"skill",costType:"SP",cost:9,mult:1.35,attr:"突",range:"mid",stat:"PHY",target:"enemy",scope:"single",hit:4}]},
{id:"ran",name:"セナ",style:"レンジャー",row:"back",slot:4,PHY:20,SKL:60,ARC:10,MND:10,armor:"light",weapons:["bow","spear"],skills:[
{name:"脚封じ射ち",kind:"skill",costType:"SP",cost:10,mult:1.05,attr:"突",range:"far",stat:"SKL",target:"enemy",scope:"single",hit:10,speed:2,legBind:65},
{name:"狙撃",kind:"skill",costType:"SP",cost:14,mult:1.55,attr:"突",range:"far",stat:"SKL",target:"enemy",scope:"single",hit:12,speed:-3,critBonus:10}]},
{id:"arc",name:"ミレア",style:"アルカニスト",row:"back",slot:5,PHY:10,SKL:10,ARC:60,MND:20,armor:"magic",weapons:["staff","talisman"],skills:[
{name:"火球",kind:"spell",costType:"MP",cost:14,mult:1.45,attr:"火",range:"far",stat:"ARC",target:"enemy",scope:"single",hit:5,speed:0},
{name:"大火炎",kind:"spell",costType:"MP",cost:28,mult:1.9,attr:"火",range:"far",stat:"ARC",target:"enemy",scope:"single",hit:0,speed:-10}]},
{id:"mys",name:"ユナ",style:"ミスティック",row:"back",slot:6,PHY:10,SKL:30,ARC:10,MND:50,armor:"magic",weapons:["talisman","staff"],skills:[
{name:"頭封じの符",kind:"spell",costType:"MP",cost:12,mult:.75,attr:"無",range:"far",stat:"MND",target:"enemy",scope:"single",hit:10,speed:5,headBind:70},
{name:"治癒祈祷",kind:"spell",costType:"MP",cost:16,mult:0,attr:"無",range:"all",stat:"MND",target:"ally",scope:"single",hit:100,speed:5,heal:true}]}
];
const ET=[
{id:"g1",name:"重装兵A",style:"重装兵",row:"front",slot:1,hp:155,PHY:42,SKL:20,ARC:10,MND:18,physDef:70,magDef:36,weak:{壊:2,火:1.2},resist:{斬:.5},weapon:{name:"大盾槍",attr:"突",range:"mid",power:20,hit:0,speed:-4,weight:"heavy"},ai:"guard"},
{id:"g2",name:"重装兵B",style:"重装兵",row:"front",slot:2,hp:145,PHY:40,SKL:22,ARC:10,MND:18,physDef:66,magDef:36,weak:{壊:2},resist:{斬:.5},weapon:{name:"戦槌",attr:"壊",range:"near",power:21,hit:-3,speed:-5,weight:"heavy"},ai:"guard"},
{id:"g3",name:"槍兵",style:"槍兵",row:"front",slot:3,hp:125,PHY:34,SKL:30,ARC:10,MND:16,physDef:52,magDef:32,weak:{斬:1.3,火:1.2},resist:{突:.5},weapon:{name:"長槍",attr:"突",range:"mid",power:18,hit:3,speed:0,weight:"normal"},ai:"guard"},
{id:"arch",name:"弓兵A",style:"弓兵",row:"back",slot:4,hp:100,PHY:20,SKL:48,ARC:10,MND:15,physDef:35,magDef:35,weak:{斬:1.5},resist:{},weapon:{name:"弓",attr:"突",range:"far",power:15,hit:7,speed:2,weight:"normal"},ai:"archer"},
{id:"mage",name:"魔術師",style:"魔術師",row:"back",slot:5,hp:90,PHY:10,SKL:24,ARC:48,MND:24,physDef:24,magDef:58,weak:{斬:1.4,突:1.2},resist:{火:.5},spell:{name:"火炎術",kind:"spell",attr:"火",range:"far",power:16,mult:1.25,hit:5,speed:-2,stat:"ARC",costType:"MP",cost:12},ai:"mage"},
{id:"arch2",name:"弓兵B",style:"弓兵",row:"back",slot:6,hp:95,PHY:18,SKL:44,ARC:10,MND:16,physDef:32,magDef:36,weak:{斬:1.5,壊:1.2},resist:{},weapon:{name:"弓",attr:"突",range:"far",power:14,hit:6,speed:3,weight:"normal"},ai:"archer"}
];
function En(o){const d=drv(o.PHY,o.SKL,o.ARC,o.MND);return{...o,maxHp:o.hp,maxSp:d.sp,sp:d.sp,maxMp:d.mp,mp:d.mp,alive:true,defending:false,status:{},queued:null}}
let party=[],enemies=[],round=1,idx=0,phase="command",terrain=terrainList[0],over=false;
const alive=a=>a.filter(x=>x.alive&&x.hp>0),pct=(v,m)=>m?Math.max(0,Math.min(100,v/m*100)):0;
function status(u){const a=[];if(u.status.poison>0)a.push("猛毒");if(u.status.stun>0)a.push("気絶");if(u.status.headBind>0)a.push("頭封じ");if(u.status.legBind>0)a.push("脚封じ");return a.join("・")}
function lg(t,c=""){const d=document.createElement("div");d.className=c;d.textContent=t;E.log.appendChild(d);E.log.scrollTop=E.log.scrollHeight}
function card(u,enemy){
  const d=document.createElement("div");
  d.className="unit"+(!u.alive?" dead":"")+(!enemy&&["command","ready"].includes(phase)&&party[idx]?.id===u.id?" active":"")+(!enemy?" inspectable":"");
  d.dataset.targetId=u.id;if(!enemy){d.dataset.charId=u.id;d.tabIndex=0;d.setAttribute("role","button");d.setAttribute("aria-label",u.name+"の行動入力へ移動");}else{d.tabIndex=0;d.setAttribute("role","button");d.setAttribute("aria-label",u.name+"を対象に選択");}
  const st=!u.alive?"戦闘不能":(status(u)||"正常")+(u.queued?"・入力済み":"");
  const spMax=u.maxSp??0,spNow=u.sp??0,mpMax=u.maxMp??0,mpNow=u.mp??0;
  d.innerHTML=
    '<div class="card-top"><div class="name">'+u.name+'</div><div class="card-state">'+st+'</div></div>'
    +'<div class="job">'+(u.style||"敵")+'</div>'
    +'<div class="resource-list">'
      +'<div class="resource-line"><div class="resource-value"><span class="rlabel">HP</span><b>'+u.hp+'</b></div><div class="bar"><i style="width:'+pct(u.hp,u.maxHp)+'%"></i></div></div>'
      +'<div class="resource-line"><div class="resource-value"><span class="rlabel">SP</span><b>'+spNow+'</b></div><div class="bar sp"><i style="width:'+pct(spNow,spMax)+'%"></i></div></div>'
      +'<div class="resource-line"><div class="resource-value"><span class="rlabel">MP</span><b>'+mpNow+'</b></div><div class="bar mp"><i style="width:'+pct(mpNow,mpMax)+'%"></i></div></div>'
    +'</div>';
  return d;
}
function current(){return party[idx]||null}
function eFront(){return alive(enemies).some(x=>x.row==="front")}
function erow(t){return eFront()?t.row:"front"}
function reach(a,t,r){if(!t?.alive)return false;const tr=erow(t);if(r==="all"||r==="far")return true;if(r==="mid")return tr==="front"||a.row==="front";return a.row==="front"&&tr==="front"}
function ereach(a,t,r){if(!t?.alive)return false;const tr=alive(party).some(x=>x.row==="front")?t.row:"front";if(r==="all"||r==="far")return true;if(r==="mid")return tr==="front"||a.row==="front";return a.row==="front"&&tr==="front"}
function selected(){const a=current();if(!a)return null;if(E.action.value==="attack")return{kind:"attack",range:a.weapon.range,target:"enemy",scope:"single",hit:0,speed:0};return a.skills[+E.action.value]}
function fillTargets(){const a=current(),act=selected();E.target.innerHTML="";if(!a||!act)return;const list=act.target==="ally"?alive(party):alive(enemies).filter(e=>reach(a,e,act.range));if(!list.length){const o=document.createElement("option");o.value="";o.textContent="有効な対象なし";E.target.appendChild(o);return}list.forEach(u=>{const o=document.createElement("option");o.value=u.id;o.textContent=`${u.name}（${u.row==="front"?"前":"後"} / HP${u.hp}）`;E.target.appendChild(o)})}
function controls(){const a=current(),on=phase==="command"&&a&&a.alive&&!over;[E.action,E.target,E.queue,E.defend,E.swapSel,E.swap,E.escape,E.wait,E.switch].forEach(x=>x.disabled=!on);E.resolve.disabled=phase!=="ready"||over;if(!on){E.actor.textContent=over?"戦闘終了":phase==="ready"?"全員入力済み":"-";E.ainfo.textContent="";return}E.actor.textContent=`${a.name}｜${a.style}（行動入力中）`;E.ainfo.textContent=`${a.weapon.name}・${a.weapon.attr}・${a.weapon.range==="near"?"近":a.weapon.range==="mid"?"中":"遠"} / HP${a.hp}/${a.maxHp} SP${a.sp}/${a.maxSp} MP${a.mp}/${a.maxMp}`;E.action.innerHTML="";let o=document.createElement("option");o.value="attack";o.textContent=`通常攻撃：${a.weapon.name}`;E.action.appendChild(o);a.skills.forEach((s,i)=>{o=document.createElement("option");o.value=i;o.textContent=`${s.name}（${s.costType}${s.cost} / ${s.range==="near"?"近":s.range==="mid"?"中":s.range==="far"?"遠":"全域"}）`;E.action.appendChild(o)});E.swapSel.innerHTML="";alive(party).filter(x=>x.row!==a.row&&x.id!==a.id).forEach(u=>{o=document.createElement("option");o.value=u.id;o.textContent=`${u.name}と交代`;E.swapSel.appendChild(o)});fillTargets()}
const armorName={heavy:"重装",light:"軽装",magic:"魔装"};
const rangeName=r=>r==="near"?"近":r==="mid"?"中":r==="far"?"遠":"全域";
function extraEffect(s){const a=[];if(s.poison)a.push(`猛毒 ${s.poison}%`);if(s.stun)a.push(`気絶 ${s.stun}%`);if(s.headBind)a.push(`頭封じ ${s.headBind}%`);if(s.legBind)a.push(`脚封じ ${s.legBind}%`);if(s.heal)a.push("回復");if(s.critBonus)a.push(`CR率+${s.critBonus}`);return a.join(" / ")||"なし"}