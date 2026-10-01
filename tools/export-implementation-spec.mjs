// Canonical runtime export: 437 SkillDB.
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const R = require("../rpg-rules.js");
const status = JSON.parse(fs.readFileSync(new URL("../spec/spec-status.json", import.meta.url), "utf8"));

const outDir = new URL("../spec/generated/", import.meta.url);
fs.mkdirSync(outDir, { recursive: true });

const csvCell = value => {
  if (value === undefined || value === null) value = "";
  if (typeof value === "object") value = JSON.stringify(value);
  return '"' + String(value).replaceAll('"', '""') + '"';
};
const row = values => values.map(csvCell).join(",");

const skillHeaders = [
  "名称","Mode","Kind","SP","SetCost","属性","射程","Scope","依存","対象",
  "習得条件","説明","Targeting","Passive","Special","Reaction","Body","Cast",
  "Buff","Magnitude","Heal","ResourceRecovery","Weapons","仕様状態"
];

const skillRows = Object.entries(R.skills).map(([name,d]) => {
  const unlocks = (d.unlocks || []).map(u =>
    [u.mastery,u.branch,"R"+u.rank,(u.stat || "") + (u.value ?? "")].filter(Boolean).join("/")
  ).join(" | ");
  return row([
    name,d.mode,d.kind,d.cost ?? 0,d.setCost ?? 0,d.attr,d.range,d.scope,d.stat,d.target,
    unlocks,d.description || "",d.targeting ?? null,d.passive ?? null,d.special ?? null,
    d.reaction ?? null,(d.body || []).join("/"),d.cast || 0,d.buff || "",d.magnitude ?? "",
    d.heal || "",d.resourceRecovery ?? null,(d.weapons || []).join("/"),
    status.reverse_synced_skills?.items?.[name] || status.reverse_synced_skills?.default_status || "要レビュー"
  ]);
});
fs.writeFileSync(new URL("implemented-skills.csv", outDir), [row(skillHeaders),...skillRows].join("\n")+"\n");

const masteryHeaders = ["Mastery","Category","Branches"];
const masteryRows = Object.entries(R.masteries).map(([name,d]) => {
  const branches = Object.entries(d.branches || {}).map(([branch,names]) => branch+":"+names.join("/")).join(" | ");
  return row([name,d.category,branches]);
});
fs.writeFileSync(new URL("implemented-masteries.csv", outDir), [row(masteryHeaders),...masteryRows].join("\n")+"\n");

if (skillRows.length !== 437) throw new Error("Expected 437 canonical runtime skill keys, got "+skillRows.length);
if (masteryRows.length !== 31) throw new Error("Expected 31 masteries, got "+masteryRows.length);
if (skillRows.some(line => /"MP"|mpDiscount|mpOnce/.test(line))) throw new Error("Legacy MP schema leaked into current skill CSV");
console.log(`Generated ${skillRows.length} skills and ${masteryRows.length} masteries.`);
