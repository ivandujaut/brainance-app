# 004 — Configuración del bot

- **Estado:** Aprobada (2026-10-02)
- **ADRs relacionados:** [0001 — Estrategia de modelos de IA](../adr/0001-estrategia-de-modelos-de-ia.md), [0004 — Aislamiento multi-tenant](../adr/0004-aislamiento-multi-tenant.md), [0005 — Design system con tokens de marca](../adr/0005-design-system-tokens-de-marca.md)

## Problema

El widget ya responde en el sitio del cliente, pero el bot no sabe a qué se dedica el negocio, a qué contacto derivar ni si debe tratar al visitante de vos o de usted: hoy esos datos están fijos en el código para todos los sitios. La pantalla de configuración actual está en inglés, muestra una imagen de ejemplo en lugar del chat real, permite cargar preguntas frecuentes pero no editarlas ni borrarlas, y deja elegir colores que pueden hacer ilegible el chat.

## Historias de usuario

- Como **dueño del negocio**, quiero contarle al bot qué hace mi negocio, cómo tratar a mis clientes y a dónde derivarlos, para que responda como lo haría alguien de mi equipo.
- Como **dueño**, quiero ver el chat tal como lo verán mis visitantes mientras cambio colores, ícono y bienvenida, para no tener que entrar a mi sitio a probar.
- Como **dueño**, quiero elegir el color de mi marca sin preocuparme por si el texto se lee bien.
- Como **dueño**, quiero corregir o borrar una pregunta frecuente cuando cambia un precio o un horario, para que el bot no responda con datos viejos.
- Como **visitante del sitio**, quiero que el chat se lea bien y que, si el bot no sabe algo, me diga a quién escribirle de verdad.

## Criterios de aceptación

### Pantalla

1. **Dado** un dueño con un sitio, **cuando** entra a `/settings/<id del sitio>`, **entonces** ve la configuración en español, en secciones: **Negocio**, **Apariencia**, **Preguntas frecuentes**, **Preguntas de calificación** e **Instalación**. En escritorio, la vista previa del chat queda fija a la derecha; en celular se abre con un botón "Ver cómo queda".
2. **Dado** un id de sitio de otro dueño, mal formado o inexistente, **cuando** se abre la página, **entonces** responde 404, sin diferenciar los casos.
3. **Dado** el menú lateral o la checklist del onboarding, **cuando** el dueño hace clic en un sitio, **entonces** llega a la página de ese sitio por su id. Dos sitios con nombres parecidos (`ana.com` y `mariana.com`) llevan cada uno a su configuración.
4. **Dado** que la pantalla ya no muestra el sello "Premium" ni la imagen de ejemplo `bot-ui.png`, **entonces** la única referencia visual del chat es la vista previa.

### Negocio

5. **Dado** el formulario de Negocio, **cuando** el dueño guarda una descripción (hasta 1.000 caracteres), un trato (vos o usted) y un contacto (hasta 200 caracteres, por ejemplo "WhatsApp +54 9 341 555-0101"), **entonces** el bot del widget usa esos datos en las respuestas siguientes.
6. **Dado** un sitio sin descripción o sin contacto cargados, **entonces** el bot sigue funcionando con los valores actuales ("el sitio web <dominio>" y "los canales de contacto que figuran en este sitio"), y la pantalla señala que completar esos campos mejora las respuestas.
7. **Dado** un sitio que alcanzó el tope diario de mensajes (spec 003, criterio 14), **cuando** llega otro, **entonces** la respuesta fija deriva al contacto cargado por el dueño.

### Apariencia

8. **Dado** el formulario de Apariencia, **cuando** el dueño elige un color (de una paleta sugerida o con un selector libre), **entonces** el color del texto sobre ese fondo se calcula solo, blanco o casi negro, el que tenga mayor contraste. El dueño no elige el color del texto.
9. **Dado** cualquier color elegido, **entonces** el texto del encabezado y de las burbujas cumple contraste WCAG AA (4,5:1) o, si ningún texto lo alcanza, se usa el de mayor contraste posible.
10. **Dado** un cambio de color, ícono o mensaje de bienvenida, **cuando** el dueño lo edita, **entonces** la vista previa se actualiza al instante, antes de guardar. Al guardar, el widget del sitio lo muestra en la siguiente carga.
11. **Dado** un valor que no es un color hexadecimal (`#RRGGBB`), **entonces** no se guarda y el formulario muestra el error.

### Preguntas frecuentes

12. **Dado** el listado de preguntas frecuentes, **cuando** el dueño crea, edita o borra una, **entonces** el cambio se ve en el listado sin recargar la página y el bot lo usa en la respuesta siguiente. Borrar pide confirmación.
13. **Dado** una pregunta de hasta 200 caracteres y una respuesta de hasta 1.000, **entonces** se guarda. Fuera de esos límites, o con algún campo vacío, el formulario muestra el error.
14. **Dado** un sitio con 50 preguntas frecuentes, **cuando** el dueño intenta crear otra, **entonces** no se guarda y se le explica el límite. (El bot recibe todas las FAQ en el prompt hasta que exista el RAG del ítem 4).

### Preguntas de calificación

15. **Dado** el listado de preguntas de calificación, **cuando** el dueño crea o borra una, **entonces** el cambio queda guardado. La pantalla aclara que el bot las va a usar cuando se active la captura de contactos.

### Instalación y dominio

16. **Dado** la sección Instalación, **entonces** muestra el snippet para copiar, si el bot ya se detectó en el sitio, y permite cambiar el dominio o borrar el sitio (con confirmación).

