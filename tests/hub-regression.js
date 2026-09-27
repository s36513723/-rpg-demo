(async()=>{
 const results=[],R=RPG_RULES,assert=(x,m='assertion failed')=>{if(!x)throw Error(m)},equal=(a,b)=>assert(JSON.stringify(a)===JSON.stringify(b),JSON.stringify(a)+' != '+JSON.stringify(b));
 const initial=JSON.stringify(JSON.parse(localStorage.getItem('rpg.exploration.save1')));
 async function reset(){localStorage.setItem('rpg.exploration.save1',initial);loadGame();town()}
 async function test(name,fn){await reset();try{await fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.stack})}}
 await test('hub has 6 characters and correct formulas',()=>{equal(names.length,6);equal(vitals.map(x=>x.sp),[53,68,42,74,20,40]);equal(vitals.map(x=>x.mp),[0,0,40,0,105,80])});
 await test('all 31 Masteries registered',()=>equal(Object.keys(R.masteries).length,31));
 await test('Mastery training costs 1 point for +5',()=>{const r=ranksFor(0).槌,p=mp[0];trainMastery(0,'槌');equal(ranksFor(0).槌,r+5);equal(mp[0],p-1)});
 await test('Mastery rank cap50',()=>{ranksFor(0).槌=50;const p=mp[0];trainMastery(0,'槌');equal(ranksFor(0).槌,50);equal(mp[0],p)});
 await test('insufficient training points cannot go negative',()=>{mp[0]=0;const r=ranksFor(0).槌;trainMastery(0,'槌');equal(ranksFor(0).槌,r);equal(mp[0],0)});
 await test('source maximum1 enforced',()=>{masteryOwned[0].源泉=['灼陽'];mp[0]=10;trainMastery(0,'海神');equal(masteryOwned[0].源泉,['灼陽']);equal(mp[0],10)});
 await test('arts maximum2 enforced',()=>{masteryOwned[0].術法=['魔術','符術'];mp[0]=10;trainMastery(0,'呪術');equal(masteryOwned[0].術法,['魔術','符術']);equal(mp[0],10)});
 await test('learning checks both rank and stat',()=>{const n='鎧砕き';assert(!learned[0].includes(n));ranksFor(0).槌=5;mp[0]=10;learnSkill(0,'槌','戦槌',n);assert(!learned[0].includes(n));ranksFor(0).槌=50;stats[0][0]=10;learnSkill(0,'槌','戦槌',n);assert(!learned[0].includes(n));stats[0][0]=55;learnSkill(0,'槌','戦槌',n);assert(learned[0].includes(n));equal(mp[0],9)});
 await test('learning is not automatic equipping',()=>{mp[0]=10;ranksFor(0).槌=50;learnSkill(0,'槌','戦槌','鎧砕き');assert(!skillSet[0].includes('鎧砕き'))});
 await test('learning duplicate does not spend points',()=>{const p=mp[0];learnSkill(0,'槌','戦槌','破砕撃');equal(mp[0],p)});
 await test('passive and active share Cost budget',()=>{equal(R.capacity(stats[0],[]),20);assert(R.setCost(['庇護','破砕撃'])===7);equal(R.capacity([50,50,50,50],[]),30)});
 await test('removing capacity cannot leave an overbudget set',()=>{const candidates=Object.keys(R.skills).filter(n=>R.skills[n].setCost===4);const set=['容量拡張','軽身',...candidates.slice(0,5)];learned[0]=['通常攻撃','防御',...set];skillSet[0]=set.slice();assert(R.fits(stats[0],set));assert(!R.fits(stats[0],set.slice(1)));toggleLearnedSkill(0,'容量拡張');assert(skillSet[0].includes('容量拡張'))});
 await test('unselected exploration skill does not work',()=>{learned[0].push('敵察知');assert(!hasSkill('敵察知'));skillSet[0].push('敵察知');assert(hasSkill('敵察知'))});
 await test('Mastery rank persists through reload',()=>{ranksFor(0).槌=40;saveGame();window.masteryRanks=[];loadGame();equal(ranksFor(0).槌,40)});
 await test('legacy learned skills survive schema migration',()=>{const d=JSON.parse(initial);delete d.masteryRanks;delete d.progressionVersion;d.learned[0].push('断頭斧');d.learnedTree[0].push('断頭斧');localStorage.setItem('rpg.exploration.save1',JSON.stringify(d));loadGame();assert(learned[0].includes('断頭斧'));assert(window.legacySkills[0].includes('断頭斧'))});
 await test('empty selected set not replaced on current save reload',()=>{skillSet[4]=[];saveGame();loadGame();equal(skillSet[4],[])});
 await test('rare gear definitions persist',()=>{WM['テスト短剣']=['斬','近',2,'SKL',20];inventory.weapons.push('テスト短剣');saveGame();delete WM['テスト短剣'];loadGame();equal(WM['テスト短剣'][2],2)});
 await test('main/offhand sets swap together',()=>{eq[0][0]='主武器：戦槌';eq[0][1]='副手：小盾';eq[0][2]='予備主：長弓';eq[0][3]='予備副：なし';swapMain(0);assert(eq[0][0].endsWith('長弓'));assert(eq[0][1].endsWith('なし'));assert(eq[0][3].endsWith('小盾'))});
 await test('camp does not revive; recovers35/35/25 and cures statuses',()=>{campUsed=false;vitals[0].hp=0;vitals[0].sp=0;vitals[0].mp=0;vitals[4].hp=1;vitals[4].sp=0;vitals[4].mp=0;vitals[4].status={poison:3};campHeal();assert(vitals[0].hp===0);equal(vitals[4].hp,36);equal(vitals[4].sp,7);equal(vitals[4].mp,27);equal(vitals[4].status,{});const v=JSON.stringify(vitals);campHeal();equal(JSON.stringify(vitals),v)});
 await test('antidote works in exploration without a round ticking',()=>{vitals[0].status={poison:3};inventory.tools.解毒薬=2;useTool('解毒薬',0);equal(vitals[0].status.poison,0);equal(inventory.tools.解毒薬,1)});
 await test('full-health item use does not consume',()=>{inventory.tools.回復薬=2;fullRestSilent();useTool('回復薬',0);equal(inventory.tools.回復薬,2)});
 await test('derived resource growth is reflected on stat spend',()=>{const hp=vitals[0].hp;statPt[0]=1;addStat(0,0);equal(vitals[0].hp,hp+3);equal(statPt[0],0)});
 await test('merchant purchases work without free-variable onclick',()=>{gold=1000;const b=loot.結晶;merchantBuy('魔力結晶',500);equal(gold,500);equal(loot.結晶,b+1)});
 await test('menus and generated onclick handlers all parse',()=>{for(const fn of [()=>partyMenu(),()=>squadMenu(),()=>market(),()=>toolShop(),()=>merchantNode(),()=>mastery(0),()=>masteryType(0,'武器'),()=>growMastery(0,'槌'),()=>masterySkills(0,'槌','戦槌'),()=>skills(0),()=>equip(0),()=>equipChoice(0,9),()=>camp(),()=>enemyBook(),()=>items()]){fn();for(const el of document.querySelectorAll('[onclick]'))new Function(el.getAttribute('onclick'))}});
 window.__regression=results;return results;
})()
