# Eval `rag-answers`: respuestas con la base de conocimiento

Mide qué tan bien responde cada modelo candidato a las consultas de los visitantes, usando solo la información del negocio. Es el eval de la [spec 001](../../docs/specs/001-respuestas-con-ia.md) y sirve para elegir el modelo del tier rápido del [ADR 0001](../../docs/adr/0001-estrategia-de-modelos-de-ia.md).

## Qué contiene

| Archivo | Qué es |
|---|---|
| `businesses/*.json` | 4 negocios argentinos ficticios con su base de conocimiento, tono (vos/usted) y contacto |
| `cases.json` | 60 consultas con el comportamiento esperado y los hechos que deben o no aparecer |
| `cases.md` | Vista legible de los casos (`npm run eval:rag:cases` la regenera y valida el set) |
| `run-eval.mjs` | Runner: llama a `answerQuestion` (`src/server/ai/answer.ts`, el mismo código que usará producción) y califica con un juez IA |
| `summarize.mjs` | Tabla resumen por variante y por tipo de caso |
| `results/_state.json` | Métricas, precios por modelo y archivos que forman el harness |

**Tipos de caso** (`tags[0]`): `respondible` (24), `no_en_kb` (12), `multiple` (8), `premisa_falsa` (8) y `fuera_de_tema` (8).

**Métricas** (cada una aprobada o no, calificadas por separado por el juez):
- `correcta`: cumple el comportamiento esperado, incluye lo pedido y no hace lo prohibido. **Es la métrica principal.**
- `sin_invento`: todo dato concreto sobre el negocio sale de la base de conocimiento.
- `tono`: español natural, trato correcto (vos o usted) y breve.

Además se registran el costo, la latencia, los tokens y la cantidad de palabras de cada respuesta.

**Alcance:** el bot recibe la base de conocimiento completa (no hay recuperación con embeddings). Los casos y los hechos esperados los generó Claude a partir de los negocios ficticios; conviene reemplazarlos o complementarlos con consultas reales cuando haya tráfico.

## Cómo correrlo

Requiere `AI_GATEWAY_API_KEY` en `.env.local` (Vercel → AI Gateway → API Keys). El juez es `anthropic/claude-opus-5.5` por defecto; se cambia con `EVAL_JUDGE_MODEL`.

**Aprobación del harness.** El runner se niega a correr si cambió algún archivo del harness (el propio runner, el prompt, los casos o los negocios) desde la última aprobación de esa carpeta de resultados. La primera corrida en cada carpeta, y la primera después de un cambio, lleva `--approve-harness`; pasalo solo después de revisar qué cambió.

### 1. Preparar las carpetas del chequeo y del piloto

```bash
for f in sanity pilot; do mkdir -p evals/rag-answers/$f && cp evals/rag-answers/results/_state.json evals/rag-answers/$f/; done
```

### 2. Chequeo del juez (centavos)

Respuestas fijas que deberían reprobar casi todo. Si `correcta` no da ~0%, el juez es demasiado permisivo:

```bash
npm run eval:rag -- --flow evals/rag-answers/sanity --model fixture/empty --approve-harness
npm run eval:rag -- --flow evals/rag-answers/sanity --variant v1 --model fixture/no-se
node evals/rag-answers/summarize.mjs evals/rag-answers/sanity
```

### 3. Piloto (5 casos)

```bash
EVAL_ONLY=ec-01,ec-07,cd-12,tr-11,in-14 npm run eval:rag -- --flow evals/rag-answers/pilot --model anthropic/claude-haiku-4.5 --approve-harness
```

Leer cada respuesta y su calificación en `pilot/baseline/results.jsonl` (campo `explanation`) y en `pilot/baseline/traces/`. Si alguna calificación no coincide con tu criterio, se ajusta la rúbrica (`JUDGE_SYSTEM` en `run-eval.mjs`) antes de la corrida completa.

### 4. Corrida completa por modelo

Cada modelo es una variante: `baseline`, `v1`, `v2`… Con 2 repeticiones, el margen de error de cada porcentaje es de unos ±9 puntos, así que diferencias menores no son concluyentes.

```bash
npm run eval:rag -- --variant baseline --model anthropic/claude-haiku-4.5 --reps 2 --approve-harness
npm run eval:rag -- --variant v1 --model openai/gpt-5.6-luna --reps 2
npm run eval:rag -- --variant v2 --model google/gemini-3.5-flash-lite --reps 2
npm run eval:rag -- --variant v3 --model openai/gpt-6-luna --reps 2
npm run eval:rag -- --variant v4 --model google/gemini-3.6-flash --reps 2
node evals/rag-answers/summarize.mjs
```

Si se corta, volver a correr el mismo comando retoma lo que falta. Los intentos fallidos (errores de API, timeouts, modelo servido distinto del pedido) van a `errors.jsonl` y no cuentan como respuestas incorrectas.

`gpt-6-luna` no tiene precio verificado: su costo aparece como "sin precio" hasta que se agregue en `results/_state.json`.

## Qué se commitea

`results/_state.json` y los `results.jsonl`/`errors.jsonl` de cada variante. Las transcripciones (`traces/`), los reportes generados y las carpetas `sanity/` y `pilot/` quedan fuera del repo (`.gitignore`).
