# 006 — Bandeja de conversaciones

- **Estado:** Aprobada (2026-10-04)
- **ADRs relacionados:** [0003 — Arquitectura y límites del widget](../adr/0003-arquitectura-del-widget.md), [0004 — Aislamiento multi-tenant](../adr/0004-aislamiento-multi-tenant.md), [0007 — Tiempo real híbrido](../adr/0007-tiempo-real-hibrido.md)

## Problema

Las conversaciones del widget se guardan, pero el dueño no puede verlas: el ítem "Conversations" del menú lleva a una página que no existe. Tampoco puede intervenir cuando el bot no sabe algo o el visitante quiere hablar con una persona, que es justo cuando hay una venta en juego.

## Historias de usuario

- Como **dueño del negocio**, quiero ver las conversaciones de mis sitios y cuáles necesitan atención, para no perder consultas importantes.
- Como **dueño**, quiero tomar el control de una conversación y responderle al visitante en el momento, y devolvérsela al bot cuando termino.
- Como **visitante**, quiero saber cuándo me atiende una persona y recibir sus respuestas sin recargar.

## Criterios de aceptación

### Bandeja

1. **Dado** un dueño con conversaciones, **cuando** entra a **Conversaciones** (`/conversations`), **entonces** ve sus conversaciones de todos sus sitios, de la más reciente a la más vieja. Cada una muestra el sitio, el email si es lead (si no, "Visitante"), el último mensaje, la fecha y la cantidad de mensajes sin leer.
2. **Dado** la bandeja, **entonces** puede filtrar por sitio y por **Todas**, **Sin leer** o **Necesita atención**.
3. **Dado** una conversación, **cuando** el dueño la abre, **entonces** ve todos los mensajes en orden, distinguiendo visitante, bot y dueño, y los datos del lead si los dejó. Los mensajes del visitante quedan como leídos.
4. **Dado** un celular, **entonces** la bandeja muestra la lista y, al elegir una conversación, la conversación a pantalla completa con un botón para volver.

### Necesita atención

5. **Dado** una respuesta del bot que deriva al contacto del negocio (dice que no tiene el dato y repite alguno de los datos del contacto: teléfono, email, link o usuario, aunque cambie el resto del texto) o la respuesta fija del tope diario, **entonces** la conversación queda marcada como **Necesita atención**.
6. **Dado** un mensaje del visitante que pide hablar con una persona ("quiero hablar con alguien", "¿me atiende un humano?", "pasame con un asesor", y variantes), **entonces** la conversación queda marcada como **Necesita atención**.
7. **Dado** una conversación marcada, **cuando** el dueño toma el control o responde, **entonces** la marca se quita.

### Toma de control

8. **Dado** una conversación abierta, **cuando** el dueño toca **Tomar el control**, **entonces** el bot deja de responder en esa conversación, y el visitante ve en el chat el aviso "Ahora te atiende una persona de <negocio>".
9. **Dado** una conversación en vivo, **cuando** el dueño escribe un mensaje (hasta 2.000 caracteres), **entonces** el visitante lo ve en el widget en pocos segundos sin recargar, distinguido de los mensajes del bot (con la etiqueta "<negocio>").
10. **Dado** una conversación en vivo, **cuando** el visitante escribe, **entonces** no se llama al modelo, el mensaje queda guardado y el dueño lo ve en la bandeja en pocos segundos sin recargar.
11. **Dado** una conversación en vivo, **cuando** el dueño toca **Devolver al bot**, **entonces** el visitante ve "Te vuelve a atender el asistente virtual" y el bot responde los mensajes siguientes.
12. **Dado** una conversación en vivo en la que el dueño no escribió en los últimos 30 minutos (desde que tomó el control o desde su último mensaje), **cuando** el visitante escribe, **entonces** la conversación vuelve al bot automáticamente con el mismo aviso, y el bot responde ese mensaje.
13. **Dado** el contexto que recibe el modelo, **entonces** los mensajes del dueño se incluyen como respuestas del negocio y los avisos del sistema no se incluyen.

### Tiempo real y límites

14. **Dado** que no hay proveedor de push configurado, **entonces** todo lo anterior funciona por polling (ADR 0007). Con Pusher configurado, los mensajes llegan en menos de un segundo, y si Pusher se desconecta, el polling sigue funcionando.
15. **Dado** una conversación en vivo, **entonces** los mensajes del visitante siguen sujetos al límite por visitante (20 cada 10 minutos), pero no al tope diario del sitio, que solo protege el costo del modelo.

