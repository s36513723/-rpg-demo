// Isolated QA loadouts. Never write these to a player's save.
const assert = require('node:assert/strict');
const catalog = require('../skill-catalog-315.js');
const rules = require('../rpg-rules.js');
const weaponNames = {無手:'なし',格闘:'拳甲',短剣:'短剣',剣:'王国剣',槌:'戦槌',斧:'戦斧',槍:'長槍',鞭:'鞭',鎌:'鎌',刀:'刀',弓:'長弓',銃:'銃',杖:'短杖',盾:'小盾',投擲:'投げナイフ'};
const weaponGroups = Object.keys(weaponNames);
const isWeapon = m => weaponGroups.includes(m);
const duplicateNames = catalog.rows.reduce((counts,row)=>(counts[row[1]]=(counts[row[1]]||0)+1,counts),{});
const members = ['ガルド','リゼ','エルン','セナ','ミレア','ユナ'];
function makeMember(row, index) {
  const key = duplicateNames[row[1]] > 1 ? `${row[1]}（${row[2]}）` : row[1];
  const skill = rules.meta(key);
  assert(skill, `Catalog entry missing: ${row[0]} ${key}`);
  const mastery = row[2];
  const weapon = isWeapon(mastery) ? mastery : '剣';
  const hands = weapon === '盾' ? ['王国剣', '小盾'] : weapon === '投擲' ? ['なし', 'なし'] : [weaponNames[weapon], 'なし'];
  const set = [key];
  assert(rules.fits([100,100,100,100], set), `Set Capacity: ${row[0]}`);
  return {
    name: members[index], stats: [100,100,100,100], maxSP: 100,
    masteryRanks: Object.fromEntries(Object.keys(rules.masteries).map(m => [m,10])),
    masteryOwned: {源泉:['灼陽','霊峰','海神','森羅','星辰'].includes(mastery)?[mastery]:[],術法:['信仰','呪術','魔術','符術','機巧','異能'].includes(mastery)?[mastery]:[],技能:['探索','士気'].includes(mastery)?[mastery]:[]},
    learned: set.slice(), skillSet: set,
    equipment: [`主武器：${hands[0]}`,`副手：${hands[1]}`,'予備主：なし','予備副：なし','防具一式：魔装','装飾品：なし','携行具：なし','重量：0','副手：なし',`携行具：${weapon==='投擲'?'投げナイフ':'なし'}`],
    weapon, skillId: row[0]
  };
}
function scenarios() {
  assert.equal(catalog.count,315);
  const rows = [...catalog.rows];
  // Six people per sortie; change their equipment and learned/set skills before the next sortie.
  const batches=[];
  for(let n=0;n<rows.length;n+=6) batches.push(rows.slice(n,n+6).map(makeMember));
  return batches;
}
if(require.main===module){
  const batches=scenarios(), covered=new Set(batches.flat().map(x=>x.skillId));
  const arms=new Set(batches.flat().map(x=>x.weapon));
  assert.equal(covered.size,315);
  assert.deepEqual([...arms].sort(),weaponGroups.sort());
  for(const batch of batches)for(const member of batch){
    assert.equal(member.stats.length,4);
    assert(rules.fits(member.stats,member.skillSet));
    assert(member.equipment.length===10);
    assert(member.masteryRanks[member.weapon]===10);
  }
  console.log(`${batches.length} sorties, ${covered.size} unique skills, ${arms.size} weapon categories; six prepared members per sortie`);
}
module.exports={scenarios};
