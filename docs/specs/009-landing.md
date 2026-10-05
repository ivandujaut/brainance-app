# 009 — Landing con personalidad

- **Estado:** Implementada (2026-10-07)
- **ADRs relacionados:** [0005 — Design system con tokens de marca](../adr/0005-design-system-tokens-de-marca.md)

## Problema

La portada de la spec 008 cumplía (español, sin planes ni blog), pero se veía genérica: tipografía y tarjetas de plantilla, sin voz propia. Para un negocio que llega por primera vez, eso le resta confianza.

## Decisiones

- **Dirección editorial cálida:**
  - paleta "papel" (crema, tinta y el naranja de marca), sobre los mismos tokens semánticos y con una variante oscura;
  - la tipografía original de la marca (Plus Jakarta Sans) en todo el sitio: titulares en negrita con el remate en color atenuado. Se probó una serif de titulares (Fraunces) y se descartó para respetar la identidad original;
  - textos con voz argentina ("Tu negocio responde a las 3 de la mañana. Vos dormís.").
- **El producto es el protagonista:**
  - el hero muestra **capturas del panel real** de una panadería ficticia: el dashboard con sus métricas y, delante, la bandeja con una charla donde el bot respondió y la dueña tomó el control;
  - la composición sigue a los heros de producto de Aceternity:
    - texto centrado arriba;
    - las dos pantallas como planos inclinados en perspectiva, uno detrás del otro;
    - un brillo diagonal y una máscara que disuelve los bordes en el fondo;
  - se usan las capturas claras en los dos temas, porque sobre la portada oscura son lo que atrae la mirada;
  - al cargar, los planos suben y aparecen una vez. Con movimiento reducido no se animan.
- **Cómo se armó la perspectiva.** Cada plano lleva la inclinación completa (`perspective()` y rotaciones) y gira sobre el centro del escenario, en lugar de compartir un contexto `preserve-3d`. Así los navegadores aplican la máscara de los bordes, que ignoran sobre capas 3D. El escenario tiene tamaño fijo y se escala según el ancho, así la inclinación se ve igual en el celular y en el escritorio.
- **Por qué una captura y no una demo animada.** La primera versión mostraba el widget conversando solo, con guiones. Se descartó porque el texto que aparece palabra por palabra es justo el recurso que hoy se asocia con "landing hecha con IA". Además, mostraba lo que ve el visitante. A quien decide le importa más lo que ve el dueño: los contactos y las conversaciones que lo necesitan.
- **Las capturas salen del código, no de un recorte a mano.** `npm run landing:screens` renderiza el layout y las páginas reales de la bandeja y del dashboard con datos de ejemplo (`scripts/landing-screens/`). Las acciones del servidor, Clerk y la navegación se reemplazan por mocks. Después compila Tailwind solo para ese HTML y lo fotografía con Playwright en claro y en oscuro. Si cambia el panel, se regeneran con un comando y la portada nunca muestra una pantalla vieja. Para que la captura se viera como la portada, el menú lateral y el panel de ingreso pasaron a los tokens y usan el logotipo `Wordmark`.
- **Hairline** (`@lucasmarkes/hairline`, MIT, sin dependencias) ilustra "Cómo funciona" con figuras de línea que responden al puntero: tarjetas (las preguntas frecuentes), ventana en capas (tu sitio con el chat) y cinta (los contactos que llegan). Se tematizan con los tokens.
- **"Qué hace por vos" como bento, idea de las secciones de features de Aceternity:**
  - celdas anchas y angostas que se alternan, separadas por líneas finas;
  - cada beneficio con una figura isométrica de Hairline: un rack de cajones (responde con tus datos), una rama que se separa y vuelve (deriva en lugar de inventar), una antena (los contactos que llegan) y un teléfono en capas (el aviso);
  - al pasar el puntero, la barra junto al título crece y se pone naranja. Es CSS puro, sin `motion`, que se quitó de las dependencias.

  No se usó el registro de Aceternity, porque estaba bloqueado por la red del entorno de desarrollo; se tomó la idea, no el código. Sus efectos más conocidos (rayos, spotlight, gradientes animados) quedaron afuera: son justo lo que hoy hace que una landing parezca plantilla.

## Criterios de aceptación

1. **Dado** la portada, **entonces** el hero muestra las capturas del panel real y la de la bandeja tiene texto alternativo.
2. **Dado** `prefers-reduced-motion`, **entonces** los planos del hero no se animan y la barra de los beneficios cambia sin transición.
3. **Dado** la paleta "papel", **entonces** todos los pares fondo/texto cumplen AA en claro y en oscuro (test de tokens).
4. **Dado** un celular de 390 px, **entonces** no hay desplazamiento horizontal.
5. **Dado** las páginas legales, **entonces** usan la misma paleta y tipografía.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1 | E2E sin Clerk: la captura carga y se describe | `e2e/public.spec.ts` |
| 2 | Revisión manual con movimiento reducido | — |
| 3 | Unitario: contraste de `.theme-paper` y `.dark .theme-paper` | `src/styles/design-tokens.test.ts` |
| 4, 5 | Revisión con capturas en escritorio, celular, claro y oscuro | — |
