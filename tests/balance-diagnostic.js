(() => {
 const T=window.__test,R=window.RPG_RULES;
 T.context(null);T.fast();T.setTerrain('開所');
 const party=T.units.party,enemies=T.units.enemies;
 const oldRandom=Math.random;Math.random=()=>0.5;
 const round=n=>Math.round(n*100)/100;
 const derivedSamples={
  balanced_30:R.derived([30,30,30,30]),
  physical_60:R.derived([60,30,10,10]),
  skill_60:R.derived([30,60,10,10]),
  arc_60:R.derived([10,30,60,20]),
  mind_60:R.derived([10,30,20,60])
 };
 const normals=party.map(u=>({
  actor:u.name,
  weapon:u.weapon?.name||'',
  weight:round(u.encumbrance?.weight||0),
  limit:u.encumbrance?.limit||u.PHY,
  weightLevel:u.encumbrance?.level||0,
  speed:round(T.speed(u,{type:'attack',action:T.normal(u)})),
  targets:enemies.map(t=>{
   const a=T.normal(u),d=T.damage(u,t,a);
   return {enemy:t.name,style:t.style,damage:d.value,hit:round(T.hit(u,t,a)),crit:round(T.critChance(u,t,a)),affinity:round(d.aff)};
  })
 }));
 const affinityAttributes=['斬','突','壊','火','水','土','風','光','闇','無'];
 const affinities=enemies.map(t=>({enemy:t.name,style:t.style,values:Object.fromEntries(affinityAttributes.map(a=>[a,T.affinity(t,a)]))}));
 const statusCases=[
  ['poison','猛毒',{kind:'skill',stat:'SKL',poison:70}],
  ['blind','盲目',{kind:'skill',stat:'SKL',blind:65}],
  ['sleep','睡眠',{kind:'spell',stat:'ARC',sleep:65}],
  ['stun','気絶',{kind:'skill',stat:'PHY',stun:50}],
  ['headBind','頭封じ',{kind:'spell',stat:'MND',headBind:70}],
  ['armBind','腕封じ',{kind:'skill',stat:'SKL',armBind:65}],
  ['legBind','脚封じ',{kind:'skill',stat:'SKL',legBind:65}],
  ['instantDeath','即死',{kind:'spell',stat:'MND',instantDeath:35}]
 ];
 const makeTarget=(base,kind)=>{
  const t=JSON.parse(JSON.stringify(base));
  t.status=t.status||{};t.statusBuildup={};t.timed={};t.masteries=[];
  if(kind==='elite')t.elite=true;
  if(kind==='boss'){t.style='BOSS';t.elite=false}
  return t;
 };
 const statusSource=party.find(u=>u.MND>=50)||party[0],baseTarget=enemies[0];
 const statuses=statusCases.map(([key,label,a])=>({
  key,label,source:statusSource.name,
  normal:round(T.statusChance(statusSource,makeTarget(baseTarget,'normal'),a,key)),
  elite:round(T.statusChance(statusSource,makeTarget(baseTarget,'elite'),a,key)),
  boss:round(T.statusChance(statusSource,makeTarget(baseTarget,'boss'),a,key))
 }));
 Math.random=oldRandom;
 return {
  schema:1,
  classification:'initial_implementation_review',
  note:'These are measurements of the current implementation, not confirmed balance values.',
  formulas:{
   hp_sp:'RPG_RULES.derived current implementation; exact formula is review-controlled',
   damage:'attackValue × skill multiplier × 100/(100+defense) × affinity × crit × situational modifiers × variance',
   hit:'clamp(90 + (accuracy - evade) × 0.5, 30, 100)',
   crit:'clamp(5 + (attacker SKL - target SKL)/4 + weapon/skill/passive bonuses, 0, 50)',
   status:'clamp(base + 0.75×(status stat - target MND) + bonuses - resistance, 5, cap)',
   weak_resist:'single attribute is normalized to 2.0 weakness / 1.0 normal / 0.5 resistance / 0 immunity; compound attributes average',
   weight:'ratio <=1 / <=1.2 / <=1.5 / >1.5 gives levels 0/1/2/3; current speed/evasion penalties are 0/5/15/30 and physical weapon multipliers are 1/0.95/0.9/0.8',
   repeat:'repeatMult() currently returns '+T.repeatMult()
  },
  derivedSamples,normals,affinities,statuses
 };
})()
