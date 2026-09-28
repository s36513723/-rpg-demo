/* v50: playable reference-style battle UI with dual ally/enemy formation view. */
(async()=>{'use strict';
const M={"width":1024,"height":975,"crops":{"sky":[0,0,426,151],"stone":[434,0,87,79],"face-arc":[529,0,53,48],"face-rog":[590,0,51,38],"face-mys":[649,0,51,41],"face-run":[708,0,50,41],"face-ran":[766,0,51,40],"face-war":[825,0,51,35],"knight":[0,159,178,190],"spear":[186,159,213,190],"priest":[407,159,127,195],"wolf":[542,159,210,135],"dragon":[760,159,252,160],"back-arc":[0,362,325,305],"back-rog":[333,362,105,235],"back-run":[446,362,121,215],"back-war":[575,362,244,265],"back-ran":[827,362,124,235],"back-mys":[0,675,145,260],"portrait-arc":[153,675,237,300]}};
async function loadAtlas(){
 const parts=await Promise.all([0,1,2,3].map(async n=>{const r=await fetch('art-v49-'+n+'.txt');if(!r.ok)throw new Error('画像データ '+n+' を読み込めません');return (await r.text()).trim()}));
 const b64=parts.join(''),raw=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
 if(crypto.subtle){const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)),v=>v.toString(16).padStart(2,'0')).join('');if(digest!=='a103407f8d0b7b3ac23f90fc88c8c9ba6d4d27318f6cc242d841438cfe43fa14')throw new Error('画像データが一致しません');}
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+M.width+'" height="'+M.height+'" viewBox="0 0 '+M.width+' '+M.height+'"><image width="'+M.width+'" height="'+M.height+'" href="data:image/avif;base64,'+b64+'"/></svg>';
 return URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
}
let ATLAS;
try{ATLAS=window.__INLINE_ATLAS__||await loadAtlas();window.__BATTLE_ATLAS__=ATLAS}catch(error){const b=document.getElementById('bootStatus');if(b)b.querySelector('p').textContent='画像を読み込めません。再読み込みしてください。';window.__bootError=String(error);console.error(error);return}

const $=id=>document.getElementById(id),scene=$('enemyStage'),bodies=new Map(),allyHuds=new Map(),enemyGrid=$('enemyGrid'),allyGrid=$('allyGrid');
let state=null;
let viewSequence=0;
function cut(c,cls=''){
 const id='view-cut-'+(++viewSequence);
 return '<svg class="'+cls+'" viewBox="'+c.join(' ')+'" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><defs><clipPath id="'+id+'"><rect x="'+c[0]+'" y="'+c[1]+'" width="'+c[2]+'" height="'+c[3]+'"/></clipPath></defs><image href="'+ATLAS+'" width="'+M.width+'" height="'+M.height+'" clip-path="url(#'+id+')"/></svg>';
}
$('environment').querySelector('.sky-art').innerHTML=cut(M.crops.sky,'scenery');

