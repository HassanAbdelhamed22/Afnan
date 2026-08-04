import * as React from "react";

import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("inline-flex items-center gap-3 cursor-pointer select-none", className)}>
        <div className="relative">
          <input
            type="radio"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div className="h-5 w-5 border border-solid border-outline-variant rounded-full bg-transparent transition-colors duration-200 peer-checked:border-primary flex items-center justify-center peer-checked:[&_div]:scale-100">
            <div className="h-2.5 w-2.5 bg-primary rounded-full scale-0 transition-transform duration-200" />
          </div>
        </div>
        {label && <span className="font-sans text-sm text-on-background">{label}</span>}
      </label>
    );
  }
);
Radio.displayName = "Radio";

export { Radio };
