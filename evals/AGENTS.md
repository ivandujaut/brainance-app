# Evals

Reglas para `evals/`. Las generales están en el [`AGENTS.md` de la raíz](../AGENTS.md). El detalle del eval de respuestas está en [`evals/rag-answers/README.md`](rag-answers/README.md).

- **Cuándo se corre:** cuando cambia un prompt o un modelo (ADR 0001). Sin eval, el cambio no se mergea.
- **Dónde se corre:**
  - Local, con `npm run eval:rag -- --variant <id> --model <gateway-id>`, si hay una clave del AI Gateway en `.env.local`.
  - En Actions, con el workflow "Correr eval de respuestas" (`.github/workflows/eval.yml`), que usa el secret `AI_GATEWAY_API_KEY`. Una corrida completa cuesta unos US$ 2 a 4, sobre todo por el juez.
- **Qué se publica:** `npm run eval:publish` escribe `src/content/eval/rag-answers.json`. Se publica solo si se cumplen los umbrales de `PUBLISH_THRESHOLD`, en `src/domain/eval-summary.ts`. Consultalos ahí y no los copies a otro archivo.
- **Los resultados de Actions llegan en una rama `eval/rag-answers-<fecha>-<corrida>`.** Se revisan y se mergean por PR.
