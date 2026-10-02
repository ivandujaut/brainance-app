# 005 — Captura de leads

- **Estado:** Borrador
- **ADRs relacionados:** [0003 — Arquitectura y límites del widget](../adr/0003-arquitectura-del-widget.md), [0004 — Aislamiento multi-tenant](../adr/0004-aislamiento-multi-tenant.md), [0006 — Proveedor de email](../adr/0006-proveedor-de-email.md)

## Problema

El bot responde consultas, pero cuando el visitante cierra el chat el negocio no sabe quién era ni cómo volver a contactarlo. La promesa de la beta es "pongo un bot en mi web y me trae leads": hoy no trae ninguno. Las preguntas de calificación se cargan en la configuración (spec 004), pero nadie las responde.

## Historias de usuario

- Como **dueño del negocio**, quiero que el chat le pida el email a los visitantes interesados, junto con mis preguntas de calificación, para poder contactarlos después.
- Como **dueño**, quiero enterarme por email cuando llega un lead, para responder rápido sin tener que entrar al panel.
- Como **dueño**, quiero ver, exportar y borrar los leads de mis sitios.
- Como **visitante**, quiero recibir una respuesta antes de que me pidan datos, poder no dejarlos y saber para qué se usan.

## Criterios de aceptación

### En el widget

1. **Dado** un sitio con la captura activada, **cuando** el visitante recibe la primera respuesta del bot, **entonces** aparece en el chat una tarjeta para dejar sus datos: email (obligatorio) y las preguntas de calificación del sitio (opcionales). Antes de esa respuesta no aparece.
2. **Dado** la tarjeta, **entonces** muestra un aviso de uso de datos: "Al enviar, aceptás que <negocio> use estos datos para responder tu consulta." El visitante puede cerrarla con "Ahora no" y seguir conversando.
3. **Dado** un visitante que cerró la tarjeta, **cuando** sigue conversando o recarga la página, **entonces** la tarjeta no vuelve a aparecer sola, pero puede abrirla con el botón "Dejar mis datos".
4. **Dado** un email inválido o una respuesta de más de 300 caracteres, **entonces** no se envía y la tarjeta muestra el error en español.
5. **Dado** un envío válido, **entonces** el chat confirma ("¡Gracias! <negocio> te va a contactar a <email>") y la tarjeta no vuelve a aparecer para ese visitante, tampoco al recargar.
6. **Dado** un visitante que ya dejó sus datos, **cuando** los envía de nuevo con otro email o con otras respuestas (desde "Dejar mis datos"), **entonces** se actualizan y no se crea un lead duplicado.
7. **Dado** un sitio con la captura desactivada, **entonces** la tarjeta y el botón no aparecen.

### Para el dueño

8. **Dado** un lead nuevo, **entonces** el dueño recibe un email con el sitio, el email del visitante, sus respuestas y un link al listado de leads. Responder ese email le escribe directamente al visitante.
9. **Dado** un visitante que actualiza sus datos, **entonces** no se manda otro email.
10. **Dado** un sitio que ya recibió 50 leads en las últimas 24 horas, **cuando** llega otro, **entonces** el lead se guarda, pero no se manda email (protege al dueño de una avalancha de spam).
11. **Dado** un error del proveedor de email, **entonces** el lead queda guardado igual y el visitante ve la confirmación.
12. **Dado** la sección **Leads** del panel, **cuando** el dueño entra, **entonces** ve los leads de todos sus sitios, del más nuevo al más viejo, con email, sitio, fecha y respuestas, y puede filtrar por sitio.
13. **Dado** el listado, **cuando** el dueño exporta, **entonces** descarga un CSV con las mismas columnas, que se abre bien en Excel y Google Sheets (UTF-8, tildes correctas) y no ejecuta fórmulas aunque una respuesta empiece con `=`.
14. **Dado** un lead, **cuando** el dueño lo borra (con confirmación), **entonces** se eliminan su email y sus respuestas. La conversación se conserva sin datos personales.
15. **Dado** la configuración del bot (spec 004), **entonces** el dueño puede activar o desactivar la captura y el aviso por email, por sitio. Ambos vienen activados.

### Seguridad

16. **Dado** otro dueño que conoce el id de un lead o de un sitio ajeno, **cuando** llama a las acciones de leads (listar, exportar, borrar), **entonces** no lee ni borra nada.
17. **Dado** un pedido al endpoint de leads sin un `visitorId` válido o con un id de pregunta que no es del sitio, **entonces** se rechaza sin guardar nada.
18. **Dado** un visitante que envía sus datos más de 5 veces en 10 minutos, **entonces** se rechazan los envíos siguientes con un mensaje para que espere.

## Fuera de alcance

- Que el bot detecte intención de compra para pedir los datos, o que extraiga datos de la conversación con IA.
- Pedir teléfono, nombre u otros campos fijos además del email: el dueño los suma como preguntas de calificación.
- Ver la conversación completa de cada lead: llega con la bandeja de conversaciones (ítem 8). El modelo de datos ya los relaciona.
- Integraciones con CRMs, webhooks o resúmenes diarios por email.
- Verificar el email del visitante (doble opt-in).

## Notas técnicas

