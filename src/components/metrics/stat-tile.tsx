import { Card, CardContent } from "@/components/ui/card";

type Props = { label: string; value: string; hint?: string; testId?: string };

/** A headline number: the form for a single figure, no chart needed (spec 007). */
export const StatTile = ({ label, value, hint, testId }: Props) => (
  <Card>
    <CardContent className="p-4 flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-3xl font-semibold tabular-nums" data-testid={testId}>
        {value}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </CardContent>
  </Card>
);
