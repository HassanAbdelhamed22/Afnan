"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/auth-client";

type ResendVerificationButtonProps = {
  email: string;
  callbackURL?: string;
  className?: string;
};

export function ResendVerificationButton({
  email,
  callbackURL = "/login?verified=true",
  className,
}: ResendVerificationButtonProps) {
  const [pending, setPending] = useState(false);

  const resend = async () => {
    if (pending) return;

    setPending(true);
    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL,
      });

      if (result.error) {
        toast.show("The verification email could not be sent. Try again shortly.", "error");
        return;
      }

      toast.show(
        "If this address belongs to an unverified account, a verification email has been sent.",
        "success",
      );
    } catch {
      toast.show("The verification email could not be sent. Try again shortly.", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      disabled={pending || !email}
      aria-busy={pending}
      onClick={resend}
    >
      {pending ? "Sending…" : "Resend verification email"}
    </Button>
  );
}
