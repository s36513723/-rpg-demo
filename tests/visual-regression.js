async () => {
 const out=[],base=collectSave(),V=HUB_VISUAL;
 const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message)};
 const test=async(name,fn)=>{try{await fn();out.push({name:'UI11 '+name,ok:true})}catch(e){out.push({name:'UI11 '+name,ok:false,error:e.message})}};
 const reset=()=>{installSave(cp(base));H.run=null;HUB_UI.state.stack=[];HUB_UI.state.route=null;closeM();town()};
 const panel=()=>document.getElementById('panel');
 await test('three compact facilities plus persistent BACK HOME MAP navigation',()=>{reset();const nav=document.querySelector('.hub-global-nav');assert(nav);assert(nav.querySelectorAll('button').length===3);assert(document.querySelectorAll('.town-command-grid .place').length===3);assert(document.querySelectorAll('.town-command-grid .place .ui-icon').length===3);assert(nav.querySelector('[data-nav="map"][data-hub="partyMenu"]'));assert(!document.querySelector('.town-dungeon-strip'))});
 await test('central facility commands use distinct scalable icons',()=>{const keys=[...document.querySelectorAll('.town-command-grid .ui-icon')].map(e=>e.dataset.icon);assert(keys.length===3);assert(new Set(keys).size===3)});
 await test('town exit appears only inside menus',()=>{assert(!document.querySelector('#modal.on'));partyMenu();assert(panel().querySelector('.modal-x').textContent==='拠点へ');assert(panel().querySelector('.modal-x').getAttribute('aria-label')==='拠点へ戻る');closeM();assert(!document.querySelector('#modal.on'))});
 await test('return from field menu stays on same route with no healing',()=>{reset();startDungeon();vitals[0].hp=30;const id=H.run.id;character(0);assert(panel().querySelector('.modal-x').textContent==='地図へ');panel().querySelector('.modal-x').click();assert(H.run.id===id&&vitals[0].hp===30);assert(document.querySelector('.expedition'))});
 await test('single-speaker conversation shows actual party portrait',()=>{reset();memberTalk(1);assert(panel().querySelector('.dialogue-block img').dataset.person===names[1]);assert(panel().querySelector('.speaker').textContent===names[1]);assert(panel().querySelector('blockquote').textContent===hc().companion[1][2]);assert(panel().querySelectorAll('[data-hub="finishCompanion"]').length===2)});
 await test('all six conversation portraits use unique existing assets',()=>{const urls=new Set();for(let i=0;i<6;i++){memberTalk(i);const img=panel().querySelector('.dialogue-block img');assert(img.dataset.person===names[i]);urls.add(img.getAttribute('src'))}assert(urls.size===6)});
 await test('unavailable conversation keeps portrait without archive shortcut',()=>{reset();H.companions[0]=[{text:'saved',choice:'choice'}];memberTalk(0);assert(panel().querySelector('.dialogue-block'));assert(!panel().querySelector('[data-hub="finishCompanion"]'));assert(!panel().querySelector('[data-hub="talkArchive"]'))});
 await test('NPCs use one standing-art source per person across list, facility and dialogue',()=>{reset();npcMenu();const list=new Map([...panel().querySelectorAll('.person-select-card[data-hub="npcTalk"]')].map(e=>[JSON.parse(e.dataset.args)[0],e.querySelector('img').getAttribute('src')]));const urls=new Set();for(const n of hc().npcs){assert(list.get(n.id));npcTalk(n.id);const img=panel().querySelector('.npc-stage .npc-stand');assert(img&&img.getAttribute('src')===list.get(n.id));urls.add(img.getAttribute('src'))}assert(urls.size===6)});
 await test('companion selector uses six wide portrait rows',()=>{reset();conversation();assert(panel().querySelector('.people-select-page'));const cards=[...panel().querySelectorAll('.person-select-card[data-hub="memberTalk"]')];assert(cards.length===6);assert(cards.every(x=>x.getBoundingClientRect().width>x.getBoundingClientRect().height*3));assert(panel().textContent.includes('ガルド')&&panel().textContent.includes('ユナ'))});
 await test('NPC dialogue body is fixed and does not use the generic dialogue card',()=>{reset();npcTalk('受付');assert(panel().querySelector('.npc-conversation-page'));assert(!panel().querySelector('.dialogue-block'));assert(panel().querySelector('.npc-action-deck'));assert(getComputedStyle(panel().querySelector('.npc-conversation-page')).overflowY==='hidden')});
 await test('NPC dialogue has no direct conversation archive shortcut',()=>{reset();npcTalk('受付');assert(!panel().querySelector('[data-hub="talkArchive"]'));assert(panel().querySelector('[data-hub="finishNPC"]'))});
 await test('patron selector uses the same six wide portrait rows',()=>{npcMenu();assert(panel().querySelector('.people-select-page'));const cards=[...panel().querySelectorAll('.person-select-card[data-hub="npcTalk"]')];assert(cards.length===6);assert(cards.every(x=>x.getBoundingClientRect().width>x.getBoundingClientRect().height*3));assert(panel().querySelectorAll('.person-select-card img').length===6)});
 await test('pair scene displays both named speakers without invented dialogue attribution',()=>{reset();H.history=[{id:'scene-fixture',result:'帰還'}];H.story.completed=Object.keys(hc().regions);for(let i=0;i<6;i++){readPair(i);const p=hc().pairs[i],faces=[...panel().querySelectorAll('.conversation-cast img')].map(e=>e.dataset.person);assert(faces.join(',')===[p[0],p[1]].join(','));assert(panel().querySelector('.scene-narration').textContent===p[3])}});
 await test('pair list gives both portraits without changing locks',()=>{reset();pairMenu();assert(panel().querySelectorAll('.duet-thumb').length===6);assert(panel().querySelectorAll('[data-hub="readPair"]:disabled').length===6)});
 await test('conversation archive retains saved choices and text',()=>{reset();H.companions[2]=[{text:'古い会話の本文',choice:'旅の話をした'}];talkArchive('companion',2);assert(panel().querySelector('.conversation-cast img').dataset.person==='エルン');assert(panel().textContent.includes('古い会話の本文')&&panel().textContent.includes('旅の話をした'))});
 await test('people archive shows portraits for both companions and NPCs',()=>{reset();peopleBook();const imgs=[...panel().querySelectorAll('button.row img')];assert(imgs.length>=12)});
 await test('return table conversation identifies the actual named speaker',()=>{reset();H.history=[{id:'return-test',dungeon:'古代迷宮',result:'敗北',loot:[]}];returnTalk();assert(panel().querySelector('.speaker').textContent==='ガルド');assert(!panel().querySelector('blockquote').textContent.startsWith('ガルド「'))});
 await test('chapter report retains scholar text and both choices in the guild world',()=>{reset();H.story.pending=['古代迷宮'];reportChapter('古代迷宮');const s=document.querySelector('#screen');assert(s.textContent.includes('イリス'));assert(s.querySelectorAll('[data-hub="finishChapter"]').length===2)});
 await test('facilities use standing NPCs and exactly four choices',()=>{reset();for(const [fn,id] of [[inn,'宿主'],[guild,'受付'],[market,'鍛冶師']]){fn();if(fn===guild){const s=document.querySelector('#screen');assert(document.querySelector('#app').classList.contains('guild-world'));assert(s.querySelector('.facility-world-npc'));assert(s.querySelectorAll('.facility-world-home button.row').length===4);assert(s.querySelector('[data-hub="uiGuildTalk"]'));town()}else{assert(panel().querySelector('.facility-stage-page'));const host=panel().querySelector('.facility-host,.facility-talk');assert(host&&JSON.parse(host.dataset.args)[0]===id);assert(panel().querySelector('.facility-stand'));assert(panel().querySelectorAll('.facility-action-deck button.row').length===4);closeM()}}});
 await test('talking to a facility NPC keeps the stage fixed',()=>{reset();for(const [fn,id] of [[inn,'宿主'],[guild,'受付'],[market,'鍛冶師']]){fn();if(fn===guild){const npc=document.querySelector('.facility-world-npc'),before=npc.getBoundingClientRect().toJSON(),screen=document.querySelector('#screen').getBoundingClientRect().toJSON();document.querySelector('[data-hub="uiGuildTalk"]').click();const after=npc.getBoundingClientRect().toJSON(),screenAfter=document.querySelector('#screen').getBoundingClientRect().toJSON();assert(JSON.stringify(before)===JSON.stringify(after));assert(JSON.stringify(screen)===JSON.stringify(screenAfter));town()}else{const before=panel().querySelector('.facility-stage').getBoundingClientRect(),panelHeight=panel().getBoundingClientRect().height,host=panel().querySelector('.facility-host,.facility-talk');const src=panel().querySelector('.facility-stand').getAttribute('src');assert(host);host.click();const after=panel().querySelector('.npc-stage').getBoundingClientRect(),talkSrc=panel().querySelector('.npc-stand').getAttribute('src');assert(Math.abs(before.height-after.height)<=1);assert(Math.abs(panel().getBoundingClientRect().height-panelHeight)<=1);assert(src===talkSrc&&!!src);closeM()}}});
 await test('capital artwork spans the hub behind three equal facility commands',()=>{reset();assert(document.querySelector('.town-home'));assert(document.querySelectorAll('.town-command-grid .place').length===3);const bg=getComputedStyle(document.querySelector('#app')).backgroundImage;assert(bg.includes('hub-capital-bg'));const widths=[...document.querySelectorAll('.town-command-grid .place')].map(e=>e.getBoundingClientRect().width);assert(Math.max(...widths)-Math.min(...widths)<2)});
 await test('MAP replaces the old destination strip without consuming town scenery',()=>{reset();assert(!document.querySelector('.town-dungeon-strip'));const map=document.querySelector('.hub-global-nav [data-nav="map"]'),nav=document.querySelector('.hub-global-nav').getBoundingClientRect();assert(map);const r=map.getBoundingClientRect();assert(r.left>=nav.left&&r.right<=nav.right&&r.height>=40);assert(JSON.parse(map.dataset.args||'[]')[0]==='destination')});
 await test('party roster is visually the last section',()=>{reset();const party=document.querySelector('#party').getBoundingClientRect(),screen=document.querySelector('#screen').getBoundingClientRect();assert(party.top>=screen.bottom-1)});
 await test('sortie prep has fixed non-scrolling tab body',()=>{reset();partyMenu('formation');assert(panel().querySelector('.sortie-page'));assert(panel().querySelector('.sortie-page').scrollHeight<=panel().querySelector('.sortie-page').clientHeight+1);partyMenu('members');assert(panel().querySelectorAll('.person-select-card').length===6)});
 await test('screen guidance stays visually secondary and compact',()=>{reset();for(const fn of [()=>partyMenu('formation'),()=>weaponShop(),()=>armorShop()]){fn();const h=panel().querySelector('.screen-hint');assert(h);const cs=getComputedStyle(h),r=h.getBoundingClientRect();assert(parseFloat(cs.fontSize)>=11&&parseFloat(cs.fontSize)<=13);assert(r.height<100)}});
 await test('distinct weapon and consumable categories do not all share same icon',()=>{assert(V.itemIcon('回復薬')!==V.itemIcon('爆弾'));assert(V.itemIcon('短剣')!==V.itemIcon('戦槌'));assert(V.itemIcon('登攀縄')!==V.itemIcon('清水'));assert(V.itemIcon('王墓の銃')==='gun')});
 await test('all weapon shop rows and equipment preview candidates have icons',()=>{reset();weaponShop();assert([...panel().querySelectorAll('[data-hub="gearDetail"]')].every(e=>e.querySelector('.ui-icon')));for(const kind of ['格闘','剣','槌','斧','槍'])ranksFor(0)[kind]=Math.max(5,ranksFor(0)[kind]||0);equipChoice(0,0);const candidates=[...panel().querySelectorAll('[data-hub="uiEquipPreview"]')];assert(candidates.length>3&&candidates.every(e=>e.querySelector('.equipment-kind-icon')))});
 await test('facility choice decks keep text clear without overlapping row icons',()=>{reset();for(const fn of [market,inn,guild]){fn();assert([...panel().querySelectorAll('.facility-action-deck button.row')].every(e=>!e.querySelector('.row-visual')),fn.name)}});
 await test('decorative icons do not duplicate accessible text',()=>{reset();market();assert([...panel().querySelectorAll('.ui-icon')].every(e=>e.getAttribute('aria-hidden')==='true'&&e.getAttribute('focusable')==='false'));assert([...panel().querySelectorAll('img')].every(e=>e.getAttribute('alt')===''))});
 await test('five character tabs and skill actions retain visual icons',()=>{reset();character(0);assert(panel().querySelectorAll('.ui-tabs [data-hub=uiActor] .ui-icon').length===5);skills(0);assert(panel().querySelectorAll('.skill-kind').length===panel().querySelectorAll('.skill-toggle').length);assert([...panel().querySelectorAll('button[data-hub]')].every(e=>HUB_ACTION_NAMES.includes(e.dataset.hub)))});
 await test('overview has one prominent portrait and equipment prioritizes comparison',()=>{reset();character(0);const hero=panel().querySelector('.status-cover');assert(hero&&panel().querySelector('.actor-backdrop img'));assert(hero.getBoundingClientRect().height>=innerHeight*.45);assert(!panel().querySelector('#panelTitle .header-face'));equip(0);assert(!panel().querySelector('.actor-hero'));assert(panel().querySelector('.fitting-summary'))});
 await test('equipment preview comparison is compact and clearly separated from candidates',()=>{reset();equipChoice(0,0,'長槍');const box=panel().querySelector('.equip-compare');assert(box);assert(box.querySelectorAll('.equip-compare-grid>span').length===12);assert(box.getBoundingClientRect().width<=panel().querySelector('.panel-body').getBoundingClientRect().width+1);assert(panel().querySelector('.equipment-bottom-operation .fitting-confirm [data-hub="fittingApply"]'))});
 await test('dynamic visuals do not mutate save, gold, inventory or quests',()=>{reset();equip(0);const before=JSON.stringify(collectSave(),(k,v)=>k==='savedAt'?undefined:v);V.decorate(panel(),{name:'equip',args:[0]});assert(before===JSON.stringify(collectSave(),(k,v)=>k==='savedAt'?undefined:v))});
 await test('non-dialogue decoration is idempotent',()=>{const count=panel().querySelectorAll('svg').length;V.decorate(panel(),{name:'equip',args:[0]});assert(count===panel().querySelectorAll('svg').length)});
 await test('map node icons are consistent with their semantic type',()=>{reset();startDungeon();drawDungeon();for(const e of document.querySelectorAll('.map-node'))assert(e.querySelector('.ui-icon'));const node=document.querySelector('[data-hub="routeNode"]');assert(node.getAttribute('aria-label'))});
 await test('map nodes have themed mini artwork',()=>{reset();startDungeon();drawDungeon();const nodes=[...document.querySelectorAll('.map-node')];assert(nodes.length>=9);assert(nodes.every(e=>e.querySelector('.node-thumb')))});
 await test('enemy book and detail remain reachable in the fixed guild world',()=>{reset();journal.enemies=['古代弓兵','辺境の巨獣','術式魔導師','迷宮守護機'];journal.enemyData={};enemyBook();let s=document.querySelector('#screen');assert(s.querySelectorAll('[data-hub="enemyRecord"]').length===4);enemyRecord('迷宮守護機');s=document.querySelector('#screen');assert(s.textContent.includes('迷宮守護機'))});
 await test('all guild internal screens preserve the same background and receptionist frame',()=>{
  reset();
  const region='古代迷宮',q=hc().quests[0];
  H.story.pending=[region];H.story.completed=H.story.completed.filter(x=>x!==region);
  H.quests[q.id]={state:1,progress:Math.min(1,q.target)};H.tracked=q.id;
  journal.enemies=['古代弓兵','辺境の巨獣','術式魔導師','迷宮守護機'];journal.enemyData={};
  loot.皮=Math.max(8,loot.皮||0);
  guild();
  const snap=()=>{
   const app=document.querySelector('#app'),screen=document.querySelector('#screen'),npc=document.querySelector('.facility-world-npc'),overlay=document.querySelector('.facility-world-overlay'),party=document.querySelector('#party'),nav=document.querySelector('.hub-global-nav');
   assert(app.classList.contains('guild-world'));assert(!document.querySelector('#modal').classList.contains('on'));assert(npc&&overlay&&party&&nav);
   const s=screen.getBoundingClientRect(),n=npc.getBoundingClientRect(),o=overlay.getBoundingClientRect();
   assert(getComputedStyle(app).backgroundImage.includes('hub-guild-bg'));
   assert(document.querySelectorAll('#party .m').length===6&&nav.querySelectorAll('button').length===3);
   assert(o.bottom<=s.bottom+1&&o.height<=s.height*.5);
   return {screen:[s.x,s.y,s.width,s.height],npc:[n.x,n.y,n.width,n.height]};
  };
  const baseFrame=snap(),same=()=>{
   const now=snap();
   for(let i=0;i<4;i++)assert(Math.abs(now.screen[i]-baseFrame.screen[i])<=1,'guild screen moved');
   for(let i=0;i<4;i++)assert(Math.abs(now.npc[i]-baseFrame.npc[i])<=1,'guild NPC moved');
  };
  const views=[
   ()=>guildDesk(),
   ()=>questMenu('open'),
   ()=>questMenu('active'),
   ()=>questMenu('done'),
   ()=>questMenu('all'),
   ()=>questSelect(q.id),
   ()=>reportChapter(region),
   ()=>infoMenu(),
   ()=>dungeonIntel(region),
   ()=>regionRecords(),
   ()=>regionRecord(region),
   ()=>enemyBook(),
   ()=>enemyRecord('迷宮守護機'),
   ()=>clueRecord('封印の銘板'),
   ()=>recordList('重要記録',['記録A','記録B']),
   ()=>appraiseMenu(),
   ()=>storageMenu(),
   ()=>depositMenu(),
   ()=>guildMembers(),
   ()=>guildSellMenu(),
   ()=>guildSellMenu('materials'),
   ()=>guildSaleQuantity('materials','皮'),
   ()=>guildSaleConfirm('materials','皮',1),
   ()=>confirmAction('依頼を取り下げる','進捗をリセットします。','abandonQuest',[q.id]),
   ()=>checkpointResult('依頼報告','報酬を受け取りました。','questMenu',['active']),
   ()=>note('報告できる依頼はありません')
  ];
  for(const open of views){open();same()}
 });
 await test('field merchant uses a dedicated portrait',()=>{reset();startDungeon();const f=H.run.floors[0],n=f.nodes.find(n=>n.type==='merchant');f.open=[n.id];routeNode(n.id);assert(panel().querySelector('.scene-merchant img').getAttribute('src').includes('npc_merchant'))});
 await test('back navigation still works with NPC-centered facilities',()=>{reset();market();toolShop();toolQuantity('回復薬');uiBack();assert(panel().textContent.includes('道具屋'));uiBack();assert(panel().querySelector('.facility-host,.facility-talk'));assert(panel().querySelector('.modal-x').textContent==='拠点へ')});
 reset();return out;
}
