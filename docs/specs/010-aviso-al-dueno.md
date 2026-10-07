# 010 — Aviso al dueño cuando una conversación necesita atención

- **Estado:** Implementada
- **ADRs relacionados:** [0006 — Proveedor de email](../adr/0006-proveedor-de-email.md), [0008 — Errores y métricas](../adr/0008-errores-y-metricas.md)
- **Specs relacionadas:** [005 — Captura de leads](005-captura-de-leads.md) (el email al dueño que se reutiliza), [006 — Bandeja de conversaciones](006-bandeja-de-conversaciones.md) (quién marca "Necesita atención")
- **Posicionamiento:** es la primera de las [tres pruebas](../posicionamiento.md#las-tres-pruebas) de la promesa "vos te enterás solo cuando hace falta".

## Problema

Hoy el bot marca una conversación como **Necesita atención** cuando deriva al contacto del negocio, cuando el visitante pide hablar con una persona o cuando el sitio llegó a su tope diario. Pero nadie se lo dice al dueño: la marca solo se ve si entra al panel. El visitante que preguntó a las 3 de la mañana y fue derivado al WhatsApp queda esperando, y el dueño se entera, si se entera, al día siguiente. Es exactamente lo que la [investigación de mercado](../mercado/2026-10-chat-ia-pymes.md) señala como el fallo más castigado de la categoría ("avisame cuando el bot se traba").

## Historias de usuario

- Como **dueño del negocio**, quiero recibir un email cuando el bot derivó a un visitante o el visitante pidió una persona, con el motivo y lo que se habló, para contestarle yo sin tener que revisar el panel.
- Como **dueño**, quiero que el email me lleve directo a esa conversación para tomar el control en un toque desde el celular.
- Como **dueño**, quiero que me vuelvan a avisar si el visitante sigue escribiendo y yo todavía no lo atendí, para no dejarlo colgado.
- Como **dueño**, quiero enterarme el día que mi sitio llegó al tope de gasto, para saber que el bot está derivando en vez de responder.
- Como **dueño**, no quiero recibir veinte emails por una misma conversación ni una avalancha si alguien se pone a jugar con el chat.

## Criterios de aceptación

Cada criterio se convierte en al menos un test.

### Cuándo se avisa

1. **Dado** una conversación que pasa a **Necesita atención** por derivación o por pedido de persona (spec 006, criterios 5 y 6), **entonces** el dueño del sitio recibe un email, una sola vez por episodio. Un episodio empieza cuando la conversación se marca y termina cuando el dueño toma el control o responde (lo que hoy quita la marca, spec 006); si más tarde se vuelve a marcar, es otro episodio y se avisa de nuevo.
2. **Dado** una conversación ya marcada y sin atender, **cuando** el visitante vuelve a escribir al menos 30 minutos después del último aviso, **entonces** se manda **un** recordatorio ("sigue esperando") con los mensajes nuevos. No hay más de un recordatorio por episodio.
3. **Dado** una conversación en la que el dueño ya tomó el control (`liveSince`), **entonces** no se avisa: el dueño está ahí.
4. **Dado** un sitio que llega a su **tope diario** de mensajes o de costo (spec 007), **entonces** el dueño recibe un email que lo explica, una vez por día por sitio, aunque haya muchas conversaciones afectadas.
5. **Dado** un sitio que ya recibió **20 avisos en las últimas 24 horas**, **cuando** corresponde otro, **entonces** la conversación se marca igual pero no se manda email, y queda registrado en Sentry como aviso (no como error). Protege al dueño de una avalancha.
6. **Dado** la configuración del bot (spec 004), **entonces** el dueño puede desactivar los avisos por sitio. Vienen activados. Desactivarlos no cambia la marca en la bandeja.

### Qué dice el email

7. **Dado** un aviso, **entonces** el email contiene: el nombre del sitio; el motivo en castellano ("El bot derivó al contacto", "El visitante pidió hablar con una persona", "El sitio llegó al tope diario"); los **últimos tres intercambios** (pregunta del visitante y respuesta del bot), o menos si la conversación es más corta; el email del visitante si dejó sus datos; y un link directo a la conversación en el panel (`/conversations?c=<id>`).
8. **Dado** un visitante que dejó su email (spec 005), **entonces** responder el email del aviso le escribe directamente a él (`replyTo`). Si no lo dejó, el email no tiene `replyTo`.
9. **Dado** el asunto del email, **entonces** es de una línea y dice el sitio y el motivo, por ejemplo "Un cliente de panaderia.com.ar espera tu respuesta". Para el tope: "Tu sitio panaderia.com.ar llegó al tope de hoy".
10. **Dado** cualquier texto escrito por el visitante o generado por el bot, **entonces** en la parte HTML va escapado y en el asunto no hay saltos de línea (como en el email de leads).

### Robustez y datos

11. **Dado** un error del proveedor de email, **entonces** la respuesta del bot al visitante no se ve afectada y el error queda en Sentry sin el texto de la conversación (ADR 0008).
12. **Dado** que el email se manda después de responder al visitante (`after()`), **entonces** la latencia de la respuesta no cambia.
13. **Dado** una conversación que pasa a Necesita atención, **entonces** se guardan `attentionAt` (cuándo empezó el episodio) y `attentionNotifiedAt` (cuándo se avisó). Sirven para no repetir avisos y para medir, más adelante, el tiempo hasta la primera respuesta humana.
14. **Dado** que el dueño toma el control o responde, **entonces** el episodio se cierra (`needsAttention` en falso, como hoy) y los campos quedan como historial. Abrir la conversación sin actuar no lo cierra: la marca de la bandeja tampoco se quita, y así el recordatorio sigue valiendo.

## Fuera de alcance

- Recordatorios por tiempo sin que el visitante escriba (requiere un cron). El recordatorio de esta spec se dispara con la actividad del visitante.
- Notificaciones push, SMS o WhatsApp al dueño. El canal es el email, ya configurado para leads.
- Mostrar en el dashboard el tiempo hasta la primera respuesta humana: esta spec guarda los datos; la métrica va con la spec del tope visible y las métricas de honestidad.
- Avisar al visitante por fuera del chat.

## Notas técnicas

- **Reutiliza el camino de los leads:** `sendLeadNotice` (`src/server/leads.ts`) resuelve el email del dueño con Clerk (`src/server/owner-email.ts`) y manda con `EmailSender` (ADR 0006). Se extrae lo común a `src/server/owner-notices.ts` y los dos avisos lo usan.
- **Dominio puro** (`src/domain/attention-notice.ts`):
  - `decideAttentionNotice({ reason, needsAttentionBefore, liveSince, attentionNotifiedAt, lastVisitorAt, noticesToday, enabled })` devuelve `"notify" | "remind" | "skip"` con el motivo del salto, sin tocar la base;
  - `buildAttentionEmail({ siteName, reason, exchanges, visitorEmail, conversationUrl })` arma asunto, texto y HTML, con escape como `buildLeadEmail`.
- **Datos (migración):** en `ChatRoom`, `attentionAt DateTime?`, `attentionNotifiedAt DateTime?` y `attentionNotices Int` (avisos del episodio: 1 el primero, 2 con el recordatorio; se reinicia al empezar otro episodio); en `ChatBot`, `attentionEmail Boolean @default(true)`. El límite diario cuenta las salas del sitio con `attentionNotifiedAt` en las últimas 24 horas; no hace falta tabla nueva.
- **Email del dueño:** se guarda en `User.email` al entrar (`ensureUser`) y `ownerEmail` lo lee de la base, con Clerk solo como respaldo para cuentas anteriores. Así los avisos no dependen de Clerk, y el E2E puede verificarlos sin claves.
- **E2E:** el servidor de Playwright corre con `EMAIL_PROVIDER=log` (el build de producción elegiría Resend), y los tests comprueban en la base que la sala quedó notificada.
- **Dónde se engancha:** en `POST /api/widget/[domainId]/messages`, después de `flagAttention`, dentro de `after()`. El tope diario (`site_cap`) se avisa desde el mismo lugar, una vez por día por sitio (se comprueba si ya hubo un aviso `site_cap` hoy).
- **Cierre del episodio:** donde hoy se pone `needsAttention: false` (`takeOver` y `ownerReply` en `src/server/live.ts`). `flagAttention` devuelve si la sala ya estaba marcada y, si no, inicia el episodio.
- **Tenancy:** la ruta del widget ya resuelve el sitio por id público; el email va al dueño de ese sitio. Nada nuevo entra desde el navegador.
- **Privacidad:** el email contiene texto de la conversación, igual que el de leads contiene el email del visitante; el dueño es el responsable del tratamiento (ver `/privacidad`). A Sentry no va texto.
- **Riesgos:**
  - *Falsos positivos de la derivación* (spec 006, riesgos): cada falsa alarma ahora es un email. El tope de 20 por día y el toggle por sitio acotan el daño; se mide en la beta.
  - *Fallo del proveedor de email:* se registra en Sentry y no se reintenta; el recordatorio del criterio 2 da una segunda oportunidad. El email del dueño ya no depende de Clerk.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1, 2, 3, 4, 5, 6 | Unitario de la decisión (`notify` / `remind` / `skip` y por qué) | `src/domain/attention-notice.test.ts` |
| 7, 8, 9, 10 | Unitario del email (contenido, escape, `replyTo`, asunto en una línea) | `src/domain/attention-notice.test.ts` |
| 1, 2, 4, 5, 11, 13, 14 | Integración con base y `EmailSender` falso: marca, avisa una vez, recuerda a los 30 min, cierra el episodio, tope por día, error del proveedor | `src/server/owner-notices.int.test.ts` |
| 6 | Integración de la configuración y aislamiento de tenants | `src/actions/tenant-isolation.int.test.ts`, `src/actions/leads/leads.int.test.ts` |
| 13 (email del dueño) | Integración: se guarda y se refresca al entrar | `src/server/users.int.test.ts` |
| 1, 4, 12 | E2E del widget con `EMAIL_PROVIDER=log`: la derivación y el tope dejan la sala notificada y la respuesta llega igual | `e2e/widget.spec.ts` |
