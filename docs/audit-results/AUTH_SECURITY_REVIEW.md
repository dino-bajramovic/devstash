# Auth Security Review
**Last audited:** 2026-05-25  
**Auditor:** auth-auditor agent  
**Scope:** NextAuth v5 · Credentials + GitHub · Email verification · Password reset · Profile page

---

## 🔴 Critical

### Tokens stored plaintext — no hashing in the database
- **File:** `src/lib/token.ts` (lines 5–11, 15–21)
- **Issue:** Both `createVerificationToken` and `createPasswordResetToken` store the raw 64-character hex token directly in `VerificationToken.token`. The column has a `@unique` index, meaning the full token value is stored in cleartext in the database and in any database backups.
- **Risk:** If the database or its backups are compromised, an attacker can immediately use any unexpired token to verify an email address or reset any user's password without knowing the original password. Password-reset tokens are especially damaging — they grant full account takeover.
- **Fix:** Before storing, hash the token with `crypto.createHash('sha256').update(token).digest('hex')`. Send the raw token in the URL. On validation, hash the URL token and look up the hash in the database. Delete the record after use (already done).

---

## 🟡 Warnings

### Register: user enumeration via distinct error codes in redirect
- **File:** `src/app/(auth)/register/page.tsx` (line 44)
- **Issue:** When an email is already registered, the server action redirects to `/register?error=email_taken`, which renders the message "An account with this email already exists." This lets any visitor check whether a given email has an account.
- **Risk:** Low-severity information disclosure. An attacker can enumerate registered email addresses by submitting the register form. This is commonly used to target phishing campaigns or credential stuffing.
- **Fix:** Either return a generic "If this email is not already registered, your account will be created" message (preferred for high-privacy apps), or, at minimum, add rate limiting to the register endpoint so bulk enumeration is not practical. Note: the `/api/auth/register` API route (line 31–35) has the same issue and should be fixed consistently.

### Reset-password: token value echoed in redirect URLs on validation failure
- **File:** `src/app/(auth)/reset-password/page.tsx` (lines 45–46)
- **Issue:** When the submitted passwords do not match or are too short, the server action redirects to `/reset-password?token=${actionToken}&error=mismatch` (or `&error=short`). The raw plaintext token is re-appended to the URL on every failed submission.
- **Risk:** Every failed password-change attempt causes the token to appear in server access logs, browser history, and HTTP `Referer` headers if the user navigates away. Even without database hashing (the Critical issue above), this further increases token exposure surface.
- **Fix:** Store the error state in the session or use a short-lived signed cookie, then redirect to `/reset-password?error=mismatch` without the token. Re-validate the token from the hidden field only when the form is submitted with both passwords present and matching.

