#!/usr/bin/env python3
"""Produce review summary and basic regression checks; no publication."""
import json
from pathlib import Path

new = json.loads(Path('review_output/companion_database.json').read_text(encoding='utf-8'))
oldfile = Path('data/companion_database.json')
old = json.loads(oldfile.read_text(encoding='utf-8')) if oldfile.exists() else None
manifest = json.loads(Path('review_output/source_manifest.json').read_text(encoding='utf-8'))

if new.get('format') != 'aqw-companion-community-v1':
    raise SystemExit('Unexpected database format')

summary = {'items': len(new.get('items', [])), 'acquisition': len(new.get('acquisition', [])),
           'locations': len(new.get('locations', []))}
for label, n in summary.items():
    if n < {'items': 10000, 'acquisition': 5000, 'locations': 1000}[label]:
        raise SystemExit(f'Regression alert: {label} only {n} records')

lines = ['# AQW Companion — database review', '',
         'This is a proposed update only. No public website files were changed.', '',
         '## Changes in upstream files']
for filename, meta in manifest['files'].items():
    lines.append(f'- {filename}: {meta["topLevelEntries"]:,} top-level entries; changed since recorded baseline: **{meta["changedSinceSavedManifest"]}**')
lines += ['', '## Compiled database counts']
for key, value in summary.items():
    previous = len(old.get(key, [])) if old else None
    lines.append(f'- {key}: {value:,}' + (f' (previous {previous:,}, difference {value-previous:+,})' if previous is not None else ''))
if old:
    lines += ['', '## Added / removed / changed keys']
    for field in ['items', 'acquisition', 'locations']:
        a = dict(old.get(field, []))
        b = dict(new.get(field, []))
        added = b.keys() - a.keys()
        removed = a.keys() - b.keys()
        modified = {k for k in a.keys() & b.keys() if a[k] != b[k]}
        lines += [f'- {field}: added {len(added):,}, removed {len(removed):,}, changed {len(modified):,}',
                  f'  - Examples added: {", ".join(sorted(added)[:8]) or "none"}',
                  f'  - Examples removed: {", ".join(sorted(removed)[:8]) or "none"}']
lines += ['', '## Before accepting',
          '- Check reuse/redistribution rights, including attribution and required license notices.',
          '- Verify changed recipes, acquisition routes and quest prerequisites in the wiki and game.',
          '- Review removed entries and any major count changes.',
          '- Only after review, copy companion_database.json and build_report.json into public data/.',
          '- Never upload player inventory or account exports to GitHub.']
Path('review_output/REVIEW.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('\n'.join(lines[:16]))
