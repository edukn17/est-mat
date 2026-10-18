/* Aplica el tema guardado ANTES de pintar (evita parpadeo). Cargar en <head>. */
(function () {
  try {
    const t = localStorage.getItem('em-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) { /* sin almacenamiento: se usa el tema del sistema */ }
})();
