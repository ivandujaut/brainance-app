# 011 — Tope visible y métricas de honestidad

- **Estado:** Implementada
- **ADRs relacionados:** [0008 — Errores y métricas](../adr/0008-errores-y-metricas.md), [0004 — Aislamiento multi-tenant](../adr/0004-aislamiento-multi-tenant.md)
- **Specs relacionadas:** [007 — Observabilidad](007-observabilidad.md) (tope de costo y métricas del dashboard), [006 — Bandeja](006-bandeja-de-conversaciones.md) (marca de derivación), [010 — Aviso al dueño](010-aviso-al-dueno.md) (`attentionAt`)
- **Posicionamiento:** segunda y tercera [prueba](../posicionamiento.md#las-tres-pruebas): "la honestidad medida" y "el precio previsible".

## Problema

El dueño no tiene forma de saber si el bot está haciendo lo que promete. El panel le dice cuántas conversaciones hubo y cuántas "necesitaron atención", pero no cuántas respuestas dio el bot, cuántas veces derivó en vez de inventar, ni cuánto tardó él en atender cuando lo llamaron. Y el tope de uso existe, pero es un número que solo ve el operador: el dueño no sabe que hay un límite, cuánto le queda ni qué pasa cuando se alcanza. La [investigación de mercado](../mercado/2026-10-chat-ia-pymes.md) muestra que la queja número uno de la categoría es "el bot inventa" y la segunda, "la factura sorpresa". Las dos se contestan con números a la vista, no con adjetivos.

## Historias de usuario

- Como **dueño del negocio**, quiero ver cuántas consultas respondió el bot y cuántas me derivó, para confiar en que no inventa.
- Como **dueño**, quiero saber cuánto tardo en atender cuando el bot me necesita, para mejorar.
- Como **dueño**, quiero ver cuántas respuestas usó mi sitio hoy y cuál es el tope, para que no haya sorpresas.
- Como **dueño**, quiero fijar un tope diario de respuestas más bajo que el de la beta, para controlar el uso si mi sitio recibe mucho tráfico o alguien se pone a jugar con el chat.
- Como **dueño**, quiero saber qué pasa cuando se llega al tope: que el bot deriva a mi contacto, no que desaparece.

## Criterios de aceptación

Cada criterio se convierte en al menos un test.

### Métricas de honestidad (dashboard)

1. **Dado** un dueño en el dashboard, con el período y el sitio elegidos (spec 007, criterio 11), **entonces** ve además: **Respuestas del bot** (cantidad), **Derivadas** (cantidad y porcentaje sobre las respuestas) y **Pidieron una persona** (conversaciones donde el visitante lo pidió).
2. **Dado** una respuesta del bot que deriva al contacto (spec 006, criterio 5) o la respuesta fija del tope (spec 007, criterio 9), **entonces** esa respuesta cuenta como **derivada**. Las demás cuentan como respondidas por el bot. Se cuenta por respuesta, no por conversación.
3. **Dado** conversaciones que necesitaron atención y en las que el dueño después escribió, **entonces** el dashboard muestra **Tu tiempo de respuesta**: la mediana del tiempo entre que la conversación se marcó (`attentionAt`) y el primer mensaje del dueño, en minutos u horas. Cada vez que la conversación se vuelve a marcar es un caso nuevo, y los anteriores se conservan. Sin casos en el período, muestra "Sin datos todavía".
4. **Dado** una conversación atendida por una persona (spec 006), **entonces** los mensajes del dueño no cuentan como respuestas del bot.
5. **Dado** un período sin respuestas, **entonces** los porcentajes muestran "—" y no "NaN" ni 0 % engañoso.
6. **Dado** otro dueño, **entonces** las métricas nunca incluyen datos de sitios ajenos (igual que spec 007, criterio 13).

### Tope visible

7. **Dado** la configuración de un sitio, **entonces** hay una sección **Uso y tope** que muestra: las respuestas de hoy sobre el tope vigente ("Hoy: 12 de 300 respuestas"), una barra de progreso, y la explicación "Cuando se llega al tope, el bot deja de responder con IA y deriva a tu contacto. No se apaga."
8. **Dado** esa sección, **entonces** el dueño puede fijar un **tope diario de respuestas** entre 20 y el máximo de la beta (300). Vacío significa el máximo. Un valor fuera de rango se rechaza con el error en español.
9. **Dado** un tope fijado por el dueño, **cuando** el sitio llega a esa cantidad de respuestas en las últimas 24 horas, **entonces** el bot responde con la respuesta fija del tope y la conversación queda **Necesita atención** (`site_cap`), igual que con el tope de la beta hoy. El tope de costo del operador (spec 007) sigue vigente por encima: se aplica el que se alcance primero.
10. **Dado** una conversación atendida por una persona, **entonces** el tope del dueño no la afecta (spec 007, criterio 10).
11. **Dado** el dashboard con un sitio elegido, **entonces** muestra también "Hoy: N de M respuestas" con un link a la sección Uso y tope de ese sitio.
12. **Dado** un sitio que llegó al tope, **entonces** la sección y el dashboard lo dicen en texto ("Hoy el bot llegó al tope y está derivando") hasta que el día deslizante libere cupo.

### Datos y robustez

13. **Dado** una respuesta del bot, **entonces** queda registrado en el mensaje si fue una derivación (`ChatMessage.derivation`), para que las métricas no dependan de reinterpretar el texto después.
14. **Dado** el tope del dueño, **entonces** se guarda en el sitio (`ChatBot.dailyAnswerCap`) y solo lo cambia el dueño de ese sitio (ADR 0004).

## Fuera de alcance

- Tope en dinero o por plan: en la beta no se cobra. Cuando haya planes, el tope en pesos reemplaza o acompaña al de respuestas; el dato de consumo ya está.
- Cambiar el tope de costo del operador (`AI_SITE_DAILY_COST_USD`) desde el panel.
- Mostrar el costo en USD al dueño: sigue en `/admin`.
- Publicar las métricas fuera del panel (por ejemplo, en la landing): va con la spec del titular nuevo.
- Avisar por email al llegar al tope: ya lo hace la spec 010.

## Notas técnicas

- **Dominio puro** (`src/domain/`):
  - `answer-cap.ts`: `BETA_DAILY_ANSWER_MAX = 300`, `MIN_DAILY_ANSWER_CAP = 20`, `effectiveAnswerCap(configured)`, `DailyAnswerCapSchema` (zod, mensajes en español) y `usageState({ answersToday, cap })` → `{ remaining, ratio, reached }`.
  - `metrics.ts`: `derivationRate({ answers, derived })` y `medianMinutes(values)` (reutiliza `percentile`), con el caso vacío.
- **Datos (migración):** `ChatMessage.derivation Boolean @default(false)`; `ChatBot.dailyAnswerCap Int?`.
- **Marcar la derivación:** en `POST /api/widget/[domainId]/messages`, donde hoy se llama `flagAttention` tras `detectAttention`, se marca también el mensaje del bot (`markDerivation(db, messageId)`); la respuesta fija del tope se crea ya marcada.
- **Tope del dueño:** `checkIncomingMessage` recibe el tope efectivo del sitio en lugar de la constante; `getWidgetSite` trae `dailyAnswerCap`. Hoy `countSiteMessagesSince` cuenta mensajes del visitante, incluidos los de conversaciones atendidas por una persona: pasa a contar **respuestas del bot** (mensajes `assistant` de las últimas 24 horas), que es el número que ve el dueño y que no incluye lo que atendió él.
- **Métricas:** `onGetOwnerMetrics` suma `answers` (mensajes `assistant` del período), `derived` (con `derivation = true`), `humanRequests` (salas con `attentionReason = 'human_request'`) y la mediana de `createdAt − answersAttentionAt` de los mensajes del dueño que tienen ese dato. `ownerReply` lo guarda en el primer mensaje del dueño después de cada marca: calcularlo con `ChatRoom.attentionAt` perdía el caso cuando la conversación volvía al bot y se marcaba de nuevo (QA en la preview, 2026-10-07). La migración `owner_response_time` recupera los casos de la marca vigente de cada sala. Todo en la misma consulta por sitio y período, con el `scope` de tenancy actual.
- **Uso de hoy:** una server action `onGetSiteUsage(siteId)` con `findOwnedSite`, que devuelve `answersToday`, `cap` y `reached`. La sección de configuración y el dashboard la usan.
- **UI:** `StatTile` existente para los tres números nuevos y el tiempo de respuesta; sección `UsageSection` en la configuración, con una barra de progreso hecha con los tokens (no hay componente `Progress`); input numérico con guardado al salir del campo, como las otras secciones.
- **Riesgos:**
  - *Falsos positivos de derivación* (spec 006): inflan "Derivadas". Es el mismo detector que ya marca la bandeja; se mide en la beta. En el QA en la preview, respuestas que contestaban y además ofrecían el WhatsApp contaban como derivadas: desde entonces la derivación también exige que el bot diga que no tiene el dato (spec 006, riesgos).
  - *Conteo de "respuestas"*: el tope y la sección de uso tienen que salir del mismo número (respuestas del bot en 24 horas). El criterio 9 y su test de integración lo fuerzan.
  - *Mediana con pocos casos* es ruidosa: se muestra con la cantidad de casos ("sobre 3 conversaciones").

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 5, 8 | Unitario: tasa, mediana, caso vacío, rango del tope, estado de uso | `src/domain/answer-cap.test.ts`, `src/domain/metrics.test.ts` |
| 1, 2, 3, 4, 6 | Integración de `onGetOwnerMetrics` con datos sembrados: respuestas, derivadas, pedido de persona, tiempo de respuesta, y otro tenant | `src/actions/metrics/metrics.int.test.ts` |
| 9, 10, 13 | Integración de la ruta del widget: con tope 20, la respuesta 21 es la fija y marca `site_cap`; la derivación marca el mensaje; la conversación en vivo no cuenta | `src/server/conversations.int.test.ts` o nuevo `widget-cap.int.test.ts` |
| 14 | Aislamiento de tenants del tope | `src/actions/tenant-isolation.int.test.ts` |
| 7, 11, 12 | E2E del panel (con Clerk): la sección muestra el uso y el tope, guarda un tope, el dashboard lo refleja | `e2e/bot-settings.spec.ts`, `e2e/dashboard.spec.ts` |
| 9 | E2E del widget: un sitio con tope 20 y 20 respuestas sembradas deriva en la siguiente | `e2e/widget.spec.ts` |
