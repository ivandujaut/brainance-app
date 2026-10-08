# 013 — Portada con la promesa y sus pruebas

- **Estado:** Implementada (2026-10-08). Eval publicado el 2026-10-08: correcta 98 %, sin inventar 95 %, tono 100 % (tercera corrida, después de dos ajustes del prompt).
- **ADRs relacionados:** [0001 — Estrategia de modelos de IA](../adr/0001-estrategia-de-modelos-de-ia.md) (el eval), [0005 — Design system](../adr/0005-design-system-tokens-de-marca.md)
- **Specs relacionadas:** [009 — Landing](009-landing.md) (la portada actual, su diseño y sus capturas), [001 — Respuestas con IA](001-respuestas-con-ia.md) (el eval de 75 casos), [010 — Aviso al dueño](010-aviso-al-dueno.md), [011 — Tope y métricas](011-tope-visible-y-metricas-de-honestidad.md), [012 — Marcar como atendida](012-marcar-como-atendida.md), [008 — Lanzamiento](008-lanzamiento-de-la-beta.md) (términos)
- **Posicionamiento:** es la spec del "titular y portada nuevos" de [Decisiones que se derivan](../posicionamiento.md#decisiones-que-se-derivan). Cierra la segunda y la tercera prueba: el eval publicado y qué pasa cuando termina la beta.

## Problema

La portada de la spec 009 tiene buen diseño, pero cuenta lo que el mercado ya dice. Su titular, "Tu negocio responde a las 3 de la mañana. Vos dormís.", es la frase de todos los competidores ([mercado, sección 2](../mercado/2026-10-chat-ia-pymes.md)). Las tres pruebas ya existen en el producto (el aviso, las métricas de honestidad, el tope visible), pero la portada no las muestra. El eval no está publicado, y nadie sabe qué pasa cuando termina la beta gratuita. Con un 64 % de personas que desconfían de la IA en la atención, un dueño que llega por primera vez necesita pruebas, no adjetivos.

## Historias de usuario

- Como **dueño de un negocio chico que atiende solo**, quiero entender en segundos qué problema me resuelve, en mis palabras, sin tener que saber qué es un chatbot.
- Como **dueño**, quiero ver pruebas de que el bot no le inventa respuestas a mis clientes antes de ponerlo en mi sitio.
- Como **dueño**, quiero saber qué pasa cuando termine la beta antes de invertir tiempo en configurarlo.

## Decisiones que necesitan tu confirmación

Cada una tiene una propuesta. Si no se cambia en la revisión del PR, se implementa así.

1. **Titular.** Propuesta: la promesa textual, "Ningún cliente sin respuesta." con el remate en degradé brasa "Y vos te enterás solo cuando hace falta.". Alternativas: "Contesta lo que sabe. Lo que no, te lo pasa a vos." o "Atiende tu sitio cuando vos no podés. Lo que no sabe, no lo inventa.".
2. **Qué pasa cuando termina la beta.** Propuesta:
   - la beta es gratis;
   - antes de que termine, avisamos por email con **30 días** de anticipación y con el precio;
   - el precio es **uno por local, en pesos, con el tope que ponés vos** (lo que ya dice el posicionamiento), sin número todavía;
   - como no pedimos tarjeta, no se cobra nada automáticamente: seguís solo si aceptás;
   - si no seguís, el chat deja de responder y te llevás tus contactos en CSV (spec 005).
3. **Términos.** La garantía anterior se agrega a los términos (sección "Beta gratuita"). Se sube `TERMS_VERSION`, así que los dueños actuales aceptan de nuevo con el flujo de la spec 008. Conviene que lo revise quien redacta los términos.
4. **Umbral para publicar el eval.** Propuesta: la portada solo publica el eval si **"Sin inventar" llega al 95 %** y **"Correcta" al 85 %** en la corrida completa. Si no llega, primero se mejora el prompt (con su propio eval, ADR 0001) y la sección de la segunda prueba sale sin números, con el link a cómo medimos.

## Criterios de aceptación

Cada criterio se convierte en al menos un test.

### El mensaje

1. **Dado** la portada, **entonces** el `h1` es el titular elegido (decisión 1). Ningún título (`h1` o `h2`) dice "IA", "inteligente", "automatizá", "24/7" ni "3 de la mañana". La IA se nombra solo en textos secundarios.
2. **Dado** la portada, **entonces** las secciones van en este orden: la promesa (hero), el problema, las tres pruebas, cómo funciona, la beta y el precio, y el cierre.
3. **Dado** la sección del problema, **entonces** el título es una frase del dueño ("Me escriben a cualquier hora y, si no contesto, se van a otro."). La pared de preguntas de la spec 009 se mantiene, pero algunas píldoras muestran una consulta derivada ("Te la pasó a vos") además de las respondidas.
4. **Dado** los metadatos de la portada (título y descripción para buscadores y para compartir), **entonces** dicen la promesa y no "Chatbots con IA".

### Las tres pruebas

5. **Primera prueba, el aviso.** **Dado** la sección, **entonces** muestra un ejemplo del email (spec 010) con su asunto ("Un cliente de panaderia-ejemplo.com.ar espera tu respuesta"), el motivo y el link para tomar el control, y explica en una línea que avisa una vez, recuerda una sola vez y se puede marcar como atendida (spec 012).
6. **Segunda prueba, la honestidad.** **Dado** la sección, **entonces** muestra los números del eval publicado: el porcentaje de respuestas "sin inventar" y "correctas", sobre cuántas consultas, con qué modelo y en qué fecha. Muestra también cómo se ven las fichas de honestidad del panel (spec 011) y un link a **Cómo lo medimos**.
7. **Dado** los números del eval, **entonces** la página los lee de un archivo generado por la última corrida commiteada (`src/content/eval/rag-answers.json`), nunca escritos a mano. Si el archivo no cumple el umbral de la decisión 4, la sección sale sin números (criterio 6) y un test lo verifica.
8. **Tercera prueba, el tope.** **Dado** la sección, **entonces** muestra cómo se ve el uso del día ("Hoy: 12 de 300 respuestas", con su barra), dice que el dueño fija su propio tope y que al llegar "no se apaga: deriva a tu contacto".

### La beta y el precio

9. **Dado** la sección "Qué pasa cuando termine la beta", **entonces** dice exactamente lo que se decida en la decisión 2. Su `id` permite enlazarla (`/#beta`), y el footer la enlaza.
10. **Dado** los términos, **entonces** la sección "Beta gratuita" dice lo mismo que la portada y `TERMS_VERSION` sube (decisión 3).

### Cómo lo medimos

11. **Dado** la página pública `/como-medimos`, **entonces** explica en castellano llano:
    - qué se mide: 75 consultas sobre 5 negocios ficticios argentinos, de cinco tipos (respondibles, sin el dato, varias preguntas juntas, premisa falsa y fuera de tema);
    - cómo se califica: un modelo juez revisa cada respuesta con tres criterios (correcta, sin inventar y tono), y cada consulta se corre dos veces;
    - los resultados por tipo de consulta, del mismo archivo que la portada;
    - los límites: las consultas no salen de tráfico real, el juez también es una IA y el margen de error es de unos ±8 puntos;
    - cuatro o cinco ejemplos con la consulta, la respuesta y la calificación, incluida una que haya fallado si la hay.
12. **Dado** esa página, **entonces** es estática y sin Clerk, como `/terminos` (`proxy.ts` no le aplica el middleware), y el footer la enlaza en Producto.

### Que no se rompa lo de la spec 009

13. **Dado** el hero, **entonces** las capturas del panel se regeneran (`npm run landing:screens`) con las fichas de honestidad de la spec 011 en el dashboard. Un texto chico debajo dice "Panel de ejemplo, con datos ficticios.".
14. **Dado** un celular de 390 px, movimiento reducido y la paleta papel, **entonces** se siguen cumpliendo los criterios 2, 3 y 4 de la spec 009.

## Fuera de alcance

- **Precio con número y cobro.** El precio se anuncia cuando se decida, con el aviso de 30 días. El cobro (Mercado Pago u otro) es v1.
- **Métricas agregadas de la beta en la portada**, como "los bots derivaron el 8 % de las consultas esta semana". Con pocos sitios y de prueba, el número no dice nada. Se evalúa cuando haya tráfico real.
- **Cambiar el nombre o el dominio.** Sigue BrAInance (posicionamiento).
- **Casos de clientes y testimonios:** no hay todavía.
- **Una versión en inglés.**
- **Cambiar el prompt o el modelo** para llegar al umbral. Si hace falta, va en su propio PR con su eval.

## Notas técnicas

- **Correr el eval en GitHub Actions.** El eval necesita `AI_GATEWAY_API_KEY`, que no está en el entorno de desarrollo. Se agrega `.github/workflows/eval.yml` ("Correr eval de respuestas", a mano):
  - entradas: modelo (por defecto el de producción, `anthropic/claude-haiku-4.5`), repeticiones (2) y "aprobar harness";
  - usa el secret `AI_GATEWAY_API_KEY`: una API key del AI Gateway de Vercel que el dueño carga en GitHub, como los de Neon;
  - corre `npm run eval:rag`, después `npm run eval:publish`, y sube los resultados y el JSON a una rama `eval/rag-answers-<fecha>` para abrir un PR (`permissions: contents: write`);
  - costo estimado de una corrida completa: unos US$ 2 a 4, sobre todo por el juez (Opus 5.5). Entra en el crédito y el límite mensual del AI Gateway.
- **`npm run eval:publish`** (`tsx evals/rag-answers/publish.mjs`, como `eval:rag`): lee los `results.jsonl` de la variante con el modelo de producción y `cases.json`, y escribe `src/content/eval/rag-answers.json` con fecha, modelo, cantidad de consultas y repeticiones, los porcentajes por métrica, el desglose por tipo y los ejemplos elegidos. No lleva trazas ni datos de costo. El script solo lee y escribe archivos; la cuenta la hace el dominio.
- **Dominio puro** (`src/domain/eval-summary.ts`): `summarizeEval(rows, cases)` arma el resumen, `meetsPublishThreshold(summary)` aplica la decisión 4, y el formato de los porcentajes. Todo con tests unitarios.
- **Portada** (`src/app/(public)/page.tsx` y `src/components/landing/`):
  - la sección de las tres pruebas reemplaza al bento "Qué hace por vos" y reutiliza su forma y las figuras de Hairline (la rama para la derivación y el teléfono para el aviso; para el tope, una figura nueva de la misma familia);
  - los ejemplos del email, de las fichas y del uso del día son componentes de la portada con los tokens, no capturas: así se leen bien en el celular y cambian junto con el texto;
  - "te pasa los contactos" queda en "Cómo funciona", que ya lo tiene.
- **Términos:** `src/content/legal/terminos.md` y `TERMS_VERSION` en `src/domain/legal.ts`.
- **Rutas:** `/como-medimos` en el grupo `(public)`, y su entrada en el bypass de `proxy.ts` junto a `/terminos`.
- **Riesgos:**
  - *El eval no llega al umbral.* La portada sale igual con las otras dos pruebas y sin números en la segunda. Se informa y se decide si mejorar el prompt antes.
  - *El eval no es tráfico real.* Lo decimos en la página: es la ventaja de publicarlo y no esconderlo. Cuando haya consultas reales, se suman casos.
  - *Prometer el aviso de 30 días* es un compromiso: queda en los términos, no solo en la portada.

## Decisiones de la implementación

- **Las cuatro decisiones quedaron como estaban propuestas.** `TERMS_VERSION` pasa a `2026-10-07.2`.
- **El set tiene 76 consultas de seis tipos**, no 75 de cinco: incluye una que sigue una conversación anterior (`historial`). `/como-medimos` toma la cantidad y los tipos de `evals/rag-answers/cases.json`, así no quedan escritos a mano.
- **Las tres pruebas no llevan figuras de Hairline.** Los ejemplos del email, de las fichas y del uso del día ya son la imagen de cada prueba, y una figura al lado competía con ellos. Hairline sigue en "Cómo funciona". El bento "Qué hace por vos" se quitó; "te pasa los contactos" queda en "Cómo funciona".
- **El ejemplo del email sale de `buildAttentionEmail`**, el mismo código que arma el email real (spec 010). Las fichas usan `StatTile` del panel y el uso del día, `usageState` (spec 011).
- **Las respuestas del bot para los ejemplos** están en las trazas del eval, que no se commitean. Por eso `eval:publish` corre en el mismo job que el eval.
- **La pared de preguntas** marca las derivadas con una flecha y "a vos"; "Te la pasó" queda para lectores de pantalla, para que la píldora no se corte en la columna derecha.
- **El titular** va un tamaño más chico que el de la spec 009 y con líneas balanceadas, porque es más largo.
- **El footer** cambió su frase a "El chat de tu sitio que contesta lo que sabe y te pasa a vos lo que no."
- **Las capturas del hero** se regeneraron con las fichas de honestidad (`PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run landing:screens` en el entorno de desarrollo).

## El eval publicado

Haiku 4.5, 76 consultas × 2, Opus 5.5 de juez. El umbral se alcanzó en la tercera corrida:

| Corrida | Prompt | Correcta | Sin inventar | Tono |
|---|---|---|---|---|
| 1 | El de `develop` | 97 % | 88 % | 76 % |
| 2 | Sin agregados razonables, sin "hoy", usted estricto | 98 % | 93 % | 99 % |
| 3 | La parte que no sabe en una sola oración, sin extender políticas, el contacto en su horario | 98 % | 95 % | 100 % |

- Los errores de la corrida 1 eran inventos chicos que acompañaban respuestas correctas ("depende de varios factores", "lo anunciamos en redes", "hoy atendemos hasta las 20") y voseo en negocios de usted.
- El punto flojo que queda es la consulta cuyo dato no está cargado (83 % sin inventar): el bot a veces supone qué no hace el negocio. Se ve en la tabla por tipo de `/como-medimos`, y uno de sus ejemplos es una respuesta fallada.
- **Pendiente para el próximo cambio de prompt** (QA en la preview, 2026-10-08): el bot a veces deriva con "No tengo esa información en la base de datos", que suena técnico para un cliente. Pedirle que no nombre la base ni sus instrucciones. No justifica una corrida del eval por sí solo; va junto con el próximo cambio que la necesite.
- El prompt se ajustó mirando los errores de este mismo set, así que el número puede ser optimista. `/como-medimos` lo dice entre los límites; el próximo paso es sumar consultas que el bot no haya visto, de tráfico real cuando lo haya.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1, 2, 3, 9, 12 | E2E sin Clerk: el `h1`, títulos sin palabras prohibidas, el orden de las secciones, la pared con una derivada, `/#beta` y los links del footer | `e2e/public.spec.ts` |
| 4 | Unitario de los metadatos de la portada | `src/app/(public)/page.test.tsx` |
| 5, 6, 8 | Render de la portada: el ejemplo del email, las fichas, los números del eval y el uso del día | `src/app/(public)/page.test.tsx` |
| 7 | Unitario: el resumen a partir de filas de ejemplo de `results.jsonl`, el umbral y el formato; render sin números con un resumen que no llega | `src/domain/eval-summary.test.ts`, `src/app/(public)/page.test.tsx` |
| 10 | Unitario: los términos mencionan el aviso de 30 días y la versión subió | `src/domain/legal.test.ts` |
| 11, 12 | E2E sin Clerk: `/como-medimos` carga sin sesión, muestra los resultados por tipo y los límites | `e2e/public.spec.ts` |
| 13, 14 | Revisión con capturas en escritorio y celular; los E2E de la spec 009 siguen pasando | `e2e/public.spec.ts` |
