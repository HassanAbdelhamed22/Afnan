import { CustomRequestForm } from "@/components/custom-requests/custom-request-form";
import { requireUser } from "@/modules/auth/dal";

export default async function CustomRequestPage() {
  await requireUser();
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <header className="mb-10 border-b border-outline-variant pb-8"><p className="label-caps text-on-surface-variant">Made for you</p><h1 className="mt-3 headline-lg">Request a custom handmade piece</h1><p className="mt-4 max-w-3xl body-md text-on-surface-variant">Share your idea and optional reference images. Our team will review it and contact you manually through WhatsApp.</p></header>
      <CustomRequestForm />
    </main>
  );
}
