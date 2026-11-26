#!/usr/bin/env python3
"""Best-effort official AQW news importer. Never invent event dates."""
import json, re, urllib.request, html, datetime, pathlib
from html.parser import HTMLParser
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'data'/'aqw-calendar.json'
URL='https://www.artix.com/games/aqworlds/'
class Reader(HTMLParser):
 def __init__(self): super().__init__();self.parts=[]
 def handle_data(self,d): self.parts.append(d)
def get(url):
 req=urllib.request.Request(url,headers={'User-Agent':'AQWCompanionCalendar/1.0 (fan project; GitHub Actions)'})
 with urllib.request.urlopen(req,timeout=25) as r:return r.read().decode('utf-8','replace')
def main():
 old=json.loads(OUT.read_text(encoding='utf-8').strip().removesuffix(chr(92)+'n')) if OUT.exists() else {'events':[]}
 today=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
 events=list(old.get('events',[]))
 status='Official news fetch failed; retaining previously verified entries'
 try:
  page=get(URL)
  # Keep confirmed announcements even if a subsequent news fetch is empty.
  # The public AQWorlds news page is not the full Artix calendar. Import only
  # headlines with explicit dates and label them as NEWS, never as boosts.
  for m in re.finditer(r"""<a\b[^>]*href=["\x27]([^"\x27]+)["\x27][^>]*>(.*?)</a>""",page,re.I|re.S):
   href,raw=m.groups()
   if not ('aqworlds' in href.lower() or 'gamedesignnotes' in href.lower()):continue
   parser=Reader();parser.feed(raw);title=html.unescape(' '.join(parser.parts)).strip()
   if not title or len(title)>140:continue
   # Date must be explicit in the anchor's nearby source markup.
   around=page[max(0,m.start()-300):min(len(page),m.end()+300)]
   dm=re.search(r'(?:20[2-3]\d)[-/](?:0?[1-9]|1[0-2])[-/](?:[0-2]?[0-9]|3[01])',around)
   if not dm:continue
   try:date=datetime.date.fromisoformat(dm.group().replace('/','-')).isoformat()
   except ValueError:continue
   if not href.startswith('http'):href='https://www.artix.com'+('/' if not href.startswith('/') else '')+href
   events.append({'date':date,'name':title,'desc':'Official AQWorlds news post (publication date; not necessarily event start).','url':href,'category':'news','source':'official-news'})
  status='Official AQWorlds news page checked; calendar boosts require explicit confirmation'
 except Exception as exc:print('WARNING:',exc)
 unique={}
 for e in events:
  if not e.get('date') or not e.get('name') or not e.get('url'):continue
  unique[(e['date'],e['name'].casefold())]=e
 # Keep curated entries and recent news only; no silently fabricated schedules.
 filtered=[e for e in unique.values() if e.get('source')!='official-news' or e['date']>=str(datetime.date.today()-datetime.timedelta(days=120))]
 result={'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),'status':status,'sources':['https://www.artix.com/calendar/',URL,'https://www.aq.com/gamedesignnotes/'],'events':sorted(filtered,key=lambda x:(x['date'],x['name']))}
 OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+chr(10),encoding='utf-8')
 print(status,'events:',len(result['events']))
if __name__=='__main__':main()
