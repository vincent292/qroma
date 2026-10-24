# Qroma

Un estudio de códigos QR con identidad propia. HTML, CSS y JavaScript, sin framework, backend ni paso de compilación.

## Incluye

- Enlaces, texto y números, teléfono, WhatsApp, correo, Wi-Fi, contacto vCard y coordenadas.
- Colores sólidos y degradados, fondo transparente, cinco paletas, seis formas de puntos y tres estilos de esquinas.
- Logo o foto central con tamaño ajustable y procesamiento local.
- Marcos con mensaje personalizado.
- Sección opcional «Floral · bodas»: acuarela romántica, ramitos y corona botánica; paletas, nombres, mensajes, tamaño y colores editables. Acceso directo: `/#bodas`.
- Descarga PNG, SVG, JPG y WebP, entre 128 y 4096 píxeles.
- Diseños guardados en localStorage e importación/exportación de proyectos JSON editables.
- Interfaz en español, responsive, navegación por teclado y mensajes de validación.
- Comprobación de lectura local sobre la vista previa, con aviso si un estilo no se decodifica.

## Usar localmente

Requiere Node.js 22 o posterior. No hace falta instalar dependencias.

```sh
npm run dev
```

Abrir http://localhost:4173. También se puede servir esta carpeta con cualquier servidor estático. Usa HTTP en lugar de abrir `index.html` con `file://`, porque el JavaScript utiliza módulos.

```sh
npm run check
npm test
```

## Publicar en Vercel desde GitHub

1. En Vercel, elige **Add New → Project** e importa este repositorio.
2. **Framework Preset:** Other.
3. **Root Directory:** `./`.
4. **Build Command:** déjalo vacío (override activado si Vercel sugiere uno).
5. **Output Directory:** `.`.
6. No necesita variables de entorno. Pulsa **Deploy**.

Los siguientes pushes a la rama de producción se desplegarán automáticamente una vez conectado el proyecto.

## Privacidad y alcance

Las bibliotecas de generación y lectura QR están incluidas en `assets/vendor`, con sus licencias, y no se cargan desde un CDN. Los datos y las imágenes se procesan en el navegador. Las tipografías se solicitan a Google Fonts; si prefieres una aplicación completamente sin solicitudes externas, elimina el `@import` de `styles.css` o aloja las fuentes localmente. El diseño incluye fuentes de respaldo.

Los diseños se guardan en este navegador **solo al pulsar Guardar**. Exportar el proyecto incluye sus datos y su imagen, por lo que conviene guardar los proyectos Wi-Fi en un lugar privado. No hay analítica ni cuentas de usuario.

Se generan QR **estáticos**. El contenido de un QR ya impreso no cambia. Para cambiar su destino después, codifica una URL/redirección que administres. Las imágenes centrales decoran el QR; para compartir una foto o PDF como destino debes alojar el archivo y usar su enlace público.

Se utiliza corrección de errores H y margen de seguridad. La comprobación de lectura usa jsQR sobre la vista previa a 600 px; no garantiza lectura del archivo exportado con todas las cámaras. Los estilos de esquinas circulares pueden fallar en algunos lectores: el estudio avisa si no puede confirmar el contenido. Prueba el archivo exportado en varios teléfonos antes de imprimir, especialmente con logos, transparencias o degradados. JPG utiliza fondo sólido.

## Archivos

- `index.html`: interfaz y contenido.
- `styles.css`: diseño y adaptación móvil.
- `app.js`: controles, generación, exportaciones y biblioteca local.
- `core.js`: formatos de contenido, validación y lectura segura de proyectos.
- `floral.js`: plantillas de boda, composiciones vectoriales y acuarelas incrustadas en la exportación.
- `assets/vendor/qr-code-styling.js`: [qr-code-styling 1.9.2](https://github.com/kozakdenys/qr-code-styling).
- `assets/vendor/jsQR.js`: [jsQR 1.4.0](https://github.com/cozmo/jsQR), Apache 2.0.
- `vercel.json`: configuración de hosting estático y cabeceras.

El código del proyecto se distribuye bajo la licencia MIT. Las bibliotecas de terceros conservan sus licencias en `assets/vendor/qr-code-styling.LICENSE` y `assets/vendor/jsQR.LICENSE`.

Las dos ilustraciones de `assets/floral/` provienen del repositorio de invitación del propietario y conservan sus derechos originales; consulta `assets/floral/ATTRIBUTION.md`. La acuarela conserva sus colores originales; ramitos y corona permiten recolorear las flores. El contenido codificado siempre queda separado de la decoración. Cuando el lector no reconoce la composición completa, se comprueba también el área central y se indica que acerques la cámara al código. La versión SVG incrusta las acuarelas para que el archivo sea autónomo; estas ilustraciones conservan su resolución raster, mientras que el QR, los textos, los ramitos y la corona son vectoriales.
