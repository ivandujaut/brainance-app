"use client";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { onMarkInstalled } from "@/actions/onboarding";
import { AddDomainForm } from "@/components/add-domain-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MIN_FAQS, type OnboardingStepId } from "@/domain/onboarding";
import { siteSettingsPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { InstallSnippet } from "./install-snippet";

type Props = {
  steps: { id: OnboardingStepId; done: boolean }[];
  site: { id: string; name: string; faqCount: number } | null;
};

const TITLES: Record<OnboardingStepId, string> = {
  "add-site": "Agregá tu sitio",
  "train-bot": "Entrená a tu bot",
  install: "Instalá el bot en tu sitio",
};

export const OnboardingChecklist = ({ steps, site }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [installing, startInstall] = useTransition();
  const doneCount = steps.filter((s) => s.done).length;

  const body: Record<OnboardingStepId, ReactNode> = {
    "add-site": <AddDomainForm className="flex flex-col gap-3 max-w-md" />,
    "train-bot": site && (
      <div className="flex flex-col gap-3 items-start">
        <p className="text-sm text-gray-500">
          Cargá al menos {MIN_FAQS} preguntas frecuentes con sus respuestas. Llevás {site.faqCount}.
        </p>
        <Button asChild>
          <Link href={siteSettingsPath(site.id)}>Cargar preguntas frecuentes</Link>
        </Button>
      </div>
    ),
    install: site && (
      <div className="flex flex-col gap-3 items-start">
        <InstallSnippet domainId={site.id} />
        <Button
          disabled={installing}
          onClick={() =>
            startInstall(async () => {
              const result = await onMarkInstalled(site.id);
              if (result.status !== 200) {
                toast({ title: "No pudimos guardar el cambio", description: "Probá de nuevo." });
                return;
              }
              router.refresh();
            })
          }
        >
          {installing ? "Guardando…" : "Ya lo instalé"}
        </Button>
      </div>
    ),
  };

  return (
    <Card data-testid="onboarding-checklist">
      <CardHeader>
        <CardTitle>Poné tu bot en marcha</CardTitle>
        <CardDescription>
          {doneCount} de {steps.length} pasos completos. Podés hacerlos a tu ritmo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <section key={step.id} data-testid={`step-${step.id}`} data-done={step.done} className="flex gap-3">
            {step.done ? (
              <CheckCircle2 className="text-primary shrink-0" aria-label="Completo" />
            ) : (
              <Circle className="text-gray-300 shrink-0" aria-label="Pendiente" />
            )}
            <div className="flex flex-col gap-3 w-full">
              <h3 className={cn("font-semibold", step.done && "text-gray-400 line-through")}>
                {index + 1}. {TITLES[step.id]}
              </h3>
              {/* Pending steps stay open so any of them can be done first; steps 2 and 3 need a site. */}
              {!step.done && body[step.id]}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
};
