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
    { id: 'clase-06', title: 'Clase 6 · Estimación puntual: sesgo y MSE', href: 'temas/clase-06.html', desc: 'Estimadores puntuales, insesgadez, sesgo, error cuadrático medio (MSE) y compromiso sesgo–varianza.' },
    { id: 'clase-07', title: 'Clase 7 · Comparación de estimadores y error de estimación', href: 'temas/clase-07.html', desc: 'Eficiencia relativa, insesgadez asintótica, simulación Monte Carlo, cota de error 2σ y tamaño de muestra.' },
    { id: 'clase-08', title: 'Clase 8 · Métodos de estimación: Momentos y Máxima Verosimilitud', href: 'temas/clase-08.html', desc: 'Método de los momentos (MM), función de verosimilitud L(θ), log-verosimilitud, EMV, soporte dependiente y ejemplos.' },
    { id: 'clase-09', title: 'Clase 9 · Estimadores eficientes y Cota de Cramér-Rao', href: 'temas/clase-09.html', desc: 'Eficiencia, función Score, Información de Fisher, cota inferior de varianza y Teorema de Cramér-Rao.' },
    { id: 'clase-10', title: 'Clase 10 · Invarianza, Consistencia y Robustez', href: 'temas/clase-10.html', desc: 'Principio de invarianza de Zehna, normalidad asintótica de EMV, consistencia en probabilidad, desigualdades y robustez.' },
    { id: 'clase-11', title: 'Clase 11 · Modos de convergencia y Borel–Cantelli', href: 'temas/clase-11.html', desc: 'Convergencia c.s., en probabilidad y en distribución, lemas de Borel–Cantelli, mapeo continuo y consistencia del EMV.' },
    { id: 'clase-12', title: 'Clase 12 · Continuidad, Scheffé, Slutsky y Método Delta', href: 'temas/clase-12.html', desc: 'Teorema de continuidad (FGM), teorema de Scheffé, límite Binomial–Poisson, Slutsky y método Delta (1.º y 2.º orden y multivariado).' },
    { id: 'clase-13', title: 'Clase 13 · Leyes Débiles y Fuertes de los Grandes Números', href: 'temas/clase-13.html', desc: 'LDGN de Bernoulli, Khintchine y Chebyshev; LFGN de Borel y Kolmogorov (i.i.d. y no i.d.); medias geométrica y armónica y variables dependientes.' },
    { id: 'clase-14', title: 'Clase 14 · TLC generalizado y Teoría del Valor Extremo', href: 'temas/clase-14.html', desc: 'TLC de De Moivre–Laplace y Liapunov–Lindeberg, pivotes asintóticos, consistencia universal de S² y leyes extremas (Gumbel, Fréchet, Weibull).' },
    { id: 'clase-15', title: 'Clase 15 · Suficiencia y Factorización de Fisher–Neyman', href: 'temas/clase-15.html', desc: 'Estadísticos suficientes por definición condicional, teorema de factorización de Fisher–Neyman y ejemplos clásicos y no regulares.' },
  ]},
  { group: 'Herramientas', items: [
    { id: 'formulario', title: 'Formulario completo (Est. I + Est Mat)', href: 'herramientas/formulario.html', desc: 'Todas las fórmulas esenciales en una página: modelos, FGM, transformaciones, estadísticos de orden, χ², t, F, estimación puntual, modos de convergencia, LGN, TLC y teoría del valor extremo, suficiencia.' },
    { id: 'distribuciones', title: 'Laboratorio de distribuciones', href: 'herramientas/distribuciones.html', desc: 'Explora Normal, χ², t, F, Gamma, Beta… con deslizadores y simulaciones.' },
    { id: 'tablas', title: 'Cómo leer las tablas (χ², t, F, K-S)', href: 'herramientas/tablas.html', desc: 'Percentil vs. valor crítico, colas, tablas interactivas y calculadora.' },
  ]},
  { group: 'Deberes', items: [
    { id: 'lista-1-1', title: 'Lista 1.1 · Transformaciones y estadísticos de orden', href: 'deberes/lista-1-1.html', desc: 'Pistas graduales, soluciones completas y verificación por simulación.' },
    { id: 'lista-1-2', title: 'Lista 1.2 · Teorema del límite central', href: 'deberes/lista-1-2.html', desc: 'Estimación Monte Carlo de π, procesos multiplicativos, sumas de Poisson y particiones aleatorias con simulaciones.' },
    { id: 'deber-estimacion-puntual', title: 'Deber · Estimación puntual (Unidad II)', href: 'deberes/deber-estimacion-puntual.html', desc: '5 ejercicios completos: familias afines y MSE, modelo geométrico, densidad de Rayleigh, familia potencia no regular y exponencial desplazada.' },
  ]},
  { group: 'Libro de Lebensztayn', items: [
    { id: 'lebensztayn', title: 'Lebensztayn · Mapa del Libro y Cap. 5 (Convergencia y Límites)', href: 'deberes/lebensztayn.html', desc: 'Mapa de Exercícios de Probabilidade y solucionario completo del Capítulo 5 (84 de 84 ejercicios resueltos).' },
    { id: 'lebensztayn-cap1', title: 'Lebensztayn · Cap. 1: Análisis Combinatorio', href: 'deberes/lebensztayn-cap1.html', desc: 'Solucionario completo del Capítulo 1 de Élcio Lebensztayn: principios de conteo, permutaciones, combinaciones, inclusión–exclusión e identidades (80/80).' },
    { id: 'lebensztayn-cap2', title: 'Lebensztayn · Cap. 2: Probabilidad', href: 'deberes/lebensztayn-cap2.html', desc: 'Solucionario completo del Capítulo 2 de Élcio Lebensztayn: axiomas, probabilidad condicional, Bayes, independencia y continuidad (80/80).' },
    { id: 'lebensztayn-cap3', title: 'Cap. 3 · Variables Aleatorias', href: 'deberes/lebensztayn-cap3.html' },
  ]},
];
