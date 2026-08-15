"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="border border-outline-variant bg-surface px-6 py-14 text-center">
      <p className="label-caps text-on-surface-variant">Admin error</p>
      <h1 className="headline-md mt-3">This view could not be loaded</h1>
      <p className="body-md mx-auto mt-3 max-w-xl text-on-surface-variant">
        The operational data remains unchanged. Try loading the view again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 bg-primary px-6 py-3 label-caps text-on-primary transition-colors duration-300 hover:bg-neutral-800"
      >
        Try again
      </button>
    </div>
  );
}
