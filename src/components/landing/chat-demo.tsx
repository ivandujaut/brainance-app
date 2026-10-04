"use client";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { BellRing, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WidgetChat } from "@/components/widget/chat";
import { readableTextColor } from "@/domain/color-contrast";
import { cn } from "@/lib/utils";
import { DEMO_SCENARIOS, type DemoScenario } from "./demo-scripts";

type Shown = { id: string; role: "user" | "assistant"; content: string }[];

const WORD_MS = 45;
const THINK_MS = 900;
const PAUSE_MS = 1100;
const HOLD_MS = 4200;

const finalMessages = (s: DemoScenario): Shown =>
  s.turns.map((t, i) => ({ id: `${s.id}-${i}`, role: t.role, content: t.text }));

/**
 * The real widget (preview mode) playing a scripted conversation (spec 009). The answer appears
 * word by word, like a generated reply. Pauses off screen; with reduced motion it shows the
 * finished conversation.
 */
export const ChatDemo = () => {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [shown, setShown] = useState<Shown>([]);
  const [done, setDone] = useState(false);
  const reduce = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const visible = useInView(frame, { amount: 0.3 });
  const scenario = DEMO_SCENARIOS[index];

  useEffect(() => {
    if (reduce || !visible) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));

    const play = async () => {
      setShown([]);
      setDone(false);
      const acc: Shown = [];
      await wait(600);
      for (const [i, turn] of scenario.turns.entries()) {
        if (cancelled) return;
        const id = `${scenario.id}-${i}`;
        if (turn.role === "user") {
          acc.push({ id, role: "user", content: turn.text });
          setShown([...acc]);
          await wait(THINK_MS);
          continue;
        }
        // Typing indicator, then the answer word by word.
        acc.push({ id, role: "assistant", content: "" });
        setShown([...acc]);
        await wait(THINK_MS);
        const words = turn.text.split(/(?<= )/);
        for (let w = 1; w <= words.length; w++) {
          if (cancelled) return;
          acc[acc.length - 1] = { id, role: "assistant", content: words.slice(0, w).join("") };
          setShown([...acc]);
          await wait(WORD_MS);
        }
        await wait(PAUSE_MS);
      }
      if (cancelled) return;
      setDone(true);
      await wait(HOLD_MS);
      if (!cancelled && autoplay) setIndex((i) => (i + 1) % DEMO_SCENARIOS.length);
    };
    void play();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [scenario, visible, reduce, autoplay]);

  const messages = reduce ? finalMessages(scenario) : shown;
  const showOutcome = reduce || done;
  const config = {
    name: scenario.name,
    welcomeMessage: scenario.welcome,
    icon: null,
    background: scenario.color,
    textColor: readableTextColor(scenario.color),
  };

  return (
    <div className="flex flex-col gap-4" ref={frame}>
      <div
        role="tablist"
        aria-label="Elegí un negocio de ejemplo"
        className="flex gap-1 self-start rounded-full border bg-card p-1 text-sm"
      >
        {DEMO_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={i === index}
            onClick={() => {
              setAutoplay(false);
              setIndex(i);
            }}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              i === index ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* The customer's site, sketched in hairlines, with the chat on top of it. */}
      <div className="relative rounded-xl border bg-card shadow-[0_1px_0_hsl(var(--border)),0_24px_48px_-24px_rgb(28_25_23/0.25)]">
        <div className="flex items-center gap-2 border-b px-4 py-2.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full border border-current" aria-hidden="true" />
          <span className="font-mono">{scenario.domain}</span>
        </div>
        <div className="relative h-[460px] overflow-hidden">
          <div className="absolute inset-0 hidden p-6 sm:block" aria-hidden="true">
            <div className="h-3 w-32 rounded-full bg-muted" />
            <div className="mt-6 h-24 w-3/5 rounded-lg border border-dashed" />
            <div className="mt-6 space-y-2">
              <div className="h-2 w-2/5 rounded-full bg-muted" />
              <div className="h-2 w-1/3 rounded-full bg-muted" />
              <div className="h-2 w-1/4 rounded-full bg-muted" />
            </div>
          </div>
          <div className="absolute inset-3 sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[428px] sm:w-[320px] drop-shadow-xl">
            <WidgetChat domainId="demo" config={config} preview demoMessages={messages} />
          </div>
        </div>
      </div>

      {/* What the owner gets: reserved height, so nothing jumps when it appears. */}
      <div className="min-h-[62px]">
        <AnimatePresence mode="wait">
          {showOutcome && (
            <motion.div
              key={scenario.id}
              initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              role="status"
              data-testid="demo-outcome"
              className="flex items-center gap-3 rounded-lg border bg-popover px-4 py-3 text-sm shadow-sm"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  scenario.outcome.kind === "lead"
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground text-background",
                )}
              >
                {scenario.outcome.kind === "lead" ? <UserPlus className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
              </span>
              <span>
                <span className="block font-medium">{scenario.outcome.title}</span>
                <span className="block text-muted-foreground">{scenario.outcome.detail}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
