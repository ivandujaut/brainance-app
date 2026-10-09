---
name: nueva-spec
description: Escribir la spec de una feature nueva en docs/specs/ antes de tocar código. Usar cuando el dueño pide una funcionalidad que no tiene spec, o cuando hay que proponer una.
---

# Nueva spec

En este repo, una feature empieza por su spec. El código viene en otro PR, después de que el dueño la mergea ([`docs/workflow.md`](../../../docs/workflow.md)).

## Antes de escribir

1. Leé [`docs/posicionamiento.md`](../../../docs/posicionamiento.md) y [`docs/roadmap.md`](../../../docs/roadmap.md). Si la feature no encaja con la promesa o está en "v1", decíselo al dueño antes de seguir.
2. Buscá specs y ADRs relacionados en `docs/specs/` y `docs/adr/`.
3. Elegí el número: el siguiente libre en `docs/specs/`. En la rama `whatsapp-os`, las specs se numeran desde 100.

## Cómo escribirla

- Partí de [`docs/specs/_template.md`](../../../docs/specs/_template.md) y llamá al archivo `NNN-nombre-corto.md`.
- **Estado:** `Borrador`, hasta que el dueño la apruebe.
- **Problema:** en palabras del usuario, en una o dos frases.
- **Criterios de aceptación** en formato *Dado / Cuando / Entonces*. Cada uno tiene que poder volverse un test; si no se puede testear, está mal escrito.
- **Fuera de alcance:** explícito. Ahí va lo que el dueño podría suponer que entra y no entra.
- **Notas técnicas:**
  - modelos de datos, acciones y adaptadores afectados;
  - si hay migración;
  - riesgos.
- **Plan de tests:** una fila por criterio, con el tipo de test y el archivo.
- Si hay una decisión difícil de revertir (proveedor, patrón, esquema), proponé además un ADR con la skill `nuevo-adr`.

## Cerrar

- Sumá la feature al [`docs/roadmap.md`](../../../docs/roadmap.md), con link a la spec.
- Abrí un PR solo con la spec (`docs: spec NNN, <nombre>`), con la skill `abrir-pr`.
- Implementá recién cuando el dueño la mergee.
