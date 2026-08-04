import * as React from "react";

import { cn } from "@/lib/utils";

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

export function Dropdown({ trigger, children, align = "right" }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-30 mt-2 w-56 bg-surface border border-solid border-outline-variant py-1 focus:outline-none",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DropdownItem({ className, children, ...props }: DropdownItemProps) {
  return (
    <div
      className={cn(
        "block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors duration-200 cursor-pointer font-sans",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
