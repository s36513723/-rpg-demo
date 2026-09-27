"""Browser regression: native HTTP on CI, DOM + Storage adapter for offline workstations."""
import asyncio,json,re,os,threading,http.server,pathlib
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OFFLINE=os.getenv('RPG_OFFLINE_TEST')=='1'
async def load(page,hub):
 await page.add_init_script('window.__RPG_TEST__=true')
 if not OFFLINE:
  await page.goto('http://127.0.0.1:8139/'+('exploration/' if hub else ''),wait_until='load');return
 html=(ROOT/('exploration/index.html' if hub else 'index.html')).read_text()
 scripts=re.findall(r'<script[^>]*>([\s\S]*?)</script>',html)
 html=re.sub(r'<script[^>]*>[\s\S]*?</script>','',html)
 html=re.sub(r'<link[^>]+href="ui-v29.css"[^>]*>','<style>'+(ROOT/'ui-v29.css').read_text()+'</style>',html)
 await page.set_content(html)
 await page.evaluate("""() => {window.__RPG_TEST__=true;window.__storage={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>__storage[k]??null,setItem:(k,v)=>__storage[k]=String(v),removeItem:k=>delete __storage[k],clear:()=>{__storage={}}}})}""")
 await page.add_script_tag(content=(ROOT/'rpg-rules.js').read_text())
 await page.add_script_tag(content=scripts[-1] if hub else (ROOT/'battle-v29.js').read_text())
async def main():
 if not OFFLINE:
  class Handler(http.server.SimpleHTTPRequestHandler):
   def __init__(self,*args,**kw):super().__init__(*args,directory=str(ROOT),**kw)
   def log_message(self,*args):pass
  server=http.server.ThreadingHTTPServer(('127.0.0.1',8139),Handler)
  threading.Thread(target=server.serve_forever,daemon=True).start()
 out=[]
 async with async_playwright() as p:
  exe=os.getenv('CHROMIUM_PATH')
  browser=await p.chromium.launch(executable_path=exe,headless=True,args=['--no-sandbox'])
  for hub in [True,False]:
   page=await browser.new_page(viewport={'width':390,'height':844})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await load(page,hub)
   case='hub' if hub else 'battle'
   values=await page.evaluate((ROOT/'tests'/f'{case}-regression.js').read_text())
   out.extend(values)
   out.append({'name':case+' runtime console errors','ok':not errors,'errors':errors})
   await page.close()
  await browser.close()
 (ROOT/'test-results.json').write_text(json.dumps({'mode':'offline DOM/Storage adapter' if OFFLINE else 'native Chromium HTTP','tests':out},ensure_ascii=False,indent=2))
 for r in out:
  print(('PASS' if r['ok'] else 'FAIL')+' '+r['name'])
  if not r['ok']:print(r.get('error',r.get('errors')))
 failed=[r for r in out if not r['ok']]
 print(f'{len(out)-len(failed)}/{len(out)} passed')
 if failed:raise SystemExit(1)
if __name__=='__main__':asyncio.run(main())
