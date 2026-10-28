# Ejemplos del webhook de Meta

Lo que mandó Meta en la [prueba del webhook](../prueba-webhook-meta.md) del 14 de octubre de 2026, con el número de prueba y un iPhone. Son la base de los tests del webhook en la spec 100.

**Están anonimizados:** número, nombre, ids, archivos y textos están reemplazados por valores de ejemplo, con la misma forma que los reales. Los tiempos son los reales. Los textos son los del guion de la prueba.

| Valor | En los ejemplos |
|---|---|
| Número del dueño | `5491155550101` (sin el 9: `541155550101`) |
| BSUID del dueño (`user_id`, `from_user_id`) | `AR.1000000000000001` |
| Nombre del perfil | `Dueño de prueba` |
| WABA (`entry[].id`) | `1234567890123456` |
| Número del sistema (`phone_number_id`, `display_phone_number`) | `6543210987654321`, `15550000000` |
| Archivos (`id`, `sha256`, `url`) | `1000000000000101` en adelante, con `hash=ejemplo` en la URL |

Los `wamid` falsos respetan la estructura de los reales: un `wamid` es base64 y lleva **adentro el número de quien escribe**. Por eso no se muestra ni se loguea entero.

## Los ejemplos

| Archivo | Qué es |
|---|---|
| `prueba-del-panel.json` | El botón "Test" del panel de Meta: datos inventados por Meta, con `entry[].id` igual a `"0"` |
| `usuario-sin-nombre-de-usuario.json`, `usuario-con-nombre-de-usuario.json` | Las dos variantes del panel para los nombres de usuario (27 de octubre). Ver "Nombres de usuario" |
| `texto.json` | Un texto corto |
| `texto-largo.json` | Varios renglones con emojis: llegan enteros, con `\n` |
| `respuesta-citando.json` | Una respuesta citando otro mensaje: `context.id`, `context.from` y `context.from_user_id` |
| `nota-de-voz.json` | Nota de voz: `audio`, `audio/ogg; codecs=opus`, `voice: true` |
| `audio-reenviado.json` | Una nota de voz reenviada: `voice: false` y `context.forwarded: true` |
| `foto.json`, `foto-con-texto.json` | `image/jpeg`; el texto llega en `image.caption` |
| `album.json` | Cuatro eventos: un `unsupported` de tipo `album` (error 131051) y después cada foto por separado |
| `foto-reenviada.json` | Una foto reenviada: `context.forwarded: true` |
| `documento.json` | Un PDF: `document`, con `filename` |
| `reaccion.json`, `reaccion-quitada.json` | `reaction.message_id` apunta al mensaje del sistema; al quitarla llega sin `emoji` |
| `rafaga.json` | Texto, nota de voz y foto mandados juntos: tres eventos, en orden |
| `estados.json` | `delivered` y `sent` de una respuesta, en el orden en que llegaron |
| `envio.json` | La respuesta del sistema: el pedido, el rechazo con el 9 y el envío aceptado sin el 9 |

## Resultados

**Lo que llega:**

- **Un evento por mensaje,** siempre. Ninguno trajo dos mensajes ni un mensaje y un estado juntos.
- **Tarda 2 a 3 segundos** desde que el dueño manda el mensaje. En una ráfaga, los eventos llegan en orden, separados por 1 a 4 segundos.
- **Un álbum no llega como un mensaje.** Primero un `unsupported` (tipo `album`) y después cada foto, como si se hubieran mandado sueltas. El `unsupported` se puede ignorar.
- **El reenvío se distingue:** `context.forwarded: true`. Una nota de voz reenviada llega con `voice: false`, así que no se puede saber si era una nota de voz.
- **Editar y borrar "para todos" no se pudo probar:** WhatsApp no ofrece esas opciones en el chat con el número de prueba, ni siquiera con un mensaje recién mandado (iPhone).
- **El `user-agent` no sirve para distinguirlas:** las pruebas del panel llegan con `user-agent` `Webhooks/1.0` y los mensajes reales, con `facebookexternalua`. Lo único que se verifica es la firma.

**Archivos:**

- **La URL del evento sirve con el token,** sin pedir antes `GET /<media-id>`. Sin token da 401.
- **La URL vence:** a los 6 minutos, las 12 dieron 401. Pidiendo de nuevo `GET /<media-id>` a los 7 minutos llegó una URL nueva que funcionó. No hace falta bajar el archivo en el momento: alcanza con guardar el media id, que dura 7 días según Meta.
- **`sha256`** viene en el evento y sirve para verificar lo que se bajó.
- **Tamaños:** una nota de voz de 15 segundos pesa 58 KB, y una de 2 minutos, 298 KB.

**Reintentos:**

- Con el capturador respondiendo 500, Meta reintentó **enseguida**: a los 0,6, 0,5 y 1,7 segundos.
- Cada reintento trae el **mismo cuerpo y la misma firma**. El duplicado tiene que descartarse de forma atómica (un índice único sobre el `wamid`): dos intentos pueden llegar casi a la vez.

**Respuestas y estados:**

- **La respuesta citando** se ve en el celular como respuesta al mensaje del dueño (`context.message_id`).
- **El número argentino:** el `wa_id` del webhook es `549…`. Mandarle a ese número falla con 131030 ("not in allowed list"); sin el 9 (`54…`) funciona, y Meta lo devuelve como el mismo `wa_id` `549…`.
- **Llegaron `delivered` y `sent`, en ese orden:** los estados pueden llegar desordenados. `read` no llegó porque el dueño tiene apagadas las confirmaciones de lectura: el sistema no puede contar con ese estado.
- **`pricing`** dice `billable: false`, `category: service` y `type: free_customer_service`. Eso contradice que las respuestas en la ventana de 24 horas se cobren desde el 1 de octubre (ADR 0101, "Antes de aceptar").

## Nombres de usuario

Desde junio de 2026, un usuario de WhatsApp puede adoptar un nombre de usuario y ocultar su número. En ese caso, el evento **no trae el número**:

| Campo | Sin nombre de usuario | Con nombre de usuario |
|---|---|---|
| `messages[].from` y `contacts[].wa_id` (el número) | Vienen | **No vienen** |
| `messages[].from_user_id` y `contacts[].user_id` (BSUID) | Vienen | Vienen, iguales |
| `contacts[].profile.username` | No viene | Viene |

El BSUID es un id del usuario para cada negocio. Ya llegaba en los mensajes reales del 14 de octubre, junto al número. Por eso **el dueño se identifica por su BSUID**, y el número es un dato más (ADR 0102).

Falta confirmar si Meta igual manda el número cuando ya hubo una conversación con ese negocio.
