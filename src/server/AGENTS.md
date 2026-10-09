# Adaptadores

Reglas para `src/server/`. Las generales están en el [`AGENTS.md` de la raíz](../../AGENTS.md).

- **Cada proveedor externo está detrás de una interfaz.** Cambiar de modelo de IA, de realtime, de email o de base no debería tocar `src/domain/` ni `src/app/`.
- **Cada llamada a un modelo** registra el modelo, los tokens, el costo estimado y la latencia en `ModelCall` (`src/server/ai/usage.ts`, ADR 0008).
- **Los errores de producción** pasan por `captureError` o `captureWarning` (`src/server/observability.ts`), no por `console.error`.
- **A Sentry nunca va** el texto de una conversación, un email ni una respuesta de calificación. `src/lib/sentry-scrub.ts` es la red de seguridad, no el permiso.
- **Lo que manda el visitante del widget no es confiable**, y eso incluye lo que llega al modelo (prompt injection). El modelo nunca recibe permisos que el visitante no debería tener.
