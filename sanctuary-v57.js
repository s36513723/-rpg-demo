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
try{ATLAS=window.__INLINE_ATLAS__||await loadAtlas()}catch(error){const b=document.getElementById('bootStatus');if(b)b.querySelector('p').textContent='画像を読み込めません。再読み込みしてください。';window.__bootError=String(error);console.error(error);return}

const $=id=>document.getElementById(id),scene=$('enemyStage'),bodies=new Map(),enemyGrid=$('enemyGrid'),allyGrid=$('allyGrid');
let state=null;
let viewSequence=0;
function cut(c,cls=''){
 const id='view-cut-'+(++viewSequence);
 return '<svg class="'+cls+'" viewBox="'+c.join(' ')+'" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><defs><clipPath id="'+id+'"><rect x="'+c[0]+'" y="'+c[1]+'" width="'+c[2]+'" height="'+c[3]+'"/></clipPath></defs><image href="'+ATLAS+'" width="'+M.width+'" height="'+M.height+'" clip-path="url(#'+id+')"/></svg>';
}
$('environment').querySelector('.sky-art').innerHTML=cut(M.crops.sky,'scenery');

const BATTLE_GRID={
 enemy:{left:.09,top:.09,width:.82,height:.40,rows:['REAR','MID','FRONT']},
 ally:{left:.09,top:.56,width:.82,height:.35,rows:['FRONT','MID','REAR']}
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
function geometry(){
 if(!state)return;const {party,enemies,options}=state;
 const w=scene.clientWidth,h=scene.clientHeight;
 const eg={x:w*BATTLE_GRID.enemy.left,y:h*BATTLE_GRID.enemy.top,w:w*BATTLE_GRID.enemy.width,h:h*BATTLE_GRID.enemy.height};
 const ag={x:w*BATTLE_GRID.ally.left,y:h*BATTLE_GRID.ally.top,w:w*BATTLE_GRID.ally.width,h:h*BATTLE_GRID.ally.height};
 for(const u of enemies){
  const el=scene.querySelector('[data-unit-id="'+u.id+'"]');if(!el)continue;
  const col=(u.slot-1)%3+1,row=u.row==='back'?'back':'front',ri=row==='back'?0:2;
  const cx=eg.x+eg.w*((col-.5)/3);
  const feet=eg.y+eg.h*((ri+.88)/3);
  const eh=Math.min(h*.165,eg.h*.72);
  const ew=eg.w/3*.82;
  el.style.left=Math.round(cx-ew/2)+'px';
  el.style.top=Math.round(feet-eh)+'px';
  el.style.width=Math.round(ew)+'px';
  el.style.height=Math.round(eh)+'px';
  el.style.zIndex=String(row==='back'?8:14);el.dataset.rank=u.row;
 }
 for(const u of party){
  let el=bodies.get(u.id);
  if(!el){el=document.createElement('div');el.className='scene-ally';el.dataset.actorId=u.id;el.setAttribute('aria-hidden','true');el.innerHTML=cut(M.crops['back-'+u.id]);$('partyScene').append(el);bodies.set(u.id,el)}
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
  if(el.dataset.hp&&Number(el.dataset.hp)>u.hp){el.classList.remove('is-hit');void el.offsetWidth;el.classList.add('is-hit')}
  el.dataset.hp=String(u.hp);
 }
 paintBattleGrid(party,enemies,options);
 const selected=options.busy?options.displayActorId:options.actorId;
 $('actorArt').dataset.faceOnly=String(selected!=='arc');
}
window.SanctuaryView={sync(party,enemies,options){state={party,enemies,options};geometry();if(document.getElementById('formationSheet')?.open&&window.updateFormationBoard)window.updateFormationBoard()}};
new ResizeObserver(geometry).observe(scene);window.addEventListener('resize',geometry);window.visualViewport?.addEventListener('resize',geometry);
try{
 const response=await fetch('battle-v48.js?v=base48');if(!response.ok)throw new Error('戦闘データを読み込めません');let source=await response.text();
 const patches=[["ASSETS={\"guard-body\":\"scene-art-v32.svg#guard-body\",\"archer-body\":\"scene-art-v32.svg#archer-body\",\"mage-body\":\"scene-art-v32.svg#mage-body\",\"gald\":\"scene-art-v32.svg#gald\",\"lize\":\"scene-art-v32.svg#lize\",\"ern\":\"scene-art-v32.svg#ern\",\"sena\":\"scene-art-v32.svg#sena\",\"mirea\":\"scene-art-v32.svg#mirea\",\"yuna\":\"scene-art-v32.svg#yuna\",\"gald-face\":\"images/gald.svg\",\"lize-face\":\"images/lize.svg\",\"ern-face\":\"images/ern.svg\",\"sena-face\":\"images/sena.svg\",\"mirea-face\":\"images/mirea.svg\",\"yuna-face\":\"images/yuna.svg\",\"enemy_guard-face\":\"images/enemy_guard.svg\",\"enemy_archer-face\":\"images/enemy_archer.svg\",\"enemy_mage-face\":\"images/enemy_mage.svg\",\"enemy_guard\":\"images/enemy_guard.svg\",\"enemy_archer\":\"images/enemy_archer.svg\",\"enemy_mage\":\"images/enemy_mage.svg\"};","ASSETS={\"gald-face\":\"sanctuary-art-v49.svg#face-war\",\"lize-face\":\"sanctuary-art-v49.svg#face-rog\",\"ern-face\":\"sanctuary-art-v49.svg#face-run\",\"sena-face\":\"sanctuary-art-v49.svg#face-ran\",\"mirea-face\":\"sanctuary-art-v49.svg#face-arc\",\"yuna-face\":\"sanctuary-art-v49.svg#face-mys\",\"enemy_guard-face\":\"sanctuary-art-v49.svg#knight\",\"enemy_archer-face\":\"sanctuary-art-v49.svg#dragon\",\"enemy_mage-face\":\"sanctuary-art-v49.svg#priest\",\"gald\":\"sanctuary-art-v49.svg#face-war\",\"lize\":\"sanctuary-art-v49.svg#face-rog\",\"ern\":\"sanctuary-art-v49.svg#face-run\",\"sena\":\"sanctuary-art-v49.svg#face-ran\",\"mirea\":\"sanctuary-art-v49.svg#face-arc\",\"yuna\":\"sanctuary-art-v49.svg#face-mys\",\"enemy_guard\":\"sanctuary-art-v49.svg#knight\",\"enemy_archer\":\"sanctuary-art-v49.svg#dragon\",\"enemy_mage\":\"sanctuary-art-v49.svg#priest\"};"],["const ATLAS='scene-art-v32.svg';","const ATLAS='sanctuary-art-v49.svg';"],["const CROPS={guard:[4,1,120,178],archer:[129,52,126,127],mage:[257,51,126,128],\n war:[0,204,128,156],rog:[128,204,128,156],run:[256,204,128,156],\n ran:[0,384,128,156],arc:[128,384,128,156],mys:[256,384,128,156]};","const CROPS={\"guard\":[0,159,178,190],\"archer\":[760,159,252,160],\"mage\":[407,159,127,195],\"war\":[825,0,51,35],\"rog\":[590,0,51,38],\"run\":[708,0,50,41],\"ran\":[766,0,51,40],\"arc\":[153,675,237,300],\"mys\":[649,0,51,41]};"],["function enemyCrop(u){return CROPS[u.id==='mage'?'mage':['arch','arch2'].includes(u.id)?'archer':'guard']}","function enemyCrop(u){return u.id==='g3'?[542, 159, 210, 135]:CROPS[u.id==='mage'?'mage':['arch','arch2'].includes(u.id)?'archer':'guard']}"],["function spriteMarkup(c){return '<svg class=\"enemy-sprite\" viewBox=\"'+c.join(' ')+'\" style=\"--sprite-ratio:'+(c[2]/c[3])+'\" preserveAspectRatio=\"xMidYMin meet\" aria-hidden=\"true\"><image href=\"'+ATLAS+'\" width=\"384\" height=\"540\"/></svg>'}","let cropSequence=0;\nfunction clipped(c,cls='enemy-sprite'){\n const cid='cut-enemy-'+(++cropSequence);\n return '<svg class=\"'+cls+'\" viewBox=\"'+c.join(' ')+'\" preserveAspectRatio=\"xMidYMin meet\" aria-hidden=\"true\"><defs><clipPath id=\"'+cid+'\"><rect x=\"'+c[0]+'\" y=\"'+c[1]+'\" width=\"'+c[2]+'\" height=\"'+c[3]+'\"/></clipPath></defs><image href=\"'+ATLAS+'\" width=\"1024\" height=\"975\" clip-path=\"url(#'+cid+')\"/></svg>';\n}\nfunction spriteMarkup(c){return clipped(c)}\nconst FACE_CROPS={\"war\": [825, 0, 51, 35], \"rog\": [590, 0, 51, 38], \"run\": [708, 0, 50, 41], \"ran\": [766, 0, 51, 40], \"arc\": [529, 0, 53, 48], \"mys\": [649, 0, 51, 41], \"g1\": [0, 159, 178, 190], \"g2\": [0, 159, 178, 190], \"g3\": [542, 159, 210, 135], \"arch\": [760, 159, 252, 160], \"arch2\": [760, 159, 252, 160], \"mage\": [407, 159, 127, 195]};\nfunction faceMarkup(u,cls='face-graphic'){return clipped(FACE_CROPS[u.id]||CROPS.guard,cls)}\n"],["'<span class=\"ally-face-wrap\"><img class=\"ally-face\" src=\"'+faceImage(u)+'\" alt=\"\"><span class=\"rank-badge\">'","'<span class=\"ally-face-wrap\">'+faceMarkup(u,'ally-face')+'<span class=\"rank-badge\">'"],["'<img src=\"'+faceImage(u)+'\" alt=\"\" draggable=\"false\"><span class=\"order-side\" aria-hidden=\"true\"></span>'","faceMarkup(u,'order-portrait')+'<span class=\"order-side\" aria-hidden=\"true\"></span>'"],["'<img src=\"'+faceImage(occ)+'\" alt=\"\"><span>'","faceMarkup(occ)+'<span>'"],["'<img src=\"'+faceImage(m)+'\" alt=\"\"><span>'","faceMarkup(m)+'<span>'"],["el.dataset.unitId=u.id;el.dataset.style=u.style;el.style.gridColumn=col(u);","el.dataset.unitId=u.id;el.dataset.style=u.style;el.dataset.col=col(u);el.style.gridColumn=u.enemy?'auto':String(party.findIndex(x=>x.id===u.id)+1);"],["  el.style.gridColumn=col(u);","  el.style.gridColumn=u.enemy?'auto':String(party.findIndex(x=>x.id===u.id)+1);el.style.gridRow='1';el.dataset.col=col(u);el.dataset.rank=u.enemy?u.row:u.rank;"],["if(rankBadge&&!u.enemy)rankBadge.textContent=RANK_LABEL[u.rank][0];","if(rankBadge&&!u.enemy)rankBadge.textContent=RANK_LABEL[u.rank][0]+col(u);"],["const where=u.enemy?(u.row==='front'?'前列':'後列'):RANK_LABEL[u.rank];","const where=u.enemy?(u.row==='front'?'前列':'後列'):RANK_LABEL[u.rank]+' '+col(u);"],["const other=live(party).find(x=>x.id!==u.id&&x.rank===q.rank&&col(x)===q.gridCol);","const other=party.find(x=>x.id!==u.id&&x.rank===q.rank&&col(x)===q.gridCol);"],[" renderCards();renderOrder();updatePortrait();"," renderCards();renderOrder();updatePortrait();\n if(window.SanctuaryView)window.SanctuaryView.sync(party,enemies,{busy,over,commandOpen,displayActorId,activeTurnId,actorId:current()?.id});"],["window.RPGDemo={version:'48'","window.RPGDemo={version:'49'"],["name:'重装兵A'","name:'白銀騎士'"],["name:'重装兵B'","name:'聖域の番兵'"],["name:'槍兵'","name:'月影の獣'"],["name:'弓兵A'","name:'翼竜A'"],["name:'弓兵B'","name:'翼竜B'"],["name:'魔術師'","name:'星詠み'"]];
 for(const [from,to] of patches){if(source.split(from).length!==2)throw new Error('戦闘データのバージョンが一致しません');source=source.replace(from,to)}
 // Only the immutable, same-origin engine above is evaluated. No user/network-external code is accepted.
 source=source.replaceAll('sanctuary-art-v49.svg',ATLAS);(new Function(source))();

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
 const labels={attack:['ATTACK','攻撃'],skills:['SKILL','技'],defend:['GUARD','防御'],swap:['SHIFT','移動'],switch:['EQUIP','換装'],resolve:['EXECUTE','ラウンド開始']};
 function localize(){for(const[id,pair]of Object.entries(labels)){const b=$(id).querySelector('b');if(b)b.textContent=pair[language==='en'?0:1]}}
 localize();$('more').addEventListener('click',()=>{const b=document.createElement('button');b.type='button';b.className='menu-action';b.textContent='コマンド：'+(language==='en'?'English':'日本語');b.addEventListener('click',()=>{language=language==='en'?'ja':'en';try{localStorage.setItem('rpg.command-language',language)}catch(_){}localize();b.textContent='コマンド：'+(language==='en'?'English':'日本語')});$('sheetList').append(b)});
 // An additional Escape dismisses the command overlay, without changing a reserved move.
 document.documentElement.dataset.presentation='57';
}catch(error){console.error(error);const boot=$('bootStatus');if(boot){boot.style.display='block';boot.querySelector('p').textContent='読み込みに失敗しました。再読み込みしてください。';}window.__bootError=String(error)}
})();
