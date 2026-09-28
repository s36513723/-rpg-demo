import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("spec/spec-manifest.json", "utf8"));
const spec = fs.readFileSync("spec/CURRENT_SPEC.md", "utf8");
const contract = fs.readFileSync("AGENTS.md", "utf8");
const status = JSON.parse(fs.readFileSync("spec/spec-status.json", "utf8"));

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

const allowedStatuses = new Set(["確定","初期実装値","要レビュー","廃止旧仕様"]);
if (status.reverse_synced_skills.count !== 296) errors.push(`status registry skill count: expected 296, got ${status.reverse_synced_skills.count}`);
for (const [name, value] of Object.entries(status.reverse_synced_skills.items || {})) {
  if (!allowedStatuses.has(value)) errors.push(`invalid status for ${name}: ${value}`);
}
if (Object.keys(status.reverse_synced_skills.items || {}).length !== 296) errors.push("all 296 reverse-synced skills must be classified");
for (const key of ["mastery_rank_max","rank_per_mastery_point","skill_set_capacity","combo_fire_to_wind_bonus"]) {
  if (status.initial_implementation_values?.[key]?.status !== "初期実装値") errors.push(`${key} must remain initial implementation until explicitly confirmed`);
}
if (status.obsolete_legacy?.MP?.status !== "廃止旧仕様") errors.push("MP must be classified as obsolete legacy");

for (const token of ["Mandatory workflow","Definition of done","canonical specification workbook"]) {
  if (!contract.includes(token)) errors.push(`AGENTS contract missing: ${token}`);
}

if (errors.length) {
  console.error("Specification contract check failed:");
  for (const e of errors) console.error("- " + e);
  process.exit(1);
}
console.log("Specification contract OK");
