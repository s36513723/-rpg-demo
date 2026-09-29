/* Exercise common and secondary windows with real layout at each viewport. */
(async()=>{
const results=[],saved=collectSave();
const routes=['inn()','roomMenu()','conversation()','npcMenu()','memberTalk(0)','npcTalk("受付")','guild()','guildMembers()','appraiseMenu()','guildSellMenu()','guildSellMenu("materials")','guildSellMenu("tools")','guildSellMenu("weapons")','questMenu("open")','market()','toolShop()','toolQuantity("回復薬")','weaponShop()','armorShop()','craftMenu()','storageMenu()','items()','records()','settings()','partyMenu()','character(0)','equip(0)','equipChoice(0,0)','skills(4)','charAbility(4)','mastery(4)','resistView(4)','dungeon()'];
for(const route of routes){
 try{
  closeM();(0,eval)(route);
  const app=document.querySelector('#app');
  if(app.classList.contains('facility-world')){
   const screen=document.querySelector('#screen'),overlay=screen.querySelector('.facility-world-overlay'),nav=document.querySelector('.hub-global-nav');
   const sr=screen.getBoundingClientRect(),or=overlay?.getBoundingClientRect(),nr=nav?.getBoundingClientRect();
   const navButtons=[...nav.querySelectorAll('button')].filter(b=>!b.hidden&&b.getClientRects().length),sizes=navButtons.map(b=>b.getBoundingClientRect());
   const ok=!!overlay&&!!nav&&sr.left>=0&&sr.right<=innerWidth+1&&sr.top>=0&&sr.bottom<=innerHeight+1&&screen.scrollWidth<=screen.clientWidth+1&&overlay.scrollWidth<=overlay.clientWidth+1&&or.bottom<=sr.bottom+1&&nr.bottom<=innerHeight+1&&sizes.every(x=>x.height>=40&&x.width>=30);
   results.push({name:'Touch navigation '+route+' '+innerWidth+'x'+innerHeight,ok,measurements:{screen:sr.height,overlay:or?.height,overflow:screen.scrollWidth-screen.clientWidth,buttons:sizes.map(x=>[x.width,x.height])}});
   continue;
  }
  const p=document.querySelector('#panel'),footer=p.querySelector('.panel-footer'),body=p.querySelector('.panel-body'),modal=document.querySelector('#modal'),nav=document.querySelector('.hub-global-nav');
  const r=p.getBoundingClientRect(),f=footer.getBoundingClientRect(),mr=modal.getBoundingClientRect(),hub=modal.classList.contains('hub-overlay-modal'),limit=hub?mr.bottom:innerHeight;
  const buttons=[...footer.querySelectorAll('button')].filter(b=>!b.hidden&&b.getClientRects().length),sizes=buttons.map(b=>b.getBoundingClientRect());
  const navOk=!hub||(!nav.inert&&[...nav.querySelectorAll('button')].filter(b=>!b.disabled).every(b=>b.getBoundingClientRect().height>=40));
  const ok=Math.abs(r.height-(hub?mr.height:innerHeight))<=1&&r.top>=-1&&r.bottom<=limit+1&&f.bottom<=limit+1&&f.top>=limit-(p.querySelector('.fitting-controls')?240:190)&&sizes.every((x,i)=>x.height>=(buttons[i].closest('.fitting-filters,.equipment-bottom-slots')?32:44)&&x.width>=30)&&!p.querySelector('.panel-head button:not(.icon-button)')&&body.scrollWidth<=body.clientWidth+1&&[...footer.querySelectorAll('.bottom-tabs,.fitting-filters,.equipment-bottom-slots')].every(e=>e.scrollWidth<=e.clientWidth+1)&&navOk;
  results.push({name:'Touch navigation '+route+' '+innerWidth+'x'+innerHeight,ok,measurements:{panel:r.height,modal:mr.height,footerTop:f.top,overflow:body.scrollWidth-body.clientWidth,nav:navOk,buttons:sizes.map(x=>[x.width,x.height])}});
 }catch(e){results.push({name:'Touch navigation '+route,ok:false,error:String(e)})}
}
try{
 closeM();market();toolShop();const before=gold;
 confirmAction('購入の確認','テスト用。実行しません。','buyTool',['回復薬',1]);
 const cancel=document.querySelector('.hub-global-nav [data-nav="back"]');
 if(!cancel||cancel.disabled)throw Error('Back navigation is missing');
 cancel.click();
 results.push({name:'Bottom cancel restores previous screen without purchase',ok:gold===before&&!document.querySelector('#modal').classList.contains('on')&&document.querySelector('#app').classList.contains('market-world')&&HUB_UI.state.route.name==='toolShop'});
}catch(e){results.push({name:'Bottom cancel',ok:false,error:String(e)})}
try{skills(0,'Active');const p=document.querySelector('#panel'),w=p.querySelector('.skills-workspace'),l=p.querySelector('.skill-masteries'),r=p.querySelector('.skill-selection'),f=p.querySelector('.panel-footer');results.push({name:'Skill mastery split fits '+innerWidth,ok:l.getBoundingClientRect().right<=r.getBoundingClientRect().left&&w.getBoundingClientRect().bottom<=f.getBoundingClientRect().top+1&&r.clientWidth>=180&&p.scrollWidth<=p.clientWidth+1&&r.querySelector('.skill-candidates').clientHeight>=65});}catch(e){results.push({name:'Skill mastery layout',ok:false,error:String(e)})}
try{
 closeM();equipChoice(0,0,'戦槌');
 const p=document.querySelector('#panel'),body=p.querySelector('.panel-body'),picker=p.querySelector('.character-equipment-picker'),summary=p.querySelector('.character-equipment-summary');
 const slots=[...p.querySelectorAll('.character-equip-slot')],left=p.querySelector('.character-equipment-side.left')?.getBoundingClientRect(),right=p.querySelector('.character-equipment-side.right')?.getBoundingClientRect(),pr=p.getBoundingClientRect();
 results.push({name:'Centered equipment picker '+innerWidth,ok:!!body&&!!picker&&!!summary&&slots.length===7&&left.right<pr.left+pr.width*.5&&right.left>pr.left+pr.width*.5&&body.scrollWidth<=body.clientWidth+1});
}catch(e){results.push({name:'Centered equipment picker',ok:false,error:String(e)})}
try{
 const rows=[...document.querySelectorAll('#panel .character-equipment-summary .equip-compare-grid>span')].map(e=>e.getBoundingClientRect());
 results.push({name:'Equipment preview keeps twelve compact metrics '+innerWidth,ok:rows.length===12&&rows.every(r=>r.width>20&&r.height>=8)});
}catch(e){results.push({name:'Equipment metrics',ok:false,error:String(e)})}
try{
 equip(0);
 const p=document.querySelector('#panel'),body=p.querySelector('.panel-body'),shell=p.querySelector('.character-equipment-shell'),slots=[...p.querySelectorAll('.character-equip-slot')],swap=p.querySelector('[data-hub="fittingSwap"]'),commands=[...p.querySelectorAll('.character-action-deck button')],members=[...document.querySelectorAll('#party .m')];
 results.push({name:'Equipment home surrounds character and keeps bottom controls '+innerWidth,ok:!!shell&&slots.length===7&&!!swap&&swap.getBoundingClientRect().height>=20&&commands.length===4&&members.length===6&&!p.querySelector('.actor-tabs')&&!p.querySelector('.character-equipment-picker')&&body.scrollHeight<=body.clientHeight+1&&body.scrollWidth<=body.clientWidth+1});
}catch(e){results.push({name:'Equipment home layout',ok:false,error:String(e)})}
for(let i=0;i<6;i++){
 try{
  closeM();character(i);
  const p=document.querySelector('#panel'),body=p.querySelector('.panel-body'),shell=p.querySelector('.character-equipment-shell'),art=p.querySelector('.actor-backdrop img'),commands=p.querySelectorAll('.character-action-deck button'),members=document.querySelectorAll('#party .m');
  results.push({name:'Character-centered home '+i+' '+innerWidth,ok:!!shell&&!!art&&art.complete&&commands.length===4&&members.length===6&&!p.querySelector('.actor-tabs')&&body.scrollHeight<=body.clientHeight+1&&body.scrollWidth<=body.clientWidth+1});
  charAbility(i);const b=p.querySelector('.panel-body');results.push({name:'Growth keeps only Mastery guidance fixed '+i+' '+innerWidth,ok:!p.querySelector('.stats-grid')&&!!p.querySelector('.actor-fixed')&&document.querySelectorAll('#party .m').length===6&&!!p.querySelector('.actor-backdrop img')});
 }catch(e){results.push({name:'Character-centered layout '+i,ok:false,error:String(e)})}
}
for(const action of [()=>skills(0),()=>masteryType(0,'武器'),()=>growMastery(0,'剣')]){try{action();const p=document.querySelector('#panel'),f=p.querySelector('.actor-fixed'),b=p.querySelector('.panel-body'),before=f.getBoundingClientRect().top;b.scrollTop=200;results.push({name:'Character explanation stays fixed '+HUB_UI.state.route.name+' '+innerWidth,ok:f.getBoundingClientRect().top===before&&f.getBoundingClientRect().bottom<=b.getBoundingClientRect().top+1&&b.clientHeight>=65&&p.scrollHeight<=p.clientHeight+1});}catch(e){results.push({name:'Character fixed explanation',ok:false,error:String(e)})}}
try{masteryType(0,'武器');growMastery(0,'剣');const p=document.querySelector('#panel'),left=p.querySelector('.mastery-left').getBoundingClientRect(),right=p.querySelector('.mastery-right').getBoundingClientRect(),branches=p.querySelector('.mastery-training').getBoundingClientRect(),footer=p.querySelector('.panel-footer').getBoundingClientRect();results.push({name:'Mastery split layout '+innerWidth,ok:left.right<=right.left&&branches.bottom<=footer.top+1&&p.querySelectorAll('.mastery-right .branch-toggle').length===4&&[...p.querySelectorAll('.mastery-right .branch-toggle,.mastery-training button')].every(b=>b.getBoundingClientRect().height>=44)&&p.scrollHeight<=p.clientHeight+1});}catch(e){results.push({name:'Mastery split layout',ok:false,error:String(e)})}
for(let i=0;i<6;i++)for(const tab of ['basic','resist']){try{actorAttributes(i,tab);if(tab==='basic')attributeAdjust(i,0,1);const p=document.querySelector('#panel'),b=p.querySelector('.panel-body');results.push({name:'All attributes fit '+i+' '+tab+' '+innerWidth,error:JSON.stringify({body:[b.clientWidth,b.scrollWidth,b.clientHeight,b.scrollHeight],panel:[p.clientHeight,p.scrollHeight],fixed:p.querySelector('.actor-fixed').getBoundingClientRect().height,buttons:[...p.querySelectorAll('.allocation-stat button,.allocation-bar button')].map(x=>x.getBoundingClientRect().height)}),ok:p.querySelectorAll('.attribute-cell').length>0&&[...p.querySelectorAll('.allocation-stat button,.allocation-bar button')].every(x=>x.getBoundingClientRect().height>=44)&&b.scrollHeight<=b.clientHeight+1&&p.scrollHeight<=p.clientHeight+1&&b.scrollWidth<=b.clientWidth+1});}catch(e){results.push({name:'Attributes layout',ok:false,error:String(e)})}}

installSave(saved);closeM();town();
return results;
})();
