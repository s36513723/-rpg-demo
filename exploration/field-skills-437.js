/* Derived Field Skill view. The single canonical source is skill-catalog-437.js. */
(function(root){'use strict';
const catalog=root.RPG_SKILLS_437||(typeof require!=='undefined'?(()=>{try{return require('../skill-catalog-437.js')}catch(_){return null}})():null);
if(!catalog||catalog.count!==437)throw new Error('canonical 437 SkillDB is required');
function reqInfo(s){const m=String(s||'').match(/Rank\s*(\d+).*?(PHY|SKL|ARC|MND)\s*(\d+)/);return {rank:m?+m[1]:1,stat:m?m[2]:'SKL',value:m?+m[3]:0}}
function spInfo(s){const m=String(s||'').match(/SP\s*(\d+)/);return m?+m[1]:0}
const rows=catalog.guideRows.filter(r=>r[19]).map(r=>[r[0],r[2],r[3],r[5],r[7],r[8],r[9],r[10],r[11],r[15],r[17],r[18],r[19]]);
const skills={},byId={};
for(const r of rows){
 const[id,mastery,branch,name,description,req,tpCost,setCost,costText,extra,scene,status,tags]=r,q=reqInfo(req),automatic=/セット中自動/.test(scene);
 const d={id,mastery,branch,name,description,rank:q.rank,stat:q.stat,statValue:q.value,tpCost,setCost,spCost:spInfo(costText),costText,extra,scene,status,fieldTags:String(tags||'').split(';').filter(Boolean),mode:automatic?'Passive':'Field',kind:'field',canonical437:true};
 skills[name]=d;byId[id]=d;
}
const aliases={};
for(const [old,key] of Object.entries(catalog.aliases||{})){const d=catalog.skills[key];if(d&&byId[d.id])aliases[old]=d.name}
const api={version:2,catalogVersion:437,count:rows.length,canonicalCount:rows.length,rows,skills,byId,aliases,canonicalName:n=>aliases[n]||n};
if(api.count!==25)throw new Error('Field Skill view count '+api.count);
if(typeof module!=='undefined')module.exports=api;root.RPG_FIELD_SKILLS_437=api;
})(typeof globalThis!=='undefined'?globalThis:this);
