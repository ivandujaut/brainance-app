"use client";
import { useToast } from "@/components/ui/use-toast";

/** Shows a server action's result and tells the caller whether it worked. */
export const useActionToast = () => {
  const { toast } = useToast();
  return (result: { status: number; message: string }) => {
    const ok = result.status === 200;
    toast({ title: ok ? "Listo" : "No se guardó", description: result.message, variant: ok ? "default" : "destructive" });
    return ok;
  };
};
