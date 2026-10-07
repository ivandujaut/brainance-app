# 012 — Marcar una conversación como atendida

- **Estado:** Borrador
- **ADRs relacionados:** [0004 — Aislamiento multi-tenant](../adr/0004-aislamiento-multi-tenant.md)
- **Specs relacionadas:** [006 — Bandeja de conversaciones](006-bandeja-de-conversaciones.md) (la marca "Necesita atención"), [010 — Aviso al dueño](010-aviso-al-dueno.md) (el email que invita a responder por fuera), [011 — Métricas de honestidad](011-tope-visible-y-metricas-de-honestidad.md) (tiempo de respuesta)
- **Posicionamiento:** sostiene la promesa "vos te enterás solo cuando hace falta". Una marca que el dueño no puede sacar sigue avisando de algo que ya resolvió.

## Problema

Hoy la única forma de sacar la marca **Necesita atención** es tomar el control de la conversación. Eso le muestra al visitante "Ahora te atiende una persona…" y, al devolverla, "Te vuelve a atender el asistente virtual", aunque el dueño no le escriba nada. Además sube la conversación al primer lugar de la bandeja. El QA de la spec 011 lo mostró al limpiar una conversación marcada por un falso positivo.

Hay casos comunes en los que el dueño necesita sacar la marca sin hablarle al visitante:

- **Respondió por fuera:** contestó el email del aviso (spec 010), que va directo al visitante, o le escribió por WhatsApp.
- **Falso positivo:** el bot contestó bien y el detector igual la marcó.
- **Se resolvió sola:** el visitante consiguió lo que necesitaba con el contacto que le pasó el bot.

## Historias de usuario

- Como **dueño del negocio**, quiero marcar una conversación como atendida sin escribirle al visitante, para que la bandeja muestre solo lo que todavía me necesita.
- Como **visitante del sitio**, no quiero ver avisos de que me atiende una persona si nadie me va a escribir.

## Criterios de aceptación

Cada criterio se convierte en al menos un test.

1. **Dado** una conversación marcada **Necesita atención** que atiende el bot, **cuando** el dueño la abre, **entonces** ve el botón **Marcar como atendida** junto a **Tomar el control**.
2. **Dado** ese botón, **cuando** el dueño lo toca, **entonces** la marca se quita y la conversación sale del filtro **Necesita atención**. Aparece el aviso "Marcada como atendida".
3. **Dado** una conversación marcada como atendida, **entonces** el visitante no ve ningún cambio: no se agrega ningún mensaje ni aviso, y el bot sigue respondiendo.
4. **Dado** una conversación marcada como atendida, **entonces** no cambia de lugar en la bandeja.
5. **Dado** una conversación marcada como atendida, **entonces** el motivo queda como historial: sigue contando en **Necesitaron atención** del dashboard (spec 007) y en **Pidieron una persona** si ese fue el motivo (spec 011). No cuenta como tiempo de respuesta, porque el dueño no escribió en el chat.
6. **Dado** una conversación marcada como atendida, **cuando** el bot vuelve a derivar o el visitante pide una persona, **entonces** se vuelve a marcar como una vez nueva: el dueño recibe el aviso por email (spec 010) y su próxima respuesta en el chat cuenta como tiempo de respuesta (spec 011).
7. **Dado** una conversación en vivo o sin marca, **entonces** el botón no aparece, y si la acción llega igual no cambia nada.
8. **Dado** el email de aviso (spec 010), **entonces** suma la línea "¿Ya le respondiste por otro medio? Marcala como atendida desde la conversación." antes del link.
9. **Dado** otro dueño que conoce el id de la conversación, **cuando** llama a la acción, **entonces** no cambia nada (ADR 0004).

## Fuera de alcance

- Marcar varias conversaciones a la vez, o marcar desde la lista sin abrir la conversación.
- Deshacer. Si el dueño se equivocó, la conversación se vuelve a marcar con la próxima derivación, o puede tomar el control.
- Registrar cómo se atendió (por email, por WhatsApp, falso positivo) o medir cuántas se atienden por fuera. Si la beta muestra que importa, va con un dato nuevo y su métrica.
- Marcar como atendida desde el email sin entrar al panel: necesitaría un link firmado y no se justifica para la beta.

## Notas técnicas

- **Servidor** (`src/server/live.ts`): `markAttended(db, roomId)` corre bajo `withRoomLock`, como `takeOver` y `flagAttention`. Si la sala tiene la marca y no está en vivo, pone `needsAttention = false` y devuelve `true`; si no, no toca nada y devuelve `false`. No cambia `attentionReason`, `attentionAt`, `attentionNotices` ni `lastMessageAt`, y no agrega mensajes.
- **Por qué alcanza para el criterio 6:** `flagAttention` ya trata una sala sin marca como una vez nueva (pone `attentionAt` y reinicia `attentionNotices`), y `decideAttentionNotice` (spec 010) avisa en una vez nueva. Con eso, el tiempo de respuesta sale del primer mensaje del dueño después de esa marca nueva (`answersAttentionAt`, spec 011).
- **Acción** (`src/actions/conversation`): `onMarkAttended(id)` resuelve la sala con `findOwnedChatRoom`, llama a `markAttended` y a `notifyRoomChanged` para que otros paneles abiertos se actualicen. El widget recibe el evento y no encuentra nada nuevo. Devuelve 200 con "Marcada como atendida" aunque la sala ya no tuviera la marca: el resultado que ve el dueño es el mismo.
- **UI** (`src/components/inbox/conversation-pane.tsx`): botón con variante `outline` cuando `needsAttention && !live`, con el mismo patrón `run(...)` que los otros botones.
- **Email** (`src/domain/attention-notice.ts`): la línea nueva va en el texto y en el HTML de `buildAttentionEmail`, también en el recordatorio y en el aviso del tope.
- **Sin migración.**
- **Riesgos:**
  - *Marcar sin responder:* un dueño puede usar el botón para sacar de la vista una conversación que nadie atendió. Es decisión del dueño, pero el tiempo de respuesta no lo refleja: mide solo las respuestas en el chat.
  - *Carrera con una derivación nueva:* el lock serializa las dos operaciones. Si la derivación llega después de marcar, es una vez nueva y corresponde avisar.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 2, 3, 4, 5, 7 | Integración de `markAttended`: quita la marca, conserva el motivo y `attentionAt`, no agrega mensajes, no mueve `lastMessageAt`, no hace nada en vivo o sin marca | `src/server/live.int.test.ts` |
| 6 | Integración: después de marcar como atendida, una derivación nueva avisa por email y la respuesta siguiente del dueño cuenta como tiempo de respuesta | `src/server/owner-notices.int.test.ts`, `src/server/live.int.test.ts` |
| 2 | Integración de `onMarkAttended` como dueño | `src/actions/conversation/conversation.int.test.ts` |
| 9 | Aislamiento de tenants | `src/actions/tenant-isolation.int.test.ts` |
| 8 | Unitario del email | `src/domain/attention-notice.test.ts` |
| 1, 2, 3, 4 | E2E: el dueño marca una conversación como atendida; desaparece del filtro, no se mueve y el visitante no recibe avisos | `e2e/conversations.spec.ts` |
