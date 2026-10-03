"""Native HTTP regression on CI; local DOM/Storage adapter when OFFLINE is explicit."""
import asyncio,json,re,os,threading,http.server,pathlib
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OFFLINE=os.getenv('RPG_OFFLINE_TEST')=='1'
async def load(page,hub):
 await page.add_init_script('window.__RPG_TEST__=true')
 if not OFFLINE:
  await page.goto('http://127.0.0.1:8139/'+('exploration/' if hub else ''),wait_until='load');return
 source=ROOT/('exploration/index.html' if hub else 'index.html')
 html=source.read_text()
 scripts=re.findall(r'<script\b([^>]*)>([\s\S]*?)</script>',html)
 html=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',html)
 def style(match):
  href=re.search(r'href="([^"]+)"',match[0]);p=(source.parent/href[1].split('?')[0]).resolve() if href else None
  return '<style>'+p.read_text()+'</style>' if p and p.is_relative_to(ROOT) and p.is_file() else ''
 html=re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*>',style,html)
 await page.set_content(html)
 await page.evaluate("""() => {window.__RPG_TEST__=true;window.__storage={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>__storage[k]??null,setItem:(k,v)=>__storage[k]=String(v),removeItem:k=>delete __storage[k],clear:()=>{__storage={}}}})}""")
 for attributes,inline in scripts:
  src=re.search(r'src="([^"]+)"',attributes)
  if src:
   path=(source.parent/src[1].split('?')[0]).resolve()
   if not path.is_relative_to(ROOT):raise ValueError('Script outside the repository')
   inline=path.read_text()
  if inline.strip():await page.add_script_tag(content=inline)
