---
name: nuevo-adr
description: Registrar una decisión de arquitectura o de proveedor como ADR en docs/adr/. Usar cuando se elige un proveedor, un patrón o un cambio de esquema difícil de revertir.
---

# Nuevo ADR

Un ADR registra una decisión difícil de revertir y por qué se tomó. Las decisiones chicas van en las notas técnicas de la spec.

## Pasos

1. **Elegí el número:** el siguiente libre en `docs/adr/`, con cuatro dígitos. En la rama `whatsapp-os`, desde 0100.
2. **Partí de** [`docs/adr/_template.md`](../../../docs/adr/_template.md) y llamá al archivo `NNNN-titulo-corto.md`.
3. **Estado:** `Propuesto`. Pasa a `Aceptado` cuando el dueño lo mergea. Si otro lo reemplaza, queda `Reemplazado por NNNN`.
4. **Contexto:** el problema y sus restricciones, con datos (costos, límites, versiones) y links a la fuente.
5. **Opciones consideradas:** al menos dos, cada una con sus pros y contras reales. Incluí "no hacer nada" si es una opción.
6. **Decisión:** qué se elige y por qué, en pocas líneas.
7. **Consecuencias:** qué se gana, qué cuesta, qué no cubre y qué hay que hacer a continuación.

## Al terminar

- Linkeá el ADR desde la spec que lo motiva, y la spec desde el ADR.
- Si el ADR cambia una regla de trabajo, actualizá `AGENTS.md` en el mismo PR.
- Abrilo con la skill `abrir-pr`. Puede ir en el mismo PR que la spec.
