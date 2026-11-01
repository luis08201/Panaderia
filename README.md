# Crumb & Oven · catálogo de panadería

Sitio web de una panadería en Managua, en español y tipo catálogo: muestra productos con precios en córdobas (C$), fotos, disponibilidad, búsqueda y filtros, y permite consultar por WhatsApp. **No es una tienda en línea**: no hay carrito, checkout, pagos ni cuentas de cliente.

Está hecho con HTML, CSS y JavaScript sin frameworks. El contenido se edita con [Pages CMS](https://pagescms.org), que guarda cada cambio como un commit en GitHub. Node.js solo se usa para validar el contenido y preparar la carpeta que se publica; no hay backend.

> **Datos de ejemplo.** El nombre «Crumb & Oven», el teléfono, el WhatsApp (`50500000000`), la dirección, los horarios y los precios son provisionales. El sitio lo avisa en la barra superior y en las secciones de contacto. Cuando tengas los datos reales, cámbialos en **Configuración** dentro de Pages CMS y desactiva «Mostrar aviso de datos de ejemplo».

## Páginas

| Página | Qué muestra |
| --- | --- |
| `index.html` | Barra de anuncio, portada, categorías, destacados, «Recién horneados», promociones vigentes, historia breve y cómo visitarnos |
| `catalogo.html` | Todos los productos publicados con búsqueda, filtro por categoría y orden. Los filtros quedan en la URL: `catalogo.html?categoria=pan-dulce&q=coco&orden=precio-asc` |
| `producto.html?slug=…` | Ficha con foto (y galería si la hay), precio, presentación, disponibilidad, ingredientes, alérgenos, consulta por WhatsApp y productos relacionados. Un slug que no existe muestra un aviso con enlace al catálogo |
| `nosotros.html` | Historia, valores, proceso artesanal y galería |
| `contacto.html` | WhatsApp, teléfono, dirección con enlace a Google Maps, horarios y redes |
| `404.html` | Página de error para direcciones que no existen |
| `styleguide.html` | Guía visual en inglés con marca, colores, tipografía, componentes y estados interactivos de muestra. Véase `docs/STYLEGUIDE.md` |
| `blog.html` | Blog con destacados, doce artículos iniciales, búsqueda y cuatro categorías más All |
| `article.html` y `blog/<slug>/` | Plantilla CMS y páginas generadas por artículo con índice y relacionados. Véase `docs/BLOG.md` |

## Ejecutarlo en local

Requiere Node.js 20 o superior. No hay dependencias que instalar.

```bash
npm run dev
```

Abre <http://127.0.0.1:47823>. El servidor de desarrollo genera `public-data/` al arrancar y lo vuelve a generar cada vez que cambia algo en `content/`, así que puedes editar los JSON a mano y recargar la página. Para usar otro puerto: `PORT=5000 npm run dev`.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor local con recompilación automática del contenido |
| `npm run check` | Valida el contenido sin escribir nada |
| `npm run build` | Valida, genera `public-data/` y copia el sitio publicable en `dist/` |

## Estructura

```text
panaderia/
├── index.html, catalogo.html, producto.html, nosotros.html, contacto.html, 404.html
├── .pages.yml                 Configuración de Pages CMS
├── content/                   Lo que edita Pages CMS (fuente de verdad)
│   ├── products/              Un JSON por producto
│   ├── categories/            Un JSON por categoría
│   ├── promotions/            Un JSON por promoción
│   ├── pages/home.json        Textos e imágenes del inicio
│   ├── pages/nosotros.json    Textos e imágenes de Nosotros
│   └── settings.json          Negocio, WhatsApp, horarios, redes, anuncio y SEO
├── assets/
│   ├── images/{products,categories,general}/   Fotos (las carpetas sm/ guardan copias pequeñas)
│   ├── fonts/                 Playfair Display e Inter (WOFF2, alojadas en el sitio)
│   ├── vendor/gsap/           GSAP 3.15 y ScrollTrigger (copias minificadas, sin npm)
│   └── icons/icons.svg        Iconos
├── css/                       tokens, reset, global, components, pages
├── js/
│   ├── app.js                 Arranque común y carga del módulo de cada página
│   ├── config.js
│   ├── modules/               data-loader, navigation, content, cards, filters, catalog,
│   │                          product-detail, home, about, whatsapp, seo, motion
│   └── utils/                 currency, normalize, dates, dom
├── scripts/
│   ├── build-content.mjs      Valida content/ y genera public-data/ (+ sitemap.xml y robots.txt)
│   ├── build-site.mjs         Copia lo publicable a dist/
│   └── dev-server.mjs         Servidor local
├── public-data/               Generado: lo que lee el navegador (no se versiona)
└── .github/workflows/validar-contenido.yml
```

Cambios respecto a la estructura sugerida en la especificación:

- **`dist/`**: el hosting publica solo esta carpeta, así que `content/`, `scripts/` y la configuración no quedan expuestos.
- **`public-data/` se genera en cada build** y está en `.gitignore`. Así nunca queda desactualizado respecto al CMS.
- **Módulos extra**: `cards.js`, `content.js`, `home.js`, `about.js`, `seo.js` y `utils/dates.js`, para que cada página tenga su propio módulo.
- **Sin `reset` de terceros ni dependencias de npm.**

## Animaciones

`js/modules/motion.js` reúne las animaciones; se hacen con [GSAP](https://gsap.com) y su complemento ScrollTrigger, alojados en `assets/vendor/gsap/`.

- **Entrada**: el texto del hero, los encabezados de página y la ficha de producto suben y aparecen en escalonado. Esta parte es CSS (`global.css`) para que se reproduzca desde el primer pintado.
- **Al hacer scroll**: los encabezados de sección, las tarjetas de categoría y producto, las promociones, los bloques de historia, valores y proceso, y las tarjetas de contacto aparecen al entrar en pantalla.
- **Parallax**: la foto del hero se desplaza más lento que la página y el texto se atenúa al bajar. La foto de «Nuestra historia» se acerca suavemente.
- **Catálogo**: los resultados se animan de nuevo cada vez que cambias la búsqueda, la categoría o el orden.
- **Detalles**: el menú móvil despliega sus enlaces en escalonado, el encabezado gana sombra al desplazarse y las miniaturas de la ficha funden la foto.

Decisiones para no perder rendimiento ni accesibilidad:

- GSAP se descarga después del evento `load`, así que no compite con el contenido principal. Lo que se pinta antes de que llegue se queda tal cual; solo se animan los elementos que aún están fuera de pantalla.
- Las fotos principales del hero y de la ficha nunca se escalan ni se desvanecen, porque Chrome lo contaría como un nuevo LCP.
- Solo se animan `opacity` y `transform`: no hay desplazamientos de diseño, y las tarjetas que aún no aparecen siguen siendo alcanzables con Tab.
- Con «Reducir movimiento» activado en el sistema no se carga GSAP ni se reproduce ninguna animación.
- Si GSAP no carga, todo el contenido se ve igual, sin animación.

Para ajustar duraciones o qué elementos se animan, edita `motion.js` (selector `REVEAL` y las funciones de cada efecto). GSAP se distribuye bajo su [licencia estándar](https://gsap.com/standard-license), gratuita también para uso comercial.

## Modelo de contenido

### Producto (`content/products/<slug>.json`)

| Campo | Notas |
| --- | --- |
| `id` | Obligatorio, único y estable (`prd-001`). No depende del nombre; no lo cambies después de crearlo |
| `slug` | Obligatorio y único. Minúsculas, números y guiones. Forma la dirección `producto.html?slug=…` |
| `name` | Obligatorio |
| `categoryId` | Obligatorio. Debe ser el `id` de una categoría existente (en Pages CMS se elige de una lista) |
| `shortDescription`, `description` | Texto plano; una línea en blanco separa párrafos |
| `price` | Número ≥ 0 en córdobas. **Si se deja vacío, el sitio muestra «Precio a consultar»**: nunca se inventa un precio |
| `unit` | Presentación: «Unidad», «Bolsa de 6 unidades», «Pastel entero, 12 porciones»… |
| `currency` | Siempre `NIO` |
| `image`, `imageAlt` | Foto principal (obligatoria) y su texto alternativo (si falta se usa el nombre) |
| `gallery` | Hasta 6 fotos adicionales |
| `ingredients`, `allergens` | Listas opcionales; la ficha solo muestra lo que tenga datos |
| `available` | Si es `false`, el producto sigue visible con la etiqueta «Agotado», en gris y al final del orden recomendado |
| `featured` | Aparece en «Favoritos de la casa» (máximo 8) |
| `newArrival` | Etiqueta «Nuevo» y aparece en «Recién horneados» (máximo 4) |
| `published` | Si es `false`, el producto no se muestra pero no se borra |
| `sortOrder` | Orden dentro de su categoría (menor primero) |
| `seoTitle`, `seoDescription` | Opcionales; si faltan se usan el nombre y la descripción corta |

**Categorías**: `id`, `slug`, `name`, `description`, `image`, `position`, `published`. Si una categoría se despublica, sus productos tampoco se muestran.

**Promociones**: `id`, `title`, `description`, `image`, `startDate`, `endDate`, `active`, `linkUrl`, `linkLabel`. Son informativas. El sitio solo muestra las activas cuya fecha de hoy (hora de Managua) está dentro de la vigencia, así que una promoción vencida desaparece sola al día siguiente sin volver a publicar. El ejemplo «Rosquillas de septiembre» ya venció y por eso no se ve.

### Validaciones del build

`npm run build` (y `npm run check`) detiene la publicación con un mensaje en español si encuentra:

- campos obligatorios vacíos, JSON inválido, o IDs/slugs duplicados en productos, categorías o promociones;
- slugs con mayúsculas, espacios o tildes;
- un producto cuya categoría no existe;
- precios negativos o que no son números, o una moneda distinta de NIO;
- imágenes que no existen en el repositorio;
- fechas con formato incorrecto o inicio posterior al fin;
- enlaces `#` o `javascript:`;
- un número de WhatsApp sin código de país.

Además avisa, sin detener el build, de categorías vacías y de productos publicados cuya categoría está oculta. Las rutas de imágenes se aceptan con o sin `/` inicial (Pages CMS puede guardarlas de las dos formas) y se convierten en relativas, para que el sitio funcione también desde un subdirectorio.

## Guía de Pages CMS

Pages CMS edita los archivos del repositorio de GitHub mediante formularios. Es la única interfaz de edición: no hay un `/admin` propio.

### Puesta en marcha

1. El sitio vive en el repositorio [`luis08201/Panaderia`](https://github.com/luis08201/Panaderia), con `.pages.yml` en la raíz, que es donde Pages CMS lo busca.
2. Entra en [app.pagescms.org](https://app.pagescms.org), inicia sesión con GitHub e instala la aplicación de Pages CMS en ese repositorio.
3. Elige el repositorio y la rama `main`. Verás en el menú: **Productos**, **Categorías**, **Promociones**, **Página de inicio**, **Página Nosotros** y **Configuración**, además de las tres carpetas de fotos.
4. Para que otra persona edite sin cuenta de GitHub, invítala por correo desde la sección de colaboradores de Pages CMS.

### Tareas habituales

- **Añadir un producto**: Productos → Nuevo. Usa un ID nuevo (`prd-029`, `prd-030`…), un slug sin tildes (`pan-de-ajo`), elige la categoría y sube la foto. Guardar crea `content/products/pan-de-ajo.json`.
- **Cambiar un precio o marcar «Agotado»**: abre el producto, edita «Precio (C$)» o desactiva «Disponible hoy» y guarda.
- **Ocultar sin borrar**: desactiva «Publicado».
- **Eliminar**: borra la entrada desde la lista de productos.
- **Cambiar la portada, horarios o WhatsApp**: Página de inicio o Configuración.
- **Ocultar la barra de anuncio**: Configuración → Barra de anuncio → desactiva «Mostrar».

### Fotos

- Sube JPG o WebP horizontales en proporción 4:3 (por ejemplo 1200 × 900 px) y de menos de 300 KB. Las tarjetas recortan al centro, así que deja el producto centrado.
- Pages CMS renombra los archivos de forma segura (`rename: safe`).
- Las fotos de ejemplo tienen una copia pequeña en `sm/` para cargar más rápido en móviles. Las fotos nuevas funcionan sin esa copia; el sitio simplemente usa la original.

### Del CMS a la web

```text
Editar en Pages CMS → commit en GitHub (rama main) → el hosting ejecuta `npm run build` → publica dist/
```

1. Al pulsar **Guardar**, Pages CMS hace un commit en `main` con el cambio.
2. El hosting conectado al repositorio detecta el commit y ejecuta `npm run build`, que valida y genera `public-data/`.
3. Si la validación pasa, publica `dist/` (normalmente en 1–2 minutos). **Si falla, el sitio publicado no cambia** y el registro del build muestra el error; corrígelo en Pages CMS y guarda de nuevo.
4. El flujo de GitHub Actions `validar-contenido.yml` ejecuta la misma validación en cada commit, así que el error también aparece en la pestaña Actions del repositorio.

El build nunca modifica `content/`; solo lee de ahí.

## Publicación

El sitio es estático: cualquier hosting que ejecute un comando de build y publique una carpeta sirve. Para un negocio conviene un servicio cuyas condiciones permitan el uso comercial en el plan gratuito. **Cloudflare Pages** lo permite y es la recomendación; Netlify es una alternativa. GitHub Pages no se recomienda porque sus condiciones excluyen usarlo como hosting de un negocio en línea. Revisa las condiciones vigentes del servicio antes de elegir.

Configuración en Cloudflare Pages (Workers & Pages → Create → Pages → conectar el repositorio):

| Opción | Valor |
| --- | --- |
| Rama de producción | `main` |
| Comando de build | `npm run build` |
| Carpeta de salida | `dist` |
| Versión de Node | la toma de `.nvmrc` (22) |

- Cloudflare crea una vista previa por cada rama o pull request y sirve `404.html` en direcciones inexistentes.
- **Dominio propio**: Custom domains → añade el dominio y sigue las instrucciones de DNS. Después escribe la dirección final en Pages CMS → Configuración → SEO global → «Dominio del sitio». Con eso el build genera `sitemap.xml` y `robots.txt`, y el sitio añade la URL canónica, `og:url` y las imágenes absolutas para redes.
- Los datos estructurados de negocio local (`Bakery`) y de producto solo se publican cuando hay dominio configurado **y** el aviso de datos de ejemplo está desactivado, para no publicar datos falsos.

## Calidad y pruebas realizadas

Probado en Chrome (Playwright) contra el servidor local:

- **Diseño adaptable**: sin desbordamiento horizontal ni errores de consola o recursos 404 en 320, 480, 768, 992, 1280, 1440 y 1920 px, en todas las páginas, incluida la ficha de un slug inexistente.
- **Catálogo**:
  - Los 27 productos publicados aparecen y el despublicado no.
  - La búsqueda ignora tildes y mayúsculas («pina» encuentra «Empanada de piña», «CAFÉ» encuentra «Café filtrado»).
  - La búsqueda se combina con la categoría, y los filtros se guardan en la URL y se leen desde ella. Una categoría inexistente en la URL muestra todo.
  - Funcionan el estado vacío y «Limpiar filtros».
  - Los tres órdenes funcionan; «Precio a consultar» siempre va al final.
- **Ficha**:
  - El precio se muestra en C$.
  - El enlace de WhatsApp tiene la forma `https://wa.me/50500000000?text=…` y el mensaje «Hola, quisiera información sobre Pan de coco y su disponibilidad.», sin mencionar compra ni pedido.
  - Los productos relacionados son de la misma categoría.
  - Un slug inexistente muestra el aviso con `noindex`.
- **Contenido general**:
  - Los 2 productos agotados aparecen marcados.
  - La promoción vencida no se muestra.
  - No hay enlaces `href="#"`, textos de carrito o pago, ni páginas con más de un H1.
  - El primer Tab enfoca «Saltar al contenido».
  - El menú móvil actualiza `aria-expanded` y se cierra con Escape devolviendo el foco al botón.
- **Animaciones**: sin errores ni elementos que se queden ocultos tras recorrer cada página a 390 y 1440 px, con y sin «Reducir movimiento»; las tarjetas fuera de pantalla siguen siendo enfocables, y con GSAP bloqueado todo el contenido se ve. CLS por debajo de 0,02 y LCP igual que sin animaciones.
- **Flujo del CMS** (simulado editando los JSON como lo hace Pages CMS):
  - Un producto con categoría inexistente, precio negativo e imagen faltante detiene el build con 3 errores.
  - Un ID o slug duplicado detiene el build.
  - Las altas, ediciones, despublicaciones y bajas se reflejan al recompilar.
- **Publicación**: `dist/` funciona servido desde un subdirectorio (`/panaderia/`) con un servidor estático simple.
- **Lighthouse 12** (servidor local, sin compresión):

| Página | Móvil | Escritorio |
| --- | --- | --- |
| Inicio | 94 | 100 |
| Catálogo | 98 | 100 |
| Producto | 85 | 97 |
| Nosotros | 95 | 100 |
| Contacto | 99 | 100 |

  Accesibilidad, buenas prácticas y SEO obtienen 100 en todas las páginas.

### Limitaciones conocidas

- El catálogo, las fichas y los textos del CMS se cargan con JavaScript. El HTML incluye el texto del inicio y de Nosotros como respaldo, pero el contenido de cada producto solo existe tras ejecutar JavaScript. Google lo indexa, aunque con menos garantías que una página estática. Si el posicionamiento de cada producto llega a ser importante, el siguiente paso es generar una página HTML por producto durante el build.
- Por esa misma carga en dos pasos, en móvil la foto de la ficha aparece en unos 4 s con una conexión 4G lenta simulada.
- La disponibilidad no es en tiempo real: depende de que alguien la actualice en el CMS, y el sitio lo advierte junto a cada consulta.
- La configuración de Pages CMS sigue la documentación vigente (2.x); revísala en el panel la primera vez que conectes el repositorio.
- La compresión gzip/brotli y la caché las aplica el hosting, no el servidor de desarrollo.

### Pendiente

- Nombre, logotipo, teléfono, WhatsApp, dirección, enlace exacto de Google Maps, redes y horarios reales.
- Fotos propias de los productos.
- Precios reales.
- Conexión con Pages CMS y con el hosting, y dominio.

## Fotos

Las fotos de ejemplo son de [Unsplash](https://unsplash.com/license), cuya licencia permite el uso comercial sin atribución obligatoria. Se recortaron y convirtieron a WebP. Conviene reemplazarlas por fotos propias.

<details>
<summary>Origen de cada foto</summary>

- `general/amasado.webp` — https://unsplash.com/photos/a-pair-of-hands-holding-a-rock-Y-FYCzaV5zk
- `general/harina.webp` — https://unsplash.com/photos/person-pouring-water-on-round-brown-plastic-basin-RLyTrOHxH9s
- `general/horno.webp` — https://unsplash.com/photos/man-wearing-white-polo-shirt-CceG6jpl19M
- `general/vitrina-panes.webp` — https://unsplash.com/photos/grilled-meat-on-black-grill-2-U0A2tNYhM
- `products/alfajores.webp` — https://unsplash.com/photos/white-and-brown-round-coins-on-black-metal-tray-nDpGUYkS-fk
- `products/avena-pasas.webp` — https://unsplash.com/photos/a-stack-of-cookies-_HxfjRS2vhA
- `products/baguette.webp` — https://unsplash.com/photos/a-loaf-of-bread-sitting-on-top-of-a-wooden-cutting-board-6c65NYGVv5k
- `products/brownie.webp` — https://unsplash.com/photos/a-pile-of-brownies-sitting-on-top-of-a-white-plate-LjtviHokbr4
- `products/cafe-filtrado.webp` — https://unsplash.com/photos/person-pouring-black-coffee-in-white-ceramic-mug-placed-on-brown-wooden-table-during-daytime-N3btvQ51dL0
- `products/cappuccino.webp` — https://unsplash.com/photos/cup-of-coffee-on-saucer-ZLqxSzvVr7I
- `products/cheesecake-maracuya.webp` — https://unsplash.com/photos/a-piece-of-cheesecake-on-a-black-plate-TBVeq0aASCU
- `products/chispas-chocolate.webp` — https://unsplash.com/photos/a-table-topped-with-chocolate-chip-cookies-and-a-wooden-spoon-P4EtUOqkKfc
- `products/chocolate-caliente.webp` — https://unsplash.com/photos/chocolate-coffee-pouring-in-white-mug-MjZq7A2RJxQ
- `products/conchas.webp` — https://unsplash.com/photos/a-group-of-cookies-Ineomwz_YrI
- `products/cosa-de-horno.webp` — https://unsplash.com/photos/a-loaf-of-bread-sitting-on-top-of-a-wooden-cutting-board-JxPj7Wvt0As
- `products/croissant.webp` — https://unsplash.com/photos/a-bunch-of-croissants-that-are-on-a-table-sqkXyyj4WdE
- `products/empanada-pina.webp` — https://unsplash.com/photos/bread-on-gray-wooden-table-bXP4ijL9BrY
- `products/focaccia-romero.webp` — https://unsplash.com/photos/focaccia-bread-with-tomatoes-and-rosemary-on-wood-nGy3HFZ2hLo
- `products/fresco-cacao.webp` — https://unsplash.com/photos/iced-coffee-in-plastic-cup-HRfnyL6AO-A
- `products/galletas-mantequilla.webp` — https://unsplash.com/photos/a-group-of-coins-wNBEC2SA3us
- `products/jugo-naranja.webp` — https://unsplash.com/photos/a-glass-of-orange-juice-on-a-table-MIPUEtnidco
- `products/masa-madre.webp` — https://unsplash.com/photos/a-loaf-of-bread-sitting-on-top-of-a-counter-NPYmhef4kX4
- `products/pan-de-coco.webp` — https://unsplash.com/photos/a-pan-filled-with-rolls-covered-in-powdered-sugar-fk3MnIhx70M
- `products/pan-de-molde.webp` — https://unsplash.com/photos/brown-bread-on-white-ceramic-plate-e83dQJ-BMog
- `products/pan-de-yema.webp` — https://unsplash.com/photos/a-close-up-of-a-bunch-of-bread-rolls-aEe6iWN5WPw
- `products/pan-integral-semillas.webp` — https://unsplash.com/photos/baked-loft-bread-on-white-surface-8JGA8LZv9i4
- `products/pastel-chocolate.webp` — https://unsplash.com/photos/a-piece-of-chocolate-cake-sitting-on-top-of-a-white-plate-lNs4gxo2pMw
- `products/pastel-personalizado.webp` — https://unsplash.com/photos/pink-and-white-floral-cake-g5bgYkKa8y0
- `products/pastel-zanahoria.webp` — https://unsplash.com/photos/a-piece-of-carrot-cake-on-a-plate-with-a-fork-EvfXG4aK9d8
- `products/rol-canela.webp` — https://unsplash.com/photos/a-bunch-of-cinnamon-rolls-sitting-on-a-cooling-rack-qm7hrKF6lq0
- `products/tarta-frutas.webp` — https://unsplash.com/photos/a-close-up-of-a-pastry-topped-with-blueberries-and-strawberries-a8X8mWV7Ttg
- `products/tres-leches.webp` — https://unsplash.com/photos/white-and-brown-cake-on-white-ceramic-plate-mlcm6qi9Bu8

</details>
