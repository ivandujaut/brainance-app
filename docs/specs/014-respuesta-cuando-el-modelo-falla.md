# 014 — Respuesta cuando el modelo falla

- **Estado:** Borrador
- **ADRs relacionados:** [0001 — Estrategia de modelos de IA](../adr/0001-estrategia-de-modelos-de-ia.md), [0008 — Errores y métricas](../adr/0008-errores-y-metricas.md)
- **Specs relacionadas:** [003 — Widget embebible](003-widget-embebible.md), [007 — Observabilidad](007-observabilidad.md) (tope de costo y `ModelCall`), [010 — Aviso al dueño](010-aviso-al-dueno.md), [011 — Tope visible y métricas de honestidad](011-tope-visible-y-metricas-de-honestidad.md) (la respuesta fija del tope, que cuenta como derivada)
- **Posicionamiento:** es el caso que contradice la promesa "Ningún cliente sin respuesta" de forma más directa. Cuando el sistema falla, el visitante tiene que recibir el contacto del negocio y el dueño tiene que enterarse.

## Problema

Cuando la llamada al modelo falla en `POST /api/widget/[domainId]/messages`, el visitante se queda sin respuesta y nadie se entera. La llamada puede fallar porque el AI Gateway está caído, rechaza por límite, se agotó el crédito o el tope de gasto mensual de la cuenta, el proveedor tarda demasiado o la respuesta vuelve vacía. Hoy pasa esto:

- El error solo va a Sentry (`captureError`) y a `ModelCall`. No se marca la conversación ni se avisa al dueño.
- El widget recibe un stream vacío y muestra "No pudimos enviar tu mensaje. Revisá tu conexión…": le echa la culpa a la conexión del visitante y le devuelve el texto para que lo reenvíe.
- La pregunta ya quedó guardada en la base, así que reenviarla la duplica en la bandeja.
- Si el error llega a mitad de la respuesta, el visitante ve un texto cortado que no se guarda.

El tope de gasto del AI Gateway (US$20 por mes, `docs/lanzamiento.md`, paso 6) es **uno para todos los sitios**. Si un sitio lo agota, el bot deja de responder en todos, y todos caen en este camino sin aviso.

## Historias de usuario

- Como **visitante del sitio**, quiero que, si el bot no puede responderme, me diga cómo contactar al negocio, para no quedarme esperando ni pensar que el problema es mío.
- Como **dueño del negocio**, quiero enterarme cuando el bot no pudo responder a un cliente, para contestarle yo.
- Como **dueño**, no quiero un email por cada mensaje fallido si el problema es general, sino saber que pasó y dónde mirar.
- Como **operador**, quiero distinguir en el panel de administración las respuestas que fallaron, para ver si el problema es del proveedor, del crédito o de un sitio.

## Criterios de aceptación

Cada criterio se convierte en al menos un test.

### Qué ve el visitante

1. **Dado** un mensaje que tiene que responder el bot, **cuando** el modelo falla antes de devolver texto (error del gateway o del proveedor, límite, crédito agotado), **entonces** el visitante recibe la **respuesta de respaldo** en la misma respuesta HTTP: "No pude responder tu consulta en este momento. Podés comunicarte con el negocio por {contacto}." No ve un error ni se le devuelve el texto para reenviarlo.
2. **Dado** un modelo que no devuelve el primer fragmento de texto en **15 segundos**, o que no termina en **45 segundos**, **entonces** se corta la llamada y el visitante recibe la respuesta de respaldo. Se trata como cualquier otro fallo.
3. **Dado** un modelo que termina sin error pero con texto vacío o solo espacios, **entonces** el visitante recibe la respuesta de respaldo.
4. **Dado** un modelo que falla después de haber enviado parte de la respuesta, **entonces** el visitante ve lo que ya llegó, un salto de párrafo y la respuesta de respaldo.
5. **Dado** un sitio con trato de **usted** (spec 004), **entonces** la respuesta de respaldo va de usted: "No pude responder su consulta en este momento. Puede comunicarse con el negocio por {contacto}." Lo mismo vale para la respuesta fija del tope (spec 007), que hoy va siempre de vos.
6. **Dado** un sitio sin contacto cargado, **entonces** la respuesta de respaldo usa el contacto por defecto (`DEFAULT_CONTACT`), como la del tope.

### Qué queda guardado

