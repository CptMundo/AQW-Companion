#!/usr/bin/env python3
"""Stage only reviewed-source updates for a proposal; never commit personal data."""
import json
import shutil
from pathlib import Path

out = Path('review_output')
report = json.loads((out/'changes.json').read_text(encoding='utf-8'))
changed = report.get('contentChanged', False)
source_changed = report.get('sourceChanged', False)
baseline = report.get('previousBaselinePresent', False)

if not baseline:
    raise SystemExit('STOP: no trusted baseline in data/source_manifest.json. Review manually.')
if not (changed or source_changed):
    print('NO_CHANGES: no files staged')
    with open(out/'pr_status.txt','w') as f: f.write('NO_CHANGES\n')
    raise SystemExit(0)

# v2 already blocks drops above 5%; additionally pause proposals with ANY deletion
# until manually diagnosed via artifact (avoid suggested accidental deletion).
removals = sum(len(report['fields'][k]['removed']) for k in ('items','acquisition','locations'))
if removals:
    print(f'NEEDS_MANUAL_INSPECTION: {removals} removals; no automatic PR')
    (out/'pr_status.txt').write_text('NEEDS_MANUAL_INSPECTION\n',encoding='utf-8')
    raise SystemExit(0)

Path('data').mkdir(exist_ok=True)
shutil.copy2(out/'source_manifest_next.json','data/source_manifest.json')
if changed:
    database = json.loads((out/'companion_database.json').read_text(encoding='utf-8'))
    old_path = Path('data/companion_database.json')
    if old_path.exists():
        old = json.loads(old_path.read_text(encoding='utf-8'))
        # Avoid artificial generatedAt-only diffs; meaningful changes get build timestamp.
        if database.get('generatedAt') == old.get('generatedAt'):
            pass
    shutil.copy2(out/'companion_database.json',old_path)
    if (out/'build_report.json').exists():
        shutil.copy2(out/'build_report.json','data/build_report.json')

Path('database_reviews').mkdir(exist_ok=True)
shutil.copy2(out/'REVIEW.md','database_reviews/LATEST_REVIEW.md')
# Keep a transparent and auditable difference list; can be large, but it is not personal.
shutil.copy2(out/'changes.json','database_reviews/latest_changes.json')
status = 'DATABASE_CHANGED' if changed else 'SOURCE_ONLY'
(out/'pr_status.txt').write_text(status+'\n',encoding='utf-8')
print(f'{status}: prepared files for a pull request; no website publication')
