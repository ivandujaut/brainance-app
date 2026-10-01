# NNN — Nombre de la feature

- **Estado:** Borrador | Aprobada | Implementada
- **ADRs relacionados:** —

## Problema

Qué le pasa al usuario hoy y por qué importa. Una o dos frases.

## Historias de usuario

- Como **[dueño del negocio | visitante del sitio | agente humano]**, quiero **[acción]** para **[beneficio]**.

## Criterios de aceptación

Cada criterio se convierte en al menos un test (unitario, de integración o E2E).

1. **Dado** [contexto], **cuando** [acción], **entonces** [resultado observable].
2. ...

## Fuera de alcance

- Lo que explícitamente no hace esta feature.

## Notas técnicas

- Modelos de datos afectados, server actions nuevas y adaptadores (`src/server/`).
- Riesgos y preguntas abiertas.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1 | Unitario | `src/domain/....test.ts` |
| 2 | E2E | `e2e/....spec.ts` |
