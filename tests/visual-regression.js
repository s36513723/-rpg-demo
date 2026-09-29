async () => {
 const out=[],base=collectSave(),V=HUB_VISUAL;
 const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message)};
 const test=async(name,fn)=>{try{await fn();out.push({name:'UI11 '+name,ok:true})}catch(e){out.push({name:'UI11 '+name,ok:false,error:e.message})}};
 const reset=()=>{installSave(cp(base));H.run=null;HUB_UI.state.stack=[];HUB_UI.state.route=null;closeM();town()};
 const panel=()=>document.getElementById('panel');
 await test('three compact facilities plus persistent BACK HOME MAP navigation',()=>{reset();const nav=document.querySelector('.hub-global-nav');assert(nav);assert(nav.querySelectorAll('button').length===3);assert(document.querySelectorAll('.town-command-grid .place').length===3);assert(document.querySelectorAll('.town-command-grid .place .ui-icon').length===3);assert(nav.querySelector('[data-nav="map"][data-hub="partyMenu"]'));assert(!document.querySelector('.town-dungeon-strip'))});
 await test('central facility commands use distinct scalable icons',()=>{const keys=[...document.querySelectorAll('.town-command-grid .ui-icon')].map(e=>e.dataset.icon);assert(keys.length===3);assert(new Set(keys).size===3)});
 await test('persistent BACK HOME MAP replaces duplicate menu exits in town',()=>{assert(!document.querySelector('#modal.on'));partyMenu();const nav=document.querySelector('.hub-global-nav');assert(document.querySelector('#modal.on'));assert(!panel().querySelector('.modal-x'));assert(!panel().querySelector('.panel-navigation'));assert([...nav.querySelectorAll('button')].map(b=>b.textContent.trim()).join('|').includes('BACK')&&[...nav.querySelectorAll('button')].map(b=>b.textContent.trim()).join('|').includes('HOME')&&[...nav.querySelectorAll('button')].map(b=>b.textContent.trim()).join('|').includes('MAP'));nav.querySelector('[data-nav="home"]').click();assert(!document.querySelector('#modal.on')&&document.querySelector('.town-home'))});
 await test('return from field character menu stays on same route with no healing',()=>{reset();startDungeon();vitals[0].hp=30;const id=H.run.id;character(0);const exit=panel().querySelector('.modal-x');assert(exit&&exit.textContent==='地図へ');exit.click();assert(H.run.id===id&&vitals[0].hp===30);assert(document.querySelector('.expedition'))});
 await test('single-speaker conversation shows actual party portrait',()=>{reset();memberTalk(1);const s=document.querySelector('#screen'),img=s.querySelector('.facility-world-guests img');assert(img&&img.dataset.person===names[1]);assert(s.textContent.includes(hc().companion[1][2]));assert(s.querySelectorAll('[data-hub="finishCompanion"]').length===2);assert(document.querySelector('#app').classList.contains('inn-world'))});
 await test('all six conversation portraits use unique existing assets',()=>{reset();const urls=new Set();for(let i=0;i<6;i++){memberTalk(i);const img=document.querySelector('#screen .facility-world-guests img');assert(img&&img.dataset.person===names[i]);urls.add(img.getAttribute('src'))}assert(urls.size===6)});
 await test('unavailable conversation keeps portrait without archive shortcut',()=>{reset();H.companions[0]=[{text:'saved',choice:'choice'}];memberTalk(0);const s=document.querySelector('#screen');assert(s.querySelector('.facility-world-guests img'));assert(!s.querySelector('[data-hub="finishCompanion"]'));assert(!s.querySelector('[data-hub="talkArchive"]'))});
 await test('NPC conversations show the selected guest portrait inside the inn world',()=>{reset();npcMenu();const list=[...document.querySelectorAll('#screen .person-select-card[data-hub="npcTalk"]')];assert(list.length===6);for(const n of hc().npcs){npcTalk(n.id);const img=document.querySelector('#screen .facility-world-guests img');assert(img&&img.dataset.person===n.name);assert(document.querySelector('#app').classList.contains('inn-world'))}});
 await test('companion selector uses six portrait rows in the inn world',()=>{reset();conversation();const s=document.querySelector('#screen'),cards=[...s.querySelectorAll('.person-select-card[data-hub="memberTalk"]')];assert(cards.length===6);assert(cards.every(x=>x.querySelector('img')));assert(s.textContent.includes('ガルド')&&s.textContent.includes('ユナ'));assert(document.querySelector('#app').classList.contains('inn-world'))});
 await test('NPC dialogue stays inside the fixed inn composition',()=>{reset();npcTalk('受付');const s=document.querySelector('#screen');assert(s.querySelector('.facility-world-npc'));assert(s.querySelector('.facility-world-guests img[data-person="エダ"]'));assert(!document.querySelector('#modal').classList.contains('on'));assert(document.querySelector('#app').classList.contains('inn-world'))});
 await test('NPC dialogue has no direct conversation archive shortcut',()=>{reset();npcTalk('受付');const s=document.querySelector('#screen');assert(!s.querySelector('[data-hub="talkArchive"]'));assert(s.querySelector('[data-hub="finishNPC"]'))});
 await test('patron selector uses six portrait rows in the inn world',()=>{reset();npcMenu();const s=document.querySelector('#screen'),cards=[...s.querySelectorAll('.person-select-card[data-hub="npcTalk"]')];assert(cards.length===6);assert(cards.every(x=>x.querySelector('img')));assert(document.querySelector('#app').classList.contains('inn-world'))});
 await test('pair scene displays both named speakers without invented dialogue attribution',()=>{reset();H.history=[{id:'scene-fixture',result:'帰還'}];H.story.completed=Object.keys(hc().regions);for(let i=0;i<6;i++){readPair(i);const p=hc().pairs[i],s=document.querySelector('#screen'),faces=[...s.querySelectorAll('.facility-world-guests img')].map(e=>e.dataset.person);assert(faces.join(',')===[p[0],p[1]].join(','));assert(s.textContent.includes(p[3]))}});
 await test('pair list preserves all six locks in the inn world',()=>{reset();pairMenu();const s=document.querySelector('#screen');assert(s.querySelectorAll('[data-hub="readPair"]').length===6);assert(s.querySelectorAll('[data-hub="readPair"]:disabled').length===6);assert(document.querySelector('#app').classList.contains('inn-world'))});
 await test('conversation archive retains saved choices and text',()=>{reset();H.companions[2]=[{text:'古い会話の本文',choice:'旅の話をした'}];talkArchive('companion',2);const s=document.querySelector('#screen');assert(s.querySelector('.facility-world-guests img')?.dataset.person==='エルン');assert(s.textContent.includes('古い会話の本文')&&s.textContent.includes('旅の話をした'))});
 await test('people archive shows portraits for both companions and NPCs',()=>{reset();peopleBook();const imgs=[...panel().querySelectorAll('button.row img')];assert(imgs.length>=12)});
 await test('chapter report retains scholar text and both choices in the guild world',()=>{reset();H.story.pending=['古代迷宮'];reportChapter('古代迷宮');const s=document.querySelector('#screen');assert(s.textContent.includes('イリス'));assert(s.querySelectorAll('[data-hub="finishChapter"]').length===2)});
 await test('all facilities use fixed backgrounds, standing NPCs and compact choices',()=>{reset();for(const [fn,kind,count] of [[inn,'inn',4],[guild,'guild',4],[market,'market',4]]){fn();const s=document.querySelector('#screen'),app=document.querySelector('#app');assert(app.classList.contains(kind+'-world'));assert(s.querySelector('.facility-world-npc'));assert(s.querySelectorAll('.facility-world-home button.row').length===count);assert(s.querySelector('[data-hub="uiFacilityTalk"]'));assert(getComputedStyle(app).backgroundImage.includes('hub-'+kind+'-bg'));town()}});
 await test('TALK keeps every facility NPC and screen frame fixed',()=>{reset();for(const [fn,kind] of [[inn,'inn'],[guild,'guild'],[market,'market']]){fn();const npc=document.querySelector('.facility-world-npc'),before=npc.getBoundingClientRect().toJSON(),screen=document.querySelector('#screen').getBoundingClientRect().toJSON();document.querySelector('[data-hub="uiFacilityTalk"]').click();const after=npc.getBoundingClientRect().toJSON(),screenAfter=document.querySelector('#screen').getBoundingClientRect().toJSON();assert(JSON.stringify(before)===JSON.stringify(after));assert(JSON.stringify(screen)===JSON.stringify(screenAfter));assert(document.querySelector('#app').classList.contains(kind+'-world'));town()}});
 await test('capital artwork spans the hub behind three equal facility commands',()=>{reset();assert(document.querySelector('.town-home'));assert(document.querySelectorAll('.town-command-grid .place').length===3);const bg=getComputedStyle(document.querySelector('#app')).backgroundImage;assert(bg.includes('hub-capital-bg'));const widths=[...document.querySelectorAll('.town-command-grid .place')].map(e=>e.getBoundingClientRect().width);assert(Math.max(...widths)-Math.min(...widths)<2)});
 await test('MAP replaces the old destination strip without consuming town scenery',()=>{reset();assert(!document.querySelector('.town-dungeon-strip'));const map=document.querySelector('.hub-global-nav [data-nav="map"]'),nav=document.querySelector('.hub-global-nav').getBoundingClientRect();assert(map);const r=map.getBoundingClientRect();assert(r.left>=nav.left&&r.right<=nav.right&&r.height>=40);assert(JSON.parse(map.dataset.args||'[]')[0]==='destination')});
 await test('party roster is visually the last section',()=>{reset();const party=document.querySelector('#party').getBoundingClientRect(),screen=document.querySelector('#screen').getBoundingClientRect();assert(party.top>=screen.bottom-1)});
 await test('sortie prep keeps the three tabs and member controls in one pane',()=>{reset();partyMenu('formation');assert(panel().querySelector('.sortie-page'));assert(panel().querySelectorAll('.sortie-tabs button').length===3);partyMenu('composition');assert(panel().querySelectorAll('.sortie-member-face[data-hub="character"]').length===6)});
 await test('screen guidance stays visually secondary and compact',()=>{reset();for(const fn of [()=>partyMenu('formation'),()=>weaponShop(),()=>armorShop()]){fn();const h=panel().querySelector('.screen-hint,.sortie-instruction');assert(h);const r=h.getBoundingClientRect();assert(r.height<100)}});
 await test('distinct weapon and consumable categories do not all share same icon',()=>{assert(V.itemIcon('回復薬')!==V.itemIcon('爆弾'));assert(V.itemIcon('短剣')!==V.itemIcon('戦槌'));assert(V.itemIcon('登攀縄')!==V.itemIcon('清水'));assert(V.itemIcon('王墓の銃')==='gun')});
 await test('all weapon shop rows and equipment preview candidates have icons',()=>{reset();weaponShop();assert([...panel().querySelectorAll('[data-hub="gearDetail"]')].every(e=>e.querySelector('.ui-icon')));for(const kind of ['格闘','剣','槌','斧','槍'])ranksFor(0)[kind]=Math.max(5,ranksFor(0)[kind]||0);equipChoice(0,0);const candidates=[...panel().querySelectorAll('[data-hub="uiEquipPreview"]')];assert(candidates.length>3&&candidates.every(e=>e.querySelector('.equipment-kind-icon')))});
 await test('facility choice decks stay compact over scenery',()=>{reset();for(const fn of [market,inn,guild]){fn();const rows=[...document.querySelectorAll('#screen .facility-world-home button.row')];assert(rows.length>=4);assert(rows.every(e=>e.getBoundingClientRect().height<80),fn.name);town()}});
 await test('facility decorative icons do not duplicate accessible text',()=>{reset();market();const s=document.querySelector('#screen');assert([...s.querySelectorAll('.ui-icon')].every(e=>e.getAttribute('aria-hidden')==='true'&&e.getAttribute('focusable')==='false'));assert(s.querySelector('.facility-world-npc'));});
 await test('all six standing artworks are preloaded before character interaction',()=>{const links=[...document.querySelectorAll('link[rel="preload"][as="image"]')].filter(x=>x.getAttribute('href')?.includes('hub-standing-'));assert(links.length===6)});
 await test('character portrait is decoded when the character screen becomes visible',async()=>{reset();character(0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const img=panel().querySelector('.actor-backdrop img');assert(img&&img.complete&&img.naturalWidth>0&&img.getAttribute('decoding')==='sync')});
 await test('character screens inherit the artwork of the place they were opened from',()=>{
  reset();
  const cases=[
   [()=>town(),'hub-capital-bg'],
   [()=>guild(),'hub-guild-bg'],
   [()=>inn(),'hub-inn-bg'],
   [()=>market(),'hub-market-bg']
  ];
  for(const [openPlace,asset] of cases){
   openPlace();
   character(0);
   let backdrop=panel().querySelector('.actor-backdrop');
   assert(backdrop&&getComputedStyle(backdrop).backgroundImage.includes(asset),asset+' missing from overview');
   equip(0);
   backdrop=panel().querySelector('.actor-backdrop');
   assert(backdrop&&getComputedStyle(backdrop).backgroundImage.includes(asset),asset+' missing from equipment');
   skills(0);
   backdrop=panel().querySelector('.actor-backdrop');
   assert(backdrop&&getComputedStyle(backdrop).backgroundImage.includes(asset),asset+' missing from skills');
   charAbility(0);
   backdrop=panel().querySelector('.actor-backdrop');
   assert(backdrop&&getComputedStyle(backdrop).backgroundImage.includes(asset),asset+' missing from growth');
   document.querySelector('.hub-global-nav [data-nav="home"]').click();
  }
 });
 await test('character actions and shared cards follow the equipment layout',()=>{reset();character(0);const actions=[...panel().querySelectorAll('.character-action-deck [data-hub=uiActor]')].map(e=>e.textContent.trim());assert(JSON.stringify(actions)===JSON.stringify(['ステータス','能力値','スキル','修練']));assert(document.querySelectorAll('#party .m').length===6);assert(!panel().querySelector('.actor-member-switch'));skills(0);assert(panel().querySelectorAll('.skill-kind').length===panel().querySelectorAll('.skill-toggle').length);assert([...panel().querySelectorAll('button[data-hub]')].every(e=>HUB_ACTION_NAMES.includes(e.dataset.hub)))});
 await test('equipment home centers the character and surrounds it with seven equipment slots',()=>{reset();character(0);const p=panel(),art=p.querySelector('.actor-backdrop img'),shell=p.querySelector('.character-equipment-shell'),slots=[...p.querySelectorAll('.character-equip-slot')];assert(art&&shell&&slots.length===7);const left=p.querySelector('.character-equipment-side.left').getBoundingClientRect(),right=p.querySelector('.character-equipment-side.right').getBoundingClientRect(),pr=p.getBoundingClientRect();assert(left.right<pr.left+pr.width*.5&&right.left>pr.left+pr.width*.5);assert(!p.querySelector('.actor-tabs'));assert(!p.querySelector('.character-equipment-picker'))});
 await test('equipment preview comparison stays compact inside the bottom candidate sheet',()=>{reset();equipChoice(0,0,'戦槌');const p=panel(),picker=p.querySelector('.character-equipment-picker'),box=p.querySelector('.character-equipment-summary .equip-compare'),confirm=p.querySelector('.character-equipment-confirm [data-hub="fittingApply"]');assert(picker&&box&&confirm);assert(box.querySelectorAll('.equip-compare-grid>span').length===12);assert(box.getBoundingClientRect().width<=picker.getBoundingClientRect().width+1);assert(picker.getBoundingClientRect().bottom<=p.querySelector('.panel-body').getBoundingClientRect().bottom+1)});
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
   assert(o.bottom<=s.bottom+1&&o.bottom<=party.getBoundingClientRect().top+1);
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
 await test('market internal screens preserve one fixed background and NPC frame',()=>{
  reset();gold=99999;loot.結晶=Math.max(5,loot.結晶||0);loot.皮=Math.max(10,loot.皮||0);
  market();
  const snap=()=>{
   const app=document.querySelector('#app'),screen=document.querySelector('#screen'),npc=document.querySelector('.facility-world-npc'),overlay=document.querySelector('.facility-world-overlay'),party=document.querySelector('#party'),nav=document.querySelector('.hub-global-nav');
   assert(app.classList.contains('market-world'));assert(!document.querySelector('#modal').classList.contains('on'));assert(npc&&overlay&&party&&nav);assert(getComputedStyle(app).backgroundImage.includes('hub-market-bg'));
   const s=screen.getBoundingClientRect(),n=npc.getBoundingClientRect(),o=overlay.getBoundingClientRect();
   assert(document.querySelectorAll('#party .m').length===6&&nav.querySelectorAll('button').length===3);assert(o.bottom<=s.bottom+1&&o.bottom<=party.getBoundingClientRect().top+15);
   return {screen:[s.x,s.y,s.width,s.height],npc:[n.x,n.y,n.width,n.height]};
  };
  const baseFrame=snap(),same=()=>{const now=snap();for(let i=0;i<4;i++)assert(Math.abs(now.screen[i]-baseFrame.screen[i])<=1,'market screen moved');for(let i=0;i<4;i++)assert(Math.abs(now.npc[i]-baseFrame.npc[i])<=1,'market NPC moved')};
  const firstArmor=Object.keys(ARMOR_VARIANTS)[0],firstRecipe=0,firstWeapon='王国剣';
  const views=[
   ()=>gearShopMenu(),()=>weaponShop(),()=>gearDetail(firstWeapon),()=>armorShop(),()=>armorDetail(firstArmor),()=>toolShop(),()=>toolQuantity('回復薬'),
   ()=>craftMenu(),()=>recipeMenu(),()=>recipeDetail(firstRecipe),()=>upgradeMenu(),()=>traitMenu(),()=>traitChoice(inventory.weapons[0]),
   ()=>sellMenu(),()=>materialTrade(),()=>materialQuantity(Object.keys(hc().materialPrices)[0]),
   ()=>confirmAction('素材を全て売却','確認します。','sellMaterial',[Object.keys(hc().materialPrices)[0],1]),
   ()=>note('所持金不足')
  ];
  for(const open of views){open();same()}
 });
 await test('inn internal screens preserve one fixed background and NPC frame',()=>{
  reset();H.history=[{id:'inn-audit',dungeon:'古代迷宮',result:'帰還',floor:1,battles:1,rescues:0,loot:[],started:0,ended:60000}];
  inn();
  const snap=()=>{
   const app=document.querySelector('#app'),screen=document.querySelector('#screen'),npc=document.querySelector('.facility-world-npc'),overlay=document.querySelector('.facility-world-overlay'),party=document.querySelector('#party'),nav=document.querySelector('.hub-global-nav');
   assert(app.classList.contains('inn-world'));assert(!document.querySelector('#modal').classList.contains('on'));assert(npc&&overlay&&party&&nav);assert(getComputedStyle(app).backgroundImage.includes('hub-inn-bg'));
   const s=screen.getBoundingClientRect(),n=npc.getBoundingClientRect(),o=overlay.getBoundingClientRect();
   assert(document.querySelectorAll('#party .m').length===6&&nav.querySelectorAll('button').length===3);assert(o.bottom<=s.bottom+1&&o.bottom<=party.getBoundingClientRect().top+15);
   return {screen:[s.x,s.y,s.width,s.height],npc:[n.x,n.y,n.width,n.height]};
  };
  const baseFrame=snap(),same=()=>{const now=snap();for(let i=0;i<4;i++)assert(Math.abs(now.screen[i]-baseFrame.screen[i])<=1,'inn screen moved');for(let i=0;i<4;i++)assert(Math.abs(now.npc[i]-baseFrame.npc[i])<=1,'inn NPC moved')};
  const views=[
   ()=>conversation(),()=>memberTalk(0),()=>npcMenu(),()=>npcTalk('受付'),()=>pairMenu(),()=>readPair(0),()=>talkArchive('companion',0),()=>rumors(),()=>note('案内があります'),()=>checkpointResult('会話を記録しました','記録しました。','conversation')
  ];
  for(const open of views){open();same()}
 });
 await test('field merchant uses a dedicated portrait',()=>{assert(V.fieldMerchantImage&&V.fieldMerchantImage.includes('hub-merchant-npc'))});
 await test('back navigation still works with fixed facilities',()=>{reset();market();toolShop();toolQuantity('回復薬');const back=document.querySelector('.hub-global-nav [data-nav="back"]');back.click();assert(document.querySelector('#screen').textContent.includes('道具屋'));back.click();assert(document.querySelector('#screen').textContent.includes('市場'));assert(document.querySelector('#app').classList.contains('market-world'))});
 reset();return out;
}
