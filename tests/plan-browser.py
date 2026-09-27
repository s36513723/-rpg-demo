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
  await page.goto('http://127.0.0.1:8140/play-plan-v11.html',wait_until='load');await page.wait_for_timeout(1000)
  data=await page.evaluate("""()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const cards=q('#allies').getBoundingClientRect(),cmd=q('#commandPanel').getBoundingClientRect();return {presentation:document.documentElement.dataset.presentation,cards:qa('.ally-unit').length,enemies:qa('.enemy-unit').length,order:qa('.order-face').length,labels:['attack','skills','swap','defend'].map(id=>q('#'+id+' b')?.textContent.trim()),commandAbove:cmd.bottom<=cards.top+2,aligned:Math.abs(cmd.left-cards.left)<2&&Math.abs(cmd.right-cards.right)<2,cardHeight:cards.height,commandHeight:cmd.height,api:!!window.RPGDemo}}""")
  await page.click('#skills');await page.wait_for_timeout(100)
  skill=await page.evaluate("""()=>{const b=document.querySelector('.skill-choice');if(!b)return null;const r=b.getBoundingClientRect(),line=b.querySelector('.skill-line')?.getBoundingClientRect();return {height:r.height,lineHeight:line?.height||0,rows:document.querySelectorAll('.skill-choice').length}}""")
  ok=(not errors and data['cards']==6 and data['enemies']==6 and data['order']>0 and data['labels']==['ATTACK','SKILL','ITEM','DEFEND'] and data['commandAbove'] and data['aligned'] and data['cardHeight']<=100 and data['commandHeight']<=32 and skill and skill['height']<=34)
  pathlib.Path('plan-debug.json').write_text(json.dumps({'ok':ok,'data':data,'skill':skill,'errors':errors},ensure_ascii=False,indent=2))
  print(json.dumps({'ok':ok,'data':data,'skill':skill,'errors':errors},ensure_ascii=False))
  if not ok: raise SystemExit(1)
  await browser.close()
asyncio.run(main())
