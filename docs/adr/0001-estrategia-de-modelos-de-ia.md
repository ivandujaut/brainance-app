# 0001 — Estrategia de modelos de IA (generación, embeddings y routing)

- **Estado:** Propuesto. Pendiente de validar con el eval set en español.
- **Fecha:** 2026-10-01

## Contexto

El bot de cada tenant tiene que hacer cuatro tipos de trabajo con exigencias muy distintas:

| Trabajo | Ejemplo | Qué exige |
|---|---|---|
| FAQ repetida | "¿A qué hora abren?" | Nada: la respuesta ya existe |
| Respuesta con RAG | "¿Hacen envíos a Córdoba?" sobre los documentos del tenant | Buena lectura de contexto en español |
| Herramientas | Guardar el email del lead, reservar un turno | Tool calling confiable |
| Escalado / casos complejos | Quejas, pedidos ambiguos, resumen para el agente humano | Criterio y redacción |

El objetivo es la mejor relación precio/calidad por request: cada tipo de trabajo debería usar el modelo más barato que lo resuelve bien.

> **Sobre los precios:** salen de las páginas oficiales consultadas el 2026-10-01 (muchos, a través de resúmenes de búsqueda). Hay que reconfirmarlos antes de cerrar los precios de los planes. Los de Gemini 3.6 Flash son introductorios hasta el 31-dic-2026.

## Mercado relevado (USD por millón de tokens, entrada / salida)

| Proveedor | Económico | Intermedio | Alto |
|---|---|---|---|
| Anthropic | Haiku 4.5: $1 / $5 | Sonnet 5.5: $2 / $10 | Opus 5.5: $4 / $20 |
| OpenAI | GPT-5.6 Luna: $0.20 / $1.20 | GPT-5.6 Terra: $2 / $12 | GPT-5.6 Sol: $4 / $20 (promoción) |
| Google | Gemini 3.5 Flash-Lite: $0.30 / $2.50 | Gemini 3.6 Flash: $0.75 / $3.75 (sube a $1.50 / $7.50 en 2027) | Gemini 3.1 Pro: $2 / $12 |
| DeepSeek | V4.1-Flash: $0.15 / $0.60 (horario valle) | V4-Pro: $0.66 / $1.98 | — |
| Mistral | Small 4: $0.15 / $0.60 | Medium 3.5: $1.50 / $7.50 | — |

Todos ofrecen caché de prompt (la parte cacheada se cobra alrededor de 0.1x). DeepSeek procesa los datos en China, así que no conviene usarlo por defecto en un SaaS multi-tenant.

**No hay benchmarks públicos confiables de estos modelos en español rioplatense o latinoamericano.** Por eso la decisión final depende de un eval propio (ver más abajo).

## ¿Embeddings de OpenAI y generación con Claude?

**Sí, se pueden combinar sin problema.** El modelo de embeddings solo convierte texto en vectores para buscar en pgvector. El modelo que redacta la respuesta recibe los fragmentos ya recuperados como texto, así que no importa qué proveedor generó los vectores.

La restricción real es otra: **cambiar de modelo de embeddings obliga a re-embeddear toda la base de conocimiento.** Por eso:

- Cada fila de embeddings guarda el `embeddingModel` y las dimensiones.
- La elección se hace con datos (recall@5 sobre preguntas reales en español), no por marca.

| Modelo | USD/MTok | Notas |
|---|---|---|
| Voyage voyage-4-lite | $0.02 | Multilingüe, dimensiones ajustables (Matryoshka). Son los embeddings que recomienda Anthropic. 200M tokens gratis por cuenta |
| Voyage voyage-4 | $0.06 | Mayor calidad, mismo espacio vectorial que 4-lite |
| OpenAI text-embedding-3-small | $0.02 | Correcto, pero no es líder en multilingüe |
| OpenAI text-embedding-3-large | $0.13 | Mejor que small, más caro |
| BGE-M3 (open source) | autoalojado | Muy bueno en multilingüe; suma infraestructura |

**Propuesta:** arrancar con **voyage-4-lite a 1024 dimensiones** y compararlo en el eval contra text-embedding-3-small. Ingestar los documentos de un tenant típico (~500k tokens) cuesta centavos, o nada mientras dure la cuota gratuita. Para mejorar la precisión, se puede sumar después un reranker barato (Voyage rerank-2.5-lite, $0.02/MTok).

## Routing por tier

| Tier | Cuándo | Candidatos a evaluar | Fallback |
|---|---|---|---|
| **T0: caché semántica** | La pregunta se parece mucho (≥0.92) a una ya respondida por ese tenant | Sin LLM: pgvector | — |
| **T1/T2: rápido** | Saludos, FAQ, respuestas con RAG | Claude Haiku 4.5 · GPT-5.6 Luna · Gemini 3.5 Flash-Lite | Otro del mismo tier |
| **T3: herramientas** | Captura de lead, reservas | Claude Sonnet 5.5 · Gemini 3.6 Flash · GPT-5.6 Terra | Otro del mismo tier |
| **T4: escalado** | Quejas, ambigüedad, resumen para el humano | Claude Sonnet 5.5 (esfuerzo alto) · Opus 5.5 | — |

