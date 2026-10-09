---
name: correr-eval
description: Correr y leer el eval de respuestas en español (evals/rag-answers) después de cambiar un prompt o un modelo de IA. Usar antes de abrir un PR que toque src/domain/answer-prompt.ts, el modelo del bot o los casos del eval.
---

# Correr el eval de respuestas

Un cambio de prompt o de modelo no se mergea sin eval ([ADR 0001](../../../docs/adr/0001-estrategia-de-modelos-de-ia.md)). El detalle completo está en [`evals/rag-answers/README.md`](../../../evals/rag-answers/README.md), y las reglas del área, en [`evals/AGENTS.md`](../../../evals/AGENTS.md).

## Dónde correrlo

- **En Actions, lo habitual.** Lo lanza el dueño desde "Correr eval de respuestas", porque usa el secret `AI_GATEWAY_API_KEY`. Pedile que lo lance sobre tu rama con estos datos:
  - **modelo:** por defecto, el actual del bot;
  - **repeticiones:** 2;
  - **aprobar el harness:** sí, si cambiaste el prompt o los casos.

  Cuesta unos US$ 2 a 4. Los resultados llegan en una rama `eval/rag-answers-<fecha>-<corrida>`.
- **Local**, solo si hay una clave en `.env.local`: `npm run eval:rag -- --variant <id> --model <gateway-id>`. La clave no se pide ni se pega en el chat.

## Cómo leerlo

- **Métricas:**
  - `correcta` es la principal;
  - `sin_invento` cuenta los datos sacados de la base de conocimiento;
  - `tono` mide el trato y la brevedad.

  Compará contra la última corrida publicada en `src/content/eval/rag-answers.json`.
- **Umbrales para publicar:** los de `PUBLISH_THRESHOLD`, en `src/domain/eval-summary.ts`. No los copies: leelos ahí.
- **Si baja una métrica:** mirá los casos que fallaron y el tipo de caso (`no_en_kb`, `premisa_falsa`…) antes de tocar el prompt otra vez. Cada iteración es una corrida nueva y cuesta plata: explicá qué cambiás y por qué.
- **Detector de derivaciones:** el resumen también dice si contó bien las derivaciones (spec 016).

## Cerrar

- Si pasa, el dueño mergea la rama de resultados por PR. Ese PR publica el resumen en la portada y en `/como-medimos`.
- En el PR del cambio, poné las métricas antes y después en "Cómo se probó".
