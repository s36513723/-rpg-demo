/* Hub UI v9. Presentation only; save schema, rewards and battle engine stay unchanged. */
(()=>{
'use strict';
const U={route:null,stack:[],render:null,back:false,opener:null,filters:{},search:{},skillMasteries:{},inventory:'道具',sortie:'formation',toast:null,formationSelected:null};
const old={};
const originals=['town','drawDungeon','closeM','skills','equip','character','partyMenu','settings','charAbility','charMastery','mastery','masteryType','growMastery','masterySkills','toggleLearnedSkill'];
for(const n of originals)old[n]=window[n];
const portraits=['gald','lize','ern','sena','mirea','yuna'];
const standArts=['hub-standing-warrior-clean.webp','hub-standing-paladin-transparent.webp','hub-standing-rogue-clean.webp','hub-standing-archer-clean.webp','hub-standing-alchemist-clean.webp','hub-standing-mystic-clean.webp'];
const standArtCache=standArts.map(src=>{
 const img=new Image();img.decoding='async';img.fetchPriority='high';img.src='../images/'+src;
 const state={img,ready:false,promise:null};
 const loaded=()=>new Promise(resolve=>{if(img.complete)return resolve();img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true})});
 state.promise=(typeof img.decode==='function'?img.decode().catch(loaded):loaded()).catch(()=>{}).then(()=>{state.ready=true});
 return state;
});
let actorRenderToken=0;
const ensureStandArt=i=>standArtCache[i]?.promise||Promise.resolve();
const standArtReady=i=>!!standArtCache[i]?.ready;
const actorRouteName=n=>/^(character|charOverview|statusView|actorAttributes|charAbility|charMastery|equip|equipChoice|skills|mastery|masteryType|growMastery|masterySkills|resistView)$/.test(n);
// Shared character thumbnails use the same final transparent artwork as the status view.
// The old square card files retain painted backgrounds, especially the Paladin asset.
const battleCardArts=standArts;
const standArt=i=>'../images/'+standArts[i];
const battleCardArt=i=>'../images/'+battleCardArts[i];
const attrs=['PHY','SKL','ARC','MND'];
const statusNames={poison:'猛毒',blind:'盲目',sleep:'睡眠',agitate:'動揺',stun:'気絶',headBind:'頭封じ',armBind:'腕封じ',legBind:'脚封じ'};
const statusText=i=>Object.entries(vitals[i].status||{}).filter(([,n])=>n>0).map(([s,n])=>(statusNames[s]||s)+' '+n+'T').join(' / ');
const data=(n,a=[])=>' data-hub="'+n+'" data-args="'+hesc(JSON.stringify(a))+'"';
const pill=(text,kind='')=>'<span class="tag '+kind+'">'+hesc(text)+'</span>';
const section=(name,html)=>'<section class="ui-section"><h3>'+hesc(name)+'</h3>'+html+'</section>';
const hint=text=>'<p class="screen-hint">'+hesc(text)+'</p>';
const tabs=(items,chosen,fn,args=[])=>'<div class="ui-tabs" role="group" aria-label="表示切替">'+items.map(([v,n])=>'<button type="button"'+data(fn,[...args,v])+' aria-pressed="'+(v===chosen)+'">'+hesc(n)+'</button>').join('')+'</div>';
const resources=i=>{const v=vitals[i],m=rules().derived(stats[i]);return '<div class="resource-grid">'+['hp','sp'].map(k=>'<div><span>'+k.toUpperCase()+'</span><b>'+v[k]+'<small> / '+m[k]+'</small></b><i class="resource-track '+k+'"><i style="width:'+(m[k]?Math.max(0,v[k]/m[k]*100):0)+'%"></i></i></div>').join('')+'</div>'};
const actorMode=n=>n==='statusView'?'status':n==='actorAttributes'||n==='resistView'?'attributes':n==='skills'?'skills':/mastery|charAbility|charMastery|growMastery|masteryType|masterySkills/.test(n)?'growth':'equip';
const actorMembers=(i,mode)=>'<div class="actor-member-cards" role="group" aria-label="キャラクター切替">'+names.map((name,j)=>'<button type="button" class="actor-member-card"'+data('uiActor',[j,mode])+' aria-label="'+hesc(name)+'に切り替え" aria-pressed="'+(i===j)+'"><img src="'+battleCardArt(j)+'" alt=""><b>'+hesc(name)+'</b></button>').join('')+'</div>';
const actorBasics=i=>'<section class="status-basics">'+characterExperience()+resources(i)+'<div class="basic-abilities">'+attrs.map((n,j)=>'<span><small>'+n+' · '+['肉体','技能','異能','精神'][j]+'</small><b>'+stats[i][j]+'</b></span>').join('')+'</div>'+masteryBadges(i)+'</section>';
const statusPortrait=i=>'<section class="actor-hero status-cover"><div class="status-caption"><b>'+hesc(names[i])+'</b><span>'+hesc(battleStyle(i))+' · '+rows[i]+'</span></div></section>';