**El router de la beta es por reglas, no un modelo:**

- Si el flujo necesita una herramienta → T3.
- Si hay señales de escalado (palabras clave, pedido explícito, varios turnos sin resolver) → T4.
- En cualquier otro caso → T1/T2.

Los routers entrenados (Not Diamond, OpenRouter Auto, RouteLLM) suman latencia y otro proveedor. Se evalúan recién con tráfico real.

**Para la beta conviene empezar con dos modelos como máximo, más la caché semántica.**
- La caché de prompt es por modelo: cuantos menos modelos, más se reutiliza.
- Un modelo moderno con esfuerzo bajo muchas veces rinde igual que una cascada más compleja.
- El costo se mide por conversación resuelta, no por request.

### Costo estimado por 1.000 conversaciones

Supuestos:
- 6 turnos por conversación.
- System prompt del tenant cacheado (1.500 tokens), 2.350 tokens de contexto variable y 150 de salida por turno.
- Reparto: T0 20%, T1 25%, T2 35%, T3 15%, T4 5%.

| Escenario | Costo por 1.000 conversaciones | Por conversación |
|---|---|---|
| Económico (Luna + Gemini 3.6 Flash + Sonnet 5.5 para escalado) | ≈ $11 | ≈ $0.011 |
| Calidad (Luna + Haiku 4.5 + Sonnet 5.5 + Opus 5.5 para escalado) | ≈ $28 | ≈ $0.028 |
| Todo en Haiku 4.5, sin routing | ≈ $23 | ≈ $0.023 |
| Todo en Sonnet 5.5, sin routing ni caché | ≈ $46 | ≈ $0.046 |

Con estos números, una beta con ~5.000 conversaciones al mes cuesta entre $55 y $140 de IA según el escenario. La diferencia entre escenarios empieza a importar a escala.

## Jev (TypeSafe AI)

TypeSafe AI salió de stealth el 15-sep-2026. Jev es un **"modelo de decisiones", no un LLM conversacional: no genera texto.** Recibe un estado y preguntas tipadas (`choice`, `score`, sí/no) y devuelve valores con una probabilidad calibrada.

Datos públicos:
- Precio: unos $0.042/MTok de entrada.
- Latencia: 70–500 ms.
- Contexto: 32K.
- Disponible por Vercel AI Gateway y OpenRouter.
- SDK de TypeScript.

**No sirve como modelo del chatbot**, porque no puede redactar respuestas. **Sí podría servir más adelante como clasificador:** decidir el tier, detectar spam o fuera de tema, puntuar leads, decidir el escalado.

Por ahora queda **en observación, no en la beta**:
- Tiene unas dos semanas en el mercado.
- Hay reportes de errores 429 masivos desde el 26-sep y altas pausadas.
- No hay SLA ni política de retención de datos publicada.
- No hay documentación sobre su rendimiento en español.
- Sus benchmarks son propios (67.8% contra 74.1% del mejor comparado).

Se reevalúa en la v1, con el eval set, contra un clasificador hecho con un LLM económico y salida estructurada.

## Decisión propuesta

1. **SDK y gateway:** AI SDK de Vercel con **Vercel AI Gateway**. Es un solo endpoint para todos los proveedores, sin comisión sobre el precio de lista, con BYOK, fallbacks entre proveedores y trazas OpenTelemetry. Toda llamada pasa por un adaptador en `src/server/ai/` para no acoplarse al SDK.
2. **Embeddings:** voyage-4-lite (1024 dimensiones) en pgvector, con el modelo registrado por fila.
3. **Generación:** dos tiers (rápido y agente) más la caché semántica por tenant. Los modelos concretos se eligen con el eval.
4. **Eval set antes de elegir:** entre 100 y 200 preguntas reales en español de 3 o 4 negocios de ejemplo, con respuestas esperadas. Mide exactitud, alucinaciones, tono, éxito de las herramientas, costo y latencia por tier. Vive en `evals/` y corre ante cada cambio de prompt o de modelo.
5. **Medición:** cada request registra tier, modelo, tokens (incluidos los cacheados), costo y latencia.

## Consecuencias

- **Se gana:** cambiar o combinar proveedores pasa a ser configuración, no reescritura. El costo queda medido por tier desde el día uno.
- **Se pierde:** algo de simplicidad respecto de usar un único SDK de un proveedor. Mitigación: el adaptador es una capa delgada.
- **Siguiente paso:** escribir la spec "Respuestas con IA" y el eval set.
