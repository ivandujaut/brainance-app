import Image from "next/image";

// Positions are percentages of the screenshot (1440×900), so markers stay next to
// their element at any width. Regenerate the images with `npm run landing:screens`.
const NOTES = [
  { x: 32, y: 36, text: "Cuando alguien pide hablar con una persona, la conversación se marca sola." },
  { x: 68, y: 18.6, text: "Lo que el bot le preguntó al interesado, arriba de la charla." },
  { x: 53, y: 55.4, text: "Tomás el control y respondés vos. El bot espera hasta que se lo devuelvas." },
];

const shot = { width: 2400, height: 1500, sizes: "(min-width: 1152px) 1088px, 100vw" };
const alt =
  "La bandeja de BrAInance: la lista de conversaciones de una panadería y, abierta, una charla donde el bot respondió y después la dueña tomó el control.";

// Hero product shot (spec 009): the real inbox, rendered from the app's own components.
export const ProductShot = () => (
  <figure className="flex flex-col gap-8">
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-[0_30px_80px_-30px_hsl(var(--foreground)/0.35)]">
      <Image src="/landing/inbox-light.webp" alt={alt} {...shot} priority className="h-auto w-full dark:hidden" />
      <Image src="/landing/inbox-dark.webp" alt={alt} {...shot} className="hidden h-auto w-full dark:block" />
      {NOTES.map((n, i) => (
        <span
          key={n.text}
          aria-hidden="true"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
          className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground font-mono text-xs text-background ring-4 ring-primary/40 md:h-7 md:w-7"
        >
          {i + 1}
        </span>
      ))}
    </div>
    <figcaption>
      <ol className="grid gap-4 sm:grid-cols-3">
        {NOTES.map((n, i) => (
          <li key={n.text} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-display text-lg italic leading-none text-foreground">{i + 1}.</span>
            {n.text}
          </li>
        ))}
      </ol>
    </figcaption>
  </figure>
);