7. **Dado** una respuesta de respaldo, **entonces** se guarda como mensaje del bot exactamente con el texto que vio el visitante (lo parcial, si lo hubo, más el respaldo), marcado como **derivada** (`derivation`), como la respuesta fija del tope (spec 011, criterio 2).
8. **Dado** una respuesta de respaldo, **entonces** la pregunta del visitante se guarda una sola vez, y al recargar el widget el visitante ve su pregunta y el respaldo, sin duplicados.
9. **Dado** una respuesta de respaldo, **entonces** la conversación queda **Necesita atención** con el motivo nuevo `model_error`. En la bandeja se lee "El bot no pudo responder".
10. **Dado** un fallo del modelo, **entonces** sigue quedando su fila en `ModelCall` con el error y costo 0 (spec 007), y el error sigue yendo a Sentry sin texto de la conversación (ADR 0008).

### Qué se entera el dueño

11. **Dado** la primera conversación de un sitio que pasa a `model_error` en las últimas 24 horas, **entonces** el dueño recibe un email (spec 010) con:
    - el asunto "El bot de {sitio} no pudo responder a un cliente";
    - el motivo "El bot no pudo responder por un problema de nuestro lado y le pasó tu contacto al visitante";
    - los últimos intercambios;
    - el link a la conversación;
    - la línea "Si vuelve a pasar hoy, las conversaciones quedan marcadas en tu bandeja sin otro email".
12. **Dado** un sitio que ya recibió hoy un aviso por `model_error`, **cuando** otra conversación falla, **entonces** se marca igual pero no se manda otro email. Con un fallo general, cada dueño recibe un solo email por día.
13. **Dado** el aviso de `model_error`, **entonces** respeta lo mismo que los otros avisos: el interruptor por sitio (spec 010, criterio 6), no se avisa si el dueño ya tomó el control, y cuenta dentro del máximo de 20 avisos por sitio por día.
14. **Dado** una conversación marcada por `model_error`, **cuando** el visitante vuelve a escribir y el modelo responde bien, **entonces** la marca se queda hasta que el dueño la atienda, la marque como atendida (spec 012) o tome el control. El visitante pudo haberse ido con el contacto.

### Métricas

15. **Dado** el dashboard del dueño, **entonces** las respuestas de respaldo cuentan como **derivadas** (spec 011) y sus conversaciones, en **Necesitaron atención**. El dueño ve que el bot no respondió.
16. **Dado** el panel de administración (`/admin`), **entonces** muestra cuántas respuestas de respaldo hubo en el período, por sitio y en total, al lado de la tasa de error de `ModelCall` que ya existe.
17. **Dado** una respuesta de respaldo, **entonces** cuenta para el tope diario de respuestas del sitio, como la respuesta fija del tope (spec 011, criterio 9).

## Fuera de alcance

- **Reintentar con otro modelo** (fallback del AI Gateway a un segundo proveedor). Cambia el modelo que responde y necesita el eval (ADR 0001). Si los datos de `/admin` muestran fallos frecuentes del proveedor, va en otra spec con su corrida del eval.
- **Reintentar con el mismo modelo** antes del respaldo. Suma latencia en el peor momento y el AI Gateway ya reintenta errores transitorios.
- **Fallos antes del modelo:** base caída, sitio inexistente, cuerpo inválido. Sin base no se puede guardar ni marcar nada; siguen respondiendo el error actual.
- **Separar en el dashboard las derivaciones por fallo de las derivaciones por falta de datos.** El motivo `model_error` lo permite más adelante; para la beta, al dueño le importa que el cliente fue derivado.
- **Alertas al operador nuevas.** Sentry ya alerta con cada issue nuevo (`docs/lanzamiento.md`, paso 5).
- **Un rate limit por IP** para que un abusador no agote el tope global. Es otro problema y va en otra spec.

## Notas técnicas

- **Dominio** (`src/domain/`):
  - `fallbackReply({ contact, addressing })` y `siteCapReply({ contact, addressing })` arman los dos textos fijos según el trato. Hoy `siteCapReply` vive en `src/server/widget-site.ts` y va solo de vos: pasa a dominio y se reutiliza.
  - `AttentionReason` suma `"model_error"`. `decideAttentionNotice` lo trata como `site_cap`: un aviso por sitio por día (`capNoticedToday` se generaliza a "ya se avisó hoy por este motivo").
  - `buildAttentionEmail` suma el asunto, el motivo y la línea del criterio 11.