### Seguridad

16. **Dado** otro dueño que conoce el id de una conversación ajena, **cuando** llama a las acciones de la bandeja (listar, leer, marcar leída, tomar o devolver el control, responder), **entonces** no lee ni modifica nada.
17. **Dado** un pedido de mensajes nuevos del widget sin el `visitorId` de esa conversación, **entonces** no devuelve nada. Con push activado, la autorización de un canal privado exige la sesión del dueño o el `visitorId` del visitante, y los eventos no llevan contenido.

## Fuera de alcance

- Varios agentes por cuenta, asignación de conversaciones o notas internas (requiere equipos; ver ADR 0004 sobre RLS).
- Notificaciones push al celular o por email de mensajes nuevos.
- Archivos adjuntos, respuestas predefinidas o "está escribiendo…".
- Detectar la necesidad de atención con IA: la regla es simple a propósito y se puede refinar con datos de la beta.
- Búsqueda de texto en las conversaciones.

## Notas técnicas

**Datos**
- `enum Role` suma `owner` y `system`. Los mensajes del dueño dejan de guardarse como `assistant`. `listMessages` y el historial para el modelo mapean `owner` como `assistant` y excluyen `system` (criterio 13).
- `ChatRoom` suma:
  - `liveSince DateTime?` (cuándo se tomó el control);
  - `needsAttention Boolean @default(false)` y `attentionReason String?` (`"derivation"` | `"human_request"` | `"site_cap"`);
  - `lastMessageAt DateTime?`, para ordenar la bandeja sin agregaciones.
- Índices: `ChatRoom(lastMessageAt)` y `ChatMessage(chatRoomId, seen)`.

**Dominio (`src/domain/`)**
- `attention.ts`: `detectAttention({ visitorText, reply, contact })` devuelve un motivo o null. Busca en la respuesta los datos del contacto configurado y usa expresiones para pedidos de persona en español rioplatense y neutro, normalizando tildes y mayúsculas.
- `takeover.ts`:
  - `shouldBotAnswer({ live, liveSince, lastOwnerMessageAt, now })` decide si el bot responde o si corresponde devolverle el control automáticamente (30 minutos, criterio 12);
  - `toModelHistory(messages)` aplica el mapeo de roles.
- `polling.ts`: `pollInterval({ live, visible, pushConnected })` (ADR 0007).

**Widget**
- `POST …/messages`:
  - si la sala está en vivo y no corresponde devolverla, guarda el mensaje del visitante y responde `{ live: true }` sin llamar al modelo;
  - si corresponde devolverla, la libera, agrega el aviso de sistema y sigue con el bot;
  - después de cada respuesta del bot, evalúa `detectAttention`.
- `GET …/conversation?visitorId=…&after=<id>` devuelve solo los mensajes nuevos y `live`. El widget lo consulta según `pollInterval` y muestra `owner` con la etiqueta del negocio y `system` como aviso centrado.

**Panel**
- Ruta `/conversations` (Server Component para la lista inicial, cliente para la conversación abierta). El ítem del menú pasa a "Conversaciones". Usa solo tokens (ADR 0005).
- Acciones en `src/actions/conversation`, reescritas sobre `findOwnedChatRoom` y `findOwnedSite`: `onListConversations({ siteId?, filter })`, `onGetConversation(id, after?)`, `onMarkRead(id)`, `onTakeOver(id)`, `onReleaseToBot(id)` y `onOwnerReply(id, text)`. Las acciones heredadas que queden sin uso se eliminan junto con sus casos de test. Las nuevas suman los suyos en `tenant-isolation.int.test.ts`.

**Tiempo real** (ADR 0007)
- Paso 1: polling con cursor en el panel y en el widget.
- Paso 2: `RealtimePublisher` (`noop` | `pusher`). Las acciones del dueño y el endpoint de mensajes publican `{ type: "changed" }` en `private-owner-<userId>` y `private-room-<chatRoomId>`. El endpoint `/api/realtime/auth` autoriza con Clerk (dueño) o con `visitorId` contra la base (visitante).

