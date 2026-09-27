/* Presentation only. The battle engine and its timing/targeting rules remain unchanged. */
(()=>{
 'use strict';
 const game=document.getElementById('game'),stage=document.getElementById('enemyStage');
 const labels={attack:['ATTACK','攻撃'],skills:['SKILL','技'],defend:['GUARD','防御'],swap:['SHIFT','交代'],switch:['EQUIP','換装'],resolve:['EXECUTE','ラウンド開始']};
 let language='en';try{language=localStorage.getItem('rpg.command-language')==='ja'?'ja':'en'}catch(_){}
 function localize(){for(const[id,pair]of Object.entries(labels)){const b=document.getElementById(id)?.querySelector('b');if(b)b.textContent=pair[language==='en'?0:1]}}
 function geometry(){
  if(!stage)return;
  // Both ranks have exactly the same scale. The apparent depth is produced by
  // diagonal foot positions, occlusion, contact shadows and the ground plane.
  const h=Math.max(62,Math.min(170,stage.clientWidth*.342,stage.clientHeight*.35));
  const px=h.toFixed(2)+'px';if(stage.style.getPropertyValue('--figure-size')!==px)stage.style.setProperty('--figure-size',px);
 }
 localize();geometry();
 if(typeof ResizeObserver==='function')new ResizeObserver(geometry).observe(stage);
 window.addEventListener('resize',geometry);
 window.visualViewport?.addEventListener('resize',geometry);
 document.getElementById('more').addEventListener('click',()=>{
  const list=document.getElementById('sheetList');
  const b=document.createElement('button');b.type='button';b.className='menu-action';b.textContent='コマンド表記：'+(language==='en'?'English':'日本語');
  b.addEventListener('click',()=>{language=language==='en'?'ja':'en';try{localStorage.setItem('rpg.command-language',language)}catch(_){}localize();b.textContent='コマンド表記：'+(language==='en'?'English':'日本語')});list.append(b);
 });
 // v43 moved EXECUTE to the header; an empty "ready-only" dock is unnecessary.
 // CSS hides that dock without moving the stage or the lower formation.
 if(window.RPGDemo)window.RPGDemo.version='44';
 document.documentElement.dataset.presentation='44';
})();
