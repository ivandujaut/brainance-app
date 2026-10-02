"use client";
import { Download, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { onDeleteLead, onExportLeads, type Lead } from "@/actions/leads";
import { useActionToast } from "@/hooks/use-action-toast";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const date = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

type Props = { leads: Lead[]; siteId?: string };

export const LeadsTable = ({ leads, siteId }: Props) => {
  const notify = useActionToast();
  const [exporting, startExport] = useTransition();
  const [, startDelete] = useTransition();

  const download = () =>
    startExport(async () => {
      const csv = await onExportLeads(siteId);
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: `leads-${new Date().toISOString().slice(0, 10)}.csv`,
      });
      link.click();
      URL.revokeObjectURL(url);
    });

  if (!leads.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground" data-testid="leads-empty">
          Todavía no hay leads. Aparecen cuando un visitante deja su email en el chat.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {leads.length} {leads.length === 1 ? "lead" : "leads"}
        </p>
        <Button variant="outline" onClick={download} disabled={exporting} data-testid="leads-export">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <ul className="flex flex-col gap-3" data-testid="leads-list">
        {leads.map((lead) => (
          <li key={lead.id}>
            <Card data-testid="lead-row">
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <a href={`mailto:${lead.email}`} className="font-medium break-all underline-offset-2 hover:underline">
                    {lead.email}
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {lead.site} · {date.format(new Date(lead.createdAt))}
                  </p>
                  {lead.responses.length > 0 && (
                    <dl className="mt-2 grid gap-1 text-sm">
                      {lead.responses.map((r) => (
                        <div key={r.question} className="break-words">
                          <dt className="inline text-muted-foreground">{r.question} </dt>
                          <dd className="inline">{r.answered}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
                <ConfirmDelete
                  title="¿Borrar este lead?"
                  description={`Se borran el email ${lead.email} y sus respuestas. La conversación queda, sin datos personales.`}
                  confirm="Borrar"
                  onConfirm={() => startDelete(async () => void notify(await onDeleteLead(lead.id)))}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={`Borrar ${lead.email}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};
