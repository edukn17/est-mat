# PROCESO — Guía interactiva de Estadística Matemática (ESPOL, II PAO 2026)

> Memoria de trabajo del proyecto. Antes de tocar nada, lee esto. Al terminar
> una sesión, añade una entrada a la **Bitácora** (al final).

## 1. Objetivo

Guía web interactiva (HTML estático, publicable en GitHub Pages) para ponerse al día
con Estadística Matemática (FCNM–ESPOL):

- explicar con claridad lo que se ve en `../Clases/` (el profe explica mal → aquí se reexplica desde cero);
- **resolver completamente** todos los ejemplos y ejercicios de los PDFs de clase;
- simulaciones que muestren visualmente los teoremas;
- presentar las distribuciones nuevas (χ², t de Student, F de Fisher) y **cómo leer las tablas** de `../Tablas/`;
- preparar para los deberes de `../Deberes/Ejercicios/` (pistas graduales + solución desplegable + verificación por simulación);
- usar la **notación de los formularios** `../Formularios/Formulario {1,2} - Estadística I.pdf`.

Se actualiza cada vez que se agrega una clase nueva a `../Clases/`, una tabla a `../Tablas/` o un deber a `../Deberes/`.

## 2. Estructura

```
est-mat/  (raíz del repositorio; antes Guia/)
├── index.html                 portada + ruta de estudio (tarjetas generadas desde site.js)
├── _plantilla.html            plantilla de página (copiar para páginas nuevas)
├── PROCESO.md                 este archivo
├── README.md / LICENSE        presentación y licencia
├── package.json               pruebas (jsdom + katex vía npm)
├── assets/
│   ├── css/style.css          estilos + tokens de color (claro/oscuro)
│   └── js/
│       ├── theme.js           aplica tema guardado (en <head>)
│       ├── stats.js           EM.stats: pdf/cdf/cuantiles/generadores (probado contra tablas)
│       ├── plot.js            EM.plot: gráficos canvas (curvas, áreas, histogramas, regiones 2D)
│       ├── site.js            EM.SITE: MAPA DEL SITIO (única fuente del menú)
│       └── ui.js              EM.ui: maquetación, KaTeX, deslizadores, quiz, comprobador numérico
├── temas/                     repaso.html, clase-01.html … clase-NN.html
├── herramientas/              distribuciones.html, tablas.html
├── deberes/                   lista-1-1.html, …
├── scripts/                   pipeline de tablas (parse/gen/check/inject + build.sh)
└── tests/
    ├── stats.test.js          node tests/stats.test.js  (valores de tablas ESPOL)
    ├── smoke.js               prueba de humo de páginas (jsdom)
    └── shot.sh                captura con Firefox headless
```

Todo son **scripts clásicos** (no módulos ES) para que funcione abriendo los HTML
directamente con `file://` y también en GitHub Pages. Dependencias externas sólo por CDN:
KaTeX 0.16.11 (jsdelivr) y Google Fonts.

## 3. Cómo añadir contenido nuevo

**Nueva clase** (p. ej. Clase 6):
1. Leer `../Clases/Clase 06 EstMat.pdf` completo.
2. Copiar `_plantilla.html` → `temas/clase-06.html`; cambiar rutas a `../assets/...`, `data-root="../"`, `data-page="clase-06"`.
3. Añadir una línea en `assets/js/site.js` (grupo *Clases*). El menú, la portada y anterior/siguiente se actualizan solos.
4. Si aparece una distribución nueva: añadirla a `stats.js` (+ prueba en `tests/stats.test.js`) y al laboratorio `herramientas/distribuciones.html`.
5. Si aparece una tabla nueva en `../Tablas/`: transcribirla en `herramientas/tablas.html`.
6. Correr las pruebas (sección 5) y anotar en la Bitácora.

**Nuevo deber**: `deberes/lista-X-Y.html` + línea en el grupo *Deberes* de `site.js`.

## 4. Convenciones (OBLIGATORIAS para mantener coherencia)

### 4.1 Notación (la de los formularios y las clases)
- Probabilidad $\mathbb{P}$ (macro `\P`), esperanza `\E`, varianza `\Var`, covarianza `\Cov`, `\iid`, indicadora `\1`.
- fdp: $f_X(x)$; acumulada: $F_X(x)$; FGM: $M_X(t)$; cuantil: $x_p$ con $F_X(x_p)=p$ (Formulario 2).
- Muestra: $Y_1,\dots,Y_n$ (o $X_i$); media $\bar Y$; varianza muestral $S^2=\frac{1}{n-1}\sum(Y_i-\bar Y)^2$.
- Estadísticos de orden: $Y_{(1)}\le\dots\le Y_{(n)}$ en clase; **en la Lista 1.1 se usa $Y_1\le\dots\le Y_n$** — avisar donde aplique.
- Grados de libertad como subíndice entre paréntesis: $\chi^2_{(\nu)}$, $t_{(\nu)}$, $F_{(\nu_1,\nu_2)}$.
- "fdp" = función de densidad de probabilidad, "FGM" = función generadora de momentos, "v.a." = variable aleatoria.

