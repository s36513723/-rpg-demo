const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {scenarios}=require('./full-arsenal-fixture.cjs');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const p=path.resolve(root,'.'+pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return}const file=fs.existsSync(p)&&fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'}).end(data)})});
let browser;
async function main(){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));browser=await chromium.launch({headless:true,executablePath:process.env.RPG_CHROMIUM||chromium.executablePath(),args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const base='http://127.0.0.1:'+server.address().port;
await page.goto(base+'/exploration/index.html');await page.waitForFunction(()=>window.H&&window.HUB_CONTENT&&window.RPG_RULES,{timeout:30000});
const navigation=await page.evaluate(()=>{const start=collectSave();H.run=makeRun('古代迷宮',['森林','洞窟','廃墟都市']);H.run.pending=null;drawDungeon();const stock={...loot};const earned=HUB_CONTENT.regions['古代迷宮'].material;loot[earned]=(loot[earned]||0)+2;awardExperience(120,'検証');returnTown('任意帰還');return {ended:H.run===null,loot:(H.unappraised.materials[earned]||0),experience:H.experience,view:document.querySelector('#screen')?.textContent?.slice(0,80),saved:!!RPG_STORE.getItem('rpg.exploration.save1')}});
assert(navigation.ended&&navigation.loot===2&&navigation.experience>=120&&navigation.saved,JSON.stringify(navigation));
const batches=scenarios(),count=Number(process.env.RPG_ARSENAL_BATCHES||batches.length);let tested=0;
for(const [n,batch] of batches.slice(0,count).entries()){
 const six=Array.from({length:6},(_,i)=>batch[i]||batches[0][i]);
 const gearMeta=Object.fromEntries(six.flatMap(m=>m.equipment.slice(0,4).map(e=>e.split('：')[1])).filter(n=>n&&n!=='なし').map(n=>[n,['斬','近',5,'PHY',25]]));
 const ctx={schema:6,battleId:'qa-'+n,result:null,activeMembers:[0,1,2,3,4,5],formation:[0,1,2,3,4,5,null,null,null],stats:six.map(m=>m.stats),vitals:six.map(m=>({hp:1000,sp:100,status:{}})),equipment:six.map(m=>m.equipment),skillSet:six.map(m=>m.skillSet),gearMeta,enemyFront:['獣'],enemyBack:[],terrain:'開所',autoMode:'ガンガン使う'};
 await page.evaluate(c=>localStorage.setItem('rpg.exploreBattle',JSON.stringify(c)),ctx);
 await page.goto(base+'/battle-v44.html?from=exploration');await page.waitForFunction(()=>window.RPGDemo?.snapshot()?.party?.length===6,{timeout:30000});
 const state=await page.evaluate(()=>window.RPGDemo.snapshot());
 assert.equal(state.party.length,6);for(let i=0;i<batch.length;i++){assert.equal(state.party[i].weapon,six[i].equipment[0].split('：')[1]);if(six[i].skillSet[0]&&require('../rpg-rules.js').meta(six[i].skillSet[0])?.mode!=='Passive')assert(state.party[i].skills.includes(require('../rpg-rules.js').meta(six[i].skillSet[0]).name),`Skill absent: ${six[i].skillId}`)}
 tested+=batch.length;
}
assert.deepEqual(errors,[],errors.join('\n'));
console.log(JSON.stringify({navigation,sorties:count,skillsTested:tested,errors},null,2));await browser.close();server.close()}
main().catch(async e=>{console.error(e);await browser?.close().catch(()=>{});server.close();process.exit(1)});
