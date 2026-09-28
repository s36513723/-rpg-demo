import asyncio, threading, http.server, pathlib, json
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=str(ROOT),**k)
    def log_message(self,*a): pass
async def main():
    server=http.server.ThreadingHTTPServer(('127.0.0.1',8140),Handler)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
        page=await browser.new_page(viewport={'width':390,'height':844})
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        await page.goto('http://127.0.0.1:8140/play-plan-v34.html',wait_until='load')
        await page.wait_for_timeout(1400)
        await page.click('.ally-unit[data-unit-id="war"]')
        await page.wait_for_timeout(250)
        data=await page.evaluate("""()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],r=e=>{const x=e.getBoundingClientRect();return {left:x.left,right:x.right,top:x.top,bottom:x.bottom,width:x.width,height:x.height}};return {cards:qa('.ally-unit').length,enemies:qa('.enemy-unit').length,active:q('.ally-unit.active')?.dataset.unitId||null,orderCount:qa('.order-face').length,cmd:r(q('#commandPanel')),party:r(q('#allies')),portrait:r(q('#actorArt')),labels:['attack','skills','swap','defend'].map(id=>q('#'+id+' b')?.textContent.trim()),terrain:q('.round-meta')?.innerText.replace(/\\s+/g,' ').trim()}}""")
        await page.screenshot(path='plan-current.png',full_page=False)
        ok=(not errors and data['cards']==6 and data['enemies']==6 and data['active'] and data['orderCount']==5 and data['labels']==['ATTACK','SKILL','ITEM','DEFEND'] and data['cmd']['top']<data['party']['top']+3 and data['portrait']['left']<5)
        pathlib.Path('plan-debug.json').write_text(json.dumps({'ok':ok,'data':data,'errors':errors},ensure_ascii=False,indent=2))
        print(json.dumps({'ok':ok,'data':data,'errors':errors},ensure_ascii=False))
        await browser.close()
        if not ok: raise SystemExit(1)
asyncio.run(main())
