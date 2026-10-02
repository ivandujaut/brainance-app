# 0003 — Arquitectura y límites del widget

- **Estado:** Aceptado
- **Fecha:** 2026-10-02

## Contexto

El widget se ejecuta dentro de sitios que no controlamos y llama a un endpoint público que cuesta dinero por mensaje. Hay que decidir cómo se embebe, cómo se evita que otros sitios usen el bot de un cliente y cómo se acota el costo.

## Opciones consideradas

1. **Script que abre un iframe con una página de la app.** Aísla estilos y JavaScript en ambos sentidos. El chat es React normal dentro de Next. El navegador puede restringir quién lo embebe con `frame-ancestors`. A cambio, el iframe pesa algo más y el redimensionado se hace con `postMessage`.
2. **Web component con Shadow DOM.** Carga más rápido y no necesita `postMessage`. Pero hay que empaquetar el chat fuera de Next, los estilos del sitio pueden filtrarse por herencia, y no hay forma de que el navegador impida su uso desde otros dominios: el endpoint quedaría expuesto a cualquier sitio.

Para los límites se consideraron:
- un servicio de rate limiting (Upstash/Redis), que suma un proveedor;
- contar los mensajes en Postgres, sin infraestructura nueva y suficiente para el volumen de la beta.

## Decisión

- **Script más iframe**, con `Content-Security-Policy: frame-ancestors` restringido al dominio del sitio y sus subdominios.
- **Visitante anónimo** identificado por un `visitorId` aleatorio guardado en el `localStorage` del iframe, que el navegador particiona por sitio.
- **Límites contados en Postgres:**
  - 1.000 caracteres por mensaje;
  - 20 mensajes por visitante cada 10 minutos;
  - 300 mensajes de visitantes por sitio cada 24 horas. Al superarlo, el bot responde con el contacto del negocio sin llamar al modelo.
- **Modelo configurable** por `AI_ANSWER_MODEL`, con `anthropic/claude-haiku-4.5` por defecto hasta que el eval de la spec 001 elija otro.

## Consecuencias

- El peor caso de costo por sitio queda acotado: 300 mensajes por día, a los precios del ADR 0001, son centavos de dólar.
- Un abusador puede agotar el cupo diario de un sitio. Se mitiga con el límite por visitante; si ocurre, se agrega límite por IP o un servicio dedicado.
- Los sitios sin HTTPS no pueden embeber el chat (salvo `localhost` en desarrollo).
- Si el volumen crece, los conteos en Postgres se reemplazan por un rate limiter dedicado sin cambiar la interfaz de `src/domain/widget-limits.ts`.
