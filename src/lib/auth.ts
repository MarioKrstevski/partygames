import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "./db";
import * as schema from "./schema";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,
  },
  plugins: [username(), nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;

/** Session for the current request (server components / actions). */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Current user or null. */
export const getUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});

/** Admin access is granted by email — see ADMIN_EMAIL in .env. */
export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email === process.env.ADMIN_EMAIL;
}
