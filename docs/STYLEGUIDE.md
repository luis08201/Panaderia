# Crumb & Oven — Style guide

## Entrega

Página propia en inglés: `styleguide.html`. Se incluye en `dist/` al compilar y tiene un enlace en el pie de las seis páginas del template. 

Vista local: ejecutar `npm run dev` y abrir `http://127.0.0.1:47823/styleguide.html`.

## Referencias consultadas

Se estudiaron categorías y formas de documentar un sistema, sin descargar plantillas ni reutilizar su HTML, CSS, imágenes, fuentes o textos:

1. [Webflow — How to build a living style guide](https://webflow.com/blog/how-to-build-a-living-style-guide-in-webflow): una guía que utiliza los estilos reales del sitio y permite verlos juntos.
2. [Basic Style Guide, de basicsam](https://basicstyleguide.webflow.io/): inventario de tipografía, paletas y elementos de interfaz. No se usó su opción de clonar.
3. [Atlassian — Foundations](https://atlassian.design/foundations): separación de fundamentos como color, tipografía, espaciado, iconos, radio y elevación.

La composición editorial, el encabezado, el índice, las muestras, los textos y el código se prepararon para Crumb & Oven. Las fotografías, fuentes e iconos mostrados proceden del propio repositorio, además del símbolo de horno creado en la etapa anterior. Este registro documenta el proceso de creación; no constituye una garantía jurídica sobre todos los recursos existentes del template.

## Estructura

| Sección | Contenido |
|---|---|
| Brand | Logo con horno aprobado, versiones sobre claro/oscuro y descarga del símbolo. |
| Color | Ocho colores reales del template, usos y botón para copiar cada valor. Etiquetas semánticas. |
| Typography | Playfair Display e Inter locales; H1–H6 con tamaños reales y diez tamaños visuales independientes, de text-50 a text-900. |
| Buttons & links | Variantes principal, secundaria, acento, pequeña, clara y desactivada. |
| Form fields | Texto, email, select, textarea y desactivado; validación de ejemplo y reinicio. |
| Components | Tarjeta ilustrativa, badges, filtros de muestra e iconos. |
| Space & shape | Escala de espaciado, radios y elevación. |
| Motion & access | Duración compartida, foco, preferencia de movimiento reducido y personalización. |

## Conexión con el template

- `css/styleguide.css` solo define la composición de la guía con clases `sg-*`.
- Las muestras de botones, campos, tarjetas y badges usan el CSS compartido ya existente.
- `js/styleguide.js` lee las variables reales para mostrar colores, espaciado, radios y duración. Si no hay JavaScript, los valores de respaldo iniciales siguen visibles.
- La marca y los textos de muestra son estáticos: deben actualizarse al cambiar de marca. La tarjeta usa una foto y un precio ilustrativos, sin conexión al CMS.
- El formulario se intercepta localmente con JavaScript; no hay integración de correo, pedidos ni almacenamiento. Usar únicamente información de prueba.
- Los filtros cambian su selección y el texto de estado, sin filtrar el catálogo público.
- El índice usa enlaces nativos y señala la sección visible. En móvil se convierte en una fila desplazable.
- La guía tiene `noindex, follow`; no se ha añadido al sitemap comercial.

## Validación realizada

- Build completo: 27 páginas de producto generadas y Style guide incluida.
- Seis pruebas existentes aprobadas.
- Navegador real: copia de Cocoa (`#754c29`) confirmada; formulario vacío devuelve el foco al nombre; datos de ejemplo válidos muestran “Example validated. Nothing has been sent.”; reset limpia valores y estado; selección Bread cambia `aria-pressed` y el estado de muestra.
- Un H1, diez enlaces de fragmento con destino existente e imagen de muestra cargada.
- Sin warnings ni errores de consola en la revisión.
- Ocho anchos medidos: 1920, 1440, 1280, 992, 991, 767, 479 y 390 px, todos sin overflow horizontal del documento. Ver `evidence/styleguide-responsive.json`.
- Capturas: `evidence/styleguide-desktop.jpg`, `evidence/styleguide-color.jpg`, `evidence/styleguide-mobile.jpg`.

No se declara conformidad WCAG ni se ha ejecutado una auditoría legal o de rendimiento nueva. Las muestras de accesibilidad documentan el comportamiento previsto, no una certificación.

## Escala tipográfica

Los encabezados H1–H6 usan `--heading-h1` a `--heading-h6`. Se conservan los tamaños anteriores de H1–H3 y se definen H4–H6. Las muestras usan las clases `heading-h1` a `heading-h6` sobre párrafos para no crear una jerarquía de encabezados ficticia dentro de la guía.

Las diez clases visuales solo cambian `font-size`, sin alterar familia, peso ni significado semántico:

| Clase | rem | px con raíz de 16px |
|---|---|---|
| text-50 | 0.75 | 12 |
| text-100 | 0.875 | 14 |
| text-200 | 1 | 16 |
| text-300 | 1.125 | 18 |
| text-400 | 1.25 | 20 |
| text-500 | 1.5 | 24 |
| text-600 | 1.875 | 30 |
| text-700 | 2.25 | 36 |
| text-800 | 3 | 48 |
| text-900 | 3.75 | 60 |

Las etiquetas de las 16 muestras muestran el tamaño calculado en px/rem y se actualizan al redimensionar la ventana. Los H1–H4 son fluidos; H5 y H6 son fijos en rem. Los componentes pueden conservar sus ajustes particulares, como el título de una tarjeta o la portada de esta guía.

La nomenclatura numérica va de `text-50` a `text-900`. Los números son identificadores de escala, no valores en píxeles.

## Nombres para clientes

Las diez opciones visibles utilizan nombres descriptivos en inglés y una explicación de uso. Las clases numéricas se conservan internamente y aparecen únicamente en el desplegable “For your designer: style names”.

- Tiny note: Short captions and small details (`text-50`).
- Small note: Hints and supporting information (`text-100`).
- Reading text: Everyday paragraphs and descriptions (`text-200`).
- Comfortable reading: Longer text with more breathing room (`text-300`).
- Intro text: A short opening paragraph (`text-400`).
- Small title: Cards and small content blocks (`text-500`).
- Medium title: Groups of related content (`text-600`).
- Section title: The start of a new section (`text-700`).
- Page title: The main title of a page (`text-800`).
- Large headline: A large opening headline (`text-900`).

Las capturas y los registros de QA de `docs/evidence/` son archivos locales, excluidos de Git y del paquete público.
