import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="border-border bg-card w-full max-w-sm rounded-xl border p-8 shadow-lg text-center">
      <div className="mb-6 flex items-center justify-center gap-2">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <span className="text-primary-foreground text-sm font-bold">D</span>
        </div>
        <span className="text-foreground text-xl font-bold">DevStash</span>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
          <svg className="text-primary h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <h1 className="text-foreground mb-2 text-lg font-semibold">Check your email</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        We sent a verification link to your email address. Click the link to activate your account.
      </p>

      <p className="text-muted-foreground text-xs">
        Already verified?{" "}
        <Link href="/sign-in" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}