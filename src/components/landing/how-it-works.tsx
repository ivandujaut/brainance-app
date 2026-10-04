import { Exploded, Riffle, Slow } from "@lucasmarkes/hairline/react";
import type { CSSProperties } from "react";

// Hairline figures (MIT, @lucasmarkes/hairline) themed with the page's tokens (spec 009).
const hairlineTheme = {
  "--hairline-plate": "hsl(var(--card))",
  "--hairline-hi": "hsl(var(--foreground))",
  "--hairline-edge": "hsl(var(--muted-foreground))",
  "--hairline-mid": "hsl(var(--muted-foreground) / 0.7)",
  "--hairline-lo": "hsl(var(--border))",
  "--hairline-stroke": "0.9",
} as CSSProperties;

const STEPS = [
  {
    Figure: Riffle,
    label: "Una bandeja de tarjetas: tus preguntas frecuentes",
    title: "Contale a tu bot sobre tu negocio",
    text: "A qué te dedicás, tus preguntas frecuentes, si tratás de vos o de usted y a dónde derivar. Con eso responde; lo que no sabe, no lo inventa.",
  },
  {
    Figure: Exploded,
    label: "Una ventana en capas: tu sitio con el chat encima",
    title: "Pegá una línea en tu sitio",
    text: "El chat aparece abajo a la derecha, con tu color y tu mensaje de bienvenida. No toca el diseño de tu página.",
  },
  {
    Figure: Slow,
    label: "Cajas que avanzan por una cinta: los contactos que llegan",
    title: "Recibí los contactos",
    text: "Después de responder, ofrece dejar el email y te avisa. Si alguien necesita una persona, tomás la conversación y seguís vos.",
  },
];

export const HowItWorks = () => (
  <section aria-labelledby="como-funciona" className="border-y bg-card/60" style={hairlineTheme}>
    <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Cómo funciona</p>
      <h2 id="como-funciona" className="mt-3 max-w-xl font-display text-3xl leading-tight md:text-4xl">
        Tres pasos, una tarde. <span className="italic text-muted-foreground">Y después atiende solo.</span>
      </h2>
      <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
        {STEPS.map(({ Figure, label, title, text }, i) => (
          <li key={title} className="flex flex-col bg-card">
            <div className="border-b px-6 pt-6">
              <Figure label={label} intensity={0.6} className="w-full" />
            </div>
            <div className="flex flex-col gap-2 p-6">
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              <h3 className="font-display text-xl">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