- **Stream con respaldo** (`src/server/ai/answer.ts`):
  - `streamAnswer` deja de exponer `toTextStreamResponse` del SDK y devuelve un `ReadableStream` propio. Recorre `textStream`, y si hubo error (`onError`), texto vacío o timeout, encola el respaldo (con `\n\n` delante si ya había texto).
  - `finished` resuelve con `{ text, fallback: boolean }`, donde `text` es lo que se mandó.
  - Los timeouts usan un `AbortController`: uno se arma hasta el primer fragmento (15 s) y otro para el total (45 s). Se inyectan para que los tests no esperen.
  - El texto del respaldo llega como parámetro (`fallbackText`), así `answer.ts` no conoce al negocio.
- **Ruta** (`messages/route.ts`): en `onEnd`, si `fallback`, guarda el mensaje con `derivation: true`, llama a `flagAttention(room, "model_error")` y a `notifyOwner`, y no corre `detectAttention`. El `captureError` de `after()` queda para lo que falle al guardar.
- **Widget** (`src/components/widget/chat.tsx`): no cambia el camino feliz, porque el respaldo llega como texto. El `fail(...)` por stream vacío queda solo para errores de red reales. El criterio 8 se cumple porque el servidor ya no deja la pregunta sin respuesta.
- **Bandeja** (`src/components/inbox/links.ts`): rótulo de `model_error`.
- **Admin** (`src/server/admin-metrics.ts`): cuenta los `ChatRoom` con `attentionReason = 'model_error'` o, más preciso, los mensajes de respaldo. Para no depender del texto, conviene contar las filas de `ModelCall` con `error` no nulo cuyo `chatRoomId` tiene un mensaje derivado en ese minuto. Si resulta frágil, se suma `ChatMessage.fallback Boolean` (con migración). Se decide al implementar.
- **Sin migración**, salvo la opción anterior. `attentionReason` es texto y el comentario del schema suma el motivo nuevo.
- **E2E:** hace falta un modelo de prueba que falle. Se suma `mock/fail` (y `mock/empty`), habilitado igual que `mock/echo` con `AI_ALLOW_MOCK_MODEL=true`. Como el modelo es uno por servidor, la suite de fallo levanta el suyo, o el modelo mock falla cuando la pregunta trae un marcador (`[falla]`). Lo segundo es más barato y no toca la configuración de Playwright.
- **Riesgos:**
  - *El respaldo esconde un problema largo:* si el crédito se agota, todos los sitios responden con el contacto durante horas y el producto parece andar. Lo mitigan la alerta de Sentry, el email al 50 % del AI Gateway y el contador de `/admin`.
  - *Derivaciones infladas:* un mal día del proveedor sube la tasa de derivación que ve el dueño. Es lo que pasó desde el lado del visitante, así que es honesto; si confunde, se separa (ver Fuera de alcance).
  - *Timeouts demasiado cortos:* 15 s al primer fragmento cubre con margen las latencias del eval (unos 2 s con Haiku 4.5). Se revisan con la latencia p95 de `ModelCall` en la beta.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 5, 6 | Unitario de los textos de respaldo y del tope, de vos y de usted | `src/domain/fallback-reply.test.ts` |
| 11, 12, 13 | Unitario de la decisión y del email para `model_error` | `src/domain/attention-notice.test.ts` |
| 1, 2, 3, 4 | Unitario de `streamAnswer` con modelos mock: error antes del texto, timeout al primer fragmento y al total, texto vacío, error a mitad | `src/server/ai/answer.test.ts` |
| 7, 8, 9, 10, 17 | Integración de la ruta con un modelo que falla: guarda la pregunta una vez y el respaldo derivado, marca `model_error`, registra `ModelCall` con error | `src/app/api/widget/[domainId]/messages/route.int.test.ts` |
| 11, 12, 13, 14 | Integración del aviso: un email por sitio por día, respeta interruptor y control | `src/server/owner-notices.int.test.ts` |
| 15 | Integración de métricas: el respaldo cuenta como derivada | `src/actions/metrics/metrics.int.test.ts` |
| 16 | Integración de `/admin` | `src/server/admin-metrics.int.test.ts` |
| 1, 8, 9 | E2E del widget con `mock/fail`: el visitante ve el contacto, al recargar no hay duplicados y la bandeja muestra "El bot no pudo responder" | `e2e/widget.spec.ts` |
