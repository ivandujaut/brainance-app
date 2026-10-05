import { cn } from "@/lib/utils";

/** "BrAInance" in the brand typeface (Plus Jakarta Sans, bold), with the brand orange as an underline under "AI". */
export const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn("font-bold tracking-tight", className)}>
    Br
    <span className="relative">
      AI
      {/* As text the orange would not reach AA on light surfaces; as an underline it is decoration. */}
      <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-primary" />
    </span>
    nance
  </span>
);
