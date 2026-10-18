#!/usr/bin/env bash
# Captura de pantalla de una página con Firefox headless (perfil temporal propio,
# así varias capturas pueden correr en paralelo).
# Uso: tests/shot.sh pagina.html salida.png [ancho] [alto] [dark]
set -euo pipefail
page="$(realpath "$1")"; out="$2"; w="${3:-1400}"; h="${4:-2400}"
prof="$(mktemp -d)"
if [ "${5:-}" = "dark" ]; then echo 'user_pref("ui.systemUsesDarkTheme", 1); user_pref("layout.css.prefers-color-scheme.content-override", 0);' > "$prof/user.js"; fi
timeout 90 firefox --headless --no-remote --profile "$prof" --window-size="$w,$h" --screenshot "$(realpath -m "$out")" "file://$page" >/dev/null 2>&1 || true
rm -rf "$prof"
[ -f "$out" ] && echo "captura: $out" || echo "falló la captura"