**Datos**
- Un lead es un `Customer` (visitante) con email. `Customer` suma `leadAt DateTime?` (primer envío) y `consentAt DateTime?` (último envío con el aviso visible). El índice en `(domainId, leadAt)` sirve para el listado y para el tope diario.
- Las respuestas se guardan en `CustomerResponses` con el texto de la pregunta (`question`) y la respuesta (`answered`). Copiar el texto evita que la respuesta cambie de sentido si el dueño edita o borra la pregunta después.
- Tabla nueva `LeadSubmission` (`customerId`, `createdAt`, `notified`): un registro por envío. Sirve para el límite por visitante (criterio 18) y para el tope de emails por sitio (criterio 10, cuenta los `notified` de las últimas 24 horas), igual que los límites del widget se cuentan en la base (spec 003).
- `ChatBot` suma `leadCapture Boolean @default(true)` y `leadEmail Boolean @default(true)`.
- Borrar un lead (criterio 14) pone `email`, `leadAt` y `consentAt` en null y borra sus `CustomerResponses`.

**Widget**
- `GET /api/widget/[domainId]/config` suma `leadCapture` y las preguntas de calificación (`[{ id, question }]`). Son públicas: el visitante igual las ve en la tarjeta.
- `GET …/conversation` suma `leadCaptured: boolean`, para no volver a mostrar la tarjeta (criterio 5).
- `POST /api/widget/[domainId]/lead` con `{ visitorId, email, answers: [{ questionId, answer }] }`. Valida con zod (email y largo), verifica que cada `questionId` sea del sitio, aplica el límite por visitante (contando `LeadSubmission`) y guarda en una transacción. Si es el primer envío y corresponde, programa el email con `after()`.
- "Ahora no" se recuerda en el `localStorage` del iframe, junto al `visitorId`.

**Email** (ver ADR 0006)
- Interfaz `EmailSender` en `src/server/email/`, con un adaptador de Resend (`RESEND_API_KEY`, `EMAIL_FROM`) y uno que solo registra en consola para desarrollo y E2E (`EMAIL_PROVIDER=log`).
- El email del dueño se lee de Clerk (`users.getUser(clerkId)`, email principal) al momento de enviar.
- El cuerpo se arma en `src/domain/lead-email.ts` (función pura testeada): texto plano más HTML con todo el contenido del visitante escapado. `Reply-To` es el email del visitante, ya validado.

**Panel**
- Ruta `/leads` (Server Component), en el menú lateral. Usa solo tokens del design system (ADR 0005).
- Acciones `onListLeads(siteId?)`, `onExportLeads(siteId?)` y `onDeleteLead(customerId)`. Se resuelven con `tenancy.ts` (suma `findOwnedLead`) y tienen su caso en `tenant-isolation.int.test.ts`.
- `src/domain/leads-csv.ts`: arma el CSV con BOM UTF-8, separador `,`, comillas escapadas y neutraliza celdas que empiezan con `=`, `+`, `-`, `@`, tabulación o retorno de carro (inyección de fórmulas).

**IA**
- El prompt no cambia: la tarjeta es parte de la interfaz, no de la respuesta del modelo. No hace falta correr el eval.

## Riesgos y preguntas abiertas

- **Dominio de envío:** Resend exige verificar un dominio propio (registros SPF y DKIM) para mandar a cualquier destinatario. Hasta que esté, los emails solo llegan a la cuenta dueña de Resend. Es una tarea manual previa al deploy.
- **Ley 25.326 (protección de datos personales):** el dueño es el responsable de los datos; BrAInance los trata por cuenta del dueño. El aviso de la tarjeta, el registro del consentimiento y el borrado cubren lo básico para la beta. Los términos y la política de privacidad del producto quedan como pendiente antes de abrir la beta.
- **Tope de 50 emails por día y por sitio:** si un negocio real lo supera, se agrega un resumen diario en lugar de cortar.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 4, 17 | Unitario: validación del envío (email, largos, respuestas) | `src/domain/leads.test.ts` |
| 10, 18 | Unitario: límites de envíos por visitante y de emails por sitio | `src/domain/leads.test.ts` |
| 13 | Unitario: CSV con BOM, comillas y neutralización de fórmulas | `src/domain/leads-csv.test.ts` |
| 8 | Unitario: contenido del email, escapado y `Reply-To` | `src/domain/lead-email.test.ts` |
| 5, 6, 9, 10, 11, 17, 18 | Integración (Postgres): guardar, actualizar sin duplicar, email solo en el primer envío, tope diario y error del proveedor | `src/server/leads.int.test.ts` |
| 12, 14, 15, 16 | Integración: acciones de leads como dueño y como otro tenant | `src/actions/tenant-isolation.int.test.ts`, `src/actions/leads/leads.int.test.ts` |
| 1, 2, 3, 5, 7 | E2E: la tarjeta aparece tras la primera respuesta, "Ahora no" la oculta, el envío confirma y persiste al recargar; con la captura desactivada no aparece | `e2e/widget-leads.spec.ts` |
| 12, 13, 14 | E2E (requiere Clerk): listado, exportación y borrado | `e2e/leads.spec.ts` |
