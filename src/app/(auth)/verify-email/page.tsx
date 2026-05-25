import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorCard message="Invalid verification link." />;
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return <ErrorCard message="This verification link is invalid or has already been used." />;
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return <ErrorCard message="This verification link has expired." showResend email={record.identifier} />;
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: { token } });

  redirect("/sign-in?verified=1");
}

function ErrorCard({
  message,
  showResend,
  email,
}: {
  message: string;
  showResend?: boolean;
  email?: string;
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

      {showResend && email && (
        <form
          action={async () => {
            "use server";
            const { redirect: serverRedirect } = await import("next/navigation");
            const { createVerificationToken } = await import("@/lib/token");
            const { sendVerificationEmail } = await import("@/lib/email");

            const newToken = await createVerificationToken(email);
            const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
            await sendVerificationEmail(email, `${baseUrl}/verify-email?token=${newToken}`);
            serverRedirect("/check-email");
          }}
        >
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Resend verification email
          </button>
        </form>
      )}

      <p className="text-muted-foreground mt-4 text-xs">
        <Link href="/sign-in" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}