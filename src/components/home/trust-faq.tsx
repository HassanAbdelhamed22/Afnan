const trustItems = [
  ["COD", "Cash on delivery", "Pay the courier in cash when your order arrives."],
  ["WA", "Personal confirmation", "We confirm your order and delivery details with you on WhatsApp."],
  ["EG", "Shipping across Egypt", "Your governorate rate is calculated clearly during checkout."],
] as const;

const questions = [
  ["How are shipping fees calculated?", "Shipping is based on your Egyptian governorate. Your exact fee is shown during checkout before you place the order."],
  ["Can I customize sizes or materials?", "Yes. Send a custom request with your dimensions, colors, materials, and reference images. We will review the details with you on WhatsApp."],
  ["How long does preparation take?", "Ready-made and made-to-order pieces have different timelines. For made-to-order work, the expected preparation window appears on the product page."],
  ["Do you offer international shipping?", "Not currently. Afnan delivers within Egypt, accepts EGP, and offers cash on delivery."],
] as const;

export function TrustFaq() {
  return (
    <section className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[100rem] gap-16 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-12">
        <div className="lg:col-span-5">
          <span className="mb-4 block font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            Shop with clarity
          </span>
          <h2 className="max-w-[11ch] font-serif text-[clamp(2.5rem,4vw,4.5rem)] leading-[0.95] tracking-[-0.035em] text-on-background">
            Thoughtful service, from order to door.
          </h2>
          <div className="mt-10 border-t border-outline-variant">
            {trustItems.map(([code, title, copy]) => (
              <article key={code} className="grid grid-cols-[2.75rem_1fr] gap-4 border-b border-outline-variant py-6">
                <span className="flex size-9 items-center justify-center border border-outline-variant font-sans text-[0.5625rem] font-bold tracking-[0.08em] text-on-background">
                  {code}
                </span>
                <div>
                  <h3 className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-on-background">{title}</h3>
                  <p className="mt-2 max-w-sm font-sans text-sm leading-6 text-on-surface-variant">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <span className="mb-4 block font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            Good to know
          </span>
          <h2 className="font-serif text-[clamp(2.5rem,4vw,4.5rem)] leading-none tracking-[-0.035em] text-on-background">
            Common questions
          </h2>
          <div className="mt-10 border-t border-outline-variant">
            {questions.map(([question, answer]) => (
              <details key={question} className="group border-b border-outline-variant">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 font-serif text-lg text-on-background outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-xl">
                  <span>{question}</span>
                  <span aria-hidden="true" className="font-sans text-xl font-light transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-xl pb-6 pr-10 font-sans text-sm leading-6 text-on-surface-variant">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
