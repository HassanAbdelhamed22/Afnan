"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/results/action-result";
import { updateProfileAction } from "@/modules/users/actions";
import type { CustomerProfileDTO } from "@/modules/users/dto";

export function ProfileForm({ profile }: { profile: CustomerProfileDTO }) {
  const router = useRouter();
  const initialState: ActionResult<CustomerProfileDTO | null> = {
    ok: true,
    data: profile,
  };
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    const message = state.ok ? state.message : state.error.message;
    if (!message) return;
    toast.show(message, state.ok ? "success" : "error");
    if (state.ok) router.refresh();
  }, [router, state]);

  const fieldErrors = state.ok ? undefined : state.error.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-7" noValidate>
      <FormField htmlFor="profile-name" label="Full name" error={fieldErrors?.name?.[0]}>
        <Input
          id="profile-name"
          name="name"
          autoComplete="name"
          defaultValue={profile.name}
          required
          aria-invalid={Boolean(fieldErrors?.name)}
        />
      </FormField>

      <FormField htmlFor="profile-email" label="Email address">
        <Input id="profile-email" value={profile.email} readOnly disabled />
        <p className="body-sm text-on-surface-variant">
          Email changes are managed through account security.
        </p>
      </FormField>

      <div className="grid gap-7 md:grid-cols-2">
        <FormField htmlFor="profile-phone" label="Phone number" error={fieldErrors?.phone?.[0]}>
          <Input
            id="profile-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={profile.phoneE164}
            required
            aria-invalid={Boolean(fieldErrors?.phone)}
          />
        </FormField>

        <FormField
          htmlFor="profile-whatsapp"
          label="WhatsApp number"
          error={fieldErrors?.whatsappPhone?.[0]}
        >
          <Input
            id="profile-whatsapp"
            name="whatsappPhone"
            type="tel"
            inputMode="tel"
            defaultValue={profile.whatsappE164}
            required
            aria-invalid={Boolean(fieldErrors?.whatsappPhone)}
          />
        </FormField>
      </div>

      {!state.ok && !state.error.fieldErrors && (
        <p role="alert" className="border-l-2 border-error bg-error-container/30 px-4 py-3 body-sm text-error">
          {state.error.message}
        </p>
      )}

      <div className="border-t border-outline-variant pt-6">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
