# Usar otra herramienta de IA

Qué lee cada herramienta y cómo conectarla con las reglas del repo ([ADR 0010](../adr/0010-sistema-de-trabajo-con-agentes-portable.md)). La fuente es siempre `AGENTS.md`: conectar una herramienta es hacer que lo lea, no copiar las reglas.

> **Cómo se armó esta tabla (2026-10-09):** lo de Claude Code y Gemini CLI sale de su documentación oficial. Lo de Codex, Copilot, Cursor y Windsurf sale de resúmenes de búsqueda y de foros, porque no se pudo abrir su documentación desde el entorno. Antes de depender de una fila marcada "sin verificar", confirmala en la documentación de la herramienta.

| Herramienta | ¿Lee `AGENTS.md`? | ¿Lee los de las subcarpetas? | Qué hay que hacer | Fuente |
|---|---|---|---|---|
| **Claude Code** | Solo si no hay `CLAUDE.md`. Acá sí hay, y lo importa con `@AGENTS.md` | No los lee directo. Cada carpeta con reglas tiene un `CLAUDE.md` de una línea, `@AGENTS.md`, que se carga cuando Claude toca un archivo de esa carpeta | Nada: ya está conectado | [Docs](https://code.claude.com/docs/en/memory) |
| **Codex (OpenAI)** | Sí | Sí, uno por carpeta, de la raíz a la carpeta actual | Nada | Sin verificar |
| **GitHub Copilot (agente)** | Sí | Sí, según el changelog. En VS Code, los de subcarpetas pueden necesitar `chat.useNestedAgentsMdFiles` | Nada; revisar esa opción en VS Code | Sin verificar |
| **Cursor** | Sí, como alternativa a `.cursor/rules` | Sí, según el equipo de Cursor, con errores reportados en foros | Nada; si no toma las reglas de un área, abrí el `AGENTS.md` de esa carpeta | Sin verificar |
| **Windsurf** | Sí, el de la raíz siempre | Sí, para su carpeta | Nada | Sin verificar |
| **Gemini CLI** | No por defecto (lee `GEMINI.md`) | Sí, con el nombre que se configure | En `.gemini/settings.json`: `{"context": {"fileName": ["AGENTS.md"]}}` | [Docs](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md) |
| **Una persona** | Sí | Sí | Leer `AGENTS.md` y el de la carpeta en la que trabaja | — |

## Lo que no depende de la herramienta

- **Las garantías** (hooks de git y CI, PR 2) valen para cualquier herramienta y para una persona: corren en git y en GitHub, no en el agente.
- **Los procedimientos** (`.claude/skills/`) siguen el formato abierto Agent Skills: un `SKILL.md` con `name` y `description`.
  - Claude Code los busca en `.claude/skills/`.
  - Según resúmenes de búsqueda sin verificar, Codex los busca en `.agents/skills/`.
  - Si una herramienta no los descubre, igual se pueden leer como documentación: son Markdown. `AGENTS.md` los lista en "Procedimientos".
- **La guía de revisión** ([`revision.md`](revision.md)) es neutral. El subagente `revisor` es solo el envoltorio de Claude Code.

## Al sumar una herramienta nueva

1. **Verificá en su documentación** si lee `AGENTS.md` y los de las subcarpetas.
2. **Si no lo lee,** configurala para que lo lea, como Gemini CLI. Como último recurso, escribí un adaptador de una línea que lo importe, como `CLAUDE.md`. No copies las reglas.
3. **Agregá su fila** en esta tabla, con la fecha y la fuente.
