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
  await page.goto('http://127.0.0.1:8140/play-plan-v17.html',wait_until='load');await page.wait_for_timeout(1200)
  data=await page.evaluate("""()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};const board=rect(q('#allies')),cmd=rect(q('#commandPanel')),auto=rect(q('#auto')),pace=rect(q('#pace')),portrait=rect(q('#actorArt')),enemy=qa('.enemy-unit').map(rect),img=q('.actor-portrait-image');return {cards:qa('.ally-unit').length,enemies:enemy.length,order:qa('.order-face').length,active:q('.ally-unit.active')?.dataset.unitId||null,board,cmd,auto,pace,portrait,enemy,portraitSrc:img?.getAttribute('src')||'',portraitLoaded:!!img&&img.complete&&img.naturalWidth>0,meta:q('.round-meta')?.innerText.replace(/\s+/g,' ').trim(),labels:['attack','skills','swap','defend'].map(id=>q('#'+id+' b')?.textContent.trim())}}""")
  enemy_overlap=max([overlap(a,b) for i,a in enumerate(data['enemy']) for b in data['enemy'][i+1:]] or [0])
  aligned=abs(data['auto']['left']-data['board']['left'])<2 and abs(data['pace']['right']-data['board']['right'])<2 and abs(data['cmd']['left']-data['auto']['right'])<3 and abs(data['cmd']['right']-data['pace']['left'])<3
  portrait_clear=data['portrait']['right']<=data['board']['left']-4
  ok=(not errors and data['cards']==6 and data['enemies']==6 and data['order']>0 and data['active'] and aligned and portrait_clear and enemy_overlap<1 and data['portraitLoaded'] and data['portraitSrc'].startswith('images/') and '狭所' in data['meta'] and data['labels']==['ATTACK','SKILL','ITEM','DEFEND'])
  pathlib.Path('plan-debug.json').write_text(json.dumps({'ok':ok,'aligned':aligned,'portrait_clear':portrait_clear,'enemy_overlap':enemy_overlap,'data':data,'errors':errors},ensure_ascii=False,indent=2))
  print(json.dumps({'ok':ok,'aligned':aligned,'portrait_clear':portrait_clear,'enemy_overlap':enemy_overlap,'data':data,'errors':errors},ensure_ascii=False))
  if not ok: raise SystemExit(1)
  await browser.close()
asyncio.run(main())
