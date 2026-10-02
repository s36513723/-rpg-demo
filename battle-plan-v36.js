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
const actorArtNode=$('actorArt');
if(actorArtNode&&actorArtNode.parentElement?.id==='commandPanel')$('game').append(actorArtNode);
let state=null;
let viewSequence=0;
function cut(c,cls=''){
 const id='view-cut-'+(++viewSequence);
 return '<svg class="'+cls+'" viewBox="'+c.join(' ')+'" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><defs><clipPath id="'+id+'"><rect x="'+c[0]+'" y="'+c[1]+'" width="'+c[2]+'" height="'+c[3]+'"/></clipPath></defs><image href="'+ATLAS+'" width="'+M.width+'" height="'+M.height+'" clip-path="url(#'+id+')"/></svg>';
}
$('environment').querySelector('.sky-art').innerHTML=cut(M.crops.sky,'scenery');

const BATTLE_GRID={
 enemy:{left:.025,top:.09,width:.95,height:.78,rows:['REAR','MID','FRONT']},
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
  c.className='stage-cell';c.dataset.index=String(i);c.dataset.side=side;c.setAttribute('role','button');c.tabIndex=-1;const mark=document.createElement('i');mark.className='terrain-mark';c.append(mark);c.addEventListener('click',e=>{if(c.dataset.targetId)return;e.stopPropagation();window.RPGDemo?.showTileUI?.(side,i)});container.append(c);
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
 for(const g of [enemyGrid,allyGrid])g?.querySelectorAll('.stage-cell').forEach(x=>{x.classList.remove('occupied','active-cell','terrain-active','terrain-temp','terrain-risk');x.removeAttribute('data-tile');x.removeAttribute('data-temp');const m=x.querySelector('.terrain-mark');if(m)m.textContent=''});
 const T=window.RPG_TERRAIN,bf=options.battlefield;
 for(const [side,grid] of [['enemy',enemyGrid],['ally',allyGrid]])for(const cell of bf?.cells?.[side]||[]){const el=grid?.querySelectorAll('.stage-cell')[cell.index];if(!el)continue;const id=cell.tempTile||cell.baseTile||'TL00',tile=T?.TILE?.[id];el.dataset.tile=cell.baseTile||'TL00';if(cell.tempTile)el.dataset.temp=cell.tempTile;el.classList.toggle('terrain-active',id!=='TL00');el.classList.toggle('terrain-temp',!!cell.tempTile);el.classList.toggle('terrain-risk',(tile?.risk||0)>=2);const mark=el.querySelector('.terrain-mark');if(mark)mark.textContent=T?.TILE_ICON?.[id]||'';const label=[T?.tileName?.(cell.baseTile),cell.tempTile?T?.tileName?.(cell.tempTile):null].filter(Boolean).join('＋');el.title=label+(T?.tileSummary?(' · '+T.tileSummary(cell,!!options.boss)):'');el.setAttribute('aria-label',el.title||'通常マス');el.tabIndex=id==='TL00'?-1:0}
 for(const u of enemies){
  if(!u.alive||u.hp<=0)continue;
  enemyGrid?.querySelectorAll('.stage-cell')[stageCell('enemy',u.row,u.gridCol||((u.slot-1)%3+1))]?.classList.add('occupied');
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
  const cellW=eg.w/3,cellH=eg.h/3;
  const ew=cellW*.94,eh=cellH*.92;
  const nx=eg.x+(col-1)*cellW+(cellW-ew)/2;
  const ny=eg.y+ri*cellH+(cellH-eh)/2;
  el.style.left=Math.round(nx)+'px';
  el.style.top=Math.round(ny)+'px';
  el.style.width=Math.round(ew)+'px';
  el.style.height=Math.round(eh)+'px';
  el.style.zIndex=String(8+ri*3+col);
  el.dataset.rank=row;el.dataset.col=String(col);
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
const W={hammer:{name:'戦槌',attr:'壊',range:'near',power:22,hit:-5,speed:-5,weight:'heavy'},axe:{name:'戦斧',attr:'斬',range:'near',power:24,hit:-5,speed:-5,weight:'heavy'},dagger:{name:'短剣',attr:'斬',range:'near',power:11,hit:8,speed:8,weight:'light',normal:'SKL'},chakram:{name:'回刃',attr:'斬',range:'far',power:12,hit:5,speed:4,weight:'light',normal:'SKL'},sword:{name:'剣',attr:'斬',range:'near',power:17,hit:3,speed:0,weight:'normal'},spear:{name:'槍',attr:'突',range:'mid',power:18,hit:2,speed:0,weight:'normal'},bow:{name:'長弓',attr:'突',range:'far',power:16,hit:7,speed:1,weight:'normal',normal:'SKL'},staff:{name:'杖',attr:'壊',range:'near',power:8,hit:0,speed:0,weight:'light'},talisman:{name:'呪符',attr:'無',range:'near',power:6,hit:0,speed:0,weight:'light'},whip:{name:'鞭',attr:'斬',range:'mid',power:12,hit:5,speed:3,weight:'light',normal:'SKL'},scythe:{name:'鎌',attr:'斬',range:'near',power:23,hit:-2,speed:-3,weight:'heavy'},katana:{name:'刀',attr:'斬',range:'near',power:18,hit:5,speed:5,weight:'normal',normal:'SKL'},gun:{name:'銃',attr:'突',range:'far',power:18,hit:12,speed:0,weight:'normal',normal:'SKL'},fist:{name:'格闘',attr:'壊',range:'near',power:10,hit:6,speed:7,weight:'light'},shield:{name:'小盾',attr:'壊',range:'near',power:7,hit:0,speed:-1,weight:'normal'},unarmed:{name:'無手',attr:'壊',range:'near',power:0,hit:0,speed:10,weight:'light'}};
const ARM={heavy:{p:28,m:8},light:{p:15,m:11},magic:{p:7,m:20}};
const WEAPON_KEY={戦槌:'hammer',戦斧:'axe',短剣:'dagger',回刃:'chakram',王国剣:'sword',剣:'sword',長槍:'spear',槍:'spear',長弓:'bow',弓:'bow',短杖:'staff',杖:'staff',呪符:'talisman',鞭:'whip',鎌:'scythe',刀:'katana',銃:'gun',拳甲:'fist',格闘:'fist',小盾:'shield',盾:'shield',なし:'unarmed'};
function weaponKeyByName(n){return WEAPON_KEY[n]||Object.keys(W).find(k=>W[k]?.name===n)||'unarmed'}
function canonicalAction(n){const d=window.RPG_RULES?.meta?.(n);return d?.mode==='Active'?JSON.parse(JSON.stringify(d)):null}
function equipmentName(set,slot){return String(set?.[slot]||'').split('：')[1]||'なし'}

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
{id:'arch2',name:'翼竜B',style:'弓兵',row:'back',gridCol:2,slot:6,hp:95,PHY:18,SKL:44,ARC:10,MND:16,physDef:32,magDef:36,weak:{斬:1.5,壊:1.2},resist:{},weapon:{name:'弓',attr:'突',range:'far',power:14,hit:6,speed:3,weight:'normal'},ai:'archer'},
{id:'arch3',name:'翼竜C',style:'弓兵',row:'back',gridCol:3,slot:7,hp:95,PHY:18,SKL:44,ARC:10,MND:16,physDef:32,magDef:36,weak:{斬:1.5,壊:1.2},resist:{},weapon:{name:'弓',attr:'突',range:'far',power:14,hit:6,speed:3,weight:'normal'},ai:'archer'},
{id:'g4',name:'白銀騎士B',style:'重装兵',row:'mid',gridCol:1,slot:8,hp:155,PHY:42,SKL:20,ARC:10,MND:18,physDef:70,magDef:36,weak:{壊:2,火:1.2},resist:{斬:.5},weapon:{name:'大盾槍',attr:'突',range:'mid',power:20,hit:0,speed:-4,weight:'heavy'},ai:'guard'},
{id:'g5',name:'聖域の番兵B',style:'重装兵',row:'front',gridCol:2,slot:9,hp:145,PHY:40,SKL:22,ARC:10,MND:18,physDef:66,magDef:36,weak:{壊:2},resist:{斬:.5},weapon:{name:'戦槌',attr:'壊',range:'near',power:21,hit:-3,speed:-5,weight:'heavy'},ai:'guard'}
];
const PORTRAITS={war:'gald',rog:'lize',run:'ern',ran:'sena',arc:'mirea',mys:'yuna',g1:'enemy_guard',g2:'enemy_guard',g3:'enemy_guard',g4:'enemy_guard',g5:'enemy_guard',arch:'enemy_archer',arch2:'enemy_archer',arch3:'enemy_archer',mage:'enemy_mage'};
const TERRAINS=[{name:'狭所',desc:'重量武器 命中−10・速度−5',wHit:w=>w?.weight==='heavy'?-10:0,wSpeed:w=>w?.weight==='heavy'?-5:0,ranged:1},{name:'高台',desc:'後列の遠距離武器 威力＋10%',wHit:()=>0,wSpeed:()=>0,ranged:1.1},{name:'茂み',desc:'遠距離武器 命中−10（術は除く）',wHit:w=>w?.range==='far'?-10:0,wSpeed:()=>0,ranged:1},{name:'開所',desc:'遠距離武器 威力＋10%',wHit:()=>0,wSpeed:()=>0,ranged:1.1}];
const EXPCTX=(()=>{
 if(new URLSearchParams(location.search).get('from')!=='exploration'||!window.RPG_STORE)return null;
 try{const value=JSON.parse(RPG_STORE.getItem('rpg.exploreBattle')||'null');return value?.schema===6&&value.battleId&&!value.result?value:null}catch(_){return null}
})();
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
 war:'images/hub-standing-warrior-clean.webp',rog:'images/hub-standing-paladin-transparent.webp',run:'images/hub-standing-rogue-clean.webp',
 ran:'images/hub-standing-archer-clean.webp',arc:'images/hub-standing-alchemist-clean.webp',mys:'images/hub-standing-mystic-clean.webp'
};
function enemyCrop(u){return u.id==='g3'?[542, 159, 210, 135]:CROPS[u.id==='mage'?'mage':['arch','arch2'].includes(u.id)?'archer':'guard']}
const ENEMY_ARCHETYPE_ART={
 beast:'images/enemy-beast-official.webp',
 light:'images/enemy-light-official.webp',
 heavy:'images/enemy-heavy-official.webp',
 mage:'images/enemy-mage-official.webp',
 archer:'images/enemy-archer-official.webp',
 flying:'images/enemy-flying-official.webp',
 golem:'images/enemy-golem-official.webp'
};
const ENEMY_CINEMATIC={
 g1:ENEMY_ARCHETYPE_ART.heavy,
 g2:ENEMY_ARCHETYPE_ART.heavy,
 g3:ENEMY_ARCHETYPE_ART.beast,
 arch:ENEMY_ARCHETYPE_ART.flying,
 arch2:ENEMY_ARCHETYPE_ART.flying,
 arch3:ENEMY_ARCHETYPE_ART.flying,
 g4:ENEMY_ARCHETYPE_ART.heavy,
 g5:ENEMY_ARCHETYPE_ART.heavy,
 mage:ENEMY_ARCHETYPE_ART.mage
};
const ORDER_PORTRAITS={
 war:'images/turn-warrior.svg',
 rog:'images/turn-paladin.svg',
 run:'images/turn-rogue.svg',
 ran:'images/turn-archer.svg',
 arc:'images/turn-alchemist.svg',
 mys:'images/turn-mystic.svg',
 g1:ENEMY_ARCHETYPE_ART.heavy,
 g2:ENEMY_ARCHETYPE_ART.heavy,
 g3:ENEMY_ARCHETYPE_ART.beast,
 arch:ENEMY_ARCHETYPE_ART.flying,
 arch2:ENEMY_ARCHETYPE_ART.flying,
 arch3:ENEMY_ARCHETYPE_ART.flying,
 g4:ENEMY_ARCHETYPE_ART.heavy,
 g5:ENEMY_ARCHETYPE_ART.heavy,
 mage:ENEMY_ARCHETYPE_ART.mage
};
const ORDER_FRAMES={
 ally:'images/order-frame-ally.svg',
 enemy:'images/order-frame-enemy.svg',
 next:'images/order-frame-next.svg'
};
function enemyArchetypeArt(u){
 const name=String(u?.name||'');
 if(/翼竜/.test(name))return ENEMY_ARCHETYPE_ART.flying;
 if(/月影の獣/.test(name))return ENEMY_ARCHETYPE_ART.beast;
 if(/星詠み/.test(name))return ENEMY_ARCHETYPE_ART.mage;
 if(/白銀騎士|聖域の番兵/.test(name))return ENEMY_ARCHETYPE_ART.heavy;
 const s=name+' '+String(u?.style||'');
 if(/ゴーレム|機械|石像/.test(s))return ENEMY_ARCHETYPE_ART.golem;
 if(/飛行|翼|鳥/.test(s))return ENEMY_ARCHETYPE_ART.flying;
 if(/弓|狙撃/.test(s))return ENEMY_ARCHETYPE_ART.archer;
 if(/魔術|術師|呪術|神官|精霊|死霊/.test(s))return ENEMY_ARCHETYPE_ART.mage;
 if(/重装|騎士|番兵/.test(s))return ENEMY_ARCHETYPE_ART.heavy;
 if(/軽装|斥候|海賊/.test(s))return ENEMY_ARCHETYPE_ART.light;
 if(/獣|狼|海獣|毒獣|植物/.test(s))return ENEMY_ARCHETYPE_ART.beast;
 return null;
}
function enemyArtMarkup(u){
 const src=ENEMY_CINEMATIC[u.id]||enemyArchetypeArt(u);
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
function orderPortraitMarkup(u){
 const src=ORDER_PORTRAITS[u.id];
 if(src)return '<span class="order-portrait-fill" style="background-image:url(\''+src+'\')" aria-hidden="true"></span>';
 return faceMarkup(u,'order-portrait');
}

function fitScene(){
 const stage=$('enemyStage');if(!stage)return;
 const h=Math.max(65,Math.min(200,(stage.clientHeight-12)/2-30,stage.clientWidth/3*1.0));
 stage.style.setProperty('--figure-h',h.toFixed(2)+'px');
}
let displayActorId=null,activeTurnId=null,turnSequence=[],commandOpen=false;
const icon=n=>'<svg class="icon" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const rangeName=r=>({near:'近距離',mid:'中距離',far:'遠距離',long:'長距離',global:'全域',all:'全域'}[r]||r);
const scopeName=s=>({single:'単体',row:'1列',all:'全体',random:'ランダム複数',pierce:'前後貫通',adjacent:'隣接'}[s.scope||'single']);
const skillIcon=a=>a.heal?'heart':a.attr==='火'?'fire':a.kind==='spell'?'scroll':a.range==='far'?'bow':a.attr==='壊'?'hammer':'sword';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let party=[],enemies=[],terrain=TERRAINS[0],battlefield=null,terrainFocus=null,prepMode=false,round=1,idx=0,phase='command',busy=false,over=false;
let session=0,paused=false,skip=false,paceIndex=0,logCount=0,noticeTimer=0,targetMode=null,commandFocus='attack';
const paceOptions=[{name:'ゆっくり',scale:1},{name:'標準',scale:.72},{name:'早送り',scale:.4}];
try{paceIndex=clamp(Number(localStorage.getItem('rpg.pace.v31'))||0,0,2)}catch(_){}
const nodes=new Map(),drafts=new Map(),replacementUsed={party:new Set(),enemies:new Set()},activeAnimations=new Set();
const CANCEL=Symbol('cancelled battle');
function check(token){if(token!==session)throw CANCEL}
function derived(P,S,A,M){const T=P+S+A+M,p=Math.max(0,P-10),s=Math.max(0,S-10),x=Math.max(0,A+M-20);return{hp:Math.floor(100+.5*(T-100)+2*p+Math.max(0,p-20)),sp:Math.floor(20+.1*(T-100)+.4*p+s),mp:Math.floor(x<=50?2*x:100+.5*(x-50))}}
function initUnit(source,enemy=false){const o=JSON.parse(JSON.stringify(source)),d=derived(o.PHY,o.SKL,o.ARC,o.MND),ar=ARM[o.armor];return{...o,enemy,maxHp:enemy?o.hp:d.hp,hp:enemy?o.hp:d.hp,maxSp:d.sp,sp:d.sp,maxMp:d.mp,mp:d.mp,physDef:enemy?o.physDef:o.PHY+ar.p,magDef:enemy?o.magDef:o.ARC+o.MND+ar.m,wi:0,weapon:enemy?o.weapon:W[o.weapons[0]],alive:true,defending:false,status:{},queued:null}}
function applyExploreContext(){
 const ctx=EXPCTX;if(!ctx)return;
 const ids=HT.map(u=>u.id),active=Array.isArray(ctx.activeMembers)?ctx.activeMembers:ids.map((_,i)=>i);
 party=party.filter(u=>active.includes(ids.indexOf(u.id)));
 for(const u of party){
  const i=ids.indexOf(u.id),a=ctx.stats?.[i],v=ctx.vitals?.[i],gear=ctx.equipment?.[i],armorFamily=ctx.armor?.[i],armorKey={魔装:'magic',軽装:'light',重装:'heavy'}[armorFamily];
  if(armorKey)u.armor=armorKey;
  if(gear){const main=weaponKeyByName(equipmentName(gear,0)),reserve=weaponKeyByName(equipmentName(gear,2));u.weapons=[main,reserve];u.wi=0;u.weapon=W[main]||W.unarmed;u.currentOffhand=equipmentName(gear,1);u.reserveOffhand=equipmentName(gear,3)}
  if(Array.isArray(ctx.skillSet?.[i]))u.skills=ctx.skillSet[i].map(canonicalAction).filter(Boolean);
  if(Array.isArray(a)&&a.length>=4){[u.PHY,u.SKL,u.ARC,u.MND]=a.map(Number);const d=window.RPG_RULES?.derived(a)||derived(...a);u.maxHp=d.hp;u.maxSp=d.sp;u.maxMp=d.mp;u.physDef=u.PHY+ARM[u.armor].p;u.magDef=u.ARC+u.MND+ARM[u.armor].m}
  if(v){u.hp=clamp(Number(v.hp)||0,0,u.maxHp);u.sp=clamp(Number(v.sp)||0,0,u.maxSp);u.mp=clamp(Number(v.mp)||0,0,u.maxMp);u.status={...u.status,...(v.status||{})};u.alive=u.hp>0}
  const cell=ctx.formation?.indexOf(i)??-1;
  if(cell>=0){u.rank=['front','mid','rear'][Math.floor(cell/3)]||'front';u.gridCol=cell%3+1;u.row=u.rank==='front'?'front':'back';u.slot=cell+1}
 }
 const front=ctx.boss?[({古代迷宮:'迷宮守護機',辺境遺跡:'辺境の巨獣',深淵の樹海:'深淵樹母',沈黙の砂都:'黄金王墓の番人'})[ctx.dungeonId]||'迷宮守護機']:(ctx.enemyFront||[]);
 const back=ctx.boss?[]:(ctx.enemyBack||[]);
 const makeEnemy=(tag,row,n,rowCount)=>{
  const magic=/魔術|呪術|神官|精霊|死霊/.test(tag),flying=/飛行|翼|鳥/.test(tag),ranged=flying||/弓|狙撃/.test(tag),beast=/獣|狼|植物/.test(tag);
  const seed=ET.find(e=>e.id===(magic?'mage':ranged?'arch':beast?'g3':'g1'));
  const src=JSON.parse(JSON.stringify(seed)),i=enemies.length;
  src.id='enc'+i;src.name=String(tag)+(ctx.boss?'':' '+(i+1));src.style=String(tag);src.row=row;src.gridCol=rowCount===1?2:rowCount===2?n*2+1:n+1;src.slot=i+1;
  src.hp=(ctx.boss?1280:magic?100:ranged?110:/ゴーレム|重装/.test(tag)?170:135)+Math.max(0,(Number(ctx.threat)||1)-1)*10;src.terrainImmunity=flying?'ignore_ground_negative':/ゴーレム/.test(tag)?'ignore_poison_terrain':null;
  src.weak={};src.resist={};
  const art=enemyArchetypeArt(src);if(art){ENEMY_CINEMATIC[src.id]=art;ORDER_PORTRAITS[src.id]=art}PORTRAITS[src.id]=PORTRAITS[seed.id];
  enemies.push(initUnit(src,true));
 };
 enemies=[];front.slice(0,3).forEach((tag,n)=>makeEnemy(tag,'front',n,front.length));back.slice(0,3).forEach((tag,n)=>makeEnemy(tag,'back',n,back.length));
 if(ctx.battleType==='elite'&&enemies[0]){const u=enemies[0];u.hp=u.maxHp=Math.floor(u.maxHp*1.75);u.PHY+=10;u.physDef+=8}
 terrain=TERRAINS.find(t=>t.name===ctx.terrain)||{...TERRAINS[0],name:String(ctx.terrain||'開所'),desc:'探索地点の地形'};
 const T=window.RPG_TERRAIN,place={placeType:ctx.placeType||'分岐路',primaryTerrain:ctx.primaryTerrain,secondaryTerrains:ctx.secondaryTerrains||[],conditionTerrain:ctx.conditionTerrain||null,terrainTags:ctx.terrainTags||[],fieldTags:ctx.fieldTags||[],battleOverlay:false};
 battlefield=T?.migrateBattlefield?.(ctx.battlefield,place,ctx.encounterSeed||T.hashSeed?.(ctx.battleId),ctx.fieldEffects?.enemyAmbush?'ambush':ctx.battleType,ctx.theme)||ctx.battlefield||null;
 if(ctx)ctx.battlefield=battlefield;if(ctx&&(ctx.battleType==='elite'||ctx.fieldEffects?.enemyAmbush)&&!ctx.boss)optimizeEnemyStart(2);
 prepMode=!!ctx&&!ctx.fieldEffects?.enemyAmbush&&!ctx.result;
}
function terrainApi(){return window.RPG_TERRAIN||null}
function unitCell(u,row=u.enemy?u.row:(u.rank||u.row),gridCol=col(u)){return terrainApi()?.cellFor?.(battlefield,u.enemy?'enemy':'ally',row,gridCol)||null}
function unitTerrain(u){return terrainApi()?.unitTileEffect?.(battlefield,u)||{cell:null,effect:{}}}
function terrainCondition(){return terrainApi()?.conditionEffect?.(battlefield)||{}}
function rangeMax(a){return ({near:1,mid:2,far:3,long:4,global:5,all:5})[a?.range]||1}
function physicalRanged(u,a){return a?.kind!=='spell'&&rangeMax(a)>=3}
function terrainHitBonus(a,t,act){
 const T=terrainApi();if(!T||!battlefield)return 0;const ae=unitTerrain(a).effect,te=unitTerrain(t).effect,cond=terrainCondition();let v=0;
 if(physicalRanged(a,act)){v+=(ae.outgoingRangedHit||0)+(te.incomingRangedHit||0)+(cond.physicalRangedHit||0)}
 if(rangeMax(act)>=3&&battlefield.conditionTerrain==='TR16'&&act.attr!=='光')v+=cond.rangedHit||0;
 v-=te.evasion||0;if(ae.highAccuracy)v+=ae.highAccuracy;
 return T.clampTerrainHit(v)
}
function terrainDamageMod(a,t,act){
 const T=terrainApi();if(!T||!battlefield)return 0;const ae=unitTerrain(a).effect,te=unitTerrain(t).effect,cond=terrainCondition(),magic=act.kind==='spell'||['ARC','MND'].includes(act.stat),attrs=Array.isArray(act.attr)?act.attr:[act.attr];let v=0;
 v+=magic?(te.incomingMagic||0):(te.incomingPhysical||0);if(ae.highDamage)v+=ae.highDamage;
 if(attrs.includes('水'))v+=(ae.waterEffect||0)+(cond.waterDamage||0);if(attrs.includes('火'))v+=(te.incomingFire||0)+(cond.fireDamage||0);const mastery=act.unlocks?.[0]?.mastery,category=window.RPG_RULES?.masteries?.[mastery]?.category;if(category==='源泉')v+=ae.sourceEffect||0;
 return T.clampTerrainMultiplier(v)
}
function terrainHealMod(t){const T=terrainApi();if(!T||!battlefield)return 0;return T.clampTerrainMultiplier((unitTerrain(t).effect.healingReceived||0)+(terrainCondition().healing||0))}
function terrainStatusDelta(a,t,key){
 const ae=unitTerrain(a).effect,te=unitTerrain(t).effect,bind=['headBind','armBind','legBind'].includes(key);return (bind?(ae.bindApply||0)-(te.bindResist||0):(ae.statusApply||0)-(te.statusResist||0))-(terrainCondition()[bind?'bindResist':'statusResist']||0)
}
function terrainActionCost(u,a){
 let cost=Number(a?.cost)||0;if(!a?.costType||!battlefield)return cost;const e=unitTerrain(u).effect,mastery=a.unlocks?.[0]?.mastery,category=window.RPG_RULES?.masteries?.[mastery]?.category;
 if(category==='源泉'&&e.sourceSp)cost+=e.sourceSp;if(mastery==='機巧'&&e.kikouSp)cost+=e.kikouSp;return Math.max(1,cost)
}
function terrainMoveLimit(u){const e=unitTerrain(u).effect;return terrainApi()?.isFlying?.(u)?2:Math.max(1,Number(e.moveMax)||2)}
function movePreview(u,row,gridCol){
 const cur=unitTerrain(u).effect,next=terrainApi()?.tileEffect?.(unitCell(u,row,gridCol))||{},out=[];
 const pct=(a,b)=>Math.round(((b||0)-(a||0))*100);
 const sd=pct(cur.speed,next.speed);if(sd)out.push('速度 '+(sd>0?'+':'')+sd+'%');
 const ev=(next.evasion||0)-(cur.evasion||0);if(ev)out.push('回避 '+(ev>0?'+':'')+ev+'pt');
 const ip=pct(cur.incomingPhysical,next.incomingPhysical);if(ip)out.push('物理被ダメ '+(ip>0?'+':'')+ip+'%');
 if(unitCell(u,row,gridCol)?.baseTile==='TL10'||unitCell(u,row,gridCol)?.tempTile==='TL10')out.push('危険縁');
 return out.slice(0,3).join(' / ')||'地形変化なし'
}
function persistBattlefield(){
 if(!EXPCTX||!battlefield)return;EXPCTX.battlefield=battlefield;EXPCTX.formation=HT.map((source,i)=>{const u=party.find(x=>x.id===source.id);return u?({front:0,mid:1,rear:2}[u.rank]??0)*3+(col(u)-1):EXPCTX.formation?.indexOf(i)}).reduce((arr,cell,i)=>{if(Number.isInteger(cell)&&cell>=0)arr[cell]=i;return arr},Array(9).fill(null));
 try{RPG_STORE.setItem('rpg.exploreBattle',JSON.stringify(EXPCTX))}catch(_){}
}
function tileDetail(side,index){
 const T=terrainApi(),cell=battlefield?.cells?.[side]?.[index];if(!T||!cell)return null;return {side,index,base:cell.baseTile,temp:cell.tempTile,remaining:cell.tempRemaining||0,name:[T.tileName(cell.baseTile),cell.tempTile?T.tileName(cell.tempTile):null].filter(Boolean).join('＋'),text:T.tileSummary(cell,!!EXPCTX?.boss),icon:T.TILE_ICON?.[cell.tempTile||cell.baseTile]||''}
}
function setTerrainFocus(side,index){terrainFocus=tileDetail(side,index);openSheet('terrain')}
async function terrainRoundEffect(u,token){
 if(!battlefield||!u.alive)return;const T=terrainApi(),x=T?.unitTileEffect?.(battlefield,u);if(!x)return;const ids=T.tileIds(x.cell),e=x.effect;if(T.isFlying?.(u)&&ids.some(id=>T.GROUND_NEGATIVE?.has?.(id)))return;
 let pct=e.endRoundHp||0,label=e.endRoundHp?'地形':'';
 if(e.endRoundFire){pct=Math.max(pct,e.endRoundFire);label='炎上'}
 if(!pct)return;if(T.isGolem?.(u)&&ids.includes('TL06'))return;
 const n=Math.max(1,Math.floor(u.maxHp*pct));u.hp=Math.max(0,u.hp-n);render();await say(u.name+'は'+label+'で '+n+' ダメージ。',token,'bad',{targetId:u.id,value:n});await defeated(u,token)
}
function forcedRows(u){return u.enemy?['front','mid','back']:['front','mid','rear']}
async function terrainForceMove(u,direction,baseDistance,token){
 const T=terrainApi();if(!T||!battlefield||!u.alive)return false;const rows=forcedRows(u),side=u.enemy?'enemy':'ally',current=rows.indexOf(u.enemy?u.row:u.rank),start=T.unitTileEffect(battlefield,u).effect;let dist=Math.max(0,Number(baseDistance)||1)+(Number(start.forcedDelta)||0);
 if(battlefield.conditionTerrain==='TR17'&&battlefield.windDir){if(battlefield.windDir===direction)dist++;else if({front:'back',back:'front'}[battlefield.windDir]===direction)dist--}
 dist=Math.max(0,Math.min(2,dist));let pos=current,moved=false;
 for(let step=0;step<dist;step++){const cell=unitCell(u),next=pos+(direction==='back'?1:-1);if(next<0||next>=rows.length){if((cell?.baseTile==='TL10'||cell?.tempTile==='TL10')&&cell.hazardDir===direction&&!T.isFlying?.(u)){const pct=EXPCTX?.boss?(T.TILE.TL10.bossEdgeDamage||.05):(T.TILE.TL10.edgeDamage||.15),n=Math.max(1,Math.floor(u.maxHp*pct));u.hp=Math.max(0,u.hp-n);await say(u.name+'は危険縁で '+n+' ダメージ。',token,'bad',{targetId:u.id,value:n});await defeated(u,token)}break}
  const nr=rows[next],other=live(u.enemy?enemies:party).find(x=>x.id!==u.id&&(x.enemy?x.row:x.rank)===nr&&col(x)===col(u));if(other)break;
  if(u.enemy)u.row=nr;else{u.rank=nr;syncLegacyRow(u)}pos=next;moved=true
 }
 if(moved){render();persistBattlefield();await say(u.name+'が地形の影響を受けて'+(direction==='back'?'後退':'前進')+'。',token,'sys',{actorId:u.id})}
 return moved
}
function optimizeEnemyStart(maxMoves=2){
 const T=terrainApi();if(!T||!battlefield)return;const occupied=new Map(live(enemies).map(u=>[u.row+':'+col(u),u]));let moved=0;
 for(const u of live(enemies)){if(moved>=maxMoves)break;const cur=T.aiTileValue(battlefield,u,u.row,col(u));let best=null;
  for(const row of ['front','mid','back'])for(let cc=1;cc<=3;cc++){const key=row+':'+cc,other=occupied.get(key);if(other&&other!==u)continue;const cell=T.cellFor(battlefield,'enemy',row,cc),risk=T.tileEffect(cell)?.risk||0;if(risk>=3&&!T.isFlying(u))continue;const value=T.aiTileValue(battlefield,u,row,cc);if(!best||value>best.value)best={row,col:cc,value}}
  if(best&&best.value>cur){occupied.delete(u.row+':'+col(u));u.row=best.row;u.gridCol=best.col;occupied.set(best.row+':'+best.col,u);moved++}
 }
}
async function maybeBossTerrainPhase(victim,token){
 if(!EXPCTX?.boss||!victim?.enemy||!battlefield?.bossFieldId||victim.maxHp<=0)return;const T=terrainApi(),phase=T?.bossPhaseChange?.(battlefield,victim.hp/victim.maxHp);if(!phase?.text)return;
 persistBattlefield();render();await say('地形変化：'+phase.text,token,'sys')
}
function triggerBossTerrainEvent(name){const x=terrainApi()?.bossTerrainEvent?.(battlefield,name);if(x?.text){persistBattlefield();render();log('地形変化：'+x.text,'sys')}return x}
function enemyMovePlan(u,a){
 const T=terrainApi();if(!T||!battlefield)return null;const hasAttack=live(party).some(t=>canReach(u,t,a.range)),occ=new Map(live(enemies).filter(x=>x.id!==u.id).map(x=>[x.row+':'+col(x),x]));
 return T.bestAiMove?.(battlefield,u,occ,hasAttack)||null
}
async function executeEnemyMove(u,p,token){
 if(!p)return false;const other=live(enemies).find(x=>x.id!==u.id&&x.row===p.row&&col(x)===p.col),old=u.row;if(other)other.row=old;u.row=p.row;render();persistBattlefield();await say(u.name+'は地形を利用して移動。',token,'sys',{actorId:u.id});return true
}

function current(){return party[idx]}
function normal(u){return{name:'通常攻撃',kind:'attack',range:u.weapon?.range||'near',attr:u.weapon?.attr||'壊',target:'enemy',scope:'single',mult:1,hit:0,speed:0}}
function getDraft(u){if(!drafts.has(u.id))drafts.set(u.id,{key:'attack',targetId:null});return drafts.get(u.id)}
function actionFor(u,key=getDraft(u).key){return key==='attack'?normal(u):u.skills[Number(key)]||normal(u)}
function canReach(a,t,r){
 if(!t?.alive||t.hp<=0)return false;
 if(['far','long','global','all'].includes(r))return true;
 const side=t.enemy?enemies:party,ar=rankIndex(a),tr=rankIndex(t),fr=frontRank(side);
 if(r==='near')return ar===0&&tr===fr;
 if(r==='mid')return(ar<=1&&tr===fr)||(ar===0&&tr<=fr+1);
 return false;
}
function weaponMasteryName(u){return ({戦槌:'槌',戦斧:'斧',短剣:'短剣',回刃:'投擲',剣:'剣',長槍:'槍',槍:'槍',長弓:'弓',弓:'弓',杖:'杖',呪符:'符術',鞭:'鞭',鎌:'鎌',刀:'刀',銃:'銃',格闘:'格闘',小盾:'盾',無手:'無手'})[u.weapon?.name]||u.weapon?.name}
function targets(u,a){if(a.target==='self')return [u];return a.target==='ally'?live(party):live(enemies).filter(t=>canReach(u,t,a.range))}
function enough(u,a){return !a.costType||u[a.costType.toLowerCase()]>=terrainActionCost(u,a)}
function unavailable(u,a){if(a.kind==='spell'&&u.status.headBind>0)return'頭封じ';if(a.weapons?.length&&!a.weapons.includes(weaponMasteryName(u)))return'現在の武器では使用不可';if(!enough(u,a))return a.costType+'不足';if(!targets(u,a).length)return'射程内に対象なし';return''}
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
  el.innerHTML='<span class="enemy-name">'+esc(u.name)+'</span><span class="enemy-hp" data-resource="hp"><span class="bar"><i></i></span><b></b></span><span class="enemy-visual">'+enemyArtMarkup(u)+'</span><span class="card-status"></span>';
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
   el.classList.toggle('is-queued',!u.enemy&&editable()&&!busy&&!!u.queued);
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
function highlightTargets(){const u=current(),a=u?actionFor(u):null,ts=editable()&&commandOpen&&a?ensureTarget(u,a):[],valid=new Set(ts.map(t=>t.id)),chosen=targetMode?.previewId??(!targetMode&&u?getDraft(u).targetId:null);nodes.forEach((el,id)=>{el.classList.toggle('target-valid',valid.has(id));el.classList.toggle('target-selected',valid.has(id)&&id===chosen);el.classList.toggle('target-confirm',!!targetMode&&valid.has(id)&&id===targetMode.previewId);el.classList.toggle('target-unavailable',editable()&&commandOpen&&!valid.has(id)&&((a?.target==='ally'&&el.classList.contains('ally-unit'))||(a?.target!=='ally'&&el.classList.contains('enemy-unit'))));el.setAttribute('aria-pressed',String(valid.has(id)&&id===chosen))});const eg=$('enemyGrid'),ag=$('allyGrid'),enemyCells=[...(eg?.querySelectorAll('.stage-cell')||[])],allyCells=[...(ag?.querySelectorAll('.stage-cell')||[])];for(const g of [eg,ag])g?.classList.remove('targeting-board');for(const c of [...enemyCells,...allyCells]){c.classList.remove('target-zone','target-selected-zone','target-muted');c.removeAttribute('data-target-id');c.onclick=null}if(!targetMode||!u||!a)return;const grid=a.target==='ally'?ag:eg,cells=a.target==='ally'?allyCells:enemyCells;grid?.classList.add('targeting-board');for(const c of cells)c.classList.add('target-muted');for(const t of ts){let ri,ci;if(t.enemy){ri=t.row==='front'?2:t.row==='back'?0:1;ci=col(t)-1}else{ri=({front:0,mid:1,rear:2}[t.rank]??0);ci=col(t)-1}const c=cells[ri*3+ci];if(!c)continue;c.classList.remove('target-muted');c.classList.add('target-zone');if(t.id===chosen)c.classList.add('target-selected-zone');c.dataset.targetId=t.id;c.onclick=()=>cardTap(t.id)}}
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
  {
   const frameSrc=isNext?ORDER_FRAMES.next:(u.enemy?ORDER_FRAMES.enemy:ORDER_FRAMES.ally);
   b.innerHTML='<span class="order-portrait-clip">'+orderPortraitMarkup(u)+'</span><img class="order-frame" src="'+frameSrc+'" alt="" aria-hidden="true" draggable="false">';
  }
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
 const box=$('actorArt');box.classList.toggle('dim',!show);
 $('commandPanel').classList.toggle('enemy-action',busy&&!show);
 if(show&&box.dataset.actorId!==who.id){
  box.dataset.actorId=who.id;
  const art=document.createElement('img');
  art.className='actor-portrait-image';
  art.alt='';
  art.decoding='async';
  art.src=ACTOR_PORTRAITS[who.id]||ORDER_PORTRAITS[who.id]||'';
  const label=document.createElement('span');
  label.className='actor-art-name';
  label.textContent=who.name||'';
  box.replaceChildren(art,label);
  box.classList.remove('is-entering');void box.offsetWidth;box.classList.add('is-entering');
 }else if(show){
  const label=box.querySelector('.actor-art-name');
  if(label)label.textContent=who.name||'';
 }
 $('actorName').textContent=over?'':who?.name||'';
}
function render(){
 if(editable()&&phase==='command'&&!busy){const cur=current();if(!cur?.alive||cur.queued){const auto=fastestPendingIndex();if(auto>=0){idx=auto;commandOpen=true}}}
 renderCards();renderOrder();updatePortrait();
 if(window.SanctuaryView)window.SanctuaryView.sync(party,enemies,{busy,over,commandOpen,displayActorId,activeTurnId,actorId:current()?.id,battlefield,prepMode,boss:!!EXPCTX?.boss});
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
 const terrainTags=(EXPCTX?.terrainTags||battlefield?.terrainTags||[]).map(x=>terrainApi()?.terrainName?.(x)||x);$('terrainEffect').textContent=(EXPCTX?.place?EXPCTX.place+' · ':'')+(terrainTags.join(' / ')||terrain.name);$('terrainButton').title=terrainTags.join(' / ')+' · '+terrain.desc;
 $('pace').textContent=['1×','1.4×','2.5×'][paceIndex];
 $('pace').title=paceOptions[paceIndex].name;
 $('pace').setAttribute('aria-label','再生速度：'+paceOptions[paceIndex].name+'。押すと変更');
 syncActionDescription();
 $('pause').innerHTML=icon(paused?'play':'pause');
 $('pause').setAttribute('aria-label',paused?'再開':'一時停止');
 $('pause').setAttribute('aria-pressed',String(paused));
 $('cancelTarget').hidden=!targetMode;
 $('commandPanel').classList.toggle('targeting',!!targetMode);
 if(!editable())return;
 const u=current(),a=actionFor(u);ensureTarget(u,a);const t=defaultTarget(u,a);
 const n=normal(u),reason=unavailable(u,n);
 for(const id of ['attack','skills','defend','swap'])$(id).classList.toggle('is-active',id===commandFocus);
 $('attack').disabled=!!reason;
 $('attack').title=reason||u.weapon.name+'で通常攻撃';
 $('attack').querySelector('use').setAttribute('href','#i-'+skillIcon(n));
 $('attack').dataset.icon=skillIcon(n);
 $('swap').disabled=u.status.legBind>0;
 $('switch').title=u.weapon.name+' → '+W[u.weapons[u.wi?0:1]].name;
 $('targetHint').innerHTML=targetMode?esc(a.name)+' →':t?esc(a.kind==='attack'?u.weapon.name:a.name)+' → '+esc(t.name)+(a.heal?'':affinity(t,a.attr)>1?' <strong>✧</strong>':''):'―';
 highlightTargets();
}
function cancelTarget(){if(targetMode){const u=party.find(u=>u.id===targetMode.actorId);if(u)drafts.set(u.id,{...targetMode.previous});targetMode=null;commandFocus=null;render()}}
 function focusCommand(id){if(!editable())return;cancelTarget();commandFocus=id;render()}
