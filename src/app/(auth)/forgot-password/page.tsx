import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

interface Props {
  searchParams: Promise<{ sent?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { sent } = await searchParams;

  if (sent === "1") {
    return (
      <div className="border-border bg-card w-full max-w-sm rounded-xl border p-8 shadow-lg text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-primary-foreground text-sm font-bold">D</span>
          </div>
          <span className="text-foreground text-xl font-bold">DevStash</span>
        </div>
        <h2 className="text-foreground mb-2 text-lg font-semibold">Check your email</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          If that email is registered, we&apos;ve sent a password reset link. Check your inbox.
        </p>
        <Link href="/sign-in" className="text-foreground text-sm underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="border-border bg-card w-full max-w-sm rounded-xl border p-8 shadow-lg">
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-primary-foreground text-sm font-bold">D</span>
          </div>
          <span className="text-foreground text-xl font-bold">DevStash</span>
        </div>
        <h2 className="text-foreground text-lg font-semibold">Forgot your password?</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Remember your password?{" "}
        <Link href="/sign-in" className="text-foreground font-medium underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}