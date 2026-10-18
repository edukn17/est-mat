"""Valida raw.json contra los valores exactos de scipy.

Lista las celdas que no coinciden (corruptas/erratas) y resume las celdas
impresas como "∞" que en realidad son un número finito.

Requiere scipy.

Uso:  python3 scripts/check.py scripts/build
"""
import json, sys, math
from scipy import stats

D = sys.argv[1] if len(sys.argv) > 1 else 'scripts/build'
R = json.load(open(f'{D}/raw.json'))


def unit(s):
    if '.' not in s:
        return 1
    d = len(s.split('.')[1])
    return 10 ** (-d)


bad = []


def chk(tab, label, s, e):
    try:
        v = float(s)
    except Exception:
        bad.append((tab, label, s, e, 'NO NUMÉRICO')); return
    u = unit(s)
    if abs(v - e) > 0.5 * u * 1.02 + 1e-12:
        bad.append((tab, label, s, round(e, 5), f'dif={v - e:+.4g}'))


def nu(s):
    return math.inf if s == '∞' else int(s)


for r in R['t']['rows']:
    n = nu(r[0])
    for q, s in zip(R['t']['cols'], r[1:]):
        qq = 2 / 3 if q == 0.667 else q
        e = stats.norm.ppf(qq) if n == math.inf else stats.t.ppf(qq, n)
        chk('t', f'nu={r[0]} q={q}', s, e)
for r in R['chi']['rows']:
    n = int(r[0])
    for q, s in zip(R['chi']['cols'], r[1:]):
        qq = 2 / 3 if q == 0.667 else (1 / 3 if q == 0.333 else q)
        chk('chi2', f'nu={n} q={q}', s, stats.chi2.ppf(qq, n))
for n2, b in R['F']['blocks'].items():
    for q, vals in b['rows'].items():
        qq = 2 / 3 if q == '0.667' else float(q)
        for n1, s in zip(R['F']['nu1'], vals):
            a, bb = nu(n1), nu(n2)
            if a == math.inf and bb == math.inf:
                e = 1.0
            elif a == math.inf:
                e = bb / stats.chi2.ppf(1 - qq, bb)
            elif bb == math.inf:
                e = stats.chi2.ppf(qq, a) / a
            else:
                e = stats.f.ppf(qq, a, bb)
            if s == '∞':
                bad.append(('F-inf', f'nu1={n1} nu2={n2} q={q}', s, round(e, 1),
                            '∞ = valor >999' if e >= 999.5 else 'impreso ∞ pero finito'))
                continue
            chk('F', f'nu1={n1} nu2={n2} q={q}', s, e)
for r in R['ks']['rows']:
    n = int(r[0])
    for a, s in zip(R['ks']['cols'], r[1:]):
        chk('KS', f'n={n} a={a}', s, stats.kstwo.ppf(1 - a, n))
for r in R['z']['rows']:
    for j, s in enumerate(r[1:]):
        z = float(r[0]) + j / 100
        chk('Z', f'z={z:.2f}', s, stats.norm.cdf(z))

for b in bad:
    if b[0] != 'F-inf':
        print(b)
finf = [b for b in bad if b[0] == 'F-inf']
print('celdas "∞" en la tabla F:', len(finf), [(b[1], b[3]) for b in finf[:6]])
