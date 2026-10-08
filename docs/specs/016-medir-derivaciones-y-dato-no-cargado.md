# 016 — Medir el detector de derivaciones y el caso del dato no cargado

- **Estado:** Borrador
- **ADRs relacionados:** [0001 — Estrategia de modelos de IA](../adr/0001-estrategia-de-modelos-de-ia.md) (no se cambia un prompt sin el eval)
- **Specs relacionadas:** [001 — Respuestas con IA](001-respuestas-con-ia.md) (el eval), [006 — Bandeja](006-bandeja-de-conversaciones.md) (el detector), [011 — Métricas de honestidad](011-tope-visible-y-metricas-de-honestidad.md) (el % derivado del panel), [013 — Portada con la promesa](013-portada-con-la-promesa.md) (el eval publicado)
- **Posicionamiento:** es la segunda prueba, "la honestidad medida". Hoy la sostienen dos números que miden menos de lo que parecen.

## Problema

**El 95 % del titular es un promedio que esconde el caso de la promesa.** La corrida publicada da 95,4 % de respuestas sin inventar. En "El dato no está cargado", que es exactamente "lo que no sabe no lo inventa", da **83 %** (25 de 30). El promedio lo sostienen los casos fáciles: en "La respuesta está cargada" da 100 %, y es la mitad del set. El umbral de publicación es 95 %, así que el número pasa por 0,4 puntos.

Las cinco fallas de ese tipo tienen el mismo patrón: **el bot estira lo que dice la base a algo que no figura**.

| Consulta | Lo que dice la base | Lo que respondió el bot |
|---|---|---|
| "¿Me pueden representar en una fiscalización de ARCA?" (2 de 2 repeticiones) | No representan en juicios ni hacen trámites jubilatorios | "No realizamos representación en fiscalizaciones" |
| "¿Toman IOMA?" | No atienden PAMI ni APROSS | "No atendemos IOMA" |
| "¿Cuánto cobran por liquidar sueldos de 3 empleados?" | Sin precio para ese servicio | "Depende de varios factores y se define en una consulta" |
| "¿Las remeras son 100 % algodón?" | Cada producto tiene su tabla de medidas | "La composición figura en la página del producto" |

El prompt ya prohíbe extender a un servicio lo que la base dice de otro, pero el modelo lo cumple con las afirmaciones y no con las **negativas** ni con las **políticas**.

**El % derivado del panel depende de un detector que nadie midió.** `detectAttention` decide que una respuesta "derivó" con reglas: la respuesta tiene que decir que le falta el dato **y** repetir un detalle del contacto. Si el modelo dice "no tengo ese dato" pero reformula el contacto de otra forma, no cuenta. En ese caso:

- el panel subestima las derivaciones;
- **el dueño no recibe el aviso** (spec 010).

El eval no lo mide: califica la respuesta del modelo, no lo que el producto hace con ella.

## Historias de usuario

- Como **dueño que evalúa el producto**, quiero ver qué tan bien responde el bot justo cuando no tiene el dato, no solo el promedio, para confiar en la promesa.
- Como **dueño**, quiero que el número de derivaciones del panel sea confiable, y saber cuánto, para no perder avisos.
- Como **equipo**, quiero que el eval mida también el detector, para no cambiar el prompt y romper los avisos sin darnos cuenta.

## Criterios de aceptación

Cada criterio se convierte en al menos un test. Los criterios 9 y 10 se verifican con la corrida del eval.

### El eval mide el detector

1. **Dado** una respuesta del eval, **entonces** el runner le aplica `detectAttention` con el contacto del negocio, el mismo código que usa producción, y guarda en `results.jsonl` el campo `detector` (`"derivation"`, `"human_request"` o `null`). Es determinístico: no usa al juez ni cuesta nada.
2. **Dado** una respuesta que el juez calificó **correcta**, **entonces** se sabe si el detector debió marcarla:
   - **debe derivar** si el comportamiento esperado es `abstain` (no tiene el dato) o `partial` (responde una parte y deriva la otra);
   - **no debe derivar** si es `answer` o `redirect`.

   Las respuestas incorrectas no cuentan: el modelo no hizo lo esperado, y no se puede saber qué debió marcar el detector.
3. **Dado** una corrida, **entonces** `summarize.mjs` y el resumen publicado muestran:
   - **cobertura:** de las respuestas que debían derivar, cuántas marcó el detector;
   - **falsas alarmas:** de las que no debían derivar, cuántas marcó.
4. **Dado** una respuesta que debía derivar y el detector no marcó, **entonces** aparece listada en el resumen de la corrida (`summarize.mjs`), con la pregunta y la respuesta, para corregir el detector o el prompt.

### Lo que se publica

5. **Dado** la portada, **entonces** la segunda prueba muestra, junto al total, el número de "El dato no está cargado": "Cuando el dato no estaba cargado, no inventó en el N % de los casos". El caso de la promesa no queda escondido en un promedio.
6. **Dado** `/como-medimos`, **entonces** suma una sección **"Cómo contamos las derivaciones"**: qué cuenta el panel como derivada, la cobertura y las falsas alarmas del detector en la última corrida, y qué pasa cuando el detector no marca una derivación (el dueño no recibe el aviso).
7. **Dado** un resumen publicado antes de esta spec, sin datos del detector, **entonces** las páginas no se rompen: la sección del criterio 6 dice que la medición empieza con la próxima corrida.
8. **Dado** el umbral de publicación (spec 013), **entonces** se agrega uno para el caso de la promesa: los números se publican solo si "El dato no está cargado" llega al **90 % sin inventar**, además de los umbrales actuales (95 % sin inventar y 85 % correctas en total).

