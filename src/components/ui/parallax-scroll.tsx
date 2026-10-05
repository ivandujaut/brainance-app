"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Aceternity's ParallaxScroll (`npx shadcn@latest add @aceternity/parallax-scroll`), adapted for the
 * landing (spec 009):
 * - takes any items (our question cards), not only image URLs, as one list for screen readers;
 * - follows the page's scroll while the grid crosses the screen, instead of an inner fixed-height
 *   scroll box that would trap the wheel and the finger;
 * - each column travels centered on its resting place, so the first items start in view;
 * - still with reduced motion, and on screens below `lg`, where the columns stack.
 */
export const ParallaxScroll = ({
  items,
  label,
  className,
}: {
  items: { key: string; content: ReactNode }[];
  label: string;
  className?: string;
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const third = Math.ceil(items.length / 3);
  const parts = [items.slice(0, third), items.slice(third, 2 * third), items.slice(2 * third)];
  const translates = [translateFirst, translateSecond, translateThird];

  return (
    <div
      ref={gridRef}
      role="list"
      aria-label={label}
      className={cn("grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
    >
      {parts.map((part, column) => (
        <motion.div
          key={column}
          data-testid="parallax-column"
          // CSS, not useReducedMotion: it applies from the first paint, before motion writes any offset.
          className="grid gap-4 max-lg:![transform:none] motion-reduce:![transform:none]"
          style={{ y: translates[column] }}
        >
          {part.map((item) => (
            <div key={item.key} role="listitem">
              {item.content}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};
