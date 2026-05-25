import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import Link from "next/link";
import { signIn } from "@/auth";


interface Props {
  searchParams: Promise<{ error?: string; callbackUrl?: string; registered?: string; verified?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method.",
  default: "Something went wrong. Please try again.",
};

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params.error
    ? (ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.default)
    : null;
  const registered = params.registered === "1";
  const verified = params.verified === "1";

  return (
    <div className="border-border bg-card w-full max-w-sm rounded-xl border p-8 shadow-lg">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-primary-foreground text-sm font-bold">D</span>
          </div>
          <span className="text-foreground text-xl font-bold">DevStash</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Sign in to your account
        </p>
      </div>

      {/* GitHub */}
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/dashboard" });
        }}
      >
        <button
          type="submit"
          className="border-border bg-card hover:bg-accent text-foreground flex w-full items-center justify-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          Sign in with GitHub
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="border-border flex-1 border-t" />
        <span className="text-muted-foreground text-xs">or</span>
        <div className="border-border flex-1 border-t" />
      </div>

      {/* Success */}
      {registered && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
          Account created — you can now sign in.
        </div>
      )}
      {verified && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
          Email verified — you can now sign in.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-lg px-3 py-2.5 text-sm">
          {error}
        </div>
      )}

      {/* Credentials form */}
      <form
        action={async (formData) => {
          "use server";
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;
          try {
            await signIn("credentials", {
              email,
              password,
              redirectTo: "/dashboard",
            });
          } catch (err) {
            if (err instanceof AuthError) {
              redirect(`/sign-in?error=${err.type}`);
            }
            throw err;
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-foreground text-sm font-medium"
          >
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

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-foreground text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Sign in
        </button>
      </form>

      {/* Register link */}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-foreground font-medium underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
