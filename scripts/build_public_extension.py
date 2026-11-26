#!/usr/bin/env python3
"""Build the published manual extension download from a clean checkout.
No personal exports, account data, or browser profiles are packaged."""
import hashlib, json, pathlib, re, subprocess, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
EXT=ROOT/'extension'
OUT=ROOT/'downloads'
version=json.loads((EXT/'manifest.json').read_text())['version']
assert re.fullmatch(r'\d+\.\d+\.\d+(?:\.\d+)?',version)
guide=EXT/'quick-start.html'
guide.write_text(guide.read_text().replace('__GUIDE_VERSION__',version),encoding='utf-8')
shots=['popup-home','popup-settings','home','wishlist','quests','ultras','builds','story','badges','explore','inventory','stats','wiki']
for name in shots:
    p=EXT/'guide-images'/('guide-'+name+'.png')
    assert p.is_file() and p.stat().st_size>5000 and p.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n',p
OUT.mkdir(exist_ok=True)
zip_path=OUT/'AQW_Companion.zip'
# Only git-tracked extension files + specifically generated public guide screenshots.
tracked=subprocess.check_output(['git','ls-files','-z','extension'],cwd=ROOT).decode().split('\0')
files={ROOT/p for p in tracked if p and (ROOT/p).is_file()}
files.update(EXT/'guide-images'/('guide-'+name+'.png') for name in shots)
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(files):
        assert p.resolve().is_relative_to(EXT.resolve()) and not p.is_symlink()
        z.write(p,p.relative_to(EXT).as_posix())
with zipfile.ZipFile(zip_path) as z:
    assert z.testzip() is None
    assert json.loads(z.read('manifest.json'))['version']==version
    assert all('guide-images/guide-'+s+'.png' in z.namelist() for s in shots)
    assert '__GUIDE_VERSION__' not in z.read('quick-start.html').decode()
digest=hashlib.sha256(zip_path.read_bytes()).hexdigest()
(OUT/'AQW_Companion.sha256').write_text(digest+'  AQW_Companion.zip\n')
print('Manual ZIP:',version,zip_path.stat().st_size,'bytes',digest)
