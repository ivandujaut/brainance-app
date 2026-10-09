# Server actions

Reglas para `src/actions/`. Las generales están en el [`AGENTS.md` de la raíz](../../AGENTS.md).

- **Las acciones son finas.** Autentican con `@clerk/nextjs/server` (o `currentOwnerId` de `src/server/tenancy.ts`), validan con zod y delegan en `src/server/` o `src/domain/`. No deciden reglas de negocio.
- **Todo id que llega del navegador se resuelve antes de usarlo** (ADR 0004):
  - un sitio, con `findOwnedSite`;
  - una conversación, con `findOwnedChatRoom`.

  Después se opera sobre el id que devuelven, nunca sobre el que llegó. Si devuelven `null`, la acción no hace nada.
- **Cada acción nueva que recibe un id suma su caso en `src/actions/tenant-isolation.int.test.ts`:** como dueño funciona; como otro dueño, no cambia nada.
- **Los tests de integración (`*.int.test.ts`) necesitan una base migrada** en `TEST_DATABASE_URL`. Sin ella, se saltean.
