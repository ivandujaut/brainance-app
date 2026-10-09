# Componentes y UI

Reglas para `src/components/` y la UI de `src/app/`. Las generales están en el [`AGENTS.md` de la raíz](../../AGENTS.md).

- **Colores:** los del panel salen de los tokens semánticos de `src/app/globals.css` (`bg-primary`, `text-muted-foreground`, `border-border`…). Nada de hex sueltos ni colores arbitrarios en código nuevo (ADR 0005).
- **Componentes base:** los de `src/components/ui`.
- **Contraste:** todo par fondo/texto cumple WCAG AA, y `src/styles/design-tokens.test.ts` lo verifica.
- **El widget es la excepción:** lleva el color del dueño, y el color del texto se calcula con `src/domain/color-contrast.ts`.
- **Tipografía:** Plus Jakarta Sans.
- **Tema:** por ahora, solo claro (spec 009). Los tokens oscuros se mantienen para poder reactivarlo.
- **Datos:** los componentes nuevos del panel leen datos en Server Components, no con fetch dentro de `useEffect`.
- **Texto en SSR:** React puede partir un texto con variables en varios nodos (`<!-- -->`). Si un test busca el texto completo, armalo como template string en el JSX.