// A route is one navigation level. Changing the selected member, item or filter
// within that screen does not add a level to BACK history.
const key=r=>r?({character:'equip',charOverview:'equip',equip:'equip',charAbility:'mastery',charMastery:'mastery',mastery:'mastery',masteryType:'mastery',growMastery:'mastery',masterySkills:'mastery',items:'items',itemCategory:'items'}[r.name]||r.name):'none';
const recordRoute=(r,scroll)=>({route:r?{name:r.name,args:r.args.slice()}:null,scroll});
const isOpen=()=>document.getElementById('modal').classList.contains('on');
const focusables=()=>[...document.querySelectorAll('#panel button:not(:disabled),#panel input,#panel summary,#panel a[href],#panel [tabindex="0"],#app .hub-global-nav button:not(:disabled)')].filter(e=>!e.closest('[hidden]')&&e.getClientRects().length);
const setHubContentInert=on=>{const app=document.getElementById('app');app.inert=false;[...app.children].forEach(el=>{el.inert=!!on&&!el.matches('nav.hub-global-nav,#party')});const nav=app.querySelector('.hub-global-nav');if(nav)nav.inert=false};
const badgeCounts=()=>({reports:hc().quests.filter(q=>qstate(q).state===2).length,chapters:H.story.pending.filter(r=>!H.story.completed.includes(r)).length,appraisal:loot.古器+rareGear.length});
const activeQuest=()=>{const q=findQuest(H.tracked);return q&&[1,2].includes(qstate(q).state)?q:null};
const objective=()=>{const q=activeQuest();if(q){const s=qstate(q);return HB(q.n,s.state===2?'達成・ギルドへ報告':q.d+' · '+s.progress+'/'+q.target,'questSelect',[q.id])}return ''};
const warnings=()=>{const a=[];for(const i of (validFormation(H.formation)?H.formation.filter(x=>x!==null):[0,1,2,3,4,5])){const w=weightInfo(i),carry=eq[i][9].split('：')[1];if(vitals[i].hp<=0)a.push({i,text:'戦闘不能',action:'character'});if(statusText(i))a.push({i,text:statusText(i),action:'character'});if(!skillFits(i))a.push({i,text:'セットCost超過',action:'skills'});else if(!skillSet[i].length)a.push({i,text:'スキル未設定',action:'skills'});if(w.level)a.push({i,text:'重量 '+w.weight+'/'+w.limit,action:'equip'});if(carry!=='なし'&&!(inventory.tools[carry]>0))a.push({i,text:carry+' 残り0',action:'equip'})}return a};
const noticeList=()=>warnings().map(w=>HB(names[w.i]+' · '+w.text,'',''+w.action,[w.i])).join('');
const npcPortraits={受付:'../images/hub-guild-npc-cutout.webp',鍛冶師:'../images/hub-market-npc-cutout.webp',学者:'../images/hub-scholar-npc.webp',宿主:'../images/hub-inn-npc-cutout.webp',伝令:'../images/hub-messenger-npc.webp',守人:'../images/hub-keeper-npc.webp'};
const facilityVisuals={
 inn:{background:'../images/hub-inn-bg.webp',npc:'../images/hub-inn-npc-cutout.webp',name:'マルタ'},
 guild:{background:'../images/hub-guild-bg.webp',npc:'../images/hub-guild-npc-cutout.webp',name:'エダ'},
 market:{background:'../images/hub-market-bg.webp',npc:'../images/hub-market-npc-cutout.webp',name:'バルン'}
};
const facilityScene=(kind,title,body)=>{const v=facilityVisuals[kind];return '<section class="facility-scene facility-'+kind+'" style="--facility-bg:url(&quot;'+v.background+'&quot;)"><div class="facility-scene-art" aria-hidden="true"><img src="'+v.npc+'" alt=""></div><div class="facility-scene-copy"><span class="chapter-kicker">'+hesc(v.name)+'</span><h3>'+hesc(title)+'</h3></div></section><div class="facility-action-deck">'+body+'</div>'};
const personCard=(img,name,meta,action,args=[])=>'<button class="person-select-card"'+data(action,args)+'><img src="'+img+'" alt=""><span><b>'+hesc(name)+'</b><small>'+hesc(meta)+'</small></span><span class="member-arrow">›</span></button>';
const peopleGrid=items=>'<div class="people-select-grid">'+items.join('')+'</div>';
const memberGrid=()=>peopleGrid(names.map((n,i)=>personCard(battleCardArt(i),n,rows[i]+' · '+battleStyle(i),'character',[i])));
const facilityRouteGroup=n=>{
 if(/^(guild|guildDesk|questMenu|questSelect|reportChapter|appraiseMenu|rareAppraise|storageMenu|depositMenu|infoMenu|dungeonIntel|regionRecords|regionRecord|enemyBook|enemyRecord|clueRecord|recordList|guildMembers|guildSellMenu|guildSaleQuantity|guildSaleConfirm)$/.test(n))return 'guild';
 if(/^(market|gearShopMenu|toolShop|toolQuantity|weaponShop|gearDetail|armorShop|armorDetail|armorEquipMenu|craftMenu|recipeMenu|recipeDetail|upgradeMenu|traitMenu|traitChoice|sellMenu|materialTrade|materialQuantity)$/.test(n))return 'market';
 if(/^(inn|roomMenu|innRest|conversation|memberTalk|npcMenu|npcTalk|pairMenu|readPair|talkArchive|rumors|rumorDetail)$/.test(n))return 'inn';
 return '';
};
const facilityProfiles={
 guild:{home:'guild',label:'冒険者ギルド',kicker:'GUILD',npcId:'受付',npcName:'エダ',role:'ギルド受付',npc:'../images/hub-guild-npc-cutout.webp',world:'guild-world'},
 market:{home:'market',label:'市場',kicker:'MARKET',npcId:'鍛冶師',npcName:'バルン',role:'市場の鍛冶師',npc:'../images/hub-market-npc-cutout.webp',world:'market-world'},
 inn:{home:'inn',label:'宿・酒場',kicker:'INN',npcId:'宿主',npcName:'マルタ',role:'宿・酒場の主人',npc:'../images/hub-inn-npc-cutout.webp',world:'inn-world'}
};
const facilityLine=(kind,name,args=[])=>{
 if(kind==='guild'){
  if(name==='guild')return 'おかえりなさい。今日はどのご用件ですか？';
  if(name==='guildDesk')return '依頼と報告ですね。進んでいるものから確認しましょう。';
  if(name==='questMenu')return args[0]==='ready'?'達成済みの依頼があります。報告を受け付けますね。':'掲示板の依頼です。気になるものを選んでください。';
  if(name==='questSelect'){const q=findQuest(args[0]);return q?'「'+q.n+'」ですね。内容と報酬を確認してください。':'依頼の内容を確認しますね。'}
  if(name==='reportChapter')return '探索の報告ですね。記録をこちらへお願いします。';
  if(name==='infoMenu')return '探索資料をお出しします。調べたい項目を選んでください。';
  if(name==='dungeonIntel'||name==='regionRecords'||name==='regionRecord')return '現地から集まった記録をまとめています。必要なところを確認してください。';
  if(name==='enemyBook'||name==='enemyRecord')return '敵の記録ですね。過去の報告と照合してあります。';
  if(name==='clueRecord'||name==='recordList')return '調査記録はこちらです。新しい情報も追記してあります。';
  if(name==='appraiseMenu'||name==='rareAppraise')return '査定ですね。持ち帰った品を順番に見ていきましょう。';
  if(name==='storageMenu'||name==='depositMenu')return '保管品を確認します。必要なものだけ手元に戻せますよ。';
  if(name==='guildMembers')return '登録メンバーの情報ですね。確認したい方を選んでください。';
  if(/^guildSale/.test(name))return '装備の整理ですね。売却内容を一緒に確認します。';
 }
 if(kind==='market'){
  if(name==='market')return 'いらっしゃい。必要なものから見ていきな。';
  if(name==='gearShopMenu'||name==='weaponShop'||name==='gearDetail')return '武器は数字だけじゃなく、重さと使い手まで見て選ぶんだ。';
  if(name==='armorShop'||name==='armorDetail'||name==='armorEquipMenu')return '防具は守りと重さの釣り合いを見て選ぶといい。';
  if(name==='toolShop'||name==='toolQuantity')return '道具は使う場面を決めてから、必要な数だけ持っていきな。';
  if(name==='craftMenu'||name==='recipeMenu'||name==='recipeDetail')return '素材が揃ってるなら加工できる。仕上がりを確認してくれ。';
  if(name==='upgradeMenu')return '強化する武器を選びな。結晶と代金が必要だ。';
  if(name==='traitMenu'||name==='traitChoice')return '特性加工は上書きになる。今の特性も確認しておきな。';
  if(name==='sellMenu'||name==='materialTrade'||name==='materialQuantity')return '売るなら値段を確認してからだ。必要な分は残しておけよ。';
 }
 if(kind==='inn'){
  if(name==='inn')return 'おかえり。体は休ませておくから、旅の話を聞かせてね。';
  if(name==='roomMenu'||name==='innRest')return '部屋はいつでも使えるよ。休んでから次の準備をしようか。';
  if(name==='conversation'||name==='memberTalk')return '仲間と話すなら、ここなら落ち着いて話せるよ。';
  if(name==='npcMenu'||name==='npcTalk')return '今夜もいろんな人が来てるよ。気になる人に声をかけてみな。';
  if(name==='pairMenu'||name==='readPair')return '仲間同士の話も、旅の大事な記録になるものだよ。';
  if(name==='talkArchive')return '前に交わした話を読み返すんだね。';
  if(name==='rumors'||name==='rumorDetail')return '噂話も、集めてみると道しるべになることがあるよ。';
 }
 if(name==='confirmAction')return '内容を確認してから手続きを進めてください。';
 if(name==='checkpointResult')return kind==='inn'?'旅の会話を記録しました。':kind==='guild'?'報告と記録を確認しました。':'結果を確認してください。';
 if(name==='note')return 'ご案内があります。内容を確認してください。';
 const p=facilityProfiles[kind],npc=hc().npcs.find(n=>n.id===p?.npcId);
 return npc?.text?.[0]||'ご用件を確認しますね。';
};
const facilityGuestPeople=(kind,r,temp)=>{
 if(kind!=='inn'||!window.HUB_VISUAL?.person||!window.HUB_VISUAL?.portrait)return '';
 const V=window.HUB_VISUAL,people=[];
 if(r.name==='memberTalk')people.push(V.person('ally',r.args?.[0]));
 else if(r.name==='npcTalk')people.push(V.person('npc',r.args?.[0]));
 else if(r.name==='readPair'){const pair=hc().pairs[r.args?.[0]];if(pair){people.push(V.person('ally',pair[0]),V.person('ally',pair[1]))}}
 else if(r.name==='talkArchive')people.push(V.person(r.args?.[0]==='npc'?'npc':'ally',r.args?.[1]));
 const ps=people.filter(Boolean);if(!ps.length)return '';
 return '<div class="facility-world-guests" aria-label="会話相手">'+ps.map(p=>V.portrait(p,'facility-world-guest-face')).join('')+'</div>';
};
const renderFacilityWorld=(kind,html,r)=>{
 const p=facilityProfiles[kind];if(!p)return;
 const app=document.getElementById('app'),screen=document.getElementById('screen'),modal=document.getElementById('modal'),panel=document.getElementById('panel');
 app.classList.add('town-world','facility-world',p.world);app.classList.remove('actor-overlay-open');for(const k of Object.values(facilityProfiles))if(k.world!==p.world)app.classList.remove(k.world);app.classList.remove('in-expedition');app.dataset.facility=kind;
 modal.classList.remove('on','guild-screen-modal','hub-overlay-modal','hub-location-modal','hub-map-modal');panel.classList.remove('guild-screen-panel');setHubContentInert(false);
 document.querySelector('h1').textContent='王都レクシア';document.querySelector('header .small').textContent=p.label;document.getElementById('money').textContent=moneyText(gold);
 const temp=document.createElement('div');temp.innerHTML=html;
 const title=temp.querySelector('h2')?.textContent||p.label;temp.querySelector('h2')?.remove();
 temp.querySelectorAll('button').forEach(b=>{const t=b.textContent.trim();if(b.dataset.hub==='closeM'||/^(戻る|一覧へ|一覧|ギルドへ|市場へ|宿・酒場へ|拠点へ)$/.test(t))b.remove()});
 temp.querySelectorAll('.actions').forEach(a=>{if(!a.children.length)a.remove()});
 const home=r.name===p.home,guests=facilityGuestPeople(kind,r,temp);
 screen.innerHTML='<section class="town-scene facility-world-scene '+p.world+'-scene '+(home?'facility-world-mode-home':'facility-world-mode-service')+'">'+(home?'':'<div class="facility-world-title"><span class="chapter-kicker">'+p.kicker+'</span><b>'+hesc(title)+'</b></div>')+'<img class="facility-world-npc" src="'+p.npc+'" alt="'+hesc(p.role+' '+p.npcName)+'">'+guests+'<div class="facility-world-identity"><b>'+hesc(p.npcName)+'</b><small>'+hesc(p.role)+'</small><button type="button" data-hub="uiFacilityTalk">TALK</button></div><div class="facility-world-controls"><div class="facility-world-dialogue"><b>'+hesc(p.npcName)+'</b><span>'+hesc(facilityLine(kind,r.name,r.args||[]))+'</span></div><section class="facility-world-overlay '+(home?'facility-world-home facility-world-home-'+kind:'facility-world-service')+'">'+temp.innerHTML+'</section></div></section>';
 if(window.HUB_VISUAL?.decorate)window.HUB_VISUAL.decorate(screen,r);
 if(window.HUB_VISUAL?.chrome)window.HUB_VISUAL.chrome();
 renderRoster();renderSaveStatus();navState(r.name);
};