### 4.2 Parametrizaciones (¡fuente típica de errores!)
| Modelo | Formulario 2 (y `EM.stats`) | Otra forma que aparece | Conversión |
|---|---|---|---|
| Exponencial | $\text{Exp}(\beta)$, **media β**: $f=\frac1\beta e^{-x/\beta}$ | "exponencial de parámetro λ" (deberes) = **tasa** | $\beta = 1/\lambda$ |
| Gamma | $G(\alpha,\beta)$, **β escala**: $\E=\alpha\beta$ | $\text{Gamma}(r,\lambda)$ con λ tasa (Lista 1.1 ej. 6) | $\beta=1/\lambda$ |
| χ² | $\chi^2_{(\nu)} = G(\nu/2,\,2)$ | | |
| Normal | $N(\mu,\sigma^2)$ (varianza) | `EM.stats.dist.normal(mu, sigma)` recibe **σ** | |

En cada ejercicio donde aparezca "parámetro λ" hay que **decir explícitamente** qué significa.

### 4.3 Colas y tablas (el "al revés" que confunde)
- **Las tablas ESPOL (`../Tablas/`) dan cuantiles con probabilidad ACUMULADA** (área a la izquierda):
  la columna "95.0%" o "q = 0.950" es el valor $x$ con $\P(X\le x)=0.95$.
- **En clase se escribe el valor crítico con área α a la DERECHA**: $F_{(\nu_1,\nu_2,\alpha)}$ cumple $\P(F>F_{(\nu_1,\nu_2,\alpha)})=\alpha$.
  Igual $\chi^2_{\alpha}$, $t_{\alpha}$, $z_{\alpha}$.
- Traducción: **valor crítico con cola derecha α = columna (1−α) de la tabla**. Ej.: $t_{(8),\,0.025}$ = columna 97.5% = 2.306.
- Recíproco F: $F_{(\nu_1,\nu_2,1-\alpha)} = 1/F_{(\nu_2,\nu_1,\alpha)}$ (la tabla F sólo trae q ≥ 0.5).
- El PDF de `../Tablas/` no trae tabla normal: los valores $z$ salen de la fila **ν = ∞** de la tabla t. Además, `herramientas/tablas.html` incluye una **tabla Z** propia (probabilidades directas $\P(Z\le z)$) generada por el pipeline.
- En `EM.stats`: `d.q(p)` = cuantil acumulado (lo que da la tabla); `d.crit(alpha)` = `d.q(1-alpha)` (notación de clase); `d.sf(x)` = cola derecha.

### 4.4 Estilo de las páginas
- Español neutro, tuteo, tono de tutor paciente: **intuición primero, luego la fórmula, luego el ejemplo resuelto, luego la simulación**.
- Cada ejemplo/ejercicio de clase: caja `.box.ejercicio` con id `ej-N` / `ejemplo-N`, enunciado fiel al PDF, `details.pista` (1–3 pistas) y `details.solucion` con **todos los pasos** (nada de "ver Wackerly"). Los marcados con * en el PDF llevan `<span class="badge star">★ reto</span>`.
- Resultados numéricos verificados con Python/scipy o simulación (y en la página, cuando ayude, una mini-simulación que confirme el número).
- Cajas: `.definicion`, `.teorema`, `.nota`, `.cuidado`, `.idea`, `.ejemplo`, `.ejercicio`; pasos con `<ol class="pasos">`.
- Simulaciones: `<div class="sim">` con `.sim-title`, `.sim-desc`, controles (`EM.ui.slider/button/select`), gráfico (`EM.plot.create`) y lectura (`EM.ui.readout`). Deben funcionar a 360 px de ancho. Evitar más de ~2·10⁵ muestras por clic.
- Matemáticas con KaTeX: `$…$` en línea, `$$…$$` en bloque. Dentro de cadenas JS, escapar `\\`. Si hay que mostrar un `$` literal, usar la clase `no-math`.
- **El signo "menor que" dentro de matemáticas debe escribirse `&lt;`** (p. ej. `$X&lt;k$`), nunca `<` literal: el parser HTML lo toma como inicio de etiqueta y rompe el `$` (la fórmula no renderiza). El pipeline `scripts/` y las páginas ya lo respetan; hay un transformador en `/tmp/fix_math.py` (sesión 2) que lo aplicó a todo el sitio.
- Autoevaluación: `EM.ui.quiz` y `EM.ui.numcheck` al final de las secciones importantes.

## 5. Pruebas

