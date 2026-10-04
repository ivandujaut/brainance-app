"use client";
import Link from "next/link";
import { useTransition } from "react";
import { onAcceptTerms } from "@/actions/auth";
import { Button } from "@/components/ui/button";

/** Non-blocking notice for accounts that have not accepted the current terms (spec 008). */
export const TermsBanner = () => {
  const [pending, startTransition] = useTransition();
  return (
    <div role="status" data-testid="terms-banner" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted px-4 py-3 text-sm">
      <p>
        Actualizamos los{" "}
        <Link href="/terminos" target="_blank" className="underline underline-offset-2">
          Términos
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" target="_blank" className="underline underline-offset-2">
          Política de privacidad
        </Link>
        .
      </p>
      <Button size="sm" disabled={pending} onClick={() => startTransition(() => onAcceptTerms())}>
        Aceptar
      </Button>
    </div>
  );
};
