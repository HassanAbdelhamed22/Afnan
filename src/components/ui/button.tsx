import * as React from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const hasCustomBorder = className?.includes("border-") || className?.includes("border ");

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-sans label-caps outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all ease-expo-out duration-300 py-3 px-6 cursor-pointer",
          !hasCustomBorder && "border border-solid border-transparent",
          variant === "primary" && "bg-primary text-on-primary hover:bg-primary-hover",
          variant === "secondary" && `bg-transparent text-primary hover:bg-surface-container-low ${!hasCustomBorder ? "border border-solid border-primary" : ""}`,
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
