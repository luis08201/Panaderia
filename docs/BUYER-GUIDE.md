# Crumb & Oven — guía del comprador / buyer guide

Edición HTML 0.2.0. Empieza por `start-here.html`; visita `template.html` para ver el alcance de esta edición. La guía de estilo es `styleguide.html`.

## Entrega

HTML, CSS y JavaScript sin frameworks; Node.js 20+ para preparar el sitio estático; configuración de Pages CMS; catálogo, productos, Blog, artículos, páginas informativas, búsqueda general, 404 y guías. El catálogo incluye 27 productos publicados de muestra y el Blog 12 artículos en cuatro categorías. Los datos son ejemplos y la disponibilidad se actualiza manualmente. Precios en USD. Consultas por WhatsApp; sin carrito ni pagos. El proveedor de hosting y los planes de servicios los contrata el comprador.

Esta es la edición HTML. Una versión editable nativa de Webflow o Framer necesita su propia adaptación y entrega. El selector ES/EN traduce la interfaz y el contenido con JavaScript; no representa dos sitios completos prerenderizados para SEO multilingüe. La guía de estilo técnica se presenta en inglés.

## 1. Vista previa y publicación

1. Copia el proyecto a una carpeta propia. Instala Node.js 20+ desde nodejs.org.
2. Abre una terminal en esa carpeta y ejecuta `npm run dev`.
3. Abre `http://127.0.0.1:47823`. Para otro puerto en PowerShell: `$env:PORT=47824` y después `npm run dev`.
4. Para publicar: ejecuta `npm test`, `npm run build` y `node scripts/check-prerender.mjs`. Publica únicamente `dist/`.
5. En Cloudflare Workers, cambia el nombre de `wrangler.jsonc`. Conserva `npm run build` como construcción y `dist` como carpeta de recursos. Si el hosting tiene construcción propia, evita omitir este paso: las rutas de productos y artículos se generan en él.
6. Configura el dominio en Configuración → SEO → URL del sitio y vuelve a construir. Esta URL alimenta canonicals y sitemap. El export del comprador la deja vacía para evitar apuntar al dominio de la demo.

## 2. Pages CMS

Guarda tu copia en tu repositorio de GitHub y conéctalo a Pages CMS. La configuración `.pages.yml` define los campos. El CMS crea commits; el hosting debe reconstruir el sitio al actualizar la rama conectada. Comprueba los campos con una edición de prueba en tu copia antes de trabajar en producción.

| Lo que quieres cambiar | Dónde |
|---|---|
| Nombre, lema, teléfono, WhatsApp, horarios, dirección, redes y dominio | Configuración / `content/settings.json` |
| Textos y fotos de portada | Página Home / `content/pages/home.json` |
| Historia, valores y proceso | Página About / `content/pages/nosotros.json` |
| Productos, categorías, precios y disponibilidad | Colecciones de productos y categorías |
| Promociones y fechas | Colección de promociones |
| Artículos y destacados | Blog posts |
| Las cuatro categorías del Blog | Blog categories; All/Todos es un filtro automático |
| Español | “Contenido en español” / `content/locales/es.json` |
| Colores, fuentes, espacios y tamaños | `css/tokens.css` y guía de estilo |

## 3. Idiomas

El contenido base del CMS es inglés. La colección de archivo “Contenido en español” permite editar los textos españoles existentes. Conserva los IDs y el orden de las secciones y galerías. Al crear un producto o artículo nuevo, añade también una entrada bajo su ID en `content/locales/es.json`; como los campos del archivo CMS se definen explícitamente, añade su esquema equivalente a `.pages.yml` para editarlo después desde el panel. La interfaz compartida está en `js/i18n.js`. Si falta una traducción, se usa el inglés como respaldo.

Prueba enlaces directos con `?lang=es` y `?lang=en`, además del selector. La búsqueda incluye los textos de ambos idiomas. Para posicionar páginas independientes por idioma se necesita una ampliación de rutas, HTML y metadatos; no anuncies esa función como incluida.

## 4. Fotos y marca

Las fotografías de la demo están excluidas del paquete. En él, los campos de imagen y las referencias estáticas usan `assets/placeholder.svg`, un recurso neutro creado para esta entrega. Reemplázalo desde el CMS por fotos propias o con permiso para tu uso. Completa también los textos alternativos en ambos idiomas. Usa imágenes WebP optimizadas; conserva una copia pequeña en una subcarpeta `sm/` si quieres activar el `srcset` previsto por el template.

El nombre y lema se cambian en Configuración. Para sustituir el símbolo, edita el símbolo `oven` en `assets/icons/icons.svg` y `favicon.svg`. Los encabezados y pies usan el símbolo compartido. Revisa también `styleguide.html`, `template.html`, `start-here.html` y las etiquetas de respaldo de las páginas HTML para una entrega con tu marca.

## 5. Contacto de demo y contacto real

Con `demoNotice: true`, pulsar WhatsApp o teléfono muestra un aviso local y no envía mensajes ni inicia llamadas. El número de muestra `50500000000` nunca se convierte en un destino real de WhatsApp: conduce al contacto de demostración.

Para activar consultas reales, introduce tus números válidos (código de país incluido), dirección y enlaces; actualiza sus textos españoles; desactiva el aviso de demo; reconstruye y prueba los destinos. El mapa de muestra dirige a Managua: reemplázalo por tu ubicación. No uses información personal en pruebas de la demo.

## 6. Moneda

Esta edición utiliza USD en ambos idiomas. Cambiar de moneda requiere actualizar `js/utils/currency.js`, el formateo estático en `scripts/prerender-products.mjs`, la validación de moneda y los precios en `scripts/build-content.mjs`/contenido, los textos y pruebas que mencionan USD y cualquier precio escrito dentro de promociones. No basta con sustituir el símbolo visual. Prueba el cálculo, el orden por precio y las fichas estáticas tras el cambio. Si quieres mantenerte dentro de la edición entregada, conserva USD.

## 7. English quick reference

Run `npm run dev` locally, or build with `npm run build` and publish `dist/` only. Connect your own GitHub repository to Pages CMS. Edit Settings, Home, About, products, promotions and Blog collections there. Edit existing Spanish copy through “Contenido en español”; new record IDs need corresponding Spanish entries and CMS field definitions. Replace every neutral photo placeholder with your own licensed photos. Update your domain, real contact information and translated settings before disabling the demo notice. Currency is USD. See `THIRD-PARTY.md`, `DISTRIBUTION.md`, `CHANGELOG.md` and `docs/SUPPORT.md` for delivery and support boundaries.
