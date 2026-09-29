const assert=require('node:assert/strict');
const catalog=require('../skill-catalog-315.js');
const audit=require('../battle-audit-results.json').catalog.activeWithoutEffectData;
const {count,effects}=require('../skill-effect-design-84.js');
const expected=new Set(audit.map(x=>x.id));
assert.equal(count,84);
assert.equal(expected.size,84);
assert.deepEqual(new Set(Object.keys(effects)),expected);
const ids=new Map(Object.values(catalog.skills).map(skill=>[skill.id,skill]));
for(const [id,design] of Object.entries(effects)){
  const original=ids.get(id);
  assert.equal(original?.mode,'Active',id);
  assert.equal(design.status,'初期実装値',id);
  assert.equal(design.runtime,'design_only',id);
  assert.ok(design.target&&design.condition&&design.operations.length,id);
  assert.ok(design.operations.every(o=>o.kind&&Number.isFinite(o.value)&&o.value>0&&Number.isInteger(o.duration)&&o.duration>=0&&o.duration<=3),id);
  // Several conditional attacks deliberately replace catalog mult=0.
}
console.log(`84/84 effect proposals mapped to Active IDs; all operations typed and nonempty`);
