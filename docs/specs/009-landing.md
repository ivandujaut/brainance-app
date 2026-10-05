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
- **Solo tema claro, por ahora.** Se quitan los selectores de tema de la portada y de la cuenta, y la app fuerza el tema claro: una preferencia oscura guardada antes se ignora. Los tokens oscuros (`.dark`, `.dark .theme-paper`) y su test de contraste se mantienen, así que reactivarlo es quitar `forcedTheme` y volver a poner el selector.
- **Paleta "Brasa" en el hero y el cierre.** Se compararon tres direcciones con degradé (Amanecer, Brasa y Atardecer pastel) sobre maquetas del hero, y se eligió Brasa:
  - resplandores difuminados naranja de marca, coral y ámbar detrás del hero y del bloque final; el resto de las secciones queda neutro para que se lea bien;
  - el remate del titular ("Vos dormís.", "Mañana ya responde.") va en un degradé brasa (`text-ember`);
  - el naranja de marca no alcanza contraste como texto sobre el papel, así que el degradé usa tonos más oscuros en claro y más claros en oscuro (`--ember-from` y `--ember-to`). El test de tokens exige 3:1, el mínimo AA para texto grande;
  - los resplandores (`--glow-1/2/3`, `--glow-opacity`) bajan de intensidad en oscuro y se desvanecen en los bordes de su sección.
- **El producto es el protagonista:**
  - el hero muestra **capturas del panel real** de una panadería ficticia: el dashboard con sus métricas y, delante, la bandeja con una charla donde el bot respondió y la dueña tomó el control;
  - la composición replica el hero de producto de Aceternity (plantilla Agenforce):
    - texto centrado arriba;
    - las dos capturas al ancho del contenedor, con la misma inclinación (`rotateY(20deg) rotateX(40deg) rotateZ(-20deg)`) y una perspectiva lejana (4000px) que las deja casi isométricas;
    - la de adelante corrida hacia arriba y a la derecha;
    - cada una se desvanece hacia su borde derecho e inferior: la de atrás desde el 20%, la de adelante desde el 50%;
  - se usan las capturas claras en los dos temas, porque sobre la portada oscura son lo que atrae la mirada;
  - al cargar, las capturas suben y aparecen una vez. Con movimiento reducido no se animan.
- **Cómo se armó con Tailwind 3.** El proyecto no tiene las utilidades `mask-*` ni `perspective-*` de Tailwind 4, así que se escriben como estilos equivalentes. La animación de entrada usa la propiedad `translate`, separada de `transform`, para no pisar la inclinación ni los desplazamientos. La composición se recorta en vertical y se funde con el fondo antes de la sección siguiente; en horizontal la recorta la página, para que llegue al borde de la ventana sin generar scroll.
- **Las capturas salen del código, no de un recorte a mano.** `npm run landing:screens` renderiza el layout y las páginas reales de la bandeja y del dashboard con datos de ejemplo (`scripts/landing-screens/`). Las acciones del servidor, Clerk y la navegación se reemplazan por mocks. Después compila Tailwind solo para ese HTML y lo fotografía con Playwright en claro y en oscuro. Si cambia el panel, se regeneran con un comando y la portada nunca muestra una pantalla vieja. Para que la captura se viera como la portada, el menú lateral y el panel de ingreso pasaron a los tokens y usan el logotipo `Wordmark`.
- **La franja del problema es una pared de preguntas.** Se probó un antes y después con el widget real sobre el sitio de una panadería, y se descartó: repetía lo que ya muestra el hero y el bloque no convencía. Se compararon dos maquetas (el comparador rediseñado y una pared de preguntas) y quedó la pared:
  - a la izquierda, "El que pregunta quiere la respuesta ahora, no el lunes." con el remate en degradé brasa, y dos datos: 24 h respondiendo y 1 línea para instalarlo;
  - a la derecha, píldoras con preguntas reales de distintos rubros, cada una con un tilde naranja, el rubro (solo en pantallas anchas, donde entra) y la hora de la madrugada en que se respondió;
  - las píldoras van en dos columnas con el ParallaxScroll de Aceternity, instalado con `npx shadcn@latest add @aceternity/parallax-scroll` en `src/components/ui/parallax-scroll.tsx`. Mientras la sección pasa por la pantalla, una columna sube y la otra baja;
  - el componente se adaptó para la landing; el primer commit de la rama guarda la versión original, así el cambio queda a la vista:
    - recibe cualquier contenido en lugar de URLs de imágenes, lo expone como una sola lista para lectores de pantalla y admite dos o tres columnas;
    - sigue el scroll de la página, no el de una caja de altura fija con scroll propio, que atrapa la rueda del mouse y el dedo en el celular;
    - cada columna se desplaza centrada en su lugar, así los primeros elementos arrancan a la vista;
    - no se mueve por debajo de `lg` ni con movimiento reducido. Lo resuelve CSS (`motion-reduce:`), que aplica desde el primer render; `useReducedMotion` llega tarde y motion ya dejó escrito un desplazamiento;
  - vuelve la dependencia `motion`, que trae el componente.
