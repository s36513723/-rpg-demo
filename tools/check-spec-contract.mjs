import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("spec/spec-manifest.json", "utf8"));
const spec = fs.readFileSync("spec/CURRENT_SPEC.md", "utf8");
const contract = fs.readFileSync("AGENTS.md", "utf8");
const status = JSON.parse(fs.readFileSync("spec/spec-status.json", "utf8"));
const balance = JSON.parse(fs.readFileSync("spec/balance-review.json", "utf8"));
const skillTarget = JSON.parse(fs.readFileSync("spec/skill-catalog-target.json", "utf8"));
const skillMigration = JSON.parse(fs.readFileSync("spec/skill-migration-296-to-315.json", "utf8"));
const skillNormalization = JSON.parse(fs.readFileSync("spec/skill-normalization-status.json", "utf8"));

const errors = [];
const mustEqual = [
  ["battle_party_size", manifest.current_confirmed.battle_party_size, 6],
  ["ally_grid", manifest.current_confirmed.ally_grid, "3x3"],
  ["enemy_grid", manifest.current_confirmed.enemy_grid, "3x3"],
];
for (const [name, actual, expected] of mustEqual) {
  if (actual !== expected) errors.push(`${name}: expected ${expected}, got ${actual}`);
}
for (const value of ["HP","SP"]) {
  if (!manifest.current_confirmed.resource.includes(value)) errors.push(`missing resource ${value}`);
}
if (!manifest.current_confirmed.obsolete_resource.includes("MP")) errors.push("MP must remain marked obsolete");
for (const value of ["PHY","SKL","ARC","MND"]) {
  if (!manifest.current_confirmed.stats.includes(value)) errors.push(`missing stat ${value}`);
}
for (const value of ["信仰","呪術","魔術","符術","機巧","異能"]) {
  if (!manifest.current_confirmed.spell_masteries.includes(value)) errors.push(`missing spell mastery ${value}`);
}
for (const value of ["盲目","猛毒","睡眠","気絶","動揺","誘惑","即死"]) {
  if (!manifest.current_confirmed.ailments.includes(value)) errors.push(`missing ailment ${value}`);
}
for (const token of ["6 allies","unified SP","防具一式","誘惑","機巧","異能"]) {
  if (!spec.includes(token)) errors.push(`CURRENT_SPEC missing: ${token}`);
}

const allowedStatuses = new Set(["確定","構造確定","初期実装値","要レビュー","廃止旧仕様"]);
if (status.reverse_synced_skills.count !== 296) errors.push(`status registry skill count: expected 296, got ${status.reverse_synced_skills.count}`);
for (const [name, value] of Object.entries(status.reverse_synced_skills.items || {})) {
  if (!allowedStatuses.has(value)) errors.push(`invalid status for ${name}: ${value}`);
}
if (Object.keys(status.reverse_synced_skills.items || {}).length !== 296) errors.push("all 296 reverse-synced skills must be classified");
if (status.confirmed_values?.mastery_rank?.max !== 10) errors.push("Mastery Rank max must be 10");
if (status.confirmed_values?.rank_per_mastery_point?.value !== 1) errors.push("1 Mastery Pt must raise Rank by 1");
if (status.confirmed_values?.skill_set_capacity?.value !== 12) errors.push("Skill Set Capacity must be 12");
if (status.initial_implementation_values?.combo_fire_to_wind_bonus?.status !== "初期実装値") errors.push("combo bonus remains a balance value");
if (status.obsolete_legacy?.MP?.status !== "廃止旧仕様") errors.push("MP must be classified as obsolete legacy");
if (balance.overall_status !== "要レビュー") errors.push("battle balance registry must remain review-controlled until explicit confirmation");
for (const key of ["hp_sp","damage","hit_evade","critical","weight","status_and_binds","weakness","repeat_action","action_speed"]) if (balance.systems?.[key]?.status !== "要レビュー") errors.push(`balance system ${key} must remain 要レビュー until explicitly confirmed`);
if (!["構造確定","確定"].includes(skillTarget.status)) errors.push("315-skill target structure must be current");
if (skillTarget.current_runtime?.skills !== 296) errors.push("skill target registry must describe the current 296-skill runtime");
if (skillTarget.target_candidate?.total_skills !== 315 || skillTarget.target_candidate?.base_slots !== 310 || skillTarget.target_candidate?.extra_slots !== 5) errors.push("315-skill target arithmetic mismatch");
if (skillTarget.exact_catalog?.known_complete_list !== true) errors.push("canonical workbook 315 catalog must be marked available");
if (!skillTarget.migration_policy?.do_not_invent_missing_names) errors.push("skill migration must never invent names");
if (skillMigration.canonical_count !== 315 || skillMigration.legacy_runtime_count !== 296) errors.push("skill migration audit counts must remain 315 vs 296");
if (skillMigration.exact_unique_name_matches !== 40) errors.push("skill migration audit exact-match baseline changed; regenerate from canonical workbook before migration");
if (!skillMigration.ambiguous_canonical_rows?.includes("速射")) errors.push("skill migration audit must preserve the bow/gun 速射 ambiguity");
if (skillNormalization.canonical_count !== 315) errors.push("normalized SkillDB must contain 315 canonical rows");
if (skillNormalization.schema_normalized !== 315 || skillNormalization.needs_special_review !== 0) errors.push("SkillDB normalization coverage must remain 315 normalized / 0 special review until the canonical workbook changes");
if (skillNormalization.special_review?.length !== 0) errors.push("SkillDB special-review list must be empty after full normalization");

for (const token of ["Mandatory workflow","Definition of done","canonical specification workbook"]) {
  if (!contract.includes(token)) errors.push(`AGENTS contract missing: ${token}`);
}

if (errors.length) {
  console.error("Specification contract check failed:");
  for (const e of errors) console.error("- " + e);
  process.exit(1);
}
console.log("Specification contract OK");
