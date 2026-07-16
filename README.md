# Vértice Obras

Sitio demo para empresas de reformas del hogar (pintura, plomería, redes eléctricas,
refuerzo estructural). Incluye panel de administración para editar el contenido y
gestionar las solicitudes que llegan por el formulario de contacto.

## Acceso al panel

| | |
|---|---|
| URL | `/admin` |
| Usuario | `admin` |
| Contraseña | `Vertice2026*Obras` |

Para cambiar las credenciales:

```bash
npm run credenciales "NuevaContrasena"
```

Imprime la contraseña una sola vez y las tres variables que hay que pegar en
`.env.local` (y en Vercel). La contraseña no se guarda en ningún lado: solo su hash.

## Arrancar en local

```bash
npm install
npm run dev
```

Sin `DATABASE_URL`, los datos se guardan en `.data/store.json`. Sirve para trabajar
en local sin montar una base de datos. **No sirve para producción**: en Vercel el
disco se borra en cada despliegue.

## Publicar en Vercel

1. Subir el repositorio a GitHub e importarlo en Vercel.
2. **Conectar la base de datos**: en el proyecto de Vercel → *Storage* →
   *Marketplace* → **Neon**. Al conectarla, `DATABASE_URL` se crea sola.
3. **Cargar las variables** en *Settings → Environment Variables*:
   `ADMIN_USER`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET` (están en `.env.local`).
4. **Crear las tablas**, una sola vez: copiar la `DATABASE_URL` de Neon a
   `.env.local` y ejecutar `npm run db:push` desde la máquina local.
5. Desplegar.

> Si falta `DATABASE_URL` en producción, la web funciona pero **los leads se
> pierden en cada despliegue**. El panel lo avisa en la pantalla de Resumen.

## Qué se puede editar desde el panel

Textos de todas las secciones, datos de contacto (teléfono, WhatsApp, correo,
dirección, horario), servicios (con icono y viñetas), cifras, pasos del proceso,
obras, testimonios y preguntas frecuentes.

Las **imágenes son archivos** dentro de `public/`. Para cambiarlas hay que subir el
archivo ahí y poner la ruta en el panel (pestaña *Trabajos*). No hay subida de
imágenes desde el navegador.

## Reemplazar las imágenes por fotos reales

Las ilustraciones de `public/trabajos/` son placeholders generados, no fotos.
Para usar fotos del cliente:

- **Obras (antes/después)**: subir a `public/trabajos/` y actualizar las rutas desde
  el panel → *Trabajos*.
- **Portada**: el fondo es una composición generada por código. Para usar una foto,
  ver las instrucciones en el comentario al inicio de
  `src/components/sections/hero.tsx`.

## Temas

El sitio tiene tema oscuro (principal) y claro, con un botón flotante para alternar.
El oscuro se sirve por defecto: la detección del tema del sistema está desactivada a
propósito para que la primera impresión sea siempre la versión oscura.

## Estructura

```
src/
  app/
    page.tsx              Landing publica (force-dynamic: lee el contenido en cada visita)
    acciones.ts           Server action del formulario de contacto
    estados.ts            Estados del formulario (separados: "use server" solo exporta funciones)
    admin/
      login/              Entrada al panel (publica)
      (panel)/            Panel protegido: resumen, contenido, solicitudes
      acciones.ts         Server actions del panel
  components/
    sections/             Las 9 secciones de la landing
    motion/               Primitivas de animacion reutilizables
    tema.tsx              Proveedor de tema y boton flotante
  lib/
    content.ts            Esquema del contenido editable (zod) + contenido por defecto
    leads.ts              Esquema y tipos de los leads
    auth.ts               Sesion del admin (PBKDF2 + JWT)
    repo/                 Capa de datos: postgres.ts (produccion) | file.ts (local)
  db/schema.ts            Tablas de Drizzle
proxy.ts                  Proteccion de rutas (en Next 16 se llama proxy, no middleware)
```

## Comandos

```bash
npm run dev           # desarrollo
npm run build         # compilar produccion
npm run typecheck     # revisar tipos
npm run lint          # linter
npm run credenciales  # generar usuario y contrasena nuevos
npm run db:push       # crear las tablas (requiere DATABASE_URL)
```

## Notas técnicas

- **`ADMIN_PASSWORD_HASH` usa `.` como separador, no `$`.** Los archivos `.env`
  expanden `$algo` como variable y destrozarían el hash al leerlo.
- **La landing es `force-dynamic`.** Sin eso, Next la renderizaría una sola vez al
  desplegar y el contenido quedaría congelado pese a editarlo en el panel.
- **Los archivos `"use server"` solo exportan funciones async.** Por eso los estados
  viven en `estados.ts`.
- **Deuda conocida**: en tema claro la escala de color se invierte, así que
  `ink-950` (pensado como el fondo más oscuro) pasa a ser el más claro. Los nombres
  mienten un poco en claro; documentado en `globals.css`.
