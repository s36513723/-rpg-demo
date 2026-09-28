import asyncio,threading,http.server,pathlib,json
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**k): super().__init__(*a,directory=str(ROOT),**k)
 def log_message(self,*a): pass
async def main():
 server=http.server.ThreadingHTTPServer(('127.0.0.1',8140),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto('http://127.0.0.1:8140/play-plan-v12.html',wait_until='load');await page.wait_for_timeout(1100)
  data=await page.evaluate("""()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const board=q('#allies').getBoundingClientRect(),cmd=q('#commandPanel').getBoundingClientRect(),auto=q('#auto').getBoundingClientRect(),pace=q('#pace').getBoundingClientRect(),portrait=q('#actorArt').getBoundingClientRect();const meta=q('.round-meta');return {presentation:document.documentElement.dataset.presentation,cards:qa('.ally-unit').length,enemies:qa('.enemy-unit').length,order:qa('.order-face').length,active:q('.ally-unit.active')?.dataset.unitId||null,apiActive:window.RPGDemo?.snapshot()?.active||null,metaText:meta?.innerText.replace(/\s+/g,' ').trim(),terrainInside:meta?.contains(q('#terrainButton'))||false,rowLeft:Math.abs(auto.left-board.left)<2,rowRight:Math.abs(pace.right-board.right)<2,cmdBetween:Math.abs(cmd.left-auto.right)<3&&Math.abs(cmd.right-pace.left)<3,boardHeight:board.height,cmdHeight:cmd.height,portraitClear:portrait.right<=board.left+2,labels:['attack','skills','swap','defend'].map(id=>q('#'+id+' b')?.textContent.trim())}}""")
  ok=(not errors and data['cards']==6 and data['enemies']==6 and data['order']>0 and data['active'] and data['apiActive'] and data['terrainInside'] and '狭所' in data['metaText'] and data['rowLeft'] and data['rowRight'] and data['cmdBetween'] and data['boardHeight']<=86 and data['cmdHeight']<=28 and data['portraitClear'] and data['labels']==['ATTACK','SKILL','ITEM','DEFEND'])
  pathlib.Path('plan-debug.json').write_text(json.dumps({'ok':ok,'data':data,'errors':errors},ensure_ascii=False,indent=2))
  print(json.dumps({'ok':ok,'data':data,'errors':errors},ensure_ascii=False))
  if not ok: raise SystemExit(1)
  await browser.close()
asyncio.run(main())
