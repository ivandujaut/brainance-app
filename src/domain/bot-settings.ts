import { z } from "zod";
import { isHexColor } from "./color-contrast";

// Rules for the bot settings forms (spec 004). Shared by the client forms and the server actions.

export const LIMITS = {
  description: 1000,
  contact: 200,
  welcomeMessage: 300,
  question: 200,
  answer: 1000,
} as const;

/** Until the RAG of roadmap item 4 exists, every FAQ goes into the prompt, so they are capped. */
export const MAX_FAQS = 50;

export const canAddFaq = (current: number) => current < MAX_FAQS;

export const ADDRESSING = ["vos", "usted"] as const;
export type Addressing = (typeof ADDRESSING)[number];

/** What the widget shows until the owner saves their own. */
export const WIDGET_DEFAULT_COLOR = "#FFA947";
export const WIDGET_DEFAULT_WELCOME = "¡Hola! ¿En qué te puedo ayudar?";

/** Starting points for the owner; any other hex color is accepted too. */
export const SUGGESTED_COLORS = ["#FFA947", "#E11D48", "#7C3AED", "#2563EB", "#0EA5E9", "#10B981", "#FACC15", "#0F172A"];

/** Blank text means "not set": stored as null so the widget falls back to its defaults. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} puede tener hasta ${max} caracteres.`)
    .transform((value) => value || null);

const requiredText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `Completá ${label.toLowerCase()}.`)
    .max(max, `${label} puede tener hasta ${max} caracteres.`);

export const BusinessInfoSchema = z.object({
  description: optionalText(LIMITS.description, "La descripción"),
  addressing: z.enum(ADDRESSING, { errorMap: () => ({ message: "Elegí vos o usted." }) }),
  contact: optionalText(LIMITS.contact, "El contacto"),
});

export const AppearanceSchema = z.object({
  background: z
    .string()
    .trim()
    .refine(isHexColor, "Ingresá un color en formato #RRGGBB.")
    .transform((value) => value.toUpperCase()),
  welcomeMessage: requiredText(LIMITS.welcomeMessage, "El mensaje de bienvenida"),
  // Uploadcare file id; null shows the site's initial instead.
  icon: z.string().uuid("El ícono no es válido.").nullable(),
});

export const FaqSchema = z.object({
  question: requiredText(LIMITS.question, "La pregunta"),
  answer: requiredText(LIMITS.answer, "La respuesta"),
});

export const FilterQuestionSchema = z.object({
  question: requiredText(LIMITS.question, "La pregunta"),
});

export type BusinessInfo = z.output<typeof BusinessInfoSchema>;
export type Appearance = z.output<typeof AppearanceSchema>;
export type Faq = z.output<typeof FaqSchema>;