function cardTap(id){if(!editable())return;const t=[...party,...enemies].find(u=>u.id===id);if(!t?.alive)return;const u=current(),a=actionFor(u);
 if(targetMode){if(!targets(u,a).some(x=>x.id===id)){if(!t.enemy&&a.target!=='ally'){selectActor(id);return}notify('この行動の対象にはできません');return}if(targetMode.previewId!==id){getDraft(u).targetId=id;targetMode.previewId=id;render();return}targetMode=null;closeSheet();queue();return}
 if(t.enemy){if(!commandOpen)return;if(!targets(u,a).some(x=>x.id===id)){notify('この行動は届きません。遠距離スキルや換装を選択。');return}if(commandFocus==='attack'&&a.kind==='attack'){const previous={...getDraft(u)};getDraft(u).targetId=id;targetMode={actorId:u.id,key:'attack',previous,previewId:id};render();return}getDraft(u).targetId=id;if(u.queued&&['attack','skill'].includes(u.queued.type)&&u.queued.action?.target!=='ally')u.queued.targetId=id;render();return}toggleActor(id)}
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
function selectActor(id){const i=party.findIndex(u=>u.id===id&&u.alive);if(i<0||!editable())return;cancelTarget();const u=party[i];if(u.queued){u.queued=null;u.defending=false}idx=i;if(prepMode){phase='prep';commandOpen=false;render();return}phase='command';commandOpen=true;getDraft(u).key='attack';commandFocus='attack';render()}
function advance(){targetMode=null;const next=fastestPendingIndex();if(next>=0){idx=next;phase='command';commandOpen=true;commandFocus='attack';render();return}phase='ready';commandOpen=false;render();setTimeout(()=>{if(editable()&&live(party).length&&live(party).every(u=>u.queued))resolve()},0)}
function queue(){if(!editable())return;const u=current(),a=actionFor(u),reason=unavailable(u,a);if(reason){notify(reason);return}ensureTarget(u,a);u.defending=false;u.queued={type:a.kind==='attack'?'attack':'skill',action:a,targetId:getDraft(u).targetId};advance()}
function attack(){if(!editable())return;cancelTarget();const u=current(),previous={...getDraft(u)};getDraft(u).key='attack';const a=normal(u),reason=unavailable(u,a);if(reason){notify(reason);return}ensureTarget(u,a);commandFocus='attack';targetMode={actorId:u.id,key:'attack',previous,previewId:null};render()}
function simpleCommand(type){if(!editable())return;cancelTarget();const u=current();if(type==='escape'&&u.status.legBind>0){notify('脚封じで行動できません');return}u.defending=type==='defend';u.queued={type};commandFocus=type==='defend'?'defend':null;advance()}
function queueMove(rank,gridCol){
 if(!editable())return;
 const u=current();if(!u)return;
 if(u.status.legBind>0&&!prepMode){notify('脚封じで移動できません');return}
 if(u.rank===rank&&col(u)===gridCol){closeSheet();return}
 if(!prepMode&&gridCol!==col(u)){notify('通常移動は同じ縦列のみです');return}
 const dist=Math.abs(RANKS.indexOf(u.rank)-RANKS.indexOf(rank));if(!prepMode&&dist>terrainMoveLimit(u)){notify('この地形ではそこまで移動できません');return}
 const other=live(party).find(x=>x.id!==u.id&&x.rank===rank&&col(x)===gridCol);
 if(prepMode){const oldRank=u.rank,oldCol=col(u);if(other){other.rank=oldRank;other.gridCol=oldCol;syncLegacyRow(other)}u.rank=rank;u.gridCol=gridCol;syncLegacyRow(u);persistBattlefield();render();if(window.updateFormationBoard)window.updateFormationBoard();return}
 u.defending=false;u.queued={type:'move',rank,gridCol,swapId:other?.id||null};closeSheet();advance();
}
const sheet=$('choiceSheet');
function closeSheet(){if(sheet.open)sheet.close()}
function effectText(a){const out=[];if(a.heal)out.push('HP回復');else out.push('威力 ×'+a.mult);for(const[k,n]of STATUS)if(a[k])out.push(n+' 基礎'+a[k]+'%');if(a.critBonus)out.push('会心率＋'+a.critBonus);return out.join(' / ')}
function syncActionDescription(){const box=$('actionDescription');if(!box)return;const u=current(),a=targetMode&&u?actionFor(u,targetMode.key):null;box.hidden=!a;if(!a)return;$('actionTitle').textContent=a.name;$('actionEffect').textContent=scopeName(a)+' · '+rangeName(a.range)+' · '+effectText(a)}
function chooseSkill(key){if(!editable())return;const u=current(),a=actionFor(u,key),reason=unavailable(u,a);if(reason){notify(reason);return}const previous=targetMode?.actorId===u.id?targetMode.previous:{...getDraft(u)};getDraft(u).key=key;ensureTarget(u,a);commandFocus='skills';targetMode={actorId:u.id,key,previous,previewId:null};closeSheet();render()}
function openSheet(mode='skills'){sheet.dataset.mode=mode;
 if(!editable()&&!['more','terrain','history'].includes(mode))return;
 if(editable()){cancelTarget();if(mode==='skills')commandFocus='skills';}
 const u=current();
 $('sheetKicker').textContent=mode==='formation'?u.name:'';
 $('sheetTitle').textContent={skills:'',formation:'FORMATION',members:'仲間',more:'設定',terrain:terrain.name,history:'履歴'}[mode]||'';
 if(mode==='skills'){sheet.removeAttribute('aria-labelledby');sheet.setAttribute('aria-label','スキル一覧')}else{sheet.setAttribute('aria-labelledby','sheetTitle');sheet.removeAttribute('aria-label')}
 $('closeSheet').textContent=mode==='skills'?'取消':'×';
 $('closeSheet').setAttribute('aria-label',mode==='skills'?'選択をキャンセル':'閉じる');
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
    const pv=movePreview(u,rank,c);b.setAttribute('aria-label',RANK_LABEL[rank]+' '+c+(occ?' '+occ.name:' 空き')+'。'+pv);b.title=pv;
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
  const tags=EXPCTX?.terrainTags||battlefield?.terrainTags||[];const p=document.createElement('p');p.className='terrain-detail';p.textContent=(EXPCTX?.place?EXPCTX.place+' / ':'')+(tags.length?tags.map(x=>terrainApi()?.terrainName?.(x)||x).join('・'):terrain.name)+'\n'+terrain.desc;list.append(p);
  if(terrainFocus){const d=document.createElement('p');d.className='terrain-detail selected-tile';d.textContent=terrainFocus.name+'\n'+terrainFocus.text;list.append(d)}
  if(battlefield?.conditionTerrain){const cond=document.createElement('p');cond.className='terrain-detail condition-terrain';cond.textContent='条件：'+(terrainApi()?.terrainName?.(battlefield.conditionTerrain)||battlefield.conditionTerrain);list.append(cond)}
 }else if(mode==='more'){
  const entries=[['fast','表示速度',()=>{$('pace').click();closeSheet()},false],['restart','新しい戦闘',()=>fresh(),false],['book','履歴',()=>{closeSheet();toggleHistory()},false],['exit','逃走',()=>{closeSheet();simpleCommand('escape')},!editable()||u?.status.legBind>0]];
  for(const [ic,label,fn,disabled]of entries){const b=document.createElement('button');b.type='button';b.className='menu-action';b.innerHTML=icon(ic)+esc(label);b.disabled=disabled;b.addEventListener('click',fn);list.append(b)}
 }else{
  for(const[key,a]of u.skills.map((s,i)=>[String(i),s])){
   const reason=unavailable(u,a),item=document.createElement('div');item.className='skill-item';
   item.style.setProperty('--skill-color',a.heal?'#b5d3b8':a.attr==='火'?'#d9ac92':a.kind==='spell'?'#c7bde0':'#d8c396');
   const b=document.createElement('button');b.type='button';b.className='skill-choice';b.dataset.action=key;b.setAttribute('aria-disabled',String(!!reason));
   b.innerHTML='<span class="skill-line"><b>'+esc(a.name)+'</b></span><span class="cost">'+a.costType+' '+a.cost+'</span>';
   b.setAttribute('aria-label',a.name+'、'+scopeName(a)+'、'+rangeName(a.range)+'、'+(reason||effectText(a))+'、'+a.costType+' '+a.cost);
   b.addEventListener('click',()=>chooseSkill(key));item.append(b);
   list.append(item);
  }
 }
 if(!sheet.open)(mode==='skills'?sheet.show():sheet.showModal());
  if(mode==='skills')render();
}
function toggleHistory(){const h=$('history');h.open=!h.open;$('historyButton').setAttribute('aria-expanded',String(h.open))}
/* Animation, timers, and resets share a session token. */
async function waitRead(text,token,min=1100){skip=false;let remaining=Math.min(3200,Math.max(min,680+[...text].length*42))*paceOptions[paceIndex].scale,last=performance.now();while(remaining>0){check(token);await new Promise(r=>setTimeout(r,35));check(token);const now=performance.now();if(skip)break;if(!paused){remaining-=now-last}last=now}skip=false}
function clearEffects(){nodes.forEach(el=>el.classList.remove('battle-acting','battle-heal','battle-switch'))}
function floating(id,value,kind='damage',label=''){const el=nodes.get(id);if(!el)return;el.querySelectorAll('.floating').forEach(x=>x.remove());const f=document.createElement('span');f.className='floating'+(kind==='heal'?' heal':'');f.innerHTML=(label?'<small>'+esc(label)+'</small>':'')+esc((kind==='heal'?'+':'−')+value);el.append(f);setTimeout(()=>f.remove(),1250)}
async function say(text,token,cls='',visual=null,history=true){check(token);clearEffects();$('battleMessage').className='battle-message '+cls;$('battleMessageText').textContent=text;if(history)log(text,cls);if(visual?.actorId)nodes.get(visual.actorId)?.classList.add('battle-acting');if(visual?.targetId){const target=nodes.get(visual.targetId);if(visual.heal)target?.classList.add('battle-heal');else if(target){target.classList.remove('battle-hit');void target.offsetWidth;target.classList.add('battle-hit');const sequence=Number(target.dataset.hitSequence||0)+1;target.dataset.hitSequence=String(sequence);setTimeout(()=>{if(target.dataset.hitSequence===String(sequence))target.classList.remove('battle-hit')},1250)}if(visual.value!==undefined)floating(visual.targetId,visual.value,visual.heal?'heal':'damage',visual.label||'')}await waitRead(text,token)}
function setBattle(on){$('commandPanel').classList.toggle('resolving',on);$('commandInput').hidden=on;$('battleMessage').hidden=!on;$('pause').hidden=!on;if(!on){$('battleMessageText').textContent='';clearEffects()}}
async function animateSwap(a,b,text,token){check(token);clearEffects();displayActorId=(b.alive&&!b.enemy?b.id:!a.enemy?a.id:null);activeTurnId=displayActorId;updatePortrait();const before=new Map([a,b].map(u=>[u.id,nodes.get(u.id).getBoundingClientRect()]));const row=a.row,slot=a.slot;a.row=b.row;a.slot=b.slot;b.row=row;b.slot=slot;render();$('battleMessage').className='battle-message sys';$('battleMessageText').textContent=text;log(text,'sys');const animations=[];for(const[u,i]of [[a,0],[b,1]]){const el=nodes.get(u.id),from=before.get(u.id),to=el.getBoundingClientRect(),dx=from.left-to.left,dy=from.top-to.top,w=i?3:-3;el.classList.add('moving');el.style.transformOrigin='top left';const sx=from.width/to.width,sy=from.height/to.height;const frames=[{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,offset:0},{transform:`translate(${dx*.72+w}px,${dy*.72}px) rotate(${i?.7:-.7}deg)`,offset:.28},{transform:`translate(${dx*.4-w}px,${dy*.4}px) rotate(${i?-.7:.7}deg)`,offset:.6},{transform:'translate(0,0) rotate(0deg)',offset:1}];if(typeof el.animate==='function'){const anim=el.animate(reduced?[{opacity:.7},{opacity:1}]:frames,{duration:reduced?100:1100*paceOptions[paceIndex].scale,easing:'linear',fill:'both'});activeAnimations.add(anim);animations.push(anim.finished.catch(()=>{}).then(()=>{anim.cancel();activeAnimations.delete(anim);el.classList.remove('moving');el.style.transformOrigin=''}))}else el.classList.remove('moving')}await Promise.all(animations);check(token);await waitRead(text,token,350)}
async function switchWeapon(){if(!editable())return;cancelTarget();const token=session,u=current();displayActorId=u.id;activeTurnId=u.id;busy=true;closeSheet();setBattle(true);u.wi=u.wi?0:1;u.weapon=W[u.weapons[u.wi]];render();nodes.get(u.id)?.classList.add('battle-switch');$('playbackTitle').textContent='換装';$('battleMessageText').textContent=u.name+'は'+u.weapon.name+'へ換装！';try{await waitRead($('battleMessageText').textContent,token,850)}catch(e){if(e!==CANCEL)throw e}finally{if(token===session){busy=false;setBattle(false);render()}}}
function affinity(t,attr){return t.weak?.[attr]??t.resist?.[attr]??1}
function hit(a,t,act){if(t.status.legBind>0)return 100;return clamp(90+(a.SKL-t.SKL)*.5+(act.hit||0)+(act.kind==='spell'?0:(a.weapon?.hit||0)+terrain.wHit(a.weapon))+terrainHitBonus(a,t,act),30,100)}
function attackValue(a,act){let v;if(act.kind==='attack')v=(a.weapon?.power||0)+(a.weapon?.normal==='SKL'?a.SKL:a.PHY);else if(act.stat==='ARC')v=14+a.ARC;else if(act.stat==='MND')v=12+a.MND;else if(act.stat==='SKL')v=(a.weapon?.power||0)+a.SKL;else if(act.stat==='MIX')v=(a.weapon?.power||0)+.5*a.PHY+.5*a.ARC;else v=(a.weapon?.power||0)+a.PHY;const tune=!a.enemy&&act.kind!=='spell'?Number(EXPCTX?.fieldEffects?.weaponTune||0):0;return tune?v*(1+.05*(tune+1)):v}
function damage(a,t,act){const magic=act.kind==='spell'||['ARC','MND'].includes(act.stat),def=magic?t.magDef:t.physDef,crit=Math.random()*100<clamp(5+(a.SKL-t.SKL)/4+(act.critBonus||0),0,50),aff=affinity(t,act.attr);let terrainMult=1;if(act.kind==='attack'&&a.weapon?.range==='far'&&(terrain.name!=='高台'||a.row==='back'))terrainMult=terrain.ranged;terrainMult*=1+terrainDamageMod(a,t,act);const value=Math.floor(attackValue(a,act)*(act.mult??1)*100/(100+def)*aff*(crit?1.5:1)*terrainMult*(.95+Math.random()*.1)*(t.defending?.5:1));return{value:aff===0?0:Math.max(1,value),crit,weak:aff>1}}
function speed(u,q){if(u.status.legBind>0)return-999;const opening=round===1,fx=EXPCTX?.fieldEffects||{},tile=unitTerrain(u).effect,tileSpeed=(tile.speed||0)*u.SKL;if(u.enemy)return u.SKL+tileSpeed+(u.spell?.speed||0)+(opening&&fx.enemyAmbush?20:0);const a=q?.action||normal(u),first=opening&&fx.firstStrike?10+5*Number(fx.firstStrike):0,ambush=opening&&fx.enemyAmbush?-15:0;return u.SKL+tileSpeed+(a.speed||0)+(a.kind==='spell'?0:(u.weapon?.speed||0)+terrain.wSpeed(u.weapon))+first+ambush}
async function defeated(u,token){
 if(u.hp>0||!u.alive)return;
 u.hp=0;u.alive=false;render();await say(u.name+'は戦闘不能。',token,'sys');
 if(!u.enemy)return;
 const c=col(u),used=replacementUsed.enemies;
 if(u.row!=='front'||used.has(c))return;
 used.add(c);const reserve=live(enemies).find(x=>x.row==='back'&&col(x)===c);
 if(reserve)await animateSwap(u,reserve,reserve.name+'が前列へ交代。',token);
}
async function applyStatuses(a,t,act,token){if(t.hp<=0)return;if(!a.enemy&&EXPCTX?.fieldEffects?.poisonTool&&act.kind==='attack'&&!act.poison&&Math.random()*100<30){t.status.poison=Math.max(t.status.poison||0,3);render();await say(t.name+'に猛毒！',token,'sys')}for(const[k,n]of STATUS){if(!act[k])continue;let st=k==='stun'?a.PHY:a.SKL;if(act.stat==='ARC')st=a.ARC;if(act.stat==='MND')st=a.MND;if(Math.random()*100<clamp(act[k]+.75*(st-t.MND)+terrainStatusDelta(a,t,k),5,95)){t.status[k]=k==='poison'?3:k==='stun'?1:2;render();await say(t.name+'に'+n+'！',token,'sys')}}}
function affectedTargets(a,primary,candidates){
 const scope=a.scope||'single';
 if(scope==='all')return candidates;
 if(scope==='row')return candidates.filter(t=>(t.enemy?t.row:t.rank)===(primary.enemy?primary.row:primary.rank));
 if(scope==='pierce')return candidates.filter(t=>col(t)===col(primary));
 if(scope==='adjacent')return candidates.filter(t=>(t.enemy?t.row:t.rank)===(primary.enemy?primary.row:primary.rank)&&Math.abs(col(t)-col(primary))<=1);
 if(scope==='random')return [primary,...candidates.filter(t=>t!==primary).sort(()=>Math.random()-.5)].slice(0,Math.min(candidates.length,a.count||2));
 return [primary];
}
async function execute(u,q,token){check(token);if(!u.alive)return;displayActorId=u.id;activeTurnId=u.id;render();if(u.status.stun>0){await say(u.name+'は気絶して動けない。',token,'sys');return}if(q.type==='escape'){if(u.status.legBind>0){await say(u.name+'は脚封じで逃走できない。',token,'sys');return}await say(u.name+'は逃走を試みた！',token,'',{actorId:u.id},false);const p=live(party),e=live(enemies),avg=x=>x.reduce((s,v)=>s+v.SKL,0)/x.length;if(Math.random()*100<clamp(55+(avg(p)-avg(e))*.7+Number(EXPCTX?.fieldEffects?.escapeBonus||0),20,95)){await finish('escape',token);return}await say('逃走できなかった。',token,'bad');return}
 const a=q.type==='attack'?normal(u):q.action;if(a.kind==='spell'&&u.status.headBind>0){await say(u.name+'は頭封じで術を使えない。',token,'sys');return}if(!enough(u,a)){await say(u.name+'は'+a.costType+'不足。',token,'sys');return}const ts=u.enemy?live(party).filter(t=>canReach(u,t,a.range)):targets(u,a),t=ts.find(t=>t.id===q.targetId)||ts[0];if(!t){await say(u.name+'の攻撃は届かない。',token,'sys');return}
 const intro=a.kind==='attack'?u.name+'の攻撃！':u.name+'は「'+a.name+'」を'+(a.kind==='spell'?'唱えた！':'使った！');
 $('playbackTitle').textContent=u.name;
 await say(intro,token,'',{actorId:u.id},false);
 if(a.costType)u[a.costType.toLowerCase()]-=terrainActionCost(u,a);
 // Resolve every affected unit separately so damage, portrait and feedback stay in sync.
 for(const victim of affectedTargets(a,t,ts)){
  check(token);
  if(!victim.alive)continue;
  if(a.heal){const n=Math.min(victim.maxHp-victim.hp,Math.max(1,Math.floor((12+u.MND*.8)*(1+terrainHealMod(victim)))));victim.hp+=n;render();await say(victim.name+'のHPが '+n+' 回復。',token,'ok',{targetId:victim.id,heal:true,value:n});continue}
  if(Math.random()*100>hit(u,victim,a)){render();await say(victim.name+'は攻撃をかわした！',token,'sys');continue}
  const d=damage(u,victim,a);
  victim.hp=Math.max(0,victim.hp-d.value);
  if(!victim.enemy){displayActorId=victim.id;updatePortrait()}
  render();
  await say(victim.name+'に '+d.value+' ダメージ！'+(d.weak?'\n弱点を突いた！':'')+(d.crit?'\n会心の一撃！':''),token,u.enemy?'bad':d.weak?'ok':'',{targetId:victim.id,value:d.value,label:d.crit?'CRITICAL':d.weak?'WEAK':''});
  await maybeBossTerrainPhase(victim,token);
  await applyStatuses(u,victim,a,token);
  if(victim.alive&&(a.push||a.pull))await terrainForceMove(victim,a.push?'back':'front',Math.max(Number(a.push)||0,Number(a.pull)||0,1),token);
  await defeated(victim,token);
 }
}
async function finish(type,token){if(over)return;over=true;phase='done';render();if(EXPCTX){EXPCTX.result=type;EXPCTX.battlefield=battlefield;EXPCTX.vitals=HT.map((source,i)=>{const old=EXPCTX.vitals?.[i]||{},u=party.find(x=>x.id===source.id);return u?{...old,hp:Math.max(0,u.hp),sp:Math.max(0,u.sp),mp:Math.max(0,u.mp),status:{...(old.status||{}),...u.status}}:old});RPG_STORE.setItem('rpg.exploreBattle',JSON.stringify(EXPCTX));$('returnExplore').hidden=false}const text={win:'勝利',lose:'敗北',escape:'撤退成功'}[type];await say(text,token,type==='win'?'ok':type==='lose'?'bad':'sys');$('history').dataset.result=type}
async function checkEnd(token){if(over)return true;if(!live(enemies).length){await finish('win',token);return true}if(!live(party).length){await finish('lose',token);return true}return false}
async function resolve(){if(!editable()||!live(party).every(u=>u.queued))return;cancelTarget();commandOpen=false;const token=session;displayActorId=null;activeTurnId=null;turnSequence=[];busy=true;phase='resolve';paused=false;skip=false;closeSheet();setBattle(true);render();try{
 for(const u of live(party)){
  if(u.queued.type!=='move'||u.status.legBind>0)continue;
  const q=u.queued,oldRank=u.rank,oldCol=col(u);
  const other=party.find(x=>x.id!==u.id&&x.rank===q.rank&&col(x)===q.gridCol);
  if(other){other.rank=oldRank;other.gridCol=oldCol;syncLegacyRow(other)}
  u.rank=q.rank;u.gridCol=q.gridCol;syncLegacyRow(u);
  displayActorId=u.id;activeTurnId=u.id;render();
  persistBattlefield();await say(u.name+'が '+RANK_LABEL[u.rank]+' '+u.gridCol+' へ移動。'+(movePreview(u,u.rank,u.gridCol)!=='地形変化なし'?' '+movePreview(u,u.rank,u.gridCol):''),token,'sys',{actorId:u.id});
 }
 for(const u of live(party).filter(u=>u.defending)){displayActorId=u.id;activeTurnId=u.id;render();await say(u.name+'は身を守っている。',token,'sys',{actorId:u.id})}
 const order=[...live(party).filter(u=>!['swap','move','defend'].includes(u.queued.type)).map(u=>({u,q:u.queued,s:speed(u,u.queued)})),...live(enemies).map(u=>({u,q:null,s:speed(u,null)}))].sort((a,b)=>b.s-a.s);
 turnSequence=order.map(e=>e.u.id);renderOrder();
 for(const entry of order){check(token);if(!entry.u.alive)continue;let q=entry.q;if(entry.u.enemy){const a=entry.u.spell||normal(entry.u),mv=enemyMovePlan(entry.u,a);if(mv){await executeEnemyMove(entry.u,mv,token);if(await checkEnd(token))break;continue}const ts=live(party).filter(t=>canReach(entry.u,t,a.range)),t=entry.u.ai==='archer'?[...ts].sort((a,b)=>a.hp-b.hp)[0]:ts[Math.floor(Math.random()*ts.length)];q={type:a.kind==='attack'?'attack':'skill',action:a,targetId:t?.id}}await execute(entry.u,q,token);if(await checkEnd(token))break}
 if(!over){for(const u of [...party,...enemies]){check(token);if(!u.alive)continue;await terrainRoundEffect(u,token);if(!u.alive)continue;if(u.status.poison>0){displayActorId=null;activeTurnId=null;const n=Math.max(1,Math.floor(u.maxHp*.04));u.hp=Math.max(0,u.hp-n);render();await say(u.name+'は猛毒で '+n+' ダメージ。',token,'bad',{targetId:u.id,value:n});await defeated(u,token)}for(const[k]of STATUS)if(u.status[k]>0)u.status[k]--}terrainApi()?.decayTempTiles?.(battlefield);persistBattlefield();if(!await checkEnd(token)){for(const u of [...party,...enemies]){u.queued=null;u.defending=false}round++;idx=party.reduce((best,u,i)=>u.alive&&(best<0||speed(u,null)>speed(party[best],null))?i:best,-1);commandOpen=idx>=0;phase='command';log('―― Round '+round+' ――','sys')}}
 }catch(e){if(e!==CANCEL){console.error(e);notify('戦闘処理でエラーが発生しました。新しい戦闘で再開してください。');over=true;phase='done'}}finally{if(token===session){busy=false;paused=false;displayActorId=null;activeTurnId=null;turnSequence=[];setBattle(false);render()}}}
