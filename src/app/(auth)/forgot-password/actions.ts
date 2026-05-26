"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimitForgotPassword, getIPFromHeaders } from "@/lib/rate-limit";

export type ForgotPasswordState = { error?: string; email?: string };

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = (formData.get("email") as string).trim().toLowerCase();

  const hdrs = await headers();
  const ip = getIPFromHeaders(hdrs);
  const rl = await rateLimitForgotPassword(ip);
  if (!rl.success) return { error: "rate-limited", email };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.password) {
    const token = await createPasswordResetToken(email);
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    await sendPasswordResetEmail(email, `${baseUrl}/reset-password?token=${token}`);
  }

  redirect("/forgot-password?sent=1");
}