### `allowDangerousEmailAccountLinking: true` on GitHub provider — unreviewed setting
- **File:** `src/auth.ts` (line 15) and `src/auth.config.ts` (line 7)
- **Issue:** Both `auth.ts` and `auth.config.ts` pass `allowDangerousEmailAccountLinking: true` to the GitHub provider. This flag allows a GitHub OAuth login to automatically link to an existing Credentials account that shares the same email address, without requiring any additional confirmation.
- **Risk:** If an attacker can register a GitHub account with the same email as a victim (e.g., the victim's email is not verified on GitHub), the attacker can sign into the victim's DevStash account via GitHub without knowing the password. Additionally, the option is set in both files; if the duplicate in `auth.config.ts` is picked up independently by the edge runtime before being overridden by `auth.ts`, the behavior may be inconsistent across environments.
- **Fix:** Remove `allowDangerousEmailAccountLinking: true` from both files unless account linking is an intentional, understood product decision. If it is intentional, remove it from `auth.config.ts` so it is only declared once (in `auth.ts`) and document why it is acceptable.

### Verify-email resend: no token validation before re-sending — email confirmed from expired record
- **File:** `src/app/(auth)/verify-email/page.tsx` (lines 24–27, 60–79)
- **Issue:** When a token is expired, the page deletes the record and passes the `email` value (taken from `record.identifier`) into the `showResend` error component. The "Resend verification email" form's server action calls `createVerificationToken(email)` and immediately sends a new email — but `email` comes from the already-deleted DB record, which was a trusted value, so this specific path is acceptable. However, the resend form does not verify that the email address belongs to an unverified user before sending; if the user is already verified (e.g., through another path), a new token is still generated and sent, wasting email credits and potentially confusing the user.
- **Risk:** Low-severity: unnecessary email sends; not a security bypass.
- **Fix:** Before calling `createVerificationToken`, check `prisma.user.findUnique` and confirm `emailVerified` is null. If the user is already verified, skip sending and redirect to `/sign-in` instead.

### Dashboard layout: unauthenticated users fall through to demo data instead of hard redirect
- **File:** `src/app/dashboard/layout.tsx` (lines 14–17) and `src/lib/auth.ts` (lines 4–13)
- **Issue:** `getUserIdOrDemo()` returns the demo user's ID when there is no authenticated session. The dashboard layout calls this function and passes the resulting `userId` to `getSidebarData()` and downstream page queries. The middleware (`src/proxy.ts`) is meant to redirect unauthenticated users before they reach this layout, but if the middleware ever fails to fire (e.g., a misconfigured matcher, a future route added outside the pattern, or an Edge Runtime crash), unauthenticated visitors will see real data belonging to the `demo@devstash.io` user rather than an error or redirect.
- **Risk:** Defense-in-depth failure. The layout itself has no hard redirect for unauthenticated users — it trusts the middleware exclusively. If the demo account accumulates sensitive seed data, it becomes exposed.
- **Fix:** Add an explicit `if (!session?.user?.id) redirect("/sign-in")` guard at the top of `DashboardLayout` (matching the pattern already used in `ProfileLayout`). The demo-user fallback in `getUserIdOrDemo` should be removed or restricted to clearly non-sensitive, read-only contexts.

---

## 🔵 Informational

### No rate limiting on login, register, or forgot-password endpoints
- **Files:** `src/app/(auth)/sign-in/page.tsx`, `src/app/api/auth/register/route.ts`, `src/app/(auth)/forgot-password/page.tsx`
- **Issue:** None of the three high-sensitivity endpoints have rate limiting. The sign-in form (via NextAuth's Credentials provider) accepts unlimited password attempts. The register endpoint accepts unlimited account creation requests per IP. The forgot-password form, while resistant to user enumeration, can be used to spam valid email addresses with reset emails (no per-email or per-IP throttle).
- **Risk:** Brute-force password guessing against any known email; email spam abuse via the forgot-password form; account creation flooding.
- **Fix (before launch):** Add rate limiting at the middleware or route level. Options: Upstash Redis + `@upstash/ratelimit`, Vercel's built-in rate limiting, or a simple in-memory store for development. Recommended limits: login 5 attempts / 15 min per IP, forgot-password 3 requests / hour per email, register 10 accounts / hour per IP.

### Password minimum length is only 8 characters
- **Files:** `src/app/api/auth/register/route.ts` (line 23), `src/app/(auth)/register/page.tsx` (line 38), `src/app/(auth)/reset-password/page.tsx` (line 47), `src/actions/profile.ts` (line 21)
- **Issue:** The minimum password length of 8 characters is enforced consistently across all four code paths (good), but 8 characters is on the low end of modern recommendations (NIST SP 800-63B recommends at least 8, but 12+ is now common practice).
- **Risk:** Weak passwords are more susceptible to offline brute-force if the hashed password database is ever leaked, even with bcrypt at 12 rounds.
- **Fix (optional):** Consider raising the minimum to 12 characters before launch. Also consider rejecting passwords that appear in common password lists.

### `AUTH_URL` fallback defaults to `http://localhost:3000` in production paths
- **Files:** `src/app/(auth)/forgot-password/page.tsx` (line 45), `src/app/(auth)/register/page.tsx` (line 52), `src/app/(auth)/verify-email/page.tsx` (line 69)
- **Issue:** All three places that construct email URLs use `process.env.AUTH_URL ?? "http://localhost:3000"`. If `AUTH_URL` is not set in the production environment, all email links will point to localhost, making verification and password reset non-functional.
- **Risk:** Not a security vulnerability, but a misconfiguration that breaks auth flows silently in production. A user clicking a reset link that goes to `localhost` gets no useful error.
- **Fix:** Validate that `AUTH_URL` is set at startup (e.g., throw at module load if `NODE_ENV === "production"` and `AUTH_URL` is absent), or use Next.js's `NEXTAUTH_URL` / `VERCEL_URL` environment variables as secondary fallbacks rather than localhost.

### `/api/auth/register` route is a duplicate of the server action in `register/page.tsx`
- **File:** `src/app/api/auth/register/route.ts`
- **Issue:** There are two separate registration implementations: a server action inside `register/page.tsx` and a standalone API route at `/api/auth/register`. The page's server action is what the register form actually uses (via Next.js Server Actions). The API route appears to be a leftover from an earlier implementation. Both apply the same logic, but they are not guaranteed to stay in sync as the codebase evolves.
- **Risk:** Future changes to validation rules (e.g., minimum password length, email normalization) may be applied to one path but not the other, creating inconsistencies.
- **Fix:** If the API route is not used by any client (verify with a codebase search for `fetch('/api/auth/register')`), delete it. If it is needed for future mobile/CLI clients, keep it and add the same `EMAIL_VERIFICATION_ENABLED` branching logic that the server action has.

---

## ✅ Passed Checks

- **Password hashing:** bcrypt with 12 rounds is used consistently in all four locations where passwords are hashed (`register/route.ts`, `register/page.tsx`, `reset-password/page.tsx`, `actions/profile.ts`). 12 rounds is acceptable.
- **Single hashing library:** Only `bcryptjs` is used — no mixing of `bcrypt`, `bcryptjs`, and `argon2`.
- **No plaintext password storage or logging:** Passwords are never stored raw; no `console.log` calls touch credential values.
- **Token randomness:** Both `createVerificationToken` and `createPasswordResetToken` use `crypto.randomBytes(32)` — cryptographically secure, 256 bits of entropy.
- **Token expiry enforced:** Expiry is checked on both the render path (before showing the form) and the submit path (inside the server action), for both email verification and password reset tokens.
- **Tokens are single-use:** Both verification and password reset tokens are deleted from the database after successful use.
- **Old tokens invalidated on re-request:** `deleteMany` is called for the same identifier before creating a new token in both `createVerificationToken` and `createPasswordResetToken` — no token accumulation.
- **No user enumeration on forgot-password:** The forgot-password flow always redirects to `?sent=1` regardless of whether the email exists.
- **Session-based authorization in server actions:** `changePassword` and `deleteAccount` both call `auth()` and use `session.user.id` — no raw userId accepted from client input.
- **Current password verified before change:** `changePassword` fetches the stored hash and calls `bcrypt.compare` before accepting the new password.
- **Account deletion uses session ID:** `deleteAccount` deletes by `session.user.id`, not a client-supplied ID.
- **Cascade deletes configured:** The Prisma schema uses `onDelete: Cascade` on all user-owned entities — account deletion removes all associated data.
- **Profile page: double auth guard:** Both `ProfileLayout` and `ProfilePage` independently call `auth()` and redirect unauthenticated users to `/sign-in`.
- **Redirects use relative paths:** All post-auth redirects use relative paths (e.g., `/dashboard`, `/sign-in`), not open URLs — no open redirect vectors.
- **Error messages are generic on sign-in:** `CredentialsSignin` is mapped to "Invalid email or password." — no distinction between wrong email and wrong password.
- **Email verification toggle is safe by default:** `EMAIL_VERIFICATION_ENABLED` defaults to `true` when the env var is absent, so production is always verified unless explicitly opted out.

---

## Summary

| Severity      | Count |
|---------------|-------|
| Critical      | 1     |
| Warning       | 5     |
| Informational | 4     |
| Passed checks | 14    |