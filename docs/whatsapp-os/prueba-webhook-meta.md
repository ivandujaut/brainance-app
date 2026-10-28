# Prueba del webhook de Meta, con el número de prueba

Antes de escribir la spec 100 hay que ver con mensajes reales qué le manda Meta a nuestro sistema cuando el dueño escribe un texto, manda un audio o manda una foto.

Esta prueba confirma dos cosas:

- el último punto de "Antes de aceptar" del [ADR 0101](../adr/0101-proveedor-de-whatsapp.md): el formato real del webhook;
- las reglas del [ADR 0102](../adr/0102-arquitectura-de-la-linea-whatsapp.md): el webhook responde 200 y descarta duplicados, el archivo se baja antes de 5 minutos y un paso se puede repetir sin duplicar nada.

**Se hizo el 14 de octubre de 2026.** Los resultados y los ejemplos anonimizados están en [`webhook-ejemplos/`](webhook-ejemplos/README.md).

No necesita al taller ni un número propio, porque Meta da un número de prueba gratis. Lleva más o menos una hora. Los nombres del panel de Meta cambian seguido: si alguno no coincide, buscá el producto WhatsApp dentro de tu app.

## Qué se quiere saber

1. **Cómo llega cada tipo de mensaje:**
   - texto, audio y foto;
   - lo que el dueño también podría mandar: un PDF, una reacción, una respuesta citando otro mensaje o un audio reenviado.
2. **Cuántos eventos llegan:** si es uno por mensaje o vienen varios juntos, y en qué orden.
3. **Qué pasa si nuestro webhook falla:** cuándo reintenta Meta y si el mismo mensaje llega dos veces.
4. **Cuánto dura la URL de un archivo.**
5. **Cuántos eventos de estado** (enviado, entregado, leído) llegan por cada mensaje que mandamos.

## Qué necesitás

