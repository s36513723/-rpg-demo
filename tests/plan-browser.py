import asyncio,threading,http.server,pathlib,json
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**k): super().__init__(*a,directory=str(ROOT),**k)
 def log_message(self,*a): pass
def overlap(a,b):
 return max(0,min(a['right'],b['right'])-max(a['left'],b['left']))*max(0,min(a['bottom'],b['bottom'])-max(a['top'],b['top']))
async def main():
 server=http.server.ThreadingHTTPServer(('127.0.0.1',8140),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto('http://127.0.0.1:8140/play-plan-v23.html',wait_until='load');await page.wait_for_timeout(1200)
  data=await page.evaluate("""()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};const board=rect(q('#allies')),cmd=rect(q('#commandPanel')),auto=rect(q('#auto')),pace=rect(q('#pace')),portrait=rect(q('#actorArt')),enemy=qa('.enemy-unit').map(rect);return {cards:qa('.ally-unit').length,enemies:enemy.length,active:q('.ally-unit.active')?.dataset.unitId||null,board,cmd,auto,pace,portrait,enemy,labels:['attack','skills','swap','defend'].map(id=>q('#'+id+' b')?.textContent.trim())}}""")
  enemy_overlap=max([overlap(a,b) for i,a in enumerate(data['enemy']) for b in data['enemy'][i+1:]] or [0])
  commands_clear=(data['cmd']['width']>170 and data['cmd']['left']>=data['auto']['right']-2 and data['cmd']['right']<=data['pace']['left']+2)
  portrait_clear=data['portrait']['right']<=data['board']['left']+1
  portrait_ratio=data['portrait']['width']/390
  ok=(not errors and data['cards']==6 and data['enemies']==6 and data['active'] and enemy_overlap<1 and commands_clear and portrait_clear and .24<=portrait_ratio<=.31 and data['labels']==['ATTACK','SKILL','ITEM','DEFEND'])
  pathlib.Path('plan-debug.json').write_text(json.dumps({'ok':ok,'enemy_overlap':enemy_overlap,'commands_clear':commands_clear,'portrait_clear':portrait_clear,'portrait_ratio':portrait_ratio,'data':data,'errors':errors},ensure_ascii=False,indent=2))
  print(json.dumps({'ok':ok,'enemy_overlap':enemy_overlap,'commands_clear':commands_clear,'portrait_clear':portrait_clear,'portrait_ratio':portrait_ratio,'data':data,'errors':errors},ensure_ascii=False))
  if not ok: raise SystemExit(1)
  await browser.close()
asyncio.run(main())
