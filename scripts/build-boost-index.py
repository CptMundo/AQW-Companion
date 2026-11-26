"""Build a public, source-attributed snapshot of the Wiki's equipment boost index."""
import json, re, urllib.request, urllib.parse, datetime
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag
SOURCE="https://aqwwiki.wikidot.com/boosted-items-sorted-by-boost"
CATEGORIES={"Armors":"armors","Capes & Back Items":"capes-back-items","Helmets & Hoods":"helmets-hoods","Pets":"pets","Weapons":"weapons"}
TAGGED=["chaos","dragon","elemental","human","undead"]
PROGRESS=["cp","gold","rep","xp"]
LABELS={"all monsters":["all"],"all tagged":["tagged",*TAGGED],"all 4":PROGRESS,"class points boost":["cp"],"gold boost":["gold"],"reputation boost":["rep"],"experience boost":["xp"],"chaoskind":["chaos"],"dragonkind":["dragon"],"elementalkind":["elemental"],"humankind":["human"],"undeadkind":["undead"],"drakathkind":["drakath"],"orckind":["orc"]}
FLAGS={"legendsmall":"Legend","raresmall":"Rare","pseudosmall":"Pseudo-Rare","seasonalsmall":"Seasonal","specialsmall":"Special Offer"}
def clean(x): return " ".join(str(x).split())
def slug(href):
    p=urllib.parse.urlsplit(urllib.parse.urljoin(SOURCE,href))
    return p.path.strip("/") if p.scheme=="https" and p.netloc=="aqwwiki.wikidot.com" and not p.query and not p.fragment and re.fullmatch(r"/[a-z0-9][a-z0-9-]{0,199}/?",p.path) else None
def parse(html):
    root=BeautifulSoup(html,"html.parser").select_one("#page-content")
    if not root: raise ValueError("Wiki content missing")
    rows={}; counts={}
    def collect(pane,keys,category):
        pct=None; pending=[]
        def flush():
            nonlocal pct,pending
            if not pending:return
            text=clean("".join(str(n) if isinstance(n,NavigableString) else n.get_text() for n in pending))
            m=re.fullmatch(r"(\d+(?:\.\d+)?)\s*%",text)
            if m: pct=float(m.group(1));pending=[];return
            links=[n for n in pending if isinstance(n,Tag) and n.name=="a" and clean(n.get_text()) and n.get("href")]
            if pct and pct<=1000 and len(links)==1:
                a=links[0]; key=slug(a["href"]); name=clean(a.get_text())
                name=re.sub(r"\s+\((?:Default|Fixed|Static|High|Medium|Other)(?:,[^)]*)?\)$","",name,flags=re.I)
                if key and name and len(name)<=350 and name.lower() not in {"here","click here","back to top","next","previous"}:
                    flags=[]
                    for n in pending:
                        if isinstance(n,Tag) and n.name=="img":
                            stem=Path(urllib.parse.urlsplit(n.get("src","")).path).stem.lower()
                            if stem in FLAGS: flags.append(FLAGS[stem])
                    row=rows.setdefault(key,{"slug":key,"name":name,"category":category,"boost":{},"flags":[]})
                    if row["category"]!=category: raise ValueError("Conflicting category "+key)
                    for k in keys:
                        row["boost"][k]=max(row["boost"].get(k,0),int(pct) if pct.is_integer() else pct)
                        counts[k]=counts.get(k,0)+1
                    row["flags"]=sorted(set(row["flags"]+flags))
            pending=[]
        def walk(n):
            if isinstance(n,NavigableString):pending.append(n);return
            if not isinstance(n,Tag) or n.name in {"script","style","form","button"} or "yui-nav" in n.get("class",[]):return
            if n.name=="br":flush();return
            if n.name=="a" and clean(n.get_text()) and n.get("href"):pending.append(n);return
            if n.name=="img":pending.append(n);return
            block=n.name in {"p","div","li","tr","td","th","h1","h2","h3","h4","ul","ol","table","center"}
            if block:flush()
            for c in n.children:walk(c)
            if block:flush()
        walk(pane);flush()
    for tab in root.select(".yui-navset"):
        nav=tab.select_one(":scope > .yui-nav"); body=tab.select_one(":scope > .yui-content")
        if not nav or not body:continue
        names=[clean(x.get_text()).lower() for x in nav.find_all(recursive=False)]
        panes=body.find_all(recursive=False)
        if len(names)!=len(panes) or not all(n in LABELS for n in names):continue
        h=next((h for h in tab.find_all_previous(["h1","h2","h3"]) if clean(h.get_text()) in CATEGORIES),None)
        if not h:continue
        for name,pane in zip(names,panes):collect(pane,LABELS[name],CATEGORIES[clean(h.get_text())])
    for block in root.select(".collapsible-block"):
        head=block.select_one(":scope > .collapsible-block-folded")
        pane=block.select_one(":scope > .collapsible-block-unfolded > .collapsible-block-content")
        if not head or not pane:continue
        t=clean(head.get_text()).lower()
        if "damage to drakathkind" in t:collect(pane,["drakath"],"weapons")
        if "damage to orckind" in t:collect(pane,["orc"],"weapons")
    return rows,counts
def main():
    request=urllib.request.Request(SOURCE,headers={"User-Agent":"AQW Companion public index builder/1.0"})
    with urllib.request.urlopen(request,timeout=30) as r:
        if r.status!=200 or urllib.parse.urlsplit(r.url).netloc!="aqwwiki.wikidot.com":raise ValueError("Unexpected response")
        html=r.read(6_000_001)
        if len(html)>6_000_000:raise ValueError("Wiki index too large")
    rows,counts=parse(html)
    print("Boost counts:",counts,"Unique items:",len(rows),flush=True)
    expected={"cape-of-awe":{"cp":25,"gold":25,"rep":25,"xp":25},"blinding-light-of-destiny-axe":{"undead":75}}
    for key,boosts in expected.items():
        if any(rows.get(key,{}).get("boost",{}).get(k)!=v for k,v in boosts.items()):raise ValueError("Spot check failed: "+key)
    if len(rows)<300 or len(counts)<12:raise ValueError("Incomplete boost index; do not publish")
    data={"source":SOURCE,"license":"CC BY-SA 3.0","updatedAt":datetime.date.today().isoformat(),"rows":sorted(rows.values(),key=lambda r:r["slug"])}
    out=Path("data/boost-index.json");out.parent.mkdir(exist_ok=True);out.write_text(json.dumps(data,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    # Public source data only; chunked for a read-only retrieval of this generated artifact.
    raw=out.read_text(encoding="utf-8").strip()
    for i in range(0,len(raw),6000):print("BOOST_INDEX_CHUNK "+raw[i:i+6000])
if __name__=="__main__":main()
