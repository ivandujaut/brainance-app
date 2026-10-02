import Link from "next/link";
import { onListLeads, onListLeadSites } from "@/actions/leads";
import { LeadsTable } from "@/components/leads/leads-table";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ site?: string }> };

// Spec 005, criteria 12–14: the owner's leads across their sites.
const LeadsPage = async ({ searchParams }: Props) => {
  const { site } = await searchParams;
  const sites = await onListLeadSites();
  const selected = sites.find((s) => s.id === site)?.id;
  const leads = await onListLeads(selected);

  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-sm",
      active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    );

  return (
    <div className="flex-1 h-0 overflow-y-auto w-full pb-10 flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-sm text-muted-foreground">Visitantes que dejaron sus datos en el chat de tus sitios.</p>
      </header>

      {sites.length > 1 && (
        <nav aria-label="Filtrar por sitio" className="flex flex-wrap gap-2">
          <Link href="/leads" className={pill(!selected)} aria-current={!selected ? "page" : undefined}>
            Todos
          </Link>
          {sites.map((s) => (
            <Link
              key={s.id}
              href={`/leads?site=${s.id}`}
              className={pill(s.id === selected)}
              aria-current={s.id === selected ? "page" : undefined}
            >
              {s.name}
            </Link>
          ))}
        </nav>
      )}

      <LeadsTable leads={leads} siteId={selected} />
    </div>
  );
};

export default LeadsPage;
