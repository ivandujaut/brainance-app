"use client";
import { Eye } from "lucide-react";
import { useState } from "react";
import type { SiteSettings } from "@/actions/settings/bot";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { WIDGET_DEFAULT_COLOR, WIDGET_DEFAULT_WELCOME } from "@/domain/bot-settings";
import { AppearanceForm, type Look } from "./appearance-form";
import { BusinessForm } from "./business-form";
import { FaqSection } from "./faq-section";
import { FilterQuestionsSection } from "./filter-questions-section";
import { InstallSection } from "./install-section";
import { LeadSettingsSection } from "./lead-settings-section";
import { Preview } from "./preview";

const SECTIONS = [
  { id: "negocio", label: "Negocio" },
  { id: "apariencia", label: "Apariencia" },
  { id: "preguntas-frecuentes", label: "Preguntas frecuentes" },
  { id: "calificacion", label: "Calificación" },
  { id: "captura", label: "Captura de datos" },
  { id: "instalacion", label: "Instalación" },
];

/** Settings page of one site (spec 004): sections on the left, the real widget as a live preview on the right. */
export const BotSettings = ({ settings }: { settings: SiteSettings }) => {
  const bot = settings.chatBot;
  // Unsaved appearance changes, so the preview reflects them before saving.
  const [look, setLook] = useState<Look>({
    background: bot?.background || WIDGET_DEFAULT_COLOR,
    welcomeMessage: bot?.welcomeMessage || WIDGET_DEFAULT_WELCOME,
    icon: bot?.icon || null,
  });
  const preview = <Preview siteId={settings.id} name={settings.name} look={look} />;

  return (
    <div className="flex-1 h-0 overflow-y-auto w-full pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Configuración del bot</p>
          <h1 className="text-3xl font-bold break-all">{settings.name}</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden" data-testid="open-preview">
              <Eye className="mr-2 h-4 w-4" /> Ver cómo queda
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
            <SheetHeader>
              <SheetTitle>Vista previa</SheetTitle>
            </SheetHeader>
            <div className="flex-1 min-h-0">{preview}</div>
          </SheetContent>
        </Sheet>
      </header>

      <nav aria-label="Secciones" className="flex flex-wrap gap-2 mb-6">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <BusinessForm siteId={settings.id} bot={bot} />
          <AppearanceForm siteId={settings.id} look={look} onChange={setLook} />
          <FaqSection siteId={settings.id} faqs={settings.helpdesk} />
          <FilterQuestionsSection siteId={settings.id} questions={settings.filterQuestions} />
          <LeadSettingsSection
            siteId={settings.id}
            leadCapture={bot?.leadCapture ?? true}
            leadEmail={bot?.leadEmail ?? true}
          />
          <InstallSection siteId={settings.id} name={settings.name} installedAt={bot?.installedAt ?? null} />
        </div>
        <aside className="hidden lg:block sticky top-0 h-[600px]" aria-label="Vista previa">
          {preview}
        </aside>
      </div>
    </div>
  );
};
