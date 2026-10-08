import Link from "next/link";

// Spec 013, criterion 9: what happens when the beta ends. Same promise as the terms
// (src/content/legal/terminos.md, "Beta gratuita").
const POINTS = [
  "Antes de que termine, te avisamos por email con 30 días de anticipación y te decimos el precio.",
  "Va a ser uno por local, en pesos, con el tope que ponés vos.",
  "Como no te pedimos tarjeta, no se cobra nada automáticamente: seguís solo si aceptás.",
  "Si no seguís, te llevás en CSV los contactos que te dejaron tus clientes.",
];

export const BetaTerms = () => (
  <section aria-labelledby="beta" className="mx-auto max-w-6xl px-4 py-20 md:px-8">
    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">El precio</p>
        <h2 id="beta" className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Qué pasa cuando termine la beta
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">Hoy es gratis y no te pedimos tarjeta.</p>
      </div>
      <div>
        <ol className="flex flex-col divide-y rounded-xl border bg-card">
          {POINTS.map((point, i) => (
            <li key={point} className="flex gap-4 p-5">
              <span className="text-sm font-bold text-[hsl(var(--ember-from))]">{i + 1}</span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          Lo mismo dicen los{" "}
          <Link href="/terminos" className="underline underline-offset-2 text-foreground">
            términos
          </Link>
          .
        </p>
      </div>
    </div>
  </section>
);
