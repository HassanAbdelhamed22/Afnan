"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected exceptions to server metrics
    console.error("Unhandled client-boundary exception:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md border border-solid border-outline-variant bg-surface p-8 sm:p-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-wide text-error mb-4">
          Unexpected Error
        </h1>
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
          An unexpected error occurred while processing this request. Please try again.
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="bg-surface-container-low border border-solid border-outline-variant p-4 text-left font-sans text-xs text-on-surface-variant break-all mb-8 select-all">
            {error.message || "An unhandled execution failure occurred"}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-block bg-primary text-on-primary font-sans label-caps text-xs py-3.5 px-6 transition-colors hover:bg-neutral-800 cursor-pointer border-none"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block bg-transparent border border-primary text-primary font-sans label-caps text-xs py-3.5 px-6 transition-colors hover:bg-surface-container-low"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
