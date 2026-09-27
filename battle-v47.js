/* UI v42 — stable lower formation, contextual commands and tightly framed enemy art.
 * Combat rules/data are retained from battle-v35.js. No third-party runtime is required. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),ASSETS={"guard-body":"scene-art-v32.svg#guard-body","archer-body":"scene-art-v32.svg#archer-body","mage-body":"scene-art-v32.svg#mage-body","gald":"scene-art-v32.svg#gald","lize":"scene-art-v32.svg#lize","ern":"scene-art-v32.svg#ern","sena":"scene-art-v32.svg#sena","mirea":"scene-art-v32.svg#mirea","yuna":"scene-art-v32.svg#yuna","gald-face":"images/gald.svg","lize-face":"images/lize.svg","ern-face":"images/ern.svg","sena-face":"images/sena.svg","mirea-face":"images/mirea.svg","yuna-face":"images/yuna.svg","enemy_guard-face":"images/enemy_guard.svg","enemy_archer-face":"images/enemy_archer.svg","enemy_mage-face":"images/enemy_mage.svg","enemy_guard":"images/enemy_guard.svg","enemy_archer":"images/enemy_archer.svg","enemy_mage":"images/enemy_mage.svg"};
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
{id:'g1',name:'重装兵A',style:'重装兵',row:'front',slot:1,hp:155,PHY:42,SKL:20,ARC:10,MND:18,physDef:70,magDef:36,weak:{壊:2,火:1.2},resist:{斬:.5},weapon:{name:'大盾槍',attr:'突',range:'mid',power:20,hit:0,speed:-4,weight:'heavy'},ai:'guard'},
{id:'g2',name:'重装兵B',style:'重装兵',row:'front',slot:2,hp:145,PHY:40,SKL:22,ARC:10,MND:18,physDef:66,magDef:36,weak:{壊:2},resist:{斬:.5},weapon:{name:'戦槌',attr:'壊',range:'near',power:21,hit:-3,speed:-5,weight:'heavy'},ai:'guard'},
{id:'g3',name:'槍兵',style:'槍兵',row:'front',slot:3,hp:125,PHY:34,SKL:30,ARC:10,MND:16,physDef:52,magDef:32,weak:{斬:1.3,火:1.2},resist:{突:.5},weapon:{name:'長槍',attr:'突',range:'mid',power:18,hit:3,speed:0,weight:'normal'},ai:'guard'},
{id:'arch',name:'弓兵A',style:'弓兵',row:'back',slot:4,hp:100,PHY:20,SKL:48,ARC:10,MND:15,physDef:35,magDef:35,weak:{斬:1.5},resist:{},weapon:{name:'弓',attr:'突',range:'far',power:15,hit:7,speed:2,weight:'normal'},ai:'archer'},
{id:'mage',name:'魔術師',style:'魔術師',row:'back',slot:5,hp:90,PHY:10,SKL:24,ARC:48,MND:24,physDef:24,magDef:58,weak:{斬:1.4,突:1.2},resist:{火:.5},spell:skill('火炎術','spell','MP',12,1.25,'火','far','ARC',{power:16,hit:5,speed:-2}),ai:'mage'},
{id:'arch2',name:'弓兵B',style:'弓兵',row:'back',slot:6,hp:95,PHY:18,SKL:44,ARC:10,MND:16,physDef:32,magDef:36,weak:{斬:1.5,壊:1.2},resist:{},weapon:{name:'弓',attr:'突',range:'far',power:14,hit:6,speed:3,weight:'normal'},ai:'archer'}
];
const PORTRAITS={war:'gald',rog:'lize',run:'ern',ran:'sena',arc:'mirea',mys:'yuna',g1:'enemy_guard',g2:'enemy_guard',g3:'enemy_guard',arch:'enemy_archer',arch2:'enemy_archer',mage:'enemy_mage'};
const TERRAINS=[{name:'狭所',desc:'重量武器 命中−10・速度−5',wHit:w=>w?.weight==='heavy'?-10:0,wSpeed:w=>w?.weight==='heavy'?-5:0,ranged:1},{name:'高台',desc:'後列の遠距離武器 威力＋10%',wHit:()=>0,wSpeed:()=>0,ranged:1.1},{name:'茂み',desc:'遠距離武器 命中−10（術は除く）',wHit:w=>w?.range==='far'?-10:0,wSpeed:()=>0,ranged:1},{name:'開所',desc:'遠距離武器 威力＋10%',wHit:()=>0,wSpeed:()=>0,ranged:1.1}];
const STATUS=[['poison','猛毒','毒'],['stun','気絶','気絶'],['headBind','頭封じ','頭封'],['legBind','脚封じ','脚封']];
const RANKS=['front','mid','rear'],RANK_LABEL={front:'FRONT',mid:'MID',rear:'REAR'};
const live=list=>list.filter(u=>u.alive&&u.hp>0),col=u=>u.gridCol||((u.slot-1)%3+1),clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const rankIndex=u=>u.enemy?(u.row==='front'?0:2):({front:0,mid:1,rear:2}[u.rank]??(u.row==='front'?0:2));
const rankParent=u=>u.rank==='front'?'pf':u.rank==='mid'?'pm':'pb';
const syncLegacyRow=u=>{if(!u.enemy)u.row=u.rank==='front'?'front':'back'};
const frontRank=side=>{const rs=live(side).map(rankIndex);return rs.length?Math.min(...rs):0};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=name=>ASSETS[name]||'assets/'+name+'.webp';
const image=u=>asset(PORTRAITS[u.id]);
const faceImage=u=>asset(PORTRAITS[u.id]+'-face');
const ATLAS='scene-art-v32.svg';
// Visible artwork bounds in the existing 384×540 atlas. Crop the source viewport,
// not the whole lane: labels stay attached at every phone height and after swaps.
const CROPS={guard:[4,1,120,178],archer:[129,52,126,127],mage:[257,51,126,128],
 war:[0,204,128,156],rog:[128,204,128,156],run:[256,204,128,156],
 ran:[0,384,128,156],arc:[128,384,128,156],mys:[256,384,128,156]};
function enemyCrop(u){return CROPS[u.id==='mage'?'mage':['arch','arch2'].includes(u.id)?'archer':'guard']}
function spriteMarkup(c){return '<svg class="enemy-sprite" viewBox="'+c.join(' ')+'" style="--sprite-ratio:'+(c[2]/c[3])+'" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><image href="'+ATLAS+'" width="384" height="540"/></svg>'}
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
 el.dataset.unitId=u.id;el.dataset.style=u.style;el.style.gridColumn=col(u);
 if(u.enemy){
  el.innerHTML='<span class="enemy-name">'+esc(u.name)+'</span><span class="enemy-hp" data-resource="hp"><span class="bar"><i></i></span><b></b></span><span class="enemy-visual">'+spriteMarkup(enemyCrop(u))+'<span class="target-pointer" aria-hidden="true"></span></span><span class="card-status"></span>';
 }else{
  el.innerHTML='<span class="card-name"><span class="slot-mark" aria-hidden="true">'+u.slot+'</span>'+esc(u.name)+'</span><span class="card-status"></span><span class="queued-mark" hidden>✓</span><span class="resource-list">'+['hp','sp','mp'].map(k=>'<span class="resource" data-resource="'+k+'"><span class="resource-value"><span>'+k.toUpperCase()+'</span><b></b></span><span class="bar '+(k==='hp'?'':k)+'"><i></i></span></span>').join('')+'</span>';
 }
 el.querySelector('img')?.addEventListener('error',ev=>{ev.target.style.opacity='0'});
 el.addEventListener('click',()=>cardTap(u.id));nodes.set(u.id,el);return el;
}
function queuedText(u){return u.queued?.type==='skill'?u.queued.action.name:({attack:'通常攻撃',defend:'防御',swap:'交代',move:'移動',escape:'逃走'}[u.queued?.type]||'')}
function renderCards(){
 const paint=(u,parent)=>{
  const el=nodes.get(u.id)||createCard(u);
  if(el.parentNode!==parent)parent.append(el);
  el.style.gridColumn=col(u);
  const slotMark=el.querySelector('.slot-mark');if(slotMark)slotMark.textContent=u.slot;
  el.classList.toggle('dead',!u.alive);
  el.classList.toggle('active',editable()&&commandOpen&&!u.enemy&&u.id===current()?.id);
  const mark=el.querySelector('.queued-mark');
  if(mark){mark.hidden=busy||over||!u.queued;mark.title='入力済み：'+queuedText(u);mark.classList.toggle('has-status',STATUS.some(([k])=>u.status[k]>0))}
  el.querySelector('.card-status').innerHTML=!u.alive?'<span class="status-chip">戦闘不能</span>':STATUS.filter(([k])=>u.status[k]>0).map(([k,n,s])=>'<span class="status-chip" title="'+n+' '+u.status[k]+'ターン">'+s+'</span>').join('');
  el.querySelectorAll('[data-resource]').forEach(box=>{const k=box.dataset.resource,m=u['max'+k[0].toUpperCase()+k.slice(1)],v=Math.max(0,u[k]);box.querySelector('b').textContent=v;box.querySelector('i').style.width=(m?clamp(v/m*100,0,100):0)+'%'});
  const where=u.enemy?(u.row==='front'?'前列':'後列'):RANK_LABEL[u.rank];
  el.setAttribute('aria-label',u.name+'、'+where+'、HP '+u.hp+(u.queued?'、入力済み：'+queuedText(u):''));
 };
 for(const u of [...enemies].sort((a,b)=>a.slot-b.slot))paint(u,$(u.row==='front'?'ef':'eb'));
 for(const u of [...party].sort((a,b)=>rankIndex(a)-rankIndex(b)||col(a)-col(b)))paint(u,$(rankParent(u)));
 highlightTargets();
}
function highlightTargets(){const u=current(),a=u?actionFor(u):null,ts=editable()&&commandOpen&&a?ensureTarget(u,a):[],valid=new Set(ts.map(t=>t.id)),chosen=u?getDraft(u).targetId:null;nodes.forEach((el,id)=>{el.classList.toggle('target-valid',valid.has(id));el.classList.toggle('target-selected',valid.has(id)&&id===chosen);el.classList.toggle('target-unavailable',editable()&&!valid.has(id)&&el.classList.contains('enemy-unit'));el.setAttribute('aria-pressed',String(valid.has(id)&&id===chosen))})}
function renderOrder(){
 const all=[...party,...enemies];
 let shown;
 if(busy&&turnSequence.length){
  const ordered=turnSequence.map(id=>all.find(u=>u.id===id)).filter(u=>u&&u.alive);
  const activeIndex=Math.max(0,ordered.findIndex(u=>u.id===activeTurnId));
  shown=[...ordered.slice(activeIndex),...ordered.slice(0,activeIndex)];
 }else{
  shown=[...live(party),...live(enemies)].sort((a,b)=>speed(b,b.queued)-speed(a,a.queued));
 }
 const target=$('turnOrder');target.replaceChildren();
 target.style.setProperty('--order-count',Math.max(1,shown.length));
 for(const u of shown){
  const b=document.createElement('button');b.type='button';
  b.className='order-face'+(u.enemy?' foe':' ally')+((busy?u.id===activeTurnId:(commandOpen&&u.id===current()?.id))?' is-active':'');
  b.setAttribute('aria-label',u.name+(u.enemy?'、敵':'、味方'));
  b.title=(u.enemy?'敵：':'味方：')+u.name;b.dataset.actorId=u.id;
  b.innerHTML='<img src="'+faceImage(u)+'" alt="" draggable="false"><span class="order-side" aria-hidden="true"></span>';
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
 $('actorArt').classList.toggle('dim',!show);
 $('commandPanel').classList.toggle('enemy-action',busy&&!show);
 if(show){
  const art=$('actorPortrait');
  if(art.dataset.actorId!==who.id){art.dataset.actorId=who.id;art.setAttribute('viewBox',CROPS[who.id].join(' '));const c=CROPS[who.id],rect=art.querySelector('rect');['x','y','width','height'].forEach((k,i)=>rect.setAttribute(k,c[i]));art.querySelector('image').setAttribute('href',ATLAS);const box=$('actorArt');box.classList.remove('is-entering');void box.offsetWidth;box.classList.add('is-entering')}
 }
 $('actorName').textContent=over?'':who?.name||'';
}
function render(){
 renderCards();renderOrder();updatePortrait();
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
 $('swap').disabled=u.status.legBind>0||!live(party).some(t=>t.row!==u.row&&col(t)===col(u));
 $('switch').title=u.weapon.name+' → '+W[u.weapons[u.wi?0:1]].name;
 $('targetHint').innerHTML=targetMode?esc(a.name)+' →':t?esc(a.kind==='attack'?u.weapon.name:a.name)+' → '+esc(t.name)+(a.heal?'':affinity(t,a.attr)>1?' <strong>✧</strong>':''):'―';
 highlightTargets();
}
function cancelTarget(){if(targetMode){const u=party.find(u=>u.id===targetMode.actorId);if(u)drafts.set(u.id,{...targetMode.previous});targetMode=null;render()}}
function cardTap(id){if(!editable())return;const t=[...party,...enemies].find(u=>u.id===id);if(!t?.alive)return;const u=current(),a=actionFor(u);
 if(targetMode){if(!targets(u,a).some(x=>x.id===id)){notify('このスキルの対象にはできません');return}getDraft(u).targetId=id;targetMode=null;queue();return}
 if(t.enemy){if(!commandOpen)return;if(!targets(u,a).some(x=>x.id===id)){notify('この行動は届きません。遠距離スキルや換装を選択。');return}getDraft(u).targetId=id;if(u.queued&&['attack','skill'].includes(u.queued.type)&&u.queued.action?.target!=='ally')u.queued.targetId=id;render();return}toggleActor(id)}
function closeCommands(){
 if(!editable())return;
 if(targetMode){const u=party.find(u=>u.id===targetMode.actorId);if(u)drafts.set(u.id,{...targetMode.previous});targetMode=null}
 commandOpen=false;closeSheet();render();
}
function toggleActor(id){
 if(!editable())return;
 if(commandOpen&&current()?.id===id){closeCommands();return}
 selectActor(id);
}
function selectActor(id){const i=party.findIndex(u=>u.id===id&&u.alive);if(i<0||!editable())return;cancelTarget();idx=i;commandOpen=true;render()}
function advance(){targetMode=null;commandOpen=false;let next=-1;for(let step=1;step<=party.length;step++){const i=(idx+step)%party.length;if(party[i].alive&&!party[i].queued){next=i;break}}if(next>=0)idx=next;phase=next<0?'ready':'command';render()}
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
function chooseSkill(key,chooseTarget=false){if(!editable())return;const u=current(),a=actionFor(u,key),reason=unavailable(u,a);if(reason){notify(reason);return}const previous={...getDraft(u)};getDraft(u).key=key;ensureTarget(u,a);closeSheet();if(chooseTarget){targetMode={actorId:u.id,key,previous};render()}else{targetMode=null;queue()}}
function openSheet(mode='skills'){
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
    b.innerHTML=occ?'<img src="'+faceImage(occ)+'" alt=""><span>'+esc(occ.name)+'</span>':'<span class="formation-plus">＋</span>';
    if(u.status.legBind>0)b.disabled=true;
    b.addEventListener('click',()=>queueMove(rank,c));cells.append(b);
   }
   line.append(cells);editor.append(line);
  }
  list.append(editor);
 }else if(mode==='members'){
  for(const m of party){
   const b=document.createElement('button');b.type='button';b.className='member-option';b.disabled=!m.alive;
   b.innerHTML='<img src="'+faceImage(m)+'" alt=""><span>'+esc(m.name)+'</span><em>'+(!m.alive?'戦闘不能':m.queued?esc(queuedText(m)):'')+'</em>';
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
   b.innerHTML=icon(skillIcon(a))+'<span><b>'+esc(a.name)+'</b><small>'+scopeName(a)+' · '+rangeName(a.range)+' · '+esc(a.attr)+'<br>'+esc(reason||effectText(a))+'</small></span><span class="cost">'+a.costType+' '+a.cost+'</span>';
   b.addEventListener('click',()=>chooseSkill(key));item.append(b);
   const f=document.createElement('div');f.className='skill-target';f.innerHTML='<span>→ '+esc(t?t.name:'―')+'</span>';
   const change=document.createElement('button');change.type='button';change.textContent='対象変更';change.disabled=!!reason;
   change.setAttribute('aria-label',a.name+'の対象変更');change.addEventListener('click',()=>chooseSkill(key,true));f.append(change);item.append(f);list.append(item);
  }
 }
 if(!sheet.open)sheet.showModal();
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
  const other=live(party).find(x=>x.id!==u.id&&x.rank===q.rank&&col(x)===q.gridCol);
  if(other){other.rank=oldRank;other.gridCol=oldCol;syncLegacyRow(other)}
  u.rank=q.rank;u.gridCol=q.gridCol;syncLegacyRow(u);
  displayActorId=u.id;activeTurnId=u.id;render();
  await say(u.name+'が '+RANK_LABEL[u.rank]+' '+u.gridCol+' へ移動。',token,'sys',{actorId:u.id});
 }
 for(const u of live(party).filter(u=>u.defending)){displayActorId=u.id;activeTurnId=u.id;render();await say(u.name+'は身を守っている。',token,'sys',{actorId:u.id})}
 const order=[...live(party).filter(u=>!['swap','move','defend'].includes(u.queued.type)).map(u=>({u,q:u.queued,s:speed(u,u.queued)})),...live(enemies).map(u=>({u,q:null,s:speed(u,null)}))].sort((a,b)=>b.s-a.s);
 turnSequence=order.map(e=>e.u.id);renderOrder();
 for(const entry of order){check(token);if(!entry.u.alive)continue;let q=entry.q;if(entry.u.enemy){const a=entry.u.spell||normal(entry.u),ts=live(party).filter(t=>canReach(entry.u,t,a.range)),t=entry.u.ai==='archer'?[...ts].sort((a,b)=>a.hp-b.hp)[0]:ts[Math.floor(Math.random()*ts.length)];q={type:a.kind==='attack'?'attack':'skill',action:a,targetId:t?.id}}await execute(entry.u,q,token);if(await checkEnd(token))break}
 if(!over){for(const u of [...party,...enemies]){check(token);if(!u.alive)continue;if(u.status.poison>0){displayActorId=null;activeTurnId=null;const n=Math.max(1,Math.floor(u.maxHp*.04));u.hp=Math.max(0,u.hp-n);render();await say(u.name+'は猛毒で '+n+' ダメージ。',token,'bad',{targetId:u.id,value:n});await defeated(u,token)}for(const[k]of STATUS)if(u.status[k]>0)u.status[k]--}if(!await checkEnd(token)){for(const u of [...party,...enemies]){u.queued=null;u.defending=false}round++;idx=party.findIndex(u=>u.alive);commandOpen=false;phase='command';log('―― Round '+round+' ――','sys')}}
 }catch(e){if(e!==CANCEL){console.error(e);notify('戦闘処理でエラーが発生しました。新しい戦闘で再開してください。');over=true;phase='done'}}finally{if(token===session){busy=false;paused=false;displayActorId=null;activeTurnId=null;turnSequence=[];setBattle(false);render()}}}
function autoRound(){if(!editable())return;cancelTarget();for(const u of live(party)){if(u.queued)continue;const a=normal(u),t=targets(u,a)[0];if(t){u.queued={type:'attack',action:a,targetId:t.id};u.defending=false;continue}const s=u.skills.find(s=>s.target==='enemy'&&!unavailable(u,s));if(s){u.queued={type:'skill',action:s,targetId:targets(u,s)[0].id};u.defending=false}else{u.queued={type:'defend'};u.defending=true}}phase='ready';render();resolve()}
function fresh(randomTerrain=true){session++;displayActorId=null;activeTurnId=null;turnSequence=[];commandOpen=false;for(const anim of activeAnimations)anim.cancel();activeAnimations.clear();closeSheet();clearEffects();nodes.clear();for(const id of ['eb','ef','pf','pm','pb'])$(id).replaceChildren();drafts.clear();replacementUsed.party.clear();replacementUsed.enemies.clear();party=HT.map(u=>initUnit(u));enemies=ET.map(u=>initUnit(u,true));terrain=TERRAINS[randomTerrain?Math.floor(Math.random()*TERRAINS.length):0];round=1;idx=0;phase='command';busy=false;over=false;paused=false;skip=false;targetMode=null;logCount=0;clearTimeout(noticeTimer);$('pause').innerHTML=icon('pause');$('pause').setAttribute('aria-pressed','false');$('log').replaceChildren();$('history').open=false;delete $('history').dataset.result;$('notice').hidden=true;setBattle(false);log('戦闘開始 · '+terrain.name,'sys');render()}
$('new').addEventListener('click',()=>fresh());$('actor').addEventListener('click',()=>openSheet('members'));$('skills').addEventListener('click',()=>openSheet());$('more').addEventListener('click',()=>openSheet('more'));$('closeSheet').addEventListener('click',closeSheet);sheet.addEventListener('click',e=>{const r=sheet.getBoundingClientRect();if(e.target===sheet&&(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right))closeSheet()});$('attack').addEventListener('click',attack);$('swap').addEventListener('click',()=>openSheet('formation'));$('defend').addEventListener('click',()=>simpleCommand('defend'));$('switch').addEventListener('click',switchWeapon);$('resolve').addEventListener('click',resolve);$('auto').addEventListener('click',autoRound);$('cancelTarget').addEventListener('click',cancelTarget);$('nextMessage').addEventListener('click',()=>{skip=true});$('pause').addEventListener('click',()=>{paused=!paused;$('pause').innerHTML=icon(paused?'play':'pause');$('pause').setAttribute('aria-label',paused?'再開':'一時停止');$('pause').setAttribute('aria-pressed',String(paused));for(const anim of activeAnimations)paused?anim.pause():anim.play();$('actorJob').textContent=''});$('pace').addEventListener('click',()=>{paceIndex=(paceIndex+1)%3;$('pace').textContent=['1×','1.4×','2.5×'][paceIndex];$('pace').title=paceOptions[paceIndex].name;try{localStorage.setItem('rpg.pace.v31',paceIndex)}catch(_){}});$('history').addEventListener('toggle',()=>{$('historyButton').setAttribute('aria-expanded',String($('history').open));if($('history').open)$('log').scrollTop=$('log').scrollHeight});$('historyButton').addEventListener('click',toggleHistory);$('terrainButton').addEventListener('click',()=>openSheet('terrain'));
$('enemyStage').addEventListener('click',e=>{if(!e.target.closest('.enemy-unit'))closeCommands()});
$('closeCommand').addEventListener('click',closeCommands);
$('closeHistory').addEventListener('click',()=>{if($('history').open)toggleHistory()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.open&&editable())closeCommands()});
if(typeof ResizeObserver==='function')new ResizeObserver(fitScene).observe($('enemyStage'));
window.addEventListener('resize',fitScene);
fresh(false);document.documentElement.dataset.ready='true';$('bootStatus')?.remove();$('engineStatus').classList.add('ready');$('engineStatus').title='JavaScript動作中 · UI v42';
window.RPGDemo={version:'47',snapshot:()=>({round,phase,busy,over,commandOpen,targetMode:targetMode?.key||null,active:current()?.id,party:party.map(u=>({id:u.id,hp:u.hp,sp:u.sp,mp:u.mp,row:u.row,rank:u.rank,col:col(u),slot:u.slot,queued:u.queued?.type||null,target:u.queued?.targetId,weapon:u.weapon.name})),enemies:enemies.map(u=>({id:u.id,hp:u.hp,row:u.row,slot:u.slot}))})};
if(window.__RPG_TEST__)window.__test={get units(){return{party,enemies}},fresh,render,defeated,animateSwap,resolve,autoRound,selectActor,toggleActor,closeCommands,openSheet,simpleCommand,getDraft,chooseSkill,attack,canReach,cancelTarget,setPace:i=>{paceIndex=i},runDeath:async u=>{displayActorId=null;busy=true;setBattle(true);await defeated(u,session);busy=false;setBattle(false);render()}};
})();