async def layouts(page):
 results=[]
 baseline=await page.evaluate('collectSave()')
 for width,height in [(320,568),(375,667),(390,844),(430,932),(768,1024)]:
  for alerts in [False,True]:
   await page.set_viewport_size({'width':width,'height':height})
   await page.evaluate("""({base,alerts})=>{installSave(base);H.run=null;for(const q of hc().quests)H.quests[q.id]={state:0,progress:0};loot.古器=alerts?2:0;H.story.pending=alerts?['古代迷宮']:[];const q=hc().quests[0];H.quests[q.id]={state:alerts?2:0,progress:alerts?q.target:0};H.tracked=alerts?q.id:null;town()}""",{'base':baseline,'alerts':alerts})
   dims=await page.evaluate("""()=>{const s=document.querySelector('#screen'),app=document.querySelector('#app'),party=document.querySelector('#party'),commands=[...document.querySelectorAll('.town-command-grid .place')],nav=document.querySelector('.hub-global-nav'),navButtons=[...document.querySelectorAll('.hub-global-nav button')],map=document.querySelector('.hub-global-nav [data-nav="map"]');return {overflow:s.scrollHeight-s.clientHeight,wide:document.documentElement.scrollWidth>innerWidth,background:!!app&&getComputedStyle(app).backgroundImage.includes('hub-capital-bg'),commands:commands.length,commandsVisible:commands.every(x=>x.getBoundingClientRect().bottom<=s.getBoundingClientRect().bottom+1),rosterLast:party.getBoundingClientRect().top>=s.getBoundingClientRect().bottom-1,nav:!!nav&&navButtons.length===3&&navButtons.map(x=>x.textContent.trim()).join('|').includes('BACK')&&navButtons.map(x=>x.textContent.trim()).join('|').includes('HOME')&&navButtons.map(x=>x.textContent.trim()).join('|').includes('MAP'),map:!!map&&JSON.parse(map.dataset.args||'[]')[0]==='destination',noStrip:!document.querySelector('.town-dungeon-strip')}}""")
   results.append({'name':f'UI44 viewport {width}x{height} alerts={alerts}','ok':dims['overflow']<=1 and not dims['wide'] and dims['background'] and dims['commands']==3 and dims['commandsVisible'] and dims['rosterLast'] and dims['nav'] and dims['map'] and dims['noStrip'],'measurements':dims})
 for width,height in [(320,568),(375,667),(390,844),(430,932),(768,1024)]:
  await page.set_viewport_size({'width':width,'height':height})
  await page.evaluate('base=>{installSave(base);H.run=null;closeM();town()}',baseline)
  for action in ['memberTalk(0)','npcTalk("受付")','equip(0)']:
   await page.evaluate(action)
   if action=='equip(0)':
    dims=await page.evaluate("""()=>{const panel=document.querySelector('#panel'),body=panel.querySelector('.panel-body'),modal=document.querySelector('#modal'),nav=document.querySelector('.hub-global-nav'),art=panel.querySelector('.actor-backdrop img'),shell=panel.querySelector('.character-equipment-shell'),slots=[...panel.querySelectorAll('.character-equip-slot')],actions=[...panel.querySelectorAll('.character-action-panel')],members=[...panel.querySelectorAll('.actor-member-switch button')];const pr=panel.getBoundingClientRect(),mr=modal.getBoundingClientRect(),buttons=[...nav.querySelectorAll('button')];return {wide:body.scrollWidth>body.clientWidth+1,nav:!nav.inert&&buttons.length===3&&buttons.every(b=>b.getClientRects().length),fit:pr.bottom<=mr.bottom+1&&pr.top>=mr.top-1,portrait:!!art&&art.complete&&art.naturalWidth>0,shell:!!shell,slots:slots.length,actions:actions.map(x=>x.textContent.trim()),members:members.length,noTabs:!panel.querySelector('.actor-tabs'),noPicker:!panel.querySelector('.character-equipment-picker')}}""")
    results.append({'name':f'UI39 centered equipment layout {width}x{height}','ok':not dims['wide'] and dims['nav'] and dims['fit'] and dims['portrait'] and dims['shell'] and dims['slots']==7 and dims['actions']==['ステータス','能力値','スキル','修練'] and dims['members']==0 and dims['noTabs'] and dims['noPicker'],'measurements':dims})
   else:
    dims=await page.evaluate("""()=>{const app=document.querySelector('#app'),screen=document.querySelector('#screen'),overlay=screen.querySelector('.facility-world-overlay'),guest=screen.querySelector('.facility-world-guests img'),npc=screen.querySelector('.facility-world-npc');return {wide:screen.scrollWidth>screen.clientWidth+1,scroll:screen.scrollHeight-screen.clientHeight,world:app.classList.contains('inn-world'),guest:!!guest,npc:!!npc,overlay:!!overlay&&overlay.getBoundingClientRect().bottom<=screen.getBoundingClientRect().bottom+1,modal:document.querySelector('#modal').classList.contains('on')}}""")
    results.append({'name':f'UI47 inn dialogue layout {width}x{height} {action}','ok':not dims['wide'] and dims['scroll']<=1 and dims['world'] and dims['guest'] and dims['npc'] and dims['overlay'] and not dims['modal'],'measurements':dims})
  for selector in ['conversation()','npcMenu()']:
   await page.evaluate(selector)
   dims=await page.evaluate("""()=>{const screen=document.querySelector('#screen'),overlay=screen.querySelector('.facility-world-overlay'),cards=[...overlay.querySelectorAll('.person-select-card')];return {scroll:overlay.scrollHeight-overlay.clientHeight,cards:cards.length,wide:overlay.scrollWidth>overlay.clientWidth+1,images:cards.filter(x=>x.querySelector('img')).length,world:document.querySelector('#app').classList.contains('inn-world')}}""")
   results.append({'name':f'UI47 inn people selector fits {width}x{height} {selector}','ok':not dims['wide'] and dims['cards']>=6 and dims['images']>=6 and dims['world'],'measurements':dims})
  for tab in ['formation','members','destination']:
   await page.evaluate(f"partyMenu('{tab}')")
   dims=await page.evaluate("""()=>{const body=document.querySelector('#panel .panel-body');return {scroll:body.scrollHeight-body.clientHeight,wide:body.scrollWidth>body.clientWidth+1,fixed:body.classList.contains('sortie-page'),tabs:[...document.querySelectorAll('#panel>.panel-footer>.sortie-tabs button')].map(x=>x.textContent.trim())}}""")
   results.append({'name':f'UI21 sortie tab fits {width}x{height} {tab}','ok':(tab=='destination' or dims['scroll']<=1) and not dims['wide'] and dims['fixed'] and dims['tabs']==['編成','陣形','ダンジョン'],'measurements':dims})
  for facility in ['inn()','guild()','market()']:
   await page.evaluate(facility)
   expected=4
   dims=await page.evaluate("""()=>{const s=document.querySelector('#screen'),app=document.querySelector('#app'),npc=s.querySelector('.facility-world-npc'),overlay=s.querySelector('.facility-world-home'),cards=document.querySelectorAll('#party .m'),nav=document.querySelector('.hub-global-nav');return {scroll:s.scrollHeight-s.clientHeight,wide:document.documentElement.scrollWidth>innerWidth,stand:!!npc,choices:overlay?.querySelectorAll('button.row').length||0,labels:[...(overlay?.querySelectorAll('button.row b')||[])].map(x=>x.textContent.trim()),cards:cards.length,nav:!!nav,world:app.classList.contains('facility-world'),kind:app.dataset.facility||'',bg:getComputedStyle(app).backgroundImage}}""")
   kind={'inn()':'inn','guild()':'guild','market()':'market'}[facility]
   results.append({'name':f'UI46 fixed {kind} world fits {width}x{height}','ok':dims['scroll']<=1 and not dims['wide'] and dims['stand'] and dims['choices']==expected and dims['cards']==6 and dims['nav'] and dims['world'] and dims['kind']==kind and f'hub-{kind}-bg' in dims['bg'],'measurements':dims})
   before=await page.evaluate("""()=>{const n=document.querySelector('.facility-world-npc').getBoundingClientRect(),s=document.querySelector('#screen').getBoundingClientRect();return {npc:{x:n.x,y:n.y,width:n.width,height:n.height},screen:{x:s.x,y:s.y,width:s.width,height:s.height}}}""")
   await page.evaluate("""()=>document.querySelector('[data-hub="uiFacilityTalk"]').click()""")
   after=await page.evaluate("""()=>{const n=document.querySelector('.facility-world-npc').getBoundingClientRect(),s=document.querySelector('#screen').getBoundingClientRect();return {npc:{x:n.x,y:n.y,width:n.width,height:n.height},screen:{x:s.x,y:s.y,width:s.width,height:s.height}}}""")
   results.append({'name':f'UI46 {kind} NPC remains fixed {width}x{height}','ok':before==after,'measurements':{'before':before,'after':after}})
 await page.evaluate('base=>{installSave(base);closeM();town()}',baseline)
 await page.set_viewport_size({'width':390,'height':844})
 return results
