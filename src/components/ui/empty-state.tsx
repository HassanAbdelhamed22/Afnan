import * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ className, title, description, action, icon, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-outline-variant bg-surface w-full",
        className
      )}
      {...props}
    >
      {icon && <div className="text-on-background opacity-45">{icon}</div>}
      <h3 className="headline-sm text-on-background mt-4 mb-2">{title}</h3>
      {description && (
        <p className="body-md text-on-surface opacity-70 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