### Mejorar el caso del dato no cargado

9. **Dado** el prompt, **entonces** suma dos reglas para los patrones de las fallas:
   - una negativa de la base vale solo para lo que nombra: si lo que preguntan no figura, se dice que no se tiene el dato, no que no lo hacen;
   - no se describe cómo se define un precio ni dónde figura un dato si la base no lo dice.

   Con eso, la corrida completa da **al menos 90 % sin inventar** en "El dato no está cargado", sin bajar de **95 % sin inventar** ni de **95 % correctas** en total.
10. **Dado** el set de casos, **entonces** suma **seis casos `no_en_kb` de "negativa cercana"**: preguntas sobre algo parecido a lo que la base niega, como "¿toman IOMA?" cuando la base solo niega PAMI. Así el patrón de falla se mide con más de un par de casos. Con los 6 nuevos, el set pasa a 82 casos.
11. **Dado** la corrida nueva, **entonces** la cobertura del detector es de al menos **90 %** y sus falsas alarmas, de **5 % o menos**. Si no llega, se ajusta el detector (`src/domain/attention.ts`) con las respuestas listadas por el criterio 4, con su test unitario.

## Fuera de alcance

- **Reemplazar el detector por un clasificador con IA** (ADR 0001, router v1). Primero se mide; si las reglas no alcanzan el criterio 11, se evalúa en otra spec.
- **Cambiar el modelo.** Haiku 4.5 sigue siendo el modelo; si el prompt no alcanza el criterio 9, se evalúa otro modelo en otra spec con su corrida.
- **Medir el detector de pedidos de persona (`human_request`)** contra el eval. Depende del texto del visitante, no del modelo, y ya tiene tests unitarios.
- **Casos reales de la beta.** Cuando haya tráfico, conviene sumar consultas reales al set (README del eval).

## Notas técnicas

- **Runner** (`evals/rag-answers/run-eval.mjs`):
  - importa `detectAttention` de `src/domain/attention.ts` y lo aplica en `runCase` con `business.contact`;
  - guarda `detector` en la fila;
  - cambiar el runner cambia el harness, así que la primera corrida lleva **Aprobar el harness**.
- **Resumen** (`src/domain/eval-summary.ts`):
  - `EvalRow` suma `detector?: string | null` y `meta.expected.behavior` (ya está en las filas).
  - `summarizeEval` calcula `detector: { shouldDerive, counted, shouldNotDerive, falseAlarms } | null`, que es null si ninguna fila tiene el campo.
  - `EvalSummarySchema` lo suma como opcional, para leer el archivo publicado hoy (criterio 7).
  - `meetsPublishThreshold` suma el umbral del criterio 8 sobre `byType`.
- **`summarize.mjs`:** imprime cobertura y falsas alarmas, y la lista del criterio 4.
- **Prompt** (`src/domain/answer-prompt.ts`): dos reglas nuevas en "Cómo responder", con su test en `answer-prompt.test.ts`. El texto exacto se ajusta con el piloto del eval antes de la corrida completa.
- **Casos** (`evals/rag-answers/cases.json`): seis casos nuevos, uno o dos por negocio, con `behavior: "abstain"` y `must_not` con la negativa inventada. `npm run eval:rag:cases` valida el set y regenera `cases.md`.
- **Corridas:** cada corrida completa cuesta unos US$ 2 a 4 y se lanza desde *Actions → Correr eval de respuestas*. Se espera una para medir y, si hace falta, una o dos más para ajustar. El resultado se publica con el PR que abre el workflow.
- **Riesgos:**
  - *El prompt mejora el caso y empeora otro:* la corrida completa lo detecta; por eso el criterio 9 pide no bajar los totales.
  - *Publicar menos:* con el umbral nuevo, si la corrida no llega al 90 %, la portada sale sin números. Es la decisión 1.

## Decisiones para confirmar en la revisión

1. **Umbral nuevo de publicación (criterio 8):** 90 % sin inventar en "El dato no está cargado". Con la corrida actual (83 %), la portada dejaría de mostrar números hasta que la corrida nueva llegue.
2. **Mostrar en la portada el número del caso de la promesa** (criterio 5), aunque sea más bajo que el total.
3. **Seis casos nuevos** de "negativa cercana" (criterio 10): cambian el set, así que los números nuevos no son directamente comparables con la corrida publicada.
4. **Gasto en el eval:** entre una y tres corridas completas, de unos US$ 2 a 4 cada una, con el crédito del AI Gateway.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 2, 3, 7, 8 | Unitario del resumen: cobertura, falsas alarmas, filas incorrectas fuera, archivo viejo sin detector, umbral por tipo | `src/domain/eval-summary.test.ts` |
| 5 | Unitario de la portada con el número del caso | `src/components/landing/proofs.test.tsx` |
| 6, 7 | Unitario de `/como-medimos` con y sin datos del detector | `src/components/landing/how-we-measure.test.tsx` |
| 9 | Unitario del prompt con las reglas nuevas | `src/domain/answer-prompt.test.ts` |
| 10 | Validación del set (`npm run eval:rag:cases`) | `evals/rag-answers/render-cases.mjs` |
| 11 | Unitario del detector con las respuestas que no marcaba, si hace falta ajustarlo | `src/domain/attention.test.ts` |
| 1, 4, 9, 10, 11 | Corrida completa del eval en Actions | `evals/rag-answers/results/baseline/` |