async def audit_nonbattle(page):
 results=[]
 baseline=await page.evaluate('collectSave()')
 routes=[('home','town()'),('inn','inn()'),('guild','guild()'),('market','market()'),('inn command','inn();roomMenu()'),('guild command','guild();guildDesk()'),('market command','market();toolShop()'),('composition',"partyMenu('composition')"),('formation',"partyMenu('formation')"),('dungeon',"partyMenu('dungeon')"),('sortie from inn',"inn();partyMenu('dungeon')"),('presets','presetMenu()'),('status','statusView(0)'),('attributes','actorAttributes(0)'),('skills','skills(0)'),('mastery','mastery(0)'),('equipment','equip(0)'),('items','items()'),('records','records()'),('settings','settings()')]
 for width,height in [(320,568),(390,844),(430,932),(768,1024)]:
  await page.set_viewport_size({'width':width,'height':height})
  for label,action in routes:
   await page.evaluate('base=>{installSave(base);H.run=null;closeM();town()}',baseline)
   await page.evaluate(action)
   if label in ('status','attributes','skills','mastery','equipment'):
    await page.wait_for_function("document.querySelector('#panel .actor-backdrop img')?.complete")
   dims=await page.evaluate("""()=>{const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}};const app=document.querySelector('#app'),screen=document.querySelector('#screen'),modal=document.querySelector('#modal'),panel=document.querySelector('#panel'),body=panel?.querySelector('.panel-body'),party=document.querySelector('#party'),nav=document.querySelector('.hub-global-nav'),footer=panel?.querySelector('.panel-footer'),dialogue=screen.querySelector('.facility-world-dialogue'),service=screen.querySelector('.facility-world-service');return {wide:document.documentElement.scrollWidth>innerWidth+1,screenWide:screen.scrollWidth>screen.clientWidth+1,bodyWide:body?body.scrollWidth>body.clientWidth+1:false,modal:modal.classList.contains('on'),facility:app.classList.contains('facility-world'),panel:rect(panel),body:rect(body),footer:rect(footer),party:rect(party),nav:rect(nav),dialogue:rect(dialogue),service:rect(service),head:rect(panel?.querySelector('.panel-head')),backdrop:getComputedStyle(modal).backgroundImage,blur:getComputedStyle(modal).backdropFilter}}""")
   # Full-body character art can extend outside its scroll container while the page remains clipped.
   fit=not dims['wide'] and not dims['screenWide'] and not dims['bodyWide']
   if dims['modal']:
    fit=fit and dims['panel']['top']>=0 and dims['panel']['bottom']<=dims['party']['top']+1 and (not dims['footer'] or dims['footer']['bottom']<=dims['party']['top']+1)
   if dims['facility'] and dims['service']:
    fit=fit and dims['service']['bottom']<=dims['dialogue']['top'] and dims['dialogue']['bottom']<=dims['party']['top']+1
   results.append({'name':f'Nonbattle UI {label} {width}x{height}','ok':fit,'measurements':dims})
   if (width==390 and label in ('inn','inn command','composition','formation','dungeon','sortie from inn','presets','equipment','status','skills','mastery')) or (width==320 and label in ('composition','formation','dungeon')):
    await page.screenshot(path=str(ROOT/f'hub-audit-{label.replace(" ", "-")}-{width}.png'))
   if label in ('composition','formation','dungeon','sortie from inn'):
    tab=await page.evaluate("""()=>{const t=document.querySelector('#panel>.panel-footer>.sortie-tabs');const buttons=[...(t?.querySelectorAll('button')||[])],labels=buttons.map(x=>x.textContent.trim());const f=t?.getBoundingClientRect(),b=document.querySelector('#party').getBoundingClientRect(),m=document.querySelector('#modal').getBoundingClientRect(),bg=getComputedStyle(document.querySelector('#modal'));return {labels,footer:!!t,bottom:f?.bottom,party:b.top,modalTop:m.top,background:bg.backgroundImage,backgroundColor:bg.backgroundColor,tabsFramed:getComputedStyle(t).columnGap==='5px'&&buttons.every(x=>{const s=getComputedStyle(x);return s.borderRadius==='9px'&&s.backgroundColor==='rgba(12, 25, 19, 0.52)'&&Math.round(x.getBoundingClientRect().height)===(innerHeight<=640?44:49)}),activeUnderline:buttons.filter(x=>x.getAttribute('aria-pressed')==='true'&&getComputedStyle(x).borderBottomColor!=='rgba(0, 0, 0, 0)').length===1}}""")
    ok=tab['footer'] and tab['labels']==['編成','陣形','ダンジョン'] and tab['bottom']<=tab['party']+1 and 'hub-' in tab['background'] and tab['backgroundColor']=='rgba(0, 0, 0, 0)' and tab['tabsFramed'] and tab['activeUnderline']
    results.append({'name':f'Nonbattle sortie tabs/background {label} {width}x{height}','ok':ok,'measurements':tab})
   if label in ('composition','formation'):
    portraits=await page.evaluate(r"""async()=>{const cards=[...document.querySelectorAll('#panel .sortie-member-face img,#panel .formation-pick img')];const boxes=cards.map(x=>x.closest('.sortie-member,.formation-member'));const taps=[...document.querySelectorAll('#panel .sortie-member-action,#panel .formation-config,#panel .sortie-preset-link,#panel .sortie-tabs button')];await Promise.all(cards.map(i=>i.decode().catch(()=>{})));return {count:cards.length,cutouts:cards.map(i=>{const c=document.createElement('canvas');c.width=c.height=1;const g=c.getContext('2d');g.drawImage(i,0,0);return /hub-standing-(?:[^/]*-clean|paladin-transparent)\.webp/.test(i.src)&&i.naturalWidth>=640&&g.getImageData(0,0,1,1).data[3]<16}),geometry:boxes.every(b=>{const r=b.getBoundingClientRect(),p=b.querySelector('img').getBoundingClientRect();return p.width>=r.width-2&&p.height>=40&&r.left>=0&&r.right<=innerWidth+1}),tapSizes:taps.map(x=>Math.round(x.getBoundingClientRect().height))}}""")
    results.append({'name':f'Nonbattle sortie art and touch {label} {width}x{height}','ok':portraits['count']==6 and all(portraits['cutouts']) and portraits['geometry'] and all(x>=44 for x in portraits['tapSizes']),'measurements':portraits})
   if label=='composition' and width==390:
    flow=await page.evaluate("""()=>{const initial=H.formation.filter(x=>x!==null).length;document.querySelector('[data-hub="uiRosterBench"]').click();const benched=H.formation.filter(x=>x!==null).length;document.querySelector('[data-hub="uiRosterDeploy"]').click();const restored=H.formation.filter(x=>x!==null).length;partyMenu('formation');document.querySelector('.formation-pick').click();const opened=HUB_UI.state.route?.name;document.querySelector('.hub-global-nav [data-nav="back"]').click();return {initial,benched,restored,opened,returned:HUB_UI.state.route?.name,tab:HUB_UI.state.sortie}}""")
    results.append({'name':'Nonbattle sortie composition and portrait return','ok':flow=={'initial':6,'benched':5,'restored':6,'opened':'character','returned':'partyMenu','tab':'formation'},'measurements':flow})
 await page.set_viewport_size({'width':390,'height':844})
 await page.evaluate('base=>{installSave(base);closeM();town()}',baseline)
 return results
