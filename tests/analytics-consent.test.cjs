"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const js=read("js/umami-analytics.js"),html=read("index.html"),privacy=read("privacy.html");
assert.ok(html.includes('src="js/umami-analytics.js"'));
assert.ok(html.includes('href="privacy.html"'));
assert.ok(!/googletagmanager|G-JF725WDHV1|aqw-analytics-banner|analytics-consent\.js/.test(html));
assert.ok(!fs.existsSync(path.join(__dirname,"../js/analytics-consent.js")));
assert.ok(privacy.includes("Umami Cloud")&&privacy.includes("Global Privacy Control"));
function scenario({choice=null,gpc=false,dnt="0",hostname="cptmundo.github.io",pathname="/AQW-Companion/",blocked=false}={}){
 const scripts=[],events=[];
 const window={localStorage:{getItem(){if(blocked)throw Error("blocked");return choice}},location:{hostname,pathname,search:"?secret=SECRET",hash:"#PRIVATE"},umami:{track(payload){events.push(payload)}}};
 const document={referrer:"https://www.reddit.com/r/AQW/?secret=SECRET#PRIVATE",createElement(){return {attrs:{},setAttribute(k,v){this.attrs[k]=v}}},head:{appendChild(s){scripts.push(s)}}};
 vm.runInNewContext(js,{window,document,navigator:{globalPrivacyControl:gpc,doNotTrack:dnt}});
 scripts.forEach(s=>s.onload());
 return {scripts,events};
}
const normal=scenario();
assert.equal(normal.scripts.length,1);
assert.equal(normal.scripts[0].src,"https://cloud.umami.is/script.js");
assert.equal(normal.scripts[0].attrs["data-website-id"],"6991fe97-a5a7-49ab-9619-384710fba182");
assert.equal(normal.scripts[0].attrs["data-auto-track"],"false");
assert.equal(normal.events.length,1);
assert.equal(normal.events[0].url,"/AQW-Companion/");
assert.equal(normal.events[0].referrer,"https://www.reddit.com/r/AQW/");
assert.ok(!/SECRET|PRIVATE/.test(JSON.stringify(normal.events)));
for(const opts of [{choice:"reject"},{gpc:true},{dnt:"1"},{hostname:"localhost"},{pathname:"/other/"},{blocked:true}])assert.equal(scenario(opts).scripts.length,0);
console.log("Umami pageview-only and privacy signal checks passed");

assert.equal(normal.events[0].website,'6991fe97-a5a7-49ab-9619-384710fba182');
assert.equal(normal.events[0].hostname,'cptmundo.github.io');
