"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

/** Shown when the account could not be loaded or created, instead of a blank page. */
export const AccountError = () => {
  const router = useRouter();
  const [retrying, startRetry] = useTransition();

  return (
    <div role="alert" className="h-screen w-full flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">No pudimos cargar tu cuenta</h1>
      <p className="text-gray-500 max-w-md">
        Hubo un problema al preparar tu cuenta. Tus datos no se perdieron: probá de nuevo en unos segundos.
      </p>
      <Button disabled={retrying} onClick={() => startRetry(() => router.refresh())}>
        {retrying ? "Reintentando…" : "Reintentar"}
      </Button>
    </div>
  );
};