async def main():
 if not OFFLINE:
  class Handler(http.server.SimpleHTTPRequestHandler):
   def __init__(self,*args,**kw):super().__init__(*args,directory=str(ROOT),**kw)
   def log_message(self,*args):pass
  server=http.server.ThreadingHTTPServer(('127.0.0.1',8139),Handler)
  threading.Thread(target=server.serve_forever,daemon=True).start()
 out=[];balance_report=None
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH'),headless=True,args=['--no-sandbox'])
  for hub in [True,False]:
   page=await browser.new_page(viewport={'width':390,'height':844})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await load(page,hub)
   case='hub' if hub else 'battle'
   out.extend(await page.evaluate((ROOT/'tests'/f'{case}-regression.js').read_text()))
   if hub:
    out.extend(await page.evaluate((ROOT/'tests/ui-regression.js').read_text()))
    out.extend(await page.evaluate((ROOT/'tests/visual-regression.js').read_text()))
    out.extend(await layouts(page))
    out.extend(await audit_nonbattle(page))
    for w,h in [(320,568),(390,844),(430,932)]:
     await page.set_viewport_size({'width':w,'height':h})
     out.extend(await page.evaluate((ROOT/'tests/touch-audit.js').read_text()))
    if not OFFLINE:
     await page.evaluate('conversation()')
     loaded=await page.evaluate("""async()=>{const images=[...document.querySelectorAll('#party img,#panel img,#screen img')];await Promise.all(images.map(i=>i.decode().catch(()=>{})));return images.length>0&&images.every(i=>i.naturalWidth>0)}""")
     out.append({'name':'UI17 existing portrait assets load on HTTP origin','ok':loaded})
     stands=await page.evaluate("""async()=>{const src=[...Object.values(HUB_VISUAL.npcStand||{})];const images=src.map(s=>{const i=new Image();i.src=s;return i});await Promise.all(images.map(i=>i.decode().catch(()=>{})));return src.length===6&&images.every(i=>i.naturalWidth>0&&i.naturalHeight>0)}""")
     out.append({'name':'UI17 six NPC standing assets load on HTTP origin','ok':stands})
   if not hub:
    balance_report=await page.evaluate((ROOT/'tests/balance-diagnostic.js').read_text())
    await page.evaluate('window.__test.context(null);window.__test.openSheet()')
    await page.wait_for_selector('.touch-dialog-footer')
    dims=await page.evaluate("""()=>{const d=document.querySelector('#choiceSheet'),b=d.querySelector('.touch-dialog-footer button'),r=d.getBoundingClientRect(),f=b.getBoundingClientRect();return {fit:r.bottom<=innerHeight+1&&r.top>=0,bottom:f.bottom<=innerHeight&&f.top>innerHeight-100,height:f.height}}""")
    out.append({'name':'Battle sheet bottom navigation','ok':dims['fit'] and dims['bottom'] and dims['height']>=44,'measurements':dims})
   out.append({'name':case+' runtime console errors' ,'ok':not errors,'errors':errors})
   await page.close()
  if not OFFLINE:
   slot=await browser.new_page(viewport={'width':390,'height':844})
   await slot.add_init_script('window.__RPG_TEST__=true')
   await slot.goto('http://127.0.0.1:8139/exploration/?demo=hub',wait_until='load')
   probe=await slot.evaluate("""()=>{const runs=Array.from({length:40},()=>makeRun('古代迷宮',['森林','洞窟','廃墟都市']));const floors=runs.flatMap(r=>r.floors);const field=fieldDb();return {sizes:floors.map(f=>f.nodes.length),tags:floors.flatMap(f=>f.nodes.map(n=>(n.fieldTags||[]).length)),edges:floors.map(f=>(f.fieldEdges||[]).length),edgeValid:floors.every(f=>(f.fieldEdges||[]).every(e=>f.nodes.some(n=>n.id===e.from)&&f.nodes.some(n=>n.id===e.to)&&!f.nodes.find(n=>n.id===e.from).links.includes(e.to))),fieldCount:Object.keys(field.skills||{}).length,crossMastery:field.skills?.['鉱脈探知']?.mastery,tpLow:tacticalCost('鉱脈探知'),tpHigh:tacticalCost('水の導き')}}""")
   out.append({'name':'Exploration Field schema invariants','ok':all(10<=n<=12 for n in probe['sizes']) and all(0<=n<=2 for n in probe['tags']) and all(0<=n<=1 for n in probe['edges']) and probe['edgeValid'] and probe['fieldCount']==25 and probe['crossMastery']=='霊峰' and probe['tpLow']==1 and probe['tpHigh']==2,'measurements':probe})
   routegate=await slot.evaluate("""()=>{const saved=H.run;let r=null,fi=-1,e=null;for(let k=0;k<100&&!e;k++){const q=makeRun('古代迷宮',['森林','洞窟','廃墟都市']);for(let i=0;i<q.floors.length;i++){if(q.floors[i].fieldEdges?.length){r=q;fi=i;e=q.floors[i].fieldEdges[0];break}}}if(!e)return {found:false};H.run=r;H.run.floor=fi+1;const n=r.floors[fi].nodes.find(x=>x.id===e.from),right={name:e.skill,sourceName:e.skill,def:fieldDef(e.skill)},wrong=Object.values(fieldDb().skills).find(d=>d.name!==e.skill&&d.fieldTags.includes(e.tag));const out={found:true,edge:e.skill,tag:e.tag,right:!!fieldSkillEdge(right,n),wrong:wrong?!!fieldSkillEdge({name:wrong.name,sourceName:wrong.name,def:wrong},n):false,wrongName:wrong?.name||null,normalLink:n.links.includes(e.to)};H.run=saved;return out}""")
   out.append({'name':'Conditional route requires its exact Field Skill','ok':routegate['found'] and routegate['right'] and not routegate['wrong'] and not routegate['normalLink'],'measurements':routegate})
   migration=await slot.evaluate("""()=>{const blank=()=>[[],[],[],[],[],[]];const d={fieldSkillCatalogVersion:0,learned:blank(),skillSet:blank(),learnedTree:blank(),legacySkills:blank(),hub:{presets:[]}};d.learned[0]=['解錠','強敵察知'];d.skillSet[1]=['素材鑑定'];d.learnedTree[2]=['隠し道発見'];d.legacySkills[3]=['探索極意'];const x=migrateFieldSkills437(d);return {version:x.fieldSkillCatalogVersion,learned:x.learned[0],set:x.skillSet[1],tree:x.learnedTree[2],legacy:x.legacySkills[3]}}""")
   out.append({'name':'Legacy Field Skill save names migrate to canonical 437 names','ok':migration['version']==437 and migration['learned']==['宝箱解錠'] and migration['set']==['素材見極め'] and migration['tree']==['宝箱探知'] and migration['legacy']==['魔物知識'],'measurements':migration})
   skillmig=await slot.evaluate("""()=>{const blank=()=>[[],[],[],[],[],[]],aliases=Object.entries(RPG_SKILLS_437.aliases||{}),pair=aliases.find(([a,b])=>a!==b);const d={skillCatalogVersion:315,masteryPt:[0,0,0,0,0,0],learned:blank(),skillSet:blank(),learnedTree:blank(),legacySkills:blank(),hub:{presets:[],run:null}};d.learned[0]=['重打','強敵察知'];if(pair)d.learned[1]=[pair[0]];const x=migrateSkillCatalog437(d);return {version:x.skillCatalogVersion,kept:x.learned[0],legacy:x.legacySkills[0],refund:x.masteryPt[0],pair,renamed:pair?x.learned[1][0]:null}}""")
   out.append({'name':'315 save skills migrate by stable alias and refund removed skills','ok':skillmig['version']==437 and '重打' in skillmig['kept'] and '強敵察知' not in skillmig['kept'] and '強敵察知' in skillmig['legacy'] and skillmig['refund']==1 and (skillmig['pair'] is None or skillmig['renamed']==skillmig['pair'][1]),'measurements':skillmig})
   original=await slot.evaluate('gold')
   await slot.evaluate('()=>{gold=98765;persist()}')
   async with slot.expect_navigation():await slot.evaluate('switchSaveSlot(2)')
   second=await slot.evaluate('({slot:hubSlot,gold,save:HUB_SAVE})')
   await slot.evaluate('()=>{gold=3333;persist()}')
   async with slot.expect_navigation():await slot.evaluate('switchSaveSlot(1)')
   first=await slot.evaluate('({slot:hubSlot,gold,save:HUB_SAVE})')
   out.append({'name':'Two isolated hub save slots survive switching and reload','ok':second['slot']==2 and second['gold']==original and second['save'].endswith('save2') and first['slot']==1 and first['gold']==98765 and first['save'].endswith('save1'),'measurements':{'first':first,'second':second}})
   await slot.evaluate("()=>{skillSet[0]=['重打'];persist()}")
   async with slot.expect_navigation():await slot.evaluate("""()=>{startDungeon();routeNode(0);Math.random=()=>.999999;battleDemo()}""")
   await slot.wait_for_load_state('load')
   await slot.wait_for_function('!!window.__test')
   await slot.wait_for_timeout(50)
   bridge=await slot.evaluate("""()=>{const war=window.__test.units.party.find(u=>u.id==='war'),snap=RPGDemo.snapshot(),ctx=JSON.parse(RPG_STORE.getItem('rpg.exploreBattle')||'null');return {demo:new URLSearchParams(location.search).get('demo'),ctx,active:!!window.__test,slot:RPG_STORE.getItem('rpg.exploration.activeSlot'),fieldSkill:window.RPG_RULES?.meta?.('鉱脈探知')?.id||null,skills:war?.skills?.map(s=>s.name)||[],weapon:war?.weapon?.name||null,cells:(snap.battlefield?.cells?.enemy?.length||0)+(snap.battlefield?.cells?.ally?.length||0),prep:snap.prepMode,prepOpen:document.querySelector('#formationSheet')?.open||false,terrainCells:document.querySelectorAll('.stage-cell[data-tile]').length,terrainLabel:document.querySelector('#terrainEffect')?.textContent||''}}""")
   out.append({'name':'Hub preview carries canonical equipment, 18-cell terrain and prep into battle-v44','ok':bridge['demo']=='hub' and bridge['ctx'] is not None and bridge['ctx']['battleType']=='normal' and bridge['active'] and bridge['slot'] in (None,'1') and bridge['fieldSkill']=='SK0334' and '重打' in bridge['skills'] and bridge['weapon']=='戦槌' and bridge['cells']==18 and bridge['prep'] and bridge['prepOpen'] and bridge['terrainCells']==18 and bool(bridge['terrainLabel']),'measurements':bridge})
   prep=await slot.evaluate("""()=>{const before=RPGDemo.snapshot(),war=before.party.find(u=>u.id==='war');RPGDemo.selectActorUI('war');RPGDemo.moveActorUI('rear',3);const moved=RPGDemo.snapshot(),w=moved.party.find(u=>u.id==='war'),idx=RPG_TERRAIN.cellIndex('ally',w.rank,w.col);RPG_TERRAIN.setTempTile(window.__test.battlefield,'ally',idx,'TL20',2);window.__test.render();RPGDemo.startPreparedBattle();const after=RPGDemo.snapshot(),saved=JSON.parse(RPG_STORE.getItem('rpg.exploreBattle')||'null');return {before:war,afterMove:w,queued:moved.party.find(u=>u.id==='war').queued,prepAfter:after.prepMode,commandOpen:after.commandOpen,temp:saved?.battlefield?.cells?.ally?.[idx]?.tempTile,remaining:saved?.battlefield?.cells?.ally?.[idx]?.tempRemaining}}""")
   out.append({'name':'Prebattle redeployment is free and battlefield temp state persists','ok':prep['afterMove']['rank']=='rear' and prep['afterMove']['col']==3 and prep['queued'] is None and not prep['prepAfter'] and prep['commandOpen'] and prep['temp']=='TL20' and prep['remaining']==2,'measurements':prep})
   terrainfx=await slot.evaluate("""()=>{const u=window.__test.units.party.find(x=>x.id==='war'),t=window.__test.units.enemies[0],b=window.__test.battlefield,ui=RPG_TERRAIN.cellIndex('ally',u.rank,u.gridCol),ei=RPG_TERRAIN.cellIndex('enemy',t.row,t.gridCol);b.cells.ally[ui].baseTile='TL09';b.cells.ally[ui].tempTile=null;b.cells.enemy[ei].baseTile='TL00';b.conditionTerrain=null;const act={kind:'attack',range:'far',attr:'火',stat:'SKL'},hit=window.__test.terrainHitBonus(u,t,act);b.cells.ally[ui].baseTile='TL00';b.conditionTerrain='TR18';const damage=window.__test.terrainDamageMod(u,t,act);return {hit,damage,heal:(()=>{b.conditionTerrain='TR19';return window.__test.terrainHealMod(u,u,{})})(),moveLimit:(()=>{b.conditionTerrain=null;b.cells.ally[ui].baseTile='TL05';return window.__test.terrainMoveLimit(u)})()}}""")
   out.append({'name':'Battle-v44 applies canonical terrain hit damage healing and move limits','ok':terrainfx['hit']>=10 and terrainfx['damage']<=0 and terrainfx['heal']==-0.15 and terrainfx['moveLimit']==1,'measurements':terrainfx})
   cover=await slot.evaluate("""()=>{const u=window.__test.units.party[0],t=window.__test.units.enemies[0],b=window.__test.battlefield,ui=RPG_TERRAIN.cellIndex('ally',u.rank,u.gridCol),ei=RPG_TERRAIN.cellIndex('enemy',t.row,t.gridCol);b.conditionTerrain=null;b.cells.ally[ui].baseTile='TL09';b.cells.enemy[ei].baseTile='TL09';const highSame=window.__test.terrainHitBonus(u,t,{kind:'attack',range:'mid',scope:'single',attr:'突'});b.cells.enemy[ei].baseTile='TL08';b.cells.ally[ui].baseTile='TL00';const linear=window.__test.terrainHitBonus(u,t,{kind:'attack',range:'mid',scope:'single',attr:'突'}),area=window.__test.terrainHitBonus(u,t,{kind:'attack',range:'mid',scope:'row',attr:'突'});return {highSame,linear,area}}""")
   out.append({'name':'High ground requires lower target and cover ignores area attacks','ok':cover['highSame']==0 and cover['linear']==-20 and cover['area']==0,'measurements':cover})
   movement=await slot.evaluate("""async()=>{const T=RPG_TERRAIN,b=window.__test.battlefield,t=window.__test.units.enemies[0];t.row='back';t.gridCol=1;const ix=T.cellIndex('enemy','back',1),cell=b.cells.enemy[ix];cell.baseTile='TL10';cell.tempTile=null;cell.tempRemaining=0;cell.hazardDir='back';b.conditionTerrain=null;const hp=t.hp,max=t.maxHp,previewEdge=window.__test.forcedMovePreview(t,'back',1);await window.__test.testTerrainForceMove(t,'back',1);const lost=hp-t.hp;cell.baseTile='TL10';cell.hazardDir='back';T.setTempTile(b,'enemy',ix,'TL20',2);const merged=T.tileEffect(cell),basePreserved=cell.baseTile==='TL10'&&cell.tempTile==='TL20'&&cell.hazardDir==='back';cell.tempTile='TL21';cell.tempRemaining=2;const waterClear=window.__test.resolveTempTileAfterHit(t,{attr:'水'}),waterBase=cell.baseTile;cell.tempTile='TL20';cell.tempRemaining=2;const fireClear=window.__test.resolveTempTileAfterHit(t,{attr:'火'}),fireBase=cell.baseTile;t.row='front';const fi=T.cellIndex('enemy','front',1),fc=b.cells.enemy[fi];fc.baseTile='TL15';fc.tempTile=null;fc.tempRemaining=0;b.conditionTerrain='TR17';b.windDir='back';const previewClamp=window.__test.forcedMovePreview(t,'back',1);return {lost,expected:Math.floor(max*.15),previewEdge,basePreserved,mergedForced:merged.forcedDelta,waterClear,waterBase,fireClear,fireBase,previewClamp}}""")
   out.append({'name':'Forced movement, hazard edge and overlays follow canonical terrain rules','ok':movement['lost']==movement['expected'] and '危険縁 15%' in movement['previewEdge'] and movement['basePreserved'] and movement['mergedForced']==1 and movement['waterClear'] and movement['waterBase']=='TL10' and movement['fireClear'] and movement['fireBase']=='TL10' and 'BACK' in movement['previewClamp'] and '氷面 +1' in movement['previewClamp'] and '強風 +1' in movement['previewClamp'],'measurements':movement})
   await slot.close()
   flow=await browser.new_page(viewport={'width':390,'height':844})
   await flow.add_init_script('window.__RPG_TEST__=true')
   await flow.goto('http://127.0.0.1:8139/exploration/?demo=hub',wait_until='load')
   defeat=await flow.evaluate("""()=>{const beforeLoot=loot.結晶||0,beforeExp=H.experience||0;H.run=makeRun('古代迷宮',['森林','洞窟','廃墟都市']);H.run.pendingExp=40;grant({materials:{結晶:2}});H.run.tp=5;H.run.temporarySkills[0]=['鉱脈探知'];skillSet[0]=[...new Set(skillSet[0].concat('鉱脈探知'))];vitals[0].hp=Math.max(1,vitals[0].hp-7);vitals[0].status.poison=2;const hp=vitals[0].hp;finalizeExpedition('敗北');return {active:!!H.run,beforeLoot,loot:loot.結晶,beforeExp,exp:H.experience||0,hp,hpAfter:vitals[0].hp,poison:vitals[0].status.poison||0,tempStillSet:skillSet[0].includes('鉱脈探知'),unapp:H.unappraised.materials.結晶||0,result:lastExpedition.result}}""")
   out.append({'name':'Defeat retains expedition rewards and clears temporary TP skills','ok':not defeat['active'] and defeat['loot']==defeat['beforeLoot']+2 and defeat['exp']==defeat['beforeExp']+40 and defeat['hpAfter']==defeat['hp'] and defeat['poison']==2 and not defeat['tempStillSet'] and defeat['unapp']>=2 and defeat['result']=='敗北','measurements':defeat})
   await flow.close()
   layers=await browser.new_page(viewport={'width':390,'height':844})
   await layers.add_init_script('window.__RPG_TEST__=true')
   await layers.goto('http://127.0.0.1:8139/exploration/?demo=hub',wait_until='load')
   layerflow=await layers.evaluate("""()=>{H.run=makeRun('古代迷宮',['森林','洞窟','廃墟都市']);const checks=[];for(let floor=1;floor<=3;floor++){const r=H.run,f=r.floors[r.floor-1],boss=f.nodes.find(n=>n.type==='boss');r.pending=boss.id;const id='test-boss-'+floor;r.battle={id,node:boss.id,floor:r.floor};vitals.forEach(v=>{if(v.hp>0){v.hp=1;v.sp=0;v.status.poison=2;v.statusPower.poison=1}});const result={schema:6,resourceVersion:2,battleId:id,hubRunId:r.id,hubNodeId:boss.id,result:'win',vitals:vitals.map(v=>({...v,status:{...v.status},statusPower:{...v.statusPower}}))};RPG_STORE.setItem('rpg.exploreBattle',JSON.stringify(result));resumeBattle();if(floor<3){const healed=vitals.every((v,i)=>v.hp===rules().derived(stats[i]).hp&&v.sp===rules().derived(stats[i]).sp&&!v.status.poison);checks.push({floor,healed,phase:H.run?.phase,current:H.run?.floor});nextFloor();checks[checks.length-1].next=H.run?.floor}else checks.push({floor,finished:!H.run,result:lastExpedition.result})}return checks}""")
   out.append({'name':'Three-layer boss bridge completes expedition with inter-floor full recovery','ok':len(layerflow)==3 and layerflow[0]['healed'] and layerflow[0]['phase']=='floorCleared' and layerflow[0]['next']==2 and layerflow[1]['healed'] and layerflow[1]['phase']=='floorCleared' and layerflow[1]['next']==3 and layerflow[2]['finished'] and layerflow[2]['result']=='踏破','measurements':layerflow})
   await layers.close()
  modern=await browser.new_page(viewport={'width':390,'height':844})
  await modern.add_init_script('window.__RPG_TEST__=true')
  await modern.goto('http://127.0.0.1:8139/play-v98.html',wait_until='load')
  await modern.wait_for_function('!!window.__test')
  for w,h in [(320,568),(390,844),(430,932)]:
   await modern.set_viewport_size({'width':w,'height':h})
   await modern.evaluate("window.__test.fresh();window.__test.selectActor('arc')")
   dims=await modern.evaluate("""()=>{const panel=document.querySelector('#commandPanel'),close=document.querySelector('#closeCommand'),commands=[...panel.querySelectorAll('.command-buttons button')],r=panel.getBoundingClientRect(),c=close.getBoundingClientRect();return {fit:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth,bottom:c.top>=Math.max(...commands.map(b=>b.getBoundingClientRect().bottom))-1,touch:commands.every(b=>b.getBoundingClientRect().width>=44&&b.getBoundingClientRect().height>=44)}}""")
   out.append({'name':f'Modern battle command touch layout {w}x{h}','ok':all(dims.values()),'measurements':dims})
   for mode in ['skills','formation','members','more','terrain']:
    await modern.evaluate('(mode)=>window.__test.openSheet(mode)',mode)
    dims=await modern.evaluate("""()=>{const d=document.querySelector('#choiceSheet'),f=d.querySelector('.touch-dialog-footer'),b=d.querySelector('.touch-dialog-body'),r=d.getBoundingClientRect(),fr=f.getBoundingClientRect();return {fit:r.top>=0&&r.bottom<=innerHeight+1,bottom:fr.bottom<=innerHeight+1&&fr.top>=innerHeight-100,noOverflow:b.scrollWidth<=b.clientWidth+1}}""")
    out.append({'name':f'Modern battle sheet {mode} {w}x{h}','ok':all(dims.values()),'measurements':dims})
    await modern.click('#closeSheet')
  await modern.evaluate("window.__test.fresh();window.__test.selectActor('arc');window.__test.openSheet('skills')")
  await modern.wait_for_function("document.querySelector('#sheetHint').textContent.includes('光る対象')")
  await modern.click('.skill-choice >> nth=0')
  dims=await modern.evaluate("""()=>({closed:!document.querySelector('#choiceSheet').open,cancelVisible:document.querySelector('#cancelTarget').getBoundingClientRect().height>=44})""")
  out.append({'name':'Skill selection reveals battlefield and reachable cancel','ok':all(dims.values()),'measurements':dims})
  await modern.click('#cancelTarget')
  out.append({'name':'Skill target cancel spends no SP','ok':await modern.evaluate("window.__test.units.party[4].sp===window.__test.units.party[4].maxSp")})
  await modern.close()
  await browser.close()
 (ROOT/'test-results.json').write_text(json.dumps({'mode':'offline DOM/Storage adapter' if OFFLINE else 'native Chromium HTTP','tests':out},ensure_ascii=False,indent=2))
 if balance_report is not None:
  (ROOT/'balance-results.json').write_text(json.dumps(balance_report,ensure_ascii=False,indent=2))
  print('BALANCE_JSON '+json.dumps(balance_report,ensure_ascii=False,separators=(',',':')))
 for r in out:
  print(('PASS' if r['ok'] else 'FAIL')+' '+r['name'])
  if not r['ok']:print(r.get('error',r.get('errors',r.get('measurements'))))
 print(f'{sum(r["ok"] for r in out)}/{len(out)} passed')
 if any(not r['ok'] for r in out):raise SystemExit(1)
if __name__=='__main__':asyncio.run(main())
