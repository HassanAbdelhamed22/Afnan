import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md border border-solid border-outline-variant bg-surface p-8 sm:p-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-wide text-primary mb-4">
          404 — Page Not Found
        </h1>
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-8">
          The page you are looking for does not exist, has been removed, or has been temporarily moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-on-primary font-sans label-caps text-xs py-3.5 px-6 transition-colors hover:bg-neutral-800"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
