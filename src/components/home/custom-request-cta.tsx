import Link from "next/link";

const steps = [
  ["01", "Share your idea"],
  ["02", "We review the details"],
  ["03", "Confirm on WhatsApp"],
] as const;

export function CustomRequestCta() {
  return (
    <section className="border-b border-outline-variant bg-[#eee8de] py-20 transition-colors duration-300 dark:bg-surface sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[100rem] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-12">
        <div className="lg:col-span-7">
          <span className="mb-4 block font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            A piece of your own
          </span>
          <h2 className="max-w-[11ch] font-serif text-[clamp(2.75rem,5vw,5.5rem)] leading-[0.9] tracking-[-0.04em] text-on-background">
            Your idea, our hands.
          </h2>
          <p className="mt-7 max-w-xl font-sans text-sm leading-6 text-on-surface-variant sm:text-base sm:leading-7">
            Tell us about the dimensions, colors, materials, or details you have
            in mind. Add reference images and we will review the request with you.
          </p>
          <Link
            href="/custom-request"
            className="mt-9 inline-flex min-h-12 items-center justify-center bg-primary px-8 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-on-primary no-underline outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            Start a custom request
          </Link>
        </div>

        <ol className="border-t border-primary/20 lg:col-span-5 lg:self-end">
          {steps.map(([number, label]) => (
            <li key={number} className="flex items-center gap-6 border-b border-primary/20 py-5">
              <span className="font-serif text-sm text-on-surface-variant">{number}</span>
              <span className="font-serif text-xl text-on-background">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
