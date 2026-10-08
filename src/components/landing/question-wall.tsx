import { Check, CornerUpRight } from "lucide-react";
import { ParallaxScroll } from "@/components/ui/parallax-scroll";

// Spec 009: the problem block. On the left, the problem in the owner's words (spec 013); on the
// right, everyday questions from different trades in the parallax columns of Aceternity's
// ParallaxScroll (adapted in components/ui/parallax-scroll.tsx). Most were answered at an hour nobody
// is at the shop; the ones whose answer was not loaded went to the owner instead (spec 013, crit. 3).
const QUESTIONS = [
  ["¿Hacen envíos?", "Panadería", "03:07"],
  ["¿Hasta qué hora abren?", "Taller", "02:41"],
  ["¿Tienen sin TACC?", "Panadería", null],
  ["¿Cuánto sale el service?", "Taller", "04:12"],
  ["¿Aceptan mascotas?", "Inmobiliaria", "01:30"],
  ["¿Atienden por obra social?", "Consultorio", "22:15"],
  ["¿Hay turno el sábado?", "Consultorio", "03:07"],
  ["¿Hacen factura A?", "Contador", null],
  ["¿Hay talle L?", "Ropa", "23:58"],
  ["¿Cuánto sale la cuota?", "Gimnasio", "04:12"],
  ["¿Puedo pasar a verlo hoy?", "Inmobiliaria", null],
  ["¿Hay estacionamiento?", "Gimnasio", "22:15"],
  ["¿Vence el monotributo?", "Contador", "02:41"],
  ["¿Arreglan frenos?", "Taller", "00:47"],
  ["¿Hacen tortas?", "Panadería", "05:20"],
  ["¿Cambian si no me queda?", "Ropa", null],
] as const;

const Chip = ({ question, trade, hour }: { question: string; trade: string; hour: string | null }) => (
  <div className="flex w-fit items-center gap-2 whitespace-nowrap rounded-xl border bg-card px-3 py-2 text-[13px] font-semibold shadow-sm">
    {hour ? (
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      </span>
    ) : (
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-foreground/40">
        <CornerUpRight className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      </span>
    )}
    {question}
    {/* The trade only fits next to the question on wide screens. */}
    <span className="hidden font-normal text-muted-foreground xl:inline">· {trade}</span>
    {hour ? (
      <span className="text-xs font-bold text-[hsl(var(--ember-from))]">
        <span className="sr-only">respondida a las </span>
        {hour}
      </span>
    ) : (
      <span className="text-xs font-bold text-muted-foreground">
        <span className="sr-only">Te la pasó </span>a vos
      </span>
    )}
  </div>
);

export const QuestionWall = () => (
  <section aria-labelledby="problema" data-testid="question-wall" className="mx-auto max-w-6xl px-4 py-20 md:px-8">
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_2.1fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">El problema</p>
        <h2 id="problema" className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          “Me escriben a cualquier hora y, <span className="text-ember">si no contesto, se van a otro.”</span>
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Precios, horarios, envíos, turnos. Tu bot las contesta con tus datos a cualquier hora, y lo que no sabe te lo
          pasa a vos.
        </p>
        <dl className="mt-8 flex gap-10">
          <div className="flex flex-col-reverse">
            <dt className="text-sm text-muted-foreground">respondiendo, también de madrugada</dt>
            <dd className="text-3xl font-bold tracking-tight">24 h</dd>
          </div>
          <div className="flex flex-col-reverse">
            <dt className="text-sm text-muted-foreground">de código para instalarlo</dt>
            <dd className="text-3xl font-bold tracking-tight">1 línea</dd>
          </div>
        </dl>
      </div>

      <div className="relative h-[360px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] md:h-[460px] lg:pt-16">
        <ParallaxScroll
          label="Preguntas que el bot respondió o te pasó"
          columns={2}
          className="gap-2.5 md:gap-3"
          columnClassName="gap-2.5 justify-items-center md:first:justify-items-end md:last:justify-items-start"
          items={QUESTIONS.map(([question, trade, hour]) => ({
            key: question,
            content: <Chip question={question} trade={trade} hour={hour} />,
          }))}
        />
      </div>
    </div>
  </section>
);
