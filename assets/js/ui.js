/* =====================================================================
   EM.ui — maquetación común + widgets interactivos.
   Se carga al FINAL del <body> (después de katex, stats, plot, site).
   Construye: barra superior, menú lateral (desde EM.SITE), índice de la
   página (desde los <h2>), botones anterior/siguiente y casilla de progreso.
   ===================================================================== */
(function (global) {
  'use strict';
  const EM = global.EM = global.EM || {};
  const body = document.body;
  const ROOT = body.dataset.root || '';
  const PAGE = body.dataset.page || '';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignorar */ } },
  };

  function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(c));
    return n;
  }
  const $ = (sel, root = document) => typeof sel === 'string' ? root.querySelector(sel) : sel;

  // ---------------- Matemáticas (KaTeX auto-render) ----------------
  function math(root = document.body) {
    if (typeof renderMathInElement !== 'function') return;
    renderMathInElement(root, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
      ignoredClasses: ['no-math'],
      macros: {
        '\\P': '\\mathbb{P}', '\\E': '\\mathbb{E}', '\\Var': '\\mathbb{V}\\mathrm{ar}', '\\Cov': '\\mathbb{C}\\mathrm{ov}',
        '\\R': '\\mathbb{R}', '\\iid': '\\overset{\\text{iid}}{\\sim}', '\\ind': '\\perp\\!\\!\\!\\perp',
        '\\1': '\\mathbb{1}', '\\dto': '\\xrightarrow{\\;D\\;}', '\\pto': '\\xrightarrow{\\;P\\;}',
      },
    });
  }
  // KaTeX para una cadena suelta -> HTML
  function tex(s, display = false) {
    if (typeof katex === 'undefined') return s;
    try { return katex.renderToString(s, { displayMode: display, throwOnError: false }); } catch (e) { return s; }
  }

  // ---------------- Navegación ----------------
  const flat = (EM.SITE || []).flatMap(g => g.items.map(it => Object.assign({ group: g.group }, it)));
  const doneKey = id => 'em-done-' + id;

  function buildLayout() {
    const main = document.getElementById('contenido') || document.querySelector('main');
    if (!main) return;
    main.classList.add('content');

    const top = el('header', { class: 'topbar' },
      el('button', { class: 'icon-btn menu-btn', 'aria-label': 'Abrir menú', onclick: () => body.classList.toggle('nav-open') }, '☰'),
      el('a', { class: 'brand', href: ROOT + 'index.html' }, el('span', { class: 'brand-mark' }, 'Σ'), ' Estadística Matemática'),
      el('span', { class: 'spacer' }),
      el('button', { class: 'icon-btn', id: 'theme-btn', 'aria-label': 'Cambiar tema', title: 'Tema claro/oscuro', onclick: toggleTheme }, '◐'),
    );

    const nav = el('nav', { class: 'sidenav', 'aria-label': 'Secciones de la guía' });
    for (const g of EM.SITE || []) {
      nav.append(el('div', { class: 'nav-group' }, g.group));
      for (const it of g.items) {
        const done = store.get(doneKey(it.id)) === '1';
        nav.append(el('a', { href: ROOT + it.href, class: 'nav-link' + (it.id === PAGE ? ' active' : '') + (done ? ' done' : '') },
          el('span', { class: 'nav-check' }, done ? '✓' : ''), it.title));
      }
    }
    const scrim = el('div', { class: 'scrim', onclick: () => body.classList.remove('nav-open') });

    // índice de la página a partir de los h2
    const heads = [...main.querySelectorAll('h2')];
    let toc = null;
    if (heads.length > 2) {
      toc = el('aside', { class: 'toc' }, el('div', { class: 'toc-title' }, 'En esta página'));
      heads.forEach((h, i) => {
        if (!h.id) h.id = 'sec-' + (i + 1);
        toc.append(el('a', { href: '#' + h.id }, h.textContent.replace(/\s+/g, ' ')));
      });
    }

    const shell = el('div', { class: 'shell' });
    main.parentNode.insertBefore(shell, main);
    shell.append(nav, main);
    if (toc) shell.append(toc);
    body.prepend(top);
    body.append(scrim);

    // anterior / siguiente + progreso
    const idx = flat.findIndex(it => it.id === PAGE);
    if (idx >= 0) {
      const foot = el('footer', { class: 'page-foot' });
      const chk = el('input', { type: 'checkbox', id: 'done-chk' });
      chk.checked = store.get(doneKey(PAGE)) === '1';
      chk.addEventListener('change', () => {
        store.set(doneKey(PAGE), chk.checked ? '1' : '0');
        const a = nav.querySelector('.nav-link.active');
        if (a) { a.classList.toggle('done', chk.checked); a.querySelector('.nav-check').textContent = chk.checked ? '✓' : ''; }
      });
      if (PAGE !== 'inicio') foot.append(el('label', { class: 'done-label' }, chk, ' Marcar esta sección como estudiada'));
      const pn = el('div', { class: 'prevnext' });
      if (idx > 0) pn.append(el('a', { class: 'pn prev', href: ROOT + flat[idx - 1].href }, el('small', {}, '← Anterior'), flat[idx - 1].title));
      else pn.append(el('span'));
      if (idx < flat.length - 1) pn.append(el('a', { class: 'pn next', href: ROOT + flat[idx + 1].href }, el('small', {}, 'Siguiente →'), flat[idx + 1].title));
      foot.append(pn);
      main.append(foot);
    }

    // resaltar sección activa del índice
    if (toc && 'IntersectionObserver' in window) {
      const links = [...toc.querySelectorAll('a')];
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)); } });
      }, { rootMargin: '0px 0px -70% 0px' });
      heads.forEach(h => obs.observe(h));
    }
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    store.set('em-theme', next);
    document.dispatchEvent(new Event('em-theme'));
  }

  // ---------------- Widgets ----------------
  // Deslizador con etiqueta y valor. Devuelve {input, value, set(v)}
  function slider(container, o) {
    const host = $(container);
    const out = el('output', { class: 'slider-val' });
    const input = el('input', { type: 'range', min: o.min, max: o.max, step: o.step ?? 1, value: o.value });
    const fmt = o.fmt || (v => v);
    const labelHtml = o.tex ? tex(o.tex) : (o.label || '');
    const wrap = el('label', { class: 'slider' }, el('span', { class: 'slider-label', html: labelHtml }), input, out);
    host.append(wrap);
    const api = {
      input,
      get value() { return parseFloat(input.value); },
      set(v) { input.value = v; out.textContent = fmt(parseFloat(input.value)); },
    };
    out.textContent = fmt(parseFloat(input.value));
    input.addEventListener('input', () => { out.textContent = fmt(api.value); o.onInput && o.onInput(api.value); });
    return api;
  }
  function button(container, label, onClick, o = {}) {
    const b = el('button', { class: 'btn' + (o.primary ? ' primary' : ''), type: 'button', onclick: onClick }, label);
    $(container).append(b); return b;
  }
  function select(container, o) {
    const s = el('select', {}, ...o.options.map(op => el('option', { value: op.value }, op.label)));
    if (o.value !== undefined) s.value = o.value;
    s.addEventListener('change', () => o.onChange && o.onChange(s.value));
    $(container).append(el('label', { class: 'select' }, el('span', { class: 'slider-label', html: o.tex ? tex(o.tex) : (o.label || '') }), s));
    return s;
  }
  function numberInput(container, o) {
    const i = el('input', { type: 'number', value: o.value, step: o.step ?? 'any', min: o.min, max: o.max });
    i.addEventListener('input', () => o.onInput && o.onInput(parseFloat(i.value)));
    $(container).append(el('label', { class: 'numin' }, el('span', { class: 'slider-label', html: o.tex ? tex(o.tex) : (o.label || '') }), i));
    return i;
  }
  // Caja de lectura de resultados: set(html) re-renderiza math
  function readout(container) {
    const r = el('div', { class: 'readout', 'aria-live': 'polite' });
    $(container).append(r);
    return { el: r, set(html) { r.innerHTML = html; math(r); } };
  }

  // Pregunta de opción múltiple para autoevaluación
  function quiz(container, o) {
    const host = $(container);
    const box = el('div', { class: 'quiz' }, el('div', { class: 'quiz-q', html: o.question }));
    const fb = el('div', { class: 'quiz-fb' });
    o.options.forEach((op, i) => {
      const b = el('button', { class: 'quiz-opt', type: 'button', html: op });
      b.addEventListener('click', () => {
        box.querySelectorAll('.quiz-opt').forEach(x => x.classList.remove('right', 'wrong'));
        const ok = i === o.answer;
        b.classList.add(ok ? 'right' : 'wrong');
        fb.innerHTML = (ok ? '<b>¡Correcto!</b> ' : '<b>No exactamente.</b> ') + (o.explain || '');
        fb.className = 'quiz-fb ' + (ok ? 'ok' : 'no');
        math(fb);
      });
      box.append(b);
    });
    box.append(fb);
    host.append(box);
    math(box);
    return box;
  }
  // Comprobador numérico: el estudiante escribe su resultado
  function numcheck(container, o) {
    const host = $(container);
    const inp = el('input', { type: 'text', inputmode: 'decimal', placeholder: o.placeholder || 'tu respuesta' });
    const fb = el('span', { class: 'numcheck-fb' });
    const btn = el('button', { class: 'btn', type: 'button' }, 'Comprobar');
    btn.addEventListener('click', () => {
      const v = parseFloat(inp.value.replace(',', '.'));
      const tol = o.tol ?? Math.max(1e-3, Math.abs(o.answer) * 0.01);
      if (Number.isNaN(v)) { fb.textContent = 'Escribe un número.'; fb.className = 'numcheck-fb'; return; }
      const ok = Math.abs(v - o.answer) <= tol;
      fb.innerHTML = ok ? '✓ Correcto' : '✗ Revisa' + (o.hint ? ': ' + o.hint : '');
      fb.className = 'numcheck-fb ' + (ok ? 'ok' : 'no');
      math(fb);
    });
    host.append(el('div', { class: 'numcheck' }, el('span', { class: 'numcheck-q', html: o.prompt || '' }), inp, btn, fb));
    math(host);
  }

  // ---------------- Arranque ----------------
  buildLayout();
  // KaTeX se renderiza cuando todo el script síncrono (incluido el de la página) terminó
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => math());
  else setTimeout(() => math(), 0);
  // abrir <details> si la URL apunta a algo dentro
  window.addEventListener('hashchange', openHashTarget);
  setTimeout(openHashTarget, 50);
  function openHashTarget() {
    const t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!t) return;
    let p = t; while (p) { if (p.tagName === 'DETAILS') p.open = true; p = p.parentElement; }
  }

  EM.ui = { el, $, math, tex, slider, button, select, numberInput, readout, quiz, numcheck, store, toggleTheme, flat };
})(window);
