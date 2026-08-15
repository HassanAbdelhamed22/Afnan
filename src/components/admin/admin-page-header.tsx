import Link from "next/link";
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  children?: ReactNode;
}

export function AdminPageHeader({
  eyebrow = "Afnan operations",
  title,
  description,
  action,
  children,
}: AdminPageHeaderProps) {
  return (
    <header className="mb-8 border-b border-outline-variant pb-7">
      <nav aria-label="Breadcrumb" className="mb-5 label-caps text-on-surface-variant">
        <Link href="/admin" className="underline-offset-4 hover:underline">Admin</Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span>{title}</span>
      </nav>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="label-caps mb-3 text-on-surface-variant">{eyebrow}</p>
          <h1 className="headline-lg text-on-background">{title}</h1>
          {description ? <p className="body-md mt-3 text-on-surface-variant">{description}</p> : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex min-h-11 items-center justify-center bg-primary px-6 py-3 label-caps text-on-primary transition-colors duration-300 ease-expo-out hover:bg-neutral-800"
          >
            {action.label}
          </Link>
        ) : children}
      </div>
    </header>
  );
}
