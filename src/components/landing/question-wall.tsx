import { Check } from "lucide-react";

// Spec 009: the problem block. Everyday questions from different trades, each marked as answered at
// an hour nobody is at the shop. The wall drifts up slowly in a loop (a second, hidden copy makes it
// seamless), pauses on hover and holds still with reduced motion.
const QUESTIONS = [
  ["¿Hacen envíos?", "Panadería"],
  ["¿Hasta qué hora abren?", "Taller"],
  ["¿Tienen sin TACC?", "Panadería"],
  ["¿Cuánto sale el service?", "Taller"],
  ["¿El depto acepta mascotas?", "Inmobiliaria"],
  ["¿Atienden por obra social?", "Consultorio"],
  ["¿Tienen turno para el sábado?", "Consultorio"],
  ["¿Hacen factura A?", "Estudio contable"],
  ["¿Hay talle L?", "Tienda de ropa"],
  ["¿Cuánto sale la cuota?", "Gimnasio"],
  ["¿Puedo pasar a verlo hoy?", "Inmobiliaria"],
  ["¿Tienen estacionamiento?", "Gimnasio"],
  ["¿Cuándo vence el monotributo?", "Estudio contable"],
  ["¿Arreglan frenos?", "Taller"],
  ["¿Hacen tortas por encargo?", "Panadería"],
  ["¿Cambian si no me queda?", "Tienda de ropa"],
] as const;

const HOURS = ["03:07", "02:41", "23:58", "04:12", "01:30", "22:15"];

const Chips = ({ hidden = false }: { hidden?: boolean }) => (
  <ul
    aria-label={hidden ? undefined : "Preguntas respondidas por el bot"}
    aria-hidden={hidden || undefined}
    className="flex flex-wrap justify-center gap-2.5 pb-2.5"
  >
    {QUESTIONS.map(([question, trade], i) => (
      <li
        key={question + trade}
        className="flex items-center gap-2 whitespace-nowrap rounded-xl border bg-card px-3 py-2 text-sm font-semibold shadow-sm"
      >
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        </span>
        {question}
        <span className="hidden font-normal text-muted-foreground sm:inline">· {trade}</span>
        <span className="text-xs font-bold text-[hsl(var(--ember-from))]">
          <span className="sr-only">respondida a las </span>
          {HOURS[i % HOURS.length]}
        </span>
      </li>
    ))}
  </ul>
);

export const QuestionWall = () => (
  <section aria-labelledby="problema" data-testid="question-wall" className="mx-auto max-w-6xl px-4 py-20 md:px-8">
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Las mismas preguntas, todos los días
        </p>
        <h2 id="problema" className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          El que pregunta quiere la respuesta <span className="text-ember">ahora, no el lunes.</span>
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
      <div className="group relative h-[360px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] md:h-[440px]">
        <div
          data-testid="question-wall-track"
          className="animate-drift-up group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        >
          <Chips />
          <Chips hidden />
        </div>
      </div>
    </div>
  </section>
);
