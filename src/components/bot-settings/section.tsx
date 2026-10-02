import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { id: string; title: string; description: string; children: ReactNode };

export const Section = ({ id, title, description, children }: Props) => (
  <Card id={id} data-testid={`section-${id}`} className="scroll-mt-6">
    <CardHeader>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">{children}</CardContent>
  </Card>
);

export const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  ) : null;

/** Characters used out of the field's limit. */
export const Counter = ({ value, max }: { value: string; max: number }) => (
  <span className={value.length > max ? "text-destructive" : "text-muted-foreground"}>
    {value.length}/{max}
  </span>
);
