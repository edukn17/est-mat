"""Genera el bloque `TAB` + `FLAGS` que consume herramientas/tablas.html.

Entrada:  <dir>/raw.json  (de parse.py)
Salida:   <dir>/data.js

`FLAGS` marca cada celda que se desvía del valor exacto (calculado con scipy)
indicando el tipo de desviación:
  corrupto = ilegible · error = errata · fuera = "∞" finito · cifra = 1 unidad

Requiere scipy.

Uso:  python3 scripts/gen.py scripts/build
"""
import json, sys, math
from scipy import stats

D = sys.argv[1] if len(sys.argv) > 1 else 'scripts/build'
R = json.load(open(f'{D}/raw.json'))


def unit(s):
    return 10 ** (-len(s.split('.')[1])) if '.' in s else 1


def nu(s):
    return math.inf if s == '∞' else int(s)


flags = {}


def fq(q):
    return 2 / 3 if q in ('0.667', 0.667) else (1 / 3 if q in ('0.333', 0.333) else float(q))


def flag(key, s, e):
    if s == '100.':
        flags[key] = {'t': 'error', 'ex': round(e, 4)}; return
    if s == '∞':
        flags[key] = {'t': 'fuera' if e >= 999.5 else 'error', 'ex': round(e, 4)}; return
    try:
        v = float(s)
    except Exception:
        flags[key] = {'t': 'corrupto', 'ex': round(e, 4)}; return
    d = abs(v - e) / unit(s)
    if d > 1.5:
        flags[key] = {'t': 'error', 'ex': round(e, 4)}
    elif d > 0.5 * 1.02:
        flags[key] = {'t': 'cifra', 'ex': round(e, 4)}


def Fq(q, a, b):
    a, b = nu(a), nu(b)
    if a == math.inf and b == math.inf:
        return 1.0
    if a == math.inf:
        return b / stats.chi2.ppf(1 - q, b)
    if b == math.inf:
        return stats.chi2.ppf(q, a) / a
    return stats.f.ppf(q, a, b)


tlab = ['60.0%', '66.7%', '75.0%', '80.0%', '87.5%', '90.0%', '95.0%', '97.5%', '99.0%', '99.5%', '99.9%']
for r in R['t']['rows']:
    for q, s in zip(R['t']['cols'], r[1:]):
        n = nu(r[0])
        e = stats.norm.ppf(fq(q)) if n == math.inf else stats.t.ppf(fq(q), n)
        flag(f't|{r[0]}|{q}', s, e)
for r in R['chi']['rows']:
    for q, s in zip(R['chi']['cols'], r[1:]):
        flag(f'chi|{r[0]}|{q}', s, stats.chi2.ppf(fq(q), int(r[0])))
order = list(R['F']['blocks'].keys())
for n2 in order:
    for q, vals in R['F']['blocks'][n2]['rows'].items():
        for n1, s in zip(R['F']['nu1'], vals):
            flag(f'F|{n2}|{q}|{n1}', s, Fq(fq(q), n1, n2))
for r in R['z']['rows']:
    for j, s in enumerate(r[1:]):
        z = float(r[0]) + j / 100
        flag(f'z|{r[0]}|{j}', s, stats.norm.cdf(z))

from collections import Counter  # noqa: E402
print('FLAGS:', dict(Counter(v['t'] for v in flags.values())), file=sys.stderr)

chilab = ['0.1%', '0.5%', '1.0%', '2.5%', '5.0%', '10.0%', '12.5%', '20.0%', '25.0%', '33.3%', '50.0%'] + tlab
TAB = {
    't': {'q': R['t']['cols'], 'lab': tlab, 'rows': [' '.join(r) for r in R['t']['rows']]},
    'chi': {'q': R['chi']['cols'], 'lab': chilab, 'rows': [' '.join(r) for r in R['chi']['rows']]},
    'F': {'n1': R['F']['nu1'], 'q': list(R['F']['blocks']['1']['rows'].keys()), 'order': order,
          'blocks': {k: [' '.join(v) for v in b['rows'].values()] for k, b in R['F']['blocks'].items()}},
    'ks': {'a': R['ks']['cols'], 'rows': [' '.join(r) for r in R['ks']['rows']],
           'asin': ['1.07', '1.22', '1.36', '1.52', '1.63']},
    'z': {'rows': [' '.join(r) for r in R['z']['rows']]},
}


def dump(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


out = 'const TAB = {\n'
for k in ['t', 'chi', 'ks', 'z']:
    o = TAB[k]; rows = o.pop('rows')
    out += f'  {k}: Object.assign({dump(o)}, {{ rows: [\n' + ''.join(f"    '{r}',\n" for r in rows) + '  ] }),\n'
F = TAB['F']; blocks = F.pop('blocks')
out += f'  F: Object.assign({dump(F)}, {{ blocks: {{\n'
for k, v in blocks.items():
    out += f"    '{k}': [\n" + ''.join(f"      '{r}',\n" for r in v) + '    ],\n'
out += '  } }),\n};\n'
out += 'const FLAGS = ' + dump(flags) + ';\n'
open(f'{D}/data.js', 'w').write(out)
print(len(out))
