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
 * - two or three columns: with two, the first goes up and the second down;
 * - still with reduced motion, and on screens below `lg`, where the columns stack.
 */
export const ParallaxScroll = ({
  items,
  label,
  columns = 3,
  className,
  columnClassName,
}: {
  items: { key: string; content: ReactNode }[];
  label: string;
  columns?: 2 | 3;
  className?: string;
  columnClassName?: string;
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const size = Math.ceil(items.length / columns);
  const parts = Array.from({ length: columns }, (_, c) => items.slice(c * size, (c + 1) * size));
  const translates = [translateFirst, translateSecond, translateThird];

  return (
    <div
      ref={gridRef}
      role="list"
      aria-label={label}
      className={cn("grid grid-cols-1 items-start gap-4 md:grid-cols-2", columns === 3 && "lg:grid-cols-3", className)}
    >
      {parts.map((part, column) => (
        <motion.div
          key={column}
          data-testid="parallax-column"
          // CSS, not useReducedMotion: it applies from the first paint, before motion writes any offset.
          className={cn("grid gap-4 max-lg:![transform:none] motion-reduce:![transform:none]", columnClassName)}
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
