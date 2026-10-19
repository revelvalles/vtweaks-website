# Trabajar juntos en VTweaks

## Descargar y abrir

Instala Git y Node.js 24 LTS con npm. Acepta primero la invitación al repositorio privado desde tu cuenta de GitHub.

```cmd
git clone https://github.com/revelvalles/vtweaks-website.git
cd vtweaks-website
npm ci
npm run dev
```

Abre http://127.0.0.1:5179/. Si descargaste el ZIP con **Code > Download ZIP**, extrae los archivos antes de ejecutar npm. Para enviar cambios conviene clonar con Git.

## Enviar un cambio

Empieza con `main` actualizado y crea una rama con un nombre descriptivo:

```cmd
git switch main
git pull --ff-only
git switch -c mejora/navegacion
```

Edita los archivos y revisa tu cambio en el navegador. Después:

```cmd
git status
git add src
git commit -m "Mejora la navegacion del sitio"
git push -u origin mejora/navegacion
```

Añade también los archivos concretos de `public` u otras carpetas que hayas cambiado. Abre un **Pull request** en GitHub hacia `main` y explica qué cambió, cómo revisarlo y qué sigue pendiente. El propietario revisa e integra el cambio. No uses `push --force` ni reescribas commits publicados.

## Configuración y servicios

- El frontend puede abrirse sin claves privadas. La configuración pública de Supabase vive en `src/lib/account-config.ts`.
- Las cuentas y pagos apuntan al servicio existente: usa cuentas y pagos de prueba. Los correos de recuperación y confirmación vuelven al dominio de producción configurado.
- Para trabajar en diseño usa las demostraciones locales del sitio. No hace falta exportar usuarios ni obtener claves de administración.
- El asistente local queda sin configurar si no existen las variables de servidor. No copies claves de producción para editar el diseño. Consulta al propietario para un entorno de desarrollo aislado.
- `supabase/` contiene código de funciones y migraciones parciales de la integración existente; no es una exportación completa de la base de datos original. No ejecutes migraciones ni despliegues sobre producción como parte de una instalación local.
- Cambiar archivos en GitHub no publica automáticamente en Vercel salvo que el propietario haya conectado esa integración. La publicación actual se gestiona por separado.

## Archivos privados

No subas `.env.local`, tokens, claves de Stripe/Groq, sesiones, exportaciones de clientes, logs o capturas de paneles privados. `.env.example` está vacío a propósito. Los secretos de servidor permanecen en Vercel y Supabase.

## Mapa rápido

| Carpeta | Contenido |
| --- | --- |
| `src/routes` | Páginas y rutas |
| `src/components/vtweaks` | Componentes del sitio y demos |
| `src/components/ui` | Controles de interfaz |
| `src/reference-ui.css` | Últimos ajustes de tarjetas, navegación y demo |
| `src/server` | Asistente del servidor |
| `public` | Imágenes, logotipos y recursos públicos |
| `supabase` | Funciones, migraciones y notas de pagos |

Conserva las atribuciones de recursos y componentes de terceros. Los medidores de la demo son ilustrativos; el website no ejecuta tweaks de Windows.
