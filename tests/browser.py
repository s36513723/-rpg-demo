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
   results.append({'name':f'UI21 sortie tab fits {width}x{height} {tab}','ok':dims['scroll']<=1 and not dims['wide'] and dims['fixed'] and dims['tabs']==['編成','陣形','ダンジョン'],'measurements':dims})
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
 routes=[('home','town()'),('inn','inn()'),('guild','guild()'),('market','market()'),('inn command','inn();roomMenu()'),('guild command','guild();guildDesk()'),('market command','market();toolShop()'),('composition',"partyMenu('composition')"),('formation',"partyMenu('formation')"),('dungeon',"partyMenu('dungeon')"),('presets','presetMenu()'),('status','statusView(0)'),('attributes','actorAttributes(0)'),('skills','skills(0)'),('mastery','mastery(0)'),('equipment','equip(0)'),('items','items()'),('records','records()'),('settings','settings()')]
 for width,height in [(320,568),(390,844),(430,932),(768,1024)]:
  await page.set_viewport_size({'width':width,'height':height})
  for label,action in routes:
   await page.evaluate('base=>{installSave(base);H.run=null;closeM();town()}',baseline)
   await page.evaluate(action)
   if label in ('status','attributes','skills','mastery','equipment'):
    await page.wait_for_function("document.querySelector('#panel .actor-backdrop img')?.complete")
   dims=await page.evaluate("""()=>{const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}};const app=document.querySelector('#app'),screen=document.querySelector('#screen'),modal=document.querySelector('#modal'),panel=document.querySelector('#panel'),body=panel?.querySelector('.panel-body'),party=document.querySelector('#party'),nav=document.querySelector('.hub-global-nav'),footer=panel?.querySelector('.panel-footer'),dialogue=screen.querySelector('.facility-world-dialogue'),service=screen.querySelector('.facility-world-service');return {wide:document.documentElement.scrollWidth>innerWidth+1,screenWide:screen.scrollWidth>screen.clientWidth+1,bodyWide:body?body.scrollWidth>body.clientWidth+1:false,modal:modal.classList.contains('on'),facility:app.classList.contains('facility-world'),panel:rect(panel),body:rect(body),footer:rect(footer),party:rect(party),nav:rect(nav),dialogue:rect(dialogue),service:rect(service),head:rect(panel?.querySelector('.panel-head')),backdrop:getComputedStyle(modal).backgroundImage,blur:getComputedStyle(modal).backdropFilter}}""")
   fit=not dims['wide'] and not dims['screenWide'] and not dims['bodyWide']
   if dims['modal']:
    fit=fit and dims['panel']['top']>=0 and dims['panel']['bottom']<=dims['party']['top']+1 and (not dims['footer'] or dims['footer']['bottom']<=dims['party']['top']+1)
   if dims['facility'] and dims['service']:
    fit=fit and dims['service']['bottom']<=dims['dialogue']['top'] and dims['dialogue']['bottom']<=dims['party']['top']+1
   results.append({'name':f'Nonbattle UI {label} {width}x{height}','ok':fit,'measurements':dims})
   if width==390 and label in ('inn','inn command','composition','formation','dungeon','presets','equipment','status','skills','mastery'):
    await page.screenshot(path=str(ROOT/f'hub-audit-{label.replace(" ", "-")}.png'))
   if label in ('composition','formation','dungeon'):
    tab=await page.evaluate("""()=>{const t=document.querySelector('#panel>.panel-footer>.sortie-tabs');const labels=[...(t?.querySelectorAll('button')||[])].map(x=>x.textContent.trim());const f=t?.getBoundingClientRect(),b=document.querySelector('#party').getBoundingClientRect(),m=document.querySelector('#modal').getBoundingClientRect();const bg=getComputedStyle(document.querySelector('#modal'));return {labels,footer:!!t,bottom:f?.bottom,party:b.top,modalTop:m.top,background:bg.backgroundImage,backgroundColor:bg.backgroundColor}}""")
    ok=tab['footer'] and tab['labels']==['編成','陣形','ダンジョン'] and tab['bottom']<=tab['party']+1 and 'hub-' in tab['background'] and tab['backgroundColor']!='rgba(0, 0, 0, 0)'
    results.append({'name':f'Nonbattle sortie tabs/background {label} {width}x{height}','ok':ok,'measurements':tab})
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
     loaded=await page.evaluate("""async()=>{const images=[...document.querySelectorAll('#party img,#panel img,#screen img')];await Promise.all(images.map(i=>i.decode().catch(()=>{})));return images.length>=12&&images.every(i=>i.naturalWidth>0)}""")
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
