# AGENTS.md

Instrucciones para cualquier agente de IA, o persona, que trabaje en este repo. **Es la fuente única:** `CLAUDE.md` y los demás adaptadores apuntan acá ([ADR 0010](docs/adr/0010-sistema-de-trabajo-con-agentes-portable.md)). Algunas carpetas tienen su propio `AGENTS.md` con las reglas de esa área. El mapa completo está en [`docs/agentes/`](docs/agentes/README.md).

## El proyecto

BrAInance: SaaS multi-tenant de chat con IA para el sitio web de negocios chicos que atienden solos. Stack: Next.js 16, React 19, Clerk 7, Prisma 7 + Postgres (Neon). **La documentación está en español; el código y los comentarios, en inglés.**

**Rama `whatsapp-os`:** es una línea aparte que explora un sistema operativo por WhatsApp para talleres ([ADR 0100](docs/adr/0100-linea-whatsapp-para-talleres.md), `docs/whatsapp-os/`). En esta rama:

- los PRs van contra `whatsapp-os`, no contra `develop`;
- las specs se numeran desde 100 y los ADR desde 0100;
- lo que sirve a las dos líneas se arregla en `develop` y se trae acá con un merge.

`develop` y `main` siguen con la beta web.

## Antes de escribir código

- Leer `docs/workflow.md`, `docs/principles.md` y `docs/posicionamiento.md`. Este último dice qué problema resuelve el producto y para quién, y los titulares y las specs se contrastan contra eso.
- Una feature nueva arranca con una spec en `docs/specs/` (template: `docs/specs/_template.md`). Si no existe, se propone primero.
- Las decisiones de arquitectura o de proveedor se registran como ADR en `docs/adr/`.
- El alcance actual es la beta (`docs/roadmap.md`). Lo que está en "v1" no se implementa sin un pedido explícito.
- Next.js 16 cambió APIs y convenciones: antes de usar una, mirá la guía en `node_modules/next/dist/docs/` (ver el bloque al final).

## Comandos

```bash
npm run lint && npm run typecheck && npm test   # antes de cada commit
TEST_DATABASE_URL=<postgres migrado> npm test   # suma los tests de integración (*.int.test.ts)
npm run build
npm run test:e2e                               # E2E con Playwright (ver e2e/AGENTS.md)
npx prisma migrate dev --name <cambio>         # al cambiar prisma/schema.prisma
npm run eval:rag -- --variant <id> --model <gateway-id>   # eval de respuestas (ver evals/AGENTS.md)
```

## Arquitectura

- `src/app/`: rutas y UI, sin lógica de negocio. Hay tres grupos de rutas con su propio layout raíz:
  - `(site)`: panel y auth, con Clerk.
  - `(widget)`: el iframe del chat, sin Clerk.
  - `(public)`: portada y páginas legales, estáticas y sin Clerk.
- `src/actions/`: server actions finas: autentican, validan con zod y delegan.
- `src/domain/`: lógica pura, con tests unitarios al lado. No importa Next, Prisma, Clerk ni SDKs de IA.
- `src/server/`: adaptadores detrás de interfaces (repositorios, IA, realtime, email).
- `src/generated/prisma/`: cliente de Prisma generado. No se edita ni se commitea; se importa desde `@/generated/prisma/client`, y la instancia compartida está en `src/lib/prisma.ts`.
- `src/proxy.ts`: middleware de Clerk (Next 16 renombró `middleware.ts` a `proxy.ts`). Las rutas nuevas son privadas, salvo que se agreguen a `isPublicRoute`.
- Los pasos manuales de despliegue están en `docs/lanzamiento.md`.

## Convenciones

- **TDD:** escribir el test, verlo fallar e implementar.
- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `test:`, `docs:`.
- **Autoría:** commits y PRs van a nombre de `Ivan Dujaut <dujautivan@gmail.com>` y **sin atribución a ninguna IA**. Eso excluye un `Co-Authored-By` de un modelo, las líneas `Claude-Session` y los pies del tipo "Generated with…" en el PR. Antes de commitear, verificá `git config user.name` y `user.email`. El hook `commit-msg` y el workflow "Reglas del repo" rechazan la atribución (ver "Controles").
- **Aislamiento entre clientes (ADR 0004):** todo id que llega del navegador se resuelve con `src/server/tenancy.ts` y se opera sobre el id devuelto (ver `src/actions/AGENTS.md`).
- **Secretos:** solo en variables de entorno. Las variables nuevas se documentan en `.env.example`. Nunca van secretos en `NEXT_PUBLIC_*`.
- **IA:** un cambio de prompt o de modelo exige correr el eval (ADR 0001, `evals/AGENTS.md`).
- **UI:**
  - Colores con los tokens de `src/app/globals.css` y componentes de `src/components/ui` (ADR 0005).
  - Tipografía Plus Jakarta Sans.
  - Por ahora, solo tema claro (spec 009).

