# Blog de Crumb & Oven

Implementación de Blog y categorías para el template. Se publica mediante la integración de la rama main con el hosting.

## Dos colecciones y dos tipos de página

- **Blog posts**: artículos, autor, fecha, foto, categoría, destacados, publicación y contenido organizado por secciones.
- **Blog categories**: cuatro categorías independientes de las categorías de productos. Se pueden editar nombre, descripción y orden. La creación/eliminación de categorías está desactivada en el CMS para mantener exactamente cuatro; la compilación también comprueba esta cantidad.
- **Página Blog**: `blog.html`, con tres destacados y los doce artículos iniciales ordenados por fecha, búsqueda y categorías.
- **Plantilla de artículo**: `article.html`, que genera una página por artículo en `blog/<article-address>/index.html`. Estas páginas son las instancias de una sola plantilla CMS.

“All” es una opción automática para ver todas las categorías; no es una quinta entrada del CMS. Las cuatro categorías iniciales son Baking basics, Ingredients & craft, Serving & sharing y From the bakery, con tres artículos cada una.

Los tres artículos destacados también aparecen entre los doce del listado general. Son los mismos artículos mostrados en dos contextos, no quince entradas distintas. La búsqueda y las categorías actúan sobre el listado “All the latest stories”; la selección editorial de destacados permanece visible.

## Cómo editar desde Pages CMS

1. Abrir el repositorio y seleccionar la rama main en Pages CMS. El panel leerá las dos colecciones añadidas a `.pages.yml`.
2. Entrar en **Blog posts** y seleccionar un artículo.
3. Editar **Article title**, **Short preview**, la categoría, fecha, autor y foto.
4. Escribir el inicio en **Opening paragraph**. En **Article sections**, añadir o editar los bloques con su título y texto. Una línea en blanco crea un nuevo párrafo.
5. Activar **Featured article** para incluirlo entre los destacados. Se muestran los tres más recientes que tengan esa opción.
6. Usar **Published** para mostrar u ocultar el artículo. Los cambios se reflejan al recompilar/publicar mediante el flujo habitual del proyecto.

Las direcciones de artículo y los IDs deben ser únicos. Evitar cambiar la dirección de un artículo que ya se haya compartido, salvo que se prepare una redirección. Las fotos del blog tienen su propia biblioteca en `assets/images/blog/`.

La configuración fue preparada siguiendo la documentación de [colecciones de Pages CMS](https://pagescms.org/docs/configuration/), [referencias entre colecciones](https://pagescms.org/docs/configuration/fields/reference/) y [operaciones permitidas](https://pagescms.org/docs/configuration/content/operations/). No se inició sesión ni se probó guardar contenido en el panel conectado.

## Contenido inicial

Se incluyen doce artículos originales en inglés, con introducción y tres secciones cada uno. Son contenido de demostración para el template. Las fotos se reutilizan de los recursos de ejemplo existentes, con copias separadas para que editar la biblioteca del blog no cambie las imágenes del catálogo.

| Categoría | Artículos |
|---|---|
| Baking basics | A simple guide to sourdough; Why bread needs time to cool; Getting to know your crust |
| Ingredients & craft | What goes into a good loaf; A closer look at whole grains; Butter, layers, and a little patience |
| Serving & sharing | A breakfast worth slowing down for; The art of a bread board; Small celebrations, thoughtful details |
| From the bakery | A morning in the bakery; Why we bake in small batches; Meet your next afternoon ritual |

La colección de artículos admite nuevas entradas; doce es la cantidad inicial, no un límite permanente del CMS. El script opcional `scripts/seed-blog.mjs` solo crea los ejemplos una vez y se detiene si las colecciones ya existen. No se ejecuta durante las compilaciones.

## Comportamiento del sitio

- Busca por título, resumen, categoría y texto; admite mayúsculas, acentos y varios términos.
- Combina búsqueda con categoría, guarda ambas en la URL y las recupera al recargar.
- Muestra el total de resultados, estado vacío y controles para limpiar filtros.
- Ordena del artículo más reciente al más antiguo, con fecha y tiempo de lectura calculado.
- Los artículos incluyen índice de secciones, regreso al Blog y dos lecturas relacionadas de su categoría.
- Los borradores se excluyen de los datos públicos, páginas generadas y sitemap.
- Tanto el listado inicial como los artículos se generan en HTML durante el build. Sin JavaScript se puede leer y navegar; los filtros se ocultan porque requieren JavaScript.
- Cada artículo generado tiene título, descripción e imagen social propios en el HTML inicial. Si se configura el dominio en Settings, se añaden canonical, URLs sociales absolutas, sitemap y datos BlogPosting.
- Una dirección inexistente recibe la página 404 del servidor estático. El acceso alternativo `article.html?slug=…` tiene una pantalla de recuperación y `noindex` cuando no encuentra el artículo.

## Archivos

- `.pages.yml`: definición de ambas colecciones y biblioteca de fotos.
- `content/blog-posts/` y `content/blog-categories/`: fuente editable.
- `scripts/blog-content.mjs`: normalización y validación.
- `scripts/prerender-blog.mjs`: HTML generado para listado y artículos.
- `js/modules/blog.js`: búsqueda, filtros y plantilla interactiva.
- `js/modules/blog-markup.js`: presentación compartida y escape del texto del CMS.
- `js/utils/blog.js`: búsqueda normalizada, fechas y direcciones.
- `css/blog.css`: diseño responsive y estados interactivos.
- `public-data/blog.json`: datos generados, excluidos de Git.

## Verificación

- `npm run build`: doce artículos y listado generados, además de los productos existentes.
- `npm test`: catorce pruebas aprobadas. Incluyen borradores, cuatro categorías, referencias inválidas, fechas imposibles, slugs duplicados, búsquedas combinadas, escape del texto y enlaces internos del artículo.
- Navegador real: doce artículos abiertos con H1 y título propios, tres secciones y relacionados. Búsqueda `BÚTTER layers` más Ingredients & craft devuelve un resultado; conserva el resultado al recargar. Una consulta sin coincidencias muestra recuperación y vuelve a doce.
- Cuatro filtros de categoría devuelven tres artículos cada uno; All devuelve doce.
- Dos páginas representativas en 1920, 1440, 1280, 992, 991, 767, 479 y 390 px: sin overflow horizontal ni solapamiento detectado entre logo y navegación de escritorio.
- Evidencia en `docs/evidence/blog-articles.json`, `blog-responsive.json` y capturas `blog-*.jpg`.

No se ha ejecutado carga agresiva ni modificado contenido a través del CMS en línea.

Las capturas y los registros de QA de `docs/evidence/` son archivos locales, excluidos de Git y del paquete público.
