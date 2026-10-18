"""Extrae las tablas del curso a un JSON intermedio.

Entrada:  <dir>/{t,Chi,F,K-S,Z}.txt  (salida de `pdftotext -layout` sobre los PDF)
Salida:   <dir>/raw.json             (estructura cruda, sin validar)

Uso:  python3 scripts/parse.py scripts/build
"""
import re, json, sys

D = sys.argv[1] if len(sys.argv) > 1 else 'scripts/build'


def toks(line):
    return line.split()


out = {}

# --- t de Student ---
t = {'cols': [0.6, 0.667, 0.75, 0.8, 0.875, 0.9, 0.95, 0.975, 0.99, 0.995, 0.999], 'rows': []}
for L in open(f'{D}/t.txt'):
    tk = toks(L)
    if len(tk) == 12 and (tk[0].isdigit() or tk[0] == '∞') and re.match(r'^[\d.]+$', tk[1]):
        t['rows'].append([tk[0]] + tk[1:])
out['t'] = t

# --- χ² ---
chi = {'cols': [0.001, 0.005, 0.01, 0.025, 0.05, 0.10, 0.125, 0.20, 0.25, 0.333, 0.5,
                0.6, 0.667, 0.75, 0.8, 0.875, 0.9, 0.95, 0.975, 0.99, 0.995, 0.999], 'rows': {}}
for L in open(f'{D}/Chi.txt'):
    tk = toks(L)
    if len(tk) == 12 and tk[0].isdigit() and re.match(r'^[\d.]+$', tk[1]):
        chi['rows'].setdefault(tk[0], []).extend(tk[1:])
chi['rows'] = [[k] + v for k, v in chi['rows'].items()]
out['chi'] = chi

# --- F de Fisher ---
F = {'nu1': ['2', '3', '4', '5', '6', '7', '8', '10', '12', '15', '20', '30', '50', '∞'],
     'blocks': {}}
cur = None
page = 0
for L in open(f'{D}/F.txt'):
    if 'ν2' in L:
        page += 1
    tk = toks(L)
    if len(tk) == 16:
        cur = tk[0]; q = tk[1]; vals = tk[2:]
    elif len(tk) == 15 and tk[0].startswith('0.'):
        q = tk[0]; vals = tk[1:]
    else:
        continue
    F['blocks'].setdefault(cur, {'page': page, 'rows': {}})
    F['blocks'][cur].setdefault('pages', set()).add(page)
    F['blocks'][cur]['rows'][q] = vals
for k, b in F['blocks'].items():
    b['pages'] = sorted(b['pages'])
out['F'] = F

# --- Kolmogorov–Smirnov ---
ks = {'cols': [0.1, 0.05, 0.025, 0.01, 0.005], 'rows': []}
for L in open(f'{D}/K-S.txt'):
    tk = toks(L)
    if len(tk) == 6 and tk[0].isdigit():
        ks['rows'].append(tk)
out['ks'] = ks

# --- Normal estándar Z ---
z = {'rows': []}
for L in open(f'{D}/Z.txt'):
    tk = toks(L)
    if len(tk) == 11 and re.match(r'^\d\.\d$', tk[0]):
        z['rows'].append(tk)
out['z'] = z

json.dump(out, open(f'{D}/raw.json', 'w'), ensure_ascii=False, default=list)
print('filas  t={} chi={} F={} bloques  ks={}  z={}'.format(
    len(t['rows']), len(chi['rows']), len(F['blocks']), len(ks['rows']), len(z['rows'])))
