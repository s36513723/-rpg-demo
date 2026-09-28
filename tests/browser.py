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
   dims=await page.evaluate("""()=>{const s=document.querySelector('#screen'),home=document.querySelector('.town-home'),party=document.querySelector('#party'),commands=[...document.querySelectorAll('.town-command-grid .place')];return {overflow:s.scrollHeight-s.clientHeight,wide:document.documentElement.scrollWidth>innerWidth,background:!!home&&getComputedStyle(home).backgroundImage.includes('town_lexia'),commands:commands.length,commandsVisible:commands.every(x=>x.getBoundingClientRect().bottom<=s.getBoundingClientRect().bottom),rosterLast:party.getBoundingClientRect().top>=s.getBoundingClientRect().bottom-1,noDirectSortie:!document.querySelector('.town-dungeon-strip,[data-hub="partyMenu"].town-dungeon-strip,.town-command-grid [data-hub="partyMenu"]'),noNav:!document.querySelector('#app nav')}}""")
   results.append({'name':f'UI25 viewport {width}x{height} alerts={alerts}','ok':dims['overflow']<=1 and not dims['wide'] and dims['background'] and dims['commands']==3 and dims['commandsVisible'] and dims['rosterLast'] and dims['noDirectSortie'] and dims['noNav'],'measurements':dims})
 for width,height in [(320,568),(375,667),(390,844),(430,932),(768,1024)]:
  await page.set_viewport_size({'width':width,'height':height})
  await page.evaluate('base=>{installSave(base);H.run=null;closeM();town()}',baseline)
  for action in ['memberTalk(0)','npcTalk("受付")','equip(0)']:
   await page.evaluate(action)
   dims=await page.evaluate("""()=>{const panel=document.querySelector('#panel'),body=panel.querySelector('.panel-body'),close=panel.querySelector('.modal-x');const pr=panel.getBoundingClientRect(),cr=close.getBoundingClientRect();return {wide:body.scrollWidth>body.clientWidth+1,scroll:body.scrollHeight-body.clientHeight,exit:cr.right<=innerWidth&&cr.top>=0,fit:pr.bottom<=innerHeight&&pr.top>=0,portrait:!!panel.querySelector('img,.role-emblem'),comparison:!!panel.querySelector('.fitting-summary .equip-compare'),stand:!!panel.querySelector('.npc-stand')}}""")
   npc=action.startswith('npcTalk')
   results.append({'name':f'UI17 dialogue/equipment layout {width}x{height} {action}','ok':not dims['wide'] and dims['exit'] and dims['fit'] and ((dims['portrait'] and dims['comparison']) if action=='equip(0)' else dims['portrait']) and (not npc or (dims['stand'] and dims['scroll']<=1)),'measurements':dims})
  for selector in ['conversation()','npcMenu()']:
   await page.evaluate(selector)
   dims=await page.evaluate("""()=>{const body=document.querySelector('#panel .panel-body'),cards=[...body.querySelectorAll('.person-select-card')],grid=body.querySelector('.people-select-grid');return {scroll:body.scrollHeight-body.clientHeight,cards:cards.length,wide:body.scrollWidth>body.clientWidth+1,same:body.classList.contains('people-select-page'),oneColumn:!!grid&&getComputedStyle(grid).gridTemplateColumns.split(' ').length===1,horizontal:cards.every(x=>x.getBoundingClientRect().width>x.getBoundingClientRect().height*3)}}""")
   results.append({'name':f'UI22 people selector fits {width}x{height} {selector}','ok':dims['scroll']<=1 and not dims['wide'] and dims['cards']>=6 and dims['same'] and dims['oneColumn'] and dims['horizontal'],'measurements':dims})
  for tab in ['formation','members','destination']:
   await page.evaluate(f"partyMenu('{tab}')")
   dims=await page.evaluate("""()=>{const body=document.querySelector('#panel .panel-body');return {scroll:body.scrollHeight-body.clientHeight,wide:body.scrollWidth>body.clientWidth+1,fixed:body.classList.contains('sortie-page'),tabs:document.querySelectorAll('#panel .bottom-tabs .ui-tabs button').length}}""")
   results.append({'name':f'UI21 sortie tab fits {width}x{height} {tab}','ok':dims['scroll']<=1 and not dims['wide'] and dims['fixed'] and dims['tabs']==3,'measurements':dims})
  for facility in ['inn()','guild()','market()']:
   await page.evaluate(facility)
   dims=await page.evaluate("""()=>{const body=document.querySelector('#panel .panel-body');return {scroll:body.scrollHeight-body.clientHeight,wide:body.scrollWidth>body.clientWidth+1,stand:!!body.querySelector('.facility-stand'),choices:body.querySelectorAll('.facility-action-deck button.row').length}}""")
   results.append({'name':f'UI19 facility fits {width}x{height} {facility}','ok':dims['scroll']<=1 and not dims['wide'] and dims['stand'] and dims['choices']==4,'measurements':dims})
   before=await page.evaluate("""()=>({stage:document.querySelector('.facility-stage').getBoundingClientRect().height,panel:document.querySelector('#panel').getBoundingClientRect().height,src:document.querySelector('.facility-stand').getAttribute('src')})""")
   await page.evaluate("""()=>document.querySelector('.facility-host').click()""")
   after=await page.evaluate("""()=>({stage:document.querySelector('.npc-stage').getBoundingClientRect().height,panel:document.querySelector('#panel').getBoundingClientRect().height,src:document.querySelector('.npc-stand').getAttribute('src')})""")
   results.append({'name':f'UI25 NPC talk balance {width}x{height} {facility}','ok':abs(before['stage']-after['stage'])<=1 and abs(before['panel']-after['panel'])<=1 and before['src']==after['src'] and '_stand.svg' in after['src'],'measurements':{'before':before,'after':after}})
 await page.evaluate('base=>{installSave(base);closeM();town()}',baseline)
 await page.set_viewport_size({'width':390,'height':844})
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
    for w,h in [(320,568),(390,844),(430,932)]:
     await page.set_viewport_size({'width':w,'height':h})
     out.extend(await page.evaluate((ROOT/'tests/touch-audit.js').read_text()))
    if not OFFLINE:
     await page.evaluate('conversation()')
     loaded=await page.evaluate("""async()=>{const images=[...document.querySelectorAll('#party img,#panel img')];await Promise.all(images.map(i=>i.decode().catch(()=>{})));return images.length>=12&&images.every(i=>i.naturalWidth>0)}""")
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