**IA**
- El template del prompt no cambia. Cambia el historial: los mensajes del dueño entran como respuestas del negocio. Se suma al eval set un caso con un mensaje del dueño en el historial, para verificar que el bot no lo contradice al retomar (ADR 0001).

## Riesgos y preguntas abiertas

- **Falsos positivos o negativos de "Necesita atención":** la regla depende de que la respuesta repita el contacto, como pide el prompt. Se mide en la beta y, si no alcanza, se reemplaza por un clasificador (el ADR 0001 ya contempla uno).
  - *QA en la preview (2026-10-06):* el modelo reformula el contacto ("WhatsApp +54 9 11 5555-0000 (prueba)" volvió sin la nota), así que buscar el texto completo no detectaba derivaciones reales. Desde entonces se buscan sus datos:
    - **teléfonos:** comparando solo los dígitos, con 8 o más, y aceptando que falten el código de país o de área;
    - **emails, links y usuarios:** comparados tal cual.
  - Si el contacto no tiene ninguno de esos datos, por ejemplo una dirección, se sigue buscando el texto completo.
  - ~~**Falso positivo aceptado:** una respuesta que contesta y además ofrece el contacto también se marca.~~ Revisado en el QA de la spec 011 (2026-10-07): con el aviso por email (spec 010) y las métricas de honestidad, cada falsa alarma le manda un email al dueño e infla "Derivadas". Respuestas reales como "Sí, hacemos envíos en CABA. Para más detalles… contactarnos por WhatsApp…" se marcaban.
  - **Desde entonces** una derivación además tiene que decir que no tiene el dato ("no tengo esa información", "no cuento con ese dato", "no te puedo confirmar", "no figura"), que es lo que el prompt le pide al bot cuando no sabe. El riesgo pasa a ser el contrario: una derivación sin esa frase no se marca. Se mide en la beta junto con el eval.
- **Polling y cuota de Neon:** ver las consecuencias del ADR 0007. El push activado lo reduce.
- **Orden en el widget** (QA de la spec 011, 2026-10-07): el widget muestra el mensaje del visitante al instante con una copia local y después trae lo que le faltaba. Si el dueño tomó el control, respondió y devolvió la conversación antes de esa consulta, sus mensajes quedaban debajo de la pregunta nueva. `mergeMessages` (`src/domain/widget-messages.ts`) ahora respeta el orden en que se guardaron y deja al final solo lo que todavía no está guardado.
- **El visitante cierra el chat mientras lo atiende una persona:** el mensaje del dueño queda guardado y lo ve al volver a abrir el chat. Notificarlo fuera del sitio queda fuera de alcance.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 5, 6 | Unitario: detección de derivación y pedidos de persona (con casos negativos) | `src/domain/attention.test.ts` |
| 12, 13 | Unitario: devolución automática a los 30 minutos y mapeo de roles para el modelo | `src/domain/takeover.test.ts` |
| 14 | Unitario: intervalos de polling | `src/domain/polling.test.ts` |
| 7, 8, 11, 12 | Integración (Postgres): toma de control, respuesta del dueño, devolución manual y automática, cursor | `src/server/live.int.test.ts` |
| 1, 2, 3 | Integración: listado, filtros, no leídos y orden | `src/actions/conversation/conversation.int.test.ts` |
| 16 | Integración: cada acción como dueño y como otro tenant | `src/actions/tenant-isolation.int.test.ts` |
| 17 | Integración: el cursor del widget exige el `visitorId`; sin push, la autorización de canales se rechaza | `src/app/api/widget/[domainId]/conversation/route.int.test.ts` |
| 14, 17 | Unitario: publicador `noop`/`pusher` y autorización de canales del dueño y del visitante | `src/server/realtime/index.test.ts` |
| 1, 2, 3 | Render de la bandeja con las acciones simuladas | `src/app/(site)/(dashboard)/conversations/page.test.tsx` |
| 13 | Eval: caso con un mensaje del dueño en el historial | `evals/rag-answers/cases.json` (`cd-takeover-01`) |
| 8, 9, 10, 14 | E2E del widget (sin Pusher, por polling): la sala pasa a vivo (vía base), el visitante ve el aviso y los mensajes del dueño sin recargar, y no se llama al modelo | `e2e/widget-live.spec.ts` |
| 1–4, 8–11 | E2E del panel (requiere Clerk): abrir, tomar el control, responder y devolver | `e2e/conversations.spec.ts` |
