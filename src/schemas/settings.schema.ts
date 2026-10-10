import { z } from "zod";
import { isValidDomain } from "@/domain/domains";
import { MAX_ICON_BYTES } from "@/domain/icon";

export const MAX_UPLOAD_SIZE = MAX_ICON_BYTES;
export const ACCEPTED_FILE_TYPES = ["image/png", "image/jpg", "image/jpeg"];

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
