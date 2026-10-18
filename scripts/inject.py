"""Inyecta el bloque generado (data.js) en herramientas/tablas.html.

Reemplaza todo lo que hay entre los marcadores BEGIN/END DATA por el
contenido de data.js. Idempotente: se puede ejecutar las veces que haga falta.

Uso:  python3 scripts/inject.py scripts/build/data.js herramientas/tablas.html
"""
import sys

src, target = sys.argv[1], sys.argv[2]
data = open(src, encoding='utf-8').read().rstrip('\n')
html = open(target, encoding='utf-8').read()

BEGIN = '/* ==== BEGIN DATA (generado por scripts/build.sh) ==== */'
END = '/* ==== END DATA ==== */'

i = html.find(BEGIN)
j = html.find(END)
if i < 0 or j < 0 or j < i:
    raise SystemExit('ERROR: no se encontraron los marcadores BEGIN/END DATA en ' + target)

html = html[:i] + BEGIN + '\n' + data + '\n' + END + html[j + len(END):]
open(target, 'w', encoding='utf-8').write(html)
print('inyectado en', target, '(', len(data), 'bytes )')
