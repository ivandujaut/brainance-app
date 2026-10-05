import { Branches, Cabinet, Dish, Phone } from "@lucasmarkes/hairline/react";
import { cn } from "@/lib/utils";
import { hairlineTheme } from "./hairline-theme";

// "Qué hace por vos" (spec 009): a bento grid in the spirit of Aceternity's feature sections, drawn
// with Hairline's isometric figures. Wide and narrow cells alternate; on hover, the bar beside the
// title grows and turns brand orange.
const FEATURES = [
  {
    Figure: Cabinet,
    label: "Un rack de cajones: la información de tu negocio",
    title: "Responde con tus datos",
    text: "Usa tu descripción y tus preguntas frecuentes. Habla como vos elegís: de vos o de usted.",
    wide: true,
  },
  {
    Figure: Branches,
    label: "Una rama que se separa y vuelve: la consulta que se deriva",
    title: "No inventa",
    text: "Si un precio o un horario no está cargado, lo dice y deriva a tu WhatsApp o a tu email.",
    wide: false,
  },
  {
    Figure: Dish,
    label: "Una antena que apunta y recibe: los contactos que llegan",
    title: "Te trae los contactos",
    text: "Después de ayudar, ofrece dejar el email y tus preguntas. Te llega un aviso y los tenés en tu panel.",
    wide: false,
  },
  {
    Figure: Phone,
    label: "Un teléfono en capas: el aviso que te llega",
    title: "Te avisa cuando hacés falta",
    text: "Si alguien pide hablar con una persona, la conversación se marca y la tomás en el momento.",
    wide: true,
  },
];

export const FeatureBento = () => (
  <ul
    className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-6"
    style={hairlineTheme}
  >
    {FEATURES.map(({ Figure, label, title, text, wide }) => (
      <li
        key={title}
        className={cn("group flex flex-col bg-card", wide ? "lg:col-span-4 lg:flex-row lg:items-center" : "lg:col-span-2")}
      >
        <div className={cn("flex flex-col gap-2 p-6", wide && "lg:w-1/2 lg:self-start")}>
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-1 h-5 w-1 shrink-0 rounded-full bg-border transition-all duration-200 group-hover:h-7 group-hover:-mt-0 group-hover:bg-primary motion-reduce:transition-none"
            />
            <h3 className="text-xl font-bold transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
              {title}
            </h3>
          </div>
          <p className="pl-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
        </div>
        <div className={cn("px-6 pb-6", wide && "lg:flex-1 lg:py-6 lg:pl-0")}>
          <Figure label={label} intensity={0.6} className={cn("mx-auto w-full", wide ? "max-w-[440px]" : "max-w-[360px]")} />
        </div>
      </li>
    ))}
  </ul>
);
