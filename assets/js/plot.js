/* =====================================================================
   EM.plot — mini motor de gráficos en <canvas>, sensible al tema claro/oscuro.
   Todas las coordenadas se dan en unidades de DATOS.

   Uso típico:
     const p = EM.plot.create('#mi-div', { xmin:-4, xmax:4, ymin:0, ymax:0.45,
                                           height: 280, xlabel:'x', ylabel:'f(x)' });
     p.draw(g => {                       // se redibuja solo al cambiar tamaño/tema
       g.area(x => f(x), -4, 1.96, { color: 'accent', alpha: .35 });
       g.curve(x => f(x), { color: 'c1', width: 2.5 });
       g.vline(1.96, { dash: [4,4], label: '1.96' });
     });
     p.setRange({ymax: 1}); p.redraw();

   Colores: nombres de token ('c1'..'c6','accent','muted','ink','good','bad')
   que se leen de las variables CSS --plot-c1 ... o un color CSS literal.
   ===================================================================== */
(function (global) {
  'use strict';
  const EM = global.EM = global.EM || {};

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function resolveColor(c) {
    if (!c) return cssVar('--plot-c1', '#55247A');
    const map = { c1: '--plot-c1', c2: '--plot-c2', c3: '--plot-c3', c4: '--plot-c4', c5: '--plot-c5', c6: '--plot-c6',
      accent: '--accent', muted: '--muted', ink: '--ink', good: '--good', bad: '--bad', grid: '--plot-grid', bg: '--surface' };
    return map[c] ? cssVar(map[c], '#888') : c;
  }

  function font(px, weight = '') { return `${weight} ${px}px ${cssVar('--font-ui', 'system-ui, sans-serif')}`.trim(); }

  function niceStep(range, target) {
    const raw = range / Math.max(1, target);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
    return nf * mag;
  }
  function tickFmt(v, step) {
    const d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    const s = v.toFixed(Math.min(6, d));
    return s === '-0' ? '0' : s;
  }

  const plots = new Set();

  function create(target, opts = {}) {
    const host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) throw new Error('EM.plot: contenedor no encontrado ' + target);
    host.classList.add('plot-host');
    const canvas = document.createElement('canvas');
    canvas.className = 'plot-canvas';
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const st = Object.assign({
      xmin: 0, xmax: 1, ymin: 0, ymax: 1, height: 280,
      xlabel: '', ylabel: '', grid: true, xticks: 6, yticks: 5,
      margin: { l: 48, r: 14, t: 14, b: 38 }, equal: false,
    }, opts);
    let drawFn = null;
    let W = 0, H = 0;
    const legendItems = [];

    const X = x => st.margin.l + (x - st.xmin) / (st.xmax - st.xmin) * (W - st.margin.l - st.margin.r);
    const Y = y => H - st.margin.b - (y - st.ymin) / (st.ymax - st.ymin) * (H - st.margin.t - st.margin.b);
    const invX = px => st.xmin + (px - st.margin.l) / (W - st.margin.l - st.margin.r) * (st.xmax - st.xmin);
    const invY = py => st.ymin + (H - st.margin.b - py) / (H - st.margin.t - st.margin.b) * (st.ymax - st.ymin);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = host.clientWidth || 600;
      H = typeof st.height === 'function' ? st.height(W) : st.height;
      if (st.equal) H = Math.round(W * (st.ymax - st.ymin) / (st.xmax - st.xmin) * 0.9 + st.margin.t + st.margin.b);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function clip(on) {
      if (on) { ctx.save(); ctx.beginPath(); ctx.rect(st.margin.l, st.margin.t, W - st.margin.l - st.margin.r, H - st.margin.t - st.margin.b); ctx.clip(); }
      else ctx.restore();
    }

    const g = {
      get ctx() { return ctx; }, X, Y, invX, invY,
      get state() { return st; },
      axes() {
        const ink = resolveColor('muted'), grid = resolveColor('grid');
        ctx.font = font(12);
        ctx.fillStyle = ink; ctx.strokeStyle = grid; ctx.lineWidth = 1;
        const xs = niceStep(st.xmax - st.xmin, st.xticks), ys = niceStep(st.ymax - st.ymin, st.yticks);
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (let v = Math.ceil(st.xmin / xs) * xs; v <= st.xmax + 1e-9; v += xs) {
          const px = X(v);
          if (st.grid) { ctx.beginPath(); ctx.moveTo(px, st.margin.t); ctx.lineTo(px, H - st.margin.b); ctx.stroke(); }
          ctx.fillText(tickFmt(v, xs), px, H - st.margin.b + 6);
        }
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let v = Math.ceil(st.ymin / ys) * ys; v <= st.ymax + 1e-9; v += ys) {
          const py = Y(v);
          if (st.grid) { ctx.beginPath(); ctx.moveTo(st.margin.l, py); ctx.lineTo(W - st.margin.r, py); ctx.stroke(); }
          ctx.fillText(tickFmt(v, ys), st.margin.l - 6, py);
        }
        // ejes principales
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.beginPath();
        const y0 = (st.ymin <= 0 && st.ymax >= 0) ? Y(0) : H - st.margin.b;
        ctx.moveTo(st.margin.l, y0); ctx.lineTo(W - st.margin.r, y0);
        const x0 = (st.xmin <= 0 && st.xmax >= 0) ? X(0) : st.margin.l;
        ctx.moveTo(x0, st.margin.t); ctx.lineTo(x0, H - st.margin.b); ctx.stroke();
        if (st.xlabel) { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(st.xlabel, W - st.margin.r, H - 2); }
        if (st.ylabel) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(st.ylabel, 4, 0); }
        return g;
      },
      // curva y = f(x). opts: color, width, dash, from, to, n
      curve(f, o = {}) {
        const a = o.from ?? st.xmin, b = o.to ?? st.xmax, n = o.n ?? Math.max(200, W);
        clip(true);
        ctx.strokeStyle = resolveColor(o.color); ctx.lineWidth = o.width ?? 2.2; ctx.setLineDash(o.dash || []);
        ctx.beginPath(); let pen = false;
        for (let i = 0; i <= n; i++) {
          const x = a + (b - a) * i / n, y = f(x);
          if (!isFinite(y)) { pen = false; continue; }
          const py = Math.max(-1e4, Math.min(1e4, Y(y)));
          if (!pen) { ctx.moveTo(X(x), py); pen = true; } else ctx.lineTo(X(x), py);
        }
        ctx.stroke(); ctx.setLineDash([]); clip(false);
        if (o.label) legendItems.push({ label: o.label, color: resolveColor(o.color), dash: o.dash });
        return g;
      },
      // curva paramétrica (x(t), y(t))
      param(fx, fy, t0, t1, o = {}) {
        const n = o.n ?? 400; clip(true);
        ctx.strokeStyle = resolveColor(o.color); ctx.lineWidth = o.width ?? 2; ctx.setLineDash(o.dash || []);
        ctx.beginPath();
        for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; const px = X(fx(t)), py = Y(fy(t)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke(); ctx.setLineDash([]); clip(false); return g;
      },
      // área bajo f entre a y b
      area(f, a, b, o = {}) {
        a = Math.max(a, st.xmin); b = Math.min(b, st.xmax); if (b <= a) return g;
        const n = o.n ?? 300; clip(true);
        ctx.fillStyle = resolveColor(o.color || 'accent'); ctx.globalAlpha = o.alpha ?? 0.35;
        ctx.beginPath(); ctx.moveTo(X(a), Y(Math.max(st.ymin, 0)));
        for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; const y = f(x); ctx.lineTo(X(x), Y(isFinite(y) ? Math.min(y, st.ymax * 2) : 0)); }
        ctx.lineTo(X(b), Y(Math.max(st.ymin, 0))); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1; clip(false);
        if (o.label) legendItems.push({ label: o.label, color: resolveColor(o.color || 'accent'), box: true });
        return g;
      },
      // histograma de datos. opts: bins, density(true), color, alpha, range:[a,b]
      hist(data, o = {}) {
        if (!data.length) return g;
        const lo = o.range ? o.range[0] : st.xmin, hi = o.range ? o.range[1] : st.xmax;
        const bins = o.bins ?? 40, w = (hi - lo) / bins, counts = new Array(bins).fill(0);
        let inside = 0;
        for (const x of data) { const k = Math.floor((x - lo) / w); if (k >= 0 && k < bins) { counts[k]++; inside++; } else if (x === hi) { counts[bins - 1]++; inside++; } }
        const scale = (o.density ?? true) ? 1 / (data.length * w) : 1;
        clip(true);
        ctx.fillStyle = resolveColor(o.color || 'c2'); ctx.globalAlpha = o.alpha ?? 0.55;
        ctx.strokeStyle = resolveColor('bg'); ctx.lineWidth = 0.6;
        for (let k = 0; k < bins; k++) {
          const h = counts[k] * scale; if (!h) continue;
          const x0 = X(lo + k * w), x1 = X(lo + (k + 1) * w), y = Y(h), y0 = Y(Math.max(0, st.ymin));
          ctx.fillRect(x0, y, x1 - x0, y0 - y); ctx.globalAlpha = 1; ctx.strokeRect(x0, y, x1 - x0, y0 - y); ctx.globalAlpha = o.alpha ?? 0.55;
        }
        ctx.globalAlpha = 1; clip(false);
        if (o.label) legendItems.push({ label: o.label, color: resolveColor(o.color || 'c2'), box: true });
        g.lastHist = { counts, w, lo, scale, maxHeight: Math.max(...counts) * scale };
        return g;
      },
      // barras (p.ej. pmf). xs, ys arrays
      bars(xs, ys, o = {}) {
        const w = o.width ?? 0.7; clip(true);
        ctx.fillStyle = resolveColor(o.color || 'c1'); ctx.globalAlpha = o.alpha ?? 0.8;
        xs.forEach((x, i) => { const x0 = X(x - w / 2), x1 = X(x + w / 2); ctx.fillRect(x0, Y(ys[i]), x1 - x0, Y(0) - Y(ys[i])); });
        ctx.globalAlpha = 1; clip(false);
        if (o.label) legendItems.push({ label: o.label, color: resolveColor(o.color || 'c1'), box: true });
        return g;
      },
      points(xs, ys, o = {}) {
        const r = o.r ?? 2.2; clip(true);
        ctx.fillStyle = resolveColor(o.color || 'c1'); ctx.globalAlpha = o.alpha ?? 0.7;
        for (let i = 0; i < xs.length; i++) { ctx.beginPath(); ctx.arc(X(xs[i]), Y(ys[i]), r, 0, 2 * Math.PI); ctx.fill(); }
        ctx.globalAlpha = 1; clip(false);
        if (o.label) legendItems.push({ label: o.label, color: resolveColor(o.color || 'c1'), dot: true });
        return g;
      },
      line(x1, y1, x2, y2, o = {}) {
        clip(true); ctx.strokeStyle = resolveColor(o.color || 'ink'); ctx.lineWidth = o.width ?? 1.5; ctx.setLineDash(o.dash || []);
        ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke(); ctx.setLineDash([]); clip(false); return g;
      },
      vline(x, o = {}) {
        g.line(x, st.ymin, x, st.ymax, Object.assign({ dash: [5, 4], color: 'ink', width: 1.3 }, o));
        if (o.label) g.text(o.label, x, o.labelY ?? st.ymax, { align: 'center', baseline: 'top', color: o.color || 'ink', dy: 2 });
        return g;
      },
      hline(y, o = {}) { return g.line(st.xmin, y, st.xmax, y, Object.assign({ dash: [5, 4], color: 'muted', width: 1.2 }, o)); },
      polygon(pts, o = {}) {
        clip(true); ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.closePath();
        if (o.fill !== false) { ctx.fillStyle = resolveColor(o.color || 'accent'); ctx.globalAlpha = o.alpha ?? 0.3; ctx.fill(); ctx.globalAlpha = 1; }
        if (o.stroke) { ctx.strokeStyle = resolveColor(o.stroke); ctx.lineWidth = o.width ?? 1.5; ctx.stroke(); }
        clip(false); return g;
      },
      // rellena la región {(x,y): pred(x,y)} con una rejilla de píxeles (útil para regiones 2D)
      region(pred, o = {}) {
        const step = o.step ?? 3; clip(true);
        ctx.fillStyle = resolveColor(o.color || 'accent'); ctx.globalAlpha = o.alpha ?? 0.3;
        for (let px = st.margin.l; px < W - st.margin.r; px += step)
          for (let py = st.margin.t; py < H - st.margin.b; py += step)
            if (pred(invX(px + step / 2), invY(py + step / 2))) ctx.fillRect(px, py, step, step);
        ctx.globalAlpha = 1; clip(false); return g;
      },
      text(s, x, y, o = {}) {
        ctx.font = o.font || font(o.size || 13, o.bold ? '600' : '');
        ctx.fillStyle = resolveColor(o.color || 'ink'); ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.baseline || 'alphabetic';
        ctx.fillText(s, X(x) + (o.dx || 0), Y(y) + (o.dy || 0)); return g;
      },
      legend(pos = 'tr') {
        if (!legendItems.length) return g;
        ctx.font = font(12);
        const pad = 8, lh = 18, wMax = Math.max(...legendItems.map(it => ctx.measureText(it.label).width)) + 30;
        let x = pos.includes('r') ? W - st.margin.r - wMax - pad : st.margin.l + pad;
        let y = st.margin.t + pad;
        ctx.fillStyle = resolveColor('bg'); ctx.globalAlpha = 0.85; ctx.fillRect(x - 4, y - 4, wMax + 8, legendItems.length * lh + 6); ctx.globalAlpha = 1;
        for (const it of legendItems) {
          ctx.fillStyle = it.color; ctx.strokeStyle = it.color;
          if (it.box) ctx.fillRect(x, y + 4, 16, 10);
          else if (it.dot) { ctx.beginPath(); ctx.arc(x + 8, y + 9, 4, 0, 7); ctx.fill(); }
          else { ctx.lineWidth = 2.5; ctx.setLineDash(it.dash || []); ctx.beginPath(); ctx.moveTo(x, y + 9); ctx.lineTo(x + 16, y + 9); ctx.stroke(); ctx.setLineDash([]); }
          ctx.fillStyle = resolveColor('ink'); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(it.label, x + 22, y + 9);
          y += lh;
        }
        return g;
      },
    };

    const api = {
      g, canvas, host,
      setRange(r) { Object.assign(st, r); return api; },
      get state() { return st; },
      // fn(g) dibuja la escena; se llama al redimensionar o cambiar tema
      draw(fn) { drawFn = fn; api.redraw(); return api; },
      redraw() {
        resize();
        ctx.clearRect(0, 0, W, H);
        legendItems.length = 0;
        if (st.autoAxes !== false) g.axes();
        if (drawFn) drawFn(g);
        if (legendItems.length && st.legend !== false) g.legend(st.legendPos || 'tr');
        return api;
      },
      // coordenadas de datos de un evento de ratón
      eventToData(ev) { const r = canvas.getBoundingClientRect(); return { x: invX(ev.clientX - r.left), y: invY(ev.clientY - r.top) }; },
    };
    plots.add(api);
    return api;
  }

  // redibujar todo al cambiar tamaño o tema
  let raf = 0;
  function redrawAll() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => plots.forEach(p => { if (document.body.contains(p.canvas)) p.redraw(); else plots.delete(p); })); }
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', redrawAll);
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', redrawAll);
    document.addEventListener('em-theme', redrawAll);
  }

  // Ajuste de ymax "bonito" a partir de un histograma o función
  function autoYmax(values, pad = 1.12) { const m = Math.max(...values.filter(isFinite)); return m > 0 ? m * pad : 1; }

  EM.plot = { create, redrawAll, autoYmax, resolveColor };
})(window);
