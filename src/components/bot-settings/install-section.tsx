"use client";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { onDeleteUserDomain, onUpdatedDomain } from "@/actions/settings";
import { InstallSnippet } from "@/components/onboarding/install-snippet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Section } from "./section";
import { useActionToast } from "@/hooks/use-action-toast";

type Props = { siteId: string; name: string; installedAt: Date | null };

export const InstallSection = ({ siteId, name, installedAt }: Props) => {
  const router = useRouter();
  const notify = useActionToast();
  const [domain, setDomain] = useState(name);
  const [renaming, startRename] = useTransition();
  const [deleting, startDelete] = useTransition();

  const onRename = (event: FormEvent) => {
    event.preventDefault();
    startRename(async () => {
      if (notify(await onUpdatedDomain(siteId, domain))) router.refresh();
    });
  };

  return (
    <Section id="instalacion" title="Instalación" description="El código para tu sitio y los datos del dominio.">
      <p className="flex items-center gap-2 text-sm" data-testid="install-status">
        {installedAt ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-primary" /> Detectamos el chat en tu sitio.
          </>
        ) : (
          <>
            <CircleDashed className="h-4 w-4 text-muted-foreground" /> Todavía no detectamos el chat en tu sitio.
          </>
        )}
      </p>
      <InstallSnippet domainId={siteId} />

      <Separator />

      <form onSubmit={onRename} className="flex flex-col gap-2">
        <Label htmlFor="domain-name">Dominio</Label>
        <div className="flex gap-2">
          <Input id="domain-name" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <Button type="submit" variant="outline" disabled={renaming || domain.trim() === name}>
            Cambiar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">El chat solo se muestra en este dominio y sus subdominios.</p>
      </form>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Borrar el sitio elimina el bot, sus preguntas y las conversaciones.</p>
        <ConfirmDelete
          title={`¿Borrar ${name}?`}
          description="Se borran el bot, las preguntas frecuentes y todas las conversaciones. No se puede deshacer."
          confirm="Borrar sitio"
          onConfirm={() =>
            startDelete(async () => {
              if (notify(await onDeleteUserDomain(siteId))) router.push("/dashboard");
            })
          }
          trigger={
            <Button variant="destructive" disabled={deleting}>
              Borrar sitio
            </Button>
          }
        />
      </div>
    </Section>
  );
};
