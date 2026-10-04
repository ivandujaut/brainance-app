import Link from "next/link";
import type { MetricsPeriod, OwnerMetrics as Metrics } from "@/actions/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DailyChart } from "./daily-chart";
import { StatTile } from "./stat-tile";

type Props = { metrics: Metrics; sites: { id: string; name: string }[]; siteId?: string; days: MetricsPeriod };

const percent = new Intl.NumberFormat("es-AR", { style: "percent", maximumFractionDigits: 0 });

const href = ({ siteId, days }: { siteId?: string; days: MetricsPeriod }) => {
  const params = new URLSearchParams();
  if (days !== 7) params.set("days", String(days));
  if (siteId) params.set("site", siteId);
  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
};

/** Spec 007, criteria 11–12: what the bot brought in, per period and site. */
export const OwnerMetrics = ({ metrics, sites, siteId, days }: Props) => {
  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-sm",
      active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    );
  const empty = metrics.series.every((d) => d.conversations === 0 && d.leads === 0);

  return (
    <section className="flex flex-col gap-4" aria-label="Métricas" data-testid="owner-metrics">
      <nav aria-label="Filtros de métricas" className="flex flex-wrap gap-2">
        {([7, 30] as const).map((d) => (
          <Link key={d} href={href({ siteId, days: d })} className={pill(d === days)} aria-current={d === days ? "page" : undefined}>
            Últimos {d} días
          </Link>
        ))}
        {sites.length > 1 && (
          <>
            <span className="mx-1 w-px bg-border" aria-hidden="true" />
            <Link href={href({ days })} className={pill(!siteId)}>
              Todos los sitios
            </Link>
            {sites.map((s) => (
              <Link key={s.id} href={href({ siteId: s.id, days })} className={pill(s.id === siteId)}>
                {s.name}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Conversaciones" value={String(metrics.conversations)} testId="metric-conversations" />
        <StatTile label="Leads" value={String(metrics.leads)} testId="metric-leads" />
        <StatTile
          label="Tasa de captura"
          value={percent.format(metrics.captureRate)}
          hint="Leads sobre conversaciones respondidas"
          testId="metric-capture-rate"
        />
        <StatTile
          label="Necesitaron atención"
          value={String(metrics.needingAttention)}
          hint="El bot derivó o pidieron una persona"
          testId="metric-attention"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversaciones y leads por día</CardTitle>
        </CardHeader>
        <CardContent>
          {empty ? (
            <p className="text-sm text-muted-foreground" data-testid="metrics-empty">
              No hubo conversaciones en este período. Cuando tus visitantes escriban en el chat, las vas a ver acá.
            </p>
          ) : (
            <DailyChart series={metrics.series} />
          )}
        </CardContent>
      </Card>
    </section>
  );
};
