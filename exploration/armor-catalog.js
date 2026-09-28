/* Armor families remain compatible with mastery and battle rules. */
const ARMOR_VARIANTS={
 '旅のローブ':{family:'魔装',data:[1,'軽量・魔防',4,14],text:'軽さを優先した魔装。防御は控えめで、重量に余裕を作れる。'},
 '術師の法衣':{family:'魔装',data:[2,'魔防重視',5,24],text:'魔法防御に特化した魔装。物理攻撃への備えは薄い。'},
 '護符織の霊衣':{family:'魔装',data:[3,'防御両立',11,22],text:'織り込んだ護符で守る魔装。法衣より重いが物理防御も補う。'},
 '革鎧':{family:'軽装',data:[2,'軽量・機動',11,7],text:'動きやすい軽装。低重量で速度・回避の重量ペナルティを避けやすい。'},
 '狩人の外套':{family:'軽装',data:[3,'魔防寄り',12,16],text:'魔法防御を補う軽装。標準軽装より物理防御は低い。'},
 '鎖帷子':{family:'軽装',data:[4,'物防寄り',21,9],text:'細かい鎖で斬撃を受ける軽装。物理防御を高めるぶん重い。'},
 '鉄鎧':{family:'重装',data:[6,'重量抑制',23,6],text:'標準重装より軽い前衛用防具。防御と重量の扱いやすさを両立する。'},
 '鋼の板金鎧':{family:'重装',data:[9,'物防特化',34,7],text:'物理防御に特化した重装。魔法と重量超過には注意が必要。'},
 '守護の重鎧':{family:'重装',data:[10,'防御両立',30,16],text:'魔法にも備えた重装。高い総重量に見合う肉体が必要。'}
};
for(const [n,d]of Object.entries(ARMOR_VARIANTS)){ARM[n]=d.data;ARMOR_HELP[n]=d.text}
function armorFamily(n){return ARMOR_VARIANTS[n]?.family||n}
function initializeArmorVariety(){
 if(!H.flags['armor-variety-46'])H.flags['armor-variety-46']=true;
 // Earlier builds handed out every variant. Keep anything currently equipped;
 // the remaining variants become purchasable when upgrading an older save.
 if(!H.flags['armor-shop-63']){
  const equipped=new Set(eq.flatMap(a=>a.slice(4,8).map(x=>x.split('：')[1])));
  inventory.armor=inventory.armor.filter(n=>!Object.hasOwn(ARMOR_VARIANTS,n)||equipped.has(n));
  H.flags['armor-shop-63']=true;
 }
}
