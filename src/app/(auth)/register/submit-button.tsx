"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}