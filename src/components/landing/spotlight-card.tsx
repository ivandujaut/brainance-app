"use client";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A card whose hairline border warms up where the pointer is (spec 009). The glow lives in the
 * border only, so the content stays calm; with reduced motion it is a plain card.
 */
export const SpotlightCard = ({ children, className }: { children: ReactNode; className?: string }) => {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const reduce = useReducedMotion();
  const glow = useMotionTemplate`radial-gradient(220px circle at ${x}px ${y}px, hsl(var(--primary)), transparent 70%)`;

  return (
    <div
      className={cn("group relative rounded-xl border bg-card p-6", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left);
        y.set(event.clientY - rect.top);
      }}
      onPointerLeave={() => {
        x.set(-200);
        y.set(-200);
      }}
    >
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: glow,
            // Only the 1px ring shows: the inside is masked out.
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: 1,
          }}
        />
      )}
      {children}
    </div>
  );
};
