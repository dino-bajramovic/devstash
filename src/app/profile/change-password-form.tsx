"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/actions/profile";

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await changePassword(data);
      if (result.success) {
        setSuccess(true);
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.error);
      }
    });
  }

  if (!open) {
    return (
      <div className="border-border bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Password</p>
            <p className="text-muted-foreground text-xs">
              {success ? "Password updated successfully." : "Update your account password."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSuccess(false); setOpen(true); }}>
            Change password
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <p className="mb-4 text-sm font-medium">Change Password</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Current password</label>
          <Input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            disabled={isPending}
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">New password</label>
          <Input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Confirm new password</label>
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
          />
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => { setOpen(false); setError(null); }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}