function autoRound(){if(!editable())return;cancelTarget();const policy=EXPCTX?.autoPolicy||'ガンガン使う';for(const u of live(party)){if(u.queued)continue;const wounded=live(party).filter(x=>x.hp/x.maxHp<.55).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(policy==='命を大事に'&&wounded){const heal=u.skills.find(s=>s.heal&&s.target==='ally'&&!unavailable(u,s)&&targets(u,s).includes(wounded));if(heal){u.queued={type:'skill',action:heal,targetId:wounded.id};u.defending=false;continue}if(u.hp/u.maxHp<.35){u.queued={type:'defend'};u.defending=true;continue}}if(policy==='ガンガン使う'){const s=u.skills.find(s=>s.target==='enemy'&&!unavailable(u,s));if(s){u.queued={type:'skill',action:s,targetId:targets(u,s)[0].id};u.defending=false;continue}}const a=normal(u),t=targets(u,a)[0];if(t){u.queued={type:'attack',action:a,targetId:t.id};u.defending=false;continue}u.queued={type:'defend'};u.defending=true}phase='ready';render();resolve()}
function fresh(randomTerrain=true){session++;displayActorId=null;activeTurnId=null;turnSequence=[];commandOpen=false;for(const anim of activeAnimations)anim.cancel();activeAnimations.clear();closeSheet();clearEffects();nodes.clear();for(const id of ['eb','ef','partyStrip'])$(id).replaceChildren();drafts.clear();replacementUsed.party.clear();replacementUsed.enemies.clear();party=HT.map(u=>initUnit(u));enemies=ET.map(u=>initUnit(u,true));terrain=TERRAINS[randomTerrain?Math.floor(Math.random()*TERRAINS.length):0];battlefield=null;prepMode=false;applyExploreContext();if(!battlefield&&terrainApi()){const place={placeType:'分岐路',primaryTerrain:'TR10',secondaryTerrains:[],conditionTerrain:null,terrainTags:['TR10'],fieldTags:[],battleOverlay:false};battlefield=terrainApi().createBattlefield(place,12345,'normal','森林')}round=1;idx=party.reduce((best,u,i)=>u.alive&&(best<0||speed(u,null)>speed(party[best],null))?i:best,-1);phase=prepMode?'prep':'command';commandOpen=!prepMode&&idx>=0;busy=false;over=false;paused=false;skip=false;targetMode=null;commandFocus='attack';logCount=0;clearTimeout(noticeTimer);$('pause').innerHTML=icon('pause');$('pause').setAttribute('aria-pressed','false');$('log').replaceChildren();$('history').open=false;delete $('history').dataset.result;$('notice').hidden=true;setBattle(false);log('戦闘開始 · '+terrain.name,'sys');render()}
$('returnExplore')?.addEventListener('click',()=>{location.href=RPG_NAV.href('exploration/index.html?resume=1',['rpg.exploreBattle','rpg.exploration.save'+(RPG_STORE.getItem('rpg.exploration.activeSlot')==='2'?2:1),'rpg.exploration.activeSlot'])});$('new').addEventListener('click',()=>fresh());$('actor').addEventListener('click',()=>openSheet('members'));$('skills').addEventListener('click',()=>openSheet());$('more').addEventListener('click',()=>openSheet('more'));$('closeSheet').addEventListener('click',closeSheet);sheet.addEventListener('click',e=>{const r=sheet.getBoundingClientRect();if(e.target===sheet&&(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right))closeSheet()});$('attack').addEventListener('click',attack);$('swap').addEventListener('click',()=>openSheet('formation'));$('defend').addEventListener('click',()=>simpleCommand('defend'));$('switch').addEventListener('click',switchWeapon);$('resolve').addEventListener('click',resolve);$('auto').addEventListener('click',autoRound);$('cancelTarget').addEventListener('click',cancelTarget);$('pause').addEventListener('click',()=>{paused=!paused;$('pause').innerHTML=icon(paused?'play':'pause');$('pause').setAttribute('aria-label',paused?'再開':'一時停止');$('pause').setAttribute('aria-pressed',String(paused));for(const anim of activeAnimations)paused?anim.pause():anim.play();$('actorJob').textContent=''});$('pace').addEventListener('click',()=>{paceIndex=(paceIndex+1)%3;$('pace').textContent=['1×','1.4×','2.5×'][paceIndex];$('pace').title=paceOptions[paceIndex].name;try{localStorage.setItem('rpg.pace.v31',paceIndex)}catch(_){}});$('history').addEventListener('toggle',()=>{$('historyButton').setAttribute('aria-expanded',String($('history').open));if($('history').open)$('log').scrollTop=$('log').scrollHeight});$('historyButton').addEventListener('click',toggleHistory);$('terrainButton').addEventListener('click',()=>openSheet('terrain'));
$('cancelActionDescription').addEventListener('click',cancelTarget);
$('enemyStage').addEventListener('click',e=>{if(!e.target.closest('.enemy-unit'))closeCommands()});
$('closeCommand').addEventListener('click',closeCommands);
$('closeHistory').addEventListener('click',()=>{if($('history').open)toggleHistory()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.open&&editable())closeCommands()});
if(typeof ResizeObserver==='function')new ResizeObserver(fitScene).observe($('enemyStage'));
window.addEventListener('resize',fitScene);
fresh(false);document.documentElement.dataset.ready='true';$('bootStatus')?.remove();$('engineStatus').classList.add('ready');$('engineStatus').title='JavaScript動作中 · UI v44';
function startPreparedBattle(){if(!prepMode)return;prepMode=false;phase='command';idx=party.reduce((best,u,i)=>u.alive&&(best<0||speed(u,null)>speed(party[best],null))?i:best,-1);commandOpen=idx>=0;persistBattlefield();render();closeSheet()}
window.RPGDemo={version:'52-terrain',focusCommandUI:(id)=>focusCommand(id),selectActorUI:(id)=>selectActor(id),moveActorUI:(rank,c)=>queueMove(rank,c),startPreparedBattle,showTileUI:setTerrainFocus,triggerTerrainEvent:triggerBossTerrainEvent,snapshot:()=>({round,phase,busy,over,commandOpen,prepMode,boss:!!EXPCTX?.boss,targetMode:targetMode?.key||null,active:current()?.id,battlefield:JSON.parse(JSON.stringify(battlefield||{})),party:party.map(u=>({id:u.id,hp:u.hp,sp:u.sp,mp:u.mp,row:u.row,rank:u.rank,col:col(u),slot:u.slot,queued:u.queued?.type||null,target:u.queued?.targetId,weapon:u.weapon.name})),enemies:enemies.map(u=>({id:u.id,hp:u.hp,row:u.row,slot:u.slot}))})};
if(window.__RPG_TEST__)window.__test={get units(){return{party,enemies}},fresh,render,defeated,animateSwap,resolve,autoRound,selectActor,toggleActor,closeCommands,openSheet,simpleCommand,getDraft,chooseSkill,attack,canReach,cancelTarget,setPace:i=>{paceIndex=i},runDeath:async u=>{displayActorId=null;busy=true;setBattle(true);await defeated(u,session);busy=false;setBattle(false);render()}};
})();


 let cardMoveMode=false;const partyBoard=$('partyStrip');
 const syncMoveState=()=>partyBoard?.classList.toggle('move-mode',cardMoveMode);
 const clearMoveMode=()=>{cardMoveMode=false;syncMoveState()};
 const ensureMoveCells=()=>{if(!partyBoard||partyBoard.querySelector('.plan-move-layer'))return;const layer=document.createElement('div');layer.className='plan-move-layer';for(let r=1;r<=3;r++)for(let c=1;c<=3;c++){const b=document.createElement('button');b.type='button';b.className='plan-move-cell';b.dataset.rank=['front','mid','rear'][r-1];b.dataset.col=String(c);b.style.gridRow=String(r);b.style.gridColumn=String(c);b.addEventListener('click',e=>{if(!cardMoveMode)return;e.preventDefault();e.stopPropagation();window.RPGDemo?.moveActorUI?.(b.dataset.rank,Number(b.dataset.col));clearMoveMode()});layer.append(b)}partyBoard.prepend(layer)};
 new MutationObserver(ensureMoveCells).observe(partyBoard,{childList:true});ensureMoveCells();
 partyBoard?.addEventListener('click',e=>{const card=e.target.closest('.ally-unit');if(!card)return;const snap=window.RPGDemo?.snapshot?.();if(!snap||snap.busy||snap.over||snap.targetMode)return;const id=card.dataset.unitId,target=snap.party.find(x=>x.id===id);if(!target)return;e.preventDefault();e.stopImmediatePropagation();if(cardMoveMode){if(id===snap.active){clearMoveMode();return}window.RPGDemo?.moveActorUI?.(target.rank,target.col);clearMoveMode();return}if(id===snap.active){cardMoveMode=true;syncMoveState();return}window.RPGDemo?.selectActorUI?.(id);clearMoveMode()},true);
 const itemBtn=$('swap');itemBtn?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();clearMoveMode();window.RPGDemo?.focusCommandUI?.('swap');const sheet=$('choiceSheet'),list=$('sheetList');sheet.dataset.mode='items';sheet.removeAttribute('aria-labelledby');sheet.setAttribute('aria-label','道具一覧');$('sheetKicker').textContent='';$('sheetTitle').textContent='';$('closeSheet').textContent='取消';$('closeSheet').setAttribute('aria-label','選択をキャンセル');$('sheetHint').textContent='';list.replaceChildren();for(const [name,desc,fn] of [['回復薬','HPを40回復',()=>sheet.close()],['解毒薬','猛毒を解除',()=>sheet.close()],['換装','予備武器に持ち替える',()=>{sheet.close();$('switch').click()}]]){const b=document.createElement('button');b.type='button';b.className='menu-action';b.setAttribute('aria-label',name+'、'+desc);b.textContent=name;b.addEventListener('click',fn);list.append(b)}if(!sheet.open)sheet.show()},true);
 document.addEventListener('click',e=>{const sheet=$('choiceSheet');if(sheet.open&&['skills','items'].includes(sheet.dataset.mode)&&!sheet.contains(e.target)&&!e.target.closest('#skills,#swap'))sheet.close()});
 const openPlanBook=e=>{e?.preventDefault();e?.stopImmediatePropagation();clearMoveMode();const sheet=$('choiceSheet'),list=$('sheetList');$('sheetKicker').textContent='';$('sheetTitle').textContent='BOOK';$('sheetHint').textContent='';list.replaceChildren();const help=document.createElement('button');help.type='button';help.className='menu-action';help.innerHTML='<span>操作の説明<small>戦闘操作・移動・対象選択</small></span>';help.addEventListener('click',()=>{list.innerHTML='<div class="plan-help"><b>基本操作</b><p>味方カードをタップして操作キャラを選択。同じカードをもう一度タップすると移動選択になり、空きマスで移動、別の味方カードで位置交換します。</p><p>ATTACK＝攻撃 / SKILL＝技 / ITEM＝道具・換装 / DEFEND＝防御。</p></div>'});const formation=document.createElement('button');formation.type='button';formation.className='menu-action';formation.innerHTML='<span>陣形<small>敵味方の3×3配置を確認・変更</small></span>';formation.addEventListener('click',()=>{sheet.close();$('formationButton').click()});const log=document.createElement('button');log.type='button';log.className='menu-action';log.innerHTML='<span>戦闘履歴<small>これまでの行動を確認</small></span>';log.addEventListener('click',()=>{sheet.close();$('history').open=true});const settings=document.createElement('button');settings.type='button';settings.className='menu-action';settings.innerHTML='<span>設定<small>戦闘表示・速度</small></span>';settings.addEventListener('click',()=>{list.replaceChildren();const speedButton=document.createElement('button');speedButton.type='button';speedButton.className='menu-action';speedButton.innerHTML='<span>戦闘速度<small>右下の速度と同じ設定</small></span>';speedButton.addEventListener('click',()=>{$('pace').click()});const display=document.createElement('button');display.type='button';display.className='menu-action';display.innerHTML='<span>コマンド表記<small>English</small></span>';display.disabled=true;list.append(speedButton,display)});list.append(help,formation,log,settings);if(!sheet.open)sheet.showModal()};$('historyButton')?.addEventListener('click',openPlanBook,true);$('more')?.addEventListener('click',openPlanBook,true);

 const formationSheet=$('formationSheet'),allyFormationBoard=$('allyFormationBoard'),enemyFormationBoard=$('enemyFormationBoard');let prepSelected=null;let prepStart=$('prepStart');if(!prepStart){prepStart=document.createElement('button');prepStart.id='prepStart';prepStart.type='button';prepStart.className='prep-start';prepStart.textContent='そのまま開始';formationSheet.querySelector('.formation-head')?.append(prepStart)}
 const DISPLAY_NAME={war:'ガルド',rog:'リゼ',run:'エルン',ran:'セナ',arc:'ミレア',mys:'ユナ',g1:'白銀騎士',g2:'聖域の番兵',g3:'月影の獣',g4:'白銀騎士B',g5:'聖域の番兵B',arch:'翼竜A',arch2:'翼竜B',arch3:'翼竜C',mage:'星詠み'};
 const ICON_SRC={war:'images/gald.svg',rog:'images/lize.svg',run:'images/ern.svg',ran:'images/sena.svg',arc:'images/mirea.svg',mys:'images/yuna.svg',g1:'images/enemy_guard.svg',g2:'images/enemy_guard.svg',g3:'images/enemy_guard.svg',g4:'images/enemy_guard.svg',g5:'images/enemy_guard.svg',arch:'images/enemy_archer.svg',arch2:'images/enemy_archer.svg',arch3:'images/enemy_archer.svg',mage:'images/enemy_mage.svg'};
 function drawFormationBoard(board,cells,enemy=false,prep=false){
  board.replaceChildren();
  for(const cell of cells){
   const d=document.createElement('div');d.className='form-cell'+(cell.unit?'':' empty')+(enemy?' enemy':'')+(cell.current?' current':'')+(prep&&!enemy?' prep-cell':'');
   if(cell.tile&&cell.tile!=='TL00'){d.dataset.tile=cell.tile;const mark=document.createElement('i');mark.className='form-terrain';mark.textContent=window.RPG_TERRAIN?.TILE_ICON?.[cell.tile]||'';mark.title=cell.tileName||'';d.append(mark)}
   if(cell.unit){
    const img=document.createElement('img');img.className='cell-face';img.src=ICON_SRC[cell.unit.id]||'';img.alt='';d.append(img);
    const n=document.createElement('span');n.className='cell-name';n.textContent=DISPLAY_NAME[cell.unit.id]||cell.unit.id;d.append(n);
   }
   if(prep&&!enemy){d.setAttribute('role','button');d.tabIndex=0;d.addEventListener('click',()=>{if(!prepSelected){if(!cell.unit)return;prepSelected=cell.unit.id;window.RPGDemo?.selectActorUI?.(cell.unit.id);refreshFormationBoard();return}window.RPGDemo?.selectActorUI?.(prepSelected);window.RPGDemo?.moveActorUI?.(cell.rank,cell.col);prepSelected=null;refreshFormationBoard()})}
   d.title=[cell.tileName,cell.tileText].filter(Boolean).join(' · ');board.append(d);
  }
 }
 function refreshFormationBoard(){
  const q=window.RPGDemo.snapshot(),ally=[],foe=[],T=window.RPG_TERRAIN;
  for(const rank of ['front','mid','rear'])for(let c=1;c<=3;c++){const u=q.party.find(x=>x.rank===rank&&x.col===c),ix=T?.cellIndex?.('ally',rank,c),cell=q.battlefield?.cells?.ally?.[ix],id=cell?.tempTile||cell?.baseTile||'TL00';ally.push({unit:u||null,current:!!u&&u.id===q.active,rank,col:c,tile:id,tileName:T?.tileName?.(id),tileText:T?.tileSummary?.(cell,!!q.boss)})}
  for(const rank of ['rear','mid','front'])for(let c=1;c<=3;c++){const er=rank==='rear'?'back':rank,u=q.enemies.find(x=>x.row===er&&Number(document.querySelector('.enemy-unit[data-unit-id="'+x.id+'"]')?.dataset.col)===c),ix=T?.cellIndex?.('enemy',er,c),cell=q.battlefield?.cells?.enemy?.[ix],id=cell?.tempTile||cell?.baseTile||'TL00';foe.push({unit:u||null,current:false,rank:er,col:c,tile:id,tileName:T?.tileName?.(id),tileText:T?.tileSummary?.(cell,!!EXPCTX?.boss)})}
  drawFormationBoard(allyFormationBoard,ally,false,q.prepMode);drawFormationBoard(enemyFormationBoard,foe,true,false);
  prepStart.hidden=!q.prepMode;const cap=formationSheet.querySelector('.formation-caption');if(cap)cap.textContent=q.prepMode?'味方を選択 → 移動先を選択。配置変更は無料です。':'戦闘中の移動は同じ縦列へ1 ACTION。';
 }
 window.updateFormationBoard=refreshFormationBoard;
 $('formationButton').addEventListener('click',()=>{const q=window.RPGDemo.snapshot();if(q.busy||q.over)return;prepSelected=null;refreshFormationBoard();formationSheet.showModal()});prepStart.addEventListener('click',()=>{prepSelected=null;window.RPGDemo?.startPreparedBattle?.();formationSheet.close()});
 $('closeFormationSheet').addEventListener('click',()=>formationSheet.close());
 formationSheet.addEventListener('click',e=>{if(e.target===formationSheet)formationSheet.close()});
 let language='en';try{language=localStorage.getItem('rpg.command-language')==='ja'?'ja':'en'}catch(_){}
 const labels={attack:['ATTACK','ATTACK'],skills:['SKILL','SKILL'],defend:['DEFEND','DEFEND'],swap:['ITEM','ITEM'],switch:['EQUIP','EQUIP'],resolve:['EXECUTE','EXECUTE']};
 function localize(){for(const[id,pair]of Object.entries(labels)){const b=$(id).querySelector('b');if(b)b.textContent=pair[language==='en'?0:1]}}
 localize();$('more').addEventListener('click',()=>{const b=document.createElement('button');b.type='button';b.className='menu-action';b.textContent='コマンド：'+(language==='en'?'English':'日本語');b.addEventListener('click',()=>{language=language==='en'?'ja':'en';try{localStorage.setItem('rpg.command-language',language)}catch(_){}localize();b.textContent='コマンド：'+(language==='en'?'English':'日本語')});$('sheetList').append(b)});
 // auto-open canonical battle preparation for non-ambush exploration battles.
 setTimeout(()=>{const q=window.RPGDemo?.snapshot?.();if(q?.prepMode){prepSelected=null;refreshFormationBoard();if(!formationSheet.open)formationSheet.showModal()}},0);
 // An additional Escape dismisses the command overlay, without changing a reserved move.
 document.documentElement.dataset.presentation='plan36';
}catch(error){console.error(error);const boot=$('bootStatus');if(boot){boot.style.display='block';boot.querySelector('p').textContent='読み込みに失敗しました。再読み込みしてください。';}window.__bootError=String(error)}
})();
