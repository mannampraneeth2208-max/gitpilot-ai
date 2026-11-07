import json,sys
from pathlib import Path
required={'name','nodes','connections','active','settings'}
for p in sorted(Path('workflows').glob('*.json')):
    d=json.loads(p.read_text())
    missing=required-set(d)
    assert not missing,(p,missing)
    names={n['name'] for n in d['nodes']}
    for src,outs in d['connections'].items():
        assert src in names,(p,src)
        for branch in outs.get('main',[]):
            for edge in branch: assert edge['node'] in names,(p,edge['node'])
    print('OK',p)
print('validated',len(list(Path('workflows').glob('*.json'))),'workflows')
