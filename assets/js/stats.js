/* =====================================================================
   EM.stats — librería de distribuciones para la Guía de Estadística Matemática
   Script clásico (no módulo) para que funcione también abriendo los HTML
   con file:// . Todo cuelga de window.EM.stats.

   CONVENCIONES (iguales al Formulario 2 de ESPOL):
     - Exp(beta):        media beta  (escala).    f(x) = (1/beta) e^{-x/beta}
     - Gamma(alpha,beta): beta = ESCALA.          E = alpha*beta
     - Beta(a,b), Normal(mu, sigma)  <- ojo: se pasa sigma (desv. estándar)
     - Chi2(nu) = Gamma(nu/2, 2)
     - t(nu), F(nu1, nu2)
   Para "tasa" lambda (como en algunos deberes) usar beta = 1/lambda.

   Cada distribución expone: pdf(x), cdf(x), q(p) (cuantil: P(X<=x)=p),
   sf(x) = 1-cdf(x) (cola derecha), crit(alpha) = q(1-alpha) (valor crítico
   con área alpha a la DERECHA, notación de clase), mean, var, rand(rng).
   ===================================================================== */
(function (global) {
  'use strict';
  const EM = global.EM = global.EM || {};

  // ---------- Generador pseudoaleatorio con semilla (mulberry32) ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // rng por defecto: Math.random (excluye 0 para logs)
  const defaultRng = () => { let u; do { u = Math.random(); } while (u === 0); return u; };

  // ---------- Funciones especiales ----------
  const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1;
    let a = LANCZOS[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  function gamma(x) {
    if (Number.isInteger(x) && x > 0 && x < 171) { let r = 1; for (let i = 2; i < x; i++) r *= i; return r; }
    if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
    return Math.exp(lgamma(x));
  }
  function lbeta(a, b) { return lgamma(a) + lgamma(b) - lgamma(a + b); }
  function betaFn(a, b) { return Math.exp(lbeta(a, b)); }
  function factorial(n) { return gamma(n + 1); }
  function lchoose(n, k) { return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1); }
  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    if (n < 60) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
    return Math.exp(lchoose(n, k));
  }

  // Gamma incompleta regularizada inferior P(a,x)  (Numerical Recipes)
  function gammaP(a, x) {
    if (x <= 0) return 0;
    if (!isFinite(x)) return 1;
    if (x < a + 1) {
      let ap = a, sum = 1 / a, del = sum;
      for (let n = 0; n < 1000; n++) {
        ap += 1; del *= x / ap; sum += del;
        if (Math.abs(del) < Math.abs(sum) * 1e-15) break;
      }
      return Math.min(1, sum * Math.exp(-x + a * Math.log(x) - lgamma(a)));
    }
    return 1 - gammaQcf(a, x);
  }
  function gammaQcf(a, x) {
    const FPMIN = 1e-300;
    let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
    for (let i = 1; i < 1000; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  }
  function gammaQ(a, x) { return x <= 0 ? 1 : (x < a + 1 ? 1 - gammaP(a, x) : gammaQcf(a, x)); }

  // Beta incompleta regularizada I_x(a,b)
  function betacf(a, b, x) {
    const FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d; let h = d;
    for (let m = 1; m <= 1000; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }
  function betaI(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }

  function erf(x) { return x >= 0 ? gammaP(0.5, x * x) : -gammaP(0.5, x * x); }
  function erfc(x) { return x >= 0 ? gammaQ(0.5, x * x) : 1 + gammaP(0.5, x * x); }

  // Cuantil normal estándar (Acklam) + un paso de Newton/Halley
  function qnormStd(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pl = 0.02425;
    let x;
    if (p < pl) {
      const q = Math.sqrt(-2 * Math.log(p));
      x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= 1 - pl) {
      const q = p - 0.5, r = q * q;
      x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    const e = 0.5 * erfc(-x / Math.SQRT2) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }

  // Cuantil genérico por bisección sobre la cdf (robusto, monótono)
  function quantileBisect(cdf, p, lo, hi) {
    if (p <= 0) return lo;
    if (p >= 1) return Infinity;
    // expandir el intervalo superior si hace falta
    let guard = 0;
    while (cdf(hi) < p && guard++ < 200) { lo = hi; hi *= 2; }
    for (let i = 0; i < 200; i++) {
      const mid = 0.5 * (lo + hi);
      if (cdf(mid) < p) lo = mid; else hi = mid;
      if (hi - lo < 1e-12 * Math.max(1, Math.abs(mid))) break;
    }
    return 0.5 * (lo + hi);
  }

  // ---------- Generadores ----------
  function rnorm01(rng = defaultRng) {
    const u1 = rng(), u2 = rng();
    return Math.sqrt(-2 * Math.log(u1 || 1e-300)) * Math.cos(2 * Math.PI * u2);
  }
  function rgammaShape(alpha, rng = defaultRng) { // escala 1, Marsaglia–Tsang
    if (alpha < 1) return rgammaShape(alpha + 1, rng) * Math.pow(rng(), 1 / alpha);
    const d = alpha - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
      let x, v;
      do { x = rnorm01(rng); v = 1 + c * x; } while (v <= 0);
      v = v * v * v;
      const u = rng();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }
  function rpois(lambda, rng = defaultRng) {
    if (lambda <= 0) return 0;
    if (lambda > 30) { // suma de trozos pequeños (Poisson es aditiva)
      let k = 0, rem = lambda;
      while (rem > 30) { k += rpois(30, rng); rem -= 30; }
      return k + rpois(rem, rng);
    }
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= rng(); } while (p > L);
    return k - 1;
  }
  function rbinom(n, p, rng = defaultRng) {
    let k = 0;
    for (let i = 0; i < n; i++) if (rng() < p) k++;
    return k;
  }

  // ---------- Fábrica de distribuciones ----------
  function make(o) {
    o.sf = o.sf || (x => 1 - o.cdf(x));
    o.crit = alpha => o.q(1 - alpha);
    o.sample = (n, rng) => { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = o.rand(rng); return a; };
    return o;
  }

  const D = {};

  D.normal = (mu = 0, sigma = 1) => make({
    name: `N(${mu}, ${sigma}²)`, support: [-Infinity, Infinity],
    pdf: x => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI)),
    cdf: x => 0.5 * erfc(-(x - mu) / (sigma * Math.SQRT2)),
    sf: x => 0.5 * erfc((x - mu) / (sigma * Math.SQRT2)),
    q: p => mu + sigma * qnormStd(p),
    mean: mu, var: sigma * sigma,
    rand: rng => mu + sigma * rnorm01(rng),
  });

  D.uniform = (a = 0, b = 1) => make({
    name: `U(${a}, ${b})`, support: [a, b],
    pdf: x => (x >= a && x <= b) ? 1 / (b - a) : 0,
    cdf: x => x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a),
    q: p => a + p * (b - a),
    mean: (a + b) / 2, var: (b - a) ** 2 / 12,
    rand: (rng = defaultRng) => a + (b - a) * rng(),
  });

  D.exp = (beta = 1) => make({ // beta = MEDIA (Formulario)
    name: `Exp(β=${beta})`, support: [0, Infinity],
    pdf: x => x < 0 ? 0 : Math.exp(-x / beta) / beta,
    cdf: x => x <= 0 ? 0 : 1 - Math.exp(-x / beta),
    sf: x => x <= 0 ? 1 : Math.exp(-x / beta),
    q: p => -beta * Math.log(1 - p),
    mean: beta, var: beta * beta,
    rand: (rng = defaultRng) => -beta * Math.log(rng()),
  });
  D.expRate = lambda => D.exp(1 / lambda); // "exponencial de parámetro λ" (tasa)

  D.gamma = (alpha, beta = 1) => make({ // beta = ESCALA (Formulario)
    name: `Gamma(${alpha}, ${beta})`, support: [0, Infinity],
    pdf: x => {
      if (x < 0) return 0;
      if (x === 0) return alpha < 1 ? Infinity : (alpha === 1 ? 1 / beta : 0);
      return Math.exp((alpha - 1) * Math.log(x) - x / beta - lgamma(alpha) - alpha * Math.log(beta));
    },
    cdf: x => gammaP(alpha, x / beta),
    sf: x => gammaQ(alpha, x / beta),
    q: p => quantileBisect(x => gammaP(alpha, x / beta), p, 0, Math.max(1, alpha * beta * 4)),
    mean: alpha * beta, var: alpha * beta * beta,
    rand: rng => beta * rgammaShape(alpha, rng),
  });

  D.chi2 = nu => { const g = D.gamma(nu / 2, 2); g.name = `χ²(${nu})`; return g; };

  D.beta = (a, b) => make({
    name: `Beta(${a}, ${b})`, support: [0, 1],
    pdf: x => (x < 0 || x > 1) ? 0 : Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lbeta(a, b)),
    cdf: x => betaI(x, a, b),
    q: p => quantileBisect(x => betaI(x, a, b), p, 0, 1),
    mean: a / (a + b), var: a * b / ((a + b) ** 2 * (a + b + 1)),
    rand: rng => { const x = rgammaShape(a, rng), y = rgammaShape(b, rng); return x / (x + y); },
  });

  D.t = nu => make({
    name: `t(${nu})`, support: [-Infinity, Infinity],
    pdf: x => Math.exp(lgamma((nu + 1) / 2) - lgamma(nu / 2) - 0.5 * Math.log(nu * Math.PI) - (nu + 1) / 2 * Math.log(1 + x * x / nu)),
    cdf: x => {
      if (!isFinite(nu)) return D.normal().cdf(x);
      const tail = 0.5 * betaI(nu / (nu + x * x), nu / 2, 0.5);
      return x >= 0 ? 1 - tail : tail;
    },
    q: p => {
      if (!isFinite(nu)) return qnormStd(p);
      if (p === 0.5) return 0;
      const cdf = x => { const tail = 0.5 * betaI(nu / (nu + x * x), nu / 2, 0.5); return x >= 0 ? 1 - tail : tail; };
      if (p < 0.5) return -quantileBisect(cdf, 1 - p, 0, 10);
      return quantileBisect(cdf, p, 0, 10);
    },
    mean: nu > 1 ? 0 : NaN, var: nu > 2 ? nu / (nu - 2) : (nu > 1 ? Infinity : NaN),
    rand: rng => rnorm01(rng) / Math.sqrt(2 * rgammaShape(nu / 2, rng) / nu),
  });

  D.F = (n1, n2) => make({
    name: `F(${n1}, ${n2})`, support: [0, Infinity],
    pdf: x => x <= 0 ? 0 : Math.exp(0.5 * n1 * Math.log(n1 / n2) + (n1 / 2 - 1) * Math.log(x) - (n1 + n2) / 2 * Math.log(1 + n1 * x / n2) - lbeta(n1 / 2, n2 / 2)),
    cdf: x => x <= 0 ? 0 : betaI(n1 * x / (n1 * x + n2), n1 / 2, n2 / 2),
    q: p => quantileBisect(x => betaI(n1 * x / (n1 * x + n2), n1 / 2, n2 / 2), p, 0, 10),
    mean: n2 > 2 ? n2 / (n2 - 2) : NaN,
    var: n2 > 4 ? 2 * n2 * n2 * (n1 + n2 - 2) / (n1 * (n2 - 2) ** 2 * (n2 - 4)) : NaN,
    rand: rng => (2 * rgammaShape(n1 / 2, rng) / n1) / (2 * rgammaShape(n2 / 2, rng) / n2),
  });

  D.cauchy = (x0 = 0, g = 1) => make({
    name: `Cauchy(${x0}, ${g})`, support: [-Infinity, Infinity],
    pdf: x => 1 / (Math.PI * g * (1 + ((x - x0) / g) ** 2)),
    cdf: x => 0.5 + Math.atan((x - x0) / g) / Math.PI,
    q: p => x0 + g * Math.tan(Math.PI * (p - 0.5)),
    mean: NaN, var: NaN,
    rand: (rng = defaultRng) => x0 + g * Math.tan(Math.PI * (rng() - 0.5)),
  });

  // ---- Discretas: pmf, cdf, q, rand ----
  D.poisson = lambda => make({
    name: `Pois(${lambda})`, discrete: true, support: [0, Infinity],
    pmf: k => (k < 0 || !Number.isInteger(k)) ? 0 : Math.exp(k * Math.log(lambda) - lambda - lgamma(k + 1)),
    cdf: x => x < 0 ? 0 : gammaQ(Math.floor(x) + 1, lambda),
    q: p => { let k = 0, c = 0; while (k < 1e6) { c += Math.exp(k * Math.log(lambda) - lambda - lgamma(k + 1)); if (c >= p) return k; k++; } return k; },
    mean: lambda, var: lambda,
    rand: rng => rpois(lambda, rng),
  });
  D.binom = (n, p) => make({
    name: `Bin(${n}, ${p})`, discrete: true, support: [0, n],
    pmf: k => (k < 0 || k > n || !Number.isInteger(k)) ? 0 : Math.exp(lchoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)),
    cdf: x => x < 0 ? 0 : x >= n ? 1 : 1 - betaI(p, Math.floor(x) + 1, n - Math.floor(x)),
    q: pr => { let c = 0; for (let k = 0; k <= n; k++) { c += Math.exp(lchoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); if (c >= pr - 1e-12) return k; } return n; },
    mean: n * p, var: n * p * (1 - p),
    rand: rng => rbinom(n, p, rng),
  });
  D.pmfAlias = d => { d.pdf = d.pmf; return d; };

  // ---------- Utilidades de muestras ----------
  const U = {
    mean: a => a.reduce((s, x) => s + x, 0) / a.length,
    var: a => { const m = U.mean(a); return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1); }, // S² (n-1)
    sd: a => Math.sqrt(U.var(a)),
    sum: a => a.reduce((s, x) => s + x, 0),
    min: a => a.reduce((m, x) => x < m ? x : m, Infinity),
    max: a => a.reduce((m, x) => x > m ? x : m, -Infinity),
    sorted: a => a.slice().sort((x, y) => x - y),
    // proporción empírica de una condición
    prop: (a, pred) => a.reduce((s, x) => s + (pred(x) ? 1 : 0), 0) / a.length,
    // replica una función f(rng) M veces
    replicate: (M, f, rng) => { const out = new Array(M); for (let i = 0; i < M; i++) out[i] = f(rng || defaultRng); return out; },
    // cuantil empírico
    quantile: (a, p) => { const s = U.sorted(a); const h = (s.length - 1) * p; const lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); },
  };

  // Formateo numérico cómodo
  function fmt(x, d = 4) {
    if (x === Infinity) return '∞';
    if (x === -Infinity) return '−∞';
    if (Number.isNaN(x)) return '—';
    if (x !== 0 && (Math.abs(x) < 1e-4 || Math.abs(x) >= 1e6)) return x.toExponential(Math.max(1, d - 1)).replace('e', '·10^');
    return (+x.toFixed(d)).toString();
  }

  EM.stats = {
    // especiales
    lgamma, gamma, lbeta, beta: betaFn, factorial, choose, lchoose, gammaP, gammaQ, betaI, erf, erfc, qnormStd,
    // rng
    mulberry32, rng: defaultRng, rnorm01, rgammaShape, rpois, rbinom,
    // distribuciones
    dist: D,
    // utilidades
    ...U, fmt,
    quantileBisect,
  };
  if (typeof module !== 'undefined') module.exports = EM.stats;
})(typeof window !== 'undefined' ? window : globalThis);
