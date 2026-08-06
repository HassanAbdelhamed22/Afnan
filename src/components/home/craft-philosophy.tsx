export function CraftPhilosophy() {
  return (
    <section className="bg-[#171512] py-20 text-white sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[100rem] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-12">
        <div className="lg:col-span-5">
          <span className="mb-4 block font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-white/60">
            How we make
          </span>
          <h2 className="max-w-[10ch] font-serif text-[clamp(2.75rem,5vw,5.5rem)] leading-[0.9] tracking-[-0.04em]">
            Made slowly, kept honestly.
          </h2>
          <p className="mt-7 max-w-md font-sans text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
            Every piece follows its own rhythm. We keep the process clear, from
            the first material choice to the day it leaves the workshop.
          </p>
        </div>

        <div className="grid border-t border-white/20 sm:grid-cols-2 lg:col-span-7 lg:self-end">
          <article className="border-b border-white/20 py-8 sm:border-b-0 sm:border-r sm:pr-8 lg:py-10">
            <span className="font-serif text-sm text-white/45">01</span>
            <h3 className="mt-8 font-serif text-2xl">Ready-made</h3>
            <p className="mt-3 max-w-sm font-sans text-sm leading-6 text-white/60">
              Finished in limited quantities and available while stock lasts.
              Dispatch begins after your order is confirmed.
            </p>
          </article>
          <article className="py-8 sm:pl-8 lg:py-10">
            <span className="font-serif text-sm text-white/45">02</span>
            <h3 className="mt-8 font-serif text-2xl">Made-to-order</h3>
            <p className="mt-3 max-w-sm font-sans text-sm leading-6 text-white/60">
              Crafted after confirmation. Each product page shows the expected
              preparation window before you order.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
