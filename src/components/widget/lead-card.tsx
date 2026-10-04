"use client";
import { useState, type FormEvent } from "react";
import { LEAD_LIMITS, LeadFormSchema } from "@/domain/leads";

export type LeadQuestion = { id: string; question: string };

type Props = {
  businessName: string;
  questions: LeadQuestion[];
  accent: { backgroundColor: string; color: string };
  /** Posts the data; resolves with an error message, or null when saved. */
  onSubmit: (data: { email: string; answers: { questionId: string; answer: string }[] }) => Promise<string | null>;
  onDismiss: () => void;
};

/** Lead form inside the chat (spec 005): email plus the site's qualifying questions. */
export const LeadCard = ({ businessName, questions, accent, onSubmit, onDismiss }: Props) => {
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const data = { email, answers: questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" })) };
    const parsed = LeadFormSchema.safeParse(data);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Revisá tus datos.");
    setError(null);
    setSending(true);
    const failure = await onSubmit(parsed.data);
    setSending(false);
    if (failure) setError(failure);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      data-testid="lead-card"
      className="self-stretch rounded-2xl border border-gray-200 bg-white p-3 flex flex-col gap-2 text-sm text-gray-800"
    >
      <p className="font-semibold">¿Querés que {businessName} te contacte?</p>
      <label className="flex flex-col gap-1">
        <span>Tu email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </label>
      {questions.map((q) => (
        <label key={q.id} className="flex flex-col gap-1">
          <span>
            {q.question} <span className="text-gray-500">(opcional)</span>
          </span>
          <input
            value={answers[q.id] ?? ""}
            maxLength={LEAD_LIMITS.answerLength + 50}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </label>
      ))}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <p className="text-xs text-gray-600" data-testid="lead-consent">
        Al enviar, aceptás que {businessName} use estos datos para responder tu consulta.{" "}
        <a href="/privacidad" target="_blank" rel="noopener" className="underline underline-offset-2" data-testid="lead-privacy">
          Más información
        </a>
      </p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDismiss} className="rounded-full px-3 py-1.5 text-gray-700 hover:bg-gray-100">
          Ahora no
        </button>
        <button type="submit" disabled={sending} className="rounded-full px-4 py-1.5 font-medium disabled:opacity-50" style={accent}>
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </form>
  );
};
