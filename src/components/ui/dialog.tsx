import * as React from "react";

import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Dialog box */}
      <div className={cn("relative z-10 w-full max-w-lg bg-surface border border-solid border-outline-variant p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto", className)}>
        <div className="flex items-center justify-between border-b border-solid border-outline-variant pb-4">
          {title ? (
            <h3 className="headline-sm text-on-background m-0">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="text-on-background hover:opacity-60 transition-opacity p-1 bg-transparent border-none cursor-pointer"
            aria-label="Close dialog"
          >
            <svg
              className="h-5 w-5"
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
        <div className="text-on-surface font-sans body-md">{children}</div>
      </div>
    </div>
  );
}
