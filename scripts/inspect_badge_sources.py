"""One-off public Wiki metadata import; no personal data or credentials.
Source text for Requirements is attributed to AQWWiki (CC BY-SA 3.0).
Do not silently invent requirements or mark unknown availability as obtainable.
"""
import urllib.request, urllib.error, json, time, re
from urllib.parse import urljoin, urlsplit, urlunsplit
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
from threading import Lock, Event
base='https://aqwwiki.wikidot.com/'
pages={'epic-hero-badges':'Epic Hero','legendary-badges':'Legendary','battle-badges':'Battle','support-badges':'Support','exclusive-badges':'Exclusive','artix-entertainment-badges':'Artix Entertainment','heromart-badges-cp':'HeroMart'}
lock=Lock()
stop=Event()
last=0
def fetch(url):
    global last
    if stop.is_set(): raise RuntimeError('Rate limit stop')
    with lock:
        time.sleep(max(0,0.55-(time.monotonic()-last)))
        last=time.monotonic()
    req=urllib.request.Request(url,headers={'User-Agent':'AQW Companion public badge catalog (CptMundo/AQW-Companion)'})
    try:
        with urllib.request.urlopen(req,timeout=15) as r:
            if urlsplit(r.url).hostname!='aqwwiki.wikidot.com': raise ValueError('Unexpected redirect')
            return BeautifulSoup(r.read(8_000_000),'html.parser')
    except urllib.error.HTTPError as e:
        if e.code==429: stop.set()
        raise
def safe_link(raw):
    u=urlsplit(urljoin(base,raw or ''))
    if u.scheme not in ('https','http') or u.username or u.password:return ''
    if u.hostname not in ('aqwwiki.wikidot.com','www.aq.com','game.aq.com','aq.com','aqwwiki.wdfiles.com','heromart.com','www.heromart.com','www.artix.com','artix.com','account.aq.com','i.imgur.com','imgur.com','cdn.artix.com','static.artix.com'):return ''
    return urlunsplit(('https',u.netloc,u.path,u.query,u.fragment))
def txt(n):return ' '.join(n.stripped_strings)
records={}
for slug,category in pages.items():
    soup=fetch(base+slug)
    content=soup.select_one('#page-content')
    if not content: raise RuntimeError('Missing category '+slug)
    count=0
    for a in content.select('span.hover > a[href]'):
        source=safe_link(a.get('href'))
        m=re.fullmatch(r'/charpage:(\d+)',urlsplit(source).path)
        if not m:continue
        img=a.select_one('img[src]');name=a.parent.select_one('strong')
        if not img or not name:raise RuntimeError('Missing name/image: '+source)
        image=safe_link(img.get('src'))
        if not image: print('IMAGE_UNSUPPORTED',source,str(img.get('src')),flush=True)
        id='cp-'+m.group(1)
        if id in records: raise RuntimeError('Duplicate badge ID '+id)
        records[id]={'id':id,'name':txt(name),'category':category,'source':source,'image':image,'categorySource':base+slug,'kind':'unknown','tags':[]}
        count+=1
    if not count:raise RuntimeError('Empty category '+slug)
    print('CATEGORY',slug,count,flush=True)
if len(records)<750:raise RuntimeError('Catalog unexpectedly incomplete: '+str(len(records)))
def enrich(b):
    try:
        s=fetch(b['source'])
        c=s.select_one('#page-content')
        if not c:raise ValueError('No badge content')
        heading=c.select_one('h1')
        if not heading:raise ValueError('No badge heading')
        marker=next((p for p in c.select('p') if re.fullmatch(r'Requirements\s*:',txt(p),re.I)),None)
        req=[];links=[]
        if marker:
            for part in marker.next_siblings:
                if not getattr(part,'name',None):continue
                t=txt(part)
                if re.match(r'^(Note\(s\)|Notes?|Description)\s*:',t,re.I) or part.name in ('table','div','h1','h2'):break
                if t: req.append(t)
                for a in part.select('a[href]'):
                    href=safe_link(a.get('href'))
                    if href and txt(a) and not any(x['url']==href and x['label']==txt(a) for x in links):
                        links.append({'label':txt(a)[:200],'url':href})
        tags=set()
        for a in s.select('.page-tags a'):
            t=txt(a).lower()
            if re.fullmatch(r'[a-z0-9_-]{1,50}',t):tags.add(t)
        for a in c.select('a[onclick*="updateTagsByButton"]'):
            tags.update(re.findall(r'\+([a-z0-9_-]+)',a.get('onclick','').lower()))
        b['tags']=sorted(tags-{'cpbadge'})
        b['requirements']=req[:20]
        b['requirementLinks']=links[:30]
        b['detailStatus']='requirements-found' if req else 'requirements-not-found'
        if 'rare' in tags:b['kind']='legacy'
        elif 'seasonal' in tags:b['kind']='seasonal'
        elif tags.intersection({'freeplayer','legend','ac'}):b['kind']='quest'
        else:b['kind']='unknown'
        b['detailTitle']=txt(heading)
        return b
    except Exception as e:
        b['detailStatus']='source-unavailable'
        b['error']=str(e)[:150]
        return b
# Fast, index-only snapshot for validating complete source coverage independently of individual detail requests.
import sys
if '--details' in sys.argv:
    with ThreadPoolExecutor(max_workers=2) as pool:
        data=list(pool.map(enrich,records.values()))
else:
    data=list(records.values())
for b in data:
    b.setdefault('detailStatus','requirements-not-indexed')
    print('BADGE_RECORD '+json.dumps(b,ensure_ascii=True,separators=(',',':')),flush=True)
with open('badge-source-catalog.json','w',encoding='utf-8') as f:
    json.dump(data,f,ensure_ascii=False,indent=2)
print('BADGE_TOTAL',len(data),'DETAILS',sum(x['detailStatus']=='requirements-found' for x in data),'FAILED',sum(x['detailStatus']=='source-unavailable' for x in data),flush=True)
