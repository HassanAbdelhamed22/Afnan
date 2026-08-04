import * as React from "react";

import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ isOpen, onClose, title, children, className }: DrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Content */}
      <div className={cn("relative z-10 w-full max-w-md h-full bg-surface border-l border-solid border-outline-variant flex flex-col justify-between transition-transform duration-300 translate-x-0", className)}>
        <div className="p-6 flex items-center justify-between border-b border-solid border-outline-variant">
          {title ? (
            <h2 className="headline-sm text-on-background m-0">{title}</h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="text-on-background hover:opacity-60 transition-opacity p-1 bg-transparent border-none cursor-pointer"
            aria-label="Close drawer"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
