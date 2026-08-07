"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Input } from "../ui/input";

interface Suggestion {
  name: string;
  slug: string;
}

export function SearchControl() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setSuggestions([]);
    }
  }, [isOpen]);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!val.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSuggestions(json.data.suggestions || []);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Suggestions fetch error:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);
  };

  const handleSuggestionClick = () => {
    setIsOpen(false);
  };

  const overlayContent = isOpen ? (
    <div className="fixed inset-0 top-0 z-9999 flex flex-col bg-background/98 backdrop-blur-xs">
      {/* Top Search Input Bar */}
      <div className="flex min-h-16 items-center justify-center border-b border-solid border-outline-variant bg-background px-3 sm:min-h-20 sm:px-6">
        <form role="search" action="/shop" method="GET" autoComplete="off" className="relative flex w-full max-w-2xl items-center gap-3 sm:gap-4">
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
            name="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoComplete="off"
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

      {/* Suggestions Dropdown View */}
      <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12 flex justify-center">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {query.trim().length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                {isLoading ? "Searching..." : suggestions.length > 0 ? "Product Suggestions" : "No products found"}
              </span>
              
              {suggestions.length > 0 && (
                <ul className="flex flex-col border border-outline-variant bg-surface divide-y divide-outline-variant/60">
                  {suggestions.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={handleSuggestionClick}
                        className="flex items-center justify-between p-4 font-sans text-sm text-on-surface hover:bg-surface-container-low hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[0.625rem] font-bold uppercase tracking-wider text-on-surface-variant">
                          View Product →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

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

      {mounted && typeof document !== "undefined" && overlayContent
        ? createPortal(overlayContent, document.body)
        : null}
    </>
  );
}
