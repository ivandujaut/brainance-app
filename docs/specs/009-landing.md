# 009 — Landing con personalidad

- **Estado:** Implementada (2026-10-07)
- **ADRs relacionados:** [0005 — Design system con tokens de marca](../adr/0005-design-system-tokens-de-marca.md)

## Problema

La portada de la spec 008 cumplía (español, sin planes ni blog), pero se veía genérica: tipografía y tarjetas de plantilla, sin voz propia. Para un negocio que llega por primera vez, eso le resta confianza.

## Decisiones

- **Dirección editorial cálida:**
  - paleta "papel" (crema, tinta y el naranja de marca), sobre los mismos tokens semánticos y con una variante oscura;
  - titulares en serif display (Fraunces) con un remate en itálica, y detalles en mono;
  - textos con voz argentina ("Tu negocio responde a las 3 de la mañana. Vos dormís.").
- **El producto es el protagonista:**
  - el hero muestra una **captura de la bandeja real**: la de una panadería ficticia, con la lista de conversaciones y una charla abierta donde el bot respondió y la dueña tomó el control;
  - tres marcas numeradas sobre la captura señalan lo que importa (la conversación que pide una persona, las respuestas del interesado y la toma de control), con su explicación debajo;
  - hay una captura para el modo claro y otra para el oscuro.
- **Por qué una captura y no una demo animada.** La primera versión mostraba el widget conversando solo, con guiones. Se descartó porque el texto que aparece palabra por palabra es justo el recurso que hoy se asocia con "landing hecha con IA". Además, mostraba lo que ve el visitante. A quien decide le importa más lo que ve el dueño: los contactos y las conversaciones que lo necesitan.
- **La captura sale del código, no de un recorte a mano.** `npm run landing:screens` renderiza el layout y la página reales de la bandeja con datos de ejemplo (`scripts/landing-screens/`). Las acciones del servidor, Clerk y la navegación se reemplazan por mocks. Después compila Tailwind solo para ese HTML y lo fotografía con Playwright en claro y en oscuro. Si cambia la bandeja, se regenera con un comando y la portada nunca muestra una pantalla vieja. Para que la captura se viera como la portada, el menú lateral y el panel de ingreso pasaron a los tokens y usan el logotipo en Fraunces (`Wordmark`).
- **Hairline** (`@lucasmarkes/hairline`, MIT, sin dependencias) ilustra "Cómo funciona" con figuras de línea que responden al puntero: tarjetas (las preguntas frecuentes), ventana en capas (tu sitio con el chat) y cinta (los contactos que llegan). Se tematizan con los tokens.
- **Aceternity, un solo efecto sutil, recreado con `motion`:** el borde que se ilumina bajo el puntero en las tarjetas. No se usó el registro de Aceternity: estaba bloqueado por la red del entorno de desarrollo. Además, sus efectos más conocidos (rayos, spotlight, gradientes animados) son justo lo que hoy hace que una landing parezca plantilla.

## Criterios de aceptación

1. **Dado** la portada, **entonces** el hero muestra la captura de la bandeja real con texto alternativo, y la explicación de sus tres marcas.
2. **Dado** `prefers-reduced-motion`, **entonces** las tarjetas no tienen el efecto de borde.
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
