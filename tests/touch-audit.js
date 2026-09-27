/* Exercise common and secondary windows with real layout at each viewport. */
(async()=>{
const results=[],saved=collectSave();
const routes=['inn()','roomMenu()','conversation()','npcMenu()','memberTalk(0)','npcTalk("受付")','guild()','guildMembers()','appraiseMenu()','guildSellMenu()','guildSellMenu("materials")','guildSellMenu("tools")','guildSellMenu("weapons")','questMenu("open")','market()','toolShop()','toolQuantity("回復薬")','weaponShop()','armorShop()','craftMenu()','storageMenu()','items()','records()','settings()','partyMenu()','character(0)','equip(0)','equipChoice(0,0)','skills(4)','charAbility(4)','mastery(4)','resistView(4)','dungeon()'];
for(const route of routes){
 try{
  closeM();(0,eval)(route);
  const p=document.querySelector('#panel'),footer=p.querySelector('.panel-footer'),body=p.querySelector('.panel-body');
  const r=p.getBoundingClientRect(),f=footer.getBoundingClientRect();
  const buttons=[...footer.querySelectorAll('button')].filter(b=>!b.hidden),sizes=buttons.map(b=>b.getBoundingClientRect());
  const ok=Math.abs(r.height-innerHeight)<=1&&r.top>=-1&&r.bottom<=innerHeight+1&&f.bottom<=innerHeight+1&&f.top>=innerHeight-150&&sizes.every(x=>x.height>=44&&x.width>=44)&&!p.querySelector('.panel-head button')&&body.scrollWidth<=body.clientWidth+1;
  results.push({name:'Touch navigation '+route+' '+innerWidth+'x'+innerHeight,ok,measurements:{panel:r.height,footerTop:f.top,overflow:body.scrollWidth-body.clientWidth,buttons:sizes.map(x=>[x.width,x.height])}});
 }catch(e){results.push({name:'Touch navigation '+route,ok:false,error:String(e)})}
}
try{
 closeM();market();toolShop();const before=gold;
 confirmAction('購入の確認','テスト用。実行しません。','buyTool',['回復薬',1]);
 const cancel=document.querySelector('.panel-footer .actions [data-hub="uiBack"]');
 if(!cancel)throw Error('Confirmation cancel is not in bottom footer');
 cancel.click();
 results.push({name:'Bottom cancel restores previous screen without purchase',ok:gold===before&&document.querySelector('#modal').classList.contains('on')&&HUB_UI.state.route.name==='toolShop'});
}catch(e){results.push({name:'Bottom cancel',ok:false,error:String(e)})}
try{closeM();equipChoice(0,0,'長槍');const panel=document.querySelector('#panel'),body=panel.querySelector('.panel-body'),hero=panel.querySelector('.fitting-hero'),controls=panel.querySelector('.fitting-controls'),footer=panel.querySelector('.panel-footer');const top=hero.getBoundingClientRect().top;body.scrollTop=body.scrollHeight;const after=hero.getBoundingClientRect();results.push({name:'Pinned equipment comparison and bottom confirmation '+innerWidth,ok:after.top===top&&controls.getBoundingClientRect().bottom<=body.getBoundingClientRect().top+1&&body.clientHeight>=65&&!!footer.querySelector('[data-hub="fittingCancel"]')&&!!footer.querySelector('[data-hub="fittingApply"]')&&body.scrollWidth<=body.clientWidth+1});}catch(e){results.push({name:'Pinned fitting',ok:false,error:String(e)})}
installSave(saved);closeM();town();return results;
})();
