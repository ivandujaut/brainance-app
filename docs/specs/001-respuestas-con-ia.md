# 001 — Respuestas con IA (RAG) y su eval set

- **Estado:** Aprobada (casos, juez `claude-opus-5.5` y candidatos aprobados el 2026-10-01)
- **ADRs relacionados:** [0001 — Estrategia de modelos de IA](../adr/0001-estrategia-de-modelos-de-ia.md)

## Problema

El bot tiene que responder las consultas de los visitantes usando solo la información que cargó el negocio. Antes de elegir qué modelo usar en el tier rápido (T1/T2), hace falta medir en español qué modelo responde mejor y a qué costo.

## Historias de usuario

- Como **visitante del sitio**, quiero una respuesta corta y correcta a mi consulta para no tener que escribirle a una persona.
- Como **dueño del negocio**, quiero que el bot no invente precios, horarios ni políticas y que me derive la consulta cuando no tiene la respuesta.
- Como **equipo de BrAInance**, quiero un eval reproducible para decidir qué modelo usar y detectar regresiones cuando cambian el prompt o el modelo.

## Criterios de aceptación

1. **Dado** un negocio con su base de conocimiento, **cuando** el visitante pregunta algo que está en ella, **entonces** el bot responde con los datos correctos.
2. **Dado** que la respuesta no está en la base de conocimiento, **cuando** el visitante pregunta, **entonces** el bot dice que no tiene ese dato y ofrece el canal de contacto del negocio, sin inventar.
3. **Dado** un mensaje con dos preguntas, **cuando** el bot responde, **entonces** contesta las dos (o aclara cuál no puede responder).
4. **Dado** un mensaje fuera de tema o que intenta cambiar las instrucciones del bot, **cuando** el bot responde, **entonces** vuelve al tema del negocio sin obedecer la instrucción.
5. **Dado** el tono configurado por el negocio (voseo o usted), **cuando** el bot responde, **entonces** usa ese tono en un español natural.
6. **Dado** cualquier respuesta, **entonces** queda registrado el modelo, los tokens (incluidos los cacheados), la latencia y el motivo de corte.

## Fuera de alcance

- Recuperación con embeddings (pgvector). En este eval el bot recibe la base de conocimiento completa, porque las bases de la beta son chicas. La recuperación se evalúa aparte cuando exista.
- Herramientas (captura de leads, reservas) y escalado a humano: son evals separados.
- La UI del widget.

## Notas técnicas

- Prompt de sistema: `src/domain/answer-prompt.ts` (puro, con tests).
- Punto de entrada que se usará en producción: `src/server/ai/answer.ts`. Llama al modelo vía Vercel AI Gateway con el AI SDK.
- Eval: `evals/rag-answers/`. Tiene 5 negocios argentinos ficticios, 75 casos, un runner y un juez con rúbrica. Ver su `README.md`.
- Riesgo: los casos y las respuestas esperadas los generó Claude. El juez califica contra hechos de la base de conocimiento, no contra el estilo de una respuesta modelo. Aun así, conviene sumar casos reales cuando haya tráfico.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1–5 | Eval con juez IA | `evals/rag-answers/` |
| 5 (tono) | Unitario | `src/domain/answer-prompt.test.ts` |
| 6 | Unitario | `src/server/ai/answer.test.ts` |
