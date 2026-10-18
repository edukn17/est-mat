/* =====================================================================
   Prueba de humo de las páginas de la guía (sin navegador).
   - Carga cada HTML en jsdom ejecutando sus scripts (KaTeX local).
   - Mueve todos los deslizadores y pulsa todos los botones.
   - Reporta: errores JS, fórmulas KaTeX inválidas, '$' sin renderizar,
     enlaces internos rotos e ids duplicados.

   Requisitos (una vez):  npm install jsdom katex@0.16.11  en alguna carpeta
   y exportar NODE_PATH=<esa carpeta>/node_modules
   Uso:  node tests/smoke.js [--solo-contenido] [archivo.html ...]   (sin args: todas las páginas)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole, ResourceLoader } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const KATEX_DIR = path.dirname(require.resolve('katex/package.json'));

function allPages() {
  const out = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (f === 'node_modules' || f === 'tests' || f.startsWith('.')) continue;
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.html')) out.push(p);
    }
  })(ROOT);
  return out;
}

class Loader extends ResourceLoader {
  fetch(url, opts) {
    const m = url.match(/katex@[^/]+\/dist\/(.*)$/);
    if (m) return Promise.resolve(fs.readFileSync(path.join(KATEX_DIR, 'dist', m[1])));
    if (url.startsWith('http')) return Promise.resolve(Buffer.from('')); // fuentes, etc.
    return super.fetch(url, opts);
  }
}

function stubCanvas(window) {
  const noop = () => {};
  const ctx = new Proxy({}, {
    get(t, k) {
      if (k === 'measureText') return s => ({ width: String(s).length * 7 });
      if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      if (k in t) return t[k];
      return noop;
    },
    set(t, k, v) { t[k] = v; return true; },
  });
  window.HTMLCanvasElement.prototype.getContext = () => ctx;
  window.IntersectionObserver = class { observe() {} disconnect() {} };
  window.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop });
  window.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  window.cancelAnimationFrame = id => clearTimeout(id);
  window.scrollTo = noop;
  Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', { get() { return 700; } });
}

async function check(file) {
  const problems = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => problems.push('JS: ' + (e.detail?.stack || e.message || e).toString().split('\n').slice(0, 3).join(' | ')));
  vc.on('error', (...a) => problems.push('console.error: ' + a.join(' ')));
  const dom = await JSDOM.fromFile(file, {
    runScripts: 'dangerously', resources: new Loader(), pretendToBeVisual: true, virtualConsole: vc,
    beforeParse: stubCanvas,
  });
  const w = dom.window, doc = w.document;
  await new Promise(r => w.addEventListener('load', r));
  await new Promise(r => setTimeout(r, 300));

  // interactuar: deslizadores, selects, botones
  for (const inp of doc.querySelectorAll('input[type=range]')) {
    const min = +inp.min || 0, max = +inp.max || 100;
    const step = +inp.step > 0 ? +inp.step : 1;
    for (const frac of [0, 1, 0.5]) {
      // imita al navegador: el valor se ajusta a un múltiplo del step desde min
      const v = Math.min(max, Math.max(min, min + Math.round(frac * (max - min) / step) * step));
      inp.value = String(v);
      inp.dispatchEvent(new w.Event('input', { bubbles: true }));
    }
  }
  for (const s of doc.querySelectorAll('select')) {
    for (const o of s.options) { s.value = o.value; s.dispatchEvent(new w.Event('change', { bubbles: true })); }
  }
  for (const b of doc.querySelectorAll('button.btn')) { if (b.textContent.trim() !== 'Comprobar') b.click(); }
  await new Promise(r => setTimeout(r, 300));

  // KaTeX
  for (const e of doc.querySelectorAll('.katex-error')) problems.push('KaTeX: ' + (e.getAttribute('title') || '').slice(0, 140) + ' :: ' + e.textContent.slice(0, 80));
  // '$' sin renderizar en texto visible
  const walker = doc.createTreeWalker(doc.body, w.NodeFilter.SHOW_TEXT);
  let n, dollars = 0, sample = '';
  while ((n = walker.nextNode())) {
    const p = n.parentElement;
    if (!p || p.closest('script,style,code,pre,.no-math,.katex')) continue;
    if (/\$/.test(n.textContent)) { dollars++; if (!sample) sample = n.textContent.trim().slice(0, 100); }
  }
  if (dollars) problems.push(`'$' sin renderizar en ${dollars} nodos, p.ej.: «${sample}»`);
  // enlaces internos
  for (const a of doc.querySelectorAll('a[href]')) {
    if (ONLY_CONTENT && a.closest('.sidenav,.page-foot,.topbar')) continue;
    const href = a.getAttribute('href');
    if (/^(https?:|mailto:|#|javascript:)/.test(href)) {
      if (href.startsWith('#') && href.length > 1 && !doc.getElementById(decodeURIComponent(href.slice(1)))) problems.push('Ancla rota: ' + href);
      continue;
    }
    const target = path.resolve(path.dirname(file), href.split('#')[0]);
    if (!fs.existsSync(target)) problems.push('Enlace roto: ' + href);
  }
  // ids duplicados
  const seen = new Map();
  for (const e of doc.querySelectorAll('[id]')) seen.set(e.id, (seen.get(e.id) || 0) + 1);
  for (const [id, c] of seen) if (c > 1) problems.push(`id duplicado: ${id} (${c})`);

  const stats = `${doc.querySelectorAll('.katex').length} fórmulas, ${doc.querySelectorAll('canvas').length} gráficos, ${doc.querySelectorAll('details').length} desplegables`;
  w.close();
  return { problems, stats };
}

const ONLY_CONTENT = process.argv.includes('--solo-contenido'); // ignora enlaces del menú generado
(async () => {
  const files = process.argv.slice(2).filter(a => !a.startsWith('--')).map(f => path.resolve(f));
  const list = files.length ? files : allPages();
  let bad = 0;
  for (const f of list) {
    try {
      const { problems, stats } = await check(f);
      const rel = path.relative(ROOT, f);
      if (problems.length) { bad++; console.log(`✗ ${rel}  (${stats})`); problems.slice(0, 40).forEach(p => console.log('   - ' + p)); }
      else console.log(`✓ ${rel}  (${stats})`);
    } catch (e) { bad++; console.log(`✗ ${f}: ${e.message}`); }
  }
  process.exit(bad ? 1 : 0);
})();
