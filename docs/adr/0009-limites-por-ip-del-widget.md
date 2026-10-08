# 0009 — Límites por IP en los endpoints públicos del widget

- **Estado:** Propuesto
- **Fecha:** 2026-10-08

## Contexto

El ADR 0003 limitó el widget con conteos en Postgres: 20 mensajes por visitante cada 10 minutos y un tope diario por sitio. Dejó escrito que, si alguien agotaba el cupo de un sitio, se agregaría un límite por IP o un servicio dedicado. El análisis del producto (2026-10-08) mostró que el riesgo ya es concreto:

- **El límite por visitante no protege.** El `visitorId` lo genera el navegador; un script lo cambia en cada mensaje y nunca llega a 20.
- **Cualquiera puede llamar a los endpoints.** El `domainId` es público, porque va en el snippet, y `/messages` y `/lead` no verifican de dónde vienen. Verificar `Origin` no sirve contra un script, que manda el encabezado que quiera.
- **El daño no es solo de costo.** Un abusador agota el tope diario del sitio y los clientes reales reciben la respuesta fija del tope. El dueño recibe el email de "llegó al tope", y la base se llena de `Customer` y `ChatRoom` vacíos, uno por `visitorId` inventado.
- **Un sitio puede dejar sin servicio a todos.** El tope de gasto del AI Gateway es uno para todos los sitios, así que un sitio abusado puede agotarlo y cortar el bot de todos (spec 014).

Restricciones:

- Plan Hobby de Vercel, con funciones en `gru1` y Neon en São Paulo. La beta tiene que funcionar sin proveedores nuevos, igual en desarrollo y en E2E.
- **La IP es un dato personal (Ley 25.326).** Si se guarda algo derivado de ella, tiene que ser lo mínimo y por poco tiempo.
- **En Argentina, muchas redes móviles usan CGNAT:** muchos clientes reales pueden compartir una IP. Los límites tienen que ser holgados para un negocio chico.

## Opciones consideradas

1. **Solo Vercel WAF (rate limiting).**
   - **A favor:** frena antes de llegar a la función, no consume base y se configura sin código.
   - **En contra:** en Hobby admite **una sola regla** de rate limit por proyecto, con ventana fija. No distingue sitios: la clave es la IP y la ruta, no el `domainId`. Además, la configuración vive en el panel y no en el repo, así que no se puede probar en CI.
2. **Upstash Redis (`@upstash/ratelimit`).**
   - **A favor:** ventanas deslizantes precisas, rápido y con plan gratuito.
   - **En contra:** suma un proveedor, claves y un camino de falla más. Para el volumen de la beta no hace falta.
3. **Conteos en Postgres, como el ADR 0003, con la IP como clave.**
   - **A favor:** no suma infraestructura, se prueba en integración y E2E como los límites actuales, y puede contar por sitio.
   - **En contra:** cada pedido suma una escritura y una lectura indexada. Además, hay que guardar una huella de la IP y purgarla.
4. **Vercel BotID (desafío invisible en el navegador).**
   - **A favor:** distingue bots de personas sin depender de la IP.
   - **En contra:** el chat corre en un iframe dentro de sitios ajenos, y no está probado que el desafío funcione bien ahí. Queda para después si los límites no alcanzan.

## Decisión

**Opción 3 como límite principal, con una regla de WAF (opción 1) como escudo grueso.**

- **Huella de la IP:** se guarda un HMAC-SHA256 de la IP con un secreto del servidor (`RATE_LIMIT_SECRET`), nunca la IP. En IPv6 se usa el prefijo /64, porque un atacante consigue muchas direcciones dentro de un mismo /64.
- **Tabla propia** (`RateLimitHit`): no se mezcla con las conversaciones. Guarda la huella, el sitio, el tipo de evento y la fecha. Se purga lo que tenga más de 24 horas con un cron diario de Vercel, así que nada queda más de unas 48 horas.
- **La IP sale de `x-forwarded-for`.** En Vercel ese encabezado lo pone la plataforma y el cliente no puede falsificarlo. Sin IP (desarrollo local) no se aplica el límite por IP.
- **Una regla de WAF en el panel:** `POST` a `/api/widget/*/messages` y `/lead`, 30 pedidos por minuto por IP, con respuesta 429. Es un paso manual en `docs/lanzamiento.md` y no reemplaza a la opción 3.
- **Sin cambiar `src/domain/widget-limits.ts`:** los límites nuevos son funciones puras al lado, y la interfaz permite cambiar a Redis más adelante sin tocar la ruta.

## Consecuencias

- **Lo que ya no puede hacer un abusador:** una sola IP no puede agotar el tope de un sitio, inventar visitantes sin límite ni mandar leads en masa. Para causar daño necesita muchas IP, y ahí la regla de WAF y el tope de costo siguen acotando.
- **CGNAT:** muchos clientes reales detrás de una misma IP podrían tocar el límite. Los números se eligen holgados para un negocio chico y se miden en `/admin`, con los pedidos frenados por sitio.
- **Más trabajo por pedido:** cada mensaje suma una inserción y dos conteos indexados en Neon.
- **Un secreto nuevo, `RATE_LIMIT_SECRET`, y un cron.** El cron es la primera tarea programada del proyecto; la purga de `ModelCall` (ADR 0008) puede sumarse después.
- **La política de privacidad** tiene que decir que se guarda una huella de la IP por hasta 48 horas para prevenir abusos.
