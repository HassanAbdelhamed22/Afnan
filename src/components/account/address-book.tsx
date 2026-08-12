"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { egyptGovernorateOptions } from "@/config/egypt-governorates";
import type { ActionResult } from "@/lib/results/action-result";
import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
} from "@/modules/users/actions";
import type { AddressDTO } from "@/modules/users/dto";

const emptyResult: ActionResult<Record<string, never>> = { ok: true, data: {} };
const emptyAddressResult: ActionResult<AddressDTO | null> = { ok: true, data: null };

function optionalValue(value?: string) {
  return value ?? "";
}

export function AddressBook({ addresses }: { addresses: AddressDTO[] }) {
  const router = useRouter();
  const savedAddressesHeadingRef = useRef<HTMLHeadingElement>(null);
  const [editing, setEditing] = useState<AddressDTO | null>(null);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [saveState, saveAction, saving] = useActionState(
    async (previousState: ActionResult<AddressDTO | null>, formData: FormData) => {
      const result = await saveAddressAction(previousState, formData);
      const message = result.ok ? result.message : result.error.message;
      if (message) toast.show(message, result.ok ? "success" : "error");
      if (result.ok) {
        setEditing(null);
        setShowForm(false);
        router.refresh();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            savedAddressesHeadingRef.current?.focus({ preventScroll: true });
            savedAddressesHeadingRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        });
      }
      return result;
    },
    emptyAddressResult,
  );
  const [deleteState, deleteAction, deleting] = useActionState(deleteAddressAction, emptyResult);
  const [defaultState, defaultAction, settingDefault] = useActionState(
    setDefaultAddressAction,
    emptyResult,
  );

  useEffect(() => {
    const message = deleteState.ok ? deleteState.message : deleteState.error.message;
    if (!message) return;
    toast.show(message, deleteState.ok ? "success" : "error");
    if (deleteState.ok) router.refresh();
  }, [deleteState, router]);

  useEffect(() => {
    const message = defaultState.ok ? defaultState.message : defaultState.error.message;
    if (!message) return;
    toast.show(message, defaultState.ok ? "success" : "error");
    if (defaultState.ok) router.refresh();
  }, [defaultState, router]);

  const errors = saveState.ok ? undefined : saveState.error.fieldErrors;
  const governorateName = (code: string) =>
    egyptGovernorateOptions.find((governorate) => governorate.code === code)?.name ?? code;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-outline-variant pb-6">
        <p className="max-w-2xl body-md text-on-surface-variant">
          Saved addresses are private and used only for Egyptian delivery. Orders preserve their own address snapshot.
        </p>
        {!showForm && (
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            Add address
          </Button>
        )}
      </div>

      {showForm && (
        <form
          key={editing?.id ?? "new-address"}
          action={saveAction}
          className="border border-outline-variant bg-surface px-5 py-7 sm:px-8"
          noValidate
        >
          <input type="hidden" name="addressId" value={editing?.id ?? ""} />
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="label-caps text-on-surface-variant">Delivery details</p>
              <h2 className="mt-2 headline-sm text-on-background">
                {editing ? "Edit address" : "New address"}
              </h2>
            </div>
            {addresses.length > 0 && (
              <Button
                type="button"
                variant="text"
                onClick={() => {
                  setEditing(null);
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
            <FormField htmlFor="address-label" label="Address label" error={errors?.label?.[0]}>
              <Input id="address-label" name="label" placeholder="Home or Work" defaultValue={editing?.label} required />
            </FormField>
            <FormField
              htmlFor="address-recipient"
              label="Recipient name"
              error={errors?.recipientName?.[0]}
            >
              <Input
                id="address-recipient"
                name="recipientName"
                autoComplete="name"
                defaultValue={editing?.recipientName}
                required
              />
            </FormField>
            <FormField htmlFor="address-phone" label="Recipient phone" error={errors?.phone?.[0]}>
              <Input
                id="address-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue={editing?.phoneE164}
                required
              />
            </FormField>
            <FormField
              htmlFor="address-governorate"
              label="Governorate"
              error={errors?.governorateCode?.[0]}
            >
              <select
                id="address-governorate"
                name="governorateCode"
                defaultValue={editing?.governorateCode ?? ""}
                className="themed-native-select w-full border-b border-outline-variant bg-transparent py-2 body-md text-on-background outline-none transition-colors focus:border-primary"
                required
              >
                <option value="" disabled>Select a governorate</option>
                {egyptGovernorateOptions.map((governorate) => (
                  <option key={governorate.code} value={governorate.code}>
                    {governorate.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField htmlFor="address-city" label="City" error={errors?.city?.[0]}>
              <Input id="address-city" name="city" autoComplete="address-level2" defaultValue={editing?.city} required />
            </FormField>
            <FormField htmlFor="address-area" label="Area (optional)" error={errors?.area?.[0]}>
              <Input id="address-area" name="area" defaultValue={optionalValue(editing?.area)} />
            </FormField>
            <FormField htmlFor="address-street" label="Street" error={errors?.street?.[0]} className="md:col-span-2">
              <Input id="address-street" name="street" autoComplete="street-address" defaultValue={editing?.street} required />
            </FormField>
            <FormField htmlFor="address-building" label="Building (optional)" error={errors?.building?.[0]}>
              <Input id="address-building" name="building" defaultValue={optionalValue(editing?.building)} />
            </FormField>
            <div className="grid grid-cols-2 gap-5">
              <FormField htmlFor="address-floor" label="Floor" error={errors?.floor?.[0]}>
                <Input id="address-floor" name="floor" defaultValue={optionalValue(editing?.floor)} />
              </FormField>
              <FormField htmlFor="address-apartment" label="Apartment" error={errors?.apartment?.[0]}>
                <Input id="address-apartment" name="apartment" defaultValue={optionalValue(editing?.apartment)} />
              </FormField>
            </div>
            <FormField htmlFor="address-landmark" label="Landmark (optional)" error={errors?.landmark?.[0]} className="md:col-span-2">
              <Input id="address-landmark" name="landmark" defaultValue={optionalValue(editing?.landmark)} />
            </FormField>
            <FormField htmlFor="address-notes" label="Delivery notes (optional)" error={errors?.notes?.[0]} className="md:col-span-2">
              <textarea
                id="address-notes"
                name="notes"
                rows={3}
                defaultValue={optionalValue(editing?.notes)}
                className="w-full resize-y border-b border-outline-variant bg-transparent py-2 body-md text-on-background outline-none transition-colors focus:border-primary"
              />
            </FormField>
          </div>

          <label className="mt-7 flex cursor-pointer items-center gap-3 body-sm text-on-background">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={editing?.isDefault ?? addresses.length === 0}
              className="size-4 appearance-none border border-primary checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
            Use as my default delivery address
          </label>

          {!saveState.ok && !saveState.error.fieldErrors && (
            <p role="alert" className="mt-6 border-l-2 border-error bg-error-container/30 px-4 py-3 body-sm text-error">
              {saveState.error.message}
            </p>
          )}

          <div className="mt-8 border-t border-outline-variant pt-6">
            <Button type="submit" disabled={saving} aria-busy={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Save address"}
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="border border-outline-variant bg-surface px-6 py-12 text-center">
          <h2 className="headline-sm text-on-background">No delivery addresses yet</h2>
          <p className="mt-3 body-md text-on-surface-variant">Add an Egyptian address before checkout.</p>
        </div>
      ) : (
        <section aria-labelledby="saved-addresses-heading">
          <h2
            id="saved-addresses-heading"
            ref={savedAddressesHeadingRef}
            tabIndex={-1}
            className="mb-5 headline-sm text-on-background outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            Saved addresses
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {addresses.map((address) => (
            <article key={address.id} className="border border-outline-variant bg-surface p-6">
              <div className="flex items-start justify-between gap-4 border-b border-outline-variant pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="headline-sm text-on-background">{address.label}</h2>
                    {address.isDefault && (
                      <span className="border border-primary px-2 py-1 label-caps text-on-background">Default</span>
                    )}
                  </div>
                  <p className="mt-1 body-sm text-on-surface-variant">{address.recipientName}</p>
                </div>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => {
                    setEditing(address);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
              </div>

              <address className="mt-5 not-italic body-sm leading-7 text-on-surface-variant">
                <p>{address.street}</p>
                <p>
                  {[address.building && `Building ${address.building}`, address.floor && `Floor ${address.floor}`, address.apartment && `Apartment ${address.apartment}`]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{[address.area, address.city, governorateName(address.governorateCode)].filter(Boolean).join(", ")}</p>
                {address.landmark && <p>Landmark: {address.landmark}</p>}
                <p>{address.phoneE164}</p>
              </address>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-outline-variant pt-4">
                {!address.isDefault && (
                  <form action={defaultAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <Button type="submit" variant="text" disabled={settingDefault}>
                      Set as default
                    </Button>
                  </form>
                )}
                <form
                  action={deleteAction}
                  onSubmit={(event) => {
                    if (!window.confirm("Delete this delivery address?")) event.preventDefault();
                  }}
                >
                  <input type="hidden" name="addressId" value={address.id} />
                  <Button type="submit" variant="text" disabled={deleting} className="text-error">
                    Delete
                  </Button>
                </form>
              </div>
            </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
