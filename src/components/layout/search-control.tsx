"use client";

import * as React from "react";

import { Input } from "../ui/input";

export function SearchControl() {
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex size-11 cursor-pointer items-center justify-center border-none bg-transparent text-on-background outline-none transition-colors hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Open search"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-0 z-[110] flex min-h-16 items-center justify-center border-b border-solid border-outline-variant bg-background px-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:min-h-20 sm:px-6">
          <form role="search" action="/shop" method="GET" className="relative flex w-full max-w-2xl items-center gap-3 sm:gap-4">
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-on-background/40 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              ref={inputRef}
              name="q"
              aria-label="Search products"
              placeholder="Search handmade products..."
              className="min-w-0 flex-1 border-b-0 py-1 text-base focus:border-primary sm:text-xl"
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-on-background outline-none transition-colors hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close search"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