- **El CLI de shadcn y los componentes de Aceternity.** El entorno de desarrollo en la nube bloqueaba `ui.aceternity.com` y `ui.shadcn.com`; con ambos habilitados en *Network access*, el CLI funciona. `components.json` registra `@aceternity`, así que los próximos se instalan con un solo comando.
- **Hairline** (`@lucasmarkes/hairline`, MIT, sin dependencias) ilustra "Cómo funciona" con figuras de línea que responden al puntero: tarjetas (las preguntas frecuentes), ventana en capas (tu sitio con el chat) y cinta (los contactos que llegan). Se tematizan con los tokens.
- **"Qué hace por vos" como bento, idea de las secciones de features de Aceternity:**
  - celdas anchas y angostas que se alternan, separadas por líneas finas;
  - cada beneficio con una figura isométrica de Hairline: un rack de cajones (responde con tus datos), una rama que se separa y vuelve (deriva en lugar de inventar), una antena (los contactos que llegan) y un teléfono en capas (el aviso);
  - al pasar el puntero, la barra junto al título crece y se pone naranja. Es CSS puro, sin `motion`, que se quitó de las dependencias.

  No se usó el registro de Aceternity, porque estaba bloqueado por la red del entorno de desarrollo; se tomó la idea, no el código. Sus efectos más conocidos (rayos, spotlight, gradientes animados) quedaron afuera: son justo lo que hoy hace que una landing parezca plantilla.

## Criterios de aceptación

1. **Dado** la portada, **entonces** el hero muestra las capturas del panel real y la de la bandeja tiene texto alternativo.
2. **Dado** `prefers-reduced-motion`, **entonces** los planos del hero no se animan, las columnas de preguntas no se desplazan y la barra de los beneficios cambia sin transición.
3. **Dado** la paleta "papel", **entonces** todos los pares fondo/texto cumplen AA en claro y en oscuro (test de tokens).
4. **Dado** un celular de 390 px, **entonces** no hay desplazamiento horizontal.
5. **Dado** las páginas legales, **entonces** usan la misma paleta y tipografía.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1 | E2E sin Clerk: la captura carga y se describe; la pared muestra las preguntas y sus columnas se desplazan en sentidos opuestos, y no con movimiento reducido | `e2e/public.spec.ts` |
| 2 | E2E de la pared con movimiento reducido; el resto, revisión manual | `e2e/public.spec.ts` |
| 3 | Unitario: contraste de `.theme-paper` y `.dark .theme-paper`, incluidos los extremos del degradé brasa | `src/styles/design-tokens.test.ts` |
| 4, 5 | Revisión con capturas en escritorio, celular, claro y oscuro | — |
