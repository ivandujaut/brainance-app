"use client";
import { Check } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";

// Spec 009: the problem block, after Aceternity's ParallaxScroll. Everyday questions from different
// trades with the bot's answer, in three columns that drift in opposite directions while the section
// crosses the screen. Driven by the page's own scroll (no inner scroll box that traps the wheel), one
// rAF-throttled listener writing a CSS variable, and no movement at all with reduced motion.
const QUESTIONS = [
  [
    "¿Hacen envíos?",
    "Sí, dentro de Rosario por $2.500. Llegan en el día si pedís antes de las 14.",
    "Panadería",
    "03:07",
  ],
  ["¿Hasta qué hora abren?", "De lunes a viernes de 8 a 18 y los sábados de 9 a 13.", "Taller", "23:58"],
  ["¿El depto acepta mascotas?", "Sí, mascotas chicas. ¿Querés coordinar una visita?", "Inmobiliaria", "01:30"],
  [
    "¿Atienden por obra social?",
    "Con las prepagas más comunes, sí. Si me decís cuál tenés, te confirmo o te paso con el consultorio.",
    "Consultorio",
    "22:15",
  ],
  ["¿Hacen factura A?", "Sí. Para darte de alta como cliente, ¿me dejás tu email?", "Estudio contable", "02:41"],
  ["¿Hay talle L?", "Ese dato no lo tengo cargado. Te paso con la tienda por WhatsApp.", "Tienda de ropa", "04:12"],
  ["¿Tienen sin TACC?", "Sí, los jueves horneamos sin TACC en un horno aparte.", "Panadería", "02:10"],
  [
    "¿Cuánto sale el service?",
    "Depende del modelo. Si me decís cuál es, te paso con el taller para cotizarlo.",
    "Taller",
    "00:47",
  ],
  [
    "¿Cuánto sale la cuota?",
    "La mensual libre es $28.000 y la de tres veces por semana, $22.000.",
    "Gimnasio",
    "05:20",
  ],
  ["¿Puedo pasar a verlo hoy?", "Las visitas son de 10 a 18. ¿Te anoto para las 17?", "Inmobiliaria", "23:31"],
  [
    "¿Tienen turno para el sábado?",
    "Los sábados no atendemos. El primer turno libre es el lunes a las 9.",
    "Consultorio",
    "03:55",
  ],
  ["¿Cambian si no me queda?", "Sí, hasta 30 días con la etiqueta puesta y el ticket.", "Tienda de ropa", "01:12"],
  ["¿Tienen estacionamiento?", "Sí, para socios, en la cochera de al lado.", "Gimnasio", "22:48"],
  [
    "¿Cuándo vence el monotributo?",
    "Se paga del 1 al 20 de cada mes. ¿Querés que te avisemos?",
    "Estudio contable",
    "04:40",
  ],
  [
    "¿Hacen tortas por encargo?",
    "Sí, con 48 horas de anticipación. ¿Para cuántas personas sería?",
    "Panadería",
    "00:05",
  ],
] as const;

// How far each column travels across the section's pass, in px, centered on its resting place: the middle
// one goes against the others.
// Large screens only; on phones and tablets the columns stack and stay still.
const TRAVEL = [-200, 200, -200];

const Card = ([question, answer, trade, hour]: (typeof QUESTIONS)[number]) => (
  <div key={question} role="listitem" className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
    <p className="font-semibold">{question}</p>
    <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      </span>
      {trade} ·{" "}
      <span className="font-bold text-[hsl(var(--ember-from))]">
        <span className="sr-only">respondida a las </span>
        {hour}
      </span>
    </p>
  </div>
);

export const QuestionWall = () => {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = section.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      // 0 when the section enters from below, 1 when it leaves at the top.
      const progress = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight + height)));
      element.style.setProperty("--parallax", progress.toFixed(4));
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const columns = [0, 1, 2].map((c) => QUESTIONS.filter((_, i) => i % 3 === c));

  return (
    <section
      ref={section}
      aria-labelledby="problema"
      data-testid="question-wall"
      className="mx-auto max-w-6xl px-4 py-20 md:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
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
      </div>

      <div className="relative mt-12 h-[640px] overflow-hidden lg:pt-24 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
        {/* One list for screen readers; the columns are only layout. */}
        <div
          role="list"
          aria-label="Preguntas respondidas por el bot"
          className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {columns.map((cards, c) => (
            <div
              key={c}
              data-testid="question-column"
              className="flex flex-col gap-4 motion-safe:lg:[transform:translateY(calc((var(--parallax,0.5)-0.5)*var(--travel)))]"
              style={{ "--travel": `${TRAVEL[c]}px` } as CSSProperties}
            >
              {cards.map(Card)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
