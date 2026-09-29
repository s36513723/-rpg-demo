const assert=require('node:assert/strict');
const catalog=require('../skill-catalog-315.js');
const audit=require('../battle-audit-results.json').catalog.activeWithoutEffectData;
const {count,effects}=require('../skill-effect-design-84.js');
const expected=new Set(audit.map(x=>x.id));
const targets=new Set('ally_single ally_row ally_adjacent ally_all enemy_front enemy_back enemy_row enemy_vertical enemy_free enemy_side self'.split(' '));
const conditions=new Set('always throwable_available empty_adjacent_cell free_destination_cell free_front_cell free_back_cell both_hands_empty valid_swap_cell ally_not_self free_side_cell free_adjacent_cell target_in_adjacent_column did_not_move_this_round self_hp_below_half wearing_armor'.split(' '));
const triggers=new Set('physical_targeted melee_targeted targeted_by_displacement targeted_by_attack'.split(' '));
const chance=new Set('cover taunt move_lock leg_bind'.split(' '));
const percent=new Set('magic_guard status_resist damage_guard evasion physical_guard hp_drain speed attack mental_resist self_defense_down next_spell_power magic_barrier next_melee_followup defense_down pierce_attack second_hit barrier_hp accuracy_down support_power unarmed_attack speed_down accuracy spell_power on_kill_followup ambush_resist bonus_if_target_unacted bonus_if_actor_before_target bonus_if_first_action bonus_if_target_low_hp'.split(' '));
const discrete=new Set('priority mental_cleanse formation_move action_priority ignore_front retreat consume_throwable cast_time_down multi_hit environment_attribute push_or_pull advance reveal_next_action swap_position displacement_resist side_step push weapon_magic_attribute'.split(' '));
const damage=new Set(['damage','total_damage']);
const reactionIds=new Set(['SK0013','SK0022','SK0183','SK0205','SK0232','SK0240']);
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
  assert.ok(targets.has(design.target),id+' target');
  assert.ok(conditions.has(design.condition),id+' condition');
  assert.ok(design.trigger===null||triggers.has(design.trigger),id+' trigger');
  assert.equal(Boolean(design.trigger),reactionIds.has(id),id+' reaction trigger');
  if(design.trigger){assert.equal(design.target,'self',id);assert.equal(design.condition,'always',id)}
  assert.ok(design.operations.every(o=>o.kind&&Number.isFinite(o.value)&&o.value>0&&Number.isInteger(o.duration)&&o.duration>=0&&o.duration<=3),id);
  for(const o of design.operations){
    assert.ok(chance.has(o.kind)||percent.has(o.kind)||discrete.has(o.kind)||damage.has(o.kind)||o.kind==='sp_restore'||o.kind==='sp_regen',id+' unknown operation '+o.kind);
    if(chance.has(o.kind)||percent.has(o.kind))assert.ok(o.value<=1,id+' percent/chance');
    if(discrete.has(o.kind))assert.ok(Number.isInteger(o.value),id+' count/flag');
    if(damage.has(o.kind))assert.ok(o.value<=3,id+' damage multiplier');
  }
  const kinds=new Set(design.operations.map(o=>o.kind));
  if(kinds.has('hp_drain'))assert.ok(kinds.has('damage'),id);
  if(kinds.has('multi_hit'))assert.ok(kinds.has('total_damage')&&!kinds.has('damage'),id);
  if(kinds.has('consume_throwable'))assert.equal(design.condition,'throwable_available',id);
}
console.log(`84/84 effect proposals: IDs, targets, conditions, triggers, operation bounds and dependencies valid`);
