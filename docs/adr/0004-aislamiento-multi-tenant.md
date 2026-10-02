# 0004 — Aislamiento multi-tenant

- **Estado:** Aceptado
- **Fecha:** 2026-10-02

## Contexto

BrAInance es multi-tenant: cada **tenant** es la cuenta de un dueño de negocio (`User`). Todos sus datos cuelgan de ella:

```
User → Domain (sitio) → ChatBot, HelpDesk, FilterQuestions
                      → Customer (visitante) → ChatRoom → ChatMessage
```

Todos los tenants comparten base y esquema. Las server actions son endpoints públicos que reciben ids desde el navegador. Una auditoría encontró 12 acciones que usaban esos ids sin verificar el dueño (IDOR): cualquier usuario podía leer conversaciones de otro negocio, tomar su control, editar su bot o leer sus FAQ.

## Opciones consideradas

1. **Base o esquema por tenant.** Es el aislamiento más fuerte, pero multiplica la operación (migraciones, conexiones, costo). Desproporcionado para la beta.
2. **Base compartida con filtro por dueño en la aplicación.** Cada consulta resuelve los ids a través de la cadena de pertenencia. Es simple y testeable, pero depende de que nadie se olvide del filtro.
3. **Base compartida con Row-Level Security (RLS) de Postgres.** La base rechaza filas de otros tenants aunque la consulta no filtre. Es más robusta, pero requiere pasar el tenant en cada conexión (`SET app.tenant`), lo que con Prisma y un pooler suma complejidad.

## Decisión

**Opción 2, centralizada, con tests de ataque. RLS (opción 3) queda como evolución.**

- `src/server/tenancy.ts` es el único punto para resolver ids que vienen del navegador:
  - `findOwnedSite`
  - `findOwnedChatRoom`
  - los filtros `ownedSiteWhere` y `ownedChatRoomWhere`

  Validan el formato (UUID) y devuelven `null` si el id no existe, está mal formado o es de otro tenant, así no se filtra información sobre otros clientes.
- Las acciones operan sobre el id **devuelto** por esas funciones, nunca sobre el que llegó.
- `src/actions/tenant-isolation.int.test.ts` prueba cada acción como dueño (funciona) y como otro tenant (no tiene efecto ni devuelve datos). **Toda acción nueva que reciba un id suma su caso ahí.**
- Las rutas públicas del widget son la excepción: no hay sesión, y el acceso se limita con el `visitorId` secreto del visitante (ADR 0003).

## Consecuencias

- Los 12 casos vulnerables quedan cubiertos por tests que fallaban antes del arreglo y pasan después.
- El aislamiento sigue dependiendo de la disciplina del código. Lo mitigan:
  - la regla en `CLAUDE.md` y en `docs/principles.md`;
  - los tests de ataque;
  - las revisiones con `/security-review`.
- **Cuándo pasar a RLS:** antes de sumar equipos (varios usuarios por cuenta) o acceso por API de terceros, que multiplican los caminos de acceso a los datos.