## Ramas, PRs y QA

- **Una rama por cambio:** `feat/NNN-nombre`, `fix/…`, `docs/…` o `chore/…`.
- **El PR va contra `develop`**, con el template `.github/pull_request_template.md`, y no se mergea con el CI en rojo.
- **PRs apilados:** si un PR depende de otro, abrilo igual contra `develop`. Su diff incluye los commits del otro hasta que se mergee. No uses la rama del otro PR como base: cuando se mergea y se borra esa rama, GitHub cierra el PR apilado.
- **El merge lo hace el dueño.** Un agente no mergea, no aprueba y no reescribe la historia de una rama ajena.
- **QA:** después del merge se prueba en el preview con un agente de navegador, guiado por un prompt. Ese prompt siempre incluye estas tres reglas: no hacer pagos, no pedir ni escribir claves en el chat y no escribir contraseñas.
- **Migraciones:** el dueño aplica las migraciones a las bases de Neon con el workflow `migrate.yml` de Actions.

## Controles

No dependen de la herramienta: corren en git y en GitHub ([ADR 0010](docs/adr/0010-sistema-de-trabajo-con-agentes-portable.md)).

- **Hooks de git** (`.githooks/`). Se activan solos con `npm install`, a través del script `prepare`:
  - `commit-msg` rechaza la atribución a una IA;
  - `pre-commit` corre ESLint sobre los archivos en stage y el typecheck, si cambió algo más que Markdown;
  - `pre-push` corre los tests, si cambió algo más que Markdown.
- **Saltear un hook** se puede una vez, con `--no-verify`. El CI corre lo mismo y no se puede saltear.
- **Workflow "Reglas del repo"** (`.github/workflows/reglas.yml`): revisa los commits y la descripción de cada PR, y vuelve a correr cuando se edita la descripción.
- **Los chequeos viven en `scripts/checks/`,** con sus tests. Un control nuevo se agrega ahí y se llama desde el hook, el CI y los adaptadores de cada herramienta, sin duplicar la lógica.

## Procedimientos

Los procedimientos repetibles están en `.claude/skills/<nombre>/SKILL.md`, en el formato abierto Agent Skills. Cualquier herramienta, o una persona, los puede leer como documentación.

| Skill | Cuándo |
|---|---|
| `nueva-spec` | Una feature nueva, antes de tocar código |
| `nuevo-adr` | Una decisión de arquitectura o de proveedor difícil de revertir |
| `abrir-pr` | Un cambio listo para revisión |
| `prompt-qa` | Después del merge, para el QA con un agente de navegador |
| `correr-eval` | Después de cambiar un prompt o un modelo de IA |

Para revisar un diff antes de abrir el PR: [`docs/agentes/revision.md`](docs/agentes/revision.md). En Claude Code la aplica el subagente `revisor` (`.claude/agents/revisor.md`).

## Seguridad para agentes

- Nunca pidas ni pegues claves o secretos en el chat, en issues ni en commits. Los carga el dueño en cada proveedor.
- No hagas pagos, no cambies planes de proveedores y no escribas contraseñas.
- Antes de algo irreversible o que sale afuera (borrar, publicar, mandar un mensaje, pushear a una rama ajena), confirmá con el dueño.

## Entorno

- **Preparar un sandbox o un contenedor nuevo:** `scripts/dev/setup-sandbox.sh` instala dependencias, genera el cliente de Prisma, levanta Postgres, crea y migra `brainance_test` y `brainance_e2e`, y activa los hooks de git. Se puede correr varias veces.
- **Postgres:** si todos los tests de integración fallan a la vez, lo más probable es que se haya caído. Levantalo con `service postgresql start`. Bases locales:
  - tests: `postgresql://postgres:postgres@localhost:5432/brainance_test`;
  - E2E: `brainance_e2e`.
- **Prisma:** después de cambiar `prisma/schema.prisma`, si faltan tipos, corré `npx prisma generate`.
- **Regex en tests:** el target de TypeScript no admite la bandera `s`. Usá `[\s\S]`.
- Más detalles del entorno, incluidas las sesiones en la nube, en [`docs/agentes/entorno.md`](docs/agentes/entorno.md).

## Lo que aprendas, al repo

La memoria de cada herramienta no viaja con el repo. Si descubrís algo que la próxima sesión necesita (un truco del entorno, una regla que el dueño tuvo que repetir, un error que costó encontrar), agregalo a este archivo, al `AGENTS.md` del área o a `docs/agentes/`. Hacelo en el mismo PR del trabajo que lo reveló.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
