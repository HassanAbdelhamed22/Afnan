import * as React from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border px-2.5 py-0.5 text-xs font-sans label-caps transition-colors duration-200 border-solid",
        variant === "primary" && "bg-primary border-primary text-on-primary",
        variant === "secondary" && "bg-surface border-outline-variant text-on-surface",
        variant === "outline" && "bg-background/90 backdrop-blur-[2px] border-primary text-primary",
        className
      )}
      {...props}
    />
  );
}
