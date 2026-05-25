import { resend } from "@/lib/resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "DevStash <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, url: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your DevStash account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="margin-bottom:8px">Verify your email</h2>
        <p style="color:#6b7280;margin-bottom:24px">
          Click the button below to verify your DevStash account.
          This link expires in 24 hours.
        </p>
        <a href="${url}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Verify email
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          If you didn't create a DevStash account, you can ignore this email.
        </p>
      </div>
    `,
  });
}