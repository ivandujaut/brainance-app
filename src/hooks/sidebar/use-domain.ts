"use client";
import { AddDomainSchema } from "@/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { onIntegrateDomain } from "@/actions/settings";
import { onUploadIcon } from "@/actions/settings/icon";

export const useDomain = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof AddDomainSchema>>({
    resolver: zodResolver(AddDomainSchema),
  });

  const pathname = usePathname();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const isDomain = pathname.split("/").pop();
  const router = useRouter();

  const onAddDomain = handleSubmit(async (values) => {
    setLoading(true);
    try {
      let icon = "";
      if (values.image?.[0]) {
        const form = new FormData();
        form.append("file", values.image[0]);
        const uploaded = await onUploadIcon(form);
        if ("error" in uploaded) {
          toast({ title: "No se pudo agregar", description: uploaded.error });
          return;
        }
        icon = uploaded.url;
      }
      const domain = await onIntegrateDomain(values.domain, icon);
      if (domain) {
        reset();
        toast({
          title: domain.status === 200 ? "Listo" : "No se pudo agregar",
          description: domain.message,
        });

        router.refresh();
      }
    } catch {
      toast({ title: "No se pudo agregar", description: "Revisá tu conexión y probá de nuevo." });
    } finally {
      // The form shows a spinner while loading: it must come back whatever happens.
      setLoading(false);
    }
  });

  return {
    register,
    errors,
    onAddDomain,
    loading,
    isDomain,
  }
};
