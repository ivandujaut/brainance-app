# 0005 — Design system con tokens de marca

- **Estado:** Aceptado
- **Fecha:** 2026-10-02

## Contexto

La UI del panel conserva dos sistemas de color heredados que no se hablan entre sí:

- los **tokens semánticos de shadcn** (`--primary`, `--muted`, `--ring`…) en `src/app/globals.css`, con los grises slate por defecto. `--primary` es azul pizarra, no el color de la marca;
- los **colores de marca como hex sueltos** en `tailwind.config.ts` (`orange` #FFA947, `cream`, `gravel`, `iridium`, `peach`, `platinum`, `ghost`, `grandis`, `porcelain`, `ironside`), que los componentes usan directamente (`bg-orange`, `text-gravel`).

Resultado: los botones de shadcn salen grises y el resto naranja, el modo oscuro solo funciona en la mitad de la UI y nadie verifica el contraste. Por ejemplo, el texto blanco sobre el naranja de la marca tiene 1,9:1, lejos del 4,5:1 que pide WCAG AA.

La spec 004 rehace la pantalla de configuración y es la primera pantalla nueva del panel: hay que decidir con qué sistema se construye.

## Opciones consideradas

1. **Seguir como está.** No cuesta nada ahora, pero cada pantalla nueva repite la mezcla y el problema crece.
2. **Tokens de marca en las variables semánticas y migración gradual.** Se cambian los valores de los tokens existentes para que expresen la marca, las pantallas nuevas usan solo tokens y las viejas se migran cuando se tocan. Es un cambio chico y compatible con los componentes de shadcn.
3. **Rediseño completo ahora**, migrando todas las pantallas o adoptando una librería de componentes distinta. Deja todo uniforme, pero frena las features de la beta durante varios PRs sin valor visible para el usuario.

## Decisión

**Opción 2.**

- **Los tokens son la única fuente de color del panel.** El naranja de la marca pasa a `--primary` (`32 100% 64%`, el mismo #FFA947) y a `--ring`. `--primary-foreground` pasa a casi negro, porque el blanco no cumple contraste sobre ese naranja. Se definen valores para claro y oscuro.
- **Código nuevo:** solo clases semánticas (`bg-primary`, `text-primary-foreground`, `text-muted-foreground`, `border-border`…) y componentes de `src/components/ui`. No se usan los hex sueltos ni colores arbitrarios (`bg-[#…]`).
- **Código viejo:** se migra a tokens cuando un PR lo toca por otro motivo. Los colores sueltos de `tailwind.config.ts` quedan marcados como obsoletos y se borran cuando no quedan usos.
- **Contraste verificado por test:** un test unitario lee los pares de tokens de `globals.css` (fondo/texto: `primary`, `secondary`, `muted`, `accent`, `destructive`, `background`, `card`, `popover`) y exige 4,5:1 en claro y en oscuro. Usa la misma función de contraste que el widget (`src/domain/color-contrast.ts`).
- **El widget es la excepción:** vive en el sitio del cliente y lleva el color que eligió el dueño, no los tokens de BrAInance. Ahí el contraste se garantiza calculando el color del texto (spec 004).

## Consecuencias

- Al cambiar `--primary`, los botones y estados de foco de shadcn de todo el panel pasan a naranja de una vez. Es el efecto buscado, pero algunas pantallas viejas van a mezclar el naranja nuevo con colores sueltos hasta que se migren.
- El contraste de los tokens deja de depender de la revisión visual: si alguien cambia un valor y rompe el AA, el test falla. Al activarlo encontró dos pares heredados que no cumplían en modo claro (texto atenuado sobre `muted` y texto sobre `destructive`), que se oscurecieron.
- Queda deuda visible y acotada: la lista de usos de colores sueltos (`grep` de `bg-orange`, `text-gravel`, etc.). Se registra en `docs/principles.md`.
- No se agrega ninguna librería. Si más adelante la UI lo pide (temas por cliente, Tailwind 4 con `@theme`), los tokens ya están centralizados y la migración es mecánica.
