import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-outline-variant bg-[#e9ddcc] sm:min-h-[calc(100svh-5rem)] lg:h-[calc(100svh-5rem)] lg:min-h-176 lg:max-h-208">
      <div className="absolute inset-0">
        <Image
          src="/home1.png"
          alt="Black and copper handwoven Afnan handbag styled in a warm atelier setting"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] sm:object-[54%_center] lg:object-[52%_center] 2xl:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,15,10,0.04)_0%,rgba(20,15,10,0.14)_40%,rgba(20,15,10,0.78)_100%)] sm:bg-[linear-gradient(90deg,rgba(18,13,9,0.74)_0%,rgba(18,13,9,0.56)_38%,rgba(18,13,9,0.15)_68%,rgba(18,13,9,0.02)_100%)] lg:bg-[linear-gradient(90deg,rgba(18,13,9,0.78)_0%,rgba(18,13,9,0.6)_31%,rgba(18,13,9,0.2)_56%,rgba(18,13,9,0.02)_82%)]"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/28 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-8rem)] max-w-[100rem] items-end px-5 pb-8 pt-28 sm:min-h-[calc(100svh-9rem)] sm:px-8 sm:pb-12 lg:h-[calc(100%-4rem)] lg:min-h-0 lg:items-center lg:px-12 lg:py-12">
        <div className="max-w-164 text-white lg:w-[48%] lg:max-w-156 xl:w-[44%]">
          <div className="mb-5 flex items-center gap-3 font-sans text-[0.625rem] font-bold uppercase tracking-[0.22em] text-white/85 sm:text-xs">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            The Afnan atelier · Egypt
          </div>

          <h1 className="max-w-[11ch] font-serif text-[clamp(3.125rem,14vw,4rem)] leading-[0.9] tracking-[-0.04em] text-balance sm:max-w-[14ch] sm:text-[clamp(4rem,7vw,5.25rem)] lg:text-[clamp(4rem,5.5vw,5.5rem)] lg:leading-[0.92] xl:text-[clamp(4.5rem,4.8vw,5.5rem)]">
            Handmade with care. Made to be yours.
          </h1>

          <p className="mt-6 max-w-136 font-sans text-sm leading-6 text-white/85 sm:text-base sm:leading-7 lg:max-w-120 lg:text-[0.9375rem] lg:text-white/80">
            Thoughtful pieces shaped by hand in Egypt—made in small quantities,
            finished with patience, and delivered to your door.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-9 lg:flex-wrap">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center bg-white px-7 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-black no-underline outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            >
              Explore the collection
            </Link>
            <Link
              href="/custom-request"
              className="inline-flex min-h-12 items-center justify-center border border-white/55 px-7 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white no-underline outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            >
              Create something custom
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/18 bg-black/25 backdrop-blur-md">
        <div className="mx-auto grid max-w-[100rem] grid-cols-3 divide-x divide-white/20 px-2 text-white sm:px-8 lg:px-12">
          {[
            ["01", "Handmade in Egypt"],
            ["02", "Cash on delivery"],
            ["03", "Shipping nationwide"],
          ].map(([number, label]) => (
            <div key={number} className="flex min-h-16 items-center justify-center gap-2 px-2 sm:justify-start sm:gap-3 sm:px-5">
              <span className="hidden font-serif text-lg text-white/55 sm:inline">{number}</span>
              <span className="text-center font-sans text-[0.5rem] font-bold uppercase leading-4 tracking-widest text-white/85 sm:text-left sm:text-[0.625rem]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
