"""Run the full combat audit in the browser engine with deterministic encounter seeds."""
import asyncio, json, pathlib, threading, http.server
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]

async def main():
 class Handler(http.server.SimpleHTTPRequestHandler):
  def __init__(self,*args,**kw): super().__init__(*args,directory=str(ROOT),**kw)
  def log_message(self,*args): pass
 server=http.server.ThreadingHTTPServer(('127.0.0.1',8142),Handler)
 threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  await page.add_init_script('window.__RPG_TEST__=true')
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  await page.goto('http://127.0.0.1:8142/index.html',wait_until='load')
  await page.wait_for_function('!!window.__test')
  page.set_default_timeout(240000)
  report=await page.evaluate((ROOT/'tests/battle-audit.js').read_text())
  report['consoleErrors']=errors
  demo=await browser.new_page(viewport={'width':390,'height':844})
  await demo.add_init_script('window.__RPG_TEST__=true')
  await demo.goto('http://127.0.0.1:8142/battle-v44.html',wait_until='load')
  await demo.wait_for_function('!!window.__test',timeout=30000)
  report['battleV44']=await demo.evaluate('''() => ({
    catalogCount:Object.keys(window.RPG_RULES?.skills||{}).length,
    combatants:window.__test.units.party.length,
    selectableSkillNames:[...new Set(window.__test.units.party.flatMap(u=>u.skills.map(s=>s.name)))],
    activeSkillsOnParty:window.__test.units.party.reduce((n,u)=>n+u.skills.length,0)
  })''')
  field=await browser.new_page(viewport={'width':390,'height':844})
  await field.add_init_script('window.__RPG_TEST__=true')
  await field.goto('http://127.0.0.1:8142/exploration/index.html?demo=exploration&fresh=1',wait_until='load')
  floors=[]
  await field.evaluate('startDungeon()')
  await field.evaluate('closeM()')
  for layer in (1,2):
   await field.evaluate('''() => {closeM();H.run.floors[H.run.floor-1].open=[8];drawDungeon()}''')
   await field.locator('.map-node[data-args="[8]"]').click()
   floors.append(await field.evaluate('''() => ({floor:H.run.floor,theme:H.run.themes[H.run.floor-1],exit:!!document.querySelector('[data-hub="nextFloor"]'),map:!!document.querySelector('.expedition')})'''))
   await field.locator('[data-hub="nextFloor"]').click()
  floors.append(await field.evaluate('''() => ({floor:H.run.floor,theme:H.run.themes[H.run.floor-1],map:!!document.querySelector('.expedition')})'''))
  report['floorUiSmoke']=floors
  await field.screenshot(path=str(ROOT/'battle-audit-floor3.png'))
  await demo.screenshot(path=str(ROOT/'battle-audit-v44.png'))
  (ROOT/'battle-audit-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
  print('Catalog:',report['catalog'])
  print('Active errors:',[x for x in report['active'] if not x['executed']])
  print('No visible state change:',[x['name'] for x in report['active'] if x['executed'] and not x['changed']])
  print('Battles:',{k:sum(x['result']==k for x in report['battles']) for k in ('win','loss','unfinished')})
  print('Escape:',sum(x.get('success',False) for x in report['escapeTrials']),'/53')
  print('Battle v44:',report['battleV44'])
  print('Floor UI:',floors)
  print('Rounds:',[x['rounds'] for x in report['battles']])
  print('Errors:',errors)
  await browser.close()
 server.shutdown()

if __name__=='__main__': asyncio.run(main())
