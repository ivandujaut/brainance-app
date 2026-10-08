import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatEvalDate, formatRatio, PUBLISH_THRESHOLD, type EvalSet, type EvalSummary } from "@/domain/eval-summary";

// Spec 013, criterion 11: how the answers eval works, what it found and what it does not prove.

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mt-8 text-2xl font-bold">{children}</h2>;

const CRITERIA = [
  [
    "Correcta",
    "hace lo que se esperaba: responde con el dato cargado, o dice que no lo tiene y ofrece el contacto, o no se presta a lo que no corresponde.",
  ],
  [
    "Sin inventar",
    "todo dato del negocio que menciona (precios, horarios, stock, coberturas) está en la información cargada.",
  ],
  ["Tono", "castellano natural, el trato que eligió el negocio (vos o usted) y respuestas breves."],
] as const;

export const HowWeMeasure = ({ set, summary }: { set: EvalSet; summary: EvalSummary | null }) => (
  <article className="mx-auto flex max-w-3xl flex-col gap-4 leading-relaxed" data-testid="how-we-measure">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Cómo lo medimos</p>
    <h1 className="text-4xl font-bold tracking-tight">Cómo medimos si el bot inventa</h1>
    <p className="text-lg text-muted-foreground">
      Antes de que lo pongas en tu sitio, lo probamos con consultas de prueba y publicamos el resultado, también lo que
      sale mal.
    </p>

    <H2>Qué probamos</H2>
    <p>
      {set.cases} consultas escritas como las escribe la gente, sobre {set.businesses} negocios argentinos ficticios,
      cada uno con su información cargada, su contacto y su trato de vos o de usted. Son de distintos tipos:
    </p>
    <ul className="flex flex-col gap-1 pl-6 list-disc">
      {set.types.map((t) => (
        <li key={t.type}>
          {t.label}: {t.cases} {t.cases === 1 ? "consulta" : "consultas"}.
        </li>
      ))}
    </ul>

    <H2>Cómo se califica</H2>
    <p>Cada respuesta del bot la revisa otro modelo, que hace de juez, con tres criterios por separado:</p>
    <ul className="flex flex-col gap-1 pl-6 list-disc">
      {CRITERIA.map(([name, text]) => (
        <li key={name}>
          <strong>{name}:</strong> {text}
        </li>
      ))}
    </ul>
    <p>Cada consulta se corre dos veces, con el mismo modelo que usa el bot en tu sitio.</p>

    <H2>Resultados</H2>
    {summary ? (
      <>
        <p>
          Corrida del {formatEvalDate(summary.ranAt)} con {summary.model}: {summary.cases} consultas, {summary.answers}{" "}
          respuestas calificadas. Correctas: <strong>{formatRatio(summary.metrics.correcta)}</strong>. Sin inventar:{" "}
          <strong>{formatRatio(summary.metrics.sinInvento)}</strong>. Tono:{" "}
          <strong>{formatRatio(summary.metrics.tono)}</strong>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm tabular-nums">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-normal">Tipo de consulta</th>
                <th className="py-2 pr-4 font-normal">Consultas</th>
                <th className="py-2 pr-4 font-normal">Correctas</th>
                <th className="py-2 font-normal">Sin inventar</th>
              </tr>
            </thead>
            <tbody>
              {summary.byType.map((t) => (
                <tr key={t.type} className="border-t">
                  <td className="py-2 pr-4">{t.label}</td>
                  <td className="py-2 pr-4">{t.cases}</td>
                  <td className="py-2 pr-4">{formatRatio(t.correcta)}</td>
                  <td className="py-2">{formatRatio(t.sinInvento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ) : (
      <p>
        Todavía no publicamos una corrida. Los números aparecen acá cuando una corrida completa llega a nuestro umbral:{" "}
        {formatRatio(PUBLISH_THRESHOLD.sinInvento)} sin inventar y {formatRatio(PUBLISH_THRESHOLD.correcta)} correctas.
        Si no llega, primero mejoramos el bot.
      </p>
    )}

    {summary && summary.examples.length > 0 && (
      <>
        <H2>Ejemplos</H2>
        <ul className="flex flex-col gap-4">
          {summary.examples.map((e) => (
            <li key={e.question} className="rounded-xl border bg-card p-4 text-sm">
              <p className="text-xs text-muted-foreground">{e.label}</p>
              <p className="mt-2">
                <strong>Consulta:</strong> {e.question}
              </p>
              <p className="mt-1">
                <strong>Respuesta del bot:</strong> {e.answer}
              </p>
              <p className="mt-2">
                <span className={cn("font-semibold", e.correcta ? "text-foreground" : "text-destructive")}>
                  {e.correcta ? "Correcta" : "Incorrecta"}
                </span>
                {!e.sinInvento && <span className="font-semibold text-destructive"> · Inventó un dato</span>}
                {e.reason && <span className="text-muted-foreground"> · {e.reason}</span>}
              </p>
            </li>
          ))}
        </ul>
      </>
    )}

    <H2>Lo que esto no prueba</H2>
    <ul className="flex flex-col gap-1 pl-6 list-disc">
      <li>
        Las consultas no salen de conversaciones reales: las escribimos a partir de negocios ficticios. Cuando haya
        tráfico real, sumamos casos.
      </li>
      <li>La calificación la hace un modelo: el juez también es una IA y puede equivocarse.</li>
      <li>Con dos corridas por consulta, cada porcentaje tiene un margen de error de unos ±8 puntos.</li>
      <li>Mide al bot con negocios de prueba. Con el tuyo, depende de la información que cargues.</li>
    </ul>

    <p className="mt-8">
      <Link href="/" className="underline underline-offset-4">
        Volver a la portada
      </Link>
    </p>
  </article>
);
