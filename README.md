# Est Mat · Guía interactiva de Estadística Matemática

Guía web estática (HTML + JS, sin build) que reescribe, desde cero, el curso de
**Estadística Matemática** de la **FCNM–ESPOL**. Cada tema va de la intuición a la
fórmula, después al ejemplo resuelto y por último a una simulación; los ejercicios
traen pistas graduales, solución completa paso a paso y verificación numérica.

> Sitio publicado (GitHub Pages): https://edukn17.github.io/est-mat/

## Contenido

| Página | Tema |
|---|---|
| `temas/repaso.html` | Repaso exprés de Estadística I (modelos, FGM, distribuciones conjuntas) |
| `temas/clase-01.html` | Funciones de variable aleatoria (método de la acumulada, Jacobiano) |
| `temas/clase-02.html` | Función generadora de momentos y estadísticos de orden |
| `temas/clase-03.html` | Distribuciones muestrales, χ² y t de Student |
| `temas/clase-04.html` | Distribución F de Fisher |
| `temas/clase-05.html` | Teorema del límite central |
| `temas/clase-06.html` | Estimación puntual, sesgo y error cuadrático medio (ECM) |
| `temas/clase-07.html` | Sesgo asintótico, cota del error y tamaño de muestra |
| `herramientas/formulario.html` | Formulario (Est. I + Est Mat): versión completa y de examen (2 págs.), en PDF/LaTeX |
| `herramientas/distribuciones.html` | Laboratorio de distribuciones |
| `herramientas/tablas.html` | Tablas χ², t, F, normal estándar y K-S, transcritas e interactivas |
| `deberes/lista-1-1.html` | Lista 1.1 resuelta (transformaciones y estadísticos de orden) |
| `deberes/lista-1-2.html` | Lista 1.2 resuelta (teorema del límite central) |

## Uso local

No hace falta servidor: abre `index.html` en el navegador (`file://` funciona).
Todas las dependencias (KaTeX 0.16.11 y tipografías) se cargan por CDN.

## Pruebas

```bash
npm install          # jsdom + katex (una sola vez)
npm test             # librería estadística (36/36) + humo de todas las páginas
npm run test:stats   # solo la librería
npm run test:smoke   # solo la prueba de humo (jsdom)
```

`tests/smoke.js` recorre todas las páginas moviendo deslizadores y pulsando botones,
y reporta errores JS, fórmulas KaTeX inválidas, `$` sin renderizar, enlaces rotos
e ids duplicados.

## Tablas

`herramientas/tablas.html` se genera desde los PDFs de `Tablas/` con el pipeline de
`scripts/` (`parse.py` → `gen.py` → `check.py` → `inject.py`, orquestado por
`build.sh`). El pipeline requiere Python con `numpy`/`scipy`; los artefactos
intermedios quedan en `scripts/build/` (no versionado).

## Formulario

`herramientas/formulario.html` resume Estadística I y las clases 01–07, y se ofrece
en dos versiones descargables, cada una con su fuente LaTeX:

- **Completa** (11 págs.): `herramientas/formulario.pdf` / `formulario.tex`.
- **De examen** (2 págs., a dos columnas): `herramientas/formulario-2p.pdf` /
  `formulario-2p.tex`.

Para recompilar un PDF (dos pasadas):

```bash
pdflatex herramientas/formulario.tex        # o formulario-2p.tex
```

Al editar un `.tex`, recompílalo y reemplaza el PDF.

## Estructura

```
est-mat/
├── index.html              portada + ruta de estudio
├── _plantilla.html         plantilla para páginas nuevas
├── PROCESO.md              memoria de trabajo del proyecto
├── assets/
│   ├── css/style.css
│   └── js/{theme,stats,plot,site,ui}.js
├── temas/                  repaso + clases 01–07
├── herramientas/           distribuciones.html, tablas.html, formulario.html
│                           formulario.tex/.pdf y formulario-2p.tex/.pdf
├── deberes/                lista-1-1.html, lista-1-2.html
├── scripts/                pipeline de tablas
└── tests/                  stats.test.js, smoke.js, shot.sh
```

Los PDFs fuente del curso (`Clases/`, `Tablas/`, `Formularios/`, `Deberes/`) no se
incluyen en el repositorio.

## Licencia

Ver [`LICENSE`](LICENSE).
