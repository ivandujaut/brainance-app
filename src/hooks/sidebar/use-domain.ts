"use client";
import { AddDomainSchema } from "@/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadClient } from "@uploadcare/upload-client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { onIntegrateDomain } from "@/actions/settings";

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
});

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
    const icon = values.image?.[0] ? (await upload.uploadFile(values.image[0])).uuid : "";
    const domain = await onIntegrateDomain(values.domain, icon);
    if (domain) {
      reset();
      setLoading(false);
      toast({
        title: domain.status === 200 ? "Listo" : "No se pudo agregar",
        description: domain.message,
      });

      router.refresh();
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
