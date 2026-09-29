(async () => {
  const T = window.__test, R = window.RPG_RULES;
  const catalog = Object.values(R.skills);
  const report = {catalog: {total: catalog.length, modes: {}}, active: [], battles: [], escapeTrials: [], engine: 'index.html'};
  for (const skill of catalog) report.catalog.modes[skill.mode] = (report.catalog.modes[skill.mode] || 0) + 1;
  const effectFields=['mult','heal','revive','cleanse','bless','alchemy','summon','special','poison','blind','sleep','agitate','stun','headBind','armBind','legBind','instantDeath','push','pull','guard','buff','debuff','cast','barrier','regen','reposition','taunt','followOrder'];
  report.catalog.activeWithoutEffectData=catalog.filter(d=>d.mode==='Active'&&!effectFields.some(k=>d[k])).map(d=>({id:d.id,name:d.name}));
  const state = () => [...T.units.party, ...T.units.enemies].map(u => ({
    hp:u.hp, sp:u.sp, row:u.row, status:u.status, statusBuildup:u.statusBuildup,
    timed:u.timed, alive:u.alive, casting:u.casting, lockedBy:u.lockedBy,
    parts:u.parts, summon:T.state().summons
  }));
  T.fast();
  const originalRandom = Math.random;
  try {
    for (const d of catalog.filter(x => x.mode === 'Active')) {
      T.context(null); T.fast(); Math.random = () => .01;
      const p = T.units.party, e = T.units.enemies, u = p[4];
      for (const unit of [...p,...e]) {
        unit.hp = unit.maxHp = 9999; unit.sp = unit.maxSp = 9999;
        unit.PHY = unit.SKL = unit.ARC = unit.MND = 200;
        unit.status = {}; unit.statusBuildup = {}; unit.statusPower = {};
      }
      p[0].hp = 5000;
      const action = {...d, weapons:[], cost:0, once:false, cast:0};
      const target = action.target === 'self' ? u : action.target === 'ally' ? p[0] : e[0];
      if (action.revive) {p[0].hp = 0; p[0].alive = false;}
      if (action.itemCost) T.state().carryRemaining[action.itemCost] = 10;
      const before = JSON.stringify(state());
      try {
        await T.act(u, {type:'skill', action, targetId:target.id});
        report.active.push({id:d.id, name:d.name, key:d.catalogKey, executed:true,
          changed:before !== JSON.stringify(state())});
      } catch (error) {report.active.push({id:d.id,name:d.name,executed:false,error:String(error)});}
    }
    for (let trial = 0; trial < 53; trial++) {
      T.context(null); T.fast();
      let seed = trial + 1;
      Math.random = () => {seed = (seed * 16807) % 2147483647; return seed / 2147483647};
      const initialSp = T.units.party.reduce((s,u)=>s+u.sp,0);
      let rounds = 0, error = null;
      try {
        while (!T.state().over && rounds < 35) {
          for (const u of T.units.party.filter(x=>x.alive)) {
            const skilled = rounds % 2 === 0 ? u.skills?.find(a=>a.mode==='Active'&&!T.unavailable(u,a)&&
              u.sp>=T.actionCost(u,a)&&T.targets(u,a).length) : null;
            const a=skilled||T.normal(u), target=T.targets(u,a)[0];
            T.setCommand(u,target?{type:skilled?'skill':'attack',action:skilled||undefined,targetId:target.id}:{type:'defend'});
          }
          await T.resolve(); rounds++;
        }
      } catch (ex) {error=String(ex)}
      report.battles.push({trial:trial+1, rounds, result:T.state().over ?
        (T.units.enemies.some(x=>x.alive)?'loss':'win'):'unfinished', error,
        spSpent:initialSp-T.units.party.reduce((s,u)=>s+u.sp,0),
        survivors:T.units.party.filter(x=>x.alive).length});
    }
    for (let trial=0;trial<53;trial++) {
      T.context(null);T.fast();
      let seed=(trial+4102)*431983;
      Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
      try {await T.act(T.units.party[0],{type:'escape'});
        report.escapeTrials.push({trial:trial+1,success:T.state().over});
      } catch(error) {report.escapeTrials.push({trial:trial+1,error:String(error)})}
    }
    T.context(null); T.fast(); Math.random=()=>.5;
    const dual=T.units.party[1];dual.SKL=60;
    dual.handSets=['主武器：短剣','副手：短剣','予備主：短剣','予備副：なし'];dual.wi=0;
    dual.handSets[1]='副手：短剣';T.applyHandSet(dual);
    const dualPower=T.attackValue(dual,T.normal(dual));
    dual.handSets[1]='副手：小盾';T.applyHandSet(dual);
    const singlePower=T.attackValue(dual,T.normal(dual));
    const caster=T.units.party[4],spell={...T.normal(caster),kind:'spell',stat:'ARC'};
    const castBase=T.speed(caster,{type:'skill',action:spell});
    caster.masteries=['集中'];
    const castFocused=T.speed(caster,{type:'skill',action:spell});
    report.compensation={offhand:{dualPower,shieldPower:singlePower,working:dualPower>singlePower},
      castInitiative:{base:castBase,focused:castFocused,working:castFocused>castBase},
      castDurationMechanic:'one round for every action with cast; speed bonus changes initiative only'};
  } finally {Math.random=originalRandom; T.context(null);}
  return report;
})()
