# 0007 — Tiempo real híbrido: push como aviso, polling como respaldo

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto

La bandeja de conversaciones (spec 006) permite que el dueño tome el control de un chat. Desde ese momento, los mensajes tienen que llegar al otro lado en pocos segundos, en los dos sentidos: dueño → visitante (widget) y visitante → dueño (panel).

Restricciones:

- **Vercel no mantiene conexiones abiertas.** Las funciones serverless no pueden sostener WebSockets, así que un push real requiere un proveedor gestionado (Pusher, Ably, Supabase Realtime).
- **Los datos son de los tenants** (ADR 0004). Lo que viaja por un canal de terceros tiene que estar autorizado igual que una consulta a la base.
- **La beta tiene que funcionar sin claves**, en desarrollo y en los E2E, como ya pasa con la IA (modelo mock) y el email (adaptador `log`).
- `.env.example` declara variables de Pusher heredadas, pero ningún código las usa.

## Opciones consideradas

1. **Solo polling.** El panel y el widget consultan cada pocos segundos. No suma proveedor ni costo, y la base es la única fuente de verdad. Pero no es instantáneo: hay hasta un intervalo de demora y consultas aunque no pase nada.
2. **Solo WebSocket con un proveedor (Pusher o Ably).** Es instantáneo, pero si el proveedor falla, se cae la conexión (redes móviles, proxies corporativos) o faltan las claves, el chat deja de actualizarse. Además, mandar el contenido por el proveedor obliga a canales privados con autenticación propia.
3. **Híbrido: push como aviso, polling como respaldo.** La base es la fuente de verdad. El proveedor solo manda un aviso sin contenido ("la conversación X cambió") y el cliente, al recibirlo, pide los mensajes nuevos al servidor por el endpoint ya autorizado. Si no hay push (sin claves, desconectado, bloqueado), el cliente sigue funcionando por polling.
4. **Varios proveedores de push con failover automático** (por ejemplo, Pusher y Ably a la vez). Da más disponibilidad, pero duplica integración, claves y costo, y el polling ya cubre la caída de un proveedor.

## Cómo se llama el patrón

Combina dos ideas conocidas:

- **Notify-then-fetch** (también "señal y consulta" o *push-to-pull*): el push no lleva datos, solo avisa que hay que consultar. Los datos siempre se leen por el camino autorizado.
- **Degradación elegante con transporte de respaldo** (*transport fallback*): es lo que hacen Socket.IO y SignalR cuando caen a long-polling si no hay WebSocket. Acá el respaldo es polling adaptativo.

## Decisión

**Opción 3, en dos pasos dentro de la spec 006.**

**Fuente de verdad**
- Postgres. Cada cliente lee con un cursor (`GET …/messages?after=<id>`) y recibe solo lo nuevo. El mismo endpoint sirve para el polling y para la consulta posterior a un aviso.

**Polling adaptativo** (paso 1, siempre activo)
- Cada 3 segundos con la conversación visible y en vivo (el dueño tomó el control).
- Cada 15 segundos con la conversación visible sin control humano.
- En pausa con la pestaña oculta (`visibilitychange`); al volver, consulta de inmediato.
- Con push conectado, el polling baja a una consulta de seguridad cada 30 segundos, para recuperar avisos perdidos.

**Push como acelerador** (paso 2, opcional por configuración)
- Interfaz `RealtimePublisher` en `src/server/realtime/` con dos adaptadores: `noop` (por defecto) y `pusher`.
- Se activa si están `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET` y `PUSHER_CLUSTER`. La clave pública y el cluster llegan al cliente desde la configuración del servidor, no como `NEXT_PUBLIC_*` fijas.
- El evento es `{ type: "changed" }`, sin texto ni ids de mensajes.
- Canales privados:
  - el del dueño, `private-owner-<userId>`, autorizado con la sesión de Clerk;
  - el del visitante, `private-room-<chatRoomId>`, autorizado con su `visitorId` secreto contra la base.
- **Pusher** frente a Ably: el plan gratuito (200.000 mensajes por día, 100 conexiones simultáneas) alcanza para la beta y su modelo de canales privados es el más simple. Cambiar a Ably es otro adaptador.

## Consecuencias

- Sin claves, todo funciona por polling: desarrollo, E2E y una caída del proveedor se comportan igual, con algunos segundos más de demora.
- Con push, la latencia baja a menos de un segundo y las consultas en reposo bajan a una cada 30 segundos por conversación abierta.
- Como el push no lleva contenido, un canal mal configurado no expone mensajes: lo peor que filtra es que "algo cambió".
- **Costo del polling:** cada consulta es un índice sobre `ChatMessage(chatRoomId, createdAt)`. Con 3 segundos y decenas de conversaciones en vivo, el costo en Neon es bajo. Si la beta crece, el push activado lo reduce más de 10 veces.
- El widget también consulta mientras la conversación está en vivo. Eso suma pedidos al endpoint público, que ya tiene límites por visitante (ADR 0003). El polling de lectura no los consume.
