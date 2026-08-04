import * as React from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-container w-full border border-solid border-outline-variant/20",
        className
      )}
      {...props}
    />
  );
}
