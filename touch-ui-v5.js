/* Shared touch navigation. Existing controls keep their event listeners. */
(()=>{
'use strict';
function enhanceDialogs(){
 const choice=document.getElementById('choiceSheet');
 if(choice?.dataset.mode==='skills'){
  const hint=choice.querySelector('#sheetHint'),text='技を選び、続けて光る対象をタップすると行動します。';
  if(hint&&hint.textContent!==text)hint.textContent=text;
 }

 for(const dialog of document.querySelectorAll('dialog')){
  if(dialog.dataset.touchReady)continue;
  dialog.dataset.touchReady='1';dialog.classList.add('touch-dialog');
  const body=document.createElement('div');body.className='touch-dialog-body';
  while(dialog.firstChild)body.append(dialog.firstChild);
  dialog.append(body);
 }
}
function init(){
 try{if(localStorage.getItem("rpg.command-language")===null)localStorage.setItem("rpg.command-language","ja")}catch(_){}
 enhanceDialogs();
 const help=document.createElement('dialog');help.id='touchHelp';help.setAttribute('aria-label','戦闘操作の説明');
 const modern=!!document.querySelector('#commandPanel .command-content');
 help.innerHTML='<h2>戦闘操作</h2><dl><dt>攻撃</dt><dd>装備中の武器で攻撃。SPは消費しません。</dd><dt>技・魔法</dt><dd>表示されたSPを消費します。使えない技には理由を表示します。</dd><dt>防御</dt><dd>1行動を使って受けるダメージを軽減します。</dd><dt>移動</dt><dd>仲間を選び、空いている味方カードのマスをタップすると1行動を使って移動します。</dd><dt>道具</dt><dd>回復薬などの携行品を使用します。</dd><dt>換装</dt><dd>予備武器に持ち替えます。行動は消費しません。</dd><dt>対象の選択</dt><dd>'+(modern?'技を選ぶと一覧が閉じます。続けて光る対象をタップすると行動します。対象選択をやめるときは下の「対象選択を取消」。':'行動と対象を選び、決定で予約します。全員の予約を終えてから戦闘を進めます。')+'</dd><dt>SP・射程・範囲</dt><dd>SPは技と魔法で共通の気力。近・中・遠は届く距離、単体・列・全体は巻き込む範囲です。</dd><dt>AUTO</dt><dd>このラウンドの未入力の仲間を自動操作します。</dd></dl>';
 document.body.append(help);enhanceDialogs();
 const openHelp=()=>help.showModal();
 window.RPGOpenBattleHelp=openHelp;
 const sheet=document.getElementById('choiceSheet');
 if(sheet)sheet.addEventListener('click',e=>{const button=e.target.closest('.skill-choice');if(sheet.dataset.mode==='skills'&&button&&button.getAttribute('aria-disabled')!=='true'&&sheet.open)sheet.close()});
 const command=document.getElementById('commandPanel');
 if(command&&modern){for(const [id,label] of Object.entries({attack:'攻撃',skills:'技・魔法',defend:'防御',swap:'道具',switch:'換装'})){const x=document.querySelector('#'+id+' b');if(x)x.textContent=label}}
 const history=document.getElementById('history'),closeHistory=document.getElementById('closeHistory');
 if(history&&closeHistory){closeHistory.textContent='履歴を閉じる';history.append(closeHistory)}
 new MutationObserver(enhanceDialogs).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
