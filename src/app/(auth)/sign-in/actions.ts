"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type SignInState = { error?: string; code?: string; email?: string };

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) {
      const code = "code" in err ? String(err.code) : undefined;
      return { error: err.type, code, email };
    }
    throw err;
  }

  return {};
}