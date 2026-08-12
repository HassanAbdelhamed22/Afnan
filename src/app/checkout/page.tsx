import { redirect } from "next/navigation";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { CheckoutVerificationRequired } from "@/components/checkout/verification-required";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors/app-error";
import { getCustomerCheckout } from "@/modules/checkout";
import { requireUser } from "@/modules/auth/dal";

export default async function CheckoutPage() {
  let checkout;
  let verificationRequired = false;
  let verificationEmail = "";
  try { checkout = await getCustomerCheckout(); }
  catch (error) {
    if (error instanceof UnauthenticatedError) redirect("/login?returnTo=/checkout");
    if (error instanceof ForbiddenError && error.message.includes("Verify your email")) {
      verificationRequired = true;
      verificationEmail = (await requireUser()).user.email;
    } else if (error instanceof ForbiddenError) {
      redirect("/unauthorized");
    } else {
      throw error;
    }
  }
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <header className="mb-10 border-b border-outline-variant pb-8"><p className="label-caps text-on-surface-variant">Secure checkout</p><h1 className="mt-3 headline-lg">Complete your order</h1><p className="mt-4 body-md text-on-surface-variant">Egypt delivery and cash on delivery only.</p></header>
      {verificationRequired || !checkout ? (
        <CheckoutVerificationRequired email={verificationEmail} />
      ) : (
        <CheckoutView checkout={checkout} />
      )}
    </main>
  );
}
