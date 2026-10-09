# Dominio

Reglas para `src/domain/`. Las generales están en el [`AGENTS.md` de la raíz](../../AGENTS.md).

- **Lógica pura.** No importa Next, Prisma, Clerk ni SDKs de IA. Si hace falta un dato de afuera, entra como parámetro.
- **Cada archivo tiene su test al lado** (`nombre.test.ts`), escrito antes que el código.
- **Regex:** el target de TypeScript no admite la bandera `s`. Usá `[\s\S]` para que el punto cruce saltos de línea.
- **Prompts:** los textos que van al modelo (por ejemplo, `answer-prompt.ts`) son lógica de dominio. Si cambia uno, se corre el eval (`evals/AGENTS.md`).
