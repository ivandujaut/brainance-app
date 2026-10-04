# 0008 — Errores con Sentry y uso de IA en Postgres

- **Estado:** Propuesto
- **Fecha:** 2026-10-04

## Contexto

Antes de abrir la beta hace falta enterarse de los errores de producción y saber cuánto cuesta cada cliente. Hoy:

- los errores quedan en `console.error` dentro de los logs de Vercel (un día de retención en el plan gratuito), sin agrupación ni alertas;
- `streamAnswer` recibe los tokens de cada respuesta y los descarta, en contra de la regla de `docs/principles.md`: "cada llamada a un modelo registra tier, modelo, tokens, costo y latencia";
- el único freno al gasto es el tope de 300 mensajes por día y por sitio (ADR 0003), que no mira el costo real: una base de conocimiento grande o respuestas largas cuestan más por mensaje.

Son dos problemas distintos: **errores** (qué se rompió, dónde, con qué frecuencia) y **uso de IA** (cuánto cuesta y cuánto tarda cada llamada, por sitio).

## Opciones consideradas

**Errores**
1. **Solo logs de Vercel:** no suma nada, pero no alerta ni retiene.
2. **Axiom o Better Stack:** buenos para buscar logs y con integración en Vercel, pero la experiencia con errores (agrupación, stack traces con source maps, releases) es más pobre.
3. **Sentry:** SDK oficial para Next.js (servidor, cliente y edge), source maps, agrupación, alertas por email y releases. El plan gratuito incluye 5.000 errores por mes.

**Uso de IA**
1. **Langfuse o Helicone:** trazas, costos y análisis de prompts, pero suman un proveedor y mandan las conversaciones de los clientes a un tercero (datos personales; ver la spec 005).
2. **Solo las métricas del AI Gateway de Vercel:** muestran el gasto total, no por sitio ni por conversación, y no se pueden usar para cortar.
3. **Una tabla propia en Postgres:** una fila por llamada, sin contenido de las conversaciones. Se puede consultar, alimenta los topes y las pantallas y no suma proveedor.

## Decisión

**Sentry para errores y una tabla `ModelCall` en Postgres para el uso de IA.**

**Sentry**
- `@sentry/nextjs` con `instrumentation.ts` (servidor y edge) e `instrumentation-client.ts`, detrás de `src/server/observability.ts` (`captureError`, `captureWarning`), así el resto del código no importa Sentry.
- Se activa solo con `SENTRY_DSN` (el DSN no es secreto; `NEXT_PUBLIC_SENTRY_DSN` lo usa el navegador). Sin DSN, `captureError` hace `console.error`, como hoy.
- **Privacidad:**
  - `sendDefaultPii: false`;
  - un `beforeSend` borra el cuerpo de los pedidos y cualquier campo `text`, `message`, `email` o `answers`;
  - el texto de las conversaciones nunca va a Sentry.
- Source maps: se suben en el build de Vercel con `SENTRY_AUTH_TOKEN`, que es opcional.

**`ModelCall`**
- Columnas: sitio, conversación, propósito (`answer`), modelo pedido y servido, tokens (entrada, salida, cache de lectura y escritura), costo estimado en USD, latencia, motivo de fin, error y fecha.
- Los precios están en `src/domain/model-prices.ts`, por modelo, con la fecha en que se verificaron. Un modelo sin precio se registra con costo `null` y avisa a Sentry, para no subestimar en silencio.
- Se escribe en `onEnd` y en el error de `streamAnswer`, en segundo plano (`after()`). Si falla, la respuesta al visitante no se ve afectada.

## Consecuencias

- Los errores llegan agrupados y con alerta. Hay que crear el proyecto en Sentry y cargar `SENTRY_DSN` (tarea manual).
- El costo por sitio y por día sale de una consulta, y sirve para el tope de costo de la spec 007 y para la pantalla de administración.
- La tabla crece con cada mensaje respondido: unos 100 bytes por fila. Con 10.000 respuestas por día son 1 MB por día; se purga a los 180 días, con un job que queda para cuando haga falta.
- **El costo es una estimación:** la factura real es la del AI Gateway. Conviene compararlas una vez por mes y actualizar `model-prices.ts` cuando cambien los precios.