const BATTLE_GRID={
 enemy:{left:.055,top:.045,width:.89,height:.70,rows:['REAR','MID','FRONT']},
 ally:{left:.14,top:.52,width:.81,height:.42,rows:['FRONT','MID','REAR']}
};
function buildBattleGrid(container,side){
 if(!container||container.dataset.ready)return;
 container.dataset.ready='true';
 const rows=BATTLE_GRID[side].rows;
 rows.forEach((label,i)=>{
  const l=document.createElement('span');
  l.className='stage-rank-label r'+(i+1);
  l.textContent=label;
  container.append(l);
 });
 for(let i=0;i<9;i++){
  const c=document.createElement('span');
  c.className='stage-cell';
  c.dataset.index=String(i);
  container.append(c);
 }
}
function stageCell(side,row,col){
 const order=side==='enemy'
  ?{back:0,rear:0,mid:1,front:2}
  :{front:0,mid:1,rear:2};
 return (order[row]??0)*3+(col-1);
}
function paintBattleGrid(party,enemies,options){
 buildBattleGrid(enemyGrid,'enemy');
 buildBattleGrid(allyGrid,'ally');
 for(const g of [enemyGrid,allyGrid])g?.querySelectorAll('.stage-cell').forEach(x=>x.classList.remove('occupied','active-cell'));
 for(const u of enemies){
  if(!u.alive||u.hp<=0)continue;
  enemyGrid?.querySelectorAll('.stage-cell')[stageCell('enemy',u.row,(u.slot-1)%3+1)]?.classList.add('occupied');
 }
 for(const u of party){
  if(!u.alive||u.hp<=0)continue;
  const cell=allyGrid?.querySelectorAll('.stage-cell')[stageCell('ally',u.rank||u.row,u.gridCol||1)];
  cell?.classList.add('occupied');
  if(options.commandOpen&&options.actorId===u.id)cell?.classList.add('active-cell');
 }
}
function flashAllyHp(u,el,oldHp){
 if(!Number.isFinite(oldHp)||oldHp===u.hp)return;
 scene.querySelectorAll('[data-feedback-id="'+u.id+'"]').forEach(x=>x.remove());
 const delta=u.hp-oldHp;
 const kind=delta>0?'heal':'damage';
 const oldPct=u.maxHp?Math.max(0,Math.min(100,oldHp/u.maxHp*100)):0;
 const pct=u.maxHp?Math.max(0,Math.min(100,u.hp/u.maxHp*100)):0;
 const left=parseFloat(el.style.left)||0,top=parseFloat(el.style.top)||0,w=parseFloat(el.style.width)||0,h=parseFloat(el.style.height)||0;

 const number=document.createElement('div');
 number.className='ally-hit-number '+kind;
 number.dataset.feedbackId=u.id;
 number.textContent=(delta>0?'+':'−')+Math.abs(delta);
 number.style.left=Math.round(left+w/2)+'px';
 number.style.top=Math.round(top+h*.34)+'px';
 scene.append(number);

 const box=document.createElement('div');
 box.className='ally-hp-flash '+kind;
 box.dataset.feedbackId=u.id;
 box.innerHTML='<span class="ally-hp-flash-meta"><small>HP</small><b>'+u.hp+'</b></span><span class="ally-hp-flash-track"><i></i></span>';
 const fw=66;
 box.style.left=Math.max(4,Math.min(scene.clientWidth-fw-4,left+w/2-fw/2))+'px';
 box.style.top=Math.max(50,top-13)+'px';
 box.style.width=fw+'px';
 const fill=box.querySelector('i');
 fill.style.width=oldPct+'%';
 scene.append(box);
 requestAnimationFrame(()=>{
  number.classList.add('show');
  box.classList.add('show');
  requestAnimationFrame(()=>{fill.style.width=pct+'%'});
 });
 setTimeout(()=>{
  number.classList.remove('show');
  box.classList.remove('show');
  setTimeout(()=>{number.remove();box.remove()},220);
 },1050);
}
function geometry(){
 if(!state)return;const {party,enemies,options}=state;
 const w=scene.clientWidth,h=scene.clientHeight;
 const eg={x:w*BATTLE_GRID.enemy.left,y:h*BATTLE_GRID.enemy.top,w:w*BATTLE_GRID.enemy.width,h:h*BATTLE_GRID.enemy.height};
 const ag={x:w*BATTLE_GRID.ally.left,y:h*BATTLE_GRID.ally.top,w:w*BATTLE_GRID.ally.width,h:h*BATTLE_GRID.ally.height};
 for(const u of enemies){
  const el=scene.querySelector('[data-unit-id="'+u.id+'"]');if(!el)continue;
  const col=u.gridCol||((u.slot-1)%3+1),row=u.row,ri=({back:0,mid:1,front:2}[row]??2);
  const cx=eg.x+eg.w*((col-.5)/3);
  const feet=eg.y+eg.h*((ri+.88)/3);
  const eh=Math.min(h*.238,eg.h*.72);
  const ew=eg.w/3*.91;
  el.style.left=Math.round(cx-ew/2)+'px';
  el.style.top=Math.round(feet-eh)+'px';
  el.style.width=Math.round(ew)+'px';
  el.style.height=Math.round(eh)+'px';
  el.style.zIndex=String(({back:8,mid:11,front:14}[row]??14));el.dataset.rank=u.row;
 }
 for(const u of party){
  let el=bodies.get(u.id);
  if(!el){el=document.createElement('button');el.type='button';el.className='scene-ally';el.dataset.actorId=u.id;el.setAttribute('aria-label',u.name);el.innerHTML=cut(M.crops['back-'+u.id]);el.addEventListener('click',()=>document.querySelector('.ally-unit[data-unit-id="'+u.id+'"]')?.click());$('partyScene').append(el);bodies.set(u.id,el)}
  const r={front:0,mid:1,rear:2}[u.rank]??0,c=(u.gridCol||1)-1;
  const ratio=M.crops['back-'+u.id][2]/M.crops['back-'+u.id][3];
  const bh=Math.min(h*.155,ag.h*.66);
  const bw=bh*ratio;
  const cx=ag.x+ag.w*((c+.5)/3);
  const feet=ag.y+ag.h*((r+.86)/3);
  const nx=cx-bw/2,ny=feet-bh;const key=u.rank+':'+c;
  if(el.dataset.cell&&el.dataset.cell!==key&&options.busy){const dx=parseFloat(el.style.left)-nx,dy=parseFloat(el.style.top)-ny;if(Number.isFinite(dx)&&typeof el.animate==='function')el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:500,easing:'ease-in-out'})}
  el.style.left=Math.round(nx)+'px';el.style.top=Math.round(ny)+'px';el.style.width=Math.round(bw)+'px';el.style.height=Math.round(bh)+'px';el.style.zIndex=String(20+r*10+c);el.dataset.cell=key;
  el.classList.toggle('is-dead',!u.alive);el.classList.toggle('is-active',options.commandOpen&&options.actorId===u.id);
  el.classList.toggle('is-acting',options.busy&&options.activeTurnId===u.id);
  const previousHp=el.dataset.hp===''?NaN:Number(el.dataset.hp);
  if(Number.isFinite(previousHp)&&previousHp>u.hp){el.classList.remove('is-hit');void el.offsetWidth;el.classList.add('is-hit')}
  if(Number.isFinite(previousHp)&&previousHp!==u.hp)flashAllyHp(u,el,previousHp);
  el.dataset.hp=String(u.hp);

  let hud=allyHuds.get(u.id);
  if(!hud){
   hud=document.createElement('button');
   hud.type='button';
   hud.className='scene-ally-hud';
   hud.dataset.actorId=u.id;
   hud.innerHTML='<span class="scene-ally-name"></span><span class="scene-gauge scene-gauge-hp"><span class="scene-gauge-meta"><small>HP</small><b></b></span><span class="scene-gauge-track"><i></i></span></span><span class="scene-ally-sub"><span class="scene-gauge scene-gauge-sp"><span class="scene-gauge-meta"><small>SP</small><b></b></span><span class="scene-gauge-track"><i></i></span></span><span class="scene-gauge scene-gauge-mp"><span class="scene-gauge-meta"><small>MP</small><b></b></span><span class="scene-gauge-track"><i></i></span></span></span>';
   hud.addEventListener('click',()=>document.querySelector('.ally-unit[data-unit-id="'+u.id+'"]')?.click());
   $('partyScene').append(hud);
   allyHuds.set(u.id,hud);
  }
  const hudW=Math.min(88,ag.w/3*.82);
  hud.style.left=Math.round(cx-hudW/2)+'px';
  hud.style.top=Math.round(feet+2)+'px';
  hud.style.width=Math.round(hudW)+'px';
  hud.style.zIndex=String(18+r*10+c);
  hud.disabled=!u.alive;
  hud.classList.toggle('is-dead',!u.alive);
  hud.classList.toggle('is-active',options.commandOpen&&options.actorId===u.id);
  hud.classList.toggle('is-queued',!!u.queued);
  hud.querySelector('.scene-ally-name').textContent=u.name;
  const hpPct=u.maxHp?Math.max(0,Math.min(100,u.hp/u.maxHp*100)):0;
  const spPct=u.maxSp?Math.max(0,Math.min(100,u.sp/u.maxSp*100)):0;
  const mpPct=u.maxMp?Math.max(0,Math.min(100,u.mp/u.maxMp*100)):0;
  hud.querySelector('.scene-gauge-hp b').textContent=u.hp;
  hud.querySelector('.scene-gauge-hp i').style.width=hpPct+'%';
  hud.querySelector('.scene-gauge-sp b').textContent=u.sp;
  hud.querySelector('.scene-gauge-sp i').style.width=spPct+'%';
  hud.querySelector('.scene-gauge-mp b').textContent=u.mp;
  hud.querySelector('.scene-gauge-mp i').style.width=mpPct+'%';
 }
 paintBattleGrid(party,enemies,options);
 const selected=options.busy?options.displayActorId:options.actorId;
 $('actorArt').dataset.faceOnly=String(selected!=='arc');
}
window.SanctuaryView={sync(party,enemies,options){state={party,enemies,options};geometry();if(document.getElementById('formationSheet')?.open&&window.updateFormationBoard)window.updateFormationBoard()}};
new ResizeObserver(geometry).observe(scene);window.addEventListener('resize',geometry);window.visualViewport?.addEventListener('resize',geometry);
try{
/* UI v42 — stable lower formation, contextual commands and tightly framed enemy art.
 * Combat rules/data are retained from battle-v35.js. No third-party runtime is required. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),ASSETS={"gald-face":"sanctuary-art-v49.svg#face-war","lize-face":"sanctuary-art-v49.svg#face-rog","ern-face":"sanctuary-art-v49.svg#face-run","sena-face":"sanctuary-art-v49.svg#face-ran","mirea-face":"sanctuary-art-v49.svg#face-arc","yuna-face":"sanctuary-art-v49.svg#face-mys","enemy_guard-face":"sanctuary-art-v49.svg#knight","enemy_archer-face":"sanctuary-art-v49.svg#dragon","enemy_mage-face":"sanctuary-art-v49.svg#priest","gald":"sanctuary-art-v49.svg#face-war","lize":"sanctuary-art-v49.svg#face-rog","ern":"sanctuary-art-v49.svg#face-run","sena":"sanctuary-art-v49.svg#face-ran","mirea":"sanctuary-art-v49.svg#face-arc","yuna":"sanctuary-art-v49.svg#face-mys","enemy_guard":"sanctuary-art-v49.svg#knight","enemy_archer":"sanctuary-art-v49.svg#dragon","enemy_mage":"sanctuary-art-v49.svg#priest"};
const W={hammer:{name:'戦槌',attr:'壊',range:'near',power:22,hit:-5,speed:-5,weight:'heavy'},axe:{name:'戦斧',attr:'斬',range:'near',power:24,hit:-5,speed:-5,weight:'heavy'},dagger:{name:'短剣',attr:'斬',range:'near',power:11,hit:8,speed:8,weight:'light',normal:'SKL'},chakram:{name:'回刃',attr:'斬',range:'far',power:12,hit:5,speed:4,weight:'light',normal:'SKL'},sword:{name:'剣',attr:'斬',range:'near',power:17,hit:3,speed:0,weight:'normal'},spear:{name:'槍',attr:'突',range:'mid',power:18,hit:2,speed:0,weight:'normal'},bow:{name:'長弓',attr:'突',range:'far',power:16,hit:7,speed:1,weight:'normal',normal:'SKL'},staff:{name:'杖',attr:'壊',range:'near',power:8,hit:0,speed:0,weight:'light'},talisman:{name:'呪符',attr:'無',range:'near',power:6,hit:0,speed:0,weight:'light'}};
const ARM={heavy:{p:28,m:8},light:{p:15,m:11},magic:{p:7,m:20}};
const skill=(name,kind,costType,cost,mult,attr,range,stat,extra={})=>({name,kind,costType,cost,mult,attr,range,stat,target:'enemy',scope:'single',...extra});
const HT=[
{id:'war',name:'ガルド',style:'ウォーリアー',row:'front',rank:'front',gridCol:1,slot:1,PHY:55,SKL:25,ARC:10,MND:10,armor:'heavy',weapons:['hammer','axe'],skills:[skill('破砕撃','skill','SP',10,1.45,'壊','near','PHY',{speed:-2}),skill('震撃','skill','SP',15,1.2,'壊','near','PHY',{speed:-5,stun:45})]},
{id:'rog',name:'リゼ',style:'ローグ',row:'front',rank:'front',gridCol:2,slot:2,PHY:30,SKL:50,ARC:10,MND:10,armor:'light',weapons:['dagger','chakram'],skills:[skill('毒刃','skill','SP',8,1.15,'斬','near','SKL',{hit:8,speed:6,poison:60}),skill('急所突き','skill','SP',12,1.5,'斬','near','SKL',{hit:5,speed:3,critBonus:20})]},
{id:'run',name:'エルン',style:'ルーンフェンサー',row:'front',rank:'front',gridCol:3,slot:3,PHY:40,SKL:20,ARC:30,MND:10,armor:'light',weapons:['sword','spear'],skills:[skill('火炎剣','skill','MP',12,1.35,'火','near','MIX'),skill('貫穿','skill','SP',9,1.35,'突','mid','PHY',{hit:4})]},
{id:'ran',name:'セナ',style:'レンジャー',row:'back',rank:'mid',gridCol:2,slot:4,PHY:20,SKL:60,ARC:10,MND:10,armor:'light',weapons:['bow','spear'],skills:[skill('脚封じ射ち','skill','SP',10,1.05,'突','far','SKL',{hit:10,speed:2,legBind:65}),skill('狙撃','skill','SP',14,1.55,'突','far','SKL',{hit:12,speed:-3,critBonus:10})]},
{id:'arc',name:'ミレア',style:'アルカニスト',row:'back',rank:'rear',gridCol:1,slot:5,PHY:10,SKL:10,ARC:60,MND:20,armor:'magic',weapons:['staff','talisman'],skills:[skill('火球','spell','MP',14,1.45,'火','far','ARC',{hit:5,speed:0}),skill('大火炎','spell','MP',28,1.9,'火','far','ARC',{hit:0,speed:-10})]},
{id:'mys',name:'ユナ',style:'ミスティック',row:'back',rank:'rear',gridCol:3,slot:6,PHY:10,SKL:30,ARC:10,MND:50,armor:'magic',weapons:['talisman','staff'],skills:[skill('頭封じの符','spell','MP',12,.75,'無','far','MND',{hit:10,speed:5,headBind:70}),skill('治癒祈祷','spell','MP',16,0,'無','all','MND',{target:'ally',hit:100,speed:5,heal:true})]}
];
const ET=[
{id:'g1',name:'白銀騎士',style:'重装兵',row:'front',gridCol:1,slot:1,hp:155,PHY:42,SKL:20,ARC:10,MND:18,physDef:70,magDef:36,weak:{壊:2,火:1.2},resist:{斬:.5},weapon:{name:'大盾槍',attr:'突',range:'mid',power:20,hit:0,speed:-4,weight:'heavy'},ai:'guard'},
{id:'g2',name:'聖域の番兵',style:'重装兵',row:'front',gridCol:3,slot:2,hp:145,PHY:40,SKL:22,ARC:10,MND:18,physDef:66,magDef:36,weak:{壊:2},resist:{斬:.5},weapon:{name:'戦槌',attr:'壊',range:'near',power:21,hit:-3,speed:-5,weight:'heavy'},ai:'guard'},
{id:'g3',name:'月影の獣',style:'槍兵',row:'mid',gridCol:2,slot:3,hp:125,PHY:34,SKL:30,ARC:10,MND:16,physDef:52,magDef:32,weak:{斬:1.3,火:1.2},resist:{突:.5},weapon:{name:'長槍',attr:'突',range:'mid',power:18,hit:3,speed:0,weight:'normal'},ai:'guard'},
{id:'arch',name:'翼竜A',style:'弓兵',row:'back',gridCol:1,slot:4,hp:100,PHY:20,SKL:48,ARC:10,MND:15,physDef:35,magDef:35,weak:{斬:1.5},resist:{},weapon:{name:'弓',attr:'突',range:'far',power:15,hit:7,speed:2,weight:'normal'},ai:'archer'},
{id:'mage',name:'星詠み',style:'魔術師',row:'mid',gridCol:3,slot:5,hp:90,PHY:10,SKL:24,ARC:48,MND:24,physDef:24,magDef:58,weak:{斬:1.4,突:1.2},resist:{火:.5},spell:skill('火炎術','spell','MP',12,1.25,'火','far','ARC',{power:16,hit:5,speed:-2}),ai:'mage'},
{id:'arch2',name:'翼竜B',style:'弓兵',row:'back',gridCol:2,slot:6,hp:95,PHY:18,SKL:44,ARC:10,MND:16,physDef:32,magDef:36,weak:{斬:1.5,壊:1.2},resist:{},weapon:{name:'弓',attr:'突',range:'far',power:14,hit:6,speed:3,weight:'normal'},ai:'archer'}
];
const PORTRAITS={war:'gald',rog:'lize',run:'ern',ran:'sena',arc:'mirea',mys:'yuna',g1:'enemy_guard',g2:'enemy_guard',g3:'enemy_guard',arch:'enemy_archer',arch2:'enemy_archer',mage:'enemy_mage'};
const TERRAINS=[{name:'狭所',desc:'重量武器 命中−10・速度−5',wHit:w=>w?.weight==='heavy'?-10:0,wSpeed:w=>w?.weight==='heavy'?-5:0,ranged:1},{name:'高台',desc:'後列の遠距離武器 威力＋10%',wHit:()=>0,wSpeed:()=>0,ranged:1.1},{name:'茂み',desc:'遠距離武器 命中−10（術は除く）',wHit:w=>w?.range==='far'?-10:0,wSpeed:()=>0,ranged:1},{name:'開所',desc:'遠距離武器 威力＋10%',wHit:()=>0,wSpeed:()=>0,ranged:1.1}];
const STATUS=[['poison','猛毒','毒'],['stun','気絶','気絶'],['headBind','頭封じ','頭封'],['legBind','脚封じ','脚封']];
const RANKS=['front','mid','rear'],RANK_LABEL={front:'FRONT',mid:'MID',rear:'REAR'};
const live=list=>list.filter(u=>u.alive&&u.hp>0),col=u=>u.gridCol||((u.slot-1)%3+1),clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const rankIndex=u=>u.enemy?({front:0,mid:1,back:2}[u.row]??0):({front:0,mid:1,rear:2}[u.rank]??(u.row==='front'?0:2));
const rankParent=u=>u.rank==='front'?'pf':u.rank==='mid'?'pm':'pb';
const syncLegacyRow=u=>{if(!u.enemy)u.row=u.rank==='front'?'front':'back'};
const frontRank=side=>{const rs=live(side).map(rankIndex);return rs.length?Math.min(...rs):0};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=name=>ASSETS[name]||'assets/'+name+'.webp';
const image=u=>asset(PORTRAITS[u.id]);
const faceImage=u=>asset(PORTRAITS[u.id]+'-face');
const ATLAS=window.__BATTLE_ATLAS__;
// Visible artwork bounds in the existing 384×540 atlas. Crop the source viewport,
// not the whole lane: labels stay attached at every phone height and after swaps.
const CROPS={"guard":[0,159,178,190],"archer":[760,159,252,160],"mage":[407,159,127,195],"war":[825,0,51,35],"rog":[590,0,51,38],"run":[708,0,50,41],"ran":[766,0,51,40],"arc":[153,675,237,300],"mys":[649,0,51,41]};
const ACTOR_CROPS={
 war:M.crops['back-war'],rog:M.crops['back-rog'],run:M.crops['back-run'],
 ran:M.crops['back-ran'],arc:M.crops['portrait-arc'],mys:M.crops['back-mys']
};
const ACTOR_PORTRAITS={
 war:'images/gald-cinematic.svg',rog:'images/lize.svg',run:'images/ern.svg',
 ran:'images/sena.svg',arc:'images/mirea.svg',mys:'images/yuna.svg'
};
function enemyCrop(u){return u.id==='g3'?[542, 159, 210, 135]:CROPS[u.id==='mage'?'mage':['arch','arch2'].includes(u.id)?'archer':'guard']}
const ENEMY_CINEMATIC={};
const ORDER_PORTRAITS={"war":"data:image/webp;base64,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","rog":"data:image/webp;base64,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","run":"data:image/webp;base64,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","ran":"data:image/webp;base64,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","arc":"data:image/webp;base64,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","mys":"data:image/webp;base64,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","g1":"images/enemy_guard.svg","g2":"images/enemy_guard.svg","g3":"images/beast-cinematic.svg","arch":"images/enemy_flying.svg","arch2":"images/enemy_flying.svg","mage":"images/enemy_mage.svg"};
function enemyArtMarkup(u){
 const src=ENEMY_CINEMATIC[u.id];
 return src?'<img class="enemy-cinematic-art" src="'+src+'" alt="" draggable="false">':spriteMarkup(enemyCrop(u));
}
let cropSequence=0;
function clipped(c,cls='enemy-sprite'){
 const cid='cut-enemy-'+(++cropSequence);
 return '<svg class="'+cls+'" viewBox="'+c.join(' ')+'" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><defs><clipPath id="'+cid+'"><rect x="'+c[0]+'" y="'+c[1]+'" width="'+c[2]+'" height="'+c[3]+'"/></clipPath></defs><image href="'+ATLAS+'" width="1024" height="975" clip-path="url(#'+cid+')"/></svg>';
}
function spriteMarkup(c){return clipped(c)}
const FACE_CROPS={"war": [825, 0, 51, 35], "rog": [590, 0, 51, 38], "run": [708, 0, 50, 41], "ran": [766, 0, 51, 40], "arc": [529, 0, 53, 48], "mys": [649, 0, 51, 41], "g1": [0, 159, 178, 190], "g2": [0, 159, 178, 190], "g3": [542, 159, 210, 135], "arch": [760, 159, 252, 160], "arch2": [760, 159, 252, 160], "mage": [407, 159, 127, 195]};
function faceMarkup(u,cls='face-graphic'){
 const src=ORDER_PORTRAITS[u.id];
 return src?'<img class="'+cls+' order-portrait-art" src="'+src+'" alt="" draggable="false">':clipped(FACE_CROPS[u.id]||CROPS.guard,cls)
}

function fitScene(){
 const stage=$('enemyStage');if(!stage)return;
 const h=Math.max(65,Math.min(200,(stage.clientHeight-12)/2-30,stage.clientWidth/3*1.0));
 stage.style.setProperty('--figure-h',h.toFixed(2)+'px');
}
let displayActorId=null,activeTurnId=null,turnSequence=[],commandOpen=false;
const icon=n=>'<svg class="icon" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const rangeName=r=>({near:'近距離',mid:'中距離',far:'遠距離',all:'全域'}[r]||r);
const scopeName=s=>({single:'単体',row:'1列',all:'全体',random:'ランダム複数',pierce:'前後貫通',adjacent:'隣接'}[s.scope||'single']);
const skillIcon=a=>a.heal?'heart':a.attr==='火'?'fire':a.kind==='spell'?'scroll':a.range==='far'?'bow':a.attr==='壊'?'hammer':'sword';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let party=[],enemies=[],terrain=TERRAINS[0],round=1,idx=0,phase='command',busy=false,over=false;
let session=0,paused=false,skip=false,paceIndex=0,logCount=0,noticeTimer=0,targetMode=null;
const paceOptions=[{name:'ゆっくり',scale:1},{name:'標準',scale:.72},{name:'早送り',scale:.4}];
try{paceIndex=clamp(Number(localStorage.getItem('rpg.pace.v31'))||0,0,2)}catch(_){}
const nodes=new Map(),drafts=new Map(),replacementUsed={party:new Set(),enemies:new Set()},activeAnimations=new Set();
const CANCEL=Symbol('cancelled battle');
function check(token){if(token!==session)throw CANCEL}
function derived(P,S,A,M){const T=P+S+A+M,p=Math.max(0,P-10),s=Math.max(0,S-10),x=Math.max(0,A+M-20);return{hp:Math.floor(100+.5*(T-100)+2*p+Math.max(0,p-20)),sp:Math.floor(20+.1*(T-100)+.4*p+s),mp:Math.floor(x<=50?2*x:100+.5*(x-50))}}
function initUnit(source,enemy=false){const o=JSON.parse(JSON.stringify(source)),d=derived(o.PHY,o.SKL,o.ARC,o.MND),ar=ARM[o.armor];return{...o,enemy,maxHp:enemy?o.hp:d.hp,hp:enemy?o.hp:d.hp,maxSp:d.sp,sp:d.sp,maxMp:d.mp,mp:d.mp,physDef:enemy?o.physDef:o.PHY+ar.p,magDef:enemy?o.magDef:o.ARC+o.MND+ar.m,wi:0,weapon:enemy?o.weapon:W[o.weapons[0]],alive:true,defending:false,status:{},queued:null}}
function current(){return party[idx]}
function normal(u){return{name:'通常攻撃',kind:'attack',range:u.weapon?.range||'near',attr:u.weapon?.attr||'壊',target:'enemy',scope:'single',mult:1,hit:0,speed:0}}
function getDraft(u){if(!drafts.has(u.id))drafts.set(u.id,{key:'attack',targetId:null});return drafts.get(u.id)}
function actionFor(u,key=getDraft(u).key){return key==='attack'?normal(u):u.skills[Number(key)]||normal(u)}
function canReach(a,t,r){
 if(!t?.alive||t.hp<=0)return false;
 if(r==='far'||r==='all')return true;
 const side=t.enemy?enemies:party,ar=rankIndex(a),tr=rankIndex(t),fr=frontRank(side);
 if(r==='near')return ar===0&&tr===fr;
 if(r==='mid')return(ar<=1&&tr===fr)||(ar===0&&tr<=fr+1);
 return false;
}
function targets(u,a){return a.target==='ally'?live(party):live(enemies).filter(t=>canReach(u,t,a.range))}
function enough(u,a){return !a.costType||u[a.costType.toLowerCase()]>=a.cost}
function unavailable(u,a){if(a.kind==='spell'&&u.status.headBind>0)return'頭封じ';if(!enough(u,a))return a.costType+'不足';if(!targets(u,a).length)return'射程内に対象なし';return''}
function defaultTarget(u,a){const ts=targets(u,a),old=ts.find(t=>t.id===getDraft(u).targetId);if(old)return old;if(a.heal)return [...ts].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];return [...ts].sort((x,y)=>rankIndex(x)-rankIndex(y)||col(x)-col(y))[0]}
function ensureTarget(u,a){const t=defaultTarget(u,a);getDraft(u).targetId=t?.id||null;return targets(u,a)}
function editable(){return !busy&&!over}
function notify(text){clearTimeout(noticeTimer);$('notice').textContent=text;$('notice').hidden=false;noticeTimer=setTimeout(()=>$('notice').hidden=true,2300)}
function log(text,cls=''){const el=document.createElement('div');el.textContent=text;el.className=cls;const box=$('log'),atEnd=box.scrollTop+box.clientHeight>=box.scrollHeight-24;box.append(el);$('logCount').textContent=++logCount;$('lastLog').textContent=text;$('lastLog').className='last-log '+cls;if(atEnd)box.scrollTop=box.scrollHeight}
function createCard(u){
 const el=document.createElement('button');
 el.type='button';el.className='unit '+(u.enemy?'enemy-unit':'ally-unit');
 el.dataset.unitId=u.id;el.dataset.style=u.style;el.dataset.col=col(u);el.style.gridColumn=u.enemy?'auto':String(party.findIndex(x=>x.id===u.id)+1);
 if(u.enemy){
  el.innerHTML='<span class="enemy-name">'+esc(u.name)+'</span><span class="enemy-hp" data-resource="hp"><span class="bar"><i></i></span><b></b></span><span class="enemy-visual">'+enemyArtMarkup(u)+'<span class="target-pointer" aria-hidden="true"></span></span><span class="card-status"></span>';
 }else{
  el.innerHTML='<span class="ally-face-wrap">'+faceMarkup(u,'ally-face')+'<span class="rank-badge">'+RANK_LABEL[u.rank][0]+'</span></span><span class="card-name"><span class="slot-mark" aria-hidden="true">'+u.slot+'</span>'+esc(u.name)+'</span><span class="card-status"></span><span class="queued-mark" hidden>✓</span><span class="resource-list">'+['hp','sp','mp'].map(k=>'<span class="resource" data-resource="'+k+'"><span class="resource-value"><span>'+k.toUpperCase()+'</span><b></b></span><span class="bar '+(k==='hp'?'':k)+'"><i></i></span></span>').join('')+'</span>';
 }
 el.querySelector('img')?.addEventListener('error',ev=>{ev.target.style.opacity='0'});
 el.addEventListener('click',()=>cardTap(u.id));nodes.set(u.id,el);return el;
}
function queuedText(u){return u.queued?.type==='skill'?u.queued.action.name:({attack:'通常攻撃',defend:'防御',swap:'交代',move:'移動',escape:'逃走'}[u.queued?.type]||'')}
function renderCards(){
 const paint=(u,parent)=>{
  const el=nodes.get(u.id)||createCard(u);
  if(el.parentNode!==parent)parent.append(el);
  if(u.enemy){el.style.gridColumn='auto';el.style.gridRow='1'}else{el.style.gridColumn=String(col(u));el.style.gridRow=String(({front:1,mid:2,rear:3}[u.rank]||1))}el.dataset.col=col(u);el.dataset.rank=u.enemy?u.row:u.rank;
  const slotMark=el.querySelector('.slot-mark');if(slotMark)slotMark.textContent=u.slot;const rankBadge=el.querySelector('.rank-badge');if(rankBadge&&!u.enemy)rankBadge.textContent=RANK_LABEL[u.rank][0]+col(u);
  el.classList.toggle('dead',!u.alive);
  el.classList.toggle('active',editable()&&commandOpen&&!u.enemy&&u.id===current()?.id);
  const mark=el.querySelector('.queued-mark');
  if(mark){mark.hidden=busy||over||!u.queued;mark.title='入力済み：'+queuedText(u);mark.classList.toggle('has-status',STATUS.some(([k])=>u.status[k]>0))}
  el.querySelector('.card-status').innerHTML=!u.alive?'<span class="status-chip">戦闘不能</span>':STATUS.filter(([k])=>u.status[k]>0).map(([k,n,s])=>'<span class="status-chip" title="'+n+' '+u.status[k]+'ターン">'+s+'</span>').join('');
  el.querySelectorAll('[data-resource]').forEach(box=>{const k=box.dataset.resource,m=u['max'+k[0].toUpperCase()+k.slice(1)],v=Math.max(0,u[k]);box.querySelector('b').textContent=v;const fill=box.querySelector('i'),pct=m?clamp(v/m*100,0,100):0,old=Number(fill.dataset.pct);if(Number.isFinite(old)&&Math.abs(old-pct)>.01&&typeof fill.animate==='function'){fill.getAnimations().forEach(x=>x.cancel());fill.animate([{width:old+'%'},{width:pct+'%'}],{duration:pct<old?720:480,easing:'cubic-bezier(.22,.72,.2,1)'});}fill.dataset.pct=String(pct);fill.style.width=pct+'%'});
  const where=u.enemy?({front:'前列',mid:'中列',back:'後列'}[u.row]||'前列'):RANK_LABEL[u.rank]+' '+col(u);
  el.setAttribute('aria-label',u.name+'、'+where+'、HP '+u.hp+(u.queued?'、入力済み：'+queuedText(u):''));
 };
 for(const u of [...enemies].sort((a,b)=>a.slot-b.slot))paint(u,$(u.row==='back'?'eb':'ef'));
 for(const u of [...party].sort((a,b)=>a.slot-b.slot))paint(u,$('partyStrip'));
 highlightTargets();
}
function highlightTargets(){const u=current(),a=u?actionFor(u):null,ts=editable()&&commandOpen&&a?ensureTarget(u,a):[],valid=new Set(ts.map(t=>t.id)),chosen=u?getDraft(u).targetId:null;nodes.forEach((el,id)=>{el.classList.toggle('target-valid',valid.has(id));el.classList.toggle('target-selected',valid.has(id)&&id===chosen);el.classList.toggle('target-unavailable',editable()&&commandOpen&&!valid.has(id)&&((a?.target==='ally'&&el.classList.contains('ally-unit'))||(a?.target!=='ally'&&el.classList.contains('enemy-unit'))));el.setAttribute('aria-pressed',String(valid.has(id)&&id===chosen))});const eg=$('enemyGrid'),ag=$('allyGrid'),enemyCells=[...(eg?.querySelectorAll('.stage-cell')||[])],allyCells=[...(ag?.querySelectorAll('.stage-cell')||[])];for(const g of [eg,ag])g?.classList.remove('targeting-board');for(const c of [...enemyCells,...allyCells]){c.classList.remove('target-zone','target-selected-zone','target-muted');c.removeAttribute('data-target-id');c.onclick=null}if(!targetMode||!u||!a)return;const grid=a.target==='ally'?ag:eg,cells=a.target==='ally'?allyCells:enemyCells;grid?.classList.add('targeting-board');for(const c of cells)c.classList.add('target-muted');for(const t of ts){let ri,ci;if(t.enemy){ri=t.row==='front'?2:t.row==='back'?0:1;ci=col(t)-1}else{ri=({front:0,mid:1,rear:2}[t.rank]??0);ci=col(t)-1}const c=cells[ri*3+ci];if(!c)continue;c.classList.remove('target-muted');c.classList.add('target-zone');if(t.id===chosen)c.classList.add('target-selected-zone');c.dataset.targetId=t.id;c.onclick=()=>cardTap(t.id)}}
function renderOrder(){
 const all=[...party,...enemies];
 let shown;
 if(busy&&turnSequence.length){
  const ordered=turnSequence.map(id=>all.find(u=>u.id===id)).filter(u=>u&&u.alive);
  const activeIndex=Math.max(0,ordered.findIndex(u=>u.id===activeTurnId));
  shown=[...ordered.slice(activeIndex),...ordered.slice(0,activeIndex)];
 }else{
  shown=[...live(party),...live(enemies)].sort((a,b)=>{const qb=b.queued||(!b.enemy&&commandOpen&&b.id===current()?.id?{action:actionFor(b)}:null),qa=a.queued||(!a.enemy&&commandOpen&&a.id===current()?.id?{action:actionFor(a)}:null);return speed(b,qb)-speed(a,qa)});
 }
 shown=shown.slice(0,5);
 const target=$('turnOrder');target.replaceChildren();
 target.style.setProperty('--order-count',Math.max(1,shown.length));
 for(const [orderIndex,u] of shown.entries()){
  const b=document.createElement('button');b.type='button';
  const isActive=(busy?u.id===activeTurnId:(commandOpen&&u.id===current()?.id));const isNext=busy?orderIndex===1:orderIndex===0;b.className='order-face'+(u.enemy?' foe':' ally')+(isActive?' is-active':'')+(isNext?' is-next':'');b.dataset.orderIndex=String(orderIndex);
  b.setAttribute('aria-label',u.name+(u.enemy?'、敵':'、味方'));
  b.title=(u.enemy?'敵：':'味方：')+u.name;b.dataset.actorId=u.id;
  b.innerHTML=faceMarkup(u,'order-portrait')+'<span class="order-side" aria-hidden="true"></span>';
  b.addEventListener('click',()=>u.enemy?cardTap(u.id):toggleActor(u.id));target.append(b);
 }
 if(busy){
  requestAnimationFrame(()=>{
   const active=target.querySelector('.is-active');
   if(!active)return;
   const left=active.offsetLeft-(target.clientWidth-active.offsetWidth)/2;
   target.scrollTo({left:Math.max(0,left),behavior:'smooth'});
  });
 }
}
function updatePortrait(){
 const who=busy?[...party,...enemies].find(u=>u.id===displayActorId):over?null:current();
 const show=!!who&&!who.enemy&&(busy||commandOpen);
 const box=$('actorArt');
 box.classList.toggle('dim',!show);
 $('commandPanel').classList.toggle('enemy-action',busy&&!show);
 if(show){
  if(box.dataset.actorId!==who.id){
   box.dataset.actorId=who.id;
   if(who.id==='war'){
    const art=document.createElement('img');art.className='actor-portrait-image';art.alt='';art.decoding='async';art.src='images/gald-cinematic.svg';box.replaceChildren(art);
   }else{
    box.innerHTML=cut(ACTOR_CROPS[who.id]||M.crops['back-'+who.id],'actor-portrait-svg');
   }
   box.classList.remove('is-entering');void box.offsetWidth;box.classList.add('is-entering');
  }
 }
 $('actorName').textContent=over?'':who?.name||'';
}
function render(){
 if(editable()&&phase==='command'&&!busy){const cur=current();if(!cur?.alive||cur.queued){const auto=fastestPendingIndex();if(auto>=0){idx=auto;commandOpen=true}}}
 renderCards();renderOrder();updatePortrait();
 if(window.SanctuaryView)window.SanctuaryView.sync(party,enemies,{busy,over,commandOpen,displayActorId,activeTurnId,actorId:current()?.id});
 const readyOnly=editable()&&!commandOpen&&phase==='ready';
 $('commandPanel').classList.toggle('command-open',editable()&&commandOpen);
 $('commandPanel').classList.toggle('command-closed',editable()&&!commandOpen&&!readyOnly);
 $('commandPanel').classList.toggle('ready-only',readyOnly);
 $('commandPanel').hidden=!(busy||editable()&&(commandOpen||readyOnly));
 $('game').dataset.dock=busy?'playback':commandOpen&&!over?'open':'closed';
 fitScene();
 $('round').textContent=String(round).padStart(2,'0');
 const count=live(party).filter(u=>u.queued).length,total=live(party).length;
 $('queueCount').textContent=count+'/'+total;
 $('actor').disabled=!editable();$('auto').disabled=!editable();
 $('resolve').disabled=!editable()||count!==total||!total;
 const ready=editable()&&count===total&&total>0;
 $('resolve').hidden=!ready;$('terrainButton').hidden=ready;
 $('game').classList.toggle('round-ready',ready);
 for(const u of party){const el=nodes.get(u.id);if(el){el.setAttribute('aria-expanded',String(commandOpen&&current()?.id===u.id&&!busy));el.setAttribute('aria-controls','commandPanel')}}
 for(const id of ['attack','skills','swap','defend','switch'])$(id).disabled=!editable();
 $('more').disabled=false;
 $('terrainEffect').textContent=terrain.name;
 $('terrainButton').title=terrain.desc;
 $('pace').textContent=['1×','1.4×','2.5×'][paceIndex];
 $('pace').title=paceOptions[paceIndex].name;
 $('pace').setAttribute('aria-label','再生速度：'+paceOptions[paceIndex].name+'。押すと変更');
 $('pause').innerHTML=icon(paused?'play':'pause');
 $('pause').setAttribute('aria-label',paused?'再開':'一時停止');
 $('pause').setAttribute('aria-pressed',String(paused));
 $('cancelTarget').hidden=!targetMode;
 $('commandPanel').classList.toggle('targeting',!!targetMode);
 if(!editable())return;
 const u=current(),a=actionFor(u);ensureTarget(u,a);const t=defaultTarget(u,a);
 const n=normal(u),reason=unavailable(u,n);
 $('attack').disabled=!!reason;
 $('attack').title=reason||u.weapon.name+'で通常攻撃';
 $('attack').querySelector('use').setAttribute('href','#i-'+skillIcon(n));
 $('swap').disabled=u.status.legBind>0;
 $('switch').title=u.weapon.name+' → '+W[u.weapons[u.wi?0:1]].name;
 $('targetHint').innerHTML=targetMode?esc(a.name)+' →':t?esc(a.kind==='attack'?u.weapon.name:a.name)+' → '+esc(t.name)+(a.heal?'':affinity(t,a.attr)>1?' <strong>✧</strong>':''):'―';
 highlightTargets();
}
function cancelTarget(){if(targetMode){const u=party.find(u=>u.id===targetMode.actorId);if(u)drafts.set(u.id,{...targetMode.previous});targetMode=null;render()}}
function cardTap(id){if(!editable())return;const t=[...party,...enemies].find(u=>u.id===id);if(!t?.alive)return;const u=current(),a=actionFor(u);
 if(targetMode){if(!targets(u,a).some(x=>x.id===id)){notify('このスキルの対象にはできません');return}getDraft(u).targetId=id;targetMode=null;closeSheet();queue();return}
 if(t.enemy){if(!commandOpen)return;if(!targets(u,a).some(x=>x.id===id)){notify('この行動は届きません。遠距離スキルや換装を選択。');return}getDraft(u).targetId=id;if(u.queued&&['attack','skill'].includes(u.queued.type)&&u.queued.action?.target!=='ally')u.queued.targetId=id;render();return}toggleActor(id)}
function fastestPendingIndex(){
 const pending=party.map((u,i)=>({u,i})).filter(x=>x.u.alive&&!x.u.queued);
 if(!pending.length)return-1;
 pending.sort((a,b)=>speed(b.u,{action:actionFor(b.u)})-speed(a.u,{action:actionFor(a.u)})||a.i-b.i);
 return pending[0].i;
}
function closeCommands(){
 if(!editable())return;
 if(targetMode){const u=party.find(u=>u.id===targetMode.actorId);if(u)drafts.set(u.id,{...targetMode.previous});targetMode=null}
 closeSheet();const next=fastestPendingIndex();
 if(next>=0){idx=next;phase='command';commandOpen=true}else commandOpen=false;
 render();
}
function toggleActor(id){
 if(!editable())return;
 if(commandOpen&&current()?.id===id){closeCommands();return}
 selectActor(id);
}
function selectActor(id){const i=party.findIndex(u=>u.id===id&&u.alive);if(i<0||!editable())return;cancelTarget();idx=i;commandOpen=true;render()}
function advance(){targetMode=null;const next=fastestPendingIndex();if(next>=0){idx=next;phase='command';commandOpen=true;render();return}phase='ready';commandOpen=false;render();setTimeout(()=>{if(editable()&&live(party).length&&live(party).every(u=>u.queued))resolve()},0)}
function queue(){if(!editable())return;const u=current(),a=actionFor(u),reason=unavailable(u,a);if(reason){notify(reason);return}ensureTarget(u,a);u.defending=false;u.queued={type:a.kind==='attack'?'attack':'skill',action:a,targetId:getDraft(u).targetId};advance()}
function attack(){if(!editable())return;cancelTarget();getDraft(current()).key='attack';ensureTarget(current(),normal(current()));queue()}
function simpleCommand(type){if(!editable())return;cancelTarget();const u=current();if(type==='escape'&&u.status.legBind>0){notify('脚封じで行動できません');return}u.defending=type==='defend';u.queued={type};advance()}
function queueMove(rank,gridCol){
 if(!editable())return;
 const u=current();
 if(u.status.legBind>0){notify('脚封じで移動できません');return}
 if(u.rank===rank&&col(u)===gridCol){closeSheet();return}
 const other=live(party).find(x=>x.id!==u.id&&x.rank===rank&&col(x)===gridCol);
 u.defending=false;
 u.queued={type:'move',rank,gridCol,swapId:other?.id||null};
 closeSheet();advance();
}
const sheet=$('choiceSheet');
function closeSheet(){if(sheet.open)sheet.close()}
function effectText(a){const out=[];if(a.heal)out.push('HP回復');else out.push('威力 ×'+a.mult);for(const[k,n]of STATUS)if(a[k])out.push(n+' 基礎'+a[k]+'%');if(a.critBonus)out.push('会心率＋'+a.critBonus);return out.join(' / ')}
function chooseSkill(key,chooseTarget=false){if(!editable())return;const u=current(),a=actionFor(u,key),reason=unavailable(u,a);if(reason){notify(reason);return}const previous=targetMode?.actorId===u.id?targetMode.previous:{...getDraft(u)};getDraft(u).key=key;ensureTarget(u,a);targetMode={actorId:u.id,key,previous};if(a.target==='ally'){closeSheet();render();return}document.querySelectorAll('.skill-choice').forEach(b=>b.classList.toggle('is-preview',b.dataset.action===key));render()}
function openSheet(mode='skills'){sheet.dataset.mode=mode;
 if(!editable()&&!['more','terrain','history'].includes(mode))return;
 if(editable())cancelTarget();
 const u=current();
 $('sheetKicker').textContent=['skills','formation'].includes(mode)?u.name:'';
 $('sheetTitle').textContent={skills:'技',formation:'FORMATION',members:'仲間',more:'',terrain:terrain.name,history:'履歴'}[mode]||'';
 $('sheetHint').textContent='';const list=$('sheetList');list.replaceChildren();
 if(mode==='formation'){
  $('sheetHint').textContent='SHIFT · 1 ACTION';
  const editor=document.createElement('div');editor.className='formation-editor';
  for(const rank of RANKS){
   const line=document.createElement('div');line.className='formation-line';line.dataset.rank=rank;
   const tag=document.createElement('span');tag.className='formation-label';tag.textContent=RANK_LABEL[rank];line.append(tag);
   const cells=document.createElement('div');cells.className='formation-cells';
   for(let c=1;c<=3;c++){
    const occ=party.find(x=>x.alive&&x.rank===rank&&col(x)===c);
    const b=document.createElement('button');b.type='button';b.className='formation-cell'+(occ?' occupied':' empty')+(occ?.id===u.id?' current':'');
    b.setAttribute('aria-label',RANK_LABEL[rank]+' '+c+(occ?' '+occ.name:' 空き'));
    b.innerHTML=occ?faceMarkup(occ)+'<span>'+esc(occ.name)+'</span>':'<span class="formation-plus">＋</span>';
    if(u.status.legBind>0)b.disabled=true;
    b.addEventListener('click',()=>queueMove(rank,c));cells.append(b);
   }
   line.append(cells);editor.append(line);
  }
  list.append(editor);
 }else if(mode==='members'){
  for(const m of party){
   const b=document.createElement('button');b.type='button';b.className='member-option';b.disabled=!m.alive;
   b.innerHTML=faceMarkup(m)+'<span>'+esc(m.name)+'</span><em>'+(!m.alive?'戦闘不能':m.queued?esc(queuedText(m)):'')+'</em>';
   b.addEventListener('click',()=>{closeSheet();selectActor(m.id)});list.append(b);
  }
 }else if(mode==='terrain'){
  const p=document.createElement('p');p.className='terrain-detail';p.textContent=terrain.desc;list.append(p);
 }else if(mode==='more'){
  const entries=[['restart','新しい戦闘',()=>fresh(),false],['book','履歴',()=>{closeSheet();toggleHistory()},false],['exit','逃走',()=>{closeSheet();simpleCommand('escape')},!editable()||u?.status.legBind>0]];
  for(const [ic,label,fn,disabled]of entries){const b=document.createElement('button');b.type='button';b.className='menu-action';b.innerHTML=icon(ic)+esc(label);b.disabled=disabled;b.addEventListener('click',fn);list.append(b)}
 }else{
  for(const[key,a]of u.skills.map((s,i)=>[String(i),s])){
   const reason=unavailable(u,a),t=defaultTarget(u,a),item=document.createElement('div');item.className='skill-item';
   item.style.setProperty('--skill-color',a.heal?'#b5d3b8':a.attr==='火'?'#d9ac92':a.kind==='spell'?'#c7bde0':'#d8c396');
   const b=document.createElement('button');b.type='button';b.className='skill-choice';b.dataset.action=key;b.setAttribute('aria-disabled',String(!!reason));
   b.innerHTML=icon(skillIcon(a))+'<span class="skill-line"><b>'+esc(a.name)+'</b><small>'+scopeName(a)+' · '+rangeName(a.range)+' · '+esc(a.attr)+' · '+esc(reason||effectText(a))+'</small></span><span class="cost">'+a.costType+' '+a.cost+'</span>';
   b.addEventListener('click',()=>chooseSkill(key));item.append(b);
   const f=document.createElement('div');f.className='skill-target';f.innerHTML='<span>→ '+esc(t?t.name:'―')+'</span>';
   const change=document.createElement('button');change.type='button';change.textContent='対象変更';change.disabled=!!reason;
   change.setAttribute('aria-label',a.name+'の対象変更');change.addEventListener('click',()=>chooseSkill(key,true));f.append(change);item.append(f);list.append(item);
  }
 }
 if(!sheet.open)(mode==='skills'?sheet.show():sheet.showModal());
}
function toggleHistory(){const h=$('history');h.open=!h.open;$('historyButton').setAttribute('aria-expanded',String(h.open))}
/* Animation, timers, and resets share a session token. */
async function waitRead(text,token,min=1100){skip=false;let remaining=Math.min(3200,Math.max(min,680+[...text].length*42))*paceOptions[paceIndex].scale,last=performance.now();while(remaining>0){check(token);await new Promise(r=>setTimeout(r,35));check(token);const now=performance.now();if(skip)break;if(!paused){remaining-=now-last}last=now}skip=false}
function clearEffects(){nodes.forEach(el=>el.classList.remove('battle-acting','battle-hit','battle-heal','battle-switch'));document.querySelectorAll('.floating').forEach(el=>el.remove())}
function floating(id,value,kind='damage',label=''){const el=nodes.get(id);if(!el)return;const f=document.createElement('span');f.className='floating'+(kind==='heal'?' heal':'');f.innerHTML=(label?'<small>'+esc(label)+'</small>':'')+esc((kind==='heal'?'+':'−')+value);el.append(f);setTimeout(()=>f.remove(),1250)}
async function say(text,token,cls='',visual=null,history=true){check(token);clearEffects();$('battleMessage').className='battle-message '+cls;$('battleMessageText').textContent=text;if(history)log(text,cls);if(visual?.actorId)nodes.get(visual.actorId)?.classList.add('battle-acting');if(visual?.targetId){nodes.get(visual.targetId)?.classList.add(visual.heal?'battle-heal':'battle-hit');if(visual.value!==undefined)floating(visual.targetId,visual.value,visual.heal?'heal':'damage',visual.label||'')}await waitRead(text,token)}
function setBattle(on){$('commandPanel').classList.toggle('resolving',on);$('commandInput').hidden=on;$('battleMessage').hidden=!on;if(!on){$('battleMessageText').textContent='';clearEffects()}}
async function animateSwap(a,b,text,token){check(token);clearEffects();displayActorId=(b.alive&&!b.enemy?b.id:!a.enemy?a.id:null);activeTurnId=displayActorId;updatePortrait();const before=new Map([a,b].map(u=>[u.id,nodes.get(u.id).getBoundingClientRect()]));const row=a.row,slot=a.slot;a.row=b.row;a.slot=b.slot;b.row=row;b.slot=slot;render();$('battleMessage').className='battle-message sys';$('battleMessageText').textContent=text;log(text,'sys');const animations=[];for(const[u,i]of [[a,0],[b,1]]){const el=nodes.get(u.id),from=before.get(u.id),to=el.getBoundingClientRect(),dx=from.left-to.left,dy=from.top-to.top,w=i?3:-3;el.classList.add('moving');el.style.transformOrigin='top left';const sx=from.width/to.width,sy=from.height/to.height;const frames=[{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,offset:0},{transform:`translate(${dx*.72+w}px,${dy*.72}px) rotate(${i?.7:-.7}deg)`,offset:.28},{transform:`translate(${dx*.4-w}px,${dy*.4}px) rotate(${i?-.7:.7}deg)`,offset:.6},{transform:'translate(0,0) rotate(0deg)',offset:1}];if(typeof el.animate==='function'){const anim=el.animate(reduced?[{opacity:.7},{opacity:1}]:frames,{duration:reduced?100:1100*paceOptions[paceIndex].scale,easing:'linear',fill:'both'});activeAnimations.add(anim);animations.push(anim.finished.catch(()=>{}).then(()=>{anim.cancel();activeAnimations.delete(anim);el.classList.remove('moving');el.style.transformOrigin=''}))}else el.classList.remove('moving')}await Promise.all(animations);check(token);await waitRead(text,token,350)}
async function switchWeapon(){if(!editable())return;cancelTarget();const token=session,u=current();displayActorId=u.id;activeTurnId=u.id;busy=true;closeSheet();setBattle(true);u.wi=u.wi?0:1;u.weapon=W[u.weapons[u.wi]];render();nodes.get(u.id)?.classList.add('battle-switch');$('playbackTitle').textContent='換装';$('battleMessageText').textContent=u.name+'は'+u.weapon.name+'へ換装！';try{await waitRead($('battleMessageText').textContent,token,850)}catch(e){if(e!==CANCEL)throw e}finally{if(token===session){busy=false;setBattle(false);render()}}}
function affinity(t,attr){return t.weak?.[attr]??t.resist?.[attr]??1}
function hit(a,t,act){if(t.status.legBind>0)return 100;return clamp(90+(a.SKL-t.SKL)*.5+(act.hit||0)+(act.kind==='spell'?0:(a.weapon?.hit||0)+terrain.wHit(a.weapon)),30,100)}
function attackValue(a,act){if(act.kind==='attack')return(a.weapon?.power||0)+(a.weapon?.normal==='SKL'?a.SKL:a.PHY);if(act.stat==='ARC')return 14+a.ARC;if(act.stat==='MND')return 12+a.MND;if(act.stat==='SKL')return(a.weapon?.power||0)+a.SKL;if(act.stat==='MIX')return(a.weapon?.power||0)+.5*a.PHY+.5*a.ARC;return(a.weapon?.power||0)+a.PHY}
function damage(a,t,act){const magic=act.kind==='spell'||['ARC','MND'].includes(act.stat),def=magic?t.magDef:t.physDef,crit=Math.random()*100<clamp(5+(a.SKL-t.SKL)/4+(act.critBonus||0),0,50),aff=affinity(t,act.attr);let terrainMult=1;if(act.kind==='attack'&&a.weapon?.range==='far'&&(terrain.name!=='高台'||a.row==='back'))terrainMult=terrain.ranged;const value=Math.floor(attackValue(a,act)*(act.mult??1)*100/(100+def)*aff*(crit?1.5:1)*terrainMult*(.95+Math.random()*.1)*(t.defending?.5:1));return{value:aff===0?0:Math.max(1,value),crit,weak:aff>1}}
function speed(u,q){if(u.status.legBind>0)return-999;if(u.enemy)return u.SKL+(u.spell?.speed||0);const a=q?.action||normal(u);return u.SKL+(a.speed||0)+(a.kind==='spell'?0:(u.weapon?.speed||0)+terrain.wSpeed(u.weapon))}
async function defeated(u,token){
 if(u.hp>0||!u.alive)return;
 u.hp=0;u.alive=false;render();await say(u.name+'は戦闘不能。',token,'sys');
 if(!u.enemy)return;
 const c=col(u),used=replacementUsed.enemies;
 if(u.row!=='front'||used.has(c))return;
 used.add(c);const reserve=live(enemies).find(x=>x.row==='back'&&col(x)===c);
 if(reserve)await animateSwap(u,reserve,reserve.name+'が前列へ交代。',token);
}
async function applyStatuses(a,t,act,token){if(t.hp<=0)return;for(const[k,n]of STATUS){if(!act[k])continue;let st=k==='stun'?a.PHY:a.SKL;if(act.stat==='ARC')st=a.ARC;if(act.stat==='MND')st=a.MND;if(Math.random()*100<clamp(act[k]+.75*(st-t.MND),5,95)){t.status[k]=k==='poison'?3:k==='stun'?1:2;render();await say(t.name+'に'+n+'！',token,'sys')}}}
async function execute(u,q,token){check(token);if(!u.alive)return;displayActorId=u.id;activeTurnId=u.id;render();if(u.status.stun>0){await say(u.name+'は気絶して動けない。',token,'sys');return}if(q.type==='escape'){if(u.status.legBind>0){await say(u.name+'は脚封じで逃走できない。',token,'sys');return}await say(u.name+'は逃走を試みた！',token,'',{actorId:u.id},false);const p=live(party),e=live(enemies),avg=x=>x.reduce((s,v)=>s+v.SKL,0)/x.length;if(Math.random()*100<clamp(55+(avg(p)-avg(e))*.7,20,90)){await finish('escape',token);return}await say('逃走できなかった。',token,'bad');return}
 const a=q.type==='attack'?normal(u):q.action;if(a.kind==='spell'&&u.status.headBind>0){await say(u.name+'は頭封じで術を使えない。',token,'sys');return}if(!enough(u,a)){await say(u.name+'は'+a.costType+'不足。',token,'sys');return}const ts=u.enemy?live(party).filter(t=>canReach(u,t,a.range)):targets(u,a),t=ts.find(t=>t.id===q.targetId)||ts[0];if(!t){await say(u.name+'の攻撃は届かない。',token,'sys');return}
 const intro=a.kind==='attack'?u.name+'の攻撃！':u.name+'は「'+a.name+'」を'+(a.kind==='spell'?'唱えた！':'使った！');$('playbackTitle').textContent=u.name;await say(intro,token,'',{actorId:u.id},false);if(a.costType)u[a.costType.toLowerCase()]-=a.cost;if(a.heal){const n=Math.min(t.maxHp-t.hp,Math.floor(12+u.MND*.8));t.hp+=n;render();await say(t.name+'のHPが '+n+' 回復。',token,'ok',{targetId:t.id,heal:true,value:n});return}if(Math.random()*100>hit(u,t,a)){render();await say(t.name+'は攻撃をかわした！',token,'sys');return}const d=damage(u,t,a);t.hp=Math.max(0,t.hp-d.value);render();await say(t.name+'に '+d.value+' ダメージ！'+(d.weak?'\n弱点を突いた！':'')+(d.crit?'\n会心の一撃！':''),token,u.enemy?'bad':d.weak?'ok':'',{targetId:t.id,value:d.value,label:d.crit?'CRITICAL':d.weak?'WEAK':''});await applyStatuses(u,t,a,token);await defeated(t,token)}
async function finish(type,token){over=true;phase='done';render();const text={win:'勝利',lose:'敗北',escape:'撤退成功'}[type];await say(text,token,type==='win'?'ok':type==='lose'?'bad':'sys');$('history').dataset.result=type}
async function checkEnd(token){if(over)return true;if(!live(enemies).length){await finish('win',token);return true}if(!live(party).length){await finish('lose',token);return true}return false}
async function resolve(){if(!editable()||!live(party).every(u=>u.queued))return;cancelTarget();commandOpen=false;const token=session;displayActorId=null;activeTurnId=null;turnSequence=[];busy=true;phase='resolve';paused=false;skip=false;closeSheet();setBattle(true);render();try{
 for(const u of live(party)){
  if(u.queued.type!=='move'||u.status.legBind>0)continue;
  const q=u.queued,oldRank=u.rank,oldCol=col(u);
  const other=party.find(x=>x.id!==u.id&&x.rank===q.rank&&col(x)===q.gridCol);
  if(other){other.rank=oldRank;other.gridCol=oldCol;syncLegacyRow(other)}
  u.rank=q.rank;u.gridCol=q.gridCol;syncLegacyRow(u);
  displayActorId=u.id;activeTurnId=u.id;render();
  await say(u.name+'が '+RANK_LABEL[u.rank]+' '+u.gridCol+' へ移動。',token,'sys',{actorId:u.id});
 }
 for(const u of live(party).filter(u=>u.defending)){displayActorId=u.id;activeTurnId=u.id;render();await say(u.name+'は身を守っている。',token,'sys',{actorId:u.id})}
 const order=[...live(party).filter(u=>!['swap','move','defend'].includes(u.queued.type)).map(u=>({u,q:u.queued,s:speed(u,u.queued)})),...live(enemies).map(u=>({u,q:null,s:speed(u,null)}))].sort((a,b)=>b.s-a.s);
 turnSequence=order.map(e=>e.u.id);renderOrder();
 for(const entry of order){check(token);if(!entry.u.alive)continue;let q=entry.q;if(entry.u.enemy){const a=entry.u.spell||normal(entry.u),ts=live(party).filter(t=>canReach(entry.u,t,a.range)),t=entry.u.ai==='archer'?[...ts].sort((a,b)=>a.hp-b.hp)[0]:ts[Math.floor(Math.random()*ts.length)];q={type:a.kind==='attack'?'attack':'skill',action:a,targetId:t?.id}}await execute(entry.u,q,token);if(await checkEnd(token))break}
 if(!over){for(const u of [...party,...enemies]){check(token);if(!u.alive)continue;if(u.status.poison>0){displayActorId=null;activeTurnId=null;const n=Math.max(1,Math.floor(u.maxHp*.04));u.hp=Math.max(0,u.hp-n);render();await say(u.name+'は猛毒で '+n+' ダメージ。',token,'bad',{targetId:u.id,value:n});await defeated(u,token)}for(const[k]of STATUS)if(u.status[k]>0)u.status[k]--}if(!await checkEnd(token)){for(const u of [...party,...enemies]){u.queued=null;u.defending=false}round++;idx=party.reduce((best,u,i)=>u.alive&&(best<0||speed(u,null)>speed(party[best],null))?i:best,-1);commandOpen=idx>=0;phase='command';log('―― Round '+round+' ――','sys')}}
 }catch(e){if(e!==CANCEL){console.error(e);notify('戦闘処理でエラーが発生しました。新しい戦闘で再開してください。');over=true;phase='done'}}finally{if(token===session){busy=false;paused=false;displayActorId=null;activeTurnId=null;turnSequence=[];setBattle(false);render()}}}
function autoRound(){if(!editable())return;cancelTarget();for(const u of live(party)){if(u.queued)continue;const a=normal(u),t=targets(u,a)[0];if(t){u.queued={type:'attack',action:a,targetId:t.id};u.defending=false;continue}const s=u.skills.find(s=>s.target==='enemy'&&!unavailable(u,s));if(s){u.queued={type:'skill',action:s,targetId:targets(u,s)[0].id};u.defending=false}else{u.queued={type:'defend'};u.defending=true}}phase='ready';render();resolve()}
function fresh(randomTerrain=true){session++;displayActorId=null;activeTurnId=null;turnSequence=[];commandOpen=false;for(const anim of activeAnimations)anim.cancel();activeAnimations.clear();closeSheet();clearEffects();nodes.clear();for(const id of ['eb','ef','partyStrip'])$(id).replaceChildren();drafts.clear();replacementUsed.party.clear();replacementUsed.enemies.clear();party=HT.map(u=>initUnit(u));enemies=ET.map(u=>initUnit(u,true));terrain=TERRAINS[randomTerrain?Math.floor(Math.random()*TERRAINS.length):0];round=1;idx=party.reduce((best,u,i)=>u.alive&&(best<0||speed(u,null)>speed(party[best],null))?i:best,-1);phase='command';commandOpen=idx>=0;busy=false;over=false;paused=false;skip=false;targetMode=null;logCount=0;clearTimeout(noticeTimer);$('pause').innerHTML=icon('pause');$('pause').setAttribute('aria-pressed','false');$('log').replaceChildren();$('history').open=false;delete $('history').dataset.result;$('notice').hidden=true;setBattle(false);log('戦闘開始 · '+terrain.name,'sys');render()}
$('new').addEventListener('click',()=>fresh());$('actor').addEventListener('click',()=>openSheet('members'));$('skills').addEventListener('click',()=>openSheet());$('more').addEventListener('click',()=>openSheet('more'));$('closeSheet').addEventListener('click',closeSheet);sheet.addEventListener('click',e=>{const r=sheet.getBoundingClientRect();if(e.target===sheet&&(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right))closeSheet()});$('attack').addEventListener('click',attack);$('swap').addEventListener('click',()=>openSheet('formation'));$('defend').addEventListener('click',()=>simpleCommand('defend'));$('switch').addEventListener('click',switchWeapon);$('resolve').addEventListener('click',resolve);$('auto').addEventListener('click',autoRound);$('cancelTarget').addEventListener('click',cancelTarget);$('nextMessage').addEventListener('click',()=>{skip=true});$('pause').addEventListener('click',()=>{paused=!paused;$('pause').innerHTML=icon(paused?'play':'pause');$('pause').setAttribute('aria-label',paused?'再開':'一時停止');$('pause').setAttribute('aria-pressed',String(paused));for(const anim of activeAnimations)paused?anim.pause():anim.play();$('actorJob').textContent=''});$('pace').addEventListener('click',()=>{paceIndex=(paceIndex+1)%3;$('pace').textContent=['1×','1.4×','2.5×'][paceIndex];$('pace').title=paceOptions[paceIndex].name;try{localStorage.setItem('rpg.pace.v31',paceIndex)}catch(_){}});$('history').addEventListener('toggle',()=>{$('historyButton').setAttribute('aria-expanded',String($('history').open));if($('history').open)$('log').scrollTop=$('log').scrollHeight});$('historyButton').addEventListener('click',toggleHistory);$('terrainButton').addEventListener('click',()=>openSheet('terrain'));
$('enemyStage').addEventListener('click',e=>{if(!e.target.closest('.enemy-unit'))closeCommands()});
$('closeCommand').addEventListener('click',closeCommands);
$('closeHistory').addEventListener('click',()=>{if($('history').open)toggleHistory()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.open&&editable())closeCommands()});
if(typeof ResizeObserver==='function')new ResizeObserver(fitScene).observe($('enemyStage'));
window.addEventListener('resize',fitScene);
fresh(false);document.documentElement.dataset.ready='true';$('bootStatus')?.remove();$('engineStatus').classList.add('ready');$('engineStatus').title='JavaScript動作中 · UI v42';
window.RPGDemo={version:'49',selectActorUI:(id)=>selectActor(id),moveActorUI:(rank,c)=>queueMove(rank,c),snapshot:()=>({round,phase,busy,over,commandOpen,targetMode:targetMode?.key||null,active:current()?.id,party:party.map(u=>({id:u.id,hp:u.hp,sp:u.sp,mp:u.mp,row:u.row,rank:u.rank,col:col(u),slot:u.slot,queued:u.queued?.type||null,target:u.queued?.targetId,weapon:u.weapon.name})),enemies:enemies.map(u=>({id:u.id,hp:u.hp,row:u.row,slot:u.slot}))})};
if(window.__RPG_TEST__)window.__test={get units(){return{party,enemies}},fresh,render,defeated,animateSwap,resolve,autoRound,selectActor,toggleActor,closeCommands,openSheet,simpleCommand,getDraft,chooseSkill,attack,canReach,cancelTarget,setPace:i=>{paceIndex=i},runDeath:async u=>{displayActorId=null;busy=true;setBattle(true);await defeated(u,session);busy=false;setBattle(false);render()}};
})();


 let cardMoveMode=false;const partyBoard=$('partyStrip');
 const syncMoveState=()=>partyBoard?.classList.toggle('move-mode',cardMoveMode);
 const clearMoveMode=()=>{cardMoveMode=false;syncMoveState()};
 const ensureMoveCells=()=>{if(!partyBoard||partyBoard.querySelector('.plan-move-layer'))return;const layer=document.createElement('div');layer.className='plan-move-layer';for(let r=1;r<=3;r++)for(let c=1;c<=3;c++){const b=document.createElement('button');b.type='button';b.className='plan-move-cell';b.dataset.rank=['front','mid','rear'][r-1];b.dataset.col=String(c);b.style.gridRow=String(r);b.style.gridColumn=String(c);b.addEventListener('click',e=>{if(!cardMoveMode)return;e.preventDefault();e.stopPropagation();window.RPGDemo?.moveActorUI?.(b.dataset.rank,Number(b.dataset.col));clearMoveMode()});layer.append(b)}partyBoard.prepend(layer)};
 new MutationObserver(ensureMoveCells).observe(partyBoard,{childList:true});ensureMoveCells();
 partyBoard?.addEventListener('click',e=>{const card=e.target.closest('.ally-unit');if(!card)return;const snap=window.RPGDemo?.snapshot?.();if(!snap||snap.busy||snap.over||snap.targetMode)return;const id=card.dataset.unitId,target=snap.party.find(x=>x.id===id);if(!target)return;e.preventDefault();e.stopImmediatePropagation();if(cardMoveMode){if(id===snap.active){clearMoveMode();return}window.RPGDemo?.moveActorUI?.(target.rank,target.col);clearMoveMode();return}if(id===snap.active){cardMoveMode=true;syncMoveState();return}window.RPGDemo?.selectActorUI?.(id);clearMoveMode()},true);
 const itemBtn=$('swap');itemBtn?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();clearMoveMode();const sheet=$('choiceSheet'),list=$('sheetList');$('sheetKicker').textContent='';$('sheetTitle').textContent='道具';$('sheetHint').textContent='';list.replaceChildren();for(const [name,desc,fn] of [['回復薬','HPを40回復',()=>sheet.close()],['解毒薬','猛毒を解除',()=>sheet.close()],['換装','予備武器に持ち替える',()=>{sheet.close();$('switch').click()}]]){const b=document.createElement('button');b.type='button';b.className='menu-action';b.innerHTML='<span>'+name+'<small>'+desc+'</small></span>';b.addEventListener('click',fn);list.append(b)}if(!sheet.open)sheet.showModal()},true);
 const openPlanBook=e=>{e?.preventDefault();e?.stopImmediatePropagation();clearMoveMode();const sheet=$('choiceSheet'),list=$('sheetList');$('sheetKicker').textContent='';$('sheetTitle').textContent='BOOK';$('sheetHint').textContent='';list.replaceChildren();const help=document.createElement('button');help.type='button';help.className='menu-action';help.innerHTML='<span>操作の説明<small>戦闘操作・移動・対象選択</small></span>';help.addEventListener('click',()=>{list.innerHTML='<div class="plan-help"><b>基本操作</b><p>味方カードをタップして操作キャラを選択。同じカードをもう一度タップすると移動選択になり、空きマスで移動、別の味方カードで位置交換します。</p><p>ATTACK＝攻撃 / SKILL＝技 / ITEM＝道具・換装 / DEFEND＝防御。</p></div>'});const formation=document.createElement('button');formation.type='button';formation.className='menu-action';formation.innerHTML='<span>陣形<small>敵味方の3×3配置を確認・変更</small></span>';formation.addEventListener('click',()=>{sheet.close();$('formationButton').click()});const log=document.createElement('button');log.type='button';log.className='menu-action';log.innerHTML='<span>戦闘履歴<small>これまでの行動を確認</small></span>';log.addEventListener('click',()=>{sheet.close();$('history').open=true});const settings=document.createElement('button');settings.type='button';settings.className='menu-action';settings.innerHTML='<span>設定<small>戦闘表示・速度</small></span>';settings.addEventListener('click',()=>{list.replaceChildren();const speedButton=document.createElement('button');speedButton.type='button';speedButton.className='menu-action';speedButton.innerHTML='<span>戦闘速度<small>右下の速度と同じ設定</small></span>';speedButton.addEventListener('click',()=>{$('pace').click()});const display=document.createElement('button');display.type='button';display.className='menu-action';display.innerHTML='<span>コマンド表記<small>English</small></span>';display.disabled=true;list.append(speedButton,display)});list.append(help,formation,log,settings);if(!sheet.open)sheet.showModal()};$('historyButton')?.addEventListener('click',openPlanBook,true);$('more')?.addEventListener('click',openPlanBook,true);

 const formationSheet=$('formationSheet'),allyFormationBoard=$('allyFormationBoard'),enemyFormationBoard=$('enemyFormationBoard');
 const DISPLAY_NAME={war:'ガルド',rog:'リゼ',run:'エルン',ran:'セナ',arc:'ミレア',mys:'ユナ',g1:'白銀騎士',g2:'聖域の番兵',g3:'月影の獣',arch:'翼竜A',arch2:'翼竜B',mage:'星詠み'};
 const ICON_SRC={war:'images/gald.svg',rog:'images/lize.svg',run:'images/ern.svg',ran:'images/sena.svg',arc:'images/mirea.svg',mys:'images/yuna.svg',g1:'images/enemy_guard.svg',g2:'images/enemy_guard.svg',g3:'images/enemy_guard.svg',arch:'images/enemy_archer.svg',arch2:'images/enemy_archer.svg',mage:'images/enemy_mage.svg'};
 function drawFormationBoard(board,cells,enemy=false){
  board.replaceChildren();
  for(const cell of cells){
   const d=document.createElement('div');d.className='form-cell'+(cell.unit?'':' empty')+(enemy?' enemy':'')+(cell.current?' current':'');
   if(cell.unit){
    const img=document.createElement('img');img.className='cell-face';img.src=ICON_SRC[cell.unit.id]||'';img.alt='';d.append(img);
    const n=document.createElement('span');n.className='cell-name';n.textContent=DISPLAY_NAME[cell.unit.id]||cell.unit.id;d.append(n);
   }
   board.append(d);
  }
 }
 function refreshFormationBoard(){
  const q=window.RPGDemo.snapshot(),ally=[],foe=[];
  for(const rank of ['front','mid','rear'])for(let c=1;c<=3;c++){const u=q.party.find(x=>x.rank===rank&&x.col===c);ally.push({unit:u||null,current:!!u&&u.id===q.active})}
  for(const rank of ['rear','mid','front'])for(let c=1;c<=3;c++){const u=rank==='mid'?null:q.enemies.find(x=>((x.row==='back'?'rear':'front')===rank)&&(((x.slot-1)%3)+1)===c);foe.push({unit:u||null,current:false})}
  drawFormationBoard(allyFormationBoard,ally,false);drawFormationBoard(enemyFormationBoard,foe,true);
 }
 window.updateFormationBoard=refreshFormationBoard;
 $('formationButton').addEventListener('click',()=>{const q=window.RPGDemo.snapshot();if(q.busy||q.over)return;refreshFormationBoard();formationSheet.showModal()});
 $('closeFormationSheet').addEventListener('click',()=>formationSheet.close());
 formationSheet.addEventListener('click',e=>{if(e.target===formationSheet)formationSheet.close()});
 let language='en';try{language=localStorage.getItem('rpg.command-language')==='ja'?'ja':'en'}catch(_){}
 const labels={attack:['ATTACK','ATTACK'],skills:['SKILL','SKILL'],defend:['DEFEND','DEFEND'],swap:['ITEM','ITEM'],switch:['EQUIP','EQUIP'],resolve:['EXECUTE','EXECUTE']};
 function localize(){for(const[id,pair]of Object.entries(labels)){const b=$(id).querySelector('b');if(b)b.textContent=pair[language==='en'?0:1]}}
 localize();$('more').addEventListener('click',()=>{const b=document.createElement('button');b.type='button';b.className='menu-action';b.textContent='コマンド：'+(language==='en'?'English':'日本語');b.addEventListener('click',()=>{language=language==='en'?'ja':'en';try{localStorage.setItem('rpg.command-language',language)}catch(_){}localize();b.textContent='コマンド：'+(language==='en'?'English':'日本語')});$('sheetList').append(b)});
 // An additional Escape dismisses the command overlay, without changing a reserved move.
 document.documentElement.dataset.presentation='plan31';
}catch(error){console.error(error);const boot=$('bootStatus');if(boot){boot.style.display='block';boot.querySelector('p').textContent='読み込みに失敗しました。再読み込みしてください。';}window.__bootError=String(error)}
})();
