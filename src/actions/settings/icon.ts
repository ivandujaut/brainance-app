"use server";
import { client } from "@/lib/prisma";
import { currentOwnerId } from "@/server/tenancy";
import { iconUploadQuota } from "@/server/storage/icon-uploads";
import { uploadIcon } from "@/server/storage/icons";

/** ADR 0011: the site and bot icons go through the server, which checks the file and the caps first. */
export const onUploadIcon = async (form: FormData): Promise<{ url: string } | { error: string }> => {
  const ownerId = await currentOwnerId();
  if (!ownerId) return { error: "Volvé a ingresar para subir el ícono." };
  return uploadIcon(form.get("file"), { quota: iconUploadQuota(client, ownerId) });
};
