#!/usr/bin/env python3
import json, pathlib, shutil, tempfile, unittest
from sync_release_version import ROOT, SURFACES, synchronize

class ReleaseSyncTest(unittest.TestCase):
    def test_release(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp)
            for name in ['extension/manifest.json',*SURFACES]:
                dest=root/name
                dest.parent.mkdir(parents=True,exist_ok=True)
                shutil.copyfile(ROOT/name,dest)
            original=json.loads((root/'extension/manifest.json').read_text())
            current=original['version']
            parts=list(map(int,current.split('.')))
            future=f'{parts[0]}.{parts[1]+1}.0'
            # Simulate changing only the canonical numeric version.
            original['version']=future
            (root/'extension/manifest.json').write_text(json.dumps(original,indent=2)+'\n')
            with self.assertRaisesRegex(ValueError,'out of sync'):
                synchronize(root,check=True)
            self.assertEqual(synchronize(root)[0],future)
            self.assertEqual(synchronize(root,check=True)[0],future)
            for name in SURFACES:
                self.assertIn(future,(root/name).read_text())
            self.assertEqual(json.loads((root/'extension/manifest.json').read_text())['permissions'],original['permissions'])
            with self.assertRaises(ValueError):
                synchronize(root,new_version=current)
            # Idempotence and no accidental replacement of historical/schema numbers.
            before={name:(root/name).read_bytes() for name in SURFACES}
            synchronize(root)
            self.assertEqual(before,{name:(root/name).read_bytes() for name in SURFACES})
            (root/'extension/popup.html').write_text('missing release marker')
            with self.assertRaisesRegex(ValueError,'exactly one'):
                synchronize(root)
if __name__=='__main__':
    unittest.main()
