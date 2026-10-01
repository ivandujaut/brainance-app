import { z } from "zod";
import { isValidDomain } from "@/domain/domains";

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 2; // 2MB
export const ACCEPTED_FILE_TYPES = ["image/png", "image/jpg", "image/jpeg"];

export type DomainSettingsProps = {
  domain?: string;
  image?: any;
  welcomeMessage?: string;
};

export type HelpDeskQuestionsProps = {
  question: string;
  answer: string;
};

export type AddProductProps = {
  name: string;
  image: any;
  price: string;
};

export type FilterQuestionsProps = {
  question: string;
};

const domainField = z
  .string()
  .trim()
  .toLowerCase()
  .refine(isValidDomain, "Ingresá solo el dominio, por ejemplo: minegocio.com.ar (sin http:// ni barras)");

const isAcceptedImage = (files?: FileList) =>
  !files?.length || (ACCEPTED_FILE_TYPES.includes(files[0].type) && files[0].size <= MAX_UPLOAD_SIZE);

export const AddDomainSchema = z.object({
  domain: domainField,
  // Optional: sites without an icon show their initial instead.
  image: z.any().optional().refine(isAcceptedImage, {
    message: "El ícono tiene que ser PNG o JPG de hasta 2 MB",
  }),
});

export const DomainSettingsSchema = z
  .object({
    domain: domainField
      .optional()
      .or(z.literal("").transform(() => undefined)),
    image: z.any().optional(),
    welcomeMessage: z
      .string()
      .min(6, "The message must be atleast 6 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine(
    (schema) => {
      if (schema.image?.length) {
        if (ACCEPTED_FILE_TYPES.includes(schema.image?.[0].type!) && schema.image?.[0].size <= MAX_UPLOAD_SIZE) {
          return true;
        }
      }
      if (!schema.image?.length) {
        return true;
      }
    },
    {
      message: "The fill must be less then 2MB, and on PNG, JPEG & JPG files are accepted",
      path: ["image"],
    }
  );

export const HelpDeskQuestionsSchema = z.object({
  question: z.string().min(1, { message: "Question cannot be left empty" }),
  answer: z.string().min(1, { message: "Question cannot be left empty" }),
});

export const FilterQuestionsSchema = z.object({
  question: z.string().min(1, { message: "Question cannot be left empty" }),
});

export const AddProductSchema = z.object({
  name: z.string().min(3, { message: "The name must have atleast 3 characters" }),
  image: z
    .any()
    .refine((files) => files?.[0]?.size <= MAX_UPLOAD_SIZE, {
      message: "Your file size must be less then 2MB",
    })
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), {
      message: "Only JPG, JPEG & PNG are accepted file formats",
    }),
  price: z.string(),
});
