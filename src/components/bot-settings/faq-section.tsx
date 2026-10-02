"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  onCreateHelpDeskQuestion,
  onDeleteHelpDeskQuestion,
  onUpdateHelpDeskQuestion,
  type SiteSettings,
} from "@/actions/settings/bot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FaqSchema, LIMITS, MAX_FAQS, canAddFaq, type Faq } from "@/domain/bot-settings";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Counter, FieldError, Section } from "./section";
import { useActionToast } from "@/hooks/use-action-toast";

type Props = { siteId: string; faqs: SiteSettings["helpdesk"] };

export const FaqSection = ({ siteId, faqs }: Props) => {
  const notify = useActionToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [, startDelete] = useTransition();
  const full = !canAddFaq(faqs.length);

  return (
    <Section
      id="preguntas-frecuentes"
      title="Preguntas frecuentes"
      description={`El bot responde con esta información. Llevás ${faqs.length} de ${MAX_FAQS}.`}
    >
      {faqs.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no cargaste preguntas. Empezá por las que más te hacen.</p>
      )}
      <ul className="flex flex-col divide-y rounded-md border" data-testid="faq-list">
        {faqs.map((faq) => (
          <li key={faq.id} className="p-4" data-testid="faq-item">
            {editing === faq.id ? (
              <FaqForm
                idPrefix={`faq-${faq.id}`}
                defaultValues={faq}
                submitLabel="Guardar"
                onCancel={() => setEditing(null)}
                onSubmit={async (values) => {
                  if (notify(await onUpdateHelpDeskQuestion(faq.id, values))) setEditing(null);
                  return true;
                }}
              />
            ) : (
              <div className="flex gap-3 items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium break-words">{faq.question}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{faq.answer}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label={`Editar “${faq.question}”`} onClick={() => setEditing(faq.id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDelete
                  title="¿Borrar esta pregunta?"
                  description={`El bot deja de usar “${faq.question}” para responder.`}
                  confirm="Borrar"
                  onConfirm={() => startDelete(async () => void notify(await onDeleteHelpDeskQuestion(faq.id)))}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={`Borrar “${faq.question}”`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      {full ? (
        <p className="text-sm text-muted-foreground" role="status">
          Llegaste al máximo de {MAX_FAQS} preguntas. Borrá o uní algunas para sumar otras.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="font-medium">Agregar una pregunta</h3>
          <FaqForm
            idPrefix="faq-new"
            defaultValues={{ question: "", answer: "" }}
            submitLabel="Agregar"
            onSubmit={async (values) => notify(await onCreateHelpDeskQuestion(siteId, values))}
          />
        </div>
      )}
    </Section>
  );
};

type FormProps = {
  idPrefix: string;
  defaultValues: Faq;
  submitLabel: string;
  /** Returns whether it was saved, to clear the form. */
  onSubmit: (values: Faq) => Promise<boolean>;
  onCancel?: () => void;
};

const FaqForm = ({ idPrefix, defaultValues, submitLabel, onSubmit, onCancel }: FormProps) => {
  const form = useForm<Faq>({ resolver: zodResolver(FaqSchema), defaultValues });
  const { errors, isSubmitting } = form.formState;
  const [question, answer] = useWatch({ control: form.control, name: ["question", "answer"] });
  const submit = form.handleSubmit(async (values) => {
    if (await onSubmit(values)) form.reset(defaultValues);
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <Label htmlFor={`${idPrefix}-question`}>Pregunta</Label>
          <Counter value={question} max={LIMITS.question} />
        </div>
        <Input id={`${idPrefix}-question`} placeholder="Ej.: ¿Hacen envíos?" {...form.register("question")} />
        <FieldError message={errors.question?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <Label htmlFor={`${idPrefix}-answer`}>Respuesta</Label>
          <Counter value={answer} max={LIMITS.answer} />
        </div>
        <Textarea id={`${idPrefix}-answer`} rows={3} placeholder="Ej.: Sí, a todo el país por correo." {...form.register("answer")} />
        <FieldError message={errors.answer?.message} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
};
