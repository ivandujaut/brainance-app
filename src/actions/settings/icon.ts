"use server";
import { currentOwnerId } from "@/server/tenancy";
import { uploadIcon } from "@/server/storage/icons";

/** ADR 0011: the site and bot icons go through the server, which checks the file before storing it. */
export const onUploadIcon = async (form: FormData): Promise<{ url: string } | { error: string }> => {
  if (!(await currentOwnerId())) return { error: "Volvé a ingresar para subir el ícono." };
  return uploadIcon(form.get("file"));
};
