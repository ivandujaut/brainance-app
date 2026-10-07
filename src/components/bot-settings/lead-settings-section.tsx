"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { onUpdateLeadSettings } from "@/actions/settings/bot";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Section } from "./section";
import { useActionToast } from "@/hooks/use-action-toast";

type Props = { siteId: string; leadCapture: boolean; leadEmail: boolean; attentionEmail: boolean };

/** Lead capture and its owner email (spec 005, criterion 15) and the attention notice (spec 010, criterion 6), per site. Each switch saves on change. */
export const LeadSettingsSection = ({ siteId, ...initial }: Props) => {
  const notify = useActionToast();
  const [settings, setSettings] = useState(initial);
  const [saving, startSave] = useTransition();

  const change = (patch: Partial<Props>) => {
    const previous = settings;
    const next = { ...settings, ...patch };
    setSettings(next);
    startSave(async () => {
      if (!notify(await onUpdateLeadSettings(siteId, next))) setSettings(previous);
    });
  };

  return (
    <Section
      id="captura"
      title="Captura de datos"
      description="Después de la primera respuesta, el chat ofrece al visitante dejar su email y responder tus preguntas de calificación."
    >
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="lead-capture" className="font-normal">
          Pedir datos a los visitantes
        </Label>
        <Switch
          id="lead-capture"
          checked={settings.leadCapture}
          disabled={saving}
          onCheckedChange={(leadCapture) => change({ leadCapture })}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="lead-email" className="font-normal">
          Avisarme por email cuando llega un lead
        </Label>
        <Switch
          id="lead-email"
          checked={settings.leadEmail}
          disabled={saving || !settings.leadCapture}
          onCheckedChange={(leadEmail) => change({ leadEmail })}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="attention-email" className="font-normal">
          Avisarme por email cuando una conversación me necesita
        </Label>
        <Switch
          id="attention-email"
          checked={settings.attentionEmail}
          disabled={saving}
          onCheckedChange={(attentionEmail) => change({ attentionEmail })}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Cuando el bot deriva a tu contacto, el visitante pide una persona o el sitio llega al tope del día, te llega un email
        con la conversación y un link para tomar el control.
      </p>
      <p className="text-sm text-muted-foreground">
        Los datos que dejan tus visitantes están en{" "}
        <Link href={`/leads?site=${siteId}`} className="underline underline-offset-2 text-foreground">
          Leads
        </Link>
        .
      </p>
    </Section>
  );
};
