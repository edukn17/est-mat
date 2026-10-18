// Pruebas de EM.stats contra valores de las tablas ESPOL (Tablas/*.pdf).
// Ejecutar:  node tests/stats.test.js
const S = require('../assets/js/stats.js');
const D = S.dist;
let fails = 0, n = 0;
function near(name, got, exp, tol) {
  n++;
  if (!(Math.abs(got - exp) <= tol)) { fails++; console.log(`FALLA ${name}: obtuvo ${got}, esperaba ${exp}`); }
}
// t: tabla da cuantiles acumulados (q)
near('t(1) q.975', D.t(1).q(0.975), 12.706, 2e-3);
near('t(8) q.975', D.t(8).q(0.975), 2.306, 1e-3);
near('t(10) q.95', D.t(10).q(0.95), 1.812, 1e-3);
near('t(30) q.999', D.t(30).q(0.999), 3.385, 1e-3);
near('t(5) q.60', D.t(5).q(0.60), 0.267, 1e-3);
near('t(8) cdf 2.306', D.t(8).cdf(2.306), 0.975, 1e-4);
near('t(8) q.025', D.t(8).q(0.025), -2.306, 1e-3);
// chi2
near('chi2(9) q.05', D.chi2(9).q(0.05), 3.325, 1e-3);
near('chi2(9) q.95', D.chi2(9).q(0.95), 16.919, 1e-3);
near('chi2(1) q.95', D.chi2(1).q(0.95), 3.841, 1e-3);
near('chi2(60) q.999', D.chi2(60).q(0.999), 99.607, 2e-3);
near('chi2(2) q.001', D.chi2(2).q(0.001), 0.002, 1e-3);
// F: tabla con q acumulado
near('F(5,9) q.95', D.F(5, 9).q(0.95), 3.48, 1e-2);
near('F(2,2) q.95', D.F(2, 2).q(0.95), 19.0, 1e-2);
near('F(3,5) q.90', D.F(3, 5).q(0.90), 3.62, 1e-2);
near('F(2,1) q.5', D.F(2, 1).q(0.5), 1.50, 1e-2);
near('F crit = q(1-a)', D.F(5, 9).crit(0.05), D.F(5, 9).q(0.95), 1e-12);
near('F reciproco', D.F(5, 9).q(0.05), 1 / D.F(9, 5).q(0.95), 1e-8);
// normal
near('z .975', D.normal().q(0.975), 1.959964, 1e-5);
near('Phi(1)', D.normal().cdf(1), 0.8413447, 1e-7);
near('Phi(-3)', D.normal().cdf(-3), 0.0013499, 1e-7);
near('N(5,2) q.5', D.normal(5, 2).q(0.5), 5, 1e-9);
// beta, gamma, exp, poisson, binom
near('Beta(3,2) mean', D.beta(3, 2).mean, 0.6, 1e-12);
near('Beta(3,2) cdf .58', D.beta(3, 2).cdf(0.58), 0.58 ** 3 * (4 - 3 * 0.58), 1e-10);
near('Gamma(2,3) cdf 4', D.gamma(2, 3).cdf(4), 1 - Math.exp(-4 / 3) * (1 + 4 / 3), 1e-10);
near('Exp(2) sf 3.6', D.exp(2).sf(3.6), Math.exp(-1.8), 1e-12);
near('Pois(3) cdf 2', D.poisson(3).cdf(2), Math.exp(-3) * (1 + 3 + 4.5), 1e-10);
near('Bin(10,.3) cdf 3', D.binom(10, 0.3).cdf(3), 0.6496107184, 1e-8);
near('Cauchy q', D.cauchy().q(0.75), 1, 1e-12);
near('gamma(5)', S.gamma(5), 24, 1e-9);
near('gamma(0.5)', S.gamma(0.5), Math.sqrt(Math.PI), 1e-9);
// generadores: medias aproximadas
const rng = S.mulberry32(42);
near('rand t(10) var', S.var(D.t(10).sample(200000, rng)), 1.25, 0.03);
near('rand chi2(4) mean', S.mean(D.chi2(4).sample(200000, rng)), 4, 0.05);
near('rand F(5,10) mean', S.mean(D.F(5, 10).sample(200000, rng)), 1.25, 0.02);
near('rand beta(3,2) mean', S.mean(D.beta(3, 2).sample(100000, rng)), 0.6, 0.005);
near('rand pois(45) mean', S.mean(D.poisson(45).sample(50000, rng)), 45, 0.15);
console.log(`${n - fails}/${n} pruebas OK`);
process.exit(fails ? 1 : 0);
