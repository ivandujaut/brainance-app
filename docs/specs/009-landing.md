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
  - el hero muestra el **widget real** (el mismo componente que ven los visitantes, en modo vista previa) con una conversación guionada de tres negocios ficticios: panadería, taller e inmobiliaria;
  - cada guion termina en un resultado para el dueño: un contacto nuevo, o una conversación que necesita atención porque el bot derivó en lugar de inventar.
- **Hairline** (`@lucasmarkes/hairline`, MIT, sin dependencias) ilustra "Cómo funciona" con figuras de línea que responden al puntero: tarjetas (las preguntas frecuentes), ventana en capas (tu sitio con el chat) y cinta (los contactos que llegan). Se tematizan con los tokens.
- **Aceternity, solo dos efectos sutiles, recreados con `motion`:**
  - la respuesta que se genera palabra por palabra;
  - el borde que se ilumina bajo el puntero en las tarjetas.

  No se usó el registro de Aceternity: estaba bloqueado por la red del entorno de desarrollo, y además sus efectos más conocidos (rayos, spotlight, gradientes animados) son justo lo que hoy hace que una landing parezca plantilla.

## Criterios de aceptación

1. **Dado** la portada, **entonces** el hero muestra el widget real conversando, con pestañas para elegir el negocio de ejemplo. La conversación avanza sola y se detiene si la demo no está visible.
2. **Dado** `prefers-reduced-motion`, **entonces** la demo muestra la conversación completa y su resultado sin animar, y las tarjetas no tienen el efecto de borde.
3. **Dado** la paleta "papel", **entonces** todos los pares fondo/texto cumplen AA en claro y en oscuro (test de tokens).
4. **Dado** un celular de 390 px, **entonces** no hay desplazamiento horizontal.
5. **Dado** las páginas legales, **entonces** usan la misma paleta y tipografía.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1, 2 | E2E sin Clerk: la demo reproduce, cambia de negocio y respeta el movimiento reducido | `e2e/public.spec.ts` |
| 3 | Unitario: contraste de `.theme-paper` y `.dark .theme-paper` | `src/styles/design-tokens.test.ts` |
| 4, 5 | Revisión con capturas en escritorio, celular, claro y oscuro | — |
