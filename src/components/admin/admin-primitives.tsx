import type { ReactNode } from "react";

export function AdminPanel({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <section className="border border-outline-variant bg-surface">
      {title ? (
        <header className="border-b border-outline-variant px-5 py-4">
          <h2 className="headline-sm">{title}</h2>
          {description ? <p className="body-sm mt-1 text-on-surface-variant">{description}</p> : null}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminFilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-6 border-y border-outline-variant bg-surface-container-low px-4 py-4">{children}</div>;
}

export function AdminTable({ caption, headings, children }: { caption: string; headings: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-outline-variant bg-surface">
      <table className="w-full min-w-[42rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-outline-variant bg-surface-container-low">
          <tr>{headings.map((heading) => <th key={heading} scope="col" className="px-4 py-3 label-caps">{heading}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-outline-variant body-sm">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-dashed border-outline-variant bg-surface px-6 py-14 text-center">
      <h2 className="headline-sm">{title}</h2>
      <p className="body-md mx-auto mt-2 max-w-xl text-on-surface-variant">{description}</p>
    </div>
  );
}