- **Cuentas de Meta:** una de Facebook y un portfolio de negocio ([business.facebook.com](https://business.facebook.com)). Si todavía no tenés el portfolio, se crea en el paso 1. Las cuentas las crea el dueño, no un agente.
- **Tu celular con WhatsApp:** hace de dueño del taller.
- **Esta rama en tu máquina,** con `npm install` y Node 20 o más.
- **`cloudflared`,** para el túnel: `brew install cloudflared`. No pide cuenta.

**Seguridad:**

- El token, el secreto de la app y el token de verificación van solo en `.env.local`. Nunca en el chat, en un issue ni en un commit.
- Las capturas tienen tu número y tus mensajes. Quedan en `capturas-meta/`, que git ignora, y no salen de tu máquina salvo por el túnel.

## 1. Crear la app en Meta

1. En [developers.facebook.com](https://developers.facebook.com), entrá a **Mis apps** y elegí **Crear app**.
2. Como caso de uso, elegí conectar con clientes por WhatsApp. Si no aparece, elegí el tipo **Negocio** y después agregá el producto **WhatsApp**.
3. Asociala a tu portfolio de negocio.
4. En el producto WhatsApp, entrá a **API Setup** (Configuración de la API). Meta ya te asigna ahí un número de prueba.

Con el número de prueba alcanza el modo desarrollo: no hace falta publicar la app ni pasar la revisión de Meta.

## 2. Anotar los datos y cargar los secretos

En **API Setup**:

- anotá el **Phone number ID** y el **WhatsApp Business Account ID** del número de prueba;
- generá un **token de acceso temporal**. Dura 24 horas y se regenera ahí mismo.

En la app, en **Configuración → Básica**, copiá el **App secret**. Te pide la contraseña.

Inventá un **token de verificación**: cualquier texto largo, por ejemplo con `openssl rand -hex 16`.

Cargá los tres valores en `.env.local`, que no se commitea:

```bash
META_VERIFY_TOKEN=el-token-que-inventaste
META_APP_SECRET=el-app-secret
META_ACCESS_TOKEN=el-token-temporal
```

## 3. Sumar tu celular como destinatario

1. En **API Setup**, en el campo **Para** ("To"), agregá tu número y confirmalo con el código que te llega por WhatsApp. El número de prueba solo le puede escribir a 5 números confirmados.
2. Mandate desde ahí la plantilla de prueba, `hello_world`. Así te queda en WhatsApp el chat con el número de prueba, que es donde vas a escribir.

## 4. Levantar el capturador y el túnel

En una terminal, en la carpeta del repo:

```bash
npm run webhook:meta -- --download
```

En otra terminal:

```bash
caffeinate -i cloudflared tunnel --url http://localhost:3333
```

`cloudflared` muestra una dirección `https://….trycloudflare.com`. El capturador escucha en `/webhook`.

El túnel es temporal: se cae si la Mac pierde la red o entra en reposo, y cada vez que arranca cambia la dirección. `caffeinate -i` evita el reposo mientras corre. Para una prueba de varios días conviene un túnel con nombre, que mantiene la dirección (necesita cuenta de Cloudflare).

Qué hace el capturador (`scripts/dev/meta-webhook.mjs`):

- responde la verificación de Meta;
- comprueba la firma de cada evento (`X-Hub-Signature-256`) y guarda cada uno crudo en `capturas-meta/`;
- muestra una línea por mensaje, con el tipo, los últimos 4 dígitos del número (o del BSUID, si el número no viene), un id corto y el largo del texto. Nunca el texto ni el `wamid` entero, que lleva el número adentro;
- con `--download`, baja cada archivo apenas llega el evento y vuelve a pedir la misma URL a los 6 minutos.

## 5. Conectar el webhook en Meta

En el producto WhatsApp, en **Configuración**:

1. **URL de callback:** `https://….trycloudflare.com/webhook`.
2. **Token de verificación:** el mismo de `META_VERIFY_TOKEN`.
3. **Verificar y guardar.** El capturador muestra `verificación ok`.
4. En **Campos del webhook**, suscribí `messages`. El botón **Test** de esa fila manda un ejemplo inventado por Meta: si el capturador muestra `firma ok`, la conexión anda.
5. **Suscribí la app a la cuenta de WhatsApp.** Sin este paso, el botón Test llega pero los mensajes reales no. Con el token temporal en `.env.local`:

   ```bash
   npm run webhook:meta -- --subscribe WHATSAPP_BUSINESS_ACCOUNT_ID
   ```

   Al final lista las apps suscriptas: tiene que aparecer la tuya.

El modo desarrollo alcanza: los mensajes reales llegan aunque el panel avise que la app no está publicada.

## 6. Los mensajes del dueño

Desde tu celular, mandale al número de prueba un mensaje por vez. Después de cada uno, mirá la línea que muestra el capturador.

| # | Qué mandar | Qué mirar |
|---|---|---|
| 1 | Un texto corto, como lo diría el dueño: "Entró el Gol de Pérez, hace ruido el tren delantero" | Que llegue como `text`, y cuánto tarda |
| 2 | Un texto largo, en varios renglones y con emojis | Que llegue entero, con los saltos de línea |
| 3 | Una respuesta citando el mensaje 1 | El campo `context.id`: a qué mensaje responde |
| 4 | El mensaje 1, editado | Si llega algo, y de qué tipo. En el iPhone, WhatsApp no ofreció editar en este chat |
| 5 | Un texto borrado "para todos" | Si llega algo, y de qué tipo. En el iPhone, solo ofreció borrar "para mí" |
| 6 | Una nota de voz de unos 15 segundos | Que llegue como `audio`, con su formato y la marca de nota de voz |
| 7 | Una nota de voz de unos 2 minutos | El tamaño del archivo y cuánto tarda en bajar |
| 8 | Un audio reenviado desde otro chat | La marca de reenviado: es lo que pasaría si el dueño reenvía el audio de un cliente |
| 9 | Una foto sola, sin texto | Que llegue como `image`, y su formato |
| 10 | Una foto con texto | Dónde llega el texto (`caption`) |
| 11 | Tres fotos juntas | Si llegan como tres mensajes o como uno, y en qué orden |
| 12 | Un PDF, como si fuera un presupuesto | Que llegue como `document`, con el nombre del archivo |
| 13 | Una reacción 👍 al `hello_world` | Que llegue como `reaction`: si el dueño confirma con un pulgar, el sistema lo puede leer |
| 14 | Una ráfaga: un texto, un audio y una foto en menos de 10 segundos | En qué orden llegan, y si alguno viene en el mismo evento que otro |
| 15 | Una foto reenviada desde otro chat | La marca de reenviado en una foto |

## 7. Las pruebas del lado del sistema

1. **Reintentos.**
   - Cortá el capturador (Ctrl+C) y levantalo con `npm run webhook:meta -- --fail 3`: responde 500 a los tres eventos siguientes.
   - Mandá un texto.
   - Anotá cuándo vuelve a llegar cada intento y si el `id` del mensaje es el mismo (ADR 0102, regla 7).
2. **Vencimiento de la URL.** Con `--download`, después de cada audio o foto el capturador muestra dos resultados: el de la descarga y el de la misma URL a los 6 minutos. Quedan también en `capturas-meta/medios.jsonl`.
3. **Estados.** Mandate otra vez el `hello_world` desde el panel y contá cuántos eventos de estado llegan: enviado, entregado y leído.
4. **Firma.** Cada evento tiene que decir `firma ok`. Si alguno dice `FIRMA INVÁLIDA`, el `META_APP_SECRET` no es el de esta app.

## 8. Qué hacer con lo que salió

Tenés dos caminos:

- pasame la carpeta `capturas-meta/` y armo los resultados y los ejemplos anonimizados;
- o completá vos esta tabla, una fila por prueba:

| # | ¿Llegó? | Tipo | Eventos | Demora | Observaciones |
|---|---|---|---|---|---|

**Qué se commitea:**

- **Los resultados,** en el ADR 0101 ("Antes de aceptar") y, si cambian algo, en el ADR 0102.
- **Un ejemplo de cada tipo de evento, anonimizado** (número, nombre, ids y texto reemplazados), en `docs/whatsapp-os/webhook-ejemplos/`. Van a ser la base de los tests del webhook en la spec 100.
- **Nunca las capturas crudas.**

## Al terminar

- Cortá el túnel y el capturador con Ctrl+C.
- Borrá `capturas-meta/` cuando estén los ejemplos anonimizados.
- El token temporal vence solo a las 24 horas.

## Si algo no funciona

| Qué pasa | Causa probable |
|---|---|
| "Verificar y guardar" falla | El túnel no está levantado, la URL no termina en `/webhook` o el token no coincide con `META_VERIFY_TOKEN` |
| El botón Test llega, pero los mensajes reales no | La app no está suscripta a la cuenta de WhatsApp: paso 5, punto 5 |
| No llegan eventos | No suscribiste `messages`, o le escribís desde un número que no está entre los destinatarios confirmados |
| Dice `FIRMA INVÁLIDA` | `META_APP_SECRET` no es el de esta app |
| La descarga da 401 | Venció el token temporal: generá otro y reiniciá el capturador |
| Meta dejó de llegar después de reiniciar el túnel | `cloudflared` da una dirección nueva cada vez que arranca: actualizala en el paso 5 |
| Meta dejó de llegar sin que reiniciaras nada | El túnel se cayó porque la Mac perdió la red o entró en reposo. `cloudflared` muestra "Tunnel not found": levantalo de nuevo y actualizá la dirección |
| Mandarle al número del dueño falla con 131030 | Los celulares argentinos llegan como `549…`: mandale al número sin el 9 (`54…`) |
