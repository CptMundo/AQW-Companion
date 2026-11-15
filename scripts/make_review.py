#!/usr/bin/env python3
"""Compare compiled databases by normalized record content and produce actionable review."""
import hashlib
import json
from pathlib import Path

OUT=Path('review_output')
OUT.mkdir(exist_ok=True)

def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))

def stable(obj):
    return json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(',',':'))

def normalized_map(db, field):
    data=db.get(field,[])
    if not isinstance(data,list): raise SystemExit(f'Invalid {field} type')
    result={}
    for pair in data:
        if not isinstance(pair,list) or len(pair)!=2 or not isinstance(pair[0],str):
            raise SystemExit(f'Invalid record in {field}')
        if pair[0] in result: raise SystemExit(f'Duplicate record: {field}:{pair[0]}')
        result[pair[0]]=pair[1]
    return result

def recursive_changed(before,after):
    changed=[]
    for key in sorted(set(before)|set(after)):
        if stable(before.get(key))!=stable(after.get(key)):
            changed.append(key)
    return changed

new=read(OUT/'companion_database.json')
oldpath=Path('data/companion_database.json')
old=read(oldpath) if oldpath.exists() else None
manifest=read(OUT/'source_manifest.json')
if new.get('format')!='aqw-companion-community-v1':raise SystemExit('Unrecognized DB format')
thresholds={'items':10000,'acquisition':5000,'locations':1000}
summary={}
report={'source':manifest.get('source'),'previousBaselinePresent':bool(manifest.get('baselinePresent',False)), 'fields':{},'sourceFiles':{},'warnings':[]}
for field,lower in thresholds.items():
    current=normalized_map(new,field)
    if len(current)<lower:raise SystemExit(f'Regression alert: {field} only {len(current)} (<{lower})')
    previous=normalized_map(old,field) if old else {}
    added=sorted(current.keys()-previous.keys())
    removed=sorted(previous.keys()-current.keys())
    changed=sorted(k for k in current.keys()&previous.keys() if stable(current[k])!=stable(previous[k]))
    report['fields'][field]={'previous':len(previous) if old else None,'current':len(current),'added':added,'removed':removed,'changed':changed}
    if old and len(previous)>100 and len(removed)/len(previous)>.05:
        raise SystemExit(f'Regression alert: {field} removed {len(removed)} / {len(previous)} (>5%)')
    summary[field]=(len(current),len(added),len(removed),len(changed))

for file,meta in manifest['files'].items():
    report['sourceFiles'][file]={'sha256':meta['sha256'],'bytes':meta['bytes'],'changedSinceBaseline':meta.get('changedSinceSavedManifest'), 'entries':meta['topLevelEntries']}
if not manifest.get('baselinePresent'):
    report['warnings'].append('No saved source baseline was found. Upstream changes cannot be interpreted on this initial run.')

# Build deterministic update status; generatedAt metadata is intentionally ignored.
report['contentChanged']=bool(old is None or any(summary[f][1:]!=(0,0,0) for f in thresholds))
report['sourceChanged']=any(v.get('changedSinceBaseline') is True for v in report['sourceFiles'].values())
report['reviewRequired']=report['contentChanged'] or report['sourceChanged'] or not manifest.get('baselinePresent')
report['approval']='MANUAL_REVIEW_REQUIRED' if report['reviewRequired'] else 'NO_CHANGES'
lines=['# AQW Companion — Database Auto-Update v2','',
       '**Status:** '+report['approval'],'',
       'No website files were modified. The proposed results are an artifact for manual review.','',
       '## Upstream source files']
if not manifest.get('baselinePresent'):
    lines.append('**No saved baseline was found** — do not interpret initial changed flags as game updates.')
for f,r in report['sourceFiles'].items():
    status='CHANGED' if r['changedSinceBaseline'] is True else 'UNCHANGED' if r['changedSinceBaseline'] is False else 'UNKNOWN'
    lines.append(f'- `{f}`: **{status}** · {r["entries"]:,} top-level records · SHA256 `{r["sha256"][:16]}…`')
lines += ['','## Compiled database changes (actual record differences)']
for field,vals in summary.items():
    current,adds,removes,changes=vals
    lines.append(f'### {field}: {current:,} total | +{adds} added | -{removes} removed | {changes} changed')
    for label in ('added','removed','changed'):
        keys=report['fields'][field][label]
        if keys:lines.append(f'- **{label.capitalize()} examples:** '+', '.join('`'+s.replace('`','')+'`' for s in keys[:15]))
        else:lines.append(f'- {label.capitalize()}: none')
lines += ['','## How to review','1. Read `changes.json` for the full keys of changed records.',
          '2. Compare changed acquisition routes, ingredients, quantities and quest prerequisites against AQWWiki and game.',
          '3. Do not publish personal player data.',
          '4. Confirm upstream-source redistribution and attribution requirements before publishing.',
          '5. Do not replace `data/companion_database.json` until the review is approved.','']
(OUT/'REVIEW.md').write_text('\n'.join(lines),encoding='utf-8')
(OUT/'changes.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'source_manifest_next.json').write_text(json.dumps({k:v for k,v in manifest.items() if k not in ('changedFiles','baselinePresent')},indent=2)+'\n',encoding='utf-8')
print('\n'.join(lines[:25]))
