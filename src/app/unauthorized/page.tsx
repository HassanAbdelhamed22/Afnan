import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md border border-solid border-outline-variant bg-surface p-8 sm:p-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-wide text-primary mb-4">
          403 — Access Denied
        </h1>
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-8">
          You do not have the required permissions to view this resource. Administrator authorization is required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block bg-primary text-on-primary font-sans label-caps text-xs py-3.5 px-6 transition-colors hover:bg-neutral-800"
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="inline-block bg-transparent border border-primary text-primary font-sans label-caps text-xs py-3.5 px-6 transition-colors hover:bg-surface-container-low"
          >
            Sign In Again
          </Link>
        </div>
      </div>
    </div>
  );
}
