#!/usr/bin/env python3
"""Synchronize every current release label from the extension manifest.
Use --set VERSION to prepare a release; --check is read-only for CI.
Historical release notes and data/cache schema versions are deliberately untouched.
"""
import argparse
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
NUM = r'(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)'
SURFACES = {
    'index.html': [
        (r'(<span class="tag">)(?:ALPHA|BETA|STABLE) '+NUM+r'(</span>)', '{upper} {version}'),
        (r'(Not affiliated with Artix Entertainment · v)'+NUM+r'(?: (?:Alpha|Beta|Stable))?(</div>)', '{version} {stage}'),
        (r'(<span class="pill">)(?:Alpha|Beta|Stable)( · Class builds · 2026 meta</span>)', '{stage}'),
    ],
    'extension/popup.html': [
        (r'(<small>v)'+NUM+r'(?: (?:Alpha|Beta|Stable))?( · Your adventure, connected</small>)', '{version} {stage}'),
    ],
    'extension/quick-start.html': [
        (r'(Manual preview build · v)'+NUM+r'(?: (?:Alpha|Beta|Stable))?(</div>)', '{version} {stage}'),
    ],
    'README.md': [
        (r'(\A# AQW Companion — )(?:Alpha|Beta|Stable) '+NUM+r'(\n)', '{stage} {version}'),
    ],
}
def validate(version):
    if not isinstance(version,str) or not re.fullmatch(NUM,version) or any(int(p)>65535 for p in version.split('.')) or version=='0.0.0':
        raise ValueError('Expected a valid three-component browser version, e.g. 0.13.1')
    return version

def synchronize(root=ROOT, *, new_version=None, stage=None, check=False):
    root=pathlib.Path(root)
    manifest=root/'extension/manifest.json'
    raw=manifest.read_text(encoding='utf-8')
    config=json.loads(raw)
    old=validate(config['version'])
    version=validate(new_version if new_version is not None else old)
    if new_version is not None and tuple(map(int,version.split('.')))<tuple(map(int,old.split('.'))):
        raise ValueError('Release version must not go backwards')
    label=re.fullmatch(NUM+r' (Alpha|Beta|Stable)',config.get('version_name',''))
    stage=stage or (label.group(1) if label else 'Beta')
    if stage not in ('Alpha','Beta','Stable'):
        raise ValueError('Invalid release stage')
    # Compute all replacements before writing anything; missing or duplicate labels fail closed.
    config['version']=version
    config['version_name']=version+' '+stage
    changes={manifest:json.dumps(config,indent=2,ensure_ascii=False)+'\n'}
    for relative,patterns in SURFACES.items():
        file=root/relative
        text=file.read_text(encoding='utf-8')
        for pattern,template in patterns:
            value=template.format(version=version,stage=stage,upper=stage.upper())
            text,count=re.subn(pattern,lambda m:m.group(1)+value+m.group(2),text)
            if count!=1:
                raise ValueError(f'{relative}: expected exactly one release marker, found {count}')
        changes[file]=text
    mismatches=[p for p,expected in changes.items() if p.read_text(encoding='utf-8')!=expected]
    if check and mismatches:
        raise ValueError('Release labels out of sync: '+', '.join(str(p.relative_to(root)) for p in mismatches)+'. Run python3 scripts/sync_release_version.py')
    for p in mismatches:
        p.write_text(changes[p],encoding='utf-8')
    return version,stage

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    group=parser.add_mutually_exclusive_group()
    group.add_argument('--set',metavar='VERSION')
    group.add_argument('--check',action='store_true')
    parser.add_argument('--stage',choices=['Alpha','Beta','Stable'])
    args=parser.parse_args()
    if args.check and args.stage: parser.error('--check is read-only')
    try:
        version,stage=synchronize(new_version=args.set,stage=args.stage,check=args.check)
        print('Release labels:',version,stage,'consistent')
    except (ValueError,KeyError,OSError) as e:
        parser.exit(1,str(e)+'\n')
if __name__=='__main__':
    main()
