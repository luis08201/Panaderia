# Demo photography sources

The photos listed here are used in the hosted preview only. They are excluded from the buyer export; replace its neutral image placeholders with your own licensed photographs. Sources below were recorded in the original project and have not been independently verified for each file.

## Fotos

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
