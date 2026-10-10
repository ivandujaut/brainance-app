// Keeps the WhatsApp line out of develop and main (ADR 0100): shared work flows develop → whatsapp-os, never back.

export const LINE_BRANCH = "whatsapp-os";

const HOW_TO_FIX =
  "Lo que sirve a las dos líneas se arregla en `develop` y se trae a `whatsapp-os` con un merge. Cerrá este PR sin mergear y, si el cambio es de la línea de WhatsApp, abrilo contra `whatsapp-os`.";

/**
 * Returns why the PR must not be merged, or null when it can.
 * @param {{ base: string, head: string, lineOnlyCommits: string[], prCommits: string[] }} pr
 *   lineOnlyCommits: commits in whatsapp-os that develop doesn't have; prCommits: commits the PR brings into base.
 * @returns {string | null}
 */
export function prDirectionProblem({ base, head, lineOnlyCommits, prCommits }) {
  if (base === LINE_BRANCH) return null;

  if (head === LINE_BRANCH) {
    return `El PR lleva \`${LINE_BRANCH}\` a \`${base}\`, y la línea de WhatsApp no se mergea en \`develop\` ni en \`main\` (ADR 0100). ${HOW_TO_FIX}`;
  }

  const lineOnly = new Set(lineOnlyCommits);
  const carried = prCommits.filter((sha) => lineOnly.has(sha)).length;
  if (carried === 0) return null;

  const commits = carried === 1 ? "1 commit" : `${carried} commits`;
  return `El PR trae ${commits} que solo están en \`${LINE_BRANCH}\`: la rama salió de la línea de WhatsApp y va contra \`${base}\` (ADR 0100). ${HOW_TO_FIX}`;
}
