"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { onCreateFilterQuestion, onDeleteFilterQuestion, type SiteSettings } from "@/actions/settings/bot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterQuestionSchema } from "@/domain/bot-settings";
import { ConfirmDelete } from "./confirm-delete";
import { FieldError, Section } from "./section";
import { useActionToast } from "./use-action-toast";

type Props = { siteId: string; questions: SiteSettings["filterQuestions"] };

export const FilterQuestionsSection = ({ siteId, questions }: Props) => {
  const notify = useActionToast();
  const [, startDelete] = useTransition();
  const form = useForm<z.infer<typeof FilterQuestionSchema>>({
    resolver: zodResolver(FilterQuestionSchema),
    defaultValues: { question: "" },
  });
  const { errors, isSubmitting } = form.formState;
  const onSubmit = form.handleSubmit(async (values) => {
    if (notify(await onCreateFilterQuestion(siteId, values))) form.reset();
  });

  return (
    <Section
      id="calificacion"
      title="Preguntas de calificación"
      description="Lo que querés saber de cada visitante (por ejemplo, su email). El bot las va a usar cuando se active la captura de contactos."
    >
      {questions.length > 0 && (
        <ul className="flex flex-col divide-y rounded-md border" data-testid="filter-question-list">
          {questions.map((q) => (
            <li key={q.id} className="flex items-center gap-3 px-4 py-2">
              <span className="flex-1 break-words">{q.question}</span>
              <ConfirmDelete
                title="¿Borrar esta pregunta?"
                description={`“${q.question}” deja de estar en la lista.`}
                confirm="Borrar"
                onConfirm={() => startDelete(async () => void notify(await onDeleteFilterQuestion(q.id)))}
                trigger={
                  <Button variant="ghost" size="icon" aria-label={`Borrar “${q.question}”`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
        <Label htmlFor="filter-question">Nueva pregunta</Label>
        <div className="flex gap-2">
          <Input id="filter-question" placeholder="Ej.: ¿Cuál es tu email?" {...form.register("question")} />
          <Button type="submit" disabled={isSubmitting}>
            Agregar
          </Button>
        </div>
        <FieldError message={errors.question?.message} />
      </form>
    </Section>
  );
};
