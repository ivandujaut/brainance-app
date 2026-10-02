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

- Cada llamada a un modelo registra tier, modelo, tokens, costo y latencia.
- No se cambia un modelo ni un prompt sin correr el eval set en español (ver ADR 0001).
- Hay que empezar simple: un modelo bien configurado antes que un router complejo. El routing se agrega cuando los datos muestran que conviene.

## Calidad

- TypeScript estricto. Sin `any` en código nuevo.
- Código nuevo con tests. Al tocar código viejo, se deja con al menos el test del comportamiento cambiado.
- Los componentes nuevos del dashboard leen datos en Server Components en lugar de hacer fetch dentro de `useEffect`. La regla `react-hooks/set-state-in-effect` está en warning solo por el código heredado.

## Deuda técnica conocida

- Los hooks del dashboard (`src/hooks/settings`, `src/context/use-sidebar.tsx`) hacen fetch en efectos.
- `User.type` ya no se usa (spec 002): eliminar la columna en una migración aparte.
- No hay webhook de Clerk: si se borra un usuario en Clerk, su registro queda en la base.
- El widget deriva a un contacto genérico y usa voseo para todos los sitios hasta que la configuración del bot guarde contacto y trato (ítem 3 del roadmap).
- Tailwind 3 y zod 3: actualizar a Tailwind 4 y zod 4 en PRs separados.
- `src/actions/landing/index.ts` lee `CLOUDWAYS_POSTS_URL`, que no existe (la variable se llama `CLOUDWAYS_POST_URL`).
- Las reglas `eslint-config-next/typescript` todavía no están activas porque marcan unos 90 problemas en el código heredado.
