import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatTile } from "@/components/metrics/stat-tile";
import { BETA_DAILY_ANSWER_MAX, MIN_DAILY_ANSWER_CAP, usageState } from "@/domain/answer-cap";
import { buildAttentionEmail } from "@/domain/attention-notice";
import { formatEvalDate, formatRatio, type EvalSummary } from "@/domain/eval-summary";
import { derivationRate, formatMinutes } from "@/domain/metrics";

// Spec 013, criteria 5–8: the three proofs of the promise. The examples are built from the
// product's own code (the email builder, the panel's tiles, the usage state), not screenshots, so
// they read well on a phone and never drift from what owners actually get.

const SITE = "panaderia-ejemplo.com.ar";

const email = buildAttentionEmail({
  siteName: SITE,
  reason: "derivation",
  exchanges: [
    {
      question: "¿Tienen pan sin TACC?",
      answer: "No tengo ese dato. Escribinos por WhatsApp al +54 9 11 5555-0000 y te confirmamos.",
    },
  ],
  visitorEmail: null,
  conversationUrl: "https://brainance.app/conversations",
  reminder: false,
});

const EmailExample = () => {
  const lines = email.text.split("\n").filter(Boolean);
  const link = lines.find((line) => line.startsWith("Ver la conversación"))?.split(":")[0];
  return (
    <figure className="rounded-xl border bg-card p-5 text-sm shadow-sm" aria-label="Ejemplo del email que te llega">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-b pb-3 text-muted-foreground">
        <dt>De</dt>
        <dd className="text-foreground">BrAInance</dd>
        <dt>Asunto</dt>
        <dd className="font-semibold text-foreground">{email.subject}</dd>
      </dl>
      <div className="flex flex-col gap-2 pt-3 leading-relaxed">
        {lines
          .filter((line) => !line.startsWith("Ver la conversación"))
          .map((line) => {
            const [speaker, ...rest] = line.split(": ");
            return speaker === "Visitante" || speaker === "Bot" ? (
              <p key={line}>
                <span className="font-semibold">{speaker}:</span> {rest.join(": ")}
              </p>
            ) : (
              <p key={line} className="text-muted-foreground">
                {line}
              </p>
            );
          })}
        {link && (
          <span className="mt-1 w-fit rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {link}
          </span>
        )}
      </div>
    </figure>
  );
};

// A week of a bakery's panel (spec 011), the same tiles owners see.
const PANEL = { answers: 40, derived: 3, humanRequests: 1, medianMinutes: 12, cases: 4 };

const PanelExample = () => (
  <figure aria-label="Ejemplo de las métricas de tu panel">
    <div className="grid grid-cols-2 gap-3">
      <StatTile label="Respuestas del bot" value={String(PANEL.answers)} />
      <StatTile
        label="Derivadas"
        value={String(PANEL.derived)}
        hint={`${formatRatio(derivationRate(PANEL)!)} de las respuestas`}
      />
      <StatTile label="Pidieron una persona" value={String(PANEL.humanRequests)} />
      <StatTile
        label="Tu tiempo de respuesta"
        value={formatMinutes(PANEL.medianMinutes)}
        hint={`Mediana sobre ${PANEL.cases} conversaciones`}
      />
    </div>
    <figcaption className="mt-2 text-xs text-muted-foreground">Ejemplo de tu panel en una semana.</figcaption>
  </figure>
);

const EvalNumbers = ({ summary }: { summary: EvalSummary | null }) => (
  <div className="flex flex-col gap-2">
    {summary ? (
      <>
        <p className="leading-relaxed" data-testid="eval-numbers">
          En {summary.cases} consultas de prueba sobre negocios argentinos, no inventó datos en el{" "}
          <strong>{formatRatio(summary.metrics.sinInvento)} de las respuestas</strong> y respondió bien el{" "}
          <strong>{formatRatio(summary.metrics.correcta)}</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          Medido el {formatEvalDate(summary.ranAt)}, con el modelo que usa el bot ({summary.model}), {summary.reps}{" "}
          veces cada consulta.
        </p>
      </>
    ) : (
      <p className="leading-relaxed">
        Lo medimos con consultas de prueba sobre negocios argentinos y publicamos cómo, incluidos los errores.
      </p>
    )}
    <Link
      href="/como-medimos"
      className="inline-flex w-fit items-center gap-1 text-sm font-semibold underline underline-offset-4"
    >
      Cómo lo medimos <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  </div>
);

const USAGE = { answersToday: 12, cap: BETA_DAILY_ANSWER_MAX };

const UsageExample = () => {
  const { ratio } = usageState(USAGE);
  return (
    <figure className="rounded-xl border bg-card p-5 shadow-sm" aria-label="Ejemplo del uso del día en tu panel">
      <p className="text-sm font-medium">{`Hoy: ${USAGE.answersToday} de ${USAGE.cap} respuestas`}</p>
      <div
        role="progressbar"
        aria-label="Respuestas de hoy"
        aria-valuemin={0}
        aria-valuemax={USAGE.cap}
        aria-valuenow={USAGE.answersToday}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Cuando se llega al tope, el bot deja de responder con IA y deriva a tu contacto. No se apaga.
      </p>
    </figure>
  );
};

const PROOFS = (summary: EvalSummary | null) => [
  {
    title: "Te avisa solo cuando hace falta",
    text: "Cuando el bot deriva o alguien pide hablar con una persona, te llega un email con el motivo, la conversación y el link para seguir vos. Te avisa una vez y te recuerda una sola vez si el cliente sigue esperando. Si ya lo atendiste por WhatsApp, la marcás como atendida.",
    example: <EmailExample />,
  },
  {
    title: "Lo que no sabe, no lo inventa. Y te mostramos cuántas veces.",
    text: "Si un precio, un horario o un stock no está cargado, lo dice y te pasa la consulta. Tu panel cuenta cuántas respondió, cuántas te pasó y cuánto tardaste vos.",
    extra: <EvalNumbers summary={summary} />,
    example: <PanelExample />,
  },
  {
    title: "Sabés cuánto usa y hasta dónde llega",
    text: `Ves cuántas respuestas dio hoy y el tope lo ponés vos, entre ${MIN_DAILY_ANSWER_CAP} y ${BETA_DAILY_ANSWER_MAX} por día. Si se llega, no se apaga: deriva a tu contacto y te avisa.`,
    example: <UsageExample />,
  },
];

export const Proofs = ({ evalSummary }: { evalSummary: EvalSummary | null }) => (
  <section aria-labelledby="pruebas" className="mx-auto max-w-6xl px-4 py-20 md:px-8">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Las pruebas</p>
    <h2 id="pruebas" className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
      Te lo prometemos con pruebas, <span className="text-muted-foreground">no con adjetivos.</span>
    </h2>
    <ol className="mt-12 flex flex-col gap-16">
      {PROOFS(evalSummary).map(({ title, text, extra, example }, i) => (
        <li key={title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className={i % 2 ? "lg:order-2" : undefined}>
            <span className="text-sm font-bold text-[hsl(var(--ember-from))]">{i + 1}</span>
            <h3 className="mt-1 text-2xl font-bold leading-snug tracking-tight">{title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
            {extra && <div className="mt-5">{extra}</div>}
          </div>
          <div className="min-w-0">{example}</div>
        </li>
      ))}
    </ol>
  </section>
);
