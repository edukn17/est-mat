#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Regenera el bloque de datos (TAB + FLAGS) de herramientas/tablas.html
# a partir de los PDF de las tablas.
#
# Los PDF NO viven en el repositorio por derechos de autor: colócalos en una
# carpeta local y pásala como argumento (por defecto "Tablas").
#
# Pipeline: pdftotext -layout  ->  parse.py  ->  gen.py  ->  inject.py
# Requisitos: pdftotext (poppler), python3 con scipy.
#
# Uso:  scripts/build.sh [carpeta_de_pdfs]        (por defecto: ./Tablas)
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$(realpath "$0")")/.."   # raíz del repo
SRC="${1:-Tablas}"
OUT=scripts/build
PY="${PYTHON:-python3}"                 # intérprete con scipy (ver README)
mkdir -p "$OUT"

for k in t Chi F K-S Z; do
  if [ ! -f "$SRC/$k.pdf" ]; then
    echo "ERROR: falta $SRC/$k.pdf (pásame la carpeta con los PDF como argumento)" >&2
    exit 1
  fi
  pdftotext -layout "$SRC/$k.pdf" "$OUT/$k.txt"
done

python3 scripts/parse.py "$OUT"
"$PY" scripts/gen.py "$OUT"
python3 scripts/inject.py "$OUT/data.js" herramientas/tablas.html
echo "OK: herramientas/tablas.html actualizado"
