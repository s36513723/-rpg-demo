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
 '守護の重鎧':{family:'重装',data:[10,'防御両立',30,16],text:'魔法にも備えた重装。高い総重量に見合う肉体が必要。'},
 '星紋の旅装':{family:'魔装',data:[4,'術と物防の均衡',14,19],text:'星紋を織り込んだ旅装。物理と魔法の両方に備える。'},
 '風渡りの革衣':{family:'軽装',data:[2,'軽快・魔防',9,18],text:'軽さと術への備えを両立した革衣。'},
 '城衛の鎧':{family:'重装',data:[7,'堅牢・魔防',27,13],text:'城衛が使う鎧。重装としては重量を抑え、魔法にも備える。'}
};
for(const [n,d]of Object.entries(ARMOR_VARIANTS)){ARM[n]=d.data;ARMOR_HELP[n]=d.text}
function armorFamily(n){return ARMOR_VARIANTS[n]?.family||n}
function initializeArmorVariety(previousSave){
 // Restore the nine variants granted by older builds even if v63 briefly
 // removed an unequipped one. The three new variants remain shop stock.
 if(previousSave?.hub?.flags?.['armor-variety-46']&&!H.flags['armor-continuity-64']){
  inventory.armor=[...new Set([...inventory.armor,...Object.keys(ARMOR_VARIANTS).slice(0,9)])];
 }
 H.flags['armor-variety-46']=true;
 H.flags['armor-shop-63']=true;
 H.flags['armor-continuity-64']=true;
}
