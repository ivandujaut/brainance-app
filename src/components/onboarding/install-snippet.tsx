"use client";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { buildInstallSnippet } from "@/domain/snippet";
import { getAppUrl } from "@/lib/app-url";

type Props = { domainId: string };

export const InstallSnippet = ({ domainId }: Props) => {
  const { toast } = useToast();
  const snippet = buildInstallSnippet({ appUrl: getAppUrl(), domainId });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Pegá esta línea antes de <code>&lt;/body&gt;</code> en todas las páginas de tu sitio.
      </p>
      <div className="relative bg-muted rounded-lg p-4 pr-12">
        <button
          type="button"
          aria-label="Copiar código"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={async () => {
            await navigator.clipboard.writeText(snippet);
            toast({ title: "Código copiado", description: "Ahora pegalo en tu sitio." });
          }}
        >
          <Copy size={18} />
        </button>
        <pre className="whitespace-pre-wrap break-all text-sm text-foreground">
          <code data-testid="install-snippet">{snippet}</code>
        </pre>
      </div>
    </div>
  );
};
