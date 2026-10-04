# 007 — Observabilidad: errores, costo de IA y métricas

- **Estado:** Borrador
- **ADRs relacionados:** [0001 — Estrategia de modelos de IA](../adr/0001-estrategia-de-modelos-de-ia.md), [0003 — Arquitectura y límites del widget](../adr/0003-arquitectura-del-widget.md), [0008 — Errores con Sentry y uso de IA en Postgres](../adr/0008-errores-y-metricas.md)

## Problema

La beta está casi lista para recibir usuarios, pero si algo se rompe en producción nadie se entera hasta que un cliente se queja. Tampoco sabemos cuánto cuesta cada cliente en IA, y nada impide que un sitio gaste mucho más de lo que justifica. El dueño, por su parte, abre el dashboard y no ve nada sobre los resultados de su bot.

## Historias de usuario

- Como **operador de BrAInance**, quiero enterarme de los errores de producción con contexto suficiente para arreglarlos, sin exponer las conversaciones de los clientes.
- Como **operador**, quiero ver cuánto gasta cada sitio en IA, cuánto tarda el modelo y cuántas veces falla, y que un sitio no pueda pasar un tope de gasto diario.
- Como **dueño del negocio**, quiero ver en el dashboard cuántas conversaciones y leads trajo mi bot y cuántas conversaciones necesitaron atención.

## Criterios de aceptación

### Errores (Sentry)

1. **Dado** `SENTRY_DSN` configurado, **cuando** ocurre un error no manejado en el servidor, en el navegador del panel o en el widget, **entonces** llega a Sentry con la ruta, el entorno y la versión desplegada.
2. **Dado** un error manejado que hoy solo se registra en la consola (falla del modelo, del email, del push o de un guardado), **entonces** también llega a Sentry como error o advertencia, con etiquetas (`area`: `widget`, `email`, `realtime`, `ai`) y el id del sitio cuando corresponde.
3. **Dado** cualquier evento enviado a Sentry, **entonces** no incluye el texto de los mensajes, emails, respuestas de calificación ni el cuerpo de los pedidos.
4. **Dado** que no hay `SENTRY_DSN` (desarrollo, E2E), **entonces** todo funciona igual y los errores van a la consola.

### Uso de IA

5. **Dado** una respuesta del bot en el widget, **cuando** termina (bien o con error), **entonces** queda registrada una llamada con sitio, conversación, modelo pedido y servido, tokens, costo estimado, latencia y motivo de fin o error.
6. **Dado** un modelo sin precio en `model-prices.ts`, **entonces** la llamada se registra con costo vacío y se avisa a Sentry una vez por modelo y proceso.
7. **Dado** un error al guardar el registro, **entonces** la respuesta al visitante no se ve afectada.

### Tope de costo por sitio

8. **Dado** un sitio que gastó el 80% del tope diario de IA (por defecto USD 2, configurable con `AI_SITE_DAILY_COST_USD`) en las últimas 24 horas, **entonces** se envía una advertencia a Sentry una vez por sitio y por día.
9. **Dado** un sitio que alcanzó el tope diario de costo, **cuando** llega otro mensaje, **entonces** no se llama al modelo y el bot responde como con el tope de mensajes (deriva al contacto), y la conversación queda marcada como **Necesita atención** (motivo `site_cap`).
10. **Dado** una conversación atendida por una persona (spec 006), **entonces** el tope de costo no la afecta, porque no usa el modelo.

### Dashboard del dueño

11. **Dado** un dueño que completó el onboarding, **cuando** entra al dashboard, **entonces** ve, para los últimos 7 o 30 días (a elección) y para todos sus sitios o uno:
    - conversaciones;
    - leads;
    - tasa de captura (leads sobre conversaciones con al menos una respuesta);
    - conversaciones que necesitaron atención;
    - una serie diaria de conversaciones y leads.
12. **Dado** un período sin datos, **entonces** cada número muestra 0 y la serie lo indica en texto, sin un gráfico vacío.
13. **Dado** otro dueño, **entonces** las métricas nunca incluyen datos de sitios ajenos.

### Administración interna

14. **Dado** un usuario cuyo id de Clerk está en `ADMIN_CLERK_IDS`, **cuando** entra a `/admin`, **entonces** ve, para los últimos 1, 7 o 30 días:
    - costo total de IA y por sitio (con dueño y dominio);
    - cantidad de respuestas;
    - latencia p50 y p95;
    - tasa de error del modelo;
    - los sitios que superaron el 80% del tope diario.
15. **Dado** un usuario que no está en `ADMIN_CLERK_IDS`, **cuando** entra a `/admin`, **entonces** recibe 404, sin pistas de que la página existe.

