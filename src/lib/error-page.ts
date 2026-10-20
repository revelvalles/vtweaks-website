export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>No pudimos cargar la página · VTweaks</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1 id="error-title">No pudimos cargar esta página</h1>
      <p id="error-description">Intenta cargarla de nuevo o vuelve al inicio.</p>
      <div class="actions">
        <button id="error-retry" class="primary" onclick="location.reload()">Reintentar</button>
        <a id="error-home" class="secondary" href="/">Volver al inicio</a>
      </div>
    </div>
    <script>
      try {
        if (localStorage.getItem('vtweaks.language') === 'en') {
          document.documentElement.lang = 'en';
          document.title = 'We could not load the page · VTweaks';
          const copy = {'error-title':'We could not load this page','error-description':'Try loading the page again or return home.','error-retry':'Try again','error-home':'Back to home'};
          for (const [id, text] of Object.entries(copy)) { const node = document.getElementById(id); if (node) node.textContent = text; }
        }
      } catch {}
    </script>
  </body>
</html>`;
}
