import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/email";
import { SubmitButton } from "./submit-button";

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
        <Link
          href="/sign-in"
          className="text-foreground text-sm underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  async function requestReset(formData: FormData) {
    "use server";
    const email = (formData.get("email") as string).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.password) {
      const token = await createPasswordResetToken(email);
      const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
      await sendPasswordResetEmail(email, `${baseUrl}/reset-password?token=${token}`);
    }

    redirect("/forgot-password?sent=1");
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

      <form action={requestReset} className="space-y-4">
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
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <SubmitButton />
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Remember your password?{" "}
        <Link href="/sign-in" className="text-foreground font-medium underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}