## Fuera de alcance

- Trazas de rendimiento (APM) y session replay de Sentry: se pueden activar más adelante con un cambio de configuración.
- Logs estructurados en un proveedor de logs.
- Facturación o topes por plan: el tope de costo es uno solo para todos los sitios en la beta.
- Métricas para el dueño sobre el costo de IA (es información interna).
- Purga automática de `ModelCall`.

## Notas técnicas

**Datos**
- Modelo `ModelCall`: `domainId`, `chatRoomId?`, `purpose` (`"answer"`), `requestedModel`, `servedModel?`, `inputTokens`, `outputTokens`, `cacheReadTokens`, `cacheWriteTokens`, `costUsd Decimal?`, `latencyMs`, `finishReason?`, `error?`, `createdAt`. Índices en `(domainId, createdAt)` y `(createdAt)`.
- El dashboard se calcula sobre lo que ya existe (`ChatRoom`, `ChatMessage`, `Customer.leadAt`, `ChatRoom.needsAttention`), con consultas agregadas por día en la zona horaria de Argentina.

**Dominio (`src/domain/`)**
- `model-prices.ts`: precios por millón de tokens (entrada, salida, cache de lectura y escritura) por id del gateway, con fecha de verificación. `estimateCost(model, usage)` devuelve el costo o null.
- `cost-cap.ts`: `checkCostCap({ spentUsd, capUsd })` devuelve `ok`, `warn` (80%) o `blocked`.
- `metrics.ts`: tasa de captura, llenado de días sin datos y percentiles.

**Adaptadores**
- `src/server/observability.ts`: `captureError(error, context)` y `captureWarning(message, context)`, con Sentry si hay DSN y consola si no. Reemplaza los `console.error` de los caminos de producción.
- `src/server/ai/usage.ts`: `recordModelCall(db, call)` y `siteSpendSince(db, domainId, since)`.
- `streamAnswer` expone el uso al terminar (tokens, modelo servido, latencia) y el error si falla, para que el endpoint lo registre.

**Rutas**
- El dashboard (`/dashboard`) suma las métricas debajo del onboarding (o en su lugar si está completo). Acciones `onGetOwnerMetrics({ siteId?, days })` sobre `tenancy.ts`, con su caso en `tenant-isolation.int.test.ts`.
- `/admin` (Server Component): `isAdmin()` lee `ADMIN_CLERK_IDS` y, si no corresponde, `notFound()`. Las consultas de administración viven en `src/server/admin-metrics.ts` y nunca se exponen como server actions.
- Los gráficos usan componentes propios con SVG y los tokens del ADR 0005, sin librería de gráficos nueva.

**IA**
- El prompt no cambia. Cambia solo el registro y el tope, así que no hace falta correr el eval.

## Riesgos y preguntas abiertas

- **Precios desactualizados:** el costo es una estimación. Se compara una vez por mes con la factura del AI Gateway (ADR 0008).
- **Tope de USD 2 por día:** es una primera estimación (unos 300 mensajes de Haiku con una base de conocimiento de 50 preguntas frecuentes) y se ajusta con los datos reales de `ModelCall`.
- **Sentry en el widget:** el widget corre en sitios de terceros. Se carga en el iframe (nuestro origen), nunca en la página del cliente.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 5, 6 | Unitario: costo estimado por modelo, cache y modelo sin precio | `src/domain/model-prices.test.ts` |
| 8, 9 | Unitario: umbrales del tope de costo | `src/domain/cost-cap.test.ts` |
| 11, 12, 14 | Unitario: tasa de captura, días vacíos y percentiles | `src/domain/metrics.test.ts` |
| 3, 4 | Unitario: `beforeSend` borra los datos personales; sin DSN va a la consola | `src/server/observability.test.ts` |
| 5, 7 | Unitario: `streamAnswer` reporta uso y error con un modelo simulado | `src/server/ai/answer.test.ts` |
| 5, 8, 9, 10 | Integración (Postgres): registro de llamadas, gasto por sitio y corte por costo | `src/server/ai/usage.int.test.ts` |
| 11, 13 | Integración: métricas del dueño y aislamiento entre tenants | `src/actions/metrics/metrics.int.test.ts`, `src/actions/tenant-isolation.int.test.ts` |
| 14, 15 | Integración: métricas de administración y acceso solo para ids admin | `src/server/admin-metrics.int.test.ts`, test de la página |
| 9 | E2E del widget: con el gasto del día sembrado al tope, el bot deriva al contacto sin llamar al modelo | `e2e/widget.spec.ts` |
| 11 | E2E (requiere Clerk): el dashboard muestra conversaciones y leads sembrados | `e2e/dashboard.spec.ts` |
