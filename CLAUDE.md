# CLAUDE.md

BrAInance: SaaS multi-tenant de chatbots con IA para sitios web (Next.js 16, React 19, Clerk 7, Prisma 7 + Postgres). La documentación del proyecto está en español; el código y los comentarios, en inglés.

## Antes de escribir código

- Leer `docs/workflow.md` y `docs/principles.md`.
- Una feature nueva arranca con una spec en `docs/specs/` (template: `docs/specs/_template.md`). Si no existe, se propone primero.
- Las decisiones de arquitectura o de proveedor se registran como ADR en `docs/adr/`.
- El alcance actual es la beta (`docs/roadmap.md`). Lo que está en "v1" no se implementa sin pedido explícito.

## Comandos

```bash
npm run lint && npm run typecheck && npm test   # correr antes de cada commit
TEST_DATABASE_URL=<postgres migrado> npm test   # incluye los tests de integración (*.int.test.ts)
npm run build
npm run test:e2e                               # requiere claves de Clerk
npx prisma migrate dev --name <cambio>         # al cambiar prisma/schema.prisma
npm run eval:rag -- --variant <id> --model <gateway-id>   # eval de respuestas (ver evals/rag-answers/README.md)
```

En sandboxes con Chromium preinstalado: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`.

Los E2E del widget no necesitan Clerk: levantan la app con `WIDGET_ALLOW_HTTP=true AI_ANSWER_MODEL=mock/echo AI_ALLOW_MOCK_MODEL=true` y una base migrada en `DATABASE_URL`. Los de registro y onboarding se saltean si falta `CLERK_SECRET_KEY`.

## Arquitectura

- `src/app/`: rutas y UI. Sin lógica de negocio.
- `src/actions/`: server actions finas (auth con `@clerk/nextjs/server`, validación con zod, delegación).
- `src/domain/`: lógica pura con tests unitarios al lado (`*.test.ts`). No importa Next, Prisma, Clerk ni SDKs de IA.
- `src/server/`: adaptadores (repositorios, IA, realtime, email) detrás de interfaces.
- `src/generated/prisma/`: cliente de Prisma generado (no se edita ni se commitea). Se importa desde `@/generated/prisma/client`; la instancia compartida está en `src/lib/prisma.ts`.
- `src/proxy.ts`: middleware de Clerk (Next 16 renombró `middleware.ts` a `proxy.ts`). Las rutas nuevas son privadas salvo que se agreguen a `isPublicRoute`.

## Convenciones

- TDD: escribir el test, verlo fallar e implementar.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- Commits y PRs sin atribución a Claude: ni `Co-Authored-By`, ni líneas `Claude-Session`, ni firma en la descripción del PR. Autor y committer: `Ivan Dujaut <dujautivan@gmail.com>` (verificar `git config user.name` y `user.email` antes de commitear).
- Toda consulta de datos de tenant filtra por el usuario o dominio dueño.
- Secretos solo en variables de entorno; documentar las variables nuevas en `.env.example`. Nunca poner secretos en `NEXT_PUBLIC_*`.
- Cambios de prompt o de modelo de IA: correr el eval set (ADR 0001).
