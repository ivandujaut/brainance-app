"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "system", label: "Igual que el sistema", icon: Monitor },
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
] as const;

const subscribeNoop = () => () => {};

const DarkModeToggle = () => {
  const { setTheme, theme } = useTheme();
  // The theme is only known in the browser; avoid a mismatched first render.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Tema</CardTitle>
        <CardDescription>Cómo se ve el panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Tema" className="flex flex-wrap gap-3">
          {OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = mounted && theme === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground",
                  selected && "border-primary ring-2 ring-ring",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DarkModeToggle;
