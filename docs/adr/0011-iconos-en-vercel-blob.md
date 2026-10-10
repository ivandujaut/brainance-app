# 0011 — Íconos en Vercel Blob, en lugar de Uploadcare

- **Estado:** Propuesto
- **Fecha:** 2026-10-10

## Contexto

La beta guarda dos imágenes chicas, el ícono del sitio en el menú y el ícono del bot en el chat. Hoy van a Uploadcare: el navegador sube el archivo con una clave pública y la base guarda el id que devuelve.

- **La cuenta de Uploadcare está en una prueba Pro que vence el 20/10** ([lanzamiento](../lanzamiento.md)). Si se carga una tarjeta, pasa a cobrar Pro. El dueño decidió que la beta web siga activa y cambiar de proveedor.
- **El uso es mínimo.** Cada sitio tiene a lo sumo dos imágenes PNG o JPG de hasta 2 MB, y se muestran a 20 y a 32 px.
- **Producción todavía no tiene variables** (lanzamiento, paso 6), así que los íconos que existen son de cuentas de prueba en las previews.
- **La línea `whatsapp-os` va a necesitar guardar audios y fotos** ([ADR 0101](0101-proveedor-de-whatsapp.md)), y esos archivos tienen que ser privados.

## Opciones consideradas

1. **Pagar Uploadcare.** No hay que tocar código, pero es una cuota mensual para dos imágenes por sitio, y el código heredado sube sin firma desde el navegador.
2. **Vercel Blob.** Es parte del proveedor donde ya está la aplicación: no suma un tercero a la política de privacidad.
   - **Plan Hobby:** 1 GB de almacenamiento, 10.000 operaciones simples, 2.000 avanzadas (cada subida es una) y 10 GB de transferencia por mes, gratis y sin tarjeta.
   - **Si se pasa el límite en Hobby,** no se cobra, pero Blob queda bloqueado hasta que pasen 30 días ([precios](https://vercel.com/docs/vercel-blob/usage-and-pricing)).
   - **Tiene archivos privados** (`access: "private"`), que sirven para los audios de la otra línea.
3. **Guardar la imagen en Postgres.** No suma proveedor, pero hay que achicar la imagen en el navegador, servirla con una ruta propia y cachearla. Es más código para algo que un almacenamiento de archivos ya resuelve, y no sirve para los audios.
4. **Cloudflare R2, Cloudinary o UploadThing.** Tienen planes gratis generosos, pero suman cuenta, claves y un tercero más a la política de privacidad.

## Decisión

**Vercel Blob (opción 2), detrás de una interfaz y con la subida en el servidor.**

- **La subida pasa por una server action** (`onUploadIcon`):
  - exige sesión;
  - mira los primeros bytes del archivo para confirmar que es PNG o JPG, sin confiar en lo que dice el navegador;
  - rechaza más de 2 MB;
  - cuenta la subida contra dos topes (tabla `IconUpload`): 10 por dueño en 24 horas y 300 entre todos en 30 días;
  - lo guarda con `put` en `icons/`, como público y con un sufijo al azar.
- **Por qué los topes:** el registro es libre, y en Hobby pasarse de la cuota bloquea Blob 30 días para todos los sitios.
  - Con 300 subidas de hasta 2 MB por mes, el peor caso queda en 600 MB y 300 operaciones, debajo de 1 GB y 2.000.
  - Si se llega al tope general, nadie puede subir hasta que pasen días, pero los íconos ya guardados se siguen viendo. Llega un aviso a Sentry.

  El límite del cuerpo de las server actions sube de 1 a 3 MB (`next.config.mjs`) para que entre un archivo de 2 MB.
- **`src/server/storage/icons.ts` expone `IconStore.save()`.** Cambiar de proveedor es escribir otro adaptador.
- **La base guarda la URL pública del archivo.** Las acciones que guardan un ícono solo aceptan una URL del store del proyecto, dentro de `icons/`. Así no entra una imagen de otro store que se saltee los controles.
- **Variables:** las carga Vercel al conectar el store al proyecto.
  - `BLOB_STORE_ID`, que se usa con el token OIDC de Vercel, o `BLOB_READ_WRITE_TOKEN`.
  - El SDK elige solo; el host del store sale de cualquiera de las dos.
  - Se borran las dos variables de Uploadcare y el paquete `@uploadcare/upload-client`.
- **Los íconos viejos** (ids de Uploadcare) dejan de mostrarse: el sitio muestra su inicial, como cuando no tiene ícono. Como son de cuentas de prueba, no se migran.

## Consecuencias

- **Lo que se gana:**
  - un proveedor menos;
  - sin cuota mensual;
  - la validación del archivo pasa al servidor;
  - el almacenamiento para los archivos de WhatsApp queda resuelto.
- **Lo que cuesta:**
  - **El bloqueo de 30 días en Hobby si se pasa un límite.** Con íconos de hasta 2 MB, 1 GB alcanza para unas 500 subidas; las imágenes se sirven optimizadas por Next, que las cachea. Si la beta crece, se pasa a Pro o se suma un tope de subidas por usuario.
  - **Archivos que ninguna fila usa:** quedan en el store los íconos que se reemplazan, y también el que se sube al agregar un sitio que después el servidor rechaza (ya agregado, o fuera del plan). Si el espacio empieza a pesar, se borran.
  - **Vercel queda con más peso como proveedor.** El adaptador mantiene la salida barata.
- **Qué hay que hacer:**
  - El dueño aplica la migración `icon_uploads` a las dos bases con el workflow `migrate.yml`.
  - Crea el Blob store en Vercel, público, y lo conecta al proyecto ([lanzamiento](../lanzamiento.md), paso 6).
  - Antes del 20/10, no carga una tarjeta en Uploadcare y borra el proyecto.
