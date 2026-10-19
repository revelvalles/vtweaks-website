# VTweaks · Website

Código del sitio de VTweaks: presentación de la app, demostración interactiva, juegos, planes, cuentas e integración con servicios existentes.

**Sitio publicado:** https://vtweaks-landing.vercel.app/

## Abrir en tu equipo

Requisitos: **Node.js 24 LTS**, npm y Git. La versión usada en esta entrega es Node.js 24.15.0; está indicada en `.nvmrc`.

```cmd
git clone https://github.com/revelvalles/vtweaks-website.git
cd vtweaks-website
npm ci
npm run dev
```

Abre **http://127.0.0.1:5179/**. El puerto es fijo. También puedes descargar **Code > Download ZIP**, extraerlo y ejecutar los dos comandos de npm dentro de la carpeta.

El frontend no necesita claves privadas para abrir. El asistente local requiere configuración de servidor y permanece sin configurar cuando esas variables están vacías. Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para trabajar con ramas y enviar cambios.

## Compilar

```cmd
npm run build
node .output/server/index.mjs
```

React 19, TypeScript, TanStack Start, Vite, Tailwind y Nitro. El proyecto usa SSR: no basta con subir un HTML o configurar `dist` como una web estática. `package-lock.json` fija la instalación con npm; `bun.lock` conserva la exportación original.

## Integraciones

- **Supabase:** cuentas y permisos del servidor. El navegador contiene exclusivamente la URL y clave publicable; nunca `service_role`.
- **Stripe:** checkout de **prueba**, conectado mediante Edge Functions de Supabase. App **14,99 USD**, ISO **19,99 USD**, conjunto **24,99 USD**. No hay cobros reales habilitados ni entrega pública de ISO/instalador.
- **Groq:** el asistente se procesa en `src/server/assistant.ts`; sus secretos se configuran exclusivamente en el servidor de Vercel. `.env.example` solo contiene nombres vacíos para desarrollo.
- **Vercel:** producción en el enlace superior. El preset de Nitro selecciona `vercel` al compilar dentro de Vercel y `node-server` localmente. No cambies la salida a `dist` ni añadas una redirección general a `index.html`.

Las funciones y migraciones de `supabase/` documentan la continuación de una base de datos existente; este repositorio no contiene un respaldo completo de sus tablas iniciales ni datos de usuarios. No es necesario desplegarlas para editar el frontend.

## Publicación

La publicación actual se realiza desde esta fuente mediante la CLI de Vercel y su proyecto existente. Subir código a GitHub no configura por sí solo el despliegue automático.

El propietario puede publicar desde una sesión ya autorizada:

```cmd
npx vercel deploy --prod --scope velpris-projects
```

Vercel compila desde la fuente. Las claves privadas se mantienen en sus ajustes y en los secretos de Supabase; no se incluyen en Git ni se comparten para colaborar en el diseño.

## Origen y recursos

Continuación local del proyecto **VTweaks Core** de Lovable, exportado el 8 de octubre de 2026 desde el commit `9c86356b341c032de4c2f4cdc6c35739a0dfb509`. Proyecto original: https://lovable.dev/projects/4a4078ee-4ca9-4dac-b470-161b1bf1f34d. La copia remota original no recibe automáticamente los cambios de esta continuación local.

Las fuentes de logotipos constan en `public/game-logo-sources.json` y `public/game-logos/sources.json`; las atribuciones de React Bits están en `public/react-bits-license.txt`. Conserva esas atribuciones. Los medidores y switches de la demo son ilustrativos y no ejecutan operaciones de Windows.