### Aislamiento

17. **Dado** otro dueño que conoce el id de un sitio, de una FAQ o de una pregunta de calificación ajenos, **cuando** llama a cualquier acción de esta pantalla, **entonces** no lee ni modifica nada.

## Fuera de alcance

- Probar el bot desde el panel con mensajes de prueba: la vista previa muestra la apariencia y la bienvenida, pero no conversa. Ver "Preguntas abiertas".
- Usar las preguntas de calificación en la conversación (ítem 7 del roadmap).
- Cargar documentos o páginas del sitio como conocimiento (ítem 4).
- Elegir la posición del botón, fuentes o temas completos del widget.
- Migrar al nuevo design system las pantallas que esta spec no toca (ADR 0005).

## Notas técnicas

**Datos**
- `ChatBot` suma `description String?`, `addressing String @default("vos")` (validado como `"vos" | "usted"`) y `contact String?`. Una migración nueva.
- `ChatBot.textColor` deja de escribirse: el color del texto se calcula al leer. La columna se elimina en una migración aparte, como `User.type`.
- El color por defecto sigue siendo `#FFA947`. Con la regla nueva, su texto pasa a ser casi negro: el blanco actual tiene un contraste de 1,9:1 y no cumple.

**Dominio (`src/domain/`)**
- `src/domain/color-contrast.ts`: `parseHexColor`, `contrastRatio` (fórmula de luminancia relativa de WCAG 2.x) y `readableTextColor(fondo)`. Es la misma función que usa el test de tokens del ADR 0005.
- `src/domain/bot-settings.ts`: esquemas zod y límites de los formularios (largo de los textos, máximo de 50 FAQ, trato válido).

**Adaptadores y acciones**
- `toBusinessKnowledge` (`src/server/widget-site.ts`) toma descripción, trato y contacto del `ChatBot`, con los valores actuales como respaldo. `toPublicConfig` devuelve el color del texto calculado.
- `src/server/tenancy.ts` suma `findOwnedFaq(id)` y `findOwnedFilterQuestion(id)` (o un filtro `owned…Where` equivalente), que resuelven por la cadena `Domain → User`.
- Acciones nuevas en `src/actions/settings`: `onUpdateBusinessInfo`, `onUpdateAppearance` (color, ícono y bienvenida en una sola acción), `onUpdateHelpDeskQuestion`, `onDeleteHelpDeskQuestion` y `onDeleteFilterQuestion`. Todas validan con los esquemas de `src/domain/bot-settings.ts` y operan sobre el id que devuelve `tenancy.ts`.
- Las acciones viejas que quedan sin uso (`onUpdateWelcomeMessage`, `onChatBotImageUpdate`) se eliminan junto con sus casos de test.

**UI**
- La página es un Server Component que carga el sitio con `findOwnedSite` y le pasa los datos a los formularios. Así esta pantalla deja de usar `useSettings`, que hace fetch en efectos (deuda técnica de `docs/principles.md`).
- Cada sección es un formulario cliente con su botón Guardar. Después de guardar se llama a `revalidatePath`.
- La vista previa reutiliza `WidgetChat` (`src/components/widget/chat.tsx`) en modo vista previa: recibe la configuración del formulario, no lee ni guarda conversaciones y tiene la entrada deshabilitada.
- La pantalla usa solo los tokens semánticos del ADR 0005 (`bg-primary`, `text-muted-foreground`, etc.) y componentes de `src/components/ui`. El widget no usa tokens: lleva el color del dueño.

**IA**
- El template del prompt (`buildAnswerSystemPrompt`) no cambia: cambian los datos que recibe. El eval set ya tiene dos negocios con trato de usted (clínica dental y estudio contable), así que no hace falta correrlo para este cambio (ADR 0001).

## Preguntas abiertas

- **Conversar con el bot desde la vista previa.** Es útil, pero cada mensaje gasta tokens del modelo y habría que contarlos en otro límite (por dueño, no por visitante). Queda para una spec chica posterior.
- **Ruta vieja por nombre.** `/settings/<nombre>` deja de existir y responde 404. Como no hay usuarios todavía, no se agrega redirección.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 8, 9, 11 | Unitario: contraste, color de texto calculado y validación de hex | `src/domain/color-contrast.test.ts` |
| ADR 0005 | Unitario: contraste AA de los tokens en claro y oscuro | `src/styles/design-tokens.test.ts` |
| 5, 11, 13, 14 | Unitario: esquemas y límites de los formularios | `src/domain/bot-settings.test.ts` |
| 5, 6 | Unitario: `toBusinessKnowledge` con datos completos y con respaldo | `src/server/widget-site.test.ts` |
| 5, 7, 12, 14, 15 | Integración (Postgres): las acciones guardan, editan y borran | `src/actions/settings/bot-settings.int.test.ts` |
| 2, 17 | Integración: cada acción nueva como dueño y como otro tenant | `src/actions/tenant-isolation.int.test.ts` |
| 1, 2, 4, 6 | Render del Server Component con las acciones simuladas | `src/app/(site)/(dashboard)/settings/[siteId]/page.test.tsx` |
| 1, 3, 4, 10, 12 | E2E: el dueño cambia el color y ve la vista previa, crea, edita y borra una FAQ y llega desde el menú lateral (requiere Clerk) | `e2e/bot-settings.spec.ts` |
| 7, 10 | E2E: el widget muestra el color guardado con texto legible y, con el tope alcanzado, deriva al contacto | `e2e/widget.spec.ts` |
