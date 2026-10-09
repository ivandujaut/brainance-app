# Entorno de trabajo

Lo que hace falta saber para trabajar en este repo desde una máquina nueva, un sandbox o una sesión en la nube. Lo básico (instalar, migrar, levantar) está en el [README](../../README.md).

## Postgres local

- **Si todos los tests de integración fallan a la vez,** casi seguro Postgres se cayó.
- **Levantarlo:** `service postgresql start`.
- **Usuario y clave:** `postgres` / `postgres`, en `localhost:5432`.
- **Bases que usa el proyecto:**

| Base | Para qué |
|---|---|
| `brainance_test` | Tests de integración: `TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/brainance_test npm test` |
| `brainance_e2e` | La app que levantan los E2E (`DATABASE_URL`) |
| `brainance_migrate` | Probar una migración desde cero antes de aplicarla a las otras |
| `brainance_dev` | Desarrollo local |

- **Crear y migrar una base que falta:**

```bash
psql "postgresql://postgres:postgres@localhost:5432/postgres" -c 'CREATE DATABASE brainance_test'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/brainance_test npx prisma migrate deploy
```

## Navegador para E2E y capturas

- **Chromium preinstalado:** si el entorno lo trae en `/opt/pw-browsers/chromium`, pasalo con `PW_CHROMIUM_PATH`. Vale para `npm run test:e2e` y para `npm run landing:screens`. No corras `playwright install`.
- **Antes de los E2E:** `npm run build`, y matá los servidores `next` viejos.
- **Capturas:** esperá el evento `load` y un tiempo fijo, no `networkidle`. El realtime mantiene conexiones abiertas y `networkidle` no llega nunca.

## Next.js y los archivos de agentes

`next dev` agrega un bloque `nextjs-agent-rules` en `AGENTS.md` o `CLAUDE.md` cuando detecta un agente de IA (`node_modules/next/dist/server/lib/generate-agent-files.js`). El bloque está guardado en `AGENTS.md`, así que Next lo encuentra y no toca nada.

- **Si un build ensucia `AGENTS.md`,** casi seguro es que Next cambió el texto del bloque en una versión nueva. Commiteá el bloque actualizado; no lo borres.

## GitHub desde sesiones en la nube

- **El cliente `gh` de las sesiones en la nube** solo hace `gh api` contra la API REST. Los comandos como `gh pr view` no existen ahí.
- **Logs del CI:** `gh api` no los descarga, porque la API responde con una redirección que el proxy rechaza. Usá la herramienta de logs de jobs del servidor MCP de GitHub.
- **Cambiar la descripción de un PR:** `gh api -X PATCH repos/<owner>/<repo>/pulls/<n> -F body=@archivo.md`.
- **Identidad para commitear:** si el entorno no la tiene configurada, usá `git -c user.name="Ivan Dujaut" -c user.email="dujautivan@gmail.com" commit …`.

## Formato

- Para archivos nuevos que no cubre ESLint: `npx prettier --print-width 120 --write <archivo>`. Formateá solo los archivos nuevos, para no ensuciar el diff con cambios de formato en el código existente.
