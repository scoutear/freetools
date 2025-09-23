// coordscout/dist/campograma.js
// Shim que carga el bundle real (script.js) desde GitHub Pages.
// Esto evita el error "Unexpected token '<'" si algo sigue pidiendo campograma.js.

(async function () {
  try {
    // URL absoluta apuntando a tu repo en GitHub Pages:
    const base = location.origin + '/freetools/coordscout/dist/';
    const target = base + 'script.js';

    const res = await fetch(target, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo cargar ' + target + ' (status ' + res.status + ')');
    const code = await res.text();

    // Insertar el bundle en la página y ejecutarlo
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.text = code;
    document.head.appendChild(s);

  } catch (err) {
    console.error('Shim fallback failed:', err);
    // Mostrar un error visible para debug
    const pre = document.createElement('pre');
    pre.style.color = 'red';
    pre.textContent = 'ERROR cargando app: ' + err.message;
    document.body.appendChild(pre);
  }
})();
