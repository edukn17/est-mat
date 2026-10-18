/* =====================================================================
   MAPA DEL SITIO — única fuente de verdad para la navegación.
   Para añadir una clase nueva: crear temas/clase-NN.html (copiando
   _plantilla.html) y añadir UNA línea aquí. El menú, el índice y los
   botones anterior/siguiente se generan solos.
   href es relativo a la raíz de Guia/.
   ===================================================================== */
window.EM = window.EM || {};
EM.SITE = [
  { group: 'Inicio', items: [
    { id: 'inicio', title: 'Portada y ruta de estudio', href: 'index.html' },
  ]},
  { group: 'Fundamentos', items: [
    { id: 'repaso', title: 'Repaso exprés de Estadística I', href: 'temas/repaso.html', desc: 'Variables aleatorias, modelos del formulario, FGM, distribuciones conjuntas.' },
  ]},
  { group: 'Clases', items: [
    { id: 'clase-01', title: 'Clase 1 · Funciones de v.a.: acumulada y Jacobiano', href: 'temas/clase-01.html', desc: 'Método de la distribución acumulada, transformación (Jacobiano) univariada, bivariada y n-dimensional.' },
    { id: 'clase-02', title: 'Clase 2 · Método FGM y estadísticos de orden', href: 'temas/clase-02.html', desc: 'Sumas de v.a. independientes con la FGM; mínimo, máximo, Y₍ᵢ₎ y densidades conjuntas.' },
    { id: 'clase-03', title: 'Clase 3 · Distribuciones muestrales: χ² y t', href: 'temas/clase-03.html', desc: 'Estadísticos, X̄ ~ N(μ, σ²/n), (n−1)S²/σ² ~ χ², la t de Student.' },
    { id: 'clase-04', title: 'Clase 4 · La distribución F', href: 'temas/clase-04.html', desc: 'F de Fisher–Snedecor, cociente de varianzas, propiedad del recíproco.' },
    { id: 'clase-05', title: 'Clase 5 · Teorema del límite central', href: 'temas/clase-05.html', desc: 'TLC, aproximaciones normales, corrección por continuidad.' },
  ]},
  { group: 'Herramientas', items: [
    { id: 'formulario', title: 'Formulario completo (Est. I + Est Mat)', href: 'herramientas/formulario.html', desc: 'Todas las fórmulas esenciales en una página: modelos, FGM, transformaciones, estadísticos de orden, χ², t, F y TLC.' },
    { id: 'distribuciones', title: 'Laboratorio de distribuciones', href: 'herramientas/distribuciones.html', desc: 'Explora Normal, χ², t, F, Gamma, Beta… con deslizadores y simulaciones.' },
    { id: 'tablas', title: 'Cómo leer las tablas (χ², t, F, K-S)', href: 'herramientas/tablas.html', desc: 'Percentil vs. valor crítico, colas, tablas interactivas y calculadora.' },
  ]},
  { group: 'Deberes', items: [
    { id: 'lista-1-1', title: 'Lista 1.1 · Transformaciones y estadísticos de orden', href: 'deberes/lista-1-1.html', desc: 'Pistas graduales, soluciones completas y verificación por simulación.' },
  ]},
];
