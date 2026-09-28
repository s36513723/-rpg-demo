/* UI10 visual vocabulary. No progression, inventory or battle mutations. */
(()=>{
'use strict';
const paths={
 empty:'M4 4h16v16H4V4ZM8 12h8',
 home:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',
 back:'m14 5-7 7 7 7',next:'m9 5 7 7-7 7',close:'m6 6 12 12M6 18 18 6',
 town:'M3 21V9h6v12m6 0V6h6v15M1 21h22M4 9V4l2 2 2-2v5m8-3V2l2 2 2-2v4M9 21v-6a3 3 0 0 1 6 0v6',
 tavern:'M5 5h12v13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5Zm12 3h2a3 3 0 0 1 0 6h-2M8 2v3m4-3v3m4-3v3M9 9v8m4-8v8',
 guild:'m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5l8-3Zm0 5v9m-4-6h8',
 forge:'M3 8h18l-5 5h-5l-3-2H3V8Zm8 5v5m5-5v5M7 21v-3h13v3M7 3h9M9 3v3',
 map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16',
 compass:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-6-3-2 4-4 2 2-4 4-2Z',
 party:'M10 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10 1a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM1 20v-3a6 6 0 0 1 12 0v3H1Zm13-7a5 5 0 0 1 9 4v3h-7',
 bag:'M6 7h12l3 5v9H3v-9l3-5ZM8 7V3h8v4M3 13h18M8 16h8v5',
 book:'M3 3h7a3 3 0 0 1 2 1 3 3 0 0 1 2-1h7v17h-7a3 3 0 0 0-2 1 3 3 0 0 0-2-1H3V3Zm9 1v17M6 7h3m6 0h3M6 11h3m6 0h3',
 scroll:'M7 3h13v3H7a2 2 0 0 1 0-4M6 5v15h11V6M3 17h14v3a2 2 0 0 1-4 0M9 9h5m-5 4h5',
 quest:'M8 4H5v18h14V4h-3M8 2h8v5H8V2Zm0 10 2 2 5-5M8 18h7',
 report:'M4 3h10l5 5v13H4V3Zm10 0v5h5m-12 6 3 3 6-7',
 speech:'M21 11c0 5-4 8-9 8H9l-6 3 1-6a8 8 0 0 1-1-5c0-5 4-8 9-8s9 3 9 8ZM7 9h10M7 13h6',
 pair:'M14 8a5 5 0 0 1 7 4v4l1 3-4-1h-4M2 3h14v11H7l-5 3V3Zm3 4h8M5 10h6',
 rumor:'M8 8a4 4 0 0 1 8 0c0 4-5 5-5 8a3 3 0 0 1-6 0M7 8a5 5 0 0 1 10-1c2 7-4 7-4 10M20 4l2-2m-2 7h3',
 quill:'M4 21 8 10 19 2l3 3-8 11L4 21Zm4-11 6 6m-8 1 11-11M3 22h13',
 eye:'M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
 settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Zm7 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 save:'M3 3h15l3 3v15H3V3Zm4 0v7h10V3M7 21v-7h10v7',
 upload:'M3 16v5h18v-5M12 17V3M6 9l6-6 6 6',download:'M3 16v5h18v-5M12 3v14M6 11l6 6 6-6',
 trash:'M3 6h18M5 6l1 15h12l1-15M9 6V3h6v3M9 10v7m6-7v7',
 sword:'m4 20 5-5m-4-4 8 8m-4-4L20 4l1-3-3 1L7 13M2 18l4 4',
 dagger:'m3 21 7-7m-4-4 8 8m-4-4 8-11 3-2-2 6-7 9',
 hammer:'m4 21 10-12m-5-6 4-2 9 7-4 5-9-10Zm-6 16 3 3',
 axe:'m5 21 12-18m-6 2 9 6 2-5-7-5M9 8l8 6-5 2-5-4',
 spear:'m3 22 13-15m-4 0 9-6-2 10-3-4-4 0Z',
 bow:'M6 2c14 3 14 17 0 20l4-10L6 2ZM2 12h18m-3-3 3 3-3 3',
 shield:'m12 2 8 3v7c0 4-4 8-8 10-4-2-8-6-8-10V5l8-3Zm0 4v12',
 staff:'M10 22V10M6 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM8 15h4M8 18h4m10-16 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z',
 wand:'m3 21 11-13m-3-6 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Zm7 8 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z',
 whip:'m4 21 3-6m-2-1 4 2M7 15c-6-6 0-13 8-12 8 1 5 9-1 8-6-1-3-7 2-5',
 scythe:'M6 23V2m0 1c9-3 16 3 17 10-5-6-10-7-17-6',
 katana:'M3 22 8 17m-3-3 6 6M8 17C16 11 20 5 20 1c-5 7-9 11-15 13',
 gun:'M3 6h18v5H10l-4 9H2l4-9H3V6Zm8 5v4h4l2-4M17 3v3',
 fist:'M5 11V7a2 2 0 0 1 4 0V5a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v3a2 2 0 0 1 4 0v7l-4 6H8l-5-7a2 2 0 0 1 2-4Zm4-4v5m4-6v6m4-3v4',
 throw:'M12 2 15 9l7 3-7 3-3 7-3-7-7-3 7-3 3-7Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
 armor:'m8 2 4 3 4-3 6 5-4 5v9H6v-9L2 7l6-5Zm0 0v7h8V2M9 14h6',
 robe:'m8 2 4 2 4-2 6 7-4 3-1-3 3 13H4L7 9l-1 3-4-3 6-7Zm4 2v18M8 13h8',
 jewel:'m7 3-5 7 10 12 10-12-5-7H7Zm-5 7h20M7 3l5 19 5-19',
 potion:'M9 2h6M10 2v6c-6 3-7 6-6 10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c1-4 0-7-6-10V2M6 13h12M12 15v5m-2-2h4',
 antidote:'M9 2h6M10 2v6c-6 3-7 6-6 10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c1-4 0-7-6-10V2m-6 9 4 4 5-5',
 bomb:'M10 6h5l1 3a7 7 0 1 1-7 0l1-3Zm3 0c-1-4 4-2 4-5m2 1 2 1M6 14v3',
 smoke:'M7 3c-4 2 4 3 0 6m5-8c-4 3 5 4 0 8m5-6c-4 2 3 3 0 6M6 13h12l2 9H4l2-9Zm0 4h12',
 rope:'M9 19c-8-4-5-16 3-16s11 12 3 16M9 19c-5-4-4-12 3-12s8 8 3 12M9 17h6v5H9v-5Zm2 5v2',
 key:'M9 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm0 0h14m-4 0v4m-4-4v3',
 water:'M12 2C9 7 4 11 4 15a8 8 0 0 0 16 0c0-4-5-8-8-13Zm-4 12c-1 2 0 4 2 5',
 herb:'M4 22c0-9 10-9 14-17M4 17C1 4 15 1 22 2c1 12-10 16-18 15Z',
 sun:'M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',
 moon:'M20 16A9 9 0 1 1 8 3a8 8 0 0 0 12 13Z',
 flame:'M12 2c3 5 7 8 7 13a7 7 0 0 1-14 0c0-4 4-7 4-10l3 4V2Zm0 11c-5 5 1 10 3 5',
 wind:'M2 8h13c5 0 5-6 1-6-2 0-3 1-3 3M2 12h17c4 0 4 6 0 6-2 0-3-1-3-3M2 17h7c3 0 3 5 0 5',
 mountain:'m1 21 8-16 5 9 3-6 6 13H1ZM6 11l3 2 3-2',
 stars:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7ZM20 2v4m-2-2h4',
 mastery:'M12 3v9M4 20v-5h16v5M12 15v5M9 3h6v5H9V3ZM2 20h4v3H2v-3Zm8 0h4v3h-4v-3Zm8 0h4v3h-4v-3',
 eyeoff:'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7ZM3 3l18 18',
 formation:'M3 3h4v5H3V3Zm7 0h4v5h-4V3Zm7 0h4v5h-4V3ZM3 17h4v5H3v-5Zm7 0h4v5h-4v-5Zm7 0h4v5h-4v-5ZM5 12h14',
 swap:'M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4',
 chest:'M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v13H3V8Zm0 2h18M9 10v5h6v-5M7 3v7m10-7v7',
 coin:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 7H9v5h6v5H9m3-12v14',
 plus:'M12 4v16M4 12h16',check:'m4 12 5 5L21 5',lock:'M6 10V7a6 6 0 0 1 12 0v3M4 10h16v12H4V10Zm8 5v3',
 warning:'m12 2 10 19H2L12 2Zm0 6v6m0 3v1',
 flag:'M5 23V2h14l-3 5 3 5H5',
 camp:'m2 21 10-19 10 19H2Zm6 0 4-8 4 8M2 21h20',
 skull:'M4 10a8 8 0 0 1 16 0v5l-4 2v5H8v-5l-4-2v-5Zm4-1v4m8-4v4m-4 3v6',
 boss:'M3 20h18v-8l-5 3-4-10-4 10-5-3v8ZM3 4h2m7-3v2m7 1h2',
 event:'M9 7a3 3 0 0 1 6 0c0 3-3 3-3 6m0 4v1M12 1l11 11-11 11L1 12 12 1Z',
 stairs:'M2 21h5v-5h5v-5h5V6h5M3 9V2h7M3 2l8 8',
 terrain:'M3 21V9l4-5 4 5v12M13 21V8l5-6 4 6v13M1 21h22M6 12h2m8-2h4',
 merchant:'M2 4h20l-2 6H4L2 4ZM4 10v12h16V10M8 22v-7h8v7M2 4l2-3h16l2 3',
 heart:'M12 21 3 12C-3 3 9-1 12 6c3-7 15-3 9 6l-9 9Z',
 history:'M3 12a9 9 0 1 1 3 7M3 3v7h7m2-4v6l4 3',
 search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 4 8 8',
 rest:'M3 3v19m18-10v10M3 12h18v6H3V12Zm1-6h6v6H4V6Z',
 music:'M9 18V5l11-3v13M9 8l11-3M9 18c0 5-8 5-8 1s8-4 8-1Zm11-3c0 5-8 5-8 1s8-4 8-1Z'
};
const glyph=(key,extra='')=>'<svg class="ui-icon '+extra+'" data-icon="'+key+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="'+(paths[key]||paths.compass)+'"/></svg>';
const esc=s=>hesc(s);
const cast=['gald','lize','ern','sena','mirea','yuna'];
const npcGlyph={'受付':'quill','鍛冶師':'forge','学者':'book','宿主':'tavern','伝令':'wind','守人':'sun'};
const npcStand={'受付':'../images/hub-guild-npc.webp','鍛冶師':'../images/hub-market-npc.webp','学者':'../images/npc_iris_stand.svg','宿主':'../images/hub-inn-npc.webp','伝令':'../images/npc_noa_stand.svg','守人':'../images/npc_sahir_stand.svg'};
const npcImage=npcStand;
const facilityArt={town:'../images/town_lexia.svg',inn:'../images/hub-inn-bg.webp',guild:'../images/hub-guild-bg.webp',market:'../images/hub-market-bg.webp'};
const facilityLabel={town:'王都レクシア',inn:'宿屋',guild:'ギルド',market:'市場'};
const facilityCopy={town:'冒険者区の朝。下のタブから宿屋・ギルド・市場を切り替える。',inn:'マルタの宿屋。部屋で休み、仲間や客と話し、出撃準備を整える。',guild:'依頼と査定の窓口。探索資料や地域調査の進捗もここで整理する。',market:'武具、道具、加工、売却をまとめた装備管理の中心。'};
const regionArt={'古代迷宮':'../images/region_maze.svg','辺境遺跡':'../images/region_frontier.svg','深淵の樹海':'../images/region_forest.svg','沈黙の砂都':'../images/region_sand.svg'};
const themeArt={'森林':'../images/theme_forest.svg','洞窟':'../images/theme_cave.svg','廃墟都市':'../images/theme_ruins.svg','山岳':'../images/theme_mountain.svg','沼地':'../images/theme_swamp.svg','砂漠遺跡':'../images/theme_desert.svg','海上・船':'../images/theme_sea.svg','地下神殿':'../images/theme_temple.svg'};
const merchantImage='../images/npc_merchant.svg';
const enemyImage={archer:'../images/enemy_archer.svg',guard:'../images/enemy_guard.svg',mage:'../images/enemy_mage.svg',beast:'../images/enemy_beast.svg',golem:'../images/enemy_golem.svg',nature:'../images/enemy_nature.svg',flying:'../images/enemy_flying.svg'};
const eventIcon=e=>/水門|泉|湧き水/.test(e.name)?'water':/星|観測|砂時計/.test(e.name)?'stars':/避難庫|船倉|書庫/.test(e.name)?'chest':/測量士|伝令|薬草師|旅人/.test(e.name)?'party':/庭|毒花|根|霊獣/.test(e.name)?'herb':/吊り籠|標石/.test(e.name)?'rope':/灯台|黄金/.test(e.name)?'sun':/石列/.test(e.name)?'wind':/墓標/.test(e.name)?'history':'event';
const eventTheme=e=>{const list=hc().regions[e.region]?.themes||[];const i=Math.max(0,hc().events.findIndex(x=>x.id===e.id));return list[i%Math.max(1,list.length)]||list[0]||''};
const enemyKind=n=>/守護機|ゴーレム|機械|番人/.test(n)?'golem':/巨獣|獣|狼|霊獣/.test(n)?'beast':/樹母|樹|花|蔓/.test(n)?'nature':/弓|射手/.test(n)?'archer':/魔|術師|神官|呪/.test(n)?'mage':/飛|翼/.test(n)?'flying':'guard';
const enemyAsset=n=>enemyImage[enemyKind(String(n||''))]||enemyImage.guard;
const enemyThumb=n=>'<img class="visual-portrait enemy-thumb" data-person="'+esc(n)+'" src="'+enemyAsset(n)+'" alt="">';
const person=(kind,id)=>{
 if(kind==='npc'){const n=hc().npcs.find(n=>n.id===id)||hc().npcs[id===0?3:4];return n?{name:n.name,role:n.role,key:n.id,icon:npcGlyph[n.id]||'speech',image:npcImage[n.id]||'',stand:npcStand[n.id]||npcImage[n.id]||''}:null}
 const i=typeof id==='number'?id:names.indexOf(id);return i>=0&&i<6?{name:names[i],role:battleStyle(i),image:'../images/'+cast[i]+'.svg',key:'ally-'+i}:null;
};
const portrait=(p,cls='')=>!p?'':p.image?'<img class="visual-portrait '+cls+(p.key&&npcImage[p.key]?' npc-face':'')+'" data-person="'+esc(p.name)+'" src="'+p.image+'" alt="">':'<span class="role-emblem '+cls+'" data-person="'+esc(p.name)+'" data-role="'+esc(p.key)+'" aria-hidden="true">'+glyph(p.icon)+'</span>';
const peopleHeader=(ps,label='')=>'<div class="conversation-cast">'+ps.filter(Boolean).map(p=>'<div>'+portrait(p)+'<span><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></span></div>').join('')+(label?'<span class="scene-label">'+esc(label)+'</span>':'')+'</div>';
const dialogue=(p,text)=>'<figure class="dialogue-block">'+portrait(p)+'<figcaption><b class="speaker">'+esc(p.name)+'</b><small>'+esc(p.role)+'</small><blockquote>'+esc(text)+'</blockquote></figcaption></figure>';
const npcStage=(p,text)=>'<section class="npc-stage"><div class="npc-stage-art"><img class="npc-stand" src="'+esc(p.stand||p.image)+'" alt=""><div class="npc-identity"><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div></div><div class="npc-speech"><p>'+esc(text)+'</p></div></section>';
const facilityStage=(p,id,kind='inn',speech='')=>'<section class="facility-stage facility-stage-'+esc(kind)+'"><button class="facility-host" type="button" data-hub="npcTalk" data-args="'+esc(JSON.stringify([id]))+'"><span class="facility-word" aria-hidden="true">'+esc(({inn:'INN',guild:'GUILD',market:'MARKET'})[kind]||'FACILITY')+'</span><img class="facility-stand" src="'+esc(p.stand||p.image)+'" alt=""><span class="facility-identity"><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></span><span class="facility-talk">'+glyph('speech')+' 話す</span>'+(speech?'<span class="facility-dialogue"><b>'+esc(p.name)+'</b><span>'+esc(speech)+'</span></span>':'')+'</button></section>';
const guildContextRoutes=new Set(['guildDesk','questMenu','questSelect','reportChapter','infoMenu','dungeonIntel','regionRecords','regionRecord','enemyBook','enemyRecord','clueRecord','recordList','appraiseMenu','rareAppraise','storageMenu','depositMenu','guildMembers','guildSellMenu','guildSaleQuantity','guildSaleConfirm']);
const guildSpeech=(name,args=[])=>{
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
 return 'ご用件を確認しますね。';
};
const itemIcon=n=>{
 const s=String(n||'');if(!s||s==='なし')return 'empty';
 const pairs=[[/解毒/,'antidote'],[/回復薬|薬瓶|魔法薬/,'potion'],[/煙玉/,'smoke'],[/爆弾|爆薬/,'bomb'],[/登攀|縄/,'rope'],[/解錠具|鍵/,'key'],[/浄化香|薬草|霊樹/,'herb'],[/清水/,'water'],[/投げ|鉄針|投石|回刃|投擲/,'throw'],[/短剣/,'dagger'],[/槌/,'hammer'],[/斧/,'axe'],[/槍/,'spear'],[/鞭/,'whip'],[/鎌/,'scythe'],[/刀/,'katana'],[/弓/,'bow'],[/銃/,'gun'],[/短杖|杖/,'staff'],[/盾/,'shield'],[/剣/,'sword'],[/拳|格闘|無手/,'fist'],[/呪符|符術/,'scroll'],[/魔装/,'robe'],[/軽装|重装|防具/,'armor'],[/護符|装飾/,'jewel'],[/風晶|結晶|金砂/,'jewel'],[/古器|遺物/,'chest'],[/皮/,'armor'],[/封文|銘板|原典|航路図|記憶/,'scroll']];
 return pairs.find(([re])=>re.test(s))?.[1]||'bag';
};
const masteryIcon=n=>({'源泉':'flame','術法':'wand','技能':'compass','武器':'sword','防具':'armor','森羅':'herb','灼陽':'sun','霊峰':'mountain','海神':'water','星辰':'stars','信仰':'sun','呪術':'moon','魔術':'wand','符術':'scroll','機巧':'settings','異能':'eye','探索':'compass','士気':'music'})[n]||itemIcon(n);
const regionIcon=n=>({'古代迷宮':'terrain','辺境遺跡':'mountain','深淵の樹海':'herb','沈黙の砂都':'sun'})[n]||'map';
const regionOf=route=>{const x=route.args?.[0];if(['deployment','dungeonIntel','regionRecord','readStory'].includes(route.name)&&typeof x==='string')return x;if(route.name==='questSelect'){const q=findQuest(x);return q?.d||''}if(route.name==='historyDetail'){const h=H.history.find(z=>z.id===x)||(lastExpedition.id===x?lastExpedition:null);return h?.dungeon||''}return H.run?.dungeon||H.selected||dungeonId||''};
const sceneCard=({kind='region',image='',kicker='',title='',text='',icon='map'}={})=>'<section class="scene-banner scene-'+kind+'"><img class="scene-art" src="'+image+'" alt=""><div class="scene-copy"><span class="scene-kicker">'+esc(kicker)+'</span><b>'+esc(title)+'</b><small>'+esc(text)+'</small></div><span class="scene-mark" aria-hidden="true">'+glyph(icon)+'</span></section>';
const regionBanner=region=>region&&regionArt[region]?sceneCard({kind:'region',image:regionArt[region],kicker:'REGION',title:region,text:hc().regions[region]?.intro||hc().regions[region]?.mechanism||'',icon:regionIcon(region)}):'';
const facilityBanner=name=>facilityArt[name]?sceneCard({kind:'facility',image:facilityArt[name],kicker:'FACILITY',title:facilityLabel[name]||name,text:facilityCopy[name]||'',icon:actions[name]||'town'}):'';
const themeBanner=(theme,title,text,icon='compass')=>themeArt[theme]?sceneCard({kind:'theme',image:themeArt[theme],kicker:theme||'FIELD',title:title||theme,text:text||'',icon}):'';
const eventBanner=e=>e?sceneCard({kind:'event',image:themeArt[eventTheme(e)]||regionArt[e.region],kicker:'EVENT',title:e.name,text:e.text,icon:eventIcon(e)}):'';
const merchantBanner=()=>sceneCard({kind:'merchant',image:merchantImage,kicker:'TRAVELER',title:'旅商人',text:'探索の途中だけ利用できる行商人。在庫はこの遠征中に限られます。',icon:'merchant'});
const enemyBanner=n=>sceneCard({kind:'enemy',image:enemyAsset(n),kicker:'ENCOUNTER',title:n||'敵情報',text:'遭遇で判明した弱点・耐性・部位を記録しています。',icon:'skull'});
const nodeGlyph=n=>({battle:'sword',explore:'search',event:'event',camp:'camp',elite:'skull',merchant:'merchant',forge:'forge',stairs:'stairs',boss:'boss',secret:'stars'})[n]||'compass';
const actions={guildMembers:'party',guildSellMenu:'coin',guildSaleQuantity:'coin',guildSaleConfirm:'coin',guildSaleComplete:'coin',guildSaleCancel:'back',town:'home',inn:'tavern',roomMenu:'rest',innRest:'rest',guild:'guild',guildDesk:'quest',market:'forge',gearShopMenu:'sword',dungeon:'map',deployment:'compass',startDungeon:'compass',partyMenu:'party',character:'party',charOverview:'party',charAbility:'plus',equip:'sword',skills:'stars',mastery:'mastery',charMastery:'mastery',readiness:'check',squadMenu:'formation',toggleRow:'swap',swapFormation:'swap',rowSwapMenu:'swap',presetMenu:'save',savePreset:'save',applyPreset:'check',askSavePreset:'save',swapMain:'swap',items:'bag',uiInventory:'bag',itemCategory:'bag',records:'book',explorationStats:'history',recordList:'book',regionRecords:'map',enemyBook:'skull',enemyRecord:'eye',peopleBook:'party',personRecord:'party',clueRecord:'scroll',historyMenu:'history',historyDetail:'history',storyMenu:'scroll',startStory:'quill',readStory:'book',reportChapter:'report',finishChapter:'quill',epilogue:'sun',finishEnding:'flag',questMenu:'quest',questSelect:'quest',reportAll:'report',claimQuest:'report',acceptQuest:'plus',trackQuest:'flag',uiClearTrack:'flag',askAbandonQuest:'close',abandonQuest:'close',conversation:'speech',memberTalk:'speech',npcMenu:'party',npcTalk:'speech',pairMenu:'pair',readPair:'pair',talkArchive:'book',finishCompanion:'speech',finishNPC:'quill',returnTalk:'tavern',rumors:'rumor',rumorDetail:'rumor',addRumor:'rumor',infoMenu:'book',dungeonIntel:'map',toolShop:'potion',weaponShop:'sword',armorShop:'armor',armorDetail:'armor',armorEquipMenu:'armor',equipArmor:'armor',craftMenu:'forge',recipeMenu:'forge',upgradeMenu:'hammer',traitMenu:'wand',appraiseMenu:'search',appraise:'search',rareAppraise:'chest',keepRare:'bag',storeRare:'chest',restoreRare:'bag',sellRare:'coin',sellMenu:'coin',sellWeapon:'coin',sellTool:'coin',sellMaterial:'coin',askSellAll:'coin',storageMenu:'chest',depositMenu:'chest',deposit:'download',withdraw:'upload',materialTrade:'jewel',favoriteGear:'stars',settings:'settings',cycleText:'book',toggleConfirm:'check',manualSave:'save',exportSave:'upload',chooseImport:'download',askRestore:'history',resetSave:'trash',resetSaveConfirmed:'trash',cancelImport:'back',confirmImport:'download',closeM:'home',uiBack:'back',askReturn:'home',returnTown:'home',resumeExpedition:'map',expeditionMenu:'map',runJournal:'book',battlePrep:'shield',battleDemo:'sword',pendingBattleMenu:'sword',resumeNode:'compass',camp:'camp',campHeal:'rest',moraleMenu:'music',setMorale:'music',mechanismMenu:'settings',operateMechanism:'settings',eventChoice:'event',explorationNode:'search',takeExploration:'search',stairsMenu:'stairs',nextFloor:'stairs',secretNode:'stars',claimSecret:'chest',skipBattle:'eyeoff',leaveNode:'next',merchantNode:'merchant',dungeonForge:'forge',uiMapLegend:'map'};
const actionIcon=(action,args=[],text='')=>{
 if(['toolQuantity','buyTool','useTool','uiCarryUsers','gearDetail','buyGear','upgradeGear','traitChoice','dungeonUpgrade','merchantBuy','materialQuantity'].includes(action))return itemIcon(args[0]);
 if(action==='setEquip')return itemIcon(args[2]);
 if(action==='equipChoice')return itemIcon(eq[args[0]]?.[args[1]]?.split('：')[1]);
 if(action==='uiActor')return ({overview:'party',ability:'plus',equip:'sword',skills:'stars',mastery:'mastery'})[args[1]]||'party';
 if(['growMastery','masteryType','masteryBranches','masterySkills','gearBranches','trainMastery'].includes(action))return masteryIcon(args[1]);
 if(['recipeDetail','craftRecipe'].includes(action))return itemIcon(hc().recipes[args[0]]?.name);
 if(['regionRecord','deployment','dungeonIntel','readStory'].includes(action))return regionIcon(args[0]);
 if(action==='eventReward')return ['search','warning','shield','next'][args[0]]||'event';
 if(['toggleLearnedSkill','learnSkill','learnGear'].includes(action)){const d=rules().meta(args.find(x=>rules().meta(x)));return d?.weapons?.length?itemIcon(d.weapons[0]):d?.mode==='Passive'?'mastery':({'火':'flame','水':'water','土':'mountain','風':'wind','光':'sun','闇':'moon'})[d?.attr]||'stars'}
 if(action==='selectBlessing')return ({'先制':'wind','看破':'eye','守護':'shield'})[args[0]]||'stars';
 if(action==='uiInventory')return ({'道具':'potion','装備':'sword','素材':'jewel','記録':'scroll'})[args[0]]||'bag';
 return actions[action]||(/戻|一覧/.test(text)?'back':/続け|進む/.test(text)?'next':/受領|確定|する$/.test(text)?'check':'compass');
};
const readArgs=e=>{try{return JSON.parse(e.dataset.args||'[]')}catch(_){return []}};
const thumbFor=(action,args)=>{
 if(['memberTalk','character'].includes(action))return portrait(person('ally',args[0]));
 if(action==='npcTalk')return portrait(person('npc',args[0]));
 if(action==='talkArchive')return portrait(person(args[0]==='npc'?'npc':'ally',args[1]));
 if(action==='personRecord')return portrait(person(args[0]==='npc'?'npc':'ally',args[1]));
 if(action==='enemyRecord')return enemyThumb(args[0]);
 if(action==='readPair'){const p=hc().pairs[args[0]];return p?'<span class="duet-thumb">'+portrait(person('ally',p[0]))+portrait(person('ally',p[1]))+'</span>':''}
 return '';
};
const markRow=e=>{
 if(e.dataset.visualized||e.classList.contains('icon-button')||e.classList.contains('modal-x')||e.classList.contains('panel-back')||e.classList.contains('stat-plus'))return;
 if(e.closest('.facility-action-deck')){e.dataset.visualized='true';return;}
 const action=e.dataset.hub,args=readArgs(e),icon=actionIcon(action,args,e.textContent),thumb=thumbFor(action,args);
 if(e.classList.contains('skill-toggle')){e.querySelector('b')?.insertAdjacentHTML('afterbegin',glyph(icon,'skill-kind'));e.dataset.visualized='true';return}
 if(e.classList.contains('row')){e.classList.add(thumb?'has-portrait':'has-icon');e.insertAdjacentHTML('afterbegin','<span class="row-visual" aria-hidden="true">'+(thumb||glyph(icon))+'</span>')}
 else if(e.closest('.ui-tabs')){e.insertAdjacentHTML('afterbegin',glyph(icon))}
 else if(e.classList.contains('swap-set')||e.classList.contains('primary-action')||e.classList.contains('mini')){if(e.classList.contains('swap-set'))e.textContent=e.textContent.replace(/^⇄\s*/, '');e.insertAdjacentHTML('afterbegin',glyph(icon));e.classList.add('icon-action')}
 else return;
 e.dataset.visualized='true';
};
const decorateScene=(root,route)=>{
 const body=root.querySelector?.('.panel-body');
 if(body&&!body.dataset.sceneVisual){
  let banner='',theme=H.run?.themes?.[Math.max(0,(H.run?.floor||1)-1)]||'';
  if(['inn','guild','market'].includes(route.name))banner='';
  else if(route.name==='eventChoice')banner=eventBanner(eventForNode());
  else if(route.name==='explorationNode')banner=themeBanner(theme,'調査地点',(currentNode()?.terrain||'')+'を調べています。','search');
  else if(route.name==='camp'||route.name==='moraleMenu')banner=themeBanner(theme,'野営',theme+'で隊を休め、資源と状態を整えます。','camp');
  else if(route.name==='merchantNode')banner=merchantBanner();
  else if(route.name==='dungeonForge')banner=sceneCard({kind:'forge',image:facilityArt.market,kicker:'FIELD FORGE',title:'探索工房',text:'この地点で一度だけ武具を加工できます。',icon:'forge'});
  else if(route.name==='stairsMenu')banner=themeBanner(theme,'次の層へ',theme+'の出口。資源を保持したまま次の環境へ進みます。','stairs');
  else if(route.name==='enemyRecord')banner=enemyBanner(route.args?.[0]);
  else if(['deployment','dungeonIntel','regionRecord','questSelect','historyDetail','mechanismMenu','secretNode','runJournal','battlePrep'].includes(route.name)){const region=regionOf(route);banner=regionBanner(region)}
  if(banner){body.insertAdjacentHTML('afterbegin',banner);body.dataset.sceneVisual='1'}
 }
 if(route.name==='town'){
  const scene=root.querySelector?.('.town-scene');
  if(scene&&!scene.dataset.heroVisual){
   scene.dataset.heroVisual='1';
   scene.querySelectorAll('.place').forEach(e=>{if(e.querySelector('.place-art'))return;const name=e.dataset.hub,src=name==='partyMenu'?regionArt[H.selected||dungeonId]:facilityArt[name];if(src)e.insertAdjacentHTML('afterbegin','<img class="place-art" src="'+src+'" alt="">')});
   const select=scene.querySelector('.region-select');
   if(select&&!select.querySelector('.region-preview')){const region=H.selected||dungeonId;if(regionArt[region])select.insertAdjacentHTML('afterbegin','<img class="region-preview" src="'+regionArt[region]+'" alt="">')}
  }
 }
};
const dialoguePage=(panel,route)=>{
 const body=panel.querySelector('.panel-body');if(!body||body.dataset.dialogueVisual==='1')return;body.dataset.dialogueVisual='1';
 const {name,args}=route;let p=null,message=body.querySelector('.message');
 if(name==='memberTalk')p=person('ally',args[0]);
 if(name==='npcTalk')p=person('npc',args[0]);
 if(name==='returnTalk'&&message){const match=message.textContent.match(/^([^「]+)「([\s\S]*)」$/);if(match){p=person('ally',match[1]);message.textContent=match[2]}}
 if(name==='npcTalk'&&p&&message){
  const stage=document.createElement('div');stage.innerHTML=npcStage(p,message.textContent);const scene=stage.firstElementChild;message.replaceWith(scene);
  const deck=document.createElement('div');deck.className='npc-action-deck';
  [...body.children].forEach(el=>{if(el===scene)return;if(el.classList.contains('actions')){[...el.children].forEach(b=>deck.append(b));el.remove()}else if(el.matches('.row'))deck.append(el)});
  if(deck.children.length===1)deck.classList.add('single');
  body.append(deck);body.classList.add('npc-conversation-page');
 }else if(p&&message){message.outerHTML=dialogue(p,message.textContent);body.classList.add('conversation-page')}
 if(['conversation','npcMenu'].includes(name))body.classList.add('people-select-page');
 if(name==='partyMenu')body.classList.add('sortie-page');
 if(name==='roomMenu')body.classList.add('room-page');
 if(name==='readPair'){const pair=hc().pairs[args[0]];if(pair){body.insertAdjacentHTML('afterbegin',peopleHeader([person('ally',pair[0]),person('ally',pair[1])]));message?.classList.add('scene-narration');body.classList.add('conversation-page')}}
 if(name==='talkArchive'){p=person(args[0]==='npc'?'npc':'ally',args[1]);if(p){body.insertAdjacentHTML('afterbegin',peopleHeader([p],'会話記録'));body.querySelectorAll('.row.static').forEach(e=>e.classList.add('archive-line'))}}
 if(name==='reportChapter'){const row=[...body.querySelectorAll('.row.static')].find(e=>e.querySelector('b')?.textContent==='イリス');if(row)row.outerHTML=dialogue(person('npc','学者'),row.querySelector('.small')?.textContent||'')}
 if(['storyMenu','readStory','epilogue'].includes(name))body.querySelectorAll('.message').forEach(e=>e.classList.add('scene-narration'));
 if(['inn','guild','market'].includes(name)){
  const id={inn:'宿主',guild:'受付',market:'鍛冶師'}[name],host=person('npc',id),deck=document.createElement('div');deck.className='facility-action-deck';
  [...body.children].forEach(el=>{if(el.matches('button.row')){if(el.dataset.hub==='closeM')el.remove();else deck.append(el)}else if(el.classList.contains('actions')){[...el.querySelectorAll('button.row')].forEach(b=>{if(b.dataset.hub!=='closeM')deck.append(b)});el.remove()}});
  body.insertAdjacentHTML('afterbegin',facilityStage(host,id,name,name==='guild'?guildSpeech(name,args):''));body.append(deck);body.classList.add('facility-stage-page');
 }else if(guildContextRoutes.has(name)){
  const host=person('npc','受付'),content=document.createElement('div');content.className='guild-service-content';
  [...body.children].forEach(el=>content.append(el));
  body.insertAdjacentHTML('afterbegin',facilityStage(host,'受付','guild',guildSpeech(name,args)));
  body.append(content);body.classList.add('guild-service-page');
 }
};
const decorate=(root,route={name:'town',args:[]})=>{
 if(!root)return;
 const title=root.querySelector('#panelTitle');if(title&&!title.dataset.visualized){
  const actorRoute=['character','charOverview','charAbility','equip','skills','mastery','charMastery','resistView','equipChoice'].includes(route.name),member=route.name==='personRecord'?person(route.args[0]==='npc'?'npc':'ally',route.args[1]):null;
  if(route.name==='memberTalk')title.textContent=hc().companion[route.args[0]]?.[1]||title.textContent;
  if(route.name==='npcTalk')title.textContent='会話';
  if(!actorRoute)title.insertAdjacentHTML('afterbegin',member?portrait(member,'header-face'):glyph(actionIcon(route.name,route.args),'title-icon'));title.dataset.visualized='true';
 }
 dialoguePage(root,route);
 decorateScene(root,route);
 root.querySelectorAll('.place').forEach(e=>{const i=e.querySelector('i');if(i)i.innerHTML=glyph(e.dataset.hub==='partyMenu'?'map':actions[e.dataset.hub]||'compass')});
 root.querySelectorAll('button[data-hub]').forEach(markRow);
 root.querySelectorAll('.region-select').forEach(e=>{const region=H.selected||dungeonId;if(!e.querySelector('.region-emblem'))e.insertAdjacentHTML('afterbegin','<span class="region-emblem" aria-hidden="true">'+glyph(regionIcon(region))+'</span>');if(regionArt[region]&&!e.querySelector('.region-preview'))e.insertAdjacentHTML('afterbegin','<img class="region-preview" src="'+regionArt[region]+'" alt="">')});
 root.querySelectorAll('.map-node').forEach(e=>{const node=H.run?.floors[H.run.floor-1]?.nodes.find(n=>n.id===readArgs(e)[0]);const i=e.querySelector('i');if(i&&node)i.innerHTML=glyph(nodeGlyph(node.type));if(node&&!e.querySelector('.node-thumb')){const theme=H.run?.themes?.[H.run.floor-1]||'',src=node.type==='merchant'?merchantImage:node.type==='forge'?facilityArt.market:(themeArt[theme]||regionArt[H.run?.dungeon]);if(src)e.insertAdjacentHTML('afterbegin','<img class="node-thumb" src="'+src+'" alt="">')}});
 root.querySelectorAll('.party-member,.deploy-member').forEach(e=>{if(e.classList.contains('deploy-member')&&!e.querySelector('img')){const b=e.querySelector('button'),i=readArgs(b)[0];b.insertAdjacentHTML('afterbegin',portrait(person('ally',i),'deploy-face'))}});
 root.querySelectorAll('.stats-grid>div').forEach((e,i)=>{const label=e.querySelector('span');if(label&&!label.querySelector('.ui-icon'))label.insertAdjacentHTML('afterbegin',glyph(['heart','bow','wand','sun'][i]))});
 root.querySelectorAll('.resource-grid>div').forEach((e,i)=>{const label=e.querySelector(':scope >span');if(label&&!label.querySelector('.ui-icon'))label.insertAdjacentHTML('afterbegin',glyph(['heart','flame','stars'][i]))});
};
const chrome=()=>{
 document.querySelectorAll('#app>nav button').forEach(e=>{const icon=e.querySelector('.ico');if(icon)icon.innerHTML=glyph(actions[e.dataset.hub]||'compass')});
 const gear=document.querySelector('.header-tools [data-hub="settings"]');if(gear)gear.innerHTML=glyph('settings');
};
window.HUB_VISUAL={version:25,glyph,decorate,chrome,person,portrait,itemIcon,masteryIcon,regionIcon,actionIcon,npcStand};
// Adapt the existing presentation layer without duplicating its navigation or game actions.
const showBase=window.show,townBase=window.town,mapBase=window.drawDungeon,closeBase=window.closeM;
window.show=html=>{showBase(html);const panel=document.getElementById('panel'),route=HUB_UI.state.route||{name:'note',args:[]};decorate(panel,route);const exit=panel.querySelector('.modal-x');if(exit){exit.setAttribute('aria-label',activeRun()?'地図へ戻る':'拠点へ戻る');exit.innerHTML=glyph(activeRun()?'map':'home')+'<span>'+(activeRun()?'地図へ':'拠点へ')+'</span>'}const back=panel.querySelector('.panel-back');if(back)back.innerHTML=glyph('back')+'<span>戻る</span>';chrome()};
window.town=(...args)=>{const value=townBase(...args);if(!activeRun())decorate(document.getElementById('screen'),{name:'town',args:[]});chrome();return value};
window.drawDungeon=(...args)=>{const value=mapBase(...args);decorate(document.querySelector('.expedition'),{name:'drawDungeon',args:[]});chrome();return value};
window.closeM=(...args)=>{const value=closeBase(...args);if(document.activeElement?.closest('#modal'))document.querySelector('#app nav button')?.focus({preventScroll:true});return value};
HUB_UI.version=25;

})();
