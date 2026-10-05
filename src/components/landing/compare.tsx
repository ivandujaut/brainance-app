"use client";
import { ArrowLeft, ArrowRight, ChevronsLeftRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

type Shot = { src: string; alt: string; label: string };

type Props = {
  before: Shot;
  after: Shot;
  /** Where the divider starts, in percent of the width. */
  initial?: number;
  className?: string;
};

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

/**
 * Before/after slider (spec 009), after Aceternity's Compare: the "before" image sits on top and is
 * clipped at the divider. A mouse moves the divider on hover; touch drags it; the keyboard moves it
 * in steps of 5 as a standard slider. Plain CSS, no animation library.
 */
export const Compare = ({ before, after, initial = 50, className }: Props) => {
  const [position, setPosition] = useState(initial);
  const frame = useRef<HTMLDivElement>(null);

  const moveTo = (clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (rect?.width) setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    // Mouse: follow on hover. Touch and pen: only while pressed, so scrolling the page still works.
    if (event.pointerType === "mouse" || event.buttons > 0) moveTo(event.clientX);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = {
      ArrowLeft: position - 5,
      ArrowRight: position + 5,
      Home: 0,
      End: 100,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setPosition(clamp(next));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between px-1 text-sm font-semibold" aria-hidden="true">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          {before.label}
        </span>
        <span className="flex items-center gap-1.5">
          {after.label}
          <ArrowRight className="h-4 w-4 text-primary" />
        </span>
      </div>
      <div
        ref={frame}
        className="relative aspect-[16/10] w-full touch-pan-y select-none overflow-hidden rounded-2xl"
        onPointerMove={onPointerMove}
        onPointerDown={(event) => moveTo(event.clientX)}
      >
        <Image
          src={after.src}
          alt={after.alt}
          fill
          sizes="(min-width: 1152px) 1088px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes="(min-width: 1152px) 1088px, 100vw"
            className="object-cover"
          />
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Comparar sin y con BrAInance"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={position}
          aria-valuetext={`${position}% sin BrAInance`}
          onKeyDown={onKeyDown}
          className="group absolute inset-y-0 w-px -translate-x-1/2 bg-primary outline-none"
          style={{ left: `${position}%` }}
        >
          <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background text-foreground shadow-md group-focus-visible:ring-4 group-focus-visible:ring-ring/50">
            <ChevronsLeftRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
};
