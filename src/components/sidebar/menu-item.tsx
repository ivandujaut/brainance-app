import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type Props = {
  size: "max" | "min";
  icon: React.JSX.Element;
  label: string;
  path?: string;
  current?: string;
  onSignOut?(): void;
};

const MenuItem = ({ size, icon, label, path, current, onSignOut }: Props) => {
  switch (size) {
    case "max":
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            "flex items-center gap-2 px-1 py-2 rounded-lg my-1",
            current && current === path
              ? "bg-background text-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          href={path ? `/${path}` : "#"}
        >
          {icon} {label}
        </Link>
      );
    case "min":
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            "flex items-center gap-2 px-1 py-2 rounded-md my-1",
            current && current === path
              ? "bg-background text-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          href={path ? `/${path}` : "#"}
        >
          {icon}
        </Link>
      );
    default:
      return null;
  }
};

export default MenuItem;
