# 015 — Límite por IP en el widget

- **Estado:** Implementada
- **ADRs relacionados:** [0003 — Arquitectura del widget](../adr/0003-arquitectura-del-widget.md), [0009 — Límites por IP del widget](../adr/0009-limites-por-ip-del-widget.md)
- **Specs relacionadas:** [003 — Widget embebible](003-widget-embebible.md), [005 — Captura de leads](005-captura-de-leads.md), [011 — Tope visible](011-tope-visible-y-metricas-de-honestidad.md), [014 — Respuesta cuando el modelo falla](014-respuesta-cuando-el-modelo-falla.md)
- **Posicionamiento:** protege dos promesas. Una es "Ningún cliente sin respuesta": un abusador no puede agotar el tope y dejar a los clientes reales con la respuesta fija. La otra es "el precio previsible": un sitio abusado no agota el gasto de todos.

## Problema

Los endpoints públicos del widget (`POST /api/widget/[domainId]/messages` y `/lead`) solo se limitan por visitante y por sitio. El visitante se identifica con un `visitorId` que genera su propio navegador, así que un script lo cambia en cada mensaje y nunca toca el límite de 20 mensajes cada 10 minutos.

Con un solo equipo y el `domainId` público del snippet, cualquiera puede:

- **Agotar el tope diario del sitio.** Los clientes reales reciben "En este momento no puedo responder más consultas" y el dueño recibe el email del tope.
- **Gastar el tope de costo.** El tope de gasto del AI Gateway es compartido, así que puede cortar el bot de todos los sitios.
- **Llenar la base de visitantes y conversaciones vacías,** uno por cada `visitorId` inventado.
- **Mandar leads en masa.** El email al dueño ya tiene tope por día, pero los leads quedan en el panel.

## Historias de usuario

- Como **dueño del negocio**, quiero que una sola persona o un script no pueda agotar el tope de mi bot, para que mis clientes reales sigan recibiendo respuesta.
- Como **visitante**, quiero poder conversar con normalidad aunque comparta la conexión con otra gente (la red del celular, el wifi de un bar).
- Como **operador**, quiero ver qué sitios están recibiendo pedidos frenados, para saber si hay un abuso en curso.

## Criterios de aceptación

Cada criterio se convierte en al menos un test. Todos los límites son **por IP y por sitio**, y se cuentan en ventanas deslizantes.

### Mensajes

1. **Dado** una IP que mandó **40 mensajes** al mismo sitio en los últimos **10 minutos**, **cuando** manda otro, **entonces** recibe un 429 con "Se enviaron muchos mensajes desde tu conexión. Esperá unos minutos y volvé a intentar." El mensaje no se guarda, no se llama al modelo y no cuenta para el tope del sitio.
2. **Dado** una IP que mandó **100 mensajes** al mismo sitio en las últimas **24 horas**, **cuando** manda otro, **entonces** recibe un 429 con "Desde tu conexión se enviaron muchos mensajes hoy. Podés comunicarte con el negocio por {contacto}.", según el trato del sitio. No se guarda nada ni se marca la conversación. Una sola IP nunca puede agotar el tope de la beta, que es de 300.
3. **Dado** una IP que ya creó **10 visitantes nuevos** en el mismo sitio en la última **hora**, **cuando** llega un mensaje con otro `visitorId` nuevo, **entonces** recibe el 429 del criterio 1 y **no** se crean ni el `Customer` ni la conversación. Los visitantes que ya existían siguen conversando.
4. **Dado** una IP frenada en un sitio, **entonces** puede seguir usando el chat de **otro** sitio: los límites son por sitio.
5. **Dado** una conversación que atiende una persona (spec 006), **entonces** los mensajes del visitante igual cuentan para el límite por IP: el límite protege la base, no solo el modelo.

### Leads

6. **Dado** una IP que envió **10 formularios de contacto** al mismo sitio en la última **hora**, **cuando** envía otro, **entonces** recibe un 429 con "Se enviaron muchos datos desde tu conexión. Esperá un rato y volvé a intentar." No se guarda nada.

### La huella de la IP

