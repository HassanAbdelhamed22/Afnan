import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ isOpen, onClose, title, children, className }: DrawerProps) {
  const titleId = React.useId();
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex justify-end" role="presentation">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 cursor-default border-0 bg-neutral-950/45 p-0 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Content */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Drawer"}
        className={cn(
          "relative z-10 flex h-dvh w-[min(88vw,24rem)] flex-col border-l border-solid border-outline-variant bg-surface shadow-[-20px_0_60px_rgba(0,0,0,0.14)]",
          className,
        )}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-solid border-outline-variant px-5 sm:min-h-20 sm:px-6">
          {title ? (
            <h2 id={titleId} className="m-0 font-serif text-2xl leading-none text-on-background">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex size-11 cursor-pointer items-center justify-center border-none bg-transparent text-on-background outline-none transition-colors hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary"
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
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
          {children}
        </div>
      </section>
    </div>,
    document.body,
  );
}
