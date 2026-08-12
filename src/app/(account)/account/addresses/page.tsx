import { AddressBook } from "@/components/account/address-book";
import { listCustomerAddresses } from "@/modules/users";

export default async function AddressesPage() {
  const addresses = await listCustomerAddresses();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <header className="mb-10">
        <p className="label-caps text-on-surface-variant">Customer account</p>
        <h1 className="mt-3 headline-lg text-on-background">Delivery addresses</h1>
      </header>
      <AddressBook addresses={addresses} />
    </main>
  );
}