7. **Dado** cualquier pedido limitado, **entonces** lo que se guarda es un HMAC-SHA256 de la IP con `RATE_LIMIT_SECRET`, nunca la IP. Para IPv6 se usa el prefijo /64.
8. **Dado** un pedido sin IP (desarrollo local, sin `x-forwarded-for`), **entonces** no se aplica el límite por IP. Siguen los límites por visitante y por sitio.
9. **Dado** producción sin `RATE_LIMIT_SECRET`, **entonces** el chat sigue funcionando sin límite por IP, y el error va a Sentry una vez por instancia. El límite falla abierto: es mejor un sitio expuesto que un chat caído. Fuera de producción se usa un secreto fijo de desarrollo.
10. **Dado** las huellas guardadas, **entonces** un cron diario borra las de más de 24 horas. Ninguna queda más de unas 48 horas.

### Operador

11. **Dado** un pedido frenado, **entonces** queda registrado. `/admin` muestra cuántos pedidos se frenaron por sitio en el período, al lado de las respuestas de respaldo.
12. **Dado** el primer pedido frenado de un sitio en el día, **entonces** se manda un aviso (no un error) a Sentry con el sitio y el tipo de límite, sin la IP ni su huella.

### Lo que no cambia

13. **Dado** un visitante normal, **entonces** el límite por IP no cambia su experiencia: el polling de la conversación (`GET /conversation`) y la configuración (`GET /config`) no cuentan.
14. **Dado** los límites por visitante (20 cada 10 minutos) y por sitio (tope diario, tope de costo), **entonces** siguen igual y se aplican después del límite por IP.

## Fuera de alcance

- **Verificar el `Origin` o el `Referer`.** Un script los falsifica sin esfuerzo, así que no protegen. Ya se usa `Origin` para marcar "Instalado".
- **Vercel BotID o un captcha** en el chat. El widget corre en un iframe en sitios ajenos, y el desafío agrega fricción y riesgo. Se evalúa si estos límites no alcanzan (ADR 0009).
- **Que el dueño configure los límites.** Son límites de abuso, no de uso; el dueño ya tiene su tope diario (spec 011).
- **Bloquear IP a mano o hacer listas negras.** Queda para cuando haya un caso real.
- **Purgar `ModelCall` a los 180 días** (ADR 0008). Puede usar el mismo cron, pero va en otro PR.

## Notas técnicas

- **Dominio** (`src/domain/ip-limits.ts`):
  - `IP_LIMITS` con los números de los criterios.
  - `checkMessageIpLimits(counts)` y `checkLeadIpLimits(counts)` devuelven `{ ok: true }` o `{ ok: false, reason: "ip_burst" | "ip_daily" | "ip_new_visitors" | "ip_leads" }`. El límite diario se revisa antes que la ráfaga, porque su respuesta da el contacto.
  - `ipKey(ip)` normaliza: recorta IPv4 y lleva IPv6 a /64. Es puro, con tests.
- **Servidor** (`src/server/ip-limits.ts`):
  - `clientIp(request)` toma el primer valor de `x-forwarded-for`.
  - `ipFingerprint(ip, secret)` es el HMAC con `node:crypto`.
  - `admitMessage(...)` y `admitLead(...)` cuentan en `RateLimitHit` y, si el pedido pasa, lo registran.
  - `purgeRateLimitHits(...)` borra lo de más de 24 horas.
  - `recordIpBlock(...)` registra el pedido frenado y manda el aviso del criterio 12 (deduplicado en memoria por sitio y día, como los avisos de costo).
