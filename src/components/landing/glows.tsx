import { cn } from "@/lib/utils";

// Spec 009, "Brasa": blurred brand-orange, coral and amber glows behind a section. They span the whole
// viewport, stay inside their section (fading out at its top and bottom edges) and take their colors
// and strength from the paper tokens.
const LAYOUTS = {
  hero: [
    "left-[-8%] top-[8%] h-[420px] w-[620px] bg-[hsl(var(--glow-1))]",
    "right-[-6%] top-[2%] h-[420px] w-[560px] bg-[hsl(var(--glow-2))] opacity-60",
    "left-[34%] top-[46%] h-[380px] w-[700px] bg-[hsl(var(--glow-3))]",
  ],
  cta: [
    "left-[-6%] top-[10%] h-[300px] w-[520px] bg-[hsl(var(--glow-1))]",
    "right-[4%] top-[20%] h-[280px] w-[460px] bg-[hsl(var(--glow-2))] opacity-60",
  ],
};

export const Glows = ({ layout }: { layout: keyof typeof LAYOUTS }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden opacity-[var(--glow-opacity)] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
  >
    {LAYOUTS[layout].map((blob) => (
      <span key={blob} className={cn("absolute rounded-full blur-[90px]", blob)} />
    ))}
  </div>
);
