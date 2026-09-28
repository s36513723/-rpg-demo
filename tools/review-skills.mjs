import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const R = require("../rpg-rules.js");

const clone = x => JSON.parse(JSON.stringify(x));
const mechanicSignature = d => {
  const x = clone(d);
  delete x.name;
  delete x.unlocks;
  delete x.description;
  return JSON.stringify(x);
};
const masteryList = d => [...new Set((d.unlocks || []).map(u => u.mastery))];

const groups = new Map();
for (const [name,d] of Object.entries(R.skills)) {
  const sig = mechanicSignature(d);
  if (!groups.has(sig)) groups.set(sig, []);
  groups.get(sig).push(name);
}
const exactDuplicateGroups = [...groups.values()].filter(x => x.length > 1).sort((a,b) => b.length-a.length);
const duplicateDetails = exactDuplicateGroups.map(names => {
  const masteries = Object.fromEntries(names.map(n => [n, masteryList(R.skills[n])]));
  const overlaps = [];
  for (let i=0;i<names.length;i++) for (let j=i+1;j<names.length;j++) {
    const shared = masteries[names[i]].filter(x => masteries[names[j]].includes(x));
    if (shared.length) overlaps.push({a:names[i],b:names[j],masteries:shared});
  }
  return {names,masteries,same_mastery:overlaps.length>0,overlaps};
});

const byMastery = {};
for (const [name,d] of Object.entries(R.skills)) {
  for (const u of d.unlocks || []) {
    byMastery[u.mastery] ||= {skills:new Set(),branches:new Set(),active:0,passive:0};
    byMastery[u.mastery].skills.add(name);
    byMastery[u.mastery].branches.add(u.branch);
  }
}
for (const [mastery,v] of Object.entries(byMastery)) {
  const names=[...v.skills];
  byMastery[mastery]={
    skill_count:names.length,
    branch_count:v.branches.size,
    active:names.filter(n=>R.skills[n]?.mode==="Active").length,
    passive:names.filter(n=>R.skills[n]?.mode==="Passive").length
  };
}

const damaging = Object.entries(R.skills)
  .filter(([,d]) => d.mode==="Active" && Number(d.mult)>0 && Number(d.cost)>0)
  .map(([name,d]) => ({
    name,cost:d.cost,mult:d.mult,
    simple_mult_per_sp:Number((d.mult/d.cost).toFixed(4)),
    scope:d.scope,range:d.range,attr:d.attr,setCost:d.setCost,cast:d.cast||0,
    masteries:masteryList(d)
  }));
const efficiencyHigh=[...damaging].sort((a,b)=>b.simple_mult_per_sp-a.simple_mult_per_sp).slice(0,30);
const efficiencyLow=[...damaging].sort((a,b)=>a.simple_mult_per_sp-b.simple_mult_per_sp).slice(0,30);

const report={
  schema_version:1,
  status:"要レビュー",
  note:"Mechanical triage only. Exact duplicates can still be intentional across different Masteries. Do not auto-delete or auto-balance from this report.",
  totals:{
    skills:Object.keys(R.skills).length,
    active:Object.values(R.skills).filter(d=>d.mode==="Active").length,
    passive:Object.values(R.skills).filter(d=>d.mode==="Passive").length,
    exact_duplicate_groups:duplicateDetails.length,
    same_mastery_exact_duplicate_groups:duplicateDetails.filter(x=>x.same_mastery).length,
    cross_mastery_only_exact_duplicate_groups:duplicateDetails.filter(x=>!x.same_mastery).length,
    skills_without_unlocks:Object.values(R.skills).filter(d=>!(d.unlocks||[]).length).length
  },
  priority_review:{
    same_mastery_exact_duplicates:duplicateDetails.filter(x=>x.same_mastery),
    simple_sp_efficiency_high:efficiencyHigh,
    simple_sp_efficiency_low:efficiencyLow
  },
  cross_mastery_exact_duplicates:duplicateDetails.filter(x=>!x.same_mastery),
  by_mastery:byMastery,
  interpretation:[
    "同じMastery内で完全同型の技は、取得順・役割差・死にスキル化を最優先で確認する。",
    "別Mastery間の同型技は、世界観上の別経路として意図的な可能性があるため即統合しない。",
    "mult/SPは範囲・状態異常・詠唱・射程を無視した単純指標なので、外れ値の発見にだけ使う。",
    "296スキルの個別値は承認済みとは扱わない。"
  ]
};

if(report.totals.skills!==296)throw new Error("Expected 296 skills");
fs.writeFileSync(new URL("../spec/generated/skill-review.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
console.log(`Skill review: ${report.totals.skills} skills, ${report.totals.exact_duplicate_groups} exact duplicate groups, ${report.totals.same_mastery_exact_duplicate_groups} same-Mastery groups.`);
