/* Initial effect proposals for 84 Active skills. Data only: the battle engine does not
 * consume this table yet. Values are 初期実装値, pending playtest and migration review.
 * Each record: target | activation condition | effect operations (semicolon separated).
 * Operation syntax: kind:value:duration; damage uses the existing catalog multiplier.
 */
(function(root){'use strict';
const lines=`
SK0003|ally_single|always|magic_guard:0.20:3;status_resist:0.20:3
SK0007|ally_row|always|damage_guard:0.22:2
SK0012|enemy_front|target_unacted|damage:1.35:0
SK0013|self|physical_targeted|evasion:0.35:1
SK0015|enemy_front|actor_before_target|damage:1.65:0
SK0019|enemy_front|first_action_in_round|damage:2.20:0;priority:1:0
SK0022|self|physical_targeted|physical_guard:0.35:1
SK0026|ally_adjacent|always|cover:0.40:2
SK0027|enemy_front|always|damage:1.45:0;weapon_magic_attribute:1:0
SK0029|enemy_front|actor_before_target|damage:2.10:0
SK0035|enemy_front|always|damage:1.15:0;move_lock:0.60:2
SK0036|enemy_front|always|damage:1.45:0;hp_drain:0.30:0
SK0042|ally_row|always|speed:0.15:3;evasion:0.12:3
SK0043|ally_row|always|attack:0.12:3;damage_guard:0.12:3
SK0045|ally_row|always|mental_cleanse:1:0;mental_resist:0.25:3
SK0046|ally_row|empty_adjacent_cell|formation_move:1:0
SK0047|ally_row|always|sp_restore:8:0
SK0048|ally_row|always|action_priority:1:1
SK0049|ally_all|always|attack:0.15:3;damage_guard:0.15:3;sp_regen:3:3
SK0059|enemy_back|always|damage:2.15:0;ignore_front:1:0
SK0066|self|always|evasion:0.25:2;retreat:1:0
SK0069|enemy_row|throwable_available|damage:2.00:0;consume_throwable:1:0
SK0085|enemy_front|always|damage:1.65:0;self_defense_down:0.20:1
SK0087|enemy_front|target_hp_below_half|damage:1.95:0
SK0103|self|always|next_spell_power:0.30:2
SK0104|ally_single|always|cast_time_down:1:2
SK0106|ally_single|always|magic_barrier:0.25:3
SK0115|self|always|next_melee_followup:0.50:2
SK0119|enemy_front|always|multi_hit:3:0;total_damage:1.90:0
SK0121|ally_single|always|speed:0.20:3
SK0125|enemy_front|always|damage:1.25:0;leg_bind:0.55:2
SK0128|ally_single|always|damage_guard:0.25:3
SK0129|enemy_front|always|damage:1.90:0;environment_attribute:1:0
SK0139|enemy_front|always|damage:1.90:0;defense_down:0.20:2
SK0146|ally_row|always|pierce_attack:0.15:2
SK0148|enemy_vertical|always|damage:1.45:0;second_hit:0.40:0
SK0149|enemy_front|actor_before_target|damage:2.10:0
SK0151|ally_single|always|barrier_hp:0.25:3
SK0154|enemy_front|always|damage:1.15:0;move_lock:0.65:2
SK0161|enemy_front|free_destination_cell|damage:1.00:0;push_or_pull:1:0
SK0162|ally_single|always|damage_guard:0.12:3;status_resist:0.12:3
SK0173|enemy_front|always|damage:1.25:0;accuracy_down:0.20:2
SK0177|ally_single|always|support_power:0.20:3
SK0178|enemy_row|always|damage:1.45:0;accuracy_down:0.15:2;move_lock:0.45:2
SK0183|self|melee_targeted|evasion:0.35:1
SK0185|enemy_front|free_front_cell|advance:1:0;damage:1.25:0
SK0186|self|free_back_cell|retreat:1:0;evasion:0.15:1
SK0188|self|both_hands_empty|unarmed_attack:0.20:3
SK0192|ally_single|always|evasion:0.12:3;ambush_resist:1:3
SK0196|ally_single|always|reveal_next_action:1:1
SK0197|enemy_front|valid_swap_cell|damage:1.35:0;swap_position:1:0
SK0198|enemy_front|always|damage:1.45:0;speed_down:0.20:2;move_lock:0.45:2
SK0201|self|always|damage_guard:0.35:1
SK0203|ally_single|ally_not_self|cover:0.70:1
SK0204|self|always|taunt:0.70:2
SK0205|self|targeted_by_displacement|displacement_resist:1:1;physical_guard:0.15:1
SK0206|ally_row|always|damage_guard:0.30:2;cover:0.30:2
SK0209|ally_all|always|damage_guard:0.40:1;cover:0.40:1
SK0217|enemy_free|free_side_cell|side_step:1:0;damage:1.35:0
SK0222|ally_single|always|damage_guard:0.25:2
SK0229|enemy_row|free_destination_cell|damage:1.90:0;push:1:0
SK0230|ally_row|always|magic_barrier:0.30:3
SK0232|self|physical_targeted|physical_guard:0.35:1
SK0233|self|free_adjacent_cell|formation_move:1:0;evasion:0.10:1
SK0237|self|free_back_cell|retreat:1:0;evasion:0.15:1
SK0238|enemy_side|target_in_adjacent_column|damage:1.65:0
SK0240|self|targeted_by_attack|evasion:0.60:1
SK0244|ally_single|always|physical_guard:0.30:3
SK0248|ally_adjacent|always|cover:0.45:2;damage_guard:0.15:2
SK0251|ally_row|always|damage_guard:0.38:2;cover:0.30:2
SK0258|self|did_not_move_this_round|accuracy:0.20:2
SK0268|self|self_hp_below_half|attack:0.25:2
SK0270|enemy_front|target_hp_below_half|damage:1.85:0;on_kill_followup:0.50:0
SK0273|ally_single|always|physical_guard:0.15:3
SK0276|ally_single|wearing_armor|physical_guard:0.18:3
SK0277|ally_single|always|displacement_resist:1:2;damage_guard:0.15:2
SK0278|enemy_row|always|damage:1.45:0;speed_down:0.20:2
SK0279|ally_row|always|sp_regen:4:3;spell_power:0.12:3
SK0280|ally_single|always|status_resist:0.25:3;magic_guard:0.12:3
SK0286|enemy_front|always|damage:1.15:0;move_lock:0.60:2
SK0295|ally_single|always|magic_guard:0.30:2
SK0298|enemy_front|valid_swap_cell|damage:1.35:0;swap_position:1:0
SK0306|ally_single|always|magic_guard:0.25:3
SK0312|ally_adjacent|always|magic_guard:0.22:3
`;
const effects=Object.fromEntries(lines.trim().split('\n').map(line=>{const [id,target,condition,body]=line.split('|');return [id,{target,condition,operations:body.split(';').map(s=>{const [kind,value,duration]=s.split(':');return {kind,value:Number(value),duration:Number(duration)}}),status:'初期実装値',runtime:'design_only'}]}));
const api={version:1,count:Object.keys(effects).length,effects};
if(typeof module!=='undefined')module.exports=api;root.RPG_SKILL_EFFECT_DESIGN_84=api;
})(typeof globalThis!=='undefined'?globalThis:this);
