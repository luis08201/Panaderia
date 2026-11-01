# Logo alternativo y transiciones

Cambios locales en la rama `codex/logo-hover`. 

## Alternativa del logo

El nuevo símbolo combina un horno de arco y una hogaza. Mantiene el terracota, los tonos de cacao y la tipografía del sitio. El horno aprobado es el símbolo activo de las páginas y del favicon.

- `assets/brand/oven-mark.svg`: símbolo independiente, vectorial.
- `assets/brand/logo-alternative.svg`: composición horizontal con texto editable. Utiliza Georgia/Arial del sistema; no es una versión con letras convertidas a curvas.
- `assets/icons/icons.svg#oven`: símbolo reutilizable que toma el color del componente.
- `docs/brand-interactions.html`: comparación con la espiga y muestra interactiva. La composición HTML usa Playfair Display e Inter del sitio.

Para probar: ejecutar `npm run dev` y abrir `http://127.0.0.1:47823/docs/brand-interactions.html`.

Si se adopta, cambiar el símbolo `#wheat` por `#oven` en las marcas de cabecera y footer y revisar el tamaño en móvil. El símbolo aprobado ya se aplica al template y al favicon.

## Revisión de controles

| Familia | Estado anterior | Ajuste |
|---|---|---|
| Enlaces de texto, breadcrumb y anuncios | Cambios de color instantáneos; anuncio sin variación visible | Transición compartida de color y decoración; estado específico en anuncio. |
| Marca | Sin respuesta en el símbolo | Cambio suave de color del símbolo, compatible con footer oscuro. |
| Navegación de escritorio | Subrayado animado, color sin transición | Ambos estados animados; respuesta equivalente al foco. |
| Menú móvil | Sin estado hover definido | Fondo, borde y color suaves. |
| Botones principales y WhatsApp | Ya tenían transición | Conservada. |
| Filtros del catálogo | Ya tenían transición | Conservada. |
| Limpiar filtros | Sin transición ni estado hover específico | Color y decoración suaves. |
| Nombres de producto y enlaces del footer | Subrayado aparecía de golpe | Subrayado presente con color transparente, que se vuelve visible gradualmente. |
| Categoría de ficha y enlaces de promoción | Poco o ningún cambio visible | Colores y decoración específicos. |
| Tarjetas e imágenes | Elevación/zoom animados | Conservados; sombra o zoom también al navegar con teclado. |
| Buscador y select | Transición de borde | Se incluye sombra suave y se conserva el contorno de foco inmediato. |
| Textarea | No existe en las páginas públicas | Estilo reutilizable y muestra local con hover, foco y altura ajustable. |
| Miniaturas | Sin transición/hover específico | Borde y sombra suaves; se conserva el estado seleccionado. No hay galerías con fotos adicionales en los datos actuales; validado en la muestra. |

La duración compartida es `--duration: 0.25s` con `--ease`. Se usan propiedades concretas, sin `transition: all`. La preferencia de movimiento reducido conserva la regla existente que reduce las transiciones a `0.01ms`. No se emuló esa preferencia en el navegador de esta revisión.

## Verificación

- Inspección de las seis páginas y de los componentes dinámicos del catálogo/ficha.
- 306 elementos `a`, `button`, `input`, `select` o `textarea` incluidos en el inventario calculado de las seis páginas, sin duración de transición cero en condiciones normales. El filtro comprueba display/visibility del elemento; el conteo no es una certificación de visibilidad de todos sus ancestros ni una prueba manual de cada enlace.
- Inventario de propiedades y duraciones: `docs/evidence/interactions.json`.
- Prueba real de puntero sobre el textarea de muestra y prueba de foco por teclado. No se simuló individualmente el puntero sobre los 306 elementos; la cobertura completa combina inspección de CSS y estilos calculados.
- Sin warnings/errores en la consola de las páginas recorridas durante la comprobación.
- `npm test`: las seis pruebas existentes pasan.
- `npm run build`: valida contenido y genera las 27 páginas de producto.

La comparación y esta documentación están en `docs/`, fuera de las entradas que el build copia a `dist/`. Los SVG de marca sí se incluyen como recursos disponibles.

Las capturas y los registros de QA de `docs/evidence/` son archivos locales, excluidos de Git y del paquete público.
