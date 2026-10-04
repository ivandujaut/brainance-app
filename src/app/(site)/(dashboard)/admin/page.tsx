import Link from "next/link";
import { notFound } from "next/navigation";
import { StatTile } from "@/components/metrics/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dailyCostCapUsd } from "@/domain/cost-cap";
import { PRICES_VERIFIED_AT } from "@/domain/model-prices";
import { client } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { adminMetrics, isAdmin } from "@/server/admin-metrics";
import { currentOwnerId } from "@/server/tenancy";

type Props = { searchParams: Promise<{ days?: string }> };

const usd = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const percent = new Intl.NumberFormat("es-AR", { style: "percent", maximumFractionDigits: 1 });
const seconds = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const ms = (value: number | null) => (value === null ? "—" : `${seconds.format(value / 1000)} s`);

// Spec 007, criteria 14–15: operator view. Anyone outside ADMIN_CLERK_IDS gets the same 404 as a
// missing page.
const AdminPage = async ({ searchParams }: Props) => {
  if (!isAdmin(await currentOwnerId())) notFound();
  const raw = (await searchParams).days;
  const days = raw === "7" ? 7 : raw === "30" ? 30 : 1;
  const capUsd = dailyCostCapUsd(process.env.AI_SITE_DAILY_COST_USD);
  const m = await adminMetrics(client, { days, capUsd });

  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-sm",
      active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    );

  return (
    <div className="flex-1 h-0 overflow-y-auto flex flex-col gap-6 pb-10">
      <header>
        <h1 className="text-3xl font-bold">Administración</h1>
        <p className="text-sm text-muted-foreground">
          Uso de IA estimado con precios verificados el {PRICES_VERIFIED_AT}. Tope diario por sitio: {usd.format(capUsd)}.
        </p>
      </header>
      <nav aria-label="Período" className="flex gap-2">
        {([1, 7, 30] as const).map((d) => (
          <Link key={d} href={d === 1 ? "/admin" : `/admin?days=${d}`} className={pill(d === days)}>
            {d === 1 ? "Últimas 24 horas" : `Últimos ${d} días`}
          </Link>
        ))}
      </nav>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Costo de IA" value={usd.format(m.totalCostUsd)} hint={`${m.calls} respuestas`} testId="admin-cost" />
        <StatTile label="Latencia p50" value={ms(m.latencyP50)} />
        <StatTile label="Latencia p95" value={ms(m.latencyP95)} />
        <StatTile label="Errores del modelo" value={percent.format(m.errorRate)} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Costo por sitio</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {m.sites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hubo llamadas al modelo en este período.</p>
          ) : (
            <table className="w-full text-sm tabular-nums" data-testid="admin-sites">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 font-normal">Sitio</th>
                  <th className="py-2 font-normal">Dueño</th>
                  <th className="py-2 font-normal text-right">Respuestas</th>
                  <th className="py-2 font-normal text-right">Errores</th>
                  <th className="py-2 font-normal text-right">Costo</th>
                  <th className="py-2 font-normal text-right">Últimas 24 h</th>
                </tr>
              </thead>
              <tbody>
                {m.sites.map((s) => (
                  <tr key={s.domainId} className="border-t">
                    <td className="py-2">
                      {s.site}{" "}
                      {s.nearCap && (
                        <Badge variant="destructive" className="ml-1">
                          Cerca del tope
                        </Badge>
                      )}
                    </td>
                    <td className="py-2">{s.owner}</td>
                    <td className="py-2 text-right">{s.calls}</td>
                    <td className="py-2 text-right">{s.errors}</td>
                    <td className="py-2 text-right">{usd.format(s.costUsd)}</td>
                    <td className="py-2 text-right">{usd.format(s.spentTodayUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
