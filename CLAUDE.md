@AGENTS.md

## Claude Code

Las reglas del proyecto están en `AGENTS.md`, importado arriba. Esta sección suma solo lo propio de Claude Code ([ADR 0010](docs/adr/0010-sistema-de-trabajo-con-agentes-portable.md)).

- No repitas acá reglas que van en `AGENTS.md`: este archivo es un adaptador.
- Lo que aprendas va a `AGENTS.md` o a `docs/agentes/`, no a la memoria automática, que queda en la máquina y no viaja con el repo.
- Para ver qué instrucciones cargó la sesión: `/context` o `/memory`.
- **`.claude/settings.json`** (versionado) es la configuración compartida:
  - atribución apagada;
  - no leer los `.env` con secretos;
  - un hook `SessionStart` que, en la web, corre `scripts/dev/setup-sandbox.sh`;
  - un hook `PreToolUse` que corre `scripts/checks/bash-guard.mjs` antes de cada comando.

  Tu configuración personal va en `.claude/settings.local.json`, que no se commitea.