```bash
# una vez por máquina, desde la raíz del repo:
npm install
# luego:
npm test                                                   # stats (36/36) + humo de todas las páginas
npm run test:stats                                         # solo la librería
npm run test:smoke                                         # solo el humo (jsdom/katex locales)
node tests/smoke.js --solo-contenido temas/clase-01.html   # una sola página
tests/shot.sh temas/clase-01.html /tmp/c1.png 1400 3000 [dark]
```

`smoke.js` mueve todos los deslizadores, pulsa todos los botones y reporta errores JS,
fórmulas KaTeX inválidas, `$` sin renderizar, enlaces rotos e ids duplicados.

## 6. Inventario de fuentes y estado

| Fuente | Contenido | Página | Estado |
|---|---|---|---|
| Formulario 1 y 2 | Estadística I completa | `temas/repaso.html` | ver bitácora |
| Clase 01 | Método acumulada, Jacobiano (1D, 2D, nD). Ej. 1–4, Ejercicios 1–11 | `temas/clase-01.html` | |
| Clase 02 | Método FGM; estadísticos de orden. Ejercicios 1–9, Teorema 1 | `temas/clase-02.html` | |
| Clase 03 | Distribuciones muestrales, χ², t. Ejemplos 1–6 | `temas/clase-03.html` | |
| Clase 04 | Distribución F. Ejemplos 3–4, Wackerly 7.15, 7.34, 7.39 | `temas/clase-04.html` | |
| Clase 05 | TLC. Ejemplos 1–7, Lebensztayn 58, 60, 62, 63 | `temas/clase-05.html` | |
| Tablas | χ² (2 págs), t, F (8 págs), K-S | `herramientas/tablas.html` | |
| Lista 1.1 (entrega 20/10/2026) | Transformaciones y estadísticos de orden, 12 ejercicios | `deberes/lista-1-1.html` | |

## 7. Bitácora

### 2026-10-17 — Sesión 1 (creación)
- Leídos: Clases 01–05, Formularios 1–2, Tablas (t, χ², F págs. 1–2, K-S), Lista 1.1.
- Hallazgos clave:
  - Las tablas dan **probabilidad acumulada**; la clase usa **α de cola derecha** → sección 4.3.
  - Formulario usa Exp/Gamma con **β escala**; la Lista 1.1 usa **λ tasa** → sección 4.2.
  - La Lista 1.1 nota los estadísticos de orden como $Y_i$ (sin paréntesis).
  - No hay tabla normal; se usa la fila ∞ de la t.
  - Los PDFs de clase son de "I PAO 2023" (reutilizados); el deber es "II PAO 2026".
- Base construida por el agente principal: `stats.js` (36/36 pruebas contra tablas), `plot.js`, `ui.js`, `site.js`, `style.css`, plantilla, pruebas.
- Herramientas de verificación: venv con numpy/scipy/sympy + Node 24 (nodejs-wheel) + jsdom 24 + KaTeX local.

### 2026-10-17 — Sesión 2 (recuperación y preparación de la publicación)
- Reestructura: el contenido de `Guia/` pasó a la **raíz del repositorio** (`est-mat/`); las rutas relativas siguen válidas.
- Pipeline de tablas movido a `scripts/` (`parse/gen/check/inject` + `build.sh`). `data.js` regenerado idéntico y **inyectado** en `herramientas/tablas.html` entre los marcadores `/* ==== BEGIN DATA ==== */` … `/* ==== END DATA ==== */`.
- Fusión de la **Parte III** de la Lista 1.1 (`deberes/lista-1-1.html`, ej. 7–12); eliminados los fragmentos temporales.
- **Bug corregido:** `<` literal dentro de `$…$` (p. ej. `\P(a<W_n\le b)`) rompía el render de KaTeX. Se escapó a `&lt;` en todo el sitio (`clase-05.html`, `repaso.html`, `clase-02.html`, `lista-1-1.html`, `tablas.html`, `distribuciones.html`). Convención añadida a 4.4. Ahora `npm test` deja **smoke verde en las 11 páginas** y **stats 36/36**.
- Ajuste de `tests/smoke.js`: los deslizadores se mueven alineados a `step` (como el navegador).
- Añadido `package.json` (jsdom + katex por npm), `.gitignore` (excluye `node_modules/`, `scripts/build/`, `.claude/`, `Clases/`, `Tablas/`, `Formularios/`, `Deberes/`, `*.xopp`).
- Eliminado el **nombre del profesor** de la web (`tablas.html`, `lista-1-1.html`, `PROCESO.md`); se conserva FCNM–ESPOL.
- Creados `README.md` y `LICENSE`.
- **Pendiente:** `git init` + commit + `gh repo create est-mat --public` + Pages (bloqueado: falta `gh` y la identidad de Git del usuario).
