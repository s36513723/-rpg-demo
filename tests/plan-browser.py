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
  errors=[];logs=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m: logs.append(m.text) if m.type=='error' else None)
  await page.goto('http://127.0.0.1:8140/play-plan-v4.html',wait_until='load')
  await page.wait_for_timeout(1500)
  data=await page.evaluate("""()=>{const portrait=document.querySelector('#actorArt').getBoundingClientRect(),board=document.querySelector('#allies').getBoundingClientRect(),face=getComputedStyle(document.querySelector('.ally-face-wrap'));const card=document.querySelector('.ally-unit'),hp=card.querySelector('[data-resource=hp]').getBoundingClientRect(),sp=card.querySelector('[data-resource=sp]').getBoundingClientRect();return {presentation:document.documentElement.dataset.presentation,enemy:document.querySelectorAll('.enemy-unit').length,cards:document.querySelectorAll('.ally-unit').length,order:document.querySelectorAll('.order-face').length,api:!!window.RPGDemo,boot:!!document.querySelector('#bootStatus'),faceHidden:face.display==='none',portraitLeft:portrait.right<=board.left+2,hpSpSideBySide:Math.abs(hp.top-sp.top)<3&&hp.right<=sp.left+8}}""")
  pathlib.Path('plan-debug.json').write_text(json.dumps({'data':data,'errors':errors,'console':logs},ensure_ascii=False,indent=2))
  print(json.dumps({'data':data,'errors':errors,'console':logs},ensure_ascii=False))
  await browser.close()
asyncio.run(main())