- **Datos (migración `rate_limit_hits`):** `RateLimitHit { id, createdAt, fingerprint, domainId, kind, reason }`, con `kind` en `message | new_visitor | lead | blocked` y `reason` solo para los frenados. Índices: `(fingerprint, domainId, kind, createdAt)` para los conteos, `(domainId, kind, createdAt)` para `/admin` y `(createdAt)` para la purga. Sin relación con `Domain`, para no frenar borrados en cascada; un sitio borrado deja huellas huérfanas que la purga borra al día siguiente.
- **Ruta de mensajes:** el chequeo por IP va **antes** de `getOrCreateRoom`. Para saber si el visitante es nuevo, se consulta si existe el `Customer` (`domainId`, `visitorId`) antes de crearlo. Si el pedido pasa, registra `message` y, si corresponde, `new_visitor`.
- **Ruta de leads:** chequeo antes de `saveLead`; si pasa, registra `lead`.
- **Respuesta 429:** usa el mismo formato que los rechazos actuales (`{ error, message }`), así que el widget la muestra sin cambios: ya muestra `message` y le devuelve el texto al visitante.
- **Cron** (`/api/cron/purge-rate-limits`):
  - Se declara en `vercel.json` (`crons`, una vez por día; Hobby admite cron diario).
  - Se autentica con `CRON_SECRET`, que Vercel manda como `Authorization: Bearer`.
  - Va en `src/proxy.ts` como ruta sin Clerk.
- **Variables nuevas** en `.env.example`: `RATE_LIMIT_SECRET` (secreto, al menos 32 bytes aleatorios) y `CRON_SECRET`.
- **Regla de WAF:** paso manual nuevo en `docs/lanzamiento.md`. Una regla para `POST` a `^/api/widget/[^/]+/(messages|lead)$`, de 30 pedidos por 60 s por IP, con respuesta 429.
- **Privacidad:** `src/content/legal/privacidad.md` suma, en "Datos de los visitantes" y en "Cuánto tiempo guardamos", que se guarda una huella irreversible de la IP por hasta 48 horas para prevenir abusos. Ver la decisión 3.
- **E2E:** el E2E manda `x-forwarded-for` con `page.setExtraHTTPHeaders` y siembra huellas con el mismo `RATE_LIMIT_SECRET`, que la CI define solo para el job de E2E. Sin esa variable, la prueba se saltea.
- **Riesgos:**
  - *CGNAT:* muchos clientes reales detrás de una IP. Se mitiga con números holgados y la métrica de frenados en `/admin`; si aparecen falsos positivos, se suben.
  - *Muchas IP (botnet, proxies rotativos):* estos límites no lo frenan. Siguen el tope del sitio, el tope de costo y la regla de WAF.
  - *Costo en la base:* una inserción y hasta tres conteos indexados por mensaje.

## Decisiones para confirmar en la revisión

1. **Los números:**
   - 40 mensajes cada 10 minutos y 100 por día, por IP y sitio;
   - 10 visitantes nuevos por hora;
   - 10 formularios de contacto por hora.
2. **Falla abierta** sin `RATE_LIMIT_SECRET` en producción (criterio 9), en vez de cortar el chat.
3. **Política de privacidad sin subir `TERMS_VERSION`:** el cambio es sobre datos de visitantes, es aditivo y la política ya nombra la "prevención de abusos". Subir la versión le pide a todos los dueños que acepten de nuevo.
4. **El cron diario en `vercel.json`:** es la primera tarea programada del proyecto.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1, 2, 3, 6 | Unitario de la decisión y los umbrales | `src/domain/ip-limits.test.ts` |
| 7 | Unitario de `ipKey` (IPv4, IPv6 a /64, valores raros) y del HMAC | `src/domain/ip-limits.test.ts`, `src/server/ip-limits.test.ts` |
| 8, 9 | Unitario de `clientIp` y del secreto según el entorno | `src/server/ip-limits.test.ts` |
| 1, 2, 3, 4, 5, 13, 14 | Integración de la ruta de mensajes con `x-forwarded-for`: frena, no guarda, no crea visitantes, separa sitios | `src/app/api/widget/[domainId]/messages/route.int.test.ts` |
| 6 | Integración de la ruta de leads | `src/app/api/widget/[domainId]/lead/route.int.test.ts` |
| 10 | Integración del cron: borra lo viejo, pide `CRON_SECRET` | `src/app/api/cron/purge-rate-limits/route.int.test.ts` |
| 11 | Integración de `/admin` y render de la página | `src/server/admin-metrics.int.test.ts`, `src/app/(site)/(dashboard)/admin/page.test.tsx` |
| 12 | Unitario del aviso deduplicado | `src/server/ip-limits.test.ts` |
| 1, 3 | E2E: desde una IP, el visitante que supera el límite ve el mensaje y no se crean conversaciones de más | `e2e/widget.spec.ts` |
