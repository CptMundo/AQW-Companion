"""Collect verified static artwork links for a bounded batch of boosted items.
Run manually to extend the public catalog; never fetch Wiki pages in a user's browser."""
import json, re, time, urllib.request, urllib.parse
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path("extension/boost-index.json")
OUT=Path("data/boost-artwork.json")
HOSTS={"aqwwiki.wikidot.com","aqwwiki.wdfiles.com","i.imgur.com","static.wikidot.com"}
BASE="https://aqwwiki.wikidot.com/"
def safe(src):
    try:
        u=urllib.parse.urlsplit(urllib.parse.urljoin(BASE,src))
        if u.hostname not in HOSTS or u.username or u.password or u.port not in (None,443,80):return None
        if "/image-tags/" in u.path.lower() or not re.search(r"\.(png|jpe?g|webp)$",u.path,re.I):return None
        return urllib.parse.urlunsplit(("https",u.hostname,u.path,u.query,""))
    except (ValueError,TypeError):return None
def artwork(html):
    root=BeautifulSoup(html,"html.parser").select_one("#page-content")
    if not root:return None
    for img in root.select("img"):
        if img.find_parent(["table"],class_="wiki-content-table"):continue
        src=safe(img.get("src",""))
        if not src:continue
        name=urllib.parse.unquote(urllib.parse.urlsplit(src).path).split("/")[-1].lower()
        if re.search(r"(?:^|[-_])(?:ac|legend|rare|seasonal|pseudo|special|icon|tag|button|small|large)(?:small|large)?\.",name) or re.search(r"^(ac|legend|rare|seasonal|pseudo|special)(small|large)?\.",name):continue
        try:
            if int(img.get("width",200))<100 or int(img.get("height",200))<100:continue
        except ValueError:pass
        return src
    return None
def main():
    rows=json.loads(ROOT.read_text())["rows"]
    old=json.loads(OUT.read_text()) if OUT.exists() else {"images":{},"checked":[]}
    images={k:v for k,v in old["images"].items() if safe(v)};checked=set(old.get("checked",[]))-(set(old["images"])-set(images))
    featured=["cape-of-awe","blinding-light-of-destiny-axe","necrotic-sword-of-doom-sword","radiant-goddess-of-war","fire-champion-s-armor"]
    top=sorted(rows,key=lambda r:(-max(r["boost"].values()),r["name"].lower()))
    order=list(dict.fromkeys(featured+[r["slug"] for r in top]))
    for slug in [s for s in order if s not in checked][:64]:
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,199}",slug):continue
        try:
            req=urllib.request.Request(BASE+slug,headers={"User-Agent":"AQW Companion artwork index/1.0"})
            with urllib.request.urlopen(req,timeout=8) as r:
                if urllib.parse.urlsplit(r.url).hostname!="aqwwiki.wikidot.com":continue
                html=r.read(2_000_001)
                if len(html)>2_000_000:continue
            src=artwork(html)
            if src:images[slug]=src
            checked.add(slug)
        except Exception as exc:
            print("Skipped",slug,type(exc).__name__,flush=True)
        time.sleep(.4)
    OUT.parent.mkdir(exist_ok=True)
    data={"source":BASE,"images":images,"checked":sorted(checked)}
    raw=json.dumps(data,ensure_ascii=False,separators=(",",":"))
    OUT.write_text(raw+"\n",encoding="utf-8")
    print("ARTWORK_COUNT",len(images),"CHECKED",len(checked),flush=True)
    for i in range(0,len(raw),5000):print("ARTWORK_CHUNK "+raw[i:i+5000],flush=True)
if __name__=="__main__":main()
