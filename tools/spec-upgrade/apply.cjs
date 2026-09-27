const fs=require('fs'),acorn=require('acorn');
const path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const root=process.cwd(),base=fs.mkdtempSync(path.join(os.tmpdir(),'rpg-base-'));
const expected={"index.html": "e1b921622c27c71fe9409d8c6f46e62bdc6dc1f981335e8b9ab71a66865d0c5b", "battle-v29.js": "8df9b1342b8ea958a369fa86bec4e70a82e813238a9c526e72b582a9bb985091", "exploration/index.html": "967bbff4609c628dea634326a64a40480c2d989b46a28f2c71bc0245df95a075"};
for(const [f,hash] of Object.entries(expected)){
 const data=fs.readFileSync(path.join(root,f));
 if(crypto.createHash('sha256').update(data).digest('hex')!==hash)throw Error('Source changed: '+f+'; review before applying');
 fs.mkdirSync(path.dirname(path.join(base,f)),{recursive:true});fs.writeFileSync(path.join(base,f),data);
}
function patch(source,replacements,legacy=[],kind='script'){
 const parsed=acorn.parse(source,{ecmaVersion:'latest'}),body=kind==='battle'?parsed.body[0].expression.callee.body.body:parsed.body;
 const old=new Map(body.filter(n=>n.type==='FunctionDeclaration').map(n=>[n.id.name,n]));
 const newParsed=acorn.parse(replacements,{ecmaVersion:'latest'});const edits=[],append=[];
 for(const n of newParsed.body){if(n.type!=='FunctionDeclaration')throw Error('patch should contain functions only');const name=n.id.name,code=replacements.slice(n.start,n.end),o=old.get(name);if(o){if(legacy.includes(name)){const original=source.slice(o.start,o.end).replace('function '+name+'(', 'function legacy'+name[0].toUpperCase()+name.slice(1)+'(');edits.push({start:o.start,end:o.end,text:original+'\n'+code})}else edits.push({start:o.start,end:o.end,text:code})}else append.push(code)}
 const anchor=kind==='battle'?source.indexOf("$('returnExplore').addEventListener"):source.lastIndexOf('rebuildSkillWeaponMap();loadGame()');if(anchor<0)throw Error('init marker missing');edits.push({start:anchor,end:anchor,text:append.join('\n')+'\n'});
 edits.sort((a,b)=>b.start-a.start);for(const e of edits)source=source.slice(0,e.start)+e.text+source.slice(e.end);
 acorn.parse(source,{ecmaVersion:'latest'});return source;
}
let b=patch(fs.readFileSync(base+'/battle-v29.js','utf8'),fs.readFileSync(root+'/tools/spec-upgrade/battle.js','utf8'),[],'battle');
b=b.replace("const $=id=>document.getElementById(id);","const $=id=>document.getElementById(id);\nconst sheet=$('choiceSheet');");
// null-safe historical label: the canonical rules module owns actual mechanics.
b=b.replace("window.RPGDemo={version:'29'","window.RPGDemo={version:'30-spec6'");
b=b.replace(/\n\}\)\(\);\s*$/,`\nif(window.__RPG_TEST__){Object.assign(window.__test,{rules:rulebook(),setCommand,normal,damage,affinity,hit,unavailable,weaponSkillReason,actionCost,passive,skill:importSkill,affectedTargets,preparePlans,applyHandSet,updateEncumbrance,setTimed,buff,tickTimed,forceMoveChance,makeParts,planEnemy,throwAction,useCarry,queue,rowChange,simpleCommand,switchWeapon,openEnemyInfo,openSwapSheet,openSheet,\nfast:()=>{waitRead=async()=>{};say=async(text)=>{log(text,'sys')};animateSwap=async(a,b)=>{const row=a.row,slot=a.slot;a.row=b.row;a.slot=b.slot;b.row=row;b.slot=slot;render()}},\nstate:()=>({round,phase,busy,over,summons,carryRemaining}),context:(ctx)=>{EXPCTX=ctx;fresh()},act:(u,q)=>execute(u,q,session),status:(u,t,a)=>applyStatuses(u,t,a,session),end:()=>endRound(session),finish:t=>finish(t,session),move:(u,r)=>moveTo(u,r,session),breakPart:(u,id,n)=>damagePart(u,id,n,session),combo:(u,t,a)=>comboBefore(u,t,a,session),setRound:r=>{round=r},setTerrain:n=>{terrain={...TERRAINS.find(t=>t.name===n)}}});}\n})();\n`);
fs.writeFileSync(root+'/battle-v29.js',b);
let h=fs.readFileSync(base+'/exploration/index.html','utf8'),m=h.match(/<script>([\s\S]*?)<\/script>/),js=patch(m[1],fs.readFileSync(root+'/tools/spec-upgrade/exploration.js','utf8'),['saveGame','loadGame','resumeBattle']);
h=h.replace(m[0],'<script>'+js+'</script>').replace('</head>','<script src="../rpg-rules.js?v=6"></script></head>');fs.writeFileSync(root+'/exploration/index.html',h);
let i=fs.readFileSync(base+'/index.html','utf8');i=i.replace('<script src="battle-v29.js" defer></script>','<script src="rpg-rules.js?v=6" defer></script>\n<script src="battle-v29.js?v=6" defer></script>').replace('>防御</button>',' title="1行動を使い防御。攻撃・道具との併用不可">防御</button>');fs.writeFileSync(root+'/index.html',i);
console.log('Patched with AST offsets; no function replacement absorbs adjacent declarations.');
