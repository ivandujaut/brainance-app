"use client";
import { useEffect, useRef, useState } from "react";
import type { DayPoint } from "@/domain/metrics";

// Daily conversations and leads (spec 007). Two series on one axis (both are counts), thin 2px
// lines, legend plus direct labels, crosshair tooltip and a table view. Colors: --chart-1/--chart-2.

const SERIES = [
  { key: "conversations", label: "Conversaciones", color: "var(--chart-1)" },
  { key: "leads", label: "Leads", color: "var(--chart-2)" },
] as const;

const HEIGHT = 220;
const PAD = { top: 16, right: 104, bottom: 28, left: 32 };

const shortDay = (day: string) => {
  const [, month, date] = day.split("-");
  return `${Number(date)}/${Number(month)}`;
};

const niceMax = (value: number) => {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
};

export const DailyChart = ({ series }: { series: DayPoint[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const max = niceMax(Math.max(1, ...series.flatMap((d) => [d.conversations, d.leads])));
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (series.length > 1 ? (i / (series.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(series.length / Math.max(2, Math.floor(plotW / 56)));
  const column = series.length > 1 ? plotW / (series.length - 1) : plotW;
  const active = hover === null ? null : series[hover];

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-4 text-sm" aria-hidden="true">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-muted-foreground">
            <span className="h-0.5 w-4 rounded" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
        <svg width={width} height={HEIGHT} role="img" aria-label="Conversaciones y leads por día" className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={PAD.left + plotW} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </text>
            </g>
          ))}
          {series.map((d, i) =>
            // The last day always gets a label; regular labels too close to it are skipped.
            i === series.length - 1 || (i % labelEvery === 0 && series.length - 1 - i >= labelEvery / 2 + 1) ? (
              <text key={d.day} x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {shortDay(d.day)}
              </text>
            ) : null,
          )}
          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-muted-foreground" strokeWidth={1} />
          )}
          {SERIES.map((s) => {
            const last = series.at(-1)!;
            return (
              <g key={s.key}>
                <polyline
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={series.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ")}
                />
                {hover !== null && (
                  <circle cx={x(hover)} cy={y(series[hover][s.key])} r={4} fill={s.color} className="stroke-card" strokeWidth={2} />
                )}
                <text x={x(series.length - 1) + 8} y={y(last[s.key])} dy="0.32em" className="fill-foreground text-[11px]">
                  {s.label}
                </text>
              </g>
            );
          })}
          {series.map((d, i) => (
            <rect
              key={d.day}
              x={x(i) - column / 2}
              y={PAD.top}
              width={column}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
            />
          ))}
        </svg>
        {active && hover !== null && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-2 rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm"
            style={{ left: Math.min(Math.max(x(hover) - 70, 0), width - 150) }}
          >
            <p className="font-medium">{shortDay(active.day)}</p>
            {SERIES.map((s) => (
              <p key={s.key} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}: <span className="tabular-nums">{active[s.key]}</span>
              </p>
            ))}
          </div>
        )}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">Ver como tabla</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 font-normal">Día</th>
              <th className="py-1 font-normal">Conversaciones</th>
              <th className="py-1 font-normal">Leads</th>
            </tr>
          </thead>
          <tbody>
            {series.map((d) => (
              <tr key={d.day} className="border-t">
                <td className="py-1">{shortDay(d.day)}</td>
                <td className="py-1">{d.conversations}</td>
                <td className="py-1">{d.leads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
};
