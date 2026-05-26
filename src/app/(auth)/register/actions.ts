"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/config";
import { rateLimitRegister, getIPFromHeaders } from "@/lib/rate-limit";

export type RegisterState = {
  error?: string;
  values?: { name: string; email: string };
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const values = { name, email };

  const hdrs = await headers();
  const ip = getIPFromHeaders(hdrs);
  const rl = await rateLimitRegister(ip);
  if (!rl.success) return { error: "Too many attempts. Please try again later.", values };

  if (password !== confirmPassword) return { error: "Passwords do not match.", values };
  if (password.length < 8) return { error: "Password must be at least 8 characters.", values };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists.", values };

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, password: hashed } });

  if (EMAIL_VERIFICATION_ENABLED) {
    const token = await createVerificationToken(email);
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    await sendVerificationEmail(email, `${baseUrl}/verify-email?token=${token}`);
    redirect("/check-email");
  }

  redirect("/sign-in?registered=1");
}