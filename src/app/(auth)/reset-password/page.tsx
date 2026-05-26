import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/token";
import { rateLimitResetPassword, getIPFromHeaders } from "@/lib/rate-limit";
import { SubmitButton } from "./submit-button";

interface Props {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const { token } = params;

  if (!token) {
    return <ErrorCard message="Invalid reset link." />;
  }

  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({ where: { token: tokenHash } });

  if (!record || !record.identifier.startsWith("reset:")) {
    return <ErrorCard message="This reset link is invalid or has already been used." />;
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: tokenHash } });
    return <ErrorCard message="This reset link has expired." showRequestNew />;
  }

  const error =
    params.error === "mismatch"
      ? "Passwords do not match."
      : params.error === "short"
        ? "Password must be at least 8 characters."
        : params.error === "rate-limited"
          ? "Too many attempts. Please try again later."
          : null;

  async function resetPassword(formData: FormData) {
    "use server";
    const actionToken = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!actionToken) redirect("/forgot-password");
    if (password !== confirmPassword)
      redirect(`/reset-password?token=${actionToken}&error=mismatch`);
    if (password.length < 8)
      redirect(`/reset-password?token=${actionToken}&error=short`);

    const hdrs = await headers();
    const ip = getIPFromHeaders(hdrs);
    const rl = await rateLimitResetPassword(ip);
    if (!rl.success) redirect(`/reset-password?token=${actionToken}&error=rate-limited`);

    const actionTokenHash = hashToken(actionToken);
    const rec = await prisma.verificationToken.findUnique({ where: { token: actionTokenHash } });
    if (!rec || !rec.identifier.startsWith("reset:") || rec.expires < new Date()) {
      redirect("/forgot-password");
    }

    const email = rec.identifier.slice(6);
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    await prisma.verificationToken.delete({ where: { token: actionTokenHash } });

    redirect("/sign-in?reset=1");
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
        <h2 className="text-foreground text-lg font-semibold">Set a new password</h2>
        <p className="text-muted-foreground mt-1 text-sm">Enter your new password below.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-lg px-3 py-2.5 text-sm">
          {error}
        </div>
      )}

      <form action={resetPassword} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-foreground text-sm font-medium">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Min. 8 characters"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-foreground text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}

function ErrorCard({
  message,
  showRequestNew,
}: {
  message: string;
  showRequestNew?: boolean;
}) {
  return (
    <div className="border-border bg-card w-full max-w-sm rounded-xl border p-8 shadow-lg text-center">
      <div className="mb-6 flex items-center justify-center gap-2">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <span className="text-primary-foreground text-sm font-bold">D</span>
        </div>
        <span className="text-foreground text-xl font-bold">DevStash</span>
      </div>

      <div className="bg-destructive/10 text-destructive mb-6 rounded-lg px-3 py-2.5 text-sm">
        {message}
      </div>

      {showRequestNew && (
        <Link
          href="/forgot-password"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Request new link
        </Link>
      )}

      <p className="text-muted-foreground mt-4 text-xs">
        <Link href="/sign-in" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}