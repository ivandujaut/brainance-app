# Principios de ingeniería

Son pocos a propósito. Si una regla molesta sin aportar, se discute y se cambia en un PR.

## Arquitectura en capas

```
src/app/        Rutas y UI (Next.js App Router). Sin lógica de negocio.
src/actions/    Server actions finas: autentican, validan con zod y delegan.
src/domain/     Lógica de negocio pura. No importa Next, Prisma, Clerk ni SDKs de IA.
src/server/     Adaptadores: repositorios (Prisma), IA, realtime, email, pagos.
                Cada adaptador expone una interfaz para poder reemplazarlo o simularlo.
```

- **La lógica de negocio vive en `src/domain/`** y se prueba con tests unitarios. Ejemplo: `src/domain/plans.ts`.
- **Los proveedores externos están detrás de una interfaz** (`src/server/`). Cambiar de modelo de IA, de proveedor de realtime o de base de datos no debería tocar `domain/` ni `app/`.
- **Las server actions no deciden reglas.** Hacen auth, validación y orquestación.

## Datos y multi-tenancy

- Toda consulta a datos de un tenant filtra por el usuario o dominio dueño. Nunca se confía en un id que venga del cliente: se resuelve con `src/server/tenancy.ts`, que devuelve `null` si no es del usuario actual (ADR 0004).
- Cada acción que recibe un id tiene su test de ataque en `src/actions/tenant-isolation.int.test.ts`.
- Los cambios de esquema se hacen con migraciones de Prisma (`prisma migrate dev`), nunca con `db push` en entornos compartidos.

## Seguridad

- Los secretos van en variables de entorno y nunca se commitean. `.env.example` documenta todas las variables.
- Lo que tiene prefijo `NEXT_PUBLIC_` llega al navegador: ahí no van secretos.
- Los inputs del visitante del widget no son confiables, y eso incluye lo que se le manda a la IA (prompt injection). El modelo nunca recibe permisos que el visitante no debería tener.

## IA

- Cada llamada a un modelo registra modelo, tokens, costo estimado y latencia en `ModelCall` (`src/server/ai/usage.ts`, ADR 0008).
- No se cambia un modelo ni un prompt sin correr el eval set en español (ver ADR 0001).
- Hay que empezar simple: un modelo bien configurado antes que un router complejo. El routing se agrega cuando los datos muestran que conviene.

## UI y design system

- Los colores del panel salen de los tokens semánticos de `src/app/globals.css` (`bg-primary`, `text-muted-foreground`, `border-border`…) y los componentes, de `src/components/ui`. No se usan hex sueltos ni colores arbitrarios en código nuevo (ADR 0005).
- Todo par fondo/texto cumple contraste WCAG AA; `src/styles/design-tokens.test.ts` lo verifica para los tokens.
- El widget es la excepción: lleva el color del dueño, con el color del texto calculado (`src/domain/color-contrast.ts`).

## Errores

- Los errores de producción pasan por `captureError` / `captureWarning` (`src/server/observability.ts`), no por `console.error`: van a Sentry con su área y sitio.
- Nunca se manda a Sentry el texto de una conversación, un email o una respuesta de calificación; el filtro de `src/lib/sentry-scrub.ts` es la red de seguridad, no el permiso.

## Calidad

- TypeScript estricto. Sin `any` en código nuevo.
- Código nuevo con tests. Al tocar código viejo, se deja con al menos el test del comportamiento cambiado.
- Los componentes nuevos del dashboard leen datos en Server Components en lugar de hacer fetch dentro de `useEffect`. La regla `react-hooks/set-state-in-effect` está en warning solo por el código heredado.

## Deuda técnica conocida

- Los hooks del dashboard (`src/context/use-sidebar.tsx` y otros) hacen fetch en efectos. La configuración del bot ya carga sus datos en un Server Component (spec 004).
- No hay webhook de Clerk: si se borra un usuario en Clerk, su registro queda en la base. El email del dueño para los avisos de leads se lee de Clerk al enviar (spec 005).
- El listado de leads trae hasta 1.000 por consulta y la bandeja, 200 conversaciones: paginar cuando un dueño se acerque.
- El tope diario del sitio cuenta todos los mensajes de visitantes, también los que atendió una persona: es conservador (frena antes) y se ajusta si molesta.
- Los avisos de "modelo sin precio" y "sitio cerca del tope" se deduplican en memoria por instancia: en Vercel pueden repetirse entre instancias.
- `ModelCall` no se purga todavía (ADR 0008: a los 180 días).
- Push con Pusher implementado pero sin probar contra Pusher real: verificar con claves antes de activarlo en producción (ADR 0007).
- Tailwind 3 y zod 3: actualizar a Tailwind 4 y zod 4 en PRs separados.
- Las reglas `eslint-config-next/typescript` todavía no están activas porque marcaban unos 90 problemas en el código heredado; después de la limpieza de la spec 008 conviene medir de nuevo y activarlas.
- `Billings` y el enum `Plans` quedan para los límites por plan, aunque la beta solo tiene el plan gratuito.
