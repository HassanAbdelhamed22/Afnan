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
        onClick={() => setIsOpen(true)}
        className="p-2 text-on-background hover:opacity-60 transition-opacity bg-transparent border-none cursor-pointer flex items-center justify-center"
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
        <div className="fixed inset-x-0 top-0 z-50 bg-background border-b border-solid border-outline-variant p-6 flex items-center justify-center">
          <form action="/shop" method="GET" className="relative w-full max-w-2xl flex items-center gap-4">
            <svg className="h-6 w-6 text-on-background/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              placeholder="Search handmade products..."
              className="flex-1 text-xl border-b-0 focus:border-primary py-1"
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 text-on-background hover:opacity-60 transition-opacity bg-transparent border-none cursor-pointer"
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
