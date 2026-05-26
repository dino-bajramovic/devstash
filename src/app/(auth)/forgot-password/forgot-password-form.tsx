"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "./actions";
import { SubmitButton } from "./submit-button";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, {});

  return (
    <>
      {state.error === "rate-limited" && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-lg px-3 py-2.5 text-sm">
          Too many attempts. Please try again later.
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-foreground text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            defaultValue={state.email}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <SubmitButton />
      </form>
    </>
  );
}