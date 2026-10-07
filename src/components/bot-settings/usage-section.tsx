"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { onUpdateDailyAnswerCap, type SiteUsage } from "@/actions/settings/bot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BETA_DAILY_ANSWER_MAX, MIN_DAILY_ANSWER_CAP } from "@/domain/answer-cap";
import { FieldError, Section } from "./section";
import { useActionToast } from "@/hooks/use-action-toast";

type Props = { siteId: string; usage: SiteUsage; dailyAnswerCap: number | null };

/** Spec 011, criteria 7, 8 and 12: today's answers against the cap, and the owner's own cap, saved on blur. */
export const UsageSection = ({ siteId, usage, dailyAnswerCap }: Props) => {
  const notify = useActionToast();
  const [value, setValue] = useState(dailyAnswerCap === null ? "" : String(dailyAnswerCap));
  const [saved, setSaved] = useState(value);
  const [error, setError] = useState<string>();
  const [saving, startSave] = useTransition();
  const percent = Math.round(usage.ratio * 100);

  const save = () => {
    if (value.trim() === saved.trim()) return;
    startSave(async () => {
      const result = await onUpdateDailyAnswerCap(siteId, { dailyAnswerCap: value });
      if (result.status === 400) {
        setError(result.message);
        return;
      }
      setError(undefined);
      if (notify(result)) setSaved(value);
    });
  };

  return (
    <Section
      id="uso"
      title="Uso y tope"
      description="Cuántas respuestas dio el bot en las últimas 24 horas y hasta dónde puede llegar."
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium" data-testid="usage-today">
          {`Hoy: ${usage.answersToday} de ${usage.cap} respuestas`}
        </p>
        <div
          role="progressbar"
          aria-label="Respuestas de hoy"
          aria-valuemin={0}
          aria-valuemax={usage.cap}
          aria-valuenow={Math.min(usage.answersToday, usage.cap)}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={usage.reached ? "h-full bg-destructive" : "h-full bg-primary"}
            style={{ width: `${percent}%` }}
          />
        </div>
        {usage.reached && (
          <p className="text-sm text-destructive" data-testid="usage-reached">
            Hoy el bot llegó al tope y está derivando. Libera cupo a medida que pasan 24 horas de cada respuesta.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Cuando se llega al tope, el bot deja de responder con IA y deriva a tu contacto. No se apaga.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="daily-answer-cap">Tope diario de respuestas</Label>
        <Input
          id="daily-answer-cap"
          type="number"
          inputMode="numeric"
          min={MIN_DAILY_ANSWER_CAP}
          max={BETA_DAILY_ANSWER_MAX}
          placeholder={String(BETA_DAILY_ANSWER_MAX)}
          className="max-w-[10rem]"
          value={value}
          disabled={saving}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          aria-describedby="daily-answer-cap-hint"
        />
        <FieldError message={error} />
        <p id="daily-answer-cap-hint" className="text-sm text-muted-foreground">
          {`Entre ${MIN_DAILY_ANSWER_CAP} y ${BETA_DAILY_ANSWER_MAX}. Vacío: el máximo de la beta (${BETA_DAILY_ANSWER_MAX} por día). Sirve si tu sitio recibe mucho tráfico o alguien se pone a jugar con el chat.`}
        </p>
        <p className="text-sm text-muted-foreground">
          Cuando el bot llega al tope te avisamos por email, si tenés el aviso activado en{" "}
          <Link href="#captura" className="underline underline-offset-2 text-foreground">
            Captura de datos
          </Link>
          .
        </p>
      </div>
    </Section>
  );
};
