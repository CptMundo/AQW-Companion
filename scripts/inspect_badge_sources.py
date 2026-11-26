import urllib.request, json
from bs4 import BeautifulSoup
base='https://aqwwiki.wikidot.com/'
pages=['epic-hero-badges','legendary-badges','battle-badges','support-badges','exclusive-badges','artix-entertainment-badges','heromart-badges-cp','charpage:424']
for page in pages:
    try:
        req=urllib.request.Request(base+page,headers={'User-Agent':'AQW Companion public badge index research (CptMundo/AQW-Companion)'})
        with urllib.request.urlopen(req,timeout=25) as r: html=r.read(8_000_000)
        s=BeautifulSoup(html,'html.parser')
        c=s.select_one('#page-content')
        if not c: raise ValueError('Missing content')
        print('PROBE',page,len(html),'links',len(c.select('a[href*="charpage:"]')),'images',len(c.select('img')),'list items',len(c.select('.list-pages-item')))
        print('SAMPLE',str(c)[:6500].replace('\n',' '))
    except Exception as e: print('ERROR',page,type(e).__name__,str(e))
