import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = { success: true } | { success: false; retryAfterSeconds: number };

interface Limiters {
  login: Ratelimit;
  register: Ratelimit;
  forgotPassword: Ratelimit;
  resetPassword: Ratelimit;
  resendVerification: Ratelimit;
}

let _limiters: Limiters | null | undefined;

function getLimiters(): Limiters | null {
  if (_limiters !== undefined) return _limiters;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return (_limiters = null);
  }
  const redis = Redis.fromEnv();
  return (_limiters = {
    login: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "rl:login" }),
    register: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:register" }),
    forgotPassword: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:forgot" }),
    resetPassword: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "rl:reset" }),
    resendVerification: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "15 m"), prefix: "rl:resend" }),
  });
}

async function check(limiter: Ratelimit | undefined, key: string): Promise<RateLimitResult> {
  if (!limiter) return { success: true };
  try {
    const { success, reset } = await limiter.limit(key);
    if (success) return { success: true };
    return { success: false, retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
  } catch {
    return { success: true };
  }
}

export function getIPFromHeaders(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function rateLimitLogin(ip: string, email: string): Promise<RateLimitResult> {
  return check(getLimiters()?.login, `${ip}:${email.toLowerCase()}`);
}

export async function rateLimitRegister(ip: string): Promise<RateLimitResult> {
  return check(getLimiters()?.register, ip);
}

export async function rateLimitForgotPassword(ip: string): Promise<RateLimitResult> {
  return check(getLimiters()?.forgotPassword, ip);
}

export async function rateLimitResetPassword(ip: string): Promise<RateLimitResult> {
  return check(getLimiters()?.resetPassword, ip);
}

export async function rateLimitResendVerification(ip: string, email: string): Promise<RateLimitResult> {
  return check(getLimiters()?.resendVerification, `${ip}:${email.toLowerCase()}`);
}
