import * as React from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-sans label-caps outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ease-expo-out duration-300 py-3 px-6 cursor-pointer border-0",
          variant === "primary" && "bg-primary text-on-primary hover:bg-neutral-800",
          variant === "secondary" && "bg-transparent border border-solid border-primary text-primary hover:bg-surface-container-low",
          variant === "text" && "p-0 font-sans label-caps hover:opacity-60 transition-opacity underline underline-offset-4 bg-transparent border-none text-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
