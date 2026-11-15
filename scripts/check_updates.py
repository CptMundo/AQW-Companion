#!/usr/bin/env python3
"""Safely fetch AQWikiTools community JSON for a nonpublishing AQW Companion database review."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import urllib.request

FILES = ['WikiItems.json', 'Classes.json', 'locations.json', 'merge_shops.json', 'quests.json']
BASE = 'https://raw.githubusercontent.com/R41CY/AQWikiTools/main/data/'
MAX_SIZE = 35 * 1024 * 1024


def sha(b):
    return hashlib.sha256(b).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', default='source_download')
    parser.add_argument('--manifest', default='source_manifest.json')
    parser.add_argument('--previous-manifest', default='data/source_manifest.json')
    args = parser.parse_args()
    folder = Path(args.source_dir)
    folder.mkdir(parents=True, exist_ok=True)
    previous = {}
    oldfile = Path(args.previous_manifest)
    if oldfile.exists():
        try:
            previous = json.loads(oldfile.read_text(encoding='utf-8')).get('files', {})
        except (ValueError, OSError) as exc:
            raise SystemExit(f'Previous manifest cannot be read: {exc}')
    meta = {}
    for name in FILES:
        url = BASE + name
        request = urllib.request.Request(url, headers={'User-Agent': 'AQW-Companion-Database-Review/1.0'})
        try:
            with urllib.request.urlopen(request, timeout=55) as response:
                if response.status != 200:
                    raise ValueError(f'Unexpected HTTP {response.status}')
                chunks, size = [], 0
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    size += len(chunk)
                    if size > MAX_SIZE:
                        raise ValueError(f'{name} exceeds safety limit of {MAX_SIZE} bytes')
                    chunks.append(chunk)
                data = b''.join(chunks)
            parsed = json.loads(data)
            if not isinstance(parsed, dict) or not parsed:
                raise ValueError('Expected nonempty JSON object')
        except Exception as exc:
            raise SystemExit(f'Could not retrieve/validate {name}: {exc}')
        (folder / name).write_bytes(data)
        digest = sha(data)
        meta[name] = {'sha256': digest, 'bytes': len(data), 'topLevelEntries': len(parsed), 'changedSinceSavedManifest': digest != previous.get(name, {}).get('sha256')}
        print(f'{name}: {len(parsed)} entries, {len(data):,} bytes, changed={meta[name]["changedSinceSavedManifest"]}')
    output = {'source': 'R41CY/AQWikiTools', 'branch': 'main', 'files': meta,
              'changedFiles': [f for f in FILES if meta[f]['changedSinceSavedManifest']]}
    Path(args.manifest).write_text(json.dumps(output, indent=2) + '\n', encoding='utf-8')
    print('Source files changed:', ', '.join(output['changedFiles']) or 'none')


if __name__ == '__main__':
    main()
