"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = { success: true } | { success: false; error: string };

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }
  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters" };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { success: false, error: "No password set on this account" };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}

export async function deleteAccount(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: "/sign-in" });
}