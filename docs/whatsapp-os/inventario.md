# Inventario: qué sirve de la beta web

Qué se reutiliza en la línea `whatsapp-os` y qué hay que construir. Es un mapa para planificar las specs, no un plan de borrado: todo lo que no se usa queda en `develop`.

## Se reutiliza igual

| Pieza | Dónde está | Para qué sirve acá |
|---|---|---|
| Aislamiento por cliente | `src/server/tenancy.ts`, `src/actions/tenant-isolation.int.test.ts`, [ADR 0004](../adr/0004-aislamiento-multi-tenant.md) | Cada taller ve solo lo suyo. Cambia el dueño del dato: deja de ser el dominio y pasa a ser el taller |
| Login y panel | Clerk, `src/proxy.ts`, `src/app/(site)`, `src/components/sidebar` | El panel del taller |
| Capa de IA, costos y topes | `src/server/ai`, `src/domain/cost-cap.ts`, `src/domain/model-prices.ts`, `src/domain/answer-cap.ts`, modelo `ModelCall` | Lo mismo, con topes por taller |
| Tiempo real | `src/server/realtime`, [ADR 0007](../adr/0007-tiempo-real-hibrido.md) | El panel se actualiza cuando entra algo por WhatsApp |
| Errores y métricas | Sentry, `src/lib/sentry-scrub.ts`, [ADR 0008](../adr/0008-errores-y-metricas.md) | Igual. El filtrado de datos personales importa más, porque acá hay teléfonos y patentes de terceros |
| Email | `src/server/email`, [ADR 0006](../adr/0006-proveedor-de-email.md) | Canal secundario para avisos y reportes |

## Se reutiliza el método, no el contenido

| Pieza | Dónde está | Qué cambia |
|---|---|---|
| Eval | `evals/rag-answers`, [ADR 0001](../adr/0001-estrategia-de-modelos-de-ia.md) | El método sigue: casos, juez, umbrales y publicación. Los casos pasan a ser "¿cargó bien lo que dijo el dueño?" y "¿contestó la consulta sin inventar?" |
| Reglas del prompt | `src/domain/answer-prompt.ts` | Siguen la regla de no inventar y el tono rioplatense. El prompt es otro: sacar datos de lo que cuenta el dueño y contestar con lo cargado |
| Métricas del panel | `src/domain/metrics.ts`, `src/components/metrics` | Se mantiene el patrón de lógica pura con tests. Las métricas son otras: autos en el taller, facturación, días por trabajo, clientes que vuelven |
| Exportar | `src/domain/leads-csv.ts` | Exportar los trabajos y los clientes a CSV o Excel |
| Derivación y avisos | `src/domain/attention.ts`, `src/server/owner-notices.ts`, `src/server/live.ts`, specs 010 y 012 | Para el canal de clientes (después). Cuando llegue, el aviso al dueño va por WhatsApp |
| Conversaciones | Modelos `ChatRoom`, `ChatMessage` y `Customer`; `src/server/conversations.ts` | El patrón sirve para guardar lo que el dueño le manda al sistema |

## No se usa en la primera etapa (queda en `develop`)

- Widget web y su seguridad: `src/app/(widget)`, `src/domain/widget-*.ts`, `src/domain/snippet.ts`, `src/domain/ip-limits.ts` ([ADR 0003](../adr/0003-arquitectura-del-widget.md) y [ADR 0009](../adr/0009-limites-por-ip-del-widget.md)).
- Dominios, ícono del sitio, preguntas de calificación y leads del widget.
- La portada y `/como-medimos`: hablan de la beta web y se rehacen cuando haya pruebas de esta línea.
- Términos y privacidad: hay que rehacerlos, porque acá se tratan datos de los clientes del taller y se usa WhatsApp.

## Hay que construir

| Pieza | Notas |
|---|---|
| Adaptador de WhatsApp | Webhook con verificación de firma, envío de mensajes, plantillas para el resumen de la mañana y descarga de audios y fotos. Hace falta un ADR para elegir entre la Cloud API directa y un BSP |
| Transcripción de audios | Rioplatense y jerga de taller: homocinética, tren delantero, patentes. Va en el mismo ADR o en otro |
| Modelo del taller | Taller, cliente, vehículo (con patente), trabajo u orden, presupuesto, estado, cobro y próximo service. Cada registro guarda el mensaje del que salió |
| Carga con confirmación | La IA propone el registro con herramientas acotadas, el sistema confirma ("Anotado: …") y el dueño corrige en una línea. Sin SQL libre |
| Consultas | Herramientas de solo lectura ("autos para entregar hoy", "facturación del mes", "historial de una patente"). Lo que no está cargado se dice, no se inventa |
| Resumen diario | Tarea programada (Vercel Cron) que manda una plantilla de utilidad de WhatsApp |
| Base de datos separada | Rama propia de Neon y variables propias en Vercel desde la primera migración ([ADR 0100](../adr/0100-linea-whatsapp-para-talleres.md)) |
