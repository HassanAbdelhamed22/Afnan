import { ProfileForm } from "@/components/account/profile-form";
import { getCustomerProfile } from "@/modules/users";

export default async function ProfilePage() {
  const profile = await getCustomerProfile();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <header className="mb-10 border-b border-outline-variant pb-8">
        <p className="label-caps text-on-surface-variant">Customer account</p>
        <h1 className="mt-3 headline-lg text-on-background">Your profile</h1>
        <p className="mt-4 max-w-2xl body-md text-on-surface-variant">
          Keep your Egyptian contact and WhatsApp details current for order confirmation.
        </p>
      </header>
      <section className="border border-outline-variant bg-surface px-5 py-8 sm:px-8">
        <ProfileForm profile={profile} />
      </section>
    </main>
  );
}
