# Sistema de trabajo con agentes

Cómo está armado el trabajo con agentes de IA en este repo, para que cambiar de cuenta o de herramienta no cambie nada ([ADR 0010](../adr/0010-sistema-de-trabajo-con-agentes-portable.md)).

## Las tres capas

| Capa | Qué tiene | Quién la usa | Dónde |
|---|---|---|---|
| **1. Conocimiento** | Reglas, arquitectura, convenciones, entorno | Cualquier herramienta y cualquier persona | `AGENTS.md` en la raíz y en cada área; `docs/` |
| **2. Garantías** | Controles que no dependen de la IA: sin atribución, lint, tipos, tests | Git y el CI, con cualquier herramienta o sin ella | `scripts/checks/`, `.githooks/`, `.github/workflows/reglas.yml` |
| **3. Adaptadores** | Lo propio de cada herramienta, apuntando a la capa 1 y llamando a la capa 2 | Cada herramienta | `CLAUDE.md`, `.claude/settings.json`, `.claude/hooks/`, `.claude/skills/`, `.claude/agents/` |

**La regla que sostiene todo:** una regla se escribe una sola vez, en la capa 1. Los adaptadores apuntan a ella y no la copian. Lo que no puede fallar no se deja a la memoria de un modelo: va en la capa 2.

## Dónde está cada regla

| Archivo | Para qué |
|---|---|
| [`AGENTS.md`](../../AGENTS.md) | Reglas generales, comandos, arquitectura, ramas y PRs, seguridad, entorno básico |
| [`src/actions/AGENTS.md`](../../src/actions/AGENTS.md) | Server actions y aislamiento entre clientes |
| [`src/domain/AGENTS.md`](../../src/domain/AGENTS.md) | Lógica pura y tests |
| [`src/server/AGENTS.md`](../../src/server/AGENTS.md) | Adaptadores, IA, errores y Sentry |
| [`src/components/AGENTS.md`](../../src/components/AGENTS.md) | UI, tokens, tipografía y tema |
| [`prisma/AGENTS.md`](../../prisma/AGENTS.md) | Esquema y migraciones |
| [`evals/AGENTS.md`](../../evals/AGENTS.md) | Cuándo y cómo correr el eval |
| [`e2e/AGENTS.md`](../../e2e/AGENTS.md) | Cómo correr y escribir los E2E |
| [`docs/agentes/entorno.md`](entorno.md) | Postgres, navegador, Next.js, GitHub desde la nube |
| [`docs/agentes/revision.md`](revision.md) | Qué revisar en un diff: lo que bloquea y lo que conviene arreglar |
| [`.claude/skills/`](../../.claude/skills/) | Procedimientos en formato Agent Skills: `nueva-spec`, `nuevo-adr`, `abrir-pr`, `prompt-qa`, `correr-eval` |
| [`.claude/agents/revisor.md`](../../.claude/agents/revisor.md) | Subagente de Claude Code que aplica `revision.md` |
| [`docs/agentes/otras-herramientas.md`](otras-herramientas.md) | Qué lee cada herramienta de IA y cómo conectarla |
| [`CLAUDE.md`](../../CLAUDE.md) | Adaptador de Claude Code: importa `AGENTS.md` y suma lo propio |
| [`.claude/settings.json`](../../.claude/settings.json) | Configuración compartida de Claude Code: atribución apagada, `.env` sin leer, hooks |
| [`.claude/hooks/`](../../.claude/hooks/) | Envoltorios finos: `session-start.sh` llama a `scripts/dev/setup-sandbox.sh` y `bash-guard.mjs` llama a `scripts/checks/bash-guard.mjs` |
| `*/CLAUDE.md` de cada área | Una línea, `@AGENTS.md`. Claude Code ignora los `AGENTS.md` de subcarpetas cuando hay un `CLAUDE.md` en la raíz; este adaptador los carga cuando toca un archivo de esa carpeta |

## Cuando aprendés algo

La memoria de cada herramienta queda en la cuenta o en la máquina. Lo que la próxima sesión necesita va al repo, en el mismo PR del trabajo que lo reveló:

- **Una regla general**, al `AGENTS.md` de la raíz.
- **Una regla de un área**, al `AGENTS.md` de esa carpeta.
- **Un detalle del entorno**, a [`entorno.md`](entorno.md).
- **Algo que no puede fallar**, a un chequeo de la capa 2, no a un texto.

## Estado

- [x] **PR 1:** ADR 0010 y capa de conocimiento.
- [x] **PR 2:** garantías (hooks de git y CI).
- [x] **PR 3:** adaptador de Claude Code (`.claude/settings.json`, hooks, `SessionStart`).
- [x] **PR 4:** skills y subagente revisor.
- [x] **Guía para otras herramientas** ([`otras-herramientas.md`](otras-herramientas.md)).
