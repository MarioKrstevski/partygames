// src/auth.ts
import { Lucia, User, Session, TimeSpan } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prismadb from "@/lib/db";
import { cache } from "react";
import { cookies } from "next/headers";

const adapter = new PrismaAdapter(prismadb.session, prismadb.user);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(3, "d"),
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    name: "auth-cookie",
    expires: true,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      id: attributes.id,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      role: attributes.role,
      //   hashedPassword: attributes.hashedPassword,
    };
  },
});
export async function getUser() {
  const { user } = await validateRequest();
  // here instead of returning the result, we can go with prisma and get the User object with all the fields on it
  // because up to here we only kinda have access to the id, name etc, but not all the
  // related fields and stuff so if we need that we do that
  if (!user) {
    return null;
  }
  const loggedInUser = await prismadb.user.findUnique({
    where: {
      id: user.id,
    },
  });
  return loggedInUser;
}
export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId =
      cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return { user: null, session: null };
    }
    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        // refreshing the session cookie
        const sessionCookie = lucia.createSessionCookie(
          result.session.id
        );
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
        cookies().set("auth-cookie-exists", result.user.id, {
          ...sessionCookie.attributes,
          httpOnly: false,
        });
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
        cookies().set("auth-cookie-exists", "", {
          ...sessionCookie.attributes,
          httpOnly: false,
        });
      }
    } catch {}
    // here instead of returning the result, we can go with prisma and get the User object with all the fields on it
    // because up to here we only kinda have access to the id, name etc, but not all the
    // related fields and stuff so if we need that we do that
    return result;
  }
);
// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
interface DatabaseUserAttributes {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  hashedPassword: string;
  role: string;
}