const navState=n=>{
 const nav=document.querySelector('#app .hub-global-nav');if(!nav)return;
 const back=nav.querySelector('[data-nav="back"]'),home=nav.querySelector('[data-nav="home"]'),map=nav.querySelector('[data-nav="map"]');
 const atHome=!n||n==='town',atMap=['partyMenu','dungeon','deployment'].includes(n);
 if(back)back.disabled=!(isOpen()||document.getElementById('app').classList.contains('facility-world'));
 for(const [el,on] of [[home,atHome],[map,atMap]])if(el){el.classList.toggle('current',!!on);if(on)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')}
};
const selectionOverlay=()=>{
 const panel=document.getElementById('panel'),footer=panel.querySelector('.panel-footer');if(!footer)return;
 footer.querySelector('.selection-overlay')?.remove();const d=U.detail;for(const child of footer.children)child.inert=!!d&&!child.classList.contains('equipment-bottom-operation');if(!d)return;
 let description='',action='';
 if(d.kind==='skill'){const m=rules().meta(d.n);if(!m)return;description=skillExplanation(m)+' '+skillDescription(m)+(m.costType?' / '+m.costType+' '+m.cost:'');}
 else{const row=[...panel.querySelectorAll('.candidate button')].find(e=>JSON.parse(e.dataset.args)[2]===d.n);description=row?.querySelector('.small')?.textContent||'';}
 footer.insertAdjacentHTML('beforeend','<section class="selection-overlay" aria-label="選択した項目の説明" aria-live="polite"><div><b>'+hesc(d.n)+'</b></div><p>'+hesc(description)+'</p>'+action+'</section>');
 const operation=footer.querySelector('.equipment-bottom-operation');if(operation){const overlay=footer.querySelector('.selection-overlay');overlay.style.top=(operation.getBoundingClientRect().bottom-footer.getBoundingClientRect().top+4)+'px';overlay.style.minHeight='0'}
};
const showUI=html=>{
 const priorFocus=document.activeElement,focusAction=priorFocus?.dataset?.hub,focusArgs=priorFocus?.dataset?.args;const panel=document.getElementById('panel'),modal=document.getElementById('modal'),open=isOpen(),scroll=panel.querySelector('.panel-body')?.scrollTop||0,r=U.render||{name:'note',args:['メニューを閉じて操作を続けてください。']};
 const waitingActor=actorRouteName(r.name)?Number(r.args?.[0]):-1;
 if(!activeRun()&&Number.isInteger(waitingActor)&&waitingActor>=0&&waitingActor<standArts.length&&!standArtReady(waitingActor)){
  const token=++actorRenderToken,route={name:r.name,args:[...(r.args||[])]};
  ensureStandArt(waitingActor).then(()=>{if(token!==actorRenderToken)return;const fn=window[route.name];if(typeof fn==='function')fn(...route.args)});
  return;
 }
 actorRenderToken++;
 const app=document.getElementById('app'),worldOpen=app.classList.contains('facility-world'),townContext=app.classList.contains('town-world'),expeditionContext=activeRun(),currentKind=app.dataset.facility||'',routeKind=facilityRouteGroup(r.name),transientKind=worldOpen&&['confirmAction','checkpointResult','note'].includes(r.name)?currentKind:'',facilityKind=routeKind||transientKind,sameWorld=key(U.route)===key(r),mapRoute=expeditionContext||/^(partyMenu|readiness|dungeon|deployment|presetMenu|askSavePreset|squadMenu|rowSwapMenu)$/.test(r.name),hubOverlay=true;
 if(facilityKind&&!activeRun()){
  if(!worldOpen){U.stack=[];U.opener=U.launcher||document.activeElement;U.launcher=null}
  else if(U.route&&!sameWorld&&!U.back)U.stack.push(recordRoute(U.route,0));
  if(U.stack.length>24)U.stack.shift();U.route={name:r.name,args:r.args.slice()};
  renderFacilityWorld(facilityKind,html,r);return;
 }
 const keepPlace=worldOpen||townContext||expeditionContext;
 const guildShell=false;modal.classList.remove('guild-screen-modal');panel.classList.remove('guild-screen-panel');
 if(keepPlace){const placeStyle=getComputedStyle(app);modal.style.setProperty('--hub-place-bg',placeStyle.backgroundImage);modal.style.setProperty('--hub-place-pos',placeStyle.backgroundPosition||'center center')}else{modal.style.removeProperty('--hub-place-bg');modal.style.removeProperty('--hub-place-pos')}
 modal.classList.toggle('hub-overlay-modal',hubOverlay);
 modal.classList.toggle('hub-location-modal',hubOverlay&&!mapRoute&&keepPlace);
 modal.classList.toggle('hub-map-modal',hubOverlay&&mapRoute);
 if(!['equip','equipChoice'].includes(r.name))fittingDiscard();
 if(r.name!=='actorAttributes')attributeDiscard();
 if(U.detail&&(Number(r.args[0])!==U.detail.i||(U.detail.kind==='skill'?r.name!=='skills':!['equip','equipChoice'].includes(r.name)||Number(r.args[1]||0)!==U.detail.k)))U.detail=null;
 if(!['mastery','masteryType','growMastery','masterySkills','charMastery','charAbility'].includes(r.name))masteryDiscard();
 const same=key(U.route)===key(r);if(!open){if(worldOpen&&U.route&&!same&&!U.back)U.stack.push(recordRoute(U.route,0));else if(!U.back)U.stack=[];U.opener=U.launcher||document.activeElement;U.launcher=null}else if(U.route&&!same&&!U.back)U.stack.push(recordRoute(U.route,scroll));if(U.stack.length>24)U.stack.shift();U.route={name:r.name,args:r.args.slice()};
 const temp=document.createElement('div');temp.innerHTML=html;const title=temp.querySelector('h2'),heading=title?.textContent||'メニュー';if(title)title.remove();
 // Navigation remains at the bottom; commit actions belong to the content they change.
 const confirmation=[...temp.querySelectorAll('.actions')].find(a=>[...a.querySelectorAll('button')].some(b=>/^(やめる|取り消す|取消|キャンセル)$/.test(b.textContent.trim())));
 let cancelRoute=null;
 if(confirmation){for(const b of confirmation.querySelectorAll('button'))if(b.dataset.hub==='closeM'){b.dataset.hub='uiBack';b.textContent='取り消す'}for(const b of [...confirmation.querySelectorAll('button')])if(/^(やめる|取り消す|取消|キャンセル)$/.test(b.textContent.trim())){if(b.dataset.hub&&b.dataset.hub!=='uiBack')cancelRoute={action:b.dataset.hub,args:b.dataset.args||'[]'};b.remove()}confirmation.className='inline-confirm';}
 temp.querySelectorAll('button').forEach(b=>{if(b.dataset.hub==='closeM'||/^(戻る|一覧へ|一覧|ギルドへ|市場へ|編成へ|宿・酒場へ|加工へ|キャラクターへ)$/.test(b.textContent.trim()))b.remove()});
 temp.querySelectorAll('.actions').forEach(a=>{if(!a.children.length)a.remove()});
 const confirm=temp.querySelector('.fitting-confirm'),confirmMarkup=confirm?.outerHTML||'';confirm?.remove();
 const filters=temp.querySelector('.fitting-filters'),filtersMarkup=filters?.outerHTML||'';filters?.remove();
 const controls=temp.querySelector('.fitting-controls');if(controls){const left=document.createElement('div'),right=document.createElement('div');left.className='equipment-top-weapons';right.className='equipment-top-other';const swap=controls.querySelector('[data-hub="fittingSwap"]');if(swap)right.append(swap);controls.querySelectorAll('[data-hub="equipChoice"]').forEach(b=>(Number(JSON.parse(b.dataset.args)[1])<4?left:right).append(b));controls.replaceChildren(left,right)}const controlsMarkup=controls?.outerHTML||'';controls?.remove();
 const actorRoute=actorRouteName(r.name),actorId=Number(r.args[0]),mode=actorMode(r.name),overview=false;app.classList.toggle('actor-overlay-open',actorRoute&&hubOverlay);
 temp.querySelector('.actor-tabs')?.remove();
 const basics=temp.querySelector('.status-basics'),basicsMarkup=basics?.outerHTML||'';basics?.remove();
 if(actorRoute&&!overview)temp.querySelector('.actor-hero')?.remove();
 panel.classList.toggle('field-node-panel',expeditionContext&&/^(battlePrep|explorationNode|eventChoice|camp|campMorale|merchantNode|dungeonForge|dungeonTraitMenu|dungeonTraitChoice|stairsMenu|mechanismMenu|secretNode|eliteReward)$/.test(r.name));panel.classList.toggle('field-stock-panel',expeditionContext&&/^(merchantNode|dungeonForge|dungeonTraitMenu)$/.test(r.name));
 panel.classList.toggle('field-battle-panel',expeditionContext&&r.name==='battlePrep');
 panel.classList.toggle('field-search-panel',expeditionContext&&r.name==='explorationNode');
 panel.classList.toggle('status-overview',overview);panel.classList.toggle('status-growth',r.name==='charAbility');panel.classList.toggle('actor-workspace',actorRoute);
 const hero=temp.querySelector('.actor-hero,.fitting-summary');const heroMarkup=hero?.outerHTML||'';hero?.remove();
 panel.classList.toggle('actor-panel',!!heroMarkup);
 const fixed=document.createElement('div');fixed.className='actor-fixed';
 if(actorRoute&&!overview)for(const child of [...temp.children])if(child.matches('p.small:not(.screen-hint):not(.ui-help),.section-meta,.cost-meter,.ui-tabs,.search-input,.attribute-heading,.allocation-bar,.allocation-grid')||r.name==='growMastery'&&child.matches('button')&&child.textContent.includes('成長 +5')){fixed.append(child)}
 panel.classList.toggle('hub-settings-panel',r.name==='settings');panel.classList.toggle('status-skills',!!temp.querySelector('.skills-workspace'));panel.classList.toggle('status-mastery',!!temp.querySelector('.mastery-workspace'));panel.classList.toggle('status-attributes',r.name==='actorAttributes');panel.classList.toggle('status-equipment',!!controlsMarkup||!!temp.querySelector('.character-equipment-shell'));
 const fixedMarkup=fixed.children.length?fixed.outerHTML:'';
 const backdrop=actorRoute?'<div class="actor-backdrop" aria-hidden="true"><img src="'+standArt(actorId)+'" alt="" decoding="sync" fetchpriority="high"></div>':'';

 const trade=/guildSell|guildSale|market|Shop|Quantity|gearDetail|recipe|Recipe|craft|upgrade|trait|sell|storage|deposit|appraise|Appraise|merchant/.test(r.name);
 panel.innerHTML=backdrop+'<div class="panel-head">'+(guildShell?'<div class="guild-head-copy"><h2 id="panelTitle" tabindex="-1">'+hesc(heading)+'</h2><button class="guild-home-return" type="button" data-hub="closeM" aria-label="冒険者区へ戻る">‹ 冒険者区</button></div>':'<h2 id="panelTitle" tabindex="-1">'+hesc(heading)+'</h2>')+(trade?'<span class="panel-money">'+moneyText(gold)+'</span>':'')+'</div>'+(controlsMarkup?controlsMarkup+'<div class="equipment-workspace"><aside class="equipment-left">'+heroMarkup+'</aside><div class="equipment-right"><div class="equipment-list-bar"><b>装備候補</b>'+filtersMarkup+'</div><div class="panel-body">'+temp.innerHTML+'</div>'+confirmMarkup+'</div></div>':heroMarkup+basicsMarkup+fixedMarkup+'<div class="panel-body">'+temp.innerHTML+'</div>')+'<footer class="panel-footer" aria-label="画面の操作"><div class="panel-navigation"><button class="panel-back" data-hub="uiBack" aria-label="前の画面へ"'+(!U.stack.length?' hidden':'')+'>‹ 戻る</button><button class="modal-x" data-hub="closeM" aria-label="閉じる">閉じる</button></div></footer>';

 if(guildShell){
  const nav=panel.querySelector('.panel-navigation'),exit=nav?.querySelector('.modal-x');
  exit?.remove();
  if(nav&&!nav.querySelector('.panel-back:not([hidden])'))nav.remove();
 }
 const footer=panel.querySelector('.panel-footer');
 const secondary=document.createElement('div');secondary.className='bottom-tabs';
 panel.querySelectorAll('.ui-tabs:not(.actor-tabs .ui-tabs)').forEach(el=>secondary.append(el));
 if(secondary.children.length)footer.prepend(secondary);
 if(r.name==='partyMenu'){
  const sortieTabs=panel.querySelector('.sortie-tabs');
  if(sortieTabs)footer.prepend(sortieTabs);
 }
 if(controlsMarkup){const operation=document.createElement('div');operation.className='equipment-bottom-operation';const slots=document.createElement('div');slots.className='equipment-bottom-slots';slots.setAttribute('aria-label','装備枠');panel.querySelectorAll('.fitting-controls [data-hub="equipChoice"]').forEach(el=>{const b=el.cloneNode(true),k=Number(JSON.parse(b.dataset.args)[1]);b.textContent=({0:'主',1:'副',2:'予主',3:'予副',4:'防具',8:'装飾',9:'携行'})[k];slots.append(b)});operation.append(slots,panel.querySelector('.fitting-confirm'));footer.prepend(operation)}
 if(actorRoute){const nav=panel.querySelector('.panel-navigation'),exit=nav?.querySelector('.modal-x');if(!hubOverlay&&exit){exit.classList.add('actor-exit');exit.textContent='地図へ';exit.setAttribute('aria-label','地図へ戻る');panel.querySelector('.panel-head')?.append(exit)}nav?.remove();if(!footer.children.length)footer.remove()}
 if(cancelRoute&&panel.querySelector('.panel-back')){const back=panel.querySelector('.panel-back');back.hidden=false;back.dataset.hub=cancelRoute.action;back.dataset.args=cancelRoute.args}
 if(hubOverlay){
  const nav=panel.querySelector('.panel-navigation');
  nav?.querySelector('.modal-x')?.remove();
  const back=nav?.querySelector('.panel-back');
  if(back?.dataset.hub==='uiBack')back.remove();
  if(nav&&!nav.children.length)nav.remove();
 }
 selectionOverlay();panel.setAttribute('aria-labelledby','panelTitle');panel.setAttribute('aria-modal',hubOverlay?'false':'true');document.getElementById('modal').classList.add('on');if(hubOverlay)setHubContentInert(true);else document.getElementById('app').inert=true;panel.scrollTop=0;const body=panel.querySelector('.panel-body');if(same)body.scrollTop=scroll;document.querySelectorAll('#party .m').forEach((card,i)=>{const selected=actorRoute&&i===actorId;card.classList.toggle('selected',selected);if(selected)card.setAttribute('aria-current','true');else card.removeAttribute('aria-current')});navState(r.name);const nextFocus=same&&focusAction?[...panel.querySelectorAll('[data-hub]')].find(e=>e.dataset.hub===focusAction&&e.dataset.args===focusArgs&&!e.disabled):null;(nextFocus||panel.querySelector('#panelTitle')).focus({preventScroll:true});
};
const closeUI=()=>{
 U.detail=null;masteryDiscard();fittingDiscard();attributeDiscard();
 const modal=document.getElementById('modal'),panel=document.getElementById('panel'),app=document.getElementById('app'),locationKind=app.dataset.facility||'';
 modal.classList.remove('on','guild-screen-modal','hub-overlay-modal','hub-location-modal','hub-map-modal');panel.classList.remove('guild-screen-panel');app.classList.remove('actor-overlay-open');setHubContentInert(false);app.inert=false;
 const facilityFrame=locationKind?[...U.stack].reverse().find(f=>f.route&&facilityRouteGroup(f.route.name)===locationKind):null;
 U.route=null;U.formationSelected=null;
 if(hubBooted){
  if(!activeRun()){
   if(locationKind){
    const route=facilityFrame?.route||{name:facilityProfiles[locationKind]?.home,args:[]};U.stack=[];U.back=true;
    try{const fn=window[route.name];if(typeof fn==='function')fn(...(route.args||[]));else window.town()}finally{U.back=false}
   }else{U.stack=[];window.town()}
  }else navState('town')
 }
 const target=U.opener;U.opener=null;const fallback=target?.dataset?.hub?[...document.querySelectorAll('#app [data-hub]')].find(e=>e.dataset.hub===target.dataset.hub&&e.dataset.args===target.dataset.args):null,focusableTarget=target?.isConnected&&target.matches?.('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?target:null;(focusableTarget||fallback||document.querySelector('#app nav .current')||document.querySelector('#app nav button:not(:disabled)'))?.focus({preventScroll:true});
};
const toast=text=>{const e=document.getElementById('uiToast');if(!e)return;e.textContent=text;e.hidden=false;clearTimeout(U.toast);U.toast=setTimeout(()=>e.hidden=true,2400)};
const uiActions={
 uiHubBack(){if(isOpen())return uiActions.uiBack();if(document.getElementById('app').classList.contains('facility-world')){const frame=U.stack.pop();if(!frame)return town();U.back=true;try{const fn=window[frame.route.name];if(typeof fn==='function')fn(...frame.route.args);else town()}finally{U.back=false}}},
 uiFacilityTalk(){const app=document.getElementById('app'),kind=app.dataset.facility,p=facilityProfiles[kind],line=document.querySelector('.facility-world-dialogue span');if(!p||!line)return;const npc=hc().npcs.find(n=>n.id===p.npcId),list=npc?.text||[];const current=line.textContent,next=list.find(x=>x!==current)||list[0];if(next)line.textContent=next},
 uiDetailClose(){U.detail=null;selectionOverlay()},
 uiSkillInspect(i,n){if(!learned[i]?.includes(n))return;U.detail=U.detail?.kind==='skill'&&U.detail.i===i&&U.detail.n===n?null:{kind:'skill',i,n};selectionOverlay();document.querySelectorAll('.skill-toggle').forEach(e=>e.classList.toggle('inspected',!!U.detail&&JSON.parse(e.dataset.args)[1]===n))},
 uiDetailSkillSet(i,n){toggleLearnedSkill(i,n)},
 uiSkillMastery(i,g){U.detail=null;U.skillMasteries[i]=g;skills(i)},
 uiMasteryRank(i,g,d){masteryRankAdjust(i,g,d)},
 uiMasterySkill(i,g,b,n){masterySkillToggle(i,g,b,n)},
 uiMasteryApply(i){masteryApply(i)},
 uiMasteryBranch(i,g,b){const s=masterySelection;if(s?.i!==i||s.g!==g)return masterySkills(i,g,b);const opened=new Set(s.openBranches||[]);if(opened.has(b))opened.delete(b);else opened.add(b);s.openBranches=[...opened];return masterySkills(i,g,opened.has(b)?b:'')},
 uiBack(){const frame=U.stack.pop();if(!frame)return closeUI();U.back=true;try{const fn=window[frame.route.name];if(typeof fn==='function')fn(...frame.route.args);else closeUI();const b=document.querySelector('#panel .panel-body');if(b)b.scrollTop=frame.scroll}finally{U.back=false}},
 uiActor(i,tab='equip'){if(!Number.isInteger(i)||i<0||i>=6)return;({overview:equip,status:window.statusView,attributes:actorAttributes,equip,skills,growth:charAbility}[tab]||equip)(i)},
 uiFormationCell(pos){if(H.run?.battle)return pendingBattleMenu();if(!Number.isInteger(pos)||pos<0||pos>8)return;ensureFormation();const selected=U.formationSelected;if(selected==null){if(H.formation[pos]==null)return;U.formationSelected=pos;return partyMenu('formation')}if(selected===pos){U.formationSelected=null;return partyMenu('formation')}const value=H.formation[selected];H.formation[selected]=H.formation[pos];H.formation[pos]=value;U.formationSelected=null;syncFormationRows();persist();partyMenu('formation')},
 uiRosterBench(i){if(activeRun()||!Number.isInteger(i)||i<0||i>=names.length)return;ensureFormation();const at=H.formation.indexOf(i);if(at<0)return;if(H.formation.filter(x=>x!==null).length===1)return toast('出撃メンバーは1人以上必要です');H.formation[at]=null;U.formationSelected=null;syncFormationRows();persist();partyMenu('composition')},
 uiRosterDeploy(i){if(activeRun()||!Number.isInteger(i)||i<0||i>=names.length)return;ensureFormation();if(H.formation.includes(i))return;const at=H.formation.findIndex(x=>x===null);if(at<0||H.formation.filter(x=>x!==null).length>=6)return toast('出撃枠は6人までです');H.formation[at]=i;syncFormationRows();persist();partyMenu('composition')},
 uiClearTrack(){H.tracked=null;persist();questMenu('active')},
 uiDismissStatus(){closeM();settings()},
 uiCarryUsers(n){if(H.run?.battle)return pendingBattleMenu();if(!hc().tools[n]?.battle)return;show('<h2>'+hesc(n)+'を携行</h2>'+names.map((name,i)=>HB(name,eq[i][9],'setEquip',[i,9,n])).join(''))},
 uiMapLegend(){show('<h2>地図の見方</h2><div class="legend-grid">'+[['battle','戦闘'],['explore','調査'],['event','出来事'],['camp','野営'],['elite','強敵'],['merchant','旅商人'],['forge','工房'],['stairs','次の層']].map(([type,t])=>HT(nodeIcon({type})+' '+t)).join('')+'</div><p class="small">明るい地点を選択。進んだ後は、前の分岐へ戻れません。</p>')},
 uiSupply(){if(!requireTown())return;toolShop('field')},
 uiQuestList(){questMenu('active')},
 uiInventory(t){U.inventory=t;itemCategory(t)},
 uiSearchSkills(value){if(U.route?.name==='skills')U.search[U.route.args[0]]=value;filterSkillRows(value)},
 uiEquipTypeMenu(){const menu=document.querySelector('#panel .fitting-filter-options'),button=document.querySelector('#panel .fitting-filter-current');if(!menu||!button)return;menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden))},
 uiEquipFilter(i,k,t){U.detail=null;fittingFilter(i,k,t)},
 uiEquipPreview(i,k,n){if(!Number.isInteger(i)||!Number.isInteger(k))return;U.detail=U.detail?.kind==='equip'&&U.detail.i===i&&U.detail.k===k&&U.detail.n===n?null:{kind:'equip',i,k,n};window.equipChoice(i,k,n)},
 uiNotify(text){toast(String(text))}
};
Object.assign(window,uiActions);
const views={
 guildMembers(){if(!requireTown())return;show('<h2>メンバー管理</h2>'+HT('登録メンバー '+names.length+'人','下部の共通キャラカードから装備・能力・スキルを開けます。')+HB('出撃編成','出撃とギルド待機を入れ替える','partyMenu',['composition'])+HB('編成プリセット','装備・スキル・陣形を保存・呼出し','presetMenu'))},
 back(){return ''},show:showUI,closeM:closeUI,
 statusView(i){const v=vitals[i],s=characterValues(i),values=[['PHY',s.phy],['SKL',s.skl],['ARC',s.arc],['MND',s.mnd],['物理攻撃力',s.physical],['魔法攻撃力',s.magicArc],['物理防御力',s.pdef],['魔法防御力',s.mdef]];show('<h2>'+hesc(names[i])+' / ステータス</h2><section class="status-basics">'+characterExperience()+resources(i)+'</section><section class="status-value-grid" aria-label="能力と戦闘値">'+values.map(([label,value])=>'<div><small>'+label+'</small><b>'+value+'</b></div>').join('')+'</section>'+HT('戦闘状態',v.hp<=0?'戦闘不能':statusText(i)||'正常')+HT('装備重量',s.weight+' / '+s.limit))},
 town(){if(activeRun()){closeM();return drawDungeon()}
 const app=document.getElementById('app');app.classList.add('town-world');app.classList.remove('actor-overlay-open');app.classList.remove('in-expedition','facility-world','guild-world','market-world','inn-world');app.style.removeProperty('--expedition-bg');delete app.dataset.facility;const nav=app.querySelector('.hub-global-nav');nav.querySelector('[data-nav="home"]').setAttribute('data-hub','town');nav.querySelector('[data-nav="map"]').setAttribute('data-hub','partyMenu');nav.querySelector('[data-nav="home"] b').textContent='HOME';
 document.getElementById('modal').classList.remove('on','hub-overlay-modal','hub-location-modal','hub-map-modal');setHubContentInert(false);app.inert=false;U.route=null;U.stack=[];
 document.querySelectorAll('#party .m').forEach(card=>{card.classList.remove('selected');card.removeAttribute('aria-current')});document.querySelector('h1').textContent='王都レクシア';document.querySelector('header .small').textContent=H.story.ending?'調査のつづき':'冒険者区';
 const b=badgeCounts(),next=H.story.intro?storyObjective():'地下から響く鐘';
 const notices=(b.chapters?HB('探索結果 '+b.chapters+'件','','guild'):'')+(b.reports?HB('依頼報告 '+b.reports+'件','','questMenu',['ready']):'')+(b.appraisal?HB('査定 '+b.appraisal+'点','','appraiseMenu'):'');
 document.getElementById('screen').innerHTML='<section class="town-scene town-home"><button class="town-objective-button"'+data('storyMenu')+'><span class="chapter-kicker">NEXT</span><b>'+hesc(next)+'</b><span class="town-objective-arrow">›</span></button>'+(objective()?'<div class="tracked-objective">'+objective()+'</div>':'')+(notices?'<div class="attention-strip">'+notices+'</div>':'')+'<div class="town-command-grid">'+place('♨','宿屋','休息・会話','inn')+place('⚜','ギルド','依頼・資料','guild')+place('⚒','市場','購入・加工','market')+'</div></section>';
 document.getElementById('money').textContent=moneyText(gold);renderRoster();renderSaveStatus();navState('town')
 },
 renderRoster(){if(!stats||!vitals)return;document.querySelectorAll('#party .m').forEach((b,i)=>{const m=rules().derived(stats[i]),v=vitals[i],state=statusText(i);b.classList.toggle('down',v.hp<=0);b.title=names[i]+' / HP '+v.hp+'/'+m.hp+' / SP '+v.sp+'/'+m.sp+(state?' / '+state:'');b.setAttribute('aria-label',b.title);b.innerHTML='<span class="hub-roster-name">'+hesc(names[i])+'</span>'+['hp','sp'].map(k=>'<span class="hub-roster-meter"><span class="hub-roster-metric"><small>'+k.toUpperCase()+'</small><b>'+v[k]+'/'+m[k]+'</b></span><span class="hub-roster-track '+k+'"><span style="width:'+(m[k]?Math.max(0,Math.min(100,v[k]/m[k]*100)):0)+'%"></span></span></span>').join('')+(state?'<span class="roster-alert" aria-label="状態異常あり">!</span>':'')})},
 partyMenu(tab='dungeon'){
  if(H.run?.battle)return pendingBattleMenu();
  if(tab==='destination')tab='dungeon';if(tab==='members')tab='composition';
  if(!['dungeon','formation','composition'].includes(tab))tab='dungeon';
  if(activeRun())tab='formation';
  U.sortie=tab;ensureFormation();
  const deployed=H.formation.filter(i=>i!==null),waiting=names.map((_,i)=>i).filter(i=>!deployed.includes(i)),ws=warnings(),labels=['前','中','後'];
  const navigation='<div class="sortie-tabs" role="group" aria-label="出撃準備の切替">'+[['composition','編成'],['formation','陣形'],['dungeon','ダンジョン']].map(([v,n])=>'<button type="button"'+data('partyMenu',[v])+' aria-pressed="'+(v===tab)+'">'+n+'</button>').join('')+'</div>';
  let body='';
  if(tab==='formation'){
   const selected=U.formationSelected;
   const cell=pos=>{const i=H.formation[pos],sel=selected===pos;if(i==null)return '<button class="formation-empty"'+data('uiFormationCell',[pos])+' aria-label="'+labels[Math.floor(pos/3)]+'列 空き">＋</button>';const issue=ws.filter(w=>w.i===i);return '<div class="formation-member '+(sel?'selected ':'')+(issue.length?'has-issue':'')+'"><button class="formation-pick"'+data('character',[i])+' aria-label="'+hesc(names[i])+'のキャラ画面へ"><img src="'+battleCardArt(i)+'" alt=""><b>'+hesc(names[i])+'</b>'+(issue.length?'<span class="formation-issue" title="'+hesc(issue.map(w=>w.text).join(' / '))+'" aria-label="'+hesc(issue.map(w=>w.text).join(' / '))+'">!</span>':'')+'</button><button class="formation-config"'+data('uiFormationCell',[pos])+' aria-pressed="'+sel+'" aria-label="'+hesc(names[i])+'の配置を変更">'+(sel?'✓':'↔')+'</button></div>'};
   body='<p class="sortie-instruction">画像でキャラ画面へ。配置変更で移動元と移動先を選択。</p><div class="formation-board sortie-formation">'+[0,1,2].map(r=>'<div class="formation-row"><span class="formation-row-label">'+labels[r]+'</span><div class="formation-slots">'+[0,1,2].map(col=>cell(r*3+col)).join('')+'</div></div>').join('')+'</div>';
  }else if(tab==='composition'){
   const card=(i,active)=>'<div class="sortie-member '+(active?'deployed':'waiting')+'"><button class="sortie-member-face"'+data('character',[i])+' aria-label="'+hesc(names[i])+'のキャラ画面へ"><img src="'+battleCardArt(i)+'" alt=""><b>'+hesc(names[i])+'</b></button><button class="sortie-member-action"'+data(active?'uiRosterBench':'uiRosterDeploy',[i])+' aria-label="'+hesc(names[i])+(active?'をギルド待機にする':'を出撃させる')+'">'+(active?'待機':'出撃')+'</button></div>';
   body='<div class="sortie-composition"><section><h3>出撃 '+deployed.length+' / 6 <small>ギルド待機 '+waiting.length+'人</small></h3><div class="sortie-member-grid">'+deployed.concat(waiting).map(i=>card(i,deployed.includes(i))).join('')+'</div></section><button class="sortie-preset-link"'+data('presetMenu')+'>編成プリセットを開く ›</button></div>';
  }else{
   const id=unlocked.includes(H.selected)?H.selected:unlocked[unlocked.length-1],r=hc().regions[id];
   body='<div class="destination-brief"><b>'+hesc(id)+'</b><small>'+hesc(r.mechanism)+'\n全3層</small></div>'+HB('行き先を変更','','dungeon')+HB('準備確認',ws.length?ws.length+'件の要確認':'問題なし','readiness')+'<div class="sortie-deploy-count">出撃 '+deployed.length+' / 6人</div><div class="sticky-action sortie-start"><button class="primary-action" data-hub="startDungeon">出撃 →</button></div>';
  }
  show(activeRun()?'<h2>戦闘前確認</h2>'+body+HB('戦闘地点へ戻る','装備・スキル・列を確認して戦闘を選ぶ','battlePrep'):'<h2>出撃準備</h2>'+navigation+body);
 },
 character(i){if(H.run?.battle)return pendingBattleMenu();if(!Number.isInteger(i)||i<0||i>=6)return;return fittingScreen(i,null)},
 charOverview(i){return character(i)},
 charAbility(i){return mastery(i)},
 resistView(i){const r=calcResist(i);show('<h2>'+names[i]+' / 耐性</h2>'+actorHero(i)+section('属性','<div class="resist-grid">'+['斬','突','壊','火','水','風','土','光','闇'].map(k=>'<span>'+k+' <b>'+(r[k]?r[k]+'%':'—')+'</b></span>').join('')+'</div>')+section('状態異常・封じ','<div class="resist-grid">'+Object.keys(r).filter(k=>!['斬','突','壊','火','水','風','土','光','闇'].includes(k)).map(k=>'<span>'+k+' <b>'+(r[k]?r[k]+'%':'—')+'</b></span>').join('')+'</div>')+'<p class="small">— は追加耐性なし。</p>')},
 equip(i){return fittingScreen(i,null)},
 equipChoice(i,k,preview){return fittingScreen(i,k,preview)},
 skills(i,filter){if(H.run?.battle)return pendingBattleMenu();if(filter!==undefined)U.filters[i]=filter;filter=U.filters[i]||'All';if(filter==='All'||!['set','Active','Passive'].includes(filter))filter='All';U.filters[i]=filter;const all=learned[i].filter(n=>rules().meta(n)),groups=['すべて',...Object.keys(rules().masteries).filter(g=>all.some(n=>rules().meta(n).unlocks?.some(u=>u.mastery===g)))];let group=U.skillMasteries[i]||'すべて';if(!groups.includes(group))group='すべて';U.skillMasteries[i]=group;const navigation='<aside class="skill-masteries" aria-label="スキルのマスタリー">'+groups.map(g=>'<button'+data('uiSkillMastery',[i,g])+' aria-pressed="'+(g===group)+'">'+hesc(g)+'</button>').join('')+'</aside>';const query=U.search[i]||'',chosen=skillSet[i],ns=all.filter(n=>(group==='すべて'||rules().meta(n).unlocks?.some(u=>u.mastery===group))&&(filter==='All'||filter==='set'?filter!=='set'||chosen.includes(n):rules().meta(n).mode===filter)).sort((a,b)=>Number(chosen.includes(b))-Number(chosen.includes(a)));show('<h2>'+names[i]+'</h2>'+actorHero(i)+'<div class="cost-meter skill-capacity"><div><b>セットコスト '+skillCost(i)+' / '+skillCap(i)+(dualWieldCost(i)?'（二刀流 +4）':'')+'</b><strong>残り '+Math.max(0,skillCap(i)-skillCost(i))+'</strong></div><i role="progressbar" aria-label="スキルのセットコスト" aria-valuemin="0" aria-valuemax="'+skillCap(i)+'" aria-valuenow="'+skillCost(i)+'"><i style="width:'+Math.min(100,skillCost(i)/skillCap(i)*100)+'%"></i></i></div>'+tabs([['All','すべて'],['set','セット中'],['Active','技・術'],['Passive','常時']],filter,'skills',[i])+'<div class="skills-workspace">'+navigation+'<section class="skill-selection" aria-label="セットするスキル"><input id="skillSearch" class="search-input" type="search" placeholder="スキルを検索" value="'+hesc(query)+'" aria-label="スキル検索" oninput="uiSearchSkills(this.value)"><div class="skill-candidates">'+(ns.length?ns.map(n=>{const d=rules().meta(n),on=chosen.includes(n),usable=skillUsable(i,n),next=on?chosen.filter(x=>x!==n):chosen.concat(n),fits=skillFits(i,next);return '<div data-skill-name="'+hesc(n)+'"><button class="row skill-toggle '+(on?'selected':'')+'"'+data('uiSkillInspect',[i,n])+' aria-label="'+hesc(n)+'の説明"><b><span class="skill-kind-icon" aria-label="'+(d.mode==='Passive'?'パッシブ':'アクティブ')+'">'+(d.mode==='Passive'?'◆':'✦')+'</span>'+hesc(n)+'<span class="cost-label">コスト '+effectiveCost(i,n)+'</span></b><span class="item-explain">'+hesc(skillExplanation(d))+'</span><span class="small">'+hesc(skillDescription(d)+(d.costType?' · '+d.costType+' '+d.cost:''))+'</span>'+(!fits?'<span class="inline-warning">変更後のCost上限を超えます</span>':!usable?'<span class="small equipment-needed">現在の装備では使用不可</span>':'')+'</button><button type="button" class="skill-set-action"'+data('uiDetailSkillSet',[i,n])+(!fits?' disabled aria-label="'+hesc(n)+'：コスト不足"':' aria-label="'+hesc(n)+(on?'：セット解除':'：セットする')+'"')+'>'+(on?'解除':fits?'セット':'不足')+'</button></div>'}).join(''):HT(filter==='set'?'セット中のスキルはありません':'該当するスキルはありません',filter==='set'?'「すべて」から習得済みスキルをセットできます。':'分類を切り替えてください。'))+'<p id="skillEmpty" class="empty-message" hidden>一致するスキルはありません。</p></div></section></div>');filterSkillRows(query)},
 filterSkillRows(text){let count=0;document.querySelectorAll('[data-skill-name]').forEach(e=>{e.hidden=!e.dataset.skillName.toLowerCase().includes(text.toLowerCase());if(!e.hidden)count++});const m=document.getElementById('skillEmpty');if(m)m.hidden=count>0||!document.querySelector('[data-skill-name]')},
 mastery(i){return masteryType(i,'習得済み')},
 masteryType(i,t='習得済み'){return masteryWorkspace(i,t)},
 growMastery(i,g){const prev=masterySelection;return masteryWorkspace(i,prev?.i===i&&prev.t==='習得済み'&&(ranksFor(i)[g]||0)>0?'習得済み':rules().masteries[g]?.category,g,prev?.i===i&&prev.g===g?prev.b:undefined)},
 masterySkills(i,g,b){return masteryWorkspace(i,masterySelection?.i===i?masterySelection.t:rules().masteries[g]?.category,g,b)},
 charMastery(i){return mastery(i)},
 readiness(){if(H.run?.battle)return pendingBattleMenu();const ws=warnings(),count=H.formation.filter(i=>i!==null).length;show('<h2>準備確認</h2>'+hint('装備・スキル・重量・状態をまとめて確認してから出撃します。')+(ws.length?noticeList():HT('準備完了','出撃 '+count+'人 / 最大6人'))+HB('編成へ','','partyMenu',['composition'])+(activeRun()?HB('探索へ戻る','','resumeExpedition'):HB('出撃確認へ',H.selected||dungeonId,'deployment',[H.selected||dungeonId])))},
 items(){return itemCategory(U.inventory)},
 itemCategory(t='道具'){U.inventory=t;let body='';if(t==='道具')body=Object.entries(hc().tools).filter(([n])=>inventory.tools[n]>0).map(([n,d])=>HB(n+' ×'+inventory.tools[n],toolDescription(n),d.field?'useTool':'uiCarryUsers',[n])).join('');else if(t==='素材')body=Object.entries(loot).filter(([,q])=>q>0).map(([n,q])=>HT((hc().labels[n]||n)+' ×'+q,n==='古器'?'ギルドで査定':'')).join('');else if(t==='記録')body=Object.keys(H.clues).map(n=>HB(n,'詳細を読む','clueRecord',[n])).join('');else body=inventory.weapons.slice().sort((a,b)=>Number(H.favorites.includes(b))-Number(H.favorites.includes(a))).map(n=>HB((H.favorites.includes(n)?'★ ':'')+n,weaponDescription(n)+' / +'+(upgrades[n]||0)+' / '+(traits[n]||'特性なし'),'gearDetail',[n])).join('');show('<h2>所持品</h2>'+tabs([['道具','道具'],['装備','武具'],['素材','素材'],['記録','重要品']],t,'uiInventory')+(body||HT('まだ所持していません')))},
 roomMenu(){if(!requireTown())return;const p=H.pendingGrowth||{stat:0,mastery:0},pending=(p.stat||p.mastery)?('未精算 Stat '+(p.stat||0)+' / Mastery '+(p.mastery||0)):'全回復';show('<h2>部屋で休む</h2>'+HB('休息する',pending,'innRest')+HB('所持品','','items')+HB('記録','','records'))},
 inn(){if(!requireTown())return;const n=typeof conversationCounts==='function'?conversationCounts():{companion:0,npc:0,pairs:0},rumorCount=Object.keys(hc().regions).filter(id=>H.flags['rumor:'+id]).length,guestMeta=[n.npc?'新着 '+n.npc+'件':'',rumorCount?'噂 '+rumorCount+'件':''].filter(Boolean).join(' / ');show('<h2>宿屋</h2>'+HB('部屋で休む','休息・所持品・記録','roomMenu')+HB('仲間と会話',(n.companion+n.pairs)?'新着 '+(n.companion+n.pairs)+'件':'','conversation')+HB('客と会話',guestMeta,'npcMenu')+HB('出撃準備','陣形・仲間・行き先','partyMenu'))},
 conversation(){if(!requireTown())return;const cards=hc().companion.map((x,i)=>personCard(battleCardArt(i),x[0],x[1]+' · '+(H.companions[i]?.length||0)+'/3','memberTalk',[i]));show('<h2>仲間と会話</h2>'+peopleGrid(cards)+HB('仲間同士の会話','','pairMenu'))},
 npcMenu(){if(!requireTown())return;const cards=hc().npcs.map(n=>personCard(npcPortraits[n.id]||'../images/npc_marta.svg',n.name,n.role+' · '+(H.talks[n.id]?.length||0)+'/3','npcTalk',[n.id])),known=Object.keys(hc().regions).filter(id=>H.flags['rumor:'+id]).length;show('<h2>客と会話</h2>'+peopleGrid(cards)+'<section class="inn-rumor-inline">'+HB('噂の記録',known?known+'件 · 客との会話で集めた手掛かり':'客との会話で手掛かりが増えます','rumors')+'</section>')},
 questMenu(filter='open'){const counts={open:hc().quests.filter(q=>qstate(q).state===0&&syncQuestAvailability().some(a=>a.id===q.id)).length,active:hc().quests.filter(q=>[1,2].includes(qstate(q).state)).length,ready:hc().quests.filter(q=>qstate(q).state===2).length,done:hc().quests.filter(q=>qstate(q).state===3).length};const availableIds=new Set(syncQuestAvailability().map(q=>q.id));const list=hc().quests.filter(q=>filter==='all'||(filter==='open'?qstate(q).state===0&&availableIds.has(q.id):filter==='active'?[1,2].includes(qstate(q).state):qstate(q).state===({ready:2,done:3}[filter]??1)));show('<h2>依頼掲示板</h2>'+tabs([['open','未受注'],['active','進行中 '+counts.active],['ready','報告 '+counts.ready],['done','完了']],filter,'questMenu')+(activeRun()?'<p class="small">探索中は進捗のみ確認できます。</p>':'')+(list.length?list.map(q=>{const st=qstate(q),available=syncQuestAvailability().some(a=>a.id===q.id);return HB((H.tracked===q.id?'★ ':'')+q.n,q.d+' · '+(st.state===0?available?'受注可能':'未開放':st.state===2?'報告待ち':st.state===3?'報告済み':st.progress+'/'+q.target),'questSelect',[q.id])}).join(''):HT('該当する依頼はありません'))+(!activeRun()&&counts.ready?HB('達成分を一括報告',counts.ready+'件','reportAll'):'')+(H.tracked?HB('追跡を解除','','uiClearTrack'):'')+HB('全件を見る','','questMenu',['all']))},
 questSelect(id){const q=findQuest(id);if(!q)return;const st=qstate(q),available=syncQuestAvailability().some(a=>a.id===q.id),prereq=q.prereq?findQuest(q.prereq):null;show('<h2>'+hesc(q.n)+'</h2>'+pill(q.d)+'<p class="message">'+hesc(q.description)+'</p>'+HT('進捗 '+st.progress+'/'+q.target,'報酬 '+moneyText(q.reward)+' · Stat '+q.stat+' / Mastery '+q.mastery+' Pt')+(activeRun()?(st.state===1?HB(H.tracked===q.id?'追跡中':'追跡する','','trackQuest',[q.id],H.tracked===q.id):''):st.state===0?HB('受注する',available?'':!unlocked.includes(q.d)?'地域未開放':prereq?'前提：'+prereq.n+'を報告':'前提条件未達成','acceptQuest',[q.id],!available):st.state===2?HB('達成報告','','claimQuest',[q.id]):st.state===3?HT('報告済み'):HB('この地域の出撃準備','','deployment',[q.d]))+(st.state===1&&!activeRun()?HB(H.tracked===q.id?'追跡中':'追跡する','','trackQuest',[q.id],H.tracked===q.id)+'<details class="ui-help"><summary>依頼の管理</summary>'+HB('取り下げる','進捗はリセットされます','askAbandonQuest',[q.id])+'</details>':''))},
 deployment(id){if(activeRun())return expeditionMenu();if(!hc().regions[id]||!unlocked.includes(id))return note('この地域は未開放です');dungeonId=id;H.selected=id;persist();partyMenu('dungeon')},
 settings(){show('<h2>設定</h2>'+section('表示・操作',HB('文字サイズ',H.settings.text,'cycleText')+HB('表示密度',H.settings.density||'標準','toggleCompact')+HB('重要操作の確認',H.settings.confirm?'ON':'OFF','toggleConfirm'))+section('セーブ',HT(hubSaveError?'保存に失敗しています':'自動保存',hubSaveError||'操作ごとに保存')+HB('今すぐ保存','','manualSave')+HB('書き出す','JSONファイル','exportSave')+HB('読み込む','確認後に置き換え','chooseImport'))+'<details class="ui-help danger-zone"><summary>データ管理</summary>'+HB('バックアップ復元','','askRestore',[],!RPG_STORE.getItem(HUB_BACKUP))+HB('最初から始める','進行を初期化','resetSave')+'</details>')},
 manualSave(){toast(saveGame()?'保存しました':'保存できません。書き出しを利用してください。');renderSaveStatus()},
 drawDungeon(){const app=document.getElementById('app');document.getElementById('modal').classList.remove('hub-overlay-modal','hub-location-modal','hub-map-modal');app.classList.remove('actor-overlay-open');setHubContentInert(false);app.classList.remove('town-world','facility-world','guild-world','market-world','inn-world');delete app.dataset.facility;app.classList.add('in-expedition');old.drawDungeon();const nav=app.querySelector('.hub-global-nav');nav.querySelector('[data-nav="home"]').setAttribute('data-hub','expeditionMenu');nav.querySelector('[data-nav="map"]').setAttribute('data-hub','resumeExpedition');nav.querySelector('[data-nav="home"] b').textContent='探索';nav.querySelector('[data-nav="map"] b').textContent='MAP';navState('map');const root=document.querySelector('.expedition');if(!root)return;app.style.setProperty('--expedition-bg',root.style.getPropertyValue('--explore-bg'));const q=activeQuest();if(q){const e=document.createElement('button');e.className='field-quest';e.setAttribute('data-hub','questSelect');e.dataset.args=JSON.stringify([q.id]);e.textContent='★ '+q.n+' '+qstate(q).progress+'/'+q.target;root.querySelector('.field-head').after(e)}const head=root.querySelector('.field-head');if(head){const help=document.createElement('button');help.className='icon-button';help.setAttribute('data-hub','uiMapLegend');help.setAttribute('aria-label','地図の見方');help.textContent='?';head.append(help)}const generic=root.querySelector('.field-actions .row.static .small');if(generic)generic.remove()}
};
Object.assign(window,views);
window.HUB_UI_ACTIONS=Object.keys(uiActions);
// Safe render-only history. Returning re-renders from current state, never replays purchases or rewards.
const routes=['statusView','actorAttributes','guildMembers','guildSellMenu','guildSaleQuantity','guildSaleConfirm','storyMenu','readStory','reportChapter','epilogue','guild','guildDesk','questMenu','questSelect','inn','roomMenu','innRest','conversation','memberTalk','npcMenu','npcTalk','pairMenu','readPair','talkArchive','rumors','rumorDetail','infoMenu','dungeonIntel','market','gearShopMenu','toolShop','toolQuantity','weaponShop','gearDetail','armorShop','armorDetail','armorEquipMenu','craftMenu','recipeMenu','recipeDetail','upgradeMenu','traitMenu','traitChoice','appraiseMenu','rareAppraise','sellMenu','materialTrade','materialQuantity','storageMenu','depositMenu','depositQuantity','merchantNode','dungeonForge','items','itemCategory','records','explorationStats','historyMenu','historyDetail','regionRecords','regionRecord','enemyBook','enemyRecord','peopleBook','personRecord','clueRecord','recordList','partyMenu','readiness','equip','equipChoice','skills','presetMenu','askSavePreset','settings','character','charOverview','charAbility','resistView','charMastery','mastery','masteryType','growMastery','masterySkills','squadMenu','rowSwapMenu','dungeon','deployment','camp','moraleMenu','expeditionMenu','runJournal','battlePrep','mechanismMenu','eventChoice','explorationNode','stairsMenu','secretNode','pendingBattleMenu','note','confirmAction','checkpointResult','uiCarryUsers','uiMapLegend'];
for(const name of routes){const render=window[name];if(typeof render!=='function')continue;window[name]=(...args)=>{const previous=U.render;U.render={name,args};try{return render(...args)}finally{U.render=previous}}}
// Modal focus, keyboard escape and touch navigation work independently of game state.
document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!isOpen())return;const list=focusables(),first=list[0],last=list[list.length-1];if(!first)return;e.stopPropagation();if(e.shiftKey&&(document.activeElement===first||!list.includes(document.activeElement))){last.focus();e.preventDefault()}else if(!e.shiftKey&&(document.activeElement===last||!list.includes(document.activeElement))){first.focus();e.preventDefault()}});
document.addEventListener('click',e=>{if(U.detail&&!e.target.closest('.selection-overlay,[data-hub=uiEquipPreview],[data-hub=uiSkillInspect]')){U.detail=null;selectionOverlay();document.querySelectorAll('.skill-toggle.inspected').forEach(el=>el.classList.remove('inspected'))}const globalNav=e.target.closest('#app nav [data-nav]');if(globalNav&&globalNav.dataset.nav==='home'){U.stack=[];U.route=null}const el=e.target.closest('[data-hub],button[onclick]');if(!el)return;if(el.closest('#app'))U.launcher=el;if(el.closest('#panel')&&!el.disabled){U.opener=U.opener?.isConnected?U.opener:document.querySelector('#app nav .current')}},true);
window.HUB_UI={version:21,state:U,warnings,resources};
})();
