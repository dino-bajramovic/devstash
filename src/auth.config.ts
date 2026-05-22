import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

export default {
  providers: [GitHub],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isPro = (user as { isPro?: boolean }).isPro ?? false;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as { isPro?: boolean }).isPro = token.isPro as boolean;
      return session;
    },
  },
} satisfies NextAuthConfig;
